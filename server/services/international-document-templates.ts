/**
 * International Document Templates Service
 * Phase 51.2: Templates for international business operations
 */

// International Document Categories
export type InternationalDocumentCategory =
  | "formation"
  | "compliance"
  | "tax"
  | "banking"
  | "transfer_pricing"
  | "substance"
  | "beneficial_ownership"
  | "treaty_claim";

// Document Template Interface
export interface InternationalDocumentTemplate {
  id: string;
  name: string;
  category: InternationalDocumentCategory;
  jurisdictions: string[]; // Applicable jurisdictions
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  outputFormat: "pdf" | "word" | "both";
  regulatoryReference?: string;
}

// Formation Documents
const FORMATION_TEMPLATES: InternationalDocumentTemplate[] = [
  {
    id: "intl_form_001",
    name: "UK Company Formation (IN01)",
    category: "formation",
    jurisdictions: ["GB"],
    description: "Application to register a company in the United Kingdom",
    requiredFields: ["companyName", "registeredOffice", "directors", "shareholders", "shareCapital", "articles"],
    optionalFields: ["sic_codes", "statementOfCompliance"],
    outputFormat: "pdf",
    regulatoryReference: "Companies Act 2006"
  },
  {
    id: "intl_form_002",
    name: "German GmbH Formation (Gesellschaftsvertrag)",
    category: "formation",
    jurisdictions: ["DE"],
    description: "Articles of association for German limited liability company",
    requiredFields: ["companyName", "registeredOffice", "shareCapital", "shareholders", "managingDirectors", "businessPurpose"],
    optionalFields: ["fiscalYear", "profitDistribution", "transferRestrictions"],
    outputFormat: "both",
    regulatoryReference: "GmbHG"
  },
  {
    id: "intl_form_003",
    name: "Singapore Pte Ltd Incorporation",
    category: "formation",
    jurisdictions: ["SG"],
    description: "ACRA company incorporation application",
    requiredFields: ["companyName", "registeredAddress", "directors", "shareholders", "constitution", "companySecretary"],
    optionalFields: ["shareClasses", "restrictedActivities"],
    outputFormat: "pdf",
    regulatoryReference: "Companies Act (Cap. 50)"
  },
  {
    id: "intl_form_004",
    name: "Hong Kong Limited Company Formation",
    category: "formation",
    jurisdictions: ["HK"],
    description: "NNC1 form for Hong Kong company incorporation",
    requiredFields: ["companyName", "registeredOffice", "directors", "companySecretary", "shareholders", "shareCapital"],
    optionalFields: ["articlesOfAssociation", "businessNature"],
    outputFormat: "pdf",
    regulatoryReference: "Companies Ordinance (Cap. 622)"
  },
  {
    id: "intl_form_005",
    name: "BVI Business Company Formation",
    category: "formation",
    jurisdictions: ["VG"],
    description: "Memorandum and Articles for BVI Business Company",
    requiredFields: ["companyName", "registeredAgent", "directors", "shareholders", "authorizedShares"],
    optionalFields: ["bearerShares", "nomineeServices"],
    outputFormat: "both",
    regulatoryReference: "BVI Business Companies Act 2004"
  },
  {
    id: "intl_form_006",
    name: "Cayman Islands Exempted Company",
    category: "formation",
    jurisdictions: ["KY"],
    description: "Memorandum and Articles for Cayman exempted company",
    requiredFields: ["companyName", "registeredOffice", "subscribers", "authorizedCapital", "objects"],
    optionalFields: ["shareClasses", "redemptionRights"],
    outputFormat: "both",
    regulatoryReference: "Companies Act (2023 Revision)"
  },
  {
    id: "intl_form_007",
    name: "Nevis LLC Formation",
    category: "formation",
    jurisdictions: ["KN"],
    description: "Articles of Organization for Nevis Limited Liability Company",
    requiredFields: ["llcName", "registeredAgent", "members", "managers", "operatingAgreement"],
    optionalFields: ["chargingOrderProtection", "assetProtection"],
    outputFormat: "both",
    regulatoryReference: "Nevis LLC Ordinance"
  },
  {
    id: "intl_form_008",
    name: "Cook Islands Trust Deed",
    category: "formation",
    jurisdictions: ["CK"],
    description: "International trust deed for Cook Islands asset protection trust",
    requiredFields: ["trustName", "settlor", "trustees", "beneficiaries", "trustProperty", "protector"],
    optionalFields: ["flightClause", "duressProvisions", "antiDuressProvisions"],
    outputFormat: "both",
    regulatoryReference: "International Trusts Act 1984"
  },
  {
    id: "intl_form_009",
    name: "Dutch BV Formation",
    category: "formation",
    jurisdictions: ["NL"],
    description: "Deed of incorporation for Dutch private limited company",
    requiredFields: ["companyName", "registeredOffice", "shareCapital", "shareholders", "directors", "articles"],
    optionalFields: ["supervisoryBoard", "worksCouncil"],
    outputFormat: "both",
    regulatoryReference: "Dutch Civil Code Book 2"
  },
  {
    id: "intl_form_010",
    name: "Irish Limited Company Formation",
    category: "formation",
    jurisdictions: ["IE"],
    description: "CRO Form A1 for Irish company incorporation",
    requiredFields: ["companyName", "registeredOffice", "directors", "secretary", "shareholders", "constitution"],
    optionalFields: ["activityCode", "companyObjects"],
    outputFormat: "pdf",
    regulatoryReference: "Companies Act 2014"
  }
];

