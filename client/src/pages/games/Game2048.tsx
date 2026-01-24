import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useGameCompletion } from "@/hooks/useGameCompletion";

type Board = number[][];
type Direction = "up" | "down" | "left" | "right";

const GRID_SIZE = 4;

const tileColors: Record<number, string> = {
  0: "bg-gray-200 dark:bg-gray-700",
  2: "bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100",
  4: "bg-amber-100 dark:bg-amber-900 text-gray-800 dark:text-amber-100",
  8: "bg-orange-300 dark:bg-orange-700 text-white",
  16: "bg-orange-400 dark:bg-orange-600 text-white",
  32: "bg-orange-500 dark:bg-orange-500 text-white",
  64: "bg-red-500 dark:bg-red-600 text-white",
  128: "bg-yellow-400 dark:bg-yellow-600 text-white",
  256: "bg-yellow-500 dark:bg-yellow-500 text-white",
  512: "bg-yellow-600 dark:bg-yellow-400 text-white",
  1024: "bg-green-500 dark:bg-green-600 text-white",
  2048: "bg-green-600 dark:bg-green-500 text-white font-bold",
};

export default function Game2048() {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [continueAfterWin, setContinueAfterWin] = useState(false);
  const [tokensAwarded, setTokensAwarded] = useState(false);
  const { completeGame } = useGameCompletion();

  const createEmptyBoard = (): Board => {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  };

  const addRandomTile = (board: Board): Board => {
    const newBoard = board.map(row => [...row]);
    const emptyCells: { row: number; col: number }[] = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newBoard[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
    }

    return newBoard;
  };

  const initializeGame = useCallback(() => {
    let newBoard = createEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setContinueAfterWin(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const slideRow = (row: number[]): { newRow: number[]; points: number } => {
    // Remove zeros
    let filtered = row.filter(val => val !== 0);
    let points = 0;
    
    // Merge adjacent equal values
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        points += filtered[i];
        filtered.splice(i + 1, 1);
      }
    }
    
    // Pad with zeros
    while (filtered.length < GRID_SIZE) {
      filtered.push(0);
    }
    
    return { newRow: filtered, points };
  };

  const rotateBoard = (board: Board, times: number): Board => {
    let result = board.map(row => [...row]);
    for (let t = 0; t < times; t++) {
      const rotated: Board = createEmptyBoard();
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          rotated[col][GRID_SIZE - 1 - row] = result[row][col];
        }
      }
      result = rotated;
    }
    return result;
  };

  const move = (direction: Direction): boolean => {
    if (gameOver) return false;

    let rotations = 0;
    switch (direction) {
      case "left": rotations = 0; break;
      case "up": rotations = 1; break;
      case "right": rotations = 2; break;
      case "down": rotations = 3; break;
    }

    let workingBoard = rotateBoard(board, rotations);
    let totalPoints = 0;
    let moved = false;

    const newBoard = workingBoard.map(row => {
      const { newRow, points } = slideRow(row);
      totalPoints += points;
      if (JSON.stringify(row) !== JSON.stringify(newRow)) {
        moved = true;
      }
      return newRow;
    });

    if (!moved) return false;

    // Rotate back
    let finalBoard = rotateBoard(newBoard, (4 - rotations) % 4);
    finalBoard = addRandomTile(finalBoard);

    setBoard(finalBoard);
    setScore(prev => {
      const newScore = prev + totalPoints;
      if (newScore > bestScore) {
        setBestScore(newScore);
      }
      return newScore;
    });

    // Check for 2048 win
    if (!won && !continueAfterWin) {
      const has2048 = finalBoard.some(row => row.some(cell => cell >= 2048));
      if (has2048) {
        setWon(true);
        toast.success("Congratulations! You reached 2048! 🎉");
        // Award tokens for winning
        if (!tokensAwarded) {
          setTokensAwarded(true);
          completeGame({ gameSlug: "2048", won: true, score: prev + totalPoints });
        }
      }
    }

    // Check for game over
    if (!canMove(finalBoard)) {
      setGameOver(true);
      toast.error("Game Over! No more moves available.");
      // Award tokens for game completion
      if (!tokensAwarded) {
        setTokensAwarded(true);
        completeGame({ gameSlug: "2048", won: false, score: prev + totalPoints });
      }
    }

    return true;
  };

  const canMove = (board: Board): boolean => {
    // Check for empty cells
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col] === 0) return true;
      }
    }

    // Check for possible merges
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const current = board[row][col];
        if (col < GRID_SIZE - 1 && current === board[row][col + 1]) return true;
        if (row < GRID_SIZE - 1 && current === board[row + 1][col]) return true;
      }
    }

    return false;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (won && !continueAfterWin) return;
      
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          move("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          move("down");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          move("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          move("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, gameOver, won, continueAfterWin]);

  const handleContinue = () => {
    setContinueAfterWin(true);
    setWon(false);
  };

  const getTileStyle = (value: number) => {
    const baseStyle = "w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center font-bold text-lg md:text-xl transition-all ";
    return baseStyle + (tileColors[value] || "bg-purple-500 text-white");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">2048</h1>
              <p className="text-sm text-muted-foreground">Merge tiles to reach 2048</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Trophy className="w-3 h-3 text-yellow-500" />
            Best: {bestScore}
          </Badge>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold">{score}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold">{bestScore}</p>
              <p className="text-xs text-muted-foreground">Best</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {gameOver ? (
                "Game Over!"
              ) : won ? (
                <>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  You Win!
                </>
              ) : (
                "2048"
              )}
            </CardTitle>
            <CardDescription>
              {gameOver
                ? `Final Score: ${score}`
                : won
                ? "Keep going or start a new game"
                : "Use arrow keys to merge tiles"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {/* Board */}
              <div className="bg-gray-300 dark:bg-gray-800 p-2 rounded-lg">
                <div className="grid grid-cols-4 gap-2">
                  {board.map((row, rowIdx) =>
                    row.map((cell, colIdx) => (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className={getTileStyle(cell)}
                      >
                        {cell > 0 ? cell : ""}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Win Overlay */}
              {won && !continueAfterWin && (
                <div className="flex gap-2">
                  <Button onClick={handleContinue} className="gap-2">
                    Keep Playing
                  </Button>
                  <Button onClick={initializeGame} variant="outline" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    New Game
                  </Button>
                </div>
              )}

              {/* Mobile Controls */}
              <div className="grid grid-cols-3 gap-2 md:hidden">
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => move("up")}
                  disabled={gameOver || (won && !continueAfterWin)}
                >
                  <ArrowUp className="w-5 h-5" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => move("left")}
                  disabled={gameOver || (won && !continueAfterWin)}
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => move("down")}
                  disabled={gameOver || (won && !continueAfterWin)}
                >
                  <ArrowDown className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => move("right")}
                  disabled={gameOver || (won && !continueAfterWin)}
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Controls */}
              {(gameOver || continueAfterWin || !won) && (
                <Button onClick={initializeGame} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  New Game
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Use arrow keys (or WASD) to slide all tiles</p>
            <p>• Tiles with the same number merge when they collide</p>
            <p>• Add them up to reach 2048!</p>
            <p>• Game ends when no more moves are possible</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
