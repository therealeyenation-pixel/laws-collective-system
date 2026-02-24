import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
  Link2,
  Building2,
  Home,
  Loader2,
  X,
  Eye,
} from "lucide-react";

type DocumentCategory = "trust" | "business" | "personal" | "legal" | "financial";

interface UploadingFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

export default function DocumentUpload() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>("trust");
  const [selectedDocType, setSelectedDocType] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [selectedHouseId, setSelectedHouseId] = useState<number | undefined>();
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: documentTypes } = trpc.documentUpload.getDocumentTypes.useQuery();
  const { data: uploadedDocs, refetch: refetchDocs } = trpc.documentUpload.getUploadedDocuments.useQuery({
    category: activeTab === "trust" ? "trust" : activeTab === "business" ? "business" : "all",
  });
  const { data: ownerHouse } = trpc.ownerHouseSetup.getOwnerHouse.useQuery();
  const { data: trustChecklist, refetch: refetchTrustChecklist } = trpc.documentUpload.getTrustDocumentChecklist.useQuery(
    { houseId: ownerHouse?.house?.id || 0 },
    { enabled: !!ownerHouse?.house?.id }
  );

  // Mutations
  const uploadMutation = trpc.documentUpload.uploadDocument.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchDocs();
      refetchTrustChecklist();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.documentUpload.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("Document deleted");
      refetchDocs();
      refetchTrustChecklist();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const linkBusinessMutation = trpc.documentUpload.linkBusinessToHouse.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setDocumentTitle("");
    setDocumentDescription("");
    setSelectedDocType("");
    setUploadingFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadingFile[] = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }));

    setUploadingFiles((prev) => [...prev, ...newFiles]);

    // Auto-fill title from first file name
    if (newFiles.length > 0 && !documentTitle) {
      const fileName = newFiles[0].file.name.replace(/\.[^/.]+$/, "");
      setDocumentTitle(fileName.replace(/[_-]/g, " "));
    }
  }, [documentTitle]);

  const handleUpload = async () => {
    if (uploadingFiles.length === 0) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!documentTitle) {
      toast.error("Please enter a document title");
      return;
    }

    if (!selectedDocType) {
      toast.error("Please select a document type");
      return;
    }

    for (let i = 0; i < uploadingFiles.length; i++) {
      const uploadFile = uploadingFiles[i];
      
      setUploadingFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading", progress: 10 } : f
        )
      );

      try {
        // Read file as base64
        const base64Content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(uploadFile.file);
        });

        setUploadingFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, progress: 50 } : f
          )
        );

        await uploadMutation.mutateAsync({
          fileName: uploadFile.file.name,
          mimeType: uploadFile.file.type,
          fileSize: uploadFile.file.size,
          base64Content,
          category: selectedCategory,
          documentType: selectedDocType,
          title: uploadingFiles.length > 1 ? `${documentTitle} (${i + 1})` : documentTitle,
          description: documentDescription || undefined,
          houseId: selectedHouseId || ownerHouse?.house?.id,
          businessEntityId: selectedBusinessId,
        });

        setUploadingFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "complete", progress: 100 } : f
          )
        );
      } catch (error: any) {
        setUploadingFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", error: error.message } : f
          )
        );
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getDocTypeOptions = () => {
    if (!documentTypes) return [];
    if (selectedCategory === "trust") {
      return documentTypes.trust;
    }
    if (selectedCategory === "business") {
      return documentTypes.business;
    }
    return documentTypes.all;
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Upload</h1>
          <p className="text-muted-foreground">
            Upload trust documents and business filings to your House Vault
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="trust">Trust Documents</TabsTrigger>
            <TabsTrigger value="business">Business Documents</TabsTrigger>
            <TabsTrigger value="link">Link Business</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Documents
                </CardTitle>
                <CardDescription>
                  Upload official documents to your secure vault. Only final versions are stored.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Document Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(v) => {
                        setSelectedCategory(v as DocumentCategory);
                        setSelectedDocType("");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trust">Trust Documents</SelectItem>
                        <SelectItem value="business">Business Documents</SelectItem>
                        <SelectItem value="legal">Legal Documents</SelectItem>
                        <SelectItem value="financial">Financial Documents</SelectItem>
                        <SelectItem value="personal">Personal Documents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDocTypeOptions().map((opt) => (
                          <SelectItem key={opt.type} value={opt.type}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Document Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Document Title</Label>
                    <Input
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="Enter document title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      placeholder="Brief description of the document"
                      rows={2}
                    />
                  </div>
                </div>

                {/* File Drop Zone */}
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.tiff"
                    multiple
                    onChange={handleFileSelect}
                  />
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Click to select files or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported: PDF, DOC, DOCX, PNG, JPEG, TIFF (Max 50MB)
                  </p>
                </div>

                {/* Selected Files */}
                {uploadingFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files</Label>
                    {uploadingFiles.map((uploadFile, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg"
                      >
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {uploadFile.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {uploadFile.status === "uploading" && (
                            <Progress value={uploadFile.progress} className="h-1 mt-1" />
                          )}
                          {uploadFile.status === "error" && (
                            <p className="text-xs text-destructive">{uploadFile.error}</p>
                          )}
                        </div>
                        {uploadFile.status === "complete" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : uploadFile.status === "error" ? (
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        ) : uploadFile.status === "uploading" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={uploadingFiles.length === 0 || uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? (
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
          </TabsContent>

          {/* Trust Documents Tab */}
          <TabsContent value="trust" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Trust Document Checklist
                </CardTitle>
                <CardDescription>
                  Required and recommended documents for your trust setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trustChecklist ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div>
                        <p className="font-medium">Upload Progress</p>
                        <p className="text-sm text-muted-foreground">
                          {trustChecklist.progress.uploadedRequired} of{" "}
                          {trustChecklist.progress.totalRequired} required documents
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {trustChecklist.progress.percentComplete}%
                        </p>
                      </div>
                    </div>

                    <Progress value={trustChecklist.progress.percentComplete} className="h-2" />

                    <Separator />

                    <div className="space-y-3">
                      {trustChecklist.checklist.map((item) => (
                        <div
                          key={item.type}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {item.uploaded ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : item.required ? (
                              <AlertCircle className="w-5 h-5 text-amber-500" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.required && (
                              <Badge variant="outline" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {item.uploaded && item.document && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(item.document?.fileUrl, "_blank")}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Activate your House to see the document checklist
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Documents Tab */}
          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Documents
                </CardTitle>
                <CardDescription>
                  Documents uploaded for your business entities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedDocs && uploadedDocs.length > 0 ? (
                  <div className="space-y-3">
                    {uploadedDocs
                      .filter((doc: any) => doc.metadata?.category === "business")
                      .map((doc: any) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.documentType?.replace(/_/g, " ")} •{" "}
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(doc.fileUrl, "_blank")}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const a = document.createElement("a");
                                a.href = doc.fileUrl;
                                a.download = doc.fileName || doc.title;
                                a.click();
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Delete this document?")) {
                                  deleteMutation.mutate({ documentId: doc.id });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No business documents uploaded yet
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setActiveTab("upload")}
                    >
                      Upload Documents
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Link Business Tab */}
          <TabsContent value="link" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  Link Business to House
                </CardTitle>
                <CardDescription>
                  Configure the 70/30 split for existing businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ownerHouse?.businesses && ownerHouse.businesses.length > 0 ? (
                  <div className="space-y-4">
                    {ownerHouse.businesses.map((business: any) => (
                      <div
                        key={business.id}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{business.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {business.entityType?.toUpperCase()} •{" "}
                              {business.stateOfFormation}
                            </p>
                          </div>
                          {business.houseId ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Linked
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not Linked</Badge>
                          )}
                        </div>

                        {!business.houseId && ownerHouse.house && (
                          <div className="space-y-3 pt-2 border-t">
                            <p className="text-sm font-medium">
                              Configure Split for {ownerHouse.house.name}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs">Operating %</Label>
                                <Input
                                  type="number"
                                  defaultValue={70}
                                  min={0}
                                  max={100}
                                  id={`operating-${business.id}`}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">House %</Label>
                                <Input
                                  type="number"
                                  defaultValue={30}
                                  min={0}
                                  max={100}
                                  id={`house-${business.id}`}
                                />
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                const operatingEl = document.getElementById(
                                  `operating-${business.id}`
                                ) as HTMLInputElement;
                                const houseEl = document.getElementById(
                                  `house-${business.id}`
                                ) as HTMLInputElement;
                                const operating = parseInt(operatingEl?.value || "70");
                                const house = parseInt(houseEl?.value || "30");

                                if (operating + house !== 100) {
                                  toast.error("Percentages must total 100%");
                                  return;
                                }

                                linkBusinessMutation.mutate({
                                  businessEntityId: business.id,
                                  houseId: ownerHouse.house!.id,
                                  operatingPercentage: operating,
                                  housePercentage: house,
                                });
                              }}
                              disabled={linkBusinessMutation.isPending}
                            >
                              {linkBusinessMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Link2 className="w-4 h-4 mr-2" />
                              )}
                              Link to House
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No businesses imported yet
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => (window.location.href = "/owner-setup")}
                    >
                      Import Businesses
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
