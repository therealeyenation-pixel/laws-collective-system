import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Target,
  GraduationCap,
  Briefcase,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Code,
  Scale,
  TrendingUp,
  Users,
  Heart,
  Award,
  Star,
  Trophy,
  Lock,
  ChevronRight,
  FileText,
} from "lucide-react";

interface Track {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  courses: Course[];
}

interface Course {
  id: string;
  name: string;
  description: string;
  credits: number;
  level: "honors" | "standard" | "ap";
  progress: number;
  grade: string | null;
  isCompleted: boolean;
  isUnlocked: boolean;
}

const tracks: Track[] = [
  {
    id: "business",
    name: "Business & Finance",
    description: "Prepare for careers in business, finance, and entrepreneurship",
    icon: <Briefcase className="w-6 h-6" />,
    color: "bg-blue-100 text-blue-700",
    courses: [
      { id: "b1", name: "Financial Literacy", description: "Personal finance and money management", credits: 3, level: "standard", progress: 100, grade: "A", isCompleted: true, isUnlocked: true },
      { id: "b2", name: "Business Foundations", description: "Introduction to business concepts", credits: 3, level: "standard", progress: 85, grade: null, isCompleted: false, isUnlocked: true },
      { id: "b3", name: "Accounting Principles", description: "Basic accounting and bookkeeping", credits: 3, level: "honors", progress: 40, grade: null, isCompleted: false, isUnlocked: true },
      { id: "b4", name: "Entrepreneurship", description: "Starting and running a business", credits: 3, level: "honors", progress: 0, grade: null, isCompleted: false, isUnlocked: false },
      { id: "b5", name: "AP Economics", description: "Micro and macroeconomics", credits: 4, level: "ap", progress: 0, grade: null, isCompleted: false, isUnlocked: false },
    ],
  },
  {
    id: "stem",
    name: "STEM",
    description: "Science, Technology, Engineering, and Mathematics pathway",
    icon: <FlaskConical className="w-6 h-6" />,
    color: "bg-green-100 text-green-700",
    courses: [
      { id: "s1", name: "Algebra II", description: "Advanced algebraic concepts", credits: 4, level: "standard", progress: 100, grade: "A-", isCompleted: true, isUnlocked: true },
      { id: "s2", name: "Pre-Calculus", description: "Preparation for calculus", credits: 4, level: "honors", progress: 60, grade: null, isCompleted: false, isUnlocked: true },
      { id: "s3", name: "Physics", description: "Mechanics, waves, and energy", credits: 4, level: "honors", progress: 30, grade: null, isCompleted: false, isUnlocked: true },
      { id: "s4", name: "Computer Science", description: "Programming and algorithms", credits: 3, level: "honors", progress: 0, grade: null, isCompleted: false, isUnlocked: true },
      { id: "s5", name: "AP Calculus", description: "Differential and integral calculus", credits: 5, level: "ap", progress: 0, grade: null, isCompleted: false, isUnlocked: false },
    ],
  },
  {
    id: "humanities",
    name: "Humanities & Law",
    description: "History, government, and pre-law preparation",
    icon: <Scale className="w-6 h-6" />,
    color: "bg-purple-100 text-purple-700",
    courses: [
      { id: "h1", name: "US History", description: "American history and civics", credits: 3, level: "standard", progress: 100, grade: "B+", isCompleted: true, isUnlocked: true },
      { id: "h2", name: "Government & Politics", description: "Political systems and participation", credits: 3, level: "honors", progress: 75, grade: null, isCompleted: false, isUnlocked: true },
      { id: "h3", name: "Constitutional Law", description: "Legal foundations and rights", credits: 3, level: "honors", progress: 20, grade: null, isCompleted: false, isUnlocked: true },
      { id: "h4", name: "Public Speaking", description: "Rhetoric and debate", credits: 2, level: "standard", progress: 0, grade: null, isCompleted: false, isUnlocked: true },
      { id: "h5", name: "AP US Government", description: "Advanced government studies", credits: 4, level: "ap", progress: 0, grade: null, isCompleted: false, isUnlocked: false },
    ],
  },
  {
    id: "leadership",
    name: "Leadership & Service",
    description: "Community leadership and social impact",
    icon: <Users className="w-6 h-6" />,
    color: "bg-orange-100 text-orange-700",
    courses: [
      { id: "l1", name: "Leadership Principles", description: "Foundations of effective leadership", credits: 2, level: "standard", progress: 100, grade: "A", isCompleted: true, isUnlocked: true },
      { id: "l2", name: "Community Service", description: "Service learning and volunteering", credits: 2, level: "standard", progress: 50, grade: null, isCompleted: false, isUnlocked: true },
      { id: "l3", name: "Project Management", description: "Planning and executing projects", credits: 3, level: "honors", progress: 0, grade: null, isCompleted: false, isUnlocked: true },
      { id: "l4", name: "Nonprofit Management", description: "Running community organizations", credits: 3, level: "honors", progress: 0, grade: null, isCompleted: false, isUnlocked: false },
    ],
  },
];

