/**
 * Department Dashboards Service
 * Covers: Department-specific views, metrics, reports, team management
 */

// ============================================================================
// DEPARTMENT DEFINITIONS
// ============================================================================

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  entity: string;
  manager?: string;
  members: DepartmentMember[];
  budget: DepartmentBudget;
  metrics: DepartmentMetrics;
  goals: DepartmentGoal[];
  status: 'active' | 'inactive' | 'restructuring';
  createdAt: number;
}

export interface DepartmentMember {
  userId: string;
  name: string;
  role: string;
  title: string;
  joinedAt: number;
  isManager: boolean;
}

export interface DepartmentBudget {
  allocated: number;
  spent: number;
  remaining: number;
  fiscalYear: number;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
}

export interface DepartmentMetrics {
  productivity: number;
  efficiency: number;
  satisfaction: number;
  projectsCompleted: number;
  projectsInProgress: number;
  tasksCompleted: number;
  avgResponseTime: number;
  lastUpdated: number;
}

export interface DepartmentGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const departments: Department[] = [
  {
    id: 'DEPT-EXEC',
    name: 'Executive Office',
    code: 'EXEC',
    description: 'Strategic leadership and governance',
    entity: 'LuvOnPurpose AWS',
    members: [],
    budget: { allocated: 500000, spent: 125000, remaining: 375000, fiscalYear: 2026, categories: [
      { name: 'Salaries', allocated: 300000, spent: 75000 },
      { name: 'Operations', allocated: 100000, spent: 25000 },
      { name: 'Travel', allocated: 50000, spent: 15000 },
      { name: 'Professional Development', allocated: 50000, spent: 10000 }
    ]},
    metrics: { productivity: 92, efficiency: 88, satisfaction: 95, projectsCompleted: 12, projectsInProgress: 5, tasksCompleted: 156, avgResponseTime: 2.5, lastUpdated: Date.now() },
    goals: [
      { id: 'G1', title: 'Strategic Plan Completion', description: 'Complete 5-year strategic plan', targetValue: 100, currentValue: 75, unit: '%', deadline: Date.now() + 90 * 24 * 60 * 60 * 1000, status: 'on_track', priority: 'critical' }
    ],
    status: 'active',
    createdAt: Date.now()
  },
  {
    id: 'DEPT-FIN',
    name: 'Finance & Accounting',
    code: 'FIN',
    description: 'Financial management and reporting',
    entity: 'LuvOnPurpose AWS',
    members: [],
    budget: { allocated: 350000, spent: 87500, remaining: 262500, fiscalYear: 2026, categories: [
      { name: 'Salaries', allocated: 250000, spent: 62500 },
      { name: 'Software', allocated: 50000, spent: 15000 },
      { name: 'Audit', allocated: 30000, spent: 5000 },
      { name: 'Training', allocated: 20000, spent: 5000 }
    ]},
    metrics: { productivity: 95, efficiency: 92, satisfaction: 88, projectsCompleted: 8, projectsInProgress: 3, tasksCompleted: 234, avgResponseTime: 1.5, lastUpdated: Date.now() },
    goals: [
      { id: 'G1', title: 'Audit Completion', description: 'Complete annual audit', targetValue: 100, currentValue: 60, unit: '%', deadline: Date.now() + 60 * 24 * 60 * 60 * 1000, status: 'on_track', priority: 'high' }
    ],
    status: 'active',
    createdAt: Date.now()
  },
  {
    id: 'DEPT-HR',
    name: 'Human Resources',
    code: 'HR',
    description: 'People operations and development',
    entity: 'LuvOnPurpose AWS',
    members: [],
    budget: { allocated: 200000, spent: 50000, remaining: 150000, fiscalYear: 2026, categories: [
      { name: 'Salaries', allocated: 120000, spent: 30000 },
      { name: 'Recruitment', allocated: 40000, spent: 10000 },
      { name: 'Benefits Admin', allocated: 25000, spent: 5000 },
      { name: 'Training', allocated: 15000, spent: 5000 }
    ]},
    metrics: { productivity: 88, efficiency: 85, satisfaction: 90, projectsCompleted: 6, projectsInProgress: 4, tasksCompleted: 189, avgResponseTime: 3.0, lastUpdated: Date.now() },
    goals: [
      { id: 'G1', title: 'Hiring Target', description: 'Fill 10 open positions', targetValue: 10, currentValue: 4, unit: 'positions', deadline: Date.now() + 120 * 24 * 60 * 60 * 1000, status: 'at_risk', priority: 'high' }
    ],
    status: 'active',
    createdAt: Date.now()
  },
  {
    id: 'DEPT-OPS',
    name: 'Operations',
    code: 'OPS',
    description: 'Day-to-day business operations',
    entity: 'LuvOnPurpose AWS',
    members: [],
    budget: { allocated: 400000, spent: 100000, remaining: 300000, fiscalYear: 2026, categories: [
      { name: 'Salaries', allocated: 200000, spent: 50000 },
      { name: 'Facilities', allocated: 100000, spent: 25000 },
      { name: 'Equipment', allocated: 60000, spent: 15000 },
      { name: 'Supplies', allocated: 40000, spent: 10000 }
    ]},
    metrics: { productivity: 90, efficiency: 87, satisfaction: 85, projectsCompleted: 15, projectsInProgress: 8, tasksCompleted: 312, avgResponseTime: 2.0, lastUpdated: Date.now() },
    goals: [
      { id: 'G1', title: 'Process Efficiency', description: 'Improve process efficiency by 15%', targetValue: 15, currentValue: 8, unit: '%', deadline: Date.now() + 180 * 24 * 60 * 60 * 1000, status: 'on_track', priority: 'medium' }
    ],
    status: 'active',
    createdAt: Date.now()
  },
  {
    id: 'DEPT-TECH',
    name: 'Technology',
    code: 'TECH',
    description: 'IT infrastructure and development',
    entity: 'LuvOnPurpose AWS',
    members: [],
    budget: { allocated: 600000, spent: 150000, remaining: 450000, fiscalYear: 2026, categories: [
      { name: 'Salaries', allocated: 350000, spent: 87500 },
      { name: 'Infrastructure', allocated: 150000, spent: 37500 },
      { name: 'Software Licenses', allocated: 60000, spent: 15000 },
      { name: 'Security', allocated: 40000, spent: 10000 }
    ]},
    metrics: { productivity: 93, efficiency: 91, satisfaction: 92, projectsCompleted: 20, projectsInProgress: 12, tasksCompleted: 456, avgResponseTime: 1.0, lastUpdated: Date.now() },
    goals: [
      { id: 'G1', title: 'System Uptime', description: 'Maintain 99.9% uptime', targetValue: 99.9, currentValue: 99.7, unit: '%', deadline: Date.now() + 365 * 24 * 60 * 60 * 1000, status: 'on_track', priority: 'critical' }
    ],
    status: 'active',
    createdAt: Date.now()
  },
  {
    id: 'DEPT-MKT',
    name: 'Marketing',
    code: 'MKT',
    description: 'Brand and marketing initiatives',
    entity: 'Real-Eye-Nation LLC',
    members: [],
    budget: { allocated: 300000, spent: 75000, remaining: 225000, fiscalYear: 2026, categories: [
      { name: 'Salaries', allocated: 150000, spent: 37500 },
      { name: 'Advertising', allocated: 80000, spent: 20000 },
      { name: 'Content', allocated: 50000, spent: 12500 },
      { name: 'Events', allocated: 20000, spent: 5000 }
    ]},
    metrics: { productivity: 85, efficiency: 82, satisfaction: 88, projectsCompleted: 10, projectsInProgress: 6, tasksCompleted: 178, avgResponseTime: 4.0, lastUpdated: Date.now() },
    goals: [
      { id: 'G1', title: 'Brand Awareness', description: 'Increase brand awareness by 25%', targetValue: 25, currentValue: 12, unit: '%', deadline: Date.now() + 180 * 24 * 60 * 60 * 1000, status: 'on_track', priority: 'high' }
    ],
    status: 'active',
    createdAt: Date.now()
  },
  {
    id: 'DEPT-EDU',
    name: 'Education & Training',
    code: 'EDU',
    description: 'Academy and curriculum development',
    entity: '508-LuvOnPurpose Academy',
    members: [],
    budget: { allocated: 450000, spent: 112500, remaining: 337500, fiscalYear: 2026, categories: [
      { name: 'Salaries', allocated: 250000, spent: 62500 },
      { name: 'Curriculum', allocated: 100000, spent: 25000 },
      { name: 'Materials', allocated: 60000, spent: 15000 },
      { name: 'Technology', allocated: 40000, spent: 10000 }
    ]},
    metrics: { productivity: 91, efficiency: 89, satisfaction: 94, projectsCompleted: 14, projectsInProgress: 7, tasksCompleted: 267, avgResponseTime: 2.5, lastUpdated: Date.now() },
    goals: [
      { id: 'G1', title: 'Student Enrollment', description: 'Enroll 500 students', targetValue: 500, currentValue: 320, unit: 'students', deadline: Date.now() + 180 * 24 * 60 * 60 * 1000, status: 'on_track', priority: 'high' }
    ],
    status: 'active',
    createdAt: Date.now()
  },
  {
    id: 'DEPT-COMM',
    name: 'Community Outreach',
    code: 'COMM',
    description: 'Community engagement and programs',
    entity: 'L.A.W.S. Collective',
    members: [],
    budget: { allocated: 250000, spent: 62500, remaining: 187500, fiscalYear: 2026, categories: [
      { name: 'Salaries', allocated: 120000, spent: 30000 },
      { name: 'Programs', allocated: 80000, spent: 20000 },
      { name: 'Events', allocated: 30000, spent: 7500 },
      { name: 'Partnerships', allocated: 20000, spent: 5000 }
    ]},
    metrics: { productivity: 87, efficiency: 84, satisfaction: 96, projectsCompleted: 18, projectsInProgress: 9, tasksCompleted: 234, avgResponseTime: 3.5, lastUpdated: Date.now() },
    goals: [
      { id: 'G1', title: 'Community Members', description: 'Grow community to 1000 members', targetValue: 1000, currentValue: 650, unit: 'members', deadline: Date.now() + 180 * 24 * 60 * 60 * 1000, status: 'on_track', priority: 'high' }
    ],
    status: 'active',
    createdAt: Date.now()
  }
];

