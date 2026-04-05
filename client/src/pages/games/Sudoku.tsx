import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RotateCcw, Trophy, Clock, Lightbulb, Eraser, Check } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type Difficulty = "easy" | "medium" | "hard";
type Cell = { value: number | null; isOriginal: boolean; isError: boolean };
type Board = Cell[][];

const difficultySettings: Record<Difficulty, number> = {
  easy: 38,    // 38 cells filled
  medium: 30,  // 30 cells filled
  hard: 24,    // 24 cells filled
};

export default function Sudoku() {
  const [board, setBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Generate a valid Sudoku solution
  const generateSolution = (): number[][] => {
    const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));
    
    const isValid = (grid: number[][], row: number, col: number, num: number): boolean => {
      // Check row
      for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
      }
      // Check column
      for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
      }
      // Check 3x3 box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (grid[boxRow + i][boxCol + j] === num) return false;
        }
      }
      return true;
    };

    const solve = (grid: number[][]): boolean => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0) {
            const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (const num of nums) {
              if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (solve(grid)) return true;
                grid[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    solve(grid);
    return grid;
  };

  // Create puzzle by removing numbers from solution
  const createPuzzle = (solution: number[][], cellsToKeep: number): Board => {
    const puzzle: Board = solution.map((row) =>
      row.map((value) => ({ value, isOriginal: true, isError: false }))
    );

    const positions: [number, number][] = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        positions.push([i, j]);
      }
    }
    
    // Shuffle positions
    positions.sort(() => Math.random() - 0.5);
    
    // Remove cells
    const cellsToRemove = 81 - cellsToKeep;
    for (let i = 0; i < cellsToRemove; i++) {
      const [row, col] = positions[i];
      puzzle[row][col] = { value: null, isOriginal: false, isError: false };
    }

    return puzzle;
  };

  const initializeGame = () => {
    const newSolution = generateSolution();
    const newPuzzle = createPuzzle(newSolution, difficultySettings[difficulty]);
    setSolution(newSolution);
    setBoard(newPuzzle);
    setSelectedCell(null);
    setTimer(0);
    setGameStarted(false);
    setGameComplete(false);
    setHintsUsed(0);
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameComplete]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted) setGameStarted(true);
    if (board[row][col].isOriginal) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number | null) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    if (board[row][col].isOriginal) return;

    const newBoard = board.map((r) => r.map((c) => ({ ...c })));
    newBoard[row][col].value = num;
    newBoard[row][col].isError = num !== null && num !== solution[row][col];
    setBoard(newBoard);

    // Check if puzzle is complete
    const isComplete = newBoard.every((row, rowIdx) =>
      row.every((cell, colIdx) => cell.value === solution[rowIdx][colIdx])
    );

    if (isComplete) {
      setGameComplete(true);
      toast.success("Congratulations! Puzzle solved! 🎉");
    }
  };

  const handleHint = () => {
    if (!selectedCell) {
      toast.info("Select a cell first to get a hint");
      return;
    }
    const [row, col] = selectedCell;
    if (board[row][col].isOriginal) {
      toast.info("This cell is already filled");
      return;
    }

    const newBoard = board.map((r) => r.map((c) => ({ ...c })));
    newBoard[row][col].value = solution[row][col];
    newBoard[row][col].isError = false;
    setBoard(newBoard);
    setHintsUsed((prev) => prev + 1);
    toast.success(`Hint: The answer is ${solution[row][col]}`);
  };

  const handleClear = () => {
    if (!selectedCell) return;
    handleNumberInput(null);
  };

  const handleCheck = () => {
    const newBoard = board.map((row, rowIdx) =>
      row.map((cell, colIdx) => ({
        ...cell,
        isError: cell.value !== null && cell.value !== solution[rowIdx][colIdx],
      }))
    );
    setBoard(newBoard);
    
    const errors = newBoard.flat().filter((c) => c.isError).length;
    if (errors === 0) {
      toast.success("All filled cells are correct!");
    } else {
      toast.error(`Found ${errors} error${errors > 1 ? "s" : ""}`);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCellStyle = (row: number, col: number) => {
    const cell = board[row]?.[col];
    if (!cell) return "";
    
    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    const isInSameRow = selectedCell && selectedCell[0] === row;
    const isInSameCol = selectedCell && selectedCell[1] === col;
    const isInSameBox = selectedCell && 
      Math.floor(selectedCell[0] / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell[1] / 3) === Math.floor(col / 3);

    let baseStyle = "w-9 h-9 md:w-10 md:h-10 text-lg font-semibold flex items-center justify-center transition-all ";
    
    if (isSelected) {
      baseStyle += "bg-primary/30 ";
    } else if (isInSameRow || isInSameCol || isInSameBox) {
      baseStyle += "bg-secondary/50 ";
    } else {
      baseStyle += "bg-background ";
    }

    if (cell.isError) {
      baseStyle += "text-red-500 ";
    } else if (cell.isOriginal) {
      baseStyle += "text-foreground ";
    } else {
      baseStyle += "text-blue-600 ";
    }

    // Border styling for 3x3 boxes
    if (col % 3 === 2 && col !== 8) baseStyle += "border-r-2 border-r-foreground/30 ";
    if (row % 3 === 2 && row !== 8) baseStyle += "border-b-2 border-b-foreground/30 ";

    return baseStyle;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sudoku</h1>
              <p className="text-sm text-muted-foreground">Fill the grid with 1-9</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(timer)}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{formatTime(timer)}</p>
              <p className="text-xs text-muted-foreground">Time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{hintsUsed}</p>
              <p className="text-xs text-muted-foreground">Hints Used</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Difficulty</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {gameComplete ? (
                <>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Puzzle Solved!
                </>
              ) : (
                "Sudoku Puzzle"
              )}
            </CardTitle>
            <CardDescription>
              {gameComplete
                ? `Completed in ${formatTime(timer)} with ${hintsUsed} hints`
                : "Click a cell and enter a number"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {/* Sudoku Grid */}
              <div className="border-2 border-foreground/30 rounded">
                <div className="grid grid-cols-9">
                  {board.map((row, rowIdx) =>
                    row.map((cell, colIdx) => (
                      <button
                        key={`${rowIdx}-${colIdx}`}
                        onClick={() => handleCellClick(rowIdx, colIdx)}
                        disabled={cell.isOriginal || gameComplete}
                        className={getCellStyle(rowIdx, colIdx)}
                      >
                        {cell.value || ""}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-9 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    size="sm"
                    onClick={() => handleNumberInput(num)}
                    disabled={!selectedCell || gameComplete}
                    className="w-9 h-9"
                  >
                    {num}
                  </Button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex gap-2 flex-wrap justify-center">
                <Button onClick={handleHint} variant="outline" size="sm" className="gap-1">
                  <Lightbulb className="w-4 h-4" />
                  Hint
                </Button>
                <Button onClick={handleClear} variant="outline" size="sm" className="gap-1">
                  <Eraser className="w-4 h-4" />
                  Clear
                </Button>
                <Button onClick={handleCheck} variant="outline" size="sm" className="gap-1">
                  <Check className="w-4 h-4" />
                  Check
                </Button>
                <Button onClick={initializeGame} variant="outline" size="sm" className="gap-1">
                  <RotateCcw className="w-4 h-4" />
                  New Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Fill each row, column, and 3x3 box with numbers 1-9</p>
            <p>• Each number can only appear once in each row, column, and box</p>
            <p>• Click a cell to select it, then click a number to fill it</p>
            <p>• Use hints if you get stuck (but try to solve it yourself!)</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
