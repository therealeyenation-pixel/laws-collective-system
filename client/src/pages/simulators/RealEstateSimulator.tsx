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
  Home, Building, MapPin, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  Calculator, TrendingUp, DollarSign, Key
} from "lucide-react";

const REAL_ESTATE_MODULES = [
  {
    id: "re-fundamentals",
    title: "Real Estate Fundamentals",
    description: "Understand the basics of real estate investment.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is real estate?", options: ["Only houses", "Land and any permanent structures on it", "Stocks", "Personal property"], correct: 1 },
      { question: "What is appreciation?", options: ["Gratitude", "Increase in property value over time", "Depreciation", "Rent income"], correct: 1 },
      { question: "What is equity in real estate?", options: ["Stock ownership", "Difference between property value and mortgage owed", "Monthly payment", "Interest rate"], correct: 1 }
    ]
  },
  {
    id: "property-analysis",
    title: "Property Analysis",
    description: "Learn to evaluate investment properties.",
    duration: "30 min",
    tokensReward: 200,
    quiz: [
      { question: "What is Cap Rate?", options: ["Maximum rate", "Net Operating Income / Property Value", "Interest rate", "Tax rate"], correct: 1 },
      { question: "What is Cash-on-Cash Return?", options: ["Cash back rewards", "Annual cash flow / Total cash invested", "Mortgage rate", "Appreciation rate"], correct: 1 },
      { question: "What is NOI (Net Operating Income)?", options: ["Total revenue", "Revenue minus operating expenses (before debt service)", "Profit after taxes", "Gross rent"], correct: 1 }
    ]
  },
  {
    id: "financing",
    title: "Real Estate Financing",
    description: "Understand financing options and strategies.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is LTV (Loan-to-Value)?", options: ["Loan amount", "Loan amount / Property value", "Monthly payment", "Interest total"], correct: 1 },
      { question: "What is a conventional mortgage?", options: ["Government loan", "Non-government backed loan from private lender", "Cash purchase", "Seller financing"], correct: 1 },
      { question: "What is DSCR (Debt Service Coverage Ratio)?", options: ["Debt amount", "NOI / Annual debt payments", "Credit score", "Down payment"], correct: 1 }
    ]
  },
  {
    id: "property-management",
    title: "Property Management",
    description: "Manage rental properties effectively.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is a property manager's main role?", options: ["Sell properties", "Oversee day-to-day operations and tenant relations", "Build properties", "Appraise properties"], correct: 1 },
      { question: "What is tenant screening?", options: ["Cleaning", "Evaluating potential tenants' background and creditworthiness", "Eviction", "Rent collection"], correct: 1 },
      { question: "What is a vacancy rate?", options: ["Empty rooms", "Percentage of time property is unoccupied", "Rent amount", "Maintenance cost"], correct: 1 }
    ]
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    description: "Analyze real estate markets and trends.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What indicates a seller's market?", options: ["High inventory", "Low inventory and high demand", "Falling prices", "High vacancy"], correct: 1 },
      { question: "What is a comparable sale (comp)?", options: ["Any sale", "Similar property recently sold used for valuation", "Foreclosure", "Auction sale"], correct: 1 },
      { question: "What factors affect property value?", options: ["Only size", "Location, condition, market conditions, amenities", "Paint color only", "Owner's opinion"], correct: 1 }
    ]
  },
  {
    id: "tax-strategies",
    title: "Real Estate Tax Strategies",
    description: "Understand tax benefits of real estate.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is a 1031 exchange?", options: ["Stock trade", "Tax-deferred exchange of like-kind properties", "Mortgage refinance", "Property sale"], correct: 1 },
      { question: "Can you deduct mortgage interest?", options: ["Never", "Yes, on investment properties", "Only on cars", "Only if you lose money"], correct: 1 },
      { question: "What is depreciation in real estate taxes?", options: ["Property damage", "Tax deduction for property wear over time", "Value increase", "Maintenance cost"], correct: 1 }
    ]
  }
];

