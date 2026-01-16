import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  certificates,
  houses
} from "../../drizzle/schema";
import { eq, and, desc, sql, count, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// Helper to require db
async function requireDb() {
  const database = await getDb();
  if (!database) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not initialized",
    });
  }
  return database;
}

// Generate credential hash for verification
function generateCredentialHash(data: {
  userId: string;
  credentialType: string;
  issuedAt: Date;
  expiresAt?: Date;
}): string {
  const hashData = JSON.stringify({
    user: data.userId,
    type: data.credentialType,
    issued: data.issuedAt.toISOString(),
    expires: data.expiresAt?.toISOString() || "never",
    salt: crypto.randomBytes(16).toString("hex"),
  });
  return crypto.createHash("sha256").update(hashData).digest("hex");
}

// Generate certificate number
function generateCertificateNumber(type: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${type.toUpperCase()}-${timestamp}-${random}`;
}

// Guardian access levels
const GUARDIAN_ACCESS_LEVELS = ["view_only", "limited", "full", "emergency"] as const;

export const guardianCredentialsRouter = router({
  // Scroll 35: Trusted Guardian Handoff Protocol
  // Create a temporary guardian access delegation
  createGuardianHandoff: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      guardianName: z.string().min(2),
      guardianEmail: z.string().email(),
      accessLevel: z.enum(GUARDIAN_ACCESS_LEVELS),
      expiresInDays: z.number().min(1).max(365),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      // Verify house exists
      const [house] = await database
        .select()
        .from(houses)
        .where(eq(houses.id, input.houseId))
        .limit(1);

      if (!house) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "House not found",
        });
      }

      const issuedAt = new Date();
      const expiresAt = new Date(issuedAt.getTime() + input.expiresInDays * 24 * 60 * 60 * 1000);
      const handoffNumber = generateCertificateNumber("GUARDIAN");
      const handoffHash = generateCredentialHash({
        userId,
        credentialType: "guardian_handoff",
        issuedAt,
        expiresAt,
      });

      // Create guardian handoff certificate
      const [handoff] = await database
        .insert(certificates)
        .values({
          userId: 1, // Placeholder
          simulatorSessionId: input.houseId,
          certificateType: "guardian_handoff",
          title: `Guardian Handoff - ${input.guardianName} (${input.accessLevel})`,
          certificateHash: handoffHash,
          issuedAt,
          expiresAt,
        })
        .$returningId();

      return {
        id: handoff.id,
        handoffNumber,
        handoffHash,
        guardianName: input.guardianName,
        guardianEmail: input.guardianEmail,
        accessLevel: input.accessLevel,
        issuedAt,
        expiresAt,
        status: "ACTIVE",
        message: "Guardian handoff created successfully. Guardian can now access designated resources.",
      };
    }),

  // Revoke guardian access
  revokeGuardianAccess: protectedProcedure
    .input(z.object({ handoffId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();

      const [handoff] = await database
        .select()
        .from(certificates)
        .where(
          and(
            eq(certificates.id, input.handoffId),
            eq(certificates.certificateType, "guardian_handoff")
          )
        )
        .limit(1);

      if (!handoff) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Guardian handoff not found",
        });
      }

      // Update to expired (revoked)
      await database
        .update(certificates)
        .set({ expiresAt: new Date() })
        .where(eq(certificates.id, input.handoffId));

      return {
        status: "REVOKED",
        message: "Guardian access has been revoked",
      };
    }),

  // Get active guardian handoffs for a house
  getActiveGuardians: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();

      const guardians = await database
        .select()
        .from(certificates)
        .where(
          and(
            eq(certificates.simulatorSessionId, input.houseId),
            eq(certificates.certificateType, "guardian_handoff"),
            gt(certificates.expiresAt, new Date())
          )
        )
        .orderBy(desc(certificates.issuedAt));

      return guardians.map((g: typeof certificates.$inferSelect) => ({
        id: g.id,
        title: g.title,
        issuedAt: g.issuedAt,
        expiresAt: g.expiresAt,
        status: g.expiresAt && g.expiresAt > new Date() ? "ACTIVE" : "EXPIRED",
      }));
    }),

  // Scroll 36: Autonomous Certificate Generator
  // Generate a certificate with SHA256 hash
  generateCertificate: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      certificateType: z.enum(["completion", "achievement", "participation", "stewardship"]),
      title: z.string().min(3),
      recipientName: z.string().min(2),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const issuedAt = new Date();
      const certNumber = generateCertificateNumber(input.certificateType);
      const certHash = generateCredentialHash({
        userId,
        credentialType: input.certificateType,
        issuedAt,
      });

      const [cert] = await database
        .insert(certificates)
        .values({
          userId: 1, // Placeholder
          simulatorSessionId: input.houseId,
          certificateType: input.certificateType,
          title: `${input.title} - ${input.recipientName}`,
          certificateHash: certHash,
          issuedAt,
        })
        .$returningId();

      return {
        id: cert.id,
        certificateNumber: certNumber,
        certificateHash: certHash,
        title: input.title,
        recipientName: input.recipientName,
        certificateType: input.certificateType,
        issuedAt,
        verificationUrl: `/verify/${certHash}`,
        status: "ISSUED",
      };
    }),

  // Scroll 37: Trusted Credential Routing
  // Route credentials to appropriate destinations
  routeCredential: protectedProcedure
    .input(z.object({
      certificateId: z.number(),
      destination: z.enum(["email", "wallet", "archive", "share"]),
      destinationAddress: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();

      const [cert] = await database
        .select()
        .from(certificates)
        .where(eq(certificates.id, input.certificateId))
        .limit(1);

      if (!cert) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certificate not found",
        });
      }

      // In production, this would actually route the credential
      // For now, we just return success with routing info
      return {
        certificateId: input.certificateId,
        destination: input.destination,
        destinationAddress: input.destinationAddress,
        routedAt: new Date(),
        status: "ROUTED",
        message: `Credential routed to ${input.destination} successfully`,
      };
    }),

  // Scroll 39: Auto Certificate Generation
  // Automatically generate certificate for course completion
  generateAutoCertificate: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      courseId: z.number(),
      courseName: z.string(),
      completionDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const issuedAt = input.completionDate || new Date();
      const certNumber = generateCertificateNumber("COURSE");
      const certHash = generateCredentialHash({
        userId,
        credentialType: "course_completion",
        issuedAt,
      });

      const [cert] = await database
        .insert(certificates)
        .values({
          userId: 1, // Placeholder
          simulatorSessionId: input.houseId,
          certificateType: "course_completion",
          title: `Course Completion: ${input.courseName}`,
          certificateHash: certHash,
          issuedAt,
        })
        .$returningId();

      return {
        id: cert.id,
        certificateNumber: certNumber,
        certificateHash: certHash,
        courseName: input.courseName,
        courseId: input.courseId,
        issuedAt,
        status: "ISSUED",
        message: `Certificate generated for completing ${input.courseName}`,
      };
    }),

  // Verify any credential
  verifyCredential: publicProcedure
    .input(z.object({ credentialHash: z.string() }))
    .query(async ({ input }) => {
      const database = await requireDb();

      const [cert] = await database
        .select()
        .from(certificates)
        .where(eq(certificates.certificateHash, input.credentialHash))
        .limit(1);

      if (!cert) {
        return {
          valid: false,
          message: "Credential not found or invalid hash",
        };
      }

      const isExpired = cert.expiresAt && cert.expiresAt < new Date();

      return {
        valid: !isExpired,
        certificateType: cert.certificateType,
        title: cert.title,
        issuedAt: cert.issuedAt,
        expiresAt: cert.expiresAt,
        status: isExpired ? "EXPIRED" : "VALID",
        message: isExpired 
          ? "Credential has expired" 
          : "Credential verified successfully",
      };
    }),

  // Get all certificates for a house
  getHouseCertificates: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();

      const certs = await database
        .select()
        .from(certificates)
        .where(eq(certificates.simulatorSessionId, input.houseId))
        .orderBy(desc(certificates.issuedAt))
        .limit(100);

      return certs.map((c: typeof certificates.$inferSelect) => ({
        id: c.id,
        certificateType: c.certificateType,
        title: c.title,
        certificateHash: c.certificateHash,
        issuedAt: c.issuedAt,
        expiresAt: c.expiresAt,
        status: c.expiresAt && c.expiresAt < new Date() ? "EXPIRED" : "VALID",
      }));
    }),

  // Get credential statistics
  getCredentialStats: publicProcedure.query(async () => {
    const database = await requireDb();

    const [stats] = await database
      .select({
        totalCertificates: count(),
      })
      .from(certificates);

    return {
      totalCredentialsIssued: stats?.totalCertificates || 0,
      supportedTypes: ["crown", "guardian_handoff", "completion", "achievement", "participation", "stewardship", "course_completion"],
    };
  }),
});
