// Compliance Monitoring Service
// Automated checks for entity registrations, tax filings, grant reporting, and deadlines

export interface ComplianceItem {
  id: string;
  type: 'registration' | 'tax_filing' | 'grant_report' | 'annual_report' | 'license' | 'insurance';
  title: string;
  description: string;
  entity: string;
  jurisdiction?: string;
  dueDate: Date;
  status: 'compliant' | 'upcoming' | 'overdue' | 'at_risk';
  priority: 'critical' | 'high' | 'medium' | 'low';
  lastChecked: Date;
  assignedTo?: string;
  notes?: string;
  remindersSent: number;
  autoRenew: boolean;
}

export interface ComplianceAlert {
  id: string;
  itemId: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface ComplianceSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  lastRun: Date;
  nextRun: Date;
  enabled: boolean;
  itemTypes: string[];
  notifyOnIssues: boolean;
  recipients: string[];
}

export interface ComplianceReport {
  generatedAt: Date;
  totalItems: number;
  compliant: number;
  upcoming: number;
  overdue: number;
  atRisk: number;
  byType: Record<string, { total: number; compliant: number; issues: number }>;
  byEntity: Record<string, { total: number; compliant: number; issues: number }>;
  upcomingDeadlines: ComplianceItem[];
  overdueItems: ComplianceItem[];
}

class ComplianceMonitoringService {
  private readonly ITEMS_KEY = 'compliance_items';
  private readonly ALERTS_KEY = 'compliance_alerts';
  private readonly SCHEDULES_KEY = 'compliance_schedules';

  // Get all compliance items
  getItems(): ComplianceItem[] {
    const stored = localStorage.getItem(this.ITEMS_KEY);
    if (!stored) {
      // Return default items
      return this.getDefaultItems();
    }
    return JSON.parse(stored).map((item: any) => ({
      ...item,
      dueDate: new Date(item.dueDate),
      lastChecked: new Date(item.lastChecked),
    }));
  }

  // Save items
  saveItems(items: ComplianceItem[]): void {
    localStorage.setItem(this.ITEMS_KEY, JSON.stringify(items));
  }

  // Get default compliance items
  private getDefaultItems(): ComplianceItem[] {
    const now = new Date();
    return [
      {
        id: 'comp-001',
        type: 'registration',
        title: 'Georgia Annual Registration',
        description: 'Annual business registration renewal with Georgia Secretary of State',
        entity: 'L.A.W.S. Collective LLC',
        jurisdiction: 'Georgia',
        dueDate: new Date(now.getFullYear(), 3, 1), // April 1
        status: 'upcoming',
        priority: 'high',
        lastChecked: now,
        remindersSent: 0,
        autoRenew: false,
      },
      {
        id: 'comp-002',
        type: 'tax_filing',
        title: 'Q1 Estimated Tax Payment',
        description: 'Federal estimated tax payment for Q1',
        entity: 'L.A.W.S. Collective LLC',
        dueDate: new Date(now.getFullYear(), 3, 15), // April 15
        status: 'upcoming',
        priority: 'critical',
        lastChecked: now,
        remindersSent: 0,
        autoRenew: false,
      },
      {
        id: 'comp-003',
        type: 'grant_report',
        title: 'Community Development Grant - Quarterly Report',
        description: 'Q1 progress report for HUD Community Development Block Grant',
        entity: 'L.A.W.S. Collective',
        dueDate: new Date(now.getFullYear(), 3, 30), // April 30
        status: 'upcoming',
        priority: 'high',
        lastChecked: now,
        remindersSent: 0,
        autoRenew: false,
      },
      {
        id: 'comp-004',
        type: 'annual_report',
        title: '501(c)(3) Annual Report',
        description: 'IRS Form 990 annual filing',
        entity: 'L.A.W.S. Foundation',
        dueDate: new Date(now.getFullYear(), 4, 15), // May 15
        status: 'upcoming',
        priority: 'critical',
        lastChecked: now,
        remindersSent: 0,
        autoRenew: false,
      },
      {
        id: 'comp-005',
        type: 'license',
        title: 'Business License Renewal',
        description: 'City of Atlanta business license renewal',
        entity: 'L.A.W.S. Collective LLC',
        jurisdiction: 'Atlanta, GA',
        dueDate: new Date(now.getFullYear(), 11, 31), // December 31
        status: 'compliant',
        priority: 'medium',
        lastChecked: now,
        remindersSent: 0,
        autoRenew: true,
      },
      {
        id: 'comp-006',
        type: 'insurance',
        title: 'General Liability Insurance',
        description: 'Annual general liability insurance policy renewal',
        entity: 'L.A.W.S. Collective LLC',
        dueDate: new Date(now.getFullYear(), 5, 1), // June 1
        status: 'upcoming',
        priority: 'high',
        lastChecked: now,
        remindersSent: 0,
        autoRenew: true,
      },
    ];
  }

