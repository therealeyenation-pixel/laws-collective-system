/**
 * E-Signature and Contract Widget Service
 * Covers: Electronic signatures, contract management, pricing page, document workflows
 */

// ============================================================================
// E-SIGNATURE SYSTEM
// ============================================================================

export interface ESignature {
  id: string;
  documentId: string;
  signerId: string;
  signerName: string;
  signerEmail: string;
  signatureData: string;
  signatureType: 'drawn' | 'typed' | 'uploaded' | 'digital_certificate';
  ipAddress: string;
  userAgent: string;
  timestamp: number;
  verified: boolean;
  certificateId?: string;
}

export interface SignatureRequest {
  id: string;
  documentId: string;
  documentName: string;
  requesterId: string;
  requesterName: string;
  signers: SignerInfo[];
  status: 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
  message?: string;
  dueDate?: number;
  remindersSent: number;
  createdAt: number;
  completedAt?: number;
}

export interface SignerInfo {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  order: number;
  status: 'pending' | 'viewed' | 'signed' | 'declined';
  signedAt?: number;
  declineReason?: string;
}

export interface SignatureField {
  id: string;
  documentId: string;
  signerId: string;
  type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox';
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  value?: string;
  filledAt?: number;
}

const signatures: ESignature[] = [];
const signatureRequests: SignatureRequest[] = [];
const signatureFields: SignatureField[] = [];

export function createSignatureRequest(
  documentId: string,
  documentName: string,
  requesterId: string,
  requesterName: string,
  signers: Omit<SignerInfo, 'id' | 'status'>[],
  message?: string,
  dueDate?: number
): SignatureRequest {
  const request: SignatureRequest = {
    id: `SIG-REQ-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    documentId,
    documentName,
    requesterId,
    requesterName,
    signers: signers.map((s, i) => ({
      ...s,
      id: `SIGNER-${Date.now().toString(36)}-${i}`,
      status: 'pending' as const
    })),
    status: 'pending',
    message,
    dueDate,
    remindersSent: 0,
    createdAt: Date.now()
  };
  signatureRequests.push(request);
  return request;
}

export function addSignatureField(
  documentId: string,
  signerId: string,
  type: SignatureField['type'],
  page: number,
  x: number,
  y: number,
  width: number,
  height: number,
  required: boolean = true
): SignatureField {
  const field: SignatureField = {
    id: `FIELD-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    documentId,
    signerId,
    type,
    page,
    x,
    y,
    width,
    height,
    required
  };
  signatureFields.push(field);
  return field;
}

