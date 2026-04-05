import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Workflow as WorkflowIcon, 
  Play, 
  Plus,
  Trash2,
  Settings,
  Zap,
  Mail,
  Bell,
  CheckSquare,
  Clock,
  GitBranch,
  Webhook,
  FileText,
  Users,
  ArrowRight,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  workflowBuilderService, 
  Workflow,
  WorkflowStep,
  WorkflowExecution,
  TriggerType,
  StepType
} from "@/services/workflowBuilderService";

const TRIGGER_OPTIONS: { value: TriggerType; label: string; icon: React.ReactNode }[] = [
  { value: 'document_signed', label: 'Document Signed', icon: <FileText className="w-4 h-4" /> },
  { value: 'task_completed', label: 'Task Completed', icon: <CheckSquare className="w-4 h-4" /> },
  { value: 'form_submitted', label: 'Form Submitted', icon: <FileText className="w-4 h-4" /> },
  { value: 'status_changed', label: 'Status Changed', icon: <GitBranch className="w-4 h-4" /> },
  { value: 'date_reached', label: 'Date Reached', icon: <Clock className="w-4 h-4" /> },
  { value: 'manual', label: 'Manual Trigger', icon: <Play className="w-4 h-4" /> },
  { value: 'webhook', label: 'Webhook', icon: <Webhook className="w-4 h-4" /> },
  { value: 'new_user', label: 'New User', icon: <Users className="w-4 h-4" /> },
  { value: 'payment_received', label: 'Payment Received', icon: <Zap className="w-4 h-4" /> }
];

