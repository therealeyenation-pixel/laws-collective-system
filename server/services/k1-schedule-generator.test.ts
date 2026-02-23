import { describe, it, expect } from 'vitest';
import {
  generateK1Schedule,
  calculatePartnerShare,
  generateK1Document,
  validateK1Schedule,
  generateBatchK1s,
  calculateSelfEmploymentTax,
  K1EntityInfo,
  K1PartnerInfo,
  K1CapitalAccount
} from './k1-schedule-generator';

describe('K-1 Schedule Generator Service', () => {
  const mockEntityInfo: K1EntityInfo = {
    entityName: 'Freeman Holdings LLC',
    ein: '123456789',
    address: '123 Main St',
    city: 'Atlanta',
    state: 'GA',
    zip: '30301',
    entityType: 'llc',
    taxYear: 2024,
    isFinalReturn: false,
    isAmendedReturn: false
  };

  const mockPartnerInfo: K1PartnerInfo = {
    partnerId: 'partner-001',
    name: 'John Freeman',
    address: '456 Oak Ave',
    city: 'Atlanta',
    state: 'GA',
    zip: '30302',
    ssn: '123-45-6789',
    ownershipPercentage: 50,
    profitPercentage: 50,
    lossPercentage: 50,
    capitalPercentage: 50
  };

  const mockCapitalAccount: K1CapitalAccount = {
    beginningCapitalAccount: 100000,
    capitalContributed: 25000,
    currentYearIncrease: 15000,
    withdrawalsDistributions: 10000,
    endingCapitalAccount: 130000,
    method: 'tax'
  };

  describe('generateK1Schedule', () => {
    it('should generate K-1 schedule with all fields', () => {
      const schedule = generateK1Schedule(
        mockEntityInfo,
        mockPartnerInfo,
        { ordinaryBusinessIncome: 50000 },
        { section179Deduction: 5000 },
        mockCapitalAccount
      );

      expect(schedule.scheduleId).toContain('K1-2024-partner-001');
      expect(schedule.entityInfo.entityName).toBe('Freeman Holdings LLC');
      expect(schedule.partnerInfo.name).toBe('John Freeman');
      expect(schedule.incomeItems.ordinaryBusinessIncome).toBe(50000);
      expect(schedule.status).toBe('draft');
    });

    it('should default missing income items to 0', () => {
      const schedule = generateK1Schedule(
        mockEntityInfo,
        mockPartnerInfo,
        {},
        {},
        mockCapitalAccount
      );

      expect(schedule.incomeItems.ordinaryBusinessIncome).toBe(0);
      expect(schedule.incomeItems.guaranteedPayments).toBe(0);
      expect(schedule.incomeItems.interestIncome).toBe(0);
    });
  });

  describe('calculatePartnerShare', () => {
    it('should calculate partner share correctly', () => {
      expect(calculatePartnerShare(100000, 50)).toBe(50000);
      expect(calculatePartnerShare(100000, 25)).toBe(25000);
      expect(calculatePartnerShare(75000, 33.33)).toBe(24997.5);
    });

    it('should handle 100% ownership', () => {
      expect(calculatePartnerShare(100000, 100)).toBe(100000);
    });

    it('should handle 0% ownership', () => {
      expect(calculatePartnerShare(100000, 0)).toBe(0);
    });
  });

  describe('generateK1Document', () => {
    it('should generate formatted K-1 document', () => {
      const schedule = generateK1Schedule(
        mockEntityInfo,
        mockPartnerInfo,
        { ordinaryBusinessIncome: 50000, guaranteedPayments: 10000 },
        {},
        mockCapitalAccount
      );

      const document = generateK1Document(schedule);
      expect(document).toContain('SCHEDULE K-1');
      expect(document).toContain('Freeman Holdings LLC');
      expect(document).toContain('John Freeman');
      expect(document).toContain('Tax Year 2024');
    });

    it('should include capital account analysis', () => {
      const schedule = generateK1Schedule(
        mockEntityInfo,
        mockPartnerInfo,
        {},
        {},
        mockCapitalAccount
      );

      const document = generateK1Document(schedule);
      expect(document).toContain('Beginning capital account');
      expect(document).toContain('Ending capital account');
    });
  });

  describe('validateK1Schedule', () => {
    it('should validate correct schedule', () => {
      const schedule = generateK1Schedule(
        mockEntityInfo,
        mockPartnerInfo,
        {},
        {},
        mockCapitalAccount
      );

      const result = validateK1Schedule(schedule);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch missing entity name', () => {
      const badEntityInfo = { ...mockEntityInfo, entityName: '' };
      const schedule = generateK1Schedule(
        badEntityInfo,
        mockPartnerInfo,
        {},
        {},
        mockCapitalAccount
      );

      const result = validateK1Schedule(schedule);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing entity name');
    });

    it('should catch capital account reconciliation error', () => {
      const badCapitalAccount = { ...mockCapitalAccount, endingCapitalAccount: 999999 };
      const schedule = generateK1Schedule(
        mockEntityInfo,
        mockPartnerInfo,
        {},
        {},
        badCapitalAccount
      );

      const result = validateK1Schedule(schedule);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Capital account ending balance does not reconcile');
    });
  });

  describe('generateBatchK1s', () => {
    it('should generate multiple K-1s for all partners', () => {
      const partners = [
        {
          partnerInfo: mockPartnerInfo,
          incomeItems: { ordinaryBusinessIncome: 50000 },
          deductionItems: {},
          capitalAccount: mockCapitalAccount
        },
        {
          partnerInfo: { ...mockPartnerInfo, partnerId: 'partner-002', name: 'Jane Freeman' },
          incomeItems: { ordinaryBusinessIncome: 50000 },
          deductionItems: {},
          capitalAccount: mockCapitalAccount
        }
      ];

      const schedules = generateBatchK1s(mockEntityInfo, partners);
      expect(schedules).toHaveLength(2);
      expect(schedules[0].partnerInfo.name).toBe('John Freeman');
      expect(schedules[1].partnerInfo.name).toBe('Jane Freeman');
    });
  });

  describe('calculateSelfEmploymentTax', () => {
    it('should calculate SE tax correctly', () => {
      const result = calculateSelfEmploymentTax(100000, 0, 100);
      expect(result.netEarnings).toBe(100000);
      expect(result.seTax).toBeGreaterThan(0);
    });

    it('should include guaranteed payments in SE earnings', () => {
      const withGP = calculateSelfEmploymentTax(50000, 25000, 100);
      const withoutGP = calculateSelfEmploymentTax(50000, 0, 100);
      expect(withGP.netEarnings).toBeGreaterThan(withoutGP.netEarnings);
    });

    it('should apply ownership percentage to business income', () => {
      const full = calculateSelfEmploymentTax(100000, 0, 100);
      const half = calculateSelfEmploymentTax(100000, 0, 50);
      expect(half.netEarnings).toBe(full.netEarnings / 2);
    });
  });
});
