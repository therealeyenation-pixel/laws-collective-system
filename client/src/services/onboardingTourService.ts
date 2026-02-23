// Onboarding Tour Service - Interactive guided walkthrough for new users

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  route?: string; // Optional route to navigate to before showing step
  action?: 'click' | 'hover' | 'input'; // Optional action hint
  required?: boolean; // If true, user must complete action to proceed
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  category: 'getting-started' | 'features' | 'admin' | 'advanced';
  estimatedMinutes: number;
  requiredRole?: 'user' | 'staff' | 'manager' | 'admin';
}

export interface TourProgress {
  tourId: string;
  currentStep: number;
  completed: boolean;
  startedAt: number;
  completedAt?: number;
  skippedSteps: string[];
}

export interface UserTourState {
  userId: string;
  completedTours: string[];
  inProgressTours: Record<string, TourProgress>;
  preferences: {
    showTourOnLogin: boolean;
    autoStartNewTours: boolean;
    dismissedTours: string[];
  };
}

// Define available tours
const TOURS: Tour[] = [
  {
    id: 'welcome',
    name: 'Welcome to the System',
    description: 'A quick introduction to the main features and navigation',
    category: 'getting-started',
    estimatedMinutes: 5,
    steps: [
      {
        id: 'welcome-1',
        title: 'Welcome!',
        description: 'Welcome to the LuvOnPurpose Autonomous Wealth System. This tour will help you get familiar with the main features.',
        target: 'body',
        placement: 'center'
      },
      {
        id: 'welcome-2',
        title: 'Navigation Sidebar',
        description: 'Use the sidebar to navigate between different sections of the system. Click on any menu item to explore.',
        target: '[data-tour="sidebar"]',
        placement: 'right',
        route: '/dashboard'
      },
      {
        id: 'welcome-3',
        title: 'Dashboard Overview',
        description: 'The dashboard shows your key metrics and recent activity at a glance.',
        target: '[data-tour="dashboard-stats"]',
        placement: 'bottom',
        route: '/dashboard'
      },
      {
        id: 'welcome-4',
        title: 'Quick Actions',
        description: 'Use these buttons for common tasks like creating documents, adding tasks, or viewing reports.',
        target: '[data-tour="quick-actions"]',
        placement: 'bottom'
      },
      {
        id: 'welcome-5',
        title: 'User Menu',
        description: 'Access your profile, settings, and logout from the user menu in the top right.',
        target: '[data-tour="user-menu"]',
        placement: 'left'
      },
      {
        id: 'welcome-6',
        title: 'Tour Complete!',
        description: 'You\'ve completed the welcome tour. Explore more tours to learn about specific features.',
        target: 'body',
        placement: 'center'
      }
    ]
  },
  {
    id: 'document-management',
    name: 'Document Management',
    description: 'Learn how to upload, organize, and manage documents',
    category: 'features',
    estimatedMinutes: 8,
    steps: [
      {
        id: 'docs-1',
        title: 'Document Vault',
        description: 'The Document Vault is your secure storage for all important files.',
        target: '[data-tour="document-vault"]',
        placement: 'right',
        route: '/document-vault'
      },
      {
        id: 'docs-2',
        title: 'Upload Documents',
        description: 'Click the upload button to add new documents. You can drag and drop files or browse your computer.',
        target: '[data-tour="upload-button"]',
        placement: 'bottom',
        action: 'click'
      },
      {
        id: 'docs-3',
        title: 'Organize with Folders',
        description: 'Create folders to organize your documents by category, entity, or project.',
        target: '[data-tour="folder-tree"]',
        placement: 'right'
      },
      {
        id: 'docs-4',
        title: 'Document Actions',
        description: 'Click on any document to view, download, share, or request signatures.',
        target: '[data-tour="document-actions"]',
        placement: 'left'
      },
      {
        id: 'docs-5',
        title: 'Electronic Signatures',
        description: 'Request electronic signatures on documents directly from the system.',
        target: '[data-tour="signature-button"]',
        placement: 'bottom'
      }
    ]
  },
  {
    id: 'task-management',
    name: 'Task Management',
    description: 'Learn how to create, assign, and track tasks',
    category: 'features',
    estimatedMinutes: 7,
    steps: [
      {
        id: 'tasks-1',
        title: 'My Tasks',
        description: 'View all your assigned tasks and their status.',
        target: '[data-tour="my-tasks"]',
        placement: 'right',
        route: '/my-tasks'
      },
      {
        id: 'tasks-2',
        title: 'Create a Task',
        description: 'Click to create a new task. Set the title, description, due date, and priority.',
        target: '[data-tour="create-task"]',
        placement: 'bottom',
        action: 'click'
      },
      {
        id: 'tasks-3',
        title: 'Task Status',
        description: 'Update task status as you progress. Move tasks through stages: To Do, In Progress, Review, Complete.',
        target: '[data-tour="task-status"]',
        placement: 'right'
      },
      {
        id: 'tasks-4',
        title: 'Task Delegation',
        description: 'Delegate tasks to team members when needed. Add notes and adjust deadlines.',
        target: '[data-tour="delegate-button"]',
        placement: 'bottom'
      },
      {
        id: 'tasks-5',
        title: 'Task Filters',
        description: 'Filter tasks by status, priority, due date, or assignee to find what you need.',
        target: '[data-tour="task-filters"]',
        placement: 'bottom'
      }
    ]
  },
  {
    id: 'financial-overview',
    name: 'Financial Overview',
    description: 'Understand the financial dashboards and reports',
    category: 'features',
    estimatedMinutes: 10,
    steps: [
      {
        id: 'finance-1',
        title: 'Financial Dashboard',
        description: 'Get a comprehensive view of your financial health.',
        target: '[data-tour="financial-dashboard"]',
        placement: 'right',
        route: '/financial-dashboard'
      },
      {
        id: 'finance-2',
        title: 'Revenue Tracking',
        description: 'Monitor revenue streams across all entities and time periods.',
        target: '[data-tour="revenue-chart"]',
        placement: 'bottom'
      },
      {
        id: 'finance-3',
        title: 'Expense Management',
        description: 'Track and categorize expenses. Set budgets and receive alerts.',
        target: '[data-tour="expense-section"]',
        placement: 'bottom'
      },
      {
        id: 'finance-4',
        title: 'Token Economy',
        description: 'View token balances, transactions, and distribution across entities.',
        target: '[data-tour="token-section"]',
        placement: 'right',
        route: '/token-economy'
      },
      {
        id: 'finance-5',
        title: 'Reports',
        description: 'Generate financial reports for any time period. Export to PDF or Excel.',
        target: '[data-tour="reports-button"]',
        placement: 'bottom'
      }
    ]
  },
  {
    id: 'admin-setup',
    name: 'Administrator Setup',
    description: 'Configure system settings and manage users',
    category: 'admin',
    estimatedMinutes: 12,
    requiredRole: 'admin',
    steps: [
      {
        id: 'admin-1',
        title: 'Admin Dashboard',
        description: 'Access administrative functions and system configuration.',
        target: '[data-tour="admin-section"]',
        placement: 'right',
        route: '/admin-dashboard'
      },
      {
        id: 'admin-2',
        title: 'User Management',
        description: 'Add, edit, and manage user accounts. Assign roles and permissions.',
        target: '[data-tour="user-management"]',
        placement: 'bottom'
      },
      {
        id: 'admin-3',
        title: 'Entity Configuration',
        description: 'Configure business entities, their relationships, and allocation percentages.',
        target: '[data-tour="entity-config"]',
        placement: 'right'
      },
      {
        id: 'admin-4',
        title: 'System Health',
        description: 'Monitor system health, run diagnostics, and perform maintenance.',
        target: '[data-tour="system-health"]',
        placement: 'bottom',
        route: '/system-health'
      },
      {
        id: 'admin-5',
        title: 'Integration Hub',
        description: 'Connect external services and manage API integrations.',
        target: '[data-tour="integrations"]',
        placement: 'right',
        route: '/integration-hub'
      },
      {
        id: 'admin-6',
        title: 'Backup & Recovery',
        description: 'Configure backups and access recovery options.',
        target: '[data-tour="backup-section"]',
        placement: 'bottom'
      }
    ]
  },
  {
    id: 'autonomous-operations',
    name: 'Autonomous Operations',
    description: 'Learn how the autonomous business engine works',
    category: 'advanced',
    estimatedMinutes: 15,
    requiredRole: 'manager',
    steps: [
      {
        id: 'auto-1',
        title: 'Autonomous Engine',
        description: 'The system can make autonomous decisions based on configured rules and AI logic.',
        target: '[data-tour="autonomous-section"]',
        placement: 'right',
        route: '/autonomous-operations'
      },
      {
        id: 'auto-2',
        title: 'Decision Queue',
        description: 'Review pending autonomous decisions before they execute.',
        target: '[data-tour="decision-queue"]',
        placement: 'bottom'
      },
      {
        id: 'auto-3',
        title: 'Approval Thresholds',
        description: 'Configure thresholds for when human approval is required.',
        target: '[data-tour="thresholds"]',
        placement: 'right'
      },
      {
        id: 'auto-4',
        title: 'Audit Trail',
        description: 'All autonomous decisions are logged with full audit trail.',
        target: '[data-tour="audit-trail"]',
        placement: 'bottom',
        route: '/audit-trail'
      },
      {
        id: 'auto-5',
        title: 'Override Controls',
        description: 'Override or reverse autonomous decisions when needed.',
        target: '[data-tour="override-controls"]',
        placement: 'left'
      }
    ]
  }
];

