import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { luvLedgerTransactions } from "../../drizzle/schema";
import { and, gte, lte, desc } from "drizzle-orm";

// Tax categories for income and expenses
const TAX_CATEGORIES = {
  income: [
    { code: "WAGES", name: "Wages & Salary", taxable: true },
    { code: "SELF_EMPLOYMENT", name: "Self-Employment Income", taxable: true },
    { code: "BUSINESS", name: "Business Income", taxable: true },
    { code: "RENTAL", name: "Rental Income", taxable: true },
    { code: "INVESTMENT", name: "Investment Income", taxable: true },
    { code: "GRANT", name: "Grant Income", taxable: false },
    { code: "GIFT", name: "Gift Income", taxable: false },
  ],
  expense: [
    { code: "BUSINESS_EXPENSE", name: "Business Expense", deductible: true },
    { code: "HOME_OFFICE", name: "Home Office", deductible: true },
    { code: "VEHICLE", name: "Vehicle/Mileage", deductible: true },
    { code: "SUPPLIES", name: "Supplies & Materials", deductible: true },
    { code: "PROFESSIONAL", name: "Professional Services", deductible: true },
    { code: "INSURANCE", name: "Insurance", deductible: true },
    { code: "UTILITIES", name: "Utilities", deductible: true },
    { code: "CHARITABLE", name: "Charitable Donations", deductible: true },
    { code: "PERSONAL", name: "Personal (Non-Deductible)", deductible: false },
  ],
};

// 2025 Federal Tax Brackets (Single)
const TAX_BRACKETS_2025 = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

// Self-employment tax rate
const SELF_EMPLOYMENT_TAX_RATE = 0.153; // 15.3%

// Calculate federal tax based on taxable income
function calculateFederalTax(taxableIncome: number): number {
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of TAX_BRACKETS_2025) {
    if (remainingIncome <= 0) break;

    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max - bracket.min
    );
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return tax;
}

export const taxModuleRouter = router({
  // Get tax categories
  getCategories: publicProcedure.query(() => {
    return TAX_CATEGORIES;
  }),

  // Get tax summary for a year
  getTaxSummary: protectedProcedure
    .input(
      z.object({
        year: z.number().min(2020).max(2030),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          year: input.year,
          totalIncome: 0,
          taxableIncome: 0,
          totalDeductions: 0,
          estimatedTax: 0,
          selfEmploymentTax: 0,
          quarterlyEstimate: 0,
          effectiveRate: 0,
          transactionCount: 0,
        };
      }

      const startDate = new Date(input.year, 0, 1);
      const endDate = new Date(input.year, 11, 31);

      // Get all transactions for the year using createdAt since transactionDate doesn't exist
      const transactions = await db
        .select()
        .from(luvLedgerTransactions)
        .where(
          and(
            gte(luvLedgerTransactions.createdAt, startDate),
            lte(luvLedgerTransactions.createdAt, endDate)
          )
        )
        .orderBy(desc(luvLedgerTransactions.createdAt));

      // Calculate totals
      let totalIncome = 0;
      let taxableIncome = 0;
      let totalDeductions = 0;
      let selfEmploymentIncome = 0;

      for (const tx of transactions) {
        const amount = Number(tx.amount) || 0;
        // Income types
        if (tx.transactionType === "income") {
          totalIncome += amount;
          taxableIncome += amount;
          // Check description for self-employment indicators
          const desc = (tx.description || "").toLowerCase();
          if (desc.includes("self-employment") || desc.includes("business") || desc.includes("contract")) {
            selfEmploymentIncome += amount;
          }
        } else if (tx.transactionType === "fee" || tx.transactionType === "allocation") {
          // Treat fees and allocations as potential deductions
          totalDeductions += amount;
        }
      }

      const adjustedIncome = Math.max(0, taxableIncome - totalDeductions);
      const federalTax = calculateFederalTax(adjustedIncome);
      const selfEmploymentTax = selfEmploymentIncome * SELF_EMPLOYMENT_TAX_RATE * 0.9235;
      const totalTax = federalTax + selfEmploymentTax;
      const quarterlyEstimate = totalTax / 4;
      const effectiveRate = adjustedIncome > 0 ? (totalTax / adjustedIncome) * 100 : 0;

      return {
        year: input.year,
        totalIncome,
        taxableIncome,
        totalDeductions,
        adjustedIncome,
        estimatedTax: totalTax,
        federalTax,
        selfEmploymentTax,
        quarterlyEstimate,
        effectiveRate,
        transactionCount: transactions.length,
      };
    }),

  // Get quarterly breakdown
  getQuarterlyBreakdown: protectedProcedure
    .input(
      z.object({
        year: z.number().min(2020).max(2030),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const dueDates = [
        `April 15, ${input.year}`,
        `June 15, ${input.year}`,
        `September 15, ${input.year}`,
        `January 15, ${input.year + 1}`,
      ];

      if (!db) {
        return {
          quarters: dueDates.map((dueDate, i) => ({
            quarter: i + 1,
            income: 0,
            expenses: 0,
            netIncome: 0,
            estimatedTax: 0,
            dueDate,
          })),
        };
      }

      const quarters = [];

      for (let q = 1; q <= 4; q++) {
        const startMonth = (q - 1) * 3;
        const endMonth = startMonth + 2;
        const startDate = new Date(input.year, startMonth, 1);
        const endDate = new Date(input.year, endMonth + 1, 0);

        const transactions = await db
          .select()
          .from(luvLedgerTransactions)
          .where(
            and(
              gte(luvLedgerTransactions.createdAt, startDate),
              lte(luvLedgerTransactions.createdAt, endDate)
            )
          );

        let income = 0;
        let expenses = 0;

        for (const tx of transactions) {
          const amount = Number(tx.amount) || 0;
          if (tx.transactionType === "income") {
            income += amount;
          } else if (tx.transactionType === "fee" || tx.transactionType === "allocation") {
            expenses += amount;
          }
        }

        const taxableIncome = Math.max(0, income - expenses);
        const estimatedTax = calculateFederalTax(taxableIncome * 4) / 4;

        quarters.push({
          quarter: q,
          income,
          expenses,
          netIncome: income - expenses,
          estimatedTax,
          dueDate: dueDates[q - 1],
        });
      }

      return { quarters };
    }),

  // Calculate tax projection
  calculateProjection: publicProcedure
    .input(
      z.object({
        annualIncome: z.number().min(0),
        deductions: z.number().min(0),
        selfEmploymentIncome: z.number().min(0).optional(),
      })
    )
    .query(({ input }) => {
      const { annualIncome, deductions, selfEmploymentIncome = 0 } = input;
      
      const taxableIncome = Math.max(0, annualIncome - deductions);
      const federalTax = calculateFederalTax(taxableIncome);
      const selfEmploymentTax = selfEmploymentIncome * SELF_EMPLOYMENT_TAX_RATE * 0.9235;
      const totalTax = federalTax + selfEmploymentTax;
      const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;
      const quarterlyEstimate = totalTax / 4;

      let marginalRate = 0.10;
      for (const bracket of TAX_BRACKETS_2025) {
        if (taxableIncome > bracket.min) {
          marginalRate = bracket.rate;
        }
      }

      return {
        grossIncome: annualIncome,
        deductions,
        taxableIncome,
        federalTax,
        selfEmploymentTax,
        totalTax,
        effectiveRate,
        marginalRate: marginalRate * 100,
        quarterlyEstimate,
        takeHome: annualIncome - totalTax,
      };
    }),
});
