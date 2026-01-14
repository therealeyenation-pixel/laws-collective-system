import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  gameSessions,
  achievements,
  tokenAccounts,
  tokenTransactions,
  businessEntities,
  activityAuditTrail,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const gamifiedSimulatorRouter = router({
  // Start a new game session
  startGameSession: protectedProcedure
    .input(
      z.object({
        simulatorId: z.number(),
        gameType: z.string(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Create game session
      const session = await db.insert(gameSessions).values({
        userId: ctx.user.id,
        simulatorId: input.simulatorId,
        gameType: input.gameType,
        difficulty: input.difficulty,
        status: "in_progress",
        gameState: {
          turn: 1,
          decisions: [],
          score: 0,
          startedAt: new Date().toISOString(),
        },
      });

      const sessionId = session[0].insertId;

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "game_session_started",
        action: "create",
        details: {
          sessionId: sessionId,
          gameType: input.gameType,
          difficulty: input.difficulty,
        } as any,
      });

      return {
        sessionId: sessionId,
        status: "started",
        initialState: {
          turn: 1,
          score: 0,
          tokensEarned: 0,
        },
      };
    }),

  // Make a decision in game
  makeGameDecision: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        decision: z.string(),
        context: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get current game session
      const sessions = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.id, input.sessionId));

      if (sessions.length === 0) throw new Error("Game session not found");
      const currentSession = sessions[0];

      // Use LLM to evaluate decision and generate outcome
      const prompt = `Evaluate this game decision and generate outcome:

Game Type: ${currentSession.gameType}
Difficulty: ${currentSession.difficulty}
Current Turn: ${(currentSession.gameState as any)?.turn || 1}
Player Decision: ${input.decision}
Context: ${JSON.stringify(input.context || {})}

Generate a JSON response with:
1. decision_quality: 0-100 score for the decision
2. outcome: What happens as a result
3. next_scenario: What the player faces next
4. tokens_earned: 0-100 tokens based on decision quality
5. learning_point: What the player should learn
6. difficulty_adjustment: "increase", "maintain", or "decrease"

Format as valid JSON only.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a game master evaluating player decisions in a business simulator. Respond only with valid JSON.",
          },
          { role: "user", content: prompt },
        ],
      });

      let outcome;
      try {
        const messageContent = response.choices[0]?.message.content;
        const content = typeof messageContent === "string" ? messageContent : "{}";
        outcome = JSON.parse(content);
      } catch {
        outcome = {
          decision_quality: 50,
          outcome: "Decision processed",
          next_scenario: "Continue playing",
          tokens_earned: 10,
          learning_point: "Keep learning",
          difficulty_adjustment: "maintain",
        };
      }

      // Update game state
      const gameState = (currentSession.gameState as any) || {};
      gameState.turn = (gameState.turn || 1) + 1;
      gameState.decisions = gameState.decisions || [];
      gameState.decisions.push({
        turn: gameState.turn,
        decision: input.decision,
        quality: outcome.decision_quality,
        tokensEarned: outcome.tokens_earned,
      });
      gameState.score = (gameState.score || 0) + outcome.decision_quality;

      // Update session
      const totalTokensForSession = Number(currentSession.tokensEarned || 0) + outcome.tokens_earned;
      await db
        .update(gameSessions)
        .set({
          gameState: gameState,
          score: gameState.score,
          tokensEarned: totalTokensForSession.toString(),
        })
        .where(eq(gameSessions.id, input.sessionId));

      // Award tokens
      const tokenAcct = await db
        .select()
        .from(tokenAccounts)
        .where(eq(tokenAccounts.userId, ctx.user.id));

      if (tokenAcct.length > 0) {
        const newBalance = Number(tokenAcct[0].tokenBalance) + outcome.tokens_earned;
        const newTotalEarned = Number(tokenAcct[0].totalEarned) + outcome.tokens_earned;
        await db
          .update(tokenAccounts)
          .set({
            tokenBalance: newBalance.toString(),
            totalEarned: newTotalEarned.toString(),
          })
          .where(eq(tokenAccounts.userId, ctx.user.id));

        // Log token transaction
        await db.insert(tokenTransactions).values({
          userId: ctx.user.id,
          amount: outcome.tokens_earned.toString(),
          transactionType: "earned",
          source: `game_session_${input.sessionId}`,
          description: `Tokens earned from game decision: ${input.decision}`,
        });
      }

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "game_decision_made",
        action: "update",
        details: {
          sessionId: input.sessionId,
          decision: input.decision,
          quality: outcome.decision_quality,
          tokensEarned: outcome.tokens_earned,
        } as any,
      });

      return {
        sessionId: input.sessionId,
        outcome: outcome,
        gameState: gameState,
        tokensEarned: Number(outcome.tokens_earned),
        status: "decision_processed",
      };
    }),

  // Complete game session
  completeGameSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get session
      const sessions = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.id, input.sessionId));

      if (sessions.length === 0) throw new Error("Game session not found");
      const session = sessions[0];

      // Calculate final score and bonus tokens
      const finalScore = session.score || 0;
      const bonusTokens = Math.floor(finalScore / 10);

      // Update session
      const totalTokensEarned = Number(session.tokensEarned || 0) + bonusTokens;
      await db
        .update(gameSessions)
        .set({
          status: "completed",
          completedAt: new Date(),
          tokensEarned: totalTokensEarned.toString(),
        })
        .where(eq(gameSessions.id, input.sessionId));

      // Award bonus tokens
      const tokenAcct = await db
        .select()
        .from(tokenAccounts)
        .where(eq(tokenAccounts.userId, ctx.user.id));

      if (tokenAcct.length > 0) {
        const newBalance = Number(tokenAcct[0].tokenBalance) + bonusTokens;
        const newTotalEarned = Number(tokenAcct[0].totalEarned) + bonusTokens;
        await db
          .update(tokenAccounts)
          .set({
            tokenBalance: newBalance.toString(),
            totalEarned: newTotalEarned.toString(),
          })
          .where(eq(tokenAccounts.userId, ctx.user.id));

        // Log bonus token transaction
        await db.insert(tokenTransactions).values({
          userId: ctx.user.id,
          amount: bonusTokens.toString(),
          transactionType: "reward",
          source: `game_completion_${input.sessionId}`,
          description: `Bonus tokens for completing game with score ${finalScore}`,
        });
      }

      // Check for achievements
      const achievements_list = await checkAchievements(
        db,
        ctx.user.id,
        finalScore,
        session.difficulty
      );

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "game_session_completed",
        action: "update",
        details: {
          sessionId: input.sessionId,
          finalScore: finalScore,
          bonusTokens: bonusTokens,
          achievements: achievements_list,
        } as any,
      });

      return {
        sessionId: input.sessionId,
        finalScore: finalScore,
        bonusTokens: bonusTokens,
        achievements: achievements_list,
        status: "completed",
      };
    }),

  // Get game session details
  getGameSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const sessions = await db
        .select()
        .from(gameSessions)
        .where(
          and(eq(gameSessions.id, input.sessionId), eq(gameSessions.userId, ctx.user.id))
        );

      if (sessions.length === 0) return null;
      return sessions[0];
    }),

  // Get user's game statistics
  getGameStatistics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const sessions = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.userId, ctx.user.id));

    const completed = sessions.filter((s) => s.status === "completed");
    const totalScore = completed.reduce((sum, s) => sum + (s.score || 0), 0);
    const totalTokens = completed.reduce((sum, s) => sum + Number(s.tokensEarned || 0), 0);

    return {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      averageScore: completed.length > 0 ? totalScore / completed.length : 0,
      totalTokensEarned: totalTokens,
      sessionsByDifficulty: {
        beginner: sessions.filter((s) => s.difficulty === "beginner").length,
        intermediate: sessions.filter((s) => s.difficulty === "intermediate").length,
        advanced: sessions.filter((s) => s.difficulty === "advanced").length,
      },
    };
  }),

  // Generate AI scenario for advanced play
  generateAIScenario: protectedProcedure
    .input(
      z.object({
        businessContext: z.string(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
        previousDecisions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Generate complex scenario using LLM
      const prompt = `Generate a challenging business scenario for a ${input.difficulty} player:

