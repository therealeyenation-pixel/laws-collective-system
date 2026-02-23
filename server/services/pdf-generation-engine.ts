/**
 * PDF Generation Engine
 * Phase 50.2: Government-compliant PDF generation with field mapping,
 * digital signatures, barcodes, and print-ready output
 */

// ============================================
// PDF CONFIGURATION TYPES
// ============================================

export interface PDFPageConfig {
  size: 'letter' | 'legal' | 'a4';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;    // in points (72 points = 1 inch)
    right: number;
    bottom: number;
    left: number;
  };
}

export interface PDFFont {
  family: 'Times-Roman' | 'Helvetica' | 'Courier' | 'Arial';
  size: number;
  bold?: boolean;
  italic?: boolean;
}

export interface PDFField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'checkbox' | 'signature' | 'textarea';
  x: number;        // x position in points
  y: number;        // y position in points
  width: number;    // width in points
  height: number;   // height in points
  required: boolean;
  maxLength?: number;
  format?: string;  // date format, currency format, etc.
  defaultValue?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface PDFSection {
  id: string;
  title: string;
  startY: number;
  fields: PDFField[];
  instructions?: string;
}

export interface PDFTemplate {
  id: string;
  name: string;
  version: string;
  category: string;
  pageConfig: PDFPageConfig;
  headerFont: PDFFont;
  bodyFont: PDFFont;
  sections: PDFSection[];
  signatureBlocks: SignatureBlock[];
  barcodeConfig?: BarcodeConfig;
  watermark?: WatermarkConfig;
  footer?: FooterConfig;
}

export interface SignatureBlock {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  requiresDate: boolean;
  requiresWitness: boolean;
  requiresNotary: boolean;
}

export interface BarcodeConfig {
  type: 'qr' | 'code128' | 'code39' | 'pdf417';
  position: { x: number; y: number };
  size: number;
  includeText: boolean;
  dataFields: string[];  // fields to encode
}

export interface WatermarkConfig {
  text: string;
  opacity: number;
  angle: number;
  fontSize: number;
}

export interface FooterConfig {
  text: string;
  pageNumbers: boolean;
  dateGenerated: boolean;
}

export interface GeneratedPDF {
  id: string;
  templateId: string;
  templateName: string;
  generatedAt: string;
  data: Record<string, any>;
  validationResult: ValidationResult;
  barcodeValue?: string;
  signatureStatus: SignatureStatus[];
  content: string;  // Base64 encoded PDF content (simulated)
  metadata: PDFMetadata;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  fieldId: string;
  fieldName: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  fieldId: string;
  fieldName: string;
  message: string;
}

export interface SignatureStatus {
  blockId: string;
  label: string;
  signed: boolean;
  signedAt?: string;
  signedBy?: string;
  witnessName?: string;
  notarized?: boolean;
  notaryName?: string;
  notaryCommission?: string;
}

export interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
}

// ============================================
// PAGE SIZE CONFIGURATIONS
// ============================================

export const PAGE_SIZES = {
  letter: { width: 612, height: 792 },   // 8.5" x 11"
  legal: { width: 612, height: 1008 },   // 8.5" x 14"
  a4: { width: 595, height: 842 },       // 210mm x 297mm
} as const;

export const GOVERNMENT_MARGINS = {
  standard: { top: 72, right: 72, bottom: 72, left: 72 },  // 1" all around
  irs: { top: 36, right: 36, bottom: 36, left: 36 },       // 0.5" all around
  legal: { top: 72, right: 54, bottom: 72, left: 54 },     // 1" top/bottom, 0.75" sides
} as const;

// ============================================
// PDF TEMPLATE LIBRARY
// ============================================

