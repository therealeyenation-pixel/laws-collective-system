import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RotateCcw, Trophy, Clock, Search, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type Difficulty = "easy" | "medium" | "hard";
type Cell = { letter: string; isSelected: boolean; isFound: boolean };
type Position = { row: number; col: number };

const wordLists: Record<Difficulty, string[]> = {
  easy: ["LAND", "AIR", "WATER", "SELF", "LOVE", "GROW"],
  medium: ["WEALTH", "FAMILY", "LEGACY", "WISDOM", "HEALTH", "SPIRIT", "UNITY", "TRUST"],
  hard: ["SOVEREIGNTY", "PROSPERITY", "COMMUNITY", "EDUCATION", "FOUNDATION", "GENERATIONAL", "COLLECTIVE", "ABUNDANCE"],
};

const difficultySettings: Record<Difficulty, { size: number; words: number }> = {
  easy: { size: 8, words: 6 },
  medium: { size: 10, words: 8 },
  hard: { size: 12, words: 8 },
};

export default function WordSearch() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const directions = [
    [0, 1],   // Right
    [1, 0],   // Down
    [1, 1],   // Diagonal down-right
    [-1, 1],  // Diagonal up-right
    [0, -1],  // Left
    [-1, 0],  // Up
    [-1, -1], // Diagonal up-left
    [1, -1],  // Diagonal down-left
  ];

  const canPlaceWord = (
    grid: string[][],
    word: string,
    startRow: number,
    startCol: number,
    dr: number,
    dc: number,
    size: number
  ): boolean => {
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dr;
      const col = startCol + i * dc;
      if (row < 0 || row >= size || col < 0 || col >= size) return false;
      if (grid[row][col] !== "" && grid[row][col] !== word[i]) return false;
    }
    return true;
  };

  const placeWord = (
    grid: string[][],
    word: string,
    startRow: number,
    startCol: number,
    dr: number,
    dc: number
  ): void => {
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dr;
      const col = startCol + i * dc;
      grid[row][col] = word[i];
    }
  };

  const generateGrid = (): { grid: Cell[][]; words: string[] } => {
    const { size, words: wordCount } = difficultySettings[difficulty];
    const wordList = wordLists[difficulty].slice(0, wordCount);
    const letterGrid: string[][] = Array(size).fill(null).map(() => Array(size).fill(""));
    const placedWords: string[] = [];

    // Try to place each word
    for (const word of wordList) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const dr = directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * size);
        const startCol = Math.floor(Math.random() * size);

        if (canPlaceWord(letterGrid, word, startRow, startCol, dr[0], dr[1], size)) {
          placeWord(letterGrid, word, startRow, startCol, dr[0], dr[1]);
          placedWords.push(word);
          placed = true;
        }
        attempts++;
      }
    }

    // Fill remaining cells with random letters
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (letterGrid[row][col] === "") {
          letterGrid[row][col] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    const cellGrid: Cell[][] = letterGrid.map((row) =>
      row.map((letter) => ({ letter, isSelected: false, isFound: false }))
    );

    return { grid: cellGrid, words: placedWords };
  };

  const initializeGame = () => {
    const { grid: newGrid, words: newWords } = generateGrid();
    setGrid(newGrid);
    setWords(newWords);
    setFoundWords(new Set());
    setSelectedCells([]);
    setTimer(0);
    setGameStarted(false);
    setGameComplete(false);
    setIsSelecting(false);
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

  const getSelectedWord = (): string => {
    return selectedCells.map(({ row, col }) => grid[row][col].letter).join("");
  };

  const handleCellMouseDown = (row: number, col: number) => {
    if (!gameStarted) setGameStarted(true);
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
    
    const newGrid = grid.map((r) => r.map((c) => ({ ...c, isSelected: false })));
    newGrid[row][col].isSelected = true;
    setGrid(newGrid);
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting) return;

    // Check if this cell is in a valid direction from the start
    const start = selectedCells[0];
    const dr = Math.sign(row - start.row);
    const dc = Math.sign(col - start.col);

    // Only allow straight lines (horizontal, vertical, diagonal)
    if (dr !== 0 && dc !== 0 && Math.abs(row - start.row) !== Math.abs(col - start.col)) {
      return;
    }

    // Build path from start to current cell
    const newSelected: Position[] = [];
    let r = start.row;
    let c = start.col;
    
    while (true) {
      newSelected.push({ row: r, col: c });
      if (r === row && c === col) break;
      r += dr;
      c += dc;
      if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) break;
    }

    setSelectedCells(newSelected);
    
    const newGrid = grid.map((r) => r.map((c) => ({ ...c, isSelected: false })));
    newSelected.forEach(({ row, col }) => {
      newGrid[row][col].isSelected = true;
    });
    setGrid(newGrid);
  };

  const handleCellMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const selectedWord = getSelectedWord();
    const reversedWord = selectedWord.split("").reverse().join("");

    // Check if the selected word matches any unfound word
    const matchedWord = words.find(
      (word) => 
        !foundWords.has(word) && 
        (word === selectedWord || word === reversedWord)
    );

    if (matchedWord) {
      const newFoundWords = new Set(foundWords);
      newFoundWords.add(matchedWord);
      setFoundWords(newFoundWords);

      // Mark cells as found
      const newGrid = grid.map((r) => r.map((c) => ({ ...c, isSelected: false })));
      selectedCells.forEach(({ row, col }) => {
        newGrid[row][col].isFound = true;
      });
      setGrid(newGrid);

      toast.success(`Found: ${matchedWord}!`);

      // Check for game completion
      if (newFoundWords.size === words.length) {
        setGameComplete(true);
        toast.success("Congratulations! You found all words! 🎉");
      }
    } else {
      // Clear selection
      const newGrid = grid.map((r) => r.map((c) => ({ ...c, isSelected: false })));
      setGrid(newGrid);
    }

    setSelectedCells([]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCellStyle = (cell: Cell) => {
    let style = "w-8 h-8 md:w-9 md:h-9 text-sm md:text-base font-bold flex items-center justify-center select-none transition-all ";
    
    if (cell.isFound) {
      style += "bg-green-500/30 text-green-700 ";
    } else if (cell.isSelected) {
      style += "bg-primary/30 text-primary ";
    } else {
      style += "bg-secondary hover:bg-secondary/80 ";
    }
    
    return style;
  };

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
              <h1 className="text-2xl font-bold text-foreground">Word Search</h1>
              <p className="text-sm text-muted-foreground">Find all hidden words</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(timer)}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{foundWords.size}/{words.length}</p>
              <p className="text-xs text-muted-foreground">Words Found</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{formatTime(timer)}</p>
              <p className="text-xs text-muted-foreground">Time</p>
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
        </div>

        {/* Game Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {gameComplete ? (
                <>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  All Words Found!
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Find the Words
                </>
              )}
            </CardTitle>
            <CardDescription>
              {gameComplete
                ? `Completed in ${formatTime(timer)}`
                : "Click and drag to select words"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Grid */}
              <div 
                className="grid gap-0.5 select-none"
                style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 8}, minmax(0, 1fr))` }}
                onMouseLeave={() => {
                  if (isSelecting) handleCellMouseUp();
                }}
              >
                {grid.map((row, rowIdx) =>
                  row.map((cell, colIdx) => (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      onMouseDown={() => handleCellMouseDown(rowIdx, colIdx)}
                      onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                      onMouseUp={handleCellMouseUp}
                      className={getCellStyle(cell)}
                    >
                      {cell.letter}
                    </div>
                  ))
                )}
              </div>

              {/* Word List */}
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-sm">Words to Find:</h3>
                <div className="flex flex-wrap gap-2">
                  {words.map((word) => (
                    <Badge
                      key={word}
                      variant={foundWords.has(word) ? "default" : "outline"}
                      className={`gap-1 ${foundWords.has(word) ? "bg-green-500" : ""}`}
                    >
                      {foundWords.has(word) && <CheckCircle2 className="w-3 h-3" />}
                      <span className={foundWords.has(word) ? "line-through" : ""}>
                        {word}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center mt-4">
              <Button onClick={initializeGame} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                New Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Find all the hidden words in the grid</p>
            <p>• Words can be horizontal, vertical, or diagonal</p>
            <p>• Words can be forwards or backwards</p>
            <p>• Click and drag to select letters</p>
            <p>• Found words will be highlighted in green</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
