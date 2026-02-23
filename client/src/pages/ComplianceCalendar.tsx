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
  RefreshCw,
  DollarSign,
  Building2,
  ExternalLink,
  Send
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
  const [grantFilter, setGrantFilter] = useState<string>("all");
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<any>(null);

  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = trpc.complianceTracking.getDashboard.useQuery();
  const { data: calendarData, isLoading: calendarLoading, refetch: refetchCalendar } = trpc.complianceTracking.getCalendar.useQuery({
    month: currentMonth,
    year: currentYear,
  });
  const { data: taskTypesData } = trpc.complianceTracking.getTaskTypes.useQuery();
  const { data: allTasks, refetch: refetchTasks } = trpc.complianceTracking.getTasks.useQuery({ status: "all", limit: 100 });

  // Grant deadlines queries
  const { data: grantDashboard, refetch: refetchGrantDashboard } = trpc.grantDeadlines.getDashboardSummary.useQuery();
  const { data: grantDeadlines, refetch: refetchGrantDeadlines } = trpc.grantDeadlines.getDeadlines.useQuery(
    grantFilter === "all" ? undefined : { category: grantFilter as any }
  );
  const { data: grantCalendarEvents } = trpc.grantDeadlines.getCalendarEvents.useQuery({
    month: currentMonth + 1,
    year: currentYear
  });
  const { data: grantReminders } = trpc.grantDeadlines.getReminders.useQuery({ sent: false });

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

  const generateRemindersMutation = trpc.grantDeadlines.generateReminders.useMutation({
    onSuccess: (data) => {
      toast.success(`Generated ${data.length} reminders`);
      setShowReminderDialog(false);
      setSelectedGrant(null);
      refetchGrantDashboard();
    },
    onError: (error) => toast.error(error.message),
  });

  const markSubmittedMutation = trpc.grantDeadlines.markAsSubmitted.useMutation({
    onSuccess: () => {
      toast.success("Grant marked as submitted");
      refetchGrantDeadlines();
      refetchGrantDashboard();
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

  const openReminderDialog = (grant: any) => {
    setSelectedGrant(grant);
    setShowReminderDialog(true);
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

  const getGrantStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Open</Badge>;
      case "closing_soon":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Closing Soon</Badge>;
      case "upcoming":
        return <Badge variant="outline">Upcoming</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      case "submitted":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Submitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    const taskType = taskTypesData?.taskTypes.find(t => t.type === type);
    return taskType?.name || type;
  };

  // Calendar grid generation with grant events
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: Array<{ day: number | null; tasks: any[]; deadlines: any[]; grantEvents: any[] }> = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, tasks: [], deadlines: [], grantEvents: [] });
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

      const dayGrantEvents = grantCalendarEvents?.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getDate() === day;
      }) || [];

      days.push({ day, tasks: dayTasks, deadlines: dayDeadlines, grantEvents: dayGrantEvents });
    }

    return days;
  }, [currentMonth, currentYear, calendarData, grantCalendarEvents]);

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
            <p className="text-muted-foreground">Track filing deadlines, grant applications, and compliance tasks</p>
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
                      placeholder="Task details..."
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
                  <div className="flex items-center gap-2">
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
                      <Select 
                        value={newTask.recurrencePattern || ""} 
                        onValueChange={(v) => setNewTask({ ...newTask, recurrencePattern: v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Select pattern" /></SelectTrigger>
                        <SelectContent>
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
                  <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <Card className={grantDashboard?.statistics.closingSoon ? "border-green-500" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grants Closing</p>
                  <p className="text-2xl font-bold">{grantDashboard?.statistics.closingSoon || 0}</p>
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
            <TabsTrigger value="grants">Grant Deadlines</TabsTrigger>
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

              {/* Grants Closing Soon */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <DollarSign className="w-5 h-5" />
                    Grants Closing Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {grantDashboard?.closingSoonDeadlines && grantDashboard.closingSoonDeadlines.length > 0 ? (
                    <div className="space-y-3">
                      {grantDashboard.closingSoonDeadlines.map((grant: any) => (
                        <div key={grant.id} className="flex items-center justify-between p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                          <div>
                            <p className="font-medium">{grant.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {grant.funder} • Up to ${grant.maxFunding.toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline">{new Date(grant.closeDate).toLocaleDateString()}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No grants closing soon</p>
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

              {/* Grant Reminders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Grant Reminders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {grantReminders && grantReminders.length > 0 ? (
                    <div className="space-y-3">
                      {grantReminders.slice(0, 5).map((reminder: any) => (
                        <div key={reminder.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{reminder.grantName}</p>
                            <p className="text-sm text-muted-foreground">{reminder.reminderType.replace('_', ' ')}</p>
                          </div>
                          <Badge variant="outline">{new Date(reminder.reminderDate).toLocaleDateString()}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No pending reminders</p>
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
                              {cell.tasks.slice(0, 1).map((task: any, i: number) => (
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
                              {cell.grantEvents.slice(0, 1).map((event: any, i: number) => (
                                <div 
                                  key={`g-${i}`} 
                                  className={`text-xs p-1 rounded truncate ${
                                    event.type === 'close' ? 'bg-green-500/10 text-green-600' :
                                    event.type === 'reminder' ? 'bg-purple-500/10 text-purple-600' :
                                    'bg-emerald-500/10 text-emerald-600'
                                  }`}
                                >
                                  {event.type === 'close' ? '💰' : event.type === 'reminder' ? '🔔' : '📅'} {event.title.substring(0, 15)}...
                                </div>
                              ))}
                              {(cell.tasks.length + cell.deadlines.length + cell.grantEvents.length) > 3 && (
                                <p className="text-xs text-muted-foreground">+{cell.tasks.length + cell.deadlines.length + cell.grantEvents.length - 3} more</p>
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

          {/* Grant Deadlines Tab */}
          <TabsContent value="grants" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Grant Application Deadlines
                    </CardTitle>
                    <CardDescription>
                      Track federal and foundation grant opportunities
                    </CardDescription>
                  </div>
                  <Select value={grantFilter} onValueChange={setGrantFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grants</SelectItem>
                      <SelectItem value="federal">Federal</SelectItem>
                      <SelectItem value="foundation">Foundation</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {grantDeadlines && grantDeadlines.length > 0 ? (
                  <div className="space-y-4">
                    {grantDeadlines.map((grant: any) => (
                      <div key={grant.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{grant.name}</h4>
                              {getGrantStatusBadge(grant.status)}
                              <Badge variant="outline" className="capitalize">{grant.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{grant.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {grant.funder}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                Up to ${grant.maxFunding.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Opens: {new Date(grant.openDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1 font-medium text-amber-600">
                                <AlertCircle className="w-4 h-4" />
                                Closes: {new Date(grant.closeDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {grant.eligibleEntities.map((entity: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">{entity.replace(/_/g, ' ')}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            {grant.applicationUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={grant.applicationUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Apply
                                </a>
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openReminderDialog(grant)}
                            >
                              <Bell className="w-4 h-4 mr-1" />
                              Remind
                            </Button>
                            {grant.status !== 'submitted' && grant.status !== 'closed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => markSubmittedMutation.mutate({ id: grant.id })}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Submitted
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No grant deadlines found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grant Statistics */}
            {grantDashboard?.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Grants</p>
                    <p className="text-2xl font-bold">{grantDashboard.statistics.total}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Open Now</p>
                    <p className="text-2xl font-bold text-green-600">{grantDashboard.statistics.byStatus.open}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Available Funding</p>
                    <p className="text-2xl font-bold">${(grantDashboard.statistics.totalFunding / 1000000).toFixed(1)}M</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Pending Reminders</p>
                    <p className="text-2xl font-bold">{grantDashboard.statistics.upcomingReminders}</p>
                  </CardContent>
                </Card>
              </div>
            )}
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

        {/* Generate Reminders Dialog */}
        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Reminders</DialogTitle>
              <DialogDescription>
                Set up automatic reminders for "{selectedGrant?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                This will create reminders at 30 days, 14 days, 7 days, and 1 day before the deadline ({selectedGrant?.closeDate ? new Date(selectedGrant.closeDate).toLocaleDateString() : ''}).
              </p>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedGrant?.funder}</p>
                <p className="text-sm text-muted-foreground">Max Funding: ${selectedGrant?.maxFunding?.toLocaleString()}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReminderDialog(false)}>Cancel</Button>
              <Button 
                onClick={() => selectedGrant && generateRemindersMutation.mutate({ deadlineId: selectedGrant.id })}
                disabled={generateRemindersMutation.isPending}
              >
                {generateRemindersMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate Reminders
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
