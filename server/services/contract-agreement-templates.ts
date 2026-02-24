/**
 * Contract Agreement Templates Service
 * Phase 50.1b: Business, Service, Property, Employment, and Trust/Estate Contracts
 */

// Template category constants
export const CONTRACT_CATEGORIES = {
  BUSINESS: 'business_contracts',
  SERVICE: 'service_contracts',
  PROPERTY: 'property_contracts',
  EMPLOYMENT: 'employment_contracts',
  TRUST_ESTATE: 'trust_estate_contracts',
} as const;

// Business contract template IDs
export const BUSINESS_CONTRACT_TEMPLATES = {
  OPERATING_AGREEMENT: 'operating_agreement',
  PARTNERSHIP_AGREEMENT: 'partnership_agreement',
  BUY_SELL_AGREEMENT: 'buy_sell_agreement',
  NON_DISCLOSURE_AGREEMENT: 'non_disclosure_agreement',
  NON_COMPETE_AGREEMENT: 'non_compete_agreement',
  JOINT_VENTURE_AGREEMENT: 'joint_venture_agreement',
  SHAREHOLDER_AGREEMENT: 'shareholder_agreement',
  FRANCHISE_AGREEMENT: 'franchise_agreement',
} as const;

// Service contract template IDs
export const SERVICE_CONTRACT_TEMPLATES = {
  INDEPENDENT_CONTRACTOR: 'independent_contractor_agreement',
  SERVICE_LEVEL_AGREEMENT: 'service_level_agreement',
  CONSULTING_AGREEMENT: 'consulting_agreement',
  MASTER_SERVICE_AGREEMENT: 'master_service_agreement',
  STATEMENT_OF_WORK: 'statement_of_work',
  RETAINER_AGREEMENT: 'retainer_agreement',
} as const;

// Property contract template IDs
export const PROPERTY_CONTRACT_TEMPLATES = {
  PURCHASE_AGREEMENT: 'real_estate_purchase_agreement',
  COMMERCIAL_LEASE: 'commercial_lease_agreement',
  RESIDENTIAL_LEASE: 'residential_lease_agreement',
  LAND_CONTRACT: 'land_contract',
  SUBLEASE_AGREEMENT: 'sublease_agreement',
  OPTION_TO_PURCHASE: 'option_to_purchase',
  PROPERTY_MANAGEMENT: 'property_management_agreement',
} as const;

// Employment contract template IDs
export const EMPLOYMENT_CONTRACT_TEMPLATES = {
  EMPLOYMENT_AGREEMENT: 'employment_agreement',
  EXECUTIVE_EMPLOYMENT: 'executive_employment_agreement',
  SEVERANCE_AGREEMENT: 'severance_agreement',
  CONFIDENTIALITY_AGREEMENT: 'employee_confidentiality_agreement',
  INVENTION_ASSIGNMENT: 'invention_assignment_agreement',
  COMMISSION_AGREEMENT: 'commission_agreement',
} as const;

// Trust/Estate contract template IDs
export const TRUST_ESTATE_CONTRACT_TEMPLATES = {
  TRUST_AGREEMENT: 'trust_agreement',
  LAST_WILL_TESTAMENT: 'last_will_and_testament',
  POWER_OF_ATTORNEY_FINANCIAL: 'power_of_attorney_financial',
  POWER_OF_ATTORNEY_HEALTHCARE: 'power_of_attorney_healthcare',
  BENEFICIARY_DESIGNATION: 'beneficiary_designation_form',
  TRUST_AMENDMENT: 'trust_amendment',
  TRUST_RESTATEMENT: 'trust_restatement',
} as const;

export type ContractCategory = typeof CONTRACT_CATEGORIES[keyof typeof CONTRACT_CATEGORIES];

export interface ContractClause {
  id: string;
  name: string;
  description: string;
  defaultText: string;
  customizable: boolean;
  required: boolean;
  category: string;
}

export interface SignatureBlock {
  id: string;
  partyType: 'individual' | 'entity' | 'witness' | 'notary';
  label: string;
  fields: string[];
  requiresNotarization: boolean;
  requiresWitness: boolean;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: ContractCategory;
  version: string;
  effectiveDate: string;
  clauses: ContractClause[];
  signatureBlocks: SignatureBlock[];
  customizableFields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'currency' | 'select' | 'textarea' | 'address';
    required: boolean;
    defaultValue?: string;
    options?: string[];
    validation?: {
      pattern?: string;
      min?: number;
      max?: number;
      maxLength?: number;
    };
  }>;
  formatting: {
    pageSize: 'letter' | 'legal';
    font: string;
    fontSize: number;
    margins: { top: number; right: number; bottom: number; left: number };
    lineSpacing: number;
    headerText?: string;
    footerText?: string;
  };
  legalNotices: string[];
  amendmentHistory: Array<{
    version: string;
    date: string;
    description: string;
  }>;
}

// ============================================
// BUSINESS CONTRACT TEMPLATES
// ============================================

