import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Building,
  FileText,
  Scale,
  DollarSign,
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
  Lightbulb,
  Target,
} from "lucide-react";

interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  documents: Document[];
  quiz: Quiz | null;
  isCompleted: boolean;
  isLocked: boolean;
}

interface Lesson {
  id: string;
  title: string;
  type: "video" | "reading" | "interactive" | "worksheet";
  duration: string;
  isCompleted: boolean;
}

interface Document {
  id: string;
  name: string;
  type: "template" | "checklist" | "guide" | "form";
  description: string;
}

interface Quiz {
  id: string;
  questions: number;
  passingScore: number;
  score: number | null;
  passed: boolean | null;
}

const courseModules: CourseModule[] = [
  {
    id: "module-1",
    title: "Business Foundation & Planning",
    description: "Define your business idea, target market, and create a solid business plan",
    lessons: [
      { id: "1-1", title: "Identifying Your Business Idea", type: "video", duration: "15 min", isCompleted: true },
      { id: "1-2", title: "Market Research Fundamentals", type: "reading", duration: "20 min", isCompleted: true },
      { id: "1-3", title: "Writing Your Business Plan", type: "interactive", duration: "45 min", isCompleted: true },
      { id: "1-4", title: "Business Plan Worksheet", type: "worksheet", duration: "30 min", isCompleted: true },
    ],
    documents: [
      { id: "d1-1", name: "Business Plan Template", type: "template", description: "Comprehensive business plan outline" },
      { id: "d1-2", name: "Market Research Checklist", type: "checklist", description: "Steps for conducting market research" },
    ],
    quiz: { id: "q1", questions: 10, passingScore: 70, score: 90, passed: true },
    isCompleted: true,
    isLocked: false,
  },
  {
    id: "module-2",
    title: "Choosing Your Business Structure",
    description: "Understand different entity types and choose the right structure for your business",
    lessons: [
      { id: "2-1", title: "Sole Proprietorship vs LLC", type: "video", duration: "20 min", isCompleted: true },
      { id: "2-2", title: "Corporation Types Explained", type: "video", duration: "25 min", isCompleted: true },
      { id: "2-3", title: "Tax Implications by Entity", type: "reading", duration: "30 min", isCompleted: false },
      { id: "2-4", title: "Entity Selection Worksheet", type: "worksheet", duration: "20 min", isCompleted: false },
    ],
    documents: [
      { id: "d2-1", name: "Entity Comparison Chart", type: "guide", description: "Side-by-side comparison of business structures" },
      { id: "d2-2", name: "LLC Formation Checklist", type: "checklist", description: "Steps to form an LLC" },
    ],
    quiz: { id: "q2", questions: 15, passingScore: 70, score: null, passed: null },
    isCompleted: false,
    isLocked: false,
  },
  {
    id: "module-3",
    title: "Legal Requirements & Registration",
    description: "Register your business, obtain licenses, and meet legal requirements",
    lessons: [
      { id: "3-1", title: "State Registration Process", type: "video", duration: "15 min", isCompleted: false },
      { id: "3-2", title: "EIN and Tax Registration", type: "interactive", duration: "20 min", isCompleted: false },
      { id: "3-3", title: "Business Licenses & Permits", type: "reading", duration: "25 min", isCompleted: false },
      { id: "3-4", title: "Compliance Checklist Review", type: "worksheet", duration: "15 min", isCompleted: false },
    ],
    documents: [
      { id: "d3-1", name: "Registration Checklist", type: "checklist", description: "Complete registration requirements" },
      { id: "d3-2", name: "License Requirements by State", type: "guide", description: "State-specific licensing guide" },
      { id: "d3-3", name: "EIN Application Guide", type: "guide", description: "How to apply for an EIN" },
    ],
    quiz: { id: "q3", questions: 12, passingScore: 70, score: null, passed: null },
    isCompleted: false,
    isLocked: false,
  },
  {
    id: "module-4",
    title: "Financial Setup & Banking",
    description: "Set up business banking, accounting systems, and financial foundations",
    lessons: [
      { id: "4-1", title: "Opening a Business Bank Account", type: "video", duration: "15 min", isCompleted: false },
      { id: "4-2", title: "Accounting Basics for Business", type: "reading", duration: "30 min", isCompleted: false },
      { id: "4-3", title: "Setting Up QuickBooks", type: "interactive", duration: "45 min", isCompleted: false },
      { id: "4-4", title: "Financial Projections Worksheet", type: "worksheet", duration: "40 min", isCompleted: false },
    ],
    documents: [
      { id: "d4-1", name: "Banking Comparison Guide", type: "guide", description: "Compare business bank accounts" },
      { id: "d4-2", name: "Chart of Accounts Template", type: "template", description: "Standard business chart of accounts" },
      { id: "d4-3", name: "Financial Projections Template", type: "template", description: "3-year financial projection spreadsheet" },
    ],
    quiz: { id: "q4", questions: 10, passingScore: 70, score: null, passed: null },
    isCompleted: false,
    isLocked: true,
  },
  {
    id: "module-5",
    title: "Insurance & Asset Protection",
    description: "Protect your business with proper insurance and asset protection strategies",
    lessons: [
      { id: "5-1", title: "Business Insurance Types", type: "video", duration: "20 min", isCompleted: false },
      { id: "5-2", title: "Liability Protection Strategies", type: "reading", duration: "25 min", isCompleted: false },
      { id: "5-3", title: "Insurance Shopping Guide", type: "interactive", duration: "30 min", isCompleted: false },
    ],
    documents: [
      { id: "d5-1", name: "Insurance Needs Assessment", type: "checklist", description: "Determine your insurance needs" },
      { id: "d5-2", name: "Asset Protection Strategies", type: "guide", description: "Legal strategies for asset protection" },
    ],
    quiz: { id: "q5", questions: 8, passingScore: 70, score: null, passed: null },
    isCompleted: false,
    isLocked: true,
  },
  {
    id: "module-6",
    title: "Launch & Operations",
    description: "Final steps to launch your business and establish operations",
    lessons: [
      { id: "6-1", title: "Pre-Launch Checklist Review", type: "interactive", duration: "30 min", isCompleted: false },
      { id: "6-2", title: "Setting Up Operations", type: "video", duration: "25 min", isCompleted: false },
      { id: "6-3", title: "First 90 Days Action Plan", type: "worksheet", duration: "45 min", isCompleted: false },
    ],
    documents: [
      { id: "d6-1", name: "Launch Checklist", type: "checklist", description: "Complete pre-launch checklist" },
      { id: "d6-2", name: "90-Day Action Plan Template", type: "template", description: "First quarter business plan" },
      { id: "d6-3", name: "Operations Manual Template", type: "template", description: "Standard operating procedures" },
    ],
    quiz: { id: "q6", questions: 10, passingScore: 70, score: null, passed: null },
    isCompleted: false,
    isLocked: true,
  },
];

