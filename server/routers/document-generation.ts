import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  documentTemplates,
  generatedDocuments,
  documentFieldDefinitions,
  lifecycleEvents,
  luvLedgerTransactions,
  luvLedgerAccounts,
  houses,
  businessEntities,
  w2Workers,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";

// ============================================
// DOCUMENT TEMPLATE DEFINITIONS
// ============================================

// State Business Filing Templates
const STATE_BUSINESS_TEMPLATES = {
  ARTICLES_OF_INCORPORATION: {
    templateCode: "STATE_ARTICLES_INC",
    templateName: "Articles of Incorporation",
    category: "state_business" as const,
    description: "Formation document for a corporation",
    pageSize: "letter" as const,
    requiredFields: ["corporationName", "registeredAgent", "registeredAddress", "incorporators", "shares", "purpose"],
  },
  ARTICLES_OF_ORGANIZATION: {
    templateCode: "STATE_ARTICLES_ORG",
    templateName: "Articles of Organization (LLC)",
    category: "state_business" as const,
    description: "Formation document for a Limited Liability Company",
    pageSize: "letter" as const,
    requiredFields: ["llcName", "registeredAgent", "registeredAddress", "organizers", "managementType", "purpose"],
  },
  DBA_FICTITIOUS_NAME: {
    templateCode: "STATE_DBA",
    templateName: "DBA / Fictitious Business Name Statement",
    category: "state_business" as const,
    description: "Registration for doing business under a fictitious name",
    pageSize: "letter" as const,
    requiredFields: ["fictitiousName", "ownerName", "ownerAddress", "businessType", "businessAddress"],
  },
  ANNUAL_REPORT: {
    templateCode: "STATE_ANNUAL_REPORT",
    templateName: "Annual Report / Statement of Information",
    category: "state_business" as const,
    description: "Annual filing required to maintain good standing",
    pageSize: "letter" as const,
    requiredFields: ["entityName", "entityNumber", "principalAddress", "officers", "registeredAgent"],
  },
};

// Federal Filing Templates
const FEDERAL_TEMPLATES = {
  SS4_EIN: {
    templateCode: "IRS_SS4",
    templateName: "Form SS-4 - Application for Employer Identification Number",
    category: "federal_business" as const,
    formNumber: "SS-4",
    ombNumber: "1545-0003",
    description: "Application for federal Employer Identification Number (EIN)",
    pageSize: "letter" as const,
    requiredFields: ["legalName", "tradeName", "address", "responsibleParty", "ssn", "entityType", "reasonApplying"],
  },
  FORM_1023: {
    templateCode: "IRS_1023",
    templateName: "Form 1023 - Application for 501(c)(3) Status",
    category: "federal_business" as const,
    formNumber: "1023",
    ombNumber: "1545-0056",
    description: "Application for tax-exempt status under section 501(c)(3)",
    pageSize: "letter" as const,
    requiredFields: ["organizationName", "ein", "address", "activities", "financials", "governance"],
  },
  FORM_1024: {
    templateCode: "IRS_1024",
    templateName: "Form 1024 - Application for 501(a) Status",
    category: "federal_business" as const,
    formNumber: "1024",
    description: "Application for tax-exempt status under other 501 sections",
    pageSize: "letter" as const,
    requiredFields: ["organizationName", "ein", "address", "exemptionType", "activities"],
  },
  FORM_2553: {
    templateCode: "IRS_2553",
    templateName: "Form 2553 - Election by a Small Business Corporation",
    category: "federal_business" as const,
    formNumber: "2553",
    ombNumber: "1545-0123",
    description: "Election to be treated as an S Corporation",
    pageSize: "letter" as const,
    requiredFields: ["corporationName", "ein", "address", "shareholders", "taxYear", "electionDate"],
  },
};

// Tax Form Templates
const TAX_TEMPLATES = {
  W2: {
    templateCode: "IRS_W2",
    templateName: "Form W-2 - Wage and Tax Statement",
    category: "federal_tax" as const,
    formNumber: "W-2",
    description: "Annual wage and tax statement for employees",
    pageSize: "letter" as const,
    requiredFields: ["employerEin", "employerName", "employeeSSN", "employeeName", "wages", "federalWithheld"],
  },
  W4: {
    templateCode: "IRS_W4",
    templateName: "Form W-4 - Employee's Withholding Certificate",
    category: "federal_tax" as const,
    formNumber: "W-4",
    ombNumber: "1545-0074",
    description: "Employee withholding allowance certificate",
    pageSize: "letter" as const,
    requiredFields: ["employeeName", "ssn", "address", "filingStatus", "dependents"],
  },
  FORM_1099_NEC: {
    templateCode: "IRS_1099_NEC",
    templateName: "Form 1099-NEC - Nonemployee Compensation",
    category: "federal_tax" as const,
    formNumber: "1099-NEC",
    description: "Report of nonemployee compensation",
    pageSize: "letter" as const,
    requiredFields: ["payerInfo", "recipientInfo", "compensation", "federalWithheld"],
  },
  FORM_1099_MISC: {
    templateCode: "IRS_1099_MISC",
    templateName: "Form 1099-MISC - Miscellaneous Income",
    category: "federal_tax" as const,
    formNumber: "1099-MISC",
    description: "Report of miscellaneous income",
    pageSize: "letter" as const,
    requiredFields: ["payerInfo", "recipientInfo", "rents", "royalties", "otherIncome"],
  },
  SCHEDULE_C: {
    templateCode: "IRS_SCHEDULE_C",
    templateName: "Schedule C - Profit or Loss From Business",
    category: "federal_tax" as const,
    formNumber: "Schedule C",
    ombNumber: "1545-0074",
    description: "Report of business income and expenses for sole proprietors",
    pageSize: "letter" as const,
    requiredFields: ["businessName", "ein", "businessCode", "grossReceipts", "expenses"],
  },
  FORM_1040: {
    templateCode: "IRS_1040",
    templateName: "Form 1040 - U.S. Individual Income Tax Return",
    category: "federal_tax" as const,
    formNumber: "1040",
    ombNumber: "1545-0074",
    description: "Individual income tax return",
    pageSize: "letter" as const,
    requiredFields: ["taxpayerInfo", "filingStatus", "income", "deductions", "credits"],
  },
};

