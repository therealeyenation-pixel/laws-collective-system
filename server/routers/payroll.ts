import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { calculateAllTaxes, getAllStates, getLocalitiesForState } from "./tax-calculator";
import { getDb } from "../db";
import {
  w2Workers,
  payrollRuns,
  timesheets,
  timeEntries,
  timekeepingWorkers,
  houses,
  employees,
} from "../../drizzle/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// W-2 WORKER MANAGEMENT & PAYROLL
// Employee management for House businesses
// ============================================

const PAY_FREQUENCIES = [
  { value: "weekly", label: "Weekly", periodsPerYear: 52 },
  { value: "bi_weekly", label: "Bi-Weekly", periodsPerYear: 26 },
  { value: "semi_monthly", label: "Semi-Monthly", periodsPerYear: 24 },
  { value: "monthly", label: "Monthly", periodsPerYear: 12 },
];

const FILING_STATUSES = [
  { value: "single", label: "Single" },
  { value: "married_filing_jointly", label: "Married Filing Jointly" },
  { value: "married_filing_separately", label: "Married Filing Separately" },
  { value: "head_of_household", label: "Head of Household" },
  { value: "qualifying_widow", label: "Qualifying Widow(er)" },
];

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "seasonal", label: "Seasonal" },
  { value: "temporary", label: "Temporary" },
];

// 2024 Federal Tax Brackets (simplified)
const FEDERAL_TAX_BRACKETS_2024 = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married_filing_jointly: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
};

// FICA rates 2024
const FICA_RATES = {
  socialSecurity: { rate: 0.062, wageBase: 168600 },
  medicare: { rate: 0.0145, additionalRate: 0.009, additionalThreshold: 200000 },
};

