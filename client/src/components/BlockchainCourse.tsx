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
  Trophy,
  Lightbulb,
  Target,
  Link2,
  Wallet,
  Shield,
  Coins,
  FileCheck,
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
    type: "text" | "textarea" | "number" | "select";
    placeholder?: string;
    required?: boolean;
    options?: Array<string | { value: string; label: string; disabled?: boolean }>;
  }[];
  outputTemplate: string;
}

interface BlockchainData {
  walletName: string;
  walletPurpose: string;
  securityLevel: string;
  backupMethod: string;
  smartContractType: string;
  contractName: string;
  contractDescription: string;
  beneficiaries: string;
  splitPercentage: string;
  tokenAllocation: string;
  distributionSchedule: string;
  cryptoStrategy: string;
  investmentGoals: string;
  riskTolerance: string;
}

interface BlockchainCourseProps {
  onComplete: (tokens: number) => void;
  onExit: () => void;
  connectedEntity?: { name: string; type: string };
}

const COURSE_MODULES: CourseModule[] = [
  {
    id: 1,
    title: "Introduction to Blockchain",
    type: "lesson",
    content: {
      title: "Understanding Blockchain Technology",
      sections: [
        {
          heading: "What is Blockchain?",
          text: "A blockchain is a distributed, decentralized ledger that records transactions across many computers. Once recorded, the data in any given block cannot be altered retroactively without altering all subsequent blocks. This makes blockchain inherently secure and transparent.",
          tips: [
            "Think of blockchain as a shared Google Doc that everyone can read but no one can secretly edit",
            "Each 'block' contains transaction data, a timestamp, and a link to the previous block",
            "The 'chain' is the sequence of blocks linked together cryptographically"
          ]
        },
        {
          heading: "Key Blockchain Concepts",
          text: "Decentralization means no single entity controls the network. Immutability ensures once data is recorded, it cannot be changed. Transparency allows anyone to verify transactions. Consensus mechanisms ensure all participants agree on the state of the ledger.",
          tips: [
            "Decentralization removes single points of failure",
            "Immutability creates trust without intermediaries",
            "Transparency enables accountability"
          ]
        },
        {
          heading: "LuvChain - Our Native Blockchain",
          text: "LuvChain is The L.A.W.S. Collective, LLC's native blockchain designed for business formation, certificate issuance, trust management, and token economics. All your course completions, business documents, and financial transactions are recorded immutably on LuvChain.",
          tips: [
            "LuvChain is optimized for business and educational use cases",
            "All certificates are minted as NFTs on LuvChain",
            "Trust distributions are managed via smart contracts"
          ]
        }
      ],
      keyTakeaways: [
        "Blockchain is a secure, transparent, decentralized ledger",
        "LuvChain powers The L.A.W.S. Collective, LLC ecosystem",
        "All your achievements and documents are permanently recorded"
      ]
    }
  },
  {
    id: 2,
    title: "Blockchain Fundamentals Quiz",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What makes blockchain data immutable?",
          options: [
            "A) Password protection",
            "B) Cryptographic linking of blocks",
            "C) Government regulation",
            "D) Cloud storage"
          ],
          correctIndex: 1,
          explanation: "Each block contains a cryptographic hash of the previous block, creating a chain. Changing any block would invalidate all subsequent blocks, making tampering detectable."
        },
        {
          question: "What is decentralization in blockchain?",
          options: [
            "A) One company controls all data",
            "B) Data is stored in one location",
            "C) No single entity controls the network",
            "D) Only banks can access the data"
          ],
          correctIndex: 2,
          explanation: "Decentralization means the network is distributed across many participants, removing single points of failure and control."
        },
        {
          question: "What is LuvChain used for in The L.A.W.S. Collective, LLC?",
          options: [
            "A) Social media only",
            "B) Gaming and entertainment",
            "C) Business formation, certificates, and trust management",
            "D) Weather forecasting"
          ],
          correctIndex: 2,
          explanation: "LuvChain is specifically designed for business operations, certificate issuance, trust distributions, and the token economy within the L.A.W.S. ecosystem."
        }
      ]
    }
  },
  {
    id: 3,
    title: "Wallet Setup Worksheet",
    type: "worksheet",
    content: {
      title: "Create Your LuvChain Wallet",
      description: "Set up your personal or business wallet on LuvChain. This wallet will hold your LUV tokens, certificates, and enable smart contract interactions.",
      fields: [
        {
          id: "walletName",
          label: "Wallet Name",
          type: "text",
          placeholder: "e.g., Russell Family Trust Wallet",
          required: true
        },
        {
          id: "walletPurpose",
          label: "Wallet Purpose",
          type: "select",
          required: true,
          options: [
            { value: "personal", label: "Personal - Individual use" },
            { value: "business", label: "Business - Company operations" },
            { value: "trust", label: "Trust - Asset protection and inheritance" },
            { value: "collective", label: "Collective - Community/group use" }
          ]
        },
        {
          id: "securityLevel",
          label: "Security Level",
          type: "select",
          required: true,
          options: [
            { value: "standard", label: "Standard - Single signature" },
            { value: "enhanced", label: "Enhanced - 2-of-3 multi-signature" },
            { value: "maximum", label: "Maximum - 3-of-5 multi-signature" }
          ]
        },
        {
          id: "backupMethod",
          label: "Backup Method",
          type: "select",
          required: true,
          options: [
            { value: "seed_phrase", label: "Seed Phrase (12/24 words)" },
            { value: "hardware", label: "Hardware Wallet Backup" },
            { value: "social_recovery", label: "Social Recovery (trusted contacts)" }
          ]
        }
      ],
      outputTemplate: "LuvChain Wallet: {{walletName}} | Purpose: {{walletPurpose}} | Security: {{securityLevel}}"
    }
  },
  {
    id: 4,
    title: "Cryptocurrency & Tokens",
    type: "lesson",
    content: {
      title: "Understanding Cryptocurrency and Tokens",
      sections: [
        {
          heading: "What is Cryptocurrency?",
          text: "Cryptocurrency is digital money secured by cryptography. Unlike traditional currency, it operates on decentralized networks. Bitcoin was the first cryptocurrency, but thousands now exist with different purposes and technologies.",
          tips: [
            "Crypto is 'trustless' - you don't need banks or intermediaries",
            "Transactions are verified by the network, not a central authority",
            "Your private key is like your bank password - never share it"
          ]
        },
        {
          heading: "LUV Token - Our Native Currency",
          text: "LUV is the native token of The L.A.W.S. Collective, LLC ecosystem. You earn LUV by completing courses, contributing to the community, and achieving milestones. LUV can be used for services, governance voting, and accessing premium features.",
          tips: [
            "Earn LUV through education and contribution",
            "Use LUV for services within the ecosystem",
            "LUV holders can participate in governance decisions"
          ]
        },
        {
          heading: "Token Economics",
          text: "Token economics (tokenomics) defines how tokens are created, distributed, and used. The L.A.W.S. token economy is designed to reward learning, contribution, and long-term participation. The 60/40 and 70/30 splits in trusts are managed through smart contracts.",
          tips: [
            "Tokenomics creates incentives for positive behavior",
            "Scarcity and utility drive token value",
            "Smart contracts automate token distributions"
          ]
        }
      ],
      keyTakeaways: [
        "Cryptocurrency is decentralized digital money",
        "LUV token powers the L.A.W.S. ecosystem",
        "Token economics align incentives with community goals"
      ]
    }
  },
  {
    id: 5,
    title: "Crypto & Tokens Quiz",
    type: "quiz",
    content: {
      questions: [
        {
          question: "How do you earn LUV tokens in The L.A.W.S. Collective, LLC?",
          options: [
            "A) Only by purchasing them",
            "B) Completing courses and contributing to the community",
            "C) Mining with expensive hardware",
            "D) Waiting for airdrops"
          ],
          correctIndex: 1,
          explanation: "LUV tokens are earned through active participation - completing educational courses, contributing to the community, and achieving milestones."
        },
        {
          question: "What is a private key?",
          options: [
            "A) Your email password",
            "B) A secret code that controls access to your crypto wallet",
            "C) Your social security number",
            "D) A physical key to a safe"
          ],
          correctIndex: 1,
          explanation: "Your private key is a cryptographic secret that proves ownership of your wallet. Never share it - anyone with your private key can access your funds."
        },
        {
          question: "What are the trust split options in L.A.W.S.?",
          options: [
            "A) 50/50 only",
            "B) 60/40 and 70/30",
            "C) 100/0",
            "D) Random percentages"
          ],
          correctIndex: 1,
          explanation: "The L.A.W.S. system supports 60/40 and 70/30 inheritance splits, managed through smart contracts on LuvChain."
        }
      ]
    }
  },
  {
    id: 6,
    title: "Smart Contract Setup",
    type: "worksheet",
    content: {
      title: "Configure Your Smart Contract",
      description: "Smart contracts are self-executing programs on the blockchain. Set up a smart contract for your business or trust.",
      fields: [
        {
          id: "smartContractType",
          label: "Contract Type",
          type: "select",
          required: true,
          options: [
            { value: "certificate", label: "Certificate - Issue completion certificates" },
            { value: "token_transfer", label: "Token Transfer - Automated payments" },
            { value: "trust_distribution", label: "Trust Distribution - Inheritance splits" },
            { value: "escrow", label: "Escrow - Hold funds until conditions met" },
            { value: "subscription", label: "Subscription - Recurring payments" }
          ]
        },
        {
          id: "contractName",
          label: "Contract Name",
          type: "text",
          placeholder: "e.g., Russell Family Trust Distribution",
          required: true
        },
        {
          id: "contractDescription",
          label: "Contract Description",
          type: "textarea",
          placeholder: "Describe what this contract does and its purpose...",
          required: true
        },
        {
          id: "beneficiaries",
          label: "Beneficiaries (if applicable)",
          type: "textarea",
          placeholder: "List beneficiaries and their wallet addresses or names..."
        },
        {
          id: "splitPercentage",
          label: "Distribution Split",
          type: "select",
          options: [
            { value: "60_40", label: "60/40 Split" },
            { value: "70_30", label: "70/30 Split" },
            { value: "equal", label: "Equal Split" },
            { value: "custom", label: "Custom Split" }
          ]
        }
      ],
      outputTemplate: "Smart Contract: {{contractName}} | Type: {{smartContractType}} | Split: {{splitPercentage}}"
    }
  },
  {
    id: 7,
    title: "Smart Contracts Deep Dive",
    type: "lesson",
    content: {
      title: "Understanding Smart Contracts",
      sections: [
        {
          heading: "What are Smart Contracts?",
          text: "Smart contracts are self-executing programs stored on a blockchain. They automatically enforce and execute the terms of an agreement when predetermined conditions are met. No intermediaries needed - the code is the law.",
          tips: [
            "Think of smart contracts as vending machines - insert input, get output",
            "Once deployed, smart contracts cannot be changed",
            "All executions are transparent and verifiable"
          ]
        },
        {
          heading: "Smart Contract Use Cases",
          text: "In the L.A.W.S. ecosystem, smart contracts handle certificate issuance (minting NFTs when you complete courses), trust distributions (automatically splitting assets according to your 60/40 or 70/30 configuration), token rewards, and escrow services.",
          tips: [
            "Certificates are NFTs minted via smart contracts",
            "Trust distributions happen automatically on schedule",
            "Escrow protects both parties in transactions"
          ]
        },
        {
          heading: "Security Considerations",
          text: "Smart contracts are only as good as their code. Once deployed, bugs cannot be fixed without deploying a new contract. Always review contract terms carefully before interacting. The L.A.W.S. contracts have been designed with security best practices.",
          tips: [
            "Review all contract terms before signing",
            "Understand gas fees and transaction costs",
            "Keep your private keys secure"
          ]
        }
      ],
      keyTakeaways: [
        "Smart contracts automate agreement execution",
        "They power certificates, trusts, and token distributions",
        "Security and understanding are critical before interacting"
      ]
    }
  },
  {
    id: 8,
    title: "Smart Contracts Quiz",
    type: "quiz",
    content: {
      questions: [
        {
          question: "What happens when smart contract conditions are met?",
          options: [
            "A) Nothing until manually approved",
            "B) The contract automatically executes",
            "C) A lawyer must review it",
            "D) The bank processes the transaction"
          ],
          correctIndex: 1,
          explanation: "Smart contracts are self-executing. When conditions are met, the contract automatically performs its programmed actions without any intermediary."
        },
        {
          question: "Can a deployed smart contract be changed?",
          options: [
            "A) Yes, anytime by the creator",
            "B) No, it's immutable once deployed",
            "C) Only with government approval",
            "D) Yes, with a password"
          ],
          correctIndex: 1,
          explanation: "Once deployed, smart contracts are immutable. To make changes, a new contract must be deployed. This is why careful review before deployment is critical."
        },
        {
          question: "How are course completion certificates issued on LuvChain?",
          options: [
            "A) Printed on paper",
            "B) Emailed as PDFs",
            "C) Minted as NFTs via smart contracts",
            "D) Posted on social media"
          ],
          correctIndex: 2,
          explanation: "Certificates are minted as NFTs (Non-Fungible Tokens) on LuvChain through smart contracts, creating permanent, verifiable proof of your achievements."
        }
      ]
    }
  },
  {
    id: 9,
    title: "Investment Strategy Worksheet",
    type: "worksheet",
    content: {
      title: "Define Your Crypto Strategy",
      description: "Plan your approach to cryptocurrency and token management within the L.A.W.S. ecosystem.",
      fields: [
        {
          id: "cryptoStrategy",
          label: "Primary Strategy",
          type: "select",
          required: true,
          options: [
            { value: "earn_hold", label: "Earn & Hold - Accumulate LUV through courses" },
            { value: "active_use", label: "Active Use - Use LUV for services regularly" },
            { value: "governance", label: "Governance - Participate in community decisions" },
            { value: "trust_building", label: "Trust Building - Focus on inheritance structure" }
          ]
        },
        {
          id: "investmentGoals",
          label: "Investment Goals",
          type: "textarea",
          placeholder: "What do you want to achieve with your tokens? (e.g., build generational wealth, fund education, support community projects)",
          required: true
        },
        {
          id: "riskTolerance",
          label: "Risk Tolerance",
          type: "select",
          required: true,
          options: [
            { value: "conservative", label: "Conservative - Preserve value, minimal risk" },
            { value: "moderate", label: "Moderate - Balanced growth and security" },
            { value: "aggressive", label: "Aggressive - Maximum growth potential" }
          ]
        },
        {
          id: "tokenAllocation",
          label: "Token Allocation Plan",
          type: "textarea",
          placeholder: "How will you allocate your earned tokens? (e.g., 50% savings, 30% services, 20% community)"
        },
        {
          id: "distributionSchedule",
          label: "Distribution Schedule (for trusts)",
          type: "select",
          options: [
            { value: "immediate", label: "Immediate - Distribute as earned" },
            { value: "quarterly", label: "Quarterly - Every 3 months" },
            { value: "annual", label: "Annual - Once per year" },
            { value: "milestone", label: "Milestone-based - On achievement" }
          ]
        }
      ],
      outputTemplate: "Strategy: {{cryptoStrategy}} | Risk: {{riskTolerance}} | Schedule: {{distributionSchedule}}"
    }
  },
  {
    id: 10,
    title: "Course Completion",
    type: "lesson",
    content: {
      title: "Blockchain & Crypto Mastery Complete!",
      sections: [
        {
          heading: "What You've Learned",
          text: "You now understand blockchain technology, cryptocurrency fundamentals, smart contracts, and the LuvChain ecosystem. You've created your wallet, configured smart contracts, and defined your investment strategy.",
          tips: [
            "Your wallet is ready to receive LUV tokens",
            "Your smart contract configuration is saved",
            "Your strategy guides your participation"
          ]
        },
        {
          heading: "Your Certificate",
          text: "Upon completion, a Blockchain & Crypto Mastery certificate will be minted as an NFT on LuvChain. This certificate is permanent, verifiable, and proves your knowledge of blockchain technology.",
          tips: [
            "Certificate is stored in your wallet",
            "Anyone can verify your achievement on LuvChain",
            "This credential never expires"
          ]
        },
        {
          heading: "Next Steps",
          text: "Continue building your House structure by completing other courses. Your blockchain knowledge will help you understand how all the pieces connect - from business formation to trust management to grant funding.",
          tips: [
            "Complete all courses to build your full House structure",
            "Use your tokens wisely according to your strategy",
            "Help others learn and grow the community"
          ]
        }
      ],
      keyTakeaways: [
        "You are now blockchain-literate",
        "Your certificate is permanently recorded on LuvChain",
        "Continue building your House structure"
      ]
    }
  }
];

