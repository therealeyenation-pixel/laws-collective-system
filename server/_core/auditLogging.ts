/**
 * Audit Logging & Compliance Tracking
 * Comprehensive audit trail for compliance and security
 */

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  status: "success" | "failure";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

interface ComplianceEvent {
  id: string;
  timestamp: Date;
  type: string;
  severity: "info" | "warning" | "critical";
  description: string;
  affectedUsers?: string[];
  affectedResources?: string[];
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface AuditReport {
  startDate: Date;
  endDate: Date;
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
  topResources: Array<{ resource: string; count: number }>;
  complianceEvents: ComplianceEvent[];
}

class AuditLoggingService {
  private logs: AuditLog[] = [];
  private complianceEvents: ComplianceEvent[] = [];
  private readonly LOG_RETENTION_DAYS = 365;
  private readonly MAX_LOGS = 100000;

  /**
   * Log audit event
   */
  logEvent(event: Omit<AuditLog, "id">): AuditLog {
    const log: AuditLog = {
      ...event,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.logs.push(log);

    // Maintain size limit
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    return log;
  }

  /**
   * Log compliance event
   */
  logComplianceEvent(event: Omit<ComplianceEvent, "id">): ComplianceEvent {
    const complianceEvent: ComplianceEvent = {
      ...event,
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.complianceEvents.push(complianceEvent);

    return complianceEvent;
  }

  /**
   * Get audit logs with filters
   */
  getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    status?: "success" | "failure";
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditLog[] {
    let results = [...this.logs];

    if (filters?.userId) {
      results = results.filter((l) => l.userId === filters.userId);
    }

    if (filters?.action) {
      results = results.filter((l) => l.action === filters.action);
    }

    if (filters?.resource) {
      results = results.filter((l) => l.resource === filters.resource);
    }

    if (filters?.status) {
      results = results.filter((l) => l.status === filters.status);
    }

    if (filters?.startDate) {
      results = results.filter((l) => l.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      results = results.filter((l) => l.timestamp <= filters.endDate!);
    }

    const limit = filters?.limit || 1000;
    return results.slice(-limit);
  }

  /**
   * Get compliance events
   */
  getComplianceEvents(filters?: {
    type?: string;
    severity?: "info" | "warning" | "critical";
    resolved?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): ComplianceEvent[] {
    let results = [...this.complianceEvents];

    if (filters?.type) {
      results = results.filter((e) => e.type === filters.type);
    }

    if (filters?.severity) {
      results = results.filter((e) => e.severity === filters.severity);
    }

    if (filters?.resolved !== undefined) {
      results = results.filter((e) => e.resolved === filters.resolved);
    }

    if (filters?.startDate) {
      results = results.filter((e) => e.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      results = results.filter((e) => e.timestamp <= filters.endDate!);
    }

    return results;
  }

  /**
   * Resolve compliance event
   */
  resolveComplianceEvent(eventId: string, resolvedBy: string): ComplianceEvent | null {
    const event = this.complianceEvents.find((e) => e.id === eventId);

    if (!event) {
      return null;
    }

    event.resolved = true;
    event.resolvedAt = new Date();
    event.resolvedBy = resolvedBy;

    return event;
  }

  /**
   * Generate audit report
   */
  generateAuditReport(startDate: Date, endDate: Date): AuditReport {
    const logs = this.getAuditLogs({ startDate, endDate });
    const complianceEvents = this.getComplianceEvents({ startDate, endDate });

    const successfulEvents = logs.filter((l) => l.status === "success").length;
    const failedEvents = logs.filter((l) => l.status === "failure").length;

    const uniqueUsers = new Set(logs.map((l) => l.userId)).size;

    // Top actions
    const actionMap = new Map<string, number>();
    for (const log of logs) {
      actionMap.set(log.action, (actionMap.get(log.action) || 0) + 1);
    }

    const topActions = Array.from(actionMap.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top resources
    const resourceMap = new Map<string, number>();
    for (const log of logs) {
      resourceMap.set(log.resource, (resourceMap.get(log.resource) || 0) + 1);
    }

    const topResources = Array.from(resourceMap.entries())
      .map(([resource, count]) => ({ resource, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      startDate,
      endDate,
      totalEvents: logs.length,
      successfulEvents,
      failedEvents,
      uniqueUsers,
      topActions,
      topResources,
      complianceEvents,
    };
  }

  /**
   * Get user activity summary
   */
  getUserActivitySummary(userId: string, days: number = 30): {
    userId: string;
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    lastActivity: Date | null;
    actionBreakdown: Record<string, number>;
  } {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = this.getAuditLogs({
      userId,
      startDate,
    });

    const actionMap = new Map<string, number>();
    for (const log of logs) {
      actionMap.set(log.action, (actionMap.get(log.action) || 0) + 1);
    }

    return {
      userId,
      totalActions: logs.length,
      successfulActions: logs.filter((l) => l.status === "success").length,
      failedActions: logs.filter((l) => l.status === "failure").length,
      lastActivity: logs.length > 0 ? logs[logs.length - 1].timestamp : null,
      actionBreakdown: Object.fromEntries(actionMap),
    };
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalLogs: number;
    totalComplianceEvents: number;
    unresolvedComplianceEvents: number;
    criticalComplianceEvents: number;
    successRate: number;
  } {
    const successRate =
      this.logs.length > 0
        ? (this.logs.filter((l) => l.status === "success").length / this.logs.length) * 100
        : 0;

    const unresolvedCompliance = this.complianceEvents.filter((e) => !e.resolved).length;
    const criticalCompliance = this.complianceEvents.filter((e) => e.severity === "critical").length;

    return {
      totalLogs: this.logs.length,
      totalComplianceEvents: this.complianceEvents.length,
      unresolvedComplianceEvents: unresolvedCompliance,
      criticalComplianceEvents: criticalCompliance,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  /**
   * Cleanup old logs
   */
  cleanup(): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.LOG_RETENTION_DAYS);

    const initialLength = this.logs.length;
    this.logs = this.logs.filter((l) => l.timestamp > cutoffDate);

    return initialLength - this.logs.length;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.logs = [];
    this.complianceEvents = [];
  }
}

export const auditLoggingService = new AuditLoggingService();
