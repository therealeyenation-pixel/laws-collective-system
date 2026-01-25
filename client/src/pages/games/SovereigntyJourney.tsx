import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ArrowRight,
  Baby,
  GraduationCap,
  Briefcase,
  Crown,
  Mountain,
  Wind,
  Droplets,
  Heart,
  Sparkles,
  Star,
  Trophy,
  Map,
  Scroll,
  Shield,
  BookOpen,
  Users,
  Home,
  Gem,
  Leaf,
  Brain,
  Target,
  Zap,
  FileText,
  Building2,
  Scale,
  Lock,
  CheckCircle2,
  Circle,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Info,
  AlertTriangle,
  Lightbulb,
  Award,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

// ============================================
// TYPES AND INTERFACES
// ============================================

interface LifeAct {
  id: "birth" | "education" | "commerce" | "sovereignty";
  title: string;
  subtitle: string;
  ageRange: string;
  description: string;
  icon: typeof Baby;
  color: string;
  bgColor: string;
  chapters: Chapter[];
  lawsPillar: "land" | "air" | "water" | "self";
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  scenes: Scene[];
  completed: boolean;
  unlocked: boolean;
  instruments: LegalInstrument[];
}

interface Scene {
  id: string;
  title: string;
  narrative: string;
  strawmanPerspective: string;
  sovereignPerspective: string;
  lesson: string;
  quiz?: QuizQuestion;
  completed: boolean;
}

