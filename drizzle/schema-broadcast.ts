import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, json, decimal, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Phase 62: Broadcast/Radio Module
 * 
 * Comprehensive schema for podcast/radio streaming, scheduling, and analytics
 */

// ============================================================================
// BROADCAST CHANNELS & SHOWS
// ============================================================================

/**
 * Broadcast Channels - Main radio/podcast channels
 */
export const broadcastChannels = mysqlTable("broadcast_channels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: mysqlEnum("category", [
    "education",
    "business",
    "finance",
    "health",
    "entertainment",
    "news",
    "technology",
    "culture",
    "other"
  ]).notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  status: mysqlEnum("status", ["draft", "active", "paused", "archived"]).default("draft"),
  
  // Channel metadata
  coverImageUrl: text("coverImageUrl"),
  bannerImageUrl: text("bannerImageUrl"),
  websiteUrl: text("websiteUrl"),
  socialLinks: json("socialLinks"), // { twitter, instagram, facebook, etc }
  
  // Broadcasting settings
  broadcastFormat: mysqlEnum("broadcastFormat", ["podcast", "live_radio", "hybrid"]).notNull(),
  isMonetized: boolean("isMonetized").default(false),
  monetizationTier: mysqlEnum("monetizationTier", ["free", "basic", "premium"]).default("free"),
  
  // Statistics
  totalEpisodes: int("totalEpisodes").default(0),
  totalListeners: int("totalListeners").default(0),
  totalDownloads: int("totalDownloads").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("broadcast_channels_userId_idx").on(table.userId),
  slugIdx: index("broadcast_channels_slug_idx").on(table.slug),
}));

export type BroadcastChannel = typeof broadcastChannels.$inferSelect;
export type InsertBroadcastChannel = typeof broadcastChannels.$inferInsert;

// ============================================================================
// EPISODES & CONTENT
// ============================================================================

/**
 * Broadcast Episodes - Individual episodes/shows
 */
export const broadcastEpisodes = mysqlTable("broadcast_episodes", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),
  
  // Content
  audioUrl: text("audioUrl").notNull(),
  audioFormat: varchar("audioFormat", { length: 20 }).default("mp3"), // mp3, aac, ogg, wav
  audioDuration: int("audioDuration").notNull(), // seconds
  audioFileSize: int("audioFileSize"), // bytes
  
  // Metadata
  episodeNumber: int("episodeNumber"),
  seasonNumber: int("seasonNumber").default(1),
  transcript: text("transcript"),
  showNotes: text("showNotes"),
  guestName: varchar("guestName", { length: 255 }),
  guestBio: text("guestBio"),
  
  // Publishing
  status: mysqlEnum("status", ["draft", "scheduled", "published", "archived"]).default("draft"),
  publishedAt: timestamp("publishedAt"),
  scheduledPublishAt: timestamp("scheduledPublishAt"),
  
  // Engagement
  viewCount: int("viewCount").default(0),
  downloadCount: int("downloadCount").default(0),
  likeCount: int("likeCount").default(0),
  commentCount: int("commentCount").default(0),
  
  // Monetization
  hasAds: boolean("hasAds").default(false),
  adBreakPositions: json("adBreakPositions"), // [30, 60, 90] - seconds
  sponsorshipInfo: json("sponsorshipInfo"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  channelIdIdx: index("broadcast_episodes_channelId_idx").on(table.channelId),
  statusIdx: index("broadcast_episodes_status_idx").on(table.status),
  publishedAtIdx: index("broadcast_episodes_publishedAt_idx").on(table.publishedAt),
}));

export type BroadcastEpisode = typeof broadcastEpisodes.$inferSelect;
export type InsertBroadcastEpisode = typeof broadcastEpisodes.$inferInsert;

// ============================================================================
// LIVE STREAMING
// ============================================================================

/**
 * Live Broadcasts - Real-time streaming sessions
 */