export function getArticlesOfIncorporationPDFTemplate(state: string = 'Delaware'): PDFTemplate {
  return {
    id: 'articles_of_incorporation_pdf',
    name: `${state} Articles of Incorporation`,
    version: '1.0',
    category: 'state_filing',
    pageConfig: {
      size: 'letter',
      orientation: 'portrait',
      margins: GOVERNMENT_MARGINS.standard,
    },
    headerFont: { family: 'Times-Roman', size: 14, bold: true },
    bodyFont: { family: 'Times-Roman', size: 12 },
    sections: [
      {
        id: 'header',
        title: 'STATE OF ' + state.toUpperCase(),
        startY: 720,
        fields: [],
        instructions: 'ARTICLES OF INCORPORATION',
      },
      {
        id: 'article_1',
        title: 'ARTICLE I - NAME',
        startY: 650,
        fields: [
          {
            id: 'corporation_name',
            name: 'Corporation Name',
            type: 'text',
            x: 72,
            y: 620,
            width: 468,
            height: 20,
            required: true,
            maxLength: 100,
          },
        ],
      },
      {
        id: 'article_2',
        title: 'ARTICLE II - REGISTERED AGENT',
        startY: 580,
        fields: [
          {
            id: 'registered_agent_name',
            name: 'Registered Agent Name',
            type: 'text',
            x: 72,
            y: 550,
            width: 468,
            height: 20,
            required: true,
          },
          {
            id: 'registered_agent_address',
            name: 'Registered Agent Address',
            type: 'textarea',
            x: 72,
            y: 500,
            width: 468,
            height: 40,
            required: true,
          },
        ],
      },
      {
        id: 'article_3',
        title: 'ARTICLE III - PURPOSE',
        startY: 440,
        fields: [
          {
            id: 'business_purpose',
            name: 'Business Purpose',
            type: 'textarea',
            x: 72,
            y: 380,
            width: 468,
            height: 50,
            required: true,
          },
        ],
      },
      {
        id: 'article_4',
        title: 'ARTICLE IV - STOCK',
        startY: 320,
        fields: [
          {
            id: 'authorized_shares',
            name: 'Authorized Shares',
            type: 'number',
            x: 72,
            y: 290,
            width: 150,
            height: 20,
            required: true,
            validation: { min: 1 },
          },
          {
            id: 'par_value',
            name: 'Par Value',
            type: 'currency',
            x: 250,
            y: 290,
            width: 150,
            height: 20,
            required: true,
            format: '$0.00',
          },
        ],
      },
      {
        id: 'incorporator',
        title: 'INCORPORATOR',
        startY: 220,
        fields: [
          {
            id: 'incorporator_name',
            name: 'Incorporator Name',
            type: 'text',
            x: 72,
            y: 190,
            width: 300,
            height: 20,
            required: true,
          },
          {
            id: 'incorporator_address',
            name: 'Incorporator Address',
            type: 'textarea',
            x: 72,
            y: 140,
            width: 468,
            height: 40,
            required: true,
          },
        ],
      },
    ],
    signatureBlocks: [
      {
        id: 'incorporator_signature',
        label: 'Incorporator Signature',
        x: 72,
        y: 80,
        width: 250,
        height: 40,
        requiresDate: true,
        requiresWitness: false,
        requiresNotary: true,
      },
    ],
    barcodeConfig: {
      type: 'qr',
      position: { x: 500, y: 720 },
      size: 60,
      includeText: false,
      dataFields: ['corporation_name', 'incorporator_name'],
    },
    footer: {
      text: 'Page {page} of {pages}',
      pageNumbers: true,
      dateGenerated: true,
    },
  };
}

