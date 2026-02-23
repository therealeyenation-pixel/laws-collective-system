import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileCheck, 
  FileX, 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  Tag,
  Workflow,
  BarChart3,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

interface PendingTemplate {
  id: number;
  templateId: string;
  templateName: string;
  templateDescription: string | null;
  templateCategory: string;
  templateData: any;
  sharedByUserId: number;
  sharedByName: string | null;
  status: string;
  tags: string[];
  createdAt: string;
}

export default function AdminTemplateReviewsPage() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<PendingTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewComment, setReviewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // tRPC queries and mutations
  const { data: pendingTemplates, refetch: refetchPending, isLoading } = trpc.sharedWorkflowTemplates.getPendingTemplates.useQuery();
  const { data: stats } = trpc.sharedWorkflowTemplates.getStats.useQuery();
  const reviewMutation = trpc.sharedWorkflowTemplates.reviewTemplate.useMutation();

  const filteredTemplates = (pendingTemplates || []).filter(template =>
    !searchQuery ||
    template.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.sharedByName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (template: PendingTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleStartReview = (template: PendingTemplate, action: 'approve' | 'reject') => {
    setSelectedTemplate(template);
    setReviewAction(action);
    setReviewComment('');
    setIsReviewOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedTemplate) return;

    try {
      await reviewMutation.mutateAsync({
        templateId: selectedTemplate.id,
        status: reviewAction === 'approve' ? 'approved' : 'rejected',
        comment: reviewComment || undefined,
      });

      toast.success(
        reviewAction === 'approve' 
          ? "Template approved and published to community!" 
          : "Template rejected with feedback sent to contributor"
      );
      setIsReviewOpen(false);
      refetchPending();
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      documents: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      hr: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      finance: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      compliance: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      grants: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      operations: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[category] || colors.operations;
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                This page is only accessible to administrators.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Template Reviews</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve community-submitted workflow templates
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.approved || 0}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Workflow className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalDownloads || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates or contributors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pending Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Reviews ({filteredTemplates.length})
            </CardTitle>
            <CardDescription>
              Templates awaiting your review and approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading pending templates...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="font-medium text-foreground mb-2">All Caught Up!</h3>
                <p className="text-sm text-muted-foreground">
                  No templates pending review at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {template.templateName}
                        </h3>
                        <Badge className={getCategoryColor(template.templateCategory)}>
                          {template.templateCategory}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.templateDescription || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {template.sharedByName || 'Anonymous'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(template.createdAt), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Workflow className="w-3 h-3" />
                          {template.templateData?.steps?.length || 0} steps
                        </span>
                      </div>
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          {template.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleStartReview(template, 'reject')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStartReview(template, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                {selectedTemplate?.templateName}
              </DialogTitle>
              <DialogDescription>
                {selectedTemplate?.templateDescription || 'No description provided'}
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge className={getCategoryColor(selectedTemplate.templateCategory)}>
                      {selectedTemplate.templateCategory}
                    </Badge>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Submitted By</p>
                    <p className="font-medium">{selectedTemplate.sharedByName || 'Anonymous'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Trigger</h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline">
                      {selectedTemplate.templateData?.trigger?.type?.replace('_', ' ') || 'Manual'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Workflow Steps ({selectedTemplate.templateData?.steps?.length || 0})</h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {selectedTemplate.templateData?.steps?.map((step: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{step.name || `Step ${index + 1}`}</p>
                            <p className="text-xs text-muted-foreground">{step.type}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Button
                variant="outline"
                className="text-red-600"
                onClick={() => {
                  setIsPreviewOpen(false);
                  if (selectedTemplate) handleStartReview(selectedTemplate, 'reject');
                }}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setIsPreviewOpen(false);
                  if (selectedTemplate) handleStartReview(selectedTemplate, 'approve');
                }}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {reviewAction === 'approve' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Approve Template
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    Reject Template
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {reviewAction === 'approve'
                  ? `Approve "${selectedTemplate?.templateName}" for the community library`
                  : `Reject "${selectedTemplate?.templateName}" with feedback`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {reviewAction === 'approve' ? (
                <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    This template will be published to the community library and available for all users to download.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    The contributor will be notified of the rejection with your feedback.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>
                  {reviewAction === 'approve' ? 'Comment (optional)' : 'Feedback for contributor'}
                </Label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={
                    reviewAction === 'approve'
                      ? 'Add any notes about this approval...'
                      : 'Explain why this template was rejected and how it can be improved...'
                  }
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                disabled={reviewAction === 'reject' && !reviewComment}
              >
                {reviewAction === 'approve' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Confirm Approval
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-1" />
                    Confirm Rejection
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
