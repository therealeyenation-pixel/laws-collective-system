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
  Scale, FileText, Shield, AlertTriangle, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  Gavel, ScrollText, ClipboardCheck, Lock
} from "lucide-react";

const LEGAL_MODULES = [
  {
    id: "business-structures",
    title: "Business Legal Structures",
    description: "Understand different business entity types and their legal implications.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "Which business structure provides the strongest personal liability protection?", options: ["Sole Proprietorship", "General Partnership", "LLC or Corporation", "DBA"], correct: 2 },
      { question: "What document governs the internal operations of an LLC?", options: ["Articles of Incorporation", "Operating Agreement", "Bylaws", "Partnership Agreement"], correct: 1 },
      { question: "Which entity type has 'double taxation'?", options: ["S Corporation", "LLC", "C Corporation", "Sole Proprietorship"], correct: 2 }
    ]
  },
  {
    id: "contracts-basics",
    title: "Contract Fundamentals",
    description: "Learn the essential elements of legally binding contracts.",
    duration: "30 min",
    tokensReward: 200,
    quiz: [
      { question: "What are the essential elements of a valid contract?", options: ["Signature only", "Offer, acceptance, consideration, capacity, legality", "Written document only", "Notarization"], correct: 1 },
      { question: "What is 'consideration' in contract law?", options: ["Being thoughtful", "Something of value exchanged", "A waiting period", "Legal advice"], correct: 1 },
      { question: "What makes a contract 'void'?", options: ["Missing signature", "Illegal purpose or lack of capacity", "Not notarized", "Verbal agreement"], correct: 1 }
    ]
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property Basics",
    description: "Protect your business ideas, brands, and creative works.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What does a trademark protect?", options: ["Inventions", "Brand names and logos", "Written works", "Trade secrets"], correct: 1 },
      { question: "How long does copyright protection typically last?", options: ["10 years", "20 years", "Life of author plus 70 years", "Forever"], correct: 2 },
      { question: "What is a trade secret?", options: ["A patent application", "Confidential business information", "A registered trademark", "A public document"], correct: 1 }
    ]
  },
  {
    id: "employment-law",
    title: "Employment Law Essentials",
    description: "Navigate the legal requirements of hiring and managing employees.",
    duration: "30 min",
    tokensReward: 200,
    quiz: [
      { question: "What is 'at-will employment'?", options: ["Employment with a contract", "Either party can end employment at any time for legal reasons", "Guaranteed employment", "Part-time work only"], correct: 1 },
      { question: "Which is NOT a protected class under federal law?", options: ["Race", "Religion", "Political affiliation", "National origin"], correct: 2 },
      { question: "What is the purpose of a non-compete agreement?", options: ["Guarantee employment", "Prevent working for competitors for a period", "Increase salary", "Provide benefits"], correct: 1 }
    ]
  },
  {
    id: "compliance-basics",
    title: "Regulatory Compliance",
    description: "Understand key compliance requirements for businesses.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is the purpose of business licenses?", options: ["Tax collection only", "Legal authorization to operate", "Marketing purposes", "Employee tracking"], correct: 1 },
      { question: "What does GDPR regulate?", options: ["Financial reporting", "Data privacy and protection", "Employment law", "Environmental standards"], correct: 1 },
      { question: "What is a compliance audit?", options: ["Financial review", "Systematic review of adherence to regulations", "Marketing analysis", "Employee evaluation"], correct: 1 }
    ]
  },
  {
    id: "dispute-resolution",
    title: "Dispute Resolution",
    description: "Learn methods for resolving business disputes efficiently.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is mediation?", options: ["Court trial", "Neutral third party helps parties reach agreement", "Binding arbitration", "Lawsuit filing"], correct: 1 },
      { question: "What is the main advantage of arbitration over litigation?", options: ["Always free", "Typically faster and more private", "No decision is made", "Government involvement"], correct: 1 },
      { question: "What is a 'statute of limitations'?", options: ["A type of contract", "Time limit to file a legal claim", "A court order", "A business license"], correct: 1 }
    ]
  }
];

const CONTRACT_TYPES = [
  { name: "Service Agreement", description: "Defines terms for providing services", key_clauses: ["Scope of work", "Payment terms", "Timeline", "Termination"] },
  { name: "Non-Disclosure Agreement (NDA)", description: "Protects confidential information", key_clauses: ["Definition of confidential info", "Obligations", "Duration", "Exceptions"] },
  { name: "Independent Contractor Agreement", description: "Defines relationship with contractors", key_clauses: ["Work description", "Payment", "IP ownership", "Tax responsibility"] },
  { name: "Employment Agreement", description: "Terms of employment relationship", key_clauses: ["Compensation", "Benefits", "Duties", "Termination conditions"] },
  { name: "Operating Agreement", description: "Governs LLC operations", key_clauses: ["Member roles", "Profit distribution", "Voting rights", "Dissolution"] },
  { name: "Partnership Agreement", description: "Defines partnership terms", key_clauses: ["Capital contributions", "Profit sharing", "Decision making", "Exit provisions"] },
];

