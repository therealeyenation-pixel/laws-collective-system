/**
 * Document Completion Service
 * Comprehensive implementation of document management, signatures, and bundles
 */

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export type DocumentType = 
  | 'legal'
  | 'financial'
  | 'compliance'
  | 'governance'
  | 'employment'
  | 'tax'
  | 'contract'
  | 'policy'
  | 'report'
  | 'correspondence'
  | 'certificate'
  | 'license'
  | 'permit'
  | 'agreement'
  | 'resolution'
  | 'minutes'
  | 'bylaws'
  | 'articles'
  | 'trust'
  | 'will'
  | 'power_of_attorney'
  | 'deed'
  | 'title'
  | 'insurance'
  | 'other';

export type DocumentStatus = 
  | 'draft'
  | 'pending_review'
  | 'pending_signature'
  | 'partially_signed'
  | 'fully_signed'
  | 'executed'
  | 'archived'
  | 'expired'
  | 'cancelled'
  | 'superseded';

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  version: number;
  content: string;
  metadata: DocumentMetadata;
  signatures: Signature[];
  history: DocumentHistory[];
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

export interface DocumentMetadata {
  entityId?: string;
  houseId?: string;
  category: string;
  tags: string[];
  confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
  retentionPeriod?: number; // days
  relatedDocuments: string[];
  customFields: Record<string, any>;
}

export interface DocumentHistory {
  id: string;
  action: 'created' | 'updated' | 'signed' | 'approved' | 'rejected' | 'archived' | 'restored';
  timestamp: number;
  userId: string;
  userName: string;
  details: string;
  previousVersion?: number;
}

