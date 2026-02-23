import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Mancala() {
  const [gameStarted, setGameStarted] = useState(false);
  const [pits, setPits] = useState<number[]>([4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("mancala_highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setPits([4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
    setIsPlayerTurn(true);
    setGameOver(false);
    setGameStarted(true);
  };

  const checkGameOver = (newPits: number[]): boolean => {
    const playerEmpty = newPits.slice(0, 6).every(p => p === 0);
    const aiEmpty = newPits.slice(7, 13).every(p => p === 0);
    return playerEmpty || aiEmpty;
  };

  const collectRemaining = (newPits: number[]): number[] => {
    const result = [...newPits];
    for (let i = 0; i < 6; i++) {
      result[6] += result[i];
      result[i] = 0;
    }
    for (let i = 7; i < 13; i++) {
      result[13] += result[i];
      result[i] = 0;
    }
    return result;
  };

  const makeMove = (pitIndex: number) => {
    if (!isPlayerTurn || gameOver || pits[pitIndex] === 0) return;
    if (pitIndex < 0 || pitIndex > 5) return;

    let newPits = [...pits];
    let stones = newPits[pitIndex];
    newPits[pitIndex] = 0;
    let currentPit = pitIndex;

    while (stones > 0) {
      currentPit = (currentPit + 1) % 14;
      if (currentPit === 13) continue;
      newPits[currentPit]++;
      stones--;
    }

    if (currentPit >= 0 && currentPit <= 5 && newPits[currentPit] === 1) {
      const oppositePit = 12 - currentPit;
      if (newPits[oppositePit] > 0) {
        newPits[6] += newPits[currentPit] + newPits[oppositePit];
        newPits[currentPit] = 0;
        newPits[oppositePit] = 0;
      }
    }

    if (checkGameOver(newPits)) {
      newPits = collectRemaining(newPits);
      setPits(newPits);
      setGameOver(true);
      const playerScore = newPits[6];
      if (playerScore > highScore) {
        setHighScore(playerScore);
        localStorage.setItem("mancala_highscore", playerScore.toString());
      }
      if (playerScore > newPits[13]) {
        toast.success("You win!");
      } else if (playerScore < newPits[13]) {
        toast.error("AI wins!");
      } else {
        toast.info("It's a tie!");
      }
      return;
    }

    setPits(newPits);
    
    if (currentPit !== 6) {
      setIsPlayerTurn(false);
      setTimeout(() => aiMove(newPits), 1000);
    }
  };

  const aiMove = (currentPits: number[]) => {
    let newPits = [...currentPits];
    let extraTurn = true;

    while (extraTurn) {
      const validMoves = [];
      for (let i = 7; i <= 12; i++) {
        if (newPits[i] > 0) validMoves.push(i);
      }

      if (validMoves.length === 0) break;

      const pitIndex = validMoves[Math.floor(Math.random() * validMoves.length)];
      let stones = newPits[pitIndex];
      newPits[pitIndex] = 0;
      let currentPit = pitIndex;

      while (stones > 0) {
        currentPit = (currentPit + 1) % 14;
        if (currentPit === 6) continue;
        newPits[currentPit]++;
        stones--;
      }

      if (currentPit >= 7 && currentPit <= 12 && newPits[currentPit] === 1) {
        const oppositePit = 12 - currentPit;
        if (newPits[oppositePit] > 0) {
          newPits[13] += newPits[currentPit] + newPits[oppositePit];
          newPits[currentPit] = 0;
          newPits[oppositePit] = 0;
        }
      }

      extraTurn = currentPit === 13;
    }

    if (checkGameOver(newPits)) {
      newPits = collectRemaining(newPits);
      setPits(newPits);
      setGameOver(true);
      const playerScore = newPits[6];
      if (playerScore > highScore) {
        setHighScore(playerScore);
        localStorage.setItem("mancala_highscore", playerScore.toString());
      }
      if (playerScore > newPits[13]) {
        toast.success("You win!");
      } else if (playerScore < newPits[13]) {
        toast.error("AI wins!");
      } else {
        toast.info("It's a tie!");
      }
      return;
    }

    setPits(newPits);
    setIsPlayerTurn(true);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-800 to-amber-700 p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/game-center">
              <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Center
              </Button>
            </Link>
          </div>

          <Card className="p-8 text-center bg-amber-700 border-amber-600">
            <div className="w-20 h-20 mx-auto mb-6 bg-amber-900 rounded-full flex items-center justify-center">
              <span className="text-3xl">🥜</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-white">Mancala</h1>
            <p className="text-amber-200 mb-6 max-w-md mx-auto">
              Ancient strategy game. Capture more stones than your opponent by sowing seeds around the board.
            </p>

            <div className="flex gap-4 justify-center mb-6">
              <Badge variant="outline" className="border-amber-500 text-amber-200">Ages 6+</Badge>
              <Badge variant="outline" className="border-amber-500 text-amber-200">SELF Pillar</Badge>
            </div>

            {highScore > 0 && (
              <div className="mb-6 p-4 bg-amber-800 rounded-lg">
                <p className="text-sm text-amber-300">Best Score</p>
                <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
              </div>
            )}

            <Button onClick={startGame} size="lg" className="bg-amber-900 text-white hover:bg-amber-950">
              Start Game
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-800 to-amber-700 p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/game-center">
            <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Badge className={isPlayerTurn ? "bg-green-600" : "bg-gray-600"}>
            {gameOver ? "Game Over" : isPlayerTurn ? "Your Turn" : "AI Thinking..."}
          </Badge>
          <Button variant="ghost" size="sm" onClick={startGame} className="text-white">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <Card className="p-6 bg-amber-900 border-amber-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-32 bg-amber-800 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{pits[13]}</span>
            </div>

            <div className="flex-1">
              <div className="flex justify-between mb-2">
                {[12, 11, 10, 9, 8, 7].map(i => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center"
                  >
                    <span className="text-lg font-bold text-amber-300">{pits[i]}</span>
                  </div>
                ))}
              </div>
              <div className="text-center text-amber-400 text-xs mb-2">← AI Side</div>
              <div className="text-center text-amber-400 text-xs mb-2">Your Side →</div>
              <div className="flex justify-between">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    onClick={() => makeMove(i)}
                    disabled={!isPlayerTurn || gameOver || pits[i] === 0}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isPlayerTurn && !gameOver && pits[i] > 0
                        ? "bg-amber-600 hover:bg-amber-500 cursor-pointer"
                        : "bg-amber-800"
                    }`}
                  >
                    <span className="text-lg font-bold text-white">{pits[i]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-16 h-32 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{pits[6]}</span>
            </div>
          </div>
        </Card>

        <Card className="mt-4 p-4 bg-amber-800 border-amber-700">
          <div className="flex justify-between text-white">
            <span>Your Store: {pits[6]}</span>
            <span>AI Store: {pits[13]}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
