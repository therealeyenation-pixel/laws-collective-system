/**
 * Integrated Onboarding/Offboarding System
 * 
 * Unified workflows that automatically provision equipment, software licenses,
 * and property access when employees are hired or terminated.
 */

// Types
export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type OffboardingStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked';
export type TaskCategory = 'hr' | 'it' | 'property' | 'finance' | 'training' | 'security' | 'admin';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface OnboardingTask {
  id: string;
  workflowId: string;
  category: TaskCategory;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  completedBy?: string;
  dependencies: string[];
  automatable: boolean;
  automationResult?: {
    success: boolean;
    message: string;
    timestamp: Date;
  };
  notes?: string;
  order: number;
}

export interface OnboardingWorkflow {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  positionId: string;
  positionTitle: string;
  departmentId: string;
  departmentName: string;
  entityId: string;
  entityName: string;
  hireDate: Date;
  startDate: Date;
  status: OnboardingStatus;
  tasks: OnboardingTask[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  managerId?: string;
  managerName?: string;
  hrContactId?: string;
  hrContactName?: string;
  notes?: string;
}

export interface OffboardingWorkflow {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  positionId: string;
  positionTitle: string;
  departmentId: string;
  departmentName: string;
  entityId: string;
  entityName: string;
  terminationDate: Date;
  lastWorkingDay: Date;
  terminationType: 'resignation' | 'termination' | 'retirement' | 'layoff' | 'contract_end';
  status: OffboardingStatus;
  tasks: OnboardingTask[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  managerId?: string;
  managerName?: string;
  hrContactId?: string;
  hrContactName?: string;
  exitInterviewScheduled: boolean;
  exitInterviewCompleted: boolean;
  notes?: string;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  positionType: string;
  departmentId?: string;
  entityId?: string;
  tasks: Omit<OnboardingTask, 'id' | 'workflowId' | 'status' | 'completedAt' | 'completedBy' | 'automationResult'>[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OffboardingTemplate {
  id: string;
  name: string;
  description: string;
  terminationType: OffboardingWorkflow['terminationType'];
  tasks: Omit<OnboardingTask, 'id' | 'workflowId' | 'status' | 'completedAt' | 'completedBy' | 'automationResult'>[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentProvision {
  assetId: string;
  assetTag: string;
  assetName: string;
  category: string;
  assignedDate: Date;
  returnedDate?: Date;
  condition: 'new' | 'good' | 'fair' | 'needs_repair';
}

export interface SoftwareLicenseProvision {
  licenseId: string;
  softwareName: string;
  seatId: string;
  assignedDate: Date;
  revokedDate?: Date;
}

export interface AccessProvision {
  accessId: string;
  accessType: 'building' | 'room' | 'system' | 'network' | 'application';
  resourceName: string;
  accessLevel: 'read' | 'write' | 'admin' | 'full';
  grantedDate: Date;
  revokedDate?: Date;
}

// In-memory storage
const onboardingWorkflows: Map<string, OnboardingWorkflow> = new Map();
const offboardingWorkflows: Map<string, OffboardingWorkflow> = new Map();
const onboardingTemplates: Map<string, OnboardingTemplate> = new Map();
const offboardingTemplates: Map<string, OffboardingTemplate> = new Map();
const equipmentProvisions: Map<string, EquipmentProvision[]> = new Map();
const softwareProvisions: Map<string, SoftwareLicenseProvision[]> = new Map();
const accessProvisions: Map<string, AccessProvision[]> = new Map();

// Default onboarding tasks by category
const defaultOnboardingTasks: Omit<OnboardingTask, 'id' | 'workflowId' | 'status' | 'completedAt' | 'completedBy' | 'automationResult'>[] = [
  // HR Tasks
  { category: 'hr', title: 'Complete I-9 verification', description: 'Verify employment eligibility documentation', priority: 'critical', dependencies: [], automatable: false, order: 1 },
  { category: 'hr', title: 'Complete W-4 tax withholding', description: 'Employee completes federal tax withholding form', priority: 'critical', dependencies: [], automatable: false, order: 2 },
  { category: 'hr', title: 'Complete state tax forms', description: 'Employee completes state tax withholding forms', priority: 'high', dependencies: [], automatable: false, order: 3 },
  { category: 'hr', title: 'Set up direct deposit', description: 'Configure payroll direct deposit information', priority: 'high', dependencies: [], automatable: false, order: 4 },
  { category: 'hr', title: 'Enroll in benefits', description: 'Complete benefits enrollment within 30-day window', priority: 'high', dependencies: [], automatable: false, order: 5 },
  { category: 'hr', title: 'Sign employee handbook acknowledgment', description: 'Review and sign employee handbook', priority: 'medium', dependencies: [], automatable: false, order: 6 },
  { category: 'hr', title: 'Complete emergency contact form', description: 'Provide emergency contact information', priority: 'medium', dependencies: [], automatable: false, order: 7 },
  
  // IT Tasks
  { category: 'it', title: 'Create user account', description: 'Create Active Directory/system user account', priority: 'critical', dependencies: [], automatable: true, order: 8 },
  { category: 'it', title: 'Assign email address', description: 'Create corporate email account', priority: 'critical', dependencies: ['Create user account'], automatable: true, order: 9 },
  { category: 'it', title: 'Provision laptop/workstation', description: 'Assign and configure computer equipment', priority: 'critical', dependencies: [], automatable: true, order: 10 },
  { category: 'it', title: 'Install required software', description: 'Install department-specific software applications', priority: 'high', dependencies: ['Provision laptop/workstation'], automatable: true, order: 11 },
  { category: 'it', title: 'Assign software licenses', description: 'Allocate software license seats', priority: 'high', dependencies: ['Create user account'], automatable: true, order: 12 },
  { category: 'it', title: 'Set up VPN access', description: 'Configure VPN for remote access', priority: 'medium', dependencies: ['Create user account'], automatable: true, order: 13 },
  { category: 'it', title: 'Configure phone/extension', description: 'Set up desk phone or softphone', priority: 'medium', dependencies: [], automatable: true, order: 14 },
  
  // Property/Facilities Tasks
  { category: 'property', title: 'Assign workspace/desk', description: 'Allocate physical workspace', priority: 'high', dependencies: [], automatable: false, order: 15 },
  { category: 'property', title: 'Issue building access badge', description: 'Create and program access badge', priority: 'critical', dependencies: [], automatable: true, order: 16 },
  { category: 'property', title: 'Assign parking permit', description: 'Issue parking permit if applicable', priority: 'low', dependencies: [], automatable: true, order: 17 },
  { category: 'property', title: 'Provide office supplies', description: 'Stock workspace with basic supplies', priority: 'low', dependencies: ['Assign workspace/desk'], automatable: false, order: 18 },
  
  // Finance Tasks
  { category: 'finance', title: 'Set up expense account', description: 'Create expense reimbursement account', priority: 'medium', dependencies: [], automatable: true, order: 19 },
  { category: 'finance', title: 'Issue corporate card', description: 'Issue corporate credit card if applicable', priority: 'low', dependencies: [], automatable: false, order: 20 },
  
  // Training Tasks
  { category: 'training', title: 'Complete security awareness training', description: 'Mandatory cybersecurity training', priority: 'critical', dependencies: ['Create user account'], automatable: false, order: 21 },
  { category: 'training', title: 'Complete harassment prevention training', description: 'Mandatory workplace training', priority: 'critical', dependencies: [], automatable: false, order: 22 },
  { category: 'training', title: 'Complete department orientation', description: 'Department-specific onboarding', priority: 'high', dependencies: [], automatable: false, order: 23 },
  { category: 'training', title: 'Review role-specific procedures', description: 'Learn position-specific processes', priority: 'medium', dependencies: [], automatable: false, order: 24 },
  
  // Security Tasks
  { category: 'security', title: 'Complete background check', description: 'Verify background check completion', priority: 'critical', dependencies: [], automatable: false, order: 25 },
  { category: 'security', title: 'Sign NDA/confidentiality agreement', description: 'Execute non-disclosure agreement', priority: 'high', dependencies: [], automatable: false, order: 26 },
  { category: 'security', title: 'Set up MFA', description: 'Configure multi-factor authentication', priority: 'critical', dependencies: ['Create user account'], automatable: true, order: 27 },
  
  // Admin Tasks
  { category: 'admin', title: 'Add to org chart', description: 'Update organizational chart', priority: 'medium', dependencies: [], automatable: true, order: 28 },
  { category: 'admin', title: 'Add to department distribution lists', description: 'Add to email distribution groups', priority: 'medium', dependencies: ['Assign email address'], automatable: true, order: 29 },
  { category: 'admin', title: 'Schedule meet-and-greet with team', description: 'Arrange introductions with team members', priority: 'medium', dependencies: [], automatable: false, order: 30 },
  { category: 'admin', title: 'Assign mentor/buddy', description: 'Pair with experienced team member', priority: 'low', dependencies: [], automatable: false, order: 31 },
];

// Default offboarding tasks
const defaultOffboardingTasks: Omit<OnboardingTask, 'id' | 'workflowId' | 'status' | 'completedAt' | 'completedBy' | 'automationResult'>[] = [
  // HR Tasks
  { category: 'hr', title: 'Process final paycheck', description: 'Calculate and process final compensation', priority: 'critical', dependencies: [], automatable: false, order: 1 },
  { category: 'hr', title: 'Calculate PTO payout', description: 'Calculate unused PTO for payout', priority: 'high', dependencies: [], automatable: true, order: 2 },
  { category: 'hr', title: 'Terminate benefits', description: 'End benefits coverage and provide COBRA info', priority: 'high', dependencies: [], automatable: false, order: 3 },
  { category: 'hr', title: 'Update employment records', description: 'Mark employee as terminated in HRIS', priority: 'critical', dependencies: [], automatable: true, order: 4 },
  { category: 'hr', title: 'Conduct exit interview', description: 'Schedule and conduct exit interview', priority: 'medium', dependencies: [], automatable: false, order: 5 },
  { category: 'hr', title: 'Provide separation letter', description: 'Issue formal separation documentation', priority: 'high', dependencies: [], automatable: false, order: 6 },
  
  // IT Tasks
  { category: 'it', title: 'Disable user account', description: 'Disable Active Directory/system access', priority: 'critical', dependencies: [], automatable: true, order: 7 },
  { category: 'it', title: 'Revoke email access', description: 'Disable email account and set up forwarding', priority: 'critical', dependencies: [], automatable: true, order: 8 },
  { category: 'it', title: 'Revoke software licenses', description: 'Remove software license assignments', priority: 'high', dependencies: [], automatable: true, order: 9 },
  { category: 'it', title: 'Collect laptop/equipment', description: 'Retrieve all IT equipment', priority: 'critical', dependencies: [], automatable: false, order: 10 },
  { category: 'it', title: 'Backup user data', description: 'Archive user files and emails', priority: 'high', dependencies: [], automatable: true, order: 11 },
  { category: 'it', title: 'Revoke VPN access', description: 'Disable remote access', priority: 'critical', dependencies: [], automatable: true, order: 12 },
  { category: 'it', title: 'Remove from shared drives', description: 'Revoke access to shared resources', priority: 'high', dependencies: [], automatable: true, order: 13 },
  
  // Property/Facilities Tasks
  { category: 'property', title: 'Collect building access badge', description: 'Retrieve and deactivate access badge', priority: 'critical', dependencies: [], automatable: false, order: 14 },
  { category: 'property', title: 'Collect keys', description: 'Retrieve all keys issued', priority: 'high', dependencies: [], automatable: false, order: 15 },
  { category: 'property', title: 'Cancel parking permit', description: 'Deactivate parking access', priority: 'low', dependencies: [], automatable: true, order: 16 },
  { category: 'property', title: 'Clear workspace', description: 'Ensure workspace is cleared of personal items', priority: 'medium', dependencies: [], automatable: false, order: 17 },
  
  // Finance Tasks
  { category: 'finance', title: 'Collect corporate card', description: 'Retrieve and cancel corporate credit card', priority: 'high', dependencies: [], automatable: false, order: 18 },
  { category: 'finance', title: 'Process expense reports', description: 'Submit and process any outstanding expenses', priority: 'medium', dependencies: [], automatable: false, order: 19 },
  { category: 'finance', title: 'Close expense account', description: 'Deactivate expense reimbursement account', priority: 'medium', dependencies: ['Process expense reports'], automatable: true, order: 20 },
  
  // Security Tasks
  { category: 'security', title: 'Revoke system access', description: 'Remove access to all internal systems', priority: 'critical', dependencies: [], automatable: true, order: 21 },
  { category: 'security', title: 'Revoke building access', description: 'Deactivate all physical access', priority: 'critical', dependencies: [], automatable: true, order: 22 },
  { category: 'security', title: 'Review NDA obligations', description: 'Remind of ongoing confidentiality obligations', priority: 'high', dependencies: [], automatable: false, order: 23 },
  
  // Admin Tasks
  { category: 'admin', title: 'Remove from org chart', description: 'Update organizational chart', priority: 'medium', dependencies: [], automatable: true, order: 24 },
  { category: 'admin', title: 'Remove from distribution lists', description: 'Remove from email groups', priority: 'medium', dependencies: [], automatable: true, order: 25 },
  { category: 'admin', title: 'Transfer knowledge', description: 'Document and transfer critical knowledge', priority: 'high', dependencies: [], automatable: false, order: 26 },
  { category: 'admin', title: 'Reassign responsibilities', description: 'Transfer ongoing responsibilities', priority: 'high', dependencies: [], automatable: false, order: 27 },
  { category: 'admin', title: 'Update team documentation', description: 'Update team rosters and documentation', priority: 'low', dependencies: [], automatable: false, order: 28 },
];

// Helper functions
function generateId(): string {
  return crypto.randomUUID();
}

// Onboarding Functions
export function createOnboardingWorkflow(params: {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  positionId: string;
  positionTitle: string;
  departmentId: string;
  departmentName: string;
  entityId: string;
  entityName: string;
  hireDate: Date;
  startDate: Date;
  managerId?: string;
  managerName?: string;
  hrContactId?: string;
  hrContactName?: string;
  templateId?: string;
  notes?: string;
}): OnboardingWorkflow {
  const workflowId = generateId();
  
  // Get template tasks or use defaults
  let taskTemplates = defaultOnboardingTasks;
  if (params.templateId) {
    const template = onboardingTemplates.get(params.templateId);
    if (template) {
      taskTemplates = template.tasks;
    }
  }
  
  // Create tasks from template
  const tasks: OnboardingTask[] = taskTemplates.map((task, index) => ({
    ...task,
    id: generateId(),
    workflowId,
    status: 'pending' as TaskStatus,
    dueDate: new Date(params.startDate.getTime() + (task.order * 24 * 60 * 60 * 1000)), // Stagger due dates
  }));
  
  const workflow: OnboardingWorkflow = {
    id: workflowId,
    employeeId: params.employeeId,
    employeeName: params.employeeName,
    employeeEmail: params.employeeEmail,
    positionId: params.positionId,
    positionTitle: params.positionTitle,
    departmentId: params.departmentId,
    departmentName: params.departmentName,
    entityId: params.entityId,
    entityName: params.entityName,
    hireDate: params.hireDate,
    startDate: params.startDate,
    status: 'pending',
    tasks,
    createdAt: new Date(),
    updatedAt: new Date(),
    managerId: params.managerId,
    managerName: params.managerName,
    hrContactId: params.hrContactId,
    hrContactName: params.hrContactName,
    notes: params.notes,
  };
  
  onboardingWorkflows.set(workflowId, workflow);
  return workflow;
}

export function startOnboardingWorkflow(workflowId: string): OnboardingWorkflow {
  const workflow = onboardingWorkflows.get(workflowId);
  if (!workflow) {
    throw new Error(`Onboarding workflow ${workflowId} not found`);
  }
  
  workflow.status = 'in_progress';
  workflow.updatedAt = new Date();
  
  // Start tasks with no dependencies
  workflow.tasks.forEach(task => {
    if (task.dependencies.length === 0) {
      task.status = 'in_progress';
    }
  });
  
  onboardingWorkflows.set(workflowId, workflow);
  return workflow;
}

export function completeOnboardingTask(workflowId: string, taskId: string, completedBy: string, notes?: string): OnboardingWorkflow {
  const workflow = onboardingWorkflows.get(workflowId);
  if (!workflow) {
    throw new Error(`Onboarding workflow ${workflowId} not found`);
  }
  
  const task = workflow.tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found in workflow`);
  }
  
  task.status = 'completed';
  task.completedAt = new Date();
  task.completedBy = completedBy;
  if (notes) task.notes = notes;
  
  // Check if dependent tasks can now start
  workflow.tasks.forEach(t => {
    if (t.status === 'pending' && t.dependencies.includes(task.title)) {
      const allDepsComplete = t.dependencies.every(dep => 
        workflow.tasks.find(dt => dt.title === dep)?.status === 'completed'
      );
      if (allDepsComplete) {
        t.status = 'in_progress';
      }
    }
  });
  
  // Check if all tasks are complete
  const allComplete = workflow.tasks.every(t => t.status === 'completed' || t.status === 'skipped');
  if (allComplete) {
    workflow.status = 'completed';
    workflow.completedAt = new Date();
  }
  
  workflow.updatedAt = new Date();
  onboardingWorkflows.set(workflowId, workflow);
  return workflow;
}

export function skipOnboardingTask(workflowId: string, taskId: string, reason: string): OnboardingWorkflow {
  const workflow = onboardingWorkflows.get(workflowId);
  if (!workflow) {
    throw new Error(`Onboarding workflow ${workflowId} not found`);
  }
  
  const task = workflow.tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found in workflow`);
  }
  
  task.status = 'skipped';
  task.notes = reason;
  
  workflow.updatedAt = new Date();
  onboardingWorkflows.set(workflowId, workflow);
  return workflow;
}

export function runAutomatedOnboardingTasks(workflowId: string): { tasksRun: number; tasksSucceeded: number; tasksFailed: number } {
  const workflow = onboardingWorkflows.get(workflowId);
  if (!workflow) {
    throw new Error(`Onboarding workflow ${workflowId} not found`);
  }
  
  let tasksRun = 0;
  let tasksSucceeded = 0;
  let tasksFailed = 0;
  
  workflow.tasks.forEach(task => {
    if (task.automatable && task.status === 'in_progress') {
      tasksRun++;
      
      // Simulate automation (in real implementation, this would call actual provisioning APIs)
      const success = Math.random() > 0.1; // 90% success rate for simulation
      
      task.automationResult = {
        success,
        message: success ? 'Task completed automatically' : 'Automation failed - manual intervention required',
        timestamp: new Date(),
      };
      
      if (success) {
        task.status = 'completed';
        task.completedAt = new Date();
        task.completedBy = 'SYSTEM';
        tasksSucceeded++;
      } else {
        tasksFailed++;
      }
    }
  });
  
  workflow.updatedAt = new Date();
  onboardingWorkflows.set(workflowId, workflow);
  
  return { tasksRun, tasksSucceeded, tasksFailed };
}

// Offboarding Functions
export function createOffboardingWorkflow(params: {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  positionId: string;
  positionTitle: string;
  departmentId: string;
  departmentName: string;
  entityId: string;
  entityName: string;
  terminationDate: Date;
  lastWorkingDay: Date;
  terminationType: OffboardingWorkflow['terminationType'];
  managerId?: string;
  managerName?: string;
  hrContactId?: string;
  hrContactName?: string;
  templateId?: string;
  notes?: string;
}): OffboardingWorkflow {
  const workflowId = generateId();
  
  // Get template tasks or use defaults
  let taskTemplates = defaultOffboardingTasks;
  if (params.templateId) {
    const template = offboardingTemplates.get(params.templateId);
    if (template) {
      taskTemplates = template.tasks;
    }
  }
  
  // Create tasks from template
  const tasks: OnboardingTask[] = taskTemplates.map((task) => ({
    ...task,
    id: generateId(),
    workflowId,
    status: 'pending' as TaskStatus,
    dueDate: params.lastWorkingDay,
  }));
  
  const workflow: OffboardingWorkflow = {
    id: workflowId,
    employeeId: params.employeeId,
    employeeName: params.employeeName,
    employeeEmail: params.employeeEmail,
    positionId: params.positionId,
    positionTitle: params.positionTitle,
    departmentId: params.departmentId,
    departmentName: params.departmentName,
    entityId: params.entityId,
    entityName: params.entityName,
    terminationDate: params.terminationDate,
    lastWorkingDay: params.lastWorkingDay,
    terminationType: params.terminationType,
    status: 'pending',
    tasks,
    createdAt: new Date(),
    updatedAt: new Date(),
    managerId: params.managerId,
    managerName: params.managerName,
    hrContactId: params.hrContactId,
    hrContactName: params.hrContactName,
    exitInterviewScheduled: false,
    exitInterviewCompleted: false,
    notes: params.notes,
  };
  
  offboardingWorkflows.set(workflowId, workflow);
  return workflow;
}

export function startOffboardingWorkflow(workflowId: string): OffboardingWorkflow {
  const workflow = offboardingWorkflows.get(workflowId);
  if (!workflow) {
    throw new Error(`Offboarding workflow ${workflowId} not found`);
  }
  
  workflow.status = 'in_progress';
  workflow.updatedAt = new Date();
  
  // Start all tasks (offboarding tasks typically run in parallel)
  workflow.tasks.forEach(task => {
    if (task.dependencies.length === 0) {
      task.status = 'in_progress';
    }
  });
  
  offboardingWorkflows.set(workflowId, workflow);
  return workflow;
}

export function completeOffboardingTask(workflowId: string, taskId: string, completedBy: string, notes?: string): OffboardingWorkflow {
  const workflow = offboardingWorkflows.get(workflowId);
  if (!workflow) {
    throw new Error(`Offboarding workflow ${workflowId} not found`);
  }
  
  const task = workflow.tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found in workflow`);
  }
  
  task.status = 'completed';
  task.completedAt = new Date();
  task.completedBy = completedBy;
  if (notes) task.notes = notes;
  
  // Check if dependent tasks can now start
  workflow.tasks.forEach(t => {
    if (t.status === 'pending' && t.dependencies.includes(task.title)) {
      const allDepsComplete = t.dependencies.every(dep => 
        workflow.tasks.find(dt => dt.title === dep)?.status === 'completed'
      );
      if (allDepsComplete) {
        t.status = 'in_progress';
      }
    }
  });
  
  // Check if all tasks are complete
  const allComplete = workflow.tasks.every(t => t.status === 'completed' || t.status === 'skipped');
  if (allComplete) {
    workflow.status = 'completed';
    workflow.completedAt = new Date();
  }
  
  workflow.updatedAt = new Date();
  offboardingWorkflows.set(workflowId, workflow);
  return workflow;
}

export function runAutomatedOffboardingTasks(workflowId: string): { tasksRun: number; tasksSucceeded: number; tasksFailed: number } {
  const workflow = offboardingWorkflows.get(workflowId);
  if (!workflow) {
    throw new Error(`Offboarding workflow ${workflowId} not found`);
  }
  
  let tasksRun = 0;
  let tasksSucceeded = 0;
  let tasksFailed = 0;
  
  workflow.tasks.forEach(task => {
    if (task.automatable && task.status === 'in_progress') {
      tasksRun++;
      
      // Simulate automation
      const success = Math.random() > 0.05; // 95% success rate for offboarding (more critical)
      
      task.automationResult = {
        success,
        message: success ? 'Access revoked automatically' : 'Automation failed - manual intervention required',
        timestamp: new Date(),
      };
      
      if (success) {
        task.status = 'completed';
        task.completedAt = new Date();
        task.completedBy = 'SYSTEM';
        tasksSucceeded++;
      } else {
        tasksFailed++;
      }
    }
  });
  
  workflow.updatedAt = new Date();
  offboardingWorkflows.set(workflowId, workflow);
  
  return { tasksRun, tasksSucceeded, tasksFailed };
}

export function scheduleExitInterview(workflowId: string, scheduledDate: Date): OffboardingWorkflow {
  const workflow = offboardingWorkflows.get(workflowId);
  if (!workflow) {
    throw new Error(`Offboarding workflow ${workflowId} not found`);
  }
  
  workflow.exitInterviewScheduled = true;
  workflow.updatedAt = new Date();
  
  // Update the exit interview task
  const exitTask = workflow.tasks.find(t => t.title.includes('exit interview'));
  if (exitTask) {
    exitTask.dueDate = scheduledDate;
    exitTask.status = 'in_progress';
  }
  
  offboardingWorkflows.set(workflowId, workflow);
  return workflow;
}

export function completeExitInterview(workflowId: string, notes: string): OffboardingWorkflow {
  const workflow = offboardingWorkflows.get(workflowId);
  if (!workflow) {
    throw new Error(`Offboarding workflow ${workflowId} not found`);
  }
  
  workflow.exitInterviewCompleted = true;
  workflow.updatedAt = new Date();
  
  // Complete the exit interview task
  const exitTask = workflow.tasks.find(t => t.title.includes('exit interview'));
  if (exitTask) {
    exitTask.status = 'completed';
    exitTask.completedAt = new Date();
    exitTask.notes = notes;
  }
  
  offboardingWorkflows.set(workflowId, workflow);
  return workflow;
}

// Equipment Provisioning
export function provisionEquipment(workflowId: string, equipment: Omit<EquipmentProvision, 'returnedDate'>): EquipmentProvision {
  const provisions = equipmentProvisions.get(workflowId) || [];
  provisions.push(equipment);
  equipmentProvisions.set(workflowId, provisions);
  return equipment;
}

export function returnEquipment(workflowId: string, assetId: string, condition: EquipmentProvision['condition']): EquipmentProvision | null {
  const provisions = equipmentProvisions.get(workflowId);
  if (!provisions) return null;
  
  const equipment = provisions.find(e => e.assetId === assetId);
  if (equipment) {
    equipment.returnedDate = new Date();
    equipment.condition = condition;
    equipmentProvisions.set(workflowId, provisions);
  }
  return equipment || null;
}

export function getEmployeeEquipment(workflowId: string): EquipmentProvision[] {
  return equipmentProvisions.get(workflowId) || [];
}

// Software License Provisioning
export function provisionSoftwareLicense(workflowId: string, license: Omit<SoftwareLicenseProvision, 'revokedDate'>): SoftwareLicenseProvision {
  const provisions = softwareProvisions.get(workflowId) || [];
  provisions.push(license);
  softwareProvisions.set(workflowId, provisions);
  return license;
}

export function revokeSoftwareLicense(workflowId: string, licenseId: string): SoftwareLicenseProvision | null {
  const provisions = softwareProvisions.get(workflowId);
  if (!provisions) return null;
  
  const license = provisions.find(l => l.licenseId === licenseId);
  if (license) {
    license.revokedDate = new Date();
    softwareProvisions.set(workflowId, provisions);
  }
  return license || null;
}

export function getEmployeeLicenses(workflowId: string): SoftwareLicenseProvision[] {
  return softwareProvisions.get(workflowId) || [];
}

// Access Provisioning
export function provisionAccess(workflowId: string, access: Omit<AccessProvision, 'revokedDate'>): AccessProvision {
  const provisions = accessProvisions.get(workflowId) || [];
  provisions.push(access);
  accessProvisions.set(workflowId, provisions);
  return access;
}

export function revokeAccess(workflowId: string, accessId: string): AccessProvision | null {
  const provisions = accessProvisions.get(workflowId);
  if (!provisions) return null;
  
  const access = provisions.find(a => a.accessId === accessId);
  if (access) {
    access.revokedDate = new Date();
    accessProvisions.set(workflowId, provisions);
  }
  return access || null;
}

export function revokeAllAccess(workflowId: string): AccessProvision[] {
  const provisions = accessProvisions.get(workflowId) || [];
  provisions.forEach(access => {
    if (!access.revokedDate) {
      access.revokedDate = new Date();
    }
  });
  accessProvisions.set(workflowId, provisions);
  return provisions;
}

export function getEmployeeAccess(workflowId: string): AccessProvision[] {
  return accessProvisions.get(workflowId) || [];
}

// Query Functions
export function getOnboardingWorkflow(workflowId: string): OnboardingWorkflow | null {
  return onboardingWorkflows.get(workflowId) || null;
}

export function getOffboardingWorkflow(workflowId: string): OffboardingWorkflow | null {
  return offboardingWorkflows.get(workflowId) || null;
}

export function listOnboardingWorkflows(filters?: {
  status?: OnboardingStatus;
  entityId?: string;
  departmentId?: string;
}): OnboardingWorkflow[] {
  let workflows = Array.from(onboardingWorkflows.values());
  
  if (filters?.status) {
    workflows = workflows.filter(w => w.status === filters.status);
  }
  if (filters?.entityId) {
    workflows = workflows.filter(w => w.entityId === filters.entityId);
  }
  if (filters?.departmentId) {
    workflows = workflows.filter(w => w.departmentId === filters.departmentId);
  }
  
  return workflows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function listOffboardingWorkflows(filters?: {
  status?: OffboardingStatus;
  entityId?: string;
  departmentId?: string;
  terminationType?: OffboardingWorkflow['terminationType'];
}): OffboardingWorkflow[] {
  let workflows = Array.from(offboardingWorkflows.values());
  
  if (filters?.status) {
    workflows = workflows.filter(w => w.status === filters.status);
  }
  if (filters?.entityId) {
    workflows = workflows.filter(w => w.entityId === filters.entityId);
  }
  if (filters?.departmentId) {
    workflows = workflows.filter(w => w.departmentId === filters.departmentId);
  }
  if (filters?.terminationType) {
    workflows = workflows.filter(w => w.terminationType === filters.terminationType);
  }
  
  return workflows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Dashboard Statistics
export function getOnboardingStats(): {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  avgCompletionDays: number;
  taskCompletionRate: number;
} {
  const workflows = Array.from(onboardingWorkflows.values());
  
  const total = workflows.length;
  const pending = workflows.filter(w => w.status === 'pending').length;
  const inProgress = workflows.filter(w => w.status === 'in_progress').length;
  const completed = workflows.filter(w => w.status === 'completed').length;
  
  // Calculate average completion time
  const completedWorkflows = workflows.filter(w => w.completedAt);
  const avgCompletionDays = completedWorkflows.length > 0
    ? completedWorkflows.reduce((sum, w) => sum + ((w.completedAt!.getTime() - w.startDate.getTime()) / (1000 * 60 * 60 * 24)), 0) / completedWorkflows.length
    : 0;
  
  // Calculate task completion rate
  const allTasks = workflows.flatMap(w => w.tasks);
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0;
  
  return { total, pending, inProgress, completed, avgCompletionDays, taskCompletionRate };
}

export function getOffboardingStats(): {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  byTerminationType: Record<string, number>;
  exitInterviewRate: number;
} {
  const workflows = Array.from(offboardingWorkflows.values());
  
  const total = workflows.length;
  const pending = workflows.filter(w => w.status === 'pending').length;
  const inProgress = workflows.filter(w => w.status === 'in_progress').length;
  const completed = workflows.filter(w => w.status === 'completed').length;
  
  // Count by termination type
  const byTerminationType: Record<string, number> = {};
  workflows.forEach(w => {
    byTerminationType[w.terminationType] = (byTerminationType[w.terminationType] || 0) + 1;
  });
  
  // Exit interview completion rate
  const completedWorkflows = workflows.filter(w => w.status === 'completed');
  const exitInterviewRate = completedWorkflows.length > 0
    ? (completedWorkflows.filter(w => w.exitInterviewCompleted).length / completedWorkflows.length) * 100
    : 0;
  
  return { total, pending, inProgress, completed, byTerminationType, exitInterviewRate };
}

// Template Management
export function createOnboardingTemplate(template: Omit<OnboardingTemplate, 'id' | 'createdAt' | 'updatedAt'>): OnboardingTemplate {
  const id = generateId();
  const newTemplate: OnboardingTemplate = {
    ...template,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  onboardingTemplates.set(id, newTemplate);
  return newTemplate;
}

export function createOffboardingTemplate(template: Omit<OffboardingTemplate, 'id' | 'createdAt' | 'updatedAt'>): OffboardingTemplate {
  const id = generateId();
  const newTemplate: OffboardingTemplate = {
    ...template,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  offboardingTemplates.set(id, newTemplate);
  return newTemplate;
}

export function listOnboardingTemplates(): OnboardingTemplate[] {
  return Array.from(onboardingTemplates.values());
}

export function listOffboardingTemplates(): OffboardingTemplate[] {
  return Array.from(offboardingTemplates.values());
}

export function getDefaultOnboardingTasks(): typeof defaultOnboardingTasks {
  return defaultOnboardingTasks;
}

export function getDefaultOffboardingTasks(): typeof defaultOffboardingTasks {
  return defaultOffboardingTasks;
}

// Clear functions for testing
export function clearAllData(): void {
  onboardingWorkflows.clear();
  offboardingWorkflows.clear();
  onboardingTemplates.clear();
  offboardingTemplates.clear();
  equipmentProvisions.clear();
  softwareProvisions.clear();
  accessProvisions.clear();
}
