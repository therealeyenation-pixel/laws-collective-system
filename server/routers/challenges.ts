import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { gameChallenges, gamePlayerChallenges, users } from "../../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

// Challenge definitions - these rotate daily/weekly
export const DAILY_CHALLENGES = [
  {
    name: "Quick Learner",
    description: "Complete any game with a score of 500+",
    requirement: { type: "score", value: 500 },
    tokenReward: 15,
    badgeIcon: "zap",
    rotationSlot: 0, // Sunday
  },
  {
    name: "Streak Master",
    description: "Get a 5+ answer streak in Financial Literacy",
    requirement: { type: "streak", value: 5, gameType: "financial-literacy" },
    tokenReward: 20,
    badgeIcon: "flame",
    rotationSlot: 1, // Monday
  },
  {
    name: "Business Minded",
    description: "Complete Business Tycoon with $150,000+ cash",
    requirement: { type: "cash", value: 150000, gameType: "business-tycoon" },
    tokenReward: 25,
    badgeIcon: "dollar-sign",
    rotationSlot: 2, // Tuesday
  },
  {
    name: "Perfect Round",
    description: "Answer 5 questions correctly in a row",
    requirement: { type: "correct_answers", value: 5 },
    tokenReward: 20,
    badgeIcon: "target",
    rotationSlot: 3, // Wednesday
  },
  {
    name: "Risk Taker",
    description: "Make 3 high-risk decisions in Business Tycoon",
    requirement: { type: "high_risk_decisions", value: 3, gameType: "business-tycoon" },
    tokenReward: 30,
    badgeIcon: "trending-up",
    rotationSlot: 4, // Thursday
  },
  {
    name: "Reputation Builder",
    description: "End Business Tycoon with 80+ reputation",
    requirement: { type: "reputation", value: 80, gameType: "business-tycoon" },
    tokenReward: 25,
    badgeIcon: "star",
    rotationSlot: 5, // Friday
  },
  {
    name: "Weekend Warrior",
    description: "Complete 2 games in one session",
    requirement: { type: "games_completed", value: 2 },
    tokenReward: 35,
    badgeIcon: "trophy",
    rotationSlot: 6, // Saturday
  },
];

export const WEEKLY_CHALLENGES = [
  {
    name: "Financial Expert",
    description: "Score 2000+ total points in Financial Literacy this week",
    requirement: { type: "total_score", value: 2000, gameType: "financial-literacy" },
    tokenReward: 75,
    badgeIcon: "award",
    rotationSlot: 0, // Week 1
  },
  {
    name: "Business Empire",
    description: "Complete Business Tycoon 3 times this week",
    requirement: { type: "games_completed", value: 3, gameType: "business-tycoon" },
    tokenReward: 100,
    badgeIcon: "building",
    rotationSlot: 1, // Week 2
  },
  {
    name: "Streak Legend",
    description: "Achieve a 10+ streak in any game this week",
    requirement: { type: "max_streak", value: 10 },
    tokenReward: 80,
    badgeIcon: "flame",
    rotationSlot: 2, // Week 3
  },
  {
    name: "Diversified Learner",
    description: "Play both Financial Literacy and Business Tycoon this week",
    requirement: { type: "unique_games", value: 2 },
    tokenReward: 60,
    badgeIcon: "compass",
    rotationSlot: 3, // Week 4
  },
];

// Helper functions
function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getStartOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfWeek(date: Date): Date {
  const end = new Date(date);
  const day = end.getDay();
  end.setDate(end.getDate() + (6 - day));
  end.setHours(23, 59, 59, 999);
  return end;
}

function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.floor((date.getDate() + firstDay.getDay() - 1) / 7);
}

