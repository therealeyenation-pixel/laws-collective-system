import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FolderOpen,
  Upload,
  FileText,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight,
} from "lucide-react";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentLibrary from "@/components/DocumentLibrary";
import DocumentExpirationAlert from "@/components/DocumentExpirationAlert";
import DocumentTemplates from "@/components/DocumentTemplates";

// Entity mapping
const ENTITIES = [
  { id: "real_eye_nation", name: "Real-Eye-Nation LLC", type: "Media & Narrative" },
  { id: "laws_collective", name: "The L.A.W.S. Collective LLC", type: "Workforce Development" },
  { id: "luvonpurpose_wealth", name: "LuvOnPurpose Autonomous Wealth System LLC", type: "Technology Platform" },
  { id: "academy", name: "LuvOnPurpose Outreach Temple and Academy Society Inc.", type: "Education (501c3)" },
  { id: "trust_98", name: "98 Trust - CALEA Freeman Family Trust", type: "Family Trust" },
];

export default function GrantDocuments() {
  const [selectedEntity, setSelectedEntity] = useState<string>("laws_collective");
  const [activeTab, setActiveTab] = useState<string>("overview");

  const { data: allDocuments, isLoading: docsLoading } = trpc.grantDocuments.getAllDocuments.useQuery();
  const { data: checklist, isLoading: checklistLoading } = trpc.grantDocuments.getDocumentChecklist.useQuery({
    entityId: selectedEntity,
  });

  const currentEntity = ENTITIES.find(e => e.id === selectedEntity);
  const isLoading = docsLoading || checklistLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs font-medium">
                Grant Application Documents
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">Document Center</h1>
            <p className="text-muted-foreground mt-1">
              Upload and manage documents for grant applications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-[280px]">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {ENTITIES.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    <div className="flex flex-col">
                      <span>{entity.name}</span>
                      <span className="text-xs text-muted-foreground">{entity.type}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{allDocuments && 'totalCount' in allDocuments ? allDocuments.totalCount : 0}</p>
                </div>
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Required Complete</p>
                  <p className="text-2xl font-bold">
                    {checklist?.completedCount || 0}/{checklist?.requiredCount || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{checklist?.completionRate || 0}%</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <Progress value={checklist?.completionRate || 0} className="mt-3 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Missing Required</p>
                  <p className="text-2xl font-bold">
                    {(checklist?.requiredCount || 0) - (checklist?.completedCount || 0)}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[650px]">
            <TabsTrigger value="overview" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <FileText className="w-4 h-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertCircle className="w-4 h-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Entity Document Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {currentEntity?.name}
                    </CardTitle>
                    <CardDescription>
                      Document readiness for grant applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Readiness</span>
                        <span className="text-2xl font-bold text-primary">
                          {checklist?.completionRate || 0}%
                        </span>
                      </div>
                      <Progress value={checklist?.completionRate || 0} className="h-3" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
                        {checklist?.checklist.map((item) => (
                          <div
                            key={item.category}
                            className={`
                              p-3 rounded-lg border transition-colors cursor-pointer
                              ${item.uploaded 
                                ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                                : item.required 
                                  ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                                  : "bg-muted/50 border-border"
                              }
                            `}
                            onClick={() => {
                              if (!item.uploaded) {
                                setActiveTab("upload");
                              }
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {item.uploaded ? (
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  ) : item.required ? (
                                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  )}
                                  <span className="text-sm font-medium truncate capitalize">
                                    {item.category.replace(/_/g, " ")}
                                  </span>
                                </div>
                                {item.documentCount > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {item.documentCount} file{item.documentCount > 1 ? "s" : ""}
                                  </div>
                                )}
                              </div>
                            </div>
                            {item.required && !item.uploaded && (
                              <Badge variant="destructive" className="text-xs mt-2">
                                Required
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* All Entities Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Entities Document Status</CardTitle>
                    <CardDescription>
                      Document count across all business entities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ENTITIES.map((entity) => {
                        const entityDocs = allDocuments && 'documents' in allDocuments ? (allDocuments.documents?.[entity.id] || []) : [];
                        return (
                          <div
                            key={entity.id}
                            className={`
                              flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors
                              ${selectedEntity === entity.id ? "bg-primary/5 border-primary" : "hover:bg-muted/50"}
                            `}
                            onClick={() => setSelectedEntity(entity.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Building2 className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{entity.name}</p>
                                <p className="text-sm text-muted-foreground">{entity.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="secondary">
                                {entityDocs.length} document{entityDocs.length !== 1 ? "s" : ""}
                              </Badge>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => setActiveTab("upload")} className="gap-2">
                        <Upload className="w-4 h-4" />
                        Upload New Document
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab("library")} className="gap-2">
                        <FolderOpen className="w-4 h-4" />
                        View All Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DocumentUpload 
                entityId={selectedEntity}
                entityName={currentEntity?.name}
                onUploadComplete={() => {
                  toast.success("Document uploaded! View it in the Library tab.");
                }}
              />
              
              {/* Upload Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Guidelines</CardTitle>
                  <CardDescription>
                    Tips for preparing grant application documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Use Official Versions Only</p>
                        <p className="text-sm text-muted-foreground">
                          Upload final, signed documents. Drafts should not be stored in the system.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Clear File Names</p>
                        <p className="text-sm text-muted-foreground">
                          Name files descriptively (e.g., "2024_Budget_LAWS_Collective.pdf")
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">PDF Format Preferred</p>
                        <p className="text-sm text-muted-foreground">
                          Convert documents to PDF for best compatibility with grant portals.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Keep Documents Current</p>
                        <p className="text-sm text-muted-foreground">
                          Financial statements should be from the most recent fiscal year.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Required Document Categories</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Budget Documents</li>
                      <li>• Staffing & Organizational Chart</li>
                      <li>• Letters of Support</li>
                      <li>• Legal Documents (Articles, Bylaws)</li>
                      <li>• Financial Statements</li>
                      <li>• Program Narrative</li>
                      <li>• Timeline & Milestones</li>
                      <li>• Certificates & Licenses</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <DocumentLibrary 
              entityId={selectedEntity}
              entityName={currentEntity?.name}
              showChecklist={true}
            />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <DocumentTemplates />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Document Expiration Tracking
                </CardTitle>
                <CardDescription>
                  Monitor document validity and renewal deadlines for {currentEntity?.name || "all entities"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Documents like financial statements, certificates, and licenses need periodic renewal.
                  This system automatically tracks expiration dates based on document type and alerts you
                  when documents are approaching expiration or have already expired.
                </p>
              </CardContent>
            </Card>

            <DocumentExpirationAlert 
              entityId={selectedEntity}
              showSummary={true}
              maxItems={10}
              onViewAll={() => setActiveTab("library")}
            />

            {/* Expiration Policy Info */}
            <Card>
              <CardHeader>
                <CardTitle>Document Expiration Policies</CardTitle>
                <CardDescription>
                  Default expiration periods by document category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Annual Renewal (12 months)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Budget Documents
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Staffing & Org Charts
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Financial Statements
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Certificates & Licenses
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Biennial Renewal (24 months)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Letters of Support
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Program Narrative
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Evaluation Plan
                      </li>
                    </ul>
                    <h4 className="font-medium text-sm mt-4">No Expiration</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Legal Documents (Articles, Bylaws)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Equipment Lists
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Project Timelines
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