interface LegalInstrument {
  id: string;
  name: string;
  description: string;
  purpose: string;
  whenToUse: string;
  icon: typeof FileText;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface PlayerProgress {
  currentAct: "birth" | "education" | "commerce" | "sovereignty";
  currentChapter: number;
  currentScene: number;
  completedScenes: string[];
  instrumentsLearned: string[];
  sovereigntyScore: number;
  totalScore: number;
}

// ============================================
// LEGAL INSTRUMENTS DATABASE
// ============================================

const LEGAL_INSTRUMENTS: Record<string, LegalInstrument> = {
  birth_certificate: {
    id: "birth_certificate",
    name: "Birth Certificate",
    description: "The foundational document that creates your legal identity in the system.",
    purpose: "Establishes your existence as a legal entity and creates the 'strawman' - the ALL CAPS name that represents you in commerce.",
    whenToUse: "Understanding this document helps you distinguish between your living self and your legal person.",
    icon: FileText,
  },
  social_security: {
    id: "social_security",
    name: "Social Security Number",
    description: "A unique identifier that links you to the commercial system.",
    purpose: "Enables participation in the tax system, employment, and government benefits.",
    whenToUse: "Required for employment, banking, and accessing government services. Understanding its role helps you navigate the system strategically.",
    icon: FileText,
  },
  trust: {
    id: "trust",
    name: "Trust Structure",
    description: "A legal arrangement where assets are held by one party for the benefit of another.",
    purpose: "Separates ownership from control, provides asset protection, and enables strategic wealth transfer.",
    whenToUse: "Use trusts to protect assets, plan estates, and create generational wealth structures.",
    icon: Shield,
  },
  llc: {
    id: "llc",
    name: "Limited Liability Company",
    description: "A business structure that provides personal liability protection.",
    purpose: "Separates your personal assets from business liabilities while maintaining tax flexibility.",
    whenToUse: "Use when starting a business, holding real estate, or creating privacy structures.",
    icon: Building2,
  },
  power_of_attorney: {
    id: "power_of_attorney",
    name: "Power of Attorney",
    description: "A legal document granting someone authority to act on your behalf.",
    purpose: "Ensures your affairs can be managed if you're incapacitated, and allows delegation of authority.",
    whenToUse: "Create healthcare and financial POAs to protect yourself and your family.",
    icon: FileText,
  },
  arbitration_agreement: {
    id: "arbitration_agreement",
    name: "Arbitration Agreement",
    description: "An agreement to resolve disputes outside of court.",
    purpose: "Provides private, efficient dispute resolution and avoids public court proceedings.",
    whenToUse: "Include in contracts to maintain privacy and control over dispute resolution.",
    icon: Scale,
  },
  dba: {
    id: "dba",
    name: "DBA (Doing Business As)",
    description: "A registration allowing you to operate under a trade name.",
    purpose: "Enables business operations under a name different from your legal name or entity.",
    whenToUse: "Use when you want to operate a business with a specific brand name.",
    icon: FileText,
  },
  ein: {
    id: "ein",
    name: "EIN (Employer Identification Number)",
    description: "A tax identification number for business entities.",
    purpose: "Identifies your business entity for tax purposes, separate from your personal SSN.",
    whenToUse: "Required for businesses with employees, opening business bank accounts, and filing business taxes.",
    icon: FileText,
  },
  operating_agreement: {
    id: "operating_agreement",
    name: "Operating Agreement",
    description: "The governing document for an LLC.",
    purpose: "Defines ownership, management, and operational rules for your business entity.",
    whenToUse: "Create when forming an LLC to establish clear governance and protect your interests.",
    icon: FileText,
  },
  privacy_trust: {
    id: "privacy_trust",
    name: "Privacy Trust",
    description: "A trust structure designed to maintain privacy in asset ownership.",
    purpose: "Holds assets anonymously, keeping your name off public records.",
    whenToUse: "Use for real estate, vehicles, or other assets where privacy is desired.",
    icon: Lock,
  },
};

// ============================================
// FOUR LIFE ACTS DATA
// ============================================

const LIFE_ACTS: LifeAct[] = [
  {
    id: "birth",
    title: "Act I: The Arrival",
    subtitle: "Birth & Early Identity",
    ageRange: "0-5 years",
    description: "Understanding how your legal identity is created and what it means for your journey.",
    icon: Baby,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    lawsPillar: "land",
    chapters: [
      {
        id: "birth-1",
        title: "The Certificate of Life",
        description: "Your first legal document and what it creates",
        completed: false,
        unlocked: true,
        instruments: [LEGAL_INSTRUMENTS.birth_certificate],
        scenes: [
          {
            id: "birth-1-1",
            title: "A New Life Begins",
            narrative: "A child is born - a living, breathing human being with inherent rights. Within days, a document is created: the Birth Certificate. This document does something remarkable - it creates a legal 'person' that will represent you in the commercial world.",
            strawmanPerspective: "The system sees: A new taxable entity has been registered. The ALL CAPS name (JOHN DOE) is created as a commercial vessel. This 'person' can enter contracts, own property, and participate in commerce.",
            sovereignPerspective: "The empowered individual understands: I am a living being with natural rights. The Birth Certificate creates a legal tool - my 'strawman' - that I can learn to use strategically. This is not a limitation but an instrument I can master.",
            lesson: "Your Birth Certificate creates two identities: you (the living being) and your legal person (the strawman). Understanding this distinction is the first step to navigating the system effectively.",
            quiz: {
              question: "What does the Birth Certificate create?",
              options: [
                "Just a record of your birth",
                "A legal 'person' that represents you in commerce",
                "Your citizenship",
                "Your rights as a human"
              ],
              correctIndex: 1,
              explanation: "The Birth Certificate creates a legal 'person' (your strawman) that represents you in the commercial and legal system. This is separate from you as a living being."
            },
            completed: false,
          },
          {
            id: "birth-1-2",
            title: "The Name Game",
            narrative: "Notice how your name appears on official documents: JOHN HENRY DOE. The all-capital letters signify something specific in legal terms - this is the name of your legal person, your commercial identity.",
            strawmanPerspective: "The system uses: ALL CAPS names on legal documents, tax forms, court papers, and official correspondence. This formatting identifies the commercial entity, not the living person.",
            sovereignPerspective: "The empowered individual recognizes: When I see my name in ALL CAPS, I'm looking at my legal person - the instrument through which I interact with the commercial system. I can use this instrument strategically.",
            lesson: "The ALL CAPS name is not a mistake or preference - it's a legal convention identifying your commercial person. Recognizing this helps you understand which 'you' is being addressed in legal matters.",
            completed: false,
          },
        ],
      },
      {
        id: "birth-2",
        title: "The Social Contract",
        description: "Entering the system through Social Security",
        completed: false,
        unlocked: false,
        instruments: [LEGAL_INSTRUMENTS.social_security],
        scenes: [
          {
            id: "birth-2-1",
            title: "The Number",
            narrative: "Shortly after birth, parents apply for a Social Security Number. This nine-digit identifier links your legal person to the commercial system, enabling participation in employment, banking, and government programs.",
            strawmanPerspective: "The system records: A new account has been created in the Social Security system. This number will track earnings, taxes, and benefits throughout the entity's commercial life.",
            sovereignPerspective: "The empowered individual understands: The SSN is a tool for participating in the system. I can use it to access employment, build credit, and receive benefits while also learning to create other structures that provide additional options.",
            lesson: "The Social Security Number is an essential tool for navigating the commercial system. Rather than viewing it as control, see it as an access key that opens doors to opportunities.",
            quiz: {
              question: "What is the primary purpose of a Social Security Number?",
              options: [
                "To track your location",
                "To link you to the commercial/tax system",
                "To prove citizenship",
                "To limit your freedom"
              ],
              correctIndex: 1,
              explanation: "The SSN links your legal person to the commercial and tax system, enabling participation in employment, banking, and government programs."
            },
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "education",
    title: "Act II: The Learning",
    subtitle: "Education & Knowledge Acquisition",
    ageRange: "5-22 years",
    description: "Building knowledge and understanding how the system works while developing your skills.",
    icon: GraduationCap,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    lawsPillar: "air",
    chapters: [
      {
        id: "edu-1",
        title: "The School System",
        description: "Navigating formal education strategically",
        completed: false,
        unlocked: false,
        instruments: [],
        scenes: [
          {
            id: "edu-1-1",
            title: "Learning the Rules",
            narrative: "The education system teaches many things, but rarely explains how the legal and financial systems actually work. This is knowledge you must seek independently.",
            strawmanPerspective: "The system provides: Standardized education focused on creating productive workers. Financial literacy, legal understanding, and business formation are often absent from the curriculum.",
            sovereignPerspective: "The empowered individual seeks: Knowledge beyond the standard curriculum. Understanding contracts, business structures, taxes, and legal rights. This knowledge is the foundation of true empowerment.",
            lesson: "Formal education is valuable, but financial and legal literacy must often be self-taught. Seek this knowledge actively - it's the key to navigating the system effectively.",
            completed: false,
          },
          {
            id: "edu-1-2",
            title: "Building Your Knowledge Base",
            narrative: "While in school, you can begin building the knowledge that will serve you throughout life: understanding money, contracts, business, and your rights.",
            strawmanPerspective: "The system expects: Focus on grades, credentials, and preparation for employment. Success is measured by degrees and job placement.",
            sovereignPerspective: "The empowered individual builds: A comprehensive understanding of how systems work. Knowledge of business formation, asset protection, and wealth building alongside formal education.",
            lesson: "Use your educational years to build both formal credentials AND practical knowledge of business, finance, and legal structures. This dual approach creates maximum options.",
            quiz: {
              question: "What knowledge is often missing from formal education?",
              options: [
                "Reading and writing",
                "Mathematics",
                "Financial literacy and legal understanding",
                "Science"
              ],
              correctIndex: 2,
              explanation: "While formal education covers many subjects, financial literacy, legal understanding, and business formation are often absent - yet these are crucial for navigating the system effectively."
            },
            completed: false,
          },
        ],
      },
      {
        id: "edu-2",
        title: "First Steps in Commerce",
        description: "Your first job and understanding employment",
        completed: false,
        unlocked: false,
        instruments: [LEGAL_INSTRUMENTS.dba],
        scenes: [
          {
            id: "edu-2-1",
            title: "The W-2 Path",
            narrative: "Your first job introduces you to the employment system: W-2 forms, tax withholding, and trading time for money. This is one path, but not the only one.",
            strawmanPerspective: "The system creates: An employee who trades time for wages, with taxes automatically withheld. The employer reports earnings, and the system tracks everything.",
            sovereignPerspective: "The empowered individual recognizes: W-2 employment is a starting point, not a destination. While employed, I can learn skills, save capital, and plan my transition to greater autonomy.",
            lesson: "W-2 employment provides stability and learning opportunities. Use it strategically as a foundation while building toward greater options and autonomy.",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "commerce",
    title: "Act III: The Building",
    subtitle: "Commerce & Wealth Creation",
    ageRange: "22-50 years",
    description: "Creating wealth, building businesses, and mastering the instruments of commerce.",
    icon: Briefcase,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    lawsPillar: "water",
    chapters: [
      {
        id: "com-1",
        title: "Creating Your Vessel",
        description: "Forming business entities for protection and opportunity",
        completed: false,
        unlocked: false,
        instruments: [LEGAL_INSTRUMENTS.llc, LEGAL_INSTRUMENTS.ein, LEGAL_INSTRUMENTS.operating_agreement],
        scenes: [
          {
            id: "com-1-1",
            title: "The LLC Shield",
            narrative: "A Limited Liability Company creates a legal vessel separate from you personally. This structure provides protection and creates new opportunities for wealth building.",
            strawmanPerspective: "The system recognizes: A new legal entity has been formed. This entity can enter contracts, hold assets, and conduct business - separate from its owner's personal liability.",
            sovereignPerspective: "The empowered individual creates: A strategic structure that separates personal assets from business risks. The LLC becomes a tool for building wealth while protecting what I've already built.",
            lesson: "An LLC is not just for 'big businesses' - it's a fundamental tool for anyone serious about building and protecting wealth. It creates a legal separation between you and your business activities.",
            quiz: {
              question: "What is the primary benefit of an LLC?",
              options: [
                "Lower taxes",
                "Separation of personal and business liability",
                "More customers",
                "Government benefits"
              ],
              correctIndex: 1,
              explanation: "The primary benefit of an LLC is separating your personal assets from business liabilities. This protection is fundamental to building wealth safely."
            },
            completed: false,
          },
          {
            id: "com-1-2",
            title: "The EIN Identity",
            narrative: "Just as you have a Social Security Number, your business entity gets an Employer Identification Number. This separates your business's tax identity from your personal one.",
            strawmanPerspective: "The system tracks: Business income and expenses through the EIN. This number identifies the business entity for all tax and banking purposes.",
            sovereignPerspective: "The empowered individual understands: The EIN creates a separate identity for my business. Income flows through the business first, allowing for strategic tax planning and asset protection.",
            lesson: "The EIN is your business's 'social security number.' It enables business banking, tax filing, and creates the separation between personal and business finances that protects you.",
            completed: false,
          },
        ],
      },
      {
        id: "com-2",
        title: "Asset Protection",
        description: "Using trusts and structures to protect wealth",
        completed: false,
        unlocked: false,
        instruments: [LEGAL_INSTRUMENTS.trust, LEGAL_INSTRUMENTS.privacy_trust],
        scenes: [
          {
            id: "com-2-1",
            title: "The Trust Framework",
            narrative: "A trust is one of the most powerful legal instruments available. It separates ownership from control and can protect assets across generations.",
            strawmanPerspective: "The system sees: Assets held in trust are owned by the trust, not the individual. The trustee controls the assets for the benefit of the beneficiaries.",
            sovereignPerspective: "The empowered individual utilizes: Trusts to protect assets from lawsuits, plan for incapacity, and transfer wealth to future generations efficiently.",
            lesson: "Trusts are not just for the wealthy - they're tools everyone can use for asset protection, estate planning, and creating generational wealth structures.",
            quiz: {
              question: "What does a trust do with asset ownership?",
              options: [
                "Gives it to the government",
                "Separates ownership from control",
                "Eliminates it entirely",
                "Transfers it to banks"
              ],
              correctIndex: 1,
              explanation: "A trust separates ownership from control. The trust owns the assets, the trustee controls them, and the beneficiaries receive the benefits."
            },
            completed: false,
          },
        ],
      },
      {
        id: "com-3",
        title: "Dispute Resolution",
        description: "Navigating conflicts through private channels",
        completed: false,
        unlocked: false,
        instruments: [LEGAL_INSTRUMENTS.arbitration_agreement, LEGAL_INSTRUMENTS.power_of_attorney],
        scenes: [
          {
            id: "com-3-1",
            title: "Private Justice",
            narrative: "The court system is public, slow, and expensive. Arbitration provides a private alternative for resolving disputes efficiently.",
            strawmanPerspective: "The system offers: Public courts where disputes become public record, proceedings can take years, and costs can be enormous.",
            sovereignPerspective: "The empowered individual chooses: Private arbitration when possible, maintaining confidentiality and control over the dispute resolution process.",
            lesson: "Including arbitration clauses in your contracts gives you control over how disputes are resolved. This is a standard practice among sophisticated businesses and families.",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "sovereignty",
    title: "Act IV: The Legacy",
    subtitle: "Sovereignty & Generational Wealth",
    ageRange: "50+ years",
    description: "Achieving true sovereignty and creating structures that outlast you.",
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    lawsPillar: "self",
    chapters: [
      {
        id: "sov-1",
        title: "The Sovereign Structure",
        description: "Building systems that work for you",
        completed: false,
        unlocked: false,
        instruments: [LEGAL_INSTRUMENTS.trust, LEGAL_INSTRUMENTS.llc, LEGAL_INSTRUMENTS.operating_agreement],
        scenes: [
          {
            id: "sov-1-1",
            title: "Multiple Vessels",
            narrative: "True sovereignty comes from having multiple legal structures working together - trusts holding LLCs, businesses generating income, and protection layers at every level.",
            strawmanPerspective: "The system sees: A complex web of legal entities, each with its own identity, purpose, and protections. The individual behind them is shielded by layers of legal structure.",
            sovereignPerspective: "The empowered individual has built: A comprehensive system where assets are protected, income flows efficiently, and the structures can continue operating across generations.",
            lesson: "Sovereignty isn't about leaving the system - it's about mastering its instruments. Multiple coordinated structures provide maximum protection and flexibility.",
            quiz: {
              question: "What is true sovereignty in the legal system?",
              options: [
                "Rejecting all legal structures",
                "Mastering multiple legal instruments",
                "Having lots of money",
                "Avoiding all taxes"
              ],
              correctIndex: 1,
              explanation: "True sovereignty comes from mastering the legal instruments available - trusts, LLCs, contracts, and other structures that provide protection and opportunity."
            },
            completed: false,
          },
        ],
      },
      {
        id: "sov-2",
        title: "Generational Transfer",
        description: "Passing wealth and knowledge to the next generation",
        completed: false,
        unlocked: false,
        instruments: [LEGAL_INSTRUMENTS.trust, LEGAL_INSTRUMENTS.power_of_attorney],
        scenes: [
          {
            id: "sov-2-1",
            title: "The Legacy Plan",
            narrative: "The ultimate goal: creating structures that transfer not just wealth, but knowledge and capability to future generations. This is the completion of the sovereignty journey.",
            strawmanPerspective: "The system allows: Wealth transfer through proper estate planning. Without planning, the system takes a significant portion through taxes and probate.",
            sovereignPerspective: "The empowered individual ensures: Wealth, knowledge, and structures transfer efficiently to the next generation. The journey continues through children and grandchildren.",
            lesson: "True generational wealth isn't just about money - it's about transferring the knowledge of how to use these instruments. Teach your children what you've learned.",
            completed: false,
          },
        ],
      },
    ],
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function SovereigntyJourney() {
  const [progress, setProgress] = useState<PlayerProgress>({
    currentAct: "birth",
    currentChapter: 0,
    currentScene: 0,
    completedScenes: [],
    instrumentsLearned: [],
    sovereigntyScore: 0,
    totalScore: 0,
  });

  const [showScene, setShowScene] = useState(false);
  const [currentSceneData, setCurrentSceneData] = useState<Scene | null>(null);
  const [currentActData, setCurrentActData] = useState<LifeAct | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [showInstrument, setShowInstrument] = useState(false);
  const [currentInstrument, setCurrentInstrument] = useState<LegalInstrument | null>(null);
  const [narrativeStep, setNarrativeStep] = useState<"narrative" | "strawman" | "sovereign" | "lesson">("narrative");

  const getCurrentAct = () => LIFE_ACTS.find(act => act.id === progress.currentAct);

  const calculateOverallProgress = () => {
    const totalScenes = LIFE_ACTS.reduce((acc, act) => 
      acc + act.chapters.reduce((chAcc, ch) => chAcc + ch.scenes.length, 0), 0);
    return Math.round((progress.completedScenes.length / totalScenes) * 100);
  };

  const startScene = (act: LifeAct, chapterIndex: number, sceneIndex: number) => {
    const chapter = act.chapters[chapterIndex];
    const scene = chapter.scenes[sceneIndex];
    setCurrentActData(act);
    setCurrentSceneData(scene);
    setNarrativeStep("narrative");
    setShowScene(true);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setQuizAnswered(false);
  };

  const advanceNarrative = () => {
    if (narrativeStep === "narrative") {
      setNarrativeStep("strawman");
    } else if (narrativeStep === "strawman") {
      setNarrativeStep("sovereign");
    } else if (narrativeStep === "sovereign") {
      setNarrativeStep("lesson");
    } else if (narrativeStep === "lesson") {
      if (currentSceneData?.quiz) {
        setShowQuiz(true);
      } else {
        completeScene();
      }
    }
  };

  const handleQuizAnswer = (index: number) => {
    setSelectedAnswer(index);
    setQuizAnswered(true);
    
    if (currentSceneData?.quiz && index === currentSceneData.quiz.correctIndex) {
      setProgress(prev => ({
        ...prev,
        sovereigntyScore: prev.sovereigntyScore + 10,
        totalScore: prev.totalScore + 10,
      }));
      toast.success("Correct! +10 Sovereignty Points");
    } else {
      toast.error("Not quite right, but you've learned something valuable!");
    }
  };

  const completeScene = () => {
    if (!currentSceneData) return;

    setProgress(prev => ({
      ...prev,
      completedScenes: [...prev.completedScenes, currentSceneData.id],
      totalScore: prev.totalScore + 5,
    }));

    toast.success("Scene completed! +5 points");
    setShowScene(false);
    setShowQuiz(false);
  };

  const viewInstrument = (instrument: LegalInstrument) => {
    setCurrentInstrument(instrument);
    setShowInstrument(true);
    
    if (!progress.instrumentsLearned.includes(instrument.id)) {
      setProgress(prev => ({
        ...prev,
        instrumentsLearned: [...prev.instrumentsLearned, instrument.id],
      }));
      toast.success(`Learned: ${instrument.name}`);
    }
  };

  const isSceneCompleted = (sceneId: string) => progress.completedScenes.includes(sceneId);

  const isChapterUnlocked = (actId: string, chapterIndex: number) => {
    if (chapterIndex === 0) {
      const actIndex = LIFE_ACTS.findIndex(a => a.id === actId);
      if (actIndex === 0) return true;
      
      // Check if previous act is completed
      const prevAct = LIFE_ACTS[actIndex - 1];
      const prevActScenes = prevAct.chapters.flatMap(ch => ch.scenes.map(s => s.id));
      return prevActScenes.every(id => progress.completedScenes.includes(id));
    }
    
    // Check if previous chapter is completed
    const act = LIFE_ACTS.find(a => a.id === actId);
    if (!act) return false;
    const prevChapter = act.chapters[chapterIndex - 1];
    return prevChapter.scenes.every(s => progress.completedScenes.includes(s.id));
  };

  const getActProgress = (act: LifeAct) => {
    const totalScenes = act.chapters.reduce((acc, ch) => acc + ch.scenes.length, 0);
    const completedScenes = act.chapters.reduce((acc, ch) => 
      acc + ch.scenes.filter(s => progress.completedScenes.includes(s.id)).length, 0);
    return Math.round((completedScenes / totalScenes) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/game-center">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Games
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Crown className="w-8 h-8 text-purple-500" />
              L.A.W.S. Quest: The Sovereignty Journey
            </h1>
            <p className="text-muted-foreground mt-1">
              Master the instruments that allow you to navigate all planes of existence
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-500">{progress.totalScore}</p>
            <p className="text-sm text-muted-foreground">Sovereignty Points</p>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="bg-gradient-to-r from-green-900/20 via-blue-900/20 to-purple-900/20 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Mountain className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                    <Wind className="w-5 h-5 text-sky-500" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Your Journey Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {progress.completedScenes.length} scenes completed | {progress.instrumentsLearned.length} instruments learned
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{calculateOverallProgress()}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={calculateOverallProgress()} className="h-3" />
          </CardContent>
        </Card>

        {/* Four Life Acts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LIFE_ACTS.map((act, actIndex) => {
            const actProgress = getActProgress(act);
            const isUnlocked = actIndex === 0 || 
              LIFE_ACTS[actIndex - 1].chapters.flatMap(ch => ch.scenes.map(s => s.id))
                .every(id => progress.completedScenes.includes(id));
            
            return (
              <Card 
                key={act.id} 
                className={`relative overflow-hidden transition-all ${
                  isUnlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-50'
                }`}
                onClick={() => isUnlocked && setProgress(prev => ({ ...prev, currentAct: act.id }))}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${act.bgColor.replace('/10', '')}`} />
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-lg ${act.bgColor} flex items-center justify-center mb-2`}>
                    <act.icon className={`w-6 h-6 ${act.color}`} />
                  </div>
                  <CardTitle className="text-lg">{act.title}</CardTitle>
                  <CardDescription>{act.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">{act.ageRange}</p>
                  <Progress value={actProgress} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">{actProgress}% complete</p>
                  {!isUnlocked && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      Complete previous act to unlock
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current Act Details */}
        {getCurrentAct() && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${getCurrentAct()!.bgColor} flex items-center justify-center`}>
                    {(() => {
                      const Icon = getCurrentAct()!.icon;
                      return <Icon className={`w-6 h-6 ${getCurrentAct()!.color}`} />;
                    })()}
                  </div>
                  <div>
                    <CardTitle>{getCurrentAct()!.title}</CardTitle>
                    <CardDescription>{getCurrentAct()!.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={getCurrentAct()!.color}>
                  {getCurrentAct()!.lawsPillar.toUpperCase()} Pillar
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getCurrentAct()!.chapters.map((chapter, chapterIndex) => {
                  const isUnlocked = isChapterUnlocked(getCurrentAct()!.id, chapterIndex);
                  const chapterCompleted = chapter.scenes.every(s => 
                    progress.completedScenes.includes(s.id));
                  
                  return (
                    <Card key={chapter.id} className={!isUnlocked ? 'opacity-50' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {chapterCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : isUnlocked ? (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            )}
                            <CardTitle className="text-base">{chapter.title}</CardTitle>
                          </div>
                          {chapter.instruments.length > 0 && (
                            <div className="flex gap-1">
                              {chapter.instruments.map(inst => (
                                <Button
                                  key={inst.id}
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    viewInstrument(inst);
                                  }}
                                  className="h-8 px-2"
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  {inst.name}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        <CardDescription>{chapter.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {chapter.scenes.map((scene, sceneIndex) => {
                            const completed = isSceneCompleted(scene.id);
                            const canPlay = isUnlocked && (sceneIndex === 0 || 
                              isSceneCompleted(chapter.scenes[sceneIndex - 1].id));
                            
                            return (
                              <div 
                                key={scene.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  completed ? 'bg-green-50 border-green-200' :
                                  canPlay ? 'bg-background hover:bg-accent cursor-pointer' :
                                  'bg-muted/50'
                                }`}
                                onClick={() => canPlay && !completed && startScene(getCurrentAct()!, chapterIndex, sceneIndex)}
                              >
                                <div className="flex items-center gap-3">
                                  {completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                  ) : canPlay ? (
                                    <Play className="w-5 h-5 text-primary" />
                                  ) : (
                                    <Lock className="w-5 h-5 text-muted-foreground" />
                                  )}
                                  <div>
                                    <p className="font-medium">{scene.title}</p>
                                    {scene.quiz && (
                                      <Badge variant="outline" className="text-xs">
                                        Includes Quiz
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {canPlay && !completed && (
                                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruments Learned */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scroll className="w-5 h-5 text-amber-500" />
              Legal Instruments Learned
            </CardTitle>
            <CardDescription>
              Master these tools to navigate all planes of existence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Object.values(LEGAL_INSTRUMENTS).map(instrument => {
                const learned = progress.instrumentsLearned.includes(instrument.id);
                return (
                  <div
                    key={instrument.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      learned ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : 
                      'bg-muted/50 opacity-50'
                    }`}
                    onClick={() => learned && viewInstrument(instrument)}
                  >
                    <instrument.icon className={`w-6 h-6 mb-2 ${learned ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-medium">{instrument.name}</p>
                    {!learned && (
                      <p className="text-xs text-muted-foreground">Not yet learned</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Scene Dialog */}
        <Dialog open={showScene} onOpenChange={setShowScene}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {currentActData && (
                  <currentActData.icon className={`w-5 h-5 ${currentActData.color}`} />
                )}
                {currentSceneData?.title}
              </DialogTitle>
              <DialogDescription>
                {currentActData?.title}
              </DialogDescription>
            </DialogHeader>

            {!showQuiz ? (
              <div className="space-y-6">
                {/* Progress indicator */}
                <div className="flex gap-2">
                  {["narrative", "strawman", "sovereign", "lesson"].map((step, idx) => (
                    <div
                      key={step}
                      className={`flex-1 h-2 rounded-full ${
                        ["narrative", "strawman", "sovereign", "lesson"].indexOf(narrativeStep) >= idx
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                {/* Content based on step */}
                <div className="min-h-[200px]">
                  {narrativeStep === "narrative" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <BookOpen className="w-5 h-5" />
                        <span className="font-semibold">The Story</span>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {currentSceneData?.narrative}
                      </p>
                    </div>
                  )}

                  {narrativeStep === "strawman" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-amber-500">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">The System's Perspective</span>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-foreground leading-relaxed">
                          {currentSceneData?.strawmanPerspective}
                        </p>
                      </div>
                    </div>
                  )}

                  {narrativeStep === "sovereign" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-purple-500">
                        <Crown className="w-5 h-5" />
                        <span className="font-semibold">The Empowered Perspective</span>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-foreground leading-relaxed">
                          {currentSceneData?.sovereignPerspective}
                        </p>
                      </div>
                    </div>
                  )}

                  {narrativeStep === "lesson" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-500">
                        <Lightbulb className="w-5 h-5" />
                        <span className="font-semibold">Key Lesson</span>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-foreground leading-relaxed font-medium">
                          {currentSceneData?.lesson}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={advanceNarrative} className="w-full">
                  {narrativeStep === "lesson" && currentSceneData?.quiz 
                    ? "Take Quiz" 
                    : narrativeStep === "lesson" 
                    ? "Complete Scene" 
                    : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <Brain className="w-5 h-5" />
                  <span className="font-semibold">Knowledge Check</span>
                </div>

                <p className="text-lg font-medium">{currentSceneData?.quiz?.question}</p>

                <div className="space-y-2">
                  {currentSceneData?.quiz?.options.map((option, idx) => (
                    <Button
                      key={idx}
                      variant={
                        quizAnswered
                          ? idx === currentSceneData.quiz!.correctIndex
                            ? "default"
                            : idx === selectedAnswer
                            ? "destructive"
                            : "outline"
                          : selectedAnswer === idx
                          ? "secondary"
                          : "outline"
                      }
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => !quizAnswered && handleQuizAnswer(idx)}
                      disabled={quizAnswered}
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                {quizAnswered && (
                  <div className={`p-4 rounded-lg ${
                    selectedAnswer === currentSceneData?.quiz?.correctIndex
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-amber-50 border border-amber-200'
                  }`}>
                    <p className="text-sm">{currentSceneData?.quiz?.explanation}</p>
                  </div>
                )}

                {quizAnswered && (
                  <Button onClick={completeScene} className="w-full">
                    Complete Scene
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Instrument Dialog */}
        <Dialog open={showInstrument} onOpenChange={setShowInstrument}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {currentInstrument && (
                  <currentInstrument.icon className="w-5 h-5 text-amber-500" />
                )}
                {currentInstrument?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Description</h4>
                <p>{currentInstrument?.description}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Purpose</h4>
                <p>{currentInstrument?.purpose}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">When to Use</h4>
                <p>{currentInstrument?.whenToUse}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInstrument(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
