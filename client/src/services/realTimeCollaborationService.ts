// Real-Time Collaboration Service
// Enables live co-editing and presence indicators

export interface Collaborator {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  color: string;
  cursor?: CursorPosition;
  selection?: SelectionRange;
  lastActive: Date;
  status: 'active' | 'idle' | 'away';
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
}

export interface SelectionRange {
  start: number;
  end: number;
  elementId: string;
}

export interface CollaborationSession {
  id: string;
  documentId: string;
  documentType: 'document' | 'task' | 'spreadsheet' | 'form';
  collaborators: Collaborator[];
  createdAt: Date;
  lastActivity: Date;
}

export interface DocumentChange {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  type: 'insert' | 'delete' | 'update' | 'format';
  path: string;
  value: any;
  previousValue?: any;
  timestamp: Date;
}

export interface Comment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  elementId?: string;
  position?: { x: number; y: number };
  replies: CommentReply[];
  resolved: boolean;
  createdAt: Date;
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface PresenceIndicator {
  userId: string;
  userName: string;
  color: string;
  position: CursorPosition;
}

const COLLABORATOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

class RealTimeCollaborationService {
  private readonly SESSIONS_KEY = 'collaboration_sessions';
  private readonly CHANGES_KEY = 'collaboration_changes';
  private readonly COMMENTS_KEY = 'collaboration_comments';
  private currentSession: CollaborationSession | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private changeListeners: ((change: DocumentChange) => void)[] = [];
  private presenceListeners: ((collaborators: Collaborator[]) => void)[] = [];

  // Session Management
  joinSession(documentId: string, documentType: CollaborationSession['documentType'], userId: string, userName: string): CollaborationSession {
    let session = this.getSessionByDocument(documentId);
    
    if (!session) {
      session = this.createSession(documentId, documentType);
    }

    // Add collaborator if not already present
    const existingCollaborator = session.collaborators.find(c => c.userId === userId);
    if (!existingCollaborator) {
      const collaborator: Collaborator = {
        id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        userName,
        color: this.getNextColor(session.collaborators.length),
        lastActive: new Date(),
        status: 'active'
      };
      session.collaborators.push(collaborator);
      this.updateSession(session);
    } else {
      existingCollaborator.status = 'active';
      existingCollaborator.lastActive = new Date();
      this.updateSession(session);
    }

    this.currentSession = session;
    this.startHeartbeat(userId);
    this.notifyPresenceChange();

    return session;
  }

  leaveSession(userId: string): void {
    if (!this.currentSession) return;

    this.currentSession.collaborators = this.currentSession.collaborators.filter(
      c => c.userId !== userId
    );

    if (this.currentSession.collaborators.length === 0) {
      this.deleteSession(this.currentSession.id);
    } else {
      this.updateSession(this.currentSession);
    }

    this.stopHeartbeat();
    this.currentSession = null;
  }

  getCurrentSession(): CollaborationSession | null {
    return this.currentSession;
  }

  getActiveCollaborators(): Collaborator[] {
    if (!this.currentSession) return [];
    return this.currentSession.collaborators.filter(c => c.status === 'active');
  }

  // Cursor & Selection
  updateCursor(userId: string, position: CursorPosition): void {
    if (!this.currentSession) return;

    const collaborator = this.currentSession.collaborators.find(c => c.userId === userId);
    if (collaborator) {
      collaborator.cursor = position;
      collaborator.lastActive = new Date();
      collaborator.status = 'active';
      this.updateSession(this.currentSession);
      this.notifyPresenceChange();
    }
  }

  updateSelection(userId: string, selection: SelectionRange | undefined): void {
    if (!this.currentSession) return;

    const collaborator = this.currentSession.collaborators.find(c => c.userId === userId);
    if (collaborator) {
      collaborator.selection = selection;
      collaborator.lastActive = new Date();
      this.updateSession(this.currentSession);
      this.notifyPresenceChange();
    }
  }

  // Document Changes
  broadcastChange(change: Omit<DocumentChange, 'id' | 'timestamp'>): DocumentChange {
    const fullChange: DocumentChange = {
      ...change,
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    const changes = this.getChanges();
    changes.unshift(fullChange);
    this.saveChanges(changes.slice(0, 1000)); // Keep last 1000 changes

    // Notify listeners
    this.changeListeners.forEach(listener => listener(fullChange));

    return fullChange;
  }

  getChanges(sessionId?: string): DocumentChange[] {
    const stored = localStorage.getItem(this.CHANGES_KEY);
    if (!stored) return [];
    
    const changes: DocumentChange[] = JSON.parse(stored).map((c: any) => ({
      ...c,
      timestamp: new Date(c.timestamp)
    }));

    if (sessionId) {
      return changes.filter(c => c.sessionId === sessionId);
    }
    return changes;
  }

  getRecentChanges(sessionId: string, limit: number = 50): DocumentChange[] {
    return this.getChanges(sessionId).slice(0, limit);
  }

  // Comments
  addComment(comment: Omit<Comment, 'id' | 'replies' | 'resolved' | 'createdAt'>): Comment {
    const comments = this.getComments();
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      replies: [],
      resolved: false,
      createdAt: new Date()
    };
    comments.unshift(newComment);
    this.saveComments(comments);
    return newComment;
  }

