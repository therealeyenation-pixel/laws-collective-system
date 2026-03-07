import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  UserCog, 
  Building2, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  AlertCircle,
  Play,
  ChevronRight,
  Briefcase,
  Shield,
  DollarSign,
  FileCheck,
  Users,
  Loader2
} from "lucide-react";
import { Link } from "wouter";

interface TransitionStep {
  id: number;
  name: string;
  description: string;
  status: "completed" | "in_progress" | "pending" | "blocked";
  requirements?: string[];
  linkedModule?: string;
  linkedUrl?: string;
}

interface EmployeeTransition {
  employeeId: number;
  employeeName: string;
  currentRole: string;
  department: string;
  entityName: string;
  initiatedDate: string;
  currentStep: number;
  steps: TransitionStep[];
  estimatedCompletion: string;
}

const TRANSITION_STEPS: TransitionStep[] = [
  {
    id: 1,
    name: "Transition Initiation",
    description: "HR initiates transition request, employee notified and consents",
    status: "pending",
    requirements: ["Manager approval", "HR review", "Employee consent"]
  },
  {
    id: 2,
    name: "Business Entity Formation",
    description: "Complete Business Setup Simulator to form LLC/entity",
    status: "pending",
    requirements: ["Business Setup Simulator completion", "Entity registration", "EIN obtained"],
    linkedModule: "Business Setup Simulator",
    linkedUrl: "/simulators"
  },
  {
    id: 3,
    name: "Contractor Training Module",
    description: "Complete training on 1099 responsibilities and contractor operations",
    status: "pending",
    requirements: ["Complete all training modules", "Pass assessment (80%+)", "Acknowledge terms"],
    linkedModule: "Contractor Readiness Training",
    linkedUrl: "/simulators"
  },
  {
    id: 4,
    name: "Contract Generation",
    description: "Review and sign contractor agreement and related documents",
    status: "pending",
    requirements: ["Independent Contractor Agreement", "Non-Disclosure Agreement", "Scope of Work", "W-9 Form"]
  },
  {
    id: 5,
    name: "Compliance Verification",
    description: "Final compliance checks before status change",
    status: "pending",
    requirements: ["Business entity verified", "Training completed", "Contract signed", "W-9 on file", "Insurance verified"]
  },
  {
    id: 6,
    name: "Status Transition",
    description: "Worker type officially changes from employee to contractor",
    status: "pending",
    requirements: ["All previous steps completed", "Final HR approval", "System update"]
  }
];

const TRAINING_MODULES = [
  {
    id: 1,
    title: "1099 Tax Responsibilities",
    description: "Understanding quarterly taxes, deductions, and self-employment tax",
    duration: "45 min",
    status: "not_started" as const
  },
  {
    id: 2,
    title: "Invoice Submission Process",
    description: "How to create, submit, and track invoices for payment",
    duration: "30 min",
    status: "not_started" as const
  },
  {
    id: 3,
    title: "Contract Terms & Deliverables",
    description: "Understanding your contractor agreement and scope of work",
    duration: "40 min",
    status: "not_started" as const
  },
  {
    id: 4,
    title: "Employee vs Contractor Distinctions",
    description: "Legal differences and why classification matters",
    duration: "35 min",
    status: "not_started" as const
  },
  {
    id: 5,
    title: "Business Insurance Requirements",
    description: "Liability coverage and professional insurance options",
    duration: "25 min",
    status: "not_started" as const
  },
  {
    id: 6,
    title: "Record Keeping & Compliance",
    description: "Documentation requirements and audit preparation",
    duration: "30 min",
    status: "not_started" as const
  }
];

