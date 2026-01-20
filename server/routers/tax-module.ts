import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { luvLedgerTransactions } from "../../drizzle/schema";
import { and, gte, lte, desc, eq } from "drizzle-orm";

// Tax categories for income and expenses
const TAX_CATEGORIES = {
  income: [
    { code: "W2", name: "W-2 Wages", taxRate: 0.22 },
    { code: "1099", name: "1099 Contract Income", taxRate: 0.25 },
    { code: "BUSINESS", name: "Business Income", taxRate: 0.25 },
    { code: "RENTAL", name: "Rental Income", taxRate: 0.22 },
    { code: "INVESTMENT", name: "Investment Income", taxRate: 0.15 },
    { code: "DIVIDEND", name: "Dividends", taxRate: 0.15 },
    { code: "INTEREST", name: "Interest Income", taxRate: 0.22 },
    { code: "OTHER", name: "Other Income", taxRate: 0.22 },
  ],
  deductions: [
    { code: "HOME_OFFICE", name: "Home Office", maxDeduction: 1500 },
    { code: "VEHICLE", name: "Vehicle/Mileage", maxDeduction: null },
    { code: "SUPPLIES", name: "Office Supplies", maxDeduction: null },
    { code: "PROFESSIONAL", name: "Professional Services", maxDeduction: null },
    { code: "INSURANCE", name: "Business Insurance", maxDeduction: null },
    { code: "EDUCATION", name: "Education/Training", maxDeduction: null },
    { code: "TRAVEL", name: "Business Travel", maxDeduction: null },
    { code: "MEALS", name: "Business Meals (50%)", maxDeduction: null },
    { code: "EQUIPMENT", name: "Equipment/Depreciation", maxDeduction: null },
    { code: "MARKETING", name: "Marketing/Advertising", maxDeduction: null },
    { code: "CHARITABLE", name: "Charitable Donations", maxDeduction: null },
    { code: "HEALTH", name: "Health Insurance (Self-Employed)", maxDeduction: null },
    { code: "RETIREMENT", name: "Retirement Contributions", maxDeduction: 66000 },
  ],
};

// 2024 Federal Tax Brackets (Single Filer)
const FEDERAL_TAX_BRACKETS = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

// Self-employment tax rate
const SELF_EMPLOYMENT_TAX_RATE = 0.153;

