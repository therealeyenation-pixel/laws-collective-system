/**
 * Real Property System Service
 * 
 * Manages property assets, donations, House assignments, usage agreements,
 * improvements tracking, and Property Council governance for the land trust
 */

// Use crypto.randomUUID for UUID generation
const uuidv4 = () => crypto.randomUUID();

// ============================================================================
// Types & Interfaces
// ============================================================================

export type PropertyType = 
  | "land"
  | "residential"
  | "commercial"
  | "industrial"
  | "agricultural"
  | "mixed_use";

export type PropertyStatus = 
  | "available"
  | "assigned"
  | "under_development"
  | "leased"
  | "pending_donation"
  | "in_escrow"
  | "restricted";

export type DonationType = 
  | "outright"
  | "bargain_sale"
  | "remainder_interest"
  | "conservation_easement"
  | "charitable_remainder_trust";

export type DonationStatus = 
  | "inquiry"
  | "evaluation"
  | "due_diligence"
  | "negotiation"
  | "accepted"
  | "declined"
  | "completed";

export type AgreementType = 
  | "ground_lease"
  | "usage_agreement"
  | "development_agreement"
  | "maintenance_agreement"
  | "shared_use_agreement";

export type AgreementStatus = 
  | "draft"
  | "pending_approval"
  | "active"
  | "expired"
  | "terminated"
  | "renewed";

export type ImprovementType = 
  | "construction"
  | "renovation"
  | "landscaping"
  | "infrastructure"
  | "environmental"
  | "accessibility"
  | "maintenance";

export type ImprovementStatus = 
  | "proposed"
  | "approved"
  | "in_progress"
  | "completed"
  | "rejected";

export type CouncilDecisionType = 
  | "property_acquisition"
  | "property_disposition"
  | "house_assignment"
  | "improvement_approval"
  | "lease_approval"
  | "policy_change"
  | "budget_allocation";

export type VoteResult = "approved" | "rejected" | "tabled" | "pending";

// Property Asset
export interface PropertyAsset {
  id: string;
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  
  // Location
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county: string;
    parcelNumber?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Details
  acreage: number;
  squareFootage?: number;
  zoning: string;
  description: string;
  
  // Valuation
  acquisitionValue: number;
  currentAppraisedValue: number;
  lastAppraisalDate: Date;
  
  // Acquisition
  acquisitionDate: Date;
  acquisitionMethod: "purchase" | "donation" | "grant" | "inheritance";
  donationId?: string;
  
  // Assignment
  assignedHouseId?: string;
  assignmentDate?: Date;
  
  // Metadata
  features: string[];
  restrictions: string[];
  encumbrances: string[];
  documents: string[];
  images: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Property Donation
export interface PropertyDonation {
  id: string;
  propertyId?: string; // Linked after acceptance
  
  // Donor Info
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorAddress: string;
  
  // Property Info
  propertyAddress: string;
  propertyType: PropertyType;
  estimatedValue: number;
  acreage: number;
  description: string;
  
  // Donation Details
  donationType: DonationType;
  status: DonationStatus;
  
  // Appraisal
  appraisalValue?: number;
  appraisalDate?: Date;
  appraiserName?: string;
  
  // Due Diligence
  titleSearchComplete: boolean;
  environmentalReviewComplete: boolean;
  surveyComplete: boolean;
  legalReviewComplete: boolean;
  
  // Issues
  knownIssues: string[];
  encumbrances: string[];
  
  // Decision
  acceptanceDate?: Date;
  declineReason?: string;
  
  // Tax
  taxDeductionAmount?: number;
  taxYear?: number;
  
  // Documents
  documents: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// House Property Assignment
export interface HousePropertyAssignment {
  id: string;
  propertyId: string;
  houseId: string;
  houseName: string;
  
  // Assignment Details
  assignmentType: "primary" | "secondary" | "shared";
  startDate: Date;
  endDate?: Date;
  
  // Terms
  monthlyFee: number;
  securityDeposit: number;
  responsibleForMaintenance: boolean;
  responsibleForInsurance: boolean;
  responsibleForTaxes: boolean;
  
  // Usage
  allowedUses: string[];
  restrictions: string[];
  
  // Status
  status: "active" | "pending" | "terminated" | "expired";
  
