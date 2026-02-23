import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Trophy, Shuffle, Check, X, Pause, Play } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// Common English words for validation (simplified list)
const VALID_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "us", "is", "are", "was", "were",
  "been", "has", "had", "did", "does", "am", "being", "here", "too",
  "cat", "dog", "bat", "hat", "mat", "rat", "sat", "fat", "pat", "vat",
  "car", "bar", "far", "jar", "tar", "war", "star", "scar",
  "bed", "red", "fed", "led", "wed", "shed", "sled",
  "big", "dig", "fig", "pig", "wig", "rig", "jig",
  "bit", "fit", "hit", "kit", "lit", "pit", "sit", "wit",
  "box", "fox", "pox", "sox",
  "bug", "dug", "hug", "jug", "mug", "rug", "tug",
  "bun", "fun", "gun", "nun", "pun", "run", "sun",
  "cup", "pup", "sup",
  "cut", "gut", "hut", "jut", "nut", "put", "rut",
  "ace", "age", "ale", "ape", "are", "ate", "awe", "axe",
  "ice", "ire",
  "oak", "oar", "oat",
  "use",
  "able", "ache", "acre", "aged", "aide", "aisle", "also", "amid",
  "area", "army", "away", "baby", "back", "bake", "ball", "band",
  "bank", "bare", "barn", "base", "bath", "bear", "beat", "been",
  "beer", "bell", "belt", "bend", "bent", "best", "bike", "bill",
  "bird", "bite", "blow", "blue", "boat", "body", "boil", "bold",
  "bolt", "bomb", "bond", "bone", "book", "boom", "boot", "born",
  "boss", "both", "bowl", "bulk", "bull", "burn", "bush", "busy",
  "cage", "cake", "call", "calm", "came", "camp", "card", "care",
  "cart", "case", "cash", "cast", "cave", "cell", "chat", "chef",
  "chip", "chop", "city", "clap", "clay", "clip", "club", "clue",
  "coal", "coat", "code", "coin", "cold", "come", "cook", "cool",
  "cope", "copy", "cord", "core", "corn", "cost", "cozy", "crew",
  "crop", "crow", "cure", "curl", "cute", "dame", "damp", "dare",
  "dark", "dart", "dash", "data", "date", "dawn", "dead", "deal",
  "dean", "dear", "debt", "deck", "deed", "deep", "deer", "demo",
  "deny", "desk", "dial", "dice", "diet", "dirt", "dish", "disk",
  "dive", "dock", "does", "doll", "dome", "done", "door", "dose",
  "down", "drag", "draw", "drew", "drip", "drop", "drug", "drum",
  "dual", "duck", "dull", "dumb", "dump", "dust", "duty", "each",
  "earn", "ease", "east", "easy", "edge", "edit", "else", "emit",
  "even", "ever", "evil", "exam", "exit", "face", "fact", "fade",
  "fail", "fair", "fake", "fall", "fame", "farm", "fast", "fate",
  "fear", "feat", "feed", "feel", "feet", "fell", "felt", "file",
  "fill", "film", "find", "fine", "fire", "firm", "fish", "five",
  "flag", "flat", "flaw", "fled", "flew", "flip", "flow", "foam",
  "fold", "folk", "food", "fool", "foot", "ford", "fork", "form",
  "fort", "four", "free", "from", "fuel", "full", "fund", "fury",
  "fuse", "gain", "game", "gang", "gate", "gave", "gaze", "gear",
  "gene", "gift", "girl", "give", "glad", "glow", "glue", "goal",
  "goat", "goes", "gold", "golf", "gone", "good", "grab", "gray",
  "grew", "grey", "grid", "grim", "grin", "grip", "grow", "gulf",
  "guru", "hack", "hail", "hair", "half", "hall", "halt", "hand",
  "hang", "hard", "harm", "hate", "haul", "have", "hawk", "head",
  "heal", "heap", "hear", "heat", "heel", "held", "hell", "help",
  "here", "hero", "hide", "high", "hike", "hill", "hint", "hire",
  "hold", "hole", "holy", "home", "hook", "hope", "horn", "host",
  "hour", "huge", "hull", "hung", "hunt", "hurt", "icon", "idea",
  "inch", "info", "iron", "item", "jack", "jail", "jazz", "jean",
  "jeep", "jerk", "jobs", "john", "join", "joke", "jump", "june",
  "jury", "just", "keen", "keep", "kept", "kick", "kill", "kind",
  "king", "kiss", "knee", "knew", "knit", "knob", "know", "lack",
  "laid", "lake", "lamp", "land", "lane", "last", "late", "lawn",
  "laws", "lead", "leaf", "lean", "leap", "left", "lend", "lens",
  "less", "liar", "lick", "life", "lift", "like", "limb", "lime",
  "limp", "line", "link", "lion", "list", "live", "load", "loan",
  "lock", "logo", "lone", "long", "look", "loop", "lord", "lose",
  "loss", "lost", "lots", "loud", "love", "luck", "lung", "lure",
  "made", "mail", "main", "make", "male", "mall", "many", "mark",
  "mars", "mask", "mass", "mate", "math", "maze", "meal", "mean",
  "meat", "meet", "melt", "memo", "menu", "mere", "mesh", "mess",
  "mild", "mile", "milk", "mill", "mind", "mine", "mint", "miss",
  "mode", "mold", "monk", "mood", "moon", "more", "moss", "most",
  "moth", "move", "much", "must", "myth", "nail", "name", "navy",
  "near", "neat", "neck", "need", "nest", "news", "next", "nice",
  "nick", "nine", "node", "none", "noon", "norm", "nose", "note",
  "noun", "odds", "okay", "once", "only", "onto", "open", "oral",
  "oven", "over", "owed", "pace", "pack", "page", "paid", "pain",
  "pair", "pale", "palm", "park", "part", "pass", "past", "path",
  "peak", "peel", "peer", "pick", "pile", "pine", "pink", "pipe",
  "pity", "plan", "play", "plea", "plot", "plug", "plus", "poem",
  "poet", "pole", "poll", "pond", "pool", "poor", "pope", "pork",
  "port", "pose", "post", "pour", "pray", "prey", "prop", "pull",
  "pump", "pure", "push", "quit", "quiz", "race", "rack", "rage",
  "raid", "rail", "rain", "rank", "rare", "rate", "read", "real",
  "rear", "rely", "rent", "rest", "rice", "rich", "ride", "ring",
  "riot", "rise", "risk", "road", "rock", "rode", "role", "roll",
  "roof", "room", "root", "rope", "rose", "ruin", "rule", "rush",
  "safe", "sage", "said", "sail", "sake", "sale", "salt", "same",
  "sand", "sang", "sank", "save", "seal", "seat", "seed", "seek",
  "seem", "seen", "self", "sell", "send", "sent", "sept", "ship",
  "shop", "shot", "show", "shut", "sick", "side", "sigh", "sign",
  "silk", "sing", "sink", "site", "size", "skin", "skip", "slam",
  "slap", "slip", "slow", "snap", "snow", "soap", "soar", "sock",
  "soft", "soil", "sold", "sole", "some", "song", "soon", "sort",
  "soul", "soup", "sour", "span", "spin", "spot", "star", "stay",
  "stem", "step", "stir", "stop", "such", "suit", "sure", "swim",
  "tail", "take", "tale", "talk", "tall", "tank", "tape", "task",
  "team", "tear", "tech", "teen", "tell", "tend", "tent", "term",
  "test", "text", "than", "that", "them", "then", "they", "thin",
  "this", "thus", "tide", "tile", "till", "time", "tiny", "tire",
  "toad", "told", "toll", "tomb", "tone", "took", "tool", "tops",
  "tore", "torn", "tour", "town", "trap", "tray", "tree", "trim",
  "trip", "true", "tube", "tuck", "tune", "turn", "twin", "type",
  "ugly", "unit", "upon", "urge", "used", "user", "vary", "vast",
  "verb", "very", "view", "vine", "vote", "wade", "wage", "wait",
  "wake", "walk", "wall", "want", "ward", "warm", "warn", "wash",
  "wave", "weak", "wear", "weed", "week", "well", "went", "were",
  "west", "what", "when", "whip", "whom", "wide", "wife", "wild",
  "will", "wind", "wine", "wing", "wire", "wise", "wish", "with",
  "woke", "wolf", "wood", "wool", "word", "wore", "work", "worm",
  "worn", "wrap", "yard", "yeah", "year", "yell", "your", "zero",
  "zone", "zoom",
]);

