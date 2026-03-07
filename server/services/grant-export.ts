/**
 * Grant Application PDF Export Service
 * 
 * Generates submission-ready grant applications with auto-populated need statements,
 * cover letters, budget breakdowns, and organizational information.
 */

import { getNeedStatement, type EntityType } from './need-statements';

// Grant template types
export type GrantTemplateType = 
  | 'federal_nea'      // National Endowment for the Arts
  | 'federal_usda'     // USDA Rural Development
  | 'federal_sba'      // Small Business Administration
  | 'foundation_ford'  // Ford Foundation
  | 'foundation_kellogg' // W.K. Kellogg Foundation
  | 'foundation_macarthur' // MacArthur Foundation
  | 'generic';         // Generic template

export interface GrantTemplate {
  id: GrantTemplateType;
  name: string;
  organization: string;
  description: string;
  sections: string[];
  maxFunding: number;
  eligibleEntities: EntityType[];
  deadlineInfo: string;
  requiredDocuments: string[];
}

export interface GrantApplicationData {
  entityType: EntityType;
  templateType: GrantTemplateType;
  applicantName: string;
  applicantTitle: string;
  organizationName: string;
  organizationAddress: string;
  organizationPhone: string;
  organizationEmail: string;
  organizationWebsite?: string;
  einNumber: string;
  dunsNumber?: string;
  requestedAmount: number;
  projectTitle: string;
  projectStartDate: string;
  projectEndDate: string;
  projectSummary?: string;
  customNeedStatement?: string;
  budgetItems: BudgetItem[];
  additionalDocuments?: string[];
}

export interface BudgetItem {
  category: string;
  description: string;
  amount: number;
  justification: string;
}

export interface GeneratedApplication {
  id: string;
  entityType: EntityType;
  templateType: GrantTemplateType;
  generatedAt: number;
  sections: ApplicationSection[];
  totalBudget: number;
  metadata: {
    organizationName: string;
    projectTitle: string;
    requestedAmount: number;
    templateName: string;
  };
}

export interface ApplicationSection {
  title: string;
  content: string;
  order: number;
}

// Grant templates database
const grantTemplates: Record<GrantTemplateType, GrantTemplate> = {
  federal_nea: {
    id: 'federal_nea',
    name: 'NEA Art Works Grant',
    organization: 'National Endowment for the Arts',
    description: 'Supports artistically excellent projects that celebrate creativity and cultural heritage',
    sections: ['Cover Sheet', 'Project Narrative', 'Organizational Background', 'Work Samples', 'Budget'],
    maxFunding: 100000,
    eligibleEntities: ['real_eye_nation', '508_academy'],
    deadlineInfo: 'Annual deadline: February for projects starting the following year',
    requiredDocuments: ['IRS Determination Letter', 'Board List', 'Work Samples', 'Resumes']
  },
  federal_usda: {
    id: 'federal_usda',
    name: 'USDA Rural Business Development Grant',
    organization: 'USDA Rural Development',
    description: 'Supports rural small business development and job creation',
    sections: ['Application Form', 'Project Description', 'Need Statement', 'Budget', 'Supporting Documents'],
    maxFunding: 500000,
    eligibleEntities: ['laws_collective', 'luvonpurpose_aws'],
    deadlineInfo: 'Rolling applications accepted throughout the year',
    requiredDocuments: ['SF-424', 'Environmental Review', 'Civil Rights Compliance']
  },
  federal_sba: {
    id: 'federal_sba',
    name: 'SBA Community Advantage Loan',
    organization: 'Small Business Administration',
    description: 'Provides capital to small businesses in underserved markets',
    sections: ['Business Plan', 'Financial Projections', 'Management Team', 'Use of Funds'],
    maxFunding: 250000,
    eligibleEntities: ['laws_collective', 'luvonpurpose_aws', 'real_eye_nation'],
    deadlineInfo: 'Applications accepted year-round through approved lenders',
    requiredDocuments: ['Business Plan', 'Tax Returns', 'Financial Statements', 'Collateral Documentation']
  },
  foundation_ford: {
    id: 'foundation_ford',
    name: 'Ford Foundation Grant',
    organization: 'Ford Foundation',
    description: 'Supports organizations working to reduce inequality and injustice',
    sections: ['Letter of Inquiry', 'Organizational Overview', 'Project Description', 'Theory of Change', 'Budget'],
    maxFunding: 5000000,
    eligibleEntities: ['laws_collective', '508_academy', 'luvonpurpose_aws'],
    deadlineInfo: 'By invitation after Letter of Inquiry approval',
    requiredDocuments: ['501(c)(3) or 508(c)(1)(a) Determination', 'Annual Report', 'Audited Financials']
  },
  foundation_kellogg: {
    id: 'foundation_kellogg',
    name: 'W.K. Kellogg Foundation Grant',
    organization: 'W.K. Kellogg Foundation',
    description: 'Supports thriving children, working families, and equitable communities',
    sections: ['Online Application', 'Organizational Capacity', 'Project Goals', 'Evaluation Plan', 'Budget'],
    maxFunding: 3000000,
    eligibleEntities: ['508_academy', 'laws_collective'],
    deadlineInfo: 'Online applications accepted on rolling basis',
    requiredDocuments: ['Tax Exemption Letter', 'Board List', 'Organizational Budget', 'Logic Model']
  },
  foundation_macarthur: {
    id: 'foundation_macarthur',
    name: 'MacArthur Foundation Grant',
    organization: 'MacArthur Foundation',
    description: 'Supports creative people, effective institutions, and influential networks',
    sections: ['Concept Paper', 'Full Proposal', 'Organizational Information', 'Budget Narrative'],
    maxFunding: 10000000,
    eligibleEntities: ['luvonpurpose_aws', 'laws_collective', '508_academy'],
    deadlineInfo: 'By invitation only after concept paper review',
    requiredDocuments: ['Concept Paper', 'Organizational Chart', 'Key Staff Bios', 'Financial Audit']
  },
  generic: {
    id: 'generic',
    name: 'Generic Grant Application',
    organization: 'Various Funders',
    description: 'Standard grant application template adaptable to various funders',
    sections: ['Cover Letter', 'Executive Summary', 'Need Statement', 'Project Description', 'Budget', 'Organizational Background'],
    maxFunding: 1000000,
    eligibleEntities: ['real_eye_nation', 'laws_collective', 'luvonpurpose_aws', '508_academy'],
    deadlineInfo: 'Varies by funder',
    requiredDocuments: ['Tax Exemption Letter', 'Board List', 'Budget', 'Organizational Chart']
  }
};

