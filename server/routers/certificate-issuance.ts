/**
 * Certificate Issuance Router
 * Phase 10.6: Certificate Issuance Workflows
 * 
 * Provides tRPC procedures for certificate management including:
 * - Issuing certificates for various achievements
 * - Verifying certificates via hash
 * - Retrieving user certificates
 * - Certificate eligibility checks
 * - Certificate revocation (admin only)
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  issueCertificate,
  issueCourseCompletionCertificate,
  issueMasteryCertificate,
  verifyCertificate,
  getUserCertificates,
  checkCertificateEligibility,
  revokeCertificate,
  CertificateType,
} from "../services/certificate-issuance";
import { getDb } from "../db";
import { certificates, simulatorCertificates, courseCompletionCertificates, users } from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

// Certificate type enum for validation
const certificateTypeSchema = z.enum([
  "simulator_completion",
  "course_completion",
  "mastery_certificate",
  "member_credential",
  "house_graduation",
  "language_mastery",
  "stem_mastery",
  "sovereign_diploma",
  "internship_completion",
  "contractor_certification",
]);

export const certificateIssuanceRouter = router({
  /**
   * Issue a general certificate
   */
  issue: protectedProcedure
    .input(
      z.object({
        certificateType: certificateTypeSchema,
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
        entityId: z.number().optional(),
        simulatorId: z.string().optional(),
        courseId: z.number().optional(),
        score: z.number().optional(),
        tokensEarned: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check eligibility first
      const eligibility = await checkCertificateEligibility(
        ctx.user.id,
        input.certificateType as CertificateType,
        input.simulatorId ? parseInt(input.simulatorId) : input.courseId
      );

      if (!eligibility.eligible) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: eligibility.reason,
        });
      }

      const result = await issueCertificate({
        userId: ctx.user.id,
        certificateType: input.certificateType as CertificateType,
        title: input.title,
        description: input.description,
        metadata: input.metadata,
        entityId: input.entityId,
        simulatorId: input.simulatorId,
        courseId: input.courseId,
        score: input.score,
        tokensEarned: input.tokensEarned,
      });

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.message,
        });
      }

      return result;
    }),

  /**
   * Issue a course completion certificate
   */
  issueCourseCompletion: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        courseName: z.string(),
        score: z.number().min(0).max(100),
        tokensEarned: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check eligibility
      const eligibility = await checkCertificateEligibility(
        ctx.user.id,
        "course_completion",
        input.courseId
      );

      if (!eligibility.eligible) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: eligibility.reason,
        });
      }

      const result = await issueCourseCompletionCertificate(
        ctx.user.id,
        input.courseId,
        input.courseName,
        input.score,
        input.tokensEarned
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.message,
        });
      }

      return result;
    }),

  /**
   * Issue a mastery certificate
   */
  issueMastery: protectedProcedure
    .input(
      z.object({
        studentProfileId: z.number(),
        certificateType: z.enum([
          "course_completion",
          "house_graduation",
          "language_mastery",
          "stem_mastery",
          "sovereign_diploma",
        ]),
        title: z.string(),
        description: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await issueMasteryCertificate(
        input.studentProfileId,
        input.certificateType,
        input.title,
        input.description,
        input.metadata
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.message,
        });
      }

      return result;
    }),

  /**
   * Verify a certificate by hash (public endpoint)
   */
  verify: publicProcedure
    .input(z.object({ certificateHash: z.string() }))
    .query(async ({ input }) => {
      return verifyCertificate(input.certificateHash);
    }),

  /**
   * Get all certificates for the current user
   */
  getMyCertificates: protectedProcedure.query(async ({ ctx }) => {
    return getUserCertificates(ctx.user.id);
  }),

  /**
   * Get certificates for a specific user (admin only)
   */
  getUserCertificates: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can view other users' certificates",
        });
      }

      return getUserCertificates(input.userId);
    }),

  /**
   * Check certificate eligibility
   */
  checkEligibility: protectedProcedure
    .input(
      z.object({
        certificateType: certificateTypeSchema,
        referenceId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return checkCertificateEligibility(
        ctx.user.id,
        input.certificateType as CertificateType,
        input.referenceId
      );
    }),

  /**
   * Revoke a certificate (admin only)
   */
  revoke: protectedProcedure
    .input(
      z.object({
        certificateId: z.number(),
        certificateType: certificateTypeSchema,
        reason: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can revoke certificates",
        });
      }

      const result = await revokeCertificate(
        input.certificateId,
        input.certificateType as CertificateType,
        input.reason,
        ctx.user.id
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.message,
        });
      }

      return result;
    }),

  /**
   * Get certificate statistics
   */
  getStatistics: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const [generalCerts, simCerts, courseCerts] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(certificates),
      db.select({ count: sql<number>`count(*)` }).from(simulatorCertificates),
      db.select({ count: sql<number>`count(*)` }).from(courseCompletionCertificates),
    ]);

    return {
      totalCertificates:
        Number(generalCerts[0]?.count || 0) +
        Number(simCerts[0]?.count || 0) +
        Number(courseCerts[0]?.count || 0),
      generalCertificates: Number(generalCerts[0]?.count || 0),
      simulatorCertificates: Number(simCerts[0]?.count || 0),
      courseCompletionCertificates: Number(courseCerts[0]?.count || 0),
    };
  }),

  /**
   * Get recent certificates (for dashboard)
   */
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const recentCerts = await db
        .select({
          id: certificates.id,
          userId: certificates.userId,
          certificateType: certificates.certificateType,
          title: certificates.title,
          issuedAt: certificates.issuedAt,
          certificateHash: certificates.certificateHash,
        })
        .from(certificates)
        .orderBy(desc(certificates.issuedAt))
        .limit(input.limit);

      return recentCerts;
    }),

  /**
   * Get certificate by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const [cert] = await db
        .select()
        .from(certificates)
        .where(eq(certificates.id, input.id));

      if (!cert) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certificate not found",
        });
      }

      // Only allow viewing own certificates unless admin
      if (cert.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own certificates",
        });
      }

      return cert;
    }),

  /**
   * Get certificate types available
   */
  getTypes: protectedProcedure.query(() => {
    return [
      { id: "simulator_completion", name: "Simulator Completion", description: "Awarded upon completing all modules of a simulator" },
      { id: "course_completion", name: "Course Completion", description: "Awarded upon completing an Academy course" },
      { id: "mastery_certificate", name: "Mastery Certificate", description: "Awarded for demonstrating mastery in a subject area" },
      { id: "member_credential", name: "Member Credential", description: "The The L.A.W.S. Collective membership credential" },
      { id: "house_graduation", name: "House Graduation", description: "Awarded upon completing House requirements" },
      { id: "language_mastery", name: "Language Mastery", description: "Awarded for achieving language proficiency" },
      { id: "stem_mastery", name: "STEM Mastery", description: "Awarded for STEM subject mastery" },
      { id: "sovereign_diploma", name: "Sovereign Diploma", description: "The highest Academy achievement" },
      { id: "internship_completion", name: "Internship Completion", description: "Awarded upon completing an internship program" },
      { id: "contractor_certification", name: "Contractor Certification", description: "Certification for contractor status" },
    ];
  }),
});
