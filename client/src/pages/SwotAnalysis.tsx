import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  Plus, Trash2, Target, Shield, AlertTriangle, 
  TrendingUp, Lightbulb, ChevronRight, BarChart3, FileText,
  CheckCircle, Clock, XCircle, Sparkles, Loader2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SwotCategory = "strength" | "weakness" | "opportunity" | "threat";
type Priority = "low" | "medium" | "high" | "critical";
type ActionStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface SwotItem {
  id: number;
  category: SwotCategory;
  title: string;
  description: string | null;
  priority: Priority;
  impact: number | null;
  actionRequired: boolean | null;
  actionPlan: string | null;
  actionStatus: ActionStatus | null;
  actionDueDate: Date | null;
  sortOrder: number | null;
}

interface SwotAnalysisData {
  id: number;
  title: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  strengthScore: number | null;
  weaknessScore: number | null;
  opportunityScore: number | null;
  threatScore: number | null;
  items?: SwotItem[];
}

const categoryConfig: Record<SwotCategory, { 
  label: string; 
  color: string; 
  bgColor: string; 
  icon: React.ReactNode;
  description: string;
}> = {
  strength: { 
    label: "Strengths", 
    color: "text-green-700 dark:text-green-400", 
    bgColor: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    icon: <Shield className="w-5 h-5" />,
    description: "Internal positive attributes"
  },
  weakness: { 
    label: "Weaknesses", 
    color: "text-red-700 dark:text-red-400", 
    bgColor: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    icon: <AlertTriangle className="w-5 h-5" />,
    description: "Internal areas for improvement"
  },
  opportunity: { 
    label: "Opportunities", 
    color: "text-blue-700 dark:text-blue-400", 
    bgColor: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    icon: <TrendingUp className="w-5 h-5" />,
    description: "External favorable factors"
  },
  threat: { 
    label: "Threats", 
    color: "text-amber-700 dark:text-amber-400", 
    bgColor: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    icon: <Target className="w-5 h-5" />,
    description: "External challenges to address"
  },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-slate-100 text-slate-700" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
};

const actionStatusConfig: Record<ActionStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "Pending", icon: <Clock className="w-3 h-3" />, color: "text-slate-500" },
  in_progress: { label: "In Progress", icon: <ChevronRight className="w-3 h-3" />, color: "text-blue-500" },
  completed: { label: "Completed", icon: <CheckCircle className="w-3 h-3" />, color: "text-green-500" },
  cancelled: { label: "Cancelled", icon: <XCircle className="w-3 h-3" />, color: "text-red-500" },
};

