/**
 * K-1 Schedule Generator Service
 * Phase 58.4: Generate K-1 tax forms for LLC/partnership members
 */

export interface K1PartnerInfo {
  partnerId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ssn?: string;
  ein?: string;
  ownershipPercentage: number;
  profitPercentage: number;
  lossPercentage: number;
  capitalPercentage: number;
}

export interface K1EntityInfo {
  entityName: string;
  ein: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  entityType: 'partnership' | 'scorp' | 'llc';
  taxYear: number;
  isFinalReturn: boolean;
  isAmendedReturn: boolean;
}

export interface K1IncomeItems {
  ordinaryBusinessIncome: number;
  netRentalRealEstateIncome: number;
  otherNetRentalIncome: number;
  guaranteedPayments: number;
  interestIncome: number;
  ordinaryDividends: number;
  qualifiedDividends: number;
  royalties: number;
  netShortTermCapitalGain: number;
  netLongTermCapitalGain: number;
  collectiblesGain: number;
  unrecapturedSection1250Gain: number;
  netSection1231Gain: number;
  otherIncome: number;
}

export interface K1DeductionItems {
  section179Deduction: number;
  otherDeductions: number;
  selfEmploymentEarnings: number;
  creditsAndOther: number;
}

export interface K1CapitalAccount {
  beginningCapitalAccount: number;
  capitalContributed: number;
  currentYearIncrease: number;
  withdrawalsDistributions: number;
  endingCapitalAccount: number;
  method: 'tax' | 'gaap' | 'section704b' | 'other';
}

export interface K1Schedule {
  scheduleId: string;
  entityInfo: K1EntityInfo;
  partnerInfo: K1PartnerInfo;
  incomeItems: K1IncomeItems;
  deductionItems: K1DeductionItems;
  capitalAccount: K1CapitalAccount;
  generatedDate: Date;
  status: 'draft' | 'final' | 'filed';
}

export function generateK1Schedule(
  entityInfo: K1EntityInfo,
  partnerInfo: K1PartnerInfo,
  incomeItems: Partial<K1IncomeItems>,
  deductionItems: Partial<K1DeductionItems>,
  capitalAccount: K1CapitalAccount
): K1Schedule {
  const fullIncomeItems: K1IncomeItems = {
    ordinaryBusinessIncome: incomeItems.ordinaryBusinessIncome || 0,
    netRentalRealEstateIncome: incomeItems.netRentalRealEstateIncome || 0,
    otherNetRentalIncome: incomeItems.otherNetRentalIncome || 0,
    guaranteedPayments: incomeItems.guaranteedPayments || 0,
    interestIncome: incomeItems.interestIncome || 0,
    ordinaryDividends: incomeItems.ordinaryDividends || 0,
    qualifiedDividends: incomeItems.qualifiedDividends || 0,
    royalties: incomeItems.royalties || 0,
    netShortTermCapitalGain: incomeItems.netShortTermCapitalGain || 0,
    netLongTermCapitalGain: incomeItems.netLongTermCapitalGain || 0,
    collectiblesGain: incomeItems.collectiblesGain || 0,
    unrecapturedSection1250Gain: incomeItems.unrecapturedSection1250Gain || 0,
    netSection1231Gain: incomeItems.netSection1231Gain || 0,
    otherIncome: incomeItems.otherIncome || 0
  };

  const fullDeductionItems: K1DeductionItems = {
    section179Deduction: deductionItems.section179Deduction || 0,
    otherDeductions: deductionItems.otherDeductions || 0,
    selfEmploymentEarnings: deductionItems.selfEmploymentEarnings || 0,
    creditsAndOther: deductionItems.creditsAndOther || 0
  };

  return {
    scheduleId: `K1-${entityInfo.taxYear}-${partnerInfo.partnerId}-${Date.now()}`,
    entityInfo,
    partnerInfo,
    incomeItems: fullIncomeItems,
    deductionItems: fullDeductionItems,
    capitalAccount,
    generatedDate: new Date(),
    status: 'draft'
  };
}

export function calculatePartnerShare(
  totalAmount: number,
  partnerPercentage: number
): number {
  return Math.round(totalAmount * (partnerPercentage / 100) * 100) / 100;
}

