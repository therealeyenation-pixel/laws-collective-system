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
  Package, ShoppingBag, Truck, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  Calculator, ClipboardList, BarChart3
} from "lucide-react";

const PURCHASING_MODULES = [
  {
    id: "purchasing-basics",
    title: "Purchasing Fundamentals",
    description: "Learn the basics of business purchasing.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is the primary goal of purchasing?", options: ["Spend as much as possible", "Acquire goods/services at best value", "Buy from friends", "Avoid all purchases"], correct: 1 },
      { question: "What is a purchase requisition?", options: ["Final invoice", "Internal request to buy something", "Vendor contract", "Payment receipt"], correct: 1 },
      { question: "What is lead time?", options: ["Time to lead a team", "Time between order and delivery", "Sales cycle", "Payment terms"], correct: 1 }
    ]
  },
  {
    id: "inventory-management",
    title: "Inventory Management",
    description: "Manage stock levels effectively.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is safety stock?", options: ["Expired inventory", "Extra inventory to prevent stockouts", "Damaged goods", "Returned items"], correct: 1 },
      { question: "What is FIFO?", options: ["A pet name", "First In, First Out inventory method", "Financial term", "Shipping method"], correct: 1 },
      { question: "What is inventory turnover?", options: ["Rotating shelves", "How often inventory is sold and replaced", "Employee turnover", "Warehouse layout"], correct: 1 }
    ]
  },
  {
    id: "supplier-management",
    title: "Supplier Management",
    description: "Build and maintain supplier relationships.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is supplier diversification?", options: ["Using one supplier", "Using multiple suppliers to reduce risk", "Ignoring suppliers", "Supplier parties"], correct: 1 },
      { question: "What is a preferred supplier?", options: ["Any supplier", "Pre-approved supplier meeting quality standards", "Cheapest supplier", "Newest supplier"], correct: 1 },
      { question: "What should you evaluate in suppliers?", options: ["Only price", "Quality, reliability, price, and service", "Location only", "Company size"], correct: 1 }
    ]
  },
  {
    id: "cost-analysis",
    title: "Cost Analysis",
    description: "Analyze and optimize purchasing costs.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is Total Cost of Ownership (TCO)?", options: ["Purchase price only", "All costs over the item's lifetime", "Shipping cost", "Tax amount"], correct: 1 },
      { question: "What is cost avoidance?", options: ["Not buying anything", "Preventing future cost increases", "Hiding expenses", "Delaying payments"], correct: 1 },
      { question: "What is spend analysis?", options: ["Counting money", "Examining purchasing data to find savings", "Budget planning", "Invoice processing"], correct: 1 }
    ]
  },
  {
    id: "purchase-orders",
    title: "Purchase Order Management",
    description: "Create and manage purchase orders.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is a purchase order (PO)?", options: ["Invoice", "Formal document authorizing a purchase", "Receipt", "Quote"], correct: 1 },
      { question: "What is three-way matching?", options: ["Three vendors", "Comparing PO, receipt, and invoice", "Three payments", "Triple checking"], correct: 1 },
      { question: "When should a PO be issued?", options: ["After delivery", "Before ordering from supplier", "Never", "Only for large orders"], correct: 1 }
    ]
  },
  {
    id: "reorder-planning",
    title: "Reorder Planning",
    description: "Plan when and how much to reorder.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is a reorder point?", options: ["Store location", "Inventory level triggering new order", "Price point", "Delivery location"], correct: 1 },
      { question: "What is Economic Order Quantity (EOQ)?", options: ["Cheapest item", "Optimal order quantity minimizing total costs", "Maximum order", "Minimum order"], correct: 1 },
      { question: "What factors affect reorder point?", options: ["Only price", "Lead time, demand, and safety stock", "Warehouse size", "Employee count"], correct: 1 }
    ]
  }
];

