import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  checkComplianceThresholds,
  getActiveAlerts,
  acknowledgeAlert,
  getAlertHistory,
  getAlertStats
} from "../services/compliance-alerts";
import {
  runDailyThresholdCheck,
  runEscalationCheck,
  runWeeklyDigest,
  getScheduledCheckStatus,
  toggleScheduledCheck,
  runAllScheduledChecks
} from "../services/scheduled-compliance";
import {
  sendAlertEmailNotification,
  sendWeeklyDigestEmails,
  getNotificationHistory,
  getNotificationStats
} from "../services/email-notifications";

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
  }),

  // ========== SCHEDULED CHECKS ==========

  // Get status of all scheduled compliance checks
  getScheduledChecks: publicProcedure.query(async () => {
    const checks = await getScheduledCheckStatus();
    return checks;
  }),

  // Toggle a scheduled check on/off
  toggleScheduledCheck: protectedProcedure
    .input(z.object({
      checkType: z.enum(['daily_threshold', 'weekly_digest', 'escalation_check', 'reminder_processing']),
      enabled: z.boolean()
    }))
    .mutation(async ({ input }) => {
      const success = await toggleScheduledCheck(input.checkType, input.enabled);
      return { success };
    }),

  // Manually run daily threshold check
  runDailyCheck: protectedProcedure.mutation(async () => {
    const result = await runDailyThresholdCheck();
    return result;
  }),

  // Manually run escalation check
  runEscalationCheck: protectedProcedure.mutation(async () => {
    const result = await runEscalationCheck();
    return result;
  }),

  // Manually run weekly digest
  runWeeklyDigest: protectedProcedure.mutation(async () => {
    const result = await runWeeklyDigest();
    return result;
  }),

  // Run all due scheduled checks
  runAllDueChecks: protectedProcedure.mutation(async () => {
    const results = await runAllScheduledChecks();
    return { 
      checksRun: results.length,
      results 
    };
  }),

  // ========== NOTIFICATIONS ==========

  // Send email notification for a specific alert
  sendAlertNotification: protectedProcedure
    .input(z.object({
      alertId: z.number(),
      recipientEmail: z.string().email().optional()
    }))
    .mutation(async ({ input }) => {
      // Get the alert details
      const alerts = await getActiveAlerts();
      const alert = alerts.find(a => a.id === input.alertId);
      
      if (!alert) {
        return { success: false, error: 'Alert not found' };
      }

      const result = await sendAlertEmailNotification({
        alertId: alert.id,
        alertType: alert.alertType,
        severity: alert.severity,
        department: alert.department,
        title: alert.title,
        message: alert.message,
        currentValue: alert.currentValue,
        thresholdValue: alert.thresholdValue,
        createdAt: alert.createdAt
      }, input.recipientEmail);

      return result;
    }),

  // Send weekly digest emails
  sendWeeklyDigest: protectedProcedure.mutation(async () => {
    const result = await sendWeeklyDigestEmails();
    return result;
  }),

  // Get notification history
  getNotificationHistory: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      type: z.enum(['compliance_alert', 'signature_reminder', 'weekly_digest', 'escalation_notice', 'system_notification']).optional()
    }).optional())
    .query(async ({ input }) => {
      const history = await getNotificationHistory(
        input?.limit || 50,
        input?.type
      );
      return history;
    }),

  // Get notification statistics
  getNotificationStats: publicProcedure.query(async () => {
    const stats = await getNotificationStats();
    return stats;
  }),

  // ========== ESCALATION RULES ==========

  // Get escalation rules
  getEscalationRules: publicProcedure.query(async () => {
    const { db } = await import("../db");
    const { sql } = await import("drizzle-orm");
    
    try {
      const result = await db.execute(sql`
        SELECT 
          id, name, description,
          from_severity as fromSeverity,
          to_severity as toSeverity,
          hours_until_escalation as hoursUntilEscalation,
          notify_on_escalation as notifyOnEscalation,
          notify_roles as notifyRoles,
          notify_emails as notifyEmails,
          applies_to_departments as appliesToDepartments,
          applies_to_alert_types as appliesToAlertTypes,
          is_enabled as isEnabled,
          created_at as createdAt
        FROM alert_escalation_rules
        ORDER BY from_severity, hours_until_escalation
      `);
      return result.rows;
    } catch (error) {
      console.error('[ComplianceAlerts] Error getting escalation rules:', error);
      return [];
    }
  }),

  // Update escalation rule
  updateEscalationRule: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      hoursUntilEscalation: z.number().min(1).max(168).optional(),
      notifyOnEscalation: z.boolean().optional(),
      notifyRoles: z.array(z.string()).optional(),
      notifyEmails: z.array(z.string().email()).optional(),
      isEnabled: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");
      
      try {
        const updates: string[] = [];
        const values: any[] = [];

        if (input.name !== undefined) {
          updates.push('name = ?');
          values.push(input.name);
        }
        if (input.description !== undefined) {
          updates.push('description = ?');
          values.push(input.description);
        }
        if (input.hoursUntilEscalation !== undefined) {
          updates.push('hours_until_escalation = ?');
          values.push(input.hoursUntilEscalation);
        }
        if (input.notifyOnEscalation !== undefined) {
          updates.push('notify_on_escalation = ?');
          values.push(input.notifyOnEscalation);
        }
        if (input.notifyRoles !== undefined) {
          updates.push('notify_roles = ?');
          values.push(JSON.stringify(input.notifyRoles));
        }
        if (input.notifyEmails !== undefined) {
          updates.push('notify_emails = ?');
          values.push(JSON.stringify(input.notifyEmails));
        }
        if (input.isEnabled !== undefined) {
          updates.push('is_enabled = ?');
          values.push(input.isEnabled);
        }

        if (updates.length === 0) {
          return { success: true };
        }

        await db.execute(sql`
          UPDATE alert_escalation_rules
          SET ${sql.raw(updates.join(', '))}
          WHERE id = ${input.id}
        `);

        return { success: true };
      } catch (error) {
        console.error('[ComplianceAlerts] Error updating escalation rule:', error);
        return { success: false, error: 'Failed to update rule' };
      }
    }),

  // Create new escalation rule
  createEscalationRule: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      fromSeverity: z.enum(['info', 'warning']),
      toSeverity: z.enum(['warning', 'critical']),
      hoursUntilEscalation: z.number().min(1).max(168),
      notifyOnEscalation: z.boolean().default(true),
      notifyRoles: z.array(z.string()).optional(),
      notifyEmails: z.array(z.string().email()).optional()
    }))
    .mutation(async ({ input }) => {
      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");
      
      try {
        await db.execute(sql`
          INSERT INTO alert_escalation_rules (
            name, description, from_severity, to_severity,
            hours_until_escalation, notify_on_escalation,
            notify_roles, notify_emails, is_enabled
          ) VALUES (
            ${input.name},
            ${input.description || null},
            ${input.fromSeverity},
            ${input.toSeverity},
            ${input.hoursUntilEscalation},
            ${input.notifyOnEscalation},
            ${input.notifyRoles ? JSON.stringify(input.notifyRoles) : null},
            ${input.notifyEmails ? JSON.stringify(input.notifyEmails) : null},
            TRUE
          )
        `);

        return { success: true };
      } catch (error) {
        console.error('[ComplianceAlerts] Error creating escalation rule:', error);
        return { success: false, error: 'Failed to create rule' };
      }
    }),

  // Delete escalation rule
  deleteEscalationRule: protectedProcedure
    .input(z.object({
      id: z.number()
    }))
    .mutation(async ({ input }) => {
      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");
      
      try {
        await db.execute(sql`
          DELETE FROM alert_escalation_rules WHERE id = ${input.id}
        `);
        return { success: true };
      } catch (error) {
        console.error('[ComplianceAlerts] Error deleting escalation rule:', error);
        return { success: false, error: 'Failed to delete rule' };
      }
    })
});
