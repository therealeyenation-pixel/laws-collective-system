import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Lock, Unlock, Key, Clock, Eye, Search, Lightbulb, 
  Trophy, Star, Home, RotateCcw, ArrowRight, CheckCircle,
  XCircle, AlertTriangle, DoorOpen, Puzzle, BookOpen, FileText
} from "lucide-react";
import { Link } from "wouter";

interface Puzzle {
  id: string;
  type: "code" | "riddle" | "sequence" | "cipher" | "document";
  title: string;
  description: string;
  hint: string;
  solution: string;
  solved: boolean;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  unlocks?: string[];
  requires?: string[];
}

interface Room {
  id: string;
  name: string;
  description: string;
  theme: string;
  puzzles: Puzzle[];
  timeLimit: number; // in seconds
  unlocked: boolean;
}

// Sample rooms with financial/business themed puzzles
const ROOMS: Room[] = [
  {
    id: "compliance-vault",
    name: "The Compliance Vault",
    description: "You're locked in the compliance department after hours. Find the codes to escape before the security system resets!",
    theme: "compliance",
    timeLimit: 600, // 10 minutes
    unlocked: true,
    puzzles: [
      {
        id: "safe-code",
        type: "code",
        title: "The Safe",
        description: "A wall safe with a 4-digit code. A sticky note reads: 'IRS Form for nonprofits'",
        hint: "What form number do tax-exempt organizations file annually?",
        solution: "990",
        solved: false,
        points: 100,
        difficulty: "easy",
        unlocks: ["filing-cabinet"],
      },
      {
        id: "filing-cabinet",
        type: "riddle",
        title: "Filing Cabinet",
        description: "The cabinet is locked. A riddle is taped to it: 'I am the duty that binds board members to act in the organization's best interest. What am I?'",
        hint: "Think about legal obligations of nonprofit board members",
        solution: "fiduciary",
        solved: false,
        points: 150,
        difficulty: "medium",
        requires: ["safe-code"],
        unlocks: ["computer"],
      },
      {
        id: "computer",
        type: "cipher",
        title: "Locked Computer",
        description: "The computer shows a cipher: JUDQW = ? (Each letter shifted back 3 positions)",
        hint: "This is a Caesar cipher. Shift each letter back 3 places in the alphabet.",
        solution: "grant",
        solved: false,
        points: 200,
        difficulty: "medium",
        requires: ["filing-cabinet"],
        unlocks: ["exit-door"],
      },
      {
        id: "exit-door",
        type: "sequence",
        title: "Exit Door",
        description: "The door keypad shows: 501(c)(?). Complete the sequence for charitable organizations.",
        hint: "What subsection designates charitable, religious, and educational organizations?",
        solution: "3",
        solved: false,
        points: 100,
        difficulty: "easy",
        requires: ["computer"],
      },
    ],
  },
  {
    id: "grant-office",
    name: "The Grant Writer's Office",
    description: "A grant deadline is in 10 minutes! Find the missing proposal components to submit on time.",
    theme: "grants",
    timeLimit: 600,
    unlocked: true,
    puzzles: [
      {
        id: "desk-drawer",
        type: "code",
        title: "Locked Desk Drawer",
        description: "The drawer has a combination lock. A calendar shows 'NEA deadline' circled with the year the NEA was founded.",
        hint: "The National Endowment for the Arts was established in 1965",
        solution: "1965",
        solved: false,
        points: 100,
        difficulty: "easy",
        unlocks: ["bookshelf"],
      },
      {
        id: "bookshelf",
        type: "document",
        title: "Hidden Bookshelf",
        description: "A book titled 'Grant Writing 101' has a highlighted section: 'The _____ statement explains why funding is needed.'",
        hint: "This section describes the problem your organization addresses",
        solution: "need",
        solved: false,
        points: 150,
        difficulty: "medium",
        requires: ["desk-drawer"],
        unlocks: ["whiteboard"],
      },
      {
        id: "whiteboard",
        type: "riddle",
        title: "Whiteboard Puzzle",
        description: "The whiteboard shows: 'I measure success but I'm not a ruler. I track outcomes but I'm not a detective. I prove impact but I'm not a scientist.'",
        hint: "Grant funders want to see measurable results",
        solution: "metrics",
        solved: false,
        points: 200,
        difficulty: "hard",
        requires: ["bookshelf"],
        unlocks: ["printer"],
      },
      {
        id: "printer",
        type: "cipher",
        title: "Jammed Printer",
        description: "The printer displays an error code. Decode: EXGJHW (shift back 3) to fix it.",
        hint: "Caesar cipher - shift each letter back 3 positions",
        solution: "budget",
        solved: false,
        points: 150,
        difficulty: "medium",
        requires: ["whiteboard"],
      },
    ],
  },
];

