import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// Achievement definitions for L.A.W.S. Quest and Community Builder
const ACHIEVEMENTS = {
  // L.A.W.S. Quest - Chapter Completion
  "quest-chapter-1": {
    id: "quest-chapter-1",
    name: "The Awakening",
    description: "Complete Chapter 1: Experience the dual-path journey",
    category: "quest",
    points: 100,
    icon: "sunrise",
    rarity: "common",
  },
  "quest-chapter-2": {
    id: "quest-chapter-2",
    name: "Foundation Builder",
    description: "Complete Chapter 2: Learn trust and entity formation",
    category: "quest",
    points: 150,
    icon: "building",
    rarity: "common",
  },
  "quest-chapter-3": {
    id: "quest-chapter-3",
    name: "Shield Bearer",
    description: "Complete Chapter 3: Master the protection layer",
    category: "quest",
    points: 200,
    icon: "shield",
    rarity: "uncommon",
  },
  "quest-chapter-4": {
    id: "quest-chapter-4",
    name: "Income Architect",
    description: "Complete Chapter 4: Build multiple income streams",
    category: "quest",
    points: 250,
    icon: "trending-up",
    rarity: "uncommon",
  },
  "quest-chapter-5": {
    id: "quest-chapter-5",
    name: "Legacy Creator",
    description: "Complete Chapter 5: Establish generational transfer",
    category: "quest",
    points: 300,
    icon: "crown",
    rarity: "rare",
  },
  "quest-complete": {
    id: "quest-complete",
    name: "Sovereignty Achieved",
    description: "Complete all 5 chapters of L.A.W.S. Quest",
    category: "quest",
    points: 500,
    icon: "trophy",
    rarity: "epic",
  },

  // L.A.W.S. Quest - Path Choices
  "chose-trust-path": {
    id: "chose-trust-path",
    name: "Trust Pioneer",
    description: "Choose the Birth-Trust path in Chapter 1",
    category: "quest",
    points: 50,
    icon: "key",
    rarity: "common",
  },
  "chose-ward-path": {
    id: "chose-ward-path",
    name: "Self-Made Journey",
    description: "Choose the Birth-Ward path in Chapter 1",
    category: "quest",
    points: 50,
    icon: "footprints",
    rarity: "common",
  },
  "both-paths-completed": {
    id: "both-paths-completed",
    name: "Path Master",
    description: "Complete Chapter 1 on both paths",
    category: "quest",
    points: 200,
    icon: "git-branch",
    rarity: "rare",
  },

  // Community Builder - Game Milestones
  "first-community": {
    id: "first-community",
    name: "Community Founder",
    description: "Start your first Community Builder game",
    category: "community",
    points: 50,
    icon: "users",
    rarity: "common",
  },
  "first-building": {
    id: "first-building",
    name: "First Brick",
    description: "Construct your first building in Community Builder",
    category: "community",
    points: 75,
    icon: "home",
    rarity: "common",
  },
  "population-100": {
    id: "population-100",
    name: "Growing Community",
    description: "Reach 100 population in Community Builder",
    category: "community",
    points: 100,
    icon: "users-plus",
    rarity: "common",
  },
  "population-500": {
    id: "population-500",
    name: "Thriving Town",
    description: "Reach 500 population in Community Builder",
    category: "community",
    points: 200,
    icon: "building-2",
    rarity: "uncommon",
  },
  "population-1000": {
    id: "population-1000",
    name: "City Builder",
    description: "Reach 1000 population in Community Builder",
    category: "community",
    points: 400,
    icon: "landmark",
    rarity: "rare",
  },

  // Community Builder - L.A.W.S. Pillars
  "land-master": {
    id: "land-master",
    name: "Land Steward",
    description: "Develop 5 properties in Community Builder",
    category: "community",
    points: 150,
    icon: "map",
    rarity: "uncommon",
  },
  "air-master": {
    id: "air-master",
    name: "Knowledge Keeper",
    description: "Build 3 education facilities in Community Builder",
    category: "community",
    points: 150,
    icon: "book-open",
    rarity: "uncommon",
  },
  "water-master": {
    id: "water-master",
    name: "Healing Hand",
    description: "Establish 3 wellness services in Community Builder",
    category: "community",
    points: 150,
    icon: "heart",
    rarity: "uncommon",
  },
  "self-master": {
    id: "self-master",
    name: "Business Catalyst",
    description: "Create 5 businesses in Community Builder",
    category: "community",
    points: 150,
    icon: "briefcase",
    rarity: "uncommon",
  },
  "laws-complete": {
    id: "laws-complete",
    name: "L.A.W.S. Master",
    description: "Achieve mastery in all four L.A.W.S. pillars",
    category: "community",
    points: 500,
    icon: "award",
    rarity: "epic",
  },

  // Multiplayer Achievements
  "first-multiplayer": {
    id: "first-multiplayer",
    name: "Team Player",
    description: "Join your first multiplayer game",
    category: "multiplayer",
    points: 50,
    icon: "users-round",
    rarity: "common",
  },
  "host-game": {
    id: "host-game",
    name: "Game Host",
    description: "Host a multiplayer game",
    category: "multiplayer",
    points: 75,
    icon: "crown",
    rarity: "common",
  },
  "win-vote": {
    id: "win-vote",
    name: "Voice of the People",
    description: "Have your priority choice win a community vote",
    category: "multiplayer",
    points: 50,
    icon: "check-circle",
    rarity: "common",
  },
  "contract-winner": {
    id: "contract-winner",
    name: "Contract Champion",
    description: "Win a service contract bid",
    category: "multiplayer",
    points: 100,
    icon: "file-check",
    rarity: "uncommon",
  },
  "10-games-played": {
    id: "10-games-played",
    name: "Dedicated Player",
    description: "Complete 10 multiplayer games",
    category: "multiplayer",
    points: 200,
    icon: "repeat",
    rarity: "uncommon",
  },
  "50-games-played": {
    id: "50-games-played",
    name: "Community Veteran",
    description: "Complete 50 multiplayer games",
    category: "multiplayer",
    points: 500,
    icon: "medal",
    rarity: "rare",
  },

  // Special Achievements
  "early-adopter": {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Play during the first month of launch",
    category: "special",
    points: 100,
    icon: "rocket",
    rarity: "rare",
  },
  "perfect-chapter": {
    id: "perfect-chapter",
    name: "Perfect Score",
    description: "Complete a chapter with all optimal choices",
    category: "special",
    points: 250,
    icon: "star",
    rarity: "rare",
  },
  "speed-runner": {
    id: "speed-runner",
    name: "Speed Runner",
    description: "Complete L.A.W.S. Quest in under 30 minutes",
    category: "special",
    points: 300,
    icon: "timer",
    rarity: "epic",
  },
  "completionist": {
    id: "completionist",
    name: "Completionist",
    description: "Unlock all achievements",
    category: "special",
    points: 1000,
    icon: "gem",
    rarity: "legendary",
  },
};

