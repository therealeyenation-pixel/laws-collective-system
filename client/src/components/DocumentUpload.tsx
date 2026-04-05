import { useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  File,
  FileSpreadsheet,
  FileImage,
  CloudUpload,
} from "lucide-react";

interface DocumentUploadProps {
  entityId: string;
  entityName?: string;
  onUploadComplete?: (documentId: number) => void;
  defaultCategory?: string;
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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  budget: <FileSpreadsheet className="w-4 h-4" />,
  staffing: <FileText className="w-4 h-4" />,
  equipment: <FileText className="w-4 h-4" />,
  letters_of_support: <FileText className="w-4 h-4" />,
  legal: <FileText className="w-4 h-4" />,
  financial_statements: <FileSpreadsheet className="w-4 h-4" />,
  program_narrative: <FileText className="w-4 h-4" />,
  evaluation_plan: <FileText className="w-4 h-4" />,
  timeline: <FileText className="w-4 h-4" />,
  certificates: <FileImage className="w-4 h-4" />,
  other: <File className="w-4 h-4" />,
};

function getFileIcon(mimeType: string) {
  if (mimeType.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) 
    return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
  if (mimeType.includes("image")) return <FileImage className="w-8 h-8 text-blue-500" />;
  if (mimeType.includes("word") || mimeType.includes("document")) 
    return <FileText className="w-8 h-8 text-blue-600" />;
  return <File className="w-8 h-8 text-gray-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function DocumentUpload({ 
  entityId, 
  entityName,
  onUploadComplete,
  defaultCategory 
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>(defaultCategory || "");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData } = trpc.grantDocuments.getCategories.useQuery();
  const uploadMutation = trpc.grantDocuments.uploadDocument.useMutation();
  const utils = trpc.useUtils();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !category) {
      toast.error("Please select a file and category");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Read file as base64
      const reader = new FileReader();
      
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      setUploadProgress(40);

      // Upload to server
      const result = await uploadMutation.mutateAsync({
        entityId,
        category: category as any,
        fileName: selectedFile.name,
        fileData,
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
        description: description || undefined,
      });

      setUploadProgress(100);

      toast.success("Document uploaded successfully!");
      
      // Reset form
      setSelectedFile(null);
      setCategory(defaultCategory || "");
      setDescription("");
      setUploadProgress(0);
      
      // Invalidate queries to refresh document lists
      utils.grantDocuments.getEntityDocuments.invalidate();
      utils.grantDocuments.getAllDocuments.invalidate();
      utils.grantDocuments.getDocumentChecklist.invalidate();

      if (onUploadComplete && result.documentId) {
        onUploadComplete(result.documentId);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload document");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const requirements = categoriesData?.requirements || {};
  const currentRequirement = category ? requirements[category] : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudUpload className="w-5 h-5" />
          Upload Document
        </CardTitle>
        {entityName && (
          <CardDescription>
            Upload documents for {entityName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Document Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select document category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {CATEGORY_ICONS[key]}
                    <span>{label}</span>
                    {requirements[key]?.required && (
                      <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentRequirement && (
            <p className="text-sm text-muted-foreground">
              {currentRequirement.description}
              <br />
              <span className="text-xs">
                Allowed formats: {currentRequirement.formats.join(", ")} | 
                Max size: {currentRequirement.maxSize}MB
              </span>
            </p>
          )}
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-muted/50"
            }
            ${selectedFile ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          />
          
          {selectedFile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                {getFileIcon(selectedFile.type)}
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported: PDF, Word, Excel, Images (up to 20MB)
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add a description for this document..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Button */}
        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={!selectedFile || !category || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default DocumentUpload;