export function getW2PDFTemplate(): PDFTemplate {
  return {
    id: 'w2_pdf',
    name: 'Form W-2 Wage and Tax Statement',
    version: '2024',
    category: 'tax_form',
    pageConfig: {
      size: 'letter',
      orientation: 'portrait',
      margins: GOVERNMENT_MARGINS.irs,
    },
    headerFont: { family: 'Helvetica', size: 10, bold: true },
    bodyFont: { family: 'Helvetica', size: 9 },
    sections: [
      {
        id: 'employer_info',
        title: 'Employer Information',
        startY: 750,
        fields: [
          {
            id: 'employer_ein',
            name: 'Employer EIN',
            type: 'text',
            x: 36,
            y: 720,
            width: 120,
            height: 18,
            required: true,
            format: 'XX-XXXXXXX',
          },
          {
            id: 'employer_name',
            name: 'Employer Name',
            type: 'text',
            x: 36,
            y: 690,
            width: 250,
            height: 18,
            required: true,
          },
          {
            id: 'employer_address',
            name: 'Employer Address',
            type: 'textarea',
            x: 36,
            y: 640,
            width: 250,
            height: 40,
            required: true,
          },
        ],
      },
      {
        id: 'employee_info',
        title: 'Employee Information',
        startY: 580,
        fields: [
          {
            id: 'employee_ssn',
            name: 'Employee SSN',
            type: 'text',
            x: 36,
            y: 550,
            width: 120,
            height: 18,
            required: true,
            format: 'XXX-XX-XXXX',
          },
          {
            id: 'employee_name',
            name: 'Employee Name',
            type: 'text',
            x: 36,
            y: 520,
            width: 250,
            height: 18,
            required: true,
          },
          {
            id: 'employee_address',
            name: 'Employee Address',
            type: 'textarea',
            x: 36,
            y: 470,
            width: 250,
            height: 40,
            required: true,
          },
        ],
      },
      {
        id: 'wages_taxes',
        title: 'Wages and Taxes',
        startY: 410,
        fields: [
          {
            id: 'box_1_wages',
            name: 'Box 1: Wages, tips, other compensation',
            type: 'currency',
            x: 320,
            y: 720,
            width: 120,
            height: 18,
            required: true,
            format: '$0.00',
          },
          {
            id: 'box_2_federal_tax',
            name: 'Box 2: Federal income tax withheld',
            type: 'currency',
            x: 450,
            y: 720,
            width: 120,
            height: 18,
            required: true,
            format: '$0.00',
          },
          {
            id: 'box_3_ss_wages',
            name: 'Box 3: Social security wages',
            type: 'currency',
            x: 320,
            y: 690,
            width: 120,
            height: 18,
            required: true,
            format: '$0.00',
          },
          {
            id: 'box_4_ss_tax',
            name: 'Box 4: Social security tax withheld',
            type: 'currency',
            x: 450,
            y: 690,
            width: 120,
            height: 18,
            required: true,
            format: '$0.00',
          },
          {
            id: 'box_5_medicare_wages',
            name: 'Box 5: Medicare wages and tips',
            type: 'currency',
            x: 320,
            y: 660,
            width: 120,
            height: 18,
            required: true,
            format: '$0.00',
          },
          {
            id: 'box_6_medicare_tax',
            name: 'Box 6: Medicare tax withheld',
            type: 'currency',
            x: 450,
            y: 660,
            width: 120,
            height: 18,
            required: true,
            format: '$0.00',
          },
        ],
      },
      {
        id: 'state_local',
        title: 'State and Local Information',
        startY: 300,
        fields: [
          {
            id: 'box_15_state',
            name: 'Box 15: State',
            type: 'text',
            x: 36,
            y: 270,
            width: 50,
            height: 18,
            required: false,
          },
          {
            id: 'box_15_employer_state_id',
            name: 'Box 15: Employer State ID',
            type: 'text',
            x: 90,
            y: 270,
            width: 120,
            height: 18,
            required: false,
          },
          {
            id: 'box_16_state_wages',
            name: 'Box 16: State wages',
            type: 'currency',
            x: 220,
            y: 270,
            width: 120,
            height: 18,
            required: false,
            format: '$0.00',
          },
          {
            id: 'box_17_state_tax',
            name: 'Box 17: State income tax',
            type: 'currency',
            x: 350,
            y: 270,
            width: 120,
            height: 18,
            required: false,
            format: '$0.00',
          },
        ],
      },
    ],
    signatureBlocks: [],
    barcodeConfig: {
      type: 'code128',
      position: { x: 36, y: 36 },
      size: 40,
      includeText: true,
      dataFields: ['employer_ein', 'employee_ssn', 'box_1_wages'],
    },
    footer: {
      text: 'Form W-2 (2024) - Department of the Treasury - Internal Revenue Service',
      pageNumbers: false,
      dateGenerated: false,
    },
  };
}

