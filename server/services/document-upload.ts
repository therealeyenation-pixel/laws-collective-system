/**
 * Document Upload Service
 * Phase 56.2: Upload trust documents and link businesses to House structure
 */

export type TrustDocumentType = 
  | 'trust_agreement'
  | 'trust_amendment'
  | 'certificate_of_trust'
  | 'schedule_a'
  | 'pour_over_will'
  | 'power_of_attorney'
  | 'healthcare_directive'
  | 'beneficiary_designation'
  | 'trustee_acceptance'
  | 'trust_certification';

export type BusinessDocumentType =
  | 'articles_of_organization'
  | 'articles_of_incorporation'
  | 'operating_agreement'
  | 'bylaws'
  | 'ein_letter'
  | 'business_license'
  | 'annual_report'
  | 'registered_agent'
  | 'certificate_of_good_standing'
  | 'meeting_minutes'
  | 'resolution'
  | 'stock_certificate'
  | 'membership_certificate';

export type DocumentCategory = 'trust' | 'business' | 'personal' | 'legal' | 'financial';

export interface UploadedDocument {
  documentId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  s3Key: string;
  s3Url: string;
  category: DocumentCategory;
  documentType: TrustDocumentType | BusinessDocumentType | string;
  title: string;
  description?: string;
  uploadedBy: number;
  uploadedAt: Date;
  houseId?: number;
  businessEntityId?: number;
  metadata: DocumentMetadata;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  linkedEntities: LinkedEntity[];
}

export interface DocumentMetadata {
  effectiveDate?: Date;
  expirationDate?: Date;
  signatories?: string[];
  notarized?: boolean;
  notaryInfo?: {
    name: string;
    commission: string;
    expirationDate: Date;
  };
  witnesses?: string[];
  pageCount?: number;
  extractedText?: string;
  tags?: string[];
}

export interface LinkedEntity {
  entityType: 'house' | 'business' | 'trust' | 'heir';
  entityId: number;
  entityName: string;
  linkType: 'owner' | 'beneficiary' | 'trustee' | 'member' | 'related';
  linkedAt: Date;
}

export interface BusinessLinkConfig {
  businessEntityId: number;
  businessName: string;
  houseId: number;
  houseName: string;
  ownershipPercentage: number;
  incomeContributionRate: number;
  splitConfiguration: {
    operatingPercentage: number;
    housePercentage: number;
  };
  linkedDocuments: string[];
}

export interface UploadValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedCategory?: DocumentCategory;
  suggestedType?: string;
  extractedInfo?: {
    title?: string;
    effectiveDate?: string;
    parties?: string[];
  };
}

// Supported file types for upload
export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/tiff',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Document type labels
export const TRUST_DOCUMENT_LABELS: Record<TrustDocumentType, string> = {
  trust_agreement: 'Trust Agreement',
  trust_amendment: 'Trust Amendment',
  certificate_of_trust: 'Certificate of Trust',
  schedule_a: 'Schedule A (Asset List)',
  pour_over_will: 'Pour-Over Will',
  power_of_attorney: 'Power of Attorney',
  healthcare_directive: 'Healthcare Directive',
  beneficiary_designation: 'Beneficiary Designation',
  trustee_acceptance: 'Trustee Acceptance',
  trust_certification: 'Trust Certification',
};

export const BUSINESS_DOCUMENT_LABELS: Record<BusinessDocumentType, string> = {
  articles_of_organization: 'Articles of Organization',
  articles_of_incorporation: 'Articles of Incorporation',
  operating_agreement: 'Operating Agreement',
  bylaws: 'Corporate Bylaws',
  ein_letter: 'EIN Confirmation Letter',
  business_license: 'Business License',
  annual_report: 'Annual Report',
  registered_agent: 'Registered Agent Designation',
  certificate_of_good_standing: 'Certificate of Good Standing',
  meeting_minutes: 'Meeting Minutes',
  resolution: 'Corporate/LLC Resolution',
  stock_certificate: 'Stock Certificate',
  membership_certificate: 'Membership Certificate',
};

