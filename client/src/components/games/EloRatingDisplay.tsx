import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Target,
  Award,
  History,
  Users,
  ChevronUp,
  ChevronDown,
  Flame,
  Crown,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface RatingTier {
  name: string;
  color: string;
  minRating: number;
  description?: string;
}

// Mock data for demonstration
const mockRating = {
  rating: 1547,
  gamesPlayed: 42,
  wins: 25,
  losses: 14,
  draws: 3,
  winStreak: 3,
  bestWinStreak: 7,
  peakRating: 1623,
  tier: { name: "Class B", color: "#4169E1", minRating: 1600 },
  ratingChange: 15,
};

const mockHistory = [
  { id: 1, oldRating: 1532, newRating: 1547, ratingChange: 15, opponentName: "ChessMaster99", opponentRating: 1612, result: "win", createdAt: new Date() },
  { id: 2, oldRating: 1548, newRating: 1532, ratingChange: -16, opponentName: "StrategyKing", opponentRating: 1489, result: "loss", createdAt: new Date(Date.now() - 86400000) },
  { id: 3, oldRating: 1540, newRating: 1548, ratingChange: 8, opponentName: "Rookie2024", opponentRating: 1320, result: "win", createdAt: new Date(Date.now() - 172800000) },
  { id: 4, oldRating: 1535, newRating: 1540, ratingChange: 5, opponentName: "GrandMaster", opponentRating: 2105, result: "draw", createdAt: new Date(Date.now() - 259200000) },
];

const mockLeaderboard = [
  { rank: 1, playerName: "ChessLegend", rating: 2456, gamesPlayed: 234, winRate: 78, tier: { name: "Grandmaster", color: "#FFD700", minRating: 2400 } },
  { rank: 2, playerName: "StrategyMaster", rating: 2312, gamesPlayed: 189, winRate: 72, tier: { name: "Master", color: "#E5E4E2", minRating: 2200 } },
  { rank: 3, playerName: "TacticalGenius", rating: 2198, gamesPlayed: 156, winRate: 69, tier: { name: "Expert", color: "#CD7F32", minRating: 2000 } },
  { rank: 4, playerName: "BoardWizard", rating: 2045, gamesPlayed: 201, winRate: 65, tier: { name: "Expert", color: "#CD7F32", minRating: 2000 } },
  { rank: 5, playerName: "MoveCalculator", rating: 1923, gamesPlayed: 178, winRate: 61, tier: { name: "Class A", color: "#9370DB", minRating: 1800 } },
];

const ratingTiers: RatingTier[] = [
  { name: "Grandmaster", color: "#FFD700", minRating: 2400, description: "Elite players" },
  { name: "Master", color: "#E5E4E2", minRating: 2200, description: "Expert level" },
  { name: "Expert", color: "#CD7F32", minRating: 2000, description: "Advanced players" },
  { name: "Class A", color: "#9370DB", minRating: 1800, description: "Strong players" },
  { name: "Class B", color: "#4169E1", minRating: 1600, description: "Intermediate" },
  { name: "Class C", color: "#32CD32", minRating: 1400, description: "Developing" },
  { name: "Class D", color: "#808080", minRating: 1200, description: "Novice" },
  { name: "Beginner", color: "#A0522D", minRating: 0, description: "New players" },
];

interface EloRatingDisplayProps {
  gameId?: string;
  compact?: boolean;
}

