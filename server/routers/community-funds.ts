import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  communityFunds,
  fundContributions,
  fundDisbursements,
  revenueSharingEvents,
  platformServicesAgreements,
  houses,
  luvLedgerAccounts,
  luvLedgerTransactions,
  businessEntities,
} from "../../drizzle/schema";
import { eq, and, desc, sql, sum } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// CONSTANTS
// ============================================

// Financial split percentages
const TREASURY_SPLIT = {
  ENTITY_RETAINED: 70,  // 70% stays with earning entity
  PLATFORM_FEE: 30,     // 30% goes to parent House
};

const HOUSE_INTERNAL_SPLIT = {
  RESERVE: 60,          // 60% of platform fee to reserve (non-shareable)
  COMMUNITY: 40,        // 40% of platform fee to community funds
};

// Default community fund allocations (% of the 40% community share)
const DEFAULT_FUND_ALLOCATIONS = [
  { fundCode: "LAND", fundType: "land_acquisition", name: "Land & Property Acquisition Fund", percentage: 30 },
  { fundCode: "EDU", fundType: "education", name: "Education & Scholarship Fund", percentage: 25 },
  { fundCode: "EMERGENCY", fundType: "emergency", name: "Emergency Assistance Fund", percentage: 15 },
  { fundCode: "BIZDEV", fundType: "business_development", name: "Business Development Fund", percentage: 15 },
  { fundCode: "CULTURAL", fundType: "cultural_preservation", name: "Cultural Preservation Fund", percentage: 10 },
  { fundCode: "DISCRETIONARY", fundType: "discretionary", name: "Discretionary/Voting Fund", percentage: 5 },
];

// Services provided for fee justification
const PLATFORM_SERVICES = [
  "LuvLedger blockchain-verified financial tracking",
  "Document generation and management system",
  "Automated compliance monitoring",
  "Legal document template library",
  "Tax preparation and filing tools",
  "Business formation assistance",
  "Educational curriculum and training",
  "Technology infrastructure and hosting",
  "Administrative support services",
  "Community fund management",
];

// ============================================
// HELPER FUNCTIONS
// ============================================

