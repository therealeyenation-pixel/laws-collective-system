/**
 * Guardian Dashboard Router
 * Phase 19.6: Parent/guardian dashboard API
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  getGuardianStudents,
  getStudentsSummary,
  getStudentDetailedProgress,
  linkStudentToGuardian,
  getGuardianNotifications,
  getGuardianStats,
} from "../services/guardian-dashboard";

export const guardianDashboardRouter = router({
  /**
   * Get all students linked to the guardian
   */
  getStudents: protectedProcedure.query(async ({ ctx }) => {
    return getGuardianStudents(ctx.user.id);
  }),

  /**
   * Get progress summary for all students
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    return getStudentsSummary(ctx.user.id);
  }),

  /**
   * Get detailed progress for a specific student
   */
  getStudentProgress: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      return getStudentDetailedProgress(ctx.user.id, input.studentProfileId);
    }),

  /**
   * Link a student to the guardian
   */
  linkStudent: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
      relationship: z.enum(["parent", "grandparent", "guardian", "mentor", "teacher"]),
    }))
    .mutation(async ({ ctx, input }) => {
      return linkStudentToGuardian(ctx.user.id, input.studentProfileId, input.relationship);
    }),

  /**
   * Get guardian notifications
   */
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    return getGuardianNotifications(ctx.user.id);
  }),

  /**
   * Get aggregate statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return getGuardianStats(ctx.user.id);
  }),
});
