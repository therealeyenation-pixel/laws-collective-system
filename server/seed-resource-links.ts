import { getDb } from "./db";
import { resourceLinks } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Initial resource links for the system
const initialLinks = [
  // Health Dashboard - Recalls and Safety
  {
    title: "ConsumerLab Product Recalls",
    url: "https://www.consumerlab.com/recalls/",
    description: "Track dietary supplement and health product recalls, warnings, and safety alerts from ConsumerLab's comprehensive database.",
    dashboard: "health" as const,
    category: "recalls",
    tags: ["recalls", "supplements", "safety", "health products"],
    priority: 100,
    isPinned: true,
    sourceName: "ConsumerLab",
    swotRelevance: "threat" as const,
    swotReason: "Product recalls represent potential threats to health programs and supplement recommendations",
    industryCategory: "consumer" as const,
    impactLevel: "high" as const,
    impactTimeframe: "immediate" as const,
    requiresAction: true,
  },
  {
    title: "FDA Recalls, Market Withdrawals & Safety Alerts",
    url: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts",
    description: "Official FDA database of product recalls, market withdrawals, and safety alerts for food, drugs, devices, and cosmetics.",
    dashboard: "health" as const,
    category: "recalls",
    tags: ["recalls", "FDA", "safety", "drugs", "food"],
    priority: 95,
    isPinned: true,
    sourceName: "FDA",
    swotRelevance: "threat" as const,
    swotReason: "FDA recalls can impact health programs and require immediate action",
    industryCategory: "regulatory" as const,
    impactLevel: "critical" as const,
    impactTimeframe: "immediate" as const,
    requiresAction: true,
  },
  {
    title: "CDC Health Alert Network",
    url: "https://emergency.cdc.gov/han/",
    description: "CDC's primary method of sharing urgent health information with public health practitioners.",
    dashboard: "health" as const,
    category: "alerts",
    tags: ["CDC", "health alerts", "public health", "emergencies"],
    priority: 90,
    sourceName: "CDC",
    swotRelevance: "threat" as const,
    industryCategory: "regulatory" as const,
    impactLevel: "high" as const,
  },
  
  // Finance Dashboard
  {
    title: "IRS Tax Calendar for Businesses",
    url: "https://www.irs.gov/businesses/small-businesses-self-employed/irs-tax-calendar-for-businesses-and-self-employed",
    description: "Official IRS calendar with all business tax deadlines, filing dates, and payment due dates.",
    dashboard: "finance" as const,
    category: "compliance",
    tags: ["IRS", "taxes", "deadlines", "compliance"],
    priority: 100,
    isPinned: true,
    sourceName: "IRS",
    swotRelevance: "threat" as const,
    swotReason: "Missing tax deadlines can result in penalties and legal issues",
    industryCategory: "regulatory" as const,
    impactLevel: "critical" as const,
    requiresAction: true,
  },
  {
    title: "SBA Funding Programs",
    url: "https://www.sba.gov/funding-programs",
    description: "Small Business Administration funding programs including loans, grants, and investment capital.",
    dashboard: "finance" as const,
    category: "funding",
    tags: ["SBA", "loans", "grants", "funding", "small business"],
    priority: 85,
    sourceName: "SBA",
    swotRelevance: "opportunity" as const,
    swotReason: "SBA programs provide funding opportunities for business growth",
    industryCategory: "economic" as const,
    impactLevel: "high" as const,
  },
  {
    title: "Grants.gov - Federal Grant Opportunities",
    url: "https://www.grants.gov/search-grants",
    description: "Official federal grants database with searchable opportunities across all federal agencies.",
    dashboard: "finance" as const,
    category: "grants",
    tags: ["grants", "federal", "funding", "opportunities"],
    priority: 90,
    isPinned: true,
    sourceName: "Grants.gov",
    swotRelevance: "opportunity" as const,
    swotReason: "Federal grants provide significant funding opportunities for nonprofits and education",
    industryCategory: "economic" as const,
    impactLevel: "high" as const,
  },
  
  // Legal Dashboard
  {
    title: "Federal Register - Daily Journal of the US Government",
    url: "https://www.federalregister.gov/",
    description: "Official daily publication for rules, proposed rules, and notices of Federal agencies and organizations.",
    dashboard: "legal" as const,
    category: "regulations",
    tags: ["federal register", "regulations", "rules", "government"],
    priority: 85,
    sourceName: "Federal Register",
    swotRelevance: "threat" as const,
    swotReason: "New regulations may require compliance changes",
    industryCategory: "regulatory" as const,
    impactLevel: "medium" as const,
  },
  {
    title: "State Nonprofit Registration Requirements",
    url: "https://www.harborcompliance.com/information/state-nonprofit-registration",
    description: "Guide to state-by-state nonprofit registration and annual filing requirements.",
    dashboard: "legal" as const,
    category: "compliance",
    tags: ["nonprofit", "registration", "compliance", "state requirements"],
    priority: 80,
    sourceName: "Harbor Compliance",
    swotRelevance: "threat" as const,
    industryCategory: "regulatory" as const,
    impactLevel: "high" as const,
    requiresAction: true,
  },
  
  // Education Dashboard
  {
    title: "Department of Education Grant Programs",
    url: "https://www2.ed.gov/fund/grants-apply.html",
    description: "Federal education grant programs and application information from the Department of Education.",
    dashboard: "education" as const,
    category: "grants",
    tags: ["education", "grants", "federal", "funding"],
    priority: 90,
    isPinned: true,
    sourceName: "Dept of Education",
    swotRelevance: "opportunity" as const,
    swotReason: "Education grants align with 508 Academy mission",
    industryCategory: "economic" as const,
    impactLevel: "high" as const,
  },
  {
    title: "STEM Education Resources - NSF",
    url: "https://www.nsf.gov/funding/programs.jsp?org=EHR",
    description: "National Science Foundation STEM education funding opportunities and resources.",
    dashboard: "education" as const,
    category: "grants",
    tags: ["STEM", "NSF", "education", "funding", "science"],
    priority: 85,
    sourceName: "NSF",
    swotRelevance: "opportunity" as const,
    industryCategory: "economic" as const,
    impactLevel: "high" as const,
  },
  
  // HR Dashboard
  {
    title: "DOL Wage and Hour Division",
    url: "https://www.dol.gov/agencies/whd",
    description: "Department of Labor resources on minimum wage, overtime, and worker classification.",
    dashboard: "hr" as const,
    category: "compliance",
    tags: ["DOL", "wages", "overtime", "labor law", "compliance"],
    priority: 90,
    isPinned: true,
    sourceName: "Dept of Labor",
    swotRelevance: "threat" as const,
    swotReason: "Labor law compliance is critical to avoid penalties",
    industryCategory: "regulatory" as const,
    impactLevel: "high" as const,
    requiresAction: true,
  },
  {
    title: "EEOC Guidance and Resources",
    url: "https://www.eeoc.gov/employers",
    description: "Equal Employment Opportunity Commission guidance for employers on discrimination, harassment, and compliance.",
    dashboard: "hr" as const,
    category: "compliance",
    tags: ["EEOC", "discrimination", "harassment", "employment law"],
    priority: 85,
    sourceName: "EEOC",
    swotRelevance: "threat" as const,
    industryCategory: "regulatory" as const,
    impactLevel: "high" as const,
  },
  
  // Business Dashboard
  {
    title: "SBA Business Guide",
    url: "https://www.sba.gov/business-guide",
    description: "Comprehensive guide to starting, managing, and growing a small business from the SBA.",
    dashboard: "business" as const,
    category: "resources",
    tags: ["SBA", "business", "startup", "guide", "small business"],
    priority: 80,
    sourceName: "SBA",
    swotRelevance: "strength" as const,
    swotReason: "Provides resources to strengthen business operations",
    industryCategory: "general" as const,
    impactLevel: "medium" as const,
  },
  {
    title: "USPTO Trademark Search",
    url: "https://www.uspto.gov/trademarks/search",
    description: "Search the USPTO trademark database before filing or to monitor competitor trademarks.",
    dashboard: "business" as const,
    category: "intellectual property",
    tags: ["USPTO", "trademark", "intellectual property", "search"],
    priority: 75,
    sourceName: "USPTO",
    swotRelevance: "strength" as const,
    industryCategory: "general" as const,
    impactLevel: "medium" as const,
  },
  
  // Operations Dashboard
  {
    title: "OSHA Safety Resources",
    url: "https://www.osha.gov/safety-management",
    description: "Occupational Safety and Health Administration resources for workplace safety management.",
    dashboard: "operations" as const,
    category: "compliance",
    tags: ["OSHA", "safety", "workplace", "compliance"],
    priority: 85,
    sourceName: "OSHA",
    swotRelevance: "threat" as const,
    swotReason: "Workplace safety violations can result in fines and liability",
    industryCategory: "regulatory" as const,
    impactLevel: "high" as const,
    requiresAction: true,
  },
  {
    title: "CPSC Recalls",
    url: "https://www.cpsc.gov/Recalls",
    description: "Consumer Product Safety Commission recall database for consumer products.",
    dashboard: "operations" as const,
    category: "recalls",
    tags: ["CPSC", "recalls", "consumer products", "safety"],
    priority: 80,
    sourceName: "CPSC",
    swotRelevance: "threat" as const,
    industryCategory: "consumer" as const,
    impactLevel: "high" as const,
    requiresAction: true,
  },
  
  // Governance Dashboard
  {
    title: "BoardSource - Nonprofit Governance",
    url: "https://boardsource.org/resources/",
    description: "Resources for nonprofit board governance, best practices, and board development.",
    dashboard: "governance" as const,
    category: "governance",
    tags: ["board", "governance", "nonprofit", "best practices"],
    priority: 85,
    sourceName: "BoardSource",
    swotRelevance: "strength" as const,
    swotReason: "Strong governance practices are a competitive advantage",
    industryCategory: "general" as const,
    impactLevel: "medium" as const,
  },
  {
    title: "IRS Exempt Organizations Resources",
    url: "https://www.irs.gov/charities-non-profits",
    description: "IRS resources for tax-exempt organizations including compliance, reporting, and governance.",
    dashboard: "governance" as const,
    category: "compliance",
    tags: ["IRS", "nonprofit", "tax-exempt", "compliance"],
    priority: 90,
    isPinned: true,
    sourceName: "IRS",
    swotRelevance: "threat" as const,
    swotReason: "Nonprofit compliance is critical to maintaining tax-exempt status",
    industryCategory: "regulatory" as const,
    impactLevel: "critical" as const,
    requiresAction: true,
  },
];

export async function seedResourceLinks() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }
  
  console.log("Seeding resource links...");
  
  for (const link of initialLinks) {
    const existing = await db.select().from(resourceLinks).where(eq(resourceLinks.url, link.url)).limit(1);
    if (existing.length === 0) {
      await db.insert(resourceLinks).values(link);
      console.log(`  Created link: ${link.title}`);
    } else {
      console.log(`  Link already exists: ${link.title}`);
    }
  }
  
  console.log("\nResource links seeding complete!");
}

// Run if called directly
seedResourceLinks().catch(console.error);