export function EloRatingDisplay({ gameId = "chess", compact = false }: EloRatingDisplayProps) {
  const [selectedGame, setSelectedGame] = useState(gameId);
  
  // Use mock data for now
  const rating = mockRating;
  const history = mockHistory;
  const leaderboard = mockLeaderboard;

  const winRate = rating.gamesPlayed > 0 
    ? Math.round((rating.wins / rating.gamesPlayed) * 100) 
    : 0;

  const currentTierIndex = ratingTiers.findIndex(t => t.name === rating.tier.name);
  const nextTier = currentTierIndex > 0 ? ratingTiers[currentTierIndex - 1] : null;
  const progressToNextTier = nextTier 
    ? Math.min(100, ((rating.rating - rating.tier.minRating) / (nextTier.minRating - rating.tier.minRating)) * 100)
    : 100;

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: rating.tier.color }}
              >
                {rating.rating}
              </div>
              <div>
                <p className="font-semibold">{rating.tier.name}</p>
                <p className="text-sm text-muted-foreground">
                  {rating.wins}W - {rating.losses}L - {rating.draws}D
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 ${rating.ratingChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {rating.ratingChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-medium">{rating.ratingChange > 0 ? "+" : ""}{rating.ratingChange}</span>
              </div>
              <p className="text-xs text-muted-foreground">Last match</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ backgroundColor: rating.tier.color }}
              >
                {rating.rating}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5" style={{ color: rating.tier.color }} />
                  <span className="text-xl font-bold">{rating.tier.name}</span>
                </div>
                
                {nextTier && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress to {nextTier.name}</span>
                      <span>{nextTier.minRating - rating.rating} points needed</span>
                    </div>
                    <Progress value={progressToNextTier} className="h-2" />
                  </div>
                )}
                
                <div className={`flex items-center gap-2 mt-3 ${rating.ratingChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {rating.ratingChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <span className="font-semibold text-lg">
                    {rating.ratingChange > 0 ? "+" : ""}{rating.ratingChange} from last match
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-3xl font-bold">{winRate}%</p>
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-xs mt-1">{rating.wins}W / {rating.losses}L / {rating.draws}D</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-3xl font-bold">{rating.winStreak}</p>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-xs mt-1">Best: {rating.bestWinStreak}</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{rating.gamesPlayed}</p>
            <p className="text-xs text-muted-foreground">Games Played</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold">{rating.peakRating}</p>
            <p className="text-xs text-muted-foreground">Peak Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold">{rating.wins}</p>
            <p className="text-xs text-muted-foreground">Total Wins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold">#{Math.floor(Math.random() * 100) + 50}</p>
            <p className="text-xs text-muted-foreground">Global Rank</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Match History
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="tiers">
            <Crown className="w-4 h-4 mr-2" />
            Rating Tiers
          </TabsTrigger>
        </TabsList>

        {/* Match History */}
        <TabsContent value="history" className="space-y-3 mt-4">
          {history.map((match) => (
            <Card key={match.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      match.result === "win" ? "bg-green-100 text-green-600" :
                      match.result === "loss" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {match.result === "win" ? <ChevronUp className="w-6 h-6" /> :
                       match.result === "loss" ? <ChevronDown className="w-6 h-6" /> :
                       <Minus className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-medium">vs {match.opponentName}</p>
                      <p className="text-sm text-muted-foreground">
                        Opponent rating: {match.opponentRating}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      match.ratingChange >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {match.ratingChange > 0 ? "+" : ""}{match.ratingChange}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {match.oldRating} → {match.newRating}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {leaderboard.map((player) => (
                  <div key={player.rank} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        player.rank === 1 ? "bg-amber-100 text-amber-600" :
                        player.rank === 2 ? "bg-gray-100 text-gray-600" :
                        player.rank === 3 ? "bg-orange-100 text-orange-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {player.rank}
                      </div>
                      <div>
                        <p className="font-medium">{player.playerName}</p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            style={{ borderColor: player.tier.color, color: player.tier.color }}
                          >
                            {player.tier.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {player.gamesPlayed} games
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{player.rating}</p>
                      <p className="text-xs text-muted-foreground">{player.winRate}% win rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rating Tiers */}
        <TabsContent value="tiers" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ratingTiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={`${rating.tier.name === tier.name ? "ring-2 ring-primary" : ""}`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: tier.color }}
                  >
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{tier.name}</p>
                      <Badge variant="outline">{tier.minRating}+</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                  {rating.tier.name === tier.name && (
                    <Badge className="bg-primary">Current</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EloRatingDisplay;
