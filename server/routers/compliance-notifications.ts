/**
 * Compliance Notifications Router
 * Phase 67: Email notification integration for compliance calendar reminders
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  calculatePriority,
  formatTaskType,
  generateReminderSubject,
  generateWeeklyDigest,
  processComplianceNotifications,
  sendDeadlineReminder,
  shouldSendNotification,
  type NotificationPreferences,
} from "../services/compliance-notifications";
import {
  generateComplianceCalendar,
  getUpcomingTasksSummary,
  getReminderConfig,
  updateTaskStatuses,
  type ComplianceTask,
} from "../services/compliance-tracking";

export const complianceNotificationsRouter = router({
  /**
   * Get user's notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    // In a real implementation, this would fetch from database
    // For now, return defaults with user info
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      userId: ctx.user.id,
      email: ctx.user.email || "",
    } as NotificationPreferences;
  }),

  /**
   * Update user's notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        emailEnabled: z.boolean().optional(),
        inAppEnabled: z.boolean().optional(),
        smsEnabled: z.boolean().optional(),
        reminderDaysBefore: z.array(z.number()).optional(),
        digestFrequency: z.enum(["daily", "weekly", "none"]).optional(),
        quietHoursStart: z.number().min(0).max(23).optional(),
        quietHoursEnd: z.number().min(0).max(23).optional(),
        excludedTaskTypes: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would save to database
      console.log(`[ComplianceNotifications] Updating preferences for user ${ctx.user.id}:`, input);

      return {
        success: true,
        message: "Notification preferences updated",
        preferences: {
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...input,
          userId: ctx.user.id,
          email: ctx.user.email || "",
        },
      };
    }),

  /**
   * Get pending notifications for current user
   */
  getPendingNotifications: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const calendar = generateComplianceCalendar(input.houseId, now.getMonth() + 1, now.getFullYear());

      // Update task statuses and filter
      const updatedTasks = updateTaskStatuses(calendar.tasks);
      const overdueTasks = updatedTasks.filter((t) => t.status === "overdue");
      const dueSoonTasks = updatedTasks.filter((t) => t.status === "due_soon");

      const notifications = [
        ...overdueTasks.map((task) => ({
          id: `task-${task.taskId}`,
          type: "task_overdue" as const,
          priority: calculatePriority(-1),
          title: generateReminderSubject(task, -1),
          taskName: task.taskName,
          dueDate: task.dueDate,
          taskType: formatTaskType(task.taskType),
          createdAt: new Date(),
        })),
        ...dueSoonTasks.map((task) => {
          const daysUntil = Math.ceil(
            (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          return {
            id: `task-${task.taskId}`,
            type: "deadline_reminder" as const,
            priority: calculatePriority(daysUntil),
            title: generateReminderSubject(task, daysUntil),
            taskName: task.taskName,
            dueDate: task.dueDate,
            taskType: formatTaskType(task.taskType),
            createdAt: new Date(),
          };
        }),
        ...calendar.documentExpirations
          .filter((d) => d.status === "expired" || d.status === "expiring_soon")
          .map((doc) => ({
            id: `doc-${doc.documentId}`,
            type: doc.status === "expired" ? ("document_expired" as const) : ("document_expiring" as const),
            priority: doc.status === "expired" ? ("critical" as const) : ("high" as const),
            title: `${doc.status === "expired" ? "EXPIRED" : "Expiring"}: ${doc.documentName}`,
            taskName: doc.documentName,
            dueDate: doc.expirationDate,
            taskType: doc.documentType,
            createdAt: new Date(),
          })),
      ];

      // Sort by priority and date
      notifications.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.dueDate.getTime() - b.dueDate.getTime();
      });

      return {
        notifications: notifications.slice(0, input.limit),
        total: notifications.length,
        summary: {
          overdue: overdueTasks.length,
          dueSoon: dueSoonTasks.length,
          expiringDocs: calendar.documentExpirations.filter(
            (d) => d.status === "expiring_soon"
          ).length,
          expiredDocs: calendar.documentExpirations.filter((d) => d.status === "expired").length,
        },
      };
    }),

  /**
   * Send test notification
   */
  sendTestNotification: protectedProcedure
    .input(
      z.object({
        notificationType: z.enum(["email", "in_app"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const preferences: NotificationPreferences = {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        userId: ctx.user.id,
        email: ctx.user.email || "",
        emailEnabled: input.notificationType === "email",
        inAppEnabled: input.notificationType === "in_app",
      };

      // Create a test task
      const testTask: ComplianceTask = {
        taskId: "test-task",
        houseId: 1,
        taskType: "quarterly_941",
        taskName: "Test Compliance Notification",
        description: "This is a test notification to verify your notification settings are working correctly.",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        isRecurring: false,
        status: "due_soon",
      };

      try {
        const result = await sendDeadlineReminder(testTask, preferences, ctx.user.name || "User");
        return {
          success: result.success,
          message: result.success
            ? `Test ${input.notificationType} notification sent successfully`
            : "Notification was skipped based on preferences",
          channels: result.channels,
        };
      } catch (error) {
        console.error("[ComplianceNotifications] Test notification failed:", error);
        return {
          success: false,
          message: "Failed to send test notification",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Process and send all pending notifications for a house
   */
  processNotifications: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const calendar = generateComplianceCalendar(input.houseId, now.getMonth() + 1, now.getFullYear());

      const preferences: NotificationPreferences = {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        userId: ctx.user.id,
        email: ctx.user.email || "",
      };

      const result = await processComplianceNotifications(
        input.houseId,
        calendar.tasks,
        calendar.deadlines,
        calendar.documentExpirations,
        preferences,
        ctx.user.name || "User"
      );

      return {
        success: true,
        ...result,
      };
    }),

  /**
   * Generate and send weekly digest
   */
  sendWeeklyDigest: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const calendar = generateComplianceCalendar(input.houseId, now.getMonth() + 1, now.getFullYear());

      const { subject, htmlBody, textBody } = generateWeeklyDigest(
        calendar.tasks,
        calendar.deadlines,
        calendar.documentExpirations,
        ctx.user.name || "User"
      );

      // In a real implementation, this would send the email
      console.log(`[ComplianceNotifications] Weekly digest generated for house ${input.houseId}`);

      return {
        success: true,
        message: "Weekly digest generated",
        subject,
        preview: textBody.substring(0, 500),
      };
    }),

  /**
   * Get reminder configuration for a task type
   */
  getReminderConfig: protectedProcedure
    .input(
      z.object({
        taskType: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getReminderConfig(input.taskType as any);
      return {
        taskType: input.taskType,
        taskTypeLabel: formatTaskType(input.taskType as any),
        ...config,
      };
    }),

  /**
   * Get notification statistics
   */
  getStatistics: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
        periodDays: z.number().optional().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would query notification history from database
      const now = new Date();
      const calendar = generateComplianceCalendar(input.houseId, now.getMonth() + 1, now.getFullYear());

      const updatedTasks = updateTaskStatuses(calendar.tasks);
      const overdueTasks = updatedTasks.filter((t) => t.status === "overdue");
      const dueSoonTasks = updatedTasks.filter((t) => t.status === "due_soon");

      return {
        period: {
          start: new Date(now.getTime() - input.periodDays * 24 * 60 * 60 * 1000),
          end: now,
        },
        counts: {
          totalNotificationsSent: 0, // Would be from database
          emailsSent: 0,
          inAppSent: 0,
          smsSent: 0,
        },
        currentStatus: {
          overdueItems: overdueTasks.length,
          dueSoonItems: dueSoonTasks.length,
          expiringDocuments: calendar.documentExpirations.filter(
            (d) => d.status === "expiring_soon"
          ).length,
          expiredDocuments: calendar.documentExpirations.filter((d) => d.status === "expired")
            .length,
        },
        upcomingReminders: dueSoonTasks.slice(0, 5).map((task) => ({
          taskName: task.taskName,
          dueDate: task.dueDate,
          taskType: formatTaskType(task.taskType),
        })),
      };
    }),
});
