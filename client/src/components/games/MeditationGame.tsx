/**
 * L.A.W.S. Quest - Meditation Mini-Game
 * A breathing and mindfulness exercise for the Water realm
 * 
 * Product of The The The L.A.W.S. Collective, LLC
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wind, Heart, Sparkles, Timer, Volume2, VolumeX } from "lucide-react";

interface MeditationGameProps {
  difficulty: "beginner" | "intermediate" | "advanced";
  onComplete: (score: number, maxScore: number) => void;
  onCancel: () => void;
}

type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

interface BreathingPattern {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  rest: number;
  cycles: number;
}

const BREATHING_PATTERNS: Record<string, BreathingPattern> = {
  beginner: {
    name: "Calming Breath",
    description: "A gentle introduction to mindful breathing",
    inhale: 4,
    hold: 2,
    exhale: 4,
    rest: 2,
    cycles: 3,
  },
  intermediate: {
    name: "Box Breathing",
    description: "Equal parts inhale, hold, exhale, and rest",
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 4,
    cycles: 4,
  },
  advanced: {
    name: "4-7-8 Relaxation",
    description: "Deep relaxation technique for emotional balance",
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 2,
    cycles: 5,
  },
};

const AFFIRMATIONS = [
  "I am grounded in my roots and connected to my ancestors.",
  "Knowledge flows through me like the wind.",
  "I embrace healing and find balance in all things.",
  "My purpose is clear, and my path is sovereign.",
  "I am building a legacy that will last generations.",
  "Peace flows through me like water.",
  "I am worthy of prosperity and abundance.",
  "My emotions are my strength, not my weakness.",
  "I honor the wisdom of those who came before me.",
  "Every breath brings me closer to my true self.",
];

export default function MeditationGame({ difficulty, onComplete, onCancel }: MeditationGameProps) {
  const pattern = BREATHING_PATTERNS[difficulty];
  
  const [gameState, setGameState] = useState<"intro" | "breathing" | "affirmation" | "complete">("intro");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("inhale");
  const [phaseTimer, setPhaseTimer] = useState(pattern.inhale);
  const [totalProgress, setTotalProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [currentAffirmation, setCurrentAffirmation] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [circleScale, setCircleScale] = useState(1);

  // Calculate total duration
  const cycleDuration = pattern.inhale + pattern.hold + pattern.exhale + pattern.rest;
  const totalDuration = cycleDuration * pattern.cycles;

  // Get phase duration
  const getPhaseDuration = (phase: BreathPhase): number => {
    switch (phase) {
      case "inhale": return pattern.inhale;
      case "hold": return pattern.hold;
      case "exhale": return pattern.exhale;
      case "rest": return pattern.rest;
    }
  };

  // Get next phase
  const getNextPhase = (current: BreathPhase): BreathPhase => {
    switch (current) {
      case "inhale": return "hold";
      case "hold": return "exhale";
      case "exhale": return "rest";
      case "rest": return "inhale";
    }
  };

  // Get phase instruction
  const getPhaseInstruction = (phase: BreathPhase): string => {
    switch (phase) {
      case "inhale": return "Breathe In...";
      case "hold": return "Hold...";
      case "exhale": return "Breathe Out...";
      case "rest": return "Rest...";
    }
  };

  // Get phase color
  const getPhaseColor = (phase: BreathPhase): string => {
    switch (phase) {
      case "inhale": return "text-sky-500";
      case "hold": return "text-amber-500";
      case "exhale": return "text-blue-600";
      case "rest": return "text-emerald-500";
    }
  };

  // Update circle animation based on phase
  useEffect(() => {
    if (gameState !== "breathing") return;

    const phaseDuration = getPhaseDuration(breathPhase);
    const progress = (phaseDuration - phaseTimer) / phaseDuration;

    switch (breathPhase) {
      case "inhale":
        setCircleScale(1 + progress * 0.5); // Grow from 1 to 1.5
        break;
      case "hold":
        setCircleScale(1.5); // Stay at max
        break;
      case "exhale":
        setCircleScale(1.5 - progress * 0.5); // Shrink from 1.5 to 1
        break;
      case "rest":
        setCircleScale(1); // Stay at min
        break;
    }
  }, [breathPhase, phaseTimer, gameState]);

  // Main breathing timer
  useEffect(() => {
    if (gameState !== "breathing") return;

    const timer = setInterval(() => {
      setPhaseTimer(prev => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhase = getNextPhase(breathPhase);
          
          if (nextPhase === "inhale") {
            // Completed a cycle
            if (currentCycle + 1 >= pattern.cycles) {
              // All cycles complete
              setGameState("affirmation");
              setCurrentAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
              return 0;
            }
            setCurrentCycle(c => c + 1);
          }
          
          setBreathPhase(nextPhase);
          setScore(s => s + 10); // Points for completing each phase
          return getPhaseDuration(nextPhase);
        }
        return prev - 1;
      });

      // Update total progress
      setTotalProgress(prev => Math.min(100, prev + (100 / totalDuration)));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, breathPhase, currentCycle, pattern]);

  // Start breathing exercise
  const startBreathing = () => {
    setGameState("breathing");
    setCurrentCycle(0);
    setBreathPhase("inhale");
    setPhaseTimer(pattern.inhale);
    setTotalProgress(0);
    setScore(0);
    setCircleScale(1);
  };

  // Complete affirmation
  const completeAffirmation = () => {
    setScore(s => s + 50); // Bonus for completing affirmation
    setGameState("complete");
  };

  // Finish game
  const finishGame = () => {
    const maxScore = (pattern.cycles * 4 * 10) + 50; // 4 phases per cycle + affirmation bonus
    onComplete(score, maxScore);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-500" />
            {pattern.name}
          </h3>
          <p className="text-sm text-muted-foreground">{pattern.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Badge variant="outline">
            <Timer className="w-3 h-3 mr-1" />
            {pattern.cycles} cycles
          </Badge>
        </div>
      </div>

      {/* Intro State */}
      {gameState === "intro" && (
        <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
              <Wind className="w-12 h-12 text-blue-500" />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Prepare for Meditation</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Find a comfortable position. Close your eyes if you wish.
                Follow the breathing circle and let your mind settle.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-sky-100 rounded">
                <p className="font-bold text-sky-700">{pattern.inhale}s</p>
                <p className="text-sky-600">Inhale</p>
              </div>
              <div className="p-2 bg-amber-100 rounded">
                <p className="font-bold text-amber-700">{pattern.hold}s</p>
                <p className="text-amber-600">Hold</p>
              </div>
              <div className="p-2 bg-blue-100 rounded">
                <p className="font-bold text-blue-700">{pattern.exhale}s</p>
                <p className="text-blue-600">Exhale</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded">
                <p className="font-bold text-emerald-700">{pattern.rest}s</p>
                <p className="text-emerald-600">Rest</p>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={startBreathing} className="bg-blue-600 hover:bg-blue-700">
                Begin Meditation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breathing State */}
      {gameState === "breathing" && (
        <div className="text-center space-y-6">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Cycle {currentCycle + 1} of {pattern.cycles}</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>

          {/* Breathing Circle */}
          <div className="relative w-48 h-48 mx-auto">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
            
            {/* Animated circle */}
            <div 
              className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 transition-transform duration-1000 ease-in-out flex items-center justify-center"
              style={{ transform: `scale(${circleScale})` }}
            >
              <div className="text-white text-center">
                <p className="text-3xl font-bold">{phaseTimer}</p>
                <p className="text-sm opacity-80">{getPhaseInstruction(breathPhase)}</p>
              </div>
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="flex justify-center gap-4">
            {(["inhale", "hold", "exhale", "rest"] as BreathPhase[]).map((phase) => (
              <div
                key={phase}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  breathPhase === phase
                    ? `${getPhaseColor(phase)} bg-blue-100 font-bold`
                    : "text-muted-foreground"
                }`}
              >
                {phase.charAt(0).toUpperCase() + phase.slice(1)}
              </div>
            ))}
          </div>

          {/* Score */}
          <div className="text-sm text-muted-foreground">
            Points: {score}
          </div>
        </div>
      )}

      {/* Affirmation State */}
      {gameState === "affirmation" && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-purple-800">Affirmation</h4>
              <p className="text-sm text-muted-foreground">
                Read this affirmation slowly. Let it resonate within you.
              </p>
            </div>
            <blockquote className="text-lg italic text-purple-700 p-4 bg-white/50 rounded-lg">
              "{currentAffirmation}"
            </blockquote>
            <Button onClick={completeAffirmation} className="bg-purple-600 hover:bg-purple-700">
              I Accept This Truth
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Complete State */}
      {gameState === "complete" && (
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl">🧘</div>
            <div>
              <h4 className="font-semibold text-lg text-emerald-800">Meditation Complete</h4>
              <p className="text-sm text-muted-foreground">
                You have achieved inner peace and balance.
              </p>
            </div>
            <div className="p-4 bg-white/50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-700">{score} Points</p>
              <p className="text-sm text-emerald-600">
                {pattern.cycles} breathing cycles completed
              </p>
            </div>
            <Button onClick={finishGame} className="bg-emerald-600 hover:bg-emerald-700">
              Claim Rewards
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