async function recordToBlockchain(type: string, entityId: number, data: any): Promise<string> {
  const timestamp = Date.now();
  const payload = JSON.stringify({ type, entityId, data, timestamp });
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function generateAgreementNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PSA-${year}${month}-${random}`;
}

// ============================================
// ROUTER
// ============================================

export const communityFundsRouter = router({
  // Initialize default community funds for a House
  initializeFunds: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      customAllocations: z.array(z.object({
        fundCode: z.string(),
        fundType: z.string(),
        name: z.string(),
        percentage: z.number(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const allocations = input.customAllocations || DEFAULT_FUND_ALLOCATIONS;
      
      // Validate percentages sum to 100
      const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
      if (totalPercentage !== 100) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Fund allocations must sum to 100%, got ${totalPercentage}%` 
        });
      }

      // Create funds
      const createdFunds = [];
      for (const allocation of allocations) {
        const [fund] = await db.insert(communityFunds).values({
          houseId: input.houseId,
          fundName: allocation.name,
          fundCode: allocation.fundCode,
          fundType: allocation.fundType as any,
          allocationPercentage: allocation.percentage.toString(),
          description: `${allocation.name} - ${allocation.percentage}% of community share`,
        });
        createdFunds.push({ id: fund.insertId, ...allocation });
      }

      return { success: true, funds: createdFunds };
    }),

  // Get all funds for a House
  getHouseFunds: protectedProcedure
    .input(z.object({ houseId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      let houseId = input?.houseId;
      if (!houseId) {
        const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
        if (!userHouse.length) return { funds: [], totals: { balance: 0, contributions: 0, disbursements: 0 } };
        houseId = userHouse[0].id;
      }

      const funds = await db
        .select()
        .from(communityFunds)
        .where(eq(communityFunds.houseId, houseId));

      // Calculate totals
      const totals = funds.reduce((acc, fund) => ({
        balance: acc.balance + parseFloat(fund.currentBalance || "0"),
        contributions: acc.contributions + parseFloat(fund.totalContributions || "0"),
        disbursements: acc.disbursements + parseFloat(fund.totalDisbursements || "0"),
      }), { balance: 0, contributions: 0, disbursements: 0 });

      return { funds, totals };
    }),

  // Process revenue sharing (70/30 split)
  processRevenueShare: protectedProcedure
    .input(z.object({
      sourceEntityType: z.enum(["business", "property", "service", "grant", "investment", "other"]),
      sourceEntityId: z.number(),
      sourceEntityName: z.string(),
      grossRevenue: z.number(),
      revenueType: z.enum([
        "sales", "service_fee", "licensing", "royalty", "rental_income",
        "grant_award", "investment_return", "dividend", "other"
      ]),
      revenueDescription: z.string().optional(),
      revenueDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get user's House (parent house)
      const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }
      const parentHouseId = userHouse[0].id;
      const parentHouseName = userHouse[0].name;

      // Calculate splits
      const grossRevenue = input.grossRevenue;
      const entityRetained = grossRevenue * (TREASURY_SPLIT.ENTITY_RETAINED / 100);
      const platformFee = grossRevenue * (TREASURY_SPLIT.PLATFORM_FEE / 100);
      const reserveAmount = platformFee * (HOUSE_INTERNAL_SPLIT.RESERVE / 100);
      const communityShareAmount = platformFee * (HOUSE_INTERNAL_SPLIT.COMMUNITY / 100);

      // Get community funds for this house
      const funds = await db
        .select()
        .from(communityFunds)
        .where(eq(communityFunds.houseId, parentHouseId));

      // Calculate fund allocations
      const fundAllocations: Record<number, number> = {};
      for (const fund of funds) {
        const fundPercentage = parseFloat(fund.allocationPercentage || "0");
        const fundAmount = communityShareAmount * (fundPercentage / 100);
        fundAllocations[fund.id] = fundAmount;
      }

      // Record blockchain hash
      const blockchainHash = await recordToBlockchain("revenue_share", parentHouseId, {
        grossRevenue,
        entityRetained,
        platformFee,
        reserveAmount,
        communityShareAmount,
        fundAllocations,
      });

      // Get LuvLedger account
      const account = await db.select().from(luvLedgerAccounts).where(eq(luvLedgerAccounts.userId, userId)).limit(1);
      let parentLedgerTransactionId: number | null = null;

      if (account.length) {
        // Record platform fee to LuvLedger
        const [ledgerTx] = await db.insert(luvLedgerTransactions).values({
          fromAccountId: account[0].id,
          toAccountId: account[0].id,
          amount: platformFee.toString(),
          transactionType: "income",
          description: `Platform Services Fee: ${input.revenueType} from ${input.sourceEntityName}`,
          blockchainHash,
        });
        parentLedgerTransactionId = ledgerTx.insertId;
      }

      // Create revenue sharing event
      const [event] = await db.insert(revenueSharingEvents).values({
        sourceEntityType: input.sourceEntityType,
        sourceEntityId: input.sourceEntityId,
        sourceEntityName: input.sourceEntityName,
        sourceHouseId: parentHouseId,
        parentHouseId,
        parentHouseName,
        grossRevenue: grossRevenue.toString(),
        revenueType: input.revenueType,
        revenueDescription: input.revenueDescription,
        entityRetainedAmount: entityRetained.toString(),
        platformFeeAmount: platformFee.toString(),
        platformFeePercentage: TREASURY_SPLIT.PLATFORM_FEE.toString(),
        feeJustification: "combined_services",
        servicesProvided: PLATFORM_SERVICES,
        reserveAmount: reserveAmount.toString(),
        communityShareAmount: communityShareAmount.toString(),
        fundAllocations,
        parentLedgerTransactionId,
        blockchainHash,
        status: "processed",
        processedAt: new Date(),
        revenueDate: input.revenueDate ? new Date(input.revenueDate) : new Date(),
      });

      // Distribute to community funds
      for (const fund of funds) {
        const fundAmount = fundAllocations[fund.id] || 0;
        if (fundAmount > 0) {
          // Record contribution
          await db.insert(fundContributions).values({
            fundId: fund.id,
            houseId: parentHouseId,
            sourceType: "revenue_share",
            sourceEntityType: input.sourceEntityType,
            sourceEntityId: input.sourceEntityId,
            sourceEntityName: input.sourceEntityName,
            grossAmount: fundAmount.toString(),
            netAmount: fundAmount.toString(),
            parentTransactionId: event.insertId,
            splitPercentage: fund.allocationPercentage,
            calculationNotes: `${fund.allocationPercentage}% of $${communityShareAmount.toFixed(2)} community share = $${fundAmount.toFixed(2)}`,
            blockchainHash,
          });

          // Update fund balance
          await db
            .update(communityFunds)
            .set({
              currentBalance: sql`${communityFunds.currentBalance} + ${fundAmount}`,
              totalContributions: sql`${communityFunds.totalContributions} + ${fundAmount}`,
            })
            .where(eq(communityFunds.id, fund.id));
        }
      }

      return {
        success: true,
        eventId: event.insertId,
        summary: {
          grossRevenue,
          entityRetained,
          platformFee,
          reserveAmount,
          communityShareAmount,
          fundAllocations,
          blockchainHash,
        },
      };
    }),

  // Get revenue sharing history
  getRevenueSharingHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
      if (!userHouse.length) return { events: [], totals: { grossRevenue: 0, platformFees: 0, communityShare: 0 } };

      const events = await db
        .select()
        .from(revenueSharingEvents)
        .where(eq(revenueSharingEvents.parentHouseId, userHouse[0].id))
        .orderBy(desc(revenueSharingEvents.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);

      // Calculate totals
      const totals = events.reduce((acc, event) => ({
        grossRevenue: acc.grossRevenue + parseFloat(event.grossRevenue || "0"),
        platformFees: acc.platformFees + parseFloat(event.platformFeeAmount || "0"),
        communityShare: acc.communityShare + parseFloat(event.communityShareAmount || "0"),
      }), { grossRevenue: 0, platformFees: 0, communityShare: 0 });

      return { events, totals };
    }),

  // Request fund disbursement
  requestDisbursement: protectedProcedure
    .input(z.object({
      fundId: z.number(),
      purposeType: z.enum([
        "property_purchase", "scholarship", "tuition_assistance", "emergency_grant",
        "business_loan", "business_grant", "cultural_event", "cultural_project",
        "community_vote", "administrative", "transfer_out"
      ]),
      description: z.string(),
      recipientType: z.enum(["house_member", "house", "external_entity", "vendor", "institution", "fund"]),
      recipientId: z.number().optional(),
      recipientName: z.string(),
      requestedAmount: z.number(),
      supportingDocuments: z.array(z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get fund and verify balance
      const [fund] = await db.select().from(communityFunds).where(eq(communityFunds.id, input.fundId));
      if (!fund) throw new TRPCError({ code: "NOT_FOUND", message: "Fund not found" });

      const currentBalance = parseFloat(fund.currentBalance || "0");
      if (input.requestedAmount > currentBalance) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Insufficient funds. Available: $${currentBalance.toFixed(2)}, Requested: $${input.requestedAmount.toFixed(2)}` 
        });
      }

      // Determine if approval is needed
      const approvalThreshold = parseFloat(fund.approvalThreshold || "0");
      const needsApproval = fund.requiresApproval && input.requestedAmount > approvalThreshold;

      // Create disbursement request
      const [disbursement] = await db.insert(fundDisbursements).values({
        fundId: input.fundId,
        houseId: fund.houseId,
        purposeType: input.purposeType,
        description: input.description,
        recipientType: input.recipientType,
        recipientId: input.recipientId,
        recipientName: input.recipientName,
        requestedAmount: input.requestedAmount.toString(),
        status: needsApproval ? "pending_approval" : "approved",
        requestedBy: userId,
        supportingDocuments: input.supportingDocuments,
        approvedBy: needsApproval ? null : userId,
        approvedAt: needsApproval ? null : new Date(),
        approvedAmount: needsApproval ? null : input.requestedAmount.toString(),
      });

      // If auto-approved, process immediately
      if (!needsApproval) {
        await processDisbursement(db, disbursement.insertId, userId);
      }

      return {
        success: true,
        disbursementId: disbursement.insertId,
        status: needsApproval ? "pending_approval" : "approved",
        message: needsApproval 
          ? "Disbursement request submitted for approval" 
          : "Disbursement approved and processing",
      };
    }),

  // Approve/reject disbursement
  reviewDisbursement: protectedProcedure
    .input(z.object({
      disbursementId: z.number(),
      action: z.enum(["approve", "reject"]),
      approvedAmount: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      if (input.action === "approve") {
        await db
          .update(fundDisbursements)
          .set({
            status: "approved",
            approvedBy: userId,
            approvedAt: new Date(),
            approvedAmount: input.approvedAmount?.toString(),
            approvalNotes: input.notes,
          })
          .where(eq(fundDisbursements.id, input.disbursementId));

        // Process the disbursement
        await processDisbursement(db, input.disbursementId, userId);
      } else {
        await db
          .update(fundDisbursements)
          .set({
            status: "rejected",
            approvedBy: userId,
            rejectionReason: input.notes,
          })
          .where(eq(fundDisbursements.id, input.disbursementId));
      }

      return { success: true, action: input.action };
    }),

  // Get pending disbursements
  getPendingDisbursements: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const userId = ctx.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
    if (!userHouse.length) return [];

    const disbursements = await db
      .select()
      .from(fundDisbursements)
      .where(and(
        eq(fundDisbursements.houseId, userHouse[0].id),
        eq(fundDisbursements.status, "pending_approval")
      ))
      .orderBy(desc(fundDisbursements.requestedAt));

    return disbursements;
  }),

  // Create Platform Services Agreement
  createPlatformAgreement: protectedProcedure
    .input(z.object({
      subsidiaryEntityType: z.enum(["business", "property", "trust", "nonprofit"]),
      subsidiaryEntityId: z.number(),
      subsidiaryEntityName: z.string(),
      platformFeePercentage: z.number().default(30),
      servicesIncluded: z.array(z.string()).optional(),
      governingLaw: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const agreementNumber = generateAgreementNumber();
      const servicesIncluded = input.servicesIncluded || PLATFORM_SERVICES;

      const [agreement] = await db.insert(platformServicesAgreements).values({
        parentHouseId: userHouse[0].id,
        subsidiaryEntityType: input.subsidiaryEntityType,
        subsidiaryEntityId: input.subsidiaryEntityId,
        subsidiaryEntityName: input.subsidiaryEntityName,
        agreementNumber,
        effectiveDate: new Date(),
        platformFeePercentage: input.platformFeePercentage.toString(),
        servicesIncluded,
        governingLaw: input.governingLaw || "Delaware",
        status: "draft",
      });

      return {
        success: true,
        agreementId: agreement.insertId,
        agreementNumber,
      };
    }),

  // Get fund contribution history
  getFundContributions: protectedProcedure
    .input(z.object({
      fundId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const contributions = await db
        .select()
        .from(fundContributions)
        .where(eq(fundContributions.fundId, input.fundId))
        .orderBy(desc(fundContributions.contributedAt))
        .limit(input.limit);

      return contributions;
    }),

  // Get fund disbursement history
  getFundDisbursements: protectedProcedure
    .input(z.object({
      fundId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const disbursements = await db
        .select()
        .from(fundDisbursements)
        .where(eq(fundDisbursements.fundId, input.fundId))
        .orderBy(desc(fundDisbursements.requestedAt))
        .limit(input.limit);

      return disbursements;
    }),

  // Update fund allocation percentages
  updateFundAllocations: protectedProcedure
    .input(z.object({
      allocations: z.array(z.object({
        fundId: z.number(),
        percentage: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Validate percentages sum to 100
      const totalPercentage = input.allocations.reduce((sum, a) => sum + a.percentage, 0);
      if (totalPercentage !== 100) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Fund allocations must sum to 100%, got ${totalPercentage}%` 
        });
      }

      // Update each fund
      for (const allocation of input.allocations) {
        await db
          .update(communityFunds)
          .set({ allocationPercentage: allocation.percentage.toString() })
          .where(eq(communityFunds.id, allocation.fundId));
      }

      return { success: true };
    }),

  // Get financial summary
  getFinancialSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const userId = ctx.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
    if (!userHouse.length) {
      return {
        splits: { treasurySplit: TREASURY_SPLIT, houseInternalSplit: HOUSE_INTERNAL_SPLIT },
        totals: { grossRevenue: 0, entityRetained: 0, platformFees: 0, reserve: 0, communityShare: 0 },
        funds: [],
      };
    }

    // Get revenue sharing totals
    const [revenueTotals] = await db
      .select({
        grossRevenue: sql<number>`SUM(CAST(gross_revenue AS DECIMAL(18,2)))`,
        entityRetained: sql<number>`SUM(CAST(entity_retained_amount AS DECIMAL(18,2)))`,
        platformFees: sql<number>`SUM(CAST(platform_fee_amount AS DECIMAL(18,2)))`,
        reserve: sql<number>`SUM(CAST(reserve_amount AS DECIMAL(18,2)))`,
        communityShare: sql<number>`SUM(CAST(community_share_amount AS DECIMAL(18,2)))`,
      })
      .from(revenueSharingEvents)
      .where(eq(revenueSharingEvents.parentHouseId, userHouse[0].id));

    // Get fund balances
    const funds = await db
      .select()
      .from(communityFunds)
      .where(eq(communityFunds.houseId, userHouse[0].id));

    return {
      splits: {
        treasurySplit: TREASURY_SPLIT,
        houseInternalSplit: HOUSE_INTERNAL_SPLIT,
      },
      totals: {
        grossRevenue: revenueTotals?.grossRevenue || 0,
        entityRetained: revenueTotals?.entityRetained || 0,
        platformFees: revenueTotals?.platformFees || 0,
        reserve: revenueTotals?.reserve || 0,
        communityShare: revenueTotals?.communityShare || 0,
      },
      funds: funds.map(f => ({
        id: f.id,
        name: f.fundName,
        code: f.fundCode,
        type: f.fundType,
        allocationPercentage: parseFloat(f.allocationPercentage || "0"),
        currentBalance: parseFloat(f.currentBalance || "0"),
        totalContributions: parseFloat(f.totalContributions || "0"),
        totalDisbursements: parseFloat(f.totalDisbursements || "0"),
      })),
    };
  }),
});

