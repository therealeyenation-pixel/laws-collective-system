import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  DollarSign,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Send,
  Award,
  Building2,
  Briefcase,
  GraduationCap,
  Heart,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";

// Mock data for grants
const mockGrants = [
  {
    id: 1,
    name: "Community Development Block Grant",
    funder: "HUD",
    amount: 500000,
    deadline: "2026-03-15",
    status: "in_progress",
    progress: 65,
    category: "community",
    assignedTo: "Grant Team",
  },
  {
    id: 2,
    name: "Youth Education Initiative",
    funder: "Department of Education",
    amount: 250000,
    deadline: "2026-02-28",
    status: "submitted",
    progress: 100,
    category: "education",
    assignedTo: "Education Dept",
  },
  {
    id: 3,
    name: "Healthcare Access Program",
    funder: "HRSA",
    amount: 750000,
    deadline: "2026-04-30",
    status: "draft",
    progress: 25,
    category: "health",
    assignedTo: "Health Dept",
  },
  {
    id: 4,
    name: "Small Business Development",
    funder: "SBA",
    amount: 150000,
    deadline: "2026-05-15",
    status: "awarded",
    progress: 100,
    category: "business",
    assignedTo: "Business Dept",
  },
  {
    id: 5,
    name: "Environmental Sustainability",
    funder: "EPA",
    amount: 300000,
    deadline: "2026-06-01",
    status: "not_started",
    progress: 0,
    category: "environment",
    assignedTo: "Operations",
  },
];

const mockDeadlines = [
  { id: 1, grant: "Community Development Block Grant", task: "Submit narrative", date: "2026-02-01", priority: "high" },
  { id: 2, grant: "Youth Education Initiative", task: "Budget revision", date: "2026-02-15", priority: "medium" },
  { id: 3, grant: "Healthcare Access Program", task: "Gather letters of support", date: "2026-03-01", priority: "high" },
  { id: 4, grant: "Environmental Sustainability", task: "Initial research", date: "2026-03-15", priority: "low" },
];

const mockReports = [
  { id: 1, grant: "Small Business Development", type: "Quarterly", dueDate: "2026-03-31", status: "pending" },
  { id: 2, grant: "Youth Education Initiative", type: "Annual", dueDate: "2026-06-30", status: "pending" },
];

export default function GrantsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isNewGrantOpen, setIsNewGrantOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      in_progress: { variant: "secondary", label: "In Progress" },
      submitted: { variant: "default", label: "Submitted" },
      awarded: { variant: "default", label: "Awarded" },
      not_started: { variant: "outline", label: "Not Started" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      community: <Building2 className="w-4 h-4" />,
      education: <GraduationCap className="w-4 h-4" />,
      health: <Heart className="w-4 h-4" />,
      business: <Briefcase className="w-4 h-4" />,
      environment: <Leaf className="w-4 h-4" />,
    };
    return icons[category] || <FileText className="w-4 h-4" />;
  };

  const filteredGrants = mockGrants.filter((grant) => {
    const matchesSearch = grant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.funder.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || grant.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || grant.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalFunding = mockGrants.reduce((sum, g) => sum + g.amount, 0);
  const awardedFunding = mockGrants.filter(g => g.status === "awarded").reduce((sum, g) => sum + g.amount, 0);
  const pendingFunding = mockGrants.filter(g => g.status === "submitted").reduce((sum, g) => sum + g.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Grants Department</h1>
            <p className="text-muted-foreground">
              Manage grant applications, deadlines, and reporting
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info("Exporting grants data...")}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isNewGrantOpen} onOpenChange={setIsNewGrantOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Grant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Grant Opportunity</DialogTitle>
                  <DialogDescription>
                    Enter the details of the grant opportunity you want to pursue.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grantName">Grant Name</Label>
                      <Input id="grantName" placeholder="Enter grant name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="funder">Funding Organization</Label>
                      <Input id="funder" placeholder="Enter funder name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Funding Amount</Label>
                      <Input id="amount" type="number" placeholder="Enter amount" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <Input id="deadline" type="date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="community">Community Development</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="health">Healthcare</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="environment">Environment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignee">Assigned Department</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grants">Grant Team</SelectItem>
                          <SelectItem value="education">Education Dept</SelectItem>
                          <SelectItem value="health">Health Dept</SelectItem>
                          <SelectItem value="business">Business Dept</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Enter grant description and requirements" rows={4} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewGrantOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success("Grant opportunity added successfully");
                    setIsNewGrantOpen(false);
                  }}>
                    Add Grant
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pipeline</p>
                  <p className="text-2xl font-bold">${(totalFunding / 1000000).toFixed(2)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Awarded</p>
                  <p className="text-2xl font-bold">${(awardedFunding / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">${(pendingFunding / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Grants</p>
                  <p className="text-2xl font-bold">{mockGrants.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="grants" className="w-full">
          <TabsList>
            <TabsTrigger value="grants">
              <FileText className="w-4 h-4 mr-2" />
              Grant Applications
            </TabsTrigger>
            <TabsTrigger value="deadlines">
              <Calendar className="w-4 h-4 mr-2" />
              Deadlines
            </TabsTrigger>
            <TabsTrigger value="reports">
              <TrendingUp className="w-4 h-4 mr-2" />
              Reporting
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Grants Tab */}
          <TabsContent value="grants" className="space-y-4 mt-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search grants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="awarded">Awarded</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="health">Healthcare</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grants Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Grant Name</TableHead>
                      <TableHead>Funder</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrants.map((grant) => (
                      <TableRow key={grant.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(grant.category)}
                            <span className="font-medium">{grant.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{grant.funder}</TableCell>
                        <TableCell>${grant.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(grant.deadline).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={grant.progress} className="w-20 h-2" />
                            <span className="text-sm text-muted-foreground">{grant.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(grant.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => toast.info("Viewing grant details...")}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toast.info("Editing grant...")}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deadlines Tab */}
          <TabsContent value="deadlines" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Tasks and milestones for active grant applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          deadline.priority === "high" ? "bg-red-100" :
                          deadline.priority === "medium" ? "bg-amber-100" : "bg-green-100"
                        }`}>
                          <Calendar className={`w-5 h-5 ${
                            deadline.priority === "high" ? "text-red-600" :
                            deadline.priority === "medium" ? "text-amber-600" : "text-green-600"
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{deadline.task}</p>
                          <p className="text-sm text-muted-foreground">{deadline.grant}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={
                          deadline.priority === "high" ? "destructive" :
                          deadline.priority === "medium" ? "secondary" : "outline"
                        }>
                          {deadline.priority}
                        </Badge>
                        <span className="text-sm">{new Date(deadline.date).toLocaleDateString()}</span>
                        <Button size="sm" variant="outline">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Grant Reporting</CardTitle>
                <CardDescription>Required reports for awarded grants</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Grant</TableHead>
                      <TableHead>Report Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.grant}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{new Date(report.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === "pending" ? "secondary" : "default"}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            <Upload className="w-4 h-4 mr-1" />
                            Submit Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Grant Development Team</CardTitle>
                <CardDescription>Team members and their assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold">Grant Writer</h3>
                      <p className="text-sm text-muted-foreground mb-4">Position Open</p>
                      <Button variant="outline" size="sm">
                        View Job Description
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold">Grant Coordinator</h3>
                      <p className="text-sm text-muted-foreground mb-4">Position Open</p>
                      <Button variant="outline" size="sm">
                        View Job Description
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold">Research Analyst</h3>
                      <p className="text-sm text-muted-foreground mb-4">Position Open</p>
                      <Button variant="outline" size="sm">
                        View Job Description
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
