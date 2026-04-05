/**
 * Legal Document Templates Service
 * Phase 50.1: Government-compliant document templates
 * 
 * Supports:
 * - State Business Filing templates
 * - Federal Filing templates
 * - Tax Form templates
 * - Property Document templates
 * - Employment Document templates
 * - Trust Document templates
 */

// Template Categories
export type TemplateCategory = 
  | 'state_business'
  | 'federal_filing'
  | 'tax_forms'
  | 'property'
  | 'employment'
  | 'trust';

// Template Types by Category
export const STATE_BUSINESS_TEMPLATES = {
  ARTICLES_OF_INCORPORATION: 'articles_of_incorporation',
  LLC_ARTICLES: 'llc_articles_of_organization',
  DBA_REGISTRATION: 'dba_fictitious_business_name',
  CERTIFICATE_OF_FORMATION: 'certificate_of_formation',
  ANNUAL_REPORT: 'annual_report',
  STATEMENT_OF_INFORMATION: 'statement_of_information',
  CERTIFICATE_OF_GOOD_STANDING: 'certificate_of_good_standing',
  AMENDMENT_FILING: 'amendment_filing',
  DISSOLUTION_FILING: 'dissolution_filing',
} as const;

export const FEDERAL_FILING_TEMPLATES = {
  SS4_EIN_APPLICATION: 'ss4_ein_application',
  FORM_1023_501C3: 'form_1023_501c3_application',
  FORM_1024_501C4: 'form_1024_501c4_application',
  FORM_2553_S_CORP: 'form_2553_s_corp_election',
  FORM_8832_ENTITY: 'form_8832_entity_classification',
  FORM_990_NONPROFIT: 'form_990_nonprofit_return',
  FORM_508_RELIGIOUS: 'form_508_religious_exemption',
} as const;

export const TAX_FORM_TEMPLATES = {
  W2_WAGE_STATEMENT: 'w2_wage_statement',
  W4_WITHHOLDING: 'w4_withholding_certificate',
  W9_TIN_REQUEST: 'w9_tin_request',
  FORM_1099_NEC: 'form_1099_nec_nonemployee',
  FORM_1099_MISC: 'form_1099_misc',
  FORM_1099_INT: 'form_1099_int_interest',
  FORM_1099_DIV: 'form_1099_div_dividends',
  SCHEDULE_C: 'schedule_c_profit_loss',
  SCHEDULE_E: 'schedule_e_rental_income',
  SCHEDULE_K1: 'schedule_k1_partner_share',
  FORM_1040: 'form_1040_individual_return',
  FORM_1120: 'form_1120_corporate_return',
  FORM_1120S: 'form_1120s_s_corp_return',
  FORM_1065: 'form_1065_partnership_return',
  FORM_941: 'form_941_quarterly_payroll',
  FORM_940: 'form_940_futa_annual',
} as const;

export const PROPERTY_DOCUMENT_TEMPLATES = {
  WARRANTY_DEED: 'warranty_deed',
  QUITCLAIM_DEED: 'quitclaim_deed',
  GRANT_DEED: 'grant_deed',
  DEED_OF_TRUST: 'deed_of_trust',
  TITLE_TRANSFER: 'title_transfer',
  PROPERTY_TAX_EXEMPTION: 'property_tax_exemption',
  HOMESTEAD_DECLARATION: 'homestead_declaration',
  EASEMENT_AGREEMENT: 'easement_agreement',
  LIEN_RELEASE: 'lien_release',
  AFFIDAVIT_OF_HEIRSHIP: 'affidavit_of_heirship',
} as const;

export const EMPLOYMENT_DOCUMENT_TEMPLATES = {
  OFFER_LETTER: 'offer_letter',
  EMPLOYMENT_AGREEMENT: 'employment_agreement',
  I9_VERIFICATION: 'i9_employment_verification',
  EMPLOYEE_HANDBOOK_ACK: 'employee_handbook_acknowledgment',
  CONFIDENTIALITY_AGREEMENT: 'confidentiality_agreement',
  NON_COMPETE_AGREEMENT: 'non_compete_agreement',
  TERMINATION_LETTER: 'termination_letter',
  SEPARATION_AGREEMENT: 'separation_agreement',
  PERFORMANCE_REVIEW: 'performance_review_form',
  DISCIPLINARY_NOTICE: 'disciplinary_notice',
  DIRECT_DEPOSIT_AUTH: 'direct_deposit_authorization',
  BENEFITS_ENROLLMENT: 'benefits_enrollment_form',
} as const;

export const TRUST_DOCUMENT_TEMPLATES = {
  REVOCABLE_LIVING_TRUST: 'revocable_living_trust',
  IRREVOCABLE_TRUST: 'irrevocable_trust',
  FAMILY_TRUST: 'family_trust',
  CHARITABLE_TRUST: 'charitable_trust',
  SPECIAL_NEEDS_TRUST: 'special_needs_trust',
  BENEFICIARY_DESIGNATION: 'beneficiary_designation',
  TRUST_AMENDMENT: 'trust_amendment',
  TRUST_RESTATEMENT: 'trust_restatement',
  CERTIFICATE_OF_TRUST: 'certificate_of_trust',
  POUR_OVER_WILL: 'pour_over_will',
  POWER_OF_ATTORNEY: 'power_of_attorney',
  HEALTHCARE_DIRECTIVE: 'healthcare_directive',
} as const;

