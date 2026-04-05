// Workflow Automation Builder Service
// Visual workflow builder for creating automated sequences

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  executionCount: number;
}

export interface WorkflowTrigger {
  type: TriggerType;
  config: Record<string, any>;
}

export type TriggerType = 
  | 'document_signed'
  | 'task_completed'
  | 'form_submitted'
  | 'status_changed'
  | 'date_reached'
  | 'manual'
  | 'webhook'
  | 'new_user'
  | 'payment_received';

export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  nextSteps: string[];
  conditions?: StepCondition[];
}

export type StepType = 
  | 'send_notification'
  | 'send_email'
  | 'create_task'
  | 'update_status'
  | 'assign_user'
  | 'wait_delay'
  | 'condition'
  | 'webhook_call'
  | 'create_document'
  | 'approval_request';

export interface StepCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
  nextStepId: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  triggeredAt: Date;
  completedAt?: Date;
  currentStep?: string;
  stepsCompleted: string[];
  error?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: WorkflowTrigger;
  steps: Omit<WorkflowStep, 'id'>[];
}

class WorkflowBuilderService {
  private readonly WORKFLOWS_KEY = 'workflows';
  private readonly EXECUTIONS_KEY = 'workflow_executions';

  // Workflow CRUD
  createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>): Workflow {
    const workflows = this.getWorkflows();
    const newWorkflow: Workflow = {
      ...workflow,
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0
    };
    workflows.push(newWorkflow);
    this.saveWorkflows(workflows);
    return newWorkflow;
  }

  getWorkflows(): Workflow[] {
    const stored = localStorage.getItem(this.WORKFLOWS_KEY);
    if (stored) {
      return JSON.parse(stored).map((w: any) => ({
        ...w,
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt),
        lastTriggered: w.lastTriggered ? new Date(w.lastTriggered) : undefined
      }));
    }
    return this.getDefaultWorkflows();
  }

  getWorkflow(id: string): Workflow | null {
    return this.getWorkflows().find(w => w.id === id) || null;
  }

  updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | null {
    const workflows = this.getWorkflows();
    const index = workflows.findIndex(w => w.id === id);
    if (index === -1) return null;

    workflows[index] = {
      ...workflows[index],
      ...updates,
      updatedAt: new Date()
    };
    this.saveWorkflows(workflows);
    return workflows[index];
  }

  deleteWorkflow(id: string): boolean {
    const workflows = this.getWorkflows();
    const filtered = workflows.filter(w => w.id !== id);
    if (filtered.length === workflows.length) return false;
    this.saveWorkflows(filtered);
    return true;
  }

  toggleWorkflow(id: string): Workflow | null {
    const workflow = this.getWorkflow(id);
    if (!workflow) return null;
    return this.updateWorkflow(id, { isActive: !workflow.isActive });
  }

  // Workflow Execution
  executeWorkflow(workflowId: string): WorkflowExecution {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      workflowName: workflow.name,
      status: 'running',
      triggeredAt: new Date(),
      stepsCompleted: []
    };

    const executions = this.getExecutions();
    executions.unshift(execution);
    this.saveExecutions(executions);

    // Simulate execution
    this.simulateExecution(execution.id, workflow);

    // Update workflow stats
    this.updateWorkflow(workflowId, {
      lastTriggered: new Date(),
      executionCount: workflow.executionCount + 1
    });

    return execution;
  }

  getExecutions(): WorkflowExecution[] {
    const stored = localStorage.getItem(this.EXECUTIONS_KEY);
    if (stored) {
      return JSON.parse(stored).map((e: any) => ({
        ...e,
        triggeredAt: new Date(e.triggeredAt),
        completedAt: e.completedAt ? new Date(e.completedAt) : undefined
      }));
    }
    return [];
  }

  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return this.getExecutions().filter(e => e.workflowId === workflowId);
  }

  // Step Management
  addStep(workflowId: string, step: Omit<WorkflowStep, 'id'>): WorkflowStep | null {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return null;

    const newStep: WorkflowStep = {
      ...step,
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    workflow.steps.push(newStep);
    this.updateWorkflow(workflowId, { steps: workflow.steps });
    return newStep;
  }

  updateStep(workflowId: string, stepId: string, updates: Partial<WorkflowStep>): boolean {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return false;

    const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return false;

    workflow.steps[stepIndex] = { ...workflow.steps[stepIndex], ...updates };
    this.updateWorkflow(workflowId, { steps: workflow.steps });
    return true;
  }

  removeStep(workflowId: string, stepId: string): boolean {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return false;

    workflow.steps = workflow.steps.filter(s => s.id !== stepId);
    // Remove references to deleted step
    workflow.steps.forEach(s => {
      s.nextSteps = s.nextSteps.filter(id => id !== stepId);
    });

    this.updateWorkflow(workflowId, { steps: workflow.steps });
    return true;
  }

  connectSteps(workflowId: string, fromStepId: string, toStepId: string): boolean {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return false;

    const fromStep = workflow.steps.find(s => s.id === fromStepId);
    if (!fromStep) return false;

    if (!fromStep.nextSteps.includes(toStepId)) {
      fromStep.nextSteps.push(toStepId);
      this.updateWorkflow(workflowId, { steps: workflow.steps });
    }
    return true;
  }

  // Templates
  getTemplates(): WorkflowTemplate[] {
    return [
      {
        id: 'tpl_contract_signed',
        name: 'Contract Signed Workflow',
        description: 'Notify team and create follow-up tasks when a contract is signed',
        category: 'Documents',
        trigger: { type: 'document_signed', config: { documentType: 'contract' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Notify Finance Team',
            config: { recipients: ['finance'], message: 'New contract signed' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Create Onboarding Task',
            config: { title: 'Client onboarding', assignTo: 'operations' },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'update_status',
            name: 'Update Contract Status',
            config: { status: 'active' },
            position: { x: 100, y: 300 },
            nextSteps: []
          }
        ]
      },
      {
        id: 'tpl_new_user',
        name: 'New User Onboarding',
        description: 'Welcome new users and assign onboarding tasks',
        category: 'Users',
        trigger: { type: 'new_user', config: {} },
        steps: [
          {
            type: 'send_email',
            name: 'Send Welcome Email',
            config: { template: 'welcome', subject: 'Welcome to the platform!' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Assign Training Tasks',
            config: { title: 'Complete onboarding training', dueInDays: 7 },
            position: { x: 100, y: 200 },
            nextSteps: []
          }
        ]
      },
      {
        id: 'tpl_approval',
        name: 'Approval Workflow',
        description: 'Route items for approval with escalation',
        category: 'Approvals',
        trigger: { type: 'form_submitted', config: { formType: 'approval_request' } },
        steps: [
          {
            type: 'approval_request',
            name: 'Request Manager Approval',
            config: { approver: 'manager', timeout: 48 },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'condition',
            name: 'Check Approval Status',
            config: {},
            position: { x: 100, y: 200 },
            nextSteps: [],
            conditions: [
              { field: 'approved', operator: 'equals', value: true, nextStepId: 'approved' },
              { field: 'approved', operator: 'equals', value: false, nextStepId: 'rejected' }
            ]
          }
        ]
      },
      {
        id: 'tpl_payment',
        name: 'Payment Received',
        description: 'Process payment and update records',
        category: 'Finance',
        trigger: { type: 'payment_received', config: {} },
        steps: [
          {
            type: 'send_notification',
            name: 'Notify Accounting',
            config: { recipients: ['accounting'], message: 'Payment received' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'update_status',
            name: 'Update Invoice Status',
            config: { status: 'paid' },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'send_email',
            name: 'Send Receipt',
            config: { template: 'receipt' },
            position: { x: 100, y: 300 },
            nextSteps: []
          }
        ]
      }
    ];
  }

  createFromTemplate(templateId: string, userId: string): Workflow | null {
    const template = this.getTemplates().find(t => t.id === templateId);
    if (!template) return null;

    return this.createWorkflow({
      name: template.name,
      description: template.description,
      trigger: template.trigger,
      steps: template.steps.map(s => ({
        ...s,
        id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })),
      isActive: false,
      createdBy: userId
    });
  }

  // Statistics
  getStats(): {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    mostUsedTrigger: TriggerType | null;
  } {
    const workflows = this.getWorkflows();
    const executions = this.getExecutions();
    
    const triggerCounts: Map<TriggerType, number> = new Map();
    workflows.forEach(w => {
      const count = triggerCounts.get(w.trigger.type) || 0;
      triggerCounts.set(w.trigger.type, count + 1);
    });

    let mostUsedTrigger: TriggerType | null = null;
    let maxCount = 0;
    triggerCounts.forEach((count, trigger) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedTrigger = trigger;
      }
    });

    const completedExecutions = executions.filter(e => e.status === 'completed').length;
    const failedExecutions = executions.filter(e => e.status === 'failed').length;

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.isActive).length,
      totalExecutions: executions.length,
      successRate: executions.length > 0 
        ? (completedExecutions / (completedExecutions + failedExecutions)) * 100 
        : 100,
      mostUsedTrigger
    };
  }

  // Private helpers
  private saveWorkflows(workflows: Workflow[]): void {
    localStorage.setItem(this.WORKFLOWS_KEY, JSON.stringify(workflows));
  }

  private saveExecutions(executions: WorkflowExecution[]): void {
    localStorage.setItem(this.EXECUTIONS_KEY, JSON.stringify(executions.slice(0, 100)));
  }

  private simulateExecution(executionId: string, workflow: Workflow): void {
    let stepIndex = 0;
    const executeStep = () => {
      const executions = this.getExecutions();
      const execution = executions.find(e => e.id === executionId);
      if (!execution || stepIndex >= workflow.steps.length) {
        if (execution) {
          execution.status = 'completed';
          execution.completedAt = new Date();
          this.saveExecutions(executions);
        }
        return;
      }

      const step = workflow.steps[stepIndex];
      execution.currentStep = step.id;
      execution.stepsCompleted.push(step.id);
      this.saveExecutions(executions);

      stepIndex++;
      setTimeout(executeStep, 500);
    };

    setTimeout(executeStep, 500);
  }

  private getDefaultWorkflows(): Workflow[] {
    const defaults: Workflow[] = [
      {
        id: 'wf_default_1',
        name: 'Document Approval Flow',
        description: 'Route documents for approval when uploaded',
        trigger: { type: 'document_signed', config: {} },
        steps: [
          {
            id: 'step_1',
            type: 'send_notification',
            name: 'Notify Approvers',
            config: { recipients: ['managers'] },
            position: { x: 100, y: 100 },
            nextSteps: ['step_2']
          },
          {
            id: 'step_2',
            type: 'approval_request',
            name: 'Request Approval',
            config: { timeout: 72 },
            position: { x: 100, y: 200 },
            nextSteps: []
          }
        ],
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        executionCount: 0
      }
    ];
    this.saveWorkflows(defaults);
    return defaults;
  }
}

export const workflowBuilderService = new WorkflowBuilderService();
