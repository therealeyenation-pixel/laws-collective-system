/**
 * Mobile Push Notifications Router
 * Handles service worker registration, subscriptions, and push notifications
 */

import { router, protectedProcedure } from "../_core/trpc";
import { mobilePushNotificationsService } from "../_core/mobilePushNotifications";
import { z } from "zod";

export const mobilePushRouter = router({
  /**
   * Subscribe to push notifications
   */
  subscribeToPush: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        keys: z.object({
          auth: z.string(),
          p256dh: z.string(),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      const subscription = mobilePushNotificationsService.subscribeToPush(
        ctx.user.id.toString(),
        input,
        ctx.req?.headers["user-agent"] || "unknown"
      );

      return {
        success: true,
        subscriptionDate: subscription.subscriptionDate,
      };
    }),

  /**
   * Unsubscribe from push notifications
   */
  unsubscribeFromPush: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const success = mobilePushNotificationsService.unsubscribeFromPush(
        ctx.user.id.toString(),
        input.endpoint
      );

      return { success };
    }),

  /**
   * Get user subscriptions
   */
  getSubscriptions: protectedProcedure.query(({ ctx }) => {
    const subscriptions = mobilePushNotificationsService.getUserSubscriptions(
      ctx.user.id.toString()
    );

    return subscriptions.map((s) => ({
      endpoint: s.endpoint,
      subscriptionDate: s.subscriptionDate,
      lastActive: s.lastActive,
      isActive: s.isActive,
    }));
  }),

  /**
   * Send test push notification
   */
  sendTestNotification: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        body: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notification = await mobilePushNotificationsService.sendPushNotification(
        ctx.user.id.toString(),
        {
          userId: ctx.user.id.toString(),
          title: input.title || "Test Notification",
          body: input.body || "This is a test push notification",
          requireInteraction: false,
          actions: [],
          data: { type: "test" },
        }
      );

      return {
        id: notification.id,
        sent: notification.sent,
        timestamp: notification.timestamp,
      };
    }),

  /**
   * Send critical alert
   */
  sendCriticalAlert: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        data: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notification = await mobilePushNotificationsService.sendCriticalAlert(
        ctx.user.id.toString(),
        input.title,
        input.body,
        input.data
      );

      return {
        id: notification.id,
        sent: notification.sent,
        timestamp: notification.timestamp,
      };
    }),

  /**
   * Set notification preferences
   */
  setPreferences: protectedProcedure
    .input(
      z.object({
        globalMute: z.boolean().optional(),
        doNotDisturb: z
          .object({
            enabled: z.boolean(),
            start: z.string(),
            end: z.string(),
          })
          .optional(),
        preferredChannels: z
          .array(z.enum(["push", "email", "sms"]))
          .optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const preferences = mobilePushNotificationsService.setNotificationPreferences(
        ctx.user.id.toString(),
        input
      );

      return {
        globalMute: preferences.globalMute,
        doNotDisturb: preferences.doNotDisturb,
        preferredChannels: preferences.preferredChannels,
        lastUpdated: preferences.lastUpdated,
      };
    }),

  /**
   * Get notification preferences
   */
  getPreferences: protectedProcedure.query(({ ctx }) => {
    const preferences = mobilePushNotificationsService.getNotificationPreferences(
      ctx.user.id.toString()
    );

    return {
      globalMute: preferences.globalMute,
      doNotDisturb: preferences.doNotDisturb,
      preferredChannels: preferences.preferredChannels,
      lastUpdated: preferences.lastUpdated,
    };
  }),

  /**
   * Enable notification category
   */
  enableCategory: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const category = mobilePushNotificationsService.enableNotificationCategory(
        ctx.user.id.toString(),
        input.categoryId
      );

      return {
        id: category.id,
        name: category.name,
        enabled: category.enabled,
      };
    }),

  /**
   * Disable notification category
   */
  disableCategory: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const category = mobilePushNotificationsService.disableNotificationCategory(
        ctx.user.id.toString(),
        input.categoryId
      );

      if (!category) {
        throw new Error("Category not found");
      }

      return {
        id: category.id,
        name: category.name,
        enabled: category.enabled,
      };
    }),

  /**
   * Check if notification should be sent
   */
  shouldSendNotification: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const shouldSend = mobilePushNotificationsService.shouldSendNotification(
        ctx.user.id.toString(),
        input.categoryId
      );

      return { shouldSend };
    }),

  /**
   * Get notification history
   */
  getNotificationHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
      })
    )
    .query(({ ctx, input }) => {
      const notifications = mobilePushNotificationsService.getNotificationHistory(
        ctx.user.id.toString(),
        input.limit
      );

      return notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        timestamp: n.timestamp,
        sent: n.sent,
        failed: n.failed,
      }));
    }),

  /**
   * Get service worker status
   */
  getServiceWorkerStatus: protectedProcedure.query(() => {
    return mobilePushNotificationsService.getServiceWorkerStatus();
  }),

  /**
   * Get push notification stats
   */
  getStats: protectedProcedure.query(() => {
    return mobilePushNotificationsService.getStats();
  }),

  /**
   * Get push notification health
   */
  getHealth: protectedProcedure.query(() => {
    const stats = mobilePushNotificationsService.getStats();

    return {
      status:
        stats.activeSubscriptions > 0 && stats.successRate > 90
          ? "healthy"
          : stats.activeSubscriptions > 0
            ? "degraded"
            : "offline",
      activeSubscriptions: stats.activeSubscriptions,
      successRate: stats.successRate,
      failedNotifications: stats.failedNotifications,
      timestamp: new Date(),
    };
  }),

  /**
   * Cleanup inactive subscriptions
   */
  cleanupInactiveSubscriptions: protectedProcedure.mutation(() => {
    const removed = mobilePushNotificationsService.cleanupInactiveSubscriptions();
    return { removed };
  }),
});