  // Exit Provisions
  exitNoticeRequired: number; // days
  exitPenalty?: number;
  improvementCreditEligible: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Property Usage Agreement (Ground Lease)
export interface PropertyUsageAgreement {
  id: string;
  propertyId: string;
  houseId: string;
  
  // Agreement Details
  agreementType: AgreementType;
  agreementNumber: string;
  title: string;
  
  // Term
  startDate: Date;
  endDate: Date;
  renewalOptions: number;
  autoRenewal: boolean;
  
  // Financial
  monthlyPayment: number;
  annualEscalation: number; // percentage
  securityDeposit: number;
  
  // Responsibilities
  maintenanceResponsibility: "landlord" | "tenant" | "shared";
  insuranceResponsibility: "landlord" | "tenant" | "shared";
  taxResponsibility: "landlord" | "tenant" | "shared";
  
  // Terms
  allowedUses: string[];
  prohibitedUses: string[];
  improvementRights: boolean;
  sublettingAllowed: boolean;
  
  // Status
  status: AgreementStatus;
  
  // Documents
  documentUrl?: string;
  amendments: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Property Improvement
export interface PropertyImprovement {
  id: string;
  propertyId: string;
  houseId?: string;
  
  // Improvement Details
  type: ImprovementType;
  title: string;
  description: string;
  
  // Financial
  estimatedCost: number;
  actualCost?: number;
  fundingSource: "house" | "trust" | "grant" | "shared";
  
  // Credit
  creditAmount: number;
  creditExpirationDate?: Date;
  creditTransferable: boolean;
  
  // Timeline
  proposedStartDate: Date;
  proposedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Status
  status: ImprovementStatus;
  approvedBy?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  
  // Documentation
  plans: string[];
  permits: string[];
  inspections: string[];
  photos: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Property Council Decision
export interface PropertyCouncilDecision {
  id: string;
  decisionType: CouncilDecisionType;
  title: string;
  description: string;
  
  // Related Items
  propertyId?: string;
  houseId?: string;
  improvementId?: string;
  agreementId?: string;
  
  // Meeting
  meetingDate: Date;
  meetingMinutesUrl?: string;
  
  // Voting
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorumMet: boolean;
  result: VoteResult;
  
  // Implementation
  implementationDeadline?: Date;
  implementedDate?: Date;
  implementationNotes?: string;
  
  // Documents
  supportingDocuments: string[];
  
  createdAt: Date;
}

// Exit Provision Calculation
export interface ExitProvisionResult {
  houseId: string;
  propertyId: string;
  
  // Credits
  improvementCredits: number;
  unusedRentCredits: number;
  securityDepositReturn: number;
  
  // Deductions
  outstandingFees: number;
  damageAssessment: number;
  earlyTerminationPenalty: number;
  
  // Net
  netSettlement: number;
  
  // Timeline
  noticeDate: Date;
  exitDate: Date;
  settlementDueDate: Date;
}

// Fund Accounting
export interface PropertyFundAccount {
  id: string;
  name: string;
  type: "operating" | "reserve" | "improvement" | "acquisition";
  balance: number;
  
  // Restrictions
  restricted: boolean;
  restrictionDetails?: string;
  