export const challengesRouter = router({
  // Get current daily challenges
  getDailyChallenges: publicProcedure.query(async () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Get the challenge for today
    const todayChallenge = DAILY_CHALLENGES.find(c => c.rotationSlot === dayOfWeek);
    
    // Also include yesterday's and tomorrow's for context
    const yesterdayChallenge = DAILY_CHALLENGES.find(c => c.rotationSlot === ((dayOfWeek + 6) % 7));
    const tomorrowChallenge = DAILY_CHALLENGES.find(c => c.rotationSlot === ((dayOfWeek + 1) % 7));
    
    return {
      today: todayChallenge ? { ...todayChallenge, challengeType: "daily" as const } : null,
      yesterday: yesterdayChallenge ? { ...yesterdayChallenge, challengeType: "daily" as const } : null,
      tomorrow: tomorrowChallenge ? { ...tomorrowChallenge, challengeType: "daily" as const } : null,
      allDaily: DAILY_CHALLENGES.map(c => ({ ...c, challengeType: "daily" as const })),
    };
  }),

  // Get current weekly challenges
  getWeeklyChallenges: publicProcedure.query(async () => {
    const today = new Date();
    const weekOfMonth = getWeekOfMonth(today) % 4;
    
    const thisWeekChallenge = WEEKLY_CHALLENGES.find(c => c.rotationSlot === weekOfMonth);
    const nextWeekChallenge = WEEKLY_CHALLENGES.find(c => c.rotationSlot === ((weekOfMonth + 1) % 4));
    
    return {
      thisWeek: thisWeekChallenge ? { ...thisWeekChallenge, challengeType: "weekly" as const } : null,
      nextWeek: nextWeekChallenge ? { ...nextWeekChallenge, challengeType: "weekly" as const } : null,
      allWeekly: WEEKLY_CHALLENGES.map(c => ({ ...c, challengeType: "weekly" as const })),
    };
  }),

  // Get player's challenge progress
  getMyProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { daily: [], weekly: [] };
    
    const userId = ctx.user.id;
    const today = new Date();
    
    const dayStart = getStartOfDay(today);
    const dayEnd = getEndOfDay(today);
    const weekStart = getStartOfWeek(today);
    const weekEnd = getEndOfWeek(today);
    
    // Get daily progress
    const dailyProgress = await db
      .select()
      .from(gamePlayerChallenges)
      .where(
        and(
          eq(gamePlayerChallenges.playerId, userId),
          gte(gamePlayerChallenges.periodStart, dayStart),
          lte(gamePlayerChallenges.periodEnd, dayEnd)
        )
      );
    
    // Get weekly progress
    const weeklyProgress = await db
      .select()
      .from(gamePlayerChallenges)
      .where(
        and(
          eq(gamePlayerChallenges.playerId, userId),
          gte(gamePlayerChallenges.periodStart, weekStart),
          lte(gamePlayerChallenges.periodEnd, weekEnd)
        )
      );
    
    return {
      daily: dailyProgress,
      weekly: weeklyProgress,
    };
  }),

  // Start tracking a challenge
  startChallenge: protectedProcedure
    .input(z.object({
      challengeType: z.enum(["daily", "weekly"]),
      challengeName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = ctx.user.id;
      const today = new Date();
      
      // Find the challenge definition
      const challenges = input.challengeType === "daily" ? DAILY_CHALLENGES : WEEKLY_CHALLENGES;
      const challenge = challenges.find(c => c.name === input.challengeName);
      
      if (!challenge) {
        throw new Error("Challenge not found");
      }
      
      // Calculate period
      const periodStart = input.challengeType === "daily" ? getStartOfDay(today) : getStartOfWeek(today);
      const periodEnd = input.challengeType === "daily" ? getEndOfDay(today) : getEndOfWeek(today);
      
      // Check if already tracking this challenge
      const existing = await db
        .select()
        .from(gamePlayerChallenges)
        .where(
          and(
            eq(gamePlayerChallenges.playerId, userId),
            gte(gamePlayerChallenges.periodStart, periodStart),
            lte(gamePlayerChallenges.periodEnd, periodEnd)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        return { success: false, message: "Already tracking a challenge for this period", challenge: existing[0] };
      }
      
      // Create new challenge tracking
      const [newChallenge] = await db.insert(gamePlayerChallenges).values({
        playerId: userId,
        challengeId: challenge.rotationSlot || 0,
        periodStart,
        periodEnd,
        currentProgress: 0,
        targetProgress: challenge.requirement.value,
        isCompleted: false,
        tokensAwarded: 0,
      });
      
      return { success: true, message: "Challenge started!", challengeId: (newChallenge as any).insertId };
    }),

  // Update challenge progress (called after game completion)
  updateProgress: protectedProcedure
    .input(z.object({
      gameType: z.string(),
      gameResult: z.object({
        score: z.number().optional(),
        correctAnswers: z.number().optional(),
        totalQuestions: z.number().optional(),
        maxStreak: z.number().optional(),
        cash: z.number().optional(),
        reputation: z.number().optional(),
        highRiskDecisions: z.number().optional(),
        gamesCompleted: z.number().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, completedChallenges: [], totalTokensEarned: 0 };
      
      const userId = ctx.user.id;
      
      // Get all active challenges for this user
      const activeChallenges = await db
        .select()
        .from(gamePlayerChallenges)
        .where(
          and(
            eq(gamePlayerChallenges.playerId, userId),
            eq(gamePlayerChallenges.isCompleted, false)
          )
        );
      
      const completedChallenges: { name: string; tokenReward: number }[] = [];
      
      // Check each challenge
      for (const playerChallenge of activeChallenges) {
        // Determine if daily or weekly based on period length
        const periodLength = playerChallenge.periodEnd.getTime() - playerChallenge.periodStart.getTime();
        const isDaily = periodLength < 2 * 24 * 60 * 60 * 1000; // Less than 2 days
        
        const challenges = isDaily ? DAILY_CHALLENGES : WEEKLY_CHALLENGES;
        const challenge = challenges[playerChallenge.challengeId];
        
        if (!challenge) continue;
        
        // Check if game type matches
        const reqGameType = (challenge.requirement as any).gameType;
        if (reqGameType && reqGameType !== input.gameType) continue;
        
        // Calculate progress based on requirement type
        let progressIncrement = 0;
        const reqType = (challenge.requirement as any).type;
        
        switch (reqType) {
          case "score":
            if (input.gameResult.score && input.gameResult.score >= challenge.requirement.value) {
              progressIncrement = 1;
            }
            break;
          case "total_score":
            progressIncrement = input.gameResult.score || 0;
            break;
          case "streak":
          case "max_streak":
            if (input.gameResult.maxStreak && input.gameResult.maxStreak >= challenge.requirement.value) {
              progressIncrement = 1;
            }
            break;
          case "cash":
            if (input.gameResult.cash && input.gameResult.cash >= challenge.requirement.value) {
              progressIncrement = 1;
            }
            break;
          case "reputation":
            if (input.gameResult.reputation && input.gameResult.reputation >= challenge.requirement.value) {
              progressIncrement = 1;
            }
            break;
          case "correct_answers":
            if (input.gameResult.correctAnswers && input.gameResult.correctAnswers >= challenge.requirement.value) {
              progressIncrement = 1;
            }
            break;
          case "high_risk_decisions":
            progressIncrement = input.gameResult.highRiskDecisions || 0;
            break;
          case "games_completed":
            progressIncrement = input.gameResult.gamesCompleted || 1;
            break;
          case "unique_games":
            progressIncrement = 1; // Each unique game counts as 1
            break;
        }
        
        if (progressIncrement > 0) {
          const newProgress = playerChallenge.currentProgress + progressIncrement;
          const isNowCompleted = newProgress >= playerChallenge.targetProgress;
          
          await db
            .update(gamePlayerChallenges)
            .set({
              currentProgress: newProgress,
              isCompleted: isNowCompleted,
              completedAt: isNowCompleted ? new Date() : null,
              tokensAwarded: isNowCompleted ? challenge.tokenReward : 0,
            })
            .where(eq(gamePlayerChallenges.id, playerChallenge.id));
          
          if (isNowCompleted) {
            completedChallenges.push({
              name: challenge.name,
              tokenReward: challenge.tokenReward,
            });
          }
        }
      }
      
      return {
        success: true,
        completedChallenges,
        totalTokensEarned: completedChallenges.reduce((sum, c) => sum + c.tokenReward, 0),
      };
    }),

  // Get challenge leaderboard
  getLeaderboard: publicProcedure
    .input(z.object({
      challengeType: z.enum(["daily", "weekly"]),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const today = new Date();
      
      const periodStart = input.challengeType === "daily" 
        ? getStartOfDay(today) 
        : getStartOfWeek(today);
      const periodEnd = input.challengeType === "daily"
        ? getEndOfDay(today)
        : getEndOfWeek(today);
      
      // Get completed challenges for this period
      const completions = await db
        .select({
          playerId: gamePlayerChallenges.playerId,
          tokensEarned: sql<number>`SUM(${gamePlayerChallenges.tokensAwarded})`,
          challengesCompleted: sql<number>`COUNT(*)`,
        })
        .from(gamePlayerChallenges)
        .where(
          and(
            eq(gamePlayerChallenges.isCompleted, true),
            gte(gamePlayerChallenges.periodStart, periodStart),
            lte(gamePlayerChallenges.periodEnd, periodEnd)
          )
        )
        .groupBy(gamePlayerChallenges.playerId)
        .orderBy(desc(sql`SUM(${gamePlayerChallenges.tokensAwarded})`))
        .limit(input.limit);
      
      // Get user names
      const leaderboard = await Promise.all(
        completions.map(async (entry, index) => {
          const [user] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, entry.playerId))
            .limit(1);
          
          return {
            rank: index + 1,
            playerId: entry.playerId,
            playerName: user?.name || "Anonymous",
            tokensEarned: entry.tokensEarned,
            challengesCompleted: entry.challengesCompleted,
          };
        })
      );
      
      return leaderboard;
    }),

  // Seed challenges to database (admin function)
  seedChallenges: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Insert daily challenges
    for (const challenge of DAILY_CHALLENGES) {
      await db.insert(gameChallenges).values({
        name: challenge.name,
        description: challenge.description,
        challengeType: "daily",
        gameType: (challenge.requirement as any).gameType || null,
        requirement: challenge.requirement,
        tokenReward: challenge.tokenReward,
        badgeIcon: challenge.badgeIcon,
        rotationSlot: challenge.rotationSlot,
        isActive: true,
      }).onDuplicateKeyUpdate({
        set: {
          description: challenge.description,
          requirement: challenge.requirement,
          tokenReward: challenge.tokenReward,
        },
      });
    }
    
    // Insert weekly challenges
    for (const challenge of WEEKLY_CHALLENGES) {
      await db.insert(gameChallenges).values({
        name: challenge.name,
        description: challenge.description,
        challengeType: "weekly",
        gameType: (challenge.requirement as any).gameType || null,
        requirement: challenge.requirement,
        tokenReward: challenge.tokenReward,
        badgeIcon: challenge.badgeIcon,
        rotationSlot: challenge.rotationSlot,
        isActive: true,
      }).onDuplicateKeyUpdate({
        set: {
          description: challenge.description,
          requirement: challenge.requirement,
          tokenReward: challenge.tokenReward,
        },
      });
    }
    
    return { success: true, message: "Challenges seeded successfully" };
  }),
});
