/**
 * House of Many Tongues Router
 * Phase 19.3: Language learning API endpoints
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  getAllLanguages,
  getLanguagesByCategory,
  getLanguageLessons,
  startLesson,
  completeLesson,
  getStudentLanguageProgress,
  getLanguageMasteryStats,
  createLivingScroll,
  seedLanguages,
  seedLanguageLessons,
  INDIGENOUS_TONGUES,
  ANCESTRAL_FLAME_TONGUES,
  GLOBAL_TRADE_TONGUES,
  LANGUAGE_TOKEN_REWARDS,
} from "../services/house-of-tongues";

export const houseOfTonguesRouter = router({
  /**
   * Get all available languages
   */
  getAllLanguages: publicProcedure.query(async () => {
    return getAllLanguages();
  }),

  /**
   * Get languages by category
   */
  getLanguagesByCategory: publicProcedure
    .input(z.object({
      category: z.enum(["indigenous", "ancestral_flame", "global_trade"]),
    }))
    .query(async ({ input }) => {
      return getLanguagesByCategory(input.category);
    }),

  /**
   * Get language categories with counts
   */
  getLanguageCategories: publicProcedure.query(async () => {
    return {
      success: true,
      categories: [
        {
          id: "indigenous",
          name: "Indigenous Tongues",
          description: "Languages of the original peoples - Nahuatl, Yoruba, Lakota, and more",
          icon: "🌍",
          languages: INDIGENOUS_TONGUES,
          count: INDIGENOUS_TONGUES.length,
        },
        {
          id: "ancestral_flame",
          name: "Ancestral Flame Tongues",
          description: "Sacred languages of ancient wisdom - Hebrew, Aramaic, Ge'ez, Sanskrit",
          icon: "🔥",
          languages: ANCESTRAL_FLAME_TONGUES,
          count: ANCESTRAL_FLAME_TONGUES.length,
        },
        {
          id: "global_trade",
          name: "Global Trade Tongues",
          description: "Languages of commerce and connection - Spanish, French, Swahili, Mandarin",
          icon: "🌐",
          languages: GLOBAL_TRADE_TONGUES,
          count: GLOBAL_TRADE_TONGUES.length,
        },
      ],
    };
  }),

  /**
   * Get lessons for a specific language
   */
  getLanguageLessons: publicProcedure
    .input(z.object({
      languageId: z.number(),
      level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    }))
    .query(async ({ input }) => {
      return getLanguageLessons(input.languageId, input.level);
    }),

  /**
   * Start a language lesson
   */
  startLesson: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      languageLessonId: z.number(),
    }))
    .mutation(async ({ input }) => {
      return startLesson(input.studentProfileId, input.languageLessonId);
    }),

  /**
   * Complete a language lesson
   */
  completeLesson: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      languageLessonId: z.number(),
      score: z.number().min(0).max(100),
    }))
    .mutation(async ({ input }) => {
      return completeLesson(input.studentProfileId, input.languageLessonId, input.score);
    }),

  /**
   * Get student's language learning progress
   */
  getStudentProgress: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
    }))
    .query(async ({ input }) => {
      return getStudentLanguageProgress(input.studentProfileId);
    }),

  /**
   * Get language mastery statistics
   */
  getMasteryStats: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      languageId: z.number(),
    }))
    .query(async ({ input }) => {
      return getLanguageMasteryStats(input.studentProfileId, input.languageId);
    }),

  /**
   * Create a Living Scroll (mastery certificate)
   */
  createLivingScroll: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      languageId: z.number(),
    }))
    .mutation(async ({ input }) => {
      return createLivingScroll(input.studentProfileId, input.languageId);
    }),

  /**
   * Get token reward information
   */
  getTokenRewards: publicProcedure.query(async () => {
    return {
      success: true,
      rewards: LANGUAGE_TOKEN_REWARDS,
      description: {
        lesson_complete: "Complete any lesson",
        vocabulary_mastery: "Master a vocabulary set",
        pronunciation_achievement: "Achieve pronunciation milestone",
        conversation_practice: "Complete conversation practice",
        ceremony_participation: "Participate in ceremonial lesson",
        story_completion: "Complete a cultural story",
        chant_mastery: "Master a traditional chant",
        level_completion: "Complete all lessons in a level",
        language_mastery: "Achieve language mastery (Living Scroll)",
      },
    };
  }),

  /**
   * Seed languages (admin only)
   */
  seedLanguages: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if admin
    if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
      return { success: false, message: "Admin access required" };
    }
    return seedLanguages();
  }),

  /**
   * Seed lessons for a language (admin only)
   */
  seedLessons: protectedProcedure
    .input(z.object({
      languageId: z.number(),
      languageName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if admin
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        return { success: false, message: "Admin access required" };
      }
      return seedLanguageLessons(input.languageId, input.languageName);
    }),
});