// Compliance Documents
const COMPLIANCE_TEMPLATES: InternationalDocumentTemplate[] = [
  {
    id: "intl_comp_001",
    name: "UK Confirmation Statement (CS01)",
    category: "compliance",
    jurisdictions: ["GB"],
    description: "Annual confirmation of company details to Companies House",
    requiredFields: ["companyNumber", "confirmationDate", "registeredOffice", "directors", "shareholders", "sicCodes"],
    optionalFields: ["pscDetails", "shareCapitalChanges"],
    outputFormat: "pdf",
    regulatoryReference: "Companies Act 2006 s.853A"
  },
  {
    id: "intl_comp_002",
    name: "Singapore Annual Return",
    category: "compliance",
    jurisdictions: ["SG"],
    description: "ACRA annual return filing",
    requiredFields: ["companyNumber", "filingYear", "registeredAddress", "directors", "shareholders", "financialStatements"],
    optionalFields: ["auditorDetails", "agmDate"],
    outputFormat: "pdf",
    regulatoryReference: "Companies Act s.197"
  },
  {
    id: "intl_comp_003",
    name: "Hong Kong Annual Return (NAR1)",
    category: "compliance",
    jurisdictions: ["HK"],
    description: "Companies Registry annual return",
    requiredFields: ["companyNumber", "registeredOffice", "directors", "secretary", "shareholders", "shareCapital"],
    optionalFields: ["chargesRegistered", "debentures"],
    outputFormat: "pdf",
    regulatoryReference: "Companies Ordinance s.662"
  },
  {
    id: "intl_comp_004",
    name: "BVI Economic Substance Declaration",
    category: "compliance",
    jurisdictions: ["VG"],
    description: "Annual economic substance declaration for BVI companies",
    requiredFields: ["companyName", "relevantActivity", "coreIncomeGeneratingActivities", "directionAndManagement", "adequateEmployees", "adequateExpenditure", "physicalPresence"],
    optionalFields: ["outsourcingArrangements", "ipAssets"],
    outputFormat: "pdf",
    regulatoryReference: "Economic Substance (Companies and Limited Partnerships) Act 2018"
  },
  {
    id: "intl_comp_005",
    name: "Cayman Economic Substance Notification",
    category: "compliance",
    jurisdictions: ["KY"],
    description: "Economic substance notification and return",
    requiredFields: ["entityName", "entityType", "relevantActivities", "ciga", "adequatePeople", "adequateExpenditure"],
    optionalFields: ["outsourcedActivities", "highRiskIP"],
    outputFormat: "pdf",
    regulatoryReference: "International Tax Co-operation (Economic Substance) Act 2018"
  },
  {
    id: "intl_comp_006",
    name: "German Handelsregister Update",
    category: "compliance",
    jurisdictions: ["DE"],
    description: "Commercial register update notification",
    requiredFields: ["companyName", "registerNumber", "changeType", "effectiveDate", "newDetails"],
    optionalFields: ["notaryCertification", "supportingDocuments"],
    outputFormat: "pdf",
    regulatoryReference: "Handelsgesetzbuch"
  }
];

