// Custom Dashboard Widgets Service
// Provides drag-and-drop widget management for personalized dashboards

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  maxSize: WidgetSize;
  configurable: boolean;
  defaultConfig?: Record<string, any>;
  category: WidgetCategory;
}

export interface WidgetInstance {
  id: string;
  widgetId: string;
  position: { x: number; y: number };
  size: WidgetSize;
  config: Record<string, any>;
  isVisible: boolean;
}

export interface WidgetSize {
  width: number; // grid units (1-4)
  height: number; // grid units (1-4)
}

export type WidgetType = 
  | 'quick_stats' | 'task_list' | 'activity_feed' | 'calendar'
  | 'financial_summary' | 'token_balance' | 'notifications'
  | 'team_status' | 'document_recent' | 'grant_tracker'
  | 'training_progress' | 'entity_overview' | 'chart_pie'
  | 'chart_line' | 'chart_bar' | 'weather' | 'clock' | 'notes';

export type WidgetCategory = 'overview' | 'finance' | 'productivity' | 'team' | 'analytics' | 'utility';

export interface DashboardLayout {
  id: string;
  name: string;
  userId: string;
  widgets: WidgetInstance[];
  gridColumns: number;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

// Available widgets catalog
export const WIDGET_CATALOG: Widget[] = [
  // Overview widgets
  {
    id: 'quick_stats',
    type: 'quick_stats',
    title: 'Quick Stats',
    description: 'Key metrics at a glance',
    icon: 'BarChart3',
    defaultSize: { width: 2, height: 1 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 4, height: 2 },
    configurable: true,
    defaultConfig: { metrics: ['tasks', 'documents', 'transactions'] },
    category: 'overview',
  },
  {
    id: 'activity_feed',
    type: 'activity_feed',
    title: 'Activity Feed',
    description: 'Recent activity stream',
    icon: 'Activity',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 2 },
    maxSize: { width: 4, height: 4 },
    configurable: true,
    defaultConfig: { limit: 10, showFilters: false },
    category: 'overview',
  },
  {
    id: 'notifications',
    type: 'notifications',
    title: 'Notifications',
    description: 'Unread notifications',
    icon: 'Bell',
    defaultSize: { width: 1, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 2, height: 3 },
    configurable: false,
    category: 'overview',
  },
  
