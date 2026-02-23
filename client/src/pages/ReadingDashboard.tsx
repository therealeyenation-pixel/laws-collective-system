import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import {
  BookOpen,
  Trophy,
  Target,
  Flame,
  Star,
  Brain,
  Map,
  Wind,
  Droplets,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  BookMarked,
  GraduationCap,
  Loader2,
} from "lucide-react";

const PILLAR_CONFIG = {
  land: { icon: Map, color: "text-green-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
  air: { icon: Wind, color: "text-sky-500", bgColor: "bg-sky-500/10", borderColor: "border-sky-500/30" },
  water: { icon: Droplets, color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  self: { icon: Sparkles, color: "text-purple-500", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
};

export default function ReadingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch reading progress data
  const { data: readingProgress, isLoading: progressLoading } = trpc.virtualLibrary.getReadingProgress.useQuery();
  const { data: quizAttempts, isLoading: quizzesLoading } = trpc.virtualLibrary.getQuizAttempts.useQuery({ limit: 50 });
  const { data: vocabulary, isLoading: vocabLoading } = trpc.virtualLibrary.getVocabulary.useQuery({ limit: 100 });
  const { data: books } = trpc.virtualLibrary.getBooks.useQuery({});

  const isLoading = progressLoading || quizzesLoading || vocabLoading;

  // Calculate statistics
  const stats = useMemo(() => {
    if (!readingProgress || !quizAttempts || !vocabulary || !books) {
      return {
        totalBooksRead: 0,
        booksInProgress: 0,
        totalQuizzesTaken: 0,
        averageQuizScore: 0,
        vocabularyMastered: 0,
        vocabularyLearning: 0,
        totalReadingTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        pillarProgress: { land: 0, air: 0, water: 0, self: 0 },
      };
    }

    const completedBooks = readingProgress.filter((p: any) => p.completed);
    const inProgressBooks = readingProgress.filter((p: any) => !p.completed && p.progress > 0);
    
    const passedQuizzes = quizAttempts.filter((q: any) => q.passed);
    const avgScore = quizAttempts.length > 0 
      ? quizAttempts.reduce((sum: number, q: any) => sum + q.score, 0) / quizAttempts.length 
      : 0;

    const masteredVocab = vocabulary.filter((v: any) => v.masteryLevel >= 80);
    const learningVocab = vocabulary.filter((v: any) => v.masteryLevel > 0 && v.masteryLevel < 80);

    // Calculate pillar progress
    const pillarBooks: Record<string, { total: number; completed: number }> = {
      land: { total: 0, completed: 0 },
      air: { total: 0, completed: 0 },
      water: { total: 0, completed: 0 },
      self: { total: 0, completed: 0 },
    };

    books.books?.forEach((book: any) => {
      const pillar = book.lawsPillar?.toLowerCase() || "self";
      if (pillarBooks[pillar]) {
        pillarBooks[pillar].total++;
        const progress = readingProgress.find((p: any) => p.bookId === book.id);
        if (progress?.completed) {
          pillarBooks[pillar].completed++;
        }
      }
    });

    const pillarProgress = {
      land: pillarBooks.land.total > 0 ? (pillarBooks.land.completed / pillarBooks.land.total) * 100 : 0,
      air: pillarBooks.air.total > 0 ? (pillarBooks.air.completed / pillarBooks.air.total) * 100 : 0,
      water: pillarBooks.water.total > 0 ? (pillarBooks.water.completed / pillarBooks.water.total) * 100 : 0,
      self: pillarBooks.self.total > 0 ? (pillarBooks.self.completed / pillarBooks.self.total) * 100 : 0,
    };

    // Calculate reading streak (simplified)
    const today = new Date();
    let streak = 0;
    const sortedProgress = [...readingProgress].sort((a: any, b: any) => 
      new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
    );
    
    if (sortedProgress.length > 0) {
      const lastRead = new Date(sortedProgress[0].lastReadAt);
      const daysSinceLastRead = Math.floor((today.getTime() - lastRead.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastRead <= 1) {
        streak = 1; // At least 1 day streak if read today or yesterday
      }
    }

    return {
      totalBooksRead: completedBooks.length,
      booksInProgress: inProgressBooks.length,
      totalQuizzesTaken: quizAttempts.length,
      averageQuizScore: Math.round(avgScore),
      vocabularyMastered: masteredVocab.length,
      vocabularyLearning: learningVocab.length,
      totalReadingTime: readingProgress.reduce((sum: number, p: any) => sum + (p.totalReadingTime || 0), 0),
      currentStreak: streak,
      longestStreak: streak, // Would need historical data for accurate calculation
      pillarProgress,
    };
  }, [readingProgress, quizAttempts, vocabulary, books]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities: Array<{ type: string; title: string; date: Date; details: string }> = [];

    readingProgress?.slice(0, 5).forEach((p: any) => {
      activities.push({
        type: "reading",
        title: p.book?.title || "Unknown Book",
        date: new Date(p.lastReadAt),
        details: p.completed ? "Completed" : `${Math.round(p.progress)}% complete`,
      });
    });

    quizAttempts?.slice(0, 5).forEach((q: any) => {
      activities.push({
        type: "quiz",
        title: `Quiz: ${q.book?.title || "Unknown"}`,
        date: new Date(q.completedAt),
        details: `Score: ${q.score}%`,
      });
    });

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
  }, [readingProgress, quizAttempts]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              Reading Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your learning journey across the L.A.W.S. pillars
            </p>
          </div>
          <Link href="/library">
            <Button>
              <BookMarked className="w-4 h-4 mr-2" />
              Go to Library
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalBooksRead}</p>
                  <p className="text-xs text-muted-foreground">Books Read</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.booksInProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageQuizScore}%</p>
                  <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.vocabularyMastered}</p>
                  <p className="text-xs text-muted-foreground">Words Mastered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalQuizzesTaken}</p>
                  <p className="text-xs text-muted-foreground">Quizzes Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pillars">L.A.W.S. Progress</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* L.A.W.S. Pillar Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    L.A.W.S. Pillar Progress
                  </CardTitle>
                  <CardDescription>Your reading progress across each pillar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(PILLAR_CONFIG).map(([pillar, config]) => {
                    const PillarIcon = config.icon;
                    const progress = stats.pillarProgress[pillar as keyof typeof stats.pillarProgress];
                    return (
                      <div key={pillar} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PillarIcon className={`w-4 h-4 ${config.color}`} />
                            <span className="font-medium capitalize">{pillar}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest reading and quiz activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          {activity.type === "reading" ? (
                            <BookOpen className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Trophy className="w-4 h-4 text-amber-500" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.details}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {activity.date.toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent activity. Start reading to track your progress!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quiz Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quiz Performance
                </CardTitle>
                <CardDescription>Your comprehension quiz results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-muted-foreground">Passed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {quizAttempts?.filter((q: any) => q.passed).length || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.averageQuizScore}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalQuizzesTaken}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pillars" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(PILLAR_CONFIG).map(([pillar, config]) => {
                const PillarIcon = config.icon;
                const progress = stats.pillarProgress[pillar as keyof typeof stats.pillarProgress];
                const pillarBooks = books?.books?.filter(
                  (b: any) => b.lawsPillar?.toLowerCase() === pillar
                ) || [];
                
                return (
                  <Card key={pillar} className={`border-2 ${config.borderColor}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                          <PillarIcon className={`w-6 h-6 ${config.color}`} />
                        </div>
                        <div>
                          <CardTitle className="capitalize">{pillar}</CardTitle>
                          <CardDescription>
                            {pillar === "land" && "Property, roots, stability, generational assets"}
                            {pillar === "air" && "Education, knowledge, communication"}
                            {pillar === "water" && "Healing, balance, flow, resilience"}
                            {pillar === "self" && "Purpose, skills, identity, personal sovereignty"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{pillarBooks.length} books available</span>
                        <span>
                          {readingProgress?.filter((p: any) => 
                            pillarBooks.some((b: any) => b.id === p.bookId) && p.completed
                          ).length || 0} completed
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="vocabulary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Vocabulary Progress
                </CardTitle>
                <CardDescription>Words you've learned and mastered</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-muted-foreground">Mastered (80%+)</p>
                    <p className="text-2xl font-bold text-green-600">{stats.vocabularyMastered}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-muted-foreground">Learning</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.vocabularyLearning}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-muted-foreground">Total Words</p>
                    <p className="text-2xl font-bold text-blue-600">{vocabulary?.length || 0}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Recent Words</h4>
                  <div className="flex flex-wrap gap-2">
                    {vocabulary?.slice(0, 20).map((word: any) => (
                      <Badge
                        key={word.id}
                        variant={word.masteryLevel >= 80 ? "default" : "outline"}
                        className="text-sm"
                      >
                        {word.word}
                        <span className="ml-1 text-xs opacity-70">{word.masteryLevel}%</span>
                      </Badge>
                    ))}
                    {(!vocabulary || vocabulary.length === 0) && (
                      <p className="text-sm text-muted-foreground">
                        No vocabulary words yet. Start reading to build your vocabulary!
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
                <CardDescription>Milestones and badges earned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* First Book */}
                  <div className={`p-4 rounded-lg border-2 text-center ${
                    stats.totalBooksRead >= 1 ? "border-amber-500 bg-amber-500/10" : "border-muted opacity-50"
                  }`}>
                    <BookOpen className={`w-8 h-8 mx-auto mb-2 ${
                      stats.totalBooksRead >= 1 ? "text-amber-500" : "text-muted-foreground"
                    }`} />
                    <p className="font-medium">First Book</p>
                    <p className="text-xs text-muted-foreground">Complete your first book</p>
                  </div>

                  {/* Quiz Master */}
                  <div className={`p-4 rounded-lg border-2 text-center ${
                    stats.totalQuizzesTaken >= 5 ? "border-green-500 bg-green-500/10" : "border-muted opacity-50"
                  }`}>
                    <Trophy className={`w-8 h-8 mx-auto mb-2 ${
                      stats.totalQuizzesTaken >= 5 ? "text-green-500" : "text-muted-foreground"
                    }`} />
                    <p className="font-medium">Quiz Master</p>
                    <p className="text-xs text-muted-foreground">Complete 5 quizzes</p>
                  </div>

                  {/* Vocabulary Builder */}
                  <div className={`p-4 rounded-lg border-2 text-center ${
                    stats.vocabularyMastered >= 10 ? "border-purple-500 bg-purple-500/10" : "border-muted opacity-50"
                  }`}>
                    <Brain className={`w-8 h-8 mx-auto mb-2 ${
                      stats.vocabularyMastered >= 10 ? "text-purple-500" : "text-muted-foreground"
                    }`} />
                    <p className="font-medium">Word Smith</p>
                    <p className="text-xs text-muted-foreground">Master 10 words</p>
                  </div>

                  {/* Streak */}
                  <div className={`p-4 rounded-lg border-2 text-center ${
                    stats.currentStreak >= 7 ? "border-orange-500 bg-orange-500/10" : "border-muted opacity-50"
                  }`}>
                    <Flame className={`w-8 h-8 mx-auto mb-2 ${
                      stats.currentStreak >= 7 ? "text-orange-500" : "text-muted-foreground"
                    }`} />
                    <p className="font-medium">On Fire</p>
                    <p className="text-xs text-muted-foreground">7 day reading streak</p>
                  </div>

                  {/* All Pillars */}
                  <div className={`p-4 rounded-lg border-2 text-center ${
                    Object.values(stats.pillarProgress).every(p => p > 0) ? "border-cyan-500 bg-cyan-500/10" : "border-muted opacity-50"
                  }`}>
                    <Star className={`w-8 h-8 mx-auto mb-2 ${
                      Object.values(stats.pillarProgress).every(p => p > 0) ? "text-cyan-500" : "text-muted-foreground"
                    }`} />
                    <p className="font-medium">Explorer</p>
                    <p className="text-xs text-muted-foreground">Read from all pillars</p>
                  </div>

                  {/* Perfect Score */}
                  <div className={`p-4 rounded-lg border-2 text-center ${
                    quizAttempts?.some((q: any) => q.score === 100) ? "border-yellow-500 bg-yellow-500/10" : "border-muted opacity-50"
                  }`}>
                    <Award className={`w-8 h-8 mx-auto mb-2 ${
                      quizAttempts?.some((q: any) => q.score === 100) ? "text-yellow-500" : "text-muted-foreground"
                    }`} />
                    <p className="font-medium">Perfect Score</p>
                    <p className="text-xs text-muted-foreground">100% on any quiz</p>
                  </div>

                  {/* Bookworm */}
                  <div className={`p-4 rounded-lg border-2 text-center ${
                    stats.totalBooksRead >= 10 ? "border-blue-500 bg-blue-500/10" : "border-muted opacity-50"
                  }`}>
                    <BookMarked className={`w-8 h-8 mx-auto mb-2 ${
                      stats.totalBooksRead >= 10 ? "text-blue-500" : "text-muted-foreground"
                    }`} />
                    <p className="font-medium">Bookworm</p>
                    <p className="text-xs text-muted-foreground">Complete 10 books</p>
                  </div>

                  {/* Scholar */}
                  <div className={`p-4 rounded-lg border-2 text-center ${
                    stats.averageQuizScore >= 90 && stats.totalQuizzesTaken >= 10 ? "border-indigo-500 bg-indigo-500/10" : "border-muted opacity-50"
                  }`}>
                    <GraduationCap className={`w-8 h-8 mx-auto mb-2 ${
                      stats.averageQuizScore >= 90 && stats.totalQuizzesTaken >= 10 ? "text-indigo-500" : "text-muted-foreground"
                    }`} />
                    <p className="font-medium">Scholar</p>
                    <p className="text-xs text-muted-foreground">90%+ avg on 10 quizzes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
