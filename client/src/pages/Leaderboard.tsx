import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Flame,
  Star,
  TrendingUp,
  Calendar,
  Gamepad2,
  Target,
  Zap,
} from "lucide-react";

interface LeaderboardEntry {
  id: number;
  score: number;
  difficulty: string;
  correctAnswers: number;
  totalQuestions: number;
  maxStreak: number;
  tokensEarned: number;
  completedAt: string;
  playerName: string | null;
}

const GAME_TYPES = [
  { id: "financial_literacy", name: "Financial Literacy", icon: "💰" },
  { id: "business_tycoon", name: "Business Tycoon", icon: "🏢" },
  { id: "tax_simulator", name: "Tax Simulator", icon: "📊" },
  { id: "crossword", name: "Crossword Puzzle", icon: "📝" },
  { id: "spades", name: "Spades", icon: "♠️" },
  { id: "weather_wizards", name: "Weather Wizards", icon: "🌤️" },
];

const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced", "expert"];

export default function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState("financial_literacy");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [timeframe, setTimeframe] = useState<"all" | "weekly" | "monthly">("all");

  const { data: topScores, isLoading } = trpc.leaderboard.getTopScores.useQuery({
    gameType: selectedGame,
    limit: 20,
    difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
  });

  const { data: userStats } = trpc.leaderboard.getUserStats.useQuery();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300";
      default:
        return "bg-background border-border";
    }
  };

  const difficultyColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-orange-100 text-orange-800",
    expert: "bg-red-100 text-red-800",
  };

  const currentGame = GAME_TYPES.find((g) => g.id === selectedGame);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl font-bold text-foreground">Leaderboard</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compete with other players, climb the ranks, and earn LUV tokens for your achievements.
          </p>
        </div>

        {/* User Stats Summary */}
        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-700">{userStats.totalGames || 0}</p>
                <p className="text-sm text-muted-foreground">Games Played</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{userStats.highestScore || 0}</p>
                <p className="text-sm text-muted-foreground">Best Score</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{userStats.totalTokensEarned || 0}</p>
                <p className="text-sm text-muted-foreground">Tokens Earned</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-700">{userStats.bestStreak || 0}</p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Game</label>
                  <Select value={selectedGame} onValueChange={setSelectedGame}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GAME_TYPES.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          <span className="flex items-center gap-2">
                            <span>{game.icon}</span>
                            <span>{game.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as typeof timeframe)}>
                <TabsList>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{currentGame?.icon}</span>
              {currentGame?.name} Leaderboard
            </CardTitle>
            <CardDescription>
              Top players ranked by score
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Gamepad2 className="w-8 h-8 animate-pulse text-muted-foreground" />
              </div>
            ) : !topScores?.scores || topScores.scores.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No scores yet. Be the first to play!</p>
                <Button className="mt-4" onClick={() => window.location.href = "/game-center"}>
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Go to Game Center
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {topScores.scores.map((entry: LeaderboardEntry, idx: number) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${getRankBg(idx + 1)}`}
                  >
                    <div className="flex-shrink-0">{getRankIcon(idx + 1)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {entry.playerName || "Anonymous Player"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge className={difficultyColors[entry.difficulty] || "bg-gray-100"} variant="secondary">
                          {entry.difficulty}
                        </Badge>
                        <span>•</span>
                        <span>{entry.correctAnswers}/{entry.totalQuestions} correct</span>
                        <span>•</span>
                        <span>{entry.maxStreak} streak</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{entry.score.toLocaleString()}</p>
                      <p className="text-sm text-amber-600 flex items-center justify-end gap-1">
                        <Zap className="w-3 h-3" />
                        {entry.tokensEarned} tokens
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Selection Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              All Games
            </CardTitle>
            <CardDescription>Select a game to view its leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {GAME_TYPES.map((game) => (
                <Button
                  key={game.id}
                  variant={selectedGame === game.id ? "default" : "outline"}
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => setSelectedGame(game.id)}
                >
                  <span className="text-2xl">{game.icon}</span>
                  <span className="text-xs">{game.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