  // Finance widgets
  {
    id: 'financial_summary',
    type: 'financial_summary',
    title: 'Financial Summary',
    description: 'Income, expenses, and balance',
    icon: 'DollarSign',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 3 },
    configurable: true,
    defaultConfig: { period: 'month', showChart: true },
    category: 'finance',
  },
  {
    id: 'token_balance',
    type: 'token_balance',
    title: 'Token Balance',
    description: 'Token holdings overview',
    icon: 'Coins',
    defaultSize: { width: 1, height: 1 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 2, height: 2 },
    configurable: true,
    defaultConfig: { tokens: ['MIRROR', 'GIFT', 'SPARK'] },
    category: 'finance',
  },
  {
    id: 'grant_tracker',
    type: 'grant_tracker',
    title: 'Grant Tracker',
    description: 'Active grants and deadlines',
    icon: 'Gift',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 3, height: 3 },
    configurable: true,
    defaultConfig: { showDeadlines: true, limit: 5 },
    category: 'finance',
  },
  
  // Productivity widgets
  {
    id: 'task_list',
    type: 'task_list',
    title: 'My Tasks',
    description: 'Upcoming and overdue tasks',
    icon: 'CheckSquare',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 2 },
    maxSize: { width: 3, height: 4 },
    configurable: true,
    defaultConfig: { filter: 'all', limit: 10 },
    category: 'productivity',
  },
  {
    id: 'calendar',
    type: 'calendar',
    title: 'Calendar',
    description: 'Upcoming events and meetings',
    icon: 'Calendar',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 2 },
    maxSize: { width: 4, height: 4 },
    configurable: true,
    defaultConfig: { view: 'week', showTasks: true },
    category: 'productivity',
  },
  {
    id: 'document_recent',
    type: 'document_recent',
    title: 'Recent Documents',
    description: 'Recently accessed documents',
    icon: 'FileText',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 3, height: 3 },
    configurable: true,
    defaultConfig: { limit: 8, showPreview: true },
    category: 'productivity',
  },
  
  // Team widgets
  {
    id: 'team_status',
    type: 'team_status',
    title: 'Team Status',
    description: 'Team members and availability',
    icon: 'Users',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 3, height: 3 },
    configurable: true,
    defaultConfig: { showOnline: true, limit: 10 },
    category: 'team',
  },
  {
    id: 'entity_overview',
    type: 'entity_overview',
    title: 'Entity Overview',
    description: 'Business entities summary',
    icon: 'Building2',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 4, height: 3 },
    configurable: true,
    defaultConfig: { showHierarchy: true },
    category: 'team',
  },
  {
    id: 'training_progress',
    type: 'training_progress',
    title: 'Training Progress',
    description: 'Learning and certifications',
    icon: 'GraduationCap',
    defaultSize: { width: 2, height: 1 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 3, height: 2 },
    configurable: true,
    defaultConfig: { showCertifications: true },
    category: 'team',
  },
  
  // Analytics widgets
  {
    id: 'chart_pie',
    type: 'chart_pie',
    title: 'Pie Chart',
    description: 'Customizable pie chart',
    icon: 'PieChart',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 3, height: 3 },
    configurable: true,
    defaultConfig: { dataSource: 'expenses_by_category' },
    category: 'analytics',
  },
  {
    id: 'chart_line',
    type: 'chart_line',
    title: 'Line Chart',
    description: 'Trend visualization',
    icon: 'TrendingUp',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 2, height: 1 },
    maxSize: { width: 4, height: 3 },
    configurable: true,
    defaultConfig: { dataSource: 'revenue_trend', period: '6months' },
    category: 'analytics',
  },
  {
    id: 'chart_bar',
    type: 'chart_bar',
    title: 'Bar Chart',
    description: 'Comparison visualization',
    icon: 'BarChart2',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 4, height: 3 },
    configurable: true,
    defaultConfig: { dataSource: 'tasks_by_status' },
    category: 'analytics',
  },
  
  // Utility widgets
  {
    id: 'clock',
    type: 'clock',
    title: 'Clock',
    description: 'Current time display',
    icon: 'Clock',
    defaultSize: { width: 1, height: 1 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 2, height: 1 },
    configurable: true,
    defaultConfig: { timezone: 'local', format: '12h' },
    category: 'utility',
  },
  {
    id: 'weather',
    type: 'weather',
    title: 'Weather',
    description: 'Current weather conditions',
    icon: 'Cloud',
    defaultSize: { width: 1, height: 1 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 2, height: 2 },
    configurable: true,
    defaultConfig: { location: 'auto', units: 'fahrenheit' },
    category: 'utility',
  },
  {
    id: 'notes',
    type: 'notes',
    title: 'Quick Notes',
    description: 'Personal notes and reminders',
    icon: 'StickyNote',
    defaultSize: { width: 2, height: 2 },
    minSize: { width: 1, height: 1 },
    maxSize: { width: 3, height: 4 },
    configurable: false,
    category: 'utility',
  },
];

// Category metadata
export const WIDGET_CATEGORIES: Record<WidgetCategory, { name: string; icon: string; color: string }> = {
  overview: { name: 'Overview', icon: 'LayoutDashboard', color: 'blue' },
  finance: { name: 'Finance', icon: 'DollarSign', color: 'green' },
  productivity: { name: 'Productivity', icon: 'CheckSquare', color: 'purple' },
  team: { name: 'Team', icon: 'Users', color: 'pink' },
  analytics: { name: 'Analytics', icon: 'BarChart3', color: 'amber' },
  utility: { name: 'Utility', icon: 'Wrench', color: 'gray' },
};

class DashboardWidgetsService {
  private layouts: DashboardLayout[] = [];
  private currentLayoutId: string | null = null;

  constructor() {
    this.initializeDefaultLayout();
  }

