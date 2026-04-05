/**
 * Three Learning Houses Router
 * Phase 19.4: House of Wonder (K-5), House of Form (6-8), House of Mastery (9-12)
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  getAllHouses,
  getHouseBySlug,
  getHouseCourses,
  getCourseLessons,
  assignStudentToHouse,
  getStudentHouseProgress,
  startCourse,
  completeLesson,
  graduateFromHouse,
  seedLearningHouses,
  LEARNING_HOUSES,
  HOUSE_TOKEN_REWARDS,
  DIVINE_STEM_BY_HOUSE,
  getHouseForAge,
  getHouseForGrade,
} from "../services/learning-houses";

export const learningHousesRouter = router({
  /**
   * Get all learning houses
   */
  getAllHouses: publicProcedure.query(async () => {
    return getAllHouses();
  }),

  /**
   * Get a specific house by slug
   */
  getHouseBySlug: publicProcedure
    .input(z.object({
      slug: z.enum(["wonder", "form", "mastery"]),
    }))
    .query(async ({ input }) => {
      return getHouseBySlug(input.slug);
    }),

  /**
   * Get house overview with all details
   */
  getHouseOverview: publicProcedure.query(async () => {
    return {
      success: true,
      houses: [
        {
          ...LEARNING_HOUSES.wonder,
          id: "wonder",
          modules: DIVINE_STEM_BY_HOUSE.wonder,
          tokenRewards: HOUSE_TOKEN_REWARDS.wonder,
        },
        {
          ...LEARNING_HOUSES.form,
          id: "form",
          modules: DIVINE_STEM_BY_HOUSE.form,
          tokenRewards: HOUSE_TOKEN_REWARDS.form,
        },
        {
          ...LEARNING_HOUSES.mastery,
          id: "mastery",
          modules: DIVINE_STEM_BY_HOUSE.mastery,
          tokenRewards: HOUSE_TOKEN_REWARDS.mastery,
        },
      ],
    };
  }),

  /**
   * Get courses for a specific house
   */
  getHouseCourses: publicProcedure
    .input(z.object({
      houseId: z.number(),
    }))
    .query(async ({ input }) => {
      return getHouseCourses(input.houseId);
    }),

  /**
   * Get lessons for a specific course
   */
  getCourseLessons: publicProcedure
    .input(z.object({
      courseId: z.number(),
    }))
    .query(async ({ input }) => {
      return getCourseLessons(input.courseId);
    }),

  /**
   * Determine appropriate house for a student
   */
  determineHouse: publicProcedure
    .input(z.object({
      method: z.enum(["age", "grade"]),
      value: z.union([z.number(), z.string()]),
    }))
    .query(async ({ input }) => {
      let houseSlug: string | null;
      if (input.method === "age") {
        houseSlug = getHouseForAge(input.value as number);
      } else {
        houseSlug = getHouseForGrade(input.value as string);
      }

      if (!houseSlug) {
        return {
          success: false,
          house: null,
          message: "Could not determine appropriate house for given age/grade",
        };
      }

      const house = LEARNING_HOUSES[houseSlug as keyof typeof LEARNING_HOUSES];
      return {
        success: true,
        house: {
          slug: houseSlug,
          ...house,
        },
      };
    }),

  /**
   * Assign a student to a house
   */
  assignToHouse: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      method: z.enum(["age", "grade"]),
      value: z.union([z.number(), z.string()]),
    }))
    .mutation(async ({ input }) => {
      return assignStudentToHouse(input.studentProfileId, input.method, input.value);
    }),

  /**
   * Get student's progress within their house
   */
  getStudentProgress: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
    }))
    .query(async ({ input }) => {
      return getStudentHouseProgress(input.studentProfileId);
    }),

  /**
   * Start a course
   */
  startCourse: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      courseId: z.number(),
    }))
    .mutation(async ({ input }) => {
      return startCourse(input.studentProfileId, input.courseId);
    }),

  /**
   * Complete a lesson
   */
  completeLesson: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      lessonId: z.number(),
      score: z.number().min(0).max(100),
    }))
    .mutation(async ({ input }) => {
      return completeLesson(input.studentProfileId, input.lessonId, input.score);
    }),

  /**
   * Graduate from current house
   */
  graduate: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
    }))
    .mutation(async ({ input }) => {
      return graduateFromHouse(input.studentProfileId);
    }),

  /**
   * Get token rewards information
   */
  getTokenRewards: publicProcedure.query(async () => {
    return {
      success: true,
      rewards: HOUSE_TOKEN_REWARDS,
      description: {
        wonder: "House of Wonder (K-5) - Foundation building with playful learning",
        form: "House of Form (6-8) - Knowledge taking shape through projects",
        mastery: "House of Mastery (9-12) - Deep expertise and leadership development",
      },
    };
  }),

  /**
   * Get ceremonial layers for a house
   */
  getCeremonialLayers: publicProcedure
    .input(z.object({
      slug: z.enum(["wonder", "form", "mastery"]),
    }))
    .query(async ({ input }) => {
      const house = LEARNING_HOUSES[input.slug];
      return {
        success: true,
        house: house.name,
        ceremonialLayers: house.ceremonialLayers,
        principles: house.principles,
      };
    }),

  /**
   * Seed learning houses (admin only)
   */
  seedHouses: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
      return { success: false, message: "Admin access required" };
    }
    return seedLearningHouses();
  }),
});
