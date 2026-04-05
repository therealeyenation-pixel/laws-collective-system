/**
 * Compliance Tracking Service
 * Phase 58.6: Calendar with filing deadlines, automated reminders, document expiration tracking
 */

export type ComplianceTaskType =
  | 'payroll_tax_deposit'
  | 'quarterly_941'
  | 'annual_940'
  | 'w2_filing'
  | '1099_filing'
  | 'k1_filing'
  | 'state_tax_deposit'
  | 'state_quarterly'
  | 'annual_report'
  | 'business_license'
  | 'i9_reverification'
  | 'workers_comp_audit'
  | 'benefits_enrollment'
  | 'performance_review'
  | 'custom';

export type TaskStatus = 'upcoming' | 'due_soon' | 'overdue' | 'completed' | 'skipped';
export type RecurrencePattern = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';

export interface ComplianceTask {
  taskId: string;
  businessEntityId?: number;
  houseId: number;
  positionHolderId?: number;
  taskType: ComplianceTaskType;
  taskName: string;
  description: string;
  dueDate: Date;
  reminderDate?: Date;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  assignedToUserId?: number;
  status: TaskStatus;
  completedAt?: Date;
  completedByUserId?: number;
  completionNotes?: string;
}

export interface FilingDeadline {
  deadlineId: string;
  taskType: ComplianceTaskType;
  name: string;
  description: string;
  dueDate: Date;
  filingPeriod: string;
  penaltyAmount?: number;
  penaltyDescription?: string;
  formNumber?: string;
  filingMethod: 'electronic' | 'paper' | 'both';
  extensionAvailable: boolean;
  extensionDeadline?: Date;
}

export interface DocumentExpiration {
  documentId: string;
  documentType: string;
  documentName: string;
  employeeName: string;
  positionHolderId: number;
  expirationDate: Date;
  daysUntilExpiration: number;
  status: 'valid' | 'expiring_soon' | 'expired';
  reverificationRequired: boolean;
  reverificationDeadline?: Date;
}

export interface ComplianceCalendar {
  month: number;
  year: number;
  tasks: ComplianceTask[];
  deadlines: FilingDeadline[];
  documentExpirations: DocumentExpiration[];
}

export interface ReminderConfig {
  taskType: ComplianceTaskType;
  reminderDaysBefore: number[];
  notificationMethods: ('email' | 'in_app' | 'sms')[];
  escalationDays: number;
  escalationRecipients: string[];
}

// Default reminder configurations by task type
const DEFAULT_REMINDER_CONFIGS: Record<ComplianceTaskType, ReminderConfig> = {
  payroll_tax_deposit: {
    taskType: 'payroll_tax_deposit',
    reminderDaysBefore: [7, 3, 1],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 1,
    escalationRecipients: ['owner'],
  },
  quarterly_941: {
    taskType: 'quarterly_941',
    reminderDaysBefore: [30, 14, 7, 3],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 3,
    escalationRecipients: ['owner', 'accountant'],
  },
  annual_940: {
    taskType: 'annual_940',
    reminderDaysBefore: [60, 30, 14, 7],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 7,
    escalationRecipients: ['owner', 'accountant'],
  },
  w2_filing: {
    taskType: 'w2_filing',
    reminderDaysBefore: [45, 30, 14, 7, 3],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 5,
    escalationRecipients: ['owner', 'hr'],
  },
  '1099_filing': {
    taskType: '1099_filing',
    reminderDaysBefore: [45, 30, 14, 7, 3],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 5,
    escalationRecipients: ['owner', 'accountant'],
  },
  k1_filing: {
    taskType: 'k1_filing',
    reminderDaysBefore: [60, 30, 14, 7],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 7,
    escalationRecipients: ['owner', 'accountant'],
  },
  state_tax_deposit: {
    taskType: 'state_tax_deposit',
    reminderDaysBefore: [7, 3, 1],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 1,
    escalationRecipients: ['owner'],
  },
  state_quarterly: {
    taskType: 'state_quarterly',
    reminderDaysBefore: [30, 14, 7, 3],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 3,
    escalationRecipients: ['owner', 'accountant'],
  },
  annual_report: {
    taskType: 'annual_report',
    reminderDaysBefore: [90, 60, 30, 14, 7],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 14,
    escalationRecipients: ['owner'],
  },
  business_license: {
    taskType: 'business_license',
    reminderDaysBefore: [90, 60, 30, 14],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 14,
    escalationRecipients: ['owner'],
  },
  i9_reverification: {
    taskType: 'i9_reverification',
    reminderDaysBefore: [90, 60, 30, 14, 7],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 7,
    escalationRecipients: ['owner', 'hr'],
  },
  workers_comp_audit: {
    taskType: 'workers_comp_audit',
    reminderDaysBefore: [60, 30, 14, 7],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 7,
    escalationRecipients: ['owner'],
  },
  benefits_enrollment: {
    taskType: 'benefits_enrollment',
    reminderDaysBefore: [30, 14, 7, 3],
    notificationMethods: ['in_app', 'email'],
    escalationDays: 3,
    escalationRecipients: ['owner', 'hr'],
  },
  performance_review: {
    taskType: 'performance_review',
    reminderDaysBefore: [14, 7, 3],
    notificationMethods: ['in_app'],
    escalationDays: 3,
    escalationRecipients: ['manager'],
  },
  custom: {
    taskType: 'custom',
    reminderDaysBefore: [7, 3, 1],
    notificationMethods: ['in_app'],
    escalationDays: 1,
    escalationRecipients: ['owner'],
  },
};

