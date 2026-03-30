import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

/**
 * Phase 36.1: Member Dashboard UI Components
 * 
 * Provides data for rendering:
 * - Investment recommendations widget
 * - Video conference scheduling panel
 * - Radio broadcast listener interface
 * - Real-time notifications
 * - Portfolio overview
 * - Performance metrics
 */

interface DashboardWidget {
  id: string;
  title: string;
  type: "recommendations" | "conferences" | "broadcasts" | "notifications" | "portfolio" | "metrics";
  data: any;
  lastUpdated: Date;
}

interface PortfolioOverview {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  positions: number;
  topPerformer: string;
  topPerformerChange: number;
}

interface RecommendationWidget {
  recommendations: Array<{
    symbol: string;
    action: "buy" | "sell" | "hold";
    confidence: number;
    targetPrice: number;
    reasoning: string;
  }>;
  lastUpdated: Date;
}

interface ConferenceWidget {
  upcoming: Array<{
    id: string;
    title: string;
    startTime: Date;
    participants: number;
    joinUrl: string;
  }>;
  recent: Array<{
    id: string;
    title: string;
    endTime: Date;
    recordingUrl?: string;
  }>;
}

interface BroadcastWidget {
  live: Array<{
    id: string;
    title: string;
    host: string;
    listeners: number;
    streamUrl: string;
  }>;
  upcoming: Array<{
    id: string;
    title: string;
    startTime: Date;
    language: string;
    region: string;
  }>;
}

