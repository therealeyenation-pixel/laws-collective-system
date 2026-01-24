import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import {
  GraduationCap,
  Shield,
  Users,
  Building2,
  Laptop,
  FileText,
  Award,
  Clock,
  CheckCircle2,
  Circle,
  Lock,
  Play,
  BookOpen,
  Target,
  Briefcase,
  Heart,
  Scale,
  DollarSign,
  Megaphone,
  Settings,
  ClipboardCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  Zap,
  Star,
  TrendingUp,
} from "lucide-react";

// Training Categories
const TRAINING_CATEGORIES = {
  companyWide: {
    id: "company-wide",
    title: "Company-Wide Training",
    description: "Required training for all employees",
    icon: Building2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    requiredFor: "All Employees",
  },
  newEmployee: {
    id: "new-employee",
    title: "New Employee Onboarding",
    description: "Essential training for new hires",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    requiredFor: "New Hires (First 30 Days)",
  },
  department: {
    id: "department",
    title: "Department Training",
    description: "Role-specific procedures and skills",
    icon: Briefcase,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    requiredFor: "Department Members",
  },
  position: {
    id: "position",
    title: "Position-Specific Training",
    description: "Job-specific scenarios and certifications",
    icon: Target,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    requiredFor: "Specific Positions",
  },
  compliance: {
    id: "compliance",
    title: "Compliance & Recertification",
    description: "Annual refreshers and regulatory requirements",
    icon: RefreshCw,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    requiredFor: "As Required",
  },
};

// Company-Wide Training Modules
const COMPANY_WIDE_MODULES = [
  {
    id: "security-certification",
    title: "IT Security Certification",
    description: "Required cybersecurity awareness training for all employees",
    icon: Shield,
    duration: "45 min",
    modules: 5,
    required: true,
    blocksAccess: true,
    topics: [
      "Phishing email identification",
      "Password security and MFA",
      "Data handling and classification",
      "Incident reporting procedures",
      "Remote work security protocols",
    ],
    recertification: "Annual",
  },
  {
    id: "harassment-prevention",
    title: "Harassment Prevention",
    description: "Creating a respectful workplace environment",
    icon: Users,
    duration: "30 min",
    modules: 3,
    required: true,
    blocksAccess: false,
    topics: [
      "Recognizing harassment",
      "Reporting procedures",
      "Bystander intervention",
    ],
    recertification: "Annual",
  },
  {
    id: "company-policies",
    title: "Company Policies & Procedures",
    description: "Understanding organizational policies and expectations",
    icon: FileText,
    duration: "25 min",
    modules: 4,
    required: true,
    blocksAccess: false,
    topics: [
      "Employee handbook overview",
      "Time and attendance policies",
      "Communication guidelines",
      "Expense and reimbursement",
    ],
    recertification: null,
  },
  {
    id: "data-privacy",
    title: "Data Privacy & GDPR",
    description: "Handling personal and sensitive data responsibly",
    icon: Lock,
    duration: "35 min",
    modules: 4,
    required: true,
    blocksAccess: false,
    topics: [
      "Data privacy principles",
      "PII identification",
      "Data subject rights",
      "Breach notification",
    ],
    recertification: "Annual",
  },
];

// New Employee Onboarding Modules
const NEW_EMPLOYEE_MODULES = [
  {
    id: "company-orientation",
    title: "Company Orientation",
    description: "Introduction to L.A.W.S. Collective and our mission",
    icon: Building2,
    duration: "40 min",
    modules: 5,
    required: true,
    topics: [
      "Company history and mission",
      "Organizational structure",
      "Core values and culture",
      "Entity overview (5 subsidiaries)",
      "L.A.W.S. framework introduction",
    ],
  },
  {
    id: "systems-intro",
    title: "Systems & Tools Introduction",
    description: "Getting started with company technology",
    icon: Laptop,
    duration: "30 min",
    modules: 4,
    required: true,
    topics: [
      "Email and calendar setup",
      "Communication tools (Teams/Slack)",
      "Document management",
      "Time tracking system",
    ],
  },
  {
    id: "hr-essentials",
    title: "HR Essentials",
    description: "Benefits, policies, and employee resources",
    icon: Heart,
    duration: "25 min",
    modules: 3,
    required: true,
    topics: [
      "Benefits enrollment",
      "PTO and leave policies",
      "Employee resources",
    ],
  },
  {
    id: "culture-values",
    title: "Culture & Values",
    description: "Understanding our community-focused approach",
    icon: Star,
    duration: "20 min",
    modules: 2,
    required: true,
    topics: [
      "Multi-generational wealth building",
      "Community impact focus",
    ],
  },
];

