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
  Users,
  DollarSign,
  Scale,
  Building,
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
    options?: { value: string; label: string; disabled?: boolean; requiresApproval?: boolean }[] | string[];
    required?: boolean;
  }[];
  outputTemplate: string;
}

interface BusinessData {
  businessName: string;
  entityType: string;
  missionStatement: string;
  visionStatement: string;
  coreValues: string;
  targetMarket: string;
  customerProfile: string;
  products: string;
  services: string;
  pricingStrategy: string;
  competitiveAdvantage: string;
  registeredAgent: string;
  principalAddress: string;
  managementStructure: string;
  memberNames: string;
  initialCapital: string;
  profitDistribution: string;
  votingRights: string;
  meetingRequirements: string;
  dissolutionTerms: string;
}

const businessSetupModules: CourseModule[] = [
  {
    id: 1,
    title: "Module 1: Understanding Business Structures",
    type: "lesson",
    content: {
      title: "Choosing the Right Business Entity",
      sections: [
        {
          heading: "Why Business Structure Matters",
          text: "The legal structure you choose for your business affects everything from day-to-day operations to taxes and how much of your personal assets are at risk. You should choose a business structure that gives you the right balance of legal protections and benefits.",
          tips: [
            "Consider your liability exposure",
            "Think about tax implications",
            "Plan for future growth and investors",
          ],
        },
        {
          heading: "Sole Proprietorship",
          text: "The simplest form of business. You and your business are legally the same entity. Easy to set up but offers no personal liability protection. All profits pass through to your personal tax return.",
        },
        {
          heading: "Limited Liability Company (LLC)",
          text: "Combines the liability protection of a corporation with the tax benefits and flexibility of a partnership. Members are protected from personal liability for business debts. Profits pass through to members' personal tax returns (unless you elect corporate taxation).",
          tips: [
            "Most popular choice for small businesses",
            "Flexible management structure",
            "Can have single or multiple members",
          ],
        },
        {
          heading: "Corporation (C-Corp or S-Corp)",
          text: "A separate legal entity from its owners. Provides the strongest liability protection. C-Corps face double taxation (corporate and personal). S-Corps allow pass-through taxation but have restrictions on shareholders.",
        },
        {
          heading: "Nonprofit Organization",
          text: "Organized for purposes other than generating profit. Can apply for tax-exempt status. Must reinvest surplus revenues into the organization's mission.",
          tips: [
            "Faith-based organizations may have automatic tax-exempt status",
            "501(c)(3) requires IRS application and approval",
            "Donations may be tax-deductible for donors",
          ],
        },
        {
          heading: "Trust",
          text: "A legal arrangement where one party (trustee) holds property for the benefit of another (beneficiary). Can provide asset protection, tax benefits, and estate planning advantages. Family trusts can hold business interests and pass wealth across generations.",
        },
      ],
      keyTakeaways: [
        "LLCs offer the best balance of protection and flexibility for most small businesses",
        "Corporations are better for businesses seeking outside investment",
        "Nonprofits must operate for exempt purposes, not private benefit",
        "Trusts can own business entities and provide generational wealth transfer",
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
          question: "Which business structure provides personal liability protection while allowing pass-through taxation?",
          options: ["Sole Proprietorship", "LLC", "C-Corporation", "General Partnership"],
          correctIndex: 1,
          explanation: "An LLC (Limited Liability Company) provides personal liability protection while allowing profits to pass through to members' personal tax returns, avoiding double taxation.",
        },
        {
          question: "What is the main disadvantage of a sole proprietorship?",
          options: ["High startup costs", "No personal liability protection", "Complex tax filing", "Requires multiple owners"],
          correctIndex: 1,
          explanation: "In a sole proprietorship, you and your business are legally the same entity, meaning your personal assets are at risk for business debts and lawsuits.",
        },
        {
          question: "Which type of nonprofit status is automatic for religious organizations?",
          options: ["501(c)(3)", "501(c)(4)", "527", "Trust"],
          correctIndex: 2,
          explanation: "Religious organizations may have automatic tax-exempt status without requiring IRS application. Consult with a tax professional for your specific situation.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 3,
    title: "Module 1: Entity Selection Worksheet",
    type: "worksheet",
    content: {
      title: "Business Entity Selection",
      description: "Based on what you've learned, let's determine the best entity type for your business.",
      fields: [
        { id: "businessName", label: "Business Name", type: "text", placeholder: "Enter your business name", required: true },
        { id: "entityType", label: "Entity Type", type: "select", options: [
            { value: "LLC", label: "LLC" },
            { value: "Corporation", label: "Corporation" },
            { value: "S-Corporation", label: "S-Corporation" },
            { value: "Trust", label: "Trust" },
            { value: "Sole Proprietorship", label: "Sole Proprietorship" },
            { value: "501c3", label: "501(c)(3) Nonprofit", disabled: true, requiresApproval: true },
            { value: "faith_based", label: "Faith-Based Organization", disabled: false, requiresApproval: false },
          ], required: true },
      ],
      outputTemplate: "Entity Selection: {{businessName}} will be structured as a {{entityType}}.",
    } as WorksheetContent,
  },
  {
    id: 4,
    title: "Module 2: Mission, Vision & Values",
    type: "lesson",
    content: {
      title: "Defining Your Business Purpose",
      sections: [
        {
          heading: "The Power of Purpose",
          text: "A clear mission, vision, and set of values form the foundation of every successful business. They guide decision-making, attract the right customers and employees, and keep you focused during challenges.",
        },
        {
          heading: "Mission Statement",
          text: "Your mission statement describes what your business does, who it serves, and how it creates value. It should be clear, concise, and actionable. A good mission statement answers: What do we do? For whom? How do we do it differently?",
          tips: [
            "Keep it to 1-2 sentences",
            "Focus on the present",
            "Make it memorable and inspiring",
          ],
        },
        {
          heading: "Vision Statement",
          text: "Your vision statement describes where you want your business to be in the future. It's aspirational and forward-looking. It should inspire and motivate your team and stakeholders.",
          tips: [
            "Think 5-10 years ahead",
            "Be ambitious but achievable",
            "Paint a picture of success",
          ],
        },
        {
          heading: "Core Values",
          text: "Core values are the fundamental beliefs that guide your business behavior and decision-making. They define your company culture and how you treat customers, employees, and partners.",
          tips: [
            "Choose 3-5 core values",
            "Make them specific and meaningful",
            "Live them daily, not just display them",
          ],
        },
      ],
      keyTakeaways: [
        "Mission = What you do now",
        "Vision = Where you're going",
        "Values = How you behave along the way",
        "These three elements should align and reinforce each other",
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
          question: "What does a mission statement primarily describe?",
          options: ["Future goals", "Current purpose and activities", "Financial targets", "Employee policies"],
          correctIndex: 1,
          explanation: "A mission statement describes what your business currently does, who it serves, and how it creates value in the present.",
        },
        {
          question: "How many core values should a business typically have?",
          options: ["1-2", "3-5", "10-15", "As many as possible"],
          correctIndex: 1,
          explanation: "3-5 core values is ideal. Too few may not capture your culture; too many become hard to remember and implement.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 6,
    title: "Module 2: Mission & Vision Worksheet",
    type: "worksheet",
    content: {
      title: "Mission, Vision & Values",
      description: "Let's craft your business's guiding statements.",
      fields: [
        { id: "missionStatement", label: "Mission Statement", type: "textarea", placeholder: "We [do what] for [whom] by [how]...", required: true },
        { id: "visionStatement", label: "Vision Statement", type: "textarea", placeholder: "In [X] years, we will be...", required: true },
        { id: "coreValues", label: "Core Values (3-5, separated by commas)", type: "textarea", placeholder: "Integrity, Excellence, Community...", required: true },
      ],
      outputTemplate: "Mission: {{missionStatement}}\n\nVision: {{visionStatement}}\n\nCore Values: {{coreValues}}",
    } as WorksheetContent,
  },
  {
    id: 7,
    title: "Module 3: Target Market & Customers",
    type: "lesson",
    content: {
      title: "Identifying Your Ideal Customer",
      sections: [
        {
          heading: "Why Target Market Matters",
          text: "You can't serve everyone effectively. By identifying your target market, you can focus your resources on the customers most likely to buy from you and become loyal advocates.",
        },
        {
          heading: "Market Segmentation",
          text: "Divide the broader market into segments based on demographics (age, income, location), psychographics (values, interests, lifestyle), behavior (buying habits, brand loyalty), and needs (problems they're trying to solve).",
          tips: [
            "Start broad, then narrow down",
            "Look for underserved segments",
            "Consider your own expertise and passion",
          ],
        },
        {
          heading: "Customer Persona",
          text: "Create a detailed profile of your ideal customer. Give them a name, age, occupation, goals, challenges, and buying behavior. This helps you make decisions as if you're serving a real person.",
        },
        {
          heading: "Market Research",
          text: "Validate your assumptions through research. Talk to potential customers, study competitors, analyze industry reports, and test your ideas before fully committing.",
        },
      ],
      keyTakeaways: [
        "A focused target market leads to more effective marketing",
        "Customer personas make your ideal customer tangible",
        "Research validates assumptions before you invest",
        "You can expand your market later, but start focused",
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
          question: "What is a customer persona?",
          options: ["A legal document", "A detailed profile of your ideal customer", "A marketing slogan", "A competitor analysis"],
          correctIndex: 1,
          explanation: "A customer persona is a detailed, semi-fictional profile of your ideal customer that helps you make business decisions.",
        },
        {
          question: "Why should you start with a focused target market?",
          options: ["To limit growth", "To use resources more effectively", "Because regulations require it", "To avoid competition"],
          correctIndex: 1,
          explanation: "A focused target market allows you to concentrate your limited resources on customers most likely to buy, leading to better results.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 9,
    title: "Module 3: Customer Profile Worksheet",
    type: "worksheet",
    content: {
      title: "Target Market & Customer Profile",
      description: "Define who your business will serve.",
      fields: [
        { id: "targetMarket", label: "Target Market Description", type: "textarea", placeholder: "Describe your target market (demographics, location, size)...", required: true },
        { id: "customerProfile", label: "Ideal Customer Profile", type: "textarea", placeholder: "Name, age, occupation, goals, challenges, where they spend time...", required: true },
      ],
      outputTemplate: "Target Market: {{targetMarket}}\n\nIdeal Customer Profile: {{customerProfile}}",
    } as WorksheetContent,
  },
  {
    id: 10,
    title: "Module 4: Products & Services",
    type: "lesson",
    content: {
      title: "Defining Your Offerings",
      sections: [
        {
          heading: "Products vs Services",
          text: "Products are tangible items customers purchase. Services are intangible activities performed for customers. Many businesses offer both. Understanding the difference helps you price and deliver effectively.",
        },
        {
          heading: "Value Proposition",
          text: "Your value proposition explains why customers should choose you over competitors. It combines what you offer, who you serve, and what makes you unique. It's the promise of value you deliver.",
          tips: [
            "Focus on benefits, not just features",
            "Address your customer's main pain point",
            "Be specific and measurable when possible",
          ],
        },
        {
          heading: "Pricing Strategy",
          text: "Pricing affects perception, profitability, and positioning. Consider cost-plus pricing (cost + margin), value-based pricing (what customers will pay), competitive pricing (matching market), and premium pricing (higher price for perceived quality).",
        },
        {
          heading: "Competitive Advantage",
          text: "What makes you different and better? This could be lower cost, higher quality, better service, unique features, convenience, or expertise. Your competitive advantage should be sustainable and hard to copy.",
        },
      ],
      keyTakeaways: [
        "Clear value proposition attracts the right customers",
        "Pricing should reflect your positioning and costs",
        "Competitive advantage must be sustainable",
        "Start with a focused offering, expand later",
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
          question: "What is a value proposition?",
          options: ["A legal contract", "The promise of value you deliver to customers", "A pricing formula", "A marketing budget"],
          correctIndex: 1,
          explanation: "A value proposition explains why customers should choose you, combining what you offer with what makes you unique.",
        },
        {
          question: "Which pricing strategy charges based on what customers are willing to pay?",
          options: ["Cost-plus pricing", "Competitive pricing", "Value-based pricing", "Penetration pricing"],
          correctIndex: 2,
          explanation: "Value-based pricing sets prices based on the perceived value to the customer, not just costs or competitor prices.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 12,
    title: "Module 4: Products & Services Worksheet",
    type: "worksheet",
    content: {
      title: "Products, Services & Pricing",
      description: "Define what your business will offer.",
      fields: [
        { id: "products", label: "Products (if any)", type: "textarea", placeholder: "List your products with brief descriptions..." },
        { id: "services", label: "Services (if any)", type: "textarea", placeholder: "List your services with brief descriptions..." },
        { id: "pricingStrategy", label: "Pricing Strategy", type: "textarea", placeholder: "Describe your pricing approach and rationale...", required: true },
        { id: "competitiveAdvantage", label: "Competitive Advantage", type: "textarea", placeholder: "What makes you different and better than competitors?", required: true },
      ],
      outputTemplate: "Products: {{products}}\n\nServices: {{services}}\n\nPricing Strategy: {{pricingStrategy}}\n\nCompetitive Advantage: {{competitiveAdvantage}}",
    } as WorksheetContent,
  },
  {
    id: 13,
    title: "Module 5: Legal Formation",
    type: "lesson",
    content: {
      title: "Forming Your Business Entity",
      sections: [
        {
          heading: "Articles of Organization (LLC)",
          text: "The Articles of Organization is the document filed with the state to legally create your LLC. It includes the business name, registered agent, principal address, and management structure. Filing fees vary by state ($50-$500).",
          tips: [
            "Choose a unique name that includes 'LLC'",
            "A registered agent receives legal documents on behalf of the business",
            "You can be your own registered agent if you have a physical address in the state",
          ],
        },
        {
          heading: "Operating Agreement",
          text: "The Operating Agreement is an internal document that outlines how your LLC will be run. It covers ownership percentages, profit distribution, voting rights, management responsibilities, and what happens if a member leaves or the business dissolves.",
          tips: [
            "Required in some states, recommended in all",
            "Protects your limited liability status",
            "Can be amended as the business grows",
          ],
        },
        {
          heading: "EIN (Employer Identification Number)",
          text: "An EIN is like a Social Security number for your business. You need it to open a business bank account, hire employees, and file taxes. It's free to obtain from the IRS online.",
        },
        {
          heading: "Business Bank Account",
          text: "Keeping business and personal finances separate is crucial for maintaining your liability protection and simplifying taxes. Open a dedicated business checking account using your EIN and Articles of Organization.",
        },
      ],
      keyTakeaways: [
        "Articles of Organization creates your LLC with the state",
        "Operating Agreement governs internal operations",
        "EIN is required for banking and taxes",
        "Separate business finances from personal finances",
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
          question: "What document is filed with the state to create an LLC?",
          options: ["Operating Agreement", "Articles of Organization", "Business License", "EIN Application"],
          correctIndex: 1,
          explanation: "Articles of Organization is the official document filed with the state to legally create your LLC.",
        },
        {
          question: "What is the purpose of a registered agent?",
          options: ["To manage daily operations", "To receive legal documents on behalf of the business", "To file taxes", "To hire employees"],
          correctIndex: 1,
          explanation: "A registered agent is designated to receive legal and official documents on behalf of your business.",
        },
        {
          question: "Why is it important to separate business and personal finances?",
          options: ["It's not important", "To maintain liability protection and simplify taxes", "To hide money", "To avoid paying bills"],
          correctIndex: 1,
          explanation: "Mixing personal and business finances can pierce your liability protection and complicate tax filing.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 15,
    title: "Module 5: Legal Formation Worksheet",
    type: "worksheet",
    content: {
      title: "Legal Formation Details",
      description: "Gather the information needed for your legal documents.",
      fields: [
        { id: "registeredAgent", label: "Registered Agent Name", type: "text", placeholder: "Name of person or service to receive legal documents", required: true },
        { id: "principalAddress", label: "Principal Business Address", type: "textarea", placeholder: "Street address, City, State, ZIP", required: true },
        { id: "managementStructure", label: "Management Structure", type: "select", options: ["Member-Managed", "Manager-Managed"], required: true },
        { id: "memberNames", label: "Member/Owner Names", type: "textarea", placeholder: "List all members/owners and their ownership percentages", required: true },
        { id: "initialCapital", label: "Initial Capital Contributions", type: "textarea", placeholder: "Amount each member is contributing to start the business", required: true },
      ],
      outputTemplate: "Registered Agent: {{registeredAgent}}\n\nPrincipal Address: {{principalAddress}}\n\nManagement: {{managementStructure}}\n\nMembers: {{memberNames}}\n\nInitial Capital: {{initialCapital}}",
    } as WorksheetContent,
  },
  {
    id: 16,
    title: "Module 6: Operating Agreement Details",
    type: "lesson",
    content: {
      title: "Creating Your Operating Agreement",
      sections: [
        {
          heading: "Profit & Loss Distribution",
          text: "Define how profits and losses will be divided among members. This is typically based on ownership percentages but can be structured differently (special allocations) with proper documentation.",
        },
        {
          heading: "Voting Rights & Decision Making",
          text: "Specify how decisions are made. Major decisions (selling the business, taking on debt, adding members) may require unanimous consent, while routine decisions may only need majority vote.",
          tips: [
            "Define what constitutes a 'major' decision",
            "Consider weighted voting based on ownership",
            "Include deadlock resolution procedures",
          ],
        },
        {
          heading: "Meeting Requirements",
          text: "Establish how often members meet, how meetings are called, and what constitutes a quorum. Even single-member LLCs should document major decisions.",
        },
        {
          heading: "Transfer & Exit Provisions",
          text: "Define what happens when a member wants to leave, dies, or becomes incapacitated. Include buy-sell provisions, right of first refusal, and valuation methods.",
        },
        {
          heading: "Dissolution Terms",
          text: "Specify the conditions under which the LLC can be dissolved and how assets will be distributed. This protects all members if the business needs to close.",
        },
      ],
      keyTakeaways: [
        "Operating Agreement prevents future disputes",
        "Address worst-case scenarios upfront",
        "Review and update as the business evolves",
        "Consider consulting an attorney for complex situations",
      ],
    } as LessonContent,
  },
  {
    id: 17,
    title: "Module 6: Knowledge Check",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What should an Operating Agreement include about decision-making?",
          options: ["Nothing", "How votes are weighted and what requires unanimous consent", "Only financial information", "Employee policies"],
          correctIndex: 1,
          explanation: "The Operating Agreement should clearly define voting rights, what decisions require different levels of approval, and how deadlocks are resolved.",
        },
        {
          question: "Why include exit provisions in an Operating Agreement?",
          options: ["To make it harder to leave", "To protect all members when someone wants to exit", "To avoid taxes", "They're not necessary"],
          correctIndex: 1,
          explanation: "Exit provisions protect both departing and remaining members by establishing clear procedures and fair valuation methods.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 18,
    title: "Module 6: Operating Agreement Worksheet",
    type: "worksheet",
    content: {
      title: "Operating Agreement Terms",
      description: "Define the key terms for your Operating Agreement.",
      fields: [
        { id: "profitDistribution", label: "Profit/Loss Distribution", type: "textarea", placeholder: "How will profits and losses be divided? (e.g., 'Pro-rata based on ownership percentages')", required: true },
        { id: "votingRights", label: "Voting Rights", type: "textarea", placeholder: "How are votes weighted? What requires unanimous consent?", required: true },
        { id: "meetingRequirements", label: "Meeting Requirements", type: "textarea", placeholder: "How often will members meet? How are meetings called?", required: true },
        { id: "dissolutionTerms", label: "Dissolution Terms", type: "textarea", placeholder: "Under what conditions can the LLC be dissolved? How will assets be distributed?", required: true },
      ],
      outputTemplate: "Profit Distribution: {{profitDistribution}}\n\nVoting Rights: {{votingRights}}\n\nMeeting Requirements: {{meetingRequirements}}\n\nDissolution Terms: {{dissolutionTerms}}",
    } as WorksheetContent,
  },
];

interface BusinessCourseProps {
  onComplete: (data: BusinessData, tokensEarned: number) => void;
  onExit: () => void;
}

export default function BusinessCourse({ onComplete, onExit }: BusinessCourseProps) {
  const [currentModule, setCurrentModule] = useState(0);
  const [businessData, setBusinessData] = useState<BusinessData>({
    businessName: "",
    entityType: "",
    missionStatement: "",
    visionStatement: "",
    coreValues: "",
    targetMarket: "",
    customerProfile: "",
    products: "",
    services: "",
    pricingStrategy: "",
    competitiveAdvantage: "",
    registeredAgent: "",
    principalAddress: "",
    managementStructure: "",
    memberNames: "",
    initialCapital: "",
    profitDistribution: "",
    votingRights: "",
    meetingRequirements: "",
    dissolutionTerms: "",
  });
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  // House activation mutation - triggers when course is completed
  const activateHouse = trpc.houseLedger.activateHouseOnBusinessCompletion.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`House activated! Your LuvLedger has been initialized.`);
      }
    },
    onError: (error) => {
      console.error("House activation error:", error);
    },
  });

  const module = businessSetupModules[currentModule];
  const progress = ((currentModule + 1) / businessSetupModules.length) * 100;

  const handleWorksheetChange = (fieldId: string, value: string) => {
    setBusinessData((prev) => ({ ...prev, [fieldId]: value }));
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
    
    if (currentModule < businessSetupModules.length - 1) {
      setCurrentModule(currentModule + 1);
      setQuizAnswers([]);
      setShowQuizResults(false);
    } else {
      // Course complete - Activate House and initialize LuvLedger
      activateHouse.mutate({
        businessName: businessData.businessName || "My Business",
        businessType: businessData.entityType || "LLC",
        stateOfFormation: "CA", // Default, could be extracted from form
      });
      onComplete(businessData, totalTokens + 50); // Bonus tokens for completion
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
        <BookOpen className="w-8 h-8 text-accent" />
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

      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Key Takeaways</span>
        </div>
        <ul className="space-y-2">
          {content.keyTakeaways.map((takeaway, i) => (
            <li key={i} className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
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
        <FileText className="w-8 h-8 text-accent" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
          <p className="text-muted-foreground">{content.description}</p>
        </div>
      </div>

      {/* Note about restricted options */}
      {content.fields.some(f => f.options?.some(opt => typeof opt === 'object' && opt.requiresApproval)) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Note:</span> Some entity options are not available until certain conditions are met. 
            Options marked "Approval Required" require completion of the sovereign system training and approval process.
          </p>
        </div>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          {content.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.type === "text" && (
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(businessData as any)[field.id] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  className="min-h-[48px]"
                />
              )}
              {field.type === "textarea" && (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(businessData as any)[field.id] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  rows={4}
                />
              )}
              {field.type === "select" && (
                <Select
                  value={(businessData as any)[field.id] || ""}
                  onValueChange={(value) => handleWorksheetChange(field.id, value)}
                >
                  <SelectTrigger className="min-h-[48px]">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => {
                      const isObject = typeof opt === 'object';
                      const value = isObject ? opt.value : opt;
                      const label = isObject ? opt.label : opt;
                      const disabled = isObject ? opt.disabled : false;
                      const requiresApproval = isObject ? opt.requiresApproval : false;
                      return (
                        <SelectItem 
                          key={value} 
                          value={value}
                          disabled={disabled}
                          className={disabled ? "opacity-50" : ""}
                        >
                          {label}
                          {requiresApproval && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                              Approval Required
                            </span>
                          )}
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

      {/* Preview of generated content */}
      {Object.values(businessData).some((v) => v) && (
        <Card className="p-6 bg-accent/5 border-accent/20">
          <h3 className="font-semibold text-foreground mb-3">Preview</h3>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
            {content.outputTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => (businessData as any)[key] || `[${key}]`)}
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
            Module {currentModule + 1} of {businessSetupModules.length}
          </p>
          <p className="font-bold text-accent">{totalTokens} tokens earned</p>
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
            className="bg-accent h-2 rounded-full transition-all duration-300"
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
          {currentModule === businessSetupModules.length - 1 ? "Complete Course" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
