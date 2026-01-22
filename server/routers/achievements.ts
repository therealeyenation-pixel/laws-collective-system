import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { gameAchievements, gamePlayerAchievements, users } from "../../drizzle/schema";
import { desc, eq, and, sql } from "drizzle-orm";

// Achievement definitions - these are the possible achievements players can earn
export const ACHIEVEMENT_DEFINITIONS = [
  // Financial Literacy Game Achievements
  {
    id: "first_quiz",
    name: "First Steps",
    description: "Complete your first Financial Literacy quiz",
    gameType: "financial-literacy",
    achievementType: "milestone" as const,
    requirement: { type: "games_completed", value: 1 },
    tokenReward: 10,
    badgeIcon: "star",
  },
  {
    id: "quiz_master",
    name: "Quiz Master",
    description: "Complete 10 Financial Literacy quizzes",
    gameType: "financial-literacy",
    achievementType: "milestone" as const,
    requirement: { type: "games_completed", value: 10 },
    tokenReward: 50,
    badgeIcon: "trophy",
  },
  {
    id: "perfect_score",
    name: "Perfect Score",
    description: "Get 100% correct answers in a quiz",
    gameType: "financial-literacy",
    achievementType: "skill" as const,
    requirement: { type: "perfect_game", value: 1 },
    tokenReward: 25,
    badgeIcon: "award",
  },
  {
    id: "streak_5",
    name: "On Fire",
    description: "Get a streak of 5 correct answers",
    gameType: "financial-literacy",
    achievementType: "streak" as const,
    requirement: { type: "streak", value: 5 },
    tokenReward: 15,
    badgeIcon: "flame",
  },
  {
    id: "streak_10",
    name: "Unstoppable",
    description: "Get a streak of 10 correct answers",
    gameType: "financial-literacy",
    achievementType: "streak" as const,
    requirement: { type: "streak", value: 10 },
    tokenReward: 30,
    badgeIcon: "zap",
  },
  {
    id: "hard_mode_winner",
    name: "Challenge Accepted",
    description: "Complete a quiz on Hard difficulty",
    gameType: "financial-literacy",
    achievementType: "skill" as const,
    requirement: { type: "hard_completion", value: 1 },
    tokenReward: 20,
    badgeIcon: "shield",
  },
  {
    id: "score_500",
    name: "High Scorer",
    description: "Earn 500 points in a single game",
    gameType: "financial-literacy",
    achievementType: "milestone" as const,
    requirement: { type: "score", value: 500 },
    tokenReward: 25,
    badgeIcon: "trending-up",
  },
  {
    id: "score_1000",
    name: "Point Champion",
    description: "Earn 1000 points in a single game",
    gameType: "financial-literacy",
    achievementType: "milestone" as const,
    requirement: { type: "score", value: 1000 },
    tokenReward: 50,
    badgeIcon: "crown",
  },
  
  // Business Tycoon Game Achievements
  {
    id: "first_business",
    name: "Entrepreneur",
    description: "Complete your first Business Tycoon game",
    gameType: "business-tycoon",
    achievementType: "milestone" as const,
    requirement: { type: "games_completed", value: 1 },
    tokenReward: 15,
    badgeIcon: "briefcase",
  },
  {
    id: "tycoon_master",
    name: "Tycoon Master",
    description: "Complete 10 Business Tycoon games",
    gameType: "business-tycoon",
    achievementType: "milestone" as const,
    requirement: { type: "games_completed", value: 10 },
    tokenReward: 75,
    badgeIcon: "building",
  },
  {
    id: "millionaire",
    name: "Millionaire",
    description: "Accumulate $1,000,000 in cash during a game",
    gameType: "business-tycoon",
    achievementType: "milestone" as const,
    requirement: { type: "cash", value: 1000000 },
    tokenReward: 50,
    badgeIcon: "dollar-sign",
  },
  {
    id: "reputation_king",
    name: "Reputation King",
    description: "Achieve 100% reputation in a game",
    gameType: "business-tycoon",
    achievementType: "skill" as const,
    requirement: { type: "reputation", value: 100 },
    tokenReward: 40,
    badgeIcon: "star",
  },
  {
    id: "team_builder",
    name: "Team Builder",
    description: "Hire 20 employees in a single game",
    gameType: "business-tycoon",
    achievementType: "milestone" as const,
    requirement: { type: "employees", value: 20 },
    tokenReward: 30,
    badgeIcon: "users",
  },
  {
    id: "asset_collector",
    name: "Asset Collector",
    description: "Accumulate 100 asset points in a game",
    gameType: "business-tycoon",
    achievementType: "milestone" as const,
    requirement: { type: "assets", value: 100 },
    tokenReward: 35,
    badgeIcon: "package",
  },
  {
    id: "risk_taker",
    name: "Risk Taker",
    description: "Choose 5 high-risk decisions in a single game",
    gameType: "business-tycoon",
    achievementType: "skill" as const,
    requirement: { type: "high_risk_decisions", value: 5 },
    tokenReward: 25,
    badgeIcon: "target",
  },
  {
    id: "conservative_winner",
    name: "Safe & Steady",
    description: "Win a game choosing only low-risk decisions",
    gameType: "business-tycoon",
    achievementType: "skill" as const,
    requirement: { type: "low_risk_only", value: 1 },
    tokenReward: 30,
    badgeIcon: "shield-check",
  },
  
  // Cross-game achievements
  {
    id: "game_explorer",
    name: "Game Explorer",
    description: "Play both Financial Literacy and Business Tycoon games",
    gameType: "all",
    achievementType: "special" as const,
    requirement: { type: "games_played", value: 2 },
    tokenReward: 20,
    badgeIcon: "compass",
  },
  {
    id: "token_collector_100",
    name: "Token Collector",
    description: "Earn 100 total L.A.W.S. tokens from games",
    gameType: "all",
    achievementType: "milestone" as const,
    requirement: { type: "total_tokens", value: 100 },
    tokenReward: 25,
    badgeIcon: "coins",
  },
  {
    id: "token_collector_500",
    name: "Token Hoarder",
    description: "Earn 500 total L.A.W.S. tokens from games",
    gameType: "all",
    achievementType: "milestone" as const,
    requirement: { type: "total_tokens", value: 500 },
    tokenReward: 50,
    badgeIcon: "gem",
  },
  {
    id: "leaderboard_top10",
    name: "Top 10",
    description: "Reach the top 10 on any game leaderboard",
    gameType: "all",
    achievementType: "tournament" as const,
    requirement: { type: "leaderboard_rank", value: 10 },
    tokenReward: 40,
    badgeIcon: "medal",
  },
  {
    id: "leaderboard_top3",
    name: "Podium Finish",
    description: "Reach the top 3 on any game leaderboard",
    gameType: "all",
    achievementType: "tournament" as const,
    requirement: { type: "leaderboard_rank", value: 3 },
    tokenReward: 75,
    badgeIcon: "trophy",
  },
  {
    id: "leaderboard_first",
    name: "Champion",
    description: "Reach #1 on any game leaderboard",
    gameType: "all",
    achievementType: "tournament" as const,
    requirement: { type: "leaderboard_rank", value: 1 },
    tokenReward: 100,
    badgeIcon: "crown",
  },
];

