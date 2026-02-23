/**
 * Funding Templates Service
 * Phase 50.1c: Grant Applications, Grant Reports, Loan Documents, SBA Loans, Investor Documents
 */

export const FUNDING_CATEGORIES = {
  GRANT_APPLICATION: 'grant_application',
  GRANT_REPORT: 'grant_report',
  LOAN_DOCUMENT: 'loan_document',
  SBA_LOAN: 'sba_loan',
  INVESTOR_DOCUMENT: 'investor_document',
} as const;

export type FundingCategory = typeof FUNDING_CATEGORIES[keyof typeof FUNDING_CATEGORIES];

export const GRANT_APPLICATION_TEMPLATES = {
  FEDERAL_SAM: 'federal_sam_gov_application',
  FOUNDATION_GENERAL: 'foundation_general_application',
  STATE_GRANT: 'state_grant_application',
  CHURCH_508: '508_c_1_a_application',
  COMMUNITY_DEVELOPMENT: 'community_development_grant',
} as const;

export const GRANT_REPORT_TEMPLATES = {
  PROGRESS_REPORT: 'grant_progress_report',
  FINAL_REPORT: 'grant_final_report',
  FINANCIAL_REPORT: 'grant_financial_report',
  IMPACT_STATEMENT: 'grant_impact_statement',
} as const;

export const LOAN_DOCUMENT_TEMPLATES = {
  PROMISSORY_NOTE: 'promissory_note',
  LOAN_AGREEMENT: 'loan_agreement',
  AMORTIZATION_SCHEDULE: 'amortization_schedule',
  SECURITY_AGREEMENT: 'security_agreement',
  PERSONAL_GUARANTEE: 'personal_guarantee',
} as const;

export const SBA_LOAN_TEMPLATES = {
  SBA_7A: 'sba_7a_application',
  SBA_504: 'sba_504_application',
  SBA_MICROLOAN: 'sba_microloan_application',
  SBA_EXPRESS: 'sba_express_application',
} as const;

export const INVESTOR_DOCUMENT_TEMPLATES = {
  SAFE: 'safe_agreement',
  CONVERTIBLE_NOTE: 'convertible_note',
  TERM_SHEET: 'term_sheet',
  SUBSCRIPTION_AGREEMENT: 'subscription_agreement',
} as const;

export interface FundingTemplate {
  id: string;
  name: string;
  description: string;
  category: FundingCategory;
  version: string;
  sections: Array<{
    id: string;
    name: string;
    required: boolean;
    maxLength?: number;
    guidance: string;
  }>;
  requiredAttachments: string[];
  complianceRequirements: string[];
}

export function getFederalSAMGrantTemplate(): FundingTemplate {
  return {
    id: GRANT_APPLICATION_TEMPLATES.FEDERAL_SAM,
    name: 'Federal Grant Application (SAM.gov)',
    description: 'Standard federal grant application format',
    category: FUNDING_CATEGORIES.GRANT_APPLICATION,
    version: '2.0',
    sections: [
      { id: 'project_summary', name: 'Project Summary', required: true, maxLength: 4000, guidance: 'Brief overview of proposed project' },
      { id: 'organizational_capability', name: 'Organizational Capability', required: true, guidance: 'Describe qualifications' },
      { id: 'statement_of_need', name: 'Statement of Need', required: true, guidance: 'Document the problem' },
      { id: 'project_narrative', name: 'Project Narrative', required: true, maxLength: 25000, guidance: 'Detailed activities' },
      { id: 'evaluation_plan', name: 'Evaluation Plan', required: true, guidance: 'How success is measured' },
      { id: 'budget_narrative', name: 'Budget Narrative', required: true, guidance: 'Justify all items' },
      { id: 'sustainability_plan', name: 'Sustainability Plan', required: true, guidance: 'Post-grant continuation' },
    ],
    requiredAttachments: ['SF-424', 'SF-424A', 'SF-424B', 'IRS Determination Letter', 'Board List', 'Org Chart', 'Key Personnel Resumes'],
    complianceRequirements: ['Active SAM.gov registration', 'UEI', 'Audit compliance', 'Civil Rights compliance'],
  };
}

