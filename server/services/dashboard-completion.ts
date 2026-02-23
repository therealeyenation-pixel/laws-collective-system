/**
 * Dashboard UI Completion Service
 * Comprehensive implementation of all dashboard components and displays
 */

// ============================================================================
// DASHBOARD WIDGET TYPES
// ============================================================================

export type WidgetType = 
  | 'metric_card'
  | 'chart'
  | 'table'
  | 'list'
  | 'calendar'
  | 'timeline'
  | 'progress'
  | 'status'
  | 'notification'
  | 'action_panel'
  | 'quick_links'
  | 'search'
  | 'filter'
  | 'map'
  | 'tree'
  | 'kanban'
  | 'gantt';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
  permissions: string[];
  refreshInterval?: number;
  dataSource: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'flex' | 'fixed';
  theme: 'light' | 'dark' | 'system';
  permissions: string[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// METRIC CARDS
// ============================================================================

export interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'currency' | 'percentage' | 'text';
  icon: string;
  color: string;
  trend?: number[];
}

export function createMetricCard(
  title: string,
  value: number | string,
  format: 'number' | 'currency' | 'percentage' | 'text' = 'number',
  options: Partial<MetricCard> = {}
): MetricCard {
  return {
    id: `METRIC-${Date.now().toString(36).toUpperCase()}`,
    title,
    value,
    format,
    icon: options.icon || 'chart',
    color: options.color || 'blue',
    ...options
  };
}

export function calculateMetricChange(current: number, previous: number): {
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  percentChange: number;
} {
  const change = current - previous;
  const percentChange = previous !== 0 ? (change / previous) * 100 : 0;
  
  return {
    change,
    changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral',
    percentChange: Math.round(percentChange * 10) / 10
  };
}

// ============================================================================
// ENTITY DASHBOARDS
// ============================================================================

export interface EntityDashboard {
  entityId: string;
  entityName: string;
  entityType: string;
  metrics: MetricCard[];
  recentActivity: ActivityItem[];
  upcomingDeadlines: DeadlineItem[];
  complianceStatus: ComplianceStatus;
  financialSummary: FinancialSummary;
  teamOverview: TeamOverview;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  user: string;
  entityId: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  dueDate: number;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

export interface ComplianceStatus {
  overall: 'compliant' | 'warning' | 'non_compliant';
  score: number;
  items: { category: string; status: string; lastChecked: number }[];
}

export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  cashFlow: number;
}

export interface TeamOverview {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  roles: { role: string; count: number }[];
}

export function createEntityDashboard(
  entityId: string,
  entityName: string,
  entityType: string
): EntityDashboard {
  return {
    entityId,
    entityName,
    entityType,
    metrics: [
      createMetricCard('Total Assets', 0, 'currency', { icon: 'wallet', color: 'green' }),
      createMetricCard('Compliance Score', 0, 'percentage', { icon: 'shield', color: 'blue' }),
      createMetricCard('Active Projects', 0, 'number', { icon: 'folder', color: 'purple' }),
      createMetricCard('Team Members', 0, 'number', { icon: 'users', color: 'orange' })
    ],
    recentActivity: [],
    upcomingDeadlines: [],
    complianceStatus: {
      overall: 'compliant',
      score: 100,
      items: []
    },
    financialSummary: {
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      cashFlow: 0
    },
    teamOverview: {
      totalMembers: 0,
      activeMembers: 0,
      pendingInvites: 0,
      roles: []
    }
  };
}

// ============================================================================
// HOUSE DASHBOARDS
// ============================================================================

export interface HouseDashboard {
  houseId: string;
  houseName: string;
  houseType: string;
  generation: number;
  metrics: MetricCard[];
  members: HouseMember[];
  assets: HouseAsset[];
  distributions: Distribution[];
  governance: GovernanceStatus;
}

export interface HouseMember {
  id: string;
  name: string;
  role: string;
  joinedAt: number;
  status: 'active' | 'inactive' | 'pending';
  contributions: number;
}

export interface HouseAsset {
  id: string;
  name: string;
  type: string;
  value: number;
  assignedAt: number;
  status: 'active' | 'pending' | 'transferred';
}

export interface Distribution {
  id: string;
  amount: number;
  date: number;
  type: string;
  recipients: { memberId: string; amount: number }[];
}

