import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Settings, Users, Shield, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  Key, Database, Activity, Lock
} from "lucide-react";

const PLATFORM_MODULES = [
  {
    id: "admin-basics",
    title: "Platform Administration Basics",
    description: "Understand fundamental platform administration concepts.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is platform administration?", options: ["Using software", "Managing and maintaining platform infrastructure and users", "Writing code", "Customer support"], correct: 1 },
      { question: "What is user provisioning?", options: ["User complaints", "Creating and managing user accounts and access", "User training", "User feedback"], correct: 1 },
      { question: "Why is access control important?", options: ["Not important", "Ensures users only access what they need", "Makes login harder", "Slows system"], correct: 1 }
    ]
  },
  {
    id: "user-management",
    title: "User Management",
    description: "Manage users, roles, and permissions effectively.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is role-based access control (RBAC)?", options: ["Random access", "Access based on user's role in organization", "No access control", "Full access for all"], correct: 1 },
      { question: "What is the principle of least privilege?", options: ["Maximum access", "Users get minimum access needed for their job", "No access", "Admin access for all"], correct: 1 },
      { question: "What should happen when an employee leaves?", options: ["Nothing", "Immediately disable/remove their access", "Keep access active", "Share their password"], correct: 1 }
    ]
  },
  {
    id: "security",
    title: "Platform Security",
    description: "Implement and maintain platform security.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is multi-factor authentication (MFA)?", options: ["Single password", "Using multiple verification methods", "No authentication", "Shared passwords"], correct: 1 },
      { question: "What is an audit log?", options: ["Music record", "Record of system activities and changes", "User complaints", "Error messages"], correct: 1 },
      { question: "What is session management?", options: ["Meeting scheduling", "Controlling user login sessions and timeouts", "Project management", "Time tracking"], correct: 1 }
    ]
  },
  {
    id: "configuration",
    title: "System Configuration",
    description: "Configure platform settings and features.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is a configuration file?", options: ["User document", "File containing system settings and parameters", "Log file", "Backup file"], correct: 1 },
      { question: "Why document configuration changes?", options: ["Not necessary", "For troubleshooting and compliance", "Wastes time", "Only for audits"], correct: 1 },
      { question: "What is a staging environment?", options: ["Production", "Test environment mirroring production", "Development only", "User training"], correct: 1 }
    ]
  },
  {
    id: "monitoring",
    title: "System Monitoring",
    description: "Monitor platform health and performance.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is system monitoring?", options: ["Watching screens", "Tracking system health, performance, and availability", "User surveillance", "Code review"], correct: 1 },
      { question: "What is an alert threshold?", options: ["Volume level", "Value triggering notification when exceeded", "User limit", "File size"], correct: 1 },
      { question: "What is uptime?", options: ["Wake up time", "Percentage of time system is operational", "Work hours", "Response time"], correct: 1 }
    ]
  },
  {
    id: "backup-recovery",
    title: "Backup & Recovery",
    description: "Implement backup and disaster recovery procedures.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is a backup?", options: ["Extra employee", "Copy of data for recovery purposes", "System upgrade", "New feature"], correct: 1 },
      { question: "What is RTO (Recovery Time Objective)?", options: ["Random time", "Maximum acceptable downtime after failure", "Regular time off", "Response time"], correct: 1 },
      { question: "How often should backups be tested?", options: ["Never", "Regularly to ensure they work when needed", "Only once", "Only after failures"], correct: 1 }
    ]
  }
];

const ACCESS_LEVELS = [
  { level: "Viewer", permissions: "Read-only access to data", use_case: "General staff, stakeholders" },
  { level: "Editor", permissions: "Create and modify content", use_case: "Content creators, analysts" },
  { level: "Manager", permissions: "Approve, assign, manage team", use_case: "Team leads, supervisors" },
  { level: "Admin", permissions: "Full system configuration", use_case: "IT administrators" },
  { level: "Super Admin", permissions: "All access including security", use_case: "System owners only" },
];

const SECURITY_CHECKLIST = [
  { category: "Authentication", items: ["MFA enabled", "Strong password policy", "Session timeouts configured"] },
  { category: "Authorization", items: ["RBAC implemented", "Least privilege enforced", "Regular access reviews"] },
  { category: "Monitoring", items: ["Audit logging enabled", "Alert thresholds set", "Regular log reviews"] },
  { category: "Data Protection", items: ["Encryption at rest", "Encryption in transit", "Backup procedures"] },
];

