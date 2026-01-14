import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  cryptoWallets,
  tokenAccounts,
  tokenTransactions,
  blockchainRecords,
  activityAuditTrail,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const cryptoWalletRouter = router({
  // Create a new crypto wallet for user
  createWallet: protectedProcedure
    .input(
      z.object({
        walletType: z.enum(["bitcoin", "ethereum", "solana", "other"]),
        walletAddress: z.string(),
        publicKey: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if wallet already exists
      const existing = await db
        .select()
        .from(cryptoWallets)
        .where(eq(cryptoWallets.walletAddress, input.walletAddress));

      if (existing.length > 0) {
        throw new Error("Wallet address already registered");
      }

      // Create wallet
      const wallet = await db.insert(cryptoWallets).values({
        userId: ctx.user.id,
        walletAddress: input.walletAddress,
        walletType: input.walletType,
        publicKey: input.publicKey,
        balance: "0",
        status: "active",
      });

      const walletId = wallet[0].insertId;

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "crypto_wallet_created",
        action: "create",
        details: {
          walletId: walletId,
          walletType: input.walletType,
          walletAddress: input.walletAddress,
        } as any,
      });

      return {
        walletId: walletId,
        walletAddress: input.walletAddress,
        walletType: input.walletType,
        status: "created",
      };
    }),

  // Get user's wallets
  getUserWallets: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const wallets = await db
      .select()
      .from(cryptoWallets)
      .where(eq(cryptoWallets.userId, ctx.user.id));

    return wallets;
  }),

  // Convert tokens to cryptocurrency
  convertTokensToCrypto: protectedProcedure
    .input(
      z.object({
        walletId: z.number(),
        tokenAmount: z.number().positive(),
        conversionRate: z.number().positive(), // tokens to crypto ratio
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get wallet
      const wallets = await db
        .select()
        .from(cryptoWallets)
        .where(eq(cryptoWallets.id, input.walletId));

      if (wallets.length === 0) throw new Error("Wallet not found");
      const wallet = wallets[0];

      // Get token account
      const tokenAccts = await db
        .select()
        .from(tokenAccounts)
        .where(eq(tokenAccounts.userId, ctx.user.id));

      if (tokenAccts.length === 0) throw new Error("Token account not found");
      const tokenAcct = tokenAccts[0];

      // Check sufficient balance
      const tokenBalance = Number(tokenAcct.tokenBalance);
      if (tokenBalance < input.tokenAmount) {
        throw new Error("Insufficient token balance");
      }

      // Calculate crypto amount
      const cryptoAmount = input.tokenAmount / input.conversionRate;

      // Update wallet balance
      const newWalletBalance = Number(wallet.balance) + cryptoAmount;
      await db
        .update(cryptoWallets)
        .set({
          balance: newWalletBalance.toString(),
        })
        .where(eq(cryptoWallets.id, input.walletId));

      // Update token account
      const newTokenBalance = tokenBalance - input.tokenAmount;
      await db
        .update(tokenAccounts)
        .set({
          tokenBalance: newTokenBalance.toString(),
          totalSpent: (Number(tokenAcct.totalSpent) + input.tokenAmount).toString(),
        })
        .where(eq(tokenAccounts.userId, ctx.user.id));

      // Log token transaction
      const txHash = generateTransactionHash();
      await db.insert(tokenTransactions).values({
        userId: ctx.user.id,
        amount: input.tokenAmount.toString(),
        transactionType: "converted",
        source: `wallet_${input.walletId}`,
        description: `Converted ${input.tokenAmount} tokens to ${cryptoAmount} ${wallet.walletType}`,
        blockchainHash: txHash,
      });

      // Log blockchain record
      await db.insert(blockchainRecords).values({
        recordType: "transaction",
        referenceId: input.walletId,
        blockchainHash: txHash,
        data: {
          tokenAmount: input.tokenAmount,
          conversionRate: input.conversionRate,
          walletType: wallet.walletType,
          fromAddress: "system",
          toAddress: wallet.walletAddress,
          amount: cryptoAmount,
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "token_conversion",
        action: "update",
        details: {
          walletId: input.walletId,
          tokenAmount: input.tokenAmount,
          cryptoAmount: cryptoAmount,
          transactionHash: txHash,
        } as any,
      });

      return {
        walletId: input.walletId,
        tokenAmount: input.tokenAmount,
        cryptoAmount: cryptoAmount,
        newWalletBalance: newWalletBalance,
        transactionHash: txHash,
        status: "converted",
      };
    }),

  // Transfer crypto between wallets
  transferCrypto: protectedProcedure
    .input(
      z.object({
        fromWalletId: z.number(),
        toAddress: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get from wallet
      const fromWallets = await db
        .select()
        .from(cryptoWallets)
        .where(eq(cryptoWallets.id, input.fromWalletId));

      if (fromWallets.length === 0) throw new Error("Source wallet not found");
      const fromWallet = fromWallets[0];

      // Check balance
      const walletBalance = Number(fromWallet.balance);
      if (walletBalance < input.amount) {
        throw new Error("Insufficient wallet balance");
      }

      // Update from wallet
      const newFromBalance = walletBalance - input.amount;
      await db
        .update(cryptoWallets)
        .set({
          balance: newFromBalance.toString(),
        })
        .where(eq(cryptoWallets.id, input.fromWalletId));

      // Log blockchain record
      const txHash = generateTransactionHash();
      await db.insert(blockchainRecords).values({
        recordType: "transaction",
        referenceId: input.fromWalletId,
        blockchainHash: txHash,
        data: {
          walletType: fromWallet.walletType,
          fromAddress: fromWallet.walletAddress,
          toAddress: input.toAddress,
          amount: input.amount,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "crypto_transfer",
        action: "update",
        details: {
          fromWalletId: input.fromWalletId,
          toAddress: input.toAddress,
          amount: input.amount,
          transactionHash: txHash,
        } as any,
      });

      return {
        fromWalletId: input.fromWalletId,
        toAddress: input.toAddress,
        amount: input.amount,
        newBalance: newFromBalance,
        transactionHash: txHash,
        status: "transferred",
      };
    }),

  // Get wallet balance
  getWalletBalance: protectedProcedure
    .input(z.object({ walletId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const wallets = await db
        .select()
        .from(cryptoWallets)
        .where(eq(cryptoWallets.id, input.walletId));

      if (wallets.length === 0) return null;
      const wallet = wallets[0];

      return {
        walletId: wallet.id,
        walletAddress: wallet.walletAddress,
        walletType: wallet.walletType,
        balance: Number(wallet.balance),
        status: wallet.status,
      };
    }),

  // Get total crypto holdings
  getTotalHoldings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return {};

    const wallets = await db
      .select()
      .from(cryptoWallets)
      .where(eq(cryptoWallets.userId, ctx.user.id));

    const holdings: Record<string, number> = {};
    wallets.forEach((wallet) => {
      if (!holdings[wallet.walletType]) {
        holdings[wallet.walletType] = 0;
      }
      holdings[wallet.walletType] += Number(wallet.balance);
    });

    return holdings;
  }),

  // Get transaction history
  getTransactionHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const transactions = await db
        .select()
        .from(blockchainRecords)
        .limit(input.limit || 50);

      return transactions;
    }),

  // Update wallet status
  updateWalletStatus: protectedProcedure
    .input(
      z.object({
        walletId: z.number(),
        status: z.enum(["active", "inactive", "suspended"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get wallet
      const wallets = await db
        .select()
        .from(cryptoWallets)
        .where(eq(cryptoWallets.id, input.walletId));

      if (wallets.length === 0) throw new Error("Wallet not found");

      // Update status
      await db
        .update(cryptoWallets)
        .set({
          status: input.status,
        })
        .where(eq(cryptoWallets.id, input.walletId));

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "wallet_status_updated",
        action: "update",
        details: {
          walletId: input.walletId,
          newStatus: input.status,
        } as any,
      });

      return {
        walletId: input.walletId,
        status: input.status,
        updated: true,
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
