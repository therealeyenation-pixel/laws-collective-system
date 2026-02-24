/**
 * PDF Generation Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateTrackingCode,
  generateBarcodeData,
  generateQRCode,
  validateFields,
  mapEntityToFields,
  generatePDFContent,
  generatePDF,
  generateSS4,
  generateW9,
  generateDEAnnualReport,
  generateGAAnnualRegistration,
  generate508AnnualReport,
  getAvailableTemplates,
  getTemplatesByJurisdiction,
  getTemplateById,
  calculateFilingDeadline,
  getUpcomingDeadlines,
  PAPER_SIZES,
  DEFAULT_MARGINS,
  GOVERNMENT_FORM_TEMPLATES,
  type PDFFieldMapping,
  type PDFDocumentConfig,
  type EntityData,
  type GovernmentFormTemplate,
} from './pdf-generation';

describe('PDF Generation Service', () => {
  // ============================================================================
  // Tracking Code Generation
  // ============================================================================
  
  describe('generateTrackingCode', () => {
    it('should generate a unique tracking code', () => {
      const code1 = generateTrackingCode('IRS-SS4');
      const code2 = generateTrackingCode('IRS-SS4');
      
      expect(code1).toBeTruthy();
      expect(code2).toBeTruthy();
      expect(code1).not.toBe(code2);
    });
    
    it('should include document type prefix', () => {
      const code = generateTrackingCode('IRS-SS4');
      expect(code.startsWith('IRS-')).toBe(true);
    });
    
    it('should include entity suffix when provided', () => {
      const code = generateTrackingCode('FORM', 'ENT123');
      expect(code).toContain('ENT1');
    });
    
    it('should use XXXX when no entity ID provided', () => {
      const code = generateTrackingCode('FORM');
      expect(code).toContain('XXXX');
    });
    
    it('should generate uppercase codes', () => {
      const code = generateTrackingCode('test');
      expect(code).toBe(code.toUpperCase());
    });
  });
  
  describe('generateBarcodeData', () => {
    it('should remove dashes from tracking code', () => {
      const trackingCode = 'ABC-123-DEF-456';
      const barcodeData = generateBarcodeData(trackingCode);
      
      expect(barcodeData).toBe('ABC123DEF456');
      expect(barcodeData).not.toContain('-');
    });
    
    it('should handle codes without dashes', () => {
      const trackingCode = 'ABC123DEF456';
      const barcodeData = generateBarcodeData(trackingCode);
      
      expect(barcodeData).toBe('ABC123DEF456');
    });
  });
  
  describe('generateQRCode', () => {
    it('should generate a data URL for QR code', async () => {
      const data = 'TEST-TRACKING-CODE';
      const qrDataUrl = await generateQRCode(data);
      
      expect(qrDataUrl).toBeTruthy();
      expect(qrDataUrl.startsWith('data:image/png;base64,')).toBe(true);
    });
    
    it('should generate different QR codes for different data', async () => {
      const qr1 = await generateQRCode('DATA1');
      const qr2 = await generateQRCode('DATA2');
      
      expect(qr1).not.toBe(qr2);
    });
    
    it('should return empty string for empty input', async () => {
      const qr = await generateQRCode('');
      expect(qr).toBe('');
    });
  });
  
  // ============================================================================
  // Field Validation
  // ============================================================================
  
  describe('validateFields', () => {
    it('should return empty array for valid fields', () => {
      const fields: PDFFieldMapping[] = [
        { fieldId: 'name', fieldName: 'Name', fieldType: 'text', value: 'Test Corp', required: true, x: 0, y: 0, width: 100, height: 20 },
        { fieldId: 'ein', fieldName: 'EIN', fieldType: 'text', value: '12-3456789', required: true, format: 'XX-XXXXXXX', x: 0, y: 0, width: 100, height: 20 },
      ];
      
      const errors = validateFields(fields);
      expect(errors).toHaveLength(0);
    });
    
    it('should detect missing required fields', () => {
      const fields: PDFFieldMapping[] = [
        { fieldId: 'name', fieldName: 'Name', fieldType: 'text', value: null, required: true, x: 0, y: 0, width: 100, height: 20 },
        { fieldId: 'optional', fieldName: 'Optional', fieldType: 'text', value: null, required: false, x: 0, y: 0, width: 100, height: 20 },
      ];
      
      const errors = validateFields(fields);
      expect(errors).toHaveLength(1);
      expect(errors[0].fieldId).toBe('name');
      expect(errors[0].errorType).toBe('required');
    });
    
    it('should detect empty string as missing for required fields', () => {
      const fields: PDFFieldMapping[] = [
        { fieldId: 'name', fieldName: 'Name', fieldType: 'text', value: '', required: true, x: 0, y: 0, width: 100, height: 20 },
      ];
      
      const errors = validateFields(fields);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorType).toBe('required');
    });
    
    it('should detect fields exceeding max length', () => {
      const fields: PDFFieldMapping[] = [
        { fieldId: 'name', fieldName: 'Name', fieldType: 'text', value: 'A'.repeat(101), required: true, maxLength: 100, x: 0, y: 0, width: 100, height: 20 },
      ];
      
      const errors = validateFields(fields);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorType).toBe('length');
    });
    
    it('should validate SSN format', () => {
      const validFields: PDFFieldMapping[] = [
        { fieldId: 'ssn', fieldName: 'SSN', fieldType: 'text', value: '123-45-6789', required: true, format: 'XXX-XX-XXXX', x: 0, y: 0, width: 100, height: 20 },
      ];
      
      const invalidFields: PDFFieldMapping[] = [
        { fieldId: 'ssn', fieldName: 'SSN', fieldType: 'text', value: '12345-6789', required: true, format: 'XXX-XX-XXXX', x: 0, y: 0, width: 100, height: 20 },
      ];
      
      expect(validateFields(validFields)).toHaveLength(0);
      expect(validateFields(invalidFields)).toHaveLength(1);
      expect(validateFields(invalidFields)[0].errorType).toBe('format');
    });
    
    it('should validate EIN format', () => {
      const validFields: PDFFieldMapping[] = [
        { fieldId: 'ein', fieldName: 'EIN', fieldType: 'text', value: '12-3456789', required: true, format: 'XX-XXXXXXX', x: 0, y: 0, width: 100, height: 20 },
      ];
      
      const invalidFields: PDFFieldMapping[] = [
        { fieldId: 'ein', fieldName: 'EIN', fieldType: 'text', value: '123456789', required: true, format: 'XX-XXXXXXX', x: 0, y: 0, width: 100, height: 20 },
      ];
      
      expect(validateFields(validFields)).toHaveLength(0);
      expect(validateFields(invalidFields)).toHaveLength(1);
    });
    
    it('should validate date format MM/DD/YYYY', () => {
      const validFields: PDFFieldMapping[] = [
        { fieldId: 'date', fieldName: 'Date', fieldType: 'date', value: '01/15/2024', required: true, format: 'MM/DD/YYYY', x: 0, y: 0, width: 100, height: 20 },
      ];
      
      const invalidFields: PDFFieldMapping[] = [
        { fieldId: 'date', fieldName: 'Date', fieldType: 'date', value: '2024-01-15', required: true, format: 'MM/DD/YYYY', x: 0, y: 0, width: 100, height: 20 },
      ];
      
      expect(validateFields(validFields)).toHaveLength(0);
      expect(validateFields(invalidFields)).toHaveLength(1);
    });
    
    it('should validate number fields', () => {
      const validFields: PDFFieldMapping[] = [
        { fieldId: 'count', fieldName: 'Count', fieldType: 'number', value: 100, required: true, x: 0, y: 0, width: 100, height: 20 },
      ];
      
      const invalidFields: PDFFieldMapping[] = [
        { fieldId: 'count', fieldName: 'Count', fieldType: 'number', value: 'not a number' as any, required: true, x: 0, y: 0, width: 100, height: 20 },
      ];
      
      expect(validateFields(validFields)).toHaveLength(0);
      expect(validateFields(invalidFields)).toHaveLength(1);
      expect(validateFields(invalidFields)[0].errorType).toBe('type');
    });
    
    it('should validate currency fields', () => {
      const validFields: PDFFieldMapping[] = [
        { fieldId: 'amount', fieldName: 'Amount', fieldType: 'currency', value: 1000.50, required: true, x: 0, y: 0, width: 100, height: 20 },
      ];
      
      const invalidFields: PDFFieldMapping[] = [
        { fieldId: 'amount', fieldName: 'Amount', fieldType: 'currency', value: 'invalid' as any, required: true, x: 0, y: 0, width: 100, height: 20 },
      ];
      
      expect(validateFields(validFields)).toHaveLength(0);
      expect(validateFields(invalidFields)).toHaveLength(1);
    });
    
    it('should skip validation for empty optional fields', () => {
      const fields: PDFFieldMapping[] = [
        { fieldId: 'optional', fieldName: 'Optional', fieldType: 'text', value: null, required: false, maxLength: 10, x: 0, y: 0, width: 100, height: 20 },
      ];
      
      const errors = validateFields(fields);
      expect(errors).toHaveLength(0);
    });
  });
  
  // ============================================================================
  // Field Mapping
  // ============================================================================
  
  describe('mapEntityToFields', () => {
    const mockEntity: EntityData = {
      id: 'ent-123',
      name: 'Test Corporation LLC',
      type: 'LLC',
      ein: '12-3456789',
      address: '123 Main Street',
      city: 'Atlanta',
      state: 'GA',
      zip: '30301',
      county: 'Fulton',
      formationDate: new Date(2020, 0, 15), // Use local date to avoid timezone issues
      fiscalYearEnd: '12',
      registeredAgent: 'Agent Services Inc',
      registeredAgentAddress: '456 Agent Ave, Atlanta, GA 30302',
      principalOfficer: 'Jane Doe',
      naicsCode: '541511',
    };
    
    it('should map entity data to SS-4 fields', () => {
      const template = GOVERNMENT_FORM_TEMPLATES.find(t => t.formId === 'irs-ss4')!;
      const fields = mapEntityToFields(mockEntity, template);
      
      const nameField = fields.find(f => f.fieldId === 'legal_name');
      expect(nameField?.value).toBe('Test Corporation LLC');
      
      const cityField = fields.find(f => f.fieldId === 'city');
      expect(cityField?.value).toBe('Atlanta');
      
      const stateField = fields.find(f => f.fieldId === 'state');
      expect(stateField?.value).toBe('GA');
    });
    
    it('should map entity data to GA Annual Registration fields', () => {
      const template = GOVERNMENT_FORM_TEMPLATES.find(t => t.formId === 'ga-annual-registration')!;
      const fields = mapEntityToFields(mockEntity, template);
      
      const entityNameField = fields.find(f => f.fieldId === 'entity_name');
      expect(entityNameField?.value).toBe('Test Corporation LLC');
      
      const naicsField = fields.find(f => f.fieldId === 'naics_code');
      expect(naicsField?.value).toBe('541511');
      
      const ceoField = fields.find(f => f.fieldId === 'ceo_name');
      expect(ceoField?.value).toBe('Jane Doe');
    });
    
    it('should format date fields correctly', () => {
      const template = GOVERNMENT_FORM_TEMPLATES.find(t => t.formId === 'irs-ss4')!;
      const fields = mapEntityToFields(mockEntity, template);
      
      const dateField = fields.find(f => f.fieldId === 'date_started');
      expect(dateField?.value).toBe('01/15/2020');
    });
    
    it('should preserve field positions from template', () => {
      const template = GOVERNMENT_FORM_TEMPLATES.find(t => t.formId === 'irs-ss4')!;
      const fields = mapEntityToFields(mockEntity, template);
      
      const nameField = fields.find(f => f.fieldId === 'legal_name');
      expect(nameField?.x).toBe(72);
      expect(nameField?.y).toBe(650);
    });
    
    it('should handle missing entity data gracefully', () => {
      const partialEntity: EntityData = {
        id: 'ent-456',
        name: 'Partial Corp',
        type: 'LLC',
      };
      
      const template = GOVERNMENT_FORM_TEMPLATES.find(t => t.formId === 'irs-ss4')!;
      const fields = mapEntityToFields(partialEntity, template);
      
      const nameField = fields.find(f => f.fieldId === 'legal_name');
      expect(nameField?.value).toBe('Partial Corp');
      
      const cityField = fields.find(f => f.fieldId === 'city');
      expect(cityField?.value).toBeNull();
    });
  });
  
  // ============================================================================
  // PDF Content Generation
  // ============================================================================
  
  describe('generatePDFContent', () => {
    it('should generate HTML content with fields', async () => {
      const config: PDFDocumentConfig = {
        documentId: 'test-doc',
        documentType: 'TEST',
        title: 'Test Document',
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields: [
          { fieldId: 'name', fieldName: 'Name', fieldType: 'text', value: 'Test Value', required: true, x: 0, y: 0, width: 100, height: 20 },
        ],
        signatures: [],
        pageNumbers: true,
        confidential: false,
      };
      
      const content = await generatePDFContent(config);
      
      expect(content.html).toContain('Test Document');
      expect(content.html).toContain('Test Value');
      expect(content.trackingCode).toBeTruthy();
      expect(content.qrCodeDataUrl).toBeTruthy();
    });
    
    it('should include signature blocks', async () => {
      const config: PDFDocumentConfig = {
        documentId: 'test-doc',
        documentType: 'TEST',
        title: 'Test Document',
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields: [],
        signatures: [
          { id: 'sig1', signerName: 'John Doe', signerRole: 'CEO', x: 0, y: 0, width: 200, height: 40, required: true },
        ],
        pageNumbers: true,
        confidential: false,
      };
      
      const content = await generatePDFContent(config);
      
      expect(content.html).toContain('CEO');
      expect(content.html).toContain('John Doe');
      expect(content.html).toContain('signature-block');
    });
    
    it('should include confidential banner when specified', async () => {
      const config: PDFDocumentConfig = {
        documentId: 'test-doc',
        documentType: 'TEST',
        title: 'Test Document',
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields: [],
        signatures: [],
        pageNumbers: true,
        confidential: true,
      };
      
      const content = await generatePDFContent(config);
      
      expect(content.html).toContain('CONFIDENTIAL');
      expect(content.html).toContain('confidential-banner');
    });
    
    it('should include watermark when specified', async () => {
      const config: PDFDocumentConfig = {
        documentId: 'test-doc',
        documentType: 'TEST',
        title: 'Test Document',
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields: [],
        signatures: [],
        watermark: 'DRAFT',
        pageNumbers: true,
        confidential: false,
      };
      
      const content = await generatePDFContent(config);
      
      expect(content.html).toContain('DRAFT');
      expect(content.html).toContain('watermark');
    });
    
    it('should format currency fields correctly', async () => {
      const config: PDFDocumentConfig = {
        documentId: 'test-doc',
        documentType: 'TEST',
        title: 'Test Document',
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields: [
          { fieldId: 'amount', fieldName: 'Amount', fieldType: 'currency', value: 1234567.89, required: true, x: 0, y: 0, width: 100, height: 20 },
        ],
        signatures: [],
        pageNumbers: true,
        confidential: false,
      };
      
      const content = await generatePDFContent(config);
      
      expect(content.html).toContain('$1,234,567.89');
    });
    
    it('should format checkbox fields correctly', async () => {
      const config: PDFDocumentConfig = {
        documentId: 'test-doc',
        documentType: 'TEST',
        title: 'Test Document',
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields: [
          { fieldId: 'checked', fieldName: 'Checked', fieldType: 'checkbox', value: true, required: false, x: 0, y: 0, width: 20, height: 20 },
          { fieldId: 'unchecked', fieldName: 'Unchecked', fieldType: 'checkbox', value: false, required: false, x: 0, y: 0, width: 20, height: 20 },
        ],
        signatures: [],
        pageNumbers: true,
        confidential: false,
      };
      
      const content = await generatePDFContent(config);
      
      expect(content.html).toContain('☑');
      expect(content.html).toContain('☐');
    });
    
    it('should include QR code in tracking section', async () => {
      const config: PDFDocumentConfig = {
        documentId: 'test-doc',
        documentType: 'TEST',
        title: 'Test Document',
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields: [],
        signatures: [],
        pageNumbers: true,
        confidential: false,
      };
      
      const content = await generatePDFContent(config);
      
      expect(content.html).toContain('qr-code');
      expect(content.html).toContain('data:image/png;base64,');
    });
  });
  
  // ============================================================================
  // PDF Generation
  // ============================================================================
  
  describe('generatePDF', () => {
    it('should generate PDF with valid fields', async () => {
      const config: PDFDocumentConfig = {
        documentId: 'test-doc',
        documentType: 'TEST',
        title: 'Test Document',
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields: [
          { fieldId: 'name', fieldName: 'Name', fieldType: 'text', value: 'Test Corp', required: true, x: 0, y: 0, width: 100, height: 20 },
        ],
        signatures: [],
        pageNumbers: true,
        confidential: false,
      };
      
      const result = await generatePDF(config);
      
      expect(result.success).toBe(true);
      expect(result.documentId).toBe('test-doc');
      expect(result.trackingCode).toBeTruthy();
      expect(result.validationErrors).toHaveLength(0);
      expect(result.generatedAt).toBeInstanceOf(Date);
    });
    
    it('should return validation errors for invalid fields', async () => {
      const config: PDFDocumentConfig = {
        documentId: 'test-doc',
        documentType: 'TEST',
        title: 'Test Document',
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields: [
          { fieldId: 'name', fieldName: 'Name', fieldType: 'text', value: null, required: true, x: 0, y: 0, width: 100, height: 20 },
        ],
        signatures: [],
        pageNumbers: true,
        confidential: false,
      };
      
      const result = await generatePDF(config);
      
      expect(result.success).toBe(false);
      expect(result.validationErrors).toHaveLength(1);
      expect(result.validationErrors[0].fieldId).toBe('name');
    });
    
    it('should use provided tracking code', async () => {
      const config: PDFDocumentConfig = {
        documentId: 'test-doc',
        documentType: 'TEST',
        title: 'Test Document',
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields: [],
        signatures: [],
        trackingCode: 'CUSTOM-TRACKING-CODE',
        pageNumbers: true,
        confidential: false,
      };
      
      const result = await generatePDF(config);
      
      expect(result.trackingCode).toBe('CUSTOM-TRACKING-CODE');
    });
    
    it('should include QR code data URL', async () => {
      const config: PDFDocumentConfig = {
        documentId: 'test-doc',
        documentType: 'TEST',
        title: 'Test Document',
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields: [],
        signatures: [],
        pageNumbers: true,
        confidential: false,
      };
      
      const result = await generatePDF(config);
      
      expect(result.qrCodeDataUrl).toBeTruthy();
      expect(result.qrCodeDataUrl?.startsWith('data:image/png;base64,')).toBe(true);
    });
  });
  
  // ============================================================================
  // Pre-built Document Generators
  // ============================================================================
  
  describe('Pre-built Document Generators', () => {
    const mockEntity: EntityData = {
      id: 'ent-123',
      name: 'Test Corporation LLC',
      type: 'LLC',
      ein: '12-3456789',
      address: '123 Main Street',
      city: 'Atlanta',
      state: 'GA',
      zip: '30301',
      county: 'Fulton',
      formationDate: new Date(2020, 0, 15), // Use local date to avoid timezone issues
      fiscalYearEnd: '12',
      registeredAgent: 'Agent Services Inc',
      registeredAgentAddress: '456 Agent Ave, Atlanta, GA 30302',
      principalOfficer: 'Jane Doe',
      principalOfficerSSN: '123-45-6789',
      naicsCode: '541511',
      totalShares: 1000,
      parValue: 0.01,
      grossAssets: 100000,
      issuedShares: 500,
      grossReceipts: 50000,
      totalAssets: 75000,
      religiousPurpose: 'Educational and charitable purposes',
    };
    
    describe('generateSS4', () => {
      it('should generate SS-4 document', async () => {
        const result = await generateSS4(mockEntity);
        
        expect(result.documentId).toBe('ss4-ent-123');
        expect(result.trackingCode).toContain('IRS');
        expect(result.generatedAt).toBeInstanceOf(Date);
      });
    });
    
    describe('generateW9', () => {
      it('should generate W-9 document', async () => {
        const result = await generateW9(mockEntity);
        
        expect(result.documentId).toBe('w9-ent-123');
        expect(result.trackingCode).toContain('IRS');
      });
    });
    
    describe('generateDEAnnualReport', () => {
      it('should generate Delaware Annual Report', async () => {
        const result = await generateDEAnnualReport(mockEntity);
        
        expect(result.documentId).toBe('de-annual-ent-123');
        expect(result.trackingCode).toContain('DE-');
      });
    });
    
    describe('generateGAAnnualRegistration', () => {
      it('should generate Georgia Annual Registration', async () => {
        const result = await generateGAAnnualRegistration(mockEntity);
        
        expect(result.documentId).toBe('ga-annual-ent-123');
        expect(result.trackingCode).toContain('GA-');
      });
    });
    
    describe('generate508AnnualReport', () => {
      it('should generate 508(c)(1)(a) Annual Report', async () => {
        const result = await generate508AnnualReport(mockEntity);
        
        expect(result.documentId).toBe('508-annual-ent-123');
        expect(result.trackingCode).toContain('508');
      });
    });
  });
  
  // ============================================================================
  // Template Management
  // ============================================================================
  
  describe('Template Management', () => {
    describe('getAvailableTemplates', () => {
      it('should return all templates', () => {
        const templates = getAvailableTemplates();
        
        expect(templates.length).toBeGreaterThan(0);
        expect(templates).toEqual(GOVERNMENT_FORM_TEMPLATES);
      });
    });
    
    describe('getTemplatesByJurisdiction', () => {
      it('should filter federal templates', () => {
        const federalTemplates = getTemplatesByJurisdiction('federal');
        
        expect(federalTemplates.length).toBeGreaterThan(0);
        expect(federalTemplates.every(t => t.jurisdiction === 'federal')).toBe(true);
      });
      
      it('should filter state templates', () => {
        const stateTemplates = getTemplatesByJurisdiction('state');
        
        expect(stateTemplates.length).toBeGreaterThan(0);
        expect(stateTemplates.every(t => t.jurisdiction === 'state')).toBe(true);
      });
      
      it('should filter by specific state', () => {
        const gaTemplates = getTemplatesByJurisdiction('state', 'GA');
        
        expect(gaTemplates.length).toBeGreaterThan(0);
        expect(gaTemplates.every(t => t.state === 'GA')).toBe(true);
      });
      
      it('should return empty array for non-existent state', () => {
        const templates = getTemplatesByJurisdiction('state', 'XX');
        
        expect(templates).toHaveLength(0);
      });
    });
    
    describe('getTemplateById', () => {
      it('should return template by ID', () => {
        const template = getTemplateById('irs-ss4');
        
        expect(template).toBeTruthy();
        expect(template?.formId).toBe('irs-ss4');
        expect(template?.formName).toContain('Employer Identification Number');
      });
      
      it('should return undefined for non-existent ID', () => {
        const template = getTemplateById('non-existent');
        
        expect(template).toBeUndefined();
      });
    });
    
    describe('calculateFilingDeadline', () => {
      it('should calculate deadline for March 1', () => {
        const template = getTemplateById('de-annual-report')!;
        const deadline = calculateFilingDeadline(template, 2024);
        
        expect(deadline).toBeInstanceOf(Date);
        expect(deadline?.getMonth()).toBe(2); // March
        expect(deadline?.getDate()).toBe(1);
        expect(deadline?.getFullYear()).toBe(2024);
      });
      
      it('should calculate deadline for April 1', () => {
        const template = getTemplateById('ga-annual-registration')!;
        const deadline = calculateFilingDeadline(template, 2024);
        
        expect(deadline).toBeInstanceOf(Date);
        expect(deadline?.getMonth()).toBe(3); // April
        expect(deadline?.getDate()).toBe(1);
      });
      
      it('should return null for templates without deadline', () => {
        const template = getTemplateById('irs-ss4')!;
        const deadline = calculateFilingDeadline(template, 2024);
        
        expect(deadline).toBeNull();
      });
    });
    
    describe('getUpcomingDeadlines', () => {
      it('should return upcoming deadlines for entity', () => {
        const deadlines = getUpcomingDeadlines('GA', 'LLC', 2024);
        
        expect(deadlines.length).toBeGreaterThan(0);
        expect(deadlines.every(d => d.deadline instanceof Date)).toBe(true);
      });
      
      it('should sort deadlines chronologically', () => {
        const deadlines = getUpcomingDeadlines('GA', 'LLC', 2024);
        
        for (let i = 1; i < deadlines.length; i++) {
          expect(deadlines[i].deadline.getTime()).toBeGreaterThanOrEqual(deadlines[i - 1].deadline.getTime());
        }
      });
      
      it('should include next year deadlines', () => {
        const currentYear = new Date().getFullYear();
        const deadlines = getUpcomingDeadlines('GA', 'LLC', currentYear);
        
        const hasNextYear = deadlines.some(d => d.deadline.getFullYear() === currentYear + 1);
        expect(hasNextYear).toBe(true);
      });
    });
  });
  
  // ============================================================================
  // Constants
  // ============================================================================
  
  describe('Constants', () => {
    describe('PAPER_SIZES', () => {
      it('should have correct letter size', () => {
        expect(PAPER_SIZES.letter.width).toBe(612);
        expect(PAPER_SIZES.letter.height).toBe(792);
      });
      
      it('should have correct legal size', () => {
        expect(PAPER_SIZES.legal.width).toBe(612);
        expect(PAPER_SIZES.legal.height).toBe(1008);
      });
      
      it('should have correct A4 size', () => {
        expect(PAPER_SIZES.a4.width).toBe(595);
        expect(PAPER_SIZES.a4.height).toBe(842);
      });
    });
    
    describe('DEFAULT_MARGINS', () => {
      it('should have 1 inch margins (72 points)', () => {
        expect(DEFAULT_MARGINS.top).toBe(72);
        expect(DEFAULT_MARGINS.right).toBe(72);
        expect(DEFAULT_MARGINS.bottom).toBe(72);
        expect(DEFAULT_MARGINS.left).toBe(72);
      });
    });
    
    describe('GOVERNMENT_FORM_TEMPLATES', () => {
      it('should have required templates', () => {
        const templateIds = GOVERNMENT_FORM_TEMPLATES.map(t => t.formId);
        
        expect(templateIds).toContain('irs-ss4');
        expect(templateIds).toContain('irs-w9');
        expect(templateIds).toContain('de-annual-report');
        expect(templateIds).toContain('ga-annual-registration');
        expect(templateIds).toContain('508-annual-report');
      });
      
      it('should have valid template structure', () => {
        for (const template of GOVERNMENT_FORM_TEMPLATES) {
          expect(template.formId).toBeTruthy();
          expect(template.formName).toBeTruthy();
          expect(template.agency).toBeTruthy();
          expect(['federal', 'state', 'local']).toContain(template.jurisdiction);
          expect(template.fields.length).toBeGreaterThan(0);
          expect(template.signatures.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