const INVENTORY_FORMULAS = [
  { name: "Reorder Point", formula: "(Average Daily Usage × Lead Time) + Safety Stock", example: "(10 units × 5 days) + 20 = 70 units" },
  { name: "Safety Stock", formula: "(Max Daily Usage - Avg Daily Usage) × Lead Time", example: "(15 - 10) × 5 = 25 units" },
  { name: "EOQ", formula: "√(2 × Annual Demand × Order Cost / Holding Cost)", example: "√(2 × 1000 × $50 / $2) = 224 units" },
  { name: "Inventory Turnover", formula: "Cost of Goods Sold / Average Inventory", example: "$100,000 / $20,000 = 5 times/year" },
];

export default function PurchasingSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = PURCHASING_MODULES[currentModule];
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
    if (currentModule < PURCHASING_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / PURCHASING_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-teal-600" />
              Purchasing Simulator
            </h1>
            <p className="text-muted-foreground">Master purchasing and inventory</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-teal-600 border-teal-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/purchasing"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{PURCHASING_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="inventory"><Package className="w-4 h-4 mr-2" />Inventory</TabsTrigger>
            <TabsTrigger value="formulas"><Calculator className="w-4 h-4 mr-2" />Formulas</TabsTrigger>
            <TabsTrigger value="process"><ClipboardList className="w-4 h-4 mr-2" />Process</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {PURCHASING_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-teal-500' : ''} ${isCompleted ? 'bg-teal-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-teal-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-teal-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-teal-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < PURCHASING_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-teal-600" />Inventory Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { method: "FIFO", desc: "First In, First Out - oldest inventory sold first", best: "Perishables, dated items" },
                    { method: "LIFO", desc: "Last In, First Out - newest inventory sold first", best: "Non-perishables, inflation hedge" },
                    { method: "Weighted Average", desc: "Average cost of all inventory", best: "Homogeneous products" },
                    { method: "Specific ID", desc: "Track individual item costs", best: "High-value unique items" },
                  ].map((item) => (
                    <div key={item.method} className="p-3 border rounded-lg">
                      <p className="font-medium">{item.method}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                      <Badge variant="outline" className="mt-1 text-xs">Best for: {item.best}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-teal-600" />Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { metric: "Inventory Turnover", target: "Higher is better", desc: "How often inventory is sold" },
                    { metric: "Days of Inventory", target: "Lower is better", desc: "Days to sell current stock" },
                    { metric: "Stockout Rate", target: "<2%", desc: "Frequency of out-of-stock" },
                    { metric: "Carrying Cost", target: "15-25% of value", desc: "Cost to hold inventory" },
                  ].map((item) => (
                    <div key={item.metric} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <p className="font-medium text-sm">{item.metric}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Badge variant="secondary">{item.target}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="formulas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INVENTORY_FORMULAS.map((formula) => (
                <Card key={formula.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-teal-600" />
                      {formula.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-muted/50 rounded font-mono text-sm mb-2">{formula.formula}</div>
                    <p className="text-xs text-muted-foreground">Example: {formula.example}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Order Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { step: 1, name: "Requisition", desc: "Internal request submitted" },
                    { step: 2, name: "Approval", desc: "Request reviewed and approved" },
                    { step: 3, name: "PO Creation", desc: "Purchase order generated" },
                    { step: 4, name: "Send to Vendor", desc: "PO transmitted to supplier" },
                    { step: 5, name: "Confirmation", desc: "Vendor confirms order" },
                    { step: 6, name: "Delivery", desc: "Goods received" },
                    { step: 7, name: "Inspection", desc: "Quality verified" },
                    { step: 8, name: "Payment", desc: "Invoice processed" },
                  ].map((item) => (
                    <div key={item.step} className="text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-teal-100 flex items-center justify-center mb-2">
                        <span className="font-bold text-teal-600">{item.step}</span>
                      </div>
                      <p className="font-medium text-sm">{item.name}</p>
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
