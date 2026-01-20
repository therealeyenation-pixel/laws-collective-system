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
  Settings, Workflow, BarChart3, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  Cog, Timer, TrendingUp, Zap, ClipboardList, RefreshCw
} from "lucide-react";

const OPS_MODULES = [
  {
    id: "process-basics",
    title: "Process Design Fundamentals",
    description: "Learn to design efficient business processes from the ground up.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is the first step in process design?", options: ["Writing procedures", "Identifying the process goal and scope", "Training employees", "Buying software"], correct: 1 },
      { question: "What is a process map?", options: ["A GPS for the office", "Visual representation of workflow steps", "Employee directory", "Financial report"], correct: 1 },
      { question: "What does 'bottleneck' mean in operations?", options: ["A type of container", "A point where flow is restricted", "A management style", "A reward system"], correct: 1 }
    ]
  },
  {
    id: "sop-creation",
    title: "Standard Operating Procedures",
    description: "Create clear, effective SOPs that ensure consistency.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is the main purpose of an SOP?", options: ["Legal protection only", "Ensure consistent, quality outcomes", "Reduce employee count", "Impress clients"], correct: 1 },
      { question: "What should an SOP include?", options: ["Only the final outcome", "Step-by-step instructions, responsibilities, and standards", "Employee salaries", "Company history"], correct: 1 },
      { question: "How often should SOPs be reviewed?", options: ["Never", "Regularly and when processes change", "Only when problems occur", "Every 10 years"], correct: 1 }
    ]
  },
  {
    id: "efficiency",
    title: "Operational Efficiency",
    description: "Identify and eliminate waste to improve productivity.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What are the '8 wastes' in Lean methodology?", options: ["Types of trash", "Categories of inefficiency (defects, overproduction, waiting, etc.)", "Employee mistakes", "Budget categories"], correct: 1 },
      { question: "What is 'cycle time'?", options: ["Time for a bicycle ride", "Time to complete one unit of work", "Employee break time", "Annual review period"], correct: 1 },
      { question: "What is the 5S methodology?", options: ["5 types of sales", "Sort, Set in order, Shine, Standardize, Sustain", "5 management levels", "5 product categories"], correct: 1 }
    ]
  },
  {
    id: "metrics",
    title: "Operational Metrics & KPIs",
    description: "Measure what matters to drive continuous improvement.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What does KPI stand for?", options: ["Key Process Information", "Key Performance Indicator", "Knowledge Process Integration", "Key Personnel Index"], correct: 1 },
      { question: "What is 'throughput'?", options: ["Employee turnover", "Amount of work completed in a time period", "Profit margin", "Customer complaints"], correct: 1 },
      { question: "What is a 'leading indicator'?", options: ["The first employee hired", "A metric that predicts future performance", "The highest sales number", "A management title"], correct: 1 }
    ]
  },
  {
    id: "continuous-improvement",
    title: "Continuous Improvement",
    description: "Build a culture of ongoing operational excellence.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is Kaizen?", options: ["A martial art", "Japanese philosophy of continuous improvement", "A software tool", "A management title"], correct: 1 },
      { question: "What is PDCA?", options: ["A certification", "Plan-Do-Check-Act cycle", "A software system", "A type of report"], correct: 1 },
      { question: "What is a 'root cause analysis'?", options: ["Gardening technique", "Method to identify the underlying cause of problems", "Financial audit", "Employee review"], correct: 1 }
    ]
  },
  {
    id: "resource-planning",
    title: "Resource Planning",
    description: "Optimize allocation of people, time, and materials.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is capacity planning?", options: ["Office space design", "Determining resources needed to meet demand", "Employee headcount", "Budget allocation"], correct: 1 },
      { question: "What is 'utilization rate'?", options: ["How often equipment breaks", "Percentage of available time actually used productively", "Employee satisfaction", "Customer return rate"], correct: 1 },
      { question: "What is the purpose of demand forecasting?", options: ["Predict weather", "Anticipate future resource needs", "Track past sales", "Set employee schedules"], correct: 1 }
    ]
  }
];

const PROCESS_TEMPLATES = [
  { name: "Customer Onboarding", steps: ["Initial contact", "Needs assessment", "Proposal/Quote", "Contract signing", "Account setup", "Welcome package", "Training/Orientation", "First check-in"] },
  { name: "Order Fulfillment", steps: ["Order received", "Payment verification", "Inventory check", "Pick & pack", "Quality check", "Shipping", "Tracking notification", "Delivery confirmation"] },
  { name: "Employee Onboarding", steps: ["Offer acceptance", "Pre-boarding paperwork", "Workspace setup", "Day 1 orientation", "Training schedule", "Team introductions", "30-day check-in", "90-day review"] },
  { name: "Project Delivery", steps: ["Project kickoff", "Requirements gathering", "Planning & scheduling", "Execution", "Quality assurance", "Client review", "Revisions", "Final delivery"] },
];

