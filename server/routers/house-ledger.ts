import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  houses, 
  houseLedgers, 
  houseLedgerTransactions,
  mainHouseLedger,
  ledgerAccessLogs,
  fraudFlags,
  auditRequests
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// Helper to get database with null check
async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection not available",
    });
  }
  return db;
}

// Generate ledger hash
function generateLedgerHash(houseId: number, timestamp: Date): string {
  const data = `LEDGER-${houseId}-${timestamp.toISOString()}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Generate transaction hash
function generateTransactionHash(
  ledgerId: number,
  amount: string,
  type: string,
  previousHash: string | null
): string {
  const data = `TX-${ledgerId}-${amount}-${type}-${previousHash || "GENESIS"}-${Date.now()}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

export const houseLedgerRouter = router({
  // Initialize LuvLedger for a newly activated House
  initializeHouseLedger: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      houseName: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      const { houseId, houseName } = input;

      // Check if ledger already exists for this house
      const existingLedger = await db
        .select()
        .from(houseLedgers)
        .where(eq(houseLedgers.houseId, houseId))
        .limit(1);

      if (existingLedger.length > 0) {
        return { 
          success: false, 
          message: "LuvLedger already exists for this House",
          ledger: existingLedger[0]
        };
      }

      // Create the House LuvLedger
      const ledgerHash = generateLedgerHash(houseId, new Date());
      const ledgerName = `${houseName} LuvLedger`;

      const [newLedger] = await db.insert(houseLedgers).values({
        houseId,
        ledgerName,
        ledgerHash,
        ledgerStatus: "active",
        totalBalance: "0.00",
        reserveBalance: "0.00",
        circulationBalance: "0.00",
        treasuryContribution: "0.00",
        houseRetained: "0.00",
        transactionCount: 0,
      });

      // Update Main House Ledger count
      await db
        .update(mainHouseLedger)
        .set({
          totalHousesConnected: sql`${mainHouseLedger.totalHousesConnected} + 1`,
        })
        .where(eq(mainHouseLedger.id, 1));

      // Log the ledger creation
      await db.insert(ledgerAccessLogs).values({
        houseLedgerId: Number(newLedger.insertId),
        accessedByUserId: ctx.user.openId,
        accessType: "view",
        accessReason: "Initial ledger creation",
        accessGranted: true,
      });

      return {
        success: true,
        message: "House LuvLedger initialized successfully",
        ledgerId: Number(newLedger.insertId),
        ledgerHash,
      };
    }),

  // Activate House when Business Workshop is completed
  activateHouseOnBusinessCompletion: protectedProcedure
    .input(z.object({
      businessName: z.string(),
      businessType: z.string(),
      einNumber: z.string().optional(),
      stateOfFormation: z.string(),
      formationDate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      const userId = ctx.user.openId;

      // Check if user already has a House
      const existingHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, parseInt(userId) || 0))
        .limit(1);

      if (existingHouse.length > 0) {
        return {
          success: false,
          message: "User already has an activated House",
          house: existingHouse[0],
        };
      }

      // Create the House
      const houseHash = crypto
        .createHash("sha256")
        .update(`HOUSE-${userId}-${input.businessName}-${Date.now()}`)
        .digest("hex");

      const registryId = `RIN-${Date.now().toString(36).toUpperCase()}`;
      const [newHouse] = await db.insert(houses).values({
        name: `${input.businessName} House`,
        houseType: "adaptive",
        status: "active",
        ownerUserId: parseInt(userId) || 1,
      });

      const houseId = Number(newHouse.insertId);

      // Initialize the House LuvLedger
      const ledgerHash = generateLedgerHash(houseId, new Date());
      const ledgerName = `${input.businessName} LuvLedger`;

      const [newLedger] = await db.insert(houseLedgers).values({
        houseId,
        ledgerName,
        ledgerHash,
        ledgerStatus: "active",
        totalBalance: "0.00",
        reserveBalance: "0.00",
        circulationBalance: "0.00",
        treasuryContribution: "0.00",
        houseRetained: "0.00",
        transactionCount: 0,
      });

      const ledgerId = Number(newLedger.insertId);

      // Create genesis transaction
      const genesisHash = generateTransactionHash(ledgerId, "0.00", "inflow", null);
      await db.insert(houseLedgerTransactions).values({
        houseLedgerId: ledgerId,
        transactionType: "inflow",
        amount: "0.00",
        description: "Genesis - House LuvLedger initialized",
        transactionHash: genesisHash,
        previousHash: null,
        verified: true,
      });

      // Ensure Main House Ledger exists
      const mainLedger = await db.select().from(mainHouseLedger).limit(1);
      if (mainLedger.length === 0) {
        await db.insert(mainHouseLedger).values({
          ledgerName: "Root Authority Ledger",
          totalTreasuryBalance: "0.00",
          totalHousesConnected: 1,
          totalTransactionsProcessed: 0,
        });
      } else {
        await db
          .update(mainHouseLedger)
          .set({
            totalHousesConnected: sql`${mainHouseLedger.totalHousesConnected} + 1`,
          })
          .where(eq(mainHouseLedger.id, 1));
      }

      return {
        success: true,
        message: "House activated and LuvLedger initialized",
        houseId,
        houseName: `${input.businessName} House`,
        ledgerId,
        ledgerHash,
        registryIdNumber: registryId,
      };
    }),

  // Get House LuvLedger for current user
  getMyHouseLedger: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDb();
    const userId = ctx.user.openId;

    // Find user's house
    const userHouse = await db
      .select()
      .from(houses)
      .limit(1);

    if (userHouse.length === 0) {
      return { hasHouse: false, house: null, ledger: null, transactions: [] };
    }

    const house = userHouse[0];

    // Get the ledger
    const ledger = await db
      .select()
      .from(houseLedgers)
      .where(eq(houseLedgers.houseId, house.id))
      .limit(1);

    if (ledger.length === 0) {
      return { hasHouse: true, house, ledger: null, transactions: [] };
    }

    // Get recent transactions
    const transactions = await db
      .select()
      .from(houseLedgerTransactions)
      .where(eq(houseLedgerTransactions.houseLedgerId, ledger[0].id))
      .orderBy(desc(houseLedgerTransactions.createdAt))
      .limit(20);

    return {
      hasHouse: true,
      house,
      ledger: ledger[0],
      transactions,
    };
  }),

  // Record a transaction in House LuvLedger (with automatic 70/30 split)
  recordTransaction: protectedProcedure
    .input(z.object({
      houseLedgerId: z.number(),
      amount: z.string(),
      transactionType: z.enum([
        "inflow", "outflow", "transfer", "allocation", "distribution",
        "treasury_contribution", "reserve_deposit", "circulation_withdrawal"
      ]),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      const { houseLedgerId, amount, transactionType, description } = input;

      // Get the ledger
      const ledger = await db
        .select()
        .from(houseLedgers)
        .where(eq(houseLedgers.id, houseLedgerId))
        .limit(1);

      if (ledger.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "House LuvLedger not found",
        });
      }

      // Get the last transaction hash
      const lastTx = await db
        .select()
        .from(houseLedgerTransactions)
        .where(eq(houseLedgerTransactions.houseLedgerId, houseLedgerId))
        .orderBy(desc(houseLedgerTransactions.createdAt))
        .limit(1);

      const previousHash = lastTx.length > 0 ? lastTx[0].transactionHash : null;
      const transactionHash = generateTransactionHash(houseLedgerId, amount, transactionType, previousHash);

      // Record the transaction
      await db.insert(houseLedgerTransactions).values({
        houseLedgerId,
        transactionType,
        amount,
        description: description || `${transactionType} transaction`,
        transactionHash,
        previousHash,
        verified: true,
      });

      // Apply 70/30 split for inflows
      if (transactionType === "inflow") {
        const amountNum = parseFloat(amount);
        const treasuryAmount = amountNum * 0.30; // 30% to treasury
        const houseAmount = amountNum * 0.70; // 70% to house

        // Apply 60/40 split on house portion
        const reserveAmount = houseAmount * 0.60; // 60% to reserve
        const circulationAmount = houseAmount * 0.40; // 40% to circulation

        await db
          .update(houseLedgers)
          .set({
            totalBalance: sql`${houseLedgers.totalBalance} + ${amount}`,
            treasuryContribution: sql`${houseLedgers.treasuryContribution} + ${treasuryAmount.toFixed(2)}`,
            houseRetained: sql`${houseLedgers.houseRetained} + ${houseAmount.toFixed(2)}`,
            reserveBalance: sql`${houseLedgers.reserveBalance} + ${reserveAmount.toFixed(2)}`,
            circulationBalance: sql`${houseLedgers.circulationBalance} + ${circulationAmount.toFixed(2)}`,
            transactionCount: sql`${houseLedgers.transactionCount} + 1`,
            lastSyncAt: new Date(),
          })
          .where(eq(houseLedgers.id, houseLedgerId));

        // Update Main House Ledger treasury
        await db
          .update(mainHouseLedger)
          .set({
            totalTreasuryBalance: sql`${mainHouseLedger.totalTreasuryBalance} + ${treasuryAmount.toFixed(2)}`,
            totalTransactionsProcessed: sql`${mainHouseLedger.totalTransactionsProcessed} + 1`,
            lastAggregationAt: new Date(),
          })
          .where(eq(mainHouseLedger.id, 1));
      }

      return {
        success: true,
        transactionHash,
        message: "Transaction recorded successfully",
      };
    }),

  // Get Main House Ledger summary (audit-only view)
  getMainHouseLedgerSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDb();

    const mainLedger = await db.select().from(mainHouseLedger).limit(1);

    if (mainLedger.length === 0) {
      return {
        exists: false,
        summary: null,
      };
    }

    return {
      exists: true,
      summary: mainLedger[0],
    };
  }),

  // Get post-activation course progress
  getPostActivationProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDb();

    // Define post-activation courses
    const postActivationCourses = [
      { id: "trust", name: "Trust Workshop", description: "Structure trusts, define beneficiaries, configure inheritance splits", required: true },
      { id: "contracts", name: "Contracts Workshop", description: "Operating agreements, bylaws, partnership contracts", required: true },
      { id: "dba", name: "DBA & Trademark Workshop", description: "Business name registration and brand protection", required: false },
      { id: "grants", name: "Grant Writing Workshop", description: "Funding applications and proposal writing", required: false },
      { id: "blockchain", name: "Blockchain Courses", description: "Cryptocurrency, smart contracts, digital assets", required: false },
    ];

    // In a real implementation, this would check actual course completion status
    // For now, return the structure with placeholder completion status
    return {
      courses: postActivationCourses.map(course => ({
        ...course,
        completed: false,
        progress: 0,
        unlocksToken: course.id === "trust" ? "SPARK" : course.id === "contracts" ? "GIFT" : null,
      })),
      tokensUnlocked: {
        MIRROR: true, // Unlocked on registration
        GIFT: false,
        SPARK: false,
        HOUSE: true, // Unlocked on business completion
        CROWN: false,
      },
    };
  }),

  // Request audit access to another House's ledger (fraud investigation only)
  requestAuditAccess: protectedProcedure
    .input(z.object({
      targetHouseLedgerId: z.number(),
      reason: z.string(),
      fraudFlagId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();

      await db.insert(auditRequests).values({
        requestingUserId: ctx.user.openId,
        targetHouseLedgerId: input.targetHouseLedgerId,
        requestReason: input.reason,
        fraudFlagId: input.fraudFlagId,
        requestStatus: "pending",
      });

      return {
        success: true,
        message: "Audit access request submitted. Requires approval from Root Authority.",
      };
    }),

  // Flag suspicious activity
  flagSuspiciousActivity: protectedProcedure
    .input(z.object({
      houseLedgerId: z.number(),
      flagType: z.enum([
        "unusual_transaction_volume", "balance_discrepancy", "unauthorized_access_attempt",
        "hash_mismatch", "duplicate_transaction", "suspicious_pattern", "manual_report"
      ]),
      severity: z.enum(["low", "medium", "high", "critical"]),
      description: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await requireDb();

      await db.insert(fraudFlags).values({
        houseLedgerId: input.houseLedgerId,
        flagType: input.flagType,
        severity: input.severity,
        description: input.description,
        investigationStatus: "pending",
      });

      return {
        success: true,
        message: "Suspicious activity flagged for investigation.",
      };
    }),
});

export type HouseLedgerRouter = typeof houseLedgerRouter;
