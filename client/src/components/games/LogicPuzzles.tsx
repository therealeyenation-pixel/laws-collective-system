import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Lightbulb,
  Trophy,
  Clock,
  Star,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Puzzle {
  id: number;
  type: "pattern" | "deduction" | "sequence" | "grid";
  difficulty: "easy" | "medium" | "hard";
  title: string;
  description: string;
  question: string;
  options: string[];
  correctAnswer: number;
  hint: string;
  explanation: string;
  xpReward: number;
  tokenReward: number;
}

const puzzles: Puzzle[] = [
  {
    id: 1,
    type: "pattern",
    difficulty: "easy",
    title: "Number Pattern",
    description: "Find the next number in the sequence",
    question: "What comes next? 2, 4, 8, 16, ?",
    options: ["24", "32", "20", "18"],
    correctAnswer: 1,
    hint: "Each number is doubled",
    explanation: "Each number is multiplied by 2. 16 × 2 = 32",
    xpReward: 10,
    tokenReward: 5,
  },
  {
    id: 2,
    type: "deduction",
    difficulty: "easy",
    title: "Family Logic",
    description: "Use deductive reasoning to solve",
    question: "If all Smiths are tall, and John is a Smith, what can we conclude?",
    options: ["John is short", "John is tall", "John is average", "Cannot determine"],
    correctAnswer: 1,
    hint: "Apply the given rule to John",
    explanation: "Since all Smiths are tall and John is a Smith, John must be tall.",
    xpReward: 10,
    tokenReward: 5,
  },
  {
    id: 3,
    type: "sequence",
    difficulty: "medium",
    title: "Letter Sequence",
    description: "Find the pattern in letters",
    question: "What comes next? A, C, F, J, ?",
    options: ["K", "L", "O", "M"],
    correctAnswer: 2,
    hint: "Count the gaps between letters",
    explanation: "Gaps increase by 1: A+2=C, C+3=F, F+4=J, J+5=O",
    xpReward: 20,
    tokenReward: 10,
  },
  {
    id: 4,
    type: "deduction",
    difficulty: "medium",
    title: "Who Owns the Fish?",
    description: "Classic logic puzzle",
    question: "The red house is to the left of the blue house. The green house is to the right of the blue house. Which house is in the middle?",
    options: ["Red house", "Blue house", "Green house", "Cannot determine"],
    correctAnswer: 1,
    hint: "Draw the houses in order",
    explanation: "Red → Blue → Green. The blue house is in the middle.",
    xpReward: 20,
    tokenReward: 10,
  },
  {
    id: 5,
    type: "pattern",
    difficulty: "hard",
    title: "Shape Pattern",
    description: "Identify the pattern rule",
    question: "In a sequence: 1 triangle, 3 squares, 9 pentagons, 27 hexagons. How many heptagons come next?",
    options: ["36", "54", "81", "108"],
    correctAnswer: 2,
    hint: "Look at the multiplier",
    explanation: "Each count is multiplied by 3: 1×3=3, 3×3=9, 9×3=27, 27×3=81",
    xpReward: 30,
    tokenReward: 15,
  },
  {
    id: 6,
    type: "grid",
    difficulty: "hard",
    title: "Grid Logic",
    description: "Solve the grid puzzle",
    question: "In a 3×3 grid, each row and column must contain 1, 2, and 3. If position (1,1)=1, (1,3)=2, (2,2)=1, (3,1)=2, what is position (2,1)?",
    options: ["1", "2", "3", "Cannot determine"],
    correctAnswer: 2,
    hint: "Column 1 already has 1 and 2",
    explanation: "Column 1 has 1 and 2, so (2,1) must be 3",
    xpReward: 30,
    tokenReward: 15,
  },
  {
    id: 7,
    type: "deduction",
    difficulty: "easy",
    title: "Truth Teller",
    description: "Who is telling the truth?",
    question: "Alex says 'I always lie.' Is this statement possible?",
    options: ["Yes, Alex is lying", "Yes, Alex is truthful", "No, it's a paradox", "Need more info"],
    correctAnswer: 2,
    hint: "Consider both possibilities",
    explanation: "If Alex lies, the statement is true. If Alex tells truth, the statement is false. It's a paradox!",
    xpReward: 10,
    tokenReward: 5,
  },
  {
    id: 8,
    type: "sequence",
    difficulty: "medium",
    title: "Fibonacci Variant",
    description: "Find the pattern",
    question: "What comes next? 1, 1, 2, 3, 5, 8, 13, ?",
    options: ["18", "20", "21", "26"],
    correctAnswer: 2,
    hint: "Add the previous two numbers",
    explanation: "Fibonacci sequence: each number is the sum of the two before it. 8 + 13 = 21",
    xpReward: 20,
    tokenReward: 10,
  },
];

