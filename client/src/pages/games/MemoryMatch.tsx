import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RotateCcw, Trophy, Clock, Zap, Star } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type CardType = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type Difficulty = "easy" | "medium" | "hard";

const emojis = ["🌟", "🎯", "🎨", "🎭", "🎪", "🎢", "🎡", "🎠", "🏆", "💎", "🔮", "🎲", "🎮", "🎸", "🎺", "🎻", "🎹", "🥁"];

const difficultySettings: Record<Difficulty, { pairs: number; cols: number }> = {
  easy: { pairs: 6, cols: 4 },
  medium: { pairs: 8, cols: 4 },
  hard: { pairs: 12, cols: 6 },
};

export default function MemoryMatch() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [bestScores, setBestScores] = useState<Record<Difficulty, number>>({
    easy: Infinity,
    medium: Infinity,
    hard: Infinity,
  });

  const initializeGame = () => {
    const { pairs } = difficultySettings[difficulty];
    const selectedEmojis = emojis.slice(0, pairs);
    const cardPairs = [...selectedEmojis, ...selectedEmojis];
    
    // Shuffle cards
    const shuffled = cardPairs
      .map((emoji, idx) => ({
        id: idx,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStarted(false);
    setGameComplete(false);
    setTimer(0);
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameComplete]);

  // Check for matches
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, idx) =>
              idx === first || idx === second
                ? { ...card, isMatched: true, isFlipped: true }
                : card
            )
          );
          setMatches((prev) => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, idx) =>
              idx === first || idx === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards]);

  // Check for game completion
  useEffect(() => {
    const { pairs } = difficultySettings[difficulty];
    if (matches === pairs && matches > 0) {
      setGameComplete(true);
      if (moves < bestScores[difficulty]) {
        setBestScores((prev) => ({ ...prev, [difficulty]: moves }));
        toast.success(`New best score: ${moves} moves! 🎉`);
      } else {
        toast.success("Congratulations! You found all pairs! 🎉");
      }
    }
  }, [matches]);

  const handleCardClick = (idx: number) => {
    if (!gameStarted) setGameStarted(true);
    
    if (
      flippedCards.length >= 2 ||
      cards[idx].isFlipped ||
      cards[idx].isMatched
    ) {
      return;
    }

    setCards((prev) =>
      prev.map((card, i) => (i === idx ? { ...card, isFlipped: true } : card))
    );
    setFlippedCards((prev) => [...prev, idx]);
    
    if (flippedCards.length === 1) {
      setMoves((prev) => prev + 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const { cols } = difficultySettings[difficulty];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Memory Match</h1>
              <p className="text-sm text-muted-foreground">Find all matching pairs</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Zap className="w-3 h-3" />
            {difficulty === "easy" ? "Easy" : difficulty === "medium" ? "Medium" : "Hard"}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{moves}</p>
              <p className="text-xs text-muted-foreground">Moves</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{matches}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(timer)}
              </p>
              <p className="text-xs text-muted-foreground">Time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {bestScores[difficulty] === Infinity ? "-" : bestScores[difficulty]}
              </p>
              <p className="text-xs text-muted-foreground">Best</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {gameComplete ? (
                    <>
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Congratulations!
                    </>
                  ) : (
                    "Find the Pairs"
                  )}
                </CardTitle>
                <CardDescription>
                  {gameComplete
                    ? `Completed in ${moves} moves and ${formatTime(timer)}`
                    : "Click cards to flip them and find matching pairs"}
                </CardDescription>
              </div>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (12)</SelectItem>
                  <SelectItem value="medium">Medium (16)</SelectItem>
                  <SelectItem value="hard">Hard (24)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {/* Card Grid */}
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {cards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    disabled={card.isFlipped || card.isMatched}
                    className={`
                      w-14 h-14 md:w-16 md:h-16 text-2xl md:text-3xl rounded-lg
                      transition-all duration-300 transform
                      ${
                        card.isFlipped || card.isMatched
                          ? "bg-primary/10 rotate-0"
                          : "bg-secondary hover:bg-secondary/80 rotate-y-180"
                      }
                      ${card.isMatched ? "opacity-60 scale-95" : ""}
                    `}
                  >
                    {card.isFlipped || card.isMatched ? card.emoji : "❓"}
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex gap-2 mt-4">
                <Button onClick={initializeGame} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  New Game
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
            <p>• Click on any card to flip it and reveal the emoji</p>
            <p>• Click a second card to try and find a match</p>
            <p>• If the cards match, they stay face up</p>
            <p>• If they don't match, they flip back over</p>
            <p>• Find all pairs in the fewest moves possible!</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
