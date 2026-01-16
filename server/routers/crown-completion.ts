import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  scrollSealStatus,
  tokenChainStates,
  certificates,
  houses
} from "../../drizzle/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// Token sequence for Crown eligibility
const TOKEN_SEQUENCE = ["MIRROR", "GIFT", "SPARK", "HOUSE"];

// All scrolls required for Crown of Completion (from Scroll 19)
const CROWN_REQUIRED_SCROLLS = [
  // Foundation scrolls
  7, 14, 16, 17, 18, 19,
  // Token scrolls
  25, 26, 27, 28, 29, 30,
  // Mirror expansion scrolls
  31, 32, 33, 34, 35, 36,
  // House activation scrolls
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  // Registry scrolls
  51, 52, 53,
  // Financial automation scrolls
  54, 55, 56, 57, 58, 59, 60, 61
];

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

// Generate Crown hash for verification
function generateCrownHash(data: {
  userId: string;
  houseId: number;
  sealedScrolls: number[];
  completedTokens: string[];
  issuedAt: Date;
}): string {
  const hashData = JSON.stringify({
    user: data.userId,
    house: data.houseId,
    scrolls: data.sealedScrolls.sort().join(","),
    tokens: data.completedTokens.join(","),
    timestamp: data.issuedAt.toISOString(),
  });
  return crypto.createHash("sha256").update(hashData).digest("hex");
}

// Generate Crown certificate number
function generateCrownNumber(houseId: number, userId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const userHash = crypto.createHash("sha256").update(userId).digest("hex").slice(0, 4).toUpperCase();
  return `CROWN-${houseId}-${timestamp}-${userHash}`;
}

