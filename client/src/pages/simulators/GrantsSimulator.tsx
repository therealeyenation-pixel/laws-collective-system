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
  Gift, FileText, Calendar, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  DollarSign, ClipboardList, AlertTriangle, Search
} from "lucide-react";

const GRANTS_MODULES = [
  {
    id: "grants-basics",
    title: "Grant Fundamentals",
    description: "Understand the basics of grants and funding.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is a grant?", options: ["A loan", "Non-repayable funds given for specific purpose", "Investment", "Donation"], correct: 1 },
      { question: "What is a grant proposal?", options: ["Thank you letter", "Written request for funding with project details", "Budget report", "Progress report"], correct: 1 },
      { question: "Who provides grants?", options: ["Only government", "Government, foundations, corporations", "Only nonprofits", "Only banks"], correct: 1 }
    ]
  },
  {
    id: "finding-grants",
    title: "Finding Grant Opportunities",
    description: "Learn to identify and evaluate funding opportunities.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is a NOFO/RFP?", options: ["Grant report", "Notice of Funding Opportunity / Request for Proposal", "Thank you letter", "Budget form"], correct: 1 },
      { question: "What should you check before applying?", options: ["Nothing", "Eligibility requirements and alignment with mission", "Only deadline", "Only amount"], correct: 1 },
      { question: "Where can you find federal grants?", options: ["Facebook", "Grants.gov", "Amazon", "LinkedIn"], correct: 1 }
    ]
  },
  {
    id: "proposal-writing",
    title: "Grant Proposal Writing",
    description: "Write compelling grant proposals.",
    duration: "30 min",
    tokensReward: 200,
    quiz: [
      { question: "What is a needs statement?", options: ["Budget request", "Description of problem your project addresses", "Staff list", "Timeline"], correct: 1 },
      { question: "What are SMART goals?", options: ["Intelligent goals", "Specific, Measurable, Achievable, Relevant, Time-bound", "Simple goals", "Secret goals"], correct: 1 },
      { question: "What is an evaluation plan?", options: ["Staff reviews", "How you'll measure project success", "Budget audit", "Grant review"], correct: 1 }
    ]
  },
  {
    id: "budgeting",
    title: "Grant Budgeting",
    description: "Create and manage grant budgets.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What are direct costs?", options: ["Overhead", "Costs directly attributable to the project", "Administrative costs", "Indirect costs"], correct: 1 },
      { question: "What is cost sharing/matching?", options: ["Splitting bills", "Grantee's contribution to project costs", "Grant amount", "Overhead rate"], correct: 1 },
      { question: "What is an indirect cost rate?", options: ["Direct expenses", "Percentage for overhead and administrative costs", "Salary rate", "Interest rate"], correct: 1 }
    ]
  },
  {
    id: "compliance",
    title: "Grant Compliance",
    description: "Understand compliance requirements.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is grant compliance?", options: ["Optional", "Following all terms, conditions, and regulations", "Spending freely", "Ignoring rules"], correct: 1 },
      { question: "What is the Uniform Guidance?", options: ["Dress code", "Federal rules for grants (2 CFR 200)", "Grant application", "Budget template"], correct: 1 },
      { question: "What is an allowable cost?", options: ["Any cost", "Cost permitted under grant terms and regulations", "Expensive cost", "Personal expense"], correct: 1 }
    ]
  },
  {
    id: "reporting",
    title: "Grant Reporting",
    description: "Report on grant progress and outcomes.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is a progress report?", options: ["Final report", "Periodic update on project activities and outcomes", "Budget request", "Proposal"], correct: 1 },
      { question: "What is a financial report?", options: ["Progress narrative", "Accounting of grant expenditures", "Proposal budget", "Audit"], correct: 1 },
      { question: "Why is timely reporting important?", options: ["Not important", "Required for compliance and future funding", "Optional", "Only for large grants"], correct: 1 }
    ]
  }
];

const GRANT_TYPES = [
  { type: "Federal Grants", source: "U.S. Government agencies", examples: "NIH, NSF, DOE, USDA", typical: "$50K - $10M+" },
  { type: "State Grants", source: "State government agencies", examples: "State arts councils, education depts", typical: "$5K - $500K" },
  { type: "Foundation Grants", source: "Private foundations", examples: "Gates, Ford, MacArthur", typical: "$10K - $5M" },
  { type: "Corporate Grants", source: "Companies/corporate foundations", examples: "Google.org, Walmart Foundation", typical: "$5K - $1M" },
  { type: "Community Grants", source: "Community foundations", examples: "Local community foundations", typical: "$1K - $50K" },
];

const PROPOSAL_SECTIONS = [
  { section: "Executive Summary", purpose: "Brief overview of entire proposal", tips: "Write last, keep to 1 page" },
  { section: "Statement of Need", purpose: "Problem you're addressing", tips: "Use data and evidence" },
  { section: "Goals & Objectives", purpose: "What you'll accomplish", tips: "Make them SMART" },
  { section: "Methods/Approach", purpose: "How you'll do the work", tips: "Be specific and realistic" },
  { section: "Evaluation Plan", purpose: "How you'll measure success", tips: "Include metrics and timeline" },
  { section: "Budget & Justification", purpose: "Costs and explanations", tips: "Align with activities" },
  { section: "Organizational Capacity", purpose: "Why you can do this", tips: "Highlight relevant experience" },
  { section: "Sustainability", purpose: "Life after grant ends", tips: "Show long-term thinking" },
];

const COMPLIANCE_CHECKLIST = [
  { area: "Financial", items: ["Separate accounting", "Allowable costs only", "Timely drawdowns", "Audit readiness"] },
  { area: "Programmatic", items: ["Follow approved scope", "Meet milestones", "Document activities", "Track outcomes"] },
  { area: "Administrative", items: ["Timely reports", "Prior approvals", "Record retention", "Subrecipient monitoring"] },
];

export default function GrantsSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);

  const module = GRANTS_MODULES[currentModule];
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
    if (currentModule < GRANTS_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / GRANTS_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="w-6 h-6 text-amber-600" />
              Grants Simulator
            </h1>
            <p className="text-muted-foreground">Master grant writing and management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/grants-dashboard"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{GRANTS_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="types"><Search className="w-4 h-4 mr-2" />Grant Types</TabsTrigger>
            <TabsTrigger value="proposal"><FileText className="w-4 h-4 mr-2" />Proposal</TabsTrigger>
            <TabsTrigger value="compliance"><AlertTriangle className="w-4 h-4 mr-2" />Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                {GRANTS_MODULES.map((mod, index) => {
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
                          {currentModule < GRANTS_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="types">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GRANT_TYPES.map((grant) => (
                <Card key={grant.type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      {grant.type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{grant.source}</p>
                    <p className="text-xs">Examples: {grant.examples}</p>
                    <Badge variant="outline" className="text-amber-600">Typical: {grant.typical}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="proposal">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Structure</CardTitle>
                <CardDescription>Key sections of a winning grant proposal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PROPOSAL_SECTIONS.map((section, i) => (
                    <div key={section.section} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                        <span className="font-medium">{section.section}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{section.purpose}</p>
                      <Badge variant="secondary" className="text-xs">{section.tips}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COMPLIANCE_CHECKLIST.map((area) => (
                <Card key={area.area}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-amber-600" />
                      {area.area} Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {area.items.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />{item}
                        </div>
                      ))}
                    </div>
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
