import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  houses, 
  houseMembers, 
  houseBusinesses, 
  incomeEvents, 
  distributionEvents, 
  networkHouses,
  inheritanceQueue,
  systemAuditLog,
  businessEntities,
  blockchainRecords
} from "../../drizzle/schema";
import type { House, HouseMember } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from "crypto";

// Generate blockchain hash for immutable records
function generateBlockchainHash(data: any, previousHash?: string): string {
  const content = JSON.stringify(data) + (previousHash || "") + Date.now();
  return crypto.createHash("sha256").update(content).digest("hex");
}

// Get the latest blockchain hash for chaining
async function getLatestBlockchainHash(): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const latest = await db
    .select({ hash: blockchainRecords.blockchainHash })
    .from(blockchainRecords)
    .orderBy(desc(blockchainRecords.timestamp))
    .limit(1);
  return latest[0]?.hash || null;
}

// Record to blockchain
async function recordToBlockchain(recordType: "transaction" | "certificate" | "entity_creation" | "trust_update" | "allocation_change", referenceId: number, data: any) {
  const db = await getDb();
  if (!db) return "";
  
  const previousHash = await getLatestBlockchainHash();
  const newHash = generateBlockchainHash(data, previousHash || undefined);
  
  await db.insert(blockchainRecords).values({
    recordType,
    referenceId,
    blockchainHash: newHash,
    previousHash,
    data,
  });
  
  return newHash;
}

// Log system audit event
async function logAuditEvent(
  eventType: "income_received" | "distribution_executed" | "house_created" | "member_added" | "business_linked" | "rule_triggered" | "inheritance_vested" | "manual_override",
  entityType: string,
  entityId: number,
  actorType: "system" | "user" | "admin",
  actorId: number | null,
  beforeState: any,
  afterState: any,
  description: string
) {
  const db = await getDb();
  if (!db) return;
  
  const blockchainHash = await recordToBlockchain("transaction", entityId, { eventType, entityType, afterState });
  
  await db.insert(systemAuditLog).values({
    eventType,
    entityType,
    entityId,
    actorType,
    actorId,
    beforeState,
    afterState,
    description,
    blockchainHash,
  });
}

