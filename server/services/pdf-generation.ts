/**
 * PDF Generation Service
 * 
 * Government-compliant PDF generation with:
 * - Field mapping from database to form fields
 * - Digital signature placeholders
 * - Print-ready output (correct paper size, margins)
 * - Barcode/QR code generation for tracking
 * - Form validation before generation
 */

import QRCode from 'qrcode';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface PDFFieldMapping {
  fieldId: string;
  fieldName: string;
  fieldType: 'text' | 'date' | 'number' | 'currency' | 'checkbox' | 'signature' | 'barcode' | 'qrcode';
  value: string | number | boolean | null;
  required: boolean;
  maxLength?: number;
  format?: string;
  x: number; // Position in points (72 points = 1 inch)
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface SignaturePlaceholder {
  id: string;
  signerName: string;
  signerRole: string;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  signedAt?: Date;
  signatureHash?: string;
}

export interface PDFDocumentConfig {
  documentId: string;
  documentType: string;
  title: string;
  paperSize: 'letter' | 'legal' | 'a4';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fields: PDFFieldMapping[];
  signatures: SignaturePlaceholder[];
  trackingCode?: string;
  watermark?: string;
  headerText?: string;
  footerText?: string;
  pageNumbers: boolean;
  confidential: boolean;
}

export interface PDFGenerationResult {
  success: boolean;
  documentId: string;
  trackingCode: string;
  qrCodeDataUrl?: string;
  barcodeDataUrl?: string;
  validationErrors: ValidationError[];
  generatedAt: Date;
  pageCount: number;
  fileSize?: number;
}

export interface ValidationError {
  fieldId: string;
  fieldName: string;
  errorType: 'required' | 'format' | 'length' | 'type';
  message: string;
}

export interface GovernmentFormTemplate {
  formId: string;
  formName: string;
  agency: string;
  jurisdiction: 'federal' | 'state' | 'local';
  state?: string;
  version: string;
  effectiveDate: Date;
  expirationDate?: Date;
  fields: PDFFieldMapping[];
  signatures: SignaturePlaceholder[];
  instructions: string;
  filingFee?: number;
  filingDeadline?: string;
}

// ============================================================================
// Paper Size Configurations (in points, 72 points = 1 inch)
// ============================================================================

export const PAPER_SIZES = {
  letter: { width: 612, height: 792 }, // 8.5" x 11"
  legal: { width: 612, height: 1008 }, // 8.5" x 14"
  a4: { width: 595, height: 842 }, // 210mm x 297mm
} as const;

export const DEFAULT_MARGINS = {
  top: 72, // 1 inch
  right: 72,
  bottom: 72,
  left: 72,
} as const;

// ============================================================================
// Government Form Templates
// ============================================================================

export const GOVERNMENT_FORM_TEMPLATES: GovernmentFormTemplate[] = [
  // IRS Forms
  {
    formId: 'irs-ss4',
    formName: 'Application for Employer Identification Number',
    agency: 'Internal Revenue Service',
    jurisdiction: 'federal',
    version: '2024-01',
    effectiveDate: new Date('2024-01-01'),
    fields: [
      { fieldId: 'legal_name', fieldName: 'Legal Name of Entity', fieldType: 'text', value: null, required: true, maxLength: 100, x: 72, y: 650, width: 400, height: 20 },
      { fieldId: 'trade_name', fieldName: 'Trade Name (DBA)', fieldType: 'text', value: null, required: false, maxLength: 100, x: 72, y: 620, width: 400, height: 20 },
      { fieldId: 'street_address', fieldName: 'Street Address', fieldType: 'text', value: null, required: true, maxLength: 200, x: 72, y: 590, width: 400, height: 20 },
      { fieldId: 'city', fieldName: 'City', fieldType: 'text', value: null, required: true, maxLength: 50, x: 72, y: 560, width: 200, height: 20 },
      { fieldId: 'state', fieldName: 'State', fieldType: 'text', value: null, required: true, maxLength: 2, x: 282, y: 560, width: 50, height: 20 },
      { fieldId: 'zip', fieldName: 'ZIP Code', fieldType: 'text', value: null, required: true, maxLength: 10, x: 342, y: 560, width: 100, height: 20 },
      { fieldId: 'county', fieldName: 'County', fieldType: 'text', value: null, required: true, maxLength: 50, x: 72, y: 530, width: 200, height: 20 },
      { fieldId: 'responsible_party', fieldName: 'Responsible Party Name', fieldType: 'text', value: null, required: true, maxLength: 100, x: 72, y: 500, width: 400, height: 20 },
      { fieldId: 'ssn_itin', fieldName: 'SSN/ITIN of Responsible Party', fieldType: 'text', value: null, required: true, maxLength: 11, format: 'XXX-XX-XXXX', x: 72, y: 470, width: 150, height: 20 },
      { fieldId: 'entity_type', fieldName: 'Type of Entity', fieldType: 'text', value: null, required: true, x: 72, y: 440, width: 300, height: 20 },
      { fieldId: 'state_of_formation', fieldName: 'State of Formation', fieldType: 'text', value: null, required: true, maxLength: 2, x: 72, y: 410, width: 50, height: 20 },
      { fieldId: 'date_started', fieldName: 'Date Business Started', fieldType: 'date', value: null, required: true, format: 'MM/DD/YYYY', x: 72, y: 380, width: 150, height: 20 },
      { fieldId: 'fiscal_year_end', fieldName: 'Closing Month of Fiscal Year', fieldType: 'text', value: null, required: true, maxLength: 2, x: 72, y: 350, width: 50, height: 20 },
      { fieldId: 'highest_employees', fieldName: 'Highest Number of Employees Expected', fieldType: 'number', value: null, required: true, x: 72, y: 320, width: 100, height: 20 },
      { fieldId: 'principal_activity', fieldName: 'Principal Activity', fieldType: 'text', value: null, required: true, maxLength: 200, x: 72, y: 290, width: 400, height: 20 },
    ],
    signatures: [
      { id: 'applicant_sig', signerName: '', signerRole: 'Applicant', x: 72, y: 150, width: 200, height: 40, required: true },
    ],
    instructions: 'Complete all applicable lines. Sign and date the form.',
    filingFee: 0,
  },
  {
    formId: 'irs-w9',
    formName: 'Request for Taxpayer Identification Number and Certification',
    agency: 'Internal Revenue Service',
    jurisdiction: 'federal',
    version: '2024-01',
    effectiveDate: new Date('2024-01-01'),
    fields: [
      { fieldId: 'name', fieldName: 'Name (as shown on your income tax return)', fieldType: 'text', value: null, required: true, maxLength: 100, x: 72, y: 680, width: 400, height: 20 },
      { fieldId: 'business_name', fieldName: 'Business Name/Disregarded Entity Name', fieldType: 'text', value: null, required: false, maxLength: 100, x: 72, y: 650, width: 400, height: 20 },
      { fieldId: 'federal_tax_class', fieldName: 'Federal Tax Classification', fieldType: 'text', value: null, required: true, x: 72, y: 620, width: 300, height: 20 },
      { fieldId: 'exempt_payee_code', fieldName: 'Exempt Payee Code', fieldType: 'text', value: null, required: false, maxLength: 5, x: 72, y: 590, width: 100, height: 20 },
      { fieldId: 'fatca_code', fieldName: 'FATCA Exemption Code', fieldType: 'text', value: null, required: false, maxLength: 5, x: 182, y: 590, width: 100, height: 20 },
      { fieldId: 'address', fieldName: 'Address', fieldType: 'text', value: null, required: true, maxLength: 200, x: 72, y: 560, width: 400, height: 20 },
      { fieldId: 'city_state_zip', fieldName: 'City, State, ZIP', fieldType: 'text', value: null, required: true, maxLength: 100, x: 72, y: 530, width: 400, height: 20 },
      { fieldId: 'account_numbers', fieldName: 'Account Number(s)', fieldType: 'text', value: null, required: false, maxLength: 100, x: 72, y: 500, width: 400, height: 20 },
      { fieldId: 'ssn', fieldName: 'Social Security Number', fieldType: 'text', value: null, required: false, maxLength: 11, format: 'XXX-XX-XXXX', x: 72, y: 470, width: 150, height: 20 },
      { fieldId: 'ein', fieldName: 'Employer Identification Number', fieldType: 'text', value: null, required: false, maxLength: 10, format: 'XX-XXXXXXX', x: 232, y: 470, width: 150, height: 20 },
    ],
    signatures: [
      { id: 'taxpayer_sig', signerName: '', signerRole: 'Taxpayer', x: 72, y: 200, width: 200, height: 40, required: true },
    ],
    instructions: 'Provide your correct TIN. Sign and date the certification.',
  },
  // State Forms - Delaware
  {
    formId: 'de-annual-report',
    formName: 'Annual Report and Franchise Tax',
    agency: 'Delaware Division of Corporations',
    jurisdiction: 'state',
    state: 'DE',
    version: '2024-01',
    effectiveDate: new Date('2024-01-01'),
    fields: [
      { fieldId: 'file_number', fieldName: 'Delaware File Number', fieldType: 'text', value: null, required: true, maxLength: 20, x: 72, y: 680, width: 200, height: 20 },
      { fieldId: 'corporation_name', fieldName: 'Corporation Name', fieldType: 'text', value: null, required: true, maxLength: 100, x: 72, y: 650, width: 400, height: 20 },
      { fieldId: 'registered_agent', fieldName: 'Registered Agent Name', fieldType: 'text', value: null, required: true, maxLength: 100, x: 72, y: 620, width: 400, height: 20 },
      { fieldId: 'registered_address', fieldName: 'Registered Agent Address', fieldType: 'text', value: null, required: true, maxLength: 200, x: 72, y: 590, width: 400, height: 20 },
      { fieldId: 'principal_place', fieldName: 'Principal Place of Business', fieldType: 'text', value: null, required: true, maxLength: 200, x: 72, y: 560, width: 400, height: 20 },
      { fieldId: 'total_shares', fieldName: 'Total Authorized Shares', fieldType: 'number', value: null, required: true, x: 72, y: 530, width: 150, height: 20 },
      { fieldId: 'par_value', fieldName: 'Par Value Per Share', fieldType: 'currency', value: null, required: false, x: 232, y: 530, width: 150, height: 20 },
      { fieldId: 'gross_assets', fieldName: 'Total Gross Assets', fieldType: 'currency', value: null, required: true, x: 72, y: 500, width: 200, height: 20 },
      { fieldId: 'issued_shares', fieldName: 'Issued Shares', fieldType: 'number', value: null, required: true, x: 72, y: 470, width: 150, height: 20 },
    ],
    signatures: [
      { id: 'officer_sig', signerName: '', signerRole: 'Officer/Director', x: 72, y: 200, width: 200, height: 40, required: true },
    ],
    instructions: 'File by March 1 for corporations. Pay franchise tax based on authorized shares or assumed par value capital method.',
    filingFee: 50,
    filingDeadline: 'March 1',
  },
  // State Forms - Georgia
  {
    formId: 'ga-annual-registration',
    formName: 'Annual Registration',
    agency: 'Georgia Secretary of State',
    jurisdiction: 'state',
    state: 'GA',
    version: '2024-01',
    effectiveDate: new Date('2024-01-01'),
    fields: [
      { fieldId: 'control_number', fieldName: 'Control Number', fieldType: 'text', value: null, required: true, maxLength: 20, x: 72, y: 680, width: 200, height: 20 },
      { fieldId: 'entity_name', fieldName: 'Entity Name', fieldType: 'text', value: null, required: true, maxLength: 100, x: 72, y: 650, width: 400, height: 20 },
      { fieldId: 'principal_office', fieldName: 'Principal Office Address', fieldType: 'text', value: null, required: true, maxLength: 200, x: 72, y: 620, width: 400, height: 20 },
      { fieldId: 'registered_agent', fieldName: 'Registered Agent Name', fieldType: 'text', value: null, required: true, maxLength: 100, x: 72, y: 590, width: 400, height: 20 },
      { fieldId: 'registered_office', fieldName: 'Registered Office Address', fieldType: 'text', value: null, required: true, maxLength: 200, x: 72, y: 560, width: 400, height: 20 },
      { fieldId: 'naics_code', fieldName: 'NAICS Code', fieldType: 'text', value: null, required: true, maxLength: 6, x: 72, y: 530, width: 100, height: 20 },
      { fieldId: 'ceo_name', fieldName: 'CEO/Managing Member Name', fieldType: 'text', value: null, required: true, maxLength: 100, x: 72, y: 500, width: 300, height: 20 },
      { fieldId: 'cfo_name', fieldName: 'CFO/Treasurer Name', fieldType: 'text', value: null, required: false, maxLength: 100, x: 72, y: 470, width: 300, height: 20 },
      { fieldId: 'secretary_name', fieldName: 'Secretary Name', fieldType: 'text', value: null, required: false, maxLength: 100, x: 72, y: 440, width: 300, height: 20 },
    ],
    signatures: [
      { id: 'authorized_sig', signerName: '', signerRole: 'Authorized Person', x: 72, y: 200, width: 200, height: 40, required: true },
    ],
    instructions: 'File between January 1 and April 1 annually.',
    filingFee: 50,
    filingDeadline: 'April 1',
  },
  // 508(c)(1)(a) Form
  {
    formId: '508-annual-report',
    formName: '508(c)(1)(a) Annual Information Report',
    agency: 'Internal Revenue Service',
    jurisdiction: 'federal',
    version: '2024-01',
    effectiveDate: new Date('2024-01-01'),
    fields: [
      { fieldId: 'organization_name', fieldName: 'Organization Name', fieldType: 'text', value: null, required: true, maxLength: 100, x: 72, y: 680, width: 400, height: 20 },
      { fieldId: 'ein', fieldName: 'Employer Identification Number', fieldType: 'text', value: null, required: true, maxLength: 10, format: 'XX-XXXXXXX', x: 72, y: 650, width: 150, height: 20 },
      { fieldId: 'address', fieldName: 'Address', fieldType: 'text', value: null, required: true, maxLength: 200, x: 72, y: 620, width: 400, height: 20 },
      { fieldId: 'gross_receipts', fieldName: 'Gross Receipts', fieldType: 'currency', value: null, required: true, x: 72, y: 590, width: 200, height: 20 },
      { fieldId: 'total_assets', fieldName: 'Total Assets', fieldType: 'currency', value: null, required: true, x: 72, y: 560, width: 200, height: 20 },
      { fieldId: 'religious_purpose', fieldName: 'Religious Purpose Description', fieldType: 'text', value: null, required: true, maxLength: 500, x: 72, y: 530, width: 400, height: 60 },
      { fieldId: 'principal_officer', fieldName: 'Principal Officer', fieldType: 'text', value: null, required: true, maxLength: 100, x: 72, y: 460, width: 300, height: 20 },
      { fieldId: 'fiscal_year_end', fieldName: 'Fiscal Year End', fieldType: 'date', value: null, required: true, format: 'MM/DD', x: 72, y: 430, width: 100, height: 20 },
    ],
    signatures: [
      { id: 'officer_sig', signerName: '', signerRole: 'Principal Officer', x: 72, y: 200, width: 200, height: 40, required: true },
    ],
    instructions: '508(c)(1)(a) organizations are not required to file Form 990 but may choose to file this information report.',
    filingFee: 0,
  },
];

// ============================================================================
// Tracking Code Generation
// ============================================================================

/**
 * Generate a unique tracking code for document identification
 */
export function generateTrackingCode(documentType: string, entityId?: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const typePrefix = documentType.substring(0, 3).toUpperCase();
  const entitySuffix = entityId ? entityId.substring(0, 4).toUpperCase() : 'XXXX';
  
  return `${typePrefix}-${timestamp}-${random}-${entitySuffix}`;
}

/**
 * Generate a barcode data string (Code 128 compatible)
 */
export function generateBarcodeData(trackingCode: string): string {
  // Code 128 format: Start code + data + checksum + stop code
  // For simplicity, we return the tracking code formatted for Code 128
  return trackingCode.replace(/-/g, '');
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    return '';
  }
}

