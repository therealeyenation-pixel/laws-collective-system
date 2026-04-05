import { describe, it, expect, vi } from "vitest";
import {
  calculatePriority,
  formatTaskType,
  generateReminderSubject,
  generateReminderEmailHtml,
  generateReminderEmailText,
  generateDocumentExpirationNotification,
  createComplianceNotification,
  shouldSendNotification,
  generateWeeklyDigest,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "./compliance-notifications";
import type { ComplianceTask, FilingDeadline, DocumentExpiration } from "./compliance-tracking";

describe("Compliance Notifications Service", () => {
  describe("calculatePriority", () => {
    it("should return critical for overdue items", () => {
      expect(calculatePriority(-1)).toBe("critical");
      expect(calculatePriority(-5)).toBe("critical");
    });

    it("should return high for items due within 1 day", () => {
      expect(calculatePriority(0)).toBe("high");
      expect(calculatePriority(1)).toBe("high");
    });

    it("should return medium for items due within 3 days", () => {
      expect(calculatePriority(2)).toBe("medium");
      expect(calculatePriority(3)).toBe("medium");
    });

    it("should return low for items due in more than 3 days", () => {
      expect(calculatePriority(4)).toBe("low");
      expect(calculatePriority(7)).toBe("low");
      expect(calculatePriority(30)).toBe("low");
    });
  });

  describe("formatTaskType", () => {
    it("should format payroll tax deposit", () => {
      expect(formatTaskType("payroll_tax_deposit")).toBe("Payroll Tax Deposit");
    });

    it("should format quarterly 941", () => {
      expect(formatTaskType("quarterly_941")).toBe("Form 941 (Quarterly)");
    });

    it("should format annual 940", () => {
      expect(formatTaskType("annual_940")).toBe("Form 940 (Annual)");
    });

    it("should format w2 filing", () => {
      expect(formatTaskType("w2_filing")).toBe("W-2 Filing");
    });

    it("should format 1099 filing", () => {
      expect(formatTaskType("1099_filing")).toBe("1099 Filing");
    });

    it("should format annual report", () => {
      expect(formatTaskType("annual_report")).toBe("Annual Report");
    });

    it("should format i9 reverification", () => {
      expect(formatTaskType("i9_reverification")).toBe("I-9 Reverification");
    });

    it("should format custom task", () => {
      expect(formatTaskType("custom")).toBe("Custom Task");
    });
  });

  describe("generateReminderSubject", () => {
    const mockTask: ComplianceTask = {
      taskId: "task-1",
      houseId: 1,
      taskType: "quarterly_941",
      taskName: "Q1 2026 Form 941",
      description: "File quarterly payroll tax return",
      dueDate: new Date("2026-04-30"),
      isRecurring: true,
      recurrencePattern: "quarterly",
      status: "upcoming",
    };

    it("should generate overdue subject", () => {
      const subject = generateReminderSubject(mockTask, -3);
      expect(subject).toContain("OVERDUE");
      expect(subject).toContain("Q1 2026 Form 941");
    });

    it("should generate due today subject", () => {
      const subject = generateReminderSubject(mockTask, 0);
      expect(subject).toContain("DUE TODAY");
      expect(subject).toContain("Q1 2026 Form 941");
    });

    it("should generate due tomorrow subject", () => {
      const subject = generateReminderSubject(mockTask, 1);
      expect(subject).toContain("Due Tomorrow");
    });

    it("should generate due in X days subject for 2-3 days", () => {
      const subject = generateReminderSubject(mockTask, 3);
      expect(subject).toContain("Due in 3 days");
    });

    it("should generate upcoming subject for more than 3 days", () => {
      const subject = generateReminderSubject(mockTask, 7);
      expect(subject).toContain("Upcoming");
      expect(subject).toContain("Due in 7 days");
    });
  });

  describe("generateReminderEmailHtml", () => {
    const mockTask: ComplianceTask = {
      taskId: "task-1",
      houseId: 1,
      taskType: "quarterly_941",
      taskName: "Q1 2026 Form 941",
      description: "File quarterly payroll tax return",
      dueDate: new Date("2026-04-30"),
      isRecurring: true,
      status: "due_soon",
    };

    it("should generate HTML email with task details", () => {
      const html = generateReminderEmailHtml(mockTask, 3, "John Doe");
      expect(html).toContain("Q1 2026 Form 941");
      expect(html).toContain("File quarterly payroll tax return");
      expect(html).toContain("John Doe");
      expect(html).toContain("Form 941 (Quarterly)");
    });

    it("should include urgency badge", () => {
      const html = generateReminderEmailHtml(mockTask, 0, "John Doe");
      expect(html).toContain("DUE TODAY");
    });

    it("should include penalty warning for filing deadlines with penalties", () => {
      const mockDeadline: FilingDeadline = {
        deadlineId: "deadline-1",
        taskType: "quarterly_941",
        name: "Q1 2026 Form 941",
        description: "File quarterly payroll tax return",
        dueDate: new Date("2026-04-30"),
        filingPeriod: "Q1 2026",
        penaltyAmount: 500,
        penaltyDescription: "Late filing penalty of $500",
        formNumber: "941",
        filingMethod: "electronic",
        extensionAvailable: false,
      };

      const html = generateReminderEmailHtml(mockDeadline, 3, "John Doe");
      expect(html).toContain("Penalty Warning");
      expect(html).toContain("$500");
    });
  });

  describe("generateReminderEmailText", () => {
    const mockTask: ComplianceTask = {
      taskId: "task-1",
      houseId: 1,
      taskType: "quarterly_941",
      taskName: "Q1 2026 Form 941",
      description: "File quarterly payroll tax return",
      dueDate: new Date("2026-04-30"),
      isRecurring: true,
      status: "due_soon",
    };

    it("should generate plain text email with task details", () => {
      const text = generateReminderEmailText(mockTask, 3, "John Doe");
      expect(text).toContain("Q1 2026 Form 941");
      expect(text).toContain("File quarterly payroll tax return");
      expect(text).toContain("John Doe");
      expect(text).toContain("Due in 3 days");
    });

    it("should include overdue status", () => {
      const text = generateReminderEmailText(mockTask, -2, "John Doe");
      expect(text).toContain("OVERDUE by 2 day(s)");
    });
  });

  describe("generateDocumentExpirationNotification", () => {
    const mockDoc: DocumentExpiration = {
      documentId: "doc-1",
      documentType: "I-9",
      documentName: "Employment Eligibility Verification",
      employeeName: "Jane Smith",
      positionHolderId: 1,
      expirationDate: new Date("2026-03-15"),
      daysUntilExpiration: 30,
      status: "expiring_soon",
      reverificationRequired: true,
      reverificationDeadline: new Date("2026-03-15"),
    };

    it("should generate expiring soon notification", () => {
      const { subject, htmlBody, textBody } = generateDocumentExpirationNotification(
        mockDoc,
        "Admin User"
      );
      expect(subject).toContain("Expiring Soon");
      expect(subject).toContain("Employment Eligibility Verification");
      expect(htmlBody).toContain("Jane Smith");
      expect(htmlBody).toContain("I-9");
      expect(textBody).toContain("expiring soon");
    });

    it("should generate expired notification", () => {
      const expiredDoc: DocumentExpiration = {
        ...mockDoc,
        status: "expired",
        daysUntilExpiration: -5,
      };
      const { subject, htmlBody, textBody } = generateDocumentExpirationNotification(
        expiredDoc,
        "Admin User"
      );
      expect(subject).toContain("EXPIRED");
      expect(htmlBody).toContain("expired");
      expect(textBody).toContain("expired");
    });

    it("should include reverification info", () => {
      const { htmlBody } = generateDocumentExpirationNotification(mockDoc, "Admin User");
      expect(htmlBody).toContain("Reverification Required");
    });
  });

  describe("createComplianceNotification", () => {
    it("should create notification with required fields", () => {
      const notification = createComplianceNotification(
        1,
        "deadline_reminder",
        "Test Title",
        "Test Message"
      );

      expect(notification.notificationId).toMatch(/^notif-\d+-[a-z0-9]+$/);
      expect(notification.userId).toBe(1);
      expect(notification.notificationType).toBe("deadline_reminder");
      expect(notification.title).toBe("Test Title");
      expect(notification.message).toBe("Test Message");
      expect(notification.priority).toBe("medium");
      expect(notification.emailSent).toBe(false);
      expect(notification.inAppSent).toBe(false);
      expect(notification.smsSent).toBe(false);
    });

    it("should create notification with optional fields", () => {
      const dueDate = new Date("2026-04-30");
      const notification = createComplianceNotification(
        1,
        "task_overdue",
        "Overdue Task",
        "Task is overdue",
        {
          taskId: "task-123",
          dueDate,
          priority: "critical",
        }
      );

      expect(notification.taskId).toBe("task-123");
      expect(notification.dueDate).toEqual(dueDate);
      expect(notification.priority).toBe("critical");
    });
  });

  describe("shouldSendNotification", () => {
    const basePreferences: NotificationPreferences = {
      userId: 1,
      email: "test@example.com",
      emailEnabled: true,
      inAppEnabled: true,
      smsEnabled: false,
      reminderDaysBefore: [7, 3, 1],
      digestFrequency: "weekly",
      excludedTaskTypes: [],
    };

    it("should return true for configured reminder intervals", () => {
      expect(shouldSendNotification(basePreferences, "quarterly_941", 7)).toBe(true);
      expect(shouldSendNotification(basePreferences, "quarterly_941", 3)).toBe(true);
      expect(shouldSendNotification(basePreferences, "quarterly_941", 1)).toBe(true);
    });

    it("should return false for non-configured intervals", () => {
      expect(shouldSendNotification(basePreferences, "quarterly_941", 5)).toBe(false);
      expect(shouldSendNotification(basePreferences, "quarterly_941", 10)).toBe(false);
    });

    it("should always return true for overdue items", () => {
      expect(shouldSendNotification(basePreferences, "quarterly_941", -1)).toBe(true);
      expect(shouldSendNotification(basePreferences, "quarterly_941", -5)).toBe(true);
    });

    it("should return false for excluded task types", () => {
      const prefsWithExclusion: NotificationPreferences = {
        ...basePreferences,
        excludedTaskTypes: ["quarterly_941"],
      };
      expect(shouldSendNotification(prefsWithExclusion, "quarterly_941", 7)).toBe(false);
    });

    it("should return false if all notification methods are disabled", () => {
      const prefsDisabled: NotificationPreferences = {
        ...basePreferences,
        emailEnabled: false,
        inAppEnabled: false,
        smsEnabled: false,
      };
      expect(shouldSendNotification(prefsDisabled, "quarterly_941", 7)).toBe(false);
    });
  });

  describe("generateWeeklyDigest", () => {
    const mockTasks: ComplianceTask[] = [
      {
        taskId: "task-1",
        houseId: 1,
        taskType: "quarterly_941",
        taskName: "Q1 Form 941",
        description: "File quarterly return",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        isRecurring: true,
        status: "due_soon",
      },
      {
        taskId: "task-2",
        houseId: 1,
        taskType: "annual_report",
        taskName: "Annual Report",
        description: "File annual report",
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isRecurring: true,
        status: "overdue",
      },
    ];

    const mockDeadlines: FilingDeadline[] = [
      {
        deadlineId: "deadline-1",
        taskType: "w2_filing",
        name: "W-2 Filing",
        description: "File W-2s",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        filingPeriod: "2025",
        filingMethod: "electronic",
        extensionAvailable: false,
      },
    ];

    const mockExpirations: DocumentExpiration[] = [
      {
        documentId: "doc-1",
        documentType: "I-9",
        documentName: "I-9 Form",
        employeeName: "John Doe",
        positionHolderId: 1,
        expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        daysUntilExpiration: 10,
        status: "expiring_soon",
        reverificationRequired: true,
      },
    ];

    it("should generate digest with all sections", () => {
      const { subject, htmlBody, textBody } = generateWeeklyDigest(
        mockTasks,
        mockDeadlines,
        mockExpirations,
        "Admin User"
      );

      expect(subject).toContain("Weekly Compliance Digest");
      expect(htmlBody).toContain("Admin User");
      expect(htmlBody).toContain("Overdue");
      expect(htmlBody).toContain("Due Soon");
      expect(textBody).toContain("WEEKLY COMPLIANCE DIGEST");
    });

    it("should include overdue count in subject when items are overdue", () => {
      const { subject } = generateWeeklyDigest(
        mockTasks,
        mockDeadlines,
        mockExpirations,
        "Admin User"
      );
      expect(subject).toContain("1 Overdue");
    });

    it("should show 'All On Track' when no overdue items", () => {
      const tasksNoOverdue = mockTasks.map((t) => ({
        ...t,
        status: "upcoming" as const,
      }));
      const { subject } = generateWeeklyDigest(
        tasksNoOverdue,
        mockDeadlines,
        mockExpirations,
        "Admin User"
      );
      expect(subject).toContain("All On Track");
    });
  });

  describe("DEFAULT_NOTIFICATION_PREFERENCES", () => {
    it("should have email enabled by default", () => {
      expect(DEFAULT_NOTIFICATION_PREFERENCES.emailEnabled).toBe(true);
    });

    it("should have in-app enabled by default", () => {
      expect(DEFAULT_NOTIFICATION_PREFERENCES.inAppEnabled).toBe(true);
    });

    it("should have SMS disabled by default", () => {
      expect(DEFAULT_NOTIFICATION_PREFERENCES.smsEnabled).toBe(false);
    });

    it("should have default reminder intervals", () => {
      expect(DEFAULT_NOTIFICATION_PREFERENCES.reminderDaysBefore).toContain(7);
      expect(DEFAULT_NOTIFICATION_PREFERENCES.reminderDaysBefore).toContain(3);
      expect(DEFAULT_NOTIFICATION_PREFERENCES.reminderDaysBefore).toContain(1);
    });

    it("should have weekly digest by default", () => {
      expect(DEFAULT_NOTIFICATION_PREFERENCES.digestFrequency).toBe("weekly");
    });

    it("should have no excluded task types by default", () => {
      expect(DEFAULT_NOTIFICATION_PREFERENCES.excludedTaskTypes).toHaveLength(0);
    });
  });
});