export default function SwotAnalysis() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SwotCategory>("strength");
  const [newAnalysis, setNewAnalysis] = useState({ title: "", description: "" });
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    impact: 5,
    actionRequired: false,
    actionPlan: "",
  });
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiContext, setAIContext] = useState("");
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  const utils = trpc.useUtils();
  
  const { data: analyses, isLoading: isLoadingAnalyses } = trpc.swotAnalysis.list.useQuery();
  const { data: selectedAnalysis, isLoading: isLoadingAnalysis } = trpc.swotAnalysis.get.useQuery(
    { id: selectedAnalysisId! },
    { enabled: !!selectedAnalysisId }
  );

  const createAnalysis = trpc.swotAnalysis.create.useMutation({
    onSuccess: (data) => {
      toast.success("SWOT analysis created");
      setIsCreateDialogOpen(false);
      setNewAnalysis({ title: "", description: "" });
      setSelectedAnalysisId(data.id);
      utils.swotAnalysis.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteAnalysis = trpc.swotAnalysis.delete.useMutation({
    onSuccess: () => {
      toast.success("SWOT analysis deleted");
      setSelectedAnalysisId(null);
      utils.swotAnalysis.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addItem = trpc.swotAnalysis.items.add.useMutation({
    onSuccess: () => {
      toast.success("Item added");
      setIsAddItemDialogOpen(false);
      setNewItem({
        title: "",
        description: "",
        priority: "medium",
        impact: 5,
        actionRequired: false,
        actionPlan: "",
      });
      utils.swotAnalysis.get.invalidate({ id: selectedAnalysisId! });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteItem = trpc.swotAnalysis.items.delete.useMutation({
    onSuccess: () => {
      toast.success("Item deleted");
      utils.swotAnalysis.get.invalidate({ id: selectedAnalysisId! });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const generateWithAI = trpc.swotAnalysis.generateWithAI.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsAIDialogOpen(false);
      setAIContext("");
      setIsAIGenerating(false);
      utils.swotAnalysis.get.invalidate({ id: selectedAnalysisId! });
    },
    onError: (error) => {
      toast.error(error.message);
      setIsAIGenerating(false);
    },
  });

  const handleAIGenerate = () => {
    if (!selectedAnalysisId) return;
    setIsAIGenerating(true);
    generateWithAI.mutate({
      swotAnalysisId: selectedAnalysisId,
      context: aiContext || undefined,
    });
  };

  const handleCreateAnalysis = () => {
    if (!newAnalysis.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    createAnalysis.mutate(newAnalysis);
  };

  const handleAddItem = () => {
    if (!newItem.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!selectedAnalysisId) return;
    
    addItem.mutate({
      swotAnalysisId: selectedAnalysisId,
      category: selectedCategory,
      ...newItem,
    });
  };

  const getItemsByCategory = (category: SwotCategory): SwotItem[] => {
    if (!selectedAnalysis?.items) return [];
    return selectedAnalysis.items.filter(item => item.category === category);
  };

  const renderSwotQuadrant = (category: SwotCategory) => {
    const config = categoryConfig[category];
    const items = getItemsByCategory(category);
    
    return (
      <Card className={`${config.bgColor} border-2`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={config.color}>{config.icon}</div>
              <CardTitle className={`text-lg ${config.color}`}>{config.label}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategory(category);
                setIsAddItemDialogOpen(true);
              }}
              className={config.color}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No items yet. Click + to add.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-background/80 rounded-lg p-3 border shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{item.title}</span>
                      <Badge className={priorityConfig[item.priority].color} variant="secondary">
                        {priorityConfig[item.priority].label}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    )}
                    {item.actionRequired && item.actionStatus && (
                      <div className={`flex items-center gap-1 text-xs ${actionStatusConfig[item.actionStatus].color}`}>
                        {actionStatusConfig[item.actionStatus].icon}
                        <span>{actionStatusConfig[item.actionStatus].label}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteItem.mutate({ id: item.id })}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SWOT Analysis</h1>
            <p className="text-muted-foreground">
              Strategic planning tool for analyzing Strengths, Weaknesses, Opportunities, and Threats
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create SWOT Analysis</DialogTitle>
                <DialogDescription>
                  Start a new strategic analysis for your business or project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Q1 2026 Business Review"
                    value={newAnalysis.title}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this analysis..."
                    value={newAnalysis.description}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAnalysis} disabled={createAnalysis.isPending}>
                  {createAnalysis.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Analysis Selection */}
        {isLoadingAnalyses ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </Card>
        ) : analyses && analyses.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {analyses.map((analysis) => (
              <Card
                key={analysis.id}
                className={`min-w-[200px] cursor-pointer transition-all ${
                  selectedAnalysisId === analysis.id
                    ? "ring-2 ring-primary"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedAnalysisId(analysis.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{analysis.title}</CardTitle>
                    <Badge variant={analysis.status === "active" ? "default" : "secondary"}>
                      {analysis.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>S: {analysis.strengthScore || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>W: {analysis.weaknessScore || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>O: {analysis.opportunityScore || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span>T: {analysis.threatScore || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <div className="text-center">
              <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No SWOT Analyses Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first SWOT analysis to start strategic planning.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Analysis
              </Button>
            </div>
          </Card>
        )}

        {/* SWOT Matrix */}
        {selectedAnalysisId && (
          <>
            {isLoadingAnalysis ? (
              <Card className="p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </Card>
            ) : selectedAnalysis ? (
              <Tabs defaultValue="matrix" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="matrix">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Matrix View
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      <FileText className="w-4 h-4 mr-2" />
                      List View
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex gap-2">
                    <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate with AI
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>AI-Assisted SWOT Generation</DialogTitle>
                          <DialogDescription>
                            Let AI analyze your business context and generate strategic SWOT items.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="aiContext">Additional Context (optional)</Label>
                            <Textarea
                              id="aiContext"
                              placeholder="Provide any additional context about your business, industry, or specific focus areas..."
                              value={aiContext}
                              onChange={(e) => setAIContext(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                            <p className="font-medium mb-1">What AI will generate:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>3-5 items for each SWOT category</li>
                              <li>Priority levels and impact scores</li>
                              <li>Action plans for items requiring attention</li>
                            </ul>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAIDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAIGenerate} disabled={isAIGenerating}>
                            {isAIGenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this analysis?")) {
                          deleteAnalysis.mutate({ id: selectedAnalysisId });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                <TabsContent value="matrix">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderSwotQuadrant("strength")}
                    {renderSwotQuadrant("weakness")}
                    {renderSwotQuadrant("opportunity")}
                    {renderSwotQuadrant("threat")}
                  </div>
                </TabsContent>

                <TabsContent value="list">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {(["strength", "weakness", "opportunity", "threat"] as SwotCategory[]).map((category) => {
                          const items = getItemsByCategory(category);
                          const config = categoryConfig[category];
                          return (
                            <div key={category}>
                              <div className="flex items-center gap-2 mb-3">
                                <div className={config.color}>{config.icon}</div>
                                <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
                                <Badge variant="secondary">{items.length}</Badge>
                              </div>
                              {items.length === 0 ? (
                                <p className="text-sm text-muted-foreground pl-7">No items</p>
                              ) : (
                                <ul className="space-y-2 pl-7">
                                  {items.map((item) => (
                                    <li key={item.id} className="flex items-start gap-2">
                                      <ChevronRight className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                      <div>
                                        <span className="font-medium">{item.title}</span>
                                        {item.description && (
                                          <p className="text-sm text-muted-foreground">{item.description}</p>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : null}
          </>
        )}

        {/* Add Item Dialog */}
        <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {categoryConfig[selectedCategory].label.slice(0, -1)}</DialogTitle>
              <DialogDescription>
                Add a new item to the {categoryConfig[selectedCategory].label.toLowerCase()} category.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item-title">Title</Label>
                <Input
                  id="item-title"
                  placeholder="Brief title for this item"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-description">Description (optional)</Label>
                <Textarea
                  id="item-description"
                  placeholder="More details about this item..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newItem.priority}
                    onValueChange={(value: Priority) => setNewItem({ ...newItem, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Impact (1-10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={newItem.impact}
                    onChange={(e) => setNewItem({ ...newItem, impact: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="action-required"
                  checked={newItem.actionRequired}
                  onChange={(e) => setNewItem({ ...newItem, actionRequired: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="action-required">Action Required</Label>
              </div>
              {newItem.actionRequired && (
                <div className="space-y-2">
                  <Label htmlFor="action-plan">Action Plan</Label>
                  <Textarea
                    id="action-plan"
                    placeholder="What actions need to be taken?"
                    value={newItem.actionPlan}
                    onChange={(e) => setNewItem({ ...newItem, actionPlan: e.target.value })}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={addItem.isPending}>
                {addItem.isPending ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
