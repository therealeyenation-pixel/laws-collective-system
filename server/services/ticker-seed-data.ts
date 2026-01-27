import { db } from "../db";
import { resourceLinks } from "../../drizzle/schema";

// Department-specific government announcements and regulatory updates
export const tickerSeedData = [
  // Finance Department
  {
    title: "IRS Announces 2026 Tax Filing Season Opens January 27",
    url: "https://www.irs.gov/newsroom",
    description: "Individual tax returns for 2025 can now be filed. Deadline is April 15, 2026.",
    dashboard: "finance" as const,
    category: "tax",
    priority: 9,
    sourceName: "IRS",
    swotType: "opportunity" as const,
    swotRelevance: "opportunity" as const,
  },
  {
    title: "Treasury Updates Beneficial Ownership Reporting Requirements",
    url: "https://www.fincen.gov/boi",
    description: "New BOI reporting deadline extended. Check FinCEN for updated guidance.",
    dashboard: "finance" as const,
    category: "compliance",
    priority: 8,
    sourceName: "FinCEN",
    swotType: "threat" as const,
    swotRelevance: "threat" as const,
  },
  {
    title: "Federal Reserve Holds Interest Rates Steady",
    url: "https://www.federalreserve.gov/newsevents.htm",
    description: "Fed maintains current rate levels. Next meeting scheduled for March.",
    dashboard: "finance" as const,
    category: "economic",
    priority: 7,
    sourceName: "Federal Reserve",
    swotType: "opportunity" as const,
    swotRelevance: "opportunity" as const,
  },
  
  // Legal Department
  {
    title: "DOJ Updates Corporate Compliance Program Guidance",
    url: "https://www.justice.gov/criminal-fraud",
    description: "New evaluation criteria for corporate compliance programs released.",
    dashboard: "legal" as const,
    category: "compliance",
    priority: 9,
    sourceName: "DOJ",
    swotType: "threat" as const,
    swotRelevance: "threat" as const,
  },
  {
    title: "FTC Finalizes Non-Compete Ban Rule",
    url: "https://www.ftc.gov/news-events",
    description: "New restrictions on non-compete agreements take effect. Review employment contracts.",
    dashboard: "legal" as const,
    category: "employment",
    priority: 9,
    sourceName: "FTC",
    swotType: "threat" as const,
    swotRelevance: "threat" as const,
  },
  {
    title: "USPTO Updates Trademark Filing Procedures",
    url: "https://www.uspto.gov/trademarks",
    description: "Electronic filing requirements updated. New fee schedule effective February 1.",
    dashboard: "legal" as const,
    category: "intellectual-property",
    priority: 6,
    sourceName: "USPTO",
    swotType: "opportunity" as const,
    swotRelevance: "opportunity" as const,
  },
  
  // HR Department
  {
    title: "DOL Increases Overtime Salary Threshold",
    url: "https://www.dol.gov/agencies/whd/overtime",
    description: "New salary threshold for overtime exemption. Review employee classifications.",
    dashboard: "hr" as const,
    category: "compensation",
    priority: 9,
    sourceName: "DOL",
    swotType: "threat" as const,
    swotRelevance: "threat" as const,
  },
  {
    title: "EEOC Updates Harassment Prevention Guidelines",
    url: "https://www.eeoc.gov/harassment",
    description: "New workplace harassment prevention requirements. Update training programs.",
    dashboard: "hr" as const,
    category: "compliance",
    priority: 8,
    sourceName: "EEOC",
    swotType: "threat" as const,
    swotRelevance: "threat" as const,
  },
  {
    title: "I-9 Form Updated - New Version Required",
    url: "https://www.uscis.gov/i-9",
    description: "USCIS releases updated I-9 form. Previous versions no longer accepted.",
    dashboard: "hr" as const,
    category: "compliance",
    priority: 8,
    sourceName: "USCIS",
    swotType: "threat" as const,
    swotRelevance: "threat" as const,
  },
  
  // Compliance Department
  {
    title: "SEC Adopts New Climate Disclosure Rules",
    url: "https://www.sec.gov/news/press-releases",
    description: "Public companies must disclose climate-related risks. Phase-in begins 2026.",
    dashboard: "governance" as const,
    category: "regulatory",
    priority: 9,
    sourceName: "SEC",
    swotType: "threat" as const,
    swotRelevance: "threat" as const,
  },
  {
    title: "OSHA Updates Workplace Safety Standards",
    url: "https://www.osha.gov/news",
    description: "New heat illness prevention requirements. Compliance deadline April 1.",
    dashboard: "governance" as const,
    category: "safety",
    priority: 8,
    sourceName: "OSHA",
    swotType: "threat" as const,
    swotRelevance: "threat" as const,
  },
  
  // Operations Department
  {
    title: "EPA Finalizes New Emissions Standards",
    url: "https://www.epa.gov/newsreleases",
    description: "Stricter emissions requirements for commercial vehicles. Plan fleet updates.",
    dashboard: "operations" as const,
    category: "environmental",
    priority: 7,
    sourceName: "EPA",
    swotType: "threat" as const,
    swotRelevance: "threat" as const,
  },
  {
    title: "DOT Updates Commercial Driver Requirements",
    url: "https://www.fmcsa.dot.gov/newsroom",
    description: "New drug testing requirements for CDL holders effective immediately.",
    dashboard: "operations" as const,
    category: "transportation",
    priority: 8,
    sourceName: "DOT",
    swotType: "threat" as const,
    swotRelevance: "threat" as const,
  },
  
  // Health Department
  {
    title: "FDA Issues New Dietary Supplement Guidance",
    url: "https://www.fda.gov/news-events",
    description: "Updated labeling requirements for dietary supplements. Review product labels.",
    dashboard: "health" as const,
    category: "regulatory",
    priority: 8,
    sourceName: "FDA",
    swotType: "threat" as const,
    swotRelevance: "threat" as const,
  },
  {
    title: "CDC Updates Workplace Health Guidelines",
    url: "https://www.cdc.gov/media",
    description: "New recommendations for workplace wellness programs and sick leave policies.",
    dashboard: "health" as const,
    category: "wellness",
    priority: 6,
    sourceName: "CDC",
    swotType: "opportunity" as const,
    swotRelevance: "opportunity" as const,
  },
  
  // Education Department
  {
    title: "DOE Announces New Student Loan Forgiveness Program",
    url: "https://www.ed.gov/news",
    description: "Expanded eligibility for public service loan forgiveness. Check qualifications.",
    dashboard: "education" as const,
    category: "financial-aid",
    priority: 8,
    sourceName: "DOE",
    swotType: "opportunity" as const,
    swotRelevance: "opportunity" as const,
  },
  {
    title: "Workforce Development Grants Available",
    url: "https://www.doleta.gov/grants",
    description: "New funding for workforce training programs. Application deadline March 15.",
    dashboard: "education" as const,
    category: "grants",
    priority: 9,
    sourceName: "DOL",
    swotType: "opportunity" as const,
    swotRelevance: "opportunity" as const,
  },
  
  // Business/General
  {
    title: "SBA Disaster Loan Program Expanded",
    url: "https://www.sba.gov/funding-programs/disaster-assistance",
    description: "Additional funding available for businesses affected by recent disasters.",
    dashboard: "business" as const,
    category: "funding",
    priority: 8,
    sourceName: "SBA",
    swotType: "opportunity" as const,
    swotRelevance: "opportunity" as const,
  },
  {
    title: "Census Bureau Releases New Economic Data",
    url: "https://www.census.gov/newsroom",
    description: "Latest business formation and economic indicators available for planning.",
    dashboard: "business" as const,
    category: "economic",
    priority: 5,
    sourceName: "Census Bureau",
    swotType: "opportunity" as const,
    swotRelevance: "opportunity" as const,
  },
];

export async function seedTickerData() {
  console.log("[TickerSeed] Starting to seed ticker data...");
  
  let inserted = 0;
  let skipped = 0;
  
  for (const item of tickerSeedData) {
    try {
      await db.insert(resourceLinks).values({
        title: item.title,
        url: item.url,
        description: item.description,
        dashboard: item.dashboard,
        category: item.category,
        priority: item.priority,
        sourceName: item.sourceName,
        swotType: item.swotType,
        swotRelevance: item.swotRelevance,
        isActive: true,
        approvalStatus: "approved",
        approvedAt: new Date(),
        createdAt: new Date(),
      });
      inserted++;
    } catch (error: any) {
      // Skip duplicates
      if (error.code === "ER_DUP_ENTRY") {
        skipped++;
      } else {
        console.error(`[TickerSeed] Error inserting ${item.title}:`, error.message);
      }
    }
  }
  
  console.log(`[TickerSeed] Complete: ${inserted} inserted, ${skipped} skipped`);
  return { inserted, skipped };
}