// Federal filing deadlines for a given year
export function getFederalFilingDeadlines(year: number): FilingDeadline[] {
  return [
    {
      deadlineId: `w2-${year}`,
      taskType: 'w2_filing',
      name: 'W-2 Filing Deadline',
      description: 'File W-2 forms with SSA and provide copies to employees',
      dueDate: new Date(year + 1, 0, 31), // January 31
      filingPeriod: `Tax Year ${year}`,
      penaltyAmount: 50,
      penaltyDescription: '$50 per form if filed within 30 days, up to $280 per form after Aug 1',
      formNumber: 'W-2',
      filingMethod: 'electronic',
      extensionAvailable: false,
    },
    {
      deadlineId: `1099-${year}`,
      taskType: '1099_filing',
      name: '1099-NEC Filing Deadline',
      description: 'File 1099-NEC forms with IRS and provide copies to contractors',
      dueDate: new Date(year + 1, 0, 31), // January 31
      filingPeriod: `Tax Year ${year}`,
      penaltyAmount: 50,
      penaltyDescription: '$50 per form if filed within 30 days',
      formNumber: '1099-NEC',
      filingMethod: 'electronic',
      extensionAvailable: false,
    },
    {
      deadlineId: `940-${year}`,
      taskType: 'annual_940',
      name: 'Form 940 Annual FUTA Return',
      description: 'File annual Federal Unemployment Tax Act return',
      dueDate: new Date(year + 1, 0, 31), // January 31
      filingPeriod: `Tax Year ${year}`,
      penaltyAmount: 5,
      penaltyDescription: '5% of unpaid tax per month, up to 25%',
      formNumber: '940',
      filingMethod: 'electronic',
      extensionAvailable: true,
      extensionDeadline: new Date(year + 1, 1, 10), // February 10 if all FUTA deposited
    },
    {
      deadlineId: `941-q1-${year}`,
      taskType: 'quarterly_941',
      name: 'Form 941 Q1',
      description: 'Quarterly payroll tax return for Q1',
      dueDate: new Date(year, 3, 30), // April 30
      filingPeriod: `Q1 ${year}`,
      penaltyAmount: 5,
      penaltyDescription: '5% of unpaid tax per month',
      formNumber: '941',
      filingMethod: 'electronic',
      extensionAvailable: false,
    },
    {
      deadlineId: `941-q2-${year}`,
      taskType: 'quarterly_941',
      name: 'Form 941 Q2',
      description: 'Quarterly payroll tax return for Q2',
      dueDate: new Date(year, 6, 31), // July 31
      filingPeriod: `Q2 ${year}`,
      penaltyAmount: 5,
      penaltyDescription: '5% of unpaid tax per month',
      formNumber: '941',
      filingMethod: 'electronic',
      extensionAvailable: false,
    },
    {
      deadlineId: `941-q3-${year}`,
      taskType: 'quarterly_941',
      name: 'Form 941 Q3',
      description: 'Quarterly payroll tax return for Q3',
      dueDate: new Date(year, 9, 31), // October 31
      filingPeriod: `Q3 ${year}`,
      penaltyAmount: 5,
      penaltyDescription: '5% of unpaid tax per month',
      formNumber: '941',
      filingMethod: 'electronic',
      extensionAvailable: false,
    },
    {
      deadlineId: `941-q4-${year}`,
      taskType: 'quarterly_941',
      name: 'Form 941 Q4',
      description: 'Quarterly payroll tax return for Q4',
      dueDate: new Date(year + 1, 0, 31), // January 31 of next year
      filingPeriod: `Q4 ${year}`,
      penaltyAmount: 5,
      penaltyDescription: '5% of unpaid tax per month',
      formNumber: '941',
      filingMethod: 'electronic',
      extensionAvailable: false,
    },
    {
      deadlineId: `k1-${year}`,
      taskType: 'k1_filing',
      name: 'Schedule K-1 Filing Deadline',
      description: 'Provide K-1 schedules to partners/members',
      dueDate: new Date(year + 1, 2, 15), // March 15
      filingPeriod: `Tax Year ${year}`,
      penaltyAmount: 220,
      penaltyDescription: '$220 per partner per month',
      formNumber: 'K-1',
      filingMethod: 'both',
      extensionAvailable: true,
      extensionDeadline: new Date(year + 1, 8, 15), // September 15
    },
  ];
}

