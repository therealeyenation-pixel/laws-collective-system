// Entity-Specific Curriculum Data
// Generated for LuvOnPurpose Autonomous Wealth System

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  topics: string[];
  activities: string[];
  assessments: string[];
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
  certificationTitle?: string;
}

export interface EntityCurriculum {
  entityId: string;
  entityName: string;
  curriculumName: string;
  description: string;
  targetAudience: string;
  modules: CurriculumModule[];
  totalDuration: string;
  certificationPath: string;
}

// Trust - Lineage & Sovereignty Curriculum
export const lineageSovereigntyCurriculum: EntityCurriculum = {
  entityId: "trust",
  entityName: "CALEA Freeman Family Trust",
  curriculumName: "Lineage & Sovereignty",
  description: "Understanding family legacy, trust structures, asset protection, and generational wealth transfer for sovereign operations.",
  targetAudience: "Family members, trustees, beneficiaries, and administrators",
  totalDuration: "40 hours",
  certificationPath: "Certified Trust Administrator",
  modules: [
    {
      id: "ls-101",
      title: "Foundations of Family Legacy",
      description: "Understanding the purpose and structure of family trusts for generational wealth preservation.",
      objectives: [
        "Understand the historical context of family trusts",
        "Identify the core components of a family trust structure",
        "Recognize the role of trustees and beneficiaries",
        "Articulate the vision for multi-generational wealth"
      ],
      topics: [
        "History of family trusts and wealth preservation",
        "Trust structures: revocable vs irrevocable",
        "Roles: Grantor, Trustee, Beneficiary",
        "The CALEA Freeman Family Trust vision",
        "Generational wealth principles"
      ],
      activities: [
        "Family tree mapping exercise",
        "Trust document review workshop",
        "Vision statement drafting",
        "Legacy letter writing"
      ],
      assessments: [
        "Trust structure identification quiz",
        "Role-play: Trustee decision scenarios",
        "Written reflection on family legacy"
      ],
      duration: "8 hours",
      difficulty: "beginner",
      certificationTitle: "Legacy Foundation Certificate"
    },
    {
      id: "ls-102",
      title: "Asset Protection Strategies",
      description: "Legal and structural methods for protecting family assets across generations.",
      objectives: [
        "Understand asset protection legal frameworks",
        "Identify liability separation techniques",
        "Apply asset titling best practices",
        "Implement protection strategies"
      ],
      topics: [
        "Legal entity structures (LLC, Trust, Corporation)",
        "Liability separation and charging order protection",
        "Asset titling and ownership structures",
        "Insurance as a protection layer",
        "Fraudulent transfer laws and compliance"
      ],
      activities: [
        "Entity structure mapping",
        "Asset inventory and titling review",
        "Protection gap analysis",
        "Strategy implementation planning"
      ],
      assessments: [
        "Entity selection case study",
        "Asset protection plan presentation",
        "Compliance checklist completion"
      ],
      duration: "8 hours",
      difficulty: "intermediate",
      prerequisites: ["ls-101"],
      certificationTitle: "Asset Protection Specialist"
    },
    {
      id: "ls-103",
      title: "Governance & Decision Making",
      description: "Establishing governance structures and decision-making processes for family enterprises.",
      objectives: [
        "Design effective governance frameworks",
        "Implement decision-making protocols",
        "Manage family dynamics in business",
        "Create succession planning processes"
      ],
      topics: [
        "Family governance models",
        "Decision authority and escalation paths",
        "Conflict resolution mechanisms",
        "Succession planning fundamentals",
        "Family council and meeting structures"
      ],
      activities: [
        "Governance charter drafting",
        "Decision matrix creation",
        "Conflict resolution simulation",
        "Succession plan outline"
      ],
      assessments: [
        "Governance framework design project",
        "Decision scenario role-play",
        "Succession plan presentation"
      ],
      duration: "8 hours",
      difficulty: "intermediate",
      prerequisites: ["ls-101"],
      certificationTitle: "Governance Specialist"
    },
    {
      id: "ls-104",
      title: "Sovereignty & Self-Determination",
      description: "Principles of sovereign operations, self-governance, and autonomous wealth systems.",
      objectives: [
        "Understand sovereignty in the context of family wealth",
        "Apply self-determination principles to financial decisions",
        "Build autonomous systems for wealth management",
        "Maintain independence from external dependencies"
      ],
      topics: [
        "Sovereignty principles and philosophy",
        "Self-determination in financial matters",
        "Autonomous wealth system design",
        "Reducing external dependencies",
        "Building resilient family systems"
      ],
      activities: [
        "Sovereignty assessment exercise",
        "Dependency mapping and reduction planning",
        "Autonomous system design workshop",
        "Resilience stress testing"
      ],
      assessments: [
        "Sovereignty philosophy essay",
        "Autonomous system design project",
        "Resilience plan presentation"
      ],
      duration: "8 hours",
      difficulty: "advanced",
      prerequisites: ["ls-102", "ls-103"],
      certificationTitle: "Sovereignty Master"
    },
    {
      id: "ls-105",
      title: "Generational Transfer & Legacy",
      description: "Executing wealth transfer across generations while preserving family values and vision.",
      objectives: [
        "Plan effective wealth transfer strategies",
        "Prepare next generation for stewardship",
        "Document and preserve family values",
        "Ensure continuity of family enterprises"
      ],
      topics: [
        "Wealth transfer mechanisms and timing",
        "Next generation preparation programs",
        "Family values documentation",
        "Enterprise continuity planning",
        "Legacy preservation techniques"
      ],
      activities: [
        "Transfer strategy workshop",
        "Next-gen mentorship program design",
        "Family values documentation project",
        "Continuity plan development"
      ],
      assessments: [
        "Comprehensive transfer plan",
        "Mentorship program proposal",
        "Legacy documentation portfolio"
      ],
      duration: "8 hours",
      difficulty: "advanced",
      prerequisites: ["ls-104"],
      certificationTitle: "Legacy Transfer Master"
    }
  ]
};