// Contract Templates
const CONTRACT_TEMPLATES = {
  OPERATING_AGREEMENT: {
    templateCode: "CONTRACT_OPERATING",
    templateName: "LLC Operating Agreement",
    category: "general_legal" as const,
    description: "Governs the internal operations of an LLC",
    pageSize: "letter" as const,
    requiredFields: ["llcName", "members", "capitalContributions", "profitSharing", "management", "dissolution"],
  },
  PARTNERSHIP_AGREEMENT: {
    templateCode: "CONTRACT_PARTNERSHIP",
    templateName: "Partnership Agreement",
    category: "general_legal" as const,
    description: "Agreement between partners in a business partnership",
    pageSize: "letter" as const,
    requiredFields: ["partnershipName", "partners", "contributions", "profitLoss", "duties", "termination"],
  },
  NDA: {
    templateCode: "CONTRACT_NDA",
    templateName: "Non-Disclosure Agreement",
    category: "general_legal" as const,
    description: "Confidentiality agreement to protect sensitive information",
    pageSize: "letter" as const,
    requiredFields: ["disclosingParty", "receivingParty", "confidentialInfo", "term", "obligations"],
  },
  INDEPENDENT_CONTRACTOR: {
    templateCode: "CONTRACT_IC",
    templateName: "Independent Contractor Agreement",
    category: "general_legal" as const,
    description: "Agreement for independent contractor services",
    pageSize: "letter" as const,
    requiredFields: ["contractor", "client", "services", "compensation", "term", "deliverables"],
  },
  EMPLOYMENT_AGREEMENT: {
    templateCode: "CONTRACT_EMPLOYMENT",
    templateName: "Employment Agreement",
    category: "employment" as const,
    description: "Agreement between employer and employee",
    pageSize: "letter" as const,
    requiredFields: ["employer", "employee", "position", "compensation", "benefits", "term", "termination"],
  },
  PURCHASE_AGREEMENT: {
    templateCode: "CONTRACT_PURCHASE",
    templateName: "Real Estate Purchase Agreement",
    category: "property" as const,
    description: "Agreement for the purchase of real property",
    pageSize: "letter" as const,
    requiredFields: ["buyer", "seller", "property", "purchasePrice", "earnestMoney", "closingDate", "contingencies"],
  },
  LEASE_AGREEMENT: {
    templateCode: "CONTRACT_LEASE",
    templateName: "Residential Lease Agreement",
    category: "property" as const,
    description: "Rental agreement for residential property",
    pageSize: "letter" as const,
    requiredFields: ["landlord", "tenant", "property", "rent", "term", "securityDeposit", "rules"],
  },
  TRUST_AGREEMENT: {
    templateCode: "CONTRACT_TRUST",
    templateName: "Revocable Living Trust Agreement",
    category: "trust" as const,
    description: "Establishes a revocable living trust",
    pageSize: "letter" as const,
    requiredFields: ["grantor", "trustee", "beneficiaries", "assets", "distributions", "successor"],
  },
  POWER_OF_ATTORNEY: {
    templateCode: "CONTRACT_POA",
    templateName: "Durable Power of Attorney",
    category: "trust" as const,
    description: "Grants authority to act on behalf of another",
    pageSize: "letter" as const,
    requiredFields: ["principal", "agent", "powers", "effective", "durability"],
  },
  PLATFORM_SERVICES_AGREEMENT: {
    templateCode: "CONTRACT_PSA",
    templateName: "Platform Services Agreement",
    category: "general_legal" as const,
    description: "Agreement for platform services fee between parent House and subsidiary entities",
    pageSize: "letter" as const,
    requiredFields: ["parentHouse", "subsidiaryEntity", "feePercentage", "servicesProvided", "effectiveDate", "governingLaw"],
  },
  ADMINISTRATIVE_SERVICES_AGREEMENT: {
    templateCode: "CONTRACT_ASA",
    templateName: "Administrative Services Agreement",
    category: "general_legal" as const,
    description: "Agreement for administrative and management services",
    pageSize: "letter" as const,
    requiredFields: ["serviceProvider", "client", "services", "compensation", "term", "termination"],
  },
  FUND_ALLOCATION_POLICY: {
    templateCode: "POLICY_FUND_ALLOCATION",
    templateName: "Community Fund Allocation Policy",
    category: "general_legal" as const,
    description: "Policy document governing community fund allocations and disbursements",
    pageSize: "letter" as const,
    requiredFields: ["houseName", "funds", "allocationPercentages", "disbursementRules", "approvalProcess"],
  },
  DISBURSEMENT_REQUEST: {
    templateCode: "FORM_DISBURSEMENT",
    templateName: "Fund Disbursement Request Form",
    category: "general_legal" as const,
    description: "Request form for community fund disbursements",
    pageSize: "letter" as const,
    requiredFields: ["requestorName", "fundName", "amount", "purpose", "recipientInfo", "justification"],
  },
  STRATEGIC_PARTNERSHIP_AGREEMENT: {
    templateCode: "CONTRACT_STRATEGIC_PARTNER",
    templateName: "Strategic Partnership Agreement",
    category: "general_legal" as const,
    description: "Agreement for strategic partnerships with external organizations",
    pageSize: "letter" as const,
    requiredFields: ["partnerOrg", "luvOnPurposeEntity", "partnershipScope", "revenueSplit", "term", "departments", "boardStatus", "governingLaw"],
  },
  REVENUE_SHARE_AGREEMENT: {
    templateCode: "CONTRACT_REVENUE_SHARE",
    templateName: "Revenue Sharing Agreement",
    category: "general_legal" as const,
    description: "Agreement defining revenue sharing between parties for joint programs",
    pageSize: "letter" as const,
    requiredFields: ["partyA", "partyB", "revenueSource", "splitPercentage", "paymentTerms", "reportingRequirements", "term"],
  },
  CONFLICT_OF_INTEREST_DISCLOSURE: {
    templateCode: "FORM_COI_DISCLOSURE",
    templateName: "Conflict of Interest Disclosure Form",
    category: "general_legal" as const,
    description: "Disclosure form for board members and managers to declare potential conflicts",
    pageSize: "letter" as const,
    requiredFields: ["discloserName", "position", "relatedParties", "natureOfConflict", "mitigationPlan", "signatureDate"],
  },
  MUTUAL_NDA: {
    templateCode: "CONTRACT_MUTUAL_NDA",
    templateName: "Mutual Non-Disclosure Agreement",
    category: "general_legal" as const,
    description: "Two-way confidentiality agreement where both parties share and protect information",
    pageSize: "letter" as const,
    requiredFields: ["partyA", "partyB", "confidentialInfoA", "confidentialInfoB", "term", "exclusions", "returnOfMaterials"],
  },
  HONORARY_BOARD_APPOINTMENT: {
    templateCode: "CERT_HONORARY_BOARD",
    templateName: "Honorary Board Appointment Certificate",
    category: "certificate" as const,
    description: "Certificate appointing an honorary advisory board member (non-voting)",
    pageSize: "letter" as const,
    requiredFields: ["appointeeName", "appointeeOrg", "appointingEntity", "advisoryRole", "departments", "effectiveDate", "limitations"],
  },
};

