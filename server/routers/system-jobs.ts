import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  runJob,
  getAvailableJobs,
  getJobHistory,
  isJobRunning,
  getJobStats,
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
   * Get job execution history from database
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
   * Get job execution statistics
   */
  getJobStats: protectedProcedure.query(async () => {
    return getJobStats();
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
    .mutation(async ({ input, ctx }) => {
      const result = await runJob(input.jobName, "manual", ctx.user?.id);
      return result;
    }),

  /**
   * Run signature expiration notification job
   */
  runSignatureExpirationJob: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await runJob("signature_expiration_notifications", "manual", ctx.user?.id);
    return result;
  }),

  /**
   * Run daily summary report job
   */
  runDailySummaryReport: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await runJob("daily_summary_report", "manual", ctx.user?.id);
    return result;
  }),

  /**
   * Run weekly compliance audit job
   */
  runWeeklyComplianceAudit: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await runJob("weekly_compliance_audit", "manual", ctx.user?.id);
    return result;
  }),

  /**
   * Run monthly data cleanup job
   */
  runMonthlyDataCleanup: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await runJob("monthly_data_cleanup", "manual", ctx.user?.id);
    return result;
  }),
});
