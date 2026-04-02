import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

export const leaderboards = router({
  // Get global leaderboard
  getGlobalLeaderboard: publicProcedure
    .input(z.object({
      category: z.string().default('revenue'),
      timeframe: z.enum(['day', 'week', 'month', 'year', 'all_time']).default('month'),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      return {
        leaderboard: [
          { rank: 1, displayName: 'Creator Alpha', score: 125000, points: 5000, streak: 45, achievements: 28 },
          { rank: 2, displayName: 'Creator Beta', score: 98500, points: 4200, streak: 32, achievements: 24 },
          { rank: 3, displayName: 'Creator Gamma', score: 87200, points: 3800, streak: 28, achievements: 22 },
          { rank: 4, displayName: 'Creator Delta', score: 76500, points: 3400, streak: 21, achievements: 20 },
          { rank: 5, displayName: 'Creator Epsilon', score: 65300, points: 2900, streak: 18, achievements: 18 },
        ],
        category: input.category,
        timeframe: input.timeframe,
        totalParticipants: 5000,
      };
    }),

  // Get creator's rank
  getCreatorRank: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      category: z.string().default('revenue'),
    }))
    .query(async ({ input }) => {
      return {
        rank: 42,
        displayName: 'Your Creator Name',
        score: 45000,
        percentile: 99.2,
        pointsToNextRank: 2500,
        category: input.category,
      };
    }),

  // Get achievements
  getAchievements: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      return {
        unlockedAchievements: [
          { id: 1, title: 'First Steps', description: 'Upload your first broadcast', badge: '🎬', points: 100, unlockedAt: new Date('2026-01-15') },
          { id: 2, title: 'Milestone 1K', description: 'Reach 1,000 viewers', badge: '🌟', points: 250, unlockedAt: new Date('2026-02-01') },
          { id: 3, title: 'Engagement Master', description: 'Achieve 10% engagement rate', badge: '🔥', points: 500, unlockedAt: new Date('2026-02-20') },
        ],
        lockedAchievements: [
          { id: 4, title: 'Viral Sensation', description: 'Reach 100,000 viewers', badge: '🚀', points: 1000, progress: 45 },
          { id: 5, title: 'Revenue Champion', description: 'Earn $10,000 in revenue', badge: '💰', points: 1500, progress: 32 },
        ],
        totalPoints: 850,
        totalAchievements: 3,
      };
    }),

  // Get badges
  getAllBadges: publicProcedure.query(async () => {
    return {
      badges: [
        { id: 1, name: 'Starter', description: 'Complete your first upload', icon: '🎯', rarity: 'common' },
        { id: 2, name: 'Influencer', description: 'Reach 10K followers', icon: '👑', rarity: 'rare' },
        { id: 3, name: 'Legend', description: 'Maintain 100-day streak', icon: '⭐', rarity: 'epic' },
        { id: 4, name: 'Philanthropist', description: 'Donate $1,000 to community', icon: '❤️', rarity: 'rare' },
        { id: 5, name: 'Innovator', description: 'Launch new content format', icon: '💡', rarity: 'legendary' },
      ],
    };
  }),

  // Get leaderboard categories
  getCategories: publicProcedure.query(async () => {
    return {
      categories: [
        { name: 'revenue', description: 'Highest earning creators', icon: '💰' },
        { name: 'engagement', description: 'Most engaged audiences', icon: '🔥' },
        { name: 'growth', description: 'Fastest growing creators', icon: '📈' },
        { name: 'consistency', description: 'Most consistent uploaders', icon: '✅' },
        { name: 'community', description: 'Most community contributions', icon: '🤝' },
      ],
    };
  }),

  // Get creator streak
  getStreak: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      return {
        currentStreak: 45,
        longestStreak: 120,
        lastActivityDate: new Date(),
        streakType: 'daily_uploads',
        nextMilestone: 50,
        pointsForNextMilestone: 500,
      };
    }),

  // Get points history
  getPointsHistory: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      return {
        history: [
          { date: new Date(), reason: 'Video upload', points: 100, category: 'content' },
          { date: new Date(), reason: 'Engagement milestone', points: 250, category: 'engagement' },
          { date: new Date(), reason: 'Sponsorship deal', points: 500, category: 'revenue' },
        ],
        totalPoints: 850,
      };
    }),

  // Get milestones
  getMilestones: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      return {
        achievedMilestones: [
          { type: 'followers', value: 10000, rewardPoints: 500, achievedAt: new Date('2026-02-01') },
          { type: 'revenue', value: 5000, rewardPoints: 750, achievedAt: new Date('2026-02-15') },
          { type: 'uploads', value: 50, rewardPoints: 300, achievedAt: new Date('2026-02-28') },
        ],
        nextMilestones: [
          { type: 'followers', value: 25000, pointsUntil: 15000 },
          { type: 'revenue', value: 10000, pointsUntil: 5000 },
        ],
      };
    }),

  // Get leaderboard by category
  getLeaderboardByCategory: publicProcedure
    .input(z.object({
      category: z.string(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      return {
        category: input.category,
        leaderboard: [
          { rank: 1, displayName: 'Top Creator', score: 150000, badge: '👑' },
          { rank: 2, displayName: 'Rising Star', score: 120000, badge: '⭐' },
          { rank: 3, displayName: 'Consistent Pro', score: 95000, badge: '✅' },
        ],
      };
    }),

  // Share achievement
  shareAchievement: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      achievementId: z.number(),
      platform: z.enum(['twitter', 'facebook', 'instagram', 'linkedin']),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        shareUrl: `https://social.example.com/share/${input.achievementId}`,
        message: 'Achievement shared successfully',
      };
    }),

  // Update points
  updatePoints: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      points: z.number(),
      reason: z.string(),
      category: z.string(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        newBalance: 1200,
        pointsAdded: input.points,
      };
    }),

  // Unlock achievement
  unlockAchievement: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      achievementId: z.number(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        achievement: {
          id: input.achievementId,
          title: 'New Achievement',
          points: 500,
          badge: '🎉',
        },
        notification: 'Congratulations! You unlocked a new achievement!',
      };
    }),

  // Get leaderboard friends
  getFriendsLeaderboard: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      category: z.string().default('revenue'),
    }))
    .query(async ({ input }) => {
      return {
        friendsLeaderboard: [
          { rank: 1, displayName: 'Friend 1', score: 85000, isYou: false },
          { rank: 2, displayName: 'You', score: 45000, isYou: true },
          { rank: 3, displayName: 'Friend 2', score: 32000, isYou: false },
        ],
      };
    }),

  // Get achievement progress
  getAchievementProgress: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      achievementId: z.number(),
    }))
    .query(async ({ input }) => {
      return {
        achievement: {
          id: input.achievementId,
          title: 'Revenue Champion',
          description: 'Earn $10,000 in revenue',
        },
        progress: 65,
        currentValue: 6500,
        targetValue: 10000,
        pointsReward: 1000,
      };
    }),

  // Get trending achievements
  getTrendingAchievements: publicProcedure.query(async () => {
    return {
      trending: [
        { id: 1, title: 'Viral Sensation', unlockedCount: 1250, trend: 'up' },
        { id: 2, title: 'Revenue Champion', unlockedCount: 890, trend: 'stable' },
        { id: 3, title: 'Community Hero', unlockedCount: 650, trend: 'up' },
      ],
    };
  }),

  // Get comparison with other creators
  getComparison: protectedProcedure
    .input(z.object({
      creatorId: z.string(),
      compareWithId: z.string(),
    }))
    .query(async ({ input }) => {
      return {
        you: {
          displayName: 'Your Name',
          rank: 42,
          score: 45000,
          achievements: 12,
          streak: 30,
        },
        other: {
          displayName: 'Other Creator',
          rank: 38,
          score: 52000,
          achievements: 15,
          streak: 45,
        },
        comparison: {
          scoreGap: 7000,
          achievementGap: 3,
          streakGap: 15,
        },
      };
    }),
});
