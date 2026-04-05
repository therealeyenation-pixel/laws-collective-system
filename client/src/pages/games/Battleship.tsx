import { useState, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Ship, Target, Crosshair, Waves, Brain } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useGameCompletion } from "@/hooks/useGameCompletion";
import GameModeSelector, { GameMode, Difficulty, AIPersonality, GameConfig } from "@/components/games/GameModeSelector";

type CellState = "empty" | "ship" | "hit" | "miss";
type Board = CellState[][];
type ShipType = { name: string; size: number; positions: { row: number; col: number }[]; hits: number };

const BOARD_SIZE = 10;
const SHIPS = [
  { name: "Carrier", size: 5 },
  { name: "Battleship", size: 4 },
  { name: "Cruiser", size: 3 },
  { name: "Submarine", size: 3 },
  { name: "Destroyer", size: 2 },
];

const createEmptyBoard = (): Board => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill("empty"));
};

export default function Battleship() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [aiPersonality, setAIPersonality] = useState<AIPersonality>("balanced");
  
  const [playerBoard, setPlayerBoard] = useState<Board>(createEmptyBoard());
  const [aiBoard, setAiBoard] = useState<Board>(createEmptyBoard());
  const [playerShips, setPlayerShips] = useState<ShipType[]>([]);
  const [aiShips, setAiShips] = useState<ShipType[]>([]);
  const [gamePhase, setGamePhase] = useState<"setup" | "playing" | "gameover">("setup");
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);
  const [aiLastHit, setAiLastHit] = useState<{ row: number; col: number } | null>(null);
  const [aiHuntDirection, setAiHuntDirection] = useState<"none" | "horizontal" | "vertical">("none");
  const [aiHitStack, setAiHitStack] = useState<{ row: number; col: number }[]>([]);
  const [tokensAwarded, setTokensAwarded] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const { completeGame } = useGameCompletion();

  const handleStartGame = (config: GameConfig) => {
    setGameMode(config.mode);
    setDifficulty(config.difficulty);
    setAIPersonality(config.personality);
    setGameStarted(true);
    resetGame();
  };

  const handleChangeMode = () => {
    setGameStarted(false);
    setGamePhase("setup");
  };

  // Check if ship can be placed
  const canPlaceShip = useCallback((board: Board, row: number, col: number, size: number, horizontal: boolean): boolean => {
    for (let i = 0; i < size; i++) {
      const r = horizontal ? row : row + i;
      const c = horizontal ? col + i : col;
      if (r >= BOARD_SIZE || c >= BOARD_SIZE || board[r][c] !== "empty") {
        return false;
      }
    }
    return true;
  }, []);

  // Place ship on board
  const placeShip = useCallback((board: Board, row: number, col: number, size: number, horizontal: boolean): { board: Board; positions: { row: number; col: number }[] } => {
    const newBoard = board.map(r => [...r]);
    const positions: { row: number; col: number }[] = [];
    
    for (let i = 0; i < size; i++) {
      const r = horizontal ? row : row + i;
      const c = horizontal ? col + i : col;
      newBoard[r][c] = "ship";
      positions.push({ row: r, col: c });
    }
    
    return { board: newBoard, positions };
  }, []);

  // Place AI ships randomly
  const placeAiShips = useCallback(() => {
    let board = createEmptyBoard();
    const ships: ShipType[] = [];
    
    for (const shipDef of SHIPS) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const horizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        
        if (canPlaceShip(board, row, col, shipDef.size, horizontal)) {
          const result = placeShip(board, row, col, shipDef.size, horizontal);
          board = result.board;
          ships.push({ ...shipDef, positions: result.positions, hits: 0 });
          placed = true;
        }
        attempts++;
      }
    }
    
    setAiBoard(board);
    setAiShips(ships);
  }, [canPlaceShip, placeShip]);

  // Handle player placing ships
  const handleSetupClick = (row: number, col: number) => {
    if (gamePhase !== "setup" || currentShipIndex >= SHIPS.length) return;
    
    const ship = SHIPS[currentShipIndex];
    if (!canPlaceShip(playerBoard, row, col, ship.size, isHorizontal)) {
      toast.error("Can't place ship there!");
      return;
    }
    
    const result = placeShip(playerBoard, row, col, ship.size, isHorizontal);
    setPlayerBoard(result.board);
    setPlayerShips(prev => [...prev, { ...ship, positions: result.positions, hits: 0 }]);
    
    if (currentShipIndex === SHIPS.length - 1) {
      placeAiShips();
      setGamePhase("playing");
      toast.success("All ships placed! Start attacking!");
    } else {
      setCurrentShipIndex(prev => prev + 1);
      toast.info(`Place your ${SHIPS[currentShipIndex + 1].name}`);
    }
  };

  // Calculate probability map for hard AI
  const calculateProbabilityMap = useCallback((board: Board): number[][] => {
    const probMap = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    
    // For each remaining ship size, calculate where it could fit
    const remainingShips = playerShips.filter(s => s.hits < s.size);
    
    for (const ship of remainingShips) {
      // Horizontal placements
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col <= BOARD_SIZE - ship.size; col++) {
          let canPlace = true;
          for (let i = 0; i < ship.size; i++) {
            if (board[row][col + i] === "miss" || board[row][col + i] === "hit") {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < ship.size; i++) {
              probMap[row][col + i]++;
            }
          }
        }
      }
      
      // Vertical placements
      for (let row = 0; row <= BOARD_SIZE - ship.size; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          let canPlace = true;
          for (let i = 0; i < ship.size; i++) {
            if (board[row + i][col] === "miss" || board[row + i][col] === "hit") {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < ship.size; i++) {
              probMap[row + i][col]++;
            }
          }
        }
      }
    }
    
    // Boost probability around hits
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === "hit") {
          const adjacent = [
            { r: row - 1, c: col }, { r: row + 1, c: col },
            { r: row, c: col - 1 }, { r: row, c: col + 1 }
          ];
          for (const adj of adjacent) {
            if (adj.r >= 0 && adj.r < BOARD_SIZE && adj.c >= 0 && adj.c < BOARD_SIZE) {
              if (board[adj.r][adj.c] === "empty" || board[adj.r][adj.c] === "ship") {
                probMap[adj.r][adj.c] *= 3;
              }
            }
          }
        }
      }
    }
    
    return probMap;
  }, [playerShips]);

  // Handle player attack
  const handleAttack = (row: number, col: number) => {
    if (gamePhase !== "playing" || !playerTurn) return;
    
    // Can't attack same cell twice
    const currentCell = aiBoard[row][col];
    if (currentCell === "hit" || currentCell === "miss") {
      toast.error("Already attacked this cell!");
      return;
    }
    
    const newAiBoard = aiBoard.map(r => [...r]);
    
    if (currentCell === "ship") {
      newAiBoard[row][col] = "hit";
      setAiBoard(newAiBoard);
      
      // Check if ship sunk
      const hitShip = aiShips.find(s => s.positions.some(p => p.row === row && p.col === col));
      if (hitShip) {
        hitShip.hits++;
        if (hitShip.hits === hitShip.size) {
          toast.success(`You sunk the ${hitShip.name}!`);
        } else {
          toast.success("Hit!");
        }
      }
      
      // Check win
      const allSunk = aiShips.every(s => s.hits === s.size);
      if (allSunk) {
        setGamePhase("gameover");
        setWinner("player");
        toast.success("Victory! You sunk all enemy ships! 🎉");
        if (!tokensAwarded) {
          setTokensAwarded(true);
          completeGame({ gameSlug: "battleship", won: true, score: 500 });
        }
        return;
      }
    } else {
      newAiBoard[row][col] = "miss";
      setAiBoard(newAiBoard);
      toast.info("Miss!");
    }
    
    setPlayerTurn(false);
    setIsAIThinking(true);
    
    const delay = difficulty === "easy" ? 800 : difficulty === "medium" ? 1000 : 1500;
    setTimeout(() => aiTurn(), delay);
  };

  // AI turn with difficulty-based targeting
  const aiTurn = useCallback(() => {
    let row: number, col: number;
    
    if (difficulty === "easy") {
      // Easy: Pure random targeting
      do {
        row = Math.floor(Math.random() * BOARD_SIZE);
        col = Math.floor(Math.random() * BOARD_SIZE);
      } while (playerBoard[row][col] === "hit" || playerBoard[row][col] === "miss");
      
    } else if (difficulty === "medium") {
      // Medium: Hunt mode after hits
      if (aiHitStack.length > 0) {
        const lastHit = aiHitStack[aiHitStack.length - 1];
        const adjacent = [
          { row: lastHit.row - 1, col: lastHit.col },
          { row: lastHit.row + 1, col: lastHit.col },
          { row: lastHit.row, col: lastHit.col - 1 },
          { row: lastHit.row, col: lastHit.col + 1 },
        ].filter(p => 
          p.row >= 0 && p.row < BOARD_SIZE && 
          p.col >= 0 && p.col < BOARD_SIZE &&
          playerBoard[p.row][p.col] !== "hit" && 
          playerBoard[p.row][p.col] !== "miss"
        );
        
        if (adjacent.length > 0) {
          const target = adjacent[Math.floor(Math.random() * adjacent.length)];
          row = target.row;
          col = target.col;
        } else {
          setAiHitStack([]);
          do {
            row = Math.floor(Math.random() * BOARD_SIZE);
            col = Math.floor(Math.random() * BOARD_SIZE);
          } while (playerBoard[row][col] === "hit" || playerBoard[row][col] === "miss");
        }
      } else {
        // Checkerboard pattern for efficiency
        const candidates: { row: number; col: number }[] = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if ((r + c) % 2 === 0 && playerBoard[r][c] !== "hit" && playerBoard[r][c] !== "miss") {
              candidates.push({ row: r, col: c });
            }
          }
        }
        if (candidates.length > 0) {
          const target = candidates[Math.floor(Math.random() * candidates.length)];
          row = target.row;
          col = target.col;
        } else {
          do {
            row = Math.floor(Math.random() * BOARD_SIZE);
            col = Math.floor(Math.random() * BOARD_SIZE);
          } while (playerBoard[row][col] === "hit" || playerBoard[row][col] === "miss");
        }
      }
      
    } else {
      // Hard: Probability-based targeting
      const probMap = calculateProbabilityMap(playerBoard);
      
      let maxProb = -1;
      const candidates: { row: number; col: number }[] = [];
      
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (playerBoard[r][c] !== "hit" && playerBoard[r][c] !== "miss") {
            if (probMap[r][c] > maxProb) {
              maxProb = probMap[r][c];
              candidates.length = 0;
              candidates.push({ row: r, col: c });
            } else if (probMap[r][c] === maxProb) {
              candidates.push({ row: r, col: c });
            }
          }
        }
      }
      
      if (candidates.length > 0) {
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        row = target.row;
        col = target.col;
      } else {
        do {
          row = Math.floor(Math.random() * BOARD_SIZE);
          col = Math.floor(Math.random() * BOARD_SIZE);
        } while (playerBoard[row][col] === "hit" || playerBoard[row][col] === "miss");
      }
    }
    
    const newPlayerBoard = playerBoard.map(r => [...r]);
    
    if (playerBoard[row][col] === "ship") {
      newPlayerBoard[row][col] = "hit";
      setPlayerBoard(newPlayerBoard);
      
      if (difficulty === "medium") {
        setAiHitStack(prev => [...prev, { row, col }]);
      }
      
      // Check if ship sunk
      const hitShip = playerShips.find(s => s.positions.some(p => p.row === row && p.col === col));
      if (hitShip) {
        hitShip.hits++;
        if (hitShip.hits === hitShip.size) {
          toast.error(`AI sunk your ${hitShip.name}!`);
          if (difficulty === "medium") {
            setAiHitStack([]);
          }
        }
      }
      
      // Check loss
      const allSunk = playerShips.every(s => s.hits === s.size);
      if (allSunk) {
        setGamePhase("gameover");
        setWinner("ai");
        toast.error("Defeat! All your ships were sunk.");
        if (!tokensAwarded) {
          setTokensAwarded(true);
          completeGame({ gameSlug: "battleship", won: false, score: 100 });
        }
        setIsAIThinking(false);
        return;
      }
    } else {
      newPlayerBoard[row][col] = "miss";
      setPlayerBoard(newPlayerBoard);
    }
    
    setIsAIThinking(false);
    setPlayerTurn(true);
  }, [playerBoard, playerShips, difficulty, aiHitStack, calculateProbabilityMap, tokensAwarded, completeGame]);

  const resetGame = () => {
    setPlayerBoard(createEmptyBoard());
    setAiBoard(createEmptyBoard());
    setPlayerShips([]);
    setAiShips([]);
    setGamePhase("setup");
    setCurrentShipIndex(0);
    setIsHorizontal(true);
    setPlayerTurn(true);
    setWinner(null);
    setAiLastHit(null);
    setAiHuntDirection("none");
    setAiHitStack([]);
    setTokensAwarded(false);
    setIsAIThinking(false);
    toast.info(`Place your ${SHIPS[0].name}`);
  };

  const getCellStyle = (cell: CellState, isAiBoard: boolean) => {
    const base = "w-7 h-7 md:w-8 md:h-8 border border-blue-300 transition-all";
    
    switch (cell) {
      case "ship":
        return `${base} ${isAiBoard ? "bg-blue-100 hover:bg-blue-200" : "bg-gray-500"}`;
      case "hit":
        return `${base} bg-red-500 text-white`;
      case "miss":
        return `${base} bg-blue-200`;
      default:
        return `${base} bg-blue-100 ${isAiBoard && gamePhase === "playing" && playerTurn ? "hover:bg-blue-200 cursor-crosshair" : ""}`;
    }
  };

  // Show game mode selector if game hasn't started
  if (!gameStarted) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Ship className="w-6 h-6" />
                Battleship
              </h1>
              <p className="text-sm text-muted-foreground">Naval strategy game</p>
            </div>
          </div>
          
          <GameModeSelector
            gameName="Battleship"
            onStart={handleStartGame}
            supportedModes={["ai", "local", "online", "intrasystem"]}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Ship className="w-6 h-6" />
                Battleship
              </h1>
              <p className="text-sm text-muted-foreground">
                vs AI ({difficulty}) - {aiPersonality}
              </p>
            </div>
          </div>
          <Badge variant={gamePhase === "setup" ? "secondary" : gamePhase === "playing" ? "default" : "outline"}>
            {isAIThinking ? (
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3 animate-pulse" />
                AI Targeting...
              </span>
            ) : gamePhase === "setup" ? "Setup Phase" : gamePhase === "playing" ? (playerTurn ? "Your Turn" : "AI Turn") : winner === "player" ? "Victory!" : "Defeat"}
          </Badge>
        </div>

        {/* Setup Instructions */}
        {gamePhase === "setup" && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Place your {SHIPS[currentShipIndex]?.name} ({SHIPS[currentShipIndex]?.size} cells)</p>
                  <p className="text-sm text-muted-foreground">Click on your board to place the ship</p>
                </div>
                <Button variant="outline" onClick={() => setIsHorizontal(!isHorizontal)}>
                  {isHorizontal ? "Horizontal" : "Vertical"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Boards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Board */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Waves className="w-5 h-5" />
                Your Fleet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="border-2 border-blue-400 rounded">
                  {playerBoard.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex">
                      {row.map((cell, colIdx) => (
                        <button
                          key={colIdx}
                          onClick={() => gamePhase === "setup" && handleSetupClick(rowIdx, colIdx)}
                          disabled={gamePhase !== "setup"}
                          className={getCellStyle(cell, false)}
                        >
                          {cell === "hit" && <Target className="w-4 h-4" />}
                          {cell === "miss" && <span className="text-blue-400">•</span>}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Ship Status */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {playerShips.map((ship, i) => (
                    <Badge 
                      key={i} 
                      variant={ship.hits === ship.size ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {ship.name} {ship.hits === ship.size ? "✗" : `${ship.hits}/${ship.size}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Board */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crosshair className="w-5 h-5" />
                Enemy Waters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="border-2 border-red-400 rounded">
                  {aiBoard.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex">
                      {row.map((cell, colIdx) => (
                        <button
                          key={colIdx}
                          onClick={() => handleAttack(rowIdx, colIdx)}
                          disabled={gamePhase !== "playing" || !playerTurn || isAIThinking}
                          className={getCellStyle(cell === "ship" ? "empty" : cell, true)}
                        >
                          {cell === "hit" && <Target className="w-4 h-4 text-white" />}
                          {cell === "miss" && <span className="text-blue-400">•</span>}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Enemy Ship Status */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {aiShips.map((ship, i) => (
                    <Badge 
                      key={i} 
                      variant={ship.hits === ship.size ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {ship.name} {ship.hits === ship.size ? "✗" : "?"}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          <Button onClick={resetGame} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            New Game
          </Button>
          <Button onClick={handleChangeMode} variant="outline">
            Change Mode
          </Button>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• First, place all 5 ships on your board</p>
            <p>• Click cells on the enemy board to attack</p>
            <p>• Red = Hit, Blue dot = Miss</p>
            <p>• Sink all enemy ships to win!</p>
            <p className="text-xs mt-2 pt-2 border-t">
              <strong>AI Difficulty:</strong> {difficulty === "easy" ? "Random targeting" : difficulty === "medium" ? "Hunt mode after hits" : "Probability-based targeting"}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