// Distribution engine function
async function executeDistribution(incomeEventId: number, houseId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  
  // Get House configuration
  const [house] = await db.select().from(houses).where(eq(houses.id, houseId));
  if (!house) return;
  
  const interHouseSplit = parseFloat(house.interHouseSplit);
  const interHouseDistribution = parseFloat(house.interHouseDistribution);
  const intraHouseOperations = parseFloat(house.intraHouseOperations);
  const intraHouseInheritance = parseFloat(house.intraHouseInheritance);
  
  // STEP 1: Root Distribution (70/30 per Scroll 18)
  // 70% goes to Root Treasury, 30% to Ancestral Treasury Wallet
  const rootTreasuryAmount = amount * 0.70;
  const ancestralTreasuryAmount = amount * 0.30;
  
  // STEP 2: Internal Division of 70% Root Treasury (60/40 per Scroll 18)
  // 60% → Root Authority Reserve (non-shareable)
  // 40% → Circulation Pool (shareable for token rewards, system expansion)
  const rootAuthorityReserve = rootTreasuryAmount * 0.60;
  const circulationPool = rootTreasuryAmount * 0.40;
  
  // Inter-House Distribution from Circulation Pool
  const retainedAmount = circulationPool * (interHouseSplit / 100);
  const networkAmount = circulationPool * (interHouseDistribution / 100);
  
  // Record Root Authority Reserve (non-shareable 60% of 70%)
  const rootReserveHash = await recordToBlockchain("allocation_change", houseId, {
    type: "root_authority_reserve",
    amount: rootAuthorityReserve,
    percentage: 42, // 60% of 70%
    description: "Non-shareable Root Authority Reserve",
  });
  
  await db.insert(distributionEvents).values({
    incomeEventId,
    distributionType: "root_treasury",
    fromHouseId: houseId,
    toHouseId: houseId,
    allocationCategory: "root_authority_reserve",
    amount: String(rootAuthorityReserve),
    percentage: "42",
    description: "Root Authority Reserve (60% of 70% Root Treasury) - Non-shareable",
    status: "executed",
    executedAt: new Date(),
    blockchainHash: rootReserveHash,
  });
  
  // Record Ancestral Treasury (30%)
  const ancestralHash = await recordToBlockchain("allocation_change", houseId, {
    type: "ancestral_treasury",
    amount: ancestralTreasuryAmount,
    percentage: 30,
    description: "Ancestral Treasury Wallet",
  });
  
  await db.insert(distributionEvents).values({
    incomeEventId,
    distributionType: "ancestral_treasury",
    fromHouseId: houseId,
    toHouseId: houseId,
    allocationCategory: "ancestral_treasury",
    amount: String(ancestralTreasuryAmount),
    percentage: "30",
    description: "Ancestral Treasury Wallet (30% of income)",
    status: "executed",
    executedAt: new Date(),
    blockchainHash: ancestralHash,
  });
  
  // Record Circulation Pool retained amount
  const retainedHash = await recordToBlockchain("allocation_change", houseId, {
    type: "circulation_pool_retained",
    amount: retainedAmount,
    percentage: interHouseSplit,
  });
  
  await db.insert(distributionEvents).values({
    incomeEventId,
    distributionType: "inter_house",
    fromHouseId: houseId,
    toHouseId: null,
    allocationCategory: null,
    amount: String(retainedAmount),
    percentage: String(interHouseSplit),
    description: `Retained ${interHouseSplit}% of income`,
    status: "executed",
    executedAt: new Date(),
    blockchainHash: retainedHash,
  });
  
  // Distribute to network (40%)
  if (networkAmount > 0) {
    const networkHousesList = await db
      .select()
      .from(networkHouses)
      .where(and(
        eq(networkHouses.sourceHouseId, houseId),
        eq(networkHouses.status, "active")
      ));
    
    for (const nh of networkHousesList) {
      const shareAmount = networkAmount * (parseFloat(nh.allocationPercentage) / 100);
      
      const networkHash = await recordToBlockchain("allocation_change", nh.targetHouseId, {
        type: "inter_house_network",
        sourceHouse: houseId,
        amount: shareAmount,
      });
      
      await db.insert(distributionEvents).values({
        incomeEventId,
        distributionType: "inter_house",
        fromHouseId: houseId,
        toHouseId: nh.targetHouseId,
        allocationCategory: "network",
        amount: String(shareAmount),
        percentage: nh.allocationPercentage,
        description: `Network distribution to House #${nh.targetHouseId}`,
        status: "executed",
        executedAt: new Date(),
        blockchainHash: networkHash,
      });
      
      // Update target House totals
      await db.update(houses)
        .set({
          totalIncome: sql`totalIncome + ${shareAmount}`,
        })
        .where(eq(houses.id, nh.targetHouseId));
    }
  }
  
  // STEP 2: Intra-House Distribution (70/30) on retained amount
  const operationsAmount = retainedAmount * (intraHouseOperations / 100);
  const inheritanceAmount = retainedAmount * (intraHouseInheritance / 100);
  
  // Operations allocation
  const opsHash = await recordToBlockchain("allocation_change", houseId, {
    type: "intra_house_operations",
    amount: operationsAmount,
    percentage: intraHouseOperations,
  });
  
  await db.insert(distributionEvents).values({
    incomeEventId,
    distributionType: "intra_house",
    fromHouseId: houseId,
    toHouseId: houseId,
    allocationCategory: "operations",
    amount: String(operationsAmount),
    percentage: String(intraHouseOperations),
    description: `Operations allocation (${intraHouseOperations}%)`,
    status: "executed",
    executedAt: new Date(),
    blockchainHash: opsHash,
  });
  
  // Inheritance allocation
  const inhHash = await recordToBlockchain("allocation_change", houseId, {
    type: "intra_house_inheritance",
    amount: inheritanceAmount,
    percentage: intraHouseInheritance,
  });
  
  await db.insert(distributionEvents).values({
    incomeEventId,
    distributionType: "intra_house",
    fromHouseId: houseId,
    toHouseId: houseId,
    allocationCategory: "inheritance",
    amount: String(inheritanceAmount),
    percentage: String(intraHouseInheritance),
    description: `Inheritance reserve (${intraHouseInheritance}%)`,
    status: "executed",
    executedAt: new Date(),
    blockchainHash: inhHash,
  });
  
  // Add to inheritance queue for beneficiaries
  const beneficiaries = await db
    .select()
    .from(houseMembers)
    .where(and(
      eq(houseMembers.houseId, houseId),
      eq(houseMembers.distributionEligible, true),
      eq(houseMembers.status, "active")
    ));
  
  if (beneficiaries.length > 0) {
    const perBeneficiary = inheritanceAmount / beneficiaries.length;
    
    for (const ben of beneficiaries) {
      await db.insert(inheritanceQueue).values({
        houseId,
        beneficiaryUserId: ben.userId,
        amount: String(perBeneficiary),
        status: "accumulating",
        notes: `From income event #${incomeEventId}`,
      });
    }
  }
  
  // Update House totals
  await db.update(houses)
    .set({
      totalIncome: sql`totalIncome + ${amount}`,
      totalDistributed: sql`totalDistributed + ${networkAmount}`,
      operationsBalance: sql`operationsBalance + ${operationsAmount}`,
      inheritanceReserve: sql`inheritanceReserve + ${inheritanceAmount}`,
    })
    .where(eq(houses.id, houseId));
  
  // Update income event status
  await db.update(incomeEvents)
    .set({ status: "distributed" })
    .where(eq(incomeEvents.id, incomeEventId));
  
  // Log audit
  await logAuditEvent(
    "distribution_executed",
    "income",
    incomeEventId,
    "system",
    null,
    { amount },
    {
      retained: retainedAmount,
      network: networkAmount,
      operations: operationsAmount,
      inheritance: inheritanceAmount,
    },
    `Automated distribution executed: $${amount} → Operations: $${operationsAmount}, Inheritance: $${inheritanceAmount}, Network: $${networkAmount}`
  );
}

