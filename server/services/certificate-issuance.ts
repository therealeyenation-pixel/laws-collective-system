/**
 * Certificate Issuance Service
 * Handles certificate generation, blockchain recording, and verification workflows
 * Phase 10.6: Certificate Issuance Workflows
 */

import { getDb } from "../db";
import {
  certificates,
  blockchainRecords,
  courseCompletionCertificates,
  simulatorCertificates,
  masteryCertificates,
  memberCredentials,
  users,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

// Certificate types supported by the system
export type CertificateType =
  | "simulator_completion"
  | "course_completion"
  | "mastery_certificate"
  | "member_credential"
  | "house_graduation"
  | "language_mastery"
  | "stem_mastery"
  | "sovereign_diploma"
  | "internship_completion"
  | "contractor_certification";

// Certificate issuance request
export interface CertificateIssuanceRequest {
  userId: number;
  certificateType: CertificateType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  entityId?: number;
  simulatorId?: string;
  courseId?: number;
  score?: number;
  tokensEarned?: number;
}

// Certificate issuance result
export interface CertificateIssuanceResult {
  success: boolean;
  certificateId?: number;
  certificateHash?: string;
  blockchainHash?: string;
  verificationUrl?: string;
  message: string;
}

/**
 * Generate a unique certificate hash
 */
export function generateCertificateHash(
  userId: number,
  certificateType: string,
  timestamp: Date
): string {
  const data = `${userId}-${certificateType}-${timestamp.toISOString()}-${crypto.randomBytes(16).toString("hex")}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Generate verification URL for a certificate
 */
export function generateVerificationUrl(certificateHash: string): string {
  const baseUrl = process.env.VITE_APP_URL || "";
  return `${baseUrl}/certificates/verify/${certificateHash}`;
}

/**
 * Record certificate to blockchain
 */
export async function recordCertificateToBlockchain(
  certificateId: number,
  certificateType: string,
  userId: number,
  certificateHash: string,
  metadata?: Record<string, any>
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get previous blockchain record for chain linking
    const previousRecords = await db
      .select()
      .from(blockchainRecords)
      .orderBy(desc(blockchainRecords.id))
      .limit(1);

    const previousHash = previousRecords.length > 0 ? previousRecords[0].blockchainHash : null;

    // Create blockchain record data
    const recordData = {
      certificateId,
      certificateType,
      userId,
      certificateHash,
      metadata,
      timestamp: new Date().toISOString(),
      previousHash,
    };

    // Generate blockchain hash
    const blockchainHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(recordData))
      .digest("hex");

    // Store blockchain record
    await db.insert(blockchainRecords).values({
      recordType: "certificate",
      referenceId: certificateId,
      blockchainHash,
      previousHash,
      data: recordData,
    });

    return blockchainHash;
  } catch (error) {
    console.error("Error recording certificate to blockchain:", error);
    return null;
  }
}

/**
 * Issue a general certificate
 */
export async function issueCertificate(
  request: CertificateIssuanceRequest
): Promise<CertificateIssuanceResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  try {
    const timestamp = new Date();
    const certificateHash = generateCertificateHash(
      request.userId,
      request.certificateType,
      timestamp
    );
    const verificationUrl = generateVerificationUrl(certificateHash);

    // Insert certificate record
    const [result] = await db.insert(certificates).values({
      userId: request.userId,
      simulatorId: request.simulatorId || null,
      certificateType: request.certificateType,
      title: request.title,
      issuedAt: timestamp,
      metadata: request.metadata || {},
      certificateHash,
      verificationUrl,
    }).$returningId();

    // Record to blockchain
    const blockchainHash = await recordCertificateToBlockchain(
      result.id,
      request.certificateType,
      request.userId,
      certificateHash,
      request.metadata
    );

    return {
      success: true,
      certificateId: result.id,
      certificateHash,
      blockchainHash: blockchainHash || undefined,
      verificationUrl,
      message: "Certificate issued successfully",
    };
  } catch (error) {
    console.error("Error issuing certificate:", error);
    return { success: false, message: `Failed to issue certificate: ${error}` };
  }
}

/**
 * Issue a course completion certificate
 */
export async function issueCourseCompletionCertificate(
  userId: number,
  courseId: number,
  courseName: string,
  score: number,
  tokensEarned: number
): Promise<CertificateIssuanceResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  try {
    const timestamp = new Date();
    const certificateHash = generateCertificateHash(userId, "course_completion", timestamp);

    // Generate a unique token ID for NFT-style certificate
    const tokenId = Math.floor(Date.now() / 1000) + userId;
    const transactionHash = crypto
      .createHash("sha256")
      .update(`tx-${userId}-${courseId}-${timestamp.toISOString()}`)
      .digest("hex");

    // Insert course completion certificate
    const [result] = await db.insert(courseCompletionCertificates).values({
      userId,
      courseId,
      courseName,
      completionScore: score,
      tokensEarned,
      certificateHash,
      transactionHash,
      tokenId,
      mintedAt: timestamp,
      verificationUrl: generateVerificationUrl(certificateHash),
    }).$returningId();

    // Record to blockchain
    const blockchainHash = await recordCertificateToBlockchain(
      result.id,
      "course_completion",
      userId,
      certificateHash,
      { courseId, courseName, score, tokensEarned }
    );

    return {
      success: true,
      certificateId: result.id,
      certificateHash,
      blockchainHash: blockchainHash || undefined,
      verificationUrl: generateVerificationUrl(certificateHash),
      message: `Course completion certificate issued for ${courseName}`,
    };
  } catch (error) {
    console.error("Error issuing course completion certificate:", error);
    return { success: false, message: `Failed to issue certificate: ${error}` };
  }
}

/**
 * Issue a mastery certificate
 */
export async function issueMasteryCertificate(
  studentProfileId: number,
  certificateType: "course_completion" | "house_graduation" | "language_mastery" | "stem_mastery" | "sovereign_diploma",
  title: string,
  description?: string,
  metadata?: Record<string, any>
): Promise<CertificateIssuanceResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  try {
    const timestamp = new Date();
    const certificateHash = generateCertificateHash(studentProfileId, certificateType, timestamp);

    // Insert mastery certificate
    const [result] = await db.insert(masteryCertificates).values({
      studentProfileId,
      certificateType,
      title,
      description,
      issuedAt: timestamp,
      blockchainHash: certificateHash,
      metadata,
    }).$returningId();

    // Record to blockchain
    const blockchainHash = await recordCertificateToBlockchain(
      result.id,
      certificateType,
      studentProfileId,
      certificateHash,
      metadata
    );

    // Update the mastery certificate with blockchain hash
    if (blockchainHash) {
      await db.update(masteryCertificates)
        .set({ blockchainHash })
        .where(eq(masteryCertificates.id, result.id));
    }

    return {
      success: true,
      certificateId: result.id,
      certificateHash,
      blockchainHash: blockchainHash || undefined,
      verificationUrl: generateVerificationUrl(certificateHash),
      message: `Mastery certificate issued: ${title}`,
    };
  } catch (error) {
    console.error("Error issuing mastery certificate:", error);
    return { success: false, message: `Failed to issue certificate: ${error}` };
  }
}

/**
 * Verify a certificate by hash
 */
export async function verifyCertificate(
  certificateHash: string
): Promise<{
  valid: boolean;
  certificate?: any;
  blockchainRecord?: any;
  message: string;
}> {
  const db = await getDb();
  if (!db) {
    return { valid: false, message: "Database not available" };
  }

  try {
    // Check general certificates
    const generalCerts = await db
      .select()
      .from(certificates)
      .where(eq(certificates.certificateHash, certificateHash));

    if (generalCerts.length > 0) {
      const cert = generalCerts[0];
      const blockchainRecord = await db
        .select()
        .from(blockchainRecords)
        .where(eq(blockchainRecords.referenceId, cert.id));

      return {
        valid: true,
        certificate: cert,
        blockchainRecord: blockchainRecord[0] || null,
        message: "Certificate verified successfully",
      };
    }

    // Check course completion certificates
    const courseCerts = await db
      .select()
      .from(courseCompletionCertificates)
      .where(eq(courseCompletionCertificates.certificateHash, certificateHash));

    if (courseCerts.length > 0) {
      return {
        valid: true,
        certificate: courseCerts[0],
        message: "Course completion certificate verified successfully",
      };
    }

    // Check simulator certificates
    const simCerts = await db
      .select()
      .from(simulatorCertificates)
      .where(eq(simulatorCertificates.certificateHash, certificateHash));

    if (simCerts.length > 0) {
      return {
        valid: true,
        certificate: simCerts[0],
        message: "Simulator certificate verified successfully",
      };
    }

    // Check mastery certificates
    const masteryCerts = await db
      .select()
      .from(masteryCertificates)
      .where(eq(masteryCertificates.blockchainHash, certificateHash));

    if (masteryCerts.length > 0) {
      return {
        valid: true,
        certificate: masteryCerts[0],
        message: "Mastery certificate verified successfully",
      };
    }

    return { valid: false, message: "Certificate not found" };
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return { valid: false, message: `Verification failed: ${error}` };
  }
}

/**
 * Get all certificates for a user
 */
export async function getUserCertificates(userId: number): Promise<{
  general: any[];
  courseCompletion: any[];
  simulator: any[];
  mastery: any[];
}> {
  const db = await getDb();
  if (!db) {
    return { general: [], courseCompletion: [], simulator: [], mastery: [] };
  }

  try {
    const [general, courseCompletion, simulator] = await Promise.all([
      db.select().from(certificates).where(eq(certificates.userId, userId)),
      db.select().from(courseCompletionCertificates).where(eq(courseCompletionCertificates.userId, userId)),
      db.select().from(simulatorCertificates).where(eq(simulatorCertificates.userId, userId)),
    ]);

    return {
      general,
      courseCompletion,
      simulator,
      mastery: [], // Mastery certificates are linked to student profiles, not directly to users
    };
  } catch (error) {
    console.error("Error getting user certificates:", error);
    return { general: [], courseCompletion: [], simulator: [], mastery: [] };
  }
}

/**
 * Check certificate eligibility for a user
 */
export async function checkCertificateEligibility(
  userId: number,
  certificateType: CertificateType,
  referenceId?: number
): Promise<{
  eligible: boolean;
  reason: string;
  existingCertificate?: any;
}> {
  const db = await getDb();
  if (!db) {
    return { eligible: false, reason: "Database not available" };
  }

  try {
    // Check if user already has this certificate
    if (certificateType === "simulator_completion" && referenceId) {
      const existing = await db
        .select()
        .from(simulatorCertificates)
        .where(
          and(
            eq(simulatorCertificates.userId, userId),
            eq(simulatorCertificates.simulatorId, referenceId.toString())
          )
        );

      if (existing.length > 0) {
        return {
          eligible: false,
          reason: "Certificate already issued for this simulator",
          existingCertificate: existing[0],
        };
      }
    }

    if (certificateType === "course_completion" && referenceId) {
      const existing = await db
        .select()
        .from(courseCompletionCertificates)
        .where(
          and(
            eq(courseCompletionCertificates.userId, userId),
            eq(courseCompletionCertificates.courseId, referenceId)
          )
        );

      if (existing.length > 0) {
        return {
          eligible: false,
          reason: "Certificate already issued for this course",
          existingCertificate: existing[0],
        };
      }
    }

    return { eligible: true, reason: "User is eligible for certificate" };
  } catch (error) {
    console.error("Error checking certificate eligibility:", error);
    return { eligible: false, reason: `Eligibility check failed: ${error}` };
  }
}

/**
 * Revoke a certificate
 */
export async function revokeCertificate(
  certificateId: number,
  certificateType: CertificateType,
  reason: string,
  revokedBy: number
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Record revocation to blockchain
    const revocationHash = crypto
      .createHash("sha256")
      .update(`revoke-${certificateId}-${certificateType}-${Date.now()}`)
      .digest("hex");

    // Get previous blockchain record
    const previousRecords = await db
      .select()
      .from(blockchainRecords)
      .orderBy(desc(blockchainRecords.id))
      .limit(1);

    const previousHash = previousRecords.length > 0 ? previousRecords[0].blockchainHash : null;

    // Create revocation record
    await db.insert(blockchainRecords).values({
      recordType: "certificate",
      referenceId: certificateId,
      blockchainHash: revocationHash,
      previousHash,
      data: {
        action: "revoke",
        certificateId,
        certificateType,
        reason,
        revokedBy,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: `Certificate ${certificateId} revoked successfully`,
    };
  } catch (error) {
    console.error("Error revoking certificate:", error);
    return { success: false, message: `Failed to revoke certificate: ${error}` };
  }
}
