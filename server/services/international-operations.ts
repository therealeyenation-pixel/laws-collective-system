/**
 * International Operations & Multi-Jurisdictional Compliance Service
 * Phase 51: Support for foreign subsidiaries, international trusts, and global compliance
 */

// International Entity Types
export type InternationalEntityType =
  | "uk_ltd"           // UK Private Limited Company
  | "uk_plc"           // UK Public Limited Company
  | "eu_gmbh"          // German GmbH
  | "eu_sarl"          // French SARL
  | "eu_bv"            // Dutch BV
  | "eu_ag"            // Swiss AG
  | "offshore_nevis"   // Nevis LLC
  | "offshore_cook"    // Cook Islands Trust
  | "offshore_cayman"  // Cayman Islands Company
  | "offshore_bvi"     // British Virgin Islands Company
  | "canada_corp"      // Canadian Corporation
  | "australia_pty"    // Australian Pty Ltd
  | "singapore_pte"    // Singapore Pte Ltd
  | "hong_kong_ltd"    // Hong Kong Limited
  | "ireland_ltd"      // Irish Limited Company
  | "panama_sa"        // Panama S.A.
  | "foreign_charity"  // Foreign Charitable Organization
  | "foreign_trust";   // Foreign Trust Structure

export interface InternationalEntity {
  id: string;
  name: string;
  entityType: InternationalEntityType;
  jurisdiction: string;
  jurisdictionCode: string;
  registrationNumber?: string;
  registrationDate?: string;
  status: "active" | "pending" | "dissolved" | "suspended";
  parentEntityId?: string;
  taxResidency: string[];
  reportingObligations: string[];
  localAgent?: {
    name: string;
    address: string;
    contact: string;
  };
  registeredAddress: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  directors: Array<{
    name: string;
    nationality: string;
    residency: string;
    appointmentDate: string;
  }>;
  shareholders?: Array<{
    name: string;
    ownershipPercent: number;
    entityType: "individual" | "corporate";
  }>;
  annualFilingDates: Array<{
    filingType: string;
    dueDate: string;
    jurisdiction: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Jurisdiction Information
export interface JurisdictionInfo {
  code: string;
  name: string;
  region: "europe" | "americas" | "asia_pacific" | "caribbean" | "middle_east" | "africa";
  currency: string;
  corporateTaxRate: number;
  vatRate?: number;
  witholdingTaxRate?: number;
  treatyCountries: string[];
  reportingRequirements: string[];
  formationCost: {
    min: number;
    max: number;
    currency: string;
  };
  annualMaintenance: {
    min: number;
    max: number;
    currency: string;
  };
  minimumCapital?: {
    amount: number;
    currency: string;
  };
  localDirectorRequired: boolean;
  localSecretaryRequired: boolean;
  publicRegistry: boolean;
  exchangeOfInfoAgreements: string[];
}

// Tax Treaty Information
export interface TaxTreaty {
  country1: string;
  country2: string;
  effectiveDate: string;
  dividendRate: number;
  interestRate: number;
  royaltyRate: number;
  capitalGainsExempt: boolean;
  permanentEstablishmentDays: number;
  limitationOnBenefits: boolean;
  exchangeOfInfo: boolean;
  arbitrationClause: boolean;
}

// Compliance Requirements
export interface ComplianceRequirement {
  id: string;
  jurisdiction: string;
  requirementType: "fatca" | "crs" | "fbar" | "beneficial_ownership" | "annual_return" | "tax_filing" | "audit" | "transfer_pricing";
  description: string;
  dueDate?: string;
  frequency: "annual" | "quarterly" | "monthly" | "one_time" | "event_driven";
  penaltyForNonCompliance: string;
  applicableEntityTypes: InternationalEntityType[];
  documentationRequired: string[];
}

// FATCA Reporting
export interface FATCAReport {
  id: string;
  reportingYear: number;
  reportingEntityId: string;
  reportingEntityName: string;
  giin: string; // Global Intermediary Identification Number
  accountHolders: Array<{
    name: string;
    tin: string; // Tax Identification Number
    address: string;
    accountNumber: string;
    accountBalance: number;
    currency: string;
    grossDividends?: number;
    grossInterest?: number;
    grossProceeds?: number;
  }>;
  submissionDate?: string;
  status: "draft" | "submitted" | "accepted" | "rejected";
  createdAt: string;
}

// CRS (Common Reporting Standard) Report
export interface CRSReport {
  id: string;
  reportingYear: number;
  reportingEntityId: string;
  reportingJurisdiction: string;
  receivingJurisdictions: string[];
  reportableAccounts: Array<{
    accountHolderName: string;
    accountHolderType: "individual" | "entity";
    tin: string;
    tinJurisdiction: string;
    birthDate?: string;
    birthPlace?: string;
    address: string;
    accountNumber: string;
    accountBalance: number;
    currency: string;
    paymentAmounts: {
      dividends?: number;
      interest?: number;
      grossProceeds?: number;
      other?: number;
    };
  }>;
  submissionDate?: string;
  status: "draft" | "submitted" | "accepted" | "rejected";
  createdAt: string;
}

// FBAR (Foreign Bank Account Report)
export interface FBARReport {
  id: string;
  reportingYear: number;
  filerName: string;
  filerTin: string;
  filerAddress: string;
  foreignAccounts: Array<{
    financialInstitution: string;
    institutionAddress: string;
    accountNumber: string;
    accountType: "bank" | "securities" | "other";
    currency: string;
    maxValueDuringYear: number;
    maxValueUSD: number;
    jointOwners?: string[];
  }>;
  aggregateMaxValue: number;
  filingDeadline: string;
  submissionDate?: string;
  status: "draft" | "submitted" | "accepted" | "rejected";
  createdAt: string;
}

// Jurisdiction Database
const JURISDICTIONS: Record<string, JurisdictionInfo> = {
  "GB": {
    code: "GB",
    name: "United Kingdom",
    region: "europe",
    currency: "GBP",
    corporateTaxRate: 25,
    vatRate: 20,
    witholdingTaxRate: 20,
    treatyCountries: ["US", "DE", "FR", "NL", "IE", "CH", "SG", "HK", "AU", "CA"],
    reportingRequirements: ["annual_return", "confirmation_statement", "accounts", "corporation_tax"],
    formationCost: { min: 50, max: 500, currency: "GBP" },
    annualMaintenance: { min: 200, max: 2000, currency: "GBP" },
    minimumCapital: { amount: 1, currency: "GBP" },
    localDirectorRequired: false,
    localSecretaryRequired: false,
    publicRegistry: true,
    exchangeOfInfoAgreements: ["FATCA", "CRS", "EU_DAC"]
  },
  "DE": {
    code: "DE",
    name: "Germany",
    region: "europe",
    currency: "EUR",
    corporateTaxRate: 30,
    vatRate: 19,
    witholdingTaxRate: 25,
    treatyCountries: ["US", "GB", "FR", "NL", "CH", "AT", "IT", "ES", "PL", "CZ"],
    reportingRequirements: ["handelsregister", "jahresabschluss", "steuererklarung"],
    formationCost: { min: 2000, max: 10000, currency: "EUR" },
    annualMaintenance: { min: 1000, max: 5000, currency: "EUR" },
    minimumCapital: { amount: 25000, currency: "EUR" },
    localDirectorRequired: false,
    localSecretaryRequired: false,
    publicRegistry: true,
    exchangeOfInfoAgreements: ["FATCA", "CRS", "EU_DAC"]
  },
  "NL": {
    code: "NL",
    name: "Netherlands",
    region: "europe",
    currency: "EUR",
    corporateTaxRate: 25.8,
    vatRate: 21,
    witholdingTaxRate: 15,
    treatyCountries: ["US", "GB", "DE", "FR", "BE", "LU", "CH", "SG", "HK", "JP"],
    reportingRequirements: ["kvk_filing", "annual_accounts", "corporate_tax"],
    formationCost: { min: 1500, max: 5000, currency: "EUR" },
    annualMaintenance: { min: 500, max: 3000, currency: "EUR" },
    minimumCapital: { amount: 0.01, currency: "EUR" },
    localDirectorRequired: false,
    localSecretaryRequired: false,
    publicRegistry: true,
    exchangeOfInfoAgreements: ["FATCA", "CRS", "EU_DAC"]
  },
  "IE": {
    code: "IE",
    name: "Ireland",
    region: "europe",
    currency: "EUR",
    corporateTaxRate: 12.5,
    vatRate: 23,
    witholdingTaxRate: 20,
    treatyCountries: ["US", "GB", "DE", "FR", "NL", "CH", "SG", "HK", "AU", "CA"],
    reportingRequirements: ["cro_annual_return", "corporation_tax", "vat_return"],
    formationCost: { min: 500, max: 2000, currency: "EUR" },
    annualMaintenance: { min: 300, max: 1500, currency: "EUR" },
    localDirectorRequired: true,
    localSecretaryRequired: true,
    publicRegistry: true,
    exchangeOfInfoAgreements: ["FATCA", "CRS", "EU_DAC"]
  },
  "SG": {
    code: "SG",
    name: "Singapore",
    region: "asia_pacific",
    currency: "SGD",
    corporateTaxRate: 17,
    vatRate: 8,
    witholdingTaxRate: 15,
    treatyCountries: ["US", "GB", "DE", "FR", "NL", "CH", "HK", "AU", "JP", "CN"],
    reportingRequirements: ["acra_annual_return", "corporate_tax", "gst_return"],
    formationCost: { min: 500, max: 3000, currency: "SGD" },
    annualMaintenance: { min: 1000, max: 5000, currency: "SGD" },
    minimumCapital: { amount: 1, currency: "SGD" },
    localDirectorRequired: true,
    localSecretaryRequired: true,
    publicRegistry: true,
    exchangeOfInfoAgreements: ["FATCA", "CRS"]
  },
  "HK": {
    code: "HK",
    name: "Hong Kong",
    region: "asia_pacific",
    currency: "HKD",
    corporateTaxRate: 16.5,
    vatRate: 0,
    witholdingTaxRate: 0,
    treatyCountries: ["CN", "GB", "FR", "NL", "BE", "LU", "CH", "SG", "JP", "KR"],
    reportingRequirements: ["annual_return", "profits_tax", "employer_return"],
    formationCost: { min: 1000, max: 5000, currency: "HKD" },
    annualMaintenance: { min: 2000, max: 10000, currency: "HKD" },
    minimumCapital: { amount: 1, currency: "HKD" },
    localDirectorRequired: false,
    localSecretaryRequired: true,
    publicRegistry: true,
    exchangeOfInfoAgreements: ["FATCA", "CRS"]
  },
  "KY": {
    code: "KY",
    name: "Cayman Islands",
    region: "caribbean",
    currency: "KYD",
    corporateTaxRate: 0,
    witholdingTaxRate: 0,
    treatyCountries: [],
    reportingRequirements: ["annual_return", "economic_substance"],
    formationCost: { min: 2000, max: 10000, currency: "USD" },
    annualMaintenance: { min: 2500, max: 15000, currency: "USD" },
    localDirectorRequired: false,
    localSecretaryRequired: false,
    publicRegistry: false,
    exchangeOfInfoAgreements: ["FATCA", "CRS"]
  },
  "VG": {
    code: "VG",
    name: "British Virgin Islands",
    region: "caribbean",
    currency: "USD",
    corporateTaxRate: 0,
    witholdingTaxRate: 0,
    treatyCountries: [],
    reportingRequirements: ["annual_return", "economic_substance", "beneficial_ownership"],
    formationCost: { min: 1000, max: 5000, currency: "USD" },
    annualMaintenance: { min: 1500, max: 8000, currency: "USD" },
    localDirectorRequired: false,
    localSecretaryRequired: false,
    publicRegistry: false,
    exchangeOfInfoAgreements: ["FATCA", "CRS"]
  },
  "KN": {
    code: "KN",
    name: "Nevis (St. Kitts and Nevis)",
    region: "caribbean",
    currency: "XCD",
    corporateTaxRate: 0,
    witholdingTaxRate: 0,
    treatyCountries: [],
    reportingRequirements: ["annual_return"],
    formationCost: { min: 1500, max: 5000, currency: "USD" },
    annualMaintenance: { min: 1000, max: 3000, currency: "USD" },
    localDirectorRequired: false,
    localSecretaryRequired: false,
    publicRegistry: false,
    exchangeOfInfoAgreements: []
  },
  "CK": {
    code: "CK",
    name: "Cook Islands",
    region: "asia_pacific",
    currency: "NZD",
    corporateTaxRate: 0,
    witholdingTaxRate: 0,
    treatyCountries: [],
    reportingRequirements: ["annual_return"],
    formationCost: { min: 3000, max: 10000, currency: "USD" },
    annualMaintenance: { min: 2000, max: 8000, currency: "USD" },
    localDirectorRequired: false,
    localSecretaryRequired: false,
    publicRegistry: false,
    exchangeOfInfoAgreements: ["CRS"]
  },
  "PA": {
    code: "PA",
    name: "Panama",
    region: "americas",
    currency: "USD",
    corporateTaxRate: 25,
    witholdingTaxRate: 10,
    treatyCountries: ["ES", "MX", "NL", "GB", "FR", "IT", "KR", "SG", "AE", "QA"],
    reportingRequirements: ["annual_return", "beneficial_ownership"],
    formationCost: { min: 1000, max: 3000, currency: "USD" },
    annualMaintenance: { min: 500, max: 2000, currency: "USD" },
    localDirectorRequired: false,
    localSecretaryRequired: false,
    publicRegistry: false,
    exchangeOfInfoAgreements: ["CRS"]
  },
  "CH": {
    code: "CH",
    name: "Switzerland",
    region: "europe",
    currency: "CHF",
    corporateTaxRate: 14.9,
    vatRate: 7.7,
    witholdingTaxRate: 35,
    treatyCountries: ["US", "GB", "DE", "FR", "NL", "IT", "AT", "SG", "HK", "JP"],
    reportingRequirements: ["handelsregister", "jahresrechnung", "steuererklarung"],
    formationCost: { min: 5000, max: 20000, currency: "CHF" },
    annualMaintenance: { min: 2000, max: 10000, currency: "CHF" },
    minimumCapital: { amount: 100000, currency: "CHF" },
    localDirectorRequired: true,
    localSecretaryRequired: false,
    publicRegistry: true,
    exchangeOfInfoAgreements: ["FATCA", "CRS"]
  }
};

// Tax Treaty Database (sample treaties)
const TAX_TREATIES: TaxTreaty[] = [
  {
    country1: "US",
    country2: "GB",
    effectiveDate: "2003-03-31",
    dividendRate: 15,
    interestRate: 0,
    royaltyRate: 0,
    capitalGainsExempt: true,
    permanentEstablishmentDays: 183,
    limitationOnBenefits: true,
    exchangeOfInfo: true,
    arbitrationClause: true
  },
  {
    country1: "US",
    country2: "DE",
    effectiveDate: "1990-08-21",
    dividendRate: 15,
    interestRate: 0,
    royaltyRate: 0,
    capitalGainsExempt: true,
    permanentEstablishmentDays: 183,
    limitationOnBenefits: true,
    exchangeOfInfo: true,
    arbitrationClause: false
  },
  {
    country1: "US",
    country2: "NL",
    effectiveDate: "1993-12-31",
    dividendRate: 15,
    interestRate: 0,
    royaltyRate: 0,
    capitalGainsExempt: true,
    permanentEstablishmentDays: 183,
    limitationOnBenefits: true,
    exchangeOfInfo: true,
    arbitrationClause: true
  },
  {
    country1: "US",
    country2: "IE",
    effectiveDate: "1998-01-01",
    dividendRate: 15,
    interestRate: 0,
    royaltyRate: 0,
    capitalGainsExempt: true,
    permanentEstablishmentDays: 183,
    limitationOnBenefits: true,
    exchangeOfInfo: true,
    arbitrationClause: false
  },
  {
    country1: "US",
    country2: "SG",
    effectiveDate: "1996-01-01",
    dividendRate: 15,
    interestRate: 0,
    royaltyRate: 0,
    capitalGainsExempt: true,
    permanentEstablishmentDays: 183,
    limitationOnBenefits: true,
    exchangeOfInfo: true,
    arbitrationClause: false
  },
  {
    country1: "US",
    country2: "CH",
    effectiveDate: "1998-01-01",
    dividendRate: 15,
    interestRate: 0,
    royaltyRate: 0,
    capitalGainsExempt: true,
    permanentEstablishmentDays: 183,
    limitationOnBenefits: true,
    exchangeOfInfo: true,
    arbitrationClause: true
  },
  {
    country1: "GB",
    country2: "DE",
    effectiveDate: "2010-12-30",
    dividendRate: 10,
    interestRate: 0,
    royaltyRate: 0,
    capitalGainsExempt: true,
    permanentEstablishmentDays: 183,
    limitationOnBenefits: false,
    exchangeOfInfo: true,
    arbitrationClause: true
  },
  {
    country1: "GB",
    country2: "NL",
    effectiveDate: "2011-03-25",
    dividendRate: 10,
    interestRate: 0,
    royaltyRate: 0,
    capitalGainsExempt: true,
    permanentEstablishmentDays: 183,
    limitationOnBenefits: false,
    exchangeOfInfo: true,
    arbitrationClause: true
  }
];

// Service Functions

/**
 * Get all available jurisdictions
 */
export function getJurisdictions(): JurisdictionInfo[] {
  return Object.values(JURISDICTIONS);
}

/**
 * Get jurisdiction by code
 */
export function getJurisdiction(code: string): JurisdictionInfo | null {
  return JURISDICTIONS[code] || null;
}

/**
 * Get jurisdictions by region
 */
export function getJurisdictionsByRegion(region: JurisdictionInfo["region"]): JurisdictionInfo[] {
  return Object.values(JURISDICTIONS).filter(j => j.region === region);
}

/**
 * Get tax-favorable jurisdictions (corporate tax < 15%)
 */
export function getTaxFavorableJurisdictions(): JurisdictionInfo[] {
  return Object.values(JURISDICTIONS).filter(j => j.corporateTaxRate < 15);
}

/**
 * Get tax treaty between two countries
 */
export function getTaxTreaty(country1: string, country2: string): TaxTreaty | null {
  return TAX_TREATIES.find(
    t => (t.country1 === country1 && t.country2 === country2) ||
         (t.country1 === country2 && t.country2 === country1)
  ) || null;
}

/**
 * Get all tax treaties for a country
 */
export function getTaxTreatiesForCountry(countryCode: string): TaxTreaty[] {
  return TAX_TREATIES.filter(
    t => t.country1 === countryCode || t.country2 === countryCode
  );
}

/**
 * Calculate withholding tax rate considering treaty
 */
export function calculateWithholdingRate(
  sourceCountry: string,
  recipientCountry: string,
  incomeType: "dividend" | "interest" | "royalty"
): number {
  const treaty = getTaxTreaty(sourceCountry, recipientCountry);
  const sourceJurisdiction = getJurisdiction(sourceCountry);
  
  if (treaty) {
    switch (incomeType) {
      case "dividend": return treaty.dividendRate;
      case "interest": return treaty.interestRate;
      case "royalty": return treaty.royaltyRate;
    }
  }
  
  // Fall back to domestic rate
  return sourceJurisdiction?.witholdingTaxRate || 30;
}

/**
 * Create a new international entity
 */
export function createInternationalEntity(
  name: string,
  entityType: InternationalEntityType,
  jurisdictionCode: string,
  details: Partial<InternationalEntity>
): InternationalEntity {
  const jurisdiction = getJurisdiction(jurisdictionCode);
  if (!jurisdiction) {
    throw new Error(`Unknown jurisdiction: ${jurisdictionCode}`);
  }

  const now = new Date().toISOString();
  
  return {
    id: `intl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    entityType,
    jurisdiction: jurisdiction.name,
    jurisdictionCode,
    status: "pending",
    taxResidency: [jurisdictionCode],
    reportingObligations: jurisdiction.reportingRequirements,
    registeredAddress: details.registeredAddress || {
      street: "",
      city: "",
      postalCode: "",
      country: jurisdiction.name
    },
    directors: details.directors || [],
    shareholders: details.shareholders,
    annualFilingDates: generateAnnualFilingDates(jurisdictionCode, entityType),
    createdAt: now,
    updatedAt: now,
    ...details
  };
}

/**
 * Generate annual filing dates based on jurisdiction
 */
function generateAnnualFilingDates(
  jurisdictionCode: string,
  _entityType: InternationalEntityType
): InternationalEntity["annualFilingDates"] {
  const dates: InternationalEntity["annualFilingDates"] = [];
  const currentYear = new Date().getFullYear();
  
  switch (jurisdictionCode) {
    case "GB":
      dates.push(
        { filingType: "Confirmation Statement", dueDate: `${currentYear}-12-31`, jurisdiction: "GB" },
        { filingType: "Annual Accounts", dueDate: `${currentYear}-09-30`, jurisdiction: "GB" },
        { filingType: "Corporation Tax Return", dueDate: `${currentYear}-12-31`, jurisdiction: "GB" }
      );
      break;
    case "DE":
      dates.push(
        { filingType: "Jahresabschluss", dueDate: `${currentYear}-12-31`, jurisdiction: "DE" },
        { filingType: "Körperschaftsteuererklärung", dueDate: `${currentYear}-07-31`, jurisdiction: "DE" }
      );
      break;
    case "SG":
      dates.push(
        { filingType: "Annual Return", dueDate: `${currentYear}-11-30`, jurisdiction: "SG" },
        { filingType: "Corporate Tax Filing", dueDate: `${currentYear}-11-30`, jurisdiction: "SG" }
      );
      break;
    case "HK":
      dates.push(
        { filingType: "Annual Return", dueDate: `${currentYear}-04-30`, jurisdiction: "HK" },
        { filingType: "Profits Tax Return", dueDate: `${currentYear}-04-30`, jurisdiction: "HK" }
      );
      break;
    default:
      dates.push(
        { filingType: "Annual Return", dueDate: `${currentYear}-12-31`, jurisdiction: jurisdictionCode }
      );
  }
  
  return dates;
}

/**
 * Get compliance requirements for an entity
 */
export function getComplianceRequirements(
  entity: InternationalEntity,
  usPersonInvolved: boolean = false
): ComplianceRequirement[] {
  const requirements: ComplianceRequirement[] = [];
  const jurisdiction = getJurisdiction(entity.jurisdictionCode);
  
  if (!jurisdiction) return requirements;
  
  // FATCA requirements (if US person involved)
  if (usPersonInvolved || jurisdiction.exchangeOfInfoAgreements.includes("FATCA")) {
    requirements.push({
      id: `fatca_${entity.id}`,
      jurisdiction: entity.jurisdictionCode,
      requirementType: "fatca",
      description: "FATCA reporting for US account holders",
      frequency: "annual",
      penaltyForNonCompliance: "30% withholding on US-source payments",
      applicableEntityTypes: [entity.entityType],
      documentationRequired: ["W-8BEN-E", "FATCA Report", "Account holder information"]
    });
  }
  
  // CRS requirements
  if (jurisdiction.exchangeOfInfoAgreements.includes("CRS")) {
    requirements.push({
      id: `crs_${entity.id}`,
      jurisdiction: entity.jurisdictionCode,
      requirementType: "crs",
      description: "Common Reporting Standard compliance",
      frequency: "annual",
      penaltyForNonCompliance: "Varies by jurisdiction",
      applicableEntityTypes: [entity.entityType],
      documentationRequired: ["CRS Self-Certification", "Account holder documentation"]
    });
  }
  
  // Annual return requirements
  requirements.push({
    id: `annual_${entity.id}`,
    jurisdiction: entity.jurisdictionCode,
    requirementType: "annual_return",
    description: `Annual return filing in ${jurisdiction.name}`,
    frequency: "annual",
    penaltyForNonCompliance: "Late filing penalties and potential strike-off",
    applicableEntityTypes: [entity.entityType],
    documentationRequired: ["Annual return form", "Director/shareholder information"]
  });
  
  // Beneficial ownership (if applicable)
  if (!jurisdiction.publicRegistry) {
    requirements.push({
      id: `bo_${entity.id}`,
      jurisdiction: entity.jurisdictionCode,
      requirementType: "beneficial_ownership",
      description: "Beneficial ownership register maintenance",
      frequency: "event_driven",
      penaltyForNonCompliance: "Fines and potential criminal liability",
      applicableEntityTypes: [entity.entityType],
      documentationRequired: ["Beneficial ownership declaration", "Identity verification"]
    });
  }
  
  return requirements;
}

/**
 * Create FATCA report
 */
export function createFATCAReport(
  reportingEntityId: string,
  reportingEntityName: string,
  giin: string,
  reportingYear: number
): FATCAReport {
  return {
    id: `fatca_${Date.now()}`,
    reportingYear,
    reportingEntityId,
    reportingEntityName,
    giin,
    accountHolders: [],
    status: "draft",
    createdAt: new Date().toISOString()
  };
}

/**
 * Add account holder to FATCA report
 */
export function addFATCAAccountHolder(
  report: FATCAReport,
  accountHolder: FATCAReport["accountHolders"][0]
): FATCAReport {
  return {
    ...report,
    accountHolders: [...report.accountHolders, accountHolder]
  };
}

/**
 * Create CRS report
 */
export function createCRSReport(
  reportingEntityId: string,
  reportingJurisdiction: string,
  receivingJurisdictions: string[],
  reportingYear: number
): CRSReport {
  return {
    id: `crs_${Date.now()}`,
    reportingYear,
    reportingEntityId,
    reportingJurisdiction,
    receivingJurisdictions,
    reportableAccounts: [],
    status: "draft",
    createdAt: new Date().toISOString()
  };
}

/**
 * Add reportable account to CRS report
 */
export function addCRSReportableAccount(
  report: CRSReport,
  account: CRSReport["reportableAccounts"][0]
): CRSReport {
  return {
    ...report,
    reportableAccounts: [...report.reportableAccounts, account]
  };
}

/**
 * Create FBAR report
 */
export function createFBARReport(
  filerName: string,
  filerTin: string,
  filerAddress: string,
  reportingYear: number
): FBARReport {
  const filingDeadline = `${reportingYear + 1}-04-15`;
  
  return {
    id: `fbar_${Date.now()}`,
    reportingYear,
    filerName,
    filerTin,
    filerAddress,
    foreignAccounts: [],
    aggregateMaxValue: 0,
    filingDeadline,
    status: "draft",
    createdAt: new Date().toISOString()
  };
}

/**
 * Add foreign account to FBAR report
 */
export function addFBARForeignAccount(
  report: FBARReport,
  account: FBARReport["foreignAccounts"][0]
): FBARReport {
  const updatedAccounts = [...report.foreignAccounts, account];
  const aggregateMaxValue = updatedAccounts.reduce((sum, acc) => sum + acc.maxValueUSD, 0);
  
  return {
    ...report,
    foreignAccounts: updatedAccounts,
    aggregateMaxValue
  };
}

/**
 * Check if FBAR filing is required
 */
export function isFBARRequired(aggregateMaxValue: number): boolean {
  return aggregateMaxValue > 10000;
}

/**
 * Generate compliance calendar for entity
 */
export function generateComplianceCalendar(
  entity: InternationalEntity,
  year: number
): Array<{
  date: string;
  filingType: string;
  jurisdiction: string;
  description: string;
  priority: "high" | "medium" | "low";
}> {
  const calendar: Array<{
    date: string;
    filingType: string;
    jurisdiction: string;
    description: string;
    priority: "high" | "medium" | "low";
  }> = [];
  
  // Add annual filing dates
  for (const filing of entity.annualFilingDates) {
    calendar.push({
      date: filing.dueDate.replace(/^\d{4}/, String(year)),
      filingType: filing.filingType,
      jurisdiction: filing.jurisdiction,
      description: `${filing.filingType} due for ${entity.name}`,
      priority: "high"
    });
  }
  
  // Add FATCA deadline (March 31)
  calendar.push({
    date: `${year}-03-31`,
    filingType: "FATCA Report",
    jurisdiction: "US",
    description: "FATCA reporting deadline",
    priority: "high"
  });
  
  // Add CRS deadline (varies, typically end of May)
  calendar.push({
    date: `${year}-05-31`,
    filingType: "CRS Report",
    jurisdiction: entity.jurisdictionCode,
    description: "CRS reporting deadline",
    priority: "high"
  });
  
  // Add FBAR deadline (April 15, auto-extension to October 15)
  calendar.push({
    date: `${year}-04-15`,
    filingType: "FBAR",
    jurisdiction: "US",
    description: "FBAR filing deadline (auto-extension to Oct 15)",
    priority: "medium"
  });
  
  // Sort by date
  return calendar.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Validate entity structure for compliance
 */
export function validateEntityCompliance(
  entity: InternationalEntity
): {
  isCompliant: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const jurisdiction = getJurisdiction(entity.jurisdictionCode);
  
  if (!jurisdiction) {
    return {
      isCompliant: false,
      issues: ["Unknown jurisdiction"],
      recommendations: ["Verify jurisdiction code"]
    };
  }
  
  // Check director requirements
  if (jurisdiction.localDirectorRequired && !entity.directors.some(d => d.residency === entity.jurisdictionCode)) {
    issues.push(`${jurisdiction.name} requires at least one local director`);
    recommendations.push("Appoint a local director or use a nominee director service");
  }
  
  // Check registered address
  if (!entity.registeredAddress.street || !entity.registeredAddress.city) {
    issues.push("Incomplete registered address");
    recommendations.push("Provide complete registered address in jurisdiction");
  }
  
  // Check registration number
  if (entity.status === "active" && !entity.registrationNumber) {
    issues.push("Active entity missing registration number");
    recommendations.push("Update entity with official registration number");
  }
  
  // Check annual filings
  const now = new Date();
  const overdueFilings = entity.annualFilingDates.filter(f => new Date(f.dueDate) < now);
  if (overdueFilings.length > 0) {
    issues.push(`${overdueFilings.length} overdue filing(s)`);
    recommendations.push("File overdue returns immediately to avoid penalties");
  }
  
  return {
    isCompliant: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Get entity formation requirements
 */
export function getFormationRequirements(
  entityType: InternationalEntityType,
  jurisdictionCode: string
): {
  documents: string[];
  minimumCapital?: { amount: number; currency: string };
  localRequirements: string[];
  estimatedTimeline: string;
  estimatedCost: { min: number; max: number; currency: string };
} {
  const jurisdiction = getJurisdiction(jurisdictionCode);
  if (!jurisdiction) {
    throw new Error(`Unknown jurisdiction: ${jurisdictionCode}`);
  }
  
  const documents: string[] = [
    "Memorandum and Articles of Association",
    "Director identification documents",
    "Shareholder identification documents",
    "Proof of registered address",
    "Source of funds declaration"
  ];
  
  const localRequirements: string[] = [];
  
  if (jurisdiction.localDirectorRequired) {
    localRequirements.push("Local director required");
  }
  if (jurisdiction.localSecretaryRequired) {
    localRequirements.push("Local company secretary required");
  }
  
  // Add jurisdiction-specific documents
  switch (jurisdictionCode) {
    case "GB":
      documents.push("IN01 Application form", "Model articles or bespoke articles");
      break;
    case "DE":
      documents.push("Notarized formation deed", "Shareholder resolution");
      break;
    case "SG":
      documents.push("ACRA registration form", "Constitution");
      break;
    case "HK":
      documents.push("NNC1 form", "Articles of Association");
      break;
  }
  
  return {
    documents,
    minimumCapital: jurisdiction.minimumCapital,
    localRequirements,
    estimatedTimeline: getEstimatedTimeline(jurisdictionCode),
    estimatedCost: jurisdiction.formationCost
  };
}

function getEstimatedTimeline(jurisdictionCode: string): string {
  const timelines: Record<string, string> = {
    "GB": "24-48 hours",
    "DE": "2-4 weeks",
    "NL": "1-2 weeks",
    "IE": "3-5 business days",
    "SG": "1-2 business days",
    "HK": "1-2 business days",
    "KY": "1-2 weeks",
    "VG": "1-2 weeks",
    "KN": "2-3 weeks",
    "CK": "2-4 weeks",
    "PA": "1-2 weeks",
    "CH": "2-4 weeks"
  };
  
  return timelines[jurisdictionCode] || "2-4 weeks";
}