// Academy - Financial Literacy Curriculum
export const financialLiteracyCurriculum: EntityCurriculum = {
  entityId: "academy",
  entityName: "LuvOnPurpose Academy & Outreach",
  curriculumName: "Financial Literacy",
  description: "Comprehensive financial education covering personal finance, business finance, and wealth building strategies.",
  targetAudience: "Community members, students, entrepreneurs, and families",
  totalDuration: "60 hours",
  certificationPath: "Certified Financial Literacy Educator",
  modules: [
    {
      id: "fl-101",
      title: "Personal Finance Foundations",
      description: "Building a solid foundation in personal financial management.",
      objectives: [
        "Create and maintain a personal budget",
        "Understand income, expenses, and cash flow",
        "Establish emergency fund strategies",
        "Set and track financial goals"
      ],
      topics: [
        "Budgeting methods (50/30/20, zero-based, envelope)",
        "Income streams and expense categories",
        "Emergency fund building",
        "Financial goal setting (SMART goals)",
        "Tracking tools and apps"
      ],
      activities: [
        "Personal budget creation workshop",
        "Expense tracking challenge (30 days)",
        "Emergency fund calculator exercise",
        "Financial vision board creation"
      ],
      assessments: [
        "Budget presentation",
        "Expense analysis report",
        "Financial goal plan submission"
      ],
      duration: "10 hours",
      difficulty: "beginner",
      certificationTitle: "Personal Finance Foundation Certificate"
    },
    {
      id: "fl-102",
      title: "Banking & Credit Management",
      description: "Understanding banking systems, credit, and debt management strategies.",
      objectives: [
        "Navigate banking products and services",
        "Build and maintain good credit",
        "Manage and eliminate debt strategically",
        "Protect against financial fraud"
      ],
      topics: [
        "Types of bank accounts and their uses",
        "Credit scores and reports explained",
        "Debt management strategies (avalanche, snowball)",
        "Credit building techniques",
        "Fraud prevention and identity protection"
      ],
      activities: [
        "Credit report review workshop",
        "Debt payoff calculator exercise",
        "Bank account comparison analysis",
        "Fraud prevention checklist creation"
      ],
      assessments: [
        "Credit improvement plan",
        "Debt elimination strategy presentation",
        "Banking product selection case study"
      ],
      duration: "10 hours",
      difficulty: "beginner",
      certificationTitle: "Credit & Banking Specialist"
    },
    {
      id: "fl-103",
      title: "Investing Fundamentals",
      description: "Introduction to investing principles and wealth building through investments.",
      objectives: [
        "Understand investment vehicles and their characteristics",
        "Apply risk assessment and diversification principles",
        "Create a basic investment strategy",
        "Evaluate investment performance"
      ],
      topics: [
        "Stocks, bonds, mutual funds, ETFs",
        "Risk tolerance assessment",
        "Diversification strategies",
        "Compound interest and time value of money",
        "Retirement accounts (401k, IRA, Roth)"
      ],
      activities: [
        "Risk tolerance questionnaire",
        "Mock portfolio creation",
        "Compound interest calculator exercise",
        "Investment research project"
      ],
      assessments: [
        "Investment strategy presentation",
        "Portfolio analysis report",
        "Retirement planning worksheet"
      ],
      duration: "12 hours",
      difficulty: "intermediate",
      prerequisites: ["fl-101"],
      certificationTitle: "Investment Foundations Certificate"
    },
    {
      id: "fl-104",
      title: "Business Finance Essentials",
      description: "Financial management principles for entrepreneurs and business owners.",
      objectives: [
        "Read and interpret financial statements",
        "Manage business cash flow",
        "Make informed business financial decisions",
        "Plan for business growth and sustainability"
      ],
      topics: [
        "Income statement, balance sheet, cash flow statement",
        "Business budgeting and forecasting",
        "Pricing strategies and profit margins",
        "Business credit and financing options",
        "Tax planning for businesses"
      ],
      activities: [
        "Financial statement analysis workshop",
        "Business budget creation",
        "Pricing strategy exercise",
        "Financing options comparison"
      ],
      assessments: [
        "Financial statement interpretation test",
        "Business financial plan presentation",
        "Cash flow projection project"
      ],
      duration: "12 hours",
      difficulty: "intermediate",
      prerequisites: ["fl-102"],
      certificationTitle: "Business Finance Specialist"
    },
    {
      id: "fl-105",
      title: "Wealth Building Strategies",
      description: "Advanced strategies for building and preserving generational wealth.",
      objectives: [
        "Develop multiple income streams",
        "Implement tax optimization strategies",
        "Create wealth transfer plans",
        "Build sustainable wealth systems"
      ],
      topics: [
        "Multiple income stream development",
        "Real estate investing basics",
        "Tax-advantaged wealth building",
        "Estate planning fundamentals",
        "Generational wealth principles"
      ],
      activities: [
        "Income stream brainstorming session",
        "Real estate investment analysis",
        "Tax optimization planning",
        "Estate planning checklist"
      ],
      assessments: [
        "Wealth building strategy presentation",
        "Income diversification plan",
        "Estate planning outline"
      ],
      duration: "10 hours",
      difficulty: "advanced",
      prerequisites: ["fl-103", "fl-104"],
      certificationTitle: "Wealth Builder Certificate"
    },
    {
      id: "fl-106",
      title: "Teaching Financial Literacy",
      description: "Preparing educators to teach financial literacy in their communities.",
      objectives: [
        "Adapt financial concepts for different audiences",
        "Create engaging financial education materials",
        "Facilitate effective financial workshops",
        "Measure and improve learning outcomes"
      ],
      topics: [
        "Adult learning principles for finance",
        "Curriculum adaptation techniques",
        "Workshop facilitation skills",
        "Assessment and evaluation methods",
        "Community outreach strategies"
      ],
      activities: [
        "Lesson plan development",
        "Practice teaching sessions",
        "Material creation workshop",
        "Community workshop planning"
      ],
      assessments: [
        "Teaching demonstration",
        "Curriculum adaptation project",
        "Community workshop execution"
      ],
      duration: "6 hours",
      difficulty: "advanced",
      prerequisites: ["fl-105"],
      certificationTitle: "Certified Financial Literacy Educator"
    }
  ]
};

