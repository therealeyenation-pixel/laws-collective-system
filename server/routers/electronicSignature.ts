import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { electronicSignatures, signatureAuditLog } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

// Generate a unique verification code
function generateVerificationCode(): string {
  return crypto.randomBytes(16).toString("hex");
}

// Generate signature hash for integrity verification
function generateSignatureHash(data: {
  signerId: number;
  signerName: string;
  documentType: string;
  documentId: number;
  timestamp: string;
}): string {
  const payload = JSON.stringify(data);
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export const electronicSignatureRouter = router({
  // Sign a document
  sign: protectedProcedure
    .input(
      z.object({
        documentType: z.string(),
        documentId: z.number(),
        documentTitle: z.string().optional(),
        signatureStatement: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const user = ctx.user;
      const timestamp = new Date().toISOString();

      // Generate signature data
      const signatureData = JSON.stringify({
        statement: input.signatureStatement || "I acknowledge and agree to the terms of this document.",
        signedBy: user.name || "Unknown User",
        signedAt: timestamp,
        documentType: input.documentType,
        documentId: input.documentId,
      });

      // Generate hash for integrity
      const signatureHash = generateSignatureHash({
        signerId: user.id,
        signerName: user.name || "Unknown User",
        documentType: input.documentType,
        documentId: input.documentId,
        timestamp,
      });

      const verificationCode = generateVerificationCode();

      // Insert signature
      const result = await db.insert(electronicSignatures).values({
        signerId: user.id,
        signerName: user.name || "Unknown User",
        signerEmail: user.email || null,
        documentType: input.documentType,
        documentId: input.documentId,
        documentTitle: input.documentTitle || null,
        signatureData,
        signatureHash,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        verificationCode,
        isVerified: true,
      });

      const signatureId = (result as any).insertId || (result as any)[0]?.insertId || 1;

      // Log the signature action
      await db.insert(signatureAuditLog).values({
        signatureId,
        action: "SIGNED",
        actionBy: user.id,
        actionDetails: JSON.stringify({
          documentType: input.documentType,
          documentId: input.documentId,
          documentTitle: input.documentTitle,
        }),
        ipAddress: input.ipAddress || null,
      });

      return {
        success: true,
        signatureId,
        verificationCode,
        signedAt: timestamp,
        signerName: user.name,
      };
    }),

  // Verify a signature
  verify: publicProcedure
    .input(
      z.object({
        verificationCode: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();

      const [signature] = await db
        .select()
        .from(electronicSignatures)
        .where(eq(electronicSignatures.verificationCode, input.verificationCode))
        .limit(1);

      if (!signature) {
        return { valid: false, message: "Signature not found" };
      }

      // Verify the hash
      const expectedHash = generateSignatureHash({
        signerId: signature.signerId,
        signerName: signature.signerName,
        documentType: signature.documentType,
        documentId: signature.documentId,
        timestamp: signature.signedAt.toISOString(),
      });

      const hashValid = signature.signatureHash === expectedHash;

      return {
        valid: hashValid && signature.isVerified,
        signature: {
          signerName: signature.signerName,
          signerEmail: signature.signerEmail,
          documentType: signature.documentType,
          documentTitle: signature.documentTitle,
          signedAt: signature.signedAt,
          verificationCode: signature.verificationCode,
        },
      };
    }),

  // Get signature for a document
  getForDocument: protectedProcedure
    .input(
      z.object({
        documentType: z.string(),
        documentId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();

      const signatures = await db
        .select()
        .from(electronicSignatures)
        .where(
          and(
            eq(electronicSignatures.documentType, input.documentType),
            eq(electronicSignatures.documentId, input.documentId)
          )
        )
        .orderBy(desc(electronicSignatures.signedAt));

      return signatures;
    }),

  // Get user's signature for a document
  getUserSignature: protectedProcedure
    .input(
      z.object({
        documentType: z.string(),
        documentId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();

      const [signature] = await db
        .select()
        .from(electronicSignatures)
        .where(
          and(
            eq(electronicSignatures.documentType, input.documentType),
            eq(electronicSignatures.documentId, input.documentId),
            eq(electronicSignatures.signerId, ctx.user.id)
          )
        )
        .orderBy(desc(electronicSignatures.signedAt))
        .limit(1);

      return signature || null;
    }),

  // Get all signatures by user
  getMySignatures: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();

      const signatures = await db
        .select()
        .from(electronicSignatures)
        .where(eq(electronicSignatures.signerId, ctx.user.id))
        .orderBy(desc(electronicSignatures.signedAt))
        .limit(input.limit)
        .offset(input.offset);

      return signatures;
    }),

  // Get audit log for a signature
  getAuditLog: protectedProcedure
    .input(
      z.object({
        signatureId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();

      const logs = await db
        .select()
        .from(signatureAuditLog)
        .where(eq(signatureAuditLog.signatureId, input.signatureId))
        .orderBy(desc(signatureAuditLog.createdAt));

      return logs;
    }),
});
