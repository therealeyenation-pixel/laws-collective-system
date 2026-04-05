import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw, Trophy, Key, Lock, Lightbulb, Clock, Eye, Pause, Play } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface Puzzle {
  id: number;
  type: "code" | "riddle" | "pattern" | "math" | "word";
  question: string;
  hint: string;
  answer: string;
  image?: string;
}

interface Room {
  id: number;
  name: string;
  theme: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  timeLimit: number; // in seconds
  puzzles: Puzzle[];
  category: string;
}

const ROOMS: Room[] = [
  {
    id: 1,
    name: "The Library Mystery",
    theme: "📚",
    description: "You're locked in an old library. Find the clues hidden among the books to escape!",
    difficulty: "beginner",
    timeLimit: 600,
    category: "AIR - Knowledge",
    puzzles: [
      {
        id: 1,
        type: "riddle",
        question: "I have pages but I'm not a tree. I have a spine but I'm not alive. What am I?",
        hint: "You're surrounded by these in a library.",
        answer: "BOOK",
      },
      {
        id: 2,
        type: "math",
        question: "The bookshelf has 3 rows. Each row has 7 books. How many books total?",
        hint: "Multiply the rows by books per row.",
        answer: "21",
      },
      {
        id: 3,
        type: "code",
        question: "The librarian's note says: 'The code is the 1st letter of each word: Always Be Curious Daily'",
        hint: "Take the first letter of each word.",
        answer: "ABCD",
      },
      {
        id: 4,
        type: "word",
        question: "Unscramble this word found on the old map: DREERAF",
        hint: "Someone who reads a lot.",
        answer: "READER",
      },
    ],
  },
  {
    id: 2,
    name: "The Treasure Vault",
    theme: "💰",
    description: "A wealthy merchant's vault holds secrets. Crack the codes to claim the treasure!",
    difficulty: "beginner",
    timeLimit: 600,
    category: "SELF - Financial Literacy",
    puzzles: [
      {
        id: 1,
        type: "math",
        question: "You have $50. You spend $23 on supplies. How much do you have left?",
        hint: "Subtract what you spent from what you had.",
        answer: "27",
      },
      {
        id: 2,
        type: "pattern",
        question: "The vault combination follows this pattern: 2, 4, 8, 16, __. What's next?",
        hint: "Each number doubles.",
        answer: "32",
      },
      {
        id: 3,
        type: "riddle",
        question: "I can be saved, spent, or invested. Banks keep me safe. What am I?",
        hint: "The merchant has lots of this.",
        answer: "MONEY",
      },
      {
        id: 4,
        type: "code",
        question: "The safe's hint: 'Count the coins: 🪙🪙🪙🪙🪙 + 🪙🪙🪙 = ?'",
        hint: "Add the coins together.",
        answer: "8",
      },
    ],
  },
  {
    id: 3,
    name: "The Science Lab",
    theme: "🔬",
    description: "A mad scientist has locked you in the lab! Use science to find your way out!",
    difficulty: "intermediate",
    timeLimit: 900,
    category: "LAND - Science",
    puzzles: [
      {
        id: 1,
        type: "riddle",
        question: "I am H2O. I can be solid, liquid, or gas. What am I?",
        hint: "You drink this every day.",
        answer: "WATER",
      },
      {
        id: 2,
        type: "pattern",
        question: "Complete the periodic sequence: H, He, Li, Be, __",
        hint: "These are the first 5 elements. The 5th is Boron.",
        answer: "B",
      },
      {
        id: 3,
        type: "math",
        question: "The experiment needs 250ml of solution A and 150ml of solution B. Total volume?",
        hint: "Add the two volumes together.",
        answer: "400",
      },
      {
        id: 4,
        type: "code",
        question: "The formula on the board shows: ☀️ + 🌱 + 💧 = 🍎. What process is this? (First 5 letters)",
        hint: "How plants make food using sunlight.",
        answer: "PHOTO",
      },
      {
        id: 5,
        type: "word",
        question: "Unscramble the scientific term: TOMSA",
        hint: "The smallest unit of matter.",
        answer: "ATOMS",
      },
    ],
  },
  {
    id: 4,
    name: "The Time Capsule",
    theme: "⏰",
    description: "You've found a time capsule from 100 years ago. Solve the historical puzzles to open it!",
    difficulty: "intermediate",
    timeLimit: 900,
    category: "AIR - History",
    puzzles: [
      {
        id: 1,
        type: "math",
        question: "If the capsule was buried in 1924 and it's now 2024, how many years has it been buried?",
        hint: "Subtract the burial year from the current year.",
        answer: "100",
      },
      {
        id: 2,
        type: "riddle",
        question: "I tick but I'm not alive. I have hands but cannot wave. I tell you something important. What am I?",
        hint: "Look at the room's theme.",
        answer: "CLOCK",
      },
      {
        id: 3,
        type: "pattern",
        question: "The years on the photos: 1920, 1930, 1940, 1950, __",
        hint: "Each year increases by 10.",
        answer: "1960",
      },
      {
        id: 4,
        type: "code",
        question: "The old telegram uses Morse code: •• - (I T). What do these letters spell?",
        hint: "The pronoun for referring to a thing.",
        answer: "IT",
      },
      {
        id: 5,
        type: "word",
        question: "Unscramble this historical term: YROTSIH",
        hint: "The study of the past.",
        answer: "HISTORY",
      },
    ],
  },
  {
    id: 5,
    name: "The Cryptographer's Office",
    theme: "🔐",
    description: "A master codebreaker has left behind encrypted messages. Can you decode them all?",
    difficulty: "advanced",
    timeLimit: 1200,
    category: "SELF - Critical Thinking",
    puzzles: [
      {
        id: 1,
        type: "code",
        question: "Caesar cipher (shift 1): TFDSFU. Shift each letter back by 1 to decode.",
        hint: "T becomes S, F becomes E, etc.",
        answer: "SECRET",
      },
      {
        id: 2,
        type: "pattern",
        question: "Binary to decimal: 1010 = ?",
        hint: "1010 in binary = 8+0+2+0",
        answer: "10",
      },
      {
        id: 3,
        type: "math",
        question: "If A=1, B=2, C=3... what is C+O+D+E? (C=3, O=15, D=4, E=5)",
        hint: "Add the letter values: 3+15+4+5",
        answer: "27",
      },
      {
        id: 4,
        type: "riddle",
        question: "I am a word of 5 letters. Remove 2 and I become 1. What am I?",
        hint: "Think about the word 'alone' - remove 'al' and you get 'one'.",
        answer: "ALONE",
      },
      {
        id: 5,
        type: "code",
        question: "Reverse cipher: EDOC. What word is hidden?",
        hint: "Read it backwards.",
        answer: "CODE",
      },
      {
        id: 6,
        type: "pattern",
        question: "Complete: A1, B2, C3, D4, __",
        hint: "Letter and number increase together. E is the 5th letter.",
        answer: "E5",
      },
    ],
  },
];

