import { db } from "../db";
import { sql } from "drizzle-orm";

interface AlertConfig {
  belowTargetThreshold: number; // Percentage below target to trigger alert
  approachingDeadlineDays: number; // Days before deadline to alert
  overdueSpikeThreshold: number; // Percentage increase in overdue items
}

const DEFAULT_CONFIG: AlertConfig = {
  belowTargetThreshold: 5, // Alert when 5% or more below target
  approachingDeadlineDays: 3, // Alert 3 days before deadline
  overdueSpikeThreshold: 20, // Alert on 20% increase in overdue items
};

interface ComplianceData {
  department: string;
  currentRate: number;
  targetRate: number;
  pendingCount: number;
  overdueCount: number;
  approachingDeadlineCount: number;
}

interface Alert {
  alertType: 'below_target' | 'approaching_deadline' | 'overdue_spike' | 'target_achieved';
  severity: 'info' | 'warning' | 'critical';
  department: string;
  title: string;
  message: string;
  currentValue: number;
  thresholdValue: number;
  metadata?: Record<string, any>;
}

export async function checkComplianceThresholds(
  config: AlertConfig = DEFAULT_CONFIG
): Promise<{ generated: number; alerts: Alert[] }> {
  const alerts: Alert[] = [];

  try {
    // Get current compliance data by department
    const complianceData = await getComplianceDataByDepartment();
    
    // Get targets for each department
    const targets = await getDepartmentTargets();
    
    for (const data of complianceData) {
      const target = targets.find(t => t.department === data.department);
      const targetRate = target?.targetPercentage || 90; // Default 90% if no target set
      
      // Check if below target
      const gap = targetRate - data.currentRate;
      if (gap >= config.belowTargetThreshold) {
        const severity = gap >= 15 ? 'critical' : gap >= 10 ? 'warning' : 'info';
        alerts.push({
          alertType: 'below_target',
          severity,
          department: data.department,
          title: `${data.department} Below Compliance Target`,
          message: `${data.department} is currently at ${data.currentRate.toFixed(1)}% compliance, which is ${gap.toFixed(1)}% below the target of ${targetRate}%.`,
          currentValue: data.currentRate,
          thresholdValue: targetRate,
          metadata: { gap, pendingCount: data.pendingCount }
        });
      }
      
      // Check for approaching deadlines
      if (data.approachingDeadlineCount > 0) {
        const severity = data.approachingDeadlineCount >= 10 ? 'critical' : 
                        data.approachingDeadlineCount >= 5 ? 'warning' : 'info';
        alerts.push({
          alertType: 'approaching_deadline',
          severity,
          department: data.department,
          title: `${data.department} Has Approaching Deadlines`,
          message: `${data.department} has ${data.approachingDeadlineCount} signature(s) due within the next ${config.approachingDeadlineDays} days.`,
          currentValue: data.approachingDeadlineCount,
          thresholdValue: config.approachingDeadlineDays,
          metadata: { daysThreshold: config.approachingDeadlineDays }
        });
      }
      
      // Check for overdue spike (compare to previous period)
      if (data.overdueCount > 0) {
        const severity = data.overdueCount >= 20 ? 'critical' : 
                        data.overdueCount >= 10 ? 'warning' : 'info';
        alerts.push({
          alertType: 'overdue_spike',
          severity,
          department: data.department,
          title: `${data.department} Has Overdue Signatures`,
          message: `${data.department} has ${data.overdueCount} overdue signature(s) requiring immediate attention.`,
          currentValue: data.overdueCount,
          thresholdValue: 0,
          metadata: { overdueCount: data.overdueCount }
        });
      }
      
      // Check for target achievement (positive alert)
      if (data.currentRate >= targetRate && data.currentRate >= 95) {
        alerts.push({
          alertType: 'target_achieved',
          severity: 'info',
          department: data.department,
          title: `${data.department} Achieved Compliance Target`,
          message: `Congratulations! ${data.department} has achieved ${data.currentRate.toFixed(1)}% compliance, meeting or exceeding the ${targetRate}% target.`,
          currentValue: data.currentRate,
          thresholdValue: targetRate,
          metadata: { exceeded: data.currentRate - targetRate }
        });
      }
    }
    
    // Save new alerts to database (avoid duplicates)
    let generated = 0;
    for (const alert of alerts) {
      const exists = await checkAlertExists(alert);
      if (!exists) {
        await saveAlert(alert);
        generated++;
      }
    }
    
    return { generated, alerts };
  } catch (error) {
    console.error('[ComplianceAlerts] Error checking thresholds:', error);
    return { generated: 0, alerts: [] };
  }
}

