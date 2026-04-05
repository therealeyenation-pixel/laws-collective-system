import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gamepad2,
  Clock,
  Trophy,
  Target,
  Calendar,
  Users,
  TrendingUp,
  Award,
  Play,
  CheckCircle2,
  AlertCircle,
  Flame,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";

export default function EmployeeGamingDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("progress");

  const { data: weeklyProgress, isLoading: progressLoading } = trpc.employeeGaming.getWeeklyProgress.useQuery();
  const { data: sessionHistory } = trpc.employeeGaming.getSessionHistory.useQuery({ limit: 10 });
  const { data: upcomingEvents } = trpc.employeeGaming.getUpcomingEvents.useQuery({ limit: 5 });
  const { data: leaderboard } = trpc.employeeGaming.getLeaderboard.useQuery({ 
    type: "individual", 
    period: "weekly",
    limit: 10 
  });

  const rsvpMutation = trpc.employeeGaming.rsvpEvent.useMutation({
    onSuccess: () => {
      toast.success("RSVP updated!");
    },
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "exceeded": return "text-green-500";
      case "completed": return "text-green-500";
      case "in_progress": return "text-yellow-500";
      case "not_started": return "text-red-500";
      case "excused": return "text-blue-500";
      default: return "text-muted-foreground";
    }
  };

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case "exceeded": return <Badge className="bg-green-500">Exceeded</Badge>;
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "not_started": return <Badge variant="destructive">Not Started</Badge>;
      case "excused": return <Badge variant="secondary">Excused</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gaming Dashboard</h1>
            <p className="text-muted-foreground">
              Track your weekly gaming requirement and team building progress
            </p>
          </div>
          <Link href="/game-center">
            <Button className="gap-2">
              <Play className="w-4 h-4" />
              Play Games
            </Button>
          </Link>
        </div>

        {/* Weekly Progress Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Weekly Requirement</CardTitle>
                  <CardDescription>
                    {weeklyProgress ? `Week ${weeklyProgress.weekNumber}, ${weeklyProgress.weekYear}` : "Loading..."}
                  </CardDescription>
                </div>
              </div>
              {weeklyProgress && getComplianceBadge(weeklyProgress.complianceStatus)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-8 bg-muted rounded w-1/2" />
              </div>
            ) : weeklyProgress ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {formatDuration(weeklyProgress.completedMinutes)} / {formatDuration(weeklyProgress.requiredMinutes)}
                    </span>
                  </div>
                  <Progress value={weeklyProgress.progressPercent} className="h-3" />
                  <p className="text-xs text-muted-foreground text-right">
                    {weeklyProgress.progressPercent}% complete
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-2xl font-bold">{formatDuration(weeklyProgress.completedMinutes)}</p>
                    <p className="text-xs text-muted-foreground">Time Played</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Gamepad2 className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-2xl font-bold">{weeklyProgress.uniqueGamesPlayed}</p>
                    <p className="text-xs text-muted-foreground">Games Played</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <p className="text-2xl font-bold">{weeklyProgress.streakWeeks}</p>
                    <p className="text-xs text-muted-foreground">Week Streak</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                    <p className="text-2xl font-bold">{weeklyProgress.bonusTokensAwarded}</p>
                    <p className="text-xs text-muted-foreground">Bonus Tokens</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Unable to load progress</p>
            )}
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="progress">Sessions</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Session History */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessionHistory && sessionHistory.length > 0 ? (
                  <div className="space-y-3">
                    {sessionHistory.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Gamepad2 className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">{session.gameName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.startTime).toLocaleDateString()} at{" "}
                              {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatDuration(session.durationMinutes)}</p>
                          <div className="flex items-center gap-1">
                            {session.won ? (
                              <Badge variant="outline" className="text-green-500 border-green-500">
                                Won
                              </Badge>
                            ) : session.endTime ? (
                              <Badge variant="outline">Played</Badge>
                            ) : (
                              <Badge variant="secondary">In Progress</Badge>
                            )}
                            {session.score > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {session.score} pts
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gamepad2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No sessions yet this week</p>
                    <Link href="/game-center">
                      <Button variant="outline" className="mt-3">
                        Start Playing
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Events */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Team Events
                </CardTitle>
                <CardDescription>
                  Join team building gaming sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents && upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{event.title}</h3>
                              {event.isRequired && (
                                <Badge variant="destructive">Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.scheduledStart).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(event.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {event.participantCount} joined
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {event.userRsvpStatus === "accepted" ? (
                              <Badge className="bg-green-500">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Attending
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => rsvpMutation.mutate({ eventId: event.id, status: "accepted" })}
                                disabled={rsvpMutation.isPending}
                              >
                                RSVP
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Weekly Leaderboard
                </CardTitle>
                <CardDescription>
                  Top performers this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index < 3 ? "bg-primary/10" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? "bg-yellow-500 text-yellow-950" :
                            index === 1 ? "bg-gray-300 text-gray-800" :
                            index === 2 ? "bg-amber-600 text-amber-950" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {entry.rank}
                          </div>
                          <div>
                            <p className="font-medium">Player #{entry.userId}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.totalGamesPlayed} games • {entry.totalWins} wins
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{entry.totalScore} pts</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(entry.totalMinutesPlayed)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Leaderboard will populate as games are played</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Gaming Achievements
                </CardTitle>
                <CardDescription>
                  Unlock achievements by playing games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: "First Game", desc: "Play your first game", icon: Gamepad2, unlocked: (sessionHistory?.length || 0) > 0 },
                    { name: "Weekly Warrior", desc: "Complete weekly requirement", icon: Target, unlocked: weeklyProgress?.complianceStatus === "completed" || weeklyProgress?.complianceStatus === "exceeded" },
                    { name: "Streak Master", desc: "3 week streak", icon: Flame, unlocked: (weeklyProgress?.streakWeeks || 0) >= 3 },
                    { name: "Game Explorer", desc: "Play 5 different games", icon: Star, unlocked: (weeklyProgress?.uniqueGamesPlayed || 0) >= 5 },
                    { name: "Team Player", desc: "Join a team event", icon: Users, unlocked: false },
                    { name: "Champion", desc: "Win 10 games", icon: Trophy, unlocked: false },
                  ].map((achievement) => (
                    <div
                      key={achievement.name}
                      className={`p-4 rounded-lg border text-center ${
                        achievement.unlocked ? "bg-primary/10 border-primary" : "bg-muted/30 opacity-60"
                      }`}
                    >
                      <achievement.icon className={`w-8 h-8 mx-auto mb-2 ${
                        achievement.unlocked ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <p className="font-medium text-sm">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                      {achievement.unlocked && (
                        <Badge className="mt-2 bg-green-500">Unlocked</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
