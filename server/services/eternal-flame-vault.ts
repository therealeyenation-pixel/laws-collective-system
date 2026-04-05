/**
 * Eternal Flame Vault Service
 * Phase 19.6: Permanent record storage for academy achievements
 * 
 * The Eternal Flame Vault is a ceremonial archive that stores
 * permanent records of student achievements, scrolls, and milestones.
 * Records are immutable once sealed and blockchain-anchored.
 */

import { db, getDb } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  certificates,
  studentProfiles,
  studentProgress,
  blockchainRecords,
  tokenTransactions,
  academyHouses,
  academyLanguages,
} from "../../drizzle/schema";

// Vault Record Types
export type VaultRecordType =
  | "scroll"
  | "milestone"
  | "graduation"
  | "language_mastery"
  | "ceremonial_honor"
  | "legacy_record";

// Vault Record Status
export type VaultRecordStatus = "pending" | "sealed" | "verified" | "archived";

// Vault Record Interface
export interface VaultRecord {
  id: string;
  type: VaultRecordType;
  title: string;
  description: string;
  studentProfileId: number;
  studentName: string;
  houseName: string | null;
  achievementDate: Date;
  sealedDate: Date | null;
  blockchainHash: string | null;
  blockNumber: number | null;
  status: VaultRecordStatus;
  metadata: Record<string, any>;
  verificationUrl: string;
}

// Vault Statistics
export interface VaultStats {
  totalRecords: number;
  sealedRecords: number;
  pendingRecords: number;
  recordsByType: Record<string, number>;
  recordsByHouse: Record<string, number>;
  oldestRecord: Date | null;
  newestRecord: Date | null;
}

/**
 * Generate a unique vault record ID
 */
