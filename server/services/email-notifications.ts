import { db } from "../db";
import { sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

interface AlertEmailData {
  alertId: number;
  alertType: string;
  severity: string;
  department: string;
  title: string;
  message: string;
  currentValue?: number;
  thresholdValue?: number;
  createdAt: string;
}

interface DigestEmailData {
  recipientName: string;
  recipientEmail: string;
  department?: string;
  periodStart: string;
  periodEnd: string;
  stats: {
    totalAlerts: number;
    criticalCount: number;
    warningCount: number;
    acknowledgedCount: number;
    complianceRate: number;
  };
  alerts: AlertEmailData[];
}

/**
 * Generate email template for critical compliance alert
 */
export function generateCriticalAlertEmail(alert: AlertEmailData): EmailTemplate {
  const subject = `🚨 CRITICAL: ${alert.title}`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .alert-box { background: white; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
    .metric { display: inline-block; background: #fee2e2; padding: 5px 10px; border-radius: 4px; margin: 5px; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
    .btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🚨 Critical Compliance Alert</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Immediate attention required</p>
    </div>
    <div class="content">
      <div class="alert-box">
        <h2 style="margin-top: 0; color: #dc2626;">${alert.title}</h2>
        <p><strong>Department:</strong> ${alert.department}</p>
        <p><strong>Alert Type:</strong> ${formatAlertType(alert.alertType)}</p>
        <p>${alert.message}</p>
        ${alert.currentValue !== undefined ? `
        <div style="margin-top: 15px;">
          <span class="metric">Current: ${alert.currentValue}%</span>
          ${alert.thresholdValue !== undefined ? `<span class="metric">Target: ${alert.thresholdValue}%</span>` : ''}
        </div>
        ` : ''}
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Generated: ${new Date(alert.createdAt).toLocaleString()}
      </p>
      <a href="/admin/compliance-dashboard" class="btn">View Compliance Dashboard</a>
    </div>
    <div class="footer">
      <p>This is an automated alert from the Financial Automation Platform.</p>
      <p>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `
CRITICAL COMPLIANCE ALERT
========================

${alert.title}

Department: ${alert.department}
Alert Type: ${formatAlertType(alert.alertType)}

${alert.message}

${alert.currentValue !== undefined ? `Current Value: ${alert.currentValue}%` : ''}
${alert.thresholdValue !== undefined ? `Target Value: ${alert.thresholdValue}%` : ''}

Generated: ${new Date(alert.createdAt).toLocaleString()}

View the Compliance Dashboard for more details.

---
This is an automated alert from the Financial Automation Platform.
`;

  return { subject, htmlBody, textBody };
}

/**
 * Generate email template for warning alert
 */
export function generateWarningAlertEmail(alert: AlertEmailData): EmailTemplate {
  const subject = `⚠️ Warning: ${alert.title}`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .alert-box { background: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
    .metric { display: inline-block; background: #fef3c7; padding: 5px 10px; border-radius: 4px; margin: 5px; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
    .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">⚠️ Compliance Warning</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Action recommended</p>
    </div>
    <div class="content">
      <div class="alert-box">
        <h2 style="margin-top: 0; color: #f59e0b;">${alert.title}</h2>
        <p><strong>Department:</strong> ${alert.department}</p>
        <p><strong>Alert Type:</strong> ${formatAlertType(alert.alertType)}</p>
        <p>${alert.message}</p>
        ${alert.currentValue !== undefined ? `
        <div style="margin-top: 15px;">
          <span class="metric">Current: ${alert.currentValue}%</span>
          ${alert.thresholdValue !== undefined ? `<span class="metric">Target: ${alert.thresholdValue}%</span>` : ''}
        </div>
        ` : ''}
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Generated: ${new Date(alert.createdAt).toLocaleString()}
      </p>
      <a href="/admin/compliance-dashboard" class="btn">View Compliance Dashboard</a>
    </div>
    <div class="footer">
      <p>This is an automated alert from the Financial Automation Platform.</p>
      <p>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `
COMPLIANCE WARNING
==================

${alert.title}

Department: ${alert.department}
Alert Type: ${formatAlertType(alert.alertType)}

${alert.message}

${alert.currentValue !== undefined ? `Current Value: ${alert.currentValue}%` : ''}
${alert.thresholdValue !== undefined ? `Target Value: ${alert.thresholdValue}%` : ''}

Generated: ${new Date(alert.createdAt).toLocaleString()}

View the Compliance Dashboard for more details.

---
This is an automated alert from the Financial Automation Platform.
`;

  return { subject, htmlBody, textBody };
}

/**
 * Generate weekly digest email template
 */
export function generateWeeklyDigestEmail(data: DigestEmailData): EmailTemplate {
  const subject = `📊 Weekly Compliance Report - ${data.department || 'All Departments'}`;
  
  const statusColor = data.stats.complianceRate >= 90 ? '#10b981' : 
                      data.stats.complianceRate >= 75 ? '#f59e0b' : '#dc2626';
  
  const alertRows = data.alerts.slice(0, 5).map(alert => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6'}; margin-right: 8px;"></span>
        ${alert.title}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${alert.department}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${formatAlertType(alert.alertType)}</td>
    </tr>
  `).join('');

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-value { font-size: 32px; font-weight: bold; }
    .stat-label { color: #6b7280; font-size: 14px; }
    .compliance-meter { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 20px 0; }
    .compliance-fill { height: 100%; background: ${statusColor}; transition: width 0.3s; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
    .btn { display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">📊 Weekly Compliance Report</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">${data.periodStart} - ${data.periodEnd}</p>
      ${data.department ? `<p style="margin: 5px 0 0 0; opacity: 0.9;">Department: ${data.department}</p>` : ''}
    </div>
    <div class="content">
      <h2>Overall Compliance Rate</h2>
      <div class="compliance-meter">
        <div class="compliance-fill" style="width: ${data.stats.complianceRate}%;"></div>
      </div>
      <p style="text-align: center; font-size: 24px; font-weight: bold; color: ${statusColor};">
        ${data.stats.complianceRate.toFixed(1)}%
      </p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value" style="color: #dc2626;">${data.stats.criticalCount}</div>
          <div class="stat-label">Critical Alerts</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #f59e0b;">${data.stats.warningCount}</div>
          <div class="stat-label">Warnings</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #3b82f6;">${data.stats.totalAlerts}</div>
          <div class="stat-label">Total Alerts</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #10b981;">${data.stats.acknowledgedCount}</div>
          <div class="stat-label">Acknowledged</div>
        </div>
      </div>

      ${data.alerts.length > 0 ? `
      <h2>Recent Alerts</h2>
      <table>
        <thead>
          <tr>
            <th>Alert</th>
            <th>Department</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          ${alertRows}
        </tbody>
      </table>
      ` : '<p style="text-align: center; color: #10b981;">✅ No active alerts this week!</p>'}

      <div style="text-align: center;">
        <a href="/admin/compliance-dashboard" class="btn">View Full Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated weekly report from the Financial Automation Platform.</p>
      <p>Report generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `
WEEKLY COMPLIANCE REPORT
========================
${data.periodStart} - ${data.periodEnd}
${data.department ? `Department: ${data.department}` : ''}

OVERALL COMPLIANCE RATE: ${data.stats.complianceRate.toFixed(1)}%

STATISTICS
----------
Critical Alerts: ${data.stats.criticalCount}
Warnings: ${data.stats.warningCount}
Total Alerts: ${data.stats.totalAlerts}
Acknowledged: ${data.stats.acknowledgedCount}

${data.alerts.length > 0 ? `
RECENT ALERTS
-------------
${data.alerts.slice(0, 5).map(a => `• [${a.severity.toUpperCase()}] ${a.title} (${a.department})`).join('\n')}
` : 'No active alerts this week!'}

View the full Compliance Dashboard for more details.

---
This is an automated weekly report from the Financial Automation Platform.
Report generated: ${new Date().toLocaleString()}
`;

  return { subject, htmlBody, textBody };
}

/**
 * Generate escalation notification email
 */
export function generateEscalationEmail(alert: AlertEmailData, escalatedFrom: string): EmailTemplate {
  const subject = `🔺 Alert Escalated: ${alert.title}`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #7c3aed; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .escalation-box { background: #faf5ff; border: 2px solid #7c3aed; padding: 15px; margin: 15px 0; border-radius: 8px; }
    .arrow { font-size: 24px; text-align: center; margin: 10px 0; }
    .severity-badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-weight: bold; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
    .btn { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔺 Alert Escalated</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">This alert requires immediate attention</p>
    </div>
    <div class="content">
      <div class="escalation-box">
        <p style="text-align: center; margin: 0;">
          <span class="severity-badge" style="background: ${escalatedFrom === 'info' ? '#dbeafe' : '#fef3c7'}; color: ${escalatedFrom === 'info' ? '#1d4ed8' : '#b45309'};">
            ${escalatedFrom.toUpperCase()}
          </span>
        </p>
        <div class="arrow">⬇️</div>
        <p style="text-align: center; margin: 0;">
          <span class="severity-badge" style="background: ${alert.severity === 'critical' ? '#fee2e2' : '#fef3c7'}; color: ${alert.severity === 'critical' ? '#dc2626' : '#b45309'};">
            ${alert.severity.toUpperCase()}
          </span>
        </p>
      </div>
      
      <h2 style="color: #7c3aed;">${alert.title}</h2>
      <p><strong>Department:</strong> ${alert.department}</p>
      <p><strong>Reason:</strong> Alert was not acknowledged within the configured time threshold.</p>
      <p>${alert.message}</p>
      
      <div style="text-align: center;">
        <a href="/admin/compliance-dashboard" class="btn">Acknowledge Alert</a>
      </div>
    </div>
    <div class="footer">
      <p>This alert was automatically escalated due to non-acknowledgment.</p>
      <p>Please review and acknowledge to prevent further escalation.</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `
ALERT ESCALATED
===============

This alert has been escalated from ${escalatedFrom.toUpperCase()} to ${alert.severity.toUpperCase()} due to non-acknowledgment.

${alert.title}

Department: ${alert.department}

${alert.message}

Please review and acknowledge this alert in the Compliance Dashboard to prevent further escalation.

---
This is an automated escalation notice from the Financial Automation Platform.
`;

  return { subject, htmlBody, textBody };
}

/**
 * Send email notification for a compliance alert
 */
export async function sendAlertEmailNotification(
  alert: AlertEmailData,
  recipientEmail?: string
): Promise<{ success: boolean; logId?: number; error?: string }> {
  try {
    // Generate appropriate email template based on severity
    const template = alert.severity === 'critical' 
      ? generateCriticalAlertEmail(alert)
      : generateWarningAlertEmail(alert);

    // Log the notification attempt
    const logResult = await db.execute(sql`
      INSERT INTO notification_logs (
        notification_type, channel, subject, body,
        recipient_email, related_alert_id, status
      ) VALUES (
        'compliance_alert',
        'email',
        ${template.subject},
        ${template.textBody},
        ${recipientEmail || null},
        ${alert.alertId},
        'pending'
      )
    `);

    // For now, use the owner notification system
    // In production, this would integrate with an email service like SendGrid, SES, etc.
    const sent = await notifyOwner({
      title: template.subject,
      content: template.textBody
    });

    // Update notification log status
    if (sent) {
      await db.execute(sql`
        UPDATE notification_logs
        SET status = 'sent', sent_at = NOW()
        WHERE related_alert_id = ${alert.alertId}
          AND notification_type = 'compliance_alert'
          AND status = 'pending'
        ORDER BY created_at DESC
        LIMIT 1
      `);
    }

    return { success: sent };
  } catch (error) {
    console.error('[EmailNotifications] Error sending alert email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send weekly digest email to department heads
 */
export async function sendWeeklyDigestEmails(): Promise<{
  sent: number;
  failed: number;
  errors: string[];
}> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    // Get department heads or admins to send digest to
    const recipientsResult = await db.execute(sql`
      SELECT DISTINCT u.id, u.email, u.name, 
        COALESCE(up.department, 'General') as department
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.role IN ('admin', 'staff')
        AND u.email IS NOT NULL
    `);
    const recipients = recipientsResult.rows as any[];

    // Get date range
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const periodStart = weekAgo.toLocaleDateString();
    const periodEnd = now.toLocaleDateString();

    // Get overall stats
    const statsResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END) as warning,
        SUM(CASE WHEN acknowledged_at IS NOT NULL THEN 1 ELSE 0 END) as acknowledged
      FROM compliance_alerts
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    const stats = (statsResult.rows as any[])[0] || {};

    // Get recent alerts
    const alertsResult = await db.execute(sql`
      SELECT 
        id as alertId, alert_type as alertType, severity, department,
        title, message, current_value as currentValue, 
        threshold_value as thresholdValue, created_at as createdAt
      FROM compliance_alerts
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY 
        CASE severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
        created_at DESC
      LIMIT 10
    `);
    const alerts = alertsResult.rows as AlertEmailData[];

    // Calculate compliance rate
    let complianceRate = 85; // Default
    try {
      const compResult = await db.execute(sql`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN signed_at IS NOT NULL THEN 1 ELSE 0 END) as signed
        FROM article_acknowledgments
      `);
      const compStats = (compResult.rows as any[])[0];
      if (compStats && compStats.total > 0) {
        complianceRate = (compStats.signed / compStats.total) * 100;
      }
    } catch (e) {
      // Use default if query fails
    }

    // Send digest to each recipient (or just owner for now)
    const digestData: DigestEmailData = {
      recipientName: 'Administrator',
      recipientEmail: '',
      periodStart,
      periodEnd,
      stats: {
        totalAlerts: Number(stats.total) || 0,
        criticalCount: Number(stats.critical) || 0,
        warningCount: Number(stats.warning) || 0,
        acknowledgedCount: Number(stats.acknowledged) || 0,
        complianceRate
      },
      alerts
    };

    const template = generateWeeklyDigestEmail(digestData);

    // Send via owner notification
    const success = await notifyOwner({
      title: template.subject,
      content: template.textBody
    });

    if (success) {
      sent++;
      // Log the notification
      await db.execute(sql`
        INSERT INTO notification_logs (
          notification_type, channel, subject, body, status, sent_at
        ) VALUES (
          'weekly_digest', 'in_app', ${template.subject}, ${template.textBody}, 'sent', NOW()
        )
      `);
    } else {
      failed++;
      errors.push('Failed to send owner notification');
    }

  } catch (error) {
    console.error('[EmailNotifications] Error sending weekly digest:', error);
    failed++;
    errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return { sent, failed, errors };
}

/**
 * Get notification history
 */
export async function getNotificationHistory(
  limit: number = 50,
  type?: string
): Promise<any[]> {
  try {
    let query;
    if (type) {
      query = sql`
        SELECT 
          id, notification_type as notificationType, channel,
          recipient_email as recipientEmail, subject, 
          status, sent_at as sentAt, failed_at as failedAt,
          failure_reason as failureReason, created_at as createdAt
        FROM notification_logs
        WHERE notification_type = ${type}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT 
          id, notification_type as notificationType, channel,
          recipient_email as recipientEmail, subject, 
          status, sent_at as sentAt, failed_at as failedAt,
          failure_reason as failureReason, created_at as createdAt
        FROM notification_logs
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }
    const result = await db.execute(query);
    return result.rows as any[];
  } catch (error) {
    console.error('[EmailNotifications] Error getting notification history:', error);
    return [];
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<{
  totalSent: number;
  totalFailed: number;
  byType: Record<string, number>;
  byChannel: Record<string, number>;
}> {
  try {
    const result = await db.execute(sql`
      SELECT 
        notification_type,
        channel,
        status,
        COUNT(*) as count
      FROM notification_logs
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY notification_type, channel, status
    `);
    
    const rows = result.rows as any[];
    let totalSent = 0;
    let totalFailed = 0;
    const byType: Record<string, number> = {};
    const byChannel: Record<string, number> = {};

    for (const row of rows) {
      const count = Number(row.count);
      
      if (row.status === 'sent' || row.status === 'delivered') {
        totalSent += count;
      } else if (row.status === 'failed' || row.status === 'bounced') {
        totalFailed += count;
      }

      byType[row.notification_type] = (byType[row.notification_type] || 0) + count;
      byChannel[row.channel] = (byChannel[row.channel] || 0) + count;
    }

    return { totalSent, totalFailed, byType, byChannel };
  } catch (error) {
    console.error('[EmailNotifications] Error getting notification stats:', error);
    return { totalSent: 0, totalFailed: 0, byType: {}, byChannel: {} };
  }
}

/**
 * Helper function to format alert type for display
 */
function formatAlertType(alertType: string): string {
  const typeMap: Record<string, string> = {
    'below_target': 'Below Target',
    'approaching_deadline': 'Approaching Deadline',
    'overdue_spike': 'Overdue Items',
    'target_achieved': 'Target Achieved',
    'escalated': 'Escalated Alert'
  };
  return typeMap[alertType] || alertType;
}
