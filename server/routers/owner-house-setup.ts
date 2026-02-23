import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  houses,
  houseMembers,
  houseBusinesses,
  businessEntities,
  tokenChainStates,
  scrollSealStatus,
  luvLedgerAccounts,
  houseDocumentVaults,
  vaultFolders,
  vaultDocuments,
  houseHeirs,
  communityFunds,
} from "../../drizzle/schema";
import { storagePut } from "../storage";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { ENV } from "../_core/env";

// ============================================
// OWNER HOUSE SETUP
// Special procedures for system owner to set up their House
// with existing businesses and documents
// ============================================

// Check if user is the system owner
// Uses OWNER_OPEN_ID env var, but also allows admin role users
function isOwner(userId: string, userRole?: string): boolean {
  // Check if user matches the owner OpenID OR has admin role
  return userId === ENV.ownerOpenId || userRole === 'admin';
}

// Generate Registry ID Number (RIN) for house
function generateRIN(houseType: string, userId: string, isGenesis: boolean = false): string {
  if (isGenesis) {
    return "RIN-GEN-001"; // The Genesis House always has this RIN
  }
  const timestamp = Date.now().toString(36).toUpperCase();
  const userHash = crypto.createHash("sha256").update(userId).digest("hex").slice(0, 6).toUpperCase();
  const typeCode = houseType === "root" ? "RT" : houseType === "bloodline" ? "BL" : "AD";
  return `RIN-${typeCode}-${timestamp}-${userHash}`;
}

