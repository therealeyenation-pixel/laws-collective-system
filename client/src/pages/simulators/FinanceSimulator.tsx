import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  DollarSign, TrendingUp, PieChart, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, Wallet,
  AlertTriangle, Lightbulb, BookOpen, RotateCcw
} from "lucide-react";

const FINANCE_MODULES = [
  {
    id: "budget-basics",
    title: "Business Budgeting Fundamentals",
    description: "Learn to create and manage a business budget that drives profitability.",
    duration: "15 min",
    tokensReward: 100,
    quiz: [
      { question: "What is the primary purpose of a business budget?", options: ["To impress investors", "To plan and control financial resources", "To avoid paying taxes", "To track employee hours"], correct: 1 },
      { question: "Which budgeting method starts from zero each period?", options: ["Incremental budgeting", "Activity-based budgeting", "Zero-based budgeting", "Rolling budget"], correct: 2 },
      { question: "What should you do when actual expenses exceed budgeted amounts?", options: ["Ignore it until year-end", "Analyze the variance and adjust", "Fire someone", "Stop tracking expenses"], correct: 1 }
    ]
  },
  {
    id: "cash-flow",
    title: "Cash Flow Management",
    description: "Master the art of managing money coming in and going out of your business.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is the difference between profit and cash flow?", options: ["They are the same thing", "Profit is accounting-based; cash flow is actual money movement", "Cash flow is always higher than profit", "Profit includes loans; cash flow doesn't"], correct: 1 },
      { question: "What is a healthy cash flow ratio for a small business?", options: ["Less than 0.5", "Exactly 1.0", "Greater than 1.0", "It doesn't matter"], correct: 2 },
      { question: "Which strategy helps improve cash flow?", options: ["Extending payment terms to customers", "Paying vendors immediately", "Invoicing promptly and following up on receivables", "Holding more inventory"], correct: 2 }
    ]
  },
  {
    id: "tax-planning",
    title: "Tax Planning Strategies",
    description: "Learn legal strategies to minimize your tax burden and maximize deductions.",
    duration: "25 min",
    tokensReward: 200,
    quiz: [
      { question: "When should you start tax planning?", options: ["April 14th", "Throughout the year", "Only when you owe money", "Every 5 years"], correct: 1 },
      { question: "What is the benefit of quarterly estimated tax payments?", options: ["You pay more taxes overall", "You avoid penalties and manage cash flow", "The IRS gives you a discount", "You can skip filing a return"], correct: 1 },
      { question: "Which is a legitimate business deduction?", options: ["Personal groceries", "Home office used exclusively for business", "Family vacation", "Personal clothing"], correct: 1 }
    ]
  },
  {
    id: "financial-statements",
    title: "Reading Financial Statements",
    description: "Understand income statements, balance sheets, and cash flow statements.",
    duration: "30 min",
    tokensReward: 200,
    quiz: [
      { question: "What does the income statement show?", options: ["Assets and liabilities", "Revenue, expenses, and profit over a period", "Cash position at a point in time", "Shareholder equity"], correct: 1 },
      { question: "The balance sheet equation is:", options: ["Revenue - Expenses = Profit", "Assets = Liabilities + Equity", "Cash In - Cash Out = Net Cash", "Sales - COGS = Gross Margin"], correct: 1 },
      { question: "What does a negative working capital indicate?", options: ["The business is highly profitable", "The business may have liquidity issues", "The business has too much cash", "The business is growing fast"], correct: 1 }
    ]
  },
  {
    id: "pricing-strategy",
    title: "Pricing Your Services",
    description: "Learn how to price your products and services for profitability.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What should pricing cover at minimum?", options: ["Just material costs", "All costs plus desired profit margin", "Whatever competitors charge", "The lowest possible amount"], correct: 1 },
      { question: "What is value-based pricing?", options: ["Pricing based on your costs", "Pricing based on perceived value to the customer", "Pricing below competitors", "Pricing at random"], correct: 1 },
      { question: "When should you consider raising prices?", options: ["Never", "When costs increase or value delivered increases", "Only when competitors raise prices", "Every month"], correct: 1 }
    ]
  },
  {
    id: "financial-ratios",
    title: "Key Financial Ratios",
    description: "Master the ratios that reveal your business health.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What does the current ratio measure?", options: ["Profitability", "Ability to pay short-term obligations", "Revenue growth", "Market share"], correct: 1 },
      { question: "A gross profit margin of 40% means:", options: ["You keep $0.40 of every dollar after all expenses", "You keep $0.40 of every dollar after direct costs", "You lose $0.40 on every sale", "Your profit is $40,000"], correct: 1 },
      { question: "What is a good debt-to-equity ratio for most small businesses?", options: ["Greater than 5:1", "Between 1:1 and 2:1", "Exactly 0", "It doesn't matter"], correct: 1 }
    ]
  }
];

