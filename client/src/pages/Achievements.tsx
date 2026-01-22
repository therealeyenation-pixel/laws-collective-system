import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Clock,
  Calendar,
  ChevronUp,
  Sparkles,
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

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  bronze: { bg: "bg-amber-700", text: "text-amber-100", border: "border-amber-600" },
  silver: { bg: "bg-gray-400", text: "text-gray-900", border: "border-gray-300" },
  gold: { bg: "bg-yellow-500", text: "text-yellow-900", border: "border-yellow-400" },
  platinum: { bg: "bg-gradient-to-r from-purple-400 to-pink-400", text: "text-white", border: "border-purple-300" },
};

const tierLabels: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

export default function Achievements() {
  const [activeTab, setActiveTab] = useState("achievements");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  
  // Fetch all achievements
  const { data: allAchievements, isLoading: loadingAll } = trpc.achievements.getAll.useQuery();
  
  // Fetch player's earned achievements
  const { data: playerAchievements, isLoading: loadingPlayer } = trpc.achievements.getPlayerAchievements.useQuery();
  
  // Fetch player's progress
  const { data: progress, isLoading: loadingProgress } = trpc.achievements.getPlayerProgress.useQuery();
  
  // Fetch achievement leaderboard
  const { data: leaderboard, isLoading: loadingLeaderboard } = trpc.achievements.getAchievementLeaderboard.useQuery({ limit: 10 });

  // Fetch daily challenges
  const { data: dailyChallenges } = trpc.challenges.getDailyChallenges.useQuery();
  
  // Fetch weekly challenges
  const { data: weeklyChallenges } = trpc.challenges.getWeeklyChallenges.useQuery();
  
  // Fetch tier stats
  const { data: tierStats } = trpc.achievements.getTierStats.useQuery();

  // Mutations
  const generateShareLinkMutation = trpc.achievements.generateShareLink.useMutation({
    onSuccess: (data) => {
      setSelectedAchievement(data);
      setShareDialogOpen(true);
    },
    onError: () => {
      toast.error("Failed to generate share link");
    },
  });

  const recordShareMutation = trpc.achievements.recordShare.useMutation();

  const startChallengeMutation = trpc.challenges.startChallenge.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.info(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const earnedAchievementIds = new Set(playerAchievements?.map(pa => pa.achievementId) || []);

  // Filter achievements by game type
  const filterAchievements = (gameType: string) => {
    if (!allAchievements) return [];
    if (gameType === "all") return allAchievements;
    return allAchievements.filter(a => 
      (a as any).gameType === gameType || (a as any).gameType === "all"
    );
  };

  const handleShare = (platform: "twitter" | "facebook" | "linkedin" | "copy", achievementId: number) => {
    const shareUrl = `${window.location.origin}${selectedAchievement?.shareUrl}`;
    const shareText = `I just earned the "${selectedAchievement?.achievement?.name}" achievement on L.A.W.S. Collective! 🏆`;
    
    recordShareMutation.mutate({ achievementId, platform });
    
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
        break;
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground">Achievements & Challenges</h1>
            <p className="text-muted-foreground">Track your progress, complete challenges, and earn L.A.W.S. tokens</p>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                  {progress?.earnedCount || 0}
                </div>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {progress?.totalTokensFromAchievements || 0}
                </div>
                <p className="text-sm text-muted-foreground">Tokens Earned</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-700">{tierStats?.bronze || 0}</div>
                <p className="text-sm text-muted-foreground">Bronze</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400">{tierStats?.silver || 0}</div>
                <p className="text-sm text-muted-foreground">Silver</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500">{tierStats?.gold || 0}</div>
                <p className="text-sm text-muted-foreground">Gold</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span className="font-bold">{progress?.percentage || 0}%</span>
              </div>
              <Progress value={progress?.percentage || 0} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Target className="w-4 h-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Crown className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {allAchievements?.map((achievement, index) => {
                  const isEarned = earnedAchievementIds.has(achievement.id);
                  const icon = iconMap[(achievement as any).badgeIcon] || <Star className="w-6 h-6" />;
                  const playerAchievement = playerAchievements?.find(pa => pa.achievementId === achievement.id);
                  const tier = playerAchievement?.currentTier || "bronze";
                  
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
                          {/* Badge Icon with Tier */}
                          <div className="relative">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                              isEarned 
                                ? `${tierColors[tier]?.bg || "bg-amber-700"} ${tierColors[tier]?.text || "text-white"} shadow-lg` 
                                : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                            }`}>
                              {isEarned ? icon : <Lock className="w-6 h-6" />}
                            </div>
                            {isEarned && (
                              <Badge className={`absolute -bottom-1 -right-1 text-xs px-1 ${tierColors[tier]?.bg || ""} ${tierColors[tier]?.text || ""}`}>
                                {tierLabels[tier]}
                              </Badge>
                            )}
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={achievementTypeColors[(achievement as any).achievementType] || "bg-gray-100"}>
                                {(achievement as any).achievementType}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Coins className="w-3 h-3" />
                                {(achievement as any).tokenReward || 0} tokens
                              </Badge>
                              {isEarned && playerAchievement && (
                                <Badge variant="outline" className="gap-1">
                                  <ChevronUp className="w-3 h-3" />
                                  {playerAchievement.progressCount || 1}x earned
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Share Button */}
                          {isEarned && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => generateShareLinkMutation.mutate({ achievementId: achievement.id })}
                            >
                              <Share2 className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Links Sidebar */}
              <div className="space-y-6">
                <Card>
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

                {/* Tier Progress Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Tier System
                    </CardTitle>
                    <CardDescription>Upgrade achievements by repeating them</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center">
                        <Star className="w-4 h-4 text-amber-100" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Bronze</p>
                        <p className="text-xs text-muted-foreground">1 completion</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                        <Star className="w-4 h-4 text-gray-900" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Silver</p>
                        <p className="text-xs text-muted-foreground">3 completions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-900" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Gold</p>
                        <p className="text-xs text-muted-foreground">5 completions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Platinum</p>
                        <p className="text-xs text-muted-foreground">10 completions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Daily Challenges
                  </CardTitle>
                  <CardDescription>Reset every day at midnight</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dailyChallenges?.today && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          {iconMap[dailyChallenges.today.badgeIcon] || <Target className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground">{dailyChallenges.today.name}</h4>
                          <p className="text-sm text-muted-foreground">{dailyChallenges.today.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className="gap-1">
                          <Coins className="w-3 h-3" />
                          {dailyChallenges.today.tokenReward} tokens
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => startChallengeMutation.mutate({ 
                            challengeType: "daily", 
                            challengeName: dailyChallenges.today!.name 
                          })}
                          disabled={startChallengeMutation.isPending}
                        >
                          Start Challenge
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">All Daily Challenges:</p>
                    {dailyChallenges?.allDaily.map((challenge, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][challenge.rotationSlot]}
                        </div>
                        <span className="text-sm flex-1">{challenge.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {challenge.tokenReward} tokens
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    Weekly Challenges
                  </CardTitle>
                  <CardDescription>Reset every Sunday at midnight</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weeklyChallenges?.thisWeek && (
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
                          {iconMap[weeklyChallenges.thisWeek.badgeIcon] || <Target className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground">{weeklyChallenges.thisWeek.name}</h4>
                          <p className="text-sm text-muted-foreground">{weeklyChallenges.thisWeek.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className="gap-1">
                          <Coins className="w-3 h-3" />
                          {weeklyChallenges.thisWeek.tokenReward} tokens
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => startChallengeMutation.mutate({ 
                            challengeType: "weekly", 
                            challengeName: weeklyChallenges.thisWeek!.name 
                          })}
                          disabled={startChallengeMutation.isPending}
                        >
                          Start Challenge
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">All Weekly Challenges:</p>
                    {weeklyChallenges?.allWeekly.map((challenge, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          W{challenge.rotationSlot + 1}
                        </div>
                        <span className="text-sm flex-1">{challenge.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {challenge.tokenReward} tokens
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
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
                        className={`flex items-center gap-3 p-4 rounded-lg ${
                          index === 0 ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200" :
                          index === 1 ? "bg-gray-100 dark:bg-gray-800 border border-gray-200" :
                          index === 2 ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200" :
                          "bg-background border"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? "bg-yellow-500 text-white" :
                          index === 1 ? "bg-gray-400 text-white" :
                          index === 2 ? "bg-amber-600 text-white" :
                          "bg-gray-200 dark:bg-gray-700 text-muted-foreground"
                        }`}>
                          {index === 0 ? <Crown className="w-5 h-5" /> :
                           index === 1 ? <Medal className="w-5 h-5" /> :
                           index === 2 ? <Award className="w-5 h-5" /> :
                           entry.rank}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{entry.playerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.achievementCount} achievements
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-lg font-bold text-green-600 dark:text-green-400">
                            <Coins className="w-4 h-4" />
                            {entry.totalTokens}
                          </div>
                          <p className="text-xs text-muted-foreground">tokens</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No achievements earned yet. Be the first!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Achievement</DialogTitle>
              <DialogDescription>
                Share your "{selectedAchievement?.achievement?.name}" achievement with others!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Achievement Preview */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    tierColors[selectedAchievement?.achievement?.tier || "bronze"]?.bg
                  } ${tierColors[selectedAchievement?.achievement?.tier || "bronze"]?.text}`}>
                    {iconMap[selectedAchievement?.achievement?.badgeIcon] || <Star className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold">{selectedAchievement?.achievement?.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedAchievement?.achievement?.description}</p>
                    <Badge className="mt-1">{tierLabels[selectedAchievement?.achievement?.tier || "bronze"]} Tier</Badge>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleShare("twitter", selectedAchievement?.achievementId)}
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleShare("facebook", selectedAchievement?.achievementId)}
                >
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <span className="text-xs">Facebook</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleShare("linkedin", selectedAchievement?.achievementId)}
                >
                  <Linkedin className="w-5 h-5 text-blue-700" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleShare("copy", selectedAchievement?.achievementId)}
                >
                  <Copy className="w-5 h-5" />
                  <span className="text-xs">Copy Link</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
