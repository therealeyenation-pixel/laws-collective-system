import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Business Entities created through the system
 * Part of the closed-loop economic system
 */
export const businessEntities = mysqlTable("business_entities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  entityType: mysqlEnum("entityType", ["trust", "llc", "corporation", "collective"]).notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused", "archived"]).default("draft").notNull(),
  trustLevel: int("trustLevel").default(1).notNull(),
  description: text("description"),
  financialStructure: json("financialStructure"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BusinessEntity = typeof businessEntities.$inferSelect;
export type InsertBusinessEntity = typeof businessEntities.$inferInsert;

/**
 * Simulator Sessions - Track user progress through educational simulators
 */
export const simulatorSessions = mysqlTable("simulator_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  simulatorType: mysqlEnum("simulatorType", ["business_setup", "financial_management", "entity_operations", "grant_creation"]).notNull(),
  currentTurn: int("currentTurn").default(0).notNull(),
  totalTurns: int("totalTurns").default(12).notNull(),
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned"]).default("in_progress").notNull(),
  score: int("score").default(0).notNull(),
  gameState: json("gameState"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type SimulatorSession = typeof simulatorSessions.$inferSelect;
export type InsertSimulatorSession = typeof simulatorSessions.$inferInsert;

/**
 * Certificates issued upon simulator completion
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  simulatorSessionId: int("simulatorSessionId").notNull(),
  certificateType: varchar("certificateType", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  certificateHash: varchar("certificateHash", { length: 255 }).notNull(),
  verificationUrl: text("verificationUrl"),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

/**
 * LuvLedger - Automated Asset Management System
 */
export const luvLedgerAccounts = mysqlTable("luv_ledger_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  businessEntityId: int("businessEntityId"),
  accountType: mysqlEnum("accountType", ["personal", "entity", "collective", "trust"]).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  balance: decimal("balance", { precision: 18, scale: 8 }).default("0").notNull(),
  allocationPercentage: decimal("allocationPercentage", { precision: 5, scale: 2 }).default("0").notNull(),
  status: mysqlEnum("status", ["active", "frozen", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LuvLedgerAccount = typeof luvLedgerAccounts.$inferSelect;
export type InsertLuvLedgerAccount = typeof luvLedgerAccounts.$inferInsert;

/**
 * LuvLedger Transactions
 */
export const luvLedgerTransactions = mysqlTable("luv_ledger_transactions", {
  id: int("id").autoincrement().primaryKey(),
  fromAccountId: int("fromAccountId").notNull(),
  toAccountId: int("toAccountId").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  transactionType: mysqlEnum("transactionType", ["income", "allocation", "distribution", "fee", "adjustment"]).notNull(),
  description: text("description"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
});

export type LuvLedgerTransaction = typeof luvLedgerTransactions.$inferSelect;
export type InsertLuvLedgerTransaction = typeof luvLedgerTransactions.$inferInsert;

/**
 * Blockchain Records - Immutable audit trail
 */
export const blockchainRecords = mysqlTable("blockchain_records", {
  id: int("id").autoincrement().primaryKey(),
  recordType: mysqlEnum("recordType", ["transaction", "certificate", "entity_creation", "trust_update", "allocation_change"]).notNull(),
  referenceId: int("referenceId").notNull(),
  blockchainHash: varchar("blockchainHash", { length: 255 }).notNull().unique(),
  previousHash: varchar("previousHash", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  data: json("data"),
});

export type BlockchainRecord = typeof blockchainRecords.$inferSelect;
export type InsertBlockchainRecord = typeof blockchainRecords.$inferInsert;

/**
 * Multi-Level Trust Relationships
 */
export const trustRelationships = mysqlTable("trust_relationships", {
  id: int("id").autoincrement().primaryKey(),
  parentUserId: int("parentUserId").notNull(),
  childUserId: int("childUserId").notNull(),
  parentEntityId: int("parentEntityId"),
  childEntityId: int("childEntityId"),
  trustLevel: int("trustLevel").notNull(),
  permissions: json("permissions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrustRelationship = typeof trustRelationships.$inferSelect;
export type InsertTrustRelationship = typeof trustRelationships.$inferInsert;
/**
 * Organizational Structure - 10 Departments
 */
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  managerId: int("managerId"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * Staff Members - Managers, Administrators, Admin Leads
 */
export const staffMembers = mysqlTable("staff_members", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  departmentId: int("departmentId").notNull(),
  role: mysqlEnum("role", ["manager", "administrator", "admin_lead", "teacher", "staff"]).notNull(),
  title: varchar("title", { length: 100 }),
  status: mysqlEnum("status", ["active", "inactive", "on_leave"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StaffMember = typeof staffMembers.$inferSelect;
export type InsertStaffMember = typeof staffMembers.$inferInsert;

/**
 * Academy Curriculum - Subjects and Courses
 */
export const curriculumSubjects = mysqlTable("curriculum_subjects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // "traditional", "business", "practical"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CurriculumSubject = typeof curriculumSubjects.$inferSelect;
export type InsertCurriculumSubject = typeof curriculumSubjects.$inferInsert;

/**
 * Courses - Organized by subject, level, and age group
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  subjectId: int("subjectId").notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).notNull(),
  ageGroup: varchar("ageGroup", { length: 50 }), // "5-8", "9-12", "13-16", "17+"
  description: text("description"),
  instructor: varchar("instructor", { length: 100 }),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Student Enrollments - Track course progress
 */
export const studentEnrollments = mysqlTable("student_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  status: mysqlEnum("status", ["enrolled", "in_progress", "completed", "dropped"]).default("enrolled"),
  progressPercentage: int("progressPercentage").default(0),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type StudentEnrollment = typeof studentEnrollments.$inferSelect;
export type InsertStudentEnrollment = typeof studentEnrollments.$inferInsert;


/**
 * Cryptocurrency Wallets - Store user crypto addresses and balances
 */
export const cryptoWallets = mysqlTable("crypto_wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletAddress: varchar("walletAddress", { length: 255 }).notNull().unique(),
  walletType: mysqlEnum("walletType", ["bitcoin", "ethereum", "solana", "other"]).notNull(),
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0").notNull(),
  publicKey: varchar("publicKey", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoWallet = typeof cryptoWallets.$inferInsert;

/**
 * Token Economy - Track system tokens earned and spent
 */
export const tokenAccounts = mysqlTable("token_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenBalance: decimal("tokenBalance", { precision: 20, scale: 8 }).default("0").notNull(),
  totalEarned: decimal("totalEarned", { precision: 20, scale: 8 }).default("0").notNull(),
  totalSpent: decimal("totalSpent", { precision: 20, scale: 8 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TokenAccount = typeof tokenAccounts.$inferSelect;
export type InsertTokenAccount = typeof tokenAccounts.$inferInsert;

/**
 * Token Transactions - Track all token movements
 */
export const tokenTransactions = mysqlTable("token_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  transactionType: mysqlEnum("transactionType", ["earned", "spent", "transferred", "converted", "reward"]).notNull(),
  source: varchar("source", { length: 255 }),
  description: text("description"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;

/**
 * Game Sessions - Track simulator game play and token earning
 */
export const gameSessions = mysqlTable("game_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  simulatorId: int("simulatorId").notNull(),
  gameType: varchar("gameType", { length: 100 }).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  score: int("score").default(0).notNull(),
  tokensEarned: decimal("tokensEarned", { precision: 20, scale: 8 }).default("0").notNull(),
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned"]).default("in_progress").notNull(),
  gameState: json("gameState"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;

/**
 * Achievements & Badges - Track player accomplishments
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementType: varchar("achievementType", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  tokensReward: decimal("tokensReward", { precision: 20, scale: 8 }).default("0").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * Autonomous Business Operations - Track AI-driven business decisions
 */
export const autonomousOperations = mysqlTable("autonomous_operations", {
  id: int("id").autoincrement().primaryKey(),
  businessEntityId: int("businessEntityId").notNull(),
  operationType: varchar("operationType", { length: 100 }).notNull(),
  decision: json("decision").notNull(),
  reasoning: text("reasoning"),
  outcome: json("outcome"),
  status: mysqlEnum("status", ["pending", "executed", "reviewed", "rejected"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutonomousOperation = typeof autonomousOperations.$inferSelect;
export type InsertAutonomousOperation = typeof autonomousOperations.$inferInsert;

/**
 * Generated Curriculum - AI-generated courses and content
 */
export const generatedCurriculum = mysqlTable("generated_curriculum", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  generationVersion: int("generationVersion").default(1).notNull(),
  generatedBy: varchar("generatedBy", { length: 100 }).default("ai").notNull(),
  contentData: json("contentData").notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type GeneratedCurriculum = typeof generatedCurriculum.$inferSelect;
export type InsertGeneratedCurriculum = typeof generatedCurriculum.$inferInsert;

/**
 * Offline Sync Queue - Track operations pending sync
 */
export const syncQueue = mysqlTable("sync_queue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  operationType: varchar("operationType", { length: 100 }).notNull(),
  data: json("data").notNull(),
  status: mysqlEnum("status", ["pending", "synced", "failed"]).default("pending").notNull(),
  retryCount: int("retryCount").default(0).notNull(),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  syncedAt: timestamp("syncedAt"),
});

export type SyncQueue = typeof syncQueue.$inferSelect;
export type InsertSyncQueue = typeof syncQueue.$inferInsert;

/**
 * Activity Audit Trail - Complete log of all system activities
 */
export const activityAuditTrail = mysqlTable("activity_audit_trail", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  activityType: varchar("activityType", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: int("entityId"),
  action: varchar("action", { length: 100 }).notNull(),
  details: json("details"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityAuditTrail = typeof activityAuditTrail.$inferSelect;
export type InsertActivityAuditTrail = typeof activityAuditTrail.$inferInsert;

/**
 * Cryptocurrency Transactions - Track all crypto payments and transfers
 */
export const cryptoTransactions = mysqlTable("crypto_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletId: int("walletId").notNull(),
  transactionHash: varchar("transactionHash", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  transactionType: mysqlEnum("transactionType", ["deposit", "withdrawal", "payment", "transfer"]).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  confirmations: int("confirmations").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
});

export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type InsertCryptoTransaction = typeof cryptoTransactions.$inferInsert;


/**
 * ============================================
 * LUV LEARNING ACADEMY - K-12 Sovereign Education System
 * ============================================
 */

/**
 * Academy Houses - Three Learning Houses by Age Group
 */
export const academyHouses = mysqlTable("academy_houses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  ageRange: varchar("ageRange", { length: 20 }).notNull(), // "K-5", "6-8", "9-12"
  gradeRange: varchar("gradeRange", { length: 20 }).notNull(), // "K-5", "6-8", "9-12"
  ceremonialName: varchar("ceremonialName", { length: 150 }), // "House of Wonder", etc.
  iconPath: varchar("iconPath", { length: 255 }),
  colorTheme: varchar("colorTheme", { length: 50 }),
  status: mysqlEnum("status", ["active", "inactive", "coming_soon"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AcademyHouse = typeof academyHouses.$inferSelect;
export type InsertAcademyHouse = typeof academyHouses.$inferInsert;

/**
 * Divine STEM Modules - Core Curriculum Categories
 */
export const divineStemModules = mysqlTable("divine_stem_modules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  ceremonialTitle: varchar("ceremonialTitle", { length: 200 }), // "Science of Origin & Observation"
  iconEmoji: varchar("iconEmoji", { length: 10 }),
  category: mysqlEnum("category", ["stem", "ceremonial", "entrepreneurial", "creative", "language"]).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "coming_soon"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DivineStemModule = typeof divineStemModules.$inferSelect;
export type InsertDivineStemModule = typeof divineStemModules.$inferInsert;

/**
 * Academy Courses - Courses within Divine STEM Modules
 */
export const academyCourses = mysqlTable("academy_courses", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  moduleId: int("moduleId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  scrollTitle: varchar("scrollTitle", { length: 200 }), // Ceremonial scroll name
  level: mysqlEnum("level", ["foundational", "developing", "mastery"]).notNull(),
  estimatedHours: int("estimatedHours").default(10),
  tokensReward: int("tokensReward").default(100),
  prerequisites: json("prerequisites"), // Array of course IDs
  learningObjectives: json("learningObjectives"),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AcademyCourse = typeof academyCourses.$inferSelect;
export type InsertAcademyCourse = typeof academyCourses.$inferInsert;

/**
 * Academy Lessons - Individual lessons within courses
 */
export const academyLessons = mysqlTable("academy_lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  scrollName: varchar("scrollName", { length: 200 }), // Ceremonial scroll name
  content: text("content"),
  contentType: mysqlEnum("contentType", ["text", "video", "interactive", "ceremony", "practice"]).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  estimatedMinutes: int("estimatedMinutes").default(30),
  tokensReward: int("tokensReward").default(10),
  resources: json("resources"), // Links, files, etc.
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AcademyLesson = typeof academyLessons.$inferSelect;
export type InsertAcademyLesson = typeof academyLessons.$inferInsert;

/**
 * House of Many Tongues - Language Learning Module
 */
export const academyLanguages = mysqlTable("academy_languages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nativeName: varchar("nativeName", { length: 100 }), // Name in the language itself
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  category: mysqlEnum("category", ["indigenous", "ancestral_flame", "global_trade"]).notNull(),
  description: text("description"),
  culturalContext: text("culturalContext"),
  iconEmoji: varchar("iconEmoji", { length: 10 }),
  status: mysqlEnum("status", ["active", "inactive", "coming_soon"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AcademyLanguage = typeof academyLanguages.$inferSelect;
export type InsertAcademyLanguage = typeof academyLanguages.$inferInsert;

/**
 * Language Lessons - Lessons for each language
 */
export const languageLessons = mysqlTable("language_lessons", {
  id: int("id").autoincrement().primaryKey(),
  languageId: int("languageId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).notNull(),
  lessonType: mysqlEnum("lessonType", ["vocabulary", "pronunciation", "conversation", "ceremony", "story", "chant"]).notNull(),
  content: json("content"), // Structured lesson content
  audioUrl: varchar("audioUrl", { length: 500 }),
  orderIndex: int("orderIndex").default(0).notNull(),
  tokensReward: int("tokensReward").default(15),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LanguageLesson = typeof languageLessons.$inferSelect;
export type InsertLanguageLesson = typeof languageLessons.$inferInsert;

/**
 * Student Academy Profiles - Student information and preferences
 */
export const studentProfiles = mysqlTable("student_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  guardianUserId: int("guardianUserId"), // Parent/guardian user ID
  houseId: int("houseId"), // Assigned house
  displayName: varchar("displayName", { length: 100 }),
  gradeLevel: varchar("gradeLevel", { length: 10 }),
  birthYear: int("birthYear"),
  primaryLanguageId: int("primaryLanguageId"),
  selectedLanguages: json("selectedLanguages"), // Array of language IDs they're learning
  ceremonialPath: varchar("ceremonialPath", { length: 100 }), // Optional ceremonial designation
  preferences: json("preferences"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

/**
 * Student Progress - Track progress through courses and lessons
 */
export const studentProgress = mysqlTable("student_progress", {
  id: int("id").autoincrement().primaryKey(),
  studentProfileId: int("studentProfileId").notNull(),
  courseId: int("courseId"),
  lessonId: int("lessonId"),
  languageLessonId: int("languageLessonId"),
  progressType: mysqlEnum("progressType", ["course", "lesson", "language"]).notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "mastered"]).default("not_started").notNull(),
  progressPercentage: int("progressPercentage").default(0),
  score: int("score"),
  tokensEarned: int("tokensEarned").default(0),
  timeSpentMinutes: int("timeSpentMinutes").default(0),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = typeof studentProgress.$inferInsert;

/**
 * Living Scrolls - Student-created vocabulary and learning records
 */
export const livingScrolls = mysqlTable("living_scrolls", {
  id: int("id").autoincrement().primaryKey(),
  studentProfileId: int("studentProfileId").notNull(),
  scrollType: mysqlEnum("scrollType", ["voice_scroll", "house_lexicon", "translation_book", "mastery_scroll"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  languageId: int("languageId"),
  content: json("content"), // Vocabulary, phrases, notes
  entriesCount: int("entriesCount").default(0),
  isPublic: boolean("isPublic").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LivingScroll = typeof livingScrolls.$inferSelect;
export type InsertLivingScroll = typeof livingScrolls.$inferInsert;

/**
 * Mastery Certificates - Blockchain-anchored completion certificates
 */
export const masteryCertificates = mysqlTable("mastery_certificates", {
  id: int("id").autoincrement().primaryKey(),
  studentProfileId: int("studentProfileId").notNull(),
  certificateType: mysqlEnum("certificateType", ["course_completion", "house_graduation", "language_mastery", "stem_mastery", "sovereign_diploma"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  courseId: int("courseId"),
  houseId: int("houseId"),
  languageId: int("languageId"),
  level: varchar("level", { length: 50 }),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  verificationCode: varchar("verificationCode", { length: 100 }).unique(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  metadata: json("metadata"),
});

export type MasteryCertificate = typeof masteryCertificates.$inferSelect;
export type InsertMasteryCertificate = typeof masteryCertificates.$inferInsert;

/**
 * Guardian Dashboard - Parent/guardian access and controls
 */
export const guardianAccess = mysqlTable("guardian_access", {
  id: int("id").autoincrement().primaryKey(),
  guardianUserId: int("guardianUserId").notNull(),
  studentProfileId: int("studentProfileId").notNull(),
  accessLevel: mysqlEnum("accessLevel", ["view_only", "manage", "full_control"]).default("manage").notNull(),
  notifications: json("notifications"), // Notification preferences
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GuardianAccess = typeof guardianAccess.$inferSelect;
export type InsertGuardianAccess = typeof guardianAccess.$inferInsert;


// ============================================
// SECURE DOCUMENT VAULT
// ============================================

/**
 * Secure Documents - Private documents with access control
 */
export const secureDocuments = mysqlTable("secure_documents", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(), // User who owns the document
  entityId: int("entityId"), // Optional: linked to a business entity
  folderId: int("folderId"), // Optional: parent folder
  documentType: mysqlEnum("documentType", [
    "business_plan", 
    "grant_application", 
    "financial_statement", 
    "legal_document", 
    "contract", 
    "certificate",
    "report",
    "template",
    "other"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileName: varchar("fileName", { length: 255 }),
  fileUrl: varchar("fileUrl", { length: 500 }), // S3 or storage URL
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  content: text("content"), // For text-based documents stored directly
  version: int("version").default(1).notNull(),
  status: mysqlEnum("status", ["draft", "final", "archived"]).default("draft").notNull(),
  isTemplate: boolean("isTemplate").default(false),
  accessLevel: mysqlEnum("accessLevel", ["owner_only", "entity_members", "authorized_users", "public"]).default("owner_only").notNull(),
  blockchainHash: varchar("blockchainHash", { length: 100 }), // For immutability verification
  metadata: json("metadata"), // Additional metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SecureDocument = typeof secureDocuments.$inferSelect;
export type InsertSecureDocument = typeof secureDocuments.$inferInsert;

/**
 * Document Folders - Organize documents into folders
 */
export const documentFolders = mysqlTable("document_folders", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  entityId: int("entityId"), // Optional: linked to a business entity
  parentFolderId: int("parentFolderId"), // For nested folders
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  color: varchar("color", { length: 20 }), // For UI display
  icon: varchar("icon", { length: 50 }), // Icon name
  accessLevel: mysqlEnum("accessLevel", ["owner_only", "entity_members", "authorized_users"]).default("owner_only").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentFolder = typeof documentFolders.$inferSelect;
export type InsertDocumentFolder = typeof documentFolders.$inferInsert;

/**
 * Document Access - Granular access control for documents
 */
export const documentAccess = mysqlTable("document_access", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  userId: int("userId"), // Specific user access
  entityId: int("entityId"), // Entity-wide access
  role: mysqlEnum("role", ["viewer", "editor", "admin"]).default("viewer").notNull(),
  canDownload: boolean("canDownload").default(true),
  canShare: boolean("canShare").default(false),
  expiresAt: timestamp("expiresAt"), // Optional expiration
  grantedBy: int("grantedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DocumentAccess = typeof documentAccess.$inferSelect;
export type InsertDocumentAccess = typeof documentAccess.$inferInsert;

/**
 * Document Versions - Track document version history
 */
export const documentVersions = mysqlTable("document_versions", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  version: int("version").notNull(),
  content: text("content"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  changeNotes: text("changeNotes"),
  createdBy: int("createdBy").notNull(),
  blockchainHash: varchar("blockchainHash", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = typeof documentVersions.$inferInsert;

/**
 * Document Access Log - Audit trail for document access
 */
export const documentAccessLog = mysqlTable("document_access_log", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  userId: int("userId").notNull(),
  action: mysqlEnum("action", ["view", "download", "edit", "share", "delete", "restore"]).notNull(),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: varchar("userAgent", { length: 500 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DocumentAccessLog = typeof documentAccessLog.$inferSelect;
export type InsertDocumentAccessLog = typeof documentAccessLog.$inferInsert;


/**
 * In-App Notifications - User notifications for system events
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Recipient user
  type: mysqlEnum("type", [
    "system", 
    "operation", 
    "token", 
    "academy", 
    "document", 
    "approval",
    "alert",
    "success",
    "info"
  ]).default("info").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  entityId: int("entityId"), // Related business entity
  referenceType: varchar("referenceType", { length: 50 }), // e.g., "operation", "document", "course"
  referenceId: int("referenceId"), // ID of related record
  actionUrl: varchar("actionUrl", { length: 500 }), // Optional link to action
  isRead: boolean("isRead").default(false).notNull(),
  isPriority: boolean("isPriority").default(false).notNull(),
  metadata: json("metadata"), // Additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Notification Preferences - User notification settings
 */
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  emailEnabled: boolean("emailEnabled").default(true).notNull(),
  pushEnabled: boolean("pushEnabled").default(true).notNull(),
  operationAlerts: boolean("operationAlerts").default(true).notNull(),
  tokenAlerts: boolean("tokenAlerts").default(true).notNull(),
  academyAlerts: boolean("academyAlerts").default(true).notNull(),
  documentAlerts: boolean("documentAlerts").default(true).notNull(),
  approvalAlerts: boolean("approvalAlerts").default(true).notNull(),
  systemAlerts: boolean("systemAlerts").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;


/**
 * AI Bots - Intelligent assistants for various system functions
 */
export const bots = mysqlTable("bots", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", [
    "operations",      // Autonomous business operations
    "support",         // User support and assistance
    "education",       // Academy tutoring and curriculum
    "analytics",       // Business intelligence and reporting
    "guardian",        // Trust governance oversight
    "finance",         // Financial management and tokens
    "media",           // Content and narrative generation
    "outreach",        // Marketing and social media outreach
    "seo",             // Search engine optimization
    "engagement",      // Audience analytics and engagement
    "custom"           // User-defined bots
  ]).notNull(),
  description: text("description"),
  avatar: varchar("avatar", { length: 500 }), // Avatar image URL
  systemPrompt: text("systemPrompt").notNull(), // Base personality and instructions
  capabilities: json("capabilities"), // What the bot can do
  entityId: int("entityId"), // Associated business entity
  isActive: boolean("isActive").default(true).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(), // Available to all users
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bot = typeof bots.$inferSelect;
export type InsertBot = typeof bots.$inferInsert;

/**
 * Bot Conversations - Chat history with bots
 */
export const botConversations = mysqlTable("bot_conversations", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  status: mysqlEnum("status", ["active", "archived", "deleted"]).default("active").notNull(),
  metadata: json("metadata"), // Context, entity references, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BotConversation = typeof botConversations.$inferSelect;
export type InsertBotConversation = typeof botConversations.$inferInsert;

/**
 * Bot Messages - Individual messages in conversations
 */
export const botMessages = mysqlTable("bot_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"), // Tool calls, citations, etc.
  tokenCount: int("tokenCount"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BotMessage = typeof botMessages.$inferSelect;
export type InsertBotMessage = typeof botMessages.$inferInsert;

/**
 * Bot Actions - Actions taken by bots (for audit trail)
 */
export const botActions = mysqlTable("bot_actions", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  conversationId: int("conversationId"),
  userId: int("userId").notNull(),
  actionType: mysqlEnum("actionType", [
    "query",           // Information retrieval
    "create",          // Created something
    "update",          // Modified something
    "delete",          // Removed something
    "approve",         // Approved an operation
    "reject",          // Rejected an operation
    "notify",          // Sent notification
    "analyze",         // Performed analysis
    "generate",        // Generated content
    "transfer"         // Token/asset transfer
  ]).notNull(),
  targetType: varchar("targetType", { length: 50 }), // What was acted upon
  targetId: int("targetId"),
  description: text("description"),
  result: json("result"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BotAction = typeof botActions.$inferSelect;
export type InsertBotAction = typeof botActions.$inferInsert;


/**
 * Scheduled Bot Tasks - Automated recurring bot actions
 */
export const scheduledBotTasks = mysqlTable("scheduled_bot_tasks", {
  id: int("id").autoincrement().primaryKey(),
  botId: int("botId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  taskType: mysqlEnum("taskType", [
    "daily_report",      // Generate daily summary report
    "weekly_audit",      // Weekly compliance/performance audit
    "monthly_analysis",  // Monthly business analysis
    "content_schedule",  // Scheduled content generation
    "engagement_check",  // Check engagement metrics
    "seo_audit",         // SEO health check
    "token_report",      // Token economy report
    "operation_review",  // Review pending operations
    "custom"             // Custom scheduled task
  ]).notNull(),
  prompt: text("prompt").notNull(), // What the bot should do
  schedule: varchar("schedule", { length: 50 }).notNull(), // Cron expression or interval
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  notifyOnComplete: boolean("notifyOnComplete").default(true).notNull(),
  resultHistory: json("resultHistory"), // Last N results
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledBotTask = typeof scheduledBotTasks.$inferSelect;
export type InsertScheduledBotTask = typeof scheduledBotTasks.$inferInsert;