  private initializeDefaultLayout(): void {
    const defaultLayout: DashboardLayout = {
      id: 'layout_default',
      name: 'Default Dashboard',
      userId: 'current_user',
      gridColumns: 4,
      isDefault: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      widgets: [
        {
          id: 'inst_1',
          widgetId: 'quick_stats',
          position: { x: 0, y: 0 },
          size: { width: 2, height: 1 },
          config: { metrics: ['tasks', 'documents', 'transactions'] },
          isVisible: true,
        },
        {
          id: 'inst_2',
          widgetId: 'notifications',
          position: { x: 2, y: 0 },
          size: { width: 1, height: 2 },
          config: {},
          isVisible: true,
        },
        {
          id: 'inst_3',
          widgetId: 'clock',
          position: { x: 3, y: 0 },
          size: { width: 1, height: 1 },
          config: { timezone: 'local', format: '12h' },
          isVisible: true,
        },
        {
          id: 'inst_4',
          widgetId: 'task_list',
          position: { x: 0, y: 1 },
          size: { width: 2, height: 2 },
          config: { filter: 'all', limit: 10 },
          isVisible: true,
        },
        {
          id: 'inst_5',
          widgetId: 'activity_feed',
          position: { x: 2, y: 2 },
          size: { width: 2, height: 2 },
          config: { limit: 10, showFilters: false },
          isVisible: true,
        },
        {
          id: 'inst_6',
          widgetId: 'financial_summary',
          position: { x: 0, y: 3 },
          size: { width: 2, height: 2 },
          config: { period: 'month', showChart: true },
          isVisible: true,
        },
      ],
    };

    this.layouts.push(defaultLayout);
    this.currentLayoutId = defaultLayout.id;
  }

  // Get all available widgets
  getWidgetCatalog(): Widget[] {
    return [...WIDGET_CATALOG];
  }

  // Get widgets by category
  getWidgetsByCategory(category: WidgetCategory): Widget[] {
    return WIDGET_CATALOG.filter(w => w.category === category);
  }

  // Get all layouts
  getLayouts(): DashboardLayout[] {
    return [...this.layouts];
  }

  // Get current layout
  getCurrentLayout(): DashboardLayout | null {
    return this.layouts.find(l => l.id === this.currentLayoutId) || null;
  }

  // Set current layout
  setCurrentLayout(layoutId: string): boolean {
    const layout = this.layouts.find(l => l.id === layoutId);
    if (layout) {
      this.currentLayoutId = layoutId;
      return true;
    }
    return false;
  }

  // Create new layout
  createLayout(name: string): DashboardLayout {
    const layout: DashboardLayout = {
      id: `layout_${Date.now()}`,
      name,
      userId: 'current_user',
      gridColumns: 4,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      widgets: [],
    };
    this.layouts.push(layout);
    return layout;
  }

  // Delete layout
  deleteLayout(layoutId: string): boolean {
    const index = this.layouts.findIndex(l => l.id === layoutId);
    if (index >= 0 && !this.layouts[index].isDefault) {
      this.layouts.splice(index, 1);
      if (this.currentLayoutId === layoutId) {
        this.currentLayoutId = this.layouts[0]?.id || null;
      }
      return true;
    }
    return false;
  }

  // Add widget to current layout
  addWidget(widgetId: string, position?: { x: number; y: number }): WidgetInstance | null {
    const layout = this.getCurrentLayout();
    const widget = WIDGET_CATALOG.find(w => w.id === widgetId);
    
    if (!layout || !widget) return null;

    const instance: WidgetInstance = {
      id: `inst_${Date.now()}`,
      widgetId,
      position: position || this.findAvailablePosition(layout, widget.defaultSize),
      size: { ...widget.defaultSize },
      config: { ...widget.defaultConfig },
      isVisible: true,
    };

    layout.widgets.push(instance);
    layout.updatedAt = Date.now();
    return instance;
  }

  // Remove widget from current layout
  removeWidget(instanceId: string): boolean {
    const layout = this.getCurrentLayout();
    if (!layout) return false;

    const index = layout.widgets.findIndex(w => w.id === instanceId);
    if (index >= 0) {
      layout.widgets.splice(index, 1);
      layout.updatedAt = Date.now();
      return true;
    }
    return false;
  }

