import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  gameCenterGames,
  gameMatches,
  gameTournaments,
  gamePlayerStats,
  gameAchievements,
  gamePlayerAchievements,
  triviaCategories,
  triviaQuestions,
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Helper to ensure db is not null
const ensureDb = async () => {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return db;
};

export const gameCenterRouter = router({
  // Games
  getGames: publicProcedure
    .input(z.object({ ageGroup: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await ensureDb();
      if (input?.ageGroup) {
        return db.select().from(gameCenterGames)
          .where(and(
            eq(gameCenterGames.isActive, true),
            sql`${gameCenterGames.ageGroup} = ${input.ageGroup} OR ${gameCenterGames.ageGroup} = 'all_ages'`
          ))
          .orderBy(gameCenterGames.name);
      }
      return db.select().from(gameCenterGames)
        .where(eq(gameCenterGames.isActive, true))
        .orderBy(gameCenterGames.name);
    }),

  getGameBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      const [game] = await db.select().from(gameCenterGames)
        .where(eq(gameCenterGames.slug, input.slug));
      if (!game) throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      return game;
    }),

  createGame: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      gameType: z.enum(["strategy", "puzzle", "word", "card", "board", "trivia", "mystery", "educational"]),
      ageGroup: z.enum(["k_5", "6_8", "9_12", "adult", "all_ages"]).default("all_ages"),
      minPlayers: z.number().default(1),
      maxPlayers: z.number().default(2),
      estimatedDuration: z.string().optional(),
      skillsTargeted: z.array(z.string()).optional(),
      tokenRewardBase: z.number().default(10),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      const values: any = {
        ...input,
        skillsTargeted: input.skillsTargeted ? JSON.stringify(input.skillsTargeted) : null,
      };
      const [result] = await db.insert(gameCenterGames).values(values);
      return { id: result.insertId, ...input };
    }),

  // Seed default games
  seedGames: protectedProcedure.mutation(async () => {
    const db = await ensureDb();
    const existing = await db.select().from(gameCenterGames);
    if (existing.length > 0) {
      return { message: "Games already seeded", count: existing.length };
    }

    const games = [
      // House of Wonder (K-5)
      { name: "Rainbow Journey", slug: "rainbow-journey", description: "A colorful path game teaching colors and counting", gameType: "board", ageGroup: "k_5", minPlayers: 2, maxPlayers: 4, estimatedDuration: "15-20 min", skillsTargeted: ["colors", "counting", "turn-taking"], tokenRewardBase: 5, icon: "rainbow" },
      { name: "Memory Match", slug: "memory-match", description: "Find matching pairs to train your memory", gameType: "puzzle", ageGroup: "k_5", minPlayers: 1, maxPlayers: 4, estimatedDuration: "10-15 min", skillsTargeted: ["memory", "concentration", "pattern-recognition"], tokenRewardBase: 5, icon: "brain" },
      { name: "Climb & Slide", slug: "climb-slide", description: "Learn about consequences in this classic board game", gameType: "board", ageGroup: "k_5", minPlayers: 2, maxPlayers: 4, estimatedDuration: "15-20 min", skillsTargeted: ["counting", "consequences", "patience"], tokenRewardBase: 5, icon: "ladder" },
      { name: "Tic-Tac-Toe", slug: "tic-tac-toe", description: "Classic strategy game for beginners", gameType: "strategy", ageGroup: "k_5", minPlayers: 2, maxPlayers: 2, estimatedDuration: "5 min", skillsTargeted: ["strategy", "planning"], tokenRewardBase: 3, icon: "grid" },
      
      // House of Form (6-8)
      { name: "Property Empire", slug: "property-empire", description: "Build your real estate empire and learn financial literacy", gameType: "board", ageGroup: "6_8", minPlayers: 2, maxPlayers: 6, estimatedDuration: "60-90 min", skillsTargeted: ["financial-literacy", "negotiation", "strategy"], tokenRewardBase: 20, icon: "building" },
      { name: "Detective Academy", slug: "detective-academy", description: "Solve mysteries using deductive reasoning", gameType: "mystery", ageGroup: "6_8", minPlayers: 2, maxPlayers: 6, estimatedDuration: "45-60 min", skillsTargeted: ["deduction", "logic", "critical-thinking"], tokenRewardBase: 15, icon: "search" },
      { name: "Fleet Command", slug: "fleet-command", description: "Strategic naval battle using coordinates", gameType: "strategy", ageGroup: "6_8", minPlayers: 2, maxPlayers: 2, estimatedDuration: "20-30 min", skillsTargeted: ["coordinates", "strategy", "probability"], tokenRewardBase: 10, icon: "ship" },
      { name: "Word Forge", slug: "word-forge", description: "Build words and expand your vocabulary", gameType: "word", ageGroup: "6_8", minPlayers: 2, maxPlayers: 4, estimatedDuration: "30-45 min", skillsTargeted: ["vocabulary", "spelling", "strategy"], tokenRewardBase: 12, icon: "text" },
      { name: "Sudoku Challenge", slug: "sudoku", description: "Number puzzles for logical thinking", gameType: "puzzle", ageGroup: "6_8", minPlayers: 1, maxPlayers: 1, estimatedDuration: "10-30 min", skillsTargeted: ["logic", "pattern-recognition", "concentration"], tokenRewardBase: 8, icon: "grid-3x3" },
      { name: "Escape Room: Academy", slug: "escape-academy", description: "Solve puzzles to escape themed rooms", gameType: "mystery", ageGroup: "6_8", minPlayers: 1, maxPlayers: 4, estimatedDuration: "30-45 min", skillsTargeted: ["problem-solving", "teamwork", "critical-thinking"], tokenRewardBase: 15, icon: "key" },
      { name: "Checkers", slug: "checkers", description: "Classic strategy board game", gameType: "strategy", ageGroup: "6_8", minPlayers: 2, maxPlayers: 2, estimatedDuration: "15-30 min", skillsTargeted: ["strategy", "planning", "spatial-reasoning"], tokenRewardBase: 8, icon: "circle" },
      { name: "Connect Four", slug: "connect-four", description: "Get four in a row to win", gameType: "strategy", ageGroup: "6_8", minPlayers: 2, maxPlayers: 2, estimatedDuration: "10-15 min", skillsTargeted: ["pattern-recognition", "strategy", "planning"], tokenRewardBase: 6, icon: "circle-dot" },
      
      // House of Mastery (9-12)
      { name: "Chess", slug: "chess", description: "The ultimate game of strategy and planning", gameType: "strategy", ageGroup: "9_12", minPlayers: 2, maxPlayers: 2, estimatedDuration: "30-60 min", skillsTargeted: ["strategy", "planning", "critical-thinking", "patience"], tokenRewardBase: 15, icon: "crown" },
      { name: "Advanced Escape Room", slug: "escape-advanced", description: "Complex puzzles with cryptography elements", gameType: "mystery", ageGroup: "9_12", minPlayers: 1, maxPlayers: 4, estimatedDuration: "45-60 min", skillsTargeted: ["cryptography", "problem-solving", "teamwork"], tokenRewardBase: 20, icon: "lock" },
      { name: "Stock Market Sim", slug: "stock-sim", description: "Learn investing through simulation", gameType: "educational", ageGroup: "9_12", minPlayers: 1, maxPlayers: 8, estimatedDuration: "30-60 min", skillsTargeted: ["financial-literacy", "risk-assessment", "research"], tokenRewardBase: 18, icon: "trending-up" },
      { name: "Crossword Master", slug: "crossword", description: "Advanced crossword puzzles", gameType: "word", ageGroup: "9_12", minPlayers: 1, maxPlayers: 1, estimatedDuration: "15-30 min", skillsTargeted: ["vocabulary", "general-knowledge", "problem-solving"], tokenRewardBase: 10, icon: "hash" },
      { name: "Logic Puzzles", slug: "logic-puzzles", description: "Brain teasers and deduction challenges", gameType: "puzzle", ageGroup: "9_12", minPlayers: 1, maxPlayers: 1, estimatedDuration: "10-20 min", skillsTargeted: ["logic", "deduction", "critical-thinking"], tokenRewardBase: 12, icon: "lightbulb" },
      
      // Adult/All Ages
      { name: "Solitaire Classic", slug: "solitaire", description: "Classic Klondike solitaire", gameType: "card", ageGroup: "all_ages", minPlayers: 1, maxPlayers: 1, estimatedDuration: "10-15 min", skillsTargeted: ["planning", "patience", "strategy"], tokenRewardBase: 5, icon: "spade" },
      { name: "Spider Solitaire", slug: "spider-solitaire", description: "Advanced solitaire variant", gameType: "card", ageGroup: "adult", minPlayers: 1, maxPlayers: 1, estimatedDuration: "15-30 min", skillsTargeted: ["planning", "strategy", "patience"], tokenRewardBase: 8, icon: "bug" },
      { name: "Hearts", slug: "hearts", description: "Classic trick-taking card game", gameType: "card", ageGroup: "adult", minPlayers: 4, maxPlayers: 4, estimatedDuration: "30-45 min", skillsTargeted: ["strategy", "probability", "memory"], tokenRewardBase: 10, icon: "heart" },
      { name: "Knowledge Quest", slug: "knowledge-quest", description: "Trivia game with L.A.W.S. categories", gameType: "trivia", ageGroup: "all_ages", minPlayers: 2, maxPlayers: 8, estimatedDuration: "30-60 min", skillsTargeted: ["general-knowledge", "quick-thinking", "memory"], tokenRewardBase: 15, icon: "trophy" },
    ];

    for (const game of games) {
      await db.insert(gameCenterGames).values({
        ...game,
        skillsTargeted: JSON.stringify(game.skillsTargeted),
      } as any);
    }

    return { message: "Games seeded successfully", count: games.length };
  }),

  // Matches
  createMatch: protectedProcedure
    .input(z.object({
      gameId: z.number(),
      matchType: z.enum(["solo", "vs_ai", "vs_player", "tournament"]).default("solo"),
      player1Id: z.number(),
      player2Id: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      const [result] = await db.insert(gameMatches).values({
        ...input,
        status: "in_progress",
        startedAt: new Date(),
      });
      return { id: result.insertId, ...input };
    }),

  updateMatch: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["waiting", "in_progress", "completed", "abandoned"]).optional(),
      winnerId: z.number().optional(),
      player1Score: z.number().optional(),
      player2Score: z.number().optional(),
      gameState: z.any().optional(),
      tokensAwarded: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      const { id, ...updates } = input;
      const values: any = { ...updates };
      if (updates.status === "completed") {
        values.completedAt = new Date();
      }
      if (updates.gameState) {
        values.gameState = JSON.stringify(updates.gameState);
      }
      await db.update(gameMatches).set(values).where(eq(gameMatches.id, id));
      return { success: true };
    }),

  getPlayerMatches: protectedProcedure
    .input(z.object({ playerId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      return db.select().from(gameMatches)
        .where(sql`${gameMatches.player1Id} = ${input.playerId} OR ${gameMatches.player2Id} = ${input.playerId}`)
        .orderBy(desc(gameMatches.createdAt))
        .limit(input.limit);
    }),

  // Tournaments
  getTournaments: publicProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await ensureDb();
      if (input?.status) {
        return db.select().from(gameTournaments)
          .where(eq(gameTournaments.status, input.status as any))
          .orderBy(desc(gameTournaments.startDate));
      }
      return db.select().from(gameTournaments).orderBy(desc(gameTournaments.startDate));
    }),

  createTournament: protectedProcedure
    .input(z.object({
      gameId: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
      tournamentType: z.enum(["single_elimination", "double_elimination", "round_robin", "swiss"]).default("single_elimination"),
      ageGroup: z.enum(["k_5", "6_8", "9_12", "adult", "all_ages", "family"]).default("all_ages"),
      maxParticipants: z.number().default(16),
      entryFee: z.number().default(0),
      prizePool: z.number().default(0),
      registrationDeadline: z.string().optional(),
      startDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      const values: any = {
        ...input,
        registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : undefined,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
      };
      const [result] = await db.insert(gameTournaments).values(values);
      return { id: result.insertId, ...input };
    }),

  // Player Stats
  getPlayerStats: protectedProcedure
    .input(z.object({ playerId: z.number() }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      return db.select().from(gamePlayerStats)
        .where(eq(gamePlayerStats.playerId, input.playerId))
        .orderBy(desc(gamePlayerStats.gamesPlayed));
    }),

  updatePlayerStats: protectedProcedure
    .input(z.object({
      playerId: z.number(),
      gameId: z.number(),
      won: z.boolean(),
      score: z.number().default(0),
      tokensEarned: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      const [existing] = await db.select().from(gamePlayerStats)
        .where(and(
          eq(gamePlayerStats.playerId, input.playerId),
          eq(gamePlayerStats.gameId, input.gameId)
        ));

      if (existing) {
        const newStreak = input.won ? existing.currentStreak + 1 : 0;
        await db.update(gamePlayerStats).set({
          gamesPlayed: existing.gamesPlayed + 1,
          gamesWon: input.won ? existing.gamesWon + 1 : existing.gamesWon,
          gamesLost: input.won ? existing.gamesLost : existing.gamesLost + 1,
          totalScore: existing.totalScore + input.score,
          highScore: Math.max(existing.highScore || 0, input.score),
          currentStreak: newStreak,
          bestStreak: Math.max(existing.bestStreak || 0, newStreak),
          tokensEarned: existing.tokensEarned + input.tokensEarned,
          lastPlayedAt: new Date(),
        }).where(eq(gamePlayerStats.id, existing.id));
      } else {
        await db.insert(gamePlayerStats).values({
          playerId: input.playerId,
          gameId: input.gameId,
          gamesPlayed: 1,
          gamesWon: input.won ? 1 : 0,
          gamesLost: input.won ? 0 : 1,
          totalScore: input.score,
          highScore: input.score,
          currentStreak: input.won ? 1 : 0,
          bestStreak: input.won ? 1 : 0,
          tokensEarned: input.tokensEarned,
          lastPlayedAt: new Date(),
        });
      }
      return { success: true };
    }),

  // Leaderboards
  getLeaderboard: publicProcedure
    .input(z.object({
      gameId: z.number().optional(),
      metric: z.enum(["wins", "rating", "tokens", "streak"]).default("wins"),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      let query = db.select().from(gamePlayerStats);
      
      if (input.gameId) {
        query = query.where(eq(gamePlayerStats.gameId, input.gameId)) as any;
      }

      const orderColumn = {
        wins: gamePlayerStats.gamesWon,
        rating: gamePlayerStats.rating,
        tokens: gamePlayerStats.tokensEarned,
        streak: gamePlayerStats.bestStreak,
      }[input.metric];

      return query.orderBy(desc(orderColumn)).limit(input.limit);
    }),

  // Trivia
  getTriviaCategories: publicProcedure.query(async () => {
    const db = await ensureDb();
    return db.select().from(triviaCategories)
      .where(eq(triviaCategories.isActive, true))
      .orderBy(triviaCategories.name);
  }),

  seedTriviaCategories: protectedProcedure.mutation(async () => {
    const db = await ensureDb();
    const existing = await db.select().from(triviaCategories);
    if (existing.length > 0) {
      return { message: "Categories already seeded", count: existing.length };
    }

    const categories = [
      { name: "Financial Sovereignty", slug: "financial", description: "Money, investing, business, and wealth building", icon: "dollar-sign", color: "#22c55e" },
      { name: "L.A.W.S. Framework", slug: "laws", description: "Land, Air, Water, Self knowledge", icon: "leaf", color: "#3b82f6" },
      { name: "History & Culture", slug: "history", description: "African diaspora, indigenous history, world cultures", icon: "book", color: "#a855f7" },
      { name: "Science & Nature", slug: "science", description: "Divine STEM concepts and natural world", icon: "flask", color: "#06b6d4" },
      { name: "Arts & Entertainment", slug: "arts", description: "Music, film, creative arts, and performance", icon: "music", color: "#f43f5e" },
      { name: "Geography & World", slug: "geography", description: "Countries, capitals, landmarks, and global awareness", icon: "globe", color: "#f59e0b" },
    ];

    for (const cat of categories) {
      await db.insert(triviaCategories).values(cat);
    }

    return { message: "Trivia categories seeded", count: categories.length };
  }),

  getTriviaQuestions: protectedProcedure
    .input(z.object({
      categoryId: z.number().optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      ageGroup: z.string().optional(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      let conditions = [eq(triviaQuestions.isActive, true)];
      
      if (input.categoryId) {
        conditions.push(eq(triviaQuestions.categoryId, input.categoryId));
      }
      if (input.difficulty) {
        conditions.push(eq(triviaQuestions.difficulty, input.difficulty));
      }

      return db.select().from(triviaQuestions)
        .where(and(...conditions))
        .orderBy(sql`RAND()`)
        .limit(input.limit);
    }),

  createTriviaQuestion: protectedProcedure
    .input(z.object({
      categoryId: z.number(),
      question: z.string().min(1),
      correctAnswer: z.string().min(1),
      wrongAnswers: z.array(z.string()).min(1),
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
      ageGroup: z.enum(["k_5", "6_8", "9_12", "adult", "all_ages"]).default("all_ages"),
      explanation: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      const [result] = await db.insert(triviaQuestions).values({
        ...input,
        wrongAnswers: JSON.stringify(input.wrongAnswers),
      });
      return { id: result.insertId, ...input };
    }),

  // Achievements
  getAchievements: publicProcedure
    .input(z.object({ gameId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await ensureDb();
      if (input?.gameId) {
        return db.select().from(gameAchievements)
          .where(and(
            eq(gameAchievements.isActive, true),
            sql`${gameAchievements.gameId} = ${input.gameId} OR ${gameAchievements.gameId} IS NULL`
          ));
      }
      return db.select().from(gameAchievements)
        .where(eq(gameAchievements.isActive, true));
    }),

  getPlayerAchievements: protectedProcedure
    .input(z.object({ playerId: z.number() }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      return db.select().from(gamePlayerAchievements)
        .where(eq(gamePlayerAchievements.playerId, input.playerId))
        .orderBy(desc(gamePlayerAchievements.earnedAt));
    }),

  awardAchievement: protectedProcedure
    .input(z.object({
      playerId: z.number(),
      achievementId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      
      // Check if already earned
      const [existing] = await db.select().from(gamePlayerAchievements)
        .where(and(
          eq(gamePlayerAchievements.playerId, input.playerId),
          eq(gamePlayerAchievements.achievementId, input.achievementId)
        ));
      
      if (existing) {
        return { success: false, message: "Achievement already earned" };
      }

      // Get achievement details for token reward
      const [achievement] = await db.select().from(gameAchievements)
        .where(eq(gameAchievements.id, input.achievementId));
      
      if (!achievement) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Achievement not found" });
      }

      await db.insert(gamePlayerAchievements).values({
        playerId: input.playerId,
        achievementId: input.achievementId,
        tokensAwarded: achievement.tokenReward || 0,
      });

      return { success: true, tokensAwarded: achievement.tokenReward };
    }),

  // Stats overview
  getStats: publicProcedure.query(async () => {
    const db = await ensureDb();
    const games = await db.select().from(gameCenterGames).where(eq(gameCenterGames.isActive, true));
    const tournaments = await db.select().from(gameTournaments);
    const categories = await db.select().from(triviaCategories);
    const questions = await db.select().from(triviaQuestions);

    return {
      totalGames: games.length,
      gamesByType: {
        strategy: games.filter(g => g.gameType === "strategy").length,
        puzzle: games.filter(g => g.gameType === "puzzle").length,
        word: games.filter(g => g.gameType === "word").length,
        card: games.filter(g => g.gameType === "card").length,
        board: games.filter(g => g.gameType === "board").length,
        trivia: games.filter(g => g.gameType === "trivia").length,
        mystery: games.filter(g => g.gameType === "mystery").length,
        educational: games.filter(g => g.gameType === "educational").length,
      },
      gamesByAge: {
        k_5: games.filter(g => g.ageGroup === "k_5").length,
        "6_8": games.filter(g => g.ageGroup === "6_8").length,
        "9_12": games.filter(g => g.ageGroup === "9_12").length,
        adult: games.filter(g => g.ageGroup === "adult").length,
        all_ages: games.filter(g => g.ageGroup === "all_ages").length,
      },
      activeTournaments: tournaments.filter(t => t.status === "registration" || t.status === "in_progress").length,
      totalTournaments: tournaments.length,
      triviaCategories: categories.length,
      triviaQuestions: questions.length,
    };
  }),
});