// Department-Specific Training
const DEPARTMENT_MODULES: Record<string, { id: string; title: string; description: string; icon: any; duration: string; modules: number; topics: string[] }[]> = {
  finance: [
    {
      id: "finance-policies",
      title: "Financial Policies & Procedures",
      description: "Grant compliance, expense approval, and reporting",
      icon: DollarSign,
      duration: "45 min",
      modules: 5,
      topics: ["Grant financial management", "Expense approval workflows", "Budget management", "Financial reporting", "Audit preparation"],
    },
    {
      id: "accounting-software",
      title: "Accounting Software Training",
      description: "QuickBooks and financial systems",
      icon: Laptop,
      duration: "60 min",
      modules: 6,
      topics: ["QuickBooks navigation", "Invoice processing", "Reconciliation", "Report generation", "Multi-entity accounting", "Grant tracking"],
    },
  ],
  hr: [
    {
      id: "hr-policies",
      title: "HR Policies & Employment Law",
      description: "Employment regulations and compliance",
      icon: Scale,
      duration: "50 min",
      modules: 5,
      topics: ["Employment law basics", "Hiring procedures", "Performance management", "Termination procedures", "Documentation requirements"],
    },
    {
      id: "interview-procedures",
      title: "Interview & Hiring Process",
      description: "Formal interview procedures and panel requirements",
      icon: Users,
      duration: "40 min",
      modules: 4,
      topics: ["Interview panel setup", "Remote interview procedures", "Candidate evaluation", "Offer process"],
    },
  ],
  it: [
    {
      id: "it-infrastructure",
      title: "IT Infrastructure & Systems",
      description: "Network, cloud, and system administration",
      icon: Settings,
      duration: "90 min",
      modules: 8,
      topics: ["Network topology", "Cloud platforms (AWS/Azure)", "System monitoring", "Backup procedures", "Disaster recovery", "Access control", "Security protocols", "Change management"],
    },
    {
      id: "helpdesk-procedures",
      title: "Helpdesk & Support Procedures",
      description: "Ticket management and user support",
      icon: ClipboardCheck,
      duration: "45 min",
      modules: 4,
      topics: ["Ticket triage", "SLA requirements", "Escalation procedures", "User communication"],
    },
    {
      id: "incident-response",
      title: "Security Incident Response",
      description: "Handling security incidents and breaches",
      icon: AlertTriangle,
      duration: "60 min",
      modules: 5,
      topics: ["Incident identification", "Response procedures", "Containment strategies", "Recovery steps", "Post-incident review"],
    },
  ],
  legal: [
    {
      id: "legal-procedures",
      title: "Legal Department Procedures",
      description: "Contract review and compliance processes",
      icon: Scale,
      duration: "55 min",
      modules: 5,
      topics: ["Contract review process", "Compliance reporting", "Document retention", "Legal research", "Risk assessment"],
    },
    {
      id: "contract-management",
      title: "Contract Management",
      description: "Contract lifecycle and negotiation",
      icon: FileText,
      duration: "50 min",
      modules: 5,
      topics: ["Contract templates", "Negotiation procedures", "Approval workflows", "Execution process", "Renewal tracking"],
    },
  ],
  operations: [
    {
      id: "ops-procedures",
      title: "Operations Procedures",
      description: "Cross-department coordination and workflows",
      icon: Settings,
      duration: "45 min",
      modules: 4,
      topics: ["Process documentation", "Cross-department coordination", "Reporting requirements", "Performance metrics"],
    },
  ],
  marketing: [
    {
      id: "brand-guidelines",
      title: "Brand Guidelines & Style",
      description: "Maintaining brand consistency",
      icon: Megaphone,
      duration: "35 min",
      modules: 3,
      topics: ["Brand voice", "Visual identity", "Content guidelines"],
    },
    {
      id: "real-eye-nation",
      title: "Real-Eye-Nation Creative Services",
      description: "Media production and creative processes",
      icon: Star,
      duration: "40 min",
      modules: 4,
      topics: ["Creative brief process", "Production workflow", "Quality standards", "Client communication"],
    },
  ],
  education: [
    {
      id: "curriculum-development",
      title: "Curriculum Development",
      description: "Creating educational content",
      icon: BookOpen,
      duration: "60 min",
      modules: 5,
      topics: ["Learning objectives", "Content structure", "Assessment design", "LMS management", "Student engagement"],
    },
    {
      id: "academy-procedures",
      title: "Academy Operations",
      description: "LuvOnPurpose Academy procedures",
      icon: GraduationCap,
      duration: "45 min",
      modules: 4,
      topics: ["Student enrollment", "Course delivery", "Progress tracking", "Certification issuance"],
    },
  ],
};

