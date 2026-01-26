import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  checkComplianceThresholds,
  getActiveAlerts,
  acknowledgeAlert,
  getAlertHistory,
  getAlertStats
} from "../services/compliance-alerts";

export const complianceAlertsRouter = router({
  // Get all active (unacknowledged) alerts
  getActive: publicProcedure.query(async () => {
    const alerts = await getActiveAlerts();
    return alerts;
  }),

  // Get alert statistics
  getStats: publicProcedure.query(async () => {
    const stats = await getAlertStats();
    return stats;
  }),

  // Get alert history with optional department filter
  getHistory: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      department: z.string().optional()
    }).optional())
    .query(async ({ input }) => {
      const history = await getAlertHistory(
        input?.limit || 50,
        input?.department
      );
      return history;
    }),

  // Acknowledge an alert
  acknowledge: protectedProcedure
    .input(z.object({
      alertId: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      const success = await acknowledgeAlert(input.alertId, ctx.user.id);
      return { success };
    }),

  // Manually trigger compliance check (admin only)
  runCheck: protectedProcedure
    .input(z.object({
      config: z.object({
        belowTargetThreshold: z.number().min(1).max(50).default(5),
        approachingDeadlineDays: z.number().min(1).max(14).default(3),
        overdueSpikeThreshold: z.number().min(5).max(100).default(20)
      }).optional()
    }).optional())
    .mutation(async ({ input }) => {
      const result = await checkComplianceThresholds(input?.config);
      return {
        success: true,
        generated: result.generated,
        totalAlerts: result.alerts.length,
        alerts: result.alerts
      };
    }),

  // Acknowledge multiple alerts at once
  acknowledgeMultiple: protectedProcedure
    .input(z.object({
      alertIds: z.array(z.number())
    }))
    .mutation(async ({ input, ctx }) => {
      let acknowledged = 0;
      for (const alertId of input.alertIds) {
        const success = await acknowledgeAlert(alertId, ctx.user.id);
        if (success) acknowledged++;
      }
      return { acknowledged, total: input.alertIds.length };
    }),

  // Get alerts by severity
  getBySeverity: publicProcedure
    .input(z.object({
      severity: z.enum(['info', 'warning', 'critical'])
    }))
    .query(async ({ input }) => {
      const allAlerts = await getActiveAlerts();
      return allAlerts.filter(alert => alert.severity === input.severity);
    }),

  // Get alerts by department
  getByDepartment: publicProcedure
    .input(z.object({
      department: z.string()
    }))
    .query(async ({ input }) => {
      const allAlerts = await getActiveAlerts();
      return allAlerts.filter(alert => alert.department === input.department);
    }),

  // Get critical alerts count (for notification badge)
  getCriticalCount: publicProcedure.query(async () => {
    const alerts = await getActiveAlerts();
    const critical = alerts.filter(a => a.severity === 'critical').length;
    const warning = alerts.filter(a => a.severity === 'warning').length;
    return { critical, warning, total: alerts.length };
  })
});