// Entity information database
const entityInfo: Record<EntityType, {
  legalName: string;
  ein: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxStatus: string;
  missionStatement: string;
}> = {
  real_eye_nation: {
    legalName: 'Real-Eye-Nation LLC',
    ein: '88-1234567',
    address: '123 Media Way, Atlanta, GA 30301',
    phone: '(404) 555-0101',
    email: 'grants@realeyenation.com',
    website: 'www.realeyenation.com',
    taxStatus: 'LLC (Single-Member)',
    missionStatement: 'Documenting truth and preserving cultural narratives through authentic media production'
  },
  laws_collective: {
    legalName: 'The L.A.W.S. Collective, LLC',
    ein: '88-2345678',
    address: '456 Community Blvd, Birmingham, AL 35203',
    phone: '(205) 555-0202',
    email: 'grants@lawscollective.org',
    website: 'www.lawscollective.org',
    taxStatus: 'LLC (Multi-Member)',
    missionStatement: 'Building multi-generational wealth through community-centered entrepreneurship and self-employment pathways'
  },
  luvonpurpose_aws: {
    legalName: 'LuvOnPurpose Autonomous Wealth System, LLC',
    ein: '88-3456789',
    address: '789 Innovation Drive, Memphis, TN 38103',
    phone: '(901) 555-0303',
    email: 'grants@luvonpurpose.com',
    website: 'www.luvonpurpose.com',
    taxStatus: 'LLC (Single-Member)',
    missionStatement: 'Providing autonomous wealth-building technology and financial literacy infrastructure for underserved communities'
  },
  '508_academy': {
    legalName: '508-LuvOnPurpose Academy',
    ein: '88-4567890',
    address: '321 Education Lane, Atlanta, GA 30302',
    phone: '(404) 555-0404',
    email: 'grants@luvonpurposeacademy.org',
    website: 'www.luvonpurposeacademy.org',
    taxStatus: '508(c)(1)(a) Religious/Educational Organization',
    missionStatement: 'Providing faith-based education and workforce development from K-12 through trade certifications'
  }
};

/**
 * Get all available grant templates
 */
export function getGrantTemplates(): GrantTemplate[] {
  return Object.values(grantTemplates);
}

/**
 * Get templates eligible for a specific entity
 */
export function getTemplatesForEntity(entityType: EntityType): GrantTemplate[] {
  return Object.values(grantTemplates).filter(t => 
    t.eligibleEntities.includes(entityType)
  );
}

/**
 * Get a specific grant template
 */
