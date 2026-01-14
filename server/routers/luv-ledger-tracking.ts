import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  luvLedgerAccounts,
  luvLedgerTransactions,
  blockchainRecords,
  activityAuditTrail,
  certificates,
  businessEntities,
  tokenTransactions,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export const luvLedgerTrackingRouter = router({
  // Get complete activity history for LuvLedger account
  getAccountActivityHistory: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        limit: z.number().default(100).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      // Get all transactions for account
      const transactions = await db
        .select()
        .from(luvLedgerTransactions)
        .where(
          eq(luvLedgerTransactions.fromAccountId, input.accountId)
        );

      // Get blockchain records for these transactions
      const blockchainHashes = transactions
        .map((t) => t.blockchainHash)
        .filter(Boolean);

      const blockchainData = blockchainHashes.length > 0
        ? await db.select().from(blockchainRecords)
        : [];

      // Combine transaction and blockchain data
      const activityHistory = transactions
        .map((tx) => ({
          transaction: tx,
          blockchain: blockchainData.find(
            (b) => b.blockchainHash === tx.blockchainHash
          ),
        }))
        .slice(0, input.limit || 100);

      return activityHistory;
    }),

  // Log certificate issuance to LuvLedger
  logCertificateIssuance: protectedProcedure
    .input(
      z.object({
        certificateId: z.number(),
        accountId: z.number(),
        amount: z.number(),
        description: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Create blockchain hash
      const txHash = generateTransactionHash();

      // Create LuvLedger transaction
      const transaction = await db.insert(luvLedgerTransactions).values({
        fromAccountId: 1, // System account
        toAccountId: input.accountId,
        amount: input.amount.toString(),
        transactionType: "income",
        description: `Certificate issuance: ${input.description}`,
        blockchainHash: txHash,
        status: "confirmed",
      });

      // Log to blockchain
      await db.insert(blockchainRecords).values({
        recordType: "certificate",
        referenceId: input.certificateId,
        blockchainHash: txHash,
        data: {
          certificateId: input.certificateId,
          accountId: input.accountId,
          amount: input.amount,
          description: input.description,
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "certificate_logged",
        action: "create",
        details: {
          certificateId: input.certificateId,
          transactionHash: txHash,
          amount: input.amount,
        } as any,
      });

      return {
        transactionId: transaction[0].insertId,
        blockchainHash: txHash,
        status: "logged",
      };
    }),

  // Log business entity creation to LuvLedger
  logBusinessCreation: protectedProcedure
    .input(
      z.object({
        businessEntityId: z.number(),
        accountId: z.number(),
        initialAllocation: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Create blockchain hash
      const txHash = generateTransactionHash();

      // Create LuvLedger transaction
      const transaction = await db.insert(luvLedgerTransactions).values({
        fromAccountId: 1, // System account
        toAccountId: input.accountId,
        amount: input.initialAllocation.toString(),
        transactionType: "allocation",
        description: `Business entity creation allocation`,
        blockchainHash: txHash,
        status: "confirmed",
      });

      // Log to blockchain
      await db.insert(blockchainRecords).values({
        recordType: "entity_creation",
        referenceId: input.businessEntityId,
        blockchainHash: txHash,
        data: {
          businessEntityId: input.businessEntityId,
          accountId: input.accountId,
          initialAllocation: input.initialAllocation,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "business_creation_logged",
        action: "create",
        details: {
          businessEntityId: input.businessEntityId,
          transactionHash: txHash,
          allocation: input.initialAllocation,
        } as any,
      });

      return {
        transactionId: transaction[0].insertId,
        blockchainHash: txHash,
        status: "logged",
      };
    }),

  // Log allocation changes to LuvLedger
  logAllocationChange: protectedProcedure
    .input(
      z.object({
        fromAccountId: z.number(),
        toAccountId: z.number(),
        amount: z.number(),
        reason: z.string(),
        allocationPercentage: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Create blockchain hash
      const txHash = generateTransactionHash();

      // Create LuvLedger transaction
      const transaction = await db.insert(luvLedgerTransactions).values({
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount: input.amount.toString(),
        transactionType: "allocation",
        description: `Allocation change: ${input.reason} (${input.allocationPercentage}%)`,
        blockchainHash: txHash,
        status: "confirmed",
      });

      // Log to blockchain
      await db.insert(blockchainRecords).values({
        recordType: "allocation_change",
        referenceId: input.fromAccountId,
        blockchainHash: txHash,
        data: {
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
          amount: input.amount,
          reason: input.reason,
          allocationPercentage: input.allocationPercentage,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "allocation_changed",
        action: "update",
        details: {
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
          amount: input.amount,
          transactionHash: txHash,
        } as any,
      });

      return {
        transactionId: transaction[0].insertId,
        blockchainHash: txHash,
        status: "logged",
      };
    }),

  // Get account balance with blockchain verification
  getAccountBalance: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      // Get account
      const accounts = await db
        .select()
        .from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.id, input.accountId));

      if (accounts.length === 0) return null;
      const account = accounts[0];

      // Get all transactions for this account
      const transactions = await db
        .select()
        .from(luvLedgerTransactions)
        .where(eq(luvLedgerTransactions.toAccountId, input.accountId));

      // Calculate total
      let balance = 0;
      transactions.forEach((tx) => {
        balance += Number(tx.amount);
      });

      // Get blockchain records for verification
      const blockchainRecords_data = await db
        .select()
        .from(blockchainRecords);

      const verifiedTransactions = transactions.filter((tx) =>
        blockchainRecords_data.some((b) => b.blockchainHash === tx.blockchainHash)
      );

      return {
        accountId: account.id,
        accountName: account.accountName,
        balance: balance,
        verifiedBalance: verifiedTransactions.reduce(
          (sum, tx) => sum + Number(tx.amount),
          0
        ),
        transactionCount: transactions.length,
        verifiedTransactionCount: verifiedTransactions.length,
        allocationPercentage: account.allocationPercentage,
      };
    }),

  // Get all account balances for user
  getAllAccountBalances: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    // Get all accounts
    const accounts = await db.select().from(luvLedgerAccounts);

    // For each account, calculate balance
    const balances = await Promise.all(
      accounts.map(async (account) => {
        const transactions = await db
          .select()
          .from(luvLedgerTransactions)
          .where(eq(luvLedgerTransactions.toAccountId, account.id));

        const balance = transactions.reduce(
          (sum, tx) => sum + Number(tx.amount),
          0
        );

        return {
          accountId: account.id,
          accountName: account.accountName,
          balance: balance,
          allocationPercentage: account.allocationPercentage,
        };
      })
    );

    return balances;
  }),

  // Generate comprehensive activity report
  generateActivityReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        accountId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      // Get transactions
      let transactions = await db.select().from(luvLedgerTransactions);

      // Filter by date if provided
      if (input.startDate || input.endDate) {
        transactions = transactions.filter((tx) => {
          const txDate = new Date(tx.createdAt);
          if (input.startDate && txDate < input.startDate) return false;
          if (input.endDate && txDate > input.endDate) return false;
          return true;
        });
      }

      // Filter by account if provided
      if (input.accountId) {
        transactions = transactions.filter(
          (tx) => tx.toAccountId === input.accountId
        );
      }

      // Get blockchain records
      const blockchainData = await db.select().from(blockchainRecords);

      // Calculate statistics
      const stats = {
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce(
          (sum, tx) => sum + Number(tx.amount),
          0
        ),
        byType: {} as Record<string, { count: number; amount: number }>,
        byStatus: {} as Record<string, number>,
        verifiedTransactions: 0,
        unverifiedTransactions: 0,
      };

      transactions.forEach((tx) => {
        // Count by type
        if (!stats.byType[tx.transactionType]) {
          stats.byType[tx.transactionType] = { count: 0, amount: 0 };
        }
        stats.byType[tx.transactionType].count++;
        stats.byType[tx.transactionType].amount += Number(tx.amount);

        // Count by status
        if (!stats.byStatus[tx.status]) {
          stats.byStatus[tx.status] = 0;
        }
        stats.byStatus[tx.status]++;

        // Verify blockchain
        if (
          blockchainData.some((b) => b.blockchainHash === tx.blockchainHash)
        ) {
          stats.verifiedTransactions++;
        } else {
          stats.unverifiedTransactions++;
        }
      });

      return {
        period: {
          startDate: input.startDate,
          endDate: input.endDate,
        },
        statistics: stats,
        transactions: transactions.slice(0, 50), // Return first 50 for report
      };
    }),

  // Verify blockchain integrity
  verifyBlockchainIntegrity: protectedProcedure
    .input(z.object({ transactionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      // Get transaction
      const transactions = await db
        .select()
        .from(luvLedgerTransactions)
        .where(eq(luvLedgerTransactions.id, input.transactionId));

      if (transactions.length === 0) return null;
      const transaction = transactions[0];

      // Get blockchain record
      const blockchainData = await db
        .select()
        .from(blockchainRecords)
        .where(eq(blockchainRecords.blockchainHash, transaction.blockchainHash || ""));

      const isVerified = blockchainData.length > 0;
      const blockchainRecord = blockchainData.length > 0 ? blockchainData[0] : null;

      // Verify hash integrity
      let hashValid = false;
      if (blockchainRecord) {
        const expectedHash = crypto
          .createHash("sha256")
          .update(JSON.stringify(blockchainRecord.data))
          .digest("hex");
        hashValid = expectedHash === blockchainRecord.blockchainHash;
      }

      return {
        transactionId: input.transactionId,
        isVerified: isVerified,
        hashValid: hashValid,
        blockchainRecord: blockchainRecord,
        verificationStatus: isVerified && hashValid ? "valid" : "invalid",
      };
    }),
});

// Helper function to generate transaction hash
function generateTransactionHash(): string {
  return crypto
    .createHash("sha256")
    .update(Date.now().toString() + Math.random().toString())
    .digest("hex");
}
