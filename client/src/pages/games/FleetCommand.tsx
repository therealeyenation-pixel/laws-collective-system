import { useState, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Ship, Target, Crosshair, Anchor, Compass, Navigation, Radar, Shield, Zap } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useGameCompletion } from "@/hooks/useGameCompletion";
import GameModeSelector, { GameMode, Difficulty, AIPersonality, GameConfig } from "@/components/games/GameModeSelector";

type CellState = "water" | "fleet" | "hit" | "miss" | "sunk";
type Board = CellState[][];
type FleetUnit = { 
  name: string; 
  size: number; 
  type: "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer" | "patrol";
  positions: { row: number; col: number }[]; 
  hits: number;
  special?: string;
};

const BOARD_SIZE = 12; // Larger board for Fleet Command
const FLEET_UNITS: Omit<FleetUnit, "positions" | "hits">[] = [
  { name: "Aircraft Carrier", size: 5, type: "carrier", special: "Can launch air strikes" },
  { name: "Battleship", size: 4, type: "battleship", special: "Heavy artillery" },
  { name: "Cruiser", size: 3, type: "cruiser", special: "Fast movement" },
  { name: "Submarine", size: 3, type: "submarine", special: "Stealth mode" },
  { name: "Destroyer", size: 2, type: "destroyer", special: "Anti-submarine" },
  { name: "Patrol Boat", size: 2, type: "patrol", special: "Radar boost" },
];

const createEmptyBoard = (): Board => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill("water"));
};

