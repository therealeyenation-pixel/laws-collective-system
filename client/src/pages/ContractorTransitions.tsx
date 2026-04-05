import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Users, 
  GraduationCap, 
  Building2, 
  FileSignature, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Shield,
  Lock,
  Unlock,
  TrendingUp,
  Target,
  Award,
  Briefcase,
  Plus,
  RefreshCw
} from "lucide-react";

// Phase configuration with icons and colors
const PHASE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  initiated: { icon: <Clock className="w-4 h-4" />, color: "text-blue-600", bgColor: "bg-blue-100" },
  training_assigned: { icon: <GraduationCap className="w-4 h-4" />, color: "text-purple-600", bgColor: "bg-purple-100" },
  training_in_progress: { icon: <GraduationCap className="w-4 h-4" />, color: "text-purple-600", bgColor: "bg-purple-100" },
  training_completed: { icon: <Award className="w-4 h-4" />, color: "text-green-600", bgColor: "bg-green-100" },
  entity_formation: { icon: <Building2 className="w-4 h-4" />, color: "text-orange-600", bgColor: "bg-orange-100" },
  entity_verified: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-600", bgColor: "bg-green-100" },
  contract_pending: { icon: <FileSignature className="w-4 h-4" />, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  contract_signed: { icon: <FileSignature className="w-4 h-4" />, color: "text-green-600", bgColor: "bg-green-100" },
  completed: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-600", bgColor: "bg-emerald-100" },
  cancelled: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-red-600", bgColor: "bg-red-100" },
};

