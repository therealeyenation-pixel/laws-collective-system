/**
 * Push Notification Service
 * Handles real-time push notifications for emergencies, broadcasts, conferences, and system alerts
 */

import { ENV } from "./env";

export type NotificationCategory =
  | "emergency"
  | "broadcast"
  | "conference"
  | "system"
  | "music"
  | "theater"
  | "general";

export interface PushNotificationPayload {
  title: string;
  body: string;
  category: NotificationCategory;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, string>;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface NotificationSubscription {
  userId: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  categories: NotificationCategory[];
  enabled: boolean;
  createdAt: number;
}

class PushNotificationService {
  private subscriptions: Map<string, NotificationSubscription> = new Map();
  private notificationQueue: Array<{
    userId: string;
    payload: PushNotificationPayload;
    timestamp: number;
  }> = [];

  /**
   * Subscribe user to push notifications
   */
  subscribe(
    userId: string,
    subscription: Omit<NotificationSubscription, "userId" | "createdAt">
  ): NotificationSubscription {
    const fullSubscription: NotificationSubscription = {
      userId,
      ...subscription,
      createdAt: Date.now(),
    };

    this.subscriptions.set(`${userId}-${subscription.endpoint}`, fullSubscription);
    return fullSubscription;
  }

  /**
   * Unsubscribe user from push notifications
   */
  unsubscribe(userId: string, endpoint: string): boolean {
    return this.subscriptions.delete(`${userId}-${endpoint}`);
  }

  /**
   * Get user subscriptions
   */
  getSubscriptions(userId: string): NotificationSubscription[] {
    const subscriptions: NotificationSubscription[] = [];
    for (const [, sub] of this.subscriptions) {
      if (sub.userId === userId && sub.enabled) {
        subscriptions.push(sub);
      }
    }
    return subscriptions;
  }

  /**
   * Send push notification to user
   */
  async sendNotification(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
  }> {
    const subscriptions = this.getSubscriptions(userId);

    if (subscriptions.length === 0) {
      // Queue notification for later delivery
      this.notificationQueue.push({
        userId,
        payload,
        timestamp: Date.now(),
      });
      return { success: false, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      // Check if user has enabled this category
      if (!subscription.categories.includes(payload.category)) {
        continue;
      }

      try {
        const success = await this.sendToEndpoint(subscription, payload);
        if (success) {
          sent++;
        } else {
          failed++;
          // Mark subscription as potentially invalid
          subscription.enabled = false;
        }
      } catch (error) {
        failed++;
        console.error(
          `Failed to send push notification to ${subscription.endpoint}:`,
          error
        );
      }
    }

    return { success: sent > 0, sent, failed };
  }

  /**
   * Send notification to specific endpoint
   */
  private async sendToEndpoint(
    subscription: NotificationSubscription,
    payload: PushNotificationPayload
  ): Promise<boolean> {
    try {
      // In production, this would use web-push library
      // For now, we'll simulate sending
      console.log(
        `[Push] Sending ${payload.category} notification to ${subscription.userId}`
      );

      // Simulate successful delivery
      return true;
    } catch (error) {
      console.error("Error sending push notification:", error);
      return false;
    }
  }

  /**
   * Broadcast notification to all users in a category
   */
  async broadcastNotification(
    payload: PushNotificationPayload,
    userIds: string[]
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
  }> {
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      const result = await this.sendNotification(userId, payload);
      sent += result.sent;
      failed += result.failed;
    }

    return {
      total: userIds.length,
      sent,
      failed,
    };
  }

  /**
   * Send emergency alert to all subscribed users
   */
  async sendEmergencyAlert(
    title: string,
    message: string,
    userIds: string[]
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
  }> {
    return this.broadcastNotification(
      {
        title,
        body: message,
        category: "emergency",
        requireInteraction: true,
        actions: [
          { action: "acknowledge", title: "Acknowledge" },
          { action: "details", title: "View Details" },
        ],
      },
      userIds
    );
  }

  /**
   * Send broadcast notification
   */
  async sendBroadcastNotification(
    channelName: string,
    title: string,
    userIds: string[]
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
  }> {
    return this.broadcastNotification(
      {
        title: `${channelName} - ${title}`,
        body: "New broadcast available",
        category: "broadcast",
        data: { channel: channelName },
      },
      userIds
    );
  }

  /**
   * Send conference invitation
   */
  async sendConferenceInvitation(
    roomName: string,
    startTime: number,
    userIds: string[]
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
  }> {
    const startDate = new Date(startTime).toLocaleString();
    return this.broadcastNotification(
      {
        title: `Conference: ${roomName}`,
        body: `Starts at ${startDate}`,
        category: "conference",
        data: { room: roomName, startTime: startTime.toString() },
        actions: [
          { action: "join", title: "Join Now" },
          { action: "decline", title: "Decline" },
        ],
      },
      userIds
    );
  }

  /**
   * Send music/podcast notification
   */
  async sendMediaNotification(
    title: string,
    artist: string,
    userIds: string[]
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
  }> {
    return this.broadcastNotification(
      {
        title: `New: ${title}`,
        body: `by ${artist}`,
        category: "music",
        data: { title, artist },
      },
      userIds
    );
  }

  /**
   * Send system alert
   */
  async sendSystemAlert(
    title: string,
    message: string,
    severity: "info" | "warning" | "critical",
    userIds: string[]
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
  }> {
    return this.broadcastNotification(
      {
        title: `[${severity.toUpperCase()}] ${title}`,
        body: message,
        category: "system",
        requireInteraction: severity === "critical",
        data: { severity },
      },
      userIds
    );
  }

  /**
   * Get queued notifications
   */
  getQueuedNotifications(userId?: string): Array<{
    userId: string;
    payload: PushNotificationPayload;
    timestamp: number;
  }> {
    if (userId) {
      return this.notificationQueue.filter((n) => n.userId === userId);
    }
    return this.notificationQueue;
  }

  /**
   * Clear old queued notifications (older than 24 hours)
   */
  clearOldQueuedNotifications(): number {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const beforeCount = this.notificationQueue.length;
    this.notificationQueue = this.notificationQueue.filter(
      (n) => n.timestamp > oneDayAgo
    );
    return beforeCount - this.notificationQueue.length;
  }

  /**
   * Get subscription statistics
   */
  getStats(): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    inactiveSubscriptions: number;
    queuedNotifications: number;
    categoryCounts: Record<NotificationCategory, number>;
  } {
    let active = 0;
    let inactive = 0;
    const categoryCounts: Record<NotificationCategory, number> = {
      emergency: 0,
      broadcast: 0,
      conference: 0,
      system: 0,
      music: 0,
      theater: 0,
      general: 0,
    };

    for (const [, sub] of this.subscriptions) {
      if (sub.enabled) {
        active++;
      } else {
        inactive++;
      }

      for (const category of sub.categories) {
        categoryCounts[category]++;
      }
    }

    return {
      totalSubscriptions: this.subscriptions.size,
      activeSubscriptions: active,
      inactiveSubscriptions: inactive,
      queuedNotifications: this.notificationQueue.length,
      categoryCounts,
    };
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
