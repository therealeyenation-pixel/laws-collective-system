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
  Users, UserPlus, ClipboardCheck, FileText, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, Shield, Scale,
  AlertTriangle, Lightbulb, BookOpen, RotateCcw, Briefcase, Calendar
} from "lucide-react";

const HR_MODULES = [
  {
    id: "recruitment-basics",
    title: "Recruitment Fundamentals",
    description: "Learn effective strategies for attracting and selecting top talent.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is the first step in the recruitment process?", options: ["Posting job ads", "Conducting interviews", "Identifying hiring needs and job requirements", "Making an offer"], correct: 2 },
      { question: "What should a job description include?", options: ["Only salary information", "Responsibilities, qualifications, and company culture", "Just the job title", "Personal opinions about the role"], correct: 1 },
      { question: "What is 'passive recruiting'?", options: ["Not recruiting at all", "Reaching out to candidates who aren't actively job searching", "Waiting for applications", "Using only job boards"], correct: 1 }
    ]
  },
  {
    id: "interviewing",
    title: "Effective Interviewing",
    description: "Master the art of conducting fair, legal, and effective interviews.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "Which question is illegal to ask in an interview?", options: ["Tell me about your experience", "What are your salary expectations", "Are you planning to have children", "Why do you want this job"], correct: 2 },
      { question: "What is a behavioral interview question?", options: ["Questions about hobbies", "Questions asking candidates to describe past situations", "Questions about future plans", "Technical questions only"], correct: 1 },
      { question: "What is the STAR method?", options: ["A rating system", "Situation, Task, Action, Result framework", "A type of interview", "A hiring metric"], correct: 1 }
    ]
  },
  {
    id: "onboarding",
    title: "Employee Onboarding",
    description: "Create effective onboarding programs that set employees up for success.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "When should onboarding begin?", options: ["First day of work", "Before the start date (preboarding)", "After the first week", "After probation"], correct: 1 },
      { question: "What is the primary goal of onboarding?", options: ["Complete paperwork", "Integrate new hires into company culture and role", "Assign a desk", "Schedule meetings"], correct: 1 },
      { question: "How long should a comprehensive onboarding program last?", options: ["One day", "One week", "30-90 days or longer", "One hour"], correct: 2 }
    ]
  },
  {
    id: "compliance",
    title: "HR Compliance Essentials",
    description: "Understand key employment laws and compliance requirements.",
    duration: "30 min",
    tokensReward: 200,
    quiz: [
      { question: "What does FLSA regulate?", options: ["Healthcare benefits", "Minimum wage and overtime", "Workplace safety", "Discrimination"], correct: 1 },
      { question: "What is an I-9 form used for?", options: ["Tax withholding", "Employment eligibility verification", "Performance reviews", "Benefits enrollment"], correct: 1 },
      { question: "How long must employers retain I-9 forms?", options: ["1 year", "3 years after hire or 1 year after termination, whichever is later", "Forever", "Until the employee leaves"], correct: 1 }
    ]
  },
  {
    id: "performance-management",
    title: "Performance Management",
    description: "Learn to set goals, provide feedback, and conduct effective reviews.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What does SMART stand for in goal setting?", options: ["Simple, Measured, Achievable, Relevant, Timely", "Specific, Measurable, Achievable, Relevant, Time-bound", "Strategic, Meaningful, Actionable, Realistic, Tracked", "Standard, Managed, Assessed, Reviewed, Tested"], correct: 1 },
      { question: "How often should managers provide feedback?", options: ["Only during annual reviews", "Continuously throughout the year", "Only when there's a problem", "Once a quarter"], correct: 1 },
      { question: "What is a PIP?", options: ["Personal Investment Plan", "Performance Improvement Plan", "Professional Interview Process", "Payroll Integration Program"], correct: 1 }
    ]
  },
  {
    id: "employee-relations",
    title: "Employee Relations",
    description: "Handle workplace conflicts, grievances, and maintain positive culture.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is the first step in handling a workplace complaint?", options: ["Ignore it", "Listen and document", "Fire the accused", "Call a lawyer"], correct: 1 },
      { question: "What is 'at-will employment'?", options: ["Employment with guaranteed tenure", "Either party can end employment at any time for any legal reason", "Employment only during business hours", "Temporary employment"], correct: 1 },
      { question: "What should be included in an employee handbook?", options: ["Only vacation policies", "Company policies, procedures, and employee rights", "Just the dress code", "Personal information about executives"], correct: 1 }
    ]
  }
];

