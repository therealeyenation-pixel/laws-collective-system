import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import * as tieredGovernance from "../services/tiered-governance";

export const tieredGovernanceRouter = router({
  // Get risk tier for an asset class
  getRiskTier: publicProcedure
    .input(z.object({ assetClass: z.string() }))
    .query(({ input }) => {
      return {
        assetClass: input.assetClass,
        riskTier: tieredGovernance.getRiskTier(input.assetClass),
        tierInfo: tieredGovernance.RISK_TIER_INFO[tieredGovernance.getRiskTier(input.assetClass)]
      };
    }),

  // Get all risk tiers with info
  getAllRiskTiers: publicProcedure
    .query(() => {
      return tieredGovernance.RISK_TIERS.map(tier => ({
        tier,
        ...tieredGovernance.RISK_TIER_INFO[tier]
      }));
    }),

  // Get default policy
  getDefaultPolicy: protectedProcedure
    .query(() => {
      return tieredGovernance.getDefaultPolicy();
    }),

  // Determine governance level for a transaction
  determineGovernanceLevel: protectedProcedure
    .input(z.object({
      assetClass: z.string(),
      amount: z.number().positive()
    }))
    .query(({ input }) => {
      const policy = tieredGovernance.getDefaultPolicy();
      const riskTier = tieredGovernance.getRiskTier(input.assetClass);
      const governanceLevel = tieredGovernance.determineGovernanceLevel(riskTier, input.amount, policy);
      
      return {
        assetClass: input.assetClass,
        amount: input.amount,
        riskTier,
        governanceLevel,
        tierInfo: tieredGovernance.RISK_TIER_INFO[riskTier]
      };
    }),

  // Create transaction request
  createTransactionRequest: protectedProcedure
    .input(z.object({
      type: z.enum(['buy', 'sell', 'transfer', 'rebalance']),
      assetClass: z.string(),
      ticker: z.string().optional(),
      amount: z.number().positive(),
      quantity: z.number().optional(),
      notes: z.string().optional(),
      portfolioId: z.string().optional(),
      totalPortfolioValue: z.number().optional()
    }))
    .mutation(({ input, ctx }) => {
      return tieredGovernance.createTransactionRequest({
        ...input,
        requestedBy: ctx.user.id.toString()
      });
    }),

  // Approve transaction request
  approveTransactionRequest: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      approverLevel: z.enum(['auto_approve', 'manager_approve', 'committee_review', 'board_approval', 'special_meeting'])
    }))
    .mutation(({ input, ctx }) => {
      return tieredGovernance.approveTransactionRequest(
        input.requestId,
        ctx.user.id.toString(),
        input.approverLevel
      );
    }),

  // Reject transaction request
  rejectTransactionRequest: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      reason: z.string()
    }))
    .mutation(({ input, ctx }) => {
      return tieredGovernance.rejectTransactionRequest(
        input.requestId,
        ctx.user.id.toString(),
        input.reason
      );
    }),

  // Execute transaction
  executeTransaction: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(({ input, ctx }) => {
      return tieredGovernance.executeTransaction(input.requestId, ctx.user.id.toString());
    }),

  // Get transaction requests
  getTransactionRequests: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'auto_approved', 'awaiting_approval', 'approved', 'rejected', 'executed', 'cancelled']).optional(),
      riskTier: z.enum(['cash', 'stablecoin', 'index', 'stock', 'volatile_crypto', 'speculative', 'property']).optional(),
      governanceLevel: z.enum(['auto_approve', 'manager_approve', 'committee_review', 'board_approval', 'special_meeting']).optional(),
      requestedBy: z.string().optional()
    }).optional())
    .query(({ input }) => {
      return tieredGovernance.getTransactionRequests(input);
    }),

  // Get pending approvals
  getPendingApprovals: protectedProcedure
    .input(z.object({
      governanceLevel: z.enum(['auto_approve', 'manager_approve', 'committee_review', 'board_approval', 'special_meeting']).optional()
    }).optional())
    .query(({ input }) => {
      return tieredGovernance.getPendingApprovals(input?.governanceLevel);
    }),

  // Update portfolio allocation
  updatePortfolioAllocation: protectedProcedure
    .input(z.object({
      portfolioId: z.string(),
      allocations: z.object({
        cash: z.number(),
        stablecoin: z.number(),
        index: z.number(),
        stock: z.number(),
        volatile_crypto: z.number(),
        speculative: z.number(),
        property: z.number()
      })
    }))
    .mutation(({ input }) => {
      tieredGovernance.updatePortfolioAllocation(input.portfolioId, input.allocations);
      return { success: true };
    }),

  // Get portfolio allocation
  getPortfolioAllocation: protectedProcedure
    .input(z.object({ portfolioId: z.string() }))
    .query(({ input }) => {
      return tieredGovernance.getPortfolioAllocation(input.portfolioId);
    }),

  // Check portfolio limits
  checkPortfolioLimits: protectedProcedure
    .input(z.object({
      portfolioId: z.string(),
      riskTier: z.enum(['cash', 'stablecoin', 'index', 'stock', 'volatile_crypto', 'speculative', 'property']),
      transactionAmount: z.number(),
      totalPortfolioValue: z.number()
    }))
    .query(({ input }) => {
      const policy = tieredGovernance.getDefaultPolicy();
      return tieredGovernance.checkPortfolioLimits(
        input.portfolioId,
        input.riskTier,
        input.transactionAmount,
        input.totalPortfolioValue,
        policy
      );
    }),

  // Calculate rebalancing recommendations
  calculateRebalancingRecommendations: protectedProcedure
    .input(z.object({
      portfolioId: z.string(),
      totalPortfolioValue: z.number()
    }))
    .query(({ input }) => {
      const policy = tieredGovernance.getDefaultPolicy();
      return tieredGovernance.calculateRebalancingRecommendations(
        input.portfolioId,
        input.totalPortfolioValue,
        policy
      );
    }),

  // Check if asset is prohibited
  isAssetProhibited: protectedProcedure
    .input(z.object({
      assetClass: z.string(),
      ticker: z.string().optional()
    }))
    .query(({ input }) => {
      const policy = tieredGovernance.getDefaultPolicy();
      return tieredGovernance.isAssetProhibited(input.assetClass, input.ticker, policy);
    }),

  // Generate governance summary
  generateGovernanceSummary: protectedProcedure
    .query(() => {
      return tieredGovernance.generateGovernanceSummary();
    })
});