export function HouseOfPurpose() {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const getLevelBadge = (level: Course["level"]) => {
    switch (level) {
      case "ap": return <Badge className="bg-red-100 text-red-700">AP</Badge>;
      case "honors": return <Badge className="bg-blue-100 text-blue-700">Honors</Badge>;
      default: return <Badge variant="outline">Standard</Badge>;
    }
  };

  const handleStartCourse = (course: Course) => {
    if (!course.isUnlocked) {
      toast.error("Complete prerequisites to unlock this course");
      return;
    }
    toast.success(`Opening: ${course.name}`);
  };

  const totalCredits = tracks.flatMap(t => t.courses).filter(c => c.isCompleted).reduce((sum, c) => sum + c.credits, 0);
  const totalCourses = tracks.flatMap(t => t.courses).filter(c => c.isCompleted).length;
  const gpa = 3.7; // Calculated GPA

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-white/20 rounded-xl">
            <Target className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">House of Purpose</h1>
            <p className="text-purple-200">High School • Grades 9-12</p>
          </div>
        </div>
        <p className="text-purple-200 mb-6">Preparing future leaders for college, career, and life success</p>
        
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{gpa}</p>
            <p className="text-sm text-purple-200">GPA</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{totalCredits}</p>
            <p className="text-sm text-purple-200">Credits Earned</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{totalCourses}</p>
            <p className="text-sm text-purple-200">Courses Completed</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{tracks.length}</p>
            <p className="text-sm text-purple-200">Career Tracks</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">2</p>
            <p className="text-sm text-purple-200">AP Courses</p>
          </div>
        </div>
      </div>

      {selectedTrack ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedTrack(null)}>
              ← Back to Tracks
            </Button>
            <Badge className={selectedTrack.color}>
              {selectedTrack.courses.length} Courses
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${selectedTrack.color}`}>
                  {selectedTrack.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{selectedTrack.name}</CardTitle>
                  <CardDescription>{selectedTrack.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{selectedTrack.courses.filter(c => c.isCompleted).length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{selectedTrack.courses.filter(c => c.isUnlocked && !c.isCompleted).length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{selectedTrack.courses.reduce((sum, c) => sum + (c.isCompleted ? c.credits : 0), 0)}</p>
                  <p className="text-sm text-muted-foreground">Credits Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Courses</h3>
            {selectedTrack.courses.map((course) => (
              <Card 
                key={course.id}
                className={`transition-all ${!course.isUnlocked ? 'opacity-60' : 'hover:shadow-md'}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        course.isCompleted 
                          ? 'bg-green-100' 
                          : !course.isUnlocked 
                            ? 'bg-gray-100'
                            : 'bg-blue-50'
                      }`}>
                        {course.isCompleted ? (
                          <Award className="w-6 h-6 text-green-600" />
                        ) : !course.isUnlocked ? (
                          <Lock className="w-6 h-6 text-gray-400" />
                        ) : (
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{course.name}</h4>
                          {getLevelBadge(course.level)}
                        </div>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-muted-foreground">{course.credits} credits</span>
                          {course.grade && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Grade: {course.grade}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {course.isUnlocked && !course.isCompleted && (
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}
                      <Button
                        variant={course.isCompleted ? "outline" : "default"}
                        size="sm"
                        disabled={!course.isUnlocked}
                        onClick={() => handleStartCourse(course)}
                        className="gap-2"
                      >
                        {course.isCompleted ? "Review" : !course.isUnlocked ? "Locked" : "Continue"}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          <Tabs defaultValue="tracks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tracks">Career Tracks</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="graduation">Graduation Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="tracks" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tracks.map((track) => (
                  <Card 
                    key={track.id}
                    className="transition-all cursor-pointer hover:shadow-lg"
                    onClick={() => setSelectedTrack(track)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${track.color}`}>
                          {track.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle>{track.name}</CardTitle>
                          <CardDescription>{track.description}</CardDescription>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm">
                        <span>{track.courses.filter(c => c.isCompleted).length}/{track.courses.length} courses completed</span>
                        <span className="font-medium">
                          {track.courses.filter(c => c.isCompleted).reduce((sum, c) => sum + c.credits, 0)} credits
                        </span>
                      </div>
                      <Progress 
                        value={(track.courses.filter(c => c.isCompleted).length / track.courses.length) * 100} 
                        className="h-2 mt-2" 
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="transcript" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Academic Transcript
                  </CardTitle>
                  <CardDescription>Your official academic record</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tracks.flatMap(t => t.courses).filter(c => c.isCompleted).map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{course.name}</p>
                          <p className="text-sm text-muted-foreground">{course.credits} credits • {course.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{course.grade}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="graduation" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Graduation Requirements
                  </CardTitle>
                  <CardDescription>Track your progress toward graduation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "English", required: 4, completed: 3 },
                      { name: "Mathematics", required: 4, completed: 2 },
                      { name: "Science", required: 3, completed: 2 },
                      { name: "Social Studies", required: 3, completed: 2 },
                      { name: "Electives", required: 6, completed: 4 },
                      { name: "Community Service", required: 40, completed: 25, unit: "hours" },
                    ].map((req) => (
                      <div key={req.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{req.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {req.completed}/{req.required} {req.unit || "credits"}
                          </span>
                        </div>
                        <Progress value={(req.completed / req.required) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export default HouseOfPurpose;
