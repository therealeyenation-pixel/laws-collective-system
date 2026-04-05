import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Dices, Brain, Target } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type PieceColor = "white" | "black" | null;

interface Point {
  pieces: number;
  color: PieceColor;
}

interface GameState {
  points: Point[];
  bar: { white: number; black: number };
  home: { white: number; black: number };
  currentPlayer: "white" | "black";
  dice: [number, number];
  movesLeft: number[];
  gameOver: boolean;
  winner: PieceColor;
}

const initialBoard = (): Point[] => {
  const points: Point[] = Array(24).fill(null).map(() => ({ pieces: 0, color: null }));
  
  // Standard backgammon starting position
  // White pieces (moving from 24 to 1)
  points[0] = { pieces: 2, color: "white" };   // Point 1
  points[11] = { pieces: 5, color: "white" };  // Point 12
  points[16] = { pieces: 3, color: "white" };  // Point 17
  points[18] = { pieces: 5, color: "white" };  // Point 19
  
  // Black pieces (moving from 1 to 24)
  points[23] = { pieces: 2, color: "black" };  // Point 24
  points[12] = { pieces: 5, color: "black" };  // Point 13
  points[7] = { pieces: 3, color: "black" };   // Point 8
  points[5] = { pieces: 5, color: "black" };   // Point 6
  
  return points;
};

const rollDice = (): [number, number] => {
  return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
};

