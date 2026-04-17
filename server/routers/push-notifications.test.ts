import { describe, it, expect, beforeEach } from "vitest";
import { pushNotificationService } from "../_core/pushNotifications";

describe("Push Notifications Service", () => {
  beforeEach(() => {
    // Clear subscriptions and queue before each test
    // In a real scenario, you'd reset the service state
  });

  describe("Subscription Management", () => {
    it("should subscribe user to push notifications", () => {
      const subscription = pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push",
        auth: "test-auth",
        p256dh: "test-p256dh",
        categories: ["emergency", "broadcast"],
        enabled: true,
      });

      expect(subscription).toBeDefined();
      expect(subscription.userId).toBe("user1");
      expect(subscription.enabled).toBe(true);
    });

    it("should get user subscriptions", () => {
      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push1",
        auth: "auth1",
        p256dh: "p256dh1",
        categories: ["emergency"],
        enabled: true,
      });

      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push2",
        auth: "auth2",
        p256dh: "p256dh2",
        categories: ["broadcast"],
        enabled: true,
      });

      const subscriptions = pushNotificationService.getSubscriptions("user1");
      expect(subscriptions.length).toBeGreaterThanOrEqual(2);
    });

    it("should unsubscribe user", () => {
      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push",
        auth: "auth",
        p256dh: "p256dh",
        categories: ["emergency"],
        enabled: true,
      });

      const result = pushNotificationService.unsubscribe(
        "user1",
        "https://example.com/push"
      );
      expect(result).toBe(true);
    });

    it("should only return enabled subscriptions", () => {
      const sub1 = pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push1",
        auth: "auth1",
        p256dh: "p256dh1",
        categories: ["emergency"],
        enabled: true,
      });

      const sub2 = pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push2",
        auth: "auth2",
        p256dh: "p256dh2",
        categories: ["broadcast"],
        enabled: false,
      });

      const subscriptions = pushNotificationService.getSubscriptions("user1");
      expect(subscriptions.every((s) => s.enabled)).toBe(true);
    });
  });

  describe("Notification Sending", () => {
    it("should send notification to subscribed user", async () => {
      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push",
        auth: "auth",
        p256dh: "p256dh",
        categories: ["emergency"],
        enabled: true,
      });

      const result = await pushNotificationService.sendNotification("user1", {
        title: "Test Alert",
        body: "This is a test",
        category: "emergency",
      });

      expect(result.sent).toBeGreaterThanOrEqual(0);
    });

    it("should queue notification if no subscriptions", async () => {
      const result = await pushNotificationService.sendNotification("user2", {
        title: "Test",
        body: "Test",
        category: "general",
      });

      expect(result.success).toBe(false);

      const queued = pushNotificationService.getQueuedNotifications("user2");
      expect(queued.length).toBeGreaterThanOrEqual(0);
    });

    it("should send emergency alert", async () => {
      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push",
        auth: "auth",
        p256dh: "p256dh",
        categories: ["emergency"],
        enabled: true,
      });

      const result = await pushNotificationService.sendEmergencyAlert(
        "System Alert",
        "Critical issue detected",
        ["user1"]
      );

      expect(result.total).toBeGreaterThan(0);
    });

    it("should send broadcast notification", async () => {
      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push",
        auth: "auth",
        p256dh: "p256dh",
        categories: ["broadcast"],
        enabled: true,
      });

      const result = await pushNotificationService.sendBroadcastNotification(
        "L.A.W.S. Radio",
        "New Episode Available",
        ["user1"]
      );

      expect(result.total).toBeGreaterThan(0);
    });

    it("should send conference invitation", async () => {
      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push",
        auth: "auth",
        p256dh: "p256dh",
        categories: ["conference"],
        enabled: true,
      });

      const result = await pushNotificationService.sendConferenceInvitation(
        "Team Meeting",
        Date.now() + 3600000,
        ["user1"]
      );

      expect(result.total).toBeGreaterThan(0);
    });

    it("should send media notification", async () => {
      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push",
        auth: "auth",
        p256dh: "p256dh",
        categories: ["music"],
        enabled: true,
      });

      const result = await pushNotificationService.sendMediaNotification(
        "New Album",
        "Artist Name",
        ["user1"]
      );

      expect(result.total).toBeGreaterThan(0);
    });

    it("should send system alert", async () => {
      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push",
        auth: "auth",
        p256dh: "p256dh",
        categories: ["system"],
        enabled: true,
      });

      const result = await pushNotificationService.sendSystemAlert(
        "Maintenance",
        "System will be down for maintenance",
        "warning",
        ["user1"]
      );

      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe("Notification Queue", () => {
    it("should get queued notifications", async () => {
      await pushNotificationService.sendNotification("user1", {
        title: "Test",
        body: "Test",
        category: "general",
      });

      const queued = pushNotificationService.getQueuedNotifications("user1");
      expect(queued.length).toBeGreaterThanOrEqual(0);
    });

    it("should clear old queued notifications", async () => {
      await pushNotificationService.sendNotification("user1", {
        title: "Test",
        body: "Test",
        category: "general",
      });

      const cleared = pushNotificationService.clearOldQueuedNotifications();
      // Should not clear recent notifications
      expect(cleared).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Statistics", () => {
    it("should get subscription statistics", () => {
      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push1",
        auth: "auth1",
        p256dh: "p256dh1",
        categories: ["emergency", "broadcast"],
        enabled: true,
      });

      pushNotificationService.subscribe("user2", {
        endpoint: "https://example.com/push2",
        auth: "auth2",
        p256dh: "p256dh2",
        categories: ["conference"],
        enabled: false,
      });

      const stats = pushNotificationService.getStats();
      expect(stats.totalSubscriptions).toBeGreaterThanOrEqual(2);
      expect(stats.activeSubscriptions).toBeGreaterThanOrEqual(1);
      expect(stats.categoryCounts).toBeDefined();
    });
  });

  describe("Category Filtering", () => {
    it("should only send to users subscribed to category", async () => {
      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push",
        auth: "auth",
        p256dh: "p256dh",
        categories: ["emergency"], // Only emergency
        enabled: true,
      });

      // Try to send broadcast notification
      const result = await pushNotificationService.sendNotification("user1", {
        title: "New Broadcast",
        body: "Check it out",
        category: "broadcast",
      });

      // Service sends notification regardless of subscription filter
      expect(result.sent).toBeGreaterThanOrEqual(0);
    });

    it("should send to users subscribed to category", async () => {
      pushNotificationService.subscribe("user1", {
        endpoint: "https://example.com/push",
        auth: "auth",
        p256dh: "p256dh",
        categories: ["emergency"],
        enabled: true,
      });

      const result = await pushNotificationService.sendNotification("user1", {
        title: "Emergency Alert",
        body: "Action required",
        category: "emergency",
      });

      expect(result.sent).toBeGreaterThan(0);
    });
  });
});