// Tax Documents
const TAX_TEMPLATES: InternationalDocumentTemplate[] = [
  {
    id: "intl_tax_001",
    name: "W-8BEN-E (Entity)",
    category: "tax",
    jurisdictions: ["*"], // Universal
    description: "Certificate of foreign status of beneficial owner for US tax withholding",
    requiredFields: ["entityName", "countryOfIncorporation", "entityType", "chapter3Status", "chapter4Status", "permanentAddress", "mailingAddress", "tin"],
    optionalFields: ["giin", "treatyBenefits", "lobProvisions"],
    outputFormat: "pdf",
    regulatoryReference: "IRC Chapter 3 and 4"
  },
  {
    id: "intl_tax_002",
    name: "W-8BEN (Individual)",
    category: "tax",
    jurisdictions: ["*"],
    description: "Certificate of foreign status for individual beneficial owner",
    requiredFields: ["name", "countryOfCitizenship", "permanentAddress", "dateOfBirth", "foreignTIN"],
    optionalFields: ["usTIN", "treatyBenefits", "specialRatesConditions"],
    outputFormat: "pdf",
    regulatoryReference: "IRC Chapter 3"
  },
  {
    id: "intl_tax_003",
    name: "FATCA Self-Certification (Entity)",
    category: "tax",
    jurisdictions: ["*"],
    description: "Entity self-certification for FATCA classification",
    requiredFields: ["entityName", "countryOfIncorporation", "registeredAddress", "fatcaStatus", "giin"],
    optionalFields: ["sponsoringEntity", "ownerDocumentation"],
    outputFormat: "pdf",
    regulatoryReference: "FATCA IGA"
  },
  {
    id: "intl_tax_004",
    name: "CRS Self-Certification (Entity)",
    category: "tax",
    jurisdictions: ["*"],
    description: "Common Reporting Standard entity self-certification",
    requiredFields: ["entityName", "registeredAddress", "mailingAddress", "countryOfTaxResidence", "tin", "crsEntityType"],
    optionalFields: ["controllingPersons", "activeNFEType"],
    outputFormat: "pdf",
    regulatoryReference: "OECD CRS"
  },
  {
    id: "intl_tax_005",
    name: "CRS Self-Certification (Individual)",
    category: "tax",
    jurisdictions: ["*"],
    description: "Common Reporting Standard individual self-certification",
    requiredFields: ["name", "currentResidenceAddress", "mailingAddress", "dateOfBirth", "placeOfBirth", "countryOfTaxResidence", "tin"],
    optionalFields: ["formerResidenceAddress", "multipleTaxResidencies"],
    outputFormat: "pdf",
    regulatoryReference: "OECD CRS"
  },
  {
    id: "intl_tax_006",
    name: "UK Corporation Tax Return (CT600)",
    category: "tax",
    jurisdictions: ["GB"],
    description: "UK corporation tax return",
    requiredFields: ["companyName", "utr", "accountingPeriod", "turnover", "tradingProfits", "investmentIncome", "charitableDonations", "taxableProfit"],
    optionalFields: ["rdClaims", "groupRelief", "lossCarryForward"],
    outputFormat: "pdf",
    regulatoryReference: "Corporation Tax Act 2009"
  },
  {
    id: "intl_tax_007",
    name: "German Corporate Tax Return (KSt)",
    category: "tax",
    jurisdictions: ["DE"],
    description: "German corporation tax declaration",
    requiredFields: ["companyName", "taxNumber", "fiscalYear", "taxableIncome", "tradeIncome", "dividendsReceived"],
    optionalFields: ["lossCarryforward", "groupTaxation", "transferPricingAdjustments"],
    outputFormat: "pdf",
    regulatoryReference: "Körperschaftsteuergesetz"
  },
  {
    id: "intl_tax_008",
    name: "Singapore Corporate Tax Return (Form C-S)",
    category: "tax",
    jurisdictions: ["SG"],
    description: "Simplified corporate tax return for Singapore companies",
    requiredFields: ["companyName", "uen", "yearOfAssessment", "revenue", "adjustedProfit", "taxExemptions"],
    optionalFields: ["foreignIncome", "capitalAllowances", "donations"],
    outputFormat: "pdf",
    regulatoryReference: "Income Tax Act"
  },
  {
    id: "intl_tax_009",
    name: "Hong Kong Profits Tax Return (BIR51)",
    category: "tax",
    jurisdictions: ["HK"],
    description: "Hong Kong profits tax return",
    requiredFields: ["companyName", "businessRegistrationNumber", "assessmentYear", "assessableProfits", "offshoreIncome"],
    optionalFields: ["lossesBroughtForward", "charitableDonations", "depreciation"],
    outputFormat: "pdf",
    regulatoryReference: "Inland Revenue Ordinance"
  },
  {
    id: "intl_tax_010",
    name: "Treaty Benefit Claim Form",
    category: "treaty_claim",
    jurisdictions: ["*"],
    description: "Generic form to claim tax treaty benefits",
    requiredFields: ["claimantName", "claimantCountry", "incomeSourceCountry", "incomeType", "treatyArticle", "reducedRate", "certificationOfResidency"],
    optionalFields: ["lobCertification", "beneficialOwnershipDeclaration"],
    outputFormat: "both",
    regulatoryReference: "Applicable Tax Treaty"
  }
];

