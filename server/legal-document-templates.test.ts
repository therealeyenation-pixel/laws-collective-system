import { describe, it, expect } from "vitest";
import {
  getAllTemplates,
  getTemplatesByCategory,
  getArticlesOfIncorporationTemplate,
  getLLCArticlesTemplate,
  getDBATemplate,
  getSS4EINTemplate,
  getForm1023Template,
  getW2Template,
  get1099NECTemplate,
  getWarrantyDeedTemplate,
  getOfferLetterTemplate,
  getRevocableLivingTrustTemplate,
  validateTemplateData,
  STATE_BUSINESS_TEMPLATES,
  FEDERAL_FILING_TEMPLATES,
  TAX_FORM_TEMPLATES,
  PROPERTY_DOCUMENT_TEMPLATES,
  EMPLOYMENT_DOCUMENT_TEMPLATES,
  TRUST_DOCUMENT_TEMPLATES,
} from "./services/legal-document-templates";

describe("Legal Document Templates Service", () => {
  describe("Template Constants", () => {
    it("should have state business template constants", () => {
      expect(STATE_BUSINESS_TEMPLATES.ARTICLES_OF_INCORPORATION).toBe('articles_of_incorporation');
      expect(STATE_BUSINESS_TEMPLATES.LLC_ARTICLES).toBe('llc_articles_of_organization');
      expect(STATE_BUSINESS_TEMPLATES.DBA_REGISTRATION).toBe('dba_fictitious_business_name');
    });

    it("should have federal filing template constants", () => {
      expect(FEDERAL_FILING_TEMPLATES.SS4_EIN_APPLICATION).toBe('ss4_ein_application');
      expect(FEDERAL_FILING_TEMPLATES.FORM_1023_501C3).toBe('form_1023_501c3_application');
      expect(FEDERAL_FILING_TEMPLATES.FORM_2553_S_CORP).toBe('form_2553_s_corp_election');
    });

    it("should have tax form template constants", () => {
      expect(TAX_FORM_TEMPLATES.W2_WAGE_STATEMENT).toBe('w2_wage_statement');
      expect(TAX_FORM_TEMPLATES.FORM_1099_NEC).toBe('form_1099_nec_nonemployee');
      expect(TAX_FORM_TEMPLATES.SCHEDULE_C).toBe('schedule_c_profit_loss');
    });

    it("should have property document template constants", () => {
      expect(PROPERTY_DOCUMENT_TEMPLATES.WARRANTY_DEED).toBe('warranty_deed');
      expect(PROPERTY_DOCUMENT_TEMPLATES.QUITCLAIM_DEED).toBe('quitclaim_deed');
    });

    it("should have employment document template constants", () => {
      expect(EMPLOYMENT_DOCUMENT_TEMPLATES.OFFER_LETTER).toBe('offer_letter');
      expect(EMPLOYMENT_DOCUMENT_TEMPLATES.I9_VERIFICATION).toBe('i9_employment_verification');
    });

    it("should have trust document template constants", () => {
      expect(TRUST_DOCUMENT_TEMPLATES.REVOCABLE_LIVING_TRUST).toBe('revocable_living_trust');
      expect(TRUST_DOCUMENT_TEMPLATES.POWER_OF_ATTORNEY).toBe('power_of_attorney');
    });
  });

  describe("State Business Templates", () => {
    it("should generate Articles of Incorporation template", () => {
      const template = getArticlesOfIncorporationTemplate('California');
      
      expect(template.id).toBe('articles_of_incorporation');
      expect(template.name).toContain('California');
      expect(template.category).toBe('state_business');
      expect(template.governmentCompliant).toBe(true);
      expect(template.fields.length).toBeGreaterThan(0);
      expect(template.sections.length).toBeGreaterThan(0);
    });

    it("should generate LLC Articles template", () => {
      const template = getLLCArticlesTemplate('Texas');
      
      expect(template.id).toBe('llc_articles_of_organization');
      expect(template.name).toContain('Texas');
      expect(template.category).toBe('state_business');
      expect(template.fields.some(f => f.name === 'llcName')).toBe(true);
      expect(template.fields.some(f => f.name === 'managementType')).toBe(true);
    });

    it("should generate DBA template", () => {
      const template = getDBATemplate('Nevada');
      
      expect(template.id).toBe('dba_fictitious_business_name');
      expect(template.name).toContain('Nevada');
      expect(template.fields.some(f => f.name === 'fictitiousName')).toBe(true);
    });

    it("should have correct formatting for state filings", () => {
      const template = getArticlesOfIncorporationTemplate('Delaware');
      
      expect(template.formatting.pageSize).toBe('letter');
      expect(template.formatting.font).toBe('Times New Roman');
      expect(template.formatting.fontSize).toBe(12);
    });
  });

  describe("Federal Filing Templates", () => {
    it("should generate SS-4 EIN Application template", () => {
      const template = getSS4EINTemplate();
      
      expect(template.id).toBe('ss4_ein_application');
      expect(template.category).toBe('federal_filing');
      expect(template.governmentCompliant).toBe(true);
      expect(template.estimatedFilingFee).toBe(0);
      expect(template.fields.some(f => f.name === 'legalName')).toBe(true);
      expect(template.fields.some(f => f.name === 'responsiblePartySSN')).toBe(true);
    });

    it("should generate Form 1023 template", () => {
      const template = getForm1023Template();
      
      expect(template.id).toBe('form_1023_501c3_application');
      expect(template.category).toBe('federal_filing');
      expect(template.estimatedFilingFee).toBe(600);
      expect(template.fields.some(f => f.name === 'missionStatement')).toBe(true);
      expect(template.fields.some(f => f.name === 'publicCharityStatus')).toBe(true);
    });

    it("should have correct formatting for federal forms", () => {
      const template = getSS4EINTemplate();
      
      expect(template.formatting.font).toBe('Courier');
      expect(template.formatting.fontSize).toBe(10);
    });
  });

  describe("Tax Form Templates", () => {
    it("should generate W-2 template", () => {
      const template = getW2Template();
      
      expect(template.id).toBe('w2_wage_statement');
      expect(template.category).toBe('tax_forms');
      expect(template.fields.some(f => f.name === 'employerEIN')).toBe(true);
      expect(template.fields.some(f => f.name === 'employeeSSN')).toBe(true);
      expect(template.fields.some(f => f.name === 'wagesTipsOther')).toBe(true);
      expect(template.fields.some(f => f.name === 'federalIncomeTax')).toBe(true);
    });

    it("should generate 1099-NEC template", () => {
      const template = get1099NECTemplate();
      
      expect(template.id).toBe('form_1099_nec_nonemployee');
      expect(template.category).toBe('tax_forms');
      expect(template.fields.some(f => f.name === 'nonemployeeCompensation')).toBe(true);
    });

    it("should have correct sections for W-2", () => {
      const template = getW2Template();
      
      expect(template.sections.some(s => s.id === 'employer')).toBe(true);
      expect(template.sections.some(s => s.id === 'employee')).toBe(true);
      expect(template.sections.some(s => s.id === 'wages')).toBe(true);
      expect(template.sections.some(s => s.id === 'taxes')).toBe(true);
    });
  });

  describe("Property Document Templates", () => {
    it("should generate Warranty Deed template", () => {
      const template = getWarrantyDeedTemplate('California');
      
      expect(template.id).toBe('warranty_deed');
      expect(template.category).toBe('property');
      expect(template.formatting.pageSize).toBe('legal');
      expect(template.fields.some(f => f.name === 'grantorName')).toBe(true);
      expect(template.fields.some(f => f.name === 'granteeName')).toBe(true);
      expect(template.fields.some(f => f.name === 'legalDescription')).toBe(true);
    });

    it("should have vesting type options", () => {
      const template = getWarrantyDeedTemplate('California');
      const vestingField = template.fields.find(f => f.name === 'vestingType');
      
      expect(vestingField).toBeDefined();
      expect(vestingField?.options).toContain('Joint Tenants');
      expect(vestingField?.options).toContain('Community Property');
    });
  });

  describe("Employment Document Templates", () => {
    it("should generate Offer Letter template", () => {
      const template = getOfferLetterTemplate();
      
      expect(template.id).toBe('offer_letter');
      expect(template.category).toBe('employment');
      expect(template.fields.some(f => f.name === 'positionTitle')).toBe(true);
      expect(template.fields.some(f => f.name === 'salary')).toBe(true);
      expect(template.fields.some(f => f.name === 'startDate')).toBe(true);
    });

    it("should have employment type options", () => {
      const template = getOfferLetterTemplate();
      const typeField = template.fields.find(f => f.name === 'employmentType');
      
      expect(typeField).toBeDefined();
      expect(typeField?.options).toContain('Full-Time');
      expect(typeField?.options).toContain('Part-Time');
      expect(typeField?.options).toContain('Contract');
    });
  });

  describe("Trust Document Templates", () => {
    it("should generate Revocable Living Trust template", () => {
      const template = getRevocableLivingTrustTemplate('California');
      
      expect(template.id).toBe('revocable_living_trust');
      expect(template.category).toBe('trust');
      expect(template.fields.some(f => f.name === 'trustName')).toBe(true);
      expect(template.fields.some(f => f.name === 'grantorName')).toBe(true);
      expect(template.fields.some(f => f.name === 'successorTrusteeName')).toBe(true);
    });

    it("should have beneficiary fields", () => {
      const template = getRevocableLivingTrustTemplate('California');
      
      expect(template.fields.some(f => f.name === 'primaryBeneficiaryName')).toBe(true);
      expect(template.fields.some(f => f.name === 'primaryBeneficiaryShare')).toBe(true);
    });
  });

  describe("Template Retrieval Functions", () => {
    it("should get all templates", () => {
      const templates = getAllTemplates();
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.category === 'state_business')).toBe(true);
      expect(templates.some(t => t.category === 'federal_filing')).toBe(true);
      expect(templates.some(t => t.category === 'tax_forms')).toBe(true);
    });

    it("should get templates by category", () => {
      const stateTemplates = getTemplatesByCategory('state_business');
      const federalTemplates = getTemplatesByCategory('federal_filing');
      
      expect(stateTemplates.every(t => t.category === 'state_business')).toBe(true);
      expect(federalTemplates.every(t => t.category === 'federal_filing')).toBe(true);
    });
  });

  describe("Template Validation", () => {
    it("should validate required fields", () => {
      const template = getArticlesOfIncorporationTemplate('California');
      const result = validateTemplateData(template, {});
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('required'))).toBe(true);
    });

    it("should pass validation with all required fields", () => {
      const template = getDBATemplate('California');
      const result = validateTemplateData(template, {
        fictitiousName: 'Test Business',
        registrantType: 'Individual',
        registrantName: 'John Doe',
        registrantAddress: '123 Main St, Los Angeles, CA 90001',
        businessAddress: '456 Business Ave, Los Angeles, CA 90002',
        businessType: 'Retail',
        commencementDate: '2024-01-01',
        registrantSignature: '/s/ John Doe',
        filingDate: '2024-01-15',
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should validate SSN format", () => {
      const template = getW2Template();
      const result = validateTemplateData(template, {
        employerEIN: '12-3456789',
        employerName: 'Test Corp',
        employerAddress: '123 Main St',
        employeeSSN: 'invalid-ssn',
        employeeName: 'John Doe',
        employeeAddress: '456 Oak Ave',
        wagesTipsOther: '50000',
        federalIncomeTax: '5000',
        socialSecurityWages: '50000',
        socialSecurityTax: '3100',
        medicareWages: '50000',
        medicareTax: '725',
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('SSN'))).toBe(true);
    });

    it("should validate EIN format", () => {
      const template = getSS4EINTemplate();
      const result = validateTemplateData(template, {
        legalName: 'Test Corp',
        mailingAddress: '123 Main St',
        county: 'Los Angeles',
        state: 'CA',
        responsiblePartyName: 'John Doe',
        responsiblePartySSN: '123-45-6789',
        entityType: 'Corporation',
        reasonForApplying: 'Started new business',
        dateBusinessStarted: '2024-01-01',
        closingMonthFiscalYear: 'December',
        highestEmployeeCount: '10',
        principalActivity: 'Consulting',
        signature: '/s/ John Doe',
        signatureDate: '2024-01-15',
        signerTitle: 'President',
        signerPhone: '555-123-4567',
      });
      
      expect(result.valid).toBe(true);
    });

    it("should validate max length", () => {
      const template = getArticlesOfIncorporationTemplate('California');
      const result = validateTemplateData(template, {
        corporateName: 'A'.repeat(200), // Exceeds 100 char limit
        corporateSuffix: 'Inc.',
        purpose: 'Test purpose',
        authorizedShares: '1000',
        parValue: '0.01',
        stockClasses: 'Common Only',
        registeredAgentName: 'Agent Name',
        registeredAgentAddress: '123 Main St',
        incorporatorName: 'John Doe',
        incorporatorAddress: '456 Oak Ave',
        incorporatorSignature: '/s/ John Doe',
        filingDate: '2024-01-15',
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('no more than'))).toBe(true);
    });

    it("should validate number range", () => {
      const template = getRevocableLivingTrustTemplate('California');
      const result = validateTemplateData(template, {
        trustName: 'Test Trust',
        trustDate: '2024-01-01',
        grantorName: 'John Doe',
        grantorAddress: '123 Main St',
        grantorSSN: '123-45-6789',
        initialTrusteeName: 'John Doe',
        successorTrusteeName: 'Jane Doe',
        successorTrusteeAddress: '456 Oak Ave',
        primaryBeneficiaryName: 'Child Doe',
        primaryBeneficiaryRelation: 'Child',
        primaryBeneficiaryShare: '150', // Exceeds 100%
        grantorSignature: '/s/ John Doe',
        witness1Signature: '/s/ Witness 1',
        witness2Signature: '/s/ Witness 2',
        notaryAcknowledgment: 'Notary Seal',
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('no more than'))).toBe(true);
    });
  });

  describe("Template Field Types", () => {
    it("should have correct field types for signatures", () => {
      const template = getArticlesOfIncorporationTemplate('California');
      const signatureField = template.fields.find(f => f.type === 'signature');
      
      expect(signatureField).toBeDefined();
      expect(signatureField?.required).toBe(true);
    });

    it("should have correct field types for currency", () => {
      const template = getOfferLetterTemplate();
      const salaryField = template.fields.find(f => f.name === 'salary');
      
      expect(salaryField?.type).toBe('currency');
      expect(salaryField?.required).toBe(true);
    });

    it("should have correct field types for addresses", () => {
      const template = getLLCArticlesTemplate('California');
      const addressField = template.fields.find(f => f.type === 'address');
      
      expect(addressField).toBeDefined();
    });

    it("should have correct field types for select options", () => {
      const template = getSS4EINTemplate();
      const entityTypeField = template.fields.find(f => f.name === 'entityType');
      
      expect(entityTypeField?.type).toBe('select');
      expect(entityTypeField?.options?.length).toBeGreaterThan(0);
    });
  });

  describe("Filing Information", () => {
    it("should have filing instructions", () => {
      const template = getArticlesOfIncorporationTemplate('California');
      
      expect(template.filingInstructions).toBeDefined();
      expect(template.filingInstructions?.length).toBeGreaterThan(0);
    });

    it("should have estimated filing fees", () => {
      const template = getLLCArticlesTemplate('California');
      
      expect(template.estimatedFilingFee).toBeDefined();
      expect(template.estimatedFilingFee).toBeGreaterThanOrEqual(0);
    });

    it("should have jurisdiction for state templates", () => {
      const template = getDBATemplate('Nevada');
      
      expect(template.jurisdiction).toBe('Nevada');
    });
  });

  describe("Template Formatting", () => {
    it("should have correct page size for legal documents", () => {
      const deed = getWarrantyDeedTemplate('California');
      
      expect(deed.formatting.pageSize).toBe('legal');
    });

    it("should have correct margins", () => {
      const template = getArticlesOfIncorporationTemplate('California');
      
      expect(template.formatting.margins.top).toBeGreaterThan(0);
      expect(template.formatting.margins.right).toBeGreaterThan(0);
      expect(template.formatting.margins.bottom).toBeGreaterThan(0);
      expect(template.formatting.margins.left).toBeGreaterThan(0);
    });

    it("should have line spacing", () => {
      const template = getOfferLetterTemplate();
      
      expect(template.formatting.lineSpacing).toBeGreaterThan(0);
    });
  });
});
