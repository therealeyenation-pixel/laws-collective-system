import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

/**
 * Phase 33: Integrated Onboarding, Admin Dashboard & Real-time Notifications
 * 
 * This router combines three systems:
 * 1. Member Onboarding Flow - Guided step-by-step onboarding
 * 2. Admin Dashboard - Monitoring and management interface
 * 3. Real-time Notifications - Event-driven alerts
 */

// ============================================================================
// ONBOARDING SYSTEM
// ============================================================================

const onboardingSteps = [
  {
    id: 1,
    name: "Welcome",
    description: "Welcome to The L.A.W.S. Collective",
    type: "intro",
    estimatedMinutes: 5,
    required: true,
  },
  {
    id: 2,
    name: "Profile Setup",
    description: "Complete your member profile",
    type: "profile",
    estimatedMinutes: 10,
    required: true,
  },
  {
    id: 3,
    name: "Investment Assessment",
    description: "Take investment knowledge assessment",
    type: "assessment",
    estimatedMinutes: 15,
    required: true,
  },
  {
    id: 4,
    name: "Employment Readiness",
    description: "Assess contractor readiness",
    type: "assessment",
    estimatedMinutes: 10,
    required: true,
  },
  {
    id: 5,
    name: "Compliance Verification",
    description: "Complete KYC/AML verification",
    type: "compliance",
    estimatedMinutes: 20,
    required: true,
  },
  {
    id: 6,
    name: "Course Selection",
    description: "Choose your first investment course",
    type: "selection",
    estimatedMinutes: 5,
    required: false,
  },
  {
    id: 7,
    name: "Goal Setting",
    description: "Set your financial goals",
    type: "goals",
    estimatedMinutes: 10,
    required: false,
  },
];

const memberOnboardingProfiles: Record<
  number,
  {
    userId: number;
    currentStep: number;
    completedSteps: number[];
    profileData: Record<string, any>;
    assessmentScores: Record<string, number>;
    complianceStatus: "pending" | "verified" | "rejected";
    startedDate: Date;
    completedDate?: Date;
  }
> = {
  1: {
    userId: 1,
    currentStep: 3,
    completedSteps: [1, 2],
    profileData: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+1-555-0100",
    },
    assessmentScores: { investment: 65 },
    complianceStatus: "pending",
    startedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
};

// ============================================================================
// ADMIN DASHBOARD SYSTEM
// ============================================================================

const adminMetrics = {
  totalMembers: 150,
  onboardingInProgress: 45,
  onboardingCompleted: 105,
  complianceVerified: 98,
  compliancePending: 47,
  complianceRejected: 5,
  activeInvestmentCourses: 89,
  employmentOpportunitiesMatched: 34,
  violationsOpen: 3,
  violationsResolved: 12,
};

const dashboardAlerts = [
  {
    id: 1,
    type: "compliance",
    severity: "high",
    title: "Compliance Violation Detected",
    description: "Member 42 has missing documentation",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: "open",
  },
  {
    id: 2,
    type: "onboarding",
    severity: "medium",
    title: "Onboarding Stalled",
    description: "5 members stuck on compliance step",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    status: "open",
  },
  {
    id: 3,
    type: "system",
    severity: "low",
    title: "Scheduled Maintenance",
    description: "Database backup completed successfully",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: "resolved",
  },
];

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

const notificationTypes = [
  "onboarding_started",
  "onboarding_step_completed",
  "onboarding_completed",
  "course_enrolled",
  "course_completed",
  "quiz_passed",
  "achievement_unlocked",
  "employment_opportunity_matched",
  "compliance_deadline_approaching",
  "compliance_violation_detected",
  "admin_alert_created",
  "member_milestone_achieved",
];

const memberNotifications: Record<
  number,
  Array<{
    id: number;
    userId: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    actionUrl?: string;
  }>
> = {
  1: [
    {
      id: 1,
      userId: 1,
      type: "onboarding_step_completed",
      title: "Step Completed",
      message: "You completed Profile Setup",
      read: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      actionUrl: "/onboarding/step/3",
    },
    {
      id: 2,
      userId: 1,
      type: "compliance_deadline_approaching",
      title: "Compliance Deadline",
      message: "Your KYC verification expires in 30 days",
      read: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      actionUrl: "/compliance/verify",
    },
  ],
};

// ============================================================================
// ONBOARDING PROCEDURES
// ============================================================================