export default function LogicPuzzles() {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [completedPuzzles, setCompletedPuzzles] = useState<number[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const currentPuzzle = puzzles[currentPuzzleIndex];

  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeout();
    }
  }, [timeLeft, isTimerActive, showResult]);

  const handleTimeout = () => {
    setShowResult(true);
    setStreak(0);
    toast.error("Time's up! The correct answer was: " + currentPuzzle.options[currentPuzzle.correctAnswer]);
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    setIsTimerActive(false);
    
    if (selectedAnswer === currentPuzzle.correctAnswer) {
      const bonusMultiplier = showHint ? 0.5 : 1;
      const timeBonus = Math.floor(timeLeft / 10);
      const streakBonus = streak >= 3 ? 1.5 : 1;
      
      const xpEarned = Math.floor(currentPuzzle.xpReward * bonusMultiplier * streakBonus) + timeBonus;
      const tokensEarned = Math.floor(currentPuzzle.tokenReward * bonusMultiplier);
      
      setScore(score + 1);
      setTotalXP(totalXP + xpEarned);
      setTotalTokens(totalTokens + tokensEarned);
      setStreak(streak + 1);
      setCompletedPuzzles([...completedPuzzles, currentPuzzle.id]);
      
      toast.success(`Correct! +${xpEarned} XP, +${tokensEarned} tokens${streak >= 2 ? ` (${streak + 1}x streak!)` : ""}`);
    } else {
      setStreak(0);
      toast.error("Incorrect. " + currentPuzzle.explanation);
    }
  };

  const handleNextPuzzle = () => {
    const nextIndex = (currentPuzzleIndex + 1) % puzzles.length;
    setCurrentPuzzleIndex(nextIndex);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setTimeLeft(60);
    setIsTimerActive(true);
  };

  const handleReset = () => {
    setCurrentPuzzleIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setScore(0);
    setTotalXP(0);
    setTotalTokens(0);
    setStreak(0);
    setTimeLeft(60);
    setIsTimerActive(true);
    setCompletedPuzzles([]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700";
      case "medium": return "bg-amber-100 text-amber-700";
      case "hard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pattern": return "🔢";
      case "deduction": return "🔍";
      case "sequence": return "📊";
      case "grid": return "⬛";
      default: return "🧩";
    }
  };

  const filteredPuzzles = difficultyFilter === "all" 
    ? puzzles 
    : puzzles.filter(p => p.difficulty === difficultyFilter);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{score}/{puzzles.length}</p>
            <p className="text-xs text-muted-foreground">Solved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold">{totalXP}</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{totalTokens}</p>
            <p className="text-xs text-muted-foreground">Tokens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{streak}x</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{timeLeft}s</p>
            <p className="text-xs text-muted-foreground">Time Left</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{completedPuzzles.length} of {puzzles.length} puzzles completed</span>
        </div>
        <Progress value={(completedPuzzles.length / puzzles.length) * 100} />
      </div>

      {/* Current Puzzle */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getTypeIcon(currentPuzzle.type)}</span>
              <div>
                <CardTitle>{currentPuzzle.title}</CardTitle>
                <CardDescription>{currentPuzzle.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(currentPuzzle.difficulty)}>
                {currentPuzzle.difficulty}
              </Badge>
              <Badge variant="outline">
                +{currentPuzzle.xpReward} XP
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-lg font-medium">{currentPuzzle.question}</p>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">{currentPuzzle.hint}</p>
            </div>
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentPuzzle.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className={`h-auto py-4 px-6 text-left justify-start ${
                  showResult
                    ? index === currentPuzzle.correctAnswer
                      ? "bg-green-100 border-green-500 text-green-700"
                      : selectedAnswer === index
                      ? "bg-red-100 border-red-500 text-red-700"
                      : ""
                    : ""
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
              >
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showResult && index === currentPuzzle.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {showResult && selectedAnswer === index && index !== currentPuzzle.correctAnswer && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </Button>
            ))}
          </div>

          {/* Explanation (shown after answer) */}
          {showResult && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-700 mb-1">Explanation:</p>
              <p className="text-sm text-blue-600">{currentPuzzle.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!showResult ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowHint(true)}
                  disabled={showHint}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {showHint ? "Hint Used (-50% rewards)" : "Get Hint"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className="flex-1 md:flex-none"
                >
                  Submit Answer
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleNextPuzzle}>
                  Next Puzzle
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Puzzle List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Puzzles</CardTitle>
            <div className="flex gap-2">
              {["all", "easy", "medium", "hard"].map((diff) => (
                <Button
                  key={diff}
                  variant={difficultyFilter === diff ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDifficultyFilter(diff)}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredPuzzles.map((puzzle, index) => (
              <Card
                key={puzzle.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  completedPuzzles.includes(puzzle.id) ? "bg-green-50 border-green-200" : ""
                } ${currentPuzzleIndex === puzzles.indexOf(puzzle) ? "ring-2 ring-primary" : ""}`}
                onClick={() => {
                  setCurrentPuzzleIndex(puzzles.indexOf(puzzle));
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setShowHint(false);
                  setTimeLeft(60);
                  setIsTimerActive(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{getTypeIcon(puzzle.type)}</span>
                    {completedPuzzles.includes(puzzle.id) && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="font-medium text-sm">{puzzle.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getDifficultyColor(puzzle.difficulty)} text-xs`}>
                      {puzzle.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground">+{puzzle.xpReward} XP</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
