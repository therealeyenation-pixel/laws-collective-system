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
  DollarSign,
  Search,
  FileCheck,
  Send,
  Calendar,
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

interface GrantData {
  organizationName: string;
  entityType: string;
  ein: string;
  missionStatement: string;
  programName: string;
  programDescription: string;
  targetPopulation: string;
  geographicArea: string;
  problemStatement: string;
  proposedSolution: string;
  goals: string;
  objectives: string;
  activities: string;
  timeline: string;
  evaluationPlan: string;
  personnelBudget: string;
  operatingBudget: string;
  totalBudget: string;
  otherFunding: string;
  sustainability: string;
}

interface GrantWritingCourseProps {
  onExit: () => void;
  onComplete: (tokens: number) => void;
  connectedEntity?: { name: string; type: string };
}

const grantModules: CourseModule[] = [
  {
    id: 1,
    title: "Module 1: Grant Fundamentals",
    type: "lesson",
    content: {
      title: "Understanding the Grant Landscape",
      sections: [
        {
          heading: "What Are Grants?",
          text: "Grants are funds given by government agencies, foundations, or corporations to support specific projects or programs. Unlike loans, grants do not need to be repaid. They are competitive awards based on the strength of your proposal and alignment with the funder's priorities.",
          tips: [
            "Grants fund specific projects, not general operations (usually)",
            "Competition can be fierce - preparation is key",
            "Building relationships with funders increases success",
          ],
        },
        {
          heading: "Types of Grants",
          text: "Federal grants come from government agencies and often have strict requirements. Foundation grants come from private or family foundations with specific focus areas. Corporate grants come from businesses as part of their social responsibility programs. Each type has different application processes and reporting requirements.",
        },
        {
          heading: "Grant Eligibility",
          text: "Most grants require 501(c)(3) or 508(c)(1)(a) tax-exempt status. Some grants are available to other entity types for specific purposes. Government grants may be available to for-profit businesses for research or economic development. Always verify eligibility before investing time in an application.",
          tips: [
            "501(c)(3) status opens the most grant opportunities",
            "508(c)(1)(a) organizations have similar eligibility",
            "Some funders accept fiscal sponsorship arrangements",
          ],
        },
        {
          heading: "The Grant Cycle",
          text: "Grants follow a cycle: Research and identify opportunities, prepare and submit applications, receive award decisions, implement funded programs, and report on outcomes. Understanding this cycle helps you plan your grant-seeking strategy effectively.",
        },
      ],
      keyTakeaways: [
        "Grants are competitive awards that don't require repayment",
        "Different grant types have different requirements and processes",
        "Tax-exempt status significantly expands grant eligibility",
        "Success requires understanding the full grant cycle",
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
          question: "What is the primary difference between a grant and a loan?",
          options: [
            "Grants have higher interest rates",
            "Grants do not need to be repaid",
            "Loans are only for nonprofits",
            "There is no difference",
          ],
          correctIndex: 1,
          explanation: "Unlike loans, grants are awards that do not need to be repaid, making them highly valuable for funding programs and projects.",
        },
        {
          question: "Which tax-exempt status opens the most grant opportunities?",
          options: [
            "501(c)(4)",
            "501(c)(6)",
            "501(c)(3)",
            "527",
          ],
          correctIndex: 2,
          explanation: "501(c)(3) status is the most widely recognized for charitable purposes and opens the most grant opportunities from foundations and government agencies.",
        },
        {
          question: "What is the first step in the grant cycle?",
          options: [
            "Submit application",
            "Research and identify opportunities",
            "Report on outcomes",
            "Implement the program",
          ],
          correctIndex: 1,
          explanation: "The grant cycle begins with researching and identifying appropriate funding opportunities that align with your organization's mission and programs.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 3,
    title: "Module 1: Organization Profile Worksheet",
    type: "worksheet",
    content: {
      title: "Organization Profile",
      description: "Create your organization profile that will be used across all grant applications.",
      fields: [
        { id: "organizationName", label: "Organization Name", type: "text", placeholder: "Enter your organization's legal name", required: true },
        { id: "entityType", label: "Entity Type", type: "select", options: [
            "501(c)(3) Nonprofit",
            "508(c)(1)(a) Faith-Based",
            "LLC",
            "Corporation",
            "Trust",
            "Other",
          ], required: true },
        { id: "ein", label: "EIN (if applicable)", type: "text", placeholder: "XX-XXXXXXX", required: false },
        { id: "missionStatement", label: "Mission Statement", type: "textarea", placeholder: "Enter your organization's mission statement", required: true },
      ],
      outputTemplate: "Organization Profile:\n{{organizationName}}\nEntity Type: {{entityType}}\nEIN: {{ein}}\nMission: {{missionStatement}}",
    } as WorksheetContent,
  },
  {
    id: 4,
    title: "Module 2: Grant Research",
    type: "lesson",
    content: {
      title: "Finding the Right Grants",
      sections: [
        {
          heading: "Research Strategy",
          text: "Effective grant research starts with understanding your organization's needs and strengths. Identify your programs, target populations, and geographic focus. Then search for funders whose priorities align with your work. Quality matches are more important than quantity.",
          tips: [
            "Start with local and regional funders",
            "Look at who funds similar organizations",
            "Build a prospect list and track deadlines",
          ],
        },
        {
          heading: "Grant Databases and Resources",
          text: "Use grant databases like Foundation Directory Online, Grants.gov (for federal grants), and state/local grant portals. Many community foundations publish their grant opportunities. Corporate giving programs are often listed on company websites.",
        },
        {
          heading: "Reading Funding Guidelines",
          text: "Carefully read each funder's guidelines before applying. Note eligibility requirements, funding priorities, geographic restrictions, and application deadlines. Pay attention to what they will and won't fund. Following guidelines exactly is critical.",
          tips: [
            "Never assume - always verify eligibility",
            "Note required attachments and formats",
            "Respect page limits and word counts",
          ],
        },
        {
          heading: "Building Funder Relationships",
          text: "Grant success often depends on relationships. Attend funder information sessions, introduce yourself at community events, and follow funders on social media. Some funders welcome pre-application conversations to discuss fit.",
        },
      ],
      keyTakeaways: [
        "Quality matches matter more than quantity of applications",
        "Use multiple research sources to find opportunities",
        "Read and follow guidelines exactly",
        "Relationship-building increases success rates",
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
          question: "What is the most important factor in grant research?",
          options: [
            "Finding the largest grants",
            "Finding grants with the easiest applications",
            "Finding grants that align with your mission",
            "Finding grants with the longest deadlines",
          ],
          correctIndex: 2,
          explanation: "The most important factor is finding grants that align with your organization's mission and programs. A good fit increases your chances of success.",
        },
        {
          question: "What should you do before starting a grant application?",
          options: [
            "Start writing immediately",
            "Carefully read the funding guidelines",
            "Contact the funder to negotiate terms",
            "Submit a draft proposal",
          ],
          correctIndex: 1,
          explanation: "Always carefully read the funding guidelines before starting an application to ensure eligibility and understand all requirements.",
        },
        {
          question: "Why is relationship-building important in grant seeking?",
          options: [
            "It guarantees funding",
            "It allows you to skip the application",
            "It increases success rates and understanding of funder priorities",
            "It is not important",
          ],
          correctIndex: 2,
          explanation: "Building relationships with funders helps you understand their priorities better and can increase your success rates, though it never guarantees funding.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 6,
    title: "Module 2: Program Description Worksheet",
    type: "worksheet",
    content: {
      title: "Program Description",
      description: "Define the program you're seeking funding for.",
      fields: [
        { id: "programName", label: "Program Name", type: "text", placeholder: "Enter the name of your program", required: true },
        { id: "programDescription", label: "Program Description", type: "textarea", placeholder: "Describe your program in 2-3 paragraphs", required: true },
        { id: "targetPopulation", label: "Target Population", type: "textarea", placeholder: "Who does this program serve?", required: true },
        { id: "geographicArea", label: "Geographic Service Area", type: "text", placeholder: "City, county, region, etc.", required: true },
      ],
      outputTemplate: "Program: {{programName}}\nDescription: {{programDescription}}\nTarget Population: {{targetPopulation}}\nService Area: {{geographicArea}}",
    } as WorksheetContent,
  },
  {
    id: 7,
    title: "Module 3: The Problem Statement",
    type: "lesson",
    content: {
      title: "Writing a Compelling Problem Statement",
      sections: [
        {
          heading: "What is a Problem Statement?",
          text: "The problem statement (or statement of need) describes the issue your program addresses. It establishes why funding is needed and sets the stage for your proposed solution. A strong problem statement uses data and stories to make the case compelling.",
          tips: [
            "Use recent, credible data to support your claims",
            "Include both statistics and human stories",
            "Connect the problem to the funder's priorities",
          ],
        },
        {
          heading: "Components of a Strong Problem Statement",
          text: "Include: the nature and scope of the problem, who is affected and how, what causes or contributes to the problem, what happens if the problem isn't addressed, and why your organization is positioned to help. Be specific and avoid generalizations.",
        },
        {
          heading: "Using Data Effectively",
          text: "Use local data when possible - funders want to see the problem in your community. Cite credible sources (government data, research studies, community assessments). Compare local data to state or national averages to show severity.",
          tips: [
            "Census data, health department reports, and school data are good sources",
            "Update your data regularly",
            "Explain what the numbers mean in human terms",
          ],
        },
        {
          heading: "Common Mistakes to Avoid",
          text: "Don't make the problem seem hopeless - funders want to invest in solutions. Don't blame victims or use stigmatizing language. Don't assume the reader knows your community. Don't use outdated data or unsourced claims.",
        },
      ],
      keyTakeaways: [
        "Problem statements establish the need for funding",
        "Use both data and stories for maximum impact",
        "Be specific to your community and population",
        "Avoid hopelessness - show the problem is solvable",
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
          question: "What is the purpose of a problem statement in a grant proposal?",
          options: [
            "To criticize current solutions",
            "To establish why funding is needed",
            "To describe your organization's history",
            "To list your budget needs",
          ],
          correctIndex: 1,
          explanation: "The problem statement establishes the need for funding by describing the issue your program will address and why it matters.",
        },
        {
          question: "What type of data is most effective in a problem statement?",
          options: [
            "National averages only",
            "Outdated historical data",
            "Local, recent, credible data",
            "Anecdotal stories only",
          ],
          correctIndex: 2,
          explanation: "Local, recent, and credible data is most effective because it shows the problem in your specific community where the program will operate.",
        },
        {
          question: "What should you avoid in a problem statement?",
          options: [
            "Using statistics",
            "Making the problem seem hopeless",
            "Describing who is affected",
            "Citing sources",
          ],
          correctIndex: 1,
          explanation: "Avoid making the problem seem hopeless. Funders want to invest in solutions, so show that the problem is serious but solvable.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 9,
    title: "Module 3: Problem Statement Worksheet",
    type: "worksheet",
    content: {
      title: "Problem Statement Development",
      description: "Develop the problem statement for your grant proposal.",
      fields: [
        { id: "problemStatement", label: "Problem Statement", type: "textarea", placeholder: "Describe the problem your program addresses. Include data and context.", required: true },
        { id: "proposedSolution", label: "Proposed Solution Overview", type: "textarea", placeholder: "Briefly describe how your program will address this problem.", required: true },
      ],
      outputTemplate: "PROBLEM STATEMENT:\n{{problemStatement}}\n\nPROPOSED SOLUTION:\n{{proposedSolution}}",
    } as WorksheetContent,
  },
  {
    id: 10,
    title: "Module 4: Goals, Objectives & Activities",
    type: "lesson",
    content: {
      title: "Designing Your Program Logic",
      sections: [
        {
          heading: "Goals vs. Objectives",
          text: "Goals are broad statements of what you want to achieve. Objectives are specific, measurable steps toward those goals. Think of goals as the destination and objectives as the milestones along the way. Every objective should connect to a goal.",
          tips: [
            "Goals answer 'What do we want to achieve?'",
            "Objectives answer 'How will we know we achieved it?'",
            "Use SMART criteria for objectives",
          ],
        },
        {
          heading: "SMART Objectives",
          text: "SMART objectives are: Specific (clear and focused), Measurable (quantifiable), Achievable (realistic), Relevant (connected to the problem), and Time-bound (with deadlines). Example: 'Increase reading proficiency by 20% among 50 third-grade students by May 2025.'",
        },
        {
          heading: "Activities and Methods",
          text: "Activities are the specific actions you'll take to achieve objectives. Be detailed about what you'll do, who will do it, and how often. Activities should logically lead to achieving your objectives.",
          tips: [
            "List activities in chronological order",
            "Include frequency and duration",
            "Identify who is responsible for each activity",
          ],
        },
        {
          heading: "Logic Model Basics",
          text: "A logic model shows the logical connections between your inputs (resources), activities, outputs (what you produce), and outcomes (changes that result). Many funders require or appreciate logic models as they show clear program thinking.",
        },
      ],
      keyTakeaways: [
        "Goals are broad; objectives are specific and measurable",
        "Use SMART criteria for all objectives",
        "Activities should logically lead to objectives",
        "Logic models demonstrate clear program design",
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
          question: "What does the 'M' in SMART objectives stand for?",
          options: [
            "Meaningful",
            "Measurable",
            "Manageable",
            "Motivated",
          ],
          correctIndex: 1,
          explanation: "The 'M' stands for Measurable, meaning the objective should be quantifiable so you can track progress and determine if it was achieved.",
        },
        {
          question: "What is the relationship between goals and objectives?",
          options: [
            "They are the same thing",
            "Goals are specific; objectives are broad",
            "Goals are broad; objectives are specific steps toward goals",
            "They are unrelated",
          ],
          correctIndex: 2,
          explanation: "Goals are broad statements of what you want to achieve, while objectives are specific, measurable steps that lead toward achieving those goals.",
        },
        {
          question: "What does a logic model show?",
          options: [
            "Your organization's history",
            "The connections between inputs, activities, outputs, and outcomes",
            "Your budget breakdown",
            "Staff qualifications",
          ],
          correctIndex: 1,
          explanation: "A logic model shows the logical connections between your resources (inputs), what you do (activities), what you produce (outputs), and the changes that result (outcomes).",
        },
      ],
    } as QuizContent,
  },
  {
    id: 12,
    title: "Module 4: Goals & Objectives Worksheet",
    type: "worksheet",
    content: {
      title: "Goals, Objectives & Activities",
      description: "Define the goals, objectives, and activities for your program.",
      fields: [
        { id: "goals", label: "Program Goals", type: "textarea", placeholder: "List 1-3 broad goals for your program", required: true },
        { id: "objectives", label: "SMART Objectives", type: "textarea", placeholder: "List 2-4 specific, measurable objectives", required: true },
        { id: "activities", label: "Key Activities", type: "textarea", placeholder: "List the main activities you'll conduct to achieve objectives", required: true },
        { id: "timeline", label: "Implementation Timeline", type: "textarea", placeholder: "Describe the timeline for your program activities", required: true },
      ],
      outputTemplate: "GOALS:\n{{goals}}\n\nOBJECTIVES:\n{{objectives}}\n\nACTIVITIES:\n{{activities}}\n\nTIMELINE:\n{{timeline}}",
    } as WorksheetContent,
  },
  {
    id: 13,
    title: "Module 5: Evaluation Planning",
    type: "lesson",
    content: {
      title: "Measuring Success",
      sections: [
        {
          heading: "Why Evaluation Matters",
          text: "Evaluation demonstrates accountability to funders and helps you improve your programs. It answers: Did we do what we said we would? Did it make a difference? Funders increasingly require evaluation plans and outcome data.",
          tips: [
            "Build evaluation into program design from the start",
            "Collect baseline data before the program begins",
            "Plan for both process and outcome evaluation",
          ],
        },
        {
          heading: "Process vs. Outcome Evaluation",
          text: "Process evaluation tracks implementation: Did you serve the intended number of people? Did you conduct planned activities? Outcome evaluation measures results: Did participants' knowledge, skills, or behaviors change? Both are important.",
        },
        {
          heading: "Data Collection Methods",
          text: "Common methods include surveys, interviews, focus groups, observation, and review of records. Choose methods appropriate to what you're measuring. Consider who will collect data and when. Plan for participant confidentiality.",
          tips: [
            "Use pre/post tests to measure change",
            "Mix quantitative and qualitative methods",
            "Keep data collection manageable",
          ],
        },
        {
          heading: "Using Evaluation Results",
          text: "Use evaluation data for program improvement, reporting to funders, and future grant applications. Share successes and lessons learned. Be honest about challenges - funders appreciate transparency and learning.",
        },
      ],
      keyTakeaways: [
        "Evaluation demonstrates accountability and enables improvement",
        "Include both process and outcome evaluation",
        "Plan data collection methods carefully",
        "Use results for improvement and future funding",
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
          question: "What is the difference between process and outcome evaluation?",
          options: [
            "Process is more expensive than outcome",
            "Process tracks implementation; outcome measures results",
            "They are the same thing",
            "Outcome is only for large grants",
          ],
          correctIndex: 1,
          explanation: "Process evaluation tracks whether you implemented activities as planned, while outcome evaluation measures whether those activities produced the intended results or changes.",
        },
        {
          question: "When should you start planning evaluation?",
          options: [
            "After the program ends",
            "When the funder asks for a report",
            "From the beginning of program design",
            "Only if required by the funder",
          ],
          correctIndex: 2,
          explanation: "Evaluation should be built into program design from the start so you can collect baseline data and track progress throughout implementation.",
        },
        {
          question: "What should you do with evaluation results?",
          options: [
            "Keep them confidential",
            "Only share positive results",
            "Use them for improvement, reporting, and future applications",
            "Discard them after reporting",
          ],
          correctIndex: 2,
          explanation: "Evaluation results should be used for program improvement, funder reporting, and strengthening future grant applications. Share both successes and lessons learned.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 15,
    title: "Module 5: Evaluation Plan Worksheet",
    type: "worksheet",
    content: {
      title: "Evaluation Plan",
      description: "Develop your program evaluation plan.",
      fields: [
        { id: "evaluationPlan", label: "Evaluation Plan", type: "textarea", placeholder: "Describe how you will evaluate your program. Include what you'll measure, how you'll collect data, and when.", required: true },
      ],
      outputTemplate: "EVALUATION PLAN:\n{{evaluationPlan}}",
    } as WorksheetContent,
  },
  {
    id: 16,
    title: "Module 6: Budget Development",
    type: "lesson",
    content: {
      title: "Creating a Grant Budget",
      sections: [
        {
          heading: "Budget Basics",
          text: "The budget translates your program plan into dollars. It should include all costs necessary to implement your program. Budgets must be realistic, justified, and aligned with your narrative. Most funders require both a budget and budget narrative.",
          tips: [
            "Every budget item should connect to a program activity",
            "Research actual costs - don't guess",
            "Include both direct and indirect costs",
          ],
        },
        {
          heading: "Personnel Costs",
          text: "Personnel often represents the largest budget category. Include salaries/wages, fringe benefits, and the percentage of time each person will dedicate to the project. Be specific about roles and responsibilities.",
        },
        {
          heading: "Operating Costs",
          text: "Operating costs include supplies, equipment, travel, professional services, and other direct costs. Itemize major expenses. Some funders have restrictions on certain costs (like food or equipment) - check guidelines carefully.",
          tips: [
            "Get quotes for major purchases",
            "Include realistic travel costs",
            "Don't forget small but necessary items",
          ],
        },
        {
          heading: "Indirect Costs",
          text: "Indirect costs (overhead) cover organizational expenses that support the project but aren't directly attributable to it (rent, utilities, administration). Many funders limit indirect cost rates. Some don't allow them at all.",
        },
      ],
      keyTakeaways: [
        "Budgets must be realistic and justified",
        "Every cost should connect to program activities",
        "Include personnel, operating, and indirect costs",
        "Check funder restrictions on specific cost categories",
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
          question: "What is typically the largest category in a grant budget?",
          options: [
            "Equipment",
            "Travel",
            "Personnel",
            "Supplies",
          ],
          correctIndex: 2,
          explanation: "Personnel costs (salaries, wages, and benefits) typically represent the largest category in most grant budgets.",
        },
        {
          question: "What are indirect costs?",
          options: [
            "Costs that are hidden from the funder",
            "Organizational expenses that support but aren't directly attributable to the project",
            "Costs that are optional",
            "Costs that are paid by other funders",
          ],
          correctIndex: 1,
          explanation: "Indirect costs (overhead) are organizational expenses like rent, utilities, and administration that support the project but aren't directly attributable to specific project activities.",
        },
        {
          question: "What should accompany a grant budget?",
          options: [
            "A budget narrative explaining and justifying costs",
            "A list of other funders",
            "Staff resumes only",
            "Nothing - the budget stands alone",
          ],
          correctIndex: 0,
          explanation: "Most funders require a budget narrative that explains and justifies each budget line item, showing how costs connect to program activities.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 18,
    title: "Module 6: Budget Worksheet",
    type: "worksheet",
    content: {
      title: "Grant Budget Development",
      description: "Develop your program budget.",
      fields: [
        { id: "personnelBudget", label: "Personnel Costs", type: "textarea", placeholder: "List staff positions, salaries, % time on project, and benefits", required: true },
        { id: "operatingBudget", label: "Operating Costs", type: "textarea", placeholder: "List supplies, equipment, travel, and other direct costs", required: true },
        { id: "totalBudget", label: "Total Budget Request", type: "text", placeholder: "Enter total amount requested (e.g., $50,000)", required: true },
        { id: "otherFunding", label: "Other Funding Sources", type: "textarea", placeholder: "List other funding for this program (grants, donations, earned revenue)", required: false },
        { id: "sustainability", label: "Sustainability Plan", type: "textarea", placeholder: "How will you sustain this program after grant funding ends?", required: true },
      ],
      outputTemplate: "BUDGET SUMMARY:\n\nPersonnel: {{personnelBudget}}\n\nOperating: {{operatingBudget}}\n\nTotal Request: {{totalBudget}}\n\nOther Funding: {{otherFunding}}\n\nSustainability: {{sustainability}}",
    } as WorksheetContent,
  },
  {
    id: 19,
    title: "Course Completion: Grant Proposal Generation",
    type: "worksheet",
    content: {
      title: "Generate Your Grant Proposal Draft",
      description: "Review and download your complete grant proposal draft based on all your worksheet inputs.",
      fields: [],
      outputTemplate: "GRANT PROPOSAL DRAFT\n\nThis document compiles your grant planning work and can be used as a foundation for completing specific grant applications.",
    } as WorksheetContent,
  },
];

export default function GrantWritingCourse({ onExit, onComplete, connectedEntity }: GrantWritingCourseProps) {
  const [currentModule, setCurrentModule] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [grantData, setGrantData] = useState<GrantData>({
    organizationName: connectedEntity?.name || "",
    entityType: connectedEntity?.type || "",
    ein: "",
    missionStatement: "",
    programName: "",
    programDescription: "",
    targetPopulation: "",
    geographicArea: "",
    problemStatement: "",
    proposedSolution: "",
    goals: "",
    objectives: "",
    activities: "",
    timeline: "",
    evaluationPlan: "",
    personnelBudget: "",
    operatingBudget: "",
    totalBudget: "",
    otherFunding: "",
    sustainability: "",
  });

  const module = grantModules[currentModule];
  const progress = ((currentModule + 1) / grantModules.length) * 100;

  const earnTokensMutation = trpc.tokenEconomy.awardTokens.useMutation();

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const submitQuiz = () => {
    const content = module.content as QuizContent;
    let correct = 0;
    content.questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / content.questions.length) * 100);
    setQuizScore(score);
    setShowQuizResults(true);

    const tokensEarned = score >= 70 ? 15 : 5;
    setTotalTokens((prev) => prev + tokensEarned);
    earnTokensMutation.mutate(
      { amount: String(tokensEarned), reason: "simulator_completion", sourceId: currentModule },
      { onError: () => {} }
    );
    toast.success(`Quiz complete! +${tokensEarned} tokens`);
  };

  const handleWorksheetChange = (fieldId: string, value: string) => {
    setGrantData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const nextModule = () => {
    if (currentModule < grantModules.length - 1) {
      if (module.type === "worksheet") {
        const tokensEarned = 10;
        setTotalTokens((prev) => prev + tokensEarned);
        earnTokensMutation.mutate(
          { amount: String(tokensEarned), reason: "simulator_completion", sourceId: currentModule },
          { onError: () => {} }
        );
        toast.success(`Worksheet saved! +${tokensEarned} tokens`);
      }
      setCurrentModule((prev) => prev + 1);
      setQuizAnswers([]);
      setShowQuizResults(false);
    } else {
      const completionTokens = 50;
      setTotalTokens((prev) => prev + completionTokens);
      earnTokensMutation.mutate(
        { amount: String(completionTokens), reason: "simulator_completion" },
        { onError: () => {} }
      );
      toast.success(`Course complete! +${completionTokens} tokens`);
      onComplete(totalTokens + completionTokens);
    }
  };

  const prevModule = () => {
    if (currentModule > 0) {
      setCurrentModule((prev) => prev - 1);
      setQuizAnswers([]);
      setShowQuizResults(false);
    }
  };

  const downloadGrantProposal = () => {
    const content = `
GRANT PROPOSAL DRAFT
Generated by L.A.W.S. Collective Grant Writing Workshop
================================================================================

ORGANIZATION PROFILE
--------------------
Organization Name: ${grantData.organizationName || "[Not specified]"}
Entity Type: ${grantData.entityType || "[Not specified]"}
EIN: ${grantData.ein || "[Not specified]"}

MISSION STATEMENT
-----------------
${grantData.missionStatement || "[Not specified]"}

PROGRAM INFORMATION
-------------------
Program Name: ${grantData.programName || "[Not specified]"}
Target Population: ${grantData.targetPopulation || "[Not specified]"}
Geographic Service Area: ${grantData.geographicArea || "[Not specified]"}

PROGRAM DESCRIPTION
-------------------
${grantData.programDescription || "[Not specified]"}

PROBLEM STATEMENT
-----------------
${grantData.problemStatement || "[Not specified]"}

PROPOSED SOLUTION
-----------------
${grantData.proposedSolution || "[Not specified]"}

GOALS
-----
${grantData.goals || "[Not specified]"}

OBJECTIVES
----------
${grantData.objectives || "[Not specified]"}

ACTIVITIES
----------
${grantData.activities || "[Not specified]"}

TIMELINE
--------
${grantData.timeline || "[Not specified]"}

EVALUATION PLAN
---------------
${grantData.evaluationPlan || "[Not specified]"}

BUDGET
------
Personnel Costs:
${grantData.personnelBudget || "[Not specified]"}

Operating Costs:
${grantData.operatingBudget || "[Not specified]"}

Total Budget Request: ${grantData.totalBudget || "[Not specified]"}

Other Funding Sources:
${grantData.otherFunding || "[Not specified]"}

SUSTAINABILITY PLAN
-------------------
${grantData.sustainability || "[Not specified]"}

================================================================================
DISCLAIMER: This document is a draft for planning purposes. Customize for each
specific grant application and ensure compliance with funder guidelines.
================================================================================
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${grantData.programName || "grant"}-proposal-draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Grant proposal draft downloaded!");
  };

  const renderLesson = (content: LessonContent) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-accent" />
        <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
      </div>

      {content.sections.map((section, i) => (
        <Card key={i} className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            {section.heading}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{section.text}</p>
          {section.tips && (
            <div className="mt-4 p-4 bg-accent/10 rounded-lg">
              <p className="font-semibold text-sm text-foreground mb-2">Key Points:</p>
              <ul className="space-y-1">
                {section.tips.map((tip, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
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

      {/* Connected Entity Display */}
      {connectedEntity && (
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">Connected Business Entity</p>
              <p className="text-muted-foreground">{connectedEntity.name} ({connectedEntity.type})</p>
            </div>
          </div>
        </Card>
      )}

      {content.fields.length > 0 ? (
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
                    value={(grantData as any)[field.id] || ""}
                    onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                    className="min-h-[48px]"
                  />
                )}
                {field.type === "textarea" && (
                  <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    value={(grantData as any)[field.id] || ""}
                    onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                    rows={4}
                  />
                )}
                {field.type === "select" && (
                  <Select
                    value={(grantData as any)[field.id] || ""}
                    onValueChange={(value) => handleWorksheetChange(field.id, value)}
                  >
                    <SelectTrigger className="min-h-[48px]">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        // Final summary/download section
        <Card className="p-6">
          <div className="text-center space-y-6">
            <FileCheck className="w-16 h-16 text-accent mx-auto" />
            <h3 className="text-xl font-bold text-foreground">Your Grant Proposal Draft is Ready!</h3>
            <p className="text-muted-foreground">
              You've completed all modules and worksheets. Download your grant proposal draft to customize for specific funding opportunities.
            </p>
            <Button onClick={downloadGrantProposal} className="gap-2 min-h-[48px]">
              <Download className="w-5 h-5" />
              Download Grant Proposal Draft
            </Button>
          </div>
        </Card>
      )}

      {/* Preview of generated content */}
      {content.fields.length > 0 && Object.values(grantData).some((v) => v) && (
        <Card className="p-6 bg-accent/5 border-accent/20">
          <h3 className="font-semibold text-foreground mb-3">Preview</h3>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
            {content.outputTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => (grantData as any)[key] || `[${key}]`)}
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
            Module {currentModule + 1} of {grantModules.length}
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
          {currentModule === grantModules.length - 1 ? "Complete Course" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