Business Context: ${input.businessContext}
Previous Decisions: ${JSON.stringify(input.previousDecisions || [])}

Create a realistic, multi-layered scenario with:
1. scenario_description: Detailed situation description
2. key_stakeholders: Who is involved and their interests
3. constraints: What limits the player's options
4. opportunities: What advantages are available
5. decision_points: 3-4 key decisions to make
6. success_criteria: How to measure success
7. complications: What could go wrong
8. time_pressure: How urgent is this

Make it realistic and educational. Format as valid JSON only.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert business scenario designer. Create realistic, challenging scenarios. Respond only with valid JSON.",
          },
          { role: "user", content: prompt },
        ],
      });

      let scenario;
      try {
        const messageContent = response.choices[0]?.message.content;
        const content = typeof messageContent === "string" ? messageContent : "{}";
        scenario = JSON.parse(content);
      } catch {
        scenario = {
          scenario_description: "Default business scenario",
          key_stakeholders: ["Stakeholder 1", "Stakeholder 2"],
          constraints: ["Resource limitation"],
          opportunities: ["Market expansion"],
          decision_points: ["Decision 1", "Decision 2"],
          success_criteria: "Achieve objectives",
          complications: "Unexpected challenges",
          time_pressure: "Moderate",
        };
      }

      // Log to audit trail
      const db = await getDb();
      if (db) {
        await db.insert(activityAuditTrail).values({
          userId: ctx.user.id,
          activityType: "ai_scenario_generated",
          action: "create",
          details: {
            businessContext: input.businessContext,
            difficulty: input.difficulty,
          } as any,
        });
      }

      return {
        scenario: scenario,
        status: "generated",
      };
    }),

  // List user's achievements
  getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const userAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, ctx.user.id));

    return userAchievements;
  }),
});

// Helper function to check and award achievements
async function checkAchievements(
  db: any,
  userId: number,
  finalScore: number,
  difficulty: string
): Promise<any[]> {
  const achievementsList = [];

  // Achievement 1: Score milestone
  if (finalScore >= 80) {
    const existing = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          eq(achievements.achievementType, "high_score")
        )
      );

    if (existing.length === 0) {
      await db.insert(achievements).values({
        userId: userId,
        achievementType: "high_score",
        title: "High Scorer",
        description: "Achieved a score of 80 or higher",
        tokensReward: "50",
      });
      achievementsList.push("high_score");
    }
  }

  // Achievement 2: Difficulty completion
  if (difficulty === "advanced") {
    const existing = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          eq(achievements.achievementType, "advanced_master")
        )
      );

    if (existing.length === 0) {
      await db.insert(achievements).values({
        userId: userId,
        achievementType: "advanced_master",
        title: "Advanced Master",
        description: "Completed an advanced difficulty game",
        tokensReward: "100",
      });
      achievementsList.push("advanced_master");
    }
  }

  return achievementsList;
}
