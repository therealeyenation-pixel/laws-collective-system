import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  timekeepingWorkers,
  timeEntries,
  chargeCodes,
  fundingSources,
  timesheets,
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

// Export formats for different external systems
const EXPORT_FORMATS = {
  quickbooks_time: {
    name: "QuickBooks Time",
    description: "Compatible with QuickBooks Time (formerly TSheets)",
    fields: ["Employee", "Date", "Hours", "Project", "Notes"],
  },
  deltek: {
    name: "Deltek Costpoint",
    description: "DCAA-compliant format for federal contracts",
    fields: ["Employee ID", "Charge Code", "Date", "Regular Hours", "OT Hours", "Description"],
  },
  adp: {
    name: "ADP Workforce",
    description: "Compatible with ADP payroll processing",
    fields: ["Employee ID", "Pay Period", "Regular Hours", "Overtime Hours", "Department"],
  },
  gusto: {
    name: "Gusto Payroll",
    description: "Compatible with Gusto payroll import",
    fields: ["Employee Email", "Hours Worked", "Pay Period Start", "Pay Period End"],
  },
  generic_csv: {
    name: "Generic CSV",
    description: "Universal CSV format for any system",
    fields: ["All available fields"],
  },
};

// Helper to convert any value to string for CSV
function toStr(val: any): string {
  if (val === null || val === undefined) return "";
  if (val instanceof Date) return val.toISOString().split("T")[0];
  return String(val);
}