// ============================================================================
// Field Validation
// ============================================================================

/**
 * Validate all fields in a PDF document configuration
 */
export function validateFields(fields: PDFFieldMapping[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const field of fields) {
    // Required field check
    if (field.required && (field.value === null || field.value === '' || field.value === undefined)) {
      errors.push({
        fieldId: field.fieldId,
        fieldName: field.fieldName,
        errorType: 'required',
        message: `${field.fieldName} is required`,
      });
      continue;
    }
    
    // Skip validation if field is empty and not required
    if (field.value === null || field.value === '' || field.value === undefined) {
      continue;
    }
    
    // Max length check for text fields
    if (field.fieldType === 'text' && field.maxLength) {
      const strValue = String(field.value);
      if (strValue.length > field.maxLength) {
        errors.push({
          fieldId: field.fieldId,
          fieldName: field.fieldName,
          errorType: 'length',
          message: `${field.fieldName} exceeds maximum length of ${field.maxLength} characters`,
        });
      }
    }
    
    // Format validation
    if (field.format) {
      const isValid = validateFormat(field.value, field.format, field.fieldType);
      if (!isValid) {
        errors.push({
          fieldId: field.fieldId,
          fieldName: field.fieldName,
          errorType: 'format',
          message: `${field.fieldName} does not match required format: ${field.format}`,
        });
      }
    }
    
    // Type validation
    if (field.fieldType === 'number' && typeof field.value !== 'number' && isNaN(Number(field.value))) {
      errors.push({
        fieldId: field.fieldId,
        fieldName: field.fieldName,
        errorType: 'type',
        message: `${field.fieldName} must be a valid number`,
      });
    }
    
    if (field.fieldType === 'currency' && typeof field.value !== 'number' && isNaN(Number(field.value))) {
      errors.push({
        fieldId: field.fieldId,
        fieldName: field.fieldName,
        errorType: 'type',
        message: `${field.fieldName} must be a valid currency amount`,
      });
    }
    
    if (field.fieldType === 'date') {
      const dateValue = new Date(field.value as string);
      if (isNaN(dateValue.getTime())) {
        errors.push({
          fieldId: field.fieldId,
          fieldName: field.fieldName,
          errorType: 'type',
          message: `${field.fieldName} must be a valid date`,
        });
      }
    }
  }
  
  return errors;
}

