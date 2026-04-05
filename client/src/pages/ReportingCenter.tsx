import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  BarChart3, FileText, Download, Calendar, Clock, Plus, Play,
  Settings, Trash2, Copy, Share2, Eye, Edit, Filter, PieChart,
  TrendingUp, Users, DollarSign, ClipboardList, Building2, Mail,
  RefreshCw, CheckCircle, AlertTriangle, FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  fields: string[];
  lastRun?: string;
  schedule?: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  schedule: "daily" | "weekly" | "monthly";
  nextRun: string;
  recipients: string[];
  format: "pdf" | "excel" | "csv";
  status: "active" | "paused";
}

interface ReportField {
  id: string;
  name: string;
  category: string;
  type: "text" | "number" | "date" | "currency";
}

export default function ReportingCenter() {
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // Report builder state
  const [builderName, setBuilderName] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [builderFilters, setBuilderFilters] = useState<Record<string, string>>({});

  // Report templates
  const templates: ReportTemplate[] = [
    {
      id: "1",
      name: "Financial Summary",
      description: "Overview of revenue, expenses, and profit margins",
      category: "Finance",
      icon: <DollarSign className="w-5 h-5" />,
      fields: ["revenue", "expenses", "profit", "margin"],
      lastRun: "Jan 26, 2026",
      schedule: "Weekly",
    },
    {
      id: "2",
      name: "Task Completion Report",
      description: "Track task completion rates by team and department",
      category: "Operations",
      icon: <ClipboardList className="w-5 h-5" />,
      fields: ["tasks_total", "tasks_completed", "completion_rate", "overdue"],
      lastRun: "Jan 25, 2026",
    },
    {
      id: "3",
      name: "Employee Performance",
      description: "Individual and team performance metrics",
      category: "HR",
      icon: <Users className="w-5 h-5" />,
      fields: ["employee", "department", "tasks_completed", "rating"],
      lastRun: "Jan 20, 2026",
      schedule: "Monthly",
    },
    {
      id: "4",
      name: "Training Progress",
      description: "Course completion and certification status",
      category: "Training",
      icon: <TrendingUp className="w-5 h-5" />,
      fields: ["employee", "course", "progress", "completion_date"],
    },
    {
      id: "5",
      name: "Document Activity",
      description: "Document uploads, views, and signatures",
      category: "Documents",
      icon: <FileText className="w-5 h-5" />,
      fields: ["document", "type", "views", "signatures", "date"],
      lastRun: "Jan 27, 2026",
      schedule: "Daily",
    },
    {
      id: "6",
      name: "Entity Overview",
      description: "Business entity performance and allocations",
      category: "Business",
      icon: <Building2 className="w-5 h-5" />,
      fields: ["entity", "revenue", "allocation", "status"],
    },
    {
      id: "7",
      name: "Compliance Status",
      description: "Regulatory compliance and deadline tracking",
      category: "Compliance",
      icon: <CheckCircle className="w-5 h-5" />,
      fields: ["requirement", "status", "deadline", "responsible"],
      schedule: "Weekly",
    },
    {
      id: "8",
      name: "Grant Tracking",
      description: "Grant applications, awards, and utilization",
      category: "Grants",
      icon: <PieChart className="w-5 h-5" />,
      fields: ["grant", "amount", "status", "utilization"],
    },
  ];

  // Scheduled reports
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: "1",
      name: "Weekly Financial Summary",
      schedule: "weekly",
      nextRun: "Jan 28, 2026 9:00 AM",
      recipients: ["admin@laws.org", "finance@laws.org"],
      format: "pdf",
      status: "active",
    },
    {
      id: "2",
      name: "Daily Document Activity",
      schedule: "daily",
      nextRun: "Jan 28, 2026 6:00 AM",
      recipients: ["admin@laws.org"],
      format: "excel",
      status: "active",
    },
    {
      id: "3",
      name: "Monthly Performance Review",
      schedule: "monthly",
      nextRun: "Feb 1, 2026 9:00 AM",
      recipients: ["hr@laws.org", "admin@laws.org"],
      format: "pdf",
      status: "paused",
    },
  ]);

  // Available fields for custom reports
  const availableFields: ReportField[] = [
    { id: "date", name: "Date", category: "General", type: "date" },
    { id: "employee_name", name: "Employee Name", category: "HR", type: "text" },
    { id: "department", name: "Department", category: "HR", type: "text" },
    { id: "task_title", name: "Task Title", category: "Tasks", type: "text" },
    { id: "task_status", name: "Task Status", category: "Tasks", type: "text" },
    { id: "due_date", name: "Due Date", category: "Tasks", type: "date" },
    { id: "revenue", name: "Revenue", category: "Finance", type: "currency" },
    { id: "expenses", name: "Expenses", category: "Finance", type: "currency" },
    { id: "profit", name: "Profit", category: "Finance", type: "currency" },
    { id: "document_name", name: "Document Name", category: "Documents", type: "text" },
    { id: "document_type", name: "Document Type", category: "Documents", type: "text" },
    { id: "entity_name", name: "Entity Name", category: "Business", type: "text" },
    { id: "allocation", name: "Allocation %", category: "Business", type: "number" },
    { id: "course_name", name: "Course Name", category: "Training", type: "text" },
    { id: "progress", name: "Progress %", category: "Training", type: "number" },
  ];

  const categoryColors: Record<string, string> = {
    Finance: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Operations: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    HR: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Training: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Documents: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Business: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Compliance: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    Grants: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  };

  const runReport = (template: ReportTemplate) => {
    toast.success(`Running ${template.name}...`);
    // Simulate report generation
    setTimeout(() => {
      toast.success("Report generated successfully", {
        description: "Download will start automatically",
      });
    }, 2000);
  };

  const exportReport = (format: "pdf" | "excel" | "csv") => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
  };

  const toggleScheduleStatus = (id: string) => {
    setScheduledReports(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, status: r.status === "active" ? "paused" : "active" }
          : r
      )
    );
    toast.success("Schedule updated");
  };

  const deleteScheduledReport = (id: string) => {
    setScheduledReports(prev => prev.filter(r => r.id !== id));
    toast.success("Scheduled report deleted");
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const createCustomReport = () => {
    if (!builderName.trim()) {
      toast.error("Please enter a report name");
      return;
    }
    if (selectedFields.length === 0) {
      toast.error("Please select at least one field");
      return;
    }
    toast.success("Custom report created", {
      description: "You can now run or schedule this report",
    });
    setShowBuilder(false);
    setBuilderName("");
    setSelectedFields([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reporting Center</h1>
            <p className="text-muted-foreground">
              Generate, schedule, and export reports across all modules
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBuilder(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Custom Report
            </Button>
            <Button onClick={() => setShowScheduleDialog(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{templates.length}</p>
                  <p className="text-xs text-muted-foreground">Report Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{scheduledReports.filter(r => r.status === "active").length}</p>
                  <p className="text-xs text-muted-foreground">Active Schedules</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-muted-foreground">Reports Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Download className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-xs text-muted-foreground">Downloads This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="history">Report History</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", categoryColors[template.category])}>
                        {template.icon}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-3">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      {template.lastRun && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last: {template.lastRun}
                        </span>
                      )}
                      {template.schedule && (
                        <Badge variant="secondary" className="text-xs">
                          {template.schedule}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => runReport(template)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Run
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowScheduleDialog(true);
                        }}
                      >
                        <Calendar className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="divide-y">
                    {scheduledReports.map((report) => (
                      <div key={report.id} className="p-4 flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          report.status === "active" ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-800"
                        )}>
                          <Calendar className={cn(
                            "w-5 h-5",
                            report.status === "active" ? "text-green-600 dark:text-green-400" : "text-gray-400"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{report.name}</p>
                            <Badge variant={report.status === "active" ? "default" : "secondary"} className="text-xs">
                              {report.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="capitalize">{report.schedule}</span>
                            <span>Next: {report.nextRun}</span>
                            <span>{report.recipients.length} recipient(s)</span>
                            <Badge variant="outline" className="text-xs uppercase">
                              {report.format}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleScheduleStatus(report.id)}
                          >
                            {report.status === "active" ? "Pause" : "Resume"}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteScheduledReport(report.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="divide-y">
                    {[
                      { id: "1", name: "Financial Summary", date: "Jan 27, 2026 10:30 AM", format: "PDF", size: "245 KB", status: "completed" },
                      { id: "2", name: "Task Completion Report", date: "Jan 26, 2026 3:15 PM", format: "Excel", size: "1.2 MB", status: "completed" },
                      { id: "3", name: "Employee Performance", date: "Jan 25, 2026 9:00 AM", format: "PDF", size: "890 KB", status: "completed" },
                      { id: "4", name: "Document Activity", date: "Jan 24, 2026 6:00 AM", format: "CSV", size: "156 KB", status: "completed" },
                      { id: "5", name: "Compliance Status", date: "Jan 23, 2026 11:45 AM", format: "PDF", size: "320 KB", status: "failed" },
                    ].map((report) => (
                      <div key={report.id} className="p-4 flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          report.status === "completed" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                        )}>
                          {report.status === "completed" ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{report.name}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>{report.date}</span>
                            <Badge variant="outline" className="text-xs">
                              {report.format}
                            </Badge>
                            <span>{report.size}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {report.status === "completed" && (
                            <>
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </>
                          )}
                          {report.status === "failed" && (
                            <Button size="sm" variant="outline">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Custom Report Builder Dialog */}
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Custom Report Builder</DialogTitle>
              <DialogDescription>
                Create a custom report by selecting fields and applying filters
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>
              <div className="space-y-2">
                <Label>Select Fields</Label>
                <ScrollArea className="h-[200px] border rounded-lg p-3">
                  <div className="space-y-4">
                    {["General", "HR", "Tasks", "Finance", "Documents", "Business", "Training"].map((category) => (
                      <div key={category}>
                        <p className="text-xs font-medium text-muted-foreground mb-2">{category}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {availableFields
                            .filter((f) => f.category === category)
                            .map((field) => (
                              <div key={field.id} className="flex items-center gap-2">
                                <Checkbox
                                  id={field.id}
                                  checked={selectedFields.includes(field.id)}
                                  onCheckedChange={() => toggleField(field.id)}
                                />
                                <label htmlFor={field.id} className="text-sm cursor-pointer">
                                  {field.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>{selectedFields.length} field(s) selected</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBuilder(false)}>
                Cancel
              </Button>
              <Button onClick={createCustomReport}>
                Create Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Report Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Report</DialogTitle>
              <DialogDescription>
                Set up automatic report generation and delivery
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Report</Label>
                <Select defaultValue={selectedTemplate?.id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a report" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recipients (comma-separated emails)</Label>
                <Input placeholder="admin@example.com, finance@example.com" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success("Report scheduled successfully");
                setShowScheduleDialog(false);
              }}>
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
