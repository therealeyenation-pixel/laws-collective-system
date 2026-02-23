import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { tokenAccounts, tokenTransactions, gameSessions, achievements, activityAuditTrail } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const tokenEconomyRouter = router({
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
});