// Generate Genesis hash from ceremony data
function generateGenesisHash(ceremonyData: {
  statementOfPurpose: string;
  trustName: string;
  flameLightingTimestamp: Date;
  founderName: string;
}): string {
  const data = JSON.stringify({
    purpose: ceremonyData.statementOfPurpose,
    trust: ceremonyData.trustName,
    flame: ceremonyData.flameLightingTimestamp.toISOString(),
    founder: ceremonyData.founderName,
    genesis: true,
  });
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Generate Genesis Declaration document content
function generateGenesisDeclarationContent(data: {
  houseName: string;
  trustName: string;
  founderName: string;
  statementOfPurpose: string;
  flameLightingTimestamp: Date;
  genesisHash: string;
  genesisRIN: string;
  heirs: Array<{ name: string; relationship: string; percentage: number }>;
}): string {
  const formattedDate = data.flameLightingTimestamp.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `
═══════════════════════════════════════════════════════════════════════════════
                         GENESIS DECLARATION
                    LuvOnPurpose Sovereign System
═══════════════════════════════════════════════════════════════════════════════

                              THE FOUNDING

On this day, ${formattedDate}, the flame of purpose was lit,
marking the genesis of the LuvOnPurpose Sovereign System.

═══════════════════════════════════════════════════════════════════════════════
                           HOUSE IDENTIFICATION
═══════════════════════════════════════════════════════════════════════════════

House Name:        ${data.houseName}
Genesis RIN:       ${data.genesisRIN}
Trust Name:        ${data.trustName}
Founder:           ${data.founderName}
Genesis Hash:      ${data.genesisHash}

═══════════════════════════════════════════════════════════════════════════════
                         STATEMENT OF PURPOSE
═══════════════════════════════════════════════════════════════════════════════

${data.statementOfPurpose}

═══════════════════════════════════════════════════════════════════════════════
                          FOUNDING PRINCIPLES
═══════════════════════════════════════════════════════════════════════════════

This Genesis House is established upon the following principles:

1. LAND - Reconnection with ancestral roots and physical stability
2. AIR  - Education, knowledge, and clear communication
3. WATER - Healing, balance, and emotional resilience
4. SELF - Purpose, skills, and financial sovereignty

═══════════════════════════════════════════════════════════════════════════════
                         TOKEN CHAIN ACTIVATION
═══════════════════════════════════════════════════════════════════════════════

The complete token sequence has been activated:

  ◆ MIRROR - Self-reflection and identity established
  ◆ GIFT   - Recognition of inherent value confirmed
  ◆ SPARK  - Purpose and potential ignited
  ◆ HOUSE  - Sovereign structure activated
  ◆ CROWN  - Full authority and stewardship granted

═══════════════════════════════════════════════════════════════════════════════
                        BLOODLINE DESIGNATION
═══════════════════════════════════════════════════════════════════════════════

${data.heirs.length > 0 ? data.heirs.map((h, i) => 
  `${i + 1}. ${h.name} (${h.relationship}) - ${h.percentage}%`
).join('\n') : 'No heirs designated at time of Genesis.'}

═══════════════════════════════════════════════════════════════════════════════
                           FLAME LIGHTING
═══════════════════════════════════════════════════════════════════════════════

The Genesis Flame was lit at:
${formattedDate}

This timestamp marks the official beginning of the LuvOnPurpose
multi-generational wealth system. All subsequent Houses trace
their lineage to this moment.

═══════════════════════════════════════════════════════════════════════════════
                         VERIFICATION SEAL
═══════════════════════════════════════════════════════════════════════════════

This document is cryptographically sealed with the following hash:
${data.genesisHash}

This hash serves as immutable proof of the Genesis ceremony
and can be verified against the blockchain record.

═══════════════════════════════════════════════════════════════════════════════
                              DECLARATION
═══════════════════════════════════════════════════════════════════════════════

I, ${data.founderName}, as the Founder of this Genesis House,
declare this system established for the purpose of building
multi-generational wealth, preserving family legacy, and
creating sovereign structures for my descendants.

May this flame burn eternal.

                              ◆ ◆ ◆

═══════════════════════════════════════════════════════════════════════════════
                    LuvOnPurpose Sovereign System
                         Genesis House #001
═══════════════════════════════════════════════════════════════════════════════
`;
}

// Generate house hash for verification
function generateHouseHash(houseData: {
  userId: string;
  houseType: string;
  createdAt: Date;
}): string {
  const data = JSON.stringify({
    user: houseData.userId,
    type: houseData.houseType,
    timestamp: houseData.createdAt.toISOString(),
  });
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Default folder structure for vault
const DEFAULT_VAULT_FOLDERS = [
  { name: "Trust Documents", path: "/Trust Documents" },
  { name: "Business Entities", path: "/Business Entities" },
  { name: "Tax Returns", path: "/Tax Returns" },
  { name: "Insurance", path: "/Insurance" },
  { name: "Property Deeds", path: "/Property Deeds" },
  { name: "Contracts", path: "/Contracts" },
  { name: "Certificates", path: "/Certificates" },
  { name: "Financial Statements", path: "/Financial Statements" },
  { name: "Legal Correspondence", path: "/Legal Correspondence" },
  { name: "Family Records", path: "/Family Records" },
];

// Default community fund allocations
const DEFAULT_COMMUNITY_FUNDS = [
  { fundName: "Land Acquisition Fund", fundCode: "LAND", fundType: "land_acquisition" as const, allocationPercentage: "30.00", description: "Real estate and land purchases for family wealth building" },
  { fundName: "Education Fund", fundCode: "EDU", fundType: "education" as const, allocationPercentage: "25.00", description: "Educational expenses, scholarships, and Academy operations" },
  { fundName: "Emergency Fund", fundCode: "EMERGENCY", fundType: "emergency" as const, allocationPercentage: "15.00", description: "Emergency assistance for House members" },
  { fundName: "Business Development Fund", fundCode: "BIZDEV", fundType: "business_development" as const, allocationPercentage: "15.00", description: "Seed capital for new family businesses" },
  { fundName: "Cultural Preservation Fund", fundCode: "CULTURE", fundType: "cultural_preservation" as const, allocationPercentage: "10.00", description: "Heritage, traditions, and cultural activities" },
  { fundName: "Discretionary Fund", fundCode: "DISC", fundType: "discretionary" as const, allocationPercentage: "5.00", description: "Trustee discretion for special circumstances" },
];

export const ownerHouseSetupRouter = router({
  // Check if current user is the system owner
  checkOwnerStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.openId;
    const userRole = ctx.user.role;
    const ownerStatus = isOwner(userId, userRole);
    
    console.log("[Owner Check] User OpenID:", userId);
    console.log("[Owner Check] User Role:", userRole);
    console.log("[Owner Check] ENV Owner OpenID:", ENV.ownerOpenId);
    console.log("[Owner Check] Is Owner:", ownerStatus);
    
    return {
      isOwner: ownerStatus,
      ownerOpenId: ENV.ownerOpenId,
      currentOpenId: userId,
    };
  }),

  // Get owner's existing House (if any)
  getOwnerHouse: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const userId = ctx.user.openId;
    const userRole = ctx.user.role;
    if (!isOwner(userId, userRole)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only the system owner can access this" });
    }

    // Get owner's house
    const userHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.ownerUserId, ctx.user.id))
      .limit(1);

    if (!userHouse.length) {
      return { house: null, hasHouse: false };
    }

    // Get linked businesses
    const linkedBusinesses = await db
      .select({
        link: houseBusinesses,
        business: businessEntities,
      })
      .from(houseBusinesses)
      .innerJoin(businessEntities, eq(houseBusinesses.businessEntityId, businessEntities.id))
      .where(eq(houseBusinesses.houseId, userHouse[0].id));

    // Get house members
    const members = await db
      .select()
      .from(houseMembers)
      .where(eq(houseMembers.houseId, userHouse[0].id));

    // Get heirs
    const heirs = await db
      .select()
      .from(houseHeirs)
      .where(eq(houseHeirs.houseId, userHouse[0].id));

    // Get community funds
    const funds = await db
      .select()
      .from(communityFunds)
      .where(eq(communityFunds.houseId, userHouse[0].id));

    return {
      house: userHouse[0],
      hasHouse: true,
      linkedBusinesses,
      members,
      heirs,
      communityFunds: funds,
    };
  }),

  // Owner bypass: Activate House without Business Workshop
  activateOwnerHouse: protectedProcedure
    .input(
      z.object({
        houseName: z.string().min(1).max(255),
        trustName: z.string().min(1).max(255),
        trustEIN: z.string().optional(),
        trustType: z.enum(["living", "revocable", "irrevocable", "dynasty"]).default("living"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user.openId;
      const userRole = ctx.user.role;
      if (!isOwner(userId, userRole)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the system owner can use this bypass" });
      }

      // Check if owner already has a house
      const existingHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, ctx.user.id))
        .limit(1);

      if (existingHouse.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Owner already has a House activated",
        });
      }

      const createdAt = new Date();
      const rin = generateRIN("root", userId);
      const houseHash = generateHouseHash({
        userId,
        houseType: "root",
        createdAt,
      });

      // Create the root House
      const [house] = await db
        .insert(houses)
        .values({
          ownerUserId: ctx.user.id,
          name: input.houseName,
          houseType: "root",
          trustName: input.trustName,
          trustType: input.trustType,
          trustEIN: input.trustEIN,
          status: "active",
          generation: 1,
          // Default splits
          interHouseSplit: "60.00",
          interHouseDistribution: "40.00",
          intraHouseOperations: "70.00",
          intraHouseInheritance: "30.00",
        })
        .$returningId();

      // Initialize token chain state - owner starts with all tokens activated
      await db.insert(tokenChainStates).values({
        houseId: house.id,
        userId,
        currentTokenIndex: 5, // All 5 tokens activated for owner
        activatedTokens: ["MIRROR", "GIFT", "SPARK", "HOUSE", "CROWN"],
        chainStatus: "completed",
        mirrorActivatedAt: new Date(),
        giftActivatedAt: new Date(),
        sparkActivatedAt: new Date(),
        houseActivatedAt: new Date(),
      });

      // Seal all required scrolls for owner (bypassing normal requirements)
      const ownerScrolls = [7, 14, 16, 25, 26, 31, 32, 33, 41, 46, 48, 49];
      for (const scrollNumber of ownerScrolls) {
        await db.insert(scrollSealStatus).values({
          userId,
          houseId: house.id,
          scrollNumber,
          isSealed: true,
          sealedAt: new Date(),
        });
      }

      // Create LuvLedger account for the House
      await db.insert(luvLedgerAccounts).values({
        userId: ctx.user.id,
        accountType: "entity",
        accountName: `${input.houseName} Treasury`,
        balance: "0",
        allocationPercentage: "100.00",
        status: "active",
      });

      // Create document vault for the House
      const vaultHash = crypto.randomBytes(32).toString("hex");
      const [vault] = await db.insert(houseDocumentVaults).values({
        houseId: house.id,
        vaultName: `${input.houseName} Document Vault`,
        vaultHash,
        encryptionEnabled: true,
        status: "active",
      }).$returningId();

      // Create default vault folders
      for (const folder of DEFAULT_VAULT_FOLDERS) {
        await db.insert(vaultFolders).values({
          vaultId: vault.id,
          folderName: folder.name,
          folderPath: folder.path,
          isPrivate: false,
        });
      }

      // Create default community funds
      for (const fund of DEFAULT_COMMUNITY_FUNDS) {
        await db.insert(communityFunds).values({
          houseId: house.id,
          fundName: fund.fundName,
          fundCode: fund.fundCode,
          fundType: fund.fundType,
          allocationPercentage: fund.allocationPercentage,
          description: fund.description,
          currentBalance: "0",
          isActive: true,
        });
      }

      // Add owner as trustee member
      await db.insert(houseMembers).values({
        houseId: house.id,
        userId: ctx.user.id,
        memberType: "bloodline",
        lineageStatus: "source_flame",
        role: "trustee",
        ownershipPercentage: "100.00",
        votingRights: true,
        distributionEligible: true,
        canTransferTokens: true,
        canInitiateHouse: true,
        successionEligible: true,
        status: "active",
      });

      return {
        houseId: house.id,
        rin,
        houseHash,
        vaultId: vault.id,
        status: "ACTIVATED",
        message: "Owner House activated successfully with full privileges. All tokens activated, scrolls sealed.",
      };
    }),

  // Import existing business entity into House
  importExistingBusiness: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(1).max(255),
        entityType: z.enum(["trust", "llc", "corporation", "collective"]),
        ein: z.string().optional(),
        stateOfFormation: z.string().optional(),
        description: z.string().optional(),
        ownershipPercentage: z.number().min(0).max(100).default(100),
        incomeContributionRate: z.number().min(0).max(100).default(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user.openId;
      const userRole = ctx.user.role;
      if (!isOwner(userId, userRole)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the system owner can import businesses" });
      }

      // Get owner's house
      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, ctx.user.id))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Must activate House first before importing businesses",
        });
      }

      // Create the business entity
      const [business] = await db
        .insert(businessEntities)
        .values({
          userId: ctx.user.id,
          name: input.businessName,
          entityType: input.entityType,
          status: "active",
          trustLevel: 5, // Owner's businesses get highest trust level
          description: input.description,
          financialStructure: JSON.stringify({
            ein: input.ein,
            stateOfFormation: input.stateOfFormation,
            ownershipPercentage: input.ownershipPercentage,
            incomeContributionRate: input.incomeContributionRate,
          }),
        })
        .$returningId();

      // Link business to House
      await db.insert(houseBusinesses).values({
        houseId: userHouse[0].id,
        businessEntityId: business.id,
        ownershipPercentage: input.ownershipPercentage.toString(),
        incomeContributionRate: input.incomeContributionRate.toString(),
        status: "active",
      });

      // Create LuvLedger account for the business
      await db.insert(luvLedgerAccounts).values({
        userId: ctx.user.id,
        businessEntityId: business.id,
        accountType: "entity",
        accountName: `${input.businessName} Account`,
        balance: "0",
        allocationPercentage: input.incomeContributionRate.toString(),
        status: "active",
      });

      return {
        businessId: business.id,
        linkedToHouseId: userHouse[0].id,
        status: "IMPORTED",
        message: `${input.businessName} imported and linked to House with ${input.incomeContributionRate}% income contribution rate.`,
      };
    }),

  // Add heir to House
  addHeir: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(1).max(255),
        relationship: z.enum(["child", "grandchild", "great_grandchild", "spouse", "sibling", "niece_nephew", "adopted", "other"]),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        dateOfBirth: z.date().optional(),
        inheritancePercentage: z.number().min(0).max(100),
        distributionType: z.enum(["immediate", "accumulate"]).default("accumulate"),
        vestingSchedule: z.array(z.object({
          milestone: z.string(),
          percentage: z.number(),
          targetDate: z.date().optional(),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user.openId;
      const userRole = ctx.user.role;
      if (!isOwner(userId, userRole)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the system owner can add heirs" });
      }

      // Get owner's house
      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, ctx.user.id))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Must activate House first before adding heirs",
        });
      }

      // Create heir record
      const [heir] = await db
        .insert(houseHeirs)
        .values({
          houseId: userHouse[0].id,
          fullName: input.fullName,
          relationship: input.relationship,
          email: input.email,
          phone: input.phone,
          dateOfBirth: input.dateOfBirth,
          distributionPercentage: input.inheritancePercentage.toFixed(2),
          distributionMethod: input.distributionType,
          designatedBy: ctx.user.id,
          status: "active",
        })
        .$returningId();

      return {
        heirId: heir.id,
        houseId: userHouse[0].id,
        status: "ADDED",
        message: `${input.fullName} added as heir with ${input.inheritancePercentage}% inheritance.`,
      };
    }),

  // Update House configuration (splits, etc.)
  updateHouseConfiguration: protectedProcedure
    .input(
      z.object({
        interHouseSplit: z.number().min(0).max(100).optional(),
        interHouseDistribution: z.number().min(0).max(100).optional(),
        intraHouseOperations: z.number().min(0).max(100).optional(),
        intraHouseInheritance: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user.openId;
      const userRole = ctx.user.role;
      if (!isOwner(userId, userRole)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the system owner can update House configuration" });
      }

      // Get owner's house
      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, ctx.user.id))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "House not found",
        });
      }

      // Validate splits add up correctly
      const interHouse = input.interHouseSplit ?? parseFloat(userHouse[0].interHouseSplit);
      const interDist = input.interHouseDistribution ?? parseFloat(userHouse[0].interHouseDistribution);
      const intraOps = input.intraHouseOperations ?? parseFloat(userHouse[0].intraHouseOperations);
      const intraInherit = input.intraHouseInheritance ?? parseFloat(userHouse[0].intraHouseInheritance);

      if (Math.abs((interHouse + interDist) - 100) > 0.01) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Inter-house split and distribution must add up to 100%",
        });
      }

      if (Math.abs((intraOps + intraInherit) - 100) > 0.01) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Intra-house operations and inheritance must add up to 100%",
        });
      }

      // Update house configuration
      await db
        .update(houses)
        .set({
          interHouseSplit: interHouse.toFixed(2),
          interHouseDistribution: interDist.toFixed(2),
          intraHouseOperations: intraOps.toFixed(2),
          intraHouseInheritance: intraInherit.toFixed(2),
        })
        .where(eq(houses.id, userHouse[0].id));

      return {
        status: "UPDATED",
        configuration: {
          interHouseSplit: interHouse,
          interHouseDistribution: interDist,
          intraHouseOperations: intraOps,
          intraHouseInheritance: intraInherit,
        },
        message: "House configuration updated successfully.",
      };
    }),

  // Get all businesses that can be imported
  getImportableBusinesses: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

  const userId = ctx.user.openId;
    const userRole = ctx.user.role;
    if (!isOwner(userId, userRole)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only the system owner can access this" });
    }

    // Check for existing Genesis Housee user that aren't already linked to a house
    const allBusinesses = await db
      .select()
      .from(businessEntities)
      .where(eq(businessEntities.userId, ctx.user.id));

    // Get already linked businesses
    const userHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.ownerUserId, ctx.user.id))
      .limit(1);

    if (!userHouse.length) {
      return { businesses: allBusinesses, linkedBusinessIds: [] };
    }

    const linkedBusinesses = await db
      .select()
      .from(houseBusinesses)
      .where(eq(houseBusinesses.houseId, userHouse[0].id));

    const linkedIds = linkedBusinesses.map(lb => lb.businessEntityId);

    return {
      businesses: allBusinesses,
      linkedBusinessIds: linkedIds,
      unlinkedBusinesses: allBusinesses.filter(b => !linkedIds.includes(b.id)),
    };
  }),

  // ============================================
  // GENESIS MODE - Ceremonial House Activation
  // ============================================

  // Activate Genesis House with ceremonial data
  activateGenesisHouse: protectedProcedure
    .input(
      z.object({
        houseName: z.string().min(1).max(255),
        trustName: z.string().min(1).max(255),
        trustEIN: z.string().optional(),
        trustType: z.enum(["living", "revocable", "irrevocable", "dynasty"]).default("living"),
        statementOfPurpose: z.string().min(10).max(5000),
        founderName: z.string().min(1).max(255),
        heirs: z.array(z.object({
          name: z.string(),
          relationship: z.string(),
          percentage: z.number(),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user.openId;
      const userRole = ctx.user.role;
      if (!isOwner(userId, userRole)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the system owner can activate the Genesis House" });
      }

      // Check if a Genesis House already exists
      const existingGenesis = await db
        .select()
        .from(houses)
        .where(eq(houses.isGenesis, true))
        .limit(1);

      if (existingGenesis.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "A Genesis House already exists. There can only be one.",
        });
      }

      // Check if owner already has a house
      const existingHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, ctx.user.id))
        .limit(1);

      if (existingHouse.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Owner already has a House. Cannot create Genesis House.",
        });
      }

      // Flame lighting timestamp - the ceremonial moment
      const flameLightingTimestamp = new Date();
      const genesisRIN = generateRIN("root", userId, true);
      const genesisHash = generateGenesisHash({
        statementOfPurpose: input.statementOfPurpose,
        trustName: input.trustName,
        flameLightingTimestamp,
        founderName: input.founderName,
      });

      // Create the Genesis House
      const [house] = await db
        .insert(houses)
        .values({
          ownerUserId: ctx.user.id,
          name: input.houseName,
          houseType: "root",
          trustName: input.trustName,
          trustType: input.trustType,
          trustEIN: input.trustEIN,
          status: "active",
          generation: 1,
          // Genesis-specific fields
          isGenesis: true,
          genesisRIN,
          genesisHash,
          statementOfPurpose: input.statementOfPurpose,
          flameLightingTimestamp,
          // Default splits
          interHouseSplit: "60.00",
          interHouseDistribution: "40.00",
          intraHouseOperations: "70.00",
          intraHouseInheritance: "30.00",
        })
        .$returningId();

      // Initialize token chain state - Genesis founder has all tokens
      await db.insert(tokenChainStates).values({
        houseId: house.id,
        userId,
        currentTokenIndex: 5,
        activatedTokens: ["MIRROR", "GIFT", "SPARK", "HOUSE", "CROWN"],
        chainStatus: "completed",
        mirrorActivatedAt: flameLightingTimestamp,
        giftActivatedAt: flameLightingTimestamp,
        sparkActivatedAt: flameLightingTimestamp,
        houseActivatedAt: flameLightingTimestamp,
      });

      // Seal all scrolls for Genesis founder
      const genesisScrolls = [7, 14, 16, 25, 26, 31, 32, 33, 41, 46, 48, 49];
      for (const scrollNumber of genesisScrolls) {
        await db.insert(scrollSealStatus).values({
          userId,
          houseId: house.id,
          scrollNumber,
          isSealed: true,
          sealedAt: flameLightingTimestamp,
          sealedBy: userId,
          verificationMethod: "manual",
        });
      }

      // Create LuvLedger account
      await db.insert(luvLedgerAccounts).values({
        userId: ctx.user.id,
        accountType: "trust",
        accountName: `${input.houseName} Genesis Treasury`,
        balance: "0.00",
        status: "active",
      });

      // Create document vault
      const vaultHash = crypto.createHash("sha256").update(`${house.id}-${Date.now()}`).digest("hex");
      const [vault] = await db
        .insert(houseDocumentVaults)
        .values({
          houseId: house.id,
          vaultName: `${input.houseName} Genesis Vault`,
          vaultHash,
          encryptionEnabled: true,
          storageQuotaBytes: 10737418240, // 10GB
          totalDocuments: 0,
          totalStorageBytes: 0,
        })
        .$returningId();

      // Create default vault folders
      for (const folder of DEFAULT_VAULT_FOLDERS) {
        await db.insert(vaultFolders).values({
          vaultId: vault.id,
          folderName: folder.name,
          folderPath: folder.path,
          isPrivate: false,
        });
      }

      // Create community funds
      for (const fund of DEFAULT_COMMUNITY_FUNDS) {
        await db.insert(communityFunds).values({
          houseId: house.id,
          fundName: fund.fundName,
          fundCode: fund.fundCode,
          fundType: fund.fundType,
          allocationPercentage: fund.allocationPercentage,
          description: fund.description,
          currentBalance: "0.00",
          isActive: true,
        });
      }

      // Add founder as trustee member
      await db.insert(houseMembers).values({
        houseId: house.id,
        userId: ctx.user.id,
        memberType: "bloodline",
        lineageStatus: "source_flame",
        role: "trustee",
        ownershipPercentage: "100.00",
        votingRights: true,
        distributionEligible: true,
        canTransferTokens: true,
        canInitiateHouse: true,
        successionEligible: true,
        status: "active",
      });

      // Add heirs if provided
      const heirsForDoc: Array<{ name: string; relationship: string; percentage: number }> = [];
      if (input.heirs && input.heirs.length > 0) {
        for (const heir of input.heirs) {
          await db.insert(houseHeirs).values({
            houseId: house.id,
            fullName: heir.name,
            relationship: heir.relationship as any,
            distributionPercentage: heir.percentage.toFixed(2),
            distributionMethod: "accumulate",
            designatedBy: ctx.user.id,
            status: "active",
          });
          heirsForDoc.push(heir);
        }
      }

      // Generate Genesis Declaration document
      const declarationContent = generateGenesisDeclarationContent({
        houseName: input.houseName,
        trustName: input.trustName,
        founderName: input.founderName,
        statementOfPurpose: input.statementOfPurpose,
        flameLightingTimestamp,
        genesisHash,
        genesisRIN,
        heirs: heirsForDoc,
      });

      // Upload Genesis Declaration to S3
      const declarationBuffer = Buffer.from(declarationContent, "utf-8");
      const declarationHash = crypto.createHash("sha256").update(declarationBuffer).digest("hex");
      const s3Key = `vault/${vault.id}/genesis-declaration-${declarationHash.slice(0, 8)}.txt`;
      const { url: s3Url } = await storagePut(s3Key, declarationBuffer, "text/plain");

      // Create document record in vault
      const [doc] = await db
        .insert(vaultDocuments)
        .values({
          vaultId: vault.id,
          documentName: "Genesis Declaration",
          documentType: "legal",
          fileName: "genesis-declaration.txt",
          fileSize: declarationBuffer.length,
          mimeType: "text/plain",
          fileHash: declarationHash,
          s3Key,
          s3Url,
          description: "The founding document of the Genesis House, recording the ceremonial activation.",
          tags: ["genesis", "founding", "ceremony", "declaration"],
          uploadedByUserId: ctx.user.id,
        })
        .$returningId();

      // Update house with declaration document ID
      await db
        .update(houses)
        .set({ genesisDeclarationDocId: doc.id })
        .where(eq(houses.id, house.id));

      // Update vault stats
      await db
        .update(houseDocumentVaults)
        .set({
          totalDocuments: 1,
          totalStorageBytes: declarationBuffer.length,
        })
        .where(eq(houseDocumentVaults.id, vault.id));

      return {
        houseId: house.id,
        genesisRIN,
        genesisHash,
        flameLightingTimestamp: flameLightingTimestamp.toISOString(),
        vaultId: vault.id,
        declarationDocId: doc.id,
        declarationUrl: s3Url,
        status: "GENESIS_ACTIVATED",
        message: `The Genesis House "${input.houseName}" has been activated. The flame is lit. All subsequent Houses will trace their lineage to this moment.`,
      };
    }),

  // Get Genesis Declaration document
  getGenesisDeclaration: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const userId = ctx.user.openId;
    const userRole = ctx.user.role;
    if (!isOwner(userId, userRole)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only the system owner can access the Genesis Declaration" });
    }

    // Get Genesis House
    const genesisHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.isGenesis, true))
      .limit(1);

    if (!genesisHouse.length) {
      return { exists: false, declaration: null };
    }

    const house = genesisHouse[0];

    // Get declaration document if it exists
    let declaration = null;
    if (house.genesisDeclarationDocId) {
      const docs = await db
        .select()
        .from(vaultDocuments)
        .where(eq(vaultDocuments.id, house.genesisDeclarationDocId))
        .limit(1);
      declaration = docs[0] || null;
    }

    return {
      exists: true,
      house: {
        id: house.id,
        name: house.name,
        genesisRIN: house.genesisRIN,
        genesisHash: house.genesisHash,
        statementOfPurpose: house.statementOfPurpose,
        flameLightingTimestamp: house.flameLightingTimestamp,
        trustName: house.trustName,
        trustType: house.trustType,
      },
      declaration,
    };
  }),
});