// Funding Templates
const FUNDING_TEMPLATES = {
  GRANT_APPLICATION: {
    templateCode: "FUNDING_GRANT_APP",
    templateName: "Grant Application",
    category: "general_legal" as const,
    description: "Standard grant application form",
    pageSize: "letter" as const,
    requiredFields: ["organizationInfo", "projectTitle", "narrative", "budget", "timeline", "outcomes"],
  },
  GRANT_BUDGET: {
    templateCode: "FUNDING_GRANT_BUDGET",
    templateName: "Grant Budget Template",
    category: "general_legal" as const,
    description: "Detailed budget for grant applications",
    pageSize: "letter" as const,
    requiredFields: ["personnel", "fringe", "travel", "equipment", "supplies", "contractual", "indirect"],
  },
  PROMISSORY_NOTE: {
    templateCode: "FUNDING_PROMISSORY",
    templateName: "Promissory Note",
    category: "general_legal" as const,
    description: "Written promise to pay a specified sum",
    pageSize: "letter" as const,
    requiredFields: ["borrower", "lender", "principal", "interestRate", "paymentSchedule", "maturityDate"],
  },
  LOAN_AGREEMENT: {
    templateCode: "FUNDING_LOAN",
    templateName: "Loan Agreement",
    category: "general_legal" as const,
    description: "Comprehensive loan agreement",
    pageSize: "letter" as const,
    requiredFields: ["borrower", "lender", "amount", "interest", "term", "collateral", "covenants", "default"],
  },
  SAFE_AGREEMENT: {
    templateCode: "FUNDING_SAFE",
    templateName: "Simple Agreement for Future Equity (SAFE)",
    category: "general_legal" as const,
    description: "Investment agreement for startups",
    pageSize: "letter" as const,
    requiredFields: ["company", "investor", "purchaseAmount", "valuationCap", "discountRate", "conversionTerms"],
  },
  CONVERTIBLE_NOTE: {
    templateCode: "FUNDING_CONVERTIBLE",
    templateName: "Convertible Promissory Note",
    category: "general_legal" as const,
    description: "Debt that converts to equity",
    pageSize: "letter" as const,
    requiredFields: ["company", "investor", "principal", "interest", "maturity", "conversionTerms", "valuationCap"],
  },
};

// Employment Templates
const EMPLOYMENT_TEMPLATES = {
  OFFER_LETTER: {
    templateCode: "EMP_OFFER",
    templateName: "Employment Offer Letter",
    category: "employment" as const,
    description: "Formal job offer to a candidate",
    pageSize: "letter" as const,
    requiredFields: ["candidateName", "position", "startDate", "salary", "benefits", "supervisor"],
  },
  I9: {
    templateCode: "USCIS_I9",
    templateName: "Form I-9 - Employment Eligibility Verification",
    category: "employment" as const,
    formNumber: "I-9",
    description: "Verifies identity and employment authorization",
    pageSize: "letter" as const,
    requiredFields: ["employeeName", "address", "dob", "ssn", "citizenshipStatus", "documents"],
  },
  TERMINATION_LETTER: {
    templateCode: "EMP_TERMINATION",
    templateName: "Employment Termination Letter",
    category: "employment" as const,
    description: "Formal notice of employment termination",
    pageSize: "letter" as const,
    requiredFields: ["employeeName", "terminationDate", "reason", "finalPay", "benefits", "returnItems"],
  },
};

// Trust Document Templates (The Calea Freeman Trust)
const TRUST_DOCUMENT_TEMPLATES = {
  TRUST_INDENTURE: {
    templateCode: "TRUST_INDENTURE",
    templateName: "Trust Indenture / Declaration of Trust",
    category: "trust" as const,
    description: "Founding document that defines the trust, its purpose, trustees, and beneficiaries",
    pageSize: "letter" as const,
    requiredFields: ["trustName", "trustNumber", "jurisdiction", "grantor", "initialTrustees", "beneficiaries", "purpose", "assets", "distributionRules", "amendments", "termination"],
  },
  TRUSTEE_APPOINTMENT: {
    templateCode: "TRUST_TRUSTEE_APPT",
    templateName: "Certificate of Trustee Appointment",
    category: "trust" as const,
    description: "Formal appointment of a trustee to manage trust affairs",
    pageSize: "letter" as const,
    requiredFields: ["trustName", "trusteeName", "trusteeAddress", "appointmentDate", "powers", "compensation", "term", "acceptanceSignature"],
  },
  TRUSTEE_RESIGNATION: {
    templateCode: "TRUST_TRUSTEE_RESIGN",
    templateName: "Trustee Resignation Letter",
    category: "trust" as const,
    description: "Formal resignation of a trustee from their position",
    pageSize: "letter" as const,
    requiredFields: ["trustName", "trusteeName", "resignationDate", "reason", "transitionPlan", "finalAccounting"],
  },
  BENEFICIARY_DESIGNATION: {
    templateCode: "TRUST_BENEFICIARY",
    templateName: "Trust Beneficiary Designation Form",
    category: "trust" as const,
    description: "Designates beneficiaries and their share of trust distributions",
    pageSize: "letter" as const,
    requiredFields: ["trustName", "beneficiaryName", "relationship", "beneficiaryType", "distributionShare", "conditions", "contingentBeneficiary"],
  },
  TRUST_ENTITY_CONNECTION: {
    templateCode: "TRUST_ENTITY_CONNECT",
    templateName: "Trust-Entity Connection Agreement",
    category: "trust" as const,
    description: "Agreement connecting an operating entity (LLC or 508) to the trust structure",
    pageSize: "letter" as const,
    requiredFields: ["trustName", "entityName", "entityType", "ownershipPercentage", "revenueAllocation", "governanceRights", "reportingRequirements", "effectiveDate"],
  },
  TRUST_ACTIVATION_CHECKLIST: {
    templateCode: "TRUST_ACTIVATION",
    templateName: "Trust Activation Checklist & Certificate",
    category: "trust" as const,
    description: "Checklist and certificate confirming all requirements for trust activation are met",
    pageSize: "letter" as const,
    requiredFields: ["trustName", "trustNumber", "indentureComplete", "trusteesAppointed", "beneficiariesDesignated", "initialFunding", "bankAccountOpened", "activationDate"],
  },
  TRUST_AMENDMENT: {
    templateCode: "TRUST_AMENDMENT",
    templateName: "Trust Amendment Document",
    category: "trust" as const,
    description: "Formal amendment to modify terms of an existing trust",
    pageSize: "letter" as const,
    requiredFields: ["trustName", "amendmentNumber", "originalProvision", "amendedProvision", "effectiveDate", "trusteeApproval"],
  },
  TRUST_DISTRIBUTION_REQUEST: {
    templateCode: "TRUST_DISTRIBUTION_REQ",
    templateName: "Trust Distribution Request Form",
    category: "trust" as const,
    description: "Request for distribution of funds from the trust to beneficiaries",
    pageSize: "letter" as const,
    requiredFields: ["trustName", "beneficiaryName", "amount", "purpose", "distributionType", "trusteeApproval"],
  },
  TRUST_ANNUAL_REPORT: {
    templateCode: "TRUST_ANNUAL_REPORT",
    templateName: "Trust Annual Report",
    category: "trust" as const,
    description: "Annual accounting and status report for trust operations",
    pageSize: "letter" as const,
    requiredFields: ["trustName", "reportYear", "openingBalance", "contributions", "distributions", "expenses", "closingBalance", "entityPerformance"],
  },
  TRUST_MEETING_MINUTES: {
    templateCode: "TRUST_MINUTES",
    templateName: "Trust Meeting Minutes",
    category: "trust" as const,
    description: "Official minutes of trustee meetings",
    pageSize: "letter" as const,
    requiredFields: ["trustName", "meetingDate", "attendees", "agendaItems", "decisions", "actionItems", "nextMeeting"],
  },
};

