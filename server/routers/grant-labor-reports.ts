import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  timeEntries,
  chargeCodes,
  timekeepingWorkers,
  fundingSources,
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

// Grant Labor Cost Report Types
interface LaborCostEntry {
  workerId: number;
  workerName: string;
  workerType: "employee" | "contractor" | "volunteer";
  chargeCode: string;
  chargeCodeName: string;
  fundingSource: string;
  fundingSourceId: number;
  hours: number;
  hourlyRate: number;
  totalCost: number;
  date: string;
}

interface LaborCostSummary {
  fundingSourceId: number;
  fundingSource: string;
  totalHours: number;
  totalCost: number;
  employeeHours: number;
  employeeCost: number;
  contractorHours: number;
  contractorCost: number;
  chargeCodeBreakdown: {
    chargeCode: string;
    chargeCodeName: string;
    hours: number;
    cost: number;
  }[];
  workerBreakdown: {
    workerId: number;
    workerName: string;
    workerType: string;
    hours: number;
    cost: number;
  }[];
}

export const grantLaborReportsRouter = router({
  // Get labor costs by funding source for a date range
  getLaborCostsByFundingSource: publicProcedure
    .input(
      z.object({
        fundingSourceId: z.number().optional(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const { fundingSourceId, startDate, endDate } = input;

      // Build the query using correct schema column names
      // Worker name is firstName + lastName, not a single name field
      const entries = await db
        .select({
          entryId: timeEntries.id,
          workerId: timeEntries.workerId,
          chargeCodeId: timeEntries.chargeCodeId,
          hours: timeEntries.hoursWorked,
          hourlyRate: timeEntries.billingRate,
          date: timeEntries.entryDate,
          workerFirstName: timekeepingWorkers.firstName,
          workerLastName: timekeepingWorkers.lastName,
          workerType: timekeepingWorkers.workerType,
          chargeCode: chargeCodes.code,
          chargeCodeName: chargeCodes.name,
          fundingSourceId: chargeCodes.fundingSourceId,
          fundingSourceName: fundingSources.name,
        })
        .from(timeEntries)
        .innerJoin(timekeepingWorkers, eq(timeEntries.workerId, timekeepingWorkers.id))
        .innerJoin(chargeCodes, eq(timeEntries.chargeCodeId, chargeCodes.id))
        .innerJoin(fundingSources, eq(chargeCodes.fundingSourceId, fundingSources.id))
        .where(
          and(
            gte(timeEntries.entryDate, new Date(startDate)),
            lte(timeEntries.entryDate, new Date(endDate)),
            fundingSourceId ? eq(chargeCodes.fundingSourceId, fundingSourceId) : undefined
          )
        )
        .orderBy(desc(timeEntries.entryDate));

      // Transform to LaborCostEntry format
      return entries.map((entry): LaborCostEntry => ({
        workerId: entry.workerId,
        workerName: `${entry.workerFirstName} ${entry.workerLastName}`,
        workerType: entry.workerType as "employee" | "contractor" | "volunteer",
        chargeCode: entry.chargeCode,
        chargeCodeName: entry.chargeCodeName,
        fundingSource: entry.fundingSourceName,
        fundingSourceId: entry.fundingSourceId || 0,
        hours: Number(entry.hours),
        hourlyRate: Number(entry.hourlyRate || 0),
        totalCost: Number(entry.hours) * Number(entry.hourlyRate || 0),
        date: entry.date instanceof Date ? entry.date.toISOString().split('T')[0] : String(entry.date),
      }));
    }),

  // Get summary report by funding source
  getLaborCostSummary: publicProcedure
    .input(
      z.object({
        fundingSourceId: z.number().optional(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const { fundingSourceId, startDate, endDate } = input;

      // Get all entries for the period
      const entries = await db
        .select({
          workerId: timeEntries.workerId,
          chargeCodeId: timeEntries.chargeCodeId,
          hours: timeEntries.hoursWorked,
          hourlyRate: timeEntries.billingRate,
          workerFirstName: timekeepingWorkers.firstName,
          workerLastName: timekeepingWorkers.lastName,
          workerType: timekeepingWorkers.workerType,
          chargeCode: chargeCodes.code,
          chargeCodeName: chargeCodes.name,
          fundingSourceId: chargeCodes.fundingSourceId,
          fundingSourceName: fundingSources.name,
        })
        .from(timeEntries)
        .innerJoin(timekeepingWorkers, eq(timeEntries.workerId, timekeepingWorkers.id))
        .innerJoin(chargeCodes, eq(timeEntries.chargeCodeId, chargeCodes.id))
        .innerJoin(fundingSources, eq(chargeCodes.fundingSourceId, fundingSources.id))
        .where(
          and(
            gte(timeEntries.entryDate, new Date(startDate)),
            lte(timeEntries.entryDate, new Date(endDate)),
            fundingSourceId ? eq(chargeCodes.fundingSourceId, fundingSourceId) : undefined
          )
        );

      // Group by funding source
      const summaryMap = new Map<number, LaborCostSummary>();

      entries.forEach((entry) => {
        const fsId = entry.fundingSourceId || 0;
        const hours = Number(entry.hours);
        const cost = hours * Number(entry.hourlyRate || 0);
        const isEmployee = entry.workerType === "employee";

        if (!summaryMap.has(fsId)) {
          summaryMap.set(fsId, {
            fundingSourceId: fsId,
            fundingSource: entry.fundingSourceName,
            totalHours: 0,
            totalCost: 0,
            employeeHours: 0,
            employeeCost: 0,
            contractorHours: 0,
            contractorCost: 0,
            chargeCodeBreakdown: [],
            workerBreakdown: [],
          });
        }

        const summary = summaryMap.get(fsId)!;
        summary.totalHours += hours;
        summary.totalCost += cost;

        if (isEmployee) {
          summary.employeeHours += hours;
          summary.employeeCost += cost;
        } else {
          summary.contractorHours += hours;
          summary.contractorCost += cost;
        }

        // Update charge code breakdown
        const ccIndex = summary.chargeCodeBreakdown.findIndex(
          (cc) => cc.chargeCode === entry.chargeCode
        );
        if (ccIndex === -1) {
          summary.chargeCodeBreakdown.push({
            chargeCode: entry.chargeCode,
            chargeCodeName: entry.chargeCodeName,
            hours,
            cost,
          });
        } else {
          summary.chargeCodeBreakdown[ccIndex].hours += hours;
          summary.chargeCodeBreakdown[ccIndex].cost += cost;
        }

        // Update worker breakdown
        const workerName = `${entry.workerFirstName} ${entry.workerLastName}`;
        const wIndex = summary.workerBreakdown.findIndex(
          (w) => w.workerId === entry.workerId
        );
        if (wIndex === -1) {
          summary.workerBreakdown.push({
            workerId: entry.workerId,
            workerName,
            workerType: entry.workerType,
            hours,
            cost,
          });
        } else {
          summary.workerBreakdown[wIndex].hours += hours;
          summary.workerBreakdown[wIndex].cost += cost;
        }
      });

      return Array.from(summaryMap.values());
    }),

  // Get all funding sources for filter dropdown
  getFundingSources: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const sources = await db
      .select({
        id: fundingSources.id,
        name: fundingSources.name,
        type: fundingSources.type,
        status: fundingSources.status,
      })
      .from(fundingSources)
      .where(eq(fundingSources.status, "active"));

    return sources;
  }),

  // Generate report data for PDF export
  generateReportData: publicProcedure
    .input(
      z.object({
        fundingSourceId: z.number().optional(),
        startDate: z.string(),
        endDate: z.string(),
        reportType: z.enum(["summary", "detailed", "by_worker", "by_charge_code"]),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          reportTitle: "Grant Labor Cost Report",
          dateRange: { start: input.startDate, end: input.endDate },
          fundingSource: "All Funding Sources",
          generatedAt: new Date().toISOString(),
          summary: {
            totalHours: 0,
            totalCost: 0,
            employeeHours: 0,
            employeeCost: 0,
            contractorHours: 0,
            contractorCost: 0,
          },
          details: [] as Array<{
            date: string;
            workerName: string;
            workerType: string;
            chargeCode: string;
            chargeCodeName: string;
            fundingSource: string;
            hours: number;
            hourlyRate: number;
            totalCost: number;
          }>,
        };
      }

      const { fundingSourceId, startDate, endDate } = input;

      // Get funding source name if specified
      let fundingSourceName = "All Funding Sources";
      if (fundingSourceId) {
        const fs = await db
          .select({ name: fundingSources.name })
          .from(fundingSources)
          .where(eq(fundingSources.id, fundingSourceId))
          .limit(1);
        if (fs.length > 0) {
          fundingSourceName = fs[0].name;
        }
      }

      // Get all entries
      const entries = await db
        .select({
          workerId: timeEntries.workerId,
          hours: timeEntries.hoursWorked,
          hourlyRate: timeEntries.billingRate,
          date: timeEntries.entryDate,
          workerFirstName: timekeepingWorkers.firstName,
          workerLastName: timekeepingWorkers.lastName,
          workerType: timekeepingWorkers.workerType,
          chargeCode: chargeCodes.code,
          chargeCodeName: chargeCodes.name,
          fundingSourceName: fundingSources.name,
        })
        .from(timeEntries)
        .innerJoin(timekeepingWorkers, eq(timeEntries.workerId, timekeepingWorkers.id))
        .innerJoin(chargeCodes, eq(timeEntries.chargeCodeId, chargeCodes.id))
        .innerJoin(fundingSources, eq(chargeCodes.fundingSourceId, fundingSources.id))
        .where(
          and(
            gte(timeEntries.entryDate, new Date(startDate)),
            lte(timeEntries.entryDate, new Date(endDate)),
            fundingSourceId ? eq(chargeCodes.fundingSourceId, fundingSourceId) : undefined
          )
        )
        .orderBy(desc(timeEntries.entryDate));

      // Calculate summary
      let totalHours = 0;
      let totalCost = 0;
      let employeeHours = 0;
      let employeeCost = 0;
      let contractorHours = 0;
      let contractorCost = 0;

      const details = entries.map((entry) => {
        const hours = Number(entry.hours);
        const rate = Number(entry.hourlyRate || 0);
        const cost = hours * rate;

        totalHours += hours;
        totalCost += cost;

        if (entry.workerType === "employee") {
          employeeHours += hours;
          employeeCost += cost;
        } else {
          contractorHours += hours;
          contractorCost += cost;
        }

        return {
          date: entry.date instanceof Date ? entry.date.toISOString().split('T')[0] : String(entry.date),
          workerName: `${entry.workerFirstName} ${entry.workerLastName}`,
          workerType: entry.workerType,
          chargeCode: entry.chargeCode,
          chargeCodeName: entry.chargeCodeName,
          fundingSource: entry.fundingSourceName,
          hours,
          hourlyRate: rate,
          totalCost: cost,
        };
      });

      return {
        reportTitle: "Grant Labor Cost Report",
        dateRange: { start: startDate, end: endDate },
        fundingSource: fundingSourceName,
        generatedAt: new Date().toISOString(),
        summary: {
          totalHours,
          totalCost,
          employeeHours,
          employeeCost,
          contractorHours,
          contractorCost,
        },
        details,
      };
    }),

  // Get report templates
  getReportTemplates: publicProcedure.query(() => {
    return [
      {
        id: "federal_sf425",
        name: "SF-425 Federal Financial Report",
        description: "Standard form for federal grant financial reporting",
        fields: ["personnel_costs", "fringe_benefits", "travel", "equipment", "supplies", "contractual", "other", "indirect_costs"],
      },
      {
        id: "dol_eta_9130",
        name: "DOL ETA-9130",
        description: "Department of Labor financial status report",
        fields: ["participant_wages", "staff_salaries", "fringe_benefits", "travel", "equipment", "supplies", "other"],
      },
      {
        id: "standard_labor",
        name: "Standard Labor Cost Report",
        description: "General labor cost breakdown by funding source",
        fields: ["employee_hours", "employee_cost", "contractor_hours", "contractor_cost", "total_hours", "total_cost"],
      },
      {
        id: "charge_code_detail",
        name: "Charge Code Detail Report",
        description: "Detailed breakdown by charge code and project",
        fields: ["charge_code", "project", "hours", "rate", "cost", "worker_type"],
      },
      {
        id: "worker_summary",
        name: "Worker Summary Report",
        description: "Labor costs summarized by worker",
        fields: ["worker_name", "worker_type", "total_hours", "average_rate", "total_cost"],
      },
    ];
  }),

  // Get compliance checklist for grant labor reporting
  getComplianceChecklist: publicProcedure.query(() => {
    return [
      {
        category: "Timekeeping Requirements",
        items: [
          { id: "daily_records", label: "Daily time records maintained", required: true },
          { id: "supervisor_approval", label: "Supervisor approval on timesheets", required: true },
          { id: "charge_code_accuracy", label: "Accurate charge code allocation", required: true },
          { id: "contemporaneous", label: "Time recorded contemporaneously (not after the fact)", required: true },
        ],
      },
      {
        category: "Cost Allocation",
        items: [
          { id: "direct_costs", label: "Direct costs properly identified", required: true },
          { id: "indirect_rate", label: "Approved indirect cost rate applied", required: false },
          { id: "cost_sharing", label: "Cost sharing/match documented", required: false },
          { id: "unallowable_excluded", label: "Unallowable costs excluded", required: true },
        ],
      },
      {
        category: "Documentation",
        items: [
          { id: "pay_records", label: "Payroll records match time entries", required: true },
          { id: "rate_documentation", label: "Hourly rates documented and justified", required: true },
          { id: "contractor_invoices", label: "Contractor invoices on file", required: true },
          { id: "audit_trail", label: "Complete audit trail maintained", required: true },
        ],
      },
    ];
  }),
});