// ============================================================================
// DEPARTMENT MANAGEMENT
// ============================================================================

export function getDepartments(entity?: string): Department[] {
  if (entity) {
    return departments.filter(d => d.entity === entity);
  }
  return departments;
}

export function getDepartment(departmentId: string): Department | undefined {
  return departments.find(d => d.id === departmentId);
}

export function getDepartmentByCode(code: string): Department | undefined {
  return departments.find(d => d.code === code);
}

export function addDepartmentMember(
  departmentId: string,
  userId: string,
  name: string,
  role: string,
  title: string,
  isManager: boolean = false
): DepartmentMember | null {
  const department = departments.find(d => d.id === departmentId);
  if (!department) return null;
  if (department.members.some(m => m.userId === userId)) return null;

  const member: DepartmentMember = {
    userId,
    name,
    role,
    title,
    joinedAt: Date.now(),
    isManager
  };
  department.members.push(member);

  if (isManager) {
    department.manager = userId;
  }

  return member;
}

export function removeDepartmentMember(departmentId: string, userId: string): boolean {
  const department = departments.find(d => d.id === departmentId);
  if (!department) return false;

  const index = department.members.findIndex(m => m.userId === userId);
  if (index === -1) return false;

  department.members.splice(index, 1);
  if (department.manager === userId) {
    department.manager = undefined;
  }
  return true;
}

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'progress' | 'calendar';
  title: string;
  data: any;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { row: number; col: number };
}

