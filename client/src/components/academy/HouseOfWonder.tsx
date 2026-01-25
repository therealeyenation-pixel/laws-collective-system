import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Sparkles,
  Star,
  Heart,
  Sun,
  Moon,
  Flower2,
  Bird,
  Fish,
  TreePine,
  Music,
  Palette,
  BookOpen,
  Calculator,
  Globe,
  Puzzle,
  Play,
  Trophy,
  Lock,
} from "lucide-react";

interface LearningPath {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  lessons: number;
  completedLessons: number;
  ageRange: string;
  isUnlocked: boolean;
}

interface Activity {
  id: string;
  title: string;
  type: "story" | "game" | "craft" | "song" | "exploration";
  duration: string;
  stars: number;
  maxStars: number;
  isCompleted: boolean;
}

const learningPaths: LearningPath[] = [
  {
    id: "wonder-nature",
    name: "Nature's Wonders",
    description: "Explore the magic of plants, animals, and the natural world",
    icon: <TreePine className="w-6 h-6" />,
    color: "bg-green-100 text-green-700",
    progress: 65,
    lessons: 20,
    completedLessons: 13,
    ageRange: "K-2",
    isUnlocked: true,
  },
  {
    id: "wonder-numbers",
    name: "Number Magic",
    description: "Discover the fun of counting, patterns, and shapes",
    icon: <Calculator className="w-6 h-6" />,
    color: "bg-blue-100 text-blue-700",
    progress: 45,
    lessons: 25,
    completedLessons: 11,
    ageRange: "K-2",
    isUnlocked: true,
  },
  {
    id: "wonder-stories",
    name: "Story Time",
    description: "Listen to tales from around the world and create your own",
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-purple-100 text-purple-700",
    progress: 80,
    lessons: 15,
    completedLessons: 12,
    ageRange: "K-5",
    isUnlocked: true,
  },
  {
    id: "wonder-art",
    name: "Creative Colors",
    description: "Express yourself through drawing, painting, and crafts",
    icon: <Palette className="w-6 h-6" />,
    color: "bg-pink-100 text-pink-700",
    progress: 30,
    lessons: 18,
    completedLessons: 5,
    ageRange: "K-5",
    isUnlocked: true,
  },
  {
    id: "wonder-music",
    name: "Musical Journey",
    description: "Sing songs, learn rhythms, and explore instruments",
    icon: <Music className="w-6 h-6" />,
    color: "bg-yellow-100 text-yellow-700",
    progress: 55,
    lessons: 20,
    completedLessons: 11,
    ageRange: "K-5",
    isUnlocked: true,
  },
  {
    id: "wonder-world",
    name: "World Explorers",
    description: "Travel the globe and learn about different cultures",
    icon: <Globe className="w-6 h-6" />,
    color: "bg-cyan-100 text-cyan-700",
    progress: 20,
    lessons: 22,
    completedLessons: 4,
    ageRange: "3-5",
    isUnlocked: true,
  },
  {
    id: "wonder-puzzles",
    name: "Brain Builders",
    description: "Solve puzzles and develop critical thinking skills",
    icon: <Puzzle className="w-6 h-6" />,
    color: "bg-orange-100 text-orange-700",
    progress: 0,
    lessons: 15,
    completedLessons: 0,
    ageRange: "3-5",
    isUnlocked: false,
  },
];

const sampleActivities: Activity[] = [
  { id: "1", title: "The Butterfly Garden", type: "story", duration: "5 min", stars: 3, maxStars: 3, isCompleted: true },
  { id: "2", title: "Count the Flowers", type: "game", duration: "10 min", stars: 2, maxStars: 3, isCompleted: true },
  { id: "3", title: "Make a Paper Bird", type: "craft", duration: "15 min", stars: 3, maxStars: 3, isCompleted: true },
  { id: "4", title: "Nature Walk Song", type: "song", duration: "3 min", stars: 0, maxStars: 3, isCompleted: false },
  { id: "5", title: "Find the Animals", type: "exploration", duration: "8 min", stars: 0, maxStars: 3, isCompleted: false },
];