// Template Field Types
export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'signature' | 'ssn' | 'ein' | 'phone' | 'address' | 'currency';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  helpText?: string;
  section?: string;
}

// Template Definition
export interface DocumentTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  version: string;
  lastUpdated: string;
  jurisdiction?: string;
  fields: TemplateField[];
  sections: {
    id: string;
    title: string;
    description?: string;
  }[];
  formatting: {
    pageSize: 'letter' | 'legal' | 'a4';
    margins: { top: number; right: number; bottom: number; left: number };
    font: string;
    fontSize: number;
    lineSpacing: number;
  };
  governmentCompliant: boolean;
  filingInstructions?: string;
  estimatedFilingFee?: number;
}

// State Business Filing Templates
export function getArticlesOfIncorporationTemplate(state: string): DocumentTemplate {
  return {
    id: STATE_BUSINESS_TEMPLATES.ARTICLES_OF_INCORPORATION,
    name: `Articles of Incorporation - ${state}`,
    category: 'state_business',
    description: 'Official document to incorporate a business as a corporation',
    version: '2024.1',
    lastUpdated: '2024-01-15',
    jurisdiction: state,
    governmentCompliant: true,
    formatting: {
      pageSize: 'letter',
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      font: 'Times New Roman',
      fontSize: 12,
      lineSpacing: 1.5,
    },
    sections: [
      { id: 'header', title: 'Filing Header' },
      { id: 'corporate_name', title: 'Corporate Name' },
      { id: 'purpose', title: 'Corporate Purpose' },
      { id: 'stock', title: 'Stock Structure' },
      { id: 'registered_agent', title: 'Registered Agent' },
      { id: 'incorporators', title: 'Incorporators' },
      { id: 'directors', title: 'Initial Directors' },
      { id: 'signatures', title: 'Signatures' },
    ],
    fields: [
      { name: 'corporateName', label: 'Corporate Name', type: 'text', required: true, section: 'corporate_name', validation: { maxLength: 100 } },
      { name: 'corporateSuffix', label: 'Corporate Suffix', type: 'select', required: true, options: ['Inc.', 'Incorporated', 'Corporation', 'Corp.'], section: 'corporate_name' },
      { name: 'purpose', label: 'Corporate Purpose', type: 'textarea', required: true, section: 'purpose', placeholder: 'The purpose of this corporation is to engage in any lawful act or activity...' },
      { name: 'authorizedShares', label: 'Authorized Shares', type: 'number', required: true, section: 'stock', validation: { min: 1 } },
      { name: 'parValue', label: 'Par Value per Share', type: 'currency', required: true, section: 'stock' },
      { name: 'stockClasses', label: 'Stock Classes', type: 'select', required: true, options: ['Common Only', 'Common and Preferred'], section: 'stock' },
      { name: 'registeredAgentName', label: 'Registered Agent Name', type: 'text', required: true, section: 'registered_agent' },
      { name: 'registeredAgentAddress', label: 'Registered Agent Address', type: 'address', required: true, section: 'registered_agent' },
      { name: 'incorporatorName', label: 'Incorporator Name', type: 'text', required: true, section: 'incorporators' },
      { name: 'incorporatorAddress', label: 'Incorporator Address', type: 'address', required: true, section: 'incorporators' },
      { name: 'incorporatorSignature', label: 'Incorporator Signature', type: 'signature', required: true, section: 'signatures' },
      { name: 'filingDate', label: 'Filing Date', type: 'date', required: true, section: 'header' },
    ],
    filingInstructions: 'File with the Secretary of State. Include filing fee payment.',
    estimatedFilingFee: 100,
  };
}