// Compliance/Recertification Modules
const COMPLIANCE_MODULES = [
  {
    id: "annual-security",
    title: "Annual Security Recertification",
    description: "Yearly cybersecurity refresher",
    icon: Shield,
    duration: "30 min",
    modules: 3,
    frequency: "Annual",
    dueDate: "December 31",
  },
  {
    id: "annual-harassment",
    title: "Harassment Prevention Refresher",
    description: "Annual workplace conduct review",
    icon: Users,
    duration: "20 min",
    modules: 2,
    frequency: "Annual",
    dueDate: "December 31",
  },
  {
    id: "data-privacy-refresh",
    title: "Data Privacy Update",
    description: "Updates to privacy regulations",
    icon: Lock,
    duration: "25 min",
    modules: 2,
    frequency: "Annual",
    dueDate: "March 31",
  },
];

// User's training progress (mock data - would come from database)
interface TrainingProgress {
  moduleId: string;
  status: "not_started" | "in_progress" | "completed";
  completedModules: number;
  totalModules: number;
  score?: number;
  completedAt?: string;
  expiresAt?: string;
}

export default function TrainingHub() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("company-wide");
  const [searchQuery, setSearchQuery] = useState("");
  const [userProgress, setUserProgress] = useState<Record<string, TrainingProgress>>({});
  const [selectedDepartment, setSelectedDepartment] = useState<string>("finance");

  // Mock user progress - in production, fetch from database
  useEffect(() => {
    // Simulate fetching user progress
    setUserProgress({
      "security-certification": { moduleId: "security-certification", status: "completed", completedModules: 5, totalModules: 5, score: 92, completedAt: "2024-11-15", expiresAt: "2025-11-15" },
      "harassment-prevention": { moduleId: "harassment-prevention", status: "completed", completedModules: 3, totalModules: 3, score: 100, completedAt: "2024-11-10" },
      "company-policies": { moduleId: "company-policies", status: "in_progress", completedModules: 2, totalModules: 4 },
      "company-orientation": { moduleId: "company-orientation", status: "completed", completedModules: 5, totalModules: 5, score: 95, completedAt: "2024-10-01" },
    });
  }, []);

  const getProgressStatus = (moduleId: string) => {
    return userProgress[moduleId] || { moduleId, status: "not_started", completedModules: 0, totalModules: 0 };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/30">Not Started</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    const allRequired = [...COMPANY_WIDE_MODULES.filter(m => m.required), ...NEW_EMPLOYEE_MODULES.filter(m => m.required)];
    const completed = allRequired.filter(m => getProgressStatus(m.id).status === "completed").length;
    return Math.round((completed / allRequired.length) * 100);
  };

  const renderModuleCard = (module: any, showDepartment?: boolean) => {
    const progress = getProgressStatus(module.id);
    const Icon = module.icon;
    
    return (
      <Card key={module.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${module.required ? "bg-red-500/10" : "bg-primary/10"}`}>
              <Icon className={`w-6 h-6 ${module.required ? "text-red-500" : "text-primary"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{module.title}</h3>
                {module.required && (
                  <Badge variant="outline" className="text-red-500 border-red-500/30 text-xs">Required</Badge>
                )}
                {module.blocksAccess && (
                  <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-xs">Blocks Access</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {module.duration}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {module.modules} modules
                </span>
                {module.recertification && (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    {module.recertification}
                  </span>
                )}
              </div>

              {module.topics && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Topics covered:</p>
                  <div className="flex flex-wrap gap-1">
                    {module.topics.slice(0, 3).map((topic: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{topic}</Badge>
                    ))}
                    {module.topics.length > 3 && (
                      <Badge variant="secondary" className="text-xs">+{module.topics.length - 3} more</Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(progress.status)}
                  {getStatusBadge(progress.status)}
                  {progress.score && (
                    <span className="text-xs text-muted-foreground">Score: {progress.score}%</span>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant={progress.status === "completed" ? "outline" : "default"}
                  className="gap-1"
                >
                  {progress.status === "completed" ? (
                    <>Review</>
                  ) : progress.status === "in_progress" ? (
                    <>Continue <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <>Start <Play className="w-4 h-4" /></>
                  )}
                </Button>
              </div>

              {progress.status === "in_progress" && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{progress.completedModules}/{progress.totalModules} modules</span>
                  </div>
                  <Progress value={(progress.completedModules / progress.totalModules) * 100} className="h-2" />
                </div>
              )}

              {progress.expiresAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Expires: {new Date(progress.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Training Hub</h1>
            <p className="text-muted-foreground mt-1">
              Complete required training and develop your skills
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search training..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Link href="/certificates">
              <Button variant="outline" className="gap-2">
                <Award className="w-4 h-4" />
                My Certificates
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your Training Progress</h2>
                <p className="text-sm text-muted-foreground">Required training completion status</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{calculateOverallProgress()}%</p>
                  <p className="text-xs text-muted-foreground">Overall Complete</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">
                    {Object.values(userProgress).filter(p => p.status === "completed").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Modules Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-500">
                    {Object.values(userProgress).filter(p => p.status === "in_progress").length}
                  </p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={calculateOverallProgress()} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-5 w-full">
            {Object.entries(TRAINING_CATEGORIES).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={key} value={category.id} className="gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{category.title.split(" ")[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Company-Wide Training */}
          <TabsContent value="company-wide" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Company-Wide Training</h2>
              <p className="text-sm text-muted-foreground">Required training for all employees. Security certification must be completed before system access is granted.</p>
            </div>
            <div className="grid gap-4">
              {COMPANY_WIDE_MODULES.map(module => renderModuleCard(module))}
            </div>
          </TabsContent>

          {/* New Employee Onboarding */}
          <TabsContent value="new-employee" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">New Employee Onboarding</h2>
              <p className="text-sm text-muted-foreground">Complete within your first 30 days. These modules introduce you to our organization and culture.</p>
            </div>
            <div className="grid gap-4">
              {NEW_EMPLOYEE_MODULES.map(module => renderModuleCard(module))}
            </div>
          </TabsContent>

          {/* Department Training */}
          <TabsContent value="department" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Department Training</h2>
              <p className="text-sm text-muted-foreground">Role-specific training for your department. Select your department below.</p>
            </div>
            
            {/* Department Selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.keys(DEPARTMENT_MODULES).map(dept => (
                <Button
                  key={dept}
                  variant={selectedDepartment === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept)}
                  className="capitalize"
                >
                  {dept}
                </Button>
              ))}
            </div>

            <div className="grid gap-4">
              {DEPARTMENT_MODULES[selectedDepartment]?.map(module => renderModuleCard(module))}
            </div>
          </TabsContent>

          {/* Position-Specific Training */}
          <TabsContent value="position" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Position-Specific Training</h2>
              <p className="text-sm text-muted-foreground">Training tied to specific job requirements and certifications.</p>
            </div>
            
            <div className="grid gap-4">
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Position Training Assigned by Manager</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your manager will assign position-specific training based on your role requirements.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link href="/business-simulator">
                      <Button variant="outline" className="gap-2">
                        <Building2 className="w-4 h-4" />
                        Business Simulator
                      </Button>
                    </Link>
                    <Link href="/grant-simulator">
                      <Button variant="outline" className="gap-2">
                        <DollarSign className="w-4 h-4" />
                        Grant Simulator
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance & Recertification */}
          <TabsContent value="compliance" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Compliance & Recertification</h2>
              <p className="text-sm text-muted-foreground">Annual refresher courses and regulatory compliance training.</p>
            </div>
            <div className="grid gap-4">
              {COMPLIANCE_MODULES.map(module => (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-red-500/10">
                        <module.icon className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{module.title}</h3>
                          <Badge variant="outline" className="text-red-500 border-red-500/30 text-xs">
                            {module.frequency}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {module.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {module.modules} modules
                          </span>
                          <span className="flex items-center gap-1 text-amber-500">
                            <AlertTriangle className="w-3 h-3" />
                            Due: {module.dueDate}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" className="gap-1">
                        Start <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Training Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/business-simulator">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium text-sm">Business Simulator</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/grant-simulator">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="font-medium text-sm">Grant Simulator</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/tax-simulator">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <p className="font-medium text-sm">Tax Simulator</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/proposal-simulator">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="font-medium text-sm">Proposal Simulator</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
