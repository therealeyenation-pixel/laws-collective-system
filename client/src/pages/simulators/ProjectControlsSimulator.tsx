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
  ClipboardList, Calendar, BarChart3, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  AlertTriangle, DollarSign, Users, Clock
} from "lucide-react";

const PROJECT_MODULES = [
  {
    id: "project-basics",
    title: "Project Management Basics",
    description: "Understand fundamental project management concepts.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is a project?", options: ["Ongoing operations", "Temporary endeavor with defined start and end", "Daily tasks", "Routine work"], correct: 1 },
      { question: "What are the triple constraints?", options: ["Time, cost, quality", "Scope, time, cost", "People, process, technology", "Plan, do, check"], correct: 1 },
      { question: "What is a project charter?", options: ["Team list", "Document authorizing project and defining objectives", "Budget report", "Schedule"], correct: 1 }
    ]
  },
  {
    id: "scheduling",
    title: "Project Scheduling",
    description: "Learn to create and manage project schedules.",
    duration: "30 min",
    tokensReward: 200,
    quiz: [
      { question: "What is a Gantt chart?", options: ["Pie chart", "Bar chart showing project schedule over time", "Organization chart", "Flow chart"], correct: 1 },
      { question: "What is the critical path?", options: ["Shortest path", "Longest sequence of dependent tasks determining minimum duration", "Most important tasks", "Emergency route"], correct: 1 },
      { question: "What is float/slack?", options: ["Extra budget", "Time a task can be delayed without affecting project end date", "Team vacation", "Buffer stock"], correct: 1 }
    ]
  },
  {
    id: "cost-control",
    title: "Cost Control",
    description: "Monitor and control project costs.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is Earned Value Management (EVM)?", options: ["Salary calculation", "Method to measure project performance against plan", "Stock valuation", "Bonus system"], correct: 1 },
      { question: "What does CPI measure?", options: ["Consumer prices", "Cost efficiency (EV/AC)", "Schedule performance", "Quality"], correct: 1 },
      { question: "What is a cost baseline?", options: ["Minimum cost", "Approved time-phased budget", "Actual spending", "Estimated cost"], correct: 1 }
    ]
  },
  {
    id: "risk-management",
    title: "Risk Management",
    description: "Identify and manage project risks.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is a risk register?", options: ["Insurance document", "Document listing identified risks and responses", "Safety checklist", "Compliance form"], correct: 1 },
      { question: "What is risk mitigation?", options: ["Ignoring risks", "Actions to reduce probability or impact of risks", "Transferring all risks", "Accepting all risks"], correct: 1 },
      { question: "How is risk priority calculated?", options: ["Random", "Probability × Impact", "Cost only", "Time only"], correct: 1 }
    ]
  },
  {
    id: "progress-reporting",
    title: "Progress Reporting",
    description: "Track and report project progress effectively.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is percent complete?", options: ["Budget spent", "Portion of work finished vs total work", "Time elapsed", "Team size"], correct: 1 },
      { question: "What is a status report?", options: ["Final report", "Regular update on project health and progress", "Financial statement", "Risk assessment"], correct: 1 },
      { question: "What is a milestone?", options: ["Distance marker", "Significant point or event in project timeline", "Team meeting", "Budget checkpoint"], correct: 1 }
    ]
  },
  {
    id: "resource-management",
    title: "Resource Management",
    description: "Allocate and manage project resources.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is resource leveling?", options: ["Firing staff", "Adjusting schedule to resolve resource conflicts", "Hiring more people", "Budget balancing"], correct: 1 },
      { question: "What is resource utilization?", options: ["Resource waste", "Percentage of time resources are productively used", "Resource cost", "Resource count"], correct: 1 },
      { question: "What causes resource conflicts?", options: ["Too many resources", "Multiple tasks needing same resource simultaneously", "Low budget", "Poor planning only"], correct: 1 }
    ]
  }
];

const EVM_METRICS = [
  { metric: "PV (Planned Value)", formula: "Budgeted cost of work scheduled", desc: "What should have been done" },
  { metric: "EV (Earned Value)", formula: "Budgeted cost of work performed", desc: "What was actually accomplished" },
  { metric: "AC (Actual Cost)", formula: "Actual cost of work performed", desc: "What was actually spent" },
  { metric: "SV (Schedule Variance)", formula: "EV - PV", desc: "Positive = ahead, Negative = behind" },
  { metric: "CV (Cost Variance)", formula: "EV - AC", desc: "Positive = under budget, Negative = over" },
  { metric: "SPI (Schedule Performance)", formula: "EV / PV", desc: ">1 = ahead, <1 = behind" },
  { metric: "CPI (Cost Performance)", formula: "EV / AC", desc: ">1 = under budget, <1 = over" },
  { metric: "EAC (Estimate at Completion)", formula: "BAC / CPI", desc: "Projected total cost" },
];

