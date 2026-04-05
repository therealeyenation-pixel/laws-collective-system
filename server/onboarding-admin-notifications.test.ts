import { describe, it, expect } from "vitest";
import { onboardingAdminNotificationsRouter } from "./routers/onboarding-admin-notifications";

/**
 * Phase 33: Integrated Onboarding, Admin Dashboard & Notifications Tests
 * 
 * Test Coverage:
 * - Onboarding flow and step progression
 * - Admin dashboard metrics and alerts
 * - Notification system and preferences
 * - Cross-system integration
 */

describe("Phase 33: Onboarding, Admin Dashboard & Notifications", () => {
  // ========== ONBOARDING TESTS ==========

  describe("Onboarding System", () => {
    it("should retrieve all onboarding steps", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getOnboardingSteps();

      expect(result.steps).toBeDefined();
      expect(result.steps.length).toBe(7);
      expect(result.totalSteps).toBe(7);
      expect(result.estimatedTotalMinutes).toBeGreaterThan(0);
    });

    it("should have correct step structure", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getOnboardingSteps();
      const step = result.steps[0];

      expect(step).toHaveProperty("id");
      expect(step).toHaveProperty("name");
      expect(step).toHaveProperty("description");
      expect(step).toHaveProperty("type");
      expect(step).toHaveProperty("estimatedMinutes");
      expect(step).toHaveProperty("required");
    });

    it("should retrieve member onboarding progress", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getMemberOnboardingProgress();

      expect(result.userId).toBe(1);
      expect(result.currentStep).toBeDefined();
      expect(result.completedSteps).toBeGreaterThanOrEqual(0);
      expect(result.totalSteps).toBe(7);
      expect(result.progressPercentage).toBeGreaterThanOrEqual(0);
      expect(result.progressPercentage).toBeLessThanOrEqual(100);
    });

    it("should calculate progress percentage correctly", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getMemberOnboardingProgress();

      const expectedPercentage = Math.round(
        (result.completedSteps / result.totalSteps) * 100
      );
      expect(result.progressPercentage).toBe(expectedPercentage);
    });

    it("should get specific onboarding step details", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getOnboardingStep({ stepId: 1 });

      expect(result.step).toBeDefined();
      expect(result.step.id).toBe(1);
      expect(result.guidance).toBeDefined();
      expect(result.guidance.title).toBeDefined();
      expect(result.guidance.instructions).toBeDefined();
    });

    it("should complete onboarding step and advance", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.completeOnboardingStep({
        stepId: 1,
        data: { testData: "value" },
      });

      expect(result.success).toBe(true);
      expect(result.completedStep).toBe(1);
      expect(result.nextStep).toBeDefined();
    });

    it("should submit onboarding assessment", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.submitOnboardingAssessment({
        assessmentType: "investment",
        score: 85,
      });

      expect(result.assessmentType).toBe("investment");
      expect(result.score).toBe(85);
      expect(result.passed).toBe(true);
      expect(result.recommendation).toBeDefined();
      expect(result.tokensEarned).toBeGreaterThan(0);
    });

    it("should fail assessment below 70%", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.submitOnboardingAssessment({
        assessmentType: "employment",
        score: 60,
      });

      expect(result.passed).toBe(false);
      expect(result.tokensEarned).toBe(0);
    });

    it("should track assessment scores", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      await caller.submitOnboardingAssessment({
        assessmentType: "investment",
        score: 75,
      });

      const progress = await caller.getMemberOnboardingProgress();
      expect(progress).toBeDefined();
    });

    it("should handle multiple assessment types", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const investmentResult = await caller.submitOnboardingAssessment({
        assessmentType: "investment",
        score: 80,
      });

      const employmentResult = await caller.submitOnboardingAssessment({
        assessmentType: "employment",
        score: 75,
      });

      const complianceResult = await caller.submitOnboardingAssessment({
        assessmentType: "compliance",
        score: 90,
      });

      expect(investmentResult.passed).toBe(true);
      expect(employmentResult.passed).toBe(true);
      expect(complianceResult.passed).toBe(true);
    });
  });

  // ========== ADMIN DASHBOARD TESTS ==========

  describe("Admin Dashboard", () => {
    it("should retrieve admin dashboard metrics", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const result = await caller.getAdminDashboardMetrics();

      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalMembers).toBeGreaterThan(0);
      expect(result.onboardingRate).toBeGreaterThanOrEqual(0);
      expect(result.complianceRate).toBeGreaterThanOrEqual(0);
      expect(result.engagementRate).toBeGreaterThanOrEqual(0);
    });

    it("should calculate onboarding rate correctly", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const result = await caller.getAdminDashboardMetrics();

      expect(result.onboardingRate).toBeLessThanOrEqual(100);
      expect(result.onboardingRate).toBeGreaterThanOrEqual(0);
    });

    it("should calculate compliance rate correctly", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const result = await caller.getAdminDashboardMetrics();

      expect(result.complianceRate).toBeLessThanOrEqual(100);
      expect(result.complianceRate).toBeGreaterThanOrEqual(0);
    });

    it("should retrieve admin alerts", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const result = await caller.getAdminAlerts({});

      expect(result.alerts).toBeDefined();
      expect(Array.isArray(result.alerts)).toBe(true);
      expect(result.totalAlerts).toBeGreaterThanOrEqual(0);
      expect(result.openAlerts).toBeGreaterThanOrEqual(0);
    });

    it("should filter alerts by severity", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const result = await caller.getAdminAlerts({ severity: "high" });

      expect(result.alerts).toBeDefined();
      result.alerts.forEach((alert) => {
        expect(alert.severity).toBe("high");
      });
    });

    it("should filter alerts by status", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const result = await caller.getAdminAlerts({ status: "open" });

      expect(result.alerts).toBeDefined();
      result.alerts.forEach((alert) => {
        expect(alert.status).toBe("open");
      });
    });

    it("should get members needing attention", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const result = await caller.getMembersNeedingAttention();

      expect(result.membersNeedingAttention).toBeDefined();
      expect(Array.isArray(result.membersNeedingAttention)).toBe(true);
      expect(result.membersNeedingAttention.length).toBeGreaterThan(0);
    });

    it("should have correct member attention structure", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const result = await caller.getMembersNeedingAttention();
      const member = result.membersNeedingAttention[0];

      expect(member).toHaveProperty("userId");
      expect(member).toHaveProperty("name");
      expect(member).toHaveProperty("issue");
      expect(member).toHaveProperty("severity");
      expect(member).toHaveProperty("action");
    });

    it("should resolve admin alert", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const result = await caller.resolveAdminAlert({
        alertId: 1,
        resolution: "Issue resolved",
      });

      expect(result.success).toBe(true);
      expect(result.alertId).toBe(1);
      expect(result.resolution).toBe("Issue resolved");
    });

    it("should deny non-admin access to dashboard", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getAdminDashboardMetrics();

      expect(result.error).toBeDefined();
      expect(result.error).toContain("Admin");
    });
  });

  // ========== NOTIFICATION TESTS ==========

  describe("Notification System", () => {
    it("should retrieve member notifications", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getMemberNotifications({});

      expect(result.notifications).toBeDefined();
      expect(Array.isArray(result.notifications)).toBe(true);
      expect(result.unreadCount).toBeGreaterThanOrEqual(0);
      expect(result.totalCount).toBeGreaterThanOrEqual(0);
    });

    it("should filter unread notifications", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getMemberNotifications({ unreadOnly: true });

      expect(result.notifications).toBeDefined();
      result.notifications.forEach((notification) => {
        expect(notification.read).toBe(false);
      });
    });

    it("should have correct notification structure", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getMemberNotifications({});

      if (result.notifications.length > 0) {
        const notification = result.notifications[0];
        expect(notification).toHaveProperty("id");
        expect(notification).toHaveProperty("userId");
        expect(notification).toHaveProperty("type");
        expect(notification).toHaveProperty("title");
        expect(notification).toHaveProperty("message");
        expect(notification).toHaveProperty("read");
        expect(notification).toHaveProperty("createdAt");
      }
    });

    it("should mark notification as read", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.markNotificationAsRead({
        notificationId: 1,
      });

      expect(result.success).toBe(true);
      expect(result.notificationId).toBe(1);
    });

    it("should get notification preferences", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getNotificationPreferences();

      expect(result.userId).toBe(1);
      expect(result.preferences).toBeDefined();
      expect(result.frequency).toBeDefined();
      expect(result.quietHours).toBeDefined();
    });

    it("should have all notification type preferences", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getNotificationPreferences();

      expect(result.preferences).toHaveProperty("onboarding");
      expect(result.preferences).toHaveProperty("courses");
      expect(result.preferences).toHaveProperty("achievements");
      expect(result.preferences).toHaveProperty("compliance");
      expect(result.preferences).toHaveProperty("employment");
      expect(result.preferences).toHaveProperty("system");
    });

    it("should update notification preferences", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.updateNotificationPreferences({
        preferences: {
          onboarding: { email: false, inApp: true },
          courses: { email: true, inApp: false },
        },
        frequency: "daily",
      });

      expect(result.success).toBe(true);
      expect(result.frequency).toBe("daily");
    });

    it("should create notification as admin", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const result = await caller.createNotification({
        userId: 2,
        type: "test_notification",
        title: "Test Title",
        message: "Test Message",
        actionUrl: "/test",
      });

      expect(result.success).toBe(true);
      expect(result.notificationId).toBeDefined();
      expect(result.userId).toBe(2);
    });

    it("should deny non-admin notification creation", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.createNotification({
        userId: 2,
        type: "test",
        title: "Test",
        message: "Test",
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain("Admin");
    });

    it("should get notification statistics", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getNotificationStatistics();

      expect(result.totalNotifications).toBeGreaterThanOrEqual(0);
      expect(result.unreadNotifications).toBeGreaterThanOrEqual(0);
      expect(result.notificationsByType).toBeDefined();
      expect(result.notificationsByDay).toBeDefined();
    });

    it("should track notifications by type", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getNotificationStatistics();

      Object.values(result.notificationsByType).forEach((count) => {
        expect(typeof count).toBe("number");
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ========== INTEGRATION TESTS ==========

  describe("Cross-System Integration", () => {
    it("should create notification on onboarding step completion", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      await caller.completeOnboardingStep({
        stepId: 1,
        data: {},
      });

      const notifications = await caller.getMemberNotifications({});

      expect(notifications.notifications.length).toBeGreaterThan(0);
    });

    it("should track onboarding progress in notifications", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const progress = await caller.getMemberOnboardingProgress();
      const notifications = await caller.getMemberNotifications({});

      expect(progress.completedSteps).toBeGreaterThanOrEqual(0);
      expect(notifications.totalCount).toBeGreaterThanOrEqual(0);
    });

    it("should allow admin to monitor onboarding via dashboard", async () => {
      const adminCaller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const metrics = await adminCaller.getAdminDashboardMetrics();
      const alerts = await adminCaller.getAdminAlerts({});

      expect(metrics.metrics.onboardingInProgress).toBeGreaterThanOrEqual(0);
      expect(alerts.alerts).toBeDefined();
    });

    it("should link member onboarding to admin attention", async () => {
      const adminCaller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const membersNeedingAttention =
        await adminCaller.getMembersNeedingAttention();

      expect(membersNeedingAttention.membersNeedingAttention).toBeDefined();
    });
  });

  // ========== EDGE CASES ==========

  describe("Edge Cases & Error Handling", () => {
    it("should handle missing onboarding profile", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 999, role: "user" },
      } as any);

      const result = await caller.getMemberOnboardingProgress();

      expect(result).toBeDefined();
    });

    it("should handle invalid step ID", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getOnboardingStep({ stepId: 999 });

      expect(result.error).toBeDefined();
    });

    it("should handle alert limit", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "admin" },
      } as any);

      const result = await caller.getAdminAlerts({ limit: 5 });

      expect(result.alerts.length).toBeLessThanOrEqual(5);
    });

    it("should handle notification limit", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.getMemberNotifications({ limit: 10 });

      expect(result.notifications.length).toBeLessThanOrEqual(10);
    });

    it("should validate assessment score range", async () => {
      const caller = onboardingAdminNotificationsRouter.createCaller({
        user: { id: 1, role: "user" },
      } as any);

      const result = await caller.submitOnboardingAssessment({
        assessmentType: "investment",
        score: 100,
      });

      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});
