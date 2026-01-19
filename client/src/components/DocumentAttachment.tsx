import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderOpen,
  Link2,
  ExternalLink,
  X,
} from "lucide-react";

// Document categories that map to grant requirements
const GRANT_DOCUMENT_CATEGORIES = [
  { id: "budget", label: "Budget Documents", required: true, grantField: "budgetItems" },
  { id: "staffing", label: "Staffing & Org Chart", required: true, grantField: "teamSize" },
  { id: "legal", label: "Legal Documents (Articles, Bylaws)", required: true, grantField: "formation" },
  { id: "financial_statements", label: "Financial Statements", required: true, grantField: "financials" },
  { id: "letters_of_support", label: "Letters of Support", required: false, grantField: null },
  { id: "program_narrative", label: "Program Narrative", required: false, grantField: "projectGoals" },
  { id: "timeline", label: "Project Timeline", required: false, grantField: "timeline" },
  { id: "certificates", label: "Certificates & Licenses", required: false, grantField: "ein" },
  { id: "evaluation_plan", label: "Evaluation Plan", required: false, grantField: "evaluation" },
  { id: "other", label: "Other Supporting Documents", required: false, grantField: null },
];

interface AttachedDocument {
  id: number;
  fileName: string;
  category: string;
  fileUrl: string;
  uploadedAt: string;
}

interface DocumentRecord {
  id: number;
  fileName: string;
  category: string;
  fileUrl: string;
  uploadedAt: string;
  mimeType?: string;
  fileSize?: number;
}

interface DocumentAttachmentProps {
  entityId: string;
  entityName?: string;
  attachedDocuments: AttachedDocument[];
  onAttach: (documents: AttachedDocument[]) => void;
  onRemove: (documentId: number) => void;
  compact?: boolean;
}

