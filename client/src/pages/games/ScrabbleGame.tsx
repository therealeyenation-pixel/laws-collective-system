import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Shuffle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const letterValues: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};

const commonWords = ["CAT", "DOG", "HAT", "BAT", "RAT", "SAT", "MAT", "PAT", "TAT", "VAT", "THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL", "CAN", "HAD", "HER", "WAS", "ONE", "OUR", "OUT", "DAY", "GET", "HAS", "HIM", "HIS", "HOW", "ITS", "MAY", "NEW", "NOW", "OLD", "SEE", "TWO", "WAY", "WHO", "BOY", "DID", "OWN", "SAY", "SHE", "TOO", "USE", "WORD", "WORK", "WORLD", "YEAR", "BACK", "BEEN", "CALL", "COME", "COULD", "EACH", "FIND", "FIRST", "FROM", "GIVE", "GOOD", "GREAT", "HAND", "HAVE", "HIGH", "HOME", "JUST", "KEEP", "KNOW", "LAST", "LIFE", "LIKE", "LITTLE", "LONG", "LOOK", "MADE", "MAKE", "MANY", "MORE", "MOST", "MUCH", "MUST", "NAME", "NEED", "NEVER", "NEXT", "ONLY", "OTHER", "OVER", "PART", "PEOPLE", "PLACE", "POINT", "RIGHT", "SAME", "SEEM", "SHOULD", "SHOW", "SMALL", "SOME", "SOUND", "STILL", "SUCH", "TAKE", "TELL", "THAN", "THAT", "THEIR", "THEM", "THEN", "THERE", "THESE", "THEY", "THING", "THINK", "THIS", "TIME", "TURN", "UNDER", "WANT", "WATER", "WELL", "WERE", "WHAT", "WHEN", "WHERE", "WHICH", "WHILE", "WITH", "WOULD", "WRITE"];

export default function ScrabbleGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [tiles, setTiles] = useState<string[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [wordsFound, setWordsFound] = useState<string[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    const saved = localStorage.getItem("scrabble_highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && gameStarted) {
      toast.success(`Time's up! Final score: ${score}`);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("scrabble_highscore", score.toString());
      }
    }
  }, [timeLeft]);

  const generateTiles = () => {
    const vowels = "AEIOU";
    const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
    const tiles: string[] = [];
    for (let i = 0; i < 3; i++) tiles.push(vowels[Math.floor(Math.random() * vowels.length)]);
    for (let i = 0; i < 4; i++) tiles.push(consonants[Math.floor(Math.random() * consonants.length)]);
    return tiles.sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    setTiles(generateTiles());
    setSelectedTiles([]);
    setScore(0);
    setWordsFound([]);
    setTimeLeft(120);
    setGameStarted(true);
  };

  const toggleTile = (index: number) => {
    if (selectedTiles.includes(index)) {
      setSelectedTiles(selectedTiles.filter(i => i !== index));
    } else {
      setSelectedTiles([...selectedTiles, index]);
    }
  };

  const submitWord = () => {
    const word = selectedTiles.map(i => tiles[i]).join("");
    if (word.length < 2) {
      toast.error("Word must be at least 2 letters");
      return;
    }
    if (wordsFound.includes(word)) {
      toast.error("Already found this word");
      return;
    }
    if (!commonWords.includes(word)) {
      toast.error("Not a valid word");
      return;
    }
    
    const wordScore = word.split("").reduce((sum, letter) => sum + (letterValues[letter] || 0), 0);
    const bonus = word.length >= 5 ? word.length * 2 : 0;
    const totalScore = wordScore + bonus;
    
    setScore(score + totalScore);
    setWordsFound([...wordsFound, word]);
    setSelectedTiles([]);
    toast.success(`+${totalScore} points!`);
  };

  const shuffleTiles = () => {
    setTiles([...tiles].sort(() => Math.random() - 0.5));
    setSelectedTiles([]);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 to-amber-800 p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/game-center">
              <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Center
              </Button>
            </Link>
          </div>

          <Card className="p-8 text-center bg-amber-800 border-amber-700">
            <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl font-bold text-amber-800">ABC</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-white">Scrabble</h1>
            <p className="text-amber-200 mb-6 max-w-md mx-auto">
              Build words from letter tiles to score points. Longer words earn bonus points!
            </p>

            <div className="flex gap-4 justify-center mb-6">
              <Badge variant="outline" className="border-amber-600 text-amber-200">Ages 8+</Badge>
              <Badge variant="outline" className="border-amber-600 text-amber-200">AIR Pillar</Badge>
            </div>

            {highScore > 0 && (
              <div className="mb-6 p-4 bg-amber-700 rounded-lg">
                <p className="text-sm text-amber-300">High Score</p>
                <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
              </div>
            )}

            <Button onClick={startGame} size="lg" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
              Start Game
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 to-amber-800 p-4">
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
            <Badge className={`${timeLeft < 30 ? "bg-red-600" : "bg-blue-600"}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={startGame} className="text-white">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <Card className="p-6 mb-4 bg-amber-800 border-amber-700">
          <div className="flex justify-center gap-2 mb-4">
            {tiles.map((letter, i) => (
              <button
                key={i}
                onClick={() => toggleTile(i)}
                className={`w-14 h-14 rounded-lg font-bold text-xl relative ${
                  selectedTiles.includes(i) ? "bg-yellow-500 text-white" : "bg-amber-100 text-amber-800"
                }`}
              >
                {letter}
                <span className="absolute bottom-1 right-1 text-xs">{letterValues[letter]}</span>
              </button>
            ))}
          </div>
          
          <div className="text-center mb-4">
            <p className="text-amber-200 text-lg mb-2">
              {selectedTiles.length > 0 ? selectedTiles.map(i => tiles[i]).join("") : "Select letters..."}
            </p>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button onClick={shuffleTiles} variant="outline" className="border-amber-600 text-white">
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
            <Button onClick={submitWord} disabled={selectedTiles.length < 2} className="bg-amber-100 text-amber-800">
              Submit Word
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-amber-800 border-amber-700">
          <h3 className="text-white font-bold mb-2">Words Found ({wordsFound.length})</h3>
          <div className="flex flex-wrap gap-2">
            {wordsFound.map((word, i) => (
              <Badge key={i} className="bg-amber-700">{word}</Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
