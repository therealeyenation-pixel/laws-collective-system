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
  DollarSign,
  TrendingUp,
  Calculator,
  PiggyBank,
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
    type: "text" | "textarea" | "number";
    placeholder?: string;
    required?: boolean;
  }[];
  outputTemplate: string;
}

interface FinancialData {
  // Startup Costs
  equipmentCosts: string;
  inventoryCosts: string;
  legalFees: string;
  licensingFees: string;
  marketingBudget: string;
  operatingReserve: string;
  totalStartupCosts: string;
  
  // Revenue
  productRevenue: string;
  serviceRevenue: string;
  monthlyRevenue: string;
  yearOneRevenue: string;
  yearTwoRevenue: string;
  yearThreeRevenue: string;
  
  // Expenses
  rent: string;
  utilities: string;
  salaries: string;
  insurance: string;
  marketing: string;
  supplies: string;
  monthlyExpenses: string;
  
  // Cash Flow
  openingBalance: string;
  monthlyInflow: string;
  monthlyOutflow: string;
  closingBalance: string;
  
  // Break-even
  fixedCosts: string;
  variableCostPerUnit: string;
  pricePerUnit: string;
  breakEvenUnits: string;
  
  // Funding
  ownerInvestment: string;
  loans: string;
  grants: string;
  investors: string;
  totalFunding: string;
  
  // KPIs
  grossMargin: string;
  netMargin: string;
  customerAcquisitionCost: string;
  lifetimeValue: string;
}