export default function DocumentAttachment({
  entityId,
  entityName,
  attachedDocuments,
  onAttach,
  onRemove,
  compact = false,
}: DocumentAttachmentProps) {
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);

  const { data: documents, isLoading } = trpc.grantDocuments.getEntityDocuments.useQuery({
    entityId,
  });

  const { data: checklistData } = trpc.grantDocuments.getDocumentChecklist.useQuery({
    entityId,
  });

  // Get documents not yet attached
  const availableDocuments = useMemo((): DocumentRecord[] => {
    if (!documents) return [];
    const attachedIds = new Set(attachedDocuments.map(d => d.id));
    // Map documents to the expected format
    return documents
      .filter(doc => !attachedIds.has(doc.id))
      .map(doc => {
        const metadata = doc.metadata as { category?: string; uploadedAt?: string } | null;
        return {
          id: doc.id,
          fileName: doc.fileName || 'Unknown',
          category: metadata?.category || 'other',
          fileUrl: doc.fileUrl || '',
          uploadedAt: metadata?.uploadedAt || doc.createdAt?.toISOString() || new Date().toISOString(),
          mimeType: doc.mimeType || undefined,
          fileSize: doc.fileSize || undefined,
        };
      });
  }, [documents, attachedDocuments]);

  // Group available documents by category
  const documentsByCategory = useMemo(() => {
    const grouped: Record<string, typeof availableDocuments> = {};
    availableDocuments.forEach(doc => {
      if (!grouped[doc.category]) {
        grouped[doc.category] = [];
      }
      grouped[doc.category].push(doc);
    });
    return grouped;
  }, [availableDocuments]);

  // Calculate attachment coverage
  const attachmentCoverage = useMemo(() => {
    const attachedCategories = new Set(attachedDocuments.map(d => d.category));
    const requiredCategories = GRANT_DOCUMENT_CATEGORIES.filter(c => c.required);
    const coveredRequired = requiredCategories.filter(c => attachedCategories.has(c.id)).length;
    return {
      total: attachedDocuments.length,
      requiredCovered: coveredRequired,
      requiredTotal: requiredCategories.length,
      percentage: requiredCategories.length > 0 
        ? Math.round((coveredRequired / requiredCategories.length) * 100) 
        : 0,
    };
  }, [attachedDocuments]);

  const handleToggleDocument = (docId: number) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleAttachSelected = () => {
    const docsToAttach = availableDocuments.filter((doc: DocumentRecord) => selectedDocs.includes(doc.id));
    if (docsToAttach.length > 0) {
      onAttach(docsToAttach.map((doc: DocumentRecord) => ({
        id: doc.id,
        fileName: doc.fileName,
        category: doc.category,
        fileUrl: doc.fileUrl,
        uploadedAt: doc.uploadedAt,
      })));
      setSelectedDocs([]);
      setShowLibrary(false);
      toast.success(`${docsToAttach.length} document(s) attached`);
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact Summary */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {attachedDocuments.length} Document{attachedDocuments.length !== 1 ? "s" : ""} Attached
              </p>
              <p className="text-xs text-muted-foreground">
                {attachmentCoverage.requiredCovered}/{attachmentCoverage.requiredTotal} required categories covered
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowLibrary(!showLibrary)}>
            {showLibrary ? "Hide" : "Manage"}
          </Button>
        </div>

        {/* Attached Documents List (Compact) */}
        {attachedDocuments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedDocuments.map(doc => (
              <Badge key={doc.id} variant="secondary" className="gap-1 pr-1">
                <FileText className="w-3 h-3" />
                <span className="max-w-[150px] truncate">{doc.fileName}</span>
                <button
                  onClick={() => onRemove(doc.id)}
                  className="ml-1 p-0.5 hover:bg-destructive/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Document Library (Expandable) */}
        {showLibrary && (
          <Card>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : availableDocuments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No documents available to attach</p>
                  <Button variant="link" size="sm" onClick={() => window.open("/grant-documents", "_blank")}>
                    Upload Documents <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(documentsByCategory).map(([category, docs]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                        {category.replace(/_/g, " ")}
                      </p>
                      {docs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-2 py-1">
                          <Checkbox
                            id={`doc-${doc.id}`}
                            checked={selectedDocs.includes(doc.id)}
                            onCheckedChange={() => handleToggleDocument(doc.id)}
                          />
                          <Label htmlFor={`doc-${doc.id}`} className="text-sm cursor-pointer truncate flex-1">
                            {doc.fileName}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ))}
                  {selectedDocs.length > 0 && (
                    <Button size="sm" onClick={handleAttachSelected} className="w-full mt-2">
                      <Link2 className="w-4 h-4 mr-2" />
                      Attach {selectedDocs.length} Selected
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Coverage Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Document Attachments</CardTitle>
              <CardDescription>
                Attach documents from your library for {entityName || "this entity"}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.open("/grant-documents", "_blank")}>
              <Upload className="w-4 h-4 mr-2" />
              Upload New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Required Documents Coverage</span>
              <span className="text-sm font-bold">{attachmentCoverage.percentage}%</span>
            </div>
            <Progress value={attachmentCoverage.percentage} className="h-2" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{attachmentCoverage.total} total attached</span>
              <span>{attachmentCoverage.requiredCovered}/{attachmentCoverage.requiredTotal} required covered</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Required Document Categories</CardTitle>
          <CardDescription>
            Attach documents for each category to complete your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GRANT_DOCUMENT_CATEGORIES.map(category => {
              const categoryDocs = attachedDocuments.filter(d => d.category === category.id);
              const hasDocument = categoryDocs.length > 0;
              const availableInCategory = documentsByCategory[category.id] || [];
              
              return (
                <div
                  key={category.id}
                  className={`
                    p-3 rounded-lg border transition-colors
                    ${hasDocument 
                      ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                      : category.required 
                        ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                        : "bg-muted/30 border-border"
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {hasDocument ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      ) : category.required ? (
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{category.label}</p>
                        {hasDocument && (
                          <div className="mt-1 space-y-1">
                            {categoryDocs.map(doc => (
                              <div key={doc.id} className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="truncate max-w-[150px]">{doc.fileName}</span>
                                <button
                                  onClick={() => onRemove(doc.id)}
                                  className="p-0.5 hover:bg-destructive/20 rounded"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {category.required && !hasDocument && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                      {availableInCategory.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {availableInCategory.length} available
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Available Documents Library */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Library</CardTitle>
          <CardDescription>
            Select documents to attach to this grant application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">No documents available to attach</p>
              <p className="text-sm text-muted-foreground mb-4">
                {documents && documents.length > 0 
                  ? "All uploaded documents are already attached"
                  : "Upload documents first to attach them to your application"
                }
              </p>
              <Button variant="outline" onClick={() => window.open("/grant-documents", "_blank")}>
                <Upload className="w-4 h-4 mr-2" />
                Go to Document Center
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(documentsByCategory).map(([category, docs]) => (
                <div key={category} className="space-y-2">
                  <p className="text-sm font-medium capitalize text-muted-foreground">
                    {category.replace(/_/g, " ")} ({docs.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {docs.map(doc => (
                      <div
                        key={doc.id}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                          ${selectedDocs.includes(doc.id) 
                            ? "bg-primary/10 border-primary" 
                            : "hover:bg-muted/50"
                          }
                        `}
                        onClick={() => handleToggleDocument(doc.id)}
                      >
                        <Checkbox
                          checked={selectedDocs.includes(doc.id)}
                          onCheckedChange={() => handleToggleDocument(doc.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {selectedDocs.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    {selectedDocs.length} document{selectedDocs.length !== 1 ? "s" : ""} selected
                  </span>
                  <Button onClick={handleAttachSelected}>
                    <Link2 className="w-4 h-4 mr-2" />
                    Attach Selected Documents
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currently Attached Documents */}
      {attachedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attached Documents ({attachedDocuments.length})</CardTitle>
            <CardDescription>
              Documents that will be included with this grant application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attachedDocuments.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {doc.category.replace(/_/g, " ")} • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(doc.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
