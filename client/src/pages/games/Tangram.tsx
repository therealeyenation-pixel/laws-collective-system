import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Puzzle, Brain, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface TangramPiece {
  id: string;
  name: string;
  color: string;
  points: string; // SVG polygon points
  rotation: number;
  x: number;
  y: number;
  placed: boolean;
}

interface TangramPuzzle {
  id: number;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  silhouette: string; // SVG path
  hint: string;
}

const puzzles: TangramPuzzle[] = [
  {
    id: 1,
    name: "Square",
    difficulty: "easy",
    silhouette: "M50,50 L250,50 L250,250 L50,250 Z",
    hint: "Start with the large triangles in opposite corners",
  },
  {
    id: 2,
    name: "Cat",
    difficulty: "easy",
    silhouette: "M100,50 L150,20 L150,50 L200,20 L200,80 L180,100 L180,200 L120,200 L120,100 L100,80 Z",
    hint: "Use small triangles for the ears",
  },
  {
    id: 3,
    name: "House",
    difficulty: "medium",
    silhouette: "M150,30 L250,130 L250,270 L50,270 L50,130 Z",
    hint: "The large triangle forms the roof",
  },
  {
    id: 4,
    name: "Bird",
    difficulty: "medium",
    silhouette: "M50,150 L100,100 L150,100 L200,50 L250,100 L200,150 L150,150 L100,200 L50,200 Z",
    hint: "Use the parallelogram for the body",
  },
  {
    id: 5,
    name: "Runner",
    difficulty: "hard",
    silhouette: "M120,50 L150,50 L150,100 L180,100 L180,130 L200,150 L180,180 L150,150 L150,200 L180,250 L150,250 L130,200 L100,250 L70,250 L100,200 L100,150 L70,180 L50,150 L70,130 L100,100 L100,50 Z",
    hint: "The square forms the torso",
  },
  {
    id: 6,
    name: "Swan",
    difficulty: "hard",
    silhouette: "M80,80 L120,40 L140,60 L130,100 L180,100 L220,140 L220,200 L180,240 L100,240 L60,200 L60,140 Z",
    hint: "Use a small triangle for the beak",
  },
];

const initialPieces: TangramPiece[] = [
  { id: "lg1", name: "Large Triangle 1", color: "#e74c3c", points: "0,0 100,0 50,50", rotation: 0, x: 20, y: 320, placed: false },
  { id: "lg2", name: "Large Triangle 2", color: "#3498db", points: "0,0 100,0 50,50", rotation: 0, x: 140, y: 320, placed: false },
  { id: "md", name: "Medium Triangle", color: "#2ecc71", points: "0,0 70,0 35,35", rotation: 0, x: 260, y: 330, placed: false },
  { id: "sm1", name: "Small Triangle 1", color: "#9b59b6", points: "0,0 50,0 25,25", rotation: 0, x: 20, y: 400, placed: false },
  { id: "sm2", name: "Small Triangle 2", color: "#f39c12", points: "0,0 50,0 25,25", rotation: 0, x: 90, y: 400, placed: false },
  { id: "sq", name: "Square", color: "#1abc9c", points: "0,0 35,0 35,35 0,35", rotation: 0, x: 160, y: 395, placed: false },
  { id: "para", name: "Parallelogram", color: "#e91e63", points: "0,25 25,0 75,0 50,25", rotation: 0, x: 220, y: 395, placed: false },
];