export function getLLCArticlesTemplate(state: string): DocumentTemplate {
  return {
    id: STATE_BUSINESS_TEMPLATES.LLC_ARTICLES,
    name: `Articles of Organization (LLC) - ${state}`,
    category: 'state_business',
    description: 'Official document to form a Limited Liability Company',
    version: '2024.1',
    lastUpdated: '2024-01-15',
    jurisdiction: state,
    governmentCompliant: true,
    formatting: {
      pageSize: 'letter',
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      font: 'Times New Roman',
      fontSize: 12,
      lineSpacing: 1.5,
    },
    sections: [
      { id: 'header', title: 'Filing Header' },
      { id: 'llc_name', title: 'LLC Name' },
      { id: 'purpose', title: 'Business Purpose' },
      { id: 'registered_agent', title: 'Registered Agent' },
      { id: 'management', title: 'Management Structure' },
      { id: 'organizers', title: 'Organizers' },
      { id: 'signatures', title: 'Signatures' },
    ],
    fields: [
      { name: 'llcName', label: 'LLC Name', type: 'text', required: true, section: 'llc_name', validation: { maxLength: 100 } },
      { name: 'llcSuffix', label: 'LLC Suffix', type: 'select', required: true, options: ['LLC', 'L.L.C.', 'Limited Liability Company'], section: 'llc_name' },
      { name: 'purpose', label: 'Business Purpose', type: 'textarea', required: true, section: 'purpose' },
      { name: 'registeredAgentName', label: 'Registered Agent Name', type: 'text', required: true, section: 'registered_agent' },
      { name: 'registeredAgentAddress', label: 'Registered Agent Address', type: 'address', required: true, section: 'registered_agent' },
      { name: 'managementType', label: 'Management Type', type: 'select', required: true, options: ['Member-Managed', 'Manager-Managed'], section: 'management' },
      { name: 'organizerName', label: 'Organizer Name', type: 'text', required: true, section: 'organizers' },
      { name: 'organizerAddress', label: 'Organizer Address', type: 'address', required: true, section: 'organizers' },
      { name: 'organizerSignature', label: 'Organizer Signature', type: 'signature', required: true, section: 'signatures' },
      { name: 'filingDate', label: 'Filing Date', type: 'date', required: true, section: 'header' },
    ],
    filingInstructions: 'File with the Secretary of State. Include filing fee payment.',
    estimatedFilingFee: 70,
  };
}

export function getDBATemplate(state: string): DocumentTemplate {
  return {
    id: STATE_BUSINESS_TEMPLATES.DBA_REGISTRATION,
    name: `DBA/Fictitious Business Name - ${state}`,
    category: 'state_business',
    description: 'Register a "Doing Business As" or fictitious business name',
    version: '2024.1',
    lastUpdated: '2024-01-15',
    jurisdiction: state,
    governmentCompliant: true,
    formatting: {
      pageSize: 'letter',
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      font: 'Times New Roman',
      fontSize: 12,
      lineSpacing: 1.5,
    },
    sections: [
      { id: 'header', title: 'Filing Header' },
      { id: 'business_name', title: 'Fictitious Business Name' },
      { id: 'registrant', title: 'Registrant Information' },
      { id: 'business_address', title: 'Business Address' },
      { id: 'signatures', title: 'Signatures' },
    ],
    fields: [
      { name: 'fictitiousName', label: 'Fictitious Business Name', type: 'text', required: true, section: 'business_name' },
      { name: 'registrantType', label: 'Registrant Type', type: 'select', required: true, options: ['Individual', 'Corporation', 'LLC', 'Partnership', 'Trust'], section: 'registrant' },
      { name: 'registrantName', label: 'Registrant Legal Name', type: 'text', required: true, section: 'registrant' },
      { name: 'registrantAddress', label: 'Registrant Address', type: 'address', required: true, section: 'registrant' },
      { name: 'businessAddress', label: 'Principal Business Address', type: 'address', required: true, section: 'business_address' },
      { name: 'businessType', label: 'Type of Business', type: 'text', required: true, section: 'business_name' },
      { name: 'commencementDate', label: 'Date Business Commenced', type: 'date', required: true, section: 'business_name' },
      { name: 'registrantSignature', label: 'Registrant Signature', type: 'signature', required: true, section: 'signatures' },
      { name: 'filingDate', label: 'Filing Date', type: 'date', required: true, section: 'header' },
    ],
    filingInstructions: 'File with County Clerk. May require newspaper publication.',
    estimatedFilingFee: 30,
  };
}