export default function ContractorTransition() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showInitiateDialog, setShowInitiateDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [activeTransitions, setActiveTransitions] = useState<EmployeeTransition[]>([]);
  const [trainingModules, setTrainingModules] = useState(TRAINING_MODULES);

  // Get employees who are eligible for transition (active employees)
  const { data: employees, isLoading: loadingEmployees } = trpc.employees.getAll.useQuery({
    status: "active"
  });

  // Filter to only show employees (not already contractors)
  const eligibleEmployees = employees?.filter(emp => 
    !emp.workerType || emp.workerType === "employee"
  ) || [];

  const handleInitiateTransition = () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }
    
    const employee = eligibleEmployees.find(e => e.id.toString() === selectedEmployee);
    if (!employee) return;

    const newTransition: EmployeeTransition = {
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      currentRole: employee.jobTitle,
      department: employee.department,
      entityName: "The The L.A.W.S. Collective, LLC",
      initiatedDate: new Date().toISOString().split('T')[0],
      currentStep: 1,
      steps: TRANSITION_STEPS.map((step, idx) => ({
        ...step,
        status: idx === 0 ? "in_progress" : "pending"
      })),
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setActiveTransitions([...activeTransitions, newTransition]);
    setShowInitiateDialog(false);
    setSelectedEmployee("");
    toast.success(`Transition initiated for ${employee.firstName} ${employee.lastName}`);
  };

  const getStepIcon = (step: TransitionStep) => {
    switch (step.id) {
      case 1: return <UserCog className="w-5 h-5" />;
      case 2: return <Building2 className="w-5 h-5" />;
      case 3: return <GraduationCap className="w-5 h-5" />;
      case 4: return <FileText className="w-5 h-5" />;
      case 5: return <Shield className="w-5 h-5" />;
      case 6: return <CheckCircle2 className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500 text-white">In Progress</Badge>;
      case "blocked":
        return <Badge className="bg-red-500 text-white">Blocked</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const calculateProgress = (transition: EmployeeTransition) => {
    const completed = transition.steps.filter(s => s.status === "completed").length;
    return Math.round((completed / transition.steps.length) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee to Contractor Transition</h1>
            <p className="text-muted-foreground mt-1">
              Legally compliant pathway for converting employees to independent contractors
            </p>
          </div>
          <Button onClick={() => setShowInitiateDialog(true)} className="gap-2">
            <Play className="w-4 h-4" />
            Initiate Transition
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeTransitions.length}</p>
                  <p className="text-sm text-muted-foreground">Active Transitions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Completed This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">21</p>
                  <p className="text-sm text-muted-foreground">Avg. Days to Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{eligibleEmployees.length}</p>
                  <p className="text-sm text-muted-foreground">Eligible Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Transitions</TabsTrigger>
            <TabsTrigger value="training">Training Modules</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transition Process Overview</CardTitle>
                <CardDescription>
                  6-step process ensuring legal compliance and contractor readiness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {TRANSITION_STEPS.map((step, idx) => (
                    <div key={step.id} className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        {getStepIcon(step)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Step {step.id}: {step.name}</h4>
                          {step.linkedModule && (
                            <Badge variant="outline" className="text-xs">
                              Links to {step.linkedModule}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        {step.requirements && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {step.requirements.map((req, i) => (
                              <span key={i} className="text-xs bg-background px-2 py-1 rounded">
                                {req}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {idx < TRANSITION_STEPS.length - 1 && (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Benefits for the Business</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Legal compliance with IRS contractor classification rules</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Reduced payroll tax burden and benefits costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Documented training creates audit protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Flexible workforce scaling</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Benefits for the Contractor</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Own business entity with growth potential</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Tax deductions for business expenses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Freedom to work with multiple clients</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Access to management tools (optional license)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Active Transitions Tab */}
          <TabsContent value="active" className="space-y-4 mt-6">
            {activeTransitions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <UserCog className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Transitions</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by initiating a transition for an eligible employee
                  </p>
                  <Button onClick={() => setShowInitiateDialog(true)}>
                    Initiate Transition
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeTransitions.map((transition) => (
                <Card key={transition.employeeId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {transition.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{transition.employeeName}</CardTitle>
                          <CardDescription>
                            {transition.currentRole} • {transition.department}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="text-2xl font-bold">{calculateProgress(transition)}%</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={calculateProgress(transition)} className="mb-6" />
                    <div className="grid grid-cols-6 gap-2">
                      {transition.steps.map((step) => (
                        <div 
                          key={step.id} 
                          className={`p-3 rounded-lg text-center ${
                            step.status === "completed" ? "bg-green-100 dark:bg-green-900/30" :
                            step.status === "in_progress" ? "bg-blue-100 dark:bg-blue-900/30" :
                            "bg-secondary/50"
                          }`}
                        >
                          <div className="flex justify-center mb-2">
                            {getStepIcon(step)}
                          </div>
                          <p className="text-xs font-medium truncate">{step.name}</p>
                          {getStatusBadge(step.status)}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Initiated: {transition.initiatedDate}</span>
                      <span>Est. Completion: {transition.estimatedCompletion}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Training Modules Tab */}
          <TabsContent value="training" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contractor Readiness Training</CardTitle>
                <CardDescription>
                  Required training modules for employee-to-contractor transition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingModules.map((module) => (
                    <div 
                      key={module.id} 
                      className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{module.title}</h4>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{module.duration}</span>
                        <Link href="/simulators">
                          <Button variant="outline" size="sm">
                            Start Module
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">Assessment Required</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        After completing all modules, you must pass the assessment with a score of 80% or higher to proceed with the transition.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Transitions Yet</h3>
                <p className="text-muted-foreground">
                  Completed transitions will appear here with full documentation
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Initiate Transition Dialog */}
      <Dialog open={showInitiateDialog} onOpenChange={setShowInitiateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initiate Employee Transition</DialogTitle>
            <DialogDescription>
              Select an employee to begin the contractor transition process
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingEmployees ? (
                    <div className="p-4 text-center">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    </div>
                  ) : (
                    eligibleEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.firstName} {emp.lastName} - {emp.jobTitle}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium mb-2">Transition Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Employee must consent to transition</li>
                <li>• Manager approval required</li>
                <li>• Business entity must be formed</li>
                <li>• Training modules must be completed</li>
                <li>• All contracts must be signed</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInitiateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInitiateTransition}>
              Initiate Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