// Transfer Pricing Documents
const TRANSFER_PRICING_TEMPLATES: InternationalDocumentTemplate[] = [
  {
    id: "intl_tp_001",
    name: "Master File",
    category: "transfer_pricing",
    jurisdictions: ["*"],
    description: "OECD BEPS Action 13 Master File documentation",
    requiredFields: ["groupStructure", "businessDescription", "intangibles", "intercompanyFinancing", "financialAndTaxPositions"],
    optionalFields: ["apas", "rulings"],
    outputFormat: "both",
    regulatoryReference: "OECD BEPS Action 13"
  },
  {
    id: "intl_tp_002",
    name: "Local File",
    category: "transfer_pricing",
    jurisdictions: ["*"],
    description: "OECD BEPS Action 13 Local File documentation",
    requiredFields: ["localEntity", "controlledTransactions", "comparabilityAnalysis", "methodSelection", "financialInformation"],
    optionalFields: ["industryAnalysis", "economicAnalysis"],
    outputFormat: "both",
    regulatoryReference: "OECD BEPS Action 13"
  },
  {
    id: "intl_tp_003",
    name: "Country-by-Country Report (CbCR)",
    category: "transfer_pricing",
    jurisdictions: ["*"],
    description: "OECD BEPS Action 13 Country-by-Country Report",
    requiredFields: ["reportingEntity", "fiscalYear", "revenueByJurisdiction", "profitByJurisdiction", "taxPaidByJurisdiction", "employeesByJurisdiction", "tangibleAssetsByJurisdiction"],
    optionalFields: ["additionalInfo", "entityList"],
    outputFormat: "both",
    regulatoryReference: "OECD BEPS Action 13"
  },
  {
    id: "intl_tp_004",
    name: "Intercompany Agreement - Services",
    category: "transfer_pricing",
    jurisdictions: ["*"],
    description: "Template for intercompany services agreement",
    requiredFields: ["serviceProvider", "serviceRecipient", "servicesDescription", "pricingMethod", "paymentTerms", "term"],
    optionalFields: ["performanceMetrics", "terminationClauses", "disputeResolution"],
    outputFormat: "both"
  },
  {
    id: "intl_tp_005",
    name: "Intercompany Agreement - IP License",
    category: "transfer_pricing",
    jurisdictions: ["*"],
    description: "Template for intercompany intellectual property license",
    requiredFields: ["licensor", "licensee", "licensedIP", "territory", "royaltyRate", "paymentTerms"],
    optionalFields: ["sublicenseRights", "qualityControl", "improvements"],
    outputFormat: "both"
  },
  {
    id: "intl_tp_006",
    name: "Intercompany Loan Agreement",
    category: "transfer_pricing",
    jurisdictions: ["*"],
    description: "Template for intercompany financing arrangement",
    requiredFields: ["lender", "borrower", "principalAmount", "currency", "interestRate", "maturityDate", "repaymentSchedule"],
    optionalFields: ["security", "covenants", "prepaymentRights"],
    outputFormat: "both"
  },
  {
    id: "intl_tp_007",
    name: "Benchmarking Study",
    category: "transfer_pricing",
    jurisdictions: ["*"],
    description: "Comparability analysis and benchmarking documentation",
    requiredFields: ["testedParty", "transactionType", "searchStrategy", "comparableCompanies", "financialAnalysis", "armLengthRange"],
    optionalFields: ["rejectionMatrix", "adjustments"],
    outputFormat: "both"
  }
];