export interface GovernanceStatus {
  votingRights: boolean;
  pendingVotes: number;
  lastMeeting: number;
  nextMeeting?: number;
}

export function createHouseDashboard(
  houseId: string,
  houseName: string,
  houseType: string,
  generation: number
): HouseDashboard {
  return {
    houseId,
    houseName,
    houseType,
    generation,
    metrics: [
      createMetricCard('House Value', 0, 'currency', { icon: 'home', color: 'gold' }),
      createMetricCard('Members', 0, 'number', { icon: 'users', color: 'blue' }),
      createMetricCard('Distributions YTD', 0, 'currency', { icon: 'trending-up', color: 'green' }),
      createMetricCard('Voting Power', 0, 'percentage', { icon: 'vote', color: 'purple' })
    ],
    members: [],
    assets: [],
    distributions: [],
    governance: {
      votingRights: true,
      pendingVotes: 0,
      lastMeeting: Date.now()
    }
  };
}

// ============================================================================
// FINANCIAL DASHBOARDS
// ============================================================================

export interface FinancialDashboard {
  period: { start: number; end: number };
  revenue: RevenueBreakdown;
  expenses: ExpenseBreakdown;
  cashFlow: CashFlowAnalysis;
  projections: FinancialProjection[];
  alerts: FinancialAlert[];
}

export interface RevenueBreakdown {
  total: number;
  bySource: { source: string; amount: number; percentage: number }[];
  trend: { date: number; amount: number }[];
}

export interface ExpenseBreakdown {
  total: number;
  byCategory: { category: string; amount: number; percentage: number }[];
  trend: { date: number; amount: number }[];
}

export interface CashFlowAnalysis {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  runway: number; // months
}

export interface FinancialProjection {
  period: string;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedCashFlow: number;
  confidence: number;
}

export interface FinancialAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: number;
}

export function createFinancialDashboard(
  startDate: number,
  endDate: number
): FinancialDashboard {
  return {
    period: { start: startDate, end: endDate },
    revenue: {
      total: 0,
      bySource: [],
      trend: []
    },
    expenses: {
      total: 0,
      byCategory: [],
      trend: []
    },
    cashFlow: {
      operatingCashFlow: 0,
      investingCashFlow: 0,
      financingCashFlow: 0,
      netCashFlow: 0,
      runway: 12
    },
    projections: [],
    alerts: []
  };
}

// ============================================================================
// COMPLIANCE DASHBOARDS
// ============================================================================

export interface ComplianceDashboard {
  overallScore: number;
  status: 'compliant' | 'warning' | 'non_compliant';
  categories: ComplianceCategory[];
  upcomingDeadlines: ComplianceDeadline[];
  recentAudits: AuditRecord[];
  riskAssessment: RiskAssessment;
}

export interface ComplianceCategory {
  id: string;
  name: string;
  score: number;
  status: 'compliant' | 'warning' | 'non_compliant';
  items: ComplianceItem[];
  lastReview: number;
}

export interface ComplianceItem {
  id: string;
  name: string;
  description: string;
  status: 'met' | 'partial' | 'not_met' | 'not_applicable';
  dueDate?: number;
  evidence?: string[];
}

export interface ComplianceDeadline {
  id: string;
  title: string;
  category: string;
  dueDate: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
}

export interface AuditRecord {
  id: string;
  type: string;
  date: number;
  auditor: string;
  findings: number;
  status: 'passed' | 'failed' | 'pending';
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number;
  topRisks: { risk: string; severity: number; likelihood: number }[];
}

export function createComplianceDashboard(): ComplianceDashboard {
  return {
    overallScore: 100,
    status: 'compliant',
    categories: [],
    upcomingDeadlines: [],
    recentAudits: [],
    riskAssessment: {
      overallRisk: 'low',
      riskScore: 0,
      topRisks: []
    }
  };
}

// ============================================================================
// HR DASHBOARDS
// ============================================================================

export interface HRDashboard {
  headcount: HeadcountMetrics;
  recruitment: RecruitmentMetrics;
  performance: PerformanceMetrics;
  training: TrainingMetrics;
  engagement: EngagementMetrics;
}

