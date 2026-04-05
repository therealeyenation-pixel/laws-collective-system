import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const tileTypes = ["🀀", "🀁", "🀂", "🀃", "🀄", "🀅", "🀆", "🀇", "🀈", "🀉", "🀊", "🀋", "🀌", "🀍", "🀎", "🀏", "🀐", "🀑", "🀒", "🀓", "🀔", "🀕", "🀖", "🀗", "🀘", "🀙", "🀚", "🀛", "🀜", "🀝", "🀞", "🀟", "🀠", "🀡"];

interface Tile {
  id: number;
  type: string;
  row: number;
  col: number;
  layer: number;
  matched: boolean;
}

export default function MahjongSolitaire() {
  const [gameStarted, setGameStarted] = useState(false);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("mahjong_highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const generateTiles = (): Tile[] => {
    const layout: { row: number; col: number; layer: number }[] = [];
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        layout.push({ row, col, layer: 0 });
      }
    }
    for (let row = 0.5; row < 3; row++) {
      for (let col = 1; col < 7; col++) {
        layout.push({ row, col, layer: 1 });
      }
    }
    for (let row = 1; row < 2.5; row++) {
      for (let col = 2; col < 6; col++) {
        layout.push({ row, col, layer: 2 });
      }
    }
    layout.push({ row: 1.5, col: 3.5, layer: 3 });
    
    const numPairs = Math.floor(layout.length / 2);
    const selectedTypes: string[] = [];
    for (let i = 0; i < numPairs; i++) {
      const type = tileTypes[i % tileTypes.length];
      selectedTypes.push(type, type);
    }
    
    for (let i = selectedTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedTypes[i], selectedTypes[j]] = [selectedTypes[j], selectedTypes[i]];
    }
    
    return layout.slice(0, selectedTypes.length).map((pos, i) => ({
      id: i,
      type: selectedTypes[i],
      ...pos,
      matched: false,
    }));
  };

  const startGame = () => {
    setTiles(generateTiles());
    setSelectedTile(null);
    setScore(0);
    setHintsUsed(0);
    setGameStarted(true);
  };

  const isTileFree = (tile: Tile): boolean => {
    if (tile.matched) return false;
    
    const hasBlockingAbove = tiles.some(t => 
      !t.matched &&
      t.layer > tile.layer &&
      Math.abs(t.row - tile.row) < 1 &&
      Math.abs(t.col - tile.col) < 1
    );
    if (hasBlockingAbove) return false;
    
    const hasLeftNeighbor = tiles.some(t =>
      !t.matched &&
      t.layer === tile.layer &&
      Math.abs(t.row - tile.row) < 1 &&
      t.col === tile.col - 1
    );
    const hasRightNeighbor = tiles.some(t =>
      !t.matched &&
      t.layer === tile.layer &&
      Math.abs(t.row - tile.row) < 1 &&
      t.col === tile.col + 1
    );
    
    return !hasLeftNeighbor || !hasRightNeighbor;
  };

  const handleTileClick = (tile: Tile) => {
    if (!isTileFree(tile)) {
      toast.error("This tile is blocked");
      return;
    }
    
    if (selectedTile === null) {
      setSelectedTile(tile);
    } else if (selectedTile.id === tile.id) {
      setSelectedTile(null);
    } else if (selectedTile.type === tile.type) {
      const newTiles = tiles.map(t =>
        t.id === tile.id || t.id === selectedTile.id
          ? { ...t, matched: true }
          : t
      );
      setTiles(newTiles);
      setSelectedTile(null);
      const newScore = score + 100;
      setScore(newScore);
      
      const remaining = newTiles.filter(t => !t.matched);
      if (remaining.length === 0) {
        const finalScore = newScore - hintsUsed * 50;
        if (finalScore > highScore) {
          setHighScore(finalScore);
          localStorage.setItem("mahjong_highscore", finalScore.toString());
        }
        toast.success(`You win! Final score: ${finalScore}`);
      }
    } else {
      toast.error("Tiles don't match");
      setSelectedTile(tile);
    }
  };

  const findHint = () => {
    const freeTiles = tiles.filter(t => !t.matched && isTileFree(t));
    for (let i = 0; i < freeTiles.length; i++) {
      for (let j = i + 1; j < freeTiles.length; j++) {
        if (freeTiles[i].type === freeTiles[j].type) {
          setSelectedTile(freeTiles[i]);
          setHintsUsed(hintsUsed + 1);
          toast.info(`Hint: Match the ${freeTiles[i].type} tiles (-50 points)`);
          return;
        }
      }
    }
    toast.error("No moves available!");
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-800 p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/game-center">
              <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Center
              </Button>
            </Link>
          </div>

          <Card className="p-8 text-center bg-emerald-800 border-emerald-700">
            <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-xl flex items-center justify-center">
              <span className="text-4xl">🀄</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-white">Mahjong Solitaire</h1>
            <p className="text-emerald-200 mb-6 max-w-md mx-auto">
              Match pairs of identical tiles to clear the board. Only free tiles can be selected!
            </p>

            <div className="flex gap-4 justify-center mb-6">
              <Badge variant="outline" className="border-emerald-600 text-emerald-200">Ages 8+</Badge>
              <Badge variant="outline" className="border-emerald-600 text-emerald-200">SELF Pillar</Badge>
            </div>

            {highScore > 0 && (
              <div className="mb-6 p-4 bg-emerald-700 rounded-lg">
                <p className="text-sm text-emerald-300">High Score</p>
                <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
              </div>
            )}

            <Button onClick={startGame} size="lg" className="bg-white text-emerald-800 hover:bg-emerald-100">
              Start Game
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const remainingTiles = tiles.filter(t => !t.matched).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-800 p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/game-center">
            <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Badge className="bg-yellow-600">Score: {score}</Badge>
            <Badge className="bg-blue-600">Tiles: {remainingTiles}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={findHint} className="text-white">
              <Lightbulb className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={startGame} className="text-white">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card className="p-6 bg-emerald-800 border-emerald-700 overflow-auto">
          <div className="relative min-h-[300px]" style={{ width: "500px", margin: "0 auto" }}>
            {tiles.filter(t => !t.matched).sort((a, b) => a.layer - b.layer).map(tile => {
              const isFree = isTileFree(tile);
              const isSelected = selectedTile?.id === tile.id;
              
              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile)}
                  className={`absolute w-12 h-16 rounded-lg flex items-center justify-center text-2xl transition-all ${
                    isSelected
                      ? "bg-yellow-400 ring-2 ring-yellow-300"
                      : isFree
                        ? "bg-white hover:bg-gray-100 cursor-pointer"
                        : "bg-gray-300 cursor-not-allowed"
                  }`}
                  style={{
                    left: `${tile.col * 55 + tile.layer * 4}px`,
                    top: `${tile.row * 65 - tile.layer * 4}px`,
                    zIndex: tile.layer * 10 + Math.floor(tile.row),
                    boxShadow: `${2 + tile.layer * 2}px ${2 + tile.layer * 2}px 4px rgba(0,0,0,0.3)`,
                  }}
                >
                  {tile.type}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
