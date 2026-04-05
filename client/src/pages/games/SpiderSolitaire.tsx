import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Trophy, Pause, Play } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Suit = "♠" | "♥" | "♦" | "♣";
type CardValue = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface PlayingCard {
  suit: Suit;
  value: CardValue;
  faceUp: boolean;
  id: string;
}

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const VALUES: CardValue[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const getValueIndex = (value: CardValue): number => VALUES.indexOf(value);

const isRed = (suit: Suit): boolean => suit === "♥" || suit === "♦";

const createDeck = (numSuits: number): PlayingCard[] => {
  const deck: PlayingCard[] = [];
  const suitsToUse = SUITS.slice(0, numSuits);
  const decksNeeded = 8 / numSuits;
  
  for (let d = 0; d < decksNeeded; d++) {
    for (const suit of suitsToUse) {
      for (const value of VALUES) {
        deck.push({
          suit,
          value,
          faceUp: false,
          id: `${suit}-${value}-${d}-${Math.random()}`,
        });
      }
    }
  }
  
  return deck;
};

const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function SpiderSolitaire() {
  const [, setLocation] = useLocation();
  const [columns, setColumns] = useState<PlayingCard[][]>([]);
  const [stock, setStock] = useState<PlayingCard[]>([]);
  const [completedSuits, setCompletedSuits] = useState<number>(0);
  const [moves, setMoves] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [gameWon, setGameWon] = useState(false);
  const [numSuits, setNumSuits] = useState<1 | 2 | 4>(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const checkForCompletedSuits = useCallback((cols: PlayingCard[][]) => {
    const newColumns = cols.map(col => [...col]);
    let suitCompleted = false;
    
    for (let colIndex = 0; colIndex < newColumns.length; colIndex++) {
      const col = newColumns[colIndex];
      if (col.length >= 13) {
        const last13 = col.slice(-13);
        const suit = last13[0].suit;
        let isComplete = true;
        
        for (let i = 0; i < 13; i++) {
          const expectedValue = VALUES[12 - i];
          if (last13[i].value !== expectedValue || last13[i].suit !== suit || !last13[i].faceUp) {
            isComplete = false;
            break;
          }
        }
        
        if (isComplete) {
          newColumns[colIndex] = col.slice(0, -13);
          if (newColumns[colIndex].length > 0) {
            const topCard = newColumns[colIndex][newColumns[colIndex].length - 1];
            if (!topCard.faceUp) {
              newColumns[colIndex][newColumns[colIndex].length - 1] = { ...topCard, faceUp: true };
            }
          }
          suitCompleted = true;
          setCompletedSuits(prev => prev + 1);
          toast.success("Suit completed!");
        }
      }
    }
    
    return { newColumns, suitCompleted };
  }, []);

  const initGame = useCallback(() => {
    const deck = shuffleDeck(createDeck(numSuits));
    
    const newColumns: PlayingCard[][] = Array.from({ length: 10 }, () => []);
    
    let cardIndex = 0;
    for (let col = 0; col < 10; col++) {
      const numCards = col < 4 ? 6 : 5;
      for (let i = 0; i < numCards; i++) {
        const card = { ...deck[cardIndex] };
        if (i === numCards - 1) card.faceUp = true;
        newColumns[col].push(card);
        cardIndex++;
      }
    }
    
    const newStock = deck.slice(cardIndex).map(c => ({ ...c, faceUp: true }));
    
    setColumns(newColumns);
    setStock(newStock);
    setCompletedSuits(0);
    setMoves(0);
    setSelectedColumn(null);
    setSelectedCardIndex(null);
    setGameWon(false);
    setGameStarted(true);
    setIsPaused(false);
  }, [numSuits]);

  useEffect(() => {
    if (completedSuits === 8) {
      setGameWon(true);
      toast.success("Congratulations! You won!");
    }
  }, [completedSuits]);

  const canMoveCard = (fromCol: number, fromIndex: number, toCol: number): boolean => {
    const sourceColumn = columns[fromCol];
    const targetColumn = columns[toCol];
    
    const cardsToMove = sourceColumn.slice(fromIndex);
    for (let i = 0; i < cardsToMove.length - 1; i++) {
      if (!cardsToMove[i].faceUp) return false;
      if (cardsToMove[i].suit !== cardsToMove[i + 1].suit) return false;
      if (getValueIndex(cardsToMove[i].value) !== getValueIndex(cardsToMove[i + 1].value) + 1) return false;
    }
    
    if (targetColumn.length === 0) return true;
    
    const targetCard = targetColumn[targetColumn.length - 1];
    const movingCard = cardsToMove[0];
    
    return getValueIndex(targetCard.value) === getValueIndex(movingCard.value) + 1;
  };

  const handleCardClick = (colIndex: number, cardIndex: number) => {
    if (isPaused) return;
    const card = columns[colIndex][cardIndex];
    if (!card.faceUp) return;
    
    if (selectedColumn === null) {
      setSelectedColumn(colIndex);
      setSelectedCardIndex(cardIndex);
    } else if (selectedColumn === colIndex) {
      setSelectedColumn(null);
      setSelectedCardIndex(null);
    } else {
      if (canMoveCard(selectedColumn, selectedCardIndex!, colIndex)) {
        const newColumns = columns.map(col => [...col]);
        const cardsToMove = newColumns[selectedColumn].splice(selectedCardIndex!);
        newColumns[colIndex].push(...cardsToMove);
        
        if (newColumns[selectedColumn].length > 0) {
          const topCard = newColumns[selectedColumn][newColumns[selectedColumn].length - 1];
          if (!topCard.faceUp) {
            newColumns[selectedColumn][newColumns[selectedColumn].length - 1] = { ...topCard, faceUp: true };
          }
        }
        
        const { newColumns: finalColumns } = checkForCompletedSuits(newColumns);
        
        setColumns(finalColumns);
        setMoves(prev => prev + 1);
      }
      setSelectedColumn(null);
      setSelectedCardIndex(null);
    }
  };

  const handleColumnClick = (colIndex: number) => {
    if (isPaused) return;
    if (columns[colIndex].length === 0 && selectedColumn !== null && selectedCardIndex !== null) {
      if (canMoveCard(selectedColumn, selectedCardIndex, colIndex)) {
        const newColumns = columns.map(col => [...col]);
        const cardsToMove = newColumns[selectedColumn].splice(selectedCardIndex);
        newColumns[colIndex].push(...cardsToMove);
        
        if (newColumns[selectedColumn].length > 0) {
          const topCard = newColumns[selectedColumn][newColumns[selectedColumn].length - 1];
          if (!topCard.faceUp) {
            newColumns[selectedColumn][newColumns[selectedColumn].length - 1] = { ...topCard, faceUp: true };
          }
        }
        
        setColumns(newColumns);
        setMoves(prev => prev + 1);
      }
      setSelectedColumn(null);
      setSelectedCardIndex(null);
    }
  };

  const dealFromStock = () => {
    if (isPaused) return;
    if (stock.length === 0) {
      toast.error("No more cards to deal!");
      return;
    }
    
    if (columns.some(col => col.length === 0)) {
      toast.error("Fill all empty columns before dealing!");
      return;
    }
    
    const newColumns = columns.map(col => [...col]);
    const newStock = [...stock];
    
    for (let i = 0; i < 10 && newStock.length > 0; i++) {
      const card = newStock.pop()!;
      newColumns[i].push({ ...card, faceUp: true });
    }
    
    const { newColumns: finalColumns } = checkForCompletedSuits(newColumns);
    
    setColumns(finalColumns);
    setStock(newStock);
    setMoves(prev => prev + 1);
  };

  const renderCard = (card: PlayingCard, colIndex: number, cardIndex: number) => {
    const isSelected = selectedColumn === colIndex && cardIndex >= (selectedCardIndex ?? 0);
    
    if (!card.faceUp) {
      return (
        <div
          key={card.id}
          className="w-14 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 shadow-md"
          style={{ marginTop: cardIndex === 0 ? 0 : -60 }}
        />
      );
    }
    
    return (
      <div
        key={card.id}
        onClick={() => handleCardClick(colIndex, cardIndex)}
        className={`
          w-14 h-20 bg-white rounded-lg border-2 shadow-md cursor-pointer
          flex flex-col items-center justify-center
          ${isRed(card.suit) ? "text-red-600" : "text-black"}
          ${isSelected ? "ring-2 ring-primary border-primary" : "border-gray-300"}
          hover:border-primary/50
        `}
        style={{ marginTop: cardIndex === 0 ? 0 : -60 }}
      >
        <span className="text-xs font-bold">{card.value}</span>
        <span className="text-lg">{card.suit}</span>
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/game-center")}
            className="mb-4 text-white hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game Center
          </Button>

          <Card className="p-8 text-center bg-green-800/50 border-green-600">
            <h1 className="text-3xl font-bold mb-2 text-white">🕷️ Spider Solitaire</h1>
            <p className="text-green-200 mb-6">
              Build 8 complete suits from King to Ace!
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-green-200">
                  Difficulty (Number of Suits)
                </label>
                <div className="flex justify-center gap-2">
                  {([1, 2, 4] as const).map((num) => (
                    <Button
                      key={num}
                      variant={numSuits === num ? "default" : "outline"}
                      onClick={() => setNumSuits(num)}
                      className={numSuits !== num ? "border-green-400 text-green-200 hover:bg-green-700" : ""}
                    >
                      {num} Suit{num > 1 ? "s" : ""}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-green-300 mt-2">
                  {numSuits === 1 && "Easiest - All Spades"}
                  {numSuits === 2 && "Medium - Spades & Hearts"}
                  {numSuits === 4 && "Hardest - All 4 Suits"}
                </p>
              </div>

              <Button size="lg" onClick={initGame} className="w-full">
                Start Game
              </Button>
            </div>

            <div className="mt-6 text-left text-sm text-green-200 space-y-2">
              <p>🃏 Build sequences from K down to A</p>
              <p>♠️ Same suit sequences can be moved together</p>
              <p>✅ Complete 8 suits to win</p>
              <p>📦 Click stock to deal more cards</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (gameWon) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 p-4 flex items-center justify-center">
        <Card className="p-8 text-center bg-green-800/50 border-green-600">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">You Won!</h2>
          <p className="text-green-200 mb-4">
            Completed in {moves} moves
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={initGame}>Play Again</Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/game-center")}
              className="border-green-400 text-green-200 hover:bg-green-700"
            >
              Back to Games
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/game-center")}
            className="text-white hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4 text-white text-sm">
            <span>Suits: {completedSuits}/8</span>
            <span>Moves: {moves}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="border-green-400 text-green-200 hover:bg-green-700"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={initGame}
              className="border-green-400 text-green-200 hover:bg-green-700"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isPaused && (
          <Card className="p-4 mb-4 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500">
            <p className="text-center font-medium">Game Paused</p>
          </Card>
        )}

        {/* Game Board */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-4">
          {columns.map((column, colIndex) => (
            <div
              key={colIndex}
              className="flex flex-col min-w-[60px]"
              onClick={() => column.length === 0 ? handleColumnClick(colIndex) : undefined}
            >
              {column.length === 0 ? (
                <div className="w-14 h-20 border-2 border-dashed border-green-600 rounded-lg" />
              ) : (
                column.map((card, cardIndex) =>
                  renderCard(card, colIndex, cardIndex)
                )
              )}
            </div>
          ))}
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between mt-4 p-4 bg-green-800/30 rounded-lg">
          <div className="flex items-center gap-4">
            <Button
              onClick={dealFromStock}
              disabled={stock.length === 0 || isPaused}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Deal Cards ({Math.ceil(stock.length / 10)} deals left)
            </Button>
            <span className="text-green-200 text-sm">
              {stock.length} cards in stock
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: completedSuits }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded border-2 border-yellow-300 flex items-center justify-center text-xs"
              >
                ♠
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