  replyToComment(commentId: string, reply: Omit<CommentReply, 'id' | 'createdAt'>): CommentReply | null {
    const comments = this.getComments();
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return null;

    const newReply: CommentReply = {
      ...reply,
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    comment.replies.push(newReply);
    this.saveComments(comments);
    return newReply;
  }

  resolveComment(commentId: string): boolean {
    const comments = this.getComments();
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return false;

    comment.resolved = true;
    this.saveComments(comments);
    return true;
  }

  getComments(sessionId?: string): Comment[] {
    const stored = localStorage.getItem(this.COMMENTS_KEY);
    if (!stored) return [];

    const comments: Comment[] = JSON.parse(stored).map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      replies: c.replies.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt)
      }))
    }));

    if (sessionId) {
      return comments.filter(c => c.sessionId === sessionId);
    }
    return comments;
  }

  // Event Listeners
  onChangeReceived(callback: (change: DocumentChange) => void): () => void {
    this.changeListeners.push(callback);
    return () => {
      this.changeListeners = this.changeListeners.filter(l => l !== callback);
    };
  }

  onPresenceChange(callback: (collaborators: Collaborator[]) => void): () => void {
    this.presenceListeners.push(callback);
    return () => {
      this.presenceListeners = this.presenceListeners.filter(l => l !== callback);
    };
  }

  // Presence Indicators
  getPresenceIndicators(): PresenceIndicator[] {
    if (!this.currentSession) return [];
    
    return this.currentSession.collaborators
      .filter(c => c.status === 'active' && c.cursor)
      .map(c => ({
        userId: c.userId,
        userName: c.userName,
        color: c.color,
        position: c.cursor!
      }));
  }

  // Statistics
  getCollaborationStats(): {
    activeSessions: number;
    totalCollaborators: number;
    totalChanges: number;
    totalComments: number;
    unresolvedComments: number;
  } {
    const sessions = this.getSessions();
    const comments = this.getComments();

    return {
      activeSessions: sessions.length,
      totalCollaborators: sessions.reduce((sum, s) => sum + s.collaborators.length, 0),
      totalChanges: this.getChanges().length,
      totalComments: comments.length,
      unresolvedComments: comments.filter(c => !c.resolved).length
    };
  }

  // Private helpers
  private createSession(documentId: string, documentType: CollaborationSession['documentType']): CollaborationSession {
    const session: CollaborationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      documentType,
      collaborators: [],
      createdAt: new Date(),
      lastActivity: new Date()
    };

    const sessions = this.getSessions();
    sessions.push(session);
    this.saveSessions(sessions);
    return session;
  }

  private getSessions(): CollaborationSession[] {
    const stored = localStorage.getItem(this.SESSIONS_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      lastActivity: new Date(s.lastActivity),
      collaborators: s.collaborators.map((c: any) => ({
        ...c,
        lastActive: new Date(c.lastActive)
      }))
    }));
  }

  private getSessionByDocument(documentId: string): CollaborationSession | null {
    return this.getSessions().find(s => s.documentId === documentId) || null;
  }

  private updateSession(session: CollaborationSession): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index !== -1) {
      session.lastActivity = new Date();
      sessions[index] = session;
      this.saveSessions(sessions);
    }
  }

  private deleteSession(sessionId: string): void {
    const sessions = this.getSessions().filter(s => s.id !== sessionId);
    this.saveSessions(sessions);
  }

  private saveSessions(sessions: CollaborationSession[]): void {
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  }

  private saveChanges(changes: DocumentChange[]): void {
    localStorage.setItem(this.CHANGES_KEY, JSON.stringify(changes));
  }

  private saveComments(comments: Comment[]): void {
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
  }

  private getNextColor(index: number): string {
    return COLLABORATOR_COLORS[index % COLLABORATOR_COLORS.length];
  }

  private startHeartbeat(userId: string): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.currentSession) {
        const collaborator = this.currentSession.collaborators.find(c => c.userId === userId);
        if (collaborator) {
          collaborator.lastActive = new Date();
          this.updateSession(this.currentSession);
        }
        // Mark inactive collaborators
        this.currentSession.collaborators.forEach(c => {
          const inactiveTime = Date.now() - c.lastActive.getTime();
          if (inactiveTime > 60000) c.status = 'away';
          else if (inactiveTime > 30000) c.status = 'idle';
        });
        this.notifyPresenceChange();
      }
    }, 10000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private notifyPresenceChange(): void {
    if (this.currentSession) {
      this.presenceListeners.forEach(listener => 
        listener(this.currentSession!.collaborators)
      );
    }
  }
}

export const realTimeCollaborationService = new RealTimeCollaborationService();
