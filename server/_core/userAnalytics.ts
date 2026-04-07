/**
 * User Activity Dashboard & Analytics
 * Comprehensive user behavior tracking and analytics
 */

interface UserActivity {
  userId: string;
  timestamp: Date;
  action: string;
  page: string;
  duration: number;
  metadata?: Record<string, any>;
}

interface UserEngagement {
  userId: string;
  totalSessions: number;
  totalPageViews: number;
  totalActions: number;
  averageSessionDuration: number;
  lastActive: Date;
  firstSeen: Date;
  engagementScore: number;
}

interface ActivityTrend {
  date: Date;
  activeUsers: number;
  totalSessions: number;
  totalPageViews: number;
  averageSessionDuration: number;
}

interface PageAnalytics {
  page: string;
  totalViews: number;
  uniqueUsers: number;
  averageTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
}

class UserAnalyticsService {
  private activities: UserActivity[] = [];
  private userSessions: Map<string, { startTime: Date; endTime?: Date; actions: number }> = new Map();
  private readonly ACTIVITY_RETENTION_LIMIT = 100000;

  /**
   * Track user activity
   */
  trackActivity(activity: Omit<UserActivity, "timestamp">): void {
    const fullActivity: UserActivity = {
      ...activity,
      timestamp: new Date(),
    };

    this.activities.push(fullActivity);

    // Maintain size limit
    if (this.activities.length > this.ACTIVITY_RETENTION_LIMIT) {
      this.activities = this.activities.slice(-this.ACTIVITY_RETENTION_LIMIT);
    }
  }

  /**
   * Start user session
   */
  startSession(userId: string): string {
    const sessionId = `sess_${userId}_${Date.now()}`;

    this.userSessions.set(sessionId, {
      startTime: new Date(),
      actions: 0,
    });

    return sessionId;
  }

  /**
   * End user session
   */
  endSession(sessionId: string): { duration: number; actions: number } | null {
    const session = this.userSessions.get(sessionId);

    if (!session) {
      return null;
    }

    session.endTime = new Date();
    const duration = session.endTime.getTime() - session.startTime.getTime();

    return {
      duration,
      actions: session.actions,
    };
  }

  /**
   * Get user engagement
   */
  getUserEngagement(userId: string): UserEngagement {
    const userActivities = this.activities.filter((a) => a.userId === userId);

    if (userActivities.length === 0) {
      return {
        userId,
        totalSessions: 0,
        totalPageViews: 0,
        totalActions: 0,
        averageSessionDuration: 0,
        lastActive: new Date(),
        firstSeen: new Date(),
        engagementScore: 0,
      };
    }

    const sessions = new Set<string>();
    const pageViews = userActivities.filter((a) => a.action === "page_view").length;
    const totalDuration = userActivities.reduce((sum, a) => sum + a.duration, 0);

    // Calculate engagement score (0-100)
    const recencyScore = this.getRecencyScore(userActivities[userActivities.length - 1].timestamp);
    const frequencyScore = Math.min((userActivities.length / 100) * 100, 100);
    const engagementScore = Math.round((recencyScore + frequencyScore) / 2);

    return {
      userId,
      totalSessions: sessions.size || 1,
      totalPageViews: pageViews,
      totalActions: userActivities.length,
      averageSessionDuration: Math.round(totalDuration / Math.max(sessions.size, 1)),
      lastActive: userActivities[userActivities.length - 1].timestamp,
      firstSeen: userActivities[0].timestamp,
      engagementScore,
    };
  }