export function generateK1Document(schedule: K1Schedule): string {
  const { entityInfo, partnerInfo, incomeItems, capitalAccount } = schedule;
  
  return `
SCHEDULE K-1 (Form 1065)
Partner's Share of Income, Deductions, Credits, etc.
Tax Year ${entityInfo.taxYear}

PART I - INFORMATION ABOUT THE PARTNERSHIP
A. Partnership's employer identification number: ${entityInfo.ein}
B. Partnership's name: ${entityInfo.entityName}
   Address: ${entityInfo.address}, ${entityInfo.city}, ${entityInfo.state} ${entityInfo.zip}

PART II - INFORMATION ABOUT THE PARTNER
E. Partner's identifying number: ${partnerInfo.ssn || partnerInfo.ein || '***-**-****'}
F. Partner's name: ${partnerInfo.name}
   Address: ${partnerInfo.address}, ${partnerInfo.city}, ${partnerInfo.state} ${partnerInfo.zip}

J. Partner's share of profit, loss, and capital:
   Profit: ${partnerInfo.profitPercentage}%
   Loss: ${partnerInfo.lossPercentage}%
   Capital: ${partnerInfo.capitalPercentage}%

L. Partner's capital account analysis:
   Beginning capital account: $${capitalAccount.beginningCapitalAccount.toLocaleString()}
   Capital contributed: $${capitalAccount.capitalContributed.toLocaleString()}
   Current year increase: $${capitalAccount.currentYearIncrease.toLocaleString()}
   Withdrawals: $${capitalAccount.withdrawalsDistributions.toLocaleString()}
   Ending capital account: $${capitalAccount.endingCapitalAccount.toLocaleString()}
   Method: ${capitalAccount.method}

PART III - PARTNER'S SHARE OF CURRENT YEAR INCOME
1. Ordinary business income (loss): $${incomeItems.ordinaryBusinessIncome.toLocaleString()}
4. Guaranteed payments: $${incomeItems.guaranteedPayments.toLocaleString()}
5. Interest income: $${incomeItems.interestIncome.toLocaleString()}
6a. Ordinary dividends: $${incomeItems.ordinaryDividends.toLocaleString()}

Schedule K-1 ID: ${schedule.scheduleId}
Generated: ${schedule.generatedDate.toISOString()}
Status: ${schedule.status.toUpperCase()}
`;
}

export function validateK1Schedule(schedule: K1Schedule): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!schedule.entityInfo.ein || schedule.entityInfo.ein.length < 9) {
    errors.push('Invalid or missing entity EIN');
  }
  if (!schedule.entityInfo.entityName) {
    errors.push('Missing entity name');
  }
  if (!schedule.partnerInfo.name) {
    errors.push('Missing partner name');
  }
  if (schedule.partnerInfo.ownershipPercentage < 0 || schedule.partnerInfo.ownershipPercentage > 100) {
    errors.push('Invalid ownership percentage');
  }

  const calculatedEnding = 
    schedule.capitalAccount.beginningCapitalAccount +
    schedule.capitalAccount.capitalContributed +
    schedule.capitalAccount.currentYearIncrease -
    schedule.capitalAccount.withdrawalsDistributions;
  
  if (Math.abs(calculatedEnding - schedule.capitalAccount.endingCapitalAccount) > 0.01) {
    errors.push('Capital account ending balance does not reconcile');
  }

  return { valid: errors.length === 0, errors };
}

export function generateBatchK1s(
  entityInfo: K1EntityInfo,
  partners: Array<{
    partnerInfo: K1PartnerInfo;
    incomeItems: Partial<K1IncomeItems>;
    deductionItems: Partial<K1DeductionItems>;
    capitalAccount: K1CapitalAccount;
  }>
): K1Schedule[] {
  return partners.map(partner => 
    generateK1Schedule(entityInfo, partner.partnerInfo, partner.incomeItems, partner.deductionItems, partner.capitalAccount)
  );
}

export function calculateSelfEmploymentTax(
  ordinaryBusinessIncome: number,
  guaranteedPayments: number,
  ownershipPercentage: number
): { netEarnings: number; seTax: number } {
  const netEarnings = (ordinaryBusinessIncome * (ownershipPercentage / 100)) + guaranteedPayments;
  const taxableEarnings = netEarnings * 0.9235;
  const socialSecurityMax = 168600;
  const socialSecurityTax = Math.min(taxableEarnings, socialSecurityMax) * 0.124;
  const medicareTax = taxableEarnings * 0.029;
  
  return {
    netEarnings,
    seTax: Math.round((socialSecurityTax + medicareTax) * 100) / 100
  };
}

export const k1ScheduleGenerator = {
  generateK1Schedule,
  calculatePartnerShare,
  generateK1Document,
  validateK1Schedule,
  generateBatchK1s,
  calculateSelfEmploymentTax
};