export const payrollRouter = router({
  // ============================================
  // WORKER MANAGEMENT
  // ============================================

  getWorkers: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
   if (!db) throw new Error("Database not available");
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const userId = ctx.user.id;

    const userHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.ownerUserId, userId))
      .limit(1);

    if (!userHouse.length) {
      return { workers: [], summary: null };
    }

    const workers = await db
      .select()
      .from(w2Workers)
      .where(eq(w2Workers.houseId, userHouse[0].id))
      .orderBy(w2Workers.lastName, w2Workers.firstName);

    const activeWorkers = workers.filter(w => w.status === "active");
    const totalPayroll = workers.reduce(
      (sum, w) => sum + Number(w.payRate || 0) * 2080,
      0
    );

    return {
      workers,
      summary: {
        totalWorkers: workers.length,
        activeWorkers: activeWorkers.length,
        totalAnnualPayroll: totalPayroll,
        byType: EMPLOYMENT_TYPES.map(type => ({
          ...type,
          count: workers.filter(w => w.employmentType === type.value).length,
        })),
      },
      payFrequencies: PAY_FREQUENCIES,
      filingStatuses: FILING_STATUSES,
      employmentTypes: EMPLOYMENT_TYPES,
    };
  }),

  getWorker: protectedProcedure
    .input(z.object({ workerId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
     if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const worker = await db
        .select()
        .from(w2Workers)
        .where(
          and(
            eq(w2Workers.id, input.workerId),
            eq(w2Workers.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!worker.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Worker not found" });
      }

      // Get payroll history
      const payrollHistory = await db
        .select()
        .from(payrollRuns)
        .where(eq(payrollRuns.workerId, input.workerId))
        .orderBy(desc(payrollRuns.createdAt))
        .limit(12);

      // Tax withholdings and benefits are calculated from payroll records
      // These tables can be added later for more detailed tracking

      // Calculate YTD totals
      const currentYear = new Date().getFullYear();
      const ytdPayroll = payrollHistory.filter(
        p => new Date(p.createdAt).getFullYear() === currentYear
      );
      const ytdGross = ytdPayroll.reduce((sum, p) => sum + Number(p.grossPay), 0);
      const ytdNet = ytdPayroll.reduce((sum, p) => sum + Number(p.netPay), 0);
      const ytdFederalTax = ytdPayroll.reduce(
        (sum, p) => sum + Number(p.federalTax),
        0
      );
      const ytdStateTax = ytdPayroll.reduce(
        (sum, p) => sum + Number(p.stateTax),
        0
      );
      const ytdSocialSecurity = ytdPayroll.reduce(
        (sum, p) => sum + Number(p.socialSecurity),
        0
      );
      const ytdMedicare = ytdPayroll.reduce(
        (sum, p) => sum + Number(p.medicare),
        0
      );

      return {
        worker: worker[0],
        payrollHistory,
        withholdings: null, // Calculated from payroll records
        benefits: [], // Can be added later
        ytdTotals: {
          grossPay: ytdGross,
          netPay: ytdNet,
          federalTax: ytdFederalTax,
          stateTax: ytdStateTax,
          socialSecurity: ytdSocialSecurity,
          medicare: ytdMedicare,
          totalTaxes: ytdFederalTax + ytdStateTax + ytdSocialSecurity + ytdMedicare,
        },
      };
    }),

  addWorker: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        ssn: z.string().optional(), // Should be encrypted in production
        dateOfBirth: z.date().optional(),
        streetAddress: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        hireDate: z.date(),
        employmentType: z.enum(["full_time", "part_time", "seasonal", "temporary"]),
        jobTitle: z.string().min(1),
        department: z.string().optional(),
        payFrequency: z.enum(["weekly", "bi_weekly", "semi_monthly", "monthly"]),
        hourlyRate: z.number().optional(),
        annualSalary: z.number().optional(),
        filingStatus: z.enum([
          "single",
          "married_filing_jointly",
          "married_filing_separately",
          "head_of_household",
          "qualifying_widow",
        ]),
        federalAllowances: z.number().default(0),
        stateAllowances: z.number().default(0),
        additionalWithholding: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
     if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You must activate your House before adding workers",
        });
      }

      // Add worker to database
      const result = await db.insert(w2Workers).values({
        houseId: userHouse[0].id,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        ssn: input.ssn, // Should encrypt in production
        address: input.streetAddress,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        hireDate: input.hireDate,
        employmentType: input.employmentType,
        jobTitle: input.jobTitle,
        department: input.department,
        payFrequency: input.payFrequency,
        payRate: (input.hourlyRate || (input.annualSalary ? input.annualSalary / 2080 : 0)).toString(),
        payType: input.hourlyRate ? "hourly" : "salary",
        federalFilingStatus: input.filingStatus,
        federalAllowances: input.federalAllowances,
        stateAllowances: input.stateAllowances,
      });

      return {
        success: true,
        workerId: result[0].insertId,
      };
    }),

  updateWorker: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        streetAddress: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        jobTitle: z.string().optional(),
        department: z.string().optional(),
        payFrequency: z.enum(["weekly", "bi_weekly", "semi_monthly", "monthly"]).optional(),
        hourlyRate: z.number().optional(),
        annualSalary: z.number().optional(),
        employmentStatus: z.enum(["active", "inactive", "terminated", "on_leave"]).optional(),
        terminationDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
     if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const { workerId, ...updateData } = input;

      // Build update object
      const updates: Record<string, any> = {};
      if (updateData.email !== undefined) updates.email = updateData.email;
      if (updateData.phone !== undefined) updates.phone = updateData.phone;
      if (updateData.streetAddress !== undefined) updates.address = updateData.streetAddress;
      if (updateData.city !== undefined) updates.city = updateData.city;
      if (updateData.state !== undefined) updates.state = updateData.state;
      if (updateData.zipCode !== undefined) updates.zipCode = updateData.zipCode;
      if (updateData.jobTitle !== undefined) updates.jobTitle = updateData.jobTitle;
      if (updateData.department !== undefined) updates.department = updateData.department;
      if (updateData.payFrequency !== undefined) updates.payFrequency = updateData.payFrequency;
      if (updateData.hourlyRate !== undefined) updates.payRate = updateData.hourlyRate.toString();
      if (updateData.annualSalary !== undefined) updates.payRate = (updateData.annualSalary / 2080).toString();
      if (updateData.employmentStatus !== undefined) updates.employmentStatus = updateData.employmentStatus;
      if (updateData.terminationDate !== undefined) updates.terminationDate = updateData.terminationDate;

      await db
        .update(w2Workers)
        .set(updates)
        .where(
          and(
            eq(w2Workers.id, workerId),
            eq(w2Workers.houseId, userHouse[0].id)
          )
        );

      return { success: true };
    }),

  // ============================================
  // PAYROLL PROCESSING
  // ============================================

  calculatePayroll: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        payPeriodStart: z.date(),
        payPeriodEnd: z.date(),
        hoursWorked: z.number().optional(),
        overtimeHours: z.number().default(0),
        bonusAmount: z.number().default(0),
        commissionAmount: z.number().default(0),
        deductions: z.array(z.object({
          type: z.string(),
          amount: z.number(),
        })).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
     if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const worker = await db
        .select()
        .from(w2Workers)
        .where(
          and(
            eq(w2Workers.id, input.workerId),
            eq(w2Workers.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!worker.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Worker not found" });
      }

      const w = worker[0];
      const payFrequency = PAY_FREQUENCIES.find(f => f.value === w.payFrequency);
      const periodsPerYear = payFrequency?.periodsPerYear || 26;

      // Calculate gross pay
      let regularPay = 0;
      let overtimePay = 0;

      const payRate = Number(w.payRate);
      if (w.payType === "hourly" && input.hoursWorked) {
        regularPay = Math.min(input.hoursWorked, 40) * payRate;
        overtimePay = input.overtimeHours * payRate * 1.5;
      } else if (w.payType === "salary") {
        // payRate stored as hourly equivalent, convert to period pay
        regularPay = payRate * 2080 / periodsPerYear;
      }

      const grossPay = regularPay + overtimePay + input.bonusAmount + input.commissionAmount;

      // Calculate annual income for tax brackets
      const annualizedIncome = grossPay * periodsPerYear;

      // Federal tax withholding (simplified)
      const filingStatus = w.federalFilingStatus || "single";
      const brackets = FEDERAL_TAX_BRACKETS_2024[filingStatus as keyof typeof FEDERAL_TAX_BRACKETS_2024] ||
        FEDERAL_TAX_BRACKETS_2024.single;
      
      let federalTax = 0;
      let remainingIncome = annualizedIncome;
      for (const bracket of brackets) {
        if (remainingIncome <= 0) break;
        const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
        federalTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
      }
      const federalWithholding = federalTax / periodsPerYear;

      // State and local tax using autonomous tax calculator
      const taxResult = await calculateAllTaxes({
        grossPay,
        annualizedIncome,
        periodsPerYear,
        filingStatus,
        stateCode: w.state || 'TX', // Default to Texas (no state tax) if not set
        localityName: w.city || undefined,
        countryCode: 'USA',
      });
      const stateWithholding = taxResult.stateWithholding;
      const localWithholding = taxResult.localWithholding;

      // Social Security
      const socialSecurityWithholding = Math.min(
        grossPay * FICA_RATES.socialSecurity.rate,
        (FICA_RATES.socialSecurity.wageBase / periodsPerYear) * FICA_RATES.socialSecurity.rate
      );

      // Medicare
      let medicareWithholding = grossPay * FICA_RATES.medicare.rate;
      if (annualizedIncome > FICA_RATES.medicare.additionalThreshold) {
        medicareWithholding += grossPay * FICA_RATES.medicare.additionalRate;
      }

      // Additional withholding
      const additionalWithholding = 0; // Additional withholding not in current schema

      // Total deductions
      const totalDeductions = input.deductions.reduce((sum, d) => sum + d.amount, 0);

      // Net pay
      const totalWithholdings = federalWithholding + stateWithholding + localWithholding +
        socialSecurityWithholding + medicareWithholding + additionalWithholding;
      const netPay = grossPay - totalWithholdings - totalDeductions;

      return {
        calculation: {
          regularPay,
          overtimePay,
          bonusAmount: input.bonusAmount,
          commissionAmount: input.commissionAmount,
          grossPay,
          federalWithholding,
          stateWithholding,
          localWithholding,
          socialSecurityWithholding,
          medicareWithholding,
          additionalWithholding,
          totalWithholdings,
          taxDetails: taxResult.taxDetails,
          deductions: input.deductions,
          totalDeductions,
          netPay,
        },
        worker: {
          id: w.id,
          name: `${w.firstName} ${w.lastName}`,
          workerId: w.id,
        },
        payPeriod: {
          start: input.payPeriodStart,
          end: input.payPeriodEnd,
        },
      };
    }),

  processPayroll: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        payPeriodStart: z.date(),
        payPeriodEnd: z.date(),
        payDate: z.date(),
        hoursWorked: z.number().optional(),
        overtimeHours: z.number().default(0),
        regularPay: z.number(),
        overtimePay: z.number().default(0),
        bonusAmount: z.number().default(0),
        commissionAmount: z.number().default(0),
        grossPay: z.number(),
        federalWithholding: z.number(),
        stateWithholding: z.number(),
        socialSecurityWithholding: z.number(),
        medicareWithholding: z.number(),
        additionalWithholding: z.number().default(0),
        otherDeductions: z.number().default(0),
        netPay: z.number(),
        paymentMethod: z.enum(["direct_deposit", "check", "cash"]).default("direct_deposit"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
     if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const worker = await db
        .select()
        .from(w2Workers)
        .where(
          and(
            eq(w2Workers.id, input.workerId),
            eq(w2Workers.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!worker.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Worker not found" });
      }

      // Note: payrollRuns requires a payrollPeriodId, so we need to create or find a period first
      // For now, we'll use a placeholder period ID of 0 - in production, create proper period management
      const result = await db.insert(payrollRuns).values({
        payrollPeriodId: 0, // Should be linked to actual payroll period
        workerId: input.workerId,
        regularHours: (input.hoursWorked || 0).toString(),
        overtimeHours: input.overtimeHours.toString(),
        grossPay: input.grossPay.toString(),
        federalTax: input.federalWithholding.toString(),
        stateTax: input.stateWithholding.toString(),
        localTax: "0",
        socialSecurity: input.socialSecurityWithholding.toString(),
        medicare: input.medicareWithholding.toString(),
        otherDeductions: input.otherDeductions.toString(),
        netPay: input.netPay.toString(),
        status: "paid",
      });

      // Update worker YTD totals
      await db
        .update(w2Workers)
        .set({
          // YTD totals are calculated from payroll records, not stored on worker
        })
        .where(eq(w2Workers.id, input.workerId));

      return {
        success: true,
        payrollRecordId: result[0].insertId,
      };
    }),

  getPayrollHistory: protectedProcedure
    .input(
      z.object({
        workerId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
     if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      // Get workers for this house first, then get their payroll runs
      const houseWorkers = await db
        .select({ id: w2Workers.id })
        .from(w2Workers)
        .where(eq(w2Workers.houseId, userHouse[0].id));
      
      const workerIds = houseWorkers.map(w => w.id);
      
      const records = workerIds.length > 0 ? await db
        .select()
        .from(payrollRuns)
        .orderBy(desc(payrollRuns.createdAt))
        .limit(input.limit) : [];

      // Records already fetched above

      // Calculate summary
      const totalGross = records.reduce((sum, r) => sum + Number(r.grossPay), 0);
      const totalNet = records.reduce((sum, r) => sum + Number(r.netPay), 0);
      const totalTaxes = records.reduce(
        (sum, r) =>
          sum +
          Number(r.federalTax) +
          Number(r.stateTax) +
          Number(r.socialSecurity) +
          Number(r.medicare),
        0
      );

      return {
        records,
        summary: {
          totalRecords: records.length,
          totalGrossPay: totalGross,
          totalNetPay: totalNet,
          totalTaxesWithheld: totalTaxes,
        },
      };
    }),

  // ============================================
  // TAX FORMS
  // ============================================

  generateW2Preview: protectedProcedure
    .input(z.object({ workerId: z.number(), taxYear: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
     if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const worker = await db
        .select()
        .from(w2Workers)
        .where(
          and(
            eq(w2Workers.id, input.workerId),
            eq(w2Workers.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!worker.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Worker not found" });
      }

      const w = worker[0];

      // Get all payroll records for the tax year
      const startOfYear = new Date(input.taxYear, 0, 1);
      const endOfYear = new Date(input.taxYear, 11, 31);

      const payrollRunsData = await db
        .select()
        .from(payrollRuns)
        .where(
          and(
            eq(payrollRuns.workerId, input.workerId),
            gte(payrollRuns.createdAt, startOfYear),
            lte(payrollRuns.createdAt, endOfYear)
          )
        );

      // Calculate W-2 box values
      const box1WagesTips = payrollRunsData.reduce(
        (sum, r) => sum + Number(r.grossPay),
        0
      );
      const box2FederalTax = payrollRunsData.reduce(
        (sum, r) => sum + Number(r.federalTax),
        0
      );
      const box3SocialSecurityWages = Math.min(box1WagesTips, FICA_RATES.socialSecurity.wageBase);
      const box4SocialSecurityTax = payrollRunsData.reduce(
        (sum, r) => sum + Number(r.socialSecurity),
        0
      );
      const box5MedicareWages = box1WagesTips;
      const box6MedicareTax = payrollRunsData.reduce(
        (sum, r) => sum + Number(r.medicare),
        0
      );
      const box17StateTax = payrollRunsData.reduce(
        (sum, r) => sum + Number(r.stateTax),
        0
      );

      return {
        taxYear: input.taxYear,
        employee: {
          name: `${w.firstName} ${w.lastName}`,
          ssn: w.ssn ? "XXX-XX-" + w.ssn.slice(-4) : "Not on file",
          address: `${w.address || ""}, ${w.city || ""}, ${w.state || ""} ${w.zipCode || ""}`,
        },
        employer: {
          name: userHouse[0].name,
          ein: userHouse[0].trustEIN || "Not on file",
        },
        boxes: {
          box1: box1WagesTips,
          box2: box2FederalTax,
          box3: box3SocialSecurityWages,
          box4: box4SocialSecurityTax,
          box5: box5MedicareWages,
          box6: box6MedicareTax,
          box17: box17StateTax,
          box16: box1WagesTips, // State wages (same as federal for simplicity)
        },
      };
    }),

  // ============================================
  // TAX LOOKUP ENDPOINTS
  // Autonomous tax data - no external API required
  // ============================================

  getStates: protectedProcedure
    .input(z.object({ countryCode: z.string().default("USA") }).optional())
    .query(async ({ input }) => {
      const countryCode = input?.countryCode || "USA";
      return getAllStates(countryCode);
    }),

  getLocalities: protectedProcedure
    .input(z.object({
      stateCode: z.string(),
      countryCode: z.string().default("USA"),
    }))
    .query(async ({ input }) => {
      return getLocalitiesForState(input.stateCode, input.countryCode);
    }),

  previewTaxCalculation: protectedProcedure
    .input(z.object({
      grossPay: z.number(),
      annualizedIncome: z.number(),
      periodsPerYear: z.number(),
      filingStatus: z.string(),
      stateCode: z.string(),
      localityName: z.string().optional(),
      countryCode: z.string().default("USA"),
    }))
    .query(async ({ input }) => {
      return calculateAllTaxes(input);
    }),

  // ============================================
  // TIMEKEEPING INTEGRATION
  // Pull approved hours from timekeeping system
  // ============================================

  getApprovedTimesheets: protectedProcedure
    .input(z.object({
      payPeriodStart: z.date(),
      payPeriodEnd: z.date(),
      workerId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
     if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get approved timesheets for the pay period
      const approvedTimesheets = await db
        .select({
          id: timesheets.id,
          workerId: timesheets.workerId,
          periodStart: timesheets.periodStart,
          periodEnd: timesheets.periodEnd,
          totalRegularHours: timesheets.totalRegularHours,
          totalOvertimeHours: timesheets.totalOvertimeHours,
          totalBillableHours: timesheets.totalBillableHours,
          status: timesheets.status,
        })
        .from(timesheets)
        .where(
          and(
            eq(timesheets.status, "approved"),
            gte(timesheets.periodStart, input.payPeriodStart),
            lte(timesheets.periodEnd, input.payPeriodEnd),
            input.workerId ? eq(timesheets.workerId, input.workerId) : sql`1=1`
          )
        );

      return approvedTimesheets.map(ts => ({
        ...ts,
        totalRegularHours: Number(ts.totalRegularHours),
        totalOvertimeHours: Number(ts.totalOvertimeHours),
        totalBillableHours: Number(ts.totalBillableHours),
      }));
    }),

  calculatePayrollFromTimesheets: protectedProcedure
    .input(z.object({
      payPeriodStart: z.date(),
      payPeriodEnd: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
     if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      // Get all approved timesheets for the period
      const approvedTimesheets = await db
        .select()
        .from(timesheets)
        .where(
          and(
            eq(timesheets.status, "approved"),
            gte(timesheets.periodStart, input.payPeriodStart),
            lte(timesheets.periodEnd, input.payPeriodEnd)
          )
        );

      const payrollCalculations = [];

      for (const ts of approvedTimesheets) {
        // Get the worker from timekeeping system
        const tkWorker = await db
          .select()
          .from(timekeepingWorkers)
          .where(eq(timekeepingWorkers.id, ts.workerId))
          .limit(1);

        if (!tkWorker.length) continue;

        const worker = tkWorker[0];
        const regularHours = Number(ts.totalRegularHours) || 0;
        const overtimeHours = Number(ts.totalOvertimeHours) || 0;
        const hourlyRate = Number(worker.hourlyRate) || 0;

        // Calculate gross pay
        const regularPay = regularHours * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * 1.5;
        const grossPay = regularPay + overtimePay;

        // Determine pay frequency and annualized income
        const periodsPerYear = 26; // Bi-weekly default
        const annualizedIncome = grossPay * periodsPerYear;

        // Calculate taxes using autonomous tax calculator
        const taxResult = await calculateAllTaxes({
          grossPay,
          annualizedIncome,
          periodsPerYear,
          filingStatus: "single", // Default, should come from worker profile
          stateCode: "TX", // Default, should come from worker profile
          countryCode: "USA",
        });

        const netPay = grossPay - taxResult.totalWithholdings;

        payrollCalculations.push({
          timesheetId: ts.id,
          workerId: ts.workerId,
          workerName: `${worker.firstName} ${worker.lastName}`,
          workerType: worker.workerType,
          periodStart: ts.periodStart,
          periodEnd: ts.periodEnd,
          regularHours,
          overtimeHours,
          hourlyRate,
          regularPay,
          overtimePay,
          grossPay,
          federalWithholding: taxResult.federalWithholding,
          stateWithholding: taxResult.stateWithholding,
          localWithholding: taxResult.localWithholding,
          socialSecurityWithholding: taxResult.socialSecurityWithholding,
          medicareWithholding: taxResult.medicareWithholding,
          totalWithholdings: taxResult.totalWithholdings,
          netPay,
          taxDetails: taxResult.taxDetails,
        });
      }

      // Summary
      const summary = {
        totalWorkers: payrollCalculations.length,
        totalGrossPay: payrollCalculations.reduce((sum, p) => sum + p.grossPay, 0),
        totalNetPay: payrollCalculations.reduce((sum, p) => sum + p.netPay, 0),
        totalFederalTax: payrollCalculations.reduce((sum, p) => sum + p.federalWithholding, 0),
        totalStateTax: payrollCalculations.reduce((sum, p) => sum + p.stateWithholding, 0),
        totalLocalTax: payrollCalculations.reduce((sum, p) => sum + p.localWithholding, 0),
        totalSocialSecurity: payrollCalculations.reduce((sum, p) => sum + p.socialSecurityWithholding, 0),
        totalMedicare: payrollCalculations.reduce((sum, p) => sum + p.medicareWithholding, 0),
        totalWithholdings: payrollCalculations.reduce((sum, p) => sum + p.totalWithholdings, 0),
        totalRegularHours: payrollCalculations.reduce((sum, p) => sum + p.regularHours, 0),
        totalOvertimeHours: payrollCalculations.reduce((sum, p) => sum + p.overtimeHours, 0),
      };

      return {
        payPeriod: {
          start: input.payPeriodStart,
          end: input.payPeriodEnd,
        },
        calculations: payrollCalculations,
        summary,
      };
    }),

  // ==========================================
  // HR INTEGRATION - Pull Employee Data
  // ==========================================
  
  // Get payroll data enriched with HR employee details
  getPayrollWithHRData: protectedProcedure
    .input(z.object({
      payPeriodStart: z.date(),
      payPeriodEnd: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
     if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get approved timesheets for the period
      const approvedTimesheets = await db
        .select()
        .from(timesheets)
        .where(
          and(
            eq(timesheets.status, "approved"),
            gte(timesheets.periodStart, input.payPeriodStart),
            lte(timesheets.periodEnd, input.payPeriodEnd)
          )
        );

      const enrichedData = [];

      for (const ts of approvedTimesheets) {
        // Get timekeeping worker
        const [tkWorker] = await db
          .select()
          .from(timekeepingWorkers)
          .where(eq(timekeepingWorkers.id, ts.workerId));

        if (!tkWorker) continue;

        // Get HR employee data if linked
        let hrEmployee = null;
        if (tkWorker.employeeId) {
          const [emp] = await db
            .select()
            .from(employees)
            .where(eq(employees.id, tkWorker.employeeId));
          hrEmployee = emp || null;
        }

        // Use HR data if available, fall back to timekeeping data
        const workerData = hrEmployee ? {
          firstName: hrEmployee.firstName,
          lastName: hrEmployee.lastName,
          email: hrEmployee.email,
          department: hrEmployee.department,
          jobTitle: hrEmployee.jobTitle,
          entityId: hrEmployee.entityId,
          workerType: hrEmployee.workerType,
          hourlyRate: hrEmployee.hourlyRate || tkWorker.hourlyRate,
          startDate: hrEmployee.startDate,
          is1099: hrEmployee.is1099,
        } : {
          firstName: tkWorker.firstName,
          lastName: tkWorker.lastName,
          email: tkWorker.email,
          department: null,
          jobTitle: null,
          entityId: tkWorker.entityId,
          workerType: tkWorker.workerType,
          hourlyRate: tkWorker.hourlyRate,
          startDate: tkWorker.hireDate,
          is1099: tkWorker.workerType === "contractor",
        };

        enrichedData.push({
          timesheetId: ts.id,
          workerId: ts.workerId,
          employeeId: tkWorker.employeeId,
          isLinkedToHR: !!tkWorker.employeeId,
          ...workerData,
          periodStart: ts.periodStart,
          periodEnd: ts.periodEnd,
          regularHours: Number(ts.totalRegularHours) || 0,
          overtimeHours: Number(ts.totalOvertimeHours) || 0,
          billableHours: Number(ts.totalBillableHours) || 0,
        });
      }

      return enrichedData;
    }),

  // Sync W-2 worker from HR employee record
  syncW2WorkerFromHR: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      payFrequency: z.enum(["weekly", "bi_weekly", "semi_monthly", "monthly"]).default("bi_weekly"),
      filingStatus: z.enum(["single", "married_filing_jointly", "married_filing_separately", "head_of_household", "qualifying_widow"]).default("single"),
      federalAllowances: z.number().default(0),
      stateAllowances: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
     if (!db) throw new Error("Database not available");
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get HR employee
      const [hrEmployee] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, input.employeeId));

      if (!hrEmployee) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found in HR system" });
      }

      if (hrEmployee.workerType !== "employee") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only W-2 employees can be synced to payroll" });
      }

      // Check if already exists in W-2 workers
      const [existingW2] = await db
        .select()
        .from(w2Workers)
        .where(eq(w2Workers.id, input.employeeId));

      if (existingW2) {
        // Update existing W-2 worker from HR
        await db.update(w2Workers)
          .set({
            firstName: hrEmployee.firstName,
            lastName: hrEmployee.lastName,
            email: hrEmployee.email,
            department: hrEmployee.department,
            jobTitle: hrEmployee.jobTitle,
            payFrequency: input.payFrequency,
            federalFilingStatus: input.filingStatus as any,
            federalAllowances: input.federalAllowances,
            stateAllowances: input.stateAllowances,
            status: hrEmployee.status === "active" ? "active" : "terminated",
          })
          .where(eq(w2Workers.id, existingW2.id));

        return { success: true, id: existingW2.id, action: "updated" };
      } else {
        // Create new W-2 worker from HR
        const result = await db.insert(w2Workers).values({
          houseId: hrEmployee.entityId,
          firstName: hrEmployee.firstName,
          lastName: hrEmployee.lastName,
          email: hrEmployee.email,
          department: hrEmployee.department,
          jobTitle: hrEmployee.jobTitle,
          employmentType: hrEmployee.employmentType === "full_time" ? "full_time" : 
                          hrEmployee.employmentType === "part_time" ? "part_time" : "full_time",
          payType: "hourly",
          payRate: hrEmployee.hourlyRate || "0",
          payFrequency: input.payFrequency,
          federalFilingStatus: input.filingStatus as any,
          federalAllowances: input.federalAllowances,
          stateAllowances: input.stateAllowances,
          status: "active",
          hireDate: hrEmployee.startDate || new Date(),
        } as any);

        return { success: true, id: result[0].insertId, action: "created" };
      }
    }),
});

export type PayrollRouter = typeof payrollRouter;
