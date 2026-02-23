import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface Domino {
  left: number;
  right: number;
  id: string;
}

const createDominoes = (): Domino[] => {
  const dominoes: Domino[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      dominoes.push({ left: i, right: j, id: `${i}-${j}` });
    }
  }
  return dominoes;
};

const shuffleDominoes = (dominoes: Domino[]): Domino[] => {
  const shuffled = [...dominoes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Dominoes() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerHand, setPlayerHand] = useState<Domino[]>([]);
  const [aiHand, setAiHand] = useState<Domino[]>([]);
  const [board, setBoard] = useState<Domino[]>([]);
  const [boneyard, setBoneyard] = useState<Domino[]>([]);
  const [leftEnd, setLeftEnd] = useState<number | null>(null);
  const [rightEnd, setRightEnd] = useState<number | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("dominoes_highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    const allDominoes = shuffleDominoes(createDominoes());
    setPlayerHand(allDominoes.slice(0, 7));
    setAiHand(allDominoes.slice(7, 14));
    setBoneyard(allDominoes.slice(14));
    setBoard([]);
    setLeftEnd(null);
    setRightEnd(null);
    setIsPlayerTurn(true);
    setGameStarted(true);
  };

  const canPlay = (domino: Domino): boolean => {
    if (board.length === 0) return true;
    return domino.left === leftEnd || domino.right === leftEnd || 
           domino.left === rightEnd || domino.right === rightEnd;
  };

  const playDomino = (domino: Domino, side: "left" | "right") => {
    if (!isPlayerTurn) return;
    
    let newDomino = { ...domino };
    
    if (board.length === 0) {
      setBoard([newDomino]);
      setLeftEnd(newDomino.left);
      setRightEnd(newDomino.right);
    } else if (side === "left") {
      if (newDomino.right === leftEnd) {
        setBoard([newDomino, ...board]);
        setLeftEnd(newDomino.left);
      } else if (newDomino.left === leftEnd) {
        newDomino = { ...newDomino, left: newDomino.right, right: newDomino.left };
        setBoard([newDomino, ...board]);
        setLeftEnd(newDomino.left);
      } else {
        toast.error("Can't play here");
        return;
      }
    } else {
      if (newDomino.left === rightEnd) {
        setBoard([...board, newDomino]);
        setRightEnd(newDomino.right);
      } else if (newDomino.right === rightEnd) {
        newDomino = { ...newDomino, left: newDomino.right, right: newDomino.left };
        setBoard([...board, newDomino]);
        setRightEnd(newDomino.right);
      } else {
        toast.error("Can't play here");
        return;
      }
    }
    
    setPlayerHand(playerHand.filter(d => d.id !== domino.id));
    setIsPlayerTurn(false);
    
    if (playerHand.length === 1) {
      const newScore = score.player + 1;
      setScore({ ...score, player: newScore });
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("dominoes_highscore", newScore.toString());
      }
      toast.success("You win this round!");
      setTimeout(startGame, 2000);
      return;
    }
    
    setTimeout(aiTurn, 1000);
  };

  const drawFromBoneyard = () => {
    if (boneyard.length === 0) {
      toast.info("Boneyard is empty, passing turn");
      setIsPlayerTurn(false);
      setTimeout(aiTurn, 1000);
      return;
    }
    const drawn = boneyard[0];
    setPlayerHand([...playerHand, drawn]);
    setBoneyard(boneyard.slice(1));
    toast.info("Drew from boneyard");
  };

  const aiTurn = () => {
    const playable = aiHand.filter(canPlay);
    
    if (playable.length === 0) {
      if (boneyard.length > 0) {
        const drawn = boneyard[0];
        setAiHand([...aiHand, drawn]);
        setBoneyard(boneyard.slice(1));
        toast.info("AI drew from boneyard");
        setTimeout(aiTurn, 500);
        return;
      } else {
        toast.info("AI passes");
        setIsPlayerTurn(true);
        return;
      }
    }
    
    const domino = playable[0];
    let newDomino = { ...domino };
    
    if (board.length === 0) {
      setBoard([newDomino]);
      setLeftEnd(newDomino.left);
      setRightEnd(newDomino.right);
    } else if (newDomino.left === rightEnd || newDomino.right === rightEnd) {
      if (newDomino.left === rightEnd) {
        setBoard([...board, newDomino]);
        setRightEnd(newDomino.right);
      } else {
        newDomino = { ...newDomino, left: newDomino.right, right: newDomino.left };
        setBoard([...board, newDomino]);
        setRightEnd(newDomino.right);
      }
    } else {
      if (newDomino.right === leftEnd) {
        setBoard([newDomino, ...board]);
        setLeftEnd(newDomino.left);
      } else {
        newDomino = { ...newDomino, left: newDomino.right, right: newDomino.left };
        setBoard([newDomino, ...board]);
        setLeftEnd(newDomino.left);
      }
    }
    
    setAiHand(aiHand.filter(d => d.id !== domino.id));
    
    if (aiHand.length === 1) {
      setScore({ ...score, ai: score.ai + 1 });
      toast.error("AI wins this round!");
      setTimeout(startGame, 2000);
      return;
    }
    
    setIsPlayerTurn(true);
  };

  const DominoPiece = ({ domino, onClick, disabled }: { domino: Domino; onClick?: () => void; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex bg-white rounded-lg shadow-md p-1 ${onClick && !disabled ? "hover:bg-gray-100 cursor-pointer" : ""} ${disabled ? "opacity-50" : ""}`}
    >
      <div className="w-8 h-8 flex items-center justify-center border-r border-gray-300">
        <span className="text-lg font-bold">{domino.left}</span>
      </div>
      <div className="w-8 h-8 flex items-center justify-center">
        <span className="text-lg font-bold">{domino.right}</span>
      </div>
    </button>
  );

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 to-stone-800 p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/game-center">
              <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Center
              </Button>
            </Link>
          </div>

          <Card className="p-8 text-center bg-stone-800 border-stone-700">
            <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold">⚀⚅</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-white">Dominoes</h1>
            <p className="text-stone-300 mb-6 max-w-md mx-auto">
              Match domino ends to play your tiles. First to empty their hand wins!
            </p>

            <div className="flex gap-4 justify-center mb-6">
              <Badge variant="outline" className="border-stone-600 text-stone-300">Ages 6+</Badge>
              <Badge variant="outline" className="border-stone-600 text-stone-300">SELF Pillar</Badge>
            </div>

            {highScore > 0 && (
              <div className="mb-6 p-4 bg-stone-700 rounded-lg">
                <p className="text-sm text-stone-400">Rounds Won</p>
                <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
              </div>
            )}

            <Button onClick={startGame} size="lg" className="bg-white text-stone-800 hover:bg-stone-100">
              Start Game
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const hasPlayable = playerHand.some(canPlay);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 to-stone-800 p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/game-center">
            <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Badge className="bg-blue-600">You: {score.player}</Badge>
            <Badge className="bg-red-600">AI: {score.ai}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={startGame} className="text-white">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <Card className="p-4 mb-4 bg-stone-800 border-stone-700">
          <p className="text-stone-400 text-sm mb-2">AI Hand: {aiHand.length} tiles</p>
        </Card>

        <Card className="p-4 mb-4 bg-green-900 border-green-800 min-h-[100px]">
          <div className="flex flex-wrap justify-center gap-2">
            {board.map((domino, i) => (
              <DominoPiece key={i} domino={domino} />
            ))}
            {board.length === 0 && (
              <p className="text-green-400">Play a domino to start</p>
            )}
          </div>
          {board.length > 0 && (
            <div className="flex justify-between mt-2 text-sm text-green-400">
              <span>Left: {leftEnd}</span>
              <span>Right: {rightEnd}</span>
            </div>
          )}
        </Card>

        <Card className="p-4 bg-stone-800 border-stone-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-stone-400 text-sm">Your Hand ({playerHand.length})</p>
            <Badge className={isPlayerTurn ? "bg-green-600" : "bg-gray-600"}>
              {isPlayerTurn ? "Your Turn" : "AI Thinking..."}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {playerHand.map(domino => (
              <div key={domino.id} className="flex gap-1">
                {board.length === 0 ? (
                  <DominoPiece 
                    domino={domino} 
                    onClick={() => playDomino(domino, "left")}
                    disabled={!isPlayerTurn}
                  />
                ) : (
                  <>
                    {(domino.left === leftEnd || domino.right === leftEnd) && (
                      <Button size="sm" variant="outline" onClick={() => playDomino(domino, "left")} disabled={!isPlayerTurn}>
                        ←
                      </Button>
                    )}
                    <DominoPiece domino={domino} disabled={!canPlay(domino)} />
                    {(domino.left === rightEnd || domino.right === rightEnd) && (
                      <Button size="sm" variant="outline" onClick={() => playDomino(domino, "right")} disabled={!isPlayerTurn}>
                        →
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          {!hasPlayable && boneyard.length > 0 && isPlayerTurn && (
            <Button onClick={drawFromBoneyard} className="w-full">
              Draw from Boneyard ({boneyard.length} left)
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
