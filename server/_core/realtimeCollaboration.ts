/**
 * Real-time Collaboration Service
 * WebSocket-based multi-user synchronization for dashboards and alerts
 */

import { EventEmitter } from "events";

interface UserSession {
  userId: string;
  userName: string;
  sessionId: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  viewingPage: string;
}

interface CollaborationEvent {
  id: string;
  type:
    | "alert_acknowledge"
    | "dashboard_update"
    | "workflow_change"
    | "metric_update"
    | "user_join"
    | "user_leave"
    | "cursor_move"
    | "selection_change";
  userId: string;
  userName: string;
  timestamp: Date;
  data: Record<string, any>;
  sessionId: string;
}

interface SharedAlert {
  alertId: string;
  acknowledgedBy: Set<string>;
  acknowledgedAt: Map<string, Date>;
  resolvedBy?: string;
  resolvedAt?: Date;
  watchers: Set<string>;
}

interface DashboardState {
  dashboardId: string;
  activeUsers: Map<string, UserSession>;
  sharedAlerts: Map<string, SharedAlert>;
  eventHistory: CollaborationEvent[];
  lastUpdate: Date;
}

class RealtimeCollaborationService extends EventEmitter {
  private userSessions: Map<string, UserSession> = new Map();
  private dashboardStates: Map<string, DashboardState> = new Map();
  private sharedAlerts: Map<string, SharedAlert> = new Map();
  private eventHistory: CollaborationEvent[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private maxEventHistory = 1000;

  constructor() {
    super();
    this.startHeartbeat();
  }

  /**
   * Register a user session
   */
  registerSession(
    userId: string,
    userName: string,
    sessionId: string,
    viewingPage: string
  ): UserSession {
    const session: UserSession = {
      userId,
      userName,
      sessionId,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
      viewingPage,
    };

    this.userSessions.set(sessionId, session);

    this.emitEvent({
      type: "user_join",
      userId,
      userName,
      data: { sessionId, viewingPage },
    });

    return session;
  }

  /**
   * Unregister a user session
   */
  unregisterSession(sessionId: string): void {
    const session = this.userSessions.get(sessionId);
    if (session) {
      this.userSessions.delete(sessionId);

      this.emitEvent({
        type: "user_leave",
        userId: session.userId,
        userName: session.userName,
        data: { sessionId },
      });
    }
  }

  /**
   * Get active users
   */
  getActiveUsers(): UserSession[] {
    return Array.from(this.userSessions.values());
  }

  /**
   * Get users viewing specific page
   */
  getUsersOnPage(page: string): UserSession[] {
    return Array.from(this.userSessions.values()).filter(
      (s) => s.viewingPage === page
    );
  }

  /**
   * Update user heartbeat
   */
  updateHeartbeat(sessionId: string): void {
    const session = this.userSessions.get(sessionId);
    if (session) {
      session.lastHeartbeat = new Date();
    }
  }

  /**
   * Acknowledge alert by user
   */
  acknowledgeAlert(
    alertId: string,
    userId: string,
    userName: string
  ): SharedAlert {
    let alert = this.sharedAlerts.get(alertId);

    if (!alert) {
      alert = {
        alertId,
        acknowledgedBy: new Set(),
        acknowledgedAt: new Map(),
        watchers: new Set(),
      };
      this.sharedAlerts.set(alertId, alert);
    }

    alert.acknowledgedBy.add(userId);
    alert.acknowledgedAt.set(userId, new Date());

    this.emitEvent({
      type: "alert_acknowledge",
      userId,
      userName,
      data: {
        alertId,
        acknowledgedBy: Array.from(alert.acknowledgedBy),
        acknowledgedCount: alert.acknowledgedBy.size,
      },
    });

    return alert;
  }

  /**
   * Resolve alert
   */
  resolveAlert(
    alertId: string,
    userId: string,
    userName: string
  ): SharedAlert | null {
    const alert = this.sharedAlerts.get(alertId);

    if (!alert) {
      return null;
    }

    alert.resolvedBy = userId;
    alert.resolvedAt = new Date();

    this.emitEvent({
      type: "alert_acknowledge",
      userId,
      userName,
      data: {
        alertId,
        resolved: true,
        resolvedBy: userId,
        resolvedAt: alert.resolvedAt,
      },
    });

    return alert;
  }

  /**
   * Add watcher to alert
   */
  watchAlert(alertId: string, userId: string): void {
    let alert = this.sharedAlerts.get(alertId);

    if (!alert) {
      alert = {
        alertId,
        acknowledgedBy: new Set(),
        acknowledgedAt: new Map(),
        watchers: new Set(),
      };
      this.sharedAlerts.set(alertId, alert);
    }

    alert.watchers.add(userId);
  }

  /**
   * Get alert status
   */
  getAlertStatus(alertId: string): SharedAlert | null {
    return this.sharedAlerts.get(alertId) || null;
  }

  /**
   * Get all shared alerts
   */
  getAllSharedAlerts(): SharedAlert[] {
    return Array.from(this.sharedAlerts.values());
  }

  /**
   * Emit collaboration event
   */
  private emitEvent(event: Omit<CollaborationEvent, "id" | "timestamp" | "sessionId">): CollaborationEvent {
    const collaborationEvent: CollaborationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      sessionId: "",
      ...event,
    };

    this.eventHistory.push(collaborationEvent);

    // Keep history size manageable
    if (this.eventHistory.length > this.maxEventHistory) {
      this.eventHistory = this.eventHistory.slice(-this.maxEventHistory);
    }

    this.emit("collaboration_event", collaborationEvent);
    return collaborationEvent;
  }

  /**
   * Get event history
   */
  getEventHistory(limit: number = 100): CollaborationEvent[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Get collaboration stats
   */
  getStats(): {
    activeUsers: number;
    totalSessions: number;
    sharedAlerts: number;
    acknowledgedAlerts: number;
    unresolvedAlerts: number;
    eventCount: number;
  } {
    const unresolvedAlerts = Array.from(this.sharedAlerts.values()).filter(
      (a) => !a.resolvedBy
    ).length;

    const acknowledgedAlerts = Array.from(this.sharedAlerts.values()).filter(
      (a) => a.acknowledgedBy.size > 0
    ).length;

    return {
      activeUsers: this.userSessions.size,
      totalSessions: this.userSessions.size,
      sharedAlerts: this.sharedAlerts.size,
      acknowledgedAlerts,
      unresolvedAlerts,
      eventCount: this.eventHistory.length,
    };
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const timeout = 5 * 60 * 1000; // 5 minutes

      for (const [sessionId, session] of this.userSessions.entries()) {
        if (now.getTime() - session.lastHeartbeat.getTime() > timeout) {
          this.unregisterSession(sessionId);
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Stop heartbeat monitoring
   */
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.userSessions.clear();
    this.dashboardStates.clear();
    this.sharedAlerts.clear();
    this.eventHistory = [];
  }

  /**
   * Cleanup on shutdown
   */
  shutdown(): void {
    this.stopHeartbeat();
    this.clear();
    this.removeAllListeners();
  }
}

export const realtimeCollaborationService =
  new RealtimeCollaborationService();