// Beneficial Ownership Documents
const BENEFICIAL_OWNERSHIP_TEMPLATES: InternationalDocumentTemplate[] = [
  {
    id: "intl_bo_001",
    name: "UK PSC Register",
    category: "beneficial_ownership",
    jurisdictions: ["GB"],
    description: "Register of People with Significant Control",
    requiredFields: ["companyName", "companyNumber", "pscDetails", "natureOfControl", "dateOfNotification"],
    optionalFields: ["relevantLegalEntity", "pscExemptions"],
    outputFormat: "pdf",
    regulatoryReference: "Companies Act 2006 Part 21A"
  },
  {
    id: "intl_bo_002",
    name: "BVI Beneficial Ownership Declaration",
    category: "beneficial_ownership",
    jurisdictions: ["VG"],
    description: "Beneficial ownership secure search system filing",
    requiredFields: ["companyName", "registrationNumber", "registeredAgent", "beneficialOwners", "registrableLegalEntities"],
    optionalFields: ["nomineeArrangements"],
    outputFormat: "pdf",
    regulatoryReference: "Beneficial Ownership Secure Search System Act 2017"
  },
  {
    id: "intl_bo_003",
    name: "Cayman Beneficial Ownership Register",
    category: "beneficial_ownership",
    jurisdictions: ["KY"],
    description: "Beneficial ownership information filing",
    requiredFields: ["companyName", "companyNumber", "beneficialOwners", "registrableLegalEntities", "nomineeDetails"],
    optionalFields: ["exemptStatus"],
    outputFormat: "pdf",
    regulatoryReference: "Companies Act (Beneficial Ownership) Regulations"
  },
  {
    id: "intl_bo_004",
    name: "EU UBO Register Filing",
    category: "beneficial_ownership",
    jurisdictions: ["DE", "NL", "IE", "FR"],
    description: "Ultimate Beneficial Owner register filing for EU jurisdictions",
    requiredFields: ["entityName", "registrationNumber", "ubos", "ownershipPercentage", "controlType"],
    optionalFields: ["indirectOwnership", "trusteeDetails"],
    outputFormat: "pdf",
    regulatoryReference: "5th Anti-Money Laundering Directive"
  },
  {
    id: "intl_bo_005",
    name: "FinCEN BOI Report",
    category: "beneficial_ownership",
    jurisdictions: ["US"],
    description: "Beneficial Ownership Information Report for US entities",
    requiredFields: ["reportingCompany", "companyApplicants", "beneficialOwners", "identificationDocuments"],
    optionalFields: ["finCENIdentifier", "exemptCompanyType"],
    outputFormat: "pdf",
    regulatoryReference: "Corporate Transparency Act"
  }
];