export default function Tangram() {
  const [pieces, setPieces] = useState<TangramPiece[]>(initialPieces);
  const [currentPuzzle, setCurrentPuzzle] = useState<TangramPuzzle>(puzzles[0]);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completedPuzzles, setCompletedPuzzles] = useState<number[]>([]);
  const [stats, setStats] = useState({ puzzlesSolved: 0, totalTime: 0 });
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("tangram_stats");
    if (saved) {
      setStats(JSON.parse(saved));
    }
    const completed = localStorage.getItem("tangram_completed");
    if (completed) {
      setCompletedPuzzles(JSON.parse(completed));
    }
  }, []);

  const saveStats = (newStats: typeof stats) => {
    localStorage.setItem("tangram_stats", JSON.stringify(newStats));
    setStats(newStats);
  };

  const startGame = () => {
    setPieces(initialPieces.map(p => ({ ...p })));
    setSelectedPiece(null);
    setShowHint(false);
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const selectPuzzle = (puzzle: TangramPuzzle) => {
    setCurrentPuzzle(puzzle);
    setPieces(initialPieces.map(p => ({ ...p })));
    setSelectedPiece(null);
    setShowHint(false);
  };

  const handlePieceClick = (pieceId: string) => {
    if (selectedPiece === pieceId) {
      setSelectedPiece(null);
    } else {
      setSelectedPiece(pieceId);
    }
  };

  const rotatePiece = (pieceId: string, direction: number) => {
    setPieces(prev => prev.map(p => 
      p.id === pieceId 
        ? { ...p, rotation: (p.rotation + direction * 45 + 360) % 360 }
        : p
    ));
  };

  const movePiece = (pieceId: string, dx: number, dy: number) => {
    setPieces(prev => prev.map(p => 
      p.id === pieceId 
        ? { ...p, x: Math.max(0, Math.min(280, p.x + dx)), y: Math.max(0, Math.min(250, p.y + dy)) }
        : p
    ));
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedPiece) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPieces(prev => prev.map(p => 
      p.id === selectedPiece 
        ? { ...p, x: Math.max(0, Math.min(280, x - 25)), y: Math.max(0, Math.min(250, y - 25)), placed: true }
        : p
    ));
    setSelectedPiece(null);
  };

  const checkSolution = () => {
    // Simplified check - in a real implementation, this would verify piece positions
    const allPlaced = pieces.every(p => p.placed);
    if (allPlaced) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const newStats = {
        puzzlesSolved: stats.puzzlesSolved + 1,
        totalTime: stats.totalTime + timeSpent,
      };
      saveStats(newStats);
      
      if (!completedPuzzles.includes(currentPuzzle.id)) {
        const newCompleted = [...completedPuzzles, currentPuzzle.id];
        setCompletedPuzzles(newCompleted);
        localStorage.setItem("tangram_completed", JSON.stringify(newCompleted));
      }
      
      toast.success(`Puzzle completed in ${timeSpent} seconds!`);
    } else {
      toast.error("Not all pieces are placed on the puzzle area");
    }
  };

  const nextPuzzle = () => {
    const currentIndex = puzzles.findIndex(p => p.id === currentPuzzle.id);
    const nextIndex = (currentIndex + 1) % puzzles.length;
    selectPuzzle(puzzles[nextIndex]);
  };

  const prevPuzzle = () => {
    const currentIndex = puzzles.findIndex(p => p.id === currentPuzzle.id);
    const prevIndex = (currentIndex - 1 + puzzles.length) % puzzles.length;
    selectPuzzle(puzzles[prevIndex]);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-100 p-4">
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
            <div className="w-20 h-20 mx-auto mb-6 bg-purple-600 rounded-full flex items-center justify-center">
              <Puzzle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Tangram</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              An ancient Chinese puzzle! Arrange 7 geometric pieces to form shapes and figures.
              Develops spatial reasoning, geometry understanding, and creative problem-solving.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
              <div className="text-center">
                <Brain className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">Spatial Reasoning</p>
              </div>
              <div className="text-center">
                <Puzzle className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">Geometry</p>
              </div>
              <div className="text-center">
                <Lightbulb className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">Creativity</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center mb-6">
              <Badge variant="outline">Ages 5+</Badge>
              <Badge variant="outline">LAND Pillar</Badge>
              <Badge variant="outline">Single Player</Badge>
            </div>

            {stats.puzzlesSolved > 0 && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Your Stats</p>
                <p className="font-medium">
                  {stats.puzzlesSolved} Puzzles Solved | {completedPuzzles.length}/{puzzles.length} Unique
                </p>
              </div>
            )}

            <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Puzzle className="w-5 h-5 mr-2" />
              Start Playing
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-100 p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/game-center">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevPuzzle}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium px-4">
              {currentPuzzle.name}
              {completedPuzzles.includes(currentPuzzle.id) && (
                <Trophy className="w-4 h-4 inline ml-2 text-yellow-500" />
              )}
            </span>
            <Button variant="outline" size="sm" onClick={nextPuzzle}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => selectPuzzle(currentPuzzle)}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Puzzle area */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Puzzle Area</h3>
              <Badge variant={
                currentPuzzle.difficulty === "easy" ? "default" :
                currentPuzzle.difficulty === "medium" ? "secondary" : "destructive"
              }>
                {currentPuzzle.difficulty}
              </Badge>
            </div>
            
            <svg 
              width="300" 
              height="300" 
              className="border rounded bg-gray-100 cursor-pointer"
              onClick={handleCanvasClick}
            >
              {/* Silhouette */}
              <path 
                d={currentPuzzle.silhouette} 
                fill="rgba(0,0,0,0.1)" 
                stroke="#333" 
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              
              {/* Placed pieces */}
              {pieces.filter(p => p.placed).map(piece => (
                <g 
                  key={piece.id}
                  transform={`translate(${piece.x}, ${piece.y}) rotate(${piece.rotation}, 25, 25)`}
                  onClick={(e) => { e.stopPropagation(); handlePieceClick(piece.id); }}
                  className="cursor-pointer"
                >
                  <polygon 
                    points={piece.points} 
                    fill={piece.color}
                    stroke={selectedPiece === piece.id ? "#000" : "#666"}
                    strokeWidth={selectedPiece === piece.id ? 3 : 1}
                  />
                </g>
              ))}
            </svg>
            
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowHint(!showHint)}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
              <Button 
                size="sm" 
                onClick={checkSolution}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Check Solution
              </Button>
            </div>
            
            {showHint && (
              <p className="mt-2 text-sm text-muted-foreground italic">
                💡 {currentPuzzle.hint}
              </p>
            )}
          </Card>

          {/* Pieces tray */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Tangram Pieces</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click a piece to select, then click on the puzzle area to place it.
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {pieces.filter(p => !p.placed).map(piece => (
                <div 
                  key={piece.id}
                  className={`
                    p-2 border rounded cursor-pointer transition-all
                    ${selectedPiece === piece.id ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-purple-300"}
                  `}
                  onClick={() => handlePieceClick(piece.id)}
                >
                  <svg width="80" height="60" className="mx-auto">
                    <g transform={`translate(10, 10) rotate(${piece.rotation}, 30, 20)`}>
                      <polygon 
                        points={piece.points} 
                        fill={piece.color}
                        stroke="#333"
                        strokeWidth="1"
                      />
                    </g>
                  </svg>
                  <p className="text-xs text-center mt-1">{piece.name}</p>
                </div>
              ))}
            </div>
            
            {selectedPiece && (
              <div className="mt-4 p-3 bg-purple-50 rounded">
                <p className="text-sm font-medium mb-2">Selected: {pieces.find(p => p.id === selectedPiece)?.name}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => rotatePiece(selectedPiece, -1)}>
                    ↺ Rotate Left
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rotatePiece(selectedPiece, 1)}>
                    Rotate Right ↻
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Puzzle selector */}
        <Card className="mt-4 p-4">
          <h3 className="font-semibold mb-3">All Puzzles</h3>
          <div className="flex flex-wrap gap-2">
            {puzzles.map(puzzle => (
              <Button
                key={puzzle.id}
                variant={currentPuzzle.id === puzzle.id ? "default" : "outline"}
                size="sm"
                onClick={() => selectPuzzle(puzzle)}
                className={currentPuzzle.id === puzzle.id ? "bg-purple-600" : ""}
              >
                {puzzle.name}
                {completedPuzzles.includes(puzzle.id) && (
                  <Trophy className="w-3 h-3 ml-1 text-yellow-500" />
                )}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
