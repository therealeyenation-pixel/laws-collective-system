// Workflow Templates Library Service
// Pre-built workflow templates for common business processes

import { WorkflowTemplate, TriggerType, StepType } from './workflowBuilderService';

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templateCount: number;
}

export interface TemplateUsage {
  templateId: string;
  usedAt: Date;
  userId: string;
  workflowId: string;
}

export interface TemplateRating {
  templateId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface ExtendedWorkflowTemplate extends WorkflowTemplate {
  icon: string;
  estimatedTime: string;
  complexity: 'simple' | 'moderate' | 'complex';
  tags: string[];
  usageCount: number;
  rating: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class WorkflowTemplatesService {
  private readonly USAGE_KEY = 'workflow_template_usage';
  private readonly RATINGS_KEY = 'workflow_template_ratings';

  // Get all template categories
  getCategories(): TemplateCategory[] {
    return [
      {
        id: 'documents',
        name: 'Document Management',
        description: 'Templates for document approval, review, and processing',
        icon: 'FileText',
        templateCount: 3
      },
      {
        id: 'hr',
        name: 'Human Resources',
        description: 'Employee onboarding, leave requests, and HR processes',
        icon: 'Users',
        templateCount: 3
      },
      {
        id: 'finance',
        name: 'Finance & Accounting',
        description: 'Expense reports, invoicing, and financial workflows',
        icon: 'DollarSign',
        templateCount: 2
      },
      {
        id: 'compliance',
        name: 'Compliance & Legal',
        description: 'Contract review, compliance checks, and legal processes',
        icon: 'Shield',
        templateCount: 2
      },
      {
        id: 'grants',
        name: 'Grants & Funding',
        description: 'Grant applications, reporting, and fund management',
        icon: 'Award',
        templateCount: 2
      },
      {
        id: 'operations',
        name: 'Operations',
        description: 'General operational workflows and task management',
        icon: 'Settings',
        templateCount: 2
      }
    ];
  }

  // Get all templates
  getTemplates(): ExtendedWorkflowTemplate[] {
    const templates: ExtendedWorkflowTemplate[] = [
      // Document Management Templates
      {
        id: 'tpl_doc_approval',
        name: 'Document Approval Workflow',
        description: 'Route documents through a multi-level approval process with automatic notifications and escalation',
        category: 'documents',
        icon: 'FileCheck',
        estimatedTime: '2-5 days',
        complexity: 'moderate',
        tags: ['approval', 'documents', 'review'],
        usageCount: 245,
        rating: 4.8,
        featured: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-06-01'),
        trigger: { type: 'form_submitted', config: { formType: 'document_approval' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Notify Document Owner',
            config: { message: 'Your document has been submitted for approval' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'approval_request',
            name: 'Manager Approval',
            config: { approver: 'manager', timeout: 48, escalateTo: 'director' },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'condition',
            name: 'Check Approval Result',
            config: {},
            position: { x: 100, y: 300 },
            nextSteps: [],
            conditions: [
              { field: 'approved', operator: 'equals', value: true, nextStepId: 'approved_path' },
              { field: 'approved', operator: 'equals', value: false, nextStepId: 'rejected_path' }
            ]
          },
          {
            type: 'update_status',
            name: 'Mark as Approved',
            config: { status: 'approved' },
            position: { x: 50, y: 400 },
            nextSteps: []
          },
          {
            type: 'send_email',
            name: 'Send Approval Notification',
            config: { template: 'document_approved', subject: 'Your document has been approved' },
            position: { x: 50, y: 500 },
            nextSteps: []
          },
          {
            type: 'send_email',
            name: 'Send Rejection Notification',
            config: { template: 'document_rejected', subject: 'Your document requires revision' },
            position: { x: 150, y: 400 },
            nextSteps: []
          }
        ]
      },
      {
        id: 'tpl_doc_review',
        name: 'Document Review Cycle',
        description: 'Periodic document review with automatic reminders and compliance tracking',
        category: 'documents',
        icon: 'FileSearch',
        estimatedTime: '1-2 weeks',
        complexity: 'simple',
        tags: ['review', 'compliance', 'periodic'],
        usageCount: 156,
        rating: 4.5,
        featured: false,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-05-15'),
        trigger: { type: 'date_reached', config: { frequency: 'quarterly' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Notify Document Owners',
            config: { message: 'Document review period has started' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Create Review Tasks',
            config: { title: 'Review assigned documents', dueInDays: 14 },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'wait_delay',
            name: 'Wait for Review Period',
            config: { days: 7 },
            position: { x: 100, y: 300 },
            nextSteps: []
          },
          {
            type: 'send_notification',
            name: 'Send Reminder',
            config: { message: 'Document review deadline approaching' },
            position: { x: 100, y: 400 },
            nextSteps: []
          }
        ]
      },
      {
        id: 'tpl_doc_version',
        name: 'Document Version Control',
        description: 'Track document changes and notify stakeholders of updates',
        category: 'documents',
        icon: 'GitBranch',
        estimatedTime: 'Immediate',
        complexity: 'simple',
        tags: ['versioning', 'tracking', 'notifications'],
        usageCount: 89,
        rating: 4.3,
        featured: false,
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-04-20'),
        trigger: { type: 'status_changed', config: { field: 'version' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Notify Stakeholders',
            config: { message: 'Document has been updated to a new version' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Review Changes Task',
            config: { title: 'Review document changes', assignTo: 'stakeholders' },
            position: { x: 100, y: 200 },
            nextSteps: []
          }
        ]
      },

      // HR Templates
      {
        id: 'tpl_employee_onboarding',
        name: 'Employee Onboarding',
        description: 'Complete onboarding workflow with welcome emails, task assignments, and training schedules',
        category: 'hr',
        icon: 'UserPlus',
        estimatedTime: '1-2 weeks',
        complexity: 'complex',
        tags: ['onboarding', 'new hire', 'training'],
        usageCount: 312,
        rating: 4.9,
        featured: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-15'),
        trigger: { type: 'new_user', config: { userType: 'employee' } },
        steps: [
          {
            type: 'send_email',
            name: 'Send Welcome Email',
            config: { template: 'welcome_employee', subject: 'Welcome to the team!' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'IT Setup Tasks',
            config: { title: 'Set up workstation and accounts', assignTo: 'IT', dueInDays: 1 },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'HR Paperwork',
            config: { title: 'Complete HR documentation', assignTo: 'HR', dueInDays: 3 },
            position: { x: 100, y: 300 },
            nextSteps: []
          },
          {
            type: 'assign_user',
            name: 'Assign Mentor',
            config: { role: 'mentor' },
            position: { x: 100, y: 400 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Training Schedule',
            config: { title: 'Complete onboarding training', dueInDays: 14 },
            position: { x: 100, y: 500 },
            nextSteps: []
          },
          {
            type: 'wait_delay',
            name: 'Wait for First Week',
            config: { days: 7 },
            position: { x: 100, y: 600 },
            nextSteps: []
          },
          {
            type: 'send_notification',
            name: 'Check-in Reminder',
            config: { message: 'Schedule first week check-in with new employee' },
            position: { x: 100, y: 700 },
            nextSteps: []
          }
        ]
      },
      {
        id: 'tpl_leave_request',
        name: 'Leave Request Workflow',
        description: 'Automated leave request processing with manager approval and calendar updates',
        category: 'hr',
        icon: 'Calendar',
        estimatedTime: '1-3 days',
        complexity: 'moderate',
        tags: ['leave', 'time-off', 'approval'],
        usageCount: 278,
        rating: 4.7,
        featured: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-05-30'),
        trigger: { type: 'form_submitted', config: { formType: 'leave_request' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Confirm Submission',
            config: { message: 'Your leave request has been submitted' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'approval_request',
            name: 'Manager Approval',
            config: { approver: 'manager', timeout: 24 },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'condition',
            name: 'Check Approval',
            config: {},
            position: { x: 100, y: 300 },
            nextSteps: [],
            conditions: [
              { field: 'approved', operator: 'equals', value: true, nextStepId: 'approved' },
              { field: 'approved', operator: 'equals', value: false, nextStepId: 'rejected' }
            ]
          },
          {
            type: 'update_status',
            name: 'Update Leave Balance',
            config: { action: 'deduct_leave' },
            position: { x: 50, y: 400 },
            nextSteps: []
          },
          {
            type: 'send_email',
            name: 'Approval Notification',
            config: { template: 'leave_approved', subject: 'Leave request approved' },
            position: { x: 50, y: 500 },
            nextSteps: []
          },
          {
            type: 'send_email',
            name: 'Rejection Notification',
            config: { template: 'leave_rejected', subject: 'Leave request not approved' },
            position: { x: 150, y: 400 },
            nextSteps: []
          }
        ]
      },
      {
        id: 'tpl_performance_review',
        name: 'Performance Review Cycle',
        description: 'Structured performance review process with self-assessment and manager evaluation',
        category: 'hr',
        icon: 'TrendingUp',
        estimatedTime: '2-4 weeks',
        complexity: 'complex',
        tags: ['performance', 'review', 'evaluation'],
        usageCount: 134,
        rating: 4.4,
        featured: false,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-06-01'),
        trigger: { type: 'date_reached', config: { frequency: 'quarterly' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Announce Review Period',
            config: { message: 'Performance review period has started' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Self Assessment',
            config: { title: 'Complete self-assessment', dueInDays: 7 },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Manager Evaluation',
            config: { title: 'Complete team evaluations', assignTo: 'managers', dueInDays: 14 },
            position: { x: 100, y: 300 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Schedule Review Meeting',
            config: { title: 'Schedule 1:1 review meetings', dueInDays: 21 },
            position: { x: 100, y: 400 },
            nextSteps: []
          }
        ]
      },

      // Finance Templates
      {
        id: 'tpl_expense_report',
        name: 'Expense Report Workflow',
        description: 'Automated expense submission, approval, and reimbursement processing',
        category: 'finance',
        icon: 'Receipt',
        estimatedTime: '3-5 days',
        complexity: 'moderate',
        tags: ['expenses', 'reimbursement', 'approval'],
        usageCount: 423,
        rating: 4.8,
        featured: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-06-10'),
        trigger: { type: 'form_submitted', config: { formType: 'expense_report' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Confirm Submission',
            config: { message: 'Your expense report has been submitted' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'condition',
            name: 'Check Amount Threshold',
            config: {},
            position: { x: 100, y: 200 },
            nextSteps: [],
            conditions: [
              { field: 'amount', operator: 'greater_than', value: 500, nextStepId: 'high_value' },
              { field: 'amount', operator: 'less_than', value: 500, nextStepId: 'standard' }
            ]
          },
          {
            type: 'approval_request',
            name: 'Manager Approval',
            config: { approver: 'manager', timeout: 48 },
            position: { x: 50, y: 300 },
            nextSteps: []
          },
          {
            type: 'approval_request',
            name: 'Finance Director Approval',
            config: { approver: 'finance_director', timeout: 72 },
            position: { x: 150, y: 300 },
            nextSteps: []
          },
          {
            type: 'update_status',
            name: 'Process Reimbursement',
            config: { status: 'processing_payment' },
            position: { x: 100, y: 400 },
            nextSteps: []
          },
          {
            type: 'send_email',
            name: 'Payment Notification',
            config: { template: 'expense_approved', subject: 'Expense reimbursement processed' },
            position: { x: 100, y: 500 },
            nextSteps: []
          }
        ]
      },
      {
        id: 'tpl_invoice_processing',
        name: 'Invoice Processing',
        description: 'Automated invoice receipt, approval, and payment scheduling',
        category: 'finance',
        icon: 'FileText',
        estimatedTime: '5-7 days',
        complexity: 'moderate',
        tags: ['invoices', 'payments', 'accounts payable'],
        usageCount: 198,
        rating: 4.6,
        featured: false,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-05-20'),
        trigger: { type: 'form_submitted', config: { formType: 'invoice' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Invoice Received',
            config: { message: 'New invoice received for processing' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Verify Invoice',
            config: { title: 'Verify invoice details and PO match', assignTo: 'accounts_payable' },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'approval_request',
            name: 'Department Approval',
            config: { approver: 'department_head', timeout: 48 },
            position: { x: 100, y: 300 },
            nextSteps: []
          },
          {
            type: 'update_status',
            name: 'Schedule Payment',
            config: { status: 'scheduled_for_payment' },
            position: { x: 100, y: 400 },
            nextSteps: []
          }
        ]
      },

      // Compliance Templates
      {
        id: 'tpl_contract_review',
        name: 'Contract Review Workflow',
        description: 'Legal contract review with stakeholder input and approval tracking',
        category: 'compliance',
        icon: 'Scale',
        estimatedTime: '1-2 weeks',
        complexity: 'complex',
        tags: ['contracts', 'legal', 'review'],
        usageCount: 167,
        rating: 4.7,
        featured: true,
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-06-05'),
        trigger: { type: 'form_submitted', config: { formType: 'contract_review' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Contract Submitted',
            config: { message: 'Contract submitted for review' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Legal Review',
            config: { title: 'Review contract terms', assignTo: 'legal', dueInDays: 5 },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Finance Review',
            config: { title: 'Review financial terms', assignTo: 'finance', dueInDays: 3 },
            position: { x: 100, y: 300 },
            nextSteps: []
          },
          {
            type: 'approval_request',
            name: 'Executive Approval',
            config: { approver: 'executive', timeout: 72 },
            position: { x: 100, y: 400 },
            nextSteps: []
          },
          {
            type: 'send_email',
            name: 'Contract Approved',
            config: { template: 'contract_approved', subject: 'Contract approved for signature' },
            position: { x: 100, y: 500 },
            nextSteps: []
          }
        ]
      },
      {
        id: 'tpl_compliance_audit',
        name: 'Compliance Audit Preparation',
        description: 'Automated audit preparation with document collection and checklist management',
        category: 'compliance',
        icon: 'ClipboardCheck',
        estimatedTime: '2-4 weeks',
        complexity: 'complex',
        tags: ['audit', 'compliance', 'documentation'],
        usageCount: 89,
        rating: 4.5,
        featured: false,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-05-25'),
        trigger: { type: 'date_reached', config: { frequency: 'annual' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Audit Announcement',
            config: { message: 'Annual compliance audit preparation begins' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Document Collection',
            config: { title: 'Collect required compliance documents', dueInDays: 14 },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Policy Review',
            config: { title: 'Review and update policies', dueInDays: 21 },
            position: { x: 100, y: 300 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Training Verification',
            config: { title: 'Verify all training is current', dueInDays: 14 },
            position: { x: 100, y: 400 },
            nextSteps: []
          }
        ]
      },

      // Grant Templates
      {
        id: 'tpl_grant_application',
        name: 'Grant Application Workflow',
        description: 'Complete grant application process from proposal to submission',
        category: 'grants',
        icon: 'Award',
        estimatedTime: '2-4 weeks',
        complexity: 'complex',
        tags: ['grants', 'funding', 'application'],
        usageCount: 145,
        rating: 4.6,
        featured: true,
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-06-01'),
        trigger: { type: 'form_submitted', config: { formType: 'grant_proposal' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Proposal Received',
            config: { message: 'Grant proposal submitted for review' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Internal Review',
            config: { title: 'Review grant proposal', assignTo: 'grants_team', dueInDays: 5 },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'approval_request',
            name: 'Director Approval',
            config: { approver: 'director', timeout: 48 },
            position: { x: 100, y: 300 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Prepare Submission',
            config: { title: 'Finalize and submit grant application', dueInDays: 7 },
            position: { x: 100, y: 400 },
            nextSteps: []
          },
          {
            type: 'send_email',
            name: 'Submission Confirmation',
            config: { template: 'grant_submitted', subject: 'Grant application submitted' },
            position: { x: 100, y: 500 },
            nextSteps: []
          }
        ]
      },
      {
        id: 'tpl_grant_reporting',
        name: 'Grant Reporting Workflow',
        description: 'Automated grant reporting with deadline tracking and stakeholder notifications',
        category: 'grants',
        icon: 'BarChart',
        estimatedTime: '1-2 weeks',
        complexity: 'moderate',
        tags: ['grants', 'reporting', 'compliance'],
        usageCount: 98,
        rating: 4.4,
        featured: false,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-05-15'),
        trigger: { type: 'date_reached', config: { frequency: 'quarterly' } },
        steps: [
          {
            type: 'send_notification',
            name: 'Report Due Reminder',
            config: { message: 'Grant report due in 30 days' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Collect Data',
            config: { title: 'Collect grant reporting data', dueInDays: 14 },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'create_task',
            name: 'Draft Report',
            config: { title: 'Draft grant progress report', dueInDays: 21 },
            position: { x: 100, y: 300 },
            nextSteps: []
          },
          {
            type: 'approval_request',
            name: 'Review and Approve',
            config: { approver: 'grants_manager', timeout: 48 },
            position: { x: 100, y: 400 },
            nextSteps: []
          }
        ]
      },

      // Operations Templates
      {
        id: 'tpl_task_escalation',
        name: 'Task Escalation Workflow',
        description: 'Automatic task escalation based on priority and overdue status',
        category: 'operations',
        icon: 'AlertTriangle',
        estimatedTime: 'Automatic',
        complexity: 'simple',
        tags: ['tasks', 'escalation', 'automation'],
        usageCount: 234,
        rating: 4.5,
        featured: false,
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-05-10'),
        trigger: { type: 'status_changed', config: { field: 'overdue', value: true } },
        steps: [
          {
            type: 'send_notification',
            name: 'Notify Assignee',
            config: { message: 'Task is now overdue' },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'wait_delay',
            name: 'Wait 24 Hours',
            config: { hours: 24 },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'send_notification',
            name: 'Escalate to Manager',
            config: { message: 'Task overdue - escalating to manager', recipients: ['manager'] },
            position: { x: 100, y: 300 },
            nextSteps: []
          }
        ]
      },
      {
        id: 'tpl_feedback_collection',
        name: 'Feedback Collection Workflow',
        description: 'Automated feedback collection after project completion or service delivery',
        category: 'operations',
        icon: 'MessageSquare',
        estimatedTime: '1 week',
        complexity: 'simple',
        tags: ['feedback', 'surveys', 'quality'],
        usageCount: 167,
        rating: 4.3,
        featured: false,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-05-20'),
        trigger: { type: 'status_changed', config: { field: 'status', value: 'completed' } },
        steps: [
          {
            type: 'wait_delay',
            name: 'Wait 2 Days',
            config: { days: 2 },
            position: { x: 100, y: 100 },
            nextSteps: []
          },
          {
            type: 'send_email',
            name: 'Send Feedback Request',
            config: { template: 'feedback_request', subject: 'We value your feedback' },
            position: { x: 100, y: 200 },
            nextSteps: []
          },
          {
            type: 'wait_delay',
            name: 'Wait for Response',
            config: { days: 5 },
            position: { x: 100, y: 300 },
            nextSteps: []
          },
          {
            type: 'send_notification',
            name: 'Reminder',
            config: { message: 'Feedback reminder sent' },
            position: { x: 100, y: 400 },
            nextSteps: []
          }
        ]
      }
    ];

    // Add usage counts from storage
    const usage = this.getUsage();
    templates.forEach(template => {
      const templateUsage = usage.filter(u => u.templateId === template.id);
      template.usageCount = template.usageCount + templateUsage.length;
    });

    return templates;
  }

  // Get templates by category
  getTemplatesByCategory(categoryId: string): ExtendedWorkflowTemplate[] {
    return this.getTemplates().filter(t => t.category === categoryId);
  }

  // Get featured templates
  getFeaturedTemplates(): ExtendedWorkflowTemplate[] {
    return this.getTemplates().filter(t => t.featured);
  }

  // Search templates
  searchTemplates(query: string): ExtendedWorkflowTemplate[] {
    const lowerQuery = query.toLowerCase();
    return this.getTemplates().filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get template by ID
  getTemplate(id: string): ExtendedWorkflowTemplate | null {
    return this.getTemplates().find(t => t.id === id) || null;
  }

  // Record template usage
  recordUsage(templateId: string, userId: string, workflowId: string): void {
    const usage = this.getUsage();
    usage.push({
      templateId,
      userId,
      workflowId,
      usedAt: new Date()
    });
    localStorage.setItem(this.USAGE_KEY, JSON.stringify(usage));
  }

  // Get usage history
  getUsage(): TemplateUsage[] {
    const stored = localStorage.getItem(this.USAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((u: any) => ({
      ...u,
      usedAt: new Date(u.usedAt)
    }));
  }

  // Rate a template
  rateTemplate(templateId: string, userId: string, rating: number, comment?: string): void {
    const ratings = this.getRatings();
    const existingIndex = ratings.findIndex(r => r.templateId === templateId && r.userId === userId);
    
    const newRating: TemplateRating = {
      templateId,
      userId,
      rating,
      comment,
      createdAt: new Date()
    };

    if (existingIndex >= 0) {
      ratings[existingIndex] = newRating;
    } else {
      ratings.push(newRating);
    }

    localStorage.setItem(this.RATINGS_KEY, JSON.stringify(ratings));
  }

  // Get ratings
  getRatings(): TemplateRating[] {
    const stored = localStorage.getItem(this.RATINGS_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt)
    }));
  }

  // Get template ratings
  getTemplateRatings(templateId: string): TemplateRating[] {
    return this.getRatings().filter(r => r.templateId === templateId);
  }

  // Get statistics
  getStats(): {
    totalTemplates: number;
    totalUsage: number;
    topTemplates: { id: string; name: string; count: number }[];
    categoryBreakdown: { category: string; count: number }[];
  } {
    const templates = this.getTemplates();
    const usage = this.getUsage();

    const usageByTemplate = usage.reduce((acc, u) => {
      acc[u.templateId] = (acc[u.templateId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTemplates = Object.entries(usageByTemplate)
      .map(([id, count]) => ({
        id,
        name: templates.find(t => t.id === id)?.name || 'Unknown',
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const categoryBreakdown = this.getCategories().map(cat => ({
      category: cat.name,
      count: templates.filter(t => t.category === cat.id).length
    }));

    return {
      totalTemplates: templates.length,
      totalUsage: usage.length,
      topTemplates,
      categoryBreakdown
    };
  }
}

export const workflowTemplatesService = new WorkflowTemplatesService();
