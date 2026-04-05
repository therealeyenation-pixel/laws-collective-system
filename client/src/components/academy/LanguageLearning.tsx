import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Globe,
  BookOpen,
  Mic,
  Volume2,
  Star,
  Trophy,
  Flame,
  Sparkles,
  Play,
  CheckCircle,
  Lock,
  ChevronRight,
} from "lucide-react";

interface Language {
  id: string;
  name: string;
  nativeName: string;
  category: "indigenous" | "ancestral" | "global";
  flag: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  tokensEarned: number;
  isUnlocked: boolean;
}

interface Lesson {
  id: string;
  title: string;
  type: "vocabulary" | "grammar" | "conversation" | "culture";
  duration: string;
  xp: number;
  isCompleted: boolean;
  isLocked: boolean;
}

const languages: Language[] = [
  // Indigenous Tongues
  {
    id: "nahuatl",
    name: "Nahuatl",
    nativeName: "Nāhuatl",
    category: "indigenous",
    flag: "🇲🇽",
    progress: 35,
    lessonsCompleted: 7,
    totalLessons: 20,
    tokensEarned: 150,
    isUnlocked: true,
  },
  {
    id: "yoruba",
    name: "Yoruba",
    nativeName: "Yorùbá",
    category: "indigenous",
    flag: "🇳🇬",
    progress: 20,
    lessonsCompleted: 4,
    totalLessons: 20,
    tokensEarned: 80,
    isUnlocked: true,
  },
  {
    id: "lakota",
    name: "Lakota",
    nativeName: "Lakȟótiyapi",
    category: "indigenous",
    flag: "🏔️",
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 20,
    tokensEarned: 0,
    isUnlocked: false,
  },
  // Ancestral Flame Tongues
  {
    id: "hebrew",
    name: "Hebrew",
    nativeName: "עברית",
    category: "ancestral",
    flag: "🇮🇱",
    progress: 45,
    lessonsCompleted: 9,
    totalLessons: 20,
    tokensEarned: 200,
    isUnlocked: true,
  },
  {
    id: "aramaic",
    name: "Aramaic",
    nativeName: "ܐܪܡܝܐ",
    category: "ancestral",
    flag: "📜",
    progress: 10,
    lessonsCompleted: 2,
    totalLessons: 20,
    tokensEarned: 40,
    isUnlocked: true,
  },
  {
    id: "geez",
    name: "Ge'ez",
    nativeName: "ግዕዝ",
    category: "ancestral",
    flag: "🇪🇹",
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 20,
    tokensEarned: 0,
    isUnlocked: false,
  },
  // Global Trade Tongues
  {
    id: "spanish",
    name: "Spanish",
    nativeName: "Español",
    category: "global",
    flag: "🇪🇸",
    progress: 60,
    lessonsCompleted: 12,
    totalLessons: 20,
    tokensEarned: 280,
    isUnlocked: true,
  },
  {
    id: "french",
    name: "French",
    nativeName: "Français",
    category: "global",
    flag: "🇫🇷",
    progress: 25,
    lessonsCompleted: 5,
    totalLessons: 20,
    tokensEarned: 100,
    isUnlocked: true,
  },
  {
    id: "swahili",
    name: "Swahili",
    nativeName: "Kiswahili",
    category: "global",
    flag: "🇰🇪",
    progress: 15,
    lessonsCompleted: 3,
    totalLessons: 20,
    tokensEarned: 60,
    isUnlocked: true,
  },
  {
    id: "mandarin",
    name: "Mandarin",
    nativeName: "普通话",
    category: "global",
    flag: "🇨🇳",
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 20,
    tokensEarned: 0,
    isUnlocked: false,
  },
];

const sampleLessons: Lesson[] = [
  { id: "1", title: "Basic Greetings", type: "vocabulary", duration: "10 min", xp: 20, isCompleted: true, isLocked: false },
  { id: "2", title: "Numbers 1-10", type: "vocabulary", duration: "15 min", xp: 25, isCompleted: true, isLocked: false },
  { id: "3", title: "Family Terms", type: "vocabulary", duration: "12 min", xp: 20, isCompleted: true, isLocked: false },
  { id: "4", title: "Basic Sentence Structure", type: "grammar", duration: "20 min", xp: 30, isCompleted: false, isLocked: false },
  { id: "5", title: "Introducing Yourself", type: "conversation", duration: "15 min", xp: 35, isCompleted: false, isLocked: false },
  { id: "6", title: "Cultural Context", type: "culture", duration: "25 min", xp: 40, isCompleted: false, isLocked: true },
  { id: "7", title: "Daily Activities", type: "vocabulary", duration: "15 min", xp: 25, isCompleted: false, isLocked: true },
  { id: "8", title: "Questions & Answers", type: "grammar", duration: "20 min", xp: 30, isCompleted: false, isLocked: true },
];

