// Stripe Products and Prices Configuration
// These are defined centrally for consistency across the application

export const MEMBERSHIP_PRODUCTS = {
  community: {
    id: "community_member",
    name: "Community Member",
    description: "Start your journey with access to basic resources",
    price: 0, // Free tier
    interval: null,
    features: [
      "L.A.W.S. Framework introduction",
      "Community forum access",
      "Basic financial literacy content",
      "Newsletter updates",
    ],
  },
  academy: {
    id: "academy_member",
    name: "Academy Member",
    description: "Full access to education and training programs",
    price: 2900, // $29.00 in cents
    interval: "month" as const,
    features: [
      "All Community features",
      "Complete Academy curriculum",
      "Business simulators",
      "Certificate programs",
      "Live workshops",
      "Priority support",
    ],
  },
  houseBuilder: {
    id: "house_builder",
    name: "House Builder",
    description: "Build your family's sovereign business structure",
    price: 9900, // $99.00 in cents
    interval: "month" as const,
    features: [
      "All Academy features",
      "House registration & setup",
      "Trust formation guidance",
      "Business entity creation",
      "Document vault (unlimited)",
      "Revenue tracking dashboard",
      "1-on-1 consultation (monthly)",
    ],
  },
  foundingMember: {
    id: "founding_member",
    name: "Founding Member",
    description: "Full partnership with governance rights",
    price: 29900, // $299.00 in cents
    interval: "month" as const,
    features: [
      "All House Builder features",
      "Decision Board voting rights",
      "Network Pool participation",
      "Branded merchandise discounts",
      "Grant application support",
      "Dedicated success manager",
      "Early access to new features",
    ],
  },
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

// Sample merchandise products
export const MERCHANDISE_PRODUCTS = [
  {
    id: "laws_tshirt",
    name: "L.A.W.S. Collective T-Shirt",
    description: "Premium cotton t-shirt with L.A.W.S. logo",
    price: 3500, // $35.00
    category: "apparel",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: ["Black", "White", "Forest Green"],
    image: "/merchandise/tshirt.jpg",
  },
  {
    id: "laws_hoodie",
    name: "L.A.W.S. Collective Hoodie",
    description: "Comfortable hoodie with embroidered logo",
    price: 6500, // $65.00
    category: "apparel",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: ["Black", "Heather Gray"],
    image: "/merchandise/hoodie.jpg",
  },
  {
    id: "laws_cap",
    name: "L.A.W.S. Collective Cap",
    description: "Adjustable cap with embroidered logo",
    price: 2500, // $25.00
    category: "accessories",
    colors: ["Black", "Green", "Khaki"],
    image: "/merchandise/cap.jpg",
  },
  {
    id: "laws_journal",
    name: "Sovereign Wealth Journal",
    description: "Premium journal for tracking your wealth-building journey",
    price: 2000, // $20.00
    category: "accessories",
    image: "/merchandise/journal.jpg",
  },
  {
    id: "laws_workbook",
    name: "Financial Literacy Workbook (Digital)",
    description: "Comprehensive digital workbook for financial education",
    price: 1500, // $15.00
    category: "digital",
    image: "/merchandise/workbook.jpg",
  },
] as const;

export type MembershipTier = keyof typeof MEMBERSHIP_PRODUCTS;
export type MerchandiseProduct = typeof MERCHANDISE_PRODUCTS[number];
