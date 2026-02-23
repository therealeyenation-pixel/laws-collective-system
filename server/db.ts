import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, businessEntities, simulatorSessions, certificates, luvLedgerAccounts, trustRelationships, departments, staffMembers, curriculumSubjects, courses, studentEnrollments } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// LuvOnPurpose-specific helpers

export async function getUserBusinessEntities(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(businessEntities).where(eq(businessEntities.userId, userId));
}

export async function getUserSimulatorSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(simulatorSessions).where(eq(simulatorSessions.userId, userId));
}

export async function getUserCertificates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates).where(eq(certificates.userId, userId));
}

export async function getUserLuvLedgerAccounts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(luvLedgerAccounts).where(eq(luvLedgerAccounts.userId, userId));
}

export async function getTrustRelationshipsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trustRelationships).where(eq(trustRelationships.parentUserId, userId));
}

// Organizational queries
export async function getDepartments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(departments);
}

export async function getStaffByDepartment(departmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(staffMembers).where(eq(staffMembers.departmentId, departmentId));
}

export async function getStaffByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(staffMembers).where(eq(staffMembers.userId, userId));
}

// Curriculum queries
export async function getCurriculumSubjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(curriculumSubjects);
}

export async function getCoursesBySubject(subjectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.subjectId, subjectId));
}

export async function getStudentEnrollments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentEnrollments).where(eq(studentEnrollments.userId, userId));
}