export const crownCompletionRouter = router({
  // Check Crown eligibility for a house
  checkEligibility: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      // Get all sealed scrolls for this house
      const sealedScrolls = await database
        .select()
        .from(scrollSealStatus)
        .where(
          and(
            eq(scrollSealStatus.userId, userId),
            eq(scrollSealStatus.houseId, input.houseId),
            eq(scrollSealStatus.isSealed, true)
          )
        );

      const sealedNumbers = sealedScrolls.map((s: { scrollNumber: number }) => s.scrollNumber);
      const missingScrolls = CROWN_REQUIRED_SCROLLS.filter(
        (s) => !sealedNumbers.includes(s)
      );

      // Get token chain state
      const [chainState] = await database
        .select()
        .from(tokenChainStates)
        .where(
          and(
            eq(tokenChainStates.houseId, input.houseId),
            eq(tokenChainStates.userId, userId)
          )
        )
        .limit(1);

      const completedTokens = chainState?.activatedTokens || [];
      const missingTokens = TOKEN_SEQUENCE.filter(
        (t) => !completedTokens.includes(t)
      );

      // Check LuvLedger status (simplified - check if house exists and is active)
      const [house] = await database
        .select()
        .from(houses)
        .where(eq(houses.id, input.houseId))
        .limit(1);

      const luvLedgerComplete = house?.status === "active";

      // Calculate completion percentage
      const scrollProgress = (sealedNumbers.length / CROWN_REQUIRED_SCROLLS.length) * 100;
      const tokenProgress = (completedTokens.length / TOKEN_SEQUENCE.length) * 100;
      const overallProgress = (scrollProgress + tokenProgress + (luvLedgerComplete ? 100 : 0)) / 3;

      const isEligible = 
        missingScrolls.length === 0 && 
        missingTokens.length === 0 && 
        luvLedgerComplete;

      return {
        eligible: isEligible,
        scrollProgress: {
          sealed: sealedNumbers.length,
          required: CROWN_REQUIRED_SCROLLS.length,
          missing: missingScrolls,
          percentage: scrollProgress,
        },
        tokenProgress: {
          completed: completedTokens,
          missing: missingTokens,
          percentage: tokenProgress,
        },
        luvLedgerComplete,
        overallProgress,
        message: isEligible
          ? "All requirements met. Ready for Crown issuance."
          : `Requirements incomplete: ${missingScrolls.length} scrolls, ${missingTokens.length} tokens remaining.`,
      };
    }),

  // Issue Crown of Completion
  issueCrown: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      // Verify eligibility first
      const sealedScrolls = await database
        .select()
        .from(scrollSealStatus)
        .where(
          and(
            eq(scrollSealStatus.userId, userId),
            eq(scrollSealStatus.houseId, input.houseId),
            eq(scrollSealStatus.isSealed, true)
          )
        );

      const sealedNumbers = sealedScrolls.map((s: { scrollNumber: number }) => s.scrollNumber);
      const missingScrolls = CROWN_REQUIRED_SCROLLS.filter(
        (s) => !sealedNumbers.includes(s)
      );

      if (missingScrolls.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Missing ${missingScrolls.length} required scrolls: ${missingScrolls.slice(0, 5).join(", ")}...`,
        });
      }

      // Get token chain state
      const [chainState] = await database
        .select()
        .from(tokenChainStates)
        .where(
          and(
            eq(tokenChainStates.houseId, input.houseId),
            eq(tokenChainStates.userId, userId)
          )
        )
        .limit(1);

      const completedTokens = chainState?.activatedTokens || [];
      const missingTokens = TOKEN_SEQUENCE.filter(
        (t) => !completedTokens.includes(t)
      );

      if (missingTokens.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Missing tokens: ${missingTokens.join(", ")}`,
        });
      }

      // Check if Crown already issued for this house
      const [existingCrown] = await database
        .select()
        .from(certificates)
        .where(
          and(
            eq(certificates.simulatorSessionId, input.houseId),
            eq(certificates.certificateType, "crown")
          )
        )
        .limit(1);

      if (existingCrown) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Crown of Completion already issued for this user",
        });
      }

      const issuedAt = new Date();
      const crownNumber = generateCrownNumber(input.houseId, userId);
      const crownHash = generateCrownHash({
        userId,
        houseId: input.houseId,
        sealedScrolls: sealedNumbers,
        completedTokens,
        issuedAt,
      });

      // Issue the Crown certificate
      const [crown] = await database
        .insert(certificates)
        .values({
          userId: 1, // Placeholder - should be linked to user table
          simulatorSessionId: input.houseId, // Use houseId as session reference
          certificateType: "crown",
          title: `Crown of Completion - ${crownNumber}`,
          certificateHash: crownHash,
          issuedAt,
        })
        .$returningId();

      // Update token chain state to complete
      if (chainState) {
        await database
          .update(tokenChainStates)
          .set({
            chainStatus: "completed",
            updatedAt: issuedAt,
          })
          .where(eq(tokenChainStates.id, chainState.id));
      }

      return {
        id: crown.id,
        crownNumber,
        crownHash,
        issuedAt,
        status: "ISSUED",
        message: "Crown of Completion issued successfully. Your scroll set is now sealed.",
        nftEligible: true,
        externalSharingEnabled: true,
      };
    }),

  // Get Crown status for a user
  getCrownStatus: protectedProcedure.query(async ({ ctx }) => {
    const database = await requireDb();
    const userId = ctx.user.openId;

    const [crown] = await database
      .select()
      .from(certificates)
      .where(eq(certificates.certificateType, "crown"))
      .limit(1);

    if (!crown) {
      return {
        hasCrown: false,
        message: "Crown of Completion not yet issued",
      };
    }

    return {
      hasCrown: true,
      crown: {
        id: crown.id,
        title: crown.title,
        certificateHash: crown.certificateHash,
        issuedAt: crown.issuedAt,
      },
      nftEligible: true,
      externalSharingEnabled: true,
    };
  }),

  // Verify Crown authenticity
  verifyCrown: publicProcedure
    .input(z.object({ crownHash: z.string() }))
    .query(async ({ input }) => {
      const database = await requireDb();

      const [crown] = await database
        .select()
        .from(certificates)
        .where(
          and(
            eq(certificates.certificateHash, input.crownHash),
            eq(certificates.certificateType, "crown")
          )
        )
        .limit(1);

      if (!crown) {
        return {
          valid: false,
          message: "Crown not found or invalid hash",
        };
      }

      return {
        valid: true,
        title: crown.title,
        issuedAt: crown.issuedAt,
        message: "Crown of Completion verified successfully",
      };
    }),

  // Get Crown statistics
  getCrownStats: publicProcedure.query(async () => {
    const database = await requireDb();

    const [stats] = await database
      .select({
        totalCrowns: count(),
      })
      .from(certificates)
      .where(eq(certificates.certificateType, "crown"));

    return {
      totalCrownsIssued: stats?.totalCrowns || 0,
      requiredScrolls: CROWN_REQUIRED_SCROLLS.length,
      requiredTokens: TOKEN_SEQUENCE.length,
    };
  }),
});
