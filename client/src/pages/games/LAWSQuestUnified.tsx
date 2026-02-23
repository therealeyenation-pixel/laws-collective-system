import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Unlock,
  CheckCircle2,
  Play,
  Trophy,
  Star,
  Zap,
  Shield,
  DollarSign,
  Users,
  BookOpen,
  Target,
  Crown,
  Sparkles,
  Map,
  Wind,
  Droplets,
  Heart,
  Building2,
  FileText,
  Scale,
  TrendingUp,
  Gift,
} from "lucide-react";
import { toast } from "sonner";

// Chapter definitions
interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  duration: string;
  objectives: string[];
  rewards: { type: string; amount: number; description: string }[];
  unlockRequirement?: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "The Awakening",
    subtitle: "See Why Protection Matters",
    description: "Experience two parallel lives - one with protection, one without. Witness the diverging paths of wealth accumulation and understand why the L.A.W.S. system exists.",
    icon: Zap,
    color: "amber",
    duration: "30-45 min",
    objectives: [
      "Choose your starting path (Birth-Ward or Birth-Trust)",
      "Experience key life events and their financial impact",
      "Compare wealth accumulation between both paths",
      "Understand the value of early protection",
    ],
    rewards: [
      { type: "MIRROR Token", amount: 1, description: "Self-awareness achieved" },
      { type: "Knowledge Points", amount: 100, description: "Foundation understanding" },
    ],
  },
  {
    id: 2,
    title: "Foundation Building",
    subtitle: "Create Your Protection Structure",
    description: "Learn to establish the foundational elements of wealth protection - trusts, entities, and the legal structures that shield your assets.",
    icon: Building2,
    color: "blue",
    duration: "45-60 min",
    objectives: [
      "Create your family trust structure",
      "Form your first LLC entity",
      "Understand 508(c)(1)(A) foundation benefits",
      "Connect entities in proper hierarchy",
    ],
    rewards: [
      { type: "GIFT Token", amount: 1, description: "Foundation established" },
      { type: "Knowledge Points", amount: 150, description: "Entity mastery" },
    ],
    unlockRequirement: "Complete Chapter 1",
  },
  {
    id: 3,
    title: "The Protection Layer",
    subtitle: "Shield Your Assets",
    description: "Build the protective barriers around your wealth. Learn operating agreements, asset protection strategies, and how to weather financial storms.",
    icon: Shield,
    color: "green",
    duration: "45-60 min",
    objectives: [
      "Draft operating agreement provisions",
      "Implement asset protection strategies",
      "Navigate lawsuit and liability scenarios",
      "Establish insurance and backup systems",
    ],
    rewards: [
      { type: "SPARK Token", amount: 1, description: "Protection activated" },
      { type: "Knowledge Points", amount: 200, description: "Legal expertise" },
    ],
    unlockRequirement: "Complete Chapter 2",
  },
  {
    id: 4,
    title: "Income Streams",
    subtitle: "Build Sustainable Wealth",
    description: "Transform from employee to owner. Build multiple income streams, develop businesses, and create the cash flow that funds your legacy.",
    icon: TrendingUp,
    color: "purple",
    duration: "60-90 min",
    objectives: [
      "Transition from W-2 to business owner",
      "Develop passive income sources",
      "Build and scale business operations",
      "Optimize tax strategies through entities",
    ],
    rewards: [
      { type: "HOUSE Token", amount: 1, description: "House activated" },
      { type: "Knowledge Points", amount: 250, description: "Business mastery" },
    ],
    unlockRequirement: "Complete Chapter 3",
  },
  {
    id: 5,
    title: "Generational Transfer",
    subtitle: "Build Your 100-Year Legacy",
    description: "The final chapter - learn to transfer wealth across generations, teach your successors, and establish a legacy that outlasts you.",
    icon: Crown,
    color: "gold",
    duration: "60-90 min",
    objectives: [
      "Plan estate succession strategy",
      "Train the next generation",
      "Establish perpetual trust structures",
      "Create your 100-year family plan",
    ],
    rewards: [
      { type: "CROWN Token", amount: 1, description: "Legacy established" },
      { type: "Knowledge Points", amount: 500, description: "Mastery achieved" },
      { type: "Real System Access", amount: 1, description: "Unlock Business Formation tools" },
    ],
    unlockRequirement: "Complete Chapter 4",
  },
];

// Player progress state
interface PlayerProgress {
  currentChapter: number;
  completedChapters: number[];
  totalTokens: { mirror: number; gift: number; spark: number; house: number; crown: number };
  knowledgePoints: number;
  achievements: string[];
  gameChoices: Record<string, any>;
  startedAt: number;
  lastPlayedAt: number;
}

const INITIAL_PROGRESS: PlayerProgress = {
  currentChapter: 1,
  completedChapters: [],
  totalTokens: { mirror: 0, gift: 0, spark: 0, house: 0, crown: 0 },
  knowledgePoints: 0,
  achievements: [],
  gameChoices: {},
  startedAt: Date.now(),
  lastPlayedAt: Date.now(),
};