export default function BlockchainCourse({ onComplete, onExit, connectedEntity }: BlockchainCourseProps) {
  const [currentModule, setCurrentModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [worksheetData, setWorksheetData] = useState<BlockchainData>({
    walletName: "",
    walletPurpose: "",
    securityLevel: "",
    backupMethod: "",
    smartContractType: "",
    contractName: "",
    contractDescription: "",
    beneficiaries: "",
    splitPercentage: "",
    tokenAllocation: "",
    distributionSchedule: "",
    cryptoStrategy: "",
    investmentGoals: "",
    riskTolerance: ""
  });
  const [tokensEarned, setTokensEarned] = useState(0);

  const awardTokensMutation = trpc.tokenEconomy.awardTokens.useMutation();

  const module = COURSE_MODULES[currentModule];

  const handleNext = () => {
    if (!completedModules.has(module.id)) {
      const newCompleted = new Set(completedModules);
      newCompleted.add(module.id);
      setCompletedModules(newCompleted);
      
      // Award tokens for module completion
      const moduleTokens = module.type === "quiz" ? 15 : module.type === "worksheet" ? 20 : 10;
      setTokensEarned(prev => prev + moduleTokens);
    }

    if (currentModule < COURSE_MODULES.length - 1) {
      setCurrentModule(currentModule + 1);
      setQuizSubmitted(false);
      setQuizAnswers({});
    } else {
      // Course complete
      const finalTokens = tokensEarned + 50; // Bonus for completion
      
      // Award tokens via API
      awardTokensMutation.mutate({
        amount: finalTokens.toString(),
        reason: "simulator_completion"
      });

      toast.success(`Course Complete! Certificate minted to LuvChain. Earned ${finalTokens} LUV tokens!`);
      onComplete(finalTokens);
    }
  };

  const handlePrevious = () => {
    if (currentModule > 0) {
      setCurrentModule(currentModule - 1);
      setQuizSubmitted(false);
      setQuizAnswers({});
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    if (!quizSubmitted) {
      setQuizAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    const quizContent = module.content as QuizContent;
    const correctCount = quizContent.questions.filter(
      (q, i) => quizAnswers[i] === q.correctIndex
    ).length;
    
    if (correctCount === quizContent.questions.length) {
      toast.success("Perfect score! All answers correct!");
    } else {
      toast.info(`${correctCount}/${quizContent.questions.length} correct. Review the explanations.`);
    }
  };

  const handleWorksheetChange = (fieldId: string, value: string) => {
    setWorksheetData(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderLesson = (content: LessonContent) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-cyan-600" />
        <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
      </div>

      {content.sections.map((section, idx) => (
        <Card key={idx} className="p-6">
          <h3 className="font-bold text-foreground text-lg mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-600" />
            {section.heading}
          </h3>
          <p className="text-muted-foreground mb-4">{section.text}</p>
          {section.tips && (
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg">
              <p className="font-semibold text-cyan-800 dark:text-cyan-200 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Key Points
              </p>
              <ul className="space-y-1">
                {section.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-cyan-700 dark:text-cyan-300 flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}

      <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Key Takeaways
        </h3>
        <ul className="space-y-2">
          {content.keyTakeaways.map((takeaway, i) => (
            <li key={i} className="text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
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
        <FileText className="w-8 h-8 text-emerald-600" />
        <h2 className="text-2xl font-bold text-foreground">Knowledge Check</h2>
      </div>

      {content.questions.map((question, qIdx) => (
        <Card key={qIdx} className="p-6">
          <p className="font-semibold text-foreground mb-4">
            {qIdx + 1}. {question.question}
          </p>
          <div className="space-y-2">
            {question.options.map((option, oIdx) => {
              const isSelected = quizAnswers[qIdx] === oIdx;
              const isCorrect = oIdx === question.correctIndex;
              const showResult = quizSubmitted;

              return (
                <button
                  key={oIdx}
                  onClick={() => handleQuizAnswer(qIdx, oIdx)}
                  disabled={quizSubmitted}
                  className={`w-full text-left p-3 rounded-lg border transition-colors min-h-[48px] ${
                    showResult
                      ? isCorrect
                        ? "bg-green-100 border-green-500 dark:bg-green-900/30"
                        : isSelected
                        ? "bg-red-100 border-red-500 dark:bg-red-900/30"
                        : "bg-secondary border-border"
                      : isSelected
                      ? "bg-cyan-100 border-cyan-500 dark:bg-cyan-900/30"
                      : "bg-secondary border-border hover:bg-secondary/80"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {quizSubmitted && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Explanation:</strong> {question.explanation}
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
        <FileCheck className="w-8 h-8 text-amber-600" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
          <p className="text-muted-foreground">{content.description}</p>
        </div>
      </div>

      {connectedEntity && (
        <Card className="p-4 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800">
          <p className="text-sm text-cyan-800 dark:text-cyan-200">
            <strong>Connected Entity:</strong> {connectedEntity.name} ({connectedEntity.type})
          </p>
        </Card>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          {content.fields.map((field) => (
            <div key={field.id}>
              <Label htmlFor={field.id} className="text-foreground">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={worksheetData[field.id as keyof BlockchainData] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              ) : field.type === "select" ? (
                <Select
                  value={worksheetData[field.id as keyof BlockchainData] || ""}
                  onValueChange={(value) => handleWorksheetChange(field.id, value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => {
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
              ) : (
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={worksheetData[field.id as keyof BlockchainData] || ""}
                  onChange={(e) => handleWorksheetChange(field.id, e.target.value)}
                  className="mt-1"
                />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const progress = ((currentModule + 1) / COURSE_MODULES.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onExit} className="min-h-[44px]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Course
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-600" />
            <span className="font-semibold text-foreground">Blockchain & Crypto Workshop</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-foreground">{tokensEarned} LUV</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-muted-foreground">
              {completedModules.size}/{COURSE_MODULES.length} Complete
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Module Title */}
      <Card className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-cyan-600">
              Module {currentModule + 1} of {COURSE_MODULES.length}
            </span>
            <span className="text-foreground font-bold">{module.title}</span>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            module.type === "lesson" ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200" :
            module.type === "quiz" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200" :
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
          }`}>
            {module.type.charAt(0).toUpperCase() + module.type.slice(1)}
          </span>
        </div>
      </Card>

      {/* Module Content */}
      {module.type === "lesson" && renderLesson(module.content as LessonContent)}
      {module.type === "quiz" && renderQuiz(module.content as QuizContent)}
      {module.type === "worksheet" && renderWorksheet(module.content as WorksheetContent)}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentModule === 0}
          className="min-h-[48px] min-w-[100px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={module.type === "quiz" && !quizSubmitted}
          className="min-h-[48px] min-w-[100px]"
        >
          {currentModule === COURSE_MODULES.length - 1 ? (
            <>
              Complete & Mint Certificate
              <Trophy className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