export default function Backgammon() {
  const [gameState, setGameState] = useState<GameState>({
    points: initialBoard(),
    bar: { white: 0, black: 0 },
    home: { white: 0, black: 0 },
    currentPlayer: "white",
    dice: [0, 0],
    movesLeft: [],
    gameOver: false,
    winner: null,
  });
  
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [validMoves, setValidMoves] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, gamesPlayed: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("backgammon_stats");
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  const saveStats = (newStats: typeof stats) => {
    localStorage.setItem("backgammon_stats", JSON.stringify(newStats));
    setStats(newStats);
  };

  const startGame = () => {
    const dice = rollDice();
    const movesLeft = dice[0] === dice[1] ? [dice[0], dice[0], dice[0], dice[0]] : [dice[0], dice[1]];
    
    setGameState({
      points: initialBoard(),
      bar: { white: 0, black: 0 },
      home: { white: 0, black: 0 },
      currentPlayer: "white",
      dice,
      movesLeft,
      gameOver: false,
      winner: null,
    });
    setGameStarted(true);
    setSelectedPoint(null);
    setValidMoves([]);
    toast.success(`Game started! You rolled ${dice[0]} and ${dice[1]}`);
  };

  const getValidMovesForPoint = useCallback((pointIndex: number, state: GameState): number[] => {
    const { points, bar, currentPlayer, movesLeft } = state;
    const moves: number[] = [];
    
    // Must move from bar first
    if (bar[currentPlayer] > 0 && pointIndex !== -1) {
      return [];
    }
    
    // Check if moving from bar
    if (pointIndex === -1 && bar[currentPlayer] > 0) {
      for (const die of [...new Set(movesLeft)]) {
        const targetPoint = currentPlayer === "white" ? 24 - die : die - 1;
        if (targetPoint >= 0 && targetPoint < 24) {
          const target = points[targetPoint];
          if (!target.color || target.color === currentPlayer || target.pieces <= 1) {
            moves.push(targetPoint);
          }
        }
      }
      return moves;
    }
    
    const point = points[pointIndex];
    if (!point || point.color !== currentPlayer || point.pieces === 0) {
      return [];
    }
    
    const direction = currentPlayer === "white" ? -1 : 1;
    
    for (const die of [...new Set(movesLeft)]) {
      const targetIndex = pointIndex + (die * direction);
      
      // Check for bearing off
      if (currentPlayer === "white" && targetIndex < 0) {
        // Can bear off if all pieces are in home board (points 0-5)
        const allInHome = points.slice(0, 6).every((p, i) => 
          !p.color || p.color === "white" || i > pointIndex
        ) && points.slice(6).every(p => p.color !== "white");
        if (allInHome && bar.white === 0) {
          moves.push(-2); // -2 represents bearing off
        }
      } else if (currentPlayer === "black" && targetIndex >= 24) {
        const allInHome = points.slice(18).every((p, i) => 
          !p.color || p.color === "black" || (18 + i) < pointIndex
        ) && points.slice(0, 18).every(p => p.color !== "black");
        if (allInHome && bar.black === 0) {
          moves.push(-2);
        }
      } else if (targetIndex >= 0 && targetIndex < 24) {
        const target = points[targetIndex];
        if (!target.color || target.color === currentPlayer || target.pieces <= 1) {
          moves.push(targetIndex);
        }
      }
    }
    
    return moves;
  }, []);

  const handlePointClick = (pointIndex: number) => {
    if (gameState.gameOver || gameState.movesLeft.length === 0) return;
    
    if (selectedPoint === null) {
      // Select a point
      const moves = getValidMovesForPoint(pointIndex, gameState);
      if (moves.length > 0) {
        setSelectedPoint(pointIndex);
        setValidMoves(moves);
      }
    } else if (selectedPoint === pointIndex) {
      // Deselect
      setSelectedPoint(null);
      setValidMoves([]);
    } else if (validMoves.includes(pointIndex)) {
      // Make move
      makeMove(selectedPoint, pointIndex);
    } else {
      // Select different point
      const moves = getValidMovesForPoint(pointIndex, gameState);
      if (moves.length > 0) {
        setSelectedPoint(pointIndex);
        setValidMoves(moves);
      }
    }
  };

  const makeMove = (from: number, to: number) => {
    setGameState(prev => {
      const newPoints = prev.points.map(p => ({ ...p }));
      const newBar = { ...prev.bar };
      const newHome = { ...prev.home };
      const newMovesLeft = [...prev.movesLeft];
      
      const direction = prev.currentPlayer === "white" ? -1 : 1;
      let dieUsed: number;
      
      if (to === -2) {
        // Bearing off
        dieUsed = prev.currentPlayer === "white" ? from + 1 : 24 - from;
        newPoints[from].pieces--;
        if (newPoints[from].pieces === 0) newPoints[from].color = null;
        newHome[prev.currentPlayer]++;
      } else {
        dieUsed = Math.abs(to - from);
        
        // Remove from source
        if (from === -1) {
          newBar[prev.currentPlayer]--;
        } else {
          newPoints[from].pieces--;
          if (newPoints[from].pieces === 0) newPoints[from].color = null;
        }
        
        // Handle hitting opponent
        if (newPoints[to].color && newPoints[to].color !== prev.currentPlayer && newPoints[to].pieces === 1) {
          newBar[newPoints[to].color]++;
          newPoints[to].pieces = 0;
          newPoints[to].color = null;
          toast.info("You hit an opponent's piece!");
        }
        
        // Add to destination
        newPoints[to].pieces++;
        newPoints[to].color = prev.currentPlayer;
      }
      
      // Remove used die
      const dieIndex = newMovesLeft.indexOf(dieUsed);
      if (dieIndex > -1) {
        newMovesLeft.splice(dieIndex, 1);
      } else {
        // Use highest die for bearing off
        newMovesLeft.sort((a, b) => b - a);
        newMovesLeft.shift();
      }
      
      // Check for win
      if (newHome[prev.currentPlayer] === 15) {
        const newStats = {
          ...stats,
          gamesPlayed: stats.gamesPlayed + 1,
          wins: prev.currentPlayer === "white" ? stats.wins + 1 : stats.wins,
          losses: prev.currentPlayer === "black" ? stats.losses + 1 : stats.losses,
        };
        saveStats(newStats);
        toast.success(prev.currentPlayer === "white" ? "You won!" : "AI won!");
        
        return {
          ...prev,
          points: newPoints,
          bar: newBar,
          home: newHome,
          movesLeft: [],
          gameOver: true,
          winner: prev.currentPlayer,
        };
      }
      
      // Switch turns if no moves left
      if (newMovesLeft.length === 0) {
        const newDice = rollDice();
        const nextPlayer = prev.currentPlayer === "white" ? "black" : "white";
        const nextMovesLeft = newDice[0] === newDice[1] 
          ? [newDice[0], newDice[0], newDice[0], newDice[0]] 
          : [newDice[0], newDice[1]];
        
        toast.info(`${nextPlayer === "white" ? "Your" : "AI's"} turn. Rolled ${newDice[0]} and ${newDice[1]}`);
        
        return {
          ...prev,
          points: newPoints,
          bar: newBar,
          home: newHome,
          currentPlayer: nextPlayer,
          dice: newDice,
          movesLeft: nextMovesLeft,
        };
      }
      
      return {
        ...prev,
        points: newPoints,
        bar: newBar,
        home: newHome,
        movesLeft: newMovesLeft,
      };
    });
    
    setSelectedPoint(null);
    setValidMoves([]);
  };

  // AI move
  useEffect(() => {
    if (gameState.currentPlayer === "black" && !gameState.gameOver && gameState.movesLeft.length > 0) {
      const timer = setTimeout(() => {
        // Simple AI: find first valid move
        for (let i = 0; i < 24; i++) {
          const moves = getValidMovesForPoint(i, gameState);
          if (moves.length > 0) {
            makeMove(i, moves[0]);
            return;
          }
        }
        // If no moves, skip turn
        const newDice = rollDice();
        const nextMovesLeft = newDice[0] === newDice[1] 
          ? [newDice[0], newDice[0], newDice[0], newDice[0]] 
          : [newDice[0], newDice[1]];
        
        setGameState(prev => ({
          ...prev,
          currentPlayer: "white",
          dice: newDice,
          movesLeft: nextMovesLeft,
        }));
        toast.info(`Your turn. Rolled ${newDice[0]} and ${newDice[1]}`);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.movesLeft, gameState.gameOver, getValidMovesForPoint]);

  const renderPoint = (index: number, isTop: boolean) => {
    const point = gameState.points[index];
    const isSelected = selectedPoint === index;
    const isValidMove = validMoves.includes(index);
    
    return (
      <div
        key={index}
        onClick={() => handlePointClick(index)}
        className={`
          relative w-10 h-32 flex flex-col items-center cursor-pointer
          ${isTop ? "justify-start" : "justify-end"}
          ${isSelected ? "bg-yellow-200/50" : ""}
          ${isValidMove ? "bg-green-200/50" : ""}
        `}
      >
        {/* Triangle */}
        <div
          className={`
            absolute w-0 h-0 border-l-[20px] border-r-[20px] border-transparent
            ${isTop 
              ? `border-t-[120px] ${index % 2 === 0 ? "border-t-amber-800" : "border-t-amber-600"} top-0` 
              : `border-b-[120px] ${index % 2 === 0 ? "border-b-amber-800" : "border-b-amber-600"} bottom-0`
            }
          `}
        />
        
        {/* Pieces */}
        <div className={`relative z-10 flex flex-col ${isTop ? "" : "flex-col-reverse"} gap-0.5`}>
          {Array(Math.min(point.pieces, 5)).fill(null).map((_, i) => (
            <div
              key={i}
              className={`
                w-8 h-8 rounded-full border-2 border-gray-700
                ${point.color === "white" ? "bg-white" : "bg-gray-900"}
              `}
            >
              {i === (isTop ? Math.min(point.pieces, 5) - 1 : 0) && point.pieces > 5 && (
                <span className={`text-xs font-bold ${point.color === "white" ? "text-black" : "text-white"}`}>
                  {point.pieces}
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Point number */}
        <span className={`absolute ${isTop ? "bottom-0" : "top-0"} text-xs text-gray-500`}>
          {index + 1}
        </span>
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-4">
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
            <div className="w-20 h-20 mx-auto mb-6 bg-amber-600 rounded-full flex items-center justify-center">
              <Dices className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Backgammon</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              One of the oldest known board games! Race your pieces around the board 
              while blocking your opponent. Uses probability, strategy, and tactical thinking.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
              <div className="text-center">
                <Brain className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-medium">Strategy</p>
              </div>
              <div className="text-center">
                <Dices className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-medium">Probability</p>
              </div>
              <div className="text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-medium">Tactics</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center mb-6">
              <Badge variant="outline">Ages 9+</Badge>
              <Badge variant="outline">SELF Pillar</Badge>
              <Badge variant="outline">2 Players</Badge>
            </div>

            {stats.gamesPlayed > 0 && (
              <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Your Stats</p>
                <p className="font-medium">
                  {stats.wins} Wins / {stats.losses} Losses ({stats.gamesPlayed} games)
                </p>
              </div>
            )}

            <Button onClick={startGame} size="lg" className="bg-amber-600 hover:bg-amber-700">
              <Dices className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-4">
      <div className="container max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/game-center">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <Badge variant={gameState.currentPlayer === "white" ? "default" : "outline"}>
              Your Turn
            </Badge>
            <Badge variant={gameState.currentPlayer === "black" ? "default" : "outline"}>
              AI Turn
            </Badge>
          </div>
          
          <Button variant="outline" size="sm" onClick={startGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>

        {/* Dice display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="flex gap-2">
            {gameState.dice.map((die, i) => (
              <div
                key={i}
                className={`
                  w-12 h-12 bg-white rounded-lg border-2 border-gray-300 
                  flex items-center justify-center text-2xl font-bold
                  ${gameState.movesLeft.includes(die) ? "" : "opacity-30"}
                `}
              >
                {die}
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground self-center">
            Moves left: {gameState.movesLeft.join(", ") || "None"}
          </div>
        </div>

        {/* Game board */}
        <Card className="p-4 bg-amber-900">
          {/* Top row (points 13-24) */}
          <div className="flex justify-between mb-2">
            <div className="flex">
              {[12, 13, 14, 15, 16, 17].map(i => renderPoint(i, true))}
            </div>
            {/* Bar */}
            <div className="w-12 bg-amber-950 flex flex-col items-center justify-center gap-1">
              {Array(gameState.bar.black).fill(null).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-900 border-2 border-gray-700" />
              ))}
            </div>
            <div className="flex">
              {[18, 19, 20, 21, 22, 23].map(i => renderPoint(i, true))}
            </div>
          </div>

          {/* Home areas */}
          <div className="flex justify-between items-center py-4">
            <div className="text-white text-sm">
              Black Home: {gameState.home.black}/15
            </div>
            <div className="text-white text-sm">
              White Home: {gameState.home.white}/15
            </div>
          </div>

          {/* Bottom row (points 1-12) */}
          <div className="flex justify-between mt-2">
            <div className="flex">
              {[11, 10, 9, 8, 7, 6].map(i => renderPoint(i, false))}
            </div>
            {/* Bar */}
            <div className="w-12 bg-amber-950 flex flex-col items-center justify-center gap-1">
              {Array(gameState.bar.white).fill(null).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-gray-700" />
              ))}
            </div>
            <div className="flex">
              {[5, 4, 3, 2, 1, 0].map(i => renderPoint(i, false))}
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mt-4 p-4">
          <h3 className="font-semibold mb-2">How to Play</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Click a piece to select it, then click a valid destination</li>
            <li>• White pieces (you) move from high numbers to low (bearing off at 1)</li>
            <li>• Land on a single opponent piece to send it to the bar</li>
            <li>• First to bear off all 15 pieces wins!</li>
          </ul>
        </Card>

        {gameState.gameOver && (
          <Card className="mt-4 p-6 text-center bg-gradient-to-r from-amber-100 to-orange-100">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-amber-600" />
            <h2 className="text-2xl font-bold mb-2">
              {gameState.winner === "white" ? "You Won!" : "AI Won!"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {gameState.winner === "white" 
                ? "Excellent strategy and probability assessment!" 
                : "Good game! Try again to improve your skills."}
            </p>
            <Button onClick={startGame} className="bg-amber-600 hover:bg-amber-700">
              Play Again
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
