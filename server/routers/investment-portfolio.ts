import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import {
  ASSET_CLASSES,
  TRANSACTION_TYPES,
  ACCOUNT_TYPES,
  createInvestmentAccount,
  getInvestmentAccount,
  listInvestmentAccounts,
  updateAccountStatus,
  createHolding,
  getHolding,
  listHoldings,
  updateHoldingPrice,
  recordTransaction,
  listTransactions,
  recordDividend,
  listDividends,
  calculatePortfolioAllocation,
  calculatePortfolioPerformance,
  calculateTaxLots,
  generatePortfolioSummary,
  generateRebalancingSuggestions,
  linkTransactionToLuvLedger,
} from '../services/investment-portfolio';

export const investmentPortfolioRouter = router({
  // Get constants
  getAssetClasses: publicProcedure.query(() => ASSET_CLASSES),
  getTransactionTypes: publicProcedure.query(() => TRANSACTION_TYPES),
  getAccountTypes: publicProcedure.query(() => ACCOUNT_TYPES),

  // Account management
  createAccount: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      accountName: z.string(),
      accountType: z.enum(ACCOUNT_TYPES),
      custodian: z.string(),
      accountNumber: z.string(),
      taxStatus: z.enum(['taxable', 'tax_deferred', 'tax_exempt']),
      openedDate: z.coerce.date(),
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => createInvestmentAccount(input)),

  getAccount: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .query(({ input }) => getInvestmentAccount(input.accountId)),

  listAccounts: protectedProcedure
    .input(z.object({ entityId: z.string().optional() }).optional())
    .query(({ input }) => listInvestmentAccounts(input?.entityId)),

  updateAccountStatus: protectedProcedure
    .input(z.object({
      accountId: z.string(),
      status: z.enum(['active', 'closed', 'frozen']),
    }))
    .mutation(({ input }) => updateAccountStatus(input.accountId, input.status)),

  // Holding management
  createHolding: protectedProcedure
    .input(z.object({
      accountId: z.string(),
      ticker: z.string(),
      cusip: z.string().optional(),
      name: z.string(),
      assetClass: z.enum(ASSET_CLASSES),
      shares: z.number(),
      costBasis: z.number(),
      currentPrice: z.number(),
      purchaseDate: z.coerce.date(),
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => createHolding(input)),

  getHolding: protectedProcedure
    .input(z.object({ holdingId: z.string() }))
    .query(({ input }) => getHolding(input.holdingId)),

  listHoldings: protectedProcedure
    .input(z.object({ accountId: z.string().optional() }).optional())
    .query(({ input }) => listHoldings(input?.accountId)),

  updateHoldingPrice: protectedProcedure
    .input(z.object({
      holdingId: z.string(),
      currentPrice: z.number(),
    }))
    .mutation(({ input }) => updateHoldingPrice(input.holdingId, input.currentPrice)),

  // Transaction management
  recordTransaction: protectedProcedure
    .input(z.object({
      accountId: z.string(),
      holdingId: z.string().optional(),
      transactionType: z.enum(TRANSACTION_TYPES),
      ticker: z.string(),
      shares: z.number(),
      pricePerShare: z.number(),
      fees: z.number().optional(),
      transactionDate: z.coerce.date(),
      settlementDate: z.coerce.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => recordTransaction(input)),

  listTransactions: protectedProcedure
    .input(z.object({
      accountId: z.string().optional(),
      holdingId: z.string().optional(),
      transactionType: z.enum(TRANSACTION_TYPES).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    }).optional())
    .query(({ input }) => listTransactions(input)),

  // Dividend management
  recordDividend: protectedProcedure
    .input(z.object({
      holdingId: z.string(),
      accountId: z.string(),
      ticker: z.string(),
      exDividendDate: z.coerce.date(),
      paymentDate: z.coerce.date(),
      dividendPerShare: z.number(),
      shares: z.number(),
      taxWithheld: z.number().optional(),
      reinvested: z.boolean().optional(),
      reinvestmentPrice: z.number().optional(),
    }))
    .mutation(({ input }) => recordDividend(input)),

  listDividends: protectedProcedure
    .input(z.object({
      accountId: z.string().optional(),
      holdingId: z.string().optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    }).optional())
    .query(({ input }) => listDividends(input)),

  // Portfolio analysis
  getPortfolioAllocation: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .query(({ input }) => calculatePortfolioAllocation(input.accountId)),

  getPortfolioPerformance: protectedProcedure
    .input(z.object({
      accountId: z.string(),
      periodStart: z.coerce.date(),
      periodEnd: z.coerce.date(),
    }))
    .query(({ input }) => calculatePortfolioPerformance(
      input.accountId,
      input.periodStart,
      input.periodEnd
    )),

  getTaxLots: protectedProcedure
    .input(z.object({ holdingId: z.string() }))
    .query(({ input }) => calculateTaxLots(input.holdingId)),

  getPortfolioSummary: protectedProcedure
    .input(z.object({ entityId: z.string() }))
    .query(({ input }) => generatePortfolioSummary(input.entityId)),

  getRebalancingSuggestions: protectedProcedure
    .input(z.object({
      accountId: z.string(),
      targetAllocation: z.record(z.enum(ASSET_CLASSES), z.number()),
    }))
    .query(({ input }) => generateRebalancingSuggestions(
      input.accountId,
      input.targetAllocation as Record<typeof ASSET_CLASSES[number], number>
    )),

  // LuvLedger integration
  linkToLuvLedger: protectedProcedure
    .input(z.object({
      transactionId: z.string(),
      luvLedgerEntryId: z.string(),
    }))
    .mutation(({ input }) => linkTransactionToLuvLedger(
      input.transactionId,
      input.luvLedgerEntryId
    )),
});