export function getFoundationGrantTemplate(): FundingTemplate {
  return {
    id: GRANT_APPLICATION_TEMPLATES.FOUNDATION_GENERAL,
    name: 'Foundation Grant Application',
    description: 'Private foundation grant application',
    category: FUNDING_CATEGORIES.GRANT_APPLICATION,
    version: '1.0',
    sections: [
      { id: 'executive_summary', name: 'Executive Summary', required: true, maxLength: 3000, guidance: 'One-page overview' },
      { id: 'organization_background', name: 'Organization Background', required: true, guidance: 'History and mission' },
      { id: 'problem_statement', name: 'Problem Statement', required: true, guidance: 'Issue being addressed' },
      { id: 'project_description', name: 'Project Description', required: true, guidance: 'Detailed plan' },
      { id: 'goals_objectives', name: 'Goals and Objectives', required: true, guidance: 'SMART goals' },
      { id: 'budget', name: 'Project Budget', required: true, guidance: 'Detailed budget' },
    ],
    requiredAttachments: ['501(c)(3) Letter', 'Current Budget', 'Audited Financials', 'Board List', 'Staff Resumes'],
    complianceRequirements: ['501(c)(3) status', 'Current Form 990', 'Non-discrimination policy'],
  };
}

export function get508c1aGrantTemplate(): FundingTemplate {
  return {
    id: GRANT_APPLICATION_TEMPLATES.CHURCH_508,
    name: '508(c)(1)(a) Faith-Based Application',
    description: 'Grant application for religious organizations',
    category: FUNDING_CATEGORIES.GRANT_APPLICATION,
    version: '1.0',
    sections: [
      { id: 'organization_overview', name: 'Organization Overview', required: true, guidance: 'Religious mission and history' },
      { id: 'ministry_description', name: 'Ministry Description', required: true, guidance: 'Program details' },
      { id: 'community_impact', name: 'Community Impact', required: true, guidance: 'Benefit to community' },
      { id: 'financial_stewardship', name: 'Financial Stewardship', required: true, guidance: 'Fund management' },
      { id: 'budget_request', name: 'Budget Request', required: true, guidance: 'Itemized expenses' },
    ],
    requiredAttachments: ['Articles of Incorporation', 'Statement of Faith', 'Leadership List', 'Financial Statement'],
    complianceRequirements: ['508(c)(1)(a) status', 'Separation of religious/secular activities'],
  };
}

export function getGrantProgressReportTemplate(): FundingTemplate {
  return {
    id: GRANT_REPORT_TEMPLATES.PROGRESS_REPORT,
    name: 'Grant Progress Report',
    description: 'Periodic progress report for active grants',
    category: FUNDING_CATEGORIES.GRANT_REPORT,
    version: '1.0',
    sections: [
      { id: 'reporting_period', name: 'Reporting Period', required: true, guidance: 'Time period covered' },
      { id: 'executive_summary', name: 'Executive Summary', required: true, maxLength: 2000, guidance: 'Key accomplishments' },
      { id: 'activities_completed', name: 'Activities Completed', required: true, guidance: 'Work accomplished' },
      { id: 'outcomes_achieved', name: 'Outcomes Achieved', required: true, guidance: 'Progress toward goals' },
      { id: 'challenges', name: 'Challenges', required: true, guidance: 'Obstacles and solutions' },
      { id: 'budget_update', name: 'Budget Status', required: true, guidance: 'Financial update' },
      { id: 'next_steps', name: 'Next Steps', required: true, guidance: 'Planned activities' },
    ],
    requiredAttachments: ['Financial Report', 'Supporting Documentation'],
    complianceRequirements: ['Submitted by deadline', 'Signed by authorized official'],
  };
}