  // Transactions
  lastTransactionDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Constants
// ============================================================================

export const PROPERTY_TYPES: { id: PropertyType; name: string; description: string }[] = [
  { id: "land", name: "Vacant Land", description: "Undeveloped land parcels" },
  { id: "residential", name: "Residential", description: "Single or multi-family housing" },
  { id: "commercial", name: "Commercial", description: "Office, retail, or service buildings" },
  { id: "industrial", name: "Industrial", description: "Manufacturing or warehouse facilities" },
  { id: "agricultural", name: "Agricultural", description: "Farmland or agricultural use" },
  { id: "mixed_use", name: "Mixed Use", description: "Combined residential and commercial" },
];

export const DONATION_TYPES: { id: DonationType; name: string; description: string }[] = [
  { id: "outright", name: "Outright Gift", description: "Complete transfer of property ownership" },
  { id: "bargain_sale", name: "Bargain Sale", description: "Sale below market value with charitable deduction" },
  { id: "remainder_interest", name: "Remainder Interest", description: "Donor retains life estate" },
  { id: "conservation_easement", name: "Conservation Easement", description: "Permanent land use restriction" },
  { id: "charitable_remainder_trust", name: "Charitable Remainder Trust", description: "Income stream with remainder to charity" },
];

export const AGREEMENT_TYPES: { id: AgreementType; name: string; description: string }[] = [
  { id: "ground_lease", name: "Ground Lease", description: "Long-term lease of land only" },
  { id: "usage_agreement", name: "Usage Agreement", description: "Permission to use property for specific purposes" },
  { id: "development_agreement", name: "Development Agreement", description: "Terms for property development" },
  { id: "maintenance_agreement", name: "Maintenance Agreement", description: "Shared maintenance responsibilities" },
  { id: "shared_use_agreement", name: "Shared Use Agreement", description: "Multiple parties sharing property" },
];

export const IMPROVEMENT_TYPES: { id: ImprovementType; name: string; creditMultiplier: number }[] = [
  { id: "construction", name: "New Construction", creditMultiplier: 1.0 },
  { id: "renovation", name: "Renovation", creditMultiplier: 0.8 },
  { id: "landscaping", name: "Landscaping", creditMultiplier: 0.5 },
  { id: "infrastructure", name: "Infrastructure", creditMultiplier: 0.9 },
  { id: "environmental", name: "Environmental", creditMultiplier: 0.7 },
  { id: "accessibility", name: "Accessibility", creditMultiplier: 0.85 },
  { id: "maintenance", name: "Major Maintenance", creditMultiplier: 0.3 },
];

// ============================================================================
// Property Asset Functions
// ============================================================================

export function createPropertyAsset(
  name: string,
  type: PropertyType,
  address: PropertyAsset["address"],
  acreage: number,
  acquisitionValue: number,
  acquisitionMethod: PropertyAsset["acquisitionMethod"],
  description: string,
  zoning: string,
  options?: {
    coordinates?: PropertyAsset["coordinates"];
    squareFootage?: number;
    features?: string[];
    restrictions?: string[];
    donationId?: string;
  }
): PropertyAsset {
  const now = new Date();
  return {
    id: uuidv4(),
    name,
    type,
    status: "available",
    address,
    coordinates: options?.coordinates,
    acreage,
    squareFootage: options?.squareFootage,
    zoning,
    description,
    acquisitionValue,
    currentAppraisedValue: acquisitionValue,
    lastAppraisalDate: now,
    acquisitionDate: now,
    acquisitionMethod,
    donationId: options?.donationId,
    features: options?.features || [],
    restrictions: options?.restrictions || [],
    encumbrances: [],
    documents: [],
    images: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function updatePropertyAppraisal(
  property: PropertyAsset,
  newValue: number,
  appraisalDate: Date = new Date()
): PropertyAsset {
  return {
    ...property,
    currentAppraisedValue: newValue,
    lastAppraisalDate: appraisalDate,
    updatedAt: new Date(),
  };
}

export function assignPropertyToHouse(
  property: PropertyAsset,
  houseId: string
): PropertyAsset {
  return {
    ...property,
    status: "assigned",
    assignedHouseId: houseId,
    assignmentDate: new Date(),
    updatedAt: new Date(),
  };
}

export function unassignPropertyFromHouse(
  property: PropertyAsset
): PropertyAsset {
  return {
    ...property,
    status: "available",
    assignedHouseId: undefined,
    assignmentDate: undefined,
    updatedAt: new Date(),
  };
}

// ============================================================================
// Property Donation Functions
// ============================================================================

export function createPropertyDonation(
  donorName: string,
  donorEmail: string,
  donorPhone: string,
  donorAddress: string,
  propertyAddress: string,
  propertyType: PropertyType,
  estimatedValue: number,
  acreage: number,
  description: string,
  donationType: DonationType
): PropertyDonation {
  const now = new Date();
  return {
    id: uuidv4(),
    donorName,
    donorEmail,
    donorPhone,
    donorAddress,
    propertyAddress,
    propertyType,
    estimatedValue,
    acreage,
    description,
    donationType,
    status: "inquiry",
    titleSearchComplete: false,
    environmentalReviewComplete: false,
    surveyComplete: false,
    legalReviewComplete: false,
    knownIssues: [],
    encumbrances: [],
    documents: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function updateDonationStatus(
  donation: PropertyDonation,
  status: DonationStatus,
  options?: {
    declineReason?: string;
    appraisalValue?: number;
    appraisalDate?: Date;
    appraiserName?: string;
  }
): PropertyDonation {
  return {
    ...donation,
    status,
    declineReason: options?.declineReason,
    appraisalValue: options?.appraisalValue ?? donation.appraisalValue,
    appraisalDate: options?.appraisalDate ?? donation.appraisalDate,
    appraiserName: options?.appraiserName ?? donation.appraiserName,
    acceptanceDate: status === "accepted" ? new Date() : donation.acceptanceDate,
    updatedAt: new Date(),
  };
}

export function completeDueDiligence(
  donation: PropertyDonation,
  field: "titleSearchComplete" | "environmentalReviewComplete" | "surveyComplete" | "legalReviewComplete"
): PropertyDonation {
  return {
    ...donation,
    [field]: true,
    updatedAt: new Date(),
  };
}

export function isDueDiligenceComplete(donation: PropertyDonation): boolean {
  return (
    donation.titleSearchComplete &&
    donation.environmentalReviewComplete &&
    donation.surveyComplete &&
    donation.legalReviewComplete
  );
}

export function calculateTaxDeduction(
  donation: PropertyDonation
): number {
  if (!donation.appraisalValue) return 0;
  
  switch (donation.donationType) {
    case "outright":
      return donation.appraisalValue;
    case "bargain_sale":
      // Deduction is difference between FMV and sale price
      return donation.appraisalValue * 0.5; // Simplified
    case "remainder_interest":
      // Based on donor age and IRS tables - simplified
      return donation.appraisalValue * 0.4;
    case "conservation_easement":
      // Value of easement
      return donation.appraisalValue * 0.3;
    case "charitable_remainder_trust":
      // Present value of remainder interest
      return donation.appraisalValue * 0.35;
    default:
      return 0;
  }
}

// ============================================================================
// House Assignment Functions
// ============================================================================

export function createHouseAssignment(
  propertyId: string,
  houseId: string,
  houseName: string,
  assignmentType: HousePropertyAssignment["assignmentType"],
  monthlyFee: number,
  securityDeposit: number,
  options?: {
    endDate?: Date;
    allowedUses?: string[];
    restrictions?: string[];
    exitNoticeRequired?: number;
    exitPenalty?: number;
  }
): HousePropertyAssignment {
  const now = new Date();
  return {
    id: uuidv4(),
    propertyId,
    houseId,
    houseName,
    assignmentType,
    startDate: now,
    endDate: options?.endDate,
    monthlyFee,
    securityDeposit,
    responsibleForMaintenance: true,
    responsibleForInsurance: false,
    responsibleForTaxes: false,
    allowedUses: options?.allowedUses || ["residential", "home_office"],
    restrictions: options?.restrictions || [],
    status: "active",
    exitNoticeRequired: options?.exitNoticeRequired || 90,
    exitPenalty: options?.exitPenalty,
    improvementCreditEligible: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function terminateAssignment(
  assignment: HousePropertyAssignment,
  reason: "voluntary" | "involuntary" | "expired"
): HousePropertyAssignment {
  return {
    ...assignment,
    status: reason === "expired" ? "expired" : "terminated",
    endDate: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================================================
// Usage Agreement Functions
// ============================================================================

export function generateAgreementNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AGR-${year}-${random}`;
}

export function createUsageAgreement(
  propertyId: string,
  houseId: string,
  agreementType: AgreementType,
  title: string,
  startDate: Date,
  termYears: number,
  monthlyPayment: number,
  options?: {
    annualEscalation?: number;
    securityDeposit?: number;
    renewalOptions?: number;
    autoRenewal?: boolean;
    allowedUses?: string[];
    prohibitedUses?: string[];
    improvementRights?: boolean;
    sublettingAllowed?: boolean;
  }
): PropertyUsageAgreement {
  const now = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + termYears);
  
  return {
    id: uuidv4(),
    propertyId,
    houseId,
    agreementType,
    agreementNumber: generateAgreementNumber(),
    title,
    startDate,
    endDate,
    renewalOptions: options?.renewalOptions || 2,
    autoRenewal: options?.autoRenewal ?? false,
    monthlyPayment,
    annualEscalation: options?.annualEscalation || 3,
    securityDeposit: options?.securityDeposit || monthlyPayment * 2,
    maintenanceResponsibility: "tenant",
    insuranceResponsibility: "shared",
    taxResponsibility: "landlord",
    allowedUses: options?.allowedUses || [],
    prohibitedUses: options?.prohibitedUses || [],
    improvementRights: options?.improvementRights ?? true,
    sublettingAllowed: options?.sublettingAllowed ?? false,
    status: "draft",
    amendments: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function activateAgreement(
  agreement: PropertyUsageAgreement
): PropertyUsageAgreement {
  return {
    ...agreement,
    status: "active",
    updatedAt: new Date(),
  };
}

export function renewAgreement(
  agreement: PropertyUsageAgreement,
  additionalYears: number
): PropertyUsageAgreement {
  const newEndDate = new Date(agreement.endDate);
  newEndDate.setFullYear(newEndDate.getFullYear() + additionalYears);
  
  // Apply escalation
  const yearsElapsed = additionalYears;
  const escalationMultiplier = Math.pow(1 + agreement.annualEscalation / 100, yearsElapsed);
  const newMonthlyPayment = Math.round(agreement.monthlyPayment * escalationMultiplier);
  
  return {
    ...agreement,
    endDate: newEndDate,
    monthlyPayment: newMonthlyPayment,
    renewalOptions: Math.max(0, agreement.renewalOptions - 1),
    status: "renewed",
    updatedAt: new Date(),
  };
}

export function generateGroundLeaseDocument(
  agreement: PropertyUsageAgreement,
  property: PropertyAsset,
  houseName: string
): string {
  return `
GROUND LEASE AGREEMENT
Agreement Number: ${agreement.agreementNumber}

This Ground Lease Agreement ("Agreement") is entered into as of ${agreement.startDate.toLocaleDateString()}.

PARTIES:
Landlord: L.A.W.S. Collective Land Trust ("Trust")
Tenant: ${houseName} ("House")

PROPERTY:
${property.name}
${property.address.street}
${property.address.city}, ${property.address.state} ${property.address.zipCode}
Parcel Number: ${property.address.parcelNumber || "N/A"}
Acreage: ${property.acreage} acres

TERM:
Commencement Date: ${agreement.startDate.toLocaleDateString()}
Expiration Date: ${agreement.endDate.toLocaleDateString()}
Renewal Options: ${agreement.renewalOptions} additional term(s)

RENT:
Monthly Payment: $${agreement.monthlyPayment.toLocaleString()}
Annual Escalation: ${agreement.annualEscalation}%
Security Deposit: $${agreement.securityDeposit.toLocaleString()}

RESPONSIBILITIES:
Maintenance: ${agreement.maintenanceResponsibility}
Insurance: ${agreement.insuranceResponsibility}
Property Taxes: ${agreement.taxResponsibility}

PERMITTED USES:
${agreement.allowedUses.join(", ") || "As approved by Trust"}

PROHIBITED USES:
${agreement.prohibitedUses.join(", ") || "None specified"}

IMPROVEMENTS:
Tenant ${agreement.improvementRights ? "may" : "may not"} make improvements subject to Trust approval.
Improvement credits ${agreement.improvementRights ? "are" : "are not"} eligible upon exit.

SUBLETTING:
Subletting is ${agreement.sublettingAllowed ? "permitted with Trust approval" : "not permitted"}.

SIGNATURES:
_______________________     _______________________
Trust Representative        House Representative
Date: _______________       Date: _______________
`.trim();
}

// ============================================================================
// Improvement Functions
// ============================================================================

export function createImprovement(
  propertyId: string,
  houseId: string | undefined,
  type: ImprovementType,
  title: string,
  description: string,
  estimatedCost: number,
  fundingSource: PropertyImprovement["fundingSource"],
  proposedStartDate: Date,
  proposedEndDate: Date
): PropertyImprovement {
  const typeConfig = IMPROVEMENT_TYPES.find(t => t.id === type);
  const creditMultiplier = typeConfig?.creditMultiplier || 0.5;
  
  const now = new Date();
  return {
    id: uuidv4(),
    propertyId,
    houseId,
    type,
    title,
    description,
    estimatedCost,
    fundingSource,
    creditAmount: Math.round(estimatedCost * creditMultiplier),
    creditTransferable: fundingSource === "house",
    proposedStartDate,
    proposedEndDate,
    status: "proposed",
    plans: [],
    permits: [],
    inspections: [],
    photos: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function approveImprovement(
  improvement: PropertyImprovement,
  approvedBy: string
): PropertyImprovement {
  return {
    ...improvement,
    status: "approved",
    approvedBy,
    approvalDate: new Date(),
    updatedAt: new Date(),
  };
}

export function rejectImprovement(
  improvement: PropertyImprovement,
  reason: string
): PropertyImprovement {
  return {
    ...improvement,
    status: "rejected",
    rejectionReason: reason,
    updatedAt: new Date(),
  };
}

export function startImprovement(
  improvement: PropertyImprovement
): PropertyImprovement {
  return {
    ...improvement,
    status: "in_progress",
    actualStartDate: new Date(),
    updatedAt: new Date(),
  };
}

export function completeImprovement(
  improvement: PropertyImprovement,
  actualCost: number
): PropertyImprovement {
  const typeConfig = IMPROVEMENT_TYPES.find(t => t.id === improvement.type);
  const creditMultiplier = typeConfig?.creditMultiplier || 0.5;
  
  // Recalculate credit based on actual cost
  const creditAmount = Math.round(actualCost * creditMultiplier);
  
  // Set credit expiration (10 years from completion)
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 10);
  
  return {
    ...improvement,
    status: "completed",
    actualCost,
    actualEndDate: new Date(),
    creditAmount,
    creditExpirationDate: expirationDate,
    updatedAt: new Date(),
  };
}

export function calculateTotalImprovementCredits(
  improvements: PropertyImprovement[],
  houseId: string
): number {
  const now = new Date();
  return improvements
    .filter(i => 
      i.houseId === houseId &&
      i.status === "completed" &&
      (!i.creditExpirationDate || i.creditExpirationDate > now)
    )
    .reduce((sum, i) => sum + i.creditAmount, 0);
}

// ============================================================================
// Property Council Functions
// ============================================================================

export function createCouncilDecision(
  decisionType: CouncilDecisionType,
  title: string,
  description: string,
  meetingDate: Date,
  options?: {
    propertyId?: string;
    houseId?: string;
    improvementId?: string;
    agreementId?: string;
    implementationDeadline?: Date;
  }
): PropertyCouncilDecision {
  return {
    id: uuidv4(),
    decisionType,
    title,
    description,
    propertyId: options?.propertyId,
    houseId: options?.houseId,
    improvementId: options?.improvementId,
    agreementId: options?.agreementId,
    meetingDate,
    votesFor: 0,
    votesAgainst: 0,
    votesAbstain: 0,
    quorumMet: false,
    result: "pending",
    implementationDeadline: options?.implementationDeadline,
    supportingDocuments: [],
    createdAt: new Date(),
  };
}

export function recordVote(
  decision: PropertyCouncilDecision,
  votesFor: number,
  votesAgainst: number,
  votesAbstain: number,
  totalMembers: number,
  quorumThreshold: number = 0.5,
  approvalThreshold: number = 0.5
): PropertyCouncilDecision {
  const totalVotes = votesFor + votesAgainst + votesAbstain;
  const quorumMet = totalVotes / totalMembers >= quorumThreshold;
  
  let result: VoteResult = "pending";
  if (quorumMet) {
    const approvalRate = votesFor / (votesFor + votesAgainst);
    result = approvalRate >= approvalThreshold ? "approved" : "rejected";
  } else {
    result = "tabled";
  }
  
  return {
    ...decision,
    votesFor,
    votesAgainst,
    votesAbstain,
    quorumMet,
    result,
  };
}

export function implementDecision(
  decision: PropertyCouncilDecision,
  notes?: string
): PropertyCouncilDecision {
  return {
    ...decision,
    implementedDate: new Date(),
    implementationNotes: notes,
  };
}

// ============================================================================
// Exit Provision Functions
// ============================================================================

export function calculateExitProvisions(
  assignment: HousePropertyAssignment,
  improvements: PropertyImprovement[],
  outstandingFees: number,
  damageAssessment: number,
  isEarlyTermination: boolean
): ExitProvisionResult {
  const noticeDate = new Date();
  const exitDate = new Date(noticeDate);
  exitDate.setDate(exitDate.getDate() + assignment.exitNoticeRequired);
  
  const settlementDueDate = new Date(exitDate);
  settlementDueDate.setDate(settlementDueDate.getDate() + 30);
  
  // Calculate improvement credits
  const improvementCredits = assignment.improvementCreditEligible
    ? calculateTotalImprovementCredits(improvements, assignment.houseId)
    : 0;
  
  // Calculate unused rent credits (if any prepaid)
  const unusedRentCredits = 0; // Would need payment history
  
  // Security deposit return
  const securityDepositReturn = assignment.securityDeposit;
  
  // Early termination penalty
  const earlyTerminationPenalty = isEarlyTermination && assignment.exitPenalty
    ? assignment.exitPenalty
    : 0;
  
  // Calculate net settlement
  const credits = improvementCredits + unusedRentCredits + securityDepositReturn;
  const deductions = outstandingFees + damageAssessment + earlyTerminationPenalty;
  const netSettlement = credits - deductions;
  
  return {
    houseId: assignment.houseId,
    propertyId: assignment.propertyId,
    improvementCredits,
    unusedRentCredits,
    securityDepositReturn,
    outstandingFees,
    damageAssessment,
    earlyTerminationPenalty,
    netSettlement,
    noticeDate,
    exitDate,
    settlementDueDate,
  };
}

// ============================================================================
// Fund Accounting Functions
// ============================================================================

export function createPropertyFundAccount(
  name: string,
  type: PropertyFundAccount["type"],
  initialBalance: number = 0,
  restricted: boolean = false,
  restrictionDetails?: string
): PropertyFundAccount {
  const now = new Date();
  return {
    id: uuidv4(),
    name,
    type,
    balance: initialBalance,
    restricted,
    restrictionDetails,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateFundBalance(
  account: PropertyFundAccount,
  amount: number
): PropertyFundAccount {
  return {
    ...account,
    balance: account.balance + amount,
    lastTransactionDate: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================================================
// Reporting Functions
// ============================================================================

export interface PropertyPortfolioSummary {
  totalProperties: number;
  totalAcreage: number;
  totalValue: number;
  byType: Record<PropertyType, { count: number; acreage: number; value: number }>;
  byStatus: Record<PropertyStatus, number>;
  assignedToHouses: number;
  available: number;
}

export function generatePortfolioSummary(
  properties: PropertyAsset[]
): PropertyPortfolioSummary {
  const byType: PropertyPortfolioSummary["byType"] = {} as any;
  const byStatus: PropertyPortfolioSummary["byStatus"] = {} as any;
  
  let totalAcreage = 0;
  let totalValue = 0;
  let assignedToHouses = 0;
  let available = 0;
  
  for (const prop of properties) {
    totalAcreage += prop.acreage;
    totalValue += prop.currentAppraisedValue;
    
    if (!byType[prop.type]) {
      byType[prop.type] = { count: 0, acreage: 0, value: 0 };
    }
    byType[prop.type].count++;
    byType[prop.type].acreage += prop.acreage;
    byType[prop.type].value += prop.currentAppraisedValue;
    
    byStatus[prop.status] = (byStatus[prop.status] || 0) + 1;
    
    if (prop.assignedHouseId) {
      assignedToHouses++;
    }
    if (prop.status === "available") {
      available++;
    }
  }
  
  return {
    totalProperties: properties.length,
    totalAcreage,
    totalValue,
    byType,
    byStatus,
    assignedToHouses,
    available,
  };
}

export interface DonationPipelineSummary {
  totalInquiries: number;
  inEvaluation: number;
  inDueDiligence: number;
  inNegotiation: number;
  accepted: number;
  declined: number;
  completed: number;
  totalEstimatedValue: number;
  totalAppraisedValue: number;
}

export function generateDonationPipelineSummary(
  donations: PropertyDonation[]
): DonationPipelineSummary {
  let totalEstimatedValue = 0;
  let totalAppraisedValue = 0;
  
  const statusCounts: Record<DonationStatus, number> = {
    inquiry: 0,
    evaluation: 0,
    due_diligence: 0,
    negotiation: 0,
    accepted: 0,
    declined: 0,
    completed: 0,
  };
  
  for (const donation of donations) {
    statusCounts[donation.status]++;
    totalEstimatedValue += donation.estimatedValue;
    if (donation.appraisalValue) {
      totalAppraisedValue += donation.appraisalValue;
    }
  }
  
  return {
    totalInquiries: statusCounts.inquiry,
    inEvaluation: statusCounts.evaluation,
    inDueDiligence: statusCounts.due_diligence,
    inNegotiation: statusCounts.negotiation,
    accepted: statusCounts.accepted,
    declined: statusCounts.declined,
    completed: statusCounts.completed,
    totalEstimatedValue,
    totalAppraisedValue,
  };
}
