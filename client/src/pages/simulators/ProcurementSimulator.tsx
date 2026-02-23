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
  ShoppingCart, FileText, Users, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  ClipboardList, Handshake, Search, DollarSign
} from "lucide-react";

const PROCUREMENT_MODULES = [
  {
    id: "procurement-basics",
    title: "Procurement Fundamentals",
    description: "Learn the basics of business procurement and purchasing.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is procurement?", options: ["Selling products", "Acquiring goods and services for business operations", "Hiring employees", "Marketing"], correct: 1 },
      { question: "What is the difference between procurement and purchasing?", options: ["They are identical", "Procurement is strategic; purchasing is transactional", "Purchasing is more important", "Procurement only involves services"], correct: 1 },
      { question: "What is a purchase requisition?", options: ["A final invoice", "Internal request to buy something", "Vendor contract", "Payment receipt"], correct: 1 }
    ]
  },
  {
    id: "vendor-management",
    title: "Vendor Selection & Management",
    description: "Evaluate, select, and manage vendor relationships effectively.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What factors should you consider when selecting a vendor?", options: ["Price only", "Quality, price, reliability, and service", "Location only", "Company size"], correct: 1 },
      { question: "What is vendor due diligence?", options: ["Paying vendors quickly", "Researching vendor capabilities and risks", "Ignoring vendor history", "Choosing the cheapest option"], correct: 1 },
      { question: "What is a preferred vendor list?", options: ["Vendors you've never used", "Pre-approved vendors meeting quality standards", "Blacklisted vendors", "Random vendor selection"], correct: 1 }
    ]
  },
  {
    id: "rfp-process",
    title: "RFP/RFQ Process",
    description: "Create and manage requests for proposals and quotes.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What does RFP stand for?", options: ["Request for Payment", "Request for Proposal", "Required for Purchase", "Rapid Financial Processing"], correct: 1 },
      { question: "When should you use an RFQ vs RFP?", options: ["They're the same", "RFQ for standard items; RFP for complex solutions", "RFP for small purchases", "Never use RFQ"], correct: 1 },
      { question: "What should an RFP include?", options: ["Just the price request", "Requirements, timeline, evaluation criteria, and terms", "Only company history", "Vendor names"], correct: 1 }
    ]
  },
  {
    id: "contract-negotiation",
    title: "Contract Negotiation",
    description: "Negotiate favorable terms with vendors and suppliers.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is BATNA in negotiation?", options: ["A contract type", "Best Alternative to Negotiated Agreement", "Budget allocation", "Vendor rating"], correct: 1 },
      { question: "What terms should you negotiate beyond price?", options: ["Nothing else matters", "Payment terms, warranties, delivery, and service levels", "Only delivery date", "Just the color"], correct: 1 },
      { question: "What is a win-win negotiation?", options: ["You win everything", "Both parties benefit from the agreement", "The vendor always loses", "No negotiation needed"], correct: 1 }
    ]
  },
  {
    id: "purchase-orders",
    title: "Purchase Order Management",
    description: "Create and manage purchase orders effectively.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is a purchase order?", options: ["An invoice", "Formal document authorizing a purchase", "A receipt", "A quote"], correct: 1 },
      { question: "What is three-way matching?", options: ["Matching three vendors", "Comparing PO, receipt, and invoice", "Three payment options", "Triple checking prices"], correct: 1 },
      { question: "Why is PO tracking important?", options: ["It's not important", "To manage spending and ensure delivery", "Only for large companies", "For tax purposes only"], correct: 1 }
    ]
  },
  {
    id: "cost-savings",
    title: "Cost Optimization Strategies",
    description: "Reduce procurement costs while maintaining quality.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is volume discounting?", options: ["Buying less", "Lower prices for larger quantities", "Selling in bulk", "Discount codes"], correct: 1 },
      { question: "What is Total Cost of Ownership (TCO)?", options: ["Just purchase price", "All costs over the item's lifetime", "Shipping costs only", "Tax amount"], correct: 1 },
      { question: "How can consolidating vendors save money?", options: ["It doesn't", "Better pricing, reduced admin, stronger relationships", "More vendors is better", "Only works for large companies"], correct: 1 }
    ]
  }
];

