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
import { eq, and, gte, lte, desc } from "drizzle-orm";

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

export const dataExportRouter = router({
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
        conditions.push(gte(timeEntries.entryDate, input.startDate));
      }
      if (input.endDate) {
        conditions.push(lte(timeEntries.entryDate, input.endDate));
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
              e.entryDate,
              e.hoursWorked || "0",
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
              worker?.employeeId || worker?.id?.toString() || "",
              code?.code || "",
              e.entryDate,
              e.hoursWorked || "0",
              e.overtimeHours || "0",
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
              worker?.employeeId || worker?.id?.toString() || "",
              e.entryDate,
              e.hoursWorked || "0",
              e.overtimeHours || "0",
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
              e.hoursWorked || "0",
              e.entryDate,
              e.entryDate,
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
              e.entryDate,
              e.hoursWorked || "0",
              e.overtimeHours || "0",
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
          csvData = workers.map((w) => [
            w.firstName,
            w.lastName,
            w.email || "",
            w.hourlyRate || "",
            w.startDate || "",
          ]);
          break;

        case "adp":
          headers = ["Employee ID", "First Name", "Last Name", "Email", "Department", "Hourly Rate"];
          csvData = workers.map((w) => [
            w.employeeId || w.id.toString(),
            w.firstName,
            w.lastName,
            w.email || "",
            w.department || "",
            w.hourlyRate || "",
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
          csvData = workers.map((w) => [
            w.id.toString(),
            w.employeeId || "",
            w.firstName,
            w.lastName,
            w.email || "",
            w.workerType,
            w.department || "",
            w.position || "",
            w.hourlyRate || "",
            w.standardHoursPerWeek?.toString() || "40",
            w.startDate || "",
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
    const fundingSources = await db.select().from(timekeepingFundingSources);
    const fsMap = new Map(fundingSources.map((fs) => [fs.id, fs]));

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

    const csvData = codes.map((c) => {
      const fs = c.fundingSourceId ? fsMap.get(c.fundingSourceId) : null;
      return [
        c.code,
        c.name,
        c.description || "",
        fs?.code || "",
        fs?.name || "",
        c.budgetedHours || "",
        c.hourlyRate || "",
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

    const csvData = sources.map((s) => [
      s.code,
      s.name,
      s.type,
      s.funderName || "",
      s.totalBudget || "",
      s.laborBudget || "",
      s.startDate || "",
      s.endDate || "",
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
          "2. In Costpoint, navigate to Time & Expense > Import Timesheets",
          "3. Select 'CSV Import' and upload the file",
          "4. Validate charge codes match your Costpoint setup",
          "5. Submit for approval workflow",
        ],
        dataMapping: {
          "Employee ID": "Maps to Costpoint Employee ID",
          "Charge Code": "Maps to Project/Task/Org structure",
          "Regular Hours": "Maps to straight time",
          "OT Hours": "Maps to overtime categories",
        },
        website: "https://www.deltek.com/en/products/project-erp/costpoint",
        complianceNotes: "Ensure charge codes align with your indirect rate structure for DCAA compliance",
      },
      {
        id: "gusto",
        name: "Gusto Payroll",
        category: "Payroll Processing",
        description: "Modern payroll platform for small to medium businesses",
        exportFormats: ["gusto"],
        importInstructions: [
          "1. Export worker data using 'Gusto' format",
          "2. In Gusto, go to People > Add employees > Bulk import",
          "3. For time entries, use Gusto's time tracking integration",
          "4. Or manually enter hours from your export",
        ],
        dataMapping: {
          "Employee Email": "Primary identifier in Gusto",
          "Hours Worked": "Maps to regular hours",
          "Pay Period": "Maps to pay period dates",
        },
        website: "https://gusto.com",
      },
      {
        id: "adp",
        name: "ADP Workforce Now",
        category: "Enterprise HR & Payroll",
        description: "Comprehensive HR and payroll solution for larger organizations",
        exportFormats: ["adp"],
        importInstructions: [
          "1. Export data using 'ADP Workforce' format",
          "2. In ADP, go to Payroll > Import Hours",
          "3. Use the ADP Data Import tool to map columns",
          "4. Validate employee IDs match ADP records",
        ],
        dataMapping: {
          "Employee ID": "Maps to ADP File Number",
          "Regular Hours": "Maps to REG earnings code",
          "Overtime Hours": "Maps to OT earnings code",
          "Department": "Maps to ADP department code",
        },
        website: "https://www.adp.com",
      },
      {
        id: "sage",
        name: "Sage Intacct",
        category: "Nonprofit Accounting",
        description: "Cloud financial management for nonprofits with grant tracking",
        exportFormats: ["generic_csv"],
        importInstructions: [
          "1. Export data using 'Generic CSV' format",
          "2. In Sage Intacct, go to Company > Import Data",
          "3. Select 'Time & Expense' import template",
          "4. Map columns to Sage Intacct fields",
          "5. Assign to appropriate grant/fund dimensions",
        ],
        dataMapping: {
          "Charge Code": "Maps to Project/Grant dimension",
          "Hours": "Maps to quantity for time entries",
          "Worker": "Maps to Employee record",
        },
        website: "https://www.sage.com/en-us/products/sage-intacct/",
        complianceNotes: "Ideal for nonprofit grant tracking and fund accounting",
      },
      {
        id: "bamboohr",
        name: "BambooHR",
        category: "Human Resources",
        description: "HR software for employee management and onboarding",
        exportFormats: ["generic_csv"],
        importInstructions: [
          "1. Export worker data using 'Generic CSV' format",
          "2. In BambooHR, go to Settings > Data Import",
          "3. Upload CSV and map to BambooHR fields",
          "4. Review and confirm employee records",
        ],
        dataMapping: {
          "First Name": "Maps to First Name field",
          "Last Name": "Maps to Last Name field",
          "Email": "Maps to Work Email",
          "Start Date": "Maps to Hire Date",
          "Department": "Maps to Department field",
        },
        website: "https://www.bamboohr.com",
      },
    ];
  }),
});
