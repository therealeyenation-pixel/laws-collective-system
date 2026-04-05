import { mysqlTable, varchar, text, timestamp, int, boolean, bigint, json, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Live Chat Rooms (one per broadcast/radio show)
export const chatRooms = mysqlTable(
  "chat_rooms",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    broadcastId: varchar("broadcast_id", { length: 36 }).notNull(),
    broadcastType: varchar("broadcast_type", { length: 50 }).notNull(), // 'radio', 'theater', 'video_conference'
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true),
    maxParticipants: int("max_participants").default(5000),
    currentParticipants: int("current_participants").default(0),
    moderators: json("moderators").$type<string[]>().default([]),
    bannedUsers: json("banned_users").$type<string[]>().default([]),
    settings: json("settings").default({
      allowEmoji: true,
      allowLinks: true,
      requireModeration: false,
      slowMode: false,
      slowModeInterval: 0,
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    broadcastIdIdx: index("broadcast_id_idx").on(table.broadcastId),
    isActiveIdx: index("is_active_idx").on(table.isActive),
  })
);

// Chat Messages
export const chatMessages = mysqlTable(
  "chat_messages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    roomId: varchar("room_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    username: varchar("username", { length: 255 }).notNull(),
    message: text("message").notNull(),
    messageType: varchar("message_type", { length: 50 }).default("text"), // 'text', 'system', 'moderation'
    reactions: json("reactions").$type<Record<string, number>>().default({}),
    isEdited: boolean("is_edited").default(false),
    isDeleted: boolean("is_deleted").default(false),
    deletedReason: varchar("deleted_reason", { length: 255 }),
    flaggedForReview: boolean("flagged_for_review").default(false),
    flagReason: varchar("flag_reason", { length: 255 }),
    sentiment: varchar("sentiment", { length: 50 }), // 'positive', 'neutral', 'negative'
    spamScore: int("spam_score").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    roomIdIdx: index("room_id_idx").on(table.roomId),
    userIdIdx: index("user_id_idx").on(table.userId),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

// Chat User Presence
export const chatPresence = mysqlTable(
  "chat_presence",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    roomId: varchar("room_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    username: varchar("username", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).default("active"), // 'active', 'idle', 'away'
    joinedAt: timestamp("joined_at").defaultNow(),
    lastActivityAt: timestamp("last_activity_at").defaultNow(),
    messageCount: int("message_count").default(0),
    isModerator: boolean("is_moderator").default(false),
    userRole: varchar("user_role", { length: 50 }).default("viewer"), // 'viewer', 'contributor', 'moderator', 'broadcaster'
  },
  (table) => ({
    roomIdIdx: index("room_id_idx").on(table.roomId),
    userIdIdx: index("user_id_idx").on(table.userId),
  })
);

// Chat Moderation Actions
export const moderationActions = mysqlTable(
  "moderation_actions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    roomId: varchar("room_id", { length: 36 }).notNull(),
    moderatorId: varchar("moderator_id", { length: 36 }).notNull(),
    targetUserId: varchar("target_user_id", { length: 36 }).notNull(),
    targetMessageId: varchar("target_message_id", { length: 36 }),
    actionType: varchar("action_type", { length: 50 }).notNull(), // 'warn', 'mute', 'kick', 'ban', 'delete_message'
    duration: int("duration"), // in seconds, null for permanent
    reason: text("reason").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => ({
    roomIdIdx: index("room_id_idx").on(table.roomId),
    targetUserIdIdx: index("target_user_id_idx").on(table.targetUserId),
  })
);

// Chat Engagement Analytics
export const chatAnalytics = mysqlTable(
  "chat_analytics",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    roomId: varchar("room_id", { length: 36 }).notNull(),
    totalMessages: int("total_messages").default(0),
    totalParticipants: int("total_participants").default(0),
    averageMessageLength: int("average_message_length").default(0),
    peakParticipants: int("peak_participants").default(0),
    engagementScore: int("engagement_score").default(0),
    sentimentBreakdown: json("sentiment_breakdown").default({
      positive: 0,
      neutral: 0,
      negative: 0,
    }),
    topContributors: json("top_contributors").$type<Array<{ userId: string; messageCount: number }>>().default([]),
    spamDetected: int("spam_detected").default(0),
    moderationActions: int("moderation_actions").default(0),
    recordedAt: timestamp("recorded_at").defaultNow(),
  },
  (table) => ({
    roomIdIdx: index("room_id_idx").on(table.roomId),
  })
);

// Chat Emojis & Reactions
export const chatEmojis = mysqlTable(
  "chat_emojis",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    emoji: varchar("emoji", { length: 10 }).notNull().unique(),
    category: varchar("category", { length: 50 }).notNull(), // 'smile', 'love', 'fire', 'thumbs', etc.
    usageCount: bigint("usage_count", { mode: "number" }).default(0),
    isCustom: boolean("is_custom").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// Relations
export const chatRoomsRelations = relations(chatRooms, ({ many }) => ({
  messages: many(chatMessages),
  presence: many(chatPresence),
  moderationActions: many(moderationActions),
  analytics: many(chatAnalytics),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id],
  }),
}));

export const chatPresenceRelations = relations(chatPresence, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatPresence.roomId],
    references: [chatRooms.id],
  }),
}));
