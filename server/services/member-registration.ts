/**
 * Member Business Registration Service
 * 
 * Handles 508 membership registration for businesses, including:
 * - Business information collection
 * - Sponsoring House selection
 * - Terms and membership agreement tracking
 * - Approval workflow management
 */

// Business types eligible for 508 membership
export const BUSINESS_TYPES = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation (C-Corp or S-Corp)" },
  { value: "partnership", label: "Partnership" },
  { value: "nonprofit", label: "Nonprofit Organization" },
  { value: "cooperative", label: "Cooperative" },
  { value: "trust", label: "Trust" },
  { value: "other", label: "Other" },
] as const;

export type BusinessType = typeof BUSINESS_TYPES[number]["value"];

// Industry categories
export const INDUSTRY_CATEGORIES = [
  { value: "agriculture", label: "Agriculture & Farming" },
  { value: "arts_entertainment", label: "Arts & Entertainment" },
  { value: "construction", label: "Construction & Trades" },
  { value: "education", label: "Education & Training" },
  { value: "finance", label: "Finance & Insurance" },
  { value: "food_service", label: "Food Service & Hospitality" },
  { value: "healthcare", label: "Healthcare & Wellness" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "professional_services", label: "Professional Services" },
  { value: "real_estate", label: "Real Estate" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "technology", label: "Technology & IT" },
  { value: "transportation", label: "Transportation & Logistics" },
  { value: "other", label: "Other" },
] as const;

export type IndustryCategory = typeof INDUSTRY_CATEGORIES[number]["value"];

// Registration status
export const REGISTRATION_STATUSES = [
  "pending",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
] as const;

export type RegistrationStatus = typeof REGISTRATION_STATUSES[number];

// Business registration application
export interface BusinessRegistration {
  id: string;
  
  // Business Information
  businessName: string;
  dbaName?: string;
  businessType: BusinessType;
  industryCategory: IndustryCategory;
  einNumber?: string;
  stateOfFormation: string;
  dateOfFormation: Date;
  businessAddress: Address;
  mailingAddress?: Address;
  
  // Contact Information
  primaryContact: ContactInfo;
  alternateContact?: ContactInfo;
  
  // Business Details
  numberOfEmployees: number;
  annualRevenue?: string;
  businessDescription: string;
  productsServices: string;
  targetMarket: string;
  
  // Membership Details
  sponsoringHouseId?: string;
  membershipTier: MembershipTier;
  referralSource?: string;
  
  // Agreement
  agreedToTerms: boolean;
  agreedToMembershipAgreement: boolean;
  agreementTimestamp: Date;
  signatureData?: SignatureData;
  
  // Status
  status: RegistrationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  title?: string;
  email: string;
  phone: string;
  preferredContact: "email" | "phone";
}

export interface SignatureData {
  signedBy: string;
  signedAt: Date;
  ipAddress?: string;
  signatureHash: string;
}

// Membership tiers
export const MEMBERSHIP_TIERS = [
  {
    value: "associate",
    label: "Associate Member",
    description: "Entry-level membership with basic benefits",
    annualFee: 100,
    benefits: [
      "Access to member directory",
      "Newsletter subscription",
      "Basic business resources",
      "Community forum access",
    ],
  },
  {
    value: "standard",
    label: "Standard Member",
    description: "Full membership with comprehensive benefits",
    annualFee: 250,
    benefits: [
      "All Associate benefits",
      "Voting rights on collective matters",
      "Access to grant opportunities",
      "Business mentorship program",
      "Networking events access",
    ],
  },
  {
    value: "premium",
    label: "Premium Member",
    description: "Enhanced membership with priority access",
    annualFee: 500,
    benefits: [
      "All Standard benefits",
      "Priority grant consideration",
      "Featured business listing",
      "One-on-one consulting sessions",
      "Early access to programs",
    ],
  },
  {
    value: "founding",
    label: "Founding Member",
    description: "Legacy membership for early supporters",
    annualFee: 1000,
    benefits: [
      "All Premium benefits",
      "Permanent founding member recognition",
      "Advisory board participation",
      "Revenue sharing eligibility",
      "Legacy planning services",
    ],
  },
] as const;