export default function PlatformSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = PLATFORM_MODULES[currentModule];
  const quiz = module?.quiz || [];
  const question = quiz[currentQuestion];

  const handleAnswerSelect = (index: number) => setSelectedAnswer(index);

  const handleNextQuestion = () => {
    if (selectedAnswer === null) { toast.error("Please select an answer"); return; }
    const isCorrect = selectedAnswer === question.correct;
    if (isCorrect) { setQuizScore(prev => prev + 1); toast.success("Correct!"); }
    else { toast.error(`Incorrect. The correct answer was: ${question.options[question.correct]}`); }

    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      const finalScore = quizScore + (isCorrect ? 1 : 0);
      const percentage = Math.round((finalScore / quiz.length) * 100);
      if (percentage >= 70) {
        setTotalTokensEarned(prev => prev + module.tokensReward);
        toast.success(`Module completed! You earned ${module.tokensReward} tokens!`);
      }
      setModuleProgress(prev => ({ ...prev, [module.id]: { completed: true, score: percentage } }));
      setShowResults(true);
    }
  };

  const handleNextModule = () => {
    if (currentModule < PLATFORM_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / PLATFORM_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 text-violet-600" />
              Platform Simulator
            </h1>
            <p className="text-muted-foreground">Master platform administration</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-violet-600 border-violet-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/platform-admin"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{PLATFORM_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="access"><Users className="w-4 h-4 mr-2" />Access Levels</TabsTrigger>
            <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
            <TabsTrigger value="monitoring"><Activity className="w-4 h-4 mr-2" />Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {PLATFORM_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-violet-500' : ''} ${isCompleted ? 'bg-violet-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-violet-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{mod.title}</p>
                            <p className="text-xs text-muted-foreground">{mod.duration} • {mod.tokensReward} tokens</p>
                            {progress?.score !== undefined && <Badge variant={progress.score >= 70 ? "default" : "secondary"} className="mt-1">Score: {progress.score}%</Badge>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-violet-600" />{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showResults ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between text-sm">
                          <span>Question {currentQuestion + 1} of {quiz.length}</span>
                          <Badge variant="outline">{quizScore} correct</Badge>
                        </div>
                        <Progress value={((currentQuestion + 1) / quiz.length) * 100} className="h-2" />
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="font-medium mb-4">{question?.question}</p>
                          <RadioGroup value={selectedAnswer?.toString()} onValueChange={(v) => handleAnswerSelect(parseInt(v))}>
                            {question?.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                        <Button onClick={handleNextQuestion} className="w-full">
                          {currentQuestion < quiz.length - 1 ? "Next Question" : "Complete Module"}<ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <div className="w-20 h-20 mx-auto bg-violet-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-violet-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-violet-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < PLATFORM_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Access Level Hierarchy</CardTitle>
                <CardDescription>Understanding role-based permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ACCESS_LEVELS.map((level, i) => (
                    <div key={level.level} className="p-4 border rounded-lg flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <Key className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{level.level}</span>
                          <Badge variant="outline" className="text-xs">{i + 1}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{level.permissions}</p>
                        <p className="text-xs text-muted-foreground mt-1">Use case: {level.use_case}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECURITY_CHECKLIST.map((category) => (
                <Card key={category.category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="w-4 h-4 text-violet-600" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-violet-600" />{item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-violet-600" />Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { metric: "Uptime", target: "99.9%", desc: "System availability" },
                    { metric: "Response Time", target: "<200ms", desc: "Average API response" },
                    { metric: "Error Rate", target: "<0.1%", desc: "Failed requests" },
                    { metric: "Active Users", target: "Monitor", desc: "Concurrent sessions" },
                    { metric: "Storage Usage", target: "<80%", desc: "Disk utilization" },
                  ].map((item) => (
                    <div key={item.metric} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <p className="font-medium text-sm">{item.metric}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Badge variant="outline">{item.target}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-violet-600" />Backup Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { type: "Full Backup", frequency: "Weekly", retention: "4 weeks" },
                    { type: "Incremental", frequency: "Daily", retention: "2 weeks" },
                    { type: "Transaction Logs", frequency: "Hourly", retention: "7 days" },
                    { type: "Configuration", frequency: "On change", retention: "Versioned" },
                  ].map((item) => (
                    <div key={item.type} className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">{item.type}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{item.frequency}</Badge>
                        <Badge variant="outline" className="text-xs">{item.retention}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
