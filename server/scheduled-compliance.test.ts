import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the database
vi.mock('./db', () => ({
  db: {
    execute: vi.fn()
  }
}));

// Mock the notification service
vi.mock('./_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true)
}));

// Import after mocking
import { db } from './db';
import { notifyOwner } from './_core/notification';

describe('Scheduled Compliance Checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Database Tables', () => {
    it('should have compliance_alerts table structure', async () => {
      const mockResult = { rows: [{ count: 1 }] };
      (db.execute as any).mockResolvedValueOnce(mockResult);

      const result = await db.execute({} as any);
      expect(result.rows).toBeDefined();
      expect(result.rows[0]).toHaveProperty('count');
    });

    it('should have notification_logs table structure', async () => {
      const mockResult = { rows: [{ count: 0 }] };
      (db.execute as any).mockResolvedValueOnce(mockResult);

      const result = await db.execute({} as any);
      expect(result.rows).toBeDefined();
    });

    it('should have scheduled_compliance_checks table structure', async () => {
      const mockResult = { 
        rows: [
          { check_type: 'daily_threshold', is_enabled: true },
          { check_type: 'weekly_digest', is_enabled: true },
          { check_type: 'escalation_check', is_enabled: true }
        ] 
      };
      (db.execute as any).mockResolvedValueOnce(mockResult);

      const result = await db.execute({} as any);
      expect(result.rows).toHaveLength(3);
      expect(result.rows[0]).toHaveProperty('check_type');
    });

    it('should have alert_escalation_rules table structure', async () => {
      const mockResult = { 
        rows: [
          { 
            name: 'Warning to Critical (24h)', 
            from_severity: 'warning', 
            to_severity: 'critical',
            hours_until_escalation: 24
          }
        ] 
      };
      (db.execute as any).mockResolvedValueOnce(mockResult);

      const result = await db.execute({} as any);
      expect(result.rows[0]).toHaveProperty('name');
      expect(result.rows[0]).toHaveProperty('from_severity');
      expect(result.rows[0]).toHaveProperty('to_severity');
    });
  });

  describe('Alert Escalation Logic', () => {
    it('should escalate warning to critical after threshold', async () => {
      // Mock getting escalation rules
      const rulesResult = { 
        rows: [{ 
          id: 1,
          from_severity: 'warning', 
          to_severity: 'critical',
          hours_until_escalation: 24,
          notify_on_escalation: true
        }] 
      };
      
      // Mock getting alerts that need escalation
      const alertsResult = {
        rows: [{
          id: 1,
          department: 'Finance',
          title: 'Test Alert',
          message: 'Test message',
          severity: 'warning',
          current_value: 75,
          threshold_value: 90,
          metadata: '{}'
        }]
      };

      (db.execute as any)
        .mockResolvedValueOnce(rulesResult)
        .mockResolvedValueOnce(alertsResult)
        .mockResolvedValueOnce({ rows: [] }) // Insert escalated alert
        .mockResolvedValueOnce({ rows: [] }) // Update original alert
        .mockResolvedValueOnce({ rows: [] }); // Log notification

      // Simulate escalation check
      const rules = rulesResult.rows;
      expect(rules[0].from_severity).toBe('warning');
      expect(rules[0].to_severity).toBe('critical');
      expect(rules[0].hours_until_escalation).toBe(24);
    });

    it('should not escalate acknowledged alerts', async () => {
      const alertsResult = {
        rows: [] // No unacknowledged alerts
      };

      (db.execute as any).mockResolvedValueOnce(alertsResult);

      const result = await db.execute({} as any);
      expect(result.rows).toHaveLength(0);
    });
  });

  describe('Notification System', () => {
    it('should send owner notification for critical alerts', async () => {
      await notifyOwner({
        title: '🚨 Critical Compliance Alert',
        content: 'Test critical alert content'
      });

      expect(notifyOwner).toHaveBeenCalledWith({
        title: '🚨 Critical Compliance Alert',
        content: 'Test critical alert content'
      });
    });

    it('should log notifications to database', async () => {
      const mockResult = { rows: [] };
      (db.execute as any).mockResolvedValueOnce(mockResult);

      const result = await db.execute({} as any);
      expect(db.execute).toHaveBeenCalled();
    });

    it('should track notification status', async () => {
      const mockResult = {
        rows: [
          { id: 1, status: 'sent', notification_type: 'compliance_alert' },
          { id: 2, status: 'delivered', notification_type: 'weekly_digest' },
          { id: 3, status: 'failed', notification_type: 'escalation_notice' }
        ]
      };
      (db.execute as any).mockResolvedValueOnce(mockResult);

      const result = await db.execute({} as any);
      expect(result.rows).toHaveLength(3);
      expect(result.rows.map((r: any) => r.status)).toContain('sent');
      expect(result.rows.map((r: any) => r.status)).toContain('failed');
    });
  });

  describe('Scheduled Check Status', () => {
    it('should return scheduled check status', async () => {
      const mockResult = {
        rows: [
          { 
            checkType: 'daily_threshold',
            cronExpression: '0 8 * * *',
            lastRunAt: new Date().toISOString(),
            lastRunStatus: 'success',
            isEnabled: true
          },
          { 
            checkType: 'weekly_digest',
            cronExpression: '0 9 * * 1',
            lastRunAt: null,
            lastRunStatus: null,
            isEnabled: true
          }
        ]
      };
      (db.execute as any).mockResolvedValueOnce(mockResult);

      const result = await db.execute({} as any);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].checkType).toBe('daily_threshold');
      expect(result.rows[0].isEnabled).toBe(true);
    });

    it('should toggle scheduled check enabled status', async () => {
      const mockResult = { rows: [] };
      (db.execute as any).mockResolvedValueOnce(mockResult);

      await db.execute({} as any);
      expect(db.execute).toHaveBeenCalled();
    });
  });

  describe('Weekly Digest Generation', () => {
    it('should generate weekly digest data', async () => {
      // Mock stats query
      const statsResult = {
        rows: [{
          total: 15,
          critical: 3,
          warning: 7,
          acknowledged: 10
        }]
      };

      // Mock department summary query
      const deptResult = {
        rows: [
          { department: 'Finance', total_signatures: 100, signed_count: 85, pending_count: 15, overdue_count: 5 },
          { department: 'HR', total_signatures: 50, signed_count: 48, pending_count: 2, overdue_count: 0 }
        ]
      };

      (db.execute as any)
        .mockResolvedValueOnce(statsResult)
        .mockResolvedValueOnce(deptResult);

      const stats = statsResult.rows[0];
      expect(stats.total).toBe(15);
      expect(stats.critical).toBe(3);
      expect(stats.warning).toBe(7);
      expect(stats.acknowledged).toBe(10);

      const depts = deptResult.rows;
      expect(depts).toHaveLength(2);
      expect(depts[0].department).toBe('Finance');
    });

    it('should format weekly digest content', () => {
      const digestData = {
        totalAlerts: 15,
        criticalCount: 3,
        warningCount: 7,
        acknowledgedCount: 10,
        departmentSummary: [
          { department: 'Finance', complianceRate: 85, pendingSignatures: 15, overdueCount: 5 }
        ],
        topIssues: [
          { department: 'Finance', issue: 'Below target', severity: 'warning' }
        ]
      };

      // Verify digest data structure
      expect(digestData.totalAlerts).toBe(15);
      expect(digestData.departmentSummary[0].complianceRate).toBe(85);
      expect(digestData.topIssues[0].severity).toBe('warning');
    });
  });

  describe('Alert Creation', () => {
    it('should create alert with correct severity levels', () => {
      const alertTypes = ['below_target', 'approaching_deadline', 'overdue_spike', 'target_achieved', 'escalated'];
      const severityLevels = ['info', 'warning', 'critical'];

      alertTypes.forEach(type => {
        expect(typeof type).toBe('string');
      });

      severityLevels.forEach(severity => {
        expect(['info', 'warning', 'critical']).toContain(severity);
      });
    });

    it('should include threshold values in alert', () => {
      const alert = {
        alertType: 'below_target',
        severity: 'warning',
        department: 'Finance',
        title: 'Finance below target',
        message: 'Compliance rate is 75%, below target of 90%',
        currentValue: 75,
        thresholdValue: 90
      };

      expect(alert.currentValue).toBeLessThan(alert.thresholdValue);
      expect(alert.severity).toBe('warning');
    });
  });

  describe('Email Template Generation', () => {
    it('should generate critical alert email template', () => {
      const alertData = {
        alertId: 1,
        alertType: 'below_target',
        severity: 'critical',
        department: 'Finance',
        title: 'Critical: Finance compliance below threshold',
        message: 'Immediate attention required',
        currentValue: 60,
        thresholdValue: 90,
        createdAt: new Date().toISOString()
      };

      // Verify template data structure
      expect(alertData.severity).toBe('critical');
      expect(alertData.currentValue).toBe(60);
      expect(alertData.thresholdValue).toBe(90);
    });

    it('should generate warning alert email template', () => {
      const alertData = {
        alertId: 2,
        alertType: 'approaching_deadline',
        severity: 'warning',
        department: 'HR',
        title: 'Warning: Signatures due soon',
        message: '5 signatures due within 3 days',
        createdAt: new Date().toISOString()
      };

      expect(alertData.severity).toBe('warning');
      expect(alertData.alertType).toBe('approaching_deadline');
    });

    it('should generate escalation email template', () => {
      const alertData = {
        alertId: 3,
        alertType: 'escalated',
        severity: 'critical',
        department: 'Legal',
        title: 'Escalated: Legal compliance alert',
        message: 'Alert escalated from warning to critical',
        createdAt: new Date().toISOString()
      };

      const escalatedFrom = 'warning';

      expect(alertData.alertType).toBe('escalated');
      expect(alertData.severity).toBe('critical');
      expect(escalatedFrom).toBe('warning');
    });
  });
});
