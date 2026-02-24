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
  Sparkles,
  Shapes,
  Crown,
  BookOpen,
  Award,
  Play,
  GraduationCap,
  Users,
  Clock,
  Star,
  Scroll,
  Flame,
} from "lucide-react";

interface LearningHouse {
  id: string;
  name: string;
  subtitle: string;
  gradeRange: string;
  ageRange: string;
  theme: string;
  description: string;
  philosophy: string;
  modules: Array<{
    name: string;
    ceremonialTitle: string;
    description: string;
    lessons: number;
  }>;
  tokenRewards: {
    lessonComplete: number;
    moduleComplete: number;
    houseGraduation: number;
  };
}

export default function LearningHouses() {
  const [selectedHouse, setSelectedHouse] = useState<string>("wonder");

  const { data: housesData, isLoading } = trpc.learningHouses.getHouseOverview.useQuery();

  const houseIcons: Record<string, React.ReactNode> = {
    wonder: <Sparkles className="w-10 h-10" />,
    form: <Shapes className="w-10 h-10" />,
    mastery: <Crown className="w-10 h-10" />,
  };

  const houseColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
    wonder: {
      bg: "bg-amber-50",
      border: "border-amber-300",
      text: "text-amber-700",
      accent: "bg-amber-100",
    },
    form: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-700",
      accent: "bg-emerald-100",
    },
    mastery: {
      bg: "bg-purple-50",
      border: "border-purple-300",
      text: "text-purple-700",
      accent: "bg-purple-100",
    },
  };

  const handleEnroll = (houseId: string) => {
    toast.info("Enrollment system coming soon - Guardian approval required for student enrollment");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <GraduationCap className="w-12 h-12 animate-pulse mx-auto text-primary" />
            <p className="text-muted-foreground">Loading Learning Houses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const houses: LearningHouse[] = housesData?.houses || [];
  const currentHouse = houses.find((h) => h.id === selectedHouse);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <GraduationCap className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">The Three Learning Houses</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Luv Learning Academy's Divine STEM curriculum guides students through three houses of growth - 
            from playful discovery to deep mastery. Each house is designed for specific developmental stages.
          </p>
        </div>

        {/* House Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {houses.map((house) => {
            const colors = houseColors[house.id];
            return (
              <Card
                key={house.id}
                className={`cursor-pointer transition-all ${colors.bg} ${colors.border} border-2 ${
                  selectedHouse === house.id ? "ring-4 ring-primary/30 scale-[1.02]" : "hover:scale-[1.01]"
                }`}
                onClick={() => setSelectedHouse(house.id)}
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto p-4 rounded-full ${colors.accent} ${colors.text}`}>
                    {houseIcons[house.id]}
                  </div>
                  <CardTitle className={`text-2xl ${colors.text}`}>{house.name}</CardTitle>
                  <CardDescription className="text-base font-medium">{house.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="flex justify-center gap-4 text-sm">
                    <Badge variant="outline" className={colors.text}>
                      <Users className="w-3 h-3 mr-1" />
                      {house.gradeRange}
                    </Badge>
                    <Badge variant="outline" className={colors.text}>
                      <Clock className="w-3 h-3 mr-1" />
                      Ages {house.ageRange}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{house.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected House Detail */}
        {currentHouse && (
          <Card className={`${houseColors[currentHouse.id].border} border-2`}>
            <CardHeader className={houseColors[currentHouse.id].bg}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${houseColors[currentHouse.id].accent} ${houseColors[currentHouse.id].text}`}>
                    {houseIcons[currentHouse.id]}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{currentHouse.name}</CardTitle>
                    <CardDescription className="text-base">{currentHouse.subtitle}</CardDescription>
                  </div>
                </div>
                <Button onClick={() => handleEnroll(currentHouse.id)} className="gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Enroll Student
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Philosophy */}
              <div className={`p-4 rounded-lg ${houseColors[currentHouse.id].accent}`}>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  House Philosophy
                </h4>
                <p className="text-muted-foreground italic">"{currentHouse.philosophy}"</p>
              </div>

              {/* Token Rewards */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-600" />
                    <h4 className="font-semibold">Token Rewards</h4>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-lg text-amber-700">{currentHouse.tokenRewards.lessonComplete}</p>
                      <p className="text-muted-foreground">Per Lesson</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-amber-700">{currentHouse.tokenRewards.moduleComplete}</p>
                      <p className="text-muted-foreground">Module Complete</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-amber-700">{currentHouse.tokenRewards.houseGraduation}</p>
                      <p className="text-muted-foreground">Graduation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divine STEM Modules */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Divine STEM Curriculum - 7 Modules
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentHouse.modules.map((module, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-semibold text-foreground">{module.name}</h5>
                            <p className="text-xs text-primary italic">{module.ceremonialTitle}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {module.lessons} lessons
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                        <div className="flex items-center justify-between">
                          <Progress value={0} className="flex-1 mr-4" />
                          <Button size="sm" variant="outline" onClick={() => toast.info("Module enrollment coming soon")}>
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Graduation Scroll */}
              <div className={`${houseColors[currentHouse.id].bg} ${houseColors[currentHouse.id].border} border rounded-lg p-4`}>
                <div className="flex items-center gap-3">
                  <Scroll className={`w-8 h-8 ${houseColors[currentHouse.id].text}`} />
                  <div>
                    <h4 className="font-semibold text-foreground">Scroll of Passage</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete all 7 Divine STEM modules to earn your Scroll of Passage from {currentHouse.name} - 
                      a blockchain-verified certificate worth {currentHouse.tokenRewards.houseGraduation} LUV tokens 
                      that marks your transition to the next house.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progression Path */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              The Learning Journey
            </CardTitle>
            <CardDescription>
              Students progress through all three houses, building upon their knowledge at each stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-amber-600">
                <Sparkles className="w-6 h-6" />
                <span className="font-medium">Wonder (K-5)</span>
              </div>
              <div className="hidden md:block flex-1 h-1 bg-gradient-to-r from-amber-300 via-emerald-300 to-purple-300 rounded" />
              <div className="flex items-center gap-2 text-emerald-600">
                <Shapes className="w-6 h-6" />
                <span className="font-medium">Form (6-8)</span>
              </div>
              <div className="hidden md:block flex-1 h-1 bg-gradient-to-r from-emerald-300 to-purple-300 rounded" />
              <div className="flex items-center gap-2 text-purple-600">
                <Crown className="w-6 h-6" />
                <span className="font-medium">Mastery (9-12)</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Upon completing all three houses, students earn the prestigious <strong>Sovereign Scholar Scroll</strong> - 
              the highest achievement in Luv Learning Academy worth 2,000 LUV tokens.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
