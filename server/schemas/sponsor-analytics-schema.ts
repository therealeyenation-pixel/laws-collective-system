import { mysqlTable, varchar, int, decimal, datetime, text, boolean, json, index } from 'drizzle-orm/mysql-core';

// Sponsor Analytics Schema for Phase 71

export const sponsorMetrics = mysqlTable('sponsor_metrics', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  channelId: varchar('channel_id', { length: 255 }).notNull(),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).default('0'),
  sponsorshipRevenue: decimal('sponsorship_revenue', { precision: 12, scale: 2 }).default('0'),
  adRevenue: decimal('ad_revenue', { precision: 12, scale: 2 }).default('0'),
  donationRevenue: decimal('donation_revenue', { precision: 12, scale: 2 }).default('0'),
  totalImpressions: int('total_impressions').default(0),
  totalClicks: int('total_clicks').default(0),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }).default('0'),
  ctr: decimal('ctr', { precision: 5, scale: 2 }).default('0'),
  rpm: decimal('rpm', { precision: 8, scale: 2 }).default('0'),
  cpm: decimal('cpm', { precision: 8, scale: 2 }).default('0'),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  channelIdx: index('channel_idx').on(table.channelId),
}));

export const audienceDemographics = mysqlTable('audience_demographics', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  channelId: varchar('channel_id', { length: 255 }).notNull(),
  ageGroup: varchar('age_group', { length: 50 }),
  gender: varchar('gender', { length: 50 }),
  country: varchar('country', { length: 100 }),
  region: varchar('region', { length: 100 }),
  viewerCount: int('viewer_count').default(0),
  engagementScore: decimal('engagement_score', { precision: 5, scale: 2 }).default('0'),
  retentionRate: decimal('retention_rate', { precision: 5, scale: 2 }).default('0'),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  channelIdx: index('channel_idx').on(table.channelId),
}));

export const sponsorships = mysqlTable('sponsorships', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  sponsorName: varchar('sponsor_name', { length: 255 }).notNull(),
  dealAmount: decimal('deal_amount', { precision: 12, scale: 2 }).notNull(),
  startDate: datetime('start_date').notNull(),
  endDate: datetime('end_date').notNull(),
  status: varchar('status', { length: 50 }).default('active'),
  deliverables: json('deliverables'),
  impressionsDelivered: int('impressions_delivered').default(0),
  impressionsRequired: int('impressions_required').default(0),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  statusIdx: index('status_idx').on(table.status),
}));

export const engagementMetrics = mysqlTable('engagement_metrics', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  channelId: varchar('channel_id', { length: 255 }).notNull(),
  likes: int('likes').default(0),
  comments: int('comments').default(0),
  shares: int('shares').default(0),
  views: int('views').default(0),
  watchTime: int('watch_time').default(0),
  avgWatchDuration: decimal('avg_watch_duration', { precision: 8, scale: 2 }).default('0'),
  engagementRate: decimal('engagement_rate', { precision: 5, scale: 2 }).default('0'),
  sentimentScore: decimal('sentiment_score', { precision: 5, scale: 2 }).default('0'),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  channelIdx: index('channel_idx').on(table.channelId),
}));

export const creatorPerformance = mysqlTable('creator_performance', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull().unique(),
  totalFollowers: int('total_followers').default(0),
  totalSubscribers: int('total_subscribers').default(0),
  averageViewsPerVideo: int('average_views_per_video').default(0),
  uploadFrequency: varchar('upload_frequency', { length: 50 }),
  growthRate: decimal('growth_rate', { precision: 5, scale: 2 }).default('0'),
  performanceScore: decimal('performance_score', { precision: 5, scale: 2 }).default('0'),
  tier: varchar('tier', { length: 50 }).default('bronze'),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  tierIdx: index('tier_idx').on(table.tier),
}));

export const paymentTracking = mysqlTable('payment_tracking', {
  id: int('id').primaryKey().autoincrement(),
  creatorId: varchar('creator_id', { length: 255 }).notNull(),
  paymentAmount: decimal('payment_amount', { precision: 12, scale: 2 }).notNull(),
  paymentDate: datetime('payment_date').notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  invoiceId: varchar('invoice_id', { length: 255 }),
  notes: text('notes'),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  statusIdx: index('status_idx').on(table.status),
}));
