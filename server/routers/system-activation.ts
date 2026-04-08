import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import {
  simulatorCompletion,
  clonedBuilds,
  buildLinkage,
  activationProgress,
} from "../../drizzle/schema";

/**
 * System Activation Router
 * Handles education-first activation flow:
 * 1. Track simulator completions (Business, Grants, Proposals, Contracts, Real-Eye-Nation, Other)
 * 2. Check activation readiness (all simulators must be completed)
 * 3. Provision cloned builds (create user's personalized shell)
 * 4. Link to master build via LuvLedger
 * 
 * ADDITIVE ONLY - No modifications to existing master build
 */

const SIMULATOR_TYPES = [
  "business",
  "grants",
  "proposals",
  "contracts",
  "real_eye_nation",
  "other",
] as const;

const TOTAL_SIMULATORS_REQUIRED = 6;

export const systemActivationRouter = router({
  /**
   * Record simulator completion
   */
  recordCompletion: protectedProcedure
    .input(
      z.object({
        simulatorType: z.enum(SIMULATOR_TYPES),
        score: z.number().min(0).max(100).optional(),
        certificateId: z.string().optional(),
        simulatorData: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if already completed
      const existing = await db
        .select()
        .from(simulatorCompletion)
        .where(
          and(
            eq(simulatorCompletion.userId, userId),
            eq(simulatorCompletion.simulatorType, input.simulatorType)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return {
          success: true,
          alreadyCompleted: true,
          message: `${input.simulatorType} workshop already completed.`,
        };
      }

      // Record completion
      await db.insert(simulatorCompletion).values({
        userId,
        simulatorType: input.simulatorType,
        completedAt: new Date(),
        score: input.score ?? null,
        certificateId: input.certificateId ?? null,
        certificateUrl: input.certificateId
          ? `/certificates/${input.certificateId}`
          : null,
      });

      // Count completed
      const completedRows = await db
        .select({ count: sql<number>`COUNT(DISTINCT simulator_type)` })
        .from(simulatorCompletion)
        .where(eq(simulatorCompletion.userId, userId));

      const simulatorsCompleted = completedRows[0]?.count ?? 0;

      let newStatus: "not_started" | "in_progress" | "ready_for_activation" | "activated" | "suspended" = "in_progress";
      let readyAt: Date | null = null;

      if (simulatorsCompleted >= TOTAL_SIMULATORS_REQUIRED) {
        newStatus = "ready_for_activation";
        readyAt = new Date();
      }

      // Upsert activation progress
      const existingProgress = await db
        .select()
        .from(activationProgress)
        .where(eq(activationProgress.userId, userId))
        .limit(1);

      if (existingProgress.length > 0) {
        if (existingProgress[0].activationStatus !== "activated") {
          await db
            .update(activationProgress)
            .set({
              simulatorsCompleted,
              activationStatus: newStatus,
              activationReadyAt: readyAt,
            })
            .where(eq(activationProgress.userId, userId));
        }
      } else {
        await db.insert(activationProgress).values({
          userId,
          simulatorsCompleted,
          activationStatus: newStatus,
          activationReadyAt: readyAt,
          totalSimulatorsRequired: TOTAL_SIMULATORS_REQUIRED,
        });
      }

      return {
        success: true,
        alreadyCompleted: false,
        simulatorsCompleted,
        totalRequired: TOTAL_SIMULATORS_REQUIRED,
        readyForActivation: simulatorsCompleted >= TOTAL_SIMULATORS_REQUIRED,
        message: `${input.simulatorType} workshop completed! ${simulatorsCompleted}/${TOTAL_SIMULATORS_REQUIRED} done.`,
      };
    }),

  /**
   * Get activation progress for current user
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const progress = await db
      .select()
      .from(activationProgress)
      .where(eq(activationProgress.userId, userId))
      .limit(1);

    const completedSimulators = await db
      .select()
      .from(simulatorCompletion)
      .where(eq(simulatorCompletion.userId, userId));

    const completedTypes = completedSimulators.map((s) => s.simulatorType);

    const simulatorStatus = SIMULATOR_TYPES.map((type) => ({
      type,
      label: getSimulatorLabel(type),
      completed: completedTypes.includes(type),
      score: completedSimulators.find((s) => s.simulatorType === type)?.score ?? null,
      completedAt: completedSimulators.find((s) => s.simulatorType === type)?.completedAt ?? null,
    }));

    return {
      progress: progress[0] ?? null,
      simulators: simulatorStatus,
      completedCount: completedTypes.length,
      totalRequired: TOTAL_SIMULATORS_REQUIRED,
      readyForActivation:
        completedTypes.length >= TOTAL_SIMULATORS_REQUIRED ||
        progress[0]?.activationStatus === "ready_for_activation",
      isActivated: progress[0]?.activationStatus === "activated",
    };
  }),

  /**
   * Get activation progress (public - for dashboard display)
   */
  getProgressPublic: publicProcedure
    .input(z.object({ userId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      if (!input?.userId) {
        return {
          progress: null,
          simulators: SIMULATOR_TYPES.map((type) => ({
            type,
            label: getSimulatorLabel(type),
            completed: false,
            score: null,
            completedAt: null,
          })),
          completedCount: 0,
          totalRequired: TOTAL_SIMULATORS_REQUIRED,
          readyForActivation: false,
          isActivated: false,
        };
      }

      const userId = input.userId;

      const progress = await db
        .select()
        .from(activationProgress)
        .where(eq(activationProgress.userId, userId))
        .limit(1);

      const completedSimulators = await db
        .select()
        .from(simulatorCompletion)
        .where(eq(simulatorCompletion.userId, userId));

      const completedTypes = completedSimulators.map((s) => s.simulatorType);

      const simulatorStatus = SIMULATOR_TYPES.map((type) => ({
        type,
        label: getSimulatorLabel(type),
        completed: completedTypes.includes(type),
        score: completedSimulators.find((s) => s.simulatorType === type)?.score ?? null,
        completedAt: completedSimulators.find((s) => s.simulatorType === type)?.completedAt ?? null,
      }));

      return {
        progress: progress[0] ?? null,
        simulators: simulatorStatus,
        completedCount: completedTypes.length,
        totalRequired: TOTAL_SIMULATORS_REQUIRED,
        readyForActivation: completedTypes.length >= TOTAL_SIMULATORS_REQUIRED,
        isActivated: progress[0]?.activationStatus === "activated",
      };
    }),

  /**
   * Activate user's cloned build
   */
  activateBuild: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(1),
        businessType: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Verify all simulators completed
      const completedRows = await db
        .select({ count: sql<number>`COUNT(DISTINCT simulator_type)` })
        .from(simulatorCompletion)
        .where(eq(simulatorCompletion.userId, userId));

      const simulatorsCompleted = completedRows[0]?.count ?? 0;

      if (simulatorsCompleted < TOTAL_SIMULATORS_REQUIRED) {
        return {
          success: false,
          error: `Not all workshops completed. ${simulatorsCompleted}/${TOTAL_SIMULATORS_REQUIRED} done.`,
        };
      }

      // Check if already activated
      const existingBuild = await db
        .select()
        .from(clonedBuilds)
        .where(eq(clonedBuilds.userId, userId))
        .limit(1);

      if (existingBuild.length > 0 && existingBuild[0].cloneStatus === "active") {
        return {
          success: false,
          error: "Build already activated.",
          clonedBuildId: existingBuild[0].id,
        };
      }

      // Gather simulator data
      const allCompletions = await db
        .select()
        .from(simulatorCompletion)
        .where(eq(simulatorCompletion.userId, userId));

      const simulatorDataJson = JSON.stringify(
        allCompletions.map((c) => ({
          type: c.simulatorType,
          score: c.score,
          completedAt: c.completedAt,
          certificateId: c.certificateId,
        }))
      );

      const masterBuildId = 1;

      // Create cloned build
      const result = await db.insert(clonedBuilds).values({
        userId,
        masterBuildId,
        businessName: input.businessName,
        businessType: input.businessType,
        cloneStatus: "provisioning",
        simulatorDataJson,
      });

      const clonedBuildId = Number(result[0].insertId);

      // Create LuvLedger linkage
      await db.insert(buildLinkage).values({
        clonedBuildId,
        masterBuildId,
        linkageType: "master_clone",
        luvledgerEntryId: `LL-CLONE-${userId}-${Date.now()}`,
      });

      // Activate
      await db
        .update(clonedBuilds)
        .set({ cloneStatus: "active", activatedAt: new Date() })
        .where(eq(clonedBuilds.id, clonedBuildId));

      await db
        .update(activationProgress)
        .set({ activationStatus: "activated", activatedAt: new Date() })
        .where(eq(activationProgress.userId, userId));

      return {
        success: true,
        clonedBuildId,
        message: "Your personalized build has been activated and linked to the master build via LuvLedger.",
      };
    }),

  /**
   * Get cloned build status
   */
  getBuildStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const build = await db
      .select()
      .from(clonedBuilds)
      .where(eq(clonedBuilds.userId, userId))
      .limit(1);

    if (!build.length) {
      return { hasBuild: false, build: null, linkage: null };
    }

    const linkageData = await db
      .select()
      .from(buildLinkage)
      .where(eq(buildLinkage.clonedBuildId, build[0].id))
      .limit(1);

    return {
      hasBuild: true,
      build: build[0],
      linkage: linkageData[0] ?? null,
    };
  }),

  /**
   * Get all cloned builds (admin view)
   */
  getAllBuilds: protectedProcedure.query(async () => {
    const builds = await db.select().from(clonedBuilds).limit(100);
    return builds;
  }),
});

function getSimulatorLabel(type: string): string {
  const labels: Record<string, string> = {
    business: "Business Workshop",
    grants: "Grant Writing Workshop",
    proposals: "Proposals Workshop",
    contracts: "Contracts Workshop",
    real_eye_nation: "Real-Eye-Nation Workshop",
    other: "Additional Workshop",
  };
  return labels[type] ?? type;
}
