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
  // Contractor Templates
  {
    id: "intl-contractor-agreement",
    name: "International Contractor Agreement",
    description: "Independent contractor agreement for engaging foreign teleworkers with clear scope, payment terms, IP ownership, and compliance provisions.",
    category: "international",
    format: "docx",
    icon: <Briefcase className="w-6 h-6" />,
    fields: ["Contractor Name", "Country", "Scope of Work", "Deliverables", "Payment Terms", "Currency", "IP Ownership", "Confidentiality", "Termination"],
  },
  {
    id: "w8ben-collection",
    name: "W-8BEN Collection Package",
    description: "Complete package for collecting W-8BEN forms from foreign contractors including instructions, form templates, and tax treaty guidance.",
    category: "international",
    format: "docx",
    icon: <FileText className="w-6 h-6" />,
    fields: ["Contractor Information", "Country of Residence", "Tax Treaty Benefits", "Certification", "FATCA Status"],
  },
  {
    id: "eor-evaluation",
    name: "EOR Evaluation Checklist",
    description: "Employer of Record evaluation checklist for comparing EOR providers (Deel, Remote, Oyster) when hiring international employees.",
    category: "international",
    format: "xlsx",
    icon: <ClipboardList className="w-6 h-6" />,
    fields: ["Provider Name", "Countries Covered", "Monthly Cost", "Benefits Included", "Compliance Features", "Onboarding Time", "Support Quality"],
  },
  {
    id: "contractor-classification",
    name: "Contractor vs Employee Guide",
    description: "Classification guide to determine whether a foreign worker should be engaged as contractor or employee, with risk assessment checklist.",
    category: "international",
    format: "docx",
    icon: <Scale className="w-6 h-6" />,
    fields: ["Control Factors", "Financial Factors", "Relationship Factors", "Risk Assessment", "Recommended Classification"],
  },
  {
    id: "trust-expansion-playbook",
    name: "Trust-Based International Expansion Playbook",
    description: "Strategic guide for using the 98 Trust (Jamaica) as the anchor for international operations without creating separate foreign entities.",
    category: "international",
    format: "docx",
    icon: <Landmark className="w-6 h-6" />,
    fields: ["Trust Structure", "Commonwealth Advantages", "Asset Protection", "Tax Treaties", "When to Create Foreign Entity", "MOU Strategy"],
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

  const generateInternationalContractorAgreement = (entityName: string) => {
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    return `INTERNATIONAL INDEPENDENT CONTRACTOR AGREEMENT

================================================================================
PARTIES
================================================================================

This Independent Contractor Agreement ("Agreement") is entered into as of ${today}

BETWEEN:

${entityName} ("Company")
[Address]
[City, State ZIP, USA]
EIN: [XX-XXXXXXX]

AND:

[Contractor Name] ("Contractor")
[Address]
[City, Country]
Tax ID/National ID: [XXXXXX]

================================================================================
SCOPE OF WORK
================================================================================

Contractor agrees to provide the following services:

1. Description of Services:
   _______________________________________________________________
   _______________________________________________________________

2. Deliverables:
   • [Deliverable 1]: Due by [Date]
   • [Deliverable 2]: Due by [Date]
   • [Deliverable 3]: Due by [Date]

3. Performance Standards:
   _______________________________________________________________

================================================================================
TERM AND TERMINATION
================================================================================

Start Date: _______________
End Date: _______________

Either party may terminate this Agreement:
• With 30 days written notice
• Immediately for material breach
• Immediately if Contractor fails to meet deliverable deadlines

================================================================================
COMPENSATION
================================================================================

Payment Structure:
[ ] Fixed Fee: $_______________
[ ] Hourly Rate: $_______________/hour (estimated ___ hours)
[ ] Milestone-Based: See schedule below

Payment Currency: [ ] USD [ ] Local Currency: _______________
Exchange Rate Basis: _______________

Payment Schedule:
• [Milestone 1]: $_______________
• [Milestone 2]: $_______________
• [Final Payment]: $_______________

Payment Method: Wire Transfer
Bank Details:
  Bank Name: _______________
  Account Name: _______________
  Account Number: _______________
  SWIFT/BIC: _______________
  IBAN (if applicable): _______________

Invoicing Requirements:
• Invoice format: [Specify]
• Invoice due date: [X] days after submission
• Required documentation: [Time sheets, deliverable proof, etc.]

================================================================================
INDEPENDENT CONTRACTOR STATUS
================================================================================

Contractor acknowledges and agrees that:

1. Contractor is an independent contractor, NOT an employee of Company
2. Contractor is responsible for own taxes, insurance, and benefits
3. Contractor controls the manner and means of performing services
4. Contractor may work for other clients during this engagement
5. Company will not withhold taxes from payments to Contractor
6. Contractor is not entitled to employee benefits

Contractor will receive IRS Form 1099-NEC (if U.S.) or appropriate tax
documentation for foreign contractors.

================================================================================
INTELLECTUAL PROPERTY
================================================================================

Work Product Ownership:
[ ] All work product is "work made for hire" and owned by Company
[ ] Contractor assigns all rights to Company upon payment
[ ] Contractor retains rights with license to Company

Pre-Existing IP:
Contractor's pre-existing intellectual property used in deliverables:
_______________________________________________________________

License Grant:
Contractor grants Company a [exclusive/non-exclusive], [perpetual/limited]
license to use any pre-existing IP incorporated into deliverables.

================================================================================
CONFIDENTIALITY
================================================================================

Contractor agrees to:
1. Keep all Company information confidential
2. Not disclose to third parties without written consent
3. Return all materials upon termination
4. Obligations survive termination for [X] years

Exceptions:
• Information already public
• Information independently developed
• Information required by law to disclose

================================================================================
COMPLIANCE
================================================================================

Contractor certifies:

[ ] Not on any U.S. government restricted party lists (OFAC, BIS, etc.)
[ ] Will comply with all applicable anti-corruption laws (FCPA, UK Bribery Act)
[ ] Will not make payments to government officials on Company's behalf
[ ] Has legal right to work in country of residence
[ ] Will comply with all local labor and tax laws

================================================================================
INSURANCE AND INDEMNIFICATION
================================================================================

Contractor agrees to:
1. Maintain appropriate professional liability insurance
2. Indemnify Company against claims arising from Contractor's work
3. Provide proof of insurance upon request

================================================================================
GOVERNING LAW AND DISPUTES
================================================================================

Governing Law: State of [Georgia], United States

Dispute Resolution:
[ ] Arbitration under [AAA/ICC] rules
[ ] Mediation followed by arbitration
[ ] Courts of [Jurisdiction]

Venue: _______________
Language: English

================================================================================
SIGNATURES
================================================================================

COMPANY: ${entityName}

_______________________________     Date: _______________
Name: _______________
Title: _______________


CONTRACTOR:

_______________________________     Date: _______________
Name: _______________
Country of Residence: _______________

================================================================================
ATTACHMENTS
================================================================================

[ ] Attachment A: Detailed Scope of Work
[ ] Attachment B: Payment Schedule
[ ] Attachment C: W-8BEN Form (for non-U.S. contractors)
[ ] Attachment D: Confidentiality Agreement
`;
  };

  const generateW8BENPackage = (entityName: string) => {
    return `W-8BEN COLLECTION PACKAGE
${entityName}

================================================================================
INSTRUCTIONS FOR FOREIGN CONTRACTORS
================================================================================

As a foreign contractor providing services to ${entityName}, a U.S. company,
you are required to complete IRS Form W-8BEN to certify your foreign status
and claim any applicable tax treaty benefits.

================================================================================
WHAT IS FORM W-8BEN?
================================================================================

Form W-8BEN (Certificate of Foreign Status of Beneficial Owner for United
States Tax Withholding and Reporting) is used by foreign individuals to:

1. Establish that you are not a U.S. person
2. Claim that you are the beneficial owner of the income
3. Claim a reduced rate of, or exemption from, withholding under a tax treaty

================================================================================
WHO NEEDS TO COMPLETE W-8BEN?
================================================================================

• All non-U.S. individual contractors
• Non-U.S. sole proprietors
• Non-U.S. individuals receiving any U.S.-source income

Note: Entities (corporations, partnerships) use Form W-8BEN-E instead.

================================================================================
INFORMATION YOU WILL NEED
================================================================================

Part I - Identification:
[ ] Full legal name (as shown on government ID)
[ ] Country of citizenship
[ ] Permanent residence address (not P.O. Box)
[ ] Mailing address (if different)
[ ] U.S. taxpayer identification number (if any)
[ ] Foreign tax identifying number (from your country)
[ ] Date of birth

Part II - Tax Treaty Benefits (if applicable):
[ ] Country of residence for tax purposes
[ ] Article and paragraph of tax treaty
[ ] Rate of withholding claimed
[ ] Type of income (e.g., independent personal services)

Part III - Certification:
[ ] Signature
[ ] Date
[ ] Capacity (if signing for someone else)

================================================================================
TAX TREATY REFERENCE GUIDE
================================================================================

Common Tax Treaty Countries and Withholding Rates:

| Country        | Treaty Article | Service Income Rate |
|----------------|----------------|---------------------|
| United Kingdom | Article 14     | 0% (if no PE)       |
| Canada         | Article XIV    | 0% (if no PE)       |
| Germany        | Article 14     | 0% (if no PE)       |
| France         | Article 14     | 0% (if no PE)       |
| India          | Article 15     | 0% (if no PE)       |
| Jamaica        | Article 14     | 0% (if no PE)       |
| Mexico         | Article 14     | 0% (if no PE)       |
| Nigeria        | Article 14     | 0% (if no PE)       |
| South Africa   | Article 14     | 0% (if no PE)       |
| Ghana          | Article 14     | 0% (if no PE)       |

PE = Permanent Establishment

Note: If your country has a tax treaty with the U.S. and you do not have a
permanent establishment in the U.S., you may be exempt from U.S. withholding
on service income.

================================================================================
STEP-BY-STEP COMPLETION GUIDE
================================================================================

Line 1: Enter your full legal name exactly as it appears on your passport
        or government-issued ID.

Line 2: Enter your country of citizenship.

Line 3: Enter your permanent residence address. This must be your actual
        residence, not a P.O. Box.

Line 4: Enter your mailing address if different from Line 3.

Line 5: Leave blank unless you have a U.S. Social Security Number or ITIN.

Line 6: Enter your foreign tax identification number from your country of
        residence. This is REQUIRED for treaty benefits.

Line 7: Enter your reference number (optional - for your records).

Line 8: Enter your date of birth in MM-DD-YYYY format.

Part II (Lines 9-10): Complete ONLY if claiming tax treaty benefits.

Line 9: Check the box and enter your country of residence.

Line 10: Enter the special rates and conditions. Example:
         "The beneficial owner is claiming the provisions of Article 14
         of the treaty identified on line 9 to claim a 0% rate of
         withholding on independent personal services income."

Part III: Sign and date the form. The form is valid for 3 years from the
          date of signature.

================================================================================
SUBMISSION CHECKLIST
================================================================================

[ ] Completed W-8BEN form (all required fields filled)
[ ] Copy of passport or government ID
[ ] Proof of foreign tax ID (if claiming treaty benefits)
[ ] Signed and dated within the last 3 years

Submit to:
${entityName}
Attn: Accounts Payable / Tax Compliance
[Email: _______________]

================================================================================
IMPORTANT NOTES
================================================================================

1. VALIDITY: Form W-8BEN is valid for 3 years from the date of signature,
   unless circumstances change.

2. CHANGES: You must submit a new form within 30 days if any information
   changes (address, citizenship, etc.).

3. WITHHOLDING: Without a valid W-8BEN, ${entityName} is required to
   withhold 30% of payments for U.S. tax purposes.

4. TAX ADVICE: This package is for informational purposes only. Consult
   a tax professional in your country for specific advice.

================================================================================
FATCA STATUS
================================================================================

FATCA (Foreign Account Tax Compliance Act) Certification:

By completing Form W-8BEN, you are also certifying your FATCA status as
a foreign person not subject to U.S. tax reporting requirements.

================================================================================
CONTACT INFORMATION
================================================================================

Questions about completing this form?

Contact: ${entityName} Tax Compliance
Email: [_______________]
Phone: [_______________]

IRS Resources:
• Form W-8BEN: https://www.irs.gov/forms-pubs/about-form-w-8-ben
• Instructions: https://www.irs.gov/instructions/iw8ben
• Tax Treaties: https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z
`;
  };

  const generateEOREvaluation = (entityName: string) => {
    const headers = ["Criteria", "Deel", "Remote", "Oyster", "Papaya Global", "Velocity Global", "Notes"];
    const rows = [
      ["BASIC INFORMATION", "", "", "", "", "", ""],
      ["Website", "deel.com", "remote.com", "oysterhr.com", "papayaglobal.com", "velocityglobal.com", ""],
      ["Founded", "2019", "2019", "2020", "2016", "2014", ""],
      ["", "", "", "", "", "", ""],
      ["PRICING", "", "", "", "", "", ""],
      ["EOR Monthly Fee (per employee)", "$599", "$599", "$599", "Custom", "Custom", "Rates vary by country"],
      ["Contractor Management Fee", "$49/mo", "$29/mo", "$29/mo", "Included", "Custom", ""],
      ["Setup Fee", "None", "None", "None", "Varies", "Varies", ""],
      ["Minimum Commitment", "None", "None", "None", "Annual", "Annual", ""],
      ["", "", "", "", "", "", ""],
      ["COUNTRY COVERAGE", "", "", "", "", "", ""],
      ["Total Countries", "150+", "180+", "180+", "160+", "185+", ""],
      ["Jamaica", "Yes", "Yes", "Yes", "Yes", "Yes", "Key for Trust operations"],
      ["Ghana", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["Nigeria", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["UK", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["Canada", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["", "", "", "", "", "", ""],
      ["FEATURES", "", "", "", "", "", ""],
      ["Payroll Processing", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["Benefits Administration", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["Compliance Management", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["Contract Generation", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["Expense Management", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["Time Tracking", "Yes", "Yes", "Yes", "Yes", "Limited", ""],
      ["Equipment Shipping", "Yes", "Yes", "Yes", "No", "No", ""],
      ["Background Checks", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["", "", "", "", "", "", ""],
      ["ONBOARDING", "", "", "", "", "", ""],
      ["Average Onboarding Time", "1-2 weeks", "1-2 weeks", "2-3 weeks", "2-4 weeks", "2-4 weeks", ""],
      ["Self-Service Portal", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["Dedicated Support", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["", "", "", "", "", "", ""],
      ["COMPLIANCE", "", "", "", "", "", ""],
      ["Local Entity Owned", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["IP Protection", "Strong", "Strong", "Strong", "Strong", "Strong", ""],
      ["Data Privacy (GDPR)", "Compliant", "Compliant", "Compliant", "Compliant", "Compliant", ""],
      ["SOC 2 Certified", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["", "", "", "", "", "", ""],
      ["SUPPORT", "", "", "", "", "", ""],
      ["24/7 Support", "Yes", "Yes", "Yes", "Yes", "Yes", ""],
      ["Dedicated CSM", "Enterprise", "Enterprise", "Enterprise", "All plans", "All plans", ""],
      ["Response Time SLA", "<24 hrs", "<24 hrs", "<24 hrs", "<24 hrs", "<24 hrs", ""],
      ["", "", "", "", "", "", ""],
      ["EVALUATION SCORES (1-5)", "", "", "", "", "", ""],
      ["Ease of Use", "[Score]", "[Score]", "[Score]", "[Score]", "[Score]", ""],
      ["Country Coverage", "[Score]", "[Score]", "[Score]", "[Score]", "[Score]", ""],
      ["Pricing Value", "[Score]", "[Score]", "[Score]", "[Score]", "[Score]", ""],
      ["Customer Support", "[Score]", "[Score]", "[Score]", "[Score]", "[Score]", ""],
      ["Compliance Strength", "[Score]", "[Score]", "[Score]", "[Score]", "[Score]", ""],
      ["TOTAL SCORE", "[Sum]", "[Sum]", "[Sum]", "[Sum]", "[Sum]", ""],
      ["", "", "", "", "", "", ""],
      ["RECOMMENDATION", "", "", "", "", "", ""],
      ["Best For", "Startups, SMBs", "Tech companies", "Growing teams", "Enterprise", "Complex needs", ""],
      ["Selected Provider", "[ ]", "[ ]", "[ ]", "[ ]", "[ ]", ""],
    ];

    let csv = `${entityName} - Employer of Record (EOR) Evaluation\n`;
    csv += `Evaluation Date: ${new Date().toLocaleDateString()}\n`;
    csv += `Evaluated By: _______________\n\n`;
    csv += headers.join(",") + "\n";
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    return csv;
  };

  const generateContractorClassificationGuide = (entityName: string) => {
    return `CONTRACTOR VS. EMPLOYEE CLASSIFICATION GUIDE
${entityName}

================================================================================
PURPOSE
================================================================================

This guide helps ${entityName} determine whether a foreign worker should be
engaged as an independent contractor or through an Employer of Record (EOR)
as an employee. Misclassification can result in significant penalties,
back taxes, and legal liability.

================================================================================
QUICK DECISION FRAMEWORK
================================================================================

Answer these questions about the working relationship:

1. CONTROL FACTORS
   [ ] Does the company control WHEN the work is done?
   [ ] Does the company control WHERE the work is done?
   [ ] Does the company control HOW the work is done?
   [ ] Does the company provide training on methods?
   [ ] Does the company set specific work hours?

   More "Yes" answers = More likely EMPLOYEE

2. FINANCIAL FACTORS
   [ ] Does the worker have significant investment in equipment?
   [ ] Can the worker realize profit or loss?
   [ ] Does the worker have multiple clients?
   [ ] Does the worker pay own business expenses?
   [ ] Does the worker set own rates?

   More "Yes" answers = More likely CONTRACTOR

3. RELATIONSHIP FACTORS
   [ ] Is the relationship expected to be indefinite?
   [ ] Does the worker receive benefits?
   [ ] Is the work integral to the business?
   [ ] Does the worker have authority to hire/fire?
   [ ] Is there a written contract specifying contractor status?

   More "Yes" to first 4 = More likely EMPLOYEE

================================================================================
DETAILED CLASSIFICATION CHECKLIST
================================================================================

WORKER INFORMATION:
Name: _______________
Country: _______________
Proposed Role: _______________
Engagement Type: [ ] Project-based [ ] Ongoing

--------------------------------------------------------------------------------
BEHAVIORAL CONTROL
--------------------------------------------------------------------------------

| Factor | Contractor | Employee | This Worker |
|--------|------------|----------|-------------|
| Work schedule | Sets own | Company sets | [ ] |
| Work location | Chooses own | Company specifies | [ ] |
| Work methods | Own discretion | Company directs | [ ] |
| Training | Not required | Company provides | [ ] |
| Evaluation | By results | By process | [ ] |

--------------------------------------------------------------------------------
FINANCIAL CONTROL
--------------------------------------------------------------------------------

| Factor | Contractor | Employee | This Worker |
|--------|------------|----------|-------------|
| Equipment | Provides own | Company provides | [ ] |
| Expenses | Pays own | Company reimburses | [ ] |
| Profit/Loss | Can have either | Fixed pay | [ ] |
| Multiple clients | Yes | Exclusive | [ ] |
| Payment method | Invoice | Payroll | [ ] |

--------------------------------------------------------------------------------
RELATIONSHIP TYPE
--------------------------------------------------------------------------------

| Factor | Contractor | Employee | This Worker |
|--------|------------|----------|-------------|
| Duration | Project/term | Indefinite | [ ] |
| Benefits | None | Receives | [ ] |
| Termination | Per contract | Employment law | [ ] |
| Integration | Peripheral | Core business | [ ] |
| Exclusivity | Non-exclusive | Exclusive | [ ] |

================================================================================
RISK ASSESSMENT
================================================================================

COUNTRY-SPECIFIC RISKS:

Country: _______________

[ ] High enforcement risk (UK, France, Germany, Netherlands)
[ ] Medium enforcement risk (Canada, Australia, India)
[ ] Lower enforcement risk (varies)

Local labor law considerations:
_______________________________________________________________
_______________________________________________________________

================================================================================
RECOMMENDATION
================================================================================

Based on the above analysis:

[ ] INDEPENDENT CONTRACTOR - Low risk
    Proceed with contractor agreement

[ ] INDEPENDENT CONTRACTOR - Medium risk
    Proceed with caution; ensure strong contract and documentation

[ ] EMPLOYEE via EOR - Recommended
    Use Employer of Record to mitigate misclassification risk

[ ] EMPLOYEE - Direct hire
    Establish local entity or use EOR

Rationale:
_______________________________________________________________
_______________________________________________________________

================================================================================
MITIGATION STRATEGIES FOR CONTRACTORS
================================================================================

If proceeding with contractor status, implement these safeguards:

1. Written Contract
   [ ] Clear scope of work with deliverables
   [ ] Project-based or time-limited engagement
   [ ] Explicit independent contractor language
   [ ] IP assignment provisions

2. Operational Practices
   [ ] Do not set specific work hours
   [ ] Do not provide company email/equipment
   [ ] Do not include in company meetings/events
   [ ] Do not provide training on methods
   [ ] Allow work for other clients

3. Payment Practices
   [ ] Pay by invoice, not payroll
   [ ] No benefits or reimbursements
   [ ] Collect W-8BEN for tax purposes
   [ ] Document business purpose of payments

4. Documentation
   [ ] Maintain signed contractor agreement
   [ ] Keep invoices and payment records
   [ ] Document deliverables received
   [ ] Annual review of classification

================================================================================
APPROVAL
================================================================================

Classification Decision: [ ] Contractor [ ] Employee

Reviewed By: _______________
Title: _______________
Date: _______________

Approved By: _______________
Title: _______________
Date: _______________
`;
  };

  const generateTrustExpansionPlaybook = (entityName: string) => {
    return `TRUST-BASED INTERNATIONAL EXPANSION PLAYBOOK
${entityName}

================================================================================
EXECUTIVE SUMMARY
================================================================================

This playbook outlines the strategy for using the 98 Trust - CALEA Freeman
Family Trust (domiciled in Jamaica) as the anchor for international operations
without creating separate foreign entities in each country of operation.

================================================================================
CURRENT ENTITY STRUCTURE
================================================================================

                    98 TRUST - CALEA Freeman Family Trust
                              (Jamaica)
                                  |
        +-----------+-------------+-------------+-----------+
        |           |             |             |           |
   LuvOnPurpose   L.A.W.S.    Real-Eye-    Academy      [Future
   Wealth System  Collective   Nation      (501c3)     Entities]
      (LLC)        (LLC)        (LLC)        (Inc)

================================================================================
WHY TRUST AS INTERNATIONAL ANCHOR?
================================================================================

1. COMMONWEALTH ADVANTAGE
   - Jamaica is a Commonwealth nation with favorable legal framework
   - English common law system (familiar legal concepts)
   - Strong property rights and contract enforcement
   - Tax treaties with multiple countries

2. ASSET PROTECTION
   - Trust provides liability shield for international operations
   - Separates personal assets from business risks
   - Generational wealth preservation structure
   - Creditor protection in multiple jurisdictions

3. TAX EFFICIENCY
   - Jamaica has tax treaties with: UK, Canada, USA, CARICOM nations
   - No capital gains tax on certain investments
   - Favorable treatment of trust distributions
   - Potential for tax-efficient repatriation of profits

4. OPERATIONAL FLEXIBILITY
   - Trust can hold assets in multiple countries
   - Can own subsidiaries if needed later
   - Can enter contracts internationally
   - Can hold intellectual property globally

================================================================================
INTERNATIONAL EXPANSION STRATEGY
================================================================================

PHASE 1: MOU-BASED PARTNERSHIPS (Years 1-3)
------------------------------------------

Approach: Partner with local organizations via MOUs rather than
establishing physical presence.

Best For:
• Educational programs (Academy partnerships)
• Documentary/media projects (Real-Eye-Nation)
• Workforce development (L.A.W.S. Collective)

Structure:
• Trust or U.S. entity signs MOU with foreign partner
• Foreign partner handles local operations
• Funds flow as grants or service payments
• No local entity registration required

Countries to Target:
• Ghana (diaspora connection, English-speaking)
• Nigeria (large market, English-speaking)
• UK (Commonwealth, strong legal system)
• Canada (proximity, Commonwealth)
• Caribbean nations (CARICOM, Trust domicile)

PHASE 2: CONTRACTOR ENGAGEMENT (Years 2-4)
------------------------------------------

Approach: Engage foreign individuals as independent contractors
for specific projects and ongoing support.

Best For:
• Technical development (platform work)
• Content creation (media production)
• Research and curriculum development
• Administrative support

Structure:
• U.S. entity or Trust contracts directly
• Contractor provides services remotely
• Payment via wire transfer (USD or local currency)
• W-8BEN collected for tax compliance

Key Countries:
• Jamaica (Trust operations, local support)
• India (technical talent, cost-effective)
• Philippines (English-speaking, admin support)
• UK (specialized expertise)
• Nigeria/Ghana (cultural alignment)

PHASE 3: EOR EMPLOYMENT (Years 3-5)
-----------------------------------

Approach: Use Employer of Record (EOR) services to hire
full-time employees in foreign countries without establishing
local entities.

Best For:
• Country managers/coordinators
• Full-time program staff
• Roles requiring employee benefits
• Countries with strict labor laws

Recommended EOR Providers:
• Deel - Good for startups, strong in Africa
• Remote - Strong compliance, good UX
• Oyster - Growing team focus

Target Roles:
• Jamaica Country Coordinator (Trust operations)
• Regional Program Managers
• Full-time content creators
• Local business development

PHASE 4: FOREIGN SUBSIDIARY (Year 5+)
-------------------------------------

Approach: Establish foreign subsidiary ONLY when specific
operational requirements demand it.

Triggers for Subsidiary:
• 5+ full-time employees in one country
• Physical office/facility required
• Government contracts requiring local entity
• Banking relationships requiring local registration
• Significant local revenue generation

Likely First Subsidiaries:
• Jamaica (Trust already domiciled, natural first)
• UK (if significant operations develop)
• Ghana (if Academy expansion succeeds)

Structure:
• Trust holds shares in foreign subsidiary
• Local board with Trust oversight
• Intercompany agreements for services
• Transfer pricing compliance

================================================================================
COUNTRY-SPECIFIC PLAYBOOKS
================================================================================

JAMAICA (Trust Domicile)
------------------------
Current Status: Trust domiciled, operational base
Strategy: Direct Trust operations + local contractors
Next Steps:
• Engage local legal counsel for Trust administration
• Open Trust bank account (if not already)
• Identify local contractors for support services
• Establish relationships with local partners

GHANA (Education Expansion)
---------------------------
Current Status: Target market for Academy
Strategy: MOU partnerships + contractors
Next Steps:
• Identify educational institution partners
• Draft MOU for curriculum delivery
• Engage local education consultants
• Research grant opportunities (USAID, foundations)

NIGERIA (Media & Workforce)
---------------------------
Current Status: Target market for Real-Eye-Nation & L.A.W.S.
Strategy: MOU partnerships + contractors
Next Steps:
• Identify media production partners
• Connect with workforce development organizations
• Engage local content creators as contractors
• Research diaspora engagement opportunities

UK (Commonwealth Hub)
---------------------
Current Status: Potential expansion market
Strategy: Contractors + EOR if needed
Next Steps:
• Identify UK-based diaspora organizations
• Engage UK contractors for specialized work
• Research UK grant opportunities
• Consider UK subsidiary only if 5+ employees needed

================================================================================
COMPLIANCE FRAMEWORK
================================================================================

For All International Operations:

1. OFAC Screening
   • Screen all foreign partners/contractors
   • Document screening process
   • Ongoing monitoring

2. FCPA Compliance
   • No payments to government officials
   • Anti-corruption certifications from partners
   • Training for staff working internationally

3. Tax Compliance
   • W-8BEN collection from all foreign contractors
   • Transfer pricing documentation (if subsidiaries)
   • Tax treaty benefit claims

4. Data Privacy
   • GDPR compliance for EU/UK operations
   • Local data protection law compliance
   • Data processing agreements with partners

================================================================================
DECISION TREE: WHEN TO CREATE FOREIGN ENTITY
================================================================================

                    Do you need to operate in [Country]?
                                    |
                    +-------Yes-----+-----No------+
                    |                             |
            Can you partner                    Stop
            via MOU instead?
                    |
            +--Yes--+--No--+
            |              |
        Use MOU      Do you need
                     employees?
                          |
                  +--Yes--+--No--+
                  |              |
              Use EOR       Use
                          Contractors
                  |
          More than 5
          employees?
                  |
          +--Yes--+--No--+
          |              |
      Consider       Continue
      Subsidiary     with EOR

================================================================================
KEY CONTACTS & RESOURCES
================================================================================

Jamaica Trust Administration:
• Attorney: _______________
• Accountant: _______________
• Bank: _______________

EOR Providers:
• Deel: sales@deel.com
• Remote: sales@remote.com
• Oyster: sales@oysterhr.com

International Tax:
• U.S. Tax Advisor: _______________
• International Tax Specialist: _______________

Compliance:
• OFAC Screening Tool: _______________
• FCPA Training Provider: _______________

================================================================================
APPENDIX: TAX TREATY SUMMARY
================================================================================

Jamaica Tax Treaties:
• United States - Yes (reduced withholding)
• United Kingdom - Yes
• Canada - Yes
• CARICOM nations - Yes (regional agreement)

U.S. Tax Treaties (for U.S. entity operations):
• Full list: https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z

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
      case "intl-contractor-agreement":
        content = generateInternationalContractorAgreement(entityName);
        filename = `International_Contractor_Agreement.txt`;
        mimeType = "text/plain";
        break;
      case "w8ben-collection":
        content = generateW8BENPackage(entityName);
        filename = `W8BEN_Collection_Package.txt`;
        mimeType = "text/plain";
        break;
      case "eor-evaluation":
        content = generateEOREvaluation(entityName);
        filename = `${entityName.replace(/[^a-zA-Z0-9]/g, "_")}_EOR_Evaluation.csv`;
        mimeType = "text/csv";
        break;
      case "contractor-classification":
        content = generateContractorClassificationGuide(entityName);
        filename = `Contractor_vs_Employee_Guide.txt`;
        mimeType = "text/plain";
        break;
      case "trust-expansion-playbook":
        content = generateTrustExpansionPlaybook(entityName);
        filename = `Trust_International_Expansion_Playbook.txt`;
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