export default function ContractorTransitions() {
  const [selectedTransition, setSelectedTransition] = useState<number | null>(null);
  const [isInitiateDialogOpen, setIsInitiateDialogOpen] = useState(false);
  const [newTransition, setNewTransition] = useState({
    employeeId: "",
    reason: "",
    notes: "",
  });

  // Fetch data
  const { data: dashboard, refetch: refetchDashboard } = trpc.contractorTransition.getDashboard.useQuery();
  const { data: transitions, refetch: refetchTransitions } = trpc.contractorTransition.getTransitions.useQuery({});
  const { data: phaseInfo } = trpc.contractorTransition.getPhaseInfo.useQuery();
  const { data: employees } = trpc.employees.getAll.useQuery();
  const { data: transitionDetails, refetch: refetchDetails } = trpc.contractorTransition.getTransition.useQuery(
    { transitionId: selectedTransition! },
    { enabled: !!selectedTransition }
  );

  // Mutations
  const initiateTransition = trpc.contractorTransition.initiateTransition.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsInitiateDialogOpen(false);
      setNewTransition({ employeeId: "", reason: "", notes: "" });
      refetchDashboard();
      refetchTransitions();
    },
    onError: (error) => toast.error(error.message),
  });

  const assignTraining = trpc.contractorTransition.assignTraining.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchDetails();
      refetchTransitions();
    },
    onError: (error) => toast.error(error.message),
  });

  const completeTraining = trpc.contractorTransition.completeTraining.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchDetails();
      refetchTransitions();
    },
    onError: (error) => toast.error(error.message),
  });

  // Get eligible employees (only those with workerType = "employee")
  const eligibleEmployees = employees?.filter(e => e.workerType === "employee") || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contractor Transitions</h1>
            <p className="text-muted-foreground mt-1">
              Manage employee-to-contractor transitions with gated verification
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { refetchDashboard(); refetchTransitions(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isInitiateDialogOpen} onOpenChange={setIsInitiateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-700 hover:bg-green-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Initiate Transition
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Initiate Contractor Transition</DialogTitle>
                  <DialogDescription>
                    Start the employee-to-contractor transition process. The employee must complete all required gates before becoming a contractor.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Employee</Label>
                    <Select 
                      value={newTransition.employeeId} 
                      onValueChange={(v) => setNewTransition(prev => ({ ...prev, employeeId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleEmployees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.firstName} {emp.lastName} - {emp.jobTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for Transition</Label>
                    <Textarea
                      placeholder="Explain why this employee is transitioning to contractor status..."
                      value={newTransition.reason}
                      onChange={(e) => setNewTransition(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Notes (Optional)</Label>
                    <Textarea
                      placeholder="Any additional notes..."
                      value={newTransition.notes}
                      onChange={(e) => setNewTransition(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInitiateDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => initiateTransition.mutate({
                      employeeId: parseInt(newTransition.employeeId),
                      reason: newTransition.reason,
                      notes: newTransition.notes || undefined,
                    })}
                    disabled={!newTransition.employeeId || newTransition.reason.length < 10}
                  >
                    Initiate Transition
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transitions</p>
                  <p className="text-2xl font-bold">{dashboard?.summary.totalTransitions || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-orange-600">{dashboard?.summary.activeTransitions || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{dashboard?.summary.completedTransitions || 0}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Businesses Formed</p>
                  <p className="text-2xl font-bold text-purple-600">{dashboard?.summary.activeContractorBusinesses || 0}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Subscribers</p>
                  <p className="text-2xl font-bold text-emerald-600">{dashboard?.summary.platformSubscribers || 0}</p>
                </div>
                <Briefcase className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Transitions by Phase */}
        {dashboard?.activeTransitionsByPhase && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Transitions by Phase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Initiated: {dashboard.activeTransitionsByPhase.initiated}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Training: {dashboard.activeTransitionsByPhase.training}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Entity Formation: {dashboard.activeTransitionsByPhase.entityFormation}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
                  <FileSignature className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Contract Pending: {dashboard.activeTransitionsByPhase.contractPending}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="transitions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transitions">All Transitions</TabsTrigger>
            <TabsTrigger value="requirements">Requirements & Gates</TabsTrigger>
            <TabsTrigger value="training">Training Modules</TabsTrigger>
          </TabsList>

          {/* Transitions List */}
          <TabsContent value="transitions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Transitions List */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transition Pipeline</CardTitle>
                    <CardDescription>Click on a transition to view details and manage gates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transitions?.map((transition) => {
                        const phaseConfig = PHASE_CONFIG[transition.phase] || PHASE_CONFIG.initiated;
                        return (
                          <div
                            key={transition.id}
                            onClick={() => setSelectedTransition(transition.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              selectedTransition === transition.id ? "border-green-500 bg-green-50" : "hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${phaseConfig.bgColor}`}>
                                  {phaseConfig.icon}
                                </div>
                                <div>
                                  <p className="font-medium">{transition.employeeName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {transition.phaseInfo?.label || transition.phase}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <Badge variant={transition.status === "completed" ? "default" : transition.status === "cancelled" ? "destructive" : "secondary"}>
                                    {transition.status}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {transition.progressPercent}% complete
                                  </p>
                                </div>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 transition-all"
                                style={{ width: `${transition.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {(!transitions || transitions.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No transitions yet</p>
                          <p className="text-sm">Click "Initiate Transition" to start</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transition Details */}
              <div className="space-y-4">
                {transitionDetails ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Transition Details</CardTitle>
                        <CardDescription>{transitionDetails.employeeName}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current Phase</span>
                            <Badge className={PHASE_CONFIG[transitionDetails.phase]?.bgColor}>
                              {transitionDetails.phaseInfo?.label}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{transitionDetails.progressPercent}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={transitionDetails.status === "completed" ? "default" : "secondary"}>
                              {transitionDetails.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Gate Status */}
                        <div className="pt-4 border-t">
                          <p className="font-medium mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Gate Status
                          </p>
                          <div className="space-y-2">
                            {Object.entries(transitionDetails.gateStatus).map(([gate, passed]) => (
                              <div key={gate} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  {passed ? (
                                    <Unlock className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-red-500" />
                                  )}
                                  {gate.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </span>
                                <Badge variant={passed ? "default" : "outline"} className={passed ? "bg-green-100 text-green-800" : ""}>
                                  {passed ? "Passed" : "Pending"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions based on phase */}
                        <div className="pt-4 border-t space-y-2">
                          {transitionDetails.phase === "initiated" && (
                            <Button 
                              className="w-full"
                              onClick={() => assignTraining.mutate({ transitionId: transitionDetails.id })}
                            >
                              <GraduationCap className="w-4 h-4 mr-2" />
                              Assign Training
                            </Button>
                          )}
                          {(transitionDetails.phase === "training_assigned" || transitionDetails.phase === "training_in_progress") && (
                            <Button 
                              className="w-full"
                              onClick={() => completeTraining.mutate({ 
                                transitionId: transitionDetails.id,
                                finalScore: 85 // Demo score
                              })}
                            >
                              <Award className="w-4 h-4 mr-2" />
                              Complete Training (Demo)
                            </Button>
                          )}
                          {transitionDetails.phase === "training_completed" && (
                            <Button className="w-full" variant="outline">
                              <Building2 className="w-4 h-4 mr-2" />
                              Start Entity Formation
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Blocked Gates Warning */}
                    {transitionDetails.canAdvanceToNextPhase && !transitionDetails.canAdvanceToNextPhase.canAdvance && (
                      <Card className="border-orange-200 bg-orange-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                            <AlertTriangle className="w-5 h-5" />
                            Blocked Gates
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1 text-sm text-orange-700">
                            {transitionDetails.canAdvanceToNextPhase.blockedBy.map((blocker, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <Lock className="w-3 h-3" />
                                {blocker}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a transition to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Requirements & Gates */}
          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle>Transition Requirements & Gates</CardTitle>
                <CardDescription>
                  Employees must pass ALL gates before becoming contractors. This prevents premature transitions and ensures compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gate 1: Training */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Gate 1: Training Completion</h3>
                        <p className="text-sm text-muted-foreground">Required certification</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Complete all 8 training modules
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Pass with minimum 80% score
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Receive contractor certification
                      </li>
                    </ul>
                  </div>

                  {/* Gate 2: Entity Formation */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <Building2 className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Gate 2: Entity Formation</h3>
                        <p className="text-sm text-muted-foreground">Business establishment</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Register LLC or Corporation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Obtain EIN from IRS
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Open business bank account
                      </li>
                    </ul>
                  </div>

                  {/* Gate 3: Contract */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FileSignature className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Gate 3: Contract Execution</h3>
                        <p className="text-sm text-muted-foreground">Legal agreement</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Review contractor agreement
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Accept platform license terms
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Sign contractor agreement
                      </li>
                    </ul>
                  </div>

                  {/* Platform Lock-In */}
                  <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800">Platform Lock-In</h3>
                        <p className="text-sm text-green-600">Prevents system duplication</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Must use L.A.W.S. Business OS for invoicing
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Non-compete clause for transition methodology
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        IP assignment for system improvements
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Platform subscription required
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Modules */}
          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>Required Training Modules</CardTitle>
                <CardDescription>
                  All employees must complete these modules before transitioning to contractor status.
                  Total: {phaseInfo?.totalTrainingHours || 14.5} hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phaseInfo?.requiredTraining.map((module, index) => (
                    <div key={module.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                          <h4 className="font-medium">{module.title}</h4>
                        </div>
                        <Badge variant="outline">{module.estimatedHours}h</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Target className="w-3 h-3" />
                        Passing score: {module.passingScore}%
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
