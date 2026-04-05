import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { createHash } from "crypto";

/**
 * Phase 32.3 + 32.4: Collective Investment Pools & Dashboard
 * 
 * Manages L.A.W.S. collective investment pools, member allocations,
 * income distribution, and investment dashboard for wealth tracking.
 */

// Helper to generate blockchain hash
function generateBlockchainHash(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

// Types
interface MemberAllocation {
  memberId: string;
  memberName: string;
  initialContribution: number;
  currentValue: number;
  sharePercentage: number;
  joinedAt: number;
}

interface PoolPerformance {
  totalFunded: number;
  currentValue: number;
  totalGains: number;
  gainPercentage: number;
  dividendIncome: number;
  memberCount: number;
  averageReturn: number;
}

interface DashboardMetrics {
  poolPerformance: PoolPerformance;
  topPerformers: Array<{
    memberId: string;
    memberName: string;
    gainPercentage: number;
    currentValue: number;
  }>;
  wealthProjections: Array<{
    year: number;
    projectedValue: number;
    projectedDividends: number;
  }>;
  allocationBreakdown: Array<{
    memberId: string;
    memberName: string;
    allocation: number;
    percentage: number;
  }>;
}

export const collectiveInvestmentPoolsRouter = router({
  /**
   * Create a new collective investment pool
   */
  createPool: protectedProcedure
    .input(
      z.object({
        poolName: z.string().min(1).max(100),
        description: z.string().max(500),
        targetAmount: z.number().positive(),
        investmentStrategy: z.enum([
          "dividend-growth",
          "balanced",
          "aggressive",
          "conservative",
        ]),
        riskLevel: z.enum(["low", "medium", "high"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const poolId = `pool_${Date.now()}`;
      const createdAt = Date.now();

      const poolData = {
        poolId,
        poolName: input.poolName,
        description: input.description,
        targetAmount: input.targetAmount,
        investmentStrategy: input.investmentStrategy,
        riskLevel: input.riskLevel,
        createdBy: ctx.user.id,
        createdAt,
        status: "active",
        totalFunded: 0,
        memberCount: 0,
      };

      const blockchainHash = generateBlockchainHash(JSON.stringify(poolData));

      return {
        ...poolData,
        blockchainHash,
        message: `Collective pool "${input.poolName}" created successfully`,
      };
    }),

  /**
   * Add member to collective pool with initial contribution
   */
  addMemberToPool: protectedProcedure
    .input(
      z.object({
        poolId: z.string(),
        memberId: z.string(),
        memberName: z.string(),
        contribution: z.number().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const joinedAt = Date.now();

      const allocationData = {
        poolId: input.poolId,
        memberId: input.memberId,
        memberName: input.memberName,
        initialContribution: input.contribution,
        currentValue: input.contribution,
        sharePercentage: 0, // Will be calculated based on total pool
        joinedAt,
        status: "active",
      };

      const blockchainHash = generateBlockchainHash(
        JSON.stringify(allocationData)
      );

      return {
        ...allocationData,
        blockchainHash,
        message: `Member ${input.memberName} added to pool with $${input.contribution} contribution`,
      };
    }),

  /**
   * Calculate member share percentage in pool
   */
  calculateMemberShare: publicProcedure
    .input(
      z.object({
        poolId: z.string(),
        memberId: z.string(),
        memberContribution: z.number().positive(),
        totalPoolValue: z.number().positive(),
      })
    )
    .query(async ({ input }) => {
      const sharePercentage = (input.memberContribution / input.totalPoolValue) * 100;

      return {
        memberId: input.memberId,
        poolId: input.poolId,
        sharePercentage: parseFloat(sharePercentage.toFixed(2)),
        contribution: input.memberContribution,
        poolValue: input.totalPoolValue,
      };
    }),

  /**
   * Distribute dividend income to members
   */
  distributeDividendIncome: protectedProcedure
    .input(
      z.object({
        poolId: z.string(),
        totalDividend: z.number().positive(),
        members: z.array(
          z.object({
            memberId: z.string(),
            memberName: z.string(),
            sharePercentage: z.number().min(0).max(100),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const distributions = input.members.map((member) => {
        const dividendShare = (input.totalDividend * member.sharePercentage) / 100;
        return {
          memberId: member.memberId,
          memberName: member.memberName,
          sharePercentage: member.sharePercentage,
          dividendReceived: parseFloat(dividendShare.toFixed(2)),
          timestamp: Date.now(),
        };
      });

      const distributionData = {
        poolId: input.poolId,
        totalDividend: input.totalDividend,
        distributions,
        distributedAt: Date.now(),
      };

      const blockchainHash = generateBlockchainHash(
        JSON.stringify(distributionData)
      );

      return {
        ...distributionData,
        blockchainHash,
        message: `Dividend of $${input.totalDividend} distributed to ${input.members.length} members`,
      };
    }),

  /**
   * Get pool performance metrics
   */
  getPoolPerformance: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(async ({ input }) => {
      // Simulated pool performance data
      const performance: PoolPerformance = {
        totalFunded: 50000,
        currentValue: 58750,
        totalGains: 8750,
        gainPercentage: 17.5,
        dividendIncome: 2450,
        memberCount: 12,
        averageReturn: 14.58,
      };

      return {
        poolId: input.poolId,
        ...performance,
        lastUpdated: Date.now(),
      };
    }),

  /**
   * Get investment dashboard metrics
   */
  getInvestmentDashboard: protectedProcedure
    .input(z.object({ poolId: z.string() }))
    .query(async ({ input }) => {
      // Simulated dashboard data
      const poolPerformance: PoolPerformance = {
        totalFunded: 50000,
        currentValue: 58750,
        totalGains: 8750,
        gainPercentage: 17.5,
        dividendIncome: 2450,
        memberCount: 12,
        averageReturn: 14.58,
      };

      const topPerformers = [
        {
          memberId: "member_1",
          memberName: "Alice Johnson",
          gainPercentage: 22.5,
          currentValue: 6125,
        },
        {
          memberId: "member_2",
          memberName: "Bob Smith",
          gainPercentage: 18.75,
          currentValue: 5625,
        },
        {
          memberId: "member_3",
          memberName: "Carol Davis",
          gainPercentage: 15.0,
          currentValue: 5375,
        },
      ];

      const wealthProjections = [
        { year: 2026, projectedValue: 58750, projectedDividends: 2450 },
        { year: 2027, projectedValue: 69000, projectedDividends: 2875 },
        { year: 2028, projectedValue: 81000, projectedDividends: 3375 },
        { year: 2029, projectedValue: 95000, projectedDividends: 3950 },
        { year: 2030, projectedValue: 111500, projectedDividends: 4625 },
      ];

      const allocationBreakdown = [
        { memberId: "member_1", memberName: "Alice Johnson", allocation: 5000, percentage: 10 },
        { memberId: "member_2", memberName: "Bob Smith", allocation: 4500, percentage: 9 },
        { memberId: "member_3", memberName: "Carol Davis", allocation: 4000, percentage: 8 },
        { memberId: "member_4", memberName: "Diana Wilson", allocation: 3500, percentage: 7 },
        { memberId: "member_5", memberName: "Edward Brown", allocation: 3000, percentage: 6 },
      ];

      const dashboard: DashboardMetrics = {
        poolPerformance,
        topPerformers,
        wealthProjections,
        allocationBreakdown,
      };

      return {
        poolId: input.poolId,
        ...dashboard,
        lastUpdated: Date.now(),
      };
    }),

  /**
   * Get member investment summary
   */
  getMemberInvestmentSummary: protectedProcedure
    .input(
      z.object({
        poolId: z.string(),
        memberId: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Simulated member data
      const memberData = {
        poolId: input.poolId,
        memberId: input.memberId,
        memberName: "Alice Johnson",
        initialContribution: 5000,
        currentValue: 6125,
        gains: 1125,
        gainPercentage: 22.5,
        sharePercentage: 10.34,
        dividendReceived: 245,
        joinedAt: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1 year ago
        investmentHistory: [
          {
            date: Date.now() - 30 * 24 * 60 * 60 * 1000,
            type: "dividend",
            amount: 61.25,
          },
          {
            date: Date.now() - 60 * 24 * 60 * 60 * 1000,
            type: "dividend",
            amount: 61.25,
          },
          {
            date: Date.now() - 90 * 24 * 60 * 60 * 1000,
            type: "dividend",
            amount: 61.25,
          },
        ],
      };

      return memberData;
    }),

  /**
   * Track wealth-building projection for member
   */
  getWealthBuildingProjection: publicProcedure
    .input(
      z.object({
        initialInvestment: z.number().positive(),
        annualReturn: z.number().min(0).max(100),
        yearsToProject: z.number().int().min(1).max(50),
      })
    )
    .query(async ({ input }) => {
      const projections = [];
      let currentValue = input.initialInvestment;

      for (let year = 1; year <= input.yearsToProject; year++) {
        currentValue = currentValue * (1 + input.annualReturn / 100);
        projections.push({
          year,
          projectedValue: parseFloat(currentValue.toFixed(2)),
          totalGains: parseFloat((currentValue - input.initialInvestment).toFixed(2)),
          gainPercentage: parseFloat(
            (((currentValue - input.initialInvestment) / input.initialInvestment) * 100).toFixed(2)
          ),
        });
      }

      return {
        initialInvestment: input.initialInvestment,
        annualReturn: input.annualReturn,
        projections,
      };
    }),

  /**
   * Calculate fair income distribution based on contributions
   */
  calculateFairDistribution: publicProcedure
    .input(
      z.object({
        totalIncome: z.number().positive(),
        members: z.array(
          z.object({
            memberId: z.string(),
            memberName: z.string(),
            contribution: z.number().positive(),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      const totalContribution = input.members.reduce((sum, m) => sum + m.contribution, 0);

      const distributions = input.members.map((member) => {
        const sharePercentage = (member.contribution / totalContribution) * 100;
        const incomeShare = (input.totalIncome * sharePercentage) / 100;

        return {
          memberId: member.memberId,
          memberName: member.memberName,
          contribution: member.contribution,
          sharePercentage: parseFloat(sharePercentage.toFixed(2)),
          incomeShare: parseFloat(incomeShare.toFixed(2)),
        };
      });

      return {
        totalIncome: input.totalIncome,
        totalContribution,
        distributions,
        timestamp: Date.now(),
      };
    }),

  /**
   * Get collective pool summary
   */
  getPoolSummary: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(async ({ input }) => {
      return {
        poolId: input.poolId,
        poolName: "L.A.W.S. Collective Investment Fund",
        totalMembers: 12,
        totalFunded: 50000,
        currentValue: 58750,
        totalGains: 8750,
        gainPercentage: 17.5,
        monthlyDividends: 204.17,
        investmentStrategy: "dividend-growth",
        riskLevel: "medium",
        createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
        lastUpdated: Date.now(),
      };
    }),
});
