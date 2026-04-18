// Stripe Products and Prices Configuration
// Centralized pricing for L.A.W.S. Collective memberships and Academy enrollment

// ─── Revenue Allocation Constants ───
// When a Collective member pays, the fee is internally split:
// 30% → LuvOnPurpose Academy and Outreach (508(c)(1)(a))
// 70% → L.A.W.S. Collective (LLC)
export const REVENUE_ALLOCATION = {
  academyPercent: 30,
  collectivePercent: 70,
} as const;

// ─── Collective Membership Tiers ───
export const COLLECTIVE_TIERS = {
  explorer: {
    id: "explorer",
    name: "Explorer",
    description: "Experience the L.A.W.S. vision before committing",
    monthlyPrice: 0,
    annualPrice: 0,
    interval: null,
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    features: [
      "Full interactive demo simulator (no save)",
      "L.A.W.S. framework overview",
      "Browse open career positions",
      "Community newsletter",
    ],
    cta: "Start Free",
    highlighted: false,
    academyAllocation: 0,
    collectiveAllocation: 0,
  },
  member: {
    id: "member",
    name: "Member",
    description: "Learn, validate, and build your business concept",
    monthlyPrice: 4900, // $49.00 in cents
    annualPrice: 39900, // $399.00/year ($33.25/mo — ~32% savings)
    interval: "month" as const,
    stripePriceIdMonthly: null as string | null, // Set after Stripe product creation
    stripePriceIdAnnual: null as string | null,
    features: [
      "All business simulators (full access + save)",
      "Financial literacy & tax training",
      "Business plan development tools",
      "Academy courses included",
      "Certificate of completion",
      "Community access",
    ],
    cta: "Join as Member",
    highlighted: true,
    academyAllocation: 1470, // 30% of $49 = $14.70
    collectiveAllocation: 3430, // 70% of $49 = $34.30
  },
  builder: {
    id: "builder",
    name: "Builder",
    description: "Form your business and establish your House",
    monthlyPrice: 14900, // $149.00 in cents
    annualPrice: 129900, // $1,299.00/year ($108.25/mo — ~27% savings)
    interval: "month" as const,
    stripePriceIdMonthly: null as string | null,
    stripePriceIdAnnual: null as string | null,
    features: [
      "Everything in Member",
      "Business Formation wizard (entity + EIN + compliance)",
      "House establishment (customized management structure)",
      "Operational dashboard with all House tools",
      "Document vault (unlimited)",
      "Grant writing tools & funding resources",
      "Mentorship access",
    ],
    cta: "Join as Builder",
    highlighted: false,
    academyAllocation: 4470, // 30% of $149 = $44.70
    collectiveAllocation: 10430, // 70% of $149 = $104.30
  },
  partner: {
    id: "partner",
    name: "Collective Partner",
    description: "Deep commitment to building the L.A.W.S. ecosystem",
    monthlyPrice: null, // Custom / application-based
    annualPrice: null,
    interval: null,
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    features: [
      "Everything in Builder",
      "Contractor transition pathway (after 2 years)",
      "Board Member eligibility (Founding Members)",
      "Profit share participation",
      "Full L.A.W.S. ecosystem integration",
      "Dedicated success manager",
      "Governance voting rights",
    ],
    cta: "Apply to Partner",
    highlighted: false,
    academyAllocation: null,
    collectiveAllocation: null,
  },
} as const;

// ─── Academy Pass (Standalone) ───
// 100% revenue goes to 508(c)(1)(a) entity
export const ACADEMY_PASS = {
  id: "academy_pass",
  name: "Academy Pass",
  description: "Full access to LuvOnPurpose Academy and Outreach education programs",
  monthlyPrice: 2900, // $29.00 in cents
  annualPrice: 24900, // $249.00/year ($20.75/mo — ~28% savings)
  interval: "month" as const,
  stripePriceIdMonthly: null as string | null,
  stripePriceIdAnnual: null as string | null,
  features: [
    "Complete K-12 homeschool curriculum",
    "Financial literacy courses",
    "Business simulators",
    "Coding & AI technology modules",
    "Skilled labor certification programs",
    "Certificate of completion",
    "Self-paced, progress-based learning",
  ],
  notes: [
    "Scholarship program available for community members",
    "Included with L.A.W.S. Collective Member and Builder plans",
  ],
  cta: "Enroll Now",
  academyAllocation: 2900, // 100% to Academy entity
  collectiveAllocation: 0,
} as const;

// ─── Legacy exports for backward compatibility ───
export const MEMBERSHIP_PRODUCTS = {
  community: COLLECTIVE_TIERS.explorer,
  academy: ACADEMY_PASS,
  houseBuilder: COLLECTIVE_TIERS.builder,
  foundingMember: COLLECTIVE_TIERS.partner,
} as const;

export const MERCHANDISE_CATEGORIES = {
  apparel: {
    id: "apparel",
    name: "Apparel",
    description: "Branded clothing and accessories",
  },
  accessories: {
    id: "accessories",
    name: "Accessories",
    description: "Branded accessories and gear",
  },
  digital: {
    id: "digital",
    name: "Digital Products",
    description: "Digital downloads and resources",
  },
} as const;

export const MERCHANDISE_PRODUCTS = [
  {
    id: "laws_tshirt",
    name: "The L.A.W.S. Collective T-Shirt",
    description: "Premium cotton t-shirt with L.A.W.S. logo",
    price: 3500,
    category: "apparel",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Forest Green"],
    image: "/merchandise/tshirt.jpg",
  },
  {
    id: "laws_hoodie",
    name: "The L.A.W.S. Collective Hoodie",
    description: "Comfortable hoodie with embroidered logo",
    price: 6500,
    category: "apparel",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: ["Black", "Heather Gray"],
    image: "/merchandise/hoodie.jpg",
  },
  {
    id: "laws_cap",
    name: "The L.A.W.S. Collective Cap",
    description: "Adjustable cap with embroidered logo",
    price: 2500,
    category: "accessories",
    colors: ["Black", "Green", "Khaki"],
    image: "/merchandise/cap.jpg",
  },
  {
    id: "laws_journal",
    name: "Sovereign Wealth Journal",
    description: "Premium journal for tracking your wealth-building journey",
    price: 2000,
    category: "accessories",
    image: "/merchandise/journal.jpg",
  },
  {
    id: "laws_workbook",
    name: "Financial Literacy Workbook (Digital)",
    description: "Comprehensive digital workbook for financial education",
    price: 1500,
    category: "digital",
    image: "/merchandise/workbook.jpg",
  },
] as const;

export type CollectiveTier = keyof typeof COLLECTIVE_TIERS;
export type MembershipTier = keyof typeof MEMBERSHIP_PRODUCTS;
export type MerchandiseProduct = (typeof MERCHANDISE_PRODUCTS)[number];