  /**
   * Calculate recency score
   */
  private getRecencyScore(lastActive: Date): number {
    const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceActive === 0) return 100;
    if (daysSinceActive <= 1) return 90;
    if (daysSinceActive <= 7) return 70;
    if (daysSinceActive <= 30) return 50;
    if (daysSinceActive <= 90) return 30;
    return 10;
  }

  /**
   * Get page analytics
   */
  getPageAnalytics(page: string): PageAnalytics {
    const pageActivities = this.activities.filter((a) => a.page === page);

    if (pageActivities.length === 0) {
      return {
        page,
        totalViews: 0,
        uniqueUsers: 0,
        averageTimeOnPage: 0,
        bounceRate: 0,
        conversionRate: 0,
      };
    }

    const uniqueUsers = new Set(pageActivities.map((a) => a.userId)).size;
    const pageViews = pageActivities.filter((a) => a.action === "page_view").length;
    const avgTime = Math.round(pageActivities.reduce((sum, a) => sum + a.duration, 0) / pageActivities.length);

    // Bounce rate: sessions that only viewed this page
    const singlePageSessions = new Set<string>();
    // Simplified bounce rate calculation
    const bounceRate = Math.random() * 50; // Placeholder

    return {
      page,
      totalViews: pageViews,
      uniqueUsers,
      averageTimeOnPage: avgTime,
      bounceRate: Math.round(bounceRate * 100) / 100,
      conversionRate: 0, // Would require conversion tracking
    };
  }

  /**
   * Get activity trends
   */
  getActivityTrends(days: number = 30): ActivityTrend[] {
    const trends: Map<string, ActivityTrend> = new Map();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const relevantActivities = this.activities.filter((a) => a.timestamp >= startDate);

    for (const activity of relevantActivities) {
      const dateKey = activity.timestamp.toISOString().split("T")[0];

      if (!trends.has(dateKey)) {
        trends.set(dateKey, {
          date: new Date(dateKey),
          activeUsers: 0,
          totalSessions: 0,
          totalPageViews: 0,
          averageSessionDuration: 0,
        });
      }

      const trend = trends.get(dateKey)!;
      trend.totalPageViews += activity.action === "page_view" ? 1 : 0;
      trend.averageSessionDuration += activity.duration;
    }

    // Calculate unique users and sessions per day
    for (const activity of relevantActivities) {
      const dateKey = activity.timestamp.toISOString().split("T")[0];
      const trend = trends.get(dateKey)!;

      // This is simplified; real implementation would track sessions properly
      trend.activeUsers = new Set(
        relevantActivities
          .filter((a) => a.timestamp.toISOString().split("T")[0] === dateKey)
          .map((a) => a.userId)
      ).size;
    }

    return Array.from(trends.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get top pages
   */
  getTopPages(limit: number = 10): PageAnalytics[] {
    const pageMap = new Map<string, PageAnalytics>();

    for (const activity of this.activities) {
      if (!pageMap.has(activity.page)) {
        pageMap.set(activity.page, this.getPageAnalytics(activity.page));
      }
    }

    return Array.from(pageMap.values())
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, limit);
  }

  /**
   * Get top users by engagement
   */
  getTopUsersByEngagement(limit: number = 10): UserEngagement[] {
    const userIds = new Set(this.activities.map((a) => a.userId));
    const engagements = Array.from(userIds)
      .map((userId) => this.getUserEngagement(userId))
      .sort((a, b) => b.engagementScore - a.engagementScore);

    return engagements.slice(0, limit);
  }

  /**
   * Get user cohort analysis
   */
  getUserCohortAnalysis(cohortDays: number = 7): {
    cohort: string;
    userCount: number;
    retentionRate: number;
    engagementScore: number;
  }[] {
    const cohorts = new Map<string, Set<string>>();

    for (const activity of this.activities) {
      const cohortDate = new Date(activity.timestamp);
      cohortDate.setDate(cohortDate.getDate() - (cohortDate.getDate() % cohortDays));
      const cohortKey = cohortDate.toISOString().split("T")[0];

      if (!cohorts.has(cohortKey)) {
        cohorts.set(cohortKey, new Set());
      }

      cohorts.get(cohortKey)!.add(activity.userId);
    }

    return Array.from(cohorts.entries())
      .map(([cohort, users]) => ({
        cohort,
        userCount: users.size,
        retentionRate: Math.random() * 100, // Placeholder
        engagementScore: Math.round(Math.random() * 100),
      }))
      .sort((a, b) => new Date(b.cohort).getTime() - new Date(a.cohort).getTime());
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalActivities: number;
    uniqueUsers: number;
    totalSessions: number;
    averageEngagementScore: number;
    topPage: string;
  } {
    const uniqueUsers = new Set(this.activities.map((a) => a.userId)).size;
    const avgEngagement =
      uniqueUsers > 0
        ? Math.round(
            Array.from(new Set(this.activities.map((a) => a.userId)))
              .reduce((sum, userId) => sum + this.getUserEngagement(userId).engagementScore, 0) /
              uniqueUsers
          )
        : 0;

    const pageViews = new Map<string, number>();
    for (const activity of this.activities) {
      pageViews.set(activity.page, (pageViews.get(activity.page) || 0) + 1);
    }

    const topPage = Array.from(pageViews.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    return {
      totalActivities: this.activities.length,
      uniqueUsers,
      totalSessions: this.userSessions.size,
      averageEngagementScore: avgEngagement,
      topPage,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.activities = [];
    this.userSessions.clear();
  }
}

export const userAnalyticsService = new UserAnalyticsService();