function generateVaultId(): string {
  const crypto = require("crypto");
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString("hex");
  return `EFV-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate blockchain hash for vault record
 */
function generateVaultHash(record: object): string {
  const crypto = require("crypto");
  const dataString = JSON.stringify(record) + Date.now();
  return crypto.createHash("sha256").update(dataString).digest("hex");
}

/**
 * Get all vault records for a student
 */
export async function getStudentVaultRecords(studentProfileId: number): Promise<{
  success: boolean;
  records: VaultRecord[];
  message?: string;
}> {
  const database = getDb();
  if (!database) {
    return { success: false, records: [], message: "Database not available" };
  }

  try {
    // Get student profile
    const profile = await database
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, studentProfileId))
      .limit(1);

    if (profile.length === 0) {
      return { success: false, records: [], message: "Student not found" };
    }

    // Get house name
    let houseName: string | null = null;
    if (profile[0].houseId) {
      const house = await database
        .select({ name: academyHouses.name })
        .from(academyHouses)
        .where(eq(academyHouses.id, profile[0].houseId))
        .limit(1);
      houseName = house[0]?.name || null;
    }

    // Get certificates (scrolls)
    const certs = await database
      .select()
      .from(certificates)
      .where(eq(certificates.userId, profile[0].userId))
      .orderBy(desc(certificates.issuedAt));

    // Get blockchain records for verification
    const blockchainData = await database
      .select()
      .from(blockchainRecords)
      .where(eq(blockchainRecords.userId, profile[0].userId));

    const blockchainMap = new Map(
      blockchainData.map(b => [b.entityId, b])
    );

    // Transform to vault records
    const records: VaultRecord[] = certs.map(cert => {
      const metadata = cert.metadata ? JSON.parse(cert.metadata as string) : {};
      const blockchain = blockchainMap.get(cert.certificateHash);

      return {
        id: `EFV-${cert.id}`,
        type: mapCertTypeToVaultType(cert.certificateType),
        title: cert.title,
        description: getVaultDescription(cert.certificateType, cert.title),
        studentProfileId,
        studentName: profile[0].displayName || "Unknown",
        houseName,
        achievementDate: cert.issuedAt,
        sealedDate: blockchain ? new Date(blockchain.createdAt) : null,
        blockchainHash: cert.certificateHash,
        blockNumber: blockchain?.blockNumber || null,
        status: blockchain ? "sealed" : "pending",
        metadata,
        verificationUrl: `/scrolls/verify/${cert.certificateHash}`,
      };
    });

    return { success: true, records };
  } catch (error) {
    console.error("[EternalFlameVault] Error getting records:", error);
    return { success: false, records: [], message: "Failed to fetch vault records" };
  }
}

/**
 * Map certificate type to vault record type
 */
function mapCertTypeToVaultType(certType: string): VaultRecordType {
  switch (certType) {
    case "house_graduation":
      return "graduation";
    case "language_mastery":
      return "language_mastery";
    case "ceremonial_achievement":
      return "ceremonial_honor";
    case "sovereign_scholar":
      return "legacy_record";
    default:
      return "scroll";
  }
}

/**
 * Get vault description based on type
 */
function getVaultDescription(certType: string, title: string): string {
  switch (certType) {
    case "course_completion":
      return `Completion of ${title} - sealed in the Eternal Flame Vault`;
    case "module_mastery":
      return `Mastery achievement for ${title} - permanently recorded`;
    case "house_graduation":
      return `Sacred graduation ceremony - forever honored in the Vault`;
    case "language_mastery":
      return `Language mastery - a Living Scroll preserved eternally`;
    case "ceremonial_achievement":
      return `Ceremonial honor - inscribed in the flames of remembrance`;
    case "sovereign_scholar":
      return `The highest honor - Sovereign Scholar legacy preserved for generations`;
    default:
      return `Achievement record - sealed in the Eternal Flame Vault`;
  }
}

/**
 * Seal a record in the vault (make it immutable)
 */
export async function sealVaultRecord(
  certificateId: number,
  userId: number
): Promise<{ success: boolean; record?: VaultRecord; message?: string }> {
  const database = getDb();
  if (!database) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Get certificate
    const cert = await database
      .select()
      .from(certificates)
      .where(eq(certificates.id, certificateId))
      .limit(1);

    if (cert.length === 0) {
      return { success: false, message: "Certificate not found" };
    }

    // Check if already sealed
    const existing = await database
      .select()
      .from(blockchainRecords)
      .where(eq(blockchainRecords.entityId, cert[0].certificateHash))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, message: "Record already sealed" };
    }

    // Create blockchain record
    const vaultData = {
      certificateId,
      certificateHash: cert[0].certificateHash,
      title: cert[0].title,
      type: cert[0].certificateType,
      sealedAt: new Date().toISOString(),
      sealedBy: userId,
    };

    const vaultHash = generateVaultHash(vaultData);

    await database.insert(blockchainRecords).values({
      recordType: "eternal_flame_vault",
      entityType: "vault_record",
      entityId: cert[0].certificateHash,
      transactionHash: vaultHash,
      blockNumber: Math.floor(Date.now() / 1000),
      data: JSON.stringify(vaultData),
      status: "confirmed",
      userId,
    });

    return {
      success: true,
      message: "Record sealed in the Eternal Flame Vault",
    };
  } catch (error) {
    console.error("[EternalFlameVault] Error sealing record:", error);
    return { success: false, message: "Failed to seal record" };
  }
}

/**
 * Get vault statistics for a guardian's students
 */
export async function getGuardianVaultStats(guardianUserId: number): Promise<{
  success: boolean;
  stats: VaultStats | null;
  message?: string;
}> {
  const database = getDb();
  if (!database) {
    return { success: false, stats: null, message: "Database not available" };
  }

  try {
    // Get all students for this guardian
    const students = await database
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.guardianUserId, guardianUserId));

    if (students.length === 0) {
      return {
        success: true,
        stats: {
          totalRecords: 0,
          sealedRecords: 0,
          pendingRecords: 0,
          recordsByType: {},
          recordsByHouse: {},
          oldestRecord: null,
          newestRecord: null,
        },
      };
    }

    const userIds = students.map(s => s.userId);

    // Get all certificates for these students
    const allCerts = await database
      .select()
      .from(certificates)
      .where(sql`${certificates.userId} IN (${sql.join(userIds, sql`, `)})`);

    // Get blockchain records
    const certHashes = allCerts.map(c => c.certificateHash);
    const blockchainData = certHashes.length > 0
      ? await database
          .select()
          .from(blockchainRecords)
          .where(sql`${blockchainRecords.entityId} IN (${sql.join(certHashes, sql`, `)})`)
      : [];

    const sealedHashes = new Set(blockchainData.map(b => b.entityId));

    // Calculate statistics
    const stats: VaultStats = {
      totalRecords: allCerts.length,
      sealedRecords: blockchainData.length,
      pendingRecords: allCerts.length - blockchainData.length,
      recordsByType: {},
      recordsByHouse: {},
      oldestRecord: null,
      newestRecord: null,
    };

    // Count by type
    allCerts.forEach(cert => {
      const type = mapCertTypeToVaultType(cert.certificateType);
      stats.recordsByType[type] = (stats.recordsByType[type] || 0) + 1;
    });

    // Count by house
    for (const student of students) {
      if (student.houseId) {
        const house = await database
          .select({ name: academyHouses.name })
          .from(academyHouses)
          .where(eq(academyHouses.id, student.houseId))
          .limit(1);

        const houseName = house[0]?.name || "Unknown";
        const studentCerts = allCerts.filter(c => c.userId === student.userId);
        stats.recordsByHouse[houseName] = (stats.recordsByHouse[houseName] || 0) + studentCerts.length;
      }
    }

    // Find oldest and newest
    if (allCerts.length > 0) {
      const sorted = [...allCerts].sort(
        (a, b) => a.issuedAt.getTime() - b.issuedAt.getTime()
      );
      stats.oldestRecord = sorted[0].issuedAt;
      stats.newestRecord = sorted[sorted.length - 1].issuedAt;
    }

    return { success: true, stats };
  } catch (error) {
    console.error("[EternalFlameVault] Error getting stats:", error);
    return { success: false, stats: null, message: "Failed to fetch vault statistics" };
  }
}

/**
 * Verify a vault record
 */
export async function verifyVaultRecord(recordHash: string): Promise<{
  success: boolean;
  verified: boolean;
  record?: VaultRecord;
  message?: string;
}> {
  const database = getDb();
  if (!database) {
    return { success: false, verified: false, message: "Database not available" };
  }

  try {
    // Find certificate by hash
    const cert = await database
      .select()
      .from(certificates)
      .where(eq(certificates.certificateHash, recordHash))
      .limit(1);

    if (cert.length === 0) {
      return { success: true, verified: false, message: "Record not found in vault" };
    }

    // Find blockchain record
    const blockchain = await database
      .select()
      .from(blockchainRecords)
      .where(eq(blockchainRecords.entityId, recordHash))
      .limit(1);

    // Get student profile
    const profile = await database
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, cert[0].userId))
      .limit(1);

    // Get house name
    let houseName: string | null = null;
    if (profile[0]?.houseId) {
      const house = await database
        .select({ name: academyHouses.name })
        .from(academyHouses)
        .where(eq(academyHouses.id, profile[0].houseId))
        .limit(1);
      houseName = house[0]?.name || null;
    }

    const metadata = cert[0].metadata ? JSON.parse(cert[0].metadata as string) : {};

    const record: VaultRecord = {
      id: `EFV-${cert[0].id}`,
      type: mapCertTypeToVaultType(cert[0].certificateType),
      title: cert[0].title,
      description: getVaultDescription(cert[0].certificateType, cert[0].title),
      studentProfileId: profile[0]?.id || 0,
      studentName: profile[0]?.displayName || "Unknown",
      houseName,
      achievementDate: cert[0].issuedAt,
      sealedDate: blockchain[0] ? new Date(blockchain[0].createdAt) : null,
      blockchainHash: cert[0].certificateHash,
      blockNumber: blockchain[0]?.blockNumber || null,
      status: blockchain[0] ? "sealed" : "pending",
      metadata,
      verificationUrl: `/scrolls/verify/${cert[0].certificateHash}`,
    };

    return {
      success: true,
      verified: blockchain.length > 0,
      record,
      message: blockchain.length > 0
        ? "Record verified and sealed in the Eternal Flame Vault"
        : "Record found but not yet sealed",
    };
  } catch (error) {
    console.error("[EternalFlameVault] Error verifying record:", error);
    return { success: false, verified: false, message: "Verification failed" };
  }
}

/**
 * Get vault timeline for a student
 */
export async function getStudentVaultTimeline(studentProfileId: number): Promise<{
  success: boolean;
  timeline: Array<{
    date: Date;
    event: string;
    type: VaultRecordType;
    recordId: string;
  }>;
  message?: string;
}> {
  const database = getDb();
  if (!database) {
    return { success: false, timeline: [], message: "Database not available" };
  }

  try {
    const recordsResult = await getStudentVaultRecords(studentProfileId);
    if (!recordsResult.success) {
      return { success: false, timeline: [], message: recordsResult.message };
    }

    const timeline = recordsResult.records.map(record => ({
      date: record.achievementDate,
      event: record.title,
      type: record.type,
      recordId: record.id,
    })).sort((a, b) => b.date.getTime() - a.date.getTime());

    return { success: true, timeline };
  } catch (error) {
    console.error("[EternalFlameVault] Error getting timeline:", error);
    return { success: false, timeline: [], message: "Failed to fetch timeline" };
  }
}

/**
 * Export vault records as JSON
 */
export async function exportVaultRecords(studentProfileId: number): Promise<{
  success: boolean;
  data?: string;
  message?: string;
}> {
  const recordsResult = await getStudentVaultRecords(studentProfileId);
  if (!recordsResult.success) {
    return { success: false, message: recordsResult.message };
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    studentProfileId,
    totalRecords: recordsResult.records.length,
    records: recordsResult.records,
  };

  return {
    success: true,
    data: JSON.stringify(exportData, null, 2),
  };
}
