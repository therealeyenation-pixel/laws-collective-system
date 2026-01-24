import { useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Ship, Target, Crosshair, Waves } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useGameCompletion } from "@/hooks/useGameCompletion";

type CellState = "empty" | "ship" | "hit" | "miss";
type Board = CellState[][];
type Ship = { name: string; size: number; positions: { row: number; col: number }[]; hits: number };

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
  const [playerBoard, setPlayerBoard] = useState<Board>(createEmptyBoard());
  const [aiBoard, setAiBoard] = useState<Board>(createEmptyBoard());
  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [aiShips, setAiShips] = useState<Ship[]>([]);
  const [gamePhase, setGamePhase] = useState<"setup" | "playing" | "gameover">("setup");
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);
  const [aiLastHit, setAiLastHit] = useState<{ row: number; col: number } | null>(null);
  const [aiHuntMode, setAiHuntMode] = useState(false);
  const [tokensAwarded, setTokensAwarded] = useState(false);
  const { completeGame } = useGameCompletion();

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
    const ships: Ship[] = [];
    
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
    setTimeout(aiTurn, 1000);
  };

  // AI turn
  const aiTurn = () => {
    let row: number, col: number;
    
    // Hunt mode - try adjacent cells to last hit
    if (aiHuntMode && aiLastHit) {
      const adjacent = [
        { row: aiLastHit.row - 1, col: aiLastHit.col },
        { row: aiLastHit.row + 1, col: aiLastHit.col },
        { row: aiLastHit.row, col: aiLastHit.col - 1 },
        { row: aiLastHit.row, col: aiLastHit.col + 1 },
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
        setAiHuntMode(false);
        setAiLastHit(null);
        // Random attack
        do {
          row = Math.floor(Math.random() * BOARD_SIZE);
          col = Math.floor(Math.random() * BOARD_SIZE);
        } while (playerBoard[row][col] === "hit" || playerBoard[row][col] === "miss");
      }
    } else {
      // Random attack
      do {
        row = Math.floor(Math.random() * BOARD_SIZE);
        col = Math.floor(Math.random() * BOARD_SIZE);
      } while (playerBoard[row][col] === "hit" || playerBoard[row][col] === "miss");
    }
    
    const newPlayerBoard = playerBoard.map(r => [...r]);
    
    if (playerBoard[row][col] === "ship") {
      newPlayerBoard[row][col] = "hit";
      setPlayerBoard(newPlayerBoard);
      setAiLastHit({ row, col });
      setAiHuntMode(true);
      
      // Check if ship sunk
      const hitShip = playerShips.find(s => s.positions.some(p => p.row === row && p.col === col));
      if (hitShip) {
        hitShip.hits++;
        if (hitShip.hits === hitShip.size) {
          toast.error(`AI sunk your ${hitShip.name}!`);
          setAiHuntMode(false);
          setAiLastHit(null);
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
        return;
      }
    } else {
      newPlayerBoard[row][col] = "miss";
      setPlayerBoard(newPlayerBoard);
    }
    
    setPlayerTurn(true);
  };

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
    setAiHuntMode(false);
    setTokensAwarded(false);
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
        return `${base} bg-blue-100 ${isAiBoard && gamePhase === "playing" ? "hover:bg-blue-200 cursor-crosshair" : ""}`;
    }
  };

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
              <p className="text-sm text-muted-foreground">Naval strategy game</p>
            </div>
          </div>
          <Badge variant={gamePhase === "setup" ? "secondary" : gamePhase === "playing" ? "default" : "outline"}>
            {gamePhase === "setup" ? "Setup Phase" : gamePhase === "playing" ? (playerTurn ? "Your Turn" : "AI Turn") : winner === "player" ? "Victory!" : "Defeat"}
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
                          disabled={gamePhase !== "playing" || !playerTurn}
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
        <div className="flex justify-center">
          <Button onClick={resetGame} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            New Game
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
