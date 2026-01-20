import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Filter,
  Building2,
  FolderOpen,
  Upload,
  Eye,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const DEPARTMENTS = [
  "All Departments",
  "Executive",
  "Finance",
  "HR",
  "IT",
  "Legal",
  "Operations",
  "Procurement",
  "Purchasing",
  "Academy",
  "Business",
  "Design",
  "Media",
  "Health",
  "Foundation",
  "Education",
  "Property",
  "Community",
];

const CATEGORIES = [
  { value: "sop", label: "Standard Operating Procedure" },
  { value: "manual", label: "Manual" },
  { value: "policy", label: "Policy" },
  { value: "guide", label: "Guide" },
  { value: "training", label: "Training Material" },
  { value: "checklist", label: "Checklist" },
  { value: "template", label: "Template" },
  { value: "form", label: "Form" },
];

const STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-500" },
  { value: "review", label: "Under Review", color: "bg-amber-500" },
  { value: "approved", label: "Approved", color: "bg-green-500" },
  { value: "archived", label: "Archived", color: "bg-slate-500" },
  { value: "superseded", label: "Superseded", color: "bg-red-500" },
];

interface ProcedureFormData {
  title: string;
  description: string;
  documentNumber: string;
  category: string;
  department: string;
  content: string;
  fileUrl: string;
  version: string;
  status: string;
}

const initialFormData: ProcedureFormData = {
  title: "",
  description: "",
  documentNumber: "",
  category: "sop",
  department: "",
  content: "",
  fileUrl: "",
  version: "1.0",
  status: "draft",
};