  // Update widget position
  updateWidgetPosition(instanceId: string, position: { x: number; y: number }): boolean {
    const layout = this.getCurrentLayout();
    if (!layout) return false;

    const widget = layout.widgets.find(w => w.id === instanceId);
    if (widget) {
      widget.position = position;
      layout.updatedAt = Date.now();
      return true;
    }
    return false;
  }

  // Update widget size
  updateWidgetSize(instanceId: string, size: WidgetSize): boolean {
    const layout = this.getCurrentLayout();
    if (!layout) return false;

    const instance = layout.widgets.find(w => w.id === instanceId);
    const widget = instance ? WIDGET_CATALOG.find(w => w.id === instance.widgetId) : null;
    
    if (instance && widget) {
      // Validate size constraints
      const newSize = {
        width: Math.max(widget.minSize.width, Math.min(widget.maxSize.width, size.width)),
        height: Math.max(widget.minSize.height, Math.min(widget.maxSize.height, size.height)),
      };
      instance.size = newSize;
      layout.updatedAt = Date.now();
      return true;
    }
    return false;
  }

  // Update widget config
  updateWidgetConfig(instanceId: string, config: Record<string, any>): boolean {
    const layout = this.getCurrentLayout();
    if (!layout) return false;

    const widget = layout.widgets.find(w => w.id === instanceId);
    if (widget) {
      widget.config = { ...widget.config, ...config };
      layout.updatedAt = Date.now();
      return true;
    }
    return false;
  }

  // Toggle widget visibility
  toggleWidgetVisibility(instanceId: string): boolean {
    const layout = this.getCurrentLayout();
    if (!layout) return false;

    const widget = layout.widgets.find(w => w.id === instanceId);
    if (widget) {
      widget.isVisible = !widget.isVisible;
      layout.updatedAt = Date.now();
      return true;
    }
    return false;
  }

  // Find available position for new widget
  private findAvailablePosition(layout: DashboardLayout, size: WidgetSize): { x: number; y: number } {
    const occupied = new Set<string>();
    
    layout.widgets.forEach(w => {
      for (let x = w.position.x; x < w.position.x + w.size.width; x++) {
        for (let y = w.position.y; y < w.position.y + w.size.height; y++) {
          occupied.add(`${x},${y}`);
        }
      }
    });

    // Find first available position
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= layout.gridColumns - size.width; x++) {
        let fits = true;
        for (let dx = 0; dx < size.width && fits; dx++) {
          for (let dy = 0; dy < size.height && fits; dy++) {
            if (occupied.has(`${x + dx},${y + dy}`)) {
              fits = false;
            }
          }
        }
        if (fits) {
          return { x, y };
        }
      }
    }

    return { x: 0, y: 0 };
  }

  // Reset layout to default
  resetLayout(layoutId: string): boolean {
    const layout = this.layouts.find(l => l.id === layoutId);
    if (layout && layout.isDefault) {
      this.initializeDefaultLayout();
      return true;
    }
    return false;
  }

  // Duplicate layout
  duplicateLayout(layoutId: string, newName: string): DashboardLayout | null {
    const source = this.layouts.find(l => l.id === layoutId);
    if (!source) return null;

    const duplicate: DashboardLayout = {
      ...source,
      id: `layout_${Date.now()}`,
      name: newName,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      widgets: source.widgets.map(w => ({
        ...w,
        id: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })),
    };

    this.layouts.push(duplicate);
    return duplicate;
  }

  // Export layout as JSON
  exportLayout(layoutId: string): string | null {
    const layout = this.layouts.find(l => l.id === layoutId);
    if (!layout) return null;
    return JSON.stringify(layout, null, 2);
  }

  // Import layout from JSON
  importLayout(json: string): DashboardLayout | null {
    try {
      const data = JSON.parse(json);
      const layout: DashboardLayout = {
        ...data,
        id: `layout_${Date.now()}`,
        userId: 'current_user',
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.layouts.push(layout);
      return layout;
    } catch {
      return null;
    }
  }
}

export const dashboardWidgetsService = new DashboardWidgetsService();
