import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Loader2,
  Lock,
  Unlock,
  TrendingUp,
  BookOpen,
  ArrowUpRight,
  XCircle,
  RefreshCw,
  Crown,
  Star,
  CalendarClock,
  Timer,
  Award,
  UserCheck
} from "lucide-react";
import { Link } from "wouter";

// Phase label map for display
const PHASE_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  initiated: { label: "Initiated", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: Play },
  training_assigned: { label: "Training Assigned", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", icon: BookOpen },
  training_in_progress: { label: "Training In Progress", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: GraduationCap },
  training_completed: { label: "Training Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2 },
  entity_formation: { label: "Entity Formation", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: Building2 },
  entity_verified: { label: "Entity Verified", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", icon: Shield },
  contract_pending: { label: "Contract Pending", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", icon: FileText },
  contract_signed: { label: "Contract Signed", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300", icon: FileCheck },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

const PHASE_ORDER = [
  "initiated",
  "training_assigned",
  "training_in_progress",
  "training_completed",
  "entity_formation",
  "entity_verified",
  "contract_pending",
  "contract_signed",
  "completed",
];

const TRAINING_MODULES = [
  { id: 1, title: "1099 Tax Responsibilities", description: "Understanding quarterly taxes, deductions, and self-employment tax", duration: "45 min" },
  { id: 2, title: "Invoice Submission Process", description: "How to create, submit, and track invoices for payment", duration: "30 min" },
  { id: 3, title: "Contract Terms & Deliverables", description: "Understanding your contractor agreement and scope of work", duration: "40 min" },
  { id: 4, title: "Employee vs Contractor Distinctions", description: "Legal differences and why classification matters", duration: "35 min" },
  { id: 5, title: "Business Insurance Requirements", description: "Liability coverage and professional insurance options", duration: "25 min" },
  { id: 6, title: "Record Keeping & Compliance", description: "Documentation requirements and audit preparation", duration: "30 min" },
];

export default function ContractorTransition() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showInitiateDialog, setShowInitiateDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [transitionReason, setTransitionReason] = useState("");
  const [showTrainingCheckDialog, setShowTrainingCheckDialog] = useState(false);
  const [selectedTransitionId, setSelectedTransitionId] = useState<number | null>(null);
  const [selectedEmployeeIdForCheck, setSelectedEmployeeIdForCheck] = useState<number | null>(null);

  // ============================================
  // Backend data queries
  // ============================================
  
  // Get employees eligible for transition
  const { data: employeesData, isLoading: loadingEmployees } = trpc.employees.getAll.useQuery({ status: "active" });
  const eligibleEmployees = useMemo(() => {
    if (!employeesData) return [];
    return employeesData.filter((emp: any) => {
      const e = emp.employee || emp;
      return !e.workerType || e.workerType === "employee";
    });
  }, [employeesData]);

  // Get dashboard metrics from backend
  const { data: dashboard, isLoading: loadingDashboard, refetch: refetchDashboard } = trpc.contractorTransition.getDashboard.useQuery();

  // Get phase info
  const { data: phaseInfo } = trpc.contractorTransition.getPhaseInfo.useQuery();

  // Get training stats
  const { data: trainingStats } = trpc.trainingTransition.getTrainingStats.useQuery();

  // 2-Year Eligibility Timeline
  const { data: eligibilityTimeline, isLoading: loadingTimeline } = trpc.contractorTransition.getEligibilityTimeline.useQuery();

  // Founding Member dual-path tracking
  const { data: foundingMemberData, isLoading: loadingFM } = trpc.contractorTransition.getFoundingMemberTransitions.useQuery();

  // Training eligibility check for selected employee
  const { data: eligibilityCheck, refetch: refetchEligibility } = trpc.trainingTransition.checkTransitionEligibility.useQuery(
    { employeeId: selectedEmployeeIdForCheck! },
    { enabled: !!selectedEmployeeIdForCheck }
  );

  // ============================================
  // Mutations
  // ============================================

  const initiateTransition = trpc.contractorTransition.initiateTransition.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowInitiateDialog(false);
      setSelectedEmployee("");
      setTransitionReason("");
      refetchDashboard();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const completeTraining = trpc.contractorTransition.completeTraining.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowTrainingCheckDialog(false);
      refetchDashboard();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelTransition = trpc.contractorTransition.cancelTransition.useMutation({
    onSuccess: () => {
      toast.success("Transition cancelled");
      refetchDashboard();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // ============================================
  // Handlers
  // ============================================

  const handleInitiateTransition = () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }
    if (transitionReason.length < 10) {
      toast.error("Please provide a reason (at least 10 characters)");
      return;
    }
    initiateTransition.mutate({
      employeeId: parseInt(selectedEmployee),
      reason: transitionReason,
    });
  };

  const handleCheckEligibility = (transitionId: number, employeeId: number) => {
    setSelectedTransitionId(transitionId);
    setSelectedEmployeeIdForCheck(employeeId);
    setShowTrainingCheckDialog(true);
    refetchEligibility();
  };

  const handleCompleteTraining = () => {
    if (!selectedTransitionId) return;
    // Use the average score from eligibility check or default 85
    completeTraining.mutate({
      transitionId: selectedTransitionId,
      finalScore: 85,
    });
  };

  const getPhaseProgress = (phase: string) => {
    const idx = PHASE_ORDER.indexOf(phase);
    if (idx === -1) return 0;
    return Math.round(((idx + 1) / PHASE_ORDER.length) * 100);
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchDashboard()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowInitiateDialog(true)} className="gap-2">
              <Play className="w-4 h-4" />
              Initiate Transition
            </Button>
          </div>
        </div>

        {/* Stats Cards - Connected to Backend */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboard?.summary?.activeTransitions ?? 0}</p>
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
                  <p className="text-2xl font-bold">{dashboard?.summary?.completedTransitions ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboard?.summary?.conversionRate ?? 0}%</p>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
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
                  <p className="text-2xl font-bold">{dashboard?.summary?.activeContractorBusinesses ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Active Businesses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">
              Active Transitions
              {(dashboard?.summary?.activeTransitions ?? 0) > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {dashboard?.summary?.activeTransitions}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility Timeline</TabsTrigger>
            <TabsTrigger value="training">Training Tracker</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Transition Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle>Transition Pipeline</CardTitle>
                <CardDescription>
                  Current distribution of active transitions across phases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">{dashboard?.activeTransitionsByPhase?.initiated ?? 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Initiated</p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                    <p className="text-3xl font-bold text-amber-600">{dashboard?.activeTransitionsByPhase?.training ?? 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">In Training</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-600">{dashboard?.activeTransitionsByPhase?.entityFormation ?? 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Entity Formation</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                    <p className="text-3xl font-bold text-orange-600">{dashboard?.activeTransitionsByPhase?.contractPending ?? 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Contract Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Transition Process</CardTitle>
                <CardDescription>
                  9-phase gated process ensuring legal compliance and contractor readiness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {PHASE_ORDER.map((phase, idx) => {
                    const info = PHASE_LABELS[phase];
                    const Icon = info?.icon || Clock;
                    return (
                      <div key={phase} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                          {idx + 1}
                        </div>
                        <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{info?.label}</p>
                        </div>
                        {idx < PHASE_ORDER.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Benefits Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Benefits for the Business</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Legal compliance with IRS contractor classification rules",
                      "Reduced payroll tax burden and benefits costs",
                      "Documented training creates audit protection",
                      "Flexible workforce scaling",
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Benefits for the Contractor</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Own business entity with growth potential",
                      "Tax deductions for business expenses",
                      "Freedom to work with multiple clients",
                      "Access to management tools (optional license)",
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Active Transitions Tab - Connected to Backend */}
          <TabsContent value="active" className="space-y-4 mt-6">
            {loadingDashboard ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Loading transitions...</p>
                </CardContent>
              </Card>
            ) : !dashboard?.recentTransitions || dashboard.recentTransitions.length === 0 ? (
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
              dashboard.recentTransitions.map((transition: any) => {
                const phaseIdx = PHASE_ORDER.indexOf(transition.phase);
                const progress = getPhaseProgress(transition.phase);
                const phaseLabel = PHASE_LABELS[transition.phase];
                const PhaseIcon = phaseLabel?.icon || Clock;
                const isTrainingPhase = ["training_assigned", "training_in_progress"].includes(transition.phase);
                const isActive = transition.status === "active";

                return (
                  <Card key={transition.id} className={!isActive ? "opacity-60" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback>
                              {transition.employeeName?.split(' ').map((n: string) => n[0]).join('') || '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{transition.employeeName}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Badge className={phaseLabel?.color || "bg-gray-100"}>
                                <PhaseIcon className="w-3 h-3 mr-1" />
                                {phaseLabel?.label || transition.phase}
                              </Badge>
                              <span className="text-xs">
                                Started {new Date(transition.createdAt).toLocaleDateString()}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Progress</p>
                          <p className="text-2xl font-bold">{progress}%</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={progress} className="mb-4" />
                      
                      {/* Phase Progress Dots */}
                      <div className="flex items-center gap-1 mb-4">
                        {PHASE_ORDER.map((phase, idx) => (
                          <div key={phase} className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                idx < phaseIdx ? "bg-green-500" :
                                idx === phaseIdx ? "bg-blue-500 ring-2 ring-blue-200" :
                                "bg-gray-200 dark:bg-gray-700"
                              }`}
                              title={PHASE_LABELS[phase]?.label}
                            />
                            {idx < PHASE_ORDER.length - 1 && (
                              <div className={`w-4 h-0.5 ${idx < phaseIdx ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Eligibility Gate Indicator */}
                      {isTrainingPhase && isActive && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                Training Gate: All workshops must be completed before entity formation
                              </span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCheckEligibility(transition.id, transition.employeeId || 0)}
                              className="gap-1 text-amber-700 border-amber-300"
                            >
                              <GraduationCap className="w-3 h-3" />
                              Check Eligibility
                            </Button>
                          </div>
                        </div>
                      )}

                      {transition.phase === "training_completed" && isActive && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-3">
                          <div className="flex items-center gap-2">
                            <Unlock className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Training Gate Passed! Employee is eligible for entity formation.
                            </span>
                            <Link href="/simulators">
                              <Button variant="outline" size="sm" className="ml-auto gap-1">
                                <ArrowUpRight className="w-3 h-3" />
                                Start Entity Formation
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {isActive && transition.status !== "cancelled" && (
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Are you sure you want to cancel this transition?")) {
                                cancelTransition.mutate({
                                  transitionId: transition.id,
                                  reason: "Cancelled by administrator",
                                });
                              }
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Training Tracker Tab - Connected to Backend */}
          <TabsContent value="training" className="space-y-4 mt-6">
            {/* Training Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {trainingStats?.enrollment?.totalEmployeesEnrolled ?? 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Employees Enrolled</p>
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
                      <p className="text-2xl font-bold">
                        {trainingStats?.enrollment?.completedEnrollments ?? 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Courses Completed</p>
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
                      <p className="text-2xl font-bold">
                        {trainingStats?.completion?.totalHoursCompleted 
                          ? parseFloat(trainingStats.completion.totalHoursCompleted).toFixed(1) 
                          : 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Hours Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Required Training Modules */}
            <Card>
              <CardHeader>
                <CardTitle>Contractor Readiness Training</CardTitle>
                <CardDescription>
                  Required training modules for employee-to-contractor transition. 
                  Total: {phaseInfo?.totalTrainingHours ?? 14.5} hours across {phaseInfo?.requiredTraining?.length ?? 8} modules.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(phaseInfo?.requiredTraining || TRAINING_MODULES).map((module: any, idx: number) => {
                    // Find course stats if available
                    const courseStats = trainingStats?.courses?.find((c: any) => c.courseId === module.id);
                    return (
                      <div 
                        key={module.id || idx} 
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{module.title}</h4>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                            {courseStats && (
                              <div className="flex gap-3 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {courseStats.enrolledCount || 0} enrolled
                                </span>
                                <span className="text-xs text-green-600">
                                  {courseStats.passedCount || 0} passed
                                </span>
                                {courseStats.averageScore && (
                                  <span className="text-xs text-blue-600">
                                    Avg: {parseFloat(courseStats.averageScore).toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-sm text-muted-foreground">
                              {module.estimatedHours ? `${module.estimatedHours}h` : module.duration}
                            </span>
                            {module.passingScore && (
                              <p className="text-xs text-muted-foreground">
                                Pass: {module.passingScore}%
                              </p>
                            )}
                          </div>
                          <Link href="/simulators">
                            <Button variant="outline" size="sm">
                              Start Module
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">Eligibility Gate</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        All training modules must be completed with passing scores before the employee becomes eligible for the contractor pathway. 
                        This gate is enforced by the system — entity formation cannot begin until training is certified.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Eligibility Timeline Tab */}
          <TabsContent value="eligibility" className="space-y-6 mt-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{eligibilityTimeline?.summary?.eligibleNow ?? 0}</p>
                      <p className="text-sm text-muted-foreground">Eligible Now</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Timer className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{eligibilityTimeline?.summary?.approachingEligibility ?? 0}</p>
                      <p className="text-sm text-muted-foreground">Approaching (6 mo)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Crown className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{eligibilityTimeline?.summary?.foundingMembers ?? 0}</p>
                      <p className="text-sm text-muted-foreground">Founding Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{eligibilityTimeline?.summary?.coordinators ?? 0}</p>
                      <p className="text-sm text-muted-foreground">Coordinators</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transition Paths Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    Founding Member Path
                  </CardTitle>
                  <CardDescription>After 2-year employee period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { icon: Briefcase, text: "Transition to Independent Contractor" },
                      { icon: Crown, text: "Board Member seat assignment" },
                      { icon: DollarSign, text: "Profit share percentage" },
                      { icon: Shield, text: "Department staffing management" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <item.icon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    Coordinator Path
                  </CardTitle>
                  <CardDescription>After 2-year employee period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { icon: Briefcase, text: "Transition to Independent Contractor" },
                      { icon: TrendingUp, text: "Promotion to Manager role (backfill)" },
                      { icon: GraduationCap, text: "Coordinator role backfilled by new hire" },
                      { icon: Shield, text: "Department operational oversight" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <item.icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Founding Member Dual-Path Tracker */}
            {foundingMemberData && foundingMemberData.foundingMembers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    Founding Member Dual-Path Tracker
                  </CardTitle>
                  <CardDescription>
                    Founding Members receive both Contractor status and Board Member seat with profit share
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {foundingMemberData.foundingMembers.map((fm: any) => (
                      <div key={fm.id} className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-purple-100 text-purple-700">
                                {fm.name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{fm.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {fm.jobTitle || fm.foundingRole?.replace(/_/g, ' ')} &middot; {fm.department || fm.entityName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {fm.isEligible ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Eligible
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <CalendarClock className="w-3 h-3 mr-1" />
                                {fm.daysUntilEligible > 0 ? `${fm.daysUntilEligible} days` : 'Eligible'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {/* Dual path indicators */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className={`p-3 rounded-lg text-center ${
                            fm.contractorPathComplete 
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                              : fm.contractorTransition 
                                ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                                : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                          }`}>
                            <Briefcase className={`w-5 h-5 mx-auto mb-1 ${
                              fm.contractorPathComplete ? 'text-green-600' : fm.contractorTransition ? 'text-amber-600' : 'text-gray-400'
                            }`} />
                            <p className="text-xs font-medium">
                              {fm.contractorPathComplete ? 'Contractor' : fm.contractorTransition ? `Phase: ${fm.contractorTransition.phase.replace(/_/g, ' ')}` : 'Not Started'}
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg text-center ${
                            fm.boardSeatAssigned 
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                              : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                          }`}>
                            <Crown className={`w-5 h-5 mx-auto mb-1 ${
                              fm.boardSeatAssigned ? 'text-green-600' : 'text-gray-400'
                            }`} />
                            <p className="text-xs font-medium">
                              {fm.boardSeatAssigned ? 'Board Seat' : 'Pending'}
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg text-center ${
                            fm.profitShareActive 
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                              : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                          }`}>
                            <DollarSign className={`w-5 h-5 mx-auto mb-1 ${
                              fm.profitShareActive ? 'text-green-600' : 'text-gray-400'
                            }`} />
                            <p className="text-xs font-medium">
                              {fm.profitShareActive ? `${fm.contractorTransition?.profitSharePercent}%` : 'Pending'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Employee Eligibility Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5" />
                  2-Year Eligibility Timeline
                </CardTitle>
                <CardDescription>
                  All active employees sorted by eligibility date. Founding Members (Managers) transition to Contractor + Board Member. Coordinators transition to Contractor and backfill Manager roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTimeline ? (
                  <div className="py-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : !eligibilityTimeline?.timeline?.length ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active employees found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eligibilityTimeline.timeline.map((emp: any) => {
                      const typeConfig = emp.transitionType === 'founding_member'
                        ? { color: 'purple', icon: Crown, label: 'Founding Member' }
                        : emp.transitionType === 'coordinator'
                          ? { color: 'blue', icon: Star, label: 'Coordinator' }
                          : { color: 'gray', icon: Users, label: 'Standard' };
                      const TypeIcon = typeConfig.icon;

                      return (
                        <div
                          key={emp.employeeId}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            emp.isEligible && !emp.alreadyTransitioning
                              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                              : emp.isApproaching && !emp.alreadyTransitioning
                                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                                : emp.alreadyTransitioning
                                  ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                                  : 'bg-secondary/30 border-border'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>
                                {emp.name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{emp.name}</p>
                                <Badge variant="outline" className={`text-xs text-${typeConfig.color}-600 border-${typeConfig.color}-300`}>
                                  <TypeIcon className="w-3 h-3 mr-1" />
                                  {typeConfig.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {emp.jobTitle} &middot; {emp.department}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {emp.isEligible ? 'Eligible' : `${emp.daysUntilEligible} days`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(emp.eligibilityDate).toLocaleDateString()}
                              </p>
                            </div>
                            {emp.alreadyTransitioning ? (
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                In Progress
                              </Badge>
                            ) : emp.isEligible ? (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedEmployee(emp.employeeId.toString());
                                  setShowInitiateDialog(true);
                                }}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Start
                              </Button>
                            ) : emp.isApproaching ? (
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                <Clock className="w-3 h-3 mr-1" />
                                Approaching
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                <Lock className="w-3 h-3 mr-1" />
                                Not Yet
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="mt-6">
            {dashboard?.recentTransitions?.filter((t: any) => t.status === "completed").length ? (
              <div className="space-y-4">
                {dashboard.recentTransitions
                  .filter((t: any) => t.status === "completed")
                  .map((transition: any) => (
                    <Card key={transition.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {transition.employeeName?.split(' ').map((n: string) => n[0]).join('') || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{transition.employeeName}</p>
                              <p className="text-sm text-muted-foreground">
                                Completed {transition.completedDate ? new Date(transition.completedDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-500 text-white">Completed</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Transitions Yet</h3>
                  <p className="text-muted-foreground">
                    Completed transitions will appear here with full documentation
                  </p>
                </CardContent>
              </Card>
            )}
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
                    eligibleEmployees.map((emp: any) => {
                      const e = emp.employee || emp;
                      return (
                        <SelectItem key={e.id} value={e.id.toString()}>
                          {e.firstName} {e.lastName} - {e.jobTitle}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Transition</label>
              <Textarea
                value={transitionReason}
                onChange={(e) => setTransitionReason(e.target.value)}
                placeholder="Explain why this employee is being transitioned to contractor status..."
                rows={3}
              />
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium mb-2">Transition Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Lock className="w-3 h-3" /> All training modules must be completed (Gate 1)
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Business entity must be formed and verified (Gate 2)
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Contractor agreement must be signed (Gate 3)
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInitiateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInitiateTransition}
              disabled={initiateTransition.isPending}
            >
              {initiateTransition.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Initiate Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Training Eligibility Check Dialog */}
      <Dialog open={showTrainingCheckDialog} onOpenChange={setShowTrainingCheckDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Training Eligibility Check
            </DialogTitle>
            <DialogDescription>
              Checking if all required training modules have been completed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {eligibilityCheck ? (
              <>
                <div className={`p-4 rounded-lg border ${
                  eligibilityCheck.eligible 
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}>
                  <div className="flex items-center gap-3">
                    {eligibilityCheck.eligible ? (
                      <Unlock className="w-6 h-6 text-green-600" />
                    ) : (
                      <Lock className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {eligibilityCheck.eligible 
                          ? "Eligible for Contractor Pathway!" 
                          : "Not Yet Eligible"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {eligibilityCheck.completedCount} of {eligibilityCheck.totalRequired} required courses completed
                      </p>
                    </div>
                  </div>
                </div>

                <Progress 
                  value={eligibilityCheck.totalRequired > 0 
                    ? (eligibilityCheck.completedCount / eligibilityCheck.totalRequired) * 100 
                    : 0
                  } 
                />

                {eligibilityCheck.incompleteCourses && eligibilityCheck.incompleteCourses.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Remaining Courses:</p>
                    <div className="space-y-2">
                      {eligibilityCheck.incompleteCourses.map((course: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm">{course.courseName}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{course.durationHours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Checking eligibility...</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrainingCheckDialog(false)}>
              Close
            </Button>
            {eligibilityCheck?.eligible && (
              <Button 
                onClick={handleCompleteTraining}
                disabled={completeTraining.isPending}
                className="gap-2"
              >
                {completeTraining.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Certify & Advance to Entity Formation
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