// Banking Documents
const BANKING_TEMPLATES: InternationalDocumentTemplate[] = [
  {
    id: "intl_bank_001",
    name: "Corporate Bank Account Opening",
    category: "banking",
    jurisdictions: ["*"],
    description: "Standard corporate bank account application",
    requiredFields: ["companyName", "registrationNumber", "registeredAddress", "directors", "shareholders", "authorizedSignatories", "expectedActivity"],
    optionalFields: ["sourceOfFunds", "expectedTurnover", "tradingCountries"],
    outputFormat: "both"
  },
  {
    id: "intl_bank_002",
    name: "Board Resolution - Bank Account",
    category: "banking",
    jurisdictions: ["*"],
    description: "Board resolution authorizing bank account opening",
    requiredFields: ["companyName", "meetingDate", "bankName", "accountType", "authorizedSignatories", "signingAuthority"],
    optionalFields: ["transactionLimits", "onlineBankingAccess"],
    outputFormat: "both"
  },
  {
    id: "intl_bank_003",
    name: "Certificate of Incumbency",
    category: "banking",
    jurisdictions: ["*"],
    description: "Certificate confirming current officers and directors",
    requiredFields: ["companyName", "registrationNumber", "jurisdiction", "directors", "officers", "authorizedSignatories", "certificationDate"],
    optionalFields: ["shareholders", "registeredAgent"],
    outputFormat: "pdf"
  },
  {
    id: "intl_bank_004",
    name: "Letter of Good Standing",
    category: "banking",
    jurisdictions: ["*"],
    description: "Request for certificate of good standing",
    requiredFields: ["companyName", "registrationNumber", "jurisdiction", "requestPurpose"],
    optionalFields: ["apostilleRequired", "expeditedProcessing"],
    outputFormat: "pdf"
  },
  {
    id: "intl_bank_005",
    name: "Source of Funds Declaration",
    category: "banking",
    jurisdictions: ["*"],
    description: "Declaration of source of funds for banking compliance",
    requiredFields: ["declarantName", "companyName", "fundsSource", "fundsAmount", "supportingDocumentation"],
    optionalFields: ["businessActivity", "expectedTransactions"],
    outputFormat: "both"
  }
];

// Combine all templates
export const ALL_INTERNATIONAL_TEMPLATES: InternationalDocumentTemplate[] = [
  ...FORMATION_TEMPLATES,
  ...COMPLIANCE_TEMPLATES,
  ...TAX_TEMPLATES,
  ...TRANSFER_PRICING_TEMPLATES,
  ...BENEFICIAL_OWNERSHIP_TEMPLATES,
  ...BANKING_TEMPLATES
];

// Service Functions

/**
 * Get all international document templates
 */
