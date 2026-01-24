import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  Table2,
  Presentation,
  FileType,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Trash2,
  Edit,
  Eye,
  Clock,
  Users,
  PenTool,
  FileSignature,
  Merge,
  Scissors,
  FileCheck,
  FolderOpen,
  LayoutTemplate,
  Star,
  MoreVertical,
  FileSpreadsheet,
  FilePlus,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OfficeSuite() {
  const [activeTab, setActiveTab] = useState("documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showNewDocDialog, setShowNewDocDialog] = useState(false);
  const [newDocType, setNewDocType] = useState<string>("document");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocDescription, setNewDocDescription] = useState("");

  // Fetch documents
  const { data: documents, isLoading: loadingDocs, refetch: refetchDocs } = trpc.officeSuite.getDocuments.useQuery({
    documentType: filterType !== "all" ? filterType : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    search: searchQuery || undefined,
  });

  // Fetch templates
  const { data: templates, isLoading: loadingTemplates } = trpc.officeSuite.getTemplates.useQuery({});

  // Fetch stats
  const { data: stats } = trpc.officeSuite.getStats.useQuery();

  // Create document mutation
  const createDocMutation = trpc.officeSuite.createDocument.useMutation({
    onSuccess: () => {
      toast.success("Document created successfully");
      setShowNewDocDialog(false);
      setNewDocTitle("");
      setNewDocDescription("");
      refetchDocs();
    },
    onError: (error) => {
      toast.error(`Failed to create document: ${error.message}`);
    },
  });

  // Delete document mutation
  const deleteDocMutation = trpc.officeSuite.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("Document deleted");
      refetchDocs();
    },
  });

  const handleCreateDocument = () => {
    if (!newDocTitle.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    createDocMutation.mutate({
      title: newDocTitle,
      description: newDocDescription,
      documentType: newDocType as any,
    });
  };

  const getDocTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "spreadsheet":
        return <Table2 className="h-5 w-5 text-green-500" />;
      case "presentation":
        return <Presentation className="h-5 w-5 text-orange-500" />;
      case "pdf":
        return <FileType className="h-5 w-5 text-red-500" />;
      case "form":
        return <FileCheck className="h-5 w-5 text-purple-500" />;
      case "contract":
        return <FileSignature className="h-5 w-5 text-indigo-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: "Draft" },
      in_review: { variant: "outline", label: "In Review" },
      pending_signature: { variant: "default", label: "Pending Signature" },
      signed: { variant: "default", label: "Signed" },
      final: { variant: "default", label: "Final" },
      archived: { variant: "secondary", label: "Archived" },
    };
    const config = variants[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Office Suite</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage documents, spreadsheets, and presentations
            </p>
          </div>
          <Dialog open={showNewDocDialog} onOpenChange={setShowNewDocDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>
                  Choose a document type and enter the details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={newDocType} onValueChange={setNewDocType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          Document
                        </div>
                      </SelectItem>
                      <SelectItem value="spreadsheet">
                        <div className="flex items-center gap-2">
                          <Table2 className="h-4 w-4 text-green-500" />
                          Spreadsheet
                        </div>
                      </SelectItem>
                      <SelectItem value="presentation">
                        <div className="flex items-center gap-2">
                          <Presentation className="h-4 w-4 text-orange-500" />
                          Presentation
                        </div>
                      </SelectItem>
                      <SelectItem value="form">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-purple-500" />
                          Form
                        </div>
                      </SelectItem>
                      <SelectItem value="contract">
                        <div className="flex items-center gap-2">
                          <FileSignature className="h-4 w-4 text-indigo-500" />
                          Contract
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Enter document title"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Enter document description"
                    value={newDocDescription}
                    onChange={(e) => setNewDocDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewDocDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDocument} disabled={createDocMutation.isPending}>
                  {createDocMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Total Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Edit className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.drafts ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <PenTool className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pendingSignature ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Pending Signature</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FileSignature className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.signed ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Signed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FileCheck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.final ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Final</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="templates">
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="signatures">
              <PenTool className="h-4 w-4 mr-2" />
              Signatures
            </TabsTrigger>
            <TabsTrigger value="pdf-tools">
              <FileType className="h-4 w-4 mr-2" />
              PDF Tools
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
                  <SelectItem value="presentation">Presentations</SelectItem>
                  <SelectItem value="pdf">PDFs</SelectItem>
                  <SelectItem value="form">Forms</SelectItem>
                  <SelectItem value="contract">Contracts</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="pending_signature">Pending Signature</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetchDocs()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Documents List */}
            {loadingDocs ? (
              <div className="text-center py-8 text-muted-foreground">Loading documents...</div>
            ) : documents && documents.length > 0 ? (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Modified</th>
                      <th className="text-left p-3 font-medium">Size</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {getDocTypeIcon(doc.documentType)}
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              {doc.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                                  {doc.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 capitalize">{doc.documentType}</td>
                        <td className="p-3">{getStatusBadge(doc.status)}</td>
                        <td className="p-3 text-muted-foreground text-sm">
                          {formatDate(doc.updatedAt)}
                        </td>
                        <td className="p-3 text-muted-foreground text-sm">
                          {formatFileSize(doc.fileSize)}
                        </td>
                        <td className="p-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <PenTool className="h-4 w-4 mr-2" />
                                Request Signature
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteDocMutation.mutate({ id: doc.id })}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first document to get started
                  </p>
                  <Button onClick={() => setShowNewDocDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Document
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Document Templates</h2>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            {loadingTemplates ? (
              <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
            ) : templates && templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        {getDocTypeIcon(template.documentType)}
                        <Badge variant="secondary">{template.category || "General"}</Badge>
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Used {template.usageCount} times</span>
                        <Button size="sm">Use Template</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create reusable templates for common document types
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pre-built Templates */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Pre-built Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Business Letter", type: "document", icon: FileText },
                  { name: "Invoice", type: "spreadsheet", icon: FileSpreadsheet },
                  { name: "Meeting Agenda", type: "document", icon: FileText },
                  { name: "Project Proposal", type: "presentation", icon: Presentation },
                  { name: "Employment Contract", type: "contract", icon: FileSignature },
                  { name: "NDA Agreement", type: "contract", icon: FileSignature },
                  { name: "Budget Tracker", type: "spreadsheet", icon: Table2 },
                  { name: "Expense Report", type: "form", icon: FileCheck },
                ].map((template, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <template.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{template.type}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Signatures Tab */}
          <TabsContent value="signatures" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Electronic Signatures</h2>
              <Button>
                <PenTool className="h-4 w-4 mr-2" />
                Request Signature
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.pendingSignature ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Awaiting signatures</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-green-500" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.signed ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Fully signed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Sent for Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Out for review</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Signature Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <PenTool className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No signature requests yet</p>
                  <p className="text-sm">Request signatures on documents to track them here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PDF Tools Tab */}
          <TabsContent value="pdf-tools" className="space-y-4">
            <h2 className="text-xl font-semibold">PDF Tools</h2>
            <p className="text-muted-foreground">
              Merge, split, compress, and convert PDF files
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Merge className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Merge PDFs</h3>
                  <p className="text-sm text-muted-foreground">
                    Combine multiple PDF files into one
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Scissors className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Split PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Extract pages or split into multiple files
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <PenTool className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Sign PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Add electronic signatures to PDFs
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileCheck className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Fill Forms</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill out PDF forms electronically
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="font-semibold mb-2">PDF to Word</h3>
                  <p className="text-sm text-muted-foreground">
                    Convert PDF to editable Word document
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="p-4 bg-teal-100 dark:bg-teal-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Table2 className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="font-semibold mb-2">PDF to Excel</h3>
                  <p className="text-sm text-muted-foreground">
                    Extract tables from PDF to spreadsheet
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FilePlus className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Create PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Convert documents to PDF format
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="p-4 bg-gray-100 dark:bg-gray-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Download className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Compress PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Reduce PDF file size
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