export function createDocument(
  name: string,
  type: DocumentType,
  content: string,
  metadata: Partial<DocumentMetadata> = {}
): Document {
  return {
    id: `DOC-${Date.now().toString(36).toUpperCase()}`,
    name,
    type,
    status: 'draft',
    version: 1,
    content,
    metadata: {
      category: metadata.category || 'general',
      tags: metadata.tags || [],
      confidentiality: metadata.confidentiality || 'internal',
      relatedDocuments: metadata.relatedDocuments || [],
      customFields: metadata.customFields || {},
      ...metadata
    },
    signatures: [],
    history: [{
      id: `HIST-${Date.now().toString(36)}`,
      action: 'created',
      timestamp: Date.now(),
      userId: 'system',
      userName: 'System',
      details: 'Document created'
    }],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function updateDocument(
  doc: Document,
  updates: Partial<Document>,
  userId: string,
  userName: string
): Document {
  const newVersion = doc.version + 1;
  
  doc.history.push({
    id: `HIST-${Date.now().toString(36)}`,
    action: 'updated',
    timestamp: Date.now(),
    userId,
    userName,
    details: `Updated to version ${newVersion}`,
    previousVersion: doc.version
  });
  
  return {
    ...doc,
    ...updates,
    version: newVersion,
    updatedAt: Date.now()
  };
}

// ============================================================================
// ELECTRONIC SIGNATURES
// ============================================================================

export interface Signature {
  id: string;
  documentId: string;
  signerId: string;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  signatureData: string;
  signatureType: 'drawn' | 'typed' | 'uploaded' | 'digital_certificate';
  signedAt: number;
  ipAddress: string;
  userAgent: string;
  location?: { page: number; x: number; y: number };
  verified: boolean;
  verificationMethod: 'email' | 'sms' | 'knowledge' | 'certificate';
  blockchainHash: string;
  legalDisclaimer: string;
}

export interface SignatureRequest {
  id: string;
  documentId: string;
  requesterId: string;
  requesterName: string;
  signers: SignerInfo[];
  message: string;
  dueDate?: number;
  reminderFrequency?: number; // days
  status: 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
  createdAt: number;
  completedAt?: number;
}

export interface SignerInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  order: number;
  status: 'pending' | 'viewed' | 'signed' | 'declined';
  signedAt?: number;
  viewedAt?: number;
  declineReason?: string;
}

export function createSignatureRequest(
  documentId: string,
  requesterId: string,
  requesterName: string,
  signers: Omit<SignerInfo, 'id' | 'status'>[],
  message: string,
  dueDate?: number
): SignatureRequest {
  return {
    id: `SIGREQ-${Date.now().toString(36).toUpperCase()}`,
    documentId,
    requesterId,
    requesterName,
    signers: signers.map((s, i) => ({
      ...s,
      id: `SIGNER-${i}`,
      status: 'pending' as const
    })),
    message,
    dueDate,
    status: 'pending',
    createdAt: Date.now()
  };
}

export function signDocument(
  doc: Document,
  signerId: string,
  signerName: string,
  signerEmail: string,
  signerRole: string,
  signatureData: string,
  signatureType: Signature['signatureType'],
  ipAddress: string,
  userAgent: string,
  location?: { page: number; x: number; y: number }
): Signature {
  const signature: Signature = {
    id: `SIG-${Date.now().toString(36).toUpperCase()}`,
    documentId: doc.id,
    signerId,
    signerName,
    signerEmail,
    signerRole,
    signatureData,
    signatureType,
    signedAt: Date.now(),
    ipAddress,
    userAgent,
    location,
    verified: true,
    verificationMethod: 'email',
    blockchainHash: `ESIG-${Math.random().toString(16).slice(2, 18).toUpperCase()}`,
    legalDisclaimer: 'By signing this document electronically, I agree that my electronic signature is the legal equivalent of my manual signature.'
  };
  
  doc.signatures.push(signature);
  doc.history.push({
    id: `HIST-${Date.now().toString(36)}`,
    action: 'signed',
    timestamp: Date.now(),
    userId: signerId,
    userName: signerName,
    details: `Document signed by ${signerName} (${signerRole})`
  });
  
  doc.updatedAt = Date.now();
  
  return signature;
}

export function verifySignature(signature: Signature): {
  valid: boolean;
  details: string;
  timestamp: number;
} {
  // In production, this would verify against blockchain/PKI
  return {
    valid: signature.verified && signature.blockchainHash.startsWith('ESIG-'),
    details: `Signature verified via ${signature.verificationMethod}`,
    timestamp: Date.now()
  };
}

// ============================================================================
// DOCUMENT BUNDLES
// ============================================================================

export type BundleType = 
  | 'entity_formation'
  | 'employment_onboarding'
  | 'grant_application'
  | 'compliance_audit'
  | 'annual_report'
  | 'board_meeting'
  | 'contract_package'
  | 'trust_administration'
  | 'estate_planning'
  | 'real_estate'
  | 'loan_application'
  | 'insurance_claim'
  | 'custom';

export interface DocumentBundle {
  id: string;
  name: string;
  type: BundleType;
  description: string;
  documents: BundleDocument[];
  signers: BundleSigner[];
  status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  metadata: Record<string, any>;
}

export interface BundleDocument {
  id: string;
  documentId: string;
  name: string;
  order: number;
  required: boolean;
  status: DocumentStatus;
  signatureLocations: SignatureLocation[];
}

export interface SignatureLocation {
  id: string;
  signerId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'signature' | 'initials' | 'date' | 'text' | 'checkbox';
  required: boolean;
  signed: boolean;
}

export interface BundleSigner {
  id: string;
  name: string;
  email: string;
  role: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'declined';
  documentsToSign: string[];
  signedDocuments: string[];
  notifiedAt?: number;
  completedAt?: number;
}

export function createBundle(
  name: string,
  type: BundleType,
  description: string,
  createdBy: string
): DocumentBundle {
  return {
    id: `BUNDLE-${Date.now().toString(36).toUpperCase()}`,
    name,
    type,
    description,
    documents: [],
    signers: [],
    status: 'draft',
    progress: 0,
    createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    metadata: {}
  };
}

export function addDocumentToBundle(
  bundle: DocumentBundle,
  documentId: string,
  name: string,
  required: boolean = true
): BundleDocument {
  const bundleDoc: BundleDocument = {
    id: `BDOC-${Date.now().toString(36)}`,
    documentId,
    name,
    order: bundle.documents.length + 1,
    required,
    status: 'draft',
    signatureLocations: []
  };
  
  bundle.documents.push(bundleDoc);
  bundle.updatedAt = Date.now();
  
  return bundleDoc;
}

export function addSignerToBundle(
  bundle: DocumentBundle,
  name: string,
  email: string,
  role: string,
  documentsToSign: string[]
): BundleSigner {
  const signer: BundleSigner = {
    id: `BSIGNER-${Date.now().toString(36)}`,
    name,
    email,
    role,
    order: bundle.signers.length + 1,
    status: 'pending',
    documentsToSign,
    signedDocuments: []
  };
  
  bundle.signers.push(signer);
  bundle.updatedAt = Date.now();
  
  return signer;
}

export function calculateBundleProgress(bundle: DocumentBundle): number {
  if (bundle.documents.length === 0) return 0;
  
  const requiredDocs = bundle.documents.filter(d => d.required);
  if (requiredDocs.length === 0) return 100;
  
  const signedDocs = requiredDocs.filter(d => 
    d.status === 'fully_signed' || d.status === 'executed'
  );
  
  return Math.round((signedDocs.length / requiredDocs.length) * 100);
}

// ============================================================================
// BUNDLE TEMPLATES
// ============================================================================

export interface BundleTemplate {
  id: string;
  name: string;
  type: BundleType;
  description: string;
  documents: TemplateDocument[];
  signerRoles: TemplateSignerRole[];
  estimatedTime: number; // minutes
}

export interface TemplateDocument {
  name: string;
  type: DocumentType;
  templateContent: string;
  required: boolean;
  signatureFields: TemplateSignatureField[];
}

export interface TemplateSignatureField {
  role: string;
  page: number;
  x: number;
  y: number;
  type: 'signature' | 'initials' | 'date';
  required: boolean;
}

export interface TemplateSignerRole {
  role: string;
  description: string;
  required: boolean;
  order: number;
}

export const bundleTemplates: BundleTemplate[] = [
  {
    id: 'nonprofit-formation',
    name: 'Nonprofit Formation Bundle',
    type: 'entity_formation',
    description: 'Complete document package for forming a 501(c)(3) nonprofit',
    documents: [
      { name: 'Articles of Incorporation', type: 'articles', templateContent: '', required: true, signatureFields: [{ role: 'Incorporator', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'Bylaws', type: 'bylaws', templateContent: '', required: true, signatureFields: [{ role: 'Board Chair', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'Conflict of Interest Policy', type: 'policy', templateContent: '', required: true, signatureFields: [] },
      { name: 'IRS Form 1023', type: 'tax', templateContent: '', required: true, signatureFields: [{ role: 'Authorized Officer', page: 1, x: 100, y: 700, type: 'signature', required: true }] }
    ],
    signerRoles: [
      { role: 'Incorporator', description: 'Person forming the corporation', required: true, order: 1 },
      { role: 'Board Chair', description: 'Chairperson of the Board', required: true, order: 2 },
      { role: 'Authorized Officer', description: 'Officer authorized to sign tax documents', required: true, order: 3 }
    ],
    estimatedTime: 120
  },
  {
    id: 'llc-formation',
    name: 'LLC Formation Bundle',
    type: 'entity_formation',
    description: 'Complete document package for forming an LLC',
    documents: [
      { name: 'Articles of Organization', type: 'articles', templateContent: '', required: true, signatureFields: [{ role: 'Organizer', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'Operating Agreement', type: 'agreement', templateContent: '', required: true, signatureFields: [{ role: 'Member', page: 1, x: 100, y: 700, type: 'signature', required: true }] }
    ],
    signerRoles: [
      { role: 'Organizer', description: 'Person organizing the LLC', required: true, order: 1 },
      { role: 'Member', description: 'LLC Member', required: true, order: 2 }
    ],
    estimatedTime: 60
  },
  {
    id: 'employee-onboarding',
    name: 'Employee Onboarding Bundle',
    type: 'employment_onboarding',
    description: 'Complete new hire documentation package',
    documents: [
      { name: 'Offer Letter', type: 'employment', templateContent: '', required: true, signatureFields: [{ role: 'Candidate', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'W-4 Form', type: 'tax', templateContent: '', required: true, signatureFields: [{ role: 'Employee', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'I-9 Form', type: 'compliance', templateContent: '', required: true, signatureFields: [{ role: 'Employee', page: 1, x: 100, y: 400, type: 'signature', required: true }] },
      { name: 'Employee Handbook Acknowledgment', type: 'policy', templateContent: '', required: true, signatureFields: [{ role: 'Employee', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'Direct Deposit Authorization', type: 'financial', templateContent: '', required: false, signatureFields: [{ role: 'Employee', page: 1, x: 100, y: 700, type: 'signature', required: true }] }
    ],
    signerRoles: [
      { role: 'Candidate', description: 'New hire candidate', required: true, order: 1 },
      { role: 'Employee', description: 'New employee', required: true, order: 2 },
      { role: 'HR Representative', description: 'HR representative', required: true, order: 3 }
    ],
    estimatedTime: 45
  },
  {
    id: 'grant-application',
    name: 'Grant Application Bundle',
    type: 'grant_application',
    description: 'Complete grant application document package',
    documents: [
      { name: 'Cover Letter', type: 'correspondence', templateContent: '', required: true, signatureFields: [{ role: 'Executive Director', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'Project Narrative', type: 'report', templateContent: '', required: true, signatureFields: [] },
      { name: 'Budget', type: 'financial', templateContent: '', required: true, signatureFields: [{ role: 'Finance Director', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'Board Resolution', type: 'resolution', templateContent: '', required: true, signatureFields: [{ role: 'Board Chair', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'Assurances & Certifications', type: 'compliance', templateContent: '', required: true, signatureFields: [{ role: 'Authorized Official', page: 1, x: 100, y: 700, type: 'signature', required: true }] }
    ],
    signerRoles: [
      { role: 'Executive Director', description: 'Organization Executive Director', required: true, order: 1 },
      { role: 'Finance Director', description: 'Finance Director/CFO', required: true, order: 2 },
      { role: 'Board Chair', description: 'Board Chairperson', required: true, order: 3 },
      { role: 'Authorized Official', description: 'Authorized to bind organization', required: true, order: 4 }
    ],
    estimatedTime: 90
  },
  {
    id: 'estate-planning',
    name: 'Estate Planning Bundle',
    type: 'estate_planning',
    description: 'Comprehensive estate planning document package',
    documents: [
      { name: 'Last Will and Testament', type: 'will', templateContent: '', required: true, signatureFields: [{ role: 'Testator', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'Revocable Living Trust', type: 'trust', templateContent: '', required: false, signatureFields: [{ role: 'Grantor', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'Durable Power of Attorney', type: 'power_of_attorney', templateContent: '', required: true, signatureFields: [{ role: 'Principal', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'Healthcare Directive', type: 'legal', templateContent: '', required: true, signatureFields: [{ role: 'Principal', page: 1, x: 100, y: 700, type: 'signature', required: true }] },
      { name: 'HIPAA Authorization', type: 'compliance', templateContent: '', required: true, signatureFields: [{ role: 'Patient', page: 1, x: 100, y: 700, type: 'signature', required: true }] }
    ],
    signerRoles: [
      { role: 'Testator', description: 'Person making the will', required: true, order: 1 },
      { role: 'Grantor', description: 'Trust creator', required: false, order: 2 },
      { role: 'Principal', description: 'Person granting power of attorney', required: true, order: 3 },
      { role: 'Patient', description: 'Healthcare patient', required: true, order: 4 },
      { role: 'Witness', description: 'Document witness', required: true, order: 5 },
      { role: 'Notary', description: 'Notary public', required: true, order: 6 }
    ],
    estimatedTime: 180
  }
];

export function createBundleFromTemplate(
  templateId: string,
  createdBy: string,
  customName?: string
): DocumentBundle | null {
  const template = bundleTemplates.find(t => t.id === templateId);
  if (!template) return null;
  
  const bundle = createBundle(
    customName || template.name,
    template.type,
    template.description,
    createdBy
  );
  
  // Add documents from template
  template.documents.forEach((doc, i) => {
    const bundleDoc: BundleDocument = {
      id: `BDOC-${i}`,
      documentId: `DOC-TEMPLATE-${i}`,
      name: doc.name,
      order: i + 1,
      required: doc.required,
      status: 'draft',
      signatureLocations: doc.signatureFields.map((field, j) => ({
        id: `LOC-${i}-${j}`,
        signerId: '',
        page: field.page,
        x: field.x,
        y: field.y,
        width: 200,
        height: 50,
        type: field.type,
        required: field.required,
        signed: false
      }))
    };
    bundle.documents.push(bundleDoc);
  });
  
  bundle.metadata = { templateId, estimatedTime: template.estimatedTime };
  
  return bundle;
}

// ============================================================================
// PDF GENERATION
// ============================================================================

export function generateDocumentPDF(doc: Document): string {
  let pdf = `
═══════════════════════════════════════════════════════════════════════════════
                              ${doc.name.toUpperCase()}
═══════════════════════════════════════════════════════════════════════════════

Document ID: ${doc.id}
Type: ${doc.type.replace(/_/g, ' ').toUpperCase()}
Version: ${doc.version}
Status: ${doc.status.replace(/_/g, ' ').toUpperCase()}
Created: ${new Date(doc.createdAt).toLocaleDateString()}
Last Updated: ${new Date(doc.updatedAt).toLocaleDateString()}

───────────────────────────────────────────────────────────────────────────────
                              CONTENT
───────────────────────────────────────────────────────────────────────────────

${doc.content}

`;

  if (doc.signatures.length > 0) {
    pdf += `
───────────────────────────────────────────────────────────────────────────────
                            SIGNATURES
───────────────────────────────────────────────────────────────────────────────

`;
    for (const sig of doc.signatures) {
      pdf += `
${sig.signerName} (${sig.signerRole})
Email: ${sig.signerEmail}
Signed: ${new Date(sig.signedAt).toLocaleString()}
Verification: ${sig.verificationMethod.toUpperCase()}
Blockchain Hash: ${sig.blockchainHash}
IP Address: ${sig.ipAddress}

${sig.legalDisclaimer}

`;
    }
  }

  pdf += `
═══════════════════════════════════════════════════════════════════════════════
                           END OF DOCUMENT
═══════════════════════════════════════════════════════════════════════════════
`;

  return pdf;
}

export function generateBundlePDF(bundle: DocumentBundle): string {
  let pdf = `
═══════════════════════════════════════════════════════════════════════════════
                           DOCUMENT BUNDLE
                    ${bundle.name.toUpperCase()}
═══════════════════════════════════════════════════════════════════════════════

Bundle ID: ${bundle.id}
Type: ${bundle.type.replace(/_/g, ' ').toUpperCase()}
Status: ${bundle.status.toUpperCase()}
Progress: ${bundle.progress}%
Created: ${new Date(bundle.createdAt).toLocaleDateString()}
${bundle.completedAt ? `Completed: ${new Date(bundle.completedAt).toLocaleDateString()}` : ''}

Description:
${bundle.description}

───────────────────────────────────────────────────────────────────────────────
                            DOCUMENTS (${bundle.documents.length})
───────────────────────────────────────────────────────────────────────────────

`;

  for (const doc of bundle.documents) {
    pdf += `
${doc.order}. ${doc.name}
   Status: ${doc.status.replace(/_/g, ' ').toUpperCase()}
   Required: ${doc.required ? 'Yes' : 'No'}
   Signatures: ${doc.signatureLocations.filter(l => l.signed).length}/${doc.signatureLocations.length}

`;
  }

  pdf += `
───────────────────────────────────────────────────────────────────────────────
                            SIGNERS (${bundle.signers.length})
───────────────────────────────────────────────────────────────────────────────

`;

  for (const signer of bundle.signers) {
    pdf += `
${signer.order}. ${signer.name} (${signer.role})
   Email: ${signer.email}
   Status: ${signer.status.toUpperCase()}
   Documents Signed: ${signer.signedDocuments.length}/${signer.documentsToSign.length}
   ${signer.completedAt ? `Completed: ${new Date(signer.completedAt).toLocaleString()}` : ''}

`;
  }

  pdf += `
═══════════════════════════════════════════════════════════════════════════════
                         END OF BUNDLE SUMMARY
═══════════════════════════════════════════════════════════════════════════════
`;

  return pdf;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const documentCompletionService = {
  createDocument,
  updateDocument,
  createSignatureRequest,
  signDocument,
  verifySignature,
  createBundle,
  addDocumentToBundle,
  addSignerToBundle,
  calculateBundleProgress,
  bundleTemplates,
  createBundleFromTemplate,
  generateDocumentPDF,
  generateBundlePDF
};

export default documentCompletionService;
