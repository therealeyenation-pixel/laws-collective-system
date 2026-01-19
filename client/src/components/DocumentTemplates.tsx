import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  FileText,
  Users,
  Download,
  Eye,
  Copy,
  DollarSign,
  Building2,
  Heart,
  Briefcase,
  Scale,
  ClipboardList,
  CheckCircle2,
  Globe,
  Landmark,
  Banknote,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: "financial" | "organizational" | "narrative" | "legal" | "international";
  format: "xlsx" | "docx" | "pdf";
  icon: React.ReactNode;
  fields?: string[];
  preview?: string;
}

const templates: Template[] = [
  {
    id: "budget-template",
    name: "Grant Budget Template",
    description: "Comprehensive budget spreadsheet for grant applications with personnel, supplies, equipment, and indirect costs sections.",
    category: "financial",
    format: "xlsx",
    icon: <FileSpreadsheet className="w-6 h-6" />,
    fields: ["Personnel", "Fringe Benefits", "Travel", "Equipment", "Supplies", "Contractual", "Other", "Indirect Costs"],
  },
  {
    id: "budget-narrative",
    name: "Budget Narrative Template",
    description: "Detailed justification for each budget line item explaining necessity and cost calculations.",
    category: "financial",
    format: "docx",
    icon: <DollarSign className="w-6 h-6" />,
    fields: ["Line Item", "Amount", "Justification", "Calculation Method"],
  },
  {
    id: "org-chart",
    name: "Organizational Chart Template",
    description: "Visual hierarchy showing organizational structure, key personnel, and reporting relationships.",
    category: "organizational",
    format: "docx",
    icon: <Users className="w-6 h-6" />,
    fields: ["Executive Director", "Board of Directors", "Program Staff", "Administrative Staff"],
  },
  {
    id: "letter-of-support",
    name: "Letter of Support Template",
    description: "Template for partner organizations to express commitment and support for your project.",
    category: "narrative",
    format: "docx",
    icon: <Heart className="w-6 h-6" />,
    fields: ["Partner Name", "Relationship", "Commitment", "Contact Information"],
  },
  {
    id: "project-narrative",
    name: "Project Narrative Template",
    description: "Structured template for describing project goals, methods, timeline, and expected outcomes.",
    category: "narrative",
    format: "docx",
    icon: <FileText className="w-6 h-6" />,
    fields: ["Problem Statement", "Goals & Objectives", "Methods", "Timeline", "Evaluation Plan", "Sustainability"],
  },
  {
    id: "board-resolution",
    name: "Board Resolution Template",
    description: "Official board authorization document for grant applications and organizational commitments.",
    category: "legal",
    format: "docx",
    icon: <Scale className="w-6 h-6" />,
    fields: ["Resolution Number", "Date", "Purpose", "Authorization", "Signatures"],
  },
  {
    id: "logic-model",
    name: "Logic Model Template",
    description: "Visual framework showing inputs, activities, outputs, outcomes, and impact of your program.",
    category: "organizational",
    format: "xlsx",
    icon: <ClipboardList className="w-6 h-6" />,
    fields: ["Inputs", "Activities", "Outputs", "Short-term Outcomes", "Long-term Outcomes", "Impact"],
  },
  {
    id: "staff-qualifications",
    name: "Staff Qualifications Template",
    description: "Summary of key personnel qualifications, experience, and roles in the proposed project.",
    category: "organizational",
    format: "docx",
    icon: <Briefcase className="w-6 h-6" />,
    fields: ["Name", "Title", "Qualifications", "Experience", "Role in Project", "% Time Committed"],
  },
  {
    id: "mou-template",
    name: "Memorandum of Understanding",
    description: "Agreement template between partnering organizations outlining roles, responsibilities, and commitments.",
    category: "legal",
    format: "docx",
    icon: <Building2 className="w-6 h-6" />,
    fields: ["Parties", "Purpose", "Roles & Responsibilities", "Duration", "Signatures"],
  },
  // International Templates
  {
    id: "intl-mou",
    name: "International Partnership MOU",
    description: "Memorandum of Understanding template for cross-border partnerships with foreign organizations, including jurisdiction and governing law provisions.",
    category: "international",
    format: "docx",
    icon: <Globe className="w-6 h-6" />,
    fields: ["Parties", "Countries/Jurisdictions", "Purpose", "Governing Law", "Dispute Resolution", "Currency", "Duration", "Signatures"],
  },
  {
    id: "intl-budget",
    name: "Multi-Currency Budget Template",
    description: "International grant budget with multi-currency support, exchange rate calculations, and country-specific cost categories.",
    category: "international",
    format: "xlsx",
    icon: <Banknote className="w-6 h-6" />,
    fields: ["Local Currency", "USD Equivalent", "Exchange Rate", "Personnel (Local)", "Personnel (International)", "Cross-Border Travel", "International Communications"],
  },
  {
    id: "intl-compliance",
    name: "International Compliance Checklist",
    description: "Compliance documentation for international operations including OFAC screening, anti-corruption certifications, and foreign registration requirements.",
    category: "international",
    format: "docx",
    icon: <Landmark className="w-6 h-6" />,
    fields: ["OFAC Compliance", "FCPA Certification", "Anti-Money Laundering", "Foreign Registration", "Tax Treaty Status", "Work Permits"],
  },
  {
    id: "intl-narrative",
    name: "Global Impact Narrative Template",
    description: "Project narrative template designed for international funders (UN, World Bank, foundations) with global impact metrics and cross-cultural considerations.",
    category: "international",
    format: "docx",
    icon: <Globe className="w-6 h-6" />,
    fields: ["Global Problem Statement", "Target Countries", "Local Partners", "Cultural Adaptation", "Sustainability Across Borders", "Replication Model"],
  },
  {
    id: "intl-partner-agreement",
    name: "Foreign Partner Sub-Award Agreement",
    description: "Sub-award agreement template for passing grant funds to foreign partner organizations with compliance and reporting requirements.",
    category: "international",
    format: "docx",
    icon: <Building2 className="w-6 h-6" />,
    fields: ["Prime Recipient", "Sub-Recipient", "Award Amount", "Currency", "Reporting Requirements", "Audit Requirements", "Termination Clauses"],
  },
];

