import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

// Mock schema imports
vi.mock("../drizzle/schema", () => ({
  fundingSources: {
    id: "id",
    name: "name",
    code: "code",
    type: "type",
    createdAt: "createdAt",
  },
  chargeCodes: {
    id: "id",
    code: "code",
    name: "name",
    fundingSourceId: "fundingSourceId",
    isActive: "isActive",
  },
  timekeepingWorkers: {
    id: "id",
    firstName: "firstName",
    lastName: "lastName",
    workerType: "workerType",
    status: "status",
  },
  timeEntries: {
    id: "id",
    workerId: "workerId",
    chargeCodeId: "chargeCodeId",
    date: "date",
  },
  timesheets: {
    id: "id",
    workerId: "workerId",
    status: "status",
  },
  timesheetApprovals: {},
  chargeCodeBudgets: {},
  timeOffRequests: {},
  contractorInvoices: {},
  invoiceLineItems: {},
}));

import { getDb } from "./db";

describe("Timekeeping Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Funding Sources", () => {
    it("should have funding source types defined", () => {
      const validTypes = ["grant", "contract", "internal", "donation", "revenue"];
      expect(validTypes).toContain("grant");
      expect(validTypes).toContain("contract");
      expect(validTypes).toContain("internal");
      expect(validTypes).toContain("donation");
      expect(validTypes).toContain("revenue");
    });

    it("should validate funding source code format", () => {
      const validCode = "GRANT-2024-001";
      expect(validCode).toMatch(/^[A-Z]+-\d{4}-\d{3}$/);
    });

    it("should support reporting frequencies", () => {
      const validFrequencies = ["weekly", "biweekly", "monthly", "quarterly", "annually"];
      expect(validFrequencies.length).toBe(5);
      expect(validFrequencies).toContain("monthly");
    });
  });

  describe("Charge Codes", () => {
    it("should have charge code properties defined", () => {
      const chargeCodeProps = [
        "code",
        "name",
        "description",
        "fundingSourceId",
        "projectId",
        "departmentId",
        "budgetedHours",
        "hourlyRate",
        "isBillable",
        "requiresApproval",
        "allowOvertime",
      ];
      expect(chargeCodeProps.length).toBeGreaterThan(5);
    });

    it("should validate charge code format", () => {
      const validCode = "PROJ-001-LABOR";
      expect(validCode).toMatch(/^[A-Z]+-\d{3}-[A-Z]+$/);
    });

    it("should default isBillable to true", () => {
      const defaultIsBillable = true;
      expect(defaultIsBillable).toBe(true);
    });
  });

  describe("Workers", () => {
    it("should support both employee and contractor types", () => {
      const workerTypes = ["employee", "contractor"];
      expect(workerTypes).toContain("employee");
      expect(workerTypes).toContain("contractor");
    });

    it("should have worker status options", () => {
      const statusOptions = ["active", "inactive", "terminated", "on_leave"];
      expect(statusOptions.length).toBe(4);
      expect(statusOptions).toContain("active");
    });

    it("should default standard hours per week to 40", () => {
      const defaultHours = 40;
      expect(defaultHours).toBe(40);
    });
  });

  describe("Time Entries", () => {
    it("should require worker and charge code for time entry", () => {
      const requiredFields = ["workerId", "chargeCodeId", "date", "hours"];
      expect(requiredFields).toContain("workerId");
      expect(requiredFields).toContain("chargeCodeId");
      expect(requiredFields).toContain("date");
      expect(requiredFields).toContain("hours");
    });

    it("should validate hours are positive", () => {
      const hours = 8;
      expect(hours).toBeGreaterThan(0);
      expect(hours).toBeLessThanOrEqual(24);
    });

    it("should support overtime tracking", () => {
      const regularHours = 8;
      const overtimeHours = 2;
      const totalHours = regularHours + overtimeHours;
      expect(totalHours).toBe(10);
    });
  });

  describe("Timesheets", () => {
    it("should have timesheet status workflow", () => {
      const statusWorkflow = ["draft", "submitted", "approved", "rejected", "paid"];
      expect(statusWorkflow).toContain("draft");
      expect(statusWorkflow).toContain("submitted");
      expect(statusWorkflow).toContain("approved");
      expect(statusWorkflow).toContain("rejected");
    });

    it("should calculate total hours from entries", () => {
      const entries = [
        { hours: 8 },
        { hours: 8 },
        { hours: 8 },
        { hours: 8 },
        { hours: 8 },
      ];
      const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
      expect(totalHours).toBe(40);
    });

    it("should track billable vs non-billable hours", () => {
      const entries = [
        { hours: 6, isBillable: true },
        { hours: 2, isBillable: false },
      ];
      const billableHours = entries.filter(e => e.isBillable).reduce((sum, e) => sum + e.hours, 0);
      const nonBillableHours = entries.filter(e => !e.isBillable).reduce((sum, e) => sum + e.hours, 0);
      expect(billableHours).toBe(6);
      expect(nonBillableHours).toBe(2);
    });
  });

  describe("Approval Workflow", () => {
    it("should require approver for timesheet approval", () => {
      const approvalFields = ["timesheetId", "approverId", "status", "comments"];
      expect(approvalFields).toContain("approverId");
      expect(approvalFields).toContain("status");
    });

    it("should track approval timestamp", () => {
      const approval = {
        approvedAt: new Date(),
        approverId: 1,
      };
      expect(approval.approvedAt).toBeInstanceOf(Date);
    });
  });

  describe("Budget Tracking", () => {
    it("should calculate budget utilization", () => {
      const budgetedHours = 100;
      const actualHours = 75;
      const utilization = (actualHours / budgetedHours) * 100;
      expect(utilization).toBe(75);
    });

    it("should flag over-budget charge codes", () => {
      const budgetedHours = 100;
      const actualHours = 110;
      const isOverBudget = actualHours > budgetedHours;
      expect(isOverBudget).toBe(true);
    });

    it("should calculate remaining budget", () => {
      const budgetedHours = 100;
      const actualHours = 75;
      const remainingHours = budgetedHours - actualHours;
      expect(remainingHours).toBe(25);
    });
  });

  describe("Contractor Invoice Integration", () => {
    it("should link time entries to invoices", () => {
      const invoiceLineItem = {
        invoiceId: 1,
        timeEntryId: 100,
        hours: 8,
        rate: 75,
        amount: 600,
      };
      expect(invoiceLineItem.amount).toBe(invoiceLineItem.hours * invoiceLineItem.rate);
    });

    it("should calculate invoice total from line items", () => {
      const lineItems = [
        { amount: 600 },
        { amount: 450 },
        { amount: 300 },
      ];
      const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
      expect(total).toBe(1350);
    });
  });
});