export default function FleetCommand() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [aiPersonality, setAIPersonality] = useState<AIPersonality>("balanced");
  
  const [playerBoard, setPlayerBoard] = useState<Board>(createEmptyBoard());
  const [enemyBoard, setEnemyBoard] = useState<Board>(createEmptyBoard());
  const [playerFleet, setPlayerFleet] = useState<FleetUnit[]>([]);
  const [enemyFleet, setEnemyFleet] = useState<FleetUnit[]>([]);
  const [gamePhase, setGamePhase] = useState<"deployment" | "battle" | "victory" | "defeat">("deployment");
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [playerShots, setPlayerShots] = useState(0);
  const [enemyShots, setEnemyShots] = useState(0);
  const [specialAbilityReady, setSpecialAbilityReady] = useState(true);
  const [radarActive, setRadarActive] = useState(false);
  const [tokensAwarded, setTokensAwarded] = useState(false);
  const [isEnemyThinking, setIsEnemyThinking] = useState(false);
  const [lastHit, setLastHit] = useState<{ row: number; col: number } | null>(null);
  const [huntMode, setHuntMode] = useState<"search" | "hunt">("search");
  const [huntTargets, setHuntTargets] = useState<{ row: number; col: number }[]>([]);
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
    setGamePhase("deployment");
  };

  const resetGame = () => {
    setPlayerBoard(createEmptyBoard());
    setEnemyBoard(createEmptyBoard());
    setPlayerFleet([]);
    setEnemyFleet([]);
    setGamePhase("deployment");
    setCurrentUnitIndex(0);
    setIsHorizontal(true);
    setPlayerTurn(true);
    setPlayerShots(0);
    setEnemyShots(0);
    setSpecialAbilityReady(true);
    setRadarActive(false);
    setTokensAwarded(false);
    setLastHit(null);
    setHuntMode("search");
    setHuntTargets([]);
  };

  // Check if unit can be placed
  const canPlaceUnit = useCallback((board: Board, row: number, col: number, size: number, horizontal: boolean): boolean => {
    for (let i = 0; i < size; i++) {
      const r = horizontal ? row : row + i;
      const c = horizontal ? col + i : col;
      if (r >= BOARD_SIZE || c >= BOARD_SIZE || board[r][c] !== "water") {
        return false;
      }
      // Check adjacent cells for spacing
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            if (board[nr][nc] === "fleet") return false;
          }
        }
      }
    }
    return true;
  }, []);

  // Place unit on board
  const placeUnit = useCallback((board: Board, row: number, col: number, size: number, horizontal: boolean): { board: Board; positions: { row: number; col: number }[] } => {
    const newBoard = board.map(r => [...r]);
    const positions: { row: number; col: number }[] = [];
    
    for (let i = 0; i < size; i++) {
      const r = horizontal ? row : row + i;
      const c = horizontal ? col + i : col;
      newBoard[r][c] = "fleet";
      positions.push({ row: r, col: c });
    }
    
    return { board: newBoard, positions };
  }, []);

  // Place enemy fleet randomly
  const placeEnemyFleet = useCallback(() => {
    let board = createEmptyBoard();
    const fleet: FleetUnit[] = [];
    
    for (const unitDef of FLEET_UNITS) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 200) {
        const horizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        
        if (canPlaceUnit(board, row, col, unitDef.size, horizontal)) {
          const result = placeUnit(board, row, col, unitDef.size, horizontal);
          board = result.board;
          fleet.push({ ...unitDef, positions: result.positions, hits: 0 });
          placed = true;
        }
        attempts++;
      }
    }
    
    // Store enemy board without showing fleet positions
    setEnemyBoard(createEmptyBoard());
    setEnemyFleet(fleet);
  }, [canPlaceUnit, placeUnit]);

  // Handle player placing units
  const handleDeploymentClick = (row: number, col: number) => {
    if (gamePhase !== "deployment" || currentUnitIndex >= FLEET_UNITS.length) return;
    
    const unit = FLEET_UNITS[currentUnitIndex];
    if (!canPlaceUnit(playerBoard, row, col, unit.size, isHorizontal)) {
      toast.error("Cannot deploy unit there! Check spacing.");
      return;
    }
    
    const result = placeUnit(playerBoard, row, col, unit.size, isHorizontal);
    setPlayerBoard(result.board);
    setPlayerFleet(prev => [...prev, { ...unit, positions: result.positions, hits: 0 }]);
    
    if (currentUnitIndex === FLEET_UNITS.length - 1) {
      placeEnemyFleet();
      setGamePhase("battle");
      toast.success("Fleet deployed! Engage the enemy!");
    } else {
      setCurrentUnitIndex(prev => prev + 1);
      toast.info(`Deploy your ${FLEET_UNITS[currentUnitIndex + 1].name}`);
    }
  };

  // Handle player attack
  const handleAttack = (row: number, col: number) => {
    if (gamePhase !== "battle" || !playerTurn || isEnemyThinking) return;
    if (enemyBoard[row][col] === "hit" || enemyBoard[row][col] === "miss" || enemyBoard[row][col] === "sunk") {
      toast.error("Already targeted this position!");
      return;
    }

    const newBoard = enemyBoard.map(r => [...r]);
    let hit = false;
    let sunkUnit: FleetUnit | null = null;

    // Check if hit any enemy unit
    for (const unit of enemyFleet) {
      const hitPos = unit.positions.find(p => p.row === row && p.col === col);
      if (hitPos) {
        hit = true;
        unit.hits++;
        newBoard[row][col] = "hit";
        
        if (unit.hits >= unit.size) {
          sunkUnit = unit;
          // Mark all positions as sunk
          for (const pos of unit.positions) {
            newBoard[pos.row][pos.col] = "sunk";
          }
        }
        break;
      }
    }

    if (!hit) {
      newBoard[row][col] = "miss";
    }

    setEnemyBoard(newBoard);
    setPlayerShots(prev => prev + 1);

    if (hit) {
      if (sunkUnit) {
        toast.success(`${sunkUnit.name} destroyed!`);
      } else {
        toast.success("Direct hit!");
      }
    } else {
      toast.info("Miss!");
    }

    // Check for victory
    const allSunk = enemyFleet.every(u => u.hits >= u.size);
    if (allSunk) {
      setGamePhase("victory");
      handleGameEnd(true);
      return;
    }

    setPlayerTurn(false);
    setIsEnemyThinking(true);
    setTimeout(enemyTurn, 1500);
  };

  // Enemy AI turn
  const enemyTurn = useCallback(() => {
    const newBoard = playerBoard.map(r => [...r]);
    let targetRow: number;
    let targetCol: number;
    let validTarget = false;

    // Hunt mode - target adjacent cells to last hit
    if (huntMode === "hunt" && huntTargets.length > 0) {
      const target = huntTargets[0];
      targetRow = target.row;
      targetCol = target.col;
      setHuntTargets(prev => prev.slice(1));
      validTarget = true;
    } else {
      // Search mode - find new target
      const untargeted: { row: number; col: number }[] = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (newBoard[r][c] === "water" || newBoard[r][c] === "fleet") {
            untargeted.push({ row: r, col: c });
          }
        }
      }

      if (untargeted.length === 0) return;

      // AI targeting based on difficulty
      if (difficulty === "hard" || difficulty === "expert") {
        // Checkerboard pattern for efficiency
        const checkerboard = untargeted.filter(t => (t.row + t.col) % 2 === 0);
        const pool = checkerboard.length > 0 ? checkerboard : untargeted;
        const target = pool[Math.floor(Math.random() * pool.length)];
        targetRow = target.row;
        targetCol = target.col;
      } else {
        const target = untargeted[Math.floor(Math.random() * untargeted.length)];
        targetRow = target.row;
        targetCol = target.col;
      }
      validTarget = true;
    }

    if (!validTarget) {
      setPlayerTurn(true);
      setIsEnemyThinking(false);
      return;
    }

    let hit = false;
    let sunkUnit: FleetUnit | null = null;

    // Check if hit any player unit
    for (const unit of playerFleet) {
      const hitPos = unit.positions.find(p => p.row === targetRow && p.col === targetCol);
      if (hitPos) {
        hit = true;
        unit.hits++;
        newBoard[targetRow][targetCol] = "hit";
        
        if (unit.hits >= unit.size) {
          sunkUnit = unit;
          for (const pos of unit.positions) {
            newBoard[pos.row][pos.col] = "sunk";
          }
          setHuntMode("search");
          setHuntTargets([]);
        } else {
          // Add adjacent cells to hunt targets
          setHuntMode("hunt");
          const adjacent = [
            { row: targetRow - 1, col: targetCol },
            { row: targetRow + 1, col: targetCol },
            { row: targetRow, col: targetCol - 1 },
            { row: targetRow, col: targetCol + 1 },
          ].filter(t => 
            t.row >= 0 && t.row < BOARD_SIZE && 
            t.col >= 0 && t.col < BOARD_SIZE &&
            (newBoard[t.row][t.col] === "water" || newBoard[t.row][t.col] === "fleet")
          );
          setHuntTargets(prev => [...prev, ...adjacent]);
        }
        break;
      }
    }

    if (!hit) {
      newBoard[targetRow][targetCol] = "miss";
    }

    setPlayerBoard(newBoard);
    setEnemyShots(prev => prev + 1);

    if (hit) {
      if (sunkUnit) {
        toast.error(`Your ${sunkUnit.name} was destroyed!`);
      } else {
        toast.warning("Enemy hit your fleet!");
      }
    }

    // Check for defeat
    const allPlayerSunk = playerFleet.every(u => u.hits >= u.size);
    if (allPlayerSunk) {
      setGamePhase("defeat");
      handleGameEnd(false);
      return;
    }

    setPlayerTurn(true);
    setIsEnemyThinking(false);
  }, [playerBoard, playerFleet, difficulty, huntMode, huntTargets]);

  // Use radar ability
  const useRadar = () => {
    if (!specialAbilityReady || gamePhase !== "battle") return;
    
    setRadarActive(true);
    setSpecialAbilityReady(false);
    toast.info("Radar activated! Enemy positions revealed for 5 seconds.");
    
    setTimeout(() => {
      setRadarActive(false);
    }, 5000);
  };

  // Handle game end
  const handleGameEnd = async (won: boolean) => {
    if (tokensAwarded) return;
    setTokensAwarded(true);

    const baseTokens = won ? 100 : 25;
    const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : difficulty === "hard" ? 2 : 2.5;
    const efficiencyBonus = won ? Math.max(0, 50 - playerShots) : 0;
    const totalTokens = Math.round((baseTokens + efficiencyBonus) * difficultyMultiplier);

    try {
      await completeGame({
        gameId: "fleet-command",
        score: won ? 1000 - playerShots * 10 : playerShots * 5,
        tokensEarned: totalTokens,
        metadata: {
          won,
          playerShots,
          enemyShots,
          difficulty,
          aiPersonality,
        },
      });
      toast.success(`${won ? "Victory!" : "Defeat!"} Earned ${totalTokens} tokens!`);
    } catch (error) {
      console.error("Failed to record game:", error);
    }
  };

  const getCellColor = (cell: CellState, isEnemy: boolean, showFleet: boolean = false) => {
    switch (cell) {
      case "water": return "bg-blue-900/50 hover:bg-blue-800/50";
      case "fleet": return showFleet ? "bg-gray-600" : "bg-blue-900/50 hover:bg-blue-800/50";
      case "hit": return "bg-red-600 animate-pulse";
      case "miss": return "bg-blue-400/30";
      case "sunk": return "bg-red-900";
      default: return "bg-blue-900/50";
    }
  };

  const renderBoard = (board: Board, isEnemy: boolean, onClick?: (row: number, col: number) => void) => {
    const showFleet = !isEnemy || radarActive;
    const actualBoard = isEnemy && !radarActive ? enemyBoard : board;
    
    return (
      <div className="inline-block">
        <div className="flex">
          <div className="w-6" />
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div key={i} className="w-6 h-6 flex items-center justify-center text-xs text-muted-foreground font-mono">
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        {actualBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            <div className="w-6 h-6 flex items-center justify-center text-xs text-muted-foreground font-mono">
              {rowIndex + 1}
            </div>
            {row.map((cell, colIndex) => {
              const showEnemyFleet = radarActive && isEnemy && enemyFleet.some(u => 
                u.positions.some(p => p.row === rowIndex && p.col === colIndex) && u.hits < u.size
              );
              
              return (
                <button
                  key={colIndex}
                  onClick={() => onClick?.(rowIndex, colIndex)}
                  disabled={!onClick || (isEnemy && (cell === "hit" || cell === "miss" || cell === "sunk"))}
                  className={`w-6 h-6 border border-blue-700/30 transition-colors ${
                    getCellColor(cell, isEnemy, !isEnemy)
                  } ${showEnemyFleet ? "bg-yellow-500/50" : ""} ${
                    onClick ? "cursor-crosshair" : "cursor-default"
                  }`}
                >
                  {cell === "hit" && <span className="text-white text-xs">💥</span>}
                  {cell === "miss" && <span className="text-blue-300 text-xs">•</span>}
                  {cell === "sunk" && <span className="text-red-300 text-xs">✕</span>}
                  {cell === "fleet" && !isEnemy && <span className="text-gray-300 text-xs">■</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Center
              </Button>
            </Link>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-500/20 rounded-full">
                  <Ship className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Fleet Command</CardTitle>
              <p className="text-muted-foreground">
                Command your naval fleet in this strategic warfare game. Deploy your ships wisely 
                and hunt down the enemy fleet before they sink yours!
              </p>
            </CardHeader>
            <CardContent>
              <GameModeSelector
                gameName="Fleet Command"
                onStart={handleStartGame}
                availableModes={["ai", "local"]}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Ship className="w-6 h-6 text-blue-400" />
                Fleet Command
              </h1>
              <p className="text-sm text-muted-foreground">
                {gamePhase === "deployment" ? `Deploy: ${FLEET_UNITS[currentUnitIndex]?.name || "Complete"}` :
                 gamePhase === "battle" ? (playerTurn ? "Your turn - Select target" : "Enemy turn...") :
                 gamePhase === "victory" ? "Victory!" : "Defeat!"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Target className="w-3 h-3" />
              Shots: {playerShots}
            </Badge>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
            <Button variant="ghost" size="sm" onClick={handleChangeMode}>
              Change Mode
            </Button>
          </div>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Player Board */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Anchor className="w-5 h-5 text-blue-400" />
                Your Fleet
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {renderBoard(
                playerBoard, 
                false, 
                gamePhase === "deployment" ? handleDeploymentClick : undefined
              )}
            </CardContent>
          </Card>

          {/* Enemy Board */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-red-400" />
                Enemy Waters
                {radarActive && <Badge variant="secondary" className="ml-2">Radar Active</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {renderBoard(
                enemyBoard, 
                true, 
                gamePhase === "battle" && playerTurn ? handleAttack : undefined
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Deployment Controls */}
          {gamePhase === "deployment" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Deployment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Placing: <strong>{FLEET_UNITS[currentUnitIndex]?.name}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Size: {FLEET_UNITS[currentUnitIndex]?.size} cells
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsHorizontal(!isHorizontal)}
                  className="w-full"
                >
                  <Navigation className={`w-4 h-4 mr-2 ${isHorizontal ? "" : "rotate-90"}`} />
                  {isHorizontal ? "Horizontal" : "Vertical"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Special Abilities */}
          {gamePhase === "battle" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Special Abilities</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={useRadar}
                  disabled={!specialAbilityReady || !playerTurn}
                  className="w-full"
                >
                  <Radar className="w-4 h-4 mr-2" />
                  Radar Scan {!specialAbilityReady && "(Used)"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Fleet Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Your Fleet Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {playerFleet.map((unit, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className={unit.hits >= unit.size ? "line-through text-muted-foreground" : ""}>
                    {unit.name}
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: unit.size }, (_, j) => (
                      <div 
                        key={j} 
                        className={`w-2 h-2 rounded-full ${
                          j < unit.hits ? "bg-red-500" : "bg-green-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Enemy Fleet Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Enemy Fleet Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {enemyFleet.map((unit, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className={unit.hits >= unit.size ? "line-through text-muted-foreground" : ""}>
                    {unit.name}
                  </span>
                  <Badge variant={unit.hits >= unit.size ? "destructive" : "secondary"} className="text-xs">
                    {unit.hits >= unit.size ? "Sunk" : "Active"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Game Over */}
        {(gamePhase === "victory" || gamePhase === "defeat") && (
          <Card className={`border-2 ${gamePhase === "victory" ? "border-green-500" : "border-red-500"}`}>
            <CardContent className="py-8 text-center">
              <div className="text-4xl mb-4">
                {gamePhase === "victory" ? "🎉" : "💀"}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {gamePhase === "victory" ? "Victory!" : "Defeat!"}
              </h2>
              <p className="text-muted-foreground mb-4">
                {gamePhase === "victory" 
                  ? `You destroyed the enemy fleet in ${playerShots} shots!`
                  : `Your fleet was destroyed after ${enemyShots} enemy shots.`}
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={resetGame}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Link href="/game-center">
                  <Button variant="outline">
                    Back to Game Center
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Thinking Indicator */}
        {isEnemyThinking && (
          <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin">
                <Compass className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm">Enemy calculating attack...</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
