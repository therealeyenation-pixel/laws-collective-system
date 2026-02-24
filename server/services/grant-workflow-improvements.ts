/**
 * Grant Workflow Improvements Service
 * Phase 115: Status workflow, pre-filled templates, improved tracking
 */

export type GrantStatus = 
  | 'identified'
  | 'researching'
  | 'preparing'
  | 'submitted'
  | 'under_review'
  | 'additional_info_requested'
  | 'approved'
  | 'rejected'
  | 'awarded'
  | 'reporting'
  | 'completed'
  | 'withdrawn';

export type GrantType = 'federal' | 'state' | 'foundation' | 'corporate' | 'community';

export interface GrantApplication {
  grantId: string;
  name: string;
  funder: string;
  type: GrantType;
  amount: number;
  status: GrantStatus;
  deadline: Date;
  submittedAt?: Date;
  awardedAt?: Date;
  completedAt?: Date;
  projectDescription: string;
  budgetItems: BudgetItem[];
  milestones: Milestone[];
  documents: GrantDocument[];
  statusHistory: StatusChange[];
  contacts: GrantContact[];
  reportingSchedule: ReportingPeriod[];
  matchingFunds?: MatchingFunds;
  notes: string[];
}

export interface BudgetItem {
  itemId: string;
  category: 'personnel' | 'equipment' | 'supplies' | 'travel' | 'contractual' | 'other' | 'indirect';
  description: string;
  amount: number;
  justification: string;
}

export interface Milestone {
  milestoneId: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  completedAt?: Date;
  deliverables: string[];
}

export interface GrantDocument {
  documentId: string;
  name: string;
  type: 'narrative' | 'budget' | 'support_letter' | 'financial' | 'report' | 'other';
  required: boolean;
  uploaded: boolean;
  uploadedAt?: Date;
}