// Split & Allocation Report Templates
const SPLIT_REPORT_TEMPLATES = {
  SPLIT_COMPARISON_REPORT: {
    templateCode: "SPLIT_COMPARISON",
    templateName: "Split Comparison Report",
    category: "financial_reports" as const,
    description: "Compare historical allocations under different split configurations",
    pageSize: "letter" as const,
    requiredFields: ["houseName", "reportPeriod", "totalAmount", "currentSplit", "comparisonSplits"],
  },
  ALLOCATION_SUMMARY_REPORT: {
    templateCode: "ALLOCATION_SUMMARY",
    templateName: "Allocation Summary Report",
    category: "financial_reports" as const,
    description: "Summary of fund allocations across house and collective",
    pageSize: "letter" as const,
    requiredFields: ["houseName", "reportDate", "totalIncome", "houseShare", "collectiveShare", "inheritancePool"],
  },
  SPLIT_CHANGE_REQUEST: {
    templateCode: "SPLIT_CHANGE_REQ",
    templateName: "Split Configuration Change Request",
    category: "financial_reports" as const,
    description: "Formal request to modify house split configuration",
    pageSize: "letter" as const,
    requiredFields: ["houseName", "requestedBy", "currentSplit", "proposedSplit", "effectiveDate", "justification"],
  },
};

// Healthcare & Estate Planning Templates (Protection Layer)
const HEALTHCARE_ESTATE_TEMPLATES = {
  HEALTHCARE_POA: {
    templateCode: "HEALTHCARE_POA",
    templateName: "Healthcare Power of Attorney",
    category: "healthcare" as const,
    description: "Designates an agent to make healthcare decisions if you become incapacitated",
    pageSize: "letter" as const,
    requiredFields: ["principalName", "principalAddress", "principalDOB", "agentName", "agentAddress", "agentPhone", "alternateAgentName", "alternateAgentAddress", "powers", "limitations", "effectiveDate", "witnessNames", "notaryInfo"],
  },
  LIVING_WILL: {
    templateCode: "LIVING_WILL",
    templateName: "Living Will / Advance Healthcare Directive",
    category: "healthcare" as const,
    description: "Specifies your wishes for end-of-life medical treatment",
    pageSize: "letter" as const,
    requiredFields: ["principalName", "principalAddress", "principalDOB", "lifeProlong", "painManagement", "artificialNutrition", "organDonation", "burialPreferences", "additionalInstructions", "witnessNames", "notaryInfo"],
  },
  HIPAA_AUTHORIZATION: {
    templateCode: "HIPAA_AUTH",
    templateName: "HIPAA Authorization for Release of Medical Information",
    category: "healthcare" as const,
    description: "Authorizes designated individuals to access your protected health information",
    pageSize: "letter" as const,
    requiredFields: ["patientName", "patientDOB", "patientAddress", "authorizedPersons", "infoToRelease", "purposeOfRelease", "expirationDate", "patientSignature", "signatureDate"],
  },
  FINANCIAL_POA: {
    templateCode: "FINANCIAL_POA",
    templateName: "Durable Financial Power of Attorney",
    category: "healthcare" as const,
    description: "Grants authority to manage financial affairs if you become incapacitated",
    pageSize: "letter" as const,
    requiredFields: ["principalName", "principalAddress", "principalSSN", "agentName", "agentAddress", "powers", "bankingPowers", "realEstatePowers", "investmentPowers", "taxPowers", "giftingPowers", "limitations", "effectiveType", "witnessNames", "notaryInfo"],
  },
  GUARDIAN_NOMINATION: {
    templateCode: "GUARDIAN_NOM",
    templateName: "Nomination of Guardian for Minor Children",
    category: "healthcare" as const,
    description: "Nominates a guardian to care for minor children if parents become incapacitated or pass away",
    pageSize: "letter" as const,
    requiredFields: ["parentNames", "childrenNames", "childrenDOB", "primaryGuardian", "alternateGuardian", "guardianAddress", "reasons", "specialInstructions", "witnessNames", "notaryInfo"],
  },
  BENEFICIARY_DESIGNATION_FORM: {
    templateCode: "BENEFICIARY_FORM",
    templateName: "Beneficiary Designation Form",
    category: "healthcare" as const,
    description: "Designates beneficiaries for accounts and policies to ensure proper transfer",
    pageSize: "letter" as const,
    requiredFields: ["accountOwner", "accountType", "accountNumber", "primaryBeneficiaries", "contingentBeneficiaries", "percentages", "signatureDate"],
  },
  FUNERAL_INSTRUCTIONS: {
    templateCode: "FUNERAL_INSTR",
    templateName: "Funeral and Burial Instructions",
    category: "healthcare" as const,
    description: "Documents your wishes for funeral arrangements and final disposition",
    pageSize: "letter" as const,
    requiredFields: ["principalName", "dispositionType", "funeralHome", "serviceType", "locationPreferences", "musicSelections", "readings", "specialRequests", "prePaidArrangements"],
  },
};

