import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { eq, and } from "drizzle-orm";

/**
 * System Activation Router
 * Handles education-first activation flow:
 * 1. Track simulator completions
 * 2. Check activation readiness
 * 3. Provision cloned builds
 * 4. Link to master build via LuvLedger
 */

export const systemActivationRouter = router({
  /**
   * Record simulator completion
   * Called when user completes a simulator (Business, Grants, Proposals, etc.)
   */
  recordSimulatorCompletion: protectedProcedure
    .input(
      z.object({
        simulatorType: z.enum([
          "business",
          "grants",
          "proposals",
          "contracts",
          "real_eye_nation",
          "other"
        ]),
        score: z.number().optional(),
        certificateId: z.string().optional(),
        simulatorData: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Record simulator completion
      await db.insert(simulatorCompletion).values({
        userId,
        simulatorType: input.simulatorType,
        completedAt: new Date(),
        score: input.score,
        certificateId: input.certificateId,
        certificateUrl: `/certificates/${input.certificateId}`,
      });

      // Update activation progress
      const completedSimulators = await db
        .selectDistinct({ simulatorType: simulatorCompletion.simulatorType })
        .from(simulatorCompletion)
        .where(eq(simulatorCompletion.userId, userId));

      const activationProgress = await db
        .select()
        .from(activationProgressTable)
        .where(eq(activationProgressTable.userId, userId))
        .limit(1);

      const currentProgress = activationProgress[0];
      const simulatorsCompleted = completedSimulators.length;
      const totalRequired = 6; // Business, Grants, Proposals, Contracts, Real-Eye-Nation, Other

      let newStatus: "not_started" | "in_progress" | "ready_for_activation" | "activated" | "suspended" = "in_progress";
      let readyAt = null;

      if (simulatorsCompleted === totalRequired) {
        newStatus = "ready_for_activation";
        readyAt = new Date();
      }

      if (currentProgress) {
        await db
          .update(activationProgressTable)
          .set({
            simulatorsCompleted,
            activationStatus: newStatus,
            activationReadyAt: readyAt,
            updatedAt: new Date(),
          })
          .where(eq(activationProgressTable.userId, userId));
      } else {
        await db.insert(activationProgressTable).values({
          userId,
          simulatorsCompleted,
          activationStatus: newStatus,
          activationReadyAt: readyAt,
          totalSimulatorsRequired: totalRequired,
        });
      }

      return {
        success: true,
        simulatorsCompleted,
        totalRequired,
        readyForActivation: simulatorsCompleted === totalRequired,
      };
    }),

  /**
   * Get activation progress for current user
   */
  getActivationProgress: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const progress = await db
      .select()
      .from(activationProgressTable)
      .where(eq(activationProgressTable.userId, userId))
      .limit(1);

    const completedSimulators = await db
      .select()
      .from(simulatorCompletion)
      .where(eq(simulatorCompletion.userId, userId));

    return {
      progress: progress[0] || null,
      completedSimulators: completedSimulators.map((s) => s.simulatorType),
      readyForActivation:
        completedSimulators.length === 6 ||
        progress[0]?.activationStatus === "ready_for_activation",
    };
  }),

  /**
   * Activate user's cloned build
   * Only callable when all simulators are completed
   */
  activateClonedBuild: protectedProcedure
    .input(
      z.object({
        businessName: z.string(),
        businessType: z.string(),
        masterBuildId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if all simulators are completed
      const completedSimulators = await db
        .selectDistinct({ simulatorType: simulatorCompletion.simulatorType })
        .from(simulatorCompletion)
        .where(eq(simulatorCompletion.userId, userId));

      if (completedSimulators.length < 6) {
        throw new Error("Not all simulators completed. Cannot activate build.");
      }

      // Create cloned build record
      const clonedBuild = await db.insert(clonedBuilds).values({
        userId,
        masterBuildId: input.masterBuildId,
        businessName: input.businessName,
        businessType: input.businessType,
        cloneStatus: "provisioning",
      });

      // TODO: Implement actual cloning logic
      // 1. Clone House structure
      // 2. Clone Heirs structure
      // 3. Clone Assets structure
      // 4. Initialize Tokens
      // 5. Create Dashboard
      // 6. Link via LuvLedger

      // Update activation progress
      await db
        .update(activationProgressTable)
        .set({
          activationStatus: "activated",
          activatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(activationProgressTable.userId, userId));

      return {
        success: true,
        clonedBuildId: clonedBuild.insertId,
        message: "Build activation started. Your personalized system is being provisioned.",
      };
    }),

  /**
   * Get cloned build status
   */
  getClonedBuildStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const clonedBuild = await db
      .select()
      .from(clonedBuilds)
      .where(eq(clonedBuilds.userId, userId))
      .limit(1);

    return clonedBuild[0] || null;
  }),
});

// Import tables (these will be imported from schema after migration)
// For now, using placeholder imports - will be fixed after schema is synced
import { simulatorCompletion, clonedBuilds, activationProgressTable } from "../db";