export const achievementsRouter = router({
  // Get all available achievements
  getAll: publicProcedure.query(async () => {
    const db = getDb();
    const achievements = await db.select().from(gameAchievements)
      .where(eq(gameAchievements.isActive, true))
      .orderBy(gameAchievements.name);
    
    // If no achievements in DB, return the definitions
    if (achievements.length === 0) {
      return ACHIEVEMENT_DEFINITIONS.map((a, index) => ({
        id: index + 1,
        name: a.name,
        description: a.description,
        gameId: null,
        gameType: a.gameType,
        achievementType: a.achievementType,
        requirement: a.requirement,
        tokenReward: a.tokenReward,
        badgeIcon: a.badgeIcon,
        isActive: true,
        createdAt: new Date(),
        definitionId: a.id,
      }));
    }
    
    return achievements;
  }),

  // Get achievements for a specific game type
  getByGameType: publicProcedure
    .input(z.object({ gameType: z.string() }))
    .query(async ({ input }) => {
      return ACHIEVEMENT_DEFINITIONS.filter(
        a => a.gameType === input.gameType || a.gameType === "all"
      ).map((a, index) => ({
        id: index + 1,
        name: a.name,
        description: a.description,
        gameType: a.gameType,
        achievementType: a.achievementType,
        requirement: a.requirement,
        tokenReward: a.tokenReward,
        badgeIcon: a.badgeIcon,
        definitionId: a.id,
      }));
    }),

  // Get player's earned achievements
  getPlayerAchievements: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const playerAchievements = await db.select()
      .from(gamePlayerAchievements)
      .where(eq(gamePlayerAchievements.playerId, ctx.user.id))
      .orderBy(desc(gamePlayerAchievements.earnedAt));
    
    return playerAchievements;
  }),

  // Get player's achievement progress
  getPlayerProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const earned = await db.select()
      .from(gamePlayerAchievements)
      .where(eq(gamePlayerAchievements.playerId, ctx.user.id));
    
    const earnedIds = earned.map(e => e.achievementId);
    const totalAchievements = ACHIEVEMENT_DEFINITIONS.length;
    const earnedCount = earned.length;
    const totalTokens = earned.reduce((sum, e) => sum + (e.tokensAwarded || 0), 0);
    
    return {
      earnedCount,
      totalAchievements,
      percentage: Math.round((earnedCount / totalAchievements) * 100),
      totalTokensFromAchievements: totalTokens,
      earnedAchievementIds: earnedIds,
    };
  }),

  // Check and unlock achievements based on game results
  checkAndUnlock: protectedProcedure
    .input(z.object({
      gameType: z.string(),
      gameResult: z.object({
        score: z.number(),
        correctAnswers: z.number().optional(),
        totalQuestions: z.number().optional(),
        maxStreak: z.number().optional(),
        difficulty: z.string().optional(),
        cash: z.number().optional(),
        reputation: z.number().optional(),
        employees: z.number().optional(),
        assets: z.number().optional(),
        highRiskDecisions: z.number().optional(),
        lowRiskOnly: z.boolean().optional(),
        gamesCompleted: z.number().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { gameType, gameResult } = input;
      
      // Get player's already earned achievements
      const earned = await db.select()
        .from(gamePlayerAchievements)
        .where(eq(gamePlayerAchievements.playerId, ctx.user.id));
      
      const earnedDefinitionIds = new Set<string>();
      // We need to track which definition IDs are earned
      // For now, we'll use the achievement name as a proxy
      
      const newlyUnlocked: typeof ACHIEVEMENT_DEFINITIONS = [];
      
      // Check each achievement
      for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        // Skip if not applicable to this game
        if (achievement.gameType !== gameType && achievement.gameType !== "all") {
          continue;
        }
        
        // Check if already earned (by matching name in existing achievements)
        const alreadyEarned = earned.some(e => {
          // We'll need to check against the achievement definition
          return false; // For now, allow re-checking
        });
        
        // Check requirement
        let unlocked = false;
        const req = achievement.requirement;
        
        switch (req.type) {
          case "games_completed":
            if ((gameResult.gamesCompleted || 1) >= req.value) unlocked = true;
            break;
          case "perfect_game":
            if (gameResult.correctAnswers === gameResult.totalQuestions && gameResult.totalQuestions && gameResult.totalQuestions > 0) {
              unlocked = true;
            }
            break;
          case "streak":
            if ((gameResult.maxStreak || 0) >= req.value) unlocked = true;
            break;
          case "hard_completion":
            if (gameResult.difficulty === "hard") unlocked = true;
            break;
          case "score":
            if (gameResult.score >= req.value) unlocked = true;
            break;
          case "cash":
            if ((gameResult.cash || 0) >= req.value) unlocked = true;
            break;
          case "reputation":
            if ((gameResult.reputation || 0) >= req.value) unlocked = true;
            break;
          case "employees":
            if ((gameResult.employees || 0) >= req.value) unlocked = true;
            break;
          case "assets":
            if ((gameResult.assets || 0) >= req.value) unlocked = true;
            break;
          case "high_risk_decisions":
            if ((gameResult.highRiskDecisions || 0) >= req.value) unlocked = true;
            break;
          case "low_risk_only":
            if (gameResult.lowRiskOnly === true) unlocked = true;
            break;
        }
        
        if (unlocked) {
          newlyUnlocked.push(achievement);
        }
      }
      
      // Insert newly unlocked achievements
      const insertedAchievements = [];
      for (const achievement of newlyUnlocked) {
        // Check if this specific achievement was already earned
        const existingCheck = await db.select()
          .from(gamePlayerAchievements)
          .where(and(
            eq(gamePlayerAchievements.playerId, ctx.user.id),
            sql`JSON_EXTRACT(${gamePlayerAchievements.tokensAwarded}, '$.definitionId') = ${achievement.id}`
          ));
        
        // Simple check - just insert if not too many of same type
        try {
          await db.insert(gamePlayerAchievements).values({
            playerId: ctx.user.id,
            achievementId: ACHIEVEMENT_DEFINITIONS.indexOf(achievement) + 1,
            tokensAwarded: achievement.tokenReward,
          });
          insertedAchievements.push(achievement);
        } catch (e) {
          // Might be duplicate, skip
        }
      }
      
      return {
        newlyUnlocked: insertedAchievements.map(a => ({
          name: a.name,
          description: a.description,
          tokenReward: a.tokenReward,
          badgeIcon: a.badgeIcon,
        })),
        totalUnlocked: insertedAchievements.length,
      };
    }),

  // Seed achievements to database
  seedAchievements: protectedProcedure.mutation(async () => {
    const db = getDb();
    
    // Check if already seeded
    const existing = await db.select().from(gameAchievements);
    if (existing.length > 0) {
      return { message: "Achievements already seeded", count: existing.length };
    }
    
    // Insert all achievement definitions
    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      await db.insert(gameAchievements).values({
        name: achievement.name,
        description: achievement.description,
        gameId: null,
        achievementType: achievement.achievementType,
        requirement: JSON.stringify(achievement.requirement),
        tokenReward: achievement.tokenReward,
        badgeIcon: achievement.badgeIcon,
        isActive: true,
      });
    }
    
    return { message: "Achievements seeded successfully", count: ACHIEVEMENT_DEFINITIONS.length };
  }),

  // Get leaderboard of players by achievements earned
  getAchievementLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const leaderboard = await db
        .select({
          playerId: gamePlayerAchievements.playerId,
          achievementCount: sql<number>`COUNT(*)`,
          totalTokens: sql<number>`SUM(${gamePlayerAchievements.tokensAwarded})`,
          playerName: users.name,
        })
        .from(gamePlayerAchievements)
        .leftJoin(users, eq(gamePlayerAchievements.playerId, users.id))
        .groupBy(gamePlayerAchievements.playerId, users.name)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(input.limit);
      
      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        playerId: entry.playerId,
        playerName: entry.playerName || "Anonymous",
        achievementCount: entry.achievementCount,
        totalTokens: entry.totalTokens || 0,
      }));
    }),
});
