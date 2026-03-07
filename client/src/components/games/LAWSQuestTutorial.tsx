/**
 * L.A.W.S. Quest - Tutorial & Onboarding
 * Guides new players through the four realms and game mechanics
 * 
 * Product of The L.A.W.S. Collective, LLC
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Mountain, 
  Wind, 
  Droplets, 
  Heart,
  Compass,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Scroll,
  Coins,
  Zap,
  Users,
  Home,
  BookOpen,
  Target
} from "lucide-react";

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  bgGradient: string;
  highlight?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to L.A.W.S. Quest",
    content: "Embark on a journey of self-discovery, healing, and generational wealth building. This game will guide you through the four pillars of the L.A.W.S. framework: Land, Air, Water, and Self.",
    icon: <Crown className="w-12 h-12 text-amber-500" />,
    bgGradient: "from-amber-50 to-yellow-50",
    highlight: "Your journey to sovereignty begins here.",
  },
  {
    id: "land",
    title: "LAND - Reconnection & Stability",
    content: "The Land realm focuses on your roots, ancestry, and connection to place. Here you'll explore your family history, learn about property ownership, and build a foundation of stability for future generations.",
    icon: <Mountain className="w-12 h-12 text-amber-600" />,
    bgGradient: "from-amber-50 to-orange-50",
    highlight: "Understanding where you come from is the first step to knowing where you're going.",
  },
  {
    id: "air",
    title: "AIR - Education & Knowledge",
    content: "The Air realm represents learning, communication, and wisdom. Complete educational quests, share knowledge with others, and expand your understanding of the world around you.",
    icon: <Wind className="w-12 h-12 text-sky-500" />,
    bgGradient: "from-sky-50 to-blue-50",
    highlight: "Knowledge is the wind that carries you forward.",
  },
  {
    id: "water",
    title: "WATER - Healing & Balance",
    content: "The Water realm is about emotional intelligence, healing, and finding balance. Practice meditation, reflect on your experiences, and develop the resilience needed for life's challenges.",
    icon: <Droplets className="w-12 h-12 text-blue-500" />,
    bgGradient: "from-blue-50 to-cyan-50",
    highlight: "Like water, learn to flow around obstacles and find your level.",
  },
  {
    id: "self",
    title: "SELF - Purpose & Skills",
    content: "The Self realm focuses on financial literacy, purpose discovery, and skill building. Master budgeting, learn about investments, and build the practical skills needed for generational wealth.",
    icon: <Heart className="w-12 h-12 text-rose-500" />,
    bgGradient: "from-rose-50 to-pink-50",
    highlight: "Your purpose is the compass that guides your journey.",
  },
  {
    id: "quests",
    title: "Completing Quests",
    content: "Each realm contains quests that test your knowledge and skills. Complete mini-games like trivia, math challenges, memory games, and reflection exercises to earn rewards and level up your attributes.",
    icon: <Scroll className="w-12 h-12 text-purple-500" />,
    bgGradient: "from-purple-50 to-violet-50",
    highlight: "Every quest completed brings you closer to sovereignty.",
  },
  {
    id: "energy",
    title: "Energy System",
    content: "Quests require energy to attempt. Your energy regenerates over time (1 point per minute). Manage your energy wisely - harder quests require more energy but offer greater rewards.",
    icon: <Zap className="w-12 h-12 text-yellow-500" />,
    bgGradient: "from-yellow-50 to-amber-50",
    highlight: "Rest and recovery are part of the journey.",
  },
  {
    id: "tokens",
    title: "Earning Tokens",
    content: "Complete quests to earn L.A.W.S. Tokens. These tokens can be used in the shop, contributed to your House, or (for Academy members and employees) converted to real LuvLedger points.",
    icon: <Coins className="w-12 h-12 text-amber-500" />,
    bgGradient: "from-amber-50 to-yellow-50",
    highlight: "Build wealth through consistent effort and learning.",
  },
  {
    id: "npcs",
    title: "Meet Your Guides",
    content: "Each realm has wise NPCs who will guide your journey. Elder Root in Land, Sage Breeze in Air, Healer Tide in Water, and Mentor Flame in Self. Speak with them to gain wisdom and unlock new quests.",
    icon: <Users className="w-12 h-12 text-emerald-500" />,
    bgGradient: "from-emerald-50 to-green-50",
    highlight: "Wisdom comes from those who walked the path before you.",
  },
  {
    id: "house",
    title: "Building Your House",
    content: "As you progress, you'll unlock the House system - your family legacy within the game. Build traditions, acquire land, and create a lasting legacy that spans generations.",
    icon: <Home className="w-12 h-12 text-indigo-500" />,
    bgGradient: "from-indigo-50 to-purple-50",
    highlight: "A House is not built in a day, but brick by brick.",
  },
  {
    id: "ready",
    title: "You're Ready!",
    content: "You now understand the basics of L.A.W.S. Quest. Start in the Hub, explore each realm, complete quests, and build your sovereign legacy. Remember: this is a journey, not a race.",
    icon: <Target className="w-12 h-12 text-green-500" />,
    bgGradient: "from-green-50 to-emerald-50",
    highlight: "Your sovereign journey begins now!",
  },
];

export default function LAWSQuestTutorial({ onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  const goNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Step {currentStep + 1} of {TUTORIAL_STEPS.length}</span>
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip Tutorial
        </Button>
      </div>
      <Progress value={progress} className="h-2" />

      {/* Tutorial Card */}
      <Card className={`bg-gradient-to-br ${step.bgGradient} border-2`}>
        <CardContent className="pt-6 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-white/50 flex items-center justify-center shadow-lg">
              {step.icon}
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold">{step.title}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {step.content}
            </p>
            {step.highlight && (
              <blockquote className="text-sm italic text-primary font-medium p-3 bg-white/50 rounded-lg">
                "{step.highlight}"
              </blockquote>
            )}
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-1">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep 
                    ? "w-6 bg-primary" 
                    : idx < currentStep 
                      ? "bg-primary/50" 
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button onClick={goNext} className="gap-1">
              {currentStep === TUTORIAL_STEPS.length - 1 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Begin Journey
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      {currentStep >= 5 && (
        <Card className="bg-secondary/30">
          <CardContent className="pt-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Quick Reference
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Mountain className="w-3 h-3 text-amber-600" />
                <span>Land = Roots</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-sky-500" />
                <span>Air = Knowledge</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-500" />
                <span>Water = Healing</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500" />
                <span>Self = Purpose</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
