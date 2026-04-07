/**
 * System Health & Auto-Update Router
 * Provides endpoints for health monitoring, diagnostics, and error tracking
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { autoUpdateService } from "../_core/autoUpdate";
import { z } from "zod";

export const systemHealthRouter = router({
  /**
   * Get current system health status
   */
  getHealth: publicProcedure.query(async () => {
    return await autoUpdateService.getSystemHealth();
  }),

  /**
   * Run full system diagnostics
   */
  runDiagnostics: protectedProcedure.query(async () => {
    return await autoUpdateService.runDiagnostics();
  }),

  /**
   * Get error logs
   */
  getErrorLogs: protectedProcedure
    .input(
      z
        .object({
          component: z.string().optional(),
          severity: z.enum(["info", "warning", "error", "critical"]).optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return autoUpdateService.getErrorLogs({
        component: input?.component,
        severity: input?.severity,
        limit: input?.limit,
        offset: input?.offset,
      });
    }),

  /**
   * Mark error as resolved
   */
  resolveError: protectedProcedure
    .input(z.object({ errorId: z.string() }))
    .mutation(async ({ input }) => {
      const resolved = autoUpdateService.markErrorResolved(input.errorId);
      return { success: resolved };
    }),

  /**
   * Clear resolved errors
   */
  clearResolvedErrors: protectedProcedure.mutation(async () => {
    const cleared = autoUpdateService.clearResolvedErrors();
    return { cleared };
  }),

  /**
   * Attempt auto-correction for an error
   */
  attemptAutoCorrection: protectedProcedure
    .input(z.object({ errorId: z.string() }))
    .mutation(async ({ input }) => {
      const errors = autoUpdateService.getErrorLogs({ limit: 1000 });
      const error = errors.find((e) => e.id === input.errorId);

      if (!error) {
        return { success: false, message: "Error not found" };
      }

      const corrected = await autoUpdateService.attemptAutoCorrection(error);
      if (corrected) {
        autoUpdateService.markErrorResolved(error.id);
      }

      return { success: corrected };
    }),

  /**
   * Get system metrics
   */
  getMetrics: publicProcedure.query(async () => {
    const health = await autoUpdateService.getSystemHealth();
    return {
      uptime: health.metrics.uptime,
      errorCount: health.metrics.errorCount,
      memoryUsage: health.metrics.memoryUsage,
      cpuUsage: health.metrics.cpuUsage,
      status: health.status,
    };
  }),

  /**
   * Get system status summary
   */
  getStatus: publicProcedure.query(async () => {
    const health = await autoUpdateService.getSystemHealth();
    return {
      status: health.status,
      timestamp: health.timestamp,
      components: health.components,
      issues: health.diagnostics.issues,
      recommendations: health.diagnostics.recommendations,
    };
  }),
});
