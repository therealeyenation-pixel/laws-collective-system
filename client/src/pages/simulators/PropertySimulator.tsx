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
  Building2, Laptop, Key, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  Calculator, Wrench, FileText, TrendingDown
} from "lucide-react";

const PROPERTY_MODULES = [
  {
    id: "asset-basics",
    title: "Asset Management Basics",
    description: "Understand fundamentals of property and asset management.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is an asset?", options: ["Only cash", "Resource owned with economic value", "Liability", "Expense"], correct: 1 },
      { question: "What is asset tracking?", options: ["Following employees", "Monitoring location and status of assets", "Stock trading", "Sales tracking"], correct: 1 },
      { question: "Why is asset management important?", options: ["Not important", "Maximizes value and ensures accountability", "Only for taxes", "Legal requirement only"], correct: 1 }
    ]
  },
  {
    id: "depreciation",
    title: "Depreciation Methods",
    description: "Learn how assets lose value over time.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is depreciation?", options: ["Asset appreciation", "Allocation of asset cost over useful life", "Maintenance cost", "Purchase price"], correct: 1 },
      { question: "What is straight-line depreciation?", options: ["Variable amounts", "Equal amounts each period", "No depreciation", "Accelerated method"], correct: 1 },
      { question: "What is salvage value?", options: ["Original cost", "Estimated value at end of useful life", "Repair cost", "Insurance value"], correct: 1 }
    ]
  },
  {
    id: "software-licenses",
    title: "Software License Management",
    description: "Manage software licenses and compliance.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is software license compliance?", options: ["Ignoring licenses", "Using software according to license terms", "Pirating software", "Free software only"], correct: 1 },
      { question: "What is a perpetual license?", options: ["Temporary use", "One-time purchase for indefinite use", "Monthly subscription", "Trial version"], correct: 1 },
      { question: "What is license harvesting?", options: ["Buying new licenses", "Reclaiming unused licenses for redeployment", "Selling licenses", "Sharing licenses"], correct: 1 }
    ]
  },
  {
    id: "equipment-lifecycle",
    title: "Equipment Lifecycle",
    description: "Manage equipment from acquisition to disposal.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What are the stages of equipment lifecycle?", options: ["Buy and dispose", "Acquisition, deployment, maintenance, disposal", "Only maintenance", "No stages"], correct: 1 },
      { question: "When should equipment be replaced?", options: ["Never", "When repair costs exceed value or efficiency drops", "Every year", "Only when broken"], correct: 1 },
      { question: "What is equipment disposal?", options: ["Throwing away", "Proper removal including data wiping and recycling", "Selling only", "Storing forever"], correct: 1 }
    ]
  },
  {
    id: "maintenance",
    title: "Maintenance Planning",
    description: "Plan and schedule asset maintenance.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is preventive maintenance?", options: ["Fixing after breakdown", "Scheduled maintenance to prevent failures", "Emergency repairs", "No maintenance"], correct: 1 },
      { question: "What is predictive maintenance?", options: ["Guessing", "Using data to predict when maintenance is needed", "Random scheduling", "Annual service"], correct: 1 },
      { question: "Why track maintenance history?", options: ["Not necessary", "Identifies patterns and informs decisions", "Legal only", "For audits only"], correct: 1 }
    ]
  },
  {
    id: "inventory-control",
    title: "Property Inventory Control",
    description: "Maintain accurate property records.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is a fixed asset register?", options: ["Employee list", "Record of all fixed assets and details", "Sales log", "Expense report"], correct: 1 },
      { question: "What is asset tagging?", options: ["Price tags", "Labeling assets for identification and tracking", "Selling assets", "Grouping assets"], correct: 1 },
      { question: "How often should physical inventory be done?", options: ["Never", "At least annually, more for high-value items", "Only once", "Every day"], correct: 1 }
    ]
  }
];

const DEPRECIATION_METHODS = [
  { method: "Straight-Line", formula: "(Cost - Salvage) / Useful Life", example: "($10,000 - $1,000) / 5 years = $1,800/year", best: "Even wear assets" },
  { method: "Double Declining", formula: "2 × (1/Useful Life) × Book Value", example: "2 × 20% × $10,000 = $4,000 year 1", best: "Tech, vehicles" },
  { method: "Sum-of-Years", formula: "(Remaining Life / Sum of Years) × Depreciable Base", example: "(5/15) × $9,000 = $3,000 year 1", best: "Assets losing value early" },
  { method: "Units of Production", formula: "(Cost - Salvage) / Total Units × Units Used", example: "$9,000 / 100,000 miles × 20,000 = $1,800", best: "Usage-based assets" },
];

const ASSET_CATEGORIES = [
  { category: "IT Equipment", examples: "Computers, servers, networking", lifecycle: "3-5 years", depreciation: "Accelerated" },
  { category: "Furniture", examples: "Desks, chairs, cabinets", lifecycle: "7-10 years", depreciation: "Straight-line" },
  { category: "Vehicles", examples: "Cars, trucks, forklifts", lifecycle: "5-7 years", depreciation: "Accelerated" },
  { category: "Machinery", examples: "Production equipment", lifecycle: "10-15 years", depreciation: "Units of production" },
  { category: "Software", examples: "Licensed applications", lifecycle: "3-5 years", depreciation: "Straight-line" },
  { category: "Buildings", examples: "Offices, warehouses", lifecycle: "39 years", depreciation: "Straight-line" },
];

export default function PropertySimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = PROPERTY_MODULES[currentModule];
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
    if (currentModule < PROPERTY_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / PROPERTY_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-slate-600" />
              Property Simulator
            </h1>
            <p className="text-muted-foreground">Master asset and property management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-slate-600 border-slate-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/property"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{PROPERTY_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="depreciation"><TrendingDown className="w-4 h-4 mr-2" />Depreciation</TabsTrigger>
            <TabsTrigger value="categories"><Laptop className="w-4 h-4 mr-2" />Categories</TabsTrigger>
            <TabsTrigger value="lifecycle"><Wrench className="w-4 h-4 mr-2" />Lifecycle</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {PROPERTY_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-slate-500' : ''} ${isCompleted ? 'bg-slate-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-slate-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-slate-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-slate-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < PROPERTY_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="depreciation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEPRECIATION_METHODS.map((method) => (
                <Card key={method.method}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-slate-600" />
                      {method.method}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-2 bg-muted/50 rounded font-mono text-sm mb-2">{method.formula}</div>
                    <p className="text-xs text-muted-foreground mb-2">Example: {method.example}</p>
                    <Badge variant="outline">Best for: {method.best}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ASSET_CATEGORIES.map((cat) => (
                <Card key={cat.category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{cat.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{cat.examples}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">{cat.lifecycle}</Badge>
                      <Badge variant="secondary">{cat.depreciation}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lifecycle">
            <Card>
              <CardHeader>
                <CardTitle>Asset Lifecycle Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { stage: "Planning", desc: "Identify needs and budget", icon: FileText },
                    { stage: "Acquisition", desc: "Purchase and receive", icon: Key },
                    { stage: "Deployment", desc: "Install and configure", icon: Laptop },
                    { stage: "Maintenance", desc: "Service and repair", icon: Wrench },
                    { stage: "Disposal", desc: "Retire and recycle", icon: TrendingDown },
                  ].map((item, i) => (
                    <div key={item.stage} className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-2">
                        <item.icon className="w-6 h-6 text-slate-600" />
                      </div>
                      <p className="font-medium text-sm">{item.stage}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
