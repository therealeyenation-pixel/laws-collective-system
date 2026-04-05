import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Grid3X3,
  Trophy,
  Clock,
  Star,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface CrosswordClue {
  number: number;
  direction: "across" | "down";
  clue: string;
  answer: string;
  row: number;
  col: number;
  category: string;
}

interface CrosswordPuzzleData {
  id: number;
  title: string;
  theme: string;
  difficulty: "easy" | "medium" | "hard";
  gridSize: number;
  clues: CrosswordClue[];
  xpReward: number;
  tokenReward: number;
}

const puzzles: CrosswordPuzzleData[] = [
  {
    id: 1,
    title: "Financial Literacy Basics",
    theme: "Money Management",
    difficulty: "easy",
    gridSize: 10,
    xpReward: 50,
    tokenReward: 25,
    clues: [
      { number: 1, direction: "across", clue: "Money set aside for future use", answer: "SAVINGS", row: 0, col: 0, category: "finance" },
      { number: 2, direction: "across", clue: "Plan for managing income and expenses", answer: "BUDGET", row: 2, col: 1, category: "finance" },
      { number: 3, direction: "across", clue: "Money earned from work", answer: "INCOME", row: 4, col: 2, category: "finance" },
      { number: 4, direction: "across", clue: "Money owed to others", answer: "DEBT", row: 6, col: 0, category: "finance" },
      { number: 1, direction: "down", clue: "Place to keep money safely", answer: "BANK", row: 0, col: 0, category: "finance" },
      { number: 5, direction: "down", clue: "Percentage charged on borrowed money", answer: "INTEREST", row: 0, col: 4, category: "finance" },
      { number: 6, direction: "down", clue: "Putting money to grow", answer: "INVEST", row: 2, col: 6, category: "finance" },
    ],
  },
  {
    id: 2,
    title: "Business Fundamentals",
    theme: "Entrepreneurship",
    difficulty: "medium",
    gridSize: 12,
    xpReward: 75,
    tokenReward: 40,
    clues: [
      { number: 1, direction: "across", clue: "Person who starts a business", answer: "ENTREPRENEUR", row: 0, col: 0, category: "business" },
      { number: 2, direction: "across", clue: "Money to start a business", answer: "CAPITAL", row: 2, col: 2, category: "business" },
      { number: 3, direction: "across", clue: "Income minus expenses", answer: "PROFIT", row: 4, col: 1, category: "business" },
      { number: 4, direction: "across", clue: "People who buy products", answer: "CUSTOMERS", row: 6, col: 0, category: "business" },
      { number: 1, direction: "down", clue: "Ownership share in a company", answer: "EQUITY", row: 0, col: 0, category: "business" },
      { number: 5, direction: "down", clue: "Legal business structure", answer: "LLC", row: 2, col: 5, category: "business" },
    ],
  },
  {
    id: 3,
    title: "L.A.W.S. Framework",
    theme: "Personal Development",
    difficulty: "easy",
    gridSize: 10,
    xpReward: 50,
    tokenReward: 25,
    clues: [
      { number: 1, direction: "across", clue: "First letter of L.A.W.S. - connection to roots", answer: "LAND", row: 0, col: 0, category: "laws" },
      { number: 2, direction: "across", clue: "Second letter - education and knowledge", answer: "AIR", row: 2, col: 1, category: "laws" },
      { number: 3, direction: "across", clue: "Third letter - healing and balance", answer: "WATER", row: 4, col: 0, category: "laws" },
      { number: 4, direction: "across", clue: "Fourth letter - purpose and skills", answer: "SELF", row: 6, col: 2, category: "laws" },
      { number: 5, direction: "down", clue: "Building wealth across generations", answer: "LEGACY", row: 0, col: 0, category: "laws" },
      { number: 6, direction: "down", clue: "Group working together", answer: "COLLECTIVE", row: 0, col: 3, category: "laws" },
    ],
  },
];

