/**
 * Simulator Certificates Router
 * Handles simulator ordering, certificate generation, and blockchain recording
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import {
  getSimulatorOrder,
  getSimulatorByKey,
  checkPrerequisites,
  generateCertificateData,
  generateBlockchainRecordData,
  calculateSimulatorProgress,
  getCertificateTemplate,
  getCertificateDisplayInfo
} from "../services/simulator-certificates";

export const simulatorCertificatesRouter = router({
  // Get ordered list of simulators
  getSimulatorOrder: protectedProcedure.query(async () => {
    return getSimulatorOrder();
  }),

  // Get user's simulator progress
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    // Get completed simulators from certificates table
    const completedResults = await db.execute({
      sql: `SELECT DISTINCT certificate_type FROM certificates
            WHERE user_id = ? AND certificate_type IN (
              'business_foundations', 'business_plan', 'grant_writing',
              'financial_management', 'trust_estate', 'contracts_legal',
              'blockchain_crypto', 'entity_operations', 'insurance_planning'
            )`,
      args: [ctx.user.id]
    });

    // Map certificate types back to simulator keys
    const typeToKey: Record<string, string> = {
      business_foundations: "business",
      business_plan: "business-plan",
      grant_writing: "grant",
      financial_management: "financial",
      trust_estate: "trust",
      contracts_legal: "contracts",
      blockchain_crypto: "blockchain",
      entity_operations: "operations",
      insurance_planning: "insurance"
    };

    const completedSimulators = completedResults.rows.map((row: any) =>
      typeToKey[row.certificate_type] || row.certificate_type
    );

    return calculateSimulatorProgress(completedSimulators);
  }),

  // Check if user can access a simulator
  checkAccess: protectedProcedure
    .input(z.object({ simulatorKey: z.string() }))
    .query(async ({ ctx, input }) => {
      const completedResults = await db.execute({
        sql: `SELECT DISTINCT certificate_type FROM certificates
              WHERE user_id = ? AND certificate_type IN (
                'business_foundations', 'business_plan', 'grant_writing',
                'financial_management', 'trust_estate', 'contracts_legal',
                'blockchain_crypto', 'entity_operations', 'insurance_planning'
              )`,
        args: [ctx.user.id]
      });

      const typeToKey: Record<string, string> = {
        business_foundations: "business",
        business_plan: "business-plan",
        grant_writing: "grant",
        financial_management: "financial",
        trust_estate: "trust",
        contracts_legal: "contracts",
        blockchain_crypto: "blockchain",
        entity_operations: "operations",
        insurance_planning: "insurance"
      };

      const completedSimulators = completedResults.rows.map((row: any) =>
        typeToKey[row.certificate_type] || row.certificate_type
      );

      return checkPrerequisites(input.simulatorKey, completedSimulators);
    }),

  // Issue certificate for completed simulator
  issueCertificate: protectedProcedure
    .input(z.object({ simulatorKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const simulator = getSimulatorByKey(input.simulatorKey);
      if (!simulator) {
        throw new Error("Invalid simulator");
      }

      // Check if certificate already exists
      const existingCert = await db.execute({
        sql: `SELECT id FROM certificates
              WHERE user_id = ? AND certificate_type = ?`,
        args: [ctx.user.id, simulator.certificateType]
      });

      if (existingCert.rows.length > 0) {
        return {
          success: true,
          message: "Certificate already issued",
          certificateId: (existingCert.rows[0] as any).id,
          alreadyIssued: true
        };
      }

      // Generate certificate data
      const certData = generateCertificateData(
        ctx.user.id,
        ctx.user.name || "Student",
        input.simulatorKey
      );

      if (!certData) {
        throw new Error("Failed to generate certificate data");
      }

      // Generate blockchain record
      const blockchainData = generateBlockchainRecordData({
        userId: ctx.user.id,
        certificateType: certData.certificateType,
        title: certData.title,
        issuedAt: certData.issuedAt
      });

      // Get next block number
      const lastBlock = await db.execute({
        sql: `SELECT MAX(block_number) as last_block FROM blockchain_records`
      });
      const nextBlockNumber = ((lastBlock.rows[0] as any)?.last_block || 0) + 1;

      // Record to blockchain
      await db.execute({
        sql: `INSERT INTO blockchain_records (block_number, hash, data, record_type, entity_id, created_at)
              VALUES (?, ?, ?, 'certificate', ?, NOW())`,
        args: [nextBlockNumber, blockchainData.hash, blockchainData.data, ctx.user.id]
      });

      // Insert certificate
      const certResult = await db.execute({
        sql: `INSERT INTO certificates (user_id, certificate_type, title, description, blockchain_hash, block_number, issued_at)
              VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        args: [
          ctx.user.id,
          certData.certificateType,
          certData.title,
          certData.description,
          blockchainData.hash,
          nextBlockNumber
        ]
      });

      // Award tokens
      await db.execute({
        sql: `INSERT INTO token_transactions (user_id, amount, type, description, created_at)
              VALUES (?, ?, 'earned', ?, NOW())`,
        args: [ctx.user.id, simulator.tokensReward, `Completed ${simulator.title} Simulator`]
      });

      await db.execute({
        sql: `UPDATE users SET token_balance = COALESCE(token_balance, 0) + ? WHERE id = ?`,
        args: [simulator.tokensReward, ctx.user.id]
      });

      return {
        success: true,
        message: `Certificate issued! You earned ${simulator.tokensReward} tokens.`,
        certificateId: certResult.insertId,
        blockchainHash: blockchainData.hash,
        blockNumber: nextBlockNumber,
        tokensAwarded: simulator.tokensReward
      };
    }),

  // Get user's certificates
  getCertificates: protectedProcedure.query(async ({ ctx }) => {
    const results = await db.execute({
      sql: `SELECT id, certificate_type, title, description, blockchain_hash, block_number, issued_at
            FROM certificates
            WHERE user_id = ?
            ORDER BY issued_at DESC`,
      args: [ctx.user.id]
    });

    return results.rows.map((row: any) => ({
      id: row.id,
      certificateType: row.certificate_type,
      title: row.title,
      description: row.description,
      blockchainHash: row.blockchain_hash,
      blockNumber: row.block_number,
      issuedAt: row.issued_at,
      displayInfo: getCertificateDisplayInfo(row.certificate_type)
    }));
  }),

  // Get single certificate details
  getCertificate: protectedProcedure
    .input(z.object({ certificateId: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await db.execute({
        sql: `SELECT c.*, u.name as user_name
              FROM certificates c
              JOIN users u ON c.user_id = u.id
              WHERE c.id = ? AND c.user_id = ?`,
        args: [input.certificateId, ctx.user.id]
      });

      if (result.rows.length === 0) {
        return null;
      }

      const cert = result.rows[0] as any;
      return {
        id: cert.id,
        certificateType: cert.certificate_type,
        title: cert.title,
        description: cert.description,
        blockchainHash: cert.blockchain_hash,
        blockNumber: cert.block_number,
        issuedAt: cert.issued_at,
        userName: cert.user_name,
        displayInfo: getCertificateDisplayInfo(cert.certificate_type)
      };
    }),

  // Get certificate HTML for download/print
  getCertificateHtml: protectedProcedure
    .input(z.object({ certificateId: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await db.execute({
        sql: `SELECT c.*, u.name as user_name
              FROM certificates c
              JOIN users u ON c.user_id = u.id
              WHERE c.id = ? AND c.user_id = ?`,
        args: [input.certificateId, ctx.user.id]
      });

      if (result.rows.length === 0) {
        throw new Error("Certificate not found");
      }

      const cert = result.rows[0] as any;
      const displayInfo = getCertificateDisplayInfo(cert.certificate_type);

      return getCertificateTemplate(
        cert.user_name,
        cert.title,
        displayInfo?.title || cert.title,
        new Date(cert.issued_at),
        cert.blockchain_hash
      );
    }),

  // Verify certificate on blockchain
  verifyCertificate: protectedProcedure
    .input(z.object({ blockchainHash: z.string() }))
    .query(async ({ input }) => {
      const result = await db.execute({
        sql: `SELECT br.*, c.title, c.certificate_type, u.name as user_name
              FROM blockchain_records br
              LEFT JOIN certificates c ON br.hash = c.blockchain_hash
              LEFT JOIN users u ON c.user_id = u.id
              WHERE br.hash = ?`,
        args: [input.blockchainHash]
      });

      if (result.rows.length === 0) {
        return { verified: false, message: "Certificate not found on blockchain" };
      }

      const record = result.rows[0] as any;
      return {
        verified: true,
        message: "Certificate verified on LuvLedger blockchain",
        certificate: {
          title: record.title,
          certificateType: record.certificate_type,
          userName: record.user_name,
          blockNumber: record.block_number,
          timestamp: record.created_at
        }
      };
    }),

  // Get all certificates for profile display
  getProfileCertificates: protectedProcedure.query(async ({ ctx }) => {
    const results = await db.execute({
      sql: `SELECT certificate_type, title, issued_at, blockchain_hash
            FROM certificates
            WHERE user_id = ?
            ORDER BY issued_at DESC`,
      args: [ctx.user.id]
    });

    const certificates = results.rows.map((row: any) => ({
      certificateType: row.certificate_type,
      title: row.title,
      issuedAt: row.issued_at,
      blockchainHash: row.blockchain_hash,
      displayInfo: getCertificateDisplayInfo(row.certificate_type)
    }));

    const totalCertificates = certificates.length;
    const totalPossible = 9; // Total number of simulators

    return {
      certificates,
      totalCertificates,
      totalPossible,
      progressPercent: Math.round((totalCertificates / totalPossible) * 100)
    };
  })
});
