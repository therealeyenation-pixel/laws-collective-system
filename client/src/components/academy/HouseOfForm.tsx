import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Compass,
  Target,
  Lightbulb,
  Users,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Code,
  Briefcase,
  Heart,
  Shield,
  Trophy,
  Star,
  Play,
  Lock,
  ChevronRight,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  units: number;
  completedUnits: number;
  grade: string;
  credits: number;
  isUnlocked: boolean;
}

interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: number;
  completedLessons: number;
  assessmentScore: number | null;
  isCompleted: boolean;
  isLocked: boolean;
}

const subjects: Subject[] = [
  {
    id: "form-math",
    name: "Mathematical Foundations",
    description: "Pre-algebra, geometry, and problem-solving strategies",
    icon: <Calculator className="w-6 h-6" />,
    color: "bg-blue-100 text-blue-700",
    progress: 72,
    units: 8,
    completedUnits: 6,
    grade: "6-8",
    credits: 3,
    isUnlocked: true,
  },
  {
    id: "form-science",
    name: "Scientific Discovery",
    description: "Earth science, life science, and the scientific method",
    icon: <FlaskConical className="w-6 h-6" />,
    color: "bg-green-100 text-green-700",
    progress: 55,
    units: 10,
    completedUnits: 5,
    grade: "6-8",
    credits: 3,
    isUnlocked: true,
  },
  {
    id: "form-language",
    name: "Language & Literature",
    description: "Reading comprehension, writing skills, and literary analysis",
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-purple-100 text-purple-700",
    progress: 80,
    units: 8,
    completedUnits: 6,
    grade: "6-8",
    credits: 3,
    isUnlocked: true,
  },
  {
    id: "form-social",
    name: "Social Studies",
    description: "World history, civics, and cultural understanding",
    icon: <Globe className="w-6 h-6" />,
    color: "bg-amber-100 text-amber-700",
    progress: 40,
    units: 8,
    completedUnits: 3,
    grade: "6-8",
    credits: 3,
    isUnlocked: true,
  },
  {
    id: "form-tech",
    name: "Digital Literacy",
    description: "Computer basics, coding introduction, and digital citizenship",
    icon: <Code className="w-6 h-6" />,
    color: "bg-cyan-100 text-cyan-700",
    progress: 30,
    units: 6,
    completedUnits: 2,
    grade: "6-8",
    credits: 2,
    isUnlocked: true,
  },
  {
    id: "form-life",
    name: "Life Skills",
    description: "Financial basics, health, and personal development",
    icon: <Heart className="w-6 h-6" />,
    color: "bg-pink-100 text-pink-700",
    progress: 65,
    units: 6,
    completedUnits: 4,
    grade: "6-8",
    credits: 2,
    isUnlocked: true,
  },
  {
    id: "form-leadership",
    name: "Leadership Foundations",
    description: "Teamwork, communication, and community service",
    icon: <Users className="w-6 h-6" />,
    color: "bg-orange-100 text-orange-700",
    progress: 25,
    units: 5,
    completedUnits: 1,
    grade: "7-8",
    credits: 2,
    isUnlocked: true,
  },
  {
    id: "form-entrepreneurship",
    name: "Young Entrepreneurs",
    description: "Business basics, creativity, and innovation",
    icon: <Briefcase className="w-6 h-6" />,
    color: "bg-indigo-100 text-indigo-700",
    progress: 0,
    units: 6,
    completedUnits: 0,
    grade: "7-8",
    credits: 2,
    isUnlocked: false,
  },
];

const sampleUnits: Unit[] = [
  { id: "1", title: "Introduction to Variables", description: "Understanding variables and expressions", lessons: 5, completedLessons: 5, assessmentScore: 92, isCompleted: true, isLocked: false },
  { id: "2", title: "Equations & Inequalities", description: "Solving one-step and two-step equations", lessons: 6, completedLessons: 6, assessmentScore: 88, isCompleted: true, isLocked: false },
  { id: "3", title: "Ratios & Proportions", description: "Working with ratios, rates, and proportions", lessons: 5, completedLessons: 5, assessmentScore: 95, isCompleted: true, isLocked: false },
  { id: "4", title: "Geometry Basics", description: "Angles, triangles, and basic shapes", lessons: 6, completedLessons: 4, assessmentScore: null, isCompleted: false, isLocked: false },
  { id: "5", title: "Data & Statistics", description: "Collecting, analyzing, and presenting data", lessons: 5, completedLessons: 0, assessmentScore: null, isCompleted: false, isLocked: false },
  { id: "6", title: "Probability", description: "Understanding chance and probability", lessons: 4, completedLessons: 0, assessmentScore: null, isCompleted: false, isLocked: true },
];