type GameState = "menu" | "playing" | "complete" | "failed";

export default function AdvancedEscapeRoom() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState<Record<string, number>>({});

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState("failed");
          toast.error("Time's up! You didn't escape in time.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startRoom = (room: Room) => {
    setSelectedRoom(room);
    setPuzzles(room.puzzles.map(p => ({ ...p, solved: false })));
    setTimeLeft(room.timeLimit);
    setScore(0);
    setHintsUsed(0);
    setAttempts({});
    setGameState("playing");
    
    // Set first available puzzle
    const firstPuzzle = room.puzzles.find(p => !p.requires || p.requires.length === 0);
    if (firstPuzzle) {
      setCurrentPuzzle({ ...firstPuzzle, solved: false });
    }
  };

  const isPuzzleAvailable = (puzzle: Puzzle) => {
    if (!puzzle.requires || puzzle.requires.length === 0) return true;
    return puzzle.requires.every(reqId => 
      puzzles.find(p => p.id === reqId)?.solved
    );
  };

  const handleSubmitAnswer = () => {
    if (!currentPuzzle) return;

    const normalizedAnswer = answer.toLowerCase().trim();
    const normalizedSolution = currentPuzzle.solution.toLowerCase().trim();

    if (normalizedAnswer === normalizedSolution) {
      // Correct answer
      const timeBonus = Math.floor(timeLeft / 10);
      const hintPenalty = showHint ? Math.floor(currentPuzzle.points * 0.3) : 0;
      const attemptPenalty = (attempts[currentPuzzle.id] || 0) * 10;
      const earnedPoints = Math.max(
        currentPuzzle.points - hintPenalty - attemptPenalty + timeBonus,
        10
      );

      setScore(prev => prev + earnedPoints);
      toast.success(`Correct! +${earnedPoints} points`);

      // Mark puzzle as solved
      const updatedPuzzles = puzzles.map(p => 
        p.id === currentPuzzle.id ? { ...p, solved: true } : p
      );
      setPuzzles(updatedPuzzles);

      // Check if all puzzles are solved
      const allSolved = updatedPuzzles.every(p => p.solved);
      if (allSolved) {
        setGameState("complete");
        toast.success("Congratulations! You escaped!");
      } else {
        // Find next available puzzle
        const nextPuzzle = updatedPuzzles.find(p => 
          !p.solved && isPuzzleAvailable(p)
        );
        setCurrentPuzzle(nextPuzzle || null);
      }

      setAnswer("");
      setShowHint(false);
    } else {
      // Wrong answer
      setAttempts(prev => ({
        ...prev,
        [currentPuzzle.id]: (prev[currentPuzzle.id] || 0) + 1
      }));
      toast.error("Incorrect. Try again!");
    }
  };

  const handleUseHint = () => {
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
    toast.info("Hint revealed! (30% point penalty for this puzzle)");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getPuzzleIcon = (type: string) => {
    switch (type) {
      case "code": return Lock;
      case "riddle": return Puzzle;
      case "sequence": return Key;
      case "cipher": return Eye;
      case "document": return FileText;
      default: return Search;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <DoorOpen className="w-7 h-7 text-amber-500" />
              Advanced Escape Room
            </h1>
            <p className="text-muted-foreground">Solve puzzles to escape before time runs out</p>
          </div>
          <Link href="/game-center">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Game Center
            </Button>
          </Link>
        </div>

        {/* Menu State */}
        {gameState === "menu" && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                  <Lock className="w-10 h-10 text-amber-500" />
                </div>
                <CardTitle className="text-2xl">Choose Your Escape Room</CardTitle>
                <CardDescription>
                  Each room has themed puzzles. Solve them all before time runs out!
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4">
              {ROOMS.map(room => (
                <Card 
                  key={room.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    room.unlocked ? 'hover:border-amber-500' : 'opacity-50'
                  }`}
                  onClick={() => room.unlocked && startRoom(room)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {room.unlocked ? (
                            <Unlock className="w-5 h-5 text-green-500" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-500" />
                          )}
                          <h3 className="text-lg font-bold">{room.name}</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">{room.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {Math.floor(room.timeLimit / 60)} minutes
                          </span>
                          <span className="flex items-center gap-1">
                            <Puzzle className="w-4 h-4" />
                            {room.puzzles.length} puzzles
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {room.puzzles.reduce((sum, p) => sum + p.points, 0)} max points
                          </span>
                        </div>
                      </div>
                      <Button disabled={!room.unlocked}>
                        {room.unlocked ? "Enter" : "Locked"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Playing State */}
        {gameState === "playing" && selectedRoom && (
          <>
            {/* Status Bar */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      <Trophy className="w-4 h-4 mr-2" />
                      {score} pts
                    </Badge>
                    <Badge variant="outline">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      {hintsUsed} hints used
                    </Badge>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    timeLeft <= 60 ? 'bg-red-500/20 text-red-500' : 'bg-secondary'
                  }`}>
                    <Clock className="w-5 h-5" />
                    <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Puzzle Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{selectedRoom.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  {puzzles.map((puzzle, idx) => {
                    const Icon = getPuzzleIcon(puzzle.type);
                    const available = isPuzzleAvailable(puzzle);
                    const isCurrent = currentPuzzle?.id === puzzle.id;

                    return (
                      <Button
                        key={puzzle.id}
                        variant={puzzle.solved ? "default" : isCurrent ? "secondary" : "outline"}
                        size="sm"
                        disabled={!available || puzzle.solved}
                        onClick={() => available && !puzzle.solved && setCurrentPuzzle(puzzle)}
                        className={`gap-2 ${puzzle.solved ? 'bg-green-500' : ''}`}
                      >
                        {puzzle.solved ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : available ? (
                          <Icon className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        {idx + 1}
                      </Button>
                    );
                  })}
                </div>
                <Progress 
                  value={(puzzles.filter(p => p.solved).length / puzzles.length) * 100} 
                  className="mt-4"
                />
              </CardContent>
            </Card>

            {/* Current Puzzle */}
            {currentPuzzle && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = getPuzzleIcon(currentPuzzle.type);
                        return <Icon className="w-5 h-5" />;
                      })()}
                      <CardTitle>{currentPuzzle.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(currentPuzzle.difficulty)}>
                        {currentPuzzle.difficulty}
                      </Badge>
                      <Badge variant="secondary">{currentPuzzle.points} pts</Badge>
                    </div>
                  </div>
                  <CardDescription>{currentPuzzle.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showHint && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-700 dark:text-amber-300">Hint</p>
                          <p className="text-sm text-muted-foreground">{currentPuzzle.hint}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter your answer..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                      className="flex-1"
                    />
                    <Button onClick={handleSubmitAnswer}>
                      Submit
                    </Button>
                  </div>

                  {!showHint && (
                    <Button variant="outline" onClick={handleUseHint} className="w-full">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Use Hint (-30% points)
                    </Button>
                  )}

                  {(attempts[currentPuzzle.id] || 0) > 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Attempts: {attempts[currentPuzzle.id]} (-{(attempts[currentPuzzle.id] || 0) * 10} points)
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Complete State */}
        {gameState === "complete" && selectedRoom && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                <Trophy className="w-12 h-12 text-yellow-500" />
              </div>
              <CardTitle className="text-3xl">You Escaped!</CardTitle>
              <CardDescription className="text-lg">
                Congratulations! You solved all puzzles in {selectedRoom.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <p className="text-2xl font-bold">{score}</p>
                  <p className="text-sm text-muted-foreground">Total Score</p>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <Clock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold">{formatTime(selectedRoom.timeLimit - timeLeft)}</p>
                  <p className="text-sm text-muted-foreground">Time Used</p>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <Lightbulb className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                  <p className="text-2xl font-bold">{hintsUsed}</p>
                  <p className="text-sm text-muted-foreground">Hints Used</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => startRoom(selectedRoom)} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Button variant="outline" onClick={() => setGameState("menu")} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Choose Room
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed State */}
        {gameState === "failed" && selectedRoom && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
              <CardTitle className="text-3xl">Time's Up!</CardTitle>
              <CardDescription className="text-lg">
                You didn't escape in time. Better luck next time!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl font-bold">
                    {puzzles.filter(p => p.solved).length}/{puzzles.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Puzzles Solved</p>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <p className="text-2xl font-bold">{score}</p>
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => startRoom(selectedRoom)} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => setGameState("menu")} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Choose Room
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