export function getGrantTemplate(templateType: GrantTemplateType): GrantTemplate | null {
  return grantTemplates[templateType] || null;
}

/**
 * Get entity information
 */
export function getEntityInfo(entityType: EntityType) {
  return entityInfo[entityType] || null;
}

/**
 * Generate a cover letter for the grant application
 */
export function generateCoverLetter(data: GrantApplicationData): string {
  const template = grantTemplates[data.templateType];
  const entity = entityInfo[data.entityType];
  
  return `${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${template.organization}
Grant Programs Office

RE: ${template.name} Application - ${data.projectTitle}

Dear Grant Review Committee,

On behalf of ${data.organizationName}, I am pleased to submit this application for the ${template.name} in the amount of $${data.requestedAmount.toLocaleString()}.

${entity.missionStatement}. This project, "${data.projectTitle}," directly advances our mission by ${data.projectSummary || 'creating meaningful impact in our community'}.

Our organization has demonstrated a strong track record of successful program delivery and fiscal responsibility. We are confident that this investment will generate significant returns for the communities we serve.

We welcome the opportunity to discuss this proposal further and provide any additional information you may require.

Respectfully submitted,

${data.applicantName}
${data.applicantTitle}
${data.organizationName}
${data.organizationPhone}
${data.organizationEmail}`;
}

/**
 * Generate budget narrative from budget items
 */
export function generateBudgetNarrative(budgetItems: BudgetItem[]): string {
  const total = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  
  const categoryTotals: Record<string, number> = {};
  budgetItems.forEach(item => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
  });
  
  let narrative = `BUDGET NARRATIVE\n\nTotal Project Budget: $${total.toLocaleString()}\n\n`;
  narrative += `BUDGET SUMMARY BY CATEGORY\n${'='.repeat(50)}\n\n`;
  
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    const percentage = ((amount / total) * 100).toFixed(1);
    narrative += `${category}: $${amount.toLocaleString()} (${percentage}%)\n`;
  });
  
  narrative += `\n\nDETAILED LINE ITEMS\n${'='.repeat(50)}\n\n`;
  
  budgetItems.forEach((item, index) => {
    narrative += `${index + 1}. ${item.description}\n`;
    narrative += `   Category: ${item.category}\n`;
    narrative += `   Amount: $${item.amount.toLocaleString()}\n`;
    narrative += `   Justification: ${item.justification}\n\n`;
  });
  
  return narrative;
}

/**
 * Generate budget table in markdown format
 */
export function generateBudgetTable(budgetItems: BudgetItem[]): string {
  const total = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  
  let table = `| Category | Description | Amount | % of Total |\n`;
  table += `|----------|-------------|--------|------------|\n`;
  
  budgetItems.forEach(item => {
    const percentage = ((item.amount / total) * 100).toFixed(1);
    table += `| ${item.category} | ${item.description} | $${item.amount.toLocaleString()} | ${percentage}% |\n`;
  });
  
  table += `| **TOTAL** | | **$${total.toLocaleString()}** | **100%** |\n`;
  
  return table;
}

/**
 * Generate organizational background section
 */
export function generateOrganizationalBackground(entityType: EntityType): string {
  const entity = entityInfo[entityType];
  const needStatement = getNeedStatement(entityType);
  
  return `ORGANIZATIONAL BACKGROUND

Legal Name: ${entity.legalName}
Tax Status: ${entity.taxStatus}
EIN: ${entity.ein}

Address: ${entity.address}
Phone: ${entity.phone}
Email: ${entity.email}
Website: ${entity.website}

MISSION STATEMENT
${entity.missionStatement}

ORGANIZATIONAL HISTORY AND CAPACITY
${needStatement?.proofOfConcept || 'Our organization has a proven track record of successful program delivery and community impact.'}

KEY ACCOMPLISHMENTS
${needStatement?.targetPopulation ? `We serve ${needStatement.targetPopulation}, providing essential services and support.` : 'We have successfully served our target population through innovative programming.'}`;
}

/**
 * Generate complete grant application
 */
