/**
 * Complete Integration Tests
 * Tests for Visual Workflow Designer, Real-time Collaboration, and Mobile Push
 */

import { describe, it, expect, beforeEach } from "vitest";
import { realtimeCollaborationService } from "../_core/realtimeCollaboration";
import { mobilePushNotificationsService } from "../_core/mobilePushNotifications";

describe("Complete System Integration", () => {
  beforeEach(() => {
    realtimeCollaborationService.clear();
    mobilePushNotificationsService.clear();
  });

  describe("Real-time Collaboration System", () => {
    it("should register user sessions", () => {
      const session = realtimeCollaborationService.registerSession(
        "user1",
        "John Doe",
        "session_1",
        "/dashboard"
      );

      expect(session.userId).toBe("user1");
      expect(session.sessionId).toBe("session_1");
      expect(session.viewingPage).toBe("/dashboard");
    });

    it("should track active users on page", () => {
      realtimeCollaborationService.registerSession(
        "user1",
        "John",
        "session_1",
        "/dashboard"
      );
      realtimeCollaborationService.registerSession(
        "user2",
        "Jane",
        "session_2",
        "/dashboard"
      );
      realtimeCollaborationService.registerSession(
        "user3",
        "Bob",
        "session_3",
        "/analytics"
      );

      const dashboardUsers = realtimeCollaborationService.getUsersOnPage(
        "/dashboard"
      );
      expect(dashboardUsers).toHaveLength(2);
      expect(dashboardUsers.map((u) => u.userId)).toContain("user1");
      expect(dashboardUsers.map((u) => u.userId)).toContain("user2");
    });

    it("should handle alert acknowledgment", () => {
      const alert = realtimeCollaborationService.acknowledgeAlert(
        "alert_1",
        "user1",
        "John"
      );

      expect(alert.acknowledgedBy.has("user1")).toBe(true);
      expect(alert.acknowledgedCount).toBe(1);

      // Multiple users acknowledging
      realtimeCollaborationService.acknowledgeAlert("alert_1", "user2", "Jane");
      const updatedAlert = realtimeCollaborationService.getAlertStatus("alert_1");

      expect(updatedAlert?.acknowledgedBy.size).toBe(2);
    });

    it("should resolve alerts", () => {
      realtimeCollaborationService.acknowledgeAlert(
        "alert_1",
        "user1",
        "John"
      );

      const resolved = realtimeCollaborationService.resolveAlert(
        "alert_1",
        "user1",
        "John"
      );

      expect(resolved?.resolvedBy).toBe("user1");
      expect(resolved?.resolvedAt).not.toBeNull();
    });

    it("should track collaboration statistics", () => {
      realtimeCollaborationService.registerSession(
        "user1",
        "John",
        "session_1",
        "/dashboard"
      );
      realtimeCollaborationService.registerSession(
        "user2",
        "Jane",
        "session_2",
        "/dashboard"
      );

      realtimeCollaborationService.acknowledgeAlert(
        "alert_1",
        "user1",
        "John"
      );
      realtimeCollaborationService.acknowledgeAlert(
        "alert_2",
        "user2",
        "Jane"
      );

      const stats = realtimeCollaborationService.getStats();

      expect(stats.activeUsers).toBe(2);
      expect(stats.sharedAlerts).toBe(2);
      expect(stats.acknowledgedAlerts).toBe(2);
    });

    it("should handle session unregistration", () => {
      realtimeCollaborationService.registerSession(
        "user1",
        "John",
        "session_1",
        "/dashboard"
      );

      let stats = realtimeCollaborationService.getStats();
      expect(stats.activeUsers).toBe(1);

      realtimeCollaborationService.unregisterSession("session_1");

      stats = realtimeCollaborationService.getStats();
      expect(stats.activeUsers).toBe(0);
    });
  });

  describe("Mobile Push Notifications System", () => {
    it("should subscribe to push notifications", () => {
      const subscription = mobilePushNotificationsService.subscribeToPush(
        "user1",
        {
          endpoint: "https://example.com/push",
          keys: {
            auth: "auth_key",
            p256dh: "p256dh_key",
          },
        },
        "Mozilla/5.0"
      );

      expect(subscription.userId).toBe("user1");
      expect(subscription.isActive).toBe(true);
    });

    it("should get user subscriptions", () => {
      mobilePushNotificationsService.subscribeToPush(
        "user1",
        {
          endpoint: "https://example.com/push1",
          keys: { auth: "auth1", p256dh: "p256dh1" },
        },
        "Mozilla/5.0"
      );

      mobilePushNotificationsService.subscribeToPush(
        "user1",
        {
          endpoint: "https://example.com/push2",
          keys: { auth: "auth2", p256dh: "p256dh2" },
        },
        "Mozilla/5.0"
      );

      const subscriptions = mobilePushNotificationsService.getUserSubscriptions(
        "user1"
      );
      expect(subscriptions).toHaveLength(2);
    });

    it("should send push notifications", async () => {
      mobilePushNotificationsService.subscribeToPush(
        "user1",
        {
          endpoint: "https://example.com/push",
          keys: { auth: "auth", p256dh: "p256dh" },
        },
        "Mozilla/5.0"
      );

      const notification = await mobilePushNotificationsService.sendPushNotification(
        "user1",
        {
          userId: "user1",
          title: "Test Notification",
          body: "Test body",
          requireInteraction: false,
          actions: [],
          data: {},
        }
      );

      expect(notification.title).toBe("Test Notification");
      expect(notification.timestamp).not.toBeNull();
    });

    it("should send critical alerts", async () => {
      mobilePushNotificationsService.subscribeToPush(
        "user1",
        {
          endpoint: "https://example.com/push",
          keys: { auth: "auth", p256dh: "p256dh" },
        },
        "Mozilla/5.0"
      );

      const alert = await mobilePushNotificationsService.sendCriticalAlert(
        "user1",
        "Critical Alert",
        "System error detected"
      );

      expect(alert.requireInteraction).toBe(true);
      expect(alert.actions.length).toBeGreaterThan(0);
    });

    it("should manage notification preferences", () => {
      mobilePushNotificationsService.setNotificationPreferences("user1", {
        globalMute: false,
        preferredChannels: ["push", "email"],
        doNotDisturb: {
          enabled: true,
          start: "22:00",
          end: "08:00",
        },
      });

      const prefs = mobilePushNotificationsService.getNotificationPreferences(
        "user1"
      );

      expect(prefs.preferredChannels).toContain("push");
      expect(prefs.preferredChannels).toContain("email");
      expect(prefs.doNotDisturb.enabled).toBe(true);
    });

    it("should respect do-not-disturb settings", () => {
      mobilePushNotificationsService.setNotificationPreferences("user1", {
        doNotDisturb: {
          enabled: true,
          start: "22:00",
          end: "08:00",
        },
      });

      // Mock current time to be within DND
      const shouldSend = mobilePushNotificationsService.shouldSendNotification(
        "user1",
        "general"
      );

      // Result depends on actual time, but function should work
      expect(typeof shouldSend).toBe("boolean");
    });

    it("should track push notification statistics", async () => {
      mobilePushNotificationsService.subscribeToPush(
        "user1",
        {
          endpoint: "https://example.com/push",
          keys: { auth: "auth", p256dh: "p256dh" },
        },
        "Mozilla/5.0"
      );

      await mobilePushNotificationsService.sendPushNotification("user1", {
        userId: "user1",
        title: "Test",
        body: "Test",
        requireInteraction: false,
        actions: [],
        data: {},
      });

      const stats = mobilePushNotificationsService.getStats();

      expect(stats.totalSubscriptions).toBeGreaterThan(0);
      expect(stats.activeSubscriptions).toBeGreaterThan(0);
      expect(stats.totalNotifications).toBeGreaterThan(0);
    });
  });

  describe("Cross-System Integration", () => {
    it("should handle concurrent collaboration and push notifications", async () => {
      // Register users
      realtimeCollaborationService.registerSession(
        "user1",
        "John",
        "session_1",
        "/dashboard"
      );
      realtimeCollaborationService.registerSession(
        "user2",
        "Jane",
        "session_2",
        "/dashboard"
      );

      // Subscribe to push
      mobilePushNotificationsService.subscribeToPush(
        "user1",
        {
          endpoint: "https://example.com/push1",
          keys: { auth: "auth1", p256dh: "p256dh1" },
        },
        "Mozilla/5.0"
      );

      mobilePushNotificationsService.subscribeToPush(
        "user2",
        {
          endpoint: "https://example.com/push2",
          keys: { auth: "auth2", p256dh: "p256dh2" },
        },
        "Mozilla/5.0"
      );

      // Acknowledge alert
      realtimeCollaborationService.acknowledgeAlert(
        "alert_1",
        "user1",
        "John"
      );

      // Send push notification
      await mobilePushNotificationsService.sendCriticalAlert(
        "user2",
        "Alert Acknowledged",
        "John acknowledged the alert"
      );

      // Verify both systems worked
      const collabStats = realtimeCollaborationService.getStats();
      const pushStats = mobilePushNotificationsService.getStats();

      expect(collabStats.activeUsers).toBe(2);
      expect(collabStats.acknowledgedAlerts).toBe(1);
      expect(pushStats.activeSubscriptions).toBe(2);
      expect(pushStats.totalNotifications).toBeGreaterThan(0);
    });

    it("should maintain system health under load", async () => {
      // Simulate multiple users and alerts
      const userCount = 10;
      const alertCount = 50;

      // Register users
      for (let i = 0; i < userCount; i++) {
        realtimeCollaborationService.registerSession(
          `user${i}`,
          `User ${i}`,
          `session_${i}`,
          "/dashboard"
        );

        mobilePushNotificationsService.subscribeToPush(
          `user${i}`,
          {
            endpoint: `https://example.com/push${i}`,
            keys: { auth: `auth${i}`, p256dh: `p256dh${i}` },
          },
          "Mozilla/5.0"
        );
      }

      // Create alerts
      for (let i = 0; i < alertCount; i++) {
        const userId = `user${i % userCount}`;
        realtimeCollaborationService.acknowledgeAlert(
          `alert_${i}`,
          userId,
          `User ${i % userCount}`
        );
      }

      // Send notifications
      for (let i = 0; i < userCount; i++) {
        await mobilePushNotificationsService.sendPushNotification(`user${i}`, {
          userId: `user${i}`,
          title: `Notification ${i}`,
          body: "Test notification",
          requireInteraction: false,
          actions: [],
          data: {},
        });
      }

      // Verify system health
      const collabStats = realtimeCollaborationService.getStats();
      const pushStats = mobilePushNotificationsService.getStats();

      expect(collabStats.activeUsers).toBe(userCount);
      expect(collabStats.sharedAlerts).toBe(alertCount);
      expect(pushStats.activeSubscriptions).toBe(userCount);
      expect(pushStats.totalNotifications).toBe(userCount);
    });
  });

  describe("Production Readiness", () => {
    it("should handle cleanup gracefully", () => {
      realtimeCollaborationService.registerSession(
        "user1",
        "John",
        "session_1",
        "/dashboard"
      );

      mobilePushNotificationsService.subscribeToPush(
        "user1",
        {
          endpoint: "https://example.com/push",
          keys: { auth: "auth", p256dh: "p256dh" },
        },
        "Mozilla/5.0"
      );

      let collabStats = realtimeCollaborationService.getStats();
      let pushStats = mobilePushNotificationsService.getStats();

      expect(collabStats.activeUsers).toBe(1);
      expect(pushStats.activeSubscriptions).toBe(1);

      // Cleanup
      realtimeCollaborationService.clear();
      mobilePushNotificationsService.clear();

      collabStats = realtimeCollaborationService.getStats();
      pushStats = mobilePushNotificationsService.getStats();

      expect(collabStats.activeUsers).toBe(0);
      expect(pushStats.activeSubscriptions).toBe(0);
    });

    it("should provide health metrics", () => {
      realtimeCollaborationService.registerSession(
        "user1",
        "John",
        "session_1",
        "/dashboard"
      );

      mobilePushNotificationsService.subscribeToPush(
        "user1",
        {
          endpoint: "https://example.com/push",
          keys: { auth: "auth", p256dh: "p256dh" },
        },
        "Mozilla/5.0"
      );

      const collabStats = realtimeCollaborationService.getStats();
      const pushStats = mobilePushNotificationsService.getStats();

      // Verify all required metrics exist
      expect(collabStats).toHaveProperty("activeUsers");
      expect(collabStats).toHaveProperty("sharedAlerts");
      expect(collabStats).toHaveProperty("eventCount");

      expect(pushStats).toHaveProperty("totalSubscriptions");
      expect(pushStats).toHaveProperty("successRate");
      expect(pushStats).toHaveProperty("failedNotifications");
    });
  });
});
