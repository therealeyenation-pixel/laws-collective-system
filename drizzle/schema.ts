import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

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