export const liveBroadcasts = mysqlTable("live_broadcasts", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Stream details
  streamUrl: text("streamUrl"),
  streamKey: varchar("streamKey", { length: 255 }),
  rtmpUrl: text("rtmpUrl"),
  
  // Timing
  scheduledStartTime: timestamp("scheduledStartTime").notNull(),
  scheduledEndTime: timestamp("scheduledEndTime"),
  actualStartTime: timestamp("actualStartTime"),
  actualEndTime: timestamp("actualEndTime"),
  
  // Status
  status: mysqlEnum("status", ["scheduled", "live", "ended", "cancelled"]).default("scheduled"),
  isRecorded: boolean("isRecorded").default(true),
  recordingUrl: text("recordingUrl"),
  
  // Engagement
  currentViewers: int("currentViewers").default(0),
  peakViewers: int("peakViewers").default(0),
  totalViewers: int("totalViewers").default(0),
  
  // Settings
  allowChat: boolean("allowChat").default(true),
  allowComments: boolean("allowComments").default(true),
  isMonetized: boolean("isMonetized").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  channelIdIdx: index("live_broadcasts_channelId_idx").on(table.channelId),
  statusIdx: index("live_broadcasts_status_idx").on(table.status),
  scheduledStartTimeIdx: index("live_broadcasts_scheduledStartTime_idx").on(table.scheduledStartTime),
}));

export type LiveBroadcast = typeof liveBroadcasts.$inferSelect;
export type InsertLiveBroadcast = typeof liveBroadcasts.$inferInsert;

// ============================================================================
// SCHEDULING & AUTOMATION
// ============================================================================

/**
 * Broadcast Schedule - Recurring episode schedules
 */
export const broadcastSchedules = mysqlTable("broadcast_schedules", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull(),
  
  // Schedule details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Recurrence
  recurrencePattern: mysqlEnum("recurrencePattern", [
    "daily",
    "weekly",
    "biweekly",
    "monthly",
    "custom"
  ]).notNull(),
  dayOfWeek: varchar("dayOfWeek", { length: 50 }), // "monday,wednesday,friday"
  dayOfMonth: int("dayOfMonth"),
  customCronExpression: varchar("customCronExpression", { length: 255 }),
  
  // Timing
  publishTime: varchar("publishTime", { length: 10 }), // HH:MM format
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  
  // Status
  isActive: boolean("isActive").default(true),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  
  // Automation
  autoPublish: boolean("autoPublish").default(true),
  notifySubscribers: boolean("notifySubscribers").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  channelIdIdx: index("broadcast_schedules_channelId_idx").on(table.channelId),
}));

export type BroadcastSchedule = typeof broadcastSchedules.$inferSelect;
export type InsertBroadcastSchedule = typeof broadcastSchedules.$inferInsert;

// ============================================================================
// AUDIENCE & ENGAGEMENT
// ============================================================================

/**
 * Listeners/Subscribers - Track channel subscribers
 */
export const broadcastListeners = mysqlTable("broadcast_listeners", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull(),
  userId: int("userId").notNull(),
  
  // Subscription
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["subscribed", "unsubscribed"]).default("subscribed"),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "basic", "premium"]).default("free"),
  
  // Engagement
  totalListeningTime: int("totalListeningTime").default(0), // seconds
  episodesListened: int("episodesListened").default(0),
  lastListenedAt: timestamp("lastListenedAt"),
  
  // Preferences
  notificationsEnabled: boolean("notificationsEnabled").default(true),
  autoDownload: boolean("autoDownload").default(false),
  playbackSpeed: decimal("playbackSpeed", { precision: 3, scale: 2 }).default("1.00"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  channelIdIdx: index("broadcast_listeners_channelId_idx").on(table.channelId),
  userIdIdx: index("broadcast_listeners_userId_idx").on(table.userId),
}));

export type BroadcastListener = typeof broadcastListeners.$inferSelect;
export type InsertBroadcastListener = typeof broadcastListeners.$inferInsert;

/**
 * Episode Interactions - Track user interactions with episodes
 */
export const episodeInteractions = mysqlTable("episode_interactions", {
  id: int("id").autoincrement().primaryKey(),
  episodeId: int("episodeId").notNull(),
  userId: int("userId").notNull(),
  
  // Listening
  listeningTime: int("listeningTime").default(0), // seconds
  completionPercent: decimal("completionPercent", { precision: 5, scale: 2 }).default("0"),
  isCompleted: boolean("isCompleted").default(false),
  
  // Engagement
  liked: boolean("liked").default(false),
  shared: boolean("shared").default(false),
  downloaded: boolean("downloaded").default(false),
  
  // Feedback
  rating: int("rating"), // 1-5 stars
  comment: text("comment"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  episodeIdIdx: index("episode_interactions_episodeId_idx").on(table.episodeId),
  userIdIdx: index("episode_interactions_userId_idx").on(table.userId),
}));

export type EpisodeInteraction = typeof episodeInteractions.$inferSelect;
export type InsertEpisodeInteraction = typeof episodeInteractions.$inferInsert;

