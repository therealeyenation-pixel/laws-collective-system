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
  FileSignature, FileText, Clock, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  AlertTriangle, Users, Calendar
} from "lucide-react";

const CONTRACT_MODULES = [
  {
    id: "contract-basics",
    title: "Contract Fundamentals",
    description: "Understand the essential elements of business contracts.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What makes a contract legally binding?", options: ["Just a signature", "Offer, acceptance, consideration, capacity, legality", "Verbal agreement only", "Notarization"], correct: 1 },
      { question: "What is 'consideration' in a contract?", options: ["Being thoughtful", "Something of value exchanged between parties", "A waiting period", "Legal review"], correct: 1 },
      { question: "What is a breach of contract?", options: ["Signing a contract", "Failure to fulfill contract terms", "Renewing a contract", "Negotiating terms"], correct: 1 }
    ]
  },
  {
    id: "contract-types",
    title: "Types of Business Contracts",
    description: "Learn about different contract types and their uses.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is a fixed-price contract?", options: ["Price changes with market", "Set price regardless of actual costs", "No payment required", "Hourly billing"], correct: 1 },
      { question: "What is a time and materials (T&M) contract?", options: ["Fixed total price", "Payment based on time spent plus materials used", "No materials included", "Subscription model"], correct: 1 },
      { question: "What is a master service agreement (MSA)?", options: ["One-time contract", "Framework agreement for ongoing work", "Employment contract", "Lease agreement"], correct: 1 }
    ]
  },
  {
    id: "contractor-management",
    title: "Contractor Management",
    description: "Effectively manage contractor relationships and compliance.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What distinguishes a contractor from an employee?", options: ["Nothing", "Control over work, tools, and schedule", "Salary vs hourly", "Office location"], correct: 1 },
      { question: "What is contractor onboarding?", options: ["Hiring employees", "Process of integrating contractors into projects", "Terminating contracts", "Payroll setup"], correct: 1 },
      { question: "What is a 1099 form used for?", options: ["Employee wages", "Reporting contractor payments to IRS", "Contract signing", "Insurance claims"], correct: 1 }
    ]
  },
  {
    id: "contract-lifecycle",
    title: "Contract Lifecycle Management",
    description: "Manage contracts from creation to renewal or termination.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What are the stages of contract lifecycle?", options: ["Sign and forget", "Creation, execution, management, renewal/termination", "Just negotiation", "Only signing"], correct: 1 },
      { question: "What is contract renewal?", options: ["Ending a contract", "Extending contract terms for another period", "Breaking a contract", "First signing"], correct: 1 },
      { question: "What should trigger a contract review?", options: ["Never review", "Expiration dates, performance issues, or changes", "Only when problems occur", "Every day"], correct: 1 }
    ]
  },
  {
    id: "compliance",
    title: "Contract Compliance",
    description: "Ensure contracts meet legal and regulatory requirements.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is contract compliance?", options: ["Ignoring contract terms", "Adhering to all contract obligations", "Breaking contracts legally", "Avoiding contracts"], correct: 1 },
      { question: "What is an audit clause?", options: ["Music rights", "Right to inspect records for compliance", "Payment terms", "Termination clause"], correct: 1 },
      { question: "What are liquidated damages?", options: ["Water damage", "Pre-agreed damages for breach", "Unpaid invoices", "Insurance claims"], correct: 1 }
    ]
  },
  {
    id: "negotiation",
    title: "Contract Negotiation",
    description: "Negotiate favorable contract terms effectively.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is the best approach to contract negotiation?", options: ["Win at all costs", "Seek mutually beneficial terms", "Accept everything", "Avoid negotiation"], correct: 1 },
      { question: "What is a redline in contract negotiation?", options: ["A deadline", "Tracked changes showing proposed edits", "A rejection", "Final signature"], correct: 1 },
      { question: "What should you do before signing any contract?", options: ["Sign immediately", "Read thoroughly and understand all terms", "Skip the fine print", "Let someone else sign"], correct: 1 }
    ]
  }
];

