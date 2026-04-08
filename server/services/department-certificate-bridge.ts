/**
 * Department-Certificate-Blockchain Bridge Service
 * 
 * When a simulator is completed, this service:
 * 1. Looks up the department via the registry
 * 2. Issues a certificate signed by the department Manager
 * 3. Generates a blockchain hash and records it on LuvLedger
 * 4. Links the certificate to the activation progress
 * 
 * This is the connective tissue between:
 *   Department → Simulator → Certificate → LuvLedger → Activation
 */

import crypto from "crypto";
import { getCertificateContext, getDepartmentBySimulatorType } from "../../shared/departmentRegistry";
import { db } from "../db";
import { sql } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CertificateIssuanceResult {
  success: boolean;
  certificateId?: number;
  blockchainHash?: string;
  luvLedgerEntryId?: string;
  error?: string;
}

export interface CertificateData {
  userId: number;
  userName: string;
  simulatorType: string;
  score: number;
  completedAt: Date;
}

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Generate a cryptographic hash for a certificate record
 * Creates an immutable fingerprint linking the certificate to the blockchain
 */
function generateCertificateHash(data: {
  userId: number;
  simulatorType: string;
  departmentId: string;
  managerName: string;
  timestamp: string;
  previousHash: string | null;
}): string {
  const payload = JSON.stringify({
    ...data,
    nonce: crypto.randomBytes(16).toString("hex"),
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Generate a unique certificate number
 * Format: DEPT-TYPE-USERID-TIMESTAMP
 */
function generateCertificateNumber(
  departmentId: string,
  simulatorType: string,
  userId: number
): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const deptCode = departmentId.substring(0, 3).toUpperCase();
  const typeCode = simulatorType.substring(0, 3).toUpperCase();
  return `${deptCode}-${typeCode}-${userId}-${timestamp}`;
}

/**
 * Get the latest blockchain hash for chain continuity
 */
async function getLatestBlockchainHash(): Promise<string | null> {
  try {
    const result = await db.execute({
      sql: `SELECT blockchainHash FROM blockchain_records ORDER BY id DESC LIMIT 1`,
      args: [],
    });
    if (result.rows.length > 0) {
      return (result.rows[0] as any).blockchainHash;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Issue a certificate and record it on the LuvLedger blockchain
 * 
 * This is the main function that ties everything together:
 * 1. Validates the simulator type against the department registry
 * 2. Creates the certificate record
 * 3. Generates a blockchain hash
 * 4. Records the blockchain entry
 * 5. Returns the certificate ID and blockchain hash
 */
export async function issueDepartmentCertificate(
  data: CertificateData
): Promise<CertificateIssuanceResult> {
  const context = getCertificateContext(data.simulatorType);

  if (!context) {
    return {
      success: false,
      error: `No department found for simulator type: ${data.simulatorType}`,
    };
  }

  const { department, simulator, signingManager, trainingManager } = context;
  const certificateNumber = generateCertificateNumber(
    department.id,
    data.simulatorType,
    data.userId
  );

  try {
    // 1. Get previous hash for blockchain chain
    const previousHash = await getLatestBlockchainHash();

    // 2. Generate blockchain hash for this certificate
    const blockchainHash = generateCertificateHash({
      userId: data.userId,
      simulatorType: data.simulatorType,
      departmentId: department.id,
      managerName: signingManager.name,
      timestamp: new Date().toISOString(),
      previousHash,
    });

    // 3. Insert certificate record
    const certResult = await db.execute({
      sql: `INSERT INTO certificates (userId, simulatorSessionId, certificateType, title, certificateHash, verificationUrl)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        data.userId,
        0, // simulatorSessionId — linked via type
        simulator.certificateType,
        `${simulator.label} Certificate of Completion`,
        blockchainHash,
        `/verify-certificate/${certificateNumber}`,
      ],
    });
    const certificateId = Number(certResult.insertId);

    // 4. Record on blockchain (immutable audit trail)
    const blockchainData = {
      certificateId,
      certificateNumber,
      userId: data.userId,
      userName: data.userName,
      simulatorType: data.simulatorType,
      simulatorLabel: simulator.label,
      score: data.score,
      departmentId: department.id,
      departmentName: department.name,
      entity: department.entity,
      signingManager: {
        name: signingManager.name,
        title: signingManager.title,
      },
      trainingManager: {
        name: trainingManager.name,
        title: trainingManager.title,
      },
      issuedAt: new Date().toISOString(),
      completedAt: data.completedAt.toISOString(),
    };

    await db.execute({
      sql: `INSERT INTO blockchain_records (recordType, referenceId, blockchainHash, previousHash, data)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        "certificate",
        certificateId,
        blockchainHash,
        previousHash,
        JSON.stringify(blockchainData),
      ],
    });

    // 5. Create LuvLedger entry ID for cross-referencing
    const luvLedgerEntryId = `LL-CERT-${department.id.toUpperCase()}-${data.userId}-${Date.now()}`;

    // 6. Update the simulator_completion record with the certificate ID
    await db.execute({
      sql: `UPDATE simulator_completion SET certificateId = ? 
            WHERE userId = ? AND simulatorType = ? 
            ORDER BY completedAt DESC LIMIT 1`,
      args: [certificateId, data.userId, data.simulatorType],
    });

    return {
      success: true,
      certificateId,
      blockchainHash,
      luvLedgerEntryId,
    };
  } catch (error: any) {
    console.error("[CertBridge] Error issuing certificate:", error);
    return {
      success: false,
      error: error.message || "Failed to issue certificate",
    };
  }
}

/**
 * Verify a certificate by its blockchain hash
 */
export async function verifyCertificateByHash(hash: string) {
  try {
    const records = await db.execute({
      sql: `SELECT br.*, c.title as certTitle, c.issuedAt as certIssuedAt
            FROM blockchain_records br
            LEFT JOIN certificates c ON br.referenceId = c.id
            WHERE br.blockchainHash = ? AND br.recordType = 'certificate'`,
      args: [hash],
    });

    if (records.rows.length === 0) {
      return { verified: false, error: "Certificate not found on blockchain" };
    }

    const record = records.rows[0] as any;
    const data = typeof record.data === "string" ? JSON.parse(record.data) : record.data;

    return {
      verified: true,
      certificate: {
        title: record.certTitle,
        issuedAt: record.certIssuedAt,
        blockchainHash: record.blockchainHash,
        department: data.departmentName,
        entity: data.entity,
        signingManager: data.signingManager,
        trainingManager: data.trainingManager,
        simulatorLabel: data.simulatorLabel,
        score: data.score,
      },
    };
  } catch (error: any) {
    return { verified: false, error: error.message };
  }
}

/**
 * Get all certificates for a user with their department context
 */
export async function getUserCertificatesWithDepartments(userId: number) {
  try {
    const results = await db.execute({
      sql: `SELECT c.*, br.blockchainHash, br.data as blockchainData
            FROM certificates c
            LEFT JOIN blockchain_records br ON br.referenceId = c.id AND br.recordType = 'certificate'
            WHERE c.userId = ?
            ORDER BY c.issuedAt DESC`,
      args: [userId],
    });

    return results.rows.map((row: any) => {
      const blockchainData = row.blockchainData
        ? typeof row.blockchainData === "string"
          ? JSON.parse(row.blockchainData)
          : row.blockchainData
        : null;

      return {
        id: row.id,
        title: row.title,
        certificateType: row.certificateType,
        issuedAt: row.issuedAt,
        blockchainHash: row.blockchainHash,
        verificationUrl: row.verificationUrl,
        department: blockchainData?.departmentName ?? null,
        entity: blockchainData?.entity ?? null,
        signingManager: blockchainData?.signingManager ?? null,
        trainingManager: blockchainData?.trainingManager ?? null,
        simulatorLabel: blockchainData?.simulatorLabel ?? null,
        score: blockchainData?.score ?? null,
      };
    });
  } catch (error: any) {
    console.error("[CertBridge] Error getting user certificates:", error);
    return [];
  }
}

/**
 * Get certificate statistics for a department
 */
export async function getDepartmentCertificateStats(departmentId: string) {
  const dept = getDepartmentBySimulatorType(departmentId);
  if (!dept) return null;

  const simulatorTypes = dept.simulators.map((s) => s.type);
  if (simulatorTypes.length === 0) return { department: dept.name, totalIssued: 0, recentCerts: [] };

  try {
    const placeholders = simulatorTypes.map(() => "?").join(",");
    const results = await db.execute({
      sql: `SELECT COUNT(*) as total FROM blockchain_records 
            WHERE recordType = 'certificate' 
            AND JSON_EXTRACT(data, '$.departmentId') = ?`,
      args: [departmentId],
    });

    const total = (results.rows[0] as any)?.total ?? 0;

    return {
      department: dept.name,
      totalIssued: Number(total),
      manager: dept.manager,
    };
  } catch {
    return { department: dept.name, totalIssued: 0, manager: dept.manager };
  }
}