export function signDocument(
  requestId: string,
  signerId: string,
  signatureData: string,
  signatureType: ESignature['signatureType'],
  ipAddress: string,
  userAgent: string
): ESignature | null {
  const request = signatureRequests.find(r => r.id === requestId);
  if (!request) return null;

  const signer = request.signers.find(s => s.userId === signerId);
  if (!signer || signer.status === 'signed') return null;

  // Check signing order
  const previousSigners = request.signers.filter(s => s.order < signer.order);
  if (previousSigners.some(s => s.status !== 'signed')) return null;

  const signature: ESignature = {
    id: `SIG-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    documentId: request.documentId,
    signerId,
    signerName: signer.name,
    signerEmail: signer.email,
    signatureData,
    signatureType,
    ipAddress,
    userAgent,
    timestamp: Date.now(),
    verified: true
  };
  signatures.push(signature);

  // Update signer status
  signer.status = 'signed';
  signer.signedAt = Date.now();

  // Update request status
  if (request.signers.every(s => s.status === 'signed')) {
    request.status = 'completed';
    request.completedAt = Date.now();
  } else {
    request.status = 'in_progress';
  }

  return signature;
}

export function declineSignature(
  requestId: string,
  signerId: string,
  reason: string
): boolean {
  const request = signatureRequests.find(r => r.id === requestId);
  if (!request) return false;

  const signer = request.signers.find(s => s.userId === signerId);
  if (!signer) return false;

  signer.status = 'declined';
  signer.declineReason = reason;
  request.status = 'cancelled';
  return true;
}

export function sendReminder(requestId: string): boolean {
  const request = signatureRequests.find(r => r.id === requestId);
  if (!request || request.status === 'completed') return false;
  request.remindersSent++;
  return true;
}

export function verifySignature(signatureId: string): { valid: boolean; details: object } {
  const signature = signatures.find(s => s.id === signatureId);
  if (!signature) return { valid: false, details: { error: 'Signature not found' } };

  return {
    valid: signature.verified,
    details: {
      signerId: signature.signerId,
      signerName: signature.signerName,
      timestamp: new Date(signature.timestamp).toISOString(),
      signatureType: signature.signatureType,
      ipAddress: signature.ipAddress
    }
  };
}

// ============================================================================
// CONTRACT MANAGEMENT
// ============================================================================

export interface Contract {
  id: string;
  title: string;
  type: 'employment' | 'service' | 'nda' | 'partnership' | 'vendor' | 'lease' | 'custom';
  status: 'draft' | 'pending_review' | 'pending_signature' | 'active' | 'expired' | 'terminated';
  parties: ContractParty[];
  terms: ContractTerm[];
  effectiveDate?: number;
  expirationDate?: number;
  autoRenew: boolean;
  renewalTerms?: string;
  value?: number;
  currency: string;
  attachments: string[];
  signatureRequestId?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  version: number;
  previousVersions: string[];
}

export interface ContractParty {
  id: string;
  type: 'individual' | 'company' | 'entity';
  name: string;
  email: string;
  role: 'party_a' | 'party_b' | 'witness' | 'notary';
  address?: string;
  representative?: string;
}

export interface ContractTerm {
  id: string;
  section: string;
  title: string;
  content: string;
  order: number;
  isNegotiable: boolean;
  negotiationNotes?: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: Contract['type'];
  description: string;
  sections: ContractTerm[];
  variables: TemplateVariable[];
  createdAt: number;
}

export interface TemplateVariable {
  name: string;
  placeholder: string;
  type: 'text' | 'date' | 'number' | 'currency' | 'party';
  required: boolean;
  defaultValue?: string;
}

const contracts: Contract[] = [];
const contractTemplates: ContractTemplate[] = [
  {
    id: 'TPL-NDA',
    name: 'Non-Disclosure Agreement',
    type: 'nda',
    description: 'Standard NDA for confidential information',
    sections: [
      { id: 'S1', section: '1', title: 'Definition of Confidential Information', content: 'Confidential Information means...', order: 1, isNegotiable: false },
      { id: 'S2', section: '2', title: 'Obligations', content: 'The Receiving Party agrees to...', order: 2, isNegotiable: true },
      { id: 'S3', section: '3', title: 'Term', content: 'This Agreement shall remain in effect for {{term_years}} years...', order: 3, isNegotiable: true },
      { id: 'S4', section: '4', title: 'Governing Law', content: 'This Agreement shall be governed by the laws of {{jurisdiction}}...', order: 4, isNegotiable: false }
    ],
    variables: [
      { name: 'term_years', placeholder: '{{term_years}}', type: 'number', required: true, defaultValue: '3' },
      { name: 'jurisdiction', placeholder: '{{jurisdiction}}', type: 'text', required: true }
    ],
    createdAt: Date.now()
  },
  {
    id: 'TPL-SERVICE',
    name: 'Service Agreement',
    type: 'service',
    description: 'Standard service agreement template',
    sections: [
      { id: 'S1', section: '1', title: 'Scope of Services', content: 'Provider agrees to provide the following services...', order: 1, isNegotiable: true },
      { id: 'S2', section: '2', title: 'Compensation', content: 'Client agrees to pay {{amount}} {{currency}}...', order: 2, isNegotiable: true },
      { id: 'S3', section: '3', title: 'Term and Termination', content: 'This Agreement begins on {{start_date}}...', order: 3, isNegotiable: true },
      { id: 'S4', section: '4', title: 'Intellectual Property', content: 'All work product created...', order: 4, isNegotiable: false }
    ],
    variables: [
      { name: 'amount', placeholder: '{{amount}}', type: 'currency', required: true },
      { name: 'currency', placeholder: '{{currency}}', type: 'text', required: true, defaultValue: 'USD' },
      { name: 'start_date', placeholder: '{{start_date}}', type: 'date', required: true }
    ],
    createdAt: Date.now()
  },
  {
    id: 'TPL-EMPLOYMENT',
    name: 'Employment Agreement',
    type: 'employment',
    description: 'Standard employment contract',
    sections: [
      { id: 'S1', section: '1', title: 'Position and Duties', content: 'Employee shall serve as {{position}}...', order: 1, isNegotiable: false },
      { id: 'S2', section: '2', title: 'Compensation', content: 'Employee shall receive {{salary}} per {{pay_period}}...', order: 2, isNegotiable: true },
      { id: 'S3', section: '3', title: 'Benefits', content: 'Employee shall be entitled to...', order: 3, isNegotiable: true },
      { id: 'S4', section: '4', title: 'Confidentiality', content: 'Employee agrees to maintain confidentiality...', order: 4, isNegotiable: false },
      { id: 'S5', section: '5', title: 'Termination', content: 'Either party may terminate...', order: 5, isNegotiable: true }
    ],
    variables: [
      { name: 'position', placeholder: '{{position}}', type: 'text', required: true },
      { name: 'salary', placeholder: '{{salary}}', type: 'currency', required: true },
      { name: 'pay_period', placeholder: '{{pay_period}}', type: 'text', required: true, defaultValue: 'year' }
    ],
    createdAt: Date.now()
  }
];

export function createContract(
  title: string,
  type: Contract['type'],
  parties: Omit<ContractParty, 'id'>[],
  createdBy: string
): Contract {
  const contract: Contract = {
    id: `CTR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    title,
    type,
    status: 'draft',
    parties: parties.map((p, i) => ({ ...p, id: `PARTY-${i}` })),
    terms: [],
    autoRenew: false,
    currency: 'USD',
    attachments: [],
    createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
    previousVersions: []
  };
  contracts.push(contract);
  return contract;
}

