import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Search,
  Plus,
  Building2,
  Users,
  DollarSign,
  ShoppingCart,
  FileCheck,
  Truck,
  Building,
  MapPin,
  FolderKanban,
  CheckCircle,
  Scale,
  Monitor,
  Heart,
  GraduationCap,
  Palette,
  Music,
  Wrench,
  Download,
  Eye,
  Calendar,
  Clock,
  Link2,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface Procedure {
  id: string;
  title: string;
  code: string;
  department: string;
  departmentPath: string;
  category: string;
  version: string;
  lastUpdated: string;
  status: "Active" | "Under Review" | "Draft" | "Archived";
  description: string;
  linkedDepartments: string[];
}

const departmentIcons: Record<string, any> = {
  Business: Building2,
  Health: Heart,
  Education: GraduationCap,
  Design: Palette,
  Media: Music,
  Finance: DollarSign,
  HR: Users,
  Operations: Wrench,
  Procurement: ShoppingCart,
  Contracts: FileCheck,
  Purchasing: Truck,
  Property: Building,
  "Real Estate": MapPin,
  "Project Controls": FolderKanban,
  "QA/QC": CheckCircle,
  Legal: Scale,
  IT: Monitor,
  "Platform Admin": Monitor,
};

const departmentPaths: Record<string, string> = {
  Business: "/dept/business",
  Health: "/dept/health",
  Education: "/dept/education",
  Design: "/dept/design",
  Media: "/dept/media",
  Finance: "/dept/finance",
  HR: "/dept/hr",
  Operations: "/dept/operations",
  Procurement: "/dept/procurement",
  Contracts: "/dept/contracts",
  Purchasing: "/dept/purchasing",
  Property: "/dept/property",
  "Real Estate": "/dept/real-estate",
  "Project Controls": "/dept/project-controls",
  "QA/QC": "/dept/qaqc",
  Legal: "/dept/legal",
  IT: "/dept/it",
  "Platform Admin": "/dept/platform-admin",
};

