/**
 * Workflow Execution Router
 * Handles workflow execution, scheduling, and management
 */

import { router, protectedProcedure } from "../_core/trpc";
import { workflowExecutor } from "../_core/workflowExecutor";
import { z } from "zod";

export const workflowExecutionRouter = router({
  /**
   * Execute workflow immediately
   */
  executeWorkflow: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["trigger", "action", "condition"]),
            label: z.string(),
            config: z.record(z.any()),
          })
        ),
        triggerData: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const execution = await workflowExecutor.executeWorkflow(
        input.workflowId,
        input.nodes,
        input.triggerData
      );

      return {
        id: execution.id,
        status: execution.status,
        startedAt: execution.startedAt,
        result: execution.result,
        error: execution.error,
      };
    }),

  /**
   * Schedule workflow execution
   */
  scheduleWorkflow: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        cronExpression: z.string(),
        timezone: z.string().default("UTC"),
      })
    )
    .mutation(({ input }) => {
      const schedule = workflowExecutor.scheduleWorkflow(
        input.workflowId,
        input.cronExpression,
        input.timezone
      );

      return {
        workflowId: schedule.workflowId,
        cronExpression: schedule.cronExpression,
        enabled: schedule.enabled,
        nextRun: schedule.nextRun,
      };
    }),

  /**
   * Unschedule workflow
   */
  unscheduleWorkflow: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const success = workflowExecutor.unscheduleWorkflow(input.workflowId);
      return { success };
    }),

  /**
   * Get execution status
   */
  getExecution: protectedProcedure
    .input(
      z.object({
        executionId: z.string(),
      })
    )
    .query(({ input }) => {
      const execution = workflowExecutor.getExecution(input.executionId);

      if (!execution) {
        return null;
      }

      return {
        id: execution.id,
        workflowId: execution.workflowId,
        status: execution.status,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        result: execution.result,
        error: execution.error,
        retryCount: execution.retryCount,
        maxRetries: execution.maxRetries,
      };
    }),

  /**
   * Get execution history
   */
  getExecutionHistory: protectedProcedure
    .input(
      z.object({
        workflowId: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .query(({ input }) => {
      const history = workflowExecutor.getExecutionHistory(
        input.workflowId,
        input.limit
      );

      return history.map((e) => ({
        id: e.id,
        workflowId: e.workflowId,
        status: e.status,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        error: e.error,
        retryCount: e.retryCount,
      }));
    }),

  /**
   * Retry failed execution
   */
  retryExecution: protectedProcedure
    .input(
      z.object({
        executionId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const execution = workflowExecutor.retryExecution(input.executionId);

      if (!execution) {
        throw new Error("Execution not found or cannot be retried");
      }

      return {
        id: execution.id,
        status: execution.status,
        retryCount: execution.retryCount,
        nextRetryAt: execution.nextRetryAt,
      };
    }),

  /**
   * Get schedule
   */
  getSchedule: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
      })
    )
    .query(({ input }) => {
      const schedule = workflowExecutor.getSchedule(input.workflowId);

      if (!schedule) {
        return null;
      }

      return {
        workflowId: schedule.workflowId,
        cronExpression: schedule.cronExpression,
        enabled: schedule.enabled,
        lastRun: schedule.lastRun,
        nextRun: schedule.nextRun,
        timezone: schedule.timezone,
      };
    }),

  /**
   * Get all schedules
   */
  getAllSchedules: protectedProcedure.query(() => {
    const schedules = workflowExecutor.getAllSchedules();

    return schedules.map((s) => ({
      workflowId: s.workflowId,
      cronExpression: s.cronExpression,
      enabled: s.enabled,
      lastRun: s.lastRun,
      nextRun: s.nextRun,
      timezone: s.timezone,
    }));
  }),

  /**
   * Get execution statistics
   */
  getStats: protectedProcedure.query(() => {
    return workflowExecutor.getStats();
  }),

  /**
   * Get workflow execution health
   */
  getHealth: protectedProcedure.query(() => {
    const stats = workflowExecutor.getStats();

    return {
      status:
        stats.failedExecutions === 0 && stats.activeSchedules > 0
          ? "healthy"
          : stats.failedExecutions > 0
            ? "degraded"
            : "idle",
      totalExecutions: stats.totalExecutions,
      successRate: stats.successRate,
      failedExecutions: stats.failedExecutions,
      retryingExecutions: stats.retryingExecutions,
      activeSchedules: stats.activeSchedules,
      timestamp: new Date(),
    };
  }),

  /**
   * Test workflow execution
   */
  testWorkflow: protectedProcedure
    .input(
      z.object({
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["trigger", "action", "condition"]),
            label: z.string(),
            config: z.record(z.any()),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const execution = await workflowExecutor.executeWorkflow(
        `test_${Date.now()}`,
        input.nodes
      );

      return {
        success: execution.status === "completed",
        status: execution.status,
        result: execution.result,
        error: execution.error,
      };
    }),

  /**
   * Get execution metrics
   */
  getMetrics: protectedProcedure.query(() => {
    const stats = workflowExecutor.getStats();

    return {
      totalExecutions: stats.totalExecutions,
      successfulExecutions: stats.successfulExecutions,
      failedExecutions: stats.failedExecutions,
      retryingExecutions: stats.retryingExecutions,
      successRate: stats.successRate,
      activeSchedules: stats.activeSchedules,
      averageRetries:
        stats.failedExecutions > 0
          ? (
              (stats.retryingExecutions /
                (stats.failedExecutions + stats.retryingExecutions)) *
              100
            ).toFixed(1)
          : 0,
      timestamp: new Date(),
    };
  }),
});
