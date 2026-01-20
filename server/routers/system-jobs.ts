import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  runJob,
  getAvailableJobs,
  getJobHistory,
  isJobRunning,
} from "../services/scheduledJobs";

/**
 * System Jobs Router
 * 
 * Manages scheduled system jobs for automated tasks like
 * signature expiration notifications, report generation, etc.
 */
export const systemJobsRouter = router({
  /**
   * Get all available scheduled jobs
   */
  getAvailableJobs: protectedProcedure.query(async () => {
    return getAvailableJobs();
  }),

  /**
   * Get job execution history
   */
  getJobHistory: protectedProcedure
    .input(
      z.object({
        jobName: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      return getJobHistory(input?.jobName, input?.limit);
    }),

  /**
   * Check if a job is currently running
   */
  isJobRunning: protectedProcedure
    .input(
      z.object({
        jobName: z.string(),
      })
    )
    .query(async ({ input }) => {
      return { isRunning: isJobRunning(input.jobName) };
    }),

  /**
   * Run a job manually
   */
  runJob: protectedProcedure
    .input(
      z.object({
        jobName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await runJob(input.jobName);
      return result;
    }),

  /**
   * Run signature expiration notification job
   * Convenience endpoint for the most common job
   */
  runSignatureExpirationJob: protectedProcedure.mutation(async () => {
    const result = await runJob("signature_expiration_notifications");
    return result;
  }),
});