const EFFICIENCY_METRICS = [
  { metric: "Cycle Time", description: "Time to complete one unit of work", target: "Minimize", formula: "End time - Start time" },
  { metric: "Throughput", description: "Units completed per time period", target: "Maximize", formula: "Units / Time period" },
  { metric: "Utilization Rate", description: "Productive time vs available time", target: "80-85%", formula: "(Productive hours / Available hours) × 100" },
  { metric: "First Pass Yield", description: "Units completed correctly first time", target: ">95%", formula: "(Good units / Total units) × 100" },
  { metric: "On-Time Delivery", description: "Orders delivered by promised date", target: ">98%", formula: "(On-time orders / Total orders) × 100" },
  { metric: "Cost per Unit", description: "Total cost to produce one unit", target: "Minimize", formula: "Total costs / Units produced" },
];

export default function OperationsSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);
  const [selectedProcess, setSelectedProcess] = useState(PROCESS_TEMPLATES[0]);

  const module = OPS_MODULES[currentModule];
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
    if (currentModule < OPS_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / OPS_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 text-orange-600" />
              Operations Simulator
            </h1>
            <p className="text-muted-foreground">Master operational excellence</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/operations"><ArrowLeft className="w-4 h-4 mr-2" />Back to Operations</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{OPS_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="processes"><Workflow className="w-4 h-4 mr-2" />Processes</TabsTrigger>
            <TabsTrigger value="metrics"><BarChart3 className="w-4 h-4 mr-2" />Metrics</TabsTrigger>
            <TabsTrigger value="improvement"><RefreshCw className="w-4 h-4 mr-2" />Improvement</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Modules</h3>
                {OPS_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-orange-500' : ''} ${isCompleted ? 'bg-orange-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-orange-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-orange-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < OPS_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="processes">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Workflow className="w-5 h-5 text-orange-600" />Process Templates</CardTitle>
                  <CardDescription>Learn from common business process workflows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {PROCESS_TEMPLATES.map((process) => (
                    <div key={process.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedProcess.name === process.name ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-muted/50'}`}
                      onClick={() => setSelectedProcess(process)}>
                      <p className="font-medium">{process.name}</p>
                      <p className="text-sm text-muted-foreground">{process.steps.length} steps</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-orange-600" />{selectedProcess.name}</CardTitle>
                  <CardDescription>Step-by-step process flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedProcess.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                        </div>
                        <div className="flex-1 p-2 bg-muted/50 rounded">{step}</div>
                        {index < selectedProcess.steps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EFFICIENCY_METRICS.map((item) => (
                <Card key={item.metric}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      {item.metric}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="p-2 bg-muted/50 rounded text-xs font-mono">{item.formula}</div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">Target: {item.target}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="improvement">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-orange-600" />PDCA Cycle</CardTitle>
                  <CardDescription>Plan-Do-Check-Act continuous improvement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { phase: "Plan", description: "Identify opportunity, analyze current state, develop improvement plan", color: "bg-blue-100 text-blue-700" },
                    { phase: "Do", description: "Implement the plan on a small scale, document results", color: "bg-green-100 text-green-700" },
                    { phase: "Check", description: "Analyze results, compare to expected outcomes, identify gaps", color: "bg-yellow-100 text-yellow-700" },
                    { phase: "Act", description: "Standardize successful changes or restart cycle with new approach", color: "bg-red-100 text-red-700" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="font-bold">{item.phase}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.phase}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Cog className="w-5 h-5 text-orange-600" />5S Methodology</CardTitle>
                  <CardDescription>Workplace organization system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { s: "Sort", japanese: "Seiri", description: "Remove unnecessary items from the workspace" },
                    { s: "Set in Order", japanese: "Seiton", description: "Organize remaining items for easy access" },
                    { s: "Shine", japanese: "Seiso", description: "Clean and inspect the workspace regularly" },
                    { s: "Standardize", japanese: "Seiketsu", description: "Create consistent procedures and standards" },
                    { s: "Sustain", japanese: "Shitsuke", description: "Maintain and continuously improve the system" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-orange-600">{i + 1}S</Badge>
                        <span className="font-medium">{item.s}</span>
                        <span className="text-xs text-muted-foreground">({item.japanese})</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
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
