import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Globe,
  Flame,
  Languages,
  BookOpen,
  Award,
  Play,
  CheckCircle,
  Lock,
  Star,
  Scroll,
} from "lucide-react";

interface Language {
  id: number;
  name: string;
  nativeName: string;
  category: string;
  region: string;
  difficulty: string;
  description: string;
}

interface LanguageCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  languages: string[];
  count: number;
}

export default function HouseOfTongues() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const { data: categoriesData, isLoading: loadingCategories } = trpc.houseOfTongues.getLanguageCategories.useQuery();
  const { data: allLanguages, isLoading: loadingLanguages } = trpc.houseOfTongues.getAllLanguages.useQuery();

  const categoryIcons: Record<string, React.ReactNode> = {
    indigenous: <Globe className="w-8 h-8 text-emerald-600" />,
    ancestral_flame: <Flame className="w-8 h-8 text-orange-600" />,
    global_trade: <Languages className="w-8 h-8 text-blue-600" />,
  };

  const categoryColors: Record<string, string> = {
    indigenous: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
    ancestral_flame: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    global_trade: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  };

  const difficultyColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  const handleStartLesson = (languageId: number) => {
    toast.info("Lesson system coming soon - Language learning modules are being prepared");
  };

  if (loadingCategories || loadingLanguages) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Languages className="w-12 h-12 animate-pulse mx-auto text-primary" />
            <p className="text-muted-foreground">Loading House of Many Tongues...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const categories = categoriesData?.categories || [];
  const languages = allLanguages?.languages || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Scroll className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">House of Many Tongues</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master the languages of your ancestors, connect with indigenous wisdom, and expand your global reach.
            Each language mastered earns tokens and creates a Living Scroll of achievement.
          </p>
        </div>

        {/* Token Rewards Info */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-foreground">Token Rewards</h3>
                  <p className="text-sm text-muted-foreground">Earn LUV tokens as you progress</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-lg text-amber-700">15</p>
                  <p className="text-muted-foreground">Per Lesson</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-amber-700">100</p>
                  <p className="text-muted-foreground">Level Complete</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-amber-700">500</p>
                  <p className="text-muted-foreground">Living Scroll</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category: LanguageCategory) => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all ${categoryColors[category.id]} ${
                selectedCategory === category.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  {categoryIcons[category.id]}
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.count} languages</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-2">
                  {category.languages.slice(0, 4).map((lang: string) => (
                    <Badge key={lang} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                  {category.languages.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{category.languages.length - 4} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Language List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {selectedCategory
                ? `${categories.find((c: LanguageCategory) => c.id === selectedCategory)?.name || "Languages"}`
                : "All Languages"}
            </CardTitle>
            <CardDescription>
              Select a language to begin your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {languages
                .filter((lang: Language) => !selectedCategory || lang.category === selectedCategory)
                .map((language: Language) => (
                  <Card
                    key={language.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedLanguage?.id === language.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedLanguage(language)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{language.name}</h4>
                          <p className="text-sm text-muted-foreground">{language.nativeName}</p>
                        </div>
                        <Badge className={difficultyColors[language.difficulty] || "bg-gray-100"}>
                          {language.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{language.region}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3" />
                          <span>0% complete</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartLesson(language.id);
                          }}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Language Detail */}
        {selectedLanguage && (
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedLanguage.name}</CardTitle>
                  <CardDescription className="text-lg">{selectedLanguage.nativeName}</CardDescription>
                </div>
                <Badge className={difficultyColors[selectedLanguage.difficulty] || "bg-gray-100"} variant="outline">
                  {selectedLanguage.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{selectedLanguage.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Beginner</h4>
                    <p className="text-sm text-muted-foreground">10 lessons</p>
                    <Progress value={0} className="mt-2" />
                    <Button className="mt-3 w-full" size="sm" onClick={() => handleStartLesson(selectedLanguage.id)}>
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200 opacity-75">
                  <CardContent className="p-4 text-center">
                    <Lock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Intermediate</h4>
                    <p className="text-sm text-muted-foreground">15 lessons</p>
                    <Progress value={0} className="mt-2" />
                    <Button className="mt-3 w-full" size="sm" variant="outline" disabled>
                      Complete Beginner First
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200 opacity-75">
                  <CardContent className="p-4 text-center">
                    <Lock className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Advanced</h4>
                    <p className="text-sm text-muted-foreground">20 lessons</p>
                    <Progress value={0} className="mt-2" />
                    <Button className="mt-3 w-full" size="sm" variant="outline" disabled>
                      Complete Intermediate First
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Scroll className="w-6 h-6 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-foreground">Living Scroll Achievement</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete all three levels to earn your Living Scroll in {selectedLanguage.name} - 
                      a blockchain-verified certificate of mastery worth 500 LUV tokens.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
