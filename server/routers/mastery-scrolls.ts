/**
 * Mastery Scrolls Router
 * Phase 19.5: Blockchain-anchored completion certificates API
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  createMasteryScroll,
  verifyScroll,
  getUserScrolls,
  getScrollStats,
  checkSovereignScholarEligibility,
  awardSovereignScholar,
  getScrollTemplates,
  createCourseCompletionScroll,
  createHouseGraduationScroll,
  createLanguageMasteryScroll,
  SCROLL_TEMPLATES,
} from "../services/mastery-scrolls";

export const masteryScrollsRouter = router({
  /**
   * Get all scroll templates
   */
  getTemplates: publicProcedure.query(async () => {
    return getScrollTemplates();
  }),

  /**
   * Verify a scroll by hash
   */
  verify: publicProcedure
    .input(z.object({
      scrollHash: z.string(),
    }))
    .query(async ({ input }) => {
      return verifyScroll(input.scrollHash);
    }),

  /**
   * Get user's scrolls
   */
  getUserScrolls: protectedProcedure.query(async ({ ctx }) => {
    return getUserScrolls(ctx.user.id);
  }),

  /**
   * Get scroll statistics for current user
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return getScrollStats(ctx.user.id);
  }),

  /**
   * Check Sovereign Scholar eligibility
   */
  checkSovereignEligibility: protectedProcedure.query(async ({ ctx }) => {
    return checkSovereignScholarEligibility(ctx.user.id);
  }),

  /**
   * Award Sovereign Scholar scroll
   */
  awardSovereignScholar: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return awardSovereignScholar(ctx.user.id, input.studentProfileId);
    }),

  /**
   * Create a course completion scroll
   */
  createCourseScroll: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      courseId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return createCourseCompletionScroll(ctx.user.id, input.studentProfileId, input.courseId);
    }),

  /**
   * Create a house graduation scroll
   */
  createHouseScroll: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      houseId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return createHouseGraduationScroll(ctx.user.id, input.studentProfileId, input.houseId);
    }),

  /**
   * Create a language mastery scroll
   */
  createLanguageScroll: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      languageId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return createLanguageMasteryScroll(ctx.user.id, input.studentProfileId, input.languageId);
    }),

  /**
   * Create a custom scroll (admin only)
   */
  createCustomScroll: protectedProcedure
    .input(z.object({
      userId: z.number(),
      studentProfileId: z.number(),
      scrollType: z.enum([
        "course_completion",
        "module_mastery",
        "house_graduation",
        "language_mastery",
        "ceremonial_achievement",
        "sovereign_scholar",
      ]),
      achievementId: z.number().optional(),
      achievementName: z.string(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if admin
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        return { success: false, message: "Admin access required" };
      }

      return createMasteryScroll({
        userId: input.userId,
        studentProfileId: input.studentProfileId,
        scrollType: input.scrollType,
        achievementId: input.achievementId,
        achievementName: input.achievementName,
        metadata: input.metadata,
      });
    }),

  /**
   * Get scroll template details
   */
  getTemplateDetails: publicProcedure
    .input(z.object({
      scrollType: z.enum([
        "course_completion",
        "module_mastery",
        "house_graduation",
        "language_mastery",
        "ceremonial_achievement",
        "sovereign_scholar",
      ]),
    }))
    .query(async ({ input }) => {
      const template = SCROLL_TEMPLATES[input.scrollType];
      return {
        success: true,
        template: {
          type: input.scrollType,
          ...template,
        },
      };
    }),

  /**
   * Get scrolls by type for current user
   */
  getScrollsByType: protectedProcedure
    .input(z.object({
      scrollType: z.enum([
        "course_completion",
        "module_mastery",
        "house_graduation",
        "language_mastery",
        "ceremonial_achievement",
        "sovereign_scholar",
      ]),
    }))
    .query(async ({ ctx, input }) => {
      const result = await getUserScrolls(ctx.user.id);
      if (!result.success) {
        return result;
      }

      const filteredScrolls = result.scrolls.filter(
        scroll => scroll.type === input.scrollType
      );

      return {
        success: true,
        scrolls: filteredScrolls,
        count: filteredScrolls.length,
      };
    }),

  /**
   * Get token rewards summary
   */
  getTokenRewards: publicProcedure.query(async () => {
    return {
      success: true,
      rewards: Object.entries(SCROLL_TEMPLATES).map(([type, template]) => ({
        type,
        name: template.name,
        tokens: template.tokensAwarded,
      })),
      totalPossible: Object.values(SCROLL_TEMPLATES).reduce(
        (sum, t) => sum + t.tokensAwarded,
        0
      ),
    };
  }),
});
