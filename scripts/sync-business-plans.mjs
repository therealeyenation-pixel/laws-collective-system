/**
 * Sync Business Plan JSON files to database
 * Run with: node scripts/sync-business-plans.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read JSON files
const lawsCollectivePath = path.join(__dirname, '../client/public/docs/laws_collective_business_plan.json');
const academyPath = path.join(__dirname, '../client/public/docs/luvonpurpose_academy_business_plan.json');

const lawsData = JSON.parse(fs.readFileSync(lawsCollectivePath, 'utf-8'));
const academyData = JSON.parse(fs.readFileSync(academyPath, 'utf-8'));

// Map JSON structure to database fields
function mapLawsCollectiveToDb(data) {
  return {
    entityName: "The L.A.W.S. Collective, LLC",
    entityType: "llc",
    missionStatement: data.executiveSummary?.mission || "",
    visionStatement: data.executiveSummary?.vision || "",
    organizationDescription: `${data.executiveSummary?.uniqueValueProposition || ""} Technology Focus: ${data.executiveSummary?.technologyFocus?.description || ""}`,
    yearFounded: parseInt(data.businessPlan?.founded) || 2024,
    productsServices: data.executiveSummary?.coreOfferings?.join(", ") || "",
    uniqueValueProposition: data.executiveSummary?.uniqueValueProposition || "",
    targetMarket: "W-2 employees seeking transition to independent contractors and business owners; underserved communities lacking access to business development resources",
    marketSize: "$50B+ workforce development market",
    competitiveAdvantage: "Only program combining legal compliance, technology platform, and community support for workforce-to-ownership transition",
    teamSize: 6,
    teamDescription: "Family-based leadership team with expertise in business development, education, and community organizing",
    fundingNeeded: 500000,
    fundingPurpose: "Platform development, contractor training program expansion, and community outreach",
    socialImpact: "Transform employees into independent business owners, creating generational wealth in underserved communities",
    communityBenefit: "50+ new businesses created within 5 years; 100+ contractors successfully transitioned",
    shortTermGoals: JSON.stringify([
      { goal: "Launch contractor transition program", timeline: "Q1 2026" },
      { goal: "Complete SaaS platform MVP", timeline: "Q2 2026" },
      { goal: "Transition first cohort of 10 contractors", timeline: "Q3 2026" }
    ]),
    longTermGoals: JSON.stringify([
      { goal: "Create 50+ new businesses", timeline: "5 years" },
      { goal: "Achieve $1M annual platform revenue", timeline: "3 years" },
      { goal: "Expand to 5 states", timeline: "5 years" }
    ]),
    milestones: JSON.stringify([
      { milestone: "Platform Beta Launch", targetDate: "2026-03-01" },
      { milestone: "First Contractor Cohort", targetDate: "2026-06-01" },
      { milestone: "SBIR Phase I Application", targetDate: "2026-09-01" }
    ])
  };
}

function mapAcademyToDb(data) {
  return {
    entityName: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
    entityType: "nonprofit_508",
    missionStatement: data.executiveSummary?.mission || "",
    visionStatement: data.executiveSummary?.vision || "",
    organizationDescription: data.executiveSummary?.uniqueValueProposition || "",
    yearFounded: parseInt(data.businessPlan?.founded) || 2025,
    productsServices: data.executiveSummary?.coreOfferings?.join(", ") || "",
    uniqueValueProposition: data.executiveSummary?.uniqueValueProposition || "",
    targetMarket: "Families seeking faith-based, culturally-rooted education; homeschool families; communities underserved by traditional education",
    marketSize: "$10B+ faith-based education market",
    competitiveAdvantage: "Unique integration of ancestral wisdom, Divine STEM, and sovereign skill-building in a faith-based framework",
    teamSize: 8,
    teamDescription: "Faith-based educators, curriculum developers, and community leaders",
    fundingNeeded: 250000,
    fundingPurpose: "Curriculum development, facility acquisition, and scholarship fund establishment",
    socialImpact: "Provide sovereign education that builds identity, purpose, and practical skills for generational success",
    communityBenefit: "100+ students enrolled within 3 years; 50+ families supported through scholarship programs",
    shortTermGoals: JSON.stringify([
      { goal: "Complete K-5 curriculum development", timeline: "Q2 2026" },
      { goal: "Launch pilot program with 20 students", timeline: "Q3 2026" },
      { goal: "Establish scholarship fund", timeline: "Q4 2026" }
    ]),
    longTermGoals: JSON.stringify([
      { goal: "Full K-12 curriculum", timeline: "5 years" },
      { goal: "Physical academy facility", timeline: "3 years" },
      { goal: "Accreditation", timeline: "5 years" }
    ]),
    milestones: JSON.stringify([
      { milestone: "Curriculum Framework Complete", targetDate: "2026-04-01" },
      { milestone: "Pilot Program Launch", targetDate: "2026-08-01" },
      { milestone: "First Scholarship Awards", targetDate: "2026-12-01" }
    ])
  };
}

// Output SQL statements
const lawsDbData = mapLawsCollectiveToDb(lawsData);
const academyDbData = mapAcademyToDb(academyData);

console.log("=== L.A.W.S. Collective Business Plan ===");
console.log(JSON.stringify(lawsDbData, null, 2));

console.log("\n=== LuvOnPurpose Academy Business Plan ===");
console.log(JSON.stringify(academyDbData, null, 2));

// Generate UPDATE SQL
function generateUpdateSql(data, entityName) {
  const escapeStr = (s) => s ? s.replace(/'/g, "''") : "";
  return `
UPDATE business_plans SET
  missionStatement = '${escapeStr(data.missionStatement)}',
  visionStatement = '${escapeStr(data.visionStatement)}',
  organizationDescription = '${escapeStr(data.organizationDescription)}',
  yearFounded = ${data.yearFounded},
  productsServices = '${escapeStr(data.productsServices)}',
  uniqueValueProposition = '${escapeStr(data.uniqueValueProposition)}',
  targetMarket = '${escapeStr(data.targetMarket)}',
  marketSize = '${escapeStr(data.marketSize)}',
  competitiveAdvantage = '${escapeStr(data.competitiveAdvantage)}',
  teamSize = ${data.teamSize},
  teamDescription = '${escapeStr(data.teamDescription)}',
  fundingNeeded = ${data.fundingNeeded},
  fundingPurpose = '${escapeStr(data.fundingPurpose)}',
  socialImpact = '${escapeStr(data.socialImpact)}',
  communityBenefit = '${escapeStr(data.communityBenefit)}',
  shortTermGoals = '${data.shortTermGoals}',
  longTermGoals = '${data.longTermGoals}',
  milestones = '${data.milestones}',
  updatedAt = NOW()
WHERE entityName = '${escapeStr(entityName)}';
`;
}

console.log("\n=== SQL UPDATE Statements ===");
console.log(generateUpdateSql(lawsDbData, "The L.A.W.S. Collective, LLC"));
console.log(generateUpdateSql(academyDbData, "LuvOnPurpose Outreach Temple and Academy Society, Inc."));