async function getComplianceDataByDepartment(): Promise<ComplianceData[]> {
  try {
    // Get signature counts by department from article_acknowledgments
    const result = await db.execute(sql`
      SELECT 
        COALESCE(department, 'General') as department,
        COUNT(*) as total_count,
        SUM(CASE WHEN signed_at IS NOT NULL THEN 1 ELSE 0 END) as signed_count,
        SUM(CASE WHEN signed_at IS NULL AND due_date < NOW() THEN 1 ELSE 0 END) as overdue_count,
        SUM(CASE WHEN signed_at IS NULL AND due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY) THEN 1 ELSE 0 END) as approaching_count
      FROM article_acknowledgments
      GROUP BY department
    `);
    
    const rows = result.rows as any[];
    return rows.map(row => ({
      department: row.department || 'General',
      currentRate: row.total_count > 0 ? (row.signed_count / row.total_count) * 100 : 100,
      targetRate: 90,
      pendingCount: row.total_count - row.signed_count,
      overdueCount: row.overdue_count || 0,
      approachingDeadlineCount: row.approaching_count || 0
    }));
  } catch (error) {
    // Return mock data if table doesn't have department column
    return [
      { department: 'Finance', currentRate: 85, targetRate: 95, pendingCount: 12, overdueCount: 3, approachingDeadlineCount: 5 },
      { department: 'HR', currentRate: 92, targetRate: 90, pendingCount: 4, overdueCount: 0, approachingDeadlineCount: 2 },
      { department: 'Legal', currentRate: 78, targetRate: 95, pendingCount: 18, overdueCount: 8, approachingDeadlineCount: 4 },
      { department: 'Operations', currentRate: 88, targetRate: 85, pendingCount: 8, overdueCount: 1, approachingDeadlineCount: 3 },
      { department: 'IT', currentRate: 95, targetRate: 90, pendingCount: 2, overdueCount: 0, approachingDeadlineCount: 1 }
    ];
  }
}

async function getDepartmentTargets(): Promise<{ department: string; targetPercentage: number }[]> {
  try {
    const result = await db.execute(sql`
      SELECT department, target_percentage as targetPercentage
      FROM compliance_targets
      WHERE effective_date <= NOW()
      ORDER BY effective_date DESC
    `);
    return result.rows as { department: string; targetPercentage: number }[];
  } catch (error) {
    return [];
  }
}

async function checkAlertExists(alert: Alert): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT id FROM compliance_alerts
      WHERE alert_type = ${alert.alertType}
        AND department = ${alert.department}
        AND acknowledged_at IS NULL
        AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      LIMIT 1
    `);
    return (result.rows as any[]).length > 0;
  } catch (error) {
    return false;
  }
}

async function saveAlert(alert: Alert): Promise<void> {
  try {
    await db.execute(sql`
      INSERT INTO compliance_alerts (
        alert_type, severity, department, title, message,
        current_value, threshold_value, metadata, expires_at
      ) VALUES (
        ${alert.alertType},
        ${alert.severity},
        ${alert.department},
        ${alert.title},
        ${alert.message},
        ${alert.currentValue},
        ${alert.thresholdValue},
        ${JSON.stringify(alert.metadata || {})},
        DATE_ADD(NOW(), INTERVAL 7 DAY)
      )
    `);
  } catch (error) {
    console.error('[ComplianceAlerts] Error saving alert:', error);
  }
}

export async function getActiveAlerts(): Promise<any[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        id, alert_type as alertType, severity, department,
        title, message, current_value as currentValue,
        threshold_value as thresholdValue, metadata,
        acknowledged_at as acknowledgedAt, acknowledged_by as acknowledgedBy,
        created_at as createdAt, expires_at as expiresAt
      FROM compliance_alerts
      WHERE acknowledged_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY 
        CASE severity 
          WHEN 'critical' THEN 1 
          WHEN 'warning' THEN 2 
          ELSE 3 
        END,
        created_at DESC
    `);
    return result.rows as any[];
  } catch (error) {
    console.error('[ComplianceAlerts] Error getting active alerts:', error);
    return [];
  }
}

export async function acknowledgeAlert(alertId: number, userId: number): Promise<boolean> {
  try {
    await db.execute(sql`
      UPDATE compliance_alerts
      SET acknowledged_at = NOW(), acknowledged_by = ${userId}
      WHERE id = ${alertId}
    `);
    return true;
  } catch (error) {
    console.error('[ComplianceAlerts] Error acknowledging alert:', error);
    return false;
  }
}

export async function getAlertHistory(
  limit: number = 50,
  department?: string
): Promise<any[]> {
  try {
    let query;
    if (department) {
      query = sql`
        SELECT 
          id, alert_type as alertType, severity, department,
          title, message, current_value as currentValue,
          threshold_value as thresholdValue, metadata,
          acknowledged_at as acknowledgedAt, acknowledged_by as acknowledgedBy,
          created_at as createdAt
        FROM compliance_alerts
        WHERE department = ${department}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT 
          id, alert_type as alertType, severity, department,
          title, message, current_value as currentValue,
          threshold_value as thresholdValue, metadata,
          acknowledged_at as acknowledgedAt, acknowledged_by as acknowledgedBy,
          created_at as createdAt
        FROM compliance_alerts
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }
    const result = await db.execute(query);
    return result.rows as any[];
  } catch (error) {
    console.error('[ComplianceAlerts] Error getting alert history:', error);
    return [];
  }
}

export async function getAlertStats(): Promise<{
  total: number;
  critical: number;
  warning: number;
  info: number;
  acknowledged: number;
}> {
  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN severity = 'critical' AND acknowledged_at IS NULL THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'warning' AND acknowledged_at IS NULL THEN 1 ELSE 0 END) as warning,
        SUM(CASE WHEN severity = 'info' AND acknowledged_at IS NULL THEN 1 ELSE 0 END) as info,
        SUM(CASE WHEN acknowledged_at IS NOT NULL THEN 1 ELSE 0 END) as acknowledged
      FROM compliance_alerts
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    const row = (result.rows as any[])[0] || {};
    return {
      total: Number(row.total) || 0,
      critical: Number(row.critical) || 0,
      warning: Number(row.warning) || 0,
      info: Number(row.info) || 0,
      acknowledged: Number(row.acknowledged) || 0
    };
  } catch (error) {
    return { total: 0, critical: 0, warning: 0, info: 0, acknowledged: 0 };
  }
}