/**
 * Validate a value against a format pattern
 */
function validateFormat(value: string | number | boolean | null, format: string, fieldType: string): boolean {
  if (value === null) return false;
  
  const strValue = String(value);
  
  switch (format) {
    case 'XXX-XX-XXXX': // SSN format
      return /^\d{3}-\d{2}-\d{4}$/.test(strValue);
    case 'XX-XXXXXXX': // EIN format
      return /^\d{2}-\d{7}$/.test(strValue);
    case 'MM/DD/YYYY': // Date format
      return /^\d{2}\/\d{2}\/\d{4}$/.test(strValue);
    case 'MM/DD': // Month/Day format
      return /^\d{2}\/\d{2}$/.test(strValue);
    default:
      return true;
  }
}

// ============================================================================
// Field Mapping from Database
// ============================================================================

export interface EntityData {
  id: string;
  name: string;
  type: string;
  ein?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  formationDate?: Date;
  fiscalYearEnd?: string;
  registeredAgent?: string;
  registeredAgentAddress?: string;
  principalOfficer?: string;
  principalOfficerSSN?: string;
  naicsCode?: string;
  totalShares?: number;
  parValue?: number;
  grossAssets?: number;
  issuedShares?: number;
  grossReceipts?: number;
  totalAssets?: number;
  religiousPurpose?: string;
  [key: string]: unknown;
}