export interface StatusChange {
  changeId: string;
  previousStatus: GrantStatus;
  newStatus: GrantStatus;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

export interface GrantContact {
  contactId: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
}

export interface ReportingPeriod {
  periodId: string;
  type: 'progress' | 'financial' | 'final';
  dueDate: Date;
  submittedAt?: Date;
  status: 'upcoming' | 'due' | 'submitted' | 'overdue';
}

export interface MatchingFunds {
  required: boolean;
  percentage: number;
  amount: number;
  sources: { source: string; amount: number; confirmed: boolean }[];
}

export interface GrantTemplate {
  templateId: string;
  name: string;
  type: GrantType;
  sections: TemplateSection[];
  requiredDocuments: string[];
  budgetCategories: string[];
}

export interface TemplateSection {
  sectionId: string;
  title: string;
  description: string;
  maxWords?: number;
  required: boolean;
  prefillField?: string;
}

const GRANT_TEMPLATES: Record<GrantType, Omit<GrantTemplate, 'templateId'>> = {
  federal: {
    name: 'Federal Grant Application',
    type: 'federal',
    sections: [
      { sectionId: 's1', title: 'Project Summary/Abstract', description: 'Brief overview of the project', maxWords: 300, required: true, prefillField: 'projectDescription' },
      { sectionId: 's2', title: 'Statement of Need', description: 'Describe the problem being addressed', maxWords: 500, required: true },
      { sectionId: 's3', title: 'Goals and Objectives', description: 'Specific, measurable objectives', required: true },
      { sectionId: 's4', title: 'Methods/Approach', description: 'How objectives will be achieved', required: true },
      { sectionId: 's5', title: 'Evaluation Plan', description: 'How success will be measured', required: true },
      { sectionId: 's6', title: 'Organizational Capacity', description: 'Qualifications and experience', required: true },
      { sectionId: 's7', title: 'Budget Narrative', description: 'Justification for budget items', required: true }
    ],
    requiredDocuments: ['501c3 Letter', 'Board List', 'Financial Statements', 'Organizational Chart'],
    budgetCategories: ['personnel', 'equipment', 'supplies', 'travel', 'contractual', 'other', 'indirect']
  },
  state: {
    name: 'State Grant Application',
    type: 'state',
    sections: [
      { sectionId: 's1', title: 'Executive Summary', description: 'Overview of project', maxWords: 250, required: true },
      { sectionId: 's2', title: 'Problem Statement', description: 'Issue being addressed', required: true },
      { sectionId: 's3', title: 'Project Description', description: 'Detailed project plan', required: true },
      { sectionId: 's4', title: 'Timeline', description: 'Project schedule', required: true },
      { sectionId: 's5', title: 'Budget', description: 'Detailed budget', required: true }
    ],
    requiredDocuments: ['501c3 Letter', 'Financial Statements'],
    budgetCategories: ['personnel', 'equipment', 'supplies', 'other']
  },
  foundation: {
    name: 'Foundation Grant Application',
    type: 'foundation',
    sections: [
      { sectionId: 's1', title: 'Organization Background', description: 'About your organization', required: true },
      { sectionId: 's2', title: 'Project Description', description: 'What you plan to do', required: true },
      { sectionId: 's3', title: 'Expected Outcomes', description: 'Anticipated results', required: true },
      { sectionId: 's4', title: 'Budget Summary', description: 'High-level budget', required: true }
    ],
    requiredDocuments: ['501c3 Letter', 'Board List'],
    budgetCategories: ['personnel', 'supplies', 'other']
  },
  corporate: {
    name: 'Corporate Grant Application',
    type: 'corporate',
    sections: [
      { sectionId: 's1', title: 'Project Overview', description: 'Brief project summary', maxWords: 200, required: true },
      { sectionId: 's2', title: 'Alignment with Funder', description: 'How project aligns with corporate priorities', required: true },
      { sectionId: 's3', title: 'Impact', description: 'Expected community impact', required: true },
      { sectionId: 's4', title: 'Recognition', description: 'How funder will be recognized', required: false }
    ],
    requiredDocuments: ['501c3 Letter'],
    budgetCategories: ['personnel', 'supplies', 'other']
  },
  community: {
    name: 'Community Grant Application',
    type: 'community',
    sections: [
      { sectionId: 's1', title: 'Project Summary', description: 'What you want to do', required: true },
      { sectionId: 's2', title: 'Community Need', description: 'Why this is needed', required: true },
      { sectionId: 's3', title: 'Budget', description: 'How funds will be used', required: true }
    ],
    requiredDocuments: [],
    budgetCategories: ['supplies', 'other']
  }
};

export function createGrantApplication(
  name: string,
  funder: string,
  type: GrantType,
  amount: number,
  deadline: Date,
  projectDescription: string
): GrantApplication {
  return {
    grantId: `grant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    funder,
    type,
    amount,
    status: 'identified',
    deadline,
    projectDescription,
    budgetItems: [],
    milestones: [],
    documents: [],
    statusHistory: [{
      changeId: `sc-${Date.now()}`,
      previousStatus: 'identified',
      newStatus: 'identified',
      changedBy: 'system',
      changedAt: new Date(),
      reason: 'Grant opportunity identified'
    }],
    contacts: [],
    reportingSchedule: [],
    notes: []
  };
}

export function updateGrantStatus(
  grant: GrantApplication,
  newStatus: GrantStatus,
  changedBy: string,
  reason?: string
): GrantApplication {
  const statusChange: StatusChange = {
    changeId: `sc-${Date.now()}`,
    previousStatus: grant.status,
    newStatus,
    changedBy,
    changedAt: new Date(),
    reason
  };

  const updates: Partial<GrantApplication> = { status: newStatus };
  
  if (newStatus === 'submitted') updates.submittedAt = new Date();
  if (newStatus === 'awarded') updates.awardedAt = new Date();
  if (newStatus === 'completed') updates.completedAt = new Date();

  return {
    ...grant,
    ...updates,
    statusHistory: [...grant.statusHistory, statusChange]
  };
}

export function addBudgetItem(
  grant: GrantApplication,
  category: BudgetItem['category'],
  description: string,
  amount: number,
  justification: string
): GrantApplication {
  const item: BudgetItem = {
    itemId: `bi-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
    category,
    description,
    amount,
    justification
  };

  return {
    ...grant,
    budgetItems: [...grant.budgetItems, item]
  };
}

export function addMilestone(
  grant: GrantApplication,
  title: string,
  description: string,
  dueDate: Date,
  deliverables: string[]
): GrantApplication {
  const milestone: Milestone = {
    milestoneId: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
    title,
    description,
    dueDate,
    status: 'pending',
    deliverables
  };

  return {
    ...grant,
    milestones: [...grant.milestones, milestone]
  };
}

export function completeMilestone(
  grant: GrantApplication,
  milestoneId: string
): GrantApplication {
  const milestones = grant.milestones.map(m =>
    m.milestoneId === milestoneId
      ? { ...m, status: 'completed' as const, completedAt: new Date() }
      : m
  );

  return { ...grant, milestones };
}

export function addDocument(
  grant: GrantApplication,
  name: string,
  type: GrantDocument['type'],
  required: boolean
): GrantApplication {
  const doc: GrantDocument = {
    documentId: `gd-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
    name,
    type,
    required,
    uploaded: false
  };

  return {
    ...grant,
    documents: [...grant.documents, doc]
  };
}

export function markDocumentUploaded(
  grant: GrantApplication,
  documentId: string
): GrantApplication {
  const documents = grant.documents.map(d =>
    d.documentId === documentId
      ? { ...d, uploaded: true, uploadedAt: new Date() }
      : d
  );

  return { ...grant, documents };
}

export function addContact(
  grant: GrantApplication,
  name: string,
  role: string,
  email: string,
  isPrimary: boolean,
  phone?: string
): GrantApplication {
  const contact: GrantContact = {
    contactId: `gc-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
    name,
    role,
    email,
    phone,
    isPrimary
  };

  return {
    ...grant,
    contacts: [...grant.contacts, contact]
  };
}

export function setupReportingSchedule(
  grant: GrantApplication,
  periods: { type: ReportingPeriod['type']; dueDate: Date }[]
): GrantApplication {
  const reportingSchedule: ReportingPeriod[] = periods.map((p, idx) => ({
    periodId: `rp-${idx}`,
    type: p.type,
    dueDate: p.dueDate,
    status: 'upcoming'
  }));

  return { ...grant, reportingSchedule };
}

export function getTemplate(type: GrantType): GrantTemplate {
  const template = GRANT_TEMPLATES[type];
  return {
    ...template,
    templateId: `tmpl-${type}`
  };
}

export function prefillTemplate(
  template: GrantTemplate,
  grant: GrantApplication
): { sectionId: string; title: string; content: string }[] {
  return template.sections.map(section => ({
    sectionId: section.sectionId,
    title: section.title,
    content: section.prefillField === 'projectDescription' ? grant.projectDescription : ''
  }));
}

export function calculateBudgetTotal(grant: GrantApplication): number {
  return grant.budgetItems.reduce((sum, item) => sum + item.amount, 0);
}

export function getBudgetByCategory(grant: GrantApplication): Record<string, number> {
  return grant.budgetItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);
}