const PROCUREMENT_PROCESS = [
  { step: 1, name: "Identify Need", description: "Determine what goods or services are required" },
  { step: 2, name: "Requisition", description: "Submit internal purchase request for approval" },
  { step: 3, name: "Vendor Selection", description: "Identify and evaluate potential suppliers" },
  { step: 4, name: "RFQ/RFP", description: "Request quotes or proposals from vendors" },
  { step: 5, name: "Evaluation", description: "Compare responses and select best vendor" },
  { step: 6, name: "Negotiation", description: "Negotiate terms, pricing, and conditions" },
  { step: 7, name: "Purchase Order", description: "Issue formal PO to selected vendor" },
  { step: 8, name: "Delivery & Receipt", description: "Receive goods and verify against PO" },
  { step: 9, name: "Invoice Processing", description: "Match invoice to PO and receipt" },
  { step: 10, name: "Payment", description: "Process payment per agreed terms" },
];

export default function ProcurementSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = PROCUREMENT_MODULES[currentModule];
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
    if (currentModule < PROCUREMENT_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / PROCUREMENT_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-indigo-600" />
              Procurement Simulator
            </h1>
            <p className="text-muted-foreground">Master procurement and vendor management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-indigo-600 border-indigo-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/procurement"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{PROCUREMENT_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="process"><ClipboardList className="w-4 h-4 mr-2" />Process</TabsTrigger>
            <TabsTrigger value="vendors"><Users className="w-4 h-4 mr-2" />Vendors</TabsTrigger>
            <TabsTrigger value="rfp"><FileText className="w-4 h-4 mr-2" />RFP Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {PROCUREMENT_MODULES.map((mod, index) => {
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
                          {currentModule < PROCUREMENT_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle>Procurement Process Flow</CardTitle>
                <CardDescription>The complete procurement lifecycle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {PROCUREMENT_PROCESS.map((step) => (
                    <div key={step.step} className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                        <span className="font-bold text-indigo-600">{step.step}</span>
                      </div>
                      <p className="font-medium text-sm">{step.name}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Search className="w-5 h-5 text-indigo-600" />Vendor Evaluation Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { criteria: "Quality", weight: "25%", description: "Product/service quality and consistency" },
                    { criteria: "Price", weight: "20%", description: "Competitive pricing and value" },
                    { criteria: "Reliability", weight: "20%", description: "On-time delivery and dependability" },
                    { criteria: "Service", weight: "15%", description: "Customer support and responsiveness" },
                    { criteria: "Financial Stability", weight: "10%", description: "Vendor's financial health" },
                    { criteria: "Compliance", weight: "10%", description: "Regulatory and ethical compliance" },
                  ].map((item) => (
                    <div key={item.criteria} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.criteria}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Badge variant="outline">{item.weight}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Handshake className="w-5 h-5 text-indigo-600" />Vendor Relationship Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Communicate expectations clearly from the start",
                    "Establish regular check-ins and reviews",
                    "Pay invoices on time to build trust",
                    "Provide constructive feedback",
                    "Recognize and reward good performance",
                    "Address issues promptly and professionally",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rfp">
            <Card>
              <CardHeader>
                <CardTitle>RFP Template Structure</CardTitle>
                <CardDescription>Key sections for an effective Request for Proposal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { section: "Executive Summary", content: "Brief overview of your organization and project" },
                    { section: "Project Background", content: "Context and reasons for the procurement" },
                    { section: "Scope of Work", content: "Detailed requirements and deliverables" },
                    { section: "Timeline", content: "Key dates and milestones" },
                    { section: "Budget Range", content: "Expected budget or constraints" },
                    { section: "Evaluation Criteria", content: "How proposals will be scored" },
                    { section: "Submission Requirements", content: "Format, deadline, and contact info" },
                    { section: "Terms & Conditions", content: "Contract terms and legal requirements" },
                  ].map((item) => (
                    <div key={item.section} className="p-3 border rounded-lg">
                      <p className="font-medium text-indigo-600">{item.section}</p>
                      <p className="text-sm text-muted-foreground">{item.content}</p>
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
