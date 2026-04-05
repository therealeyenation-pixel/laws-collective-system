import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Constants for protection
const MAX_INVESTOR_ALLOCATION_PERCENT = 25; // 25% of 40% pool = 10% of total
const NETWORK_POOL_PERCENT = 40;
const HOUSE_RETAINED_PERCENT = 60;

export const investorManagementRouter = router({
  // ==========================================
  // SAFEGUARDS
  // ==========================================

  getSafeguards: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const safeguards = await db.execute(sql`
      SELECT * FROM investment_protection_safeguards 
      WHERE isActive = TRUE
      ORDER BY isConstitutional DESC, safeguardType
    `);
    return safeguards[0] || [];
  }),

  getConstitutionalSafeguards: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const safeguards = await db.execute(sql`
      SELECT * FROM investment_protection_safeguards 
      WHERE isConstitutional = TRUE AND isActive = TRUE
    `);
    return safeguards[0] || [];
  }),

  // ==========================================
  // INVESTORS/PARTNERS
  // ==========================================

  getInvestors: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const investors = await db.execute(sql`
      SELECT * FROM investor_partners ORDER BY createdAt DESC
    `);
    return investors[0] || [];
  }),

  getInvestorById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const investor = await db.execute(sql`
        SELECT * FROM investor_partners WHERE id = ${input.id}
      `);
      return (investor[0] as any[])?.[0] || null;
    }),

  createInvestor: protectedProcedure
    .input(z.object({
      name: z.string(),
      entityType: z.enum(["individual", "company", "fund", "family_office", "strategic_partner"]),
      tier: z.enum(["strategic_partner", "limited_partner", "equity_investor"]),
      contactName: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      address: z.string().optional(),
      taxId: z.string().optional(),
      accreditedInvestor: z.boolean().default(false),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.execute(sql`
        INSERT INTO investor_partners 
        (name, entityType, tier, contactName, contactEmail, contactPhone, address, taxId, accreditedInvestor, notes, status)
        VALUES (${input.name}, ${input.entityType}, ${input.tier}, ${input.contactName || null}, 
                ${input.contactEmail || null}, ${input.contactPhone || null}, ${input.address || null},
                ${input.taxId || null}, ${input.accreditedInvestor}, ${input.notes || null}, 'prospect')
      `);

      return { success: true };
    }),

  updateInvestorStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["prospect", "active", "inactive", "exited"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.execute(sql`
        UPDATE investor_partners SET status = ${input.status} WHERE id = ${input.id}
      `);

      return { success: true };
    }),

  // ==========================================
  // OPPORTUNITIES
  // ==========================================

  getOpportunities: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const opportunities = await db.execute(sql`
      SELECT * FROM investment_opportunities ORDER BY createdAt DESC
    `);
    return opportunities[0] || [];
  }),

  createOpportunity: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      opportunityType: z.enum(["revenue_share", "profit_participation", "equity_stake", "convertible_note", "loan"]),
      targetAmount: z.number().optional(),
      minimumInvestment: z.number().optional(),
      maximumInvestment: z.number().optional(),
      expectedReturn: z.string().optional(),
      termMonths: z.number().optional(),
      riskLevel: z.enum(["low", "medium", "high"]).default("medium"),
      maxPoolAllocation: z.number().max(MAX_INVESTOR_ALLOCATION_PERCENT).default(25),
      buybackClause: z.string().optional(),
      sunsetClause: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Enforce maximum allocation cap
      if (input.maxPoolAllocation > MAX_INVESTOR_ALLOCATION_PERCENT) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Maximum allocation cannot exceed ${MAX_INVESTOR_ALLOCATION_PERCENT}% of Network Pool (${MAX_INVESTOR_ALLOCATION_PERCENT * 0.4}% of total)` 
        });
      }

      // Default firewall and veto clauses
      const firewallClause = `Investment is limited to the ${NETWORK_POOL_PERCENT}% Network Pool. The ${HOUSE_RETAINED_PERCENT}% House Retained portion is completely protected and inaccessible to investors.`;
      const vetoRightsClause = "Founding House Chair retains absolute veto power over all investment decisions.";

      await db.execute(sql`
        INSERT INTO investment_opportunities 
        (title, description, opportunityType, targetAmount, minimumInvestment, maximumInvestment,
         expectedReturn, termMonths, riskLevel, sourcePool, maxPoolAllocation,
         firewallClause, vetoRightsClause, buybackClause, sunsetClause, status, createdById)
        VALUES (${input.title}, ${input.description || null}, ${input.opportunityType},
                ${input.targetAmount || null}, ${input.minimumInvestment || null}, ${input.maximumInvestment || null},
                ${input.expectedReturn || null}, ${input.termMonths || null}, ${input.riskLevel},
                'network_pool_40', ${input.maxPoolAllocation},
                ${firewallClause}, ${vetoRightsClause}, ${input.buybackClause || null}, ${input.sunsetClause || null},
                'draft', ${ctx.user.id})
      `);

      return { success: true };
    }),

  updateOpportunityStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "open", "closed", "funded", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.execute(sql`
        UPDATE investment_opportunities SET status = ${input.status} WHERE id = ${input.id}
      `);

      return { success: true };
    }),

  // ==========================================
  // AGREEMENTS
  // ==========================================

  getAgreements: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const agreements = await db.execute(sql`
      SELECT a.*, i.name as investorName, o.title as opportunityTitle
      FROM investment_agreements a
      LEFT JOIN investor_partners i ON a.investorId = i.id
      LEFT JOIN investment_opportunities o ON a.opportunityId = o.id
      ORDER BY a.createdAt DESC
    `);
    return agreements[0] || [];
  }),

  createAgreement: protectedProcedure
    .input(z.object({
      investorId: z.number(),
      opportunityId: z.number(),
      investmentAmount: z.number(),
      ownershipPercentage: z.number().optional(),
      profitSharePercentage: z.number().optional(),
      revenueSharePercentage: z.number().optional(),
      effectiveDate: z.string(),
      expirationDate: z.string().optional(),
      buybackTerms: z.string().optional(),
      buybackPrice: z.number().optional(),
      sunsetDate: z.string().optional(),
      sunsetTerms: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check current allocation doesn't exceed cap
      const currentAllocations = await db.execute(sql`
        SELECT SUM(percentageOfPool) as totalAllocated 
        FROM investment_allocations 
        WHERE status = 'active'
      `);
      const totalAllocated = (currentAllocations[0] as any[])?.[0]?.totalAllocated || 0;
      
      // Calculate new allocation percentage
      // This is simplified - in production would need actual pool value
      const newAllocationPercent = input.ownershipPercentage || input.profitSharePercentage || 0;
      
      if (totalAllocated + newAllocationPercent > MAX_INVESTOR_ALLOCATION_PERCENT) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `This investment would exceed the maximum ${MAX_INVESTOR_ALLOCATION_PERCENT}% allocation cap. Current: ${totalAllocated}%, Requested: ${newAllocationPercent}%` 
        });
      }

      const agreementNumber = `INV-${Date.now()}`;

      await db.execute(sql`
        INSERT INTO investment_agreements 
        (investorId, opportunityId, agreementNumber, investmentAmount, ownershipPercentage,
         profitSharePercentage, revenueSharePercentage, effectiveDate, expirationDate,
         buybackTerms, buybackPrice, sunsetDate, sunsetTerms, status)
        VALUES (${input.investorId}, ${input.opportunityId}, ${agreementNumber}, ${input.investmentAmount},
                ${input.ownershipPercentage || null}, ${input.profitSharePercentage || null},
                ${input.revenueSharePercentage || null}, ${input.effectiveDate}, ${input.expirationDate || null},
                ${input.buybackTerms || null}, ${input.buybackPrice || null},
                ${input.sunsetDate || null}, ${input.sunsetTerms || null}, 'draft')
      `);

      return { success: true, agreementNumber };
    }),

  // Execute buyback
  executeBuyback: protectedProcedure
    .input(z.object({
      agreementId: z.number(),
      buybackAmount: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.execute(sql`
        UPDATE investment_agreements 
        SET buybackExercised = TRUE, buybackDate = NOW(), status = 'bought_back'
        WHERE id = ${input.agreementId}
      `);

      // Deactivate allocation
      await db.execute(sql`
        UPDATE investment_allocations 
        SET status = 'terminated'
        WHERE agreementId = ${input.agreementId}
      `);

      return { success: true };
    }),

  // ==========================================
  // ALLOCATIONS & ANALYTICS
  // ==========================================

  getAllocationSummary: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {
      totalAllocatedPercent: 0,
      remainingCapPercent: MAX_INVESTOR_ALLOCATION_PERCENT,
      networkPoolPercent: NETWORK_POOL_PERCENT,
      houseRetainedPercent: HOUSE_RETAINED_PERCENT,
      activeInvestors: 0,
      totalInvested: 0,
    };
    
    const allocations = await db.execute(sql`
      SELECT 
        COALESCE(SUM(percentageOfPool), 0) as totalAllocatedPercent,
        COUNT(DISTINCT investorId) as activeInvestors,
        COALESCE(SUM(allocatedAmount), 0) as totalInvested
      FROM investment_allocations 
      WHERE status = 'active'
    `);
    
    const data = (allocations[0] as any[])?.[0] || {};
    
    return {
      totalAllocatedPercent: Number(data.totalAllocatedPercent) || 0,
      remainingCapPercent: MAX_INVESTOR_ALLOCATION_PERCENT - (Number(data.totalAllocatedPercent) || 0),
      networkPoolPercent: NETWORK_POOL_PERCENT,
      houseRetainedPercent: HOUSE_RETAINED_PERCENT,
      activeInvestors: Number(data.activeInvestors) || 0,
      totalInvested: Number(data.totalInvested) || 0,
      maxAllocationPercent: MAX_INVESTOR_ALLOCATION_PERCENT,
    };
  }),

  // Validate investment against safeguards
  validateInvestment: protectedProcedure
    .input(z.object({
      investmentAmount: z.number(),
      allocationPercent: z.number(),
      investorTier: z.enum(["strategic_partner", "limited_partner", "equity_investor"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const violations: string[] = [];
      const warnings: string[] = [];

      // Check allocation cap
      const currentAllocations = await db.execute(sql`
        SELECT COALESCE(SUM(percentageOfPool), 0) as totalAllocated 
        FROM investment_allocations WHERE status = 'active'
      `);
      const totalAllocated = Number((currentAllocations[0] as any[])?.[0]?.totalAllocated) || 0;
      
      if (totalAllocated + input.allocationPercent > MAX_INVESTOR_ALLOCATION_PERCENT) {
        violations.push(`Exceeds maximum allocation cap of ${MAX_INVESTOR_ALLOCATION_PERCENT}%`);
      }

      // Check if requires board approval (>5%)
      if (input.allocationPercent > 5) {
        warnings.push("Investment exceeds 5% of Network Pool - requires Decision Board approval with 2/3 majority");
      }

      // Check tier restrictions
      if (input.investorTier === "equity_investor" && input.allocationPercent > 10) {
        warnings.push("Equity investments above 10% require enhanced due diligence");
      }

      return {
        isValid: violations.length === 0,
        violations,
        warnings,
        requiresBoardApproval: input.allocationPercent > 5,
        requiresChairApproval: true, // Always requires Chair approval
      };
    }),
});
