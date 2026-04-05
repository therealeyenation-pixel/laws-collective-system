import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { blockchainRecords, luvLedgerTransactions } from "../../drizzle/schema";
import { getDb } from "../db";
import crypto from "crypto";

/**
 * Blockchain Integration Router
 * 
 * Provides immutable record-keeping for all LuvOnPurpose transactions
 * and trust hierarchy changes. Each record is cryptographically hashed
 * and linked to the previous record for complete audit trail.
 */

export const blockchainRouter = router({
  // Create a blockchain record for a transaction
  recordTransaction: protectedProcedure
    .input(
      z.object({
        transactionId: z.number(),
        recordType: z.enum(["transaction", "certificate", "entity_creation", "trust_update", "allocation_change"]),
        data: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get the transaction
      const transactions = await db
        .select()
        .from(luvLedgerTransactions)
        .where(eq(luvLedgerTransactions.id, input.transactionId));

      if (transactions.length === 0) {
        throw new Error("Transaction not found");
      }

      // Get the previous blockchain record to create chain
      const previousRecords = await db
        .select()
        .from(blockchainRecords);

      let previousHash = null;
      if (previousRecords.length > 0) {
        previousHash = previousRecords[previousRecords.length - 1].blockchainHash;
      }

      // Create hash for this record
      const recordData = {
        transactionId: input.transactionId,
        recordType: input.recordType,
        userId: ctx.user.id,
        timestamp: new Date().toISOString(),
        data: input.data,
        previousHash,
      };

      const blockchainHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(recordData))
        .digest("hex");

      // Store blockchain record
      await db.insert(blockchainRecords).values({
        recordType: input.recordType,
        referenceId: input.transactionId,
        blockchainHash,
        previousHash,
        data: recordData,
      });

      return {
        success: true,
        blockchainHash,
        recordData,
      };
    }),

  // Get blockchain record by hash
  getRecord: protectedProcedure
    .input(z.object({ blockchainHash: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const records = await db
        .select()
        .from(blockchainRecords)
        .where(eq(blockchainRecords.blockchainHash, input.blockchainHash));

      return records.length > 0 ? records[0] : null;
    }),

  // Verify blockchain integrity
  verifyIntegrity: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { valid: false, message: "Database unavailable" };

    const records = await db.select().from(blockchainRecords);

    if (records.length === 0) {
      return { valid: true, message: "No records to verify" };
    }

    // Verify chain integrity
    let previousHash = null;
    for (const record of records) {
      if (record.previousHash !== previousHash) {
        return {
          valid: false,
          message: `Chain broken at record ${record.id}`,
          brokenAt: record.id,
        };
      }
      previousHash = record.blockchainHash;
    }

    return {
      valid: true,
      message: "Blockchain integrity verified",
      totalRecords: records.length,
      chainHash: previousHash,
    };
  }),

  // Get blockchain audit trail
  getAuditTrail: protectedProcedure
    .input(z.object({ recordType: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let records = await db
        .select()
        .from(blockchainRecords);

      if (input.recordType) {
        records = records.filter((r) => r.recordType === input.recordType);
      }
      return records;
    }),

  // Create trust hierarchy record
  recordTrustUpdate: protectedProcedure
    .input(
      z.object({
        parentUserId: z.number(),
        childUserId: z.number(),
        trustLevel: z.number(),
        permissions: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get previous blockchain record
      const previousRecords = await db
        .select()
        .from(blockchainRecords);

      let previousHash = null;
      if (previousRecords.length > 0) {
        previousHash = previousRecords[previousRecords.length - 1].blockchainHash;
      }

      // Create hash for trust update
      const recordData = {
        parentUserId: input.parentUserId,
        childUserId: input.childUserId,
        trustLevel: input.trustLevel,
        permissions: input.permissions,
        updatedBy: ctx.user.id,
        timestamp: new Date().toISOString(),
        previousHash,
      };

      const blockchainHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(recordData))
        .digest("hex");

      // Store blockchain record
      await db.insert(blockchainRecords).values({
        recordType: "trust_update",
        referenceId: input.parentUserId,
        blockchainHash,
        previousHash,
        data: recordData,
      });

      return {
        success: true,
        blockchainHash,
        message: "Trust relationship recorded on blockchain",
      };
    }),

  // Get blockchain statistics
  getStatistics: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;

    const records = await db.select().from(blockchainRecords);

    const recordsByType: Record<string, number> = {};
    records.forEach((r) => {
      recordsByType[r.recordType] = (recordsByType[r.recordType] || 0) + 1;
    });

    return {
      totalRecords: records.length,
      recordsByType,
      oldestRecord: records.length > 0 ? records[0].timestamp : null,
      latestRecord: records.length > 0 ? records[records.length - 1].timestamp : null,
    };
  }),
});