async function rebalanceNetworkAllocations(sourceHouseId: number) {
  const db = await getDb();
  if (!db) return;
  
  const networkHousesList = await db
    .select()
    .from(networkHouses)
    .where(and(
      eq(networkHouses.sourceHouseId, sourceHouseId),
      eq(networkHouses.status, "active")
    ));
  
  if (networkHousesList.length === 0) return;
  
  const equalShare = 100 / networkHousesList.length;
  
  for (const nh of networkHousesList) {
    await db.update(networkHouses)
      .set({ allocationPercentage: String(equalShare) })
      .where(eq(networkHouses.id, nh.id));
  }
}

export const luvLedgerAssetManagerRouter = router({
  // Create a new House
  createHouse: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      houseType: z.enum(["root", "bloodline", "mirrored", "adaptive"]),
      parentHouseId: z.number().nullable().optional(),
      trustName: z.string().optional(),
      trustType: z.enum(["living", "revocable", "irrevocable", "dynasty"]).optional(),
      trustEIN: z.string().optional(),
      interHouseSplit: z.number().min(0).max(100).default(60),
      interHouseDistribution: z.number().min(0).max(100).default(40),
      intraHouseOperations: z.number().min(0).max(100).default(70),
      intraHouseInheritance: z.number().min(0).max(100).default(30),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let generation = 1;
      if (input.parentHouseId) {
        const parent = await db.select().from(houses).where(eq(houses.id, input.parentHouseId)).limit(1);
        if (parent[0]) {
          generation = parent[0].generation + 1;
        }
      }
      
      const [newHouse] = await db.insert(houses).values({
        name: input.name,
        houseType: input.houseType,
        parentHouseId: input.parentHouseId || null,
        ownerUserId: ctx.user.id,
        trustName: input.trustName,
        trustType: input.trustType || "living",
        trustEIN: input.trustEIN,
        interHouseSplit: String(input.interHouseSplit),
        interHouseDistribution: String(input.interHouseDistribution),
        intraHouseOperations: String(input.intraHouseOperations),
        intraHouseInheritance: String(input.intraHouseInheritance),
        generation,
        status: "forming",
      });
      
      const houseId = newHouse.insertId;
      
      await db.insert(houseMembers).values({
        houseId: Number(houseId),
        userId: ctx.user.id,
        role: "trustee",
        ownershipPercentage: "100.00",
        votingRights: true,
        distributionEligible: true,
        status: "active",
      });
      
      await logAuditEvent(
        "house_created",
        "house",
        Number(houseId),
        "user",
        ctx.user.id,
        null,
        { name: input.name, houseType: input.houseType, generation },
        `House "${input.name}" created as ${input.houseType} (Generation ${generation})`
      );
      
      if (input.parentHouseId) {
        await db.insert(networkHouses).values({
          sourceHouseId: input.parentHouseId,
          targetHouseId: Number(houseId),
          allocationPercentage: "100.00",
          relationship: "child",
          status: "active",
        });
      }
      
      return { houseId: Number(houseId), generation };
    }),
  
  // Get House hierarchy
  getHouseHierarchy: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const allHouses = await db.select().from(houses).orderBy(houses.generation);
    const members = await db.select().from(houseMembers).where(eq(houseMembers.userId, ctx.user.id));
    
    type HouseWithChildren = House & { isMember: boolean; children: HouseWithChildren[] };
    
    const buildTree = (parentId: number | null): HouseWithChildren[] => {
      return allHouses
        .filter((h) => h.parentHouseId === parentId)
        .map((house) => ({
          ...house,
          isMember: members.some((m) => m.houseId === house.id),
          children: buildTree(house.id),
        }));
    };
    
    return buildTree(null);
  }),
  
  // Get single House details
  getHouse: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const [house] = await db.select().from(houses).where(eq(houses.id, input.houseId));
      if (!house) return null;
      
      const members = await db.select().from(houseMembers).where(eq(houseMembers.houseId, input.houseId));
      const businesses = await db
        .select({
          link: houseBusinesses,
          business: businessEntities,
        })
        .from(houseBusinesses)
        .leftJoin(businessEntities, eq(houseBusinesses.businessEntityId, businessEntities.id))
        .where(eq(houseBusinesses.houseId, input.houseId));
      
      const network = await db.select().from(networkHouses).where(eq(networkHouses.sourceHouseId, input.houseId));
      
      return { house, members, businesses, network };
    }),
  
  // Record income event
  recordIncome: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      sourceType: z.enum(["business", "investment", "grant", "donation", "other"]),
      sourceId: z.number().optional(),
      grossAmount: z.number().positive(),
      netAmount: z.number().positive(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [incomeEvent] = await db.insert(incomeEvents).values({
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        houseId: input.houseId,
        grossAmount: String(input.grossAmount),
        netAmount: String(input.netAmount),
        description: input.description,
        status: "pending",
      });
      
      const incomeId = incomeEvent.insertId;
      
      await logAuditEvent(
        "income_received",
        "income",
        Number(incomeId),
        "user",
        ctx.user.id,
        null,
        { amount: input.netAmount, source: input.sourceType },
        `Income of $${input.netAmount} received from ${input.sourceType}`
      );
      
      await executeDistribution(Number(incomeId), input.houseId, input.netAmount);
      
      return { incomeId: Number(incomeId) };
    }),
  
  // Get distribution history
  getDistributionHistory: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const distributions = await db
        .select()
        .from(distributionEvents)
        .where(eq(distributionEvents.fromHouseId, input.houseId))
        .orderBy(desc(distributionEvents.createdAt))
        .limit(50);
      
      return distributions;
    }),
  
  // Manual distribution trigger
  triggerDistribution: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      amount: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [incomeEvent] = await db.insert(incomeEvents).values({
        sourceType: "other",
        houseId: input.houseId,
        grossAmount: String(input.amount),
        netAmount: String(input.amount),
        description: "Manual distribution trigger",
        status: "pending",
      });
      
      await executeDistribution(Number(incomeEvent.insertId), input.houseId, input.amount);
      
      return { success: true };
    }),
  
  // Get inheritance queue
  getInheritanceQueue: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const queue = await db
        .select()
        .from(inheritanceQueue)
        .where(eq(inheritanceQueue.houseId, input.houseId))
        .orderBy(desc(inheritanceQueue.createdAt));
      
      return queue;
    }),
  
  // Add House to network
  addToNetwork: protectedProcedure
    .input(z.object({
      sourceHouseId: z.number(),
      targetHouseId: z.number(),
      allocationPercentage: z.number().min(0).max(100),
      relationship: z.enum(["child", "sibling", "partner", "community"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.insert(networkHouses).values({
        sourceHouseId: input.sourceHouseId,
        targetHouseId: input.targetHouseId,
        allocationPercentage: String(input.allocationPercentage),
        relationship: input.relationship,
        status: "active",
      });
      
      await rebalanceNetworkAllocations(input.sourceHouseId);
      
      return { success: true };
    }),
  
  // Get network statistics
  getNetworkStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalHouses: 0, totalIncome: 0, totalDistributed: 0, totalInheritanceReserve: 0 };
    
    const totalHouses = await db.select({ count: sql<number>`count(*)` }).from(houses);
    const totalIncome = await db.select({ sum: sql<string>`COALESCE(SUM(netAmount), 0)` }).from(incomeEvents);
    const totalDistributed = await db.select({ sum: sql<string>`COALESCE(SUM(amount), 0)` }).from(distributionEvents);
    const totalInheritance = await db.select({ sum: sql<string>`COALESCE(SUM(amount), 0)` }).from(inheritanceQueue);
    
    return {
      totalHouses: totalHouses[0]?.count || 0,
      totalIncome: parseFloat(totalIncome[0]?.sum || "0"),
      totalDistributed: parseFloat(totalDistributed[0]?.sum || "0"),
      totalInheritanceReserve: parseFloat(totalInheritance[0]?.sum || "0"),
    };
  }),
  
  // Get audit log
  getAuditLog: protectedProcedure
    .input(z.object({
      houseId: z.number().optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      if (input.houseId) {
        return db
          .select()
          .from(systemAuditLog)
          .where(and(
            eq(systemAuditLog.entityType, "house"),
            eq(systemAuditLog.entityId, input.houseId)
          ))
          .orderBy(desc(systemAuditLog.createdAt))
          .limit(input.limit);
      }
      
      return db.select().from(systemAuditLog).orderBy(desc(systemAuditLog.createdAt)).limit(input.limit);
    }),
  
  // Link business to House
  linkBusiness: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      businessEntityId: z.number(),
      ownershipPercentage: z.number().min(0).max(100).default(100),
      incomeContributionRate: z.number().min(0).max(100).default(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.insert(houseBusinesses).values({
        houseId: input.houseId,
        businessEntityId: input.businessEntityId,
        ownershipPercentage: String(input.ownershipPercentage),
        incomeContributionRate: String(input.incomeContributionRate),
        status: "active",
      });
      
      await logAuditEvent(
        "business_linked",
        "house_business",
        input.houseId,
        "user",
        ctx.user.id,
        null,
        { businessEntityId: input.businessEntityId, ownershipPercentage: input.ownershipPercentage },
        `Business #${input.businessEntityId} linked to House #${input.houseId}`
      );
      
      return { success: true };
    }),
});

export default luvLedgerAssetManagerRouter;
