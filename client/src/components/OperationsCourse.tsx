import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  BookOpen,
  FileText,
  Trophy,
  Lightbulb,
  Target,
  Users,
  ClipboardList,
  Shield,
  Calendar,
  Scale,
} from "lucide-react";
import { toast } from "sonner";

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
    type: "text" | "textarea";
    placeholder?: string;
    required?: boolean;
  }[];
  outputTemplate: string;
}

interface OperationsData {
  // Organizational Structure
  orgStructure: string;
  roles: string;
  responsibilities: string;
  reportingLines: string;
  
  // SOPs
  coreProcedures: string;
  qualityStandards: string;
  customerService: string;
  
  // Compliance
  requiredLicenses: string;
  permits: string;
  insuranceTypes: string;
  regulatoryBodies: string;
  
  // Contracts
  vendorContracts: string;
  customerAgreements: string;
  employmentContracts: string;
  
  // Calendar
  annualFilings: string;
  taxDeadlines: string;
  renewalDates: string;
  reviewSchedule: string;
}

const operationsModules: CourseModule[] = [
  {
    id: 1,
    title: "Module 1: Organizational Structure",
    type: "lesson",
    content: {
      title: "Building Your Team Structure",
      sections: [
        {
          heading: "Why Structure Matters",
          text: "Even a one-person business needs structure. Clear roles, responsibilities, and processes ensure consistency, enable growth, and protect you legally. As you grow, structure prevents chaos.",
        },
        {
          heading: "Common Structures",
          text: "Sole operator (you do everything), Functional (departments by function), Flat (minimal hierarchy), Matrix (cross-functional teams). Start simple and evolve as needed.",
          tips: [
            "Document roles even if you fill them all",
            "Plan for growth before you need it",
            "Define decision-making authority clearly",
          ],
        },
        {
          heading: "Roles vs Responsibilities",
          text: "A role is a position (CEO, Manager, Assistant). Responsibilities are the specific duties of that role. One person can fill multiple roles, but each role should have clear responsibilities.",
        },
        {
          heading: "Reporting Lines",
          text: "Who reports to whom? Clear reporting lines prevent confusion, ensure accountability, and enable efficient communication. Even in flat organizations, someone needs final decision authority.",
        },
        {
          heading: "Org Chart",
          text: "Create a visual representation of your structure. Include all roles (even if one person fills many), reporting relationships, and key responsibilities. Update as you grow.",
        },
      ],
      keyTakeaways: [
        "Structure enables growth and prevents chaos",
        "Document roles even as a solo operator",
        "Clear reporting lines ensure accountability",
        "Start simple and evolve as needed",
      ],
    } as LessonContent,
  },
  {
    id: 2,
    title: "Module 1: Knowledge Check",
    type: "quiz",
    content: {
      questions: [
        {
          question: "Why should a solo business owner document roles?",
          options: ["It's legally required", "To prepare for growth and ensure consistency", "To impress investors", "It's not necessary"],
          correctIndex: 1,
          explanation: "Documenting roles prepares you for growth, ensures consistency, and helps you understand all the functions your business needs.",
        },
        {
          question: "What's the difference between a role and a responsibility?",
          options: ["They're the same thing", "A role is a position; responsibilities are specific duties", "Responsibilities are more important", "Roles are for employees only"],
          correctIndex: 1,
          explanation: "A role is a position (like CEO), while responsibilities are the specific duties that role performs.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 3,
    title: "Module 1: Organization Worksheet",
    type: "worksheet",
    content: {
      title: "Organizational Structure",
      description: "Define your business structure and roles.",
      fields: [
        { id: "orgStructure", label: "Organization Type", type: "text", placeholder: "e.g., Sole operator, Functional, Flat", required: true },
        { id: "roles", label: "Key Roles (list all positions)", type: "textarea", placeholder: "CEO/Owner, Operations Manager, Sales, Customer Service...", required: true },
        { id: "responsibilities", label: "Key Responsibilities by Role", type: "textarea", placeholder: "CEO: Strategy, major decisions, external relationships\nOperations: Daily management, quality control...", required: true },
        { id: "reportingLines", label: "Reporting Structure", type: "textarea", placeholder: "All roles report to CEO/Owner\nOr: Sales reports to Operations Manager who reports to CEO", required: true },
      ],
      outputTemplate: "ORGANIZATIONAL STRUCTURE\n\nStructure Type: {{orgStructure}}\n\nKey Roles:\n{{roles}}\n\nResponsibilities:\n{{responsibilities}}\n\nReporting Lines:\n{{reportingLines}}",
    } as WorksheetContent,
  },
  {
    id: 4,
    title: "Module 2: Standard Operating Procedures",
    type: "lesson",
    content: {
      title: "Creating Consistency Through SOPs",
      sections: [
        {
          heading: "What are SOPs?",
          text: "Standard Operating Procedures are step-by-step instructions for completing routine tasks. They ensure consistency, quality, and efficiency regardless of who performs the task.",
        },
        {
          heading: "Benefits of SOPs",
          text: "Consistent quality, easier training, reduced errors, scalability, business value (documented processes make your business more valuable), and protection (proof of proper procedures).",
          tips: [
            "Start with your most critical processes",
            "Write them as you do the work",
            "Include screenshots and examples",
          ],
        },
        {
          heading: "What to Document",
          text: "Customer service procedures, Order fulfillment, Quality control, Financial processes (invoicing, payments), Communication protocols, Emergency procedures, Hiring and onboarding.",
        },
        {
          heading: "SOP Format",
          text: "Title, Purpose, Scope (who uses it), Materials needed, Step-by-step instructions, Quality checkpoints, Troubleshooting, Version history. Keep it simple and actionable.",
        },
        {
          heading: "Maintaining SOPs",
          text: "Review quarterly, update when processes change, get feedback from users, version control all changes. Outdated SOPs are worse than no SOPs.",
        },
      ],
      keyTakeaways: [
        "SOPs ensure consistency and quality",
        "Document critical processes first",
        "Keep procedures simple and actionable",
        "Review and update regularly",
      ],
    } as LessonContent,
  },
  {
    id: 5,
    title: "Module 2: Knowledge Check",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What is the main purpose of SOPs?",
          options: ["To create paperwork", "To ensure consistency and quality", "To satisfy regulators", "To slow down work"],
          correctIndex: 1,
          explanation: "SOPs ensure that tasks are performed consistently and to quality standards, regardless of who does them.",
        },
        {
          question: "How often should SOPs be reviewed?",
          options: ["Never", "Annually", "Quarterly", "Daily"],
          correctIndex: 2,
          explanation: "Quarterly reviews help catch outdated procedures before they cause problems.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 6,
    title: "Module 2: SOP Worksheet",
    type: "worksheet",
    content: {
      title: "Standard Operating Procedures",
      description: "Outline your key business procedures.",
      fields: [
        { id: "coreProcedures", label: "Core Business Procedures", type: "textarea", placeholder: "List your 5-10 most important procedures:\n1. Customer onboarding\n2. Order processing\n3. Quality control...", required: true },
        { id: "qualityStandards", label: "Quality Standards", type: "textarea", placeholder: "What standards must be met?\n- Response time under 24 hours\n- Zero defects on delivery...", required: true },
        { id: "customerService", label: "Customer Service Procedures", type: "textarea", placeholder: "How do you handle:\n- Inquiries\n- Complaints\n- Returns/refunds...", required: true },
      ],
      outputTemplate: "STANDARD OPERATING PROCEDURES\n\nCore Procedures:\n{{coreProcedures}}\n\nQuality Standards:\n{{qualityStandards}}\n\nCustomer Service:\n{{customerService}}",
    } as WorksheetContent,
  },
  {
    id: 7,
    title: "Module 3: Compliance & Licensing",
    type: "lesson",
    content: {
      title: "Staying Legal and Protected",
      sections: [
        {
          heading: "Why Compliance Matters",
          text: "Non-compliance can result in fines, lawsuits, loss of business license, or criminal charges. Compliance protects you, your customers, and your business reputation.",
        },
        {
          heading: "Business Licenses",
          text: "Most businesses need: General business license (city/county), State registration, Industry-specific licenses, Professional licenses (if applicable). Requirements vary by location and industry.",
          tips: [
            "Check federal, state, and local requirements",
            "Some industries have special licensing",
            "Renew before expiration dates",
          ],
        },
        {
          heading: "Permits",
          text: "Zoning permits, Health permits (food businesses), Building permits, Signage permits, Environmental permits. Check with local authorities for your specific needs.",
        },
        {
          heading: "Insurance Requirements",
          text: "General liability, Professional liability (E&O), Workers' compensation (if employees), Property insurance, Vehicle insurance (if business vehicles), Industry-specific coverage.",
        },
        {
          heading: "Regulatory Bodies",
          text: "Know which agencies regulate your industry: IRS (taxes), State tax authority, OSHA (workplace safety), FDA (food/drugs), FTC (advertising), Industry-specific regulators.",
        },
      ],
      keyTakeaways: [
        "Compliance protects you from fines and lawsuits",
        "Requirements vary by location and industry",
        "Keep licenses and permits current",
        "Adequate insurance is essential protection",
      ],
    } as LessonContent,
  },
  {
    id: 8,
    title: "Module 3: Knowledge Check",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What can happen if your business is not compliant?",
          options: ["Nothing", "Fines, lawsuits, or loss of license", "Just a warning", "Tax benefits"],
          correctIndex: 1,
          explanation: "Non-compliance can result in serious consequences including fines, lawsuits, and losing your ability to operate.",
        },
        {
          question: "Which insurance is typically required if you have employees?",
          options: ["Life insurance", "Workers' compensation", "Pet insurance", "Travel insurance"],
          correctIndex: 1,
          explanation: "Workers' compensation insurance is required in most states if you have employees.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 9,
    title: "Module 3: Compliance Worksheet",
    type: "worksheet",
    content: {
      title: "Compliance Checklist",
      description: "Document your compliance requirements.",
      fields: [
        { id: "requiredLicenses", label: "Required Licenses", type: "textarea", placeholder: "Business license, Professional license, Industry-specific licenses...", required: true },
        { id: "permits", label: "Required Permits", type: "textarea", placeholder: "Zoning permit, Health permit, Signage permit...", required: true },
        { id: "insuranceTypes", label: "Insurance Coverage Needed", type: "textarea", placeholder: "General liability, Professional liability, Property insurance...", required: true },
        { id: "regulatoryBodies", label: "Regulatory Bodies", type: "textarea", placeholder: "IRS, State tax authority, Industry regulators...", required: true },
      ],
      outputTemplate: "COMPLIANCE REQUIREMENTS\n\nRequired Licenses:\n{{requiredLicenses}}\n\nRequired Permits:\n{{permits}}\n\nInsurance Coverage:\n{{insuranceTypes}}\n\nRegulatory Bodies:\n{{regulatoryBodies}}",
    } as WorksheetContent,
  },
  {
    id: 10,
    title: "Module 4: Contracts & Agreements",
    type: "lesson",
    content: {
      title: "Protecting Your Business with Contracts",
      sections: [
        {
          heading: "Why Written Contracts Matter",
          text: "Verbal agreements are hard to enforce. Written contracts clearly define expectations, protect both parties, and provide legal recourse if problems arise. Get everything in writing.",
        },
        {
          heading: "Essential Contract Elements",
          text: "Parties involved, Scope of work/products, Payment terms, Timeline, Warranties/guarantees, Liability limitations, Termination clauses, Dispute resolution, Signatures and dates.",
          tips: [
            "Use clear, simple language",
            "Be specific about deliverables",
            "Include what happens if things go wrong",
          ],
        },
        {
          heading: "Vendor/Supplier Contracts",
          text: "Terms for purchasing goods/services: pricing, delivery, quality standards, payment terms, return policies, exclusivity (if any), confidentiality, termination rights.",
        },
        {
          heading: "Customer Agreements",
          text: "Service agreements, Terms of service, Privacy policies, Return/refund policies, Warranties, Liability waivers. Make sure customers acknowledge and agree.",
        },
        {
          heading: "Employment Contracts",
          text: "Job description, Compensation, Benefits, Work schedule, Confidentiality, Non-compete (where legal), Termination terms, Intellectual property ownership.",
        },
      ],
      keyTakeaways: [
        "Get all agreements in writing",
        "Include essential elements in every contract",
        "Be specific about expectations and consequences",
        "Have an attorney review important contracts",
      ],
    } as LessonContent,
  },
  {
    id: 11,
    title: "Module 4: Knowledge Check",
    type: "quiz",
    content: {
      questions: [
        {
          question: "Why are written contracts better than verbal agreements?",
          options: ["They're not", "They're clearer and easier to enforce", "They cost more", "Verbal is more personal"],
          correctIndex: 1,
          explanation: "Written contracts clearly define expectations and provide legal protection if disputes arise.",
        },
        {
          question: "What should a contract include about problems?",
          options: ["Nothing", "Termination and dispute resolution clauses", "Only positive outcomes", "Ignore potential problems"],
          correctIndex: 1,
          explanation: "Good contracts address what happens when things go wrong, including how to terminate and resolve disputes.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 12,
    title: "Module 4: Contracts Worksheet",
    type: "worksheet",
    content: {
      title: "Contract Templates Needed",
      description: "Identify the contracts your business needs.",
      fields: [
        { id: "vendorContracts", label: "Vendor/Supplier Contracts", type: "textarea", placeholder: "What contracts do you need with suppliers?\n- Supply agreement\n- Service provider agreement...", required: true },
        { id: "customerAgreements", label: "Customer Agreements", type: "textarea", placeholder: "What agreements do customers need to sign?\n- Service agreement\n- Terms of service\n- Privacy policy...", required: true },
        { id: "employmentContracts", label: "Employment/Contractor Agreements", type: "textarea", placeholder: "What agreements for workers?\n- Employment contract\n- Independent contractor agreement\n- NDA...", required: true },
      ],
      outputTemplate: "CONTRACT REQUIREMENTS\n\nVendor Contracts:\n{{vendorContracts}}\n\nCustomer Agreements:\n{{customerAgreements}}\n\nEmployment Contracts:\n{{employmentContracts}}",
    } as WorksheetContent,
  },
  {
    id: 13,
    title: "Module 5: Operations Calendar",
    type: "lesson",
    content: {
      title: "Managing Deadlines and Renewals",
      sections: [
        {
          heading: "Why an Operations Calendar?",
          text: "Missing deadlines can result in penalties, lapsed licenses, or lost opportunities. An operations calendar keeps all important dates visible and ensures nothing falls through the cracks.",
        },
        {
          heading: "Annual Filings",
          text: "Annual report (state), Business license renewal, Professional license renewal, Registered agent renewal, Corporate minutes (if applicable). Set reminders 30-60 days before due dates.",
          tips: [
            "Create calendar reminders with buffer time",
            "Keep copies of all filings",
            "Track confirmation numbers",
          ],
        },
        {
          heading: "Tax Deadlines",
          text: "Quarterly estimated taxes, Annual tax returns, Payroll tax deposits, Sales tax filings, 1099s (January), W-2s (January). Missing tax deadlines triggers penalties and interest.",
        },
        {
          heading: "Insurance Renewals",
          text: "Review coverage annually, Shop for better rates, Update coverage as business grows, Don't let policies lapse. Set reminders 60 days before renewal.",
        },
        {
          heading: "Regular Reviews",
          text: "Monthly: Financial review, KPI tracking. Quarterly: SOP review, compliance check. Annually: Strategic planning, insurance review, contract renewals.",
        },
      ],
      keyTakeaways: [
        "Track all deadlines in one calendar",
        "Set reminders with buffer time",
        "Missing deadlines has real consequences",
        "Schedule regular business reviews",
      ],
    } as LessonContent,
  },
  {
    id: 14,
    title: "Module 5: Knowledge Check",
    type: "quiz",
    content: {
      questions: [
        {
          question: "How far in advance should you set reminders for important deadlines?",
          options: ["Day of", "1 week", "30-60 days", "1 year"],
          correctIndex: 2,
          explanation: "30-60 days gives you time to gather documents, make payments, or address issues before the deadline.",
        },
        {
          question: "How often should you review your SOPs?",
          options: ["Never", "Daily", "Quarterly", "Every 5 years"],
          correctIndex: 2,
          explanation: "Quarterly reviews help catch outdated procedures and keep operations running smoothly.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 15,
    title: "Module 5: Calendar Worksheet",
    type: "worksheet",
    content: {
      title: "Operations Calendar",
      description: "Document your key business deadlines.",
      fields: [
        { id: "annualFilings", label: "Annual Filings & Renewals", type: "textarea", placeholder: "Annual report: [Month]\nBusiness license: [Month]\nProfessional license: [Month]...", required: true },
        { id: "taxDeadlines", label: "Tax Deadlines", type: "textarea", placeholder: "Quarterly estimates: Apr 15, Jun 15, Sep 15, Jan 15\nAnnual return: [Date]\nPayroll: [Frequency]...", required: true },
        { id: "renewalDates", label: "Insurance & Contract Renewals", type: "textarea", placeholder: "General liability: [Month]\nProfessional liability: [Month]\nKey contracts: [Dates]...", required: true },
        { id: "reviewSchedule", label: "Regular Review Schedule", type: "textarea", placeholder: "Monthly: Financial review\nQuarterly: SOP review, compliance check\nAnnually: Strategic planning...", required: true },
      ],
      outputTemplate: "OPERATIONS CALENDAR\n\nAnnual Filings:\n{{annualFilings}}\n\nTax Deadlines:\n{{taxDeadlines}}\n\nRenewals:\n{{renewalDates}}\n\nReview Schedule:\n{{reviewSchedule}}",
    } as WorksheetContent,
  },
  {
    id: 16,
    title: "Module 6: Operations Manual Assembly",
    type: "lesson",
    content: {
      title: "Putting It All Together",
      sections: [
        {
          heading: "What is an Operations Manual?",
          text: "A comprehensive document that contains everything someone needs to know to run your business. It combines your org structure, SOPs, compliance info, contracts, and calendar into one reference.",
        },
        {
          heading: "Operations Manual Contents",
          text: "Company overview and mission, Organizational structure, Roles and responsibilities, Standard operating procedures, Compliance requirements, Contract templates, Operations calendar, Emergency procedures, Contact information.",
        },
        {
          heading: "Benefits of an Operations Manual",
          text: "Easier training, Consistent operations, Business continuity (if you're unavailable), Increased business value, Scalability, Reduced errors and confusion.",
          tips: [
            "Keep it organized and searchable",
            "Update regularly",
            "Make it accessible to those who need it",
          ],
        },
        {
          heading: "Digital vs Physical",
          text: "Digital manuals are easier to update and search. Consider cloud storage for accessibility. Keep a backup. Some businesses also maintain physical copies for emergencies.",
        },
        {
          heading: "Maintaining Your Manual",
          text: "Assign someone to maintain it, Review quarterly, Update when procedures change, Version control all changes, Train team on using it.",
        },
      ],
      keyTakeaways: [
        "Operations manual = complete business reference",
        "Enables training, continuity, and scalability",
        "Keep it updated and accessible",
        "Review and maintain regularly",
      ],
    } as LessonContent,
  },
  {
    id: 17,
    title: "Module 6: Final Assessment",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What is the main purpose of an operations manual?",
          options: ["To impress customers", "To provide a complete reference for running the business", "To satisfy regulators", "To replace employees"],
          correctIndex: 1,
          explanation: "An operations manual is a comprehensive reference that contains everything needed to run your business consistently.",
        },
        {
          question: "How often should an operations manual be reviewed?",
          options: ["Never", "Quarterly", "Every 10 years", "Only when problems occur"],
          correctIndex: 1,
          explanation: "Quarterly reviews ensure the manual stays current and useful.",
        },
        {
          question: "What increases when you have documented operations?",
          options: ["Confusion", "Business value", "Errors", "Costs"],
          correctIndex: 1,
          explanation: "Documented operations make your business more valuable because it can run without depending solely on you.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 18,
    title: "Module 6: Final Summary",
    type: "worksheet",
    content: {
      title: "Operations Manual Summary",
      description: "Review and confirm your operations documentation is complete.",
      fields: [
        { id: "manualSections", label: "Sections Completed", type: "textarea", placeholder: "Check off completed sections:\n☑ Organizational Structure\n☑ SOPs\n☑ Compliance\n☑ Contracts\n☑ Calendar", required: true },
        { id: "nextSteps", label: "Next Steps", type: "textarea", placeholder: "What needs to be done next?\n- Finalize specific SOPs\n- Obtain licenses\n- Draft contracts...", required: true },
      ],
      outputTemplate: "OPERATIONS MANUAL STATUS\n\nCompleted Sections:\n{{manualSections}}\n\nNext Steps:\n{{nextSteps}}\n\nCongratulations! You have completed the Entity Operations Course.",
    } as WorksheetContent,
  },
];

interface OperationsCourseProps {
  onComplete: (data: OperationsData, tokensEarned: number) => void;
  onExit: () => void;
}

export default function OperationsCourse({ onComplete, onExit }: OperationsCourseProps) {
  const [currentModule, setCurrentModule] = useState(0);
  const [operationsData, setOperationsData] = useState<OperationsData>({
    orgStructure: "",
    roles: "",
    responsibilities: "",
    reportingLines: "",
    coreProcedures: "",
    qualityStandards: "",
    customerService: "",
    requiredLicenses: "",
    permits: "",
    insuranceTypes: "",
    regulatoryBodies: "",
    vendorContracts: "",
    customerAgreements: "",
    employmentContracts: "",
    annualFilings: "",
    taxDeadlines: "",
    renewalDates: "",
    reviewSchedule: "",
  });
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  const module = operationsModules[currentModule];
  const progress = ((currentModule + 1) / operationsModules.length) * 100;

  const handleWorksheetChange = (fieldId: string, value: string) => {
    setOperationsData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const submitQuiz = () => {
    const quizContent = module.content as QuizContent;
    let correct = 0;
    quizContent.questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / quizContent.questions.length) * 100);
    const tokens = correct * 10;
    setQuizScore(score);
    setTotalTokens((prev) => prev + tokens);
    setShowQuizResults(true);
    toast.success(`Quiz Complete! ${correct}/${quizContent.questions.length} correct. +${tokens} tokens`);
  };

  const nextModule = () => {
    if (!completedModules.includes(currentModule)) {
      setCompletedModules([...completedModules, currentModule]);
    }
    
    if (currentModule < operationsModules.length - 1) {
      setCurrentModule(currentModule + 1);
      setQuizAnswers([]);
      setShowQuizResults(false);
    } else {
      onComplete(operationsData, totalTokens + 50);
    }
  };

  const prevModule = () => {
    if (currentModule > 0) {
      setCurrentModule(currentModule - 1);
      setQuizAnswers([]);
      setShowQuizResults(false);
    }
  };

  const renderLesson = (content: LessonContent) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-accent" />
        <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
      </div>

      {content.sections.map((section, i) => (
        <Card key={i} className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">{section.heading}</h3>
          <p className="text-muted-foreground leading-relaxed">{section.text}</p>
          {section.tips && (
            <div className="mt-4 p-4 bg-accent/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-accent" />
                <span className="font-semibold text-foreground">Tips</span>
              </div>
              <ul className="space-y-1">
                {section.tips.map((tip, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-accent">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}

      <Card className="p-6 bg-emerald-500/5 border-emerald-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-foreground">Key Takeaways</span>
        </div>
        <ul className="space-y-2">
          {content.keyTakeaways.map((takeaway, i) => (
            <li key={i} className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
              {takeaway}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );

  const renderQuiz = (content: QuizContent) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-accent" />
        <h2 className="text-2xl font-bold text-foreground">Knowledge Check</h2>
      </div>

      {showQuizResults ? (
        <div className="space-y-4">
          <Card className="p-6 text-center">
            <Trophy className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Quiz Complete!</h3>
            <p className="text-lg text-muted-foreground">Score: {quizScore}%</p>
          </Card>

          {content.questions.map((q, i) => (
            <Card key={i} className={`p-6 ${quizAnswers[i] === q.correctIndex ? 'border-green-500' : 'border-red-500'} border-2`}>
              <p className="font-semibold text-foreground mb-3">{q.question}</p>
              <div className="space-y-2 mb-4">
                {q.options.map((opt, j) => (
                  <div
                    key={j}
                    className={`p-3 rounded-lg ${
                      j === q.correctIndex
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : quizAnswers[i] === j
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                        : 'bg-secondary'
                    }`}
                  >
                    {opt}
                    {j === q.correctIndex && ' ✓'}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic">{q.explanation}</p>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {content.questions.map((q, i) => (
            <Card key={i} className="p-6">
              <p className="font-semibold text-foreground mb-4">
                {i + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, j) => (
                  <Button
                    key={j}
                    variant={quizAnswers[i] === j ? "default" : "outline"}
                    className="w-full justify-start text-left min-h-[48px] p-4"
                    onClick={() => handleQuizAnswer(i, j)}
                  >
                    <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3 flex-shrink-0">
                      {String.fromCharCode(65 + j)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </Button>
                ))}
              </div>
            </Card>
          ))}

          <Button
            className="w-full min-h-[48px]"
            onClick={submitQuiz}
            disabled={quizAnswers.length < content.questions.length}
          >
            Submit Quiz
          </Button>
        </div>
      )}
    </div>
  );

  const renderWorksheet = (content: WorksheetContent) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-8 h-8 text-accent" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
          <p className="text-muted-foreground">{content.description}</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {content.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(operationsData as any)[field.id] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  rows={5}
                />
              ) : (
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(operationsData as any)[field.id] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  className="min-h-[48px]"
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {Object.values(operationsData).some((v) => v) && (
        <Card className="p-6 bg-emerald-500/5 border-emerald-500/20">
          <h3 className="font-semibold text-foreground mb-3">Preview</h3>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
            {content.outputTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => (operationsData as any)[key] || `[${key}]`)}
          </pre>
        </Card>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit} className="gap-2 min-h-[48px]">
          <ArrowLeft className="w-5 h-5" />
          Exit Course
        </Button>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            Module {currentModule + 1} of {operationsModules.length}
          </p>
          <p className="font-bold text-emerald-600">{totalTokens} tokens earned</p>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-foreground">{module.title}</h1>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Module Content */}
      {module.type === "lesson" && renderLesson(module.content as LessonContent)}
      {module.type === "quiz" && renderQuiz(module.content as QuizContent)}
      {module.type === "worksheet" && renderWorksheet(module.content as WorksheetContent)}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={prevModule}
          disabled={currentModule === 0}
          className="gap-2 min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          onClick={nextModule}
          disabled={module.type === "quiz" && !showQuizResults}
          className="gap-2 min-h-[48px]"
        >
          {currentModule === operationsModules.length - 1 ? "Complete Course" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
