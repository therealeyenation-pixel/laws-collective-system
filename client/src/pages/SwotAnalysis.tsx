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
  CheckCircle, Clock, XCircle, Sparkles, Loader2, Download, Calendar, Filter,
  Globe, ExternalLink, Newspaper, Bot, AlertCircle
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

// 5C Context Framework prompts for each SWOT category
const contextPrompts: Record<SwotCategory, string[]> = {
  strength: [
    "What's your 'for X' differentiator? (Blue Ocean Strategy)",
    "What unique value do you provide that competitors don't?",
    "What resources or capabilities give you an edge?",
    "What do customers say you do better than others?",
  ],
  weakness: [
    "What gaps do competitors fill that you don't?",
    "Where do you lack resources or expertise?",
    "What processes need improvement?",
    "What customer complaints recur?",
  ],
  opportunity: [
    "Is your industry growing faster than GDP? (Market Validation)",
    "Can your target customer afford your solution? (Customer Understanding)",
    "What underserved segment could you target? (Blue Ocean)",
    "What market trends favor your business?",
  ],
  threat: [
    "Is your market contracting or commoditizing?",
    "Are competitors entering your niche?",
    "What economic factors could impact your customers?",
    "What regulatory changes could affect you?",
  ],
};

const categoryConfig: Record<SwotCategory, { 
  label: string; 
  color: string; 
  bgColor: string; 
  icon: React.ReactNode;
  description: string;
  contextTip: string;
}> = {
  strength: { 
    label: "Strengths", 
    color: "text-green-700 dark:text-green-400", 
    bgColor: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    icon: <Shield className="w-5 h-5" />,
    description: "Internal positive attributes",
    contextTip: "Think about your 'for X' differentiator - what makes you unique in your niche?"
  },
  weakness: { 
    label: "Weaknesses", 
    color: "text-red-700 dark:text-red-400", 
    bgColor: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    icon: <AlertTriangle className="w-5 h-5" />,
    description: "Internal areas for improvement",
    contextTip: "Consider gaps that competitors fill better than you"
  },
  opportunity: { 
    label: "Opportunities", 
    color: "text-blue-700 dark:text-blue-400", 
    bgColor: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    icon: <TrendingUp className="w-5 h-5" />,
    description: "External favorable factors",
    contextTip: "Is your market growing? Can your target customers afford your solution?"
  },
  threat: { 
    label: "Threats", 
    color: "text-amber-700 dark:text-amber-400", 
    bgColor: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    icon: <Target className="w-5 h-5" />,
    description: "External challenges to address",
    contextTip: "What external factors could disrupt your market position?"
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
  const [dateFilter, setDateFilter] = useState<"all" | "quarter" | "year" | "custom">("all");

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

  const handleExportPDF = () => {
    if (!selectedAnalysis) return;
    
    // Generate PDF content as HTML
    const items = selectedAnalysis.items || [];
    const strengths = items.filter(i => i.category === "strength");
    const weaknesses = items.filter(i => i.category === "weakness");
    const opportunities = items.filter(i => i.category === "opportunity");
    const threats = items.filter(i => i.category === "threat");
    
    const renderItems = (categoryItems: SwotItem[]) => {
      if (categoryItems.length === 0) return "<p style='color: #666; font-style: italic;'>No items</p>";
      return categoryItems.map(item => `
        <div style="margin-bottom: 12px; padding: 8px; background: #f9f9f9; border-radius: 4px;">
          <div style="font-weight: 600;">${item.title}</div>
          ${item.description ? `<div style="color: #666; font-size: 12px; margin-top: 4px;">${item.description}</div>` : ""}
          <div style="margin-top: 4px; font-size: 11px;">
            <span style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px;">${item.priority}</span>
            <span style="margin-left: 8px;">Impact: ${item.impact || 5}/10</span>
          </div>
        </div>
      `).join("");
    };
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SWOT Analysis - ${selectedAnalysis.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #1a5f1a; border-bottom: 2px solid #1a5f1a; padding-bottom: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
          .quadrant { border: 2px solid; border-radius: 8px; padding: 16px; }
          .strengths { border-color: #22c55e; background: #f0fdf4; }
          .weaknesses { border-color: #ef4444; background: #fef2f2; }
          .opportunities { border-color: #3b82f6; background: #eff6ff; }
          .threats { border-color: #f59e0b; background: #fffbeb; }
          .quadrant h2 { margin-top: 0; font-size: 18px; }
          .strengths h2 { color: #15803d; }
          .weaknesses h2 { color: #dc2626; }
          .opportunities h2 { color: #2563eb; }
          .threats h2 { color: #d97706; }
          .scores { margin-top: 30px; display: flex; gap: 20px; justify-content: center; }
          .score-box { text-align: center; padding: 10px 20px; border-radius: 8px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>SWOT Analysis: ${selectedAnalysis.title}</h1>
        ${selectedAnalysis.description ? `<p style="color: #666;">${selectedAnalysis.description}</p>` : ""}
        <p style="font-size: 12px; color: #888;">Generated: ${new Date().toLocaleDateString()}</p>
        
        <div class="scores">
          <div class="score-box" style="background: #dcfce7;"><strong>Strengths:</strong> ${selectedAnalysis.strengthScore || 0}</div>
          <div class="score-box" style="background: #fee2e2;"><strong>Weaknesses:</strong> ${selectedAnalysis.weaknessScore || 0}</div>
          <div class="score-box" style="background: #dbeafe;"><strong>Opportunities:</strong> ${selectedAnalysis.opportunityScore || 0}</div>
          <div class="score-box" style="background: #fef3c7;"><strong>Threats:</strong> ${selectedAnalysis.threatScore || 0}</div>
        </div>
        
        <div class="grid">
          <div class="quadrant strengths">
            <h2>Strengths</h2>
            ${renderItems(strengths)}
          </div>
          <div class="quadrant weaknesses">
            <h2>Weaknesses</h2>
            ${renderItems(weaknesses)}
          </div>
          <div class="quadrant opportunities">
            <h2>Opportunities</h2>
            ${renderItems(opportunities)}
          </div>
          <div class="quadrant threats">
            <h2>Threats</h2>
            ${renderItems(threats)}
          </div>
        </div>
        
        <div class="footer">
          <p>The L.A.W.S. Collective - Multi-Generational Wealth Building</p>
          <p>This SWOT analysis is part of the strategic planning framework.</p>
        </div>
      </body>
      </html>
    `;
    
    // Open print dialog with the HTML content
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      toast.error("Please allow popups to export PDF");
    }
  };

  // Filter analyses by date
  const getFilteredAnalyses = () => {
    if (!analyses) return [];
    const now = new Date();
    
    switch (dateFilter) {
      case "quarter": {
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return analyses.filter(a => new Date(a.createdAt || 0) >= quarterStart);
      }
      case "year": {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return analyses.filter(a => new Date(a.createdAt || 0) >= yearStart);
      }
      default:
        return analyses;
    }
  };

  const filteredAnalyses = getFilteredAnalyses();

  const handleExportComparison = () => {
    if (!filteredAnalyses || filteredAnalyses.length === 0) {
      toast.error("No analyses to export");
      return;
    }

    // Generate CSV content
    const headers = ["Analysis", "Strengths", "Weaknesses", "Opportunities", "Threats", "Net Score", "Status"];
    const rows = filteredAnalyses.map(a => {
      const total = (a.strengthScore || 0) + (a.opportunityScore || 0) - (a.weaknessScore || 0) - (a.threatScore || 0);
      return [
        a.title,
        a.strengthScore || 0,
        a.weaknessScore || 0,
        a.opportunityScore || 0,
        a.threatScore || 0,
        total,
        a.status
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `swot-comparison-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Comparison exported to CSV");
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
          <p className="text-xs text-muted-foreground mt-1 italic">
            {config.contextTip}
          </p>
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
                    <TabsTrigger value="intelligence">
                      <Globe className="w-4 h-4 mr-2" />
                      Industry Intel
                    </TabsTrigger>
                    <TabsTrigger value="compare">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Compare
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
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPDF()}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
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

                <TabsContent value="compare">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            SWOT Comparison Over Time
                          </CardTitle>
                          <CardDescription>
                            Compare how your strategic factors have evolved across multiple analyses
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={dateFilter} onValueChange={(v: "all" | "quarter" | "year" | "custom") => setDateFilter(v)}>
                            <SelectTrigger className="w-[140px]">
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Time</SelectItem>
                              <SelectItem value="quarter">This Quarter</SelectItem>
                              <SelectItem value="year">This Year</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportComparison()}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {filteredAnalyses && filteredAnalyses.length > 1 ? (
                        <div className="space-y-6">
                          {/* Date Filter Info */}
                          {dateFilter !== "all" && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Showing {filteredAnalyses.length} {filteredAnalyses.length === 1 ? "analysis" : "analyses"} from {dateFilter === "quarter" ? "this quarter" : "this year"}
                              </span>
                            </div>
                          )}
                          {/* Score Trend Chart */}
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h4 className="font-semibold mb-4">Score Trends</h4>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                              {["Strengths", "Weaknesses", "Opportunities", "Threats"].map((label, idx) => (
                                <div key={label} className="text-center">
                                  <div className={`text-2xl font-bold ${
                                    idx === 0 ? "text-green-600" :
                                    idx === 1 ? "text-red-600" :
                                    idx === 2 ? "text-blue-600" : "text-amber-600"
                                  }`}>
                                    {idx === 0 ? selectedAnalysis?.strengthScore || 0 :
                                     idx === 1 ? selectedAnalysis?.weaknessScore || 0 :
                                     idx === 2 ? selectedAnalysis?.opportunityScore || 0 :
                                     selectedAnalysis?.threatScore || 0}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{label}</div>
                                </div>
                              ))}
                            </div>
                            <div className="h-32 flex items-end justify-around gap-2">
                              {filteredAnalyses.slice(0, 5).map((a, idx) => (
                                <div key={a.id} className="flex-1 flex flex-col items-center gap-1">
                                  <div className="w-full flex gap-0.5 items-end h-24">
                                    <div 
                                      className="flex-1 bg-green-500 rounded-t" 
                                      style={{ height: `${Math.min((a.strengthScore || 0) * 10, 100)}%` }}
                                    />
                                    <div 
                                      className="flex-1 bg-red-500 rounded-t" 
                                      style={{ height: `${Math.min((a.weaknessScore || 0) * 10, 100)}%` }}
                                    />
                                    <div 
                                      className="flex-1 bg-blue-500 rounded-t" 
                                      style={{ height: `${Math.min((a.opportunityScore || 0) * 10, 100)}%` }}
                                    />
                                    <div 
                                      className="flex-1 bg-amber-500 rounded-t" 
                                      style={{ height: `${Math.min((a.threatScore || 0) * 10, 100)}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs truncate max-w-full ${
                                    a.id === selectedAnalysisId ? "font-bold text-primary" : "text-muted-foreground"
                                  }`}>
                                    {a.title.slice(0, 10)}{a.title.length > 10 ? "..." : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Comparison Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-3">Analysis</th>
                                  <th className="text-center py-2 px-3 text-green-600">S</th>
                                  <th className="text-center py-2 px-3 text-red-600">W</th>
                                  <th className="text-center py-2 px-3 text-blue-600">O</th>
                                  <th className="text-center py-2 px-3 text-amber-600">T</th>
                                  <th className="text-center py-2 px-3">Total</th>
                                  <th className="text-center py-2 px-3">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredAnalyses.map((a) => {
                                  const total = (a.strengthScore || 0) + (a.opportunityScore || 0) - (a.weaknessScore || 0) - (a.threatScore || 0);
                                  return (
                                    <tr 
                                      key={a.id} 
                                      className={`border-b hover:bg-muted/50 cursor-pointer ${
                                        a.id === selectedAnalysisId ? "bg-primary/5" : ""
                                      }`}
                                      onClick={() => setSelectedAnalysisId(a.id)}
                                    >
                                      <td className="py-2 px-3 font-medium">{a.title}</td>
                                      <td className="text-center py-2 px-3">{a.strengthScore || 0}</td>
                                      <td className="text-center py-2 px-3">{a.weaknessScore || 0}</td>
                                      <td className="text-center py-2 px-3">{a.opportunityScore || 0}</td>
                                      <td className="text-center py-2 px-3">{a.threatScore || 0}</td>
                                      <td className={`text-center py-2 px-3 font-semibold ${
                                        total > 0 ? "text-green-600" : total < 0 ? "text-red-600" : "text-muted-foreground"
                                      }`}>
                                        {total > 0 ? "+" : ""}{total}
                                      </td>
                                      <td className="text-center py-2 px-3">
                                        <Badge variant={a.status === "active" ? "default" : "secondary"}>
                                          {a.status}
                                        </Badge>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Legend */}
                          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-green-500 rounded" />
                              <span>Strengths</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-red-500 rounded" />
                              <span>Weaknesses</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-blue-500 rounded" />
                              <span>Opportunities</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-amber-500 rounded" />
                              <span>Threats</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Need More Data</h3>
                          <p className="text-muted-foreground">
                            Create at least 2 SWOT analyses to compare trends over time.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Industry Intelligence Tab */}
                <TabsContent value="intelligence">
                  <IndustryIntelligencePanel />
                </TabsContent>
              </Tabs>
            ) : null}
          </>
        )}

        {/* Add Item Dialog */}
        <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add {categoryConfig[selectedCategory].label.slice(0, -1)}</DialogTitle>
              <DialogDescription>
                Add a new item to the {categoryConfig[selectedCategory].label.toLowerCase()} category.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* 5C Context Framework Prompts */}
              <div className={`p-3 rounded-lg border ${categoryConfig[selectedCategory].bgColor}`}>
                <p className={`text-sm font-medium mb-2 ${categoryConfig[selectedCategory].color}`}>
                  5C Context Prompts:
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {contextPrompts[selectedCategory].map((prompt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{prompt}</span>
                    </li>
                  ))}
                </ul>
              </div>
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

// Industry Intelligence Panel Component
function IndustryIntelligencePanel() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "quarter" | "year">("month");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const { data: intelligence, isLoading } = trpc.resourceLinks.getIndustryIntelligence.useQuery({
    timeframe,
    industryCategory: selectedCategory,
  });

  const swotColors = {
    strength: "bg-green-100 text-green-800 border-green-200",
    weakness: "bg-red-100 text-red-800 border-red-200",
    opportunity: "bg-blue-100 text-blue-800 border-blue-200",
    threat: "bg-amber-100 text-amber-800 border-amber-200",
  };

  const industryCategories = [
    { value: "competitor_intel", label: "Competitor Intel" },
    { value: "regulatory", label: "Regulatory" },
    { value: "market_trends", label: "Market Trends" },
    { value: "technology", label: "Technology" },
    { value: "economic", label: "Economic" },
    { value: "consumer", label: "Consumer" },
    { value: "talent", label: "Talent" },
    { value: "general", label: "General" },
  ];

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={timeframe} onValueChange={(v: any) => setTimeframe(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Past Week</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
            <SelectItem value="quarter">Past Quarter</SelectItem>
            <SelectItem value="year">Past Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {industryCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Strengths</p>
                <p className="text-2xl font-bold text-green-700">
                  {intelligence?.swotSummary.strengths.length || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Weaknesses</p>
                <p className="text-2xl font-bold text-red-700">
                  {intelligence?.swotSummary.weaknesses.length || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Opportunities</p>
                <p className="text-2xl font-bold text-blue-700">
                  {intelligence?.swotSummary.opportunities.length || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Threats</p>
                <p className="text-2xl font-bold text-amber-700">
                  {intelligence?.swotSummary.threats.length || 0}
                </p>
              </div>
              <Target className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Required Alert */}
      {intelligence?.actionRequired && intelligence.actionRequired.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Action Required ({intelligence.actionRequired.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {intelligence.actionRequired.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <Badge className={swotColors[item.swotRelevance as keyof typeof swotColors] || "bg-gray-100"}>
                      {item.swotRelevance}
                    </Badge>
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SWOT Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Threats - Most Important */}
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-700 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Threats Detected
            </CardTitle>
            <CardDescription>External risks from industry monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            {intelligence?.swotSummary.threats.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No threats detected</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {intelligence?.swotSummary.threats.map((item: any) => (
                  <IntelligenceItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Opportunities Found
            </CardTitle>
            <CardDescription>Market trends and growth potential</CardDescription>
          </CardHeader>
          <CardContent>
            {intelligence?.swotSummary.opportunities.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No opportunities found</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {intelligence?.swotSummary.opportunities.map((item: any) => (
                  <IntelligenceItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-700 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Strengths Identified
            </CardTitle>
            <CardDescription>Competitive advantages from research</CardDescription>
          </CardHeader>
          <CardContent>
            {intelligence?.swotSummary.strengths.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No strengths identified</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {intelligence?.swotSummary.strengths.map((item: any) => (
                  <IntelligenceItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Weaknesses Flagged
            </CardTitle>
            <CardDescription>Areas needing improvement</CardDescription>
          </CardHeader>
          <CardContent>
            {intelligence?.swotSummary.weaknesses.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No weaknesses flagged</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {intelligence?.swotSummary.weaknesses.map((item: any) => (
                  <IntelligenceItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {intelligence?.total === 0 && (
        <Card className="p-8">
          <div className="text-center">
            <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Industry Intelligence Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add resource links with SWOT classifications to see industry intelligence here.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// Intelligence Item Component
function IntelligenceItem({ item }: { item: any }) {
  const impactColors = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{item.title}</span>
            {item.isAgentIdentified && (
              <Badge variant="outline" className="text-xs gap-1">
                <Bot className="w-3 h-3" />
                AI
              </Badge>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {item.impactLevel && (
              <Badge className={impactColors[item.impactLevel as keyof typeof impactColors] || "bg-gray-100"}>
                {item.impactLevel}
              </Badge>
            )}
            {item.industryCategory && (
              <Badge variant="outline" className="text-xs">
                {item.industryCategory.replace(/_/g, " ")}
              </Badge>
            )}
            {item.sourceName && (
              <span className="text-xs text-muted-foreground">{item.sourceName}</span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
