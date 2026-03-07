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
  Briefcase,
  TrendingUp,
  Users,
  BarChart3,
  DollarSign,
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
    options?: string[];
    required?: boolean;
  }[];
  outputTemplate: string;
}

interface BusinessPlanData {
  executiveSummary: string;
  companyDescription: string;
  marketAnalysis: string;
  competitiveAnalysis: string;
  marketingStrategy: string;
  salesStrategy: string;
  operationsPlan: string;
  managementTeam: string;
  financialProjections: string;
  fundingRequest: string;
  milestones: string;
  riskAnalysis: string;
  connectedEntity: string;
}

interface BusinessPlanCourseProps {
  onExit: () => void;
  onComplete: (tokens: number) => void;
  connectedEntity?: { name: string; type: string };
}

const businessPlanModules: CourseModule[] = [
  {
    id: 1,
    title: "Module 1: Executive Summary & Company Description",
    type: "lesson",
    content: {
      title: "Crafting Your Executive Summary",
      sections: [
        {
          heading: "The Executive Summary",
          text: "The executive summary is the most important part of your business plan. It's a concise overview (1-2 pages) that summarizes your entire plan. Many investors read only this section, so it must be compelling. Include: business concept, market opportunity, competitive advantage, financial highlights, and funding needs.",
          tips: [
            "Write this section last, after completing the rest",
            "Keep it under 2 pages",
            "Lead with your strongest points",
          ],
        },
        {
          heading: "Company Description",
          text: "Your company description provides detailed information about your business. Include: legal structure, ownership, history (if any), location, mission statement, vision, core values, and what makes your company unique. This section sets the foundation for everything that follows.",
          tips: [
            "Be specific about your business model",
            "Highlight what differentiates you",
            "Include your company's story",
          ],
        },
        {
          heading: "Products and Services",
          text: "Describe what you sell or provide in detail. Explain the benefits to customers, not just features. Include: product/service descriptions, pricing strategy, intellectual property, research and development plans, and future product roadmap.",
          tips: [
            "Focus on customer benefits",
            "Explain your pricing rationale",
            "Discuss future development plans",
          ],
        },
      ],
      keyTakeaways: [
        "Executive summary is your first impression - make it count",
        "Company description establishes your foundation",
        "Products/services should focus on customer value",
        "Write the executive summary last",
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
          question: "When should you write the executive summary?",
          options: [
            "First, before anything else",
            "Last, after completing all other sections",
            "In the middle of the process",
            "It doesn't matter when",
          ],
          correctIndex: 1,
          explanation: "Write the executive summary last so it accurately reflects and summarizes all the detailed work in your plan.",
        },
        {
          question: "What should the executive summary include?",
          options: [
            "Only financial projections",
            "Business concept, market opportunity, competitive advantage, financial highlights, and funding needs",
            "Just the company history",
            "Only the product description",
          ],
          correctIndex: 1,
          explanation: "The executive summary should concisely cover all key aspects: concept, market, competition, finances, and funding.",
        },
        {
          question: "When describing products/services, what should you focus on?",
          options: [
            "Technical specifications only",
            "Customer benefits, not just features",
            "Manufacturing process",
            "Competitor products",
          ],
          correctIndex: 1,
          explanation: "Focus on how your products/services benefit customers - this resonates more than technical features alone.",
        },
      ],
    },
  },
  {
    id: 3,
    title: "Executive Summary Worksheet",
    type: "worksheet",
    content: {
      title: "Executive Summary Builder",
      description: "Create a compelling executive summary for your business plan.",
      fields: [
        {
          id: "businessConcept",
          label: "Business Concept (2-3 sentences)",
          type: "textarea",
          placeholder: "What does your business do? What problem does it solve?",
          required: true,
        },
        {
          id: "marketOpportunity",
          label: "Market Opportunity",
          type: "textarea",
          placeholder: "What is the size of your market? What trends support your business?",
          required: true,
        },
        {
          id: "competitiveAdvantage",
          label: "Competitive Advantage",
          type: "textarea",
          placeholder: "What makes you different from competitors? Why will customers choose you?",
          required: true,
        },
        {
          id: "financialHighlights",
          label: "Financial Highlights",
          type: "textarea",
          placeholder: "Key financial projections: revenue, profitability timeline, growth rate...",
          required: true,
        },
        {
          id: "fundingNeeds",
          label: "Funding Needs (if applicable)",
          type: "textarea",
          placeholder: "How much funding do you need? What will it be used for?",
          required: false,
        },
      ],
      outputTemplate: "Executive Summary",
    },
  },
  {
    id: 4,
    title: "Module 2: Market Analysis",
    type: "lesson",
    content: {
      title: "Understanding Your Market",
      sections: [
        {
          heading: "Industry Analysis",
          text: "Analyze the industry you're entering. Include: industry size and growth rate, key trends and drivers, regulatory environment, technology changes, and industry lifecycle stage. Use credible sources like industry reports, government data, and trade associations.",
          tips: [
            "Use recent, credible data sources",
            "Identify both opportunities and threats",
            "Understand regulatory requirements",
          ],
        },
        {
          heading: "Target Market",
          text: "Define your ideal customers precisely. Include: demographics (age, income, location), psychographics (values, interests, lifestyle), buying behaviors, pain points, and market size. The more specific, the better your marketing will be.",
          tips: [
            "Create detailed customer personas",
            "Quantify your target market size",
            "Understand customer decision-making",
          ],
        },
        {
          heading: "Competitive Analysis",
          text: "Identify and analyze your competitors. Include: direct and indirect competitors, their strengths and weaknesses, market positioning, pricing strategies, and your competitive advantage. Be honest about the competitive landscape.",
          tips: [
            "Don't underestimate competitors",
            "Identify gaps in the market",
            "Learn from competitor mistakes",
          ],
        },
      ],
      keyTakeaways: [
        "Industry analysis shows you understand the landscape",
        "Target market definition drives all marketing decisions",
        "Honest competitive analysis builds credibility",
        "Use data to support all claims",
      ],
    },
  },
  {
    id: 5,
    title: "Market Analysis Worksheet",
    type: "worksheet",
    content: {
      title: "Market Analysis Builder",
      description: "Document your market research and competitive analysis.",
      fields: [
        {
          id: "industryOverview",
          label: "Industry Overview",
          type: "textarea",
          placeholder: "Industry size, growth rate, key trends, regulatory environment...",
          required: true,
        },
        {
          id: "targetMarket",
          label: "Target Market Definition",
          type: "textarea",
          placeholder: "Demographics, psychographics, behaviors, pain points, market size...",
          required: true,
        },
        {
          id: "customerPersona",
          label: "Primary Customer Persona",
          type: "textarea",
          placeholder: "Describe your ideal customer in detail: name, age, job, challenges, goals...",
          required: true,
        },
        {
          id: "competitors",
          label: "Key Competitors",
          type: "textarea",
          placeholder: "List main competitors, their strengths, weaknesses, and market position...",
          required: true,
        },
        {
          id: "competitiveAdvantage",
          label: "Your Competitive Advantage",
          type: "textarea",
          placeholder: "What makes you better? Price, quality, service, innovation, location...",
          required: true,
        },
      ],
      outputTemplate: "Market Analysis",
    },
  },
  {
    id: 6,
    title: "Module 3: Marketing & Sales Strategy",
    type: "lesson",
    content: {
      title: "Reaching and Converting Customers",
      sections: [
        {
          heading: "Marketing Strategy",
          text: "Your marketing strategy explains how you'll reach customers. Include: positioning statement, brand identity, marketing channels (digital, traditional, partnerships), content strategy, advertising plans, and marketing budget. Align everything with your target market.",
          tips: [
            "Focus on channels where your customers are",
            "Set measurable marketing goals",
            "Start with low-cost, high-impact tactics",
          ],
        },
        {
          heading: "Sales Strategy",
          text: "Your sales strategy explains how you'll convert leads to customers. Include: sales process, sales team structure, pricing strategy, sales channels (direct, retail, online), customer acquisition cost, and sales projections. Make it realistic and scalable.",
          tips: [
            "Map out your entire sales funnel",
            "Calculate customer acquisition cost",
            "Plan for sales team growth",
          ],
        },
        {
          heading: "Customer Retention",
          text: "Acquiring customers is expensive; keeping them is profitable. Include: customer service approach, loyalty programs, feedback systems, upselling/cross-selling strategies, and customer lifetime value calculations. Retention should be a key focus.",
          tips: [
            "It costs 5x more to acquire than retain",
            "Build feedback loops",
            "Create loyalty incentives",
          ],
        },
      ],
      keyTakeaways: [
        "Marketing strategy must align with target market",
        "Sales strategy should be realistic and scalable",
        "Customer retention is more profitable than acquisition",
        "Set measurable goals for all strategies",
      ],
    },
  },
  {
    id: 7,
    title: "Module 3 Quiz",
    type: "quiz",
    content: {
      questions: [
        {
          question: "Why is customer retention important?",
          options: [
            "It's not as important as acquisition",
            "It costs 5x more to acquire than retain customers",
            "Retention doesn't affect profitability",
            "Only new customers matter",
          ],
          correctIndex: 1,
          explanation: "Customer retention is crucial because acquiring new customers costs about 5x more than keeping existing ones.",
        },
        {
          question: "What should your marketing strategy align with?",
          options: [
            "Competitor strategies only",
            "Your target market and customer personas",
            "Whatever is trending",
            "The cheapest options available",
          ],
          correctIndex: 1,
          explanation: "Marketing strategy must align with your target market to effectively reach and resonate with potential customers.",
        },
        {
          question: "What is customer acquisition cost (CAC)?",
          options: [
            "The price of your product",
            "The cost to acquire one new customer",
            "Your total marketing budget",
            "Employee salaries",
          ],
          correctIndex: 1,
          explanation: "CAC is the total cost of sales and marketing efforts required to acquire one new customer.",
        },
      ],
    },
  },
  {
    id: 8,
    title: "Marketing & Sales Worksheet",
    type: "worksheet",
    content: {
      title: "Marketing & Sales Strategy Builder",
      description: "Define your strategies for reaching and converting customers.",
      fields: [
        {
          id: "positioningStatement",
          label: "Positioning Statement",
          type: "textarea",
          placeholder: "For [target market], [your company] is the [category] that [key benefit] because [reason to believe].",
          required: true,
        },
        {
          id: "marketingChannels",
          label: "Marketing Channels",
          type: "textarea",
          placeholder: "Which channels will you use? Social media, SEO, content marketing, advertising, partnerships...",
          required: true,
        },
        {
          id: "salesProcess",
          label: "Sales Process",
          type: "textarea",
          placeholder: "Describe your sales funnel: awareness → interest → decision → action...",
          required: true,
        },
        {
          id: "pricingStrategy",
          label: "Pricing Strategy",
          type: "textarea",
          placeholder: "How will you price? Cost-plus, value-based, competitive, premium...",
          required: true,
        },
        {
          id: "retentionStrategy",
          label: "Customer Retention Strategy",
          type: "textarea",
          placeholder: "How will you keep customers? Loyalty programs, excellent service, community...",
          required: true,
        },
      ],
      outputTemplate: "Marketing & Sales Strategy",
    },
  },
  {
    id: 9,
    title: "Module 4: Operations & Management",
    type: "lesson",
    content: {
      title: "Running Your Business",
      sections: [
        {
          heading: "Operations Plan",
          text: "Your operations plan explains how your business functions day-to-day. Include: location and facilities, equipment and technology, production/service delivery process, quality control, suppliers and vendors, and inventory management. Show you've thought through the details.",
          tips: [
            "Map out your entire workflow",
            "Identify key suppliers and backups",
            "Plan for scaling operations",
          ],
        },
        {
          heading: "Management Team",
          text: "Investors invest in people as much as ideas. Include: organizational structure, key team members and their backgrounds, roles and responsibilities, advisory board, and hiring plans. Highlight relevant experience and fill gaps with advisors.",
          tips: [
            "Highlight relevant experience",
            "Address skill gaps honestly",
            "Include advisory board members",
          ],
        },
        {
          heading: "Milestones and Timeline",
          text: "Show your path to success with concrete milestones. Include: key milestones (product launch, first customer, profitability), timeline for each, resources required, and success metrics. Make milestones specific and measurable.",
          tips: [
            "Set SMART milestones",
            "Include both short and long-term goals",
            "Track progress regularly",
          ],
        },
      ],
      keyTakeaways: [
        "Operations plan shows you can execute",
        "Management team credibility is crucial",
        "Milestones provide accountability",
        "Plan for scaling from the start",
      ],
    },
  },
  {
    id: 10,
    title: "Operations & Management Worksheet",
    type: "worksheet",
    content: {
      title: "Operations & Management Builder",
      description: "Document how your business will operate and who will run it.",
      fields: [
        {
          id: "operationsOverview",
          label: "Operations Overview",
          type: "textarea",
          placeholder: "Location, facilities, equipment, production process, quality control...",
          required: true,
        },
        {
          id: "managementTeam",
          label: "Management Team",
          type: "textarea",
          placeholder: "Key team members, their roles, backgrounds, and relevant experience...",
          required: true,
        },
        {
          id: "orgStructure",
          label: "Organizational Structure",
          type: "textarea",
          placeholder: "Describe your org chart and reporting relationships...",
          required: true,
        },
        {
          id: "hiringPlan",
          label: "Hiring Plan",
          type: "textarea",
          placeholder: "What positions will you hire? When? What skills are needed?",
          required: true,
        },
        {
          id: "milestones",
          label: "Key Milestones (Year 1-3)",
          type: "textarea",
          placeholder: "List major milestones with target dates and success metrics...",
          required: true,
        },
      ],
      outputTemplate: "Operations & Management Plan",
    },
  },
  {
    id: 11,
    title: "Module 5: Financial Projections",
    type: "lesson",
    content: {
      title: "The Numbers That Matter",
      sections: [
        {
          heading: "Financial Statements",
          text: "Your financial projections include three key statements: Income Statement (revenue, expenses, profit), Balance Sheet (assets, liabilities, equity), and Cash Flow Statement (cash in and out). Project 3-5 years, with monthly detail for year 1.",
          tips: [
            "Be realistic, not optimistic",
            "Show your assumptions clearly",
            "Monthly detail for year 1, quarterly for years 2-3",
          ],
        },
        {
          heading: "Key Financial Metrics",
          text: "Highlight important metrics: gross margin, net margin, break-even point, customer acquisition cost (CAC), lifetime value (LTV), burn rate (if applicable), and runway. These metrics show you understand your business economics.",
          tips: [
            "Know your break-even point",
            "LTV should be 3x+ CAC",
            "Track burn rate carefully",
          ],
        },
        {
          heading: "Funding Request",
          text: "If seeking funding, be specific: amount needed, use of funds (detailed breakdown), expected milestones with funding, and exit strategy or repayment plan. Show how funding accelerates growth and provides return to investors.",
          tips: [
            "Be specific about use of funds",
            "Show milestones funding enables",
            "Explain investor return potential",
          ],
        },
      ],
      keyTakeaways: [
        "Financial projections must be realistic and defensible",
        "Key metrics show business understanding",
        "Funding requests need specific use of funds",
        "Show your assumptions clearly",
      ],
    },
  },
  {
    id: 12,
    title: "Final Quiz",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What three financial statements should your projections include?",
          options: [
            "Budget, forecast, and estimate",
            "Income statement, balance sheet, and cash flow statement",
            "Revenue, expenses, and profit",
            "Assets, liabilities, and equity",
          ],
          correctIndex: 1,
          explanation: "The three key financial statements are: Income Statement, Balance Sheet, and Cash Flow Statement.",
        },
        {
          question: "What is a healthy LTV to CAC ratio?",
          options: [
            "1:1",
            "3:1 or higher (LTV should be 3x+ CAC)",
            "1:3",
            "It doesn't matter",
          ],
          correctIndex: 1,
          explanation: "A healthy business should have LTV (Lifetime Value) at least 3x the CAC (Customer Acquisition Cost).",
        },
        {
          question: "What should a funding request include?",
          options: [
            "Just the amount needed",
            "Amount, detailed use of funds, milestones, and return potential",
            "Only the exit strategy",
            "Just the business description",
          ],
          correctIndex: 1,
          explanation: "A complete funding request includes the amount, specific use of funds, milestones it enables, and return potential.",
        },
      ],
    },
  },
  {
    id: 13,
    title: "Complete Business Plan",
    type: "worksheet",
    content: {
      title: "Final Business Plan Compilation",
      description: "Compile your complete business plan. This will be recorded to the LuvLedger blockchain.",
      fields: [
        {
          id: "executiveSummary",
          label: "Executive Summary (Final)",
          type: "textarea",
          placeholder: "Compile your final executive summary from all previous work...",
          required: true,
        },
        {
          id: "financialProjections",
          label: "Financial Projections Summary",
          type: "textarea",
          placeholder: "Year 1-3 revenue, expenses, profit projections, break-even point...",
          required: true,
        },
        {
          id: "fundingRequest",
          label: "Funding Request (if applicable)",
          type: "textarea",
          placeholder: "Amount needed, use of funds breakdown, expected milestones...",
          required: false,
        },
        {
          id: "riskAnalysis",
          label: "Risk Analysis",
          type: "textarea",
          placeholder: "Key risks and mitigation strategies...",
          required: true,
        },
        {
          id: "nextSteps",
          label: "Immediate Next Steps",
          type: "textarea",
          placeholder: "What are your next 3-5 action items to move forward?",
          required: true,
        },
      ],
      outputTemplate: "Complete Business Plan",
    },
  },
];

