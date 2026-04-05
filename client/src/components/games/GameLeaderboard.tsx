import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Medal, 
  Star, 
  Flame,
  TrendingUp,
  Crown,
  Users,
  ChevronDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  experiencePoints: number;
  totalWins: number;
  totalTokens: number;
  currentStreak: number;
  level: number;
}

export default function GameLeaderboard() {
  const [sortBy, setSortBy] = useState<"xp" | "wins" | "tokens" | "streak">("xp");
  const [timeRange, setTimeRange] = useState<"all" | "week" | "month">("all");

  // Mock data - will be replaced with tRPC calls
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, userId: 1, displayName: "WealthBuilder", avatarUrl: null, experiencePoints: 15000, totalWins: 89, totalTokens: 2500, currentStreak: 45, level: 15 },
    { rank: 2, userId: 2, displayName: "FinanceKing", avatarUrl: null, experiencePoints: 12500, totalWins: 76, totalTokens: 2100, currentStreak: 30, level: 13 },
    { rank: 3, userId: 3, displayName: "MoneyMaster", avatarUrl: null, experiencePoints: 11000, totalWins: 65, totalTokens: 1800, currentStreak: 21, level: 11 },
    { rank: 4, userId: 4, displayName: "LegacyBuilder", avatarUrl: null, experiencePoints: 9500, totalWins: 58, totalTokens: 1500, currentStreak: 14, level: 10 },
    { rank: 5, userId: 5, displayName: "WealthWise", avatarUrl: null, experiencePoints: 8000, totalWins: 45, totalTokens: 1200, currentStreak: 7, level: 8 },
    { rank: 6, userId: 6, displayName: "FinancePro", avatarUrl: null, experiencePoints: 7500, totalWins: 42, totalTokens: 1100, currentStreak: 5, level: 8 },
    { rank: 7, userId: 7, displayName: "MoneyMaven", avatarUrl: null, experiencePoints: 6000, totalWins: 35, totalTokens: 900, currentStreak: 3, level: 6 },
    { rank: 8, userId: 8, displayName: "WealthSeeker", avatarUrl: null, experiencePoints: 5500, totalWins: 30, totalTokens: 800, currentStreak: 2, level: 6 },
    { rank: 9, userId: 9, displayName: "FinanceRookie", avatarUrl: null, experiencePoints: 4000, totalWins: 22, totalTokens: 600, currentStreak: 1, level: 4 },
    { rank: 10, userId: 10, displayName: "NewLearner", avatarUrl: null, experiencePoints: 2500, totalWins: 15, totalTokens: 400, currentStreak: 0, level: 3 },
  ];

  // Sort data based on selected criteria
  const sortedData = [...leaderboardData].sort((a, b) => {
    switch (sortBy) {
      case "xp": return b.experiencePoints - a.experiencePoints;
      case "wins": return b.totalWins - a.totalWins;
      case "tokens": return b.totalTokens - a.totalTokens;
      case "streak": return b.currentStreak - a.currentStreak;
      default: return 0;
    }
  }).map((entry, index) => ({ ...entry, rank: index + 1 }));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800";
      case 2: return "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 border-gray-200 dark:border-gray-700";
      case 3: return "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800";
      default: return "";
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "xp": return "Experience Points";
      case "wins": return "Total Wins";
      case "tokens": return "Tokens Earned";
      case "streak": return "Daily Streak";
      default: return "Experience Points";
    }
  };

  const getStatValue = (entry: LeaderboardEntry) => {
    switch (sortBy) {
      case "xp": return `${entry.experiencePoints.toLocaleString()} XP`;
      case "wins": return `${entry.totalWins} wins`;
      case "tokens": return `${entry.totalTokens.toLocaleString()} tokens`;
      case "streak": return `${entry.currentStreak} days`;
      default: return `${entry.experiencePoints.toLocaleString()} XP`;
    }
  };

  // Current user stats (mock)
  const currentUserRank = 15;
  const currentUserStats = {
    experiencePoints: 2350,
    totalWins: 12,
    totalTokens: 150,
    currentStreak: 5
  };

  return (
    <div className="space-y-6">
      {/* Your Ranking Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <span className="text-xl font-bold text-green-700">#{currentUserRank}</span>
              </div>
              <div>
                <p className="font-semibold">Your Ranking</p>
                <p className="text-sm text-muted-foreground">Keep playing to climb the leaderboard!</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold">{currentUserStats.experiencePoints}</p>
                <p className="text-muted-foreground">XP</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{currentUserStats.totalWins}</p>
                <p className="text-muted-foreground">Wins</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{currentUserStats.currentStreak}</p>
                <p className="text-muted-foreground">Streak</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xp">Experience Points</SelectItem>
            <SelectItem value="wins">Total Wins</SelectItem>
            <SelectItem value="tokens">Tokens Earned</SelectItem>
            <SelectItem value="streak">Daily Streak</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4">
        {sortedData.slice(0, 3).map((entry, index) => {
          const podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze order for display
          const displayEntry = sortedData[podiumOrder[index]];
          const heights = ["h-24", "h-32", "h-20"];
          
          return (
            <Card key={displayEntry.userId} className={`${getRankBg(displayEntry.rank)} text-center`}>
              <CardContent className="p-4">
                <div className={`${heights[index]} flex flex-col justify-end`}>
                  <Avatar className="w-16 h-16 mx-auto mb-2 border-4 border-background shadow-lg">
                    <AvatarImage src={displayEntry.avatarUrl || undefined} />
                    <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                      {displayEntry.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mb-2">{getRankIcon(displayEntry.rank)}</div>
                  <p className="font-bold truncate">{displayEntry.displayName}</p>
                  <p className="text-sm text-muted-foreground">Level {displayEntry.level}</p>
                  <Badge variant="secondary" className="mt-2">
                    {getStatValue(displayEntry)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {getSortLabel()} Leaderboard
          </CardTitle>
          <CardDescription>
            Top players ranked by {getSortLabel().toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedData.slice(3).map((entry) => (
              <div 
                key={entry.userId}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 text-center">
                  {getRankIcon(entry.rank)}
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.avatarUrl || undefined} />
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {entry.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{entry.displayName}</p>
                  <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{getStatValue(entry)}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Flame className="w-3 h-3 text-orange-500" />
                    {entry.currentStreak} day streak
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
