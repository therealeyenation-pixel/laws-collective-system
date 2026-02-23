import { describe, it, expect } from "vitest";
import {
  createComplianceTask,
  calculateTaskStatus,
  getFederalFilingDeadlines,
  getStateAnnualReportDeadline,
  generateNextOccurrence,
  getTaskTypes,
  getReminderConfig,
  checkDocumentExpiration,
  generateI9ReverificationTasks,
} from "./compliance-tracking";

describe("Compliance Tracking Service", () => {
  describe("createComplianceTask", () => {
    it("should create a basic compliance task", () => {
      const dueDate = new Date("2026-04-15");
      const task = createComplianceTask(
        1,
        "quarterly_941",
        "Q1 941 Filing",
        "File Form 941 for Q1",
        dueDate
      );

      expect(task.houseId).toBe(1);
      expect(task.taskType).toBe("quarterly_941");
      expect(task.taskName).toBe("Q1 941 Filing");
      expect(task.description).toBe("File Form 941 for Q1");
      expect(task.dueDate).toEqual(dueDate);
      expect(task.status).toBe("upcoming");
      expect(task.reminderDate).toBeDefined();
    });

    it("should create a recurring task", () => {
      const dueDate = new Date("2026-04-15");
      const task = createComplianceTask(
        1,
        "payroll_tax_deposit",
        "Monthly Payroll Tax Deposit",
        "Deposit payroll taxes",
        dueDate,
        { isRecurring: true, recurrencePattern: "monthly" }
      );

      expect(task.isRecurring).toBe(true);
      expect(task.recurrencePattern).toBe("monthly");
    });

    it("should assign task to a user", () => {
      const dueDate = new Date("2026-04-15");
      const task = createComplianceTask(
        1,
        "annual_report",
        "Annual Report",
        "File annual report",
        dueDate,
        { assignedToUserId: 123 }
      );

      expect(task.assignedToUserId).toBe(123);
    });

    it("should link task to business entity", () => {
      const dueDate = new Date("2026-04-15");
      const task = createComplianceTask(
        1,
        "business_license",
        "Business License Renewal",
        "Renew business license",
        dueDate,
        { businessEntityId: 456 }
      );

      expect(task.businessEntityId).toBe(456);
    });

    it("should link task to position holder", () => {
      const dueDate = new Date("2026-04-15");
      const task = createComplianceTask(
        1,
        "i9_reverification",
        "I-9 Reverification",
        "Reverify work authorization",
        dueDate,
        { positionHolderId: 789 }
      );

      expect(task.positionHolderId).toBe(789);
    });
  });

  describe("calculateTaskStatus", () => {
    it("should return completed for completed tasks", () => {
      const dueDate = new Date("2026-01-15");
      const completedAt = new Date("2026-01-10");
      expect(calculateTaskStatus(dueDate, completedAt)).toBe("completed");
    });

    it("should return overdue for past due tasks", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      expect(calculateTaskStatus(pastDate)).toBe("overdue");
    });

    it("should return due_soon for tasks due within 7 days", () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 5);
      expect(calculateTaskStatus(soonDate)).toBe("due_soon");
    });

    it("should return upcoming for tasks due more than 7 days out", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      expect(calculateTaskStatus(futureDate)).toBe("upcoming");
    });
  });

  describe("getFederalFilingDeadlines", () => {
    it("should return federal filing deadlines for a year", () => {
      const deadlines = getFederalFilingDeadlines(2026);
      expect(deadlines.length).toBeGreaterThan(0);
    });

    it("should include quarterly 941 deadlines", () => {
      const deadlines = getFederalFilingDeadlines(2026);
      const q941Deadlines = deadlines.filter(d => d.taskType === "quarterly_941");
      expect(q941Deadlines.length).toBe(4);
    });

    it("should include W-2 filing deadline", () => {
      const deadlines = getFederalFilingDeadlines(2026);
      const w2Deadline = deadlines.find(d => d.taskType === "w2_filing");
      expect(w2Deadline).toBeDefined();
      expect(w2Deadline?.formNumber).toBe("W-2");
    });

    it("should include 1099 filing deadline", () => {
      const deadlines = getFederalFilingDeadlines(2026);
      const deadline1099 = deadlines.find(d => d.taskType === "1099_filing");
      expect(deadline1099).toBeDefined();
      expect(deadline1099?.formNumber).toBe("1099-NEC");
    });

    it("should include Form 940 deadline", () => {
      const deadlines = getFederalFilingDeadlines(2026);
      const form940 = deadlines.find(d => d.taskType === "annual_940");
      expect(form940).toBeDefined();
      expect(form940?.formNumber).toBe("940");
    });

    it("should have correct due dates for Q1 941", () => {
      const deadlines = getFederalFilingDeadlines(2026);
      const q1941 = deadlines.find(d => d.filingPeriod === "Q1 2026");
      expect(q1941).toBeDefined();
      expect(new Date(q1941!.dueDate).getMonth()).toBe(3); // April
      expect(new Date(q1941!.dueDate).getDate()).toBe(30);
    });
  });

  describe("getStateAnnualReportDeadline", () => {
    it("should return deadline for Delaware", () => {
      const formationDate = new Date("2020-06-15");
      const deadline = getStateAnnualReportDeadline("DE", formationDate, 2026);
      expect(deadline).toBeDefined();
      expect(deadline?.name).toContain("DE");
      expect(new Date(deadline!.dueDate).getMonth()).toBe(2); // March
      expect(new Date(deadline!.dueDate).getDate()).toBe(1);
    });

    it("should return deadline for California", () => {
      const formationDate = new Date("2020-06-15");
      const deadline = getStateAnnualReportDeadline("CA", formationDate, 2026);
      expect(deadline).toBeDefined();
      expect(deadline?.name).toContain("CA");
    });

    it("should return deadline for Texas", () => {
      const formationDate = new Date("2020-06-15");
      const deadline = getStateAnnualReportDeadline("TX", formationDate, 2026);
      expect(deadline).toBeDefined();
      expect(deadline?.name).toContain("TX");
      expect(new Date(deadline!.dueDate).getMonth()).toBe(4); // May
      expect(new Date(deadline!.dueDate).getDate()).toBe(15);
    });

    it("should return deadline for New York", () => {
      const formationDate = new Date("2020-06-15");
      const deadline = getStateAnnualReportDeadline("NY", formationDate, 2026);
      expect(deadline).toBeDefined();
      expect(deadline?.name).toContain("NY");
    });

    it("should return deadline for Florida", () => {
      const formationDate = new Date("2020-06-15");
      const deadline = getStateAnnualReportDeadline("FL", formationDate, 2026);
      expect(deadline).toBeDefined();
      expect(deadline?.name).toContain("FL");
      expect(new Date(deadline!.dueDate).getMonth()).toBe(4); // May
      expect(new Date(deadline!.dueDate).getDate()).toBe(1);
    });

    it("should return null for unsupported state", () => {
      const formationDate = new Date("2020-06-15");
      const deadline = getStateAnnualReportDeadline("ZZ", formationDate, 2026);
      expect(deadline).toBeNull();
    });
  });

  describe("generateNextOccurrence", () => {
    it("should generate next weekly occurrence", () => {
      const task = {
        taskId: "1",
        houseId: 1,
        taskType: "payroll_tax_deposit" as const,
        taskName: "Weekly Deposit",
        description: "Weekly payroll tax deposit",
        dueDate: new Date("2026-01-15"),
        isRecurring: true,
        recurrencePattern: "weekly" as const,
        status: "completed" as const,
      };

      const nextTask = generateNextOccurrence(task);
      expect(nextTask).toBeDefined();
      // Should be approximately 7 days later
      const daysDiff = Math.round((new Date(nextTask!.dueDate).getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(7);
    });

    it("should generate next biweekly occurrence", () => {
      const task = {
        taskId: "1",
        houseId: 1,
        taskType: "payroll_tax_deposit" as const,
        taskName: "Biweekly Deposit",
        description: "Biweekly payroll tax deposit",
        dueDate: new Date("2026-01-15"),
        isRecurring: true,
        recurrencePattern: "biweekly" as const,
        status: "completed" as const,
      };

      const nextTask = generateNextOccurrence(task);
      expect(nextTask).toBeDefined();
      // Should be approximately 14 days later
      const daysDiff = Math.round((new Date(nextTask!.dueDate).getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(14);
    });

    it("should generate next monthly occurrence", () => {
      const task = {
        taskId: "1",
        houseId: 1,
        taskType: "state_tax_deposit" as const,
        taskName: "Monthly State Tax",
        description: "Monthly state tax deposit",
        dueDate: new Date("2026-01-15"),
        isRecurring: true,
        recurrencePattern: "monthly" as const,
        status: "completed" as const,
      };

      const nextTask = generateNextOccurrence(task);
      expect(nextTask).toBeDefined();
      // Should be next month
      expect(new Date(nextTask!.dueDate).getMonth()).toBe(1); // February
    });

    it("should generate next quarterly occurrence", () => {
      const task = {
        taskId: "1",
        houseId: 1,
        taskType: "quarterly_941" as const,
        taskName: "Quarterly 941",
        description: "Quarterly 941 filing",
        dueDate: new Date("2026-01-15"),
        isRecurring: true,
        recurrencePattern: "quarterly" as const,
        status: "completed" as const,
      };

      const nextTask = generateNextOccurrence(task);
      expect(nextTask).toBeDefined();
      // Should be 3 months later (April)
      expect(new Date(nextTask!.dueDate).getMonth()).toBe(3); // April
    });

    it("should generate next annual occurrence", () => {
      const task = {
        taskId: "1",
        houseId: 1,
        taskType: "annual_report" as const,
        taskName: "Annual Report",
        description: "Annual report filing",
        dueDate: new Date("2026-03-01"),
        isRecurring: true,
        recurrencePattern: "annually" as const,
        status: "completed" as const,
      };

      const nextTask = generateNextOccurrence(task);
      expect(nextTask).toBeDefined();
      expect(new Date(nextTask!.dueDate).getFullYear()).toBe(2027);
    });

    it("should return null for non-recurring tasks", () => {
      const task = {
        taskId: "1",
        houseId: 1,
        taskType: "custom" as const,
        taskName: "One-time Task",
        description: "One-time task",
        dueDate: new Date("2026-01-15"),
        isRecurring: false,
        status: "completed" as const,
      };

      const nextTask = generateNextOccurrence(task);
      expect(nextTask).toBeNull();
    });
  });

  describe("getTaskTypes", () => {
    it("should return all task types", () => {
      const types = getTaskTypes();
      expect(types.length).toBeGreaterThan(0);
    });

    it("should include payroll tax deposit type", () => {
      const types = getTaskTypes();
      const payrollType = types.find(t => t.type === "payroll_tax_deposit");
      expect(payrollType).toBeDefined();
      expect(payrollType?.name).toBe("Payroll Tax Deposit");
    });

    it("should include quarterly 941 type", () => {
      const types = getTaskTypes();
      const q941Type = types.find(t => t.type === "quarterly_941");
      expect(q941Type).toBeDefined();
      expect(q941Type?.name).toBe("Quarterly 941");
    });

    it("should include annual report type", () => {
      const types = getTaskTypes();
      const annualType = types.find(t => t.type === "annual_report");
      expect(annualType).toBeDefined();
      expect(annualType?.name).toBe("Annual Report");
    });

    it("should include I-9 reverification type", () => {
      const types = getTaskTypes();
      const i9Type = types.find(t => t.type === "i9_reverification");
      expect(i9Type).toBeDefined();
      expect(i9Type?.name).toBe("I-9 Reverification");
    });

    it("should include custom type", () => {
      const types = getTaskTypes();
      const customType = types.find(t => t.type === "custom");
      expect(customType).toBeDefined();
      expect(customType?.name).toBe("Custom Task");
    });
  });

  describe("getReminderConfig", () => {
    it("should return reminder config for quarterly 941", () => {
      const config = getReminderConfig("quarterly_941");
      expect(config.taskType).toBe("quarterly_941");
      expect(config.reminderDaysBefore).toContain(14);
      expect(config.notificationMethods).toContain("email");
    });

    it("should return reminder config for W-2 filing", () => {
      const config = getReminderConfig("w2_filing");
      expect(config.taskType).toBe("w2_filing");
      expect(config.reminderDaysBefore).toContain(30);
      expect(config.notificationMethods).toContain("email");
    });

    it("should return reminder config for annual report", () => {
      const config = getReminderConfig("annual_report");
      expect(config.taskType).toBe("annual_report");
      expect(config.reminderDaysBefore.length).toBeGreaterThan(0);
      expect(config.notificationMethods).toContain("email");
    });

    it("should return reminder config for I-9 reverification", () => {
      const config = getReminderConfig("i9_reverification");
      expect(config.taskType).toBe("i9_reverification");
      expect(config.reminderDaysBefore.length).toBeGreaterThan(0);
      expect(config.notificationMethods).toContain("email");
    });

    it("should return config for custom tasks", () => {
      const config = getReminderConfig("custom");
      expect(config.taskType).toBe("custom");
      expect(config.reminderDaysBefore.length).toBeGreaterThan(0);
    });
  });

  describe("checkDocumentExpiration", () => {
    it("should identify expired document", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      
      const result = checkDocumentExpiration(
        "doc-1",
        "work_authorization",
        "Work Authorization",
        "John Doe",
        1,
        pastDate
      );

      expect(result.status).toBe("expired");
      expect(result.daysUntilExpiration).toBeLessThan(0);
    });

    it("should identify expiring soon document", () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 30);
      
      const result = checkDocumentExpiration(
        "doc-1",
        "work_authorization",
        "Work Authorization",
        "John Doe",
        1,
        soonDate
      );

      expect(result.status).toBe("expiring_soon");
      expect(result.daysUntilExpiration).toBeLessThanOrEqual(90);
    });

    it("should identify valid document", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 180);
      
      const result = checkDocumentExpiration(
        "doc-1",
        "work_authorization",
        "Work Authorization",
        "John Doe",
        1,
        futureDate
      );

      expect(result.status).toBe("valid");
      expect(result.daysUntilExpiration).toBeGreaterThan(90);
    });

    it("should include employee information", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 180);
      
      const result = checkDocumentExpiration(
        "doc-1",
        "work_authorization",
        "Work Authorization",
        "John Doe",
        123,
        futureDate
      );

      expect(result.employeeName).toBe("John Doe");
      expect(result.positionHolderId).toBe(123);
      expect(result.documentName).toBe("Work Authorization");
    });
  });

  describe("generateI9ReverificationTasks", () => {
    it("should generate tasks for employees with expiring work authorization", () => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 60);

      const employees = [
        {
          positionHolderId: 1,
          employeeName: "John Doe",
          workAuthorizationExpiration: expirationDate,
        },
      ];

      const tasks = generateI9ReverificationTasks(1, employees);
      expect(tasks.length).toBe(1);
      expect(tasks[0].taskType).toBe("i9_reverification");
      expect(tasks[0].positionHolderId).toBe(1);
    });

    it("should not generate tasks for employees with distant expiration", () => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 180);

      const employees = [
        {
          positionHolderId: 1,
          employeeName: "John Doe",
          workAuthorizationExpiration: expirationDate,
        },
      ];

      const tasks = generateI9ReverificationTasks(1, employees);
      expect(tasks.length).toBe(0);
    });

    it("should generate tasks for multiple employees", () => {
      const expirationDate1 = new Date();
      expirationDate1.setDate(expirationDate1.getDate() + 30);
      
      const expirationDate2 = new Date();
      expirationDate2.setDate(expirationDate2.getDate() + 60);

      const employees = [
        {
          positionHolderId: 1,
          employeeName: "John Doe",
          workAuthorizationExpiration: expirationDate1,
        },
        {
          positionHolderId: 2,
          employeeName: "Jane Smith",
          workAuthorizationExpiration: expirationDate2,
        },
      ];

      const tasks = generateI9ReverificationTasks(1, employees);
      expect(tasks.length).toBe(2);
    });

    it("should include employee name in task name", () => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 60);

      const employees = [
        {
          positionHolderId: 1,
          employeeName: "John Doe",
          workAuthorizationExpiration: expirationDate,
        },
      ];

      const tasks = generateI9ReverificationTasks(1, employees);
      expect(tasks[0].taskName).toContain("John Doe");
    });

    it("should set due date at or before expiration", () => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 60);

      const employees = [
        {
          positionHolderId: 1,
          employeeName: "John Doe",
          workAuthorizationExpiration: expirationDate,
        },
      ];

      const tasks = generateI9ReverificationTasks(1, employees);
      expect(new Date(tasks[0].dueDate).getTime()).toBeLessThanOrEqual(expirationDate.getTime());
    });
  });
});
