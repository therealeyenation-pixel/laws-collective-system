// Activity Feed Service
// Provides real-time activity tracking across all modules

export interface Activity {
  id: string;
  type: ActivityType;
  module: string;
  action: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  entityId?: string;
  entityType?: string;
  entityName?: string;
  metadata?: Record<string, any>;
  timestamp: number;
  isRead: boolean;
  mentions?: string[];
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export type ActivityType = 
  | 'create' | 'update' | 'delete' | 'complete' | 'approve' | 'reject'
  | 'assign' | 'comment' | 'upload' | 'download' | 'share' | 'login'
  | 'payment' | 'transfer' | 'milestone' | 'alert' | 'system';

export interface ActivityFilter {
  modules?: string[];
  types?: ActivityType[];
  users?: string[];
  importance?: string[];
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  unreadOnly?: boolean;
}

export interface ActivityGroup {
  date: string;
  activities: Activity[];
}

export interface ActivityStats {
  totalToday: number;
  totalThisWeek: number;
  unreadCount: number;
  byModule: Record<string, number>;
  byType: Record<string, number>;
  mostActiveUsers: { userId: string; userName: string; count: number }[];
}

// Available modules for activity tracking
export const ACTIVITY_MODULES = [
  { id: 'users', name: 'Users & Accounts', color: 'blue' },
  { id: 'entities', name: 'Business Entities', color: 'purple' },
  { id: 'transactions', name: 'Financial', color: 'green' },
  { id: 'documents', name: 'Documents', color: 'amber' },
  { id: 'employees', name: 'HR', color: 'pink' },
  { id: 'grants', name: 'Grants', color: 'cyan' },
  { id: 'training', name: 'Training', color: 'orange' },
  { id: 'tasks', name: 'Tasks', color: 'indigo' },
  { id: 'tokens', name: 'Tokens', color: 'yellow' },
  { id: 'system', name: 'System', color: 'gray' },
];

// Activity type icons and colors
export const ACTIVITY_TYPE_CONFIG: Record<ActivityType, { icon: string; color: string; label: string }> = {
  create: { icon: 'Plus', color: 'green', label: 'Created' },
  update: { icon: 'Edit', color: 'blue', label: 'Updated' },
  delete: { icon: 'Trash2', color: 'red', label: 'Deleted' },
  complete: { icon: 'CheckCircle', color: 'green', label: 'Completed' },
  approve: { icon: 'ThumbsUp', color: 'green', label: 'Approved' },
  reject: { icon: 'ThumbsDown', color: 'red', label: 'Rejected' },
  assign: { icon: 'UserPlus', color: 'purple', label: 'Assigned' },
  comment: { icon: 'MessageSquare', color: 'blue', label: 'Commented' },
  upload: { icon: 'Upload', color: 'cyan', label: 'Uploaded' },
  download: { icon: 'Download', color: 'gray', label: 'Downloaded' },
  share: { icon: 'Share2', color: 'indigo', label: 'Shared' },
  login: { icon: 'LogIn', color: 'gray', label: 'Logged in' },
  payment: { icon: 'DollarSign', color: 'green', label: 'Payment' },
  transfer: { icon: 'ArrowRightLeft', color: 'amber', label: 'Transfer' },
  milestone: { icon: 'Flag', color: 'purple', label: 'Milestone' },
  alert: { icon: 'AlertTriangle', color: 'amber', label: 'Alert' },
  system: { icon: 'Settings', color: 'gray', label: 'System' },
};

class ActivityFeedService {
  private activities: Activity[] = [];
  private listeners: ((activities: Activity[]) => void)[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadMockActivities();
  }