export function BusinessSetupCourse() {
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [activeTab, setActiveTab] = useState("lessons");

  const completedModules = courseModules.filter(m => m.isCompleted).length;
  const totalLessons = courseModules.flatMap(m => m.lessons).length;
  const completedLessons = courseModules.flatMap(m => m.lessons).filter(l => l.isCompleted).length;
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video": return <Play className="w-4 h-4" />;
      case "reading": return <BookOpen className="w-4 h-4" />;
      case "interactive": return <Lightbulb className="w-4 h-4" />;
      case "worksheet": return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "template": return <FileText className="w-4 h-4" />;
      case "checklist": return <CheckCircle className="w-4 h-4" />;
      case "guide": return <BookOpen className="w-4 h-4" />;
      case "form": return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleStartLesson = (lesson: Lesson) => {
    toast.success(`Starting: ${lesson.title}`);
  };

  const handleDownloadDocument = (doc: Document) => {
    toast.success(`Downloading: ${doc.name}`);
  };

  const handleTakeQuiz = (quiz: Quiz) => {
    toast.success("Starting quiz...");
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-white/20 rounded-xl">
            <Building className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Business Setup Course</h1>
            <p className="text-blue-100">Complete Guide to Starting Your Business</p>
          </div>
        </div>
        <p className="text-blue-100 mb-6">
          Learn everything you need to legally establish and launch your business, from planning to operations.
        </p>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{overallProgress}%</p>
            <p className="text-sm text-blue-100">Complete</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{completedModules}/{courseModules.length}</p>
            <p className="text-sm text-blue-100">Modules</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{completedLessons}/{totalLessons}</p>
            <p className="text-sm text-blue-100">Lessons</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{courseModules.flatMap(m => m.documents).length}</p>
            <p className="text-sm text-blue-100">Resources</p>
          </div>
        </div>
      </div>

      {selectedModule ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedModule(null)}>
              ← Back to Course
            </Button>
            <Badge variant={selectedModule.isCompleted ? "default" : "outline"}>
              {selectedModule.isCompleted ? "Completed" : "In Progress"}
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{selectedModule.title}</CardTitle>
              <CardDescription>{selectedModule.description}</CardDescription>
              <Progress 
                value={(selectedModule.lessons.filter(l => l.isCompleted).length / selectedModule.lessons.length) * 100} 
                className="h-2 mt-4" 
              />
            </CardHeader>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="mt-4 space-y-3">
              {selectedModule.lessons.map((lesson, index) => (
                <Card key={lesson.id} className="hover:shadow-md transition-all">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          lesson.isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {lesson.isCompleted ? <CheckCircle className="w-5 h-5" /> : getLessonIcon(lesson.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant="outline" className="capitalize">{lesson.type}</Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant={lesson.isCompleted ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleStartLesson(lesson)}
                        className="gap-2"
                      >
                        {lesson.isCompleted ? "Review" : "Start"}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="documents" className="mt-4 space-y-3">
              {selectedModule.documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-all">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                          {getDocumentIcon(doc.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="quiz" className="mt-4">
              {selectedModule.quiz ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Module Quiz
                    </CardTitle>
                    <CardDescription>
                      Test your knowledge from this module
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold">{selectedModule.quiz.questions}</p>
                          <p className="text-sm text-muted-foreground">Questions</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold">{selectedModule.quiz.passingScore}%</p>
                          <p className="text-sm text-muted-foreground">Passing Score</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          {selectedModule.quiz.score !== null ? (
                            <>
                              <p className={`text-2xl font-bold ${selectedModule.quiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {selectedModule.quiz.score}%
                              </p>
                              <p className="text-sm text-muted-foreground">Your Score</p>
                            </>
                          ) : (
                            <>
                              <p className="text-2xl font-bold">--</p>
                              <p className="text-sm text-muted-foreground">Not Taken</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {selectedModule.quiz.passed !== null && (
                        <div className={`p-4 rounded-lg ${selectedModule.quiz.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <p className={`font-medium ${selectedModule.quiz.passed ? 'text-green-700' : 'text-red-700'}`}>
                            {selectedModule.quiz.passed ? '✓ Quiz Passed!' : '✗ Quiz Not Passed - Try Again'}
                          </p>
                        </div>
                      )}

                      <Button 
                        className="w-full gap-2"
                        onClick={() => handleTakeQuiz(selectedModule.quiz!)}
                      >
                        {selectedModule.quiz.score !== null ? 'Retake Quiz' : 'Start Quiz'}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p>No quiz available for this module</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Course Modules</h2>
          {courseModules.map((module, index) => (
            <Card 
              key={module.id}
              className={`transition-all ${module.isLocked ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'}`}
              onClick={() => !module.isLocked && setSelectedModule(module)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${
                      module.isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : module.isLocked 
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {module.isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : module.isLocked ? (
                        <Lock className="w-6 h-6" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          {module.lessons.filter(l => l.isCompleted).length}/{module.lessons.length} lessons
                        </span>
                        <span className="text-muted-foreground">
                          {module.documents.length} resources
                        </span>
                        {module.quiz && module.quiz.passed && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <Award className="w-3 h-3 mr-1" />
                            Quiz Passed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {!module.isLocked && (
                      <Progress 
                        value={(module.lessons.filter(l => l.isCompleted).length / module.lessons.length) * 100} 
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
      )}
    </div>
  );
}

export default BusinessSetupCourse;
