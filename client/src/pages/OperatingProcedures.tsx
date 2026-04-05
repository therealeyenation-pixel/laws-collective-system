import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProcedureAcknowledgment from "@/components/ProcedureAcknowledgment";
import AcknowledgmentDashboard from "@/components/AcknowledgmentDashboard";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText,
  BookOpen,
  Shield,
  GraduationCap,
  ClipboardList,
  FileCheck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
  BarChart3,
  Building2,
} from "lucide-react";

const CATEGORIES = [
  { value: "sop", label: "Standard Operating Procedure", icon: FileText },
  { value: "manual", label: "Instruction Manual", icon: BookOpen },
  { value: "policy", label: "Policy Document", icon: Shield },
  { value: "guide", label: "How-To Guide", icon: GraduationCap },
  { value: "training", label: "Training Material", icon: GraduationCap },
  { value: "checklist", label: "Process Checklist", icon: ClipboardList },
  { value: "template", label: "Document Template", icon: FileText },
  { value: "form", label: "Required Form", icon: FileCheck },
] as const;

const DEPARTMENTS = [
  "Executive",
  "Finance",
  "HR",
  "Operations",
  "Legal",
  "Technology",
  "Education",
  "Media",
  "Design",
  "Health",
  "Purchasing",
  "Real Estate",
  "Property",
  "Contracts",
  "QA/QC",
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800",
  superseded: "bg-purple-100 text-purple-800",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  draft: <Clock className="w-3 h-3" />,
  review: <AlertCircle className="w-3 h-3" />,
  approved: <CheckCircle className="w-3 h-3" />,
  archived: <Archive className="w-3 h-3" />,
  superseded: <Archive className="w-3 h-3" />,
};