// ============================================================================
// ANALYTICS & METRICS
// ============================================================================

/**
 * Broadcast Analytics - Daily analytics snapshots
 */
export const broadcastAnalytics = mysqlTable("broadcast_analytics", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull(),
  episodeId: int("episodeId"),
  
  // Date
  analyticsDate: timestamp("analyticsDate").notNull(),
  
  // Metrics
  newListeners: int("newListeners").default(0),
  returningListeners: int("returningListeners").default(0),
  totalListeningTime: int("totalListeningTime").default(0), // seconds
  averageListeningTime: decimal("averageListeningTime", { precision: 10, scale: 2 }).default("0"),
  
  // Downloads & Streams
  downloads: int("downloads").default(0),
  streams: int("streams").default(0),
  
  // Engagement
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  
  // Geographic
  topCountries: json("topCountries"), // { "US": 100, "UK": 50 }
  topDevices: json("topDevices"), // { "iOS": 60, "Android": 40 }
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  channelIdIdx: index("broadcast_analytics_channelId_idx").on(table.channelId),
  episodeIdIdx: index("broadcast_analytics_episodeId_idx").on(table.episodeId),
  analyticsDateIdx: index("broadcast_analytics_analyticsDate_idx").on(table.analyticsDate),
}));

export type BroadcastAnalytic = typeof broadcastAnalytics.$inferSelect;
export type InsertBroadcastAnalytic = typeof broadcastAnalytics.$inferInsert;

// ============================================================================
// MONETIZATION
// ============================================================================

/**
 * Sponsorships - Sponsorship deals for channels/episodes
 */
export const sponsorships = mysqlTable("sponsorships", {
  id: int("id").autoincrement().primaryKey(),
  channelId: int("channelId").notNull(),
  episodeId: int("episodeId"),
  
  // Sponsor info
  sponsorName: varchar("sponsorName", { length: 255 }).notNull(),
  sponsorWebsite: text("sponsorWebsite"),
  sponsorLogo: text("sponsorLogo"),
  
  // Deal details
  dealType: mysqlEnum("dealType", ["pre_roll", "mid_roll", "post_roll", "native"]).notNull(),
  adScript: text("adScript"),
  adDuration: int("adDuration"), // seconds
  
  // Pricing
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Status
  status: mysqlEnum("status", ["draft", "active", "completed", "cancelled"]).default("draft"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  channelIdIdx: index("sponsorships_channelId_idx").on(table.channelId),
  episodeIdIdx: index("sponsorships_episodeId_idx").on(table.episodeId),
}));

export type Sponsorship = typeof sponsorships.$inferSelect;
export type InsertSponsorship = typeof sponsorships.$inferInsert;

/**
 * Ad Placements - Track ad placements and revenue
 */
export const adPlacements = mysqlTable("ad_placements", {
  id: int("id").autoincrement().primaryKey(),
  episodeId: int("episodeId").notNull(),
  sponsorshipId: int("sponsorshipId"),
  
  // Placement
  position: int("position"), // position in seconds
  type: mysqlEnum("type", ["pre_roll", "mid_roll", "post_roll", "native"]).notNull(),
  
  // Performance
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default("0"), // click-through rate
  
  // Revenue
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  episodeIdIdx: index("ad_placements_episodeId_idx").on(table.episodeId),
  sponsorshipIdIdx: index("ad_placements_sponsorshipId_idx").on(table.sponsorshipId),
}));

export type AdPlacement = typeof adPlacements.$inferSelect;
export type InsertAdPlacement = typeof adPlacements.$inferInsert;

// ============================================================================
// NOTIFICATIONS & ALERTS
// ============================================================================

/**
 * Broadcast Notifications - Subscriber notifications
 */
export const broadcastNotifications = mysqlTable("broadcast_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  channelId: int("channelId").notNull(),
  episodeId: int("episodeId"),
  
  // Notification
  type: mysqlEnum("type", [
    "new_episode",
    "live_broadcast",
    "channel_update",
    "special_announcement",
    "exclusive_content"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  
  // Status
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  
  // Delivery
  sentVia: mysqlEnum("sentVia", ["email", "push", "in_app"]).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("broadcast_notifications_userId_idx").on(table.userId),
  channelIdIdx: index("broadcast_notifications_channelId_idx").on(table.channelId),
}));

export type BroadcastNotification = typeof broadcastNotifications.$inferSelect;
export type InsertBroadcastNotification = typeof broadcastNotifications.$inferInsert;
