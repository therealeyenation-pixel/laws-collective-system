import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  houses,
  taxYears,
  taxDocuments,
  w2Workers,
  payrollRuns,
  businessEntities,
  luvLedgerTransactions,
} from "../../drizzle/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { storagePut, storageGet } from "../storage";
import crypto from "crypto";

// ============================================
// TAX PREPARATION TOOLS
// Personal and business tax preparation
// ============================================

// 2024 Standard Deductions
const STANDARD_DEDUCTIONS_2024 = {
  single: 14600,
  married_filing_jointly: 29200,
  married_filing_separately: 14600,
  head_of_household: 21900,
  qualifying_widow: 29200,
};

// 2024 Federal Tax Brackets
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
  married_filing_separately: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 365600, rate: 0.35 },
    { min: 365600, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

// Self-employment tax rate
const SELF_EMPLOYMENT_TAX_RATE = 0.153; // 15.3%
const SELF_EMPLOYMENT_DEDUCTION_RATE = 0.5; // 50% deductible

// Tax form types
const TAX_FORMS = [
  { code: "1040", name: "U.S. Individual Income Tax Return", type: "personal" },
  { code: "1040-SR", name: "U.S. Tax Return for Seniors", type: "personal" },
  { code: "1040-ES", name: "Estimated Tax for Individuals", type: "personal" },
  { code: "Schedule A", name: "Itemized Deductions", type: "personal" },
  { code: "Schedule B", name: "Interest and Ordinary Dividends", type: "personal" },
  { code: "Schedule C", name: "Profit or Loss From Business", type: "business" },
  { code: "Schedule D", name: "Capital Gains and Losses", type: "personal" },
  { code: "Schedule E", name: "Supplemental Income and Loss", type: "personal" },
  { code: "Schedule SE", name: "Self-Employment Tax", type: "business" },
  { code: "1120", name: "U.S. Corporation Income Tax Return", type: "business" },
  { code: "1120-S", name: "U.S. Income Tax Return for an S Corporation", type: "business" },
  { code: "1065", name: "U.S. Return of Partnership Income", type: "business" },
  { code: "W-2", name: "Wage and Tax Statement", type: "employment" },
  { code: "W-4", name: "Employee's Withholding Certificate", type: "employment" },
  { code: "1099-NEC", name: "Nonemployee Compensation", type: "employment" },
  { code: "1099-MISC", name: "Miscellaneous Income", type: "employment" },
  { code: "1099-INT", name: "Interest Income", type: "investment" },
  { code: "1099-DIV", name: "Dividends and Distributions", type: "investment" },
  { code: "1099-B", name: "Proceeds from Broker Transactions", type: "investment" },
];

export const taxPrepRouter = router({
  // ============================================
  // TAX RETURN MANAGEMENT
  // ============================================

  getTaxReturns: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const userId = ctx.user.id;

    const userHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.ownerUserId, userId))
      .limit(1);

    if (!userHouse.length) {
      return { returns: [], forms: TAX_FORMS };
    }

    const returns = await db
      .select()
      .from(taxYears)
      .where(eq(taxYears.houseId, userHouse[0].id))
      .orderBy(desc(taxYears.taxYear));

    return {
      returns,
      forms: TAX_FORMS,
      currentYear: new Date().getFullYear(),
    };
  }),

  createTaxReturn: protectedProcedure
    .input(
      z.object({
        taxYear: z.number(),
        // returnType: z.enum(["personal", "business", "trust"]), // Not in schema
        filingStatus: z.enum([
          "single",
          "married_filing_jointly",
          "married_filing_separately",
          "head_of_household",
          "qualifying_widow",
        ]).optional(),
        businessEntityId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
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
          message: "You must activate your House before creating tax returns",
        });
      }

      // Check for existing return
      const existing = await db
        .select()
        .from(taxYears)
        .where(
          and(
            eq(taxYears.houseId, userHouse[0].id),
            eq(taxYears.taxYear, input.taxYear),
            eq(taxYears.taxYear, input.taxYear)
          )
        )
        .limit(1);

      if (existing.length) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `A tax return for ${input.taxYear} already exists`,
        });
      }

      const result = await db.insert(taxYears).values({
        houseId: userHouse[0].id,
        userId: userId,
        taxYear: input.taxYear,
        filingStatus: input.filingStatus || "single",
        status: "in_progress",
      });

      return {
        success: true,
        taxReturnId: result[0].insertId,
      };
    }),

  // ============================================
  // INCOME CALCULATION
  // ============================================

  calculateIncome: protectedProcedure
    .input(
      z.object({
        taxYear: z.number(),
        includeW2: z.boolean().default(true),
        includeBusiness: z.boolean().default(true),
        includeInvestments: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        return { totalIncome: 0, breakdown: {} };
      }

      const startOfYear = new Date(input.taxYear, 0, 1);
      const endOfYear = new Date(input.taxYear, 11, 31);

      let w2Income = 0;
      let businessIncome = 0;
      let investmentIncome = 0;

      // W-2 Income from payroll (as employer)
      if (input.includeW2) {
        const workers = await db
          .select()
          .from(w2Workers)
          .where(eq(w2Workers.houseId, userHouse[0].id));

        for (const worker of workers) {
          const payroll = await db
            .select()
            .from(payrollRuns)
            .where(
              and(
                eq(payrollRuns.workerId, worker.id),
                gte(payrollRuns.createdAt, startOfYear),
                lte(payrollRuns.createdAt, endOfYear)
              )
            );
          
          w2Income += payroll.reduce((sum, p) => sum + Number(p.grossPay), 0);
        }
      }

      // Business Income from LuvLedger
      if (input.includeBusiness) {
        const businessTransactions = await db
          .select()
          .from(luvLedgerTransactions)
          .where(
            and(
              // Note: luvLedgerTransactions doesn't have houseId, would need to join through accounts
              sql`${luvLedgerTransactions.transactionType} = 'income'`,
              gte(luvLedgerTransactions.createdAt, startOfYear),
              lte(luvLedgerTransactions.createdAt, endOfYear)
            )
          );

        businessIncome = businessTransactions.reduce(
          (sum, t) => sum + Number(t.amount),
          0
        );
      }

      // Investment income would come from external integrations
      // Placeholder for now
      if (input.includeInvestments) {
        investmentIncome = 0; // Would integrate with investment accounts
      }

      const totalIncome = w2Income + businessIncome + investmentIncome;

      return {
        totalIncome,
        breakdown: {
          w2Income,
          businessIncome,
          investmentIncome,
        },
        taxYear: input.taxYear,
      };
    }),

  // ============================================
  // TAX CALCULATION
  // ============================================

  calculateTax: protectedProcedure
    .input(
      z.object({
        taxYear: z.number(),
        filingStatus: z.enum([
          "single",
          "married_filing_jointly",
          "married_filing_separately",
          "head_of_household",
        ]),
        grossIncome: z.number(),
        adjustments: z.number().default(0),
        itemizedDeductions: z.number().optional(),
        selfEmploymentIncome: z.number().default(0),
        dependents: z.number().default(0),
        childTaxCreditEligible: z.number().default(0),
        estimatedPayments: z.number().default(0),
        withholdingPayments: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Calculate AGI
      const agi = input.grossIncome - input.adjustments;

      // Determine deduction (standard vs itemized)
      const standardDeduction = STANDARD_DEDUCTIONS_2024[input.filingStatus] || 14600;
      const deduction = input.itemizedDeductions && input.itemizedDeductions > standardDeduction
        ? input.itemizedDeductions
        : standardDeduction;
      const usingStandardDeduction = !input.itemizedDeductions || input.itemizedDeductions <= standardDeduction;

      // Calculate taxable income
      const taxableIncome = Math.max(0, agi - deduction);

      // Calculate federal tax using brackets
      const brackets = FEDERAL_TAX_BRACKETS_2024[input.filingStatus] || FEDERAL_TAX_BRACKETS_2024.single;
      let federalTax = 0;
      let remainingIncome = taxableIncome;

      for (const bracket of brackets) {
        if (remainingIncome <= 0) break;
        const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
        federalTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
      }

      // Self-employment tax
      const selfEmploymentTax = input.selfEmploymentIncome * SELF_EMPLOYMENT_TAX_RATE;
      const selfEmploymentDeduction = selfEmploymentTax * SELF_EMPLOYMENT_DEDUCTION_RATE;

      // Child tax credit (simplified - $2000 per child, phaseout not implemented)
      const childTaxCredit = input.childTaxCreditEligible * 2000;

      // Total tax before credits
      const totalTaxBeforeCredits = federalTax + selfEmploymentTax;

      // Total credits
      const totalCredits = childTaxCredit;

      // Tax after credits
      const taxAfterCredits = Math.max(0, totalTaxBeforeCredits - totalCredits);

      // Payments already made
      const totalPayments = input.estimatedPayments + input.withholdingPayments;

      // Amount owed or refund
      const balanceDue = taxAfterCredits - totalPayments;
      const refund = balanceDue < 0 ? Math.abs(balanceDue) : 0;
      const amountOwed = balanceDue > 0 ? balanceDue : 0;

      // Effective tax rate
      const effectiveTaxRate = input.grossIncome > 0 
        ? (taxAfterCredits / input.grossIncome) * 100 
        : 0;

      // Marginal tax rate (highest bracket hit)
      let marginalRate = 0;
      let tempIncome = taxableIncome;
      for (const bracket of brackets) {
        if (tempIncome > bracket.min) {
          marginalRate = bracket.rate * 100;
        }
      }

      return {
        summary: {
          grossIncome: input.grossIncome,
          adjustments: input.adjustments,
          agi,
          deduction,
          usingStandardDeduction,
          taxableIncome,
        },
        taxes: {
          federalTax,
          selfEmploymentTax,
          totalTaxBeforeCredits,
        },
        credits: {
          childTaxCredit,
          totalCredits,
        },
        payments: {
          estimatedPayments: input.estimatedPayments,
          withholdingPayments: input.withholdingPayments,
          totalPayments,
        },
        result: {
          taxAfterCredits,
          balanceDue,
          refund,
          amountOwed,
        },
        rates: {
          effectiveTaxRate: effectiveTaxRate.toFixed(2),
          marginalRate: marginalRate.toFixed(0),
        },
      };
    }),

  // ============================================
  // SCHEDULE C (Business Income)
  // ============================================

  generateScheduleC: protectedProcedure
    .input(
      z.object({
        taxYear: z.number(),
        businessEntityId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
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

      const startOfYear = new Date(input.taxYear, 0, 1);
      const endOfYear = new Date(input.taxYear, 11, 31);

      // Get business entity
      let business = null;
      if (input.businessEntityId) {
        const businessResult = await db
          .select()
          .from(businessEntities)
          .where(eq(businessEntities.id, input.businessEntityId))
          .limit(1);
        business = businessResult[0] || null;
      }

      // Get income transactions
      const incomeTransactions = await db
        .select()
        .from(luvLedgerTransactions)
        .where(
          and(
            // Note: luvLedgerTransactions doesn't have houseId, would need to join through accounts
            sql`${luvLedgerTransactions.transactionType} = 'income'`,
            gte(luvLedgerTransactions.createdAt, startOfYear),
            lte(luvLedgerTransactions.createdAt, endOfYear)
          )
        );

      // Get expense transactions
      const expenseTransactions = await db
        .select()
        .from(luvLedgerTransactions)
        .where(
          and(
            // Note: luvLedgerTransactions doesn't have houseId, would need to join through accounts
            sql`${luvLedgerTransactions.transactionType} = 'allocation'`,
            gte(luvLedgerTransactions.createdAt, startOfYear),
            lte(luvLedgerTransactions.createdAt, endOfYear)
          )
        );

      const grossReceipts = incomeTransactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      const totalExpenses = expenseTransactions.reduce(
        (sum, t) => sum + Math.abs(Number(t.amount)),
        0
      );

      const netProfit = grossReceipts - totalExpenses;

      // Self-employment tax calculation
      const selfEmploymentTax = netProfit > 0 ? netProfit * SELF_EMPLOYMENT_TAX_RATE : 0;
      const deductibleSETax = selfEmploymentTax * SELF_EMPLOYMENT_DEDUCTION_RATE;

      return {
        taxYear: input.taxYear,
        business: business ? {
          name: business.name,
          ein: null, // EIN not stored in businessEntities table
          businessType: business.entityType,
        } : null,
        partI: {
          line1: grossReceipts, // Gross receipts
          line2: 0, // Returns and allowances
          line3: grossReceipts, // Gross receipts minus returns
          line4: 0, // Cost of goods sold
          line5: grossReceipts, // Gross profit
          line6: 0, // Other income
          line7: grossReceipts, // Gross income
        },
        partII: {
          totalExpenses,
          // Expense categories would be broken down here
          advertising: 0,
          carAndTruck: 0,
          commissions: 0,
          contractLabor: 0,
          depreciation: 0,
          insurance: 0,
          interest: 0,
          legal: 0,
          officeExpense: 0,
          rent: 0,
          repairs: 0,
          supplies: 0,
          taxes: 0,
          travel: 0,
          utilities: 0,
          wages: 0,
          other: totalExpenses, // All expenses categorized as other for now
        },
        result: {
          netProfit,
          selfEmploymentTax,
          deductibleSETax,
        },
      };
    }),

  // ============================================
  // TAX DOCUMENT MANAGEMENT
  // ============================================

  getTaxDocuments: protectedProcedure
    .input(z.object({ taxReturnId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
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

      const documents = await db
        .select()
        .from(taxDocuments)
        .where(eq(taxDocuments.taxYearId, input.taxReturnId))
        .orderBy(desc(taxDocuments.createdAt));

      return {
        documents,
        requiredDocuments: [
          { type: "W-2", description: "Wage and Tax Statement from employers" },
          { type: "1099-NEC", description: "Nonemployee Compensation" },
          { type: "1099-INT", description: "Interest Income" },
          { type: "1099-DIV", description: "Dividend Income" },
          { type: "1098", description: "Mortgage Interest Statement" },
          { type: "1098-T", description: "Tuition Statement" },
          { type: "Receipts", description: "Deductible expense receipts" },
        ],
      };
    }),

  // ============================================
  // TAX DEADLINES & REMINDERS
  // ============================================

  getTaxDeadlines: protectedProcedure
    .input(z.object({ taxYear: z.number() }))
    .query(async ({ input }) => {
      const year = input.taxYear + 1; // Deadlines are in the following year

      return {
        deadlines: [
          {
            date: `${year}-01-15`,
            description: "Q4 estimated tax payment due",
            form: "1040-ES",
            type: "payment",
          },
          {
            date: `${year}-01-31`,
            description: "W-2 and 1099 forms must be sent to recipients",
            form: "W-2, 1099",
            type: "employer",
          },
          {
            date: `${year}-03-15`,
            description: "S-Corp and Partnership returns due",
            form: "1120-S, 1065",
            type: "business",
          },
          {
            date: `${year}-04-15`,
            description: "Individual tax returns due",
            form: "1040",
            type: "personal",
          },
          {
            date: `${year}-04-15`,
            description: "Q1 estimated tax payment due",
            form: "1040-ES",
            type: "payment",
          },
          {
            date: `${year}-04-15`,
            description: "C-Corp returns due",
            form: "1120",
            type: "business",
          },
          {
            date: `${year}-06-15`,
            description: "Q2 estimated tax payment due",
            form: "1040-ES",
            type: "payment",
          },
          {
            date: `${year}-09-15`,
            description: "Q3 estimated tax payment due",
            form: "1040-ES",
            type: "payment",
          },
          {
            date: `${year}-09-15`,
            description: "Extended S-Corp and Partnership returns due",
            form: "1120-S, 1065",
            type: "business",
          },
          {
            date: `${year}-10-15`,
            description: "Extended individual returns due",
            form: "1040",
            type: "personal",
          },
        ],
        taxYear: input.taxYear,
      };
    }),

  // ============================================
  // ESTIMATED TAX CALCULATOR
  // ============================================

  calculateEstimatedTax: protectedProcedure
    .input(
      z.object({
        expectedIncome: z.number(),
        expectedWithholding: z.number().default(0),
        filingStatus: z.enum([
          "single",
          "married_filing_jointly",
          "married_filing_separately",
          "head_of_household",
        ]),
        selfEmploymentIncome: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      // Calculate expected tax
      const standardDeduction = STANDARD_DEDUCTIONS_2024[input.filingStatus] || 14600;
      const taxableIncome = Math.max(0, input.expectedIncome - standardDeduction);

      const brackets = FEDERAL_TAX_BRACKETS_2024[input.filingStatus] || FEDERAL_TAX_BRACKETS_2024.single;
      let federalTax = 0;
      let remainingIncome = taxableIncome;

      for (const bracket of brackets) {
        if (remainingIncome <= 0) break;
        const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
        federalTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
      }

      // Self-employment tax
      const selfEmploymentTax = input.selfEmploymentIncome * SELF_EMPLOYMENT_TAX_RATE;

      // Total expected tax
      const totalExpectedTax = federalTax + selfEmploymentTax;

      // Safe harbor (pay 100% of prior year or 90% of current year)
      const safeHarborAmount = totalExpectedTax * 0.9;

      // Amount needed beyond withholding
      const additionalNeeded = Math.max(0, safeHarborAmount - input.expectedWithholding);

      // Quarterly payments
      const quarterlyPayment = additionalNeeded / 4;

      return {
        expectedTax: {
          federalTax,
          selfEmploymentTax,
          totalExpectedTax,
        },
        withholding: input.expectedWithholding,
        estimatedPayments: {
          safeHarborAmount,
          additionalNeeded,
          quarterlyPayment,
          schedule: [
            { quarter: "Q1", dueDate: "April 15", amount: quarterlyPayment },
            { quarter: "Q2", dueDate: "June 15", amount: quarterlyPayment },
            { quarter: "Q3", dueDate: "September 15", amount: quarterlyPayment },
            { quarter: "Q4", dueDate: "January 15", amount: quarterlyPayment },
          ],
        },
      };
    }),

  // ============================================
  // TAX DOCUMENT UPLOAD
  // ============================================

  uploadTaxDocument: protectedProcedure
    .input(
      z.object({
        taxYear: z.number(),
        documentType: z.enum([
          "w2",
          "1099_nec",
          "1099_misc",
          "1099_int",
          "1099_div",
          "1099_b",
          "1098",
          "receipt",
          "invoice",
          "bank_statement",
          "other",
        ]),
        fileName: z.string().min(1),
        fileSize: z.number().positive().max(10 * 1024 * 1024), // 10MB max
        mimeType: z.string().min(1),
        fileContent: z.string(), // Base64 encoded
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
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
          message: "You must activate your House before uploading tax documents",
        });
      }

      // Decode and upload to S3
      const fileBuffer = Buffer.from(input.fileContent, "base64");
      const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
      const s3Key = `tax-documents/${userHouse[0].id}/${input.taxYear}/${fileHash}-${input.fileName}`;

      const { url: s3Url } = await storagePut(s3Key, fileBuffer, input.mimeType);

      // First, get or create tax year record
      let taxYearRecord = await db
        .select()
        .from(taxYears)
        .where(
          and(
            eq(taxYears.houseId, userHouse[0].id),
            eq(taxYears.taxYear, input.taxYear)
          )
        )
        .limit(1);

      let taxYearId: number;
      if (!taxYearRecord.length) {
        const newTaxYear = await db.insert(taxYears).values({
          houseId: userHouse[0].id,
          userId: userId,
          taxYear: input.taxYear,
          filingStatus: "single",
          status: "in_progress",
        });
        taxYearId = newTaxYear[0].insertId;
      } else {
        taxYearId = taxYearRecord[0].id;
      }

      // Create document record
      const result = await db.insert(taxDocuments).values({
        taxYearId: taxYearId,
        houseId: userHouse[0].id,
        documentType: input.documentType,
        documentName: input.fileName,
        description: input.description,
      });

      return {
        success: true,
        documentId: result[0].insertId,
        fileUrl: s3Url,
      };
    }),

  getTaxDocumentsByYear: protectedProcedure
    .input(
      z.object({
        taxYear: z.number(),
        documentType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        return { documents: [] };
      }

      // Get tax year record
      const taxYearRecord = await db
        .select()
        .from(taxYears)
        .where(
          and(
            eq(taxYears.houseId, userHouse[0].id),
            eq(taxYears.taxYear, input.taxYear)
          )
        )
        .limit(1);

      if (!taxYearRecord.length) {
        return { documents: [] };
      }

      const conditions = [
        eq(taxDocuments.taxYearId, taxYearRecord[0].id),
      ];

      if (input.documentType) {
        conditions.push(eq(taxDocuments.documentType, input.documentType as any));
      }

      const documents = await db
        .select()
        .from(taxDocuments)
        .where(and(...conditions))
        .orderBy(desc(taxDocuments.createdAt));

      return { documents };
    }),

  deleteTaxDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
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

      // Verify ownership
      const [doc] = await db
        .select()
        .from(taxDocuments)
        .where(
          and(
            eq(taxDocuments.id, input.documentId),
            eq(taxDocuments.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!doc) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }

      await db.delete(taxDocuments).where(eq(taxDocuments.id, input.documentId));

      return { success: true };
    }),
});

export type TaxPrepRouter = typeof taxPrepRouter;