export function getGrantFinalReportTemplate(): FundingTemplate {
  return {
    id: GRANT_REPORT_TEMPLATES.FINAL_REPORT,
    name: 'Grant Final Report',
    description: 'Comprehensive final report at grant conclusion',
    category: FUNDING_CATEGORIES.GRANT_REPORT,
    version: '1.0',
    sections: [
      { id: 'project_summary', name: 'Project Summary', required: true, guidance: 'Complete overview' },
      { id: 'goals_achievement', name: 'Goals Achievement', required: true, guidance: 'Goal attainment analysis' },
      { id: 'activities_summary', name: 'Activities Summary', required: true, guidance: 'All activities completed' },
      { id: 'outcomes_impact', name: 'Outcomes and Impact', required: true, guidance: 'Measurable results' },
      { id: 'lessons_learned', name: 'Lessons Learned', required: true, guidance: 'Key insights' },
      { id: 'sustainability', name: 'Sustainability', required: true, guidance: 'Future plans' },
      { id: 'final_budget', name: 'Final Budget', required: true, guidance: 'Complete accounting' },
    ],
    requiredAttachments: ['Final Financial Report', 'Audit Report', 'Evaluation Report', 'Photos/Media'],
    complianceRequirements: ['All funds accounted', 'All deliverables submitted'],
  };
}

export function getPromissoryNoteTemplate(): FundingTemplate {
  return {
    id: LOAN_DOCUMENT_TEMPLATES.PROMISSORY_NOTE,
    name: 'Promissory Note',
    description: 'Standard promissory note for loan repayment',
    category: FUNDING_CATEGORIES.LOAN_DOCUMENT,
    version: '1.0',
    sections: [
      { id: 'principal_amount', name: 'Principal Amount', required: true, guidance: 'Total borrowed' },
      { id: 'interest_rate', name: 'Interest Rate', required: true, guidance: 'Annual rate' },
      { id: 'payment_terms', name: 'Payment Terms', required: true, guidance: 'Repayment schedule' },
      { id: 'maturity_date', name: 'Maturity Date', required: true, guidance: 'Final due date' },
      { id: 'prepayment', name: 'Prepayment Terms', required: true, guidance: 'Early payment provisions' },
      { id: 'default', name: 'Default Provisions', required: true, guidance: 'Default consequences' },
      { id: 'collateral', name: 'Collateral', required: false, guidance: 'Security if applicable' },
    ],
    requiredAttachments: ['Amortization Schedule', 'Security Agreement'],
    complianceRequirements: ['Truth in Lending compliance', 'State usury law compliance'],
  };
}

export function getLoanAgreementTemplate(): FundingTemplate {
  return {
    id: LOAN_DOCUMENT_TEMPLATES.LOAN_AGREEMENT,
    name: 'Business Loan Agreement',
    description: 'Comprehensive business loan agreement',
    category: FUNDING_CATEGORIES.LOAN_DOCUMENT,
    version: '1.0',
    sections: [
      { id: 'loan_terms', name: 'Loan Terms', required: true, guidance: 'Basic parameters' },
      { id: 'use_of_proceeds', name: 'Use of Proceeds', required: true, guidance: 'How funds used' },
      { id: 'representations', name: 'Representations', required: true, guidance: 'Borrower certifications' },
      { id: 'covenants', name: 'Covenants', required: true, guidance: 'Ongoing obligations' },
      { id: 'events_of_default', name: 'Events of Default', required: true, guidance: 'Default triggers' },
      { id: 'remedies', name: 'Remedies', required: true, guidance: 'Lender rights' },
    ],
    requiredAttachments: ['Promissory Note', 'Security Agreement', 'UCC Filing', 'Personal Guarantee'],
    complianceRequirements: ['UCC compliance', 'State lending regulations'],
  };
}

