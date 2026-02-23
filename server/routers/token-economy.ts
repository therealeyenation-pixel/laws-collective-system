import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { tokenAccounts, tokenTransactions, gameSessions, achievements, activityAuditTrail, businessEntities, blockchainRecords, luvLedgerAccounts } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

export const tokenEconomyRouter = router({
  // Get system-wide token totals (public for dashboard viewing)
  getSystemTokens: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalTokens: 0 };

    // Sum all token balances from LuvLedger accounts
    const accounts = await db
      .select()
      .from(luvLedgerAccounts);

    const totalTokens = accounts.reduce((sum, acc) => {
      return sum + parseFloat(acc.balance || "0");
    }, 0);

    return { totalTokens };
  }),

  // Get user token balance
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const account = await db
      .select()
      .from(tokenAccounts)
      .where(eq(tokenAccounts.userId, ctx.user.id))
      .limit(1);

    if (account.length === 0) {
      // Create new token account
      await db.insert(tokenAccounts).values({
        userId: ctx.user.id,
        tokenBalance: "0",
        totalEarned: "0",
        totalSpent: "0",
      });
      return {
        userId: ctx.user.id,
        tokenBalance: "0",
        totalEarned: "0",
        totalSpent: "0",
      };
    }

    return account[0];
  }),

  // Award tokens for game completion
  awardTokens: protectedProcedure
    .input(
      z.object({
        amount: z.string(),
        reason: z.enum(["game_completion", "achievement", "simulator_completion", "challenge_reward"]),
        sourceId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get or create token account
      let account = await db
        .select()
        .from(tokenAccounts)
        .where(eq(tokenAccounts.userId, ctx.user.id))
        .limit(1);

      if (account.length === 0) {
        await db.insert(tokenAccounts).values({
          userId: ctx.user.id,
          tokenBalance: input.amount,
          totalEarned: input.amount,
          totalSpent: "0",
        });
      } else {
        // Update account with new tokens
        const newBalance = (BigInt(account[0].tokenBalance || 0) + BigInt(input.amount)).toString();
        const newEarned = (BigInt(account[0].totalEarned || 0) + BigInt(input.amount)).toString();

        await db
          .update(tokenAccounts)
          .set({
            tokenBalance: newBalance,
            totalEarned: newEarned,
          })
          .where(eq(tokenAccounts.userId, ctx.user.id));
      }

      // Record transaction
      await db.insert(tokenTransactions).values({
        userId: ctx.user.id,
        amount: input.amount,
        transactionType: "earned",
        source: input.reason,
        description: `Tokens earned for ${input.reason}`,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "token_earned",
        action: "earn",
        details: {
          amount: input.amount,
          reason: input.reason,
          sourceId: input.sourceId,
        } as any,
      });

      return { success: true, tokensAwarded: input.amount };
    }),

  // Spend tokens
  spendTokens: protectedProcedure
    .input(
      z.object({
        amount: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get token account
      const account = await db
        .select()
        .from(tokenAccounts)
        .where(eq(tokenAccounts.userId, ctx.user.id))
        .limit(1);

      if (account.length === 0 || !account[0].tokenBalance) {
        throw new Error("Insufficient tokens");
      }

      const currentBalance = BigInt(account[0].tokenBalance);
      const spendAmount = BigInt(input.amount);

      if (currentBalance < spendAmount) {
        throw new Error("Insufficient tokens");
      }

      const newBalance = (currentBalance - spendAmount).toString();
      const newSpent = (BigInt(account[0].totalSpent || 0) + spendAmount).toString();

      // Update account
      await db
        .update(tokenAccounts)
        .set({
          tokenBalance: newBalance,
          totalSpent: newSpent,
        })
        .where(eq(tokenAccounts.userId, ctx.user.id));

      // Record transaction
      await db.insert(tokenTransactions).values({
        userId: ctx.user.id,
        amount: input.amount,
        transactionType: "spent",
        source: input.reason,
        description: `Tokens spent on ${input.reason}`,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "token_spent",
        action: "spend",
        details: {
          amount: input.amount,
          reason: input.reason,
        } as any,
      });

      return { success: true, newBalance, tokensSpent: input.amount };
    }),

  // Get transaction history
  getTransactionHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        transactionType: z.enum(["earned", "spent", "transferred", "converted", "reward"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      let conditions = [eq(tokenTransactions.userId, ctx.user.id)];
      if (input.transactionType) {
        conditions.push(eq(tokenTransactions.transactionType, input.transactionType));
      }

      const transactions = await db
        .select()
        .from(tokenTransactions)
        .where(and(...conditions))
        .limit(input.limit);
      return transactions;
    }),

  // Get achievements
  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const userAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, ctx.user.id));

    return userAchievements;
  }),

  // Award achievement
  awardAchievement: protectedProcedure
    .input(
      z.object({
        achievementType: z.string(),
        title: z.string(),
        description: z.string().optional(),
        tokensReward: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if achievement already exists
      const existing = await db
        .select()
        .from(achievements)
        .where(eq(achievements.userId, ctx.user.id));

      const alreadyHas = existing.some((a) => a.achievementType === input.achievementType);
      if (alreadyHas) {
        return { success: false, message: "Achievement already unlocked" };
      }

      // Award achievement
      await db.insert(achievements).values({
        userId: ctx.user.id,
        achievementType: input.achievementType,
        title: input.title,
        description: input.description,
        tokensReward: input.tokensReward,
      });

      // Award tokens
      await db.insert(tokenTransactions).values({
        userId: ctx.user.id,
        amount: input.tokensReward,
        transactionType: "reward",
        source: "achievement",
        description: `Achievement unlocked: ${input.title}`,
      });

      // Update token balance
      const account = await db
        .select()
        .from(tokenAccounts)
        .where(eq(tokenAccounts.userId, ctx.user.id))
        .limit(1);

      if (account.length > 0) {
        const newBalance = (BigInt(account[0].tokenBalance || 0) + BigInt(input.tokensReward)).toString();
        const newEarned = (BigInt(account[0].totalEarned || 0) + BigInt(input.tokensReward)).toString();

        await db
          .update(tokenAccounts)
          .set({
            tokenBalance: newBalance,
            totalEarned: newEarned,
          })
          .where(eq(tokenAccounts.userId, ctx.user.id));
      }

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "achievement_unlocked",
        action: "unlock",
        details: {
          achievementType: input.achievementType,
          title: input.title,
          tokensReward: input.tokensReward,
        } as any,
      });

      return { success: true, tokensAwarded: input.tokensReward };
    }),

  // Get token statistics
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const account = await db
      .select()
      .from(tokenAccounts)
      .where(eq(tokenAccounts.userId, ctx.user.id))
      .limit(1);

    if (account.length === 0) return null;

    const transactions = await db
      .select()
      .from(tokenTransactions)
      .where(eq(tokenTransactions.userId, ctx.user.id));

    const userGameSessions = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.userId, ctx.user.id));

    return {
      account: account[0],
      transactionCount: transactions.length,
      earnedTransactions: transactions.filter((t) => t.transactionType === "earned").length,
      spentTransactions: transactions.filter((t) => t.transactionType === "spent").length,
      gameSessionsCount: userGameSessions.length,
      completedGames: userGameSessions.filter((g: any) => g.status === "completed").length,
    };
  }),

  // Entity-level token economy: Distribute tokens from Trust to entities
  distributeTokensFromTrust: protectedProcedure
    .input(
      z.object({
        trustEntityId: z.number(),
        distributions: z.array(
          z.object({
            recipientEntityId: z.number(),
            tokenAmount: z.number(),
            reason: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const results = [];
      const txHash = generateTransactionHash();

      for (const distribution of input.distributions) {
        // Get recipient entity
        const entities = await db
          .select()
          .from(businessEntities)
          .where(eq(businessEntities.id, distribution.recipientEntityId));

        if (entities.length === 0) continue;
        const entity = entities[0];

        // Get or create token account for recipient
        const accounts = await db
          .select()
          .from(tokenAccounts)
          .where(eq(tokenAccounts.userId, ctx.user.id));

        let accountId = accounts.length > 0 ? accounts[0].id : null;

        if (!accountId) {
          const newAccount = await db.insert(tokenAccounts).values({
            userId: ctx.user.id,
            tokenBalance: distribution.tokenAmount.toString(),
            totalEarned: distribution.tokenAmount.toString(),
            totalSpent: "0",
          });
          accountId = newAccount[0].insertId;
        } else {
          // Update balance
          const currentBalance = Number(accounts[0].tokenBalance);
          const newBalance = currentBalance + distribution.tokenAmount;
          await db
            .update(tokenAccounts)
            .set({
              tokenBalance: newBalance.toString(),
              totalEarned: (Number(accounts[0].totalEarned) + distribution.tokenAmount).toString(),
            })
            .where(eq(tokenAccounts.id, accountId));
        }

        // Create transaction record
        const txResult = await db.insert(tokenTransactions).values({
          userId: ctx.user.id,
          amount: distribution.tokenAmount.toString(),
          transactionType: "earned",
          source: "trust_distribution",
          description: distribution.reason,
        });

        // Create blockchain record
        await db.insert(blockchainRecords).values({
          recordType: "transaction",
          referenceId: txResult[0].insertId,
          blockchainHash: txHash,
          data: {
            transactionType: "token_distribution",
            fromEntity: input.trustEntityId,
            toEntity: distribution.recipientEntityId,
            toEntityName: entity.name,
            amount: distribution.tokenAmount,
            reason: distribution.reason,
            timestamp: new Date().toISOString(),
          } as any,
        });

        results.push({
          recipientEntityId: distribution.recipientEntityId,
          recipientName: entity.name,
          tokenAmount: distribution.tokenAmount,
          status: "distributed",
        });
      }

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "tokens_distributed",
        action: "create",
        details: {
          fromEntityId: input.trustEntityId,
          distributions: results,
          blockchainHash: txHash,
        } as any,
      });

      return {
        status: "completed",
        distributionsCount: results.length,
        distributions: results,
        blockchainHash: txHash,
      };
    }),

  // Get entity token balance
  getEntityTokenBalance: protectedProcedure
    .input(z.object({ entityId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const accounts = await db
        .select()
        .from(tokenAccounts)
        .where(eq(tokenAccounts.userId, ctx.user.id));

      if (accounts.length === 0) {
        return {
          entityId: input.entityId,
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          status: "no_account",
        };
      }

      const account = accounts[0];
      return {
        entityId: input.entityId,
        balance: Number(account.tokenBalance),
        totalEarned: Number(account.totalEarned),
        totalSpent: Number(account.totalSpent),
        status: "active",
      };
    }),

  // Get token economy summary for all entities
  getTokenEconomySummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const accounts = await db.select().from(tokenAccounts);
    const transactions = await db.select().from(tokenTransactions);

    const summary = {
      totalTokensInCirculation: accounts.reduce((sum, a) => sum + Number(a.tokenBalance || 0), 0),
      totalTokensEarned: accounts.reduce((sum, a) => sum + Number(a.totalEarned || 0), 0),
      totalTokensSpent: accounts.reduce((sum, a) => sum + Number(a.totalSpent || 0), 0),
      totalTransactions: transactions.length,
      transactionsByType: {
        reward: transactions.filter((t) => t.transactionType === "reward").length,
        earned: transactions.filter((t) => t.transactionType === "earned").length,
        spent: transactions.filter((t) => t.transactionType === "spent").length,
        transferred: transactions.filter((t) => t.transactionType === "transferred").length,
        converted: transactions.filter((t) => t.transactionType === "converted").length,
      },
    };

    return summary;
  }),
});

// Helper function to generate transaction hash
function generateTransactionHash(): string {
  return crypto
    .createHash("sha256")
    .update(Date.now().toString() + Math.random().toString())
    .digest("hex");
}