export function HouseOfForm() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleStartUnit = (unit: Unit) => {
    if (unit.isLocked) {
      toast.error("Complete previous units to unlock");
      return;
    }
    toast.success(`Starting: ${unit.title}`);
  };

  const totalCredits = subjects.filter(s => s.isUnlocked).reduce((sum, s) => sum + (s.completedUnits / s.units) * s.credits, 0);
  const overallProgress = Math.round(subjects.filter(s => s.isUnlocked).reduce((sum, s) => sum + s.progress, 0) / subjects.filter(s => s.isUnlocked).length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-white/20 rounded-xl">
            <Compass className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">House of Form</h1>
            <p className="text-blue-100">Middle School • Grades 6-8</p>
          </div>
        </div>
        <p className="text-blue-100 mb-6">Building the foundations for academic excellence and personal growth</p>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{overallProgress}%</p>
            <p className="text-sm text-blue-100">Overall Progress</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{totalCredits.toFixed(1)}</p>
            <p className="text-sm text-blue-100">Credits Earned</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{subjects.filter(s => s.isUnlocked).length}</p>
            <p className="text-sm text-blue-100">Active Subjects</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{subjects.reduce((sum, s) => sum + s.completedUnits, 0)}</p>
            <p className="text-sm text-blue-100">Units Completed</p>
          </div>
        </div>
      </div>

      {selectedSubject ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedSubject(null)}>
              ← Back to Subjects
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Grade {selectedSubject.grade}</Badge>
              <Badge className={selectedSubject.color}>{selectedSubject.credits} Credits</Badge>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${selectedSubject.color}`}>
                  {selectedSubject.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{selectedSubject.name}</CardTitle>
                  <CardDescription>{selectedSubject.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Course Progress</span>
                <span className="text-lg font-bold">{selectedSubject.progress}%</span>
              </div>
              <Progress value={selectedSubject.progress} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {selectedSubject.completedUnits} of {selectedSubject.units} units completed
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Course Units</h3>
            {sampleUnits.map((unit, index) => (
              <Card 
                key={unit.id}
                className={`transition-all ${unit.isLocked ? 'opacity-60' : 'hover:shadow-md'}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        unit.isCompleted 
                          ? 'bg-green-100 text-green-700' 
                          : unit.isLocked 
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {unit.isLocked ? <Lock className="w-5 h-5" /> : index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{unit.title}</h4>
                        <p className="text-sm text-muted-foreground">{unit.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-muted-foreground">
                            {unit.completedLessons}/{unit.lessons} lessons
                          </span>
                          {unit.assessmentScore !== null && (
                            <Badge variant="outline" className="bg-green-50">
                              <Star className="w-3 h-3 mr-1 text-yellow-500" />
                              Score: {unit.assessmentScore}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!unit.isLocked && (
                        <Progress 
                          value={(unit.completedLessons / unit.lessons) * 100} 
                          className="w-24 h-2" 
                        />
                      )}
                      <Button
                        variant={unit.isCompleted ? "outline" : "default"}
                        size="sm"
                        disabled={unit.isLocked}
                        onClick={() => handleStartUnit(unit)}
                        className="gap-2"
                      >
                        {unit.isCompleted ? "Review" : unit.isLocked ? "Locked" : "Continue"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subjects.map((subject) => (
            <Card 
              key={subject.id}
              className={`transition-all cursor-pointer hover:shadow-lg ${
                !subject.isUnlocked ? 'opacity-60' : ''
              }`}
              onClick={() => subject.isUnlocked && setSelectedSubject(subject)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${subject.color}`}>
                    {subject.icon}
                  </div>
                  {!subject.isUnlocked ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Badge variant="outline">{subject.credits} cr</Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-3">{subject.name}</CardTitle>
                <CardDescription className="text-sm">{subject.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {subject.isUnlocked ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{subject.progress}%</span>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </div>
                    <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                      <span>{subject.completedUnits}/{subject.units} units</span>
                      <Badge variant="outline" className="text-xs">Grade {subject.grade}</Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Complete prerequisites to unlock
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

export default HouseOfForm;