// State annual report deadlines by state
export function getStateAnnualReportDeadline(state: string, formationDate: Date, year: number): FilingDeadline | null {
  const stateDeadlines: Record<string, { month: number; day: number | 'anniversary' | 'end_of_month' }> = {
    'AL': { month: 3, day: 15 }, // Alabama - April 15
    'AK': { month: 0, day: 2 }, // Alaska - January 2
    'AZ': { month: 'anniversary' as any, day: 'anniversary' }, // Arizona - Anniversary
    'AR': { month: 4, day: 1 }, // Arkansas - May 1
    'CA': { month: 'anniversary' as any, day: 'anniversary' }, // California - Anniversary
    'CO': { month: 'anniversary' as any, day: 'end_of_month' }, // Colorado - End of anniversary month
    'CT': { month: 2, day: 'anniversary' }, // Connecticut - Anniversary in March
    'DE': { month: 2, day: 1 }, // Delaware - March 1
    'FL': { month: 4, day: 1 }, // Florida - May 1
    'GA': { month: 3, day: 1 }, // Georgia - April 1
    'HI': { month: 'anniversary' as any, day: 'anniversary' }, // Hawaii - Anniversary
    'ID': { month: 'anniversary' as any, day: 'end_of_month' }, // Idaho - End of anniversary month
    'IL': { month: 'anniversary' as any, day: 'anniversary' }, // Illinois - Anniversary
    'IN': { month: 'anniversary' as any, day: 'anniversary' }, // Indiana - Anniversary
    'IA': { month: 3, day: 1 }, // Iowa - April 1
    'KS': { month: 3, day: 15 }, // Kansas - April 15
    'KY': { month: 5, day: 30 }, // Kentucky - June 30
    'LA': { month: 'anniversary' as any, day: 'anniversary' }, // Louisiana - Anniversary
    'ME': { month: 5, day: 1 }, // Maine - June 1
    'MD': { month: 3, day: 15 }, // Maryland - April 15
    'MA': { month: 'anniversary' as any, day: 'anniversary' }, // Massachusetts - Anniversary
    'MI': { month: 1, day: 15 }, // Michigan - February 15
    'MN': { month: 11, day: 31 }, // Minnesota - December 31
    'MS': { month: 3, day: 15 }, // Mississippi - April 15
    'MO': { month: 'anniversary' as any, day: 'anniversary' }, // Missouri - Anniversary
    'MT': { month: 3, day: 15 }, // Montana - April 15
    'NE': { month: 3, day: 1 }, // Nebraska - April 1
    'NV': { month: 'anniversary' as any, day: 'end_of_month' }, // Nevada - End of anniversary month
    'NH': { month: 3, day: 1 }, // New Hampshire - April 1
    'NJ': { month: 'anniversary' as any, day: 'anniversary' }, // New Jersey - Anniversary
    'NM': { month: 'anniversary' as any, day: 'anniversary' }, // New Mexico - Anniversary
    'NY': { month: 'anniversary' as any, day: 'anniversary' }, // New York - Anniversary (biennial)
    'NC': { month: 3, day: 15 }, // North Carolina - April 15
    'ND': { month: 10, day: 15 }, // North Dakota - November 15
    'OH': { month: 'anniversary' as any, day: 'anniversary' }, // Ohio - Anniversary
    'OK': { month: 'anniversary' as any, day: 'anniversary' }, // Oklahoma - Anniversary
    'OR': { month: 'anniversary' as any, day: 'anniversary' }, // Oregon - Anniversary
    'PA': { month: 'anniversary' as any, day: 'anniversary' }, // Pennsylvania - Anniversary
    'RI': { month: 10, day: 1 }, // Rhode Island - November 1
    'SC': { month: 'anniversary' as any, day: 'anniversary' }, // South Carolina - Anniversary
    'SD': { month: 'anniversary' as any, day: 'anniversary' }, // South Dakota - Anniversary
    'TN': { month: 3, day: 1 }, // Tennessee - April 1
    'TX': { month: 4, day: 15 }, // Texas - May 15
    'UT': { month: 'anniversary' as any, day: 'anniversary' }, // Utah - Anniversary
    'VT': { month: 'anniversary' as any, day: 'anniversary' }, // Vermont - Anniversary
    'VA': { month: 'anniversary' as any, day: 'end_of_month' }, // Virginia - End of anniversary month
    'WA': { month: 'anniversary' as any, day: 'end_of_month' }, // Washington - End of anniversary month
    'WV': { month: 6, day: 1 }, // West Virginia - July 1
    'WI': { month: 'anniversary' as any, day: 'anniversary' }, // Wisconsin - Anniversary
    'WY': { month: 'anniversary' as any, day: 'anniversary' }, // Wyoming - Anniversary
    'DC': { month: 3, day: 1 }, // DC - April 1
  };

  const config = stateDeadlines[state];
  if (!config) return null;

  let dueDate: Date;
  if (config.month === 'anniversary' || config.day === 'anniversary') {
    const anniversaryMonth = formationDate.getMonth();
    const anniversaryDay = config.day === 'end_of_month' 
      ? new Date(year, anniversaryMonth + 1, 0).getDate()
      : formationDate.getDate();
    dueDate = new Date(year, anniversaryMonth, anniversaryDay);
  } else {
    const day = config.day === 'end_of_month' 
      ? new Date(year, config.month + 1, 0).getDate()
      : config.day as number;
    dueDate = new Date(year, config.month, day);
  }

  return {
    deadlineId: `annual-report-${state}-${year}`,
    taskType: 'annual_report',
    name: `${state} Annual Report`,
    description: `File annual report with ${state} Secretary of State`,
    dueDate,
    filingPeriod: `Year ${year}`,
    penaltyAmount: 50,
    penaltyDescription: 'Late fee varies by state, typically $50-$200',
    filingMethod: 'electronic',
    extensionAvailable: false,
  };
}

