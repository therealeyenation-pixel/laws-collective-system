import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Users } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type Suit = "spades" | "hearts" | "diamonds" | "clubs";
type CardValue = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

interface PlayingCard {
  suit: Suit;
  value: CardValue;
  numericValue: number;
}

const suitSymbols: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

const createDeck = (): PlayingCard[] => {
  const suits: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
  const values: { value: CardValue; numeric: number }[] = [
    { value: "2", numeric: 2 }, { value: "3", numeric: 3 }, { value: "4", numeric: 4 },
    { value: "5", numeric: 5 }, { value: "6", numeric: 6 }, { value: "7", numeric: 7 },
    { value: "8", numeric: 8 }, { value: "9", numeric: 9 }, { value: "10", numeric: 10 },
    { value: "J", numeric: 11 }, { value: "Q", numeric: 12 }, { value: "K", numeric: 13 },
    { value: "A", numeric: 14 },
  ];
  
  const deck: PlayingCard[] = [];
  for (const suit of suits) {
    for (const { value, numeric } of values) {
      deck.push({ suit, value, numericValue: numeric });
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

export default function Spades() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [currentTrick, setCurrentTrick] = useState<{ player: string; card: PlayingCard }[]>([]);
  const [leadSuit, setLeadSuit] = useState<Suit | null>(null);
  const [playerBid, setPlayerBid] = useState<number | null>(null);
  const [teamScore, setTeamScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [tricksWon, setTricksWon] = useState({ team: 0, opponents: 0 });
  const [gamePhase, setGamePhase] = useState<"bidding" | "playing" | "roundEnd">("bidding");
  const [highScore, setHighScore] = useState(0);
  const [aiHands, setAiHands] = useState<PlayingCard[][]>([[], [], []]);

  useEffect(() => {
    const saved = localStorage.getItem("spades_highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    const deck = shuffleDeck(createDeck());
    setPlayerHand(deck.slice(0, 13).sort((a, b) => {
      if (a.suit !== b.suit) {
        const suitOrder = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
      return b.numericValue - a.numericValue;
    }));
    setAiHands([deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)]);
    setCurrentTrick([]);
    setLeadSuit(null);
    setPlayerBid(null);
    setTricksWon({ team: 0, opponents: 0 });
    setGamePhase("bidding");
    setGameStarted(true);
  };

  const makeBid = (bid: number) => {
    setPlayerBid(bid);
    setGamePhase("playing");
    toast.success(`You bid ${bid} tricks. Partner bids 3. Opponents bid 5 total.`);
  };

  const playCard = (card: PlayingCard, index: number) => {
    if (gamePhase !== "playing") return;
    
    if (leadSuit && card.suit !== leadSuit) {
      const hasSuit = playerHand.some(c => c.suit === leadSuit);
      if (hasSuit) {
        toast.error(`You must follow suit (${leadSuit})`);
        return;
      }
    }
    
    const newHand = [...playerHand];
    newHand.splice(index, 1);
    setPlayerHand(newHand);
    
    const newTrick = [...currentTrick, { player: "player", card }];
    if (!leadSuit) setLeadSuit(card.suit);
    setCurrentTrick(newTrick);
    
    setTimeout(() => playAI(newTrick, card.suit, newHand), 500);
  };

  const playAI = (trick: { player: string; card: PlayingCard }[], lead: Suit, remainingPlayerHand: PlayingCard[]) => {
    const players = ["opponent1", "partner", "opponent2"];
    let currentTrickState = [...trick];
    const newAiHands = [...aiHands];
    
    for (let i = 0; i < 3; i++) {
      const hand = newAiHands[i];
      if (hand.length === 0) continue;
      
      let cardToPlay: PlayingCard;
      const suitCards = hand.filter(c => c.suit === lead);
      
      if (suitCards.length > 0) {
        cardToPlay = suitCards.reduce((min, c) => c.numericValue < min.numericValue ? c : min);
      } else {
        const spades = hand.filter(c => c.suit === "spades");
        if (spades.length > 0) {
          cardToPlay = spades.reduce((min, c) => c.numericValue < min.numericValue ? c : min);
        } else {
          cardToPlay = hand.reduce((min, c) => c.numericValue < min.numericValue ? c : min);
        }
      }
      
      const cardIndex = hand.findIndex(c => c.suit === cardToPlay.suit && c.value === cardToPlay.value);
      newAiHands[i] = hand.filter((_, idx) => idx !== cardIndex);
      currentTrickState.push({ player: players[i], card: cardToPlay });
    }
    
    setAiHands(newAiHands);
    setCurrentTrick(currentTrickState);
    
    setTimeout(() => resolveTrick(currentTrickState, lead, remainingPlayerHand), 1000);
  };

  const resolveTrick = (trick: { player: string; card: PlayingCard }[], lead: Suit, remainingPlayerHand: PlayingCard[]) => {
    let winner = trick[0];
    for (const play of trick) {
      if (play.card.suit === "spades" && winner.card.suit !== "spades") {
        winner = play;
      } else if (play.card.suit === winner.card.suit && play.card.numericValue > winner.card.numericValue) {
        winner = play;
      }
    }
    
    const isTeamWin = winner.player === "player" || winner.player === "partner";
    const newTricks = { ...tricksWon };
    if (isTeamWin) {
      newTricks.team++;
      toast.success("Your team wins the trick!");
    } else {
      newTricks.opponents++;
      toast.info("Opponents win the trick");
    }
    setTricksWon(newTricks);
    
    setTimeout(() => {
      setCurrentTrick([]);
      setLeadSuit(null);
      
      if (remainingPlayerHand.length === 0) {
        endRound(newTricks);
      }
    }, 1000);
  };

  const endRound = (tricks: { team: number; opponents: number }) => {
    const bid = playerBid || 0;
    const totalBid = bid + 3;
    
    let teamPoints = 0;
    if (tricks.team >= totalBid) {
      teamPoints = totalBid * 10 + (tricks.team - totalBid);
    } else {
      teamPoints = -totalBid * 10;
    }
    
    const opponentPoints = tricks.opponents >= 5 ? 50 : -50;
    
    const newTeamScore = teamScore + teamPoints;
    const newOpponentScore = opponentScore + opponentPoints;
    
    setTeamScore(newTeamScore);
    setOpponentScore(newOpponentScore);
    
    if (newTeamScore > highScore) {
      setHighScore(newTeamScore);
      localStorage.setItem("spades_highscore", newTeamScore.toString());
    }
    
    setGamePhase("roundEnd");
    toast.success(`Round over! Your team: ${teamPoints > 0 ? "+" : ""}${teamPoints} points`);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/game-center">
              <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Center
              </Button>
            </Link>
          </div>

          <Card className="p-8 text-center bg-green-800 border-green-700">
            <div className="w-20 h-20 mx-auto mb-6 bg-black rounded-full flex items-center justify-center">
              <span className="text-4xl text-white">♠</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-white">Spades</h1>
            <p className="text-green-200 mb-6 max-w-md mx-auto">
              Classic partnership card game. Bid on tricks, play strategically with your partner,
              and use spades as trump to win!
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
              <div className="text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-green-300" />
                <p className="text-sm font-medium text-green-200">4 Players</p>
              </div>
              <div className="text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <p className="text-sm font-medium text-green-200">Strategy</p>
              </div>
              <div className="text-center">
                <span className="text-2xl">♠</span>
                <p className="text-sm font-medium text-green-200">Trump Suit</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center mb-6">
              <Badge variant="outline" className="border-green-600 text-green-200">Ages 10+</Badge>
              <Badge variant="outline" className="border-green-600 text-green-200">SELF Pillar</Badge>
            </div>

            {highScore > 0 && (
              <div className="mb-6 p-4 bg-green-700 rounded-lg">
                <p className="text-sm text-green-300">High Score</p>
                <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
              </div>
            )}

            <Button onClick={startGame} size="lg" className="bg-black hover:bg-gray-900 text-white">
              Start Game
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/game-center">
            <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-600">Your Team: {teamScore}</Badge>
            <Badge className="bg-red-600">Opponents: {opponentScore}</Badge>
          </div>
          
          <Button variant="ghost" size="sm" onClick={startGame} className="text-white">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {gamePhase === "bidding" && (
          <Card className="p-6 mb-4 bg-green-800 border-green-700 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Make Your Bid</h2>
            <p className="text-green-200 mb-4">How many tricks do you think you can win?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(bid => (
                <Button
                  key={bid}
                  variant="outline"
                  className="w-12 h-12 border-green-600 text-white hover:bg-green-700"
                  onClick={() => makeBid(bid)}
                >
                  {bid === 0 ? "Nil" : bid}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {gamePhase === "roundEnd" && (
          <Card className="p-6 mb-4 bg-green-800 border-green-700 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-xl font-bold text-white mb-2">Round Complete!</h2>
            <p className="text-green-200 mb-4">
              Your team won {tricksWon.team} tricks (bid: {(playerBid || 0) + 3})
            </p>
            <Button onClick={startGame} className="bg-black hover:bg-gray-900">
              Next Round
            </Button>
          </Card>
        )}

        {gamePhase === "playing" && (
          <>
            <Card className="p-6 mb-4 bg-green-700 border-green-600">
              <div className="text-center mb-4">
                <p className="text-green-200">Tricks: Your Team {tricksWon.team} - {tricksWon.opponents} Opponents</p>
              </div>
              <div className="grid grid-cols-4 gap-4 min-h-[100px]">
                {["player", "opponent1", "partner", "opponent2"].map(player => {
                  const play = currentTrick.find(t => t.player === player);
                  return (
                    <div key={player} className="text-center">
                      <p className="text-xs text-green-300 mb-1">
                        {player === "player" ? "You" : player === "partner" ? "Partner" : `Opp ${player.slice(-1)}`}
                      </p>
                      {play ? (
                        <div className="bg-white rounded-lg p-2 inline-block">
                          <span className={`text-xl ${play.card.suit === "hearts" || play.card.suit === "diamonds" ? "text-red-500" : "text-black"}`}>
                            {play.card.value}{suitSymbols[play.card.suit]}
                          </span>
                        </div>
                      ) : (
                        <div className="w-12 h-16 border-2 border-dashed border-green-500 rounded-lg mx-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4 bg-green-800 border-green-700">
              <p className="text-green-200 text-sm mb-2 text-center">Your Hand (Bid: {playerBid})</p>
              <div className="flex flex-wrap justify-center gap-1">
                {playerHand.map((card, index) => (
                  <button
                    key={`${card.suit}-${card.value}`}
                    onClick={() => playCard(card, index)}
                    className="bg-white rounded-lg p-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                  >
                    <span className={`text-lg font-bold ${card.suit === "hearts" || card.suit === "diamonds" ? "text-red-500" : "text-black"}`}>
                      {card.value}{suitSymbols[card.suit]}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