export interface DashboardLayout {
  departmentId: string;
  userId: string;
  widgets: DashboardWidget[];
  lastModified: number;
}

const dashboardLayouts: DashboardLayout[] = [];

export function getDepartmentDashboard(departmentId: string): DashboardWidget[] {
  const department = departments.find(d => d.id === departmentId);
  if (!department) return [];

  return [
    {
      id: 'W-METRICS',
      type: 'metric',
      title: 'Key Metrics',
      data: {
        productivity: department.metrics.productivity,
        efficiency: department.metrics.efficiency,
        satisfaction: department.metrics.satisfaction
      },
      size: 'medium',
      position: { row: 0, col: 0 }
    },
    {
      id: 'W-BUDGET',
      type: 'progress',
      title: 'Budget Status',
      data: {
        allocated: department.budget.allocated,
        spent: department.budget.spent,
        remaining: department.budget.remaining,
        percentUsed: Math.round((department.budget.spent / department.budget.allocated) * 100)
      },
      size: 'medium',
      position: { row: 0, col: 1 }
    },
    {
      id: 'W-PROJECTS',
      type: 'chart',
      title: 'Project Status',
      data: {
        completed: department.metrics.projectsCompleted,
        inProgress: department.metrics.projectsInProgress
      },
      size: 'small',
      position: { row: 1, col: 0 }
    },
    {
      id: 'W-GOALS',
      type: 'list',
      title: 'Department Goals',
      data: department.goals.map(g => ({
        title: g.title,
        progress: Math.round((g.currentValue / g.targetValue) * 100),
        status: g.status
      })),
      size: 'large',
      position: { row: 1, col: 1 }
    },
    {
      id: 'W-TEAM',
      type: 'table',
      title: 'Team Members',
      data: department.members.map(m => ({
        name: m.name,
        role: m.role,
        title: m.title
      })),
      size: 'medium',
      position: { row: 2, col: 0 }
    },
    {
      id: 'W-BUDGET-BREAKDOWN',
      type: 'chart',
      title: 'Budget Breakdown',
      data: department.budget.categories.map(c => ({
        category: c.name,
        allocated: c.allocated,
        spent: c.spent
      })),
      size: 'medium',
      position: { row: 2, col: 1 }
    }
  ];
}

