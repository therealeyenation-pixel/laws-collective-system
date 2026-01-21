import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean, bigint, date } from "drizzle-orm/mysql-core";

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
  role: mysqlEnum("role", ["user", "staff", "admin", "owner"]).default("user").notNull(),
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
  entityType: mysqlEnum("entityType", ["trust", "llc", "corporation", "collective", "508c1a"]).notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused", "archived"]).default("draft").notNull(),
  trustLevel: int("trustLevel").default(1).notNull(),
  description: text("description"),
  financialStructure: json("financialStructure"),
  // Entity registration details
  ein: varchar("ein", { length: 20 }), // Federal EIN
  stateOfFormation: varchar("stateOfFormation", { length: 50 }),
  stateEntityId: varchar("stateEntityId", { length: 50 }),
  formationDate: timestamp("formationDate"),
  registeredAddress: text("registeredAddress"),
  physicalAddress: text("physicalAddress"),
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
 * AI Agents - Intelligent assistants for various system functions
 */
export const agents = mysqlTable("agents", {
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
    "hr",              // Human Resources department
    "qaqc",            // Quality Assurance/Quality Control
    "purchasing",      // Procurement and purchasing
    "health",          // Health and wellness programs
    "design",          // Design and creative services
    "custom"           // User-defined agents
  ]).notNull(),
  description: text("description"),
  avatar: varchar("avatar", { length: 500 }), // Avatar image URL
  systemPrompt: text("systemPrompt").notNull(), // Base personality and instructions
  capabilities: json("capabilities"), // What the agent can do
  entityId: int("entityId"), // Associated business entity
  isActive: boolean("isActive").default(true).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(), // Available to all users
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Agent Conversations - Chat history with agents
 */
export const agentConversations = mysqlTable("agent_conversations", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  status: mysqlEnum("status", ["active", "archived", "deleted"]).default("active").notNull(),
  metadata: json("metadata"), // Context, entity references, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentConversation = typeof agentConversations.$inferSelect;
export type InsertAgentConversation = typeof agentConversations.$inferInsert;

/**
 * Agent Messages - Individual messages in conversations
 */
export const agentMessages = mysqlTable("agent_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"), // Tool calls, citations, etc.
  tokenCount: int("tokenCount"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentMessage = typeof agentMessages.$inferSelect;
export type InsertAgentMessage = typeof agentMessages.$inferInsert;

/**
 * Agent Actions - Actions taken by bots (for audit trail)
 */
export const agentActions = mysqlTable("agent_actions", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
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

export type AgentAction = typeof agentActions.$inferSelect;
export type InsertAgentAction = typeof agentActions.$inferInsert;


/**
 * Scheduled Agent Tasks - Automated recurring agent actions
 */
export const scheduledAgentTasks = mysqlTable("scheduled_agent_tasks", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
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
  prompt: text("prompt").notNull(), // What the agent should do
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

export type ScheduledAgentTask = typeof scheduledAgentTasks.$inferSelect;
export type InsertScheduledAgentTask = typeof scheduledAgentTasks.$inferInsert;


/**
 * Social Media Integrations - Connected social accounts for Outreach Agent
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
  agentId: int("agentId"), // Which agent generated this
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
  agentId: int("agentId"), // Which agent triggered this
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
  status: mysqlEnum("status", ["template", "forming", "pending_activation", "active", "suspended", "dissolved"]).default("template").notNull(),
  
  // Activation Pathway
  activationPathway: mysqlEnum("activationPathway", [
    "employee_transition",  // Employee becoming contractor
    "external_partner",     // Outside partner joining
    "business_first",       // Existing business wrapping into House
    "community_member",     // Community member
    "family_branch"         // Extended family
  ]),
  
  // Business-First Fields
  // NOTE: For Business-First pathway, the linked business remains SEPARATE from House distributions
  // The business owner's existing revenue does NOT flow into the House system automatically
  // They only receive distributions from the COLLECTIVE pool based on participation
  linkedBusinessEntityId: int("linkedBusinessEntityId"), // Reference only - business stays independent
  businessVerificationStatus: mysqlEnum("businessVerificationStatus", [
    "not_applicable",
    "pending_verification",
    "verified",
    "rejected"
  ]).default("not_applicable"),
  businessVerifiedAt: timestamp("businessVerifiedAt"),
  businessVerifiedByUserId: int("businessVerifiedByUserId"),
  
  // Voluntary Contribution (Business-First only)
  // Owner chooses what % of their business revenue to contribute to the collective
  voluntaryContributionRate: decimal("voluntaryContributionRate", { precision: 5, scale: 2 }).default("0.00"), // 0% by default
  contributionFrequency: mysqlEnum("contributionFrequency", ["none", "monthly", "quarterly", "annually"]).default("none"),
  lastContributionDate: timestamp("lastContributionDate"),
  totalContributed: decimal("totalContributed", { precision: 20, scale: 2 }).default("0.00"),
  
  // Distribution Eligibility (separate from their business)
  // Distributions come from the collective pool, NOT from their own business
  distributionEligible: boolean("distributionEligible").default(false), // Must complete training first
  distributionTier: mysqlEnum("distributionTier", ["observer", "participant", "contributor", "partner"]).default("observer"),
  
  // Platform Usage Tracking (how the system benefits from Business-First Houses)
  // All tool usage fees flow through the 60/40 and 70/30 framework
  platformSubscriptionTier: mysqlEnum("platformSubscriptionTier", ["free", "basic", "professional", "enterprise"]).default("free"),
  monthlySubscriptionFee: decimal("monthlySubscriptionFee", { precision: 10, scale: 2 }).default("0.00"),
  totalPlatformFeesGenerated: decimal("totalPlatformFeesGenerated", { precision: 20, scale: 2 }).default("0.00"),
  totalToolUsageFees: decimal("totalToolUsageFees", { precision: 20, scale: 2 }).default("0.00"),
  totalReferralCommissions: decimal("totalReferralCommissions", { precision: 20, scale: 2 }).default("0.00"),
  totalMarketplaceFees: decimal("totalMarketplaceFees", { precision: 20, scale: 2 }).default("0.00"),
  referredHousesCount: int("referredHousesCount").default(0),
  lastPlatformActivityAt: timestamp("lastPlatformActivityAt"),
  
  // Training Completion (required for all pathways)
  trainingCompletionStatus: mysqlEnum("trainingCompletionStatus", [
    "not_started",
    "in_progress",
    "completed"
  ]).default("not_started"),
  trainingCompletedAt: timestamp("trainingCompletedAt"),
  requiredCoursesCompleted: int("requiredCoursesCompleted").default(0),
  totalRequiredCourses: int("totalRequiredCourses").default(8),
  
  // Template Reference
  templateId: int("templateId"), // Which template this House was created from
  generation: int("generation").default(1).notNull(), // 1 = founding, 2 = children, etc.
  
  // Genesis House Fields (for the founding Root House)
  isGenesis: boolean("isGenesis").default(false), // True only for the first House
  genesisRIN: varchar("genesisRIN", { length: 50 }), // Special RIN format: RIN-GEN-001
  genesisHash: varchar("genesisHash", { length: 255 }), // Hash of ceremony data
  statementOfPurpose: text("statementOfPurpose"), // Founder's vision statement
  flameLightingTimestamp: timestamp("flameLightingTimestamp"), // Ceremonial activation moment
  genesisDeclarationDocId: int("genesisDeclarationDocId"), // Reference to vault document
  
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


// ============================================================
// FINANCIAL AUTOMATION TABLES (Scrolls 54-61)
// ============================================================

/**
 * Allocation Pots - Financial buckets for the LuvLedger system
 * Based on Scroll 55: Allocation Engine Protocol
 */
export const allocationPots = mysqlTable("allocation_pots", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  
  potType: mysqlEnum("potType", [
    "root_authority_reserve",    // 60% of 70% - non-shareable treasury
    "circulation_pool",          // 40% of 70% - shareable for operations
    "house_operational",         // Day-to-day operations
    "steward_compensation",      // Steward/trustee payments
    "commercial_operating",      // Business entity operations
    "future_crown",              // Reserved for next generation
    "ancestral_treasury"         // 30% inheritance reserve
  ]).notNull(),
  
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0").notNull(),
  targetPercentage: decimal("targetPercentage", { precision: 5, scale: 2 }).notNull(), // e.g., 60.00 for 60%
  
  // Pot rules
  isShareable: boolean("isShareable").default(false).notNull(),
  requiresApproval: boolean("requiresApproval").default(true).notNull(),
  minimumBalance: decimal("minimumBalance", { precision: 20, scale: 8 }).default("0").notNull(),
  
  lastSyncAt: timestamp("lastSyncAt"),
  status: mysqlEnum("potStatus", ["active", "frozen", "depleted"]).default("active").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AllocationPot = typeof allocationPots.$inferSelect;
export type InsertAllocationPot = typeof allocationPots.$inferInsert;

/**
 * Allocation Transactions - Track 70/30 and 60/40 splits
 * Based on Scroll 55: Allocation Engine Protocol
 */
export const allocationTransactions = mysqlTable("allocation_transactions", {
  id: int("id").autoincrement().primaryKey(),
  
  sourceHouseId: int("sourceHouseId").notNull(),
  sourceAccountId: int("sourceAccountId"), // LuvLedger account
  
  grossAmount: decimal("grossAmount", { precision: 20, scale: 8 }).notNull(),
  
  // 70/30 Split (Treasury vs House)
  treasuryAmount: decimal("treasuryAmount", { precision: 20, scale: 8 }).notNull(), // 30%
  houseAmount: decimal("houseAmount", { precision: 20, scale: 8 }).notNull(), // 70%
  
  // 60/40 Split of House Amount (Reserve vs Circulation)
  reserveAmount: decimal("reserveAmount", { precision: 20, scale: 8 }).notNull(), // 60% of 70%
  circulationAmount: decimal("circulationAmount", { precision: 20, scale: 8 }).notNull(), // 40% of 70%
  
  transactionType: mysqlEnum("allocationType", [
    "income_allocation",
    "distribution",
    "inter_house_transfer",
    "pot_rebalance",
    "manual_adjustment"
  ]).notNull(),
  
  description: text("description"),
  referenceId: varchar("referenceId", { length: 255 }), // External reference
  
  // Validation
  validationStatus: mysqlEnum("validationStatus", ["pending", "validated", "failed", "manual_review"]).default("pending").notNull(),
  validationErrors: json("validationErrors"),
  
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
});

export type AllocationTransaction = typeof allocationTransactions.$inferSelect;
export type InsertAllocationTransaction = typeof allocationTransactions.$inferInsert;

/**
 * Sync Cycles - Scheduled financial reconciliation
 * Based on Scroll 61: LuvLedger Core Automation Logic
 */
export const syncCycles = mysqlTable("sync_cycles", {
  id: int("id").autoincrement().primaryKey(),
  
  cycleType: mysqlEnum("cycleType", [
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "annual"
  ]).notNull(),
  
  houseId: int("houseId"), // null for system-wide cycles
  
  scheduledAt: timestamp("scheduledAt").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  
  status: mysqlEnum("cycleStatus", [
    "scheduled",
    "running",
    "completed",
    "failed",
    "skipped"
  ]).default("scheduled").notNull(),
  
  // Cycle Results
  transactionsProcessed: int("transactionsProcessed").default(0).notNull(),
  allocationsCreated: int("allocationsCreated").default(0).notNull(),
  errorsEncountered: int("errorsEncountered").default(0).notNull(),
  
  summary: json("summary"), // Detailed results
  errorLog: json("errorLog"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SyncCycle = typeof syncCycles.$inferSelect;
export type InsertSyncCycle = typeof syncCycles.$inferInsert;

/**
 * Gift/Sale Ratio Tracking - Enforce 1:3 global and 2:1 per-house ratios
 * Based on Scroll 59: Gift/Sale Ratio Enforcement Logic
 */
export const giftSaleRatios = mysqlTable("gift_sale_ratios", {
  id: int("id").autoincrement().primaryKey(),
  
  houseId: int("houseId").notNull(),
  
  // Counters
  totalGiftsIssued: int("totalGiftsIssued").default(0).notNull(),
  totalSalesCompleted: int("totalSalesCompleted").default(0).notNull(),
  
  // Current Ratio Status
  currentRatio: decimal("currentRatio", { precision: 10, scale: 4 }).default("0").notNull(), // sales/gifts
  globalRatioTarget: decimal("globalRatioTarget", { precision: 5, scale: 2 }).default("3.00").notNull(), // 1:3 = 3.00
  houseRatioTarget: decimal("houseRatioTarget", { precision: 5, scale: 2 }).default("2.00").notNull(), // 2:1 = 2.00
  
  // Compliance
  isCompliant: boolean("isCompliant").default(true).notNull(),
  lastViolationAt: timestamp("lastViolationAt"),
  violationCount: int("violationCount").default(0).notNull(),
  
  // Blocking Status
  giftingBlocked: boolean("giftingBlocked").default(false).notNull(), // True if ratio violated
  blockReason: text("blockReason"),
  
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GiftSaleRatio = typeof giftSaleRatios.$inferSelect;
export type InsertGiftSaleRatio = typeof giftSaleRatios.$inferInsert;

/**
 * Economic Health Indicators - System stability monitoring
 * Based on Scroll 60: System Stability & Economic Health Logic
 */
export const economicHealthIndicators = mysqlTable("economic_health_indicators", {
  id: int("id").autoincrement().primaryKey(),
  
  houseId: int("houseId"), // null for system-wide
  
  indicatorType: mysqlEnum("indicatorType", [
    "liquidity_ratio",
    "allocation_accuracy",
    "sync_success_rate",
    "transaction_volume",
    "pot_balance_health",
    "gift_sale_compliance",
    "error_rate"
  ]).notNull(),
  
  currentValue: decimal("currentValue", { precision: 20, scale: 8 }).notNull(),
  targetValue: decimal("targetValue", { precision: 20, scale: 8 }),
  thresholdMin: decimal("thresholdMin", { precision: 20, scale: 8 }),
  thresholdMax: decimal("thresholdMax", { precision: 20, scale: 8 }),
  
  status: mysqlEnum("healthStatus", [
    "healthy",
    "warning",
    "critical",
    "unknown"
  ]).default("unknown").notNull(),
  
  measurementPeriod: mysqlEnum("measurementPeriod", [
    "hourly",
    "daily",
    "weekly",
    "monthly"
  ]).notNull(),
  
  measuredAt: timestamp("measuredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EconomicHealthIndicator = typeof economicHealthIndicators.$inferSelect;
export type InsertEconomicHealthIndicator = typeof economicHealthIndicators.$inferInsert;

/**
 * Financial Error States - Track and resolve system errors
 * Based on Scrolls 54-61 error codes (LL-01 to LL-07, AE-01 to AE-04, etc.)
 */
export const financialErrors = mysqlTable("financial_errors", {
  id: int("id").autoincrement().primaryKey(),
  
  errorCode: varchar("errorCode", { length: 20 }).notNull(), // e.g., "LL-01", "AE-03", "GSREL-05"
  errorCategory: mysqlEnum("errorCategory", [
    "luvledger",        // LL-01 to LL-07
    "allocation",       // AE-01 to AE-04
    "gift_sale",        // GSREL-01 to GSREL-06
    "sync",             // SYNC-01 to SYNC-05
    "validation",       // VAL-01 to VAL-10
    "system"            // SYS-01 to SYS-10
  ]).notNull(),
  
  severity: mysqlEnum("errorSeverity", ["info", "warning", "error", "critical"]).notNull(),
  
  houseId: int("houseId"),
  transactionId: int("transactionId"),
  syncCycleId: int("syncCycleId"),
  
  message: text("message").notNull(),
  details: json("details"),
  stackTrace: text("stackTrace"),
  
  // Resolution
  status: mysqlEnum("errorStatus", [
    "open",
    "acknowledged",
    "investigating",
    "resolved",
    "ignored"
  ]).default("open").notNull(),
  
  resolvedById: int("resolvedById"),
  resolvedAt: timestamp("resolvedAt"),
  resolution: text("resolution"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialError = typeof financialErrors.$inferSelect;
export type InsertFinancialError = typeof financialErrors.$inferInsert;

/**
 * Inflow Capture - Track all incoming funds before allocation
 * Based on Scroll 61: LuvLedger Core Automation Logic
 */
export const inflowCapture = mysqlTable("inflow_capture", {
  id: int("id").autoincrement().primaryKey(),
  
  houseId: int("houseId").notNull(),
  sourceType: mysqlEnum("sourceType", [
    "sale",
    "gift_received",
    "investment_return",
    "grant",
    "donation",
    "royalty",
    "interest",
    "other"
  ]).notNull(),
  
  grossAmount: decimal("grossAmount", { precision: 20, scale: 8 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  
  sourceDescription: text("sourceDescription"),
  externalReference: varchar("externalReference", { length: 255 }),
  
  // Processing Status
  status: mysqlEnum("inflowStatus", [
    "pending",
    "validated",
    "allocated",
    "failed",
    "manual_review"
  ]).default("pending").notNull(),
  
  allocationTransactionId: int("allocationTransactionId"), // Link to allocation once processed
  
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InflowCapture = typeof inflowCapture.$inferSelect;
export type InsertInflowCapture = typeof inflowCapture.$inferInsert;


// ============================================
// TOKEN CHAIN LOGIC (Scrolls 16, 31-35)
// ============================================

/**
 * Token Trigger Chain State (Scroll 16)
 * Tracks the MIRROR → GIFT → SPARK → HOUSE sequence
 */
export const tokenChainStates = mysqlTable("token_chain_states", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  userId: varchar("userId", { length: 255 }).notNull(),
  
  // Current position in chain
  currentTokenIndex: int("currentTokenIndex").default(0).notNull(), // 0=none, 1=MIRROR, 2=GIFT, 3=SPARK, 4=HOUSE
  activatedTokens: json("activatedTokens").$type<string[]>(),
  
  // Token activation timestamps
  mirrorActivatedAt: timestamp("mirrorActivatedAt"),
  giftActivatedAt: timestamp("giftActivatedAt"),
  sparkActivatedAt: timestamp("sparkActivatedAt"),
  houseActivatedAt: timestamp("houseActivatedAt"),
  
  // Scroll requirements tracking
  mirrorScrollsSealed: json("mirrorScrollsSealed").$type<number[]>(), // Scrolls 07, 14, 33
  giftScrollsSealed: json("giftScrollsSealed").$type<number[]>(), // Scrolls 16, 25, 26
  sparkScrollsSealed: json("sparkScrollsSealed").$type<number[]>(), // Scrolls 27, 28, 29
  houseScrollsSealed: json("houseScrollsSealed").$type<number[]>(), // Scrolls 30-36, 50
  
  // Chain status
  chainStatus: mysqlEnum("chainStatus", ["pending", "in_progress", "completed", "blocked"])
    .default("pending").notNull(),
  blockReason: text("blockReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TokenChainState = typeof tokenChainStates.$inferSelect;
export type InsertTokenChainState = typeof tokenChainStates.$inferInsert;

/**
 * Token Lock States (Scroll 31 - Mirror Token Lock Clause)
 */
export const tokenLocks = mysqlTable("token_locks", {
  id: int("id").autoincrement().primaryKey(),
  tokenId: int("tokenId").notNull(),
  tokenType: mysqlEnum("tokenType", ["mirror", "gift", "spark", "house", "crown"]).notNull(),
  houseId: int("houseId").notNull(),
  userId: varchar("userId", { length: 255 }).notNull(),
  
  // Lock configuration
  lockType: mysqlEnum("lockType", ["time_based", "scroll_based", "lineage_based", "manual"]).notNull(),
  lockDurationDays: int("lockDurationDays"),
  lockStartedAt: timestamp("lockStartedAt").defaultNow().notNull(),
  lockExpiresAt: timestamp("lockExpiresAt"),
  
  // Required scrolls for unlock
  requiredScrolls: json("requiredScrolls").$type<number[]>(),
  sealedScrolls: json("sealedScrolls").$type<number[]>(),
  
  // Lineage verification for unlock
  requiresLineageVerification: boolean("requiresLineageVerification").default(false),
  lineageVerifiedAt: timestamp("lineageVerifiedAt"),
  lineageVerifiedBy: varchar("lineageVerifiedBy", { length: 255 }),
  
  // Lock status
  lockStatus: mysqlEnum("lockStatus", ["active", "unlocked", "expired", "violated"])
    .default("active").notNull(),
  unlockedAt: timestamp("unlockedAt"),
  unlockReason: text("unlockReason"),
  
  // Violation tracking
  violationCount: int("violationCount").default(0).notNull(),
  lastViolationAt: timestamp("lastViolationAt"),
  violationDetails: json("violationDetails").$type<Array<{timestamp: string, reason: string}>>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TokenLock = typeof tokenLocks.$inferSelect;
export type InsertTokenLock = typeof tokenLocks.$inferInsert;

/**
 * Token Expansion States (Scroll 33 - Mirror Token Expansion Clause)
 */
export const tokenExpansions = mysqlTable("token_expansions", {
  id: int("id").autoincrement().primaryKey(),
  sourceTokenId: int("sourceTokenId").notNull(),
  sourceHouseId: int("sourceHouseId").notNull(),
  sourceUserId: varchar("sourceUserId", { length: 255 }).notNull(),
  
  // Expansion target
  targetHouseId: int("targetHouseId"),
  targetUserId: varchar("targetUserId", { length: 255 }),
  expansionType: mysqlEnum("expansionType", ["bloodline", "mirrored", "adaptive"]).notNull(),
  
  // Expansion requirements
  requiredScrollsComplete: boolean("requiredScrollsComplete").default(false).notNull(),
  requiredTimeElapsed: boolean("requiredTimeElapsed").default(false).notNull(),
  minimumDaysRequired: int("minimumDaysRequired").default(365),
  
  // Approval workflow
  expansionStatus: mysqlEnum("expansionStatus", ["pending", "approved", "rejected", "completed", "frozen"])
    .default("pending").notNull(),
  approvedBy: varchar("approvedBy", { length: 255 }),
  approvedAt: timestamp("approvedAt"),
  rejectionReason: text("rejectionReason"),
  
  // Enforcement (Scroll 34)
  enforcementActive: boolean("enforcementActive").default(true).notNull(),
  enforcementViolations: int("enforcementViolations").default(0).notNull(),
  frozenAt: timestamp("frozenAt"),
  freezeReason: text("freezeReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TokenExpansion = typeof tokenExpansions.$inferSelect;
export type InsertTokenExpansion = typeof tokenExpansions.$inferInsert;

/**
 * Token Activation Attempts (audit trail)
 */
export const tokenActivationAttempts = mysqlTable("token_activation_attempts", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  userId: varchar("userId", { length: 255 }).notNull(),
  
  // Attempt details
  tokenType: mysqlEnum("attemptTokenType", ["mirror", "gift", "spark", "house", "crown"]).notNull(),
  attemptStatus: mysqlEnum("attemptStatus", ["approved", "denied", "pending"]).notNull(),
  
  // Validation results
  expectedToken: varchar("expectedToken", { length: 50 }),
  scrollsRequired: json("scrollsRequired").$type<number[]>(),
  scrollsSealed: json("scrollsSealed").$type<number[]>(),
  scrollsMissing: json("scrollsMissing").$type<number[]>(),
  
  // Result
  resultMessage: text("resultMessage"),
  currentChain: json("currentChain").$type<string[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenActivationAttempt = typeof tokenActivationAttempts.$inferSelect;
export type InsertTokenActivationAttempt = typeof tokenActivationAttempts.$inferInsert;

/**
 * Scroll Seal Status (tracks which scrolls are sealed for each user)
 */
export const scrollSealStatus = mysqlTable("scroll_seal_status", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  houseId: int("houseId").notNull(),
  scrollNumber: int("scrollNumber").notNull(),
  scrollTitle: varchar("scrollTitle", { length: 255 }),
  
  // Seal status
  isSealed: boolean("isSealed").default(false).notNull(),
  sealedAt: timestamp("sealedAt"),
  sealedBy: varchar("sealedBy", { length: 255 }),
  
  // Seal verification
  sealHash: varchar("sealHash", { length: 64 }), // SHA256 hash
  verificationMethod: mysqlEnum("verificationMethod", ["manual", "automatic", "gpt_audit", "course_completion"])
    .default("manual"),
  
  // Associated course/module if applicable
  courseId: int("courseId"),
  moduleId: int("moduleId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScrollSealStatus = typeof scrollSealStatus.$inferSelect;
export type InsertScrollSealStatus = typeof scrollSealStatus.$inferInsert;


// ============================================
// GIFTING SYSTEM (Scrolls 25-26)
// ============================================

/**
 * Gift Tokens (Scroll 25 - Gifting System Logic)
 * Three types: Mirror Gift (bloodline), Adaptive Gift (trusted non-blood), Locked Gift (time-delayed)
 */
export const giftTokens = mysqlTable("gift_tokens", {
  id: int("id").autoincrement().primaryKey(),
  
  // Source (giver)
  sourceUserId: varchar("sourceUserId", { length: 255 }).notNull(),
  sourceHouseId: int("sourceHouseId").notNull(),
  
  // Target (recipient)
  targetUserId: varchar("targetUserId", { length: 255 }),
  targetHouseId: int("targetHouseId"),
  targetEmail: varchar("targetEmail", { length: 255 }), // For pending gifts
  targetName: varchar("targetName", { length: 255 }),
  
  // Gift type
  giftType: mysqlEnum("giftType", ["mirror", "adaptive", "locked"]).notNull(),
  
  // Gift details
  giftValue: decimal("giftValue", { precision: 20, scale: 8 }),
  giftDescription: text("giftDescription"),
  giftMessage: text("giftMessage"),
  
  // Activation requirements
  requiresAnniversary: boolean("requiresAnniversary").default(false),
  anniversaryDate: timestamp("anniversaryDate"),
  requiresStewardshipScrolls: boolean("requiresStewardshipScrolls").default(false),
  requiredScrolls: json("requiredScrolls").$type<number[]>(),
  
  // Lock configuration (for Locked Gift type)
  lockDurationDays: int("lockDurationDays"),
  lockExpiresAt: timestamp("lockExpiresAt"),
  
  // Lineage verification (for Mirror Gift type)
  requiresLineageVerification: boolean("requiresLineageVerification").default(false),
  lineageVerified: boolean("lineageVerified").default(false),
  lineageVerifiedAt: timestamp("lineageVerifiedAt"),
  lineageVerifiedBy: varchar("lineageVerifiedBy", { length: 255 }),
  
  // Gift status
  giftStatus: mysqlEnum("giftStatus", [
    "pending",
    "awaiting_activation",
    "activated",
    "claimed",
    "expired",
    "revoked"
  ]).default("pending").notNull(),
  
  // Activation tracking
  activatedAt: timestamp("activatedAt"),
  claimedAt: timestamp("claimedAt"),
  revokedAt: timestamp("revokedAt"),
  revokeReason: text("revokeReason"),
  
  // Hash for verification
  giftHash: varchar("giftHash", { length: 64 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GiftToken = typeof giftTokens.$inferSelect;
export type InsertGiftToken = typeof giftTokens.$inferInsert;

/**
 * Gift Activation Attempts (audit trail)
 */
export const giftActivationAttempts = mysqlTable("gift_activation_attempts", {
  id: int("id").autoincrement().primaryKey(),
  giftId: int("giftId").notNull(),
  userId: varchar("userId", { length: 255 }).notNull(),
  
  attemptStatus: mysqlEnum("giftAttemptStatus", ["approved", "denied", "pending"]).notNull(),
  
  // Validation results
  anniversaryMet: boolean("anniversaryMet"),
  scrollsComplete: boolean("scrollsComplete"),
  lineageVerified: boolean("lineageVerified"),
  lockExpired: boolean("lockExpired"),
  
  resultMessage: text("resultMessage"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GiftActivationAttempt = typeof giftActivationAttempts.$inferSelect;
export type InsertGiftActivationAttempt = typeof giftActivationAttempts.$inferInsert;


// ============================================
// HOUSE-SPECIFIC LUVLEDGER ARCHITECTURE
// Each House gets its own independent ledger
// All ledgers tie to Main House ledger for audit only
// ============================================

// House Ledgers - Each House gets its own LuvLedger upon creation
export const houseLedgers = mysqlTable("house_ledgers", {
  id: int("id").primaryKey().autoincrement(),
  houseId: int("house_id").notNull(),
  ledgerName: varchar("ledger_name", { length: 255 }).notNull(),
  ledgerHash: varchar("ledger_hash", { length: 64 }).notNull(),
  ledgerStatus: mysqlEnum("ledger_status", ["active", "suspended", "archived", "under_audit"]).default("active"),
  totalBalance: decimal("total_balance", { precision: 18, scale: 2 }).default("0.00"),
  reserveBalance: decimal("reserve_balance", { precision: 18, scale: 2 }).default("0.00"),
  circulationBalance: decimal("circulation_balance", { precision: 18, scale: 2 }).default("0.00"),
  treasuryContribution: decimal("treasury_contribution", { precision: 18, scale: 2 }).default("0.00"),
  houseRetained: decimal("house_retained", { precision: 18, scale: 2 }).default("0.00"),
  transactionCount: int("transaction_count").default(0),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type HouseLedger = typeof houseLedgers.$inferSelect;
export type InsertHouseLedger = typeof houseLedgers.$inferInsert;

// Main House Ledger - Aggregates all House ledgers (read-only access)
export const mainHouseLedger = mysqlTable("main_house_ledger", {
  id: int("id").primaryKey().autoincrement(),
  ledgerName: varchar("ledger_name", { length: 255 }).default("Root Authority Ledger"),
  totalTreasuryBalance: decimal("total_treasury_balance", { precision: 18, scale: 2 }).default("0.00"),
  totalHousesConnected: int("total_houses_connected").default(0),
  totalTransactionsProcessed: int("total_transactions_processed").default(0),
  lastAggregationAt: timestamp("last_aggregation_at"),
  aggregationHash: varchar("aggregation_hash", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type MainHouseLedger = typeof mainHouseLedger.$inferSelect;
export type InsertMainHouseLedger = typeof mainHouseLedger.$inferInsert;

// House Ledger Transactions - Records all transactions within a House ledger
export const houseLedgerTransactions = mysqlTable("house_ledger_transactions", {
  id: int("id").primaryKey().autoincrement(),
  houseLedgerId: int("house_ledger_id").notNull(),
  transactionType: mysqlEnum("hl_transaction_type", [
    "inflow", "outflow", "transfer", "allocation", "distribution",
    "treasury_contribution", "reserve_deposit", "circulation_withdrawal"
  ]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  fromAccount: varchar("from_account", { length: 255 }),
  toAccount: varchar("to_account", { length: 255 }),
  description: text("description"),
  transactionHash: varchar("transaction_hash", { length: 64 }).notNull(),
  previousHash: varchar("previous_hash", { length: 64 }),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type HouseLedgerTransaction = typeof houseLedgerTransactions.$inferSelect;
export type InsertHouseLedgerTransaction = typeof houseLedgerTransactions.$inferInsert;

// Ledger Access Logs - Audit trail for all ledger access
export const ledgerAccessLogs = mysqlTable("ledger_access_logs", {
  id: int("id").primaryKey().autoincrement(),
  houseLedgerId: int("house_ledger_id").notNull(),
  accessedByUserId: varchar("accessed_by_user_id", { length: 255 }).notNull(),
  accessType: mysqlEnum("ledger_access_type", ["view", "export", "audit", "fraud_investigation"]).notNull(),
  accessReason: text("access_reason"),
  accessApprovedBy: varchar("access_approved_by", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  accessGranted: boolean("access_granted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type LedgerAccessLog = typeof ledgerAccessLogs.$inferSelect;
export type InsertLedgerAccessLog = typeof ledgerAccessLogs.$inferInsert;

// Fraud Flags - Flags for suspicious activity requiring audit
export const fraudFlags = mysqlTable("fraud_flags", {
  id: int("id").primaryKey().autoincrement(),
  houseLedgerId: int("house_ledger_id").notNull(),
  flagType: mysqlEnum("fraud_flag_type", [
    "unusual_transaction_volume", "balance_discrepancy", "unauthorized_access_attempt",
    "hash_mismatch", "duplicate_transaction", "suspicious_pattern", "manual_report"
  ]).notNull(),
  severity: mysqlEnum("fraud_severity", ["low", "medium", "high", "critical"]).default("medium"),
  description: text("description"),
  detectedAt: timestamp("detected_at").defaultNow(),
  investigationStatus: mysqlEnum("fraud_investigation_status", [
    "pending", "under_review", "resolved_valid", "resolved_fraud", "dismissed"
  ]).default("pending"),
  investigatedBy: varchar("investigated_by", { length: 255 }),
  resolutionNotes: text("resolution_notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type FraudFlag = typeof fraudFlags.$inferSelect;
export type InsertFraudFlag = typeof fraudFlags.$inferInsert;

// Audit Requests - Formal requests to access another House's ledger
export const auditRequests = mysqlTable("audit_requests", {
  id: int("id").primaryKey().autoincrement(),
  requestingUserId: varchar("requesting_user_id", { length: 255 }).notNull(),
  targetHouseLedgerId: int("target_house_ledger_id").notNull(),
  requestReason: text("request_reason").notNull(),
  fraudFlagId: int("fraud_flag_id"),
  requestStatus: mysqlEnum("audit_request_status", [
    "pending", "approved", "denied", "expired", "completed"
  ]).default("pending"),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvalNotes: text("approval_notes"),
  accessExpiresAt: timestamp("access_expires_at"),
  accessStartedAt: timestamp("access_started_at"),
  accessEndedAt: timestamp("access_ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type AuditRequest = typeof auditRequests.$inferSelect;
export type InsertAuditRequest = typeof auditRequests.$inferInsert;


// ============================================
// CRYPTO PAYMENT INFRASTRUCTURE
// Multi-chain, globally operable payment system
// ============================================

/**
 * Supported Blockchain Networks
 * Expandable to support any new blockchain
 */
export const blockchainNetworks = mysqlTable("blockchain_networks", {
  id: int("id").primaryKey().autoincrement(),
  
  // Network identification
  networkCode: varchar("network_code", { length: 50 }).notNull().unique(), // e.g., "ETH", "BTC", "SOL"
  networkName: varchar("network_name", { length: 255 }).notNull(),
  chainId: varchar("chain_id", { length: 100 }), // For EVM chains
  
  // Network type
  networkType: mysqlEnum("network_type", [
    "mainnet", "testnet", "devnet", "private"
  ]).default("mainnet").notNull(),
  
  // Protocol type
  protocolType: mysqlEnum("protocol_type", [
    "bitcoin", "ethereum", "solana", "cosmos", "polkadot", "cardano", 
    "ripple", "stellar", "tron", "avalanche", "polygon", "arbitrum",
    "optimism", "base", "luvchain", "custom"
  ]).notNull(),
  
  // Network configuration
  rpcEndpoint: varchar("rpc_endpoint", { length: 500 }),
  wsEndpoint: varchar("ws_endpoint", { length: 500 }),
  explorerUrl: varchar("explorer_url", { length: 500 }),
  
  // Native currency
  nativeCurrency: varchar("native_currency", { length: 50 }).notNull(),
  nativeCurrencyDecimals: int("native_currency_decimals").default(18).notNull(),
  nativeCurrencySymbol: varchar("native_currency_symbol", { length: 20 }).notNull(),
  
  // Fee configuration
  averageBlockTime: int("average_block_time"), // seconds
  confirmationsRequired: int("confirmations_required").default(1).notNull(),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  isTestnet: boolean("is_testnet").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type BlockchainNetwork = typeof blockchainNetworks.$inferSelect;
export type InsertBlockchainNetwork = typeof blockchainNetworks.$inferInsert;

/**
 * Supported Tokens/Currencies
 * Includes native coins, stablecoins, and custom tokens
 */
export const supportedTokens = mysqlTable("supported_tokens", {
  id: int("id").primaryKey().autoincrement(),
  networkId: int("network_id").notNull(),
  
  // Token identification
  tokenSymbol: varchar("token_symbol", { length: 50 }).notNull(),
  tokenName: varchar("token_name", { length: 255 }).notNull(),
  contractAddress: varchar("contract_address", { length: 255 }), // null for native coins
  
  // Token type
  tokenType: mysqlEnum("token_type", [
    "native", "erc20", "erc721", "erc1155", "spl", "bep20", 
    "trc20", "stablecoin", "wrapped", "luvtoken", "custom"
  ]).notNull(),
  
  // Token properties
  decimals: int("decimals").default(18).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }),
  
  // Stablecoin properties
  isStablecoin: boolean("is_stablecoin").default(false).notNull(),
  peggedTo: varchar("pegged_to", { length: 10 }), // e.g., "USD", "EUR"
  
  // Pricing
  currentPriceUsd: decimal("current_price_usd", { precision: 20, scale: 8 }),
  priceLastUpdatedAt: timestamp("price_last_updated_at"),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  isReceivable: boolean("is_receivable").default(true).notNull(),
  isSendable: boolean("is_sendable").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SupportedToken = typeof supportedTokens.$inferSelect;
export type InsertSupportedToken = typeof supportedTokens.$inferInsert;

/**
 * Multi-Chain Wallets
 * Each user/house can have wallets on multiple chains
 */
export const multiChainWallets = mysqlTable("multi_chain_wallets", {
  id: int("id").primaryKey().autoincrement(),
  
  // Owner
  userId: int("user_id"),
  houseId: int("house_id"),
  businessEntityId: int("business_entity_id"),
  
  // Network
  networkId: int("network_id").notNull(),
  
  // Wallet details
  walletAddress: varchar("wallet_address", { length: 255 }).notNull(),
  walletLabel: varchar("wallet_label", { length: 255 }),
  
  // Wallet type
  walletType: mysqlEnum("wallet_type", [
    "hot", "cold", "custodial", "non_custodial", "multisig", "smart_contract"
  ]).default("hot").notNull(),
  
  // Security
  publicKey: text("public_key"),
  encryptedPrivateKey: text("encrypted_private_key"), // Encrypted with user's master key
  keyDerivationPath: varchar("key_derivation_path", { length: 100 }),
  
  // Multisig configuration
  isMultisig: boolean("is_multisig").default(false).notNull(),
  requiredSignatures: int("required_signatures"),
  totalSigners: int("total_signers"),
  signerAddresses: json("signer_addresses").$type<string[]>(),
  
  // Status
  status: mysqlEnum("wallet_status", ["active", "frozen", "archived", "compromised"]).default("active").notNull(),
  
  // Verification
  isVerified: boolean("is_verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type MultiChainWallet = typeof multiChainWallets.$inferSelect;
export type InsertMultiChainWallet = typeof multiChainWallets.$inferInsert;

/**
 * Wallet Balances
 * Track balances for each token in each wallet
 */
export const walletBalances = mysqlTable("wallet_balances", {
  id: int("id").primaryKey().autoincrement(),
  walletId: int("wallet_id").notNull(),
  tokenId: int("token_id").notNull(),
  
  // Balance
  balance: decimal("balance", { precision: 36, scale: 18 }).default("0").notNull(),
  balanceUsd: decimal("balance_usd", { precision: 20, scale: 2 }),
  
  // Pending
  pendingIncoming: decimal("pending_incoming", { precision: 36, scale: 18 }).default("0").notNull(),
  pendingOutgoing: decimal("pending_outgoing", { precision: 36, scale: 18 }).default("0").notNull(),
  
  // Last sync
  lastSyncedAt: timestamp("last_synced_at"),
  lastSyncBlockNumber: varchar("last_sync_block_number", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type WalletBalance = typeof walletBalances.$inferSelect;
export type InsertWalletBalance = typeof walletBalances.$inferInsert;

/**
 * Multi-Chain Crypto Transactions
 * All incoming and outgoing crypto transactions across all chains
 */
export const multiChainCryptoTransactions = mysqlTable("multi_chain_crypto_transactions", {
  id: int("id").primaryKey().autoincrement(),
  
  // Transaction identification
  transactionHash: varchar("transaction_hash", { length: 255 }).notNull(),
  networkId: int("network_id").notNull(),
  tokenId: int("token_id").notNull(),
  
  // Direction
  transactionType: mysqlEnum("crypto_tx_type", [
    "incoming", "outgoing", "internal", "swap", "bridge", "stake", "unstake"
  ]).notNull(),
  
  // Parties
  fromWalletId: int("from_wallet_id"),
  toWalletId: int("to_wallet_id"),
  fromAddress: varchar("from_address", { length: 255 }).notNull(),
  toAddress: varchar("to_address", { length: 255 }).notNull(),
  
  // Amount
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  amountUsd: decimal("amount_usd", { precision: 20, scale: 2 }),
  exchangeRateAtTime: decimal("exchange_rate_at_time", { precision: 20, scale: 8 }),
  
  // Fees
  gasFee: decimal("gas_fee", { precision: 36, scale: 18 }),
  gasFeeUsd: decimal("gas_fee_usd", { precision: 20, scale: 2 }),
  
  // Block info
  blockNumber: varchar("block_number", { length: 100 }),
  blockTimestamp: timestamp("block_timestamp"),
  confirmations: int("confirmations").default(0).notNull(),
  
  // Status
  status: mysqlEnum("crypto_tx_status", [
    "pending", "confirming", "confirmed", "failed", "cancelled", "replaced"
  ]).default("pending").notNull(),
  
  // Metadata
  memo: text("memo"),
  metadata: json("metadata"),
  
  // Integration with LuvLedger
  luvLedgerTransactionId: int("luv_ledger_transaction_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type MultiChainCryptoTransaction = typeof multiChainCryptoTransactions.$inferSelect;
export type InsertMultiChainCryptoTransaction = typeof multiChainCryptoTransactions.$inferInsert;

/**
 * Payment Requests
 * Generate payment requests with QR codes
 */
export const paymentRequests = mysqlTable("payment_requests", {
  id: int("id").primaryKey().autoincrement(),
  
  // Request identification
  requestCode: varchar("request_code", { length: 100 }).notNull().unique(),
  
  // Recipient
  recipientWalletId: int("recipient_wallet_id").notNull(),
  recipientUserId: int("recipient_user_id"),
  recipientHouseId: int("recipient_house_id"),
  
  // Amount
  requestedAmount: decimal("requested_amount", { precision: 36, scale: 18 }).notNull(),
  requestedTokenId: int("requested_token_id").notNull(),
  requestedAmountUsd: decimal("requested_amount_usd", { precision: 20, scale: 2 }),
  
  // Flexibility
  allowPartialPayment: boolean("allow_partial_payment").default(false).notNull(),
  allowAnyToken: boolean("allow_any_token").default(false).notNull(),
  acceptedTokenIds: json("accepted_token_ids").$type<number[]>(),
  
  // Payment details
  description: text("description"),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  
  // Expiration
  expiresAt: timestamp("expires_at"),
  
  // Status
  status: mysqlEnum("payment_request_status", [
    "pending", "partial", "completed", "expired", "cancelled"
  ]).default("pending").notNull(),
  
  // Received
  totalReceivedAmount: decimal("total_received_amount", { precision: 36, scale: 18 }).default("0").notNull(),
  totalReceivedUsd: decimal("total_received_usd", { precision: 20, scale: 2 }).default("0").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = typeof paymentRequests.$inferInsert;

/**
 * Payment Request Fulfillments
 * Track individual payments against a request
 */
export const paymentFulfillments = mysqlTable("payment_fulfillments", {
  id: int("id").primaryKey().autoincrement(),
  paymentRequestId: int("payment_request_id").notNull(),
  cryptoTransactionId: int("crypto_transaction_id").notNull(),
  
  // Amount applied
  amountApplied: decimal("amount_applied", { precision: 36, scale: 18 }).notNull(),
  amountAppliedUsd: decimal("amount_applied_usd", { precision: 20, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PaymentFulfillment = typeof paymentFulfillments.$inferSelect;
export type InsertPaymentFulfillment = typeof paymentFulfillments.$inferInsert;

/**
 * Currency Exchange Rates
 * Track exchange rates for all supported currencies
 */
export const exchangeRates = mysqlTable("exchange_rates", {
  id: int("id").primaryKey().autoincrement(),
  
  // Currency pair
  baseCurrency: varchar("base_currency", { length: 20 }).notNull(),
  quoteCurrency: varchar("quote_currency", { length: 20 }).notNull(),
  
  // Rate
  rate: decimal("rate", { precision: 30, scale: 15 }).notNull(),
  
  // Source
  source: varchar("source", { length: 100 }).notNull(), // e.g., "coingecko", "binance"
  
  // Timestamp
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = typeof exchangeRates.$inferInsert;

// ============================================
// GLOBAL OPERATIONS & LOCALIZATION
// ============================================

/**
 * Supported Locales
 * Languages and regional settings
 */
export const supportedLocales = mysqlTable("supported_locales", {
  id: int("id").primaryKey().autoincrement(),
  
  // Locale identification
  localeCode: varchar("locale_code", { length: 10 }).notNull().unique(), // e.g., "en-US", "es-MX"
  languageCode: varchar("language_code", { length: 5 }).notNull(), // e.g., "en", "es"
  countryCode: varchar("country_code", { length: 5 }), // e.g., "US", "MX"
  
  // Display
  displayName: varchar("display_name", { length: 100 }).notNull(),
  nativeName: varchar("native_name", { length: 100 }).notNull(),
  
  // Formatting
  dateFormat: varchar("date_format", { length: 50 }).default("YYYY-MM-DD").notNull(),
  timeFormat: varchar("time_format", { length: 50 }).default("HH:mm:ss").notNull(),
  numberFormat: varchar("number_format", { length: 50 }).default("1,234.56").notNull(),
  
  // Currency
  defaultCurrencyCode: varchar("default_currency_code", { length: 10 }).default("USD").notNull(),
  currencySymbol: varchar("currency_symbol", { length: 10 }).default("$").notNull(),
  currencySymbolPosition: mysqlEnum("currency_position", ["before", "after"]).default("before").notNull(),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SupportedLocale = typeof supportedLocales.$inferSelect;
export type InsertSupportedLocale = typeof supportedLocales.$inferInsert;

/**
 * Jurisdictions
 * Legal and regulatory jurisdictions
 */
export const jurisdictions = mysqlTable("jurisdictions", {
  id: int("id").primaryKey().autoincrement(),
  
  // Jurisdiction identification
  jurisdictionCode: varchar("jurisdiction_code", { length: 20 }).notNull().unique(),
  jurisdictionName: varchar("jurisdiction_name", { length: 255 }).notNull(),
  jurisdictionType: mysqlEnum("jurisdiction_type", [
    "country", "state", "province", "territory", "region", "city", "special_zone"
  ]).notNull(),
  
  // Parent jurisdiction
  parentJurisdictionId: int("parent_jurisdiction_id"),
  
  // Regulatory info
  cryptoLegalStatus: mysqlEnum("crypto_legal_status", [
    "legal", "restricted", "prohibited", "unregulated", "unknown"
  ]).default("unknown").notNull(),
  
  kycRequired: boolean("kyc_required").default(false).notNull(),
  amlRequired: boolean("aml_required").default(false).notNull(),
  
  // Tax info
  taxTreatyCountries: json("tax_treaty_countries").$type<string[]>(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }),
  
  // Timezone
  defaultTimezone: varchar("default_timezone", { length: 100 }),
  
  // Status
  isOperational: boolean("is_operational").default(true).notNull(),
  restrictionNotes: text("restriction_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Jurisdiction = typeof jurisdictions.$inferSelect;
export type InsertJurisdiction = typeof jurisdictions.$inferInsert;

/**
 * User Preferences
 * User-specific localization and settings
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().unique(),
  
  // Localization
  localeId: int("locale_id"),
  timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
  
  // Display preferences
  preferredCurrency: varchar("preferred_currency", { length: 10 }).default("USD").notNull(),
  preferredCryptoDisplay: mysqlEnum("crypto_display", ["symbol", "name", "both"]).default("symbol").notNull(),
  
  // Notification preferences
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  smsNotifications: boolean("sms_notifications").default(false).notNull(),
  
  // Privacy
  showBalances: boolean("show_balances").default(true).notNull(),
  publicProfile: boolean("public_profile").default(false).notNull(),
  
  // AI preferences
  preferredAiProvider: varchar("preferred_ai_provider", { length: 50 }),
  aiResponseStyle: mysqlEnum("ai_response_style", ["concise", "detailed", "conversational"]).default("detailed").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

// ============================================
// SYSTEM VERSION & AUTO-UPDATE TRACKING
// ============================================

/**
 * System Versions
 * Track system versions and updates
 */
export const systemVersions = mysqlTable("system_versions", {
  id: int("id").primaryKey().autoincrement(),
  
  // Version info
  versionNumber: varchar("version_number", { length: 50 }).notNull(),
  versionName: varchar("version_name", { length: 255 }),
  
  // Component
  componentType: mysqlEnum("component_type", [
    "core", "ai_provider", "blockchain_network", "payment_processor",
    "localization", "security", "ui", "api"
  ]).notNull(),
  componentName: varchar("component_name", { length: 255 }).notNull(),
  
  // Release info
  releaseNotes: text("release_notes"),
  breakingChanges: json("breaking_changes").$type<string[]>(),
  
  // Status
  status: mysqlEnum("version_status", [
    "development", "beta", "stable", "deprecated", "retired"
  ]).default("development").notNull(),
  
  // Dates
  releasedAt: timestamp("released_at"),
  deprecatedAt: timestamp("deprecated_at"),
  retiredAt: timestamp("retired_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SystemVersion = typeof systemVersions.$inferSelect;
export type InsertSystemVersion = typeof systemVersions.$inferInsert;

/**
 * Feature Flags
 * Control feature rollout and A/B testing
 */
export const featureFlags = mysqlTable("feature_flags", {
  id: int("id").primaryKey().autoincrement(),
  
  // Flag identification
  flagKey: varchar("flag_key", { length: 100 }).notNull().unique(),
  flagName: varchar("flag_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Targeting
  isGlobal: boolean("is_global").default(true).notNull(),
  enabledForUsers: json("enabled_for_users").$type<number[]>(),
  enabledForHouses: json("enabled_for_houses").$type<number[]>(),
  enabledPercentage: int("enabled_percentage").default(100).notNull(),
  
  // Status
  isEnabled: boolean("is_enabled").default(false).notNull(),
  
  // Metadata
  category: varchar("category", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

// ============================================
// METAVERSE READINESS (Future-Proof)
// ============================================

/**
 * Virtual Spaces
 * Metaverse locations and spaces
 */
export const virtualSpaces = mysqlTable("virtual_spaces", {
  id: int("id").primaryKey().autoincrement(),
  
  // Space identification
  spaceCode: varchar("space_code", { length: 100 }).notNull().unique(),
  spaceName: varchar("space_name", { length: 255 }).notNull(),
  
  // Platform
  platform: mysqlEnum("metaverse_platform", [
    "custom", "decentraland", "sandbox", "spatial", "horizon", "vr_chat", "other"
  ]).default("custom").notNull(),
  
  // Location
  coordinates: json("coordinates").$type<{x: number, y: number, z: number}>(),
  worldId: varchar("world_id", { length: 255 }),
  
  // Owner
  ownerHouseId: int("owner_house_id"),
  ownerUserId: int("owner_user_id"),
  
  // Properties
  capacity: int("capacity"),
  isPublic: boolean("is_public").default(true).notNull(),
  
  // Status
  status: mysqlEnum("space_status", ["active", "under_construction", "archived"]).default("under_construction").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type VirtualSpace = typeof virtualSpaces.$inferSelect;
export type InsertVirtualSpace = typeof virtualSpaces.$inferInsert;

/**
 * Digital Avatars
 * User avatars for metaverse representation
 */
export const digitalAvatars = mysqlTable("digital_avatars", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  
  // Avatar identification
  avatarName: varchar("avatar_name", { length: 255 }).notNull(),
  
  // Avatar assets
  modelUrl: varchar("model_url", { length: 500 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  
  // Customization
  customization: json("customization").$type<Record<string, any>>(),
  
  // NFT backing (optional)
  nftTokenId: varchar("nft_token_id", { length: 255 }),
  nftContractAddress: varchar("nft_contract_address", { length: 255 }),
  nftNetworkId: int("nft_network_id"),
  
  // Status
  isDefault: boolean("is_default").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type DigitalAvatar = typeof digitalAvatars.$inferSelect;
export type InsertDigitalAvatar = typeof digitalAvatars.$inferInsert;


// ============================================
// REAL ESTATE DEPARTMENT & PROPERTY MANAGEMENT
// Land acquisition, property management, restoration case integration
// ============================================

/**
 * Real Estate Properties
 * Track all land and property holdings
 */
export const realEstateProperties = mysqlTable("real_estate_properties", {
  id: int("id").primaryKey().autoincrement(),
  
  // Ownership
  houseId: int("house_id").notNull(),
  userId: int("user_id").notNull(),
  businessEntityId: int("business_entity_id"),
  
  // Property identification
  propertyCode: varchar("property_code", { length: 50 }).notNull().unique(),
  propertyName: varchar("property_name", { length: 255 }).notNull(),
  
  // Property type
  propertyType: mysqlEnum("property_type", [
    "land", "residential", "commercial", "industrial", "agricultural",
    "mixed_use", "vacant_lot", "ancestral", "restoration"
  ]).notNull(),
  
  // Location
  streetAddress: varchar("street_address", { length: 500 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  county: varchar("county", { length: 100 }),
  country: varchar("country", { length: 100 }).default("USA").notNull(),
  
  // Legal description
  parcelNumber: varchar("parcel_number", { length: 100 }),
  legalDescription: text("legal_description"),
  deedReference: varchar("deed_reference", { length: 255 }),
  
  // Property details
  acreage: decimal("acreage", { precision: 10, scale: 4 }),
  squareFeet: int("square_feet"),
  yearBuilt: int("year_built"),
  bedrooms: int("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  
  // Valuation
  purchasePrice: decimal("purchase_price", { precision: 18, scale: 2 }),
  purchaseDate: timestamp("purchase_date"),
  currentMarketValue: decimal("current_market_value", { precision: 18, scale: 2 }),
  lastAppraisalDate: timestamp("last_appraisal_date"),
  assessedValue: decimal("assessed_value", { precision: 18, scale: 2 }),
  
  // Restoration case link
  isRestorationProperty: boolean("is_restoration_property").default(false).notNull(),
  restorationCaseId: int("restoration_case_id"),
  ancestralClaimStatus: mysqlEnum("ancestral_claim_status", [
    "none", "researching", "documented", "filed", "pending", "approved", "denied"
  ]).default("none"),
  
  // Status
  ownershipStatus: mysqlEnum("ownership_status", [
    "owned", "under_contract", "pending_closing", "leased", "sold", "foreclosed"
  ]).default("owned").notNull(),
  
  // Metadata
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type RealEstateProperty = typeof realEstateProperties.$inferSelect;
export type InsertRealEstateProperty = typeof realEstateProperties.$inferInsert;

/**
 * Property Acquisitions
 * Track property purchase process
 */
export const propertyAcquisitions = mysqlTable("property_acquisitions", {
  id: int("id").primaryKey().autoincrement(),
  propertyId: int("property_id").notNull(),
  houseId: int("house_id").notNull(),
  
  // Acquisition details
  acquisitionType: mysqlEnum("acquisition_type", [
    "purchase", "inheritance", "gift", "restoration_claim", "tax_sale", "auction"
  ]).notNull(),
  
  // Financial
  offerPrice: decimal("offer_price", { precision: 18, scale: 2 }),
  acceptedPrice: decimal("accepted_price", { precision: 18, scale: 2 }),
  closingCosts: decimal("closing_costs", { precision: 18, scale: 2 }),
  downPayment: decimal("down_payment", { precision: 18, scale: 2 }),
  financedAmount: decimal("financed_amount", { precision: 18, scale: 2 }),
  
  // Timeline
  offerDate: timestamp("offer_date"),
  acceptanceDate: timestamp("acceptance_date"),
  inspectionDate: timestamp("inspection_date"),
  closingDate: timestamp("closing_date"),
  
  // Parties
  sellerName: varchar("seller_name", { length: 255 }),
  sellerContact: varchar("seller_contact", { length: 255 }),
  realEstateAgentId: int("real_estate_agent_id"),
  titleCompany: varchar("title_company", { length: 255 }),
  lenderId: int("lender_id"),
  
  // Status
  status: mysqlEnum("acquisition_status", [
    "prospecting", "offer_submitted", "under_contract", "inspection",
    "financing", "closing", "completed", "cancelled", "withdrawn"
  ]).default("prospecting").notNull(),
  
  // LuvLedger integration
  luvLedgerTransactionId: int("luv_ledger_transaction_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PropertyAcquisition = typeof propertyAcquisitions.$inferSelect;
export type InsertPropertyAcquisition = typeof propertyAcquisitions.$inferInsert;

/**
 * Property Valuations
 * Track appraisals and market value changes
 */
export const propertyValuations = mysqlTable("property_valuations", {
  id: int("id").primaryKey().autoincrement(),
  propertyId: int("property_id").notNull(),
  
  // Valuation details
  valuationType: mysqlEnum("valuation_type", [
    "appraisal", "cma", "tax_assessment", "broker_opinion", "self_assessment"
  ]).notNull(),
  
  valuationAmount: decimal("valuation_amount", { precision: 18, scale: 2 }).notNull(),
  valuationDate: timestamp("valuation_date").notNull(),
  
  // Appraiser info
  appraiserName: varchar("appraiser_name", { length: 255 }),
  appraiserLicense: varchar("appraiser_license", { length: 100 }),
  appraiserCompany: varchar("appraiser_company", { length: 255 }),
  
  // Supporting data
  comparableSales: json("comparable_sales").$type<Array<{address: string, price: number, date: string}>>(),
  notes: text("notes"),
  documentUrl: varchar("document_url", { length: 500 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PropertyValuation = typeof propertyValuations.$inferSelect;
export type InsertPropertyValuation = typeof propertyValuations.$inferInsert;

/**
 * Property Expenses
 * Track all property-related expenses
 */
export const propertyExpenses = mysqlTable("property_expenses", {
  id: int("id").primaryKey().autoincrement(),
  propertyId: int("property_id").notNull(),
  houseId: int("house_id").notNull(),
  
  // Expense details
  expenseType: mysqlEnum("property_expense_type", [
    "property_tax", "insurance", "maintenance", "repairs", "utilities",
    "hoa_fees", "management_fees", "legal_fees", "mortgage_payment",
    "improvements", "landscaping", "security", "other"
  ]).notNull(),
  
  description: varchar("description", { length: 500 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  expenseDate: timestamp("expense_date").notNull(),
  
  // Recurring
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurringFrequency: mysqlEnum("recurring_frequency", [
    "monthly", "quarterly", "semi_annual", "annual"
  ]),
  
  // Vendor
  vendorName: varchar("vendor_name", { length: 255 }),
  vendorContact: varchar("vendor_contact", { length: 255 }),
  
  // Tax deductible
  isTaxDeductible: boolean("is_tax_deductible").default(false).notNull(),
  taxCategory: varchar("tax_category", { length: 100 }),
  
  // LuvLedger integration
  luvLedgerTransactionId: int("luv_ledger_transaction_id"),
  
  // Receipt
  receiptUrl: varchar("receipt_url", { length: 500 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PropertyExpense = typeof propertyExpenses.$inferSelect;
export type InsertPropertyExpense = typeof propertyExpenses.$inferInsert;

/**
 * Property Income
 * Track rental income and other property revenue
 */
export const propertyIncome = mysqlTable("property_income", {
  id: int("id").primaryKey().autoincrement(),
  propertyId: int("property_id").notNull(),
  houseId: int("house_id").notNull(),
  
  // Income details
  incomeType: mysqlEnum("property_income_type", [
    "rent", "lease", "sale_proceeds", "insurance_claim", "tax_refund",
    "security_deposit", "late_fees", "parking", "laundry", "other"
  ]).notNull(),
  
  description: varchar("description", { length: 500 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  incomeDate: timestamp("income_date").notNull(),
  
  // Tenant info (for rental income)
  tenantName: varchar("tenant_name", { length: 255 }),
  leaseStartDate: timestamp("lease_start_date"),
  leaseEndDate: timestamp("lease_end_date"),
  
  // LuvLedger integration
  luvLedgerTransactionId: int("luv_ledger_transaction_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PropertyIncome = typeof propertyIncome.$inferSelect;
export type InsertPropertyIncome = typeof propertyIncome.$inferInsert;

/**
 * Real Estate Agents
 * Track agent relationships
 */
export const realEstateAgents = mysqlTable("real_estate_agents", {
  id: int("id").primaryKey().autoincrement(),
  houseId: int("house_id").notNull(),
  
  // Agent info
  agentName: varchar("agent_name", { length: 255 }).notNull(),
  agentLicense: varchar("agent_license", { length: 100 }),
  brokerageName: varchar("brokerage_name", { length: 255 }),
  
  // Contact
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  
  // Specialization
  specialization: mysqlEnum("agent_specialization", [
    "residential", "commercial", "land", "investment", "luxury", "foreclosure"
  ]),
  
  // Relationship
  relationshipType: mysqlEnum("agent_relationship", [
    "buyers_agent", "sellers_agent", "dual_agent", "referral"
  ]).notNull(),
  
  // Performance
  transactionsCompleted: int("transactions_completed").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  
  isActive: boolean("is_active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type RealEstateAgent = typeof realEstateAgents.$inferSelect;
export type InsertRealEstateAgent = typeof realEstateAgents.$inferInsert;

// ============================================
// HOUSE DOCUMENT VAULT
// Secure document storage per House
// ============================================

/**
 * House Document Vaults
 * Each House gets its own secure document vault
 */
export const houseDocumentVaults = mysqlTable("house_document_vaults", {
  id: int("id").primaryKey().autoincrement(),
  houseId: int("house_id").notNull().unique(),
  
  // Vault info
  vaultName: varchar("vault_name", { length: 255 }).notNull(),
  vaultHash: varchar("vault_hash", { length: 64 }).notNull(),
  
  // Storage stats
  totalDocuments: int("total_documents").default(0).notNull(),
  totalStorageBytes: bigint("total_storage_bytes", { mode: "number" }).default(0).notNull(),
  storageQuotaBytes: bigint("storage_quota_bytes", { mode: "number" }).default(10737418240).notNull(), // 10GB default
  
  // Encryption
  encryptionEnabled: boolean("encryption_enabled").default(true).notNull(),
  encryptionKeyHash: varchar("encryption_key_hash", { length: 64 }),
  
  // Status
  status: mysqlEnum("vault_status", ["active", "locked", "archived"]).default("active").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type HouseDocumentVault = typeof houseDocumentVaults.$inferSelect;
export type InsertHouseDocumentVault = typeof houseDocumentVaults.$inferInsert;

/**
 * Vault Folders
 * Organize documents within vault
 */
export const vaultFolders = mysqlTable("vault_folders", {
  id: int("id").primaryKey().autoincrement(),
  vaultId: int("vault_id").notNull(),
  parentFolderId: int("parent_folder_id"),
  
  // Folder info
  folderName: varchar("folder_name", { length: 255 }).notNull(),
  folderPath: varchar("folder_path", { length: 1000 }).notNull(),
  
  // Metadata
  documentCount: int("document_count").default(0).notNull(),
  
  // Permissions
  isPrivate: boolean("is_private").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type VaultFolder = typeof vaultFolders.$inferSelect;
export type InsertVaultFolder = typeof vaultFolders.$inferInsert;

/**
 * Vault Documents
 * Individual documents stored in vault
 */
export const vaultDocuments = mysqlTable("vault_documents", {
  id: int("id").primaryKey().autoincrement(),
  vaultId: int("vault_id").notNull(),
  folderId: int("folder_id"),
  
  // Document info
  documentName: varchar("document_name", { length: 500 }).notNull(),
  documentType: mysqlEnum("document_type", [
    "legal", "financial", "tax", "insurance", "property", "identity",
    "contract", "certificate", "receipt", "correspondence", "other"
  ]).notNull(),
  
  // File info
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileSize: int("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileHash: varchar("file_hash", { length: 64 }).notNull(),
  
  // Storage
  s3Key: varchar("s3_key", { length: 500 }).notNull(),
  s3Url: varchar("s3_url", { length: 1000 }),
  
  // Metadata
  description: text("description"),
  tags: json("tags").$type<string[]>(),
  
  // Versioning
  version: int("version").default(1).notNull(),
  previousVersionId: int("previous_version_id"),
  
  // Expiration
  expirationDate: timestamp("expiration_date"),
  
  // Uploaded by
  uploadedByUserId: int("uploaded_by_user_id").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type VaultDocument = typeof vaultDocuments.$inferSelect;
export type InsertVaultDocument = typeof vaultDocuments.$inferInsert;

/**
 * Vault Access Logs
 * Audit trail for document access
 */
export const vaultAccessLogs = mysqlTable("vault_access_logs", {
  id: int("id").primaryKey().autoincrement(),
  vaultId: int("vault_id").notNull(),
  documentId: int("document_id"),
  
  // Access info
  accessType: mysqlEnum("vault_access_type", [
    "view", "download", "upload", "delete", "share", "print"
  ]).notNull(),
  
  accessedByUserId: int("accessed_by_user_id").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  
  // Result
  accessGranted: boolean("access_granted").default(true).notNull(),
  denialReason: varchar("denial_reason", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type VaultAccessLog = typeof vaultAccessLogs.$inferSelect;
export type InsertVaultAccessLog = typeof vaultAccessLogs.$inferInsert;

// ============================================
// W-2 WORKER MANAGEMENT & PAYROLL
// Employee management and payroll processing
// ============================================

/**
 * W-2 Workers
 * Employee records for each House/Business
 */
export const w2Workers = mysqlTable("w2_workers", {
  id: int("id").primaryKey().autoincrement(),
  houseId: int("house_id").notNull(),
  businessEntityId: int("business_entity_id"),
  
  // Personal info
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  
  // Contact
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: varchar("address", { length: 500 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  
  // Tax info
  ssn: varchar("ssn_encrypted", { length: 255 }), // Encrypted
  federalFilingStatus: mysqlEnum("federal_filing_status", [
    "single", "married_filing_jointly", "married_filing_separately",
    "head_of_household", "qualifying_widow"
  ]).default("single").notNull(),
  federalAllowances: int("federal_allowances").default(0).notNull(),
  stateFilingStatus: varchar("state_filing_status", { length: 50 }),
  stateAllowances: int("state_allowances").default(0),
  
  // Employment
  employmentType: mysqlEnum("employment_type", [
    "full_time", "part_time", "seasonal", "temporary"
  ]).default("full_time").notNull(),
  department: varchar("department", { length: 100 }),
  jobTitle: varchar("job_title", { length: 255 }),
  hireDate: timestamp("hire_date").notNull(),
  terminationDate: timestamp("termination_date"),
  
  // Compensation
  payType: mysqlEnum("pay_type", ["hourly", "salary", "commission"]).default("hourly").notNull(),
  payRate: decimal("pay_rate", { precision: 18, scale: 2 }).notNull(),
  payFrequency: mysqlEnum("pay_frequency", [
    "weekly", "bi_weekly", "semi_monthly", "monthly"
  ]).default("bi_weekly").notNull(),
  
  // Direct deposit
  directDepositEnabled: boolean("direct_deposit_enabled").default(false).notNull(),
  bankRoutingNumber: varchar("bank_routing_encrypted", { length: 255 }),
  bankAccountNumber: varchar("bank_account_encrypted", { length: 255 }),
  
  // Status
  status: mysqlEnum("worker_status", ["active", "on_leave", "terminated"]).default("active").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type W2Worker = typeof w2Workers.$inferSelect;
export type InsertW2Worker = typeof w2Workers.$inferInsert;

/**
 * Payroll Periods
 * Define pay periods for payroll processing
 */
export const payrollPeriods = mysqlTable("payroll_periods", {
  id: int("id").primaryKey().autoincrement(),
  houseId: int("house_id").notNull(),
  businessEntityId: int("business_entity_id"),
  
  // Period info
  periodStartDate: timestamp("period_start_date").notNull(),
  periodEndDate: timestamp("period_end_date").notNull(),
  payDate: timestamp("pay_date").notNull(),
  
  // Status
  status: mysqlEnum("payroll_period_status", [
    "open", "processing", "approved", "paid", "closed"
  ]).default("open").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PayrollPeriod = typeof payrollPeriods.$inferSelect;
export type InsertPayrollPeriod = typeof payrollPeriods.$inferInsert;

/**
 * Payroll Runs
 * Individual payroll processing runs
 */
export const payrollRuns = mysqlTable("payroll_runs", {
  id: int("id").primaryKey().autoincrement(),
  payrollPeriodId: int("payroll_period_id").notNull(),
  workerId: int("worker_id").notNull(),
  
  // Hours/Earnings
  regularHours: decimal("regular_hours", { precision: 10, scale: 2 }).default("0").notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 10, scale: 2 }).default("0").notNull(),
  grossPay: decimal("gross_pay", { precision: 18, scale: 2 }).notNull(),
  
  // Deductions
  federalTax: decimal("federal_tax", { precision: 18, scale: 2 }).default("0").notNull(),
  stateTax: decimal("state_tax", { precision: 18, scale: 2 }).default("0").notNull(),
  localTax: decimal("local_tax", { precision: 18, scale: 2 }).default("0").notNull(),
  socialSecurity: decimal("social_security", { precision: 18, scale: 2 }).default("0").notNull(),
  medicare: decimal("medicare", { precision: 18, scale: 2 }).default("0").notNull(),
  otherDeductions: decimal("other_deductions", { precision: 18, scale: 2 }).default("0").notNull(),
  
  // Net pay
  netPay: decimal("net_pay", { precision: 18, scale: 2 }).notNull(),
  
  // LuvLedger integration
  luvLedgerTransactionId: int("luv_ledger_transaction_id"),
  
  // Status
  status: mysqlEnum("payroll_run_status", [
    "pending", "calculated", "approved", "paid", "voided"
  ]).default("pending").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PayrollRun = typeof payrollRuns.$inferSelect;
export type InsertPayrollRun = typeof payrollRuns.$inferInsert;

/**
 * Worker Tax Withholdings
 * Track YTD tax withholdings for W-2 generation
 */
export const workerTaxWithholdings = mysqlTable("worker_tax_withholdings", {
  id: int("id").primaryKey().autoincrement(),
  workerId: int("worker_id").notNull(),
  taxYear: int("tax_year").notNull(),
  
  // YTD totals
  ytdGrossPay: decimal("ytd_gross_pay", { precision: 18, scale: 2 }).default("0").notNull(),
  ytdFederalTax: decimal("ytd_federal_tax", { precision: 18, scale: 2 }).default("0").notNull(),
  ytdStateTax: decimal("ytd_state_tax", { precision: 18, scale: 2 }).default("0").notNull(),
  ytdLocalTax: decimal("ytd_local_tax", { precision: 18, scale: 2 }).default("0").notNull(),
  ytdSocialSecurity: decimal("ytd_social_security", { precision: 18, scale: 2 }).default("0").notNull(),
  ytdMedicare: decimal("ytd_medicare", { precision: 18, scale: 2 }).default("0").notNull(),
  
  // W-2 generation
  w2Generated: boolean("w2_generated").default(false).notNull(),
  w2GeneratedAt: timestamp("w2_generated_at"),
  w2DocumentId: int("w2_document_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type WorkerTaxWithholding = typeof workerTaxWithholdings.$inferSelect;
export type InsertWorkerTaxWithholding = typeof workerTaxWithholdings.$inferInsert;

/**
 * Worker Bank Accounts
 * Store bank account information for direct deposit
 */
export const workerBankAccounts = mysqlTable("worker_bank_accounts", {
  id: int("id").primaryKey().autoincrement(),
  workerId: int("worker_id").notNull(),
  
  // Account info
  accountName: varchar("account_name", { length: 100 }).notNull(), // e.g., "Primary Checking"
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  routingNumber: varchar("routing_number", { length: 9 }).notNull(), // ABA routing number
  accountNumber: varchar("account_number", { length: 17 }).notNull(), // Encrypted/masked
  accountType: mysqlEnum("account_type", ["checking", "savings"]).default("checking").notNull(),
  
  // Deposit allocation
  depositType: mysqlEnum("deposit_type", [
    "full",        // 100% of net pay
    "fixed",       // Fixed dollar amount
    "percentage"   // Percentage of net pay
  ]).default("full").notNull(),
  depositAmount: decimal("deposit_amount", { precision: 18, scale: 2 }), // For fixed/percentage
  priority: int("priority").default(1).notNull(), // Order for split deposits
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  
  // Audit
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type WorkerBankAccount = typeof workerBankAccounts.$inferSelect;
export type InsertWorkerBankAccount = typeof workerBankAccounts.$inferInsert;

/**
 * ACH Batches
 * Track ACH file generation batches
 */
export const achBatches = mysqlTable("ach_batches", {
  id: int("id").primaryKey().autoincrement(),
  
  // Batch info
  batchNumber: varchar("batch_number", { length: 50 }).notNull().unique(),
  payrollPeriodId: int("payroll_period_id"),
  
  // Company info (originator)
  companyName: varchar("company_name", { length: 16 }).notNull(),
  companyId: varchar("company_id", { length: 10 }).notNull(), // Tax ID or assigned ID
  
  // Batch totals
  totalCredits: decimal("total_credits", { precision: 18, scale: 2 }).default("0").notNull(),
  totalDebits: decimal("total_debits", { precision: 18, scale: 2 }).default("0").notNull(),
  entryCount: int("entry_count").default(0).notNull(),
  
  // Dates
  effectiveDate: timestamp("effective_date").notNull(),
  fileCreatedAt: timestamp("file_created_at"),
  
  // Status
  status: mysqlEnum("ach_batch_status", [
    "draft",
    "generated",
    "submitted",
    "accepted",
    "rejected",
    "processed"
  ]).default("draft").notNull(),
  
  // File info
  fileName: varchar("file_name", { length: 255 }),
  fileUrl: text("file_url"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AchBatch = typeof achBatches.$inferSelect;
export type InsertAchBatch = typeof achBatches.$inferInsert;

/**
 * ACH Entries
 * Individual payment entries within an ACH batch
 */
export const achEntries = mysqlTable("ach_entries", {
  id: int("id").primaryKey().autoincrement(),
  batchId: int("batch_id").notNull(),
  payrollRunId: int("payroll_run_id"),
  workerId: int("worker_id").notNull(),
  bankAccountId: int("bank_account_id").notNull(),
  
  // Entry details
  transactionCode: varchar("transaction_code", { length: 2 }).notNull(), // 22=checking credit, 32=savings credit
  routingNumber: varchar("routing_number", { length: 9 }).notNull(),
  accountNumber: varchar("account_number", { length: 17 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  
  // Identification
  individualId: varchar("individual_id", { length: 15 }).notNull(), // Employee ID or SSN
  individualName: varchar("individual_name", { length: 22 }).notNull(),
  
  // Status
  status: mysqlEnum("ach_entry_status", [
    "pending",
    "included",
    "returned",
    "settled"
  ]).default("pending").notNull(),
  returnCode: varchar("return_code", { length: 3 }), // R01, R02, etc.
  returnReason: text("return_reason"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AchEntry = typeof achEntries.$inferSelect;
export type InsertAchEntry = typeof achEntries.$inferInsert;

// ============================================
// TAX PREPARATION TOOLS
// Income tracking, deductions, and tax filing
// ============================================

/**
 * Tax Years
 * Annual tax records for each House
 */
export const taxYears = mysqlTable("tax_years", {
  id: int("id").primaryKey().autoincrement(),
  houseId: int("house_id").notNull(),
  userId: int("user_id").notNull(),
  
  // Year info
  taxYear: int("tax_year").notNull(),
  
  // Filing status
  filingStatus: mysqlEnum("tax_filing_status", [
    "single", "married_filing_jointly", "married_filing_separately",
    "head_of_household", "qualifying_widow"
  ]).notNull(),
  
  // Income summary
  totalIncome: decimal("total_income", { precision: 18, scale: 2 }).default("0").notNull(),
  adjustedGrossIncome: decimal("adjusted_gross_income", { precision: 18, scale: 2 }).default("0").notNull(),
  taxableIncome: decimal("taxable_income", { precision: 18, scale: 2 }).default("0").notNull(),
  
  // Deductions
  standardDeduction: decimal("standard_deduction", { precision: 18, scale: 2 }).default("0").notNull(),
  itemizedDeductions: decimal("itemized_deductions", { precision: 18, scale: 2 }).default("0").notNull(),
  useItemized: boolean("use_itemized").default(false).notNull(),
  
  // Tax calculation
  totalTaxLiability: decimal("total_tax_liability", { precision: 18, scale: 2 }).default("0").notNull(),
  totalTaxPaid: decimal("total_tax_paid", { precision: 18, scale: 2 }).default("0").notNull(),
  refundOrOwed: decimal("refund_or_owed", { precision: 18, scale: 2 }).default("0").notNull(),
  
  // Status
  status: mysqlEnum("tax_year_status", [
    "in_progress", "ready_to_file", "filed", "accepted", "rejected", "amended"
  ]).default("in_progress").notNull(),
  
  filedAt: timestamp("filed_at"),
  acceptedAt: timestamp("accepted_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TaxYear = typeof taxYears.$inferSelect;
export type InsertTaxYear = typeof taxYears.$inferInsert;

/**
 * Tax Documents
 * Store tax-related documents (W-2s, 1099s, receipts)
 */
export const taxDocuments = mysqlTable("tax_documents", {
  id: int("id").primaryKey().autoincrement(),
  taxYearId: int("tax_year_id").notNull(),
  houseId: int("house_id").notNull(),
  
  // Document type
  documentType: mysqlEnum("tax_document_type", [
    "w2", "1099_misc", "1099_nec", "1099_int", "1099_div", "1099_b",
    "1098", "receipt", "invoice", "bank_statement", "other"
  ]).notNull(),
  
  documentName: varchar("document_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Source
  issuerName: varchar("issuer_name", { length: 255 }),
  issuerEin: varchar("issuer_ein", { length: 20 }),
  
  // Amounts
  reportedAmount: decimal("reported_amount", { precision: 18, scale: 2 }),
  taxWithheld: decimal("tax_withheld", { precision: 18, scale: 2 }),
  
  // Storage
  vaultDocumentId: int("vault_document_id"),
  
  // Status
  isVerified: boolean("is_verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TaxDocument = typeof taxDocuments.$inferSelect;
export type InsertTaxDocument = typeof taxDocuments.$inferInsert;

/**
 * Tax Deductions
 * Track deductible expenses by category
 */
export const taxDeductions = mysqlTable("tax_deductions", {
  id: int("id").primaryKey().autoincrement(),
  taxYearId: int("tax_year_id").notNull(),
  houseId: int("house_id").notNull(),
  
  // Deduction category
  category: mysqlEnum("deduction_category", [
    "mortgage_interest", "property_tax", "state_local_tax", "charitable",
    "medical", "business_expense", "home_office", "education",
    "retirement_contribution", "health_savings", "child_care", "other"
  ]).notNull(),
  
  description: varchar("description", { length: 500 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  deductionDate: timestamp("deduction_date").notNull(),
  
  // Supporting document
  receiptUrl: varchar("receipt_url", { length: 500 }),
  vaultDocumentId: int("vault_document_id"),
  
  // Verification
  isVerified: boolean("is_verified").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TaxDeduction = typeof taxDeductions.$inferSelect;
export type InsertTaxDeduction = typeof taxDeductions.$inferInsert;

/**
 * Tax Filings
 * Track tax return submissions
 */
export const taxFilings = mysqlTable("tax_filings", {
  id: int("id").primaryKey().autoincrement(),
  taxYearId: int("tax_year_id").notNull(),
  houseId: int("house_id").notNull(),
  
  // Filing type
  filingType: mysqlEnum("tax_filing_type", [
    "federal", "state", "local", "amended_federal", "amended_state"
  ]).notNull(),
  
  // Form info
  formNumber: varchar("form_number", { length: 50 }).notNull(), // e.g., "1040", "1040-SR"
  
  // Submission
  submittedAt: timestamp("submitted_at"),
  submissionMethod: mysqlEnum("submission_method", [
    "e_file", "mail", "in_person"
  ]),
  confirmationNumber: varchar("confirmation_number", { length: 100 }),
  
  // Status
  status: mysqlEnum("filing_status", [
    "draft", "submitted", "accepted", "rejected", "processing"
  ]).default("draft").notNull(),
  
  rejectionReason: text("rejection_reason"),
  
  // Document
  filingDocumentId: int("filing_document_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TaxFiling = typeof taxFilings.$inferSelect;
export type InsertTaxFiling = typeof taxFilings.$inferInsert;

/**
 * Estimated Taxes
 * Track quarterly estimated tax payments
 */
export const estimatedTaxes = mysqlTable("estimated_taxes", {
  id: int("id").primaryKey().autoincrement(),
  taxYearId: int("tax_year_id").notNull(),
  houseId: int("house_id").notNull(),
  
  // Quarter
  quarter: mysqlEnum("tax_quarter", ["q1", "q2", "q3", "q4"]).notNull(),
  dueDate: timestamp("due_date").notNull(),
  
  // Amounts
  estimatedAmount: decimal("estimated_amount", { precision: 18, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 18, scale: 2 }).default("0").notNull(),
  
  // Payment
  paidAt: timestamp("paid_at"),
  paymentMethod: varchar("payment_method", { length: 100 }),
  confirmationNumber: varchar("confirmation_number", { length: 100 }),
  
  // LuvLedger integration
  luvLedgerTransactionId: int("luv_ledger_transaction_id"),
  
  // Status
  status: mysqlEnum("estimated_tax_status", [
    "pending", "paid", "partial", "overdue"
  ]).default("pending").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type EstimatedTax = typeof estimatedTaxes.$inferSelect;
export type InsertEstimatedTax = typeof estimatedTaxes.$inferInsert;

// ============================================
// RESTORATION CASE MANAGEMENT
// Track land/property restoration claims
// ============================================

/**
 * Restoration Cases
 * Track ancestral land and property restoration claims
 */
export const restorationCases = mysqlTable("restoration_cases", {
  id: int("id").primaryKey().autoincrement(),
  houseId: int("house_id").notNull(),
  userId: int("user_id").notNull(),
  
  // Case identification
  caseNumber: varchar("case_number", { length: 100 }).notNull().unique(),
  caseName: varchar("case_name", { length: 255 }).notNull(),
  
  // Claim type
  claimType: mysqlEnum("restoration_claim_type", [
    "ancestral_land", "property_theft", "deed_fraud", "tax_sale_reversal",
    "inheritance_dispute", "boundary_dispute", "title_clearing", "other"
  ]).notNull(),
  
  // Property details
  propertyDescription: text("property_description"),
  originalOwner: varchar("original_owner", { length: 255 }),
  claimantRelationship: varchar("claimant_relationship", { length: 255 }),
  
  // Location
  propertyAddress: varchar("property_address", { length: 500 }),
  county: varchar("county", { length: 100 }),
  state: varchar("state", { length: 50 }),
  parcelNumbers: json("parcel_numbers").$type<string[]>(),
  
  // Timeline
  originalOwnershipDate: timestamp("original_ownership_date"),
  dispossessionDate: timestamp("dispossession_date"),
  claimFiledDate: timestamp("claim_filed_date"),
  
  // Legal
  attorneyName: varchar("attorney_name", { length: 255 }),
  attorneyContact: varchar("attorney_contact", { length: 255 }),
  courtCaseNumber: varchar("court_case_number", { length: 100 }),
  jurisdiction: varchar("jurisdiction", { length: 255 }),
  
  // Evidence
  evidenceDocumentIds: json("evidence_document_ids").$type<number[]>(),
  
  // Financial
  estimatedValue: decimal("estimated_value", { precision: 18, scale: 2 }),
  legalFees: decimal("legal_fees", { precision: 18, scale: 2 }).default("0"),
  
  // Status
  status: mysqlEnum("restoration_case_status", [
    "research", "documenting", "filed", "pending_review", "hearing_scheduled",
    "in_litigation", "settled", "won", "lost", "appealing", "closed"
  ]).default("research").notNull(),
  
  // Outcome
  outcomeNotes: text("outcome_notes"),
  restoredPropertyId: int("restored_property_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type RestorationCase = typeof restorationCases.$inferSelect;
export type InsertRestorationCase = typeof restorationCases.$inferInsert;


// ============================================
// AUTOMATED LIFECYCLE MANAGEMENT SYSTEM
// ============================================

/**
 * Lifecycle Events - Tracks ALL events across all entity types
 * This is the central audit log for cradle-to-grave tracking
 */
export const lifecycleEvents = mysqlTable("lifecycle_events", {
  id: int("id").autoincrement().primaryKey(),
  // Entity identification
  entityType: mysqlEnum("entityType", [
    "house", "business", "property", "worker", "document", 
    "tax_return", "restoration_case", "ledger_account", "payroll"
  ]).notNull(),
  entityId: int("entityId").notNull(),
  entityName: varchar("entityName", { length: 255 }),
  // Event details
  eventType: mysqlEnum("eventType", [
    "created", "activated", "updated", "deactivated", "archived",
    "filed", "approved", "rejected", "submitted", "completed",
    "transferred", "dissolved", "acquired", "sold", "hired", "terminated"
  ]).notNull(),
  eventDescription: text("eventDescription"),
  // Ownership
  houseId: int("houseId"),
  userId: int("userId"),
  // LuvLedger integration
  luvLedgerTransactionId: int("luvLedgerTransactionId"),
  blockchainHash: varchar("blockchainHash", { length: 128 }),
  // Financial impact
  financialImpact: decimal("financialImpact", { precision: 18, scale: 2 }),
  impactType: mysqlEnum("impactType", ["income", "expense", "asset", "liability", "neutral"]),
  // Metadata
  metadata: json("metadata"),
  previousState: json("previousState"),
  newState: json("newState"),
  // Timestamps
  eventTimestamp: timestamp("eventTimestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LifecycleEvent = typeof lifecycleEvents.$inferSelect;
export type InsertLifecycleEvent = typeof lifecycleEvents.$inferInsert;

/**
 * Filing Workflows - Templates for automated document filing
 */
export const filingWorkflows = mysqlTable("filing_workflows", {
  id: int("id").autoincrement().primaryKey(),
  // Workflow identification
  workflowName: varchar("workflowName", { length: 255 }).notNull(),
  workflowCode: varchar("workflowCode", { length: 50 }).notNull(),
  description: text("description"),
  // Categorization
  filingType: mysqlEnum("filingType", [
    "state_business", "federal_business", "state_tax", "federal_tax",
    "property", "employment", "nonprofit", "trust", "trademark", "patent"
  ]).notNull(),
  jurisdiction: varchar("jurisdiction", { length: 100 }), // State or "federal"
  // Requirements
  requiredDocuments: json("requiredDocuments"), // Array of document types needed
  prerequisites: json("prerequisites"), // Other workflows that must complete first
  estimatedDays: int("estimatedDays"),
  filingFee: decimal("filingFee", { precision: 10, scale: 2 }),
  // Automation
  automationLevel: mysqlEnum("automationLevel", ["full", "partial", "manual"]).default("partial"),
  apiEndpoint: varchar("apiEndpoint", { length: 500 }), // For automated filing
  // Status
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FilingWorkflow = typeof filingWorkflows.$inferSelect;
export type InsertFilingWorkflow = typeof filingWorkflows.$inferInsert;

/**
 * Filing Tasks - Individual filing instances for a house/entity
 */
export const filingTasks = mysqlTable("filing_tasks", {
  id: int("id").autoincrement().primaryKey(),
  // Ownership
  houseId: int("houseId").notNull(),
  userId: int("userId").notNull(),
  // Workflow reference
  workflowId: int("workflowId").notNull(),
  // Entity being filed
  entityType: mysqlEnum("entityType", [
    "business", "property", "worker", "tax_return", "trademark", "trust"
  ]).notNull(),
  entityId: int("entityId"),
  // Task details
  taskName: varchar("taskName", { length: 255 }).notNull(),
  description: text("description"),
  // Status tracking
  status: mysqlEnum("status", [
    "pending", "in_progress", "awaiting_documents", "submitted",
    "under_review", "approved", "rejected", "completed", "cancelled"
  ]).default("pending").notNull(),
  // Dates
  dueDate: timestamp("dueDate"),
  submittedAt: timestamp("submittedAt"),
  completedAt: timestamp("completedAt"),
  // Filing details
  confirmationNumber: varchar("confirmationNumber", { length: 100 }),
  filingReference: varchar("filingReference", { length: 255 }),
  rejectionReason: text("rejectionReason"),
  // Documents
  attachedDocuments: json("attachedDocuments"), // Array of document IDs
  generatedDocuments: json("generatedDocuments"), // Array of generated form IDs
  // Financial
  feePaid: decimal("feePaid", { precision: 10, scale: 2 }),
  feeTransactionId: int("feeTransactionId"),
  // Automation
  automationStatus: mysqlEnum("automationStatus", [
    "not_started", "preparing", "ready_to_submit", "auto_submitted", "manual_required"
  ]).default("not_started"),
  automationLog: json("automationLog"),
  // LuvLedger
  ledgerTransactionId: int("ledgerTransactionId"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FilingTask = typeof filingTasks.$inferSelect;
export type InsertFilingTask = typeof filingTasks.$inferInsert;

/**
 * Filing Reminders - Automated reminder system for deadlines
 */
export const filingReminders = mysqlTable("filing_reminders", {
  id: int("id").autoincrement().primaryKey(),
  // Reference
  filingTaskId: int("filingTaskId").notNull(),
  houseId: int("houseId").notNull(),
  userId: int("userId").notNull(),
  // Reminder details
  reminderType: mysqlEnum("reminderType", [
    "upcoming_deadline", "overdue", "document_needed", "action_required", "status_update"
  ]).notNull(),
  message: text("message").notNull(),
  // Scheduling
  scheduledFor: timestamp("scheduledFor").notNull(),
  sentAt: timestamp("sentAt"),
  // Delivery
  deliveryMethod: mysqlEnum("deliveryMethod", ["email", "sms", "in_app", "all"]).default("in_app"),
  delivered: boolean("delivered").default(false),
  // Status
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedAt: timestamp("acknowledgedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FilingReminder = typeof filingReminders.$inferSelect;
export type InsertFilingReminder = typeof filingReminders.$inferInsert;

/**
 * Entity Lifecycle Stages - Tracks current stage of each entity
 */
export const entityLifecycleStages = mysqlTable("entity_lifecycle_stages", {
  id: int("id").autoincrement().primaryKey(),
  // Entity identification
  entityType: mysqlEnum("entityType", [
    "house", "business", "property", "worker", "document", 
    "tax_return", "restoration_case"
  ]).notNull(),
  entityId: int("entityId").notNull(),
  houseId: int("houseId"),
  // Current stage
  currentStage: mysqlEnum("currentStage", [
    // Creation stages
    "draft", "pending_creation", "created", "pending_activation", "active",
    // Operation stages
    "operating", "on_hold", "under_review", "in_compliance",
    // Transition stages
    "pending_transfer", "transferring", "pending_sale", "selling",
    // End stages
    "pending_dissolution", "dissolving", "dissolved", "archived", "deleted"
  ]).notNull(),
  // Stage history
  previousStage: varchar("previousStage", { length: 50 }),
  stageEnteredAt: timestamp("stageEnteredAt").defaultNow().notNull(),
  // Compliance
  complianceStatus: mysqlEnum("complianceStatus", [
    "compliant", "pending_review", "action_required", "non_compliant", "exempt"
  ]).default("compliant"),
  nextComplianceDate: timestamp("nextComplianceDate"),
  // Automation
  automatedTransitions: boolean("automatedTransitions").default(true),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EntityLifecycleStage = typeof entityLifecycleStages.$inferSelect;
export type InsertEntityLifecycleStage = typeof entityLifecycleStages.$inferInsert;

/**
 * Automation Rules - Defines triggers and actions for automated processing
 */
export const automationRules = mysqlTable("automation_rules", {
  id: int("id").autoincrement().primaryKey(),
  // Rule identification
  ruleName: varchar("ruleName", { length: 255 }).notNull(),
  ruleCode: varchar("ruleCode", { length: 50 }).notNull(),
  description: text("description"),
  // Trigger conditions
  triggerEntityType: mysqlEnum("triggerEntityType", [
    "house", "business", "property", "worker", "document", 
    "tax_return", "restoration_case", "ledger_account", "payroll"
  ]).notNull(),
  triggerEvent: mysqlEnum("triggerEvent", [
    "created", "activated", "updated", "stage_changed", "deadline_approaching",
    "document_uploaded", "payment_received", "filing_completed"
  ]).notNull(),
  triggerConditions: json("triggerConditions"), // Additional conditions
  // Actions
  actionType: mysqlEnum("actionType", [
    "create_filing_task", "send_notification", "log_to_ledger",
    "update_stage", "generate_document", "schedule_reminder", "api_call"
  ]).notNull(),
  actionConfig: json("actionConfig"), // Action-specific configuration
  // Execution
  priority: int("priority").default(5),
  isActive: boolean("isActive").default(true),
  lastTriggered: timestamp("lastTriggered"),
  triggerCount: int("triggerCount").default(0),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutomationRule = typeof automationRules.$inferSelect;
export type InsertAutomationRule = typeof automationRules.$inferInsert;

/**
 * Demo Mode Sessions - For test mode visualization
 */
export const demoModeSessions = mysqlTable("demo_mode_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Session details
  sessionName: varchar("sessionName", { length: 255 }),
  scenarioType: mysqlEnum("scenarioType", [
    "house_activation", "business_creation", "property_acquisition",
    "worker_onboarding", "tax_filing", "restoration_case", "full_lifecycle"
  ]).notNull(),
  // State
  currentStep: int("currentStep").default(0),
  totalSteps: int("totalSteps"),
  stepData: json("stepData"), // Array of step details
  // Visualization
  showLedgerEntries: boolean("showLedgerEntries").default(true),
  showFilingProgress: boolean("showFilingProgress").default(true),
  animationSpeed: mysqlEnum("animationSpeed", ["slow", "normal", "fast"]).default("normal"),
  // Status
  status: mysqlEnum("status", ["active", "paused", "completed", "cancelled"]).default("active"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DemoModeSession = typeof demoModeSessions.$inferSelect;
export type InsertDemoModeSession = typeof demoModeSessions.$inferInsert;


// ============================================
// PROFESSIONAL LEGAL DOCUMENT TEMPLATES
// ============================================

/**
 * Document Templates - Master list of all legal form templates
 */
export const documentTemplates = mysqlTable("document_templates", {
  id: int("id").autoincrement().primaryKey(),
  // Template identification
  templateCode: varchar("templateCode", { length: 50 }).notNull(), // e.g., "IRS_SS4", "STATE_LLC_CA"
  templateName: varchar("templateName", { length: 255 }).notNull(),
  description: text("description"),
  // Categorization
  category: mysqlEnum("category", [
    "state_business", "federal_business", "federal_tax", "state_tax",
    "employment", "property", "trust", "trademark", "general_legal"
  ]).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  // Jurisdiction
  jurisdiction: varchar("jurisdiction", { length: 100 }), // "federal", "CA", "TX", etc.
  jurisdictionName: varchar("jurisdictionName", { length: 255 }),
  // Form specifications
  formNumber: varchar("formNumber", { length: 50 }), // Official form number (e.g., "SS-4", "1040")
  formRevision: varchar("formRevision", { length: 20 }), // Revision date/version
  ombNumber: varchar("ombNumber", { length: 20 }), // OMB control number for federal forms
  // Page specifications
  pageCount: int("pageCount").default(1),
  pageSize: mysqlEnum("pageSize", ["letter", "legal", "a4"]).default("letter"),
  orientation: mysqlEnum("orientation", ["portrait", "landscape"]).default("portrait"),
  // Margins (in inches)
  marginTop: decimal("marginTop", { precision: 4, scale: 2 }).default("0.5"),
  marginBottom: decimal("marginBottom", { precision: 4, scale: 2 }).default("0.5"),
  marginLeft: decimal("marginLeft", { precision: 4, scale: 2 }).default("0.75"),
  marginRight: decimal("marginRight", { precision: 4, scale: 2 }).default("0.75"),
  // Font specifications
  primaryFont: varchar("primaryFont", { length: 100 }).default("Courier"),
  fontSize: int("fontSize").default(10),
  // Template content
  templateHtml: text("templateHtml"), // HTML template with placeholders
  templateCss: text("templateCss"), // CSS for styling
  fieldMappings: json("fieldMappings"), // Maps database fields to form fields
  // Validation rules
  validationRules: json("validationRules"),
  requiredFields: json("requiredFields"),
  // Filing information
  filingInstructions: text("filingInstructions"),
  filingAddress: text("filingAddress"),
  filingUrl: varchar("filingUrl", { length: 500 }),
  filingFee: decimal("filingFee", { precision: 10, scale: 2 }),
  // Status
  isActive: boolean("isActive").default(true),
  effectiveDate: timestamp("effectiveDate"),
  expirationDate: timestamp("expirationDate"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = typeof documentTemplates.$inferInsert;

/**
 * Generated Documents - Actual documents created from templates
 */
export const generatedDocuments = mysqlTable("generated_documents", {
  id: int("id").autoincrement().primaryKey(),
  // Ownership
  houseId: int("houseId").notNull(),
  userId: int("userId").notNull(),
  // Template reference
  templateId: int("templateId").notNull(),
  templateCode: varchar("templateCode", { length: 50 }).notNull(),
  // Entity reference
  entityType: mysqlEnum("entityType", [
    "business", "property", "worker", "tax_return", "trust", "trademark"
  ]).notNull(),
  entityId: int("entityId"),
  // Document details
  documentName: varchar("documentName", { length: 255 }).notNull(),
  documentNumber: varchar("documentNumber", { length: 100 }), // Internal tracking number
  // Data used to generate
  formData: json("formData").notNull(), // All field values used
  // Generated files
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  pdfKey: varchar("pdfKey", { length: 255 }),
  htmlContent: text("htmlContent"),
  // Status
  status: mysqlEnum("status", [
    "draft", "generated", "reviewed", "signed", "filed", "accepted", "rejected"
  ]).default("draft").notNull(),
  // Signatures
  signatureRequired: boolean("signatureRequired").default(false),
  signedAt: timestamp("signedAt"),
  signedBy: varchar("signedBy", { length: 255 }),
  signatureData: text("signatureData"), // Base64 signature image or digital sig
  // Filing tracking
  filedAt: timestamp("filedAt"),
  filingMethod: mysqlEnum("filingMethod", ["mail", "online", "in_person", "fax"]),
  confirmationNumber: varchar("confirmationNumber", { length: 100 }),
  acceptedAt: timestamp("acceptedAt"),
  rejectionReason: text("rejectionReason"),
  // LuvLedger
  ledgerTransactionId: int("ledgerTransactionId"),
  // Timestamps
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type InsertGeneratedDocument = typeof generatedDocuments.$inferInsert;

/**
 * Document Field Definitions - Defines all fields for each template
 */
export const documentFieldDefinitions = mysqlTable("document_field_definitions", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  // Field identification
  fieldCode: varchar("fieldCode", { length: 100 }).notNull(),
  fieldLabel: varchar("fieldLabel", { length: 255 }).notNull(),
  // Field type
  fieldType: mysqlEnum("fieldType", [
    "text", "number", "date", "checkbox", "radio", "select",
    "ssn", "ein", "phone", "email", "address", "currency", "signature"
  ]).notNull(),
  // Position on form (for PDF placement)
  pageNumber: int("pageNumber").default(1),
  positionX: decimal("positionX", { precision: 6, scale: 2 }), // inches from left
  positionY: decimal("positionY", { precision: 6, scale: 2 }), // inches from top
  width: decimal("width", { precision: 6, scale: 2 }),
  height: decimal("height", { precision: 6, scale: 2 }),
  // Formatting
  fontSize: int("fontSize"),
  fontWeight: varchar("fontWeight", { length: 20 }),
  textAlign: mysqlEnum("textAlign", ["left", "center", "right"]).default("left"),
  maxLength: int("maxLength"),
  // Data source mapping
  dataSource: varchar("dataSource", { length: 255 }), // e.g., "business.legalName", "user.ssn"
  defaultValue: varchar("defaultValue", { length: 500 }),
  // Validation
  isRequired: boolean("isRequired").default(false),
  validationPattern: varchar("validationPattern", { length: 500 }),
  validationMessage: varchar("validationMessage", { length: 255 }),
  // Options for select/radio
  options: json("options"),
  // Display order
  displayOrder: int("displayOrder").default(0),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DocumentFieldDefinition = typeof documentFieldDefinitions.$inferSelect;
export type InsertDocumentFieldDefinition = typeof documentFieldDefinitions.$inferInsert;


// ============================================
// INTERNATIONAL OPERATIONS & MULTI-JURISDICTIONAL
// ============================================

/**
 * International Jurisdictions - Countries and their legal frameworks
 */
export const internationalJurisdictions = mysqlTable("international_jurisdictions", {
  id: int("id").autoincrement().primaryKey(),
  // Jurisdiction identification
  countryCode: varchar("countryCode", { length: 3 }).notNull(), // ISO 3166-1 alpha-3
  countryName: varchar("countryName", { length: 255 }).notNull(),
  region: mysqlEnum("region", [
    "north_america", "south_america", "europe", "africa", 
    "asia", "oceania", "caribbean", "middle_east"
  ]).notNull(),
  // Legal framework
  legalSystem: mysqlEnum("legalSystem", [
    "common_law", "civil_law", "religious_law", "customary_law", "mixed"
  ]).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(), // ISO 4217
  currencyName: varchar("currencyName", { length: 100 }),
  // Tax information
  corporateTaxRate: decimal("corporateTaxRate", { precision: 5, scale: 2 }),
  vatRate: decimal("vatRate", { precision: 5, scale: 2 }),
  withholdingTaxRate: decimal("withholdingTaxRate", { precision: 5, scale: 2 }),
  hasTaxTreatyWithUS: boolean("hasTaxTreatyWithUS").default(false),
  taxTreatyDetails: text("taxTreatyDetails"),
  // Nonprofit/charity status
  nonprofitRecognition: boolean("nonprofitRecognition").default(false),
  charityRegistrationRequired: boolean("charityRegistrationRequired").default(false),
  charityRegistrationAuthority: varchar("charityRegistrationAuthority", { length: 255 }),
  // Banking
  swiftRequired: boolean("swiftRequired").default(true),
  ibanRequired: boolean("ibanRequired").default(false),
  // Compliance
  fatcaParticipant: boolean("fatcaParticipant").default(false),
  crsParticipant: boolean("crsParticipant").default(false),
  amlRequirements: text("amlRequirements"),
  kycRequirements: text("kycRequirements"),
  // Entity types available
  availableEntityTypes: json("availableEntityTypes"),
  // Status
  isActive: boolean("isActive").default(true),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InternationalJurisdiction = typeof internationalJurisdictions.$inferSelect;
export type InsertInternationalJurisdiction = typeof internationalJurisdictions.$inferInsert;

/**
 * Foreign Entities - International subsidiaries and affiliates
 */
export const foreignEntities = mysqlTable("foreign_entities", {
  id: int("id").autoincrement().primaryKey(),
  // Ownership
  houseId: int("houseId").notNull(),
  parentEntityId: int("parentEntityId"), // US parent entity
  // Entity identification
  entityName: varchar("entityName", { length: 255 }).notNull(),
  tradingName: varchar("tradingName", { length: 255 }),
  registrationNumber: varchar("registrationNumber", { length: 100 }),
  taxId: varchar("taxId", { length: 100 }),
  vatNumber: varchar("vatNumber", { length: 100 }),
  // Jurisdiction
  jurisdictionId: int("jurisdictionId").notNull(),
  countryCode: varchar("countryCode", { length: 3 }).notNull(),
  // Entity type
  entityType: mysqlEnum("entityType", [
    // UK
    "uk_ltd", "uk_plc", "uk_llp", "uk_cic",
    // EU
    "eu_gmbh", "eu_ag", "eu_bv", "eu_sarl", "eu_sas",
    // Offshore
    "nevis_llc", "cook_islands_trust", "cayman_exempt",
    "bvi_bc", "panama_sa", "seychelles_ibc",
    // Asia
    "hk_limited", "singapore_pte", "dubai_fze",
    // Other
    "foreign_nonprofit", "foreign_branch", "representative_office"
  ]).notNull(),
  // Status
  status: mysqlEnum("status", [
    "pending_formation", "active", "dormant", "dissolved", "struck_off"
  ]).default("pending_formation").notNull(),
  // Dates
  incorporationDate: timestamp("incorporationDate"),
  financialYearEnd: varchar("financialYearEnd", { length: 10 }), // MM-DD
  // Address
  registeredAddress: text("registeredAddress"),
  businessAddress: text("businessAddress"),
  // Officers
  directors: json("directors"),
  shareholders: json("shareholders"),
  secretary: varchar("secretary", { length: 255 }),
  // Banking
  bankName: varchar("bankName", { length: 255 }),
  bankAccountNumber: varchar("bankAccountNumber", { length: 100 }),
  bankSwiftCode: varchar("bankSwiftCode", { length: 20 }),
  bankIban: varchar("bankIban", { length: 50 }),
  // Compliance
  annualReturnDue: timestamp("annualReturnDue"),
  lastAnnualReturn: timestamp("lastAnnualReturn"),
  auditRequired: boolean("auditRequired").default(false),
  // LuvLedger
  luvLedgerAccountId: int("luvLedgerAccountId"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ForeignEntity = typeof foreignEntities.$inferSelect;
export type InsertForeignEntity = typeof foreignEntities.$inferInsert;

/**
 * International Trusts - Offshore asset protection trusts
 */
export const internationalTrusts = mysqlTable("international_trusts", {
  id: int("id").autoincrement().primaryKey(),
  // Ownership
  houseId: int("houseId").notNull(),
  // Trust identification
  trustName: varchar("trustName", { length: 255 }).notNull(),
  trustType: mysqlEnum("trustType", [
    "asset_protection", "dynasty", "charitable", "spendthrift",
    "discretionary", "fixed_interest", "purpose", "hybrid"
  ]).notNull(),
  // Jurisdiction
  jurisdictionId: int("jurisdictionId").notNull(),
  countryCode: varchar("countryCode", { length: 3 }).notNull(),
  governingLaw: varchar("governingLaw", { length: 255 }),
  // Parties
  settlor: json("settlor"), // Person creating the trust
  trustees: json("trustees"), // Legal owners
  protector: json("protector"), // Oversees trustees
  beneficiaries: json("beneficiaries"),
  // Trust details
  trustDeed: text("trustDeed"),
  letterOfWishes: text("letterOfWishes"),
  // Assets
  initialSettlement: decimal("initialSettlement", { precision: 18, scale: 2 }),
  currentValue: decimal("currentValue", { precision: 18, scale: 2 }),
  assets: json("assets"),
  // Status
  status: mysqlEnum("status", [
    "draft", "established", "active", "frozen", "terminated"
  ]).default("draft").notNull(),
  establishedDate: timestamp("establishedDate"),
  terminationDate: timestamp("terminationDate"),
  // Compliance
  usReportingRequired: boolean("usReportingRequired").default(true),
  form3520Filed: boolean("form3520Filed").default(false),
  form3520ADue: timestamp("form3520ADue"),
  // LuvLedger
  luvLedgerAccountId: int("luvLedgerAccountId"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InternationalTrust = typeof internationalTrusts.$inferSelect;
export type InsertInternationalTrust = typeof internationalTrusts.$inferInsert;

/**
 * Tax Treaties - US tax treaty information
 */
export const taxTreaties = mysqlTable("tax_treaties", {
  id: int("id").autoincrement().primaryKey(),
  countryCode: varchar("countryCode", { length: 3 }).notNull(),
  countryName: varchar("countryName", { length: 255 }).notNull(),
  // Treaty details
  treatyYear: int("treatyYear"),
  effectiveDate: timestamp("effectiveDate"),
  // Withholding rates
  dividendRate: decimal("dividendRate", { precision: 5, scale: 2 }),
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }),
  royaltyRate: decimal("royaltyRate", { precision: 5, scale: 2 }),
  // Special provisions
  limitationOnBenefits: boolean("limitationOnBenefits").default(false),
  exchangeOfInformation: boolean("exchangeOfInformation").default(true),
  arbitrationProvision: boolean("arbitrationProvision").default(false),
  // Documentation
  treatyText: text("treatyText"),
  technicalExplanation: text("technicalExplanation"),
  // Status
  isActive: boolean("isActive").default(true),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaxTreaty = typeof taxTreaties.$inferSelect;
export type InsertTaxTreaty = typeof taxTreaties.$inferInsert;

/**
 * International Compliance Filings - FATCA, CRS, FBAR tracking
 */
export const internationalComplianceFilings = mysqlTable("international_compliance_filings", {
  id: int("id").autoincrement().primaryKey(),
  // Ownership
  houseId: int("houseId").notNull(),
  entityId: int("entityId"), // Foreign entity or trust
  entityType: mysqlEnum("entityType", ["foreign_entity", "international_trust", "foreign_account"]).notNull(),
  // Filing type
  filingType: mysqlEnum("filingType", [
    "fbar", "fatca_8938", "form_3520", "form_3520a", "form_5471",
    "form_5472", "form_8865", "form_8858", "crs_report"
  ]).notNull(),
  // Filing details
  taxYear: int("taxYear").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  extendedDueDate: timestamp("extendedDueDate"),
  // Status
  status: mysqlEnum("status", [
    "not_started", "in_progress", "ready_to_file", "filed", "accepted", "rejected"
  ]).default("not_started").notNull(),
  filedDate: timestamp("filedDate"),
  confirmationNumber: varchar("confirmationNumber", { length: 100 }),
  // Document
  documentId: int("documentId"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InternationalComplianceFiling = typeof internationalComplianceFilings.$inferSelect;
export type InsertInternationalComplianceFiling = typeof internationalComplianceFilings.$inferInsert;

/**
 * Foreign Bank Accounts - For FBAR reporting
 */
export const foreignBankAccounts = mysqlTable("foreign_bank_accounts", {
  id: int("id").autoincrement().primaryKey(),
  // Ownership
  houseId: int("houseId").notNull(),
  userId: int("userId").notNull(),
  foreignEntityId: int("foreignEntityId"),
  // Bank details
  bankName: varchar("bankName", { length: 255 }).notNull(),
  bankAddress: text("bankAddress"),
  countryCode: varchar("countryCode", { length: 3 }).notNull(),
  // Account details
  accountNumber: varchar("accountNumber", { length: 100 }).notNull(),
  accountType: mysqlEnum("accountType", [
    "checking", "savings", "investment", "securities", "other"
  ]).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  // Routing
  swiftCode: varchar("swiftCode", { length: 20 }),
  iban: varchar("iban", { length: 50 }),
  routingNumber: varchar("routingNumber", { length: 50 }),
  // Balance tracking (for FBAR threshold)
  maxBalanceThisYear: decimal("maxBalanceThisYear", { precision: 18, scale: 2 }),
  currentBalance: decimal("currentBalance", { precision: 18, scale: 2 }),
  lastBalanceUpdate: timestamp("lastBalanceUpdate"),
  // FBAR
  fbarReportable: boolean("fbarReportable").default(false),
  lastFbarYear: int("lastFbarYear"),
  // Status
  status: mysqlEnum("status", ["active", "closed", "frozen"]).default("active").notNull(),
  openedDate: timestamp("openedDate"),
  closedDate: timestamp("closedDate"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ForeignBankAccount = typeof foreignBankAccounts.$inferSelect;
export type InsertForeignBankAccount = typeof foreignBankAccounts.$inferInsert;


// ============================================
// COMMUNITY SHARE FUND & REVENUE SHARING
// ============================================

/**
 * Community Funds - Designated allocation pools from the 40% Community Share
 * Each House can configure their own allocation percentages
 */
export const communityFunds = mysqlTable("community_funds", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  // Fund identification
  fundName: varchar("fundName", { length: 255 }).notNull(),
  fundCode: varchar("fundCode", { length: 50 }).notNull(), // e.g., "LAND", "EDU", "EMERGENCY"
  fundType: mysqlEnum("fundType", [
    "land_acquisition",      // Land & Property Acquisition
    "education",             // Education & Scholarship
    "emergency",             // Emergency Assistance
    "business_development",  // Business Development
    "cultural_preservation", // Cultural Preservation
    "discretionary",         // Discretionary/Voting
    "custom"                 // Custom fund type
  ]).notNull(),
  description: text("description"),
  // Allocation
  allocationPercentage: decimal("allocationPercentage", { precision: 5, scale: 2 }).notNull(), // % of 40% community share
  // Balances
  currentBalance: decimal("currentBalance", { precision: 18, scale: 2 }).default("0"),
  totalContributions: decimal("totalContributions", { precision: 18, scale: 2 }).default("0"),
  totalDisbursements: decimal("totalDisbursements", { precision: 18, scale: 2 }).default("0"),
  // Rules
  minimumBalance: decimal("minimumBalance", { precision: 18, scale: 2 }).default("0"),
  requiresApproval: boolean("requiresApproval").default(true),
  approvalThreshold: decimal("approvalThreshold", { precision: 18, scale: 2 }), // Amount above which approval needed
  // Status
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityFund = typeof communityFunds.$inferSelect;
export type InsertCommunityFund = typeof communityFunds.$inferInsert;

/**
 * Fund Contributions - Track money flowing INTO community funds
 */
export const fundContributions = mysqlTable("fund_contributions", {
  id: int("id").autoincrement().primaryKey(),
  fundId: int("fundId").notNull(),
  houseId: int("houseId").notNull(),
  // Source
  sourceType: mysqlEnum("sourceType", [
    "revenue_share",     // From 70/30 split
    "direct_donation",   // Direct contribution
    "grant_allocation",  // From grant funds
    "investment_return", // Investment returns
    "transfer_in"        // Transfer from another fund
  ]).notNull(),
  sourceEntityType: varchar("sourceEntityType", { length: 50 }), // business, property, etc.
  sourceEntityId: int("sourceEntityId"),
  sourceEntityName: varchar("sourceEntityName", { length: 255 }),
  // Amount
  grossAmount: decimal("grossAmount", { precision: 18, scale: 2 }).notNull(),
  netAmount: decimal("netAmount", { precision: 18, scale: 2 }).notNull(), // After any fees
  currency: varchar("currency", { length: 10 }).default("USD"),
  // Calculation trail
  parentTransactionId: int("parentTransactionId"), // Original revenue transaction
  splitPercentage: decimal("splitPercentage", { precision: 5, scale: 2 }), // % that went to this fund
  calculationNotes: text("calculationNotes"), // e.g., "30% of $1000 revenue = $300, 40% community = $120, 25% to education = $30"
  // LuvLedger
  ledgerTransactionId: int("ledgerTransactionId"),
  blockchainHash: varchar("blockchainHash", { length: 128 }),
  // Status
  status: mysqlEnum("status", ["pending", "confirmed", "reversed"]).default("confirmed"),
  contributedAt: timestamp("contributedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FundContribution = typeof fundContributions.$inferSelect;
export type InsertFundContribution = typeof fundContributions.$inferInsert;

/**
 * Fund Disbursements - Track money flowing OUT of community funds
 */
export const fundDisbursements = mysqlTable("fund_disbursements", {
  id: int("id").autoincrement().primaryKey(),
  fundId: int("fundId").notNull(),
  houseId: int("houseId").notNull(),
  // Purpose
  purposeType: mysqlEnum("purposeType", [
    "property_purchase",     // Land/property acquisition
    "scholarship",           // Education scholarship
    "tuition_assistance",    // Tuition payment
    "emergency_grant",       // Emergency assistance
    "business_loan",         // Business development loan
    "business_grant",        // Business development grant
    "cultural_event",        // Cultural preservation event
    "cultural_project",      // Cultural preservation project
    "community_vote",        // Discretionary - community voted
    "administrative",        // Administrative expenses
    "transfer_out"           // Transfer to another fund
  ]).notNull(),
  description: text("description").notNull(),
  // Recipient
  recipientType: mysqlEnum("recipientType", [
    "house_member", "house", "external_entity", "vendor", "institution", "fund"
  ]).notNull(),
  recipientId: int("recipientId"),
  recipientName: varchar("recipientName", { length: 255 }).notNull(),
  // Amount
  requestedAmount: decimal("requestedAmount", { precision: 18, scale: 2 }).notNull(),
  approvedAmount: decimal("approvedAmount", { precision: 18, scale: 2 }),
  disbursedAmount: decimal("disbursedAmount", { precision: 18, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  // Approval workflow
  status: mysqlEnum("status", [
    "draft", "pending_approval", "approved", "rejected", 
    "processing", "disbursed", "cancelled", "refunded"
  ]).default("draft").notNull(),
  requestedBy: int("requestedBy").notNull(),
  approvedBy: int("approvedBy"),
  approvalNotes: text("approvalNotes"),
  rejectionReason: text("rejectionReason"),
  // Documentation
  supportingDocuments: json("supportingDocuments"), // Array of document IDs
  receiptDocuments: json("receiptDocuments"), // Proof of disbursement
  // LuvLedger
  ledgerTransactionId: int("ledgerTransactionId"),
  blockchainHash: varchar("blockchainHash", { length: 128 }),
  // Dates
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  disbursedAt: timestamp("disbursedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundDisbursement = typeof fundDisbursements.$inferSelect;
export type InsertFundDisbursement = typeof fundDisbursements.$inferInsert;

/**
 * Revenue Sharing Events - Audit trail for automatic 70/30 splits
 */
export const revenueSharingEvents = mysqlTable("revenue_sharing_events", {
  id: int("id").autoincrement().primaryKey(),
  // Source entity (the one that earned the revenue)
  sourceEntityType: mysqlEnum("sourceEntityType", [
    "business", "property", "service", "grant", "investment", "other"
  ]).notNull(),
  sourceEntityId: int("sourceEntityId").notNull(),
  sourceEntityName: varchar("sourceEntityName", { length: 255 }),
  sourceHouseId: int("sourceHouseId").notNull(),
  // Parent House (receives the 30%)
  parentHouseId: int("parentHouseId").notNull(),
  parentHouseName: varchar("parentHouseName", { length: 255 }),
  // Revenue details
  grossRevenue: decimal("grossRevenue", { precision: 18, scale: 2 }).notNull(),
  revenueType: mysqlEnum("revenueType", [
    "sales", "service_fee", "licensing", "royalty", "rental_income",
    "grant_award", "investment_return", "dividend", "other"
  ]).notNull(),
  revenueDescription: text("revenueDescription"),
  // Split calculation
  entityRetainedAmount: decimal("entityRetainedAmount", { precision: 18, scale: 2 }).notNull(), // 70%
  platformFeeAmount: decimal("platformFeeAmount", { precision: 18, scale: 2 }).notNull(), // 30%
  platformFeePercentage: decimal("platformFeePercentage", { precision: 5, scale: 2 }).default("30.00"),
  // Platform fee justification (legal requirement)
  feeJustification: mysqlEnum("feeJustification", [
    "platform_services",      // LuvLedger, document generation, etc.
    "administrative_services", // Accounting, compliance, etc.
    "training_support",        // Education and training provided
    "technology_infrastructure", // Platform hosting, maintenance
    "compliance_monitoring",   // Legal and regulatory compliance
    "combined_services"        // Multiple services
  ]).default("combined_services"),
  servicesProvided: json("servicesProvided"), // Array of specific services
  // House internal split (60/40 on the 30%)
  reserveAmount: decimal("reserveAmount", { precision: 18, scale: 2 }), // 60% of 30%
  communityShareAmount: decimal("communityShareAmount", { precision: 18, scale: 2 }), // 40% of 30%
  // Fund allocations (breakdown of community share)
  fundAllocations: json("fundAllocations"), // { fundId: amount, ... }
  // LuvLedger transactions
  sourceLedgerTransactionId: int("sourceLedgerTransactionId"),
  parentLedgerTransactionId: int("parentLedgerTransactionId"),
  blockchainHash: varchar("blockchainHash", { length: 128 }),
  // Status
  status: mysqlEnum("status", ["pending", "processed", "failed", "reversed"]).default("pending"),
  processedAt: timestamp("processedAt"),
  errorMessage: text("errorMessage"),
  // Timestamps
  revenueDate: timestamp("revenueDate").notNull(), // When revenue was earned
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RevenueSharingEvent = typeof revenueSharingEvents.$inferSelect;
export type InsertRevenueSharingEvent = typeof revenueSharingEvents.$inferInsert;

/**
 * Platform Services Agreement - Legal documentation for fee justification
 */
export const platformServicesAgreements = mysqlTable("platform_services_agreements", {
  id: int("id").autoincrement().primaryKey(),
  // Parties
  parentHouseId: int("parentHouseId").notNull(),
  subsidiaryEntityType: mysqlEnum("subsidiaryEntityType", [
    "business", "property", "trust", "nonprofit"
  ]).notNull(),
  subsidiaryEntityId: int("subsidiaryEntityId").notNull(),
  subsidiaryEntityName: varchar("subsidiaryEntityName", { length: 255 }).notNull(),
  // Agreement details
  agreementNumber: varchar("agreementNumber", { length: 50 }).notNull(),
  effectiveDate: timestamp("effectiveDate").notNull(),
  terminationDate: timestamp("terminationDate"),
  // Fee structure
  platformFeePercentage: decimal("platformFeePercentage", { precision: 5, scale: 2 }).default("30.00"),
  minimumMonthlyFee: decimal("minimumMonthlyFee", { precision: 10, scale: 2 }),
  maximumMonthlyFee: decimal("maximumMonthlyFee", { precision: 10, scale: 2 }),
  // Services included
  servicesIncluded: json("servicesIncluded"), // Array of service descriptions
  // Legal
  governingLaw: varchar("governingLaw", { length: 100 }), // State/jurisdiction
  disputeResolution: mysqlEnum("disputeResolution", [
    "arbitration", "mediation", "litigation", "internal"
  ]).default("internal"),
  // Document
  documentId: int("documentId"), // Reference to generated document
  signedDocumentUrl: varchar("signedDocumentUrl", { length: 500 }),
  // Signatures
  parentSignedBy: int("parentSignedBy"),
  parentSignedAt: timestamp("parentSignedAt"),
  subsidiarySignedBy: int("subsidiarySignedBy"),
  subsidiarySignedAt: timestamp("subsidiarySignedAt"),
  // Status
  status: mysqlEnum("status", [
    "draft", "pending_signatures", "active", "amended", "terminated", "expired"
  ]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformServicesAgreement = typeof platformServicesAgreements.$inferSelect;
export type InsertPlatformServicesAgreement = typeof platformServicesAgreements.$inferInsert;


// ============================================
// HEIR DISTRIBUTION SYSTEM
// ============================================

/**
 * House Heirs - Designated beneficiaries with locked distribution percentages
 * Percentages are locked once established to ensure sustainable generational wealth
 */
export const houseHeirs = mysqlTable("house_heirs", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  // Heir identification
  userId: int("userId"), // If heir is a registered user
  fullName: varchar("fullName", { length: 255 }).notNull(),
  relationship: mysqlEnum("relationship", [
    "child", "grandchild", "great_grandchild", "spouse", "sibling",
    "niece_nephew", "cousin", "adopted", "guardian_ward", "other"
  ]).notNull(),
  dateOfBirth: timestamp("dateOfBirth"),
  // Contact (for non-registered heirs)
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  // Distribution percentage (LOCKED after establishment)
  distributionPercentage: decimal("distributionPercentage", { precision: 5, scale: 2 }).notNull(),
  percentageLocked: boolean("percentageLocked").default(false),
  percentageLockedAt: timestamp("percentageLockedAt"),
  percentageLockedBy: int("percentageLockedBy"),
  // Vesting status
  vestingStatus: mysqlEnum("vestingStatus", [
    "not_started", "partial", "fully_vested", "forfeited"
  ]).default("not_started"),
  vestedPercentage: decimal("vestedPercentage", { precision: 5, scale: 2 }).default("0"),
  // Distribution preferences
  distributionMethod: mysqlEnum("distributionMethod", [
    "immediate",      // Distribute as earned
    "accumulate",     // Hold in accumulation account
    "hybrid"          // Partial immediate, partial accumulate
  ]).default("accumulate"),
  accumulationPercentage: decimal("accumulationPercentage", { precision: 5, scale: 2 }).default("100"), // % to accumulate if hybrid
  // Spendthrift protection
  spendthriftEnabled: boolean("spendthriftEnabled").default(true),
  // Status
  status: mysqlEnum("status", ["active", "suspended", "removed", "deceased"]).default("active"),
  designatedAt: timestamp("designatedAt").defaultNow().notNull(),
  designatedBy: int("designatedBy").notNull(),
  // Legal documentation
  designationDocumentId: int("designationDocumentId"),
  // Totals
  totalDistributed: decimal("totalDistributed", { precision: 18, scale: 2 }).default("0"),
  totalAccumulated: decimal("totalAccumulated", { precision: 18, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HouseHeir = typeof houseHeirs.$inferSelect;
export type InsertHouseHeir = typeof houseHeirs.$inferInsert;

/**
 * Heir Vesting Schedules - Milestone-based vesting for heir distributions
 */
export const heirVestingSchedules = mysqlTable("heir_vesting_schedules", {
  id: int("id").autoincrement().primaryKey(),
  heirId: int("heirId").notNull(),
  houseId: int("houseId").notNull(),
  // Vesting milestone
  milestoneType: mysqlEnum("milestoneType", [
    "age",              // Reach specific age
    "education",        // Complete education level
    "house_participation", // Active in House activities
    "business_completion", // Complete business workshop
    "time_based",       // Time since designation
    "custom"            // Custom condition
  ]).notNull(),
  // Milestone details
  milestoneName: varchar("milestoneName", { length: 255 }).notNull(),
  milestoneDescription: text("milestoneDescription"),
  // For age-based
  targetAge: int("targetAge"),
  // For education-based
  educationLevel: mysqlEnum("educationLevel", [
    "high_school", "associates", "bachelors", "masters", "doctorate", "trade_certification"
  ]),
  // For time-based
  vestingMonths: int("vestingMonths"), // Months from designation
  // Vesting percentage at this milestone
  vestingPercentage: decimal("vestingPercentage", { precision: 5, scale: 2 }).notNull(),
  // Status
  status: mysqlEnum("status", ["pending", "achieved", "waived", "expired"]).default("pending"),
  achievedAt: timestamp("achievedAt"),
  verifiedBy: int("verifiedBy"),
  verificationNotes: text("verificationNotes"),
  // Order
  milestoneOrder: int("milestoneOrder").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HeirVestingSchedule = typeof heirVestingSchedules.$inferSelect;
export type InsertHeirVestingSchedule = typeof heirVestingSchedules.$inferInsert;

/**
 * Heir Distributions - Record of automatic distributions to heirs
 */
export const heirDistributions = mysqlTable("heir_distributions", {
  id: int("id").autoincrement().primaryKey(),
  heirId: int("heirId").notNull(),
  houseId: int("houseId").notNull(),
  // Source
  sourceType: mysqlEnum("sourceType", [
    "community_share",    // From 40% community share
    "direct_gift",        // Direct gift to heir
    "vesting_release",    // Released from vesting
    "accumulation_release" // Released from accumulation
  ]).notNull(),
  sourceEventId: int("sourceEventId"), // Revenue sharing event ID
  // Amount calculation
  grossAmount: decimal("grossAmount", { precision: 18, scale: 2 }).notNull(),
  heirPercentage: decimal("heirPercentage", { precision: 5, scale: 2 }).notNull(),
  vestedPercentage: decimal("vestedPercentage", { precision: 5, scale: 2 }).notNull(),
  netAmount: decimal("netAmount", { precision: 18, scale: 2 }).notNull(), // After vesting adjustment
  // Distribution vs Accumulation
  distributedAmount: decimal("distributedAmount", { precision: 18, scale: 2 }).default("0"),
  accumulatedAmount: decimal("accumulatedAmount", { precision: 18, scale: 2 }).default("0"),
  // Calculation trail
  calculationNotes: text("calculationNotes"),
  // LuvLedger
  ledgerTransactionId: int("ledgerTransactionId"),
  blockchainHash: varchar("blockchainHash", { length: 128 }),
  // Status
  status: mysqlEnum("status", ["pending", "processed", "held", "released", "reversed"]).default("processed"),
  processedAt: timestamp("processedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HeirDistribution = typeof heirDistributions.$inferSelect;
export type InsertHeirDistribution = typeof heirDistributions.$inferInsert;

/**
 * Heir Accumulation Accounts - Holds distributions until release conditions met
 */
export const heirAccumulationAccounts = mysqlTable("heir_accumulation_accounts", {
  id: int("id").autoincrement().primaryKey(),
  heirId: int("heirId").notNull(),
  houseId: int("houseId").notNull(),
  // Balance
  currentBalance: decimal("currentBalance", { precision: 18, scale: 2 }).default("0"),
  totalDeposits: decimal("totalDeposits", { precision: 18, scale: 2 }).default("0"),
  totalWithdrawals: decimal("totalWithdrawals", { precision: 18, scale: 2 }).default("0"),
  totalInterestEarned: decimal("totalInterestEarned", { precision: 18, scale: 2 }).default("0"),
  // Interest/growth settings
  interestRate: decimal("interestRate", { precision: 5, scale: 4 }).default("0"), // Annual rate
  compoundingFrequency: mysqlEnum("compoundingFrequency", [
    "daily", "monthly", "quarterly", "annually"
  ]).default("monthly"),
  lastInterestDate: timestamp("lastInterestDate"),
  // Release conditions
  minimumAge: int("minimumAge").default(18),
  releaseSchedule: mysqlEnum("releaseSchedule", [
    "lump_sum",         // All at once when conditions met
    "graduated",        // Percentage at each milestone
    "monthly",          // Monthly after conditions met
    "annual"            // Annual after conditions met
  ]).default("graduated"),
  // Spendthrift
  spendthriftProtected: boolean("spendthriftProtected").default(true),
  // Status
  status: mysqlEnum("status", ["active", "frozen", "closed"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HeirAccumulationAccount = typeof heirAccumulationAccounts.$inferSelect;
export type InsertHeirAccumulationAccount = typeof heirAccumulationAccounts.$inferInsert;

/**
 * Spendthrift Provisions - Creditor protection settings per heir
 */
export const spendthriftProvisions = mysqlTable("spendthrift_provisions", {
  id: int("id").autoincrement().primaryKey(),
  heirId: int("heirId").notNull(),
  houseId: int("houseId").notNull(),
  // Protection level
  protectionLevel: mysqlEnum("protectionLevel", [
    "full",       // Complete protection from all creditors
    "partial",    // Protection with exceptions
    "none"        // No protection (heir's choice)
  ]).default("full"),
  // Exceptions (if partial)
  allowedExceptions: json("allowedExceptions"), // Array of exception types
  // Legal documentation
  provisionDocumentId: int("provisionDocumentId"),
  governingLaw: varchar("governingLaw", { length: 100 }), // State/jurisdiction
  // Status
  status: mysqlEnum("status", ["active", "modified", "waived"]).default("active"),
  effectiveDate: timestamp("effectiveDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SpendthriftProvision = typeof spendthriftProvisions.$inferSelect;
export type InsertSpendthriftProvision = typeof spendthriftProvisions.$inferInsert;

/**
 * Heir Distribution Lock - Prevents changes to heir percentages once locked
 */
export const heirDistributionLocks = mysqlTable("heir_distribution_locks", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  // Lock status
  isLocked: boolean("isLocked").default(false),
  lockedAt: timestamp("lockedAt"),
  lockedBy: int("lockedBy"),
  // Lock reason and documentation
  lockReason: text("lockReason"),
  lockDocumentId: int("lockDocumentId"),
  // Total percentage allocated (must equal 100% when locked)
  totalAllocatedPercentage: decimal("totalAllocatedPercentage", { precision: 5, scale: 2 }),
  // Unlock conditions (if any)
  canUnlock: boolean("canUnlock").default(false),
  unlockConditions: text("unlockConditions"),
  // History
  lastModifiedAt: timestamp("lastModifiedAt"),
  lastModifiedBy: int("lastModifiedBy"),
  modificationHistory: json("modificationHistory"), // Array of changes before lock
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HeirDistributionLock = typeof heirDistributionLocks.$inferSelect;
export type InsertHeirDistributionLock = typeof heirDistributionLocks.$inferInsert;


// ============================================
// POSITION MANAGEMENT & EMPLOYMENT SYSTEM
// ============================================

/**
 * Business Positions - Define positions available in each business entity
 */
export const businessPositions = mysqlTable("business_positions", {
  id: int("id").autoincrement().primaryKey(),
  // Entity this position belongs to
  businessEntityId: int("businessEntityId").notNull(),
  houseId: int("houseId").notNull(),
  
  // Position details
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }),
  description: text("description"),
  responsibilities: json("responsibilities"), // Array of duty descriptions
  
  // Classification (critical for legal compliance)
  classificationType: mysqlEnum("classificationType", [
    "w2_employee",      // Regular employee - salary/hourly
    "w2_officer",       // Corporate officer - must be W-2
    "1099_contractor",  // Independent contractor
    "k1_member",        // LLC member - receives K-1
    "volunteer",        // Unpaid position
    "board_member"      // Board/director position
  ]).notNull(),
  
  // Employment type (for W-2)
  employmentType: mysqlEnum("employmentType", [
    "full_time",        // 40+ hours/week
    "part_time",        // Less than 40 hours/week
    "seasonal",         // Temporary/seasonal
    "temporary"         // Fixed term
  ]),
  
  // Exemption status (for overtime)
  exemptionStatus: mysqlEnum("exemptionStatus", [
    "exempt",           // Salary, no overtime
    "non_exempt"        // Hourly, overtime eligible
  ]).default("non_exempt"),
  
  // Compensation structure
  compensationType: mysqlEnum("compensationType", [
    "salary",           // Fixed annual amount
    "hourly",           // Per hour rate
    "commission",       // Sales-based
    "fee",              // Per project (contractors)
    "guaranteed_payment", // LLC member guaranteed payment
    "profit_share",     // K-1 profit distribution
    "stipend",          // Fixed periodic amount (board)
    "unpaid"            // Volunteer
  ]).notNull(),
  
  // Pay rates
  salaryAmount: decimal("salaryAmount", { precision: 12, scale: 2 }),
  hourlyRate: decimal("hourlyRate", { precision: 8, scale: 2 }),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }),
  
  // Pay schedule
  payFrequency: mysqlEnum("payFrequency", [
    "weekly", "biweekly", "semimonthly", "monthly", "per_project"
  ]).default("biweekly"),
  
  // Benefits eligibility
  benefitsEligible: boolean("benefitsEligible").default(false),
  
  // Requirements
  requiresBackgroundCheck: boolean("requiresBackgroundCheck").default(false),
  requiresCourseCompletion: boolean("requiresCourseCompletion").default(false),
  requiredCourseId: int("requiredCourseId"),
  
  // Linked simulator (if position manages a training simulator)
  linkedSimulatorId: int("linkedSimulatorId"),
  
  // Status
  status: mysqlEnum("status", ["open", "filled", "closed"]).default("open"),
  maxHolders: int("maxHolders").default(1), // How many can hold this position
  currentHolders: int("currentHolders").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BusinessPosition = typeof businessPositions.$inferSelect;
export type InsertBusinessPosition = typeof businessPositions.$inferInsert;

/**
 * Position Holders - People assigned to positions
 */
export const positionHolders = mysqlTable("position_holders", {
  id: int("id").autoincrement().primaryKey(),
  positionId: int("positionId").notNull(),
  
  // Person holding position
  userId: int("userId"), // If registered user
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  ssn: varchar("ssn", { length: 11 }), // Encrypted - needed for tax docs
  dateOfBirth: timestamp("dateOfBirth"),
  
  // Relationship to house owner
  relationshipType: mysqlEnum("relationshipType", [
    "family_blood",     // Blood relative
    "family_marriage",  // Married into family
    "family_adopted",   // Adopted family
    "close_friend",     // Trusted non-family
    "business_partner", // External business relationship
    "employee"          // No personal relationship
  ]).notNull(),
  specificRelationship: varchar("specificRelationship", { length: 100 }), // e.g., "daughter", "brother-in-law"
  
  // Employment dates
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  terminationReason: text("terminationReason"),
  
  // Actual compensation (may differ from position default)
  actualSalary: decimal("actualSalary", { precision: 12, scale: 2 }),
  actualHourlyRate: decimal("actualHourlyRate", { precision: 8, scale: 2 }),
  
  // Tax withholding elections (from W-4)
  federalFilingStatus: mysqlEnum("federalFilingStatus", [
    "single", "married_filing_jointly", "married_filing_separately", "head_of_household"
  ]),
  federalAllowances: int("federalAllowances").default(0),
  additionalWithholding: decimal("additionalWithholding", { precision: 8, scale: 2 }).default("0"),
  stateFilingStatus: varchar("stateFilingStatus", { length: 50 }),
  stateAllowances: int("stateAllowances").default(0),
  
  // Direct deposit
  bankName: varchar("bankName", { length: 100 }),
  bankRoutingNumber: varchar("bankRoutingNumber", { length: 9 }),
  bankAccountNumber: varchar("bankAccountNumber", { length: 20 }), // Encrypted
  accountType: mysqlEnum("accountType", ["checking", "savings"]),
  
  // Onboarding status
  onboardingComplete: boolean("onboardingComplete").default(false),
  onboardingCompletedAt: timestamp("onboardingCompletedAt"),
  
  // Documents signed
  employmentAgreementSigned: boolean("employmentAgreementSigned").default(false),
  w4Signed: boolean("w4Signed").default(false),
  i9Signed: boolean("i9Signed").default(false),
  w9Signed: boolean("w9Signed").default(false), // For contractors
  directDepositSigned: boolean("directDepositSigned").default(false),
  handbookAcknowledged: boolean("handbookAcknowledged").default(false),
  
  // Status
  status: mysqlEnum("status", [
    "pending_onboarding", "active", "on_leave", "terminated", "resigned"
  ]).default("pending_onboarding"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PositionHolder = typeof positionHolders.$inferSelect;
export type InsertPositionHolder = typeof positionHolders.$inferInsert;

/**
 * Employment Documents - Generated legal documents
 */
export const employmentDocuments = mysqlTable("employment_documents", {
  id: int("id").autoincrement().primaryKey(),
  positionHolderId: int("positionHolderId").notNull(),
  positionId: int("positionId").notNull(),
  houseId: int("houseId").notNull(),
  
  // Document type
  documentType: mysqlEnum("documentType", [
    "offer_letter",
    "employment_agreement",
    "contractor_agreement",
    "w4_form",
    "i9_form",
    "w9_form",
    "job_description",
    "direct_deposit_form",
    "handbook_acknowledgment",
    "confidentiality_agreement",
    "non_compete_agreement",
    "operating_agreement_amendment",
    "membership_certificate",
    "board_resolution",
    "background_check_authorization",
    "termination_letter",
    "resignation_letter"
  ]).notNull(),
  
  // Document details
  documentName: varchar("documentName", { length: 255 }).notNull(),
  documentVersion: int("documentVersion").default(1),
  
  // Storage
  vaultDocumentId: int("vaultDocumentId"), // Reference to vault storage
  s3Url: varchar("s3Url", { length: 500 }),
  
  // Signature status
  requiresSignature: boolean("requiresSignature").default(true),
  signedAt: timestamp("signedAt"),
  signedByUserId: int("signedByUserId"),
  signatureHash: varchar("signatureHash", { length: 64 }),
  
  // Witness (if required)
  witnessRequired: boolean("witnessRequired").default(false),
  witnessName: varchar("witnessName", { length: 255 }),
  witnessSignedAt: timestamp("witnessSignedAt"),
  
  // Effective dates
  effectiveDate: timestamp("effectiveDate"),
  expirationDate: timestamp("expirationDate"),
  
  // Status
  status: mysqlEnum("status", [
    "draft", "pending_signature", "signed", "expired", "superseded", "voided"
  ]).default("draft"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmploymentDocument = typeof employmentDocuments.$inferSelect;
export type InsertEmploymentDocument = typeof employmentDocuments.$inferInsert;

/**
 * Payroll Records - Track all compensation payments
 */
export const payrollRecords = mysqlTable("payroll_records", {
  id: int("id").autoincrement().primaryKey(),
  positionHolderId: int("positionHolderId").notNull(),
  positionId: int("positionId").notNull(),
  businessEntityId: int("businessEntityId").notNull(),
  houseId: int("houseId").notNull(),
  
  // Pay period
  payPeriodStart: timestamp("payPeriodStart").notNull(),
  payPeriodEnd: timestamp("payPeriodEnd").notNull(),
  payDate: timestamp("payDate").notNull(),
  
  // Hours (for hourly employees)
  regularHours: decimal("regularHours", { precision: 6, scale: 2 }).default("0"),
  overtimeHours: decimal("overtimeHours", { precision: 6, scale: 2 }).default("0"),
  
  // Gross pay
  grossPay: decimal("grossPay", { precision: 12, scale: 2 }).notNull(),
  regularPay: decimal("regularPay", { precision: 12, scale: 2 }).default("0"),
  overtimePay: decimal("overtimePay", { precision: 12, scale: 2 }).default("0"),
  bonusPay: decimal("bonusPay", { precision: 12, scale: 2 }).default("0"),
  commissionPay: decimal("commissionPay", { precision: 12, scale: 2 }).default("0"),
  
  // Tax withholdings
  federalIncomeTax: decimal("federalIncomeTax", { precision: 10, scale: 2 }).default("0"),
  stateIncomeTax: decimal("stateIncomeTax", { precision: 10, scale: 2 }).default("0"),
  localIncomeTax: decimal("localIncomeTax", { precision: 10, scale: 2 }).default("0"),
  socialSecurityTax: decimal("socialSecurityTax", { precision: 10, scale: 2 }).default("0"),
  medicareTax: decimal("medicareTax", { precision: 10, scale: 2 }).default("0"),
  
  // Deductions
  healthInsurance: decimal("healthInsurance", { precision: 10, scale: 2 }).default("0"),
  retirement401k: decimal("retirement401k", { precision: 10, scale: 2 }).default("0"),
  otherDeductions: decimal("otherDeductions", { precision: 10, scale: 2 }).default("0"),
  deductionDetails: json("deductionDetails"), // Breakdown of other deductions
  
  // Net pay
  totalDeductions: decimal("totalDeductions", { precision: 12, scale: 2 }).notNull(),
  netPay: decimal("netPay", { precision: 12, scale: 2 }).notNull(),
  
  // Payment method
  paymentMethod: mysqlEnum("paymentMethod", [
    "direct_deposit", "check", "cash"
  ]).default("direct_deposit"),
  checkNumber: varchar("checkNumber", { length: 20 }),
  
  // Employer taxes (not deducted from employee)
  employerSocialSecurity: decimal("employerSocialSecurity", { precision: 10, scale: 2 }).default("0"),
  employerMedicare: decimal("employerMedicare", { precision: 10, scale: 2 }).default("0"),
  employerFuta: decimal("employerFuta", { precision: 10, scale: 2 }).default("0"),
  employerSuta: decimal("employerSuta", { precision: 10, scale: 2 }).default("0"),
  
  // Status
  status: mysqlEnum("status", [
    "pending", "processed", "paid", "voided", "adjusted"
  ]).default("pending"),
  processedAt: timestamp("processedAt"),
  
  // Audit
  createdBy: int("createdBy"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayrollRecord = typeof payrollRecords.$inferSelect;
export type InsertPayrollRecord = typeof payrollRecords.$inferInsert;

/**
 * Employer Tax Forms - Annual tax forms generated by employer (W-2, 1099, K-1)
 */
export const employerTaxForms = mysqlTable("employer_tax_forms", {
  id: int("id").autoincrement().primaryKey(),
  positionHolderId: int("positionHolderId").notNull(),
  businessEntityId: int("businessEntityId").notNull(),
  houseId: int("houseId").notNull(),
  
  // Tax year
  taxYear: int("taxYear").notNull(),
  
  // Document type
  documentType: mysqlEnum("documentType", [
    "w2",           // Employee wages
    "1099_nec",     // Non-employee compensation (contractors)
    "1099_misc",    // Miscellaneous income (trustee fees, etc.)
    "k1_1065",      // Partnership/LLC member income
    "k1_1120s"      // S-Corp shareholder income
  ]).notNull(),
  
  // Recipient info
  recipientName: varchar("recipientName", { length: 255 }).notNull(),
  recipientSSN: varchar("recipientSSN", { length: 11 }), // Encrypted
  recipientAddress: text("recipientAddress"),
  
  // Payer info
  payerName: varchar("payerName", { length: 255 }).notNull(),
  payerEIN: varchar("payerEIN", { length: 10 }).notNull(),
  payerAddress: text("payerAddress"),
  
  // W-2 specific fields
  wagesBox1: decimal("wagesBox1", { precision: 12, scale: 2 }),
  federalWithheldBox2: decimal("federalWithheldBox2", { precision: 12, scale: 2 }),
  socialSecurityWagesBox3: decimal("socialSecurityWagesBox3", { precision: 12, scale: 2 }),
  socialSecurityWithheldBox4: decimal("socialSecurityWithheldBox4", { precision: 12, scale: 2 }),
  medicareWagesBox5: decimal("medicareWagesBox5", { precision: 12, scale: 2 }),
  medicareWithheldBox6: decimal("medicareWithheldBox6", { precision: 12, scale: 2 }),
  stateWagesBox16: decimal("stateWagesBox16", { precision: 12, scale: 2 }),
  stateWithheldBox17: decimal("stateWithheldBox17", { precision: 12, scale: 2 }),
  stateCode: varchar("stateCode", { length: 2 }),
  
  // 1099 specific fields
  nonemployeeCompensation: decimal("nonemployeeCompensation", { precision: 12, scale: 2 }),
  
  // K-1 specific fields
  ordinaryIncome: decimal("ordinaryIncome", { precision: 12, scale: 2 }),
  guaranteedPayments: decimal("guaranteedPayments", { precision: 12, scale: 2 }),
  capitalGains: decimal("capitalGains", { precision: 12, scale: 2 }),
  distributionsReceived: decimal("distributionsReceived", { precision: 12, scale: 2 }),
  
  // Document storage
  vaultDocumentId: int("vaultDocumentId"),
  s3Url: varchar("s3Url", { length: 500 }),
  
  // Filing status
  filedWithIRS: boolean("filedWithIRS").default(false),
  filedAt: timestamp("filedAt"),
  irsConfirmationNumber: varchar("irsConfirmationNumber", { length: 50 }),
  
  // Delivery
  deliveredToRecipient: boolean("deliveredToRecipient").default(false),
  deliveredAt: timestamp("deliveredAt"),
  deliveryMethod: mysqlEnum("deliveryMethod", ["mail", "email", "portal"]),
  
  // Status
  status: mysqlEnum("status", [
    "draft", "generated", "filed", "corrected", "voided"
  ]).default("draft"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmployerTaxForm = typeof employerTaxForms.$inferSelect;
export type InsertEmployerTaxForm = typeof employerTaxForms.$inferInsert;

/**
 * Compliance Tasks - Track filing deadlines and requirements
 */
export const complianceTasks = mysqlTable("compliance_tasks", {
  id: int("id").autoincrement().primaryKey(),
  businessEntityId: int("businessEntityId"),
  houseId: int("houseId").notNull(),
  positionHolderId: int("positionHolderId"),
  
  // Task details
  taskType: mysqlEnum("taskType", [
    "payroll_tax_deposit",    // 941 deposits
    "quarterly_941",          // Quarterly payroll tax return
    "annual_940",             // Annual FUTA return
    "w2_filing",              // W-2 filing deadline
    "1099_filing",            // 1099 filing deadline
    "k1_filing",              // K-1 filing deadline
    "state_tax_deposit",      // State payroll taxes
    "state_quarterly",        // State quarterly return
    "annual_report",          // State annual report
    "business_license",       // Business license renewal
    "i9_reverification",      // I-9 document reverification
    "workers_comp_audit",     // Workers comp audit
    "benefits_enrollment",    // Open enrollment period
    "performance_review",     // Employee review
    "custom"
  ]).notNull(),
  
  taskName: varchar("taskName", { length: 255 }).notNull(),
  description: text("description"),
  
  // Deadlines
  dueDate: timestamp("dueDate").notNull(),
  reminderDate: timestamp("reminderDate"),
  
  // Recurrence
  isRecurring: boolean("isRecurring").default(false),
  recurrencePattern: mysqlEnum("recurrencePattern", [
    "weekly", "biweekly", "monthly", "quarterly", "annually"
  ]),
  
  // Assignment
  assignedToUserId: int("assignedToUserId"),
  
  // Completion
  completedAt: timestamp("completedAt"),
  completedByUserId: int("completedByUserId"),
  completionNotes: text("completionNotes"),
  
  // Status
  status: mysqlEnum("status", [
    "upcoming", "due_soon", "overdue", "completed", "skipped"
  ]).default("upcoming"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComplianceTask = typeof complianceTasks.$inferSelect;
export type InsertComplianceTask = typeof complianceTasks.$inferInsert;

/**
 * YTD Totals - Year-to-date accumulation for tax calculations
 */
export const ytdTotals = mysqlTable("ytd_totals", {
  id: int("id").autoincrement().primaryKey(),
  positionHolderId: int("positionHolderId").notNull(),
  taxYear: int("taxYear").notNull(),
  
  // Gross earnings
  ytdGrossPay: decimal("ytdGrossPay", { precision: 12, scale: 2 }).default("0"),
  ytdRegularPay: decimal("ytdRegularPay", { precision: 12, scale: 2 }).default("0"),
  ytdOvertimePay: decimal("ytdOvertimePay", { precision: 12, scale: 2 }).default("0"),
  ytdBonusPay: decimal("ytdBonusPay", { precision: 12, scale: 2 }).default("0"),
  
  // Tax withholdings
  ytdFederalTax: decimal("ytdFederalTax", { precision: 12, scale: 2 }).default("0"),
  ytdStateTax: decimal("ytdStateTax", { precision: 12, scale: 2 }).default("0"),
  ytdSocialSecurity: decimal("ytdSocialSecurity", { precision: 12, scale: 2 }).default("0"),
  ytdMedicare: decimal("ytdMedicare", { precision: 12, scale: 2 }).default("0"),
  
  // Deductions
  ytdHealthInsurance: decimal("ytdHealthInsurance", { precision: 12, scale: 2 }).default("0"),
  ytdRetirement: decimal("ytdRetirement", { precision: 12, scale: 2 }).default("0"),
  ytdOtherDeductions: decimal("ytdOtherDeductions", { precision: 12, scale: 2 }).default("0"),
  
  // Net
  ytdNetPay: decimal("ytdNetPay", { precision: 12, scale: 2 }).default("0"),
  
  // Hours
  ytdRegularHours: decimal("ytdRegularHours", { precision: 8, scale: 2 }).default("0"),
  ytdOvertimeHours: decimal("ytdOvertimeHours", { precision: 8, scale: 2 }).default("0"),
  
  // Last updated
  lastPayrollRecordId: int("lastPayrollRecordId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type YtdTotal = typeof ytdTotals.$inferSelect;
export type InsertYtdTotal = typeof ytdTotals.$inferInsert;


// ============================================
// GRANT MANAGEMENT SYSTEM
// ============================================

/**
 * Grant Opportunities - Track available grants to apply for
 */
export const grantOpportunities = mysqlTable("grant_opportunities", {
  id: int("id").autoincrement().primaryKey(),
  
  // Grant Details
  name: varchar("name", { length: 255 }).notNull(),
  funderName: varchar("funderName", { length: 255 }).notNull(),
  funderType: mysqlEnum("funderType", [
    "federal",
    "state",
    "local",
    "foundation",
    "corporate",
    "religious",
    "community",
    "other"
  ]).notNull(),
  
  // Funding Information
  minAmount: decimal("minAmount", { precision: 12, scale: 2 }),
  maxAmount: decimal("maxAmount", { precision: 12, scale: 2 }),
  typicalAmount: decimal("typicalAmount", { precision: 12, scale: 2 }),
  
  // Eligibility
  eligibleEntityTypes: json("eligibleEntityTypes"), // ["508", "501c3", "llc", "trust"]
  eligibilityRequirements: text("eligibilityRequirements"),
  geographicRestrictions: varchar("geographicRestrictions", { length: 255 }),
  
  // Focus Areas
  focusAreas: json("focusAreas"), // ["education", "community", "youth", "health"]
  description: text("description"),
  
  // Timeline
  applicationDeadline: timestamp("applicationDeadline"),
  awardAnnouncementDate: timestamp("awardAnnouncementDate"),
  fundingPeriodStart: timestamp("fundingPeriodStart"),
  fundingPeriodEnd: timestamp("fundingPeriodEnd"),
  isRolling: boolean("isRolling").default(false), // Rolling deadline
  
  // Application Details
  applicationUrl: text("applicationUrl"),
  applicationRequirements: text("applicationRequirements"),
  matchingRequired: boolean("matchingRequired").default(false),
  matchingPercentage: decimal("matchingPercentage", { precision: 5, scale: 2 }),
  
  // Status
  status: mysqlEnum("status", [
    "researching",    // Still gathering info
    "eligible",       // Confirmed eligible
    "not_eligible",   // Not eligible
    "applying",       // Currently working on application
    "submitted",      // Application submitted
    "archived"        // No longer relevant
  ]).default("researching").notNull(),
  
  // Priority
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium"),
  
  // Notes
  notes: text("notes"),
  
  // Tracking
  addedBy: int("addedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GrantOpportunity = typeof grantOpportunities.$inferSelect;
export type InsertGrantOpportunity = typeof grantOpportunities.$inferInsert;

/**
 * Grant Applications - Track submitted applications
 */
export const grantApplications = mysqlTable("grant_applications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Links
  grantOpportunityId: int("grantOpportunityId").notNull(),
  applyingEntityId: int("applyingEntityId"), // Which of our entities is applying
  applyingEntityName: varchar("applyingEntityName", { length: 255 }).notNull(),
  
  // Application Details
  requestedAmount: decimal("requestedAmount", { precision: 12, scale: 2 }).notNull(),
  projectTitle: varchar("projectTitle", { length: 255 }),
  projectDescription: text("projectDescription"),
  
  // Status Tracking
  status: mysqlEnum("status", [
    "draft",          // Working on application
    "in_review",      // Internal review before submission
    "submitted",      // Submitted to funder
    "under_review",   // Funder is reviewing
    "additional_info", // Funder requested more info
    "approved",       // Grant approved
    "denied",         // Grant denied
    "withdrawn"       // We withdrew application
  ]).default("draft").notNull(),
  
  // Important Dates
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  submittedAt: timestamp("submittedAt"),
  decisionDate: timestamp("decisionDate"),
  
  // Award Details (if approved)
  awardedAmount: decimal("awardedAmount", { precision: 12, scale: 2 }),
  awardDate: timestamp("awardDate"),
  
  // Documents
  proposalDocumentId: int("proposalDocumentId"), // Link to Document Vault
  budgetDocumentId: int("budgetDocumentId"),
  supportingDocuments: json("supportingDocuments"), // Array of document IDs
  
  // Feedback
  funderFeedback: text("funderFeedback"),
  lessonsLearned: text("lessonsLearned"),
  
  // Tracking
  assignedTo: int("assignedTo"), // Who is working on this
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GrantApplication = typeof grantApplications.$inferSelect;
export type InsertGrantApplication = typeof grantApplications.$inferInsert;

/**
 * Grant Tasks - Track tasks for grant applications
 */
export const grantTasks = mysqlTable("grant_tasks", {
  id: int("id").autoincrement().primaryKey(),
  grantApplicationId: int("grantApplicationId").notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "blocked"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium"),
  
  assignedTo: int("assignedTo"),
  completedAt: timestamp("completedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GrantTask = typeof grantTasks.$inferSelect;
export type InsertGrantTask = typeof grantTasks.$inferInsert;

/**
 * Grant Funders - Track relationship with funders
 */
export const grantFunders = mysqlTable("grant_funders", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", [
    "federal",
    "state",
    "local",
    "foundation",
    "corporate",
    "religious",
    "community",
    "other"
  ]).notNull(),
  
  website: text("website"),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 255 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  
  focusAreas: json("focusAreas"),
  typicalGrantRange: varchar("typicalGrantRange", { length: 100 }),
  applicationCycle: varchar("applicationCycle", { length: 100 }), // "Annual", "Quarterly", "Rolling"
  
  notes: text("notes"),
  relationshipStatus: mysqlEnum("relationshipStatus", [
    "researching",
    "contacted",
    "applied",
    "funded",
    "declined",
    "inactive"
  ]).default("researching"),
  
  totalApplied: int("totalApplied").default(0),
  totalAwarded: int("totalAwarded").default(0),
  totalFundingReceived: decimal("totalFundingReceived", { precision: 14, scale: 2 }).default("0"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GrantFunder = typeof grantFunders.$inferSelect;
export type InsertGrantFunder = typeof grantFunders.$inferInsert;


// ============================================
// BUSINESS PLAN SYSTEM - Smart Data Flow
// ============================================

/**
 * Business Plans - Created via Business Plan Simulator
 * Auto-populates Grant Simulator and other modules
 */
export const businessPlans = mysqlTable("business_plans", {
  id: int("id").autoincrement().primaryKey(),
  
  // Link to entity
  entityType: mysqlEnum("entityType", [
    "llc", "corporation", "trust", "nonprofit_508", "nonprofit_501c3", "collective", "sole_proprietorship"
  ]).notNull(),
  entityName: varchar("entityName", { length: 255 }).notNull(),
  
  // Ownership
  houseId: int("houseId"),
  createdByUserId: int("createdByUserId").notNull(),
  
  // Core Business Info
  missionStatement: text("missionStatement"),
  visionStatement: text("visionStatement"),
  organizationDescription: text("organizationDescription"),
  yearFounded: int("yearFounded"),
  
  // Products/Services
  productsServices: text("productsServices"),
  uniqueValueProposition: text("uniqueValueProposition"),
  
  // Market
  targetMarket: text("targetMarket"),
  marketSize: varchar("marketSize", { length: 255 }),
  competitiveAdvantage: text("competitiveAdvantage"),
  
  // Team
  teamSize: int("teamSize"),
  teamDescription: text("teamDescription"),
  keyPersonnel: json("keyPersonnel"), // Array of { name, role, bio }
  
  // Financial Projections
  startupCosts: decimal("startupCosts", { precision: 14, scale: 2 }),
  monthlyOperatingCosts: decimal("monthlyOperatingCosts", { precision: 14, scale: 2 }),
  projectedRevenueYear1: decimal("projectedRevenueYear1", { precision: 14, scale: 2 }),
  projectedRevenueYear2: decimal("projectedRevenueYear2", { precision: 14, scale: 2 }),
  projectedRevenueYear3: decimal("projectedRevenueYear3", { precision: 14, scale: 2 }),
  breakEvenTimeline: varchar("breakEvenTimeline", { length: 100 }),
  
  // Funding
  fundingNeeded: decimal("fundingNeeded", { precision: 14, scale: 2 }),
  fundingPurpose: text("fundingPurpose"),
  fundingSources: json("fundingSources"), // Array of { source, amount, status }
  
  // Goals & Milestones
  shortTermGoals: json("shortTermGoals"), // Array of goals
  longTermGoals: json("longTermGoals"),
  milestones: json("milestones"), // Array of { milestone, targetDate, status }
  
  // Impact (for nonprofits/508)
  socialImpact: text("socialImpact"),
  communityBenefit: text("communityBenefit"),
  measurableOutcomes: json("measurableOutcomes"), // Array of outcomes
  
  // Status
  status: mysqlEnum("status", [
    "draft", "in_progress", "completed", "approved", "archived"
  ]).default("draft").notNull(),
  completedAt: timestamp("completedAt"),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy"),
  
  // Version tracking
  version: int("version").default(1),
  previousVersionId: int("previousVersionId"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BusinessPlan = typeof businessPlans.$inferSelect;
export type InsertBusinessPlan = typeof businessPlans.$inferInsert;

/**
 * Business Plan Sections - Individual sections for step-by-step completion
 */
export const businessPlanSections = mysqlTable("business_plan_sections", {
  id: int("id").autoincrement().primaryKey(),
  businessPlanId: int("businessPlanId").notNull(),
  
  // Section info
  sectionType: mysqlEnum("sectionType", [
    "executive_summary",
    "company_description",
    "products_services",
    "market_analysis",
    "marketing_strategy",
    "operations_plan",
    "management_team",
    "financial_projections",
    "funding_request",
    "appendix"
  ]).notNull(),
  
  sectionTitle: varchar("sectionTitle", { length: 255 }).notNull(),
  content: text("content"),
  
  // Completion tracking
  isComplete: boolean("isComplete").default(false),
  completedAt: timestamp("completedAt"),
  
  // Order
  sortOrder: int("sortOrder").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BusinessPlanSection = typeof businessPlanSections.$inferSelect;
export type InsertBusinessPlanSection = typeof businessPlanSections.$inferInsert;

/**
 * Simulator Completions - Track which simulators a user has completed
 * Used to unlock subsequent simulators and auto-populate data
 */
export const simulatorCompletions = mysqlTable("simulator_completions", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull(),
  houseId: int("houseId"),
  
  // Simulator info
  simulatorType: mysqlEnum("simulatorType", [
    "business_formation",
    "business_plan",
    "grant_application",
    "trust_formation",
    "nonprofit_formation"
  ]).notNull(),
  
  // Entity created (if applicable)
  entityType: varchar("entityType", { length: 50 }),
  entityName: varchar("entityName", { length: 255 }),
  entityId: int("entityId"), // Reference to created entity
  
  // Business plan created (if applicable)
  businessPlanId: int("businessPlanId"),
  
  // Completion details
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  certificateIssued: boolean("certificateIssued").default(false),
  certificateIssuedAt: timestamp("certificateIssuedAt"),
  
  // Training Manager signature
  trainingManagerId: int("trainingManagerId"),
  trainingManagerName: varchar("trainingManagerName", { length: 255 }),
  
  // Token rewards
  tokensEarned: int("tokensEarned").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SimulatorCompletion = typeof simulatorCompletions.$inferSelect;
export type InsertSimulatorCompletion = typeof simulatorCompletions.$inferInsert;


// ============================================
// ENTITY-BASED REVENUE STREAM SEPARATION
// Products → Real-Eye-Nation LLC
// Services → LuvOnPurpose LLC
// Training → 508 Academy & Outreach
// ============================================

/**
 * Service Categories - Define what each entity offers
 */
export const serviceCategories = mysqlTable("service_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  categoryType: mysqlEnum("categoryType", [
    "product",    // Software, SaaS, Platform access (Real-Eye-Nation)
    "service",    // Professional services (LuvOnPurpose)
    "training"    // Education, courses, coaching (508 Academy)
  ]).notNull(),
  // Owning entity
  owningEntityId: int("owningEntityId").notNull(), // References businessEntities
  owningEntityName: varchar("owningEntityName", { length: 255 }).notNull(),
  // Pricing
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }),
  pricingModel: mysqlEnum("pricingModel", [
    "one_time", "subscription", "per_use", "hourly", "project_based", "tiered"
  ]).default("one_time"),
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = typeof serviceCategories.$inferInsert;

/**
 * Service Offerings - Specific products/services available
 */
export const serviceOfferings = mysqlTable("service_offerings", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),
  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  pricingUnit: varchar("pricingUnit", { length: 50 }), // "per month", "per project", "per hour"
  // Features
  features: json("features"), // Array of feature strings
  // Delivery
  deliveryMethod: mysqlEnum("deliveryMethod", [
    "platform_access", "document", "consultation", "workshop", "course", "custom"
  ]).notNull(),
  estimatedDeliveryDays: int("estimatedDeliveryDays"),
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceOffering = typeof serviceOfferings.$inferSelect;
export type InsertServiceOffering = typeof serviceOfferings.$inferInsert;

/**
 * House Service Permissions - Control which houses can offer services independently
 */
export const houseServicePermissions = mysqlTable("house_service_permissions", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  // Permission type
  permissionType: mysqlEnum("permissionType", [
    "founding_house",  // Full rights to offer all services
    "heir",            // Inherited rights to offer services
    "licensed",        // Licensed to offer specific services
    "consumer_only"    // Can only purchase, not resell
  ]).notNull(),
  // Specific permissions
  canOfferProducts: boolean("canOfferProducts").default(false).notNull(),
  canOfferServices: boolean("canOfferServices").default(false).notNull(),
  canOfferTraining: boolean("canOfferTraining").default(false).notNull(),
  canResell: boolean("canResell").default(false).notNull(),
  canWhiteLabel: boolean("canWhiteLabel").default(false).notNull(),
  // Revenue sharing (if licensed)
  revenueSharePercentage: decimal("revenueSharePercentage", { precision: 5, scale: 2 }).default("0"),
  // Restrictions
  restrictedCategories: json("restrictedCategories"), // Array of category IDs they cannot access
  // Grant details (if heir or licensed)
  grantedBy: int("grantedBy"), // User who granted permission
  grantedAt: timestamp("grantedAt"),
  expiresAt: timestamp("expiresAt"),
  // Status
  status: mysqlEnum("status", ["active", "suspended", "revoked", "expired"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HouseServicePermission = typeof houseServicePermissions.$inferSelect;
export type InsertHouseServicePermission = typeof houseServicePermissions.$inferInsert;

/**
 * Service Orders - Track purchases of services
 */
export const serviceOrders = mysqlTable("service_orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  // Customer
  customerId: int("customerId").notNull(), // User ID
  customerHouseId: int("customerHouseId"), // House ID if internal
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 255 }),
  // Service
  serviceOfferingId: int("serviceOfferingId").notNull(),
  serviceCategoryId: int("serviceCategoryId").notNull(),
  // Fulfilling entity
  fulfillingEntityId: int("fulfillingEntityId").notNull(),
  fulfillingEntityName: varchar("fulfillingEntityName", { length: 255 }),
  // Pricing
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  // Revenue split (if reseller involved)
  resellerId: int("resellerId"),
  resellerCommission: decimal("resellerCommission", { precision: 10, scale: 2 }).default("0"),
  // Payment
  paymentStatus: mysqlEnum("paymentStatus", [
    "pending", "paid", "refunded", "failed", "cancelled"
  ]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paidAt: timestamp("paidAt"),
  // Fulfillment
  fulfillmentStatus: mysqlEnum("fulfillmentStatus", [
    "pending", "in_progress", "completed", "cancelled"
  ]).default("pending").notNull(),
  fulfilledAt: timestamp("fulfilledAt"),
  // Notes
  customerNotes: text("customerNotes"),
  internalNotes: text("internalNotes"),
  // Status
  status: mysqlEnum("status", [
    "draft", "submitted", "processing", "completed", "cancelled", "refunded"
  ]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = typeof serviceOrders.$inferInsert;

/**
 * Subscription Plans - For recurring product access
 */
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  // Owning entity (Real-Eye-Nation for products)
  owningEntityId: int("owningEntityId").notNull(),
  // Pricing
  tier: mysqlEnum("tier", ["starter", "professional", "enterprise", "custom"]).notNull(),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annualPrice", { precision: 10, scale: 2 }),
  // Features
  features: json("features"), // Array of feature strings
  limits: json("limits"), // { users: 5, storage: "10GB", etc. }
  // Included services
  includedServiceIds: json("includedServiceIds"), // Array of service offering IDs
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * Customer Subscriptions - Active subscriptions
 */
export const customerSubscriptions = mysqlTable("customer_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  customerHouseId: int("customerHouseId"),
  planId: int("planId").notNull(),
  // Billing
  billingCycle: mysqlEnum("billingCycle", ["monthly", "annual"]).default("monthly").notNull(),
  currentPrice: decimal("currentPrice", { precision: 10, scale: 2 }).notNull(),
  nextBillingDate: timestamp("nextBillingDate"),
  // Status
  status: mysqlEnum("status", [
    "active", "past_due", "cancelled", "paused", "trial"
  ]).default("active").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  cancelledAt: timestamp("cancelledAt"),
  pausedAt: timestamp("pausedAt"),
  // Trial
  trialEndsAt: timestamp("trialEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerSubscription = typeof customerSubscriptions.$inferSelect;
export type InsertCustomerSubscription = typeof customerSubscriptions.$inferInsert;


/**
 * ============================================
 * USER PROFILES - Personal Intake Form Data
 * ============================================
 */

/**
 * User Profiles - Complete personal information from intake form
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // Link to users table
  
  // Personal Information
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zip: varchar("zip", { length: 20 }),
  dateOfBirth: varchar("dateOfBirth", { length: 20 }),
  
  // Background & Skills
  highestEducation: mysqlEnum("highestEducation", [
    "high-school", "some-college", "associates", "bachelors", "masters", "doctorate"
  ]),
  fieldOfStudy: varchar("fieldOfStudy", { length: 100 }),
  currentOccupation: varchar("currentOccupation", { length: 100 }),
  yearsExperience: mysqlEnum("yearsExperience", ["0-2", "3-5", "6-10", "11-20", "20+"]),
  skills: json("skills"), // Array of skill strings
  certifications: text("certifications"),
  
  // Goals & Assessment
  primaryGoal: mysqlEnum("primaryGoal", [
    "start-business", "employment", "education", "community", "grants", "wealth-building"
  ]),
  secondaryGoals: json("secondaryGoals"), // Array of goal IDs
  timeline: mysqlEnum("timeline", ["immediate", "1-3-months", "3-6-months", "6-12-months", "1-year-plus"]),
  
  // Interests & Availability
  departmentInterests: json("departmentInterests"), // Array of department IDs
  availability: mysqlEnum("availability", ["full-time", "part-time", "volunteer", "consulting"]),
  
  // Emergency Contact
  emergencyName: varchar("emergencyName", { length: 100 }),
  emergencyRelationship: varchar("emergencyRelationship", { length: 50 }),
  emergencyPhone: varchar("emergencyPhone", { length: 20 }),
  
  // Documents (S3 URLs)
  idDocumentUrl: varchar("idDocumentUrl", { length: 500 }),
  resumeUrl: varchar("resumeUrl", { length: 500 }),
  certificationsDocUrl: varchar("certificationsDocUrl", { length: 500 }),
  
  // Status
  profileStatus: mysqlEnum("profileStatus", ["draft", "complete", "verified"]).default("draft").notNull(),
  completedAt: timestamp("completedAt"),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: int("verifiedBy"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Career Interest Submissions - External applicants expressing interest in positions
 */
export const careerInterestSubmissions = mysqlTable("career_interest_submissions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Contact Information
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  
  // Position Interest
  positionId: varchar("positionId", { length: 50 }).notNull(), // e.g., "hr-lead", "operations-manager"
  positionTitle: varchar("positionTitle", { length: 100 }).notNull(),
  entityName: varchar("entityName", { length: 255 }).notNull(),
  
  // Background
  currentRole: varchar("currentRole", { length: 100 }),
  yearsExperience: varchar("yearsExperience", { length: 20 }),
  relevantSkills: text("relevantSkills"),
  whyInterested: text("whyInterested"),
  
  // Documents (S3 URLs)
  resumeUrl: varchar("resumeUrl", { length: 500 }),
  coverLetterUrl: varchar("coverLetterUrl", { length: 500 }),
  
  // Status
  status: mysqlEnum("status", ["new", "reviewed", "contacted", "interviewing", "hired", "declined"]).default("new").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CareerInterestSubmission = typeof careerInterestSubmissions.$inferSelect;
export type InsertCareerInterestSubmission = typeof careerInterestSubmissions.$inferInsert;


/**
 * Founder Income Streams - Track all income sources for Founder/Matriarch
 */
export const founderIncomeStreams = mysqlTable("founder_income_streams", {
  id: int("id").autoincrement().primaryKey(),
  
  // Income Classification
  incomeType: mysqlEnum("incomeType", [
    "trust_distribution",
    "llc_distribution_laws_collective",
    "llc_distribution_laws_llc",
    "llc_distribution_real_eye",
    "token_earnings",
    "consulting_fees",
    "ip_royalties",
    "grant_stipend"
  ]).notNull(),
  
  // Source Details
  sourceEntity: varchar("sourceEntity", { length: 255 }).notNull(),
  description: text("description"),
  
  // Financial Details
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Period
  periodStart: date("periodStart"),
  periodEnd: date("periodEnd"),
  
  // Tax Information
  taxCategory: mysqlEnum("taxCategory", [
    "trust_income",
    "pass_through_k1",
    "self_employment",
    "royalty_income",
    "w2_wages",
    "1099_contractor"
  ]),
  taxYear: int("taxYear"),
  
  // Documentation
  documentationRef: varchar("documentationRef", { length: 255 }),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }),
  
  // Status
  status: mysqlEnum("status", ["projected", "pending", "received", "reconciled"]).default("pending").notNull(),
  receivedAt: timestamp("receivedAt"),
  
  // Ledger Integration
  ledgerTransactionId: int("ledgerTransactionId"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FounderIncomeStream = typeof founderIncomeStreams.$inferSelect;
export type InsertFounderIncomeStream = typeof founderIncomeStreams.$inferInsert;

/**
 * Founder Token Earnings - Detailed token activity tracking
 */
export const founderTokenEarnings = mysqlTable("founder_token_earnings", {
  id: int("id").autoincrement().primaryKey(),
  
  // Token Details
  tokenType: mysqlEnum("tokenType", ["MIRROR", "GIFT", "SPARK", "HOUSE", "CROWN"]).notNull(),
  amount: int("amount").notNull(),
  
  // Activity
  activityType: varchar("activityType", { length: 100 }).notNull(),
  activityDescription: text("activityDescription"),
  
  // Conversion
  converted: boolean("converted").default(false).notNull(),
  conversionDate: timestamp("conversionDate"),
  cashValue: decimal("cashValue", { precision: 18, scale: 2 }),
  conversionRate: decimal("conversionRate", { precision: 10, scale: 4 }),
  
  // Ledger Integration
  incomeStreamId: int("incomeStreamId"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FounderTokenEarning = typeof founderTokenEarnings.$inferSelect;
export type InsertFounderTokenEarning = typeof founderTokenEarnings.$inferInsert;

/**
 * Founder Consulting Engagements - Track contractor work
 */
export const founderConsultingEngagements = mysqlTable("founder_consulting_engagements", {
  id: int("id").autoincrement().primaryKey(),
  
  // Client Entity
  clientEntity: varchar("clientEntity", { length: 255 }).notNull(),
  
  // Service Details
  serviceType: mysqlEnum("serviceType", [
    "strategic_advisory",
    "training_delivery",
    "grant_consulting",
    "community_engagement",
    "curriculum_development",
    "other"
  ]).notNull(),
  serviceDescription: text("serviceDescription"),
  
  // Billing
  billingType: mysqlEnum("billingType", ["hourly", "project", "retainer", "per_event"]).notNull(),
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }),
  projectFee: decimal("projectFee", { precision: 10, scale: 2 }),
  hoursWorked: decimal("hoursWorked", { precision: 8, scale: 2 }),
  
  // Invoice
  invoiceNumber: varchar("invoiceNumber", { length: 50 }),
  invoiceDate: date("invoiceDate"),
  dueDate: date("dueDate"),
  totalAmount: decimal("totalAmount", { precision: 18, scale: 2 }).notNull(),
  
  // Status
  status: mysqlEnum("status", ["draft", "invoiced", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  paidAt: timestamp("paidAt"),
  
  // Ledger Integration
  incomeStreamId: int("incomeStreamId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FounderConsultingEngagement = typeof founderConsultingEngagements.$inferSelect;
export type InsertFounderConsultingEngagement = typeof founderConsultingEngagements.$inferInsert;

/**
 * Founder IP Licenses - Track intellectual property licensing
 */
export const founderIpLicenses = mysqlTable("founder_ip_licenses", {
  id: int("id").autoincrement().primaryKey(),
  
  // IP Asset
  ipType: mysqlEnum("ipType", ["curriculum", "brand_trademark", "systems_processes", "content", "other"]).notNull(),
  ipName: varchar("ipName", { length: 255 }).notNull(),
  ipDescription: text("ipDescription"),
  
  // Licensee
  licenseeEntity: varchar("licenseeEntity", { length: 255 }).notNull(),
  
  // License Terms
  licenseType: mysqlEnum("licenseType", ["exclusive", "non_exclusive", "limited"]).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  autoRenew: boolean("autoRenew").default(false),
  
  // Royalty Structure
  royaltyType: mysqlEnum("royaltyType", ["flat_annual", "per_use", "percentage", "per_student"]).notNull(),
  royaltyRate: decimal("royaltyRate", { precision: 10, scale: 4 }),
  flatFee: decimal("flatFee", { precision: 18, scale: 2 }),
  
  // Status
  status: mysqlEnum("status", ["active", "expired", "terminated", "pending"]).default("pending").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FounderIpLicense = typeof founderIpLicenses.$inferSelect;
export type InsertFounderIpLicense = typeof founderIpLicenses.$inferInsert;

/**
 * Founder Income Summary - Aggregated view for reporting
 */
export const founderIncomeSummary = mysqlTable("founder_income_summary", {
  id: int("id").autoincrement().primaryKey(),
  
  // Period
  year: int("year").notNull(),
  quarter: int("quarter"), // 1-4, null for annual
  month: int("month"), // 1-12, null for quarterly/annual
  
  // Totals by Category
  trustDistributions: decimal("trustDistributions", { precision: 18, scale: 2 }).default("0"),
  llcDistributions: decimal("llcDistributions", { precision: 18, scale: 2 }).default("0"),
  tokenEarnings: decimal("tokenEarnings", { precision: 18, scale: 2 }).default("0"),
  consultingFees: decimal("consultingFees", { precision: 18, scale: 2 }).default("0"),
  ipRoyalties: decimal("ipRoyalties", { precision: 18, scale: 2 }).default("0"),
  grantStipends: decimal("grantStipends", { precision: 18, scale: 2 }).default("0"),
  
  // Grand Total
  totalIncome: decimal("totalIncome", { precision: 18, scale: 2 }).default("0"),
  
  // Tax Estimates
  estimatedSelfEmploymentTax: decimal("estimatedSelfEmploymentTax", { precision: 18, scale: 2 }),
  estimatedIncomeTax: decimal("estimatedIncomeTax", { precision: 18, scale: 2 }),
  
  // Status
  status: mysqlEnum("status", ["projected", "actual", "reconciled"]).default("projected").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FounderIncomeSummary = typeof founderIncomeSummary.$inferSelect;
export type InsertFounderIncomeSummary = typeof founderIncomeSummary.$inferInsert;


/**
 * Training Modules - Configurable training content for agents and simulators
 * Managers can create custom Q&A sets for interactive training
 */
export const trainingModules = mysqlTable("training_modules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  agentType: varchar("agentType", { length: 64 }), // Links to agent type (operations, support, education, etc.)
  simulatorType: varchar("simulatorType", { length: 64 }), // Links to simulator (business, grant, tax, proposal)
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  estimatedMinutes: int("estimatedMinutes").default(30),
  passingScore: int("passingScore").default(70), // Percentage required to pass
  isActive: boolean("isActive").default(true).notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = typeof trainingModules.$inferInsert;

/**
 * Training Topics - Sections within a training module
 */
export const trainingTopics = mysqlTable("training_topics", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: int("orderIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TrainingTopic = typeof trainingTopics.$inferSelect;
export type InsertTrainingTopic = typeof trainingTopics.$inferInsert;

/**
 * Training Questions - Individual questions within a topic
 */
export const trainingQuestions = mysqlTable("training_questions", {
  id: int("id").autoincrement().primaryKey(),
  topicId: int("topicId").notNull(),
  questionText: text("questionText").notNull(),
  questionType: mysqlEnum("questionType", ["multiple_choice", "true_false", "open_ended", "fill_blank"]).default("multiple_choice").notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  points: int("points").default(10).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  explanation: text("explanation"), // Shown after answering
  hint: text("hint"), // Optional hint for the user
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TrainingQuestion = typeof trainingQuestions.$inferSelect;
export type InsertTrainingQuestion = typeof trainingQuestions.$inferInsert;

/**
 * Training Answers - Answer options for questions
 */
export const trainingAnswers = mysqlTable("training_answers", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(),
  answerText: text("answerText").notNull(),
  isCorrect: boolean("isCorrect").default(false).notNull(),
  feedback: text("feedback"), // Feedback shown when this answer is selected
  orderIndex: int("orderIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TrainingAnswer = typeof trainingAnswers.$inferSelect;
export type InsertTrainingAnswer = typeof trainingAnswers.$inferInsert;

/**
 * Training Sessions - User's attempt at a training module
 */
export const trainingSessions = mysqlTable("training_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  moduleId: int("moduleId").notNull(),
  agentConversationId: int("agentConversationId"), // Links to agent conversation if done via agent
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned"]).default("in_progress").notNull(),
  currentTopicId: int("currentTopicId"),
  currentQuestionId: int("currentQuestionId"),
  totalQuestions: int("totalQuestions").default(0).notNull(),
  answeredQuestions: int("answeredQuestions").default(0).notNull(),
  correctAnswers: int("correctAnswers").default(0).notNull(),
  score: int("score").default(0).notNull(), // Percentage score
  totalPoints: int("totalPoints").default(0).notNull(),
  earnedPoints: int("earnedPoints").default(0).notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = typeof trainingSessions.$inferInsert;

/**
 * Training Responses - User's answers to individual questions
 */
export const trainingResponses = mysqlTable("training_responses", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  questionId: int("questionId").notNull(),
  answerId: int("answerId"), // For multiple choice/true-false
  userAnswer: text("userAnswer"), // For open-ended questions
  isCorrect: boolean("isCorrect").default(false).notNull(),
  pointsEarned: int("pointsEarned").default(0).notNull(),
  timeSpentSeconds: int("timeSpentSeconds"),
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
});
export type TrainingResponse = typeof trainingResponses.$inferSelect;
export type InsertTrainingResponse = typeof trainingResponses.$inferInsert;


/**
 * Job Applications - Track candidate applications
 */
export const jobApplications = mysqlTable("job_applications", {
  id: int("id").autoincrement().primaryKey(),
  positionId: varchar("positionId", { length: 100 }).notNull(), // References position ID from job_postings.json
  positionTitle: varchar("positionTitle", { length: 255 }).notNull(),
  entity: varchar("entity", { length: 255 }).notNull(),
  // Applicant Information
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  // Application Details
  currentRole: varchar("currentRole", { length: 255 }),
  yearsExperience: varchar("yearsExperience", { length: 50 }),
  relevantSkills: text("relevantSkills"),
  whyInterested: text("whyInterested"),
  coverLetter: text("coverLetter"),
  // Resume
  resumeUrl: text("resumeUrl"),
  resumeFileName: varchar("resumeFileName", { length: 255 }),
  resumeFileKey: varchar("resumeFileKey", { length: 500 }),
  // Status Tracking
  status: mysqlEnum("status", [
    "received",
    "screening",
    "phone_screen",
    "interview_scheduled",
    "interview_completed",
    "reference_check",
    "offer_extended",
    "offer_accepted",
    "hired",
    "rejected",
    "withdrawn"
  ]).default("received").notNull(),
  statusNotes: text("statusNotes"),
  // Interview Details
  interviewDate: timestamp("interviewDate"),
  interviewType: mysqlEnum("interviewType", ["phone", "video", "in_person"]),
  interviewNotes: text("interviewNotes"),
  interviewScore: int("interviewScore"), // 1-5 rating
  // Panel Review
  panelReviewers: json("panelReviewers"), // Array of reviewer IDs
  panelScores: json("panelScores"), // Object with reviewer scores
  panelNotes: json("panelNotes"), // Object with reviewer notes
  // Decision
  decisionMadeBy: int("decisionMadeBy"),
  decisionDate: timestamp("decisionDate"),
  decisionReason: text("decisionReason"),
  // Offer Details (if applicable)
  offeredSalary: decimal("offeredSalary", { precision: 10, scale: 2 }),
  offeredStartDate: date("offeredStartDate"),
  offerExpiresAt: timestamp("offerExpiresAt"),
  // Timestamps
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = typeof jobApplications.$inferInsert;

/**
 * Application Documents - Additional documents uploaded by applicants
 */
export const applicationDocuments = mysqlTable("application_documents", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  documentType: mysqlEnum("documentType", [
    "resume",
    "cover_letter",
    "portfolio",
    "certification",
    "reference_letter",
    "transcript",
    "other"
  ]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize"), // in bytes
  mimeType: varchar("mimeType", { length: 100 }),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});
export type ApplicationDocument = typeof applicationDocuments.$inferSelect;
export type InsertApplicationDocument = typeof applicationDocuments.$inferInsert;

/**
 * Application Activity Log - Track all actions on an application
 */
export const applicationActivityLog = mysqlTable("application_activity_log", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  actorId: int("actorId"), // User who performed the action (null for system actions)
  actorName: varchar("actorName", { length: 255 }),
  action: mysqlEnum("action", [
    "application_received",
    "status_changed",
    "document_uploaded",
    "interview_scheduled",
    "interview_completed",
    "note_added",
    "score_updated",
    "offer_sent",
    "offer_accepted",
    "offer_rejected",
    "hired",
    "rejected",
    "withdrawn"
  ]).notNull(),
  previousValue: text("previousValue"),
  newValue: text("newValue"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ApplicationActivityLog = typeof applicationActivityLog.$inferSelect;
export type InsertApplicationActivityLog = typeof applicationActivityLog.$inferInsert;



// ============================================
// EMPLOYEE DIRECTORY
// Track current employees across all entities
// ============================================

/**
 * Employees - Current team members across all entities
 */
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  
  // Personal info
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  preferredName: varchar("preferredName", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  
  // Employment info
  entityId: int("entityId").notNull(), // Which business entity they work for
  department: varchar("department", { length: 100 }).notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  positionLevel: mysqlEnum("positionLevel", [
    "executive",      // CEO, COO, CFO, etc.
    "manager",        // Department managers
    "lead",           // Lead Operations Coordinator
    "coordinator",    // Operations Coordinators
    "specialist",     // Individual contributors
    "intern"          // Interns
  ]).notNull(),
  reportsTo: int("reportsTo"), // Manager's employee ID
  
  // Employment details
  employmentType: mysqlEnum("employmentType", [
    "full_time",
    "part_time",
    "contract",
    "intern"
  ]).default("full_time").notNull(),
  workLocation: mysqlEnum("workLocation", [
    "remote",
    "hybrid",
    "on_site"
  ]).default("remote").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  // Worker classification
  workerType: mysqlEnum("workerType", [
    "employee",      // W-2 employee
    "contractor",    // 1099 contractor
    "volunteer"      // Unpaid volunteer
  ]).default("employee").notNull(),
  
  // Contractor-specific fields
  contractStartDate: timestamp("contractStartDate"),
  contractEndDate: timestamp("contractEndDate"),
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }),
  is1099: boolean("is1099").default(false),
  contractTerms: text("contractTerms"),
  
  // Profile
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  linkedinUrl: varchar("linkedinUrl", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", [
    "active",
    "on_leave",
    "terminated",
    "pending"
  ]).default("active").notNull(),
  
  // User account link (if they have system access)
  userId: int("userId"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;


// ============================================
// EMPLOYEE ONBOARDING
// Track new hire onboarding progress
// ============================================

/**
 * Onboarding Checklists - Template checklists for different positions
 */
export const onboardingChecklists = mysqlTable("onboarding_checklists", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  department: varchar("department", { length: 100 }),
  positionLevel: mysqlEnum("positionLevel", [
    "executive",
    "manager",
    "lead",
    "coordinator",
    "specialist",
    "intern"
  ]),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingChecklist = typeof onboardingChecklists.$inferSelect;
export type InsertOnboardingChecklist = typeof onboardingChecklists.$inferInsert;

/**
 * Onboarding Checklist Items - Individual tasks in a checklist
 */
export const onboardingChecklistItems = mysqlTable("onboarding_checklist_items", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "documentation",
    "equipment",
    "access",
    "training",
    "introduction",
    "compliance",
    "benefits",
    "other"
  ]).default("other").notNull(),
  dueWithinDays: int("dueWithinDays").default(7).notNull(), // Days from start date
  assignedTo: mysqlEnum("assignedTo", [
    "employee",
    "manager",
    "hr",
    "it",
    "finance"
  ]).default("employee").notNull(),
  isRequired: boolean("isRequired").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OnboardingChecklistItem = typeof onboardingChecklistItems.$inferSelect;
export type InsertOnboardingChecklistItem = typeof onboardingChecklistItems.$inferInsert;

/**
 * Employee Onboarding - Track individual employee onboarding progress
 */
export const employeeOnboarding = mysqlTable("employee_onboarding", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  applicationId: int("applicationId"), // Link to original job application
  checklistId: int("checklistId").notNull(),
  status: mysqlEnum("status", [
    "not_started",
    "in_progress",
    "completed",
    "on_hold"
  ]).default("not_started").notNull(),
  startDate: timestamp("startDate"),
  targetCompletionDate: timestamp("targetCompletionDate"),
  actualCompletionDate: timestamp("actualCompletionDate"),
  assignedHrId: int("assignedHrId"), // HR person managing onboarding
  assignedManagerId: int("assignedManagerId"), // Direct manager
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmployeeOnboarding = typeof employeeOnboarding.$inferSelect;
export type InsertEmployeeOnboarding = typeof employeeOnboarding.$inferInsert;

/**
 * Onboarding Task Progress - Track completion of individual tasks
 */
export const onboardingTaskProgress = mysqlTable("onboarding_task_progress", {
  id: int("id").autoincrement().primaryKey(),
  onboardingId: int("onboardingId").notNull(),
  checklistItemId: int("checklistItemId").notNull(),
  status: mysqlEnum("status", [
    "pending",
    "in_progress",
    "completed",
    "skipped",
    "blocked"
  ]).default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  completedBy: int("completedBy"), // User who marked it complete
  notes: text("notes"),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingTaskProgress = typeof onboardingTaskProgress.$inferSelect;
export type InsertOnboardingTaskProgress = typeof onboardingTaskProgress.$inferInsert;


/**
 * Operating Procedures and Instruction Manuals
 * SOPs, policies, guides, and training materials for the organization
 */
export const operatingProcedures = mysqlTable("operating_procedures", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  documentNumber: varchar("documentNumber", { length: 50 }), // e.g., SOP-HR-001
  category: mysqlEnum("category", [
    "sop",           // Standard Operating Procedure
    "manual",        // Instruction Manual
    "policy",        // Policy Document
    "guide",         // How-To Guide
    "training",      // Training Material
    "checklist",     // Process Checklist
    "template",      // Document Template
    "form"           // Required Form
  ]).notNull(),
  department: varchar("department", { length: 100 }), // Which department this applies to
  entityId: int("entityId"), // Which entity this applies to (null = all)
  positionId: varchar("positionId", { length: 100 }), // Which position this applies to
  version: varchar("version", { length: 20 }).notNull().default("1.0"),
  status: mysqlEnum("status", [
    "draft",
    "review",
    "approved",
    "archived",
    "superseded"
  ]).default("draft").notNull(),
  content: text("content"), // Markdown content
  fileUrl: varchar("fileUrl", { length: 500 }), // Link to uploaded document
  effectiveDate: timestamp("effectiveDate"),
  reviewDate: timestamp("reviewDate"),
  expirationDate: timestamp("expirationDate"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdBy: int("createdBy").notNull(),
  tags: json("tags"), // Array of tags for searchability
  relatedProcedures: json("relatedProcedures"), // Array of related procedure IDs
  revisionHistory: json("revisionHistory"), // Track changes
  isRequired: boolean("isRequired").default(false), // Is this a required reading?
  requiredForDepartments: json("requiredForDepartments"), // Array of department names that must acknowledge
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OperatingProcedure = typeof operatingProcedures.$inferSelect;
export type InsertOperatingProcedure = typeof operatingProcedures.$inferInsert;

/**
 * Procedure Acknowledgments - Track who has read/acknowledged procedures
 */
export const procedureAcknowledgments = mysqlTable("procedure_acknowledgments", {
  id: int("id").autoincrement().primaryKey(),
  procedureId: int("procedureId").notNull(),
  userId: int("userId").notNull(),
  acknowledgedAt: timestamp("acknowledgedAt").defaultNow().notNull(),
  version: varchar("version", { length: 20 }).notNull(), // Version they acknowledged
  signature: varchar("signature", { length: 255 }), // Digital signature if required
  notes: text("notes"),
});

export type ProcedureAcknowledgment = typeof procedureAcknowledgments.$inferSelect;
export type InsertProcedureAcknowledgment = typeof procedureAcknowledgments.$inferInsert;

/**
 * Procedure Categories - Organize procedures by functional area
 */
export const procedureCategories = mysqlTable("procedure_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  parentId: int("parentId"), // For nested categories
  sortOrder: int("sortOrder").default(0).notNull(),
  icon: varchar("icon", { length: 50 }), // Icon name for UI
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProcedureCategory = typeof procedureCategories.$inferSelect;
export type InsertProcedureCategory = typeof procedureCategories.$inferInsert;


// ============================================
// PROJECT CONTROLS TABLES
// ============================================

/**
 * Projects - Master list of all projects across entities
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  entityId: int("entityId"),
  projectType: varchar("projectType", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("planning"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  actualStartDate: timestamp("actualStartDate"),
  actualEndDate: timestamp("actualEndDate"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  actualCost: decimal("actualCost", { precision: 15, scale: 2 }).default("0"),
  percentComplete: int("percentComplete").default(0),
  projectManagerId: int("projectManagerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project Milestones - Key deliverables and checkpoints
 */
export const projectMilestones = mysqlTable("project_milestones", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  plannedDate: timestamp("plannedDate").notNull(),
  actualDate: timestamp("actualDate"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  weight: int("weight").default(1),
  deliverables: text("deliverables"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type InsertProjectMilestone = typeof projectMilestones.$inferInsert;

/**
 * Project Tasks - Gantt chart items and work breakdown
 */
export const projectTasks = mysqlTable("project_tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  milestoneId: int("milestoneId"),
  parentTaskId: int("parentTaskId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  assigneeId: int("assigneeId"),
  plannedStart: timestamp("plannedStart"),
  plannedEnd: timestamp("plannedEnd"),
  actualStart: timestamp("actualStart"),
  actualEnd: timestamp("actualEnd"),
  duration: int("duration"),
  percentComplete: int("percentComplete").default(0),
  status: varchar("status", { length: 50 }).notNull().default("not_started"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  dependencies: text("dependencies"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = typeof projectTasks.$inferInsert;

/**
 * Project Budget Items - Cost breakdown and tracking
 */
export const projectBudgetItems = mysqlTable("project_budget_items", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  plannedAmount: decimal("plannedAmount", { precision: 15, scale: 2 }).notNull(),
  actualAmount: decimal("actualAmount", { precision: 15, scale: 2 }).default("0"),
  variance: decimal("variance", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectBudgetItem = typeof projectBudgetItems.$inferSelect;
export type InsertProjectBudgetItem = typeof projectBudgetItems.$inferInsert;

/**
 * Change Orders - Scope, schedule, and budget changes
 */
export const changeOrders = mysqlTable("change_orders", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  changeNumber: varchar("changeNumber", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  reason: text("reason").notNull(),
  impactType: varchar("impactType", { length: 50 }).notNull(),
  scheduleImpactDays: int("scheduleImpactDays").default(0),
  costImpact: decimal("costImpact", { precision: 15, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  requestedBy: int("requestedBy"),
  approvedBy: int("approvedBy"),
  requestedDate: timestamp("requestedDate").defaultNow(),
  approvedDate: timestamp("approvedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChangeOrder = typeof changeOrders.$inferSelect;
export type InsertChangeOrder = typeof changeOrders.$inferInsert;

/**
 * Project Risks - Risk register and mitigation tracking
 */
export const projectRisks = mysqlTable("project_risks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  riskNumber: varchar("riskNumber", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  probability: varchar("probability", { length: 20 }).notNull(),
  impact: varchar("impact", { length: 20 }).notNull(),
  riskScore: int("riskScore"),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  mitigationPlan: text("mitigationPlan"),
  contingencyPlan: text("contingencyPlan"),
  ownerId: int("ownerId"),
  identifiedDate: timestamp("identifiedDate").defaultNow(),
  closedDate: timestamp("closedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectRisk = typeof projectRisks.$inferSelect;
export type InsertProjectRisk = typeof projectRisks.$inferInsert;

/**
 * Project Status Reports - Progress reporting and earned value
 */
export const projectStatusReports = mysqlTable("project_status_reports", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  reportDate: timestamp("reportDate").notNull(),
  reportPeriod: varchar("reportPeriod", { length: 50 }).notNull(),
  overallStatus: varchar("overallStatus", { length: 20 }).notNull(),
  scheduleStatus: varchar("scheduleStatus", { length: 20 }).notNull(),
  budgetStatus: varchar("budgetStatus", { length: 20 }).notNull(),
  scopeStatus: varchar("scopeStatus", { length: 20 }).notNull(),
  accomplishments: text("accomplishments"),
  plannedActivities: text("plannedActivities"),
  issues: text("issues"),
  decisions: text("decisions"),
  earnedValue: decimal("earnedValue", { precision: 15, scale: 2 }),
  plannedValue: decimal("plannedValue", { precision: 15, scale: 2 }),
  actualCost: decimal("actualCost", { precision: 15, scale: 2 }),
  cpi: decimal("cpi", { precision: 5, scale: 2 }),
  spi: decimal("spi", { precision: 5, scale: 2 }),
  preparedBy: int("preparedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectStatusReport = typeof projectStatusReports.$inferSelect;
export type InsertProjectStatusReport = typeof projectStatusReports.$inferInsert;


/**
 * Position Requisitions - Track requests to fill coordinator positions
 */
export const positionRequisitions = mysqlTable("position_requisitions", {
  id: int("id").autoincrement().primaryKey(),
  positionId: varchar("positionId", { length: 100 }).notNull(), // e.g., "ops-coordinator-finance"
  positionTitle: varchar("positionTitle", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 255 }).notNull(),
  tier: varchar("tier", { length: 50 }).notNull(), // tier3_open, tier4_coordinator
  requestedBy: int("requestedBy").notNull(), // Manager requesting the position
  requestedByName: varchar("requestedByName", { length: 255 }),
  justification: text("justification").notNull(), // Why this position is needed
  budgetApproved: mysqlEnum("budgetApproved", ["pending", "approved", "rejected"]).default("pending").notNull(),
  salaryRange: varchar("salaryRange", { length: 100 }),
  targetStartDate: timestamp("targetStartDate"),
  urgency: mysqlEnum("urgency", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "under_review", "approved", "rejected", "filled", "cancelled"]).default("draft").notNull(),
  approvedBy: int("approvedBy"),
  approvedByName: varchar("approvedByName", { length: 255 }),
  approvalDate: timestamp("approvalDate"),
  approvalNotes: text("approvalNotes"),
  candidateName: varchar("candidateName", { length: 255 }), // If a candidate is identified
  candidateEmail: varchar("candidateEmail", { length: 320 }),
  filledDate: timestamp("filledDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PositionRequisition = typeof positionRequisitions.$inferSelect;
export type InsertPositionRequisition = typeof positionRequisitions.$inferInsert;


/**
 * Contractor Transitions - Track employee-to-contractor transitions
 */
export const contractorTransitions = mysqlTable("contractor_transitions", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  employeeName: varchar("employeeName", { length: 255 }).notNull(),
  initiatedBy: int("initiatedBy").notNull(),
  initiatedByName: varchar("initiatedByName", { length: 255 }),
  
  // Transition phases
  phase: mysqlEnum("phase", [
    "initiated",
    "training_assigned",
    "training_in_progress",
    "training_completed",
    "entity_formation",
    "entity_verified",
    "contract_pending",
    "contract_signed",
    "completed",
    "cancelled"
  ]).default("initiated").notNull(),
  
  // Training tracking
  trainingModuleId: int("trainingModuleId"),
  trainingStartDate: timestamp("trainingStartDate"),
  trainingCompletionDate: timestamp("trainingCompletionDate"),
  trainingScore: int("trainingScore"),
  certificationIssued: boolean("certificationIssued").default(false).notNull(),
  
  // Entity formation tracking
  businessEntityId: int("businessEntityId"),
  entityName: varchar("entityName", { length: 255 }),
  entityType: varchar("entityType", { length: 100 }),
  entityFormationDate: timestamp("entityFormationDate"),
  einObtained: boolean("einObtained").default(false).notNull(),
  businessBankSetup: boolean("businessBankSetup").default(false).notNull(),
  
  // Contract tracking
  contractId: int("contractId"),
  contractSignedDate: timestamp("contractSignedDate"),
  contractTerms: json("contractTerms"),
  
  // Status tracking
  status: mysqlEnum("status", ["active", "completed", "cancelled", "on_hold"]).default("active").notNull(),
  completedDate: timestamp("completedDate"),
  cancellationReason: text("cancellationReason"),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContractorTransition = typeof contractorTransitions.$inferSelect;
export type InsertContractorTransition = typeof contractorTransitions.$inferInsert;

/**
 * Impact Metrics - Track program outcomes for grant reporting
 */
export const impactMetrics = mysqlTable("impact_metrics", {
  id: int("id").autoincrement().primaryKey(),
  metricType: mysqlEnum("metricType", [
    "employees_trained",
    "employees_transitioned",
    "businesses_formed",
    "contractor_retention",
    "contractor_revenue",
    "jobs_created",
    "community_members_served",
    "scholarships_awarded",
    "volunteer_hours"
  ]).notNull(),
  
  // Time period
  periodType: mysqlEnum("periodType", ["monthly", "quarterly", "annual"]).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  // Metric values
  targetValue: decimal("targetValue", { precision: 15, scale: 2 }),
  actualValue: decimal("actualValue", { precision: 15, scale: 2 }).notNull(),
  previousPeriodValue: decimal("previousPeriodValue", { precision: 15, scale: 2 }),
  
  // Context
  entityId: int("entityId"),
  entityName: varchar("entityName", { length: 255 }),
  programName: varchar("programName", { length: 255 }),
  grantId: varchar("grantId", { length: 100 }),
  
  // Notes and verification
  notes: text("notes"),
  dataSource: varchar("dataSource", { length: 255 }),
  verifiedBy: int("verifiedBy"),
  verifiedAt: timestamp("verifiedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ImpactMetric = typeof impactMetrics.$inferSelect;
export type InsertImpactMetric = typeof impactMetrics.$inferInsert;

/**
 * Contractor Businesses - Track businesses formed by transitioned contractors
 */
export const contractorBusinesses = mysqlTable("contractor_businesses", {
  id: int("id").autoincrement().primaryKey(),
  transitionId: int("transitionId").notNull(),
  contractorId: int("contractorId").notNull(),
  contractorName: varchar("contractorName", { length: 255 }).notNull(),
  
  // Business details
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessType: varchar("businessType", { length: 100 }),
  ein: varchar("ein", { length: 20 }),
  stateOfFormation: varchar("stateOfFormation", { length: 50 }),
  formationDate: timestamp("formationDate"),
  
  // Business status
  status: mysqlEnum("status", ["active", "inactive", "dissolved"]).default("active").notNull(),
  
  // Revenue tracking (self-reported)
  annualRevenue: decimal("annualRevenue", { precision: 15, scale: 2 }),
  revenueYear: int("revenueYear"),
  employeesHired: int("employeesHired").default(0),
  
  // Platform usage
  platformSubscription: mysqlEnum("platformSubscription", ["none", "basic", "professional", "enterprise"]).default("none").notNull(),
  platformActiveDate: timestamp("platformActiveDate"),
  
  // Relationship tracking
  activeContractWithLaws: boolean("activeContractWithLaws").default(false).notNull(),
  lastContractDate: timestamp("lastContractDate"),
  totalContractValue: decimal("totalContractValue", { precision: 15, scale: 2 }),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContractorBusiness = typeof contractorBusinesses.$inferSelect;
export type InsertContractorBusiness = typeof contractorBusinesses.$inferInsert;


// ============================================================================
// HOUSE TEMPLATE & ACTIVATION SYSTEM
// Placeholder Houses that can be activated when real entities are formed
// ============================================================================

/**
 * House Templates - Predefined structures for different House types
 * These serve as blueprints for creating placeholder Houses
 */
export const houseTemplates = mysqlTable("house_templates", {
  id: int("id").autoincrement().primaryKey(),
  templateCode: varchar("templateCode", { length: 50 }).notNull().unique(), // e.g., "EMP_TRANSITION", "PARTNER", "COMMUNITY"
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Template Configuration
  targetAudience: mysqlEnum("targetAudience", [
    "employee_transition",  // Employees becoming contractors
    "external_partner",     // Outside partners joining ecosystem
    "community_member",     // Community members
    "family_branch",        // Extended family branches
    "business_entity"       // Business-focused Houses
  ]).notNull(),
  
  // Default Trust Structure
  defaultTrustType: mysqlEnum("defaultTrustType", ["living", "revocable", "irrevocable", "dynasty"]).default("living"),
  defaultHouseType: mysqlEnum("defaultHouseType", ["bloodline", "mirrored", "adaptive"]).default("adaptive"),
  
  // Default Distribution Splits
  defaultInterHouseSplit: decimal("defaultInterHouseSplit", { precision: 5, scale: 2 }).default("60.00").notNull(),
  defaultInterHouseDistribution: decimal("defaultInterHouseDistribution", { precision: 5, scale: 2 }).default("40.00").notNull(),
  defaultIntraHouseOperations: decimal("defaultIntraHouseOperations", { precision: 5, scale: 2 }).default("70.00").notNull(),
  defaultIntraHouseInheritance: decimal("defaultIntraHouseInheritance", { precision: 5, scale: 2 }).default("30.00").notNull(),
  
  // Activation Requirements (JSON array of requirement codes)
  activationRequirements: json("activationRequirements"),
  
  // Educational Content
  educationalModules: json("educationalModules"), // Array of module IDs
  estimatedActivationTime: varchar("estimatedActivationTime", { length: 50 }), // e.g., "24 months"
  
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HouseTemplate = typeof houseTemplates.$inferSelect;
export type InsertHouseTemplate = typeof houseTemplates.$inferInsert;

/**
 * Activation Requirements - Define what's needed to activate a House
 */
export const activationRequirements = mysqlTable("activation_requirements", {
  id: int("id").autoincrement().primaryKey(),
  requirementCode: varchar("requirementCode", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  category: mysqlEnum("category", [
    "tenure",           // Time-based requirements
    "training",         // Educational requirements
    "legal",            // Legal entity formation
    "financial",        // Financial requirements
    "documentation",    // Document requirements
    "ceremonial"        // Ceremonial/ritual requirements
  ]).notNull(),
  
  // Verification Details
  verificationType: mysqlEnum("verificationType", [
    "automatic",        // System can verify automatically
    "document_upload",  // Requires document upload
    "manual_review",    // Requires admin review
    "external_api",     // Verified via external API
    "self_attestation"  // User self-attests
  ]).notNull(),
  
  verificationConfig: json("verificationConfig"), // Configuration for verification
  
  // Display
  iconName: varchar("iconName", { length: 50 }), // Lucide icon name
  sortOrder: int("sortOrder").default(0).notNull(),
  
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActivationRequirement = typeof activationRequirements.$inferSelect;
export type InsertActivationRequirement = typeof activationRequirements.$inferInsert;

/**
 * House Activation Progress - Track progress toward House activation
 */
export const houseActivationProgress = mysqlTable("house_activation_progress", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  requirementId: int("requirementId").notNull(),
  
  status: mysqlEnum("status", [
    "not_started",
    "in_progress",
    "pending_verification",
    "verified",
    "failed",
    "waived"
  ]).default("not_started").notNull(),
  
  // Progress Details
  progressPercentage: int("progressPercentage").default(0).notNull(),
  progressData: json("progressData"), // Requirement-specific progress data
  
  // Verification
  verifiedAt: timestamp("verifiedAt"),
  verifiedByUserId: int("verifiedByUserId"),
  verificationNotes: text("verificationNotes"),
  
  // Documents
  documentUrls: json("documentUrls"), // Array of uploaded document URLs
  
  // Waiver (if requirement was waived)
  waivedAt: timestamp("waivedAt"),
  waivedByUserId: int("waivedByUserId"),
  waiverReason: text("waiverReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HouseActivationProgress = typeof houseActivationProgress.$inferSelect;
export type InsertHouseActivationProgress = typeof houseActivationProgress.$inferInsert;

/**
 * House Activation Events - Track the activation journey
 */
export const houseActivationEvents = mysqlTable("house_activation_events", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  
  eventType: mysqlEnum("eventType", [
    "template_selected",
    "requirement_started",
    "requirement_completed",
    "document_uploaded",
    "verification_requested",
    "verification_approved",
    "verification_rejected",
    "activation_initiated",
    "activation_completed",
    "activation_ceremony",
    "status_changed"
  ]).notNull(),
  
  // Event Details
  requirementId: int("requirementId"),
  previousStatus: varchar("previousStatus", { length: 50 }),
  newStatus: varchar("newStatus", { length: 50 }),
  description: text("description"),
  metadata: json("metadata"),
  
  // Actor
  actorUserId: int("actorUserId"),
  actorType: mysqlEnum("actorType", ["system", "user", "admin"]).default("user").notNull(),
  
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HouseActivationEvent = typeof houseActivationEvents.$inferSelect;
export type InsertHouseActivationEvent = typeof houseActivationEvents.$inferInsert;

/**
 * House Projected Distributions - Show what placeholder Houses would receive if activated
 */
export const houseProjectedDistributions = mysqlTable("house_projected_distributions", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  
  // Projection Period
  periodStart: date("periodStart").notNull(),
  periodEnd: date("periodEnd").notNull(),
  
  // Projected Amounts
  projectedGrossIncome: decimal("projectedGrossIncome", { precision: 20, scale: 2 }).default("0").notNull(),
  projectedNetDistribution: decimal("projectedNetDistribution", { precision: 20, scale: 2 }).default("0").notNull(),
  projectedOperationsAllocation: decimal("projectedOperationsAllocation", { precision: 20, scale: 2 }).default("0").notNull(),
  projectedInheritanceAllocation: decimal("projectedInheritanceAllocation", { precision: 20, scale: 2 }).default("0").notNull(),
  
  // Calculation Basis
  calculationMethod: mysqlEnum("calculationMethod", [
    "average_house",      // Based on average of activated Houses
    "tier_based",         // Based on House tier/level
    "custom_projection",  // Custom projection
    "historical"          // Based on historical data
  ]).default("average_house").notNull(),
  
  calculationNotes: text("calculationNotes"),
  
  // Display
  isDisplayed: boolean("isDisplayed").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HouseProjectedDistribution = typeof houseProjectedDistributions.$inferSelect;
export type InsertHouseProjectedDistribution = typeof houseProjectedDistributions.$inferInsert;

/**
 * Activation Credits - Credits earned toward House activation
 */
export const activationCredits = mysqlTable("activation_credits", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  userId: int("userId").notNull(),
  
  creditType: mysqlEnum("creditType", [
    "course_completion",
    "community_participation",
    "referral",
    "milestone_achievement",
    "time_tenure",
    "bonus"
  ]).notNull(),
  
  credits: int("credits").notNull(),
  description: text("description"),
  sourceReferenceType: varchar("sourceReferenceType", { length: 50 }), // e.g., "course", "event"
  sourceReferenceId: int("sourceReferenceId"),
  
  expiresAt: timestamp("expiresAt"),
  status: mysqlEnum("status", ["active", "used", "expired"]).default("active").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivationCredit = typeof activationCredits.$inferSelect;
export type InsertActivationCredit = typeof activationCredits.$inferInsert;

/**
 * House Sub-Entities - Internal trust structures within an activated House
 */
export const houseSubEntities = mysqlTable("house_sub_entities", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  
  entityType: mysqlEnum("entityType", [
    "operating_llc",
    "family_trust",
    "education_trust",
    "charitable_trust",
    "investment_entity",
    "holding_company"
  ]).notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Legal Details
  ein: varchar("ein", { length: 20 }),
  stateOfFormation: varchar("stateOfFormation", { length: 50 }),
  formationDate: date("formationDate"),
  
  // Financial Allocation
  allocationPercentage: decimal("allocationPercentage", { precision: 5, scale: 2 }).default("0").notNull(),
  
  // Documents
  formationDocumentUrl: text("formationDocumentUrl"),
  operatingAgreementUrl: text("operatingAgreementUrl"),
  
  status: mysqlEnum("status", ["forming", "active", "suspended", "dissolved"]).default("forming").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HouseSubEntity = typeof houseSubEntities.$inferSelect;
export type InsertHouseSubEntity = typeof houseSubEntities.$inferInsert;

/**
 * House Succession Designations - Designated successors for House leadership
 */
export const houseSuccessionDesignations = mysqlTable("house_succession_designations", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  
  // Successor Details
  successorUserId: int("successorUserId").notNull(),
  priority: int("priority").notNull(), // 1 = primary, 2 = secondary, etc.
  
  // Designation Type
  designationType: mysqlEnum("designationType", [
    "explicit",           // Explicitly designated by current custodian
    "automatic_spouse",   // Automatic spouse succession
    "automatic_eldest",   // Automatic eldest child
    "automatic_trust"     // Returns to parent trust
  ]).notNull(),
  
  // Conditions
  conditions: json("conditions"), // JSON array of conditions for succession
  
  // Acceptance
  acceptanceStatus: mysqlEnum("acceptanceStatus", [
    "pending",
    "accepted",
    "declined",
    "revoked"
  ]).default("pending").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  
  // Designation Details
  designatedByUserId: int("designatedByUserId").notNull(),
  designatedAt: timestamp("designatedAt").defaultNow().notNull(),
  effectiveDate: date("effectiveDate"),
  expiresAt: timestamp("expiresAt"),
  
  notes: text("notes"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  
  status: mysqlEnum("status", ["active", "superseded", "revoked", "executed"]).default("active").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HouseSuccessionDesignation = typeof houseSuccessionDesignations.$inferSelect;
export type InsertHouseSuccessionDesignation = typeof houseSuccessionDesignations.$inferInsert;


/**
 * Platform Usage Fees - Track all tool usage that generates revenue for the collective
 * This is how Business-First Houses contribute to the ecosystem without giving up their business revenue
 */
export const platformUsageFees = mysqlTable("platform_usage_fees", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId").notNull(),
  userId: int("userId").notNull(),
  
  // Fee Type
  feeType: mysqlEnum("feeType", [
    "subscription",           // Monthly platform subscription
    "payroll_processing",     // Payroll tool usage
    "invoice_generation",     // Invoice creation
    "contract_management",    // Contract tools
    "document_vault",         // Document storage
    "tax_prep",              // Tax preparation tools
    "banking_credit",        // Banking/credit features
    "digital_signatures",    // E-signature usage
    "training_course",       // Course/certification fees
    "marketplace_listing",   // Marketplace listing fees
    "marketplace_sale",      // Marketplace transaction fees
    "api_access",           // API usage fees
    "white_label",          // White-label service fees
    "insurance_pool",       // Insurance participation
    "asset_access",         // Property/asset usage
    "referral_commission"   // Referral bonuses
  ]).notNull(),
  
  // Fee Details
  description: text("description"),
  baseAmount: decimal("baseAmount", { precision: 20, scale: 2 }).notNull(),
  feePercentage: decimal("feePercentage", { precision: 5, scale: 2 }), // If percentage-based
  calculatedFee: decimal("calculatedFee", { precision: 20, scale: 2 }).notNull(),
  
  // Split Application (60/40 or 70/30)
  splitType: mysqlEnum("splitType", ["inter_house_60_40", "intra_house_70_30"]).default("inter_house_60_40").notNull(),
  collectiveShare: decimal("collectiveShare", { precision: 20, scale: 2 }).notNull(), // Amount to collective
  houseShare: decimal("houseShare", { precision: 20, scale: 2 }).notNull(), // Amount credited to House
  
  // Reference to source transaction
  sourceType: varchar("sourceType", { length: 50 }), // e.g., "payroll_run", "invoice", "contract"
  sourceId: int("sourceId"),
  
  // Status
  status: mysqlEnum("status", ["pending", "processed", "distributed", "refunded"]).default("pending").notNull(),
  processedAt: timestamp("processedAt"),
  distributedAt: timestamp("distributedAt"),
  
  // Blockchain
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformUsageFee = typeof platformUsageFees.$inferSelect;
export type InsertPlatformUsageFee = typeof platformUsageFees.$inferInsert;

/**
 * Platform Subscription Plans - Define subscription tiers for Houses
 */
export const platformSubscriptionPlans = mysqlTable("platform_subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  planCode: varchar("planCode", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  
  // Pricing
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annualPrice", { precision: 10, scale: 2 }), // Discounted annual
  
  // Features (JSON array of feature codes)
  includedFeatures: json("includedFeatures"),
  
  // Limits
  maxUsers: int("maxUsers"),
  maxStorageGb: int("maxStorageGb"),
  maxTransactionsPerMonth: int("maxTransactionsPerMonth"),
  
  // Tool Access
  payrollAccess: boolean("payrollAccess").default(false).notNull(),
  invoicingAccess: boolean("invoicingAccess").default(false).notNull(),
  contractsAccess: boolean("contractsAccess").default(false).notNull(),
  taxPrepAccess: boolean("taxPrepAccess").default(false).notNull(),
  bankingAccess: boolean("bankingAccess").default(false).notNull(),
  marketplaceAccess: boolean("marketplaceAccess").default(false).notNull(),
  apiAccess: boolean("apiAccess").default(false).notNull(),
  whiteLabelAccess: boolean("whiteLabelAccess").default(false).notNull(),
  
  // Transaction Fee Rates (percentage)
  payrollFeeRate: decimal("payrollFeeRate", { precision: 5, scale: 2 }).default("2.00"),
  invoiceFeeRate: decimal("invoiceFeeRate", { precision: 5, scale: 2 }).default("1.50"),
  marketplaceFeeRate: decimal("marketplaceFeeRate", { precision: 5, scale: 2 }).default("5.00"),
  
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformSubscriptionPlan = typeof platformSubscriptionPlans.$inferSelect;
export type InsertPlatformSubscriptionPlan = typeof platformSubscriptionPlans.$inferInsert;

/**
 * House Referrals - Track referrals for commission calculation
 */
export const houseReferrals = mysqlTable("house_referrals", {
  id: int("id").autoincrement().primaryKey(),
  referringHouseId: int("referringHouseId").notNull(),
  referredHouseId: int("referredHouseId").notNull(),
  referringUserId: int("referringUserId").notNull(),
  
  // Referral Details
  referralCode: varchar("referralCode", { length: 50 }),
  referralType: mysqlEnum("referralType", ["direct", "link", "event", "partner"]).default("direct").notNull(),
  
  // Commission
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("10.00"), // 10% default
  commissionDuration: int("commissionDuration").default(12), // Months to receive commission
  totalCommissionEarned: decimal("totalCommissionEarned", { precision: 20, scale: 2 }).default("0.00"),
  
  // Status
  status: mysqlEnum("status", ["pending", "active", "expired", "cancelled"]).default("pending").notNull(),
  activatedAt: timestamp("activatedAt"),
  expiresAt: timestamp("expiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HouseReferral = typeof houseReferrals.$inferSelect;
export type InsertHouseReferral = typeof houseReferrals.$inferInsert;


/**
 * Company Calendar - Meetings and Events
 */
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: mysqlEnum("eventType", [
    "team_meeting",
    "department_meeting",
    "all_hands",
    "training",
    "planning",
    "one_on_one",
    "external",
    "other"
  ]).default("team_meeting").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("America/Chicago").notNull(),
  location: varchar("location", { length: 255 }), // "Remote" or physical address
  meetingLink: varchar("meetingLink", { length: 500 }), // Zoom/Teams link
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurrenceRule: varchar("recurrenceRule", { length: 255 }), // RRULE format
  recurrenceParentId: int("recurrenceParentId"), // Link to parent event for recurring
  departmentId: int("departmentId"), // Optional department filter
  createdBy: int("createdBy").notNull(),
  isMandatory: boolean("isMandatory").default(true).notNull(),
  status: mysqlEnum("status", ["scheduled", "cancelled", "completed"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

/**
 * Meeting Attendance Tracking
 */
export const meetingAttendance = mysqlTable("meeting_attendance", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", [
    "invited",
    "confirmed",
    "declined",
    "attended",
    "absent",
    "excused"
  ]).default("invited").notNull(),
  responseTime: timestamp("responseTime"),
  checkInTime: timestamp("checkInTime"),
  checkOutTime: timestamp("checkOutTime"),
  excuseReason: text("excuseReason"),
  approvedBy: int("approvedBy"), // Manager who approved absence
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MeetingAttendance = typeof meetingAttendance.$inferSelect;
export type InsertMeetingAttendance = typeof meetingAttendance.$inferInsert;

/**
 * Event Invitees - Who should attend each event
 */
export const eventInvitees = mysqlTable("event_invitees", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId"),
  departmentId: int("departmentId"), // Invite whole department
  roleLevel: varchar("roleLevel", { length: 50 }), // Invite by role (e.g., "manager", "coordinator")
  isRequired: boolean("isRequired").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventInvitee = typeof eventInvitees.$inferSelect;
export type InsertEventInvitee = typeof eventInvitees.$inferInsert;


// ============================================
// E-SIGNATURE & DOCUMENT WORKFLOW TABLES
// ============================================

/**
 * Document workflow status tracking
 * Manages document lifecycle from draft to official
 */
export const documentWorkflow = mysqlTable("document_workflow", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(), // Reference to secure_documents
  documentType: varchar("documentType", { length: 100 }).notNull(), // offer, resolution, contract, policy
  status: mysqlEnum("status", ["draft", "review", "pending_signature", "approved", "official", "expired", "superseded"]).default("draft").notNull(),
  version: int("version").default(1).notNull(),
  createdBy: int("createdBy").notNull(),
  reviewedBy: int("reviewedBy"),
  approvedBy: int("approvedBy"),
  reviewedAt: timestamp("reviewedAt"),
  approvedAt: timestamp("approvedAt"),
  officialAt: timestamp("officialAt"),
  expiresAt: timestamp("expiresAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * E-Signature requests
 * Tracks documents requiring signatures
 */
export const signatureRequests = mysqlTable("signature_requests", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  documentType: varchar("documentType", { length: 100 }).notNull(),
  documentTitle: varchar("documentTitle", { length: 255 }).notNull(),
  requestedBy: int("requestedBy").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "expired", "cancelled"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt"),
  completedAt: timestamp("completedAt"),
  signedDocumentUrl: text("signedDocumentUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Individual signatures on documents
 * Captures each signer's signature with legal metadata
 */
export const signatures = mysqlTable("signatures", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  signerId: int("signerId").notNull(),
  signerName: varchar("signerName", { length: 255 }).notNull(),
  signerEmail: varchar("signerEmail", { length: 320 }),
  signerTitle: varchar("signerTitle", { length: 100 }), // CEO, Secretary, etc.
  signatureType: mysqlEnum("signatureType", ["typed", "drawn", "uploaded"]).default("typed").notNull(),
  signatureData: text("signatureData"), // Base64 signature image or typed name
  signedAt: timestamp("signedAt"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  status: mysqlEnum("status", ["pending", "signed", "declined"]).default("pending").notNull(),
  declineReason: text("declineReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// BOARD GOVERNANCE TABLES
// ============================================

/**
 * Board positions within the organization
 */
export const boardPositions = mysqlTable("board_positions", {
  id: int("id").autoincrement().primaryKey(),
  entityId: int("entityId").notNull(), // Which business entity
  title: varchar("title", { length: 100 }).notNull(), // President, Secretary, Treasurer, Board Member
  description: text("description"),
  responsibilities: json("responsibilities"), // Array of responsibility strings
  votingRights: boolean("votingRights").default(true).notNull(),
  signatureAuthority: boolean("signatureAuthority").default(false).notNull(),
  maxSignatureAmount: decimal("maxSignatureAmount", { precision: 15, scale: 2 }), // Max $ they can authorize
  isOfficer: boolean("isOfficer").default(false).notNull(), // Officers vs Board Members
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Board members - who holds which positions
 */
export const boardMembers = mysqlTable("board_members", {
  id: int("id").autoincrement().primaryKey(),
  positionId: int("positionId").notNull(),
  userId: int("userId"), // If they have a user account
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  status: mysqlEnum("status", ["active", "pending", "resigned", "removed"]).default("active").notNull(),
  appointedAt: timestamp("appointedAt").defaultNow().notNull(),
  appointedBy: int("appointedBy"), // Who appointed them
  termStartDate: timestamp("termStartDate"),
  termEndDate: timestamp("termEndDate"),
  resignedAt: timestamp("resignedAt"),
  signatureOnFile: text("signatureOnFile"), // Their stored signature
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Board resolutions with voting
 */
export const boardResolutionVotes = mysqlTable("board_resolution_votes", {
  id: int("id").autoincrement().primaryKey(),
  resolutionId: int("resolutionId").notNull(), // Reference to board_resolutions
  memberId: int("memberId").notNull(),
  vote: mysqlEnum("vote", ["approve", "reject", "abstain"]).notNull(),
  votedAt: timestamp("votedAt").defaultNow().notNull(),
  comments: text("comments"),
});

/**
 * Board meeting attendance tracking
 */
export const boardMeetingAttendance = mysqlTable("board_meeting_attendance", {
  id: int("id").autoincrement().primaryKey(),
  meetingId: int("meetingId").notNull(), // Reference to calendar_meetings
  memberId: int("memberId").notNull(),
  status: mysqlEnum("status", ["invited", "confirmed", "attended", "absent", "excused"]).default("invited").notNull(),
  checkedInAt: timestamp("checkedInAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});


// ============================================
// PENDING HEIR REGISTRY
// Grandchildren and future heirs awaiting House activation
// ============================================

/**
 * Pending House Heirs - Heir Queue for grandchildren and future generations
 * These are heirs who will receive their own House upon activation criteria being met
 * Until activated, their distributions accumulate in their parent's House
 */
export const pendingHouseHeirs = mysqlTable("pending_house_heirs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Parent House (where accumulation happens until activation)
  parentHouseId: int("parentHouseId").notNull(),
  parentHouseName: varchar("parentHouseName", { length: 255 }),
  
  // Parent member (biological parent in the system)
  parentMemberId: int("parentMemberId"), // Reference to houseMembers
  parentMemberName: varchar("parentMemberName", { length: 255 }),
  otherParentName: varchar("otherParentName", { length: 255 }), // Non-member parent
  
  // Heir identification
  fullName: varchar("fullName", { length: 255 }).notNull(),
  dateOfBirth: timestamp("dateOfBirth").notNull(),
  relationship: mysqlEnum("relationship", [
    "grandchild", "great_grandchild", "step_grandchild", 
    "adopted_grandchild", "foster_grandchild", "other"
  ]).notNull(),
  generation: int("generation").default(3).notNull(), // 1=founder, 2=children, 3=grandchildren, etc.
  
  // Contact (for when they're older)
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  
  // Projected House details
  projectedHouseName: varchar("projectedHouseName", { length: 255 }), // e.g., "House of Christopher"
  projectedHouseType: mysqlEnum("projectedHouseType", ["bloodline", "mirrored", "adaptive"]).default("bloodline"),
  
  // Activation criteria
  activationTrigger: mysqlEnum("activationTrigger", [
    "age_18",           // Automatic at 18
    "age_21",           // Automatic at 21
    "age_25",           // Automatic at 25
    "education",        // Upon completing education
    "marriage",         // Upon marriage
    "first_business",   // Upon starting first business
    "manual",           // Manual activation by trustee
    "custom"            // Custom criteria
  ]).default("age_18").notNull(),
  customActivationCriteria: text("customActivationCriteria"),
  projectedActivationDate: timestamp("projectedActivationDate"), // Calculated from DOB + trigger
  
  // Accumulation tracking
  accumulatedAmount: decimal("accumulatedAmount", { precision: 18, scale: 2 }).default("0"),
  lastAccumulationDate: timestamp("lastAccumulationDate"),
  accumulationAccountId: int("accumulationAccountId"), // Reference to heir_accumulation_accounts
  
  // Distribution percentage (from parent House's heir pool)
  distributionPercentage: decimal("distributionPercentage", { precision: 5, scale: 2 }).notNull(),
  percentageLocked: boolean("percentageLocked").default(false),
  
  // Status
  status: mysqlEnum("status", [
    "pending",          // Awaiting activation
    "eligible",         // Met criteria, ready to activate
    "activating",       // In activation process
    "activated",        // House created
    "deferred",         // Activation deferred
    "removed"           // Removed from registry
  ]).default("pending").notNull(),
  
  // Activation tracking
  activatedHouseId: int("activatedHouseId"), // Reference to houses table once activated
  activatedAt: timestamp("activatedAt"),
  activatedBy: int("activatedBy"),
  
  // Audit
  registeredBy: int("registeredBy").notNull(),
  registeredAt: timestamp("registeredAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  notes: text("notes"),
});

export type PendingHouseHeir = typeof pendingHouseHeirs.$inferSelect;
export type InsertPendingHouseHeir = typeof pendingHouseHeirs.$inferInsert;

/**
 * Pending Heir Placeholders - For children not yet born
 * Allows setting aside allocation for future grandchildren
 */
export const pendingHeirPlaceholders = mysqlTable("pending_heir_placeholders", {
  id: int("id").autoincrement().primaryKey(),
  
  // Parent House
  parentHouseId: int("parentHouseId").notNull(),
  
  // Parent member who will have the child
  parentMemberId: int("parentMemberId").notNull(),
  parentMemberName: varchar("parentMemberName", { length: 255 }),
  
  // Placeholder details
  placeholderName: varchar("placeholderName", { length: 255 }).notNull(), // e.g., "Future Child of Amandes"
  projectedHouseType: mysqlEnum("projectedHouseType", ["bloodline", "mirrored", "adaptive"]).default("bloodline"),
  
  // Reserved allocation
  reservedPercentage: decimal("reservedPercentage", { precision: 5, scale: 2 }).notNull(),
  reservedAmount: decimal("reservedAmount", { precision: 18, scale: 2 }).default("0"),
  
  // Status
  status: mysqlEnum("status", ["active", "converted", "released"]).default("active").notNull(),
  
  // When converted to actual heir
  convertedToHeirId: int("convertedToHeirId"), // Reference to pending_house_heirs
  convertedAt: timestamp("convertedAt"),
  
  // Expiration (optional - release funds if no child by date)
  expiresAt: timestamp("expiresAt"),
  
  // Audit
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PendingHeirPlaceholder = typeof pendingHeirPlaceholders.$inferSelect;
export type InsertPendingHeirPlaceholder = typeof pendingHeirPlaceholders.$inferInsert;


// ============================================
// GRANT APPLICATION HISTORY
// Track status changes and updates for grant applications
// ============================================

/**
 * Grant Application History - Track status changes and updates
 */
export const grantApplicationHistory = mysqlTable("grant_application_history", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  
  action: mysqlEnum("action", [
    "created",
    "status_changed",
    "updated",
    "submitted",
    "attachment_added",
    "note_added",
    "assigned",
    "feedback_received"
  ]).notNull(),
  
  previousStatus: varchar("previousStatus", { length: 50 }),
  newStatus: varchar("newStatus", { length: 50 }),
  description: text("description"),
  metadata: json("metadata"),
  
  performedBy: int("performedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GrantApplicationHistory = typeof grantApplicationHistory.$inferSelect;
export type InsertGrantApplicationHistory = typeof grantApplicationHistory.$inferInsert;

// ============================================
// GRANT DOCUMENT MANAGEMENT
// Document upload, storage, and management for grant applications
// ============================================

/**
 * Grant Documents - Store metadata for uploaded documents
 * Files stored in S3, metadata in database
 */
export const grantDocuments = mysqlTable("grant_documents", {
  id: int("id").autoincrement().primaryKey(),
  
  // Entity association
  entityId: varchar("entityId", { length: 100 }).notNull(),
  entityName: varchar("entityName", { length: 255 }).notNull(),
  
  // Document metadata
  fileName: varchar("fileName", { length: 500 }).notNull(),
  originalFileName: varchar("originalFileName", { length: 500 }).notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  
  // S3 storage
  s3Key: varchar("s3Key", { length: 1000 }).notNull(),
  s3Url: varchar("s3Url", { length: 2000 }).notNull(),
  
  // Document categorization
  category: mysqlEnum("grantDocCategory", [
    "budget",
    "staffing",
    "equipment",
    "letters_of_support",
    "legal",
    "financial_statements",
    "program_narrative",
    "evaluation_plan",
    "timeline",
    "certificates",
    "other"
  ]).notNull(),
  
  // Document details
  description: text("description"),
  version: int("version").default(1).notNull(),
  
  // Expiration tracking
  expiresAt: timestamp("expiresAt"),
  isExpired: boolean("isExpired").default(false).notNull(),
  
  // Status
  status: mysqlEnum("grantDocStatus", [
    "active",
    "archived",
    "replaced",
    "deleted"
  ]).default("active").notNull(),
  
  // Audit
  uploadedBy: varchar("uploadedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GrantDocument = typeof grantDocuments.$inferSelect;
export type InsertGrantDocument = typeof grantDocuments.$inferInsert;

/**
 * Grant Application Documents - Link documents to specific applications
 */
export const grantApplicationDocuments = mysqlTable("grant_application_documents", {
  id: int("id").autoincrement().primaryKey(),
  
  applicationId: int("applicationId").notNull(),
  documentId: int("documentId").notNull(),
  
  isRequired: boolean("isRequired").default(false).notNull(),
  isSubmitted: boolean("isSubmitted").default(false).notNull(),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GrantApplicationDocument = typeof grantApplicationDocuments.$inferSelect;
export type InsertGrantApplicationDocument = typeof grantApplicationDocuments.$inferInsert;

/**
 * Document Requirements - Define what documents are needed per grant type
 */
export const documentRequirements = mysqlTable("document_requirements", {
  id: int("id").autoincrement().primaryKey(),
  
  grantId: int("grantId"),
  grantType: varchar("grantType", { length: 100 }),
  
  category: mysqlEnum("reqDocCategory", [
    "budget",
    "staffing",
    "equipment",
    "letters_of_support",
    "legal",
    "financial_statements",
    "program_narrative",
    "evaluation_plan",
    "timeline",
    "certificates",
    "other"
  ]).notNull(),
  
  description: text("description").notNull(),
  isRequired: boolean("isRequired").default(true).notNull(),
  maxFileSize: int("maxFileSize"),
  allowedFormats: json("allowedFormats").$type<string[]>(),
  
  validityPeriod: int("validityPeriod"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DocumentRequirement = typeof documentRequirements.$inferSelect;
export type InsertDocumentRequirement = typeof documentRequirements.$inferInsert;


/**
 * Family Member Resumes - Store competency-based resumes for family members
 */
export const familyResumes = mysqlTable("family_resumes", {
  id: int("id").autoincrement().primaryKey(),
  
  // Family member identification
  familyMemberId: varchar("familyMemberId", { length: 100 }).notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  location: varchar("location", { length: 255 }),
  
  // Professional summary
  summary: text("summary"),
  
  // Qualification type
  qualificationType: mysqlEnum("qualificationType", [
    "traditional",
    "demonstrated",
    "hybrid"
  ]).default("demonstrated").notNull(),
  
  // Structured data stored as JSON
  education: json("education").$type<Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>>(),
  
  certifications: json("certifications").$type<Array<{
    name: string;
    issuer: string;
    year: string;
    active: boolean;
  }>>(),
  
  competencyEvidence: json("competencyEvidence").$type<Array<{
    id: string;
    category: string;
    description: string;
    outcome: string;
    timeframe: string;
    verifiable: boolean;
    verificationSource?: string;
  }>>(),
  
  skills: json("skills").$type<Array<{
    skill: string;
    level: "foundational" | "proficient" | "advanced" | "expert";
    evidence: string;
  }>>(),
  
  references: json("references").$type<Array<{
    name: string;
    relationship: string;
    yearsKnown: number;
    contactInfo: string;
    attestation: string;
  }>>(),
  
  developmentPlan: text("developmentPlan"),
  
  // Status
  status: mysqlEnum("resumeStatus", [
    "draft",
    "complete",
    "approved"
  ]).default("draft").notNull(),
  
  // Audit
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FamilyResume = typeof familyResumes.$inferSelect;
export type InsertFamilyResume = typeof familyResumes.$inferInsert;

/**
 * Offer Packages - Complete employment offer packages for family members
 */
export const offerPackages = mysqlTable("offer_packages", {
  id: int("id").autoincrement().primaryKey(),
  
  // Link to resume (required)
  resumeId: int("resumeId").notNull(),
  
  // Family member info
  familyMemberId: varchar("familyMemberId", { length: 100 }).notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  
  // Position details
  positionTitle: varchar("positionTitle", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }),
  entityId: varchar("entityId", { length: 100 }).notNull(),
  entityName: varchar("entityName", { length: 255 }).notNull(),
  reportsTo: varchar("reportsTo", { length: 255 }),
  
  // Employment type
  employmentType: mysqlEnum("employmentType", [
    "full_time",
    "part_time",
    "contractor",
    "contingent"
  ]).default("contingent").notNull(),
  
  // Compensation
  baseSalary: decimal("baseSalary", { precision: 12, scale: 2 }),
  salaryFrequency: mysqlEnum("salaryFrequency", [
    "hourly",
    "weekly",
    "biweekly",
    "monthly",
    "annually"
  ]).default("annually"),
  tokenAllocation: int("tokenAllocation"),
  revenueSharePercent: decimal("revenueSharePercent", { precision: 5, scale: 2 }),
  
  // Benefits
  benefits: json("benefits").$type<{
    healthInsurance: boolean;
    dentalVision: boolean;
    retirement401k: boolean;
    paidTimeOff: number;
    tokenEconomy: boolean;
    revenueSharing: boolean;
  }>(),
  
  // Start date
  proposedStartDate: timestamp("proposedStartDate"),
  contingencyConditions: text("contingencyConditions"),
  
  // Document status
  offerLetterGenerated: boolean("offerLetterGenerated").default(false).notNull(),
  positionDescGenerated: boolean("positionDescGenerated").default(false).notNull(),
  compensationScheduleGenerated: boolean("compensationScheduleGenerated").default(false).notNull(),
  ndaGenerated: boolean("ndaGenerated").default(false).notNull(),
  nonCompeteGenerated: boolean("nonCompeteGenerated").default(false).notNull(),
  backgroundCheckAuthGenerated: boolean("backgroundCheckAuthGenerated").default(false).notNull(),
  taxFormsGenerated: boolean("taxFormsGenerated").default(false).notNull(),
  tokenAgreementGenerated: boolean("tokenAgreementGenerated").default(false).notNull(),
  
  // Package status
  status: mysqlEnum("offerStatus", [
    "draft",
    "pending_review",
    "approved",
    "sent",
    "accepted",
    "declined",
    "expired"
  ]).default("draft").notNull(),
  
  // Signatures
  offerSentAt: timestamp("offerSentAt"),
  offerAcceptedAt: timestamp("offerAcceptedAt"),
  signatureId: varchar("signatureId", { length: 255 }),
  
  // Audit
  createdBy: int("createdBy"),
  approvedBy: int("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OfferPackage = typeof offerPackages.$inferSelect;
export type InsertOfferPackage = typeof offerPackages.$inferInsert;

/**
 * Offer Package Documents - Individual documents within an offer package
 */
export const offerPackageDocuments = mysqlTable("offer_package_documents", {
  id: int("id").autoincrement().primaryKey(),
  
  offerId: int("offerId").notNull(),
  
  documentType: mysqlEnum("offerDocType", [
    "offer_letter",
    "position_description",
    "compensation_schedule",
    "nda",
    "non_compete",
    "background_check_auth",
    "direct_deposit",
    "w4",
    "w9",
    "i9",
    "token_agreement",
    "policy_acknowledgment",
    "resume"
  ]).notNull(),
  
  // Document content
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  
  // S3 storage (for generated PDFs)
  s3Key: varchar("s3Key", { length: 1000 }),
  s3Url: varchar("s3Url", { length: 2000 }),
  
  // Signature tracking
  requiresSignature: boolean("requiresSignature").default(false).notNull(),
  signedAt: timestamp("signedAt"),
  signatureData: text("signatureData"),
  
  // Status
  status: mysqlEnum("offerDocStatus", [
    "draft",
    "generated",
    "sent",
    "signed",
    "rejected"
  ]).default("draft").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OfferPackageDocument = typeof offerPackageDocuments.$inferSelect;
export type InsertOfferPackageDocument = typeof offerPackageDocuments.$inferInsert;


/**
 * Specialist Tracks - Entry-level career progression for family members
 * 
 * Designed for younger family members (16-18) entering the workforce with:
 * - Age-based eligibility (16+ with work permit, 18+ full)
 * - Education requirement (HS diploma OR Academy graduation)
 * - Part-time start (20-25 hrs/week) progressing to full-time
 * - 3-5 year progression timeline with acceleration options
 */
export const specialistTracks = mysqlTable("specialist_tracks", {
  id: int("id").autoincrement().primaryKey(),
  
  // Link to family member
  familyMemberId: varchar("familyMemberId", { length: 100 }).notNull(),
  userId: int("userId"),
  
  // Personal info
  fullName: varchar("fullName", { length: 255 }).notNull(),
  dateOfBirth: timestamp("dateOfBirth"),
  currentAge: int("currentAge"),
  
  // Eligibility
  hasWorkPermit: boolean("hasWorkPermit").default(false).notNull(),
  workPermitExpiry: timestamp("workPermitExpiry"),
  educationStatus: mysqlEnum("educationStatus", [
    "in_high_school",
    "high_school_diploma",
    "academy_enrolled",
    "academy_graduate",
    "ged",
    "college_enrolled",
    "college_graduate"
  ]).default("in_high_school").notNull(),
  educationVerifiedAt: timestamp("educationVerifiedAt"),
  
  // Current level in the track
  currentLevel: mysqlEnum("specialistLevel", [
    "specialist_i",    // Entry - Part-time, supervised, learning fundamentals
    "specialist_ii",   // Developing - Increased hours, more autonomy
    "specialist_iii",  // Proficient - Full-time eligible, project ownership
    "associate"        // Bridge - Transition to standard career track
  ]).default("specialist_i").notNull(),
  
  // Employment details
  employmentType: mysqlEnum("specialistEmploymentType", [
    "part_time_20",    // 20 hours/week
    "part_time_25",    // 25 hours/week
    "part_time_30",    // 30 hours/week
    "full_time"        // 40 hours/week
  ]).default("part_time_20").notNull(),
  
  // Position assignment
  entityId: varchar("entityId", { length: 100 }),
  entityName: varchar("entityName", { length: 255 }),
  department: varchar("department", { length: 100 }),
  positionTitle: varchar("positionTitle", { length: 255 }),
  supervisorId: varchar("supervisorId", { length: 100 }),
  supervisorName: varchar("supervisorName", { length: 255 }),
  
  // Compensation (90% initial per policy)
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }),
  tokenAllocationMonthly: int("tokenAllocationMonthly").default(0),
  
  // Progression tracking
  trackStartDate: timestamp("trackStartDate"),
  currentLevelStartDate: timestamp("currentLevelStartDate"),
  expectedGraduationDate: timestamp("expectedGraduationDate"),
  acceleratedTrack: boolean("acceleratedTrack").default(false).notNull(),
  
  // Maturity score (0-100, calculated from assessments)
  maturityScore: int("maturityScore").default(0).notNull(),
  lastMaturityAssessment: timestamp("lastMaturityAssessment"),
  
  // Status
  status: mysqlEnum("specialistTrackStatus", [
    "pending_eligibility",
    "active",
    "on_hold",
    "graduated",
    "terminated",
    "transferred"
  ]).default("pending_eligibility").notNull(),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SpecialistTrack = typeof specialistTracks.$inferSelect;
export type InsertSpecialistTrack = typeof specialistTracks.$inferInsert;

/**
 * Specialist Maturity Assessments - Track advancement criteria
 * 
 * Assessments are conducted quarterly and measure:
 * - Academy module completions
 * - Simulator performance
 * - Supervisor evaluations
 * - Token economy participation
 * - Fiscal responsibility demonstrations
 */
export const specialistMaturityAssessments = mysqlTable("specialist_maturity_assessments", {
  id: int("id").autoincrement().primaryKey(),
  
  specialistTrackId: int("specialistTrackId").notNull(),
  
  // Assessment period
  assessmentPeriod: varchar("assessmentPeriod", { length: 20 }).notNull(), // e.g., "2026-Q1"
  assessmentDate: timestamp("assessmentDate").defaultNow().notNull(),
  assessorId: varchar("assessorId", { length: 100 }),
  assessorName: varchar("assessorName", { length: 255 }),
  
  // Academy Performance (0-20 points)
  academyModulesCompleted: int("academyModulesCompleted").default(0).notNull(),
  academyModulesTarget: int("academyModulesTarget").default(3).notNull(),
  academyScore: int("academyScore").default(0).notNull(),
  academyNotes: text("academyNotes"),
  
  // Simulator Performance (0-20 points)
  simulatorSessionsCompleted: int("simulatorSessionsCompleted").default(0).notNull(),
  simulatorAverageScore: int("simulatorAverageScore").default(0).notNull(),
  simulatorScore: int("simulatorScore").default(0).notNull(),
  simulatorNotes: text("simulatorNotes"),
  
  // Supervisor Evaluation (0-25 points)
  attendanceRating: int("attendanceRating").default(0).notNull(), // 1-5
  punctualityRating: int("punctualityRating").default(0).notNull(), // 1-5
  initiativeRating: int("initiativeRating").default(0).notNull(), // 1-5
  teamworkRating: int("teamworkRating").default(0).notNull(), // 1-5
  qualityOfWorkRating: int("qualityOfWorkRating").default(0).notNull(), // 1-5
  supervisorScore: int("supervisorScore").default(0).notNull(),
  supervisorComments: text("supervisorComments"),
  
  // Token Economy Participation (0-15 points)
  tokensEarned: int("tokensEarned").default(0).notNull(),
  tokensSpentWisely: boolean("tokensSpentWisely").default(false).notNull(),
  tokenSavingsRate: decimal("tokenSavingsRate", { precision: 5, scale: 2 }), // percentage
  tokenEconomyScore: int("tokenEconomyScore").default(0).notNull(),
  tokenEconomyNotes: text("tokenEconomyNotes"),
  
  // Fiscal Responsibility (0-20 points)
  budgetAdherence: boolean("budgetAdherence").default(false).notNull(),
  expenseReportingAccuracy: int("expenseReportingAccuracy").default(0).notNull(), // percentage
  financialGoalsMet: int("financialGoalsMet").default(0).notNull(), // count
  fiscalScore: int("fiscalScore").default(0).notNull(),
  fiscalNotes: text("fiscalNotes"),
  
  // Total Score (0-100)
  totalScore: int("totalScore").default(0).notNull(),
  
  // Advancement recommendation
  recommendsAdvancement: boolean("recommendsAdvancement").default(false).notNull(),
  recommendedLevel: mysqlEnum("recommendedSpecialistLevel", [
    "specialist_i",
    "specialist_ii",
    "specialist_iii",
    "associate"
  ]),
  advancementJustification: text("advancementJustification"),
  
  // Status
  status: mysqlEnum("assessmentStatus", [
    "draft",
    "submitted",
    "reviewed",
    "approved",
    "contested"
  ]).default("draft").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SpecialistMaturityAssessment = typeof specialistMaturityAssessments.$inferSelect;
export type InsertSpecialistMaturityAssessment = typeof specialistMaturityAssessments.$inferInsert;

/**
 * Specialist Progression Milestones - Track achievements and ceremonies
 */
export const specialistMilestones = mysqlTable("specialist_milestones", {
  id: int("id").autoincrement().primaryKey(),
  
  specialistTrackId: int("specialistTrackId").notNull(),
  
  // Milestone details
  milestoneType: mysqlEnum("milestoneType", [
    "level_advancement",
    "hours_milestone",      // 500, 1000, 2000 hours
    "academy_completion",
    "simulator_mastery",
    "first_project_lead",
    "mentorship_start",
    "full_time_transition",
    "graduation_ceremony"
  ]).notNull(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Achievement details
  achievedAt: timestamp("achievedAt").defaultNow().notNull(),
  previousLevel: varchar("previousLevel", { length: 50 }),
  newLevel: varchar("newLevel", { length: 50 }),
  
  // Recognition
  certificateIssued: boolean("certificateIssued").default(false).notNull(),
  certificateId: int("certificateId"),
  tokenBonus: int("tokenBonus").default(0).notNull(),
  
  // Ceremony tracking
  ceremonyScheduled: boolean("ceremonyScheduled").default(false).notNull(),
  ceremonyDate: timestamp("ceremonyDate"),
  ceremonyNotes: text("ceremonyNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SpecialistMilestone = typeof specialistMilestones.$inferSelect;
export type InsertSpecialistMilestone = typeof specialistMilestones.$inferInsert;


/**
 * Founding Members - Track original founding members for heir benefits
 * 
 * Founding members' heirs receive free Academy education as a core benefit.
 * Verified through House lineage system.
 */
export const foundingMembers = mysqlTable("founding_members", {
  id: int("id").autoincrement().primaryKey(),
  
  // Member identification
  userId: int("userId"),
  houseId: varchar("houseId", { length: 100 }),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  
  // Founding details
  foundingDate: timestamp("foundingDate").notNull(),
  foundingRole: mysqlEnum("foundingRole", [
    "primary_founder",      // Original founder (e.g., Calea Freeman)
    "co_founder",           // Co-founding family member
    "charter_member",       // Early charter member
    "founding_investor"     // Initial financial contributor
  ]).notNull(),
  
  // Entity association
  entityId: varchar("entityId", { length: 100 }),
  entityName: varchar("entityName", { length: 255 }),
  
  // Benefits
  heirEducationBenefit: boolean("heirEducationBenefit").default(true).notNull(),
  benefitGenerations: int("benefitGenerations").default(3).notNull(), // How many generations get benefits
  
  // Verification
  verificationStatus: mysqlEnum("verificationStatus", [
    "verified",
    "pending",
    "disputed"
  ]).default("verified").notNull(),
  verifiedBy: varchar("verifiedBy", { length: 255 }),
  verifiedAt: timestamp("verifiedAt"),
  
  // Status
  status: mysqlEnum("foundingMemberStatus", [
    "active",
    "deceased",
    "inactive"
  ]).default("active").notNull(),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FoundingMember = typeof foundingMembers.$inferSelect;
export type InsertFoundingMember = typeof foundingMembers.$inferInsert;

/**
 * Heir Education Benefits - Track free Academy access for founding member heirs
 */
export const heirEducationBenefits = mysqlTable("heir_education_benefits", {
  id: int("id").autoincrement().primaryKey(),
  
  // Heir identification
  heirUserId: int("heirUserId"),
  heirHouseId: varchar("heirHouseId", { length: 100 }),
  heirFullName: varchar("heirFullName", { length: 255 }).notNull(),
  
  // Lineage to founding member
  foundingMemberId: int("foundingMemberId").notNull(),
  generationFromFounder: int("generationFromFounder").notNull(), // 1 = child, 2 = grandchild, etc.
  lineagePath: text("lineagePath"), // JSON array of ancestors
  
  // Benefit details
  benefitType: mysqlEnum("benefitType", [
    "full_tuition",         // 100% free
    "partial_tuition",      // Reduced rate
    "materials_only",       // Free materials, pay tuition
    "priority_enrollment"   // Priority but not free
  ]).default("full_tuition").notNull(),
  
  coveragePercentage: int("coveragePercentage").default(100).notNull(),
  
  // Enrollment tracking
  academyEnrollmentId: int("academyEnrollmentId"),
  enrollmentDate: timestamp("enrollmentDate"),
  expectedGraduation: timestamp("expectedGraduation"),
  
  // Value tracking
  tuitionValue: decimal("tuitionValue", { precision: 10, scale: 2 }),
  totalBenefitUsed: decimal("totalBenefitUsed", { precision: 10, scale: 2 }).default("0"),
  
  // Status
  status: mysqlEnum("heirBenefitStatus", [
    "eligible",
    "enrolled",
    "graduated",
    "expired",
    "revoked"
  ]).default("eligible").notNull(),
  
  // Verification
  lineageVerified: boolean("lineageVerified").default(false).notNull(),
  verifiedBy: varchar("verifiedBy", { length: 255 }),
  verifiedAt: timestamp("verifiedAt"),
  
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HeirEducationBenefit = typeof heirEducationBenefits.$inferSelect;
export type InsertHeirEducationBenefit = typeof heirEducationBenefits.$inferInsert;

/**
 * Scholarship Programs - Define available scholarship programs for community
 */
export const scholarshipPrograms = mysqlTable("scholarship_programs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Program details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Type and eligibility
  scholarshipType: mysqlEnum("scholarshipType", [
    "merit_based",          // Academic/achievement based
    "need_based",           // Financial need based
    "community_service",    // Service hours based
    "entrepreneurship",     // Business/innovation based
    "legacy",               // Multi-generational participation
    "diversity",            // Underrepresented groups
    "stem",                 // Science/tech focus
    "arts",                 // Creative arts focus
    "full_ride"             // Complete coverage
  ]).notNull(),
  
  // Coverage
  coverageType: mysqlEnum("coverageType", [
    "full_tuition",
    "partial_tuition",
    "stipend",
    "materials",
    "comprehensive"         // Tuition + materials + stipend
  ]).notNull(),
  
  coverageAmount: decimal("coverageAmount", { precision: 10, scale: 2 }),
  coveragePercentage: int("coveragePercentage"),
  
  // Eligibility criteria
  minAge: int("minAge"),
  maxAge: int("maxAge"),
  minGPA: decimal("minGPA", { precision: 3, scale: 2 }),
  requiredCommunityHours: int("requiredCommunityHours"),
  incomeThreshold: decimal("incomeThreshold", { precision: 10, scale: 2 }),
  eligibilityCriteria: json("eligibilityCriteria"), // Additional JSON criteria
  
  // Application period
  applicationStartDate: timestamp("applicationStartDate"),
  applicationEndDate: timestamp("applicationEndDate"),
  awardDate: timestamp("awardDate"),
  
  // Capacity
  totalSlots: int("totalSlots").default(10).notNull(),
  filledSlots: int("filledSlots").default(0).notNull(),
  waitlistEnabled: boolean("waitlistEnabled").default(true).notNull(),
  
  // Funding
  fundingSource: varchar("fundingSource", { length: 255 }),
  totalBudget: decimal("totalBudget", { precision: 12, scale: 2 }),
  remainingBudget: decimal("remainingBudget", { precision: 12, scale: 2 }),
  
  // Renewal
  renewable: boolean("renewable").default(true).notNull(),
  maxRenewalYears: int("maxRenewalYears").default(4),
  renewalCriteria: text("renewalCriteria"),
  
  // Status
  status: mysqlEnum("scholarshipProgramStatus", [
    "draft",
    "active",
    "closed",
    "suspended",
    "archived"
  ]).default("draft").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ScholarshipProgram = typeof scholarshipPrograms.$inferSelect;
export type InsertScholarshipProgram = typeof scholarshipPrograms.$inferInsert;

/**
 * Scholarship Applications - Track community scholarship applications
 */
export const scholarshipApplications = mysqlTable("scholarship_applications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Applicant info
  applicantUserId: int("applicantUserId"),
  applicantFullName: varchar("applicantFullName", { length: 255 }).notNull(),
  applicantEmail: varchar("applicantEmail", { length: 320 }),
  applicantPhone: varchar("applicantPhone", { length: 20 }),
  applicantAddress: text("applicantAddress"),
  dateOfBirth: timestamp("dateOfBirth"),
  
  // Program applied to
  scholarshipProgramId: int("scholarshipProgramId").notNull(),
  
  // Academic info
  currentEducationLevel: mysqlEnum("currentEducationLevel", [
    "middle_school",
    "high_school",
    "ged_program",
    "community_college",
    "university",
    "graduate_school",
    "academy_enrolled",
    "other"
  ]),
  schoolName: varchar("schoolName", { length: 255 }),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  expectedGraduation: timestamp("expectedGraduation"),
  
  // Financial info (for need-based)
  householdIncome: decimal("householdIncome", { precision: 10, scale: 2 }),
  householdSize: int("householdSize"),
  financialNeedStatement: text("financialNeedStatement"),
  
  // Community service (for service-based)
  communityServiceHours: int("communityServiceHours"),
  communityServiceDescription: text("communityServiceDescription"),
  
  // Essays/statements
  personalStatement: text("personalStatement"),
  goalsStatement: text("goalsStatement"),
  
  // Supporting documents (S3 keys)
  transcriptUrl: varchar("transcriptUrl", { length: 2000 }),
  recommendationLetters: json("recommendationLetters"), // Array of URLs
  additionalDocuments: json("additionalDocuments"),
  
  // Scoring
  academicScore: int("academicScore"),
  needScore: int("needScore"),
  serviceScore: int("serviceScore"),
  essayScore: int("essayScore"),
  totalScore: int("totalScore"),
  
  // Review
  reviewStatus: mysqlEnum("reviewStatus", [
    "submitted",
    "under_review",
    "committee_review",
    "approved",
    "denied",
    "waitlisted",
    "withdrawn"
  ]).default("submitted").notNull(),
  
  reviewedBy: varchar("reviewedBy", { length: 255 }),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  
  // Award
  awardAmount: decimal("awardAmount", { precision: 10, scale: 2 }),
  awardedAt: timestamp("awardedAt"),
  awardLetter: text("awardLetter"),
  
  // Acceptance
  acceptedAt: timestamp("acceptedAt"),
  declinedAt: timestamp("declinedAt"),
  declineReason: text("declineReason"),
  
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ScholarshipApplication = typeof scholarshipApplications.$inferSelect;
export type InsertScholarshipApplication = typeof scholarshipApplications.$inferInsert;

/**
 * Scholarship Fund - Track scholarship fund balances and transactions
 */
export const scholarshipFund = mysqlTable("scholarship_fund", {
  id: int("id").autoincrement().primaryKey(),
  
  // Fund identification
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Fund type
  fundType: mysqlEnum("fundType", [
    "general",              // General scholarship fund
    "endowment",            // Endowed fund (interest only)
    "annual",               // Annual giving fund
    "memorial",             // Named memorial fund
    "corporate",            // Corporate sponsored
    "community"             // Community contributions
  ]).notNull(),
  
  // Balances
  principalBalance: decimal("principalBalance", { precision: 12, scale: 2 }).default("0").notNull(),
  availableBalance: decimal("availableBalance", { precision: 12, scale: 2 }).default("0").notNull(),
  committedBalance: decimal("committedBalance", { precision: 12, scale: 2 }).default("0").notNull(),
  
  // For endowments
  isEndowed: boolean("isEndowed").default(false).notNull(),
  endowmentMinimum: decimal("endowmentMinimum", { precision: 12, scale: 2 }),
  annualSpendingRate: decimal("annualSpendingRate", { precision: 5, scale: 4 }), // e.g., 0.05 for 5%
  
  // Linked programs
  linkedProgramIds: json("linkedProgramIds"), // Array of scholarship program IDs
  
  // Status
  status: mysqlEnum("fundStatus", [
    "active",
    "building",             // Still accumulating to minimum
    "suspended",
    "closed"
  ]).default("active").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ScholarshipFund = typeof scholarshipFund.$inferSelect;
export type InsertScholarshipFund = typeof scholarshipFund.$inferInsert;

/**
 * Scholarship Fund Transactions - Track all fund movements
 */
export const scholarshipFundTransactions = mysqlTable("scholarship_fund_transactions", {
  id: int("id").autoincrement().primaryKey(),
  
  fundId: int("fundId").notNull(),
  
  // Transaction details
  transactionType: mysqlEnum("transactionType", [
    "donation",
    "grant_deposit",
    "interest_earned",
    "award_disbursement",
    "transfer_in",
    "transfer_out",
    "fee",
    "adjustment"
  ]).notNull(),
  
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Related records
  donorName: varchar("donorName", { length: 255 }),
  donorId: int("donorId"),
  applicationId: int("applicationId"),
  programId: int("programId"),
  
  // Details
  description: text("description"),
  referenceNumber: varchar("referenceNumber", { length: 100 }),
  
  // Balance after transaction
  balanceAfter: decimal("balanceAfter", { precision: 12, scale: 2 }),
  
  processedAt: timestamp("processedAt").defaultNow().notNull(),
  processedBy: varchar("processedBy", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ScholarshipFundTransaction = typeof scholarshipFundTransactions.$inferSelect;
export type InsertScholarshipFundTransaction = typeof scholarshipFundTransactions.$inferInsert;


// ============================================================================
// CREATIVE ENTERPRISE & DESIGN DEPARTMENT TABLES
// ============================================================================

/**
 * Creative Artists - profiles for performers and digital creators
 * Supports both Real-Eye-Nation (performance) and L.A.W.S. (design) artists
 */
export const creativeArtists = mysqlTable("creative_artists", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic info
  fullName: varchar("fullName", { length: 255 }).notNull(),
  stageName: varchar("stageName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  
  // Artist type and affiliation
  artistType: mysqlEnum("artistType", [
    "performer",      // Real-Eye-Nation: acting, music, dance, spoken word
    "producer",       // Real-Eye-Nation: recording, filming, editing
    "designer",       // L.A.W.S.: digital design, branding
    "animator",       // L.A.W.S.: 3D, motion graphics
    "hybrid"          // Both divisions
  ]).notNull(),
  primaryEntity: mysqlEnum("primaryEntity", ["real_eye_nation", "laws_collective", "both"]).default("real_eye_nation").notNull(),
  
  // Specializations (JSON array)
  specializations: json("specializations"), // e.g., ["acting", "voice_over", "dance"]
  
  // Family/House connection (optional)
  familyMemberId: int("familyMemberId"),
  houseId: varchar("houseId", { length: 50 }),
  
  // Specialist Track connection (for entry-level)
  specialistTrackId: int("specialistTrackId"),
  
  // Status and level
  status: mysqlEnum("status", ["applicant", "trainee", "active", "senior", "master", "emeritus", "inactive"]).default("applicant").notNull(),
  experienceLevel: mysqlEnum("experienceLevel", ["entry", "intermediate", "advanced", "expert", "master"]).default("entry").notNull(),
  
  // Business fundamentals completion (anti-starving-artist)
  businessFundamentalsCompleted: boolean("businessFundamentalsCompleted").default(false).notNull(),
  financialLiteracyCompleted: boolean("financialLiteracyCompleted").default(false).notNull(),
  ipLicensingTrainingCompleted: boolean("ipLicensingTrainingCompleted").default(false).notNull(),
  
  // Portfolio
  portfolioUrl: text("portfolioUrl"),
  demoReelUrl: text("demoReelUrl"),
  bio: text("bio"),
  
  // Contract details
  contractType: mysqlEnum("contractType", ["employee", "contractor", "freelance", "intern"]).default("contractor").notNull(),
  minimumGuarantee: decimal("minimumGuarantee", { precision: 10, scale: 2 }),
  revenueSharePercentage: decimal("revenueSharePercentage", { precision: 5, scale: 2 }).default("70.00"), // Artist gets 70% by default
  
  // Token economy
  tokenBalance: int("tokenBalance").default(0).notNull(),
  lifetimeTokensEarned: int("lifetimeTokensEarned").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CreativeArtist = typeof creativeArtists.$inferSelect;
export type InsertCreativeArtist = typeof creativeArtists.$inferInsert;

/**
 * Creative Productions - content and IP tracking
 * Tracks all creative works for royalty and licensing management
 */
export const creativeProductions = mysqlTable("creative_productions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Production info
  title: varchar("title", { length: 255 }).notNull(),
  productionType: mysqlEnum("productionType", [
    // Performance (Real-Eye-Nation)
    "film", "video", "music_track", "album", "podcast", "live_performance",
    "theater_production", "dance_piece", "spoken_word", "documentary",
    // Design (L.A.W.S.)
    "graphic_design", "brand_identity", "ui_ux_design", "3d_model",
    "animation", "motion_graphics", "nft", "digital_art", "illustration",
    // Hybrid
    "music_video", "promotional_content", "educational_content"
  ]).notNull(),
  
  // Entity ownership
  owningEntity: mysqlEnum("owningEntity", ["real_eye_nation", "laws_collective", "joint"]).notNull(),
  
  // Description and metadata
  description: text("description"),
  genre: varchar("genre", { length: 100 }),
  duration: int("duration"), // in seconds for time-based media
  releaseDate: timestamp("releaseDate"),
  
  // IP and licensing
  ipOwnership: mysqlEnum("ipOwnership", [
    "artist_full",        // Artist owns 100%
    "company_full",       // Company owns 100%
    "shared_majority_artist",  // Artist owns majority
    "shared_majority_company", // Company owns majority
    "work_for_hire"       // Company owns, artist paid flat fee
  ]).default("shared_majority_artist").notNull(),
  
  copyrightRegistered: boolean("copyrightRegistered").default(false).notNull(),
  copyrightNumber: varchar("copyrightNumber", { length: 100 }),
  
  // Licensing availability
  licensingAvailable: boolean("licensingAvailable").default(true).notNull(),
  licensingTypes: json("licensingTypes"), // e.g., ["sync", "commercial", "educational"]
  
  // Status
  status: mysqlEnum("status", ["in_development", "in_production", "post_production", "completed", "released", "archived"]).default("in_development").notNull(),
  
  // Financial
  productionBudget: decimal("productionBudget", { precision: 12, scale: 2 }),
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0.00"),
  totalRoyaltiesPaid: decimal("totalRoyaltiesPaid", { precision: 12, scale: 2 }).default("0.00"),
  
  // Files and assets
  primaryAssetUrl: text("primaryAssetUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CreativeProduction = typeof creativeProductions.$inferSelect;
export type InsertCreativeProduction = typeof creativeProductions.$inferInsert;

/**
 * Production Credits - links artists to productions with their roles
 */
export const productionCredits = mysqlTable("production_credits", {
  id: int("id").autoincrement().primaryKey(),
  
  productionId: int("productionId").notNull(),
  artistId: int("artistId").notNull(),
  
  // Role in production
  role: varchar("role", { length: 255 }).notNull(), // e.g., "Lead Actor", "Director", "Graphic Designer"
  creditType: mysqlEnum("creditType", [
    "creator", "performer", "producer", "director", "writer",
    "designer", "animator", "editor", "composer", "featured"
  ]).notNull(),
  
  // Revenue share for this specific production
  revenueSharePercentage: decimal("revenueSharePercentage", { precision: 5, scale: 2 }),
  
  // Payment details
  flatFee: decimal("flatFee", { precision: 10, scale: 2 }),
  flatFeePaid: boolean("flatFeePaid").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ProductionCredit = typeof productionCredits.$inferSelect;
export type InsertProductionCredit = typeof productionCredits.$inferInsert;

/**
 * Artist Revenue Streams - tracks all income sources for artists
 */
export const artistRevenueStreams = mysqlTable("artist_revenue_streams", {
  id: int("id").autoincrement().primaryKey(),
  
  artistId: int("artistId").notNull(),
  
  // Revenue type
  revenueType: mysqlEnum("revenueType", [
    "royalty",           // Ongoing royalties from productions
    "performance_fee",   // Live performance payment
    "teaching_fee",      // Academy instruction
    "commission",        // Design/art commission
    "licensing_fee",     // IP licensing income
    "merchandise",       // Merch sales
    "streaming",         // Streaming royalties
    "sync_license",      // Music/video sync licensing
    "nft_sale",          // NFT primary sale
    "nft_royalty",       // NFT secondary sale royalty
    "grant",             // Grant funding
    "sponsorship"        // Sponsorship income
  ]).notNull(),
  
  // Related records
  productionId: int("productionId"),
  bookingId: int("bookingId"),
  
  // Amount
  grossAmount: decimal("grossAmount", { precision: 12, scale: 2 }).notNull(),
  companyShare: decimal("companyShare", { precision: 12, scale: 2 }).notNull(),
  artistShare: decimal("artistShare", { precision: 12, scale: 2 }).notNull(),
  
  // Payment status
  status: mysqlEnum("status", ["pending", "approved", "paid", "disputed"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  paymentReference: varchar("paymentReference", { length: 255 }),
  
  // Description
  description: text("description"),
  periodStart: timestamp("periodStart"),
  periodEnd: timestamp("periodEnd"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ArtistRevenueStream = typeof artistRevenueStreams.$inferSelect;
export type InsertArtistRevenueStream = typeof artistRevenueStreams.$inferInsert;

/**
 * Design Projects - tracks design work for L.A.W.S. Design Department
 */
export const designProjects = mysqlTable("design_projects", {
  id: int("id").autoincrement().primaryKey(),
  
  // Project info
  projectName: varchar("projectName", { length: 255 }).notNull(),
  projectType: mysqlEnum("projectType", [
    "brand_identity",
    "logo_design",
    "marketing_materials",
    "ui_ux_design",
    "web_design",
    "app_design",
    "3d_modeling",
    "animation",
    "motion_graphics",
    "video_editing",
    "photo_editing",
    "illustration",
    "infographic",
    "presentation",
    "packaging",
    "merchandise_design",
    "nft_collection",
    "ai_assisted_design"
  ]).notNull(),
  
  // Client (internal entity or external)
  clientType: mysqlEnum("clientType", ["internal", "external"]).default("internal").notNull(),
  clientEntityId: int("clientEntityId"), // If internal, which entity
  clientName: varchar("clientName", { length: 255 }), // If external
  
  // Assigned designer(s)
  leadDesignerId: int("leadDesignerId"),
  
  // Project details
  description: text("description"),
  requirements: text("requirements"),
  deliverables: json("deliverables"), // List of expected deliverables
  
  // Timeline
  startDate: timestamp("startDate"),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  
  // Status
  status: mysqlEnum("status", ["briefing", "in_progress", "review", "revision", "approved", "delivered", "archived"]).default("briefing").notNull(),
  
  // Budget and billing
  projectBudget: decimal("projectBudget", { precision: 10, scale: 2 }),
  billingType: mysqlEnum("billingType", ["fixed", "hourly", "internal"]).default("internal").notNull(),
  hourlyRate: decimal("hourlyRate", { precision: 8, scale: 2 }),
  hoursLogged: decimal("hoursLogged", { precision: 8, scale: 2 }).default("0.00"),
  totalBilled: decimal("totalBilled", { precision: 10, scale: 2 }).default("0.00"),
  
  // AI tools used
  aiToolsUsed: json("aiToolsUsed"), // e.g., ["midjourney", "dalle", "stable_diffusion"]
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DesignProject = typeof designProjects.$inferSelect;
export type InsertDesignProject = typeof designProjects.$inferInsert;

/**
 * Design Assets - digital asset management for design department
 */
export const designAssets = mysqlTable("design_assets", {
  id: int("id").autoincrement().primaryKey(),
  
  // Asset info
  assetName: varchar("assetName", { length: 255 }).notNull(),
  assetType: mysqlEnum("assetType", [
    "logo", "icon", "illustration", "photo", "video", "animation",
    "3d_model", "font", "color_palette", "template", "mockup",
    "source_file", "export", "nft"
  ]).notNull(),
  
  // Related records
  projectId: int("projectId"),
  productionId: int("productionId"),
  creatorId: int("creatorId"), // Artist who created it
  
  // File details
  fileUrl: text("fileUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  fileFormat: varchar("fileFormat", { length: 50 }),
  fileSizeBytes: int("fileSizeBytes"),
  dimensions: varchar("dimensions", { length: 50 }), // e.g., "1920x1080"
  
  // Metadata
  description: text("description"),
  tags: json("tags"), // Search tags
  colorPalette: json("colorPalette"), // Extracted colors
  
  // Licensing
  licenseType: mysqlEnum("licenseType", [
    "internal_only",
    "client_exclusive",
    "royalty_free",
    "rights_managed",
    "creative_commons",
    "nft_owned"
  ]).default("internal_only").notNull(),
  
  // NFT details (if applicable)
  isNft: boolean("isNft").default(false).notNull(),
  nftContractAddress: varchar("nftContractAddress", { length: 255 }),
  nftTokenId: varchar("nftTokenId", { length: 100 }),
  nftChain: varchar("nftChain", { length: 50 }),
  
  // Version control
  version: int("version").default(1).notNull(),
  parentAssetId: int("parentAssetId"), // For versioning
  
  status: mysqlEnum("status", ["draft", "review", "approved", "archived"]).default("draft").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DesignAsset = typeof designAssets.$inferSelect;
export type InsertDesignAsset = typeof designAssets.$inferInsert;

/**
 * Creative Bookings - performance and project scheduling
 */
export const creativeBookings = mysqlTable("creative_bookings", {
  id: int("id").autoincrement().primaryKey(),
  
  // Booking type
  bookingType: mysqlEnum("bookingType", [
    "live_performance",
    "recording_session",
    "photo_shoot",
    "video_shoot",
    "workshop",
    "teaching",
    "consultation",
    "design_session",
    "event_appearance"
  ]).notNull(),
  
  // Artist(s) booked
  primaryArtistId: int("primaryArtistId").notNull(),
  additionalArtists: json("additionalArtists"), // Array of artist IDs
  
  // Event details
  eventName: varchar("eventName", { length: 255 }).notNull(),
  eventDescription: text("eventDescription"),
  
  // Location
  locationType: mysqlEnum("locationType", ["in_person", "virtual", "hybrid"]).default("in_person").notNull(),
  venue: varchar("venue", { length: 255 }),
  address: text("address"),
  virtualLink: text("virtualLink"),
  
  // Timing
  startDateTime: timestamp("startDateTime").notNull(),
  endDateTime: timestamp("endDateTime").notNull(),
  setupTime: int("setupTime"), // Minutes before start
  
  // Client/requester
  clientType: mysqlEnum("clientType", ["internal", "external"]).default("internal").notNull(),
  clientEntityId: int("clientEntityId"),
  clientName: varchar("clientName", { length: 255 }),
  clientContact: varchar("clientContact", { length: 255 }),
  
  // Financial
  bookingFee: decimal("bookingFee", { precision: 10, scale: 2 }),
  depositAmount: decimal("depositAmount", { precision: 10, scale: 2 }),
  depositPaid: boolean("depositPaid").default(false).notNull(),
  finalPaymentPaid: boolean("finalPaymentPaid").default(false).notNull(),
  
  // Status
  status: mysqlEnum("status", ["inquiry", "pending", "confirmed", "in_progress", "completed", "cancelled"]).default("inquiry").notNull(),
  
  // Requirements
  technicalRequirements: text("technicalRequirements"),
  specialRequests: text("specialRequests"),
  
  // Related production (if any)
  productionId: int("productionId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CreativeBooking = typeof creativeBookings.$inferSelect;
export type InsertCreativeBooking = typeof creativeBookings.$inferInsert;

/**
 * Creative Training Programs - curriculum for artist development
 */
export const creativeTrainingPrograms = mysqlTable("creative_training_programs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Program info
  programName: varchar("programName", { length: 255 }).notNull(),
  programType: mysqlEnum("programType", [
    // Performance tracks
    "acting", "voice_acting", "music_performance", "music_production",
    "dance", "spoken_word", "theater", "film_production",
    // Design tracks
    "graphic_design", "ui_ux", "3d_animation", "motion_graphics",
    "brand_development", "digital_art", "nft_creation",
    // Business tracks (required)
    "business_fundamentals", "financial_literacy", "ip_licensing",
    "marketing_self", "contract_negotiation"
  ]).notNull(),
  
  // Entity
  owningEntity: mysqlEnum("owningEntity", ["real_eye_nation", "laws_collective", "academy"]).notNull(),
  
  // Description
  description: text("description"),
  learningObjectives: json("learningObjectives"),
  
  // Requirements
  prerequisitePrograms: json("prerequisitePrograms"), // Array of program IDs
  isBusinessFundamental: boolean("isBusinessFundamental").default(false).notNull(), // Required before specialization
  
  // Duration
  durationWeeks: int("durationWeeks"),
  hoursPerWeek: int("hoursPerWeek"),
  
  // Modules
  modules: json("modules"), // Array of module objects
  
  // Completion requirements
  completionRequirements: json("completionRequirements"),
  certificateAwarded: boolean("certificateAwarded").default(true).notNull(),
  
  // Token rewards
  completionTokenReward: int("completionTokenReward").default(100).notNull(),
  
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CreativeTrainingProgram = typeof creativeTrainingPrograms.$inferSelect;
export type InsertCreativeTrainingProgram = typeof creativeTrainingPrograms.$inferInsert;

/**
 * Artist Training Progress - tracks artist completion of training programs
 */
export const artistTrainingProgress = mysqlTable("artist_training_progress", {
  id: int("id").autoincrement().primaryKey(),
  
  artistId: int("artistId").notNull(),
  programId: int("programId").notNull(),
  
  // Progress
  status: mysqlEnum("status", ["enrolled", "in_progress", "completed", "dropped"]).default("enrolled").notNull(),
  progressPercentage: int("progressPercentage").default(0).notNull(),
  
  // Module completion (JSON object tracking each module)
  moduleProgress: json("moduleProgress"),
  
  // Dates
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  
  // Assessment
  finalScore: int("finalScore"),
  certificateIssued: boolean("certificateIssued").default(false).notNull(),
  certificateUrl: text("certificateUrl"),
  
  // Tokens awarded
  tokensAwarded: int("tokensAwarded").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ArtistTrainingProgress = typeof artistTrainingProgress.$inferSelect;
export type InsertArtistTrainingProgress = typeof artistTrainingProgress.$inferInsert;


// ==========================================
// SOFTWARE LICENSE MANAGEMENT
// ==========================================

/**
 * Software license categories for organizing licenses by department/function
 */
export const softwareLicenseCategories = mysqlTable("software_license_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  department: varchar("department", { length: 100 }), // Creative Enterprise, Design, Executive, etc.
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SoftwareLicenseCategory = typeof softwareLicenseCategories.$inferSelect;

/**
 * Software licenses tracking
 */
export const softwareLicenses = mysqlTable("software_licenses", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId"),
  name: varchar("name", { length: 200 }).notNull(),
  vendor: varchar("vendor", { length: 100 }).notNull(),
  version: varchar("version", { length: 50 }),
  licenseType: mysqlEnum("licenseType", ["subscription", "perpetual", "floating", "site", "open_source"]).default("subscription").notNull(),
  licenseKey: text("licenseKey"),
  totalSeats: int("totalSeats").default(1).notNull(),
  usedSeats: int("usedSeats").default(0).notNull(),
  costPerSeat: decimal("costPerSeat", { precision: 10, scale: 2 }),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "annual", "one_time"]).default("annual").notNull(),
  purchaseDate: timestamp("purchaseDate"),
  renewalDate: timestamp("renewalDate"),
  expirationDate: timestamp("expirationDate"),
  status: mysqlEnum("status", ["active", "expired", "cancelled", "pending"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SoftwareLicense = typeof softwareLicenses.$inferSelect;

/**
 * License assignments to users/departments
 */
export const softwareLicenseAssignments = mysqlTable("software_license_assignments", {
  id: int("id").autoincrement().primaryKey(),
  licenseId: int("licenseId").notNull(),
  assignedTo: varchar("assignedTo", { length: 200 }).notNull(), // User name or department
  assignedType: mysqlEnum("assignedType", ["user", "department", "role"]).default("user").notNull(),
  assignedDate: timestamp("assignedDate").defaultNow().notNull(),
  revokedDate: timestamp("revokedDate"),
  status: mysqlEnum("status", ["active", "revoked"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SoftwareLicenseAssignment = typeof softwareLicenseAssignments.$inferSelect;

/**
 * Vendor contracts and support agreements
 */
export const softwareVendorContracts = mysqlTable("software_vendor_contracts", {
  id: int("id").autoincrement().primaryKey(),
  vendorName: varchar("vendorName", { length: 100 }).notNull(),
  contractType: mysqlEnum("contractType", ["enterprise", "volume", "support", "maintenance"]).default("enterprise").notNull(),
  contractNumber: varchar("contractNumber", { length: 100 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  annualValue: decimal("annualValue", { precision: 10, scale: 2 }),
  supportLevel: mysqlEnum("supportLevel", ["basic", "standard", "premium", "enterprise"]).default("standard").notNull(),
  contactName: varchar("contactName", { length: 100 }),
  contactEmail: varchar("contactEmail", { length: 200 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["active", "expired", "pending_renewal"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SoftwareVendorContract = typeof softwareVendorContracts.$inferSelect;

// ==========================================
// ONLINE ACADEMY INFRASTRUCTURE
// ==========================================

/**
 * Online academy course catalog (extends existing academyCourses with online-specific fields)
 */
export const onlineCourseDetails = mysqlTable("online_course_details", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(), // Links to existing academyCourses
  code: varchar("code", { length: 20 }).notNull(),
  category: mysqlEnum("category", [
    "financial_sovereignty", "laws_framework", "governance_civics", 
    "entrepreneurship", "creative_enterprise", "core_academic",
    "professional_development", "simulator_training"
  ]).notNull(),
  gradeLevel: mysqlEnum("gradeLevel", [
    "k_2", "3_5", "6_8", "9_12", "adult", "all_ages"
  ]).default("all_ages").notNull(),
  courseType: mysqlEnum("courseType", ["proprietary", "licensed", "oer", "partnership"]).default("proprietary").notNull(),
  deliveryMethod: mysqlEnum("deliveryMethod", ["asynchronous", "synchronous", "hybrid", "self_paced"]).default("asynchronous").notNull(),
  creditHours: decimal("creditHours", { precision: 4, scale: 2 }),
  duration: varchar("duration", { length: 50 }), // e.g., "8 weeks", "1 semester"
  syllabus: text("syllabus"),
  lmsUrl: text("lmsUrl"), // Link to course in LMS
  approvedBy: int("approvedBy"), // Cornelius approval
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OnlineCourseDetail = typeof onlineCourseDetails.$inferSelect;

/**
 * Curriculum development projects (external contractor work)
 */
export const curriculumProjects = mysqlTable("curriculum_projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  projectType: mysqlEnum("projectType", [
    "course_development", "assessment_design", "instructor_guide",
    "accreditation_docs", "lms_setup", "full_curriculum"
  ]).notNull(),
  scope: text("scope"),
  deliverables: json("deliverables"),
  contractorId: int("contractorId"), // Link to contractor
  contractorName: varchar("contractorName", { length: 200 }),
  contractorCompany: varchar("contractorCompany", { length: 200 }),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  amountPaid: decimal("amountPaid", { precision: 10, scale: 2 }).default("0"),
  startDate: timestamp("startDate"),
  targetEndDate: timestamp("targetEndDate"),
  actualEndDate: timestamp("actualEndDate"),
  status: mysqlEnum("status", ["planning", "contracted", "in_progress", "review", "completed", "cancelled"]).default("planning").notNull(),
  grantFunded: boolean("grantFunded").default(false).notNull(),
  grantId: int("grantId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CurriculumProject = typeof curriculumProjects.$inferSelect;

/**
 * Contracted online instructors
 */
export const academyInstructors = mysqlTable("academy_instructors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  instructorType: mysqlEnum("instructorType", ["credentialed", "sme_guest", "adjunct", "full_time"]).default("adjunct").notNull(),
  credentials: json("credentials"), // Array of credential objects
  specializations: json("specializations"),
  hourlyRate: decimal("hourlyRate", { precision: 8, scale: 2 }),
  contractStatus: mysqlEnum("contractStatus", ["active", "inactive", "pending"]).default("pending").notNull(),
  supervisorId: int("supervisorId"), // Cornelius for most
  backgroundCheckDate: timestamp("backgroundCheckDate"),
  backgroundCheckStatus: mysqlEnum("backgroundCheckStatus", ["pending", "cleared", "expired"]).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AcademyInstructor = typeof academyInstructors.$inferSelect;

/**
 * SME (Subject Matter Expert) contributors from founding members
 */
export const smeContributors = mysqlTable("sme_contributors", {
  id: int("id").autoincrement().primaryKey(),
  familyMemberId: int("familyMemberId"),
  name: varchar("name", { length: 200 }).notNull(),
  expertise: json("expertise"), // Array of expertise areas
  entityAffiliation: varchar("entityAffiliation", { length: 100 }), // Which entity they primarily work for
  contributionTypes: json("contributionTypes"), // guest_lecture, content_review, case_study, etc.
  availability: mysqlEnum("availability", ["available", "limited", "unavailable"]).default("available").notNull(),
  totalContributions: int("totalContributions").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SmeContributor = typeof smeContributors.$inferSelect;

/**
 * Physical facility planning (future phase)
 */
export const facilityPlans = mysqlTable("facility_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  facilityType: mysqlEnum("facilityType", ["education_center", "training_facility", "mixed_use", "satellite"]).default("education_center").notNull(),
  description: text("description"),
  plannedCapacity: int("plannedCapacity"),
  estimatedCost: decimal("estimatedCost", { precision: 12, scale: 2 }),
  landRequirements: text("landRequirements"),
  buildingRequirements: json("buildingRequirements"),
  status: mysqlEnum("status", ["concept", "planning", "land_search", "land_acquired", "design", "construction", "operational"]).default("concept").notNull(),
  targetOpenDate: timestamp("targetOpenDate"),
  linkedLandAcquisitionId: int("linkedLandAcquisitionId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FacilityPlan = typeof facilityPlans.$inferSelect;

/**
 * Accreditation tracking
 */
export const accreditationRecords = mysqlTable("accreditation_records", {
  id: int("id").autoincrement().primaryKey(),
  accreditingBody: varchar("accreditingBody", { length: 200 }).notNull(),
  accreditationType: mysqlEnum("accreditationType", ["regional", "national", "programmatic", "state"]).notNull(),
  status: mysqlEnum("status", ["researching", "applying", "pending", "accredited", "probation", "revoked"]).default("researching").notNull(),
  applicationDate: timestamp("applicationDate"),
  grantedDate: timestamp("grantedDate"),
  expirationDate: timestamp("expirationDate"),
  renewalDate: timestamp("renewalDate"),
  requirements: json("requirements"),
  documentsSubmitted: json("documentsSubmitted"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AccreditationRecord = typeof accreditationRecords.$inferSelect;

// Software License Management Tables

// Game Center Tables
export const gameCenterGames = mysqlTable("game_center_games", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  gameType: mysqlEnum("gameType", ["strategy", "puzzle", "word", "card", "board", "trivia", "mystery", "educational"]).notNull(),
  ageGroup: mysqlEnum("ageGroup", ["k_5", "6_8", "9_12", "adult", "all_ages"]).default("all_ages").notNull(),
  minPlayers: int("minPlayers").default(1).notNull(),
  maxPlayers: int("maxPlayers").default(2).notNull(),
  estimatedDuration: varchar("estimatedDuration", { length: 50 }),
  skillsTargeted: json("skillsTargeted"),
  tokenRewardBase: int("tokenRewardBase").default(10),
  isActive: boolean("isActive").default(true).notNull(),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const gameMatches = mysqlTable("game_matches", {
  id: int("id").primaryKey().autoincrement(),
  gameId: int("gameId").notNull(),
  matchType: mysqlEnum("matchType", ["solo", "vs_ai", "vs_player", "tournament"]).default("solo").notNull(),
  status: mysqlEnum("status", ["waiting", "in_progress", "completed", "abandoned"]).default("waiting").notNull(),
  player1Id: int("player1Id"),
  player2Id: int("player2Id"),
  winnerId: int("winnerId"),
  player1Score: int("player1Score").default(0),
  player2Score: int("player2Score").default(0),
  gameState: json("gameState"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  tokensAwarded: int("tokensAwarded").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const gameTournaments = mysqlTable("game_tournaments", {
  id: int("id").primaryKey().autoincrement(),
  gameId: int("gameId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  tournamentType: mysqlEnum("tournamentType", ["single_elimination", "double_elimination", "round_robin", "swiss"]).default("single_elimination").notNull(),
  ageGroup: mysqlEnum("ageGroup", ["k_5", "6_8", "9_12", "adult", "all_ages", "family"]).default("all_ages").notNull(),
  maxParticipants: int("maxParticipants").default(16),
  currentParticipants: int("currentParticipants").default(0),
  entryFee: int("entryFee").default(0),
  prizePool: int("prizePool").default(0),
  status: mysqlEnum("status", ["registration", "in_progress", "completed", "cancelled"]).default("registration").notNull(),
  bracketData: json("bracketData"),
  registrationDeadline: timestamp("registrationDeadline"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const gamePlayerStats = mysqlTable("game_player_stats", {
  id: int("id").primaryKey().autoincrement(),
  playerId: int("playerId").notNull(),
  gameId: int("gameId").notNull(),
  gamesPlayed: int("gamesPlayed").default(0).notNull(),
  gamesWon: int("gamesWon").default(0).notNull(),
  gamesLost: int("gamesLost").default(0).notNull(),
  gamesTied: int("gamesTied").default(0).notNull(),
  totalScore: bigint("totalScore", { mode: "number" }).default(0).notNull(),
  highScore: int("highScore").default(0),
  currentStreak: int("currentStreak").default(0),
  bestStreak: int("bestStreak").default(0),
  rating: int("rating").default(1000),
  tokensEarned: int("tokensEarned").default(0),
  lastPlayedAt: timestamp("lastPlayedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const gameAchievements = mysqlTable("game_achievements", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  gameId: int("gameId"),
  achievementType: mysqlEnum("achievementType", ["milestone", "streak", "skill", "tournament", "special"]).notNull(),
  requirement: json("requirement"),
  tokenReward: int("tokenReward").default(0),
  badgeIcon: varchar("badgeIcon", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const gamePlayerAchievements = mysqlTable("game_player_achievements", {
  id: int("id").primaryKey().autoincrement(),
  playerId: int("playerId").notNull(),
  achievementId: int("achievementId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  tokensAwarded: int("tokensAwarded").default(0),
});

export const triviaCategories = mysqlTable("trivia_categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const triviaQuestions = mysqlTable("trivia_questions", {
  id: int("id").primaryKey().autoincrement(),
  categoryId: int("categoryId").notNull(),
  question: text("question").notNull(),
  correctAnswer: text("correctAnswer").notNull(),
  wrongAnswers: json("wrongAnswers").notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  ageGroup: mysqlEnum("ageGroup", ["k_5", "6_8", "9_12", "adult", "all_ages"]).default("all_ages").notNull(),
  explanation: text("explanation"),
  source: varchar("source", { length: 200 }),
  timesAsked: int("timesAsked").default(0),
  timesCorrect: int("timesCorrect").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});


/**
 * Purchase Requests - Tiered approval workflow for department spending
 * Approval Thresholds:
 * - Under $1,000: Auto-approve (Manager → Procurement → Finance, CEO gets monthly report)
 * - $1,000-$5,000: CEO approval required
 * - Over $5,000: Board notification required
 */
export const purchaseRequests = mysqlTable("purchase_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestNumber: varchar("requestNumber", { length: 50 }).notNull().unique(),
  requesterId: int("requesterId").notNull(), // User who submitted the request
  departmentId: int("departmentId").notNull(),
  
  // Request details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", [
    "software", 
    "equipment", 
    "supplies", 
    "professional_development", 
    "travel", 
    "contractor", 
    "subscription",
    "other"
  ]).notNull(),
  vendor: varchar("vendor", { length: 255 }),
  
  // Financial details
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  budgetCode: varchar("budgetCode", { length: 50 }),
  fiscalYear: varchar("fiscalYear", { length: 10 }),
  
  // Approval tier (auto-calculated based on amount)
  approvalTier: mysqlEnum("approvalTier", ["tier1", "tier2", "tier3"]).notNull(),
  // tier1: Under $1,000 - auto-approve
  // tier2: $1,000-$5,000 - CEO approval
  // tier3: Over $5,000 - Board notification
  
  // Status tracking
  status: mysqlEnum("status", [
    "draft",
    "pending_manager",
    "pending_procurement", 
    "pending_finance",
    "pending_ceo",
    "pending_board_notification",
    "approved",
    "rejected",
    "cancelled"
  ]).default("draft").notNull(),
  
  // Approval chain tracking
  managerApproval: mysqlEnum("managerApproval", ["pending", "approved", "rejected"]).default("pending"),
  managerApprovedBy: int("managerApprovedBy"),
  managerApprovedAt: timestamp("managerApprovedAt"),
  managerNotes: text("managerNotes"),
  
  procurementApproval: mysqlEnum("procurementApproval", ["pending", "approved", "rejected"]).default("pending"),
  procurementApprovedBy: int("procurementApprovedBy"),
  procurementApprovedAt: timestamp("procurementApprovedAt"),
  procurementNotes: text("procurementNotes"),
  
  financeApproval: mysqlEnum("financeApproval", ["pending", "approved", "rejected"]).default("pending"),
  financeApprovedBy: int("financeApprovedBy"),
  financeApprovedAt: timestamp("financeApprovedAt"),
  financeNotes: text("financeNotes"),
  
  ceoApproval: mysqlEnum("ceoApproval", ["not_required", "pending", "approved", "rejected"]).default("not_required"),
  ceoApprovedBy: int("ceoApprovedBy"),
  ceoApprovedAt: timestamp("ceoApprovedAt"),
  ceoNotes: text("ceoNotes"),
  
  boardNotified: boolean("boardNotified").default(false),
  boardNotifiedAt: timestamp("boardNotifiedAt"),
  
  // Attachments and supporting docs
  attachments: json("attachments"), // Array of file URLs
  
  // Timestamps
  submittedAt: timestamp("submittedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseRequest = typeof purchaseRequests.$inferSelect;
export type InsertPurchaseRequest = typeof purchaseRequests.$inferInsert;

/**
 * Purchase Request Comments - Audit trail for request discussions
 */
export const purchaseRequestComments = mysqlTable("purchase_request_comments", {
  id: int("id").autoincrement().primaryKey(),
  purchaseRequestId: int("purchaseRequestId").notNull(),
  userId: int("userId").notNull(),
  comment: text("comment").notNull(),
  isInternal: boolean("isInternal").default(false), // Internal notes vs visible to requester
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PurchaseRequestComment = typeof purchaseRequestComments.$inferSelect;
export type InsertPurchaseRequestComment = typeof purchaseRequestComments.$inferInsert;


/**
 * Department Simulator Progress - Track user progress through department training simulators
 */
export const departmentSimulatorProgress = mysqlTable("department_simulator_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  simulatorId: varchar("simulatorId", { length: 50 }).notNull(), // e.g., "finance", "hr", "legal"
  moduleId: int("moduleId").notNull(), // Which module (0-5)
  questionsAnswered: int("questionsAnswered").default(0).notNull(),
  correctAnswers: int("correctAnswers").default(0).notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  tokensEarned: int("tokensEarned").default(0).notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DepartmentSimulatorProgress = typeof departmentSimulatorProgress.$inferSelect;
export type InsertDepartmentSimulatorProgress = typeof departmentSimulatorProgress.$inferInsert;

/**
 * User Token Balance - Track total tokens earned across all simulators
 */
export const userTokenBalance = mysqlTable("user_token_balance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalTokens: int("totalTokens").default(0).notNull(),
  lifetimeTokensEarned: int("lifetimeTokensEarned").default(0).notNull(),
  tokensSpent: int("tokensSpent").default(0).notNull(),
  lastEarnedAt: timestamp("lastEarnedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserTokenBalance = typeof userTokenBalance.$inferSelect;
export type InsertUserTokenBalance = typeof userTokenBalance.$inferInsert;

/**
 * Token Transactions - Log all token earning and spending events
 */
export const tokenTransactionLog = mysqlTable("token_transaction_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // Positive for earned, negative for spent
  transactionType: mysqlEnum("transactionType", ["earned", "spent", "bonus", "adjustment"]).notNull(),
  source: varchar("source", { length: 100 }).notNull(), // e.g., "finance_simulator_module_1"
  description: text("description"),
  balanceAfter: int("balanceAfter").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenTransactionLog = typeof tokenTransactionLog.$inferSelect;
export type InsertTokenTransactionLog = typeof tokenTransactionLog.$inferInsert;

/**
 * Simulator Certificates - Certificates issued upon completing all modules in a simulator
 */
export const simulatorCertificates = mysqlTable("simulator_certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  simulatorId: varchar("simulatorId", { length: 50 }).notNull(),
  simulatorName: varchar("simulatorName", { length: 255 }).notNull(),
  totalModulesCompleted: int("totalModulesCompleted").notNull(),
  totalTokensEarned: int("totalTokensEarned").notNull(),
  averageScore: decimal("averageScore", { precision: 5, scale: 2 }).notNull(),
  certificateHash: varchar("certificateHash", { length: 64 }).notNull().unique(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  verificationUrl: text("verificationUrl"),
});

export type SimulatorCertificate = typeof simulatorCertificates.$inferSelect;
export type InsertSimulatorCertificate = typeof simulatorCertificates.$inferInsert;


// ==========================================
// TIMEKEEPING & CHARGE CODE SYSTEM
// ==========================================

/**
 * Funding Sources - Track different funding streams (grants, contracts, internal)
 */
export const fundingSources = mysqlTable("funding_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(), // e.g., "GRANT-2024-001"
  type: mysqlEnum("type", ["grant", "contract", "internal", "donation", "revenue"]).notNull(),
  description: text("description"),
  funderName: varchar("funderName", { length: 255 }),
  totalBudget: decimal("totalBudget", { precision: 15, scale: 2 }),
  laborBudget: decimal("laborBudget", { precision: 15, scale: 2 }), // Budget allocated for labor
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["active", "pending", "closed", "expired"]).default("active").notNull(),
  requiresTimeTracking: boolean("requiresTimeTracking").default(true).notNull(),
  reportingFrequency: mysqlEnum("reportingFrequency", ["weekly", "biweekly", "monthly", "quarterly", "annually"]).default("monthly"),
  entityId: int("entityId"), // Which business entity this funding is for
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundingSource = typeof fundingSources.$inferSelect;
export type InsertFundingSource = typeof fundingSources.$inferInsert;

/**
 * Charge Codes - Billable codes tied to funding sources and projects
 */
export const chargeCodes = mysqlTable("charge_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // e.g., "PROJ-001-LABOR"
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  fundingSourceId: int("fundingSourceId"), // Links to funding source
  projectId: int("projectId"), // Links to project if applicable
  departmentId: int("departmentId"), // Which department owns this code
  entityId: int("entityId"), // Which business entity
  budgetedHours: decimal("budgetedHours", { precision: 10, scale: 2 }), // Total hours budgeted
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }), // Default billing rate
  isActive: boolean("isActive").default(true).notNull(),
  isBillable: boolean("isBillable").default(true).notNull(),
  requiresApproval: boolean("requiresApproval").default(true).notNull(),
  allowOvertime: boolean("allowOvertime").default(false).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChargeCode = typeof chargeCodes.$inferSelect;
export type InsertChargeCode = typeof chargeCodes.$inferInsert;

/**
 * Workers - Unified table for both employees and contractors who track time
 */
export const timekeepingWorkers = mysqlTable("timekeeping_workers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Links to users table if they have system access
  employeeId: int("employeeId"), // Links to employees table if W-2
  contractorId: int("contractorId"), // Links to contractor record if 1099
  workerType: mysqlEnum("workerType", ["employee", "contractor", "volunteer"]).notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  departmentId: int("departmentId"),
  entityId: int("entityId"), // Primary entity they work for
  supervisorId: int("supervisorId"), // Who approves their timesheets
  defaultChargeCodeId: int("defaultChargeCodeId"), // Default charge code
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }), // For contractors
  standardHoursPerWeek: decimal("standardHoursPerWeek", { precision: 5, scale: 2 }).default("40.00"),
  overtimeEligible: boolean("overtimeEligible").default(true),
  status: mysqlEnum("status", ["active", "inactive", "terminated"]).default("active").notNull(),
  hireDate: timestamp("hireDate"),
  terminationDate: timestamp("terminationDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimekeepingWorker = typeof timekeepingWorkers.$inferSelect;
export type InsertTimekeepingWorker = typeof timekeepingWorkers.$inferInsert;

/**
 * Worker Charge Code Assignments - Which charge codes a worker can bill to
 */
export const workerChargeCodeAssignments = mysqlTable("worker_charge_code_assignments", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").notNull(),
  chargeCodeId: int("chargeCodeId").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  assignedBy: int("assignedBy"),
  maxHoursPerWeek: decimal("maxHoursPerWeek", { precision: 5, scale: 2 }), // Optional limit
  effectiveFrom: timestamp("effectiveFrom"),
  effectiveTo: timestamp("effectiveTo"),
  isActive: boolean("isActive").default(true).notNull(),
});

export type WorkerChargeCodeAssignment = typeof workerChargeCodeAssignments.$inferSelect;
export type InsertWorkerChargeCodeAssignment = typeof workerChargeCodeAssignments.$inferInsert;

/**
 * Time Entries - Individual time records
 */
export const timeEntries = mysqlTable("time_entries", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").notNull(),
  chargeCodeId: int("chargeCodeId").notNull(),
  timesheetId: int("timesheetId"), // Links to parent timesheet
  entryDate: timestamp("entryDate").notNull(), // The date the work was performed
  hoursWorked: decimal("hoursWorked", { precision: 5, scale: 2 }).notNull(),
  overtimeHours: decimal("overtimeHours", { precision: 5, scale: 2 }).default("0.00"),
  description: text("description"), // What work was done
  taskReference: varchar("taskReference", { length: 100 }), // Optional task/ticket reference
  projectId: int("projectId"), // Optional project link
  isBillable: boolean("isBillable").default(true).notNull(),
  billingRate: decimal("billingRate", { precision: 10, scale: 2 }), // Rate at time of entry
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "invoiced"]).default("draft").notNull(),
  rejectionReason: text("rejectionReason"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  clockInTime: timestamp("clockInTime"), // Optional clock in/out
  clockOutTime: timestamp("clockOutTime"),
  breakMinutes: int("breakMinutes").default(0),
  location: varchar("location", { length: 255 }), // Where work was performed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;

/**
 * Timesheets - Weekly/bi-weekly time submission
 */
export const timesheets = mysqlTable("timesheets", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  periodType: mysqlEnum("periodType", ["weekly", "biweekly", "semimonthly", "monthly"]).default("biweekly").notNull(),
  totalRegularHours: decimal("totalRegularHours", { precision: 6, scale: 2 }).default("0.00"),
  totalOvertimeHours: decimal("totalOvertimeHours", { precision: 6, scale: 2 }).default("0.00"),
  totalBillableHours: decimal("totalBillableHours", { precision: 6, scale: 2 }).default("0.00"),
  totalNonBillableHours: decimal("totalNonBillableHours", { precision: 6, scale: 2 }).default("0.00"),
  status: mysqlEnum("status", ["draft", "submitted", "pending_approval", "approved", "rejected", "processed"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  submittedBy: int("submittedBy"), // Usually the worker, but could be admin
  workerSignature: text("workerSignature"), // Electronic signature
  workerSignedAt: timestamp("workerSignedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Timesheet = typeof timesheets.$inferSelect;
export type InsertTimesheet = typeof timesheets.$inferInsert;

/**
 * Timesheet Approvals - Multi-level approval workflow
 */
export const timesheetApprovals = mysqlTable("timesheet_approvals", {
  id: int("id").autoincrement().primaryKey(),
  timesheetId: int("timesheetId").notNull(),
  approverId: int("approverId").notNull(), // User who approved/rejected
  approverRole: mysqlEnum("approverRole", ["supervisor", "department_head", "finance", "admin"]).notNull(),
  approvalLevel: int("approvalLevel").default(1).notNull(), // For multi-level approval
  action: mysqlEnum("action", ["approved", "rejected", "returned_for_revision"]).notNull(),
  comments: text("comments"),
  approverSignature: text("approverSignature"),
  actionAt: timestamp("actionAt").defaultNow().notNull(),
});

export type TimesheetApproval = typeof timesheetApprovals.$inferSelect;
export type InsertTimesheetApproval = typeof timesheetApprovals.$inferInsert;

/**
 * Charge Code Budgets - Track budget consumption by period
 */
export const chargeCodeBudgets = mysqlTable("charge_code_budgets", {
  id: int("id").autoincrement().primaryKey(),
  chargeCodeId: int("chargeCodeId").notNull(),
  fiscalYear: int("fiscalYear").notNull(),
  fiscalPeriod: int("fiscalPeriod"), // Month or quarter
  budgetedHours: decimal("budgetedHours", { precision: 10, scale: 2 }).notNull(),
  budgetedAmount: decimal("budgetedAmount", { precision: 15, scale: 2 }).notNull(),
  actualHours: decimal("actualHours", { precision: 10, scale: 2 }).default("0.00"),
  actualAmount: decimal("actualAmount", { precision: 15, scale: 2 }).default("0.00"),
  variance: decimal("variance", { precision: 15, scale: 2 }).default("0.00"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type ChargeCodeBudget = typeof chargeCodeBudgets.$inferSelect;
export type InsertChargeCodeBudget = typeof chargeCodeBudgets.$inferInsert;

/**
 * Time Off Requests - PTO, sick leave, etc.
 */
export const timeOffRequests = mysqlTable("time_off_requests", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").notNull(),
  requestType: mysqlEnum("requestType", ["pto", "sick", "personal", "bereavement", "jury_duty", "military", "unpaid", "other"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  totalHours: decimal("totalHours", { precision: 6, scale: 2 }).notNull(),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimeOffRequest = typeof timeOffRequests.$inferSelect;
export type InsertTimeOffRequest = typeof timeOffRequests.$inferInsert;

/**
 * Contractor Invoices - Link time entries to contractor invoices
 */
export const contractorInvoices = mysqlTable("contractor_invoices", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").notNull(), // Contractor
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  totalHours: decimal("totalHours", { precision: 8, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "under_review", "approved", "paid", "disputed"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  paidAt: timestamp("paidAt"),
  paymentReference: varchar("paymentReference", { length: 100 }),
  notes: text("notes"),
  attachmentUrl: text("attachmentUrl"), // Uploaded invoice document
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContractorInvoice = typeof contractorInvoices.$inferSelect;
export type InsertContractorInvoice = typeof contractorInvoices.$inferInsert;

/**
 * Invoice Line Items - Break down invoice by charge code
 */
export const invoiceLineItems = mysqlTable("invoice_line_items", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  chargeCodeId: int("chargeCodeId").notNull(),
  description: text("description"),
  hours: decimal("hours", { precision: 6, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
});

export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = typeof invoiceLineItems.$inferInsert;


// ============================================
// PROPERTY MANAGEMENT SYSTEM
// Comprehensive property tracking with project management
// ============================================

/**
 * Properties - Core property records
 */
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  houseId: int("houseId"), // Link to House for ownership tracking
  entityId: int("entityId"), // Business entity that owns the property
  
  // Property identification
  propertyName: varchar("propertyName", { length: 255 }).notNull(),
  propertyCode: varchar("propertyCode", { length: 50 }), // Internal reference code
  
  // Address
  streetAddress: varchar("streetAddress", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zipCode", { length: 20 }).notNull(),
  county: varchar("county", { length: 100 }),
  country: varchar("country", { length: 100 }).default("USA"),
  
  // Property details
  propertyType: mysqlEnum("propertyType", [
    "single_family", "multi_family", "condo", "townhouse", 
    "commercial", "industrial", "land", "mixed_use", "other"
  ]).notNull(),
  propertySubType: varchar("propertySubType", { length: 100 }),
  yearBuilt: int("yearBuilt"),
  squareFootage: int("squareFootage"),
  lotSize: decimal("lotSize", { precision: 10, scale: 2 }), // acres
  bedrooms: int("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  stories: int("stories"),
  garageSpaces: int("garageSpaces"),
  
  // Status and classification
  status: mysqlEnum("status", [
    "active", "vacant", "under_renovation", "for_sale", 
    "for_rent", "pending_acquisition", "sold", "archived"
  ]).default("active").notNull(),
  occupancyStatus: mysqlEnum("occupancyStatus", [
    "owner_occupied", "tenant_occupied", "vacant", "under_construction"
  ]).default("vacant"),
  
  // Financial info
  purchasePrice: decimal("purchasePrice", { precision: 15, scale: 2 }),
  purchaseDate: timestamp("purchaseDate"),
  currentValue: decimal("currentValue", { precision: 15, scale: 2 }),
  lastValuationDate: timestamp("lastValuationDate"),
  
  // Mortgage/financing
  hasMortgage: boolean("hasMortgage").default(false),
  mortgageBalance: decimal("mortgageBalance", { precision: 15, scale: 2 }),
  mortgagePayment: decimal("mortgagePayment", { precision: 10, scale: 2 }),
  mortgageLender: varchar("mortgageLender", { length: 255 }),
  mortgageInterestRate: decimal("mortgageInterestRate", { precision: 5, scale: 3 }),
  mortgageMaturityDate: timestamp("mortgageMaturityDate"),
  
  // Insurance
  insuranceProvider: varchar("insuranceProvider", { length: 255 }),
  insurancePolicyNumber: varchar("insurancePolicyNumber", { length: 100 }),
  insurancePremium: decimal("insurancePremium", { precision: 10, scale: 2 }),
  insuranceRenewalDate: timestamp("insuranceRenewalDate"),
  
  // Tax info
  parcelNumber: varchar("parcelNumber", { length: 100 }),
  annualPropertyTax: decimal("annualPropertyTax", { precision: 10, scale: 2 }),
  taxAssessedValue: decimal("taxAssessedValue", { precision: 15, scale: 2 }),
  
  // Legal
  deedType: varchar("deedType", { length: 100 }),
  titleCompany: varchar("titleCompany", { length: 255 }),
  zoningClassification: varchar("zoningClassification", { length: 100 }),
  
  // Additional info
  description: text("description"),
  notes: text("notes"),
  tags: json("tags"), // Array of tags for categorization
  
  // Photos
  primaryPhotoUrl: text("primaryPhotoUrl"),
  photoUrls: json("photoUrls"), // Array of photo URLs
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

/**
 * Property Projects - Renovations, improvements, maintenance projects
 */
export const propertyProjects = mysqlTable("property_projects", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  
  // Project identification
  projectName: varchar("projectName", { length: 255 }).notNull(),
  projectCode: varchar("projectCode", { length: 50 }),
  projectType: mysqlEnum("projectType", [
    "renovation", "repair", "maintenance", "improvement",
    "addition", "landscaping", "inspection", "compliance", "other"
  ]).notNull(),
  
  // Description
  description: text("description"),
  scope: text("scope"),
  objectives: text("objectives"),
  
  // Status
  status: mysqlEnum("status", [
    "planning", "approved", "in_progress", "on_hold",
    "completed", "cancelled"
  ]).default("planning").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // Timeline
  plannedStartDate: timestamp("plannedStartDate"),
  plannedEndDate: timestamp("plannedEndDate"),
  actualStartDate: timestamp("actualStartDate"),
  actualEndDate: timestamp("actualEndDate"),
  
  // Budget
  estimatedBudget: decimal("estimatedBudget", { precision: 15, scale: 2 }),
  approvedBudget: decimal("approvedBudget", { precision: 15, scale: 2 }),
  actualCost: decimal("actualCost", { precision: 15, scale: 2 }).default("0"),
  contingencyAmount: decimal("contingencyAmount", { precision: 15, scale: 2 }),
  
  // Progress
  percentComplete: int("percentComplete").default(0),
  
  // Contractor info
  primaryContractorId: int("primaryContractorId"),
  contractorName: varchar("contractorName", { length: 255 }),
  contractorContact: varchar("contractorContact", { length: 255 }),
  contractNumber: varchar("contractNumber", { length: 100 }),
  
  // Permits
  requiresPermit: boolean("requiresPermit").default(false),
  permitNumber: varchar("permitNumber", { length: 100 }),
  permitStatus: mysqlEnum("permitStatus", [
    "not_required", "pending", "approved", "denied", "expired"
  ]).default("not_required"),
  permitDate: timestamp("permitDate"),
  
  // Approval
  approvedBy: int("approvedBy"),
  approvalDate: timestamp("approvalDate"),
  
  // Grant/funding linkage
  grantId: int("grantId"), // Link to grant if funded by grant
  fundingSourceId: int("fundingSourceId"),
  chargeCodeId: int("chargeCodeId"),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyProject = typeof propertyProjects.$inferSelect;
export type InsertPropertyProject = typeof propertyProjects.$inferInsert;

/**
 * Project Milestones - Key milestones within projects
 */
export const propertyProjectMilestones = mysqlTable("property_project_milestones", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  milestoneName: varchar("milestoneName", { length: 255 }).notNull(),
  description: text("description"),
  
  // Timeline
  targetDate: timestamp("targetDate"),
  completedDate: timestamp("completedDate"),
  
  // Status
  status: mysqlEnum("status", [
    "pending", "in_progress", "completed", "delayed", "cancelled"
  ]).default("pending").notNull(),
  
  // Dependencies
  dependsOnMilestoneId: int("dependsOnMilestoneId"),
  
  // Deliverables
  deliverables: text("deliverables"),
  
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyProjectMilestone = typeof propertyProjectMilestones.$inferSelect;
export type InsertPropertyProjectMilestone = typeof propertyProjectMilestones.$inferInsert;

/**
 * Project Tasks - Individual tasks within projects
 */
export const propertyProjectTasks = mysqlTable("property_project_tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  milestoneId: int("milestoneId"),
  parentTaskId: int("parentTaskId"), // For subtasks
  
  taskName: varchar("taskName", { length: 255 }).notNull(),
  description: text("description"),
  
  // Assignment
  assignedToId: int("assignedToId"),
  assignedToName: varchar("assignedToName", { length: 255 }),
  
  // Timeline
  startDate: timestamp("startDate"),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  estimatedHours: decimal("estimatedHours", { precision: 8, scale: 2 }),
  actualHours: decimal("actualHours", { precision: 8, scale: 2 }),
  
  // Status
  status: mysqlEnum("status", [
    "not_started", "in_progress", "blocked", "completed", "cancelled"
  ]).default("not_started").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  
  // Cost
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 2 }),
  actualCost: decimal("actualCost", { precision: 10, scale: 2 }),
  
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyProjectTask = typeof propertyProjectTasks.$inferSelect;
export type InsertPropertyProjectTask = typeof propertyProjectTasks.$inferInsert;

/**
 * Project Expenses - Track all expenses for projects
 */
export const propertyProjectExpenses = mysqlTable("property_project_expenses", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  taskId: int("taskId"),
  
  // Expense details
  expenseDate: timestamp("expenseDate").notNull(),
  category: mysqlEnum("category", [
    "labor", "materials", "equipment", "permits", "inspection",
    "subcontractor", "supplies", "travel", "other"
  ]).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  
  // Vendor
  vendorName: varchar("vendorName", { length: 255 }),
  vendorId: int("vendorId"),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  
  // Amount
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }),
  totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }).notNull(),
  
  // Payment
  paymentStatus: mysqlEnum("paymentStatus", [
    "pending", "approved", "paid", "rejected"
  ]).default("pending"),
  paymentDate: timestamp("paymentDate"),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  checkNumber: varchar("checkNumber", { length: 50 }),
  
  // Approval
  approvedBy: int("approvedBy"),
  approvalDate: timestamp("approvalDate"),
  
  // Receipts
  receiptUrl: text("receiptUrl"),
  attachmentUrls: json("attachmentUrls"),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyProjectExpense = typeof propertyProjectExpenses.$inferSelect;
export type InsertPropertyProjectExpense = typeof propertyProjectExpenses.$inferInsert;

/**
 * Property Financials - Monthly/recurring financial tracking
 */
export const propertyFinancials = mysqlTable("property_financials", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  
  // Period
  year: int("year").notNull(),
  month: int("month").notNull(),
  
  // Income
  rentalIncome: decimal("rentalIncome", { precision: 15, scale: 2 }).default("0"),
  otherIncome: decimal("otherIncome", { precision: 15, scale: 2 }).default("0"),
  totalIncome: decimal("totalIncome", { precision: 15, scale: 2 }).default("0"),
  
  // Expenses
  mortgagePayment: decimal("mortgagePayment", { precision: 10, scale: 2 }).default("0"),
  propertyTax: decimal("propertyTax", { precision: 10, scale: 2 }).default("0"),
  insurance: decimal("insurance", { precision: 10, scale: 2 }).default("0"),
  utilities: decimal("utilities", { precision: 10, scale: 2 }).default("0"),
  maintenance: decimal("maintenance", { precision: 10, scale: 2 }).default("0"),
  repairs: decimal("repairs", { precision: 10, scale: 2 }).default("0"),
  managementFees: decimal("managementFees", { precision: 10, scale: 2 }).default("0"),
  hoaFees: decimal("hoaFees", { precision: 10, scale: 2 }).default("0"),
  landscaping: decimal("landscaping", { precision: 10, scale: 2 }).default("0"),
  otherExpenses: decimal("otherExpenses", { precision: 10, scale: 2 }).default("0"),
  totalExpenses: decimal("totalExpenses", { precision: 15, scale: 2 }).default("0"),
  
  // Net
  netOperatingIncome: decimal("netOperatingIncome", { precision: 15, scale: 2 }).default("0"),
  cashFlow: decimal("cashFlow", { precision: 15, scale: 2 }).default("0"),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyFinancial = typeof propertyFinancials.$inferSelect;
export type InsertPropertyFinancial = typeof propertyFinancials.$inferInsert;

/**
 * Property Documents - Document storage for properties
 */
export const propertyDocuments = mysqlTable("property_documents", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  projectId: int("projectId"), // Optional link to project
  
  // Document info
  documentName: varchar("documentName", { length: 255 }).notNull(),
  documentType: mysqlEnum("documentType", [
    "deed", "title", "survey", "appraisal", "inspection",
    "insurance", "tax", "lease", "contract", "permit",
    "photo", "floor_plan", "receipt", "invoice", "other"
  ]).notNull(),
  description: text("description"),
  
  // File
  fileUrl: text("fileUrl").notNull(),
  fileName: varchar("fileName", { length: 255 }),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  
  // Dates
  documentDate: timestamp("documentDate"),
  expirationDate: timestamp("expirationDate"),
  
  // Metadata
  tags: json("tags"),
  isConfidential: boolean("isConfidential").default(false),
  
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyDocument = typeof propertyDocuments.$inferSelect;
export type InsertPropertyDocument = typeof propertyDocuments.$inferInsert;

/**
 * Property Tenants - Tenant/occupant tracking
 */
export const propertyTenants = mysqlTable("property_tenants", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  
  // Tenant info
  tenantType: mysqlEnum("tenantType", ["individual", "family", "business"]).default("individual"),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  businessName: varchar("businessName", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  
  // Lease info
  leaseStartDate: timestamp("leaseStartDate"),
  leaseEndDate: timestamp("leaseEndDate"),
  monthlyRent: decimal("monthlyRent", { precision: 10, scale: 2 }),
  securityDeposit: decimal("securityDeposit", { precision: 10, scale: 2 }),
  leaseType: mysqlEnum("leaseType", ["month_to_month", "annual", "multi_year"]).default("annual"),
  
  // Status
  status: mysqlEnum("status", [
    "active", "pending", "past", "evicted"
  ]).default("active").notNull(),
  
  // Move dates
  moveInDate: timestamp("moveInDate"),
  moveOutDate: timestamp("moveOutDate"),
  
  // Emergency contact
  emergencyContactName: varchar("emergencyContactName", { length: 255 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 50 }),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyTenant = typeof propertyTenants.$inferSelect;
export type InsertPropertyTenant = typeof propertyTenants.$inferInsert;

/**
 * Property Inspections - Inspection tracking
 */
export const propertyInspections = mysqlTable("property_inspections", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  projectId: int("projectId"),
  
  // Inspection info
  inspectionType: mysqlEnum("inspectionType", [
    "move_in", "move_out", "annual", "quarterly",
    "maintenance", "safety", "code_compliance", "appraisal", "other"
  ]).notNull(),
  inspectionDate: timestamp("inspectionDate").notNull(),
  
  // Inspector
  inspectorName: varchar("inspectorName", { length: 255 }),
  inspectorCompany: varchar("inspectorCompany", { length: 255 }),
  inspectorLicense: varchar("inspectorLicense", { length: 100 }),
  
  // Results
  overallCondition: mysqlEnum("overallCondition", [
    "excellent", "good", "fair", "poor", "critical"
  ]),
  passedInspection: boolean("passedInspection"),
  
  // Findings
  findings: text("findings"),
  recommendations: text("recommendations"),
  requiredRepairs: text("requiredRepairs"),
  estimatedRepairCost: decimal("estimatedRepairCost", { precision: 15, scale: 2 }),
  
  // Follow-up
  followUpRequired: boolean("followUpRequired").default(false),
  followUpDate: timestamp("followUpDate"),
  followUpNotes: text("followUpNotes"),
  
  // Report
  reportUrl: text("reportUrl"),
  photoUrls: json("photoUrls"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyInspection = typeof propertyInspections.$inferSelect;
export type InsertPropertyInspection = typeof propertyInspections.$inferInsert;

/**
 * Property Maintenance Log - Track all maintenance activities
 */
export const propertyMaintenanceLogs = mysqlTable("property_maintenance_logs", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  projectId: int("projectId"),
  inspectionId: int("inspectionId"),
  
  // Maintenance info
  maintenanceType: mysqlEnum("maintenanceType", [
    "preventive", "corrective", "emergency", "routine", "upgrade"
  ]).notNull(),
  category: mysqlEnum("category", [
    "plumbing", "electrical", "hvac", "roofing", "flooring",
    "appliances", "exterior", "interior", "landscaping",
    "pest_control", "cleaning", "safety", "other"
  ]).notNull(),
  
  // Description
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Dates
  reportedDate: timestamp("reportedDate").notNull(),
  scheduledDate: timestamp("scheduledDate"),
  completedDate: timestamp("completedDate"),
  
  // Status
  status: mysqlEnum("status", [
    "reported", "scheduled", "in_progress", "completed", "cancelled"
  ]).default("reported").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "emergency"]).default("medium"),
  
  // Service provider
  serviceProviderName: varchar("serviceProviderName", { length: 255 }),
  serviceProviderPhone: varchar("serviceProviderPhone", { length: 50 }),
  
  // Cost
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 2 }),
  actualCost: decimal("actualCost", { precision: 10, scale: 2 }),
  
  // Resolution
  resolution: text("resolution"),
  partsReplaced: text("partsReplaced"),
  warrantyInfo: text("warrantyInfo"),
  
  // Photos
  beforePhotoUrls: json("beforePhotoUrls"),
  afterPhotoUrls: json("afterPhotoUrls"),
  
  reportedBy: varchar("reportedBy", { length: 255 }),
  completedBy: varchar("completedBy", { length: 255 }),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyMaintenanceLog = typeof propertyMaintenanceLogs.$inferSelect;
export type InsertPropertyMaintenanceLog = typeof propertyMaintenanceLogs.$inferInsert;

/**
 * Property Vendors - Track vendors/contractors for properties
 */
export const propertyVendors = mysqlTable("property_vendors", {
  id: int("id").autoincrement().primaryKey(),
  
  // Vendor info
  vendorName: varchar("vendorName", { length: 255 }).notNull(),
  vendorType: mysqlEnum("vendorType", [
    "contractor", "plumber", "electrician", "hvac", "landscaper",
    "cleaner", "property_manager", "inspector", "appraiser",
    "insurance", "legal", "other"
  ]).notNull(),
  
  // Contact
  contactName: varchar("contactName", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  
  // Address
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zipCode", { length: 20 }),
  
  // Business info
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  insuranceInfo: text("insuranceInfo"),
  taxId: varchar("taxId", { length: 50 }),
  
  // Rating
  rating: int("rating"), // 1-5
  
  // Status
  status: mysqlEnum("status", ["active", "inactive", "blacklisted"]).default("active"),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyVendor = typeof propertyVendors.$inferSelect;
export type InsertPropertyVendor = typeof propertyVendors.$inferInsert;

/**
 * Property Utilities - Track utility accounts
 */
export const propertyUtilities = mysqlTable("property_utilities", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  
  // Utility info
  utilityType: mysqlEnum("utilityType", [
    "electric", "gas", "water", "sewer", "trash",
    "internet", "cable", "phone", "solar", "other"
  ]).notNull(),
  providerName: varchar("providerName", { length: 255 }).notNull(),
  accountNumber: varchar("accountNumber", { length: 100 }),
  
  // Contact
  providerPhone: varchar("providerPhone", { length: 50 }),
  providerWebsite: varchar("providerWebsite", { length: 255 }),
  
  // Billing
  billingDay: int("billingDay"),
  averageMonthlyBill: decimal("averageMonthlyBill", { precision: 10, scale: 2 }),
  
  // Responsibility
  paidBy: mysqlEnum("paidBy", ["owner", "tenant", "split"]).default("owner"),
  
  // Status
  status: mysqlEnum("status", ["active", "inactive", "transferred"]).default("active"),
  
  // Meter info
  meterNumber: varchar("meterNumber", { length: 100 }),
  meterLocation: varchar("meterLocation", { length: 255 }),
  
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyUtility = typeof propertyUtilities.$inferSelect;
export type InsertPropertyUtility = typeof propertyUtilities.$inferInsert;


// ==========================================
// Electronic Signature System
// ==========================================

/**
 * Electronic Signatures - captures legally binding e-signatures
 */
export const electronicSignatures = mysqlTable("electronic_signatures", {
  id: int("id").autoincrement().primaryKey(),
  signerId: int("signer_id").notNull(),
  signerName: varchar("signer_name", { length: 255 }).notNull(),
  signerEmail: varchar("signer_email", { length: 255 }),
  documentType: varchar("document_type", { length: 100 }).notNull(),
  documentId: int("document_id").notNull(),
  documentTitle: varchar("document_title", { length: 500 }),
  signatureData: text("signature_data").notNull(),
  signatureHash: varchar("signature_hash", { length: 64 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
  verificationCode: varchar("verification_code", { length: 32 }).notNull(),
  isVerified: boolean("is_verified").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  requiresReAcknowledgment: boolean("requires_re_acknowledgment").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ElectronicSignature = typeof electronicSignatures.$inferSelect;
export type InsertElectronicSignature = typeof electronicSignatures.$inferInsert;

/**
 * Signature Audit Log - tracks all signature-related actions
 */
export const signatureAuditLog = mysqlTable("signature_audit_log", {
  id: int("id").autoincrement().primaryKey(),
  signatureId: int("signature_id").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  actionBy: int("action_by"),
  actionDetails: text("action_details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SignatureAuditLog = typeof signatureAuditLog.$inferSelect;
export type InsertSignatureAuditLog = typeof signatureAuditLog.$inferInsert;


// ============================================
// SYSTEM SCHEDULED JOBS
// ============================================

/**
 * System Job Executions - Persistent history of scheduled job runs
 */
export const systemJobExecutions = mysqlTable("system_job_executions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Job identification
  jobName: varchar("job_name", { length: 100 }).notNull(),
  jobType: mysqlEnum("job_type", [
    "signature_expiration_notifications",
    "daily_summary_report",
    "weekly_compliance_audit",
    "monthly_data_cleanup",
    "custom"
  ]).notNull(),
  
  // Execution timing
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  durationMs: int("duration_ms"),
  
  // Status
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running").notNull(),
  
  // Results
  result: json("result"), // Detailed execution results
  errorMessage: text("error_message"),
  errorStack: text("error_stack"),
  
  // Metrics
  itemsProcessed: int("items_processed").default(0),
  itemsSucceeded: int("items_succeeded").default(0),
  itemsFailed: int("items_failed").default(0),
  
  // Trigger info
  triggeredBy: mysqlEnum("triggered_by", ["scheduled", "manual", "api"]).default("scheduled").notNull(),
  triggeredByUserId: int("triggered_by_user_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SystemJobExecution = typeof systemJobExecutions.$inferSelect;
export type InsertSystemJobExecution = typeof systemJobExecutions.$inferInsert;

/**
 * System Job Configurations - Store job schedules and settings
 */
export const systemJobConfigurations = mysqlTable("system_job_configurations", {
  id: int("id").autoincrement().primaryKey(),
  
  jobName: varchar("job_name", { length: 100 }).notNull().unique(),
  description: text("description"),
  
  // Schedule (cron expression)
  cronSchedule: varchar("cron_schedule", { length: 50 }).notNull(),
  timezone: varchar("timezone", { length: 50 }).default("America/Chicago").notNull(),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  
  // Last execution info
  lastRunAt: timestamp("last_run_at"),
  lastRunStatus: mysqlEnum("last_run_status", ["completed", "failed"]),
  nextScheduledRun: timestamp("next_scheduled_run"),
  
  // Notification settings
  notifyOnSuccess: boolean("notify_on_success").default(false).notNull(),
  notifyOnFailure: boolean("notify_on_failure").default(true).notNull(),
  notificationRecipients: json("notification_recipients").$type<string[]>(),
  
  // Retry settings
  maxRetries: int("max_retries").default(3).notNull(),
  retryDelaySeconds: int("retry_delay_seconds").default(300).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SystemJobConfiguration = typeof systemJobConfigurations.$inferSelect;
export type InsertSystemJobConfiguration = typeof systemJobConfigurations.$inferInsert;

// ============================================
// VIDEO MEETINGS & CHAT SYSTEM
// ============================================

/**
 * Meetings - Video conference scheduling and management
 * Supports Daily.co integration with future Microsoft Teams compatibility
 */
export const meetings = mysqlTable("meetings", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  hostId: int("hostId").notNull(),
  
  // Scheduling
  scheduledAt: timestamp("scheduledAt").notNull(),
  duration: int("duration").default(60).notNull(), // minutes
  timezone: varchar("timezone", { length: 50 }).default("America/New_York"),
  
  // Meeting status
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled").notNull(),
  
  // Video provider integration
  provider: mysqlEnum("provider", ["daily", "teams", "custom"]).default("daily").notNull(),
  roomUrl: text("roomUrl"), // Daily.co room URL or Teams meeting link
  roomName: varchar("roomName", { length: 255 }), // Daily.co room name
  providerMeetingId: varchar("providerMeetingId", { length: 255 }), // External meeting ID
  
  // Meeting settings
  isRecorded: boolean("isRecorded").default(false),
  recordingUrl: text("recordingUrl"),
  waitingRoomEnabled: boolean("waitingRoomEnabled").default(false),
  maxParticipants: int("maxParticipants").default(100),
  
  // Recurrence (for recurring meetings)
  isRecurring: boolean("isRecurring").default(false),
  recurrenceRule: varchar("recurrenceRule", { length: 255 }), // iCal RRULE format
  parentMeetingId: int("parentMeetingId"), // For recurring instances
  
  // Metadata
  metadata: json("metadata"), // Additional provider-specific data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
});

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = typeof meetings.$inferInsert;

/**
 * Meeting Participants - Track who is invited/joined meetings
 */
export const meetingParticipants = mysqlTable("meeting_participants", {
  id: int("id").autoincrement().primaryKey(),
  meetingId: int("meetingId").notNull(),
  userId: int("userId"), // Null for external guests
  
  // Guest info (for non-users)
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestName: varchar("guestName", { length: 255 }),
  
  // Role and status
  role: mysqlEnum("role", ["host", "co_host", "presenter", "attendee"]).default("attendee").notNull(),
  inviteStatus: mysqlEnum("inviteStatus", ["pending", "accepted", "declined", "tentative"]).default("pending").notNull(),
  
  // Attendance tracking
  joinedAt: timestamp("joinedAt"),
  leftAt: timestamp("leftAt"),
  totalDuration: int("totalDuration"), // seconds in meeting
  
  // Permissions
  canShareScreen: boolean("canShareScreen").default(true),
  canUnmute: boolean("canUnmute").default(true),
  canChat: boolean("canChat").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MeetingParticipant = typeof meetingParticipants.$inferSelect;
export type InsertMeetingParticipant = typeof meetingParticipants.$inferInsert;

/**
 * Chats - Direct messages and group conversations
 */
export const chats = mysqlTable("chats", {
  id: int("id").autoincrement().primaryKey(),
  
  // Chat type
  chatType: mysqlEnum("chatType", ["direct", "group", "channel", "meeting"]).default("direct").notNull(),
  
  // For group chats
  name: varchar("name", { length: 255 }),
  description: text("description"),
  avatarUrl: text("avatarUrl"),
  
  // Associated meeting (for meeting chats)
  meetingId: int("meetingId"),
  
  // Settings
  isArchived: boolean("isArchived").default(false),
  isPinned: boolean("isPinned").default(false),
  
  // Creator
  createdById: int("createdById").notNull(),
  
  // Last activity for sorting
  lastMessageAt: timestamp("lastMessageAt"),
  lastMessagePreview: varchar("lastMessagePreview", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;

/**
 * Chat Participants - Members of a chat
 */
export const chatParticipants = mysqlTable("chat_participants", {
  id: int("id").autoincrement().primaryKey(),
  chatId: int("chatId").notNull(),
  userId: int("userId").notNull(),
  
  // Role in chat
  role: mysqlEnum("role", ["owner", "admin", "member"]).default("member").notNull(),
  
  // User preferences for this chat
  isMuted: boolean("isMuted").default(false),
  isPinned: boolean("isPinned").default(false),
  
  // Read tracking
  lastReadAt: timestamp("lastReadAt"),
  lastReadMessageId: int("lastReadMessageId"),
  unreadCount: int("unreadCount").default(0),
  
  // Notification settings
  notificationLevel: mysqlEnum("notificationLevel", ["all", "mentions", "none"]).default("all"),
  
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  leftAt: timestamp("leftAt"),
});

export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = typeof chatParticipants.$inferInsert;

/**
 * Chat Messages - Individual messages in chats
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  chatId: int("chatId").notNull(),
  senderId: int("senderId").notNull(),
  
  // Message content
  content: text("content").notNull(),
  contentType: mysqlEnum("contentType", ["text", "html", "markdown", "system"]).default("text").notNull(),
  
  // Reply threading
  replyToId: int("replyToId"), // Parent message for threads
  threadId: int("threadId"), // Root message of thread
  
  // Attachments
  hasAttachments: boolean("hasAttachments").default(false),
  
  // Message status
  isEdited: boolean("isEdited").default(false),
  editedAt: timestamp("editedAt"),
  isDeleted: boolean("isDeleted").default(false),
  deletedAt: timestamp("deletedAt"),
  
  // Mentions
  mentions: json("mentions"), // Array of user IDs mentioned
  
  // Reactions (stored as JSON for flexibility)
  reactions: json("reactions"), // { emoji: [userId, userId], ... }
  
  // Metadata
  metadata: json("metadata"), // For rich content (links, embeds, etc.)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Chat Attachments - Files attached to messages
 */
export const chatAttachments = mysqlTable("chat_attachments", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  chatId: int("chatId").notNull(),
  uploaderId: int("uploaderId").notNull(),
  
  // File info
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(), // bytes
  mimeType: varchar("mimeType", { length: 100 }),
  
  // Storage
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  storageUrl: text("storageUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatAttachment = typeof chatAttachments.$inferSelect;
export type InsertChatAttachment = typeof chatAttachments.$inferInsert;

/**
 * User Presence - Online/offline status tracking
 */
export const userPresence = mysqlTable("user_presence", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Status
  status: mysqlEnum("status", ["online", "away", "busy", "offline"]).default("offline").notNull(),
  statusMessage: varchar("statusMessage", { length: 255 }),
  
  // Activity tracking
  lastActiveAt: timestamp("lastActiveAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  
  // Current activity
  currentActivity: mysqlEnum("currentActivity", ["none", "in_meeting", "presenting", "typing"]).default("none"),
  currentMeetingId: int("currentMeetingId"),
  currentChatId: int("currentChatId"),
  
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPresence = typeof userPresence.$inferSelect;
export type InsertUserPresence = typeof userPresence.$inferInsert;

/**
 * Meeting Chat Integration - Link meetings to their chat rooms
 * Allows chat to persist after meeting ends
 */
export const meetingChats = mysqlTable("meeting_chats", {
  id: int("id").autoincrement().primaryKey(),
  meetingId: int("meetingId").notNull(),
  chatId: int("chatId").notNull(),
  
  // Settings
  persistAfterMeeting: boolean("persistAfterMeeting").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MeetingChat = typeof meetingChats.$inferSelect;
export type InsertMeetingChat = typeof meetingChats.$inferInsert;

/**
 * Video Provider Configurations - Store API keys and settings for video providers
 * Prepared for future Microsoft Teams integration
 */
export const videoProviderConfigs = mysqlTable("video_provider_configs", {
  id: int("id").autoincrement().primaryKey(),
  
  provider: mysqlEnum("provider", ["daily", "teams", "zoom", "custom"]).notNull().unique(),
  isEnabled: boolean("isEnabled").default(false).notNull(),
  isDefault: boolean("isDefault").default(false),
  
  // Configuration (encrypted in production)
  apiKey: text("apiKey"),
  apiSecret: text("apiSecret"),
  webhookSecret: text("webhookSecret"),
  
  // OAuth tokens for Teams
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  
  // Provider-specific settings
  settings: json("settings"),
  
  // Tenant info (for Teams)
  tenantId: varchar("tenantId", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoProviderConfig = typeof videoProviderConfigs.$inferSelect;
export type InsertVideoProviderConfig = typeof videoProviderConfigs.$inferInsert;

/**
 * Meeting Reminders - Tracks sent reminders to avoid duplicates
 */
export const meetingReminders = mysqlTable("meeting_reminders", {
  id: int("id").autoincrement().primaryKey(),
  meetingId: int("meetingId").notNull(),
  reminderType: mysqlEnum("reminderType", ["15_min", "1_hour", "24_hour"]).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  recipientCount: int("recipientCount").default(0),
});
export type MeetingReminder = typeof meetingReminders.$inferSelect;
export type InsertMeetingReminder = typeof meetingReminders.$inferInsert;
