import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw, Trophy, ArrowDown, BookOpen, Brain, Zap } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface WordPuzzle {
  id: number;
  startWord: string;
  endWord: string;
  minSteps: number;
  difficulty: "easy" | "medium" | "hard";
  hint: string;
}

const puzzles: WordPuzzle[] = [
  { id: 1, startWord: "CAT", endWord: "DOG", minSteps: 3, difficulty: "easy", hint: "CAT → COT → COG → DOG" },
  { id: 2, startWord: "HEAD", endWord: "TAIL", minSteps: 5, difficulty: "medium", hint: "Change one letter at a time" },
  { id: 3, startWord: "COLD", endWord: "WARM", minSteps: 4, difficulty: "easy", hint: "COLD → CORD → CARD → WARD → WARM" },
  { id: 4, startWord: "POOR", endWord: "RICH", minSteps: 5, difficulty: "medium", hint: "Think about intermediate words" },
  { id: 5, startWord: "LOVE", endWord: "HATE", minSteps: 4, difficulty: "medium", hint: "LOVE → LAVE → LATE → LATE → HATE" },
  { id: 6, startWord: "BLACK", endWord: "WHITE", minSteps: 6, difficulty: "hard", hint: "This is a challenging one!" },
  { id: 7, startWord: "SAVE", endWord: "LOSE", minSteps: 4, difficulty: "medium", hint: "Financial literacy connection!" },
  { id: 8, startWord: "WORK", endWord: "PLAY", minSteps: 5, difficulty: "hard", hint: "Balance is key" },
];

// Simple word validation (in production, use a real dictionary API)
const commonWords = new Set([
  "cat", "cot", "cog", "dog", "dot", "hot", "hat", "bat", "bag", "big", "bit", "bot",
  "head", "heal", "teal", "tell", "tall", "tail", "hail", "hall", "ball", "bald",
  "cold", "cord", "card", "ward", "warm", "worm", "word", "wore", "core", "care",
  "poor", "pool", "cool", "coal", "coat", "cost", "cast", "cash", "rash", "rich",
  "love", "lave", "late", "hate", "have", "hive", "live", "lime", "time", "tide",
  "black", "blank", "bland", "blend", "bleed", "breed", "bread", "tread", "treat",
  "save", "sale", "sole", "lose", "lose", "lore", "sore", "more", "mare", "make",
  "work", "wort", "port", "part", "pant", "pant", "plan", "play", "plat", "flat",
  "white", "write", "wrote", "grove", "prove", "price", "prick", "trick", "track",
]);