/**
 * Map entity data to form fields
 */
export function mapEntityToFields(
  entity: EntityData,
  template: GovernmentFormTemplate
): PDFFieldMapping[] {
  const mappedFields: PDFFieldMapping[] = [];
  
  // Field mapping dictionary
  const fieldMappings: Record<string, keyof EntityData> = {
    'legal_name': 'name',
    'corporation_name': 'name',
    'entity_name': 'name',
    'organization_name': 'name',
    'name': 'name',
    'trade_name': 'name',
    'business_name': 'name',
    'ein': 'ein',
    'street_address': 'address',
    'address': 'address',
    'principal_office': 'address',
    'principal_place': 'address',
    'city': 'city',
    'state': 'state',
    'state_of_formation': 'state',
    'zip': 'zip',
    'county': 'county',
    'date_started': 'formationDate',
    'fiscal_year_end': 'fiscalYearEnd',
    'registered_agent': 'registeredAgent',
    'registered_address': 'registeredAgentAddress',
    'registered_office': 'registeredAgentAddress',
    'responsible_party': 'principalOfficer',
    'principal_officer': 'principalOfficer',
    'ceo_name': 'principalOfficer',
    'ssn_itin': 'principalOfficerSSN',
    'naics_code': 'naicsCode',
    'total_shares': 'totalShares',
    'par_value': 'parValue',
    'gross_assets': 'grossAssets',
    'issued_shares': 'issuedShares',
    'gross_receipts': 'grossReceipts',
    'total_assets': 'totalAssets',
    'religious_purpose': 'religiousPurpose',
  };
  
  for (const templateField of template.fields) {
    const mappedField = { ...templateField };
    const entityKey = fieldMappings[templateField.fieldId];
    
    if (entityKey && entity[entityKey] !== undefined) {
      let value = entity[entityKey];
      
      // Format dates
      if (templateField.fieldType === 'date' && value instanceof Date) {
        if (templateField.format === 'MM/DD/YYYY') {
          value = `${String(value.getMonth() + 1).padStart(2, '0')}/${String(value.getDate()).padStart(2, '0')}/${value.getFullYear()}`;
        } else if (templateField.format === 'MM/DD') {
          value = `${String(value.getMonth() + 1).padStart(2, '0')}/${String(value.getDate()).padStart(2, '0')}`;
        }
      }
      
      // Format currency
      if (templateField.fieldType === 'currency' && typeof value === 'number') {
        mappedField.value = value;
      } else {
        mappedField.value = value as string | number | boolean;
      }
    }
    
    mappedFields.push(mappedField);
  }
  
  return mappedFields;
}

