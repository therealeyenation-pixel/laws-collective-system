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
  status: mysqlEnum("status", ["forming", "active", "suspended", "dissolved"]).default("forming").notNull(),
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

