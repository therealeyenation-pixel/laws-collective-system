import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { lawsOnboardingProgress } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const LAWS_STEPS = [
  { key: "join_collective", number: 1, label: "Join the Collective" },
  { key: "complete_profile", number: 2, label: "Complete Your Profile" },
  { key: "attend_orientation", number: 3, label: "Attend Orientation" },
  { key: "activate_house", number: 4, label: "Activate Your House" },
  { key: "secure_vault", number: 5, label: "Secure Identity Vault" },
  { key: "designate_heirs", number: 6, label: "Designate Heirs" },
  { key: "link_business", number: 7, label: "Link Business Entities" },
  { key: "review_governance", number: 8, label: "Review Governance" },
] as const;

export const lawsOnboardingRouter = router({
  /** Get onboarding progress for the current user, initializing if needed */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    let rows = await db
      .select()
      .from(lawsOnboardingProgress)
      .where(eq(lawsOnboardingProgress.userId, userId))
      .orderBy(lawsOnboardingProgress.stepNumber);

    // Initialize steps if none exist
    if (rows.length === 0) {
      for (const step of LAWS_STEPS) {
        await db.insert(lawsOnboardingProgress).values({
          userId,
          stepKey: step.key,
          stepNumber: step.number,
          status: "not_started",
        });
      }
      rows = await db
        .select()
        .from(lawsOnboardingProgress)
        .where(eq(lawsOnboardingProgress.userId, userId))
        .orderBy(lawsOnboardingProgress.stepNumber);
    }

    const completedCount = rows.filter((r) => r.status === "completed").length;
    const totalSteps = LAWS_STEPS.length;

    return {
      steps: rows.map((r) => ({
        ...r,
        label: LAWS_STEPS.find((s) => s.key === r.stepKey)?.label ?? r.stepKey,
      })),
      completedCount,
      totalSteps,
      percentComplete: Math.round((completedCount / totalSteps) * 100),
    };
  }),

  /** Mark a step as completed */
  completeStep: protectedProcedure
    .input(z.object({ stepKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const existing = await db
        .select()
        .from(lawsOnboardingProgress)
        .where(
          and(
            eq(lawsOnboardingProgress.userId, userId),
            eq(lawsOnboardingProgress.stepKey, input.stepKey)
          )
        )
        .limit(1);

      if (!existing.length) {
        throw new Error("Step not found. Initialize progress first.");
      }

      await db
        .update(lawsOnboardingProgress)
        .set({
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(lawsOnboardingProgress.id, existing[0].id));

      return { success: true };
    }),

  /** Reset a step back to not_started */
  resetStep: protectedProcedure
    .input(z.object({ stepKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      await db
        .update(lawsOnboardingProgress)
        .set({
          status: "not_started",
          completedAt: null,
        })
        .where(
          and(
            eq(lawsOnboardingProgress.userId, userId),
            eq(lawsOnboardingProgress.stepKey, input.stepKey)
          )
        );

      return { success: true };
    }),
});