export function getPromissoryNotePDFTemplate(): PDFTemplate {
  return {
    id: 'promissory_note_pdf',
    name: 'Promissory Note',
    version: '1.0',
    category: 'loan_document',
    pageConfig: {
      size: 'letter',
      orientation: 'portrait',
      margins: GOVERNMENT_MARGINS.legal,
    },
    headerFont: { family: 'Times-Roman', size: 16, bold: true },
    bodyFont: { family: 'Times-Roman', size: 12 },
    sections: [
      {
        id: 'header',
        title: 'PROMISSORY NOTE',
        startY: 720,
        fields: [
          {
            id: 'principal_amount',
            name: 'Principal Amount',
            type: 'currency',
            x: 400,
            y: 720,
            width: 140,
            height: 20,
            required: true,
            format: '$0.00',
          },
          {
            id: 'note_date',
            name: 'Date',
            type: 'date',
            x: 72,
            y: 720,
            width: 120,
            height: 20,
            required: true,
            format: 'MM/DD/YYYY',
          },
        ],
      },
      {
        id: 'parties',
        title: 'Parties',
        startY: 660,
        fields: [
          {
            id: 'borrower_name',
            name: 'Borrower Name',
            type: 'text',
            x: 72,
            y: 630,
            width: 250,
            height: 20,
            required: true,
          },
          {
            id: 'borrower_address',
            name: 'Borrower Address',
            type: 'textarea',
            x: 72,
            y: 580,
            width: 250,
            height: 40,
            required: true,
          },
          {
            id: 'lender_name',
            name: 'Lender Name',
            type: 'text',
            x: 340,
            y: 630,
            width: 200,
            height: 20,
            required: true,
          },
          {
            id: 'lender_address',
            name: 'Lender Address',
            type: 'textarea',
            x: 340,
            y: 580,
            width: 200,
            height: 40,
            required: true,
          },
        ],
      },
      {
        id: 'terms',
        title: 'Loan Terms',
        startY: 520,
        fields: [
          {
            id: 'interest_rate',
            name: 'Annual Interest Rate (%)',
            type: 'number',
            x: 72,
            y: 490,
            width: 100,
            height: 20,
            required: true,
            validation: { min: 0, max: 100 },
          },
          {
            id: 'term_months',
            name: 'Term (Months)',
            type: 'number',
            x: 200,
            y: 490,
            width: 100,
            height: 20,
            required: true,
            validation: { min: 1, max: 360 },
          },
          {
            id: 'monthly_payment',
            name: 'Monthly Payment',
            type: 'currency',
            x: 330,
            y: 490,
            width: 120,
            height: 20,
            required: true,
            format: '$0.00',
          },
          {
            id: 'maturity_date',
            name: 'Maturity Date',
            type: 'date',
            x: 72,
            y: 450,
            width: 120,
            height: 20,
            required: true,
            format: 'MM/DD/YYYY',
          },
        ],
      },
      {
        id: 'payment_schedule',
        title: 'Payment Schedule',
        startY: 400,
        fields: [
          {
            id: 'first_payment_date',
            name: 'First Payment Due',
            type: 'date',
            x: 72,
            y: 370,
            width: 120,
            height: 20,
            required: true,
            format: 'MM/DD/YYYY',
          },
          {
            id: 'payment_day',
            name: 'Payment Due Day of Month',
            type: 'number',
            x: 220,
            y: 370,
            width: 80,
            height: 20,
            required: true,
            validation: { min: 1, max: 31 },
          },
        ],
      },
    ],
    signatureBlocks: [
      {
        id: 'borrower_signature',
        label: 'Borrower Signature',
        x: 72,
        y: 150,
        width: 200,
        height: 40,
        requiresDate: true,
        requiresWitness: true,
        requiresNotary: false,
      },
      {
        id: 'lender_signature',
        label: 'Lender Signature',
        x: 340,
        y: 150,
        width: 200,
        height: 40,
        requiresDate: true,
        requiresWitness: false,
        requiresNotary: false,
      },
    ],
    barcodeConfig: {
      type: 'qr',
      position: { x: 490, y: 720 },
      size: 50,
      includeText: false,
      dataFields: ['borrower_name', 'principal_amount', 'note_date'],
    },
    footer: {
      text: 'Page {page} of {pages}',
      pageNumbers: true,
      dateGenerated: true,
    },
  };
}

