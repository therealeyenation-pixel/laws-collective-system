import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Shield,
  FileText,
  Scale,
  Users,
  Lock,
  CheckCircle,
  Clock,
  ChevronRight,
  Award,
  BookOpen,
  Home,
  DollarSign,
  Heart,
  Key,
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
    id: "trust-1",
    title: "Trust Fundamentals",
    description: "Understanding trusts, their purposes, and how they work",
    icon: <Shield className="w-5 h-5" />,
    lessonsCount: 6,
    completedLessons: 6,
    documentsCount: 4,
    hasQuiz: true,
    quizPassed: true,
    isCompleted: true,
    isLocked: false,
  },
  {
    id: "trust-2",
    title: "Types of Trusts",
    description: "Revocable, irrevocable, living trusts, and special purpose trusts",
    icon: <BookOpen className="w-5 h-5" />,
    lessonsCount: 8,
    completedLessons: 8,
    documentsCount: 6,
    hasQuiz: true,
    quizPassed: true,
    isCompleted: true,
    isLocked: false,
  },
  {
    id: "trust-3",
    title: "Choosing the Right Trust",
    description: "Selecting the appropriate trust structure for your goals",
    icon: <Key className="w-5 h-5" />,
    lessonsCount: 5,
    completedLessons: 3,
    documentsCount: 4,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: false,
  },
  {
    id: "trust-4",
    title: "Trust Document Drafting",
    description: "Creating comprehensive trust documents and provisions",
    icon: <FileText className="w-5 h-5" />,
    lessonsCount: 7,
    completedLessons: 0,
    documentsCount: 8,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: false,
  },
  {
    id: "trust-5",
    title: "Funding Your Trust",
    description: "Transferring assets into your trust properly",
    icon: <DollarSign className="w-5 h-5" />,
    lessonsCount: 6,
    completedLessons: 0,
    documentsCount: 5,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: false,
  },
  {
    id: "trust-6",
    title: "Real Estate in Trusts",
    description: "Transferring and managing property within trusts",
    icon: <Home className="w-5 h-5" />,
    lessonsCount: 5,
    completedLessons: 0,
    documentsCount: 4,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: true,
  },
  {
    id: "trust-7",
    title: "Trust Administration",
    description: "Managing trust assets and fulfilling trustee duties",
    icon: <Users className="w-5 h-5" />,
    lessonsCount: 6,
    completedLessons: 0,
    documentsCount: 5,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: true,
  },
  {
    id: "trust-8",
    title: "Tax Planning with Trusts",
    description: "Understanding trust taxation and planning strategies",
    icon: <Scale className="w-5 h-5" />,
    lessonsCount: 7,
    completedLessons: 0,
    documentsCount: 4,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: true,
  },
  {
    id: "trust-9",
    title: "Legacy & Succession Planning",
    description: "Multi-generational wealth transfer and family governance",
    icon: <Heart className="w-5 h-5" />,
    lessonsCount: 5,
    completedLessons: 0,
    documentsCount: 6,
    hasQuiz: true,
    quizPassed: null,
    isCompleted: false,
    isLocked: true,
  },
];

export function TrustSetupCourse() {
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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-white/20 rounded-xl">
            <Shield className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Trust Setup Course</h1>
            <p className="text-emerald-100">Asset Protection & Legacy Planning</p>
          </div>
        </div>
        <p className="text-emerald-100 mb-6">
          Comprehensive guide to establishing trusts for asset protection, estate planning, and generational wealth transfer.
        </p>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{overallProgress}%</p>
            <p className="text-sm text-emerald-100">Complete</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{completedModules}/{courseModules.length}</p>
            <p className="text-sm text-emerald-100">Modules</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{completedLessons}/{totalLessons}</p>
            <p className="text-sm text-emerald-100">Lessons</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{courseModules.reduce((sum, m) => sum + m.documentsCount, 0)}</p>
            <p className="text-sm text-emerald-100">Resources</p>
          </div>
        </div>
      </div>

      {/* Trust Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Trust Types Covered</CardTitle>
          <CardDescription>Learn about different trust structures and their applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Revocable Living Trust", desc: "Flexible, can be modified" },
              { name: "Irrevocable Trust", desc: "Asset protection focus" },
              { name: "Family Trust", desc: "Multi-generational planning" },
              { name: "Special Needs Trust", desc: "Care for dependents" },
              { name: "Charitable Trust", desc: "Philanthropic giving" },
              { name: "Land Trust", desc: "Real estate privacy" },
              { name: "CALEA Trust", desc: "Lineage protection" },
              { name: "Dynasty Trust", desc: "Perpetual wealth transfer" },
            ].map((trust, i) => (
              <div key={i} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-medium text-sm">{trust.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{trust.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                        : 'bg-emerald-100 text-emerald-700'
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
          <CardDescription>Essential templates and guides for trust formation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Revocable Trust Template",
              "Trust Amendment Form",
              "Certificate of Trust",
              "Trustee Acceptance Form",
              "Asset Schedule Template",
              "Deed Transfer Guide",
              "Trust Funding Checklist",
              "Successor Trustee Guide",
            ].map((doc, i) => (
              <div key={i} className="p-3 border rounded-lg text-sm hover:bg-muted/50 cursor-pointer transition-colors">
                <FileText className="w-4 h-4 mb-2 text-emerald-600" />
                {doc}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TrustSetupCourse;