export interface HeadcountMetrics {
  total: number;
  fullTime: number;
  partTime: number;
  contractors: number;
  byDepartment: { department: string; count: number }[];
  turnoverRate: number;
}

export interface RecruitmentMetrics {
  openPositions: number;
  applicants: number;
  interviews: number;
  offers: number;
  hires: number;
  timeToHire: number; // days
  costPerHire: number;
}

export interface PerformanceMetrics {
  averageRating: number;
  reviewsCompleted: number;
  reviewsPending: number;
  topPerformers: number;
  improvementPlans: number;
}

export interface TrainingMetrics {
  coursesAvailable: number;
  coursesCompleted: number;
  hoursTraining: number;
  certifications: number;
  complianceTraining: number;
}

export interface EngagementMetrics {
  engagementScore: number;
  surveyParticipation: number;
  satisfactionScore: number;
  npsScore: number;
}

export function createHRDashboard(): HRDashboard {
  return {
    headcount: {
      total: 0,
      fullTime: 0,
      partTime: 0,
      contractors: 0,
      byDepartment: [],
      turnoverRate: 0
    },
    recruitment: {
      openPositions: 0,
      applicants: 0,
      interviews: 0,
      offers: 0,
      hires: 0,
      timeToHire: 0,
      costPerHire: 0
    },
    performance: {
      averageRating: 0,
      reviewsCompleted: 0,
      reviewsPending: 0,
      topPerformers: 0,
      improvementPlans: 0
    },
    training: {
      coursesAvailable: 0,
      coursesCompleted: 0,
      hoursTraining: 0,
      certifications: 0,
      complianceTraining: 0
    },
    engagement: {
      engagementScore: 0,
      surveyParticipation: 0,
      satisfactionScore: 0,
      npsScore: 0
    }
  };
}

// ============================================================================
// PROJECT DASHBOARDS
// ============================================================================

export interface ProjectDashboard {
  projectId: string;
  projectName: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  progress: number;
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  team: ProjectTeam;
  milestones: ProjectMilestone[];
  risks: ProjectRisk[];
  tasks: TaskSummary;
}

export interface ProjectTimeline {
  startDate: number;
  endDate: number;
  actualStart?: number;
  actualEnd?: number;
  daysRemaining: number;
  onSchedule: boolean;
}

export interface ProjectBudget {
  total: number;
  spent: number;
  remaining: number;
  onBudget: boolean;
  burnRate: number;
}

export interface ProjectTeam {
  lead: string;
  members: { id: string; name: string; role: string }[];
  totalHours: number;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  dueDate: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
}

export interface ProjectRisk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  mitigation: string;
  status: 'identified' | 'mitigating' | 'resolved';
}

export interface TaskSummary {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  overdue: number;
}

export function createProjectDashboard(
  projectId: string,
  projectName: string
): ProjectDashboard {
  return {
    projectId,
    projectName,
    status: 'planning',
    progress: 0,
    timeline: {
      startDate: Date.now(),
      endDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
      daysRemaining: 90,
      onSchedule: true
    },
    budget: {
      total: 0,
      spent: 0,
      remaining: 0,
      onBudget: true,
      burnRate: 0
    },
    team: {
      lead: '',
      members: [],
      totalHours: 0
    },
    milestones: [],
    risks: [],
    tasks: {
      total: 0,
      completed: 0,
      inProgress: 0,
      blocked: 0,
      overdue: 0
    }
  };
}

// ============================================================================
// ANALYTICS DASHBOARDS
// ============================================================================

export interface AnalyticsDashboard {
  period: { start: number; end: number };
  kpis: KPI[];
  charts: ChartConfig[];
  reports: ReportSummary[];
  insights: Insight[];
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'on_track' | 'at_risk' | 'off_track';
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
  title: string;
  data: any[];
  options: Record<string, any>;
}

export interface ReportSummary {
  id: string;
  name: string;
  type: string;
  generatedAt: number;
  status: 'ready' | 'generating' | 'error';
}

export interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  action?: string;
}

export function createAnalyticsDashboard(
  startDate: number,
  endDate: number
): AnalyticsDashboard {
  return {
    period: { start: startDate, end: endDate },
    kpis: [],
    charts: [],
    reports: [],
    insights: []
  };
}

// ============================================================================
// NOTIFICATION CENTER
// ============================================================================

