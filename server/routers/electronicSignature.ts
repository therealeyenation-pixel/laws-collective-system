import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { electronicSignatures, signatureAuditLog, operatingProcedures, notifications } from "../../drizzle/schema";
import { eq, and, desc, lt, isNotNull, sql, gte, lte, inArray } from "drizzle-orm";
import crypto from "crypto";
import {
  processExpirationNotifications,
  getUsersWithExpiringSignatures,
  sendBulkReAcknowledgmentRequests,
} from "../services/signatureExpirationNotifier";

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

// Calculate expiration date based on document type
function calculateExpirationDate(documentType: string, requiresAnnualReAck: boolean): Date | null {
  if (!requiresAnnualReAck) return null;
  
  // Critical procedures require annual re-acknowledgment
  const criticalTypes = [
    "procedure_acknowledgment",
    "safety_policy",
    "compliance_policy",
    "security_policy",
    "confidentiality_agreement",
    "code_of_conduct",
    "ethics_policy",
  ];
  
  if (criticalTypes.includes(documentType) || requiresAnnualReAck) {
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    return expirationDate;
  }
  
  return null;
}

export const electronicSignatureRouter = router({
  // Sign a document with optional expiration
  sign: protectedProcedure
    .input(
      z.object({
        documentType: z.string(),
        documentId: z.number(),
        documentTitle: z.string().optional(),
        signatureStatement: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        requiresAnnualReAck: z.boolean().optional().default(false),
        customExpirationDays: z.number().optional(),
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
      
      // Calculate expiration date
      let expiresAt: Date | null = null;
      if (input.customExpirationDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.customExpirationDays);
      } else {
        expiresAt = calculateExpirationDate(input.documentType, input.requiresAnnualReAck || false);
      }

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
        expiresAt,
        requiresReAcknowledgment: input.requiresAnnualReAck || false,
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
          expiresAt: expiresAt?.toISOString(),
        }),
        ipAddress: input.ipAddress || null,
      });

      return {
        success: true,
        signatureId,
        verificationCode,
        signedAt: timestamp,
        signerName: user.name,
        expiresAt: expiresAt?.toISOString(),
      };
    }),

  // Verify a signature (includes expiration check)
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
      
      // Check if signature has expired
      const isExpired = signature.expiresAt ? new Date(signature.expiresAt) < new Date() : false;

      return {
        valid: hashValid && signature.isVerified,
        isExpired,
        message: isExpired 
          ? "Signature is valid but has expired and requires re-acknowledgment" 
          : hashValid && signature.isVerified 
            ? "Signature verified successfully" 
            : "Signature verification failed",
        signature: {
          signerName: signature.signerName,
          signerEmail: signature.signerEmail,
          documentType: signature.documentType,
          documentTitle: signature.documentTitle,
          signedAt: signature.signedAt,
          verificationCode: signature.verificationCode,
          expiresAt: signature.expiresAt,
          requiresReAcknowledgment: signature.requiresReAcknowledgment,
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

      // Add expiration status to each signature
      return signatures.map(sig => ({
        ...sig,
        isExpired: sig.expiresAt ? new Date(sig.expiresAt) < new Date() : false,
      }));
    }),

  // Get user's signature for a document (with expiration check)
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

      if (!signature) return null;
      
      return {
        ...signature,
        isExpired: signature.expiresAt ? new Date(signature.expiresAt) < new Date() : false,
      };
    }),

  // Get all signatures by user
  getMySignatures: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
        includeExpired: z.boolean().optional().default(true),
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

      return signatures.map(sig => ({
        ...sig,
        isExpired: sig.expiresAt ? new Date(sig.expiresAt) < new Date() : false,
      }));
    }),

  // Get expiring signatures (within next 30 days)
  getExpiringSoon: protectedProcedure
    .input(
      z.object({
        daysAhead: z.number().optional().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + input.daysAhead);

      const signatures = await db
        .select()
        .from(electronicSignatures)
        .where(
          and(
            eq(electronicSignatures.signerId, ctx.user.id),
            isNotNull(electronicSignatures.expiresAt),
            sql`${electronicSignatures.expiresAt} > ${now.toISOString()}`,
            sql`${electronicSignatures.expiresAt} <= ${futureDate.toISOString()}`
          )
        )
        .orderBy(electronicSignatures.expiresAt);

      return signatures.map(sig => ({
        ...sig,
        daysUntilExpiration: sig.expiresAt 
          ? Math.ceil((new Date(sig.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      }));
    }),

  // Get expired signatures requiring re-acknowledgment
  getExpiredRequiringReAck: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      
      const now = new Date();

      const signatures = await db
        .select()
        .from(electronicSignatures)
        .where(
          and(
            eq(electronicSignatures.signerId, ctx.user.id),
            eq(electronicSignatures.requiresReAcknowledgment, true),
            isNotNull(electronicSignatures.expiresAt),
            lt(electronicSignatures.expiresAt, now)
          )
        )
        .orderBy(electronicSignatures.expiresAt);

      return signatures;
    }),

  // Get signature compliance dashboard stats
  getComplianceStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const allSignatures = await db
        .select()
        .from(electronicSignatures)
        .where(eq(electronicSignatures.signerId, ctx.user.id));

      const totalSignatures = allSignatures.length;
      const expiredCount = allSignatures.filter(
        sig => sig.expiresAt && new Date(sig.expiresAt) < now
      ).length;
      const expiringSoonCount = allSignatures.filter(
        sig => sig.expiresAt && 
          new Date(sig.expiresAt) >= now && 
          new Date(sig.expiresAt) <= thirtyDaysFromNow
      ).length;
      const activeCount = allSignatures.filter(
        sig => !sig.expiresAt || new Date(sig.expiresAt) > now
      ).length;
      const requiresReAckCount = allSignatures.filter(
        sig => sig.requiresReAcknowledgment && sig.expiresAt && new Date(sig.expiresAt) < now
      ).length;

      return {
        totalSignatures,
        activeCount,
        expiredCount,
        expiringSoonCount,
        requiresReAckCount,
        complianceRate: totalSignatures > 0 
          ? Math.round((activeCount / totalSignatures) * 100) 
          : 100,
      };
    }),

  // Re-acknowledge an expired signature
  reAcknowledge: protectedProcedure
    .input(
      z.object({
        originalSignatureId: z.number(),
        signatureStatement: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const user = ctx.user;

      // Get the original signature
      const [originalSignature] = await db
        .select()
        .from(electronicSignatures)
        .where(eq(electronicSignatures.id, input.originalSignatureId))
        .limit(1);

      if (!originalSignature) {
        throw new Error("Original signature not found");
      }

      if (originalSignature.signerId !== user.id) {
        throw new Error("You can only re-acknowledge your own signatures");
      }

      const timestamp = new Date().toISOString();

      // Generate new signature data
      const signatureData = JSON.stringify({
        statement: input.signatureStatement || "I re-acknowledge and confirm my continued agreement to the terms of this document.",
        signedBy: user.name || "Unknown User",
        signedAt: timestamp,
        documentType: originalSignature.documentType,
        documentId: originalSignature.documentId,
        reAcknowledgmentOf: originalSignature.id,
      });

      // Generate new hash
      const signatureHash = generateSignatureHash({
        signerId: user.id,
        signerName: user.name || "Unknown User",
        documentType: originalSignature.documentType,
        documentId: originalSignature.documentId,
        timestamp,
      });

      const verificationCode = generateVerificationCode();
      
      // Calculate new expiration (1 year from now)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // Insert new signature
      const result = await db.insert(electronicSignatures).values({
        signerId: user.id,
        signerName: user.name || "Unknown User",
        signerEmail: user.email || null,
        documentType: originalSignature.documentType,
        documentId: originalSignature.documentId,
        documentTitle: originalSignature.documentTitle,
        signatureData,
        signatureHash,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        verificationCode,
        isVerified: true,
        expiresAt,
        requiresReAcknowledgment: true,
      });

      const signatureId = (result as any).insertId || (result as any)[0]?.insertId || 1;

      // Log the re-acknowledgment action
      await db.insert(signatureAuditLog).values({
        signatureId,
        action: "RE_ACKNOWLEDGED",
        actionBy: user.id,
        actionDetails: JSON.stringify({
          originalSignatureId: originalSignature.id,
          documentType: originalSignature.documentType,
          documentId: originalSignature.documentId,
          documentTitle: originalSignature.documentTitle,
          previousExpiresAt: originalSignature.expiresAt?.toISOString(),
          newExpiresAt: expiresAt.toISOString(),
        }),
        ipAddress: input.ipAddress || null,
      });

      return {
        success: true,
        signatureId,
        verificationCode,
        signedAt: timestamp,
        expiresAt: expiresAt.toISOString(),
      };
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

  // Process expiration notifications (admin/scheduled job)
  processExpirationNotifications: protectedProcedure
    .mutation(async () => {
      const result = await processExpirationNotifications();
      return result;
    }),

  // Get users with expiring signatures (admin dashboard)
  getUsersWithExpiringSignatures: protectedProcedure
    .input(
      z.object({
        daysAhead: z.number().optional().default(30),
      })
    )
    .query(async ({ input }) => {
      const result = await getUsersWithExpiringSignatures(input.daysAhead);
      return result;
    }),

  // Send bulk re-acknowledgment requests (admin)
  sendBulkReAcknowledgmentRequests: protectedProcedure
    .input(
      z.object({
        signatureIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      const result = await sendBulkReAcknowledgmentRequests(input.signatureIds);
      return result;
    }),

  // Get notification history for a signature
  getNotificationHistory: protectedProcedure
    .input(
      z.object({
        signatureId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();

      const notifs = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.referenceType, "signature"),
            eq(notifications.referenceId, input.signatureId)
          )
        )
        .orderBy(desc(notifications.createdAt));

      return notifs;
    }),

  // Get all expiring signatures for admin dashboard
  getAllExpiring: protectedProcedure
    .input(
      z.object({
        daysAhead: z.number().optional().default(30),
        includeExpired: z.boolean().optional().default(true),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + input.daysAhead);

      let conditions;
      if (input.includeExpired) {
        conditions = and(
          eq(electronicSignatures.requiresReAcknowledgment, true),
          isNotNull(electronicSignatures.expiresAt),
          lte(electronicSignatures.expiresAt, futureDate)
        );
      } else {
        conditions = and(
          eq(electronicSignatures.requiresReAcknowledgment, true),
          isNotNull(electronicSignatures.expiresAt),
          gte(electronicSignatures.expiresAt, now),
          lte(electronicSignatures.expiresAt, futureDate)
        );
      }

      const signatures = await db
        .select()
        .from(electronicSignatures)
        .where(conditions)
        .orderBy(electronicSignatures.expiresAt);

      return signatures.map(sig => ({
        ...sig,
        isExpired: sig.expiresAt ? new Date(sig.expiresAt) < now : false,
        daysUntilExpiration: sig.expiresAt
          ? Math.ceil((new Date(sig.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      }));
    }),
});