// Private Dispute Resolution Templates
const DISPUTE_RESOLUTION_TEMPLATES = {
  ARBITRATION_AGREEMENT: {
    templateCode: "DISPUTE_ARBITRATION",
    templateName: "Private Arbitration Agreement",
    category: "dispute_resolution" as const,
    description: "Agreement to resolve disputes through private arbitration rather than public courts",
    pageSize: "letter" as const,
    requiredFields: ["partyA", "partyB", "scopeOfDisputes", "arbitrationRules", "arbitratorSelection", "venue", "governingLaw", "costAllocation", "confidentiality", "bindingDecision"],
  },
  MEDIATION_AGREEMENT: {
    templateCode: "DISPUTE_MEDIATION",
    templateName: "Mediation Agreement",
    category: "dispute_resolution" as const,
    description: "Agreement to attempt mediation before arbitration or litigation",
    pageSize: "letter" as const,
    requiredFields: ["partyA", "partyB", "disputeDescription", "mediatorSelection", "mediationRules", "confidentiality", "costSharing", "timeframe"],
  },
  LAWS_MEMBER_DISPUTE_PROTOCOL: {
    templateCode: "DISPUTE_LAWS_PROTOCOL",
    templateName: "The The L.A.W.S. Collective Member Dispute Resolution Protocol",
    category: "dispute_resolution" as const,
    description: "Internal dispute resolution protocol for The The L.A.W.S. Collective members",
    pageSize: "letter" as const,
    requiredFields: ["memberA", "memberB", "disputeType", "initialResolutionAttempt", "escalationPath", "mediatorPanel", "arbitrationOption", "enforcementMechanism"],
  },
  SETTLEMENT_AGREEMENT: {
    templateCode: "DISPUTE_SETTLEMENT",
    templateName: "Settlement Agreement and Mutual Release",
    category: "dispute_resolution" as const,
    description: "Agreement to settle a dispute with mutual release of claims",
    pageSize: "letter" as const,
    requiredFields: ["partyA", "partyB", "disputeBackground", "settlementTerms", "paymentTerms", "releaseScope", "confidentiality", "nonDisparagement", "effectiveDate"],
  },
};

// Privacy Protection Templates
const PRIVACY_TEMPLATES = {
  PRIVACY_TRUST: {
    templateCode: "PRIVACY_TRUST",
    templateName: "Privacy Trust Agreement",
    category: "privacy" as const,
    description: "Trust structure designed to hold LLC interests anonymously",
    pageSize: "letter" as const,
    requiredFields: ["trustName", "grantor", "trustee", "beneficiary", "llcInterests", "privacyProvisions", "distributionRules", "successorTrustee"],
  },
  NOMINEE_AGREEMENT: {
    templateCode: "PRIVACY_NOMINEE",
    templateName: "Nominee Manager/Member Agreement",
    category: "privacy" as const,
    description: "Agreement for a nominee to appear on public records on behalf of the actual owner",
    pageSize: "letter" as const,
    requiredFields: ["nomineeName", "principalName", "entityName", "nomineeRole", "compensation", "indemnification", "terminationRights", "confidentiality"],
  },
  REGISTERED_AGENT_AGREEMENT: {
    templateCode: "PRIVACY_RA",
    templateName: "Registered Agent Service Agreement",
    category: "privacy" as const,
    description: "Agreement for registered agent services to maintain address privacy",
    pageSize: "letter" as const,
    requiredFields: ["agentName", "agentAddress", "clientName", "entityName", "services", "fees", "mailHandling", "term", "termination"],
  },
  VIRTUAL_OFFICE_AGREEMENT: {
    templateCode: "PRIVACY_VIRTUAL_OFFICE",
    templateName: "Virtual Office Service Agreement",
    category: "privacy" as const,
    description: "Agreement for virtual office services including business address and mail handling",
    pageSize: "letter" as const,
    requiredFields: ["providerName", "clientName", "businessAddress", "services", "mailForwarding", "phoneServices", "meetingRoomAccess", "fees", "term"],
  },
};

// All templates combined
const ALL_TEMPLATES = {
  ...STATE_BUSINESS_TEMPLATES,
  ...FEDERAL_TEMPLATES,
  ...TAX_TEMPLATES,
  ...CONTRACT_TEMPLATES,
  ...FUNDING_TEMPLATES,
  ...EMPLOYMENT_TEMPLATES,
  ...TRUST_DOCUMENT_TEMPLATES,
  ...SPLIT_REPORT_TEMPLATES,
  ...HEALTHCARE_ESTATE_TEMPLATES,
  ...DISPUTE_RESOLUTION_TEMPLATES,
  ...PRIVACY_TEMPLATES,
};

// ============================================
// HTML TEMPLATE GENERATORS
// ============================================

function generateDocumentHeader(title: string, formNumber?: string, jurisdiction?: string): string {
  return `
    <div class="document-header">
      <div class="header-left">
        ${jurisdiction ? `<div class="jurisdiction">${jurisdiction}</div>` : ''}
      </div>
      <div class="header-center">
        <h1 class="document-title">${title}</h1>
        ${formNumber ? `<div class="form-number">Form ${formNumber}</div>` : ''}
      </div>
      <div class="header-right">
        <div class="date">Date: {{date}}</div>
      </div>
    </div>
  `;
}

