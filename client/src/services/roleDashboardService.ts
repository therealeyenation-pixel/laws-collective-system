// Role-Based Dashboard Service
// Pre-configured dashboards for different user roles

export type UserRole = 'admin' | 'staff' | 'member' | 'guardian' | 'user';

export interface RoleDashboard {
  role: UserRole;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  quickActions: QuickAction[];
  notifications: NotificationPreference[];
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { row: number; col: number };
  config: Record<string, any>;
}

export type WidgetType = 
  | 'stats_card'
  | 'chart'
  | 'task_list'
  | 'calendar'
  | 'activity_feed'
  | 'quick_links'
  | 'notifications'
  | 'progress_tracker'
  | 'team_overview'
  | 'financial_summary'
  | 'document_recent'
  | 'compliance_status';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  path: string;
  color: string;
}

export interface NotificationPreference {
  type: string;
  email: boolean;
  inApp: boolean;
  push: boolean;
}

const ROLE_DASHBOARDS: Record<UserRole, RoleDashboard> = {
  admin: {
    role: 'admin',
    name: 'Administrator Dashboard',
    description: 'Full system overview with administrative controls',
    widgets: [
      { id: 'w1', type: 'stats_card', title: 'System Health', size: 'small', position: { row: 1, col: 1 }, config: { metric: 'system_health' } },
      { id: 'w2', type: 'stats_card', title: 'Active Users', size: 'small', position: { row: 1, col: 2 }, config: { metric: 'active_users' } },
      { id: 'w3', type: 'stats_card', title: 'Pending Tasks', size: 'small', position: { row: 1, col: 3 }, config: { metric: 'pending_tasks' } },
      { id: 'w4', type: 'stats_card', title: 'Revenue MTD', size: 'small', position: { row: 1, col: 4 }, config: { metric: 'revenue_mtd' } },
      { id: 'w5', type: 'chart', title: 'System Activity', size: 'large', position: { row: 2, col: 1 }, config: { chartType: 'line', dataSource: 'activity' } },
      { id: 'w6', type: 'compliance_status', title: 'Compliance Overview', size: 'medium', position: { row: 2, col: 3 }, config: {} },
      { id: 'w7', type: 'team_overview', title: 'Team Status', size: 'medium', position: { row: 3, col: 1 }, config: {} },
      { id: 'w8', type: 'activity_feed', title: 'Recent Activity', size: 'medium', position: { row: 3, col: 3 }, config: { limit: 10 } },
    ],
    quickActions: [
      { id: 'qa1', label: 'User Management', icon: 'Users', path: '/hr-management', color: 'blue' },
      { id: 'qa2', label: 'System Settings', icon: 'Settings', path: '/system-dashboard', color: 'gray' },
      { id: 'qa3', label: 'Audit Reports', icon: 'FileText', path: '/audit-reports', color: 'purple' },
      { id: 'qa4', label: 'Backup & Restore', icon: 'Database', path: '/backup-restore', color: 'green' },
    ],
    notifications: [
      { type: 'system_alerts', email: true, inApp: true, push: true },
      { type: 'user_signups', email: true, inApp: true, push: false },
      { type: 'security_events', email: true, inApp: true, push: true },
      { type: 'compliance_updates', email: true, inApp: true, push: false },
    ]
  },
  staff: {
    role: 'staff',
    name: 'Staff Dashboard',
    description: 'Operational view for staff members',
    widgets: [
      { id: 'w1', type: 'task_list', title: 'My Tasks', size: 'medium', position: { row: 1, col: 1 }, config: { filter: 'assigned_to_me' } },
      { id: 'w2', type: 'calendar', title: 'Schedule', size: 'medium', position: { row: 1, col: 3 }, config: { view: 'week' } },
      { id: 'w3', type: 'stats_card', title: 'Tasks Completed', size: 'small', position: { row: 2, col: 1 }, config: { metric: 'tasks_completed' } },
      { id: 'w4', type: 'stats_card', title: 'Pending Reviews', size: 'small', position: { row: 2, col: 2 }, config: { metric: 'pending_reviews' } },
      { id: 'w5', type: 'document_recent', title: 'Recent Documents', size: 'medium', position: { row: 3, col: 1 }, config: { limit: 5 } },
      { id: 'w6', type: 'quick_links', title: 'Quick Access', size: 'small', position: { row: 3, col: 3 }, config: {} },
    ],
    quickActions: [
      { id: 'qa1', label: 'New Task', icon: 'Plus', path: '/my-tasks', color: 'blue' },
      { id: 'qa2', label: 'Documents', icon: 'FileText', path: '/document-vault', color: 'green' },
      { id: 'qa3', label: 'Team Tasks', icon: 'Users', path: '/team-tasks', color: 'purple' },
      { id: 'qa4', label: 'Reports', icon: 'BarChart', path: '/reporting-center', color: 'orange' },
    ],
    notifications: [
      { type: 'task_assigned', email: true, inApp: true, push: true },
      { type: 'task_due', email: true, inApp: true, push: true },
      { type: 'document_shared', email: false, inApp: true, push: false },
      { type: 'team_updates', email: false, inApp: true, push: false },
    ]
  },
  member: {
    role: 'member',
    name: 'Member Dashboard',
    description: 'Personal dashboard for house members',
    widgets: [
      { id: 'w1', type: 'progress_tracker', title: 'My Progress', size: 'large', position: { row: 1, col: 1 }, config: {} },
      { id: 'w2', type: 'notifications', title: 'Notifications', size: 'medium', position: { row: 1, col: 3 }, config: { limit: 5 } },
      { id: 'w3', type: 'calendar', title: 'Upcoming Events', size: 'medium', position: { row: 2, col: 1 }, config: { view: 'month' } },
      { id: 'w4', type: 'quick_links', title: 'Resources', size: 'small', position: { row: 2, col: 3 }, config: {} },
      { id: 'w5', type: 'activity_feed', title: 'House Activity', size: 'full', position: { row: 3, col: 1 }, config: { limit: 10 } },
    ],
    quickActions: [
      { id: 'qa1', label: 'My Profile', icon: 'User', path: '/user-preferences', color: 'blue' },
      { id: 'qa2', label: 'Training', icon: 'GraduationCap', path: '/academy', color: 'green' },
      { id: 'qa3', label: 'Documents', icon: 'FileText', path: '/document-vault', color: 'purple' },
      { id: 'qa4', label: 'Support', icon: 'HelpCircle', path: '/getting-started', color: 'orange' },
    ],
    notifications: [
      { type: 'house_announcements', email: true, inApp: true, push: true },
      { type: 'event_reminders', email: true, inApp: true, push: true },
      { type: 'training_updates', email: false, inApp: true, push: false },
    ]
  },
  guardian: {
    role: 'guardian',
    name: 'Guardian Dashboard',
    description: 'Oversight dashboard for guardians',
    widgets: [
      { id: 'w1', type: 'team_overview', title: 'Dependents Overview', size: 'large', position: { row: 1, col: 1 }, config: {} },
      { id: 'w2', type: 'stats_card', title: 'Active Members', size: 'small', position: { row: 1, col: 3 }, config: { metric: 'active_members' } },
      { id: 'w3', type: 'stats_card', title: 'Pending Approvals', size: 'small', position: { row: 1, col: 4 }, config: { metric: 'pending_approvals' } },
      { id: 'w4', type: 'activity_feed', title: 'Member Activity', size: 'medium', position: { row: 2, col: 1 }, config: { limit: 10 } },
      { id: 'w5', type: 'financial_summary', title: 'Financial Overview', size: 'medium', position: { row: 2, col: 3 }, config: {} },
      { id: 'w6', type: 'document_recent', title: 'Recent Documents', size: 'full', position: { row: 3, col: 1 }, config: { limit: 5 } },
    ],
    quickActions: [
      { id: 'qa1', label: 'Approve Requests', icon: 'CheckCircle', path: '/delegation-approvals', color: 'green' },
      { id: 'qa2', label: 'View Members', icon: 'Users', path: '/guardian', color: 'blue' },
      { id: 'qa3', label: 'Financial Reports', icon: 'DollarSign', path: '/financial-automation', color: 'purple' },
      { id: 'qa4', label: 'Documents', icon: 'FileText', path: '/document-vault', color: 'orange' },
    ],
    notifications: [
      { type: 'approval_requests', email: true, inApp: true, push: true },
      { type: 'member_activity', email: false, inApp: true, push: false },
      { type: 'financial_alerts', email: true, inApp: true, push: true },
    ]
  },
  user: {
    role: 'user',
    name: 'User Dashboard',
    description: 'Basic dashboard for general users',
    widgets: [
      { id: 'w1', type: 'quick_links', title: 'Quick Access', size: 'medium', position: { row: 1, col: 1 }, config: {} },
      { id: 'w2', type: 'notifications', title: 'Notifications', size: 'medium', position: { row: 1, col: 3 }, config: { limit: 5 } },
      { id: 'w3', type: 'task_list', title: 'My Tasks', size: 'full', position: { row: 2, col: 1 }, config: { filter: 'assigned_to_me' } },
    ],
    quickActions: [
      { id: 'qa1', label: 'My Profile', icon: 'User', path: '/user-preferences', color: 'blue' },
      { id: 'qa2', label: 'Getting Started', icon: 'Rocket', path: '/getting-started', color: 'green' },
    ],
    notifications: [
      { type: 'general_updates', email: true, inApp: true, push: false },
    ]
  }
};