const COMPLIANCE_AREAS = [
  { area: "Business Registration", items: ["State registration", "Local business license", "DBA filing", "EIN registration"], status: "required" },
  { area: "Tax Compliance", items: ["Federal tax ID", "State tax registration", "Sales tax permit", "Quarterly filings"], status: "required" },
  { area: "Employment", items: ["I-9 verification", "W-4 collection", "Workers comp insurance", "Poster requirements"], status: "if-applicable" },
  { area: "Industry-Specific", items: ["Professional licenses", "Health permits", "Environmental permits", "Safety certifications"], status: "varies" },
  { area: "Data Privacy", items: ["Privacy policy", "Cookie consent", "Data protection", "Breach notification"], status: "recommended" },
];

export default function LegalSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);
  const [selectedContract, setSelectedContract] = useState(CONTRACT_TYPES[0]);

  const module = LEGAL_MODULES[currentModule];
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
    if (currentModule < LEGAL_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / LEGAL_MODULES.length) * 100);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Scale className="w-6 h-6 text-purple-600" />
              Legal Simulator
            </h1>
            <p className="text-muted-foreground">Master legal fundamentals for your business</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-purple-600 border-purple-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/legal"><ArrowLeft className="w-4 h-4 mr-2" />Back to Legal</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{LEGAL_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="contracts"><ScrollText className="w-4 h-4 mr-2" />Contracts</TabsTrigger>
            <TabsTrigger value="compliance"><ClipboardCheck className="w-4 h-4 mr-2" />Compliance</TabsTrigger>
            <TabsTrigger value="protection"><Lock className="w-4 h-4 mr-2" />IP Protection</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Modules</h3>
                {LEGAL_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-purple-500' : ''} ${isCompleted ? 'bg-purple-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-purple-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-purple-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < LEGAL_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contracts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ScrollText className="w-5 h-5 text-purple-600" />Contract Types</CardTitle>
                  <CardDescription>Learn about common business contracts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {CONTRACT_TYPES.map((contract) => (
                    <div key={contract.name} 
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedContract.name === contract.name ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-muted/50'}`}
                      onClick={() => setSelectedContract(contract)}>
                      <p className="font-medium">{contract.name}</p>
                      <p className="text-sm text-muted-foreground">{contract.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-purple-600" />{selectedContract.name}</CardTitle>
                  <CardDescription>{selectedContract.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Key Clauses to Include:</h4>
                    <div className="space-y-2">
                      {selectedContract.key_clauses.map((clause, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">{clause}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-800">Always have contracts reviewed by a qualified attorney before signing.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="space-y-4">
              {COMPLIANCE_AREAS.map((area) => (
                <Card key={area.area}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{area.area}</CardTitle>
                      <Badge variant={area.status === "required" ? "destructive" : area.status === "recommended" ? "default" : "secondary"}>
                        {area.status === "required" ? "Required" : area.status === "recommended" ? "Recommended" : "Varies"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {area.items.map((item, i) => (
                        <div key={i} className="p-2 bg-muted/50 rounded text-sm flex items-center gap-2">
                          <Shield className="w-4 h-4 text-purple-600" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="protection">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: "Trademark", icon: "™", description: "Protects brand names, logos, and slogans", duration: "10 years, renewable", cost: "$250-$750 per class", process: "USPTO application, examination, registration" },
                { type: "Copyright", icon: "©", description: "Protects original creative works", duration: "Life + 70 years", cost: "$35-$85", process: "Automatic upon creation, registration optional but recommended" },
                { type: "Patent", icon: "Pat.", description: "Protects inventions and processes", duration: "20 years from filing", cost: "$5,000-$15,000+", process: "USPTO application, examination, claims review" },
                { type: "Trade Secret", icon: "🔒", description: "Protects confidential business information", duration: "As long as kept secret", cost: "Internal controls", process: "Implement confidentiality measures, NDAs" },
                { type: "Trade Dress", icon: "🎨", description: "Protects distinctive product appearance", duration: "Indefinite if maintained", cost: "$250-$750", process: "Similar to trademark registration" },
                { type: "Domain Name", icon: "🌐", description: "Protects your web presence", duration: "1-10 years, renewable", cost: "$10-$50/year", process: "Register through accredited registrar" },
              ].map((ip) => (
                <Card key={ip.type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="text-2xl">{ip.icon}</span>
                      {ip.type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{ip.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">Duration:</span><span>{ip.duration}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Cost:</span><span>{ip.cost}</span></div>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2 border-t">{ip.process}</p>
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
