import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  Search,
  Filter,
  FileSpreadsheet,
  FileImage,
  File,
  CheckCircle,
  AlertCircle,
  Clock,
  FolderOpen,
  Loader2,
  ExternalLink,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

interface DocumentLibraryProps {
  entityId: string;
  entityName?: string;
  showChecklist?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  budget: "Budget Documents",
  staffing: "Staffing & Org Chart",
  equipment: "Equipment List",
  letters_of_support: "Letters of Support",
  legal: "Legal Documents",
  financial_statements: "Financial Statements",
  program_narrative: "Program Narrative",
  evaluation_plan: "Evaluation Plan",
  timeline: "Timeline & Milestones",
  certificates: "Certificates & Licenses",
  other: "Other Documents",
};

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <File className="w-5 h-5 text-gray-500" />;
  if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) 
    return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  if (mimeType.includes("image")) return <FileImage className="w-5 h-5 text-blue-500" />;
  if (mimeType.includes("word") || mimeType.includes("document")) 
    return <FileText className="w-5 h-5 text-blue-600" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return "—";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function DocumentLibrary({ 
  entityId, 
  entityName,
  showChecklist = true 
}: DocumentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: documents, isLoading: docsLoading } = trpc.grantDocuments.getEntityDocuments.useQuery({
    entityId,
    category: categoryFilter !== "all" ? categoryFilter as any : undefined,
  });

  const { data: checklist, isLoading: checklistLoading } = trpc.grantDocuments.getDocumentChecklist.useQuery({
    entityId,
  });

  const deleteMutation = trpc.grantDocuments.deleteDocument.useMutation();
  const utils = trpc.useUtils();

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      await deleteMutation.mutateAsync({ documentId: documentToDelete });
      toast.success("Document deleted successfully");
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      utils.grantDocuments.getEntityDocuments.invalidate();
      utils.grantDocuments.getDocumentChecklist.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document");
    }
  };

  const handleDownload = (fileUrl: string | null, fileName: string | null) => {
    if (!fileUrl) {
      toast.error("File URL not available");
      return;
    }
    
    // Open in new tab for download
    window.open(fileUrl, "_blank");
  };

  const handlePreview = (fileUrl: string | null) => {
    if (!fileUrl) {
      toast.error("Preview not available");
      return;
    }
    setPreviewUrl(fileUrl);
  };

  const filteredDocuments = documents?.filter(doc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(query) ||
      doc.fileName?.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query)
    );
  }) || [];

  const isLoading = docsLoading || checklistLoading;

  return (
    <div className="space-y-6">
      {/* Document Checklist */}
      {showChecklist && checklist && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Document Readiness
                </CardTitle>
                <CardDescription>
                  {checklist.entityName} - Grant Application Documents
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {checklist.completionRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {checklist.completedCount} of {checklist.requiredCount} required
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {checklist.checklist.map((item) => (
                <div
                  key={item.category}
                  className={`
                    p-3 rounded-lg border transition-colors
                    ${item.uploaded 
                      ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                      : item.required 
                        ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                        : "bg-muted/50 border-border"
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.uploaded ? (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : item.required ? (
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </div>
                      {item.documentCount > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.documentCount} file{item.documentCount > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                    {item.required && !item.uploaded && (
                      <Badge variant="destructive" className="text-xs ml-2">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Library */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Document Library
              </CardTitle>
              <CardDescription>
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""} uploaded
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-muted-foreground">
                {searchQuery || categoryFilter !== "all" 
                  ? "Try adjusting your search or filter"
                  : "Upload your first document to get started"
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const metadata = doc.metadata as any;
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.mimeType)}
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {doc.fileName || doc.title}
                              </div>
                              {doc.description && (
                                <div className="text-sm text-muted-foreground truncate">
                                  {doc.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CATEGORY_LABELS[metadata?.category] || metadata?.category || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatFileSize(doc.fileSize)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.createdAt 
                            ? format(new Date(doc.createdAt), "MMM d, yyyy")
                            : "—"
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePreview(doc.fileUrl)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(doc.fileUrl, doc.fileName)}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setDocumentToDelete(doc.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[70vh]">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-full border rounded-md"
                title="Document Preview"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewUrl(null)}>
              Close
            </Button>
            <Button onClick={() => previewUrl && window.open(previewUrl, "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DocumentLibrary;