  private loadMockActivities(): void {
    const now = Date.now();
    const users = [
      { id: 'user_1', name: 'Sarah Johnson', avatar: undefined },
      { id: 'user_2', name: 'Michael Chen', avatar: undefined },
      { id: 'user_3', name: 'Emily Davis', avatar: undefined },
      { id: 'user_4', name: 'James Wilson', avatar: undefined },
      { id: 'user_5', name: 'System', avatar: undefined },
    ];

    this.activities = [
      {
        id: 'act_1',
        type: 'complete',
        module: 'tasks',
        action: 'task.complete',
        title: 'Task Completed',
        description: 'Completed quarterly financial review',
        userId: users[0].id,
        userName: users[0].name,
        entityId: 'task_123',
        entityType: 'task',
        entityName: 'Q4 Financial Review',
        timestamp: now - 300000,
        isRead: false,
        importance: 'medium',
      },
      {
        id: 'act_2',
        type: 'payment',
        module: 'transactions',
        action: 'payment.received',
        title: 'Payment Received',
        description: 'Grant payment of $25,000 received from Foundation XYZ',
        userId: users[4].id,
        userName: users[4].name,
        entityId: 'txn_456',
        entityType: 'transaction',
        entityName: 'Grant Payment',
        metadata: { amount: 25000, currency: 'USD' },
        timestamp: now - 900000,
        isRead: false,
        importance: 'high',
      },
      {
        id: 'act_3',
        type: 'upload',
        module: 'documents',
        action: 'document.upload',
        title: 'Document Uploaded',
        description: 'Uploaded signed contract for Project Alpha',
        userId: users[1].id,
        userName: users[1].name,
        entityId: 'doc_789',
        entityType: 'document',
        entityName: 'Project Alpha Contract.pdf',
        timestamp: now - 1800000,
        isRead: true,
        importance: 'medium',
      },
      {
        id: 'act_4',
        type: 'approve',
        module: 'employees',
        action: 'leave.approve',
        title: 'Leave Approved',
        description: 'Approved vacation request for Emily Davis',
        userId: users[3].id,
        userName: users[3].name,
        entityId: 'leave_101',
        entityType: 'leave_request',
        entityName: 'Vacation Request',
        mentions: [users[2].id],
        timestamp: now - 3600000,
        isRead: true,
        importance: 'low',
      },
      {
        id: 'act_5',
        type: 'create',
        module: 'entities',
        action: 'entity.create',
        title: 'Entity Created',
        description: 'Created new business entity: LuvOnPurpose Foundation',
        userId: users[0].id,
        userName: users[0].name,
        entityId: 'entity_202',
        entityType: 'entity',
        entityName: 'LuvOnPurpose Foundation',
        timestamp: now - 7200000,
        isRead: true,
        importance: 'high',
      },
      {
        id: 'act_6',
        type: 'milestone',
        module: 'training',
        action: 'course.complete',
        title: 'Training Milestone',
        description: 'Michael Chen completed Financial Literacy certification',
        userId: users[1].id,
        userName: users[1].name,
        entityId: 'cert_303',
        entityType: 'certification',
        entityName: 'Financial Literacy',
        timestamp: now - 14400000,
        isRead: true,
        importance: 'medium',
      },
      {
        id: 'act_7',
        type: 'transfer',
        module: 'tokens',
        action: 'token.transfer',
        title: 'Token Transfer',
        description: 'Transferred 100 SPARK tokens to House Alpha',
        userId: users[0].id,
        userName: users[0].name,
        entityId: 'transfer_404',
        entityType: 'token_transfer',
        entityName: 'SPARK Transfer',
        metadata: { amount: 100, tokenType: 'SPARK' },
        timestamp: now - 28800000,
        isRead: true,
        importance: 'medium',
      },
      {
        id: 'act_8',
        type: 'alert',
        module: 'system',
        action: 'system.alert',
        title: 'System Alert',
        description: 'Scheduled maintenance completed successfully',
        userId: users[4].id,
        userName: users[4].name,
        timestamp: now - 43200000,
        isRead: true,
        importance: 'low',
      },
      {
        id: 'act_9',
        type: 'assign',
        module: 'tasks',
        action: 'task.assign',
        title: 'Task Assigned',
        description: 'Assigned grant proposal review to Emily Davis',
        userId: users[3].id,
        userName: users[3].name,
        entityId: 'task_505',
        entityType: 'task',
        entityName: 'Grant Proposal Review',
        mentions: [users[2].id],
        timestamp: now - 57600000,
        isRead: true,
        importance: 'medium',
      },
      {
        id: 'act_10',
        type: 'comment',
        module: 'documents',
        action: 'document.comment',
        title: 'New Comment',
        description: 'Added comment on Budget Report 2026',
        userId: users[2].id,
        userName: users[2].name,
        entityId: 'doc_606',
        entityType: 'document',
        entityName: 'Budget Report 2026',
        timestamp: now - 72000000,
        isRead: true,
        importance: 'low',
      },
    ];
  }