// Calculate federal tax based on taxable income
function calculateFederalTax(taxableIncome: number): number {
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of FEDERAL_TAX_BRACKETS) {
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

// Get quarterly due dates
function getQuarterlyDueDates(year: number) {
  return [
    { quarter: "Q1", period: "Jan 1 - Mar 31", dueDate: new Date(year, 3, 15) },
    { quarter: "Q2", period: "Apr 1 - May 31", dueDate: new Date(year, 5, 15) },
    { quarter: "Q3", period: "Jun 1 - Aug 31", dueDate: new Date(year, 8, 15) },
    { quarter: "Q4", period: "Sep 1 - Dec 31", dueDate: new Date(year + 1, 0, 15) },
  ];
}

export const taxModuleRouter = router({
  // Get tax summary from LuvLedger transactions
  getTaxSummary: protectedProcedure
    .input(z.object({
      year: z.number().default(new Date().getFullYear()),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const { year } = input;
      
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      
      // Get all transactions for the year
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
      let totalDeductions = 0;
      let contractorPayments = 0;
      
      for (const tx of transactions) {
        const amount = Number(tx.amount) || 0;
        if (tx.type === "income" || tx.type === "revenue") {
          totalIncome += amount;
        } else if (tx.type === "expense" || tx.type === "deduction") {
          totalDeductions += amount;
          if (tx.category === "contractor" || tx.category === "1099") {
            contractorPayments += amount;
          }
        }
      }
      
      const taxableIncome = Math.max(0, totalIncome - totalDeductions);
      const estimatedFederalTax = calculateFederalTax(taxableIncome);
      const selfEmploymentTax = taxableIncome * SELF_EMPLOYMENT_TAX_RATE * 0.9235;
      const totalEstimatedTax = estimatedFederalTax + selfEmploymentTax;
      
      return {
        year,
        totalIncome,
        totalDeductions,
        taxableIncome,
        estimatedFederalTax,
        selfEmploymentTax,
        totalEstimatedTax,
        contractorPayments,
        effectiveTaxRate: taxableIncome > 0 ? totalEstimatedTax / taxableIncome : 0,
        transactionCount: transactions.length,
      };
    }),

  // Get quarterly estimates
  getQuarterlyEstimates: protectedProcedure
    .input(z.object({
      year: z.number().default(new Date().getFullYear()),
    }))
    .query(async ({ input }) => {
      const { year } = input;
      const dueDates = getQuarterlyDueDates(year);
      const db = getDb();
      
      const quarters = [];
      
      for (const q of dueDates) {
        const quarterNum = parseInt(q.quarter.replace("Q", ""));
        const startMonth = (quarterNum - 1) * 3;
        const endMonth = startMonth + 2;
        
        const startDate = new Date(year, startMonth, 1);
        const endDate = new Date(year, endMonth + 1, 0, 23, 59, 59);
        
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
        let deductions = 0;
        
        for (const tx of transactions) {
          const amount = Number(tx.amount) || 0;
          if (tx.type === "income" || tx.type === "revenue") {
            income += amount;
          } else if (tx.type === "expense" || tx.type === "deduction") {
            deductions += amount;
          }
        }
        
        const taxableIncome = Math.max(0, income - deductions);
        const estimatedTax = calculateFederalTax(taxableIncome) + (taxableIncome * SELF_EMPLOYMENT_TAX_RATE * 0.9235);
        
        quarters.push({
          quarter: q.quarter,
          period: q.period,
          dueDate: q.dueDate,
          income,
          deductions,
          taxableIncome,
          estimatedTax,
          isPastDue: new Date() > q.dueDate,
        });
      }
      
      return quarters;
    }),

  // Get 1099 contractor payments
  get1099Payments: protectedProcedure
    .input(z.object({
      year: z.number().default(new Date().getFullYear()),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const { year } = input;
      
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      
      const transactions = await db
        .select()
        .from(luvLedgerTransactions)
        .where(
          and(
            gte(luvLedgerTransactions.createdAt, startDate),
            lte(luvLedgerTransactions.createdAt, endDate),
            eq(luvLedgerTransactions.category, "contractor")
          )
        )
        .orderBy(desc(luvLedgerTransactions.createdAt));
      
      const payeeMap = new Map<string, number>();
      
      for (const tx of transactions) {
        const payee = tx.description || "Unknown Contractor";
        const amount = Number(tx.amount) || 0;
        payeeMap.set(payee, (payeeMap.get(payee) || 0) + amount);
      }
      
      const contractors = Array.from(payeeMap.entries())
        .map(([name, total]) => ({
          name,
          total,
          requires1099: total >= 600,
        }))
        .sort((a, b) => b.total - a.total);
      
      return {
        year,
        contractors,
        totalContractorPayments: contractors.reduce((sum, c) => sum + c.total, 0),
        contractorsRequiring1099: contractors.filter(c => c.requires1099).length,
      };
    }),

  // Get tax projection calculator
  calculateTaxProjection: publicProcedure
    .input(z.object({
      grossIncome: z.number(),
      deductions: z.number().default(0),
      filingStatus: z.enum(["single", "married_joint", "married_separate", "head_of_household"]).default("single"),
      selfEmployed: z.boolean().default(false),
    }))
    .query(({ input }) => {
      const { grossIncome, deductions, filingStatus, selfEmployed } = input;
      
      const standardDeductions: Record<string, number> = {
        single: 14600,
        married_joint: 29200,
        married_separate: 14600,
        head_of_household: 21900,
      };
      
      const standardDeduction = standardDeductions[filingStatus];
      const totalDeductions = Math.max(deductions, standardDeduction);
      const taxableIncome = Math.max(0, grossIncome - totalDeductions);
      
      const federalTax = calculateFederalTax(taxableIncome);
      
      const selfEmploymentTax = selfEmployed 
        ? grossIncome * SELF_EMPLOYMENT_TAX_RATE * 0.9235 
        : 0;
      
      const totalTax = federalTax + selfEmploymentTax;
      const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0;
      const marginalRate = FEDERAL_TAX_BRACKETS.find(b => taxableIncome <= b.max)?.rate || 0.37;
      const takeHomePay = grossIncome - totalTax;
      
      return {
        grossIncome,
        totalDeductions,
        taxableIncome,
        federalTax,
        selfEmploymentTax,
        totalTax,
        effectiveRate,
        marginalRate,
        takeHomePay,
        monthlyTakeHome: takeHomePay / 12,
        quarterlyEstimate: totalTax / 4,
      };
    }),

  // Get tax categories
  getTaxCategories: publicProcedure.query(() => {
    return TAX_CATEGORIES;
  }),

  // Get tax brackets
  getTaxBrackets: publicProcedure.query(() => {
    return FEDERAL_TAX_BRACKETS;
  }),
});