const STORAGE_KEY = 'onboarding_tour_state';

class OnboardingTourService {
  private state: UserTourState;
  private activeTour: Tour | null = null;
  private activeStep: number = 0;
  private listeners: Set<(state: any) => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): UserTourState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load tour state:', error);
    }

    return {
      userId: 'default',
      completedTours: [],
      inProgressTours: {},
      preferences: {
        showTourOnLogin: true,
        autoStartNewTours: false,
        dismissedTours: []
      }
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save tour state:', error);
    }
  }

  private notifyListeners(): void {
    const currentState = this.getCurrentState();
    this.listeners.forEach(listener => listener(currentState));
  }

  // Subscribe to tour state changes
  subscribe(listener: (state: any) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get all available tours
  getAllTours(): Tour[] {
    return TOURS;
  }

  // Get tours by category
  getToursByCategory(category: Tour['category']): Tour[] {
    return TOURS.filter(t => t.category === category);
  }

  // Get recommended tours for user
  getRecommendedTours(userRole: string = 'user'): Tour[] {
    return TOURS.filter(tour => {
      // Filter by role
      if (tour.requiredRole) {
        const roleHierarchy = ['user', 'staff', 'manager', 'admin'];
        const userRoleIndex = roleHierarchy.indexOf(userRole);
        const requiredRoleIndex = roleHierarchy.indexOf(tour.requiredRole);
        if (userRoleIndex < requiredRoleIndex) return false;
      }

      // Filter out completed and dismissed
      if (this.state.completedTours.includes(tour.id)) return false;
      if (this.state.preferences.dismissedTours.includes(tour.id)) return false;

      return true;
    });
  }

  // Get tour by ID
  getTour(id: string): Tour | undefined {
    return TOURS.find(t => t.id === id);
  }

  // Start a tour
  startTour(tourId: string): boolean {
    const tour = this.getTour(tourId);
    if (!tour) return false;

    this.activeTour = tour;
    this.activeStep = 0;

    // Initialize or resume progress
    if (!this.state.inProgressTours[tourId]) {
      this.state.inProgressTours[tourId] = {
        tourId,
        currentStep: 0,
        completed: false,
        startedAt: Date.now(),
        skippedSteps: []
      };
    }

    this.saveState();
    this.notifyListeners();
    return true;
  }

  // Get current tour state
  getCurrentState(): {
    isActive: boolean;
    tour: Tour | null;
    step: TourStep | null;
    stepIndex: number;
    totalSteps: number;
    progress: number;
  } {
    if (!this.activeTour) {
      return {
        isActive: false,
        tour: null,
        step: null,
        stepIndex: 0,
        totalSteps: 0,
        progress: 0
      };
    }

    return {
      isActive: true,
      tour: this.activeTour,
      step: this.activeTour.steps[this.activeStep] || null,
      stepIndex: this.activeStep,
      totalSteps: this.activeTour.steps.length,
      progress: ((this.activeStep + 1) / this.activeTour.steps.length) * 100
    };
  }

  // Navigate to next step
  nextStep(): boolean {
    if (!this.activeTour) return false;

    if (this.activeStep < this.activeTour.steps.length - 1) {
      this.activeStep++;
      this.updateProgress();
      this.notifyListeners();
      return true;
    }

    // Tour complete
    this.completeTour();
    return false;
  }

  // Navigate to previous step
  prevStep(): boolean {
    if (!this.activeTour || this.activeStep <= 0) return false;

    this.activeStep--;
    this.updateProgress();
    this.notifyListeners();
    return true;
  }

  // Skip current step
  skipStep(): boolean {
    if (!this.activeTour) return false;

    const currentStep = this.activeTour.steps[this.activeStep];
    if (currentStep) {
      const progress = this.state.inProgressTours[this.activeTour.id];
      if (progress && !progress.skippedSteps.includes(currentStep.id)) {
        progress.skippedSteps.push(currentStep.id);
      }
    }

    return this.nextStep();
  }

  // Go to specific step
  goToStep(stepIndex: number): boolean {
    if (!this.activeTour) return false;
    if (stepIndex < 0 || stepIndex >= this.activeTour.steps.length) return false;

    this.activeStep = stepIndex;
    this.updateProgress();
    this.notifyListeners();
    return true;
  }

  private updateProgress(): void {
    if (!this.activeTour) return;

    const progress = this.state.inProgressTours[this.activeTour.id];
    if (progress) {
      progress.currentStep = this.activeStep;
      this.saveState();
    }
  }

  // Complete current tour
  completeTour(): void {
    if (!this.activeTour) return;

    const tourId = this.activeTour.id;

    // Mark as completed
    if (!this.state.completedTours.includes(tourId)) {
      this.state.completedTours.push(tourId);
    }

    // Update progress
    const progress = this.state.inProgressTours[tourId];
    if (progress) {
      progress.completed = true;
      progress.completedAt = Date.now();
    }

    this.activeTour = null;
    this.activeStep = 0;
    this.saveState();
    this.notifyListeners();
  }

  // Exit tour without completing
  exitTour(): void {
    if (!this.activeTour) return;

    this.updateProgress();
    this.activeTour = null;
    this.activeStep = 0;
    this.notifyListeners();
  }

  // Dismiss a tour (won't be recommended again)
  dismissTour(tourId: string): void {
    if (!this.state.preferences.dismissedTours.includes(tourId)) {
      this.state.preferences.dismissedTours.push(tourId);
      this.saveState();
    }
  }

  // Reset tour progress
  resetTour(tourId: string): void {
    delete this.state.inProgressTours[tourId];
    this.state.completedTours = this.state.completedTours.filter(id => id !== tourId);
    this.state.preferences.dismissedTours = this.state.preferences.dismissedTours.filter(id => id !== tourId);
    this.saveState();
  }

  // Reset all tours
  resetAllTours(): void {
    this.state.completedTours = [];
    this.state.inProgressTours = {};
    this.state.preferences.dismissedTours = [];
    this.activeTour = null;
    this.activeStep = 0;
    this.saveState();
    this.notifyListeners();
  }

  // Get tour progress
  getTourProgress(tourId: string): TourProgress | undefined {
    return this.state.inProgressTours[tourId];
  }

  // Check if tour is completed
  isTourCompleted(tourId: string): boolean {
    return this.state.completedTours.includes(tourId);
  }

  // Get completion statistics
  getStatistics(): {
    totalTours: number;
    completedTours: number;
    inProgressTours: number;
    completionRate: number;
    totalTimeMinutes: number;
  } {
    const totalTours = TOURS.length;
    const completedTours = this.state.completedTours.length;
    const inProgressTours = Object.keys(this.state.inProgressTours).filter(
      id => !this.state.completedTours.includes(id)
    ).length;

    const totalTimeMinutes = this.state.completedTours.reduce((total, tourId) => {
      const tour = this.getTour(tourId);
      return total + (tour?.estimatedMinutes || 0);
    }, 0);

    return {
      totalTours,
      completedTours,
      inProgressTours,
      completionRate: totalTours > 0 ? (completedTours / totalTours) * 100 : 0,
      totalTimeMinutes
    };
  }

  // Update preferences
  updatePreferences(preferences: Partial<UserTourState['preferences']>): void {
    this.state.preferences = { ...this.state.preferences, ...preferences };
    this.saveState();
  }

  // Get preferences
  getPreferences(): UserTourState['preferences'] {
    return this.state.preferences;
  }
}

export const onboardingTourService = new OnboardingTourService();
