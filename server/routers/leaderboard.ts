import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { gameScores, users } from "../../drizzle/schema";
import { desc, eq, and, sql } from "drizzle-orm";

export const leaderboardRouter = router({
  // Submit a game score
  submitScore: protectedProcedure
    .input(z.object({
      gameType: z.string(),
      score: z.number(),
      difficulty: z.string(),
      correctAnswers: z.number(),
      totalQuestions: z.number(),
      maxStreak: z.number(),
      tokensEarned: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(gameScores).values({
        userId: ctx.user.id,
        gameType: input.gameType,
        score: input.score,
        difficulty: input.difficulty,
        correctAnswers: input.correctAnswers,
        totalQuestions: input.totalQuestions,
        maxStreak: input.maxStreak,
        tokensEarned: input.tokensEarned,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  // Get top scores for a game type
  getTopScores: publicProcedure
    .input(z.object({
      gameType: z.string(),
      limit: z.number().min(1).max(100).default(10),
      difficulty: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      
      let query = db
        .select({
          id: gameScores.id,
          score: gameScores.score,
          difficulty: gameScores.difficulty,
          correctAnswers: gameScores.correctAnswers,
          totalQuestions: gameScores.totalQuestions,
          maxStreak: gameScores.maxStreak,
          tokensEarned: gameScores.tokensEarned,
          completedAt: gameScores.completedAt,
          playerName: users.name,
        })
        .from(gameScores)
        .leftJoin(users, eq(gameScores.userId, users.id))
        .where(
          input.difficulty 
            ? and(eq(gameScores.gameType, input.gameType), eq(gameScores.difficulty, input.difficulty))
            : eq(gameScores.gameType, input.gameType)
        )
        .orderBy(desc(gameScores.score))
        .limit(input.limit);
      
      const scores = await query;
      
      return scores.map((s, index) => ({
        rank: index + 1,
        ...s,
        playerName: s.playerName || "Anonymous",
      }));
    }),

  // Get user's personal best scores
  getMyScores: protectedProcedure
    .input(z.object({
      gameType: z.string(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      
      const scores = await db
        .select()
        .from(gameScores)
        .where(and(
          eq(gameScores.userId, ctx.user.id),
          eq(gameScores.gameType, input.gameType)
        ))
        .orderBy(desc(gameScores.score))
        .limit(input.limit);
      
      return scores;
    }),

  // Get user's rank for a game type
  getMyRank: protectedProcedure
    .input(z.object({
      gameType: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      
      // Get user's best score
      const myBest = await db
        .select({ score: sql<number>`MAX(${gameScores.score})` })
        .from(gameScores)
        .where(and(
          eq(gameScores.userId, ctx.user.id),
          eq(gameScores.gameType, input.gameType)
        ));
      
      if (!myBest[0]?.score) {
        return { rank: null, bestScore: null, totalPlayers: 0 };
      }
      
      // Count how many players have a higher best score
      const higherScores = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${gameScores.userId})` })
        .from(gameScores)
        .where(and(
          eq(gameScores.gameType, input.gameType),
          sql`${gameScores.score} > ${myBest[0].score}`
        ));
      
      // Count total unique players
      const totalPlayers = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${gameScores.userId})` })
        .from(gameScores)
        .where(eq(gameScores.gameType, input.gameType));
      
      return {
        rank: (higherScores[0]?.count || 0) + 1,
        bestScore: myBest[0].score,
        totalPlayers: totalPlayers[0]?.count || 0,
      };
    }),
});
