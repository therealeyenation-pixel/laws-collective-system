import { db } from "./db";
import { governmentAgencies, governmentActions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Federal agencies relevant to the LuvOnPurpose system
const agencies = [
  {
    code: "IRS",
    name: "Internal Revenue Service",
    fullName: "Department of the Treasury - Internal Revenue Service",
    level: "federal" as const,
    website: "https://www.irs.gov",
    relevantDepartments: ["finance", "legal", "foundation"],
    relevantEntities: ["508_academy", "laws_collective", "real_eye_nation"],
  },
  {
    code: "SBA",
    name: "Small Business Administration",
    fullName: "U.S. Small Business Administration",
    level: "federal" as const,
    website: "https://www.sba.gov",
    relevantDepartments: ["business", "finance", "grants"],
    relevantEntities: ["laws_collective", "real_eye_nation"],
  },
  {
    code: "HHS",
    name: "Health & Human Services",
    fullName: "Department of Health and Human Services",
    level: "federal" as const,
    website: "https://www.hhs.gov",
    relevantDepartments: ["health", "education", "grants"],
    relevantEntities: ["508_academy", "laws_collective"],
  },
  {
    code: "DOL",
    name: "Department of Labor",
    fullName: "U.S. Department of Labor",
    level: "federal" as const,
    website: "https://www.dol.gov",
    relevantDepartments: ["hr", "legal", "operations"],
    relevantEntities: ["all"],
  },
  {
    code: "ED",
    name: "Department of Education",
    fullName: "U.S. Department of Education",
    level: "federal" as const,
    website: "https://www.ed.gov",
    relevantDepartments: ["education", "academy", "grants"],
    relevantEntities: ["508_academy"],
  },
  {
    code: "SEC",
    name: "Securities and Exchange Commission",
    fullName: "U.S. Securities and Exchange Commission",
    level: "federal" as const,
    website: "https://www.sec.gov",
    relevantDepartments: ["finance", "legal", "business"],
    relevantEntities: ["real_eye_nation"],
  },
  {
    code: "FTC",
    name: "Federal Trade Commission",
    fullName: "Federal Trade Commission",
    level: "federal" as const,
    website: "https://www.ftc.gov",
    relevantDepartments: ["marketing", "legal", "business"],
    relevantEntities: ["all"],
  },
  {
    code: "EEOC",
    name: "Equal Employment Opportunity Commission",
    fullName: "U.S. Equal Employment Opportunity Commission",
    level: "federal" as const,
    website: "https://www.eeoc.gov",
    relevantDepartments: ["hr", "legal"],
    relevantEntities: ["all"],
  },
  {
    code: "USPTO",
    name: "Patent and Trademark Office",
    fullName: "U.S. Patent and Trademark Office",
    level: "federal" as const,
    website: "https://www.uspto.gov",
    relevantDepartments: ["legal", "business", "media"],
    relevantEntities: ["real_eye_nation", "508_academy"],
  },
  {
    code: "OSHA",
    name: "Occupational Safety and Health Administration",
    fullName: "Occupational Safety and Health Administration",
    level: "federal" as const,
    website: "https://www.osha.gov",
    relevantDepartments: ["operations", "hr", "health"],
    relevantEntities: ["all"],
  },
  {
    code: "FDA",
    name: "Food and Drug Administration",
    fullName: "U.S. Food and Drug Administration",
    level: "federal" as const,
    website: "https://www.fda.gov",
    relevantDepartments: ["health", "operations"],
    relevantEntities: ["laws_collective"],
  },
  {
    code: "CPSC",
    name: "Consumer Product Safety Commission",
    fullName: "U.S. Consumer Product Safety Commission",
    level: "federal" as const,
    website: "https://www.cpsc.gov",
    relevantDepartments: ["operations", "legal", "health"],
    relevantEntities: ["all"],
  },
  {
    code: "NIST",
    name: "National Institute of Standards and Technology",
    fullName: "National Institute of Standards and Technology",
    level: "federal" as const,
    website: "https://www.nist.gov",
    relevantDepartments: ["it", "operations"],
    relevantEntities: ["all"],
  },
  {
    code: "SSA",
    name: "Social Security Administration",
    fullName: "Social Security Administration",
    level: "federal" as const,
    website: "https://www.ssa.gov",
    relevantDepartments: ["hr", "finance"],
    relevantEntities: ["all"],
  },
];

// Sample government actions
const sampleActions = [
  {
    title: "Form 990 Annual Filing Deadline",
    description: "Annual information return for tax-exempt organizations. Must be filed by the 15th day of the 5th month after the organization's accounting period ends.",
    actionType: "filing_deadline" as const,
    agencyCode: "IRS",
    deadline: new Date("2026-05-15"),
    impactLevel: "critical" as const,
    affectedDepartments: ["finance", "legal", "foundation"],
    swotCategory: "threat" as const,
    swotNotes: "Non-compliance can result in penalties and loss of tax-exempt status",
    showInTicker: true,
    tickerPriority: "urgent" as const,
    sourceUrl: "https://www.irs.gov/forms-pubs/about-form-990",
  },
  {
    title: "Quarterly Estimated Tax Payments - Q1 2026",
    description: "First quarter estimated tax payment due for businesses and self-employed individuals.",
    actionType: "tax_update" as const,
    agencyCode: "IRS",
    deadline: new Date("2026-04-15"),
    impactLevel: "high" as const,
    affectedDepartments: ["finance"],
    swotCategory: "threat" as const,
    showInTicker: true,
    tickerPriority: "high" as const,
    sourceUrl: "https://www.irs.gov/businesses/small-businesses-self-employed/estimated-taxes",
  },
  {
    title: "SBA 8(a) Business Development Program Application Window",
    description: "Application period for the SBA 8(a) program which helps small disadvantaged businesses compete in the marketplace.",
    actionType: "grant_announcement" as const,
    agencyCode: "SBA",
    effectiveDate: new Date("2026-01-01"),
    deadline: new Date("2026-12-31"),
    impactLevel: "high" as const,
    affectedDepartments: ["business", "grants"],
    swotCategory: "opportunity" as const,
    swotNotes: "Could provide significant contracting opportunities for qualifying entities",
    showInTicker: true,
    tickerPriority: "normal" as const,
    sourceUrl: "https://www.sba.gov/federal-contracting/contracting-assistance-programs/8a-business-development-program",
  },
  {
    title: "OSHA Workplace Safety Standards Update",
    description: "Updated workplace safety standards for 2026 including new requirements for remote work environments.",
    actionType: "regulatory_change" as const,
    agencyCode: "OSHA",
    effectiveDate: new Date("2026-03-01"),
    impactLevel: "medium" as const,
    affectedDepartments: ["hr", "operations", "health"],
    swotCategory: "threat" as const,
    showInTicker: true,
    tickerPriority: "normal" as const,
    sourceUrl: "https://www.osha.gov/laws-regs",
  },
  {
    title: "DOL Minimum Wage Increase",
    description: "Federal minimum wage adjustment effective for 2026. Review all employee compensation for compliance.",
    actionType: "labor_law" as const,
    agencyCode: "DOL",
    effectiveDate: new Date("2026-01-01"),
    impactLevel: "high" as const,
    affectedDepartments: ["hr", "finance"],
    swotCategory: "threat" as const,
    swotNotes: "May require budget adjustments for hourly employees",
    showInTicker: true,
    tickerPriority: "high" as const,
    sourceUrl: "https://www.dol.gov/agencies/whd/minimum-wage",
  },
  {
    title: "Nonprofit Compliance Annual Review",
    description: "Annual review of nonprofit compliance requirements including state registrations, board governance, and conflict of interest policies.",
    actionType: "nonprofit_compliance" as const,
    agencyCode: "IRS",
    deadline: new Date("2026-06-30"),
    impactLevel: "high" as const,
    affectedDepartments: ["legal", "foundation", "executive"],
    swotCategory: "threat" as const,
    showInTicker: true,
    tickerPriority: "normal" as const,
  },
  {
    title: "FTC Updated Advertising Guidelines",
    description: "New guidelines for digital advertising including social media influencer disclosures and AI-generated content labeling.",
    actionType: "guidance_update" as const,
    agencyCode: "FTC",
    effectiveDate: new Date("2026-04-01"),
    impactLevel: "medium" as const,
    affectedDepartments: ["marketing", "media", "legal"],
    swotCategory: "threat" as const,
    showInTicker: true,
    tickerPriority: "normal" as const,
    sourceUrl: "https://www.ftc.gov/business-guidance/advertising-marketing",
  },
  {
    title: "Education Grant Opportunity - STEM Programs",
    description: "Department of Education grant opportunity for organizations providing STEM education to underserved communities.",
    actionType: "grant_announcement" as const,
    agencyCode: "ED",
    effectiveDate: new Date("2026-02-01"),
    deadline: new Date("2026-04-30"),
    impactLevel: "high" as const,
    affectedDepartments: ["education", "academy", "grants"],
    swotCategory: "opportunity" as const,
    swotNotes: "Aligns with 508 Academy mission - high priority application",
    showInTicker: true,
    tickerPriority: "high" as const,
    sourceUrl: "https://www.ed.gov/grants",
  },
  {
    title: "FDA Supplement Labeling Requirements",
    description: "Updated labeling requirements for dietary supplements and health products.",
    actionType: "regulatory_change" as const,
    agencyCode: "FDA",
    effectiveDate: new Date("2026-07-01"),
    impactLevel: "medium" as const,
    affectedDepartments: ["health", "operations"],
    swotCategory: "threat" as const,
    showInTicker: true,
    tickerPriority: "normal" as const,
    sourceUrl: "https://www.fda.gov/food/dietary-supplements",
  },
  {
    title: "EEOC Pay Equity Reporting Requirements",
    description: "New reporting requirements for pay equity data collection and submission.",
    actionType: "labor_law" as const,
    agencyCode: "EEOC",
    effectiveDate: new Date("2026-03-31"),
    deadline: new Date("2026-09-30"),
    impactLevel: "medium" as const,
    affectedDepartments: ["hr", "legal"],
    swotCategory: "threat" as const,
    showInTicker: true,
    tickerPriority: "normal" as const,
    sourceUrl: "https://www.eeoc.gov/employers",
  },
];

export async function seedGovernmentData() {
  console.log("Seeding government agencies...");
  
  // Insert agencies
  for (const agency of agencies) {
    const existing = await db.select().from(governmentAgencies).where(eq(governmentAgencies.code, agency.code)).limit(1);
    if (existing.length === 0) {
      await db.insert(governmentAgencies).values(agency);
      console.log(`  Created agency: ${agency.code} - ${agency.name}`);
    } else {
      console.log(`  Agency already exists: ${agency.code}`);
    }
  }
  
  console.log("\nSeeding government actions...");
  
  // Get agency IDs
  const agencyList = await db.select().from(governmentAgencies);
  const agencyMap = new Map(agencyList.map(a => [a.code, a.id]));
  
  // Insert sample actions
  for (const action of sampleActions) {
    const agencyId = agencyMap.get(action.agencyCode);
    if (!agencyId) {
      console.log(`  Skipping action (agency not found): ${action.title}`);
      continue;
    }
    
    const existing = await db.select().from(governmentActions).where(eq(governmentActions.title, action.title)).limit(1);
    if (existing.length === 0) {
      const { agencyCode, ...actionData } = action;
      await db.insert(governmentActions).values({
        ...actionData,
        agencyId,
      });
      console.log(`  Created action: ${action.title}`);
    } else {
      console.log(`  Action already exists: ${action.title}`);
    }
  }
  
  console.log("\nGovernment data seeding complete!");
}

// Run if called directly
seedGovernmentData().catch(console.error);
