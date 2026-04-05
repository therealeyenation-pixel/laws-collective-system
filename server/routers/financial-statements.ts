import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

/**
 * Financial Statements Router
 * 
 * Generates formal financial statements for grant applications:
 * - Balance Sheet (Assets, Liabilities, Equity)
 * - Income Statement / Profit & Loss
 * - Cash Flow Statement
 * 
 * Supports $0/startup state for new entities.
 */

// Types for financial data
interface BalanceSheetData {
  asOfDate: string;
  entityName: string;
  assets: {
    current: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      prepaidExpenses: number;
      otherCurrentAssets: number;
    };
    fixed: {
      equipment: number;
      furniture: number;
      vehicles: number;
      accumulatedDepreciation: number;
      otherFixedAssets: number;
    };
    other: {
      intangibleAssets: number;
      investments: number;
      otherAssets: number;
    };
  };
  liabilities: {
    current: {
      accountsPayable: number;
      accruedExpenses: number;
      shortTermDebt: number;
      deferredRevenue: number;
      otherCurrentLiabilities: number;
    };
    longTerm: {
      longTermDebt: number;
      notesPayable: number;
      otherLongTermLiabilities: number;
    };
  };
  equity: {
    ownerCapital: number;
    retainedEarnings: number;
    currentYearEarnings: number;
    otherEquity: number;
  };
}

interface IncomeStatementData {
  periodStart: string;
  periodEnd: string;
  entityName: string;
  revenue: {
    salesRevenue: number;
    serviceRevenue: number;
    grantRevenue: number;
    donationRevenue: number;
    otherRevenue: number;
  };
  costOfGoodsSold: {
    directLabor: number;
    materials: number;
    otherCOGS: number;
  };
  operatingExpenses: {
    salaries: number;
    rent: number;
    utilities: number;
    insurance: number;
    marketing: number;
    professionalFees: number;
    officeSupplies: number;
    travel: number;
    depreciation: number;
    otherOperating: number;
  };
  otherIncomeExpense: {
    interestIncome: number;
    interestExpense: number;
    otherIncome: number;
    otherExpense: number;
  };
}

interface CashFlowData {
  periodStart: string;
  periodEnd: string;
  entityName: string;
  beginningCash: number;
  operating: {
    netIncome: number;
    depreciation: number;
    accountsReceivableChange: number;
    inventoryChange: number;
    accountsPayableChange: number;
    otherOperating: number;
  };
  investing: {
    equipmentPurchases: number;
    equipmentSales: number;
    investmentPurchases: number;
    investmentSales: number;
    otherInvesting: number;
  };
  financing: {
    ownerContributions: number;
    ownerDistributions: number;
    loanProceeds: number;
    loanPayments: number;
    otherFinancing: number;
  };
}

