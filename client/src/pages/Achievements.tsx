import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Trophy,
  Star,
  Award,
  Crown,
  Medal,
  Target,
  Zap,
  Shield,
  Flame,
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  Building2,
  Package,
  Compass,
  Coins,
  Gem,
  CheckCircle2,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";

// Icon mapping for achievement badges
const iconMap: Record<string, React.ReactNode> = {
  star: <Star className="w-6 h-6" />,
  trophy: <Trophy className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  flame: <Flame className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  "trending-up": <TrendingUp className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
  briefcase: <Briefcase className="w-6 h-6" />,
  building: <Building2 className="w-6 h-6" />,
  "dollar-sign": <DollarSign className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  package: <Package className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  "shield-check": <Shield className="w-6 h-6" />,
  compass: <Compass className="w-6 h-6" />,
  coins: <Coins className="w-6 h-6" />,
  gem: <Gem className="w-6 h-6" />,
  medal: <Medal className="w-6 h-6" />,
};

const achievementTypeColors: Record<string, string> = {
  milestone: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  streak: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  skill: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  tournament: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  special: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function Achievements() {
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch all achievements
  const { data: allAchievements, isLoading: loadingAll } = trpc.achievements.getAll.useQuery();
  
  // Fetch player's earned achievements
  const { data: playerAchievements, isLoading: loadingPlayer } = trpc.achievements.getPlayerAchievements.useQuery();
  
  // Fetch player's progress
  const { data: progress, isLoading: loadingProgress } = trpc.achievements.getPlayerProgress.useQuery();
  
  // Fetch achievement leaderboard
  const { data: leaderboard, isLoading: loadingLeaderboard } = trpc.achievements.getAchievementLeaderboard.useQuery({ limit: 10 });

  const earnedAchievementIds = new Set(playerAchievements?.map(pa => pa.achievementId) || []);

  // Filter achievements by game type
  const filterAchievements = (gameType: string) => {
    if (!allAchievements) return [];
    if (gameType === "all") return allAchievements;
    return allAchievements.filter(a => 
      (a as any).gameType === gameType || (a as any).gameType === "all"
    );
  };

  const filteredAchievements = filterAchievements(activeTab);

  if (loadingAll || loadingPlayer || loadingProgress) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Trophy className="w-12 h-12 animate-pulse mx-auto text-yellow-500" />
            <p className="text-muted-foreground">Loading achievements...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/game-center">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
            <p className="text-muted-foreground">Track your progress and earn L.A.W.S. tokens</p>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                  {progress?.earnedCount || 0}
                </div>
                <p className="text-sm text-muted-foreground">Achievements Earned</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                  {progress?.totalAchievements || 0}
                </div>
                <p className="text-sm text-muted-foreground">Total Achievements</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {progress?.totalTokensFromAchievements || 0}
                </div>
                <p className="text-sm text-muted-foreground">Tokens Earned</p>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span className="font-bold">{progress?.percentage || 0}%</span>
                </div>
                <Progress value={progress?.percentage || 0} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Achievements Section */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="financial-literacy">Financial Literacy</TabsTrigger>
                <TabsTrigger value="business-tycoon">Business Tycoon</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredAchievements.map((achievement, index) => {
                  const isEarned = earnedAchievementIds.has(achievement.id);
                  const icon = iconMap[(achievement as any).badgeIcon] || <Star className="w-6 h-6" />;
                  
                  return (
                    <Card 
                      key={achievement.id} 
                      className={`transition-all ${
                        isEarned 
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-300 dark:border-green-700" 
                          : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Badge Icon */}
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                            isEarned 
                              ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg" 
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                          }`}>
                            {isEarned ? icon : <Lock className="w-6 h-6" />}
                          </div>
                          
                          {/* Achievement Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-bold ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>
                                {achievement.name}
                              </h3>
                              {isEarned && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge className={achievementTypeColors[(achievement as any).achievementType] || "bg-gray-100"}>
                                {(achievement as any).achievementType}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Coins className="w-3 h-3" />
                                {(achievement as any).tokenReward || 0} tokens
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredAchievements.length === 0 && (
                  <Card className="p-8 text-center">
                    <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No achievements found for this category.</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Leaderboard Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Achievement Hunters
                </CardTitle>
                <CardDescription>Top players by achievements earned</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLeaderboard ? (
                  <div className="text-center py-8">
                    <Trophy className="w-8 h-8 animate-pulse mx-auto text-yellow-500" />
                  </div>
                ) : leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div 
                        key={entry.playerId} 
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          index === 0 ? "bg-yellow-50 dark:bg-yellow-950/20" :
                          index === 1 ? "bg-gray-100 dark:bg-gray-800" :
                          index === 2 ? "bg-amber-50 dark:bg-amber-950/20" :
                          "bg-background"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? "bg-yellow-500 text-white" :
                          index === 1 ? "bg-gray-400 text-white" :
                          index === 2 ? "bg-amber-600 text-white" :
                          "bg-gray-200 dark:bg-gray-700 text-muted-foreground"
                        }`}>
                          {index === 0 ? <Crown className="w-4 h-4" /> :
                           index === 1 ? <Medal className="w-4 h-4" /> :
                           index === 2 ? <Award className="w-4 h-4" /> :
                           entry.rank}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{entry.playerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.achievementCount} achievements
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                            <Coins className="w-3 h-3" />
                            {entry.totalTokens}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">No achievements earned yet. Be the first!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Play Games</CardTitle>
                <CardDescription>Earn achievements by playing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/games/financial-literacy">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <DollarSign className="w-4 h-4" />
                    Financial Literacy Quiz
                  </Button>
                </Link>
                <Link href="/games/business-tycoon">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Building2 className="w-4 h-4" />
                    Business Tycoon Simulator
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