// Federal Filing Templates
export function getSS4EINTemplate(): DocumentTemplate {
  return {
    id: FEDERAL_FILING_TEMPLATES.SS4_EIN_APPLICATION,
    name: 'Form SS-4 - Application for Employer Identification Number',
    category: 'federal_filing',
    description: 'IRS form to obtain an Employer Identification Number (EIN)',
    version: '2024.1',
    lastUpdated: '2024-01-15',
    governmentCompliant: true,
    formatting: {
      pageSize: 'letter',
      margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
      font: 'Courier',
      fontSize: 10,
      lineSpacing: 1,
    },
    sections: [
      { id: 'entity_info', title: 'Entity Information' },
      { id: 'responsible_party', title: 'Responsible Party' },
      { id: 'entity_type', title: 'Type of Entity' },
      { id: 'reason', title: 'Reason for Applying' },
      { id: 'signatures', title: 'Signature' },
    ],
    fields: [
      { name: 'legalName', label: 'Legal Name of Entity', type: 'text', required: true, section: 'entity_info' },
      { name: 'tradeName', label: 'Trade Name (if different)', type: 'text', required: false, section: 'entity_info' },
      { name: 'mailingAddress', label: 'Mailing Address', type: 'address', required: true, section: 'entity_info' },
      { name: 'streetAddress', label: 'Street Address (if different)', type: 'address', required: false, section: 'entity_info' },
      { name: 'county', label: 'County', type: 'text', required: true, section: 'entity_info' },
      { name: 'state', label: 'State', type: 'text', required: true, section: 'entity_info' },
      { name: 'responsiblePartyName', label: 'Responsible Party Name', type: 'text', required: true, section: 'responsible_party' },
      { name: 'responsiblePartySSN', label: 'Responsible Party SSN/ITIN', type: 'ssn', required: true, section: 'responsible_party' },
      { name: 'entityType', label: 'Type of Entity', type: 'select', required: true, options: ['Sole Proprietor', 'Partnership', 'Corporation', 'S Corporation', 'LLC', 'Trust', 'Estate', 'Non-Profit', 'Church', 'Other'], section: 'entity_type' },
      { name: 'stateOfIncorporation', label: 'State of Incorporation/Organization', type: 'text', required: false, section: 'entity_type' },
      { name: 'reasonForApplying', label: 'Reason for Applying', type: 'select', required: true, options: ['Started new business', 'Hired employees', 'Banking purposes', 'Changed type of organization', 'Purchased going business', 'Created a trust', 'Created a pension plan', 'Other'], section: 'reason' },
      { name: 'dateBusinessStarted', label: 'Date Business Started', type: 'date', required: true, section: 'reason' },
      { name: 'closingMonthFiscalYear', label: 'Closing Month of Fiscal Year', type: 'select', required: true, options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], section: 'reason' },
      { name: 'highestEmployeeCount', label: 'Highest Number of Employees Expected', type: 'number', required: true, section: 'reason' },
      { name: 'principalActivity', label: 'Principal Activity', type: 'text', required: true, section: 'entity_info' },
      { name: 'signature', label: 'Signature', type: 'signature', required: true, section: 'signatures' },
      { name: 'signatureDate', label: 'Date', type: 'date', required: true, section: 'signatures' },
      { name: 'signerTitle', label: 'Title', type: 'text', required: true, section: 'signatures' },
      { name: 'signerPhone', label: 'Phone Number', type: 'phone', required: true, section: 'signatures' },
    ],
    filingInstructions: 'Submit online at IRS.gov, by fax, or by mail. Online applications receive EIN immediately.',
    estimatedFilingFee: 0,
  };
}

export function getForm1023Template(): DocumentTemplate {
  return {
    id: FEDERAL_FILING_TEMPLATES.FORM_1023_501C3,
    name: 'Form 1023 - Application for 501(c)(3) Tax-Exempt Status',
    category: 'federal_filing',
    description: 'IRS form to apply for tax-exempt status as a charitable organization',
    version: '2024.1',
    lastUpdated: '2024-01-15',
    governmentCompliant: true,
    formatting: {
      pageSize: 'letter',
      margins: { top: 0.75, right: 0.75, bottom: 0.75, left: 0.75 },
      font: 'Arial',
      fontSize: 10,
      lineSpacing: 1.15,
    },
    sections: [
      { id: 'identification', title: 'Identification of Applicant' },
      { id: 'organizational', title: 'Organizational Structure' },
      { id: 'narrative', title: 'Narrative Description of Activities' },
      { id: 'compensation', title: 'Compensation and Financial Arrangements' },
      { id: 'financial', title: 'Financial Data' },
      { id: 'public_charity', title: 'Public Charity Status' },
      { id: 'signatures', title: 'Signatures' },
    ],
    fields: [
      { name: 'organizationName', label: 'Organization Name', type: 'text', required: true, section: 'identification' },
      { name: 'ein', label: 'EIN', type: 'ein', required: true, section: 'identification' },
      { name: 'mailingAddress', label: 'Mailing Address', type: 'address', required: true, section: 'identification' },
      { name: 'contactName', label: 'Contact Person Name', type: 'text', required: true, section: 'identification' },
      { name: 'contactPhone', label: 'Contact Phone', type: 'phone', required: true, section: 'identification' },
      { name: 'contactEmail', label: 'Contact Email', type: 'text', required: true, section: 'identification' },
      { name: 'organizationType', label: 'Type of Organization', type: 'select', required: true, options: ['Corporation', 'Trust', 'Association', 'Other'], section: 'organizational' },
      { name: 'stateOfIncorporation', label: 'State of Incorporation', type: 'text', required: true, section: 'organizational' },
      { name: 'dateOfIncorporation', label: 'Date of Incorporation', type: 'date', required: true, section: 'organizational' },
      { name: 'missionStatement', label: 'Mission Statement', type: 'textarea', required: true, section: 'narrative' },
      { name: 'activitiesDescription', label: 'Description of Activities', type: 'textarea', required: true, section: 'narrative' },
      { name: 'publicCharityStatus', label: 'Public Charity Classification', type: 'select', required: true, options: ['509(a)(1) - Church', '509(a)(1) - School', '509(a)(1) - Hospital', '509(a)(1) - Public Support', '509(a)(2) - Gross Receipts', '509(a)(3) - Supporting Organization'], section: 'public_charity' },
      { name: 'authorizedSignature', label: 'Authorized Signature', type: 'signature', required: true, section: 'signatures' },
      { name: 'signerName', label: 'Signer Name', type: 'text', required: true, section: 'signatures' },
      { name: 'signerTitle', label: 'Signer Title', type: 'text', required: true, section: 'signatures' },
      { name: 'signatureDate', label: 'Date', type: 'date', required: true, section: 'signatures' },
    ],
    filingInstructions: 'Submit via Pay.gov with user fee. Processing time is typically 3-6 months.',
    estimatedFilingFee: 600,
  };
}

