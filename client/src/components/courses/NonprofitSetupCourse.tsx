import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Heart,
  FileText,
  Scale,
  Users,
  Shield,
  CheckCircle,
  Clock,
  Play,
  Lock,
  ChevronRight,
  Download,
  Award,
  BookOpen,
  Target,
  Building,
  DollarSign,
} from "lucide-react";

interface CourseModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  lessonsCount: number;
  completedLessons: number;
  documentsCount: number;
  hasQuiz: boolean;
  quizPassed: boolean | null;
  isCompleted: boolean;
  isLocked: boolean;
}

const courseModules: CourseModule[] = [
  {
    id: "np-1",
    title: "Nonprofit Fundamentals",
    description: "Understanding nonprofit structures, missions, and legal requirements",
    icon: <Heart className="w-5 h-5" />,
    lessonsCount: 5,
    completedLessons: 5,
    documentsCount: 3,
    hasQuiz: true,
    quizPassed: true,
    isCompleted: true,
    isLocked: false,
  },
  {
    id: "np-2",
    title: "Mission & Vision Development",
    description: "Crafting compelling mission statements and strategic vision",
    icon: <Target className="w-5 h-5" />,
    lessonsCount: 4,
    completedLessons: 4,
    documentsCount: 4,
    hasQuiz: true,
    quizPassed: true,
    isCompleted: true,
    isLocked: false,
  },
  {
    id: "np-3",
    title: "501(c)(3) Application Process",
    description: "Complete guide to IRS Form 1023 and tax-exempt status",
    icon: <FileText className="w-5 h-5" />,
    lessonsCount: 8,
    completedLessons: 5,
    documentsCount: 6,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: false,
  },
  {
    id: "np-4",
    title: "Board Development & Governance",
    description: "Building an effective board of directors and governance structure",
    icon: <Users className="w-5 h-5" />,
    lessonsCount: 6,
    completedLessons: 2,
    documentsCount: 5,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: false,
  },
  {
    id: "np-5",
    title: "Fundraising Fundamentals",
    description: "Grant writing, donor cultivation, and fundraising strategies",
    icon: <DollarSign className="w-5 h-5" />,
    lessonsCount: 7,
    completedLessons: 0,
    documentsCount: 8,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: false,
  },
  {
    id: "np-6",
    title: "Compliance & Reporting",
    description: "Annual filings, Form 990, and maintaining tax-exempt status",
    icon: <Scale className="w-5 h-5" />,
    lessonsCount: 5,
    completedLessons: 0,
    documentsCount: 4,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: true,
  },
  {
    id: "np-7",
    title: "Program Development",
    description: "Designing and implementing effective nonprofit programs",
    icon: <Building className="w-5 h-5" />,
    lessonsCount: 6,
    completedLessons: 0,
    documentsCount: 5,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: true,
  },
  {
    id: "np-8",
    title: "Launch & Operations",
    description: "Final steps to launch your nonprofit and establish operations",
    icon: <Shield className="w-5 h-5" />,
    lessonsCount: 4,
    completedLessons: 0,
    documentsCount: 6,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: true,
  },
];

export function NonprofitSetupCourse() {
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);

  const completedModules = courseModules.filter(m => m.isCompleted).length;
  const totalLessons = courseModules.reduce((sum, m) => sum + m.lessonsCount, 0);
  const completedLessons = courseModules.reduce((sum, m) => sum + m.completedLessons, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  const handleOpenModule = (module: CourseModule) => {
    if (module.isLocked) {
      toast.error("Complete previous modules to unlock");
      return;
    }
    toast.success(`Opening: ${module.title}`);
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-white/20 rounded-xl">
            <Heart className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Nonprofit Setup Course</h1>
            <p className="text-pink-100">Start Your 501(c)(3) Organization</p>
          </div>
        </div>
        <p className="text-pink-100 mb-6">
          Complete guide to establishing a tax-exempt nonprofit organization from mission to launch.
        </p>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{overallProgress}%</p>
            <p className="text-sm text-pink-100">Complete</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{completedModules}/{courseModules.length}</p>
            <p className="text-sm text-pink-100">Modules</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{completedLessons}/{totalLessons}</p>
            <p className="text-sm text-pink-100">Lessons</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{courseModules.reduce((sum, m) => sum + m.documentsCount, 0)}</p>
            <p className="text-sm text-pink-100">Resources</p>
          </div>
        </div>
      </div>

      {/* Course Modules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Modules</h2>
        {courseModules.map((module, index) => (
          <Card 
            key={module.id}
            className={`transition-all ${module.isLocked ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'}`}
            onClick={() => handleOpenModule(module)}
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    module.isCompleted 
                      ? 'bg-green-100 text-green-700' 
                      : module.isLocked 
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-pink-100 text-pink-700'
                  }`}>
                    {module.isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : module.isLocked ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      module.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Module {index + 1}</span>
                      {module.quizPassed && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <Award className="w-3 h-3 mr-1" />
                          Certified
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{module.completedLessons}/{module.lessonsCount} lessons</span>
                      <span>{module.documentsCount} resources</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {!module.isLocked && (
                    <Progress 
                      value={(module.completedLessons / module.lessonsCount) * 100} 
                      className="w-24 h-2" 
                    />
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Key Documents Included
          </CardTitle>
          <CardDescription>Essential templates and guides for nonprofit formation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Articles of Incorporation Template",
              "Bylaws Template",
              "Form 1023 Checklist",
              "Board Meeting Minutes Template",
              "Conflict of Interest Policy",
              "Gift Acceptance Policy",
              "Fundraising Plan Template",
              "Form 990 Preparation Guide",
            ].map((doc, i) => (
              <div key={i} className="p-3 border rounded-lg text-sm hover:bg-muted/50 cursor-pointer transition-colors">
                <FileText className="w-4 h-4 mb-2 text-pink-600" />
                {doc}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NonprofitSetupCourse;