interface NotificationWidget {
  unread: number;
  notifications: Array<{
    id: string;
    type: "achievement" | "alert" | "opportunity" | "update";
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPortfolioOverview: Record<number, PortfolioOverview> = {
  1: {
    totalValue: 45250.75,
    dayChange: 1250.5,
    dayChangePercent: 2.84,
    positions: 12,
    topPerformer: "BTC",
    topPerformerChange: 5.23,
  },
};

const mockRecommendations: Record<number, RecommendationWidget> = {
  1: {
    recommendations: [
      {
        symbol: "AAPL",
        action: "buy",
        confidence: 0.85,
        targetPrice: 220.0,
        reasoning: "Strong earnings growth, expanding services",
      },
      {
        symbol: "BTC",
        action: "buy",
        confidence: 0.72,
        targetPrice: 85000.0,
        reasoning: "Bitcoin halving cycle, institutional adoption",
      },
      {
        symbol: "MSFT",
        action: "hold",
        confidence: 0.68,
        targetPrice: 440.0,
        reasoning: "AI integration progressing, cloud growth steady",
      },
    ],
    lastUpdated: new Date(),
  },
};

const mockConferences: Record<number, ConferenceWidget> = {
  1: {
    upcoming: [
      {
        id: "conf-1",
        title: "Investment Strategy Meeting",
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        participants: 0,
        joinUrl: "https://finmap.manus.space/conference/conf-1",
      },
    ],
    recent: [
      {
        id: "conf-2",
        title: "Q1 Portfolio Review",
        endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        recordingUrl: "https://finmap.manus.space/recordings/rec-1",
      },
    ],
  },
};

const mockBroadcasts: BroadcastWidget = {
  live: [
    {
      id: "broadcast-1",
      title: "Financial Freedom Hour",
      host: "Financial Expert",
      listeners: 245,
      streamUrl: "https://radio.finmap.manus.space/stream/1",
    },
  ],
  upcoming: [
    {
      id: "broadcast-2",
      title: "Global Markets Update",
      startTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
      language: "en",
      region: "international",
    },
  ],
};

const mockNotifications: Record<number, NotificationWidget> = {
  1: {
    unread: 3,
    notifications: [
      {
        id: "notif-1",
        type: "achievement",
        title: "Investment Literacy Certificate Earned!",
        message: "You completed the Investment Fundamentals course",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
      },
      {
        id: "notif-2",
        type: "opportunity",
        title: "New Employment Opportunity",
        message: "Portfolio Manager role matches your profile",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: false,
      },
      {
        id: "notif-3",
        type: "alert",
        title: "Compliance Deadline Reminder",
        message: "Annual KYC verification due in 7 days",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        read: false,
      },
    ],
  },
};

// ============================================================================
// PROCEDURES
// ============================================================================

export const memberDashboardUIRouter = router({
  /**
   * Get complete dashboard overview with all widgets
   */
  getDashboardOverview: protectedProcedure.query(async ({ ctx }) => {
    const portfolio = mockPortfolioOverview[ctx.user.id] || mockPortfolioOverview[1];
    const recommendations = mockRecommendations[ctx.user.id] || mockRecommendations[1];
    const conferences = mockConferences[ctx.user.id] || mockConferences[1];
    const notifications = mockNotifications[ctx.user.id] || mockNotifications[1];

    return {
      portfolio,
      recommendations,
      conferences,
      broadcasts: mockBroadcasts,
      notifications,
      lastUpdated: new Date(),
    };
  }),

  /**
   * Get portfolio overview widget
   */
  getPortfolioWidget: protectedProcedure.query(async ({ ctx }) => {
    const portfolio = mockPortfolioOverview[ctx.user.id] || mockPortfolioOverview[1];

    return {
      widget: {
        id: "portfolio-widget",
        title: "Portfolio Overview",
        type: "portfolio" as const,
        data: portfolio,
        lastUpdated: new Date(),
      },
    };
  }),

  /**
   * Get investment recommendations widget
   */
  getRecommendationsWidget: protectedProcedure.query(async ({ ctx }) => {
    const recommendations = mockRecommendations[ctx.user.id] || mockRecommendations[1];

    return {
      widget: {
        id: "recommendations-widget",
        title: "Investment Recommendations",
        type: "recommendations" as const,
        data: recommendations,
        lastUpdated: new Date(),
      },
    };
  }),

  /**
   * Get video conference widget
   */
  getConferencesWidget: protectedProcedure.query(async ({ ctx }) => {
    const conferences = mockConferences[ctx.user.id] || mockConferences[1];

    return {
      widget: {
        id: "conferences-widget",
        title: "Video Conferences",
        type: "conferences" as const,
        data: conferences,
        lastUpdated: new Date(),
      },
    };
  }),

  /**
   * Get radio broadcast widget
   */
  getBroadcastsWidget: protectedProcedure.query(async ({ ctx }) => {
    return {
      widget: {
        id: "broadcasts-widget",
        title: "Radio Broadcasts",
        type: "broadcasts" as const,
        data: mockBroadcasts,
        lastUpdated: new Date(),
      },
    };
  }),

  /**
   * Get notifications widget
   */
  getNotificationsWidget: protectedProcedure.query(async ({ ctx }) => {
    const notifications = mockNotifications[ctx.user.id] || mockNotifications[1];

    return {
      widget: {
        id: "notifications-widget",
        title: "Notifications",
        type: "notifications" as const,
        data: notifications,
        lastUpdated: new Date(),
      },
    };
  }),

  /**
   * Mark notification as read
   */
  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notifications = mockNotifications[ctx.user.id];
      if (!notifications) {
        return { error: "Notifications not found" };
      }

      const notification = notifications.notifications.find((n) => n.id === input.notificationId);
      if (!notification) {
        return { error: "Notification not found" };
      }

      notification.read = true;
      notifications.unread = Math.max(0, notifications.unread - 1);

      return {
        success: true,
        notification,
        unreadCount: notifications.unread,
      };
    }),

  /**
   * Get performance metrics
   */
  getPerformanceMetrics: protectedProcedure.query(async ({ ctx }) => {
    const portfolio = mockPortfolioOverview[ctx.user.id] || mockPortfolioOverview[1];

    return {
      metrics: {
        totalReturn: 12.5,
        ytdReturn: 8.3,
        monthlyReturn: 2.84,
        sharpeRatio: 1.45,
        maxDrawdown: -8.2,
        winRate: 68.5,
        profitFactor: 2.1,
      },
      portfolio,
    };
  }),

  /**
   * Get quick actions menu
   */
  getQuickActions: protectedProcedure.query(async ({ ctx }) => {
    return {
      actions: [
        {
          id: "action-1",
          label: "Create Investment",
          icon: "plus",
          action: "create_investment",
          color: "primary",
        },
        {
          id: "action-2",
          label: "Schedule Conference",
          icon: "video",
          action: "schedule_conference",
          color: "secondary",
        },
        {
          id: "action-3",
          label: "Join Broadcast",
          icon: "radio",
          action: "join_broadcast",
          color: "accent",
        },
        {
          id: "action-4",
          label: "View Portfolio",
          icon: "chart",
          action: "view_portfolio",
          color: "info",
        },
      ],
    };
  }),

  /**
   * Get dashboard layout configuration
   */
  getDashboardLayout: protectedProcedure
    .input(
      z.object({
        deviceType: z.enum(["desktop", "tablet", "mobile"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const layouts = {
        desktop: [
          { id: "portfolio-widget", position: 1, size: "large" },
          { id: "recommendations-widget", position: 2, size: "large" },
          { id: "conferences-widget", position: 3, size: "medium" },
          { id: "broadcasts-widget", position: 4, size: "medium" },
          { id: "notifications-widget", position: 5, size: "full" },
        ],
        tablet: [
          { id: "portfolio-widget", position: 1, size: "full" },
          { id: "recommendations-widget", position: 2, size: "full" },
          { id: "conferences-widget", position: 3, size: "medium" },
          { id: "broadcasts-widget", position: 4, size: "medium" },
          { id: "notifications-widget", position: 5, size: "full" },
        ],
        mobile: [
          { id: "portfolio-widget", position: 1, size: "full" },
          { id: "recommendations-widget", position: 2, size: "full" },
          { id: "conferences-widget", position: 3, size: "full" },
          { id: "broadcasts-widget", position: 4, size: "full" },
          { id: "notifications-widget", position: 5, size: "full" },
        ],
      };

      return {
        layout: layouts[input.deviceType || "desktop"],
        responsive: true,
      };
    }),

  /**
   * Get dashboard statistics
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    return {
      stats: {
        totalInvested: 45250.75,
        activePositions: 12,
        upcomingConferences: 3,
        liveStreams: 2,
        unreadNotifications: 3,
        completedCourses: 5,
        achievements: 12,
        employmentOpportunities: 8,
      },
    };
  }),

  /**
   * Get personalized recommendations based on user profile
   */
  getPersonalizedRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return {
      recommendations: [
        {
          type: "course",
          title: "Advanced Portfolio Management",
          description: "Based on your trading activity",
          progress: 0,
          estimatedTime: "4 weeks",
        },
        {
          type: "opportunity",
          title: "Senior Portfolio Manager",
          description: "Matches your experience level",
          salary: "$120,000 - $150,000",
          match: 92,
        },
        {
          type: "investment",
          title: "Emerging Markets Fund",
          description: "Complements your current portfolio",
          riskLevel: "medium",
          expectedReturn: "8-12%",
        },
      ],
    };
  }),
});
