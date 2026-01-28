import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";
import { InsertUser, users, businessEntities, simulatorSessions, certificates, luvLedgerAccounts, trustRelationships, departments, staffMembers, curriculumSubjects, courses, studentEnrollments } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: 'default' });
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

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update password: database not available");
    return;
  }

  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
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


// Purchase Request queries
export async function getPurchaseRequests(filters: {
  status?: string;
  departmentId?: number;
  requesterId?: number;
  limit?: number;
  offset?: number;
} = {}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = `SELECT * FROM purchase_requests WHERE 1=1`;
  const params: any[] = [];
  
  if (filters.status) {
    query += ` AND status = ?`;
    params.push(filters.status);
  }
  if (filters.departmentId) {
    query += ` AND departmentId = ?`;
    params.push(filters.departmentId);
  }
  if (filters.requesterId) {
    query += ` AND requesterId = ?`;
    params.push(filters.requesterId);
  }
  
  query += ` ORDER BY createdAt DESC`;
  
  if (filters.limit) {
    query += ` LIMIT ?`;
    params.push(filters.limit);
  }
  if (filters.offset) {
    query += ` OFFSET ?`;
    params.push(filters.offset);
  }
  
  const [rows] = await (db as any).execute(query, params);
  return rows;
}

export async function getPurchaseRequestById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [rows] = await (db as any).execute(
    `SELECT * FROM purchase_requests WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function createPurchaseRequest(data: {
  requestNumber: string;
  requesterId: number;
  departmentId: number;
  title: string;
  description: string;
  category: string;
  vendor: string | null;
  amount: string;
  budgetCode: string | null;
  fiscalYear: string | null;
  approvalTier: string;
  status: string;
  ceoApproval: string;
  attachments: string | null;
  submittedAt: Date | null;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const [result] = await (db as any).execute(
    `INSERT INTO purchase_requests 
    (requestNumber, requesterId, departmentId, title, description, category, vendor, amount, budgetCode, fiscalYear, approvalTier, status, ceoApproval, attachments, submittedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.requestNumber,
      data.requesterId,
      data.departmentId,
      data.title,
      data.description,
      data.category,
      data.vendor,
      data.amount,
      data.budgetCode,
      data.fiscalYear,
      data.approvalTier,
      data.status,
      data.ceoApproval,
      data.attachments,
      data.submittedAt,
    ]
  );
  return result;
}

export async function updatePurchaseRequest(id: number, updates: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  if (fields.length === 0) return;
  
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  
  await (db as any).execute(
    `UPDATE purchase_requests SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
}

export async function addPurchaseRequestComment(data: {
  purchaseRequestId: number;
  userId: number;
  comment: string;
  isInternal: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await (db as any).execute(
    `INSERT INTO purchase_request_comments (purchaseRequestId, userId, comment, isInternal) VALUES (?, ?, ?, ?)`,
    [data.purchaseRequestId, data.userId, data.comment, data.isInternal]
  );
}

export async function getPurchaseRequestComments(purchaseRequestId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const [rows] = await (db as any).execute(
    `SELECT prc.*, u.name as userName 
     FROM purchase_request_comments prc
     LEFT JOIN users u ON prc.userId = u.id
     WHERE prc.purchaseRequestId = ?
     ORDER BY prc.createdAt ASC`,
    [purchaseRequestId]
  );
  return rows;
}

export async function getPurchaseRequestStats() {
  const db = await getDb();
  if (!db) return {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    approvedAmount: 0,
  };
  
  const [rows] = await (db as any).execute(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status NOT IN ('approved', 'rejected', 'cancelled') THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(amount) as totalAmount,
      SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approvedAmount
    FROM purchase_requests
  `);
  
  return rows[0] || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    approvedAmount: 0,
  };
}

// Create a singleton db instance for use with drizzle query API
let _dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>> & {
  upsertUser: typeof upsertUser;
  getUserByOpenId: typeof getUserByOpenId;
  getUserBusinessEntities: typeof getUserBusinessEntities;
  getUserSimulatorSessions: typeof getUserSimulatorSessions;
  getUserCertificates: typeof getUserCertificates;
  getUserLuvLedgerAccounts: typeof getUserLuvLedgerAccounts;
  getTrustRelationshipsForUser: typeof getTrustRelationshipsForUser;
  getDepartments: typeof getDepartments;
  getStaffByDepartment: typeof getStaffByDepartment;
  getStaffByUser: typeof getStaffByUser;
  getCurriculumSubjects: typeof getCurriculumSubjects;
  getCoursesBySubject: typeof getCoursesBySubject;
  getStudentEnrollments: typeof getStudentEnrollments;
  getPurchaseRequests: typeof getPurchaseRequests;
  getPurchaseRequestById: typeof getPurchaseRequestById;
  createPurchaseRequest: typeof createPurchaseRequest;
  updatePurchaseRequest: typeof updatePurchaseRequest;
  addPurchaseRequestComment: typeof addPurchaseRequestComment;
  getPurchaseRequestComments: typeof getPurchaseRequestComments;
  getPurchaseRequestStats: typeof getPurchaseRequestStats;
}, {
  get(target, prop) {
    // Return helper functions
    const helpers: Record<string, any> = {
      upsertUser,
      getUserByOpenId,
      getUserBusinessEntities,
      getUserSimulatorSessions,
      getUserCertificates,
      getUserLuvLedgerAccounts,
      getTrustRelationshipsForUser,
      getDepartments,
      getStaffByDepartment,
      getStaffByUser,
      getCurriculumSubjects,
      getCoursesBySubject,
      getStudentEnrollments,
      getPurchaseRequests,
      getPurchaseRequestById,
      createPurchaseRequest,
      updatePurchaseRequest,
      addPurchaseRequestComment,
      getPurchaseRequestComments,
      getPurchaseRequestStats,
    };
    
    if (prop in helpers) {
      return helpers[prop as string];
    }
    
    // For drizzle query API access, get the db instance
    if (!_dbInstance && process.env.DATABASE_URL) {
      _dbInstance = drizzle(process.env.DATABASE_URL, { schema, mode: 'default' });
    }
    
    if (_dbInstance) {
      return (_dbInstance as any)[prop];
    }
    
    return undefined;
  }
});
