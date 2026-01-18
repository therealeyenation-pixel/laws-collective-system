import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";

// Helper to get database
async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database unavailable",
    });
  }
  return db;
}

// Membership tier pricing
const TIER_PRICING = {
  basic: { monthly: 49, annual: 499, referralFee: 10 },
  professional: { monthly: 149, annual: 1499, referralFee: 7.5 },
  enterprise: { monthly: 399, annual: 3999, referralFee: 5 },
};

export const contractorNetworkRouter = router({
  // ============================================================================
  // NETWORK MEMBERSHIP
  // ============================================================================

  // Get network dashboard
  getNetworkDashboard: protectedProcedure.query(async () => {
    const db = await requireDb();
    
    // Total members by tier
    const [memberStats] = await (db as any).execute(`
      SELECT 
        COUNT(*) as totalMembers,
        SUM(CASE WHEN membershipTier = 'basic' THEN 1 ELSE 0 END) as basicMembers,
        SUM(CASE WHEN membershipTier = 'professional' THEN 1 ELSE 0 END) as professionalMembers,
        SUM(CASE WHEN membershipTier = 'enterprise' THEN 1 ELSE 0 END) as enterpriseMembers,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeMembers,
        SUM(totalRevenueGenerated) as totalNetworkRevenue,
        SUM(totalReferralsPaid) as totalReferralsPaid
      FROM contractor_network_members
    `);
    
    // Subscription revenue
    const [subscriptionStats] = await (db as any).execute(`
      SELECT 
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as totalSubscriptionRevenue,
        SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdueAmount,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdueCount
      FROM network_subscriptions
    `);
    
    // Referral stats
    const [referralStats] = await (db as any).execute(`
      SELECT 
        COUNT(*) as totalReferrals,
        SUM(CASE WHEN status = 'completed' OR status = 'paid' THEN 1 ELSE 0 END) as completedReferrals,
        SUM(CASE WHEN status = 'paid' THEN referralFeeAmount ELSE 0 END) as totalReferralFeesPaid,
        SUM(projectValue) as totalProjectValue
      FROM network_referrals
    `);
    
    // Sub-contractor relationships
    const [subContractorStats] = await (db as any).execute(`
      SELECT 
        COUNT(*) as totalRelationships,
        SUM(CASE WHEN relationshipType = 'pipeline' THEN 1 ELSE 0 END) as pipelineCount,
        SUM(trainingFeePaid) as totalTrainingFees
      FROM sub_contractor_relationships
      WHERE status = 'active'
    `);

    return {
      members: {
        total: (memberStats as any[])[0]?.totalMembers || 0,
        active: (memberStats as any[])[0]?.activeMembers || 0,
        byTier: {
          basic: (memberStats as any[])[0]?.basicMembers || 0,
          professional: (memberStats as any[])[0]?.professionalMembers || 0,
          enterprise: (memberStats as any[])[0]?.enterpriseMembers || 0,
        },
        totalRevenue: (memberStats as any[])[0]?.totalNetworkRevenue || 0,
      },
      subscriptions: {
        totalRevenue: (subscriptionStats as any[])[0]?.totalSubscriptionRevenue || 0,
        overdueAmount: (subscriptionStats as any[])[0]?.overdueAmount || 0,
        overdueCount: (subscriptionStats as any[])[0]?.overdueCount || 0,
      },
      referrals: {
        total: (referralStats as any[])[0]?.totalReferrals || 0,
        completed: (referralStats as any[])[0]?.completedReferrals || 0,
        feesPaid: (referralStats as any[])[0]?.totalReferralFeesPaid || 0,
        projectValue: (referralStats as any[])[0]?.totalProjectValue || 0,
      },
      subContractors: {
        activeRelationships: (subContractorStats as any[])[0]?.totalRelationships || 0,
        pipelineCount: (subContractorStats as any[])[0]?.pipelineCount || 0,
        trainingFees: (subContractorStats as any[])[0]?.totalTrainingFees || 0,
      },
      tierPricing: TIER_PRICING,
    };
  }),

  // Get all network members
  getNetworkMembers: protectedProcedure
    .input(z.object({
      status: z.enum(["active", "suspended", "cancelled", "pending"]).optional(),
      tier: z.enum(["basic", "professional", "enterprise"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      
      let query = `
        SELECT nm.*, cb.businessName, cb.ownerName
        FROM contractor_network_members nm
        LEFT JOIN contractor_businesses cb ON nm.contractorId = cb.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input?.status) {
        query += " AND nm.status = ?";
        params.push(input.status);
      }
      
      if (input?.tier) {
        query += " AND nm.membershipTier = ?";
        params.push(input.tier);
      }
      
      query += " ORDER BY nm.joinedAt DESC";
      
      const [members] = await (db as any).execute(query, params);
      
      return members as any[];
    }),

  // Add network member (after contractor transition)
  addNetworkMember: protectedProcedure
    .input(z.object({
      contractorId: z.number(),
      membershipTier: z.enum(["basic", "professional", "enterprise"]).default("basic"),
      parentContractorId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      const pricing = TIER_PRICING[input.membershipTier];
      const now = new Date();
      const nextPayment = new Date(now);
      nextPayment.setMonth(nextPayment.getMonth() + 1);
      
      // Determine network level
      let networkLevel = 1;
      if (input.parentContractorId) {
        const [parent] = await (db as any).execute(
          "SELECT networkLevel FROM contractor_network_members WHERE contractorId = ?",
          [input.parentContractorId]
        );
        if ((parent as any[]).length > 0) {
          networkLevel = (parent as any[])[0].networkLevel + 1;
        }
      }
      
      await (db as any).execute(
        `INSERT INTO contractor_network_members 
        (contractorId, membershipTier, monthlyFee, referralFeePercentage, joinedAt, status, parentContractorId, networkLevel, nextPaymentDue)
        VALUES (?, ?, ?, ?, NOW(), 'active', ?, ?, ?)`,
        [
          input.contractorId,
          input.membershipTier,
          pricing.monthly,
          pricing.referralFee,
          input.parentContractorId || null,
          networkLevel,
          nextPayment.toISOString().split('T')[0],
        ]
      );

      return { success: true, tier: input.membershipTier, monthlyFee: pricing.monthly };
    }),

  // Update membership tier
  updateMembershipTier: protectedProcedure
    .input(z.object({
      memberId: z.number(),
      newTier: z.enum(["basic", "professional", "enterprise"]),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      const pricing = TIER_PRICING[input.newTier];
      
      await (db as any).execute(
        `UPDATE contractor_network_members 
        SET membershipTier = ?, monthlyFee = ?, referralFeePercentage = ?
        WHERE id = ?`,
        [input.newTier, pricing.monthly, pricing.referralFee, input.memberId]
      );

      return { success: true, newTier: input.newTier, newMonthlyFee: pricing.monthly };
    }),

  // ============================================================================
  // REFERRALS
  // ============================================================================

  // Get referrals
  getReferrals: protectedProcedure
    .input(z.object({
      contractorId: z.number().optional(),
      status: z.enum(["pending", "accepted", "completed", "paid", "cancelled"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      
      let query = `
        SELECT r.*, 
          rc.businessName as referringContractorName,
          rec.businessName as receivingContractorName
        FROM network_referrals r
        LEFT JOIN contractor_businesses rc ON r.referringContractorId = rc.id
        LEFT JOIN contractor_businesses rec ON r.receivingContractorId = rec.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input?.contractorId) {
        query += " AND (r.referringContractorId = ? OR r.receivingContractorId = ?)";
        params.push(input.contractorId, input.contractorId);
      }
      
      if (input?.status) {
        query += " AND r.status = ?";
        params.push(input.status);
      }
      
      query += " ORDER BY r.referredAt DESC";
      
      const [referrals] = await (db as any).execute(query, params);
      
      return referrals as any[];
    }),

  // Submit referral
  submitReferral: protectedProcedure
    .input(z.object({
      referringContractorId: z.number(),
      clientName: z.string(),
      clientEmail: z.string().email().optional(),
      clientCompany: z.string().optional(),
      projectDescription: z.string(),
      estimatedProjectValue: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      // Get referral fee percentage for this contractor
      const [member] = await (db as any).execute(
        "SELECT referralFeePercentage FROM contractor_network_members WHERE contractorId = ?",
        [input.referringContractorId]
      );
      
      const feePercentage = (member as any[])[0]?.referralFeePercentage || 10;
      const feeAmount = input.estimatedProjectValue 
        ? (input.estimatedProjectValue * feePercentage / 100) 
        : null;
      
      await (db as any).execute(
        `INSERT INTO network_referrals 
        (referringContractorId, clientName, clientEmail, clientCompany, projectDescription, projectValue, referralFeePercentage, referralFeeAmount, referredAt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')`,
        [
          input.referringContractorId,
          input.clientName,
          input.clientEmail || null,
          input.clientCompany || null,
          input.projectDescription,
          input.estimatedProjectValue || null,
          feePercentage,
          feeAmount,
        ]
      );

      return { success: true, estimatedFee: feeAmount };
    }),

  // Update referral status
  updateReferralStatus: protectedProcedure
    .input(z.object({
      referralId: z.number(),
      status: z.enum(["pending", "accepted", "completed", "paid", "cancelled"]),
      receivingContractorId: z.number().optional(),
      actualProjectValue: z.number().optional(),
      paymentReference: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      const updates: string[] = ["status = ?"];
      const values: any[] = [input.status];
      
      if (input.status === "accepted" && input.receivingContractorId) {
        updates.push("receivingContractorId = ?");
        values.push(input.receivingContractorId);
        updates.push("acceptedAt = NOW()");
      }
      
      if (input.status === "completed") {
        updates.push("completedAt = NOW()");
        if (input.actualProjectValue) {
          updates.push("projectValue = ?");
          values.push(input.actualProjectValue);
          // Recalculate fee
          const [referral] = await (db as any).execute(
            "SELECT referralFeePercentage FROM network_referrals WHERE id = ?",
            [input.referralId]
          );
          const feePercentage = (referral as any[])[0]?.referralFeePercentage || 10;
          updates.push("referralFeeAmount = ?");
          values.push(input.actualProjectValue * feePercentage / 100);
        }
      }
      
      if (input.status === "paid") {
        updates.push("paidAt = NOW()");
        if (input.paymentReference) {
          updates.push("paymentReference = ?");
          values.push(input.paymentReference);
        }
        
        // Update contractor's total referrals paid
        const [referral] = await (db as any).execute(
          "SELECT referringContractorId, referralFeeAmount FROM network_referrals WHERE id = ?",
          [input.referralId]
        );
        if ((referral as any[]).length > 0) {
          await (db as any).execute(
            `UPDATE contractor_network_members 
            SET totalReferralsPaid = totalReferralsPaid + ?
            WHERE contractorId = ?`,
            [(referral as any[])[0].referralFeeAmount, (referral as any[])[0].referringContractorId]
          );
        }
      }
      
      values.push(input.referralId);
      
      await (db as any).execute(
        `UPDATE network_referrals SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      return { success: true };
    }),

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  // Get subscriptions
  getSubscriptions: protectedProcedure
    .input(z.object({
      memberId: z.number().optional(),
      status: z.enum(["pending", "paid", "overdue", "cancelled", "refunded"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      
      let query = `
        SELECT s.*, nm.membershipTier, cb.businessName
        FROM network_subscriptions s
        JOIN contractor_network_members nm ON s.networkMemberId = nm.id
        LEFT JOIN contractor_businesses cb ON nm.contractorId = cb.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input?.memberId) {
        query += " AND s.networkMemberId = ?";
        params.push(input.memberId);
      }
      
      if (input?.status) {
        query += " AND s.status = ?";
        params.push(input.status);
      }
      
      query += " ORDER BY s.periodStart DESC";
      
      const [subscriptions] = await (db as any).execute(query, params);
      
      return subscriptions as any[];
    }),

  // Generate subscription invoice
  generateSubscriptionInvoice: protectedProcedure
    .input(z.object({
      memberId: z.number(),
      subscriptionType: z.enum(["monthly", "annual"]).default("monthly"),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      // Get member tier
      const [member] = await (db as any).execute(
        "SELECT membershipTier, monthlyFee FROM contractor_network_members WHERE id = ?",
        [input.memberId]
      );
      
      if ((member as any[]).length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }
      
      const tier = (member as any[])[0].membershipTier as keyof typeof TIER_PRICING;
      const pricing = TIER_PRICING[tier];
      const amount = input.subscriptionType === "annual" ? pricing.annual : pricing.monthly;
      
      const now = new Date();
      const periodEnd = new Date(now);
      if (input.subscriptionType === "annual") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
      
      const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const [result] = await (db as any).execute(
        `INSERT INTO network_subscriptions 
        (networkMemberId, subscriptionType, amount, periodStart, periodEnd, status, invoiceNumber)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        [
          input.memberId,
          input.subscriptionType,
          amount,
          now.toISOString().split('T')[0],
          periodEnd.toISOString().split('T')[0],
          invoiceNumber,
        ]
      );

      return { 
        success: true, 
        invoiceNumber, 
        amount, 
        subscriptionId: result.insertId 
      };
    }),

  // Record subscription payment
  recordSubscriptionPayment: protectedProcedure
    .input(z.object({
      subscriptionId: z.number(),
      paymentMethod: z.string(),
      paymentReference: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      await (db as any).execute(
        `UPDATE network_subscriptions 
        SET status = 'paid', paymentMethod = ?, paymentReference = ?, paidAt = NOW()
        WHERE id = ?`,
        [input.paymentMethod, input.paymentReference, input.subscriptionId]
      );
      
      // Update member's next payment due
      const [sub] = await (db as any).execute(
        "SELECT networkMemberId, periodEnd FROM network_subscriptions WHERE id = ?",
        [input.subscriptionId]
      );
      
      if ((sub as any[]).length > 0) {
        await (db as any).execute(
          "UPDATE contractor_network_members SET lastPaymentDate = NOW(), nextPaymentDue = ? WHERE id = ?",
          [(sub as any[])[0].periodEnd, (sub as any[])[0].networkMemberId]
        );
      }

      return { success: true };
    }),

  // ============================================================================
  // SUB-CONTRACTOR RELATIONSHIPS
  // ============================================================================

  // Get sub-contractor relationships
  getSubContractorRelationships: protectedProcedure
    .input(z.object({
      contractorId: z.number().optional(),
      relationshipType: z.enum(["mentee", "subcontractor", "referral", "pipeline"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      
      let query = `
        SELECT r.*, 
          pc.businessName as parentBusinessName,
          sc.businessName as subBusinessName
        FROM sub_contractor_relationships r
        LEFT JOIN contractor_businesses pc ON r.parentContractorId = pc.id
        LEFT JOIN contractor_businesses sc ON r.subContractorId = sc.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input?.contractorId) {
        query += " AND (r.parentContractorId = ? OR r.subContractorId = ?)";
        params.push(input.contractorId, input.contractorId);
      }
      
      if (input?.relationshipType) {
        query += " AND r.relationshipType = ?";
        params.push(input.relationshipType);
      }
      
      query += " ORDER BY r.startDate DESC";
      
      const [relationships] = await (db as any).execute(query, params);
      
      return relationships as any[];
    }),

  // Create sub-contractor relationship
  createSubContractorRelationship: protectedProcedure
    .input(z.object({
      parentContractorId: z.number(),
      subContractorId: z.number(),
      relationshipType: z.enum(["mentee", "subcontractor", "referral", "pipeline"]),
      trainingFeeOwed: z.number().optional(),
      revenueSharePercentage: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      await (db as any).execute(
        `INSERT INTO sub_contractor_relationships 
        (parentContractorId, subContractorId, relationshipType, startDate, status, trainingFeeOwed, revenueSharePercentage)
        VALUES (?, ?, ?, CURDATE(), 'active', ?, ?)`,
        [
          input.parentContractorId,
          input.subContractorId,
          input.relationshipType,
          input.trainingFeeOwed || 0,
          input.revenueSharePercentage || 0,
        ]
      );

      return { success: true };
    }),

  // Record training fee payment
  recordTrainingFeePayment: protectedProcedure
    .input(z.object({
      relationshipId: z.number(),
      amount: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      await (db as any).execute(
        `UPDATE sub_contractor_relationships 
        SET trainingFeePaid = trainingFeePaid + ?
        WHERE id = ?`,
        [input.amount, input.relationshipId]
      );

      return { success: true };
    }),

  // ============================================================================
  // NETWORK BENEFITS
  // ============================================================================

  // Get available benefits
  getAvailableBenefits: protectedProcedure
    .input(z.object({
      tier: z.enum(["basic", "professional", "enterprise"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      
      let query = "SELECT * FROM network_benefits WHERE isActive = TRUE";
      const params: any[] = [];
      
      if (input?.tier) {
        const tierOrder = { basic: 1, professional: 2, enterprise: 3 };
        const tierLevel = tierOrder[input.tier];
        query += ` AND (
          (minimumTier = 'basic') OR 
          (minimumTier = 'professional' AND ? >= 2) OR 
          (minimumTier = 'enterprise' AND ? >= 3)
        )`;
        params.push(tierLevel, tierLevel);
      }
      
      query += " ORDER BY benefitType, name";
      
      const [benefits] = await (db as any).execute(query, params);
      
      return benefits as any[];
    }),

  // Add network benefit
  addNetworkBenefit: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      benefitType: z.enum(["insurance", "retirement", "legal", "accounting", "marketing", "software", "training", "other"]),
      provider: z.string().optional(),
      monthlyCost: z.number().optional(),
      minimumTier: z.enum(["basic", "professional", "enterprise"]).default("basic"),
      minimumTenureMonths: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      await (db as any).execute(
        `INSERT INTO network_benefits 
        (name, description, benefitType, provider, monthlyCost, minimumTier, minimumTenureMonths, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          input.name,
          input.description || null,
          input.benefitType,
          input.provider || null,
          input.monthlyCost || null,
          input.minimumTier,
          input.minimumTenureMonths,
        ]
      );

      return { success: true };
    }),

  // Enroll in benefit
  enrollInBenefit: protectedProcedure
    .input(z.object({
      memberId: z.number(),
      benefitType: z.enum(["groupInsurance", "retirementPlan"]),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      const field = input.benefitType === "groupInsurance" 
        ? "groupInsuranceEnrolled" 
        : "retirementPlanEnrolled";
      
      await (db as any).execute(
        `UPDATE contractor_network_members SET ${field} = TRUE WHERE id = ?`,
        [input.memberId]
      );

      return { success: true };
    }),

  // ============================================================================
  // NETWORK HIERARCHY
  // ============================================================================

  // Get network tree (for visualization)
  getNetworkTree: protectedProcedure.query(async () => {
    const db = await requireDb();
    
    const [members] = await (db as any).execute(`
      SELECT 
        nm.id,
        nm.contractorId,
        nm.parentContractorId,
        nm.networkLevel,
        nm.membershipTier,
        nm.totalRevenueGenerated,
        cb.businessName,
        cb.ownerName
      FROM contractor_network_members nm
      LEFT JOIN contractor_businesses cb ON nm.contractorId = cb.id
      WHERE nm.status = 'active'
      ORDER BY nm.networkLevel, nm.joinedAt
    `);
    
    // Build tree structure
    const buildTree = (members: any[], parentId: number | null = null): any[] => {
      return members
        .filter(m => m.parentContractorId === parentId)
        .map(m => ({
          ...m,
          children: buildTree(members, m.contractorId),
        }));
    };
    
    return buildTree(members as any[]);
  }),

  // Get member's downline stats
  getDownlineStats: protectedProcedure
    .input(z.object({
      contractorId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await requireDb();
      
      // Get all members in downline
      const [downline] = await (db as any).execute(`
        WITH RECURSIVE downline AS (
          SELECT id, contractorId, parentContractorId, networkLevel, totalRevenueGenerated
          FROM contractor_network_members
          WHERE parentContractorId = ?
          
          UNION ALL
          
          SELECT nm.id, nm.contractorId, nm.parentContractorId, nm.networkLevel, nm.totalRevenueGenerated
          FROM contractor_network_members nm
          JOIN downline d ON nm.parentContractorId = d.contractorId
        )
        SELECT 
          COUNT(*) as totalDownline,
          SUM(totalRevenueGenerated) as totalDownlineRevenue,
          MAX(networkLevel) as deepestLevel
        FROM downline
      `, [input.contractorId]);
      
      return {
        totalDownline: (downline as any[])[0]?.totalDownline || 0,
        totalDownlineRevenue: (downline as any[])[0]?.totalDownlineRevenue || 0,
        deepestLevel: (downline as any[])[0]?.deepestLevel || 0,
      };
    }),
});

export type ContractorNetworkRouter = typeof contractorNetworkRouter;
