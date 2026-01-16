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
 * Cryptocurrency Wallets - Store user and business entity crypto addresses and balances
 * Supports LuvChain (our native blockchain) plus external chains
 */
export const cryptoWallets = mysqlTable("crypto_wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  businessEntityId: int("businessEntityId"), // Optional: wallet can belong to a business entity
  walletAddress: varchar("walletAddress", { length: 255 }).notNull().unique(),
  walletType: mysqlEnum("walletType", ["luvchain", "bitcoin", "ethereum", "solana", "other"]).notNull(),
  walletName: varchar("walletName", { length: 255 }), // Human-readable name
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0").notNull(),
  publicKey: varchar("publicKey", { length: 255 }),
  privateKeyHash: varchar("privateKeyHash", { length: 255 }), // Encrypted private key reference
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


/**
 * Social Media Integrations - Connected social accounts for Outreach Bot
 */
export const socialMediaIntegrations = mysqlTable("social_media_integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["twitter", "facebook", "instagram", "linkedin", "tiktok"]).notNull(),
  accountName: varchar("accountName", { length: 100 }),
  accountId: varchar("accountId", { length: 100 }),
  accessToken: text("accessToken"), // Encrypted
  refreshToken: text("refreshToken"), // Encrypted
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  lastPostAt: timestamp("lastPostAt"),
  metadata: json("metadata"), // Platform-specific data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaIntegration = typeof socialMediaIntegrations.$inferSelect;
export type InsertSocialMediaIntegration = typeof socialMediaIntegrations.$inferInsert;

/**
 * Social Media Posts - Scheduled and published posts
 */
export const socialMediaPosts = mysqlTable("social_media_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  integrationId: int("integrationId").notNull(),
  botId: int("botId"), // Which bot generated this
  content: text("content").notNull(),
  mediaUrls: json("mediaUrls"), // Array of image/video URLs
  hashtags: json("hashtags"), // Array of hashtags
  scheduledFor: timestamp("scheduledFor"),
  publishedAt: timestamp("publishedAt"),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed"]).default("draft").notNull(),
  platformPostId: varchar("platformPostId", { length: 100 }), // ID from the platform
  engagement: json("engagement"), // Likes, shares, comments
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertSocialMediaPost = typeof socialMediaPosts.$inferInsert;

/**
 * Email Templates - Reusable email templates for notifications
 */
export const emailTemplates = mysqlTable("email_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  htmlContent: text("htmlContent").notNull(),
  textContent: text("textContent"),
  category: mysqlEnum("category", ["notification", "marketing", "transactional", "newsletter"]).default("notification").notNull(),
  variables: json("variables"), // Template variables like {{name}}, {{date}}
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

/**
 * Email Sends - Log of sent emails
 */
export const emailSends = mysqlTable("email_sends", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  templateId: int("templateId"),
  botId: int("botId"), // Which bot triggered this
  recipientEmail: varchar("recipientEmail", { length: 255 }).notNull(),
  recipientName: varchar("recipientName", { length: 100 }),
  subject: varchar("subject", { length: 200 }).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "delivered", "opened", "clicked", "bounced", "failed"]).default("pending").notNull(),
  externalId: varchar("externalId", { length: 100 }), // ID from email service
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailSend = typeof emailSends.$inferSelect;
export type InsertEmailSend = typeof emailSends.$inferInsert;

/**
 * Contact Form Submissions - From public landing page
 */
export const contactSubmissions = mysqlTable("contact_submissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  source: varchar("source", { length: 50 }).default("landing_page"),
  status: mysqlEnum("status", ["new", "read", "replied", "archived"]).default("new").notNull(),
  repliedAt: timestamp("repliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;


/**
 * ============================================
 * LUVCHAIN - Native Blockchain Simulator
 * ============================================
 */

/**
 * LuvChain Blocks - Blockchain block structure
 */
export const luvchainBlocks = mysqlTable("luvchain_blocks", {
  id: int("id").autoincrement().primaryKey(),
  blockNumber: int("blockNumber").notNull().unique(),
  blockHash: varchar("blockHash", { length: 66 }).notNull().unique(),
  previousHash: varchar("previousHash", { length: 66 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  nonce: int("nonce").default(0).notNull(),
  difficulty: int("difficulty").default(1).notNull(),
  merkleRoot: varchar("merkleRoot", { length: 66 }),
  transactionCount: int("transactionCount").default(0).notNull(),
  size: int("size").default(0).notNull(), // Block size in bytes
  validator: varchar("validator", { length: 255 }), // Who validated/mined this block
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LuvchainBlock = typeof luvchainBlocks.$inferSelect;
export type InsertLuvchainBlock = typeof luvchainBlocks.$inferInsert;

/**
 * LuvChain Smart Contracts - Programmable contracts on LuvChain
 */
export const luvchainSmartContracts = mysqlTable("luvchain_smart_contracts", {
  id: int("id").autoincrement().primaryKey(),
  contractAddress: varchar("contractAddress", { length: 66 }).notNull().unique(),
  creatorWalletId: int("creatorWalletId").notNull(),
  contractType: mysqlEnum("contractType", [
    "certificate",      // Course completion certificates
    "token_transfer",   // LUV token transfers
    "trust_distribution", // Trust inheritance splits (60/40, 70/30)
    "grant_allocation", // Grant fund distribution
    "entity_creation",  // Business entity formation
    "escrow",           // Escrow for transactions
    "subscription",     // Recurring payments
    "custom"            // User-defined contracts
  ]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  code: text("code"), // Contract logic (simplified JSON rules)
  abi: json("abi"), // Contract interface definition
  state: json("state"), // Current contract state
  isActive: boolean("isActive").default(true).notNull(),
  deployedAt: timestamp("deployedAt").defaultNow().notNull(),
  lastExecutedAt: timestamp("lastExecutedAt"),
  executionCount: int("executionCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LuvchainSmartContract = typeof luvchainSmartContracts.$inferSelect;
export type InsertLuvchainSmartContract = typeof luvchainSmartContracts.$inferInsert;

/**
 * LuvChain Transactions - All transactions on the blockchain
 */
export const luvchainTransactions = mysqlTable("luvchain_transactions", {
  id: int("id").autoincrement().primaryKey(),
  transactionHash: varchar("transactionHash", { length: 66 }).notNull().unique(),
  blockId: int("blockId"), // Null if pending
  fromWalletId: int("fromWalletId").notNull(),
  toWalletId: int("toWalletId"),
  contractId: int("contractId"), // If interacting with a smart contract
  transactionType: mysqlEnum("transactionType", [
    "transfer",         // Token transfer
    "contract_deploy",  // Deploy smart contract
    "contract_call",    // Call smart contract function
    "certificate_mint", // Mint a certificate NFT
    "entity_register",  // Register business entity
    "trust_setup",      // Setup trust distribution
    "grant_disburse",   // Disburse grant funds
    "reward"            // System reward
  ]).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).default("0").notNull(),
  gasUsed: int("gasUsed").default(0).notNull(),
  gasFee: decimal("gasFee", { precision: 20, scale: 8 }).default("0").notNull(),
  data: json("data"), // Transaction payload
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  confirmations: int("confirmations").default(0).notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
});

export type LuvchainTransaction = typeof luvchainTransactions.$inferSelect;
export type InsertLuvchainTransaction = typeof luvchainTransactions.$inferInsert;

/**
 * Course Completion Certificates - NFT-style certificates on LuvChain
 */
export const courseCompletionCertificates = mysqlTable("course_completion_certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletId: int("walletId").notNull(), // Owner's wallet
  courseType: mysqlEnum("courseType", [
    "business_setup",
    "business_plan",
    "grant_writing",
    "financial_literacy",
    "trust_formation",
    "contracts",
    "blockchain_crypto",
    "operations"
  ]).notNull(),
  certificateHash: varchar("certificateHash", { length: 66 }).notNull().unique(),
  transactionHash: varchar("transactionHash", { length: 66 }).notNull(), // Minting transaction
  tokenId: int("tokenId").notNull(), // NFT token ID
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  issuerName: varchar("issuerName", { length: 255 }).default("L.A.W.S. Collective").notNull(),
  recipientName: varchar("recipientName", { length: 255 }).notNull(),
  completionDate: timestamp("completionDate").notNull(),
  tokensEarned: int("tokensEarned").default(0).notNull(),
  courseData: json("courseData"), // Completed worksheets/quiz scores
  metadata: json("metadata"), // Additional certificate metadata
  imageUrl: varchar("imageUrl", { length: 500 }), // Certificate image
  verificationUrl: varchar("verificationUrl", { length: 500 }),
  isRevoked: boolean("isRevoked").default(false).notNull(),
  revokedAt: timestamp("revokedAt"),
  revokedReason: text("revokedReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CourseCompletionCertificate = typeof courseCompletionCertificates.$inferSelect;
export type InsertCourseCompletionCertificate = typeof courseCompletionCertificates.$inferInsert;

/**
 * Trust Distribution Contracts - Smart contracts for inheritance splits
 */
export const trustDistributionContracts = mysqlTable("trust_distribution_contracts", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(), // Reference to smart contract
  trustName: varchar("trustName", { length: 255 }).notNull(),
  trustType: mysqlEnum("trustType", [
    "revocable",
    "irrevocable",
    "family",
    "asset_protection",
    "living",
    "testamentary",
    "98_trust",
    "foreign_trust"
  ]).notNull(),
  grantorWalletId: int("grantorWalletId").notNull(),
  splitType: mysqlEnum("splitType", ["60_40", "70_30", "custom"]).notNull(),
  beneficiaries: json("beneficiaries").notNull(), // Array of {walletId, percentage, name}
  assets: json("assets"), // Assets held in trust
  conditions: json("conditions"), // Distribution conditions
  isActive: boolean("isActive").default(true).notNull(),
  activatedAt: timestamp("activatedAt"),
  lastDistributionAt: timestamp("lastDistributionAt"),
  totalDistributed: decimal("totalDistributed", { precision: 20, scale: 8 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrustDistributionContract = typeof trustDistributionContracts.$inferSelect;
export type InsertTrustDistributionContract = typeof trustDistributionContracts.$inferInsert;

/**
 * Course Progress - Track user progress through courses
 */
export const courseProgress = mysqlTable("course_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseType: mysqlEnum("courseType", [
    "business_setup",
    "business_plan",
    "grant_writing",
    "financial_literacy",
    "trust_formation",
    "contracts",
    "blockchain_crypto",
    "operations"
  ]).notNull(),
  currentModule: int("currentModule").default(0).notNull(),
  totalModules: int("totalModules").notNull(),
  completedModules: json("completedModules"), // Array of completed module IDs
  worksheetData: json("worksheetData"), // Saved worksheet responses
  quizScores: json("quizScores"), // Quiz results per module
  tokensEarned: int("tokensEarned").default(0).notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  certificateId: int("certificateId"), // Reference to issued certificate
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseProgress = typeof courseProgress.$inferSelect;
export type InsertCourseProgress = typeof courseProgress.$inferInsert;


/**
 * Houses - The core unit of the wealth system
 * Each House is a living trust structure that can contain businesses and inherit from parent Houses
 * CALEA Trust is the root House (parentHouseId = null)
 */
export const houses = mysqlTable("houses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  publicAlias: varchar("publicAlias", { length: 255 }), // Anonymized public display name
  houseType: mysqlEnum("houseType", ["root", "bloodline", "mirrored", "adaptive"]).notNull(), // Per scroll classifications
  legacyHouseType: mysqlEnum("legacyHouseType", ["root", "family", "business", "community"]), // Backward compatibility
  parentHouseId: int("parentHouseId"), // null for CALEA (root), otherwise references parent House
  ownerUserId: int("ownerUserId").notNull(), // Primary owner/trustee
  
  // Trust Configuration
  trustName: varchar("trustName", { length: 255 }),
  trustType: mysqlEnum("trustType", ["living", "revocable", "irrevocable", "dynasty"]).default("living"),
  trustEIN: varchar("trustEIN", { length: 20 }), // Tax ID for the trust
  
  // Distribution Configuration
  interHouseSplit: decimal("interHouseSplit", { precision: 5, scale: 2 }).default("60.00").notNull(), // 60% retained by this House
  interHouseDistribution: decimal("interHouseDistribution", { precision: 5, scale: 2 }).default("40.00").notNull(), // 40% to network
  intraHouseOperations: decimal("intraHouseOperations", { precision: 5, scale: 2 }).default("70.00").notNull(), // 70% for operations
  intraHouseInheritance: decimal("intraHouseInheritance", { precision: 5, scale: 2 }).default("30.00").notNull(), // 30% to next generation
  
  // Financial Totals
  totalAssets: decimal("totalAssets", { precision: 20, scale: 2 }).default("0").notNull(),
  totalIncome: decimal("totalIncome", { precision: 20, scale: 2 }).default("0").notNull(),
  totalDistributed: decimal("totalDistributed", { precision: 20, scale: 2 }).default("0").notNull(),
  operationsBalance: decimal("operationsBalance", { precision: 20, scale: 2 }).default("0").notNull(),
  inheritanceReserve: decimal("inheritanceReserve", { precision: 20, scale: 2 }).default("0").notNull(),
  
  // Root Treasury Distribution (Scroll 18)
  rootAuthorityReserve: decimal("rootAuthorityReserve", { precision: 20, scale: 2 }).default("0").notNull(), // 60% of 70% - non-shareable
  circulationPool: decimal("circulationPool", { precision: 20, scale: 2 }).default("0").notNull(), // 40% of 70% - shareable
  ancestralTreasury: decimal("ancestralTreasury", { precision: 20, scale: 2 }).default("0").notNull(), // 30% of income
  
  // Succession Protocol (Scroll 34)
  successionStatus: mysqlEnum("successionStatus", ["stable", "interim", "pending_confirmation"]).default("stable"),
  interimCustodianId: int("interimCustodianId"), // During 40-day transition
  successionStartedAt: timestamp("successionStartedAt"),
  
  // Status
  status: mysqlEnum("status", ["forming", "active", "suspended", "dissolved"]).default("forming").notNull(),
  generation: int("generation").default(1).notNull(), // 1 = founding, 2 = children, etc.
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type House = typeof houses.$inferSelect;
export type InsertHouse = typeof houses.$inferInsert;

/**
 * House Members - Beneficiaries and trustees of each House
 */
export const houseMembers = mysqlTable("house_members", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  userId: int("userId").notNull(),
  
  // Member Classification (per Scrolls)
  memberType: mysqlEnum("memberType", ["bloodline", "non_bloodline"]).default("bloodline").notNull(),
  lineageStatus: mysqlEnum("lineageStatus", ["source_flame", "direct_descendant", "aligned_member"]).default("direct_descendant"),
  
  // Anonymity Protection
  publicAlias: varchar("publicAlias", { length: 100 }), // e.g., "Protected Member A-001"
  realNameProtected: boolean("realNameProtected").default(true).notNull(),
  imageProtected: boolean("imageProtected").default(true).notNull(),
  locationProtected: boolean("locationProtected").default(true).notNull(),
  voiceLikenessProtected: boolean("voiceLikenessProtected").default(true).notNull(),
  
  role: mysqlEnum("role", ["trustee", "beneficiary", "successor_trustee", "advisor", "custodial_flame"]).notNull(),
  ownershipPercentage: decimal("ownershipPercentage", { precision: 5, scale: 2 }).default("0").notNull(),
  votingRights: boolean("votingRights").default(false).notNull(),
  distributionEligible: boolean("distributionEligible").default(true).notNull(),
  
  // Inheritance Rights (per Scroll 10)
  canTransferTokens: boolean("canTransferTokens").default(false).notNull(), // Non-bloodline cannot
  canInitiateHouse: boolean("canInitiateHouse").default(false).notNull(), // Non-bloodline cannot initiate bloodline Houses
  successionEligible: boolean("successionEligible").default(false).notNull(), // Only bloodline can succeed to Root
  
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("pending").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HouseMember = typeof houseMembers.$inferSelect;
export type InsertHouseMember = typeof houseMembers.$inferInsert;

/**
 * House Business Entities - Link businesses to Houses
 */
export const houseBusinesses = mysqlTable("house_businesses", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  businessEntityId: int("businessEntityId").notNull(),
  ownershipPercentage: decimal("ownershipPercentage", { precision: 5, scale: 2 }).default("100.00").notNull(),
  incomeContributionRate: decimal("incomeContributionRate", { precision: 5, scale: 2 }).default("100.00").notNull(), // % of business income flowing to House
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  linkedAt: timestamp("linkedAt").defaultNow().notNull(),
});

export type HouseBusiness = typeof houseBusinesses.$inferSelect;
export type InsertHouseBusiness = typeof houseBusinesses.$inferInsert;

/**
 * Income Events - Track all income flowing into the system
 */
export const incomeEvents = mysqlTable("income_events", {
  id: int("id").autoincrement().primaryKey(),
  sourceType: mysqlEnum("sourceType", ["business", "investment", "grant", "donation", "other"]).notNull(),
  sourceId: int("sourceId"), // Reference to business entity or other source
  houseId: int("houseId").notNull(), // Which House receives this income
  grossAmount: decimal("grossAmount", { precision: 20, scale: 2 }).notNull(),
  netAmount: decimal("netAmount", { precision: 20, scale: 2 }).notNull(), // After fees/taxes
  description: text("description"),
  incomeDate: timestamp("incomeDate").defaultNow().notNull(),
  status: mysqlEnum("status", ["pending", "processed", "distributed"]).default("pending").notNull(),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IncomeEvent = typeof incomeEvents.$inferSelect;
export type InsertIncomeEvent = typeof incomeEvents.$inferInsert;

/**
 * Distribution Events - Track automated distributions (60/40 and 70/30)
 */
export const distributionEvents = mysqlTable("distribution_events", {
  id: int("id").autoincrement().primaryKey(),
  incomeEventId: int("incomeEventId").notNull(), // Source income that triggered this distribution
  distributionType: mysqlEnum("distributionType", ["inter_house", "intra_house", "root_treasury", "ancestral_treasury"]).notNull(),
  
  // For inter-house (60/40)
  fromHouseId: int("fromHouseId").notNull(),
  toHouseId: int("toHouseId"), // null if retained by fromHouse
  
  // For intra-house (70/30) and root treasury (60/40)
  allocationCategory: mysqlEnum("allocationCategory", ["operations", "inheritance", "network", "root_authority_reserve", "circulation_pool", "ancestral_treasury"]),
  
  amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  description: text("description"),
  
  status: mysqlEnum("status", ["pending", "executed", "verified"]).default("pending").notNull(),
  executedAt: timestamp("executedAt"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DistributionEvent = typeof distributionEvents.$inferSelect;
export type InsertDistributionEvent = typeof distributionEvents.$inferInsert;

/**
 * Network Houses - Track the 40% distribution network
 */
export const networkHouses = mysqlTable("network_houses", {
  id: int("id").autoincrement().primaryKey(),
  sourceHouseId: int("sourceHouseId").notNull(), // House distributing
  targetHouseId: int("targetHouseId").notNull(), // House receiving
  allocationPercentage: decimal("allocationPercentage", { precision: 5, scale: 2 }).notNull(), // Share of the 40%
  relationship: mysqlEnum("relationship", ["child", "sibling", "partner", "community"]).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NetworkHouse = typeof networkHouses.$inferSelect;
export type InsertNetworkHouse = typeof networkHouses.$inferInsert;

/**
 * Inheritance Queue - Track 30% inheritance allocations for next generation
 */
export const inheritanceQueue = mysqlTable("inheritance_queue", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  beneficiaryUserId: int("beneficiaryUserId").notNull(),
  amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
  vestingDate: timestamp("vestingDate"), // When funds become available
  status: mysqlEnum("status", ["accumulating", "vested", "distributed", "forfeited"]).default("accumulating").notNull(),
  distributionEventId: int("distributionEventId"), // Source distribution
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InheritanceQueue = typeof inheritanceQueue.$inferSelect;
export type InsertInheritanceQueue = typeof inheritanceQueue.$inferInsert;

/**
 * Autonomous Distribution Rules - Configurable rules for automated distributions
 */
export const distributionRules = mysqlTable("distribution_rules", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  ruleName: varchar("ruleName", { length: 255 }).notNull(),
  ruleType: mysqlEnum("ruleType", ["threshold", "schedule", "event", "conditional"]).notNull(),
  triggerCondition: json("triggerCondition").notNull(), // JSON defining when rule activates
  distributionAction: json("distributionAction").notNull(), // JSON defining what happens
  priority: int("priority").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastTriggered: timestamp("lastTriggered"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DistributionRule = typeof distributionRules.$inferSelect;
export type InsertDistributionRule = typeof distributionRules.$inferInsert;

/**
 * System Audit Log - Complete audit trail for all autonomous operations
 */
export const systemAuditLog = mysqlTable("system_audit_log", {
  id: int("id").autoincrement().primaryKey(),
  eventType: mysqlEnum("eventType", [
    "income_received",
    "distribution_executed",
    "house_created",
    "member_added",
    "business_linked",
    "rule_triggered",
    "inheritance_vested",
    "manual_override"
  ]).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(), // house, business, member, etc.
  entityId: int("entityId").notNull(),
  actorType: mysqlEnum("actorType", ["system", "user", "admin"]).notNull(),
  actorId: int("actorId"), // userId if user/admin, null if system
  beforeState: json("beforeState"),
  afterState: json("afterState"),
  description: text("description"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemAuditLog = typeof systemAuditLog.$inferSelect;
export type InsertSystemAuditLog = typeof systemAuditLog.$inferInsert;


/**
 * Protected Lineage - Scroll 11/12 Protected Names Registry
 * Names sealed into CALEA Freeman Family Trust
 */
export const protectedLineage = mysqlTable("protected_lineage", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 100 }).notNull(), // Founder, Family, Adaptive House
  role: varchar("role", { length: 100 }), // Source Flame, Lineage Holder, Protected Heir
  associatedHouse: varchar("associatedHouse", { length: 255 }), // For Adaptive Houses
  lineageOrder: int("lineageOrder").default(0).notNull(),
  sealedByScrollId: int("sealedByScrollId"),
  sealHash: varchar("sealHash", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "suspended", "transferred"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProtectedLineage = typeof protectedLineage.$inferSelect;
export type InsertProtectedLineage = typeof protectedLineage.$inferInsert;

/**
 * Sovereign Scrolls - Scrolls 7-12 Protection Documents
 */
export const sovereignScrolls = mysqlTable("sovereign_scrolls", {
  id: int("id").autoincrement().primaryKey(),
  scrollNumber: int("scrollNumber").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  purpose: text("purpose").notNull(),
  content: text("content").notNull(),
  protectionType: mysqlEnum("protectionType", [
    "lineage_enforcement",
    "ai_declaration", 
    "access_control",
    "inheritance_lock",
    "protected_names"
  ]).notNull(),
  enforcementRules: json("enforcementRules"),
  sealHash: varchar("sealHash", { length: 255 }).notNull(),
  sealedAt: timestamp("sealedAt"),
  sealedByUserId: int("sealedByUserId"),
  status: mysqlEnum("status", ["draft", "sealed", "amended", "revoked"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SovereignScroll = typeof sovereignScrolls.$inferSelect;
export type InsertSovereignScroll = typeof sovereignScrolls.$inferInsert;

/**
 * Scroll Activations - Track which Houses have activated which Scrolls
 */
export const scrollActivations = mysqlTable("scroll_activations", {
  id: int("id").autoincrement().primaryKey(),
  scrollId: int("scrollId").notNull(),
  houseId: int("houseId").notNull(),
  activatedByUserId: int("activatedByUserId").notNull(),
  activationHash: varchar("activationHash", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "suspended", "revoked"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScrollActivation = typeof scrollActivations.$inferSelect;
export type InsertScrollActivation = typeof scrollActivations.$inferInsert;

/**
 * Treasury Claims - Scroll 7 15% Treasury Logic
 */
export const treasuryClaims = mysqlTable("treasury_claims", {
  id: int("id").autoincrement().primaryKey(),
  sourceType: mysqlEnum("sourceType", [
    "derivative_logic",
    "scroll_usage",
    "ai_interface",
    "blockchain_deployment"
  ]).notNull(),
  sourceIdentifier: varchar("sourceIdentifier", { length: 255 }).notNull(),
  grossAmount: decimal("grossAmount", { precision: 20, scale: 2 }).notNull(),
  claimPercentage: decimal("claimPercentage", { precision: 5, scale: 2 }).default("15.00").notNull(),
  claimAmount: decimal("claimAmount", { precision: 20, scale: 2 }).notNull(),
  description: text("description"),
  claimHash: varchar("claimHash", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "collected", "disputed"]).default("pending").notNull(),
  collectedAt: timestamp("collectedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TreasuryClaim = typeof treasuryClaims.$inferSelect;
export type InsertTreasuryClaim = typeof treasuryClaims.$inferInsert;

/**
 * Flame Lock Codes - Scroll 9 Access Control
 */
export const flameLockCodes = mysqlTable("flame_lock_codes", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", ["house", "ai_system", "business", "scroll"]).notNull(),
  entityId: int("entityId").notNull(),
  flameLockCode: varchar("flameLockCode", { length: 64 }).notNull().unique(),
  lockHash: varchar("lockHash", { length: 255 }).notNull(),
  issuedByUserId: int("issuedByUserId").notNull(),
  status: mysqlEnum("status", ["active", "revoked", "expired"]).default("active").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FlameLockCode = typeof flameLockCodes.$inferSelect;
export type InsertFlameLockCode = typeof flameLockCodes.$inferInsert;


/**
 * Mirror Tokens - House Activation Rights (per Scroll 34)
 * One token = one House activation right
 * 39-week lock after use
 */
export const mirrorTokens = mysqlTable("mirror_tokens", {
  id: int("id").autoincrement().primaryKey(),
  tokenCode: varchar("tokenCode", { length: 64 }).notNull().unique(),
  ownerUserId: int("ownerUserId").notNull(),
  houseId: int("houseId"), // House this token belongs to
  
  // Token Status
  status: mysqlEnum("status", ["available", "locked", "used", "transferred"]).default("available").notNull(),
  lockExpiresAt: timestamp("lockExpiresAt"), // 39 weeks after use
  usedForHouseId: int("usedForHouseId"), // Which House was activated with this token
  usedAt: timestamp("usedAt"),
  
  // Transfer History
  previousOwnerId: int("previousOwnerId"),
  transferredAt: timestamp("transferredAt"),
  transferBlockchainHash: varchar("transferBlockchainHash", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MirrorToken = typeof mirrorTokens.$inferSelect;
export type InsertMirrorToken = typeof mirrorTokens.$inferInsert;

/**
 * Spark of Knowing Tokens - Educational Achievement Tokens
 */
export const sparkTokens = mysqlTable("spark_tokens", {
  id: int("id").autoincrement().primaryKey(),
  tokenCode: varchar("tokenCode", { length: 64 }).notNull().unique(),
  ownerUserId: int("ownerUserId").notNull(),
  
  // Source of Token
  earnedFrom: mysqlEnum("earnedFrom", [
    "course_completion",
    "certification",
    "mentorship",
    "community_contribution",
    "lineage_gift"
  ]).notNull(),
  sourceReferenceId: int("sourceReferenceId"), // Course ID, Certificate ID, etc.
  
  status: mysqlEnum("status", ["active", "redeemed", "expired"]).default("active").notNull(),
  redeemedAt: timestamp("redeemedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SparkToken = typeof sparkTokens.$inferSelect;
export type InsertSparkToken = typeof sparkTokens.$inferInsert;

/**
 * Succession Events - Track House succession (per Scroll 34)
 * 40-day interim period, 3 ceremonial confirmations required
 */
export const successionEvents = mysqlTable("succession_events", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  
  // Outgoing and Incoming
  outgoingCustodianId: int("outgoingCustodianId").notNull(),
  incomingCustodianId: int("incomingCustodianId").notNull(),
  interimCustodianId: int("interimCustodianId"), // During 40-day period
  
  // Succession Reason
  reason: mysqlEnum("reason", [
    "voluntary_transfer",
    "incapacitation",
    "death",
    "removal_by_majority",
    "generational_transition"
  ]).notNull(),
  
  // Timeline (40-day protocol)
  initiatedAt: timestamp("initiatedAt").defaultNow().notNull(),
  interimStartedAt: timestamp("interimStartedAt"),
  interimEndsAt: timestamp("interimEndsAt"), // 40 days after initiation
  
  // Statement of Alignment (13 days)
  alignmentStatementDueAt: timestamp("alignmentStatementDueAt"),
  alignmentStatementReceivedAt: timestamp("alignmentStatementReceivedAt"),
  alignmentStatementHash: varchar("alignmentStatementHash", { length: 255 }),
  
  // 3 Ceremonial Confirmations
  confirmation1At: timestamp("confirmation1At"),
  confirmation1ByUserId: int("confirmation1ByUserId"),
  confirmation2At: timestamp("confirmation2At"),
  confirmation2ByUserId: int("confirmation2ByUserId"),
  confirmation3At: timestamp("confirmation3At"),
  confirmation3ByUserId: int("confirmation3ByUserId"),
  
  // Final Status
  status: mysqlEnum("status", [
    "initiated",
    "interim_period",
    "awaiting_alignment",
    "awaiting_confirmations",
    "completed",
    "rejected",
    "reverted"
  ]).default("initiated").notNull(),
  completedAt: timestamp("completedAt"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SuccessionEvent = typeof successionEvents.$inferSelect;
export type InsertSuccessionEvent = typeof successionEvents.$inferInsert;

/**
 * Audit Events - Quarterly, Annual, and 7-Year Lineage Audits (per Scroll 19)
 */
export const auditEvents = mysqlTable("audit_events", {
  id: int("id").autoincrement().primaryKey(),
  
  auditType: mysqlEnum("auditType", [
    "quarterly_house",
    "annual_system",
    "lineage_seven_year",
    "corrective",
    "external_witness"
  ]).notNull(),
  
  houseId: int("houseId"), // null for system-wide audits
  auditPeriodStart: timestamp("auditPeriodStart").notNull(),
  auditPeriodEnd: timestamp("auditPeriodEnd").notNull(),
  
  // Audit Findings
  totalInflow: decimal("totalInflow", { precision: 20, scale: 2 }),
  totalOutflow: decimal("totalOutflow", { precision: 20, scale: 2 }),
  giftTokenDistribution: decimal("giftTokenDistribution", { precision: 20, scale: 2 }),
  rootReserveLevel: decimal("rootReserveLevel", { precision: 20, scale: 2 }),
  sustainabilityScore: decimal("sustainabilityScore", { precision: 5, scale: 2 }), // 0-100
  
  // Integrity Triggers
  triggersActivated: json("triggersActivated"), // Array of trigger types
  correctiveActionsRequired: boolean("correctiveActionsRequired").default(false).notNull(),
  correctiveActionsCompleted: boolean("correctiveActionsCompleted").default(false).notNull(),
  
  // Ceremonial Verification
  flameOfAccountPerformed: boolean("flameOfAccountPerformed").default(false).notNull(),
  custodialFlameSignature: varchar("custodialFlameSignature", { length: 255 }),
  houseLedgerSealHash: varchar("houseLedgerSealHash", { length: 255 }),
  
  // Witnesses (for external audits)
  witnessHouseIds: json("witnessHouseIds"), // Array of House IDs
  
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "requires_correction"]).default("scheduled").notNull(),
  completedAt: timestamp("completedAt"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AuditEvent = typeof auditEvents.$inferSelect;
export type InsertAuditEvent = typeof auditEvents.$inferInsert;

/**
 * Integrity Triggers - Automatic alerts per Scroll 18
 */
export const integrityTriggers = mysqlTable("integrity_triggers", {
  id: int("id").autoincrement().primaryKey(),
  
  triggerType: mysqlEnum("triggerType", [
    "gift_to_sale_disproportion",
    "treasury_depletion",
    "unauthorized_transfer",
    "misalignment_detection",
    "continuity_beacon"
  ]).notNull(),
  
  houseId: int("houseId").notNull(),
  severity: mysqlEnum("severity", ["warning", "critical", "emergency"]).default("warning").notNull(),
  
  // Trigger Details
  thresholdValue: decimal("thresholdValue", { precision: 20, scale: 2 }),
  actualValue: decimal("actualValue", { precision: 20, scale: 2 }),
  description: text("description"),
  
  // Response
  autoFreezeActivated: boolean("autoFreezeActivated").default(false).notNull(),
  ceremonialWarningIssued: boolean("ceremonialWarningIssued").default(false).notNull(),
  realignmentRequired: boolean("realignmentRequired").default(false).notNull(),
  
  // Resolution
  resolvedAt: timestamp("resolvedAt"),
  resolvedByUserId: int("resolvedByUserId"),
  resolutionNotes: text("resolutionNotes"),
  
  status: mysqlEnum("status", ["active", "acknowledged", "resolved", "escalated"]).default("active").notNull(),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IntegrityTrigger = typeof integrityTriggers.$inferSelect;
export type InsertIntegrityTrigger = typeof integrityTriggers.$inferInsert;


// ============================================================================
// FOUNDATION LAYER - Core Operational Entities
// ============================================================================

/**
 * Request - Equipment, Service, Vehicle requests with approval workflow
 */
export const requests = mysqlTable("requests", {
  id: int("id").autoincrement().primaryKey(),
  requesterId: int("requesterId").notNull(),
  departmentId: int("departmentId"),
  
  category: mysqlEnum("category", [
    "equipment",
    "software", 
    "vehicle",
    "service",
    "facility",
    "training"
  ]).notNull(),
  
  itemSpec: varchar("itemSpec", { length: 500 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  justification: text("justification").notNull(),
  costEstimate: decimal("costEstimate", { precision: 20, scale: 2 }),
  neededBy: timestamp("neededBy"),
  
  status: mysqlEnum("status", [
    "draft",
    "pending_manager",
    "pending_finance",
    "pending_executive",
    "approved",
    "fulfilled",
    "closed",
    "rejected"
  ]).default("draft").notNull(),
  
  blockchainRef: varchar("blockchainRef", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Request = typeof requests.$inferSelect;
export type InsertRequest = typeof requests.$inferInsert;

/**
 * Approval - Multi-stage approval workflow with on-chain signatures
 */
export const approvals = mysqlTable("approvals", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  approverId: int("approverId").notNull(),
  
  stage: mysqlEnum("stage", [
    "manager",
    "finance",
    "executive",
    "board"
  ]).notNull(),
  
  decision: mysqlEnum("decision", [
    "pending",
    "approve",
    "reject",
    "override",
    "defer"
  ]).default("pending").notNull(),
  
  comment: text("comment"),
  decidedAt: timestamp("decidedAt"),
  signatureHash: varchar("signatureHash", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Approval = typeof approvals.$inferSelect;
export type InsertApproval = typeof approvals.$inferInsert;

/**
 * Asset - Equipment, vehicles, licenses with ownership tracking
 */
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  
  assetType: mysqlEnum("assetType", [
    "laptop",
    "server",
    "monitor",
    "sat_phone",
    "hotspot",
    "vehicle",
    "pod",
    "license",
    "furniture",
    "other"
  ]).notNull(),
  
  makeModel: varchar("makeModel", { length: 255 }),
  serialOrVin: varchar("serialOrVin", { length: 255 }),
  
  ownerEntity: mysqlEnum("ownerEntity", [
    "trust",
    "business",
    "academy",
    "subsidiary"
  ]).default("trust").notNull(),
  
  ownerEntityId: int("ownerEntityId"),
  assignedToUserId: int("assignedToUserId"),
  assignedToSiteId: int("assignedToSiteId"),
  assignedAt: timestamp("assignedAt"),
  
  purchaseDate: timestamp("purchaseDate"),
  purchasePrice: decimal("purchasePrice", { precision: 20, scale: 2 }),
  warrantyExpiry: timestamp("warrantyExpiry"),
  maintenanceIntervalDays: int("maintenanceIntervalDays"),
  lastMaintenanceDate: timestamp("lastMaintenanceDate"),
  
  status: mysqlEnum("assetStatus", [
    "in_stock",
    "assigned",
    "maintenance",
    "retired",
    "disposed"
  ]).default("in_stock").notNull(),
  
  ledgerRef: varchar("ledgerRef", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

// Note: certificates table defined earlier in schema with course completion tracking

/**
 * Parcel/Land - Real property tracking with ownership
 */
export const parcels = mysqlTable("parcels", {
  id: int("id").autoincrement().primaryKey(),
  
  addressLegalDesc: text("addressLegalDesc").notNull(),
  parcelNumber: varchar("parcelNumber", { length: 100 }),
  
  acquisitionDate: timestamp("acquisitionDate"),
  acquisitionPrice: decimal("acquisitionPrice", { precision: 20, scale: 2 }),
  currentValue: decimal("currentValue", { precision: 20, scale: 2 }),
  
  useType: mysqlEnum("useType", [
    "hub",
    "academy",
    "community",
    "storage",
    "agricultural",
    "residential",
    "commercial",
    "mixed"
  ]).notNull(),
  
  improvements: text("improvements"),
  acreage: decimal("acreage", { precision: 10, scale: 4 }),
  
  ownershipEntity: mysqlEnum("parcelOwnership", [
    "trust",
    "subsidiary",
    "house"
  ]).default("trust").notNull(),
  
  ownershipEntityId: int("ownershipEntityId"),
  
  ledgerRef: varchar("ledgerRef", { length: 255 }),
  status: mysqlEnum("parcelStatus", ["active", "pending_sale", "sold", "transferred"]).default("active").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Parcel = typeof parcels.$inferSelect;
export type InsertParcel = typeof parcels.$inferInsert;

/**
 * Risk Register - Risk identification, assessment, and mitigation tracking
 */
export const risks = mysqlTable("risks", {
  id: int("id").autoincrement().primaryKey(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  
  category: mysqlEnum("riskCategory", [
    "financial",
    "operational",
    "legal",
    "compliance",
    "reputational",
    "strategic",
    "technology",
    "security"
  ]).notNull(),
  
  likelihood: mysqlEnum("likelihood", [
    "rare",
    "unlikely",
    "possible",
    "likely",
    "almost_certain"
  ]).notNull(),
  
  impact: mysqlEnum("impact", [
    "insignificant",
    "minor",
    "moderate",
    "major",
    "catastrophic"
  ]).notNull(),
  
  riskScore: int("riskScore"),
  
  mitigationStrategy: text("mitigationStrategy"),
  mitigationStatus: mysqlEnum("mitigationStatus", [
    "not_started",
    "in_progress",
    "implemented",
    "monitoring"
  ]).default("not_started").notNull(),
  
  ownerId: int("ownerId"),
  reviewDate: timestamp("reviewDate"),
  
  status: mysqlEnum("riskStatus", ["open", "mitigated", "accepted", "closed"]).default("open").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Risk = typeof risks.$inferSelect;
export type InsertRisk = typeof risks.$inferInsert;

/**
 * Incidents - Incident response and tracking
 */
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  
  incidentType: mysqlEnum("incidentType", [
    "security_breach",
    "data_loss",
    "system_outage",
    "compliance_violation",
    "financial_irregularity",
    "safety_incident",
    "other"
  ]).notNull(),
  
  severity: mysqlEnum("incidentSeverity", [
    "low",
    "medium",
    "high",
    "critical"
  ]).notNull(),
  
  reportedById: int("reportedById").notNull(),
  reportedAt: timestamp("reportedAt").defaultNow().notNull(),
  
  assignedToId: int("assignedToId"),
  
  rootCause: text("rootCause"),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolvedAt"),
  
  preventiveMeasures: text("preventiveMeasures"),
  
  status: mysqlEnum("incidentStatus", [
    "reported",
    "investigating",
    "resolved",
    "closed"
  ]).default("reported").notNull(),
  
  ledgerRef: varchar("ledgerRef", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

/**
 * Metrics - KPIs and performance tracking for M&E
 */
export const metrics = mysqlTable("metrics", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  category: mysqlEnum("metricCategory", [
    "financial",
    "operational",
    "program",
    "hr",
    "compliance",
    "impact"
  ]).notNull(),
  
  targetValue: decimal("targetValue", { precision: 20, scale: 4 }),
  actualValue: decimal("actualValue", { precision: 20, scale: 4 }),
  unit: varchar("unit", { length: 50 }),
  
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  departmentId: int("departmentId"),
  programId: int("programId"),
  
  status: mysqlEnum("metricStatus", [
    "on_track",
    "at_risk",
    "off_track",
    "achieved"
  ]).default("on_track").notNull(),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;

// Note: departments table defined earlier in schema