export function getSBA7aTemplate(): FundingTemplate {
  return {
    id: SBA_LOAN_TEMPLATES.SBA_7A,
    name: 'SBA 7(a) Loan Application',
    description: 'SBA 7(a) general small business loan',
    category: FUNDING_CATEGORIES.SBA_LOAN,
    version: '1.0',
    sections: [
      { id: 'business_information', name: 'Business Information', required: true, guidance: 'Company details' },
      { id: 'loan_request', name: 'Loan Request', required: true, guidance: 'Amount and purpose' },
      { id: 'owner_information', name: 'Owner Information', required: true, guidance: 'Owners 20%+' },
      { id: 'financial_information', name: 'Financial Information', required: true, guidance: 'Financial data' },
      { id: 'collateral', name: 'Collateral', required: true, guidance: 'Assets offered' },
      { id: 'management_experience', name: 'Management Experience', required: true, guidance: 'Key personnel' },
    ],
    requiredAttachments: ['SBA Form 1919', 'SBA Form 912', 'SBA Form 413', 'Business Financials', 'Tax Returns', 'Business Plan'],
    complianceRequirements: ['Meet SBA size standards', 'For-profit', 'US operation', 'Owner equity'],
  };
}

export function getSBA504Template(): FundingTemplate {
  return {
    id: SBA_LOAN_TEMPLATES.SBA_504,
    name: 'SBA 504 Loan Application',
    description: 'SBA 504 real estate and equipment loan',
    category: FUNDING_CATEGORIES.SBA_LOAN,
    version: '1.0',
    sections: [
      { id: 'project_description', name: 'Project Description', required: true, guidance: 'Property/equipment details' },
      { id: 'project_costs', name: 'Project Costs', required: true, guidance: 'Itemized budget' },
      { id: 'job_creation', name: 'Job Creation', required: true, guidance: 'Employment impact' },
      { id: 'business_information', name: 'Business Information', required: true, guidance: 'Company details' },
      { id: 'financial_analysis', name: 'Financial Analysis', required: true, guidance: 'Cash flow projections' },
    ],
    requiredAttachments: ['SBA Form 1244', 'Personal Financial Statement', 'Tax Returns', 'Appraisal', 'Environmental Report'],
    complianceRequirements: ['Net worth under $15M', 'Net income under $5M', 'Job creation requirement'],
  };
}

export function getSAFETemplate(): FundingTemplate {
  return {
    id: INVESTOR_DOCUMENT_TEMPLATES.SAFE,
    name: 'SAFE Agreement',
    description: 'Simple Agreement for Future Equity',
    category: FUNDING_CATEGORIES.INVESTOR_DOCUMENT,
    version: '1.0',
    sections: [
      { id: 'investment_amount', name: 'Investment Amount', required: true, guidance: 'Amount invested' },
      { id: 'valuation_cap', name: 'Valuation Cap', required: false, guidance: 'Max valuation for conversion' },
      { id: 'discount_rate', name: 'Discount Rate', required: false, guidance: 'Discount on future price' },
      { id: 'conversion_events', name: 'Conversion Events', required: true, guidance: 'Triggers for conversion' },
      { id: 'pro_rata_rights', name: 'Pro Rata Rights', required: false, guidance: 'Future participation' },
    ],
    requiredAttachments: ['Certificate of Incorporation', 'Cap Table'],
    complianceRequirements: ['Securities law compliance', 'Accredited investor verification'],
  };
}