function generateSignatureBlock(parties: string[]): string {
  return `
    <div class="signature-section">
      <h3>SIGNATURES</h3>
      <p>IN WITNESS WHEREOF, the parties have executed this document as of the date first written above.</p>
      ${parties.map(party => `
        <div class="signature-block">
          <div class="party-name">${party}</div>
          <div class="signature-line">
            <div class="line"></div>
            <div class="label">Signature</div>
          </div>
          <div class="print-name">
            <div class="line"></div>
            <div class="label">Print Name</div>
          </div>
          <div class="date-signed">
            <div class="line"></div>
            <div class="label">Date</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function generateNotarizationBlock(): string {
  return `
    <div class="notarization-section">
      <h3>NOTARIZATION</h3>
      <p>State of {{notaryState}}</p>
      <p>County of {{notaryCounty}}</p>
      <p>On this {{notaryDay}} day of {{notaryMonth}}, {{notaryYear}}, before me personally appeared 
         {{signerName}}, known to me (or proved to me on the basis of satisfactory evidence) to be 
         the person(s) whose name(s) is/are subscribed to the within instrument and acknowledged to 
         me that he/she/they executed the same in his/her/their authorized capacity(ies), and that 
         by his/her/their signature(s) on the instrument the person(s), or the entity upon behalf of 
         which the person(s) acted, executed the instrument.</p>
      <div class="notary-signature">
        <div class="line"></div>
        <div class="label">Notary Public Signature</div>
      </div>
      <div class="notary-seal">
        <div class="seal-placeholder">[NOTARY SEAL]</div>
      </div>
      <p>My Commission Expires: {{commissionExpires}}</p>
    </div>
  `;
}

function getDocumentCSS(): string {
  return `
    @page {
      size: letter;
      margin: 0.75in;
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #000;
    }
    
    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24pt;
      border-bottom: 2px solid #000;
      padding-bottom: 12pt;
    }
    
    .document-title {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      margin: 0;
    }
    
    .form-number {
      font-size: 10pt;
      text-align: center;
      margin-top: 4pt;
    }
    
    .jurisdiction {
      font-size: 12pt;
      font-weight: bold;
    }
    
    h2 {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 18pt;
      margin-bottom: 6pt;
    }
    
    h3 {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 12pt;
      margin-bottom: 6pt;
    }
    
    .section {
      margin-bottom: 18pt;
    }
    
    .field-row {
      display: flex;
      margin-bottom: 12pt;
    }
    
    .field-label {
      font-weight: bold;
      min-width: 150pt;
    }
    
    .field-value {
      flex: 1;
      border-bottom: 1px solid #000;
      min-height: 14pt;
      padding-left: 4pt;
    }
    
    .checkbox-field {
      display: flex;
      align-items: center;
      margin-bottom: 6pt;
    }
    
    .checkbox {
      width: 12pt;
      height: 12pt;
      border: 1px solid #000;
      margin-right: 8pt;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .checkbox.checked::after {
      content: "✓";
      font-size: 10pt;
    }
    
    .signature-section {
      margin-top: 36pt;
      page-break-inside: avoid;
    }
    
    .signature-block {
      margin-top: 24pt;
      margin-bottom: 24pt;
    }
    
    .signature-line, .print-name, .date-signed {
      margin-top: 12pt;
    }
    
    .line {
      border-bottom: 1px solid #000;
      width: 250pt;
      height: 18pt;
    }
    
    .label {
      font-size: 9pt;
      margin-top: 2pt;
    }
    
    .notarization-section {
      margin-top: 36pt;
      padding: 12pt;
      border: 1px solid #000;
      page-break-inside: avoid;
    }
    
    .notary-seal {
      margin-top: 12pt;
      width: 100pt;
      height: 100pt;
      border: 2px dashed #999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 12pt 0;
    }
    
    .table th, .table td {
      border: 1px solid #000;
      padding: 6pt;
      text-align: left;
    }
    
    .table th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    
    .currency {
      text-align: right;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 9pt;
      color: #666;
    }
  `;
}

// ============================================
// ROUTER
// ============================================

export const documentGenerationRouter = router({
  // Get all available templates
  getTemplates: protectedProcedure
    .input(z.object({
      category: z.enum([
        "state_business", "federal_business", "federal_tax", "state_tax",
        "employment", "property", "trust", "trademark", "general_legal"
      ]).optional(),
      jurisdiction: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      let query = db.select().from(documentTemplates);
      
      // For now, return the predefined templates
      const templates = Object.entries(ALL_TEMPLATES).map(([key, template]) => ({
        id: key,
        ...template,
        jurisdiction: template.category === "state_business" ? "varies" : "federal",
      }));

      if (input?.category) {
        return templates.filter(t => t.category === input.category);
      }

      return templates;
    }),

  // Get template details with field definitions
  getTemplateDetails: protectedProcedure
    .input(z.object({
      templateCode: z.string(),
      jurisdiction: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const template = ALL_TEMPLATES[input.templateCode as keyof typeof ALL_TEMPLATES];
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      return {
        ...template,
        jurisdiction: input.jurisdiction || "federal",
        fields: template.requiredFields.map(field => ({
          fieldCode: field,
          fieldLabel: field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          fieldType: field.includes('date') ? 'date' : 
                     field.includes('amount') || field.includes('price') || field.includes('salary') ? 'currency' :
                     field.includes('ssn') ? 'ssn' :
                     field.includes('ein') ? 'ein' :
                     field.includes('email') ? 'email' :
                     field.includes('phone') ? 'phone' :
                     field.includes('address') ? 'address' : 'text',
          isRequired: true,
        })),
      };
    }),

  // Generate a document from template
  generateDocument: protectedProcedure
    .input(z.object({
      templateCode: z.string(),
      entityType: z.enum(["business", "property", "worker", "tax_return", "trust", "trademark"]),
      entityId: z.number().optional(),
      formData: z.record(z.string(), z.any()),
      jurisdiction: z.string().optional(),
      language: z.string().default("en"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get user's house
      const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const template = ALL_TEMPLATES[input.templateCode as keyof typeof ALL_TEMPLATES];
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      // Generate document number
      const documentNumber = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Generate HTML content based on template
      const htmlContent = generateDocumentHTML(template, input.formData, input.jurisdiction);

      // Create generated document record
      const [document] = await db.insert(generatedDocuments).values({
        houseId: userHouse[0].id,
        userId: userId,
        templateId: 0, // Will be updated when templates are in DB
        templateCode: input.templateCode,
        entityType: input.entityType,
        entityId: input.entityId,
        documentName: `${template.templateName} - ${input.formData.name || input.formData.entityName || documentNumber}`,
        documentNumber,
        formData: input.formData,
        htmlContent,
        status: "generated",
      });

      // Log to lifecycle events
      await db.insert(lifecycleEvents).values({
        entityType: "document",
        entityId: document.insertId,
        entityName: template.templateName,
        eventType: "created",
        eventDescription: `Generated ${template.templateName} document`,
        houseId: userHouse[0].id,
        userId: userId,
        metadata: JSON.stringify({
          templateCode: input.templateCode,
          jurisdiction: input.jurisdiction,
        }),
      });

      // Log to LuvLedger if there's a financial impact
      const financialFields = ['amount', 'price', 'salary', 'compensation', 'purchasePrice', 'principal'];
      let financialAmount = 0;
      for (const field of financialFields) {
        if (input.formData[field]) {
          financialAmount = parseFloat(input.formData[field]) || 0;
          break;
        }
      }

      if (financialAmount > 0) {
        const account = await db.select().from(luvLedgerAccounts).where(eq(luvLedgerAccounts.userId, userId)).limit(1);
        if (account.length) {
          await db.insert(luvLedgerTransactions).values({
            fromAccountId: account[0].id,
            toAccountId: account[0].id,
            amount: financialAmount.toString(),
            transactionType: "fee",
            description: `Document generated: ${template.templateName}`,
          });
        }
      }

      return {
        documentId: document.insertId,
        documentNumber,
        documentName: template.templateName,
        status: "generated",
        htmlContent,
      };
    }),

  // Get generated documents for a house
  getGeneratedDocuments: protectedProcedure
    .input(z.object({
      entityType: z.enum(["business", "property", "worker", "tax_return", "trust", "trademark"]).optional(),
      status: z.enum(["draft", "generated", "reviewed", "signed", "filed", "accepted", "rejected"]).optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
      if (!userHouse.length) {
        return [];
      }

      const documents = await db
        .select()
        .from(generatedDocuments)
        .where(eq(generatedDocuments.houseId, userHouse[0].id))
        .orderBy(desc(generatedDocuments.createdAt))
        .limit(input?.limit || 50);

      return documents;
    }),

  // Update document status (sign, file, etc.)
  updateDocumentStatus: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      status: z.enum(["draft", "generated", "reviewed", "signed", "filed", "accepted", "rejected"]),
      signatureData: z.string().optional(),
      confirmationNumber: z.string().optional(),
      filingMethod: z.enum(["mail", "online", "in_person", "fax"]).optional(),
      rejectionReason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const updateData: any = {
        status: input.status,
      };

      if (input.status === "signed" && input.signatureData) {
        updateData.signedAt = new Date();
        updateData.signatureData = input.signatureData;
      }

      if (input.status === "filed") {
        updateData.filedAt = new Date();
        updateData.filingMethod = input.filingMethod;
      }

      if (input.status === "accepted") {
        updateData.acceptedAt = new Date();
        updateData.confirmationNumber = input.confirmationNumber;
      }

      if (input.status === "rejected") {
        updateData.rejectionReason = input.rejectionReason;
      }

      await db
        .update(generatedDocuments)
        .set(updateData)
        .where(eq(generatedDocuments.id, input.documentId));

      // Log status change
      const doc = await db.select().from(generatedDocuments).where(eq(generatedDocuments.id, input.documentId)).limit(1);
      if (doc.length) {
        await db.insert(lifecycleEvents).values({
          entityType: "document",
          entityId: input.documentId,
          entityName: doc[0].documentName,
          eventType: input.status === "filed" ? "filed" : 
                     input.status === "accepted" ? "approved" :
                     input.status === "rejected" ? "rejected" : "updated",
          eventDescription: `Document status updated to ${input.status}`,
          houseId: doc[0].houseId,
          userId: userId,
          metadata: input,
        });
      }

      return { success: true, status: input.status };
    }),

  // Get document categories for navigation
  getCategories: protectedProcedure.query(async () => {
    return [
      { code: "state_business", name: "State Business Filings", description: "Articles of Incorporation, LLC, DBA" },
      { code: "federal_business", name: "Federal Business Filings", description: "EIN, 501(c)(3), S-Corp Election" },
      { code: "federal_tax", name: "Tax Forms", description: "W-2, 1099, Schedule C, 1040" },
      { code: "employment", name: "Employment Documents", description: "Offer Letters, I-9, Termination" },
      { code: "property", name: "Property Documents", description: "Purchase Agreements, Leases" },
      { code: "trust", name: "Trust & Estate", description: "Trust Agreements, Power of Attorney" },
      { code: "general_legal", name: "Contracts & Agreements", description: "NDAs, Operating Agreements, Loans" },
    ];
  }),

  // Generate split comparison report
  generateSplitComparisonReport: protectedProcedure
    .input(z.object({
      houseName: z.string(),
      reportPeriod: z.string(), // e.g., "2024-01 to 2024-12"
      totalAmount: z.number(),
      transactions: z.array(z.object({
        date: z.string(),
        amount: z.number(),
        description: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Calculate allocations under different split configurations
      const splitConfigs = [
        { name: "Standard 60/40 + 70/30", interHouse: 60, intraHouse: 70 },
        { name: "Conservative 55/45 + 65/35", interHouse: 55, intraHouse: 65 },
        { name: "Growth 65/35 + 75/25", interHouse: 65, intraHouse: 75 },
        { name: "Balanced 50/50 + 50/50", interHouse: 50, intraHouse: 50 },
      ];

      const comparisons = splitConfigs.map(config => {
        const houseShare = input.totalAmount * (config.interHouse / 100);
        const collectiveShare = input.totalAmount * ((100 - config.interHouse) / 100);
        const houseOperations = houseShare * (config.intraHouse / 100);
        const inheritancePool = houseShare * ((100 - config.intraHouse) / 100);
        return {
          ...config,
          houseShare: houseShare.toFixed(2),
          collectiveShare: collectiveShare.toFixed(2),
          houseOperations: houseOperations.toFixed(2),
          inheritancePool: inheritancePool.toFixed(2),
        };
      });

      // Generate HTML report
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Split Comparison Report - ${input.houseName}</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; }
            h1 { color: #1a5f2a; border-bottom: 2px solid #1a5f2a; padding-bottom: 10px; }
            h2 { color: #333; margin-top: 30px; }
            .header { text-align: center; margin-bottom: 40px; }
            .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
            th { background: #1a5f2a; color: white; }
            tr:nth-child(even) { background: #f9f9f9; }
            .highlight { background: #e8f5e9 !important; font-weight: bold; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Split Comparison Report</h1>
            <p><strong>House:</strong> ${input.houseName}</p>
            <p><strong>Report Period:</strong> ${input.reportPeriod}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Amount Analyzed:</strong> $${input.totalAmount.toLocaleString()}</p>
            <p>This report compares how funds would be distributed under different split configurations.</p>
          </div>

          <h2>Split Configuration Comparison</h2>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Configuration</th>
                <th>House Share</th>
                <th>Collective Share</th>
                <th>House Operations</th>
                <th>Inheritance Pool</th>
              </tr>
            </thead>
            <tbody>
              ${comparisons.map((c, i) => `
                <tr class="${i === 0 ? 'highlight' : ''}">
                  <td style="text-align: left;">${c.name}${i === 0 ? ' (Current)' : ''}</td>
                  <td>$${parseFloat(c.houseShare).toLocaleString()}</td>
                  <td>$${parseFloat(c.collectiveShare).toLocaleString()}</td>
                  <td>$${parseFloat(c.houseOperations).toLocaleString()}</td>
                  <td>$${parseFloat(c.inheritancePool).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Split Formulas Explained</h2>
          <ul>
            <li><strong>Inter-House Split (60/40):</strong> 60% to house, 40% to collective</li>
            <li><strong>Intra-House Split (70/30):</strong> 70% house operations, 30% inheritance pool</li>
          </ul>

          <div class="footer">
            <p>This report is generated by the The The L.A.W.S. Collective Financial Automation System.</p>
            <p>Document ID: RPT-${Date.now()}</p>
          </div>
        </body>
        </html>
      `;

      // Store the document
      const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
      const houseId = userHouse.length ? userHouse[0].id : null;

      const documentNumber = `SPLIT-RPT-${Date.now()}`;
      const document = await db.insert(generatedDocuments).values({
        houseId,
        documentNumber,
        documentName: `Split Comparison Report - ${input.houseName}`,
        templateCode: "SPLIT_COMPARISON",
        entityType: "financial_report",
        status: "generated",
        htmlContent,
        generatedAt: new Date(),
        userId,
        metadata: JSON.stringify({ comparisons, totalAmount: input.totalAmount }),
      });

      return {
        documentId: document.insertId,
        documentNumber,
        htmlContent,
        comparisons,
      };
    }),

  // Get jurisdictions (states)
  getJurisdictions: protectedProcedure.query(async () => {
    return [
      { code: "federal", name: "Federal" },
      { code: "AL", name: "Alabama" },
      { code: "AK", name: "Alaska" },
      { code: "AZ", name: "Arizona" },
      { code: "AR", name: "Arkansas" },
      { code: "CA", name: "California" },
      { code: "CO", name: "Colorado" },
      { code: "CT", name: "Connecticut" },
      { code: "DE", name: "Delaware" },
      { code: "FL", name: "Florida" },
      { code: "GA", name: "Georgia" },
      { code: "HI", name: "Hawaii" },
      { code: "ID", name: "Idaho" },
      { code: "IL", name: "Illinois" },
      { code: "IN", name: "Indiana" },
      { code: "IA", name: "Iowa" },
      { code: "KS", name: "Kansas" },
      { code: "KY", name: "Kentucky" },
      { code: "LA", name: "Louisiana" },
      { code: "ME", name: "Maine" },
      { code: "MD", name: "Maryland" },
      { code: "MA", name: "Massachusetts" },
      { code: "MI", name: "Michigan" },
      { code: "MN", name: "Minnesota" },
      { code: "MS", name: "Mississippi" },
      { code: "MO", name: "Missouri" },
      { code: "MT", name: "Montana" },
      { code: "NE", name: "Nebraska" },
      { code: "NV", name: "Nevada" },
      { code: "NH", name: "New Hampshire" },
      { code: "NJ", name: "New Jersey" },
      { code: "NM", name: "New Mexico" },
      { code: "NY", name: "New York" },
      { code: "NC", name: "North Carolina" },
      { code: "ND", name: "North Dakota" },
      { code: "OH", name: "Ohio" },
      { code: "OK", name: "Oklahoma" },
      { code: "OR", name: "Oregon" },
      { code: "PA", name: "Pennsylvania" },
      { code: "RI", name: "Rhode Island" },
      { code: "SC", name: "South Carolina" },
      { code: "SD", name: "South Dakota" },
      { code: "TN", name: "Tennessee" },
      { code: "TX", name: "Texas" },
      { code: "UT", name: "Utah" },
      { code: "VT", name: "Vermont" },
      { code: "VA", name: "Virginia" },
      { code: "WA", name: "Washington" },
      { code: "WV", name: "West Virginia" },
      { code: "WI", name: "Wisconsin" },
      { code: "WY", name: "Wyoming" },
      { code: "DC", name: "District of Columbia" },
    ];
  }),
});

// Helper function to generate HTML for a document
function generateDocumentHTML(template: any, formData: Record<string, any>, jurisdiction?: string): string {
  const css = getDocumentCSS();
  const header = generateDocumentHeader(
    template.templateName,
    template.formNumber,
    jurisdiction
  );

  // Generate form fields
  const fields = template.requiredFields.map((field: string) => {
    const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const value = formData[field] || '';
    return `
      <div class="field-row">
        <div class="field-label">${label}:</div>
        <div class="field-value">${value}</div>
      </div>
    `;
  }).join('');

  // Determine parties for signature
  const parties = [];
  if (formData.parties) {
    parties.push(...formData.parties);
  } else if (formData.borrower && formData.lender) {
    parties.push(formData.borrower, formData.lender);
  } else if (formData.buyer && formData.seller) {
    parties.push(formData.buyer, formData.seller);
  } else if (formData.landlord && formData.tenant) {
    parties.push(formData.landlord, formData.tenant);
  } else if (formData.employer && formData.employee) {
    parties.push(formData.employer, formData.employee);
  } else {
    parties.push("Party 1", "Party 2");
  }

  const signatures = generateSignatureBlock(parties);
  const notarization = template.category === "trust" || template.category === "property" 
    ? generateNotarizationBlock() 
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${template.templateName}</title>
      <style>${css}</style>
    </head>
    <body>
      ${header}
      
      <div class="section">
        ${fields}
      </div>
      
      ${signatures}
      ${notarization}
      
      <div class="footer">
        Generated by LuvOnPurpose Autonomous Wealth System | Document ID: {{documentNumber}}
      </div>
    </body>
    </html>
  `;
}
