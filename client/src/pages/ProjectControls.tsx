import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FolderKanban,
  Plus,
  Calendar,
  DollarSign,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ListTodo,
  Milestone,
  RefreshCw,
} from "lucide-react";

const PROJECT_TYPES = [
  { value: "grant", label: "Grant Project" },
  { value: "business_formation", label: "Business Formation" },
  { value: "contract", label: "Contract/Deliverable" },
  { value: "internal", label: "Internal Initiative" },
];

const PROJECT_STATUSES = [
  { value: "planning", label: "Planning", color: "bg-blue-100 text-blue-800" },
  { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "on_hold", label: "On Hold", color: "bg-yellow-100 text-yellow-800" },
  { value: "completed", label: "Completed", color: "bg-gray-100 text-gray-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-700" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
];

const STATUS_COLORS: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
};

export default function ProjectControls() {
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [newProject, setNewProject] = useState({
    name: "",
    code: "",
    description: "",
    projectType: "internal",
    priority: "medium",
    budget: "",
  });

  const utils = trpc.useUtils();

  const { data: projects, isLoading: projectsLoading } = trpc.projectControls.listProjects.useQuery(
    statusFilter !== "all" || typeFilter !== "all"
      ? {
          status: statusFilter !== "all" ? statusFilter : undefined,
          projectType: typeFilter !== "all" ? typeFilter : undefined,
        }
      : undefined
  );

  const { data: dashboardStats } = trpc.projectControls.getDashboardStats.useQuery();

  const { data: projectSummary } = trpc.projectControls.getProjectSummary.useQuery(
    { id: selectedProject! },
    { enabled: !!selectedProject }
  );

  const createProjectMutation = trpc.projectControls.createProject.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully");
      setShowNewProjectDialog(false);
      setNewProject({
        name: "",
        code: "",
        description: "",
        projectType: "internal",
        priority: "medium",
        budget: "",
      });
      utils.projectControls.listProjects.invalidate();
      utils.projectControls.getDashboardStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
    },
  });

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.code) {
      toast.error("Please fill in required fields");
      return;
    }
    createProjectMutation.mutate({
      name: newProject.name,
      code: newProject.code,
      description: newProject.description || undefined,
      projectType: newProject.projectType,
      priority: newProject.priority,
      budget: newProject.budget || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = PROJECT_STATUSES.find((s) => s.value === status);
    return (
      <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = PRIORITIES.find((p) => p.value === priority);
    return (
      <Badge variant="outline" className={priorityConfig?.color || ""}>
        {priorityConfig?.label || priority}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FolderKanban className="h-8 w-8 text-primary" />
              Project Controls
            </h1>
            <p className="text-muted-foreground mt-1">
              Scheduling, cost control, and progress tracking across all projects
            </p>
          </div>
          <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project to track schedules, budgets, and deliverables.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="e.g., Grant Phase 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Project Code *</Label>
                    <Input
                      id="code"
                      value={newProject.code}
                      onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                      placeholder="e.g., GRANT-001"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Project Type</Label>
                    <Select
                      value={newProject.projectType}
                      onValueChange={(value) => setNewProject({ ...newProject, projectType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newProject.priority}
                      onValueChange={(value) => setNewProject({ ...newProject, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    placeholder="e.g., 50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Project objectives and scope..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={createProjectMutation.isPending}>
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.projects?.total || 0}</div>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="text-green-600">{dashboardStats?.projects?.active || 0} active</span>
                <span className="text-blue-600">{dashboardStats?.projects?.planning || 0} planning</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Number(dashboardStats?.projects?.totalBudget || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Spent: ${Number(dashboardStats?.projects?.totalActualCost || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Risks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.risks?.open || 0}</div>
              <p className="text-xs text-red-600 mt-1">
                {dashboardStats?.risks?.highRisk || 0} high priority
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Change Orders</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.changeOrders?.total || 0}</div>
              <p className="text-xs text-yellow-600 mt-1">
                {dashboardStats?.changeOrders?.pending || 0} pending review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="budget" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="risks" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risks
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {PROJECT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Projects List */}
            {projectsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
            ) : !projects || projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Projects Yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-2">
                    Create your first project to start tracking schedules, budgets, and deliverables.
                  </p>
                  <Button className="mt-4 gap-2" onClick={() => setShowNewProjectDialog(true)}>
                    <Plus className="h-4 w-4" />
                    Create Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedProject === project.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {project.name}
                            <Badge variant="outline" className="text-xs">
                              {project.code}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {PROJECT_TYPES.find((t) => t.value === project.projectType)?.label}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(project.status)}
                          {getPriorityBadge(project.priority || "medium")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {project.percentComplete || 0}% complete
                          </span>
                          {project.budget && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />$
                              {Number(project.budget).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Progress value={project.percentComplete || 0} className="w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Project Details */}
            {selectedProject && projectSummary && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Project Summary: {projectSummary.project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Milestone className="h-6 w-6 mx-auto text-blue-500" />
                      <div className="text-2xl font-bold mt-2">
                        {projectSummary.stats.milestonesCompleted}/{projectSummary.stats.milestonesTotal}
                      </div>
                      <p className="text-xs text-muted-foreground">Milestones</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <ListTodo className="h-6 w-6 mx-auto text-green-500" />
                      <div className="text-2xl font-bold mt-2">
                        {projectSummary.stats.tasksCompleted}/{projectSummary.stats.tasksTotal}
                      </div>
                      <p className="text-xs text-muted-foreground">Tasks</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <AlertTriangle className="h-6 w-6 mx-auto text-orange-500" />
                      <div className="text-2xl font-bold mt-2">{projectSummary.stats.openRisks}</div>
                      <p className="text-xs text-muted-foreground">Open Risks</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <RefreshCw className="h-6 w-6 mx-auto text-purple-500" />
                      <div className="text-2xl font-bold mt-2">
                        {projectSummary.stats.pendingChangeOrders}
                      </div>
                      <p className="text-xs text-muted-foreground">Pending COs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Schedule
                </CardTitle>
                <CardDescription>
                  Timeline view of milestones and tasks across all projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a project to view its schedule and milestones.</p>
                  <p className="text-sm mt-2">
                    Gantt chart visualization will be available once projects have tasks assigned.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Overview
                </CardTitle>
                <CardDescription>Cost tracking and earned value analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto text-green-600" />
                    <div className="text-3xl font-bold mt-2 text-green-700">
                      ${Number(dashboardStats?.projects?.totalBudget || 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-green-600">Total Budget</p>
                  </div>
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto text-blue-600" />
                    <div className="text-3xl font-bold mt-2 text-blue-700">
                      ${Number(dashboardStats?.projects?.totalActualCost || 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-blue-600">Actual Cost</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <TrendingDown className="h-8 w-8 mx-auto text-purple-600" />
                    <div className="text-3xl font-bold mt-2 text-purple-700">
                      $
                      {(
                        Number(dashboardStats?.projects?.totalBudget || 0) -
                        Number(dashboardStats?.projects?.totalActualCost || 0)
                      ).toLocaleString()}
                    </div>
                    <p className="text-sm text-purple-600">Remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Register
                </CardTitle>
                <CardDescription>Track and mitigate project risks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-bold text-red-700">
                      {dashboardStats?.risks?.highRisk || 0}
                    </div>
                    <p className="text-sm text-red-600">High Priority</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="text-2xl font-bold text-yellow-700">
                      {dashboardStats?.risks?.open || 0}
                    </div>
                    <p className="text-sm text-yellow-600">Open Risks</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-700">
                      {(dashboardStats?.risks?.total || 0) - (dashboardStats?.risks?.open || 0)}
                    </div>
                    <p className="text-sm text-green-600">Mitigated</p>
                  </div>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a project to view and manage its risk register.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
