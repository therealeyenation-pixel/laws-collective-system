import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RotateCcw, Trophy, Brain, Zap, Users, Wifi, Building2, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import GameModeSelector, { GameMode, Difficulty, AIPersonality } from "@/components/games/GameModeSelector";

type Player = "red" | "yellow" | null;
type Board = Player[][];

const ROWS = 6;
const COLS = 7;

export default function ConnectFour() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [aiPersonality, setAIPersonality] = useState<AIPersonality>("balanced");
  
  const [board, setBoard] = useState<Board>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<"red" | "yellow">("red");
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0, draws: 0 });
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [teachingHint, setTeachingHint] = useState<string | null>(null);

  const checkWinner = (board: Board, row: number, col: number): { winner: Player; cells: [number, number][] } | null => {
    const player = board[row][col];
    if (!player) return null;

    const directions = [
      [0, 1],   // Horizontal
      [1, 0],   // Vertical
      [1, 1],   // Diagonal down-right
      [1, -1],  // Diagonal down-left
    ];

    for (const [dr, dc] of directions) {
      const cells: [number, number][] = [[row, col]];
      
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        cells.push([r, c]);
        r += dr;
        c += dc;
      }
      
      r = row - dr;
      c = col - dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        cells.push([r, c]);
        r -= dr;
        c -= dc;
      }

      if (cells.length >= 4) {
        return { winner: player, cells };
      }
    }

    return null;
  };

  const isBoardFull = (board: Board): boolean => {
    return board[0].every((cell) => cell !== null);
  };

  const getValidColumns = (board: Board): number[] => {
    return board[0].reduce<number[]>((acc, cell, col) => {
      if (cell === null) acc.push(col);
      return acc;
    }, []);
  };

  const dropPiece = (board: Board, col: number, player: Player): { newBoard: Board; row: number } | null => {
    const newBoard = board.map((row) => [...row]);
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = player;
        return { newBoard, row };
      }
    }
    return null;
  };

  const evaluatePosition = (board: Board, player: Player): number => {
    let score = 0;
    const opponent = player === "red" ? "yellow" : "red";

    const centerCol = Math.floor(COLS / 2);
    for (let row = 0; row < ROWS; row++) {
      if (board[row][centerCol] === player) score += 3;
    }

    const checkWindow = (window: Player[]): number => {
      const playerCount = window.filter((c) => c === player).length;
      const emptyCount = window.filter((c) => c === null).length;
      const opponentCount = window.filter((c) => c === opponent).length;

      if (playerCount === 4) return 100;
      if (playerCount === 3 && emptyCount === 1) return 5;
      if (playerCount === 2 && emptyCount === 2) return 2;
      if (opponentCount === 3 && emptyCount === 1) return -4;
      return 0;
    };

    // Horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        const window = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
        score += checkWindow(window);
      }
    }

    // Vertical
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row <= ROWS - 4; row++) {
        const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
        score += checkWindow(window);
      }
    }

    // Diagonal (positive slope)
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        const window = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
        score += checkWindow(window);
      }
    }

    // Diagonal (negative slope)
    for (let row = 3; row < ROWS; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        const window = [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3]];
        score += checkWindow(window);
      }
    }

    return score;
  };

  const minimax = (board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
    const validCols = getValidColumns(board);
    
    for (const col of validCols) {
      const result = dropPiece(board, col, isMaximizing ? "yellow" : "red");
      if (result) {
        const winResult = checkWinner(result.newBoard, result.row, col);
        result.newBoard[result.row][col] = null;
        if (winResult) {
          return isMaximizing ? -10000 + depth : 10000 - depth;
        }
      }
    }

    if (validCols.length === 0 || depth === 0) {
      return evaluatePosition(board, "yellow");
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const col of validCols) {
        const result = dropPiece(board, col, "yellow");
        if (result) {
          const evalScore = minimax(result.newBoard, depth - 1, alpha, beta, false);
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const col of validCols) {
        const result = dropPiece(board, col, "red");
        if (result) {
          const evalScore = minimax(result.newBoard, depth - 1, alpha, beta, true);
          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) break;
        }
      }
      return minEval;
    }
  };

  const findWinningMove = (board: Board, player: Player): number | null => {
    const validCols = getValidColumns(board);
    for (const col of validCols) {
      const result = dropPiece(board, col, player);
      if (result) {
        const winResult = checkWinner(result.newBoard, result.row, col);
        if (winResult) return col;
      }
    }
    return null;
  };

  const getAIMove = (board: Board): { col: number; explanation?: string } => {
    const validCols = getValidColumns(board);
    if (validCols.length === 0) return { col: -1 };

    // Easy: random moves
    if (difficulty === "easy") {
      const col = validCols[Math.floor(Math.random() * validCols.length)];
      return { col, explanation: "I'm playing randomly to give you practice!" };
    }

    // Check for immediate win
    const winMove = findWinningMove(board, "yellow");
    if (winMove !== null) {
      return { col: winMove, explanation: "I found a winning move!" };
    }

    // Check for immediate block
    const blockMove = findWinningMove(board, "red");
    if (blockMove !== null) {
      return { col: blockMove, explanation: "I need to block your winning move!" };
    }

    // Apply personality
    if (aiPersonality === "aggressive") {
      // Prefer center and attacking positions
      const centerCol = Math.floor(COLS / 2);
      if (validCols.includes(centerCol)) {
        return { col: centerCol, explanation: "Taking the center for offensive control!" };
      }
    }

    if (aiPersonality === "defensive") {
      // Look for threats two moves ahead
      for (const col of validCols) {
        const result = dropPiece(board, col, "yellow");
        if (result) {
          // Check if this blocks a potential threat
          const threatCount = validCols.filter(c => {
            const r = dropPiece(result.newBoard, c, "red");
            if (r) {
              const win = checkWinner(r.newBoard, r.row, c);
              return win !== null;
            }
            return false;
          }).length;
          if (threatCount === 0) {
            return { col, explanation: "Playing defensively to prevent future threats." };
          }
        }
      }
    }

    if (aiPersonality === "random") {
      const col = validCols[Math.floor(Math.random() * validCols.length)];
      return { col, explanation: "Playing unpredictably!" };
    }

    // Standard minimax for balanced/teaching
    const depth = difficulty === "medium" ? 3 : 5;
    let bestScore = -Infinity;
    let bestCol = validCols[0];

    for (const col of validCols) {
      const result = dropPiece(board, col, "yellow");
      if (result) {
        const score = minimax(result.newBoard, depth, -Infinity, Infinity, false);
        if (score > bestScore) {
          bestScore = score;
          bestCol = col;
        }
      }
    }

    let explanation = "Playing the optimal move based on position analysis.";
    if (aiPersonality === "teaching") {
      if (bestCol === Math.floor(COLS / 2)) {
        explanation = "Tip: The center column gives the most winning opportunities!";
      } else {
        explanation = "Tip: I'm building towards multiple winning paths. Watch for diagonal threats!";
      }
    }

    return { col: bestCol, explanation };
  };

  const handleColumnClick = (col: number) => {
    if (winner || isAIThinking) return;
    if (gameMode === "ai" && currentPlayer !== "red") return;

    const result = dropPiece(board, col, currentPlayer);
    if (!result) return;

    setBoard(result.newBoard);
    setTeachingHint(null);

    const winResult = checkWinner(result.newBoard, result.row, col);
    if (winResult) {
      setWinner(winResult.winner);
      setWinningCells(winResult.cells);
      if (currentPlayer === "red") {
        setScores((prev) => ({ ...prev, player1: prev.player1 + 1 }));
        toast.success(gameMode === "local" ? "Red wins! 🎉" : "You win! 🎉");
      } else {
        setScores((prev) => ({ ...prev, player2: prev.player2 + 1 }));
        toast.success(gameMode === "local" ? "Yellow wins! 🎉" : "AI wins!");
      }
      return;
    }

    if (isBoardFull(result.newBoard)) {
      setWinner("draw");
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      toast.info("It's a draw!");
      return;
    }

    setCurrentPlayer(currentPlayer === "red" ? "yellow" : "red");
  };

  // AI move effect
  useEffect(() => {
    if (gameMode === "ai" && currentPlayer === "yellow" && !winner && gameStarted) {
      setIsAIThinking(true);
      const timer = setTimeout(() => {
        const { col: aiCol, explanation } = getAIMove(board);
        if (aiCol !== -1) {
          const result = dropPiece(board, aiCol, "yellow");
          if (result) {
            setBoard(result.newBoard);

            if (aiPersonality === "teaching" && explanation) {
              setTeachingHint(explanation);
            }

            const winResult = checkWinner(result.newBoard, result.row, aiCol);
            if (winResult) {
              setWinner(winResult.winner);
              setWinningCells(winResult.cells);
              setScores((prev) => ({ ...prev, player2: prev.player2 + 1 }));
              toast.error("AI wins! Try again.");
            } else if (isBoardFull(result.newBoard)) {
              setWinner("draw");
              setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
              toast.info("It's a draw!");
            } else {
              setCurrentPlayer("red");
            }
          }
        }
        setIsAIThinking(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, gameStarted, gameMode]);

  const handleStartGame = (mode: GameMode, diff: Difficulty, personality: AIPersonality) => {
    setGameMode(mode);
    setDifficulty(diff);
    setAIPersonality(personality);
    setGameStarted(true);
    resetGame();
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer("red");
    setWinner(null);
    setWinningCells([]);
    setIsAIThinking(false);
    setTeachingHint(null);
  };

  const backToModeSelect = () => {
    setGameStarted(false);
    setScores({ player1: 0, player2: 0, draws: 0 });
    resetGame();
  };

  const isWinningCell = (row: number, col: number): boolean => {
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  const getModeIcon = () => {
    switch (gameMode) {
      case "ai": return <Brain className="w-3 h-3" />;
      case "local": return <Users className="w-3 h-3" />;
      case "online": return <Wifi className="w-3 h-3" />;
      case "intrasystem": return <Building2 className="w-3 h-3" />;
    }
  };

  const getModeLabel = () => {
    switch (gameMode) {
      case "ai": return `vs AI (${difficulty})`;
      case "local": return "Local 2P";
      case "online": return "Online";
      case "intrasystem": return "House Battle";
    }
  };

  const getPlayer1Label = () => {
    if (gameMode === "local") return "Red";
    return "You (Red)";
  };

  const getPlayer2Label = () => {
    if (gameMode === "local") return "Yellow";
    if (gameMode === "ai") return `AI (${aiPersonality})`;
    return "Opponent (Yellow)";
  };

  if (!gameStarted) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Connect Four</h1>
              <p className="text-sm text-muted-foreground">Get 4 in a row to win</p>
            </div>
          </div>
          
          <GameModeSelector
            gameName="Connect Four"
            onStartGame={handleStartGame}
            supportedModes={["ai", "local", "online", "intrasystem"]}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={backToModeSelect}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Connect Four</h1>
              <p className="text-sm text-muted-foreground">Get 4 in a row to win</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            {getModeIcon()}
            {getModeLabel()}
          </Badge>
        </div>

        {/* Teaching Hint */}
        {aiPersonality === "teaching" && teachingHint && (
          <Card className="border-blue-500/50 bg-blue-500/10">
            <CardContent className="py-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                <p className="text-sm">{teachingHint}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scores */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-red-500">{scores.player1}</p>
              <p className="text-sm text-muted-foreground">{getPlayer1Label()}</p>
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
              <p className="text-3xl font-bold text-yellow-500">{scores.player2}</p>
              <p className="text-sm text-muted-foreground">{getPlayer2Label()}</p>
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
                    ) : winner === "red" ? (
                      <>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {gameMode === "local" ? "Red Wins!" : "You Win!"}
                      </>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {gameMode === "local" ? "Yellow Wins!" : "AI Wins!"}
                      </>
                    )
                  ) : isAIThinking ? (
                    <>
                      <Zap className="w-5 h-5 animate-pulse" />
                      AI Thinking...
                    </>
                  ) : (
                    <>
                      <div className={`w-4 h-4 rounded-full ${currentPlayer === "red" ? "bg-red-500" : "bg-yellow-400"}`} />
                      {gameMode === "local" 
                        ? `${currentPlayer === "red" ? "Red" : "Yellow"}'s Turn`
                        : currentPlayer === "red" ? "Your Turn" : "AI's Turn"
                      }
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {winner ? "Click 'New Game' to play again" : "Click a column to drop your piece"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {/* Board */}
              <div className="bg-blue-600 p-2 rounded-lg">
                <div className="grid grid-cols-7 gap-1">
                  {board.map((row, rowIdx) =>
                    row.map((cell, colIdx) => (
                      <button
                        key={`${rowIdx}-${colIdx}`}
                        onClick={() => handleColumnClick(colIdx)}
                        disabled={!!winner || isAIThinking || (gameMode === "ai" && currentPlayer !== "red")}
                        className={`
                          w-10 h-10 md:w-12 md:h-12 rounded-full
                          transition-all duration-200
                          ${
                            cell === "red"
                              ? "bg-red-500"
                              : cell === "yellow"
                              ? "bg-yellow-400"
                              : "bg-white hover:bg-gray-100"
                          }
                          ${isWinningCell(rowIdx, colIdx) ? "ring-4 ring-green-400 animate-pulse" : ""}
                        `}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2 mt-4">
                <Button onClick={resetGame} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  New Game
                </Button>
                <Button onClick={backToModeSelect} variant="ghost">
                  Change Mode
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
            <p>• {gameMode === "local" ? "Red plays first, then Yellow" : "You play as Red, the AI plays as Yellow"}</p>
            <p>• Click any column to drop your piece</p>
            <p>• Pieces fall to the lowest available spot</p>
            <p>• Connect 4 pieces in a row (horizontal, vertical, or diagonal) to win</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
