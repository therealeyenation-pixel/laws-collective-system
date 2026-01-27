import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  FileText,
  PenTool,
  ThumbsUp,
  Calendar,
  BarChart3,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  stats: {
    totalTasks: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  completionRate: number;
  trend: "up" | "down" | "stable";
  lastActive: Date;
}

interface TeamTask {
  id: string;
  title: string;
  type: "article" | "signature" | "approval" | "deadline";
  assignee: string;
  assigneeId: string;
  dueDate: Date | null;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "overdue";
  createdAt: Date;
}

// Mock team members data
const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Senior Analyst",
    department: "Finance",
    stats: { totalTasks: 45, completed: 38, pending: 5, overdue: 2 },
    completionRate: 84,
    trend: "up",
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    role: "Compliance Officer",
    department: "Legal",
    stats: { totalTasks: 32, completed: 28, pending: 3, overdue: 1 },
    completionRate: 88,
    trend: "up",
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    role: "HR Manager",
    department: "Human Resources",
    stats: { totalTasks: 28, completed: 20, pending: 6, overdue: 2 },
    completionRate: 71,
    trend: "down",
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@example.com",
    role: "Operations Lead",
    department: "Operations",
    stats: { totalTasks: 52, completed: 48, pending: 4, overdue: 0 },
    completionRate: 92,
    trend: "up",
    lastActive: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "5",
    name: "Jessica Williams",
    email: "jessica.williams@example.com",
    role: "Grant Writer",
    department: "Development",
    stats: { totalTasks: 18, completed: 12, pending: 4, overdue: 2 },
    completionRate: 67,
    trend: "stable",
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// Mock team tasks
const mockTeamTasks: TeamTask[] = [
  {
    id: "t1",
    title: "Review Q4 Financial Report",
    type: "article",
    assignee: "Sarah Johnson",
    assigneeId: "1",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    priority: "high",
    status: "overdue",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "t2",
    title: "Sign Employment Agreement",
    type: "signature",
    assignee: "Emily Rodriguez",
    assigneeId: "3",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    priority: "high",
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "t3",
    title: "Approve Budget Amendment",
    type: "approval",
    assignee: "Michael Chen",
    assigneeId: "2",
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
    priority: "high",
    status: "in_progress",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "t4",
    title: "Complete Compliance Training",
    type: "article",
    assignee: "David Kim",
    assigneeId: "4",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: "medium",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "t5",
    title: "Review Grant Proposal",
    type: "approval",
    assignee: "Jessica Williams",
    assigneeId: "5",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    priority: "high",
    status: "overdue",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "t6",
    title: "Sign Vendor Contract",
    type: "signature",
    assignee: "Sarah Johnson",
    assigneeId: "1",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: "low",
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

const taskTypeIcons = {
  article: FileText,
  signature: PenTool,
  approval: ThumbsUp,
  deadline: Calendar,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export default function TeamTaskDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Calculate team summary stats
  const teamStats = {
    totalMembers: mockTeamMembers.length,
    totalTasks: mockTeamMembers.reduce((acc, m) => acc + m.stats.totalTasks, 0),
    completedTasks: mockTeamMembers.reduce((acc, m) => acc + m.stats.completed, 0),
    pendingTasks: mockTeamMembers.reduce((acc, m) => acc + m.stats.pending, 0),
    overdueTasks: mockTeamMembers.reduce((acc, m) => acc + m.stats.overdue, 0),
    avgCompletionRate: Math.round(
      mockTeamMembers.reduce((acc, m) => acc + m.completionRate, 0) / mockTeamMembers.length
    ),
  };

  // Filter team members
  const filteredMembers = mockTeamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || member.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Filter tasks
  const filteredTasks = mockTeamTasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesMember = !selectedMember || task.assigneeId === selectedMember.id;
    return matchesStatus && matchesMember;
  });

  const departments = [...new Set(mockTeamMembers.map((m) => m.department))];

  const handleExportReport = () => {
    toast.success("Team task report exported");
  };

  const handleRefresh = () => {
    toast.info("Refreshing team data...");
  };

  const handleSendReminder = (memberId: string) => {
    const member = mockTeamMembers.find((m) => m.id === memberId);
    toast.success(`Reminder sent to ${member?.name}`);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Team Task Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor team progress and manage task assignments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Team Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{teamStats.totalMembers}</p>
              <p className="text-xs text-muted-foreground">Team Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{teamStats.totalTasks}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{teamStats.completedTasks}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{teamStats.pendingTasks}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold">{teamStats.overdueTasks}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{teamStats.avgCompletionRate}%</p>
              <p className="text-xs text-muted-foreground">Avg Completion</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="w-full">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="members" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <Card
                  key={member.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMember?.id === member.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() =>
                    setSelectedMember(selectedMember?.id === member.id ? null : member)
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      {member.stats.overdue > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {member.stats.overdue} overdue
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completion Rate</span>
                        <span className="font-medium flex items-center gap-1">
                          {member.completionRate}%
                          {member.trend === "up" && (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          )}
                          {member.trend === "down" && (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                        </span>
                      </div>
                      <Progress value={member.completionRate} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <div className="bg-green-50 dark:bg-green-950 rounded p-2">
                        <p className="text-lg font-bold text-green-600">
                          {member.stats.completed}
                        </p>
                        <p className="text-xs text-muted-foreground">Done</p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-950 rounded p-2">
                        <p className="text-lg font-bold text-yellow-600">
                          {member.stats.pending}
                        </p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950 rounded p-2">
                        <p className="text-lg font-bold text-red-600">
                          {member.stats.overdue}
                        </p>
                        <p className="text-xs text-muted-foreground">Overdue</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        Active {formatTimeAgo(member.lastActive)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendReminder(member.id);
                        }}
                      >
                        Send Reminder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* All Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            {/* Task Filters */}
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              {selectedMember && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Filtered by: {selectedMember.name}
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>

            {/* Tasks List */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredTasks.map((task) => {
                    const TaskIcon = taskTypeIcons[task.type];
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-muted rounded">
                            <TaskIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Assigned to {task.assignee}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={priorityColors[task.priority]}>
                            {task.priority}
                          </Badge>
                          <Badge className={statusColors[task.status]}>
                            {task.status.replace("_", " ")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {task.dueDate
                              ? task.dueDate.toLocaleDateString()
                              : "No due date"}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Completion by Department */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completion by Department</CardTitle>
                  <CardDescription>Average task completion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departments.map((dept) => {
                      const deptMembers = mockTeamMembers.filter(
                        (m) => m.department === dept
                      );
                      const avgRate = Math.round(
                        deptMembers.reduce((acc, m) => acc + m.completionRate, 0) /
                          deptMembers.length
                      );
                      return (
                        <div key={dept}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{dept}</span>
                            <span className="font-medium">{avgRate}%</span>
                          </div>
                          <Progress value={avgRate} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performers</CardTitle>
                  <CardDescription>Highest completion rates this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...mockTeamMembers]
                      .sort((a, b) => b.completionRate - a.completionRate)
                      .slice(0, 5)
                      .map((member, index) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : index === 1
                                  ? "bg-gray-100 text-gray-800"
                                  : index === 2
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {member.department}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{member.completionRate}%</span>
                            {member.trend === "up" && (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Attention Needed */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Attention Needed
                  </CardTitle>
                  <CardDescription>
                    Team members with overdue tasks or declining performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockTeamMembers
                      .filter((m) => m.stats.overdue > 0 || m.trend === "down")
                      .map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {member.stats.overdue} overdue •{" "}
                                {member.trend === "down" ? "Declining" : "Stable"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendReminder(member.id)}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Check In
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
