import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  houses,
  tokenChainStates,
  scrollSealStatus
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// House types from Scrolls 41-43
const HOUSE_TYPES = {
  STARTER: "starter",      // Scroll 41 - Initial house for new participants
  MIRRORED: "mirrored",    // Scroll 42 - Bloodline extension house
  ADAPTED: "adapted",      // Scroll 43 - Non-blood trusted house
} as const;

// Required scrolls for house activation (from Scroll 41)
const STARTER_HOUSE_SCROLLS = [7, 14, 16];
const MIRRORED_HOUSE_SCROLLS = [7, 14, 16, 25, 26, 31, 32, 33];
const ADAPTED_HOUSE_SCROLLS = [7, 14, 16, 25, 26, 27, 28, 29];

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

// Generate Registry ID Number (RIN) for house
function generateRIN(houseType: string, userId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const userHash = crypto.createHash("sha256").update(userId).digest("hex").slice(0, 6).toUpperCase();
  const typeCode = houseType === "starter" ? "ST" : houseType === "mirrored" ? "MR" : "AD";
  return `RIN-${typeCode}-${timestamp}-${userHash}`;
}

// Generate house hash for verification
function generateHouseHash(houseData: {
  userId: string;
  houseType: string;
  parentHouseId?: number;
  createdAt: Date;
}): string {
  const data = JSON.stringify({
    user: houseData.userId,
    type: houseData.houseType,
    parent: houseData.parentHouseId,
    timestamp: houseData.createdAt.toISOString(),
  });
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Check if required scrolls are sealed
async function checkScrollsSealed(
  database: Awaited<ReturnType<typeof getDb>> & {},
  userId: string,
  houseId: number,
  requiredScrolls: number[]
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
  const sealed = requiredScrolls.filter((s) => sealedNumbers.includes(s));
  const missing = requiredScrolls.filter((s) => !sealedNumbers.includes(s));

  return {
    complete: missing.length === 0,
    sealed,
    missing,
  };
}

export const houseActivationRouter = router({
  // Get all houses for a user
  getUserHouses: protectedProcedure.query(async ({ ctx }) => {
    const database = await requireDb();

    // Get all houses - in production, filter by user
    const userHouses = await database
      .select()
      .from(houses)
      .orderBy(desc(houses.createdAt))
      .limit(50);

    return userHouses;
  }),

  // Get house by ID
  getHouse: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const database = await requireDb();

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

      return house;
    }),

  // Check activation eligibility
  checkActivationEligibility: protectedProcedure
    .input(
      z.object({
        houseType: z.enum(["starter", "mirrored", "adapted"]),
        parentHouseId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      // Determine required scrolls based on house type
      let requiredScrolls: number[];
      switch (input.houseType) {
        case "starter":
          requiredScrolls = STARTER_HOUSE_SCROLLS;
          break;
        case "mirrored":
          requiredScrolls = MIRRORED_HOUSE_SCROLLS;
          break;
        case "adapted":
          requiredScrolls = ADAPTED_HOUSE_SCROLLS;
          break;
      }

      // For mirrored/adapted houses, check parent house exists
      let parentHouse = null;
      if (input.houseType !== "starter") {
        if (!input.parentHouseId) {
          return {
            eligible: false,
            reason: "Parent house ID required for mirrored/adapted houses",
            requiredScrolls,
            sealedScrolls: [],
            missingScrolls: requiredScrolls,
          };
        }

        const [parent] = await database
          .select()
          .from(houses)
          .where(eq(houses.id, input.parentHouseId))
          .limit(1);

        if (!parent) {
          return {
            eligible: false,
            reason: "Parent house not found",
            requiredScrolls,
            sealedScrolls: [],
            missingScrolls: requiredScrolls,
          };
        }

        parentHouse = parent;

        // Check scroll seals against parent house
        const scrollCheck = await checkScrollsSealed(
          database,
          userId,
          input.parentHouseId,
          requiredScrolls
        );

        if (!scrollCheck.complete) {
          return {
            eligible: false,
            reason: `Missing required scrolls: ${scrollCheck.missing.join(", ")}`,
            requiredScrolls,
            sealedScrolls: scrollCheck.sealed,
            missingScrolls: scrollCheck.missing,
            parentHouse,
          };
        }

        return {
          eligible: true,
          reason: "All requirements met",
          requiredScrolls,
          sealedScrolls: scrollCheck.sealed,
          missingScrolls: [],
          parentHouse,
        };
      }

      // For starter house, check if user already has one
      const existingStarter = await database
        .select()
        .from(houses)
        .where(eq(houses.houseType, "root"))
        .limit(1);

      if (existingStarter.length > 0) {
        return {
          eligible: false,
          reason: "User already has a starter house",
          requiredScrolls,
          sealedScrolls: [],
          missingScrolls: [],
          existingHouse: existingStarter[0],
        };
      }

      return {
        eligible: true,
        reason: "Eligible for starter house activation",
        requiredScrolls,
        sealedScrolls: [],
        missingScrolls: [],
      };
    }),

  // Activate Starter House (Scroll 41)
  activateStarterHouse: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        houseDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      // Check if user already has a starter house
      // For now, just check if any root house exists
      const existingStarter = await database
        .select()
        .from(houses)
        .where(eq(houses.houseType, "root"))
        .limit(1);

      if (existingStarter.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "User already has a starter house",
        });
      }

      const createdAt = new Date();
      const rin = generateRIN("starter", userId);
      const houseHash = generateHouseHash({
        userId,
        houseType: "starter",
        createdAt,
      });

      // Create the house - ownerUserId is numeric, we'll use 0 as placeholder
      // In production, this should be linked to a users table
      const [house] = await database
        .insert(houses)
        .values({
          ownerUserId: 1, // Placeholder - should be linked to user table
          name: input.name,
          houseType: "root",
          status: "active",
        })
        .$returningId();

      // Initialize token chain state for this house
      await database.insert(tokenChainStates).values({
        houseId: house.id,
        userId,
        currentTokenIndex: 0,
        activatedTokens: [],
        chainStatus: "pending",
      });

      return {
        id: house.id,
        rin,
        houseHash,
        status: "ACTIVATED",
        message: "Starter House activated successfully. Begin your journey with the MIRROR token.",
      };
    }),

  // Activate Mirrored House (Scroll 42)
  activateMirroredHouse: protectedProcedure
    .input(
      z.object({
        parentHouseId: z.number(),
        name: z.string().min(1).max(100),
        houseDescription: z.string().optional(),
        recipientUserId: z.string().optional(),
        recipientEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      // Verify parent house exists
      const [parentHouse] = await database
        .select()
        .from(houses)
        .where(eq(houses.id, input.parentHouseId))
        .limit(1);

      if (!parentHouse) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Parent house not found",
        });
      }

      // Check required scrolls
      const scrollCheck = await checkScrollsSealed(
        database,
        userId,
        input.parentHouseId,
        MIRRORED_HOUSE_SCROLLS
      );

      if (!scrollCheck.complete) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Missing required scrolls: ${scrollCheck.missing.join(", ")}`,
        });
      }

      const createdAt = new Date();
      const rin = generateRIN("mirrored", userId);
      const houseHash = generateHouseHash({
        userId,
        houseType: "mirrored",
        parentHouseId: input.parentHouseId,
        createdAt,
      });

      // Create the mirrored house
      const [house] = await database
        .insert(houses)
        .values({
          ownerUserId: 1, // Placeholder - should be linked to user table
          name: input.name,
          houseType: "bloodline",
          parentHouseId: input.parentHouseId,
          status: "active",
        })
        .$returningId();

      // Initialize token chain state
      await database.insert(tokenChainStates).values({
        houseId: house.id,
        userId: input.recipientUserId || userId,
        currentTokenIndex: 0,
        activatedTokens: [],
        chainStatus: "pending",
      });

      return {
        id: house.id,
        rin,
        houseHash,
        parentHouseId: input.parentHouseId,
        status: "ACTIVATED",
        message: "Mirrored House activated successfully. Bloodline extension complete.",
      };
    }),

  // Activate Adapted House (Scroll 43)
  activateAdaptedHouse: protectedProcedure
    .input(
      z.object({
        parentHouseId: z.number(),
        name: z.string().min(1).max(100),
        houseDescription: z.string().optional(),
        recipientUserId: z.string().optional(),
        recipientEmail: z.string().email().optional(),
        trustLevel: z.enum(["trusted", "verified", "provisional"]).default("provisional"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

      // Verify parent house exists
      const [parentHouse] = await database
        .select()
        .from(houses)
        .where(eq(houses.id, input.parentHouseId))
        .limit(1);

      if (!parentHouse) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Parent house not found",
        });
      }

      // Check required scrolls
      const scrollCheck = await checkScrollsSealed(
        database,
        userId,
        input.parentHouseId,
        ADAPTED_HOUSE_SCROLLS
      );

      if (!scrollCheck.complete) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Missing required scrolls: ${scrollCheck.missing.join(", ")}`,
        });
      }

      const createdAt = new Date();
      const rin = generateRIN("adapted", userId);
      const houseHash = generateHouseHash({
        userId,
        houseType: "adapted",
        parentHouseId: input.parentHouseId,
        createdAt,
      });

      // Create the adapted house
      const [house] = await database
        .insert(houses)
        .values({
          ownerUserId: 1, // Placeholder - should be linked to user table
          name: input.name,
          houseType: "adaptive",
          parentHouseId: input.parentHouseId,
          status: "forming", // Adapted houses start as forming
        })
        .$returningId();

      // Initialize token chain state
      await database.insert(tokenChainStates).values({
        houseId: house.id,
        userId: input.recipientUserId || userId,
        currentTokenIndex: 0,
        activatedTokens: [],
        chainStatus: "pending",
      });

      return {
        id: house.id,
        rin,
        houseHash,
        parentHouseId: input.parentHouseId,
        trustLevel: input.trustLevel,
        status: "PENDING",
        message: "Adapted House created. Awaiting stewardship oath completion.",
      };
    }),

  // Complete Stewardship Oath (Scroll 46)
  completeStewardshipOath: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
        oathText: z.string().min(50),
        witnessUserId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

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

      // Update house status to active after oath
      await database
        .update(houses)
        .set({
          status: "active",
        })
        .where(eq(houses.id, input.houseId));

      // Seal Scroll 46 for this house
      await database.insert(scrollSealStatus).values({
        userId,
        houseId: input.houseId,
        scrollNumber: 46,
        isSealed: true,
        sealedAt: new Date(),
      });

      return {
        status: "OATH_COMPLETE",
        message: "Stewardship Oath completed. House is now fully active.",
      };
    }),

  // Upgrade House Level I (Scroll 48)
  upgradeHouseLevelI: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

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

      // Check token chain completion for upgrade eligibility
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

      if (!chainState || chainState.currentTokenIndex < 2) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Must complete at least MIRROR and GIFT tokens for Level I upgrade",
        });
      }

      // Seal Scroll 48
      await database.insert(scrollSealStatus).values({
        userId,
        houseId: input.houseId,
        scrollNumber: 48,
        isSealed: true,
        sealedAt: new Date(),
      });

      return {
        status: "UPGRADED",
        level: 1,
        message: "House upgraded to Level I. Enhanced capabilities unlocked.",
      };
    }),

  // Upgrade House Level II (Scroll 49)
  upgradeHouseLevelII: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = await requireDb();
      const userId = ctx.user.openId;

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

      // Check Level I upgrade was completed
      const [levelI] = await database
        .select()
        .from(scrollSealStatus)
        .where(
          and(
            eq(scrollSealStatus.userId, userId),
            eq(scrollSealStatus.houseId, input.houseId),
            eq(scrollSealStatus.scrollNumber, 48),
            eq(scrollSealStatus.isSealed, true)
          )
        )
        .limit(1);

      if (!levelI) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Must complete Level I upgrade first",
        });
      }

      // Check token chain completion
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

      if (!chainState || chainState.currentTokenIndex < 3) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Must complete MIRROR, GIFT, and SPARK tokens for Level II upgrade",
        });
      }

      // Seal Scroll 49
      await database.insert(scrollSealStatus).values({
        userId,
        houseId: input.houseId,
        scrollNumber: 49,
        isSealed: true,
        sealedAt: new Date(),
      });

      return {
        status: "UPGRADED",
        level: 2,
        message: "House upgraded to Level II. Full capabilities unlocked.",
      };
    }),

  // Get house registry (Scroll 50)
  getHouseRegistry: protectedProcedure
    .input(
      z.object({
        houseType: z.enum(["all", "root", "bloodline", "mirrored", "adaptive"]).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const database = await requireDb();

      let query = database.select().from(houses);

      if (input.houseType && input.houseType !== "all") {
        query = query.where(eq(houses.houseType, input.houseType)) as typeof query;
      }

      const registry = await query
        .orderBy(desc(houses.createdAt))
        .limit(input.limit);

      return registry;
    }),
});