  // Get activities with optional filtering
  getActivities(filter?: ActivityFilter): Activity[] {
    let result = [...this.activities];

    if (filter) {
      if (filter.modules && filter.modules.length > 0) {
        result = result.filter(a => filter.modules!.includes(a.module));
      }
      if (filter.types && filter.types.length > 0) {
        result = result.filter(a => filter.types!.includes(a.type));
      }
      if (filter.users && filter.users.length > 0) {
        result = result.filter(a => filter.users!.includes(a.userId));
      }
      if (filter.importance && filter.importance.length > 0) {
        result = result.filter(a => filter.importance!.includes(a.importance));
      }
      if (filter.dateFrom) {
        result = result.filter(a => a.timestamp >= filter.dateFrom!);
      }
      if (filter.dateTo) {
        result = result.filter(a => a.timestamp <= filter.dateTo!);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        result = result.filter(a => 
          a.title.toLowerCase().includes(search) ||
          a.description.toLowerCase().includes(search) ||
          a.userName.toLowerCase().includes(search) ||
          (a.entityName && a.entityName.toLowerCase().includes(search))
        );
      }
      if (filter.unreadOnly) {
        result = result.filter(a => !a.isRead);
      }
    }

    return result.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get activities grouped by date
  getGroupedActivities(filter?: ActivityFilter): ActivityGroup[] {
    const activities = this.getActivities(filter);
    const groups: Record<string, Activity[]> = {};

    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    return Object.entries(groups).map(([date, activities]) => ({
      date,
      activities,
    }));
  }

  // Get activity statistics
  getStats(): ActivityStats {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

    const todayActivities = this.activities.filter(a => a.timestamp >= todayStart);
    const weekActivities = this.activities.filter(a => a.timestamp >= weekStart);
    const unread = this.activities.filter(a => !a.isRead);

    const byModule: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const userCounts: Record<string, { name: string; count: number }> = {};

    this.activities.forEach(a => {
      byModule[a.module] = (byModule[a.module] || 0) + 1;
      byType[a.type] = (byType[a.type] || 0) + 1;
      if (!userCounts[a.userId]) {
        userCounts[a.userId] = { name: a.userName, count: 0 };
      }
      userCounts[a.userId].count++;
    });

    const mostActiveUsers = Object.entries(userCounts)
      .map(([userId, data]) => ({ userId, userName: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalToday: todayActivities.length,
      totalThisWeek: weekActivities.length,
      unreadCount: unread.length,
      byModule,
      byType,
      mostActiveUsers,
    };
  }

  // Mark activity as read
  markAsRead(activityId: string): void {
    const activity = this.activities.find(a => a.id === activityId);
    if (activity) {
      activity.isRead = true;
      this.notifyListeners();
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    this.activities.forEach(a => a.isRead = true);
    this.notifyListeners();
  }

  // Add new activity
  addActivity(activity: Omit<Activity, 'id' | 'timestamp' | 'isRead'>): Activity {
    const newActivity: Activity = {
      ...activity,
      id: `act_${Date.now()}`,
      timestamp: Date.now(),
      isRead: false,
    };
    this.activities.unshift(newActivity);
    this.notifyListeners();
    return newActivity;
  }

  // Subscribe to activity updates
  subscribe(callback: (activities: Activity[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.activities));
  }

  // Start polling for new activities
  startPolling(intervalMs: number = 30000): void {
    if (this.pollingInterval) return;
    
    this.pollingInterval = setInterval(() => {
      // Simulate new activity occasionally
      if (Math.random() > 0.7) {
        const types: ActivityType[] = ['create', 'update', 'complete', 'comment'];
        const modules = ['tasks', 'documents', 'transactions'];
        const users = [
          { id: 'user_1', name: 'Sarah Johnson' },
          { id: 'user_2', name: 'Michael Chen' },
        ];
        
        const type = types[Math.floor(Math.random() * types.length)];
        const module = modules[Math.floor(Math.random() * modules.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        
        this.addActivity({
          type,
          module,
          action: `${module}.${type}`,
          title: `${ACTIVITY_TYPE_CONFIG[type].label} in ${module}`,
          description: `New activity in ${module} module`,
          userId: user.id,
          userName: user.name,
          importance: 'medium',
        });
      }
    }, intervalMs);
  }

  // Stop polling
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Format relative time
  formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }
}

export const activityFeedService = new ActivityFeedService();
