import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Undo2, Clock } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useGameCompletion } from "@/hooks/useGameCompletion";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type CardType = { suit: Suit; value: number; faceUp: boolean };
type Pile = CardType[];

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const suitSymbols: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors: Record<Suit, string> = {
  hearts: "text-red-500",
  diamonds: "text-red-500",
  clubs: "text-gray-900",
  spades: "text-gray-900",
};

const valueLabels: Record<number, string> = {
  1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
  8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K",
};

const createDeck = (): CardType[] => {
  const deck: CardType[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value, faceUp: false });
    }
  }
  return deck;
};

const shuffleDeck = (deck: CardType[]): CardType[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const isRed = (suit: Suit) => suit === "hearts" || suit === "diamonds";

export default function Solitaire() {
  const [tableau, setTableau] = useState<Pile[]>([[], [], [], [], [], [], []]);
  const [foundations, setFoundations] = useState<Pile[]>([[], [], [], []]);
  const [stock, setStock] = useState<Pile>([]);
  const [waste, setWaste] = useState<Pile>([]);
  const [selectedCard, setSelectedCard] = useState<{ pile: string; index: number; cardIndex: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [tokensAwarded, setTokensAwarded] = useState(false);
  const { completeGame } = useGameCompletion();

  // Initialize game
  const initGame = useCallback(() => {
    const deck = shuffleDeck(createDeck());
    const newTableau: Pile[] = [[], [], [], [], [], [], []];
    let cardIndex = 0;

    // Deal cards to tableau
    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = { ...deck[cardIndex], faceUp: i === j };
        newTableau[j].push(card);
        cardIndex++;
      }
    }

    // Remaining cards go to stock
    const newStock = deck.slice(cardIndex).map(c => ({ ...c, faceUp: false }));

    setTableau(newTableau);
    setFoundations([[], [], [], []]);
    setStock(newStock);
    setWaste([]);
    setSelectedCard(null);
    setMoves(0);
    setGameWon(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setTokensAwarded(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer
  useEffect(() => {
    if (gameWon) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, gameWon]);

  // Check win condition
  useEffect(() => {
    const totalInFoundations = foundations.reduce((sum, f) => sum + f.length, 0);
    if (totalInFoundations === 52 && !gameWon) {
      setGameWon(true);
      toast.success("Congratulations! You won! 🎉");
      if (!tokensAwarded) {
        setTokensAwarded(true);
        const score = Math.max(1000 - moves * 5 - elapsedTime, 100);
        completeGame({ gameSlug: "solitaire", won: true, score });
      }
    }
  }, [foundations, gameWon, moves, elapsedTime, tokensAwarded, completeGame]);

  // Draw from stock
  const drawFromStock = () => {
    if (stock.length === 0) {
      // Recycle waste back to stock
      if (waste.length > 0) {
        setStock(waste.map(c => ({ ...c, faceUp: false })).reverse());
        setWaste([]);
      }
      return;
    }

    const card = { ...stock[stock.length - 1], faceUp: true };
    setStock(stock.slice(0, -1));
    setWaste([...waste, card]);
    setSelectedCard(null);
  };

  // Check if card can be placed on tableau pile
  const canPlaceOnTableau = (card: CardType, pile: Pile): boolean => {
    if (pile.length === 0) {
      return card.value === 13; // Only kings on empty piles
    }
    const topCard = pile[pile.length - 1];
    return (
      topCard.faceUp &&
      isRed(card.suit) !== isRed(topCard.suit) &&
      card.value === topCard.value - 1
    );
  };

  // Check if card can be placed on foundation
  const canPlaceOnFoundation = (card: CardType, foundation: Pile): boolean => {
    if (foundation.length === 0) {
      return card.value === 1; // Only aces on empty foundations
    }
    const topCard = foundation[foundation.length - 1];
    return card.suit === topCard.suit && card.value === topCard.value + 1;
  };

  // Handle card click
  const handleCardClick = (pile: string, pileIndex: number, cardIndex: number) => {
    if (gameWon) return;

    const getPile = (): Pile => {
      if (pile === "tableau") return tableau[pileIndex];
      if (pile === "waste") return waste;
      if (pile === "foundation") return foundations[pileIndex];
      return [];
    };

    const currentPile = getPile();
    const card = currentPile[cardIndex];

    if (!card || !card.faceUp) return;

    if (selectedCard) {
      // Try to move selected card(s)
      const sourcePile = selectedCard.pile === "tableau" 
        ? tableau[selectedCard.index]
        : selectedCard.pile === "waste" 
        ? waste 
        : foundations[selectedCard.index];
      
      const cardsToMove = sourcePile.slice(selectedCard.cardIndex);

      if (pile === "tableau" && canPlaceOnTableau(cardsToMove[0], currentPile)) {
        // Move to tableau
        const newTableau = [...tableau];
        const newSource = selectedCard.pile === "tableau" 
          ? newTableau[selectedCard.index].slice(0, selectedCard.cardIndex)
          : null;
        
        newTableau[pileIndex] = [...currentPile, ...cardsToMove];
        
        if (selectedCard.pile === "tableau") {
          newTableau[selectedCard.index] = newSource!;
          // Flip top card if needed
          if (newTableau[selectedCard.index].length > 0) {
            const top = newTableau[selectedCard.index][newTableau[selectedCard.index].length - 1];
            if (!top.faceUp) {
              newTableau[selectedCard.index][newTableau[selectedCard.index].length - 1] = { ...top, faceUp: true };
            }
          }
        }
        
        setTableau(newTableau);
        
        if (selectedCard.pile === "waste") {
          setWaste(waste.slice(0, selectedCard.cardIndex));
        }
        
        setMoves(m => m + 1);
        setSelectedCard(null);
        return;
      }

      if (pile === "foundation" && cardsToMove.length === 1 && canPlaceOnFoundation(cardsToMove[0], currentPile)) {
        // Move to foundation
        const newFoundations = [...foundations];
        newFoundations[pileIndex] = [...currentPile, cardsToMove[0]];
        setFoundations(newFoundations);

        if (selectedCard.pile === "tableau") {
          const newTableau = [...tableau];
          newTableau[selectedCard.index] = newTableau[selectedCard.index].slice(0, selectedCard.cardIndex);
          // Flip top card
          if (newTableau[selectedCard.index].length > 0) {
            const top = newTableau[selectedCard.index][newTableau[selectedCard.index].length - 1];
            if (!top.faceUp) {
              newTableau[selectedCard.index][newTableau[selectedCard.index].length - 1] = { ...top, faceUp: true };
            }
          }
          setTableau(newTableau);
        } else if (selectedCard.pile === "waste") {
          setWaste(waste.slice(0, selectedCard.cardIndex));
        }

        setMoves(m => m + 1);
        setSelectedCard(null);
        return;
      }

      // Deselect if can't move
      setSelectedCard(null);
    } else {
      // Select card
      setSelectedCard({ pile, index: pileIndex, cardIndex });
    }
  };

  // Handle empty tableau click (for kings)
  const handleEmptyTableauClick = (pileIndex: number) => {
    if (!selectedCard || gameWon) return;

    const sourcePile = selectedCard.pile === "tableau" 
      ? tableau[selectedCard.index]
      : selectedCard.pile === "waste" 
      ? waste 
      : null;
    
    if (!sourcePile) return;

    const cardsToMove = sourcePile.slice(selectedCard.cardIndex);
    if (cardsToMove[0]?.value === 13) {
      const newTableau = [...tableau];
      newTableau[pileIndex] = cardsToMove;

      if (selectedCard.pile === "tableau") {
        newTableau[selectedCard.index] = newTableau[selectedCard.index].slice(0, selectedCard.cardIndex);
        if (newTableau[selectedCard.index].length > 0) {
          const top = newTableau[selectedCard.index][newTableau[selectedCard.index].length - 1];
          if (!top.faceUp) {
            newTableau[selectedCard.index][newTableau[selectedCard.index].length - 1] = { ...top, faceUp: true };
          }
        }
      }

      setTableau(newTableau);

      if (selectedCard.pile === "waste") {
        setWaste(waste.slice(0, selectedCard.cardIndex));
      }

      setMoves(m => m + 1);
    }
    setSelectedCard(null);
  };

  // Handle empty foundation click (for aces)
  const handleEmptyFoundationClick = (foundationIndex: number) => {
    if (!selectedCard || gameWon) return;

    const sourcePile = selectedCard.pile === "tableau" 
      ? tableau[selectedCard.index]
      : selectedCard.pile === "waste" 
      ? waste 
      : null;
    
    if (!sourcePile) return;

    const card = sourcePile[selectedCard.cardIndex];
    if (card?.value === 1) {
      const newFoundations = [...foundations];
      newFoundations[foundationIndex] = [card];
      setFoundations(newFoundations);

      if (selectedCard.pile === "tableau") {
        const newTableau = [...tableau];
        newTableau[selectedCard.index] = newTableau[selectedCard.index].slice(0, selectedCard.cardIndex);
        if (newTableau[selectedCard.index].length > 0) {
          const top = newTableau[selectedCard.index][newTableau[selectedCard.index].length - 1];
          if (!top.faceUp) {
            newTableau[selectedCard.index][newTableau[selectedCard.index].length - 1] = { ...top, faceUp: true };
          }
        }
        setTableau(newTableau);
      } else if (selectedCard.pile === "waste") {
        setWaste(waste.slice(0, selectedCard.cardIndex));
      }

      setMoves(m => m + 1);
    }
    setSelectedCard(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderCard = (card: CardType | null, isSelected: boolean, onClick: () => void, stacked = false) => {
    if (!card) {
      return (
        <div 
          onClick={onClick}
          className={`w-14 h-20 md:w-16 md:h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer ${stacked ? "-mt-16 md:-mt-20" : ""}`}
        />
      );
    }

    if (!card.faceUp) {
      return (
        <div 
          className={`w-14 h-20 md:w-16 md:h-24 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-900 shadow-md ${stacked ? "-mt-16 md:-mt-20" : ""}`}
        />
      );
    }

    return (
      <div
        onClick={onClick}
        className={`w-14 h-20 md:w-16 md:h-24 rounded-lg bg-white border-2 shadow-md cursor-pointer flex flex-col items-center justify-between p-1 transition-all ${
          isSelected ? "border-yellow-400 ring-2 ring-yellow-400" : "border-gray-300"
        } ${stacked ? "-mt-16 md:-mt-20" : ""}`}
      >
        <div className={`text-xs md:text-sm font-bold ${suitColors[card.suit]}`}>
          {valueLabels[card.value]}
        </div>
        <div className={`text-2xl md:text-3xl ${suitColors[card.suit]}`}>
          {suitSymbols[card.suit]}
        </div>
        <div className={`text-xs md:text-sm font-bold ${suitColors[card.suit]} rotate-180`}>
          {valueLabels[card.value]}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Solitaire</h1>
              <p className="text-sm text-muted-foreground">Classic Klondike</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(elapsedTime)}
            </Badge>
            <Badge variant="secondary">Moves: {moves}</Badge>
            {gameWon && (
              <Badge className="bg-green-500">
                <Trophy className="w-3 h-3 mr-1" />
                Winner!
              </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="pt-4">
            {/* Top Row: Stock, Waste, Foundations */}
            <div className="flex justify-between mb-6">
              {/* Stock and Waste */}
              <div className="flex gap-2">
                {/* Stock */}
                <div onClick={drawFromStock} className="cursor-pointer">
                  {stock.length > 0 ? (
                    <div className="w-14 h-20 md:w-16 md:h-24 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-900 shadow-md flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{stock.length}</span>
                    </div>
                  ) : (
                    <div className="w-14 h-20 md:w-16 md:h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                      <RotateCcw className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Waste */}
                <div>
                  {waste.length > 0 ? (
                    renderCard(
                      waste[waste.length - 1],
                      selectedCard?.pile === "waste" && selectedCard.cardIndex === waste.length - 1,
                      () => handleCardClick("waste", 0, waste.length - 1)
                    )
                  ) : (
                    <div className="w-14 h-20 md:w-16 md:h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50" />
                  )}
                </div>
              </div>

              {/* Foundations */}
              <div className="flex gap-2">
                {foundations.map((foundation, i) => (
                  <div key={i}>
                    {foundation.length > 0 ? (
                      renderCard(
                        foundation[foundation.length - 1],
                        selectedCard?.pile === "foundation" && selectedCard.index === i,
                        () => handleCardClick("foundation", i, foundation.length - 1)
                      )
                    ) : (
                      <div 
                        onClick={() => handleEmptyFoundationClick(i)}
                        className="w-14 h-20 md:w-16 md:h-24 rounded-lg border-2 border-dashed border-green-300 bg-green-50 cursor-pointer flex items-center justify-center"
                      >
                        <span className="text-green-400 text-2xl">{suitSymbols[SUITS[i]]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tableau */}
            <div className="flex gap-2 justify-center">
              {tableau.map((pile, pileIndex) => (
                <div key={pileIndex} className="min-h-[200px]">
                  {pile.length === 0 ? (
                    <div 
                      onClick={() => handleEmptyTableauClick(pileIndex)}
                      className="w-14 h-20 md:w-16 md:h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer"
                    />
                  ) : (
                    <div className="relative">
                      {pile.map((card, cardIndex) => (
                        <div key={cardIndex} className={cardIndex > 0 ? "mt-4" : ""}>
                          {renderCard(
                            card,
                            selectedCard?.pile === "tableau" && 
                            selectedCard.index === pileIndex && 
                            selectedCard.cardIndex === cardIndex,
                            () => handleCardClick("tableau", pileIndex, cardIndex),
                            cardIndex > 0
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-2 mt-6">
              <Button onClick={initGame} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                New Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Click cards to select, click destination to move</p>
            <p>• Build tableau piles in descending order, alternating colors</p>
            <p>• Build foundations from Ace to King by suit</p>
            <p>• Only Kings can be placed on empty tableau spaces</p>
            <p>• Click stock to draw cards, click empty stock to recycle</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