const LETTER_SCORES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};

const VOWELS = "AEIOU";
const CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ";

const getRandomLetter = (forceVowel = false): string => {
  const pool = forceVowel ? VOWELS : CONSONANTS;
  return pool[Math.floor(Math.random() * pool.length)];
};

const generateLetters = (count: number): string[] => {
  const letters: string[] = [];
  // Ensure at least 2 vowels
  letters.push(getRandomLetter(true));
  letters.push(getRandomLetter(true));
  
  for (let i = 2; i < count; i++) {
    // 30% chance of vowel
    letters.push(getRandomLetter(Math.random() < 0.3));
  }
  
  // Shuffle
  return letters.sort(() => Math.random() - 0.5);
};

export default function WordForge() {
  const [, setLocation] = useLocation();
  const [letters, setLetters] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [score, setScore] = useState(0);
  const [wordsFound, setWordsFound] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const initGame = useCallback(() => {
    setLetters(generateLetters(9));
    setSelectedIndices([]);
    setCurrentWord("");
    setScore(0);
    setWordsFound([]);
    setTimeLeft(120);
    setGameStarted(true);
    setGameOver(false);
    setIsPaused(false);
  }, []);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, isPaused]);

  const handleLetterClick = (index: number) => {
    if (isPaused || gameOver) return;
    
    if (selectedIndices.includes(index)) {
      // Deselect
      const newIndices = selectedIndices.filter((i) => i !== index);
      setSelectedIndices(newIndices);
      setCurrentWord(newIndices.map((i) => letters[i]).join(""));
    } else {
      // Select
      const newIndices = [...selectedIndices, index];
      setSelectedIndices(newIndices);
      setCurrentWord(newIndices.map((i) => letters[i]).join(""));
    }
  };

  const submitWord = () => {
    if (isPaused || gameOver) return;
    
    const word = currentWord.toLowerCase();
    
    if (word.length < 3) {
      toast.error("Word must be at least 3 letters!");
      return;
    }
    
    if (wordsFound.includes(word)) {
      toast.error("You already found this word!");
      return;
    }
    
    if (!VALID_WORDS.has(word)) {
      toast.error("Not a valid word!");
      return;
    }
    
    // Calculate score
    let wordScore = 0;
    for (const letter of currentWord) {
      wordScore += LETTER_SCORES[letter] || 1;
    }
    // Bonus for longer words
    if (word.length >= 5) wordScore *= 2;
    if (word.length >= 7) wordScore *= 2;
    
    setScore((prev) => prev + wordScore);
    setWordsFound((prev) => [...prev, word]);
    setSelectedIndices([]);
    setCurrentWord("");
    toast.success(`+${wordScore} points!`);
  };

  const clearWord = () => {
    setSelectedIndices([]);
    setCurrentWord("");
  };

  const shuffleLetters = () => {
    if (isPaused || gameOver) return;
    setLetters([...letters].sort(() => Math.random() - 0.5));
    setSelectedIndices([]);
    setCurrentWord("");
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/game-center")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game Center
          </Button>

          <Card className="p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">🔤 Word Forge</h1>
            <p className="text-muted-foreground mb-6">
              Build words from the given letters to score points!
            </p>

            <Button size="lg" onClick={initGame} className="w-full">
              Start Game
            </Button>

            <div className="mt-6 text-left text-sm text-muted-foreground space-y-2">
              <p>📝 Click letters to build words</p>
              <p>✅ Submit valid words (3+ letters)</p>
              <p>⭐ Longer words = more points!</p>
              <p>⏱️ 2 minutes to find as many words as possible</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Time's Up!</h2>
            <p className="text-4xl font-bold text-primary mb-2">{score} points</p>
            <p className="text-muted-foreground mb-4">
              You found {wordsFound.length} words!
            </p>
            
            {wordsFound.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-lg text-left">
                <p className="text-sm font-medium mb-2">Words found:</p>
                <div className="flex flex-wrap gap-1">
                  {wordsFound.map((word, i) => (
                    <span key={i} className="text-xs bg-primary/10 px-2 py-1 rounded">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 justify-center">
              <Button onClick={initGame}>Play Again</Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/game-center")}
              >
                Back to Games
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/game-center")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <span className={`text-xl font-bold ${timeLeft <= 30 ? "text-red-500" : ""}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={initGame}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isPaused && (
          <Card className="p-4 mb-4 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500">
            <p className="text-center font-medium">Game Paused</p>
          </Card>
        )}

        {/* Score */}
        <div className="text-center mb-4">
          <span className="text-2xl font-bold text-primary">{score}</span>
          <span className="text-muted-foreground"> points</span>
          <span className="text-sm text-muted-foreground ml-4">
            ({wordsFound.length} words)
          </span>
        </div>

        {/* Current Word */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold tracking-wider min-h-[2rem]">
              {currentWord || <span className="text-muted-foreground">Select letters...</span>}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearWord}
                disabled={!currentWord || isPaused}
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={submitWord}
                disabled={currentWord.length < 3 || isPaused}
              >
                <Check className="w-4 h-4 mr-1" />
                Submit
              </Button>
            </div>
          </div>
        </Card>

        {/* Letter Grid */}
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-3 gap-3">
            {letters.map((letter, index) => (
              <Button
                key={index}
                variant={selectedIndices.includes(index) ? "default" : "outline"}
                className="h-16 text-2xl font-bold relative"
                onClick={() => handleLetterClick(index)}
                disabled={isPaused}
              >
                {letter}
                <span className="absolute bottom-1 right-2 text-xs opacity-50">
                  {LETTER_SCORES[letter]}
                </span>
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full mt-3"
            onClick={shuffleLetters}
            disabled={isPaused}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle
          </Button>
        </Card>

        {/* Words Found */}
        {wordsFound.length > 0 && (
          <Card className="p-4">
            <p className="text-sm font-medium mb-2">Words found:</p>
            <div className="flex flex-wrap gap-1">
              {wordsFound.map((word, i) => (
                <span key={i} className="text-xs bg-primary/10 px-2 py-1 rounded">
                  {word}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