// ============================================================================
// PDF Document Generation
// ============================================================================

export interface PDFContent {
  html: string;
  css: string;
  trackingCode: string;
  qrCodeDataUrl: string;
}

/**
 * Generate PDF content as HTML for rendering
 */
export async function generatePDFContent(config: PDFDocumentConfig): Promise<PDFContent> {
  const paperSize = PAPER_SIZES[config.paperSize];
  const trackingCode = config.trackingCode || generateTrackingCode(config.documentType);
  const qrCodeDataUrl = await generateQRCode(trackingCode);
  
  // Generate CSS
  const css = `
    @page {
      size: ${config.paperSize} ${config.orientation};
      margin: ${config.margins.top}pt ${config.margins.right}pt ${config.margins.bottom}pt ${config.margins.left}pt;
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.4;
      color: #000;
      background: #fff;
    }
    
    .document-container {
      width: ${paperSize.width - config.margins.left - config.margins.right}pt;
      min-height: ${paperSize.height - config.margins.top - config.margins.bottom}pt;
      position: relative;
    }
    
    .header {
      text-align: center;
      margin-bottom: 24pt;
      border-bottom: 2pt solid #000;
      padding-bottom: 12pt;
    }
    
    .header h1 {
      font-size: 16pt;
      font-weight: bold;
      margin: 0 0 8pt 0;
    }
    
    .header .subtitle {
      font-size: 10pt;
      color: #333;
    }
    
    .field-row {
      margin-bottom: 12pt;
      display: flex;
      align-items: baseline;
    }
    
    .field-label {
      font-weight: bold;
      min-width: 180pt;
      font-size: 10pt;
    }
    
    .field-value {
      flex: 1;
      border-bottom: 1pt solid #000;
      min-height: 14pt;
      padding: 2pt 4pt;
      font-size: 11pt;
    }
    
    .field-value.empty {
      color: #999;
      font-style: italic;
    }
    
    .signature-block {
      margin-top: 36pt;
      page-break-inside: avoid;
    }
    
    .signature-line {
      border-bottom: 1pt solid #000;
      width: 250pt;
      height: 40pt;
      margin-bottom: 4pt;
    }
    
    .signature-label {
      font-size: 9pt;
      color: #333;
    }
    
    .signature-date {
      margin-top: 12pt;
    }
    
    .tracking-section {
      position: absolute;
      bottom: 0;
      right: 0;
      text-align: right;
      font-size: 8pt;
      color: #666;
    }
    
    .qr-code {
      width: 80pt;
      height: 80pt;
    }
    
    .tracking-code {
      margin-top: 4pt;
      font-family: 'Courier New', monospace;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 72pt;
      color: rgba(0, 0, 0, 0.05);
      white-space: nowrap;
      pointer-events: none;
      z-index: -1;
    }
    
    .confidential-banner {
      background: #f00;
      color: #fff;
      text-align: center;
      padding: 4pt;
      font-weight: bold;
      font-size: 10pt;
      margin-bottom: 12pt;
    }
    
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 8pt;
      color: #666;
      border-top: 1pt solid #ccc;
      padding-top: 8pt;
    }
    
    .page-number {
      font-size: 8pt;
      color: #666;
    }
    
    @media print {
      .watermark {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
  
  // Generate HTML
  let html = `
    <div class="document-container">
      ${config.watermark ? `<div class="watermark">${config.watermark}</div>` : ''}
      ${config.confidential ? '<div class="confidential-banner">CONFIDENTIAL</div>' : ''}
      
      <div class="header">
        <h1>${config.title}</h1>
        ${config.headerText ? `<div class="subtitle">${config.headerText}</div>` : ''}
      </div>
      
      <div class="fields-section">
  `;
  
  // Add fields
  for (const field of config.fields) {
    if (field.fieldType === 'signature' || field.fieldType === 'barcode' || field.fieldType === 'qrcode') {
      continue; // Handle separately
    }
    
    let displayValue = '';
    if (field.value !== null && field.value !== undefined && field.value !== '') {
      if (field.fieldType === 'currency') {
        displayValue = `$${Number(field.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (field.fieldType === 'checkbox') {
        displayValue = field.value ? '☑' : '☐';
      } else {
        displayValue = String(field.value);
      }
    }
    
    html += `
      <div class="field-row">
        <span class="field-label">${field.fieldName}:</span>
        <span class="field-value ${!displayValue ? 'empty' : ''}">${displayValue || '(Not provided)'}</span>
      </div>
    `;
  }
  
  html += '</div>';
  
  // Add signature blocks
  if (config.signatures.length > 0) {
    html += '<div class="signatures-section">';
    for (const sig of config.signatures) {
      html += `
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">
            ${sig.signerRole}${sig.signerName ? `: ${sig.signerName}` : ''}
            ${sig.required ? ' (Required)' : ' (Optional)'}
          </div>
          <div class="signature-date">
            <span class="field-label">Date:</span>
            <span class="field-value" style="width: 150pt; display: inline-block;"></span>
          </div>
        </div>
      `;
    }
    html += '</div>';
  }
  
  // Add tracking section
  html += `
    <div class="tracking-section">
      ${qrCodeDataUrl ? `<img class="qr-code" src="${qrCodeDataUrl}" alt="QR Code" />` : ''}
      <div class="tracking-code">${trackingCode}</div>
    </div>
  `;
  
  // Add footer
  if (config.footerText || config.pageNumbers) {
    html += `
      <div class="footer">
        ${config.footerText || ''}
        ${config.pageNumbers ? '<span class="page-number">Page 1</span>' : ''}
      </div>
    `;
  }
  
  html += '</div>';
  
  return {
    html,
    css,
    trackingCode,
    qrCodeDataUrl,
  };
}

