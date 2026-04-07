/**
 * Real-time Collaboration Router
 * Handles multi-user dashboard synchronization and shared alert management
 */

import { router, protectedProcedure } from "../_core/trpc";
import { realtimeCollaborationService } from "../_core/realtimeCollaboration";
import { z } from "zod";

export const realtimeCollaborationRouter = router({
  /**
   * Register user session for real-time collaboration
   */
  registerSession: protectedProcedure
    .input(
      z.object({
        viewingPage: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const session = realtimeCollaborationService.registerSession(
        ctx.user.id.toString(),
        ctx.user.name || "Unknown User",
        `session_${ctx.user.id}_${Date.now()}`,
        input.viewingPage
      );

      return {
        sessionId: session.sessionId,
        connectedAt: session.connectedAt,
      };
    }),

  /**
   * Unregister user session
   */
  unregisterSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(({ input }) => {
      realtimeCollaborationService.unregisterSession(input.sessionId);
      return { success: true };
    }),

  /**
   * Get active users on current page
   */
  getActiveUsers: protectedProcedure
    .input(
      z.object({
        page: z.string(),
      })
    )
    .query(({ input }) => {
      const users = realtimeCollaborationService.getUsersOnPage(input.page);
      return users.map((u) => ({
        userId: u.userId,
        userName: u.userName,
        viewingPage: u.viewingPage,
        connectedAt: u.connectedAt,
      }));
    }),

  /**
   * Update user heartbeat
   */
  updateHeartbeat: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(({ input }) => {
      realtimeCollaborationService.updateHeartbeat(input.sessionId);
      return { success: true };
    }),

  /**
   * Acknowledge alert
   */
  acknowledgeAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const alert = realtimeCollaborationService.acknowledgeAlert(
        input.alertId,
        ctx.user.id.toString(),
        ctx.user.name || "Unknown User"
      );

      return {
        alertId: alert.alertId,
        acknowledgedBy: Array.from(alert.acknowledgedBy),
        acknowledgedCount: alert.acknowledgedBy.size,
      };
    }),

  /**
   * Resolve alert
   */
  resolveAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const alert = realtimeCollaborationService.resolveAlert(
        input.alertId,
        ctx.user.id.toString(),
        ctx.user.name || "Unknown User"
      );

      if (!alert) {
        throw new Error("Alert not found");
      }

      return {
        alertId: alert.alertId,
        resolved: true,
        resolvedBy: alert.resolvedBy,
        resolvedAt: alert.resolvedAt,
      };
    }),

  /**
   * Watch alert for updates
   */
  watchAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      realtimeCollaborationService.watchAlert(input.alertId, ctx.user.id.toString());
      return { success: true };
    }),

  /**
   * Get alert status
   */
  getAlertStatus: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
      })
    )
    .query(({ input }) => {
      const alert = realtimeCollaborationService.getAlertStatus(input.alertId);

      if (!alert) {
        return null;
      }

      return {
        alertId: alert.alertId,
        acknowledgedBy: Array.from(alert.acknowledgedBy),
        acknowledgedCount: alert.acknowledgedBy.size,
        resolved: !!alert.resolvedBy,
        resolvedBy: alert.resolvedBy,
        resolvedAt: alert.resolvedAt,
        watchers: Array.from(alert.watchers),
      };
    }),

  /**
   * Get all shared alerts
   */
  getAllSharedAlerts: protectedProcedure.query(() => {
    const alerts = realtimeCollaborationService.getAllSharedAlerts();

    return alerts.map((alert) => ({
      alertId: alert.alertId,
      acknowledgedBy: Array.from(alert.acknowledgedBy),
      acknowledgedCount: alert.acknowledgedBy.size,
      resolved: !!alert.resolvedBy,
      resolvedBy: alert.resolvedBy,
      resolvedAt: alert.resolvedAt,
      watchers: Array.from(alert.watchers),
    }));
  }),

  /**
   * Get collaboration stats
   */
  getStats: protectedProcedure.query(() => {
    return realtimeCollaborationService.getStats();
  }),

  /**
   * Get event history
   */
  getEventHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(100),
      })
    )
    .query(({ input }) => {
      const events = realtimeCollaborationService.getEventHistory(input.limit);

      return events.map((e) => ({
        id: e.id,
        type: e.type,
        userId: e.userId,
        userName: e.userName,
        timestamp: e.timestamp,
        data: e.data,
      }));
    }),

  /**
   * Get active users count
   */
  getActiveUsersCount: protectedProcedure.query(() => {
    const stats = realtimeCollaborationService.getStats();
    return { count: stats.activeUsers };
  }),

  /**
   * Get alert acknowledgment summary
   */
  getAlertAcknowledgmentSummary: protectedProcedure.query(() => {
    const stats = realtimeCollaborationService.getStats();

    return {
      totalAlerts: stats.sharedAlerts,
      acknowledgedAlerts: stats.acknowledgedAlerts,
      unresolvedAlerts: stats.unresolvedAlerts,
      acknowledgmentRate:
        stats.sharedAlerts > 0
          ? ((stats.acknowledgedAlerts / stats.sharedAlerts) * 100).toFixed(1)
          : 0,
    };
  }),

  /**
   * Get collaboration health
   */
  getCollaborationHealth: protectedProcedure.query(() => {
    const stats = realtimeCollaborationService.getStats();

    return {
      status: stats.activeUsers > 0 ? "healthy" : "idle",
      activeUsers: stats.activeUsers,
      totalEvents: stats.eventCount,
      sharedAlerts: stats.sharedAlerts,
      acknowledgedAlerts: stats.acknowledgedAlerts,
      unresolvedAlerts: stats.unresolvedAlerts,
      timestamp: new Date(),
    };
  }),
});