export default function ProjectControlsSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = PROJECT_MODULES[currentModule];
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
    if (currentModule < PROJECT_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / PROJECT_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
              Project Controls Simulator
            </h1>
            <p className="text-muted-foreground">Master project management and controls</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-indigo-600 border-indigo-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/project-controls"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{PROJECT_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="evm"><BarChart3 className="w-4 h-4 mr-2" />EVM</TabsTrigger>
            <TabsTrigger value="schedule"><Calendar className="w-4 h-4 mr-2" />Schedule</TabsTrigger>
            <TabsTrigger value="risk"><AlertTriangle className="w-4 h-4 mr-2" />Risk</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {PROJECT_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-indigo-500' : ''} ${isCompleted ? 'bg-indigo-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-indigo-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-indigo-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < PROJECT_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evm">
            <Card>
              <CardHeader>
                <CardTitle>Earned Value Management Metrics</CardTitle>
                <CardDescription>Key formulas for measuring project performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EVM_METRICS.map((metric) => (
                    <div key={metric.metric} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium">{metric.metric}</span>
                      </div>
                      <div className="p-2 bg-muted/50 rounded font-mono text-sm mb-2">{metric.formula}</div>
                      <p className="text-xs text-muted-foreground">{metric.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600" />Schedule Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { element: "Work Breakdown Structure", desc: "Hierarchical decomposition of project scope" },
                    { element: "Activity List", desc: "All tasks required to complete project" },
                    { element: "Dependencies", desc: "Relationships between activities" },
                    { element: "Duration Estimates", desc: "Time required for each activity" },
                    { element: "Critical Path", desc: "Longest path determining project duration" },
                    { element: "Milestones", desc: "Key checkpoints and deliverables" },
                  ].map((item) => (
                    <div key={item.element} className="p-2 border-l-4 border-indigo-500 pl-3">
                      <p className="font-medium text-sm">{item.element}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600" />Resource Planning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Identify required skills and roles",
                    "Estimate resource quantities",
                    "Create resource calendar",
                    "Assign resources to activities",
                    "Level resources to resolve conflicts",
                    "Monitor utilization rates",
                    "Adjust for availability changes",
                    "Track actual vs planned hours",
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />{step}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-indigo-600" />Risk Response Strategies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { strategy: "Avoid", desc: "Eliminate the threat entirely", example: "Change project scope" },
                    { strategy: "Mitigate", desc: "Reduce probability or impact", example: "Add testing phases" },
                    { strategy: "Transfer", desc: "Shift risk to third party", example: "Insurance, contracts" },
                    { strategy: "Accept", desc: "Acknowledge and prepare", example: "Contingency reserves" },
                  ].map((item) => (
                    <div key={item.strategy} className="p-3 border rounded-lg">
                      <p className="font-medium">{item.strategy}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                      <Badge variant="outline" className="mt-1 text-xs">{item.example}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-1 text-center text-xs">
                    <div></div>
                    <div className="font-medium p-2">Low Impact</div>
                    <div className="font-medium p-2">Med Impact</div>
                    <div className="font-medium p-2">High Impact</div>
                    <div className="font-medium p-2">High Prob</div>
                    <div className="p-2 bg-yellow-100 rounded">Medium</div>
                    <div className="p-2 bg-orange-100 rounded">High</div>
                    <div className="p-2 bg-red-100 rounded">Critical</div>
                    <div className="font-medium p-2">Med Prob</div>
                    <div className="p-2 bg-green-100 rounded">Low</div>
                    <div className="p-2 bg-yellow-100 rounded">Medium</div>
                    <div className="p-2 bg-orange-100 rounded">High</div>
                    <div className="font-medium p-2">Low Prob</div>
                    <div className="p-2 bg-green-100 rounded">Low</div>
                    <div className="p-2 bg-green-100 rounded">Low</div>
                    <div className="p-2 bg-yellow-100 rounded">Medium</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