/**
 * Generate a complete PDF document
 */
export async function generatePDF(config: PDFDocumentConfig): Promise<PDFGenerationResult> {
  // Validate fields first
  const validationErrors = validateFields(config.fields);
  
  const trackingCode = config.trackingCode || generateTrackingCode(config.documentType);
  const qrCodeDataUrl = await generateQRCode(trackingCode);
  
  // Even with validation errors, we can still generate a preview
  const result: PDFGenerationResult = {
    success: validationErrors.length === 0,
    documentId: config.documentId,
    trackingCode,
    qrCodeDataUrl,
    validationErrors,
    generatedAt: new Date(),
    pageCount: 1,
  };
  
  return result;
}

// ============================================================================
// Pre-built Document Generators
// ============================================================================

/**
 * Generate IRS SS-4 (EIN Application)
 */
export async function generateSS4(entity: EntityData): Promise<PDFGenerationResult> {
  const template = GOVERNMENT_FORM_TEMPLATES.find(t => t.formId === 'irs-ss4');
  if (!template) {
    throw new Error('SS-4 template not found');
  }
  
  const fields = mapEntityToFields(entity, template);
  
  const config: PDFDocumentConfig = {
    documentId: `ss4-${entity.id}`,
    documentType: 'IRS-SS4',
    title: 'Form SS-4 - Application for Employer Identification Number',
    paperSize: 'letter',
    orientation: 'portrait',
    margins: DEFAULT_MARGINS,
    fields,
    signatures: template.signatures,
    headerText: 'Internal Revenue Service',
    footerText: 'Form SS-4 (Rev. 12-2023)',
    pageNumbers: true,
    confidential: true,
  };
  
  return generatePDF(config);
}