class RoleDashboardService {
  private readonly CUSTOMIZATIONS_KEY = 'role_dashboard_customizations';

  getDashboardForRole(role: UserRole): RoleDashboard {
    const baseDashboard = ROLE_DASHBOARDS[role] || ROLE_DASHBOARDS.user;
    const customizations = this.getCustomizations(role);
    
    if (customizations) {
      return {
        ...baseDashboard,
        widgets: customizations.widgets || baseDashboard.widgets,
        quickActions: customizations.quickActions || baseDashboard.quickActions,
        notifications: customizations.notifications || baseDashboard.notifications
      };
    }
    
    return baseDashboard;
  }

  getAllRoleDashboards(): RoleDashboard[] {
    return Object.values(ROLE_DASHBOARDS);
  }

  saveCustomizations(role: UserRole, customizations: Partial<RoleDashboard>): void {
    const allCustomizations = this.getAllCustomizations();
    allCustomizations[role] = customizations;
    localStorage.setItem(this.CUSTOMIZATIONS_KEY, JSON.stringify(allCustomizations));
  }

  resetToDefault(role: UserRole): RoleDashboard {
    const allCustomizations = this.getAllCustomizations();
    delete allCustomizations[role];
    localStorage.setItem(this.CUSTOMIZATIONS_KEY, JSON.stringify(allCustomizations));
    return ROLE_DASHBOARDS[role] || ROLE_DASHBOARDS.user;
  }