export type MembershipTier = typeof MEMBERSHIP_TIERS[number]["value"];

// Validation functions
export function validateEIN(ein: string): boolean {
  // EIN format: XX-XXXXXXX
  const einPattern = /^\d{2}-\d{7}$/;
  return einPattern.test(ein);
}

export function validatePhone(phone: string): boolean {
  // Accept various phone formats
  const phonePattern = /^[\d\s\-\(\)\+]{10,}$/;
  return phonePattern.test(phone.replace(/\s/g, ""));
}

export function validateZipCode(zipCode: string): boolean {
  // US ZIP code: 5 digits or 5+4
  const zipPattern = /^\d{5}(-\d{4})?$/;
  return zipPattern.test(zipCode);
}

export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Create registration application
export interface CreateRegistrationInput {
  businessName: string;
  dbaName?: string;
  businessType: BusinessType;
  industryCategory: IndustryCategory;
  einNumber?: string;
  stateOfFormation: string;
  dateOfFormation: string;
  businessAddress: Address;
  mailingAddress?: Address;
  primaryContact: ContactInfo;
  alternateContact?: ContactInfo;
  numberOfEmployees: number;
  annualRevenue?: string;
  businessDescription: string;
  productsServices: string;
  targetMarket: string;
  sponsoringHouseId?: string;
  membershipTier: MembershipTier;
  referralSource?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRegistration(input: CreateRegistrationInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!input.businessName?.trim()) {
    errors.push({ field: "businessName", message: "Business name is required" });
  }

  if (!input.businessType) {
    errors.push({ field: "businessType", message: "Business type is required" });
  }

  if (!input.industryCategory) {
    errors.push({ field: "industryCategory", message: "Industry category is required" });
  }

  if (!input.stateOfFormation?.trim()) {
    errors.push({ field: "stateOfFormation", message: "State of formation is required" });
  }

  if (!input.dateOfFormation) {
    errors.push({ field: "dateOfFormation", message: "Date of formation is required" });
  }

  // EIN validation (optional but must be valid if provided)
  if (input.einNumber && !validateEIN(input.einNumber)) {
    errors.push({ field: "einNumber", message: "Invalid EIN format. Use XX-XXXXXXX" });
  }

  // Address validation
  if (!input.businessAddress?.street1?.trim()) {
    errors.push({ field: "businessAddress.street1", message: "Street address is required" });
  }
  if (!input.businessAddress?.city?.trim()) {
    errors.push({ field: "businessAddress.city", message: "City is required" });
  }
  if (!input.businessAddress?.state?.trim()) {
    errors.push({ field: "businessAddress.state", message: "State is required" });
  }
  if (!input.businessAddress?.zipCode || !validateZipCode(input.businessAddress.zipCode)) {
    errors.push({ field: "businessAddress.zipCode", message: "Valid ZIP code is required" });
  }

  // Contact validation
  if (!input.primaryContact?.firstName?.trim()) {
    errors.push({ field: "primaryContact.firstName", message: "Contact first name is required" });
  }
  if (!input.primaryContact?.lastName?.trim()) {
    errors.push({ field: "primaryContact.lastName", message: "Contact last name is required" });
  }
  if (!input.primaryContact?.email || !validateEmail(input.primaryContact.email)) {
    errors.push({ field: "primaryContact.email", message: "Valid email is required" });
  }
  if (!input.primaryContact?.phone || !validatePhone(input.primaryContact.phone)) {
    errors.push({ field: "primaryContact.phone", message: "Valid phone number is required" });
  }

  // Business details
  if (input.numberOfEmployees < 0) {
    errors.push({ field: "numberOfEmployees", message: "Number of employees cannot be negative" });
  }
  if (!input.businessDescription?.trim()) {
    errors.push({ field: "businessDescription", message: "Business description is required" });
  }
  if (!input.productsServices?.trim()) {
    errors.push({ field: "productsServices", message: "Products/services description is required" });
  }

  // Membership tier
  if (!input.membershipTier) {
    errors.push({ field: "membershipTier", message: "Membership tier is required" });
  }

  return errors;
}