const mockProcedures: Procedure[] = [
  {
    id: "SOP-001",
    title: "Employee Onboarding Process",
    code: "HR-SOP-001",
    department: "HR",
    departmentPath: "/dept/hr",
    category: "Human Resources",
    version: "3.2",
    lastUpdated: "Jan 15, 2026",
    status: "Active",
    description: "Standard procedure for onboarding new employees including documentation, training, and system access setup.",
    linkedDepartments: ["IT", "Finance", "Operations"],
  },
  {
    id: "SOP-002",
    title: "Purchase Request Approval",
    code: "FIN-SOP-002",
    department: "Finance",
    departmentPath: "/dept/finance",
    category: "Financial Operations",
    version: "2.1",
    lastUpdated: "Jan 10, 2026",
    status: "Active",
    description: "Procedure for submitting and approving purchase requests including threshold limits and approval hierarchy.",
    linkedDepartments: ["Procurement", "Purchasing", "Operations"],
  },
  {
    id: "SOP-003",
    title: "Vendor Qualification Process",
    code: "PROC-SOP-001",
    department: "Procurement",
    departmentPath: "/dept/procurement",
    category: "Procurement",
    version: "1.5",
    lastUpdated: "Jan 8, 2026",
    status: "Active",
    description: "Standard procedure for qualifying and approving new vendors including due diligence and compliance checks.",
    linkedDepartments: ["Legal", "Finance", "QA/QC"],
  },
  {
    id: "SOP-004",
    title: "Contract Review & Approval",
    code: "LEG-SOP-001",
    department: "Legal",
    departmentPath: "/dept/legal",
    category: "Legal & Compliance",
    version: "2.0",
    lastUpdated: "Jan 5, 2026",
    status: "Active",
    description: "Procedure for reviewing, negotiating, and approving contracts including risk assessment and compliance verification.",
    linkedDepartments: ["Contracts", "Finance", "Business"],
  },
  {
    id: "SOP-005",
    title: "Quality Audit Process",
    code: "QA-SOP-001",
    department: "QA/QC",
    departmentPath: "/dept/qaqc",
    category: "Quality Assurance",
    version: "1.8",
    lastUpdated: "Jan 3, 2026",
    status: "Active",
    description: "Standard procedure for conducting internal quality audits including scheduling, execution, and reporting.",
    linkedDepartments: ["Operations", "Project Controls", "Legal"],
  },
  {
    id: "SOP-006",
    title: "IT Security Incident Response",
    code: "IT-SOP-001",
    department: "IT",
    departmentPath: "/dept/it",
    category: "Information Technology",
    version: "2.3",
    lastUpdated: "Dec 28, 2025",
    status: "Active",
    description: "Procedure for responding to security incidents including detection, containment, eradication, and recovery.",
    linkedDepartments: ["Legal", "Operations", "Platform Admin"],
  },
  {
    id: "SOP-007",
    title: "Project Initiation & Planning",
    code: "PM-SOP-001",
    department: "Project Controls",
    departmentPath: "/dept/project-controls",
    category: "Project Management",
    version: "1.4",
    lastUpdated: "Dec 20, 2025",
    status: "Active",
    description: "Standard procedure for initiating and planning new projects including scope definition, resource allocation, and timeline establishment.",
    linkedDepartments: ["Business", "Finance", "Operations"],
  },
  {
    id: "SOP-008",
    title: "Property Acquisition Process",
    code: "RE-SOP-001",
    department: "Real Estate",
    departmentPath: "/dept/real-estate",
    category: "Real Estate",
    version: "1.2",
    lastUpdated: "Dec 15, 2025",
    status: "Under Review",
    description: "Procedure for evaluating, negotiating, and acquiring real estate properties including due diligence and closing.",
    linkedDepartments: ["Legal", "Finance", "Property"],
  },
  {
    id: "SOP-009",
    title: "Asset Tracking & Inventory",
    code: "PROP-SOP-001",
    department: "Property",
    departmentPath: "/dept/property",
    category: "Asset Management",
    version: "1.6",
    lastUpdated: "Dec 10, 2025",
    status: "Active",
    description: "Standard procedure for tracking and managing physical assets including tagging, inventory counts, and disposal.",
    linkedDepartments: ["Finance", "IT", "Purchasing"],
  },
  {
    id: "SOP-010",
    title: "Content Creation Workflow",
    code: "MED-SOP-001",
    department: "Media",
    departmentPath: "/dept/media",
    category: "Media & Communications",
    version: "1.3",
    lastUpdated: "Dec 5, 2025",
    status: "Active",
    description: "Procedure for creating, reviewing, and publishing media content including approval workflow and brand compliance.",
    linkedDepartments: ["Design", "Legal", "Business"],
  },
  {
    id: "SOP-011",
    title: "Brand Guidelines Compliance",
    code: "DES-SOP-001",
    department: "Design",
    departmentPath: "/dept/design",
    category: "Design & Branding",
    version: "2.0",
    lastUpdated: "Nov 28, 2025",
    status: "Active",
    description: "Standard procedure for ensuring all materials comply with brand guidelines including review and approval process.",
    linkedDepartments: ["Media", "Business", "Operations"],
  },
  {
    id: "SOP-012",
    title: "Training Program Development",
    code: "EDU-SOP-001",
    department: "Education",
    departmentPath: "/dept/education",
    category: "Education & Training",
    version: "1.7",
    lastUpdated: "Nov 20, 2025",
    status: "Active",
    description: "Procedure for developing and deploying training programs including curriculum design, delivery, and assessment.",
    linkedDepartments: ["HR", "Operations", "QA/QC"],
  },
  {
    id: "SOP-013",
    title: "Wellness Program Administration",
    code: "HLT-SOP-001",
    department: "Health",
    departmentPath: "/dept/health",
    category: "Health & Wellness",
    version: "1.1",
    lastUpdated: "Nov 15, 2025",
    status: "Draft",
    description: "Standard procedure for administering employee wellness programs including enrollment, tracking, and reporting.",
    linkedDepartments: ["HR", "Finance", "Operations"],
  },
  {
    id: "SOP-014",
    title: "Business Entity Formation",
    code: "BUS-SOP-001",
    department: "Business",
    departmentPath: "/dept/business",
    category: "Business Operations",
    version: "1.9",
    lastUpdated: "Nov 10, 2025",
    status: "Active",
    description: "Procedure for forming new business entities including legal structure selection, registration, and compliance setup.",
    linkedDepartments: ["Legal", "Finance", "Operations"],
  },
];

const categories = [
  "All Categories",
  "Human Resources",
  "Financial Operations",
  "Procurement",
  "Legal & Compliance",
  "Quality Assurance",
  "Information Technology",
  "Project Management",
  "Real Estate",
  "Asset Management",
  "Media & Communications",
  "Design & Branding",
  "Education & Training",
  "Health & Wellness",
  "Business Operations",
];

const departments = [
  "All Departments",
  "Business",
  "Health",
  "Education",
  "Design",
  "Media",
  "Finance",
  "HR",
  "Operations",
  "Procurement",
  "Contracts",
  "Purchasing",
  "Property",
  "Real Estate",
  "Project Controls",
  "QA/QC",
  "Legal",
  "IT",
  "Platform Admin",
];

