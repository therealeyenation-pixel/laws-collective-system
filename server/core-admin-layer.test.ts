/**
 * Core Admin Layer Tests
 * Tests for Finance & Grants, HR & Identity, Legal & Contracts, Technology & Infrastructure
 */

import { describe, it, expect } from "vitest";
import {
  calculateBudgetVariance,
  getGrantBurnRate,
  getGrantProjectedSpend,
  createFinanceAccountData,
  createGrantData,
  calculateTenure,
  calculateTimeOffDays,
  createEmployeeData,
  createIdentityRecordData,
  isContractExpiring,
  isComplianceOverdue,
  createContractData,
  createComplianceRequirementData,
  calculateTechAssetDepreciation,
  getSystemHealthStatus,
  createTechAssetData,
  createIntegrationData,
  getCoreAdminLayerSummary
} from "./services/core-admin-layer";

describe("Core Admin Layer Service", () => {
  describe("Finance & Grants Functions", () => {
    it("should calculate budget variance correctly", () => {
      const result = calculateBudgetVariance(1000, 800);
      expect(result.variance).toBe(200);
      expect(result.variancePercent).toBe(20);
    });

    it("should handle zero budget", () => {
      const result = calculateBudgetVariance(0, 100);
      expect(result.variance).toBe(-100);
      expect(result.variancePercent).toBe(0);
    });

    it("should calculate grant burn rate", () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const grant = {
        id: 1,
        name: "Test Grant",
        funder: "Foundation",
        amount: 100000,
        startDate,
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: "active" as const,
        spentAmount: 30000,
        remainingAmount: 70000,
        complianceStatus: "compliant" as const
      };

      const burnRate = getGrantBurnRate(grant);
      expect(burnRate).toBeCloseTo(1000, 0); // ~$1000/day
    });

    it("should return 0 burn rate for future grants", () => {
      const grant = {
        id: 1,
        name: "Test Grant",
        funder: "Foundation",
        amount: 100000,
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        status: "pending" as const,
        spentAmount: 0,
        remainingAmount: 100000,
        complianceStatus: "compliant" as const
      };

      expect(getGrantBurnRate(grant)).toBe(0);
    });

    it("should create finance account data", () => {
      const account = createFinanceAccountData("Operating Account", "asset", "1000-001", 50000);
      
      expect(account.name).toBe("Operating Account");
      expect(account.type).toBe("asset");
      expect(account.accountNumber).toBe("1000-001");
      expect(account.balance).toBe(50000);
      expect(account.currency).toBe("USD");
      expect(account.status).toBe("active");
    });

    it("should create grant data", () => {
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-12-31");
      
      const grant = createGrantData("Community Grant", "Local Foundation", 50000, startDate, endDate);
      
      expect(grant.name).toBe("Community Grant");
      expect(grant.funder).toBe("Local Foundation");
      expect(grant.amount).toBe(50000);
      expect(grant.status).toBe("pending");
      expect(grant.spentAmount).toBe(0);
      expect(grant.remainingAmount).toBe(50000);
    });
  });

  describe("HR & Identity Functions", () => {
    it("should calculate tenure correctly", () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      
      const tenure = calculateTenure(twoYearsAgo);
      expect(tenure.years).toBe(2);
    });

    it("should calculate time off days", () => {
      const start = new Date("2025-01-06");
      const end = new Date("2025-01-10");
      
      const days = calculateTimeOffDays(start, end);
      expect(days).toBe(5); // Mon-Fri
    });

    it("should calculate single day time off", () => {
      const date = new Date("2025-01-06");
      const days = calculateTimeOffDays(date, date);
      expect(days).toBe(1);
    });

    it("should create employee data", () => {
      const employee = createEmployeeData(
        "EMP001",
        "John",
        "Doe",
        "john.doe@example.com",
        "Engineering",
        "Software Developer",
        75000
      );

      expect(employee.employeeId).toBe("EMP001");
      expect(employee.firstName).toBe("John");
      expect(employee.lastName).toBe("Doe");
      expect(employee.email).toBe("john.doe@example.com");
      expect(employee.department).toBe("Engineering");
      expect(employee.position).toBe("Software Developer");
      expect(employee.salary).toBe(75000);
      expect(employee.status).toBe("active");
      expect(employee.payFrequency).toBe("biweekly");
    });

    it("should create identity record data", () => {
      const identity = createIdentityRecordData(1, "employee_id", "ID-001", "standard");

      expect(identity.userId).toBe(1);
      expect(identity.idType).toBe("employee_id");
      expect(identity.idNumber).toBe("ID-001");
      expect(identity.accessLevel).toBe("standard");
      expect(identity.status).toBe("active");
      expect(identity.expiryDate).toBeDefined();
    });
  });

  describe("Legal & Contracts Functions", () => {
    it("should detect expiring contracts", () => {
      const contract = {
        id: 1,
        title: "Test Contract",
        type: "vendor" as const,
        parties: ["Company A", "Company B"],
        startDate: new Date("2024-01-01"),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        status: "active" as const
      };

      expect(isContractExpiring(contract, 30)).toBe(true);
      expect(isContractExpiring(contract, 10)).toBe(false);
    });

    it("should not flag contracts without end date", () => {
      const contract = {
        id: 1,
        title: "Perpetual Contract",
        type: "partnership" as const,
        parties: ["Company A", "Company B"],
        startDate: new Date("2024-01-01"),
        endDate: undefined,
        status: "active" as const
      };

      expect(isContractExpiring(contract)).toBe(false);
    });

    it("should detect overdue compliance", () => {
      const overdue = {
        id: 1,
        name: "Tax Filing",
        category: "federal" as const,
        description: "Annual tax filing",
        dueDate: new Date("2024-01-01"),
        frequency: "annual" as const,
        status: "pending" as const,
        responsibleParty: 1
      };

      const completed = {
        ...overdue,
        status: "completed" as const
      };

      expect(isComplianceOverdue(overdue)).toBe(true);
      expect(isComplianceOverdue(completed)).toBe(false);
    });

    it("should create contract data", () => {
      const contract = createContractData(
        "Service Agreement",
        "vendor",
        ["Our Company", "Vendor Inc"],
        new Date("2025-01-01"),
        new Date("2025-12-31"),
        50000
      );

      expect(contract.title).toBe("Service Agreement");
      expect(contract.type).toBe("vendor");
      expect(contract.parties).toEqual(["Our Company", "Vendor Inc"]);
      expect(contract.value).toBe(50000);
      expect(contract.status).toBe("draft");
    });

    it("should create compliance requirement data", () => {
      const compliance = createComplianceRequirementData(
        "Annual Report",
        "federal",
        "Submit annual report to SEC",
        new Date("2025-03-31"),
        "annual",
        1
      );

      expect(compliance.name).toBe("Annual Report");
      expect(compliance.category).toBe("federal");
      expect(compliance.frequency).toBe("annual");
      expect(compliance.status).toBe("pending");
      expect(compliance.responsibleParty).toBe(1);
    });
  });

  describe("Technology & Infrastructure Functions", () => {
    it("should calculate tech asset depreciation", () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const asset = {
        id: 1,
        name: "Server",
        type: "hardware" as const,
        vendor: "Dell",
        purchaseDate: oneYearAgo,
        cost: 10000,
        status: "active" as const
      };

      const value = calculateTechAssetDepreciation(asset, 5);
      expect(value).toBeCloseTo(8000, -2); // ~$8000 after 1 year of 5-year depreciation
    });

    it("should get system health status", () => {
      const healthyServices = [
        { id: 1, name: "S1", type: "compute" as const, provider: "AWS", status: "healthy" as const, monthlyCost: 100, sla: 99.9, uptime: 99.95 },
        { id: 2, name: "S2", type: "storage" as const, provider: "AWS", status: "healthy" as const, monthlyCost: 50, sla: 99.9, uptime: 99.99 }
      ];

      const degradedServices = [
        { id: 1, name: "S1", type: "compute" as const, provider: "AWS", status: "degraded" as const, monthlyCost: 100, sla: 99.9, uptime: 99.95 },
        { id: 2, name: "S2", type: "storage" as const, provider: "AWS", status: "degraded" as const, monthlyCost: 50, sla: 99.9, uptime: 99.99 }
      ];

      const criticalServices = [
        { id: 1, name: "S1", type: "compute" as const, provider: "AWS", status: "down" as const, monthlyCost: 100, sla: 99.9, uptime: 0 },
        { id: 2, name: "S2", type: "storage" as const, provider: "AWS", status: "healthy" as const, monthlyCost: 50, sla: 99.9, uptime: 99.99 }
      ];

      expect(getSystemHealthStatus(healthyServices)).toBe("healthy");
      expect(getSystemHealthStatus(degradedServices)).toBe("degraded");
      expect(getSystemHealthStatus(criticalServices)).toBe("critical");
    });

    it("should create tech asset data", () => {
      const asset = createTechAssetData("MacBook Pro", "hardware", "Apple", 2500, 0);

      expect(asset.name).toBe("MacBook Pro");
      expect(asset.type).toBe("hardware");
      expect(asset.vendor).toBe("Apple");
      expect(asset.cost).toBe(2500);
      expect(asset.recurringCost).toBe(0);
      expect(asset.status).toBe("active");
    });

    it("should create integration data", () => {
      const integration = createIntegrationData(
        "CRM Sync",
        "api",
        "Salesforce",
        "Internal DB",
        "hourly"
      );

      expect(integration.name).toBe("CRM Sync");
      expect(integration.type).toBe("api");
      expect(integration.sourceSystem).toBe("Salesforce");
      expect(integration.targetSystem).toBe("Internal DB");
      expect(integration.frequency).toBe("hourly");
      expect(integration.status).toBe("active");
    });
  });

  describe("Core Admin Layer Summary", () => {
    it("should return correct summary", () => {
      const summary = getCoreAdminLayerSummary();

      expect(summary.modules).toContain("Finance & Grants");
      expect(summary.modules).toContain("HR & Identity");
      expect(summary.modules).toContain("Legal & Contracts");
      expect(summary.modules).toContain("Technology & Infrastructure");
      expect(summary.financeAccountTypes).toContain("asset");
      expect(summary.grantStatuses).toContain("active");
      expect(summary.employeeStatuses).toContain("active");
      expect(summary.contractTypes).toContain("vendor");
      expect(summary.techAssetTypes).toContain("hardware");
    });
  });
});
