import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  UserPlus,
  UserMinus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Laptop,
  Key,
  Building,
  GraduationCap,
  Shield,
  FileText,
  Users,
  TrendingUp,
  BarChart3,
} from "lucide-react";

// Mock data for onboarding workflows
const mockOnboardingWorkflows = [
  {
    id: "onb-001",
    employeeId: "emp-101",
    employeeName: "Sarah Johnson",
    position: "Software Engineer",
    department: "Technology",
    startDate: "2026-02-01",
    status: "in_progress",
    completedTasks: 18,
    totalTasks: 31,
    createdAt: "2026-01-20",
    tasks: [
      { category: "HR", completed: 5, total: 6 },
      { category: "IT", completed: 4, total: 7 },
      { category: "Property", completed: 3, total: 4 },
      { category: "Finance", completed: 2, total: 4 },
      { category: "Training", completed: 2, total: 5 },
      { category: "Security", completed: 1, total: 3 },
      { category: "Admin", completed: 1, total: 2 },
    ],
  },
  {
    id: "onb-002",
    employeeId: "emp-102",
    employeeName: "Michael Chen",
    position: "Financial Analyst",
    department: "Finance",
    startDate: "2026-02-15",
    status: "pending",
    completedTasks: 0,
    totalTasks: 31,
    createdAt: "2026-01-25",
    tasks: [
      { category: "HR", completed: 0, total: 6 },
      { category: "IT", completed: 0, total: 7 },
      { category: "Property", completed: 0, total: 4 },
      { category: "Finance", completed: 0, total: 4 },
      { category: "Training", completed: 0, total: 5 },
      { category: "Security", completed: 0, total: 3 },
      { category: "Admin", completed: 0, total: 2 },
    ],
  },
  {
    id: "onb-003",
    employeeId: "emp-103",
    employeeName: "Emily Rodriguez",
    position: "Marketing Coordinator",
    department: "Marketing",
    startDate: "2026-01-15",
    status: "completed",
    completedTasks: 31,
    totalTasks: 31,
    createdAt: "2026-01-05",
    tasks: [
      { category: "HR", completed: 6, total: 6 },
      { category: "IT", completed: 7, total: 7 },
      { category: "Property", completed: 4, total: 4 },
      { category: "Finance", completed: 4, total: 4 },
      { category: "Training", completed: 5, total: 5 },
      { category: "Security", completed: 3, total: 3 },
      { category: "Admin", completed: 2, total: 2 },
    ],
  },
];

// Mock data for offboarding workflows
const mockOffboardingWorkflows = [
  {
    id: "off-001",
    employeeId: "emp-050",
    employeeName: "James Wilson",
    position: "Project Manager",
    department: "Operations",
    lastDay: "2026-01-31",
    terminationType: "voluntary",
    status: "in_progress",
    completedTasks: 15,
    totalTasks: 28,
    exitInterviewScheduled: true,
    exitInterviewCompleted: false,
    createdAt: "2026-01-15",
    tasks: [
      { category: "HR", completed: 4, total: 6 },
      { category: "IT", completed: 5, total: 7 },
      { category: "Property", completed: 2, total: 4 },
      { category: "Finance", completed: 2, total: 4 },
      { category: "Security", completed: 1, total: 4 },
      { category: "Admin", completed: 1, total: 3 },
    ],
  },
  {
    id: "off-002",
    employeeId: "emp-051",
    employeeName: "Lisa Thompson",
    position: "HR Specialist",
    department: "Human Resources",
    lastDay: "2026-02-14",
    terminationType: "voluntary",
    status: "pending",
    completedTasks: 0,
    totalTasks: 28,
    exitInterviewScheduled: false,
    exitInterviewCompleted: false,
    createdAt: "2026-01-24",
    tasks: [
      { category: "HR", completed: 0, total: 6 },
      { category: "IT", completed: 0, total: 7 },
      { category: "Property", completed: 0, total: 4 },
      { category: "Finance", completed: 0, total: 4 },
      { category: "Security", completed: 0, total: 4 },
      { category: "Admin", completed: 0, total: 3 },
    ],
  },
];

// Statistics data
const mockStats = {
  onboarding: {
    active: 2,
    completed: 15,
    avgCompletionDays: 12.5,
    completionRate: 94,
  },
  offboarding: {
    active: 2,
    completed: 8,
    avgCompletionDays: 8.3,
    completionRate: 89,
  },
  byDepartment: [
    { department: "Technology", onboarding: 5, offboarding: 2 },
    { department: "Finance", onboarding: 3, offboarding: 1 },
    { department: "Marketing", onboarding: 4, offboarding: 2 },
    { department: "Operations", onboarding: 2, offboarding: 3 },
    { department: "Human Resources", onboarding: 1, offboarding: 0 },
  ],
  terminationTypes: {
    voluntary: 6,
    involuntary: 1,
    retirement: 1,
    contract_end: 0,
  },
};