export function generateGrantApplication(data: GrantApplicationData): GeneratedApplication {
  const template = grantTemplates[data.templateType];
  const needStatement = getNeedStatement(data.entityType);
  const entity = entityInfo[data.entityType];
  
  const sections: ApplicationSection[] = [];
  let order = 1;
  
  // Cover Letter
  sections.push({
    title: 'Cover Letter',
    content: generateCoverLetter(data),
    order: order++
  });
  
  // Executive Summary
  sections.push({
    title: 'Executive Summary',
    content: `PROJECT: ${data.projectTitle}
ORGANIZATION: ${data.organizationName}
AMOUNT REQUESTED: $${data.requestedAmount.toLocaleString()}
PROJECT PERIOD: ${data.projectStartDate} to ${data.projectEndDate}

${data.projectSummary || needStatement?.summary || 'This project will create meaningful impact in our community through innovative programming and sustainable practices.'}`,
    order: order++
  });
  
  // Need Statement
  sections.push({
    title: 'Statement of Need',
    content: data.customNeedStatement || needStatement?.fullStatement || 'A detailed need statement demonstrating the critical importance of this project.',
    order: order++
  });
  
  // Project Description
  sections.push({
    title: 'Project Description',
    content: `PROJECT GOALS AND OBJECTIVES

${needStatement?.fundingRequest || `This project seeks $${data.requestedAmount.toLocaleString()} to implement transformative programming.`}

METHODOLOGY AND APPROACH

Our approach combines evidence-based practices with community-centered design to ensure maximum impact and sustainability.

TIMELINE

Start Date: ${data.projectStartDate}
End Date: ${data.projectEndDate}

KEY MILESTONES
- Month 1-3: Planning and infrastructure development
- Month 4-6: Program launch and initial implementation
- Month 7-9: Expansion and community engagement
- Month 10-12: Evaluation and sustainability planning`,
    order: order++
  });
  
  // Organizational Background
  sections.push({
    title: 'Organizational Background',
    content: generateOrganizationalBackground(data.entityType),
    order: order++
  });
  
  // Budget
  const budgetContent = data.budgetItems.length > 0 
    ? generateBudgetNarrative(data.budgetItems)
    : generateDefaultBudget(data.requestedAmount, data.entityType);
  
  sections.push({
    title: 'Budget',
    content: budgetContent,
    order: order++
  });
  
  // Evaluation Plan
  sections.push({
    title: 'Evaluation Plan',
    content: `EVALUATION METHODOLOGY

We will employ a mixed-methods evaluation approach combining quantitative metrics with qualitative assessments.

KEY PERFORMANCE INDICATORS
- Number of participants served
- Program completion rates
- Participant satisfaction scores
- Long-term outcome tracking (6-month and 12-month follow-up)

DATA COLLECTION METHODS
- Pre/post assessments
- Participant surveys
- Focus groups
- Administrative data tracking

REPORTING
Quarterly progress reports will be submitted to the funder, with a comprehensive final report upon project completion.`,
    order: order++
  });
  
  // Sustainability Plan
  sections.push({
    title: 'Sustainability Plan',
    content: `LONG-TERM SUSTAINABILITY

This project is designed for long-term sustainability through:

1. DIVERSIFIED FUNDING
   - Earned revenue from program fees
   - Corporate partnerships
   - Individual donor cultivation
   - Government contracts

2. ORGANIZATIONAL CAPACITY
   - Staff training and development
   - Systems and infrastructure investment
   - Community partnership development

3. PROGRAM INTEGRATION
   - Integration with existing organizational programs
   - Community ownership and engagement
   - Scalable program model`,
    order: order++
  });
  
  return {
    id: `grant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    entityType: data.entityType,
    templateType: data.templateType,
    generatedAt: Date.now(),
    sections,
    totalBudget: data.budgetItems.reduce((sum, item) => sum + item.amount, 0) || data.requestedAmount,
    metadata: {
      organizationName: data.organizationName || entity.legalName,
      projectTitle: data.projectTitle,
      requestedAmount: data.requestedAmount,
      templateName: template.name
    }
  };
}

/**
 * Generate default budget based on entity type and amount
 */
function generateDefaultBudget(amount: number, entityType: EntityType): string {
  const budgetItems: BudgetItem[] = [];
  
  switch (entityType) {
    case 'real_eye_nation':
      budgetItems.push(
        { category: 'Personnel', description: 'Production Staff', amount: Math.round(amount * 0.35), justification: 'Director, cinematographer, editor, and production assistants' },
        { category: 'Equipment', description: 'Production Equipment', amount: Math.round(amount * 0.25), justification: 'Cameras, lighting, audio equipment, and editing systems' },
        { category: 'Production', description: 'Production Costs', amount: Math.round(amount * 0.20), justification: 'Location fees, travel, materials, and post-production' },
        { category: 'Distribution', description: 'Distribution & Marketing', amount: Math.round(amount * 0.12), justification: 'Film festival submissions, marketing, and distribution' },
        { category: 'Admin', description: 'Administrative Overhead', amount: Math.round(amount * 0.08), justification: 'Insurance, legal, accounting, and office expenses' }
      );
      break;
    case 'laws_collective':
      budgetItems.push(
        { category: 'Personnel', description: 'Program Staff', amount: Math.round(amount * 0.40), justification: 'Program managers, trainers, and support staff' },
        { category: 'Technology', description: 'Platform Development', amount: Math.round(amount * 0.25), justification: 'SaaS platform development and maintenance' },
        { category: 'Facilities', description: 'Hub Operations', amount: Math.round(amount * 0.18), justification: 'Regional hub facilities and equipment' },
        { category: 'Programs', description: 'Training Programs', amount: Math.round(amount * 0.10), justification: 'Curriculum development and training materials' },
        { category: 'Admin', description: 'Administrative Overhead', amount: Math.round(amount * 0.07), justification: 'Insurance, legal, accounting, and office expenses' }
      );
      break;
    case 'luvonpurpose_aws':
      budgetItems.push(
        { category: 'Technology', description: 'Platform Infrastructure', amount: Math.round(amount * 0.35), justification: 'Cloud infrastructure, security, and development' },
        { category: 'Personnel', description: 'Development Team', amount: Math.round(amount * 0.30), justification: 'Software engineers, designers, and product managers' },
        { category: 'Programs', description: 'Financial Literacy Programs', amount: Math.round(amount * 0.18), justification: 'Curriculum development and community outreach' },
        { category: 'Marketing', description: 'Community Engagement', amount: Math.round(amount * 0.10), justification: 'Marketing, partnerships, and user acquisition' },
        { category: 'Admin', description: 'Administrative Overhead', amount: Math.round(amount * 0.07), justification: 'Insurance, legal, accounting, and office expenses' }
      );
      break;
    case '508_academy':
      budgetItems.push(
        { category: 'Personnel', description: 'Educational Staff', amount: Math.round(amount * 0.45), justification: 'Teachers, administrators, and support staff' },
        { category: 'Facilities', description: 'Facility Operations', amount: Math.round(amount * 0.20), justification: 'Facility maintenance, utilities, and equipment' },
        { category: 'Programs', description: 'Curriculum & Materials', amount: Math.round(amount * 0.18), justification: 'Curriculum development, textbooks, and supplies' },
        { category: 'Technology', description: 'Educational Technology', amount: Math.round(amount * 0.10), justification: 'Computers, software, and learning management systems' },
        { category: 'Admin', description: 'Administrative Overhead', amount: Math.round(amount * 0.07), justification: 'Insurance, legal, accounting, and office expenses' }
      );
      break;
  }
  
  return generateBudgetNarrative(budgetItems);
}

/**
 * Export application to markdown format
 */
export function exportToMarkdown(application: GeneratedApplication): string {
  let markdown = `# Grant Application: ${application.metadata.projectTitle}\n\n`;
  markdown += `**Organization:** ${application.metadata.organizationName}\n`;
  markdown += `**Template:** ${application.metadata.templateName}\n`;
  markdown += `**Amount Requested:** $${application.metadata.requestedAmount.toLocaleString()}\n`;
  markdown += `**Generated:** ${new Date(application.generatedAt).toLocaleDateString()}\n\n`;
  markdown += `---\n\n`;
  
  application.sections.forEach(section => {
    markdown += `## ${section.title}\n\n`;
    markdown += `${section.content}\n\n`;
    markdown += `---\n\n`;
  });
  
  return markdown;
}

/**
 * Export application to JSON format
 */
export function exportToJSON(application: GeneratedApplication): string {
  return JSON.stringify(application, null, 2);
}

/**
 * Get application checklist for a template
 */
export function getApplicationChecklist(templateType: GrantTemplateType): {
  item: string;
  required: boolean;
  description: string;
}[] {
  const template = grantTemplates[templateType];
  
  const checklist = [
    { item: 'Cover Letter', required: true, description: 'Signed letter from authorized representative' },
    { item: 'Executive Summary', required: true, description: 'One-page project overview' },
    { item: 'Need Statement', required: true, description: 'Documentation of community need' },
    { item: 'Project Description', required: true, description: 'Detailed project plan with timeline' },
    { item: 'Budget', required: true, description: 'Detailed line-item budget with narrative' },
    { item: 'Organizational Background', required: true, description: 'History and capacity documentation' }
  ];
  
  template.requiredDocuments.forEach(doc => {
    checklist.push({
      item: doc,
      required: true,
      description: `Required supporting document: ${doc}`
    });
  });
  
  return checklist;
}
