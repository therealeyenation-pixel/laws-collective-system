// API Usage Dashboard Service
// Track API usage, rate limits, and costs for external integrations

export interface ApiUsageRecord {
  id: string;
  integrationId: string;
  integrationName: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  statusCode: number;
  responseTime: number; // ms
  timestamp: Date;
  requestSize: number; // bytes
  responseSize: number; // bytes
  cost?: number;
}

export interface ApiRateLimit {
  integrationId: string;
  integrationName: string;
  limit: number;
  used: number;
  resetAt: Date;
  period: 'minute' | 'hour' | 'day' | 'month';
}

export interface ApiCostSummary {
  integrationId: string;
  integrationName: string;
  currentPeriodCost: number;
  previousPeriodCost: number;
  budget?: number;
  currency: string;
}

export interface ApiHealthStatus {
  integrationId: string;
  integrationName: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number; // percentage
  avgResponseTime: number;
  errorRate: number;
  lastChecked: Date;
}

export interface UsageAlert {
  id: string;
  type: 'rate_limit' | 'cost' | 'error_rate' | 'latency';
  severity: 'warning' | 'critical';
  integrationId: string;
  integrationName: string;
  message: string;
  threshold: number;
  currentValue: number;
  createdAt: Date;
  acknowledged: boolean;
}

const INTEGRATIONS = [
  { id: 'quickbooks', name: 'QuickBooks', costPerCall: 0.001 },
  { id: 'stripe', name: 'Stripe', costPerCall: 0 },
  { id: 'google_calendar', name: 'Google Calendar', costPerCall: 0 },
  { id: 'slack', name: 'Slack', costPerCall: 0 },
  { id: 'zapier', name: 'Zapier', costPerCall: 0.0005 },
  { id: 'openai', name: 'OpenAI', costPerCall: 0.002 },
  { id: 'twilio', name: 'Twilio', costPerCall: 0.0075 },
  { id: 'sendgrid', name: 'SendGrid', costPerCall: 0.0001 }
];

class ApiUsageDashboardService {
  private readonly USAGE_KEY = 'api_usage_records';
  private readonly ALERTS_KEY = 'api_usage_alerts';