// In-memory storage (would be database in production)
const playerAchievements = new Map<string, Set<string>>();
const playerStats = new Map<string, {
  questChaptersCompleted: number[];
  communityGamesPlayed: number;
  multiplayerGamesPlayed: number;
  totalPoints: number;
  lastActive: number;
}>();

// Leaderboard cache
let leaderboardCache: {
  global: Array<{ rank: number; playerId: string; playerName: string; points: number; achievementCount: number }>;
  weekly: Array<{ rank: number; playerId: string; playerName: string; points: number; achievementCount: number }>;
  lastUpdated: number;
} = {
  global: [],
  weekly: [],
  lastUpdated: 0,
};

function getPlayerAchievements(playerId: string): Set<string> {
  if (!playerAchievements.has(playerId)) {
    playerAchievements.set(playerId, new Set());
  }
  return playerAchievements.get(playerId)!;
}

function getPlayerStats(playerId: string) {
  if (!playerStats.has(playerId)) {
    playerStats.set(playerId, {
      questChaptersCompleted: [],
      communityGamesPlayed: 0,
      multiplayerGamesPlayed: 0,
      totalPoints: 0,
      lastActive: Date.now(),
    });
  }
  return playerStats.get(playerId)!;
}

function updateLeaderboard() {
  const now = Date.now();
  if (now - leaderboardCache.lastUpdated < 60000) return; // Cache for 1 minute

  const allPlayers = Array.from(playerStats.entries()).map(([playerId, stats]) => ({
    playerId,
    playerName: `Player ${playerId.substring(0, 6)}`,
    points: stats.totalPoints,
    achievementCount: playerAchievements.get(playerId)?.size || 0,
  }));

  allPlayers.sort((a, b) => b.points - a.points);

  leaderboardCache.global = allPlayers.slice(0, 100).map((p, i) => ({
    rank: i + 1,
    ...p,
  }));

  // Weekly would filter by lastActive within 7 days
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weeklyPlayers = Array.from(playerStats.entries())
    .filter(([_, stats]) => stats.lastActive > weekAgo)
    .map(([playerId, stats]) => ({
      playerId,
      playerName: `Player ${playerId.substring(0, 6)}`,
      points: stats.totalPoints,
      achievementCount: playerAchievements.get(playerId)?.size || 0,
    }));

  weeklyPlayers.sort((a, b) => b.points - a.points);

  leaderboardCache.weekly = weeklyPlayers.slice(0, 100).map((p, i) => ({
    rank: i + 1,
    ...p,
  }));

  leaderboardCache.lastUpdated = now;
}

