import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Calendar, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Bell,
  AlertCircle,
  CalendarDays,
  ListTodo,
  RefreshCw
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ComplianceCalendar() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [completionNotes, setCompletionNotes] = useState("");

  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = trpc.complianceTracking.getDashboard.useQuery();
  const { data: calendarData, isLoading: calendarLoading, refetch: refetchCalendar } = trpc.complianceTracking.getCalendar.useQuery({
    month: currentMonth,
    year: currentYear,
  });
  const { data: taskTypesData } = trpc.complianceTracking.getTaskTypes.useQuery();
  const { data: allTasks, refetch: refetchTasks } = trpc.complianceTracking.getTasks.useQuery({ status: "all", limit: 100 });

  const createTaskMutation = trpc.complianceTracking.createTask.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully");
      setShowCreateDialog(false);
      refetchDashboard();
      refetchCalendar();
      refetchTasks();
    },
    onError: (error) => toast.error(error.message),
  });

  const completeTaskMutation = trpc.complianceTracking.completeTask.useMutation({
    onSuccess: () => {
      toast.success("Task completed");
      setShowCompleteDialog(false);
      setSelectedTask(null);
      setCompletionNotes("");
      refetchDashboard();
      refetchCalendar();
      refetchTasks();
    },
    onError: (error) => toast.error(error.message),
  });

  const generateAnnualTasksMutation = trpc.complianceTracking.generateAnnualTasks.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchDashboard();
      refetchCalendar();
      refetchTasks();
    },
    onError: (error) => toast.error(error.message),
  });

  const generateI9TasksMutation = trpc.complianceTracking.generateI9Tasks.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchDashboard();
      refetchTasks();
    },
    onError: (error) => toast.error(error.message),
  });

  const [newTask, setNewTask] = useState({
    taskType: "custom" as const,
    taskName: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    isRecurring: false,
    recurrencePattern: undefined as string | undefined,
  });

  const handleCreateTask = () => {
    createTaskMutation.mutate({
      ...newTask,
      recurrencePattern: newTask.recurrencePattern as any,
    });
  };

  const handleCompleteTask = () => {
    if (!selectedTask) return;
    completeTaskMutation.mutate({
      taskId: selectedTask.id,
      completionNotes,
    });
  };

  const openCompleteDialog = (task: any) => {
    setSelectedTask(task);
    setShowCompleteDialog(true);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Overdue</Badge>;
      case "due_soon":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1"><Clock className="w-3 h-3" />Due Soon</Badge>;
      case "upcoming":
        return <Badge variant="outline" className="gap-1"><Calendar className="w-3 h-3" />Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1"><CheckCircle2 className="w-3 h-3" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    const taskType = taskTypesData?.taskTypes.find(t => t.type === type);
    return taskType?.name || type;
  };

  // Calendar grid generation
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: Array<{ day: number | null; tasks: any[]; deadlines: any[] }> = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, tasks: [], deadlines: [] });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTasks = calendarData?.tasks.filter(t => {
        const taskDate = new Date(t.dueDate);
        return taskDate.getDate() === day;
      }) || [];
      
      const dayDeadlines = calendarData?.federalDeadlines.filter(d => {
        const deadlineDate = new Date(d.dueDate);
        return deadlineDate.getDate() === day;
      }) || [];

      days.push({ day, tasks: dayTasks, deadlines: dayDeadlines });
    }

    return days;
  }, [currentMonth, currentYear, calendarData]);

  if (dashboardLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compliance Calendar</h1>
            <p className="text-muted-foreground">Track filing deadlines, document expirations, and compliance tasks</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => generateAnnualTasksMutation.mutate({ year: currentYear })}
              disabled={generateAnnualTasksMutation.isPending}
            >
              {generateAnnualTasksMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Generate {currentYear} Tasks
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" />Add Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Compliance Task</DialogTitle>
                  <DialogDescription>Add a new compliance task or deadline</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Task Type</Label>
                    <Select value={newTask.taskType} onValueChange={(v: any) => setNewTask({ ...newTask, taskType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {taskTypesData?.taskTypes.map(type => (
                          <SelectItem key={type.type} value={type.type}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Task Name</Label>
                    <Input 
                      value={newTask.taskName} 
                      onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })} 
                      placeholder="e.g., File Q1 941 Return" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={newTask.description} 
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} 
                      placeholder="Task details and requirements"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input 
                      type="date" 
                      value={newTask.dueDate} 
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="recurring" 
                      checked={newTask.isRecurring}
                      onCheckedChange={(checked) => setNewTask({ ...newTask, isRecurring: checked as boolean })}
                    />
                    <Label htmlFor="recurring">Recurring Task</Label>
                  </div>
                  {newTask.isRecurring && (
                    <div className="space-y-2">
                      <Label>Recurrence Pattern</Label>
                      <Select value={newTask.recurrencePattern} onValueChange={(v) => setNewTask({ ...newTask, recurrencePattern: v })}>
                        <SelectTrigger><SelectValue placeholder="Select pattern" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending || !newTask.taskName}>
                    {createTaskMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={dashboard?.summary.overdueCount ? "border-destructive" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${dashboard?.summary.overdueCount ? "bg-destructive/10" : "bg-muted"}`}>
                  <AlertTriangle className={`w-6 h-6 ${dashboard?.summary.overdueCount ? "text-destructive" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{dashboard?.summary.overdueCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={dashboard?.summary.dueSoonCount ? "border-amber-500" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${dashboard?.summary.dueSoonCount ? "bg-amber-500/10" : "bg-muted"}`}>
                  <Clock className={`w-6 h-6 ${dashboard?.summary.dueSoonCount ? "text-amber-600" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Soon</p>
                  <p className="text-2xl font-bold">{dashboard?.summary.dueSoonCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <CalendarDays className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{dashboard?.summary.upcomingCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Docs</p>
                  <p className="text-2xl font-bold">{dashboard?.summary.expiringDocumentsCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="deadlines">Filing Deadlines</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Overdue Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Overdue Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.overdueTasks && dashboard.overdueTasks.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.overdueTasks.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                          <div>
                            <p className="font-medium">{task.taskName}</p>
                            <p className="text-sm text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                          <Button size="sm" onClick={() => openCompleteDialog(task)}>Complete</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No overdue tasks</p>
                  )}
                </CardContent>
              </Card>

              {/* Due Soon Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600">
                    <Clock className="w-5 h-5" />
                    Due Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.dueSoonTasks && dashboard.dueSoonTasks.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.dueSoonTasks.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                          <div>
                            <p className="font-medium">{task.taskName}</p>
                            <p className="text-sm text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => openCompleteDialog(task)}>Complete</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No tasks due soon</p>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Federal Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Upcoming Federal Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.upcomingDeadlines && dashboard.upcomingDeadlines.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.upcomingDeadlines.map((deadline: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{deadline.name}</p>
                            <p className="text-sm text-muted-foreground">{deadline.formNumber} - {deadline.filingPeriod}</p>
                          </div>
                          <Badge variant="outline">{new Date(deadline.dueDate).toLocaleDateString()}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No upcoming deadlines</p>
                  )}
                </CardContent>
              </Card>

              {/* Expiring Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Expiring Documents
                  </CardTitle>
                  <CardDescription>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => generateI9TasksMutation.mutate()}
                      disabled={generateI9TasksMutation.isPending}
                    >
                      {generateI9TasksMutation.isPending ? "Generating..." : "Generate I-9 Tasks"}
                    </Button>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard?.expiringDocuments && dashboard.expiringDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.expiringDocuments.map((doc: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{doc.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{doc.documentName}</p>
                          </div>
                          <Badge variant={doc.status === "expired" ? "destructive" : "outline"}>
                            {doc.daysUntilExpiration < 0 ? "Expired" : `${doc.daysUntilExpiration} days`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No expiring documents</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{MONTHS[currentMonth]} {currentYear}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {calendarLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                    {calendarGrid.map((cell, idx) => (
                      <div 
                        key={idx} 
                        className={`min-h-24 p-2 border rounded-lg ${cell.day ? "bg-background" : "bg-muted/30"}`}
                      >
                        {cell.day && (
                          <>
                            <p className="text-sm font-medium mb-1">{cell.day}</p>
                            <div className="space-y-1">
                              {cell.tasks.slice(0, 2).map((task: any, i: number) => (
                                <div 
                                  key={i} 
                                  className={`text-xs p-1 rounded truncate cursor-pointer ${
                                    task.status === "overdue" ? "bg-destructive/10 text-destructive" :
                                    task.status === "due_soon" ? "bg-amber-500/10 text-amber-600" :
                                    "bg-primary/10 text-primary"
                                  }`}
                                  onClick={() => openCompleteDialog(task)}
                                >
                                  {task.taskName}
                                </div>
                              ))}
                              {cell.deadlines.slice(0, 1).map((deadline: any, i: number) => (
                                <div key={`d-${i}`} className="text-xs p-1 rounded truncate bg-blue-500/10 text-blue-600">
                                  {deadline.formNumber}
                                </div>
                              ))}
                              {(cell.tasks.length + cell.deadlines.length) > 3 && (
                                <p className="text-xs text-muted-foreground">+{cell.tasks.length + cell.deadlines.length - 3} more</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5" />
                  All Compliance Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allTasks?.tasks && allTasks.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {allTasks.tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{task.taskName}</h4>
                              {getStatusBadge(task.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Type: {getTaskTypeLabel(task.taskType)}</span>
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              {task.isRecurring && <Badge variant="outline" className="text-xs">Recurring</Badge>}
                            </div>
                          </div>
                        </div>
                        {task.status !== "completed" && task.status !== "skipped" && (
                          <Button size="sm" onClick={() => openCompleteDialog(task)}>Complete</Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ListTodo className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No compliance tasks yet</p>
                    <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>Create First Task</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filing Deadlines Tab */}
          <TabsContent value="deadlines" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {currentYear} Federal Filing Deadlines
                </CardTitle>
                <CardDescription>Key IRS filing deadlines for the year</CardDescription>
              </CardHeader>
              <CardContent>
                {calendarData?.federalDeadlines && calendarData.federalDeadlines.length > 0 ? (
                  <div className="space-y-3">
                    {calendarData.federalDeadlines.map((deadline: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{deadline.name}</h4>
                            <Badge variant="outline">{deadline.formNumber}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{deadline.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">Period: {deadline.filingPeriod}</span>
                            {deadline.extensionAvailable && (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Extension Available</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{new Date(deadline.dueDate).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{deadline.filingMethod}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No deadlines for this month</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Complete Task Dialog */}
        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Task</DialogTitle>
              <DialogDescription>Mark "{selectedTask?.taskName}" as completed</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Completion Notes (Optional)</Label>
                <Textarea 
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Add any notes about the completion..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Cancel</Button>
              <Button onClick={handleCompleteTask} disabled={completeTaskMutation.isPending}>
                {completeTaskMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Mark Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
