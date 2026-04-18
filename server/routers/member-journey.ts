import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Business formation steps
const FORMATION_STEPS = [
  { step: 1, name: "Business Type Selection", description: "Choose your entity type (LLC, Trust, Corporation, etc.)" },
  { step: 2, name: "Business Plan", description: "Complete your business plan through the simulator" },
  { step: 3, name: "Entity Registration", description: "Register your business entity with the state" },
  { step: 4, name: "Financial Structure", description: "Set up your financial allocation structure" },
  { step: 5, name: "Operating Agreement", description: "Draft and sign your operating agreement" },
  { step: 6, name: "House Integration", description: "Link your entity to the LuvOnPurpose House structure" },
  { step: 7, name: "House Activation", description: "Final review and House activation" },
];

export const memberJourneyRouter = router({
  // Get current member status and formation progress
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await db
      .select({
        memberStatus: users.memberStatus,
        formationStep: users.formationStep,
        houseActivatedAt: users.houseActivatedAt,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .then(rows => rows[0]);

    if (!user) {
      return {
        memberStatus: "onboarding" as const,
        formationStep: 0,
        formationSteps: FORMATION_STEPS,
        totalSteps: FORMATION_STEPS.length,
        progressPercent: 0,
        houseActivated: false,
        houseActivatedAt: null,
        isAdmin: false,
      };
    }

    const isAdmin = user.role === "admin" || user.role === "owner" || user.role === "staff";

    return {
      memberStatus: user.memberStatus,
      formationStep: user.formationStep,
      formationSteps: FORMATION_STEPS,
      totalSteps: FORMATION_STEPS.length,
      progressPercent: Math.round((user.formationStep / FORMATION_STEPS.length) * 100),
      houseActivated: user.memberStatus === "house_activated",
      houseActivatedAt: user.houseActivatedAt,
      isAdmin,
    };
  }),

  // Update member status
  updateStatus: protectedProcedure
    .input(z.object({
      memberStatus: z.enum(["onboarding", "academy_active", "formation_in_progress", "house_activated"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, any> = {
        memberStatus: input.memberStatus,
      };

      if (input.memberStatus === "house_activated") {
        updateData.houseActivatedAt = new Date();
      }

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  // Advance formation step
  advanceFormationStep: protectedProcedure
    .input(z.object({
      step: z.number().min(1).max(7),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, any> = {
        formationStep: input.step,
      };

      // Auto-update member status based on step
      if (input.step === 1) {
        updateData.memberStatus = "formation_in_progress";
      }
      if (input.step >= FORMATION_STEPS.length) {
        updateData.memberStatus = "house_activated";
        updateData.houseActivatedAt = new Date();
      }

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
        currentStep: input.step,
        isComplete: input.step >= FORMATION_STEPS.length,
      };
    }),
});
