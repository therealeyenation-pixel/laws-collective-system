import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  giftTokens, 
  giftActivationAttempts, 
  giftSaleRatios,
  scrollSealStatus
} from "../../drizzle/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// Stewardship scrolls required for gift activation (from Scroll 25)
const STEWARDSHIP_SCROLLS = [7, 14, 16, 25, 26, 27, 28, 29, 30, 31, 32, 33];

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

// Generate gift hash for verification
function generateGiftHash(giftData: {
  sourceUserId: string;
  targetEmail?: string;
  giftType: string;
  giftValue?: string;
  createdAt: Date;
}): string {
  const data = JSON.stringify({
    source: giftData.sourceUserId,
    target: giftData.targetEmail,
    type: giftData.giftType,
    value: giftData.giftValue,
    timestamp: giftData.createdAt.toISOString(),
  });
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Check if user has completed stewardship scrolls
async function checkStewardshipScrolls(
  database: Awaited<ReturnType<typeof getDb>> & {},
  userId: string,
  houseId: number
): Promise<{ complete: boolean; sealed: number[]; missing: number[] }> {
  const sealedRecords = await database
    .select()
    .from(scrollSealStatus)
    .where(
      and(
        eq(scrollSealStatus.userId, userId),
        eq(scrollSealStatus.houseId, houseId),
        eq(scrollSealStatus.isSealed, true)
      )
    );

  const sealedNumbers = sealedRecords.map((r: { scrollNumber: number }) => r.scrollNumber);
  const sealed = STEWARDSHIP_SCROLLS.filter((s) => sealedNumbers.includes(s));
  const missing = STEWARDSHIP_SCROLLS.filter((s) => !sealedNumbers.includes(s));

  return {
    complete: missing.length === 0,
    sealed,
    missing,
  };
}

export const giftingSystemRouter = router({
  // Get all gifts for a user (sent and received)
  getGifts: protectedProcedure
    .input(z.object({ 
      houseId: z.number(),
      type: z.enum(["sent", "received", "all"]).default("all")
    }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      let gifts;
      if (input.type === "sent") {
        gifts = await database
          .select()
          .from(giftTokens)
          .where(eq(giftTokens.sourceUserId, userId))
          .orderBy(desc(giftTokens.createdAt));
      } else if (input.type === "received") {
        gifts = await database
          .select()
          .from(giftTokens)
          .where(eq(giftTokens.targetUserId, userId))
          .orderBy(desc(giftTokens.createdAt));
      } else {
        // Get both sent and received
        const sent = await database
          .select()
          .from(giftTokens)
          .where(eq(giftTokens.sourceUserId, userId))
          .orderBy(desc(giftTokens.createdAt));
        
        const received = await database
          .select()
          .from(giftTokens)
          .where(eq(giftTokens.targetUserId, userId))
          .orderBy(desc(giftTokens.createdAt));

        gifts = [...sent, ...received].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      return gifts;
    }),

  // Create a Mirror Gift (bloodline only - Scroll 25)
  createMirrorGift: protectedProcedure
    .input(
      z.object({
        sourceHouseId: z.number(),
        targetUserId: z.string().optional(),
        targetEmail: z.string().email().optional(),
        targetName: z.string().optional(),
        giftValue: z.string().optional(),
        giftDescription: z.string().optional(),
        giftMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      // Mirror gifts require lineage verification
      const giftData = {
        sourceUserId: userId,
        sourceHouseId: input.sourceHouseId,
        targetUserId: input.targetUserId,
        targetEmail: input.targetEmail,
        targetName: input.targetName,
        giftType: "mirror" as const,
        giftValue: input.giftValue,
        giftDescription: input.giftDescription,
        giftMessage: input.giftMessage,
        requiresLineageVerification: true,
        lineageVerified: false,
        giftStatus: "pending" as const,
        createdAt: new Date(),
      };

      const giftHash = generateGiftHash({
        sourceUserId: userId,
        targetEmail: input.targetEmail,
        giftType: "mirror",
        giftValue: input.giftValue,
        createdAt: giftData.createdAt,
      });

      const [gift] = await database
        .insert(giftTokens)
        .values({
          ...giftData,
          giftHash,
        })
        .$returningId();

      return {
        id: gift.id,
        giftHash,
        status: "pending",
        message: "Mirror Gift created. Awaiting lineage verification.",
      };
    }),

  // Create an Adaptive Gift (trusted non-blood - Scroll 25)
  createAdaptiveGift: protectedProcedure
    .input(
      z.object({
        sourceHouseId: z.number(),
        targetUserId: z.string().optional(),
        targetEmail: z.string().email().optional(),
        targetName: z.string().optional(),
        giftValue: z.string().optional(),
        giftDescription: z.string().optional(),
        giftMessage: z.string().optional(),
        requiresStewardshipScrolls: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      // Check if user can gift (2:1 rule - 2 sales before gifting)
      const [ratio] = await database
        .select()
        .from(giftSaleRatios)
        .where(eq(giftSaleRatios.houseId, input.sourceHouseId))
        .limit(1);

      if (ratio && ratio.giftingBlocked) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Gifting is blocked: ${ratio.blockReason || 'Gift/Sale ratio not met.'}`,
        });
      }

      const giftData = {
        sourceUserId: userId,
        sourceHouseId: input.sourceHouseId,
        targetUserId: input.targetUserId,
        targetEmail: input.targetEmail,
        targetName: input.targetName,
        giftType: "adaptive" as const,
        giftValue: input.giftValue,
        giftDescription: input.giftDescription,
        giftMessage: input.giftMessage,
        requiresStewardshipScrolls: input.requiresStewardshipScrolls,
        requiredScrolls: input.requiresStewardshipScrolls ? STEWARDSHIP_SCROLLS : null,
        giftStatus: "pending" as const,
        createdAt: new Date(),
      };

      const giftHash = generateGiftHash({
        sourceUserId: userId,
        targetEmail: input.targetEmail,
        giftType: "adaptive",
        giftValue: input.giftValue,
        createdAt: giftData.createdAt,
      });

      const [gift] = await database
        .insert(giftTokens)
        .values({
          ...giftData,
          giftHash,
        })
        .$returningId();

      // Update gift/sale ratio
      if (ratio) {
        await database
          .update(giftSaleRatios)
          .set({
            totalGiftsIssued: sql`${giftSaleRatios.totalGiftsIssued} + 1`,
            currentRatio: sql`${giftSaleRatios.totalSalesCompleted} / NULLIF(${giftSaleRatios.totalGiftsIssued} + 1, 0)`,
          })
          .where(eq(giftSaleRatios.houseId, input.sourceHouseId));
      }

      return {
        id: gift.id,
        giftHash,
        status: "pending",
        message: "Adaptive Gift created successfully.",
      };
    }),

  // Create a Locked Gift (time-delayed - Scroll 25)
  createLockedGift: protectedProcedure
    .input(
      z.object({
        sourceHouseId: z.number(),
        targetUserId: z.string().optional(),
        targetEmail: z.string().email().optional(),
        targetName: z.string().optional(),
        giftValue: z.string().optional(),
        giftDescription: z.string().optional(),
        giftMessage: z.string().optional(),
        lockDurationDays: z.number().min(1).max(3650), // Up to 10 years
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const lockExpiresAt = new Date(
        Date.now() + input.lockDurationDays * 24 * 60 * 60 * 1000
      );

      const giftData = {
        sourceUserId: userId,
        sourceHouseId: input.sourceHouseId,
        targetUserId: input.targetUserId,
        targetEmail: input.targetEmail,
        targetName: input.targetName,
        giftType: "locked" as const,
        giftValue: input.giftValue,
        giftDescription: input.giftDescription,
        giftMessage: input.giftMessage,
        lockDurationDays: input.lockDurationDays,
        lockExpiresAt,
        giftStatus: "awaiting_activation" as const,
        createdAt: new Date(),
      };

      const giftHash = generateGiftHash({
        sourceUserId: userId,
        targetEmail: input.targetEmail,
        giftType: "locked",
        giftValue: input.giftValue,
        createdAt: giftData.createdAt,
      });

      const [gift] = await database
        .insert(giftTokens)
        .values({
          ...giftData,
          giftHash,
        })
        .$returningId();

      return {
        id: gift.id,
        giftHash,
        lockExpiresAt,
        status: "awaiting_activation",
        message: `Locked Gift created. Will unlock on ${lockExpiresAt.toISOString()}.`,
      };
    }),

  // Attempt to activate/claim a gift
  activateGift: protectedProcedure
    .input(z.object({ giftId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const [gift] = await database
        .select()
        .from(giftTokens)
        .where(eq(giftTokens.id, input.giftId))
        .limit(1);

      if (!gift) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gift not found",
        });
      }

      // Check if user is the recipient
      if (gift.targetUserId && gift.targetUserId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the recipient of this gift",
        });
      }

      // Validation checks
      let anniversaryMet = true;
      let scrollsComplete = true;
      let lineageVerified = true;
      let lockExpired = true;
      const issues: string[] = [];

      // Check anniversary requirement
      if (gift.requiresAnniversary && gift.anniversaryDate) {
        anniversaryMet = new Date() >= gift.anniversaryDate;
        if (!anniversaryMet) {
          issues.push(`Anniversary date not reached (${gift.anniversaryDate.toISOString()})`);
        }
      }

      // Check stewardship scrolls requirement
      if (gift.requiresStewardshipScrolls && gift.sourceHouseId) {
        const scrollCheck = await checkStewardshipScrolls(
          database,
          userId,
          gift.sourceHouseId
        );
        scrollsComplete = scrollCheck.complete;
        if (!scrollsComplete) {
          issues.push(`Missing stewardship scrolls: ${scrollCheck.missing.join(", ")}`);
        }
      }

      // Check lineage verification for Mirror gifts
      if (gift.giftType === "mirror" && gift.requiresLineageVerification) {
        lineageVerified = gift.lineageVerified === true;
        if (!lineageVerified) {
          issues.push("Lineage verification required for Mirror Gift");
        }
      }

      // Check lock expiration for Locked gifts
      if (gift.giftType === "locked" && gift.lockExpiresAt) {
        lockExpired = new Date() >= gift.lockExpiresAt;
        if (!lockExpired) {
          issues.push(`Lock expires on ${gift.lockExpiresAt.toISOString()}`);
        }
      }

      const canActivate = anniversaryMet && scrollsComplete && lineageVerified && lockExpired;

      // Record the attempt
      await database.insert(giftActivationAttempts).values({
        giftId: input.giftId,
        userId,
        attemptStatus: canActivate ? "approved" : "denied",
        anniversaryMet,
        scrollsComplete,
        lineageVerified,
        lockExpired,
        resultMessage: canActivate
          ? "Gift activated successfully"
          : `Activation denied: ${issues.join("; ")}`,
      });

      if (canActivate) {
        await database
          .update(giftTokens)
          .set({
            giftStatus: "claimed",
            claimedAt: new Date(),
            targetUserId: userId,
          })
          .where(eq(giftTokens.id, input.giftId));

        return {
          status: "CLAIMED" as const,
          message: "Gift claimed successfully!",
        };
      }

      return {
        status: "DENIED" as const,
        message: `Cannot activate gift: ${issues.join("; ")}`,
        issues,
      };
    }),

  // Verify lineage for Mirror Gift (admin/guardian action)
  verifyLineage: protectedProcedure
    .input(
      z.object({
        giftId: z.number(),
        verified: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      await database
        .update(giftTokens)
        .set({
          lineageVerified: input.verified,
          lineageVerifiedAt: input.verified ? new Date() : null,
          lineageVerifiedBy: input.verified ? userId : null,
          giftStatus: input.verified ? "awaiting_activation" : "pending",
        })
        .where(eq(giftTokens.id, input.giftId));

      return {
        status: input.verified ? "VERIFIED" : "REJECTED",
        message: input.verified
          ? "Lineage verified. Gift can now be activated."
          : "Lineage verification rejected.",
      };
    }),

  // Revoke a gift (sender only)
  revokeGift: protectedProcedure
    .input(
      z.object({
        giftId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const [gift] = await database
        .select()
        .from(giftTokens)
        .where(eq(giftTokens.id, input.giftId))
        .limit(1);

      if (!gift) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gift not found",
        });
      }

      if (gift.sourceUserId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the gift sender can revoke",
        });
      }

      if (gift.giftStatus === "claimed") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot revoke a claimed gift",
        });
      }

      await database
        .update(giftTokens)
        .set({
          giftStatus: "revoked",
          revokedAt: new Date(),
          revokeReason: input.reason,
        })
        .where(eq(giftTokens.id, input.giftId));

      return {
        status: "REVOKED",
        message: "Gift has been revoked.",
      };
    }),

  // Get gift/sale ratio for a house
  getGiftSaleRatio: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();

      const [ratio] = await database
        .select()
        .from(giftSaleRatios)
        .where(eq(giftSaleRatios.houseId, input.houseId))
        .limit(1);

      if (!ratio) {
        // Initialize ratio tracking for this house
        const [newRatio] = await database
          .insert(giftSaleRatios)
          .values({
            houseId: input.houseId,
          })
          .$returningId();

        return {
          id: newRatio.id,
          houseId: input.houseId,
          totalSalesCompleted: 0,
          totalGiftsIssued: 0,
          currentRatio: 0,
          globalRatioTarget: 3.0,
          houseRatioTarget: 2.0,
          isCompliant: true,
          giftingBlocked: false,
          canGift: false,
        };
      }

      return {
        ...ratio,
        currentRatio: parseFloat(ratio.currentRatio || "0"),
        globalRatioTarget: parseFloat(ratio.globalRatioTarget || "3.0"),
        houseRatioTarget: parseFloat(ratio.houseRatioTarget || "2.0"),
        canGift: !ratio.giftingBlocked,
      };
    }),

  // Record a sale (updates gift/sale ratio)
  recordSale: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();

      const [ratio] = await database
        .select()
        .from(giftSaleRatios)
        .where(eq(giftSaleRatios.houseId, input.houseId))
        .limit(1);

      if (ratio) {
        await database
          .update(giftSaleRatios)
          .set({
            totalSalesCompleted: sql`${giftSaleRatios.totalSalesCompleted} + 1`,
            currentRatio: sql`(${giftSaleRatios.totalSalesCompleted} + 1) / NULLIF(${giftSaleRatios.totalGiftsIssued}, 0)`,
          })
          .where(eq(giftSaleRatios.houseId, input.houseId));
      } else {
        await database.insert(giftSaleRatios).values({
          houseId: input.houseId,
          totalSalesCompleted: 1,
        });
      }

      return { status: "RECORDED", message: "Sale recorded successfully." };
    }),

  // Get activation history for a gift
  getActivationHistory: protectedProcedure
    .input(z.object({ giftId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();

      const attempts = await database
        .select()
        .from(giftActivationAttempts)
        .where(eq(giftActivationAttempts.giftId, input.giftId))
        .orderBy(desc(giftActivationAttempts.createdAt));

      return attempts;
    }),
});