export default function DocumentAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [formData, setFormData] = useState<ProcedureFormData>(initialFormData);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportData, setBulkImportData] = useState<string>("");
  const [bulkImportPreview, setBulkImportPreview] = useState<any[]>([]);

  const { data: procedures, isLoading, refetch } = trpc.procedures.list.useQuery({
    department: filterDepartment || undefined,
    category: filterCategory as any || undefined,
    status: filterStatus as any || undefined,
    search: searchQuery || undefined,
  });

  const createMutation = trpc.procedures.create.useMutation({
    onSuccess: () => {
      toast.success("Procedure created successfully");
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to create procedure: " + error.message);
    },
  });

  const updateMutation = trpc.procedures.update.useMutation({
    onSuccess: () => {
      toast.success("Procedure updated successfully");
      setIsEditDialogOpen(false);
      setSelectedProcedure(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to update procedure: " + error.message);
    },
  });

  const deleteMutation = trpc.procedures.delete.useMutation({
    onSuccess: () => {
      toast.success("Procedure deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete procedure: " + error.message);
    },
  });

  const approveMutation = trpc.procedures.approve.useMutation({
    onSuccess: () => {
      toast.success("Procedure approved successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to approve procedure: " + error.message);
    },
  });

  const bulkImportMutation = trpc.procedures.bulkImport.useMutation({
    onSuccess: (result) => {
      toast.success(`Imported ${result.success} procedures successfully${result.failed > 0 ? `, ${result.failed} failed` : ""}`);
      setIsBulkImportOpen(false);
      setBulkImportData("");
      setBulkImportPreview([]);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to import procedures: " + error.message);
    },
  });

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const procedures = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const proc: any = {};
      
      headers.forEach((header, idx) => {
        if (header === "title") proc.title = values[idx];
        else if (header === "description") proc.description = values[idx];
        else if (header === "documentnumber" || header === "document_number") proc.documentNumber = values[idx];
        else if (header === "category") proc.category = values[idx] || "sop";
        else if (header === "department") proc.department = values[idx];
        else if (header === "content") proc.content = values[idx];
        else if (header === "fileurl" || header === "file_url") proc.fileUrl = values[idx];
        else if (header === "version") proc.version = values[idx];
        else if (header === "status") proc.status = values[idx];
      });
      
      if (proc.title) {
        proc.category = proc.category || "sop";
        procedures.push(proc);
      }
    }
    
    return procedures;
  };

  const handleBulkImportPreview = () => {
    const parsed = parseCsvData(bulkImportData);
    setBulkImportPreview(parsed);
  };

  const handleBulkImport = () => {
    if (bulkImportPreview.length === 0) {
      toast.error("No valid procedures to import");
      return;
    }
    bulkImportMutation.mutate({ procedures: bulkImportPreview });  
  };

  const handleCreate = () => {
    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      documentNumber: formData.documentNumber || undefined,
      category: formData.category as any,
      department: formData.department || undefined,
      content: formData.content || undefined,
      fileUrl: formData.fileUrl || undefined,
    });
  };

  const handleUpdate = () => {
    if (!selectedProcedure) return;
    updateMutation.mutate({
      id: selectedProcedure.id,
      title: formData.title,
      description: formData.description || undefined,
      documentNumber: formData.documentNumber || undefined,
      category: formData.category as any,
      department: formData.department || undefined,
      content: formData.content || undefined,
      fileUrl: formData.fileUrl || undefined,
      version: formData.version || undefined,
      status: formData.status as any,
    });
  };

  const handleEdit = (procedure: any) => {
    setSelectedProcedure(procedure);
    setFormData({
      title: procedure.title || "",
      description: procedure.description || "",
      documentNumber: procedure.documentNumber || "",
      category: procedure.category || "sop",
      department: procedure.department || "",
      content: procedure.content || "",
      fileUrl: procedure.fileUrl || "",
      version: procedure.version || "1.0",
      status: procedure.status || "draft",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUSES.find((s) => s.value === status);
    return (
      <Badge className={statusConfig?.color || "bg-gray-500"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const stats = {
    total: procedures?.length || 0,
    approved: procedures?.filter((p) => p.status === "approved").length || 0,
    draft: procedures?.filter((p) => p.status === "draft").length || 0,
    review: procedures?.filter((p) => p.status === "review").length || 0,
  };

  const ProcedureForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter procedure title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="documentNumber">Document Number</Label>
          <Input
            id="documentNumber"
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            placeholder="e.g., SOP-FIN-001"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department (or leave for all)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.filter((d) => d !== "All Departments").map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isEdit && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="e.g., 1.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the procedure"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Full procedure content (supports markdown)"
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fileUrl">File URL (optional)</Label>
        <Input
          id="fileUrl"
          value={formData.fileUrl}
          onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
          placeholder="Link to external document"
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Document Administration</h1>
            <p className="text-muted-foreground">
              Manage procedures, policies, and documents across all departments
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Procedure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Procedure</DialogTitle>
                <DialogDescription>
                  Add a new procedure, policy, or document to the system.
                </DialogDescription>
              </DialogHeader>
              <ProcedureForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.title || createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Procedure"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Import Procedures</DialogTitle>
                <DialogDescription>
                  Import multiple procedures from CSV format. Required columns: title, category. Optional: description, documentNumber, department, content, fileUrl, version, status.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>CSV Data</Label>
                  <Textarea
                    placeholder={"title,category,department,description\nEmployee Handbook,policy,HR,Complete employee handbook\nIT Security Policy,policy,IT,Security guidelines"}
                    value={bulkImportData}
                    onChange={(e) => setBulkImportData(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                <Button variant="outline" onClick={handleBulkImportPreview} className="gap-2">
                  <Eye className="w-4 h-4" />
                  Preview Import
                </Button>
                {bulkImportPreview.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <p className="font-medium mb-2">{bulkImportPreview.length} procedures to import:</p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {bulkImportPreview.map((proc, idx) => (
                        <div key={idx} className="text-sm flex justify-between">
                          <span>{proc.title}</span>
                          <Badge variant="outline">{proc.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkImportOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkImport} disabled={bulkImportPreview.length === 0 || bulkImportMutation.isPending}>
                  {bulkImportMutation.isPending ? "Importing..." : `Import ${bulkImportPreview.length} Procedures`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.review}</p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
                <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search procedures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_filter">All Departments</SelectItem>
                {DEPARTMENTS.filter((d) => d !== "All Departments").map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <FolderOpen className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_filter">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_filter">All Statuses</SelectItem>
                {STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterDepartment("");
                setFilterCategory("");
                setFilterStatus("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Procedures</CardTitle>
            <CardDescription>
              {procedures?.length || 0} procedures found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading procedures...</p>
              </div>
            ) : procedures && procedures.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procedures.map((procedure) => (
                      <TableRow key={procedure.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{procedure.title}</p>
                            {procedure.documentNumber && (
                              <p className="text-xs text-muted-foreground">
                                {procedure.documentNumber}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCategoryLabel(procedure.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {procedure.department || "All Departments"}
                        </TableCell>
                        <TableCell>{procedure.version || "1.0"}</TableCell>
                        <TableCell>{getStatusBadge(procedure.status)}</TableCell>
                        <TableCell>
                          {procedure.updatedAt
                            ? new Date(procedure.updatedAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {procedure.status !== "approved" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(procedure.id)}
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(procedure)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" title="Delete">
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Procedure</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{procedure.title}"? This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(procedure.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No procedures found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click "Add Procedure" to create your first document
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Procedure</DialogTitle>
              <DialogDescription>
                Update the procedure details below.
              </DialogDescription>
            </DialogHeader>
            <ProcedureForm isEdit />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={!formData.title || updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
