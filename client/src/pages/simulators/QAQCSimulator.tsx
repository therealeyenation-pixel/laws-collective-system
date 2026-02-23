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
  ClipboardCheck, Search, FileCheck, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  AlertTriangle, BarChart3, Shield, ListChecks
} from "lucide-react";

const QAQC_MODULES = [
  {
    id: "qa-basics",
    title: "Quality Assurance Basics",
    description: "Understand the fundamentals of quality assurance.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is Quality Assurance (QA)?", options: ["Testing products", "Process-oriented approach to prevent defects", "Fixing defects", "Customer complaints"], correct: 1 },
      { question: "What is the difference between QA and QC?", options: ["Same thing", "QA prevents defects; QC detects defects", "QC prevents; QA detects", "No difference"], correct: 1 },
      { question: "What is a quality management system?", options: ["Software only", "Formalized system documenting processes and procedures", "Testing equipment", "Customer feedback"], correct: 1 }
    ]
  },
  {
    id: "qc-fundamentals",
    title: "Quality Control Fundamentals",
    description: "Learn quality control inspection and testing.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is Quality Control (QC)?", options: ["Process improvement", "Product-oriented approach to identify defects", "Planning quality", "Training staff"], correct: 1 },
      { question: "What is an inspection?", options: ["Guessing", "Examining work to verify conformance to requirements", "Fixing problems", "Writing reports"], correct: 1 },
      { question: "What is a non-conformance?", options: ["Agreement", "Failure to meet specified requirements", "Approval", "Certification"], correct: 1 }
    ]
  },
  {
    id: "standards",
    title: "Quality Standards",
    description: "Understand quality standards and certifications.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is ISO 9001?", options: ["Safety standard", "Quality management system standard", "Environmental standard", "Financial standard"], correct: 1 },
      { question: "What is continuous improvement?", options: ["One-time fix", "Ongoing effort to improve processes and products", "Maintaining status quo", "Annual review"], correct: 1 },
      { question: "What is a quality policy?", options: ["Insurance", "Organization's commitment to quality", "Pricing strategy", "Marketing plan"], correct: 1 }
    ]
  },
  {
    id: "auditing",
    title: "Quality Auditing",
    description: "Conduct and manage quality audits.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is a quality audit?", options: ["Financial review", "Systematic examination of quality system", "Product testing", "Customer survey"], correct: 1 },
      { question: "What is an internal audit?", options: ["External review", "Audit conducted by organization's own staff", "Government inspection", "Customer audit"], correct: 1 },
      { question: "What is an audit finding?", options: ["Lost item", "Result of evaluating evidence against criteria", "Audit schedule", "Auditor name"], correct: 1 }
    ]
  },
  {
    id: "metrics",
    title: "Quality Metrics",
    description: "Measure and analyze quality performance.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is defect rate?", options: ["Speed of defects", "Number of defects per unit of measurement", "Cost of defects", "Defect color"], correct: 1 },
      { question: "What is First Pass Yield?", options: ["First harvest", "Percentage of units passing inspection first time", "Initial investment", "First customer"], correct: 1 },
      { question: "Why track quality metrics?", options: ["Not important", "To identify trends and drive improvement", "Legal requirement only", "For marketing"], correct: 1 }
    ]
  },
  {
    id: "corrective-actions",
    title: "Corrective & Preventive Actions",
    description: "Address and prevent quality issues.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is a corrective action?", options: ["Punishment", "Action to eliminate cause of detected nonconformity", "Ignoring problems", "Quick fix"], correct: 1 },
      { question: "What is a preventive action?", options: ["After the fact", "Action to eliminate cause of potential nonconformity", "Waiting for problems", "Insurance"], correct: 1 },
      { question: "What is root cause analysis?", options: ["Gardening", "Method to identify underlying cause of problem", "Surface-level fix", "Blame assignment"], correct: 1 }
    ]
  }
];

const QUALITY_TOOLS = [
  { tool: "Pareto Chart", use: "Identify most significant factors", principle: "80/20 rule" },
  { tool: "Fishbone Diagram", use: "Identify root causes", principle: "Cause and effect" },
  { tool: "Control Chart", use: "Monitor process stability", principle: "Statistical control" },
  { tool: "Histogram", use: "Show frequency distribution", principle: "Data visualization" },
  { tool: "Scatter Diagram", use: "Show relationship between variables", principle: "Correlation" },
  { tool: "Check Sheet", use: "Collect data systematically", principle: "Data collection" },
  { tool: "Flowchart", use: "Map process steps", principle: "Process visualization" },
];

const INSPECTION_CHECKLIST = [
  { category: "Documentation", items: ["Specifications available", "Procedures current", "Records complete"] },
  { category: "Materials", items: ["Certificates verified", "Storage proper", "Traceability maintained"] },
  { category: "Equipment", items: ["Calibration current", "Condition acceptable", "Maintenance up to date"] },
  { category: "Process", items: ["Procedures followed", "Parameters within limits", "Personnel qualified"] },
];

export default function QAQCSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = QAQC_MODULES[currentModule];
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
    if (currentModule < QAQC_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / QAQC_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-cyan-600" />
              QA/QC Simulator
            </h1>
            <p className="text-muted-foreground">Master quality assurance and control</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-cyan-600 border-cyan-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/qaqc"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{QAQC_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="tools"><BarChart3 className="w-4 h-4 mr-2" />7 QC Tools</TabsTrigger>
            <TabsTrigger value="inspection"><Search className="w-4 h-4 mr-2" />Inspection</TabsTrigger>
            <TabsTrigger value="capa"><AlertTriangle className="w-4 h-4 mr-2" />CAPA</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {QAQC_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-cyan-500' : ''} ${isCompleted ? 'bg-cyan-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-cyan-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-cyan-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-cyan-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-cyan-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-cyan-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < QAQC_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {QUALITY_TOOLS.map((tool, i) => (
                <Card key={tool.tool}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                      {tool.tool}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{tool.use}</p>
                    <Badge variant="outline">{tool.principle}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inspection">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INSPECTION_CHECKLIST.map((category) => (
                <Card key={category.category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-cyan-600" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-cyan-600" />{item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="capa">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-cyan-600" />CAPA Process</CardTitle>
                  <CardDescription>Corrective and Preventive Action</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { step: 1, name: "Identify", desc: "Document the problem or potential issue" },
                      { step: 2, name: "Investigate", desc: "Determine root cause" },
                      { step: 3, name: "Plan", desc: "Develop corrective/preventive actions" },
                      { step: 4, name: "Implement", desc: "Execute the planned actions" },
                      { step: 5, name: "Verify", desc: "Confirm effectiveness" },
                      { step: 6, name: "Close", desc: "Document and close the CAPA" },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-cyan-600 text-sm">{item.step}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-600" />Root Cause Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { method: "5 Whys", desc: "Ask 'why' repeatedly to drill down to root cause" },
                    { method: "Fishbone Diagram", desc: "Categorize potential causes (Man, Machine, Method, Material)" },
                    { method: "Fault Tree Analysis", desc: "Top-down deductive analysis of failures" },
                    { method: "Pareto Analysis", desc: "Focus on vital few causes (80/20 rule)" },
                  ].map((item) => (
                    <div key={item.method} className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">{item.method}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
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
