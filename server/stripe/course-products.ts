// L.A.W.S. Course and Consulting Products
// One-time purchase products for immediate revenue generation

export const COURSE_PRODUCTS = {
  lawsFoundation: {
    id: "laws_foundation_course",
    name: "L.A.W.S. Foundation Course",
    description: "Master the 4-pillar framework for building generational wealth through Land, Air, Water, and Self alignment",
    price: 9700, // $97.00 in cents
    type: "one_time" as const,
    features: [
      "4 comprehensive modules (LAND, AIR, WATER, SELF)",
      "12+ hours of video content",
      "Downloadable workbooks and templates",
      "Family history mapping toolkit",
      "Financial literacy assessments",
      "Certificate of completion",
      "Lifetime access to course materials",
      "Private community access",
    ],
    modules: [
      {
        id: "land",
        title: "LAND - Reconnection & Stability",
        description: "Understand your roots, migrations, and family history to build a stable foundation",
        lessons: [
          "Introduction to the L.A.W.S. Framework",
          "Mapping Your Family History & Migrations",
          "Understanding Land Ownership & Legacy",
          "Reconnecting with Your Ancestral Roots",
          "Building Stability Through Knowledge",
        ],
        duration: "3 hours",
      },
      {
        id: "air",
        title: "AIR - Education & Knowledge",
        description: "Learning, personal development, and effective communication strategies",
        lessons: [
          "The Power of Financial Education",
          "Communication Skills for Wealth Building",
          "Personal Development Roadmap",
          "Teaching Financial Literacy to Family",
          "Building a Learning Culture",
        ],
        duration: "3 hours",
      },
      {
        id: "water",
        title: "WATER - Healing & Balance",
        description: "Emotional resilience, healing cycles, and healthy decision-making",
        lessons: [
          "Understanding Generational Patterns",
          "Healing Financial Trauma",
          "Building Emotional Resilience",
          "Decision-Making Frameworks",
          "Creating Balance in Life & Business",
        ],
        duration: "3 hours",
      },
      {
        id: "self",
        title: "SELF - Purpose & Skills",
        description: "Financial literacy, business readiness, and purposeful growth",
        lessons: [
          "Discovering Your Financial Purpose",
          "Business Readiness Assessment",
          "Skill Development for Wealth Creation",
          "Building Your Personal Brand",
          "Creating Your Wealth Action Plan",
        ],
        duration: "3 hours",
      },
    ],
  },
} as const;

export const CONSULTING_PRODUCTS = {
  strategySession: {
    id: "laws_strategy_session",
    name: "L.A.W.S. Strategy Session",
    description: "90-minute 1-on-1 consultation with a L.A.W.S. certified advisor to create your personalized wealth-building roadmap",
    price: 29700, // $297.00 in cents
    type: "one_time" as const,
    duration: "90 minutes",
    features: [
      "90-minute private video consultation",
      "Personalized L.A.W.S. assessment",
      "Custom wealth-building roadmap",
      "Entity structure recommendations",
      "Trust formation guidance",
      "Action plan with next steps",
      "30-day email follow-up support",
      "Recording of your session",
    ],
    includes: [
      "Pre-session questionnaire",
      "L.A.W.S. assessment review",
      "Live strategy development",
      "Written summary & action plan",
      "Resource recommendations",
    ],
  },
  vipDay: {
    id: "laws_vip_day",
    name: "L.A.W.S. VIP Implementation Day",
    description: "Full-day intensive to set up your complete wealth-building infrastructure",
    price: 99700, // $997.00 in cents
    type: "one_time" as const,
    duration: "6 hours",
    features: [
      "6-hour intensive working session",
      "Complete L.A.W.S. system setup",
      "Entity structure implementation",
      "Document vault organization",
      "Financial tracking system setup",
      "90-day implementation support",
      "Priority email & chat access",
      "Quarterly check-in calls (3 months)",
    ],
  },
} as const;

// Combined products for easy access
export const ALL_PRODUCTS = {
  ...COURSE_PRODUCTS,
  ...CONSULTING_PRODUCTS,
} as const;

export type CourseProduct = typeof COURSE_PRODUCTS[keyof typeof COURSE_PRODUCTS];
export type ConsultingProduct = typeof CONSULTING_PRODUCTS[keyof typeof CONSULTING_PRODUCTS];