// Generate application ID
export function generateApplicationId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REG-${timestamp}-${random}`;
}

// Create registration
export function createRegistration(
  input: CreateRegistrationInput,
  agreedToTerms: boolean,
  agreedToMembershipAgreement: boolean,
  signatureData?: SignatureData
): BusinessRegistration {
  const now = new Date();
  
  return {
    id: generateApplicationId(),
    ...input,
    dateOfFormation: new Date(input.dateOfFormation),
    agreedToTerms,
    agreedToMembershipAgreement,
    agreementTimestamp: now,
    signatureData,
    status: "pending",
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

// Approval workflow
export interface ReviewDecision {
  status: "approved" | "rejected" | "under_review";
  reviewerId: string;
  reviewerName: string;
  notes?: string;
  rejectedReason?: string;
}

export function reviewRegistration(
  registration: BusinessRegistration,
  decision: ReviewDecision
): BusinessRegistration {
  const now = new Date();
  
  const updated: BusinessRegistration = {
    ...registration,
    status: decision.status,
    reviewedAt: now,
    reviewedBy: decision.reviewerId,
    reviewNotes: decision.notes,
    updatedAt: now,
  };

  if (decision.status === "approved") {
    updated.approvedAt = now;
  } else if (decision.status === "rejected") {
    updated.rejectedReason = decision.rejectedReason;
  }

  return updated;
}

// Get membership tier details
export function getMembershipTier(tier: MembershipTier) {
  return MEMBERSHIP_TIERS.find(t => t.value === tier);
}

// Calculate membership fee
export function calculateMembershipFee(tier: MembershipTier): number {
  const tierInfo = getMembershipTier(tier);
  return tierInfo?.annualFee || 0;
}

// Generate membership agreement text
export function generateMembershipAgreement(
  businessName: string,
  tier: MembershipTier
): string {
  const tierInfo = getMembershipTier(tier);
  
  return `
MEMBERSHIP AGREEMENT

This Membership Agreement ("Agreement") is entered into between The L.A.W.S. Collective, LLC 
("Collective") and ${businessName} ("Member").

1. MEMBERSHIP TIER
Member has selected the ${tierInfo?.label} tier with an annual fee of $${tierInfo?.annualFee}.

2. MEMBERSHIP BENEFITS
As a ${tierInfo?.label}, Member is entitled to the following benefits:
${tierInfo?.benefits.map(b => `• ${b}`).join("\n")}

3. MEMBER OBLIGATIONS
Member agrees to:
• Conduct business in accordance with the Collective's values and mission
• Maintain accurate and current business information
• Participate in good faith in Collective activities and programs
• Pay membership fees in a timely manner
• Comply with all applicable laws and regulations

4. TERM AND RENEWAL
This membership is valid for one (1) year from the date of approval and will automatically 
renew unless cancelled by either party with 30 days written notice.

5. CODE OF CONDUCT
Member agrees to uphold the L.A.W.S. principles:
• LAND - Respect for community and roots
• AIR - Commitment to education and knowledge sharing
• WATER - Support for healing and balance
• SELF - Dedication to purpose and skill development

6. TERMINATION
The Collective reserves the right to terminate membership for violation of this Agreement 
or conduct detrimental to the Collective's mission.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Georgia.

By signing below, Member acknowledges reading, understanding, and agreeing to the terms 
of this Membership Agreement.
`.trim();
}

// Generate terms and conditions
export function generateTermsAndConditions(): string {
  return `
TERMS AND CONDITIONS FOR MEMBERSHIP

1. ELIGIBILITY
Membership in The L.A.W.S. Collective is open to businesses and organizations that:
• Are legally formed and in good standing
• Share the Collective's commitment to community development
• Agree to abide by the Collective's code of conduct

2. APPLICATION PROCESS
• All applications are subject to review and approval
• The Collective reserves the right to request additional information
• Approval decisions are final

3. MEMBERSHIP FEES
• Fees are non-refundable except as required by law
• Fees are due upon approval and annually thereafter
• Failure to pay fees may result in membership suspension

4. PRIVACY
• Member information is kept confidential
• Information may be shared with sponsoring Houses as applicable
• Members may opt out of directory listings

