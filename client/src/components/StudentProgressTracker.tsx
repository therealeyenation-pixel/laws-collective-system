/**
 * Student Progress Tracker Component
 * Phase 19.6: Visualization for student progress tracking
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Languages,
  Award,
  Coins,
  TrendingUp,
  Calendar,
  ChevronRight,
  Star,
  Clock,
  Target,
} from "lucide-react";

interface CourseProgress {
  courseId: number;
  courseName: string;
  houseName: string;
  level: string;
  progressPercentage: number;
  status: string;
  lessonsCompleted: number;
  totalLessons: number;
  lastAccessed: Date | null;
}

interface LanguageProgress {
  languageId: number;
  languageName: string;
  nativeName: string;
  category: string;
  lessonsCompleted: number;
  totalLessons: number;
  progressPercentage: number;
  masteryLevel: string;
}

interface ScrollInfo {
  id: number;
  type: string;
  title: string;
  issuedAt: Date;
  verificationUrl: string;
}

interface TokenTransaction {
  id: number;
  amount: number;
  type: string;
  source: string;
  description: string;
  createdAt: Date;
}

interface WeeklyActivity {
  week: string;
  lessonsCompleted: number;
  tokensEarned: number;
  timeSpentMinutes: number;
}

interface StudentProgressTrackerProps {
  studentName: string;
  courses: CourseProgress[];
  languages: LanguageProgress[];
  scrolls: ScrollInfo[];
  tokenHistory: TokenTransaction[];
  weeklyActivity: WeeklyActivity[];
  onViewScroll?: (scrollId: number) => void;
}

export function StudentProgressTracker({
  studentName,
  courses,
  languages,
  scrolls,
  tokenHistory,
  weeklyActivity,
  onViewScroll,
}: StudentProgressTrackerProps) {
  const [activeTab, setActiveTab] = useState("courses");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "not_started":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case "Master":
        return "text-purple-600 bg-purple-100";
      case "Advanced":
        return "text-blue-600 bg-blue-100";
      case "Intermediate":
        return "text-green-600 bg-green-100";
      case "Beginner":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "indigenous":
        return "🌿";
      case "ancestral_flame":
        return "🔥";
      case "global_trade":
        return "🌍";
      default:
        return "📚";
    }
  };

  const getScrollTypeIcon = (type: string) => {
    switch (type) {
      case "course_completion":
        return "📜";
      case "module_mastery":
        return "🎓";
      case "house_graduation":
        return "🏛️";
      case "language_mastery":
        return "🗣️";
      case "ceremonial_achievement":
        return "✨";
      case "sovereign_scholar":
        return "👑";
      default:
        return "📜";
    }
  };

  const totalTokens = tokenHistory.reduce((sum, t) => 
    t.type === "earned" ? sum + t.amount : sum - t.amount, 0
  );

  const totalLessonsCompleted = courses.reduce((sum, c) => sum + c.lessonsCompleted, 0);
  const totalScrolls = scrolls.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLessonsCompleted}</p>
                <p className="text-xs text-muted-foreground">Lessons Done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Languages className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{languages.length}</p>
                <p className="text-xs text-muted-foreground">Languages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalScrolls}</p>
                <p className="text-xs text-muted-foreground">Scrolls Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Weekly Activity
          </CardTitle>
          <CardDescription>Learning progress over the last 8 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyActivity.map((week, idx) => {
              const maxLessons = Math.max(...weeklyActivity.map(w => w.lessonsCompleted), 1);
              const height = (week.lessonsCompleted / maxLessons) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${week.lessonsCompleted} lessons, ${week.tokensEarned} tokens`}
                  />
                  <span className="text-xs text-muted-foreground">{week.week.replace("Week ", "W")}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Progress Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="scrolls">Scrolls</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          {courses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No courses started yet
              </CardContent>
            </Card>
          ) : (
            courses.map((course) => (
              <Card key={course.courseId}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{course.courseName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {course.houseName} • {course.level}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(course.status)} text-white border-0`}
                    >
                      {course.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{course.lessonsCompleted} / {course.totalLessons} lessons</span>
                      <span>{course.progressPercentage}%</span>
                    </div>
                    <Progress value={course.progressPercentage} className="h-2" />
                  </div>
                  {course.lastAccessed && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Languages Tab */}
        <TabsContent value="languages" className="space-y-4">
          {languages.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No languages started yet
              </CardContent>
            </Card>
          ) : (
            languages.map((lang) => (
              <Card key={lang.languageId}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(lang.category)}</span>
                      <div>
                        <h4 className="font-semibold">{lang.languageName}</h4>
                        <p className="text-sm text-muted-foreground">{lang.nativeName}</p>
                      </div>
                    </div>
                    <Badge className={getMasteryColor(lang.masteryLevel)}>
                      {lang.masteryLevel}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{lang.lessonsCompleted} / {lang.totalLessons} lessons</span>
                      <span>{lang.progressPercentage}%</span>
                    </div>
                    <Progress value={lang.progressPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Scrolls Tab */}
        <TabsContent value="scrolls" className="space-y-4">
          {scrolls.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No scrolls earned yet
              </CardContent>
            </Card>
          ) : (
            scrolls.map((scroll) => (
              <Card
                key={scroll.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onViewScroll?.(scroll.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getScrollTypeIcon(scroll.type)}</span>
                      <div>
                        <h4 className="font-semibold">{scroll.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(scroll.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tokens Tab */}
        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                Token Balance: {totalTokens.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          
          {tokenHistory.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No token transactions yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {tokenHistory.slice(0, 20).map((tx) => (
                <Card key={tx.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{tx.description || tx.source}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`font-bold ${
                          tx.type === "earned" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.type === "earned" ? "+" : "-"}{tx.amount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StudentProgressTracker;