// Validate file for upload
export function validateUpload(
  fileName: string,
  mimeType: string,
  fileSize: number
): UploadValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    errors.push(`File size (${Math.round(fileSize / 1024 / 1024)}MB) exceeds maximum allowed (50MB)`);
  }

  // Check mime type
  if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
    errors.push(`File type '${mimeType}' is not supported. Supported types: PDF, PNG, JPEG, TIFF, DOC, DOCX`);
  }

  // Check file extension matches mime type
  const extension = fileName.split('.').pop()?.toLowerCase();
  const expectedExtensions: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'image/png': ['png'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/tiff': ['tif', 'tiff'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  };

  if (extension && expectedExtensions[mimeType]) {
    if (!expectedExtensions[mimeType].includes(extension)) {
      warnings.push(`File extension '.${extension}' may not match content type '${mimeType}'`);
    }
  }

  // Suggest category based on file name
  let suggestedCategory: DocumentCategory | undefined;
  let suggestedType: string | undefined;

  const lowerName = fileName.toLowerCase();
  if (lowerName.includes('trust') || lowerName.includes('will') || lowerName.includes('poa')) {
    suggestedCategory = 'trust';
    if (lowerName.includes('amendment')) suggestedType = 'trust_amendment';
    else if (lowerName.includes('certificate')) suggestedType = 'certificate_of_trust';
    else if (lowerName.includes('will')) suggestedType = 'pour_over_will';
    else if (lowerName.includes('poa') || lowerName.includes('power')) suggestedType = 'power_of_attorney';
    else suggestedType = 'trust_agreement';
  } else if (lowerName.includes('llc') || lowerName.includes('corp') || lowerName.includes('inc') || lowerName.includes('business')) {
    suggestedCategory = 'business';
    if (lowerName.includes('article')) suggestedType = 'articles_of_organization';
    else if (lowerName.includes('operating')) suggestedType = 'operating_agreement';
    else if (lowerName.includes('bylaw')) suggestedType = 'bylaws';
    else if (lowerName.includes('ein')) suggestedType = 'ein_letter';
    else if (lowerName.includes('license')) suggestedType = 'business_license';
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestedCategory,
    suggestedType,
  };
}

// Generate S3 key for document
export function generateS3Key(
  userId: number,
  category: DocumentCategory,
  fileName: string
): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `documents/${userId}/${category}/${timestamp}-${randomSuffix}-${sanitizedName}`;
}

// Create uploaded document record
export function createUploadedDocument(
  userId: number,
  fileName: string,
  mimeType: string,
  fileSize: number,
  s3Key: string,
  s3Url: string,
  category: DocumentCategory,
  documentType: string,
  title: string,
  options?: {
    description?: string;
    houseId?: number;
    businessEntityId?: number;
    metadata?: Partial<DocumentMetadata>;
  }
): UploadedDocument {
  return {
    documentId: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fileName: s3Key.split('/').pop() || fileName,
    originalName: fileName,
    mimeType,
    fileSize,
    s3Key,
    s3Url,
    category,
    documentType,
    title,
    description: options?.description,
    uploadedBy: userId,
    uploadedAt: new Date(),
    houseId: options?.houseId,
    businessEntityId: options?.businessEntityId,
    metadata: {
      tags: [],
      ...options?.metadata,
    },
    verificationStatus: 'pending',
    linkedEntities: [],
  };
}

// Link document to entity
export function linkDocumentToEntity(
  document: UploadedDocument,
  entityType: LinkedEntity['entityType'],
  entityId: number,
  entityName: string,
  linkType: LinkedEntity['linkType']
): UploadedDocument {
  const existingLink = document.linkedEntities.find(
    (link) => link.entityType === entityType && link.entityId === entityId
  );

  if (existingLink) {
    return document;
  }

  return {
    ...document,
    linkedEntities: [
      ...document.linkedEntities,
      {
        entityType,
        entityId,
        entityName,
        linkType,
        linkedAt: new Date(),
      },
    ],
  };
}

// Unlink document from entity
export function unlinkDocumentFromEntity(
  document: UploadedDocument,
  entityType: LinkedEntity['entityType'],
  entityId: number
): UploadedDocument {
  return {
    ...document,
    linkedEntities: document.linkedEntities.filter(
      (link) => !(link.entityType === entityType && link.entityId === entityId)
    ),
  };
}

// Create business link configuration
export function createBusinessLinkConfig(
  businessEntityId: number,
  businessName: string,
  houseId: number,
  houseName: string,
  options?: {
    ownershipPercentage?: number;
    incomeContributionRate?: number;
    operatingPercentage?: number;
    housePercentage?: number;
  }
): BusinessLinkConfig {
  const operatingPercentage = options?.operatingPercentage ?? 70;
  const housePercentage = options?.housePercentage ?? 30;

  return {
    businessEntityId,
    businessName,
    houseId,
    houseName,
    ownershipPercentage: options?.ownershipPercentage ?? 100,
    incomeContributionRate: options?.incomeContributionRate ?? 100,
    splitConfiguration: {
      operatingPercentage,
      housePercentage,
    },
    linkedDocuments: [],
  };
}

