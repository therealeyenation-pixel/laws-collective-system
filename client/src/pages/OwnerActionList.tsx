import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Building2,
  Shield,
  BookOpen,
  Coins,
  Users,
  FileText,
  Settings,
  Zap,
  ChevronRight,
  Filter,
  Search,
  Calendar,
  Target,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";

// Task categories with their phases and items
const actionCategories = [
  {
    id: "company-setup",
    name: "Company Structure Setup",
    phase: "Phase 10.1",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    priority: "high",
    description: "Establish the 5 company entities and their hierarchical relationships",
    tasks: [
      { id: 1, title: "Create CALEA Freeman Family Trust business entity (root)", status: "pending", priority: "critical" },
      { id: 2, title: "Create LuvOnPurpose Academy & Outreach business entity", status: "pending", priority: "high" },
      { id: 3, title: "Create Real-Eye-Nation business entity", status: "pending", priority: "high" },
      { id: 4, title: "Create LuvOnPurpose Autonomous Wealth System LLC business entity", status: "pending", priority: "high" },
      { id: 5, title: "Create The The The L.A.W.S. Collective LLC business entity", status: "pending", priority: "high" },
      { id: 6, title: "Set up hierarchical relationships (all report to Trust)", status: "pending", priority: "high" },
      { id: 7, title: "Configure allocation percentages (40/30/20/10 split)", status: "pending", priority: "high" },
      { id: 8, title: "Initialize LuvLedger accounts for each entity", status: "pending", priority: "medium" },
      { id: 9, title: "Create blockchain records for entity creation", status: "pending", priority: "medium" },
    ],
  },
  {
    id: "trust-authority",
    name: "Trust Authority Operations",
    phase: "Phase 10.2",
    icon: Shield,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    priority: "high",
    description: "Implement governance and policy enforcement for the Trust",
    tasks: [
      { id: 10, title: "Implement Trust governance router", status: "pending", priority: "critical" },
      { id: 11, title: "Create allocation authority procedures", status: "pending", priority: "high" },
      { id: 12, title: "Build policy enforcement mechanisms", status: "pending", priority: "high" },
      { id: 13, title: "Implement conflict resolution logic", status: "pending", priority: "medium" },
      { id: 14, title: "Create sovereignty protection procedures", status: "pending", priority: "high" },
      { id: 15, title: "Build system integrity validation", status: "pending", priority: "medium" },
      { id: 16, title: "Set up audit and approval workflows", status: "pending", priority: "high" },
    ],
  },
  {
    id: "token-economy",
    name: "Token Economy Dashboard",
    phase: "Phase 10.4",
    icon: Coins,
    color: "text-green-600",
    bgColor: "bg-green-50",
    priority: "medium",
    description: "Build token reporting and visualization dashboard",
    tasks: [
      { id: 17, title: "Build token reporting dashboard", status: "pending", priority: "medium" },
    ],
  },
  {
    id: "curriculum",
    name: "Entity-Specific Curriculum",
    phase: "Phase 10.5",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    priority: "medium",
    description: "Generate specialized curriculum for each entity",
    tasks: [
      { id: 18, title: "Generate 'Lineage & Sovereignty' curriculum (Trust)", status: "pending", priority: "high" },
      { id: 19, title: "Generate 'Financial Literacy' curriculum (Academy)", status: "pending", priority: "high" },
      { id: 20, title: "Generate 'Truth & Narrative' curriculum (Real-Eye-Nation)", status: "pending", priority: "medium" },
      { id: 21, title: "Generate 'Product Development' curriculum (Commercial)", status: "pending", priority: "medium" },
      { id: 22, title: "Generate 'Platform Administration' curriculum (L.A.W.S.)", status: "pending", priority: "medium" },
      { id: 23, title: "Create entity-specific simulators", status: "pending", priority: "medium" },
      { id: 24, title: "Configure difficulty adaptation per entity", status: "pending", priority: "low" },
      { id: 25, title: "Set up certificate issuance workflows", status: "pending", priority: "medium" },
    ],
  },
  {
    id: "governance",
    name: "Governance Integration",
    phase: "Phase 10.6",
    icon: Settings,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    priority: "high",
    description: "Build approval workflows and decision escalation paths",
    tasks: [
      { id: 26, title: "Build Trust approval workflows", status: "pending", priority: "critical" },
      { id: 27, title: "Create decision escalation paths", status: "pending", priority: "high" },
      { id: 28, title: "Implement threshold-based human review", status: "pending", priority: "high" },
      { id: 29, title: "Set up conflict resolution procedures", status: "pending", priority: "medium" },
      { id: 30, title: "Create allocation adjustment mechanisms", status: "pending", priority: "medium" },
      { id: 31, title: "Build policy enforcement automation", status: "pending", priority: "high" },
      { id: 32, title: "Implement sovereignty protection rules", status: "pending", priority: "high" },
      { id: 33, title: "Create governance audit trail", status: "pending", priority: "medium" },
    ],
  },
  {
    id: "audit-trail",
    name: "Audit Trail Viewer",
    phase: "Phase 11.6",
    icon: FileText,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    priority: "medium",
    description: "Build activity timeline and blockchain verification UI",
    tasks: [
      { id: 34, title: "Display activity timeline", status: "pending", priority: "medium" },
      { id: 35, title: "Show blockchain verification status", status: "pending", priority: "medium" },
      { id: 36, title: "Create search and filter", status: "pending", priority: "low" },
      { id: 37, title: "Add export functionality", status: "pending", priority: "low" },
    ],
  },
  {
    id: "testing",
    name: "Testing & Validation",
    phase: "Phase 10.7",
    icon: Target,
    color: "text-red-600",
    bgColor: "bg-red-50",
    priority: "high",
    description: "Comprehensive testing of all system components",
    tasks: [
      { id: 38, title: "Test entity creation and relationships", status: "pending", priority: "high" },
      { id: 39, title: "Test token allocation flows", status: "pending", priority: "high" },
      { id: 40, title: "Test autonomous operations per entity", status: "pending", priority: "high" },
      { id: 41, title: "Test curriculum generation per entity", status: "pending", priority: "medium" },
      { id: 42, title: "Test governance decision flows", status: "pending", priority: "high" },
      { id: 43, title: "Test blockchain logging for all entities", status: "pending", priority: "medium" },
      { id: 44, title: "Test offline sync with multi-entity data", status: "pending", priority: "medium" },
      { id: 45, title: "Performance test with full company structure", status: "pending", priority: "medium" },
    ],
  },
  {
    id: "deployment",
    name: "Deployment & Documentation",
    phase: "Phase 10.8",
    icon: Zap,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    priority: "medium",
    description: "Final deployment and documentation tasks",
    tasks: [
      { id: 46, title: "Update system documentation with company structure", status: "pending", priority: "medium" },
      { id: 47, title: "Create entity-specific implementation guides", status: "pending", priority: "medium" },
      { id: 48, title: "Document token economy flows", status: "pending", priority: "low" },
      { id: 49, title: "Create governance procedures manual", status: "pending", priority: "medium" },
      { id: 50, title: "Set up monitoring dashboards", status: "pending", priority: "medium" },
      { id: 51, title: "Create backup and recovery procedures", status: "pending", priority: "high" },
      { id: 52, title: "Deploy to production", status: "pending", priority: "critical" },
      { id: 53, title: "Train administrators on company structure", status: "pending", priority: "medium" },
    ],
  },
];

