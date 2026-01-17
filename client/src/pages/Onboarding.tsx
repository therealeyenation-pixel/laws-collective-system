import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  UserPlus, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Play,
  Loader2,
  FileText,
  Users,
  Building2,
  Calendar,
  ChevronRight,
  Pause
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  not_started: "bg-gray-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  on_hold: "bg-amber-500",
};

const TASK_STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-400",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  skipped: "bg-gray-300",
  blocked: "bg-red-500",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  documentation: <FileText className="w-4 h-4" />,
  equipment: <Building2 className="w-4 h-4" />,
  access: <Users className="w-4 h-4" />,
  training: <ClipboardList className="w-4 h-4" />,
  introduction: <UserPlus className="w-4 h-4" />,
  compliance: <CheckCircle2 className="w-4 h-4" />,
  benefits: <Calendar className="w-4 h-4" />,
  other: <FileText className="w-4 h-4" />,
};

export default function Onboarding() {
  const [selectedOnboarding, setSelectedOnboarding] = useState<number | null>(null);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null);
  const [selectedChecklist, setSelectedChecklist] = useState<number | null>(null);

  const { data: onboardings, isLoading, refetch } = trpc.onboarding.getAllOnboarding.useQuery();
  const { data: stats } = trpc.onboarding.getStats.useQuery();
  const { data: hiredApplications } = trpc.onboarding.getHiredApplications.useQuery();
  const { data: checklists } = trpc.onboarding.getChecklists.useQuery();
  const { data: onboardingDetails, isLoading: detailsLoading } = trpc.onboarding.getOnboardingById.useQuery(
    { id: selectedOnboarding! },
    { enabled: !!selectedOnboarding }
  );

  const startOnboardingMutation = trpc.onboarding.startOnboardingFromApplication.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setStartDialogOpen(false);
      setSelectedApplication(null);
      setSelectedChecklist(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start onboarding");
    },
  });

  const updateTaskMutation = trpc.onboarding.updateTaskProgress.useMutation({
    onSuccess: () => {
      toast.success("Task updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update task");
    },
  });

  const handleStartOnboarding = () => {
    if (!selectedApplication || !selectedChecklist) {
      toast.error("Please select an application and checklist");
      return;
    }

    startOnboardingMutation.mutate({
      applicationId: selectedApplication,
      checklistId: selectedChecklist,
    });
  };

  const handleTaskToggle = (taskProgressId: number, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    updateTaskMutation.mutate({
      taskProgressId,
      status: newStatus,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Onboarding</h1>
            <p className="text-muted-foreground mt-1">Manage new hire onboarding workflows</p>
          </div>
          <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!hiredApplications?.length}>
                <UserPlus className="w-4 h-4" />
                Start Onboarding
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Onboarding</DialogTitle>
                <DialogDescription>
                  Select a hired applicant and onboarding checklist to begin the process.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hired Applicant</label>
                  <Select
                    value={selectedApplication?.toString() || ""}
                    onValueChange={(v) => setSelectedApplication(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select applicant" />
                    </SelectTrigger>
                    <SelectContent>
                      {hiredApplications?.map((app) => (
                        <SelectItem key={app.id} value={app.id.toString()}>
                          {app.firstName} {app.lastName} - {app.positionTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Onboarding Checklist</label>
                  <Select
                    value={selectedChecklist?.toString() || ""}
                    onValueChange={(v) => setSelectedChecklist(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select checklist" />
                    </SelectTrigger>
                    <SelectContent>
                      {checklists?.map((checklist) => (
                        <SelectItem key={checklist.id} value={checklist.id.toString()}>
                          {checklist.name} ({checklist.itemCount} items)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStartDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleStartOnboarding}
                  disabled={startOnboardingMutation.isPending || !selectedApplication || !selectedChecklist}
                >
                  {startOnboardingMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Start Onboarding
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.inProgress || 0}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.completed || 0}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900/30">
                  <Pause className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.onHold || 0}</p>
                  <p className="text-sm text-muted-foreground">On Hold</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active Onboarding</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Onboarding List */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Onboarding</CardTitle>
                  <CardDescription>New hires currently in onboarding</CardDescription>
                </CardHeader>
                <CardContent>
                  {onboardings?.filter(o => o.status !== "completed").length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No active onboarding</p>
                      <p className="text-sm">Start onboarding for a hired applicant</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {onboardings?.filter(o => o.status !== "completed").map((onboarding) => (
                        <div
                          key={onboarding.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedOnboarding === onboarding.id 
                              ? "border-primary bg-primary/5" 
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedOnboarding(onboarding.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">
                                  {onboarding.employee?.firstName} {onboarding.employee?.lastName}
                                </h4>
                                <Badge className={`${STATUS_COLORS[onboarding.status]} text-white text-xs`}>
                                  {onboarding.status.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {onboarding.employee?.jobTitle}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {onboarding.entityName}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{onboarding.completedTasks}/{onboarding.totalTasks} tasks</span>
                            </div>
                            <Progress value={onboarding.progress} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Onboarding Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Tasks</CardTitle>
                  <CardDescription>
                    {selectedOnboarding 
                      ? "Check off tasks as they're completed" 
                      : "Select an onboarding to view tasks"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedOnboarding ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select an onboarding to view tasks</p>
                    </div>
                  ) : detailsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : onboardingDetails ? (
                    <div className="space-y-4">
                      {/* Employee Info */}
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium">
                          {onboardingDetails.employee?.firstName} {onboardingDetails.employee?.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {onboardingDetails.employee?.jobTitle} • {onboardingDetails.employee?.department}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Started: {onboardingDetails.startDate 
                            ? new Date(onboardingDetails.startDate).toLocaleDateString() 
                            : "Not started"}
                        </p>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-2">
                        {onboardingDetails.tasks?.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-3 rounded-lg border"
                          >
                            <Checkbox
                              checked={task.progress?.status === "completed"}
                              onCheckedChange={() => {
                                if (task.progress) {
                                  handleTaskToggle(task.progress.id, task.progress.status);
                                }
                              }}
                              disabled={updateTaskMutation.isPending}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {CATEGORY_ICONS[task.category]}
                                <span className={`font-medium ${
                                  task.progress?.status === "completed" 
                                    ? "line-through text-muted-foreground" 
                                    : ""
                                }`}>
                                  {task.title}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Assigned to: {task.assignedTo}</span>
                                <span>Due: Day {task.dueWithinDays}</span>
                                {task.isRequired && (
                                  <Badge variant="outline" className="text-xs">Required</Badge>
                                )}
                              </div>
                            </div>
                            <Badge className={`${TASK_STATUS_COLORS[task.progress?.status || "pending"]} text-white text-xs`}>
                              {task.progress?.status || "pending"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Could not load onboarding details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Completed Onboarding</CardTitle>
                <CardDescription>Employees who have completed onboarding</CardDescription>
              </CardHeader>
              <CardContent>
                {onboardings?.filter(o => o.status === "completed").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No completed onboarding yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {onboardings?.filter(o => o.status === "completed").map((onboarding) => (
                      <div key={onboarding.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">
                              {onboarding.employee?.firstName} {onboarding.employee?.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {onboarding.employee?.jobTitle}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {onboarding.entityName}
                            </p>
                          </div>
                          <Badge className="bg-green-500 text-white">Completed</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklists" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Checklists</CardTitle>
                <CardDescription>Template checklists for different positions</CardDescription>
              </CardHeader>
              <CardContent>
                {checklists?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No checklists created yet</p>
                    <p className="text-sm">Create a checklist to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {checklists?.map((checklist) => (
                      <div key={checklist.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{checklist.name}</h4>
                              {checklist.isDefault && (
                                <Badge variant="outline" className="text-xs">Default</Badge>
                              )}
                            </div>
                            {checklist.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {checklist.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {checklist.department && <span>Department: {checklist.department}</span>}
                              {checklist.positionLevel && <span>Level: {checklist.positionLevel}</span>}
                              <span>{checklist.itemCount} items</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Hired Applications Waiting */}
        {hiredApplications && hiredApplications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Hired Applicants Awaiting Onboarding
              </CardTitle>
              <CardDescription>
                These applicants have been hired but onboarding hasn't started yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hiredApplications.map((app) => (
                  <div key={app.id} className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                    <h4 className="font-medium">{app.firstName} {app.lastName}</h4>
                    <p className="text-sm text-muted-foreground">{app.positionTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">{app.entity}</p>
                    <Button 
                      size="sm" 
                      className="mt-3 w-full"
                      onClick={() => {
                        setSelectedApplication(app.id);
                        setStartDialogOpen(true);
                      }}
                    >
                      <Play className="w-3 h-3 mr-2" />
                      Start Onboarding
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
