import { useState, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Heart, Spade, Diamond, Club, Trophy, Users, Brain } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useGameCompletion } from "@/hooks/useGameCompletion";
import GameModeSelector, { GameMode, Difficulty, AIPersonality, GameConfig } from "@/components/games/GameModeSelector";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 11=J, 12=Q, 13=K, 14=A
type PlayingCard = { suit: Suit; value: CardValue };
type Player = {
  id: number;
  name: string;
  hand: PlayingCard[];
  tricks: PlayingCard[][];
  score: number;
  totalScore: number;
  isAI: boolean;
};

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const VALUES: CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

const createDeck = (): PlayingCard[] => {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
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

const getCardDisplay = (card: PlayingCard): string => {
  const valueStr = card.value <= 10 ? card.value.toString() : 
    card.value === 11 ? "J" : card.value === 12 ? "Q" : card.value === 13 ? "K" : "A";
  return valueStr;
};

const getSuitIcon = (suit: Suit) => {
  switch (suit) {
    case "hearts": return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
    case "diamonds": return <Diamond className="w-4 h-4 text-red-500 fill-red-500" />;
    case "clubs": return <Club className="w-4 h-4 text-gray-800 fill-gray-800" />;
    case "spades": return <Spade className="w-4 h-4 text-gray-800 fill-gray-800" />;
  }
};

const getSuitColor = (suit: Suit): string => {
  return suit === "hearts" || suit === "diamonds" ? "text-red-600" : "text-gray-900";
};

export default function HeartsGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [aiPersonality, setAIPersonality] = useState<AIPersonality>("balanced");
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTrick, setCurrentTrick] = useState<{ playerId: number; card: PlayingCard }[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [leadSuit, setLeadSuit] = useState<Suit | null>(null);
  const [heartsBroken, setHeartsBroken] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [trickNumber, setTrickNumber] = useState(1);
  const [gamePhase, setGamePhase] = useState<"passing" | "playing" | "roundEnd" | "gameOver">("playing");
  const [selectedCards, setSelectedCards] = useState<PlayingCard[]>([]);
  const [tokensAwarded, setTokensAwarded] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const { completeGame } = useGameCompletion();

  const handleStartGame = (config: GameConfig) => {
    setGameMode(config.mode);
    setDifficulty(config.difficulty);
    setAIPersonality(config.personality);
    setGameStarted(true);
    initializeGame();
  };

  const handleChangeMode = () => {
    setGameStarted(false);
  };

  const initializeGame = useCallback(() => {
    const deck = shuffleDeck(createDeck());
    const newPlayers: Player[] = [
      { id: 0, name: "You", hand: [], tricks: [], score: 0, totalScore: 0, isAI: false },
      { id: 1, name: "West", hand: [], tricks: [], score: 0, totalScore: 0, isAI: true },
      { id: 2, name: "North", hand: [], tricks: [], score: 0, totalScore: 0, isAI: true },
      { id: 3, name: "East", hand: [], tricks: [], score: 0, totalScore: 0, isAI: true },
    ];

    // Deal cards
    for (let i = 0; i < 52; i++) {
      newPlayers[i % 4].hand.push(deck[i]);
    }

    // Sort hands
    for (const player of newPlayers) {
      player.hand.sort((a, b) => {
        const suitOrder = { clubs: 0, diamonds: 1, spades: 2, hearts: 3 };
        if (suitOrder[a.suit] !== suitOrder[b.suit]) {
          return suitOrder[a.suit] - suitOrder[b.suit];
        }
        return a.value - b.value;
      });
    }

    // Find player with 2 of clubs
    const startingPlayer = newPlayers.findIndex(p => 
      p.hand.some(c => c.suit === "clubs" && c.value === 2)
    );

    setPlayers(newPlayers);
    setCurrentPlayer(startingPlayer);
    setCurrentTrick([]);
    setLeadSuit(null);
    setHeartsBroken(false);
    setTrickNumber(1);
    setGamePhase("playing");
    setSelectedCards([]);
    setTokensAwarded(false);
  }, []);

  const resetGame = () => {
    setRoundNumber(1);
    initializeGame();
  };

  // Check if a card can be played
  const canPlayCard = (card: PlayingCard, hand: PlayingCard[]): boolean => {
    // First trick must start with 2 of clubs
    if (trickNumber === 1 && currentTrick.length === 0) {
      return card.suit === "clubs" && card.value === 2;
    }

    // Must follow lead suit if possible
    if (leadSuit && hand.some(c => c.suit === leadSuit)) {
      return card.suit === leadSuit;
    }

    // Can't lead with hearts until broken (unless only hearts left)
    if (currentTrick.length === 0 && card.suit === "hearts" && !heartsBroken) {
      return hand.every(c => c.suit === "hearts");
    }

    // Can't play hearts or Queen of Spades on first trick
    if (trickNumber === 1) {
      if (card.suit === "hearts") return false;
      if (card.suit === "spades" && card.value === 12) return false;
    }

    return true;
  };

  // Play a card
  const playCard = useCallback((playerId: number, card: PlayingCard) => {
    const player = players[playerId];
    if (!player) return;

    // Remove card from hand
    const newHand = player.hand.filter(c => !(c.suit === card.suit && c.value === card.value));
    
    // Update players
    const newPlayers = [...players];
    newPlayers[playerId] = { ...player, hand: newHand };
    setPlayers(newPlayers);

    // Add to current trick
    const newTrick = [...currentTrick, { playerId, card }];
    setCurrentTrick(newTrick);

    // Set lead suit if first card
    if (newTrick.length === 1) {
      setLeadSuit(card.suit);
    }

    // Break hearts if hearts played
    if (card.suit === "hearts" && !heartsBroken) {
      setHeartsBroken(true);
      toast.info("Hearts have been broken!");
    }

    // Check if trick is complete
    if (newTrick.length === 4) {
      setTimeout(() => completeTrick(newTrick, newPlayers), 1000);
    } else {
      // Next player
      setCurrentPlayer((playerId + 1) % 4);
    }
  }, [players, currentTrick, heartsBroken, trickNumber]);

  // Complete a trick
  const completeTrick = useCallback((trick: { playerId: number; card: PlayingCard }[], currentPlayers: Player[]) => {
    const lead = trick[0].card.suit;
    
    // Find winner (highest card of lead suit)
    let winner = trick[0];
    for (const play of trick) {
      if (play.card.suit === lead && play.card.value > winner.card.value) {
        winner = play;
      }
    }

    // Calculate points
    let points = 0;
    for (const play of trick) {
      if (play.card.suit === "hearts") points += 1;
      if (play.card.suit === "spades" && play.card.value === 12) points += 13;
    }

    // Update winner's tricks and score
    const newPlayers = [...currentPlayers];
    newPlayers[winner.playerId].tricks.push(trick.map(t => t.card));
    newPlayers[winner.playerId].score += points;
    setPlayers(newPlayers);

    // Clear trick
    setCurrentTrick([]);
    setLeadSuit(null);
    setCurrentPlayer(winner.playerId);

    if (points > 0) {
      toast.info(`${newPlayers[winner.playerId].name} takes ${points} point${points > 1 ? "s" : ""}!`);
    }

    // Check if round is over
    if (newPlayers[0].hand.length === 0) {
      setTimeout(() => endRound(newPlayers), 500);
    } else {
      setTrickNumber(prev => prev + 1);
    }
  }, []);

  // End round
  const endRound = useCallback((currentPlayers: Player[]) => {
    const newPlayers = [...currentPlayers];
    
    // Check for shooting the moon
    for (const player of newPlayers) {
      if (player.score === 26) {
        // Shot the moon!
        toast.success(`${player.name} shot the moon! Everyone else gets 26 points!`);
        for (const p of newPlayers) {
          if (p.id !== player.id) {
            p.totalScore += 26;
          }
        }
        player.score = 0;
      } else {
        player.totalScore += player.score;
      }
      player.score = 0;
      player.tricks = [];
    }

    setPlayers(newPlayers);

    // Check for game over (100 points)
    const gameOver = newPlayers.some(p => p.totalScore >= 100);
    if (gameOver) {
      setGamePhase("gameOver");
      handleGameEnd(newPlayers);
    } else {
      setGamePhase("roundEnd");
    }
  }, []);

  // Start new round
  const startNewRound = () => {
    setRoundNumber(prev => prev + 1);
    const deck = shuffleDeck(createDeck());
    
    const newPlayers = players.map((p, i) => ({
      ...p,
      hand: [] as PlayingCard[],
      tricks: [],
      score: 0,
    }));

    // Deal cards
    for (let i = 0; i < 52; i++) {
      newPlayers[i % 4].hand.push(deck[i]);
    }

    // Sort hands
    for (const player of newPlayers) {
      player.hand.sort((a, b) => {
        const suitOrder = { clubs: 0, diamonds: 1, spades: 2, hearts: 3 };
        if (suitOrder[a.suit] !== suitOrder[b.suit]) {
          return suitOrder[a.suit] - suitOrder[b.suit];
        }
        return a.value - b.value;
      });
    }

    const startingPlayer = newPlayers.findIndex(p => 
      p.hand.some(c => c.suit === "clubs" && c.value === 2)
    );

    setPlayers(newPlayers);
    setCurrentPlayer(startingPlayer);
    setCurrentTrick([]);
    setLeadSuit(null);
    setHeartsBroken(false);
    setTrickNumber(1);
    setGamePhase("playing");
  };

  // AI plays a card
  const aiPlayCard = useCallback(() => {
    const player = players[currentPlayer];
    if (!player || !player.isAI) return;

    setIsAIThinking(true);

    setTimeout(() => {
      const playableCards = player.hand.filter(c => canPlayCard(c, player.hand));
      
      if (playableCards.length === 0) {
        setIsAIThinking(false);
        return;
      }

      let selectedCard: PlayingCard;

      if (difficulty === "easy") {
        // Random play
        selectedCard = playableCards[Math.floor(Math.random() * playableCards.length)];
      } else {
        // Smarter play
        if (currentTrick.length === 0) {
          // Leading - play lowest non-heart if possible
          const nonHearts = playableCards.filter(c => c.suit !== "hearts");
          const pool = nonHearts.length > 0 ? nonHearts : playableCards;
          selectedCard = pool.reduce((min, c) => c.value < min.value ? c : min);
        } else {
          // Following
          const leadCards = playableCards.filter(c => c.suit === leadSuit);
          if (leadCards.length > 0) {
            // Must follow suit - play high to win if no points, low otherwise
            const trickHasPoints = currentTrick.some(t => 
              t.card.suit === "hearts" || (t.card.suit === "spades" && t.card.value === 12)
            );
            if (trickHasPoints) {
              selectedCard = leadCards.reduce((min, c) => c.value < min.value ? c : min);
            } else {
              selectedCard = leadCards.reduce((max, c) => c.value > max.value ? c : max);
            }
          } else {
            // Can't follow - dump points if possible
            const queenOfSpades = playableCards.find(c => c.suit === "spades" && c.value === 12);
            const hearts = playableCards.filter(c => c.suit === "hearts");
            if (queenOfSpades) {
              selectedCard = queenOfSpades;
            } else if (hearts.length > 0) {
              selectedCard = hearts.reduce((max, c) => c.value > max.value ? c : max);
            } else {
              selectedCard = playableCards.reduce((max, c) => c.value > max.value ? c : max);
            }
          }
        }
      }

      setIsAIThinking(false);
      playCard(currentPlayer, selectedCard);
    }, 800);
  }, [players, currentPlayer, currentTrick, leadSuit, difficulty, playCard]);

  // Trigger AI play
  useEffect(() => {
    if (gamePhase === "playing" && players[currentPlayer]?.isAI && currentTrick.length < 4) {
      aiPlayCard();
    }
  }, [currentPlayer, gamePhase, players, aiPlayCard, currentTrick.length]);

  // Handle player card click
  const handleCardClick = (card: PlayingCard) => {
    if (currentPlayer !== 0 || gamePhase !== "playing" || isAIThinking) return;
    
    const player = players[0];
    if (!canPlayCard(card, player.hand)) {
      toast.error("You can't play that card!");
      return;
    }

    playCard(0, card);
  };

  // Handle game end
  const handleGameEnd = async (finalPlayers: Player[]) => {
    if (tokensAwarded) return;
    setTokensAwarded(true);

    const playerScore = finalPlayers[0].totalScore;
    const won = finalPlayers.every(p => p.id === 0 || p.totalScore > playerScore);
    
    const baseTokens = won ? 150 : 30;
    const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : 2;
    const roundBonus = roundNumber * 5;
    const totalTokens = Math.round((baseTokens + roundBonus) * difficultyMultiplier);

    try {
      await completeGame({
        gameId: "hearts",
        score: 100 - playerScore,
        tokensEarned: totalTokens,
        metadata: {
          won,
          playerScore,
          rounds: roundNumber,
          difficulty,
        },
      });
      toast.success(`Game Over! Earned ${totalTokens} tokens!`);
    } catch (error) {
      console.error("Failed to record game:", error);
    }
  };

  const renderCard = (card: PlayingCard, onClick?: () => void, disabled?: boolean, selected?: boolean) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-14 h-20 bg-white rounded-lg border-2 shadow-md transition-all ${
        selected ? "border-primary ring-2 ring-primary -translate-y-2" : "border-gray-300"
      } ${onClick && !disabled ? "hover:-translate-y-1 hover:shadow-lg cursor-pointer" : "cursor-default"} ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div className={`absolute top-1 left-1 text-sm font-bold ${getSuitColor(card.suit)}`}>
        {getCardDisplay(card)}
      </div>
      <div className="absolute top-1 right-1">
        {getSuitIcon(card.suit)}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        {getSuitIcon(card.suit)}
      </div>
      <div className={`absolute bottom-1 right-1 text-sm font-bold ${getSuitColor(card.suit)} rotate-180`}>
        {getCardDisplay(card)}
      </div>
    </button>
  );

  if (!gameStarted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Center
              </Button>
            </Link>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-red-500/20 rounded-full">
                  <Heart className="w-12 h-12 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-2xl">Hearts</CardTitle>
              <p className="text-muted-foreground">
                Classic 4-player trick-taking card game. Avoid hearts and the Queen of Spades, 
                or try to shoot the moon by taking them all!
              </p>
            </CardHeader>
            <CardContent>
              <GameModeSelector
                gameName="Hearts"
                onStart={handleStartGame}
                availableModes={["ai"]}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Hearts
              </h1>
              <p className="text-sm text-muted-foreground">
                Round {roundNumber} • Trick {trickNumber}/13
                {heartsBroken && " • Hearts Broken"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
            <Button variant="ghost" size="sm" onClick={handleChangeMode}>
              Change Mode
            </Button>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-4 gap-2">
          {players.map((player, i) => (
            <Card key={i} className={currentPlayer === i ? "ring-2 ring-primary" : ""}>
              <CardContent className="py-3 text-center">
                <p className="font-semibold">{player.name}</p>
                <p className="text-2xl font-bold">{player.totalScore}</p>
                <p className="text-xs text-muted-foreground">
                  This round: {player.score}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Game Table */}
        <Card className="bg-green-900/20">
          <CardContent className="py-8">
            {/* North (AI) */}
            <div className="flex justify-center mb-4">
              <div className="flex gap-1">
                {players[2]?.hand.map((_, i) => (
                  <div key={i} className="w-8 h-12 bg-blue-800 rounded border border-blue-600" />
                ))}
              </div>
            </div>

            {/* West and East */}
            <div className="flex justify-between items-center mb-4">
              {/* West (AI) */}
              <div className="flex flex-col gap-1">
                {players[1]?.hand.slice(0, 7).map((_, i) => (
                  <div key={i} className="w-12 h-8 bg-blue-800 rounded border border-blue-600" />
                ))}
              </div>

              {/* Current Trick */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {currentTrick.map((play, i) => {
                    const positions = [
                      { top: "auto", bottom: "0", left: "50%", transform: "translateX(-50%)" },
                      { top: "50%", left: "0", transform: "translateY(-50%)" },
                      { top: "0", left: "50%", transform: "translateX(-50%)" },
                      { top: "50%", right: "0", left: "auto", transform: "translateY(-50%)" },
                    ];
                    const pos = positions[play.playerId];
                    return (
                      <div key={i} className="absolute" style={pos}>
                        {renderCard(play.card)}
                      </div>
                    );
                  })}
                  {currentTrick.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      {currentPlayer === 0 ? "Your turn" : `${players[currentPlayer]?.name}'s turn`}
                    </div>
                  )}
                </div>
              </div>

              {/* East (AI) */}
              <div className="flex flex-col gap-1">
                {players[3]?.hand.slice(0, 7).map((_, i) => (
                  <div key={i} className="w-12 h-8 bg-blue-800 rounded border border-blue-600" />
                ))}
              </div>
            </div>

            {/* South (Player) */}
            <div className="flex justify-center gap-1 flex-wrap">
              {players[0]?.hand.map((card, i) => {
                const canPlay = currentPlayer === 0 && canPlayCard(card, players[0].hand);
                return (
                  <div key={i}>
                    {renderCard(
                      card, 
                      canPlay ? () => handleCardClick(card) : undefined,
                      !canPlay || currentPlayer !== 0
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Round End */}
        {gamePhase === "roundEnd" && (
          <Card className="border-2 border-primary">
            <CardContent className="py-6 text-center">
              <h2 className="text-xl font-bold mb-4">Round {roundNumber} Complete!</h2>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {players.map((player, i) => (
                  <div key={i}>
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-2xl">{player.totalScore}</p>
                  </div>
                ))}
              </div>
              <Button onClick={startNewRound}>
                Start Round {roundNumber + 1}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Game Over */}
        {gamePhase === "gameOver" && (
          <Card className="border-2 border-primary">
            <CardContent className="py-8 text-center">
              <div className="text-4xl mb-4">
                {players[0].totalScore <= Math.min(...players.slice(1).map(p => p.totalScore)) ? "🏆" : "😢"}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {players[0].totalScore <= Math.min(...players.slice(1).map(p => p.totalScore)) 
                  ? "You Win!" 
                  : `${players.reduce((min, p) => p.totalScore < min.totalScore ? p : min).name} Wins!`}
              </h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {players.sort((a, b) => a.totalScore - b.totalScore).map((player, i) => (
                  <div key={player.id} className={i === 0 ? "text-primary" : ""}>
                    <p className="font-semibold">{i + 1}. {player.name}</p>
                    <p className="text-xl">{player.totalScore} pts</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={resetGame}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Link href="/game-center">
                  <Button variant="outline">
                    Back to Game Center
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Thinking Indicator */}
        {isAIThinking && (
          <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-pulse">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm">{players[currentPlayer]?.name} is thinking...</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