// Helper function to process approved disbursement
async function processDisbursement(db: any, disbursementId: number, userId: number) {
  const [disbursement] = await db.select().from(fundDisbursements).where(eq(fundDisbursements.id, disbursementId));
  if (!disbursement) return;

  const amount = parseFloat(disbursement.approvedAmount || disbursement.requestedAmount || "0");

  // Record blockchain hash
  const blockchainHash = await recordToBlockchain("disbursement", disbursementId, {
    fundId: disbursement.fundId,
    amount,
    recipientName: disbursement.recipientName,
    purposeType: disbursement.purposeType,
  });

  // Update fund balance
  await db
    .update(communityFunds)
    .set({
      currentBalance: sql`${communityFunds.currentBalance} - ${amount}`,
      totalDisbursements: sql`${communityFunds.totalDisbursements} + ${amount}`,
    })
    .where(eq(communityFunds.id, disbursement.fundId));

  // Update disbursement status
  await db
    .update(fundDisbursements)
    .set({
      status: "disbursed",
      disbursedAmount: amount.toString(),
      disbursedAt: new Date(),
      blockchainHash,
    })
    .where(eq(fundDisbursements.id, disbursementId));

  // Record to LuvLedger
  const account = await db.select().from(luvLedgerAccounts).where(eq(luvLedgerAccounts.userId, userId)).limit(1);
  if (account.length) {
    await db.insert(luvLedgerTransactions).values({
      fromAccountId: account[0].id,
      toAccountId: account[0].id,
      amount: amount.toString(),
      transactionType: "fee",
      description: `Fund Disbursement: ${disbursement.purposeType} - ${disbursement.recipientName}`,
      blockchainHash,
    });
  }
}
