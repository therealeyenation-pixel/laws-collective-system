/**
 * LuvLedger Brain Automation Router
 * 
 * Core procedures for the Brain (AI automation engine)
 * All operations are gated by the safety framework
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  checkBrainPermission,
  requestBrainApproval,
  approveBrainAction,
  rejectBrainAction,
  logBrainAction,
  getBrainActionHistory,
  getPendingApprovals,
  detectAnomalies,
  initializeBrainPermissions,
  updateBrainPermission,
  OperationTypes,
  BrainPermissionLevel,
} from "../services/brain-safety";

export const brainAutomationRouter = router({
  /**
   * Get Brain status and permissions for current user
   */
  getStatus: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const hasPermission = await checkBrainPermission(
        ctx.user.id.toString(),
        OperationTypes.GENERATE_INSIGHT
      );

      const anomalies = await detectAnomalies(ctx.user.id.toString());

      return {
        isActive: hasPermission,
        anomalies,
        message: anomalies.length > 0 ? "Brain operating with caution" : "Brain ready",
      };
    }),

  /**
   * Get Brain recommendations for a house
   * Low-risk operation - auto-approved
   */
  getRecommendations: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const hasPermission = await checkBrainPermission(
        ctx.user.id.toString(),
        OperationTypes.CREATE_RECOMMENDATION
      );

      if (!hasPermission) {
        throw new Error("Brain does not have permission to generate recommendations");
      }

      // Log the action
      await logBrainAction(
        {
          operationType: OperationTypes.CREATE_RECOMMENDATION,
          userId: ctx.user.id.toString(),
          houseId: input.houseId.toString(),
          description: "Generated recommendations for house",
        },
        "executed",
        "Recommendations generated"
      );

      // Return mock recommendations (replace with actual logic)
      return {
        recommendations: [
          {
            id: "rec-1",
            type: "financial",
            title: "Optimize allocation distribution",
            description: "Based on current performance, consider adjusting allocation percentages",
            priority: "medium",
            data: { currentAllocation: "30/20/50", suggested: "35/25/40" },
          },
          {
            id: "rec-2",
            type: "operational",
            title: "Schedule team meeting",
            description: "Team hasn't met in 2 weeks - consider scheduling sync",
            priority: "low",
            data: { lastMeeting: "2024-02-15", daysAgo: 21 },
          },
        ],
      };
    }),

  /**
   * Request approval for a Brain action
   * Medium/High risk operations require human approval
   */
  requestApproval: protectedProcedure
    .input(
      z.object({
        operationType: z.string(),
        houseId: z.number(),
        description: z.string(),
        data: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const operationType = input.operationType as OperationTypes;

      const hasPermission = await checkBrainPermission(
        ctx.user.id.toString(),
        operationType
      );

      if (!hasPermission) {
        throw new Error("Brain does not have permission for this operation");
      }

      const approval = await requestBrainApproval({
        operationType,
        userId: ctx.user.id.toString(),
        houseId: input.houseId.toString(),
        description: input.description,
        data: input.data,
      });

      return approval;
    }),

  /**
   * Approve a Brain action (human decision)
   */
  approveAction: protectedProcedure
    .input(
      z.object({
        actionId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await approveBrainAction(input.actionId, ctx.user.id.toString(), input.notes);

      return { success: true, message: "Action approved" };
    }),

  /**
   * Reject a Brain action (human decision)
   */
  rejectAction: protectedProcedure
    .input(
      z.object({
        actionId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await rejectBrainAction(input.actionId, ctx.user.id.toString(), input.reason);

      return { success: true, message: "Action rejected" };
    }),

  /**
   * Get action history for audit purposes
   */
  getActionHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const history = await getBrainActionHistory(ctx.user.id.toString(), input.limit);

      return {
        actions: history,
        total: history.length,
      };
    }),

  /**
   * Get pending approvals
   */
  getPendingApprovals: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const pending = await getPendingApprovals(ctx.user.id.toString());

      return {
        pending: pending.filter((p) => p.houseId === input.houseId),
        total: pending.length,
      };
    }),

  /**
   * Initialize Brain for a new house
   * Called when house is activated
   */
  initializeForHouse: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await initializeBrainPermissions(ctx.user.id.toString(), input.houseId);

      await logBrainAction(
        {
          operationType: OperationTypes.GENERATE_INSIGHT,
          userId: ctx.user.id.toString(),
          houseId: input.houseId.toString(),
          description: "Brain initialized for house",
        },
        "executed",
        "Brain initialization complete"
      );

      return {
        success: true,
        message: "Brain initialized for house",
      };
    }),

  /**
   * Get Brain insights (analytics and metrics)
   * Low-risk operation
   */
  getInsights: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const hasPermission = await checkBrainPermission(
        ctx.user.id.toString(),
        OperationTypes.GENERATE_INSIGHT
      );

      if (!hasPermission) {
        throw new Error("Brain does not have permission to generate insights");
      }

      // Return mock insights (replace with actual analysis)
      return {
        insights: [
          {
            metric: "Financial Health",
            value: "85%",
            trend: "up",
            description: "Strong performance this quarter",
          },
          {
            metric: "Team Engagement",
            value: "72%",
            trend: "stable",
            description: "Consistent participation in activities",
          },
          {
            metric: "Growth Rate",
            value: "12%",
            trend: "up",
            description: "Accelerating growth trajectory",
          },
        ],
      };
    }),

  /**
   * Send an alert (low-risk, auto-approved)
   */
  sendAlert: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
        title: z.string(),
        message: z.string(),
        severity: z.enum(["info", "warning", "critical"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hasPermission = await checkBrainPermission(
        ctx.user.id.toString(),
        OperationTypes.SEND_ALERT
      );

      if (!hasPermission) {
        throw new Error("Brain does not have permission to send alerts");
      }

      await logBrainAction(
        {
          operationType: OperationTypes.SEND_ALERT,
          userId: ctx.user.id.toString(),
          houseId: input.houseId.toString(),
          description: input.title,
          data: { message: input.message, severity: input.severity },
        },
        "executed",
        `Alert sent: ${input.severity}`
      );

      return {
        success: true,
        message: "Alert sent",
      };
    }),
});

export type BrainAutomationRouter = typeof brainAutomationRouter;
