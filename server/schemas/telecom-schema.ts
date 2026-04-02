import { mysqlTable, varchar, text, timestamp, int, decimal, boolean, json, enum as mysqlEnum, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Radio Broadcasting Tables
export const radioChannels = mysqlTable("radio_channels", {
  id: int("id").primaryKey().autoincrement(),
  channelName: varchar("channel_name", { length: 255 }).notNull(),
  description: text("description"),
  frequency: varchar("frequency", { length: 50 }).notNull(), // e.g., "88.5 FM", "2.4 GHz"
  frequencyType: mysqlEnum("frequency_type", ["AM", "FM", "VHF", "UHF", "HF", "VLF", "DIGITAL"]).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
}, (table) => ({
  frequencyIdx: index("frequency_idx").on(table.frequency),
}));

export const radioShows = mysqlTable("radio_shows", {
  id: int("id").primaryKey().autoincrement(),
  channelId: int("channel_id").notNull(),
  showName: varchar("show_name", { length: 255 }).notNull(),
  description: text("description"),
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end").notNull(),
  isLive: boolean("is_live").default(false),
  recordingUrl: varchar("recording_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  channelIdx: index("channel_idx").on(table.channelId),
}));

// Two-Way Radio Communications
export const twoWayRadioCalls = mysqlTable("two_way_radio_calls", {
  id: int("id").primaryKey().autoincrement(),
  callerId: int("caller_id").notNull(),
  receiverId: int("receiver_id").notNull(),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: int("duration"), // in seconds
  isEncrypted: boolean("is_encrypted").default(false),
  recordingUrl: varchar("recording_url", { length: 500 }),
  status: mysqlEnum("status", ["INITIATED", "CONNECTED", "ENDED", "FAILED"]).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  callerIdx: index("caller_idx").on(table.callerId),
  receiverIdx: index("receiver_idx").on(table.receiverId),
}));

// Video Conferencing
export const videoConferences = mysqlTable("video_conferences", {
  id: int("id").primaryKey().autoincrement(),
  conferenceId: varchar("conference_id", { length: 100 }).unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  hostId: int("host_id").notNull(),
  maxParticipants: int("max_participants").default(100),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").default(true),
  recordingUrl: varchar("recording_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  hostIdx: index("host_idx").on(table.hostId),
}));

export const videoConferenceParticipants = mysqlTable("video_conference_participants", {
  id: int("id").primaryKey().autoincrement(),
  conferenceId: int("conference_id").notNull(),
  userId: int("user_id").notNull(),
  joinTime: timestamp("join_time").defaultNow(),
  leaveTime: timestamp("leave_time"),
  videoEnabled: boolean("video_enabled").default(true),
  audioEnabled: boolean("audio_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  conferenceIdx: index("conference_idx").on(table.conferenceId),
}));

// Messaging & Chat
export const messages = mysqlTable("messages", {
  id: int("id").primaryKey().autoincrement(),
  senderId: int("sender_id").notNull(),
  recipientId: int("recipient_id"),
  channelId: int("channel_id"),
  content: text("content").notNull(),
  isEncrypted: boolean("is_encrypted").default(false),
  messageType: mysqlEnum("message_type", ["TEXT", "MORSE", "VOICE", "FILE"]).notNull(),
  attachmentUrl: varchar("attachment_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  senderIdx: index("sender_idx").on(table.senderId),
  recipientIdx: index("recipient_idx").on(table.recipientId),
}));

// Emergency/SOS System
export const emergencyIncidents = mysqlTable("emergency_incidents", {
  id: int("id").primaryKey().autoincrement(),
  incidentId: varchar("incident_id", { length: 100 }).unique().notNull(),
  reporterId: int("reporter_id").notNull(),
  incidentType: mysqlEnum("incident_type", ["MEDICAL", "SECURITY", "NATURAL_DISASTER", "TECHNICAL", "OTHER"]).notNull(),
  description: text("description").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  severity: mysqlEnum("severity", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]).notNull(),
  status: mysqlEnum("status", ["REPORTED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"]).notNull(),
  responderIds: json("responder_ids"), // Array of responder IDs
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
}, (table) => ({
  reporterIdx: index("reporter_idx").on(table.reporterId),
  statusIdx: index("status_idx").on(table.status),
}));

// Satellite Connectivity
export const satelliteConnections = mysqlTable("satellite_connections", {
  id: int("id").primaryKey().autoincrement(),
  satelliteId: varchar("satellite_id", { length: 100 }).notNull(),
  satelliteName: varchar("satellite_name", { length: 255 }).notNull(),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  altitude: int("altitude"), // in km
  signalStrength: int("signal_strength"), // 0-100
  isActive: boolean("is_active").default(true),
  lastPingTime: timestamp("last_ping_time"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  satelliteIdx: index("satellite_idx").on(table.satelliteId),
}));

// Global Mapping & Tracking
export const globalTracking = mysqlTable("global_tracking", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  altitude: decimal("altitude", { precision: 10, scale: 2 }),
  speed: decimal("speed", { precision: 8, scale: 2 }), // km/h
  heading: int("heading"), // 0-360 degrees
  accuracy: int("accuracy"), // in meters
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

// Morse Code & Language Translation
export const morseCodeMessages = mysqlTable("morse_code_messages", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  morseCode: text("morse_code").notNull(),
  plainText: text("plain_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export const languageTranslations = mysqlTable("language_translations", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  sourceLanguage: varchar("source_language", { length: 10 }).notNull(),
  targetLanguage: varchar("target_language", { length: 10 }).notNull(),
  sourceText: text("source_text").notNull(),
  translatedText: text("translated_text").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00 to 1.00
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

// Offline Sync Queue
export const offlineSyncQueue = mysqlTable("offline_sync_queue", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  operation: mysqlEnum("operation", ["CREATE", "UPDATE", "DELETE"]).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: int("entity_id"),
  data: json("data").notNull(),
  status: mysqlEnum("status", ["PENDING", "SYNCED", "FAILED"]).default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
  syncedAt: timestamp("synced_at"),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
}));

// User Frequency Preferences
export const userFrequencyPreferences = mysqlTable("user_frequency_preferences", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  frequencyType: mysqlEnum("frequency_type", ["AM", "FM", "VHF", "UHF", "HF", "VLF", "DIGITAL"]).notNull(),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

// Relations
export const radioChannelsRelations = relations(radioChannels, ({ many }) => ({
  shows: many(radioShows),
}));

export const radioShowsRelations = relations(radioShows, ({ one }) => ({
  channel: one(radioChannels, {
    fields: [radioShows.channelId],
    references: [radioChannels.id],
  }),
}));

export const videoConferencesRelations = relations(videoConferences, ({ many }) => ({
  participants: many(videoConferenceParticipants),
}));

export const videoConferenceParticipantsRelations = relations(videoConferenceParticipants, ({ one }) => ({
  conference: one(videoConferences, {
    fields: [videoConferenceParticipants.conferenceId],
    references: [videoConferences.id],
  }),
}));
