import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const foundingMemberBonusRouter = router({
  // ============================================
  // FOUNDING MEMBER MANAGEMENT
  // ============================================

  // Get all founding members
  getFoundingMembers: protectedProcedure
    .input(z.object({
      status: z.enum(['active', 'inactive', 'deceased', 'transferred', 'all']).default('active'),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `
        SELECT fm.*, u.name as user_name, u.email as user_email
        FROM founding_members fm
        LEFT JOIN user u ON fm.user_id = u.id
      `;
      const params: any[] = [];
      
      if (input.status !== 'all') {
        query += ` WHERE fm.status = ?`;
        params.push(input.status);
      }
      
      query += ` ORDER BY fm.member_number ASC`;
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  // Add founding member
  addFoundingMember: protectedProcedure
    .input(z.object({
      userId: z.number(),
      memberNumber: z.number(),
      joinedDate: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      
      const [result] = await db.execute(
        `INSERT INTO founding_members (user_id, member_number, joined_date, status, notes, created_at, updated_at)
         VALUES (?, ?, ?, 'active', ?, ?, ?)`,
        [input.userId, input.memberNumber, input.joinedDate, input.notes || null, now, now]
      );
      
      return { success: true, id: (result as any).insertId };
    }),

  // Update founding member status
  updateFoundingMemberStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['active', 'inactive', 'deceased', 'transferred']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      
      await db.execute(
        `UPDATE founding_members SET status = ?, notes = COALESCE(?, notes), updated_at = ? WHERE id = ?`,
        [input.status, input.notes, now, input.id]
      );
      
      return { success: true };
    }),

  // ============================================
  // BONUS POOL MANAGEMENT
  // ============================================

  // Get bonus pools
  getBonusPools: protectedProcedure
    .query(async () => {
      const db = await getDb();
      const [rows] = await db.execute(
        `SELECT * FROM bonus_pools ORDER BY created_at DESC`
      );
      return rows as any[];
    }),

  // Update bonus pool settings
  updateBonusPool: protectedProcedure
    .input(z.object({
      id: z.number(),
      sourcePercentage: z.number().min(0).max(100).optional(),
      distributionFrequency: z.enum(['monthly', 'quarterly', 'semi_annually', 'annually']).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      
      const updates: string[] = [];
      const params: any[] = [];
      
      if (input.sourcePercentage !== undefined) {
        updates.push('source_percentage = ?');
        params.push(input.sourcePercentage);
      }
      if (input.distributionFrequency !== undefined) {
        updates.push('distribution_frequency = ?');
        params.push(input.distributionFrequency);
      }
      if (input.isActive !== undefined) {
        updates.push('is_active = ?');
        params.push(input.isActive);
      }
      
      updates.push('updated_at = ?');
      params.push(now);
      params.push(input.id);
      
      await db.execute(
        `UPDATE bonus_pools SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      
      return { success: true };
    }),

  // ============================================
  // BONUS CALCULATION
  // ============================================

  // Calculate bonus for a period (preview without distributing)
  calculateBonusPreview: protectedProcedure
    .input(z.object({
      poolId: z.number(),
      periodStart: z.number(),
      periodEnd: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      // Get pool settings
      const [poolRows] = await db.execute(
        `SELECT * FROM bonus_pools WHERE id = ?`,
        [input.poolId]
      );
      const pool = (poolRows as any[])[0];
      if (!pool) throw new Error('Bonus pool not found');
      
      // Get total L.A.W.S. revenue for the period (from service payments)
      const [revenueRows] = await db.execute(
        `SELECT SUM(CAST(amount AS DECIMAL(15,2))) as total_revenue
         FROM service_payments
         WHERE payment_date BETWEEN ? AND ?
         AND payment_status = 'completed'`,
        [input.periodStart, input.periodEnd]
      );
      const totalRevenue = Number((revenueRows as any[])[0]?.total_revenue || 0);
      
      // Calculate L.A.W.S. 60% share
      const lawsShare = totalRevenue * 0.60;
      
      // Calculate bonus pool contribution (percentage of L.A.W.S. share)
      const poolContribution = lawsShare * (Number(pool.source_percentage) / 100);
      
      // Get eligible founding members (active status)
      const [memberRows] = await db.execute(
        `SELECT COUNT(*) as count FROM founding_members WHERE status = 'active'`
      );
      const eligibleMembers = Number((memberRows as any[])[0]?.count || 0);
      
      // Calculate per-member amount (equal share)
      const perMemberAmount = eligibleMembers > 0 ? poolContribution / eligibleMembers : 0;
      
      return {
        poolId: input.poolId,
        poolName: pool.pool_name,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        totalServiceRevenue: totalRevenue,
        lawsShare: lawsShare,
        bonusPercentage: Number(pool.source_percentage),
        poolContribution: poolContribution,
        eligibleMembers: eligibleMembers,
        perMemberAmount: perMemberAmount,
        distributionMethod: 'equal',
      };
    }),

  // ============================================
  // BONUS DISTRIBUTION
  // ============================================

  // Create and execute bonus distribution
  createDistribution: protectedProcedure
    .input(z.object({
      poolId: z.number(),
      periodStart: z.number(),
      periodEnd: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = Date.now();
      
      // Get pool settings
      const [poolRows] = await db.execute(
        `SELECT * FROM bonus_pools WHERE id = ?`,
        [input.poolId]
      );
      const pool = (poolRows as any[])[0];
      if (!pool) throw new Error('Bonus pool not found');
      if (!pool.is_active) throw new Error('Bonus pool is not active');
      
      // Calculate amounts (same as preview)
      const [revenueRows] = await db.execute(
        `SELECT SUM(CAST(amount AS DECIMAL(15,2))) as total_revenue
         FROM service_payments
         WHERE payment_date BETWEEN ? AND ?
         AND payment_status = 'completed'`,
        [input.periodStart, input.periodEnd]
      );
      const totalRevenue = Number((revenueRows as any[])[0]?.total_revenue || 0);
      const lawsShare = totalRevenue * 0.60;
      const poolContribution = lawsShare * (Number(pool.source_percentage) / 100);
      
      // Get eligible founding members
      const [memberRows] = await db.execute(
        `SELECT * FROM founding_members WHERE status = 'active'`
      );
      const members = memberRows as any[];
      const eligibleMembers = members.length;
      
      if (eligibleMembers === 0) {
        throw new Error('No eligible founding members for distribution');
      }
      
      const perMemberAmount = poolContribution / eligibleMembers;
      
      // Generate blockchain hash
      const crypto = require('crypto');
      const blockchainHash = crypto
        .createHash('sha256')
        .update(now.toString() + Math.random().toString())
        .digest('hex');
      
      // Create distribution record
      const [distResult] = await db.execute(
        `INSERT INTO bonus_distributions 
         (pool_id, distribution_date, period_start, period_end, total_revenue_base, 
          pool_contribution, total_distributed, eligible_members, per_member_amount,
          distribution_method, status, approved_by, approved_at, blockchain_hash, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'equal', 'approved', ?, ?, ?, ?, ?)`,
        [
          input.poolId, now, input.periodStart, input.periodEnd, totalRevenue,
          poolContribution, poolContribution, eligibleMembers, perMemberAmount,
          ctx.user.id, now, blockchainHash, input.notes || null, now
        ]
      );
      const distributionId = (distResult as any).insertId;
      
      // Create individual payment records for each founding member
      const paymentHashes: string[] = [];
      for (const member of members) {
        const paymentHash = crypto
          .createHash('sha256')
          .update(now.toString() + member.id + Math.random().toString())
          .digest('hex');
        paymentHashes.push(paymentHash);
        
        await db.execute(
          `INSERT INTO member_bonus_payments 
           (distribution_id, founding_member_id, user_id, amount, payment_method, 
            payment_status, blockchain_hash, created_at)
           VALUES (?, ?, ?, ?, 'check', 'pending', ?, ?)`,
          [distributionId, member.id, member.user_id, perMemberAmount, paymentHash, now]
        );
      }
      
      // Update pool balance
      await db.execute(
        `UPDATE bonus_pools 
         SET total_distributed = total_distributed + ?,
             last_distribution_date = ?,
             updated_at = ?
         WHERE id = ?`,
        [poolContribution, now, now, input.poolId]
      );
      
      // Record to LuvLedger
      await db.execute(
        `INSERT INTO luv_ledger_transactions 
         (from_account_id, to_account_id, amount, transaction_type, description, blockchain_hash, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          1, // L.A.W.S. account
          0, // Distribution pool (multiple recipients)
          poolContribution.toString(),
          'founding_member_bonus',
          `Founding Member Bonus Distribution - ${eligibleMembers} members @ $${perMemberAmount.toFixed(2)} each`,
          blockchainHash,
          'confirmed',
          now
        ]
      );
      
      // Create blockchain record
      await db.execute(
        `INSERT INTO blockchain_records (record_type, reference_id, blockchain_hash, data, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          'founding_member_bonus',
          distributionId,
          blockchainHash,
          JSON.stringify({
            distributionId,
            poolId: input.poolId,
            totalRevenue,
            poolContribution,
            eligibleMembers,
            perMemberAmount,
            memberPayments: paymentHashes.length,
            timestamp: new Date(now).toISOString()
          }),
          now
        ]
      );
      
      // Log to audit trail
      await db.execute(
        `INSERT INTO activity_audit_trail (user_id, activity_type, action, details, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          ctx.user.id,
          'founding_member_bonus_distributed',
          'create',
          JSON.stringify({
            distributionId,
            poolContribution,
            eligibleMembers,
            perMemberAmount,
            blockchainHash
          }),
          now
        ]
      );
      
      return {
        success: true,
        distributionId,
        totalDistributed: poolContribution,
        eligibleMembers,
        perMemberAmount,
        blockchainHash,
      };
    }),

  // Get distribution history
  getDistributionHistory: protectedProcedure
    .input(z.object({
      poolId: z.number().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `
        SELECT bd.*, bp.pool_name
        FROM bonus_distributions bd
        JOIN bonus_pools bp ON bd.pool_id = bp.id
      `;
      const params: any[] = [];
      
      if (input.poolId) {
        query += ` WHERE bd.pool_id = ?`;
        params.push(input.poolId);
      }
      
      query += ` ORDER BY bd.distribution_date DESC LIMIT ?`;
      params.push(input.limit);
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  // Get individual member payments for a distribution
  getDistributionPayments: protectedProcedure
    .input(z.object({
      distributionId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(
        `SELECT mbp.*, fm.member_number, u.name as member_name, u.email as member_email
         FROM member_bonus_payments mbp
         JOIN founding_members fm ON mbp.founding_member_id = fm.id
         LEFT JOIN user u ON mbp.user_id = u.id
         WHERE mbp.distribution_id = ?
         ORDER BY fm.member_number ASC`,
        [input.distributionId]
      );
      return rows as any[];
    }),

  // Update payment status (mark as paid)
  updatePaymentStatus: protectedProcedure
    .input(z.object({
      paymentId: z.number(),
      status: z.enum(['pending', 'processing', 'paid', 'failed', 'cancelled']),
      paymentReference: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = Date.now();
      
      const updates: string[] = ['payment_status = ?'];
      const params: any[] = [input.status];
      
      if (input.status === 'paid') {
        updates.push('paid_at = ?');
        params.push(now);
      }
      if (input.paymentReference) {
        updates.push('payment_reference = ?');
        params.push(input.paymentReference);
      }
      
      params.push(input.paymentId);
      
      await db.execute(
        `UPDATE member_bonus_payments SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      
      // Log to audit trail
      await db.execute(
        `INSERT INTO activity_audit_trail (user_id, activity_type, action, details, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          ctx.user.id,
          'bonus_payment_status_updated',
          'update',
          JSON.stringify({ paymentId: input.paymentId, newStatus: input.status }),
          now
        ]
      );
      
      return { success: true };
    }),

  // Get member's bonus history (for individual member view)
  getMemberBonusHistory: protectedProcedure
    .input(z.object({
      userId: z.number().optional(), // If not provided, uses current user
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = input.userId || ctx.user.id;
      
      // Check if user is a founding member
      const [memberRows] = await db.execute(
        `SELECT * FROM founding_members WHERE user_id = ?`,
        [userId]
      );
      const member = (memberRows as any[])[0];
      
      if (!member) {
        return { isFoundingMember: false, payments: [], totalEarned: 0 };
      }
      
      // Get all bonus payments for this member
      const [paymentRows] = await db.execute(
        `SELECT mbp.*, bd.period_start, bd.period_end, bd.distribution_date, bp.pool_name
         FROM member_bonus_payments mbp
         JOIN bonus_distributions bd ON mbp.distribution_id = bd.id
         JOIN bonus_pools bp ON bd.pool_id = bp.id
         WHERE mbp.founding_member_id = ?
         ORDER BY bd.distribution_date DESC`,
        [member.id]
      );
      
      // Calculate total earned
      const [totalRows] = await db.execute(
        `SELECT SUM(amount) as total FROM member_bonus_payments WHERE founding_member_id = ?`,
        [member.id]
      );
      
      return {
        isFoundingMember: true,
        memberNumber: member.member_number,
        joinedDate: member.joined_date,
        payments: paymentRows as any[],
        totalEarned: Number((totalRows as any[])[0]?.total || 0),
      };
    }),

  // Get bonus summary statistics
  getBonusSummary: protectedProcedure
    .query(async () => {
      const db = await getDb();
      
      // Total distributed all time
      const [totalRows] = await db.execute(
        `SELECT SUM(total_distributed) as total FROM bonus_distributions WHERE status = 'approved'`
      );
      
      // Active founding members count
      const [memberRows] = await db.execute(
        `SELECT COUNT(*) as count FROM founding_members WHERE status = 'active'`
      );
      
      // Distribution count
      const [distRows] = await db.execute(
        `SELECT COUNT(*) as count FROM bonus_distributions WHERE status = 'approved'`
      );
      
      // Pending payments
      const [pendingRows] = await db.execute(
        `SELECT COUNT(*) as count, SUM(amount) as total FROM member_bonus_payments WHERE payment_status = 'pending'`
      );
      
      // Last distribution
      const [lastRows] = await db.execute(
        `SELECT * FROM bonus_distributions WHERE status = 'approved' ORDER BY distribution_date DESC LIMIT 1`
      );
      
      return {
        totalDistributedAllTime: Number((totalRows as any[])[0]?.total || 0),
        activeFoundingMembers: Number((memberRows as any[])[0]?.count || 0),
        totalDistributions: Number((distRows as any[])[0]?.count || 0),
        pendingPaymentsCount: Number((pendingRows as any[])[0]?.count || 0),
        pendingPaymentsAmount: Number((pendingRows as any[])[0]?.total || 0),
        lastDistribution: (lastRows as any[])[0] || null,
      };
    }),
});