// Real-Eye-Nation - Truth & Narrative Curriculum
export const truthNarrativeCurriculum: EntityCurriculum = {
  entityId: "media",
  entityName: "Real-Eye-Nation",
  curriculumName: "Truth & Narrative",
  description: "Media literacy, storytelling, and truth-seeking in the digital age. Creating authentic narratives that empower communities.",
  targetAudience: "Content creators, journalists, community storytellers, and media professionals",
  totalDuration: "48 hours",
  certificationPath: "Certified Truth Narrator",
  modules: [
    {
      id: "tn-101",
      title: "Media Literacy Foundations",
      description: "Critical analysis of media, identifying bias, and understanding information ecosystems.",
      objectives: [
        "Analyze media sources for credibility and bias",
        "Understand how information spreads in digital ecosystems",
        "Identify misinformation and disinformation tactics",
        "Develop critical consumption habits"
      ],
      topics: [
        "Media landscape overview",
        "Source evaluation techniques (CRAAP test)",
        "Bias identification and types",
        "Information verification methods",
        "Digital literacy fundamentals"
      ],
      activities: [
        "Source credibility analysis exercise",
        "Bias detection workshop",
        "Fact-checking challenge",
        "Media consumption audit"
      ],
      assessments: [
        "Source evaluation portfolio",
        "Bias analysis report",
        "Misinformation case study"
      ],
      duration: "8 hours",
      difficulty: "beginner",
      certificationTitle: "Media Literacy Foundation Certificate"
    },
    {
      id: "tn-102",
      title: "Authentic Storytelling",
      description: "Crafting genuine narratives that connect with audiences and convey truth.",
      objectives: [
        "Develop authentic voice and perspective",
        "Structure compelling narratives",
        "Connect stories to universal themes",
        "Maintain integrity in storytelling"
      ],
      topics: [
        "Finding your authentic voice",
        "Narrative structure and arc",
        "Character and perspective development",
        "Emotional truth in storytelling",
        "Ethics in narrative creation"
      ],
      activities: [
        "Personal story development",
        "Narrative structure workshop",
        "Voice finding exercises",
        "Story ethics discussion"
      ],
      assessments: [
        "Personal narrative presentation",
        "Story structure analysis",
        "Authentic voice portfolio"
      ],
      duration: "10 hours",
      difficulty: "beginner",
      certificationTitle: "Authentic Storyteller Certificate"
    },
    {
      id: "tn-103",
      title: "Digital Content Creation",
      description: "Creating impactful content across digital platforms while maintaining authenticity.",
      objectives: [
        "Produce quality video, audio, and written content",
        "Optimize content for different platforms",
        "Build and engage audiences authentically",
        "Measure content impact and reach"
      ],
      topics: [
        "Video production fundamentals",
        "Podcast and audio creation",
        "Written content for digital platforms",
        "Platform-specific optimization",
        "Analytics and impact measurement"
      ],
      activities: [
        "Video production workshop",
        "Podcast episode creation",
        "Multi-platform content strategy",
        "Analytics interpretation exercise"
      ],
      assessments: [
        "Content portfolio (video, audio, written)",
        "Platform strategy presentation",
        "Impact analysis report"
      ],
      duration: "12 hours",
      difficulty: "intermediate",
      prerequisites: ["tn-102"],
      certificationTitle: "Digital Content Creator"
    },
    {
      id: "tn-104",
      title: "Community Journalism",
      description: "Reporting on community issues with accuracy, fairness, and impact.",
      objectives: [
        "Apply journalistic principles to community reporting",
        "Conduct ethical interviews and research",
        "Present balanced and accurate stories",
        "Amplify community voices responsibly"
      ],
      topics: [
        "Journalism ethics and principles",
        "Interview techniques",
        "Research and fact-checking",
        "Balanced reporting methods",
        "Community voice amplification"
      ],
      activities: [
        "Community story development",
        "Interview practice sessions",
        "Fact-checking workshop",
        "Community reporting project"
      ],
      assessments: [
        "Community story publication",
        "Interview portfolio",
        "Ethics case study analysis"
      ],
      duration: "10 hours",
      difficulty: "intermediate",
      prerequisites: ["tn-101"],
      certificationTitle: "Community Journalist Certificate"
    },
    {
      id: "tn-105",
      title: "Counter-Narrative Development",
      description: "Creating narratives that challenge dominant stories and empower marginalized voices.",
      objectives: [
        "Analyze dominant narratives and their impact",
        "Develop effective counter-narratives",
        "Amplify marginalized perspectives",
        "Build narrative movements"
      ],
      topics: [
        "Dominant narrative analysis",
        "Counter-narrative strategies",
        "Voice amplification techniques",
        "Movement building through story",
        "Historical narrative reclamation"
      ],
      activities: [
        "Dominant narrative deconstruction",
        "Counter-narrative creation workshop",
        "Voice amplification project",
        "Movement narrative planning"
      ],
      assessments: [
        "Counter-narrative campaign",
        "Voice amplification portfolio",
        "Movement narrative presentation"
      ],
      duration: "8 hours",
      difficulty: "advanced",
      prerequisites: ["tn-103", "tn-104"],
      certificationTitle: "Counter-Narrative Specialist"
    }
  ]
};

