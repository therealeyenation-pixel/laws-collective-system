import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  houses,
  users,
  luvLedgerAccounts,
  luvLedgerTransactions,
  houseHeirs,
  heirDistributionLocks,
  heirAccumulationAccounts,
  heirVestingSchedules,
  communityFunds,
  fundContributions,
  realEstateProperties,
  businessEntities,
  vaultDocuments,
  houseDocumentVaults,
  tokenChainStates,
  giftTokens,
  revenueSharingEvents,
} from "../../drizzle/schema";
import { eq, and, desc, sql, sum, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// CONSTANTS - Financial Split Rules
// ============================================

const TREASURY_SPLIT = {
  ENTITY_SHARE: 70,    // 70% stays with the entity that earned it
  PLATFORM_FEE: 30,    // 30% goes to parent House as Platform Services Fee
};

const HOUSE_INTERNAL_SPLIT = {
  RESERVE: 60,         // 60% of platform fee goes to Reserve (non-shareable)
  COMMUNITY: 40,       // 40% of platform fee goes to Community Share (heirs)
};

const COMMUNITY_FUND_ALLOCATIONS = {
  LAND_ACQUISITION: 30,
  EDUCATION: 25,
  EMERGENCY: 15,
  BUSINESS_DEV: 15,
  CULTURAL: 10,
  DISCRETIONARY: 5,
};

// Token sequence
const TOKEN_SEQUENCE = ["MIRROR", "GIFT", "SPARK", "HOUSE", "CROWN"] as const;

// L.A.W.S. Framework
const LAWS_FRAMEWORK = {
  LAND: { name: "Land", description: "Reconnection & Stability - Understanding roots, migrations, and family history" },
  AIR: { name: "Air", description: "Education & Knowledge - Learning, personal development, and communication" },
  WATER: { name: "Water", description: "Healing & Balance - Emotional resilience, healing cycles, and healthy decision-making" },
  SELF: { name: "Self", description: "Purpose & Skills - Financial literacy, business readiness, and purposeful growth" },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// ============================================
// ROUTER
// ============================================

export const houseDashboardRouter = router({
  // Get complete House Dashboard data
  getDashboard: protectedProcedure
    .input(z.object({ houseId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get user's House
      let houseId = input?.houseId;
      let house;
      
      if (!houseId) {
        const userHouses = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
        if (!userHouses.length) {
          return { hasHouse: false, house: null };
        }
        house = userHouses[0];
        houseId = house.id;
      } else {
        const [foundHouse] = await db.select().from(houses).where(eq(houses.id, houseId));
        if (!foundHouse) {
          throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
        }
        house = foundHouse;
      }

      // Get founder info
      const [founder] = await db.select().from(users).where(eq(users.id, house.ownerUserId));

      // ========================================
      // 1. HOUSE IDENTITY (MIRROR)
      // ========================================
      const houseIdentity = {
        id: house.id,
        registryId: `HOUSE-${house.id}-${house.createdAt.getTime()}`,
        name: house.name,
        activatedAt: house.createdAt,
        status: house.status,
        founder: founder ? {
          id: founder.id,
          name: founder.name,
          email: founder.email,
        } : null,
        // L.A.W.S. Framework alignment
        lawsFramework: LAWS_FRAMEWORK,
        // Crest and motto (can be customized)
        crest: `HOUSE-${house.id}`,  // Generated crest identifier
        motto: "Building Generational Wealth Through Purpose & Community",
      };

      // ========================================
      // 2. FINANCIAL OVERVIEW (LUVLEDGER)
      // ========================================
      const [ledgerAccount] = await db.select().from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.userId, userId));

      // Get recent transactions
      const recentTransactions = ledgerAccount ? await db.select().from(luvLedgerTransactions)
        .where(eq(luvLedgerTransactions.fromAccountId, ledgerAccount.id))
        .orderBy(desc(luvLedgerTransactions.createdAt))
        .limit(10) : [];

      // Get revenue sharing events
      const revenueEvents = await db.select().from(revenueSharingEvents)
        .where(eq(revenueSharingEvents.parentHouseId, houseId))
        .orderBy(desc(revenueSharingEvents.createdAt))
        .limit(10);

      // Calculate totals
      const totalPlatformFees = revenueEvents.reduce((sum, e) => sum + parseFloat(e.platformFeeAmount || "0"), 0);
      const totalReserve = totalPlatformFees * (HOUSE_INTERNAL_SPLIT.RESERVE / 100);
      const totalCommunityShare = totalPlatformFees * (HOUSE_INTERNAL_SPLIT.COMMUNITY / 100);

      const financialOverview = {
        ledgerAccount: ledgerAccount ? {
          id: ledgerAccount.id,
          currentBalance: parseFloat(ledgerAccount.balance || "0"),
          accountType: ledgerAccount.accountType,
          accountName: ledgerAccount.accountName,
          allocationPercentage: parseFloat(ledgerAccount.allocationPercentage || "0"),
        } : null,
        splits: {
          treasury: TREASURY_SPLIT,
          houseInternal: HOUSE_INTERNAL_SPLIT,
        },
        totals: {
          platformFeesReceived: totalPlatformFees,
          reserveAccumulated: totalReserve,
          communityShareDistributed: totalCommunityShare,
        },
        recentTransactions: recentTransactions.map(t => ({
          id: t.id,
          type: t.transactionType,
          amount: parseFloat(t.amount || "0"),
          description: t.description,
          createdAt: t.createdAt,
        })),
        revenueEvents: revenueEvents.map(e => ({
          id: e.id,
          sourceEntityId: e.sourceEntityId,
          grossAmount: parseFloat(e.grossRevenue || "0"),
          platformFee: parseFloat(e.platformFeeAmount || "0"),
          createdAt: e.createdAt,
        })),
      };

      // ========================================
      // 3. HEIR DISTRIBUTION (BLOODLINE)
      // ========================================
      const heirs = await db.select().from(houseHeirs)
        .where(and(eq(houseHeirs.houseId, houseId), eq(houseHeirs.status, "active")));

      const [distributionLock] = await db.select().from(heirDistributionLocks)
        .where(eq(heirDistributionLocks.houseId, houseId));

      // Get accumulation accounts for each heir
      const heirsWithDetails = await Promise.all(heirs.map(async (heir) => {
        const [accumAccount] = await db.select().from(heirAccumulationAccounts)
          .where(eq(heirAccumulationAccounts.heirId, heir.id));
        
        const vestingSchedules = await db.select().from(heirVestingSchedules)
          .where(eq(heirVestingSchedules.heirId, heir.id))
          .orderBy(heirVestingSchedules.milestoneOrder);

        const achievedMilestones = vestingSchedules.filter(s => s.status === "achieved").length;
        const totalMilestones = vestingSchedules.length;

        return {
          id: heir.id,
          fullName: heir.fullName,
          relationship: heir.relationship,
          dateOfBirth: heir.dateOfBirth,
          age: heir.dateOfBirth ? calculateAge(new Date(heir.dateOfBirth)) : null,
          distributionPercentage: parseFloat(heir.distributionPercentage || "0"),
          percentageLocked: heir.percentageLocked,
          vestingStatus: heir.vestingStatus,
          vestedPercentage: parseFloat(heir.vestedPercentage || "0"),
          distributionMethod: heir.distributionMethod,
          totalDistributed: parseFloat(heir.totalDistributed || "0"),
          totalAccumulated: parseFloat(heir.totalAccumulated || "0"),
          accumulationBalance: accumAccount ? parseFloat(accumAccount.currentBalance || "0") : 0,
          vestingProgress: {
            achieved: achievedMilestones,
            total: totalMilestones,
            percentage: totalMilestones > 0 ? Math.round((achievedMilestones / totalMilestones) * 100) : 0,
          },
          milestones: vestingSchedules.map(s => ({
            id: s.id,
            name: s.milestoneName,
            type: s.milestoneType,
            targetAge: s.targetAge,
            vestingPercentage: parseFloat(s.vestingPercentage || "0"),
            status: s.status,
            achievedAt: s.achievedAt,
          })),
        };
      }));

      const totalHeirPercentage = heirs.reduce((sum, h) => sum + parseFloat(h.distributionPercentage || "0"), 0);

      const heirDistribution = {
        isLocked: distributionLock?.isLocked || false,
        lockedAt: distributionLock?.lockedAt,
        totalAllocatedPercentage: totalHeirPercentage,
        remainingPercentage: 100 - totalHeirPercentage,
        heirs: heirsWithDetails,
        bloodlineInheritance: {
          communitySharePercentage: HOUSE_INTERNAL_SPLIT.COMMUNITY,
          description: "40% of Platform Services Fee automatically distributed to designated heirs based on locked percentages",
        },
      };

      // ========================================
      // 4. COMMUNITY FUNDS
      // ========================================
      const funds = await db.select().from(communityFunds)
        .where(eq(communityFunds.houseId, houseId));

      const communityFundsData = {
        allocations: COMMUNITY_FUND_ALLOCATIONS,
        funds: funds.map(f => ({
          id: f.id,
          fundType: f.fundType,
          currentBalance: parseFloat(f.currentBalance || "0"),
          totalContributions: parseFloat(f.totalContributions || "0"),
          totalDisbursements: parseFloat(f.totalDisbursements || "0"),
          allocationPercentage: parseFloat(f.allocationPercentage || "0"),
        })),
        totalBalance: funds.reduce((sum, f) => sum + parseFloat(f.currentBalance || "0"), 0),
      };

      // ========================================
      // 5. ASSET MANAGEMENT
      // ========================================
      // Real Estate
      const properties = await db.select().from(realEstateProperties)
        .where(eq(realEstateProperties.houseId, houseId));

      // Business Entities
      const entities = await db.select().from(businessEntities)
        .where(eq(businessEntities.userId, userId));

      // Document Vault
      const [vault] = await db.select().from(houseDocumentVaults)
        .where(eq(houseDocumentVaults.houseId, houseId));

      let documentCount = 0;
      if (vault) {
        const [docCount] = await db.select({ count: count() }).from(vaultDocuments)
          .where(eq(vaultDocuments.vaultId, vault.id));
        documentCount = docCount?.count || 0;
      }

      const assetManagement = {
        realEstate: {
          count: properties.length,
          totalValue: properties.reduce((sum, p) => sum + parseFloat(p.currentMarketValue || "0"), 0),
          properties: properties.map(p => ({
            id: p.id,
            propertyType: p.propertyType,
            propertyName: p.propertyName,
            address: `${p.streetAddress || ""}, ${p.city || ""}, ${p.state || ""}`.trim(),
            currentValue: parseFloat(p.currentMarketValue || "0"),
            ownershipStatus: p.ownershipStatus,
          })),
        },
        businessEntities: {
          count: entities.length,
          entities: entities.map(e => ({
            id: e.id,
            entityName: e.name,
            entityType: e.entityType,
            status: e.status,
          })),
        },
        documentVault: {
          vaultId: vault?.id,
          documentCount,
          storageUsed: vault ? vault.totalStorageBytes : 0,
          storageLimit: vault ? vault.storageQuotaBytes : 0,
        },
      };

      // ========================================
      // 6. TOKEN PROGRESSION
      // ========================================
      // Get token chain state for this house
      const [tokenState] = await db.select().from(tokenChainStates)
        .where(eq(tokenChainStates.userId, String(userId)));

      // Get gift tokens
      const gifts = await db.select().from(giftTokens)
        .where(eq(giftTokens.sourceHouseId, houseId));

      // Post-activation courses are tracked via business workshop completion
      // Define the 5 required post-activation courses
      const postActivationCourseTypes = [
        { name: "Trust Formation", type: "trust", completed: false },
        { name: "Contract Fundamentals", type: "contracts", completed: false },
        { name: "DBA & Trademark", type: "dba_trademark", completed: false },
        { name: "Grant Writing", type: "grants", completed: false },
        { name: "Blockchain & Crypto", type: "blockchain", completed: false },
      ];

      // Check completion based on house status and token state
      const mirrorActivated = tokenState?.mirrorActivatedAt !== null || house.status === "active";
      const giftActivated = gifts.some(g => g.giftStatus === "activated" || g.giftStatus === "claimed") || tokenState?.giftActivatedAt !== null;
      const sparkActivated = tokenState?.sparkActivatedAt !== null;
      const houseActivated = house.status === "active" || tokenState?.houseActivatedAt !== null;
      const crownActivated = tokenState?.chainStatus === "completed";

      // Determine current token in sequence
      let currentToken = "MIRROR";
      if (mirrorActivated && !giftActivated) currentToken = "GIFT";
      if (giftActivated && !sparkActivated) currentToken = "SPARK";
      if (sparkActivated && !houseActivated) currentToken = "HOUSE";
      if (houseActivated && !crownActivated) currentToken = "CROWN";
      if (crownActivated) currentToken = "COMPLETE";

      const completedCourses = postActivationCourseTypes.filter(c => c.completed).length;
      const totalCourses = postActivationCourseTypes.length;

      const tokenProgression = {
        sequence: TOKEN_SEQUENCE,
        currentToken,
        mirrorActivated,
        giftActivated,
        sparkActivated,
        houseActivated,
        crownActivated,
        giftTokens: {
          total: gifts.length,
          sent: gifts.filter(g => g.giftStatus === "activated" || g.giftStatus === "claimed").length,
          claimed: gifts.filter(g => g.giftStatus === "claimed").length,
        },
        postActivationProgress: {
          completed: completedCourses,
          total: totalCourses,
          percentage: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
          courses: postActivationCourseTypes.map((c, idx) => ({
            id: idx + 1,
            courseName: c.name,
            courseType: c.type,
            status: c.completed ? "completed" : "pending",
            completedAt: null,
          })),
        },
        crownProgress: {
          requirementsmet: completedCourses >= 5,
          description: "Complete all 5 post-activation courses to earn the Crown of Completion",
        },
      };

      // ========================================
      // RETURN COMPLETE DASHBOARD
      // ========================================
      return {
        hasHouse: true,
        house: houseIdentity,
        financial: financialOverview,
        heirs: heirDistribution,
        communityFunds: communityFundsData,
        assets: assetManagement,
        tokens: tokenProgression,
        splitRules: {
          treasury: TREASURY_SPLIT,
          houseInternal: HOUSE_INTERNAL_SPLIT,
          communityFunds: COMMUNITY_FUND_ALLOCATIONS,
        },
      };
    }),

  // Get House Identity (Mirror) details
  getHouseIdentity: protectedProcedure
    .input(z.object({ houseId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      let houseId = input?.houseId;
      if (!houseId) {
        const userHouses = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
        if (!userHouses.length) return null;
        houseId = userHouses[0].id;
      }

      const [house] = await db.select().from(houses).where(eq(houses.id, houseId));
      if (!house) return null;

      const [founder] = await db.select().from(users).where(eq(users.id, house.ownerUserId));

      return {
        house: {
          id: house.id,
          registryId: `HOUSE-${house.id}-${house.createdAt.getTime()}`,
          name: house.name,
          activatedAt: house.createdAt,
          status: house.status,
        },
        founder: founder ? {
          id: founder.id,
          name: founder.name,
        } : null,
        lawsFramework: LAWS_FRAMEWORK,
        mirrorReflection: {
          description: "The Mirror token represents self-reflection and identity establishment. It is the first step in the token sequence, requiring you to understand your roots, document your lineage, and establish your House identity.",
          activated: house.status === "active",
        },
      };
    }),

  // Get Financial Summary
  getFinancialSummary: protectedProcedure
    .input(z.object({ houseId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      let houseId = input?.houseId;
      if (!houseId) {
        const userHouses = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
        if (!userHouses.length) return null;
        houseId = userHouses[0].id;
      }

      const [ledgerAccount] = await db.select().from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.userId, userId));

      if (!ledgerAccount) return null;

      return {
        currentBalance: parseFloat(ledgerAccount.balance || "0"),
        accountType: ledgerAccount.accountType,
        accountName: ledgerAccount.accountName,
        allocationPercentage: parseFloat(ledgerAccount.allocationPercentage || "0"),
        splits: {
          treasury: TREASURY_SPLIT,
          houseInternal: HOUSE_INTERNAL_SPLIT,
        },
      };
    }),

  // Get Bloodline Inheritance Summary
  getBloodlineSummary: protectedProcedure
    .input(z.object({ houseId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      let houseId = input?.houseId;
      if (!houseId) {
        const userHouses = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
        if (!userHouses.length) return null;
        houseId = userHouses[0].id;
      }

      const heirs = await db.select().from(houseHeirs)
        .where(and(eq(houseHeirs.houseId, houseId), eq(houseHeirs.status, "active")));

      const [lock] = await db.select().from(heirDistributionLocks)
        .where(eq(heirDistributionLocks.houseId, houseId));

      const totalDistributed = heirs.reduce((sum, h) => sum + parseFloat(h.totalDistributed || "0"), 0);
      const totalAccumulated = heirs.reduce((sum, h) => sum + parseFloat(h.totalAccumulated || "0"), 0);
      const totalPercentage = heirs.reduce((sum, h) => sum + parseFloat(h.distributionPercentage || "0"), 0);

      return {
        isLocked: lock?.isLocked || false,
        totalHeirs: heirs.length,
        totalAllocatedPercentage: totalPercentage,
        totalDistributed,
        totalAccumulated,
        inheritanceCriteria: {
          communitySharePercentage: HOUSE_INTERNAL_SPLIT.COMMUNITY,
          vestingMilestones: ["Age 18", "Age 21", "Age 25", "Education Completion"],
          spendthriftProtection: true,
          accumulationOption: true,
        },
        heirs: heirs.map(h => ({
          id: h.id,
          name: h.fullName,
          relationship: h.relationship,
          percentage: parseFloat(h.distributionPercentage || "0"),
          vestedPercentage: parseFloat(h.vestedPercentage || "0"),
          vestingStatus: h.vestingStatus,
        })),
      };
    }),

  // Get Token Progression
  getTokenProgression: protectedProcedure
    .input(z.object({ houseId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      let houseId = input?.houseId;
      if (!houseId) {
        const userHouses = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
        if (!userHouses.length) return null;
        houseId = userHouses[0].id;
      }

      const [house] = await db.select().from(houses).where(eq(houses.id, houseId));
      const [tokenState] = await db.select().from(tokenChainStates)
        .where(eq(tokenChainStates.userId, String(userId)));

      // Define post-activation courses
      const postActivationCourseTypes = [
        { id: 1, name: "Trust Formation", type: "trust", status: "pending", associatedToken: "SPARK" },
        { id: 2, name: "Contract Fundamentals", type: "contracts", status: "pending", associatedToken: "SPARK" },
        { id: 3, name: "DBA & Trademark", type: "dba_trademark", status: "pending", associatedToken: "HOUSE" },
        { id: 4, name: "Grant Writing", type: "grants", status: "pending", associatedToken: "HOUSE" },
        { id: 5, name: "Blockchain & Crypto", type: "blockchain", status: "pending", associatedToken: "CROWN" },
      ];

      const completedCourses = 0; // Will be tracked via actual course completion

      return {
        sequence: TOKEN_SEQUENCE.map((token, index) => ({
          token,
          order: index + 1,
          description: getTokenDescription(token),
          activated: isTokenActivated(token, tokenState, house, completedCourses),
        })),
        currentToken: TOKEN_SEQUENCE[tokenState?.currentTokenIndex || 0] || "MIRROR",
        postActivationCourses: postActivationCourseTypes,
      };
    }),
});

// Helper functions
function getTokenDescription(token: string): string {
  const descriptions: Record<string, string> = {
    MIRROR: "Self-reflection and identity establishment - understand your roots and document your lineage",
    GIFT: "Generosity and community building - share knowledge and resources with others",
    SPARK: "Innovation and creation - develop business ideas and entrepreneurial skills",
    HOUSE: "Foundation and stability - establish your House with proper legal structure",
    CROWN: "Achievement and legacy - complete all requirements and receive the Crown of Completion",
  };
  return descriptions[token] || "";
}

function isTokenActivated(token: string, progress: any, house: any, completedCourses: number): boolean {
  if (!progress && !house) return false;
  
  switch (token) {
    case "MIRROR":
      return progress?.mirrorActivated || house?.status === "active";
    case "GIFT":
      return progress?.giftActivated || false;
    case "SPARK":
      return progress?.sparkActivated || false;
    case "HOUSE":
      return house?.status === "active";
    case "CROWN":
      return progress?.crownActivated || completedCourses >= 5;
    default:
      return false;
  }
}
