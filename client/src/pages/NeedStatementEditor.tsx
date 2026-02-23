import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  FileText, 
  Edit3, 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus,
  Save,
  Send,
  Eye,
  RotateCcw,
  Loader2,
  AlertCircle,
  Building2,
  FileCheck,
  Trash2,
  GitCompare
} from "lucide-react";

export default function NeedStatementEditor() {
  const [activeTab, setActiveTab] = useState("entities");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  // Queries
  const { data: dashboard, isLoading, refetch: refetchDashboard } = trpc.needStatementEditor.getDashboard.useQuery();
  const { data: currentStatement, refetch: refetchStatement } = trpc.needStatementEditor.getCurrentStatement.useQuery(
    { entityId: selectedEntity || '' },
    { enabled: !!selectedEntity }
  );
  const { data: versionHistory } = trpc.needStatementEditor.getVersionHistory.useQuery(
    { entityId: selectedEntity || '' },
    { enabled: !!selectedEntity }
  );
  const { data: entityDrafts, refetch: refetchDrafts } = trpc.needStatementEditor.getDraftsForEntity.useQuery(
    { entityId: selectedEntity || '' },
    { enabled: !!selectedEntity }
  );
  const { data: validation } = trpc.needStatementEditor.validateStatement.useQuery(
    { content: editContent },
    { enabled: editContent.length > 50 }
  );
  const { data: templates } = trpc.needStatementEditor.getTemplates.useQuery();

  // Mutations
  const createDraftMutation = trpc.needStatementEditor.createDraft.useMutation({
    onSuccess: (data) => {
      if (data) {
        toast.success("Draft created");
        setCurrentDraftId(data.id);
        refetchDrafts();
        refetchDashboard();
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const updateDraftMutation = trpc.needStatementEditor.updateDraft.useMutation({
    onSuccess: () => {
      toast.success("Draft saved");
      refetchDrafts();
    },
    onError: (error) => toast.error(error.message),
  });

  const submitForReviewMutation = trpc.needStatementEditor.submitForReview.useMutation({
    onSuccess: () => {
      toast.success("Draft submitted for review");
      setShowEditDialog(false);
      setCurrentDraftId(null);
      refetchDrafts();
      refetchDashboard();
    },
    onError: (error) => toast.error(error.message),
  });

  const approveDraftMutation = trpc.needStatementEditor.approveDraft.useMutation({
    onSuccess: () => {
      toast.success("Draft approved and published");
      setShowReviewDialog(false);
      setSelectedDraft(null);
      setReviewNotes("");
      refetchDrafts();
      refetchDashboard();
      refetchStatement();
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectDraftMutation = trpc.needStatementEditor.rejectDraft.useMutation({
    onSuccess: () => {
      toast.success("Draft rejected");
      setShowReviewDialog(false);
      setSelectedDraft(null);
      setReviewNotes("");
      refetchDrafts();
      refetchDashboard();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteDraftMutation = trpc.needStatementEditor.deleteDraft.useMutation({
    onSuccess: () => {
      toast.success("Draft deleted");
      refetchDrafts();
      refetchDashboard();
    },
    onError: (error) => toast.error(error.message),
  });

  const revertVersionMutation = trpc.needStatementEditor.revertToVersion.useMutation({
    onSuccess: () => {
      toast.success("Reverted to previous version");
      setShowVersionDialog(false);
      setSelectedVersion(null);
      refetchStatement();
      refetchDashboard();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleStartEdit = (entityId: string) => {
    setSelectedEntity(entityId);
    const entity = dashboard?.entities.find(e => e.entityId === entityId);
    if (entity) {
      // Get current statement content
      const statement = currentStatement;
      setEditContent(statement?.content || '');
      setShowEditDialog(true);
    }
  };

  const handleSaveDraft = () => {
    if (!selectedEntity) return;

    if (currentDraftId) {
      updateDraftMutation.mutate({ draftId: currentDraftId, content: editContent });
    } else {
      createDraftMutation.mutate({ entityId: selectedEntity, content: editContent });
    }
  };

  const handleSubmitForReview = () => {
    if (!currentDraftId) {
      // Create draft first, then submit
      createDraftMutation.mutate(
        { entityId: selectedEntity!, content: editContent },
        {
          onSuccess: (data) => {
            if (data) {
              submitForReviewMutation.mutate({ draftId: data.id });
            }
          }
        }
      );
    } else {
      submitForReviewMutation.mutate({ draftId: currentDraftId });
    }
  };

  const handleReviewDraft = (draft: any) => {
    setSelectedDraft(draft);
    setShowReviewDialog(true);
  };

  const handleViewVersion = (version: any) => {
    setSelectedVersion(version);
    setShowVersionDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="gap-1"><Edit3 className="w-3 h-3" />Draft</Badge>;
      case 'pending_review':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1"><Clock className="w-3 h-3" />Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1"><CheckCircle2 className="w-3 h-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Need Statement Editor</h1>
            <p className="text-muted-foreground">Customize and manage entity need statements for grant applications</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entities</p>
                  <p className="text-2xl font-bold">{dashboard?.statistics.totalEntities || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={dashboard?.statistics.pendingDrafts ? "border-amber-500" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${dashboard?.statistics.pendingDrafts ? "bg-amber-500/10" : "bg-muted"}`}>
                  <Clock className={`w-6 h-6 ${dashboard?.statistics.pendingDrafts ? "text-amber-600" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{dashboard?.statistics.pendingDrafts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <FileCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Versions</p>
                  <p className="text-2xl font-bold">{dashboard?.statistics.totalVersions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Word Count</p>
                  <p className="text-2xl font-bold">{dashboard?.statistics.averageWordCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="pending">Pending Review ({dashboard?.pendingReviews.length || 0})</TabsTrigger>
            <TabsTrigger value="history">Version History</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Entities Tab */}
          <TabsContent value="entities" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              {dashboard?.entities.map((entity) => (
                <Card key={entity.entityId}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{entity.entityName}</h3>
                          <Badge variant="outline">{entity.entityType}</Badge>
                          {entity.hasDraft && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Has Draft</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Version {entity.currentVersion}</span>
                          <span>Last updated: {new Date(entity.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEntity(entity.entityId);
                            setShowPreviewDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStartEdit(entity.entityId)}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pending Review Tab */}
          <TabsContent value="pending" className="space-y-4 mt-4">
            {dashboard?.pendingReviews && dashboard.pendingReviews.length > 0 ? (
              <div className="space-y-4">
                {dashboard.pendingReviews.map((draft: any) => (
                  <Card key={draft.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{draft.entityName}</h3>
                            {getStatusBadge(draft.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Version {draft.version}</span>
                            <span>{draft.wordCount} words</span>
                            <span>Submitted: {new Date(draft.updatedAt).toLocaleDateString()}</span>
                            <span>By: {draft.createdBy}</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleReviewDraft(draft)}>
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No drafts pending review</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Version History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Entity</CardTitle>
                <CardDescription>View version history for a specific entity</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedEntity || ''} onValueChange={setSelectedEntity}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboard?.entities.map((entity) => (
                      <SelectItem key={entity.entityId} value={entity.entityId}>
                        {entity.entityName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedEntity && versionHistory && versionHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Version History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {versionHistory.map((version: any) => (
                      <div 
                        key={version.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border ${version.isActive ? 'border-primary bg-primary/5' : ''}`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Version {version.version}</span>
                            {version.isActive && <Badge className="bg-primary/10 text-primary">Active</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{version.changeDescription}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{version.wordCount} words</span>
                            <span>{new Date(version.createdAt).toLocaleString()}</span>
                            <span>By: {version.createdBy}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewVersion(version)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {!version.isActive && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => revertVersionMutation.mutate({
                                entityId: selectedEntity,
                                versionNumber: version.version
                              })}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Revert
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates?.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sections:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {template.sections.map((section, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {section.title} ({section.minWords}-{section.maxWords} words)
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Need Statement</DialogTitle>
              <DialogDescription>
                {dashboard?.entities.find(e => e.entityId === selectedEntity)?.entityName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Statement Content</Label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Enter need statement content..."
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              {/* Validation Feedback */}
              {validation && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Word Count:</span>
                    <Badge variant={validation.isValid ? "default" : "destructive"}>
                      {validation.wordCount} words
                    </Badge>
                  </div>
                  {validation.issues.length > 0 && (
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="text-sm font-medium text-destructive mb-1">Issues:</p>
                      <ul className="text-sm text-destructive space-y-1">
                        {validation.issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {validation.suggestions.length > 0 && (
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                      <p className="text-sm font-medium text-amber-600 mb-1">Suggestions:</p>
                      <ul className="text-sm text-amber-600 space-y-1">
                        {validation.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={createDraftMutation.isPending || updateDraftMutation.isPending}
              >
                {(createDraftMutation.isPending || updateDraftMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-1" />
                Save Draft
              </Button>
              <Button 
                onClick={handleSubmitForReview}
                disabled={submitForReviewMutation.isPending || !validation?.isValid}
              >
                {submitForReviewMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Send className="w-4 h-4 mr-1" />
                Submit for Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Need Statement Preview</DialogTitle>
              <DialogDescription>
                {currentStatement?.entityName} - Version {currentStatement?.version}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {currentStatement?.content}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm text-muted-foreground">
                <span>{currentStatement?.wordCount} words</span>
                <span>Last updated: {currentStatement?.lastUpdated ? new Date(currentStatement.lastUpdated).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setShowPreviewDialog(false);
                handleStartEdit(selectedEntity!);
              }}>
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Draft</DialogTitle>
              <DialogDescription>
                {selectedDraft?.entityName} - Version {selectedDraft?.version}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed border p-4 rounded-lg bg-muted/30">
                  {selectedDraft?.content}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{selectedDraft?.wordCount} words</span>
                <span>Submitted by: {selectedDraft?.createdBy}</span>
                <span>{new Date(selectedDraft?.updatedAt || '').toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                <Label>Review Notes</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => rejectDraftMutation.mutate({
                  draftId: selectedDraft.id,
                  reviewNotes: reviewNotes || 'Rejected without notes'
                })}
                disabled={rejectDraftMutation.isPending}
              >
                {rejectDraftMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button 
                onClick={() => approveDraftMutation.mutate({
                  draftId: selectedDraft.id,
                  reviewNotes
                })}
                disabled={approveDraftMutation.isPending}
              >
                {approveDraftMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Approve & Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Version View Dialog */}
        <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Version {selectedVersion?.version}</DialogTitle>
              <DialogDescription>
                {selectedVersion?.changeDescription}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed border p-4 rounded-lg bg-muted/30">
                  {selectedVersion?.content}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm text-muted-foreground">
                <span>{selectedVersion?.wordCount} words</span>
                <span>Created: {selectedVersion?.createdAt ? new Date(selectedVersion.createdAt).toLocaleString() : 'N/A'}</span>
                <span>By: {selectedVersion?.createdBy}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVersionDialog(false)}>
                Close
              </Button>
              {!selectedVersion?.isActive && (
                <Button 
                  onClick={() => revertVersionMutation.mutate({
                    entityId: selectedEntity!,
                    versionNumber: selectedVersion.version
                  })}
                  disabled={revertVersionMutation.isPending}
                >
                  {revertVersionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Revert to This Version
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