export function checkReadiness(grant: GrantApplication): {
  ready: boolean;
  missingItems: string[];
  completionPercentage: number;
} {
  const missingItems: string[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  // Check required documents
  const requiredDocs = grant.documents.filter(d => d.required);
  totalChecks += requiredDocs.length;
  requiredDocs.forEach(d => {
    if (d.uploaded) passedChecks++;
    else missingItems.push(`Document: ${d.name}`);
  });

  // Check budget
  totalChecks++;
  if (grant.budgetItems.length > 0) passedChecks++;
  else missingItems.push('Budget items');

  // Check contacts
  totalChecks++;
  if (grant.contacts.some(c => c.isPrimary)) passedChecks++;
  else missingItems.push('Primary contact');

  // Check project description
  totalChecks++;
  if (grant.projectDescription.length > 50) passedChecks++;
  else missingItems.push('Project description');

  return {
    ready: missingItems.length === 0,
    missingItems,
    completionPercentage: totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0
  };
}

export function generateGrantSummary(grant: GrantApplication): string {
  const readiness = checkReadiness(grant);
  const budgetTotal = calculateBudgetTotal(grant);
  const budgetByCategory = getBudgetByCategory(grant);

  return `
GRANT APPLICATION SUMMARY
=========================
Grant: ${grant.name}
Funder: ${grant.funder}
Type: ${grant.type.toUpperCase()}
Amount Requested: $${grant.amount.toLocaleString()}
Status: ${grant.status.toUpperCase().replace(/_/g, ' ')}
Deadline: ${grant.deadline.toLocaleDateString()}

PROJECT DESCRIPTION
-------------------
${grant.projectDescription}

BUDGET SUMMARY
--------------
Total: $${budgetTotal.toLocaleString()}
${Object.entries(budgetByCategory).map(([cat, amt]) => 
  `- ${cat}: $${amt.toLocaleString()}`
).join('\n')}

MILESTONES
----------
${grant.milestones.length > 0
  ? grant.milestones.map(m => `- ${m.title}: ${m.status.toUpperCase()}`).join('\n')
  : 'No milestones defined'}

DOCUMENTS
---------
${grant.documents.length > 0
  ? grant.documents.map(d => `- ${d.name}: ${d.uploaded ? 'Uploaded' : 'PENDING'}`).join('\n')
  : 'No documents'}

READINESS
---------
Completion: ${readiness.completionPercentage}%
Ready to Submit: ${readiness.ready ? 'YES' : 'NO'}
${readiness.missingItems.length > 0 ? `Missing: ${readiness.missingItems.join(', ')}` : ''}

STATUS HISTORY
--------------
${grant.statusHistory.map(s => 
  `[${s.changedAt.toLocaleDateString()}] ${s.newStatus.toUpperCase()} - ${s.reason || 'No reason provided'}`
).join('\n')}
`;
}

export const grantWorkflow = {
  createGrantApplication,
  updateGrantStatus,
  addBudgetItem,
  addMilestone,
  completeMilestone,
  addDocument,
  markDocumentUploaded,
  addContact,
  setupReportingSchedule,
  getTemplate,
  prefillTemplate,
  calculateBudgetTotal,
  getBudgetByCategory,
  checkReadiness,
  generateGrantSummary,
  GRANT_TEMPLATES
};