const financialModules: CourseModule[] = [
  {
    id: 1,
    title: "Module 1: Startup Costs",
    type: "lesson",
    content: {
      title: "Calculating Your Initial Investment",
      sections: [
        {
          heading: "Why Startup Costs Matter",
          text: "Understanding your startup costs is crucial for securing funding, planning cash flow, and setting realistic expectations. Underestimating costs is one of the top reasons businesses fail in their first year.",
        },
        {
          heading: "One-Time Costs",
          text: "These are expenses you pay once to get started: equipment, furniture, initial inventory, legal fees (incorporation, contracts), licenses and permits, website development, signage, and initial marketing.",
          tips: [
            "Get quotes from multiple vendors",
            "Consider used equipment to save money",
            "Don't forget hidden costs like delivery and installation",
          ],
        },
        {
          heading: "Operating Reserve",
          text: "Plan to have 3-6 months of operating expenses in reserve. This cushion helps you survive slow periods, unexpected expenses, and the time it takes to become profitable.",
          tips: [
            "6 months is safer for new businesses",
            "Include this in your funding requirements",
            "Don't dip into reserves for non-emergencies",
          ],
        },
        {
          heading: "Common Startup Cost Categories",
          text: "Equipment & Technology, Inventory & Supplies, Legal & Professional Fees, Licenses & Permits, Marketing & Branding, Insurance, Rent & Deposits, Operating Reserve.",
        },
      ],
      keyTakeaways: [
        "List every possible expense before starting",
        "Add 20% buffer for unexpected costs",
        "Keep 3-6 months operating reserve",
        "Separate one-time costs from ongoing expenses",
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
          question: "How many months of operating expenses should you keep in reserve?",
          options: ["1 month", "3-6 months", "12 months", "None"],
          correctIndex: 1,
          explanation: "3-6 months of operating expenses provides a safety cushion for slow periods and unexpected costs.",
        },
        {
          question: "What percentage buffer should you add for unexpected costs?",
          options: ["5%", "10%", "20%", "50%"],
          correctIndex: 2,
          explanation: "A 20% buffer helps account for costs you didn't anticipate or underestimated.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 3,
    title: "Module 1: Startup Costs Worksheet",
    type: "worksheet",
    content: {
      title: "Calculate Your Startup Costs",
      description: "List all your anticipated startup expenses.",
      fields: [
        { id: "equipmentCosts", label: "Equipment & Technology ($)", type: "number", placeholder: "5000", required: true },
        { id: "inventoryCosts", label: "Initial Inventory ($)", type: "number", placeholder: "2000" },
        { id: "legalFees", label: "Legal & Professional Fees ($)", type: "number", placeholder: "1500", required: true },
        { id: "licensingFees", label: "Licenses & Permits ($)", type: "number", placeholder: "500" },
        { id: "marketingBudget", label: "Initial Marketing ($)", type: "number", placeholder: "2000" },
        { id: "operatingReserve", label: "Operating Reserve (3-6 months) ($)", type: "number", placeholder: "15000", required: true },
      ],
      outputTemplate: "STARTUP COSTS SUMMARY\n\nEquipment & Technology: ${{equipmentCosts}}\nInitial Inventory: ${{inventoryCosts}}\nLegal & Professional: ${{legalFees}}\nLicenses & Permits: ${{licensingFees}}\nInitial Marketing: ${{marketingBudget}}\nOperating Reserve: ${{operatingReserve}}\n\nTOTAL STARTUP COSTS: Calculate sum of above",
    } as WorksheetContent,
  },
  {
    id: 4,
    title: "Module 2: Revenue Projections",
    type: "lesson",
    content: {
      title: "Forecasting Your Income",
      sections: [
        {
          heading: "Revenue Streams",
          text: "Identify all the ways your business will make money. Most businesses have multiple revenue streams: product sales, service fees, subscriptions, licensing, affiliate income, etc.",
        },
        {
          heading: "Bottom-Up Forecasting",
          text: "Start with realistic assumptions: How many customers can you serve? What's your average transaction value? How often do customers buy? Multiply these to get revenue projections.",
          tips: [
            "Be conservative in your estimates",
            "Base assumptions on market research",
            "Plan for slow growth in year one",
          ],
        },
        {
          heading: "Seasonal Variations",
          text: "Most businesses have busy and slow seasons. Account for this in your monthly projections. Retail peaks in Q4, services may slow in summer, B2B slows in December.",
        },
        {
          heading: "Growth Assumptions",
          text: "Project 3-5 years of revenue. Year 1 is typically slow as you build awareness. Year 2-3 shows growth as you refine operations. Be realistic about growth rates (20-50% annually for small businesses).",
        },
      ],
      keyTakeaways: [
        "Identify all potential revenue streams",
        "Use bottom-up calculations, not wishful thinking",
        "Account for seasonal variations",
        "Project conservatively for year one",
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
          question: "What is bottom-up forecasting?",
          options: ["Guessing total revenue", "Starting with realistic unit assumptions and multiplying", "Copying competitor numbers", "Using industry averages"],
          correctIndex: 1,
          explanation: "Bottom-up forecasting builds revenue projections from realistic assumptions about customers, transactions, and frequency.",
        },
        {
          question: "What's a realistic annual growth rate for a small business?",
          options: ["100-200%", "20-50%", "500%", "5%"],
          correctIndex: 1,
          explanation: "20-50% annual growth is realistic for most small businesses after the first year.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 6,
    title: "Module 2: Revenue Worksheet",
    type: "worksheet",
    content: {
      title: "Revenue Projections",
      description: "Project your business income.",
      fields: [
        { id: "productRevenue", label: "Monthly Product Revenue ($)", type: "number", placeholder: "5000" },
        { id: "serviceRevenue", label: "Monthly Service Revenue ($)", type: "number", placeholder: "3000" },
        { id: "yearOneRevenue", label: "Year 1 Total Revenue ($)", type: "number", placeholder: "60000", required: true },
        { id: "yearTwoRevenue", label: "Year 2 Total Revenue ($)", type: "number", placeholder: "90000", required: true },
        { id: "yearThreeRevenue", label: "Year 3 Total Revenue ($)", type: "number", placeholder: "120000", required: true },
      ],
      outputTemplate: "REVENUE PROJECTIONS\n\nMonthly Revenue:\n- Products: ${{productRevenue}}\n- Services: ${{serviceRevenue}}\n\nAnnual Projections:\n- Year 1: ${{yearOneRevenue}}\n- Year 2: ${{yearTwoRevenue}}\n- Year 3: ${{yearThreeRevenue}}",
    } as WorksheetContent,
  },
  {
    id: 7,
    title: "Module 3: Operating Expenses",
    type: "lesson",
    content: {
      title: "Understanding Your Costs",
      sections: [
        {
          heading: "Fixed vs Variable Costs",
          text: "Fixed costs stay the same regardless of sales (rent, insurance, salaries). Variable costs change with sales volume (materials, shipping, commissions). Understanding this distinction is crucial for profitability analysis.",
        },
        {
          heading: "Common Operating Expenses",
          text: "Rent/Mortgage, Utilities, Salaries & Wages, Insurance, Marketing & Advertising, Supplies, Professional Services, Software & Subscriptions, Maintenance, Taxes.",
          tips: [
            "Track every expense from day one",
            "Review expenses monthly for optimization",
            "Negotiate better rates as you grow",
          ],
        },
        {
          heading: "Cost Control",
          text: "Regularly review expenses to find savings. Negotiate with vendors, eliminate unused subscriptions, consider remote work to reduce rent, and automate repetitive tasks.",
        },
        {
          heading: "Owner's Salary",
          text: "Don't forget to pay yourself! Many new business owners skip their salary, but this isn't sustainable. Include a reasonable owner's salary in your expense projections.",
        },
      ],
      keyTakeaways: [
        "Separate fixed and variable costs",
        "Track every expense from day one",
        "Include owner's salary in projections",
        "Review and optimize costs regularly",
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
          question: "Which is an example of a fixed cost?",
          options: ["Raw materials", "Shipping costs", "Monthly rent", "Sales commissions"],
          correctIndex: 2,
          explanation: "Rent stays the same regardless of how much you sell, making it a fixed cost.",
        },
        {
          question: "Why should business owners include their own salary in projections?",
          options: ["For tax evasion", "To ensure the business can sustain the owner long-term", "It's not necessary", "To impress investors"],
          correctIndex: 1,
          explanation: "Including owner's salary ensures the business model is sustainable and the owner can be compensated fairly.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 9,
    title: "Module 3: Expenses Worksheet",
    type: "worksheet",
    content: {
      title: "Monthly Operating Expenses",
      description: "Calculate your ongoing monthly costs.",
      fields: [
        { id: "rent", label: "Rent/Mortgage ($)", type: "number", placeholder: "1500" },
        { id: "utilities", label: "Utilities ($)", type: "number", placeholder: "300" },
        { id: "salaries", label: "Salaries & Wages ($)", type: "number", placeholder: "4000", required: true },
        { id: "insurance", label: "Insurance ($)", type: "number", placeholder: "500" },
        { id: "marketing", label: "Marketing ($)", type: "number", placeholder: "500" },
        { id: "supplies", label: "Supplies & Materials ($)", type: "number", placeholder: "800" },
      ],
      outputTemplate: "MONTHLY OPERATING EXPENSES\n\nRent/Mortgage: ${{rent}}\nUtilities: ${{utilities}}\nSalaries & Wages: ${{salaries}}\nInsurance: ${{insurance}}\nMarketing: ${{marketing}}\nSupplies: ${{supplies}}\n\nTOTAL MONTHLY EXPENSES: Calculate sum of above",
    } as WorksheetContent,
  },
  {
    id: 10,
    title: "Module 4: Cash Flow Management",
    type: "lesson",
    content: {
      title: "Managing Money In and Out",
      sections: [
        {
          heading: "Cash Flow vs Profit",
          text: "A profitable business can still fail if it runs out of cash. Cash flow tracks the actual movement of money in and out of your business. You can be profitable on paper but cash-poor in reality.",
        },
        {
          heading: "Cash Flow Statement",
          text: "Track three categories: Operating activities (day-to-day business), Investing activities (equipment, assets), and Financing activities (loans, investments). The goal is positive cash flow.",
          tips: [
            "Create monthly cash flow projections",
            "Update weekly with actual numbers",
            "Plan for timing differences",
          ],
        },
        {
          heading: "Improving Cash Flow",
          text: "Invoice promptly and follow up on late payments. Negotiate longer payment terms with suppliers. Offer early payment discounts to customers. Manage inventory to avoid tying up cash.",
        },
        {
          heading: "Cash Flow Forecasting",
          text: "Project cash flow 12 months ahead. Identify potential shortfalls before they happen. Plan for seasonal variations. Build relationships with lenders before you need them.",
        },
      ],
      keyTakeaways: [
        "Cash flow is different from profit",
        "Positive cash flow is essential for survival",
        "Forecast 12 months ahead",
        "Address shortfalls before they become crises",
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
          question: "Can a profitable business fail?",
          options: ["No, profit guarantees success", "Yes, if it runs out of cash", "Only in recessions", "Never"],
          correctIndex: 1,
          explanation: "A business can be profitable on paper but fail if it doesn't have enough cash to pay bills when they're due.",
        },
        {
          question: "How far ahead should you forecast cash flow?",
          options: ["1 month", "3 months", "12 months", "5 years"],
          correctIndex: 2,
          explanation: "12-month cash flow forecasting helps identify potential shortfalls and plan accordingly.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 12,
    title: "Module 4: Cash Flow Worksheet",
    type: "worksheet",
    content: {
      title: "Monthly Cash Flow Projection",
      description: "Track money coming in and going out.",
      fields: [
        { id: "openingBalance", label: "Opening Cash Balance ($)", type: "number", placeholder: "10000", required: true },
        { id: "monthlyInflow", label: "Expected Monthly Cash Inflow ($)", type: "number", placeholder: "8000", required: true },
        { id: "monthlyOutflow", label: "Expected Monthly Cash Outflow ($)", type: "number", placeholder: "7000", required: true },
      ],
      outputTemplate: "CASH FLOW PROJECTION\n\nOpening Balance: ${{openingBalance}}\nMonthly Inflow: ${{monthlyInflow}}\nMonthly Outflow: ${{monthlyOutflow}}\nNet Cash Flow: ${{monthlyInflow}} - ${{monthlyOutflow}}\nClosing Balance: Opening + Net Cash Flow",
    } as WorksheetContent,
  },
  {
    id: 13,
    title: "Module 5: Break-Even Analysis",
    type: "lesson",
    content: {
      title: "When Will You Make Money?",
      sections: [
        {
          heading: "What is Break-Even?",
          text: "The break-even point is when total revenue equals total costs. Before break-even, you're losing money. After break-even, you're profitable. Knowing this number helps you set goals and make decisions.",
        },
        {
          heading: "The Break-Even Formula",
          text: "Break-Even Units = Fixed Costs ÷ (Price per Unit - Variable Cost per Unit). The difference between price and variable cost is called the 'contribution margin' - what each sale contributes toward covering fixed costs.",
          tips: [
            "Calculate for each product/service",
            "Update when costs or prices change",
            "Use for pricing decisions",
          ],
        },
        {
          heading: "Using Break-Even Analysis",
          text: "Set sales targets based on break-even. Evaluate pricing changes. Decide whether to add products or services. Assess the impact of cost increases. Plan for profitability.",
        },
        {
          heading: "Beyond Break-Even",
          text: "Break-even is survival, not success. Set profit targets above break-even. Calculate how many additional units you need for your desired profit. Build in margin for growth and reinvestment.",
        },
      ],
      keyTakeaways: [
        "Break-even = Fixed Costs ÷ Contribution Margin",
        "Know your break-even point for each product",
        "Use it for pricing and goal-setting",
        "Aim for profit, not just break-even",
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
          question: "What is the contribution margin?",
          options: ["Total revenue", "Price minus variable cost per unit", "Fixed costs", "Net profit"],
          correctIndex: 1,
          explanation: "Contribution margin is what each sale contributes toward covering fixed costs after variable costs are paid.",
        },
        {
          question: "If fixed costs are $10,000 and contribution margin is $50, what's the break-even point?",
          options: ["50 units", "100 units", "200 units", "500 units"],
          correctIndex: 2,
          explanation: "$10,000 ÷ $50 = 200 units needed to break even.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 15,
    title: "Module 5: Break-Even Worksheet",
    type: "worksheet",
    content: {
      title: "Break-Even Analysis",
      description: "Calculate when your business becomes profitable.",
      fields: [
        { id: "fixedCosts", label: "Total Monthly Fixed Costs ($)", type: "number", placeholder: "5000", required: true },
        { id: "pricePerUnit", label: "Average Price per Unit/Service ($)", type: "number", placeholder: "100", required: true },
        { id: "variableCostPerUnit", label: "Variable Cost per Unit ($)", type: "number", placeholder: "40", required: true },
      ],
      outputTemplate: "BREAK-EVEN ANALYSIS\n\nFixed Costs: ${{fixedCosts}}/month\nPrice per Unit: ${{pricePerUnit}}\nVariable Cost per Unit: ${{variableCostPerUnit}}\nContribution Margin: ${{pricePerUnit}} - ${{variableCostPerUnit}}\n\nBreak-Even Point: {{fixedCosts}} ÷ ({{pricePerUnit}} - {{variableCostPerUnit}}) units per month",
    } as WorksheetContent,
  },
  {
    id: 16,
    title: "Module 6: Funding Your Business",
    type: "lesson",
    content: {
      title: "Securing Capital",
      sections: [
        {
          heading: "Funding Sources",
          text: "Personal savings (bootstrapping), Friends and family, Bank loans, SBA loans, Grants, Angel investors, Venture capital, Crowdfunding. Each has pros, cons, and requirements.",
        },
        {
          heading: "Bootstrapping",
          text: "Using personal savings and revenue to fund growth. Maintains full ownership and control. Requires patience and careful cash management. Best for businesses that can start small.",
          tips: [
            "Start lean and prove the concept",
            "Reinvest profits for growth",
            "Avoid unnecessary debt",
          ],
        },
        {
          heading: "Debt Financing",
          text: "Loans from banks, SBA, or alternative lenders. You keep ownership but must repay with interest. Requires good credit and often collateral. SBA loans offer favorable terms for small businesses.",
        },
        {
          heading: "Equity Financing",
          text: "Selling ownership stake to investors. No repayment required but you give up control and profits. Best for high-growth businesses. Investors expect significant returns.",
        },
        {
          heading: "Grants",
          text: "Free money that doesn't need to be repaid. Highly competitive. Available for specific purposes (research, community development, minority-owned businesses). Requires detailed applications.",
        },
      ],
      keyTakeaways: [
        "Match funding source to your needs and stage",
        "Bootstrapping preserves ownership",
        "Debt must be repaid; equity gives up ownership",
        "Grants are competitive but don't require repayment",
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
          question: "What is bootstrapping?",
          options: ["Taking venture capital", "Using personal savings and revenue to fund growth", "Getting a bank loan", "Crowdfunding"],
          correctIndex: 1,
          explanation: "Bootstrapping means funding your business through personal savings and reinvesting revenue, maintaining full ownership.",
        },
        {
          question: "What's the main advantage of grant funding?",
          options: ["Easy to get", "Doesn't need to be repaid", "Gives you investors", "Provides mentorship"],
          correctIndex: 1,
          explanation: "Grants are essentially free money that doesn't need to be repaid, though they're competitive to obtain.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 18,
    title: "Module 6: Funding Worksheet",
    type: "worksheet",
    content: {
      title: "Funding Plan",
      description: "Plan how you'll fund your business.",
      fields: [
        { id: "ownerInvestment", label: "Owner Investment ($)", type: "number", placeholder: "10000", required: true },
        { id: "loans", label: "Loans ($)", type: "number", placeholder: "20000" },
        { id: "grants", label: "Grants ($)", type: "number", placeholder: "5000" },
        { id: "investors", label: "Investor Capital ($)", type: "number", placeholder: "0" },
      ],
      outputTemplate: "FUNDING PLAN\n\nOwner Investment: ${{ownerInvestment}}\nLoans: ${{loans}}\nGrants: ${{grants}}\nInvestor Capital: ${{investors}}\n\nTOTAL FUNDING: Calculate sum of above",
    } as WorksheetContent,
  },
];

interface FinancialCourseProps {
  onComplete: (data: FinancialData, tokensEarned: number) => void;
  onExit: () => void;
}

export default function FinancialCourse({ onComplete, onExit }: FinancialCourseProps) {
  const [currentModule, setCurrentModule] = useState(0);
  const [financialData, setFinancialData] = useState<FinancialData>({
    equipmentCosts: "",
    inventoryCosts: "",
    legalFees: "",
    licensingFees: "",
    marketingBudget: "",
    operatingReserve: "",
    totalStartupCosts: "",
    productRevenue: "",
    serviceRevenue: "",
    monthlyRevenue: "",
    yearOneRevenue: "",
    yearTwoRevenue: "",
    yearThreeRevenue: "",
    rent: "",
    utilities: "",
    salaries: "",
    insurance: "",
    marketing: "",
    supplies: "",
    monthlyExpenses: "",
    openingBalance: "",
    monthlyInflow: "",
    monthlyOutflow: "",
    closingBalance: "",
    fixedCosts: "",
    variableCostPerUnit: "",
    pricePerUnit: "",
    breakEvenUnits: "",
    ownerInvestment: "",
    loans: "",
    grants: "",
    investors: "",
    totalFunding: "",
    grossMargin: "",
    netMargin: "",
    customerAcquisitionCost: "",
    lifetimeValue: "",
  });
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  const module = financialModules[currentModule];
  const progress = ((currentModule + 1) / financialModules.length) * 100;

  const handleWorksheetChange = (fieldId: string, value: string) => {
    setFinancialData((prev) => ({ ...prev, [fieldId]: value }));
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
    
    if (currentModule < financialModules.length - 1) {
      setCurrentModule(currentModule + 1);
      setQuizAnswers([]);
      setShowQuizResults(false);
    } else {
      onComplete(financialData, totalTokens + 50);
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
        <DollarSign className="w-8 h-8 text-accent" />
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

      <Card className="p-6 bg-green-500/5 border-green-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-foreground">Key Takeaways</span>
        </div>
        <ul className="space-y-2">
          {content.keyTakeaways.map((takeaway, i) => (
            <li key={i} className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
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
        <Calculator className="w-8 h-8 text-accent" />
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
              {field.type === "number" ? (
                <Input
                  id={field.id}
                  type="number"
                  placeholder={field.placeholder}
                  value={(financialData as any)[field.id] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  className="min-h-[48px]"
                />
              ) : field.type === "textarea" ? (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(financialData as any)[field.id] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  rows={4}
                />
              ) : (
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(financialData as any)[field.id] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  className="min-h-[48px]"
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {Object.values(financialData).some((v) => v) && (
        <Card className="p-6 bg-green-500/5 border-green-500/20">
          <h3 className="font-semibold text-foreground mb-3">Preview</h3>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
            {content.outputTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => (financialData as any)[key] || `[${key}]`)}
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
            Module {currentModule + 1} of {financialModules.length}
          </p>
          <p className="font-bold text-green-600">{totalTokens} tokens earned</p>
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
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
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
          {currentModule === financialModules.length - 1 ? "Complete Course" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
