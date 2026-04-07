/**
 * Push Notifications Router
 * Handles subscription management and notification delivery
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { pushNotificationService } from "../_core/pushNotifications";
import { z } from "zod";

export const pushNotificationsRouter = router({
  /**
   * Subscribe to push notifications
   */
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        auth: z.string(),
        p256dh: z.string(),
        categories: z.array(
          z.enum([
            "emergency",
            "broadcast",
            "conference",
            "system",
            "music",
            "theater",
            "general",
          ])
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = pushNotificationService.subscribe(
        ctx.user.id.toString(),
        {
          endpoint: input.endpoint,
          auth: input.auth,
          p256dh: input.p256dh,
          categories: input.categories,
          enabled: true,
        }
      );
      return { success: true, subscription };
    }),

  /**
   * Unsubscribe from push notifications
   */
  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const success = pushNotificationService.unsubscribe(
        ctx.user.id.toString(),
        input.endpoint
      );
      return { success };
    }),

  /**
   * Get user subscriptions
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    return pushNotificationService.getSubscriptions(ctx.user.id.toString());
  }),

  /**
   * Send test notification
   */
  sendTestNotification: protectedProcedure
    .input(
      z.object({
        category: z.enum([
          "emergency",
          "broadcast",
          "conference",
          "system",
          "music",
          "theater",
          "general",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await pushNotificationService.sendNotification(
        ctx.user.id.toString(),
        {
          title: "Test Notification",
          body: `This is a test ${input.category} notification`,
          category: input.category,
        }
      );
      return result;
    }),

  /**
   * Send emergency alert (admin only)
   */
  sendEmergencyAlert: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        message: z.string(),
        userIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, check if user is admin
      const result = await pushNotificationService.sendEmergencyAlert(
        input.title,
        input.message,
        input.userIds
      );
      return result;
    }),

  /**
   * Send broadcast notification
   */
  sendBroadcastNotification: protectedProcedure
    .input(
      z.object({
        channelName: z.string(),
        title: z.string(),
        userIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await pushNotificationService.sendBroadcastNotification(
        input.channelName,
        input.title,
        input.userIds
      );
      return result;
    }),

  /**
   * Send conference invitation
   */
  sendConferenceInvitation: protectedProcedure
    .input(
      z.object({
        roomName: z.string(),
        startTime: z.number(),
        userIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await pushNotificationService.sendConferenceInvitation(
        input.roomName,
        input.startTime,
        input.userIds
      );
      return result;
    }),

  /**
   * Send media notification
   */
  sendMediaNotification: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        artist: z.string(),
        userIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await pushNotificationService.sendMediaNotification(
        input.title,
        input.artist,
        input.userIds
      );
      return result;
    }),

  /**
   * Send system alert
   */
  sendSystemAlert: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        message: z.string(),
        severity: z.enum(["info", "warning", "critical"]),
        userIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await pushNotificationService.sendSystemAlert(
        input.title,
        input.message,
        input.severity,
        input.userIds
      );
      return result;
    }),

  /**
   * Get queued notifications
   */
  getQueuedNotifications: protectedProcedure.query(async ({ ctx }) => {
    return pushNotificationService.getQueuedNotifications(
      ctx.user.id.toString()
    );
  }),

  /**
   * Get notification statistics
   */
  getStats: protectedProcedure.query(async () => {
    return pushNotificationService.getStats();
  }),

  /**
   * Clear old queued notifications
   */
  clearOldQueued: protectedProcedure.mutation(async () => {
    const cleared = pushNotificationService.clearOldQueuedNotifications();
    return { cleared };
  }),
});
