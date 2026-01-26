/**
 * Compliance Notifications Service
 * Phase 67: Email notification integration for compliance calendar reminders
 */

import { notifyOwner } from "../_core/notification";
import type {
  ComplianceTask,
  FilingDeadline,
  DocumentExpiration,
  ComplianceTaskType,
  ReminderConfig,
} from "./compliance-tracking";
import { getReminderConfig, getTaskStatus } from "./compliance-tracking";

// Notification types
export type NotificationType =
  | "deadline_reminder"
  | "task_overdue"
  | "document_expiring"
  | "document_expired"
  | "task_completed"
  | "escalation"
  | "weekly_digest";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface NotificationPreferences {
  userId: number;
  email: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  smsEnabled: boolean;
  reminderDaysBefore: number[];
  digestFrequency: "daily" | "weekly" | "none";
  quietHoursStart?: number; // 0-23
  quietHoursEnd?: number; // 0-23
  excludedTaskTypes: ComplianceTaskType[];
}

export interface ComplianceNotification {
  notificationId: string;
  userId: number;
  notificationType: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  taskId?: string;
  deadlineId?: string;
  documentId?: string;
  dueDate?: Date;
  createdAt: Date;
  sentAt?: Date;
  readAt?: Date;
  emailSent: boolean;
  inAppSent: boolean;
  smsSent: boolean;
}

export interface NotificationResult {
  success: boolean;
  notificationId: string;
  channels: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
  error?: string;
}

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, "userId" | "email"> = {
  emailEnabled: true,
  inAppEnabled: true,
  smsEnabled: false,
  reminderDaysBefore: [7, 3, 1],
  digestFrequency: "weekly",
  excludedTaskTypes: [],
};

/**
 * Generate unique notification ID
 */
function generateNotificationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `notif-${timestamp}-${random}`;
}

/**
 * Determine notification priority based on days until deadline
 */
export function calculatePriority(daysUntilDeadline: number): NotificationPriority {
  if (daysUntilDeadline < 0) return "critical";
  if (daysUntilDeadline <= 1) return "high";
  if (daysUntilDeadline <= 3) return "medium";
  return "low";
}

/**
 * Format task type for display
 */
export function formatTaskType(taskType: ComplianceTaskType): string {
  const labels: Record<ComplianceTaskType, string> = {
    payroll_tax_deposit: "Payroll Tax Deposit",
    quarterly_941: "Form 941 (Quarterly)",
    annual_940: "Form 940 (Annual)",
    w2_filing: "W-2 Filing",
    "1099_filing": "1099 Filing",
    k1_filing: "K-1 Filing",
    state_tax_deposit: "State Tax Deposit",
    state_quarterly: "State Quarterly Filing",
    annual_report: "Annual Report",
    business_license: "Business License Renewal",
    i9_reverification: "I-9 Reverification",
    workers_comp_audit: "Workers Comp Audit",
    benefits_enrollment: "Benefits Enrollment",
    performance_review: "Performance Review",
    custom: "Custom Task",
  };
  return labels[taskType] || taskType;
}

/**
 * Generate email subject for deadline reminder
 */
export function generateReminderSubject(
  task: ComplianceTask | FilingDeadline,
  daysUntilDeadline: number
): string {
  const taskName = "taskName" in task ? task.taskName : task.name;

  if (daysUntilDeadline < 0) {
    return `🚨 OVERDUE: ${taskName}`;
  }
  if (daysUntilDeadline === 0) {
    return `⚠️ DUE TODAY: ${taskName}`;
  }
  if (daysUntilDeadline === 1) {
    return `⚠️ Due Tomorrow: ${taskName}`;
  }
  if (daysUntilDeadline <= 3) {
    return `📅 Due in ${daysUntilDeadline} days: ${taskName}`;
  }
  return `📋 Upcoming: ${taskName} - Due in ${daysUntilDeadline} days`;
}