// Tax Form Templates
export function getW2Template(): DocumentTemplate {
  return {
    id: TAX_FORM_TEMPLATES.W2_WAGE_STATEMENT,
    name: 'Form W-2 - Wage and Tax Statement',
    category: 'tax_forms',
    description: 'Annual statement of wages paid and taxes withheld',
    version: '2024.1',
    lastUpdated: '2024-01-15',
    governmentCompliant: true,
    formatting: {
      pageSize: 'letter',
      margins: { top: 0.25, right: 0.25, bottom: 0.25, left: 0.25 },
      font: 'Courier',
      fontSize: 9,
      lineSpacing: 1,
    },
    sections: [
      { id: 'employer', title: 'Employer Information' },
      { id: 'employee', title: 'Employee Information' },
      { id: 'wages', title: 'Wages and Compensation' },
      { id: 'taxes', title: 'Tax Withholdings' },
      { id: 'other', title: 'Other Information' },
    ],
    fields: [
      { name: 'employerEIN', label: 'Employer EIN (Box a)', type: 'ein', required: true, section: 'employer' },
      { name: 'employerName', label: 'Employer Name (Box c)', type: 'text', required: true, section: 'employer' },
      { name: 'employerAddress', label: 'Employer Address (Box c)', type: 'address', required: true, section: 'employer' },
      { name: 'controlNumber', label: 'Control Number (Box d)', type: 'text', required: false, section: 'employer' },
      { name: 'employeeSSN', label: 'Employee SSN (Box a)', type: 'ssn', required: true, section: 'employee' },
      { name: 'employeeName', label: 'Employee Name (Box e)', type: 'text', required: true, section: 'employee' },
      { name: 'employeeAddress', label: 'Employee Address (Box f)', type: 'address', required: true, section: 'employee' },
      { name: 'wagesTipsOther', label: 'Wages, Tips, Other Comp (Box 1)', type: 'currency', required: true, section: 'wages' },
      { name: 'federalIncomeTax', label: 'Federal Income Tax Withheld (Box 2)', type: 'currency', required: true, section: 'taxes' },
      { name: 'socialSecurityWages', label: 'Social Security Wages (Box 3)', type: 'currency', required: true, section: 'wages' },
      { name: 'socialSecurityTax', label: 'Social Security Tax Withheld (Box 4)', type: 'currency', required: true, section: 'taxes' },
      { name: 'medicareWages', label: 'Medicare Wages (Box 5)', type: 'currency', required: true, section: 'wages' },
      { name: 'medicareTax', label: 'Medicare Tax Withheld (Box 6)', type: 'currency', required: true, section: 'taxes' },
      { name: 'socialSecurityTips', label: 'Social Security Tips (Box 7)', type: 'currency', required: false, section: 'wages' },
      { name: 'allocatedTips', label: 'Allocated Tips (Box 8)', type: 'currency', required: false, section: 'wages' },
      { name: 'dependentCareBenefits', label: 'Dependent Care Benefits (Box 10)', type: 'currency', required: false, section: 'other' },
      { name: 'nonqualifiedPlans', label: 'Nonqualified Plans (Box 11)', type: 'currency', required: false, section: 'other' },
      { name: 'box12Codes', label: 'Box 12 Codes', type: 'text', required: false, section: 'other', helpText: 'Enter code and amount (e.g., D:5000)' },
      { name: 'statutoryEmployee', label: 'Statutory Employee (Box 13)', type: 'checkbox', required: false, section: 'other' },
      { name: 'retirementPlan', label: 'Retirement Plan (Box 13)', type: 'checkbox', required: false, section: 'other' },
      { name: 'thirdPartySickPay', label: 'Third-Party Sick Pay (Box 13)', type: 'checkbox', required: false, section: 'other' },
      { name: 'stateWages', label: 'State Wages (Box 16)', type: 'currency', required: false, section: 'taxes' },
      { name: 'stateIncomeTax', label: 'State Income Tax (Box 17)', type: 'currency', required: false, section: 'taxes' },
      { name: 'localWages', label: 'Local Wages (Box 18)', type: 'currency', required: false, section: 'taxes' },
      { name: 'localIncomeTax', label: 'Local Income Tax (Box 19)', type: 'currency', required: false, section: 'taxes' },
    ],
    filingInstructions: 'Provide to employee by January 31. File Copy A with SSA by January 31.',
    estimatedFilingFee: 0,
  };
}

