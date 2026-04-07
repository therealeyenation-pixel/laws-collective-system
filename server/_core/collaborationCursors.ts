/**
 * Real-time Collaboration Cursors
 * Tracks and broadcasts user cursor positions and activities
 */

interface UserCursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  page: string;
  timestamp: Date;
  color: string;
  activity?: string;
}

interface CollaborationSession {
  id: string;
  pageId: string;
  activeUsers: Map<string, UserCursor>;
  createdAt: Date;
  updatedAt: Date;
}

interface CursorUpdate {
  userId: string;
  x: number;
  y: number;
  page: string;
  activity?: string;
}

class CollaborationCursorsService {
  private sessions: Map<string, CollaborationSession> = new Map();
  private userColors: Map<string, string> = new Map();
  private cursorHistory: UserCursor[] = [];
  private readonly CURSOR_TIMEOUT_MS = 30000; // 30 seconds
  private readonly HISTORY_LIMIT = 10000;

  private colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ];

  /**
   * Get or create session for page
   */
  getOrCreateSession(pageId: string): CollaborationSession {
    if (!this.sessions.has(pageId)) {
      const session: CollaborationSession = {
        id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pageId,
        activeUsers: new Map(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.sessions.set(pageId, session);
    }

    return this.sessions.get(pageId)!;
  }

  /**
   * Update user cursor position
   */
  updateCursor(pageId: string, update: CursorUpdate & { userName: string }): UserCursor {
    const session = this.getOrCreateSession(pageId);

    // Get or assign color for user
    if (!this.userColors.has(update.userId)) {
      const colorIndex = this.userColors.size % this.colors.length;
      this.userColors.set(update.userId, this.colors[colorIndex]);
    }

    const cursor: UserCursor = {
      userId: update.userId,
      userName: update.userName,
      x: update.x,
      y: update.y,
      page: update.page,
      timestamp: new Date(),
      color: this.userColors.get(update.userId)!,
      activity: update.activity,
    };

    session.activeUsers.set(update.userId, cursor);
    session.updatedAt = new Date();

    this.cursorHistory.push(cursor);
    if (this.cursorHistory.length > this.HISTORY_LIMIT) {
      this.cursorHistory.shift();
    }

    return cursor;
  }

  /**
   * Get active cursors for page
   */
  getActiveCursors(pageId: string): UserCursor[] {
    const session = this.sessions.get(pageId);
    if (!session) return [];

    const now = new Date();
    const activeCursors: UserCursor[] = [];

    for (const [userId, cursor] of session.activeUsers.entries()) {
      const timeSinceUpdate = now.getTime() - cursor.timestamp.getTime();

      if (timeSinceUpdate < this.CURSOR_TIMEOUT_MS) {
        activeCursors.push(cursor);
      } else {
        session.activeUsers.delete(userId);
      }
    }

    return activeCursors;
  }

  /**
   * Get user cursor
   */
  getUserCursor(pageId: string, userId: string): UserCursor | null {
    const session = this.sessions.get(pageId);
    return session?.activeUsers.get(userId) || null;
  }

  /**
   * Remove user cursor
   */
  removeCursor(pageId: string, userId: string): boolean {
    const session = this.sessions.get(pageId);
    if (!session) return false;

    const removed = session.activeUsers.delete(userId);

    if (session.activeUsers.size === 0) {
      this.sessions.delete(pageId);
    }

    return removed;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): CollaborationSession[] {
    const now = new Date();
    const activeSessions: CollaborationSession[] = [];

    for (const [pageId, session] of this.sessions.entries()) {
      const timeSinceUpdate = now.getTime() - session.updatedAt.getTime();

      if (timeSinceUpdate < this.CURSOR_TIMEOUT_MS * 2) {
        activeSessions.push(session);
      } else {
        this.sessions.delete(pageId);
      }
    }

    return activeSessions;
  }

  /**
   * Get session info
   */
  getSessionInfo(pageId: string): {
    pageId: string;
    activeUserCount: number;
    users: Array<{ userId: string; userName: string; activity?: string }>;
    lastUpdated: Date;
  } | null {
    const session = this.sessions.get(pageId);
    if (!session) return null;

    const cursors = this.getActiveCursors(pageId);

    return {
      pageId,
      activeUserCount: cursors.length,
      users: cursors.map((c) => ({
        userId: c.userId,
        userName: c.userName,
        activity: c.activity,
      })),
      lastUpdated: session.updatedAt,
    };
  }

  /**
   * Get cursor trail for user (last N positions)
   */
  getCursorTrail(userId: string, limit: number = 50): UserCursor[] {
    return this.cursorHistory
      .filter((c) => c.userId === userId)
      .slice(-limit);
  }

  /**
   * Get activity heatmap for page
   */
  getActivityHeatmap(pageId: string, limit: number = 100): Array<{ x: number; y: number; intensity: number }> {
    const pageHistory = this.cursorHistory
      .filter((c) => c.page === pageId)
      .slice(-limit);

    const heatmap = new Map<string, number>();

    for (const cursor of pageHistory) {
      const key = `${Math.round(cursor.x / 10)},${Math.round(cursor.y / 10)}`;
      heatmap.set(key, (heatmap.get(key) || 0) + 1);
    }

    return Array.from(heatmap.entries()).map(([key, intensity]) => {
      const [x, y] = key.split(",").map((v) => parseInt(v) * 10);
      return { x, y, intensity };
    });
  }

  /**
   * Get collaboration statistics
   */
  getStats(): {
    totalSessions: number;
    totalActiveUsers: number;
    totalCursorUpdates: number;
    averageUsersPerSession: number;
    cursorHistorySize: number;
  } {
    const sessions = this.getActiveSessions();
    const totalUsers = sessions.reduce((sum, s) => sum + s.activeUsers.size, 0);

    return {
      totalSessions: sessions.length,
      totalActiveUsers: totalUsers,
      totalCursorUpdates: this.cursorHistory.length,
      averageUsersPerSession: sessions.length > 0 ? totalUsers / sessions.length : 0,
      cursorHistorySize: this.cursorHistory.length,
    };
  }

  /**
   * Cleanup inactive sessions
   */
  cleanup(): number {
    const now = new Date();
    let cleaned = 0;

    for (const [pageId, session] of this.sessions.entries()) {
      const timeSinceUpdate = now.getTime() - session.updatedAt.getTime();

      if (timeSinceUpdate > this.CURSOR_TIMEOUT_MS * 3) {
        this.sessions.delete(pageId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.sessions.clear();
    this.userColors.clear();
    this.cursorHistory = [];
  }
}

export const collaborationCursorsService = new CollaborationCursorsService();