// Chapter content components
function ChapterOne({ onComplete, progress, updateProgress }: { 
  onComplete: () => void; 
  progress: PlayerProgress;
  updateProgress: (choices: Record<string, any>) => void;
}) {
  const [phase, setPhase] = useState<"intro" | "choice" | "journey" | "comparison" | "complete">("intro");
  const [chosenPath, setChosenPath] = useState<"ward" | "trust" | null>(null);
  const [currentAge, setCurrentAge] = useState(0);
  const [wardWealth, setWardWealth] = useState(0);
  const [trustWealth, setTrustWealth] = useState(50000); // Trust starts with seed capital

  const lifeEvents = [
    { age: 18, event: "High School Graduation", wardEffect: 0, trustEffect: 5000, description: "Trust provides education fund" },
    { age: 22, event: "College Graduation", wardEffect: -40000, trustEffect: 0, description: "Ward takes student loans, Trust paid tuition" },
    { age: 25, event: "First Job", wardEffect: 45000, trustEffect: 45000, description: "Both start careers" },
    { age: 28, event: "Start Business", wardEffect: -20000, trustEffect: 50000, description: "Ward uses savings, Trust uses LLC structure" },
    { age: 32, event: "Lawsuit Filed", wardEffect: -80000, trustEffect: -5000, description: "Ward loses personal assets, Trust protected" },
    { age: 35, event: "Market Crash", wardEffect: -30000, trustEffect: -10000, description: "Trust has diversified protection" },
    { age: 40, event: "Business Growth", wardEffect: 100000, trustEffect: 250000, description: "Trust structure enables scaling" },
    { age: 45, event: "Medical Emergency", wardEffect: -60000, trustEffect: -10000, description: "Trust has proper insurance structure" },
    { age: 50, event: "Children's Education", wardEffect: -120000, trustEffect: 0, description: "Trust education fund covers costs" },
    { age: 55, event: "Retirement Planning", wardEffect: 50000, trustEffect: 200000, description: "Trust has tax-advantaged growth" },
    { age: 60, event: "Estate Planning", wardEffect: -50000, trustEffect: 0, description: "Ward pays estate lawyers, Trust already structured" },
    { age: 65, event: "Retirement", wardEffect: 0, trustEffect: 100000, description: "Trust generates passive income" },
  ];

  const advanceAge = () => {
    const nextEvent = lifeEvents.find(e => e.age > currentAge);
    if (nextEvent) {
      setCurrentAge(nextEvent.age);
      setWardWealth(prev => prev + nextEvent.wardEffect);
      setTrustWealth(prev => prev + nextEvent.trustEffect);
      
      if (nextEvent.age >= 65) {
        setPhase("comparison");
      }
    }
  };

  const startJourney = (path: "ward" | "trust") => {
    setChosenPath(path);
    setPhase("journey");
    updateProgress({ chapter1Path: path });
  };

  const completeChapter = () => {
    updateProgress({
      chapter1Complete: true,
      finalWardWealth: wardWealth,
      finalTrustWealth: trustWealth,
      wealthDifference: trustWealth - wardWealth,
    });
    setPhase("complete");
  };

  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <Zap className="w-16 h-16 mx-auto text-amber-500" />
          <h2 className="text-2xl font-bold">Chapter 1: The Awakening</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            You are about to witness two parallel lives unfold. One person born into the traditional system - 
            a ward of the state with no protective structures. Another born into a family trust - 
            with protection from day one. Watch how their paths diverge over 65 years.
          </p>
        </div>
        <div className="flex justify-center">
          <Button size="lg" onClick={() => setPhase("choice")}>
            <Play className="w-5 h-5 mr-2" />
            Begin Your Journey
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "choice") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">The Question That Changes Everything</h2>
          <p className="text-xl text-muted-foreground">Do you have a trust?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card 
            className="cursor-pointer hover:border-red-500 transition-all"
            onClick={() => startJourney("ward")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Scale className="w-6 h-6" />
                No - Birth-Ward of State
              </CardTitle>
              <CardDescription>Experience life without protection</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  No protective layer at birth
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  W-2 employment path
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Personal liability exposure
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Standard tax burden
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-green-500 transition-all"
            onClick={() => startJourney("trust")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Shield className="w-6 h-6" />
                Yes - Birth-Trust System
              </CardTitle>
              <CardDescription>Experience life with protection</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Trust established at birth
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Business ownership path
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Asset protection active
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Tax-optimized structure
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          Choose a path to experience. You'll see both journeys unfold side by side.
        </p>
      </div>
    );
  }

  if (phase === "journey") {
    const currentEvent = lifeEvents.find(e => e.age === currentAge) || lifeEvents[0];
    const progressPercent = (currentAge / 65) * 100;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Life Journey: Age {currentAge || "Birth"}</h2>
          <Progress value={progressPercent} className="mt-2 max-w-md mx-auto" />
        </div>

        {currentAge > 0 && (
          <Card className="max-w-2xl mx-auto border-2 border-primary">
            <CardHeader>
              <CardTitle>{currentEvent.event}</CardTitle>
              <CardDescription>{currentEvent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${chosenPath === "ward" ? "bg-red-100 dark:bg-red-950 ring-2 ring-red-500" : "bg-red-50 dark:bg-red-950/50"}`}>
                  <p className="text-sm font-medium text-red-600">Ward Path</p>
                  <p className={`text-lg font-bold ${currentEvent.wardEffect >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {currentEvent.wardEffect >= 0 ? "+" : ""}{currentEvent.wardEffect.toLocaleString()}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${chosenPath === "trust" ? "bg-green-100 dark:bg-green-950 ring-2 ring-green-500" : "bg-green-50 dark:bg-green-950/50"}`}>
                  <p className="text-sm font-medium text-green-600">Trust Path</p>
                  <p className={`text-lg font-bold ${currentEvent.trustEffect >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {currentEvent.trustEffect >= 0 ? "+" : ""}{currentEvent.trustEffect.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wealth Comparison */}
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className={chosenPath === "ward" ? "ring-2 ring-red-500" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-600">Ward Wealth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${wardWealth.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className={chosenPath === "trust" ? "ring-2 ring-green-500" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-600">Trust Wealth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${trustWealth.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button size="lg" onClick={advanceAge}>
            <ArrowRight className="w-5 h-5 mr-2" />
            {currentAge === 0 ? "Start Life Journey" : "Next Life Event"}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "comparison") {
    const difference = trustWealth - wardWealth;
    const percentDiff = ((difference / wardWealth) * 100).toFixed(0);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Journey Complete: Final Comparison</h2>
          <p className="text-muted-foreground">65 years of parallel lives</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Ward Path</CardTitle>
              <CardDescription>Without protection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${wardWealth.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Vulnerable to lawsuits, taxes, and life events
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary border-2">
            <CardHeader>
              <CardTitle className="text-primary">The Difference</CardTitle>
              <CardDescription>Protection value</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">+${difference.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {percentDiff}% more wealth with protection
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-600">Trust Path</CardTitle>
              <CardDescription>With protection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${trustWealth.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Protected, tax-optimized, generational
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto bg-amber-50 dark:bg-amber-950/20 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">The Awakening</h3>
                <p className="text-muted-foreground">
                  You've witnessed the power of protection. The same life events, the same opportunities - 
                  but vastly different outcomes. The good news? It's never too late to build your protection layer.
                  The next chapters will show you how.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button size="lg" onClick={completeChapter}>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Complete Chapter 1
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="space-y-6 text-center">
        <Trophy className="w-20 h-20 mx-auto text-amber-500" />
        <h2 className="text-2xl font-bold">Chapter 1 Complete!</h2>
        <p className="text-muted-foreground">You've earned your first rewards</p>
        
        <div className="flex justify-center gap-4">
          <Card className="w-48">
            <CardContent className="pt-6 text-center">
              <Star className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="font-bold">MIRROR Token</p>
              <p className="text-sm text-muted-foreground">Self-awareness achieved</p>
            </CardContent>
          </Card>
          <Card className="w-48">
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="font-bold">+100 Knowledge</p>
              <p className="text-sm text-muted-foreground">Foundation understanding</p>
            </CardContent>
          </Card>
        </div>

        <Button size="lg" onClick={onComplete}>
          <ArrowRight className="w-5 h-5 mr-2" />
          Continue to Chapter 2
        </Button>
      </div>
    );
  }

  return null;
}

// Chapter 2: Foundation Building
function ChapterTwo({ onComplete, progress, updateProgress }: {
  onComplete: () => void;
  progress: PlayerProgress;
  updateProgress: (choices: Record<string, any>) => void;
}) {
  const [phase, setPhase] = useState<"intro" | "trust" | "llc" | "foundation" | "hierarchy" | "complete">("intro");
  const [trustName, setTrustName] = useState("");
  const [llcName, setLlcName] = useState("");
  const [foundationType, setFoundationType] = useState<"508" | "501c3" | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const completeStep = (step: string) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <Building2 className="w-16 h-16 mx-auto text-blue-500" />
          <h2 className="text-2xl font-bold">Chapter 2: Foundation Building</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Now that you understand why protection matters, it's time to build your foundation.
            You'll create the legal structures that protect your wealth and enable generational transfer.
          </p>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>What You'll Build</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Family Trust</p>
                <p className="text-sm text-muted-foreground">The protective container for your assets</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">LLC Entity</p>
                <p className="text-sm text-muted-foreground">Your operating business structure</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-purple-500 mt-1" />
              <div>
                <p className="font-medium">Foundation (508 or 501c3)</p>
                <p className="text-sm text-muted-foreground">Your charitable and educational arm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Button size="lg" onClick={() => setPhase("trust")}>
            <Play className="w-5 h-5 mr-2" />
            Begin Building
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "trust") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Step 1: Create Your Family Trust</h2>
          <p className="text-muted-foreground">The foundation of your protection layer</p>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Family Trust Setup
            </CardTitle>
            <CardDescription>A trust holds assets outside your personal name, providing protection and enabling smooth generational transfer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Trust Name</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                placeholder="e.g., Freeman Family Trust"
                value={trustName}
                onChange={(e) => setTrustName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Typically uses your family name</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Trust Benefits:</h4>
              <ul className="text-sm space-y-1">
                <li>• Assets protected from personal liability</li>
                <li>• Avoids probate on death</li>
                <li>• Enables generational wealth transfer</li>
                <li>• Privacy - not public record</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setPhase("intro")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            size="lg"
            disabled={!trustName}
            onClick={() => {
              completeStep("trust");
              updateProgress({ trustName });
              setPhase("llc");
            }}
          >
            Create Trust
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "llc") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Step 2: Form Your LLC</h2>
          <p className="text-muted-foreground">Your operating business entity</p>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-500" />
              LLC Formation
            </CardTitle>
            <CardDescription>An LLC separates business activities from personal assets and provides tax flexibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">LLC Name</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                placeholder="e.g., LuvOnPurpose Autonomous Wealth System, LLC"
                value={llcName}
                onChange={(e) => setLlcName(e.target.value)}
              />
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">LLC Benefits:</h4>
              <ul className="text-sm space-y-1">
                <li>• Limited personal liability</li>
                <li>• Pass-through taxation (no double tax)</li>
                <li>• Flexible management structure</li>
                <li>• Credibility with vendors and clients</li>
              </ul>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Key Decision: Who Owns the LLC?</h4>
              <p className="text-sm">The Trust should own the LLC, not you personally. This adds another layer of protection.</p>
              <div className="mt-2 p-2 bg-background rounded border">
                <p className="text-sm font-medium">{trustName || "Your Trust"} → owns → {llcName || "Your LLC"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setPhase("trust")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            size="lg"
            disabled={!llcName}
            onClick={() => {
              completeStep("llc");
              updateProgress({ llcName });
              setPhase("foundation");
            }}
          >
            Form LLC
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "foundation") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Step 3: Establish Your Foundation</h2>
          <p className="text-muted-foreground">Your charitable and educational arm</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <Card
            className={`cursor-pointer transition-all ${foundationType === "508" ? "ring-2 ring-purple-500" : "hover:border-purple-300"}`}
            onClick={() => setFoundationType("508")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Heart className="w-5 h-5" />
                508(c)(1)(A)
              </CardTitle>
              <CardDescription>Faith-based organization</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  No IRS application required
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Automatic tax exemption
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Less reporting requirements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Greater operational freedom
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all ${foundationType === "501c3" ? "ring-2 ring-blue-500" : "hover:border-blue-300"}`}
            onClick={() => setFoundationType("501c3")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Building2 className="w-5 h-5" />
                501(c)(3)
              </CardTitle>
              <CardDescription>Traditional nonprofit</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Widely recognized status
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Eligible for most grants
                </li>
                <li className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-500" />
                  IRS application required
                </li>
                <li className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-500" />
                  Annual reporting (Form 990)
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        {foundationType && (
          <Card className="max-w-2xl mx-auto bg-purple-50 dark:bg-purple-950/20">
            <CardContent className="pt-6">
              <p className="text-sm">
                <strong>Your Choice:</strong> {foundationType === "508" ? "508(c)(1)(A)" : "501(c)(3)"}
                <br />
                {foundationType === "508"
                  ? "A 508(c)(1)(A) provides maximum flexibility with minimal government oversight. Ideal for faith-based educational and charitable work."
                  : "A 501(c)(3) provides broad grant eligibility and public recognition. Requires more compliance but opens more funding doors."}
              </p>
            </CardContent>
          </Card>
        )}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setPhase("llc")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            size="lg"
            disabled={!foundationType}
            onClick={() => {
              completeStep("foundation");
              updateProgress({ foundationType });
              setPhase("hierarchy");
            }}
          >
            Establish Foundation
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "hierarchy") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Step 4: Connect Your Entities</h2>
          <p className="text-muted-foreground">The proper hierarchy maximizes protection</p>
        </div>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Your Entity Structure</CardTitle>
            <CardDescription>How your entities connect for maximum protection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Visual hierarchy */}
              <div className="bg-gradient-to-b from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 p-6 rounded-lg">
                <div className="text-center space-y-4">
                  <div className="inline-block bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
                    <p className="font-bold text-blue-700 dark:text-blue-300">{trustName || "Family Trust"}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Root Protection Layer</p>
                  </div>
                  <div className="text-2xl">↓</div>
                  <div className="inline-block bg-green-100 dark:bg-green-900 px-4 py-2 rounded-lg">
                    <p className="font-bold text-green-700 dark:text-green-300">{llcName || "Parent LLC"}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">100% owned by Trust</p>
                  </div>
                  <div className="text-2xl">↓</div>
                  <div className="flex justify-center gap-4 flex-wrap">
                    <div className="bg-purple-100 dark:bg-purple-900 px-4 py-2 rounded-lg">
                      <p className="font-bold text-purple-700 dark:text-purple-300">{foundationType === "508" ? "508 Foundation" : "501(c)(3)"}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">Education & Charity</p>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900 px-4 py-2 rounded-lg">
                      <p className="font-bold text-amber-700 dark:text-amber-300">Operating LLC</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">Day-to-day Business</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Why This Structure?</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Trust at top = maximum asset protection</li>
                    <li>• LLC layer = liability separation</li>
                    <li>• Foundation = tax benefits + mission</li>
                    <li>• Operating entity = business activities</li>
                  </ul>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Protection Flow</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Lawsuit hits Operating LLC first</li>
                    <li>• Parent LLC provides second barrier</li>
                    <li>• Trust assets remain untouchable</li>
                    <li>• Personal assets never at risk</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setPhase("foundation")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={() => {
              completeStep("hierarchy");
              updateProgress({ hierarchyComplete: true });
              setPhase("complete");
            }}
          >
            Complete Foundation
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="space-y-6 text-center">
        <Trophy className="w-20 h-20 mx-auto text-blue-500" />
        <h2 className="text-2xl font-bold">Chapter 2 Complete!</h2>
        <p className="text-muted-foreground">You've built your foundation</p>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <h3 className="font-bold mb-4">Your Structure:</h3>
            <div className="text-left space-y-2">
              <p><strong>Trust:</strong> {trustName}</p>
              <p><strong>Parent LLC:</strong> {llcName}</p>
              <p><strong>Foundation:</strong> {foundationType === "508" ? "508(c)(1)(A)" : "501(c)(3)"}</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          <Card className="w-48">
            <CardContent className="pt-6 text-center">
              <Gift className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="font-bold">GIFT Token</p>
              <p className="text-sm text-muted-foreground">Foundation established</p>
            </CardContent>
          </Card>
          <Card className="w-48">
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="font-bold">+150 Knowledge</p>
              <p className="text-sm text-muted-foreground">Entity mastery</p>
            </CardContent>
          </Card>
        </div>
        <Button size="lg" onClick={onComplete}>
          <ArrowRight className="w-5 h-5 mr-2" />
          Continue to Chapter 3
        </Button>
      </div>
    );
  }

  return null;
}

// Chapter 3: The Protection Layer
function ChapterThree({ onComplete, progress, updateProgress }: {
  onComplete: () => void;
  progress: PlayerProgress;
  updateProgress: (choices: Record<string, any>) => void;
}) {
  const [phase, setPhase] = useState<"intro" | "scenarios" | "agreement" | "insurance" | "stress-test" | "complete">("intro");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [protectionChoices, setProtectionChoices] = useState<Record<string, string>>({});
  const [agreementProvisions, setAgreementProvisions] = useState<string[]>([]);

  const scenarios = [
    {
      title: "Business Partner Lawsuit",
      description: "Your business partner is sued personally for an unrelated car accident. The plaintiff's attorney discovers he owns 50% of your LLC.",
      options: [
        { id: "charging-order", label: "Charging Order Protection", description: "LLC interests can only be subject to charging orders, not seizure", protection: 90 },
        { id: "no-protection", label: "No Special Provisions", description: "Standard LLC with default state rules", protection: 40 },
      ],
      lesson: "Charging order protection prevents creditors from seizing LLC interests - they can only receive distributions if made."
    },
    {
      title: "Medical Emergency",
      description: "A family member has a $500,000 medical bill. Creditors are pursuing all family assets.",
      options: [
        { id: "trust-protection", label: "Assets in Trust", description: "Medical bills can't reach trust assets", protection: 95 },
        { id: "personal-assets", label: "Personal Ownership", description: "Assets in personal name are vulnerable", protection: 20 },
      ],
      lesson: "Assets held in a properly structured trust are generally protected from personal creditors."
    },
    {
      title: "Divorce Proceedings",
      description: "A family member is going through divorce. The spouse claims 50% of all business interests.",
      options: [
        { id: "separate-property", label: "Trust-Owned Business", description: "Business owned by trust before marriage", protection: 85 },
        { id: "marital-property", label: "Personal Business", description: "Business started during marriage in personal name", protection: 30 },
      ],
      lesson: "Pre-existing trust ownership can help protect business assets from marital property claims."
    },
  ];

  const provisions = [
    { id: "charging-order", label: "Charging Order as Exclusive Remedy", description: "Creditors can only get a charging order, not seize membership" },
    { id: "transfer-restrictions", label: "Transfer Restrictions", description: "Members cannot freely transfer interests without approval" },
    { id: "buyout-provisions", label: "Mandatory Buyout Provisions", description: "Company can buy out a member's interest at fair value" },
    { id: "dissolution-protection", label: "Dissolution Protection", description: "Creditor cannot force dissolution of the LLC" },
    { id: "spendthrift", label: "Spendthrift Provisions", description: "Prevents beneficiaries from pledging future distributions" },
  ];

  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-bold">Chapter 3: The Protection Layer</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your foundation is built. Now it's time to fortify it. You'll learn how to protect your assets
            from lawsuits, creditors, and life's unexpected challenges.
          </p>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>What You'll Learn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Asset Protection Strategies</p>
                <p className="text-sm text-muted-foreground">How to shield assets from creditors legally</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Operating Agreement Provisions</p>
                <p className="text-sm text-muted-foreground">Key clauses that maximize protection</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-500 mt-1" />
              <div>
                <p className="font-medium">Insurance & Backup Systems</p>
                <p className="text-sm text-muted-foreground">Multiple layers of defense</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Button size="lg" onClick={() => setPhase("scenarios")}>
            <Play className="w-5 h-5 mr-2" />
            Begin Protection Training
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "scenarios") {
    const scenario = scenarios[currentScenario];
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Protection Scenario {currentScenario + 1} of {scenarios.length}</h2>
          <Progress value={((currentScenario + 1) / scenarios.length) * 100} className="mt-2 max-w-md mx-auto" />
        </div>
        <Card className="max-w-2xl mx-auto border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-500" />
              {scenario.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{scenario.description}</p>
            <div className="space-y-3">
              {scenario.options.map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all ${protectionChoices[scenario.title] === option.id ? "ring-2 ring-green-500" : "hover:border-green-300"}`}
                  onClick={() => setProtectionChoices({ ...protectionChoices, [scenario.title]: option.id })}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <Badge variant={option.protection > 70 ? "default" : "secondary"}>
                        {option.protection}% Protected
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {protectionChoices[scenario.title] && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm"><strong>Lesson:</strong> {scenario.lesson}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          {currentScenario > 0 && (
            <Button variant="outline" onClick={() => setCurrentScenario(currentScenario - 1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          <Button
            size="lg"
            disabled={!protectionChoices[scenario.title]}
            onClick={() => {
              if (currentScenario < scenarios.length - 1) {
                setCurrentScenario(currentScenario + 1);
              } else {
                updateProgress({ protectionChoices });
                setPhase("agreement");
              }
            }}
          >
            {currentScenario < scenarios.length - 1 ? "Next Scenario" : "Continue to Agreement"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "agreement") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Operating Agreement Provisions</h2>
          <p className="text-muted-foreground">Select the provisions to include in your LLC operating agreement</p>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Protection Provisions</CardTitle>
            <CardDescription>Each provision adds a layer of protection. Select at least 3.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {provisions.map((provision) => (
              <div
                key={provision.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${agreementProvisions.includes(provision.id) ? "bg-green-50 dark:bg-green-950/20 border-green-500" : "hover:border-green-300"}`}
                onClick={() => {
                  if (agreementProvisions.includes(provision.id)) {
                    setAgreementProvisions(agreementProvisions.filter(p => p !== provision.id));
                  } else {
                    setAgreementProvisions([...agreementProvisions, provision.id]);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${agreementProvisions.includes(provision.id) ? "bg-green-500 border-green-500" : "border-muted-foreground"}`}>
                    {agreementProvisions.includes(provision.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium">{provision.label}</p>
                    <p className="text-sm text-muted-foreground">{provision.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setPhase("scenarios")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            size="lg"
            disabled={agreementProvisions.length < 3}
            onClick={() => {
              updateProgress({ agreementProvisions });
              setPhase("complete");
            }}
          >
            Finalize Agreement
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="space-y-6 text-center">
        <Trophy className="w-20 h-20 mx-auto text-green-500" />
        <h2 className="text-2xl font-bold">Chapter 3 Complete!</h2>
        <p className="text-muted-foreground">Your protection layer is active</p>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <h3 className="font-bold mb-4">Protection Summary:</h3>
            <div className="text-left space-y-2">
              <p><strong>Scenarios Completed:</strong> {scenarios.length}</p>
              <p><strong>Provisions Selected:</strong> {agreementProvisions.length}</p>
              <p><strong>Protection Level:</strong> {agreementProvisions.length >= 4 ? "Maximum" : agreementProvisions.length >= 3 ? "Strong" : "Basic"}</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          <Card className="w-48">
            <CardContent className="pt-6 text-center">
              <Sparkles className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="font-bold">SPARK Token</p>
              <p className="text-sm text-muted-foreground">Protection activated</p>
            </CardContent>
          </Card>
          <Card className="w-48">
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="font-bold">+200 Knowledge</p>
              <p className="text-sm text-muted-foreground">Legal expertise</p>
            </CardContent>
          </Card>
        </div>
        <Button size="lg" onClick={onComplete}>
          <ArrowRight className="w-5 h-5 mr-2" />
          Continue to Chapter 4
        </Button>
      </div>
    );
  }

  return null;
}

// Chapter 4: Income Streams
function ChapterFour({ onComplete, progress, updateProgress }: {
  onComplete: () => void;
  progress: PlayerProgress;
  updateProgress: (choices: Record<string, any>) => void;
}) {
  const [phase, setPhase] = useState<"intro" | "transition" | "business" | "passive" | "complete">("intro");
  const [currentRole, setCurrentRole] = useState<"w2" | "contractor" | "owner">("w2");
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [incomeStreams, setIncomeStreams] = useState<string[]>([]);

  const businessTypes = [
    { id: "service", label: "Service Business", description: "Consulting, coaching, professional services", startup: 5000, potential: 200000 },
    { id: "product", label: "Product Business", description: "Physical or digital products", startup: 20000, potential: 500000 },
    { id: "real-estate", label: "Real Estate", description: "Rental properties, development", startup: 50000, potential: 1000000 },
    { id: "franchise", label: "Franchise", description: "Proven system, established brand", startup: 100000, potential: 300000 },
  ];

  const passiveIncomeOptions = [
    { id: "rental", label: "Rental Income", description: "Property generates monthly rent", monthly: 2000 },
    { id: "dividends", label: "Dividend Stocks", description: "Quarterly payments from investments", monthly: 500 },
    { id: "royalties", label: "Royalties", description: "Intellectual property licensing", monthly: 1000 },
    { id: "business-distributions", label: "Business Distributions", description: "Profits from businesses you own", monthly: 5000 },
  ];

  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <TrendingUp className="w-16 h-16 mx-auto text-purple-500" />
          <h2 className="text-2xl font-bold">Chapter 4: Income Streams</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Protection without income is just an empty fortress. Now you'll learn to build
            sustainable wealth through business ownership and passive income.
          </p>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>The Transition Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-2">
                  <Users className="w-8 h-8 text-red-500" />
                </div>
                <p className="font-medium">W-2 Employee</p>
                <p className="text-xs text-muted-foreground">Trading time for money</p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-8 h-8 text-amber-500" />
                </div>
                <p className="font-medium">Contractor</p>
                <p className="text-xs text-muted-foreground">More control, tax benefits</p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-medium">Business Owner</p>
                <p className="text-xs text-muted-foreground">Wealth building mode</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Button size="lg" onClick={() => setPhase("transition")}>
            <Play className="w-5 h-5 mr-2" />
            Begin Income Journey
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "transition") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">The Transition: W-2 → Contractor → Owner</h2>
          <p className="text-muted-foreground">Each step increases your control and wealth potential</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className={`cursor-pointer transition-all ${currentRole === "w2" ? "ring-2 ring-red-500" : ""}`} onClick={() => setCurrentRole("w2")}>
            <CardHeader>
              <CardTitle className="text-red-600">W-2 Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>✓ Stable paycheck</li>
                <li>✓ Benefits provided</li>
                <li>✗ Limited deductions</li>
                <li>✗ No equity building</li>
                <li>✗ Employer controls income</li>
              </ul>
              <p className="mt-4 text-lg font-bold">Tax Rate: ~35%</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all ${currentRole === "contractor" ? "ring-2 ring-amber-500" : ""}`} onClick={() => setCurrentRole("contractor")}>
            <CardHeader>
              <CardTitle className="text-amber-600">Contractor</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>✓ Higher gross pay</li>
                <li>✓ Business deductions</li>
                <li>✓ Multiple clients</li>
                <li>✗ Self-employment tax</li>
                <li>✗ Still trading time</li>
              </ul>
              <p className="mt-4 text-lg font-bold">Effective Rate: ~25%</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all ${currentRole === "owner" ? "ring-2 ring-green-500" : ""}`} onClick={() => setCurrentRole("owner")}>
            <CardHeader>
              <CardTitle className="text-green-600">Business Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>✓ Unlimited income potential</li>
                <li>✓ Maximum deductions</li>
                <li>✓ Build sellable equity</li>
                <li>✓ Passive income possible</li>
                <li>✓ Generational wealth</li>
              </ul>
              <p className="mt-4 text-lg font-bold">Effective Rate: ~15%</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center">
          <Button size="lg" onClick={() => { updateProgress({ transitionPath: currentRole }); setPhase("business"); }}>
            Continue to Business Selection
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "business") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Choose Your Business Path</h2>
          <p className="text-muted-foreground">Select the business type that aligns with your skills and goals</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {businessTypes.map((biz) => (
            <Card
              key={biz.id}
              className={`cursor-pointer transition-all ${businessType === biz.id ? "ring-2 ring-purple-500" : "hover:border-purple-300"}`}
              onClick={() => setBusinessType(biz.id)}
            >
              <CardHeader>
                <CardTitle>{biz.label}</CardTitle>
                <CardDescription>{biz.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Startup Cost</p>
                    <p className="font-bold">${biz.startup.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Potential</p>
                    <p className="font-bold text-green-600">${biz.potential.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setPhase("transition")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button size="lg" disabled={!businessType} onClick={() => { updateProgress({ businessType }); setPhase("passive"); }}>
            Continue to Passive Income
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "passive") {
    const totalMonthly = incomeStreams.reduce((sum, id) => {
      const stream = passiveIncomeOptions.find(p => p.id === id);
      return sum + (stream?.monthly || 0);
    }, 0);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Build Passive Income Streams</h2>
          <p className="text-muted-foreground">Select income sources that work while you sleep</p>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Passive Income Portfolio</CardTitle>
            <CardDescription>Select multiple streams to diversify your income</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {passiveIncomeOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${incomeStreams.includes(option.id) ? "bg-purple-50 dark:bg-purple-950/20 border-purple-500" : "hover:border-purple-300"}`}
                onClick={() => {
                  if (incomeStreams.includes(option.id)) {
                    setIncomeStreams(incomeStreams.filter(s => s !== option.id));
                  } else {
                    setIncomeStreams([...incomeStreams, option.id]);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    +${option.monthly.toLocaleString()}/mo
                  </Badge>
                </div>
              </div>
            ))}
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-lg font-bold text-green-600">Total Passive Income: ${totalMonthly.toLocaleString()}/month</p>
              <p className="text-sm text-muted-foreground">= ${(totalMonthly * 12).toLocaleString()}/year without active work</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setPhase("business")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button size="lg" disabled={incomeStreams.length < 2} onClick={() => { updateProgress({ incomeStreams, totalMonthlyPassive: totalMonthly }); setPhase("complete"); }}>
            Complete Income Strategy
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="space-y-6 text-center">
        <Trophy className="w-20 h-20 mx-auto text-purple-500" />
        <h2 className="text-2xl font-bold">Chapter 4 Complete!</h2>
        <p className="text-muted-foreground">Your income engine is running</p>
        <div className="flex justify-center gap-4">
          <Card className="w-48">
            <CardContent className="pt-6 text-center">
              <Building2 className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="font-bold">HOUSE Token</p>
              <p className="text-sm text-muted-foreground">House activated</p>
            </CardContent>
          </Card>
          <Card className="w-48">
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="font-bold">+250 Knowledge</p>
              <p className="text-sm text-muted-foreground">Business mastery</p>
            </CardContent>
          </Card>
        </div>
        <Button size="lg" onClick={onComplete}>
          <ArrowRight className="w-5 h-5 mr-2" />
          Continue to Final Chapter
        </Button>
      </div>
    );
  }

  return null;
}

// Chapter 5: Generational Transfer
function ChapterFive({ onComplete, progress, updateProgress }: {
  onComplete: () => void;
  progress: PlayerProgress;
  updateProgress: (choices: Record<string, any>) => void;
}) {
  const [phase, setPhase] = useState<"intro" | "succession" | "teaching" | "legacy" | "complete">("intro");
  const [successionPlan, setSuccessionPlan] = useState<string[]>([]);
  const [teachingMethods, setTeachingMethods] = useState<string[]>([]);
  const [legacyGoals, setLegacyGoals] = useState<string[]>([]);

  const successionOptions = [
    { id: "trust-succession", label: "Trust Succession Plan", description: "Detailed instructions for trust management transfer" },
    { id: "business-succession", label: "Business Succession Plan", description: "Who takes over operations and ownership" },
    { id: "power-of-attorney", label: "Power of Attorney", description: "Who makes decisions if you're incapacitated" },
    { id: "healthcare-directive", label: "Healthcare Directive", description: "Medical decision-making authority" },
  ];

  const teachingOptions = [
    { id: "family-meetings", label: "Regular Family Meetings", description: "Quarterly discussions about wealth and values" },
    { id: "apprenticeship", label: "Business Apprenticeship", description: "Hands-on training in family businesses" },
    { id: "financial-education", label: "Financial Education Program", description: "Structured learning about money management" },
    { id: "mentorship", label: "External Mentorship", description: "Connect with successful mentors outside family" },
  ];

  const legacyOptions = [
    { id: "100-year-trust", label: "100-Year Dynasty Trust", description: "Multi-generational wealth preservation" },
    { id: "family-foundation", label: "Family Foundation", description: "Charitable giving with family involvement" },
    { id: "family-office", label: "Family Office", description: "Professional management of family wealth" },
    { id: "family-constitution", label: "Family Constitution", description: "Written values and governance principles" },
  ];

  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <Crown className="w-16 h-16 mx-auto text-yellow-500" />
          <h2 className="text-2xl font-bold">Chapter 5: Generational Transfer</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The final chapter. Everything you've built means nothing if it doesn't outlast you.
            Now you'll learn to transfer wealth, knowledge, and values across generations.
          </p>
        </div>
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardHeader>
            <CardTitle>The 100-Year Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Most wealth is lost within three generations. Your goal is to break that cycle
              by creating systems, education, and structures that preserve and grow wealth indefinitely.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-amber-600">Gen 1</p>
                <p className="text-xs text-muted-foreground">Creates wealth</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">Gen 2</p>
                <p className="text-xs text-muted-foreground">Maintains wealth</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">Gen 3+</p>
                <p className="text-xs text-muted-foreground">Grows wealth (your goal)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Button size="lg" onClick={() => setPhase("succession")}>
            <Play className="w-5 h-5 mr-2" />
            Begin Legacy Planning
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "succession") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Step 1: Succession Planning</h2>
          <p className="text-muted-foreground">Ensure smooth transitions when the time comes</p>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Essential Succession Documents</CardTitle>
            <CardDescription>Select all that apply to your situation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {successionOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${successionPlan.includes(option.id) ? "bg-amber-50 dark:bg-amber-950/20 border-amber-500" : "hover:border-amber-300"}`}
                onClick={() => {
                  if (successionPlan.includes(option.id)) {
                    setSuccessionPlan(successionPlan.filter(s => s !== option.id));
                  } else {
                    setSuccessionPlan([...successionPlan, option.id]);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${successionPlan.includes(option.id) ? "bg-amber-500 border-amber-500" : "border-muted-foreground"}`}>
                    {successionPlan.includes(option.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setPhase("intro")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button size="lg" disabled={successionPlan.length < 2} onClick={() => { updateProgress({ successionPlan }); setPhase("teaching"); }}>
            Continue to Teaching
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "teaching") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Step 2: Teaching the Next Generation</h2>
          <p className="text-muted-foreground">Wealth without wisdom is quickly lost</p>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Education Methods</CardTitle>
            <CardDescription>How will you prepare the next generation?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teachingOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${teachingMethods.includes(option.id) ? "bg-blue-50 dark:bg-blue-950/20 border-blue-500" : "hover:border-blue-300"}`}
                onClick={() => {
                  if (teachingMethods.includes(option.id)) {
                    setTeachingMethods(teachingMethods.filter(t => t !== option.id));
                  } else {
                    setTeachingMethods([...teachingMethods, option.id]);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${teachingMethods.includes(option.id) ? "bg-blue-500 border-blue-500" : "border-muted-foreground"}`}>
                    {teachingMethods.includes(option.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setPhase("succession")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button size="lg" disabled={teachingMethods.length < 2} onClick={() => { updateProgress({ teachingMethods }); setPhase("legacy"); }}>
            Continue to Legacy
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "legacy") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Step 3: Your 100-Year Legacy</h2>
          <p className="text-muted-foreground">Build structures that outlast generations</p>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Legacy Structures</CardTitle>
            <CardDescription>Select the foundations of your multi-generational legacy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {legacyOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${legacyGoals.includes(option.id) ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500" : "hover:border-yellow-300"}`}
                onClick={() => {
                  if (legacyGoals.includes(option.id)) {
                    setLegacyGoals(legacyGoals.filter(l => l !== option.id));
                  } else {
                    setLegacyGoals([...legacyGoals, option.id]);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${legacyGoals.includes(option.id) ? "bg-yellow-500 border-yellow-500" : "border-muted-foreground"}`}>
                    {legacyGoals.includes(option.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setPhase("teaching")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button size="lg" disabled={legacyGoals.length < 2} onClick={() => { updateProgress({ legacyGoals }); setPhase("complete"); }}>
            Complete Legacy Plan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="space-y-6 text-center">
        <div className="relative">
          <Crown className="w-24 h-24 mx-auto text-yellow-500" />
          <Sparkles className="w-8 h-8 absolute top-0 right-1/3 text-yellow-400 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold">Quest Complete!</h2>
        <p className="text-xl text-muted-foreground">You have mastered the L.A.W.S. system</p>
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-4">Your Legacy Plan:</h3>
            <div className="text-left space-y-2">
              <p><strong>Succession Documents:</strong> {successionPlan.length} prepared</p>
              <p><strong>Teaching Methods:</strong> {teachingMethods.length} implemented</p>
              <p><strong>Legacy Structures:</strong> {legacyGoals.length} established</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center gap-4 flex-wrap">
          <Card className="w-40">
            <CardContent className="pt-6 text-center">
              <Crown className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <p className="font-bold">CROWN Token</p>
              <p className="text-xs text-muted-foreground">Legacy established</p>
            </CardContent>
          </Card>
          <Card className="w-40">
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="font-bold">+500 Knowledge</p>
              <p className="text-xs text-muted-foreground">Mastery achieved</p>
            </CardContent>
          </Card>
          <Card className="w-40">
            <CardContent className="pt-6 text-center">
              <Building2 className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="font-bold">Real System</p>
              <p className="text-xs text-muted-foreground">Access unlocked</p>
            </CardContent>
          </Card>
        </div>
        <Button size="lg" onClick={onComplete}>
          <Trophy className="w-5 h-5 mr-2" />
          Complete Quest & Unlock Real Tools
        </Button>
      </div>
    );
  }

  return null;
}

// Placeholder for any remaining chapters
function ChapterPlaceholder({ chapter, onComplete }: { chapter: Chapter; onComplete: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <chapter.icon className={`w-16 h-16 mx-auto text-${chapter.color}-500`} />
      <h2 className="text-2xl font-bold">{chapter.title}</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">{chapter.description}</p>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Chapter Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-left">
            {chapter.objectives.map((obj, i) => (
              <li key={i} className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                {obj}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Full chapter content coming soon. For now, you can preview and continue.
      </p>

      <Button size="lg" onClick={onComplete}>
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Complete Chapter (Preview Mode)
      </Button>
    </div>
  );
}

// Main unified game component
export default function LAWSQuestUnified() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    const saved = localStorage.getItem("laws-quest-progress");
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
  });
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [showHub, setShowHub] = useState(true);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem("laws-quest-progress", JSON.stringify(progress));
  }, [progress]);

  const isChapterUnlocked = (chapterId: number) => {
    if (chapterId === 1) return true;
    return progress.completedChapters.includes(chapterId - 1);
  };

  const isChapterCompleted = (chapterId: number) => {
    return progress.completedChapters.includes(chapterId);
  };

  const startChapter = (chapterId: number) => {
    if (!isChapterUnlocked(chapterId)) {
      toast.error("Complete the previous chapter first");
      return;
    }
    setActiveChapter(chapterId);
    setShowHub(false);
    setProgress(prev => ({ ...prev, currentChapter: chapterId, lastPlayedAt: Date.now() }));
  };

  const completeChapter = (chapterId: number) => {
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    if (!chapter) return;

    // Award tokens based on chapter
    const tokenKey = ["mirror", "gift", "spark", "house", "crown"][chapterId - 1] as keyof typeof progress.totalTokens;
    const knowledgeReward = chapter.rewards.find(r => r.type === "Knowledge Points")?.amount || 0;

    setProgress(prev => ({
      ...prev,
      completedChapters: [...new Set([...prev.completedChapters, chapterId])],
      totalTokens: { ...prev.totalTokens, [tokenKey]: prev.totalTokens[tokenKey] + 1 },
      knowledgePoints: prev.knowledgePoints + knowledgeReward,
      lastPlayedAt: Date.now(),
    }));

    toast.success(`Chapter ${chapterId} completed!`);
    
    // Return to hub or advance
    if (chapterId < 5) {
      setActiveChapter(null);
      setShowHub(true);
    }
  };

  const updateChapterProgress = (choices: Record<string, any>) => {
    setProgress(prev => ({
      ...prev,
      gameChoices: { ...prev.gameChoices, ...choices },
    }));
  };

  const resetProgress = () => {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      setProgress(INITIAL_PROGRESS);
      localStorage.removeItem("laws-quest-progress");
      toast.success("Progress reset");
    }
  };

  const totalProgress = (progress.completedChapters.length / CHAPTERS.length) * 100;

  // Chapter Hub
  if (showHub) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => setLocation("/games")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
            <Button variant="outline" size="sm" onClick={resetProgress}>
              Reset Progress
            </Button>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">L.A.W.S. Quest</h1>
            <p className="text-xl text-muted-foreground">The Sovereignty Game</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="text-lg px-4 py-1">
                <BookOpen className="w-4 h-4 mr-2" />
                {progress.knowledgePoints} Knowledge
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-1">
                <Trophy className="w-4 h-4 mr-2" />
                {progress.completedChapters.length}/5 Chapters
              </Badge>
            </div>
          </div>

          {/* Overall Progress */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{totalProgress.toFixed(0)}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </CardContent>
          </Card>

          {/* Token Collection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Token Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { name: "MIRROR", icon: Zap, color: "amber", count: progress.totalTokens.mirror },
                  { name: "GIFT", icon: Gift, color: "blue", count: progress.totalTokens.gift },
                  { name: "SPARK", icon: Sparkles, color: "green", count: progress.totalTokens.spark },
                  { name: "HOUSE", icon: Building2, color: "purple", count: progress.totalTokens.house },
                  { name: "CROWN", icon: Crown, color: "yellow", count: progress.totalTokens.crown },
                ].map((token) => (
                  <div 
                    key={token.name}
                    className={`text-center p-4 rounded-lg ${token.count > 0 ? `bg-${token.color}-50 dark:bg-${token.color}-950/20` : "bg-muted/50"}`}
                  >
                    <token.icon className={`w-8 h-8 mx-auto mb-2 ${token.count > 0 ? `text-${token.color}-500` : "text-muted-foreground"}`} />
                    <p className="font-bold text-sm">{token.name}</p>
                    <p className="text-xs text-muted-foreground">{token.count}/1</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chapters */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Chapters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHAPTERS.map((chapter) => {
                const unlocked = isChapterUnlocked(chapter.id);
                const completed = isChapterCompleted(chapter.id);
                
                return (
                  <Card 
                    key={chapter.id}
                    className={`transition-all ${unlocked ? "cursor-pointer hover:shadow-lg" : "opacity-60"} ${completed ? "border-green-500" : ""}`}
                    onClick={() => unlocked && startChapter(chapter.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant={completed ? "default" : unlocked ? "secondary" : "outline"}>
                          Chapter {chapter.id}
                        </Badge>
                        {completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : unlocked ? (
                          <Unlock className="w-5 h-5 text-primary" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <CardTitle className="flex items-center gap-2 mt-2">
                        <chapter.icon className={`w-5 h-5 text-${chapter.color}-500`} />
                        {chapter.title}
                      </CardTitle>
                      <CardDescription>{chapter.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {chapter.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{chapter.duration}</span>
                        <span>{chapter.objectives.length} objectives</span>
                      </div>
                      {!unlocked && chapter.unlockRequirement && (
                        <p className="text-xs text-amber-600 mt-2">
                          <Lock className="w-3 h-3 inline mr-1" />
                          {chapter.unlockRequirement}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Game Completion - Bridge to Real System */}
          {progress.completedChapters.length === 5 && (
            <Card className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Crown className="w-12 h-12 text-amber-500" />
                    <div>
                      <h3 className="text-xl font-bold">Quest Complete - Sovereignty Achieved!</h3>
                      <p className="text-muted-foreground">
                        You've mastered the L.A.W.S. system. Your game choices have been saved and can pre-fill your real documents.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-bold mb-3">Your Journey Summary:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                        <p className="font-medium">Path Chosen</p>
                        <p className="text-muted-foreground">{progress.chapterProgress[1]?.pathChosen || "Birth-Trust"}</p>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
                        <p className="font-medium">Entity Type</p>
                        <p className="text-muted-foreground">{progress.chapterProgress[2]?.foundationType || "508(c)(1)(A)"}</p>
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                        <p className="font-medium">Protection</p>
                        <p className="text-muted-foreground">{progress.chapterProgress[3]?.agreementProvisions?.length || 5} provisions</p>
                      </div>
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded">
                        <p className="font-medium">Business</p>
                        <p className="text-muted-foreground">{progress.chapterProgress[4]?.businessType || "Service"}</p>
                      </div>
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                        <p className="font-medium">Legacy</p>
                        <p className="text-muted-foreground">{progress.chapterProgress[5]?.legacyGoals?.length || 4} structures</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-bold mb-3">Ready to Build Your Real System?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      The game taught you the concepts. Now use the actual tools to create legally binding documents.
                      Your game choices will pre-fill the forms to save time.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button variant="outline" className="justify-start" onClick={() => setLocation("/business-formation")}>
                        <Building2 className="w-4 h-4 mr-2" />
                        Business Formation
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => setLocation("/protection-layer")}>
                        <Shield className="w-4 h-4 mr-2" />
                        Protection Layer
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => setLocation("/trust-documents")}>
                        <FileText className="w-4 h-4 mr-2" />
                        Trust Documents
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Button size="lg" className="w-full" onClick={() => setLocation("/business-formation")}>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Start Real Business Formation (Recommended First Step)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Active Chapter Content
  const currentChapter = CHAPTERS.find(c => c.id === activeChapter);
  if (!currentChapter) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Chapter Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => { setShowHub(true); setActiveChapter(null); }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
          <Badge variant="outline" className="text-lg px-4 py-1">
            Chapter {currentChapter.id}: {currentChapter.title}
          </Badge>
        </div>

        {/* Chapter Content */}
        {activeChapter === 1 ? (
          <ChapterOne 
            onComplete={() => completeChapter(1)} 
            progress={progress}
            updateProgress={updateChapterProgress}
          />
        ) : activeChapter === 2 ? (
          <ChapterTwo 
            onComplete={() => completeChapter(2)} 
            progress={progress}
            updateProgress={updateChapterProgress}
          />
        ) : activeChapter === 3 ? (
          <ChapterThree 
            onComplete={() => completeChapter(3)} 
            progress={progress}
            updateProgress={updateChapterProgress}
          />
        ) : activeChapter === 4 ? (
          <ChapterFour 
            onComplete={() => completeChapter(4)} 
            progress={progress}
            updateProgress={updateChapterProgress}
          />
        ) : activeChapter === 5 ? (
          <ChapterFive 
            onComplete={() => completeChapter(5)} 
            progress={progress}
            updateProgress={updateChapterProgress}
          />
        ) : (
          <ChapterPlaceholder 
            chapter={currentChapter} 
            onComplete={() => completeChapter(currentChapter.id)} 
          />
        )}
      </div>
    </div>
  );
}
