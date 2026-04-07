/**
 * Mobile Push Notifications Service
 * Handles service worker registration, push subscriptions, and offline support
 */

interface PushSubscription {
  userId: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  userAgent: string;
  subscriptionDate: Date;
  lastActive: Date;
  isActive: boolean;
}

interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction: boolean;
  actions: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data: Record<string, any>;
  timestamp: Date;
  sent: boolean;
  sentAt?: Date;
  failed: boolean;
  failureReason?: string;
}

interface NotificationCategory {
  id: string;
  name: string;
  enabled: boolean;
  priority: "low" | "normal" | "high" | "critical";
  channels: ("push" | "email" | "sms")[];
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

interface UserNotificationPreferences {
  userId: string;
  categories: Map<string, NotificationCategory>;
  globalMute: boolean;
  doNotDisturb: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
  preferredChannels: ("push" | "email" | "sms")[];
  lastUpdated: Date;
}

class MobilePushNotificationsService {
  private subscriptions: Map<string, PushSubscription> = new Map();
  private notifications: PushNotification[] = [];
  private userPreferences: Map<string, UserNotificationPreferences> = new Map();
  private notificationQueue: PushNotification[] = [];
  private maxNotificationHistory = 1000;
  private vapidPublicKey: string;
  private vapidPrivateKey: string;

  constructor() {
    // In production, load from environment variables
    this.vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
  }

  /**
   * Subscribe user to push notifications
   */
  subscribeToPush(
    userId: string,
    subscription: {
      endpoint: string;
      keys: {
        auth: string;
        p256dh: string;
      };
    },
    userAgent: string
  ): PushSubscription {
    const subscriptionKey = `${userId}_${subscription.endpoint}`;

    const pushSubscription: PushSubscription = {
      userId,
      endpoint: subscription.endpoint,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
      userAgent,
      subscriptionDate: new Date(),
      lastActive: new Date(),
      isActive: true,
    };

    this.subscriptions.set(subscriptionKey, pushSubscription);
    return pushSubscription;
  }

  /**
   * Unsubscribe user from push notifications
   */
  unsubscribeFromPush(userId: string, endpoint: string): boolean {
    const subscriptionKey = `${userId}_${endpoint}`;
    return this.subscriptions.delete(subscriptionKey);
  }

  /**
   * Get user subscriptions
   */
  getUserSubscriptions(userId: string): PushSubscription[] {
    const subscriptions: PushSubscription[] = [];

    for (const [, subscription] of this.subscriptions) {
      if (subscription.userId === userId) {
        subscriptions.push(subscription);
      }
    }

    return subscriptions;
  }

  /**
   * Send push notification
   */
  async sendPushNotification(
    userId: string,
    notification: Omit<PushNotification, "id" | "timestamp" | "sent" | "sentAt" | "failed" | "failureReason">
  ): Promise<PushNotification> {
    const pushNotification: PushNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      timestamp: new Date(),
      sent: false,
      failed: false,
    };

    this.notificationQueue.push(pushNotification);

    // Simulate sending (in production, use web-push library)
    try {
      const subscriptions = this.getUserSubscriptions(userId);

      for (const subscription of subscriptions) {
        if (subscription.isActive) {
          // In production: await webpush.sendNotification(subscription, JSON.stringify(notification));
          pushNotification.sent = true;
          pushNotification.sentAt = new Date();
        }
      }
    } catch (error) {
      pushNotification.failed = true;
      pushNotification.failureReason = (error as Error).message;
    }

    this.notifications.push(pushNotification);

    // Keep history manageable
    if (this.notifications.length > this.maxNotificationHistory) {
      this.notifications = this.notifications.slice(-this.maxNotificationHistory);
    }

    return pushNotification;
  }