export function getConvertibleNoteTemplate(): FundingTemplate {
  return {
    id: INVESTOR_DOCUMENT_TEMPLATES.CONVERTIBLE_NOTE,
    name: 'Convertible Promissory Note',
    description: 'Debt that converts to equity',
    category: FUNDING_CATEGORIES.INVESTOR_DOCUMENT,
    version: '1.0',
    sections: [
      { id: 'principal', name: 'Principal Amount', required: true, guidance: 'Investment amount' },
      { id: 'interest', name: 'Interest Rate', required: true, guidance: 'Annual rate' },
      { id: 'maturity', name: 'Maturity Date', required: true, guidance: 'When note comes due' },
      { id: 'conversion_terms', name: 'Conversion Terms', required: true, guidance: 'How debt converts' },
      { id: 'automatic_conversion', name: 'Automatic Conversion', required: true, guidance: 'Mandatory triggers' },
      { id: 'optional_conversion', name: 'Optional Conversion', required: true, guidance: 'Voluntary rights' },
    ],
    requiredAttachments: ['Note Purchase Agreement', 'Certificate of Incorporation', 'Cap Table', 'Board Consent'],
    complianceRequirements: ['Securities law compliance', 'Accredited investor verification', 'Board authorization'],
  };
}

export function getTermSheetTemplate(): FundingTemplate {
  return {
    id: INVESTOR_DOCUMENT_TEMPLATES.TERM_SHEET,
    name: 'Investment Term Sheet',
    description: 'Non-binding summary of investment terms',
    category: FUNDING_CATEGORIES.INVESTOR_DOCUMENT,
    version: '1.0',
    sections: [
      { id: 'offering_terms', name: 'Offering Terms', required: true, guidance: 'Basic parameters' },
      { id: 'investor_rights', name: 'Investor Rights', required: true, guidance: 'Rights granted' },
      { id: 'protective_provisions', name: 'Protective Provisions', required: true, guidance: 'Veto rights' },
      { id: 'liquidation_preference', name: 'Liquidation Preference', required: true, guidance: 'Payment priority' },
      { id: 'anti_dilution', name: 'Anti-Dilution', required: true, guidance: 'Down round protection' },
      { id: 'founder_terms', name: 'Founder Terms', required: true, guidance: 'Vesting and restrictions' },
    ],
    requiredAttachments: [],
    complianceRequirements: ['Non-binding nature stated', 'Confidentiality provisions'],
  };
}

export function getAllFundingTemplates(): FundingTemplate[] {
  return [
    getFederalSAMGrantTemplate(),
    getFoundationGrantTemplate(),
    get508c1aGrantTemplate(),
    getGrantProgressReportTemplate(),
    getGrantFinalReportTemplate(),
    getPromissoryNoteTemplate(),
    getLoanAgreementTemplate(),
    getSBA7aTemplate(),
    getSBA504Template(),
    getSAFETemplate(),
    getConvertibleNoteTemplate(),
    getTermSheetTemplate(),
  ];
}

export function getFundingTemplatesByCategory(category: FundingCategory): FundingTemplate[] {
  return getAllFundingTemplates().filter(t => t.category === category);
}

export function calculateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date = new Date()
): Array<{ paymentNumber: number; paymentDate: string; payment: number; principal: number; interest: number; balance: number }> {
  const monthlyRate = annualRate / 12 / 100;
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  const schedule = [];
  let balance = principal;
  
  for (let i = 1; i <= termMonths; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    
    schedule.push({
      paymentNumber: i,
      paymentDate: paymentDate.toISOString().split('T')[0],
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100),
    });
  }
  
  return schedule;
}

export function validateFundingApplication(
  template: FundingTemplate,
  data: Record<string, any>
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const section of template.sections) {
    if (section.required && (!data[section.id] || data[section.id].trim() === '')) {
      errors.push(`${section.name} is required`);
    }
    if (section.maxLength && data[section.id] && data[section.id].length > section.maxLength) {
      errors.push(`${section.name} exceeds maximum length of ${section.maxLength} characters`);
    }
  }
  
  const attachments = data.attachments || [];
  for (const required of template.requiredAttachments) {
    if (!attachments.includes(required)) {
      warnings.push(`Missing recommended attachment: ${required}`);
    }
  }
  
  return { valid: errors.length === 0, errors, warnings };
}