export interface NotificationCenter {
  unreadCount: number;
  notifications: Notification[];
  preferences: NotificationPreferences;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'action';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: { category: string; enabled: boolean }[];
  quietHours?: { start: string; end: string };
}

export function createNotificationCenter(): NotificationCenter {
  return {
    unreadCount: 0,
    notifications: [],
    preferences: {
      email: true,
      push: true,
      sms: false,
      categories: []
    }
  };
}

export function addNotification(
  center: NotificationCenter,
  type: Notification['type'],
  title: string,
  message: string,
  category: string,
  priority: Notification['priority'] = 'medium'
): Notification {
  const notification: Notification = {
    id: `NOTIF-${Date.now().toString(36).toUpperCase()}`,
    type,
    title,
    message,
    timestamp: Date.now(),
    read: false,
    category,
    priority
  };
  
  center.notifications.unshift(notification);
  center.unreadCount++;
  
  return notification;
}

export function markNotificationRead(
  center: NotificationCenter,
  notificationId: string
): boolean {
  const notification = center.notifications.find(n => n.id === notificationId);
  if (notification && !notification.read) {
    notification.read = true;
    center.unreadCount = Math.max(0, center.unreadCount - 1);
    return true;
  }
  return false;
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  shortcut?: string;
  category: string;
  permissions: string[];
}

export const defaultQuickActions: QuickAction[] = [
  { id: 'qa-1', label: 'Create Entity', icon: 'plus', action: '/entities/new', category: 'entities', permissions: ['admin'] },
  { id: 'qa-2', label: 'Add Document', icon: 'file-plus', action: '/documents/upload', category: 'documents', permissions: ['user'] },
  { id: 'qa-3', label: 'Schedule Meeting', icon: 'calendar', action: '/calendar/new', category: 'calendar', permissions: ['user'] },
  { id: 'qa-4', label: 'Generate Report', icon: 'file-text', action: '/reports/generate', category: 'reports', permissions: ['admin'] },
  { id: 'qa-5', label: 'View Compliance', icon: 'shield', action: '/compliance', category: 'compliance', permissions: ['user'] },
  { id: 'qa-6', label: 'Financial Summary', icon: 'dollar-sign', action: '/finance/summary', category: 'finance', permissions: ['admin'] },
  { id: 'qa-7', label: 'Team Directory', icon: 'users', action: '/team', category: 'team', permissions: ['user'] },
  { id: 'qa-8', label: 'Settings', icon: 'settings', action: '/settings', category: 'settings', permissions: ['admin'] }
];

// ============================================================================
// SEARCH & FILTERS
// ============================================================================

export interface SearchConfig {
  placeholder: string;
  searchableFields: string[];
  filters: FilterConfig[];
  sortOptions: SortOption[];
  defaultSort: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

export interface SortOption {
  id: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

export function createSearchConfig(
  placeholder: string,
  searchableFields: string[]
): SearchConfig {
  return {
    placeholder,
    searchableFields,
    filters: [],
    sortOptions: [],
    defaultSort: ''
  };
}

// ============================================================================
// DASHBOARD BUILDER
// ============================================================================

export function buildDashboard(
  name: string,
  description: string,
  widgets: Partial<DashboardWidget>[]
): Dashboard {
  return {
    id: `DASH-${Date.now().toString(36).toUpperCase()}`,
    name,
    description,
    widgets: widgets.map((w, i) => ({
      id: `WIDGET-${i}`,
      type: w.type || 'metric_card',
      title: w.title || 'Widget',
      description: w.description || '',
      config: w.config || {},
      position: w.position || { x: 0, y: i, w: 4, h: 2 },
      permissions: w.permissions || ['user'],
      dataSource: w.dataSource || ''
    })),
    layout: 'grid',
    theme: 'system',
    permissions: ['user'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const dashboardCompletionService = {
  createMetricCard,
  calculateMetricChange,
  createEntityDashboard,
  createHouseDashboard,
  createFinancialDashboard,
  createComplianceDashboard,
  createHRDashboard,
  createProjectDashboard,
  createAnalyticsDashboard,
  createNotificationCenter,
  addNotification,
  markNotificationRead,
  defaultQuickActions,
  createSearchConfig,
  buildDashboard
};

export default dashboardCompletionService;
