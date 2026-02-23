import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { randomUUID } from "crypto";

export const revenueFlowRouter = router({
  // Get dashboard overview
  getDashboardOverview: protectedProcedure.query(async () => {
    const [sources] = await db.query(`
      SELECT 
        COUNT(*) as totalSources,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeSources
      FROM revenue_sources
    `);
    
    const [transactions] = await db.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as totalRevenue,
        COALESCE(SUM(CASE WHEN transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END), 0) as monthlyRevenue,
        COALESCE(SUM(CASE WHEN transaction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN amount ELSE 0 END), 0) as weeklyRevenue,
        COUNT(*) as totalTransactions
      FROM revenue_transactions
      WHERE status = 'completed'
    `);
    
    const [splits] = await db.query(`
      SELECT 
        COALESCE(SUM(family_portion), 0) as totalFamilyPortion,
        COALESCE(SUM(network_portion), 0) as totalNetworkPortion,
        COUNT(*) as totalSplits,
        SUM(CASE WHEN split_status = 'distributed' THEN 1 ELSE 0 END) as distributedSplits
      FROM revenue_splits
    `);
    
    const sourceData = (sources as any[])[0] || { totalSources: 0, activeSources: 0 };
    const transactionData = (transactions as any[])[0] || { totalRevenue: 0, monthlyRevenue: 0, weeklyRevenue: 0, totalTransactions: 0 };
    const splitData = (splits as any[])[0] || { totalFamilyPortion: 0, totalNetworkPortion: 0, totalSplits: 0, distributedSplits: 0 };
    
    return {
      sources: sourceData,
      transactions: transactionData,
      splits: splitData,
      progression: {
        businessCreation: { stage: 1, label: "Business Creation", description: "Create and manage businesses" },
        lawsCollective: { stage: 2, label: "L.A.W.S. Collective", description: "Revenue generation through brand" },
        trustDeposit: { stage: 3, label: "Trust Deposit", description: "Revenue flows into Trust" },
        splitEngine: { stage: 4, label: "60/40 Split", description: "Automated wealth distribution" },
        wealthAccumulation: { stage: 5, label: "Wealth Accumulation", description: "Long-term wealth building" },
      },
    };
  }),

  // Get revenue sources
  getRevenueSources: protectedProcedure
    .input(z.object({
      businessId: z.string().optional(),
      houseId: z.string().optional(),
      sourceType: z.string().optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      let query = `SELECT * FROM revenue_sources WHERE 1=1`;
      const params: any[] = [];
      
      if (input?.businessId) {
        query += ` AND business_id = ?`;
        params.push(input.businessId);
      }
      if (input?.houseId) {
        query += ` AND house_id = ?`;
        params.push(input.houseId);
      }
      if (input?.sourceType) {
        query += ` AND source_type = ?`;
        params.push(input.sourceType);
      }
      if (input?.isActive !== undefined) {
        query += ` AND is_active = ?`;
        params.push(input.isActive);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const [rows] = await db.query(query, params);
      return rows as any[];
    }),

  // Create revenue source
  createRevenueSource: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      sourceType: z.enum(["merchandise", "academy", "consulting", "membership", "services", "licensing", "investment", "donation", "other"]),
      businessId: z.string().optional(),
      houseId: z.string().optional(),
      brand: z.string().optional().default("L.A.W.S. Collective"),
      monthlyTarget: z.number().optional(),
      yearlyTarget: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = randomUUID();
      
      await db.query(`
        INSERT INTO revenue_sources (id, name, description, source_type, business_id, house_id, brand, monthly_target, yearly_target)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, input.name, input.description || null, input.sourceType, input.businessId || null, input.houseId || null, input.brand, input.monthlyTarget || 0, input.yearlyTarget || 0]);
      
      return { id, ...input };
    }),

  // Record revenue transaction with automatic 60/40 split
  recordTransaction: protectedProcedure
    .input(z.object({
      sourceId: z.string(),
      amount: z.number().positive(),
      currency: z.string().optional().default("USD"),
      transactionDate: z.string(),
      description: z.string().optional(),
      referenceId: z.string().optional(),
      referenceType: z.string().optional(),
      trustId: z.string().optional(),
      foundingHouseId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const transactionId = randomUUID();
      const splitId = randomUUID();
      
      // Calculate 60/40 split
      const familyPortion = input.amount * 0.60;
      const networkPortion = input.amount * 0.40;
      
      // Insert transaction
      await db.query(`
        INSERT INTO revenue_transactions (id, source_id, amount, currency, transaction_date, description, reference_id, reference_type, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')
      `, [transactionId, input.sourceId, input.amount, input.currency, input.transactionDate, input.description || null, input.referenceId || null, input.referenceType || null]);
      
      // Insert split record
      await db.query(`
        INSERT INTO revenue_splits (id, transaction_id, total_amount, family_portion, family_percentage, network_portion, network_percentage, trust_id, founding_house_id, split_status)
        VALUES (?, ?, ?, ?, 60.00, ?, 40.00, ?, ?, 'pending')
      `, [splitId, transactionId, input.amount, familyPortion, networkPortion, input.trustId || null, input.foundingHouseId || null]);
      
      // Log flow stages
      const logReceived = randomUUID();
      const logSplit = randomUUID();
      
      await db.query(`
        INSERT INTO revenue_flow_logs (id, flow_stage, transaction_id, amount, from_entity, to_entity, description)
        VALUES (?, 'received', ?, ?, 'L.A.W.S. Collective', 'Trust', ?)
      `, [logReceived, transactionId, input.amount, `Revenue received: ${input.description || 'Transaction'}`]);
      
      await db.query(`
        INSERT INTO revenue_flow_logs (id, flow_stage, transaction_id, split_id, amount, from_entity, to_entity, description)
        VALUES (?, 'split_calculated', ?, ?, ?, 'Trust', '60/40 Split Engine', ?)
      `, [logSplit, transactionId, splitId, input.amount, `Split calculated: $${familyPortion.toFixed(2)} family / $${networkPortion.toFixed(2)} network`]);
      
      return {
        transactionId,
        splitId,
        amount: input.amount,
        familyPortion,
        networkPortion,
      };
    }),

  // Process split distribution
  processSplitDistribution: protectedProcedure
    .input(z.object({
      splitId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const [splits] = await db.query(`SELECT * FROM revenue_splits WHERE id = ?`, [input.splitId]);
      const split = (splits as any[])[0];
      
      if (!split) {
        throw new Error("Split not found");
      }
      
      if (split.split_status === 'distributed') {
        throw new Error("Split already distributed");
      }
      
      await db.query(`
        UPDATE revenue_splits 
        SET split_status = 'distributed', processed_at = NOW(), distributed_at = NOW()
        WHERE id = ?
      `, [input.splitId]);
      
      const logFamily = randomUUID();
      await db.query(`
        INSERT INTO revenue_flow_logs (id, flow_stage, split_id, amount, from_entity, to_entity, description)
        VALUES (?, 'family_allocated', ?, ?, '60/40 Split Engine', 'Founding House', ?)
      `, [logFamily, input.splitId, split.family_portion, `Family portion allocated: $${split.family_portion}`]);
      
      const logNetwork = randomUUID();
      await db.query(`
        INSERT INTO revenue_flow_logs (id, flow_stage, split_id, amount, from_entity, to_entity, description)
        VALUES (?, 'network_allocated', ?, ?, '60/40 Split Engine', 'Network Pool', ?)
      `, [logNetwork, input.splitId, split.network_portion, `Network portion allocated: $${split.network_portion}`]);
      
      return { success: true, splitId: input.splitId };
    }),

  // Get transactions
  getTransactions: protectedProcedure
    .input(z.object({
      sourceId: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().optional().default(50),
    }).optional())
    .query(async ({ input }) => {
      let query = `
        SELECT t.*, s.name as source_name, s.source_type, s.brand
        FROM revenue_transactions t
        LEFT JOIN revenue_sources s ON t.source_id = s.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input?.sourceId) {
        query += ` AND t.source_id = ?`;
        params.push(input.sourceId);
      }
      if (input?.status) {
        query += ` AND t.status = ?`;
        params.push(input.status);
      }
      
      query += ` ORDER BY t.transaction_date DESC LIMIT ?`;
      params.push(input?.limit || 50);
      
      const [rows] = await db.query(query, params);
      return rows as any[];
    }),

  // Get splits
  getSplits: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().optional().default(50),
    }).optional())
    .query(async ({ input }) => {
      let query = `
        SELECT rs.*, rt.amount as transaction_amount, rt.description as transaction_description
        FROM revenue_splits rs
        LEFT JOIN revenue_transactions rt ON rs.transaction_id = rt.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input?.status) {
        query += ` AND rs.split_status = ?`;
        params.push(input.status);
      }
      
      query += ` ORDER BY rs.created_at DESC LIMIT ?`;
      params.push(input?.limit || 50);
      
      const [rows] = await db.query(query, params);
      return rows as any[];
    }),

  // Get flow logs for audit trail
  getFlowLogs: protectedProcedure
    .input(z.object({
      transactionId: z.string().optional(),
      splitId: z.string().optional(),
      flowStage: z.string().optional(),
      limit: z.number().optional().default(100),
    }).optional())
    .query(async ({ input }) => {
      let query = `SELECT * FROM revenue_flow_logs WHERE 1=1`;
      const params: any[] = [];
      
      if (input?.transactionId) {
        query += ` AND transaction_id = ?`;
        params.push(input.transactionId);
      }
      if (input?.splitId) {
        query += ` AND split_id = ?`;
        params.push(input.splitId);
      }
      if (input?.flowStage) {
        query += ` AND flow_stage = ?`;
        params.push(input.flowStage);
      }
      
      query += ` ORDER BY created_at DESC LIMIT ?`;
      params.push(input?.limit || 100);
      
      const [rows] = await db.query(query, params);
      return rows as any[];
    }),

  // Get revenue by source type
  getRevenueBySourceType: protectedProcedure.query(async () => {
    const [rows] = await db.query(`
      SELECT 
        s.source_type,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_revenue
      FROM revenue_sources s
      LEFT JOIN revenue_transactions t ON s.id = t.source_id AND t.status = 'completed'
      GROUP BY s.source_type
      ORDER BY total_revenue DESC
    `);
    return rows as any[];
  }),

  // Get monthly revenue trend
  getMonthlyRevenueTrend: protectedProcedure
    .input(z.object({
      months: z.number().optional().default(12),
    }).optional())
    .query(async ({ input }) => {
      const [rows] = await db.query(`
        SELECT 
          DATE_FORMAT(transaction_date, '%Y-%m') as month,
          COALESCE(SUM(amount), 0) as total_revenue,
          COUNT(*) as transaction_count
        FROM revenue_transactions
        WHERE status = 'completed'
          AND transaction_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
        ORDER BY month ASC
      `, [input?.months || 12]);
      return rows as any[];
    }),
});