// Create a compliance task
export function createComplianceTask(
  houseId: number,
  taskType: ComplianceTaskType,
  taskName: string,
  description: string,
  dueDate: Date,
  options?: {
    businessEntityId?: number;
    positionHolderId?: number;
    isRecurring?: boolean;
    recurrencePattern?: RecurrencePattern;
    assignedToUserId?: number;
  }
): ComplianceTask {
  const reminderConfig = DEFAULT_REMINDER_CONFIGS[taskType];
  const reminderDays = reminderConfig.reminderDaysBefore[0] || 7;
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - reminderDays);

  return {
    taskId: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    houseId,
    businessEntityId: options?.businessEntityId,
    positionHolderId: options?.positionHolderId,
    taskType,
    taskName,
    description,
    dueDate,
    reminderDate,
    isRecurring: options?.isRecurring || false,
    recurrencePattern: options?.recurrencePattern,
    assignedToUserId: options?.assignedToUserId,
    status: 'upcoming',
  };
}

// Calculate task status based on due date
export function calculateTaskStatus(dueDate: Date, completedAt?: Date): TaskStatus {
  if (completedAt) return 'completed';
  
  const now = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return 'due_soon';
  return 'upcoming';
}

// Update task statuses for a list of tasks
export function updateTaskStatuses(tasks: ComplianceTask[]): ComplianceTask[] {
  return tasks.map(task => ({
    ...task,
    status: calculateTaskStatus(task.dueDate, task.completedAt),
  }));
}