// Validate business link configuration
export function validateBusinessLinkConfig(config: BusinessLinkConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.ownershipPercentage < 0 || config.ownershipPercentage > 100) {
    errors.push('Ownership percentage must be between 0 and 100');
  }

  if (config.incomeContributionRate < 0 || config.incomeContributionRate > 100) {
    errors.push('Income contribution rate must be between 0 and 100');
  }

  const totalSplit = config.splitConfiguration.operatingPercentage + config.splitConfiguration.housePercentage;
  if (totalSplit !== 100) {
    errors.push(`Split configuration must total 100% (currently ${totalSplit}%)`);
  }

  if (config.splitConfiguration.operatingPercentage < 0 || config.splitConfiguration.operatingPercentage > 100) {
    errors.push('Operating percentage must be between 0 and 100');
  }

  if (config.splitConfiguration.housePercentage < 0 || config.splitConfiguration.housePercentage > 100) {
    errors.push('House percentage must be between 0 and 100');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Add document to business link
export function addDocumentToBusinessLink(
  config: BusinessLinkConfig,
  documentId: string
): BusinessLinkConfig {
  if (config.linkedDocuments.includes(documentId)) {
    return config;
  }

  return {
    ...config,
    linkedDocuments: [...config.linkedDocuments, documentId],
  };
}

// Remove document from business link
export function removeDocumentFromBusinessLink(
  config: BusinessLinkConfig,
  documentId: string
): BusinessLinkConfig {
  return {
    ...config,
    linkedDocuments: config.linkedDocuments.filter((id) => id !== documentId),
  };
}

// Get required documents for trust setup
export function getRequiredTrustDocuments(): Array<{
  type: TrustDocumentType;
  label: string;
  required: boolean;
  description: string;
}> {
  return [
    {
      type: 'trust_agreement',
      label: TRUST_DOCUMENT_LABELS.trust_agreement,
      required: true,
      description: 'The main trust document establishing the trust and its terms',
    },
    {
      type: 'certificate_of_trust',
      label: TRUST_DOCUMENT_LABELS.certificate_of_trust,
      required: true,
      description: 'Summary document used to prove trust existence without revealing full terms',
    },
    {
      type: 'schedule_a',
      label: TRUST_DOCUMENT_LABELS.schedule_a,
      required: true,
      description: 'List of assets transferred to the trust',
    },
    {
      type: 'pour_over_will',
      label: TRUST_DOCUMENT_LABELS.pour_over_will,
      required: false,
      description: 'Will that transfers remaining assets to the trust upon death',
    },
    {
      type: 'power_of_attorney',
      label: TRUST_DOCUMENT_LABELS.power_of_attorney,
      required: false,
      description: 'Document granting authority to act on behalf of the grantor',
    },
    {
      type: 'healthcare_directive',
      label: TRUST_DOCUMENT_LABELS.healthcare_directive,
      required: false,
      description: 'Instructions for healthcare decisions if incapacitated',
    },
    {
      type: 'trustee_acceptance',
      label: TRUST_DOCUMENT_LABELS.trustee_acceptance,
      required: false,
      description: 'Document confirming trustee acceptance of duties',
    },
  ];
}

// Get required documents for business linking
export function getRequiredBusinessDocuments(
  entityType: 'llc' | 'corporation' | 'trust' | 'collective'
): Array<{
  type: BusinessDocumentType;
  label: string;
  required: boolean;
  description: string;
}> {
  const commonDocs = [
    {
      type: 'ein_letter' as BusinessDocumentType,
      label: BUSINESS_DOCUMENT_LABELS.ein_letter,
      required: true,
      description: 'IRS letter confirming Employer Identification Number',
    },
    {
      type: 'certificate_of_good_standing' as BusinessDocumentType,
      label: BUSINESS_DOCUMENT_LABELS.certificate_of_good_standing,
      required: false,
      description: 'State certification that entity is in good standing',
    },
    {
      type: 'registered_agent' as BusinessDocumentType,
      label: BUSINESS_DOCUMENT_LABELS.registered_agent,
      required: false,
      description: 'Registered agent designation document',
    },
  ];

  if (entityType === 'llc') {
    return [
      {
        type: 'articles_of_organization',
        label: BUSINESS_DOCUMENT_LABELS.articles_of_organization,
        required: true,
        description: 'State filing document creating the LLC',
      },
      {
        type: 'operating_agreement',
        label: BUSINESS_DOCUMENT_LABELS.operating_agreement,
        required: true,
        description: 'Agreement governing LLC operations and member rights',
      },
      {
        type: 'membership_certificate',
        label: BUSINESS_DOCUMENT_LABELS.membership_certificate,
        required: false,
        description: 'Certificate evidencing membership interest',
      },
      ...commonDocs,
    ];
  }

  if (entityType === 'corporation') {
    return [
      {
        type: 'articles_of_incorporation',
        label: BUSINESS_DOCUMENT_LABELS.articles_of_incorporation,
        required: true,
        description: 'State filing document creating the corporation',
      },
      {
        type: 'bylaws',
        label: BUSINESS_DOCUMENT_LABELS.bylaws,
        required: true,
        description: 'Rules governing corporate operations',
      },
      {
        type: 'stock_certificate',
        label: BUSINESS_DOCUMENT_LABELS.stock_certificate,
        required: false,
        description: 'Certificate evidencing stock ownership',
      },
      ...commonDocs,
    ];
  }

  return commonDocs;
}

// Calculate document upload progress
export function calculateUploadProgress(
  uploadedDocuments: UploadedDocument[],
  requiredDocuments: Array<{ type: string; required: boolean }>
): {
  totalRequired: number;
  uploadedRequired: number;
  totalOptional: number;
  uploadedOptional: number;
  percentComplete: number;
  missingRequired: string[];
} {
  const required = requiredDocuments.filter((d) => d.required);
  const optional = requiredDocuments.filter((d) => !d.required);

  const uploadedTypes = new Set(uploadedDocuments.map((d) => d.documentType));

  const uploadedRequired = required.filter((d) => uploadedTypes.has(d.type)).length;
  const uploadedOptional = optional.filter((d) => uploadedTypes.has(d.type)).length;

  const missingRequired = required
    .filter((d) => !uploadedTypes.has(d.type))
    .map((d) => d.type);

  const percentComplete = required.length > 0
    ? Math.round((uploadedRequired / required.length) * 100)
    : 100;

  return {
    totalRequired: required.length,
    uploadedRequired,
    totalOptional: optional.length,
    uploadedOptional,
    percentComplete,
    missingRequired,
  };
}

// Verify document (mark as verified)
export function verifyDocument(
  document: UploadedDocument,
  verifiedBy: number
): UploadedDocument {
  return {
    ...document,
    verificationStatus: 'verified',
    metadata: {
      ...document.metadata,
      verifiedBy,
      verifiedAt: new Date(),
    } as DocumentMetadata & { verifiedBy: number; verifiedAt: Date },
  };
}

// Reject document
export function rejectDocument(
  document: UploadedDocument,
  rejectedBy: number,
  reason: string
): UploadedDocument {
  return {
    ...document,
    verificationStatus: 'rejected',
    metadata: {
      ...document.metadata,
      rejectedBy,
      rejectedAt: new Date(),
      rejectionReason: reason,
    } as DocumentMetadata & { rejectedBy: number; rejectedAt: Date; rejectionReason: string },
  };
}

// Get document type label
export function getDocumentTypeLabel(documentType: string): string {
  if (documentType in TRUST_DOCUMENT_LABELS) {
    return TRUST_DOCUMENT_LABELS[documentType as TrustDocumentType];
  }
  if (documentType in BUSINESS_DOCUMENT_LABELS) {
    return BUSINESS_DOCUMENT_LABELS[documentType as BusinessDocumentType];
  }
  return documentType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Get all document types
export function getAllDocumentTypes(): Array<{
  category: DocumentCategory;
  type: string;
  label: string;
}> {
  const types: Array<{ category: DocumentCategory; type: string; label: string }> = [];

  for (const [type, label] of Object.entries(TRUST_DOCUMENT_LABELS)) {
    types.push({ category: 'trust', type, label });
  }

  for (const [type, label] of Object.entries(BUSINESS_DOCUMENT_LABELS)) {
    types.push({ category: 'business', type, label });
  }

  return types;
}