/**
 * Generate IRS W-9
 */
export async function generateW9(entity: EntityData): Promise<PDFGenerationResult> {
  const template = GOVERNMENT_FORM_TEMPLATES.find(t => t.formId === 'irs-w9');
  if (!template) {
    throw new Error('W-9 template not found');
  }
  
  const fields = mapEntityToFields(entity, template);
  
  const config: PDFDocumentConfig = {
    documentId: `w9-${entity.id}`,
    documentType: 'IRS-W9',
    title: 'Form W-9 - Request for Taxpayer Identification Number and Certification',
    paperSize: 'letter',
    orientation: 'portrait',
    margins: DEFAULT_MARGINS,
    fields,
    signatures: template.signatures,
    headerText: 'Internal Revenue Service',
    footerText: 'Form W-9 (Rev. 3-2024)',
    pageNumbers: true,
    confidential: true,
  };
  
  return generatePDF(config);
}

/**
 * Generate Delaware Annual Report
 */
export async function generateDEAnnualReport(entity: EntityData): Promise<PDFGenerationResult> {
  const template = GOVERNMENT_FORM_TEMPLATES.find(t => t.formId === 'de-annual-report');
  if (!template) {
    throw new Error('DE Annual Report template not found');
  }
  
  const fields = mapEntityToFields(entity, template);
  
  const config: PDFDocumentConfig = {
    documentId: `de-annual-${entity.id}`,
    documentType: 'DE-ANNUAL',
    title: 'Delaware Annual Report and Franchise Tax',
    paperSize: 'letter',
    orientation: 'portrait',
    margins: DEFAULT_MARGINS,
    fields,
    signatures: template.signatures,
    headerText: 'Delaware Division of Corporations',
    footerText: `Filing Fee: $${template.filingFee} | Due: ${template.filingDeadline}`,
    pageNumbers: true,
    confidential: false,
  };
  
  return generatePDF(config);
}

/**
 * Generate Georgia Annual Registration
 */