export default function WordLadder() {
  const [currentPuzzle, setCurrentPuzzle] = useState<WordPuzzle>(puzzles[0]);
  const [ladder, setLadder] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [stats, setStats] = useState({ puzzlesSolved: 0, perfectSolves: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("wordladder_stats");
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  const saveStats = (newStats: typeof stats) => {
    localStorage.setItem("wordladder_stats", JSON.stringify(newStats));
    setStats(newStats);
  };

  const startGame = (puzzle: WordPuzzle = currentPuzzle) => {
    setCurrentPuzzle(puzzle);
    setLadder([puzzle.startWord]);
    setCurrentInput("");
    setGameStarted(true);
    setGameComplete(false);
    setShowHint(false);
  };

  const isOneLetterDifferent = (word1: string, word2: string): boolean => {
    if (word1.length !== word2.length) return false;
    let differences = 0;
    for (let i = 0; i < word1.length; i++) {
      if (word1[i] !== word2[i]) differences++;
    }
    return differences === 1;
  };

  const isValidWord = (word: string): boolean => {
    return commonWords.has(word.toLowerCase()) || word.length === currentPuzzle.startWord.length;
  };

  const handleSubmit = () => {
    const word = currentInput.toUpperCase().trim();
    
    if (word.length !== currentPuzzle.startWord.length) {
      toast.error(`Word must be ${currentPuzzle.startWord.length} letters`);
      return;
    }
    
    const lastWord = ladder[ladder.length - 1];
    
    if (!isOneLetterDifferent(lastWord, word)) {
      toast.error("You can only change one letter at a time!");
      return;
    }
    
    if (ladder.includes(word)) {
      toast.error("You've already used this word!");
      return;
    }
    
    // Add word to ladder
    const newLadder = [...ladder, word];
    setLadder(newLadder);
    setCurrentInput("");
    
    // Check if puzzle is complete
    if (word === currentPuzzle.endWord) {
      const steps = newLadder.length - 1;
      const isPerfect = steps === currentPuzzle.minSteps;
      
      const newStats = {
        puzzlesSolved: stats.puzzlesSolved + 1,
        perfectSolves: isPerfect ? stats.perfectSolves + 1 : stats.perfectSolves,
      };
      saveStats(newStats);
      setGameComplete(true);
      
      if (isPerfect) {
        toast.success(`Perfect! Solved in minimum ${steps} steps!`);
      } else {
        toast.success(`Solved in ${steps} steps! (Minimum: ${currentPuzzle.minSteps})`);
      }
    }
  };

  const undoLastWord = () => {
    if (ladder.length > 1) {
      setLadder(ladder.slice(0, -1));
    }
  };

  const selectPuzzle = (puzzle: WordPuzzle) => {
    startGame(puzzle);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/game-center">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Center
              </Button>
            </Link>
          </div>

          <Card className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Word Ladder</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Transform one word into another by changing one letter at a time!
              Each step must be a valid word. Builds vocabulary and word relationships.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
              <div className="text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Vocabulary</p>
              </div>
              <div className="text-center">
                <Brain className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Word Patterns</p>
              </div>
              <div className="text-center">
                <Zap className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Problem Solving</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center mb-6">
              <Badge variant="outline">Ages 8+</Badge>
              <Badge variant="outline">AIR Pillar</Badge>
              <Badge variant="outline">Single Player</Badge>
            </div>

            {stats.puzzlesSolved > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Your Stats</p>
                <p className="font-medium">
                  {stats.puzzlesSolved} Puzzles Solved | {stats.perfectSolves} Perfect Solves
                </p>
              </div>
            )}

            <Button onClick={() => startGame()} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <BookOpen className="w-5 h-5 mr-2" />
              Start Playing
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="container max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/game-center">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <Badge variant={
            currentPuzzle.difficulty === "easy" ? "default" :
            currentPuzzle.difficulty === "medium" ? "secondary" : "destructive"
          }>
            {currentPuzzle.difficulty}
          </Badge>
          
          <Button variant="outline" size="sm" onClick={() => startGame()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Puzzle info */}
        <Card className="p-6 mb-4 text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="px-6 py-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-muted-foreground">START</p>
              <p className="text-2xl font-bold tracking-widest">{currentPuzzle.startWord}</p>
            </div>
            <ArrowDown className="w-6 h-6 text-blue-600" />
            <div className="px-6 py-3 bg-green-100 rounded-lg">
              <p className="text-xs text-muted-foreground">END</p>
              <p className="text-2xl font-bold tracking-widest">{currentPuzzle.endWord}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Minimum steps: {currentPuzzle.minSteps} | Your steps: {ladder.length - 1}
          </p>
        </Card>

        {/* Word ladder display */}
        <Card className="p-6 mb-4">
          <h3 className="font-semibold mb-4 text-center">Your Ladder</h3>
          <div className="flex flex-col items-center gap-2">
            {ladder.map((word, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ArrowDown className="w-4 h-4 text-gray-400" />}
                <div className={`
                  px-6 py-2 rounded-lg font-mono text-xl tracking-widest
                  ${index === 0 ? "bg-blue-100" : 
                    word === currentPuzzle.endWord ? "bg-green-100" : "bg-gray-100"}
                `}>
                  {word}
                </div>
                {index === ladder.length - 1 && index > 0 && !gameComplete && (
                  <Button variant="ghost" size="sm" onClick={undoLastWord}>
                    Undo
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Input area */}
        {!gameComplete && (
          <Card className="p-6 mb-4">
            <div className="flex gap-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder={`Enter a ${currentPuzzle.startWord.length}-letter word`}
                className="text-center text-xl font-mono tracking-widest uppercase"
                maxLength={currentPuzzle.startWord.length}
              />
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Change exactly one letter from: <strong>{ladder[ladder.length - 1]}</strong>
            </p>
            
            <div className="mt-4 flex justify-center">
              <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
            </div>
            
            {showHint && (
              <p className="mt-2 text-sm text-muted-foreground text-center italic">
                💡 {currentPuzzle.hint}
              </p>
            )}
          </Card>
        )}

        {/* Victory */}
        {gameComplete && (
          <Card className="p-6 mb-4 text-center bg-gradient-to-r from-green-50 to-emerald-50">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-2">Puzzle Complete!</h2>
            <p className="text-muted-foreground mb-4">
              You solved it in {ladder.length - 1} steps
              {ladder.length - 1 === currentPuzzle.minSteps && " - Perfect!"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => startGame()} variant="outline">
                Try Again
              </Button>
              <Button 
                onClick={() => {
                  const nextIndex = (puzzles.findIndex(p => p.id === currentPuzzle.id) + 1) % puzzles.length;
                  selectPuzzle(puzzles[nextIndex]);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next Puzzle
              </Button>
            </div>
          </Card>
        )}

        {/* Puzzle selector */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">All Puzzles</h3>
          <div className="grid grid-cols-2 gap-2">
            {puzzles.map(puzzle => (
              <Button
                key={puzzle.id}
                variant={currentPuzzle.id === puzzle.id ? "default" : "outline"}
                size="sm"
                onClick={() => selectPuzzle(puzzle)}
                className={`justify-start ${currentPuzzle.id === puzzle.id ? "bg-blue-600" : ""}`}
              >
                {puzzle.startWord} → {puzzle.endWord}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