/**
 * Generate HTML email body for deadline reminder
 */
export function generateReminderEmailHtml(
  task: ComplianceTask | FilingDeadline,
  daysUntilDeadline: number,
  recipientName: string
): string {
  const taskName = "taskName" in task ? task.taskName : task.name;
  const description = task.description;
  const dueDate = task.dueDate;
  const taskType = task.taskType;

  const priority = calculatePriority(daysUntilDeadline);
  const headerColor =
    priority === "critical"
      ? "#dc2626"
      : priority === "high"
        ? "#f59e0b"
        : priority === "medium"
          ? "#3b82f6"
          : "#10b981";

  const urgencyText =
    daysUntilDeadline < 0
      ? `OVERDUE by ${Math.abs(daysUntilDeadline)} day${Math.abs(daysUntilDeadline) !== 1 ? "s" : ""}`
      : daysUntilDeadline === 0
        ? "DUE TODAY"
        : daysUntilDeadline === 1
          ? "Due Tomorrow"
          : `Due in ${daysUntilDeadline} days`;

  const penaltySection =
    "penaltyAmount" in task && task.penaltyAmount
      ? `
    <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; margin-top: 15px;">
      <strong style="color: #dc2626;">⚠️ Penalty Warning:</strong>
      <p style="margin: 5px 0 0 0; color: #991b1b;">${task.penaltyDescription || `Late filing may result in a penalty of $${task.penaltyAmount.toLocaleString()}`}</p>
    </div>
  `
      : "";

  const formSection =
    "formNumber" in task && task.formNumber
      ? `<p><strong>Form:</strong> ${task.formNumber}</p>`
      : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: ${headerColor}; color: white; padding: 25px; text-align: center; }
    .content { background: #ffffff; padding: 25px; border: 1px solid #e5e7eb; }
    .task-box { background: #f9fafb; border-left: 4px solid ${headerColor}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .urgency-badge { display: inline-block; background: ${headerColor}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
    .detail-row { margin: 10px 0; }
    .detail-label { color: #6b7280; font-size: 14px; }
    .detail-value { font-weight: 600; }
    .btn { display: inline-block; background: ${headerColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Compliance Deadline Reminder</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${urgencyText}</p>
    </div>
    <div class="content">
      <p>Hello ${recipientName},</p>
      <p>This is a reminder about an upcoming compliance deadline that requires your attention.</p>
      
      <div class="task-box">
        <span class="urgency-badge">${urgencyText}</span>
        <h2 style="margin: 15px 0 10px 0; color: #1f2937;">${taskName}</h2>
        <p style="color: #4b5563; margin: 0 0 15px 0;">${description}</p>
        
        <div class="detail-row">
          <span class="detail-label">Due Date:</span>
          <span class="detail-value">${dueDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Task Type:</span>
          <span class="detail-value">${formatTaskType(taskType)}</span>
        </div>
        ${formSection}
      </div>
      
      ${penaltySection}
      
      <div style="text-align: center;">
        <a href="/compliance-calendar" class="btn">View Compliance Calendar</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated reminder from the Financial Automation Platform.</p>
      <p>To manage your notification preferences, visit your account settings.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate plain text email body for deadline reminder
 */
export function generateReminderEmailText(
  task: ComplianceTask | FilingDeadline,
  daysUntilDeadline: number,
  recipientName: string
): string {
  const taskName = "taskName" in task ? task.taskName : task.name;
  const description = task.description;
  const dueDate = task.dueDate;
  const taskType = task.taskType;

  const urgencyText =
    daysUntilDeadline < 0
      ? `OVERDUE by ${Math.abs(daysUntilDeadline)} day(s)`
      : daysUntilDeadline === 0
        ? "DUE TODAY"
        : daysUntilDeadline === 1
          ? "Due Tomorrow"
          : `Due in ${daysUntilDeadline} days`;

  const penaltyText =
    "penaltyAmount" in task && task.penaltyAmount
      ? `\n⚠️ PENALTY WARNING: ${task.penaltyDescription || `Late filing may result in a penalty of $${task.penaltyAmount.toLocaleString()}`}\n`
      : "";

  return `
COMPLIANCE DEADLINE REMINDER
============================

Hello ${recipientName},

This is a reminder about an upcoming compliance deadline.

${urgencyText}

Task: ${taskName}
Description: ${description}
Due Date: ${dueDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
Task Type: ${formatTaskType(taskType)}
${penaltyText}
Visit the Compliance Calendar to view and manage this task.

---
This is an automated reminder from the Financial Automation Platform.
`;
}

/**
 * Generate document expiration notification
 */
export function generateDocumentExpirationNotification(
  doc: DocumentExpiration,
  recipientName: string
): { subject: string; htmlBody: string; textBody: string } {
  const isExpired = doc.status === "expired";
  const headerColor = isExpired ? "#dc2626" : "#f59e0b";
  const statusText = isExpired ? "EXPIRED" : `Expiring in ${doc.daysUntilExpiration} days`;

  const subject = isExpired
    ? `🚨 EXPIRED: ${doc.documentName} for ${doc.employeeName}`
    : `⚠️ Expiring Soon: ${doc.documentName} for ${doc.employeeName}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: ${headerColor}; color: white; padding: 25px; text-align: center; }
    .content { background: #ffffff; padding: 25px; border: 1px solid #e5e7eb; }
    .doc-box { background: #f9fafb; border-left: 4px solid ${headerColor}; padding: 20px; margin: 20px 0; }
    .btn { display: inline-block; background: ${headerColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Document ${isExpired ? "Expired" : "Expiration"} Alert</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${statusText}</p>
    </div>
    <div class="content">
      <p>Hello ${recipientName},</p>
      <p>${isExpired ? "The following document has expired and requires immediate attention:" : "The following document is expiring soon and requires your attention:"}</p>
      
      <div class="doc-box">
        <h2 style="margin: 0 0 15px 0; color: #1f2937;">${doc.documentName}</h2>
        <p><strong>Employee:</strong> ${doc.employeeName}</p>
        <p><strong>Document Type:</strong> ${doc.documentType}</p>
        <p><strong>Expiration Date:</strong> ${doc.expirationDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        ${doc.reverificationRequired ? `<p><strong>Reverification Required:</strong> Yes${doc.reverificationDeadline ? ` by ${doc.reverificationDeadline.toLocaleDateString()}` : ""}</p>` : ""}
      </div>
      
      ${isExpired ? '<p style="color: #dc2626; font-weight: bold;">Please take immediate action to renew or replace this document.</p>' : ""}
      
      <div style="text-align: center;">
        <a href="/compliance-calendar" class="btn">View Compliance Calendar</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated alert from the Financial Automation Platform.</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `
DOCUMENT ${isExpired ? "EXPIRED" : "EXPIRATION"} ALERT
${"=".repeat(30)}

Hello ${recipientName},

${isExpired ? "The following document has expired:" : "The following document is expiring soon:"}

Document: ${doc.documentName}
Employee: ${doc.employeeName}
Document Type: ${doc.documentType}
Expiration Date: ${doc.expirationDate.toLocaleDateString()}
Status: ${statusText}
${doc.reverificationRequired ? `Reverification Required: Yes${doc.reverificationDeadline ? ` by ${doc.reverificationDeadline.toLocaleDateString()}` : ""}` : ""}

${isExpired ? "Please take immediate action to renew or replace this document." : "Please ensure this document is renewed before expiration."}

---
This is an automated alert from the Financial Automation Platform.
`;

  return { subject, htmlBody, textBody };
}

/**
 * Create a compliance notification record
 */
export function createComplianceNotification(
  userId: number,
  notificationType: NotificationType,
  title: string,
  message: string,
  options?: {
    taskId?: string;
    deadlineId?: string;
    documentId?: string;
    dueDate?: Date;
    priority?: NotificationPriority;
  }
): ComplianceNotification {
  return {
    notificationId: generateNotificationId(),
    userId,
    notificationType,
    priority: options?.priority || "medium",
    title,
    message,
    taskId: options?.taskId,
    deadlineId: options?.deadlineId,
    documentId: options?.documentId,
    dueDate: options?.dueDate,
    createdAt: new Date(),
    emailSent: false,
    inAppSent: false,
    smsSent: false,
  };
}

/**
 * Check if notification should be sent based on preferences
 */
export function shouldSendNotification(
  preferences: NotificationPreferences,
  taskType: ComplianceTaskType,
  daysUntilDeadline: number
): boolean {
  // Check if task type is excluded
  if (preferences.excludedTaskTypes.includes(taskType)) {
    return false;
  }

  // Check if any notification method is enabled
  if (!preferences.emailEnabled && !preferences.inAppEnabled && !preferences.smsEnabled) {
    return false;
  }

  // Check if this reminder interval is configured
  if (!preferences.reminderDaysBefore.includes(daysUntilDeadline) && daysUntilDeadline >= 0) {
    // Always send for overdue items
    return daysUntilDeadline < 0;
  }

  // Check quiet hours (only for non-critical)
  if (
    preferences.quietHoursStart !== undefined &&
    preferences.quietHoursEnd !== undefined &&
    daysUntilDeadline > 1
  ) {
    const currentHour = new Date().getHours();
    if (preferences.quietHoursStart <= preferences.quietHoursEnd) {
      if (currentHour >= preferences.quietHoursStart && currentHour < preferences.quietHoursEnd) {
        return false;
      }
    } else {
      // Quiet hours span midnight
      if (currentHour >= preferences.quietHoursStart || currentHour < preferences.quietHoursEnd) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Send deadline reminder notification
 */
export async function sendDeadlineReminder(
  task: ComplianceTask | FilingDeadline,
  preferences: NotificationPreferences,
  recipientName: string
): Promise<NotificationResult> {
  const dueDate = task.dueDate;
  const now = new Date();
  const daysUntilDeadline = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const taskType = task.taskType;

  // Check if we should send this notification
  if (!shouldSendNotification(preferences, taskType, daysUntilDeadline)) {
    return {
      success: false,
      notificationId: "",
      channels: { email: false, inApp: false, sms: false },
      error: "Notification skipped based on preferences",
    };
  }

  const taskName = "taskName" in task ? task.taskName : task.name;
  const subject = generateReminderSubject(task, daysUntilDeadline);
  const htmlBody = generateReminderEmailHtml(task, daysUntilDeadline, recipientName);
  const textBody = generateReminderEmailText(task, daysUntilDeadline, recipientName);

  const notification = createComplianceNotification(
    preferences.userId,
    daysUntilDeadline < 0 ? "task_overdue" : "deadline_reminder",
    subject,
    textBody,
    {
      taskId: "taskId" in task ? task.taskId : undefined,
      deadlineId: "deadlineId" in task ? task.deadlineId : undefined,
      dueDate,
      priority: calculatePriority(daysUntilDeadline),
    }
  );

  const result: NotificationResult = {
    success: true,
    notificationId: notification.notificationId,
    channels: { email: false, inApp: false, sms: false },
  };

  // Send email notification
  if (preferences.emailEnabled) {
    try {
      const emailResult = await notifyOwner({
        title: subject,
        content: `${taskName}\n\nDue: ${dueDate.toLocaleDateString()}\n\n${task.description}`,
      });
      result.channels.email = emailResult;
      notification.emailSent = emailResult;
    } catch (error) {
      console.error("[ComplianceNotifications] Email send failed:", error);
    }
  }

  // In-app notification would be stored in database
  if (preferences.inAppEnabled) {
    result.channels.inApp = true;
    notification.inAppSent = true;
  }

  notification.sentAt = new Date();
  return result;
}

/**
 * Send document expiration notification
 */
export async function sendDocumentExpirationNotification(
  doc: DocumentExpiration,
  preferences: NotificationPreferences,
  recipientName: string
): Promise<NotificationResult> {
  const { subject, htmlBody, textBody } = generateDocumentExpirationNotification(
    doc,
    recipientName
  );

  const notification = createComplianceNotification(
    preferences.userId,
    doc.status === "expired" ? "document_expired" : "document_expiring",
    subject,
    textBody,
    {
      documentId: doc.documentId,
      dueDate: doc.expirationDate,
      priority: doc.status === "expired" ? "critical" : "high",
    }
  );

  const result: NotificationResult = {
    success: true,
    notificationId: notification.notificationId,
    channels: { email: false, inApp: false, sms: false },
  };

  // Send email notification
  if (preferences.emailEnabled) {
    try {
      const emailResult = await notifyOwner({
        title: subject,
        content: `Document: ${doc.documentName}\nEmployee: ${doc.employeeName}\nExpiration: ${doc.expirationDate.toLocaleDateString()}`,
      });
      result.channels.email = emailResult;
      notification.emailSent = emailResult;
    } catch (error) {
      console.error("[ComplianceNotifications] Email send failed:", error);
    }
  }

  if (preferences.inAppEnabled) {
    result.channels.inApp = true;
    notification.inAppSent = true;
  }

  notification.sentAt = new Date();
  return result;
}

/**
 * Generate weekly digest of compliance tasks
 */
export function generateWeeklyDigest(
  tasks: ComplianceTask[],
  deadlines: FilingDeadline[],
  documentExpirations: DocumentExpiration[],
  recipientName: string
): { subject: string; htmlBody: string; textBody: string } {
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingTasks = tasks.filter(
    (t) => t.status !== "completed" && t.dueDate <= weekEnd
  );
  const upcomingDeadlines = deadlines.filter((d) => d.dueDate <= weekEnd);
  const expiringDocs = documentExpirations.filter(
    (d) => d.status === "expiring_soon" || d.status === "expired"
  );

  const overdueTasks = upcomingTasks.filter((t) => t.status === "overdue");
  const dueSoonTasks = upcomingTasks.filter((t) => t.status === "due_soon");

  const subject = `📊 Weekly Compliance Digest - ${overdueTasks.length > 0 ? `${overdueTasks.length} Overdue` : "All On Track"}`;

  const taskRows = upcomingTasks
    .slice(0, 10)
    .map(
      (t) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${t.taskName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${t.dueDate.toLocaleDateString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <span style="background: ${t.status === "overdue" ? "#fef2f2" : t.status === "due_soon" ? "#fffbeb" : "#f0fdf4"}; 
              color: ${t.status === "overdue" ? "#dc2626" : t.status === "due_soon" ? "#f59e0b" : "#10b981"}; 
              padding: 4px 8px; border-radius: 4px; font-size: 12px;">
          ${t.status.replace("_", " ").toUpperCase()}
        </span>
      </td>
    </tr>
  `
    )
    .join("");

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 30px; text-align: center; }
    .content { background: #ffffff; padding: 25px; border: 1px solid #e5e7eb; }
    .stats-grid { display: flex; gap: 15px; margin: 20px 0; }
    .stat-card { flex: 1; background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: bold; }
    .stat-label { color: #6b7280; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
    .btn { display: inline-block; background: #1e3a5f; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">📊 Weekly Compliance Digest</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Week of ${now.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}</p>
    </div>
    <div class="content">
      <p>Hello ${recipientName},</p>
      <p>Here's your weekly compliance summary:</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value" style="color: #dc2626;">${overdueTasks.length}</div>
          <div class="stat-label">Overdue</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #f59e0b;">${dueSoonTasks.length}</div>
          <div class="stat-label">Due Soon</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #3b82f6;">${upcomingDeadlines.length}</div>
          <div class="stat-label">Deadlines</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #8b5cf6;">${expiringDocs.length}</div>
          <div class="stat-label">Expiring Docs</div>
        </div>
      </div>
      
      ${
        upcomingTasks.length > 0
          ? `
      <h3>Upcoming Tasks</h3>
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${taskRows}
        </tbody>
      </table>
      `
          : "<p>No upcoming tasks this week. Great job staying on top of compliance!</p>"
      }
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="/compliance-calendar" class="btn">View Full Calendar</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated digest from the Financial Automation Platform.</p>
      <p>To change your digest preferences, visit your account settings.</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `
WEEKLY COMPLIANCE DIGEST
========================

Hello ${recipientName},

Week of ${now.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}

SUMMARY
-------
Overdue: ${overdueTasks.length}
Due Soon: ${dueSoonTasks.length}
Deadlines: ${upcomingDeadlines.length}
Expiring Documents: ${expiringDocs.length}

UPCOMING TASKS
--------------
${upcomingTasks.map((t) => `- ${t.taskName} (Due: ${t.dueDate.toLocaleDateString()}) [${t.status}]`).join("\n")}

Visit the Compliance Calendar for more details.

---
This is an automated digest from the Financial Automation Platform.
`;

  return { subject, htmlBody, textBody };
}

/**
 * Process all pending notifications for a house
 */
export async function processComplianceNotifications(
  houseId: number,
  tasks: ComplianceTask[],
  deadlines: FilingDeadline[],
  documentExpirations: DocumentExpiration[],
  preferences: NotificationPreferences,
  recipientName: string
): Promise<{
  sent: number;
  skipped: number;
  errors: number;
  notifications: NotificationResult[];
}> {
  const results: NotificationResult[] = [];
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  const now = new Date();

  // Process task reminders
  for (const task of tasks) {
    if (task.status === "completed" || task.status === "skipped") continue;

    const daysUntilDeadline = Math.ceil(
      (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if we should send reminder based on configured intervals
    const config = getReminderConfig(task.taskType);
    const shouldRemind =
      config.reminderDaysBefore.includes(daysUntilDeadline) || daysUntilDeadline < 0;

    if (shouldRemind) {
      try {
        const result = await sendDeadlineReminder(task, preferences, recipientName);
        results.push(result);
        if (result.success) sent++;
        else skipped++;
      } catch (error) {
        errors++;
        console.error("[ComplianceNotifications] Error sending task reminder:", error);
      }
    }
  }

  // Process filing deadline reminders
  for (const deadline of deadlines) {
    const daysUntilDeadline = Math.ceil(
      (deadline.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const config = getReminderConfig(deadline.taskType);
    const shouldRemind =
      config.reminderDaysBefore.includes(daysUntilDeadline) || daysUntilDeadline < 0;

    if (shouldRemind) {
      try {
        const result = await sendDeadlineReminder(deadline, preferences, recipientName);
        results.push(result);
        if (result.success) sent++;
        else skipped++;
      } catch (error) {
        errors++;
        console.error("[ComplianceNotifications] Error sending deadline reminder:", error);
      }
    }
  }

  // Process document expiration notifications
  for (const doc of documentExpirations) {
    if (doc.status === "expired" || doc.status === "expiring_soon") {
      try {
        const result = await sendDocumentExpirationNotification(doc, preferences, recipientName);
        results.push(result);
        if (result.success) sent++;
        else skipped++;
      } catch (error) {
        errors++;
        console.error("[ComplianceNotifications] Error sending document notification:", error);
      }
    }
  }

  console.log(
    `[ComplianceNotifications] Processed: ${sent} sent, ${skipped} skipped, ${errors} errors`
  );

  return { sent, skipped, errors, notifications: results };
}