const categoryColors: Record<string, string> = {
  financial: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  organizational: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  narrative: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  legal: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  international: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
};

const formatIcons: Record<string, string> = {
  xlsx: "📊",
  docx: "📄",
  pdf: "📑",
};

// Entity data for customization
const entities = [
  { id: "laws", name: "L.A.W.S. Collective, LLC", ein: "XX-XXXXXXX" },
  { id: "508", name: "LuvOnPurpose 508 Trust", ein: "XX-XXXXXXX" },
  { id: "real-eye", name: "Real-Eye Productions, LLC", ein: "XX-XXXXXXX" },
  { id: "lop-inc", name: "LuvOnPurpose Inc.", ein: "XX-XXXXXXX" },
  { id: "lop-llc", name: "LuvOnPurpose, LLC", ein: "XX-XXXXXXX" },
];

export default function DocumentTemplates() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [customizeTemplate, setCustomizeTemplate] = useState<Template | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const generateBudgetTemplate = (entityName: string) => {
    // Generate CSV content for budget template
    const headers = ["Category", "Description", "Quantity", "Unit Cost", "Total Cost", "Notes"];
    const rows = [
      ["PERSONNEL", "", "", "", "", ""],
      ["Project Director", "0.5 FTE x 12 months", "1", "$60,000", "$30,000", "Lead project implementation"],
      ["Program Coordinator", "1.0 FTE x 12 months", "1", "$45,000", "$45,000", "Day-to-day operations"],
      ["Administrative Assistant", "0.25 FTE x 12 months", "1", "$35,000", "$8,750", "Administrative support"],
      ["Personnel Subtotal", "", "", "", "$83,750", ""],
      ["", "", "", "", "", ""],
      ["FRINGE BENEFITS", "", "", "", "", ""],
      ["Benefits (30% of salaries)", "", "", "", "$25,125", "Health, retirement, FICA"],
      ["Fringe Subtotal", "", "", "", "$25,125", ""],
      ["", "", "", "", "", ""],
      ["TRAVEL", "", "", "", "", ""],
      ["Local Travel", "Mileage for site visits", "500", "$0.67/mile", "$335", ""],
      ["Conference Travel", "Annual conference attendance", "2", "$1,500", "$3,000", ""],
      ["Travel Subtotal", "", "", "", "$3,335", ""],
      ["", "", "", "", "", ""],
      ["EQUIPMENT", "", "", "", "", ""],
      ["Computers", "Laptops for staff", "2", "$1,200", "$2,400", ""],
      ["Equipment Subtotal", "", "", "", "$2,400", ""],
      ["", "", "", "", "", ""],
      ["SUPPLIES", "", "", "", "", ""],
      ["Office Supplies", "General office materials", "12", "$100/month", "$1,200", ""],
      ["Program Supplies", "Materials for participants", "1", "$2,000", "$2,000", ""],
      ["Supplies Subtotal", "", "", "", "$3,200", ""],
      ["", "", "", "", "", ""],
      ["CONTRACTUAL", "", "", "", "", ""],
      ["Evaluation Consultant", "External evaluator", "1", "$5,000", "$5,000", ""],
      ["Contractual Subtotal", "", "", "", "$5,000", ""],
      ["", "", "", "", "", ""],
      ["OTHER", "", "", "", "", ""],
      ["Printing", "Reports and materials", "1", "$500", "$500", ""],
      ["Communications", "Phone and internet", "12", "$150/month", "$1,800", ""],
      ["Other Subtotal", "", "", "", "$2,300", ""],
      ["", "", "", "", "", ""],
      ["INDIRECT COSTS", "", "", "", "", ""],
      ["Indirect (10% MTDC)", "", "", "", "$12,511", "Modified Total Direct Costs"],
      ["Indirect Subtotal", "", "", "", "$12,511", ""],
      ["", "", "", "", "", ""],
      ["TOTAL PROJECT COST", "", "", "", "$137,621", ""],
    ];

    let csv = `${entityName} - Grant Budget Template\n\n`;
    csv += headers.join(",") + "\n";
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    return csv;
  };

  const generateLetterOfSupport = (entityName: string, projectName: string) => {
    const today = new Date().toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });

    return `LETTER OF SUPPORT

${today}

[Funder Name]
[Funder Address]
[City, State ZIP]

RE: Letter of Support for ${entityName} - ${projectName || "[Project Name]"}

Dear [Funder Representative],

I am writing to express [Organization Name]'s strong support for ${entityName}'s application for [Grant Name]. We have been a partner of ${entityName} for [duration] and have witnessed firsthand their commitment to [mission/community served].

PARTNERSHIP DESCRIPTION:
Our organizations have collaborated on [describe partnership activities]. Through this partnership, we have [describe outcomes/impact].

COMMITMENT:
In support of this project, [Organization Name] commits to:
• [Specific commitment 1]
• [Specific commitment 2]
• [Specific commitment 3]

We believe this project will [describe expected impact] and are confident in ${entityName}'s ability to successfully implement the proposed activities.

Please do not hesitate to contact me if you have any questions about our partnership or this letter of support.

Sincerely,

_______________________________
[Name]
[Title]
[Organization]
[Phone]
[Email]
`;
  };

  const generateBoardResolution = (entityName: string, projectName: string) => {
    const today = new Date().toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });

    return `BOARD RESOLUTION

${entityName}
RESOLUTION OF THE BOARD OF DIRECTORS

Resolution No.: [YYYY-XXX]
Date Adopted: ${today}

RESOLUTION AUTHORIZING GRANT APPLICATION

WHEREAS, ${entityName} (the "Organization") seeks to [describe project purpose]; and

WHEREAS, [Funder Name] has announced funding opportunities for [program area]; and

WHEREAS, the Organization's mission aligns with the goals of this funding opportunity; and

WHEREAS, the Board of Directors has reviewed the proposed project and budget;

NOW, THEREFORE, BE IT RESOLVED, that the Board of Directors of ${entityName} hereby:

1. AUTHORIZES the submission of a grant application to [Funder Name] for the ${projectName || "[Project Name]"} project;

2. AUTHORIZES [Executive Director Name], Executive Director, to sign and submit all documents related to this grant application;

3. COMMITS to providing any required matching funds or in-kind contributions as specified in the grant application;

4. AGREES to comply with all terms and conditions of the grant if awarded.

CERTIFICATION

I, the undersigned, Secretary of ${entityName}, do hereby certify that:

1. The foregoing is a true and correct copy of a resolution duly adopted by the Board of Directors at a meeting held on ${today}, at which a quorum was present and voting.

2. This resolution has not been modified, rescinded, or revoked and is in full force and effect.

IN WITNESS WHEREOF, I have executed this certification on ${today}.


_______________________________
[Secretary Name]
Secretary, Board of Directors
${entityName}


BOARD MEMBERS PRESENT:

_______________________________     _______________________________
[Board Member 1]                    [Board Member 2]

_______________________________     _______________________________
[Board Member 3]                    [Board Member 4]
`;
  };

  const generateProjectNarrative = (entityName: string, projectName: string) => {
    return `PROJECT NARRATIVE

${entityName}
${projectName || "[Project Name]"}

================================================================================
SECTION 1: ORGANIZATIONAL BACKGROUND
================================================================================

[Organization Name] is a [type of organization] established in [year] with the mission to [mission statement]. Since our founding, we have [describe key accomplishments and experience relevant to the proposed project].

Our organization is uniquely positioned to implement this project because:
• [Qualification 1]
• [Qualification 2]
• [Qualification 3]

================================================================================
SECTION 2: STATEMENT OF NEED
================================================================================

[Describe the problem or need your project addresses. Include:]
• Data and statistics demonstrating the need
• Geographic and demographic information about the target population
• Root causes of the problem
• Gaps in current services

================================================================================
SECTION 3: PROJECT GOALS AND OBJECTIVES
================================================================================

GOAL 1: [Broad goal statement]
  Objective 1.1: [Specific, measurable objective]
  Objective 1.2: [Specific, measurable objective]

GOAL 2: [Broad goal statement]
  Objective 2.1: [Specific, measurable objective]
  Objective 2.2: [Specific, measurable objective]

================================================================================
SECTION 4: PROJECT DESIGN AND METHODS
================================================================================

[Describe your approach, including:]
• Key activities and how they address the identified need
• Evidence-based practices or models being used
• Timeline for implementation
• Roles of key personnel

================================================================================
SECTION 5: EVALUATION PLAN
================================================================================

[Describe how you will measure success:]
• Process evaluation methods
• Outcome evaluation methods
• Data collection tools and frequency
• How data will be used for program improvement

================================================================================
SECTION 6: SUSTAINABILITY PLAN
================================================================================

[Describe how the project will continue after grant funding ends:]
• Plans for diversifying funding
• Partnerships that will continue
• Organizational capacity building
• Integration into ongoing operations

================================================================================
SECTION 7: TIMELINE
================================================================================

Month 1-3:    [Planning and startup activities]
Month 4-6:    [Implementation activities]
Month 7-9:    [Continuation and expansion]
Month 10-12:  [Evaluation and reporting]

================================================================================
`;
  };

  const generateOrgChart = (entityName: string) => {
    return `ORGANIZATIONAL CHART

${entityName}

================================================================================
                              BOARD OF DIRECTORS
================================================================================
                                     |
                    -----------------+------------------
                    |                |                 |
              Board Chair      Vice Chair          Treasurer
              [Name]           [Name]              [Name]
                    |                |                 |
                    -----------------+------------------
                                     |
================================================================================
                              EXECUTIVE DIRECTOR
                                  [Name]
================================================================================
                                     |
            -------------------------+-------------------------
            |                        |                        |
================================================================================
    PROGRAM DIRECTOR          FINANCE DIRECTOR         DEVELOPMENT DIRECTOR
        [Name]                    [Name]                    [Name]
================================================================================
            |                        |                        |
    --------+--------        --------+--------        --------+--------
    |               |        |               |        |               |
Program         Program   Accountant    Admin      Grants        Communications
Coordinator     Staff       [Name]     Assistant   Manager         Coordinator
  [Name]        [Name]                  [Name]     [Name]            [Name]


================================================================================
KEY PERSONNEL FOR PROPOSED PROJECT
================================================================================

Position: [Title]
Name: [Name]
Qualifications: [Brief summary]
Role in Project: [Description]
% Time Committed: [XX%]

Position: [Title]
Name: [Name]
Qualifications: [Brief summary]
Role in Project: [Description]
% Time Committed: [XX%]

================================================================================
`;
  };

  const generateLogicModel = (entityName: string, projectName: string) => {
    const headers = ["INPUTS", "ACTIVITIES", "OUTPUTS", "SHORT-TERM OUTCOMES", "LONG-TERM OUTCOMES", "IMPACT"];
    const rows = [
      ["Staff time", "Outreach and recruitment", "# participants recruited", "Increased knowledge", "Behavior change", "Community transformation"],
      ["Funding", "Training sessions", "# trainings conducted", "Improved skills", "Sustained practice", "Systemic change"],
      ["Facilities", "Support services", "# services provided", "Changed attitudes", "Policy changes", "Population-level impact"],
      ["Equipment", "Partnership meetings", "# partnerships formed", "Increased access", "Environmental changes", ""],
      ["Curriculum", "Data collection", "# assessments completed", "Improved connections", "", ""],
      ["Partners", "Evaluation activities", "# reports produced", "", "", ""],
    ];

    let csv = `${entityName} - Logic Model\n`;
    csv += `Project: ${projectName || "[Project Name]"}\n\n`;
    csv += headers.join(",") + "\n";
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    return csv;
  };

  // International Template Generators
  const generateInternationalMOU = (entityName: string, projectName: string) => {
    const today = new Date().toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });

    return `MEMORANDUM OF UNDERSTANDING
FOR INTERNATIONAL PARTNERSHIP

================================================================================
Date: ${today}
================================================================================

PARTIES:

Party A (U.S. Organization):
${entityName}
[Address]
[City, State ZIP, USA]
EIN: [XX-XXXXXXX]

Party B (Foreign Partner):
[Foreign Organization Name]
[Address]
[City, Country]
Registration Number: [XXXXXX]

================================================================================
PURPOSE
================================================================================

This Memorandum of Understanding ("MOU") establishes a framework for cooperation
between the Parties for the purpose of:

${projectName || "[Describe the purpose of the partnership]"}

================================================================================
SCOPE OF COOPERATION
================================================================================

The Parties agree to collaborate on the following activities:

1. [Activity 1]
2. [Activity 2]
3. [Activity 3]

================================================================================
ROLES AND RESPONSIBILITIES
================================================================================

Party A (${entityName}) shall:
• [Responsibility 1]
• [Responsibility 2]
• [Responsibility 3]

Party B shall:
• [Responsibility 1]
• [Responsibility 2]
• [Responsibility 3]

================================================================================
FINANCIAL ARRANGEMENTS
================================================================================

Currency: [USD / Local Currency / Both]
Exchange Rate Reference: [Source, e.g., OANDA, XE]
Payment Terms: [Net 30 / Upon milestone completion]
Payment Method: [Wire transfer / Other]

================================================================================
GOVERNING LAW AND DISPUTE RESOLUTION
================================================================================

This MOU shall be governed by and construed in accordance with the laws of
[Jurisdiction, e.g., State of Georgia, USA].

Any disputes arising from this MOU shall be resolved through:
1. Good faith negotiation between the Parties
2. Mediation by a mutually agreed mediator
3. Binding arbitration under [AAA / ICC / Other] rules

================================================================================
TERM AND TERMINATION
================================================================================

Effective Date: [Date]
Initial Term: [X] years
Renewal: Automatic renewal for successive [1-year] terms unless terminated
Termination Notice: [90] days written notice

================================================================================
CONFIDENTIALITY
================================================================================

Both Parties agree to maintain the confidentiality of any proprietary information
shared during the course of this partnership.

================================================================================
SIGNATURES
================================================================================

For ${entityName}:

_______________________________     Date: _______________
[Name]
[Title]


For [Foreign Partner]:

_______________________________     Date: _______________
[Name]
[Title]

================================================================================
`;
  };

  const generateMultiCurrencyBudget = (entityName: string) => {
    const headers = ["Category", "Description", "Local Currency", "Amount (Local)", "Exchange Rate", "USD Equivalent", "Notes"];
    const rows = [
      ["PERSONNEL - U.S. BASED", "", "USD", "", "1.00", "", ""],
      ["Project Director", "0.5 FTE x 12 months", "USD", "$30,000", "1.00", "$30,000", "U.S. based staff"],
      ["Program Coordinator", "1.0 FTE x 12 months", "USD", "$45,000", "1.00", "$45,000", "U.S. based staff"],
      ["", "", "", "", "", "", ""],
      ["PERSONNEL - INTERNATIONAL", "", "", "", "", "", ""],
      ["Country Coordinator (Jamaica)", "1.0 FTE x 12 months", "JMD", "J$3,000,000", "0.0064", "$19,200", "Local hire - Jamaica"],
      ["Field Staff (Partner Country)", "2 x 0.5 FTE x 12 months", "[Currency]", "[Amount]", "[Rate]", "[USD]", "Local hires"],
      ["", "", "", "", "", "", ""],
      ["INTERNATIONAL TRAVEL", "", "", "", "", "", ""],
      ["U.S. to Partner Country", "4 trips x 2 staff", "USD", "$12,000", "1.00", "$12,000", "Airfare + per diem"],
      ["In-Country Travel", "Local transportation", "[Currency]", "[Amount]", "[Rate]", "$3,000", "Ground transport"],
      ["", "", "", "", "", "", ""],
      ["INTERNATIONAL COMMUNICATIONS", "", "", "", "", "", ""],
      ["International Phone/Internet", "12 months", "USD", "$2,400", "1.00", "$2,400", "Video conferencing, calls"],
      ["Translation Services", "Document translation", "USD", "$3,000", "1.00", "$3,000", "As needed"],
      ["", "", "", "", "", "", ""],
      ["CONTRACTUAL - INTERNATIONAL", "", "", "", "", "", ""],
      ["Foreign Partner Sub-Award", "Program implementation", "[Currency]", "[Amount]", "[Rate]", "$25,000", "Pass-through to partner"],
      ["Local Consultants", "Technical assistance", "[Currency]", "[Amount]", "[Rate]", "$10,000", "In-country expertise"],
      ["", "", "", "", "", "", ""],
      ["COMPLIANCE & LEGAL", "", "", "", "", "", ""],
      ["Foreign Registration Fees", "Country registration", "[Currency]", "[Amount]", "[Rate]", "$2,000", "If required"],
      ["International Audit", "Annual audit requirement", "USD", "$5,000", "1.00", "$5,000", "If required by funder"],
      ["", "", "", "", "", "", ""],
      ["CURRENCY CONTINGENCY", "5% for exchange rate fluctuation", "USD", "$8,000", "1.00", "$8,000", "Risk mitigation"],
      ["", "", "", "", "", "", ""],
      ["TOTAL PROJECT COST", "", "", "", "", "$219,600", ""],
    ];

    let csv = `${entityName} - Multi-Currency International Budget\n`;
    csv += `Exchange Rate Date: [Date rates were obtained]\n`;
    csv += `Exchange Rate Source: OANDA / XE / Federal Reserve\n\n`;
    csv += headers.join(",") + "\n";
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    return csv;
  };

  const generateInternationalCompliance = (entityName: string) => {
    return `INTERNATIONAL OPERATIONS COMPLIANCE CHECKLIST
${entityName}

================================================================================
OFAC COMPLIANCE (Office of Foreign Assets Control)
================================================================================

[ ] Verified all foreign partners/vendors are not on OFAC Specially Designated
    Nationals (SDN) List
[ ] Verified target countries are not under comprehensive U.S. sanctions
[ ] Documented OFAC screening process and results
[ ] Established ongoing monitoring procedures

Screening Date: _______________
Screened By: _______________
Results: _______________

================================================================================
FCPA COMPLIANCE (Foreign Corrupt Practices Act)
================================================================================

[ ] Anti-corruption policy in place
[ ] Foreign partners/agents have signed anti-corruption certification
[ ] Gift and entertainment policy established
[ ] Due diligence conducted on foreign partners
[ ] Training provided to staff working internationally

Certification Statement:
"${entityName} certifies that it has not and will not make any payments,
gifts, or transfers of value to foreign government officials for the purpose
of obtaining or retaining business or securing any improper advantage."

Authorized Signature: _______________________________
Date: _______________

================================================================================
ANTI-MONEY LAUNDERING (AML)
================================================================================

[ ] Know Your Customer (KYC) procedures for foreign partners
[ ] Verified banking relationships of foreign partners
[ ] Wire transfer documentation procedures in place
[ ] Suspicious activity reporting procedures established

================================================================================
FOREIGN REGISTRATION REQUIREMENTS
================================================================================

Country: _______________
[ ] Registration required: Yes / No
[ ] Registration completed: Yes / No / N/A
Registration Number: _______________
Expiration Date: _______________

Country: _______________
[ ] Registration required: Yes / No
[ ] Registration completed: Yes / No / N/A
Registration Number: _______________
Expiration Date: _______________

================================================================================
TAX TREATY STATUS
================================================================================

[ ] Verified tax treaty exists between U.S. and partner country
[ ] W-8BEN or W-8BEN-E collected from foreign contractors
[ ] Withholding requirements documented
[ ] Transfer pricing documentation (if applicable)

Partner Country: _______________
Treaty Status: _______________
Withholding Rate: _______________%

================================================================================
WORK PERMITS & VISAS
================================================================================

[ ] Identified staff requiring work permits in foreign countries
[ ] Work permit applications submitted/approved
[ ] Visa requirements documented for travel

Staff Member: _______________
Country: _______________
Permit Type: _______________
Status: _______________
Expiration: _______________

================================================================================
DATA PRIVACY (GDPR and Local Requirements)
================================================================================

[ ] Data processing agreements with foreign partners
[ ] Privacy policy updated for international operations
[ ] Data transfer mechanisms in place (Standard Contractual Clauses)
[ ] Local data privacy requirements identified and addressed

================================================================================
INSURANCE
================================================================================

[ ] General liability coverage extends internationally
[ ] Workers' compensation for international travel
[ ] Foreign voluntary workers' compensation (if applicable)
[ ] Political risk insurance (if applicable)
[ ] Kidnap and ransom insurance (if applicable)

================================================================================
COMPLIANCE CERTIFICATION
================================================================================

I certify that ${entityName} has completed the above compliance checklist
and is in compliance with all applicable U.S. and foreign laws and regulations
for international operations.

Authorized Representative: _______________________________
Title: _______________
Date: _______________

================================================================================
`;
  };

  const generateGlobalImpactNarrative = (entityName: string, projectName: string) => {
    return `GLOBAL IMPACT PROJECT NARRATIVE

================================================================================
ORGANIZATION: ${entityName}
PROJECT: ${projectName || "[Project Name]"}
================================================================================

EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
[Provide a compelling 2-3 paragraph summary of the project, its global
significance, and expected impact across borders.]

================================================================================
GLOBAL PROBLEM STATEMENT
================================================================================

The Challenge:
[Describe the global problem this project addresses. Include statistics and
evidence demonstrating the scope and severity across multiple countries/regions.]

Why Now:
[Explain the urgency and timeliness of addressing this issue globally.]

Connection to UN Sustainable Development Goals:
[ ] SDG 1: No Poverty
[ ] SDG 2: Zero Hunger
[ ] SDG 3: Good Health and Well-being
[ ] SDG 4: Quality Education
[ ] SDG 5: Gender Equality
[ ] SDG 8: Decent Work and Economic Growth
[ ] SDG 10: Reduced Inequalities
[ ] SDG 16: Peace, Justice and Strong Institutions
[ ] SDG 17: Partnerships for the Goals

================================================================================
TARGET COUNTRIES & POPULATIONS
================================================================================

Primary Country: _______________
Population Served: _______________
Key Demographics: _______________

Secondary Country: _______________
Population Served: _______________
Key Demographics: _______________

Total Global Reach: _______________ individuals/communities

================================================================================
LOCAL PARTNERS
================================================================================

Partner 1:
Organization: _______________
Country: _______________
Role: _______________
Years of Partnership: _______________
Key Strengths: _______________

Partner 2:
Organization: _______________
Country: _______________
Role: _______________
Years of Partnership: _______________
Key Strengths: _______________

================================================================================
CULTURAL ADAPTATION STRATEGY
================================================================================

[Describe how the project will be adapted to respect and incorporate local
cultures, languages, and customs in each target country.]

Language Considerations:
• Primary languages: _______________
• Translation/interpretation plan: _______________
• Local staff language requirements: _______________

Cultural Considerations:
• [Consideration 1]
• [Consideration 2]
• [Consideration 3]

Community Engagement Approach:
[Describe how local communities will be involved in project design and
implementation to ensure cultural appropriateness.]

================================================================================
PROJECT DESIGN & METHODOLOGY
================================================================================

Goal:
[State the overarching goal of the project.]

Objectives:
1. [Objective 1 - measurable]
2. [Objective 2 - measurable]
3. [Objective 3 - measurable]

Activities:
[Describe key activities and how they will be implemented across countries.]

Timeline:
Year 1: _______________
Year 2: _______________
Year 3: _______________

================================================================================
SUSTAINABILITY ACROSS BORDERS
================================================================================

Financial Sustainability:
[Describe how the project will sustain itself after grant funding ends.]

Institutional Sustainability:
[Describe how local partners will continue the work independently.]

Knowledge Transfer:
[Describe how skills and knowledge will be transferred to local stakeholders.]

================================================================================
REPLICATION MODEL
================================================================================

[Describe how this project model can be replicated in other countries/regions.]

Core Components (non-negotiable):
• [Component 1]
• [Component 2]

Adaptable Components:
• [Component 1]
• [Component 2]

Replication Toolkit:
[Describe materials/resources that will be created to enable replication.]

================================================================================
GLOBAL IMPACT METRICS
================================================================================

Quantitative Indicators:
• [Indicator 1]: Target: _______________
• [Indicator 2]: Target: _______________
• [Indicator 3]: Target: _______________

Qualitative Indicators:
• [Indicator 1]
• [Indicator 2]

Data Collection Methods:
[Describe how impact data will be collected across countries.]

================================================================================
RISK MITIGATION
================================================================================

Political Risk:
[Identify and address political risks in target countries.]

Currency Risk:
[Describe strategy for managing exchange rate fluctuations.]

Operational Risk:
[Identify and address operational challenges of working internationally.]

================================================================================
`;
  };

  const generateForeignPartnerAgreement = (entityName: string, projectName: string) => {
    const today = new Date().toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });

    return `FOREIGN PARTNER SUB-AWARD AGREEMENT

================================================================================
AGREEMENT NUMBER: [XXXX-XX-XXX]
EFFECTIVE DATE: ${today}
================================================================================

PRIME RECIPIENT:
${entityName}
[Address]
[City, State ZIP, USA]
EIN: [XX-XXXXXXX]

SUB-RECIPIENT:
[Foreign Organization Name]
[Address]
[City, Country]
Registration Number: [XXXXXX]

================================================================================
AWARD INFORMATION
================================================================================

Prime Award Number: _______________
Prime Awarding Agency: _______________
Project Title: ${projectName || "[Project Title]"}
Sub-Award Amount: $_______________
Sub-Award Currency: [USD / Local Currency]
Performance Period: [Start Date] to [End Date]
CFDA Number (if applicable): _______________

================================================================================
SCOPE OF WORK
================================================================================

The Sub-Recipient agrees to perform the following activities:

1. [Activity 1]
   Deliverables: _______________
   Timeline: _______________

2. [Activity 2]
   Deliverables: _______________
   Timeline: _______________

3. [Activity 3]
   Deliverables: _______________
   Timeline: _______________

================================================================================
BUDGET
================================================================================

Category                          Amount (USD)    Amount (Local)
----------------------------------------------------------------
Personnel                         $___________    ___________
Fringe Benefits                   $___________    ___________
Travel                            $___________    ___________
Equipment                         $___________    ___________
Supplies                          $___________    ___________
Contractual                       $___________    ___________
Other Direct Costs                $___________    ___________
Indirect Costs                    $___________    ___________
----------------------------------------------------------------
TOTAL                             $___________    ___________

Exchange Rate: _______________ (as of _______________)
Exchange Rate Source: _______________

================================================================================
PAYMENT TERMS
================================================================================

Payment Schedule:
[ ] Advance payment: ___% upon execution
[ ] Milestone-based payments
[ ] Reimbursement basis
[ ] Other: _______________

Payment Method: Wire transfer to:
Bank Name: _______________
Bank Address: _______________
Account Name: _______________
Account Number: _______________
SWIFT/BIC Code: _______________
IBAN (if applicable): _______________

================================================================================
REPORTING REQUIREMENTS
================================================================================

Financial Reports:
• Frequency: [Monthly / Quarterly]
• Due Date: [X] days after period end
• Format: [Specify template]

Programmatic Reports:
• Frequency: [Monthly / Quarterly]
• Due Date: [X] days after period end
• Format: [Specify template]

Final Report:
• Due Date: [X] days after project end
• Requirements: [Specify]

================================================================================
AUDIT REQUIREMENTS
================================================================================

[ ] Annual audit required if sub-award exceeds $[amount]
[ ] Audit must be conducted by [certified/licensed auditor]
[ ] Audit report due within [X] days of fiscal year end
[ ] Audit costs [are / are not] allowable under this agreement

================================================================================
COMPLIANCE REQUIREMENTS
================================================================================

The Sub-Recipient certifies compliance with:

[ ] U.S. Office of Foreign Assets Control (OFAC) regulations
[ ] Foreign Corrupt Practices Act (FCPA)
[ ] Anti-terrorism financing requirements
[ ] Prime award terms and conditions (attached)
[ ] Applicable local laws and regulations

================================================================================
INTELLECTUAL PROPERTY
================================================================================

[Specify ownership and licensing of any intellectual property created under
this agreement.]

================================================================================
TERMINATION
================================================================================

This agreement may be terminated:
• By mutual written consent
• By Prime Recipient with [30] days written notice
• Immediately for cause (material breach, fraud, etc.)
• Upon termination of prime award

Upon termination, Sub-Recipient shall:
• Cease all activities under this agreement
• Return unexpended funds within [30] days
• Submit final financial and programmatic reports
• Return or dispose of equipment as directed

================================================================================
DISPUTE RESOLUTION
================================================================================

Governing Law: [State/Country]
Dispute Resolution: [Arbitration / Mediation / Litigation]
Venue: _______________

================================================================================
SIGNATURES
================================================================================

PRIME RECIPIENT: ${entityName}

_______________________________     Date: _______________
Name: _______________
Title: _______________


SUB-RECIPIENT: [Foreign Organization]

_______________________________     Date: _______________
Name: _______________
Title: _______________

================================================================================
ATTACHMENTS
================================================================================

[ ] Attachment A: Detailed Budget
[ ] Attachment B: Scope of Work
[ ] Attachment C: Prime Award Terms and Conditions
[ ] Attachment D: Reporting Templates
[ ] Attachment E: OFAC/FCPA Certifications

================================================================================
`;
  };

  const handleDownload = (template: Template) => {
    const entityName = selectedEntity 
      ? entities.find(e => e.id === selectedEntity)?.name || "Organization"
      : "Organization";
    const projectName = customFields.projectName || "";

    let content = "";
    let filename = "";
    let mimeType = "";

    switch (template.id) {
      case "budget-template":
        content = generateBudgetTemplate(entityName);
        filename = `${entityName.replace(/[^a-zA-Z0-9]/g, "_")}_Budget_Template.csv`;
        mimeType = "text/csv";
        break;
      case "letter-of-support":
        content = generateLetterOfSupport(entityName, projectName);
        filename = `Letter_of_Support_Template.txt`;
        mimeType = "text/plain";
        break;
      case "board-resolution":
        content = generateBoardResolution(entityName, projectName);
        filename = `Board_Resolution_Template.txt`;
        mimeType = "text/plain";
        break;
      case "project-narrative":
        content = generateProjectNarrative(entityName, projectName);
        filename = `Project_Narrative_Template.txt`;
        mimeType = "text/plain";
        break;
      case "org-chart":
        content = generateOrgChart(entityName);
        filename = `Organizational_Chart_Template.txt`;
        mimeType = "text/plain";
        break;
      case "logic-model":
        content = generateLogicModel(entityName, projectName);
        filename = `${entityName.replace(/[^a-zA-Z0-9]/g, "_")}_Logic_Model.csv`;
        mimeType = "text/csv";
        break;
      case "intl-mou":
        content = generateInternationalMOU(entityName, projectName);
        filename = `International_Partnership_MOU_Template.txt`;
        mimeType = "text/plain";
        break;
      case "intl-budget":
        content = generateMultiCurrencyBudget(entityName);
        filename = `${entityName.replace(/[^a-zA-Z0-9]/g, "_")}_Multi_Currency_Budget.csv`;
        mimeType = "text/csv";
        break;
      case "intl-compliance":
        content = generateInternationalCompliance(entityName);
        filename = `International_Compliance_Checklist.txt`;
        mimeType = "text/plain";
        break;
      case "intl-narrative":
        content = generateGlobalImpactNarrative(entityName, projectName);
        filename = `Global_Impact_Narrative_Template.txt`;
        mimeType = "text/plain";
        break;
      case "intl-partner-agreement":
        content = generateForeignPartnerAgreement(entityName, projectName);
        filename = `Foreign_Partner_SubAward_Agreement.txt`;
        mimeType = "text/plain";
        break;
      default:
        // Generic template
        content = `${template.name}\n\n${entityName}\n\n[Template content - customize as needed]\n\nFields to complete:\n${template.fields?.map(f => `- ${f}: [Enter value]`).join("\n")}`;
        filename = `${template.name.replace(/[^a-zA-Z0-9]/g, "_")}_Template.txt`;
        mimeType = "text/plain";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${template.name}`);
  };

  const handleCopyToClipboard = (template: Template) => {
    const entityName = selectedEntity 
      ? entities.find(e => e.id === selectedEntity)?.name || "Organization"
      : "Organization";
    const projectName = customFields.projectName || "";

    let content = "";

    switch (template.id) {
      case "letter-of-support":
        content = generateLetterOfSupport(entityName, projectName);
        break;
      case "board-resolution":
        content = generateBoardResolution(entityName, projectName);
        break;
      case "project-narrative":
        content = generateProjectNarrative(entityName, projectName);
        break;
      case "org-chart":
        content = generateOrgChart(entityName);
        break;
      default:
        content = `${template.name}\n\n${entityName}\n\n[Template content]`;
    }

    navigator.clipboard.writeText(content);
    toast.success("Template copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Document Templates</h2>
          <p className="text-muted-foreground mt-1">
            Download and customize templates for common grant documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {templates.length} Templates Available
          </Badge>
        </div>
      </div>

      {/* Entity Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Customize Templates</CardTitle>
          <CardDescription>
            Select an entity to pre-fill organization information in templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Entity</Label>
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an entity..." />
                </SelectTrigger>
                <SelectContent>
                  {entities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project Name (Optional)</Label>
              <Input
                placeholder="Enter project name..."
                value={customFields.projectName || ""}
                onChange={(e) => setCustomFields({ ...customFields, projectName: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="organizational">Organizational</TabsTrigger>
          <TabsTrigger value="narrative">Narrative</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="international">International</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {template.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[template.category]}>
                        {template.category}
                      </Badge>
                      <span className="text-lg">{formatIcons[template.format]}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {template.fields && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Includes sections for:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.slice(0, 4).map(field => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                        {template.fields.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.fields.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => handleDownload(template)}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setPreviewTemplate(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {template.icon}
                            {template.name}
                          </DialogTitle>
                          <DialogDescription>
                            {template.description}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2">Template Sections:</h4>
                            <ul className="space-y-1">
                              {template.fields?.map(field => (
                                <li key={field} className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  {field}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 gap-2"
                              onClick={() => handleDownload(template)}
                            >
                              <Download className="w-4 h-4" />
                              Download Template
                            </Button>
                            <Button 
                              variant="outline"
                              className="gap-2"
                              onClick={() => handleCopyToClipboard(template)}
                            >
                              <Copy className="w-4 h-4" />
                              Copy to Clipboard
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tips Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Template Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Budget Templates</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Ensure all costs are reasonable and justified</li>
                <li>• Include indirect costs if allowed by the funder</li>
                <li>• Match budget categories to funder requirements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Letters of Support</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Request letters at least 2 weeks before deadline</li>
                <li>• Provide partners with project summary and key points</li>
                <li>• Ensure letters are on official letterhead</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Board Resolutions</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Schedule board meeting before grant deadline</li>
                <li>• Include specific grant name and amount</li>
                <li>• Obtain original signatures when required</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Project Narratives</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Follow funder's page limits and formatting</li>
                <li>• Use data to support your need statement</li>
                <li>• Include SMART objectives (Specific, Measurable, etc.)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