export function HouseOfWonder() {
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "story": return <BookOpen className="w-4 h-4" />;
      case "game": return <Puzzle className="w-4 h-4" />;
      case "craft": return <Palette className="w-4 h-4" />;
      case "song": return <Music className="w-4 h-4" />;
      case "exploration": return <Globe className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const handleStartActivity = (activity: Activity) => {
    toast.success(`Starting: ${activity.title}`);
  };

  const totalStars = learningPaths.reduce((sum, p) => sum + p.completedLessons * 3, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-2xl">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-white rounded-full shadow-lg">
            <Sparkles className="w-12 h-12 text-purple-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-purple-700 mb-2">House of Wonder</h1>
        <p className="text-lg text-purple-600">Kindergarten through 5th Grade</p>
        <p className="text-muted-foreground mt-2">Where curiosity meets discovery!</p>
        
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-2xl font-bold">{totalStars}</span>
            </div>
            <p className="text-sm text-muted-foreground">Stars Earned</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-500">
              <Trophy className="w-5 h-5" />
              <span className="text-2xl font-bold">{learningPaths.reduce((sum, p) => sum + p.completedLessons, 0)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Lessons Done</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-500">
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-2xl font-bold">{learningPaths.filter(p => p.isUnlocked).length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Paths Unlocked</p>
          </div>
        </div>
      </div>

      {selectedPath ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedPath(null)}>
              ← Back to Paths
            </Button>
            <Badge className={selectedPath.color}>
              Ages {selectedPath.ageRange}
            </Badge>
          </div>

          <Card className="overflow-hidden">
            <div className={`p-6 ${selectedPath.color.replace('text-', 'bg-').replace('100', '50')}`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${selectedPath.color}`}>
                  {selectedPath.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedPath.name}</h2>
                  <p className="text-muted-foreground">{selectedPath.description}</p>
                </div>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Your Progress</span>
                <span className="text-lg font-bold">{selectedPath.progress}%</span>
              </div>
              <Progress value={selectedPath.progress} className="h-4 mb-2" />
              <p className="text-sm text-muted-foreground">
                {selectedPath.completedLessons} of {selectedPath.lessons} activities completed
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Activities
            </h3>
            {sampleActivities.map((activity) => (
              <Card 
                key={activity.id}
                className={`transition-all hover:shadow-md ${activity.isCompleted ? 'bg-green-50/50' : ''}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        activity.isCompleted ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant="outline" className="capitalize">{activity.type}</Badge>
                          <span>{activity.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {[...Array(activity.maxStars)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${
                              i < activity.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                            }`} 
                          />
                        ))}
                      </div>
                      <Button 
                        size="sm"
                        variant={activity.isCompleted ? "outline" : "default"}
                        onClick={() => handleStartActivity(activity)}
                        className="gap-2"
                      >
                        <Play className="w-4 h-4" />
                        {activity.isCompleted ? "Play Again" : "Start"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {learningPaths.map((path) => (
            <Card 
              key={path.id}
              className={`transition-all cursor-pointer hover:shadow-lg ${
                !path.isUnlocked ? 'opacity-60' : ''
              }`}
              onClick={() => path.isUnlocked && setSelectedPath(path)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${path.color}`}>
                    {path.icon}
                  </div>
                  {!path.isUnlocked ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Badge variant="outline">Ages {path.ageRange}</Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{path.name}</CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {path.isUnlocked ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{path.progress}%</span>
                      </div>
                      <Progress value={path.progress} className="h-2" />
                    </div>
                    <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                      <span>{path.completedLessons}/{path.lessons} activities</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {path.completedLessons * 3} stars
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Complete more activities to unlock!
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default HouseOfWonder;