export function getOperatingAgreementTemplate(state: string = 'Delaware'): ContractTemplate {
  return {
    id: BUSINESS_CONTRACT_TEMPLATES.OPERATING_AGREEMENT,
    name: `${state} LLC Operating Agreement`,
    description: 'Comprehensive operating agreement for Limited Liability Companies governing member rights, management, and operations',
    category: CONTRACT_CATEGORIES.BUSINESS,
    version: '2.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    clauses: [
      {
        id: 'formation',
        name: 'Formation and Purpose',
        description: 'Establishes the LLC formation and business purpose',
        defaultText: 'The Members hereby form a Limited Liability Company pursuant to the laws of the State of {{state}}.',
        customizable: true,
        required: true,
        category: 'formation',
      },
      {
        id: 'capital_contributions',
        name: 'Capital Contributions',
        description: 'Details initial and additional capital contributions',
        defaultText: 'Each Member shall contribute the capital set forth in Schedule A attached hereto.',
        customizable: true,
        required: true,
        category: 'capital',
      },
      {
        id: 'profit_loss_allocation',
        name: 'Allocation of Profits and Losses',
        description: 'Specifies how profits and losses are distributed',
        defaultText: 'Profits and losses shall be allocated among the Members in proportion to their Percentage Interests.',
        customizable: true,
        required: true,
        category: 'distributions',
      },
      {
        id: 'management',
        name: 'Management Structure',
        description: 'Defines management authority and decision-making',
        defaultText: 'The Company shall be [member-managed/manager-managed] as specified herein.',
        customizable: true,
        required: true,
        category: 'management',
      },
      {
        id: 'voting_rights',
        name: 'Voting Rights',
        description: 'Establishes voting procedures and requirements',
        defaultText: 'Each Member shall have voting rights proportional to their Percentage Interest.',
        customizable: true,
        required: true,
        category: 'governance',
      },
      {
        id: 'transfer_restrictions',
        name: 'Transfer Restrictions',
        description: 'Limits on transferring membership interests',
        defaultText: 'No Member may transfer their Membership Interest without prior written consent of the other Members.',
        customizable: true,
        required: true,
        category: 'transfers',
      },
      {
        id: 'dissolution',
        name: 'Dissolution and Winding Up',
        description: 'Procedures for dissolving the LLC',
        defaultText: 'The Company shall dissolve upon the occurrence of any of the following events...',
        customizable: true,
        required: true,
        category: 'termination',
      },
      {
        id: 'indemnification',
        name: 'Indemnification',
        description: 'Protection for members and managers',
        defaultText: 'The Company shall indemnify and hold harmless each Member and Manager...',
        customizable: true,
        required: true,
        category: 'liability',
      },
    ],
    signatureBlocks: [
      {
        id: 'member_signatures',
        partyType: 'individual',
        label: 'Member Signature',
        fields: ['memberName', 'memberSignature', 'signatureDate', 'percentageInterest'],
        requiresNotarization: false,
        requiresWitness: false,
      },
    ],
    customizableFields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true, validation: { maxLength: 100 } },
      { name: 'state', label: 'State of Formation', type: 'select', required: true, options: ['Delaware', 'Wyoming', 'Nevada', 'California', 'Texas', 'Florida', 'New York'] },
      { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
      { name: 'businessPurpose', label: 'Business Purpose', type: 'textarea', required: true },
      { name: 'principalOffice', label: 'Principal Office Address', type: 'address', required: true },
      { name: 'managementType', label: 'Management Type', type: 'select', required: true, options: ['Member-Managed', 'Manager-Managed'] },
      { name: 'fiscalYearEnd', label: 'Fiscal Year End', type: 'select', required: true, options: ['December 31', 'March 31', 'June 30', 'September 30'] },
      { name: 'initialCapital', label: 'Total Initial Capital', type: 'currency', required: true },
    ],
    formatting: {
      pageSize: 'letter',
      font: 'Times New Roman',
      fontSize: 12,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      lineSpacing: 1.5,
      headerText: 'OPERATING AGREEMENT',
      footerText: 'Page {{page}} of {{pages}}',
    },
    legalNotices: [
      'This document should be reviewed by an attorney licensed in your state.',
      'Tax implications should be discussed with a qualified tax professional.',
      'This template is provided for informational purposes only.',
    ],
    amendmentHistory: [
      { version: '1.0', date: '2024-01-01', description: 'Initial template creation' },
      { version: '2.0', date: '2025-01-01', description: 'Updated for current state law compliance' },
    ],
  };
}

