import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Crown,
  Award,
  Briefcase,
  Building,
  Scale,
  TrendingUp,
  Users,
  BookOpen,
  GraduationCap,
  Star,
  Trophy,
  Lock,
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle,
  Play,
} from "lucide-react";

interface Program {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  duration: string;
  level: "certificate" | "professional" | "executive";
  modules: number;
  completedModules: number;
  progress: number;
  isEnrolled: boolean;
  price: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  completedLessons: number;
  hasAssessment: boolean;
  assessmentPassed: boolean | null;
  isCompleted: boolean;
  isLocked: boolean;
}

const programs: Program[] = [
  {
    id: "business-mastery",
    name: "Business Mastery",
    description: "Comprehensive business management and leadership training",
    icon: <Briefcase className="w-6 h-6" />,
    color: "bg-blue-100 text-blue-700",
    duration: "6 months",
    level: "professional",
    modules: 12,
    completedModules: 8,
    progress: 67,
    isEnrolled: true,
    price: "$1,997",
  },
  {
    id: "financial-sovereignty",
    name: "Financial Sovereignty",
    description: "Advanced wealth building, asset protection, and legacy planning",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-green-100 text-green-700",
    duration: "4 months",
    level: "professional",
    modules: 8,
    completedModules: 5,
    progress: 62,
    isEnrolled: true,
    price: "$1,497",
  },
  {
    id: "legal-foundations",
    name: "Legal Foundations",
    description: "Business law, contracts, and entity formation for entrepreneurs",
    icon: <Scale className="w-6 h-6" />,
    color: "bg-purple-100 text-purple-700",
    duration: "3 months",
    level: "certificate",
    modules: 6,
    completedModules: 3,
    progress: 50,
    isEnrolled: true,
    price: "$997",
  },
  {
    id: "real-estate-investing",
    name: "Real Estate Investing",
    description: "Property acquisition, management, and wealth building through real estate",
    icon: <Building className="w-6 h-6" />,
    color: "bg-amber-100 text-amber-700",
    duration: "4 months",
    level: "professional",
    modules: 8,
    completedModules: 0,
    progress: 0,
    isEnrolled: false,
    price: "$1,497",
  },
  {
    id: "executive-leadership",
    name: "Executive Leadership",
    description: "C-suite skills, board governance, and organizational transformation",
    icon: <Crown className="w-6 h-6" />,
    color: "bg-indigo-100 text-indigo-700",
    duration: "8 months",
    level: "executive",
    modules: 16,
    completedModules: 0,
    progress: 0,
    isEnrolled: false,
    price: "$4,997",
  },
  {
    id: "community-leadership",
    name: "Community Leadership",
    description: "Nonprofit management, community organizing, and social impact",
    icon: <Users className="w-6 h-6" />,
    color: "bg-orange-100 text-orange-700",
    duration: "3 months",
    level: "certificate",
    modules: 6,
    completedModules: 0,
    progress: 0,
    isEnrolled: false,
    price: "$797",
  },
];

const sampleModules: Module[] = [
  { id: "1", title: "Business Planning Fundamentals", description: "Creating effective business plans and strategies", duration: "2 weeks", lessons: 8, completedLessons: 8, hasAssessment: true, assessmentPassed: true, isCompleted: true, isLocked: false },
  { id: "2", title: "Financial Management", description: "Cash flow, budgeting, and financial statements", duration: "2 weeks", lessons: 10, completedLessons: 10, hasAssessment: true, assessmentPassed: true, isCompleted: true, isLocked: false },
  { id: "3", title: "Marketing & Sales", description: "Building your brand and growing revenue", duration: "3 weeks", lessons: 12, completedLessons: 12, hasAssessment: true, assessmentPassed: true, isCompleted: true, isLocked: false },
  { id: "4", title: "Operations Management", description: "Streamlining processes and scaling operations", duration: "2 weeks", lessons: 8, completedLessons: 6, hasAssessment: true, assessmentPassed: null, isCompleted: false, isLocked: false },
  { id: "5", title: "Team Building & HR", description: "Hiring, managing, and developing your team", duration: "2 weeks", lessons: 8, completedLessons: 0, hasAssessment: true, assessmentPassed: null, isCompleted: false, isLocked: false },
  { id: "6", title: "Legal & Compliance", description: "Business law essentials and regulatory compliance", duration: "2 weeks", lessons: 8, completedLessons: 0, hasAssessment: true, assessmentPassed: null, isCompleted: false, isLocked: true },
];

