/**
 * Tests for Contract Agreement and Funding Templates
 * Phase 50.1b-c
 */

import { describe, it, expect } from 'vitest';
import * as contractTemplates from './services/contract-agreement-templates';
import * as fundingTemplates from './services/funding-templates';

describe('Contract Agreement Templates (Phase 50.1b)', () => {
  describe('Template Categories', () => {
    it('should have all contract categories defined', () => {
      expect(contractTemplates.CONTRACT_CATEGORIES.BUSINESS).toBe('business_contracts');
      expect(contractTemplates.CONTRACT_CATEGORIES.SERVICE).toBe('service_contracts');
      expect(contractTemplates.CONTRACT_CATEGORIES.PROPERTY).toBe('property_contracts');
      expect(contractTemplates.CONTRACT_CATEGORIES.EMPLOYMENT).toBe('employment_contracts');
      expect(contractTemplates.CONTRACT_CATEGORIES.TRUST_ESTATE).toBe('trust_estate_contracts');
    });
  });

  describe('Business Contract Templates', () => {
    it('should return valid operating agreement template', () => {
      const template = contractTemplates.getOperatingAgreementTemplate();
      expect(template.id).toBe('operating_agreement');
      expect(template.category).toBe('business_contracts');
      expect(template.clauses.length).toBeGreaterThan(0);
    });

    it('should return valid NDA template', () => {
      const template = contractTemplates.getNonDisclosureAgreementTemplate();
      expect(template.id).toBe('non_disclosure_agreement');
      expect(template.category).toBe('business_contracts');
    });

    it('should return valid buy-sell agreement template', () => {
      const template = contractTemplates.getBuySellAgreementTemplate();
      expect(template.id).toBe('buy_sell_agreement');
      expect(template.category).toBe('business_contracts');
    });
  });

  describe('Service Contract Templates', () => {
    it('should return valid independent contractor template', () => {
      const template = contractTemplates.getIndependentContractorAgreementTemplate();
      expect(template.id).toBe('independent_contractor_agreement');
      expect(template.category).toBe('service_contracts');
    });

    it('should return valid consulting agreement template', () => {
      const template = contractTemplates.getConsultingAgreementTemplate();
      expect(template.id).toBe('consulting_agreement');
      expect(template.category).toBe('service_contracts');
    });
  });

  describe('Property Contract Templates', () => {
    it('should return valid real estate purchase template', () => {
      const template = contractTemplates.getRealEstatePurchaseAgreementTemplate();
      expect(template.id).toBe('real_estate_purchase_agreement');
      expect(template.category).toBe('property_contracts');
    });

    it('should return valid commercial lease template', () => {
      const template = contractTemplates.getCommercialLeaseAgreementTemplate();
      expect(template.id).toBe('commercial_lease_agreement');
      expect(template.category).toBe('property_contracts');
    });
  });

  describe('Employment Contract Templates', () => {
    it('should return valid employment agreement template', () => {
      const template = contractTemplates.getEmploymentAgreementTemplate();
      expect(template.id).toBe('employment_agreement');
      expect(template.category).toBe('employment_contracts');
    });

    it('should return valid severance agreement template', () => {
      const template = contractTemplates.getSeveranceAgreementTemplate();
      expect(template.id).toBe('severance_agreement');
      expect(template.category).toBe('employment_contracts');
    });
  });

  describe('Trust/Estate Contract Templates', () => {
    it('should return valid trust agreement template', () => {
      const template = contractTemplates.getTrustAgreementTemplate();
      expect(template.id).toBe('trust_agreement');
      expect(template.category).toBe('trust_estate_contracts');
    });

    it('should return valid power of attorney template', () => {
      const template = contractTemplates.getPowerOfAttorneyTemplate();
      expect(template.id).toBe('power_of_attorney_financial');
      expect(template.category).toBe('trust_estate_contracts');
    });
  });

  describe('Template Collection', () => {
    it('should return all contract templates', () => {
      const templates = contractTemplates.getAllContractTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(10);
    });

    it('should filter templates by category', () => {
      const serviceTemplates = contractTemplates.getContractTemplatesByCategory('service_contracts');
      expect(serviceTemplates.every(t => t.category === 'service_contracts')).toBe(true);
    });

    it('should return clause library', () => {
      const clauses = contractTemplates.getClauseLibrary();
      expect(clauses.length).toBeGreaterThan(0);
    });
  });

  describe('Contract Validation', () => {
    it('should validate contract data with all fields', () => {
      const template = contractTemplates.getConsultingAgreementTemplate();
      const validData: Record<string, any> = {};
      // Fill all required fields from customizableFields
      template.customizableFields.filter(f => f.required).forEach(field => {
        validData[field.name] = field.defaultValue || 'Test Value';
      });
      const result = contractTemplates.validateContractData(template, validData);
      expect(result.errors.length).toBe(0);
    });

    it('should return errors for missing required fields', () => {
      const template = contractTemplates.getConsultingAgreementTemplate();
      const invalidData = {};
      const result = contractTemplates.validateContractData(template, invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Funding Templates (Phase 50.1c)', () => {
  describe('Template Categories', () => {
    it('should have all funding categories defined', () => {
      expect(fundingTemplates.FUNDING_CATEGORIES.GRANT_APPLICATION).toBe('grant_application');
      expect(fundingTemplates.FUNDING_CATEGORIES.GRANT_REPORT).toBe('grant_report');
      expect(fundingTemplates.FUNDING_CATEGORIES.LOAN_DOCUMENT).toBe('loan_document');
      expect(fundingTemplates.FUNDING_CATEGORIES.SBA_LOAN).toBe('sba_loan');
      expect(fundingTemplates.FUNDING_CATEGORIES.INVESTOR_DOCUMENT).toBe('investor_document');
    });
  });

  describe('Grant Application Templates', () => {
    it('should return valid federal SAM grant template', () => {
      const template = fundingTemplates.getFederalSAMGrantTemplate();
      expect(template.id).toBe('federal_sam_gov_application');
      expect(template.category).toBe('grant_application');
      expect(template.sections.some(s => s.id === 'project_summary')).toBe(true);
      expect(template.requiredAttachments.length).toBeGreaterThan(0);
    });

    it('should return valid foundation grant template', () => {
      const template = fundingTemplates.getFoundationGrantTemplate();
      expect(template.id).toBe('foundation_general_application');
      expect(template.category).toBe('grant_application');
    });

    it('should return valid 508(c)(1)(a) grant template', () => {
      const template = fundingTemplates.get508c1aGrantTemplate();
      expect(template.id).toBe('508_c_1_a_application');
      expect(template.category).toBe('grant_application');
    });
  });

  describe('Grant Report Templates', () => {
    it('should return valid progress report template', () => {
      const template = fundingTemplates.getGrantProgressReportTemplate();
      expect(template.id).toBe('grant_progress_report');
      expect(template.category).toBe('grant_report');
      expect(template.sections.some(s => s.id === 'activities_completed')).toBe(true);
    });

    it('should return valid final report template', () => {
      const template = fundingTemplates.getGrantFinalReportTemplate();
      expect(template.id).toBe('grant_final_report');
      expect(template.category).toBe('grant_report');
    });
  });

  describe('Loan Document Templates', () => {
    it('should return valid promissory note template', () => {
      const template = fundingTemplates.getPromissoryNoteTemplate();
      expect(template.id).toBe('promissory_note');
      expect(template.category).toBe('loan_document');
      expect(template.sections.some(s => s.id === 'principal_amount')).toBe(true);
    });

    it('should return valid loan agreement template', () => {
      const template = fundingTemplates.getLoanAgreementTemplate();
      expect(template.id).toBe('loan_agreement');
      expect(template.category).toBe('loan_document');
    });
  });

  describe('SBA Loan Templates', () => {
    it('should return valid SBA 7(a) template', () => {
      const template = fundingTemplates.getSBA7aTemplate();
      expect(template.id).toBe('sba_7a_application');
      expect(template.category).toBe('sba_loan');
      expect(template.complianceRequirements.length).toBeGreaterThan(0);
    });

    it('should return valid SBA 504 template', () => {
      const template = fundingTemplates.getSBA504Template();
      expect(template.id).toBe('sba_504_application');
      expect(template.category).toBe('sba_loan');
    });
  });

  describe('Investor Document Templates', () => {
    it('should return valid SAFE template', () => {
      const template = fundingTemplates.getSAFETemplate();
      expect(template.id).toBe('safe_agreement');
      expect(template.category).toBe('investor_document');
      expect(template.sections.some(s => s.id === 'valuation_cap')).toBe(true);
    });

    it('should return valid convertible note template', () => {
      const template = fundingTemplates.getConvertibleNoteTemplate();
      expect(template.id).toBe('convertible_note');
      expect(template.category).toBe('investor_document');
    });

    it('should return valid term sheet template', () => {
      const template = fundingTemplates.getTermSheetTemplate();
      expect(template.id).toBe('term_sheet');
      expect(template.category).toBe('investor_document');
    });
  });

  describe('Template Collection', () => {
    it('should return all funding templates', () => {
      const templates = fundingTemplates.getAllFundingTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(10);
    });

    it('should filter templates by category', () => {
      const grantTemplates = fundingTemplates.getFundingTemplatesByCategory('grant_application');
      expect(grantTemplates.every(t => t.category === 'grant_application')).toBe(true);
    });
  });

  describe('Amortization Calculator', () => {
    it('should calculate correct amortization schedule', () => {
      const schedule = fundingTemplates.calculateAmortizationSchedule(100000, 6, 12);
      expect(schedule.length).toBe(12);
      expect(schedule[0].paymentNumber).toBe(1);
      expect(schedule[11].paymentNumber).toBe(12);
      expect(schedule[11].balance).toBe(0);
    });

    it('should calculate monthly payments correctly', () => {
      const schedule = fundingTemplates.calculateAmortizationSchedule(10000, 12, 12);
      // Each payment should be roughly the same
      const payments = schedule.map(s => s.payment);
      expect(Math.max(...payments) - Math.min(...payments)).toBeLessThan(1);
    });

    it('should handle zero interest rate', () => {
      const schedule = fundingTemplates.calculateAmortizationSchedule(12000, 0.001, 12);
      expect(schedule.length).toBe(12);
    });
  });

  describe('Funding Application Validation', () => {
    it('should validate funding application with required fields', () => {
      const template = fundingTemplates.getFoundationGrantTemplate();
      const validData: Record<string, any> = {};
      // Fill all required fields from sections
      template.sections.filter(s => s.required).forEach(section => {
        validData[section.id] = 'Test content for ' + section.id;
      });
      const result = fundingTemplates.validateFundingApplication(template, validData);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should return errors for missing required fields', () => {
      const template = fundingTemplates.getFoundationGrantTemplate();
      const invalidData = { executive_summary: 'Summary only' };
      const result = fundingTemplates.validateFundingApplication(template, invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about missing attachments', () => {
      const template = fundingTemplates.getFoundationGrantTemplate();
      const data: Record<string, any> = {};
      template.sections.filter(s => s.required).forEach(section => {
        data[section.id] = 'Test content';
      });
      data.attachments = [];
      const result = fundingTemplates.validateFundingApplication(template, data);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
