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
  Shield,
  Users,
  Scale,
  Home,
  Lock,
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

interface TrustData {
  trustName: string;
  trustType: string;
  grantor: string;
  trustee: string;
  successorTrustee: string;
  beneficiaries: string;
  trustPurpose: string;
  assetTypes: string;
  distributionSchedule: string;
  revocabilityTerms: string;
  amendmentProcess: string;
  dissolutionTerms: string;
  inheritanceSplit: string;
  connectedEntity: string;
}

interface TrustCourseProps {
  onExit: () => void;
  onComplete: (tokens: number) => void;
  connectedEntity?: { name: string; type: string };
}

const trustModules: CourseModule[] = [
  {
    id: 1,
    title: "Module 1: Understanding Trusts",
    type: "lesson",
    content: {
      title: "Trust Fundamentals for Wealth Building",
      sections: [
        {
          heading: "What is a Trust?",
          text: "A trust is a legal arrangement where one party (the grantor or settlor) transfers assets to another party (the trustee) to hold and manage for the benefit of a third party (the beneficiary). Trusts are powerful tools for asset protection, tax planning, and generational wealth transfer.",
          tips: [
            "Trusts can hold various assets: real estate, investments, business interests",
            "Properly structured trusts can protect assets from creditors",
            "Trusts can minimize estate taxes and avoid probate",
          ],
        },
        {
          heading: "Key Parties in a Trust",
          text: "Every trust involves three key roles: The Grantor creates the trust and transfers assets into it. The Trustee manages the trust assets according to the trust document. The Beneficiary receives benefits from the trust. In some cases, one person can serve multiple roles.",
        },
        {
          heading: "Revocable vs. Irrevocable Trusts",
          text: "Revocable trusts can be modified or dissolved by the grantor during their lifetime. They offer flexibility but limited asset protection. Irrevocable trusts cannot be easily changed once created, but they offer stronger asset protection and tax benefits.",
          tips: [
            "Revocable trusts become irrevocable upon the grantor's death",
            "Irrevocable trusts remove assets from your taxable estate",
            "Choose based on your primary goals: flexibility vs. protection",
          ],
        },
        {
          heading: "Living Trusts vs. Testamentary Trusts",
          text: "Living trusts are created during the grantor's lifetime and can be funded immediately. Testamentary trusts are created through a will and only take effect after death. Living trusts avoid probate; testamentary trusts do not.",
        },
        {
          heading: "Special Trust Types",
          text: "Beyond basic trusts, there are specialized structures for specific purposes. 98 Trusts and Foreign Trusts offer unique benefits for asset protection and international planning but require specialized knowledge and approval processes.",
          tips: [
            "98 Trusts provide enhanced privacy and asset protection",
            "Foreign Trusts can offer international diversification",
            "Both require careful compliance with reporting requirements",
          ],
        },
      ],
      keyTakeaways: [
        "Trusts separate legal ownership from beneficial ownership",
        "Choose trust type based on your goals: flexibility, protection, or tax benefits",
        "Proper trust administration is essential for maintaining benefits",
        "Specialized trusts require additional expertise and compliance",
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
          question: "What is the primary difference between revocable and irrevocable trusts?",
          options: [
            "Revocable trusts cost more to create",
            "Revocable trusts can be modified by the grantor; irrevocable cannot",
            "Irrevocable trusts have more beneficiaries",
            "There is no significant difference",
          ],
          correctIndex: 1,
          explanation: "Revocable trusts can be changed or dissolved by the grantor during their lifetime, while irrevocable trusts generally cannot be modified once created, offering stronger asset protection.",
        },
        {
          question: "Which party manages trust assets according to the trust document?",
          options: ["Grantor", "Beneficiary", "Trustee", "Attorney"],
          correctIndex: 2,
          explanation: "The trustee is responsible for managing trust assets and distributing them according to the terms of the trust document.",
        },
        {
          question: "What is a key advantage of a living trust over a testamentary trust?",
          options: [
            "Lower creation costs",
            "Avoids probate",
            "More beneficiaries allowed",
            "Simpler tax reporting",
          ],
          correctIndex: 1,
          explanation: "Living trusts avoid the probate process because assets are already titled in the trust's name, allowing for faster and more private asset transfer.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 3,
    title: "Module 1: Trust Selection Worksheet",
    type: "worksheet",
    content: {
      title: "Trust Type Selection",
      description: "Based on what you've learned, let's determine the best trust type for your wealth-building goals.",
      fields: [
        { id: "trustName", label: "Trust Name", type: "text", placeholder: "Enter your trust name (e.g., The Smith Family Trust)", required: true },
        { id: "trustType", label: "Trust Type", type: "select", options: [
            { value: "Revocable Living Trust", label: "Revocable Living Trust" },
            { value: "Irrevocable Trust", label: "Irrevocable Trust" },
            { value: "Family Trust", label: "Family Trust" },
            { value: "Asset Protection Trust", label: "Asset Protection Trust" },
            { value: "Charitable Trust", label: "Charitable Trust" },
            { value: "98 Trust", label: "98 Trust", disabled: true, requiresApproval: true },
            { value: "Foreign Trust", label: "Foreign Trust", disabled: true, requiresApproval: true },
          ], required: true },
        { id: "connectedEntity", label: "Connected Business Entity", type: "text", placeholder: "Enter the business entity this trust will hold", required: false },
      ],
      outputTemplate: "Trust Selection: {{trustName}} will be structured as a {{trustType}}. Connected Entity: {{connectedEntity}}",
    } as WorksheetContent,
  },
  {
    id: 4,
    title: "Module 2: Trust Structure & Parties",
    type: "lesson",
    content: {
      title: "Defining Your Trust Structure",
      sections: [
        {
          heading: "Choosing Your Trustee",
          text: "The trustee is the most important decision in trust creation. They have fiduciary duty to act in the best interests of beneficiaries. You can serve as your own trustee for revocable trusts, appoint a family member, or use a professional trustee.",
          tips: [
            "Consider trustworthiness, financial acumen, and availability",
            "Corporate trustees offer continuity but charge fees",
            "Always name successor trustees in case the primary cannot serve",
          ],
        },
        {
          heading: "Identifying Beneficiaries",
          text: "Beneficiaries are those who benefit from the trust. They can be individuals, organizations, or even other trusts. You can name primary beneficiaries (first in line) and contingent beneficiaries (backup if primary cannot receive).",
        },
        {
          heading: "The House Structure",
          text: "In multi-generational wealth building, the 'House' represents your family's wealth-holding structure. The trust serves as the foundation of the House, holding business entities, real estate, and other assets for the benefit of current and future generations.",
          tips: [
            "The House structure enables generational wealth transfer",
            "Business entities flow into the trust for protection",
            "Proper structuring ensures continuity across generations",
          ],
        },
        {
          heading: "Inheritance Splits: 60/40 and 70/30",
          text: "The inheritance split determines how trust assets are distributed. A 60/40 split might allocate 60% to direct heirs and 40% to a family fund for education or emergencies. A 70/30 split provides more to direct heirs while maintaining a community fund. Choose based on your family's values and goals.",
          tips: [
            "60/40: Balanced approach for family support and individual inheritance",
            "70/30: Emphasizes individual inheritance with community safety net",
            "Document the reasoning behind your chosen split",
          ],
        },
      ],
      keyTakeaways: [
        "Choose trustees based on competence, integrity, and availability",
        "Name both primary and contingent beneficiaries",
        "The House structure provides multi-generational wealth continuity",
        "Inheritance splits should reflect family values and goals",
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
          question: "What is the primary duty of a trustee?",
          options: [
            "To maximize their own compensation",
            "To act in the best interests of beneficiaries",
            "To minimize all distributions",
            "To report to the government",
          ],
          correctIndex: 1,
          explanation: "Trustees have a fiduciary duty to act in the best interests of the beneficiaries, managing trust assets prudently and according to the trust document.",
        },
        {
          question: "In a 60/40 inheritance split, what might the 40% portion represent?",
          options: [
            "Government taxes",
            "Trustee fees",
            "A family fund for education or emergencies",
            "Legal expenses",
          ],
          correctIndex: 2,
          explanation: "In a 60/40 split, the 40% often goes to a family fund that supports education, emergencies, or community needs, while 60% goes to direct heirs.",
        },
        {
          question: "What is the 'House' structure in multi-generational wealth building?",
          options: [
            "A physical building owned by the family",
            "The family's wealth-holding structure including trusts and entities",
            "A type of mortgage",
            "A government program",
          ],
          correctIndex: 1,
          explanation: "The House structure represents the family's complete wealth-holding system, with trusts serving as the foundation that holds business entities and assets for generational transfer.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 6,
    title: "Module 2: Trust Parties Worksheet",
    type: "worksheet",
    content: {
      title: "Trust Parties & Structure",
      description: "Define the key parties and structure for your trust.",
      fields: [
        { id: "grantor", label: "Grantor (Trust Creator)", type: "text", placeholder: "Enter the grantor's full legal name", required: true },
        { id: "trustee", label: "Primary Trustee", type: "text", placeholder: "Enter the primary trustee's name", required: true },
        { id: "successorTrustee", label: "Successor Trustee", type: "text", placeholder: "Enter the successor trustee's name", required: true },
        { id: "beneficiaries", label: "Beneficiaries", type: "textarea", placeholder: "List all beneficiaries and their relationship to the grantor", required: true },
        { id: "inheritanceSplit", label: "Inheritance Split", type: "select", options: [
            { value: "60/40", label: "60/40 - Balanced (60% heirs, 40% family fund)" },
            { value: "70/30", label: "70/30 - Individual Focus (70% heirs, 30% family fund)" },
            { value: "50/50", label: "50/50 - Equal Split" },
            { value: "Custom", label: "Custom Split (specify in notes)" },
          ], required: true },
      ],
      outputTemplate: "Trust Parties:\nGrantor: {{grantor}}\nPrimary Trustee: {{trustee}}\nSuccessor Trustee: {{successorTrustee}}\nBeneficiaries: {{beneficiaries}}\nInheritance Split: {{inheritanceSplit}}",
    } as WorksheetContent,
  },
  {
    id: 7,
    title: "Module 3: Trust Assets & Funding",
    type: "lesson",
    content: {
      title: "Funding Your Trust",
      sections: [
        {
          heading: "What Assets Can a Trust Hold?",
          text: "Trusts can hold virtually any type of asset: real estate, bank accounts, investment accounts, business interests, life insurance policies, intellectual property, and personal property. The key is properly titling assets in the trust's name.",
          tips: [
            "Real estate requires deed transfer to the trust",
            "Bank accounts need to be retitled or have the trust as beneficiary",
            "Business interests may require operating agreement amendments",
          ],
        },
        {
          heading: "Connecting Business Entities to Your Trust",
          text: "Your business entity (LLC, Corporation, etc.) can be owned by your trust. This provides an additional layer of protection and ensures business ownership transfers according to your trust terms, not through probate.",
        },
        {
          heading: "The Funding Process",
          text: "Creating a trust document is only the first step. The trust must be 'funded' by transferring assets into it. An unfunded trust provides no benefits. Work with your attorney and financial advisors to properly transfer all intended assets.",
          tips: [
            "Create a funding checklist of all assets to transfer",
            "Some assets (like retirement accounts) have special rules",
            "Review and update funding as you acquire new assets",
          ],
        },
        {
          heading: "Trust Administration",
          text: "Once funded, the trust requires ongoing administration. This includes maintaining records, filing tax returns (for irrevocable trusts), making distributions according to trust terms, and keeping beneficiaries informed as required.",
        },
      ],
      keyTakeaways: [
        "A trust is only effective if properly funded",
        "Business entities can be owned by trusts for added protection",
        "Different asset types have different transfer requirements",
        "Ongoing administration is essential for trust effectiveness",
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
          question: "What happens if a trust is created but never funded?",
          options: [
            "It automatically becomes effective after 30 days",
            "It provides no benefits since no assets are protected",
            "The government funds it automatically",
            "It converts to a will",
          ],
          correctIndex: 1,
          explanation: "An unfunded trust provides no benefits. Assets must be properly transferred into the trust for it to serve its intended purpose of protection and transfer.",
        },
        {
          question: "How can a business entity be connected to a trust?",
          options: [
            "By mentioning the business in the trust document",
            "By having the trust own the membership/stock interests",
            "By using the same attorney",
            "Businesses cannot be connected to trusts",
          ],
          correctIndex: 1,
          explanation: "A trust can own business interests (LLC membership, corporate stock) by having those interests transferred to and titled in the trust's name.",
        },
        {
          question: "What is required to transfer real estate into a trust?",
          options: [
            "A verbal agreement",
            "A deed transfer to the trust",
            "Notifying the neighbors",
            "Paying off the mortgage first",
          ],
          correctIndex: 1,
          explanation: "Real estate must be transferred via a new deed that names the trust as the owner. This deed must be recorded with the county recorder's office.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 9,
    title: "Module 3: Trust Assets Worksheet",
    type: "worksheet",
    content: {
      title: "Trust Assets & Funding Plan",
      description: "Plan the assets that will fund your trust and connect to your business entity.",
      fields: [
        { id: "assetTypes", label: "Asset Types to Include", type: "textarea", placeholder: "List assets to transfer: real estate, bank accounts, investments, business interests, etc.", required: true },
        { id: "trustPurpose", label: "Primary Trust Purpose", type: "select", options: [
            "Asset Protection",
            "Estate Planning",
            "Business Succession",
            "Charitable Giving",
            "Multi-Generational Wealth Transfer",
          ], required: true },
        { id: "distributionSchedule", label: "Distribution Schedule", type: "textarea", placeholder: "Describe when and how distributions should be made to beneficiaries", required: true },
      ],
      outputTemplate: "Trust Assets Plan:\nAssets: {{assetTypes}}\nPrimary Purpose: {{trustPurpose}}\nDistribution Schedule: {{distributionSchedule}}",
    } as WorksheetContent,
  },
  {
    id: 10,
    title: "Module 4: Trust Document Essentials",
    type: "lesson",
    content: {
      title: "Creating Your Trust Document",
      sections: [
        {
          heading: "Essential Trust Provisions",
          text: "Every trust document should include: identification of parties, trust purpose, asset descriptions, distribution terms, trustee powers and limitations, successor provisions, and amendment/revocation procedures (for revocable trusts).",
        },
        {
          heading: "Revocability and Amendment",
          text: "For revocable trusts, clearly state how the trust can be amended or revoked. Typically, the grantor retains full power to modify terms during their lifetime. Include procedures for amendments to ensure clarity.",
          tips: [
            "Keep amendment procedures simple but documented",
            "Consider what happens to revocability if grantor becomes incapacitated",
            "Irrevocable trusts may still allow limited modifications through court approval",
          ],
        },
        {
          heading: "Dissolution Terms",
          text: "Define when and how the trust terminates. This might be upon distribution of all assets, at a specific date, or upon occurrence of certain events. Clear dissolution terms prevent confusion and potential disputes.",
        },
        {
          heading: "Spendthrift Provisions",
          text: "Spendthrift provisions protect trust assets from beneficiaries' creditors. They prevent beneficiaries from assigning their interest and protect against claims from creditors, divorcing spouses, and lawsuits.",
        },
      ],
      keyTakeaways: [
        "Include all essential provisions in your trust document",
        "Clearly define amendment and revocation procedures",
        "Specify dissolution terms to prevent future disputes",
        "Consider spendthrift provisions for beneficiary protection",
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
          question: "What do spendthrift provisions protect against?",
          options: [
            "Inflation",
            "Beneficiaries' creditors and claims",
            "Tax increases",
            "Trustee mistakes",
          ],
          correctIndex: 1,
          explanation: "Spendthrift provisions protect trust assets from beneficiaries' creditors, preventing creditors from reaching trust assets before distribution to the beneficiary.",
        },
        {
          question: "Why are dissolution terms important in a trust document?",
          options: [
            "They determine trustee compensation",
            "They prevent confusion about when the trust ends",
            "They are required by law",
            "They reduce taxes",
          ],
          correctIndex: 1,
          explanation: "Clear dissolution terms define when and how the trust terminates, preventing confusion and potential disputes among beneficiaries and trustees.",
        },
        {
          question: "Who typically has the power to amend a revocable trust?",
          options: [
            "The beneficiaries",
            "The trustee",
            "The grantor",
            "The court",
          ],
          correctIndex: 2,
          explanation: "In a revocable trust, the grantor typically retains full power to amend or revoke the trust during their lifetime.",
        },
      ],
    } as QuizContent,
  },
  {
    id: 12,
    title: "Module 4: Trust Terms Worksheet",
    type: "worksheet",
    content: {
      title: "Trust Document Terms",
      description: "Define the key terms and provisions for your trust document.",
      fields: [
        { id: "revocabilityTerms", label: "Revocability Terms", type: "textarea", placeholder: "Describe how and when the trust can be amended or revoked", required: true },
        { id: "amendmentProcess", label: "Amendment Process", type: "textarea", placeholder: "Describe the process for making changes to the trust", required: true },
        { id: "dissolutionTerms", label: "Dissolution Terms", type: "textarea", placeholder: "Describe when and how the trust will terminate", required: true },
      ],
      outputTemplate: "Trust Terms:\nRevocability: {{revocabilityTerms}}\nAmendment Process: {{amendmentProcess}}\nDissolution: {{dissolutionTerms}}",
    } as WorksheetContent,
  },
  {
    id: 13,
    title: "Course Completion: Trust Document Generation",
    type: "worksheet",
    content: {
      title: "Generate Your Trust Summary",
      description: "Review and download your complete trust planning document based on all your worksheet inputs.",
      fields: [],
      outputTemplate: "TRUST PLANNING SUMMARY\n\nThis document summarizes your trust planning decisions and can be used as a foundation for working with an attorney to create your formal trust document.",
    } as WorksheetContent,
  },
];

export default function TrustCourse({ onExit, onComplete, connectedEntity }: TrustCourseProps) {
  const [currentModule, setCurrentModule] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [trustData, setTrustData] = useState<TrustData>({
    trustName: "",
    trustType: "",
    grantor: "",
    trustee: "",
    successorTrustee: "",
    beneficiaries: "",
    trustPurpose: "",
    assetTypes: "",
    distributionSchedule: "",
    revocabilityTerms: "",
    amendmentProcess: "",
    dissolutionTerms: "",
    inheritanceSplit: "",
    connectedEntity: connectedEntity?.name || "",
  });

  const module = trustModules[currentModule];
  const progress = ((currentModule + 1) / trustModules.length) * 100;

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
    setTrustData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const nextModule = () => {
    if (currentModule < trustModules.length - 1) {
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

  const downloadTrustPlan = () => {
    const content = `
TRUST PLANNING SUMMARY
Generated by L.A.W.S. Collective Trust Workshop
================================================================================

TRUST IDENTIFICATION
--------------------
Trust Name: ${trustData.trustName || "[Not specified]"}
Trust Type: ${trustData.trustType || "[Not specified]"}
Connected Business Entity: ${trustData.connectedEntity || "[Not specified]"}

TRUST PARTIES
-------------
Grantor: ${trustData.grantor || "[Not specified]"}
Primary Trustee: ${trustData.trustee || "[Not specified]"}
Successor Trustee: ${trustData.successorTrustee || "[Not specified]"}

BENEFICIARIES
-------------
${trustData.beneficiaries || "[Not specified]"}

INHERITANCE STRUCTURE
--------------------
Split Configuration: ${trustData.inheritanceSplit || "[Not specified]"}

TRUST ASSETS
------------
Asset Types: ${trustData.assetTypes || "[Not specified]"}
Primary Purpose: ${trustData.trustPurpose || "[Not specified]"}

DISTRIBUTION SCHEDULE
--------------------
${trustData.distributionSchedule || "[Not specified]"}

TRUST TERMS
-----------
Revocability: ${trustData.revocabilityTerms || "[Not specified]"}
Amendment Process: ${trustData.amendmentProcess || "[Not specified]"}
Dissolution Terms: ${trustData.dissolutionTerms || "[Not specified]"}

================================================================================
DISCLAIMER: This document is for planning purposes only and does not constitute
legal advice. Consult with a qualified attorney to create your formal trust
documents.
================================================================================
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trustData.trustName || "trust"}-planning-summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Trust planning summary downloaded!");
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

      {/* Note about restricted options */}
      {content.fields.some(f => f.options?.some(opt => typeof opt === 'object' && opt.requiresApproval)) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Note:</span> Some trust types are not available until certain conditions are met. 
            Options marked "Approval Required" require completion of the sovereign system training and approval process.
          </p>
        </div>
      )}

      {/* Connected Entity Display */}
      {connectedEntity && (
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="flex items-center gap-3">
            <Home className="w-5 h-5 text-accent" />
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
                    value={(trustData as any)[field.id] || ""}
                    onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                    className="min-h-[48px]"
                  />
                )}
                {field.type === "textarea" && (
                  <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    value={(trustData as any)[field.id] || ""}
                    onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                    rows={4}
                  />
                )}
                {field.type === "select" && (
                  <Select
                    value={(trustData as any)[field.id] || ""}
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
      ) : (
        // Final summary/download section
        <Card className="p-6">
          <div className="text-center space-y-6">
            <Shield className="w-16 h-16 text-accent mx-auto" />
            <h3 className="text-xl font-bold text-foreground">Your Trust Plan is Ready!</h3>
            <p className="text-muted-foreground">
              You've completed all modules and worksheets. Download your trust planning summary to use when working with an attorney.
            </p>
            <Button onClick={downloadTrustPlan} className="gap-2 min-h-[48px]">
              <Download className="w-5 h-5" />
              Download Trust Planning Summary
            </Button>
          </div>
        </Card>
      )}

      {/* Preview of generated content */}
      {content.fields.length > 0 && Object.values(trustData).some((v) => v) && (
        <Card className="p-6 bg-accent/5 border-accent/20">
          <h3 className="font-semibold text-foreground mb-3">Preview</h3>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
            {content.outputTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => (trustData as any)[key] || `[${key}]`)}
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
            Module {currentModule + 1} of {trustModules.length}
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
          {currentModule === trustModules.length - 1 ? "Complete Course" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
