import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { luvLedgerAccounts, luvLedgerTransactions } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * LuvLedger Allocation System
 * 
 * External Split (60/40):
 * - 60% to House (protected majority)
 * - 40% to External stakeholders/investors
 * 
 * Internal Split (70/30):
 * - 70% to Inheritance (generational wealth)
 * - 30% to Operations (current operations)
 */

export const luvledgerRouter = router({
  // Create a new LuvLedger account
  createAccount: protectedProcedure
    .input(
      z.object({
        accountName: z.string().min(1).max(100),
        accountType: z.enum(["personal", "entity", "collective", "trust"]),
        businessEntityId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(luvLedgerAccounts).values({
        userId: ctx.user.id,
        accountName: input.accountName,
        accountType: input.accountType,
        balance: "0",
        allocationPercentage: "0",
        businessEntityId: input.businessEntityId,
      });

      return { success: true };
    }),

  // Get user's LuvLedger accounts
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const accounts = await db
      .select()
      .from(luvLedgerAccounts)
      .where(eq(luvLedgerAccounts.userId, ctx.user.id));

    return accounts;
  }),

  // Record a transaction with automatic allocation
  recordTransaction: protectedProcedure
    .input(
      z.object({
        fromAccountId: z.number(),
        toAccountId: z.number(),
        amount: z.string(),
        description: z.string(),
        transactionType: z.enum(["income", "allocation", "distribution", "fee", "adjustment"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get source account
      const fromAccounts = await db
        .select()
        .from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.id, input.fromAccountId));

      if (fromAccounts.length === 0 || fromAccounts[0].userId !== ctx.user.id) {
        throw new Error("Account not found");
      }

      // Record transaction
      await db.insert(luvLedgerTransactions).values({
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount: input.amount,
        transactionType: input.transactionType,
        description: input.description,
        status: "confirmed",
      });

      return {
        success: true,
        message: "Transaction recorded successfully",
      };
    }),

  // Get transaction history
  getTransactionHistory: protectedProcedure
    .input(z.object({ fromAccountId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const transactions = await db
        .select()
        .from(luvLedgerTransactions)
        .where(eq(luvLedgerTransactions.fromAccountId, input.fromAccountId));

      return transactions;
    }),

  // Get allocation summary
  // Inter-house: 60/40 (60% house, 40% collective)
  // Intra-house: 70/30 (70% house, 30% inheritance)
  getAllocationSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const accounts = await db
      .select()
      .from(luvLedgerAccounts)
      .where(eq(luvLedgerAccounts.userId, ctx.user.id));

    const transactions = await db
      .select()
      .from(luvLedgerTransactions);

    // Calculate totals
    let totalIncome = 0;
    let inheritanceTotal = 0;
    let operationsTotal = 0;
    let externalTotal = 0;

    transactions.forEach((tx) => {
      if (tx.transactionType === "income" || tx.transactionType === "allocation") {
        const amount = parseFloat(tx.amount);
        totalIncome += amount;

        // Inter-house split: 60% House / 40% Collective
        const houseAmount = amount * 0.6; // 60% to house
        const collectiveAmount = amount * 0.4; // 40% to collective

        // Intra-house split: 70% House operations / 30% Inheritance pool
        operationsTotal += houseAmount * 0.7; // 70% for house operations
        inheritanceTotal += houseAmount * 0.3; // 30% to inheritance pool
        externalTotal += collectiveAmount;
      }
    });

    return {
      totalIncome,
      allocations: {
        inheritance: {
          amount: inheritanceTotal.toFixed(2),
          percentage: 30,
          description: "Inheritance pool for generational wealth (30% of house's 60%)",
        },
        operations: {
          amount: operationsTotal.toFixed(2),
          percentage: 70,
          description: "House operations and reinvestment (70% of house's 60%)",
        },
        external: {
          amount: externalTotal.toFixed(2),
          percentage: 40,
          description: "Collective/community share (40% of total)",
        },
        houseMajority: {
          amount: (inheritanceTotal + operationsTotal).toFixed(2),
          percentage: 60,
          description: "House majority allocation (protected, cannot be overridden)",
        },
      },
      accounts,
    };
  }),

  // Transfer between accounts
  transfer: protectedProcedure
    .input(
      z.object({
        fromAccountId: z.number(),
        toAccountId: z.number(),
        amount: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify both accounts belong to user
      const fromAccounts = await db
        .select()
        .from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.id, input.fromAccountId));

      const toAccounts = await db
        .select()
        .from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.id, input.toAccountId));

      if (
        fromAccounts.length === 0 ||
        fromAccounts[0].userId !== ctx.user.id ||
        toAccounts.length === 0 ||
        toAccounts[0].userId !== ctx.user.id
      ) {
        throw new Error("Account not found");
      }

      // Record transaction
      await db.insert(luvLedgerTransactions).values({
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount: input.amount,
        transactionType: "distribution",
        description: input.description || "Transfer between accounts",
        status: "confirmed",
      });

      return { success: true };
    }),
});
