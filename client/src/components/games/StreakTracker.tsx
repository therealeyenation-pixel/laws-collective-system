import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Flame, 
  Calendar, 
  Star, 
  Trophy,
  CheckCircle2,
  Circle,
  Gift,
  Sparkles,
  Target,
  Award
} from "lucide-react";
import { toast } from "sonner";

interface StreakMilestone {
  days: number;
  reward: number;
  badge: string;
  achieved: boolean;
}

export default function StreakTracker() {
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Mock data - will be replaced with tRPC calls
  const currentStreak = 5;
  const longestStreak = 14;
  const totalCheckIns = 45;

  const milestones: StreakMilestone[] = [
    { days: 7, reward: 50, badge: "Week Warrior", achieved: false },
    { days: 14, reward: 100, badge: "Fortnight Fighter", achieved: false },
    { days: 30, reward: 250, badge: "Monthly Master", achieved: false },
    { days: 60, reward: 500, badge: "Dedicated Learner", achieved: false },
    { days: 90, reward: 1000, badge: "Quarter Champion", achieved: false },
    { days: 180, reward: 2500, badge: "Half-Year Hero", achieved: false },
    { days: 365, reward: 10000, badge: "Annual Legend", achieved: false }
  ];

  // Calculate which milestones are achieved based on longest streak
  const achievedMilestones = milestones.map(m => ({
    ...m,
    achieved: longestStreak >= m.days
  }));

  const nextMilestone = achievedMilestones.find(m => !m.achieved);
  const progressToNext = nextMilestone 
    ? (currentStreak / nextMilestone.days) * 100 
    : 100;

  const handleCheckIn = () => {
    if (hasCheckedInToday) {
      toast.info("You've already checked in today!");
      return;
    }
    setHasCheckedInToday(true);
    toast.success("Daily check-in complete! +5 tokens earned");
  };

  // Generate last 7 days for the streak calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      isToday: i === 6,
      hasActivity: i < currentStreak || (i === 6 && hasCheckedInToday)
    };
  });

  return (
    <div className="space-y-6">
      {/* Main Streak Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Current Streak</p>
              <div className="flex items-center gap-2">
                <Flame className="w-10 h-10" />
                <span className="text-5xl font-bold">{currentStreak}</span>
                <span className="text-2xl">days</span>
              </div>
            </div>
            <Button 
              size="lg" 
              className={`${hasCheckedInToday 
                ? "bg-green-600 hover:bg-green-600 cursor-default" 
                : "bg-white text-orange-600 hover:bg-orange-50"}`}
              onClick={handleCheckIn}
              disabled={hasCheckedInToday}
            >
              {hasCheckedInToday ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Checked In!
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Daily Check-In
                </>
              )}
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* Weekly Calendar */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {last7Days.map((day, index) => (
              <div 
                key={index} 
                className={`text-center p-2 rounded-lg ${
                  day.isToday 
                    ? "bg-orange-100 dark:bg-orange-900/30 ring-2 ring-orange-500" 
                    : "bg-muted/50"
                }`}
              >
                <p className="text-xs text-muted-foreground">{day.dayName}</p>
                <p className="font-semibold">{day.dayNum}</p>
                <div className="mt-1">
                  {day.hasActivity ? (
                    <CheckCircle2 className="w-5 h-5 mx-auto text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 mx-auto text-muted-foreground/30" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Trophy className="w-6 h-6 mx-auto text-amber-500 mb-1" />
              <p className="text-xl font-bold">{longestStreak}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <p className="text-xl font-bold">{totalCheckIns}</p>
              <p className="text-xs text-muted-foreground">Total Days</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Star className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
              <p className="text-xl font-bold">{totalCheckIns * 5}</p>
              <p className="text-xs text-muted-foreground">Tokens Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Milestone Progress */}
      {nextMilestone && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              Next Milestone: {nextMilestone.badge}
            </CardTitle>
            <CardDescription>
              {nextMilestone.days - currentStreak} days to go • +{nextMilestone.reward} tokens reward
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressToNext} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {currentStreak} / {nextMilestone.days} days
            </p>
          </CardContent>
        </Card>
      )}

      {/* Milestones Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Streak Milestones
          </CardTitle>
          <CardDescription>
            Unlock badges and earn bonus tokens by maintaining your streak
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievedMilestones.map((milestone, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg text-center transition-all ${
                  milestone.achieved 
                    ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800" 
                    : "bg-muted/30 opacity-60"
                }`}
              >
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  milestone.achieved 
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" 
                    : "bg-muted"
                }`}>
                  {milestone.achieved ? (
                    <Trophy className="w-6 h-6" />
                  ) : (
                    <span className="font-bold text-muted-foreground">{milestone.days}</span>
                  )}
                </div>
                <p className="font-semibold text-sm">{milestone.badge}</p>
                <p className="text-xs text-muted-foreground">{milestone.days} days</p>
                <Badge 
                  variant={milestone.achieved ? "default" : "secondary"} 
                  className="mt-2"
                >
                  <Gift className="w-3 h-3 mr-1" />
                  {milestone.reward} tokens
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-200">Keep Your Streak Alive!</h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Check in daily to maintain your streak. Missing a day resets your current streak, 
                but your longest streak record is preserved forever!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