export const onboardingAdminNotificationsRouter = router({
  // ========== ONBOARDING PROCEDURES ==========

  /**
   * Get onboarding steps for guided flow
   */
  getOnboardingSteps: publicProcedure.query(async () => {
    return {
      steps: onboardingSteps,
      totalSteps: onboardingSteps.length,
      estimatedTotalMinutes: onboardingSteps.reduce(
        (sum, step) => sum + step.estimatedMinutes,
        0
      ),
    };
  }),

  /**
   * Get member's onboarding progress
   */
  getMemberOnboardingProgress: protectedProcedure.query(async ({ ctx }) => {
    const profile = memberOnboardingProfiles[ctx.user.id] || {
      userId: ctx.user.id,
      currentStep: 1,
      completedSteps: [],
      profileData: {},
      assessmentScores: {},
      complianceStatus: "pending",
      startedDate: new Date(),
    };

    const currentStepData = onboardingSteps.find(
      (s) => s.id === profile.currentStep
    );
    const progressPercentage = Math.round(
      (profile.completedSteps.length / onboardingSteps.length) * 100
    );

    return {
      userId: ctx.user.id,
      currentStep: profile.currentStep,
      currentStepData,
      completedSteps: profile.completedSteps.length,
      totalSteps: onboardingSteps.length,
      progressPercentage,
      complianceStatus: profile.complianceStatus,
      estimatedTimeRemaining: onboardingSteps
        .filter((s) => !profile.completedSteps.includes(s.id))
        .reduce((sum, s) => sum + s.estimatedMinutes, 0),
      startedDate: profile.startedDate,
      completedDate: profile.completedDate,
    };
  }),

  /**
   * Get specific onboarding step details
   */
  getOnboardingStep: protectedProcedure
    .input(z.object({ stepId: z.number() }))
    .query(async ({ input }) => {
      const step = onboardingSteps.find((s) => s.id === input.stepId);
      if (!step) {
        return { error: "Step not found" };
      }

      return {
        step,
        guidance: {
          title: step.name,
          description: step.description,
          instructions: `Complete the ${step.name} step to proceed with onboarding`,
          estimatedTime: step.estimatedMinutes,
        },
      };
    }),

  /**
   * Complete onboarding step
   */
  completeOnboardingStep: protectedProcedure
    .input(
      z.object({
        stepId: z.number(),
        data: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = memberOnboardingProfiles[ctx.user.id];
      if (!profile) {
        return { error: "Onboarding profile not found" };
      }

      if (!profile.completedSteps.includes(input.stepId)) {
        profile.completedSteps.push(input.stepId);
      }

      // Move to next step
      const nextStep = onboardingSteps.find(
        (s) => !profile.completedSteps.includes(s.id)
      );
      if (nextStep) {
        profile.currentStep = nextStep.id;
      } else {
        profile.completedDate = new Date();
      }

      // Store step data
      if (input.data) {
        profile.profileData = { ...profile.profileData, ...input.data };
      }

      // Create notification
      const notification = {
        id: (memberNotifications[ctx.user.id]?.length || 0) + 1,
        userId: ctx.user.id,
        type: "onboarding_step_completed",
        title: "Step Completed",
        message: `You completed ${onboardingSteps.find((s) => s.id === input.stepId)?.name}`,
        read: false,
        createdAt: new Date(),
        actionUrl:
          nextStep && nextStep.id <= onboardingSteps.length
            ? `/onboarding/step/${nextStep.id}`
            : "/dashboard",
      };

      if (!memberNotifications[ctx.user.id]) {
        memberNotifications[ctx.user.id] = [];
      }
      memberNotifications[ctx.user.id].push(notification);

      return {
        success: true,
        completedStep: input.stepId,
        nextStep: nextStep?.id,
        onboardingComplete: !nextStep,
      };
    }),

  /**
   * Submit onboarding assessment
   */
  submitOnboardingAssessment: protectedProcedure
    .input(
      z.object({
        assessmentType: z.enum(["investment", "employment", "compliance"]),
        score: z.number().min(0).max(100),
        answers: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = memberOnboardingProfiles[ctx.user.id];
      if (!profile) {
        return { error: "Onboarding profile not found" };
      }

      profile.assessmentScores[input.assessmentType] = input.score;

      const passed = input.score >= 70;
      const recommendation =
        input.assessmentType === "investment"
          ? passed
            ? "Ready for intermediate courses"
            : "Start with fundamentals"
          : input.assessmentType === "employment"
            ? passed
              ? "Strong contractor readiness"
              : "Build skills before transitioning"
            : passed
              ? "Compliance verified"
              : "Additional documentation needed";

      return {
        assessmentType: input.assessmentType,
        score: input.score,
        passed,
        recommendation,
        tokensEarned: passed ? 50 : 0,
      };
    }),

  // ========== ADMIN DASHBOARD PROCEDURES ==========

  /**
   * Get admin dashboard metrics
   */
  getAdminDashboardMetrics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      return { error: "Admin access required" };
    }

    return {
      metrics: adminMetrics,
      onboardingRate: Math.round(
        (adminMetrics.onboardingCompleted /
          (adminMetrics.onboardingCompleted + adminMetrics.onboardingInProgress)) *
          100
      ),
      complianceRate: Math.round(
        (adminMetrics.complianceVerified /
          (adminMetrics.complianceVerified +
            adminMetrics.compliancePending +
            adminMetrics.complianceRejected)) *
          100
      ),
      engagementRate: Math.round(
        (adminMetrics.activeInvestmentCourses / adminMetrics.totalMembers) * 100
      ),
    };
  }),

  /**
   * Get admin dashboard alerts
   */
  getAdminAlerts: protectedProcedure
    .input(
      z.object({
        severity: z.enum(["high", "medium", "low"]).optional(),
        status: z.enum(["open", "resolved"]).optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        return { error: "Admin access required" };
      }

      let alerts = dashboardAlerts;

      if (input.severity) {
        alerts = alerts.filter((a) => a.severity === input.severity);
      }
      if (input.status) {
        alerts = alerts.filter((a) => a.status === input.status);
      }

      return {
        alerts: alerts.slice(0, input.limit),
        totalAlerts: alerts.length,
        openAlerts: alerts.filter((a) => a.status === "open").length,
      };
    }),

  /**
   * Get members needing attention
   */
  getMembersNeedingAttention: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      return { error: "Admin access required" };
    }

    return {
      membersNeedingAttention: [
        {
          userId: 42,
          name: "Jane Smith",
          issue: "Missing documentation",
          severity: "high",
          daysOverdue: 5,
          action: "Request documentation",
        },
        {
          userId: 87,
          name: "Robert Johnson",
          issue: "Onboarding stalled",
          severity: "medium",
          daysSince: 7,
          action: "Send reminder",
        },
        {
          userId: 103,
          name: "Maria Garcia",
          issue: "Compliance expiring soon",
          severity: "medium",
          daysUntilExpiry: 14,
          action: "Schedule renewal",
        },
      ],
    };
  }),

  /**
   * Resolve admin alert
   */
  resolveAdminAlert: protectedProcedure
    .input(z.object({ alertId: z.number(), resolution: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        return { error: "Admin access required" };
      }

      const alert = dashboardAlerts.find((a) => a.id === input.alertId);
      if (!alert) {
        return { error: "Alert not found" };
      }

      alert.status = "resolved";

      return {
        success: true,
        alertId: input.alertId,
        resolution: input.resolution,
      };
    }),

  // ========== NOTIFICATION PROCEDURES ==========

  /**
   * Get member notifications
   */
  getMemberNotifications: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      let notifications = memberNotifications[ctx.user.id] || [];

      if (input.unreadOnly) {
        notifications = notifications.filter((n) => !n.read);
      }

      return {
        notifications: notifications.slice(0, input.limit),
        unreadCount: notifications.filter((n) => !n.read).length,
        totalCount: notifications.length,
      };
    }),

  /**
   * Mark notification as read
   */
  markNotificationAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const notifications = memberNotifications[ctx.user.id];
      if (!notifications) {
        return { error: "No notifications found" };
      }

      const notification = notifications.find((n) => n.id === input.notificationId);
      if (!notification) {
        return { error: "Notification not found" };
      }

      notification.read = true;

      return { success: true, notificationId: input.notificationId };
    }),

  /**
   * Get notification preferences
   */
  getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      preferences: {
        onboarding: { email: true, inApp: true },
        courses: { email: true, inApp: true },
        achievements: { email: false, inApp: true },
        compliance: { email: true, inApp: true },
        employment: { email: true, inApp: true },
        system: { email: false, inApp: true },
      },
      frequency: "immediate",
      quietHours: { enabled: false },
    };
  }),

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        preferences: z.record(z.string(), z.object({ email: z.boolean(), inApp: z.boolean() })),
        frequency: z.enum(["immediate", "daily", "weekly"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        userId: ctx.user.id,
        preferences: input.preferences,
        frequency: input.frequency || "immediate",
      };
    }),

  /**
   * Create notification (admin only)
   */
  createNotification: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        type: z.string(),
        title: z.string(),
        message: z.string(),
        actionUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        return { error: "Admin access required" };
      }

      if (!memberNotifications[input.userId]) {
        memberNotifications[input.userId] = [];
      }

      const notification = {
        id: (memberNotifications[input.userId]?.length || 0) + 1,
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        read: false,
        createdAt: new Date(),
        actionUrl: input.actionUrl,
      };

      memberNotifications[input.userId].push(notification);

      return {
        success: true,
        notificationId: notification.id,
        userId: input.userId,
      };
    }),

  /**
   * Get notification statistics
   */
  getNotificationStatistics: protectedProcedure.query(async ({ ctx }) => {
    const userNotifications = memberNotifications[ctx.user.id] || [];

    const stats = {
      totalNotifications: userNotifications.length,
      unreadNotifications: userNotifications.filter((n) => !n.read).length,
      notificationsByType: {} as Record<string, number>,
      notificationsByDay: {} as Record<string, number>,
    };

    userNotifications.forEach((n) => {
      stats.notificationsByType[n.type] =
        (stats.notificationsByType[n.type] || 0) + 1;

      const day = n.createdAt.toLocaleDateString();
      stats.notificationsByDay[day] =
        (stats.notificationsByDay[day] || 0) + 1;
    });

    return stats;
  }),
});