  // Usage Tracking
  recordApiCall(record: Omit<ApiUsageRecord, 'id' | 'timestamp'>): ApiUsageRecord {
    const newRecord: ApiUsageRecord = {
      ...record,
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    const records = this.getUsageRecords();
    records.unshift(newRecord);
    
    // Keep only last 10000 records
    if (records.length > 10000) {
      records.splice(10000);
    }
    
    this.saveUsageRecords(records);
    this.checkThresholds(record.integrationId);
    
    return newRecord;
  }

  getUsageRecords(filters?: {
    integrationId?: string;
    startDate?: Date;
    endDate?: Date;
    statusCode?: number;
  }): ApiUsageRecord[] {
    const stored = localStorage.getItem(this.USAGE_KEY);
    if (!stored) return this.generateSampleData();
    
    let records: ApiUsageRecord[] = JSON.parse(stored).map((r: any) => ({
      ...r,
      timestamp: new Date(r.timestamp)
    }));

    if (filters) {
      if (filters.integrationId) {
        records = records.filter(r => r.integrationId === filters.integrationId);
      }
      if (filters.startDate) {
        records = records.filter(r => r.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        records = records.filter(r => r.timestamp <= filters.endDate!);
      }
      if (filters.statusCode) {
        records = records.filter(r => r.statusCode === filters.statusCode);
      }
    }

    return records;
  }

  // Rate Limits
  getRateLimits(): ApiRateLimit[] {
    return INTEGRATIONS.map(integration => {
      const records = this.getUsageRecords({ integrationId: integration.id });
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentCalls = records.filter(r => r.timestamp > hourAgo).length;
      
      return {
        integrationId: integration.id,
        integrationName: integration.name,
        limit: 1000,
        used: recentCalls,
        resetAt: new Date(Date.now() + 60 * 60 * 1000),
        period: 'hour' as const
      };
    });
  }

  // Cost Summary
  getCostSummary(): ApiCostSummary[] {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return INTEGRATIONS.map(integration => {
      const allRecords = this.getUsageRecords({ integrationId: integration.id });
      const currentMonthRecords = allRecords.filter(r => r.timestamp >= startOfMonth);
      const lastMonthRecords = allRecords.filter(r => 
        r.timestamp >= startOfLastMonth && r.timestamp < startOfMonth
      );

      return {
        integrationId: integration.id,
        integrationName: integration.name,
        currentPeriodCost: currentMonthRecords.length * integration.costPerCall,
        previousPeriodCost: lastMonthRecords.length * integration.costPerCall,
        budget: integration.costPerCall > 0 ? 50 : undefined,
        currency: 'USD'
      };
    });
  }

  // Health Status
  getHealthStatus(): ApiHealthStatus[] {
    return INTEGRATIONS.map(integration => {
      const records = this.getUsageRecords({ integrationId: integration.id });
      const last24h = records.filter(r => 
        r.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      const successCalls = last24h.filter(r => r.statusCode >= 200 && r.statusCode < 300);
      const errorRate = last24h.length > 0 
        ? ((last24h.length - successCalls.length) / last24h.length) * 100 
        : 0;
      const avgResponseTime = last24h.length > 0
        ? last24h.reduce((sum, r) => sum + r.responseTime, 0) / last24h.length
        : 0;

      let status: ApiHealthStatus['status'] = 'healthy';
      if (errorRate > 10) status = 'degraded';
      if (errorRate > 50) status = 'down';

      return {
        integrationId: integration.id,
        integrationName: integration.name,
        status,
        uptime: 100 - errorRate,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        lastChecked: new Date()
      };
    });
  }

  // Alerts
  getAlerts(): UsageAlert[] {
    const stored = localStorage.getItem(this.ALERTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((a: any) => ({
      ...a,
      createdAt: new Date(a.createdAt)
    }));
  }

  acknowledgeAlert(alertId: string): boolean {
    const alerts = this.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return false;
    alert.acknowledged = true;
    this.saveAlerts(alerts);
    return true;
  }

  private checkThresholds(integrationId: string): void {
    const rateLimits = this.getRateLimits();
    const limit = rateLimits.find(r => r.integrationId === integrationId);
    
    if (limit && limit.used / limit.limit > 0.8) {
      this.createAlert({
        type: 'rate_limit',
        severity: limit.used / limit.limit > 0.95 ? 'critical' : 'warning',
        integrationId,
        integrationName: limit.integrationName,
        message: `Rate limit usage at ${Math.round(limit.used / limit.limit * 100)}%`,
        threshold: limit.limit,
        currentValue: limit.used
      });
    }
  }

  private createAlert(alert: Omit<UsageAlert, 'id' | 'createdAt' | 'acknowledged'>): void {
    const alerts = this.getAlerts();
    
    // Check if similar alert exists in last hour
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const exists = alerts.some(a => 
      a.integrationId === alert.integrationId && 
      a.type === alert.type && 
      a.createdAt > hourAgo
    );
    
    if (!exists) {
      alerts.unshift({
        ...alert,
        id: `alert_${Date.now()}`,
        createdAt: new Date(),
        acknowledged: false
      });
      this.saveAlerts(alerts.slice(0, 100));
    }
  }

  // Statistics
  getStats(): {
    totalCalls: number;
    successRate: number;
    avgResponseTime: number;
    totalCost: number;
    activeAlerts: number;
  } {
    const records = this.getUsageRecords();
    const last24h = records.filter(r => 
      r.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    const successCalls = last24h.filter(r => r.statusCode >= 200 && r.statusCode < 300);
    const costs = this.getCostSummary();
    const alerts = this.getAlerts();

    return {
      totalCalls: last24h.length,
      successRate: last24h.length > 0 
        ? Math.round((successCalls.length / last24h.length) * 100) 
        : 100,
      avgResponseTime: last24h.length > 0
        ? Math.round(last24h.reduce((sum, r) => sum + r.responseTime, 0) / last24h.length)
        : 0,
      totalCost: costs.reduce((sum, c) => sum + c.currentPeriodCost, 0),
      activeAlerts: alerts.filter(a => !a.acknowledged).length
    };
  }

  getUsageByHour(integrationId?: string): { hour: string; calls: number }[] {
    const records = this.getUsageRecords(integrationId ? { integrationId } : undefined);
    const last24h = records.filter(r => 
      r.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const hourly: Record<string, number> = {};
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(Date.now() - i * 60 * 60 * 1000);
      const key = hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false });
      hourly[key] = 0;
    }

    last24h.forEach(r => {
      const key = r.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false });
      if (hourly[key] !== undefined) hourly[key]++;
    });

    return Object.entries(hourly).map(([hour, calls]) => ({ hour, calls }));
  }

  // Private helpers
  private saveUsageRecords(records: ApiUsageRecord[]): void {
    localStorage.setItem(this.USAGE_KEY, JSON.stringify(records));
  }

  private saveAlerts(alerts: UsageAlert[]): void {
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
  }

  private generateSampleData(): ApiUsageRecord[] {
    const records: ApiUsageRecord[] = [];
    const now = Date.now();

    INTEGRATIONS.forEach(integration => {
      for (let i = 0; i < 50; i++) {
        records.push({
          id: `usage_sample_${integration.id}_${i}`,
          integrationId: integration.id,
          integrationName: integration.name,
          endpoint: `/api/${integration.id}/data`,
          method: ['GET', 'POST', 'GET', 'GET', 'PUT'][i % 5] as any,
          statusCode: [200, 200, 200, 200, 201, 400, 500][i % 7],
          responseTime: 50 + Math.random() * 200,
          timestamp: new Date(now - Math.random() * 24 * 60 * 60 * 1000),
          requestSize: Math.floor(Math.random() * 1000),
          responseSize: Math.floor(Math.random() * 5000),
          cost: integration.costPerCall
        });
      }
    });

    this.saveUsageRecords(records);
    return records;
  }
}

export const apiUsageDashboardService = new ApiUsageDashboardService();
