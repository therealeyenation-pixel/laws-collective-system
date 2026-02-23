import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  BookOpen,
  FileText,
  Download,
  Trophy,
  Lightbulb,
  Target,
  Shield,
  Heart,
  Car,
  Home,
  Briefcase,
  Users,
  AlertTriangle,
  DollarSign,
  FileCheck,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface CourseModule {
  id: number;
  title: string;
  type: "lesson" | "quiz" | "worksheet";
  content: LessonContent | QuizContent | WorksheetContent;
}

interface LessonContent {
  title: string;
  sections: {
    heading: string;
    text: string;
    tips?: string[];
  }[];
  keyTakeaways: string[];
}

interface QuizContent {
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

interface WorksheetContent {
  title: string;
  description: string;
  fields: {
    id: string;
    label: string;
    type: "text" | "textarea" | "select" | "number";
    placeholder?: string;
    options?: { value: string; label: string; disabled?: boolean }[] | string[];
    required?: boolean;
    aiAssist?: boolean;
    helpText?: string;
  }[];
  outputTemplate: string;
}

interface InsuranceData {
  // Personal Insurance
  fullName: string;
  dateOfBirth: string;
  dependents: string;
  annualIncome: string;
  healthConditions: string;
  lifeInsuranceAmount: string;
  healthPlanType: string;
  autoVehicles: string;
  homeValue: string;
  disabilityNeeds: string;
  // Business Insurance
  businessName: string;
  businessType: string;
  employeeCount: string;
  annualRevenue: string;
  industryRisks: string;
  generalLiabilityLimit: string;
  professionalLiabilityLimit: string;
  propertyValue: string;
  workersCompNeeds: string;
  doInsuranceNeeds: string;
  cyberInsuranceNeeds: string;
  // Coverage Summary
  totalPersonalPremium: string;
  totalBusinessPremium: string;
  coverageGaps: string;
  recommendations: string;
}

interface InsuranceCourseProps {
  onExit: () => void;
  onComplete: (tokens: number) => void;
  connectedEntity?: { name: string; type: string };
}

const insuranceModules: CourseModule[] = [
  {
    id: 1,
    title: "Module 1: Insurance Fundamentals",
    type: "lesson",
    content: {
      title: "Understanding Insurance: Protection for Life and Business",
      sections: [
        {
          heading: "What is Insurance?",
          text: "Insurance is a contract (policy) in which an insurer indemnifies another against losses from specific contingencies or perils. It's a risk management tool that transfers the financial risk of life's events from you to an insurance company in exchange for premium payments.",
          tips: [
            "Insurance doesn't prevent bad things from happening—it helps you recover financially when they do",
            "The key principle is 'risk pooling'—many people pay premiums so the few who suffer losses can be compensated",
            "Understanding your risks is the first step to proper coverage"
          ]
        },
        {
          heading: "Types of Insurance Coverage",
          text: "Insurance broadly falls into two categories: Personal Insurance (protecting individuals and families) and Business Insurance (protecting companies and their operations). Personal insurance includes life, health, auto, home, and disability coverage. Business insurance includes general liability, professional liability, property, workers' compensation, and directors & officers (D&O) coverage.",
          tips: [
            "Most people are underinsured—review coverage annually",
            "Business insurance requirements vary by industry and state",
            "Some coverages are legally required (auto liability, workers' comp)"
          ]
        },
        {
          heading: "Key Insurance Terms",
          text: "Premium: The amount you pay for coverage. Deductible: What you pay before insurance kicks in. Coverage Limit: Maximum amount the insurer will pay. Exclusions: What's NOT covered. Rider/Endorsement: Additional coverage added to a policy. Beneficiary: Person who receives benefits (life insurance). Underwriting: Process insurers use to evaluate risk.",
          tips: [
            "Higher deductibles = lower premiums (but more out-of-pocket risk)",
            "Always read exclusions carefully—they define what's NOT covered",
            "Keep beneficiary designations updated"
          ]
        }
      ],
      keyTakeaways: [
        "Insurance transfers financial risk from you to an insurer",
        "Personal and business insurance serve different protection needs",
        "Understanding terms helps you make informed coverage decisions",
        "Review and update coverage regularly as circumstances change"
      ]
    } as LessonContent
  },
  {
    id: 2,
    title: "Module 2: Insurance Knowledge Check",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What is the primary purpose of insurance?",
          options: [
            "A. To make money from premiums",
            "B. To transfer financial risk from individuals to insurers",
            "C. To prevent accidents from happening",
            "D. To provide investment returns"
          ],
          correctIndex: 1,
          explanation: "Insurance transfers financial risk. While it doesn't prevent bad events, it helps you recover financially when they occur through the principle of risk pooling."
        },
        {
          question: "What is a deductible?",
          options: [
            "A. The monthly payment for insurance",
            "B. The maximum amount an insurer will pay",
            "C. The amount you pay before insurance coverage begins",
            "D. A discount on your premium"
          ],
          correctIndex: 2,
          explanation: "A deductible is the amount you pay out-of-pocket before your insurance coverage kicks in. Higher deductibles typically mean lower premiums."
        },
        {
          question: "Which type of insurance is typically required by law for businesses with employees?",
          options: [
            "A. Life insurance",
            "B. Cyber insurance",
            "C. Workers' compensation insurance",
            "D. Directors & Officers insurance"
          ],
          correctIndex: 2,
          explanation: "Workers' compensation insurance is legally required in most states for businesses with employees. It covers medical expenses and lost wages for work-related injuries."
        }
      ]
    } as QuizContent
  },
  {
    id: 3,
    title: "Module 3: Personal Insurance Assessment",
    type: "worksheet",
    content: {
      title: "Personal Insurance Needs Assessment",
      description: "Complete this assessment to identify your personal insurance needs. The AI assistant can help you determine appropriate coverage levels based on your situation.",
      fields: [
        {
          id: "fullName",
          label: "Full Legal Name",
          type: "text",
          placeholder: "Enter your full legal name",
          required: true,
          helpText: "As it appears on legal documents"
        },
        {
          id: "dateOfBirth",
          label: "Date of Birth",
          type: "text",
          placeholder: "MM/DD/YYYY",
          required: true,
          helpText: "Age affects life and health insurance rates"
        },
        {
          id: "dependents",
          label: "Number of Dependents",
          type: "select",
          options: [
            { value: "0", label: "0 - No dependents" },
            { value: "1", label: "1 dependent" },
            { value: "2", label: "2 dependents" },
            { value: "3", label: "3 dependents" },
            { value: "4+", label: "4 or more dependents" }
          ],
          required: true,
          helpText: "Dependents increase life insurance needs"
        },
        {
          id: "annualIncome",
          label: "Annual Household Income",
          type: "select",
          options: [
            { value: "under50k", label: "Under $50,000" },
            { value: "50k-100k", label: "$50,000 - $100,000" },
            { value: "100k-200k", label: "$100,000 - $200,000" },
            { value: "200k-500k", label: "$200,000 - $500,000" },
            { value: "over500k", label: "Over $500,000" }
          ],
          required: true,
          helpText: "Income determines coverage amounts needed"
        },
        {
          id: "healthConditions",
          label: "Pre-existing Health Conditions",
          type: "textarea",
          placeholder: "List any chronic conditions, medications, or health concerns...",
          aiAssist: true,
          helpText: "AI can suggest appropriate health plan types based on your conditions"
        },
        {
          id: "lifeInsuranceAmount",
          label: "Recommended Life Insurance Coverage",
          type: "select",
          options: [
            { value: "100k", label: "$100,000" },
            { value: "250k", label: "$250,000" },
            { value: "500k", label: "$500,000" },
            { value: "1m", label: "$1,000,000" },
            { value: "2m+", label: "$2,000,000+" }
          ],
          aiAssist: true,
          helpText: "Rule of thumb: 10-12x annual income, plus debts"
        },
        {
          id: "healthPlanType",
          label: "Health Insurance Plan Type",
          type: "select",
          options: [
            { value: "hmo", label: "HMO - Lower cost, limited network" },
            { value: "ppo", label: "PPO - Higher cost, more flexibility" },
            { value: "hdhp", label: "HDHP + HSA - High deductible with tax savings" },
            { value: "epo", label: "EPO - Network only, no referrals needed" }
          ],
          helpText: "Consider your healthcare usage and budget"
        },
        {
          id: "autoVehicles",
          label: "Vehicles to Insure",
          type: "textarea",
          placeholder: "List vehicles: Year, Make, Model, Estimated Value...",
          helpText: "Include all household vehicles"
        },
        {
          id: "homeValue",
          label: "Home/Property Value",
          type: "text",
          placeholder: "$000,000",
          helpText: "Replacement cost, not market value"
        },
        {
          id: "disabilityNeeds",
          label: "Disability Insurance Needs",
          type: "select",
          options: [
            { value: "none", label: "Not needed - have employer coverage" },
            { value: "shortterm", label: "Short-term disability only" },
            { value: "longterm", label: "Long-term disability only" },
            { value: "both", label: "Both short and long-term" }
          ],
          helpText: "Protects income if you can't work due to illness/injury"
        }
      ],
      outputTemplate: `PERSONAL INSURANCE ASSESSMENT
==============================

Prepared for: {{fullName}}
Date of Birth: {{dateOfBirth}}
Assessment Date: {{currentDate}}

HOUSEHOLD PROFILE
-----------------
Dependents: {{dependents}}
Annual Income: {{annualIncome}}
Health Conditions: {{healthConditions}}

RECOMMENDED COVERAGE
--------------------

LIFE INSURANCE
Coverage Amount: {{lifeInsuranceAmount}}
Purpose: Income replacement and debt coverage for dependents

HEALTH INSURANCE
Plan Type: {{healthPlanType}}
Considerations: Based on health conditions and usage patterns

AUTO INSURANCE
Vehicles: {{autoVehicles}}
Recommended: Liability + Comprehensive + Collision

HOMEOWNERS/RENTERS INSURANCE
Property Value: {{homeValue}}
Coverage: Dwelling + Personal Property + Liability

DISABILITY INSURANCE
Coverage Type: {{disabilityNeeds}}
Purpose: Income protection during inability to work

NEXT STEPS
----------
1. Obtain quotes from multiple insurers
2. Review policy exclusions carefully
3. Consider umbrella policy for additional liability protection
4. Review and update coverage annually

This assessment is for planning purposes. Consult with a licensed insurance professional for specific recommendations.`
    } as WorksheetContent
  },
  {
    id: 4,
    title: "Module 4: Personal Insurance Deep Dive",
    type: "lesson",
    content: {
      title: "Personal Insurance Types Explained",
      sections: [
        {
          heading: "Life Insurance",
          text: "Life insurance provides financial protection for your dependents if you die. Term Life is pure protection for a set period (10, 20, 30 years)—affordable and straightforward. Whole Life provides lifetime coverage with a cash value component—more expensive but builds equity. Universal Life offers flexible premiums and death benefits. The general rule: coverage should equal 10-12x your annual income plus outstanding debts.",
          tips: [
            "Term life is best for most people—affordable and covers your working years",
            "Buy when young and healthy for lowest rates",
            "Review beneficiaries after major life events (marriage, divorce, children)"
          ]
        },
        {
          heading: "Health Insurance",
          text: "Health insurance covers medical expenses. HMO (Health Maintenance Organization) has lower premiums but requires using network providers and referrals. PPO (Preferred Provider Organization) costs more but offers flexibility to see any provider. HDHP (High Deductible Health Plan) paired with an HSA (Health Savings Account) offers tax advantages for healthy individuals. Consider your health needs, preferred doctors, and budget when choosing.",
          tips: [
            "HDHPs with HSAs are excellent for healthy individuals—triple tax advantage",
            "Always check if your doctors are in-network before enrolling",
            "Preventive care is typically covered 100% under ACA plans"
          ]
        },
        {
          heading: "Auto and Home Insurance",
          text: "Auto insurance is legally required in most states. Liability covers damage you cause to others. Collision covers your vehicle in accidents. Comprehensive covers theft, weather, and non-collision damage. Homeowners insurance protects your dwelling, personal property, and provides liability coverage. Renters insurance covers personal property and liability for tenants. Consider an umbrella policy for additional liability protection beyond standard limits.",
          tips: [
            "Bundle auto and home for discounts (typically 10-25%)",
            "Document valuables with photos/receipts for claims",
            "Umbrella policies are inexpensive for significant additional coverage"
          ]
        },
        {
          heading: "Disability Insurance",
          text: "Disability insurance replaces income if you can't work due to illness or injury. Short-term disability covers weeks to months. Long-term disability covers years to retirement. Own-occupation policies pay if you can't do YOUR job. Any-occupation policies only pay if you can't do ANY job. Most people underestimate disability risk—you're more likely to become disabled than die during working years.",
          tips: [
            "Aim for 60-70% income replacement",
            "Own-occupation coverage is worth the extra cost for professionals",
            "Check if employer provides coverage before buying individual policy"
          ]
        }
      ],
      keyTakeaways: [
        "Life insurance: 10-12x income for dependents' protection",
        "Health insurance: Match plan type to your healthcare needs and budget",
        "Auto/Home: Required coverage plus umbrella for comprehensive protection",
        "Disability: Often overlooked but critical for income protection"
      ]
    } as LessonContent
  },
  {
    id: 5,
    title: "Module 5: Personal Insurance Quiz",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What is the general rule for how much life insurance coverage you need?",
          options: [
            "A. 2-3x annual income",
            "B. 5x annual income",
            "C. 10-12x annual income plus debts",
            "D. Equal to your home value"
          ],
          correctIndex: 2,
          explanation: "The general guideline is 10-12 times your annual income plus outstanding debts. This ensures your dependents can maintain their lifestyle and pay off obligations."
        },
        {
          question: "Which health plan type offers a triple tax advantage when paired with an HSA?",
          options: [
            "A. HMO",
            "B. PPO",
            "C. HDHP (High Deductible Health Plan)",
            "D. EPO"
          ],
          correctIndex: 2,
          explanation: "HDHPs paired with HSAs offer triple tax advantages: contributions are tax-deductible, growth is tax-free, and withdrawals for medical expenses are tax-free."
        },
        {
          question: "Why is disability insurance often considered more important than life insurance for working adults?",
          options: [
            "A. It's cheaper",
            "B. You're more likely to become disabled than die during working years",
            "C. It covers more expenses",
            "D. It's required by law"
          ],
          correctIndex: 1,
          explanation: "Statistics show you're more likely to become disabled during your working years than to die. Disability insurance protects your most valuable asset—your ability to earn income."
        }
      ]
    } as QuizContent
  },
  {
    id: 6,
    title: "Module 6: Business Insurance Fundamentals",
    type: "lesson",
    content: {
      title: "Protecting Your Business: Essential Coverage",
      sections: [
        {
          heading: "Why Business Insurance Matters",
          text: "Business insurance protects your company from financial losses due to lawsuits, property damage, employee injuries, and other risks. Without proper coverage, a single lawsuit or disaster could bankrupt your business. Many types of business insurance are legally required, and others are practically essential for operations. Lenders, landlords, and clients often require proof of insurance.",
          tips: [
            "One lawsuit can destroy years of business building",
            "Insurance requirements vary by industry and state",
            "Proper coverage enables you to take calculated business risks"
          ]
        },
        {
          heading: "General Liability Insurance",
          text: "General Liability (GL) is the foundation of business insurance. It covers third-party bodily injury (customer slips in your store), property damage (you damage a client's property), personal and advertising injury (libel, slander), and medical payments. Most businesses need $1-2 million in GL coverage. It's often required by landlords, contracts, and licenses.",
          tips: [
            "GL is often the first policy businesses purchase",
            "Coverage limits should match your risk exposure",
            "Consider higher limits if you have significant client interaction"
          ]
        },
        {
          heading: "Professional Liability (E&O) Insurance",
          text: "Professional Liability, also called Errors & Omissions (E&O), covers claims arising from professional services or advice. It protects against negligence, mistakes, failure to deliver services, and misrepresentation. Essential for consultants, accountants, lawyers, healthcare providers, and any business providing professional advice or services.",
          tips: [
            "Even unfounded claims cost money to defend",
            "Coverage should match your professional exposure",
            "Some professions legally require E&O coverage"
          ]
        },
        {
          heading: "Property and Workers' Compensation",
          text: "Business Property Insurance covers your physical assets—buildings, equipment, inventory, and furniture—against fire, theft, vandalism, and natural disasters. Workers' Compensation is legally required in most states if you have employees. It covers medical expenses and lost wages for work-related injuries and illnesses, and protects you from employee lawsuits.",
          tips: [
            "Property insurance should cover replacement cost, not depreciated value",
            "Workers' comp requirements vary by state and employee count",
            "Even 'safe' businesses have workers' comp claims"
          ]
        }
      ],
      keyTakeaways: [
        "Business insurance is essential for financial protection and often legally required",
        "General Liability is the foundation—covers third-party claims",
        "Professional Liability protects service-based businesses from malpractice claims",
        "Property and Workers' Comp protect your assets and employees"
      ]
    } as LessonContent
  },
  {
    id: 7,
    title: "Module 7: Business Insurance Quiz",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What does General Liability insurance primarily cover?",
          options: [
            "A. Employee injuries on the job",
            "B. Professional mistakes and negligence",
            "C. Third-party bodily injury and property damage",
            "D. Business owner's personal assets"
          ],
          correctIndex: 2,
          explanation: "General Liability covers third-party claims—when someone outside your business (customer, visitor) is injured or their property is damaged due to your business operations."
        },
        {
          question: "Which type of insurance is legally required in most states for businesses with employees?",
          options: [
            "A. General Liability",
            "B. Professional Liability",
            "C. Cyber Insurance",
            "D. Workers' Compensation"
          ],
          correctIndex: 3,
          explanation: "Workers' Compensation is legally mandated in most states for businesses with employees. It covers medical expenses and lost wages for work-related injuries."
        },
        {
          question: "What is another name for Professional Liability insurance?",
          options: [
            "A. General Liability",
            "B. Errors & Omissions (E&O)",
            "C. Directors & Officers (D&O)",
            "D. Umbrella Insurance"
          ],
          correctIndex: 1,
          explanation: "Professional Liability is also called Errors & Omissions (E&O) insurance. It covers claims arising from professional services, advice, or negligence."
        }
      ]
    } as QuizContent
  },
  {
    id: 8,
    title: "Module 8: Business Insurance Assessment",
    type: "worksheet",
    content: {
      title: "Business Insurance Needs Assessment",
      description: "Complete this assessment to identify your business insurance needs. AI assistance is available to help determine appropriate coverage levels based on your industry and risk profile.",
      fields: [
        {
          id: "businessName",
          label: "Business Legal Name",
          type: "text",
          placeholder: "Enter your business legal name",
          required: true,
          helpText: "As registered with your state"
        },
        {
          id: "businessType",
          label: "Business Entity Type",
          type: "select",
          options: [
            { value: "sole_prop", label: "Sole Proprietorship" },
            { value: "llc", label: "LLC" },
            { value: "s_corp", label: "S Corporation" },
            { value: "c_corp", label: "C Corporation" },
            { value: "partnership", label: "Partnership" },
            { value: "nonprofit", label: "Nonprofit Organization" }
          ],
          required: true,
          helpText: "Entity type affects liability exposure"
        },
        {
          id: "industryType",
          label: "Industry/Business Category",
          type: "select",
          options: [
            { value: "professional_services", label: "Professional Services (Consulting, Legal, Accounting)" },
            { value: "healthcare", label: "Healthcare/Medical" },
            { value: "technology", label: "Technology/Software" },
            { value: "retail", label: "Retail/E-commerce" },
            { value: "construction", label: "Construction/Contracting" },
            { value: "manufacturing", label: "Manufacturing" },
            { value: "food_service", label: "Food Service/Restaurant" },
            { value: "real_estate", label: "Real Estate" },
            { value: "education", label: "Education" },
            { value: "other", label: "Other" }
          ],
          required: true,
          aiAssist: true,
          helpText: "Industry determines specific coverage needs"
        },
        {
          id: "employeeCount",
          label: "Number of Employees",
          type: "select",
          options: [
            { value: "0", label: "0 - Solo/Owner only" },
            { value: "1-5", label: "1-5 employees" },
            { value: "6-25", label: "6-25 employees" },
            { value: "26-100", label: "26-100 employees" },
            { value: "100+", label: "100+ employees" }
          ],
          required: true,
          helpText: "Determines workers' comp and other requirements"
        },
        {
          id: "annualRevenue",
          label: "Annual Revenue",
          type: "select",
          options: [
            { value: "under100k", label: "Under $100,000" },
            { value: "100k-500k", label: "$100,000 - $500,000" },
            { value: "500k-1m", label: "$500,000 - $1,000,000" },
            { value: "1m-5m", label: "$1,000,000 - $5,000,000" },
            { value: "over5m", label: "Over $5,000,000" }
          ],
          required: true,
          helpText: "Revenue affects coverage limits needed"
        },
        {
          id: "industryRisks",
          label: "Specific Industry Risks",
          type: "textarea",
          placeholder: "Describe specific risks in your industry (e.g., client data handling, physical hazards, professional advice given)...",
          aiAssist: true,
          helpText: "AI can suggest coverage based on your specific risks"
        },
        {
          id: "generalLiabilityLimit",
          label: "General Liability Coverage Limit",
          type: "select",
          options: [
            { value: "500k", label: "$500,000" },
            { value: "1m", label: "$1,000,000" },
            { value: "2m", label: "$2,000,000" },
            { value: "5m", label: "$5,000,000" }
          ],
          aiAssist: true,
          helpText: "Most businesses need $1-2M minimum"
        },
        {
          id: "professionalLiabilityLimit",
          label: "Professional Liability (E&O) Coverage",
          type: "select",
          options: [
            { value: "none", label: "Not needed for my business" },
            { value: "500k", label: "$500,000" },
            { value: "1m", label: "$1,000,000" },
            { value: "2m", label: "$2,000,000" }
          ],
          helpText: "Required for service-based businesses"
        },
        {
          id: "propertyValue",
          label: "Business Property Value",
          type: "text",
          placeholder: "$000,000",
          helpText: "Equipment, inventory, furniture, improvements"
        },
        {
          id: "workersCompNeeds",
          label: "Workers' Compensation Needs",
          type: "select",
          options: [
            { value: "not_required", label: "Not required (no employees)" },
            { value: "required", label: "Required - have employees" },
            { value: "exempt", label: "Exempt in my state" }
          ],
          helpText: "Required in most states with employees"
        },
        {
          id: "doInsuranceNeeds",
          label: "Directors & Officers (D&O) Insurance",
          type: "select",
          options: [
            { value: "not_needed", label: "Not needed" },
            { value: "needed", label: "Needed - have board/investors" },
            { value: "considering", label: "Considering for future growth" }
          ],
          helpText: "Protects leadership from personal liability"
        },
        {
          id: "cyberInsuranceNeeds",
          label: "Cyber Liability Insurance",
          type: "select",
          options: [
            { value: "not_needed", label: "Not needed - minimal data handling" },
            { value: "basic", label: "Basic coverage - some customer data" },
            { value: "comprehensive", label: "Comprehensive - significant data/online presence" }
          ],
          aiAssist: true,
          helpText: "Essential if you handle customer data or operate online"
        }
      ],
      outputTemplate: `BUSINESS INSURANCE ASSESSMENT
==============================

Business: {{businessName}}
Entity Type: {{businessType}}
Industry: {{industryType}}
Assessment Date: {{currentDate}}

BUSINESS PROFILE
----------------
Employees: {{employeeCount}}
Annual Revenue: {{annualRevenue}}
Property Value: {{propertyValue}}

IDENTIFIED RISKS
----------------
{{industryRisks}}

RECOMMENDED COVERAGE
--------------------

GENERAL LIABILITY
Coverage Limit: {{generalLiabilityLimit}}
Purpose: Third-party bodily injury and property damage

PROFESSIONAL LIABILITY (E&O)
Coverage Limit: {{professionalLiabilityLimit}}
Purpose: Protection against professional negligence claims

BUSINESS PROPERTY
Coverage Amount: {{propertyValue}}
Purpose: Equipment, inventory, and improvements protection

WORKERS' COMPENSATION
Status: {{workersCompNeeds}}
Purpose: Employee injury and illness coverage

DIRECTORS & OFFICERS (D&O)
Status: {{doInsuranceNeeds}}
Purpose: Leadership personal liability protection

CYBER LIABILITY
Coverage Level: {{cyberInsuranceNeeds}}
Purpose: Data breach and cyber incident protection

ADDITIONAL CONSIDERATIONS
-------------------------
- Business Interruption Insurance
- Commercial Auto Insurance (if applicable)
- Umbrella/Excess Liability Policy
- Employment Practices Liability (EPLI)

NEXT STEPS
----------
1. Obtain quotes from commercial insurance brokers
2. Review policy exclusions and limitations
3. Consider Business Owner's Policy (BOP) for bundled savings
4. Review coverage annually as business grows

This assessment is for planning purposes. Consult with a licensed commercial insurance broker for specific recommendations.`
    } as WorksheetContent
  },
  {
    id: 9,
    title: "Module 9: Advanced Business Coverage",
    type: "lesson",
    content: {
      title: "Specialized Business Insurance Coverage",
      sections: [
        {
          heading: "Directors & Officers (D&O) Insurance",
          text: "D&O insurance protects company leaders from personal liability for decisions made while managing the company. It covers legal defense costs, settlements, and judgments. Essential for companies with boards, investors, or plans to raise capital. Covers claims from shareholders, employees, competitors, and regulators. Without D&O, directors and officers could lose personal assets.",
          tips: [
            "Required by most investors before funding",
            "Covers past, present, and future directors/officers",
            "Consider even for small LLCs with multiple members"
          ]
        },
        {
          heading: "Cyber Liability Insurance",
          text: "Cyber insurance covers losses from data breaches, hacking, ransomware, and other cyber incidents. First-party coverage handles your direct losses (data recovery, business interruption, ransom payments). Third-party coverage handles claims from affected customers. Increasingly essential as businesses rely on digital operations and handle sensitive data.",
          tips: [
            "Average data breach costs $4.45 million (2023)",
            "Small businesses are frequent targets—60% close within 6 months of breach",
            "Coverage should include incident response services"
          ]
        },
        {
          heading: "Business Interruption Insurance",
          text: "Business Interruption (BI) insurance covers lost income when your business can't operate due to a covered event (fire, natural disaster, etc.). It pays for ongoing expenses (rent, payroll, loan payments) during the recovery period. Often included in property policies but may need separate coverage. Critical for businesses that can't quickly relocate or resume operations.",
          tips: [
            "Calculate your actual business interruption exposure",
            "Coverage period should match realistic recovery time",
            "Consider contingent BI for supply chain disruptions"
          ]
        },
        {
          heading: "Employment Practices Liability (EPLI)",
          text: "EPLI covers claims from employees alleging discrimination, harassment, wrongful termination, or other employment-related issues. Even unfounded claims are expensive to defend. Coverage includes legal defense, settlements, and judgments. Essential as employment lawsuits increase and become more costly.",
          tips: [
            "Average employment lawsuit costs $200,000+ to defend",
            "Covers claims from current, former, and prospective employees",
            "HR best practices can reduce premiums"
          ]
        }
      ],
      keyTakeaways: [
        "D&O protects leadership from personal liability—essential for growth",
        "Cyber insurance is no longer optional in the digital age",
        "Business Interruption ensures survival during forced closures",
        "EPLI protects against costly employment-related claims"
      ]
    } as LessonContent
  },
  {
    id: 10,
    title: "Module 10: Advanced Coverage Quiz",
    type: "quiz",
    content: {
      questions: [
        {
          question: "Why is D&O insurance particularly important for companies seeking investors?",
          options: [
            "A. It's cheaper than other insurance",
            "B. Investors typically require it before funding",
            "C. It covers product defects",
            "D. It's legally required for all corporations"
          ],
          correctIndex: 1,
          explanation: "Most investors require D&O insurance before investing because it protects company leadership from personal liability, making the company a safer investment."
        },
        {
          question: "What percentage of small businesses close within 6 months of a data breach?",
          options: [
            "A. 20%",
            "B. 40%",
            "C. 60%",
            "D. 80%"
          ],
          correctIndex: 2,
          explanation: "Approximately 60% of small businesses close within 6 months of a cyber attack or data breach, highlighting the critical importance of cyber insurance."
        },
        {
          question: "What does Business Interruption insurance cover?",
          options: [
            "A. Employee injuries",
            "B. Lost income when business can't operate due to covered events",
            "C. Product liability claims",
            "D. Professional negligence"
          ],
          correctIndex: 1,
          explanation: "Business Interruption insurance covers lost income and ongoing expenses (rent, payroll, loans) when your business can't operate due to a covered event like fire or natural disaster."
        }
      ]
    } as QuizContent
  },
  {
    id: 11,
    title: "Module 11: Complete Insurance Portfolio",
    type: "worksheet",
    content: {
      title: "Comprehensive Insurance Portfolio Summary",
      description: "This final worksheet combines your personal and business insurance assessments into a complete protection portfolio. Review and finalize your coverage strategy.",
      fields: [
        {
          id: "portfolioName",
          label: "Portfolio Name",
          type: "text",
          placeholder: "e.g., Russell Family & Business Protection Portfolio",
          required: true
        },
        {
          id: "totalPersonalPremium",
          label: "Estimated Annual Personal Insurance Premium",
          type: "text",
          placeholder: "$0,000",
          aiAssist: true,
          helpText: "AI can estimate based on your assessments"
        },
        {
          id: "totalBusinessPremium",
          label: "Estimated Annual Business Insurance Premium",
          type: "text",
          placeholder: "$0,000",
          aiAssist: true,
          helpText: "AI can estimate based on your assessments"
        },
        {
          id: "coverageGaps",
          label: "Identified Coverage Gaps",
          type: "textarea",
          placeholder: "List any areas where you may be underinsured or lacking coverage...",
          aiAssist: true,
          helpText: "AI can identify potential gaps based on your profile"
        },
        {
          id: "priorityActions",
          label: "Priority Actions",
          type: "textarea",
          placeholder: "List the most urgent insurance actions to take...",
          aiAssist: true
        },
        {
          id: "recommendations",
          label: "Additional Recommendations",
          type: "textarea",
          placeholder: "Any additional coverage or strategies to consider...",
          aiAssist: true
        },
        {
          id: "reviewSchedule",
          label: "Coverage Review Schedule",
          type: "select",
          options: [
            { value: "quarterly", label: "Quarterly" },
            { value: "semiannual", label: "Semi-annually" },
            { value: "annual", label: "Annually" },
            { value: "biennial", label: "Every 2 years" }
          ],
          helpText: "Regular reviews ensure coverage stays adequate"
        }
      ],
      outputTemplate: `COMPREHENSIVE INSURANCE PORTFOLIO
==================================

Portfolio: {{portfolioName}}
Created: {{currentDate}}

PREMIUM SUMMARY
---------------
Estimated Annual Personal Insurance: {{totalPersonalPremium}}
Estimated Annual Business Insurance: {{totalBusinessPremium}}
Total Annual Insurance Investment: [Calculate Total]

COVERAGE GAPS IDENTIFIED
------------------------
{{coverageGaps}}

PRIORITY ACTIONS
----------------
{{priorityActions}}

ADDITIONAL RECOMMENDATIONS
--------------------------
{{recommendations}}

REVIEW SCHEDULE
---------------
Coverage Review Frequency: {{reviewSchedule}}

INSURANCE PORTFOLIO CHECKLIST
-----------------------------
PERSONAL COVERAGE:
[ ] Life Insurance - Income replacement for dependents
[ ] Health Insurance - Medical expense coverage
[ ] Auto Insurance - Vehicle liability and protection
[ ] Homeowners/Renters - Property and liability
[ ] Disability Insurance - Income protection
[ ] Umbrella Policy - Additional liability protection

BUSINESS COVERAGE:
[ ] General Liability - Third-party claims
[ ] Professional Liability (E&O) - Service-related claims
[ ] Business Property - Physical asset protection
[ ] Workers' Compensation - Employee injury coverage
[ ] Directors & Officers (D&O) - Leadership protection
[ ] Cyber Liability - Data breach and cyber incidents
[ ] Business Interruption - Lost income coverage
[ ] Employment Practices (EPLI) - Employment claims

NEXT STEPS
----------
1. Obtain quotes from multiple insurers/brokers
2. Compare coverage, not just premiums
3. Review all policy exclusions
4. Set calendar reminders for review dates
5. Document all policies in secure location

This portfolio is for planning purposes. Work with licensed insurance professionals to implement your coverage strategy.

RECORDED TO LUVCHAIN BLOCKCHAIN
Certificate ID: [Auto-generated]
Timestamp: {{currentDate}}`
    } as WorksheetContent
  },
  {
    id: 12,
    title: "Module 12: Course Completion",
    type: "lesson",
    content: {
      title: "Insurance Workshop Complete!",
      sections: [
        {
          heading: "Congratulations!",
          text: "You've completed the Insurance Workshop course. You now understand both personal and business insurance fundamentals, have assessed your coverage needs, and created a comprehensive insurance portfolio strategy. This knowledge is essential for protecting your family and business assets.",
          tips: [
            "Insurance is not a one-time decision—review annually",
            "Life changes (marriage, children, business growth) require coverage updates",
            "Work with licensed professionals to implement your strategy"
          ]
        },
        {
          heading: "What You've Learned",
          text: "Throughout this course, you've mastered insurance fundamentals and terminology, personal insurance types (life, health, auto, home, disability), business insurance essentials (GL, E&O, property, workers' comp), advanced coverage (D&O, cyber, business interruption, EPLI), and how to assess and document your complete insurance needs.",
          tips: [
            "Keep your insurance portfolio document updated",
            "Share relevant coverage info with family members",
            "Store policy documents securely (consider Document Vault)"
          ]
        },
        {
          heading: "Connecting to Your House Structure",
          text: "Your insurance portfolio is a critical component of your House structure. Proper coverage protects your business entity, trust assets, and family wealth. As your House grows across generations, insurance needs will evolve. Each generation should complete this assessment to ensure adequate protection for their portion of the House.",
          tips: [
            "Insurance protects the assets held in your trust",
            "Business insurance protects your entity's operations",
            "Review coverage when inheritance splits occur"
          ]
        }
      ],
      keyTakeaways: [
        "You now have a comprehensive insurance strategy",
        "Regular reviews ensure coverage stays adequate",
        "Insurance is essential protection for your House structure",
        "Download your portfolio and implement with licensed professionals"
      ]
    } as LessonContent
  }
];

