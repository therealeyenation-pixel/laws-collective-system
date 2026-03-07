import { useState, useMemo } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import {
  Trophy,
  Target,
  Users,
  Building,
  BookOpen,
  Star,
  Crown,
  Sparkles,
  TrendingUp,
  Clock,
  Calendar,
  ChevronRight,
  Play,
  CheckCircle2,
  Circle,
  Loader2,
  Medal,
  Flame,
  Zap,
  Home,
  DollarSign,
  GraduationCap,
  Heart,
  Shield,
  Leaf,
  Wind,
  Droplets,
} from "lucide-react";

// Quest Chapter Data
const QUEST_CHAPTERS = [
  {
    id: 1,
    title: "The Awakening",
    description: "Experience the dual-path journey - Birth-Ward vs Birth-Trust",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: 2,
    title: "Foundation Building",
    description: "Learn trust creation and entity formation",
    icon: Building,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: 3,
    title: "The Protection Layer",
    description: "Master asset protection and LLC structure",
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: 4,
    title: "Income Streams",
    description: "Build passive income and business development",
    icon: DollarSign,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: 5,
    title: "Generational Transfer",
    description: "Plan for 100-year legacy and succession",
    icon: Crown,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

// L.A.W.S. Pillars
const LAWS_PILLARS = [
  { id: "land", name: "LAND", icon: Leaf, color: "text-green-500", description: "Reconnection & Stability" },
  { id: "air", name: "AIR", icon: Wind, color: "text-blue-500", description: "Education & Knowledge" },
  { id: "water", name: "WATER", icon: Droplets, color: "text-cyan-500", description: "Healing & Balance" },
  { id: "self", name: "SELF", icon: Heart, color: "text-red-500", description: "Purpose & Skills" },
];

// Achievement Categories
const ACHIEVEMENT_CATEGORIES = [
  { id: "quest", name: "L.A.W.S. Quest", icon: BookOpen, color: "text-purple-500" },
  { id: "community", name: "Community Builder", icon: Users, color: "text-blue-500" },
  { id: "multiplayer", name: "Multiplayer", icon: Trophy, color: "text-amber-500" },
  { id: "special", name: "Special", icon: Star, color: "text-pink-500" },
];

export default function ProgressDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - would come from trpc queries in production
  const questProgress = {
    currentChapter: 2,
    chaptersCompleted: [1],
    totalTokensEarned: 450,
    timeSpent: 3.5, // hours
  };

  const communityStats = {
    communitiesJoined: 2,
    buildingsConstructed: 8,
    populationManaged: 156,
    resourcesCollected: 12500,
    decisionsVoted: 24,
  };

  const achievementStats = {
    total: 75,
    unlocked: 18,
    points: 1250,
    rank: 42,
    percentile: 85,
    byCategory: {
      quest: { total: 25, unlocked: 8 },
      community: { total: 20, unlocked: 5 },
      multiplayer: { total: 15, unlocked: 3 },
      special: { total: 15, unlocked: 2 },
    },
  };

  const recentActivity = [
    { type: "achievement", title: "First Steps", time: "2 hours ago", icon: Medal },
    { type: "chapter", title: "Completed Chapter 1", time: "Yesterday", icon: CheckCircle2 },
    { type: "community", title: "Joined The The L.A.W.S. Collective", time: "2 days ago", icon: Users },
    { type: "vote", title: "Voted on Academy Expansion", time: "3 days ago", icon: Target },
    { type: "building", title: "Built Community Center", time: "1 week ago", icon: Building },
  ];

  const overallProgress = useMemo(() => {
    const questPercent = (questProgress.chaptersCompleted.length / QUEST_CHAPTERS.length) * 100;
    const achievementPercent = (achievementStats.unlocked / achievementStats.total) * 100;
    return Math.round((questPercent + achievementPercent) / 2);
  }, [questProgress, achievementStats]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Progress Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your journey through L.A.W.S. Quest and Community Building
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/game-center">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Continue Playing
              </Button>
            </Link>
            <Link href="/achievements">
              <Button variant="outline" className="gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Achievements
              </Button>
            </Link>
          </div>
        </div>

        {/* Overall Progress Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Progress Ring */}
              <div className="relative w-32 h-32 mx-auto md:mx-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted/20"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${overallProgress * 3.52} 352`}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold">{overallProgress}%</span>
                  <span className="text-xs text-muted-foreground">Overall</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">{questProgress.chaptersCompleted.length}/5</p>
                  <p className="text-sm text-muted-foreground">Chapters Complete</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">{achievementStats.unlocked}</p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">{achievementStats.points}</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-foreground">#{achievementStats.rank}</p>
                  <p className="text-sm text-muted-foreground">Global Rank</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quest">Quest Progress</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quest Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    L.A.W.S. Quest
                  </CardTitle>
                  <CardDescription>Your journey to financial sovereignty</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {QUEST_CHAPTERS.slice(0, 3).map((chapter) => {
                      const isCompleted = questProgress.chaptersCompleted.includes(chapter.id);
                      const isCurrent = questProgress.currentChapter === chapter.id;
                      const ChapterIcon = chapter.icon;

                      return (
                        <div
                          key={chapter.id}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isCompleted ? "bg-green-500/10" : isCurrent ? chapter.bgColor : "bg-muted/30"
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isCompleted ? "bg-green-500/20" : chapter.bgColor}`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <ChapterIcon className={`w-5 h-5 ${chapter.color}`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{chapter.title}</p>
                            <p className="text-xs text-muted-foreground">{chapter.description}</p>
                          </div>
                          {isCurrent && (
                            <Badge variant="outline" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                    <Link href="/games/laws-quest-unified">
                      <Button variant="outline" className="w-full gap-2">
                        View All Chapters
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => {
                      const ActivityIcon = activity.icon;
                      return (
                        <div key={index} className="flex items-center gap-3 p-2">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <ActivityIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* L.A.W.S. Pillars Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-500" />
                  L.A.W.S. Pillars Mastery
                </CardTitle>
                <CardDescription>Your understanding of each pillar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {LAWS_PILLARS.map((pillar) => {
                    const PillarIcon = pillar.icon;
                    const progress = Math.floor(Math.random() * 60) + 20; // Mock progress

                    return (
                      <div key={pillar.id} className="text-center p-4 rounded-lg bg-muted/30">
                        <div className={`inline-flex p-3 rounded-full bg-background mb-2`}>
                          <PillarIcon className={`w-6 h-6 ${pillar.color}`} />
                        </div>
                        <h4 className="font-bold">{pillar.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{pillar.description}</p>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{progress}% mastery</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quest Progress Tab */}
          <TabsContent value="quest" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 gap-4">
              {QUEST_CHAPTERS.map((chapter) => {
                const isCompleted = questProgress.chaptersCompleted.includes(chapter.id);
                const isCurrent = questProgress.currentChapter === chapter.id;
                const isLocked = chapter.id > questProgress.currentChapter;
                const ChapterIcon = chapter.icon;

                return (
                  <Card
                    key={chapter.id}
                    className={`${isCompleted ? "border-green-500/50" : isCurrent ? "border-primary/50" : ""}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-4 rounded-xl ${
                            isCompleted ? "bg-green-500/20" : isLocked ? "bg-muted/50" : chapter.bgColor
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          ) : isLocked ? (
                            <Circle className="w-8 h-8 text-muted-foreground" />
                          ) : (
                            <ChapterIcon className={`w-8 h-8 ${chapter.color}`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">Chapter {chapter.id}: {chapter.title}</h3>
                            {isCompleted && <Badge className="bg-green-500">Completed</Badge>}
                            {isCurrent && <Badge variant="outline">In Progress</Badge>}
                            {isLocked && <Badge variant="secondary">Locked</Badge>}
                          </div>
                          <p className="text-muted-foreground">{chapter.description}</p>
                          {isCurrent && (
                            <div className="mt-3">
                              <Progress value={35} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">35% complete</p>
                            </div>
                          )}
                        </div>
                        {!isLocked && (
                          <Link href="/games/laws-quest-unified">
                            <Button variant={isCurrent ? "default" : "outline"}>
                              {isCompleted ? "Replay" : isCurrent ? "Continue" : "Start"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-3xl font-bold">{communityStats.communitiesJoined}</p>
                  <p className="text-sm text-muted-foreground">Communities</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Building className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                  <p className="text-3xl font-bold">{communityStats.buildingsConstructed}</p>
                  <p className="text-sm text-muted-foreground">Buildings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Home className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <p className="text-3xl font-bold">{communityStats.populationManaged}</p>
                  <p className="text-sm text-muted-foreground">Population</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                  <p className="text-3xl font-bold">{communityStats.decisionsVoted}</p>
                  <p className="text-sm text-muted-foreground">Votes Cast</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Community Builder Stats</CardTitle>
                <CardDescription>Your impact in community development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Resources Collected</span>
                      <span className="text-sm font-medium">{communityStats.resourcesCollected.toLocaleString()}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Community Influence</span>
                      <span className="text-sm font-medium">Level 3</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
                <Link href="/games/community-builder">
                  <Button className="w-full mt-4 gap-2">
                    <Play className="w-4 h-4" />
                    Continue Building
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ACHIEVEMENT_CATEGORIES.map((category) => {
                const stats = achievementStats.byCategory[category.id as keyof typeof achievementStats.byCategory];
                const CategoryIcon = category.icon;
                const percent = Math.round((stats.unlocked / stats.total) * 100);

                return (
                  <Card key={category.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <CategoryIcon className={`w-6 h-6 ${category.color}`} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{stats.unlocked}/{stats.total}</span>
                          <span>{percent}%</span>
                        </div>
                        <Progress value={percent} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Your Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg">
                  <div>
                    <p className="text-4xl font-bold">#{achievementStats.rank}</p>
                    <p className="text-muted-foreground">Global Rank</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{achievementStats.percentile}%</p>
                    <p className="text-muted-foreground">Top Percentile</p>
                  </div>
                </div>
                <Link href="/achievements">
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    View All Achievements
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
