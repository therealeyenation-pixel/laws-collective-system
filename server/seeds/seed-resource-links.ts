import { db } from "../db";
import { resourceLinks, resourceLinkCategories } from "../../drizzle/schema";

/**
 * Seed initial resource links and categories for department dashboards
 */
export async function seedResourceLinks() {
  console.log("Seeding resource link categories...");
  
  // Seed categories for each dashboard
  const categories = [
    // Health Dashboard Categories
    { dashboard: "health", categoryName: "Recalls & Alerts", categoryIcon: "AlertTriangle", description: "Product recalls and safety alerts", orderIndex: 1 },
    { dashboard: "health", categoryName: "Research", categoryIcon: "BookOpen", description: "Health research and studies", orderIndex: 2 },
    { dashboard: "health", categoryName: "Regulations", categoryIcon: "Scale", description: "Health regulations and compliance", orderIndex: 3 },
    { dashboard: "health", categoryName: "Best Practices", categoryIcon: "CheckCircle", description: "Industry best practices", orderIndex: 4 },
    { dashboard: "health", categoryName: "News", categoryIcon: "Newspaper", description: "Health industry news", orderIndex: 5 },
    
    // Finance Dashboard Categories
    { dashboard: "finance", categoryName: "Market News", categoryIcon: "TrendingUp", description: "Financial market updates", orderIndex: 1 },
    { dashboard: "finance", categoryName: "Regulations", categoryIcon: "Scale", description: "Financial regulations and compliance", orderIndex: 2 },
    { dashboard: "finance", categoryName: "Tax Updates", categoryIcon: "Receipt", description: "Tax law changes and updates", orderIndex: 3 },
    { dashboard: "finance", categoryName: "Grant Opportunities", categoryIcon: "Gift", description: "Available grants and funding", orderIndex: 4 },
    { dashboard: "finance", categoryName: "Investment Research", categoryIcon: "Search", description: "Investment analysis and research", orderIndex: 5 },
    
    // Legal Dashboard Categories
    { dashboard: "legal", categoryName: "Case Law", categoryIcon: "Gavel", description: "Relevant case law and precedents", orderIndex: 1 },
    { dashboard: "legal", categoryName: "Regulatory Updates", categoryIcon: "FileText", description: "New laws and regulations", orderIndex: 2 },
    { dashboard: "legal", categoryName: "Compliance", categoryIcon: "Shield", description: "Compliance requirements", orderIndex: 3 },
    { dashboard: "legal", categoryName: "Industry Standards", categoryIcon: "Award", description: "Legal industry standards", orderIndex: 4 },
    
    // Business Dashboard Categories
    { dashboard: "business", categoryName: "Competitor Intel", categoryIcon: "Eye", description: "Competitor news and analysis", orderIndex: 1 },
    { dashboard: "business", categoryName: "Market Trends", categoryIcon: "TrendingUp", description: "Industry trends and forecasts", orderIndex: 2 },
    { dashboard: "business", categoryName: "Technology", categoryIcon: "Cpu", description: "Technology developments", orderIndex: 3 },
    { dashboard: "business", categoryName: "Economic Indicators", categoryIcon: "BarChart", description: "Economic data and indicators", orderIndex: 4 },
    
    // Education Dashboard Categories
    { dashboard: "education", categoryName: "Curriculum Resources", categoryIcon: "BookOpen", description: "Educational curriculum materials", orderIndex: 1 },
    { dashboard: "education", categoryName: "Research", categoryIcon: "Search", description: "Educational research", orderIndex: 2 },
    { dashboard: "education", categoryName: "Best Practices", categoryIcon: "CheckCircle", description: "Teaching best practices", orderIndex: 3 },
    { dashboard: "education", categoryName: "Accreditation", categoryIcon: "Award", description: "Accreditation requirements", orderIndex: 4 },
    
    // HR Dashboard Categories
    { dashboard: "hr", categoryName: "Employment Law", categoryIcon: "Scale", description: "Employment law updates", orderIndex: 1 },
    { dashboard: "hr", categoryName: "Benefits", categoryIcon: "Heart", description: "Employee benefits information", orderIndex: 2 },
    { dashboard: "hr", categoryName: "Training", categoryIcon: "GraduationCap", description: "Training resources", orderIndex: 3 },
    { dashboard: "hr", categoryName: "Compliance", categoryIcon: "Shield", description: "HR compliance requirements", orderIndex: 4 },
  ];
  
  for (const cat of categories) {
    try {
      await db.insert(resourceLinkCategories).values(cat);
    } catch (e) {
      // Ignore duplicates
    }
  }
  
  console.log("Seeding initial resource links...");
  
  // Seed initial resource links
  const links = [
    // Health Dashboard - ConsumerLab Recalls (as requested by user)
    {
      title: "ConsumerLab Product Recalls",
      url: "https://www.consumerlab.com/recalls/",
      description: "Stay informed about dietary supplement and health product recalls. Critical for wellness program safety and compliance.",
      dashboard: "health" as const,
      category: "Recalls & Alerts",
      tags: JSON.stringify(["recalls", "supplements", "safety", "consumer protection"]),
      priority: 10,
      isPinned: true,
      sourceName: "ConsumerLab",
      isAgentIdentified: false,
      approvalStatus: "approved" as const,
      swotRelevance: "threat" as const,
      swotReason: "Product recalls represent potential threats to wellness programs and employee health initiatives",
      industryCategory: "consumer" as const,
      impactLevel: "high" as const,
      impactTimeframe: "immediate" as const,
      requiresAction: true,
    },
    
    // Health Dashboard - FDA Recalls
    {
      title: "FDA Recalls, Market Withdrawals & Safety Alerts",
      url: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts",
      description: "Official FDA database of product recalls and safety alerts for food, drugs, and medical devices.",
      dashboard: "health" as const,
      category: "Recalls & Alerts",
      tags: JSON.stringify(["fda", "recalls", "safety", "regulatory"]),
      priority: 9,
      isPinned: true,
      sourceName: "FDA",
      isAgentIdentified: false,
      approvalStatus: "approved" as const,
      swotRelevance: "threat" as const,
      swotReason: "FDA recalls indicate regulatory risks and potential health hazards",
      industryCategory: "regulatory" as const,
      impactLevel: "critical" as const,
      impactTimeframe: "immediate" as const,
      requiresAction: true,
    },
    
    // Health Dashboard - CDC Health Topics
    {
      title: "CDC Health Topics A-Z",
      url: "https://www.cdc.gov/health-topics.html",
      description: "Comprehensive health information from the Centers for Disease Control and Prevention.",
      dashboard: "health" as const,
      category: "Research",
      tags: JSON.stringify(["cdc", "health", "research", "prevention"]),
      priority: 7,
      sourceName: "CDC",
      isAgentIdentified: false,
      approvalStatus: "approved" as const,
      swotRelevance: "strength" as const,
      swotReason: "Access to authoritative health information strengthens wellness program credibility",
      industryCategory: "general" as const,
      impactLevel: "medium" as const,
    },
    
    // Finance Dashboard - IRS News
    {
      title: "IRS News Releases",
      url: "https://www.irs.gov/newsroom",
      description: "Latest tax news, updates, and guidance from the Internal Revenue Service.",
      dashboard: "finance" as const,
      category: "Tax Updates",
      tags: JSON.stringify(["irs", "tax", "regulations", "compliance"]),
      priority: 9,
      isPinned: true,
      sourceName: "IRS",
      isAgentIdentified: false,
      approvalStatus: "approved" as const,
      swotRelevance: "threat" as const,
      swotReason: "Tax law changes can impact financial planning and compliance requirements",
      industryCategory: "regulatory" as const,
      impactLevel: "high" as const,
      impactTimeframe: "short_term" as const,
      requiresAction: true,
    },
    
    // Finance Dashboard - Grants.gov
    {
      title: "Grants.gov - Federal Grant Opportunities",
      url: "https://www.grants.gov/",
      description: "Search and apply for federal grants. Essential for nonprofit funding opportunities.",
      dashboard: "finance" as const,
      category: "Grant Opportunities",
      tags: JSON.stringify(["grants", "funding", "federal", "nonprofit"]),
      priority: 10,
      isPinned: true,
      sourceName: "Grants.gov",
      isAgentIdentified: false,
      approvalStatus: "approved" as const,
      swotRelevance: "opportunity" as const,
      swotReason: "Federal grants represent significant funding opportunities for nonprofit operations",
      industryCategory: "economic" as const,
      impactLevel: "high" as const,
      impactTimeframe: "medium_term" as const,
    },
    
    // Legal Dashboard - Federal Register
    {
      title: "Federal Register - Daily Journal of the US Government",
      url: "https://www.federalregister.gov/",
      description: "Official daily publication for rules, proposed rules, and notices of Federal agencies.",
      dashboard: "legal" as const,
      category: "Regulatory Updates",
      tags: JSON.stringify(["federal", "regulations", "government", "compliance"]),
      priority: 9,
      isPinned: true,
      sourceName: "Federal Register",
      isAgentIdentified: false,
      approvalStatus: "approved" as const,
      swotRelevance: "threat" as const,
      swotReason: "New federal regulations may require compliance changes",
      industryCategory: "regulatory" as const,
      impactLevel: "high" as const,
      impactTimeframe: "medium_term" as const,
      requiresAction: true,
    },
    
    // Legal Dashboard - 508(c)(1)(a) Resources
    {
      title: "IRS Tax Exempt Organization Search",
      url: "https://www.irs.gov/charities-non-profits/tax-exempt-organization-search",
      description: "Search for tax-exempt organizations and verify 508(c)(1)(a) status.",
      dashboard: "legal" as const,
      category: "Compliance",
      tags: JSON.stringify(["508c1a", "tax-exempt", "nonprofit", "compliance"]),
      priority: 8,
      sourceName: "IRS",
      isAgentIdentified: false,
      approvalStatus: "approved" as const,
      swotRelevance: "strength" as const,
      swotReason: "Maintaining tax-exempt status is a core organizational strength",
      industryCategory: "regulatory" as const,
      impactLevel: "critical" as const,
    },
    
    // Business Dashboard - SBA Resources
    {
      title: "SBA Business Guide",
      url: "https://www.sba.gov/business-guide",
      description: "Small Business Administration resources for planning, launching, and managing a business.",
      dashboard: "business" as const,
      category: "Market Trends",
      tags: JSON.stringify(["sba", "business", "resources", "planning"]),
      priority: 7,
      sourceName: "SBA",
      isAgentIdentified: false,
      approvalStatus: "approved" as const,
      swotRelevance: "opportunity" as const,
      swotReason: "SBA resources provide growth opportunities and business development support",
      industryCategory: "economic" as const,
      impactLevel: "medium" as const,
    },
    
    // Education Dashboard - Department of Education
    {
      title: "US Department of Education",
      url: "https://www.ed.gov/",
      description: "Federal education policies, programs, and resources.",
      dashboard: "education" as const,
      category: "Curriculum Resources",
      tags: JSON.stringify(["education", "federal", "policy", "curriculum"]),
      priority: 8,
      sourceName: "Dept of Education",
      isAgentIdentified: false,
      approvalStatus: "approved" as const,
      swotRelevance: "opportunity" as const,
      swotReason: "Federal education initiatives may provide funding and program opportunities",
      industryCategory: "regulatory" as const,
      impactLevel: "medium" as const,
      impactTimeframe: "long_term" as const,
    },
    
    // HR Dashboard - DOL Employment Law
    {
      title: "Department of Labor - Employment Law Guide",
      url: "https://www.dol.gov/agencies/whd/compliance-assistance",
      description: "Wage and hour compliance assistance and employment law resources.",
      dashboard: "hr" as const,
      category: "Employment Law",
      tags: JSON.stringify(["dol", "employment", "compliance", "labor law"]),
      priority: 9,
      isPinned: true,
      sourceName: "DOL",
      isAgentIdentified: false,
      approvalStatus: "approved" as const,
      swotRelevance: "threat" as const,
      swotReason: "Employment law changes require HR policy updates and compliance monitoring",
      industryCategory: "regulatory" as const,
      impactLevel: "high" as const,
      impactTimeframe: "short_term" as const,
      requiresAction: true,
    },
  ];
  
  for (const link of links) {
    try {
      await db.insert(resourceLinks).values(link);
      console.log(`  Added: ${link.title}`);
    } catch (e) {
      console.log(`  Skipped (exists): ${link.title}`);
    }
  }
  
  console.log("Resource links seeding complete!");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedResourceLinks()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