export function saveDashboardLayout(
  departmentId: string,
  userId: string,
  widgets: DashboardWidget[]
): DashboardLayout {
  const existing = dashboardLayouts.find(
    l => l.departmentId === departmentId && l.userId === userId
  );

  if (existing) {
    existing.widgets = widgets;
    existing.lastModified = Date.now();
    return existing;
  }

  const layout: DashboardLayout = {
    departmentId,
    userId,
    widgets,
    lastModified: Date.now()
  };
  dashboardLayouts.push(layout);
  return layout;
}

// ============================================================================
// REPORTS
// ============================================================================

export interface DepartmentReport {
  id: string;
  departmentId: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  title: string;
  period: { start: number; end: number };
  sections: ReportSection[];
  generatedAt: number;
  generatedBy: string;
}

export interface ReportSection {
  title: string;
  type: 'summary' | 'metrics' | 'budget' | 'goals' | 'projects' | 'issues';
  content: any;
}

const reports: DepartmentReport[] = [];

export function generateDepartmentReport(
  departmentId: string,
  type: DepartmentReport['type'],
  generatedBy: string
): DepartmentReport | null {
  const department = departments.find(d => d.id === departmentId);
  if (!department) return null;

  const now = Date.now();
  const periodDays = type === 'weekly' ? 7 : type === 'monthly' ? 30 : type === 'quarterly' ? 90 : 365;
  const periodStart = now - periodDays * 24 * 60 * 60 * 1000;

  const report: DepartmentReport = {
    id: `RPT-${Date.now().toString(36)}`,
    departmentId,
    type,
    title: `${department.name} ${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
    period: { start: periodStart, end: now },
    sections: [
      {
        title: 'Executive Summary',
        type: 'summary',
        content: {
          department: department.name,
          period: `${new Date(periodStart).toLocaleDateString()} - ${new Date(now).toLocaleDateString()}`,
          highlights: [
            `Completed ${department.metrics.projectsCompleted} projects`,
            `${department.metrics.projectsInProgress} projects in progress`,
            `Team satisfaction: ${department.metrics.satisfaction}%`
          ]
        }
      },
      {
        title: 'Performance Metrics',
        type: 'metrics',
        content: department.metrics
      },
      {
        title: 'Budget Overview',
        type: 'budget',
        content: {
          allocated: department.budget.allocated,
          spent: department.budget.spent,
          remaining: department.budget.remaining,
          utilizationRate: Math.round((department.budget.spent / department.budget.allocated) * 100),
          categories: department.budget.categories
        }
      },
      {
        title: 'Goal Progress',
        type: 'goals',
        content: department.goals.map(g => ({
          title: g.title,
          target: g.targetValue,
          current: g.currentValue,
          progress: Math.round((g.currentValue / g.targetValue) * 100),
          status: g.status
        }))
      }
    ],
    generatedAt: now,
    generatedBy
  };

  reports.push(report);
  return report;
}

export function getDepartmentReports(departmentId: string): DepartmentReport[] {
  return reports.filter(r => r.departmentId === departmentId);
}

// ============================================================================
// GOAL MANAGEMENT
// ============================================================================

export function addDepartmentGoal(
  departmentId: string,
  title: string,
  description: string,
  targetValue: number,
  unit: string,
  deadline: number,
  priority: DepartmentGoal['priority']
): DepartmentGoal | null {
  const department = departments.find(d => d.id === departmentId);
  if (!department) return null;

  const goal: DepartmentGoal = {
    id: `GOAL-${Date.now().toString(36)}`,
    title,
    description,
    targetValue,
    currentValue: 0,
    unit,
    deadline,
    status: 'on_track',
    priority
  };
  department.goals.push(goal);
  return goal;
}

export function updateGoalProgress(
  departmentId: string,
  goalId: string,
  currentValue: number
): boolean {
  const department = departments.find(d => d.id === departmentId);
  if (!department) return false;

  const goal = department.goals.find(g => g.id === goalId);
  if (!goal) return false;

  goal.currentValue = currentValue;
  
  // Update status based on progress and deadline
  const progress = currentValue / goal.targetValue;
  const timeRemaining = goal.deadline - Date.now();
  const totalTime = goal.deadline - (Date.now() - 30 * 24 * 60 * 60 * 1000); // Assume 30 day goals
  const timeProgress = 1 - (timeRemaining / totalTime);

  if (progress >= 1) {
    goal.status = 'completed';
  } else if (progress >= timeProgress) {
    goal.status = 'on_track';
  } else if (progress >= timeProgress * 0.7) {
    goal.status = 'at_risk';
  } else {
    goal.status = 'behind';
  }

  return true;
}

// ============================================================================
// BUDGET MANAGEMENT
// ============================================================================

export function recordExpense(
  departmentId: string,
  category: string,
  amount: number
): boolean {
  const department = departments.find(d => d.id === departmentId);
  if (!department) return false;

  const budgetCategory = department.budget.categories.find(c => c.name === category);
  if (!budgetCategory) return false;

  budgetCategory.spent += amount;
  department.budget.spent += amount;
  department.budget.remaining = department.budget.allocated - department.budget.spent;
  return true;
}

export function adjustBudget(
  departmentId: string,
  category: string,
  newAllocation: number
): boolean {
  const department = departments.find(d => d.id === departmentId);
  if (!department) return false;

  const budgetCategory = department.budget.categories.find(c => c.name === category);
  if (!budgetCategory) return false;

  const difference = newAllocation - budgetCategory.allocated;
  budgetCategory.allocated = newAllocation;
  department.budget.allocated += difference;
  department.budget.remaining = department.budget.allocated - department.budget.spent;
  return true;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const departmentDashboardsService = {
  // Departments
  getDepartments,
  getDepartment,
  getDepartmentByCode,
  addDepartmentMember,
  removeDepartmentMember,
  // Dashboard
  getDepartmentDashboard,
  saveDashboardLayout,
  // Reports
  generateDepartmentReport,
  getDepartmentReports,
  // Goals
  addDepartmentGoal,
  updateGoalProgress,
  // Budget
  recordExpense,
  adjustBudget
};

export default departmentDashboardsService;