const INVESTMENT_METRICS = [
  { metric: "Cap Rate", formula: "NOI / Purchase Price × 100", example: "$50,000 / $500,000 = 10%", good: "5-10%+" },
  { metric: "Cash-on-Cash", formula: "Annual Cash Flow / Cash Invested × 100", example: "$12,000 / $100,000 = 12%", good: "8-12%+" },
  { metric: "GRM", formula: "Purchase Price / Gross Annual Rent", example: "$500,000 / $60,000 = 8.3", good: "4-7" },
  { metric: "DSCR", formula: "NOI / Annual Debt Service", example: "$50,000 / $40,000 = 1.25", good: "1.2+" },
];

const PROPERTY_TYPES = [
  { type: "Single Family", pros: "Easy to manage, appreciate well", cons: "Single income stream", typical_cap: "4-8%" },
  { type: "Multi-Family", pros: "Multiple income streams, economies of scale", cons: "More management", typical_cap: "5-10%" },
  { type: "Commercial", pros: "Longer leases, triple net", cons: "Higher entry cost", typical_cap: "6-12%" },
  { type: "Industrial", pros: "Low maintenance, stable tenants", cons: "Location dependent", typical_cap: "6-9%" },
  { type: "Retail", pros: "Percentage rent potential", cons: "E-commerce impact", typical_cap: "5-10%" },
  { type: "Land", pros: "Low holding costs, development potential", cons: "No income, speculation", typical_cap: "N/A" },
];

export default function RealEstateSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = REAL_ESTATE_MODULES[currentModule];
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
    if (currentModule < REAL_ESTATE_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / REAL_ESTATE_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Home className="w-6 h-6 text-emerald-600" />
              Real Estate Simulator
            </h1>
            <p className="text-muted-foreground">Master real estate investment</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-emerald-600 border-emerald-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/real-estate"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{REAL_ESTATE_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="metrics"><Calculator className="w-4 h-4 mr-2" />Metrics</TabsTrigger>
            <TabsTrigger value="types"><Building className="w-4 h-4 mr-2" />Property Types</TabsTrigger>
            <TabsTrigger value="analysis"><TrendingUp className="w-4 h-4 mr-2" />Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {REAL_ESTATE_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-emerald-500' : ''} ${isCompleted ? 'bg-emerald-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-emerald-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-emerald-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < REAL_ESTATE_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INVESTMENT_METRICS.map((metric) => (
                <Card key={metric.metric}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      {metric.metric}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-2 bg-muted/50 rounded font-mono text-sm mb-2">{metric.formula}</div>
                    <p className="text-xs text-muted-foreground mb-2">Example: {metric.example}</p>
                    <Badge variant="outline" className="text-emerald-600">Target: {metric.good}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="types">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROPERTY_TYPES.map((prop) => (
                <Card key={prop.type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-600" />
                      {prop.type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><span className="text-green-600">+</span> {prop.pros}</div>
                    <div><span className="text-red-600">-</span> {prop.cons}</div>
                    <Badge variant="secondary">Cap Rate: {prop.typical_cap}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-600" />Due Diligence Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Property inspection report",
                    "Title search and insurance",
                    "Environmental assessment",
                    "Rent roll verification",
                    "Operating expense review",
                    "Market rent analysis",
                    "Zoning and permits check",
                    "Insurance quotes",
                    "Property tax verification",
                    "Lease agreement review",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />{item}
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-emerald-600" />Investment Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { criteria: "Location", desc: "Growth markets, good schools, low crime" },
                    { criteria: "Cash Flow", desc: "Positive from day one preferred" },
                    { criteria: "Appreciation", desc: "Historical and projected growth" },
                    { criteria: "Exit Strategy", desc: "Multiple options (sell, refi, hold)" },
                    { criteria: "Value-Add", desc: "Opportunity to increase NOI" },
                  ].map((item) => (
                    <div key={item.criteria} className="p-2 border-l-4 border-emerald-500 pl-3">
                      <p className="font-medium text-sm">{item.criteria}</p>
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