export default function InsuranceCourse({ onExit, onComplete, connectedEntity }: InsuranceCourseProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [worksheetData, setWorksheetData] = useState<Partial<InsuranceData>>({});
  const [tokensEarned, setTokensEarned] = useState(0);
  const [showAiAssist, setShowAiAssist] = useState<string | null>(null);

  const currentModule = insuranceModules[currentModuleIndex];
  const progress = (completedModules.size / insuranceModules.length) * 100;

  const awardTokens = trpc.tokenEconomy.awardTokens.useMutation();

  const handleNext = () => {
    if (!completedModules.has(currentModule.id)) {
      setCompletedModules(new Set([...Array.from(completedModules), currentModule.id]));
      const newTokens = currentModule.type === "quiz" ? 15 : currentModule.type === "worksheet" ? 20 : 10;
      setTokensEarned(prev => prev + newTokens);
    }

    if (currentModuleIndex < insuranceModules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setQuizAnswers({});
      setQuizSubmitted(false);
    } else {
      // Course complete
      const totalTokens = tokensEarned + 10;
      awardTokens.mutate(
        { amount: String(totalTokens), reason: "simulator_completion" },
        {
          onSuccess: () => {
            toast.success(`Course completed! Earned ${totalTokens} LUV tokens`);
            onComplete(totalTokens);
          },
          onError: () => {
            toast.success(`Course completed! Earned ${totalTokens} LUV tokens`);
            onComplete(totalTokens);
          }
        }
      );
    }
  };

  const handlePrevious = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    if (!quizSubmitted) {
      setQuizAnswers({ ...quizAnswers, [questionIndex]: answerIndex });
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const handleWorksheetChange = (fieldId: string, value: string) => {
    setWorksheetData({ ...worksheetData, [fieldId]: value });
  };

  const handleAiAssist = (fieldId: string) => {
    setShowAiAssist(fieldId);
    // Simulate AI assistance
    setTimeout(() => {
      let suggestion = "";
      switch (fieldId) {
        case "lifeInsuranceAmount":
          suggestion = "Based on your income and dependents, $500,000-$1,000,000 is recommended.";
          break;
        case "industryRisks":
          suggestion = "Common risks include: client data handling, professional advice liability, contract disputes, and cyber threats.";
          break;
        case "coverageGaps":
          suggestion = "Consider: umbrella liability, cyber insurance, and business interruption coverage.";
          break;
        default:
          suggestion = "AI analysis complete. Review the suggested value.";
      }
      toast.info(suggestion, { duration: 5000 });
      setShowAiAssist(null);
    }, 1500);
  };

  const generateDocument = () => {
    const content = (currentModule.content as WorksheetContent);
    let output = content.outputTemplate;
    
    // Replace placeholders with actual data
    Object.entries(worksheetData).forEach(([key, value]) => {
      output = output.replace(new RegExp(`{{${key}}}`, 'g'), value || '[Not provided]');
    });
    output = output.replace(/{{currentDate}}/g, new Date().toLocaleDateString());
    
    // Create and download the document
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insurance-${currentModule.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    toast.success('Document downloaded!');
  };

  const renderLesson = (content: LessonContent) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
      {content.sections.map((section, idx) => (
        <Card key={idx} className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            {section.heading}
          </h3>
          <p className="text-muted-foreground mb-4">{section.text}</p>
          {section.tips && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Key Tips:
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                {section.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}
      <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Key Takeaways
        </h3>
        <ul className="space-y-2">
          {content.keyTakeaways.map((takeaway, idx) => (
            <li key={idx} className="flex items-start gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );

  const renderQuiz = (content: QuizContent) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Knowledge Check</h2>
      {content.questions.map((q, qIdx) => (
        <Card key={qIdx} className="p-6">
          <p className="font-semibold text-foreground mb-4">{qIdx + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((option, oIdx) => {
              const isSelected = quizAnswers[qIdx] === oIdx;
              const isCorrect = oIdx === q.correctIndex;
              const showResult = quizSubmitted;
              
              return (
                <button
                  key={oIdx}
                  onClick={() => handleQuizAnswer(qIdx, oIdx)}
                  disabled={quizSubmitted}
                  className={`w-full text-left p-4 rounded-lg border transition-colors min-h-[48px] ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-100 border-green-500 dark:bg-green-900/30'
                        : isSelected
                        ? 'bg-red-100 border-red-500 dark:bg-red-900/30'
                        : 'bg-background border-border'
                      : isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background border-border hover:border-primary/50'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {quizSubmitted && (
            <div className={`mt-4 p-4 rounded-lg ${
              quizAnswers[qIdx] === q.correctIndex
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-amber-50 dark:bg-amber-900/20'
            }`}>
              <p className="text-sm">{q.explanation}</p>
            </div>
          )}
        </Card>
      ))}
      {!quizSubmitted && Object.keys(quizAnswers).length === content.questions.length && (
        <Button onClick={handleQuizSubmit} className="w-full min-h-[48px]">
          Submit Quiz
        </Button>
      )}
    </div>
  );

  const renderWorksheet = (content: WorksheetContent) => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
        <p className="text-muted-foreground mt-2">{content.description}</p>
      </div>
      
      {connectedEntity && (
        <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            <strong>Connected Entity:</strong> {connectedEntity.name} ({connectedEntity.type})
          </p>
        </Card>
      )}

      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>AI Assistance Available:</strong> Fields marked with ✨ have AI-powered suggestions to help you determine appropriate values.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          {content.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.id} className="flex items-center gap-2">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                  {field.aiAssist && <Sparkles className="w-4 h-4 text-blue-500" />}
                </Label>
                {field.aiAssist && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAiAssist(field.id)}
                    disabled={showAiAssist === field.id}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {showAiAssist === field.id ? (
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        Get AI Suggestion
                      </span>
                    )}
                  </Button>
                )}
              </div>
              {field.helpText && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  {field.helpText}
                </p>
              )}
              {field.type === "text" && (
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(worksheetData as Record<string, string>)[field.id] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  className="min-h-[48px]"
                />
              )}
              {field.type === "textarea" && (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(worksheetData as Record<string, string>)[field.id] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  rows={4}
                />
              )}
              {field.type === "select" && field.options && (
                <Select
                  value={(worksheetData as Record<string, string>)[field.id] || ""}
                  onValueChange={(value) => handleWorksheetChange(field.id, value)}
                >
                  <SelectTrigger className="min-h-[48px]">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => {
                      const opt = typeof option === "string" 
                        ? { value: option, label: option }
                        : option;
                      return (
                        <SelectItem 
                          key={opt.value} 
                          value={opt.value}
                          disabled={opt.disabled}
                        >
                          {opt.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Button onClick={generateDocument} variant="outline" className="w-full min-h-[48px] gap-2">
        <Download className="w-4 h-4" />
        Download Assessment Document
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onExit} className="gap-2 min-h-[48px]">
              <ArrowLeft className="w-4 h-4" />
              Exit Course
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-semibold">{tokensEarned} LUV</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Module Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${
            currentModule.type === "lesson" ? "bg-blue-100 dark:bg-blue-900/30" :
            currentModule.type === "quiz" ? "bg-amber-100 dark:bg-amber-900/30" :
            "bg-green-100 dark:bg-green-900/30"
          }`}>
            {currentModule.type === "lesson" && <BookOpen className="w-5 h-5 text-blue-600" />}
            {currentModule.type === "quiz" && <FileCheck className="w-5 h-5 text-amber-600" />}
            {currentModule.type === "worksheet" && <FileText className="w-5 h-5 text-green-600" />}
          </div>
          <div>
            <p className="text-sm text-muted-foreground capitalize">{currentModule.type}</p>
            <h1 className="text-xl font-bold text-foreground">{currentModule.title}</h1>
          </div>
        </div>

        {/* Module Content */}
        {currentModule.type === "lesson" && renderLesson(currentModule.content as LessonContent)}
        {currentModule.type === "quiz" && renderQuiz(currentModule.content as QuizContent)}
        {currentModule.type === "worksheet" && renderWorksheet(currentModule.content as WorksheetContent)}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentModuleIndex === 0}
            className="gap-2 min-h-[48px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            disabled={currentModule.type === "quiz" && !quizSubmitted}
            className="gap-2 min-h-[48px]"
          >
            {currentModuleIndex === insuranceModules.length - 1 ? "Complete Course" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