  getAvailableWidgetTypes(): { type: WidgetType; name: string; description: string }[] {
    return [
      { type: 'stats_card', name: 'Statistics Card', description: 'Display a single metric with trend' },
      { type: 'chart', name: 'Chart', description: 'Line, bar, or pie chart visualization' },
      { type: 'task_list', name: 'Task List', description: 'List of tasks with status' },
      { type: 'calendar', name: 'Calendar', description: 'Calendar view of events' },
      { type: 'activity_feed', name: 'Activity Feed', description: 'Recent activity stream' },
      { type: 'quick_links', name: 'Quick Links', description: 'Shortcuts to common pages' },
      { type: 'notifications', name: 'Notifications', description: 'Recent notifications' },
      { type: 'progress_tracker', name: 'Progress Tracker', description: 'Track progress towards goals' },
      { type: 'team_overview', name: 'Team Overview', description: 'Team member status' },
      { type: 'financial_summary', name: 'Financial Summary', description: 'Financial metrics overview' },
      { type: 'document_recent', name: 'Recent Documents', description: 'Recently accessed documents' },
      { type: 'compliance_status', name: 'Compliance Status', description: 'Compliance metrics' }
    ];
  }

  private getCustomizations(role: UserRole): Partial<RoleDashboard> | null {
    const all = this.getAllCustomizations();
    return all[role] || null;
  }

  private getAllCustomizations(): Record<string, Partial<RoleDashboard>> {
    const stored = localStorage.getItem(this.CUSTOMIZATIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  }
}

export const roleDashboardService = new RoleDashboardService();