export const gameAchievementsRouter = router({
  // Get all achievement definitions
  getAchievementDefinitions: publicProcedure.query(() => {
    return Object.values(ACHIEVEMENTS);
  }),

  // Get player's unlocked achievements
  getPlayerAchievements: protectedProcedure.query(({ ctx }) => {
    const playerId = ctx.user.id.toString();
    const unlocked = getPlayerAchievements(playerId);
    const stats = getPlayerStats(playerId);

    return {
      unlocked: Array.from(unlocked).map(id => ({
        ...ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS],
        unlockedAt: Date.now(), // Would store actual unlock time
      })),
      stats: {
        totalPoints: stats.totalPoints,
        achievementCount: unlocked.size,
        totalAchievements: Object.keys(ACHIEVEMENTS).length,
        questChaptersCompleted: stats.questChaptersCompleted,
        communityGamesPlayed: stats.communityGamesPlayed,
        multiplayerGamesPlayed: stats.multiplayerGamesPlayed,
      },
    };
  }),

  // Unlock an achievement
  unlockAchievement: protectedProcedure
    .input(z.object({
      achievementId: z.string(),
    }))
    .mutation(({ ctx, input }) => {
      const playerId = ctx.user.id.toString();
      const achievement = ACHIEVEMENTS[input.achievementId as keyof typeof ACHIEVEMENTS];

      if (!achievement) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Achievement not found" });
      }

      const playerAchievs = getPlayerAchievements(playerId);
      const stats = getPlayerStats(playerId);

      if (playerAchievs.has(input.achievementId)) {
        return {
          success: false,
          message: "Achievement already unlocked",
          achievement: null,
        };
      }

      playerAchievs.add(input.achievementId);
      stats.totalPoints += achievement.points;
      stats.lastActive = Date.now();

      // Check for completionist achievement
      if (playerAchievs.size === Object.keys(ACHIEVEMENTS).length - 1) {
        playerAchievs.add("completionist");
        stats.totalPoints += ACHIEVEMENTS.completionist.points;
      }

      return {
        success: true,
        message: `Achievement unlocked: ${achievement.name}`,
        achievement: {
          ...achievement,
          unlockedAt: Date.now(),
        },
        newPoints: stats.totalPoints,
      };
    }),

  // Record game progress (triggers achievement checks)
  recordProgress: protectedProcedure
    .input(z.object({
      gameType: z.enum(["quest", "community", "multiplayer"]),
      action: z.string(),
      data: z.any().optional(),
    }))
    .mutation(({ ctx, input }) => {
      const playerId = ctx.user.id.toString();
      const playerAchievs = getPlayerAchievements(playerId);
      const stats = getPlayerStats(playerId);
      const newAchievements: string[] = [];

      stats.lastActive = Date.now();

      switch (input.action) {
        case "chapter-complete":
          const chapter = input.data?.chapter as number;
          if (chapter && !stats.questChaptersCompleted.includes(chapter)) {
            stats.questChaptersCompleted.push(chapter);
            
            // Unlock chapter achievement
            const chapterAchievementId = `quest-chapter-${chapter}`;
            if (!playerAchievs.has(chapterAchievementId) && ACHIEVEMENTS[chapterAchievementId as keyof typeof ACHIEVEMENTS]) {
              playerAchievs.add(chapterAchievementId);
              stats.totalPoints += ACHIEVEMENTS[chapterAchievementId as keyof typeof ACHIEVEMENTS].points;
              newAchievements.push(chapterAchievementId);
            }

            // Check for quest complete
            if (stats.questChaptersCompleted.length === 5 && !playerAchievs.has("quest-complete")) {
              playerAchievs.add("quest-complete");
              stats.totalPoints += ACHIEVEMENTS["quest-complete"].points;
              newAchievements.push("quest-complete");
            }
          }
          break;

        case "path-chosen":
          const path = input.data?.path as string;
          if (path === "trust" && !playerAchievs.has("chose-trust-path")) {
            playerAchievs.add("chose-trust-path");
            stats.totalPoints += ACHIEVEMENTS["chose-trust-path"].points;
            newAchievements.push("chose-trust-path");
          } else if (path === "ward" && !playerAchievs.has("chose-ward-path")) {
            playerAchievs.add("chose-ward-path");
            stats.totalPoints += ACHIEVEMENTS["chose-ward-path"].points;
            newAchievements.push("chose-ward-path");
          }

          // Check for both paths
          if (playerAchievs.has("chose-trust-path") && playerAchievs.has("chose-ward-path") && !playerAchievs.has("both-paths-completed")) {
            playerAchievs.add("both-paths-completed");
            stats.totalPoints += ACHIEVEMENTS["both-paths-completed"].points;
            newAchievements.push("both-paths-completed");
          }
          break;

        case "community-game-complete":
          stats.communityGamesPlayed++;
          if (stats.communityGamesPlayed === 1 && !playerAchievs.has("first-community")) {
            playerAchievs.add("first-community");
            stats.totalPoints += ACHIEVEMENTS["first-community"].points;
            newAchievements.push("first-community");
          }
          break;

        case "multiplayer-game-complete":
          stats.multiplayerGamesPlayed++;
          if (stats.multiplayerGamesPlayed === 1 && !playerAchievs.has("first-multiplayer")) {
            playerAchievs.add("first-multiplayer");
            stats.totalPoints += ACHIEVEMENTS["first-multiplayer"].points;
            newAchievements.push("first-multiplayer");
          }
          if (stats.multiplayerGamesPlayed === 10 && !playerAchievs.has("10-games-played")) {
            playerAchievs.add("10-games-played");
            stats.totalPoints += ACHIEVEMENTS["10-games-played"].points;
            newAchievements.push("10-games-played");
          }
          if (stats.multiplayerGamesPlayed === 50 && !playerAchievs.has("50-games-played")) {
            playerAchievs.add("50-games-played");
            stats.totalPoints += ACHIEVEMENTS["50-games-played"].points;
            newAchievements.push("50-games-played");
          }
          break;

        case "host-game":
          if (!playerAchievs.has("host-game")) {
            playerAchievs.add("host-game");
            stats.totalPoints += ACHIEVEMENTS["host-game"].points;
            newAchievements.push("host-game");
          }
          break;

        case "win-vote":
          if (!playerAchievs.has("win-vote")) {
            playerAchievs.add("win-vote");
            stats.totalPoints += ACHIEVEMENTS["win-vote"].points;
            newAchievements.push("win-vote");
          }
          break;

        case "contract-won":
          if (!playerAchievs.has("contract-winner")) {
            playerAchievs.add("contract-winner");
            stats.totalPoints += ACHIEVEMENTS["contract-winner"].points;
            newAchievements.push("contract-winner");
          }
          break;
      }

      return {
        success: true,
        newAchievements: newAchievements.map(id => ({
          ...ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS],
          unlockedAt: Date.now(),
        })),
        totalPoints: stats.totalPoints,
      };
    }),

  // Get leaderboard
  getLeaderboard: publicProcedure
    .input(z.object({
      type: z.enum(["global", "weekly"]).default("global"),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(({ input }) => {
      updateLeaderboard();
      
      const board = input.type === "global" 
        ? leaderboardCache.global 
        : leaderboardCache.weekly;

      return {
        type: input.type,
        entries: board.slice(0, input.limit),
        lastUpdated: leaderboardCache.lastUpdated,
      };
    }),

  // Get player's rank
  getPlayerRank: protectedProcedure.query(({ ctx }) => {
    const playerId = ctx.user.id.toString();
    updateLeaderboard();

    const globalRank = leaderboardCache.global.findIndex(e => e.playerId === playerId) + 1;
    const weeklyRank = leaderboardCache.weekly.findIndex(e => e.playerId === playerId) + 1;
    const stats = getPlayerStats(playerId);

    return {
      globalRank: globalRank || null,
      weeklyRank: weeklyRank || null,
      totalPoints: stats.totalPoints,
      percentile: globalRank 
        ? Math.round((1 - globalRank / Math.max(leaderboardCache.global.length, 1)) * 100)
        : null,
    };
  }),

  // Get achievement categories
  getCategories: publicProcedure.query(() => {
    const categories = new Map<string, { count: number; totalPoints: number }>();
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      const cat = categories.get(achievement.category) || { count: 0, totalPoints: 0 };
      cat.count++;
      cat.totalPoints += achievement.points;
      categories.set(achievement.category, cat);
    });

    return Array.from(categories.entries()).map(([name, data]) => ({
      name,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
      ...data,
    }));
  }),

  // Get rarity distribution
  getRarityInfo: publicProcedure.query(() => {
    return {
      common: { color: "#9CA3AF", multiplier: 1 },
      uncommon: { color: "#22C55E", multiplier: 1.5 },
      rare: { color: "#3B82F6", multiplier: 2 },
      epic: { color: "#A855F7", multiplier: 3 },
      legendary: { color: "#F59E0B", multiplier: 5 },
    };
  }),
});
