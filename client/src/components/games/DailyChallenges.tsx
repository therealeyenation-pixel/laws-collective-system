import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Clock, 
  Star, 
  Trophy,
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  Gift,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: "daily" | "weekly";
  difficulty: "easy" | "medium" | "hard";
  tokenReward: number;
  xpReward: number;
  targetValue: number;
  currentProgress: number;
  isCompleted: boolean;
  expiresAt: string;
}

export default function DailyChallenges() {
  const [activeTab, setActiveTab] = useState("daily");

  // Mock data - will be replaced with tRPC calls
  const dailyChallenges: Challenge[] = [
    {
      id: 1,
      title: "Play 3 Games",
      description: "Complete any 3 games today",
      type: "daily",
      difficulty: "easy",
      tokenReward: 10,
      xpReward: 50,
      targetValue: 3,
      currentProgress: 1,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title: "Win a Strategy Game",
      description: "Win any strategy game (Chess, Checkers, etc.)",
      type: "daily",
      difficulty: "medium",
      tokenReward: 20,
      xpReward: 100,
      targetValue: 1,
      currentProgress: 0,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      title: "Complete a Puzzle",
      description: "Solve any puzzle game",
      type: "daily",
      difficulty: "easy",
      tokenReward: 15,
      xpReward: 75,
      targetValue: 1,
      currentProgress: 1,
      isCompleted: true,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    }
  ];

  const weeklyChallenges: Challenge[] = [
    {
      id: 4,
      title: "Game Master",
      description: "Play 20 different games this week",
      type: "weekly",
      difficulty: "hard",
      tokenReward: 100,
      xpReward: 500,
      targetValue: 20,
      currentProgress: 8,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      title: "Streak Champion",
      description: "Maintain a 7-day login streak",
      type: "weekly",
      difficulty: "medium",
      tokenReward: 75,
      xpReward: 350,
      targetValue: 7,
      currentProgress: 5,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 6,
      title: "Knowledge Seeker",
      description: "Complete 5 trivia quizzes",
      type: "weekly",
      difficulty: "medium",
      tokenReward: 50,
      xpReward: 250,
      targetValue: 5,
      currentProgress: 5,
      isCompleted: true,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const handleClaimReward = (challenge: Challenge) => {
    toast.success(`Claimed ${challenge.tokenReward} tokens and ${challenge.xpReward} XP!`);
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <Card className={`transition-all ${challenge.isCompleted ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            challenge.isCompleted 
              ? "bg-green-100 dark:bg-green-900/50" 
              : "bg-muted"
          }`}>
            {challenge.isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <Target className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{challenge.title}</h3>
              <Badge className={getDifficultyColor(challenge.difficulty)}>
                {challenge.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
            
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{challenge.currentProgress} / {challenge.targetValue}</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining(challenge.expiresAt)}
                </span>
              </div>
              <Progress 
                value={(challenge.currentProgress / challenge.targetValue) * 100} 
                className="h-2"
              />
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{challenge.tokenReward} tokens</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Zap className="w-4 h-4 text-purple-500" />
                <span>{challenge.xpReward} XP</span>
              </div>
            </div>
          </div>

          {/* Claim Button */}
          {challenge.isCompleted && (
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleClaimReward(challenge)}
            >
              <Gift className="w-4 h-4 mr-1" />
              Claim
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const completedDaily = dailyChallenges.filter(c => c.isCompleted).length;
  const completedWeekly = weeklyChallenges.filter(c => c.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{completedDaily}/{dailyChallenges.length}</p>
            <p className="text-sm text-muted-foreground">Daily Done</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{completedWeekly}/{weeklyChallenges.length}</p>
            <p className="text-sm text-muted-foreground">Weekly Done</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">
              {dailyChallenges.filter(c => c.isCompleted).reduce((sum, c) => sum + c.tokenReward, 0) +
               weeklyChallenges.filter(c => c.isCompleted).reduce((sum, c) => sum + c.tokenReward, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Tokens Earned</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Challenges Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Daily Challenges
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Weekly Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4 space-y-4">
          {dailyChallenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </TabsContent>

        <TabsContent value="weekly" className="mt-4 space-y-4">
          {weeklyChallenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">How Challenges Work</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Complete daily and weekly challenges to earn tokens and XP. Challenges reset at midnight (daily) 
                or Sunday (weekly). Build streaks for bonus rewards!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
