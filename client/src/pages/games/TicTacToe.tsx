import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RotateCcw, Trophy, Brain, Zap } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useGameCompletion } from "@/hooks/useGameCompletion";

type Player = "X" | "O" | null;
type Board = Player[];
type Difficulty = "easy" | "medium" | "hard";

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [tokensAwarded, setTokensAwarded] = useState(false);
  const { completeGame } = useGameCompletion();

  const checkWinner = (squares: Board): { winner: Player; line: number[] | null } => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: combo };
      }
    }
    return { winner: null, line: null };
  };

  const isBoardFull = (squares: Board): boolean => {
    return squares.every((square) => square !== null);
  };

  const getEmptySquares = (squares: Board): number[] => {
    return squares.reduce<number[]>((acc, square, idx) => {
      if (square === null) acc.push(idx);
      return acc;
    }, []);
  };

  // Minimax algorithm for hard difficulty
  const minimax = (squares: Board, depth: number, isMaximizing: boolean): number => {
    const { winner } = checkWinner(squares);
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    if (isBoardFull(squares)) return 0;

    const emptySquares = getEmptySquares(squares);
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const idx of emptySquares) {
        squares[idx] = "O";
        bestScore = Math.max(bestScore, minimax(squares, depth + 1, false));
        squares[idx] = null;
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const idx of emptySquares) {
        squares[idx] = "X";
        bestScore = Math.min(bestScore, minimax(squares, depth + 1, true));
        squares[idx] = null;
      }
      return bestScore;
    }
  };

  const getAIMove = (squares: Board): number => {
    const emptySquares = getEmptySquares(squares);
    if (emptySquares.length === 0) return -1;

    if (difficulty === "easy") {
      // Random move
      return emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }

    if (difficulty === "medium") {
      // 50% chance of optimal move, 50% random
      if (Math.random() < 0.5) {
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
      }
    }

    // Hard difficulty or medium's optimal move
    let bestScore = -Infinity;
    let bestMove = emptySquares[0];

    for (const idx of emptySquares) {
      const newSquares = [...squares];
      newSquares[idx] = "O";
      const score = minimax(newSquares, 0, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }

    return bestMove;
  };

  const handleClick = (idx: number) => {
    if (board[idx] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[idx] = "X";
    setBoard(newBoard);

    const { winner: gameWinner, line } = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      setScores((prev) => ({ ...prev, player: prev.player + 1 }));
      toast.success("You win! 🎉");
      // Award tokens for winning
      if (!tokensAwarded) {
        setTokensAwarded(true);
        completeGame({ gameSlug: "tic-tac-toe", won: true, score: 100, difficulty });
      }
      return;
    }

    if (isBoardFull(newBoard)) {
      setWinner("draw");
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      toast.info("It's a draw!");
      // Award tokens for draw
      if (!tokensAwarded) {
        setTokensAwarded(true);
        completeGame({ gameSlug: "tic-tac-toe", won: false, score: 50, difficulty });
      }
      return;
    }

    setIsPlayerTurn(false);
  };

  // AI move effect
  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board);
        if (aiMove !== -1) {
          const newBoard = [...board];
          newBoard[aiMove] = "O";
          setBoard(newBoard);

          const { winner: gameWinner, line } = checkWinner(newBoard);
          if (gameWinner) {
            setWinner(gameWinner);
            setWinningLine(line);
            setScores((prev) => ({ ...prev, ai: prev.ai + 1 }));
            toast.error("AI wins! Try again.");
          } else if (isBoardFull(newBoard)) {
            setWinner("draw");
            setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
            toast.info("It's a draw!");
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, board]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningLine(null);
    setTokensAwarded(false);
  };

  const resetAll = () => {
    resetGame();
    setScores({ player: 0, ai: 0, draws: 0 });
  };

  const getCellStyle = (idx: number) => {
    const isWinningCell = winningLine?.includes(idx);
    const baseStyle = "w-20 h-20 md:w-24 md:h-24 text-4xl md:text-5xl font-bold rounded-lg transition-all duration-200";
    
    if (isWinningCell) {
      return `${baseStyle} bg-green-500/20 border-2 border-green-500`;
    }
    
    if (board[idx] === "X") {
      return `${baseStyle} bg-blue-500/10 text-blue-600 hover:bg-blue-500/20`;
    }
    
    if (board[idx] === "O") {
      return `${baseStyle} bg-red-500/10 text-red-600`;
    }
    
    return `${baseStyle} bg-secondary hover:bg-secondary/80`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tic-Tac-Toe</h1>
              <p className="text-sm text-muted-foreground">Classic strategy game</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Brain className="w-3 h-3" />
            {difficulty === "easy" ? "Easy" : difficulty === "medium" ? "Medium" : "Hard"}
          </Badge>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{scores.player}</p>
              <p className="text-sm text-muted-foreground">You (X)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-muted-foreground">{scores.draws}</p>
              <p className="text-sm text-muted-foreground">Draws</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-red-600">{scores.ai}</p>
              <p className="text-sm text-muted-foreground">AI (O)</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {winner ? (
                    winner === "draw" ? (
                      "It's a Draw!"
                    ) : winner === "X" ? (
                      <>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        You Win!
                      </>
                    ) : (
                      "AI Wins!"
                    )
                  ) : isPlayerTurn ? (
                    "Your Turn"
                  ) : (
                    <>
                      <Zap className="w-5 h-5 animate-pulse" />
                      AI Thinking...
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {winner ? "Click 'New Game' to play again" : "Click a square to make your move"}
                </CardDescription>
              </div>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {/* Board */}
              <div className="grid grid-cols-3 gap-2">
                {board.map((cell, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleClick(idx)}
                    disabled={!!cell || !!winner || !isPlayerTurn}
                    className={getCellStyle(idx)}
                  >
                    {cell}
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex gap-2 mt-4">
                <Button onClick={resetGame} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  New Game
                </Button>
                <Button onClick={resetAll} variant="ghost">
                  Reset Scores
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
            <p>• You play as X, the AI plays as O</p>
            <p>• Click any empty square to place your mark</p>
            <p>• Get three in a row (horizontal, vertical, or diagonal) to win</p>
            <p>• Change difficulty to adjust AI intelligence</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