export default function EscapeRoom() {
  const [, setLocation] = useLocation();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [escaped, setEscaped] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [solvedPuzzles, setSolvedPuzzles] = useState<number[]>([]);

  // Timer
  useEffect(() => {
    if (!gameStarted || escaped || failed || isPaused) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFailed(true);
          toast.error("Time's up! You didn't escape in time.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, escaped, failed, isPaused]);

  const startRoom = (room: Room) => {
    setSelectedRoom(room);
    setCurrentPuzzleIndex(0);
    setUserAnswer("");
    setShowHint(false);
    setHintsUsed(0);
    setTimeLeft(room.timeLimit);
    setGameStarted(true);
    setEscaped(false);
    setFailed(false);
    setIsPaused(false);
    setSolvedPuzzles([]);
  };

  const checkAnswer = () => {
    if (!selectedRoom || isPaused) return;
    
    const currentPuzzle = selectedRoom.puzzles[currentPuzzleIndex];
    const normalizedAnswer = userAnswer.trim().toUpperCase();
    const correctAnswer = currentPuzzle.answer.toUpperCase();
    
    if (normalizedAnswer === correctAnswer) {
      toast.success("Correct!");
      setSolvedPuzzles((prev) => [...prev, currentPuzzle.id]);
      
      if (currentPuzzleIndex < selectedRoom.puzzles.length - 1) {
        setCurrentPuzzleIndex((prev) => prev + 1);
        setUserAnswer("");
        setShowHint(false);
      } else {
        setEscaped(true);
        toast.success("You escaped!");
      }
    } else {
      toast.error("That's not right. Try again!");
    }
  };

  const useHint = () => {
    if (isPaused) return;
    setShowHint(true);
    setHintsUsed((prev) => prev + 1);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetGame = () => {
    setSelectedRoom(null);
    setGameStarted(false);
    setEscaped(false);
    setFailed(false);
    setIsPaused(false);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner": return "text-green-500";
      case "intermediate": return "text-yellow-500";
      case "advanced": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/game-center")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game Center
          </Button>

          <Card className="p-8 text-center mb-6">
            <Key className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">🔐 Escape Room Academy</h1>
            <p className="text-muted-foreground mb-4">
              Solve puzzles, crack codes, and escape before time runs out!
            </p>
            <p className="text-sm text-muted-foreground">
              Each room teaches different skills aligned with the L.A.W.S. curriculum.
            </p>
          </Card>

          <div className="space-y-4">
            {ROOMS.map((room) => (
              <Card
                key={room.id}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => startRoom(room)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{room.theme}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{room.name}</h3>
                      <span className={`text-sm font-medium capitalize ${getDifficultyColor(room.difficulty)}`}>
                        {room.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(room.timeLimit / 60)} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {room.puzzles.length} puzzles
                      </span>
                      <span>{room.category}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (escaped) {
    const baseScore = 100;
    const timeBonus = Math.floor(timeLeft / 10);
    const hintPenalty = hintsUsed * 10;
    const finalScore = Math.max(0, baseScore + timeBonus - hintPenalty);

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">You Escaped! 🎉</h2>
            <p className="text-muted-foreground mb-4">{selectedRoom?.name}</p>
            
            <div className="space-y-2 mb-4 text-sm">
              <p>Time remaining: {formatTime(timeLeft)}</p>
              <p>Hints used: {hintsUsed}</p>
              <p className="text-2xl font-bold text-primary">Score: {finalScore}</p>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button onClick={resetGame}>More Rooms</Button>
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

  if (failed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            <Lock className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Time's Up! ⏰</h2>
            <p className="text-muted-foreground mb-4">
              You didn't escape {selectedRoom?.name} in time.
            </p>
            <p className="text-sm mb-4">
              You solved {solvedPuzzles.length} of {selectedRoom?.puzzles.length} puzzles.
            </p>
            
            <div className="flex gap-2 justify-center">
              <Button onClick={() => selectedRoom && startRoom(selectedRoom)}>
                Try Again
              </Button>
              <Button variant="outline" onClick={resetGame}>
                Different Room
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentPuzzle = selectedRoom?.puzzles[currentPuzzleIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={resetGame}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <div className="text-center">
            <h2 className="font-semibold">{selectedRoom?.theme} {selectedRoom?.name}</h2>
            <span className={`text-xl font-bold ${timeLeft <= 60 ? "text-red-500" : ""}`}>
              {formatTime(timeLeft)}
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
          </div>
        </div>

        {isPaused && (
          <Card className="p-4 mb-4 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500">
            <p className="text-center font-medium">Game Paused - Timer Stopped</p>
          </Card>
        )}

        {/* Progress */}
        <div className="flex gap-2 mb-4">
          {selectedRoom?.puzzles.map((puzzle, index) => (
            <div
              key={puzzle.id}
              className={`
                flex-1 h-2 rounded-full
                ${index < currentPuzzleIndex ? "bg-green-500" : ""}
                ${index === currentPuzzleIndex ? "bg-primary" : ""}
                ${index > currentPuzzleIndex ? "bg-muted" : ""}
              `}
            />
          ))}
        </div>

        {/* Puzzle */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              Puzzle {currentPuzzleIndex + 1} of {selectedRoom?.puzzles.length}
            </span>
            <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
              {currentPuzzle?.type}
            </span>
          </div>

          <h3 className="text-xl font-semibold mb-6">{currentPuzzle?.question}</h3>

          <div className="space-y-4">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter your answer..."
              className="text-lg"
              disabled={isPaused}
              onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            />

            <div className="flex gap-2">
              <Button className="flex-1" onClick={checkAnswer} disabled={!userAnswer || isPaused}>
                <Key className="w-4 h-4 mr-2" />
                Submit
              </Button>
              <Button
                variant="outline"
                onClick={useHint}
                disabled={showHint || isPaused}
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                Hint
              </Button>
            </div>

            {showHint && (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-sm">
                <Lightbulb className="w-4 h-4 inline mr-2 text-yellow-600" />
                {currentPuzzle?.hint}
              </div>
            )}
          </div>
        </Card>

        {/* Stats */}
        <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
          <span>Hints used: {hintsUsed}</span>
          <span>Puzzles solved: {solvedPuzzles.length}</span>
        </div>
      </div>
    </div>
  );
}