  /**
   * Send critical alert
   */
  async sendCriticalAlert(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<PushNotification> {
    return this.sendPushNotification(userId, {
      userId,
      title,
      body,
      requireInteraction: true,
      actions: [
        { action: "acknowledge", title: "Acknowledge" },
        { action: "dismiss", title: "Dismiss" },
      ],
      data: data || {},
      tag: "critical-alert",
    });
  }

  /**
   * Send broadcast notification
   */
  async sendBroadcastNotification(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<PushNotification[]> {
    const notifications: PushNotification[] = [];

    for (const userId of userIds) {
      const notification = await this.sendPushNotification(userId, {
        userId,
        title,
        body,
        requireInteraction: false,
        actions: [],
        data: data || {},
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Set notification preferences
   */
  setNotificationPreferences(
    userId: string,
    preferences: Partial<UserNotificationPreferences>
  ): UserNotificationPreferences {
    let userPrefs = this.userPreferences.get(userId);

    if (!userPrefs) {
      userPrefs = {
        userId,
        categories: new Map(),
        globalMute: false,
        doNotDisturb: {
          enabled: false,
          start: "22:00",
          end: "08:00",
        },
        preferredChannels: ["push"],
        lastUpdated: new Date(),
      };
    }

    if (preferences.globalMute !== undefined) {
      userPrefs.globalMute = preferences.globalMute;
    }

    if (preferences.doNotDisturb) {
      userPrefs.doNotDisturb = preferences.doNotDisturb;
    }

    if (preferences.preferredChannels) {
      userPrefs.preferredChannels = preferences.preferredChannels;
    }

    userPrefs.lastUpdated = new Date();
    this.userPreferences.set(userId, userPrefs);

    return userPrefs;
  }

  /**
   * Get notification preferences
   */
  getNotificationPreferences(userId: string): UserNotificationPreferences {
    let prefs = this.userPreferences.get(userId);

    if (!prefs) {
      prefs = {
        userId,
        categories: new Map(),
        globalMute: false,
        doNotDisturb: {
          enabled: false,
          start: "22:00",
          end: "08:00",
        },
        preferredChannels: ["push"],
        lastUpdated: new Date(),
      };
      this.userPreferences.set(userId, prefs);
    }

    return prefs;
  }

  /**
   * Enable notification category
   */
  enableNotificationCategory(
    userId: string,
    categoryId: string
  ): NotificationCategory {
    const prefs = this.getNotificationPreferences(userId);
    let category = prefs.categories.get(categoryId);

    if (!category) {
      category = {
        id: categoryId,
        name: categoryId,
        enabled: true,
        priority: "normal",
        channels: ["push"],
      };
    } else {
      category.enabled = true;
    }

    prefs.categories.set(categoryId, category);
    return category;
  }

  /**
   * Disable notification category
   */
  disableNotificationCategory(
    userId: string,
    categoryId: string
  ): NotificationCategory | null {
    const prefs = this.getNotificationPreferences(userId);
    const category = prefs.categories.get(categoryId);

    if (category) {
      category.enabled = false;
      prefs.categories.set(categoryId, category);
      return category;
    }

    return null;
  }

  /**
   * Check if notification should be sent based on preferences
   */
  shouldSendNotification(userId: string, categoryId: string): boolean {
    const prefs = this.getNotificationPreferences(userId);

    if (prefs.globalMute) {
      return false;
    }

    const category = prefs.categories.get(categoryId);
    if (category && !category.enabled) {
      return false;
    }

    if (prefs.doNotDisturb.enabled) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      if (
        currentTime >= prefs.doNotDisturb.start &&
        currentTime <= prefs.doNotDisturb.end
      ) {
        // Allow critical notifications during DND
        const category = prefs.categories.get(categoryId);
        if (category && category.priority !== "critical") {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get notification history
   */
  getNotificationHistory(userId: string, limit: number = 50): PushNotification[] {
    return this.notifications
      .filter((n) => n.userId === userId)
      .slice(-limit);
  }

  /**
   * Get service worker registration status
   */
  getServiceWorkerStatus(): {
    supported: boolean;
    vapidPublicKey: string;
  } {
    return {
      supported: !!this.vapidPublicKey,
      vapidPublicKey: this.vapidPublicKey,
    };
  }

  /**
   * Get push notification stats
   */
  getStats(): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalNotifications: number;
    sentNotifications: number;
    failedNotifications: number;
    successRate: number;
  } {
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(
      (s) => s.isActive
    ).length;

    const sentNotifications = this.notifications.filter((n) => n.sent).length;
    const failedNotifications = this.notifications.filter((n) => n.failed)
      .length;

    const successRate =
      this.notifications.length > 0
        ? ((sentNotifications / this.notifications.length) * 100).toFixed(1)
        : 0;

    return {
      totalSubscriptions: this.subscriptions.size,
      activeSubscriptions,
      totalNotifications: this.notifications.length,
      sentNotifications,
      failedNotifications,
      successRate: parseFloat(successRate as string),
    };
  }

  /**
   * Clear old subscriptions
   */
  cleanupInactiveSubscriptions(inactiveThresholdMs: number = 30 * 24 * 60 * 60 * 1000): number {
    const now = new Date();
    let removed = 0;

    for (const [key, subscription] of this.subscriptions) {
      if (now.getTime() - subscription.lastActive.getTime() > inactiveThresholdMs) {
        this.subscriptions.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.subscriptions.clear();
    this.notifications = [];
    this.userPreferences.clear();
    this.notificationQueue = [];
  }
}

export const mobilePushNotificationsService =
  new MobilePushNotificationsService();
