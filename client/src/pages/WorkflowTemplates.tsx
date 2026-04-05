import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Users, 
  DollarSign, 
  Shield, 
  Award,
  Settings,
  Search,
  Star,
  Clock,
  Zap,
  Play,
  Eye,
  Copy,
  ArrowRight,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Sparkles,
  Filter,
  Grid,
  List,
  Share2,
  Download,
  Globe,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { 
  workflowTemplatesService, 
  ExtendedWorkflowTemplate,
  TemplateCategory 
} from "@/services/workflowTemplatesService";
import { workflowBuilderService } from "@/services/workflowBuilderService";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  documents: <FileText className="w-5 h-5" />,
  hr: <Users className="w-5 h-5" />,
  finance: <DollarSign className="w-5 h-5" />,
  compliance: <Shield className="w-5 h-5" />,
  grants: <Award className="w-5 h-5" />,
  operations: <Settings className="w-5 h-5" />
};

const COMPLEXITY_COLORS: Record<string, string> = {
  simple: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  complex: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

export default function WorkflowTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ExtendedWorkflowTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ExtendedWorkflowTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [deployName, setDeployName] = useState('');
  const [deployDescription, setDeployDescription] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'library' | 'community' | 'shared'>('library');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareTemplate, setShareTemplate] = useState<ExtendedWorkflowTemplate | null>(null);
  const [shareTags, setShareTags] = useState('');

  // tRPC mutations
  const trackUsageMutation = trpc.workflowTemplates.trackUsage.useMutation();
  const rateTemplateMutation = trpc.workflowTemplates.rateTemplate.useMutation();
  const { data: popularTemplates } = trpc.workflowTemplates.getPopularTemplates.useQuery();

  // Community templates
  const { data: communityTemplates, refetch: refetchCommunity } = trpc.sharedWorkflowTemplates.getCommunityTemplates.useQuery({ category: selectedCategory === 'all' ? undefined : selectedCategory });
  const { data: mySharedTemplates, refetch: refetchMyShared } = trpc.sharedWorkflowTemplates.getMySharedTemplates.useQuery();
  const shareTemplateMutation = trpc.sharedWorkflowTemplates.shareTemplate.useMutation();
  const downloadTemplateMutation = trpc.sharedWorkflowTemplates.downloadTemplate.useMutation();
  const rateCommunityMutation = trpc.sharedWorkflowTemplates.rateTemplate.useMutation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTemplates(workflowTemplatesService.getTemplates());
    setCategories(workflowTemplatesService.getCategories());
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredTemplates = templates.filter(t => t.featured);
  const stats = workflowTemplatesService.getStats();

  const handlePreview = (template: ExtendedWorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleDeploy = (template: ExtendedWorkflowTemplate) => {
    setSelectedTemplate(template);
    setDeployName(template.name);
    setDeployDescription(template.description);
    setIsDeployOpen(true);
  };

  const handleConfirmDeploy = async () => {
    if (!selectedTemplate || !deployName) {
      toast.error("Please enter a workflow name");
      return;
    }

    // Create workflow from template
    const workflow = workflowBuilderService.createWorkflow({
      name: deployName,
      description: deployDescription,
      trigger: selectedTemplate.trigger,
      steps: selectedTemplate.steps.map(step => ({
        ...step,
        id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })),
      isActive: false,
      createdBy: user?.name || 'Unknown'
    });

    // Record usage locally
    workflowTemplatesService.recordUsage(
      selectedTemplate.id,
      user?.id?.toString() || 'unknown',
      workflow.id
    );

    // Persist to database
    try {
      await trackUsageMutation.mutateAsync({
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        templateCategory: selectedTemplate.category,
        workflowId: workflow.id,
        workflowName: deployName,
        customizations: { description: deployDescription },
      });
    } catch (error) {
      console.error('Failed to track template usage:', error);
    }

    toast.success("Workflow created from template! You can now customize it in the Workflow Builder.");
    setIsDeployOpen(false);
    setDeployName('');
    setDeployDescription('');
    loadData();
  };

  const handleShareTemplate = (template: ExtendedWorkflowTemplate) => {
    setShareTemplate(template);
    setShareTags(template.tags.join(', '));
    setIsShareOpen(true);
  };

  const handleConfirmShare = async () => {
    if (!shareTemplate) return;

    try {
      await shareTemplateMutation.mutateAsync({
        templateId: shareTemplate.id,
        templateName: shareTemplate.name,
        templateDescription: shareTemplate.description,
        templateCategory: shareTemplate.category,
        templateData: {
          trigger: shareTemplate.trigger,
          steps: shareTemplate.steps,
        },
        tags: shareTags.split(',').map(t => t.trim()).filter(Boolean),
      });
      toast.success("Template submitted for community review!");
      setIsShareOpen(false);
      refetchMyShared();
    } catch (error) {
      toast.error("Failed to share template");
    }
  };

  const handleDownloadCommunityTemplate = async (templateId: number) => {
    try {
      const result = await downloadTemplateMutation.mutateAsync({ templateId });
      if (result.templateData) {
        // Create workflow from downloaded template
        const workflow = workflowBuilderService.createWorkflow({
          name: `Community Template ${Date.now()}`,
          description: 'Downloaded from community',
          trigger: result.templateData.trigger,
          steps: result.templateData.steps.map((step: any) => ({
            ...step,
            id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          })),
          isActive: false,
          createdBy: user?.name || 'Unknown'
        });
        toast.success("Template downloaded and added to your workflows!");
        refetchCommunity();
      }
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workflow Templates</h1>
            <p className="text-muted-foreground mt-1">
              Pre-built automation templates for common business processes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalTemplates}</p>
                  <p className="text-sm text-muted-foreground">Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsage}</p>
                  <p className="text-sm text-muted-foreground">Deployments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{featuredTemplates.length}</p>
                  <p className="text-sm text-muted-foreground">Featured</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold truncate">
                    {stats.topTemplates[0]?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">Most Popular</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Templates */}
        {featuredTemplates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Featured Templates
              </CardTitle>
              <CardDescription>
                Most popular and highly-rated workflow templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredTemplates.slice(0, 3).map(template => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 border-yellow-200 dark:border-yellow-800"
                    onClick={() => handlePreview(template)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {CATEGORY_ICONS[template.category]}
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                          <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                          Featured
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {renderStars(template.rating)}
                        <span className="text-xs text-muted-foreground">
                          {template.usageCount} uses
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {CATEGORY_ICONS[category.id]}
                <span className="ml-2">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {CATEGORY_ICONS[template.category]}
                    </div>
                    <Badge className={COMPLEXITY_COLORS[template.complexity]}>
                      {template.complexity}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {template.estimatedTime}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className="w-3 h-3" />
                      {template.steps.length} steps
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    {renderStars(template.rating)}
                    <span className="text-xs text-muted-foreground">
                      {template.usageCount} uses
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDeploy(template)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Deploy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {CATEGORY_ICONS[template.category]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge className={COMPLEXITY_COLORS[template.complexity]}>
                            {template.complexity}
                          </Badge>
                          {template.featured && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                              <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          {renderStars(template.rating)}
                          <span className="text-xs text-muted-foreground">
                            {template.usageCount} uses
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {template.estimatedTime}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {template.steps.length} steps
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleDeploy(template)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Deploy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Templates Found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTemplate && CATEGORY_ICONS[selectedTemplate.category]}
                {selectedTemplate?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedTemplate?.description}
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Complexity</p>
                    <Badge className={COMPLEXITY_COLORS[selectedTemplate.complexity]}>
                      {selectedTemplate.complexity}
                    </Badge>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Est. Time</p>
                    <p className="font-medium">{selectedTemplate.estimatedTime}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Steps</p>
                    <p className="font-medium">{selectedTemplate.steps.length}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Trigger</h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <Badge variant="outline">
                      {selectedTemplate.trigger.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Workflow Steps</h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {selectedTemplate.steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{step.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {step.type.replace('_', ' ')}
                            </p>
                          </div>
                          {index < selectedTemplate.steps.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    {renderStars(selectedTemplate.rating)}
                    <span className="text-sm text-muted-foreground">
                      {selectedTemplate.usageCount} deployments
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsPreviewOpen(false);
                if (selectedTemplate) handleDeploy(selectedTemplate);
              }}>
                <Play className="w-4 h-4 mr-2" />
                Deploy Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deploy Dialog */}
        <Dialog open={isDeployOpen} onOpenChange={setIsDeployOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deploy Workflow Template</DialogTitle>
              <DialogDescription>
                Customize and deploy "{selectedTemplate?.name}" as a new workflow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  value={deployName}
                  onChange={(e) => setDeployName(e.target.value)}
                  placeholder="Enter workflow name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={deployDescription}
                  onChange={(e) => setDeployDescription(e.target.value)}
                  placeholder="Enter workflow description"
                  rows={3}
                />
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">What happens next:</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• A new workflow will be created from this template</li>
                  <li>• The workflow will be inactive by default</li>
                  <li>• You can customize steps in the Workflow Builder</li>
                  <li>• Activate when ready to start automation</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeployOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmDeploy} disabled={!deployName}>
                <Play className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Template Dialog */}
        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Template with Community
              </DialogTitle>
              <DialogDescription>
                Share "{shareTemplate?.name}" so others can use it
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">{shareTemplate?.name}</h4>
                <p className="text-sm text-muted-foreground">{shareTemplate?.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{shareTemplate?.category}</Badge>
                  <span className="text-xs text-muted-foreground">{shareTemplate?.steps.length} steps</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={shareTags}
                  onChange={(e) => setShareTags(e.target.value)}
                  placeholder="automation, approval, finance"
                />
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your template will be reviewed by our team before being published to the community library.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShareOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmShare}>
                <Upload className="w-4 h-4 mr-2" />
                Submit for Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
