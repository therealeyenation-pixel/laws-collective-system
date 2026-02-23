import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RotateCcw, Trophy, Heart, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type Difficulty = "easy" | "medium" | "hard";
type Category = "laws" | "finance" | "family" | "education";

const wordsByCategory: Record<Category, { word: string; hint: string }[]> = {
  laws: [
    { word: "SOVEREIGNTY", hint: "Self-governance and independence" },
    { word: "LEGACY", hint: "What you leave behind for future generations" },
    { word: "PROSPERITY", hint: "State of flourishing and success" },
    { word: "COMMUNITY", hint: "Group of people living together" },
    { word: "COLLECTIVE", hint: "Done by people acting as a group" },
    { word: "FOUNDATION", hint: "The base upon which something is built" },
  ],
  finance: [
    { word: "INVESTMENT", hint: "Putting money to work for returns" },
    { word: "DIVIDEND", hint: "Share of profits paid to shareholders" },
    { word: "PORTFOLIO", hint: "Collection of investments" },
    { word: "COMPOUND", hint: "Interest earning interest" },
    { word: "EQUITY", hint: "Ownership value in an asset" },
    { word: "CAPITAL", hint: "Wealth used to generate more wealth" },
  ],
  family: [
    { word: "HERITAGE", hint: "Traditions passed down through generations" },
    { word: "ANCESTRY", hint: "Family lineage and history" },
    { word: "BLESSING", hint: "Something that brings happiness" },
    { word: "NURTURE", hint: "To care for and encourage growth" },
    { word: "WISDOM", hint: "Knowledge gained through experience" },
    { word: "UNITY", hint: "State of being joined together" },
  ],
  education: [
    { word: "CURRICULUM", hint: "Subjects in a course of study" },
    { word: "MASTERY", hint: "Comprehensive knowledge or skill" },
    { word: "ACADEMY", hint: "Place of learning and study" },
    { word: "SCHOLAR", hint: "Person who studies and learns" },
    { word: "KNOWLEDGE", hint: "Facts and information acquired" },
    { word: "CERTIFICATE", hint: "Document proving achievement" },
  ],
};

const difficultySettings: Record<Difficulty, number> = {
  easy: 8,
  medium: 6,
  hard: 4,
};

const categoryLabels: Record<Category, string> = {
  laws: "L.A.W.S. Framework",
  finance: "Financial Literacy",
  family: "Family & Heritage",
  education: "Education & Learning",
};