export default function Procedures() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredProcedures = mockProcedures.filter((proc) => {
    const matchesSearch =
      proc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" || proc.category === selectedCategory;
    const matchesDepartment =
      selectedDepartment === "All Departments" || proc.department === selectedDepartment;
    const matchesStatus =
      selectedStatus === "all" || proc.status.toLowerCase().replace(" ", "-") === selectedStatus;
    return matchesSearch && matchesCategory && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Draft":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    total: mockProcedures.length,
    active: mockProcedures.filter((p) => p.status === "Active").length,
    underReview: mockProcedures.filter((p) => p.status === "Under Review").length,
    draft: mockProcedures.filter((p) => p.status === "Draft").length,
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-serif">
              Standard Operating Procedures
            </h1>
            <p className="text-muted-foreground mt-1">
              Centralized repository of all organizational procedures with cross-department linking
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export All
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              New Procedure
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Procedures</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.underReview}</p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setSelectedStatus("all")}>
              All Procedures
            </TabsTrigger>
            <TabsTrigger value="active" onClick={() => setSelectedStatus("active")}>
              Active
            </TabsTrigger>
            <TabsTrigger value="under-review" onClick={() => setSelectedStatus("under-review")}>
              Under Review
            </TabsTrigger>
            <TabsTrigger value="draft" onClick={() => setSelectedStatus("draft")}>
              Drafts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search procedures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Procedures List */}
            <div className="space-y-4">
              {filteredProcedures.map((procedure) => {
                const DeptIcon = departmentIcons[procedure.department] || FileText;
                return (
                  <Card key={procedure.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                          <DeptIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{procedure.title}</h3>
                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                              {procedure.code}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                procedure.status
                              )}`}
                            >
                              {procedure.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {procedure.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Updated {procedure.lastUpdated}
                            </span>
                            <span>Version {procedure.version}</span>
                            <button
                              onClick={() => setLocation(procedure.departmentPath)}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <Link2 className="w-3 h-3" />
                              {procedure.department} Dept
                            </button>
                          </div>
                          {/* Linked Departments */}
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="text-xs text-muted-foreground">Also applies to:</span>
                            {procedure.linkedDepartments.map((dept) => {
                              const LinkedIcon = departmentIcons[dept] || FileText;
                              const path = departmentPaths[dept];
                              return (
                                <button
                                  key={dept}
                                  onClick={() => path && setLocation(path)}
                                  className="flex items-center gap-1 text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded transition-colors"
                                >
                                  <LinkedIcon className="w-3 h-3" />
                                  {dept}
                                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 lg:flex-shrink-0">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {filteredProcedures.length === 0 && (
                <Card className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 font-semibold text-foreground">No procedures found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="space-y-4">
              {filteredProcedures.map((procedure) => {
                const DeptIcon = departmentIcons[procedure.department] || FileText;
                return (
                  <Card key={procedure.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                          <DeptIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{procedure.title}</h3>
                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                              {procedure.code}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                procedure.status
                              )}`}
                            >
                              {procedure.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {procedure.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Updated {procedure.lastUpdated}
                            </span>
                            <span>Version {procedure.version}</span>
                            <button
                              onClick={() => setLocation(procedure.departmentPath)}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <Link2 className="w-3 h-3" />
                              {procedure.department} Dept
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="text-xs text-muted-foreground">Also applies to:</span>
                            {procedure.linkedDepartments.map((dept) => {
                              const LinkedIcon = departmentIcons[dept] || FileText;
                              const path = departmentPaths[dept];
                              return (
                                <button
                                  key={dept}
                                  onClick={() => path && setLocation(path)}
                                  className="flex items-center gap-1 text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded transition-colors"
                                >
                                  <LinkedIcon className="w-3 h-3" />
                                  {dept}
                                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 lg:flex-shrink-0">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="under-review" className="mt-6">
            <div className="space-y-4">
              {filteredProcedures.map((procedure) => {
                const DeptIcon = departmentIcons[procedure.department] || FileText;
                return (
                  <Card key={procedure.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                          <DeptIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{procedure.title}</h3>
                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                              {procedure.code}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                procedure.status
                              )}`}
                            >
                              {procedure.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {procedure.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 lg:flex-shrink-0">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="draft" className="mt-6">
            <div className="space-y-4">
              {filteredProcedures.map((procedure) => {
                const DeptIcon = departmentIcons[procedure.department] || FileText;
                return (
                  <Card key={procedure.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                          <DeptIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{procedure.title}</h3>
                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                              {procedure.code}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                procedure.status
                              )}`}
                            >
                              {procedure.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {procedure.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 lg:flex-shrink-0">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
