import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronRight, 
  ChevronLeft,
  X,
  Map,
  Wind,
  Droplets,
  Heart,
  Shield,
  Building,
  TrendingUp,
  Crown,
  Users,
  Gamepad2,
  Trophy,
  Sparkles,
  CheckCircle,
} from "lucide-react";

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  icon: React.ReactNode;
  highlight?: string;
  tips?: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to L.A.W.S. Quest",
    content: "L.A.W.S. stands for Land, Air, Water, Self - the four pillars of building generational wealth and sovereignty. This game will teach you how to build a protective financial structure for yourself and future generations.",
    icon: <Sparkles className="w-12 h-12 text-yellow-500" />,
    tips: [
      "This is an educational game - no real money or assets involved",
      "Complete the game to unlock real system tools",
      "Your choices affect your journey but all paths lead to learning",
    ],
  },
  {
    id: 2,
    title: "The Four Pillars: L.A.W.S.",
    content: "Each pillar represents a crucial aspect of building true wealth and independence. Understanding these pillars is the foundation of your journey.",
    icon: <Shield className="w-12 h-12 text-blue-500" />,
    highlight: "pillars",
    tips: [
      "LAND (Map) - Reconnection to roots, property, and stability",
      "AIR (Wind) - Education, knowledge, and communication",
      "WATER (Droplets) - Healing, balance, and emotional resilience",
      "SELF (Heart) - Purpose, skills, and financial literacy",
    ],
  },
  {
    id: 3,
    title: "Chapter 1: The Awakening",
    content: "Your journey begins with a crucial question: 'Do you have a trust?' Your answer determines which path you experience first - the Birth-Ward path (no protection) or the Birth-Trust path (protected from birth).",
    icon: <Map className="w-12 h-12 text-green-500" />,
    tips: [
      "Both paths teach valuable lessons",
      "You can replay to experience the other path",
      "Watch the parallel journey to see the contrast",
    ],
  },
  {
    id: 4,
    title: "Chapter 2: Foundation Building",
    content: "Learn how to create the legal structures that protect wealth: trusts, LLCs, and foundations. This chapter teaches entity formation and why structure matters.",
    icon: <Building className="w-12 h-12 text-purple-500" />,
    tips: [
      "Trusts provide asset protection",
      "LLCs separate business from personal liability",
      "The right structure depends on your goals",
    ],
  },
  {
    id: 5,
    title: "Chapter 3: The Protection Layer",
    content: "Discover how to protect what you build. Learn about operating agreements, insurance, and backup systems that shield your assets from life's unexpected events.",
    icon: <Shield className="w-12 h-12 text-red-500" />,
    tips: [
      "Protection isn't paranoia - it's preparation",
      "Multiple layers provide redundancy",
      "Legal structures work together as a system",
    ],
  },
  {
    id: 6,
    title: "Chapter 4: Income Streams",
    content: "Transform from employee to owner. Learn the W-2 → Contractor → Business Owner progression and how to build multiple income streams that don't depend on trading time for money.",
    icon: <TrendingUp className="w-12 h-12 text-emerald-500" />,
    tips: [
      "W-2 income has the highest tax burden",
      "Business ownership provides tax advantages",
      "Passive income is the key to time freedom",
    ],
  },
  {
    id: 7,
    title: "Chapter 5: Generational Transfer",
    content: "The ultimate goal: building wealth that lasts beyond your lifetime. Learn estate planning, trust succession, and how to teach the next generation to maintain and grow what you've built.",
    icon: <Crown className="w-12 h-12 text-yellow-500" />,
    tips: [
      "Wealth without wisdom doesn't transfer",
      "Structure enables smooth succession",
      "The 100-year vision guides decisions today",
    ],
  },
  {
    id: 8,
    title: "Community Builder (Multiplayer)",
    content: "After completing L.A.W.S. Quest, unlock Community Builder - a multiplayer game where you collaborate with others to build a thriving community using L.A.W.S. principles.",
    icon: <Users className="w-12 h-12 text-blue-500" />,
    tips: [
      "Work together to make community decisions",
      "Vote on quarterly priorities",
      "Bid on service contracts",
      "Build all four L.A.W.S. pillars together",
    ],
  },
  {
    id: 9,
    title: "Achievements & Leaderboard",
    content: "Earn achievements as you progress through the game. Complete chapters, make optimal choices, and compete on the leaderboard to show your mastery of L.A.W.S. principles.",
    icon: <Trophy className="w-12 h-12 text-amber-500" />,
    tips: [
      "Achievements unlock as you complete milestones",
      "Earn points for each achievement",
      "Compete on global and weekly leaderboards",
      "Special achievements for completing both paths",
    ],
  },
  {
    id: 10,
    title: "From Game to Reality",
    content: "When you complete L.A.W.S. Quest, you'll have the option to use the real system tools to actually implement what you've learned. The game teaches the concepts; the system executes them.",
    icon: <Gamepad2 className="w-12 h-12 text-violet-500" />,
    tips: [
      "Game completion unlocks Business Formation tools",
      "Your game choices can pre-fill real forms",
      "Real documents require real legal review",
      "The game is education; the system is execution",
    ],
  },
];

export function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  // Pillar icons for the pillars step
  const PillarIcons = () => (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
        <Map className="w-8 h-8 text-green-500" />
        <div>
          <p className="font-bold text-green-500">LAND</p>
          <p className="text-xs text-muted-foreground">Reconnection & Stability</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
        <Wind className="w-8 h-8 text-blue-500" />
        <div>
          <p className="font-bold text-blue-500">AIR</p>
          <p className="text-xs text-muted-foreground">Education & Knowledge</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-cyan-500/10 rounded-lg">
        <Droplets className="w-8 h-8 text-cyan-500" />
        <div>
          <p className="font-bold text-cyan-500">WATER</p>
          <p className="text-xs text-muted-foreground">Healing & Balance</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
        <Heart className="w-8 h-8 text-red-500" />
        <div>
          <p className="font-bold text-red-500">SELF</p>
          <p className="text-xs text-muted-foreground">Purpose & Skills</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleSkip}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {TUTORIAL_STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step Content */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {step.icon}
            </div>
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <p className="text-muted-foreground">{step.content}</p>
          </div>

          {/* Special content for pillars step */}
          {step.highlight === "pillars" && <PillarIcons />}

          {/* Tips */}
          {step.tips && step.tips.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Key Points
              </p>
              <ul className="space-y-2">
                {step.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-1">
              {TUTORIAL_STEPS.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-primary"
                      : completedSteps.has(index)
                      ? "bg-primary/50"
                      : "bg-muted"
                  }`}
                  onClick={() => setCurrentStep(index)}
                />
              ))}
            </div>

            <Button onClick={handleNext}>
              {currentStep === TUTORIAL_STEPS.length - 1 ? (
                <>
                  Start Playing
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip option */}
          <div className="text-center">
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleSkip}
            >
              Skip tutorial (I've played before)
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OnboardingTutorial;