export default function Hangman() {
  const [word, setWord] = useState("");
  const [hint, setHint] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [category, setCategory] = useState<Category>("laws");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const maxWrongGuesses = difficultySettings[difficulty];

  const initializeGame = () => {
    const words = wordsByCategory[category];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setWord(randomWord.word);
    setHint(randomWord.hint);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameOver(false);
    setWon(false);
    setShowHint(false);
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty, category]);

  const handleGuess = (letter: string) => {
    if (gameOver || guessedLetters.has(letter)) return;

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    setGuessedLetters(newGuessedLetters);

    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= maxWrongGuesses) {
        setGameOver(true);
        setWon(false);
        setStats((prev) => ({ ...prev, losses: prev.losses + 1 }));
        toast.error(`Game Over! The word was: ${word}`);
      }
    } else {
      // Check if won
      const isWon = word.split("").every((l) => newGuessedLetters.has(l));
      if (isWon) {
        setGameOver(true);
        setWon(true);
        setStats((prev) => ({ ...prev, wins: prev.wins + 1 }));
        toast.success("Congratulations! You won! 🎉");
      }
    }
  };

  const renderWord = () => {
    return word.split("").map((letter, idx) => (
      <span
        key={idx}
        className={`
          w-8 h-10 md:w-10 md:h-12 flex items-center justify-center
          text-xl md:text-2xl font-bold border-b-2 border-foreground/30
          ${guessedLetters.has(letter) ? "text-foreground" : ""}
          ${gameOver && !guessedLetters.has(letter) ? "text-red-500" : ""}
        `}
      >
        {guessedLetters.has(letter) || gameOver ? letter : ""}
      </span>
    ));
  };

  const renderHangman = () => {
    const parts = [
      // Head
      <circle key="head" cx="50" cy="25" r="10" stroke="currentColor" strokeWidth="2" fill="none" />,
      // Body
      <line key="body" x1="50" y1="35" x2="50" y2="60" stroke="currentColor" strokeWidth="2" />,
      // Left arm
      <line key="left-arm" x1="50" y1="45" x2="35" y2="55" stroke="currentColor" strokeWidth="2" />,
      // Right arm
      <line key="right-arm" x1="50" y1="45" x2="65" y2="55" stroke="currentColor" strokeWidth="2" />,
      // Left leg
      <line key="left-leg" x1="50" y1="60" x2="35" y2="80" stroke="currentColor" strokeWidth="2" />,
      // Right leg
      <line key="right-leg" x1="50" y1="60" x2="65" y2="80" stroke="currentColor" strokeWidth="2" />,
      // Face (sad)
      <g key="face">
        <circle cx="45" cy="23" r="1.5" fill="currentColor" />
        <circle cx="55" cy="23" r="1.5" fill="currentColor" />
        <path d="M 45 30 Q 50 27 55 30" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </g>,
      // X eyes (dead)
      <g key="dead">
        <line x1="43" y1="21" x2="47" y2="25" stroke="currentColor" strokeWidth="1.5" />
        <line x1="47" y1="21" x2="43" y2="25" stroke="currentColor" strokeWidth="1.5" />
        <line x1="53" y1="21" x2="57" y2="25" stroke="currentColor" strokeWidth="1.5" />
        <line x1="57" y1="21" x2="53" y2="25" stroke="currentColor" strokeWidth="1.5" />
      </g>,
    ];

    // Scale wrong guesses to available parts based on difficulty
    const partsToShow = Math.min(Math.ceil((wrongGuesses / maxWrongGuesses) * 6), 6);
    
    return (
      <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-40 md:h-40 text-foreground">
        {/* Gallows */}
        <line x1="10" y1="95" x2="90" y2="95" stroke="currentColor" strokeWidth="2" />
        <line x1="30" y1="95" x2="30" y2="5" stroke="currentColor" strokeWidth="2" />
        <line x1="30" y1="5" x2="50" y2="5" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="5" x2="50" y2="15" stroke="currentColor" strokeWidth="2" />
        
        {/* Body parts */}
        {parts.slice(0, partsToShow)}
        {wrongGuesses >= maxWrongGuesses && parts[7]}
      </svg>
    );
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hangman</h1>
              <p className="text-sm text-muted-foreground">Guess the word letter by letter</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Heart className="w-3 h-3 text-red-500" />
            {maxWrongGuesses - wrongGuesses} lives
          </Badge>
        </div>

        {/* Stats & Settings */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.wins}</p>
              <p className="text-xs text-muted-foreground">Wins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-red-500">{stats.losses}</p>
              <p className="text-xs text-muted-foreground">Losses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Difficulty</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laws">L.A.W.S.</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Category</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {gameOver ? (
                won ? (
                  <>
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    You Won!
                  </>
                ) : (
                  "Game Over"
                )
              ) : (
                `Category: ${categoryLabels[category]}`
              )}
            </CardTitle>
            <CardDescription>
              {showHint && !gameOver ? `Hint: ${hint}` : "Guess the word before running out of lives"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              {/* Hangman Drawing */}
              <div className="flex justify-center">
                {renderHangman()}
              </div>

              {/* Word Display */}
              <div className="flex gap-2 flex-wrap justify-center">
                {renderWord()}
              </div>

              {/* Keyboard */}
              <div className="grid grid-cols-9 gap-1 md:gap-2">
                {alphabet.map((letter) => {
                  const isGuessed = guessedLetters.has(letter);
                  const isCorrect = word.includes(letter);
                  
                  return (
                    <Button
                      key={letter}
                      variant={isGuessed ? (isCorrect ? "default" : "destructive") : "outline"}
                      size="sm"
                      onClick={() => handleGuess(letter)}
                      disabled={isGuessed || gameOver}
                      className={`w-8 h-8 md:w-9 md:h-9 p-0 ${
                        isGuessed && isCorrect ? "bg-green-500 hover:bg-green-500" : ""
                      }`}
                    >
                      {letter}
                    </Button>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowHint(true)}
                  variant="outline"
                  size="sm"
                  disabled={showHint || gameOver}
                  className="gap-1"
                >
                  <Lightbulb className="w-4 h-4" />
                  Show Hint
                </Button>
                <Button onClick={initializeGame} variant="outline" size="sm" className="gap-1">
                  <RotateCcw className="w-4 h-4" />
                  New Word
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
            <p>• Guess the hidden word one letter at a time</p>
            <p>• Each wrong guess adds a body part to the hangman</p>
            <p>• Guess the word before the hangman is complete!</p>
            <p>• Use the hint button if you get stuck</p>
            <p>• Words are themed around L.A.W.S. concepts</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
