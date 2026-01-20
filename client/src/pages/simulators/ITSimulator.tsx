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
  Monitor, Shield, Server, ArrowRight, ArrowLeft,
  CheckCircle2, Circle, Award, Target, BookOpen, RotateCcw,
  Lock, Wifi, Database, Cloud, AlertTriangle, Key
} from "lucide-react";

const IT_MODULES = [
  {
    id: "security-basics",
    title: "Cybersecurity Fundamentals",
    description: "Learn essential security practices to protect your business.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is the most common cause of data breaches?", options: ["Hardware failure", "Human error/phishing", "Natural disasters", "Software bugs"], correct: 1 },
      { question: "What is multi-factor authentication (MFA)?", options: ["Multiple passwords", "Using two or more verification methods", "Encrypting files twice", "Having multiple accounts"], correct: 1 },
      { question: "What should you do if you receive a suspicious email?", options: ["Click links to verify", "Forward to everyone", "Report it and don't click links", "Reply asking for clarification"], correct: 2 }
    ]
  },
  {
    id: "password-management",
    title: "Password & Access Management",
    description: "Implement strong authentication and access controls.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What makes a strong password?", options: ["Your birthday", "12+ characters with mixed types", "Simple words", "Same password everywhere"], correct: 1 },
      { question: "What is the principle of least privilege?", options: ["Give everyone admin access", "Users get minimum access needed for their role", "No one gets access", "Only IT has access"], correct: 1 },
      { question: "How often should passwords be changed?", options: ["Never", "Every day", "When compromised or per policy (90-365 days)", "Every hour"], correct: 2 }
    ]
  },
  {
    id: "data-backup",
    title: "Data Backup & Recovery",
    description: "Protect your business data with proper backup strategies.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is the 3-2-1 backup rule?", options: ["3 passwords, 2 users, 1 admin", "3 copies, 2 media types, 1 offsite", "Backup 3 times daily", "3 servers, 2 locations, 1 cloud"], correct: 1 },
      { question: "What is RTO (Recovery Time Objective)?", options: ["Time to create backup", "Maximum acceptable downtime", "Time between backups", "Recovery success rate"], correct: 1 },
      { question: "What should be included in a disaster recovery plan?", options: ["Only IT contacts", "Procedures, contacts, priorities, and testing schedule", "Just backup locations", "Employee birthdays"], correct: 1 }
    ]
  },
  {
    id: "cloud-basics",
    title: "Cloud Computing Essentials",
    description: "Understand cloud services and how to use them securely.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is SaaS?", options: ["Server as a Service", "Software as a Service", "Security as a Service", "Storage as a Service"], correct: 1 },
      { question: "What is the shared responsibility model?", options: ["Everyone shares passwords", "Cloud provider and customer share security duties", "IT shares with HR", "All employees share admin access"], correct: 1 },
      { question: "What should you consider when choosing a cloud provider?", options: ["Only price", "Security, compliance, reliability, and support", "Just the logo", "Number of employees"], correct: 1 }
    ]
  },
  {
    id: "network-security",
    title: "Network Security",
    description: "Secure your business network from threats.",
    duration: "25 min",
    tokensReward: 175,
    quiz: [
      { question: "What is a firewall?", options: ["Physical wall", "Network security system that monitors traffic", "Antivirus software", "Email filter"], correct: 1 },
      { question: "What is a VPN used for?", options: ["Faster internet", "Secure encrypted connection over public networks", "Video conferencing", "File storage"], correct: 1 },
      { question: "What is network segmentation?", options: ["Cutting cables", "Dividing network into isolated sections", "Removing users", "Slowing down traffic"], correct: 1 }
    ]
  },
  {
    id: "incident-response",
    title: "Security Incident Response",
    description: "Know how to respond when security incidents occur.",
    duration: "20 min",
    tokensReward: 150,
    quiz: [
      { question: "What is the first step in incident response?", options: ["Delete everything", "Identify and contain the incident", "Blame someone", "Ignore it"], correct: 1 },
      { question: "Who should be notified during a security incident?", options: ["No one", "Relevant stakeholders per incident response plan", "Everyone on social media", "Only the CEO"], correct: 1 },
      { question: "What should you do after resolving an incident?", options: ["Forget about it", "Document lessons learned and improve defenses", "Fire the IT team", "Celebrate immediately"], correct: 1 }
    ]
  }
];

const SECURITY_CHECKLIST = [
  { category: "Access Control", items: ["Strong password policy", "Multi-factor authentication", "Regular access reviews", "Principle of least privilege"] },
  { category: "Data Protection", items: ["Data encryption at rest", "Data encryption in transit", "Regular backups", "Backup testing"] },
  { category: "Network Security", items: ["Firewall configured", "VPN for remote access", "Network monitoring", "Intrusion detection"] },
  { category: "Endpoint Security", items: ["Antivirus/antimalware", "Automatic updates", "Device encryption", "Mobile device management"] },
  { category: "Training", items: ["Security awareness training", "Phishing simulations", "Incident response drills", "Policy acknowledgment"] },
];