// Priority colors and labels
const priorityConfig = {
  critical: { color: "bg-red-100 text-red-800 border-red-200", label: "Critical", icon: AlertTriangle },
  high: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "High", icon: Clock },
  medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Medium", icon: Circle },
  low: { color: "bg-green-100 text-green-800 border-green-200", label: "Low", icon: CheckCircle2 },
};

export default function OwnerActionList() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  // Calculate statistics
  const totalTasks = actionCategories.reduce((sum, cat) => sum + cat.tasks.length, 0);
  const completedCount = completedTasks.size;
  const criticalTasks = actionCategories.reduce(
    (sum, cat) => sum + cat.tasks.filter((t) => t.priority === "critical" && !completedTasks.has(t.id)).length,
    0
  );
  const highPriorityTasks = actionCategories.reduce(
    (sum, cat) => sum + cat.tasks.filter((t) => t.priority === "high" && !completedTasks.has(t.id)).length,
    0
  );

  // Filter tasks
  const filteredCategories = actionCategories
    .map((cat) => ({
      ...cat,
      tasks: cat.tasks.filter((task) => {
        const matchesCategory = selectedCategory === "all" || cat.id === selectedCategory;
        const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesPriority && matchesSearch;
      }),
    }))
    .filter((cat) => cat.tasks.length > 0);

  const toggleTask = (taskId: number) => {
    setCompletedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Owner Action List</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage critical tasks for the LuvOnPurpose system
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Review
            </Button>
            <Button className="gap-2 bg-green-700 hover:bg-green-800">
              <TrendingUp className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Progress value={(completedCount / totalTasks) * 100} className="mt-2 h-2" />
          </Card>
          <Card className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold">{criticalTasks}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{highPriorityTasks}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {actionCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Task Categories */}
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const categoryCompleted = category.tasks.filter((t) => completedTasks.has(t.id)).length;
            const categoryProgress = (categoryCompleted / category.tasks.length) * 100;

            return (
              <Card key={category.id} className="overflow-hidden">
                <div className={`p-4 ${category.bgColor} border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                        <Icon className={`w-5 h-5 ${category.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{category.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {category.phase}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {categoryCompleted} / {category.tasks.length} completed
                      </p>
                      <Progress value={categoryProgress} className="w-32 h-2 mt-1" />
                    </div>
                  </div>
                </div>
                <div className="divide-y">
                  {category.tasks.map((task) => {
                    const isCompleted = completedTasks.has(task.id);
                    const priorityCfg = priorityConfig[task.priority as keyof typeof priorityConfig];

                    return (
                      <div
                        key={task.id}
                        className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors ${
                          isCompleted ? "bg-muted/30" : ""
                        }`}
                      >
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="h-5 w-5"
                        />
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>
                        <Badge className={`${priorityCfg.color} border`}>
                          {priorityCfg.label}
                        </Badge>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Details
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-gradient-to-r from-green-700 to-green-800 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Ready to Start?</h3>
              <p className="text-green-100 mt-1">
                Begin with the critical tasks in Company Structure Setup to establish your foundation.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="gap-2">
                <Users className="w-4 h-4" />
                Assign Tasks
              </Button>
              <Button className="bg-white text-green-800 hover:bg-green-50 gap-2">
                Start Phase 10.1
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
