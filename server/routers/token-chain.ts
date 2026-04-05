import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  tokenChainStates, 
  tokenLocks, 
  tokenExpansions, 
  tokenActivationAttempts,
  scrollSealStatus 
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Token sequence as defined in Scroll 16
const TOKEN_ORDER = ["MIRROR", "GIFT", "SPARK", "HOUSE"] as const;

// Scroll requirements for each token (from Scroll 16)
const TOKEN_SCROLL_REQUIREMENTS: Record<string, number[]> = {
  MIRROR: [7, 14, 33],
  GIFT: [16, 25, 26],
  SPARK: [27, 28, 29],
  HOUSE: [30, 31, 32, 33, 34, 35, 36, 50],
};

// Helper to check if required scrolls are sealed
async function checkScrollsSealed(
  database: Awaited<ReturnType<typeof getDb>> & {},
  userId: string,
  houseId: number,
  requiredScrolls: number[]
): Promise<{ sealed: number[]; missing: number[] }> {
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
  const sealed = requiredScrolls.filter((s) => sealedNumbers.includes(s));
  const missing = requiredScrolls.filter((s) => !sealedNumbers.includes(s));

  return { sealed, missing };
}

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

export const tokenChainRouter = router({
  // Get token chain state for a house/user
  getChainState: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const [state] = await database
        .select()
        .from(tokenChainStates)
        .where(
          and(
            eq(tokenChainStates.houseId, input.houseId),
            eq(tokenChainStates.userId, userId)
          )
        )
        .limit(1);

      if (!state) {
        // Initialize chain state if not exists
        const [newState] = await database
          .insert(tokenChainStates)
          .values({
            houseId: input.houseId,
            userId,
            currentTokenIndex: 0,
            activatedTokens: [],
            chainStatus: "pending",
          })
          .$returningId();

        return {
          id: newState.id,
          houseId: input.houseId,
          userId,
          currentTokenIndex: 0,
          activatedTokens: [] as string[],
          chainStatus: "pending" as const,
          nextExpectedToken: TOKEN_ORDER[0],
          requiredScrolls: TOKEN_SCROLL_REQUIREMENTS[TOKEN_ORDER[0]],
        };
      }

      const nextIndex = state.currentTokenIndex;
      const nextToken = nextIndex < TOKEN_ORDER.length ? TOKEN_ORDER[nextIndex] : null;

      return {
        ...state,
        nextExpectedToken: nextToken,
        requiredScrolls: nextToken ? TOKEN_SCROLL_REQUIREMENTS[nextToken] : [],
      };
    }),

  // Attempt to activate a token (Scroll 16 logic)
  activateToken: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
        tokenType: z.enum(["MIRROR", "GIFT", "SPARK", "HOUSE"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      // Get current chain state
      let [state] = await database
        .select()
        .from(tokenChainStates)
        .where(
          and(
            eq(tokenChainStates.houseId, input.houseId),
            eq(tokenChainStates.userId, userId)
          )
        )
        .limit(1);

      if (!state) {
        // Initialize if not exists
        const [newState] = await database
          .insert(tokenChainStates)
          .values({
            houseId: input.houseId,
            userId,
            currentTokenIndex: 0,
            activatedTokens: [],
            chainStatus: "pending",
          })
          .$returningId();

        state = {
          id: newState.id,
          houseId: input.houseId,
          userId,
          currentTokenIndex: 0,
          activatedTokens: [],
          chainStatus: "pending",
          mirrorActivatedAt: null,
          giftActivatedAt: null,
          sparkActivatedAt: null,
          houseActivatedAt: null,
          mirrorScrollsSealed: null,
          giftScrollsSealed: null,
          sparkScrollsSealed: null,
          houseScrollsSealed: null,
          blockReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Check if chain is blocked
      if (state.chainStatus === "blocked") {
        await database.insert(tokenActivationAttempts).values({
          houseId: input.houseId,
          userId,
          tokenType: input.tokenType.toLowerCase() as "mirror" | "gift" | "spark" | "house",
          attemptStatus: "denied",
          resultMessage: `Chain is blocked: ${state.blockReason}`,
          currentChain: state.activatedTokens as string[] || [],
        });

        return {
          status: "DENIED" as const,
          message: `Chain is blocked: ${state.blockReason}`,
          currentChain: state.activatedTokens || [],
        };
      }

      // Check if token is in correct order
      const expectedIndex = state.currentTokenIndex;
      const expectedToken = expectedIndex < TOKEN_ORDER.length ? TOKEN_ORDER[expectedIndex] : null;

      if (input.tokenType !== expectedToken) {
        await database.insert(tokenActivationAttempts).values({
          houseId: input.houseId,
          userId,
          tokenType: input.tokenType.toLowerCase() as "mirror" | "gift" | "spark" | "house",
          attemptStatus: "denied",
          expectedToken,
          resultMessage: `Invalid activation order. Next expected: ${expectedToken || "CHAIN COMPLETE"}`,
          currentChain: state.activatedTokens as string[] || [],
        });

        return {
          status: "DENIED" as const,
          message: `Invalid activation order. Next expected: ${expectedToken || "CHAIN COMPLETE"}`,
          currentChain: state.activatedTokens || [],
        };
      }

      // Check scroll requirements
      const requiredScrolls = TOKEN_SCROLL_REQUIREMENTS[input.tokenType];
      const { sealed, missing } = await checkScrollsSealed(
        database,
        userId,
        input.houseId,
        requiredScrolls
      );

      if (missing.length > 0) {
        await database.insert(tokenActivationAttempts).values({
          houseId: input.houseId,
          userId,
          tokenType: input.tokenType.toLowerCase() as "mirror" | "gift" | "spark" | "house",
          attemptStatus: "denied",
          expectedToken: input.tokenType,
          scrollsRequired: requiredScrolls,
          scrollsSealed: sealed,
          scrollsMissing: missing,
          resultMessage: `Missing required scrolls: ${missing.join(", ")}`,
          currentChain: state.activatedTokens as string[] || [],
        });

        return {
          status: "DENIED" as const,
          message: `Missing required scrolls: ${missing.join(", ")}`,
          scrollsRequired: requiredScrolls,
          scrollsSealed: sealed,
          scrollsMissing: missing,
          currentChain: state.activatedTokens || [],
        };
      }

      // Activate the token
      const newActivatedTokens = [...(state.activatedTokens as string[] || []), input.tokenType];
      const newIndex = state.currentTokenIndex + 1;
      const isComplete = newIndex >= TOKEN_ORDER.length;

      const timestampField = {
        MIRROR: { mirrorActivatedAt: new Date() },
        GIFT: { giftActivatedAt: new Date() },
        SPARK: { sparkActivatedAt: new Date() },
        HOUSE: { houseActivatedAt: new Date() },
      }[input.tokenType];

      const scrollsField = {
        MIRROR: { mirrorScrollsSealed: sealed },
        GIFT: { giftScrollsSealed: sealed },
        SPARK: { sparkScrollsSealed: sealed },
        HOUSE: { houseScrollsSealed: sealed },
      }[input.tokenType];

      await database
        .update(tokenChainStates)
        .set({
          currentTokenIndex: newIndex,
          activatedTokens: newActivatedTokens,
          chainStatus: isComplete ? "completed" : "in_progress",
          ...timestampField,
          ...scrollsField,
        })
        .where(eq(tokenChainStates.id, state.id));

      // Log successful activation
      await database.insert(tokenActivationAttempts).values({
        houseId: input.houseId,
        userId,
        tokenType: input.tokenType.toLowerCase() as "mirror" | "gift" | "spark" | "house",
        attemptStatus: "approved",
        expectedToken: input.tokenType,
        scrollsRequired: requiredScrolls,
        scrollsSealed: sealed,
        resultMessage: `${input.tokenType} token activated successfully`,
        currentChain: newActivatedTokens,
      });

      return {
        status: "APPROVED" as const,
        message: `${input.tokenType} token activated successfully`,
        currentChain: newActivatedTokens,
        isChainComplete: isComplete,
        nextExpectedToken: isComplete ? null : TOKEN_ORDER[newIndex],
      };
    }),

  // Get scroll seal status for a user/house
  getScrollSealStatus: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const seals = await database
        .select()
        .from(scrollSealStatus)
        .where(
          and(
            eq(scrollSealStatus.userId, userId),
            eq(scrollSealStatus.houseId, input.houseId)
          )
        )
        .orderBy(scrollSealStatus.scrollNumber);

      return seals;
    }),

  // Seal a scroll (mark as completed)
  sealScroll: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
        scrollNumber: z.number(),
        scrollTitle: z.string().optional(),
        verificationMethod: z.enum(["manual", "automatic", "gpt_audit", "course_completion"]).default("manual"),
        courseId: z.number().optional(),
        moduleId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      // Check if already sealed
      const [existing] = await database
        .select()
        .from(scrollSealStatus)
        .where(
          and(
            eq(scrollSealStatus.userId, userId),
            eq(scrollSealStatus.houseId, input.houseId),
            eq(scrollSealStatus.scrollNumber, input.scrollNumber)
          )
        )
        .limit(1);

      if (existing?.isSealed) {
        return {
          status: "ALREADY_SEALED" as const,
          message: `Scroll ${input.scrollNumber} is already sealed`,
          sealedAt: existing.sealedAt,
        };
      }

      // Generate seal hash
      const sealData = `${userId}-${input.houseId}-${input.scrollNumber}-${Date.now()}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(sealData);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sealHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      if (existing) {
        // Update existing record
        await database
          .update(scrollSealStatus)
          .set({
            isSealed: true,
            sealedAt: new Date(),
            sealedBy: userId,
            sealHash,
            verificationMethod: input.verificationMethod,
            courseId: input.courseId,
            moduleId: input.moduleId,
          })
          .where(eq(scrollSealStatus.id, existing.id));
      } else {
        // Create new record
        await database.insert(scrollSealStatus).values({
          userId,
          houseId: input.houseId,
          scrollNumber: input.scrollNumber,
          scrollTitle: input.scrollTitle,
          isSealed: true,
          sealedAt: new Date(),
          sealedBy: userId,
          sealHash,
          verificationMethod: input.verificationMethod,
          courseId: input.courseId,
          moduleId: input.moduleId,
        });
      }

      return {
        status: "SEALED" as const,
        message: `Scroll ${input.scrollNumber} sealed successfully`,
        sealHash,
        sealedAt: new Date(),
      };
    }),

  // Get token locks (Scroll 31)
  getTokenLocks: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const locks = await database
        .select()
        .from(tokenLocks)
        .where(
          and(
            eq(tokenLocks.houseId, input.houseId),
            eq(tokenLocks.userId, userId)
          )
        )
        .orderBy(desc(tokenLocks.createdAt));

      return locks;
    }),

  // Create a token lock (Scroll 31)
  createTokenLock: protectedProcedure
    .input(
      z.object({
        tokenId: z.number(),
        tokenType: z.enum(["mirror", "gift", "spark", "house", "crown"]),
        houseId: z.number(),
        lockType: z.enum(["time_based", "scroll_based", "lineage_based", "manual"]),
        lockDurationDays: z.number().optional(),
        requiredScrolls: z.array(z.number()).optional(),
        requiresLineageVerification: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const lockExpiresAt = input.lockDurationDays
        ? new Date(Date.now() + input.lockDurationDays * 24 * 60 * 60 * 1000)
        : null;

      const [lock] = await database
        .insert(tokenLocks)
        .values({
          tokenId: input.tokenId,
          tokenType: input.tokenType,
          houseId: input.houseId,
          userId,
          lockType: input.lockType,
          lockDurationDays: input.lockDurationDays,
          lockExpiresAt,
          requiredScrolls: input.requiredScrolls || [],
          requiresLineageVerification: input.requiresLineageVerification || false,
          lockStatus: "active",
        })
        .$returningId();

      return {
        status: "LOCKED" as const,
        lockId: lock.id,
        expiresAt: lockExpiresAt,
      };
    }),

  // Attempt to unlock a token (Scroll 32)
  unlockToken: protectedProcedure
    .input(z.object({ lockId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const [lock] = await database
        .select()
        .from(tokenLocks)
        .where(eq(tokenLocks.id, input.lockId))
        .limit(1);

      if (!lock) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lock not found" });
      }

      if (lock.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to unlock this token" });
      }

      if (lock.lockStatus !== "active") {
        return {
          status: "ALREADY_UNLOCKED" as const,
          message: `Lock is already ${lock.lockStatus}`,
        };
      }

      // Check unlock conditions based on lock type
      let canUnlock = false;
      let reason = "";

      switch (lock.lockType) {
        case "time_based":
          if (lock.lockExpiresAt && new Date() >= lock.lockExpiresAt) {
            canUnlock = true;
            reason = "Time-based lock expired";
          } else {
            reason = `Lock expires at ${lock.lockExpiresAt?.toISOString()}`;
          }
          break;

        case "scroll_based":
          const requiredScrolls = (lock.requiredScrolls as number[]) || [];
          const { missing } = await checkScrollsSealed(database, userId, lock.houseId, requiredScrolls);
          if (missing.length === 0) {
            canUnlock = true;
            reason = "All required scrolls sealed";
          } else {
            reason = `Missing scrolls: ${missing.join(", ")}`;
          }
          break;

        case "lineage_based":
          if (lock.lineageVerifiedAt) {
            canUnlock = true;
            reason = "Lineage verified";
          } else {
            reason = "Lineage verification required";
          }
          break;

        case "manual":
          reason = "Manual unlock required by administrator";
          break;
      }

      if (canUnlock) {
        await database
          .update(tokenLocks)
          .set({
            lockStatus: "unlocked",
            unlockedAt: new Date(),
            unlockReason: reason,
          })
          .where(eq(tokenLocks.id, input.lockId));

        return {
          status: "UNLOCKED" as const,
          message: reason,
        };
      }

      return {
        status: "LOCKED" as const,
        message: `Cannot unlock: ${reason}`,
      };
    }),

  // Get token expansions (Scroll 33)
  getTokenExpansions: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();

      const expansions = await database
        .select()
        .from(tokenExpansions)
        .where(eq(tokenExpansions.sourceHouseId, input.houseId))
        .orderBy(desc(tokenExpansions.createdAt));

      return expansions;
    }),

  // Request token expansion (Scroll 33)
  requestExpansion: protectedProcedure
    .input(
      z.object({
        sourceTokenId: z.number(),
        sourceHouseId: z.number(),
        targetHouseId: z.number().optional(),
        targetUserId: z.string().optional(),
        expansionType: z.enum(["bloodline", "mirrored", "adaptive"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const [expansion] = await database
        .insert(tokenExpansions)
        .values({
          sourceTokenId: input.sourceTokenId,
          sourceHouseId: input.sourceHouseId,
          sourceUserId: userId,
          targetHouseId: input.targetHouseId,
          targetUserId: input.targetUserId,
          expansionType: input.expansionType,
          expansionStatus: "pending",
        })
        .$returningId();

      return {
        status: "PENDING" as const,
        expansionId: expansion.id,
        message: "Expansion request submitted for approval",
      };
    }),

  // Get activation attempts history
  getActivationHistory: protectedProcedure
    .input(z.object({ houseId: z.number(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      const attempts = await database
        .select()
        .from(tokenActivationAttempts)
        .where(
          and(
            eq(tokenActivationAttempts.houseId, input.houseId),
            eq(tokenActivationAttempts.userId, userId)
          )
        )
        .orderBy(desc(tokenActivationAttempts.createdAt))
        .limit(input.limit);

      return attempts;
    }),
});