const STEP_OPTIONS: { value: StepType; label: string; icon: React.ReactNode }[] = [
  { value: 'send_notification', label: 'Send Notification', icon: <Bell className="w-4 h-4" /> },
  { value: 'send_email', label: 'Send Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'create_task', label: 'Create Task', icon: <CheckSquare className="w-4 h-4" /> },
  { value: 'update_status', label: 'Update Status', icon: <GitBranch className="w-4 h-4" /> },
  { value: 'assign_user', label: 'Assign User', icon: <Users className="w-4 h-4" /> },
  { value: 'wait_delay', label: 'Wait/Delay', icon: <Clock className="w-4 h-4" /> },
  { value: 'condition', label: 'Condition', icon: <GitBranch className="w-4 h-4" /> },
  { value: 'webhook_call', label: 'Call Webhook', icon: <Webhook className="w-4 h-4" /> },
  { value: 'create_document', label: 'Create Document', icon: <FileText className="w-4 h-4" /> },
  { value: 'approval_request', label: 'Request Approval', icon: <CheckSquare className="w-4 h-4" /> }
];

export default function WorkflowBuilderPage() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    triggerType: 'manual' as TriggerType
  });
  const [newStep, setNewStep] = useState({
    type: 'send_notification' as StepType,
    name: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setWorkflows(workflowBuilderService.getWorkflows());
    setExecutions(workflowBuilderService.getExecutions());
  };

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name) {
      toast.error("Workflow name is required");
      return;
    }
    const workflow = workflowBuilderService.createWorkflow({
      name: newWorkflow.name,
      description: newWorkflow.description,
      trigger: { type: newWorkflow.triggerType, config: {} },
      steps: [],
      isActive: false,
      createdBy: user?.name || 'Unknown'
    });
    toast.success("Workflow created");
    setIsCreateOpen(false);
    setNewWorkflow({ name: '', description: '', triggerType: 'manual' });
    setSelectedWorkflow(workflow);
    loadData();
  };

  const handleToggleWorkflow = (id: string) => {
    workflowBuilderService.toggleWorkflow(id);
    loadData();
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow(workflowBuilderService.getWorkflow(id));
    }
  };

  const handleExecuteWorkflow = (id: string) => {
    workflowBuilderService.executeWorkflow(id);
    toast.success("Workflow execution started");
    setTimeout(loadData, 3000);
  };

  const handleDeleteWorkflow = (id: string) => {
    workflowBuilderService.deleteWorkflow(id);
    toast.success("Workflow deleted");
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow(null);
    }
    loadData();
  };

  const handleAddStep = () => {
    if (!selectedWorkflow || !newStep.name) {
      toast.error("Step name is required");
      return;
    }
    workflowBuilderService.addStep(selectedWorkflow.id, {
      type: newStep.type,
      name: newStep.name,
      config: {},
      position: { x: 100, y: (selectedWorkflow.steps.length + 1) * 100 },
      nextSteps: []
    });
    toast.success("Step added");
    setIsAddStepOpen(false);
    setNewStep({ type: 'send_notification', name: '' });
    setSelectedWorkflow(workflowBuilderService.getWorkflow(selectedWorkflow.id));
    loadData();
  };

  const handleRemoveStep = (stepId: string) => {
    if (!selectedWorkflow) return;
    workflowBuilderService.removeStep(selectedWorkflow.id, stepId);
    setSelectedWorkflow(workflowBuilderService.getWorkflow(selectedWorkflow.id));
    loadData();
  };

  const handleUseTemplate = (templateId: string) => {
    const workflow = workflowBuilderService.createFromTemplate(templateId, user?.id?.toString() || 'unknown');
    if (workflow) {
      toast.success("Workflow created from template");
      setSelectedWorkflow(workflow);
      loadData();
    }
  };

  const stats = workflowBuilderService.getStats();
  const templates = workflowBuilderService.getTemplates();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workflow Builder</h1>
            <p className="text-muted-foreground mt-1">
              Create automated sequences to streamline your processes
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <WorkflowIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeWorkflows}/{stats.totalWorkflows}</p>
                  <p className="text-sm text-muted-foreground">Active Workflows</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalExecutions}</p>
                  <p className="text-sm text-muted-foreground">Total Executions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.successRate.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-bold capitalize">
                    {stats.mostUsedTrigger?.replace('_', ' ') || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">Top Trigger</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="templates" className="flex-1">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pt-2">
                      {workflows.map((workflow) => (
                        <div
                          key={workflow.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedWorkflow?.id === workflow.id
                              ? 'bg-primary/10 border border-primary'
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                          onClick={() => setSelectedWorkflow(workflow)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{workflow.name}</span>
                            <Badge variant={workflow.isActive ? "default" : "secondary"}>
                              {workflow.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Zap className="w-3 h-3" />
                            {TRIGGER_OPTIONS.find(t => t.value === workflow.trigger.type)?.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {workflow.steps.length} steps • {workflow.executionCount} runs
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="templates">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pt-2">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="p-3 rounded-lg bg-muted/50 hover:bg-muted"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{template.name}</span>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full"
                            onClick={() => handleUseTemplate(template.id)}
                          >
                            Use Template
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Workflow Editor */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedWorkflow ? selectedWorkflow.name : 'Select a Workflow'}
                  </CardTitle>
                  <CardDescription>
                    {selectedWorkflow?.description || 'Choose a workflow to edit'}
                  </CardDescription>
                </div>
                {selectedWorkflow && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={selectedWorkflow.isActive}
                      onCheckedChange={() => handleToggleWorkflow(selectedWorkflow.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecuteWorkflow(selectedWorkflow.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Run
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWorkflow(selectedWorkflow.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedWorkflow ? (
                <div className="space-y-4">
                  {/* Trigger */}
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="font-medium">Trigger</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {TRIGGER_OPTIONS.find(t => t.value === selectedWorkflow.trigger.type)?.icon}
                      <span>
                        {TRIGGER_OPTIONS.find(t => t.value === selectedWorkflow.trigger.type)?.label}
                      </span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Steps</Label>
                      <Button size="sm" variant="outline" onClick={() => setIsAddStepOpen(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Step
                      </Button>
                    </div>

                    {selectedWorkflow.steps.length === 0 ? (
                      <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                        No steps yet. Add steps to build your workflow.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedWorkflow.steps.map((step, index) => (
                          <div key={step.id} className="relative">
                            {index > 0 && (
                              <div className="absolute left-6 -top-2 h-2 w-0.5 bg-border" />
                            )}
                            <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                              <div className="p-2 bg-muted rounded">
                                {STEP_OPTIONS.find(s => s.value === step.type)?.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{step.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {STEP_OPTIONS.find(s => s.value === step.type)?.label}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveStep(step.id)}
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </div>
                            {index < selectedWorkflow.steps.length - 1 && (
                              <div className="flex justify-center py-1">
                                <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Executions */}
                  <div className="pt-4 border-t">
                    <Label className="mb-2 block">Recent Executions</Label>
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-2">
                        {workflowBuilderService.getWorkflowExecutions(selectedWorkflow.id).slice(0, 5).map((exec) => (
                          <div key={exec.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  exec.status === 'completed' ? 'default' :
                                  exec.status === 'running' ? 'secondary' :
                                  'destructive'
                                }
                              >
                                {exec.status}
                              </Badge>
                              <span className="text-sm">
                                {exec.stepsCompleted.length} steps completed
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {exec.triggeredAt.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {workflowBuilderService.getWorkflowExecutions(selectedWorkflow.id).length === 0 && (
                          <div className="text-center text-muted-foreground py-4">
                            No executions yet
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  Select a workflow to view and edit
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Workflow Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workflow</DialogTitle>
              <DialogDescription>
                Define a new automated workflow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  placeholder="e.g., New Contract Processing"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  placeholder="What does this workflow do?"
                />
              </div>
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select
                  value={newWorkflow.triggerType}
                  onValueChange={(v) => setNewWorkflow({ ...newWorkflow, triggerType: v as TriggerType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        <div className="flex items-center gap-2">
                          {trigger.icon}
                          {trigger.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Step Dialog */}
        <Dialog open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Step</DialogTitle>
              <DialogDescription>
                Add a new step to the workflow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Step Name</Label>
                <Input
                  value={newStep.name}
                  onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                  placeholder="e.g., Notify Team"
                />
              </div>
              <div className="space-y-2">
                <Label>Step Type</Label>
                <Select
                  value={newStep.type}
                  onValueChange={(v) => setNewStep({ ...newStep, type: v as StepType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STEP_OPTIONS.map((step) => (
                      <SelectItem key={step.value} value={step.value}>
                        <div className="flex items-center gap-2">
                          {step.icon}
                          {step.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddStepOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStep}>Add Step</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
