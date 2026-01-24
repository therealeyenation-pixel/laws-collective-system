import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";
import crypto from "crypto";

// Generate blockchain-style hash for immutable records
function generateBlockchainHash(data: object): string {
  const timestamp = Date.now();
  const dataString = JSON.stringify({ ...data, timestamp });
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

export const closedLoopWealthRouter = router({
  // ==================== MEMBER BUSINESS MANAGEMENT ====================
  
  // Register a new member business
  registerMemberBusiness: protectedProcedure
    .input(z.object({
      businessName: z.string().min(1),
      businessType: z.enum(['llc', 'corporation', 's_corp', 'partnership', 'sole_proprietor', 'nonprofit']),
      ein: z.string().optional(),
      stateOfFormation: z.string().optional(),
      dateOfFormation: z.string().optional(),
      sponsoringHouseId: z.number().optional(),
      workerProgressionId: z.number().optional(),
      reinvestmentRate: z.number().min(5).max(50).default(10),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await db.execute(sql`
        INSERT INTO member_businesses (
          userId, businessName, businessType, ein, stateOfFormation, 
          dateOfFormation, membershipStatus, membershipTier, membershipStartDate,
          sponsoringHouseId, workerProgressionId, reinvestmentRate, notes
        ) VALUES (
          ${ctx.user.id}, ${input.businessName}, ${input.businessType}, 
          ${input.ein || null}, ${input.stateOfFormation || null},
          ${input.dateOfFormation || null}, 'pending', 'standard', CURDATE(),
          ${input.sponsoringHouseId || null}, ${input.workerProgressionId || null},
          ${input.reinvestmentRate}, ${input.notes || null}
        )
      `);
      
      return { success: true, message: 'Member business registration submitted for approval' };
    }),

  // Get all member businesses (admin view)
  getAllMemberBusinesses: protectedProcedure
    .input(z.object({
      status: z.enum(['all', 'pending', 'active', 'probationary', 'suspended', 'terminated']).default('all'),
      tier: z.enum(['all', 'standard', 'premium', 'elite', 'founding']).default('all'),
    }).optional())
    .query(async ({ input }) => {
      const status = input?.status || 'all';
      const tier = input?.tier || 'all';
      
      let query = sql`
        SELECT mb.*, u.name as ownerName, u.email as ownerEmail,
               h.name as houseName
        FROM member_businesses mb
        LEFT JOIN user u ON mb.userId = u.id
        LEFT JOIN houses h ON mb.sponsoringHouseId = h.id
        WHERE 1=1
      `;
      
      if (status !== 'all') {
        query = sql`${query} AND mb.membershipStatus = ${status}`;
      }
      if (tier !== 'all') {
        query = sql`${query} AND mb.membershipTier = ${tier}`;
      }
      
      query = sql`${query} ORDER BY mb.createdAt DESC`;
      
      const results = await db.execute(query);
      return results[0];
    }),

  // Get member business by user
  getMyMemberBusinesses: protectedProcedure
    .query(async ({ ctx }) => {
      const results = await db.execute(sql`
        SELECT mb.*, h.name as houseName
        FROM member_businesses mb
        LEFT JOIN houses h ON mb.sponsoringHouseId = h.id
        WHERE mb.userId = ${ctx.user.id}
        ORDER BY mb.createdAt DESC
      `);
      return results[0];
    }),

  // Update member business status (admin)
  updateMemberBusinessStatus: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      status: z.enum(['pending', 'active', 'probationary', 'suspended', 'terminated']),
      tier: z.enum(['standard', 'premium', 'elite', 'founding']).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.execute(sql`
        UPDATE member_businesses 
        SET membershipStatus = ${input.status},
            membershipTier = COALESCE(${input.tier || null}, membershipTier),
            notes = CONCAT(COALESCE(notes, ''), '\n', ${input.notes || ''})
        WHERE id = ${input.businessId}
      `);
      
      return { success: true };
    }),

  // ==================== COMMUNITY REINVESTMENT ====================
  
  // Record a community reinvestment contribution
  recordReinvestment: protectedProcedure
    .input(z.object({
      memberBusinessId: z.number(),
      periodStart: z.string(),
      periodEnd: z.string(),
      grossRevenue: z.number().min(0),
      actualAmount: z.number().min(0),
      paymentMethod: z.enum(['bank_transfer', 'crypto', 'check', 'internal_transfer', 'token_conversion']).optional(),
      transactionReference: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Get the business's reinvestment rate
      const businessResult = await db.execute(sql`
        SELECT reinvestmentRate FROM member_businesses WHERE id = ${input.memberBusinessId}
      `);
      const business = (businessResult[0] as any[])[0];
      const rate = business?.reinvestmentRate || 10;
      
      const calculatedAmount = (input.grossRevenue * rate) / 100;
      const paymentStatus = input.actualAmount >= calculatedAmount ? 'paid' : 
                           input.actualAmount > 0 ? 'partial' : 'pending';
      
      const blockchainHash = generateBlockchainHash({
        memberBusinessId: input.memberBusinessId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        grossRevenue: input.grossRevenue,
        actualAmount: input.actualAmount,
      });
      
      await db.execute(sql`
        INSERT INTO community_reinvestments (
          memberBusinessId, periodStart, periodEnd, grossRevenue,
          reinvestmentRate, calculatedAmount, actualAmount, paymentStatus,
          paymentMethod, paymentDate, transactionReference, blockchainHash, notes
        ) VALUES (
          ${input.memberBusinessId}, ${input.periodStart}, ${input.periodEnd},
          ${input.grossRevenue}, ${rate}, ${calculatedAmount}, ${input.actualAmount},
          ${paymentStatus}, ${input.paymentMethod || null}, 
          ${input.actualAmount > 0 ? 'CURDATE()' : null},
          ${input.transactionReference || null}, ${blockchainHash}, ${input.notes || null}
        )
      `);
      
      // Update member business totals
      await db.execute(sql`
        UPDATE member_businesses 
        SET totalContributed = totalContributed + ${input.actualAmount},
            lastContributionDate = CURDATE()
        WHERE id = ${input.memberBusinessId}
      `);
      
      // Add to treasury reinvestment pool
      if (input.actualAmount > 0) {
        await db.execute(sql`
          UPDATE collective_treasury 
          SET currentBalance = currentBalance + ${input.actualAmount},
              totalDeposits = totalDeposits + ${input.actualAmount},
              lastDepositDate = CURDATE()
          WHERE fundType = 'reinvestment_pool'
        `);
        
        // Record treasury transaction
        const treasuryResult = await db.execute(sql`
          SELECT id, currentBalance FROM collective_treasury WHERE fundType = 'reinvestment_pool'
        `);
        const treasury = (treasuryResult[0] as any[])[0];
        
        await db.execute(sql`
          INSERT INTO treasury_transactions (
            treasuryFundId, transactionType, amount, sourceType, sourceId,
            description, balanceBefore, balanceAfter, blockchainHash
          ) VALUES (
            ${treasury.id}, 'deposit', ${input.actualAmount}, 'member_reinvestment',
            ${input.memberBusinessId}, 
            ${'Community reinvestment from member business'},
            ${Number(treasury.currentBalance) - input.actualAmount},
            ${treasury.currentBalance}, ${blockchainHash}
          )
        `);
      }
      
      return { success: true, calculatedAmount, paymentStatus, blockchainHash };
    }),

  // Get reinvestment history for a business
  getReinvestmentHistory: protectedProcedure
    .input(z.object({
      memberBusinessId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = sql`
        SELECT cr.*, mb.businessName
        FROM community_reinvestments cr
        JOIN member_businesses mb ON cr.memberBusinessId = mb.id
        WHERE 1=1
      `;
      
      if (input?.memberBusinessId) {
        query = sql`${query} AND cr.memberBusinessId = ${input.memberBusinessId}`;
      }
      if (input?.startDate) {
        query = sql`${query} AND cr.periodStart >= ${input.startDate}`;
      }
      if (input?.endDate) {
        query = sql`${query} AND cr.periodEnd <= ${input.endDate}`;
      }
      
      query = sql`${query} ORDER BY cr.periodEnd DESC`;
      
      const results = await db.execute(query);
      return results[0];
    }),

  // Calculate pending reinvestments
  calculatePendingReinvestments: protectedProcedure
    .query(async () => {
      const results = await db.execute(sql`
        SELECT mb.id, mb.businessName, mb.reinvestmentRate,
               COALESCE(SUM(cr.calculatedAmount - cr.actualAmount), 0) as pendingAmount
        FROM member_businesses mb
        LEFT JOIN community_reinvestments cr ON mb.id = cr.memberBusinessId 
          AND cr.paymentStatus IN ('pending', 'partial', 'overdue')
        WHERE mb.membershipStatus = 'active'
        GROUP BY mb.id, mb.businessName, mb.reinvestmentRate
        HAVING pendingAmount > 0
      `);
      return results[0];
    }),

  // ==================== PROSPERITY DISTRIBUTIONS ====================
  
  // Create a prosperity distribution request
  createDistribution: protectedProcedure
    .input(z.object({
      distributionType: z.enum(['member_benefit', 'development_funding', 'stability_support', 'growth_investment', 'legacy_distribution']),
      recipientType: z.enum(['member_business', 'house', 'individual', 'collective']),
      recipientId: z.number(),
      amount: z.number().min(0),
      tokenAmount: z.number().optional(),
      sourceType: z.enum(['collective_treasury', 'reinvestment_pool', 'grant_fund', 'donation', 'revenue_share']),
      purpose: z.string().min(10),
      conditions: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const blockchainHash = generateBlockchainHash(input);
      
      await db.execute(sql`
        INSERT INTO prosperity_distributions (
          distributionType, recipientType, recipientId, amount, tokenAmount,
          sourceType, purpose, approvalStatus, conditions, notes, blockchainHash
        ) VALUES (
          ${input.distributionType}, ${input.recipientType}, ${input.recipientId},
          ${input.amount}, ${input.tokenAmount || null}, ${input.sourceType},
          ${input.purpose}, 'pending', ${input.conditions || null}, 
          ${input.notes || null}, ${blockchainHash}
        )
      `);
      
      return { success: true, blockchainHash };
    }),

  // Approve/reject distribution
  processDistribution: protectedProcedure
    .input(z.object({
      distributionId: z.number(),
      action: z.enum(['approve', 'reject', 'disburse']),
      disbursementMethod: z.enum(['bank_transfer', 'crypto', 'check', 'internal_transfer', 'token_distribution']).optional(),
      transactionReference: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const newStatus = input.action === 'approve' ? 'approved' : 
                       input.action === 'reject' ? 'rejected' : 'disbursed';
      
      const blockchainHash = generateBlockchainHash({
        distributionId: input.distributionId,
        action: input.action,
        processedBy: ctx.user.id,
      });
      
      await db.execute(sql`
        UPDATE prosperity_distributions 
        SET approvalStatus = ${newStatus},
            approvedBy = ${ctx.user.id},
            approvalDate = NOW(),
            disbursementDate = ${input.action === 'disburse' ? 'CURDATE()' : null},
            disbursementMethod = ${input.disbursementMethod || null},
            transactionReference = ${input.transactionReference || null},
            blockchainHash = ${blockchainHash},
            notes = CONCAT(COALESCE(notes, ''), '\n', ${input.notes || ''})
        WHERE id = ${input.distributionId}
      `);
      
      // If disbursing, update treasury and member business
      if (input.action === 'disburse') {
        const distResult = await db.execute(sql`
          SELECT * FROM prosperity_distributions WHERE id = ${input.distributionId}
        `);
        const distribution = (distResult[0] as any[])[0];
        
        if (distribution) {
          // Deduct from appropriate treasury fund
          const fundType = distribution.sourceType === 'reinvestment_pool' ? 'reinvestment_pool' :
                          distribution.distributionType === 'development_funding' ? 'development_fund' :
                          distribution.distributionType === 'stability_support' ? 'stability_reserve' :
                          'operating_fund';
          
          await db.execute(sql`
            UPDATE collective_treasury 
            SET currentBalance = currentBalance - ${distribution.amount},
                totalWithdrawals = totalWithdrawals + ${distribution.amount},
                lastWithdrawalDate = CURDATE()
            WHERE fundType = ${fundType}
          `);
          
          // Update member business benefits received
          if (distribution.recipientType === 'member_business') {
            await db.execute(sql`
              UPDATE member_businesses 
              SET totalBenefitsReceived = totalBenefitsReceived + ${distribution.amount}
              WHERE id = ${distribution.recipientId}
            `);
          }
        }
      }
      
      return { success: true, newStatus, blockchainHash };
    }),

  // Get distributions
  getDistributions: protectedProcedure
    .input(z.object({
      status: z.enum(['all', 'pending', 'approved', 'disbursed', 'rejected', 'cancelled']).default('all'),
      type: z.enum(['all', 'member_benefit', 'development_funding', 'stability_support', 'growth_investment', 'legacy_distribution']).default('all'),
      recipientId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const status = input?.status || 'all';
      const type = input?.type || 'all';
      
      let query = sql`
        SELECT pd.*, 
               CASE 
                 WHEN pd.recipientType = 'member_business' THEN mb.businessName
                 WHEN pd.recipientType = 'house' THEN h.name
                 ELSE 'N/A'
               END as recipientName,
               u.name as approverName
        FROM prosperity_distributions pd
        LEFT JOIN member_businesses mb ON pd.recipientType = 'member_business' AND pd.recipientId = mb.id
        LEFT JOIN houses h ON pd.recipientType = 'house' AND pd.recipientId = h.id
        LEFT JOIN user u ON pd.approvedBy = u.id
        WHERE 1=1
      `;
      
      if (status !== 'all') {
        query = sql`${query} AND pd.approvalStatus = ${status}`;
      }
      if (type !== 'all') {
        query = sql`${query} AND pd.distributionType = ${type}`;
      }
      if (input?.recipientId) {
        query = sql`${query} AND pd.recipientId = ${input.recipientId}`;
      }
      
      query = sql`${query} ORDER BY pd.createdAt DESC`;
      
      const results = await db.execute(query);
      return results[0];
    }),

  // ==================== COLLECTIVE TREASURY ====================
  
  // Get treasury overview
  getTreasuryOverview: publicProcedure
    .query(async () => {
      const funds = await db.execute(sql`
        SELECT * FROM collective_treasury ORDER BY allocationPercentage DESC
      `);
      
      const totals = await db.execute(sql`
        SELECT 
          SUM(currentBalance) as totalBalance,
          SUM(tokenBalance) as totalTokens,
          SUM(totalDeposits) as totalDeposits,
          SUM(totalWithdrawals) as totalWithdrawals
        FROM collective_treasury
      `);
      
      const recentTransactions = await db.execute(sql`
        SELECT tt.*, ct.fundName
        FROM treasury_transactions tt
        JOIN collective_treasury ct ON tt.treasuryFundId = ct.id
        ORDER BY tt.createdAt DESC
        LIMIT 20
      `);
      
      return {
        funds: funds[0],
        totals: (totals[0] as any[])[0],
        recentTransactions: recentTransactions[0],
      };
    }),

  // Get treasury transactions
  getTreasuryTransactions: protectedProcedure
    .input(z.object({
      fundId: z.number().optional(),
      transactionType: z.enum(['all', 'deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'allocation', 'adjustment']).default('all'),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      let query = sql`
        SELECT tt.*, ct.fundName, ct.fundType
        FROM treasury_transactions tt
        JOIN collective_treasury ct ON tt.treasuryFundId = ct.id
        WHERE 1=1
      `;
      
      if (input?.fundId) {
        query = sql`${query} AND tt.treasuryFundId = ${input.fundId}`;
      }
      if (input?.transactionType && input.transactionType !== 'all') {
        query = sql`${query} AND tt.transactionType = ${input.transactionType}`;
      }
      
      query = sql`${query} ORDER BY tt.createdAt DESC LIMIT ${input?.limit || 50}`;
      
      const results = await db.execute(query);
      return results[0];
    }),

  // Transfer between treasury funds
  transferBetweenFunds: protectedProcedure
    .input(z.object({
      fromFundId: z.number(),
      toFundId: z.number(),
      amount: z.number().min(0.01),
      reason: z.string().min(5),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get current balances
      const fromFund = await db.execute(sql`
        SELECT * FROM collective_treasury WHERE id = ${input.fromFundId}
      `);
      const toFund = await db.execute(sql`
        SELECT * FROM collective_treasury WHERE id = ${input.toFundId}
      `);
      
      const from = (fromFund[0] as any[])[0];
      const to = (toFund[0] as any[])[0];
      
      if (!from || !to) {
        throw new Error('Invalid fund IDs');
      }
      
      if (Number(from.currentBalance) < input.amount) {
        throw new Error('Insufficient funds in source treasury');
      }
      
      const blockchainHash = generateBlockchainHash({
        fromFundId: input.fromFundId,
        toFundId: input.toFundId,
        amount: input.amount,
        processedBy: ctx.user.id,
      });
      
      // Update balances
      await db.execute(sql`
        UPDATE collective_treasury 
        SET currentBalance = currentBalance - ${input.amount},
            totalWithdrawals = totalWithdrawals + ${input.amount},
            lastWithdrawalDate = CURDATE()
        WHERE id = ${input.fromFundId}
      `);
      
      await db.execute(sql`
        UPDATE collective_treasury 
        SET currentBalance = currentBalance + ${input.amount},
            totalDeposits = totalDeposits + ${input.amount},
            lastDepositDate = CURDATE()
        WHERE id = ${input.toFundId}
      `);
      
      // Record transactions
      await db.execute(sql`
        INSERT INTO treasury_transactions (
          treasuryFundId, transactionType, amount, sourceType, destinationType,
          destinationId, description, balanceBefore, balanceAfter, processedBy, blockchainHash
        ) VALUES (
          ${input.fromFundId}, 'transfer_out', ${input.amount}, 'transfer', 'transfer',
          ${input.toFundId}, ${input.reason}, ${from.currentBalance},
          ${Number(from.currentBalance) - input.amount}, ${ctx.user.id}, ${blockchainHash}
        )
      `);
      
      await db.execute(sql`
        INSERT INTO treasury_transactions (
          treasuryFundId, transactionType, amount, sourceType, sourceId,
          description, balanceBefore, balanceAfter, processedBy, blockchainHash
        ) VALUES (
          ${input.toFundId}, 'transfer_in', ${input.amount}, 'transfer',
          ${input.fromFundId}, ${input.reason}, ${to.currentBalance},
          ${Number(to.currentBalance) + input.amount}, ${ctx.user.id}, ${blockchainHash}
        )
      `);
      
      return { success: true, blockchainHash };
    }),

  // ==================== DASHBOARD & ANALYTICS ====================
  
  // Get closed-loop wealth dashboard
  getWealthDashboard: publicProcedure
    .query(async () => {
      // Member business stats
      const memberStats = await db.execute(sql`
        SELECT 
          COUNT(*) as totalMembers,
          SUM(CASE WHEN membershipStatus = 'active' THEN 1 ELSE 0 END) as activeMembers,
          SUM(CASE WHEN membershipStatus = 'pending' THEN 1 ELSE 0 END) as pendingMembers,
          SUM(totalContributed) as totalContributions,
          SUM(totalBenefitsReceived) as totalBenefitsDistributed,
          AVG(complianceScore) as avgComplianceScore
        FROM member_businesses
      `);
      
      // Treasury totals
      const treasuryTotals = await db.execute(sql`
        SELECT 
          SUM(currentBalance) as totalTreasuryBalance,
          SUM(totalDeposits) as lifetimeDeposits,
          SUM(totalWithdrawals) as lifetimeWithdrawals
        FROM collective_treasury
      `);
      
      // Recent activity
      const recentReinvestments = await db.execute(sql`
        SELECT cr.*, mb.businessName
        FROM community_reinvestments cr
        JOIN member_businesses mb ON cr.memberBusinessId = mb.id
        ORDER BY cr.createdAt DESC
        LIMIT 5
      `);
      
      const recentDistributions = await db.execute(sql`
        SELECT pd.*, 
               CASE 
                 WHEN pd.recipientType = 'member_business' THEN mb.businessName
                 ELSE 'Collective'
               END as recipientName
        FROM prosperity_distributions pd
        LEFT JOIN member_businesses mb ON pd.recipientType = 'member_business' AND pd.recipientId = mb.id
        ORDER BY pd.createdAt DESC
        LIMIT 5
      `);
      
      // Wealth flow metrics
      const monthlyFlow = await db.execute(sql`
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          SUM(CASE WHEN transactionType IN ('deposit', 'transfer_in') THEN amount ELSE 0 END) as inflow,
          SUM(CASE WHEN transactionType IN ('withdrawal', 'transfer_out') THEN amount ELSE 0 END) as outflow
        FROM treasury_transactions
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month DESC
      `);
      
      return {
        memberStats: (memberStats[0] as any[])[0],
        treasuryTotals: (treasuryTotals[0] as any[])[0],
        recentReinvestments: recentReinvestments[0],
        recentDistributions: recentDistributions[0],
        monthlyFlow: monthlyFlow[0],
      };
    }),

  // Get member business compliance report
  getComplianceReport: protectedProcedure
    .query(async () => {
      const results = await db.execute(sql`
        SELECT 
          mb.id, mb.businessName, mb.membershipStatus, mb.membershipTier,
          mb.reinvestmentRate, mb.totalContributed, mb.complianceScore,
          mb.lastContributionDate,
          DATEDIFF(CURDATE(), mb.lastContributionDate) as daysSinceLastContribution,
          COUNT(cr.id) as totalContributions,
          SUM(CASE WHEN cr.paymentStatus = 'overdue' THEN 1 ELSE 0 END) as overduePayments
        FROM member_businesses mb
        LEFT JOIN community_reinvestments cr ON mb.id = cr.memberBusinessId
        WHERE mb.membershipStatus IN ('active', 'probationary')
        GROUP BY mb.id
        ORDER BY mb.complianceScore ASC
      `);
      return results[0];
    }),

  // ==================== L.A.W.S. EMPLOYMENT INTEGRATION ====================
  
  // Get the full wealth-building loop metrics
  getWealthLoopMetrics: publicProcedure
    .query(async () => {
      // Employment metrics from L.A.W.S.
      const employmentMetrics = await db.execute(sql`
        SELECT 
          COUNT(*) as totalPositions,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as openPositions,
          SUM(CASE WHEN status = 'filled' THEN 1 ELSE 0 END) as filledPositions
        FROM laws_positions
      `);
      
      const fundingMetrics = await db.execute(sql`
        SELECT 
          funding_type,
          COUNT(*) as positionCount,
          SUM(budget_amount) as totalBudget
        FROM position_funding
        GROUP BY funding_type
      `);
      
      const applicationMetrics = await db.execute(sql`
        SELECT 
          COUNT(*) as totalApplications,
          SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hiredCount
        FROM laws_applications
      `);
      
      // Worker progression metrics
      const progressionMetrics = await db.execute(sql`
        SELECT 
          currentStage,
          COUNT(*) as workerCount
        FROM worker_progressions
        GROUP BY currentStage
      `);
      
      // Member business metrics
      const memberMetrics = await db.execute(sql`
        SELECT 
          COUNT(*) as totalBusinesses,
          SUM(CASE WHEN membershipStatus = 'active' THEN 1 ELSE 0 END) as activeBusinesses,
          SUM(totalContributed) as totalReinvestment
        FROM member_businesses
      `);
      
      // Treasury metrics
      const treasuryMetrics = await db.execute(sql`
        SELECT 
          SUM(currentBalance) as totalTreasuryBalance,
          SUM(totalDeposits) as totalDeposits
        FROM collective_treasury
      `);
      
      return {
        employment: (employmentMetrics[0] as any[])[0],
        funding: fundingMetrics[0],
        applications: (applicationMetrics[0] as any[])[0],
        progression: progressionMetrics[0],
        memberBusinesses: (memberMetrics[0] as any[])[0],
        treasury: (treasuryMetrics[0] as any[])[0],
      };
    }),

  // Track a worker's complete journey through the wealth loop
  getWorkerJourney: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      // Get worker progression
      const progression = await db.execute(sql`
        SELECT * FROM worker_progressions WHERE userId = ${input.userId}
      `);
      
      // Get any applications
      const applications = await db.execute(sql`
        SELECT la.*, lp.title as positionTitle, lp.pillar
        FROM laws_applications la
        JOIN laws_positions lp ON la.position_id = lp.id
        WHERE la.user_id = ${input.userId}
        ORDER BY la.created_at DESC
      `);
      
      // Get member business if they have one
      const business = await db.execute(sql`
        SELECT * FROM member_businesses WHERE userId = ${input.userId}
      `);
      
      // Get reinvestments if they have a business
      let reinvestments: any[] = [];
      const businessData = (business[0] as any[])[0];
      if (businessData) {
        const reinvestmentResults = await db.execute(sql`
          SELECT * FROM community_reinvestments 
          WHERE memberBusinessId = ${businessData.id}
          ORDER BY createdAt DESC
          LIMIT 10
        `);
        reinvestments = reinvestmentResults[0] as any[];
      }
      
      // Get distributions received
      const distributions = await db.execute(sql`
        SELECT * FROM prosperity_distributions 
        WHERE recipientType = 'member_business' 
        AND recipientId IN (SELECT id FROM member_businesses WHERE userId = ${input.userId})
        ORDER BY createdAt DESC
        LIMIT 10
      `);
      
      return {
        progression: (progression[0] as any[])[0] || null,
        applications: applications[0],
        business: businessData || null,
        reinvestments,
        distributions: distributions[0],
      };
    }),

  // Get member business profile for current user
  getMemberBusinessProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await db.execute(sql`
        SELECT 
          mb.*,
          h.houseName,
          COALESCE((SELECT SUM(amount) FROM community_reinvestments WHERE memberBusinessId = mb.id AND status = 'paid'), 0) as totalReinvestment,
          COALESCE((SELECT SUM(amount) FROM community_reinvestments WHERE memberBusinessId = mb.id AND status = 'paid' AND YEAR(createdAt) = YEAR(CURDATE())), 0) as ytdReinvestment,
          COALESCE((SELECT SUM(amount) FROM prosperity_distributions WHERE recipientType = 'member_business' AND recipientId = mb.id), 0) as totalDistributions,
          (SELECT COUNT(*) FROM member_businesses WHERE referredBy = mb.id) as referralCount
        FROM member_businesses mb
        LEFT JOIN houses h ON mb.sponsoringHouseId = h.id
        WHERE mb.userId = ${ctx.user.id}
        LIMIT 1
      `);
      
      const business = (result[0] as any[])[0];
      if (!business) return null;
      
      return {
        ...business,
        reinvestmentRate: business.reinvestmentRate || 10,
        complianceStatus: business.membershipStatus === 'active' ? 'compliant' : 'pending',
      };
    }),

  // Get reinvestment history for current user's business
  getMyReinvestmentHistory: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await db.execute(sql`
        SELECT cr.* 
        FROM community_reinvestments cr
        JOIN member_businesses mb ON cr.memberBusinessId = mb.id
        WHERE mb.userId = ${ctx.user.id}
        ORDER BY cr.createdAt DESC
        LIMIT 20
      `);
      return result[0] as any[];
    }),

  // Get prosperity distributions for current user's business
  getProsperityDistributions: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await db.execute(sql`
        SELECT pd.* 
        FROM prosperity_distributions pd
        JOIN member_businesses mb ON pd.recipientId = mb.id AND pd.recipientType = 'member_business'
        WHERE mb.userId = ${ctx.user.id}
        ORDER BY pd.createdAt DESC
        LIMIT 20
      `);
      return result[0] as any[];
    }),

  // Get member benefits
  getMemberBenefits: protectedProcedure
    .query(async ({ ctx }) => {
      // Get user's membership tier
      const business = await db.execute(sql`
        SELECT membershipTier FROM member_businesses WHERE userId = ${ctx.user.id}
      `);
      
      const tier = ((business[0] as any[])[0])?.membershipTier || 'standard';
      
      const allBenefits = [
        { name: 'Academy Access', tier: 'standard' },
        { name: 'Business Consulting', tier: 'standard' },
        { name: 'Network Events', tier: 'standard' },
        { name: 'Marketing Support', tier: 'premium' },
        { name: 'Priority Grant Access', tier: 'premium' },
        { name: 'Dedicated Account Manager', tier: 'elite' },
        { name: 'Board Advisory Access', tier: 'elite' },
        { name: 'Founding Recognition', tier: 'founding' },
      ];
      
      const tierOrder = ['standard', 'premium', 'elite', 'founding'];
      const userTierIndex = tierOrder.indexOf(tier);
      
      return allBenefits.map(b => ({
        ...b,
        available: tierOrder.indexOf(b.tier) <= userTierIndex,
      }));
    }),

  // Submit community reinvestment
  submitReinvestment: protectedProcedure
    .input(z.object({
      amount: z.number().positive(),
      period: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get user's business
      const business = await db.execute(sql`
        SELECT id FROM member_businesses WHERE userId = ${ctx.user.id}
      `);
      
      const businessId = ((business[0] as any[])[0])?.id;
      if (!businessId) {
        throw new Error('No member business found');
      }
      
      const blockchainHash = generateBlockchainHash({
        businessId,
        amount: input.amount,
        period: input.period,
        userId: ctx.user.id,
      });
      
      await db.execute(sql`
        INSERT INTO community_reinvestments (
          memberBusinessId, amount, period, status, blockchainHash
        ) VALUES (
          ${businessId}, ${input.amount}, ${input.period}, 'pending', ${blockchainHash}
        )
      `);
      
      return { success: true };
    }),

  // Register a new member business (public application)
  registerMemberBusiness: publicProcedure
    .input(z.object({
      businessName: z.string().min(1),
      businessType: z.enum(['llc', 'corporation', 'sole_proprietorship', 'partnership', 'nonprofit']),
      ein: z.string().optional(),
      stateOfFormation: z.string(),
      yearEstablished: z.number().optional(),
      industry: z.string(),
      description: z.string(),
      website: z.string().optional(),
      contactName: z.string(),
      contactTitle: z.string(),
      contactEmail: z.string().email(),
      contactPhone: z.string(),
      businessAddress: z.string(),
      businessCity: z.string(),
      businessState: z.string(),
      businessZip: z.string(),
      lawsPillar: z.enum(['land', 'air', 'water', 'self']),
      sponsoringHouseId: z.number().optional(),
      annualRevenue: z.string(),
      employeeCount: z.number().default(1),
      communityCommitment: z.string(),
    }))
    .mutation(async ({ input }) => {
      const blockchainHash = generateBlockchainHash({
        businessName: input.businessName,
        contactEmail: input.contactEmail,
        timestamp: Date.now(),
      });
      
      await db.execute(sql`
        INSERT INTO member_businesses (
          businessName, businessType, ein, stateOfFormation, yearEstablished,
          industry, description, website, contactName, contactTitle,
          contactEmail, contactPhone, businessAddress, businessCity,
          businessState, businessZip, lawsPillar, sponsoringHouseId,
          annualRevenue, employeeCount, communityCommitment,
          membershipStatus, membershipTier, reinvestmentRate, blockchainHash
        ) VALUES (
          ${input.businessName}, ${input.businessType}, ${input.ein || null},
          ${input.stateOfFormation}, ${input.yearEstablished || null},
          ${input.industry}, ${input.description}, ${input.website || null},
          ${input.contactName}, ${input.contactTitle}, ${input.contactEmail},
          ${input.contactPhone}, ${input.businessAddress}, ${input.businessCity},
          ${input.businessState}, ${input.businessZip}, ${input.lawsPillar},
          ${input.sponsoringHouseId || null}, ${input.annualRevenue},
          ${input.employeeCount}, ${input.communityCommitment},
          'pending', 'standard', 10, ${blockchainHash}
        )
      `);
      
      return { success: true, message: 'Application submitted successfully' };
    }),
});
