import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

interface ScoreCard {
  ones: number | null;
  twos: number | null;
  threes: number | null;
  fours: number | null;
  fives: number | null;
  sixes: number | null;
  threeOfKind: number | null;
  fourOfKind: number | null;
  fullHouse: number | null;
  smallStraight: number | null;
  largeStraight: number | null;
  yahtzee: number | null;
  chance: number | null;
}

const initialScoreCard: ScoreCard = {
  ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
  threeOfKind: null, fourOfKind: null, fullHouse: null,
  smallStraight: null, largeStraight: null, yahtzee: null, chance: null,
};

export default function Yahtzee() {
  const [gameStarted, setGameStarted] = useState(false);
  const [dice, setDice] = useState([1, 1, 1, 1, 1]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState(3);
  const [scoreCard, setScoreCard] = useState<ScoreCard>(initialScoreCard);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("yahtzee_highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setDice([1, 1, 1, 1, 1]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
    setScoreCard(initialScoreCard);
    setGameStarted(true);
  };

  const rollDice = () => {
    if (rollsLeft <= 0) return;
    const newDice = dice.map((d, i) => held[i] ? d : Math.floor(Math.random() * 6) + 1);
    setDice(newDice);
    setRollsLeft(rollsLeft - 1);
  };

  const toggleHold = (index: number) => {
    if (rollsLeft === 3) return;
    const newHeld = [...held];
    newHeld[index] = !newHeld[index];
    setHeld(newHeld);
  };

  const calculateScore = (category: keyof ScoreCard): number => {
    const counts = [0, 0, 0, 0, 0, 0];
    dice.forEach(d => counts[d - 1]++);
    const sum = dice.reduce((a, b) => a + b, 0);
    const sorted = [...dice].sort();

    switch (category) {
      case "ones": return counts[0] * 1;
      case "twos": return counts[1] * 2;
      case "threes": return counts[2] * 3;
      case "fours": return counts[3] * 4;
      case "fives": return counts[4] * 5;
      case "sixes": return counts[5] * 6;
      case "threeOfKind": return counts.some(c => c >= 3) ? sum : 0;
      case "fourOfKind": return counts.some(c => c >= 4) ? sum : 0;
      case "fullHouse": return counts.includes(3) && counts.includes(2) ? 25 : 0;
      case "smallStraight":
        const s = sorted.join("");
        return s.includes("1234") || s.includes("2345") || s.includes("3456") ? 30 : 0;
      case "largeStraight":
        return sorted.join("") === "12345" || sorted.join("") === "23456" ? 40 : 0;
      case "yahtzee": return counts.includes(5) ? 50 : 0;
      case "chance": return sum;
      default: return 0;
    }
  };

  const selectCategory = (category: keyof ScoreCard) => {
    if (scoreCard[category] !== null || rollsLeft === 3) return;
    
    const score = calculateScore(category);
    const newScoreCard = { ...scoreCard, [category]: score };
    setScoreCard(newScoreCard);
    
    const total = Object.values(newScoreCard).reduce((a, b) => (a || 0) + (b || 0), 0) as number;
    if (total > highScore) {
      setHighScore(total);
      localStorage.setItem("yahtzee_highscore", total.toString());
    }
    
    setDice([1, 1, 1, 1, 1]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
    
    const remaining = Object.values(newScoreCard).filter(v => v === null).length;
    if (remaining === 0) {
      toast.success(`Game Over! Final Score: ${total}`);
    } else {
      toast.success(`Scored ${score} points!`);
    }
  };

  const getTotal = () => Object.values(scoreCard).reduce((a, b) => (a || 0) + (b || 0), 0) as number;

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 to-red-800 p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/game-center">
              <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Center
              </Button>
            </Link>
          </div>

          <Card className="p-8 text-center bg-red-800 border-red-700">
            <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-xl flex items-center justify-center">
              <Dice5 className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-white">Yahtzee</h1>
            <p className="text-red-200 mb-6 max-w-md mx-auto">
              Roll five dice to make scoring combinations. Strategic decisions and probability!
            </p>

            <div className="flex gap-4 justify-center mb-6">
              <Badge variant="outline" className="border-red-600 text-red-200">Ages 8+</Badge>
              <Badge variant="outline" className="border-red-600 text-red-200">SELF Pillar</Badge>
            </div>

            {highScore > 0 && (
              <div className="mb-6 p-4 bg-red-700 rounded-lg">
                <p className="text-sm text-red-300">High Score</p>
                <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
              </div>
            )}

            <Button onClick={startGame} size="lg" className="bg-white text-red-800 hover:bg-red-100">
              Start Game
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-red-800 p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/game-center">
            <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Badge className="bg-yellow-600">Score: {getTotal()}</Badge>
          <Button variant="ghost" size="sm" onClick={startGame} className="text-white">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <Card className="p-6 mb-4 bg-red-800 border-red-700">
          <div className="flex justify-center gap-4 mb-4">
            {dice.map((d, i) => {
              const DiceIcon = diceIcons[d - 1];
              return (
                <button
                  key={i}
                  onClick={() => toggleHold(i)}
                  className={`p-4 rounded-xl transition-all ${held[i] ? "bg-yellow-500" : "bg-white"}`}
                >
                  <DiceIcon className={`w-10 h-10 ${held[i] ? "text-white" : "text-red-600"}`} />
                </button>
              );
            })}
          </div>
          <div className="text-center">
            <Button onClick={rollDice} disabled={rollsLeft <= 0} className="bg-white text-red-800 hover:bg-red-100">
              Roll ({rollsLeft} left)
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-red-800 border-red-700">
          <h3 className="text-white font-bold mb-3">Score Card</h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(scoreCard) as (keyof ScoreCard)[]).map(cat => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                disabled={scoreCard[cat] !== null || rollsLeft === 3}
                className={`p-2 rounded text-left flex justify-between ${
                  scoreCard[cat] !== null 
                    ? "bg-red-700 text-red-300" 
                    : rollsLeft === 3 
                      ? "bg-red-700/50 text-red-400"
                      : "bg-white text-red-800 hover:bg-red-100"
                }`}
              >
                <span className="capitalize">{cat.replace(/([A-Z])/g, " $1")}</span>
                <span>{scoreCard[cat] !== null ? scoreCard[cat] : rollsLeft < 3 ? calculateScore(cat) : "-"}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
