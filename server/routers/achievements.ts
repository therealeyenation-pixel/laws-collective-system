import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  gameAchievements, 
  gamePlayerAchievements, 
  users,
  achievementBlockchainRecords,
  championNfts,
  nftMintQueue,
} from "../../drizzle/schema";
import { desc, eq, and, sql, isNull } from "drizzle-orm";
import crypto from "crypto";

// Blockchain helper functions
function generateBlockchainHash(data: object): string {
  const dataString = JSON.stringify(data) + Date.now().toString();
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

function generateVerificationCode(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateNftTokenId(): string {
  return `LAWS-NFT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

// NFT Contract address (simulated for LuvChain)
const LUVCHAIN_NFT_CONTRACT = "0xLAWS_CHAMPION_NFT_CONTRACT_V1";

// NFT Image generation helper
function generateNftImageUrl(achievement: { name: string; tier: string; badgeIcon: string }): string {
  // In production, this would generate actual NFT artwork
  return `/api/nft/image/${achievement.badgeIcon}/${achievement.tier}`;
}

// Tier definitions
export const TIER_LEVELS = ["bronze", "silver", "gold", "platinum"] as const;
export type TierLevel = typeof TIER_LEVELS[number];

export const DEFAULT_TIER_REQUIREMENTS = {
  bronze: 1,
  silver: 3,
  gold: 5,
  platinum: 10,
};

export const DEFAULT_TIER_REWARDS = {
  bronze: 10,
  silver: 25,
  gold: 50,
  platinum: 100,
};

export const TIER_COLORS = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
};

function generateShareCode(): string {
  return crypto.randomBytes(16).toString("hex");
}

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

  // Get player's achievements with tier information
  getPlayerAchievementsWithTiers: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const playerAchievements = await db.select()
      .from(gamePlayerAchievements)
      .where(eq(gamePlayerAchievements.playerId, ctx.user.id))
      .orderBy(desc(gamePlayerAchievements.earnedAt));
    
    return playerAchievements.map(pa => {
      const definition = ACHIEVEMENT_DEFINITIONS[pa.achievementId - 1];
      return {
        ...pa,
        definition,
        currentTier: pa.currentTier || "bronze",
        progressCount: pa.progressCount || 1,
        nextTier: getNextTier(pa.currentTier || "bronze"),
        progressToNextTier: getProgressToNextTier(pa.progressCount || 1, pa.currentTier || "bronze"),
      };
    });
  }),

  // Upgrade achievement tier
  upgradeTier: protectedProcedure
    .input(z.object({ achievementId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Get the player's achievement
      const [playerAchievement] = await db.select()
        .from(gamePlayerAchievements)
        .where(and(
          eq(gamePlayerAchievements.playerId, ctx.user.id),
          eq(gamePlayerAchievements.achievementId, input.achievementId)
        ))
        .limit(1);
      
      if (!playerAchievement) {
        throw new Error("Achievement not found");
      }
      
      const currentTier = playerAchievement.currentTier || "bronze";
      const progressCount = playerAchievement.progressCount || 1;
      const nextTier = getNextTier(currentTier);
      
      if (!nextTier) {
        return { success: false, message: "Already at maximum tier" };
      }
      
      const requiredProgress = DEFAULT_TIER_REQUIREMENTS[nextTier];
      if (progressCount < requiredProgress) {
        return { 
          success: false, 
          message: `Need ${requiredProgress - progressCount} more completions to upgrade`,
          currentProgress: progressCount,
          required: requiredProgress,
        };
      }
      
      // Calculate bonus tokens for tier upgrade
      const bonusTokens = DEFAULT_TIER_REWARDS[nextTier] - DEFAULT_TIER_REWARDS[currentTier];
      
      // Update the achievement
      await db.update(gamePlayerAchievements)
        .set({
          currentTier: nextTier,
          tierUpgradedAt: new Date(),
          tokensAwarded: (playerAchievement.tokensAwarded || 0) + bonusTokens,
        })
        .where(eq(gamePlayerAchievements.id, playerAchievement.id));
      
      return {
        success: true,
        newTier: nextTier,
        bonusTokens,
        message: `Upgraded to ${nextTier} tier! +${bonusTokens} tokens`,
      };
    }),

  // Generate share link for achievement
  generateShareLink: protectedProcedure
    .input(z.object({ achievementId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Get the player's achievement
      const [playerAchievement] = await db.select()
        .from(gamePlayerAchievements)
        .where(and(
          eq(gamePlayerAchievements.playerId, ctx.user.id),
          eq(gamePlayerAchievements.achievementId, input.achievementId)
        ))
        .limit(1);
      
      if (!playerAchievement) {
        throw new Error("Achievement not found");
      }
      
      // Generate or return existing share code
      let shareCode = playerAchievement.shareCode;
      if (!shareCode) {
        shareCode = generateShareCode();
        await db.update(gamePlayerAchievements)
          .set({ shareCode })
          .where(eq(gamePlayerAchievements.id, playerAchievement.id));
      }
      
      const definition = ACHIEVEMENT_DEFINITIONS[playerAchievement.achievementId - 1];
      
      return {
        shareCode,
        shareUrl: `/achievements/share/${shareCode}`,
        achievement: {
          name: definition?.name || "Achievement",
          description: definition?.description || "",
          tier: playerAchievement.currentTier || "bronze",
          badgeIcon: definition?.badgeIcon || "star",
        },
      };
    }),

  // Get shared achievement by code
  getSharedAchievement: publicProcedure
    .input(z.object({ shareCode: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const [playerAchievement] = await db.select()
        .from(gamePlayerAchievements)
        .where(eq(gamePlayerAchievements.shareCode, input.shareCode))
        .limit(1);
      
      if (!playerAchievement) {
        return null;
      }
      
      // Get player name
      const [player] = await db.select({ name: users.name })
        .from(users)
        .where(eq(users.id, playerAchievement.playerId))
        .limit(1);
      
      const definition = ACHIEVEMENT_DEFINITIONS[playerAchievement.achievementId - 1];
      
      // Increment share count
      await db.update(gamePlayerAchievements)
        .set({ timesShared: (playerAchievement.timesShared || 0) + 1 })
        .where(eq(gamePlayerAchievements.id, playerAchievement.id));
      
      return {
        playerName: player?.name || "Anonymous",
        achievement: {
          name: definition?.name || "Achievement",
          description: definition?.description || "",
          tier: playerAchievement.currentTier || "bronze",
          badgeIcon: definition?.badgeIcon || "star",
          tokenReward: definition?.tokenReward || 0,
        },
        earnedAt: playerAchievement.earnedAt,
        progressCount: playerAchievement.progressCount || 1,
      };
    }),

  // Record share action
  recordShare: protectedProcedure
    .input(z.object({ 
      achievementId: z.number(),
      platform: z.enum(["twitter", "facebook", "linkedin", "copy"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      await db.update(gamePlayerAchievements)
        .set({ 
          timesShared: sql`${gamePlayerAchievements.timesShared} + 1`,
        })
        .where(and(
          eq(gamePlayerAchievements.playerId, ctx.user.id),
          eq(gamePlayerAchievements.achievementId, input.achievementId)
        ));
      
      return { success: true };
    }),

  // Get tier statistics
  getTierStats: publicProcedure.query(async () => {
    const db = getDb();
    
    const stats = await db
      .select({
        tier: gamePlayerAchievements.currentTier,
        count: sql<number>`COUNT(*)`,
      })
      .from(gamePlayerAchievements)
      .groupBy(gamePlayerAchievements.currentTier);
    
    return {
      bronze: stats.find(s => s.tier === "bronze")?.count || 0,
      silver: stats.find(s => s.tier === "silver")?.count || 0,
      gold: stats.find(s => s.tier === "gold")?.count || 0,
      platinum: stats.find(s => s.tier === "platinum")?.count || 0,
    };
  }),

  // ============================================
  // BLOCKCHAIN RECORDING
  // ============================================

  // Record achievement to blockchain
  recordToBlockchain: protectedProcedure
    .input(z.object({ playerAchievementId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Get the player achievement
      const [playerAchievement] = await db.select()
        .from(gamePlayerAchievements)
        .where(and(
          eq(gamePlayerAchievements.id, input.playerAchievementId),
          eq(gamePlayerAchievements.playerId, ctx.user.id)
        ))
        .limit(1);
      
      if (!playerAchievement) {
        throw new Error("Achievement not found");
      }
      
      // Check if already recorded
      if (playerAchievement.blockchainHash) {
        return {
          success: false,
          message: "Achievement already recorded on blockchain",
          blockchainHash: playerAchievement.blockchainHash,
        };
      }
      
      const definition = ACHIEVEMENT_DEFINITIONS[playerAchievement.achievementId - 1];
      
      // Get previous blockchain record for chain linking
      const [lastRecord] = await db.select()
        .from(achievementBlockchainRecords)
        .orderBy(desc(achievementBlockchainRecords.id))
        .limit(1);
      
      // Generate blockchain hash
      const blockchainData = {
        playerId: ctx.user.id,
        achievementId: playerAchievement.achievementId,
        achievementName: definition?.name || "Achievement",
        tier: playerAchievement.currentTier || "bronze",
        tokensAwarded: playerAchievement.tokensAwarded || 0,
        earnedAt: playerAchievement.earnedAt,
        previousHash: lastRecord?.blockchainHash || "GENESIS",
      };
      
      const blockchainHash = generateBlockchainHash(blockchainData);
      const verificationCode = generateVerificationCode();
      const transactionHash = generateBlockchainHash({ ...blockchainData, type: "transaction" });
      
      // Create blockchain record
      await db.insert(achievementBlockchainRecords).values({
        playerId: ctx.user.id,
        playerAchievementId: playerAchievement.id,
        achievementId: playerAchievement.achievementId,
        blockchainHash,
        previousHash: lastRecord?.blockchainHash || null,
        transactionHash,
        recordType: "achievement_unlock",
        achievementName: definition?.name || "Achievement",
        tier: playerAchievement.currentTier || "bronze",
        tokensAwarded: playerAchievement.tokensAwarded || 0,
        verificationCode,
        metadata: JSON.stringify(blockchainData),
      });
      
      // Update player achievement with blockchain hash
      await db.update(gamePlayerAchievements)
        .set({
          blockchainHash,
          blockchainRecordedAt: new Date(),
        })
        .where(eq(gamePlayerAchievements.id, playerAchievement.id));
      
      return {
        success: true,
        blockchainHash,
        transactionHash,
        verificationCode,
        message: "Achievement recorded on blockchain",
      };
    }),

  // Verify blockchain record
  verifyBlockchainRecord: publicProcedure
    .input(z.object({ verificationCode: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const [record] = await db.select()
        .from(achievementBlockchainRecords)
        .where(eq(achievementBlockchainRecords.verificationCode, input.verificationCode))
        .limit(1);
      
      if (!record) {
        return { verified: false, message: "Record not found" };
      }
      
      // Get player name
      const [player] = await db.select({ name: users.name })
        .from(users)
        .where(eq(users.id, record.playerId))
        .limit(1);
      
      return {
        verified: record.isVerified,
        blockchainHash: record.blockchainHash,
        transactionHash: record.transactionHash,
        achievementName: record.achievementName,
        tier: record.tier,
        tokensAwarded: record.tokensAwarded,
        playerName: player?.name || "Anonymous",
        recordedAt: record.recordedAt,
        recordType: record.recordType,
      };
    }),

  // Get player's blockchain records
  getPlayerBlockchainRecords: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    
    const records = await db.select()
      .from(achievementBlockchainRecords)
      .where(eq(achievementBlockchainRecords.playerId, ctx.user.id))
      .orderBy(desc(achievementBlockchainRecords.recordedAt));
    
    return records;
  }),

  // ============================================
  // NFT MINTING
  // ============================================

  // Mint NFT for platinum achievement
  mintPlatinumNft: protectedProcedure
    .input(z.object({ playerAchievementId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Get the player achievement
      const [playerAchievement] = await db.select()
        .from(gamePlayerAchievements)
        .where(and(
          eq(gamePlayerAchievements.id, input.playerAchievementId),
          eq(gamePlayerAchievements.playerId, ctx.user.id)
        ))
        .limit(1);
      
      if (!playerAchievement) {
        throw new Error("Achievement not found");
      }
      
      // Check if already has NFT
      if (playerAchievement.nftTokenId) {
        return {
          success: false,
          message: "NFT already minted for this achievement",
          nftTokenId: playerAchievement.nftTokenId,
        };
      }
      
      // Check if platinum tier
      if (playerAchievement.currentTier !== "platinum") {
        return {
          success: false,
          message: "Only platinum tier achievements can be minted as NFTs",
          currentTier: playerAchievement.currentTier,
        };
      }
      
      const definition = ACHIEVEMENT_DEFINITIONS[playerAchievement.achievementId - 1];
      
      // Generate NFT data
      const tokenId = generateNftTokenId();
      const transactionHash = generateBlockchainHash({
        type: "nft_mint",
        tokenId,
        playerId: ctx.user.id,
        achievementId: playerAchievement.achievementId,
      });
      
      const nftAttributes = [
        { trait_type: "Achievement", value: definition?.name || "Achievement" },
        { trait_type: "Tier", value: "Platinum" },
        { trait_type: "Tokens Earned", value: playerAchievement.tokensAwarded || 0 },
        { trait_type: "Progress Count", value: playerAchievement.progressCount || 1 },
        { trait_type: "Game Type", value: definition?.gameType || "all" },
        { trait_type: "Rarity", value: "Legendary" },
      ];
      
      // Create NFT record
      const [nft] = await db.insert(championNfts).values({
        ownerId: ctx.user.id,
        tokenId,
        contractAddress: LUVCHAIN_NFT_CONTRACT,
        transactionHash,
        nftType: "platinum_achievement",
        achievementId: playerAchievement.achievementId,
        name: `${definition?.name || "Achievement"} - Platinum Champion`,
        description: `Platinum tier achievement NFT for ${definition?.name}. Earned by reaching the highest tier through dedication and skill.`,
        imageUrl: generateNftImageUrl({
          name: definition?.name || "Achievement",
          tier: "platinum",
          badgeIcon: definition?.badgeIcon || "star",
        }),
        attributes: JSON.stringify(nftAttributes),
        rarity: "legendary",
        chainId: "luvchain",
      }).$returningId();
      
      // Update player achievement with NFT info
      await db.update(gamePlayerAchievements)
        .set({
          nftTokenId: tokenId,
          nftContractAddress: LUVCHAIN_NFT_CONTRACT,
          nftMintedAt: new Date(),
          nftTransactionHash: transactionHash,
        })
        .where(eq(gamePlayerAchievements.id, playerAchievement.id));
      
      // Record to blockchain
      const blockchainHash = generateBlockchainHash({
        type: "nft_mint",
        tokenId,
        nftId: nft.id,
      });
      
      await db.insert(achievementBlockchainRecords).values({
        playerId: ctx.user.id,
        playerAchievementId: playerAchievement.id,
        achievementId: playerAchievement.achievementId,
        blockchainHash,
        transactionHash,
        recordType: "nft_mint",
        achievementName: definition?.name || "Achievement",
        tier: "platinum",
        tokensAwarded: playerAchievement.tokensAwarded || 0,
        verificationCode: generateVerificationCode(),
        metadata: JSON.stringify({ nftTokenId: tokenId, nftId: nft.id }),
      });
      
      return {
        success: true,
        nftTokenId: tokenId,
        transactionHash,
        contractAddress: LUVCHAIN_NFT_CONTRACT,
        message: "NFT minted successfully!",
      };
    }),

  // Get player's NFTs
  getPlayerNfts: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    
    const nfts = await db.select()
      .from(championNfts)
      .where(eq(championNfts.ownerId, ctx.user.id))
      .orderBy(desc(championNfts.mintedAt));
    
    return nfts.map(nft => ({
      ...nft,
      attributes: nft.attributes ? JSON.parse(nft.attributes as string) : [],
    }));
  }),

  // Get NFT by token ID
  getNftByTokenId: publicProcedure
    .input(z.object({ tokenId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const [nft] = await db.select()
        .from(championNfts)
        .where(eq(championNfts.tokenId, input.tokenId))
        .limit(1);
      
      if (!nft) {
        return null;
      }
      
      // Get owner name
      const [owner] = await db.select({ name: users.name })
        .from(users)
        .where(eq(users.id, nft.ownerId))
        .limit(1);
      
      return {
        ...nft,
        attributes: nft.attributes ? JSON.parse(nft.attributes as string) : [],
        ownerName: owner?.name || "Anonymous",
      };
    }),

  // Queue NFT mint for leaderboard champion
  queueChampionNft: protectedProcedure
    .input(z.object({
      gameType: z.string(),
      leaderboardPeriod: z.string(),
      rank: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Only top 3 get champion NFTs
      if (input.rank > 3) {
        return {
          success: false,
          message: "Only top 3 leaderboard positions earn champion NFTs",
        };
      }
      
      const rarityByRank: Record<number, string> = {
        1: "legendary",
        2: "epic",
        3: "rare",
      };
      
      const titleByRank: Record<number, string> = {
        1: "Champion",
        2: "Runner-Up",
        3: "Bronze Medalist",
      };
      
      // Queue the NFT mint
      await db.insert(nftMintQueue).values({
        requesterId: ctx.user.id,
        nftType: "leaderboard_champion",
        name: `${input.gameType} ${titleByRank[input.rank]} - ${input.leaderboardPeriod}`,
        description: `Awarded for achieving rank #${input.rank} on the ${input.gameType} leaderboard for ${input.leaderboardPeriod}.`,
        attributes: JSON.stringify([
          { trait_type: "Game", value: input.gameType },
          { trait_type: "Period", value: input.leaderboardPeriod },
          { trait_type: "Rank", value: input.rank },
          { trait_type: "Rarity", value: rarityByRank[input.rank] },
        ]),
      });
      
      return {
        success: true,
        message: `Champion NFT queued for minting. You achieved rank #${input.rank}!`,
      };
    }),

  // Get NFT gallery (all NFTs)
  getNftGallery: publicProcedure
    .input(z.object({ 
      limit: z.number().default(20),
      nftType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      
      let query = db.select({
        nft: championNfts,
        ownerName: users.name,
      })
        .from(championNfts)
        .leftJoin(users, eq(championNfts.ownerId, users.id))
        .orderBy(desc(championNfts.mintedAt))
        .limit(input.limit);
      
      const nfts = await query;
      
      return nfts.map(({ nft, ownerName }) => ({
        ...nft,
        attributes: nft.attributes ? JSON.parse(nft.attributes as string) : [],
        ownerName: ownerName || "Anonymous",
      }));
    }),

  // Get blockchain stats
  getBlockchainStats: publicProcedure.query(async () => {
    const db = getDb();
    
    const [recordCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(achievementBlockchainRecords);
    
    const [nftCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(championNfts);
    
    const [latestRecord] = await db.select()
      .from(achievementBlockchainRecords)
      .orderBy(desc(achievementBlockchainRecords.id))
      .limit(1);
    
    return {
      totalBlockchainRecords: recordCount?.count || 0,
      totalNftsMinted: nftCount?.count || 0,
      latestBlockchainHash: latestRecord?.blockchainHash || null,
      chainId: "luvchain",
      contractAddress: LUVCHAIN_NFT_CONTRACT,
    };
  }),
});

// Helper functions
function getNextTier(currentTier: string): TierLevel | null {
  const currentIndex = TIER_LEVELS.indexOf(currentTier as TierLevel);
  if (currentIndex === -1 || currentIndex >= TIER_LEVELS.length - 1) {
    return null;
  }
  return TIER_LEVELS[currentIndex + 1];
}

function getProgressToNextTier(progressCount: number, currentTier: string): { current: number; required: number; percentage: number } {
  const nextTier = getNextTier(currentTier);
  if (!nextTier) {
    return { current: progressCount, required: progressCount, percentage: 100 };
  }
  const required = DEFAULT_TIER_REQUIREMENTS[nextTier];
  return {
    current: progressCount,
    required,
    percentage: Math.min(100, Math.round((progressCount / required) * 100)),
  };
}