const COMPLIANCE_CHECKLIST = [
  { id: "i9", name: "I-9 Employment Eligibility", required: true, description: "Verify identity and work authorization within 3 days of hire" },
  { id: "w4", name: "W-4 Tax Withholding", required: true, description: "Federal tax withholding form" },
  { id: "state-tax", name: "State Tax Forms", required: true, description: "State-specific withholding forms" },
  { id: "direct-deposit", name: "Direct Deposit Authorization", required: false, description: "Bank account information for payroll" },
  { id: "handbook", name: "Employee Handbook Acknowledgment", required: true, description: "Signed acknowledgment of policies" },
  { id: "emergency", name: "Emergency Contact Information", required: true, description: "Contact details for emergencies" },
  { id: "benefits", name: "Benefits Enrollment", required: false, description: "Health, dental, vision, 401k enrollment" },
  { id: "confidentiality", name: "Confidentiality Agreement", required: false, description: "NDA and confidentiality terms" },
];

export default function HRSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({});

  const module = HR_MODULES[currentModule];
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
    if (currentModule < HR_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / HR_MODULES.length) * 100);
  const completedChecklist = Object.values(checklistItems).filter(Boolean).length;
  const requiredChecklist = COMPLIANCE_CHECKLIST.filter(item => item.required);
  const completedRequired = requiredChecklist.filter(item => checklistItems[item.id]).length;

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              HR Simulator
            </h1>
            <p className="text-muted-foreground">Master human resources management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/hr"><ArrowLeft className="w-4 h-4 mr-2" />Back to HR</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{HR_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="recruitment"><UserPlus className="w-4 h-4 mr-2" />Recruitment</TabsTrigger>
            <TabsTrigger value="onboarding"><ClipboardCheck className="w-4 h-4 mr-2" />Onboarding</TabsTrigger>
            <TabsTrigger value="compliance"><Shield className="w-4 h-4 mr-2" />Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Modules</h3>
                {HR_MODULES.map((mod, index) => {
                  const progress = moduleProgress[mod.id];
                  const isActive = index === currentModule;
                  const isCompleted = progress?.completed;
                  return (
                    <Card key={mod.id} className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-blue-500' : ''} ${isCompleted ? 'bg-blue-50' : ''}`}
                      onClick={() => { setCurrentModule(index); setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />}
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
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-blue-600" />{module.title}</CardTitle>
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
                        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <Award className="w-10 h-10 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Module Complete!</h3>
                          <p className="text-muted-foreground">You scored {moduleProgress[module.id]?.score}%</p>
                          {moduleProgress[module.id]?.score >= 70 && <Badge className="mt-2 bg-blue-600">+{module.tokensReward} Tokens Earned!</Badge>}
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={handleRestartModule}><RotateCcw className="w-4 h-4 mr-2" />Retry</Button>
                          {currentModule < HR_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recruitment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-600" />Recruitment Process</CardTitle>
                  <CardDescription>Learn the stages of effective recruitment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { step: 1, title: "Identify Hiring Need", description: "Define role requirements, skills, and qualifications" },
                    { step: 2, title: "Create Job Posting", description: "Write compelling job description with clear expectations" },
                    { step: 3, title: "Source Candidates", description: "Use job boards, referrals, and direct outreach" },
                    { step: 4, title: "Screen Applications", description: "Review resumes and conduct initial phone screens" },
                    { step: 5, title: "Interview Process", description: "Conduct structured interviews with consistent questions" },
                    { step: 6, title: "Evaluate & Select", description: "Compare candidates using objective criteria" },
                    { step: 7, title: "Make Offer", description: "Extend competitive offer and negotiate terms" },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">{item.step}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" />Interview Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-800">STAR Method</p>
                    <p className="text-sm text-blue-700 mt-1">Ask candidates to describe: Situation, Task, Action, Result</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Sample Behavioral Questions:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• "Tell me about a time you handled a difficult situation..."</li>
                      <li>• "Describe a project where you had to meet a tight deadline..."</li>
                      <li>• "Give an example of when you disagreed with a coworker..."</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">Avoid Illegal Questions</p>
                      <p className="text-sm text-amber-700">Never ask about age, religion, marital status, pregnancy, or disabilities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="onboarding">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" />Onboarding Timeline</CardTitle>
                  <CardDescription>Structure your new hire experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { phase: "Pre-boarding", time: "Before Day 1", tasks: ["Send welcome email", "Prepare workspace", "Set up accounts", "Send paperwork"] },
                    { phase: "Day 1", time: "First Day", tasks: ["Office tour", "Team introductions", "Complete I-9", "Review handbook"] },
                    { phase: "Week 1", time: "Days 1-5", tasks: ["Role training", "System access", "Meet key stakeholders", "Set initial goals"] },
                    { phase: "Month 1", time: "Days 1-30", tasks: ["Regular check-ins", "Complete training", "First project", "30-day review"] },
                    { phase: "90 Days", time: "Days 1-90", tasks: ["Performance feedback", "Goal assessment", "Career discussion", "Probation review"] },
                  ].map((item) => (
                    <div key={item.phase} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">{item.phase}</p>
                        <Badge variant="outline">{item.time}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.tasks.map((task, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{task}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-blue-600" />Onboarding Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { tip: "Assign a Buddy", description: "Pair new hires with experienced team members for guidance" },
                    { tip: "Set Clear Expectations", description: "Define 30-60-90 day goals from the start" },
                    { tip: "Schedule Regular Check-ins", description: "Weekly 1:1s during the first month" },
                    { tip: "Gather Feedback", description: "Ask new hires about their onboarding experience" },
                    { tip: "Celebrate Milestones", description: "Acknowledge first week, month, and quarter achievements" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{item.tip}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-blue-600" />New Hire Checklist</CardTitle>
                  <CardDescription>Practice completing required documentation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {COMPLIANCE_CHECKLIST.map((item) => (
                    <div key={item.id} className={`p-3 border rounded-lg cursor-pointer transition-all ${checklistItems[item.id] ? 'bg-blue-50 border-blue-200' : ''}`}
                      onClick={() => setChecklistItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}>
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${checklistItems[item.id] ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                          {checklistItems[item.id] && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{item.name}</p>
                            {item.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Checklist Progress</span>
                      <span>{completedChecklist}/{COMPLIANCE_CHECKLIST.length} completed</span>
                    </div>
                    <Progress value={(completedChecklist / COMPLIANCE_CHECKLIST.length) * 100} className="h-2" />
                    {completedRequired === requiredChecklist.length ? (
                      <p className="text-sm text-green-600 mt-2">All required items completed!</p>
                    ) : (
                      <p className="text-sm text-amber-600 mt-2">{requiredChecklist.length - completedRequired} required items remaining</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Scale className="w-5 h-5 text-blue-600" />Key Employment Laws</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { law: "FLSA", name: "Fair Labor Standards Act", covers: "Minimum wage, overtime, child labor" },
                    { law: "FMLA", name: "Family and Medical Leave Act", covers: "12 weeks unpaid leave for qualifying reasons" },
                    { law: "ADA", name: "Americans with Disabilities Act", covers: "Reasonable accommodations, non-discrimination" },
                    { law: "Title VII", name: "Civil Rights Act", covers: "Prohibits discrimination based on protected classes" },
                    { law: "OSHA", name: "Occupational Safety and Health Act", covers: "Workplace safety standards" },
                    { law: "COBRA", name: "Consolidated Omnibus Budget Reconciliation Act", covers: "Continued health coverage after employment" },
                  ].map((item) => (
                    <div key={item.law} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{item.law}</Badge>
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.covers}</p>
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
