import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FolderOpen,
  File,
  FileImage,
  FileSpreadsheet,
  FileVideo,
  Plus,
  Clock,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: number;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "draft" | "review" | "approved" | "archived";
}

interface DepartmentDocumentsProps {
  departmentName: string;
  departmentId: string;
  documents?: Document[];
  categories?: string[];
}

// Mock documents for demonstration
const mockDocuments: Document[] = [
  {
    id: 1,
    name: "Q1 2026 Report.pdf",
    type: "pdf",
    category: "Reports",
    size: "2.4 MB",
    uploadedBy: "John Smith",
    uploadedAt: "2026-01-15",
    status: "approved",
  },
  {
    id: 2,
    name: "Operating Procedures.docx",
    type: "docx",
    category: "Procedures",
    size: "156 KB",
    uploadedBy: "Jane Doe",
    uploadedAt: "2026-01-10",
    status: "review",
  },
  {
    id: 3,
    name: "Budget Spreadsheet.xlsx",
    type: "xlsx",
    category: "Financial",
    size: "890 KB",
    uploadedBy: "Bob Johnson",
    uploadedAt: "2026-01-08",
    status: "draft",
  },
  {
    id: 4,
    name: "Team Photo.jpg",
    type: "jpg",
    category: "Media",
    size: "3.2 MB",
    uploadedBy: "Alice Brown",
    uploadedAt: "2026-01-05",
    status: "approved",
  },
  {
    id: 5,
    name: "Training Video.mp4",
    type: "mp4",
    category: "Training",
    size: "45.6 MB",
    uploadedBy: "Charlie Wilson",
    uploadedAt: "2026-01-03",
    status: "approved",
  },
];

const defaultCategories = [
  "Reports",
  "Procedures",
  "Financial",
  "Training",
  "Templates",
  "Media",
  "Contracts",
  "Policies",
];

export function DepartmentDocuments({
  departmentName,
  departmentId,
  documents = mockDocuments,
  categories = defaultCategories,
}: DepartmentDocumentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getFileIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      pdf: <FileText className="w-5 h-5 text-red-500" />,
      docx: <FileText className="w-5 h-5 text-blue-500" />,
      doc: <FileText className="w-5 h-5 text-blue-500" />,
      xlsx: <FileSpreadsheet className="w-5 h-5 text-green-500" />,
      xls: <FileSpreadsheet className="w-5 h-5 text-green-500" />,
      jpg: <FileImage className="w-5 h-5 text-purple-500" />,
      jpeg: <FileImage className="w-5 h-5 text-purple-500" />,
      png: <FileImage className="w-5 h-5 text-purple-500" />,
      mp4: <FileVideo className="w-5 h-5 text-orange-500" />,
      mov: <FileVideo className="w-5 h-5 text-orange-500" />,
    };
    return icons[type.toLowerCase()] || <File className="w-5 h-5 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      review: { variant: "secondary", label: "In Review" },
      approved: { variant: "default", label: "Approved" },
      archived: { variant: "destructive", label: "Archived" },
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      toast.success(`Uploading ${selectedFile.name}...`);
      setIsUploadOpen(false);
      setSelectedFile(null);
    } else {
      toast.error("Please select a file to upload");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              {departmentName} Documents
            </CardTitle>
            <CardDescription>
              Upload, manage, and access department documents
            </CardDescription>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a new document to the {departmentName} repository.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mov"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input id="description" placeholder="Brief description of the document" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No documents found. Upload your first document to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.type)}
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{doc.uploadedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info("Opening document...")}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info("Downloading document...")}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info("Opening editor...")}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => toast.info("Document archived")}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
          <span>{filteredDocuments.length} document(s) found</span>
          <span>
            Total size: {filteredDocuments.reduce((acc, doc) => {
              const size = parseFloat(doc.size);
              return acc + (doc.size.includes("MB") ? size : size / 1024);
            }, 0).toFixed(1)} MB
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default DepartmentDocuments;