export function createContractFromTemplate(
  templateId: string,
  title: string,
  parties: Omit<ContractParty, 'id'>[],
  variables: Record<string, string>,
  createdBy: string
): Contract | null {
  const template = contractTemplates.find(t => t.id === templateId);
  if (!template) return null;

  const contract = createContract(title, template.type, parties, createdBy);
  
  // Apply template sections with variable substitution
  contract.terms = template.sections.map(section => {
    let content = section.content;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return { ...section, id: `TERM-${Date.now().toString(36)}-${section.order}`, content };
  });

  return contract;
}

export function addContractTerm(
  contractId: string,
  section: string,
  title: string,
  content: string,
  isNegotiable: boolean = false
): ContractTerm | null {
  const contract = contracts.find(c => c.id === contractId);
  if (!contract || contract.status !== 'draft') return null;

  const term: ContractTerm = {
    id: `TERM-${Date.now().toString(36)}`,
    section,
    title,
    content,
    order: contract.terms.length + 1,
    isNegotiable
  };
  contract.terms.push(term);
  contract.updatedAt = Date.now();
  return term;
}

export function submitForReview(contractId: string): boolean {
  const contract = contracts.find(c => c.id === contractId);
  if (!contract || contract.status !== 'draft') return false;
  contract.status = 'pending_review';
  contract.updatedAt = Date.now();
  return true;
}

export function approveContract(contractId: string): boolean {
  const contract = contracts.find(c => c.id === contractId);
  if (!contract || contract.status !== 'pending_review') return false;
  contract.status = 'pending_signature';
  contract.updatedAt = Date.now();
  return true;
}

export function activateContract(contractId: string, effectiveDate: number): boolean {
  const contract = contracts.find(c => c.id === contractId);
  if (!contract || contract.status !== 'pending_signature') return false;
  contract.status = 'active';
  contract.effectiveDate = effectiveDate;
  contract.updatedAt = Date.now();
  return true;
}

export function terminateContract(contractId: string, reason: string): boolean {
  const contract = contracts.find(c => c.id === contractId);
  if (!contract || contract.status !== 'active') return false;
  contract.status = 'terminated';
  contract.updatedAt = Date.now();
  return true;
}

export function getContractTemplates(): ContractTemplate[] {
  return contractTemplates;
}

