import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Trophy, Brain, Lightbulb, CheckCircle, XCircle, Pause, Play } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface Puzzle {
  id: number;
  type: "sequence" | "logic" | "pattern" | "riddle";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  hint?: string;
}

const PUZZLES: Puzzle[] = [
  // Sequence puzzles
  {
    id: 1,
    type: "sequence",
    question: "What comes next in the sequence? 2, 4, 8, 16, __",
    options: ["24", "32", "20", "18"],
    correctAnswer: 1,
    explanation: "Each number is doubled. 16 × 2 = 32",
    difficulty: "easy",
    hint: "Try multiplying each number by 2",
  },
  {
    id: 2,
    type: "sequence",
    question: "Complete the pattern: 1, 1, 2, 3, 5, 8, __",
    options: ["10", "11", "13", "15"],
    correctAnswer: 2,
    explanation: "This is the Fibonacci sequence. Each number is the sum of the two before it. 5 + 8 = 13",
    difficulty: "medium",
    hint: "Add the last two numbers together",
  },
  {
    id: 3,
    type: "sequence",
    question: "What's missing? 3, 6, 11, 18, 27, __",
    options: ["36", "38", "40", "35"],
    correctAnswer: 1,
    explanation: "The differences increase by 2 each time: +3, +5, +7, +9, +11. So 27 + 11 = 38",
    difficulty: "hard",
    hint: "Look at the differences between consecutive numbers",
  },
  // Logic puzzles
  {
    id: 4,
    type: "logic",
    question: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
    options: ["Yes", "No", "Maybe", "Not enough information"],
    correctAnswer: 0,
    explanation: "If A → B and B → C, then A → C. All Bloops are Lazzies.",
    difficulty: "easy",
    hint: "Think about it step by step: Bloops → Razzies → Lazzies",
  },
  {
    id: 5,
    type: "logic",
    question: "Tom is taller than Jim. Jim is taller than Sam. Who is the shortest?",
    options: ["Tom", "Jim", "Sam", "Cannot determine"],
    correctAnswer: 2,
    explanation: "Tom > Jim > Sam, so Sam is the shortest.",
    difficulty: "easy",
    hint: "Put them in order from tallest to shortest",
  },
  {
    id: 6,
    type: "logic",
    question: "A farmer has 17 sheep. All but 9 run away. How many sheep does the farmer have left?",
    options: ["8", "9", "17", "0"],
    correctAnswer: 1,
    explanation: "'All but 9' means 9 remain. The farmer has 9 sheep left.",
    difficulty: "medium",
    hint: "Read the question carefully - 'all but 9' is the key phrase",
  },
  // Pattern puzzles
  {
    id: 7,
    type: "pattern",
    question: "If RED = 27, GREEN = 49, then BLUE = ?",
    options: ["36", "40", "32", "44"],
    correctAnswer: 1,
    explanation: "Each letter's position is added: B(2)+L(12)+U(21)+E(5) = 40",
    difficulty: "hard",
    hint: "Think about letter positions in the alphabet",
  },
  {
    id: 8,
    type: "pattern",
    question: "Which shape doesn't belong? Circle, Square, Triangle, Cube",
    options: ["Circle", "Square", "Triangle", "Cube"],
    correctAnswer: 3,
    explanation: "Cube is a 3D shape while the others are 2D shapes.",
    difficulty: "easy",
    hint: "Think about dimensions",
  },
  // Riddles
  {
    id: 9,
    type: "riddle",
    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    options: ["A dream", "A map", "A painting", "A photograph"],
    correctAnswer: 1,
    explanation: "A map shows cities, mountains, and water but none of the actual things.",
    difficulty: "medium",
    hint: "Think about something that represents places",
  },
  {
    id: 10,
    type: "riddle",
    question: "The more you take, the more you leave behind. What am I?",
    options: ["Time", "Footsteps", "Memories", "Breath"],
    correctAnswer: 1,
    explanation: "Footsteps - the more steps you take, the more footprints you leave behind.",
    difficulty: "medium",
    hint: "Think about walking",
  },
  {
    id: 11,
    type: "logic",
    question: "In a race, if you pass the person in 2nd place, what place are you in?",
    options: ["1st place", "2nd place", "3rd place", "4th place"],
    correctAnswer: 1,
    explanation: "If you pass the person in 2nd place, you take their position - 2nd place.",
    difficulty: "medium",
    hint: "You're not passing the person in 1st place",
  },
  {
    id: 12,
    type: "sequence",
    question: "What letter comes next? O, T, T, F, F, S, S, __",
    options: ["E", "N", "T", "O"],
    correctAnswer: 0,
    explanation: "These are the first letters of One, Two, Three, Four, Five, Six, Seven, Eight. E for Eight.",
    difficulty: "hard",
    hint: "Think about counting",
  },
];