5. INTELLECTUAL PROPERTY
• Members retain ownership of their own intellectual property
• Members grant the Collective limited license to use business name and logo for promotional purposes

6. LIABILITY
• The Collective is not liable for business decisions made by members
• Members are responsible for their own compliance with laws and regulations

7. AMENDMENTS
• These terms may be amended with 30 days notice to members
• Continued membership constitutes acceptance of amended terms

8. DISPUTE RESOLUTION
• Disputes shall first be addressed through mediation
• Binding arbitration may be used if mediation fails

By submitting an application, you acknowledge that you have read and agree to these 
Terms and Conditions.
`.trim();
}

// Status display helpers
export function getStatusLabel(status: RegistrationStatus): string {
  const labels: Record<RegistrationStatus, string> = {
    pending: "Pending Review",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };
  return labels[status];
}

export function getStatusColor(status: RegistrationStatus): string {
  const colors: Record<RegistrationStatus, string> = {
    pending: "yellow",
    under_review: "blue",
    approved: "green",
    rejected: "red",
    withdrawn: "gray",
  };
  return colors[status];
}

// Search and filter registrations
export interface RegistrationFilters {
  status?: RegistrationStatus;
  businessType?: BusinessType;
  industryCategory?: IndustryCategory;
  membershipTier?: MembershipTier;
  sponsoringHouseId?: string;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function filterRegistrations(
  registrations: BusinessRegistration[],
  filters: RegistrationFilters
): BusinessRegistration[] {
  return registrations.filter(reg => {
    if (filters.status && reg.status !== filters.status) return false;
    if (filters.businessType && reg.businessType !== filters.businessType) return false;
    if (filters.industryCategory && reg.industryCategory !== filters.industryCategory) return false;
    if (filters.membershipTier && reg.membershipTier !== filters.membershipTier) return false;
    if (filters.sponsoringHouseId && reg.sponsoringHouseId !== filters.sponsoringHouseId) return false;
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const searchFields = [
        reg.businessName,
        reg.dbaName,
        reg.primaryContact.firstName,
        reg.primaryContact.lastName,
        reg.primaryContact.email,
      ].filter(Boolean).map(f => f!.toLowerCase());
      
      if (!searchFields.some(f => f.includes(term))) return false;
    }
    
    if (filters.dateFrom && reg.submittedAt < filters.dateFrom) return false;
    if (filters.dateTo && reg.submittedAt > filters.dateTo) return false;
    
    return true;
  });
}

// Statistics
export interface RegistrationStats {
  total: number;
  byStatus: Record<RegistrationStatus, number>;
  byTier: Record<MembershipTier, number>;
  byIndustry: Record<IndustryCategory, number>;
  pendingCount: number;
  approvedThisMonth: number;
  totalFees: number;
}

export function calculateRegistrationStats(
  registrations: BusinessRegistration[]
): RegistrationStats {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const stats: RegistrationStats = {
    total: registrations.length,
    byStatus: {} as Record<RegistrationStatus, number>,
    byTier: {} as Record<MembershipTier, number>,
    byIndustry: {} as Record<IndustryCategory, number>,
    pendingCount: 0,
    approvedThisMonth: 0,
    totalFees: 0,
  };

  // Initialize counts
  REGISTRATION_STATUSES.forEach(s => stats.byStatus[s] = 0);
  MEMBERSHIP_TIERS.forEach(t => stats.byTier[t.value] = 0);
  INDUSTRY_CATEGORIES.forEach(c => stats.byIndustry[c.value] = 0);

  registrations.forEach(reg => {
    stats.byStatus[reg.status]++;
    stats.byTier[reg.membershipTier]++;
    stats.byIndustry[reg.industryCategory]++;
    
    if (reg.status === "pending" || reg.status === "under_review") {
      stats.pendingCount++;
    }
    
    if (reg.status === "approved" && reg.approvedAt && reg.approvedAt >= startOfMonth) {
      stats.approvedThisMonth++;
      stats.totalFees += calculateMembershipFee(reg.membershipTier);
    }
  });

  return stats;
}
