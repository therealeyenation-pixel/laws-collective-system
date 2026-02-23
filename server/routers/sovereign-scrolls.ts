import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  protectedLineage,
  sovereignScrolls,
  scrollActivations,
  treasuryClaims,
  flameLockCodes,
  blockchainRecords
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from "crypto";

// Generate sovereign hash for scroll sealing
function generateSovereignHash(data: any): string {
  const content = JSON.stringify(data) + Date.now() + "CALEA_FREEMAN_FAMILY_TRUST";
  return crypto.createHash("sha256").update(content).digest("hex");
}

// Record to blockchain
async function recordToBlockchain(recordType: string, referenceId: number, data: any) {
  const db = await getDb();
  if (!db) return "";
  
  const newHash = generateSovereignHash(data);
  
  await db.insert(blockchainRecords).values({
    recordType: recordType as any,
    referenceId,
    blockchainHash: newHash,
    previousHash: null,
    data,
  });
  
  return newHash;
}

export const sovereignScrollsRouter = router({
  // ============================================
  // PROTECTED LINEAGE REGISTRY (Scrolls 11/12)
  // ============================================
  
  // Get all protected lineage members
  getProtectedLineage: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    return db.select().from(protectedLineage).orderBy(protectedLineage.lineageOrder);
  }),
  
  // Add protected lineage member (admin only)
  addProtectedMember: protectedProcedure
    .input(z.object({
      fullName: z.string().min(1),
      relationship: z.string(),
      role: z.string().optional(),
      associatedHouse: z.string().optional(),
      lineageOrder: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Generate seal hash
      const sealHash = generateSovereignHash({
        name: input.fullName,
        relationship: input.relationship,
        timestamp: Date.now(),
        authority: "CALEA_FREEMAN_FAMILY_TRUST",
      });
      
      const [member] = await db.insert(protectedLineage).values({
        fullName: input.fullName,
        relationship: input.relationship,
        role: input.role,
        associatedHouse: input.associatedHouse,
        lineageOrder: input.lineageOrder || 0,
        sealedByScrollId: null,
        sealHash,
        status: "active",
      });
      
      // Record to blockchain
      await recordToBlockchain("entity_creation", Number(member.insertId), {
        type: "protected_lineage",
        name: input.fullName,
        sealHash,
      });
      
      return { memberId: Number(member.insertId), sealHash };
    }),
  
  // ============================================
  // SOVEREIGN SCROLLS (Scrolls 7-12)
  // ============================================
  
  // Get all scrolls
  getScrolls: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    return db.select().from(sovereignScrolls).orderBy(sovereignScrolls.scrollNumber);
  }),
  
  // Create/seal a new scroll
  sealScroll: protectedProcedure
    .input(z.object({
      scrollNumber: z.number().min(1),
      title: z.string().min(1),
      purpose: z.string(),
      content: z.string(),
      protectionType: z.enum(["lineage_enforcement", "ai_declaration", "access_control", "inheritance_lock", "protected_names"]),
      enforcementRules: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const sealHash = generateSovereignHash({
        scrollNumber: input.scrollNumber,
        title: input.title,
        content: input.content,
        authority: "SOURCE_FLAME",
      });
      
      const [scroll] = await db.insert(sovereignScrolls).values({
        scrollNumber: input.scrollNumber,
        title: input.title,
        purpose: input.purpose,
        content: input.content,
        protectionType: input.protectionType,
        enforcementRules: input.enforcementRules,
        sealHash,
        sealedAt: new Date(),
        sealedByUserId: ctx.user.id,
        status: "sealed",
      });
      
      await recordToBlockchain("certificate", Number(scroll.insertId), {
        type: "sovereign_scroll",
        scrollNumber: input.scrollNumber,
        title: input.title,
        sealHash,
      });
      
      return { scrollId: Number(scroll.insertId), sealHash };
    }),
  
  // Activate scroll for a House
  activateScroll: protectedProcedure
    .input(z.object({
      scrollId: z.number(),
      houseId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const activationHash = generateSovereignHash({
        scrollId: input.scrollId,
        houseId: input.houseId,
        activatedBy: ctx.user.id,
      });
      
      const [activation] = await db.insert(scrollActivations).values({
        scrollId: input.scrollId,
        houseId: input.houseId,
        activatedByUserId: ctx.user.id,
        activationHash,
        status: "active",
      });
      
      return { activationId: Number(activation.insertId), activationHash };
    }),
  
  // ============================================
  // TREASURY CLAIMS (Scroll 7 - 15% Logic)
  // ============================================
  
  // Record treasury claim (15% on derivative usage)
  recordTreasuryClaim: protectedProcedure
    .input(z.object({
      sourceType: z.enum(["derivative_logic", "scroll_usage", "ai_interface", "blockchain_deployment"]),
      sourceIdentifier: z.string(),
      grossAmount: z.number().positive(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // 15% treasury claim per Scroll 7
      const claimPercentage = 15;
      const claimAmount = input.grossAmount * (claimPercentage / 100);
      
      const claimHash = generateSovereignHash({
        sourceType: input.sourceType,
        sourceIdentifier: input.sourceIdentifier,
        claimAmount,
        timestamp: Date.now(),
      });
      
      const [claim] = await db.insert(treasuryClaims).values({
        sourceType: input.sourceType,
        sourceIdentifier: input.sourceIdentifier,
        grossAmount: String(input.grossAmount),
        claimPercentage: String(claimPercentage),
        claimAmount: String(claimAmount),
        description: input.description,
        claimHash,
        status: "pending",
      });
      
      await recordToBlockchain("transaction", Number(claim.insertId), {
        type: "treasury_claim",
        sourceType: input.sourceType,
        claimAmount,
        claimHash,
      });
      
      return { 
        claimId: Number(claim.insertId), 
        claimAmount,
        claimHash,
      };
    }),
  
  // Get treasury claims
  getTreasuryClaims: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "collected", "disputed"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      if (input.status) {
        return db.select().from(treasuryClaims)
          .where(eq(treasuryClaims.status, input.status))
          .orderBy(desc(treasuryClaims.createdAt));
      }
      
      return db.select().from(treasuryClaims).orderBy(desc(treasuryClaims.createdAt));
    }),
  
  // ============================================
  // FLAME LOCK CODES (Scroll 9)
  // ============================================
  
  // Generate Flame Lock Code for an entity
  generateFlameLock: protectedProcedure
    .input(z.object({
      entityType: z.enum(["house", "ai_system", "business", "scroll"]),
      entityId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Generate unique flame lock code
      const flameLockCode = `FLC-${crypto.randomBytes(16).toString("hex").toUpperCase()}`;
      const lockHash = generateSovereignHash({
        entityType: input.entityType,
        entityId: input.entityId,
        flameLockCode,
      });
      
      const [lock] = await db.insert(flameLockCodes).values({
        entityType: input.entityType,
        entityId: input.entityId,
        flameLockCode,
        lockHash,
        issuedByUserId: ctx.user.id,
        status: "active",
      });
      
      return { 
        lockId: Number(lock.insertId), 
        flameLockCode,
        lockHash,
      };
    }),
  
  // Verify Flame Lock Code
  verifyFlameLock: publicProcedure
    .input(z.object({
      flameLockCode: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { valid: false, message: "System unavailable" };
      
      const [lock] = await db.select().from(flameLockCodes)
        .where(eq(flameLockCodes.flameLockCode, input.flameLockCode));
      
      if (!lock) {
        return { valid: false, message: "Invalid Flame Lock Code" };
      }
      
      if (lock.status !== "active") {
        return { valid: false, message: `Flame Lock is ${lock.status}` };
      }
      
      return { 
        valid: true, 
        entityType: lock.entityType,
        entityId: lock.entityId,
        issuedAt: lock.createdAt,
      };
    }),
  
  // ============================================
  // SOVEREIGN STATISTICS
  // ============================================
  
  getSovereignStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {
      totalProtectedMembers: 0,
      totalScrolls: 0,
      totalTreasuryClaims: 0,
      totalClaimAmount: 0,
      activeFlameLocks: 0,
    };
    
    const protectedCount = await db.select({ count: sql<number>`count(*)` }).from(protectedLineage);
    const scrollCount = await db.select({ count: sql<number>`count(*)` }).from(sovereignScrolls);
    const claimCount = await db.select({ count: sql<number>`count(*)` }).from(treasuryClaims);
    const claimTotal = await db.select({ sum: sql<string>`COALESCE(SUM(claimAmount), 0)` }).from(treasuryClaims);
    const lockCount = await db.select({ count: sql<number>`count(*)` }).from(flameLockCodes).where(eq(flameLockCodes.status, "active"));
    
    return {
      totalProtectedMembers: protectedCount[0]?.count || 0,
      totalScrolls: scrollCount[0]?.count || 0,
      totalTreasuryClaims: claimCount[0]?.count || 0,
      totalClaimAmount: parseFloat(claimTotal[0]?.sum || "0"),
      activeFlameLocks: lockCount[0]?.count || 0,
    };
  }),
  
  // Initialize default protected lineage (Scrolls 11/12)
  initializeProtectedLineage: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Check if already initialized
    const existing = await db.select().from(protectedLineage).limit(1);
    if (existing.length > 0) {
      return { message: "Protected lineage already initialized" };
    }
    
    // Protected individuals from Scrolls 11/12
    const lineageMembers = [
      { fullName: "Craig Russell", relationship: "Founder", role: "Source Flame", lineageOrder: 1 },
      { fullName: "Amber Shavon Hunter", relationship: "Family", role: "Lineage Holder", lineageOrder: 2 },
      { fullName: "Essence Monet Maria Hunter", relationship: "Family", role: "Lineage Holder", lineageOrder: 3 },
      { fullName: "Amandes Edward Pearsall IV", relationship: "Family", role: "Lineage Holder", lineageOrder: 4 },
      { fullName: "Riyan", relationship: "Family", role: "Protected Heir", lineageOrder: 5 },
      { fullName: "Kyle", relationship: "Family", role: "Protected Heir", lineageOrder: 6 },
      { fullName: "Tyler", relationship: "Family", role: "Protected Heir", lineageOrder: 7 },
      { fullName: "Alani", relationship: "Family", role: "Protected Heir", lineageOrder: 8 },
      { fullName: "Carter", relationship: "Family", role: "Protected Heir", lineageOrder: 9 },
      { fullName: "Cornelius Christopher", relationship: "Adaptive House", role: "JustPath Mentorship", associatedHouse: "JustPath Mentorship", lineageOrder: 10 },
      { fullName: "Luise Mae", relationship: "Adaptive House", role: "Global Nurture Circle", associatedHouse: "CareLink", lineageOrder: 11 },
    ];
    
    for (const member of lineageMembers) {
      const sealHash = generateSovereignHash({
        name: member.fullName,
        relationship: member.relationship,
        authority: "CALEA_FREEMAN_FAMILY_TRUST",
      });
      
      await db.insert(protectedLineage).values({
        ...member,
        sealHash,
        status: "active",
      });
    }
    
    return { message: "Protected lineage initialized with 11 members", count: lineageMembers.length };
  }),
  
  // Initialize default scrolls (7-12)
  initializeScrolls: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Check if already initialized
    const existing = await db.select().from(sovereignScrolls).limit(1);
    if (existing.length > 0) {
      return { message: "Scrolls already initialized" };
    }
    
    const scrolls = [
      {
        scrollNumber: 7,
        title: "Lineage Enforcement & Sovereign Lock Protocol",
        purpose: "Establish sovereign enforcement mechanism linking all derived logic back to House of LuvOnPurpose",
        content: "15% treasury claim on derivative usage. Source Claim Beacon activation. Audit Trail Hash locked to Eternal Flame Vault.",
        protectionType: "lineage_enforcement" as const,
        enforcementRules: { treasuryClaimPercentage: 15, sourceClaimBeacon: true, auditTrailHash: true },
      },
      {
        scrollNumber: 8,
        title: "Sovereign AI Declaration Scroll",
        purpose: "Affirm sovereign authority over all AI systems created under LuvOnPurpose structure",
        content: "All AI structures subject to Root House logic. Closed-loop protection. Ownership under CALEA Freeman Family Trust.",
        protectionType: "ai_declaration" as const,
        enforcementRules: { closedLoop: true, ownershipEntity: "CALEA_FREEMAN_FAMILY_TRUST" },
      },
      {
        scrollNumber: 9,
        title: "AI Access Scroll: Sovereign Permission Required",
        purpose: "Govern access permissions and usage protocols of all LuvOnPurpose AI structures",
        content: "Sovereign use only. Restricted invocation. Limited duplication rights. Built-in Flame Lock.",
        protectionType: "access_control" as const,
        enforcementRules: { flameLockRequired: true, sovereignPermissionRequired: true },
      },
      {
        scrollNumber: 10,
        title: "House Inheritance Lock Clause",
        purpose: "Affirm House Inheritance Lock Clause within sovereign logic framework",
        content: "Lock Clause restricting control to Source Flame lineage. Descendant verification required. Default claim reversion.",
        protectionType: "inheritance_lock" as const,
        enforcementRules: { lockClause: true, descendantVerification: true, defaultReversion: "SOURCE_FLAME" },
      },
      {
        scrollNumber: 11,
        title: "Document of Lineage – Protected Names and Assignment",
        purpose: "Record formally assigned lineage names and placement within sovereign structure",
        content: "Protected individuals sealed into CALEA Freeman Family Trust. Protected from external claims and estate seizure.",
        protectionType: "protected_names" as const,
        enforcementRules: { sealedToTrust: "CALEA_FREEMAN_FAMILY_TRUST", protectionScope: "full" },
      },
      {
        scrollNumber: 12,
        title: "Lineage Protection Scroll",
        purpose: "Affirm sovereign lineage and protected inheritance rights",
        content: "Named lineage not subject to conflicting identification systems. Birthright and estate rights protected.",
        protectionType: "protected_names" as const,
        enforcementRules: { sovereignStatus: true, birthrightProtection: true },
      },
    ];
    
    for (const scroll of scrolls) {
      const sealHash = generateSovereignHash({
        scrollNumber: scroll.scrollNumber,
        title: scroll.title,
        authority: "SOURCE_FLAME",
      });
      
      await db.insert(sovereignScrolls).values({
        ...scroll,
        sealHash,
        sealedAt: new Date(),
        sealedByUserId: ctx.user.id,
        status: "sealed",
      });
    }
    
    return { message: "Scrolls 7-12 initialized and sealed", count: scrolls.length };
  }),
});

export default sovereignScrollsRouter;