// ============================================================================
// PRICING PAGE SYSTEM
// ============================================================================

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise' | 'custom';
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly' | 'one_time';
  features: PlanFeature[];
  limits: PlanLimit[];
  isPopular: boolean;
  isActive: boolean;
  trialDays?: number;
  discountPercent?: number;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanLimit {
  name: string;
  value: number | 'unlimited';
  unit: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  trialEnd?: number;
  createdAt: number;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'PLAN-FREE',
    name: 'Free',
    description: 'Get started with basic features',
    tier: 'free',
    price: 0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      { id: 'F1', name: 'Basic Dashboard', description: 'Access to core dashboard', included: true },
      { id: 'F2', name: '5 Documents', description: 'Store up to 5 documents', included: true },
      { id: 'F3', name: 'Email Support', description: 'Standard email support', included: true },
      { id: 'F4', name: 'E-Signatures', description: 'Electronic signatures', included: false },
      { id: 'F5', name: 'API Access', description: 'Developer API', included: false }
    ],
    limits: [
      { name: 'Documents', value: 5, unit: 'documents' },
      { name: 'Storage', value: 100, unit: 'MB' },
      { name: 'Users', value: 1, unit: 'users' }
    ],
    isPopular: false,
    isActive: true
  },
  {
    id: 'PLAN-STARTER',
    name: 'Starter',
    description: 'Perfect for small teams',
    tier: 'starter',
    price: 29,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      { id: 'F1', name: 'Full Dashboard', description: 'Access to all dashboard features', included: true, highlight: true },
      { id: 'F2', name: '100 Documents', description: 'Store up to 100 documents', included: true },
      { id: 'F3', name: 'Priority Support', description: 'Priority email support', included: true },
      { id: 'F4', name: 'E-Signatures', description: '50 signatures/month', included: true, highlight: true },
      { id: 'F5', name: 'API Access', description: 'Developer API', included: false }
    ],
    limits: [
      { name: 'Documents', value: 100, unit: 'documents' },
      { name: 'Storage', value: 5, unit: 'GB' },
      { name: 'Users', value: 5, unit: 'users' },
      { name: 'Signatures', value: 50, unit: 'per month' }
    ],
    isPopular: false,
    isActive: true,
    trialDays: 14
  },
  {
    id: 'PLAN-PRO',
    name: 'Professional',
    description: 'For growing businesses',
    tier: 'professional',
    price: 99,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      { id: 'F1', name: 'Full Dashboard', description: 'Access to all dashboard features', included: true },
      { id: 'F2', name: 'Unlimited Documents', description: 'No document limits', included: true, highlight: true },
      { id: 'F3', name: '24/7 Support', description: 'Round-the-clock support', included: true },
      { id: 'F4', name: 'E-Signatures', description: 'Unlimited signatures', included: true, highlight: true },
      { id: 'F5', name: 'API Access', description: 'Full API access', included: true, highlight: true },
      { id: 'F6', name: 'Custom Branding', description: 'White-label options', included: true }
    ],
    limits: [
      { name: 'Documents', value: 'unlimited', unit: 'documents' },
      { name: 'Storage', value: 50, unit: 'GB' },
      { name: 'Users', value: 25, unit: 'users' },
      { name: 'Signatures', value: 'unlimited', unit: 'per month' }
    ],
    isPopular: true,
    isActive: true,
    trialDays: 14,
    discountPercent: 20
  },
  {
    id: 'PLAN-ENTERPRISE',
    name: 'Enterprise',
    description: 'For large organizations',
    tier: 'enterprise',
    price: 299,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      { id: 'F1', name: 'Everything in Pro', description: 'All Professional features', included: true },
      { id: 'F2', name: 'Dedicated Support', description: 'Dedicated account manager', included: true, highlight: true },
      { id: 'F3', name: 'SLA', description: '99.9% uptime SLA', included: true },
      { id: 'F4', name: 'SSO', description: 'Single sign-on integration', included: true, highlight: true },
      { id: 'F5', name: 'Audit Logs', description: 'Complete audit trail', included: true },
      { id: 'F6', name: 'Custom Integrations', description: 'Custom integration support', included: true }
    ],
    limits: [
      { name: 'Documents', value: 'unlimited', unit: 'documents' },
      { name: 'Storage', value: 'unlimited', unit: 'GB' },
      { name: 'Users', value: 'unlimited', unit: 'users' },
      { name: 'Signatures', value: 'unlimited', unit: 'per month' }
    ],
    isPopular: false,
    isActive: true
  }
];

const subscriptions: Subscription[] = [];

export function getPricingPlans(): PricingPlan[] {
  return pricingPlans.filter(p => p.isActive);
}

export function getPlanById(planId: string): PricingPlan | undefined {
  return pricingPlans.find(p => p.id === planId);
}

export function createSubscription(
  userId: string,
  planId: string,
  startTrial: boolean = false
): Subscription | null {
  const plan = pricingPlans.find(p => p.id === planId);
  if (!plan) return null;

  const now = Date.now();
  const periodEnd = now + (plan.billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000;

  const subscription: Subscription = {
    id: `SUB-${Date.now().toString(36)}`,
    userId,
    planId,
    status: startTrial && plan.trialDays ? 'trialing' : 'active',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    trialEnd: startTrial && plan.trialDays ? now + plan.trialDays * 24 * 60 * 60 * 1000 : undefined,
    createdAt: now
  };
  subscriptions.push(subscription);
  return subscription;
}

export function cancelSubscription(subscriptionId: string, immediate: boolean = false): boolean {
  const subscription = subscriptions.find(s => s.id === subscriptionId);
  if (!subscription) return false;

  if (immediate) {
    subscription.status = 'cancelled';
  } else {
    subscription.cancelAtPeriodEnd = true;
  }
  return true;
}

export function getUserSubscription(userId: string): Subscription | undefined {
  return subscriptions.find(s => s.userId === userId && s.status !== 'cancelled');
}

// ============================================================================
// DOCUMENT WORKFLOW
// ============================================================================

export interface DocumentWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  createdBy: string;
  createdAt: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'review' | 'approval' | 'signature' | 'notification' | 'condition';
  assignees: string[];
  dueInDays?: number;
  conditions?: WorkflowCondition[];
  nextStepOnApprove?: string;
  nextStepOnReject?: string;
}