// Check document expiration status
export function checkDocumentExpiration(
  documentId: string,
  documentType: string,
  documentName: string,
  employeeName: string,
  positionHolderId: number,
  expirationDate: Date
): DocumentExpiration {
  const now = new Date();
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let status: 'valid' | 'expiring_soon' | 'expired';
  if (daysUntilExpiration < 0) {
    status = 'expired';
  } else if (daysUntilExpiration <= 90) {
    status = 'expiring_soon';
  } else {
    status = 'valid';
  }

  // I-9 reverification deadline is the expiration date
  const reverificationRequired = documentType === 'i9' || documentType === 'work_authorization';
  const reverificationDeadline = reverificationRequired ? expirationDate : undefined;

  return {
    documentId,
    documentType,
    documentName,
    employeeName,
    positionHolderId,
    expirationDate,
    daysUntilExpiration,
    status,
    reverificationRequired,
    reverificationDeadline,
  };
}

// Generate I-9 reverification tasks for employees with expiring work authorization
export function generateI9ReverificationTasks(
  houseId: number,
  employees: Array<{
    positionHolderId: number;
    employeeName: string;
    workAuthorizationExpiration?: Date;
  }>
): ComplianceTask[] {
  const tasks: ComplianceTask[] = [];
  const now = new Date();

  for (const employee of employees) {
    if (!employee.workAuthorizationExpiration) continue;

    const daysUntilExpiration = Math.ceil(
      (employee.workAuthorizationExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Create task if expiring within 90 days
    if (daysUntilExpiration <= 90 && daysUntilExpiration > 0) {
      tasks.push(createComplianceTask(
        houseId,
        'i9_reverification',
        `I-9 Reverification: ${employee.employeeName}`,
        `Work authorization expires on ${employee.workAuthorizationExpiration.toLocaleDateString()}. Complete I-9 reverification before expiration.`,
        employee.workAuthorizationExpiration,
        { positionHolderId: employee.positionHolderId }
      ));
    }
  }

  return tasks;
}

// Get reminders due for a task
export function getTaskReminders(task: ComplianceTask): {
  shouldRemind: boolean;
  reminderType: 'standard' | 'escalation';
  daysUntilDue: number;
} {
  const now = new Date();
  const daysUntilDue = Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const config = DEFAULT_REMINDER_CONFIGS[task.taskType];

  // Check if we should send a standard reminder
  const shouldRemindStandard = config.reminderDaysBefore.includes(daysUntilDue);

  // Check if we should escalate (overdue by escalation days)
  const shouldEscalate = daysUntilDue < 0 && Math.abs(daysUntilDue) >= config.escalationDays;

  return {
    shouldRemind: shouldRemindStandard || shouldEscalate,
    reminderType: shouldEscalate ? 'escalation' : 'standard',
    daysUntilDue,
  };
}

// Generate compliance calendar for a month
export function generateComplianceCalendar(
  houseId: number,
  month: number,
  year: number,
  tasks: ComplianceTask[],
  state?: string,
  formationDate?: Date
): ComplianceCalendar {
  // Filter tasks for the given month
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const monthTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate >= monthStart && taskDate <= monthEnd;
  });

  // Get federal deadlines for this month
  const federalDeadlines = getFederalFilingDeadlines(year).filter(deadline => {
    const deadlineDate = new Date(deadline.dueDate);
    return deadlineDate >= monthStart && deadlineDate <= monthEnd;
  });

  // Get state annual report deadline if applicable
  const deadlines: FilingDeadline[] = [...federalDeadlines];
  if (state && formationDate) {
    const stateDeadline = getStateAnnualReportDeadline(state, formationDate, year);
    if (stateDeadline) {
      const deadlineDate = new Date(stateDeadline.dueDate);
      if (deadlineDate >= monthStart && deadlineDate <= monthEnd) {
        deadlines.push(stateDeadline);
      }
    }
  }

  return {
    month,
    year,
    tasks: updateTaskStatuses(monthTasks),
    deadlines,
    documentExpirations: [], // Populated separately from employee data
  };
}