// Commercial - Product Development Curriculum (now under The L.A.W.S. Collective Services)
export const productDevelopmentCurriculum: EntityCurriculum = {
  entityId: "commercial",
  entityName: "The L.A.W.S. Collective LLC - Services Division",
  curriculumName: "Product Development",
  description: "From idea to market: developing products and services that create value and generate sustainable revenue.",
  targetAudience: "Entrepreneurs, product managers, business developers, and innovators",
  totalDuration: "50 hours",
  certificationPath: "Certified Product Developer",
  modules: [
    {
      id: "pd-101",
      title: "Ideation & Validation",
      description: "Generating, evaluating, and validating product ideas before investment.",
      objectives: [
        "Generate innovative product ideas systematically",
        "Evaluate ideas against market needs",
        "Validate concepts with minimal investment",
        "Pivot or proceed based on validation data"
      ],
      topics: [
        "Ideation techniques (brainstorming, SCAMPER, etc.)",
        "Problem-solution fit analysis",
        "Market validation methods",
        "Minimum Viable Product (MVP) concepts",
        "Pivot decision frameworks"
      ],
      activities: [
        "Ideation workshop",
        "Problem interview exercises",
        "MVP planning session",
        "Validation experiment design"
      ],
      assessments: [
        "Idea pitch presentation",
        "Validation report",
        "MVP specification document"
      ],
      duration: "10 hours",
      difficulty: "beginner",
      certificationTitle: "Idea Validation Specialist"
    },
    {
      id: "pd-102",
      title: "Product Design & Development",
      description: "Designing and building products that solve real problems effectively.",
      objectives: [
        "Apply user-centered design principles",
        "Create product specifications and roadmaps",
        "Manage development processes",
        "Iterate based on user feedback"
      ],
      topics: [
        "User-centered design principles",
        "Product specification writing",
        "Agile development methodologies",
        "Prototyping and testing",
        "Iteration and improvement cycles"
      ],
      activities: [
        "User research project",
        "Specification writing workshop",
        "Prototype development",
        "User testing sessions"
      ],
      assessments: [
        "Product specification document",
        "Prototype demonstration",
        "User testing report"
      ],
      duration: "12 hours",
      difficulty: "intermediate",
      prerequisites: ["pd-101"],
      certificationTitle: "Product Designer Certificate"
    },
    {
      id: "pd-103",
      title: "Go-to-Market Strategy",
      description: "Launching products successfully with effective market entry strategies.",
      objectives: [
        "Develop comprehensive go-to-market plans",
        "Identify and reach target customers",
        "Create compelling value propositions",
        "Execute successful product launches"
      ],
      topics: [
        "Market segmentation and targeting",
        "Value proposition development",
        "Pricing strategies",
        "Channel selection and management",
        "Launch planning and execution"
      ],
      activities: [
        "Market segmentation exercise",
        "Value proposition canvas",
        "Pricing strategy workshop",
        "Launch plan development"
      ],
      assessments: [
        "Go-to-market plan presentation",
        "Value proposition pitch",
        "Launch execution simulation"
      ],
      duration: "10 hours",
      difficulty: "intermediate",
      prerequisites: ["pd-102"],
      certificationTitle: "Go-to-Market Strategist"
    },
    {
      id: "pd-104",
      title: "IP Protection & Licensing",
      description: "Protecting intellectual property and creating licensing revenue streams.",
      objectives: [
        "Understand IP protection mechanisms",
        "Develop IP protection strategies",
        "Create licensing agreements",
        "Monetize IP assets effectively"
      ],
      topics: [
        "Types of intellectual property (patents, trademarks, copyrights)",
        "IP protection strategies",
        "Licensing models and agreements",
        "IP valuation methods",
        "Enforcement and defense"
      ],
      activities: [
        "IP audit exercise",
        "Protection strategy development",
        "Licensing agreement review",
        "IP monetization planning"
      ],
      assessments: [
        "IP protection plan",
        "Licensing strategy presentation",
        "IP portfolio valuation"
      ],
      duration: "8 hours",
      difficulty: "advanced",
      prerequisites: ["pd-103"],
      certificationTitle: "IP Protection Specialist"
    },
    {
      id: "pd-105",
      title: "Product Scaling & Growth",
      description: "Scaling products from initial success to sustainable growth.",
      objectives: [
        "Identify scaling opportunities and challenges",
        "Build scalable systems and processes",
        "Manage growth sustainably",
        "Expand into new markets"
      ],
      topics: [
        "Scaling frameworks and models",
        "Operational scalability",
        "Growth metrics and KPIs",
        "Market expansion strategies",
        "Sustainable growth practices"
      ],
      activities: [
        "Scaling readiness assessment",
        "Growth plan development",
        "Metrics dashboard creation",
        "Expansion strategy workshop"
      ],
      assessments: [
        "Scaling strategy presentation",
        "Growth metrics report",
        "Expansion plan document"
      ],
      duration: "10 hours",
      difficulty: "advanced",
      prerequisites: ["pd-104"],
      certificationTitle: "Product Scaling Master"
    }
  ]
};

