import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RotateCcw, Trophy, Lightbulb, Check, Pause, Play } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface CrosswordClue {
  number: number;
  direction: "across" | "down";
  clue: string;
  answer: string;
  row: number;
  col: number;
}

interface CrosswordPuzzle {
  id: number;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  grid: string[][];
  clues: CrosswordClue[];
}

// Educational crossword puzzles aligned with L.A.W.S. framework
const PUZZLES: CrosswordPuzzle[] = [
  {
    id: 1,
    title: "Financial Basics",
    category: "SELF - Financial Literacy",
    difficulty: "easy",
    grid: [
      ["S", "A", "V", "E", "#", "B", "A", "N", "K"],
      ["#", "#", "#", "A", "#", "U", "#", "#", "#"],
      ["L", "O", "A", "N", "#", "D", "#", "#", "#"],
      ["#", "#", "#", "N", "#", "G", "#", "#", "#"],
      ["C", "A", "S", "H", "#", "E", "#", "#", "#"],
      ["#", "#", "#", "#", "#", "T", "#", "#", "#"],
      ["D", "E", "B", "T", "#", "#", "#", "#", "#"],
      ["#", "#", "#", "A", "#", "#", "#", "#", "#"],
      ["G", "O", "A", "L", "#", "#", "#", "#", "#"],
    ],
    clues: [
      { number: 1, direction: "across", clue: "To put money aside for later", answer: "SAVE", row: 0, col: 0 },
      { number: 5, direction: "across", clue: "Where you keep your money safe", answer: "BANK", row: 0, col: 5 },
      { number: 2, direction: "across", clue: "Money borrowed that must be repaid", answer: "LOAN", row: 2, col: 0 },
      { number: 3, direction: "across", clue: "Physical money (coins and bills)", answer: "CASH", row: 4, col: 0 },
      { number: 4, direction: "across", clue: "Money you owe to others", answer: "DEBT", row: 6, col: 0 },
      { number: 6, direction: "across", clue: "Something you want to achieve", answer: "GOAL", row: 8, col: 0 },
      { number: 1, direction: "down", clue: "To make money from work", answer: "EARN", row: 0, col: 3 },
      { number: 5, direction: "down", clue: "A plan for spending money", answer: "BUDGET", row: 0, col: 5 },
      { number: 7, direction: "down", clue: "Money collected by government", answer: "TAX", row: 6, col: 3 },
    ],
  },
  {
    id: 2,
    title: "Nature & Environment",
    category: "LAND - Earth Science",
    difficulty: "easy",
    grid: [
      ["T", "R", "E", "E", "#", "S", "U", "N", "#"],
      ["#", "A", "#", "#", "#", "O", "#", "#", "#"],
      ["R", "I", "V", "E", "R", "I", "L", "#", "#"],
      ["#", "N", "#", "#", "#", "L", "#", "#", "#"],
      ["S", "E", "E", "D", "#", "#", "#", "#", "#"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["L", "E", "A", "F", "#", "R", "O", "O", "T"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["F", "A", "R", "M", "#", "#", "#", "#", "#"],
    ],
    clues: [
      { number: 1, direction: "across", clue: "A tall plant with a trunk and branches", answer: "TREE", row: 0, col: 0 },
      { number: 2, direction: "across", clue: "The star that gives us light and warmth", answer: "SUN", row: 0, col: 5 },
      { number: 3, direction: "across", clue: "A large natural stream of water", answer: "RIVER", row: 2, col: 0 },
      { number: 4, direction: "across", clue: "What plants grow from", answer: "SEED", row: 4, col: 0 },
      { number: 5, direction: "across", clue: "The flat green part of a plant", answer: "LEAF", row: 6, col: 0 },
      { number: 6, direction: "across", clue: "The underground part of a plant", answer: "ROOT", row: 6, col: 5 },
      { number: 7, direction: "across", clue: "Land used to grow crops", answer: "FARM", row: 8, col: 0 },
      { number: 1, direction: "down", clue: "Water falling from clouds", answer: "RAIN", row: 0, col: 1 },
      { number: 2, direction: "down", clue: "The ground we walk on", answer: "SOIL", row: 0, col: 5 },
    ],
  },
  {
    id: 3,
    title: "Emotions & Wellness",
    category: "WATER - Emotional Intelligence",
    difficulty: "medium",
    grid: [
      ["H", "A", "P", "P", "Y", "#", "C", "A", "L", "M"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "O", "#"],
      ["A", "N", "G", "R", "Y", "#", "#", "#", "V", "#"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "E", "#"],
      ["S", "A", "D", "#", "F", "E", "A", "R", "#", "#"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["J", "O", "Y", "#", "H", "O", "P", "E", "#", "#"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["T", "R", "U", "S", "T", "#", "P", "E", "A", "C", "E"],
    ],
    clues: [
      { number: 1, direction: "across", clue: "Feeling good and content", answer: "HAPPY", row: 0, col: 0 },
      { number: 2, direction: "across", clue: "Peaceful and relaxed", answer: "CALM", row: 0, col: 6 },
      { number: 3, direction: "across", clue: "Feeling upset or mad", answer: "ANGRY", row: 2, col: 0 },
      { number: 4, direction: "across", clue: "Feeling unhappy or down", answer: "SAD", row: 4, col: 0 },
      { number: 5, direction: "across", clue: "Being scared of something", answer: "FEAR", row: 4, col: 4 },
      { number: 6, direction: "across", clue: "A feeling of great happiness", answer: "JOY", row: 6, col: 0 },
      { number: 7, direction: "across", clue: "Believing good things will happen", answer: "HOPE", row: 6, col: 4 },
      { number: 8, direction: "across", clue: "Believing someone is reliable", answer: "TRUST", row: 8, col: 0 },
      { number: 9, direction: "across", clue: "Freedom from disturbance", answer: "PEACE", row: 8, col: 6 },
      { number: 2, direction: "down", clue: "Caring deeply for someone", answer: "LOVE", row: 0, col: 8 },
    ],
  },
  {
    id: 4,
    title: "Learning & Knowledge",
    category: "AIR - Education",
    difficulty: "medium",
    grid: [
      ["R", "E", "A", "D", "#", "B", "O", "O", "K"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["S", "T", "U", "D", "Y", "#", "L", "E", "A", "R", "N"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["W", "R", "I", "T", "E", "#", "T", "H", "I", "N", "K"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["S", "K", "I", "L", "L", "#", "#", "#", "#", "#", "#"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["T", "E", "A", "C", "H", "#", "#", "#", "#", "#", "#"],
    ],
    clues: [
      { number: 1, direction: "across", clue: "To look at words and understand them", answer: "READ", row: 0, col: 0 },
      { number: 2, direction: "across", clue: "Pages bound together with information", answer: "BOOK", row: 0, col: 5 },
      { number: 3, direction: "across", clue: "To spend time learning", answer: "STUDY", row: 2, col: 0 },
      { number: 4, direction: "across", clue: "To gain knowledge or ability", answer: "LEARN", row: 2, col: 6 },
      { number: 5, direction: "across", clue: "To put words on paper", answer: "WRITE", row: 4, col: 0 },
      { number: 6, direction: "across", clue: "To use your mind to consider", answer: "THINK", row: 4, col: 6 },
      { number: 7, direction: "across", clue: "An ability developed through practice", answer: "SKILL", row: 6, col: 0 },
      { number: 8, direction: "across", clue: "To help others learn", answer: "TEACH", row: 8, col: 0 },
    ],
  },
];

export default function CrosswordMaster() {
  const [, setLocation] = useLocation();
  const [currentPuzzle, setCurrentPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedClue, setSelectedClue] = useState<CrosswordClue | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer
  useEffect(() => {
    if (!gameStarted || completed || isPaused) return;
    
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, completed, isPaused, startTime]);

  const initGame = useCallback((puzzle: CrosswordPuzzle) => {
    const emptyGrid = puzzle.grid.map((row) =>
      row.map((cell) => (cell === "#" ? "#" : ""))
    );
    setCurrentPuzzle(puzzle);
    setUserGrid(emptyGrid);
    setSelectedCell(null);
    setSelectedClue(null);
    setDirection("across");
    setHintsUsed(0);
    setCompleted(false);
    setGameStarted(true);
    setIsPaused(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (isPaused || completed) return;
    if (currentPuzzle?.grid[row][col] === "#") return;
    
    if (selectedCell?.row === row && selectedCell?.col === col) {
      // Toggle direction
      setDirection((prev) => (prev === "across" ? "down" : "across"));
    } else {
      setSelectedCell({ row, col });
    }
    
    // Find corresponding clue
    const clue = currentPuzzle?.clues.find(
      (c) =>
        c.direction === direction &&
        ((direction === "across" && c.row === row && col >= c.col && col < c.col + c.answer.length) ||
          (direction === "down" && c.col === col && row >= c.row && row < c.row + c.answer.length))
    );
    if (clue) setSelectedClue(clue);
  };

  const handleInput = (value: string) => {
    if (!selectedCell || isPaused || completed) return;
    
    const letter = value.toUpperCase().slice(-1);
    if (!/^[A-Z]$/.test(letter) && letter !== "") return;
    
    const newGrid = userGrid.map((row) => [...row]);
    newGrid[selectedCell.row][selectedCell.col] = letter;
    setUserGrid(newGrid);
    
    // Move to next cell
    if (letter) {
      if (direction === "across") {
        const nextCol = selectedCell.col + 1;
        if (nextCol < newGrid[0].length && currentPuzzle?.grid[selectedCell.row][nextCol] !== "#") {
          setSelectedCell({ row: selectedCell.row, col: nextCol });
        }
      } else {
        const nextRow = selectedCell.row + 1;
        if (nextRow < newGrid.length && currentPuzzle?.grid[nextRow][selectedCell.col] !== "#") {
          setSelectedCell({ row: nextRow, col: selectedCell.col });
        }
      }
    }
    
    // Check completion
    checkCompletion(newGrid);
  };

  const checkCompletion = (grid: string[][]) => {
    if (!currentPuzzle) return;
    
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (currentPuzzle.grid[r][c] !== "#" && grid[r][c] !== currentPuzzle.grid[r][c]) {
          return;
        }
      }
    }
    
    setCompleted(true);
    toast.success("Puzzle completed!");
  };

  const useHint = () => {
    if (!selectedCell || !currentPuzzle || isPaused || completed) return;
    
    const correctLetter = currentPuzzle.grid[selectedCell.row][selectedCell.col];
    if (correctLetter === "#") return;
    
    const newGrid = userGrid.map((row) => [...row]);
    newGrid[selectedCell.row][selectedCell.col] = correctLetter;
    setUserGrid(newGrid);
    setHintsUsed((prev) => prev + 1);
    
    checkCompletion(newGrid);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCellNumber = (row: number, col: number): number | null => {
    const clue = currentPuzzle?.clues.find((c) => c.row === row && c.col === col);
    return clue?.number || null;
  };

  const isHighlighted = (row: number, col: number): boolean => {
    if (!selectedClue) return false;
    
    if (selectedClue.direction === "across") {
      return (
        row === selectedClue.row &&
        col >= selectedClue.col &&
        col < selectedClue.col + selectedClue.answer.length
      );
    } else {
      return (
        col === selectedClue.col &&
        row >= selectedClue.row &&
        row < selectedClue.row + selectedClue.answer.length
      );
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
            <h1 className="text-3xl font-bold mb-2">📝 Crossword Master</h1>
            <p className="text-muted-foreground mb-6">
              Educational crossword puzzles aligned with L.A.W.S. curriculum!
            </p>
          </Card>

          <div className="grid gap-4">
            {PUZZLES.map((puzzle) => (
              <Card
                key={puzzle.id}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => initGame(puzzle)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{puzzle.title}</h3>
                    <p className="text-sm text-muted-foreground">{puzzle.category}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-medium capitalize ${
                        puzzle.difficulty === "easy"
                          ? "text-green-500"
                          : puzzle.difficulty === "medium"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {puzzle.difficulty}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {puzzle.clues.length} clues
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    const baseScore = 100;
    const hintPenalty = hintsUsed * 10;
    const timePenalty = Math.floor(elapsedTime / 60) * 5;
    const finalScore = Math.max(0, baseScore - hintPenalty - timePenalty);

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Puzzle Complete!</h2>
            <p className="text-muted-foreground mb-4">{currentPuzzle?.title}</p>
            
            <div className="space-y-2 mb-4 text-sm">
              <p>Time: {formatTime(elapsedTime)}</p>
              <p>Hints used: {hintsUsed}</p>
              <p className="text-2xl font-bold text-primary">Score: {finalScore}</p>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setGameStarted(false)}>More Puzzles</Button>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/game-center")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h2 className="font-semibold">{currentPuzzle?.title}</h2>
            <span className="text-sm text-muted-foreground">
              {formatTime(elapsedTime)}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGameStarted(false)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isPaused && (
          <Card className="p-4 mb-4 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500">
            <p className="text-center font-medium">Game Paused</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Grid */}
          <Card className="p-4">
            <div className="flex flex-col items-center">
              {userGrid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => {
                    const isBlack = cell === "#" || currentPuzzle?.grid[rowIndex][colIndex] === "#";
                    const isSelected =
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                    const highlighted = isHighlighted(rowIndex, colIndex);
                    const cellNumber = getCellNumber(rowIndex, colIndex);

                    return (
                      <div
                        key={colIndex}
                        className={`
                          w-8 h-8 border flex items-center justify-center relative cursor-pointer
                          ${isBlack ? "bg-black" : "bg-white"}
                          ${isSelected ? "ring-2 ring-primary" : ""}
                          ${highlighted && !isSelected ? "bg-primary/20" : ""}
                        `}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {cellNumber && (
                          <span className="absolute top-0 left-0.5 text-[8px] text-black">
                            {cellNumber}
                          </span>
                        )}
                        {!isBlack && (
                          <span className="text-sm font-bold text-black">{cell}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="mt-4 flex gap-2">
              <Input
                value=""
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Type a letter..."
                className="text-center text-lg uppercase"
                disabled={!selectedCell || isPaused}
                autoFocus
              />
              <Button variant="outline" onClick={useHint} disabled={!selectedCell || isPaused}>
                <Lightbulb className="w-4 h-4 mr-1" />
                Hint ({hintsUsed})
              </Button>
            </div>

            {selectedClue && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>{selectedClue.number} {selectedClue.direction}:</strong>{" "}
                  {selectedClue.clue}
                </p>
              </div>
            )}
          </Card>

          {/* Clues */}
          <Card className="p-4 max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Across</h3>
                <div className="space-y-1">
                  {currentPuzzle?.clues
                    .filter((c) => c.direction === "across")
                    .sort((a, b) => a.number - b.number)
                    .map((clue) => (
                      <p
                        key={`${clue.number}-across`}
                        className={`text-sm cursor-pointer hover:bg-muted p-1 rounded ${
                          selectedClue === clue ? "bg-primary/20" : ""
                        }`}
                        onClick={() => {
                          setSelectedClue(clue);
                          setSelectedCell({ row: clue.row, col: clue.col });
                          setDirection("across");
                        }}
                      >
                        <strong>{clue.number}.</strong> {clue.clue}
                      </p>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Down</h3>
                <div className="space-y-1">
                  {currentPuzzle?.clues
                    .filter((c) => c.direction === "down")
                    .sort((a, b) => a.number - b.number)
                    .map((clue) => (
                      <p
                        key={`${clue.number}-down`}
                        className={`text-sm cursor-pointer hover:bg-muted p-1 rounded ${
                          selectedClue === clue ? "bg-primary/20" : ""
                        }`}
                        onClick={() => {
                          setSelectedClue(clue);
                          setSelectedCell({ row: clue.row, col: clue.col });
                          setDirection("down");
                        }}
                      >
                        <strong>{clue.number}.</strong> {clue.clue}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