// Get upcoming tasks summary
export function getUpcomingTasksSummary(tasks: ComplianceTask[]): {
  overdue: ComplianceTask[];
  dueSoon: ComplianceTask[];
  upcoming: ComplianceTask[];
  totalCount: number;
  overdueCount: number;
  dueSoonCount: number;
} {
  const updatedTasks = updateTaskStatuses(tasks);
  const overdue = updatedTasks.filter(t => t.status === 'overdue');
  const dueSoon = updatedTasks.filter(t => t.status === 'due_soon');
  const upcoming = updatedTasks.filter(t => t.status === 'upcoming');

  return {
    overdue,
    dueSoon,
    upcoming,
    totalCount: updatedTasks.length,
    overdueCount: overdue.length,
    dueSoonCount: dueSoon.length,
  };
}

// Complete a task
export function completeTask(
  task: ComplianceTask,
  completedByUserId: number,
  completionNotes?: string
): ComplianceTask {
  return {
    ...task,
    status: 'completed',
    completedAt: new Date(),
    completedByUserId,
    completionNotes,
  };
}

// Skip a task
export function skipTask(
  task: ComplianceTask,
  reason: string
): ComplianceTask {
  return {
    ...task,
    status: 'skipped',
    completionNotes: `Skipped: ${reason}`,
  };
}

// Generate next occurrence for recurring task
export function generateNextOccurrence(task: ComplianceTask): ComplianceTask | null {
  if (!task.isRecurring || !task.recurrencePattern) return null;

  const nextDueDate = new Date(task.dueDate);
  
  switch (task.recurrencePattern) {
    case 'weekly':
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDueDate.setDate(nextDueDate.getDate() + 14);
      break;
    case 'monthly':
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDueDate.setMonth(nextDueDate.getMonth() + 3);
      break;
    case 'annually':
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      break;
  }

  const reminderConfig = DEFAULT_REMINDER_CONFIGS[task.taskType];
  const reminderDays = reminderConfig.reminderDaysBefore[0] || 7;
  const nextReminderDate = new Date(nextDueDate);
  nextReminderDate.setDate(nextReminderDate.getDate() - reminderDays);

  return {
    ...task,
    taskId: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dueDate: nextDueDate,
    reminderDate: nextReminderDate,
    status: 'upcoming',
    completedAt: undefined,
    completedByUserId: undefined,
    completionNotes: undefined,
  };
}

// Get reminder configuration for a task type
export function getReminderConfig(taskType: ComplianceTaskType): ReminderConfig {
  return DEFAULT_REMINDER_CONFIGS[taskType];
}

// Get all task types with descriptions
export function getTaskTypes(): Array<{ type: ComplianceTaskType; name: string; description: string }> {
  return [
    { type: 'payroll_tax_deposit', name: 'Payroll Tax Deposit', description: 'Federal payroll tax deposits (941)' },
    { type: 'quarterly_941', name: 'Quarterly 941', description: 'Quarterly payroll tax return' },
    { type: 'annual_940', name: 'Annual 940', description: 'Annual FUTA return' },
    { type: 'w2_filing', name: 'W-2 Filing', description: 'W-2 forms for employees' },
    { type: '1099_filing', name: '1099 Filing', description: '1099-NEC forms for contractors' },
    { type: 'k1_filing', name: 'K-1 Filing', description: 'Schedule K-1 for partners/members' },
    { type: 'state_tax_deposit', name: 'State Tax Deposit', description: 'State payroll tax deposits' },
    { type: 'state_quarterly', name: 'State Quarterly', description: 'State quarterly payroll return' },
    { type: 'annual_report', name: 'Annual Report', description: 'State annual report filing' },
    { type: 'business_license', name: 'Business License', description: 'Business license renewal' },
    { type: 'i9_reverification', name: 'I-9 Reverification', description: 'Employment eligibility reverification' },
    { type: 'workers_comp_audit', name: 'Workers Comp Audit', description: 'Workers compensation audit' },
    { type: 'benefits_enrollment', name: 'Benefits Enrollment', description: 'Open enrollment period' },
    { type: 'performance_review', name: 'Performance Review', description: 'Employee performance review' },
    { type: 'custom', name: 'Custom Task', description: 'Custom compliance task' },
  ];
}
