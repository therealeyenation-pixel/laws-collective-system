import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  BookOpen,
  FileText,
  Download,
  Trophy,
  Lightbulb,
  Target,
  ScrollText,
  Users,
  Scale,
  Briefcase,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

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
    type: "text" | "textarea" | "select";
    placeholder?: string;
    options?: { value: string; label: string; disabled?: boolean }[] | string[];
    required?: boolean;
  }[];
  outputTemplate: string;
}

interface ContractsData {
  contractTypes: string;
  serviceAgreements: string;
  vendorContracts: string;
  employmentContracts: string;
  partnershipAgreements: string;
  ndaTemplates: string;
  paymentTerms: string;
  terminationClauses: string;
  disputeResolution: string;
  confidentiality: string;
  intellectualProperty: string;
  liabilityLimitations: string;
  connectedEntity: string;
}

interface ContractsCourseProps {
  onExit: () => void;
  onComplete: (tokens: number) => void;
  connectedEntity?: { name: string; type: string };
}

const contractsModules: CourseModule[] = [
  {
    id: 1,
    title: "Module 1: Contract Law Fundamentals",
    type: "lesson",
    content: {
      title: "Understanding Contract Law Basics",
      sections: [
        {
          heading: "What is a Contract?",
          text: "A contract is a legally binding agreement between two or more parties that creates mutual obligations enforceable by law. For a contract to be valid, it must have: offer, acceptance, consideration (something of value exchanged), legal capacity of parties, and legal purpose.",
          tips: [
            "Always get contracts in writing",
            "Ensure all parties understand the terms",
            "Keep copies of all signed contracts",
          ],
        },
        {
          heading: "Types of Business Contracts",
          text: "Common business contracts include: Service Agreements (define services provided), Vendor Contracts (purchasing goods/services), Employment Contracts (hiring terms), Partnership Agreements (business partnerships), NDAs (protect confidential information), and Licensing Agreements (intellectual property use).",
          tips: [
            "Use the right contract type for each situation",
            "Customize templates for your specific needs",
            "Have an attorney review important contracts",
          ],
        },
        {
          heading: "Essential Contract Elements",
          text: "Every contract should include: parties' names and contact info, scope of work or deliverables, payment terms and amounts, timeline and deadlines, termination clauses, dispute resolution process, signatures and dates.",
          tips: [
            "Be specific about deliverables",
            "Include clear payment milestones",
            "Define what constitutes breach of contract",
          ],
        },
      ],
      keyTakeaways: [
        "Contracts require offer, acceptance, and consideration",
        "Different contract types serve different purposes",
        "Written contracts protect all parties involved",
        "Essential elements must be clearly defined",
      ],
    },
  },
  {
    id: 2,
    title: "Module 1 Quiz",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What are the essential elements for a valid contract?",
          options: [
            "Only a signature is needed",
            "Offer, acceptance, consideration, capacity, and legal purpose",
            "Just a handshake agreement",
            "Only payment is required",
          ],
          correctIndex: 1,
          explanation: "A valid contract requires offer, acceptance, consideration (exchange of value), legal capacity of parties, and a legal purpose.",
        },
        {
          question: "Why should business contracts be in writing?",
          options: [
            "It's not necessary",
            "Only for large transactions",
            "To create clear evidence of terms and protect all parties",
            "Only for government contracts",
          ],
          correctIndex: 2,
          explanation: "Written contracts provide clear evidence of agreed terms and protect all parties in case of disputes.",
        },
        {
          question: "What is an NDA used for?",
          options: [
            "Hiring employees",
            "Protecting confidential information",
            "Purchasing goods",
            "Forming partnerships",
          ],
          correctIndex: 1,
          explanation: "A Non-Disclosure Agreement (NDA) protects confidential information shared between parties.",
        },
      ],
    },
  },
  {
    id: 3,
    title: "Module 2: Service Agreements",
    type: "lesson",
    content: {
      title: "Creating Effective Service Agreements",
      sections: [
        {
          heading: "Service Agreement Basics",
          text: "A service agreement defines the relationship between a service provider and client. It outlines what services will be provided, how they'll be delivered, payment terms, and expectations for both parties. This is crucial for consultants, freelancers, and service-based businesses.",
          tips: [
            "Clearly define the scope of services",
            "Include specific deliverables and timelines",
            "Address what happens if scope changes",
          ],
        },
        {
          heading: "Key Clauses to Include",
          text: "Essential clauses: Scope of Work (detailed description), Payment Terms (rates, schedule, method), Timeline (start date, milestones, completion), Revisions Policy (how many, additional costs), Ownership/IP Rights (who owns the work), Confidentiality (protecting client info), Termination (how to end the agreement).",
          tips: [
            "Be specific about revision limits",
            "Clarify intellectual property ownership upfront",
            "Include a kill fee for early termination",
          ],
        },
        {
          heading: "Protecting Your Business",
          text: "Include protective clauses: Limitation of Liability (cap on damages), Indemnification (protection from third-party claims), Force Majeure (unforeseeable circumstances), Dispute Resolution (mediation/arbitration before litigation), Governing Law (which state's laws apply).",
          tips: [
            "Limit liability to the contract value",
            "Require mediation before lawsuits",
            "Specify your state's laws govern the contract",
          ],
        },
      ],
      keyTakeaways: [
        "Service agreements protect both provider and client",
        "Scope of work must be clearly defined",
        "Include protective clauses for your business",
        "Payment terms should be specific and clear",
      ],
    },
  },
  {
    id: 4,
    title: "Service Agreement Worksheet",
    type: "worksheet",
    content: {
      title: "Service Agreement Builder",
      description: "Create a comprehensive service agreement for your business. This will generate a template you can customize for each client.",
      fields: [
        {
          id: "serviceDescription",
          label: "Describe Your Services",
          type: "textarea",
          placeholder: "Detailed description of services you provide...",
          required: true,
        },
        {
          id: "deliverables",
          label: "Specific Deliverables",
          type: "textarea",
          placeholder: "List all deliverables the client will receive...",
          required: true,
        },
        {
          id: "paymentTerms",
          label: "Payment Terms",
          type: "textarea",
          placeholder: "Payment amount, schedule, accepted methods, late fees...",
          required: true,
        },
        {
          id: "timeline",
          label: "Project Timeline",
          type: "textarea",
          placeholder: "Start date, milestones, expected completion...",
          required: true,
        },
        {
          id: "revisionPolicy",
          label: "Revision Policy",
          type: "textarea",
          placeholder: "Number of revisions included, cost for additional...",
          required: true,
        },
        {
          id: "ipOwnership",
          label: "Intellectual Property Ownership",
          type: "select",
          options: [
            "Client owns all work upon full payment",
            "Provider retains ownership, client gets license",
            "Joint ownership",
            "Work for hire - client owns from creation",
          ],
          required: true,
        },
      ],
      outputTemplate: "Service Agreement Template",
    },
  },
  {
    id: 5,
    title: "Module 3: Vendor & Employment Contracts",
    type: "lesson",
    content: {
      title: "Managing Vendor and Employment Relationships",
      sections: [
        {
          heading: "Vendor Contracts",
          text: "Vendor contracts govern your relationship with suppliers and service providers. Key elements include: product/service specifications, pricing and payment terms, delivery schedules, quality standards, warranty provisions, and termination rights.",
          tips: [
            "Negotiate favorable payment terms",
            "Include quality guarantees",
            "Define clear delivery expectations",
          ],
        },
        {
          heading: "Employment Contracts",
          text: "Employment contracts define the relationship between employer and employee. Include: job title and duties, compensation and benefits, work schedule, confidentiality obligations, non-compete clauses (if applicable), termination procedures, and at-will employment status.",
          tips: [
            "Be clear about job responsibilities",
            "Include confidentiality provisions",
            "Consult employment laws in your state",
          ],
        },
        {
          heading: "Independent Contractor Agreements",
          text: "When hiring contractors instead of employees, use an Independent Contractor Agreement. This should clarify: contractor status (not employee), scope of work, payment terms, ownership of work product, no benefits provided, and tax responsibilities.",
          tips: [
            "Clearly establish contractor status",
            "Don't control how work is performed",
            "Contractors handle their own taxes",
          ],
        },
      ],
      keyTakeaways: [
        "Vendor contracts protect your supply chain",
        "Employment contracts must comply with labor laws",
        "Contractor agreements differ from employment contracts",
        "Clear terms prevent misunderstandings",
      ],
    },
  },
  {
    id: 6,
    title: "Module 3 Quiz",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What distinguishes an independent contractor from an employee?",
          options: [
            "Contractors work fewer hours",
            "Contractors control how they perform work and handle their own taxes",
            "Contractors always work remotely",
            "There is no difference",
          ],
          correctIndex: 1,
          explanation: "Independent contractors control how they perform work, handle their own taxes, and don't receive employee benefits.",
        },
        {
          question: "What should a vendor contract include?",
          options: [
            "Only the price",
            "Product specs, pricing, delivery, quality standards, and termination rights",
            "Just a handshake",
            "Only delivery dates",
          ],
          correctIndex: 1,
          explanation: "Vendor contracts should comprehensively cover specifications, pricing, delivery, quality, warranties, and termination.",
        },
        {
          question: "Why include a non-compete clause in employment contracts?",
          options: [
            "To prevent employees from ever working again",
            "To protect business interests and trade secrets",
            "It's legally required",
            "To reduce employee wages",
          ],
          correctIndex: 1,
          explanation: "Non-compete clauses protect business interests and trade secrets, though they must be reasonable in scope and duration.",
        },
      ],
    },
  },
  {
    id: 7,
    title: "Vendor & Employment Worksheet",
    type: "worksheet",
    content: {
      title: "Vendor & Employment Contract Builder",
      description: "Create templates for vendor relationships and employment agreements.",
      fields: [
        {
          id: "vendorRequirements",
          label: "Vendor Requirements",
          type: "textarea",
          placeholder: "What do you need from vendors? Products, services, quality standards...",
          required: true,
        },
        {
          id: "vendorPaymentTerms",
          label: "Vendor Payment Terms",
          type: "textarea",
          placeholder: "Net 30, Net 60, payment on delivery, etc...",
          required: true,
        },
        {
          id: "employeeRoles",
          label: "Employee Roles Needed",
          type: "textarea",
          placeholder: "List positions and key responsibilities...",
          required: true,
        },
        {
          id: "compensationStructure",
          label: "Compensation Structure",
          type: "textarea",
          placeholder: "Salary ranges, benefits, bonuses...",
          required: true,
        },
        {
          id: "confidentialityNeeds",
          label: "Confidentiality Requirements",
          type: "textarea",
          placeholder: "What information must employees keep confidential?",
          required: true,
        },
        {
          id: "nonCompeteScope",
          label: "Non-Compete Scope (if applicable)",
          type: "textarea",
          placeholder: "Geographic area, time period, restricted activities...",
          required: false,
        },
      ],
      outputTemplate: "Vendor & Employment Templates",
    },
  },
  {
    id: 8,
    title: "Module 4: NDAs & Partnership Agreements",
    type: "lesson",
    content: {
      title: "Protecting Information and Formalizing Partnerships",
      sections: [
        {
          heading: "Non-Disclosure Agreements (NDAs)",
          text: "NDAs protect confidential information shared between parties. Types include: Unilateral (one party shares), Mutual (both parties share), and Multilateral (multiple parties). Key elements: definition of confidential information, obligations of receiving party, exclusions, term/duration, and remedies for breach.",
          tips: [
            "Be specific about what's confidential",
            "Set reasonable time limits",
            "Include clear exclusions",
          ],
        },
        {
          heading: "Partnership Agreements",
          text: "Partnership agreements formalize business partnerships. Essential elements: partner contributions (capital, skills), profit/loss distribution, management responsibilities, decision-making process, dispute resolution, and exit/dissolution procedures.",
          tips: [
            "Define roles clearly from the start",
            "Plan for disagreements",
            "Include buy-out provisions",
          ],
        },
        {
          heading: "Joint Venture Agreements",
          text: "Joint ventures are temporary partnerships for specific projects. Include: purpose and scope, contributions from each party, profit sharing, management structure, intellectual property rights, confidentiality, and termination conditions.",
          tips: [
            "Set clear project boundaries",
            "Define IP ownership upfront",
            "Plan the exit strategy",
          ],
        },
      ],
      keyTakeaways: [
        "NDAs protect your confidential business information",
        "Partnership agreements prevent future disputes",
        "Joint ventures need clear scope and exit plans",
        "All agreements should include dispute resolution",
      ],
    },
  },
  {
    id: 9,
    title: "NDA & Partnership Worksheet",
    type: "worksheet",
    content: {
      title: "NDA & Partnership Agreement Builder",
      description: "Create templates for protecting information and formalizing partnerships.",
      fields: [
        {
          id: "confidentialInfo",
          label: "Confidential Information to Protect",
          type: "textarea",
          placeholder: "Trade secrets, client lists, financial data, processes...",
          required: true,
        },
        {
          id: "ndaDuration",
          label: "NDA Duration",
          type: "select",
          options: [
            "1 year",
            "2 years",
            "3 years",
            "5 years",
            "Perpetual for trade secrets",
          ],
          required: true,
        },
        {
          id: "partnerContributions",
          label: "Partner Contributions",
          type: "textarea",
          placeholder: "What each partner brings: capital, skills, resources...",
          required: true,
        },
        {
          id: "profitDistribution",
          label: "Profit/Loss Distribution",
          type: "textarea",
          placeholder: "How profits and losses will be split among partners...",
          required: true,
        },
        {
          id: "decisionMaking",
          label: "Decision-Making Process",
          type: "textarea",
          placeholder: "How decisions are made, voting rights, veto powers...",
          required: true,
        },
        {
          id: "exitStrategy",
          label: "Exit/Buy-Out Provisions",
          type: "textarea",
          placeholder: "How partners can exit, buy-out terms, valuation method...",
          required: true,
        },
      ],
      outputTemplate: "NDA & Partnership Templates",
    },
  },
  {
    id: 10,
    title: "Module 5: Contract Management & Enforcement",
    type: "lesson",
    content: {
      title: "Managing and Enforcing Your Contracts",
      sections: [
        {
          heading: "Contract Management Best Practices",
          text: "Effective contract management includes: centralized storage (digital filing system), tracking key dates (renewals, deadlines), regular reviews, version control, and access management. Use contract management software or a well-organized system to track all agreements.",
          tips: [
            "Create a contract calendar",
            "Set reminders for renewals",
            "Keep signed originals secure",
          ],
        },
        {
          heading: "Handling Breach of Contract",
          text: "When a contract is breached: document the breach, review contract terms, send formal notice, attempt resolution, consider mediation/arbitration, and pursue legal action if necessary. Always follow the dispute resolution process outlined in your contract.",
          tips: [
            "Document everything in writing",
            "Follow contract dispute procedures",
            "Consider cost vs. benefit of litigation",
          ],
        },
        {
          heading: "Contract Amendments and Renewals",
          text: "Contracts may need updates over time. Use formal amendments (signed by all parties) for changes. For renewals: review terms before auto-renewal, negotiate improvements, and document any changes. Never make verbal changes to written contracts.",
          tips: [
            "Put all changes in writing",
            "Review before auto-renewals",
            "Keep amendment history",
          ],
        },
      ],
      keyTakeaways: [
        "Organize and track all contracts systematically",
        "Follow proper procedures for breach situations",
        "Document all contract changes formally",
        "Review contracts before renewals",
      ],
    },
  },
  {
    id: 11,
    title: "Final Quiz",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What is the best practice for managing contracts?",
          options: [
            "Keep them in a drawer",
            "Centralized storage, tracking dates, regular reviews",
            "Only review when there's a problem",
            "Let contracts auto-renew without review",
          ],
          correctIndex: 1,
          explanation: "Effective contract management requires centralized storage, tracking key dates, and regular reviews.",
        },
        {
          question: "What should you do first when a contract is breached?",
          options: [
            "Immediately file a lawsuit",
            "Ignore it",
            "Document the breach and review contract terms",
            "Stop all communication",
          ],
          correctIndex: 2,
          explanation: "First document the breach and review contract terms to understand your rights and the proper dispute resolution process.",
        },
        {
          question: "How should contract changes be made?",
          options: [
            "Verbal agreement is fine",
            "Email is sufficient",
            "Formal written amendments signed by all parties",
            "Just make the changes",
          ],
          correctIndex: 2,
          explanation: "Contract changes should be made through formal written amendments signed by all parties to be legally binding.",
        },
      ],
    },
  },
  {
    id: 12,
    title: "Complete Contract Package",
    type: "worksheet",
    content: {
      title: "Final Contract Package Builder",
      description: "Compile your complete contract package with all templates and policies. This will be recorded to the LuvLedger blockchain.",
      fields: [
        {
          id: "contractTypes",
          label: "Contract Types You Need",
          type: "textarea",
          placeholder: "List all contract types your business requires...",
          required: true,
        },
        {
          id: "disputeResolution",
          label: "Dispute Resolution Preference",
          type: "select",
          options: [
            "Mediation first, then arbitration",
            "Arbitration only",
            "Litigation in court",
            "Negotiation, mediation, then litigation",
          ],
          required: true,
        },
        {
          id: "governingLaw",
          label: "Governing Law (State)",
          type: "text",
          placeholder: "Which state's laws govern your contracts?",
          required: true,
        },
        {
          id: "liabilityLimit",
          label: "Liability Limitation Approach",
          type: "textarea",
          placeholder: "How you limit liability in contracts...",
          required: true,
        },
        {
          id: "managementSystem",
          label: "Contract Management System",
          type: "textarea",
          placeholder: "How you will store, track, and manage contracts...",
          required: true,
        },
        {
          id: "reviewSchedule",
          label: "Contract Review Schedule",
          type: "textarea",
          placeholder: "How often you will review contracts, who is responsible...",
          required: true,
        },
      ],
      outputTemplate: "Complete Contract Package",
    },
  },
];