export default function BusinessPlanCourse({ onExit, onComplete, connectedEntity }: BusinessPlanCourseProps) {
  const [currentModule, setCurrentModule] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [worksheetData, setWorksheetData] = useState<BusinessPlanData>({
    executiveSummary: "",
    companyDescription: "",
    marketAnalysis: "",
    competitiveAnalysis: "",
    marketingStrategy: "",
    salesStrategy: "",
    operationsPlan: "",
    managementTeam: "",
    financialProjections: "",
    fundingRequest: "",
    milestones: "",
    riskAnalysis: "",
    connectedEntity: connectedEntity?.name || "",
  });
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const [tokensEarned, setTokensEarned] = useState(0);

  const awardTokens = trpc.tokenEconomy.awardTokens.useMutation();

  const module = businessPlanModules[currentModule];
  const progress = ((currentModule + 1) / businessPlanModules.length) * 100;

  const handleNext = () => {
    if (currentModule < businessPlanModules.length - 1) {
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
    const totalTokens = tokensEarned + 50;
    
    awardTokens.mutate({
      amount: "50",
      reason: "simulator_completion",
    });
    
    toast.success(`Congratulations! Course Complete! Total tokens earned: ${totalTokens}. Recorded to LuvLedger blockchain.`);
    onComplete(totalTokens);
  };

  const downloadBusinessPlan = () => {
    let content = "# COMPREHENSIVE BUSINESS PLAN\n\n";
    content += `Generated: ${new Date().toLocaleDateString()}\n`;
    content += `Connected Entity: ${worksheetData.connectedEntity || connectedEntity?.name || "Not specified"}\n`;
    content += "**Recorded to LuvLedger Blockchain**\n\n";
    content += "---\n\n";
    
    content += "## EXECUTIVE SUMMARY\n\n";
    content += `${worksheetData.executiveSummary || "[To be completed]"}\n\n`;
    
    content += "## COMPANY DESCRIPTION\n\n";
    content += `${worksheetData.companyDescription || "[To be completed]"}\n\n`;
    
    content += "## MARKET ANALYSIS\n\n";
    content += `${worksheetData.marketAnalysis || "[To be completed]"}\n\n`;
    
    content += "## COMPETITIVE ANALYSIS\n\n";
    content += `${worksheetData.competitiveAnalysis || "[To be completed]"}\n\n`;
    
    content += "## MARKETING STRATEGY\n\n";
    content += `${worksheetData.marketingStrategy || "[To be completed]"}\n\n`;
    
    content += "## SALES STRATEGY\n\n";
    content += `${worksheetData.salesStrategy || "[To be completed]"}\n\n`;
    
    content += "## OPERATIONS PLAN\n\n";
    content += `${worksheetData.operationsPlan || "[To be completed]"}\n\n`;
    
    content += "## MANAGEMENT TEAM\n\n";
    content += `${worksheetData.managementTeam || "[To be completed]"}\n\n`;
    
    content += "## FINANCIAL PROJECTIONS\n\n";
    content += `${worksheetData.financialProjections || "[To be completed]"}\n\n`;
    
    content += "## FUNDING REQUEST\n\n";
    content += `${worksheetData.fundingRequest || "[Not applicable or to be completed]"}\n\n`;
    
    content += "## MILESTONES\n\n";
    content += `${worksheetData.milestones || "[To be completed]"}\n\n`;
    
    content += "## RISK ANALYSIS\n\n";
    content += `${worksheetData.riskAnalysis || "[To be completed]"}\n\n`;
    
    content += "---\n\n";
    content += "*Generated through The The The L.A.W.S. Collective, LLC Business Plan Workshop*\n";
    content += "*All records immutably stored on LuvLedger blockchain*\n";

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `business-plan-${new Date().toISOString().split("T")[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Business Plan downloaded!");
  };

  const renderLesson = (content: LessonContent) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-teal-600" />
        <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
      </div>

      {content.sections.map((section, idx) => (
        <Card key={idx} className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            {section.heading}
          </h3>
          <p className="text-muted-foreground mb-4 leading-relaxed">{section.text}</p>
          {section.tips && (
            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
              <p className="font-semibold text-teal-800 dark:text-teal-200 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Pro Tips:
              </p>
              <ul className="space-y-1">
                {section.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-teal-700 dark:text-teal-300 flex items-start gap-2">
                    <span className="text-teal-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}

      <Card className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
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
        <FileText className="w-8 h-8 text-teal-600" />
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
                    ? "bg-teal-100 border-teal-500 dark:bg-teal-900/30"
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
        <Briefcase className="w-8 h-8 text-teal-600" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
          <p className="text-muted-foreground">{content.description}</p>
        </div>
      </div>

      {connectedEntity && (
        <Card className="p-4 bg-teal-50 dark:bg-teal-900/20 border-teal-200">
          <p className="text-sm text-teal-800 dark:text-teal-200">
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
                    {field.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const isLastModule = currentModule === businessPlanModules.length - 1;

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
          <Button variant="outline" onClick={downloadBusinessPlan} className="gap-2 min-h-[48px]">
            <Download className="w-4 h-4" />
            Download Plan
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">{module.title}</span>
          <span className="text-sm text-muted-foreground">
            {currentModule + 1} of {businessPlanModules.length}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
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