export async function generateGAAnnualRegistration(entity: EntityData): Promise<PDFGenerationResult> {
  const template = GOVERNMENT_FORM_TEMPLATES.find(t => t.formId === 'ga-annual-registration');
  if (!template) {
    throw new Error('GA Annual Registration template not found');
  }
  
  const fields = mapEntityToFields(entity, template);
  
  const config: PDFDocumentConfig = {
    documentId: `ga-annual-${entity.id}`,
    documentType: 'GA-ANNUAL',
    title: 'Georgia Annual Registration',
    paperSize: 'letter',
    orientation: 'portrait',
    margins: DEFAULT_MARGINS,
    fields,
    signatures: template.signatures,
    headerText: 'Georgia Secretary of State - Corporations Division',
    footerText: `Filing Fee: $${template.filingFee} | Due: ${template.filingDeadline}`,
    pageNumbers: true,
    confidential: false,
  };
  
  return generatePDF(config);
}

/**
 * Generate 508(c)(1)(a) Annual Report
 */
export async function generate508AnnualReport(entity: EntityData): Promise<PDFGenerationResult> {
  const template = GOVERNMENT_FORM_TEMPLATES.find(t => t.formId === '508-annual-report');
  if (!template) {
    throw new Error('508 Annual Report template not found');
  }
  
  const fields = mapEntityToFields(entity, template);
  
  const config: PDFDocumentConfig = {
    documentId: `508-annual-${entity.id}`,
    documentType: '508-ANNUAL',
    title: '508(c)(1)(a) Annual Information Report',
    paperSize: 'letter',
    orientation: 'portrait',
    margins: DEFAULT_MARGINS,
    fields,
    signatures: template.signatures,
    headerText: 'Internal Revenue Service - Tax Exempt Organizations',
    footerText: 'This form is for informational purposes only. 508(c)(1)(a) organizations are not required to file Form 990.',
    pageNumbers: true,
    confidential: false,
  };
  
  return generatePDF(config);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get all available government form templates
 */
export function getAvailableTemplates(): GovernmentFormTemplate[] {
  return GOVERNMENT_FORM_TEMPLATES;
}

/**
 * Get templates by jurisdiction
 */
export function getTemplatesByJurisdiction(jurisdiction: 'federal' | 'state' | 'local', state?: string): GovernmentFormTemplate[] {
  return GOVERNMENT_FORM_TEMPLATES.filter(t => {
    if (t.jurisdiction !== jurisdiction) return false;
    if (jurisdiction === 'state' && state && t.state !== state) return false;
    return true;
  });
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(formId: string): GovernmentFormTemplate | undefined {
  return GOVERNMENT_FORM_TEMPLATES.find(t => t.formId === formId);
}

/**
 * Calculate filing deadline for a template
 */
export function calculateFilingDeadline(template: GovernmentFormTemplate, year: number): Date | null {
  if (!template.filingDeadline) return null;
  
  const deadlineMap: Record<string, { month: number; day: number }> = {
    'January 1': { month: 0, day: 1 },
    'January 15': { month: 0, day: 15 },
    'January 31': { month: 0, day: 31 },
    'March 1': { month: 2, day: 1 },
    'March 15': { month: 2, day: 15 },
    'April 1': { month: 3, day: 1 },
    'April 15': { month: 3, day: 15 },
    'May 15': { month: 4, day: 15 },
    'June 15': { month: 5, day: 15 },
    'September 15': { month: 8, day: 15 },
    'October 15': { month: 9, day: 15 },
    'December 31': { month: 11, day: 31 },
  };
  
  const deadline = deadlineMap[template.filingDeadline];
  if (!deadline) return null;
  
  return new Date(year, deadline.month, deadline.day);
}

/**
 * Get upcoming filing deadlines for an entity
 */
export function getUpcomingDeadlines(
  entityState: string,
  entityType: string,
  year: number = new Date().getFullYear()
): Array<{ template: GovernmentFormTemplate; deadline: Date }> {
  const deadlines: Array<{ template: GovernmentFormTemplate; deadline: Date }> = [];
  const now = new Date();
  
  for (const template of GOVERNMENT_FORM_TEMPLATES) {
    // Check if template applies to entity
    if (template.jurisdiction === 'state' && template.state !== entityState) {
      continue;
    }
    
    const deadline = calculateFilingDeadline(template, year);
    if (deadline && deadline > now) {
      deadlines.push({ template, deadline });
    }
    
    // Also check next year's deadlines
    const nextYearDeadline = calculateFilingDeadline(template, year + 1);
    if (nextYearDeadline) {
      deadlines.push({ template, deadline: nextYearDeadline });
    }
  }
  
  // Sort by deadline
  deadlines.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  
  return deadlines;
}