export function get1099NECTemplate(): DocumentTemplate {
  return {
    id: TAX_FORM_TEMPLATES.FORM_1099_NEC,
    name: 'Form 1099-NEC - Nonemployee Compensation',
    category: 'tax_forms',
    description: 'Report payments of $600 or more to nonemployees',
    version: '2024.1',
    lastUpdated: '2024-01-15',
    governmentCompliant: true,
    formatting: {
      pageSize: 'letter',
      margins: { top: 0.25, right: 0.25, bottom: 0.25, left: 0.25 },
      font: 'Courier',
      fontSize: 9,
      lineSpacing: 1,
    },
    sections: [
      { id: 'payer', title: 'Payer Information' },
      { id: 'recipient', title: 'Recipient Information' },
      { id: 'amounts', title: 'Payment Amounts' },
    ],
    fields: [
      { name: 'payerName', label: 'Payer Name', type: 'text', required: true, section: 'payer' },
      { name: 'payerAddress', label: 'Payer Address', type: 'address', required: true, section: 'payer' },
      { name: 'payerTIN', label: 'Payer TIN', type: 'ein', required: true, section: 'payer' },
      { name: 'payerPhone', label: 'Payer Phone', type: 'phone', required: true, section: 'payer' },
      { name: 'recipientTIN', label: 'Recipient TIN', type: 'ssn', required: true, section: 'recipient' },
      { name: 'recipientName', label: 'Recipient Name', type: 'text', required: true, section: 'recipient' },
      { name: 'recipientAddress', label: 'Recipient Address', type: 'address', required: true, section: 'recipient' },
      { name: 'nonemployeeCompensation', label: 'Nonemployee Compensation (Box 1)', type: 'currency', required: true, section: 'amounts' },
      { name: 'federalIncomeTaxWithheld', label: 'Federal Income Tax Withheld (Box 4)', type: 'currency', required: false, section: 'amounts' },
      { name: 'stateIncomeTaxWithheld', label: 'State Income Tax Withheld (Box 5)', type: 'currency', required: false, section: 'amounts' },
      { name: 'statePayerNumber', label: 'State/Payer State No. (Box 6)', type: 'text', required: false, section: 'amounts' },
      { name: 'stateIncome', label: 'State Income (Box 7)', type: 'currency', required: false, section: 'amounts' },
    ],
    filingInstructions: 'Provide to recipient by January 31. File with IRS by January 31.',
    estimatedFilingFee: 0,
  };
}

// Property Document Templates
export function getWarrantyDeedTemplate(state: string): DocumentTemplate {
  return {
    id: PROPERTY_DOCUMENT_TEMPLATES.WARRANTY_DEED,
    name: `Warranty Deed - ${state}`,
    category: 'property',
    description: 'Transfer real property with full warranty of title',
    version: '2024.1',
    lastUpdated: '2024-01-15',
    jurisdiction: state,
    governmentCompliant: true,
    formatting: {
      pageSize: 'legal',
      margins: { top: 1.5, right: 1, bottom: 1, left: 1 },
      font: 'Times New Roman',
      fontSize: 12,
      lineSpacing: 1.5,
    },
    sections: [
      { id: 'header', title: 'Recording Information' },
      { id: 'parties', title: 'Parties' },
      { id: 'consideration', title: 'Consideration' },
      { id: 'property', title: 'Property Description' },
      { id: 'covenants', title: 'Covenants and Warranties' },
      { id: 'signatures', title: 'Signatures and Acknowledgment' },
    ],
    fields: [
      { name: 'grantorName', label: 'Grantor Name', type: 'text', required: true, section: 'parties' },
      { name: 'grantorAddress', label: 'Grantor Address', type: 'address', required: true, section: 'parties' },
      { name: 'grantorMaritalStatus', label: 'Grantor Marital Status', type: 'select', required: true, options: ['Single', 'Married', 'Divorced', 'Widowed'], section: 'parties' },
      { name: 'granteeName', label: 'Grantee Name', type: 'text', required: true, section: 'parties' },
      { name: 'granteeAddress', label: 'Grantee Address', type: 'address', required: true, section: 'parties' },
      { name: 'vestingType', label: 'Vesting Type', type: 'select', required: true, options: ['Sole and Separate Property', 'Joint Tenants', 'Tenants in Common', 'Community Property', 'Community Property with Right of Survivorship'], section: 'parties' },
      { name: 'consideration', label: 'Consideration Amount', type: 'currency', required: true, section: 'consideration' },
      { name: 'legalDescription', label: 'Legal Description', type: 'textarea', required: true, section: 'property', helpText: 'Full legal description from title report' },
      { name: 'parcelNumber', label: 'Assessor Parcel Number', type: 'text', required: true, section: 'property' },
      { name: 'propertyAddress', label: 'Property Address', type: 'address', required: true, section: 'property' },
      { name: 'grantorSignature', label: 'Grantor Signature', type: 'signature', required: true, section: 'signatures' },
      { name: 'notaryAcknowledgment', label: 'Notary Acknowledgment', type: 'signature', required: true, section: 'signatures' },
      { name: 'notaryDate', label: 'Notary Date', type: 'date', required: true, section: 'signatures' },
      { name: 'notaryCommissionExpires', label: 'Notary Commission Expires', type: 'date', required: true, section: 'signatures' },
    ],
    filingInstructions: 'Record with County Recorder. Include transfer tax declaration.',
    estimatedFilingFee: 50,
  };
}