const BUDGET_SCENARIOS = [
  {
    id: "startup",
    name: "Startup Budget",
    description: "Plan your first year of business expenses",
    categories: [
      { name: "Legal & Formation", suggested: 2000 },
      { name: "Equipment & Software", suggested: 3000 },
      { name: "Marketing & Branding", suggested: 2500 },
      { name: "Insurance", suggested: 1500 },
      { name: "Professional Services", suggested: 2000 },
      { name: "Operating Reserve", suggested: 5000 }
    ]
  },
  {
    id: "monthly",
    name: "Monthly Operating Budget",
    description: "Plan your recurring monthly expenses",
    categories: [
      { name: "Rent/Office Space", suggested: 500 },
      { name: "Utilities & Internet", suggested: 200 },
      { name: "Software Subscriptions", suggested: 150 },
      { name: "Marketing", suggested: 300 },
      { name: "Professional Development", suggested: 100 },
      { name: "Miscellaneous", suggested: 200 }
    ]
  }
];

export default function FinanceSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(BUDGET_SCENARIOS[0]);
  const [budgetValues, setBudgetValues] = useState<Record<string, number>>({});
  const [monthlyRevenue, setMonthlyRevenue] = useState(10000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(7000);
  const [accountsReceivable, setAccountsReceivable] = useState(5000);
  const [accountsPayable, setAccountsPayable] = useState(3000);

  const module = FINANCE_MODULES[currentModule];
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
    if (currentModule < FINANCE_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / FINANCE_MODULES.length) * 100);
  const totalBudget = Object.values(budgetValues).reduce((sum, val) => sum + (val || 0), 0);
  const suggestedTotal = selectedScenario.categories.reduce((sum, cat) => sum + cat.suggested, 0);
  const netCashFlow = monthlyRevenue - monthlyExpenses;
  const cashFlowRatio = monthlyExpenses > 0 ? monthlyRevenue / monthlyExpenses : 0;
  const daysReceivable = monthlyRevenue > 0 ? Math.round((accountsReceivable / monthlyRevenue) * 30) : 0;
  const daysPayable = monthlyExpenses > 0 ? Math.round((accountsPayable / monthlyExpenses) * 30) : 0;

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              Finance Simulator
            </h1>
            <p className="text-muted-foreground">Master financial management for your business</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-emerald-600 border-emerald-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/finance"><ArrowLeft className="w-4 h-4 mr-2" />Back to Finance</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{FINANCE_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="budget"><Wallet className="w-4 h-4 mr-2" />Budget Calculator</TabsTrigger>
            <TabsTrigger value="cashflow"><TrendingUp className="w-4 h-4 mr-2" />Cash Flow</TabsTrigger>
            <TabsTrigger value="ratios"><PieChart className="w-4 h-4 mr-2" />Financial Ratios</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Modules</h3>
                {FINANCE_MODULES.map((mod, index) => {
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
                          {currentModule < FINANCE_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-emerald-600" />Budget Planner</CardTitle>
                  <CardDescription>Plan your business budget by category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {BUDGET_SCENARIOS.map((scenario) => (
                      <Button key={scenario.id} variant={selectedScenario.id === scenario.id ? "default" : "outline"} size="sm"
                        onClick={() => { setSelectedScenario(scenario); setBudgetValues({}); }}>{scenario.name}</Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedScenario.description}</p>
                  <div className="space-y-4">
                    {selectedScenario.categories.map((category) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <Label>{category.name}</Label>
                          <span className="text-muted-foreground">Suggested: ${category.suggested.toLocaleString()}</span>
                        </div>
                        <Input type="number" placeholder={category.suggested.toString()} value={budgetValues[category.name] || ""}
                          onChange={(e) => setBudgetValues(prev => ({ ...prev, [category.name]: parseInt(e.target.value) || 0 }))} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Budget Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Your Total Budget</p>
                    <p className="text-3xl font-bold text-emerald-600">${totalBudget.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Suggested: ${suggestedTotal.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    {selectedScenario.categories.map((category) => {
                      const value = budgetValues[category.name] || 0;
                      const percentage = totalBudget > 0 ? Math.round((value / totalBudget) * 100) : 0;
                      return (
                        <div key={category.name} className="flex items-center justify-between text-sm">
                          <span>{category.name}</span>
                          <span className="font-medium">${value.toLocaleString()} ({percentage}%)</span>
                        </div>
                      );
                    })}
                  </div>
                  {totalBudget > 0 && totalBudget < suggestedTotal * 0.7 && (
                    <div className="p-3 bg-amber-50 rounded-lg flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <p className="text-sm text-amber-800">Your budget is significantly below suggested amounts.</p>
                    </div>
                  )}
                  <div className="p-3 bg-blue-50 rounded-lg flex gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-800">Tip: Keep 3-6 months of operating expenses in reserve.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cashflow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-600" />Cash Flow Calculator</CardTitle>
                  <CardDescription>Analyze your business cash flow health</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Monthly Revenue</Label><Input type="number" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(parseInt(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Monthly Expenses</Label><Input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(parseInt(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Accounts Receivable</Label><Input type="number" value={accountsReceivable} onChange={(e) => setAccountsReceivable(parseInt(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Accounts Payable</Label><Input type="number" value={accountsPayable} onChange={(e) => setAccountsPayable(parseInt(e.target.value) || 0)} /></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Cash Flow Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-lg ${netCashFlow >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <p className="text-sm text-muted-foreground">Net Monthly Cash Flow</p>
                    <p className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${netCashFlow.toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Cash Flow Ratio</p>
                      <p className={`text-xl font-bold ${cashFlowRatio >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>{cashFlowRatio.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Days Sales Outstanding</p>
                      <p className="text-xl font-bold">{daysReceivable} days</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Days Receivable</span><span className="font-medium">{daysReceivable} days</span></div>
                    <div className="flex justify-between text-sm"><span>Days Payable</span><span className="font-medium">{daysPayable} days</span></div>
                    <div className="flex justify-between text-sm"><span>Cash Conversion Cycle</span><span className="font-medium">{daysReceivable - daysPayable} days</span></div>
                  </div>
                  {netCashFlow < 0 && (
                    <div className="p-3 bg-red-50 rounded-lg flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800">Negative cash flow detected. Consider reducing expenses or increasing revenue.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ratios">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Current Ratio", formula: "Current Assets / Current Liabilities", good: "> 1.5", description: "Measures ability to pay short-term obligations" },
                { name: "Quick Ratio", formula: "(Current Assets - Inventory) / Current Liabilities", good: "> 1.0", description: "Measures immediate liquidity" },
                { name: "Gross Profit Margin", formula: "(Revenue - COGS) / Revenue", good: "> 30%", description: "Percentage of revenue after direct costs" },
                { name: "Net Profit Margin", formula: "Net Income / Revenue", good: "> 10%", description: "Percentage of revenue kept as profit" },
                { name: "Debt-to-Equity", formula: "Total Debt / Total Equity", good: "< 2.0", description: "Measures financial leverage" },
                { name: "Return on Assets", formula: "Net Income / Total Assets", good: "> 5%", description: "How efficiently assets generate profit" },
              ].map((ratio) => (
                <Card key={ratio.name}>
                  <CardHeader className="pb-2"><CardTitle className="text-base">{ratio.name}</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="p-2 bg-muted/50 rounded text-xs font-mono">{ratio.formula}</div>
                    <p className="text-sm text-muted-foreground">{ratio.description}</p>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300">Target: {ratio.good}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