export interface WorkflowTrigger {
  type: 'document_created' | 'document_updated' | 'manual' | 'scheduled';
  documentTypes?: string[];
  schedule?: string;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  documentId: string;
  currentStepId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  stepHistory: StepExecution[];
  startedAt: number;
  completedAt?: number;
}

export interface StepExecution {
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'skipped';
  assignee?: string;
  startedAt: number;
  completedAt?: number;
  notes?: string;
}

const workflows: DocumentWorkflow[] = [];
const workflowInstances: WorkflowInstance[] = [];

export function createWorkflow(
  name: string,
  description: string,
  createdBy: string
): DocumentWorkflow {
  const workflow: DocumentWorkflow = {
    id: `WF-${Date.now().toString(36)}`,
    name,
    description,
    steps: [],
    triggers: [],
    status: 'draft',
    createdBy,
    createdAt: Date.now()
  };
  workflows.push(workflow);
  return workflow;
}

export function addWorkflowStep(
  workflowId: string,
  name: string,
  type: WorkflowStep['type'],
  assignees: string[]
): WorkflowStep | null {
  const workflow = workflows.find(w => w.id === workflowId);
  if (!workflow) return null;

  const step: WorkflowStep = {
    id: `STEP-${Date.now().toString(36)}`,
    name,
    type,
    assignees
  };
  workflow.steps.push(step);
  return step;
}

export function startWorkflow(
  workflowId: string,
  documentId: string
): WorkflowInstance | null {
  const workflow = workflows.find(w => w.id === workflowId && w.status === 'active');
  if (!workflow || workflow.steps.length === 0) return null;

  const instance: WorkflowInstance = {
    id: `WFI-${Date.now().toString(36)}`,
    workflowId,
    documentId,
    currentStepId: workflow.steps[0].id,
    status: 'running',
    stepHistory: [{
      stepId: workflow.steps[0].id,
      status: 'in_progress',
      startedAt: Date.now()
    }],
    startedAt: Date.now()
  };
  workflowInstances.push(instance);
  return instance;
}

export function completeWorkflowStep(
  instanceId: string,
  approved: boolean,
  notes?: string
): boolean {
  const instance = workflowInstances.find(i => i.id === instanceId);
  if (!instance || instance.status !== 'running') return false;

  const workflow = workflows.find(w => w.id === instance.workflowId);
  if (!workflow) return false;

  const currentExecution = instance.stepHistory.find(
    h => h.stepId === instance.currentStepId && h.status === 'in_progress'
  );
  if (!currentExecution) return false;

  currentExecution.status = approved ? 'completed' : 'rejected';
  currentExecution.completedAt = Date.now();
  currentExecution.notes = notes;

  // Find next step
  const currentStepIndex = workflow.steps.findIndex(s => s.id === instance.currentStepId);
  const currentStep = workflow.steps[currentStepIndex];
  
  let nextStepId: string | undefined;
  if (approved && currentStep.nextStepOnApprove) {
    nextStepId = currentStep.nextStepOnApprove;
  } else if (!approved && currentStep.nextStepOnReject) {
    nextStepId = currentStep.nextStepOnReject;
  } else if (approved && currentStepIndex < workflow.steps.length - 1) {
    nextStepId = workflow.steps[currentStepIndex + 1].id;
  }

  if (nextStepId) {
    instance.currentStepId = nextStepId;
    instance.stepHistory.push({
      stepId: nextStepId,
      status: 'in_progress',
      startedAt: Date.now()
    });
  } else {
    instance.status = approved ? 'completed' : 'failed';
    instance.completedAt = Date.now();
  }

  return true;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const esignatureContractsService = {
  // E-Signature
  createSignatureRequest,
  addSignatureField,
  signDocument,
  declineSignature,
  sendReminder,
  verifySignature,
  // Contracts
  createContract,
  createContractFromTemplate,
  addContractTerm,
  submitForReview,
  approveContract,
  activateContract,
  terminateContract,
  getContractTemplates,
  // Pricing
  getPricingPlans,
  getPlanById,
  createSubscription,
  cancelSubscription,
  getUserSubscription,
  // Workflow
  createWorkflow,
  addWorkflowStep,
  startWorkflow,
  completeWorkflowStep
};

export default esignatureContractsService;
