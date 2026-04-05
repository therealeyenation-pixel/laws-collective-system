import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  FileSignature,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  SortAsc,
  RefreshCw,
  Eye,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { format, formatDistanceToNow, isPast, isToday, addDays } from "date-fns";

interface Task {
  id: string;
  type: "signature" | "reading" | "approval" | "deadline" | "general";
  title: string;
  description: string;
  dueDate: Date | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "overdue";
  source: string;
  link?: string;
}

// Mock data - in production this would come from tRPC
const mockTasks: Task[] = [
  {
    id: "1",
    type: "signature",
    title: "Operating Agreement - The L.A.W.S. Collective",
    description: "Review and sign the updated operating agreement",
    dueDate: addDays(new Date(), 2),
    priority: "high",
    status: "pending",
    source: "Legal Department",
    link: "/signature-requests",
  },
  {
    id: "2",
    type: "reading",
    title: "IRS Notice 2024-01: Tax Filing Updates",
    description: "Required reading on new tax filing requirements",
    dueDate: addDays(new Date(), 5),
    priority: "medium",
    status: "pending",
    source: "Finance Department",
    link: "/article-assignment",
  },
  {
    id: "3",
    type: "approval",
    title: "Grant Application - Ford Foundation",
    description: "Review and approve grant application before submission",
    dueDate: addDays(new Date(), 1),
    priority: "urgent",
    status: "pending",
    source: "Grants Team",
    link: "/grants",
  },
  {
    id: "4",
    type: "deadline",
    title: "Q1 Financial Report Due",
    description: "Submit quarterly financial report to board",
    dueDate: addDays(new Date(), 7),
    priority: "high",
    status: "in_progress",
    source: "Finance Department",
    link: "/financial-reports",
  },
  {
    id: "5",
    type: "reading",
    title: "DOL Updates on Contractor Classification",
    description: "New guidelines for independent contractor classification",
    dueDate: addDays(new Date(), 3),
    priority: "medium",
    status: "pending",
    source: "HR Department",
    link: "/article-assignment",
  },
  {
    id: "6",
    type: "signature",
    title: "Vendor Agreement - Cloud Services",
    description: "Sign annual renewal for cloud infrastructure",
    dueDate: new Date(),
    priority: "high",
    status: "pending",
    source: "IT Department",
    link: "/signature-requests",
  },
  {
    id: "7",
    type: "general",
    title: "Complete Business Formation Course",
    description: "Finish remaining modules in business formation training",
    dueDate: addDays(new Date(), 14),
    priority: "low",
    status: "in_progress",
    source: "Training Hub",
    link: "/dashboard",
  },
  {
    id: "8",
    type: "approval",
    title: "New Team Member - Marketing",
    description: "Review and approve new hire for marketing position",
    dueDate: addDays(new Date(), 2),
    priority: "medium",
    status: "pending",
    source: "HR Department",
    link: "/team-management",
  },
];

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

const typeIcons: Record<string, any> = {
  signature: FileSignature,
  reading: BookOpen,
  approval: CheckCircle2,
  deadline: Calendar,
  general: ClipboardList,
};

const typeColors: Record<string, string> = {
  signature: "text-indigo-500",
  reading: "text-teal-500",
  approval: "text-green-500",
  deadline: "text-orange-500",
  general: "text-slate-500",
};

export default function MyTasks() {
  const [, setLocation] = useLocation();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Tasks refreshed");
    setIsRefreshing(false);
  };

  const handleComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: "completed" as const } : t
    ));
    toast.success("Task marked as complete");
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return task.status !== "completed";
    if (filter === "overdue") return task.dueDate && isPast(task.dueDate) && task.status !== "completed";
    if (filter === "today") return task.dueDate && isToday(task.dueDate);
    if (filter === "completed") return task.status === "completed";
    return task.type === filter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    if (sortBy === "priority") {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    }
    return a.title.localeCompare(b.title);
  });

  const stats = {
    total: tasks.filter(t => t.status !== "completed").length,
    overdue: tasks.filter(t => t.dueDate && isPast(t.dueDate) && t.status !== "completed").length,
    dueToday: tasks.filter(t => t.dueDate && isToday(t.dueDate) && t.status !== "completed").length,
    signatures: tasks.filter(t => t.type === "signature" && t.status !== "completed").length,
    readings: tasks.filter(t => t.type === "reading" && t.status !== "completed").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
            <p className="text-muted-foreground mt-1">
              All your pending items in one place
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="cursor-pointer hover:bg-accent/5" onClick={() => setFilter("all")}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer hover:bg-accent/5 ${stats.overdue > 0 ? "border-red-200 bg-red-50/50" : ""}`} onClick={() => setFilter("overdue")}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-8 h-8 ${stats.overdue > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/5" onClick={() => setFilter("today")}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.dueToday}</p>
                  <p className="text-xs text-muted-foreground">Due Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/5" onClick={() => setFilter("signature")}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <FileSignature className="w-8 h-8 text-indigo-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.signatures}</p>
                  <p className="text-xs text-muted-foreground">Signatures</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/5" onClick={() => setFilter("reading")}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-teal-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.readings}</p>
                  <p className="text-xs text-muted-foreground">Readings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="today">Due Today</SelectItem>
                <SelectItem value="signature">Signatures</SelectItem>
                <SelectItem value="reading">Readings</SelectItem>
                <SelectItem value="approval">Approvals</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">All caught up!</h3>
              <p className="text-muted-foreground mt-1">
                {filter === "completed" ? "No completed tasks yet" : "No pending tasks in this category"}
              </p>
            </Card>
          ) : (
            sortedTasks.map(task => {
              const Icon = typeIcons[task.type];
              const isOverdue = task.dueDate && isPast(task.dueDate) && task.status !== "completed";
              const isDueToday = task.dueDate && isToday(task.dueDate);
              
              return (
                <Card 
                  key={task.id} 
                  className={`hover:shadow-md transition-shadow ${isOverdue ? "border-red-200 bg-red-50/30" : ""} ${task.status === "completed" ? "opacity-60" : ""}`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <Checkbox 
                        checked={task.status === "completed"}
                        onCheckedChange={() => handleComplete(task.id)}
                        className="mt-1"
                      />
                      <div className={`p-2 rounded-lg bg-accent/10 ${typeColors[task.type]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className={`font-semibold ${task.status === "completed" ? "line-through" : ""}`}>
                              {task.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <Badge variant="outline" className={priorityColors[task.priority]}>
                                {task.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                From: {task.source}
                              </span>
                              {task.dueDate && (
                                <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : isDueToday ? "text-amber-600" : "text-muted-foreground"}`}>
                                  <Clock className="w-3 h-3" />
                                  {isOverdue ? "Overdue: " : isDueToday ? "Due today: " : "Due: "}
                                  {format(task.dueDate, "MMM d, yyyy")}
                                  {!isOverdue && !isDueToday && ` (${formatDistanceToNow(task.dueDate, { addSuffix: true })})`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.link && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setLocation(task.link!)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