const categoryIcons: Record<string, React.ReactNode> = {
  HR: <Users className="w-4 h-4" />,
  IT: <Laptop className="w-4 h-4" />,
  Property: <Building className="w-4 h-4" />,
  Finance: <BarChart3 className="w-4 h-4" />,
  Training: <GraduationCap className="w-4 h-4" />,
  Security: <Shield className="w-4 h-4" />,
  Admin: <FileText className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const terminationTypeColors: Record<string, string> = {
  voluntary: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  involuntary: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  retirement: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  contract_end: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function WorkforceTransitionsDashboard() {
  const [activeTab, setActiveTab] = useState("onboarding");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  const filteredOnboarding = mockOnboardingWorkflows.filter((workflow) => {
    const matchesSearch =
      workflow.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "all" || workflow.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const filteredOffboarding = mockOffboardingWorkflows.filter((workflow) => {
    const matchesSearch =
      workflow.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "all" || workflow.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = [
    "Technology",
    "Finance",
    "Marketing",
    "Operations",
    "Human Resources",
    "Legal",
    "Design",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workforce Transitions</h1>
            <p className="text-muted-foreground mt-1">
              Manage onboarding and offboarding workflows across the organization
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <UserPlus className="w-4 h-4" />
              New Onboarding
            </Button>
            <Button variant="outline" className="gap-2">
              <UserMinus className="w-4 h-4" />
              New Offboarding
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{mockStats.onboarding.active}</div>
                <UserPlus className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mockStats.onboarding.completed} completed this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Offboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{mockStats.offboarding.active}</div>
                <UserMinus className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mockStats.offboarding.completed} completed this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Onboarding Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{mockStats.onboarding.avgCompletionDays} days</div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mockStats.onboarding.completionRate}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Offboarding Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{mockStats.offboarding.avgCompletionDays} days</div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mockStats.offboarding.completionRate}% completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
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
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="onboarding" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Onboarding
            </TabsTrigger>
            <TabsTrigger value="offboarding" className="gap-2">
              <UserMinus className="w-4 h-4" />
              Offboarding
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Workflows</CardTitle>
                <CardDescription>
                  Track and manage new employee onboarding processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOnboarding.map((workflow) => (
                      <TableRow key={workflow.id}>
                        <TableCell className="font-medium">{workflow.employeeName}</TableCell>
                        <TableCell>{workflow.position}</TableCell>
                        <TableCell>{workflow.department}</TableCell>
                        <TableCell>{workflow.startDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(workflow.completedTasks / workflow.totalTasks) * 100}
                              className="w-20 h-2"
                            />
                            <span className="text-sm text-muted-foreground">
                              {workflow.completedTasks}/{workflow.totalTasks}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[workflow.status]}>
                            {workflow.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedWorkflow(workflow)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Onboarding: {workflow.employeeName}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {workflow.position} - {workflow.department}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Start Date: {workflow.startDate}
                                    </span>
                                    <Badge className={statusColors[workflow.status]}>
                                      {workflow.status.replace("_", " ")}
                                    </Badge>
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">Overall Progress</span>
                                      <span className="text-sm">
                                        {workflow.completedTasks}/{workflow.totalTasks} tasks
                                      </span>
                                    </div>
                                    <Progress
                                      value={
                                        (workflow.completedTasks / workflow.totalTasks) * 100
                                      }
                                      className="h-3"
                                    />
                                  </div>
                                  <div className="space-y-3">
                                    <h4 className="font-medium">Tasks by Category</h4>
                                    {workflow.tasks.map((task) => (
                                      <div
                                        key={task.category}
                                        className="flex items-center gap-3"
                                      >
                                        <div className="w-24 flex items-center gap-2">
                                          {categoryIcons[task.category]}
                                          <span className="text-sm">{task.category}</span>
                                        </div>
                                        <Progress
                                          value={(task.completed / task.total) * 100}
                                          className="flex-1 h-2"
                                        />
                                        <span className="text-sm text-muted-foreground w-12">
                                          {task.completed}/{task.total}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {workflow.status === "pending" && (
                              <Button variant="ghost" size="sm" title="Start Workflow">
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            {workflow.status === "in_progress" && (
                              <Button variant="ghost" size="sm" title="Run Automated Tasks">
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offboarding Tab */}
          <TabsContent value="offboarding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Offboarding Workflows</CardTitle>
                <CardDescription>
                  Track and manage employee departure processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Last Day</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Exit Interview</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOffboarding.map((workflow) => (
                      <TableRow key={workflow.id}>
                        <TableCell className="font-medium">{workflow.employeeName}</TableCell>
                        <TableCell>{workflow.position}</TableCell>
                        <TableCell>{workflow.department}</TableCell>
                        <TableCell>{workflow.lastDay}</TableCell>
                        <TableCell>
                          <Badge className={terminationTypeColors[workflow.terminationType]}>
                            {workflow.terminationType.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(workflow.completedTasks / workflow.totalTasks) * 100}
                              className="w-20 h-2"
                            />
                            <span className="text-sm text-muted-foreground">
                              {workflow.completedTasks}/{workflow.totalTasks}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {workflow.exitInterviewCompleted ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          ) : workflow.exitInterviewScheduled ? (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              <Calendar className="w-3 h-3 mr-1" />
                              Scheduled
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Not Scheduled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedWorkflow(workflow)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Offboarding: {workflow.employeeName}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {workflow.position} - {workflow.department}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Last Day: {workflow.lastDay}
                                    </span>
                                    <Badge className={terminationTypeColors[workflow.terminationType]}>
                                      {workflow.terminationType.replace("_", " ")}
                                    </Badge>
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">Overall Progress</span>
                                      <span className="text-sm">
                                        {workflow.completedTasks}/{workflow.totalTasks} tasks
                                      </span>
                                    </div>
                                    <Progress
                                      value={
                                        (workflow.completedTasks / workflow.totalTasks) * 100
                                      }
                                      className="h-3"
                                    />
                                  </div>
                                  <div className="p-3 bg-secondary/30 rounded-lg">
                                    <h4 className="font-medium mb-2">Exit Interview Status</h4>
                                    <div className="flex items-center gap-2">
                                      {workflow.exitInterviewCompleted ? (
                                        <>
                                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                                          <span>Exit interview completed</span>
                                        </>
                                      ) : workflow.exitInterviewScheduled ? (
                                        <>
                                          <Calendar className="w-5 h-5 text-blue-500" />
                                          <span>Exit interview scheduled</span>
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                                          <span>Exit interview not yet scheduled</span>
                                          <Button size="sm" variant="outline" className="ml-auto">
                                            Schedule Now
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <h4 className="font-medium">Tasks by Category</h4>
                                    {workflow.tasks.map((task) => (
                                      <div
                                        key={task.category}
                                        className="flex items-center gap-3"
                                      >
                                        <div className="w-24 flex items-center gap-2">
                                          {categoryIcons[task.category]}
                                          <span className="text-sm">{task.category}</span>
                                        </div>
                                        <Progress
                                          value={(task.completed / task.total) * 100}
                                          className="flex-1 h-2"
                                        />
                                        <span className="text-sm text-muted-foreground w-12">
                                          {task.completed}/{task.total}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {!workflow.exitInterviewScheduled && (
                              <Button variant="ghost" size="sm" title="Schedule Exit Interview">
                                <Calendar className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* By Department */}
              <Card>
                <CardHeader>
                  <CardTitle>Transitions by Department</CardTitle>
                  <CardDescription>
                    Onboarding and offboarding activity across departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStats.byDepartment.map((dept) => (
                      <div key={dept.department} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{dept.department}</span>
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">+{dept.onboarding}</span>
                            <span className="text-orange-600">-{dept.offboarding}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 h-2">
                          <div
                            className="bg-green-500 rounded-l"
                            style={{
                              width: `${(dept.onboarding / (dept.onboarding + dept.offboarding || 1)) * 100}%`,
                            }}
                          />
                          <div
                            className="bg-orange-500 rounded-r"
                            style={{
                              width: `${(dept.offboarding / (dept.onboarding + dept.offboarding || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Termination Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Termination Types</CardTitle>
                  <CardDescription>
                    Breakdown of departure reasons this quarter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(mockStats.terminationTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={terminationTypeColors[type]}>
                            {type.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{
                                width: `${(count / Object.values(mockStats.terminationTypes).reduce((a, b) => a + b, 0) || 1) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Key metrics for workforce transition processes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {mockStats.onboarding.completionRate}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Onboarding Completion Rate
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {mockStats.onboarding.avgCompletionDays}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Avg. Onboarding Days
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {mockStats.offboarding.completionRate}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Offboarding Completion Rate
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {mockStats.offboarding.avgCompletionDays}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Avg. Offboarding Days
                      </div>
                    </div>
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