export function LanguageLearning() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "indigenous" | "ancestral" | "global">("all");

  const filteredLanguages = activeCategory === "all" 
    ? languages 
    : languages.filter(l => l.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "indigenous": return <Flame className="w-4 h-4" />;
      case "ancestral": return <Sparkles className="w-4 h-4" />;
      case "global": return <Globe className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "indigenous": return "bg-orange-100 text-orange-800";
      case "ancestral": return "bg-purple-100 text-purple-800";
      case "global": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case "vocabulary": return <BookOpen className="w-4 h-4" />;
      case "grammar": return <Star className="w-4 h-4" />;
      case "conversation": return <Mic className="w-4 h-4" />;
      case "culture": return <Globe className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const handleStartLesson = (lesson: Lesson) => {
    if (lesson.isLocked) {
      toast.error("Complete previous lessons to unlock this one");
      return;
    }
    toast.success(`Starting lesson: ${lesson.title}`);
  };

  const totalTokens = languages.reduce((sum, l) => sum + l.tokensEarned, 0);
  const totalProgress = Math.round(languages.filter(l => l.isUnlocked).reduce((sum, l) => sum + l.progress, 0) / languages.filter(l => l.isUnlocked).length);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{languages.filter(l => l.isUnlocked).length}</p>
                <p className="text-sm text-muted-foreground">Languages Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTokens}</p>
                <p className="text-sm text-muted-foreground">Tokens Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{languages.reduce((sum, l) => sum + l.lessonsCompleted, 0)}</p>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProgress}%</p>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {selectedLanguage ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setSelectedLanguage(null)}>
                ← Back
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedLanguage.flag}</span>
                <div>
                  <h2 className="text-2xl font-bold">{selectedLanguage.name}</h2>
                  <p className="text-muted-foreground">{selectedLanguage.nativeName}</p>
                </div>
              </div>
            </div>
            <Badge className={getCategoryColor(selectedLanguage.category)}>
              {getCategoryIcon(selectedLanguage.category)}
              <span className="ml-1 capitalize">{selectedLanguage.category} Tongue</span>
            </Badge>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Course Progress</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLanguage.lessonsCompleted} of {selectedLanguage.totalLessons} lessons completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{selectedLanguage.progress}%</p>
                  <p className="text-sm text-muted-foreground">{selectedLanguage.tokensEarned} tokens earned</p>
                </div>
              </div>
              <Progress value={selectedLanguage.progress} className="h-3" />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Lessons</h3>
            {sampleLessons.map((lesson, index) => (
              <Card 
                key={lesson.id}
                className={`transition-all ${lesson.isLocked ? "opacity-60" : "hover:shadow-md cursor-pointer"}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        lesson.isCompleted 
                          ? "bg-green-100 text-green-600" 
                          : lesson.isLocked 
                            ? "bg-gray-100 text-gray-400"
                            : "bg-primary/10 text-primary"
                      }`}>
                        {lesson.isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : lesson.isLocked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <span className="font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {getLessonTypeIcon(lesson.type)}
                            <span className="capitalize">{lesson.type}</span>
                          </span>
                          <span>•</span>
                          <span>{lesson.duration}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {lesson.xp} XP
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant={lesson.isCompleted ? "outline" : "default"}
                      size="sm"
                      disabled={lesson.isLocked}
                      onClick={() => handleStartLesson(lesson)}
                      className="gap-2"
                    >
                      {lesson.isCompleted ? "Review" : lesson.isLocked ? "Locked" : "Start"}
                      {!lesson.isLocked && <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Category Filter */}
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as typeof activeCategory)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Languages</TabsTrigger>
              <TabsTrigger value="indigenous" className="gap-2">
                <Flame className="w-4 h-4" />
                Indigenous
              </TabsTrigger>
              <TabsTrigger value="ancestral" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Ancestral
              </TabsTrigger>
              <TabsTrigger value="global" className="gap-2">
                <Globe className="w-4 h-4" />
                Global
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Language Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLanguages.map((language) => (
              <Card 
                key={language.id}
                className={`transition-all ${
                  language.isUnlocked 
                    ? "hover:shadow-lg cursor-pointer" 
                    : "opacity-60"
                }`}
                onClick={() => language.isUnlocked && setSelectedLanguage(language)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{language.flag}</span>
                      <div>
                        <CardTitle className="text-lg">{language.name}</CardTitle>
                        <CardDescription>{language.nativeName}</CardDescription>
                      </div>
                    </div>
                    {!language.isUnlocked && (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge className={`mb-3 ${getCategoryColor(language.category)}`}>
                    {getCategoryIcon(language.category)}
                    <span className="ml-1 capitalize">{language.category} Tongue</span>
                  </Badge>
                  
                  {language.isUnlocked ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{language.progress}%</span>
                        </div>
                        <Progress value={language.progress} className="h-2" />
                      </div>
                      <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                        <span>{language.lessonsCompleted}/{language.totalLessons} lessons</span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {language.tokensEarned} tokens
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Complete other courses to unlock this language
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageLearning;
