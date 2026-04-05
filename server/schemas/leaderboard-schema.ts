import { mysqlTable, varchar, int, decimal, datetime, text, boolean, json, index } from 'drizzle-orm/mysql-core';

// Community Leaderboards & Achievements Schema for Phase 72

export const leaderboards = mysqlTable('leaderboards', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  rank: int('rank').default(0),
  score: decimal('score', { precision: 12, scale: 2 }).default('0'),
  category: varchar('category', { length: 100 }).notNull(),
  timeframe: varchar('timeframe', { length: 50 }).default('all_time'),
  totalPoints: int('total_points').default(0),
  streakDays: int('streak_days').default(0),
  achievements: int('achievements').default(0),
  isAnonymous: boolean('is_anonymous').default(false),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.category),
  rankIdx: index('rank_idx').on(table.rank),
  scoreIdx: index('score_idx').on(table.score),
}));

export const achievements = mysqlTable('achievements', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  achievementType: varchar('achievement_type', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  badge: varchar('badge', { length: 255 }),
  points: int('points').default(0),
  unlockedAt: datetime('unlocked_at').notNull(),
  rarity: varchar('rarity', { length: 50 }).default('common'),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  typeIdx: index('type_idx').on(table.achievementType),
}));

export const badges = mysqlTable('badges', {
  id: int('id').primaryKey().autoincrement(),
  badgeId: varchar('badge_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 255 }),
  category: varchar('category', { length: 100 }).notNull(),
  requirements: json('requirements'),
  points: int('points').default(0),
  rarity: varchar('rarity', { length: 50 }).default('common'),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.category),
}));

export const userAchievements = mysqlTable('user_achievements', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  badgeId: varchar('badge_id', { length: 255 }).notNull(),
  unlockedAt: datetime('unlocked_at').notNull(),
  progress: decimal('progress', { precision: 5, scale: 2 }).default('0'),
  isCompleted: boolean('is_completed').default(false),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  badgeIdx: index('badge_idx').on(table.badgeId),
}));

export const leaderboardCategories = mysqlTable('leaderboard_categories', {
  id: int('id').primaryKey().autoincrement(),
  categoryName: varchar('category_name', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 255 }),
  scoringMethod: varchar('scoring_method', { length: 100 }).notNull(),
  resetFrequency: varchar('reset_frequency', { length: 50 }).default('monthly'),
  isActive: boolean('is_active').default(true),
  createdAt: datetime('created_at').defaultNow(),
});

export const socialSharing = mysqlTable('social_sharing', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  achievementId: int('achievement_id').notNull(),
  platform: varchar('platform', { length: 50 }).notNull(),
  shareUrl: varchar('share_url', { length: 500 }),
  sharedAt: datetime('shared_at').notNull(),
  reactions: int('reactions').default(0),
  comments: int('comments').default(0),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  platformIdx: index('platform_idx').on(table.platform),
}));

export const streaks = mysqlTable('streaks', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull().unique(),
  currentStreak: int('current_streak').default(0),
  longestStreak: int('longest_streak').default(0),
  lastActivityDate: datetime('last_activity_date'),
  streakType: varchar('streak_type', { length: 50 }).notNull(),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
}));

export const pointsHistory = mysqlTable('points_history', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  pointsEarned: int('points_earned').notNull(),
  reason: varchar('reason', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  balanceBefore: int('balance_before').default(0),
  balanceAfter: int('balance_after').default(0),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  categoryIdx: index('category_idx').on(table.category),
}));

export const milestones = mysqlTable('milestones', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  milestoneType: varchar('milestone_type', { length: 100 }).notNull(),
  value: int('value').notNull(),
  description: text('description'),
  rewardPoints: int('reward_points').default(0),
  achievedAt: datetime('achieved_at').notNull(),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  typeIdx: index('type_idx').on(table.milestoneType),
}));