export default function ContractsCourse({ onExit, onComplete, connectedEntity }: ContractsCourseProps) {
  const [currentModule, setCurrentModule] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [worksheetData, setWorksheetData] = useState<ContractsData>({
    contractTypes: "",
    serviceAgreements: "",
    vendorContracts: "",
    employmentContracts: "",
    partnershipAgreements: "",
    ndaTemplates: "",
    paymentTerms: "",
    terminationClauses: "",
    disputeResolution: "",
    confidentiality: "",
    intellectualProperty: "",
    liabilityLimitations: "",
    connectedEntity: connectedEntity?.name || "",
  });
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const [tokensEarned, setTokensEarned] = useState(0);

  const awardTokens = trpc.tokenEconomy.awardTokens.useMutation();

  const module = contractsModules[currentModule];
  const progress = ((currentModule + 1) / contractsModules.length) * 100;

  const handleNext = () => {
    if (currentModule < contractsModules.length - 1) {
      setCompletedModules((prev) => new Set(Array.from(prev).concat([currentModule])));
      setCurrentModule(currentModule + 1);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  const handlePrevious = () => {
    if (currentModule > 0) {
      setCurrentModule(currentModule - 1);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    if (!quizSubmitted) {
      setQuizAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
    }
  };

  const handleQuizSubmit = () => {
    const quizContent = module.content as QuizContent;
    let correct = 0;
    quizContent.questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) correct++;
    });
    
    const earnedTokens = correct * 5;
    setTokensEarned((prev) => prev + earnedTokens);
    setQuizSubmitted(true);
    
    awardTokens.mutate({
      amount: String(earnedTokens),
      reason: "simulator_completion",
    });
    
    toast.success(`Quiz Complete! ${correct}/${quizContent.questions.length} correct. Earned ${earnedTokens} tokens!`);
  };

  const handleWorksheetChange = (fieldId: string, value: string) => {
    setWorksheetData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleCourseComplete = () => {
    const totalTokens = tokensEarned + 50; // Bonus for completion
    
    awardTokens.mutate({
      amount: "50",
      reason: "simulator_completion",
    });
    
    toast.success(`Congratulations! Course Complete! Total tokens earned: ${totalTokens}. Recorded to LuvLedger blockchain.`);
    onComplete(totalTokens);
  };

  const downloadContractPackage = () => {
    let content = "# COMPLETE CONTRACT PACKAGE\n\n";
    content += `Generated: ${new Date().toLocaleDateString()}\n`;
    content += `Connected Entity: ${worksheetData.connectedEntity || connectedEntity?.name || "Not specified"}\n`;
    content += "**Recorded to LuvLedger Blockchain**\n\n";
    content += "---\n\n";
    
    content += "## CONTRACT TYPES NEEDED\n\n";
    content += `${worksheetData.contractTypes || "[To be completed]"}\n\n`;
    
    content += "## SERVICE AGREEMENTS\n\n";
    content += `${worksheetData.serviceAgreements || "[To be completed]"}\n\n`;
    
    content += "## VENDOR CONTRACTS\n\n";
    content += `${worksheetData.vendorContracts || "[To be completed]"}\n\n`;
    
    content += "## EMPLOYMENT CONTRACTS\n\n";
    content += `${worksheetData.employmentContracts || "[To be completed]"}\n\n`;
    
    content += "## PARTNERSHIP AGREEMENTS\n\n";
    content += `${worksheetData.partnershipAgreements || "[To be completed]"}\n\n`;
    
    content += "## NDA TEMPLATES\n\n";
    content += `${worksheetData.ndaTemplates || "[To be completed]"}\n\n`;
    
    content += "## STANDARD TERMS\n\n";
    content += `### Payment Terms\n${worksheetData.paymentTerms || "[To be completed]"}\n\n`;
    content += `### Termination Clauses\n${worksheetData.terminationClauses || "[To be completed]"}\n\n`;
    content += `### Dispute Resolution\n${worksheetData.disputeResolution || "[To be completed]"}\n\n`;
    content += `### Confidentiality\n${worksheetData.confidentiality || "[To be completed]"}\n\n`;
    content += `### Intellectual Property\n${worksheetData.intellectualProperty || "[To be completed]"}\n\n`;
    content += `### Liability Limitations\n${worksheetData.liabilityLimitations || "[To be completed]"}\n\n`;
    
    content += "---\n\n";
    content += "*Generated through The L.A.W.S. Collective, LLC Contracts Workshop*\n";
    content += "*All records immutably stored on LuvLedger blockchain*\n";

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contract-package-${new Date().toISOString().split("T")[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Contract Package downloaded!");
  };

  const renderLesson = (content: LessonContent) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-indigo-600" />
        <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
      </div>

      {content.sections.map((section, idx) => (
        <Card key={idx} className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            {section.heading}
          </h3>
          <p className="text-muted-foreground mb-4 leading-relaxed">{section.text}</p>
          {section.tips && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <p className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Pro Tips:
              </p>
              <ul className="space-y-1">
                {section.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                    <span className="text-indigo-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}

      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-indigo-900/20 dark:to-emerald-900/20">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Key Takeaways
        </h3>
        <ul className="space-y-2">
          {content.keyTakeaways.map((takeaway, idx) => (
            <li key={idx} className="flex items-start gap-2 text-muted-foreground">
              <span className="text-green-600 mt-1">✓</span>
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
        <FileText className="w-8 h-8 text-indigo-600" />
        <h2 className="text-2xl font-bold text-foreground">Knowledge Check</h2>
      </div>

      {content.questions.map((q, qIdx) => (
        <Card key={qIdx} className="p-6">
          <p className="font-semibold text-foreground mb-4">
            {qIdx + 1}. {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((option, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleQuizAnswer(qIdx, oIdx)}
                disabled={quizSubmitted}
                className={`w-full text-left p-4 rounded-lg border transition-colors min-h-[48px] ${
                  quizSubmitted
                    ? oIdx === q.correctIndex
                      ? "bg-green-100 border-green-500 dark:bg-green-900/30"
                      : quizAnswers[qIdx] === oIdx
                      ? "bg-red-100 border-red-500 dark:bg-red-900/30"
                      : "bg-secondary"
                    : quizAnswers[qIdx] === oIdx
                    ? "bg-indigo-100 border-indigo-500 dark:bg-indigo-900/30"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <span className="font-semibold mr-2">
                  {String.fromCharCode(65 + oIdx)}.
                </span>
                {option}
              </button>
            ))}
          </div>
          {quizSubmitted && (
            <div className={`mt-4 p-4 rounded-lg ${
              quizAnswers[qIdx] === q.correctIndex
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-amber-50 dark:bg-amber-900/20"
            }`}>
              <p className="text-sm">
                <strong>Explanation:</strong> {q.explanation}
              </p>
            </div>
          )}
        </Card>
      ))}

      {!quizSubmitted && Object.keys(quizAnswers).length === content.questions.length && (
        <Button onClick={handleQuizSubmit} className="w-full min-h-[48px]">
          Submit Quiz
        </Button>
      )}
    </div>
  );

  const renderWorksheet = (content: WorksheetContent) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <ScrollText className="w-8 h-8 text-indigo-600" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
          <p className="text-muted-foreground">{content.description}</p>
        </div>
      </div>

      {connectedEntity && (
        <Card className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200">
          <p className="text-sm text-indigo-800 dark:text-indigo-200">
            <strong>Connected Entity:</strong> {connectedEntity.name} ({connectedEntity.type})
          </p>
        </Card>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          {content.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-foreground font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.type === "text" && (
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(worksheetData as any)[field.id] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  className="min-h-[48px]"
                />
              )}
              {field.type === "textarea" && (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(worksheetData as any)[field.id] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  rows={4}
                />
              )}
              {field.type === "select" && field.options && (
                <Select
                  value={(worksheetData as any)[field.id] || ""}
                  onValueChange={(value) => handleWorksheetChange(field.id, value)}
                >
                  <SelectTrigger className="min-h-[48px]">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => {
                      const optionValue = typeof option === "string" ? option : option.value;
                      const optionLabel = typeof option === "string" ? option : option.label;
                      const isDisabled = typeof option === "object" && option.disabled;
                      return (
                        <SelectItem 
                          key={optionValue} 
                          value={optionValue}
                          disabled={isDisabled}
                        >
                          {optionLabel}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const isLastModule = currentModule === contractsModules.length - 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit} className="gap-2 min-h-[48px]">
          <ArrowLeft className="w-4 h-4" />
          Exit Course
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-semibold">{tokensEarned} tokens</span>
          </div>
          <Button variant="outline" onClick={downloadContractPackage} className="gap-2 min-h-[48px]">
            <Download className="w-4 h-4" />
            Download Package
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">{module.title}</span>
          <span className="text-sm text-muted-foreground">
            {currentModule + 1} of {contractsModules.length}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Content */}
      {module.type === "lesson" && renderLesson(module.content as LessonContent)}
      {module.type === "quiz" && renderQuiz(module.content as QuizContent)}
      {module.type === "worksheet" && renderWorksheet(module.content as WorksheetContent)}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentModule === 0}
          className="gap-2 min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        {isLastModule ? (
          <Button onClick={handleCourseComplete} className="gap-2 min-h-[48px] bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4" />
            Complete Course
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={module.type === "quiz" && !quizSubmitted}
            className="gap-2 min-h-[48px]"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