// ============================================
// PDF GENERATION FUNCTIONS
// ============================================

export function validatePDFData(template: PDFTemplate, data: Record<string, any>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check all required fields
  for (const section of template.sections) {
    for (const field of section.fields) {
      const value = data[field.id];

      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push({
          fieldId: field.id,
          fieldName: field.name,
          message: `${field.name} is required`,
          code: 'REQUIRED_FIELD_MISSING',
        });
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        // Type-specific validation
        if (field.type === 'number' && field.validation) {
          const numValue = Number(value);
          if (field.validation.min !== undefined && numValue < field.validation.min) {
            errors.push({
              fieldId: field.id,
              fieldName: field.name,
              message: `${field.name} must be at least ${field.validation.min}`,
              code: 'VALUE_TOO_LOW',
            });
          }
          if (field.validation.max !== undefined && numValue > field.validation.max) {
            errors.push({
              fieldId: field.id,
              fieldName: field.name,
              message: `${field.name} must be at most ${field.validation.max}`,
              code: 'VALUE_TOO_HIGH',
            });
          }
        }

        if (field.type === 'text' && field.maxLength) {
          if (String(value).length > field.maxLength) {
            errors.push({
              fieldId: field.id,
              fieldName: field.name,
              message: `${field.name} exceeds maximum length of ${field.maxLength}`,
              code: 'VALUE_TOO_LONG',
            });
          }
        }

        if (field.type === 'date') {
          const dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            errors.push({
              fieldId: field.id,
              fieldName: field.name,
              message: `${field.name} is not a valid date`,
              code: 'INVALID_DATE',
            });
          }
        }

        if (field.type === 'currency') {
          const currencyValue = Number(value);
          if (isNaN(currencyValue) || currencyValue < 0) {
            errors.push({
              fieldId: field.id,
              fieldName: field.name,
              message: `${field.name} must be a valid positive amount`,
              code: 'INVALID_CURRENCY',
            });
          }
        }
      }
    }
  }

  // Check signature blocks
  for (const sigBlock of template.signatureBlocks) {
    if (!data[`${sigBlock.id}_signed`]) {
      warnings.push({
        fieldId: sigBlock.id,
        fieldName: sigBlock.label,
        message: `${sigBlock.label} has not been signed`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function generateBarcodeValue(template: PDFTemplate, data: Record<string, any>): string {
  if (!template.barcodeConfig) return '';

  const values = template.barcodeConfig.dataFields
    .map(fieldId => data[fieldId] || '')
    .filter(v => v !== '');

  // Create a unique identifier from the data
  const timestamp = Date.now().toString(36);
  const dataHash = values.join('|').split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0).toString(36);

  return `DOC-${timestamp}-${dataHash}`.toUpperCase();
}

export function formatFieldValue(field: PDFField, value: any): string {
  if (value === undefined || value === null) return '';

  switch (field.type) {
    case 'currency':
      const numValue = Number(value);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(numValue);

    case 'date':
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) return String(value);
      return dateValue.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

    case 'number':
      return Number(value).toLocaleString('en-US');

    case 'checkbox':
      return value ? '☑' : '☐';

    default:
      return String(value);
  }
}

export function generatePDF(
  template: PDFTemplate,
  data: Record<string, any>,
  options?: {
    includeWatermark?: boolean;
    signatureData?: Record<string, SignatureStatus>;
  }
): GeneratedPDF {
  const validationResult = validatePDFData(template, data);
  const barcodeValue = generateBarcodeValue(template, data);

  // Build signature status
  const signatureStatus: SignatureStatus[] = template.signatureBlocks.map(block => ({
    blockId: block.id,
    label: block.label,
    signed: options?.signatureData?.[block.id]?.signed || false,
    signedAt: options?.signatureData?.[block.id]?.signedAt,
    signedBy: options?.signatureData?.[block.id]?.signedBy,
    witnessName: block.requiresWitness ? options?.signatureData?.[block.id]?.witnessName : undefined,
    notarized: block.requiresNotary ? options?.signatureData?.[block.id]?.notarized : undefined,
    notaryName: block.requiresNotary ? options?.signatureData?.[block.id]?.notaryName : undefined,
    notaryCommission: block.requiresNotary ? options?.signatureData?.[block.id]?.notaryCommission : undefined,
  }));

  // Generate PDF content (simulated as structured data)
  const pdfContent = generatePDFContent(template, data, barcodeValue, options?.includeWatermark);

  const now = new Date().toISOString();

  return {
    id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: template.id,
    templateName: template.name,
    generatedAt: now,
    data,
    validationResult,
    barcodeValue,
    signatureStatus,
    content: Buffer.from(JSON.stringify(pdfContent)).toString('base64'),
    metadata: {
      title: template.name,
      author: 'LuvOnPurpose Document System',
      subject: `${template.category} - ${template.name}`,
      keywords: [template.category, template.id, 'generated'],
      creator: 'LuvOnPurpose PDF Engine v1.0',
      producer: 'LuvOnPurpose Autonomous Wealth System',
      creationDate: now,
      modificationDate: now,
    },
  };
}

function generatePDFContent(
  template: PDFTemplate,
  data: Record<string, any>,
  barcodeValue: string,
  includeWatermark?: boolean
): object {
  const pageSize = PAGE_SIZES[template.pageConfig.size];

  return {
    version: '1.0',
    template: template.id,
    pageConfig: {
      ...template.pageConfig,
      width: pageSize.width,
      height: pageSize.height,
    },
    elements: [
      // Header
      {
        type: 'text',
        content: template.name,
        x: template.pageConfig.margins.left,
        y: pageSize.height - template.pageConfig.margins.top,
        font: template.headerFont,
      },
      // Sections with fields
      ...template.sections.flatMap(section => [
        {
          type: 'section_header',
          content: section.title,
          y: section.startY,
        },
        ...section.fields.map(field => ({
          type: 'field',
          id: field.id,
          label: field.name,
          value: formatFieldValue(field, data[field.id]),
          position: { x: field.x, y: field.y, width: field.width, height: field.height },
          fieldType: field.type,
        })),
      ]),
      // Barcode
      template.barcodeConfig ? {
        type: 'barcode',
        barcodeType: template.barcodeConfig.type,
        value: barcodeValue,
        position: template.barcodeConfig.position,
        size: template.barcodeConfig.size,
      } : null,
      // Watermark
      includeWatermark && template.watermark ? {
        type: 'watermark',
        text: template.watermark.text,
        opacity: template.watermark.opacity,
        angle: template.watermark.angle,
      } : null,
      // Signature blocks
      ...template.signatureBlocks.map(block => ({
        type: 'signature_block',
        id: block.id,
        label: block.label,
        position: { x: block.x, y: block.y, width: block.width, height: block.height },
        requiresDate: block.requiresDate,
        requiresWitness: block.requiresWitness,
        requiresNotary: block.requiresNotary,
      })),
      // Footer
      template.footer ? {
        type: 'footer',
        text: template.footer.text,
        pageNumbers: template.footer.pageNumbers,
        dateGenerated: template.footer.dateGenerated,
      } : null,
    ].filter(Boolean),
  };
}

// ============================================
// TEMPLATE COLLECTION
// ============================================

export function getAllPDFTemplates(): PDFTemplate[] {
  return [
    getArticlesOfIncorporationPDFTemplate(),
    getW2PDFTemplate(),
    getPromissoryNotePDFTemplate(),
  ];
}

export function getPDFTemplateById(id: string): PDFTemplate | undefined {
  return getAllPDFTemplates().find(t => t.id === id);
}

export function getPDFTemplatesByCategory(category: string): PDFTemplate[] {
  return getAllPDFTemplates().filter(t => t.category === category);
}