// Employment Document Templates
export function getOfferLetterTemplate(): DocumentTemplate {
  return {
    id: EMPLOYMENT_DOCUMENT_TEMPLATES.OFFER_LETTER,
    name: 'Employment Offer Letter',
    category: 'employment',
    description: 'Formal job offer with terms and conditions',
    version: '2024.1',
    lastUpdated: '2024-01-15',
    governmentCompliant: true,
    formatting: {
      pageSize: 'letter',
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      font: 'Arial',
      fontSize: 11,
      lineSpacing: 1.5,
    },
    sections: [
      { id: 'header', title: 'Company Information' },
      { id: 'position', title: 'Position Details' },
      { id: 'compensation', title: 'Compensation and Benefits' },
      { id: 'terms', title: 'Terms and Conditions' },
      { id: 'signatures', title: 'Acceptance' },
    ],
    fields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true, section: 'header' },
      { name: 'companyAddress', label: 'Company Address', type: 'address', required: true, section: 'header' },
      { name: 'candidateName', label: 'Candidate Name', type: 'text', required: true, section: 'header' },
      { name: 'candidateAddress', label: 'Candidate Address', type: 'address', required: true, section: 'header' },
      { name: 'offerDate', label: 'Offer Date', type: 'date', required: true, section: 'header' },
      { name: 'positionTitle', label: 'Position Title', type: 'text', required: true, section: 'position' },
      { name: 'department', label: 'Department', type: 'text', required: true, section: 'position' },
      { name: 'reportsTo', label: 'Reports To', type: 'text', required: true, section: 'position' },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true, section: 'position' },
      { name: 'employmentType', label: 'Employment Type', type: 'select', required: true, options: ['Full-Time', 'Part-Time', 'Temporary', 'Contract'], section: 'position' },
      { name: 'exemptStatus', label: 'FLSA Status', type: 'select', required: true, options: ['Exempt', 'Non-Exempt'], section: 'position' },
      { name: 'salary', label: 'Annual Salary', type: 'currency', required: true, section: 'compensation' },
      { name: 'payFrequency', label: 'Pay Frequency', type: 'select', required: true, options: ['Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly'], section: 'compensation' },
      { name: 'signingBonus', label: 'Signing Bonus', type: 'currency', required: false, section: 'compensation' },
      { name: 'benefits', label: 'Benefits Summary', type: 'textarea', required: true, section: 'compensation' },
      { name: 'ptoPolicy', label: 'PTO Policy', type: 'textarea', required: true, section: 'compensation' },
      { name: 'atWillStatement', label: 'At-Will Employment Statement', type: 'checkbox', required: true, section: 'terms' },
      { name: 'contingencies', label: 'Contingencies', type: 'textarea', required: false, section: 'terms', helpText: 'Background check, drug test, etc.' },
      { name: 'responseDeadline', label: 'Response Deadline', type: 'date', required: true, section: 'terms' },
      { name: 'hiringManagerSignature', label: 'Hiring Manager Signature', type: 'signature', required: true, section: 'signatures' },
      { name: 'candidateSignature', label: 'Candidate Signature', type: 'signature', required: true, section: 'signatures' },
      { name: 'acceptanceDate', label: 'Acceptance Date', type: 'date', required: true, section: 'signatures' },
    ],
    filingInstructions: 'Provide to candidate. Retain signed copy in personnel file.',
    estimatedFilingFee: 0,
  };
}