export default function CrosswordPuzzle() {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<"across" | "down">("across");
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map());
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [completedClues, setCompletedClues] = useState<Set<string>>(new Set());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(0);

  const currentPuzzle = puzzles[currentPuzzleIndex];

  // Initialize grid
  useEffect(() => {
    initializeGrid();
    setTimeElapsed(0);
    setIsComplete(false);
    setUserAnswers(new Map());
    setRevealedCells(new Set());
    setCompletedClues(new Set());
    setHintsUsed(0);
  }, [currentPuzzleIndex]);

  // Timer
  useEffect(() => {
    if (!isComplete) {
      const timer = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isComplete]);

  const initializeGrid = () => {
    const newGrid: string[][] = Array(currentPuzzle.gridSize)
      .fill(null)
      .map(() => Array(currentPuzzle.gridSize).fill(""));

    // Mark cells that are part of words
    currentPuzzle.clues.forEach((clue) => {
      for (let i = 0; i < clue.answer.length; i++) {
        const row = clue.direction === "across" ? clue.row : clue.row + i;
        const col = clue.direction === "across" ? clue.col + i : clue.col;
        if (row < currentPuzzle.gridSize && col < currentPuzzle.gridSize) {
          newGrid[row][col] = "#"; // Mark as valid cell
        }
      }
    });

    setGrid(newGrid);
  };

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const getClueNumber = (row: number, col: number): number | null => {
    const clue = currentPuzzle.clues.find(
      (c) => c.row === row && c.col === col
    );
    return clue?.number || null;
  };

  const isValidCell = (row: number, col: number): boolean => {
    return grid[row]?.[col] === "#";
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isValidCell(row, col)) return;

    if (selectedCell?.row === row && selectedCell?.col === col) {
      setSelectedDirection(selectedDirection === "across" ? "down" : "across");
    } else {
      setSelectedCell({ row, col });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === "Backspace") {
      const key = getCellKey(row, col);
      const newAnswers = new Map(userAnswers);
      newAnswers.delete(key);
      setUserAnswers(newAnswers);
      
      // Move to previous cell
      const prevRow = selectedDirection === "down" ? row - 1 : row;
      const prevCol = selectedDirection === "across" ? col - 1 : col;
      if (isValidCell(prevRow, prevCol)) {
        setSelectedCell({ row: prevRow, col: prevCol });
      }
    } else if (e.key === "ArrowRight" && isValidCell(row, col + 1)) {
      setSelectedCell({ row, col: col + 1 });
      setSelectedDirection("across");
    } else if (e.key === "ArrowLeft" && isValidCell(row, col - 1)) {
      setSelectedCell({ row, col: col - 1 });
      setSelectedDirection("across");
    } else if (e.key === "ArrowDown" && isValidCell(row + 1, col)) {
      setSelectedCell({ row: row + 1, col });
      setSelectedDirection("down");
    } else if (e.key === "ArrowUp" && isValidCell(row - 1, col)) {
      setSelectedCell({ row: row - 1, col });
      setSelectedDirection("down");
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      const key = getCellKey(row, col);
      const newAnswers = new Map(userAnswers);
      newAnswers.set(key, e.key.toUpperCase());
      setUserAnswers(newAnswers);
      
      // Move to next cell
      const nextRow = selectedDirection === "down" ? row + 1 : row;
      const nextCol = selectedDirection === "across" ? col + 1 : col;
      if (isValidCell(nextRow, nextCol)) {
        setSelectedCell({ row: nextRow, col: nextCol });
      }
      
      checkCompletion(newAnswers);
    }
  };

  const checkCompletion = (answers: Map<string, string>) => {
    let allCorrect = true;
    const newCompleted = new Set<string>();

    currentPuzzle.clues.forEach((clue) => {
      let clueCorrect = true;
      for (let i = 0; i < clue.answer.length; i++) {
        const row = clue.direction === "across" ? clue.row : clue.row + i;
        const col = clue.direction === "across" ? clue.col + i : clue.col;
        const key = getCellKey(row, col);
        const userLetter = answers.get(key) || "";
        
        if (userLetter !== clue.answer[i]) {
          clueCorrect = false;
          allCorrect = false;
        }
      }
      
      if (clueCorrect) {
        newCompleted.add(`${clue.number}-${clue.direction}`);
      }
    });

    setCompletedClues(newCompleted);

    if (allCorrect && answers.size > 0) {
      setIsComplete(true);
      const hintPenalty = hintsUsed * 10;
      const timeBonus = Math.max(0, 300 - timeElapsed);
      const finalScore = currentPuzzle.xpReward + timeBonus - hintPenalty;
      setScore(finalScore);
      toast.success(`Puzzle Complete! +${finalScore} XP, +${currentPuzzle.tokenReward} tokens`);
    }
  };

  const revealLetter = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    const clue = currentPuzzle.clues.find((c) => {
      if (c.direction === "across") {
        return c.row === row && col >= c.col && col < c.col + c.answer.length;
      } else {
        return c.col === col && row >= c.row && row < c.row + c.answer.length;
      }
    });

    if (clue) {
      const letterIndex = clue.direction === "across" ? col - clue.col : row - clue.row;
      const correctLetter = clue.answer[letterIndex];
      const key = getCellKey(row, col);
      
      const newAnswers = new Map(userAnswers);
      newAnswers.set(key, correctLetter);
      setUserAnswers(newAnswers);
      
      const newRevealed = new Set(revealedCells);
      newRevealed.add(key);
      setRevealedCells(newRevealed);
      
      setHintsUsed(hintsUsed + 1);
      toast.info("Letter revealed! (-10 XP penalty)");
      
      checkCompletion(newAnswers);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700";
      case "medium": return "bg-amber-100 text-amber-700";
      case "hard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const acrossClues = currentPuzzle.clues.filter((c) => c.direction === "across");
  const downClues = currentPuzzle.clues.filter((c) => c.direction === "down");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{currentPuzzle.title}</h2>
          <p className="text-muted-foreground">Theme: {currentPuzzle.theme}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={getDifficultyColor(currentPuzzle.difficulty)}>
            {currentPuzzle.difficulty}
          </Badge>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(timeElapsed)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span>+{currentPuzzle.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Grid3X3 className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{completedClues.size}/{currentPuzzle.clues.length}</p>
            <p className="text-xs text-muted-foreground">Clues Solved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold">{hintsUsed}</p>
            <p className="text-xs text-muted-foreground">Hints Used</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{currentPuzzle.tokenReward}</p>
            <p className="text-xs text-muted-foreground">Token Reward</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{isComplete ? "Done!" : "In Progress"}</p>
            <p className="text-xs text-muted-foreground">Status</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crossword Grid */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div
                className="grid gap-0.5 bg-black p-0.5"
                style={{
                  gridTemplateColumns: `repeat(${currentPuzzle.gridSize}, minmax(0, 1fr))`,
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isValid = cell === "#";
                    const key = getCellKey(rowIndex, colIndex);
                    const userLetter = userAnswers.get(key) || "";
                    const clueNumber = getClueNumber(rowIndex, colIndex);
                    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                    const isRevealed = revealedCells.has(key);

                    return (
                      <div
                        key={key}
                        className={`
                          w-8 h-8 md:w-10 md:h-10 relative
                          ${isValid ? "bg-white cursor-pointer" : "bg-black"}
                          ${isSelected ? "ring-2 ring-primary ring-inset" : ""}
                          ${isRevealed ? "bg-amber-50" : ""}
                        `}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        tabIndex={isValid ? 0 : -1}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      >
                        {clueNumber && (
                          <span className="absolute top-0 left-0.5 text-[8px] md:text-[10px] font-bold text-gray-500">
                            {clueNumber}
                          </span>
                        )}
                        {isValid && (
                          <span className="absolute inset-0 flex items-center justify-center text-lg md:text-xl font-bold">
                            {userLetter}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={revealLetter} disabled={!selectedCell || isComplete}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Reveal Letter
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setUserAnswers(new Map());
                  setRevealedCells(new Set());
                  setCompletedClues(new Set());
                  setHintsUsed(0);
                  setTimeElapsed(0);
                  setIsComplete(false);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clues */}
        <Card>
          <CardHeader>
            <CardTitle>Clues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Across</h4>
              <ul className="space-y-2">
                {acrossClues.map((clue) => (
                  <li
                    key={`${clue.number}-across`}
                    className={`text-sm p-2 rounded cursor-pointer hover:bg-muted ${
                      completedClues.has(`${clue.number}-across`)
                        ? "bg-green-50 text-green-700 line-through"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedCell({ row: clue.row, col: clue.col });
                      setSelectedDirection("across");
                    }}
                  >
                    <span className="font-bold">{clue.number}.</span> {clue.clue}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Down</h4>
              <ul className="space-y-2">
                {downClues.map((clue) => (
                  <li
                    key={`${clue.number}-down`}
                    className={`text-sm p-2 rounded cursor-pointer hover:bg-muted ${
                      completedClues.has(`${clue.number}-down`)
                        ? "bg-green-50 text-green-700 line-through"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedCell({ row: clue.row, col: clue.col });
                      setSelectedDirection("down");
                    }}
                  >
                    <span className="font-bold">{clue.number}.</span> {clue.clue}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Puzzle Selection */}
      <Card>
        <CardHeader>
          <CardTitle>More Puzzles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {puzzles.map((puzzle, index) => (
              <Card
                key={puzzle.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentPuzzleIndex === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setCurrentPuzzleIndex(index)}
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold">{puzzle.title}</h4>
                  <p className="text-sm text-muted-foreground">{puzzle.theme}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getDifficultyColor(puzzle.difficulty)}>
                      {puzzle.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      +{puzzle.xpReward} XP
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completion Modal */}
      {isComplete && (
        <Card className="border-2 border-green-500 bg-green-50">
          <CardContent className="p-6 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-2xl font-bold text-green-700 mb-2">Puzzle Complete!</h3>
            <p className="text-muted-foreground mb-4">
              Time: {formatTime(timeElapsed)} | Hints Used: {hintsUsed}
            </p>
            <div className="flex justify-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{score}</p>
                <p className="text-sm text-muted-foreground">XP Earned</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">{currentPuzzle.tokenReward}</p>
                <p className="text-sm text-muted-foreground">Tokens</p>
              </div>
            </div>
            <Button onClick={() => setCurrentPuzzleIndex((currentPuzzleIndex + 1) % puzzles.length)}>
              Next Puzzle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