export default function OperatingProcedures() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAcknowledgeOpen, setIsAcknowledgeOpen] = useState(false);
  const [procedureToAcknowledge, setProcedureToAcknowledge] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    documentNumber: "",
    category: "sop" as const,
    department: "",
    content: "",
    tags: [] as string[],
  });

  const { data: procedures, refetch } = trpc.procedures.list.useQuery({
    category: categoryFilter !== "all" ? categoryFilter as any : undefined,
    department: departmentFilter !== "all" ? departmentFilter : undefined,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    search: searchTerm || undefined,
  });

  const { data: stats } = trpc.procedures.getStats.useQuery();
  const { data: pendingAcknowledgments } = trpc.procedures.getPendingAcknowledgments.useQuery();

  const createMutation = trpc.procedures.create.useMutation({
    onSuccess: () => {
      toast.success("Procedure created successfully");
      setIsCreateOpen(false);
      setFormData({
        title: "",
        description: "",
        documentNumber: "",
        category: "sop",
        department: "",
        content: "",
        tags: [],
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const approveMutation = trpc.procedures.approve.useMutation({
    onSuccess: () => {
      toast.success("Procedure approved");
      refetch();
    },
  });

  const deleteMutation = trpc.procedures.delete.useMutation({
    onSuccess: () => {
      toast.success("Procedure deleted");
      refetch();
    },
  });

  const acknowledgeMutation = trpc.procedures.acknowledge.useMutation({
    onSuccess: () => {
      toast.success("Procedure acknowledged successfully");
      setIsAcknowledgeOpen(false);
      setProcedureToAcknowledge(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleOpenAcknowledge = (procedure: any) => {
    setProcedureToAcknowledge(procedure);
    setIsAcknowledgeOpen(true);
  };

  const handleCreate = () => {
    if (!formData.title || !formData.category) {
      toast.error("Title and category are required");
      return;
    }
    createMutation.mutate(formData);
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? <cat.icon className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Operating Procedures</h1>
            <p className="text-muted-foreground">
              SOPs, manuals, policies, and training materials
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Procedure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Procedure</DialogTitle>
                <DialogDescription>
                  Add a new operating procedure, manual, or policy document
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter procedure title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Document Number</Label>
                    <Input
                      value={formData.documentNumber}
                      onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                      placeholder="e.g., SOP-HR-001"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="w-4 h-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the procedure"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content (Markdown supported)</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter the full procedure content..."
                    rows={10}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Procedure"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats?.approved || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold">{stats?.draft || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Review</p>
                <p className="text-2xl font-bold">{stats?.review || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Acknowledgment</p>
                <p className="text-2xl font-bold">{pendingAcknowledgments?.length || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search procedures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Procedures List */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Procedures</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Acknowledgment
              {pendingAcknowledgments && pendingAcknowledgments.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingAcknowledgments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="compliance">Compliance Dashboard</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-3">
              {procedures?.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Procedures Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || categoryFilter !== "all" || departmentFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Get started by creating your first operating procedure"}
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Procedure
                  </Button>
                </Card>
              ) : (
                procedures?.map((procedure) => (
                  <Card key={procedure.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getCategoryIcon(procedure.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{procedure.title}</h3>
                            {procedure.documentNumber && (
                              <Badge variant="outline">{procedure.documentNumber}</Badge>
                            )}
                            <Badge className={STATUS_COLORS[procedure.status]}>
                              <span className="flex items-center gap-1">
                                {STATUS_ICONS[procedure.status]}
                                {procedure.status}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {procedure.description || "No description provided"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {CATEGORIES.find(c => c.value === procedure.category)?.label}
                            </span>
                            {procedure.department && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {procedure.department}
                              </span>
                            )}
                            <span>Version {procedure.version}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProcedure(procedure);
                            setIsViewOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {procedure.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => approveMutation.mutate({ id: procedure.id })}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this procedure?")) {
                              deleteMutation.mutate({ id: procedure.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <div className="space-y-3">
              {pendingAcknowledgments?.length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    You have acknowledged all required procedures
                  </p>
                </Card>
              ) : (
                pendingAcknowledgments?.map((procedure) => (
                  <Card key={procedure.id} className="p-4 border-l-4 border-l-orange-500">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          {getCategoryIcon(procedure.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{procedure.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {procedure.description || "No description provided"}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            Requires your acknowledgment
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleOpenAcknowledge(procedure)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Review & Acknowledge
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  By Category
                </h3>
                <div className="space-y-3">
                  {stats?.byCategory?.map((item: any) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                      </span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  By Department
                </h3>
                <div className="space-y-3">
                  {stats?.byDepartment?.map((item: any) => (
                    <div key={item.department} className="flex items-center justify-between">
                      <span>{item.department}</span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                  {stats?.byDepartment?.length === 0 && (
                    <p className="text-muted-foreground text-sm">No department data available</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="mt-4">
            <AcknowledgmentDashboard />
          </TabsContent>
        </Tabs>

        {/* View Procedure Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedProcedure && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(selectedProcedure.category)}
                    <DialogTitle>{selectedProcedure.title}</DialogTitle>
                  </div>
                  <DialogDescription>
                    {selectedProcedure.documentNumber && (
                      <Badge variant="outline" className="mr-2">
                        {selectedProcedure.documentNumber}
                      </Badge>
                    )}
                    Version {selectedProcedure.version} •{" "}
                    {CATEGORIES.find(c => c.value === selectedProcedure.category)?.label}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-4">
                    <Badge className={STATUS_COLORS[selectedProcedure.status]}>
                      {STATUS_ICONS[selectedProcedure.status]}
                      <span className="ml-1">{selectedProcedure.status}</span>
                    </Badge>
                    {selectedProcedure.department && (
                      <Badge variant="outline">
                        <Building2 className="w-3 h-3 mr-1" />
                        {selectedProcedure.department}
                      </Badge>
                    )}
                  </div>
                  {selectedProcedure.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-muted-foreground">{selectedProcedure.description}</p>
                    </div>
                  )}
                  {selectedProcedure.content && (
                    <div>
                      <h4 className="font-semibold mb-2">Content</h4>
                      <div className="prose prose-sm max-w-none bg-muted/50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                          {selectedProcedure.content}
                        </pre>
                      </div>
                    </div>
                  )}
                  {selectedProcedure.status === "approved" && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setIsViewOpen(false);
                          handleOpenAcknowledge(selectedProcedure);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Review & Acknowledge
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Procedure Acknowledgment Dialog */}
        {procedureToAcknowledge && (
          <ProcedureAcknowledgment
            procedure={procedureToAcknowledge}
            isOpen={isAcknowledgeOpen}
            onClose={() => {
              setIsAcknowledgeOpen(false);
              setProcedureToAcknowledge(null);
            }}
            onAcknowledge={(data) => acknowledgeMutation.mutate(data)}
            isPending={acknowledgeMutation.isPending}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
