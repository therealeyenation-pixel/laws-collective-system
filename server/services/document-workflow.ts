/**
 * Document Workflow Service
 * Phase 80: Document status, approval workflow, e-signature integration
 */

export type DocumentStatus = 'draft' | 'review' | 'approved' | 'official' | 'archived' | 'rejected';
export type ApprovalType = 'single' | 'sequential' | 'parallel' | 'consensus';
export type SignatureType = 'typed' | 'drawn' | 'uploaded';

export interface Document {
  documentId: string;
  title: string;
  type: string;
  content: string;
  status: DocumentStatus;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  approvalWorkflow?: ApprovalWorkflow;
  signatures: DocumentSignature[];
  history: DocumentHistoryEntry[];
  metadata: Record<string, string>;
}

export interface ApprovalWorkflow {
  workflowId: string;
  type: ApprovalType;
  approvers: Approver[];
  currentStep: number;
  requiredApprovals: number;
  completedApprovals: number;
  deadline?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

export interface Approver {
  approverId: string;
  userId: string;
  name: string;
  role: string;
  order: number;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedAt?: Date;
  comments?: string;
}

export interface DocumentSignature {
  signatureId: string;
  signerId: string;
  signerName: string;
  type: SignatureType;
  data: string;
  hash: string;
  timestamp: Date;
  ipAddress?: string;
  verified: boolean;
}

export interface DocumentHistoryEntry {
  entryId: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details: string;
  previousStatus?: DocumentStatus;
  newStatus?: DocumentStatus;
}

export interface SignatureRequest {
  requestId: string;
  documentId: string;
  requestedBy: string;
  signers: SignerRequest[];
  message: string;
  deadline?: Date;
  status: 'pending' | 'partial' | 'completed' | 'expired';
  createdAt: Date;
}

export interface SignerRequest {
  signerId: string;
  email: string;
  name: string;
  order: number;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: Date;
}

export function createDocument(
  title: string,
  type: string,
  content: string,
  createdBy: string
): Document {
  return {
    documentId: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    type,
    content,
    status: 'draft',
    version: 1,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    signatures: [],
    history: [{
      entryId: `hist-${Date.now()}`,
      action: 'created',
      userId: createdBy,
      userName: createdBy,
      timestamp: new Date(),
      details: 'Document created',
      newStatus: 'draft'
    }],
    metadata: {}
  };
}

export function updateDocumentStatus(
  document: Document,
  newStatus: DocumentStatus,
  userId: string,
  userName: string,
  reason?: string
): Document {
  const historyEntry: DocumentHistoryEntry = {
    entryId: `hist-${Date.now()}`,
    action: `status_changed`,
    userId,
    userName,
    timestamp: new Date(),
    details: reason || `Status changed from ${document.status} to ${newStatus}`,
    previousStatus: document.status,
    newStatus
  };

  return {
    ...document,
    status: newStatus,
    updatedAt: new Date(),
    history: [...document.history, historyEntry]
  };
}

export function createApprovalWorkflow(
  type: ApprovalType,
  approvers: { userId: string; name: string; role: string }[],
  deadline?: Date
): ApprovalWorkflow {
  return {
    workflowId: `wf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    approvers: approvers.map((a, idx) => ({
      approverId: `approver-${idx}`,
      userId: a.userId,
      name: a.name,
      role: a.role,
      order: idx + 1,
      status: 'pending'
    })),
    currentStep: 1,
    requiredApprovals: type === 'consensus' ? approvers.length : 
                       type === 'single' ? 1 : approvers.length,
    completedApprovals: 0,
    deadline,
    status: 'pending'
  };
}

export function attachWorkflow(
  document: Document,
  workflow: ApprovalWorkflow
): Document {
  return {
    ...document,
    approvalWorkflow: { ...workflow, status: 'in_progress' },
    status: 'review',
    updatedAt: new Date(),
    history: [...document.history, {
      entryId: `hist-${Date.now()}`,
      action: 'workflow_attached',
      userId: document.createdBy,
      userName: document.createdBy,
      timestamp: new Date(),
      details: `Approval workflow attached (${workflow.type})`,
      previousStatus: document.status,
      newStatus: 'review'
    }]
  };
}

export function recordApproval(
  document: Document,
  approverId: string,
  approved: boolean,
  comments?: string
): Document {
  if (!document.approvalWorkflow) {
    throw new Error('No approval workflow attached');
  }

  const workflow = document.approvalWorkflow;
  const approverIndex = workflow.approvers.findIndex(a => a.approverId === approverId);
  
  if (approverIndex === -1) {
    throw new Error('Approver not found in workflow');
  }

  const updatedApprovers = [...workflow.approvers];
  updatedApprovers[approverIndex] = {
    ...updatedApprovers[approverIndex],
    status: approved ? 'approved' : 'rejected',
    approvedAt: new Date(),
    comments
  };

  const completedApprovals = updatedApprovers.filter(a => a.status === 'approved').length;
  const rejections = updatedApprovers.filter(a => a.status === 'rejected').length;

  let workflowStatus: ApprovalWorkflow['status'] = 'in_progress';
  let documentStatus = document.status;

  if (rejections > 0 && workflow.type !== 'parallel') {
    workflowStatus = 'rejected';
    documentStatus = 'rejected';
  } else if (completedApprovals >= workflow.requiredApprovals) {
    workflowStatus = 'completed';
    documentStatus = 'approved';
  }

  const nextStep = workflow.type === 'sequential' 
    ? Math.min(workflow.currentStep + 1, workflow.approvers.length)
    : workflow.currentStep;

  return {
    ...document,
    status: documentStatus,
    approvalWorkflow: {
      ...workflow,
      approvers: updatedApprovers,
      completedApprovals,
      currentStep: nextStep,
      status: workflowStatus
    },
    updatedAt: new Date(),
    history: [...document.history, {
      entryId: `hist-${Date.now()}`,
      action: approved ? 'approved' : 'rejected',
      userId: updatedApprovers[approverIndex].userId,
      userName: updatedApprovers[approverIndex].name,
      timestamp: new Date(),
      details: comments || (approved ? 'Document approved' : 'Document rejected'),
      previousStatus: document.status,
      newStatus: documentStatus
    }]
  };
}

function generateHash(data: string): string {
  // Simple hash for demo - in production use crypto.subtle.digest
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function addSignature(
  document: Document,
  signerId: string,
  signerName: string,
  type: SignatureType,
  signatureData: string,
  ipAddress?: string
): Document {
  const signature: DocumentSignature = {
    signatureId: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    signerId,
    signerName,
    type,
    data: signatureData,
    hash: generateHash(`${signerId}:${signatureData}:${Date.now()}`),
    timestamp: new Date(),
    ipAddress,
    verified: true
  };

  return {
    ...document,
    signatures: [...document.signatures, signature],
    updatedAt: new Date(),
    history: [...document.history, {
      entryId: `hist-${Date.now()}`,
      action: 'signed',
      userId: signerId,
      userName: signerName,
      timestamp: new Date(),
      details: `Document signed (${type} signature)`
    }]
  };
}

export function createSignatureRequest(
  documentId: string,
  requestedBy: string,
  signers: { email: string; name: string }[],
  message: string,
  deadline?: Date
): SignatureRequest {
  return {
    requestId: `sigreq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    documentId,
    requestedBy,
    signers: signers.map((s, idx) => ({
      signerId: `signer-${idx}`,
      email: s.email,
      name: s.name,
      order: idx + 1,
      status: 'pending'
    })),
    message,
    deadline,
    status: 'pending',
    createdAt: new Date()
  };
}

export function updateSignatureRequest(
  request: SignatureRequest,
  signerId: string,
  signed: boolean
): SignatureRequest {
  const signerIndex = request.signers.findIndex(s => s.signerId === signerId);
  if (signerIndex === -1) {
    throw new Error('Signer not found');
  }

  const updatedSigners = [...request.signers];
  updatedSigners[signerIndex] = {
    ...updatedSigners[signerIndex],
    status: signed ? 'signed' : 'declined',
    signedAt: signed ? new Date() : undefined
  };

  const signedCount = updatedSigners.filter(s => s.status === 'signed').length;
  const status = signedCount === updatedSigners.length ? 'completed' :
                 signedCount > 0 ? 'partial' : 'pending';

  return {
    ...request,
    signers: updatedSigners,
    status
  };
}

export function makeOfficial(
  document: Document,
  userId: string,
  userName: string
): Document {
  if (document.status !== 'approved') {
    throw new Error('Document must be approved before making official');
  }

  return updateDocumentStatus(document, 'official', userId, userName, 'Document marked as official');
}

export function archiveDocument(
  document: Document,
  userId: string,
  userName: string,
  reason: string
): Document {
  return updateDocumentStatus(document, 'archived', userId, userName, `Archived: ${reason}`);
}

export function getDocumentAuditTrail(document: Document): string {
  return `
DOCUMENT AUDIT TRAIL
====================
Document: ${document.title}
ID: ${document.documentId}
Current Status: ${document.status.toUpperCase()}
Version: ${document.version}

HISTORY
-------
${document.history.map(h => 
  `[${h.timestamp.toISOString()}] ${h.action.toUpperCase()} by ${h.userName}
   ${h.details}${h.previousStatus ? ` (${h.previousStatus} → ${h.newStatus})` : ''}`
).join('\n\n')}

SIGNATURES
----------
${document.signatures.length > 0 
  ? document.signatures.map(s => 
      `${s.signerName} (${s.type}) - ${s.timestamp.toISOString()}
       Hash: ${s.hash}`
    ).join('\n')
  : 'No signatures'}

${document.approvalWorkflow ? `
APPROVAL WORKFLOW
-----------------
Type: ${document.approvalWorkflow.type}
Status: ${document.approvalWorkflow.status}
Approvals: ${document.approvalWorkflow.completedApprovals}/${document.approvalWorkflow.requiredApprovals}

Approvers:
${document.approvalWorkflow.approvers.map(a => 
  `- ${a.name} (${a.role}): ${a.status.toUpperCase()}${a.approvedAt ? ` on ${a.approvedAt.toISOString()}` : ''}`
).join('\n')}
` : ''}
`;
}

export const documentWorkflow = {
  createDocument,
  updateDocumentStatus,
  createApprovalWorkflow,
  attachWorkflow,
  recordApproval,
  addSignature,
  createSignatureRequest,
  updateSignatureRequest,
  makeOfficial,
  archiveDocument,
  getDocumentAuditTrail
};
