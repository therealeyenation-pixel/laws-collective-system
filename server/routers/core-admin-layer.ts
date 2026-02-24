/**
 * Core Admin Layer Router
 * Finance & Grants, HR & Identity, Legal & Contracts, Technology & Infrastructure
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
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
} from "../services/core-admin-layer";

export const coreAdminLayerRouter = router({
  // Get summary
  getSummary: protectedProcedure.query(async () => {
    return getCoreAdminLayerSummary();
  }),

  // === FINANCE & GRANTS ===

  // Create finance account
  createAccount: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
      accountNumber: z.string(),
      initialBalance: z.number().default(0)
    }))
    .mutation(async ({ input }) => {
      const accountData = createFinanceAccountData(
        input.name,
        input.type,
        input.accountNumber,
        input.initialBalance
      );

      const result = await db.execute({
        sql: `INSERT INTO finance_accounts (name, type, account_number, balance, currency, status)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [accountData.name, accountData.type, accountData.accountNumber, accountData.balance, accountData.currency, accountData.status]
      });

      return { success: true, accountId: result.insertId };
    }),

  // Get all accounts
  getAccounts: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM finance_accounts ORDER BY type, name`
    });
    return results.rows;
  }),

  // Create grant
  createGrant: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      funder: z.string(),
      amount: z.number(),
      startDate: z.string(),
      endDate: z.string()
    }))
    .mutation(async ({ input }) => {
      const grantData = createGrantData(
        input.name,
        input.funder,
        input.amount,
        new Date(input.startDate),
        new Date(input.endDate)
      );

      const result = await db.execute({
        sql: `INSERT INTO grants_registry (name, funder, amount, start_date, end_date, status, spent_amount, remaining_amount, compliance_status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          grantData.name, grantData.funder, grantData.amount,
          input.startDate, input.endDate, grantData.status,
          grantData.spentAmount, grantData.remainingAmount, grantData.complianceStatus
        ]
      });

      return { success: true, grantId: result.insertId };
    }),

  // Get grants with analytics
  getGrants: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM grants_registry ORDER BY end_date`
    });

    return results.rows.map((row: any) => {
      const grant = {
        id: row.id,
        name: row.name,
        funder: row.funder,
        amount: row.amount,
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        status: row.status,
        spentAmount: row.spent_amount,
        remainingAmount: row.remaining_amount,
        complianceStatus: row.compliance_status
      };

      return {
        ...grant,
        burnRate: getGrantBurnRate(grant),
        projectedSpend: getGrantProjectedSpend(grant)
      };
    });
  }),

  // === HR & IDENTITY ===

  // Create employee
  createEmployee: protectedProcedure
    .input(z.object({
      employeeId: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      department: z.string(),
      position: z.string(),
      salary: z.number()
    }))
    .mutation(async ({ input }) => {
      const employeeData = createEmployeeData(
        input.employeeId,
        input.firstName,
        input.lastName,
        input.email,
        input.department,
        input.position,
        input.salary
      );

      const result = await db.execute({
        sql: `INSERT INTO hr_employees (employee_id, first_name, last_name, email, department, position, hire_date, status, salary, pay_frequency)
              VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
        args: [
          employeeData.employeeId, employeeData.firstName, employeeData.lastName,
          employeeData.email, employeeData.department, employeeData.position,
          employeeData.status, employeeData.salary, employeeData.payFrequency
        ]
      });

      return { success: true, employeeId: result.insertId };
    }),

  // Get employees with tenure
  getEmployees: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM hr_employees ORDER BY department, last_name`
    });

    return results.rows.map((row: any) => ({
      ...row,
      tenure: calculateTenure(new Date(row.hire_date))
    }));
  }),

  // Create identity record
  createIdentity: protectedProcedure
    .input(z.object({
      userId: z.number(),
      idType: z.enum(["employee_id", "member_id", "contractor_id", "visitor_id"]),
      idNumber: z.string(),
      accessLevel: z.enum(["basic", "standard", "elevated", "admin"])
    }))
    .mutation(async ({ input }) => {
      const identityData = createIdentityRecordData(
        input.userId,
        input.idType,
        input.idNumber,
        input.accessLevel
      );

      const result = await db.execute({
        sql: `INSERT INTO identity_records (user_id, id_type, id_number, issued_date, expiry_date, status, access_level)
              VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
        args: [
          identityData.userId, identityData.idType, identityData.idNumber,
          identityData.expiryDate?.toISOString(), identityData.status, identityData.accessLevel
        ]
      });

      return { success: true, identityId: result.insertId };
    }),

  // Submit time off request
  submitTimeOff: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      type: z.enum(["vacation", "sick", "personal", "bereavement", "jury_duty"]),
      startDate: z.string(),
      endDate: z.string(),
      notes: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const days = calculateTimeOffDays(new Date(input.startDate), new Date(input.endDate));

      const result = await db.execute({
        sql: `INSERT INTO time_off_requests (employee_id, type, start_date, end_date, status, notes, days_requested)
              VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
        args: [input.employeeId, input.type, input.startDate, input.endDate, input.notes || null, days]
      });

      return { success: true, requestId: result.insertId, daysRequested: days };
    }),

  // === LEGAL & CONTRACTS ===

  // Create contract
  createContract: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      type: z.enum(["employment", "vendor", "client", "partnership", "nda", "lease"]),
      parties: z.array(z.string()),
      startDate: z.string(),
      endDate: z.string().optional(),
      value: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const contractData = createContractData(
        input.title,
        input.type,
        input.parties,
        new Date(input.startDate),
        input.endDate ? new Date(input.endDate) : undefined,
        input.value
      );

      const result = await db.execute({
        sql: `INSERT INTO legal_contracts (title, type, parties, start_date, end_date, value, status)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          contractData.title, contractData.type, JSON.stringify(contractData.parties),
          input.startDate, input.endDate || null, contractData.value || null, contractData.status
        ]
      });

      return { success: true, contractId: result.insertId };
    }),

  // Get contracts with expiry alerts
  getContracts: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM legal_contracts ORDER BY end_date`
    });

    return results.rows.map((row: any) => {
      const contract = {
        id: row.id,
        title: row.title,
        type: row.type,
        parties: JSON.parse(row.parties || "[]"),
        startDate: new Date(row.start_date),
        endDate: row.end_date ? new Date(row.end_date) : undefined,
        value: row.value,
        status: row.status,
        signedDate: row.signed_date ? new Date(row.signed_date) : undefined,
        documentUrl: row.document_url
      };

      return {
        ...contract,
        isExpiringSoon: isContractExpiring(contract, 30),
        isExpiring60Days: isContractExpiring(contract, 60)
      };
    });
  }),

  // Create compliance requirement
  createCompliance: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      category: z.enum(["federal", "state", "local", "industry"]),
      description: z.string(),
      dueDate: z.string(),
      frequency: z.enum(["one_time", "monthly", "quarterly", "annual"]),
      responsibleParty: z.number()
    }))
    .mutation(async ({ input }) => {
      const complianceData = createComplianceRequirementData(
        input.name,
        input.category,
        input.description,
        new Date(input.dueDate),
        input.frequency,
        input.responsibleParty
      );

      const result = await db.execute({
        sql: `INSERT INTO compliance_requirements (name, category, description, due_date, frequency, status, responsible_party)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          complianceData.name, complianceData.category, complianceData.description,
          input.dueDate, complianceData.frequency, complianceData.status, complianceData.responsibleParty
        ]
      });

      return { success: true, complianceId: result.insertId };
    }),

  // Get compliance requirements with overdue check
  getComplianceRequirements: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM compliance_requirements ORDER BY due_date`
    });

    return results.rows.map((row: any) => {
      const requirement = {
        id: row.id,
        name: row.name,
        category: row.category,
        description: row.description,
        dueDate: new Date(row.due_date),
        frequency: row.frequency,
        status: row.status,
        responsibleParty: row.responsible_party
      };

      return {
        ...requirement,
        isOverdue: isComplianceOverdue(requirement)
      };
    });
  }),

  // === TECHNOLOGY & INFRASTRUCTURE ===

  // Create tech asset
  createTechAsset: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(["hardware", "software", "service", "license"]),
      vendor: z.string(),
      cost: z.number(),
      recurringCost: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const assetData = createTechAssetData(
        input.name,
        input.type,
        input.vendor,
        input.cost,
        input.recurringCost
      );

      const result = await db.execute({
        sql: `INSERT INTO tech_assets (name, type, vendor, purchase_date, cost, recurring_cost, status)
              VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
        args: [assetData.name, assetData.type, assetData.vendor, assetData.cost, assetData.recurringCost || null, assetData.status]
      });

      return { success: true, assetId: result.insertId };
    }),

  // Get tech assets with depreciation
  getTechAssets: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM tech_assets ORDER BY type, name`
    });

    return results.rows.map((row: any) => {
      const asset = {
        id: row.id,
        name: row.name,
        type: row.type,
        vendor: row.vendor,
        purchaseDate: new Date(row.purchase_date),
        expiryDate: row.expiry_date ? new Date(row.expiry_date) : undefined,
        cost: row.cost,
        recurringCost: row.recurring_cost,
        status: row.status,
        assignedTo: row.assigned_to
      };

      const usefulLife = asset.type === "hardware" ? 5 : asset.type === "software" ? 3 : 1;

      return {
        ...asset,
        currentValue: calculateTechAssetDepreciation(asset, usefulLife)
      };
    });
  }),

  // Create system integration
  createIntegration: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(["api", "database", "file_transfer", "webhook"]),
      sourceSystem: z.string(),
      targetSystem: z.string(),
      frequency: z.enum(["realtime", "hourly", "daily", "weekly"])
    }))
    .mutation(async ({ input }) => {
      const integrationData = createIntegrationData(
        input.name,
        input.type,
        input.sourceSystem,
        input.targetSystem,
        input.frequency
      );

      const result = await db.execute({
        sql: `INSERT INTO system_integrations (name, type, source_system, target_system, status, frequency)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          integrationData.name, integrationData.type, integrationData.sourceSystem,
          integrationData.targetSystem, integrationData.status, integrationData.frequency
        ]
      });

      return { success: true, integrationId: result.insertId };
    }),

  // Get admin layer dashboard
  getDashboard: protectedProcedure.query(async () => {
    // Finance summary
    const accounts = await db.execute({ sql: `SELECT SUM(balance) as total, type FROM finance_accounts WHERE status = 'active' GROUP BY type` });
    const grants = await db.execute({ sql: `SELECT COUNT(*) as count, status FROM grants_registry GROUP BY status` });

    // HR summary
    const employees = await db.execute({ sql: `SELECT COUNT(*) as count, status FROM hr_employees GROUP BY status` });
    const timeOff = await db.execute({ sql: `SELECT COUNT(*) as count FROM time_off_requests WHERE status = 'pending'` });

    // Legal summary
    const contracts = await db.execute({ sql: `SELECT COUNT(*) as count, status FROM legal_contracts GROUP BY status` });
    const compliance = await db.execute({ sql: `SELECT COUNT(*) as count FROM compliance_requirements WHERE status != 'completed' AND due_date < NOW()` });

    // Tech summary
    const assets = await db.execute({ sql: `SELECT COUNT(*) as count, type FROM tech_assets WHERE status = 'active' GROUP BY type` });
    const integrations = await db.execute({ sql: `SELECT COUNT(*) as count, status FROM system_integrations GROUP BY status` });

    return {
      finance: {
        accountsByType: accounts.rows,
        grantsByStatus: grants.rows
      },
      hr: {
        employeesByStatus: employees.rows,
        pendingTimeOff: (timeOff.rows[0] as any)?.count || 0
      },
      legal: {
        contractsByStatus: contracts.rows,
        overdueCompliance: (compliance.rows[0] as any)?.count || 0
      },
      tech: {
        assetsByType: assets.rows,
        integrationsByStatus: integrations.rows
      }
    };
  })
});