const COMMON_THREATS = [
  { name: "Phishing", description: "Fraudulent emails/messages to steal credentials", prevention: "Training, email filters, MFA", severity: "High" },
  { name: "Ransomware", description: "Malware that encrypts files for ransom", prevention: "Backups, updates, email security", severity: "Critical" },
  { name: "Social Engineering", description: "Manipulating people to reveal information", prevention: "Training, verification procedures", severity: "High" },
  { name: "Insider Threats", description: "Threats from employees or contractors", prevention: "Access controls, monitoring, offboarding", severity: "High" },
  { name: "Malware", description: "Malicious software (viruses, trojans, etc.)", prevention: "Antivirus, updates, safe browsing", severity: "High" },
  { name: "DDoS Attacks", description: "Overwhelming systems with traffic", prevention: "DDoS protection, redundancy", severity: "Medium" },
];

export default function ITSimulator() {
  const [activeTab, setActiveTab] = useState("training");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({});

  const module = IT_MODULES[currentModule];
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
    if (currentModule < IT_MODULES.length - 1) {
      setCurrentModule(prev => prev + 1);
      setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false);
    }
  };

  const handleRestartModule = () => { setCurrentQuestion(0); setSelectedAnswer(null); setQuizScore(0); setShowResults(false); };

  const completedModules = Object.values(moduleProgress).filter(m => m.completed).length;
  const overallProgress = Math.round((completedModules / IT_MODULES.length) * 100);
  const totalChecklistItems = SECURITY_CHECKLIST.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedChecklist = Object.values(checklistItems).filter(Boolean).length;

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Monitor className="w-6 h-6 text-cyan-600" />
              IT Simulator
            </h1>
            <p className="text-muted-foreground">Master IT security and infrastructure</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-cyan-600 border-cyan-300">
              <Award className="w-4 h-4 mr-1" />{totalTokensEarned} Tokens Earned
            </Badge>
            <Button variant="outline" asChild><Link href="/dept/it"><ArrowLeft className="w-4 h-4 mr-2" />Back to IT</Link></Button>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedModules}/{IT_MODULES.length} modules</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent></Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="training"><BookOpen className="w-4 h-4 mr-2" />Training</TabsTrigger>
            <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
            <TabsTrigger value="threats"><AlertTriangle className="w-4 h-4 mr-2" />Threats</TabsTrigger>
            <TabsTrigger value="infrastructure"><Server className="w-4 h-4 mr-2" />Infrastructure</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Modules</h3>
                {IT_MODULES.map((mod, index) => {
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
                          {currentModule < IT_MODULES.length - 1 && <Button onClick={handleNextModule}>Next Module<ArrowRight className="w-4 h-4 ml-2" /></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-cyan-600" />Security Checklist</CardTitle>
                <CardDescription>Assess your organization's security posture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Security Score</span>
                    <span>{completedChecklist}/{totalChecklistItems} items</span>
                  </div>
                  <Progress value={(completedChecklist / totalChecklistItems) * 100} className="h-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SECURITY_CHECKLIST.map((category) => (
                    <Card key={category.category}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {category.items.map((item) => {
                          const key = `${category.category}-${item}`;
                          return (
                            <div key={item} className="flex items-center gap-2 cursor-pointer" onClick={() => setChecklistItems(prev => ({ ...prev, [key]: !prev[key] }))}>
                              <div className={`w-4 h-4 rounded border ${checklistItems[key] ? 'bg-cyan-600 border-cyan-600' : 'border-gray-300'} flex items-center justify-center`}>
                                {checklistItems[key] && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-sm">{item}</span>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMMON_THREATS.map((threat) => (
                <Card key={threat.name}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{threat.name}</CardTitle>
                      <Badge variant={threat.severity === "Critical" ? "destructive" : threat.severity === "High" ? "default" : "secondary"}>
                        {threat.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{threat.description}</p>
                    <div className="p-2 bg-cyan-50 rounded">
                      <p className="text-xs font-medium text-cyan-800">Prevention:</p>
                      <p className="text-xs text-cyan-700">{threat.prevention}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="infrastructure">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Cloud className="w-5 h-5 text-cyan-600" />Cloud Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { type: "IaaS", name: "Infrastructure as a Service", examples: "AWS EC2, Azure VMs, Google Compute", you_manage: "OS, apps, data" },
                    { type: "PaaS", name: "Platform as a Service", examples: "Heroku, Google App Engine, Azure App Service", you_manage: "Apps, data" },
                    { type: "SaaS", name: "Software as a Service", examples: "Google Workspace, Microsoft 365, Salesforce", you_manage: "Data, user access" },
                  ].map((service) => (
                    <div key={service.type} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-cyan-600">{service.type}</Badge>
                        <span className="font-medium text-sm">{service.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">Examples: {service.examples}</p>
                      <p className="text-xs">You manage: <span className="font-medium">{service.you_manage}</span></p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-cyan-600" />Essential IT Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { category: "Communication", tools: ["Email (Google/Microsoft)", "Slack/Teams", "Video conferencing"] },
                    { category: "Productivity", tools: ["Document suite", "Project management", "File storage"] },
                    { category: "Security", tools: ["Password manager", "Antivirus", "VPN", "MFA"] },
                    { category: "Backup", tools: ["Cloud backup", "Local backup", "Disaster recovery"] },
                  ].map((cat) => (
                    <div key={cat.category} className="p-3 border rounded-lg">
                      <p className="font-medium text-sm mb-2">{cat.category}</p>
                      <div className="flex flex-wrap gap-1">
                        {cat.tools.map((tool) => (
                          <Badge key={tool} variant="secondary" className="text-xs">{tool}</Badge>
                        ))}
                      </div>
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