export const financialStatementsRouter = router({
  // Get saved financial statements for an entity
  getStatements: protectedProcedure
    .input(z.object({ 
      entityId: z.number().optional(),
      year: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = sql`SELECT * FROM financial_statements WHERE userId = ${ctx.user.id}`;
      
      if (input.entityId) {
        query = sql`${query} AND entityId = ${input.entityId}`;
      }
      if (input.year) {
        query = sql`${query} AND fiscalYear = ${input.year}`;
      }
      
      query = sql`${query} ORDER BY createdAt DESC`;
      
      const statements = await db.execute(query);
      return statements as any[];
    }),

  // Generate Balance Sheet
  generateBalanceSheet: protectedProcedure
    .input(z.object({
      entityId: z.number().optional(),
      entityName: z.string(),
      asOfDate: z.string(),
      data: z.object({
        assets: z.object({
          current: z.object({
            cash: z.number().default(0),
            accountsReceivable: z.number().default(0),
            inventory: z.number().default(0),
            prepaidExpenses: z.number().default(0),
            otherCurrentAssets: z.number().default(0),
          }),
          fixed: z.object({
            equipment: z.number().default(0),
            furniture: z.number().default(0),
            vehicles: z.number().default(0),
            accumulatedDepreciation: z.number().default(0),
            otherFixedAssets: z.number().default(0),
          }),
          other: z.object({
            intangibleAssets: z.number().default(0),
            investments: z.number().default(0),
            otherAssets: z.number().default(0),
          }),
        }),
        liabilities: z.object({
          current: z.object({
            accountsPayable: z.number().default(0),
            accruedExpenses: z.number().default(0),
            shortTermDebt: z.number().default(0),
            deferredRevenue: z.number().default(0),
            otherCurrentLiabilities: z.number().default(0),
          }),
          longTerm: z.object({
            longTermDebt: z.number().default(0),
            notesPayable: z.number().default(0),
            otherLongTermLiabilities: z.number().default(0),
          }),
        }),
        equity: z.object({
          ownerCapital: z.number().default(0),
          retainedEarnings: z.number().default(0),
          currentYearEarnings: z.number().default(0),
          otherEquity: z.number().default(0),
        }),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, entityName, asOfDate } = input;
      
      // Calculate totals
      const totalCurrentAssets = 
        data.assets.current.cash +
        data.assets.current.accountsReceivable +
        data.assets.current.inventory +
        data.assets.current.prepaidExpenses +
        data.assets.current.otherCurrentAssets;

      const totalFixedAssets = 
        data.assets.fixed.equipment +
        data.assets.fixed.furniture +
        data.assets.fixed.vehicles -
        data.assets.fixed.accumulatedDepreciation +
        data.assets.fixed.otherFixedAssets;

      const totalOtherAssets = 
        data.assets.other.intangibleAssets +
        data.assets.other.investments +
        data.assets.other.otherAssets;

      const totalAssets = totalCurrentAssets + totalFixedAssets + totalOtherAssets;

      const totalCurrentLiabilities = 
        data.liabilities.current.accountsPayable +
        data.liabilities.current.accruedExpenses +
        data.liabilities.current.shortTermDebt +
        data.liabilities.current.deferredRevenue +
        data.liabilities.current.otherCurrentLiabilities;

      const totalLongTermLiabilities = 
        data.liabilities.longTerm.longTermDebt +
        data.liabilities.longTerm.notesPayable +
        data.liabilities.longTerm.otherLongTermLiabilities;

      const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

      const totalEquity = 
        data.equity.ownerCapital +
        data.equity.retainedEarnings +
        data.equity.currentYearEarnings +
        data.equity.otherEquity;

      const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

      // Check if balanced
      const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

      return {
        type: "balance_sheet",
        entityName,
        asOfDate,
        data: {
          ...data,
          totals: {
            totalCurrentAssets,
            totalFixedAssets,
            totalOtherAssets,
            totalAssets,
            totalCurrentLiabilities,
            totalLongTermLiabilities,
            totalLiabilities,
            totalEquity,
            totalLiabilitiesAndEquity,
          },
        },
        isBalanced,
        generatedAt: new Date().toISOString(),
      };
    }),

  // Generate Income Statement / P&L
  generateIncomeStatement: protectedProcedure
    .input(z.object({
      entityId: z.number().optional(),
      entityName: z.string(),
      periodStart: z.string(),
      periodEnd: z.string(),
      data: z.object({
        revenue: z.object({
          salesRevenue: z.number().default(0),
          serviceRevenue: z.number().default(0),
          grantRevenue: z.number().default(0),
          donationRevenue: z.number().default(0),
          otherRevenue: z.number().default(0),
        }),
        costOfGoodsSold: z.object({
          directLabor: z.number().default(0),
          materials: z.number().default(0),
          otherCOGS: z.number().default(0),
        }),
        operatingExpenses: z.object({
          salaries: z.number().default(0),
          rent: z.number().default(0),
          utilities: z.number().default(0),
          insurance: z.number().default(0),
          marketing: z.number().default(0),
          professionalFees: z.number().default(0),
          officeSupplies: z.number().default(0),
          travel: z.number().default(0),
          depreciation: z.number().default(0),
          otherOperating: z.number().default(0),
        }),
        otherIncomeExpense: z.object({
          interestIncome: z.number().default(0),
          interestExpense: z.number().default(0),
          otherIncome: z.number().default(0),
          otherExpense: z.number().default(0),
        }),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, entityName, periodStart, periodEnd } = input;

      // Calculate totals
      const totalRevenue = 
        data.revenue.salesRevenue +
        data.revenue.serviceRevenue +
        data.revenue.grantRevenue +
        data.revenue.donationRevenue +
        data.revenue.otherRevenue;

      const totalCOGS = 
        data.costOfGoodsSold.directLabor +
        data.costOfGoodsSold.materials +
        data.costOfGoodsSold.otherCOGS;

      const grossProfit = totalRevenue - totalCOGS;

      const totalOperatingExpenses = 
        data.operatingExpenses.salaries +
        data.operatingExpenses.rent +
        data.operatingExpenses.utilities +
        data.operatingExpenses.insurance +
        data.operatingExpenses.marketing +
        data.operatingExpenses.professionalFees +
        data.operatingExpenses.officeSupplies +
        data.operatingExpenses.travel +
        data.operatingExpenses.depreciation +
        data.operatingExpenses.otherOperating;

      const operatingIncome = grossProfit - totalOperatingExpenses;

      const totalOtherIncome = 
        data.otherIncomeExpense.interestIncome +
        data.otherIncomeExpense.otherIncome;

      const totalOtherExpense = 
        data.otherIncomeExpense.interestExpense +
        data.otherIncomeExpense.otherExpense;

      const netOtherIncomeExpense = totalOtherIncome - totalOtherExpense;

      const netIncome = operatingIncome + netOtherIncomeExpense;

      return {
        type: "income_statement",
        entityName,
        periodStart,
        periodEnd,
        data: {
          ...data,
          totals: {
            totalRevenue,
            totalCOGS,
            grossProfit,
            grossProfitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue * 100).toFixed(2) : "0.00",
            totalOperatingExpenses,
            operatingIncome,
            operatingMargin: totalRevenue > 0 ? (operatingIncome / totalRevenue * 100).toFixed(2) : "0.00",
            totalOtherIncome,
            totalOtherExpense,
            netOtherIncomeExpense,
            netIncome,
            netProfitMargin: totalRevenue > 0 ? (netIncome / totalRevenue * 100).toFixed(2) : "0.00",
          },
        },
        generatedAt: new Date().toISOString(),
      };
    }),

  // Generate Cash Flow Statement
  generateCashFlow: protectedProcedure
    .input(z.object({
      entityId: z.number().optional(),
      entityName: z.string(),
      periodStart: z.string(),
      periodEnd: z.string(),
      data: z.object({
        beginningCash: z.number().default(0),
        operating: z.object({
          netIncome: z.number().default(0),
          depreciation: z.number().default(0),
          accountsReceivableChange: z.number().default(0),
          inventoryChange: z.number().default(0),
          accountsPayableChange: z.number().default(0),
          otherOperating: z.number().default(0),
        }),
        investing: z.object({
          equipmentPurchases: z.number().default(0),
          equipmentSales: z.number().default(0),
          investmentPurchases: z.number().default(0),
          investmentSales: z.number().default(0),
          otherInvesting: z.number().default(0),
        }),
        financing: z.object({
          ownerContributions: z.number().default(0),
          ownerDistributions: z.number().default(0),
          loanProceeds: z.number().default(0),
          loanPayments: z.number().default(0),
          otherFinancing: z.number().default(0),
        }),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const { data, entityName, periodStart, periodEnd } = input;

      // Calculate cash from operating activities
      const cashFromOperating = 
        data.operating.netIncome +
        data.operating.depreciation -
        data.operating.accountsReceivableChange -
        data.operating.inventoryChange +
        data.operating.accountsPayableChange +
        data.operating.otherOperating;

      // Calculate cash from investing activities
      const cashFromInvesting = 
        -data.investing.equipmentPurchases +
        data.investing.equipmentSales -
        data.investing.investmentPurchases +
        data.investing.investmentSales +
        data.investing.otherInvesting;

      // Calculate cash from financing activities
      const cashFromFinancing = 
        data.financing.ownerContributions -
        data.financing.ownerDistributions +
        data.financing.loanProceeds -
        data.financing.loanPayments +
        data.financing.otherFinancing;

      const netChangeInCash = cashFromOperating + cashFromInvesting + cashFromFinancing;
      const endingCash = data.beginningCash + netChangeInCash;

      return {
        type: "cash_flow",
        entityName,
        periodStart,
        periodEnd,
        data: {
          ...data,
          totals: {
            cashFromOperating,
            cashFromInvesting,
            cashFromFinancing,
            netChangeInCash,
            endingCash,
          },
        },
        generatedAt: new Date().toISOString(),
      };
    }),

  // Generate startup/zero financial statements
  generateStartupStatements: protectedProcedure
    .input(z.object({
      entityName: z.string(),
      asOfDate: z.string(),
      initialCapital: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const { entityName, asOfDate, initialCapital } = input;

      // Balance Sheet with only initial capital
      const balanceSheet = {
        type: "balance_sheet",
        entityName,
        asOfDate,
        data: {
          assets: {
            current: {
              cash: initialCapital,
              accountsReceivable: 0,
              inventory: 0,
              prepaidExpenses: 0,
              otherCurrentAssets: 0,
            },
            fixed: {
              equipment: 0,
              furniture: 0,
              vehicles: 0,
              accumulatedDepreciation: 0,
              otherFixedAssets: 0,
            },
            other: {
              intangibleAssets: 0,
              investments: 0,
              otherAssets: 0,
            },
          },
          liabilities: {
            current: {
              accountsPayable: 0,
              accruedExpenses: 0,
              shortTermDebt: 0,
              deferredRevenue: 0,
              otherCurrentLiabilities: 0,
            },
            longTerm: {
              longTermDebt: 0,
              notesPayable: 0,
              otherLongTermLiabilities: 0,
            },
          },
          equity: {
            ownerCapital: initialCapital,
            retainedEarnings: 0,
            currentYearEarnings: 0,
            otherEquity: 0,
          },
          totals: {
            totalCurrentAssets: initialCapital,
            totalFixedAssets: 0,
            totalOtherAssets: 0,
            totalAssets: initialCapital,
            totalCurrentLiabilities: 0,
            totalLongTermLiabilities: 0,
            totalLiabilities: 0,
            totalEquity: initialCapital,
            totalLiabilitiesAndEquity: initialCapital,
          },
        },
        isBalanced: true,
        isStartup: true,
        generatedAt: new Date().toISOString(),
      };

      // Income Statement with zeros
      const incomeStatement = {
        type: "income_statement",
        entityName,
        periodStart: asOfDate,
        periodEnd: asOfDate,
        data: {
          revenue: {
            salesRevenue: 0,
            serviceRevenue: 0,
            grantRevenue: 0,
            donationRevenue: 0,
            otherRevenue: 0,
          },
          costOfGoodsSold: {
            directLabor: 0,
            materials: 0,
            otherCOGS: 0,
          },
          operatingExpenses: {
            salaries: 0,
            rent: 0,
            utilities: 0,
            insurance: 0,
            marketing: 0,
            professionalFees: 0,
            officeSupplies: 0,
            travel: 0,
            depreciation: 0,
            otherOperating: 0,
          },
          otherIncomeExpense: {
            interestIncome: 0,
            interestExpense: 0,
            otherIncome: 0,
            otherExpense: 0,
          },
          totals: {
            totalRevenue: 0,
            totalCOGS: 0,
            grossProfit: 0,
            grossProfitMargin: "0.00",
            totalOperatingExpenses: 0,
            operatingIncome: 0,
            operatingMargin: "0.00",
            totalOtherIncome: 0,
            totalOtherExpense: 0,
            netOtherIncomeExpense: 0,
            netIncome: 0,
            netProfitMargin: "0.00",
          },
        },
        isStartup: true,
        generatedAt: new Date().toISOString(),
      };

      // Cash Flow Statement
      const cashFlow = {
        type: "cash_flow",
        entityName,
        periodStart: asOfDate,
        periodEnd: asOfDate,
        data: {
          beginningCash: 0,
          operating: {
            netIncome: 0,
            depreciation: 0,
            accountsReceivableChange: 0,
            inventoryChange: 0,
            accountsPayableChange: 0,
            otherOperating: 0,
          },
          investing: {
            equipmentPurchases: 0,
            equipmentSales: 0,
            investmentPurchases: 0,
            investmentSales: 0,
            otherInvesting: 0,
          },
          financing: {
            ownerContributions: initialCapital,
            ownerDistributions: 0,
            loanProceeds: 0,
            loanPayments: 0,
            otherFinancing: 0,
          },
          totals: {
            cashFromOperating: 0,
            cashFromInvesting: 0,
            cashFromFinancing: initialCapital,
            netChangeInCash: initialCapital,
            endingCash: initialCapital,
          },
        },
        isStartup: true,
        generatedAt: new Date().toISOString(),
      };

      return {
        balanceSheet,
        incomeStatement,
        cashFlow,
        entityName,
        asOfDate,
        isStartup: true,
      };
    }),

  // Save financial statement to database
  saveStatement: protectedProcedure
    .input(z.object({
      entityId: z.number().optional(),
      statementType: z.enum(["balance_sheet", "income_statement", "cash_flow"]),
      fiscalYear: z.number(),
      periodStart: z.string(),
      periodEnd: z.string(),
      data: z.any(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(
        sql`INSERT INTO financial_statements 
            (userId, entityId, statementType, fiscalYear, periodStart, periodEnd, data, createdAt, updatedAt)
            VALUES (${ctx.user.id}, ${input.entityId || null}, ${input.statementType}, 
                    ${input.fiscalYear}, ${input.periodStart}, ${input.periodEnd}, 
                    ${JSON.stringify(input.data)}, NOW(), NOW())`
      );

      return { success: true };
    }),
});
