import { describe, it, expect } from 'vitest';
import {
  generateFundAllocationPolicy,
  generateDisbursementRequestForm,
  generateHeirDesignationForm,
  generateDistributionAgreement,
  generateSpendthriftProvisions,
  generateVestingScheduleDocument
} from './fund-policy-templates';

describe('Fund Policy Templates Service', () => {
  describe('generateFundAllocationPolicy', () => {
    it('should generate fund allocation policy with house name', () => {
      const policy = generateFundAllocationPolicy('Freeman House', 'John Freeman');
      expect(policy).toContain('Freeman House');
      expect(policy).toContain('John Freeman');
      expect(policy).toContain('FUND ALLOCATION POLICY');
    });

    it('should include all six fund categories', () => {
      const policy = generateFundAllocationPolicy('Test House', 'Test Founder');
      expect(policy).toContain('Land & Property Acquisition Fund (30%)');
      expect(policy).toContain('Education & Scholarship Fund (25%)');
      expect(policy).toContain('Emergency Assistance Fund (15%)');
      expect(policy).toContain('Business Development Fund (15%)');
      expect(policy).toContain('Cultural Preservation Fund (10%)');
      expect(policy).toContain('Discretionary/Voting Fund (5%)');
    });

    it('should include disbursement procedures', () => {
      const policy = generateFundAllocationPolicy('Test House', 'Test Founder');
      expect(policy).toContain('DISBURSEMENT PROCEDURES');
      expect(policy).toContain('Request Process');
    });
  });

  describe('generateDisbursementRequestForm', () => {
    it('should generate form with fund name', () => {
      const form = generateDisbursementRequestForm('Education Fund');
      expect(form).toContain('Education Fund');
      expect(form).toContain('DISBURSEMENT REQUEST FORM');
    });

    it('should include all required sections', () => {
      const form = generateDisbursementRequestForm('Emergency Fund');
      expect(form).toContain('REQUESTOR INFORMATION');
      expect(form).toContain('REQUEST DETAILS');
      expect(form).toContain('SUPPORTING DOCUMENTATION');
      expect(form).toContain('CERTIFICATION');
      expect(form).toContain('APPROVAL');
    });

    it('should include request ID', () => {
      const form = generateDisbursementRequestForm('Test Fund');
      expect(form).toContain('Request ID: DRF-');
    });
  });

  describe('generateHeirDesignationForm', () => {
    it('should generate form with house and founder names', () => {
      const form = generateHeirDesignationForm('Freeman House', 'John Freeman');
      expect(form).toContain('Freeman House');
      expect(form).toContain('John Freeman');
      expect(form).toContain('HEIR DESIGNATION FORM');
    });

    it('should include heir designation sections', () => {
      const form = generateHeirDesignationForm('Test House', 'Test Founder');
      expect(form).toContain('DESIGNATED HEIRS');
      expect(form).toContain('Heir 1:');
      expect(form).toContain('Vesting Schedule');
    });

    it('should include witness and notary sections', () => {
      const form = generateHeirDesignationForm('Test House', 'Test Founder');
      expect(form).toContain('WITNESSES');
      expect(form).toContain('NOTARIZATION');
    });
  });

  describe('generateDistributionAgreement', () => {
    it('should generate agreement with house and heir names', () => {
      const agreement = generateDistributionAgreement('Freeman House', 'Jane Freeman');
      expect(agreement).toContain('Freeman House');
      expect(agreement).toContain('Jane Freeman');
      expect(agreement).toContain('DISTRIBUTION AGREEMENT');
    });

    it('should include distribution type options', () => {
      const agreement = generateDistributionAgreement('Test House', 'Test Heir');
      expect(agreement).toContain('Immediate Distribution');
      expect(agreement).toContain('Accumulation');
      expect(agreement).toContain('Milestone-Based');
    });

    it('should include spendthrift provisions option', () => {
      const agreement = generateDistributionAgreement('Test House', 'Test Heir');
      expect(agreement).toContain('Spendthrift provisions');
    });
  });

  describe('generateSpendthriftProvisions', () => {
    it('should generate provisions with house name', () => {
      const provisions = generateSpendthriftProvisions('Freeman House');
      expect(provisions).toContain('Freeman House');
      expect(provisions).toContain('SPENDTHRIFT TRUST PROVISIONS');
    });

    it('should include alienation restrictions', () => {
      const provisions = generateSpendthriftProvisions('Test House');
      expect(provisions).toContain('Voluntary Alienation Prohibited');
      expect(provisions).toContain('Involuntary Alienation Prohibited');
    });

    it('should include exceptions to protection', () => {
      const provisions = generateSpendthriftProvisions('Test House');
      expect(provisions).toContain('Child Support');
      expect(provisions).toContain('Spousal Support');
      expect(provisions).toContain('Federal Tax Claims');
    });

    it('should include trustee discretion section', () => {
      const provisions = generateSpendthriftProvisions('Test House');
      expect(provisions).toContain('TRUSTEE DISCRETION');
      expect(provisions).toContain('Absolute Discretion');
    });
  });

  describe('generateVestingScheduleDocument', () => {
    it('should generate document with house and heir names', () => {
      const doc = generateVestingScheduleDocument('Freeman House', 'Jane Freeman');
      expect(doc).toContain('Freeman House');
      expect(doc).toContain('Jane Freeman');
      expect(doc).toContain('VESTING SCHEDULE DOCUMENTATION');
    });

    it('should include age-based milestones', () => {
      const doc = generateVestingScheduleDocument('Test House', 'Test Heir');
      expect(doc).toContain('Age 18');
      expect(doc).toContain('Age 21');
      expect(doc).toContain('Age 25');
      expect(doc).toContain('Age 30');
    });

    it('should include acceleration events', () => {
      const doc = generateVestingScheduleDocument('Test House', 'Test Heir');
      expect(doc).toContain('ACCELERATION EVENTS');
      expect(doc).toContain('Marriage');
      expect(doc).toContain('Birth of child');
    });

    it('should include forfeiture conditions', () => {
      const doc = generateVestingScheduleDocument('Test House', 'Test Heir');
      expect(doc).toContain('FORFEITURE CONDITIONS');
      expect(doc).toContain('Criminal conviction');
    });
  });
});