export function getAllTemplates(): InternationalDocumentTemplate[] {
  return ALL_INTERNATIONAL_TEMPLATES;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: InternationalDocumentCategory): InternationalDocumentTemplate[] {
  return ALL_INTERNATIONAL_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by jurisdiction
 */
export function getTemplatesByJurisdiction(jurisdictionCode: string): InternationalDocumentTemplate[] {
  return ALL_INTERNATIONAL_TEMPLATES.filter(
    t => t.jurisdictions.includes(jurisdictionCode) || t.jurisdictions.includes("*")
  );
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): InternationalDocumentTemplate | null {
  return ALL_INTERNATIONAL_TEMPLATES.find(t => t.id === templateId) || null;
}

/**
 * Search templates
 */
export function searchTemplates(query: string): InternationalDocumentTemplate[] {
  const lowerQuery = query.toLowerCase();
  return ALL_INTERNATIONAL_TEMPLATES.filter(
    t => t.name.toLowerCase().includes(lowerQuery) ||
         t.description.toLowerCase().includes(lowerQuery) ||
         t.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get formation templates for jurisdiction
 */
export function getFormationTemplates(jurisdictionCode: string): InternationalDocumentTemplate[] {
  return FORMATION_TEMPLATES.filter(
    t => t.jurisdictions.includes(jurisdictionCode) || t.jurisdictions.includes("*")
  );
}

/**
 * Get compliance templates for jurisdiction
 */
export function getComplianceTemplates(jurisdictionCode: string): InternationalDocumentTemplate[] {
  return COMPLIANCE_TEMPLATES.filter(
    t => t.jurisdictions.includes(jurisdictionCode) || t.jurisdictions.includes("*")
  );
}

/**
 * Get tax templates for jurisdiction
 */
export function getTaxTemplates(jurisdictionCode: string): InternationalDocumentTemplate[] {
  return TAX_TEMPLATES.filter(
    t => t.jurisdictions.includes(jurisdictionCode) || t.jurisdictions.includes("*")
  );
}

/**
 * Get transfer pricing templates
 */
export function getTransferPricingTemplates(): InternationalDocumentTemplate[] {
  return TRANSFER_PRICING_TEMPLATES;
}

/**
 * Get beneficial ownership templates for jurisdiction
 */
export function getBeneficialOwnershipTemplates(jurisdictionCode: string): InternationalDocumentTemplate[] {
  return BENEFICIAL_OWNERSHIP_TEMPLATES.filter(
    t => t.jurisdictions.includes(jurisdictionCode) || t.jurisdictions.includes("*")
  );
}

/**
 * Get banking templates
 */
export function getBankingTemplates(): InternationalDocumentTemplate[] {
  return BANKING_TEMPLATES;
}

/**
 * Generate document from template with data
 */
export function generateDocumentFromTemplate(
  templateId: string,
  data: Record<string, unknown>
): {
  success: boolean;
  documentId?: string;
  missingFields?: string[];
  document?: {
    templateId: string;
    templateName: string;
    generatedAt: string;
    data: Record<string, unknown>;
    status: "draft" | "complete";
  };
} {
  const template = getTemplateById(templateId);
  if (!template) {
    return { success: false, missingFields: ["Template not found"] };
  }

  // Check required fields
  const missingFields = template.requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    return { success: false, missingFields };
  }

  return {
    success: true,
    documentId: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    document: {
      templateId,
      templateName: template.name,
      generatedAt: new Date().toISOString(),
      data,
      status: "complete"
    }
  };
}

/**
 * Get template statistics
 */
export function getTemplateStatistics(): {
  totalTemplates: number;
  byCategory: Record<string, number>;
  byJurisdiction: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  const byJurisdiction: Record<string, number> = {};

  for (const template of ALL_INTERNATIONAL_TEMPLATES) {
    byCategory[template.category] = (byCategory[template.category] || 0) + 1;
    for (const jurisdiction of template.jurisdictions) {
      byJurisdiction[jurisdiction] = (byJurisdiction[jurisdiction] || 0) + 1;
    }
  }

  return {
    totalTemplates: ALL_INTERNATIONAL_TEMPLATES.length,
    byCategory,
    byJurisdiction
  };
}

/**
 * Validate document data against template
 */
export function validateDocumentData(
  templateId: string,
  data: Record<string, unknown>
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const template = getTemplateById(templateId);
  if (!template) {
    return { isValid: false, errors: ["Template not found"], warnings: [] };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  for (const field of template.requiredFields) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check for unknown fields
  const allFields = [...template.requiredFields, ...template.optionalFields];
  for (const key of Object.keys(data)) {
    if (!allFields.includes(key)) {
      warnings.push(`Unknown field: ${key}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