const CONTRACT_LIFECYCLE_STAGES = [
  { stage: "Request", description: "Contract need identified and requested", status: "initiation" },
  { stage: "Draft", description: "Contract terms drafted and reviewed", status: "creation" },
  { stage: "Negotiate", description: "Terms negotiated with counterparty", status: "negotiation" },
  { stage: "Approve", description: "Internal approval obtained", status: "approval" },
  { stage: "Execute", description: "Contract signed by all parties", status: "execution" },
  { stage: "Manage", description: "Ongoing contract performance monitored", status: "active" },
  { stage: "Renew/Close", description: "Contract renewed or terminated", status: "completion" },
];

export default function ContractsSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = CONTRACT_MODULES[currentModule];
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
    if (currentModule < CONTRACT_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / CONTRACT_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileSignature className="w-6 h-6 text-amber-600" />
              Contracts Simulator
            </h1>
            <p className="text-muted-foreground">Master contract management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/contracts"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{CONTRACT_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="lifecycle"><Clock className="w-4 h-4 mr-2" />Lifecycle</TabsTrigger>
            <TabsTrigger value="types"><FileText className="w-4 h-4 mr-2" />Types</TabsTrigger>
            <TabsTrigger value="checklist"><CheckCircle2 className="w-4 h-4 mr-2" />Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {CONTRACT_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-amber-500' : ''} ${isCompleted ? 'bg-amber-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-amber-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-amber-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < CONTRACT_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lifecycle">
            <Card>
              <CardHeader>
                <CardTitle>Contract Lifecycle Stages</CardTitle>
                <CardDescription>From request to renewal or closure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-4">
                  {CONTRACT_LIFECYCLE_STAGES.map((stage, i) => (
                    <div key={stage.stage} className="flex items-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-2">
                          <span className="font-bold text-amber-600">{i + 1}</span>
                        </div>
                        <p className="font-medium text-sm">{stage.stage}</p>
                        <p className="text-xs text-muted-foreground max-w-[100px]">{stage.description}</p>
                      </div>
                      {i < CONTRACT_LIFECYCLE_STAGES.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: "Fixed Price", desc: "Set price for defined scope", best: "Clear requirements, defined deliverables" },
                { type: "Time & Materials", desc: "Pay for time and resources used", best: "Uncertain scope, ongoing work" },
                { type: "Cost Plus", desc: "Costs plus agreed markup", best: "Complex projects, R&D" },
                { type: "Retainer", desc: "Ongoing fee for availability", best: "Legal, consulting services" },
                { type: "MSA + SOW", desc: "Framework with specific work orders", best: "Long-term relationships, multiple projects" },
                { type: "NDA", desc: "Confidentiality agreement", best: "Protecting sensitive information" },
              ].map((contract) => (
                <Card key={contract.type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{contract.type}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{contract.desc}</p>
                    <Badge variant="outline" className="text-xs">Best for: {contract.best}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="checklist">
            <Card>
              <CardHeader>
                <CardTitle>Contract Review Checklist</CardTitle>
                <CardDescription>Key items to verify before signing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { item: "Parties correctly identified", category: "Basics" },
                    { item: "Scope of work clearly defined", category: "Scope" },
                    { item: "Payment terms specified", category: "Financial" },
                    { item: "Timeline and milestones set", category: "Schedule" },
                    { item: "Termination clauses reviewed", category: "Exit" },
                    { item: "Liability and indemnification understood", category: "Risk" },
                    { item: "Intellectual property rights addressed", category: "IP" },
                    { item: "Confidentiality provisions included", category: "Privacy" },
                    { item: "Dispute resolution process defined", category: "Legal" },
                    { item: "Insurance requirements met", category: "Compliance" },
                  ].map((check) => (
                    <div key={check.item} className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium">{check.item}</p>
                        <Badge variant="secondary" className="text-xs">{check.category}</Badge>
                      </div>
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