// Platform - Platform Administration Curriculum
export const platformAdministrationCurriculum: EntityCurriculum = {
  entityId: "platform",
  entityName: "The L.A.W.S. Collective LLC - Platform Division",
  curriculumName: "Platform Administration",
  description: "Managing and administering the L.A.W.S. platform, including simulators, member tools, and infrastructure.",
  targetAudience: "Platform administrators, system operators, and technical staff",
  totalDuration: "45 hours",
  certificationPath: "Certified Platform Administrator",
  modules: [
    {
      id: "pa-101",
      title: "Platform Overview & Architecture",
      description: "Understanding the L.A.W.S. platform structure, components, and how they work together.",
      objectives: [
        "Understand platform architecture and components",
        "Navigate administrative interfaces",
        "Identify system dependencies and relationships",
        "Monitor platform health and performance"
      ],
      topics: [
        "Platform architecture overview",
        "Component relationships and dependencies",
        "Administrative interface navigation",
        "Health monitoring and dashboards",
        "System documentation and resources"
      ],
      activities: [
        "Platform architecture mapping",
        "Admin interface exploration",
        "Health check procedures",
        "Documentation review"
      ],
      assessments: [
        "Architecture diagram creation",
        "Admin task completion checklist",
        "Health monitoring report"
      ],
      duration: "8 hours",
      difficulty: "beginner",
      certificationTitle: "Platform Foundations Certificate"
    },
    {
      id: "pa-102",
      title: "User & Access Management",
      description: "Managing users, roles, permissions, and access control across the platform.",
      objectives: [
        "Manage user accounts and profiles",
        "Configure roles and permissions",
        "Implement access control policies",
        "Audit user activities"
      ],
      topics: [
        "User account lifecycle management",
        "Role-based access control (RBAC)",
        "Permission configuration",
        "Access audit and compliance",
        "Security best practices"
      ],
      activities: [
        "User provisioning exercise",
        "Role configuration workshop",
        "Access audit simulation",
        "Security review checklist"
      ],
      assessments: [
        "User management scenario test",
        "Role configuration project",
        "Access audit report"
      ],
      duration: "8 hours",
      difficulty: "intermediate",
      prerequisites: ["pa-101"],
      certificationTitle: "Access Management Specialist"
    },
    {
      id: "pa-103",
      title: "Simulator Management",
      description: "Administering training simulators, scenarios, and learning pathways.",
      objectives: [
        "Configure and manage simulator modules",
        "Create and modify training scenarios",
        "Track learner progress and performance",
        "Optimize simulator effectiveness"
      ],
      topics: [
        "Simulator architecture and configuration",
        "Scenario creation and management",
        "Progress tracking and reporting",
        "Performance optimization",
        "Content updates and versioning"
      ],
      activities: [
        "Simulator configuration exercise",
        "Scenario creation workshop",
        "Progress report generation",
        "Performance analysis"
      ],
      assessments: [
        "Simulator setup project",
        "Scenario development portfolio",
        "Effectiveness analysis report"
      ],
      duration: "10 hours",
      difficulty: "intermediate",
      prerequisites: ["pa-102"],
      certificationTitle: "Simulator Administrator"
    },
    {
      id: "pa-104",
      title: "Token Economy Administration",
      description: "Managing the platform's token economy, distributions, and conversions.",
      objectives: [
        "Understand token economy mechanics",
        "Manage token distributions and allocations",
        "Monitor token circulation and usage",
        "Handle token-related support issues"
      ],
      topics: [
        "Token economy fundamentals",
        "Distribution and allocation management",
        "Circulation monitoring and reporting",
        "Conversion and redemption processes",
        "Troubleshooting token issues"
      ],
      activities: [
        "Token distribution simulation",
        "Allocation configuration exercise",
        "Circulation report analysis",
        "Support scenario role-play"
      ],
      assessments: [
        "Token management scenario test",
        "Distribution plan project",
        "Economy health report"
      ],
      duration: "8 hours",
      difficulty: "advanced",
      prerequisites: ["pa-103"],
      certificationTitle: "Token Economy Administrator"
    },
    {
      id: "pa-105",
      title: "System Maintenance & Troubleshooting",
      description: "Maintaining platform health, resolving issues, and ensuring continuous operation.",
      objectives: [
        "Perform routine maintenance tasks",
        "Diagnose and resolve common issues",
        "Implement backup and recovery procedures",
        "Escalate complex issues appropriately"
      ],
      topics: [
        "Routine maintenance procedures",
        "Troubleshooting methodologies",
        "Backup and recovery processes",
        "Incident management and escalation",
        "Documentation and knowledge base"
      ],
      activities: [
        "Maintenance checklist execution",
        "Troubleshooting simulation",
        "Backup/recovery drill",
        "Incident response exercise"
      ],
      assessments: [
        "Maintenance procedure demonstration",
        "Troubleshooting scenario test",
        "Incident response evaluation"
      ],
      duration: "11 hours",
      difficulty: "advanced",
      prerequisites: ["pa-104"],
      certificationTitle: "Certified Platform Administrator"
    }
  ]
};

// Export all curricula
export const entityCurricula: EntityCurriculum[] = [
  lineageSovereigntyCurriculum,
  financialLiteracyCurriculum,
  truthNarrativeCurriculum,
  productDevelopmentCurriculum,
  platformAdministrationCurriculum
];

// Get curriculum by entity ID
export function getCurriculumByEntityId(entityId: string): EntityCurriculum | undefined {
  return entityCurricula.find(c => c.entityId === entityId);
}

// Get all module IDs for a curriculum
export function getModuleIds(curriculum: EntityCurriculum): string[] {
  return curriculum.modules.map(m => m.id);
}

// Calculate total hours for a curriculum
export function calculateTotalHours(curriculum: EntityCurriculum): number {
  return curriculum.modules.reduce((total, module) => {
    const hours = parseInt(module.duration.replace(' hours', ''));
    return total + hours;
  }, 0);
}
