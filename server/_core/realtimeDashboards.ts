/**
 * Real-time Dashboards
 * Live metrics widgets with 5-second auto-refresh
 */

interface DashboardWidget {
  id: string;
  name: string;
  type: "metric" | "chart" | "table" | "gauge" | "heatmap" | "timeline";
  dataSource: string;
  refreshInterval: number; // milliseconds
  position: { x: number; y: number; width: number; height: number };
  config?: Record<string, any>;
  enabled: boolean;
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  refreshInterval: number; // milliseconds
  owner: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastViewed?: Date;
  viewCount: number;
}

interface MetricSnapshot {
  timestamp: Date;
  value: number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendPercent?: number;
}

interface DashboardData {
  widgetId: string;
  data: any;
  timestamp: Date;
  refreshedAt: Date;
}

interface DashboardSession {
  id: string;
  dashboardId: string;
  userId: string;
  startedAt: Date;
  lastActivityAt: Date;
  viewedWidgets: Set<string>;
}

class RealtimeDashboardsService {
  private dashboards: Map<string, Dashboard> = new Map();
  private widgetData: Map<string, MetricSnapshot[]> = new Map();
  private dashboardSessions: Map<string, DashboardSession> = new Map();
  private readonly DATA_RETENTION_LIMIT = 1000;
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  /**
   * Create dashboard
   */
  createDashboard(dashboard: Omit<Dashboard, "id" | "createdAt" | "updatedAt" | "viewCount">): Dashboard {
    const newDashboard: Dashboard = {
      ...dashboard,
      id: `dash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
    };

    this.dashboards.set(newDashboard.id, newDashboard);
    return newDashboard;
  }

  /**
   * Get dashboard
   */
  getDashboard(dashboardId: string): Dashboard | null {
    return this.dashboards.get(dashboardId) || null;
  }

  /**
   * Get user dashboards
   */
  getUserDashboards(owner: string): Dashboard[] {
    return Array.from(this.dashboards.values()).filter((d) => d.owner === owner);
  }

  /**
   * Get public dashboards
   */
  getPublicDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values()).filter((d) => d.isPublic);
  }

  /**
   * Update dashboard
   */
  updateDashboard(dashboardId: string, updates: Partial<Dashboard>): Dashboard | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const updated: Dashboard = {
      ...dashboard,
      ...updates,
      id: dashboard.id,
      createdAt: dashboard.createdAt,
      updatedAt: new Date(),
    };

    this.dashboards.set(dashboardId, updated);
    return updated;
  }

  /**
   * Delete dashboard
   */
  deleteDashboard(dashboardId: string): boolean {
    return this.dashboards.delete(dashboardId);
  }

  /**
   * Add widget to dashboard
   */
  addWidget(dashboardId: string, widget: Omit<DashboardWidget, "id">): DashboardWidget | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = new Date();

    return newWidget;
  }

  /**
   * Remove widget from dashboard
   */
  removeWidget(dashboardId: string, widgetId: string): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const initialLength = dashboard.widgets.length;
    dashboard.widgets = dashboard.widgets.filter((w) => w.id !== widgetId);
    dashboard.updatedAt = new Date();

    return dashboard.widgets.length < initialLength;
  }

  /**
   * Update widget
   */
  updateWidget(dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>): DashboardWidget | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const widget = dashboard.widgets.find((w) => w.id === widgetId);
    if (!widget) return null;

    const updated: DashboardWidget = {
      ...widget,
      ...updates,
      id: widget.id,
    };

    const index = dashboard.widgets.findIndex((w) => w.id === widgetId);
    dashboard.widgets[index] = updated;
    dashboard.updatedAt = new Date();

    return updated;
  }

  /**
   * Record metric data
   */
  recordMetric(widgetId: string, value: number, unit?: string, trend?: "up" | "down" | "stable"): void {
    const key = `metric_${widgetId}`;

    if (!this.widgetData.has(key)) {
      this.widgetData.set(key, []);
    }

    const data = this.widgetData.get(key)!;

    const snapshot: MetricSnapshot = {
      timestamp: new Date(),
      value,
      unit,
      trend,
    };

    data.push(snapshot);

    // Maintain size limit
    if (data.length > this.DATA_RETENTION_LIMIT) {
      data.shift();
    }
  }

  /**
   * Get widget data
   */
  getWidgetData(widgetId: string, limit: number = 100): MetricSnapshot[] {
    const key = `metric_${widgetId}`;
    const data = this.widgetData.get(key) || [];

    return data.slice(-limit);
  }

  /**
   * Get latest metric
   */
  getLatestMetric(widgetId: string): MetricSnapshot | null {
    const key = `metric_${widgetId}`;
    const data = this.widgetData.get(key);

    return data && data.length > 0 ? data[data.length - 1] : null;
  }

  /**
   * Get metric statistics
   */
  getMetricStats(widgetId: string): {
    current: number;
    average: number;
    min: number;
    max: number;
    trend: string;
  } | null {
    const data = this.getWidgetData(widgetId);

    if (data.length === 0) {
      return null;
    }

    const values = data.map((d) => d.value);
    const current = values[values.length - 1];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    const trend = current > average ? "up" : current < average ? "down" : "stable";

    return {
      current: Math.round(current * 100) / 100,
      average: Math.round(average * 100) / 100,
      min,
      max,
      trend,
    };
  }

  /**
   * Start dashboard session
   */
  startSession(dashboardId: string, userId: string): DashboardSession {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: DashboardSession = {
      id: sessionId,
      dashboardId,
      userId,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      viewedWidgets: new Set(),
    };

    this.dashboardSessions.set(sessionId, session);

    // Update view count
    const dashboard = this.dashboards.get(dashboardId);
    if (dashboard) {
      dashboard.viewCount++;
      dashboard.lastViewed = new Date();
    }

    return session;
  }

  /**
   * End dashboard session
   */
  endSession(sessionId: string): DashboardSession | null {
    const session = this.dashboardSessions.get(sessionId);
    if (session) {
      this.dashboardSessions.delete(sessionId);
    }
    return session || null;
  }

  /**
   * Record widget view
   */
  recordWidgetView(sessionId: string, widgetId: string): void {
    const session = this.dashboardSessions.get(sessionId);
    if (session) {
      session.viewedWidgets.add(widgetId);
      session.lastActivityAt = new Date();
    }
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): DashboardSession[] {
    const now = Date.now();
    const sessions: DashboardSession[] = [];

    for (const [, session] of this.dashboardSessions) {
      if (now - session.lastActivityAt.getTime() < this.SESSION_TIMEOUT_MS) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Get dashboard statistics
   */
  getStats(): {
    totalDashboards: number;
    publicDashboards: number;
    totalWidgets: number;
    activeSessions: number;
    totalViews: number;
  } {
    const totalDashboards = this.dashboards.size;
    const publicDashboards = Array.from(this.dashboards.values()).filter((d) => d.isPublic).length;
    const totalWidgets = Array.from(this.dashboards.values()).reduce((sum, d) => sum + d.widgets.length, 0);
    const activeSessions = this.getActiveSessions().length;
    const totalViews = Array.from(this.dashboards.values()).reduce((sum, d) => sum + d.viewCount, 0);

    return {
      totalDashboards,
      publicDashboards,
      totalWidgets,
      activeSessions,
      totalViews,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.dashboards.clear();
    this.widgetData.clear();
    this.dashboardSessions.clear();
  }
}

export const realtimeDashboardsService = new RealtimeDashboardsService();
