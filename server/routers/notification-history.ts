/**
 * Notification History Router
 * Phase 68: Notification history dashboard with delivery status tracking
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  recordNotification,
  updateNotificationStatus,
  markAsRead,
  markMultipleAsRead,
  getNotificationHistory,
  getUnreadCount,
  getNotificationStatistics,
  getUserPreferences,
  updateUserPreferences,
  shouldSendNotification,
  deleteOldNotifications,
  getRecentNotifications,
  markForResend,
  getNotificationById,
  getAllNotificationTypes,
  getAllNotificationChannels,
  type NotificationType,
  type NotificationChannel,
  type DeliveryStatus,
} from "../services/notification-history";

const notificationTypeSchema = z.enum([
  'compliance_reminder',
  'deadline_alert',
  'document_expiration',
  'overdue_task',
  'weekly_digest',
  'system_alert',
  'approval_request',
  'task_assignment',
  'payment_notification',
  'security_alert',
]);

const notificationChannelSchema = z.enum(['email', 'in_app', 'sms', 'push']);

const deliveryStatusSchema = z.enum(['pending', 'sent', 'delivered', 'failed', 'bounced', 'read']);

export const notificationHistoryRouter = router({
  /**
   * Get notification history with filters and pagination
   */
  getHistory: protectedProcedure
    .input(z.object({
      types: z.array(notificationTypeSchema).optional(),
      channels: z.array(notificationChannelSchema).optional(),
      statuses: z.array(deliveryStatusSchema).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      unreadOnly: z.boolean().optional(),
      relatedEntityType: z.string().optional(),
      relatedEntityId: z.number().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }))
    .query(({ ctx, input }) => {
      return getNotificationHistory(
        {
          userId: ctx.user.id,
          types: input.types as NotificationType[] | undefined,
          channels: input.channels as NotificationChannel[] | undefined,
          statuses: input.statuses as DeliveryStatus[] | undefined,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          unreadOnly: input.unreadOnly,
          relatedEntityType: input.relatedEntityType,
          relatedEntityId: input.relatedEntityId,
        },
        input.page,
        input.pageSize
      );
    }),

  /**
   * Get recent notifications for notification bell/dropdown
   */
  getRecent: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(({ ctx, input }) => {
      return getRecentNotifications(ctx.user.id, input.limit);
    }),

  /**
   * Get unread notification count
   */
  getUnreadCount: protectedProcedure
    .query(({ ctx }) => {
      return getUnreadCount(ctx.user.id);
    }),

  /**
   * Get notification statistics
   */
  getStatistics: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(({ ctx, input }) => {
      return getNotificationStatistics(
        ctx.user.id,
        input.startDate ? new Date(input.startDate) : undefined,
        input.endDate ? new Date(input.endDate) : undefined
      );
    }),

  /**
   * Mark a single notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
    }))
    .mutation(({ input }) => {
      const result = markAsRead(input.notificationId);
      return { success: result !== null };
    }),

  /**
   * Mark multiple notifications as read
   */
  markMultipleAsRead: protectedProcedure
    .input(z.object({
      notificationIds: z.array(z.number()),
    }))
    .mutation(({ input }) => {
      const count = markMultipleAsRead(input.notificationIds);
      return { success: true, count };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure
    .mutation(({ ctx }) => {
      const history = getNotificationHistory(
        { userId: ctx.user.id, unreadOnly: true },
        1,
        1000
      );
      const ids = history.notifications.map(n => n.id);
      const count = markMultipleAsRead(ids);
      return { success: true, count };
    }),

  /**
   * Get user notification preferences
   */
  getPreferences: protectedProcedure
    .query(({ ctx }) => {
      return getUserPreferences(ctx.user.id);
    }),

  /**
   * Update user notification preferences
   */
  updatePreferences: protectedProcedure
    .input(z.object({
      emailEnabled: z.boolean().optional(),
      inAppEnabled: z.boolean().optional(),
      smsEnabled: z.boolean().optional(),
      pushEnabled: z.boolean().optional(),
      quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
      quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
      excludedTypes: z.array(notificationTypeSchema).optional(),
      digestFrequency: z.enum(['daily', 'weekly', 'never']).optional(),
      urgentOverrideQuietHours: z.boolean().optional(),
    }))
    .mutation(({ ctx, input }) => {
      return updateUserPreferences(ctx.user.id, {
        ...input,
        quietHoursStart: input.quietHoursStart ?? undefined,
        quietHoursEnd: input.quietHoursEnd ?? undefined,
        excludedTypes: input.excludedTypes as NotificationType[] | undefined,
      });
    }),

  /**
   * Get a single notification by ID
   */
  getById: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
    }))
    .query(({ input }) => {
      return getNotificationById(input.notificationId);
    }),

  /**
   * Resend a failed notification
   */
  resend: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
    }))
    .mutation(({ input }) => {
      const result = markForResend(input.notificationId);
      return { success: result !== null, notification: result };
    }),

  /**
   * Get all available notification types
   */
  getNotificationTypes: protectedProcedure
    .query(() => {
      return getAllNotificationTypes();
    }),

  /**
   * Get all available notification channels
   */
  getNotificationChannels: protectedProcedure
    .query(() => {
      return getAllNotificationChannels();
    }),

  /**
   * Delete old notifications (admin only)
   */
  deleteOld: protectedProcedure
    .input(z.object({
      olderThanDays: z.number().min(1).max(365),
    }))
    .mutation(({ ctx, input }) => {
      // Only delete user's own notifications
      const count = deleteOldNotifications(input.olderThanDays, ctx.user.id);
      return { success: true, deletedCount: count };
    }),

  /**
   * Check if notification should be sent (for testing preferences)
   */
  checkShouldSend: protectedProcedure
    .input(z.object({
      type: notificationTypeSchema,
      channel: notificationChannelSchema,
      isUrgent: z.boolean().default(false),
    }))
    .query(({ ctx, input }) => {
      return shouldSendNotification(
        ctx.user.id,
        input.type as NotificationType,
        input.channel as NotificationChannel,
        input.isUrgent
      );
    }),

  /**
   * Record a test notification (for development/testing)
   */
  recordTest: protectedProcedure
    .input(z.object({
      type: notificationTypeSchema,
      channel: notificationChannelSchema,
      title: z.string(),
      content: z.string(),
    }))
    .mutation(({ ctx, input }) => {
      const notification = recordNotification({
        userId: ctx.user.id,
        type: input.type as NotificationType,
        channel: input.channel as NotificationChannel,
        title: input.title,
        content: input.content,
        status: 'sent',
        sentAt: new Date(),
      });
      return notification;
    }),
});