export function getNonDisclosureAgreementTemplate(): ContractTemplate {
  return {
    id: BUSINESS_CONTRACT_TEMPLATES.NON_DISCLOSURE_AGREEMENT,
    name: 'Mutual Non-Disclosure Agreement (NDA)',
    description: 'Protects confidential information shared between parties during business discussions',
    category: CONTRACT_CATEGORIES.BUSINESS,
    version: '1.5',
    effectiveDate: new Date().toISOString().split('T')[0],
    clauses: [
      {
        id: 'definition',
        name: 'Definition of Confidential Information',
        description: 'Defines what constitutes confidential information',
        defaultText: '"Confidential Information" means any non-public information disclosed by either party...',
        customizable: true,
        required: true,
        category: 'definitions',
      },
      {
        id: 'obligations',
        name: 'Obligations of Receiving Party',
        description: 'Duties of the party receiving confidential information',
        defaultText: 'The Receiving Party shall: (a) maintain the confidentiality of the Confidential Information...',
        customizable: true,
        required: true,
        category: 'obligations',
      },
      {
        id: 'exclusions',
        name: 'Exclusions from Confidential Information',
        description: 'Information not covered by the agreement',
        defaultText: 'Confidential Information does not include information that: (a) is or becomes publicly available...',
        customizable: true,
        required: true,
        category: 'exclusions',
      },
      {
        id: 'term',
        name: 'Term and Termination',
        description: 'Duration of the agreement',
        defaultText: 'This Agreement shall remain in effect for {{termYears}} years from the Effective Date.',
        customizable: true,
        required: true,
        category: 'term',
      },
      {
        id: 'return_materials',
        name: 'Return of Materials',
        description: 'Requirements for returning confidential materials',
        defaultText: 'Upon termination or request, the Receiving Party shall return or destroy all Confidential Information.',
        customizable: true,
        required: true,
        category: 'termination',
      },
      {
        id: 'remedies',
        name: 'Remedies',
        description: 'Legal remedies for breach',
        defaultText: 'The parties acknowledge that breach may cause irreparable harm and agree that injunctive relief may be sought.',
        customizable: true,
        required: true,
        category: 'remedies',
      },
    ],
    signatureBlocks: [
      {
        id: 'party_a',
        partyType: 'entity',
        label: 'Disclosing Party',
        fields: ['companyName', 'authorizedSignatory', 'title', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
      {
        id: 'party_b',
        partyType: 'entity',
        label: 'Receiving Party',
        fields: ['companyName', 'authorizedSignatory', 'title', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
    ],
    customizableFields: [
      { name: 'disclosingPartyName', label: 'Disclosing Party Name', type: 'text', required: true },
      { name: 'receivingPartyName', label: 'Receiving Party Name', type: 'text', required: true },
      { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
      { name: 'purpose', label: 'Purpose of Disclosure', type: 'textarea', required: true },
      { name: 'termYears', label: 'Term (Years)', type: 'number', required: true, defaultValue: '3', validation: { min: 1, max: 10 } },
      { name: 'governingLaw', label: 'Governing Law State', type: 'text', required: true },
    ],
    formatting: {
      pageSize: 'letter',
      font: 'Times New Roman',
      fontSize: 11,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      lineSpacing: 1.15,
    },
    legalNotices: [
      'This NDA template is for general business use.',
      'Consult an attorney for industry-specific requirements.',
    ],
    amendmentHistory: [
      { version: '1.0', date: '2024-01-01', description: 'Initial template' },
      { version: '1.5', date: '2025-01-01', description: 'Added mutual disclosure provisions' },
    ],
  };
}

export function getBuySellAgreementTemplate(): ContractTemplate {
  return {
    id: BUSINESS_CONTRACT_TEMPLATES.BUY_SELL_AGREEMENT,
    name: 'Buy-Sell Agreement',
    description: 'Governs the sale or transfer of business ownership interests upon triggering events',
    category: CONTRACT_CATEGORIES.BUSINESS,
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    clauses: [
      {
        id: 'triggering_events',
        name: 'Triggering Events',
        description: 'Events that trigger buy-sell provisions',
        defaultText: 'The following events shall trigger the buy-sell provisions: (a) Death; (b) Disability; (c) Retirement; (d) Voluntary withdrawal; (e) Involuntary withdrawal; (f) Bankruptcy.',
        customizable: true,
        required: true,
        category: 'triggers',
      },
      {
        id: 'valuation',
        name: 'Valuation Method',
        description: 'How the business interest will be valued',
        defaultText: 'The value of the Interest shall be determined by [agreed value/formula/appraisal].',
        customizable: true,
        required: true,
        category: 'valuation',
      },
      {
        id: 'purchase_obligation',
        name: 'Purchase Obligation',
        description: 'Obligations to purchase interests',
        defaultText: 'Upon a Triggering Event, the remaining Owners shall have the obligation to purchase the departing Owner\'s Interest.',
        customizable: true,
        required: true,
        category: 'purchase',
      },
      {
        id: 'payment_terms',
        name: 'Payment Terms',
        description: 'How the purchase price will be paid',
        defaultText: 'The Purchase Price shall be paid as follows: {{paymentTerms}}.',
        customizable: true,
        required: true,
        category: 'payment',
      },
      {
        id: 'funding',
        name: 'Funding Mechanism',
        description: 'How the purchase will be funded',
        defaultText: 'The purchase obligation shall be funded through [life insurance/sinking fund/installment payments].',
        customizable: true,
        required: true,
        category: 'funding',
      },
      {
        id: 'right_of_first_refusal',
        name: 'Right of First Refusal',
        description: 'Rights to purchase before outside parties',
        defaultText: 'Before any Owner may sell their Interest to a third party, they must first offer it to the other Owners.',
        customizable: true,
        required: true,
        category: 'restrictions',
      },
    ],
    signatureBlocks: [
      {
        id: 'owner_signatures',
        partyType: 'individual',
        label: 'Owner Signature',
        fields: ['ownerName', 'ownerSignature', 'signatureDate', 'ownershipPercentage'],
        requiresNotarization: true,
        requiresWitness: true,
      },
    ],
    customizableFields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
      { name: 'valuationMethod', label: 'Valuation Method', type: 'select', required: true, options: ['Agreed Value', 'Book Value', 'Fair Market Value Appraisal', 'Formula Based'] },
      { name: 'agreedValue', label: 'Agreed Value (if applicable)', type: 'currency', required: false },
      { name: 'paymentTerms', label: 'Payment Terms', type: 'select', required: true, options: ['Lump Sum at Closing', '12 Monthly Installments', '24 Monthly Installments', '36 Monthly Installments', '60 Monthly Installments'] },
      { name: 'fundingMechanism', label: 'Funding Mechanism', type: 'select', required: true, options: ['Life Insurance', 'Sinking Fund', 'Installment Payments', 'Combination'] },
      { name: 'governingLaw', label: 'Governing Law State', type: 'text', required: true },
    ],
    formatting: {
      pageSize: 'letter',
      font: 'Times New Roman',
      fontSize: 12,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      lineSpacing: 1.5,
    },
    legalNotices: [
      'Buy-sell agreements have significant tax implications.',
      'Consult with both legal and tax professionals before execution.',
      'Life insurance funding should be coordinated with a licensed insurance professional.',
    ],
    amendmentHistory: [
      { version: '1.0', date: '2025-01-01', description: 'Initial template creation' },
    ],
  };
}

// ============================================
// SERVICE CONTRACT TEMPLATES
// ============================================

export function getIndependentContractorAgreementTemplate(): ContractTemplate {
  return {
    id: SERVICE_CONTRACT_TEMPLATES.INDEPENDENT_CONTRACTOR,
    name: 'Independent Contractor Agreement',
    description: 'Defines the relationship between a company and an independent contractor providing services',
    category: CONTRACT_CATEGORIES.SERVICE,
    version: '2.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    clauses: [
      {
        id: 'services',
        name: 'Scope of Services',
        description: 'Description of services to be provided',
        defaultText: 'Contractor agrees to provide the following services: {{servicesDescription}}.',
        customizable: true,
        required: true,
        category: 'services',
      },
      {
        id: 'compensation',
        name: 'Compensation',
        description: 'Payment terms and amounts',
        defaultText: 'Company shall pay Contractor {{compensationAmount}} {{compensationFrequency}} for services rendered.',
        customizable: true,
        required: true,
        category: 'payment',
      },
      {
        id: 'independent_status',
        name: 'Independent Contractor Status',
        description: 'Establishes contractor is not an employee',
        defaultText: 'Contractor is an independent contractor and not an employee of Company. Contractor shall be responsible for all taxes.',
        customizable: false,
        required: true,
        category: 'status',
      },
      {
        id: 'term',
        name: 'Term and Termination',
        description: 'Duration and termination provisions',
        defaultText: 'This Agreement shall commence on {{startDate}} and continue until {{endDate}} unless terminated earlier.',
        customizable: true,
        required: true,
        category: 'term',
      },
      {
        id: 'confidentiality',
        name: 'Confidentiality',
        description: 'Protection of confidential information',
        defaultText: 'Contractor agrees to maintain the confidentiality of all proprietary information.',
        customizable: true,
        required: true,
        category: 'confidentiality',
      },
      {
        id: 'work_product',
        name: 'Ownership of Work Product',
        description: 'Who owns the work created',
        defaultText: 'All work product created by Contractor shall be the sole property of Company.',
        customizable: true,
        required: true,
        category: 'ip',
      },
      {
        id: 'insurance',
        name: 'Insurance Requirements',
        description: 'Required insurance coverage',
        defaultText: 'Contractor shall maintain appropriate liability insurance coverage.',
        customizable: true,
        required: false,
        category: 'insurance',
      },
    ],
    signatureBlocks: [
      {
        id: 'company',
        partyType: 'entity',
        label: 'Company',
        fields: ['companyName', 'authorizedSignatory', 'title', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
      {
        id: 'contractor',
        partyType: 'individual',
        label: 'Contractor',
        fields: ['contractorName', 'contractorSignature', 'signatureDate', 'taxId'],
        requiresNotarization: false,
        requiresWitness: false,
      },
    ],
    customizableFields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'contractorName', label: 'Contractor Name', type: 'text', required: true },
      { name: 'contractorAddress', label: 'Contractor Address', type: 'address', required: true },
      { name: 'servicesDescription', label: 'Description of Services', type: 'textarea', required: true },
      { name: 'compensationAmount', label: 'Compensation Amount', type: 'currency', required: true },
      { name: 'compensationFrequency', label: 'Payment Frequency', type: 'select', required: true, options: ['per hour', 'per project', 'weekly', 'bi-weekly', 'monthly'] },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'End Date', type: 'date', required: false },
      { name: 'terminationNotice', label: 'Termination Notice Period (days)', type: 'number', required: true, defaultValue: '30' },
    ],
    formatting: {
      pageSize: 'letter',
      font: 'Arial',
      fontSize: 11,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      lineSpacing: 1.15,
    },
    legalNotices: [
      'Misclassification of employees as independent contractors may result in penalties.',
      'Consult with legal counsel to ensure proper classification.',
    ],
    amendmentHistory: [
      { version: '1.0', date: '2024-01-01', description: 'Initial template' },
      { version: '2.0', date: '2025-01-01', description: 'Updated for IRS classification guidelines' },
    ],
  };
}

export function getConsultingAgreementTemplate(): ContractTemplate {
  return {
    id: SERVICE_CONTRACT_TEMPLATES.CONSULTING_AGREEMENT,
    name: 'Consulting Services Agreement',
    description: 'Professional consulting services agreement with detailed scope and deliverables',
    category: CONTRACT_CATEGORIES.SERVICE,
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    clauses: [
      {
        id: 'engagement',
        name: 'Engagement of Consultant',
        description: 'Formal engagement of consulting services',
        defaultText: 'Client hereby engages Consultant to provide consulting services as described in Exhibit A.',
        customizable: true,
        required: true,
        category: 'engagement',
      },
      {
        id: 'deliverables',
        name: 'Deliverables',
        description: 'Specific deliverables to be provided',
        defaultText: 'Consultant shall deliver the following: {{deliverables}}.',
        customizable: true,
        required: true,
        category: 'deliverables',
      },
      {
        id: 'fees',
        name: 'Fees and Expenses',
        description: 'Consulting fees and reimbursable expenses',
        defaultText: 'Client shall pay Consultant fees as set forth in Exhibit B, plus reasonable pre-approved expenses.',
        customizable: true,
        required: true,
        category: 'payment',
      },
      {
        id: 'timeline',
        name: 'Project Timeline',
        description: 'Schedule and milestones',
        defaultText: 'Services shall be performed according to the timeline in Exhibit C.',
        customizable: true,
        required: true,
        category: 'timeline',
      },
      {
        id: 'representations',
        name: 'Representations and Warranties',
        description: 'Consultant representations',
        defaultText: 'Consultant represents that they have the expertise and qualifications to perform the services.',
        customizable: true,
        required: true,
        category: 'warranties',
      },
    ],
    signatureBlocks: [
      {
        id: 'client',
        partyType: 'entity',
        label: 'Client',
        fields: ['clientName', 'authorizedSignatory', 'title', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
      {
        id: 'consultant',
        partyType: 'entity',
        label: 'Consultant',
        fields: ['consultantName', 'authorizedSignatory', 'title', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
    ],
    customizableFields: [
      { name: 'clientName', label: 'Client Name', type: 'text', required: true },
      { name: 'consultantName', label: 'Consultant Name', type: 'text', required: true },
      { name: 'projectName', label: 'Project Name', type: 'text', required: true },
      { name: 'deliverables', label: 'Key Deliverables', type: 'textarea', required: true },
      { name: 'totalFee', label: 'Total Project Fee', type: 'currency', required: true },
      { name: 'paymentSchedule', label: 'Payment Schedule', type: 'textarea', required: true },
      { name: 'startDate', label: 'Project Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'Project End Date', type: 'date', required: true },
    ],
    formatting: {
      pageSize: 'letter',
      font: 'Arial',
      fontSize: 11,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      lineSpacing: 1.15,
    },
    legalNotices: [
      'Detailed scope of work should be attached as exhibits.',
    ],
    amendmentHistory: [
      { version: '1.0', date: '2025-01-01', description: 'Initial template creation' },
    ],
  };
}

// ============================================
// PROPERTY CONTRACT TEMPLATES
// ============================================

export function getRealEstatePurchaseAgreementTemplate(state: string = 'California'): ContractTemplate {
  return {
    id: PROPERTY_CONTRACT_TEMPLATES.PURCHASE_AGREEMENT,
    name: `${state} Real Estate Purchase Agreement`,
    description: 'Comprehensive agreement for the purchase and sale of real property',
    category: CONTRACT_CATEGORIES.PROPERTY,
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    clauses: [
      {
        id: 'property_description',
        name: 'Property Description',
        description: 'Legal description of the property',
        defaultText: 'Seller agrees to sell and Buyer agrees to purchase the real property located at {{propertyAddress}} and more particularly described as: {{legalDescription}}.',
        customizable: true,
        required: true,
        category: 'property',
      },
      {
        id: 'purchase_price',
        name: 'Purchase Price',
        description: 'Total purchase price and payment terms',
        defaultText: 'The total purchase price shall be {{purchasePrice}}, payable as follows: {{paymentTerms}}.',
        customizable: true,
        required: true,
        category: 'price',
      },
      {
        id: 'earnest_money',
        name: 'Earnest Money Deposit',
        description: 'Good faith deposit terms',
        defaultText: 'Buyer shall deposit {{earnestMoney}} as earnest money within {{depositDays}} days of acceptance.',
        customizable: true,
        required: true,
        category: 'deposit',
      },
      {
        id: 'contingencies',
        name: 'Contingencies',
        description: 'Conditions that must be met',
        defaultText: 'This Agreement is contingent upon: (a) Financing approval; (b) Satisfactory inspection; (c) Clear title.',
        customizable: true,
        required: true,
        category: 'contingencies',
      },
      {
        id: 'closing',
        name: 'Closing',
        description: 'Closing date and procedures',
        defaultText: 'Closing shall occur on or before {{closingDate}} at a location mutually agreed upon.',
        customizable: true,
        required: true,
        category: 'closing',
      },
      {
        id: 'title',
        name: 'Title and Survey',
        description: 'Title insurance and survey requirements',
        defaultText: 'Seller shall provide marketable title, free of liens and encumbrances except as disclosed.',
        customizable: true,
        required: true,
        category: 'title',
      },
      {
        id: 'disclosures',
        name: 'Seller Disclosures',
        description: 'Required property disclosures',
        defaultText: 'Seller shall provide all disclosures required by state law within {{disclosureDays}} days.',
        customizable: true,
        required: true,
        category: 'disclosures',
      },
    ],
    signatureBlocks: [
      {
        id: 'buyer',
        partyType: 'individual',
        label: 'Buyer',
        fields: ['buyerName', 'buyerSignature', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
      {
        id: 'seller',
        partyType: 'individual',
        label: 'Seller',
        fields: ['sellerName', 'sellerSignature', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
    ],
    customizableFields: [
      { name: 'propertyAddress', label: 'Property Address', type: 'address', required: true },
      { name: 'legalDescription', label: 'Legal Description', type: 'textarea', required: true },
      { name: 'purchasePrice', label: 'Purchase Price', type: 'currency', required: true },
      { name: 'earnestMoney', label: 'Earnest Money Deposit', type: 'currency', required: true },
      { name: 'depositDays', label: 'Days to Deposit', type: 'number', required: true, defaultValue: '3' },
      { name: 'closingDate', label: 'Closing Date', type: 'date', required: true },
      { name: 'disclosureDays', label: 'Days for Disclosures', type: 'number', required: true, defaultValue: '7' },
      { name: 'inspectionDays', label: 'Inspection Period (days)', type: 'number', required: true, defaultValue: '10' },
      { name: 'financingDays', label: 'Financing Contingency (days)', type: 'number', required: true, defaultValue: '21' },
    ],
    formatting: {
      pageSize: 'legal',
      font: 'Times New Roman',
      fontSize: 11,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      lineSpacing: 1.15,
    },
    legalNotices: [
      'Real estate transactions are governed by state law.',
      'Buyers should obtain independent inspections.',
      'Title insurance is strongly recommended.',
    ],
    amendmentHistory: [
      { version: '1.0', date: '2025-01-01', description: 'Initial template creation' },
    ],
  };
}

export function getCommercialLeaseAgreementTemplate(state: string = 'California'): ContractTemplate {
  return {
    id: PROPERTY_CONTRACT_TEMPLATES.COMMERCIAL_LEASE,
    name: `${state} Commercial Lease Agreement`,
    description: 'Comprehensive commercial property lease agreement',
    category: CONTRACT_CATEGORIES.PROPERTY,
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    clauses: [
      {
        id: 'premises',
        name: 'Leased Premises',
        description: 'Description of the leased space',
        defaultText: 'Landlord leases to Tenant the premises located at {{premisesAddress}}, consisting of approximately {{squareFeet}} square feet.',
        customizable: true,
        required: true,
        category: 'premises',
      },
      {
        id: 'term',
        name: 'Lease Term',
        description: 'Duration of the lease',
        defaultText: 'The lease term shall commence on {{startDate}} and expire on {{endDate}}.',
        customizable: true,
        required: true,
        category: 'term',
      },
      {
        id: 'rent',
        name: 'Base Rent',
        description: 'Monthly rent amount and payment terms',
        defaultText: 'Tenant shall pay base rent of {{monthlyRent}} per month, due on the first day of each month.',
        customizable: true,
        required: true,
        category: 'rent',
      },
      {
        id: 'cam',
        name: 'Common Area Maintenance (CAM)',
        description: 'Additional charges for common areas',
        defaultText: 'Tenant shall pay their proportionate share of CAM charges, estimated at {{camCharges}} per month.',
        customizable: true,
        required: true,
        category: 'expenses',
      },
      {
        id: 'use',
        name: 'Permitted Use',
        description: 'Allowed use of the premises',
        defaultText: 'Tenant shall use the premises solely for {{permittedUse}}.',
        customizable: true,
        required: true,
        category: 'use',
      },
      {
        id: 'maintenance',
        name: 'Maintenance and Repairs',
        description: 'Maintenance responsibilities',
        defaultText: 'Tenant shall maintain the interior in good condition. Landlord shall maintain structural elements and common areas.',
        customizable: true,
        required: true,
        category: 'maintenance',
      },
      {
        id: 'insurance',
        name: 'Insurance Requirements',
        description: 'Required insurance coverage',
        defaultText: 'Tenant shall maintain commercial general liability insurance with minimum coverage of {{insuranceAmount}}.',
        customizable: true,
        required: true,
        category: 'insurance',
      },
    ],
    signatureBlocks: [
      {
        id: 'landlord',
        partyType: 'entity',
        label: 'Landlord',
        fields: ['landlordName', 'authorizedSignatory', 'title', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
      {
        id: 'tenant',
        partyType: 'entity',
        label: 'Tenant',
        fields: ['tenantName', 'authorizedSignatory', 'title', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
    ],
    customizableFields: [
      { name: 'premisesAddress', label: 'Premises Address', type: 'address', required: true },
      { name: 'squareFeet', label: 'Square Footage', type: 'number', required: true },
      { name: 'startDate', label: 'Lease Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'Lease End Date', type: 'date', required: true },
      { name: 'monthlyRent', label: 'Monthly Base Rent', type: 'currency', required: true },
      { name: 'camCharges', label: 'Estimated Monthly CAM', type: 'currency', required: true },
      { name: 'securityDeposit', label: 'Security Deposit', type: 'currency', required: true },
      { name: 'permittedUse', label: 'Permitted Use', type: 'text', required: true },
      { name: 'insuranceAmount', label: 'Required Insurance Coverage', type: 'currency', required: true, defaultValue: '1000000' },
    ],
    formatting: {
      pageSize: 'letter',
      font: 'Times New Roman',
      fontSize: 11,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      lineSpacing: 1.15,
    },
    legalNotices: [
      'Commercial leases are complex legal documents.',
      'Both parties should have legal counsel review before signing.',
    ],
    amendmentHistory: [
      { version: '1.0', date: '2025-01-01', description: 'Initial template creation' },
    ],
  };
}

// ============================================
// EMPLOYMENT CONTRACT TEMPLATES
// ============================================

export function getEmploymentAgreementTemplate(): ContractTemplate {
  return {
    id: EMPLOYMENT_CONTRACT_TEMPLATES.EMPLOYMENT_AGREEMENT,
    name: 'Employment Agreement',
    description: 'Comprehensive employment agreement covering terms, compensation, and obligations',
    category: CONTRACT_CATEGORIES.EMPLOYMENT,
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    clauses: [
      {
        id: 'position',
        name: 'Position and Duties',
        description: 'Job title and responsibilities',
        defaultText: 'Employee is hired for the position of {{positionTitle}} and shall perform duties as described in Exhibit A.',
        customizable: true,
        required: true,
        category: 'position',
      },
      {
        id: 'compensation',
        name: 'Compensation',
        description: 'Salary and benefits',
        defaultText: 'Employee shall receive an annual salary of {{annualSalary}}, paid {{payFrequency}}.',
        customizable: true,
        required: true,
        category: 'compensation',
      },
      {
        id: 'benefits',
        name: 'Benefits',
        description: 'Employee benefits package',
        defaultText: 'Employee shall be eligible for the Company\'s standard benefits package including health insurance, retirement plan, and paid time off.',
        customizable: true,
        required: true,
        category: 'benefits',
      },
      {
        id: 'term',
        name: 'Term of Employment',
        description: 'Duration and at-will status',
        defaultText: 'Employment is at-will and may be terminated by either party at any time with or without cause.',
        customizable: true,
        required: true,
        category: 'term',
      },
      {
        id: 'confidentiality',
        name: 'Confidentiality',
        description: 'Protection of company information',
        defaultText: 'Employee agrees to maintain the confidentiality of all proprietary and confidential information.',
        customizable: true,
        required: true,
        category: 'confidentiality',
      },
      {
        id: 'non_compete',
        name: 'Non-Competition',
        description: 'Restrictions on competing',
        defaultText: 'For {{nonCompetePeriod}} months following termination, Employee shall not engage in competing business within {{nonCompeteRadius}} miles.',
        customizable: true,
        required: false,
        category: 'restrictions',
      },
      {
        id: 'ip_assignment',
        name: 'Intellectual Property Assignment',
        description: 'Ownership of work product',
        defaultText: 'All inventions, works, and intellectual property created during employment shall belong to the Company.',
        customizable: true,
        required: true,
        category: 'ip',
      },
    ],
    signatureBlocks: [
      {
        id: 'employer',
        partyType: 'entity',
        label: 'Employer',
        fields: ['companyName', 'authorizedSignatory', 'title', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
      {
        id: 'employee',
        partyType: 'individual',
        label: 'Employee',
        fields: ['employeeName', 'employeeSignature', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
    ],
    customizableFields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
      { name: 'positionTitle', label: 'Position Title', type: 'text', required: true },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'annualSalary', label: 'Annual Salary', type: 'currency', required: true },
      { name: 'payFrequency', label: 'Pay Frequency', type: 'select', required: true, options: ['weekly', 'bi-weekly', 'semi-monthly', 'monthly'] },
      { name: 'workLocation', label: 'Work Location', type: 'text', required: true },
      { name: 'nonCompetePeriod', label: 'Non-Compete Period (months)', type: 'number', required: false, defaultValue: '12' },
      { name: 'nonCompeteRadius', label: 'Non-Compete Radius (miles)', type: 'number', required: false, defaultValue: '50' },
    ],
    formatting: {
      pageSize: 'letter',
      font: 'Arial',
      fontSize: 11,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      lineSpacing: 1.15,
    },
    legalNotices: [
      'Non-compete provisions may not be enforceable in all states.',
      'Employment laws vary by jurisdiction.',
    ],
    amendmentHistory: [
      { version: '1.0', date: '2025-01-01', description: 'Initial template creation' },
    ],
  };
}

export function getSeveranceAgreementTemplate(): ContractTemplate {
  return {
    id: EMPLOYMENT_CONTRACT_TEMPLATES.SEVERANCE_AGREEMENT,
    name: 'Severance Agreement and Release',
    description: 'Agreement providing severance benefits in exchange for release of claims',
    category: CONTRACT_CATEGORIES.EMPLOYMENT,
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    clauses: [
      {
        id: 'separation',
        name: 'Separation of Employment',
        description: 'Acknowledgment of employment end',
        defaultText: 'Employee\'s employment with Company shall terminate effective {{separationDate}}.',
        customizable: true,
        required: true,
        category: 'separation',
      },
      {
        id: 'severance_payment',
        name: 'Severance Payment',
        description: 'Amount and timing of severance',
        defaultText: 'In consideration for this Agreement, Company shall pay Employee {{severanceAmount}} within {{paymentDays}} days of the Effective Date.',
        customizable: true,
        required: true,
        category: 'payment',
      },
      {
        id: 'benefits_continuation',
        name: 'Benefits Continuation',
        description: 'Continuation of health benefits',
        defaultText: 'Company shall continue Employee\'s health insurance coverage for {{benefitMonths}} months following separation.',
        customizable: true,
        required: true,
        category: 'benefits',
      },
      {
        id: 'release',
        name: 'Release of Claims',
        description: 'Employee releases all claims',
        defaultText: 'Employee hereby releases and forever discharges Company from any and all claims arising from employment.',
        customizable: false,
        required: true,
        category: 'release',
      },
      {
        id: 'confidentiality',
        name: 'Confidentiality of Agreement',
        description: 'Agreement terms are confidential',
        defaultText: 'Employee agrees to keep the terms of this Agreement confidential.',
        customizable: true,
        required: true,
        category: 'confidentiality',
      },
      {
        id: 'non_disparagement',
        name: 'Non-Disparagement',
        description: 'Agreement not to disparage',
        defaultText: 'Both parties agree not to make disparaging statements about the other.',
        customizable: true,
        required: true,
        category: 'conduct',
      },
      {
        id: 'consideration_period',
        name: 'Consideration Period',
        description: 'Time to review agreement',
        defaultText: 'Employee has {{considerationDays}} days to consider this Agreement and {{revocationDays}} days to revoke after signing.',
        customizable: true,
        required: true,
        category: 'timing',
      },
    ],
    signatureBlocks: [
      {
        id: 'employer',
        partyType: 'entity',
        label: 'Employer',
        fields: ['companyName', 'authorizedSignatory', 'title', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: false,
      },
      {
        id: 'employee',
        partyType: 'individual',
        label: 'Employee',
        fields: ['employeeName', 'employeeSignature', 'signatureDate'],
        requiresNotarization: false,
        requiresWitness: true,
      },
    ],
    customizableFields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
      { name: 'separationDate', label: 'Separation Date', type: 'date', required: true },
      { name: 'severanceAmount', label: 'Severance Amount', type: 'currency', required: true },
      { name: 'paymentDays', label: 'Days to Payment', type: 'number', required: true, defaultValue: '14' },
      { name: 'benefitMonths', label: 'Benefits Continuation (months)', type: 'number', required: true, defaultValue: '3' },
      { name: 'considerationDays', label: 'Consideration Period (days)', type: 'number', required: true, defaultValue: '21' },
      { name: 'revocationDays', label: 'Revocation Period (days)', type: 'number', required: true, defaultValue: '7' },
    ],
    formatting: {
      pageSize: 'letter',
      font: 'Times New Roman',
      fontSize: 11,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      lineSpacing: 1.15,
    },
    legalNotices: [
      'Employees over 40 have specific rights under ADEA.',
      'Consideration and revocation periods are required by law.',
      'Employee should consult an attorney before signing.',
    ],
    amendmentHistory: [
      { version: '1.0', date: '2025-01-01', description: 'Initial template creation' },
    ],
  };
}

// ============================================
// TRUST/ESTATE CONTRACT TEMPLATES
// ============================================

export function getTrustAgreementTemplate(state: string = 'California'): ContractTemplate {
  return {
    id: TRUST_ESTATE_CONTRACT_TEMPLATES.TRUST_AGREEMENT,
    name: `${state} Revocable Trust Agreement`,
    description: 'Comprehensive revocable living trust agreement for estate planning',
    category: CONTRACT_CATEGORIES.TRUST_ESTATE,
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    clauses: [
      {
        id: 'declaration',
        name: 'Declaration of Trust',
        description: 'Establishment of the trust',
        defaultText: 'Grantor hereby declares and establishes the {{trustName}} Trust for the benefit of the beneficiaries named herein.',
        customizable: true,
        required: true,
        category: 'formation',
      },
      {
        id: 'trust_property',
        name: 'Trust Property',
        description: 'Assets transferred to trust',
        defaultText: 'Grantor transfers to the Trust the property described in Schedule A attached hereto.',
        customizable: true,
        required: true,
        category: 'property',
      },
      {
        id: 'beneficiaries',
        name: 'Beneficiaries',
        description: 'Designation of beneficiaries',
        defaultText: 'The beneficiaries of this Trust are: {{beneficiaries}}.',
        customizable: true,
        required: true,
        category: 'beneficiaries',
      },
      {
        id: 'distributions',
        name: 'Distribution Provisions',
        description: 'How and when distributions are made',
        defaultText: 'During Grantor\'s lifetime, Trustee shall distribute income and principal for Grantor\'s benefit. Upon Grantor\'s death, remaining assets shall be distributed as specified.',
        customizable: true,
        required: true,
        category: 'distributions',
      },
      {
        id: 'trustee_powers',
        name: 'Trustee Powers',
        description: 'Authority granted to trustee',
        defaultText: 'Trustee shall have all powers necessary to administer the Trust, including but not limited to...',
        customizable: true,
        required: true,
        category: 'administration',
      },
      {
        id: 'successor_trustee',
        name: 'Successor Trustee',
        description: 'Who serves if initial trustee cannot',
        defaultText: 'If the initial Trustee is unable or unwilling to serve, {{successorTrustee}} shall serve as Successor Trustee.',
        customizable: true,
        required: true,
        category: 'succession',
      },
      {
        id: 'revocation',
        name: 'Revocation and Amendment',
        description: 'Grantor\'s right to modify',
        defaultText: 'Grantor reserves the right to revoke, amend, or modify this Trust at any time during Grantor\'s lifetime.',
        customizable: false,
        required: true,
        category: 'modification',
      },
      {
        id: 'incapacity',
        name: 'Incapacity Provisions',
        description: 'Management during incapacity',
        defaultText: 'If Grantor becomes incapacitated, Successor Trustee shall manage Trust assets for Grantor\'s benefit.',
        customizable: true,
        required: true,
        category: 'incapacity',
      },
    ],
    signatureBlocks: [
      {
        id: 'grantor',
        partyType: 'individual',
        label: 'Grantor',
        fields: ['grantorName', 'grantorSignature', 'signatureDate'],
        requiresNotarization: true,
        requiresWitness: true,
      },
      {
        id: 'trustee',
        partyType: 'individual',
        label: 'Trustee',
        fields: ['trusteeName', 'trusteeSignature', 'signatureDate'],
        requiresNotarization: true,
        requiresWitness: true,
      },
    ],
    customizableFields: [
      { name: 'trustName', label: 'Trust Name', type: 'text', required: true },
      { name: 'grantorName', label: 'Grantor Name', type: 'text', required: true },
      { name: 'grantorAddress', label: 'Grantor Address', type: 'address', required: true },
      { name: 'initialTrusteeName', label: 'Initial Trustee Name', type: 'text', required: true },
      { name: 'successorTrustee', label: 'Successor Trustee Name', type: 'text', required: true },
      { name: 'beneficiaries', label: 'Primary Beneficiaries', type: 'textarea', required: true },
      { name: 'contingentBeneficiaries', label: 'Contingent Beneficiaries', type: 'textarea', required: false },
      { name: 'trustDate', label: 'Trust Date', type: 'date', required: true },
    ],
    formatting: {
      pageSize: 'letter',
      font: 'Times New Roman',
      fontSize: 12,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      lineSpacing: 1.5,
    },
    legalNotices: [
      'Trust agreements should be prepared with the assistance of an estate planning attorney.',
      'Funding the trust (transferring assets) is essential for it to be effective.',
      'State laws vary significantly regarding trust requirements.',
    ],
    amendmentHistory: [
      { version: '1.0', date: '2025-01-01', description: 'Initial template creation' },
    ],
  };
}

export function getPowerOfAttorneyTemplate(state: string = 'California'): ContractTemplate {
  return {
    id: TRUST_ESTATE_CONTRACT_TEMPLATES.POWER_OF_ATTORNEY_FINANCIAL,
    name: `${state} Durable Power of Attorney for Finances`,
    description: 'Grants authority to manage financial affairs',
    category: CONTRACT_CATEGORIES.TRUST_ESTATE,
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    clauses: [
      {
        id: 'appointment',
        name: 'Appointment of Agent',
        description: 'Designation of attorney-in-fact',
        defaultText: 'I, {{principalName}}, hereby appoint {{agentName}} as my Attorney-in-Fact ("Agent").',
        customizable: true,
        required: true,
        category: 'appointment',
      },
      {
        id: 'powers_granted',
        name: 'Powers Granted',
        description: 'Specific powers given to agent',
        defaultText: 'I grant my Agent full power to act on my behalf in all financial matters, including but not limited to: banking, investments, real estate, taxes, and legal matters.',
        customizable: true,
        required: true,
        category: 'powers',
      },
      {
        id: 'durability',
        name: 'Durability Provision',
        description: 'Power continues during incapacity',
        defaultText: 'This Power of Attorney shall not be affected by my subsequent disability or incapacity.',
        customizable: false,
        required: true,
        category: 'durability',
      },
      {
        id: 'effective_date',
        name: 'Effective Date',
        description: 'When power becomes effective',
        defaultText: 'This Power of Attorney shall become effective [immediately/upon my incapacity].',
        customizable: true,
        required: true,
        category: 'timing',
      },
      {
        id: 'successor_agent',
        name: 'Successor Agent',
        description: 'Alternate agent designation',
        defaultText: 'If my Agent is unable or unwilling to serve, I appoint {{successorAgent}} as Successor Agent.',
        customizable: true,
        required: true,
        category: 'succession',
      },
      {
        id: 'revocation',
        name: 'Revocation',
        description: 'Right to revoke',
        defaultText: 'I reserve the right to revoke this Power of Attorney at any time while I am competent.',
        customizable: false,
        required: true,
        category: 'revocation',
      },
    ],
    signatureBlocks: [
      {
        id: 'principal',
        partyType: 'individual',
        label: 'Principal',
        fields: ['principalName', 'principalSignature', 'signatureDate'],
        requiresNotarization: true,
        requiresWitness: true,
      },
      {
        id: 'notary',
        partyType: 'notary',
        label: 'Notary Public',
        fields: ['notaryName', 'notarySignature', 'notaryCommission', 'notaryExpiration'],
        requiresNotarization: false,
        requiresWitness: false,
      },
    ],
    customizableFields: [
      { name: 'principalName', label: 'Principal Name', type: 'text', required: true },
      { name: 'principalAddress', label: 'Principal Address', type: 'address', required: true },
      { name: 'agentName', label: 'Agent Name', type: 'text', required: true },
      { name: 'agentAddress', label: 'Agent Address', type: 'address', required: true },
      { name: 'successorAgent', label: 'Successor Agent Name', type: 'text', required: true },
      { name: 'effectiveType', label: 'When Effective', type: 'select', required: true, options: ['Immediately', 'Upon Incapacity'] },
      { name: 'documentDate', label: 'Document Date', type: 'date', required: true },
    ],
    formatting: {
      pageSize: 'letter',
      font: 'Times New Roman',
      fontSize: 12,
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      lineSpacing: 1.5,
    },
    legalNotices: [
      'This document grants significant authority over your finances.',
      'Notarization is required for validity in most states.',
      'Consider consulting an attorney before signing.',
    ],
    amendmentHistory: [
      { version: '1.0', date: '2025-01-01', description: 'Initial template creation' },
    ],
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getAllContractTemplates(): ContractTemplate[] {
  return [
    // Business contracts
    getOperatingAgreementTemplate(),
    getNonDisclosureAgreementTemplate(),
    getBuySellAgreementTemplate(),
    // Service contracts
    getIndependentContractorAgreementTemplate(),
    getConsultingAgreementTemplate(),
    // Property contracts
    getRealEstatePurchaseAgreementTemplate(),
    getCommercialLeaseAgreementTemplate(),
    // Employment contracts
    getEmploymentAgreementTemplate(),
    getSeveranceAgreementTemplate(),
    // Trust/Estate contracts
    getTrustAgreementTemplate(),
    getPowerOfAttorneyTemplate(),
  ];
}

export function getContractTemplatesByCategory(category: ContractCategory): ContractTemplate[] {
  return getAllContractTemplates().filter(t => t.category === category);
}

export function validateContractData(template: ContractTemplate, data: Record<string, any>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const field of template.customizableFields) {
    const value = data[field.name];
    
    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.label} is required`);
      continue;
    }
    
    // Skip validation if field is empty and not required
    if (!value) continue;
    
    // Validate based on type
    if (field.type === 'number' && field.validation) {
      const numValue = Number(value);
      if (field.validation.min !== undefined && numValue < field.validation.min) {
        errors.push(`${field.label} must be at least ${field.validation.min}`);
      }
      if (field.validation.max !== undefined && numValue > field.validation.max) {
        errors.push(`${field.label} must be no more than ${field.validation.max}`);
      }
    }
    
    if (field.type === 'text' && field.validation?.maxLength) {
      if (String(value).length > field.validation.maxLength) {
        errors.push(`${field.label} must be no more than ${field.validation.maxLength} characters`);
      }
    }
    
    if (field.type === 'select' && field.options) {
      if (!field.options.includes(value)) {
        errors.push(`${field.label} must be one of: ${field.options.join(', ')}`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

export function getClauseLibrary(): ContractClause[] {
  return [
    // Confidentiality clauses
    {
      id: 'conf_standard',
      name: 'Standard Confidentiality',
      description: 'Basic confidentiality provision',
      defaultText: 'Each party agrees to maintain the confidentiality of all non-public information received from the other party.',
      customizable: true,
      required: false,
      category: 'confidentiality',
    },
    {
      id: 'conf_mutual',
      name: 'Mutual Confidentiality',
      description: 'Two-way confidentiality provision',
      defaultText: 'Both parties acknowledge that they may receive confidential information and agree to protect such information with the same degree of care used to protect their own confidential information.',
      customizable: true,
      required: false,
      category: 'confidentiality',
    },
    // Indemnification clauses
    {
      id: 'indem_standard',
      name: 'Standard Indemnification',
      description: 'Basic indemnification provision',
      defaultText: 'Each party shall indemnify, defend, and hold harmless the other party from any claims arising from their breach of this Agreement.',
      customizable: true,
      required: false,
      category: 'indemnification',
    },
    {
      id: 'indem_ip',
      name: 'IP Indemnification',
      description: 'Intellectual property indemnification',
      defaultText: 'Provider shall indemnify Client against any claims that the services or deliverables infringe any third-party intellectual property rights.',
      customizable: true,
      required: false,
      category: 'indemnification',
    },
    // Limitation of liability clauses
    {
      id: 'lol_cap',
      name: 'Liability Cap',
      description: 'Caps total liability',
      defaultText: 'Neither party\'s total liability under this Agreement shall exceed the amounts paid or payable under this Agreement in the twelve (12) months preceding the claim.',
      customizable: true,
      required: false,
      category: 'liability',
    },
    {
      id: 'lol_consequential',
      name: 'Consequential Damages Waiver',
      description: 'Excludes consequential damages',
      defaultText: 'Neither party shall be liable for any indirect, incidental, special, consequential, or punitive damages.',
      customizable: true,
      required: false,
      category: 'liability',
    },
    // Dispute resolution clauses
    {
      id: 'disp_arbitration',
      name: 'Arbitration',
      description: 'Binding arbitration provision',
      defaultText: 'Any dispute arising under this Agreement shall be resolved by binding arbitration in accordance with the rules of the American Arbitration Association.',
      customizable: true,
      required: false,
      category: 'disputes',
    },
    {
      id: 'disp_mediation',
      name: 'Mediation First',
      description: 'Mediation before litigation',
      defaultText: 'Before initiating any legal action, the parties agree to attempt to resolve disputes through mediation.',
      customizable: true,
      required: false,
      category: 'disputes',
    },
    // Termination clauses
    {
      id: 'term_convenience',
      name: 'Termination for Convenience',
      description: 'Either party may terminate without cause',
      defaultText: 'Either party may terminate this Agreement for any reason upon {{noticeDays}} days written notice.',
      customizable: true,
      required: false,
      category: 'termination',
    },
    {
      id: 'term_cause',
      name: 'Termination for Cause',
      description: 'Termination upon breach',
      defaultText: 'Either party may terminate this Agreement immediately upon material breach by the other party that remains uncured for {{curePeriod}} days after written notice.',
      customizable: true,
      required: false,
      category: 'termination',
    },
    // Force majeure
    {
      id: 'force_majeure',
      name: 'Force Majeure',
      description: 'Excuses performance for extraordinary events',
      defaultText: 'Neither party shall be liable for failure to perform due to causes beyond their reasonable control, including acts of God, war, terrorism, pandemic, or government action.',
      customizable: true,
      required: false,
      category: 'force_majeure',
    },
  ];
}