export default function LogicPuzzles() {
  const [, setLocation] = useLocation();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (gameStarted) {
      const filtered = difficulty === "all" 
        ? PUZZLES 
        : PUZZLES.filter(p => p.difficulty === difficulty);
      setPuzzles(filtered.sort(() => Math.random() - 0.5).slice(0, 10));
    }
  }, [gameStarted, difficulty]);

  const currentPuzzle = puzzles[currentPuzzleIndex];

  const handleAnswer = (answerIndex: number) => {
    if (showResult || isPaused) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === currentPuzzle.correctAnswer) {
      setScore((prev) => prev + (showHint ? 5 : 10));
      toast.success("Correct!");
    } else {
      toast.error("Not quite right!");
    }
  };

  const nextPuzzle = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      setGameComplete(true);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentPuzzleIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setShowHint(false);
    setGameComplete(false);
    setPuzzles([]);
    setIsPaused(false);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "hard": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sequence": return "🔢";
      case "logic": return "🧠";
      case "pattern": return "🔷";
      case "riddle": return "❓";
      default: return "💡";
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/game-center")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game Center
          </Button>

          <Card className="p-8 text-center">
            <Brain className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">Logic Puzzles</h1>
            <p className="text-muted-foreground mb-6">
              Brain teasers and deduction challenges to sharpen your mind!
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Difficulty
                </label>
                <div className="flex justify-center gap-2 flex-wrap">
                  {(["all", "easy", "medium", "hard"] as const).map((diff) => (
                    <Button
                      key={diff}
                      variant={difficulty === diff ? "default" : "outline"}
                      onClick={() => setDifficulty(diff)}
                      size="sm"
                      className="capitalize"
                    >
                      {diff}
                    </Button>
                  ))}
                </div>
              </div>

              <Button size="lg" onClick={startGame} className="w-full">
                <Brain className="w-4 h-4 mr-2" />
                Start Puzzles
              </Button>
            </div>

            <div className="mt-6 text-left text-sm text-muted-foreground space-y-2">
              <p>🔢 <strong>Sequences</strong> - Find the pattern</p>
              <p>🧠 <strong>Logic</strong> - Use deduction</p>
              <p>🔷 <strong>Patterns</strong> - Spot the odd one out</p>
              <p>❓ <strong>Riddles</strong> - Think creatively</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    const maxScore = puzzles.length * 10;
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Puzzles Complete!</h2>
            <p className="text-4xl font-bold text-primary mb-2">
              {score} / {maxScore}
            </p>
            <p className="text-muted-foreground mb-4">
              {percentage >= 80
                ? "Excellent logical thinking!"
                : percentage >= 60
                ? "Good job! Keep practicing!"
                : "Nice try! Practice makes perfect!"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={resetGame}>Play Again</Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/game-center")}
              >
                Back to Games
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentPuzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading puzzles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/game-center")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Puzzle {currentPuzzleIndex + 1} of {puzzles.length}
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isPaused && (
          <Card className="p-4 mb-4 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500">
            <p className="text-center font-medium">Game Paused</p>
          </Card>
        )}

        {/* Score */}
        <div className="text-center mb-4">
          <span className="text-2xl font-bold text-primary">{score}</span>
          <span className="text-muted-foreground"> points</span>
        </div>

        {/* Puzzle Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">{getTypeIcon(currentPuzzle.type)}</span>
            <span className={`text-sm font-medium capitalize ${getDifficultyColor(currentPuzzle.difficulty)}`}>
              {currentPuzzle.difficulty}
            </span>
          </div>

          <h2 className="text-xl font-semibold mb-6">{currentPuzzle.question}</h2>

          <div className="space-y-3">
            {currentPuzzle.options.map((option, index) => (
              <Button
                key={index}
                variant={
                  showResult
                    ? index === currentPuzzle.correctAnswer
                      ? "default"
                      : selectedAnswer === index
                      ? "destructive"
                      : "outline"
                    : selectedAnswer === index
                    ? "secondary"
                    : "outline"
                }
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleAnswer(index)}
                disabled={showResult || isPaused}
              >
                <span className="mr-3 font-mono">{String.fromCharCode(65 + index)}.</span>
                {option}
                {showResult && index === currentPuzzle.correctAnswer && (
                  <CheckCircle className="w-5 h-5 ml-auto text-green-500" />
                )}
                {showResult && selectedAnswer === index && index !== currentPuzzle.correctAnswer && (
                  <XCircle className="w-5 h-5 ml-auto text-red-500" />
                )}
              </Button>
            ))}
          </div>

          {/* Hint */}
          {!showResult && currentPuzzle.hint && (
            <div className="mt-4">
              {showHint ? (
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-sm">
                  <Lightbulb className="w-4 h-4 inline mr-2 text-yellow-600" />
                  {currentPuzzle.hint}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(true)}
                  className="text-yellow-600"
                  disabled={isPaused}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Show Hint (-5 points)
                </Button>
              )}
            </div>
          )}

          {/* Explanation */}
          {showResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Explanation:</p>
              <p className="text-sm text-muted-foreground">
                {currentPuzzle.explanation}
              </p>
              <Button className="mt-4 w-full" onClick={nextPuzzle}>
                {currentPuzzleIndex < puzzles.length - 1 ? "Next Puzzle" : "See Results"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