  // Get alerts
  getAlerts(): ComplianceAlert[] {
    const stored = localStorage.getItem(this.ALERTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((alert: any) => ({
      ...alert,
      createdAt: new Date(alert.createdAt),
      acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined,
    }));
  }

  // Save alert
  saveAlert(alert: ComplianceAlert): void {
    const alerts = this.getAlerts();
    alerts.unshift(alert);
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts.slice(0, 100)));
  }

  // Run compliance check
  async runComplianceCheck(): Promise<{
    itemsChecked: number;
    issuesFound: number;
    alertsGenerated: number;
  }> {
    const items = this.getItems();
    const now = new Date();
    let issuesFound = 0;
    let alertsGenerated = 0;

    for (const item of items) {
      const daysUntilDue = Math.ceil((item.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Update status based on due date
      if (daysUntilDue < 0) {
        item.status = 'overdue';
        issuesFound++;
        
        // Generate alert if not already sent
        if (item.remindersSent < 3) {
          this.saveAlert({
            id: `alert-${Date.now()}-${item.id}`,
            itemId: item.id,
            type: 'error',
            message: `OVERDUE: ${item.title} was due ${Math.abs(daysUntilDue)} days ago`,
            createdAt: now,
            acknowledged: false,
          });
          item.remindersSent++;
          alertsGenerated++;
        }
      } else if (daysUntilDue <= 7) {
        item.status = 'at_risk';
        issuesFound++;
        
        if (item.remindersSent < 2) {
          this.saveAlert({
            id: `alert-${Date.now()}-${item.id}`,
            itemId: item.id,
            type: 'warning',
            message: `URGENT: ${item.title} is due in ${daysUntilDue} days`,
            createdAt: now,
            acknowledged: false,
          });
          item.remindersSent++;
          alertsGenerated++;
        }
      } else if (daysUntilDue <= 30) {
        item.status = 'upcoming';
        
        if (item.remindersSent < 1) {
          this.saveAlert({
            id: `alert-${Date.now()}-${item.id}`,
            itemId: item.id,
            type: 'info',
            message: `REMINDER: ${item.title} is due in ${daysUntilDue} days`,
            createdAt: now,
            acknowledged: false,
          });
          item.remindersSent++;
          alertsGenerated++;
        }
      } else {
        item.status = 'compliant';
      }

      item.lastChecked = now;
    }

    this.saveItems(items);

    return {
      itemsChecked: items.length,
      issuesFound,
      alertsGenerated,
    };
  }

  // Generate compliance report
  generateReport(): ComplianceReport {
    const items = this.getItems();
    const now = new Date();

    const report: ComplianceReport = {
      generatedAt: now,
      totalItems: items.length,
      compliant: items.filter(i => i.status === 'compliant').length,
      upcoming: items.filter(i => i.status === 'upcoming').length,
      overdue: items.filter(i => i.status === 'overdue').length,
      atRisk: items.filter(i => i.status === 'at_risk').length,
      byType: {},
      byEntity: {},
      upcomingDeadlines: items
        .filter(i => i.status === 'upcoming' || i.status === 'at_risk')
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 10),
      overdueItems: items.filter(i => i.status === 'overdue'),
    };

    // Group by type
    for (const item of items) {
      if (!report.byType[item.type]) {
        report.byType[item.type] = { total: 0, compliant: 0, issues: 0 };
      }
      report.byType[item.type].total++;
      if (item.status === 'compliant') {
        report.byType[item.type].compliant++;
      } else if (item.status === 'overdue' || item.status === 'at_risk') {
        report.byType[item.type].issues++;
      }
    }

    // Group by entity
    for (const item of items) {
      if (!report.byEntity[item.entity]) {
        report.byEntity[item.entity] = { total: 0, compliant: 0, issues: 0 };
      }
      report.byEntity[item.entity].total++;
      if (item.status === 'compliant') {
        report.byEntity[item.entity].compliant++;
      } else if (item.status === 'overdue' || item.status === 'at_risk') {
        report.byEntity[item.entity].issues++;
      }
    }

    return report;
  }

  // Acknowledge alert
  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alerts = this.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
      localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
    }
  }

  // Add compliance item
  addItem(item: Omit<ComplianceItem, 'id' | 'lastChecked' | 'remindersSent'>): ComplianceItem {
    const newItem: ComplianceItem = {
      ...item,
      id: `comp-${Date.now()}`,
      lastChecked: new Date(),
      remindersSent: 0,
    };
    const items = this.getItems();
    items.push(newItem);
    this.saveItems(items);
    return newItem;
  }

  // Update compliance item
  updateItem(id: string, updates: Partial<ComplianceItem>): void {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === id);
    if (index >= 0) {
      items[index] = { ...items[index], ...updates };
      this.saveItems(items);
    }
  }

  // Delete compliance item
  deleteItem(id: string): void {
    const items = this.getItems().filter(i => i.id !== id);
    this.saveItems(items);
  }
}

export const complianceMonitoringService = new ComplianceMonitoringService();
export default complianceMonitoringService;
