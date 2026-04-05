import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Brain, Zap, Users, Bot, Swords, Shield, GraduationCap } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useGameCompletion } from "@/hooks/useGameCompletion";
import { GameModeSelector, GameConfig, GameMode, Difficulty, AIPersonality } from "@/components/games/GameModeSelector";

type Player = "X" | "O" | null;
type Board = Player[];

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];

export default function TicTacToe() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0, draws: 0 });
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [tokensAwarded, setTokensAwarded] = useState(false);
  const [teachingHint, setTeachingHint] = useState<string | null>(null);
  const { completeGame } = useGameCompletion();

  const isAIMode = gameConfig?.mode === "ai";
  const isLocalMode = gameConfig?.mode === "local";
  const difficulty = gameConfig?.difficulty || "medium";
  const personality = gameConfig?.personality || "balanced";

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

  // Minimax algorithm
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

  // Find winning move for a player
  const findWinningMove = (squares: Board, player: Player): number | null => {
    const emptySquares = getEmptySquares(squares);
    for (const idx of emptySquares) {
      const testBoard = [...squares];
      testBoard[idx] = player;
      const { winner } = checkWinner(testBoard);
      if (winner === player) return idx;
    }
    return null;
  };

  // Get AI move based on difficulty and personality
  const getAIMove = (squares: Board): { move: number; explanation?: string } => {
    const emptySquares = getEmptySquares(squares);
    if (emptySquares.length === 0) return { move: -1 };

    // Teaching mode - always explain
    let explanation: string | undefined;

    // Check for winning move
    const winMove = findWinningMove(squares, "O");
    // Check for blocking move
    const blockMove = findWinningMove(squares, "X");

    // Personality-based behavior
    if (personality === "random") {
      const move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
      return { move, explanation: "Random move for unpredictability!" };
    }

    if (personality === "aggressive") {
      // Prioritize winning, then center, then corners
      if (winMove !== null) {
        return { move: winMove, explanation: "Going for the win!" };
      }
      if (squares[4] === null) {
        return { move: 4, explanation: "Taking the center for control!" };
      }
      const corners = [0, 2, 6, 8].filter(i => squares[i] === null);
      if (corners.length > 0) {
        return { move: corners[Math.floor(Math.random() * corners.length)], explanation: "Grabbing a corner for offense!" };
      }
    }

    if (personality === "defensive") {
      // Prioritize blocking, then safe moves
      if (blockMove !== null) {
        return { move: blockMove, explanation: "Blocking your winning move!" };
      }
      if (winMove !== null) {
        return { move: winMove, explanation: "Taking the win since you're blocked!" };
      }
    }

    // Difficulty-based logic
    if (difficulty === "easy") {
      const move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
      explanation = personality === "teaching" ? "Easy mode: I'm making a random move." : undefined;
      return { move, explanation };
    }

    if (difficulty === "medium") {
      // Block wins, take wins, otherwise 50% optimal
      if (winMove !== null) {
        explanation = personality === "teaching" ? "I can win here! Always check for winning moves." : undefined;
        return { move: winMove, explanation };
      }
      if (blockMove !== null) {
        explanation = personality === "teaching" ? "I need to block you! Always watch for opponent's winning moves." : undefined;
        return { move: blockMove, explanation };
      }
      if (Math.random() < 0.5) {
        const move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
        return { move, explanation: personality === "teaching" ? "Making a random move to keep things interesting." : undefined };
      }
    }

    // Hard difficulty - full minimax
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

    if (personality === "teaching") {
      if (bestMove === 4) explanation = "The center is the strongest position - it's part of 4 winning lines!";
      else if ([0, 2, 6, 8].includes(bestMove)) explanation = "Corners are strong - they're part of 3 winning lines each.";
      else explanation = "This move sets up multiple winning possibilities.";
    }

    return { move: bestMove, explanation };
  };

  const handleClick = (idx: number) => {
    if (board[idx] || winner) return;
    if (isAIMode && currentPlayer === "O") return;

    const newBoard = [...board];
    newBoard[idx] = currentPlayer;
    setBoard(newBoard);
    setTeachingHint(null);

    const { winner: gameWinner, line } = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      if (currentPlayer === "X") {
        setScores((prev) => ({ ...prev, player1: prev.player1 + 1 }));
        toast.success(isAIMode ? "You win! 🎉" : `${gameConfig?.playerNames[0]} wins! 🎉`);
        if (isAIMode && !tokensAwarded) {
          setTokensAwarded(true);
          completeGame({ gameSlug: "tic-tac-toe", won: true, score: 100, difficulty });
        }
      } else {
        setScores((prev) => ({ ...prev, player2: prev.player2 + 1 }));
        toast.success(isAIMode ? "AI wins!" : `${gameConfig?.playerNames[1]} wins! 🎉`);
      }
      return;
    }

    if (isBoardFull(newBoard)) {
      setWinner("draw");
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      toast.info("It's a draw!");
      if (isAIMode && !tokensAwarded) {
        setTokensAwarded(true);
        completeGame({ gameSlug: "tic-tac-toe", won: false, score: 50, difficulty });
      }
      return;
    }

    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  // AI move effect
  useEffect(() => {
    if (isAIMode && currentPlayer === "O" && !winner) {
      const timer = setTimeout(() => {
        const { move: aiMove, explanation } = getAIMove(board);
        if (aiMove !== -1) {
          if (personality === "teaching" && explanation) {
            setTeachingHint(explanation);
          }

          const newBoard = [...board];
          newBoard[aiMove] = "O";
          setBoard(newBoard);

          const { winner: gameWinner, line } = checkWinner(newBoard);
          if (gameWinner) {
            setWinner(gameWinner);
            setWinningLine(line);
            setScores((prev) => ({ ...prev, player2: prev.player2 + 1 }));
            toast.error("AI wins! Try again.");
          } else if (isBoardFull(newBoard)) {
            setWinner("draw");
            setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
            toast.info("It's a draw!");
          } else {
            setCurrentPlayer("X");
          }
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, board, isAIMode]);

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config);
    setGameStarted(true);
    resetGame();
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine(null);
    setTokensAwarded(false);
    setTeachingHint(null);
  };

  const resetAll = () => {
    resetGame();
    setScores({ player1: 0, player2: 0, draws: 0 });
  };

  const backToMenu = () => {
    setGameStarted(false);
    setGameConfig(null);
    resetAll();
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

  const getPersonalityIcon = () => {
    switch (personality) {
      case "aggressive": return <Swords className="w-3 h-3" />;
      case "defensive": return <Shield className="w-3 h-3" />;
      case "teaching": return <GraduationCap className="w-3 h-3" />;
      default: return <Brain className="w-3 h-3" />;
    }
  };

  // Game Mode Selection Screen
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
              <h1 className="text-2xl font-bold text-foreground">Tic-Tac-Toe</h1>
              <p className="text-sm text-muted-foreground">Choose your game mode</p>
            </div>
          </div>

          <GameModeSelector
            gameName="Tic-Tac-Toe"
            onStart={handleStartGame}
            supportedModes={["ai", "local", "online", "intrasystem"]}
            supportsDifficulty={true}
            supportsPersonality={true}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Game Screen
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={backToMenu}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tic-Tac-Toe</h1>
              <p className="text-sm text-muted-foreground">
                {isAIMode ? "Player vs AI" : isLocalMode ? "Local 2 Player" : "Multiplayer"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAIMode && (
              <>
                <Badge variant="outline" className="gap-1">
                  <Brain className="w-3 h-3" />
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {getPersonalityIcon()}
                  {personality.charAt(0).toUpperCase() + personality.slice(1)}
                </Badge>
              </>
            )}
            {isLocalMode && (
              <Badge variant="outline" className="gap-1">
                <Users className="w-3 h-3" />
                2 Players
              </Badge>
            )}
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-4">
          <Card className={currentPlayer === "X" && !winner ? "ring-2 ring-blue-500" : ""}>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{scores.player1}</p>
              <p className="text-sm text-muted-foreground">{gameConfig?.playerNames[0]} (X)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-muted-foreground">{scores.draws}</p>
              <p className="text-sm text-muted-foreground">Draws</p>
            </CardContent>
          </Card>
          <Card className={currentPlayer === "O" && !winner ? "ring-2 ring-red-500" : ""}>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-red-600">{scores.player2}</p>
              <p className="text-sm text-muted-foreground">{gameConfig?.playerNames[1]} (O)</p>
            </CardContent>
          </Card>
        </div>

        {/* Teaching Hint */}
        {teachingHint && personality === "teaching" && (
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <GraduationCap className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">AI Teaching Tip</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">{teachingHint}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                        {gameConfig?.playerNames[0]} Wins!
                      </>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {gameConfig?.playerNames[1]} Wins!
                      </>
                    )
                  ) : currentPlayer === "X" ? (
                    <>{gameConfig?.playerNames[0]}'s Turn</>
                  ) : isAIMode ? (
                    <>
                      <Zap className="w-5 h-5 animate-pulse" />
                      AI Thinking...
                    </>
                  ) : (
                    <>{gameConfig?.playerNames[1]}'s Turn</>
                  )}
                </CardTitle>
                <CardDescription>
                  {winner ? "Click 'New Game' to play again" : "Click a square to make your move"}
                </CardDescription>
              </div>
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
                    disabled={!!cell || !!winner || (isAIMode && currentPlayer === "O")}
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
                <Button onClick={backToMenu} variant="ghost">
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
            <p>• {gameConfig?.playerNames[0]} plays as X, {gameConfig?.playerNames[1]} plays as O</p>
            <p>• Click any empty square to place your mark</p>
            <p>• Get three in a row (horizontal, vertical, or diagonal) to win</p>
            {isAIMode && <p>• Current AI: {difficulty} difficulty, {personality} personality</p>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