export function HouseOfMastery() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const getLevelBadge = (level: Program["level"]) => {
    switch (level) {
      case "executive": return <Badge className="bg-purple-100 text-purple-700">Executive</Badge>;
      case "professional": return <Badge className="bg-blue-100 text-blue-700">Professional</Badge>;
      default: return <Badge variant="outline">Certificate</Badge>;
    }
  };

  const handleStartModule = (module: Module) => {
    if (module.isLocked) {
      toast.error("Complete previous modules to unlock");
      return;
    }
    toast.success(`Opening: ${module.title}`);
  };

  const handleEnroll = (program: Program) => {
    toast.success(`Enrollment started for ${program.name}`);
  };

  const enrolledPrograms = programs.filter(p => p.isEnrolled);
  const totalCredits = enrolledPrograms.reduce((sum, p) => sum + p.completedModules, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-white/20 rounded-xl">
            <Crown className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">House of Mastery</h1>
            <p className="text-amber-100">Adult Professional Development</p>
          </div>
        </div>
        <p className="text-amber-100 mb-6">Advanced training for entrepreneurs, professionals, and community leaders</p>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{enrolledPrograms.length}</p>
            <p className="text-sm text-amber-100">Programs Enrolled</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{totalCredits}</p>
            <p className="text-sm text-amber-100">Modules Completed</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{enrolledPrograms.filter(p => p.progress === 100).length}</p>
            <p className="text-sm text-amber-100">Certifications</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{Math.round(enrolledPrograms.reduce((sum, p) => sum + p.progress, 0) / enrolledPrograms.length)}%</p>
            <p className="text-sm text-amber-100">Overall Progress</p>
          </div>
        </div>
      </div>

      {selectedProgram ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedProgram(null)}>
              ← Back to Programs
            </Button>
            <div className="flex items-center gap-2">
              {getLevelBadge(selectedProgram.level)}
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {selectedProgram.duration}
              </Badge>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${selectedProgram.color}`}>
                  {selectedProgram.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{selectedProgram.name}</CardTitle>
                  <CardDescription>{selectedProgram.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Program Progress</span>
                <span className="text-lg font-bold">{selectedProgram.progress}%</span>
              </div>
              <Progress value={selectedProgram.progress} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {selectedProgram.completedModules} of {selectedProgram.modules} modules completed
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Program Modules</h3>
            {sampleModules.map((module, index) => (
              <Card 
                key={module.id}
                className={`transition-all ${module.isLocked ? 'opacity-60' : 'hover:shadow-md'}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${
                        module.isCompleted 
                          ? 'bg-green-100 text-green-700' 
                          : module.isLocked 
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-amber-100 text-amber-700'
                      }`}>
                        {module.isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : module.isLocked ? (
                          <Lock className="w-6 h-6" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {module.duration}
                          </span>
                          <span className="text-muted-foreground">
                            {module.completedLessons}/{module.lessons} lessons
                          </span>
                          {module.hasAssessment && module.assessmentPassed !== null && (
                            <Badge variant="outline" className={module.assessmentPassed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                              {module.assessmentPassed ? "Assessment Passed" : "Assessment Failed"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {!module.isLocked && !module.isCompleted && (
                        <Progress 
                          value={(module.completedLessons / module.lessons) * 100} 
                          className="w-24 h-2" 
                        />
                      )}
                      <Button
                        variant={module.isCompleted ? "outline" : "default"}
                        size="sm"
                        disabled={module.isLocked}
                        onClick={() => handleStartModule(module)}
                        className="gap-2"
                      >
                        {module.isCompleted ? "Review" : module.isLocked ? "Locked" : "Continue"}
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
        <Tabs defaultValue="enrolled" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="enrolled">My Programs</TabsTrigger>
            <TabsTrigger value="catalog">Program Catalog</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledPrograms.map((program) => (
                <Card 
                  key={program.id}
                  className="transition-all cursor-pointer hover:shadow-lg"
                  onClick={() => setSelectedProgram(program)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${program.color}`}>
                        {program.icon}
                      </div>
                      {getLevelBadge(program.level)}
                    </div>
                    <CardTitle className="mt-3">{program.name}</CardTitle>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{program.progress}%</span>
                      </div>
                      <Progress value={program.progress} className="h-2" />
                    </div>
                    <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                      <span>{program.completedModules}/{program.modules} modules</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {program.duration}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="catalog" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.filter(p => !p.isEnrolled).map((program) => (
                <Card key={program.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${program.color}`}>
                        {program.icon}
                      </div>
                      {getLevelBadge(program.level)}
                    </div>
                    <CardTitle className="mt-3">{program.name}</CardTitle>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {program.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        {program.modules} modules
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{program.price}</span>
                      <Button onClick={() => handleEnroll(program)} className="gap-2">
                        <Play className="w-4 h-4" />
                        Enroll Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Your Certifications
                </CardTitle>
                <CardDescription>Earned certificates and credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Complete a program to earn your first certification</p>
                  <p className="text-sm mt-2">You're {Math.round(enrolledPrograms.reduce((sum, p) => sum + p.progress, 0) / enrolledPrograms.length)}% of the way there!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default HouseOfMastery;