// Trust Document Templates
export function getRevocableLivingTrustTemplate(state: string): DocumentTemplate {
  return {
    id: TRUST_DOCUMENT_TEMPLATES.REVOCABLE_LIVING_TRUST,
    name: `Revocable Living Trust - ${state}`,
    category: 'trust',
    description: 'Revocable trust for estate planning and asset management',
    version: '2024.1',
    lastUpdated: '2024-01-15',
    jurisdiction: state,
    governmentCompliant: true,
    formatting: {
      pageSize: 'letter',
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      font: 'Times New Roman',
      fontSize: 12,
      lineSpacing: 1.5,
    },
    sections: [
      { id: 'declaration', title: 'Declaration of Trust' },
      { id: 'parties', title: 'Parties' },
      { id: 'property', title: 'Trust Property' },
      { id: 'beneficiaries', title: 'Beneficiaries' },
      { id: 'distributions', title: 'Distribution Provisions' },
      { id: 'powers', title: 'Trustee Powers' },
      { id: 'successor', title: 'Successor Trustees' },
      { id: 'amendments', title: 'Amendment and Revocation' },
      { id: 'signatures', title: 'Signatures' },
    ],
    fields: [
      { name: 'trustName', label: 'Trust Name', type: 'text', required: true, section: 'declaration' },
      { name: 'trustDate', label: 'Trust Date', type: 'date', required: true, section: 'declaration' },
      { name: 'grantorName', label: 'Grantor Name', type: 'text', required: true, section: 'parties' },
      { name: 'grantorAddress', label: 'Grantor Address', type: 'address', required: true, section: 'parties' },
      { name: 'grantorSSN', label: 'Grantor SSN', type: 'ssn', required: true, section: 'parties' },
      { name: 'initialTrusteeName', label: 'Initial Trustee Name', type: 'text', required: true, section: 'parties' },
      { name: 'successorTrusteeName', label: 'Successor Trustee Name', type: 'text', required: true, section: 'successor' },
      { name: 'successorTrusteeAddress', label: 'Successor Trustee Address', type: 'address', required: true, section: 'successor' },
      { name: 'primaryBeneficiaryName', label: 'Primary Beneficiary Name', type: 'text', required: true, section: 'beneficiaries' },
      { name: 'primaryBeneficiaryRelation', label: 'Relationship to Grantor', type: 'text', required: true, section: 'beneficiaries' },
      { name: 'primaryBeneficiaryShare', label: 'Share Percentage', type: 'number', required: true, section: 'beneficiaries', validation: { min: 0, max: 100 } },
      { name: 'contingentBeneficiaryName', label: 'Contingent Beneficiary Name', type: 'text', required: false, section: 'beneficiaries' },
      { name: 'distributionAge', label: 'Distribution Age', type: 'number', required: false, section: 'distributions', helpText: 'Age at which beneficiary receives full distribution' },
      { name: 'specialInstructions', label: 'Special Distribution Instructions', type: 'textarea', required: false, section: 'distributions' },
      { name: 'grantorSignature', label: 'Grantor Signature', type: 'signature', required: true, section: 'signatures' },
      { name: 'witness1Signature', label: 'Witness 1 Signature', type: 'signature', required: true, section: 'signatures' },
      { name: 'witness2Signature', label: 'Witness 2 Signature', type: 'signature', required: true, section: 'signatures' },
      { name: 'notaryAcknowledgment', label: 'Notary Acknowledgment', type: 'signature', required: true, section: 'signatures' },
    ],
    filingInstructions: 'No filing required. Store original in safe location. Fund trust with assets.',
    estimatedFilingFee: 0,
  };
}

// Get all templates by category
export function getTemplatesByCategory(category: TemplateCategory): DocumentTemplate[] {
  const templates: DocumentTemplate[] = [];
  
  switch (category) {
    case 'state_business':
      templates.push(
        getArticlesOfIncorporationTemplate('California'),
        getLLCArticlesTemplate('California'),
        getDBATemplate('California')
      );
      break;
    case 'federal_filing':
      templates.push(
        getSS4EINTemplate(),
        getForm1023Template()
      );
      break;
    case 'tax_forms':
      templates.push(
        getW2Template(),
        get1099NECTemplate()
      );
      break;
    case 'property':
      templates.push(
        getWarrantyDeedTemplate('California')
      );
      break;
    case 'employment':
      templates.push(
        getOfferLetterTemplate()
      );
      break;
    case 'trust':
      templates.push(
        getRevocableLivingTrustTemplate('California')
      );
      break;
  }
  
  return templates;
}

// Get all available templates
export function getAllTemplates(): DocumentTemplate[] {
  const categories: TemplateCategory[] = ['state_business', 'federal_filing', 'tax_forms', 'property', 'employment', 'trust'];
  return categories.flatMap(category => getTemplatesByCategory(category));
}

// Validate template data
export function validateTemplateData(template: DocumentTemplate, data: Record<string, any>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const field of template.fields) {
    const value = data[field.name];
    
    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.label} is required`);
      continue;
    }
    
    // Skip validation for empty optional fields
    if (!value) continue;
    
    // Type-specific validation
    if (field.validation) {
      if (field.validation.minLength && String(value).length < field.validation.minLength) {
        errors.push(`${field.label} must be at least ${field.validation.minLength} characters`);
      }
      if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
        errors.push(`${field.label} must be no more than ${field.validation.maxLength} characters`);
      }
      if (field.validation.min !== undefined && Number(value) < field.validation.min) {
        errors.push(`${field.label} must be at least ${field.validation.min}`);
      }
      if (field.validation.max !== undefined && Number(value) > field.validation.max) {
        errors.push(`${field.label} must be no more than ${field.validation.max}`);
      }
      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(String(value))) {
        errors.push(`${field.label} format is invalid`);
      }
    }
    
    // SSN format validation
    if (field.type === 'ssn' && !/^\d{3}-?\d{2}-?\d{4}$/.test(String(value))) {
      errors.push(`${field.label} must be a valid SSN format (XXX-XX-XXXX)`);
    }
    
    // EIN format validation
    if (field.type === 'ein' && !/^\d{2}-?\d{7}$/.test(String(value))) {
      errors.push(`${field.label} must be a valid EIN format (XX-XXXXXXX)`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
