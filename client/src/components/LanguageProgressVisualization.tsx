/**
 * Language Progress Visualization Component
 * Phase 19.6: Visual representation of language learning progress
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Flame,
  Leaf,
  Star,
  Award,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Clock,
} from "lucide-react";

interface LanguageProgress {
  languageId: number;
  languageName: string;
  nativeName: string;
  category: "indigenous" | "ancestral_flame" | "global_trade";
  lessonsCompleted: number;
  totalLessons: number;
  progressPercentage: number;
  masteryLevel: string;
  lastPracticed?: Date;
  streakDays?: number;
}

interface LanguageProgressVisualizationProps {
  languages: LanguageProgress[];
  totalTokensFromLanguages?: number;
  onSelectLanguage?: (languageId: number) => void;
}

export function LanguageProgressVisualization({
  languages,
  totalTokensFromLanguages = 0,
  onSelectLanguage,
}: LanguageProgressVisualizationProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Group languages by category
  const indigenousLanguages = languages.filter(l => l.category === "indigenous");
  const ancestralLanguages = languages.filter(l => l.category === "ancestral_flame");
  const globalLanguages = languages.filter(l => l.category === "global_trade");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "indigenous":
        return <Leaf className="w-4 h-4 text-green-600" />;
      case "ancestral_flame":
        return <Flame className="w-4 h-4 text-orange-600" />;
      case "global_trade":
        return <Globe className="w-4 h-4 text-blue-600" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "indigenous":
        return "bg-green-100 text-green-800 border-green-200";
      case "ancestral_flame":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "global_trade":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "indigenous":
        return "Indigenous Tongues";
      case "ancestral_flame":
        return "Ancestral Flame Tongues";
      case "global_trade":
        return "Global Trade Tongues";
      default:
        return category;
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case "Master":
        return "bg-purple-500 text-white";
      case "Advanced":
        return "bg-blue-500 text-white";
      case "Intermediate":
        return "bg-green-500 text-white";
      case "Beginner":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getMasteryStars = (level: string) => {
    switch (level) {
      case "Master":
        return 5;
      case "Advanced":
        return 4;
      case "Intermediate":
        return 3;
      case "Beginner":
        return 2;
      default:
        return 1;
    }
  };

  const filteredLanguages = selectedCategory === "all"
    ? languages
    : languages.filter(l => l.category === selectedCategory);

  // Calculate overall stats
  const totalLessonsCompleted = languages.reduce((sum, l) => sum + l.lessonsCompleted, 0);
  const totalLessons = languages.reduce((sum, l) => sum + l.totalLessons, 0);
  const overallProgress = totalLessons > 0 ? Math.round((totalLessonsCompleted / totalLessons) * 100) : 0;
  const masteredLanguages = languages.filter(l => l.masteryLevel === "Master").length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
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
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{masteredLanguages}</p>
                <p className="text-xs text-muted-foreground">Mastered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallProgress}%</p>
                <p className="text-xs text-muted-foreground">Overall</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Language Categories</CardTitle>
          <CardDescription>Progress across the three tongues of the House of Many Tongues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Indigenous Tongues */}
            <div className={`p-4 rounded-lg border ${getCategoryColor("indigenous")}`}>
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-5 h-5" />
                <span className="font-semibold">Indigenous Tongues</span>
              </div>
              <p className="text-3xl font-bold">{indigenousLanguages.length}</p>
              <p className="text-sm opacity-80">languages learning</p>
              <div className="mt-2">
                <Progress
                  value={indigenousLanguages.length > 0
                    ? Math.round(indigenousLanguages.reduce((s, l) => s + l.progressPercentage, 0) / indigenousLanguages.length)
                    : 0
                  }
                  className="h-2"
                />
              </div>
            </div>

            {/* Ancestral Flame Tongues */}
            <div className={`p-4 rounded-lg border ${getCategoryColor("ancestral_flame")}`}>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5" />
                <span className="font-semibold">Ancestral Flame</span>
              </div>
              <p className="text-3xl font-bold">{ancestralLanguages.length}</p>
              <p className="text-sm opacity-80">languages learning</p>
              <div className="mt-2">
                <Progress
                  value={ancestralLanguages.length > 0
                    ? Math.round(ancestralLanguages.reduce((s, l) => s + l.progressPercentage, 0) / ancestralLanguages.length)
                    : 0
                  }
                  className="h-2"
                />
              </div>
            </div>

            {/* Global Trade Tongues */}
            <div className={`p-4 rounded-lg border ${getCategoryColor("global_trade")}`}>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5" />
                <span className="font-semibold">Global Trade</span>
              </div>
              <p className="text-3xl font-bold">{globalLanguages.length}</p>
              <p className="text-sm opacity-80">languages learning</p>
              <div className="mt-2">
                <Progress
                  value={globalLanguages.length > 0
                    ? Math.round(globalLanguages.reduce((s, l) => s + l.progressPercentage, 0) / globalLanguages.length)
                    : 0
                  }
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language List */}
      <Card>
        <CardHeader>
          <CardTitle>Language Progress</CardTitle>
          <CardDescription>Detailed progress for each language</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="indigenous">Indigenous</TabsTrigger>
              <TabsTrigger value="ancestral_flame">Ancestral</TabsTrigger>
              <TabsTrigger value="global_trade">Global</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              {filteredLanguages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No languages in this category yet
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLanguages.map((lang) => (
                    <Card
                      key={lang.languageId}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onSelectLanguage?.(lang.languageId)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(lang.category)}
                            <div>
                              <h4 className="font-semibold">{lang.languageName}</h4>
                              <p className="text-sm text-muted-foreground">{lang.nativeName}</p>
                            </div>
                          </div>
                          <Badge className={getMasteryColor(lang.masteryLevel)}>
                            {lang.masteryLevel}
                          </Badge>
                        </div>

                        {/* Mastery Stars */}
                        <div className="flex items-center gap-1 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < getMasteryStars(lang.masteryLevel)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{lang.lessonsCompleted} / {lang.totalLessons} lessons</span>
                            <span>{lang.progressPercentage}%</span>
                          </div>
                          <Progress value={lang.progressPercentage} className="h-2" />
                        </div>

                        {/* Last Practiced */}
                        {lang.lastPracticed && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last practiced: {new Date(lang.lastPracticed).toLocaleDateString()}
                          </p>
                        )}

                        {/* Streak */}
                        {lang.streakDays && lang.streakDays > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-orange-600">
                            <Flame className="w-4 h-4" />
                            <span className="text-sm font-medium">{lang.streakDays} day streak!</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Mastery Path */}
      <Card>
        <CardHeader>
          <CardTitle>Mastery Path</CardTitle>
          <CardDescription>Journey from Novice to Master</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {["Novice", "Beginner", "Intermediate", "Advanced", "Master"].map((level, idx) => {
              const languagesAtLevel = languages.filter(l => l.masteryLevel === level).length;
              const isActive = languagesAtLevel > 0;
              
              return (
                <div key={level} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive
                        ? getMasteryColor(level)
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {languagesAtLevel || "-"}
                  </div>
                  <span className="text-xs mt-2 text-center">{level}</span>
                  {idx < 4 && (
                    <div className="hidden md:block absolute">
                      <div className="w-16 h-0.5 bg-gray-300 transform translate-x-12" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LanguageProgressVisualization;