export const dataExportRouter = router({
  // Export system architecture data as JSON
  exportSystemArchitecture: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get all entities
    const { companyEntities, houses, tokenBalances, luvLedgerTransactions } = await import("../../drizzle/schema");
    
    const entities = await db.select().from(companyEntities);
    const housesData = await db.select().from(houses);
    const tokens = await db.select().from(tokenBalances);
    const recentTransactions = await db.select().from(luvLedgerTransactions).limit(100);

    const systemArchitecture = {
      system_name: "LuvOnPurpose Autonomous Wealth System",
      tagline: "Building Multi-Generational Wealth Through Purpose & Community",
      export_date: new Date().toISOString(),
      entities: entities.map(e => ({
        id: e.id,
        name: e.name,
        type: e.entityType,
        allocation: e.allocationPercentage,
        status: e.status,
      })),
      houses: housesData.map(h => ({
        id: h.id,
        name: h.name,
        status: h.status,
      })),
      token_economy: {
        total_supply: 2000000,
        distribution: {
          commercial: "40%",
          education: "30%",
          media: "20%",
          platform: "10%",
        },
        balances: tokens.map(t => ({
          entityId: t.entityId,
          balance: t.balance,
        })),
      },
      recent_transactions: recentTransactions.length,
      framework: {
        L: "Land - Reconnection & Stability",
        A: "Air - Education & Knowledge",
        W: "Water - Healing & Balance",
        S: "Self - Purpose & Skills",
      },
    };

    return systemArchitecture;
  }),

  // Export LuvLedger summary
  exportLuvLedgerSummary: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const { luvLedgerTransactions, tokenBalances, companyEntities } = await import("../../drizzle/schema");
    
    const transactions = await db.select().from(luvLedgerTransactions);
    const balances = await db.select().from(tokenBalances);
    const entities = await db.select().from(companyEntities);

    const entityMap = new Map(entities.map(e => [e.id, e.name]));

    return {
      export_date: new Date().toISOString(),
      summary: {
        total_transactions: transactions.length,
        total_token_supply: 2000000,
        active_entities: entities.length,
      },
      balances: balances.map(b => ({
        entity: entityMap.get(b.entityId) || `Entity ${b.entityId}`,
        balance: b.balance,
        lastUpdated: b.updatedAt,
      })),
      transactions: transactions.slice(0, 100).map(t => ({
        id: t.id,
        type: t.transactionType,
        amount: t.amount,
        description: t.description,
        date: t.createdAt,
      })),
    };
  }),

  // Get available export formats
  getExportFormats: publicProcedure.query(() => {
    return Object.entries(EXPORT_FORMATS).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }),

  // Export timekeeping data
  exportTimekeeping: publicProcedure
    .input(
      z.object({
        format: z.enum(["quickbooks_time", "deltek", "adp", "gusto", "generic_csv"]),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        workerId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Build query conditions
      const conditions: any[] = [];
      if (input.startDate) {
        conditions.push(sql`${timeEntries.entryDate} >= ${input.startDate}`);
      }
      if (input.endDate) {
        conditions.push(sql`${timeEntries.entryDate} <= ${input.endDate}`);
      }
      if (input.workerId) {
        conditions.push(eq(timeEntries.workerId, input.workerId));
      }

      // Fetch time entries with related data
      const entries = await db
        .select({
          id: timeEntries.id,
          workerId: timeEntries.workerId,
          chargeCodeId: timeEntries.chargeCodeId,
          entryDate: timeEntries.entryDate,
          hoursWorked: timeEntries.hoursWorked,
          overtimeHours: timeEntries.overtimeHours,
          description: timeEntries.description,
          isBillable: timeEntries.isBillable,
        })
        .from(timeEntries)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(timeEntries.entryDate));

      // Fetch workers and charge codes for mapping
      const workers = await db.select().from(timekeepingWorkers);
      const codes = await db.select().from(chargeCodes);

      const workerMap = new Map(workers.map((w) => [w.id, w]));
      const codeMap = new Map(codes.map((c) => [c.id, c]));

      // Format data based on export type
      let csvData: string[][] = [];
      let headers: string[] = [];

      switch (input.format) {
        case "quickbooks_time":
          headers = ["Employee", "Date", "Hours", "Project", "Notes"];
          csvData = entries.map((e) => {
            const worker = workerMap.get(e.workerId);
            const code = codeMap.get(e.chargeCodeId);
            return [
              worker ? `${worker.firstName} ${worker.lastName}` : "",
              toStr(e.entryDate),
              toStr(e.hoursWorked) || "0",
              code?.name || "",
              e.description || "",
            ];
          });
          break;

        case "deltek":
          headers = ["Employee ID", "Charge Code", "Date", "Regular Hours", "OT Hours", "Description"];
          csvData = entries.map((e) => {
            const worker = workerMap.get(e.workerId);
            const code = codeMap.get(e.chargeCodeId);
            return [
              toStr((worker as any)?.employeeId || worker?.id),
              code?.code || "",
              toStr(e.entryDate),
              toStr(e.hoursWorked) || "0",
              toStr(e.overtimeHours) || "0",
              e.description || "",
            ];
          });
          break;

        case "adp":
          headers = ["Employee ID", "Pay Period", "Regular Hours", "Overtime Hours", "Department"];
          csvData = entries.map((e) => {
            const worker = workerMap.get(e.workerId);
            const code = codeMap.get(e.chargeCodeId);
            return [
              toStr((worker as any)?.employeeId || worker?.id),
              toStr(e.entryDate),
              toStr(e.hoursWorked) || "0",
              toStr(e.overtimeHours) || "0",
              code?.name || "General",
            ];
          });
          break;

        case "gusto":
          headers = ["Employee Email", "Hours Worked", "Pay Period Start", "Pay Period End"];
          csvData = entries.map((e) => {
            const worker = workerMap.get(e.workerId);
            return [
              worker?.email || "",
              toStr(e.hoursWorked) || "0",
              toStr(e.entryDate),
              toStr(e.entryDate),
            ];
          });
          break;

        case "generic_csv":
        default:
          headers = [
            "Entry ID",
            "Worker ID",
            "Worker Name",
            "Worker Type",
            "Worker Email",
            "Charge Code",
            "Charge Code Name",
            "Date",
            "Hours Worked",
            "Overtime Hours",
            "Is Billable",
            "Description",
          ];
          csvData = entries.map((e) => {
            const worker = workerMap.get(e.workerId);
            const code = codeMap.get(e.chargeCodeId);
            return [
              e.id.toString(),
              e.workerId.toString(),
              worker ? `${worker.firstName} ${worker.lastName}` : "",
              worker?.workerType || "",
              worker?.email || "",
              code?.code || "",
              code?.name || "",
              toStr(e.entryDate),
              toStr(e.hoursWorked) || "0",
              toStr(e.overtimeHours) || "0",
              e.isBillable ? "Yes" : "No",
              e.description || "",
            ];
          });
          break;
      }

      // Convert to CSV string
      const escapeCSV = (val: string) => {
        if (val.includes(",") || val.includes('"') || val.includes("\n")) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      };

      const csvContent = [
        headers.map(escapeCSV).join(","),
        ...csvData.map((row) => row.map(escapeCSV).join(",")),
      ].join("\n");

      return {
        filename: `timekeeping_export_${input.format}_${new Date().toISOString().split("T")[0]}.csv`,
        content: csvContent,
        format: EXPORT_FORMATS[input.format],
        recordCount: entries.length,
      };
    }),

  // Export workers/employees data
  exportWorkers: publicProcedure
    .input(
      z.object({
        format: z.enum(["gusto", "adp", "generic_csv"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const workers = await db.select().from(timekeepingWorkers);

      let csvData: string[][] = [];
      let headers: string[] = [];

      switch (input.format) {
        case "gusto":
          headers = ["First Name", "Last Name", "Email", "Hourly Rate", "Start Date"];
          csvData = workers.map((w: any) => [
            w.firstName,
            w.lastName,
            w.email || "",
            toStr(w.hourlyRate),
            toStr(w.startDate),
          ]);
          break;

        case "adp":
          headers = ["Employee ID", "First Name", "Last Name", "Email", "Department", "Hourly Rate"];
          csvData = workers.map((w: any) => [
            toStr(w.employeeId || w.id),
            w.firstName,
            w.lastName,
            w.email || "",
            toStr(w.departmentId) || "",
            toStr(w.hourlyRate),
          ]);
          break;

        case "generic_csv":
        default:
          headers = [
            "ID",
            "Employee ID",
            "First Name",
            "Last Name",
            "Email",
            "Worker Type",
            "Department",
            "Position",
            "Hourly Rate",
            "Standard Hours/Week",
            "Start Date",
            "Status",
          ];
          csvData = workers.map((w: any) => [
            w.id.toString(),
            toStr(w.employeeId),
            w.firstName,
            w.lastName,
            w.email || "",
            w.workerType,
            toStr(w.departmentId),
            toStr(w.positionId),
            toStr(w.hourlyRate),
            toStr(w.standardHoursPerWeek) || "40",
            toStr(w.hireDate),
            w.status,
          ]);
          break;
      }

      const escapeCSV = (val: string) => {
        if (val.includes(",") || val.includes('"') || val.includes("\n")) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      };

      const csvContent = [
        headers.map(escapeCSV).join(","),
        ...csvData.map((row) => row.map(escapeCSV).join(",")),
      ].join("\n");

      return {
        filename: `workers_export_${input.format}_${new Date().toISOString().split("T")[0]}.csv`,
        content: csvContent,
        recordCount: workers.length,
      };
    }),

  // Export charge codes
  exportChargeCodes: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const codes = await db.select().from(chargeCodes);
    const sources = await db.select().from(fundingSources);
    const fsMap = new Map(sources.map((fs) => [fs.id, fs]));

    const headers = [
      "Code",
      "Name",
      "Description",
      "Funding Source",
      "Funding Source Name",
      "Budgeted Hours",
      "Hourly Rate",
      "Is Active",
    ];

    const csvData = codes.map((c: any) => {
      const fs = c.fundingSourceId ? fsMap.get(c.fundingSourceId) : null;
      return [
        c.code,
        c.name,
        c.description || "",
        fs?.code || "",
        fs?.name || "",
        toStr(c.budgetedHours),
        toStr(c.hourlyRate),
        c.isActive ? "Yes" : "No",
      ];
    });

    const escapeCSV = (val: string) => {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...csvData.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    return {
      filename: `charge_codes_export_${new Date().toISOString().split("T")[0]}.csv`,
      content: csvContent,
      recordCount: codes.length,
    };
  }),

  // Export funding sources
  exportFundingSources: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const sources = await db.select().from(fundingSources);

    const headers = [
      "Code",
      "Name",
      "Type",
      "Funder Name",
      "Total Budget",
      "Labor Budget",
      "Start Date",
      "End Date",
      "Status",
    ];

    const csvData = sources.map((s: any) => [
      s.code,
      s.name,
      s.type,
      s.funderName || "",
      toStr(s.totalBudget),
      toStr(s.laborBudget),
      toStr(s.startDate),
      toStr(s.endDate),
      s.status,
    ]);

    const escapeCSV = (val: string) => {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...csvData.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    return {
      filename: `funding_sources_export_${new Date().toISOString().split("T")[0]}.csv`,
      content: csvContent,
      recordCount: sources.length,
    };
  }),

  // Get integration guides
  getIntegrationGuides: publicProcedure.query(() => {
    return [
      {
        id: "quickbooks",
        name: "QuickBooks Online / QuickBooks Time",
        category: "Accounting & Timekeeping",
        description: "Industry-standard accounting software with time tracking capabilities",
        exportFormats: ["quickbooks_time", "generic_csv"],
        importInstructions: [
          "1. Export timekeeping data using 'QuickBooks Time' format",
          "2. In QuickBooks, go to Payroll > Time Entries > Import",
          "3. Upload the CSV file and map columns",
          "4. Review and approve imported entries",
        ],
        dataMapping: {
          "Employee": "Maps to QuickBooks employee name",
          "Date": "Maps to time entry date",
          "Hours": "Maps to duration",
          "Project": "Maps to customer/project",
        },
        website: "https://quickbooks.intuit.com",
      },
      {
        id: "deltek",
        name: "Deltek Costpoint",
        category: "Federal Contract Accounting",
        description: "DCAA-compliant system for government contractors",
        exportFormats: ["deltek"],
        importInstructions: [
          "1. Export timekeeping data using 'Deltek Costpoint' format",
          "2. In Costpoint, navigate to Labor > Import Timesheet",
          "3. Select the CSV file and validate charge codes",
          "4. Submit for approval workflow",
        ],
        dataMapping: {
          "Employee ID": "Maps to Costpoint employee number",
          "Charge Code": "Maps to project/task code",
          "Regular Hours": "Maps to regular labor hours",
          "OT Hours": "Maps to overtime labor hours",
        },
        website: "https://www.deltek.com/en/products/project-erp/costpoint",
        complianceNotes: "DCAA-compliant timekeeping format. Ensures proper labor distribution and audit trail for federal contracts.",
      },
      {
        id: "adp",
        name: "ADP Workforce Now",
        category: "Enterprise HR & Payroll",
        description: "Enterprise payroll and HR management platform",
        exportFormats: ["adp", "generic_csv"],
        importInstructions: [
          "1. Export data using 'ADP Workforce' format",
          "2. In ADP, go to Payroll > Import Hours",
          "3. Upload the CSV and verify employee matching",
          "4. Process payroll with imported hours",
        ],
        dataMapping: {
          "Employee ID": "Maps to ADP file number",
          "Regular Hours": "Maps to regular earnings",
          "Overtime Hours": "Maps to overtime earnings",
        },
        website: "https://www.adp.com",
      },
      {
        id: "gusto",
        name: "Gusto Payroll",
        category: "Payroll Processing",
        description: "Modern payroll platform for small businesses",
        exportFormats: ["gusto", "generic_csv"],
        importInstructions: [
          "1. Export data using 'Gusto Payroll' format",
          "2. In Gusto, go to Payroll > Run Payroll",
          "3. Click 'Import hours' and upload CSV",
          "4. Review and submit payroll",
        ],
        dataMapping: {
          "Employee Email": "Matches Gusto employee by email",
          "Hours Worked": "Maps to regular hours",
        },
        website: "https://gusto.com",
      },
      {
        id: "sage",
        name: "Sage Intacct",
        category: "Nonprofit Accounting",
        description: "Cloud-based financial management for nonprofits and growing businesses",
        exportFormats: ["generic_csv"],
        importInstructions: [
          "1. Export data using 'Generic CSV' format",
          "2. In Sage Intacct, go to Applications > Imports",
          "3. Select Time & Expense import template",
          "4. Upload CSV and map fields",
        ],
        dataMapping: {
          "Employee ID": "Maps to Sage employee record",
          "Hours": "Maps to time entry hours",
          "Project": "Maps to dimension/project",
        },
        website: "https://www.sage.com/en-us/sage-intacct/",
      },
      {
        id: "bamboohr",
        name: "BambooHR",
        category: "Human Resources",
        description: "HR software for small and medium businesses",
        exportFormats: ["generic_csv"],
        importInstructions: [
          "1. Export data using 'Generic CSV' format",
          "2. In BambooHR, go to Settings > Data Import",
          "3. Select Time Off or Time Tracking import",
          "4. Upload CSV and verify mapping",
        ],
        dataMapping: {
          "Employee Email": "Matches BambooHR employee by email",
          "Hours": "Maps to time tracking hours",
          "Date": "Maps to entry date",
        },
        website: "https://www.bamboohr.com",
      },
    ];
  }),
});
