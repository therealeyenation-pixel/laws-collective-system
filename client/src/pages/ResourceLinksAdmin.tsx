import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Pin,
  Bot,
  Shield,
  AlertTriangle,
  TrendingUp,
  Target,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Loader2,
  Link as LinkIcon,
  Globe,
  BookOpen,
  Scale,
  DollarSign,
  Heart,
  GraduationCap,
  Users,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

type Dashboard = "health" | "finance" | "legal" | "business" | "education" | "hr";
type SwotRelevance = "strength" | "weakness" | "opportunity" | "threat" | null;
type ApprovalStatus = "pending" | "approved" | "rejected";

interface ResourceLink {
  id: number;
  title: string;
  url: string;
  description: string | null;
  dashboard: Dashboard;
  category: string | null;
  tags: string | null;
  priority: number;
  isPinned: boolean;
  sourceName: string | null;
  isAgentIdentified: boolean;
  agentConfidence: number | null;
  approvalStatus: ApprovalStatus;
  swotRelevance: SwotRelevance;
  swotReason: string | null;
  industryCategory: string | null;
  impactLevel: string | null;
  requiresAction: boolean;
  clickCount: number;
  createdAt: Date;
}

const dashboardConfig: Record<Dashboard, { label: string; icon: React.ReactNode; color: string }> = {
  health: { label: "Health", icon: <Heart className="w-4 h-4" />, color: "text-red-500" },
  finance: { label: "Finance", icon: <DollarSign className="w-4 h-4" />, color: "text-green-500" },
  legal: { label: "Legal", icon: <Scale className="w-4 h-4" />, color: "text-blue-500" },
  business: { label: "Business", icon: <Briefcase className="w-4 h-4" />, color: "text-purple-500" },
  education: { label: "Education", icon: <GraduationCap className="w-4 h-4" />, color: "text-amber-500" },
  hr: { label: "HR", icon: <Users className="w-4 h-4" />, color: "text-cyan-500" },
};

const swotConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  strength: { label: "Strength", icon: <Shield className="w-4 h-4" />, color: "bg-green-100 text-green-800" },
  weakness: { label: "Weakness", icon: <AlertTriangle className="w-4 h-4" />, color: "bg-red-100 text-red-800" },
  opportunity: { label: "Opportunity", icon: <TrendingUp className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" },
  threat: { label: "Threat", icon: <Target className="w-4 h-4" />, color: "bg-amber-100 text-amber-800" },
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

export default function ResourceLinksAdmin() {
  const [activeTab, setActiveTab] = useState<"all" | Dashboard>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ApprovalStatus>("all");
  const [filterSwot, setFilterSwot] = useState<"all" | string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ResourceLink | null>(null);
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
    dashboard: "health" as Dashboard,
    category: "",
    tags: "",
    priority: 5,
    isPinned: false,
    sourceName: "",
    swotRelevance: "" as string,
    swotReason: "",
    industryCategory: "",
    impactLevel: "",
    requiresAction: false,
  });

  const utils = trpc.useUtils();

  // Fetch links for all dashboards
  const { data: healthLinks } = trpc.resourceLinks.getByDashboard.useQuery({ dashboard: "health" });
  const { data: financeLinks } = trpc.resourceLinks.getByDashboard.useQuery({ dashboard: "finance" });
  const { data: legalLinks } = trpc.resourceLinks.getByDashboard.useQuery({ dashboard: "legal" });
  const { data: businessLinks } = trpc.resourceLinks.getByDashboard.useQuery({ dashboard: "business" });
  const { data: educationLinks } = trpc.resourceLinks.getByDashboard.useQuery({ dashboard: "education" });
  const { data: hrLinks } = trpc.resourceLinks.getByDashboard.useQuery({ dashboard: "hr" });

  const allLinks = [
    ...(healthLinks || []),
    ...(financeLinks || []),
    ...(legalLinks || []),
    ...(businessLinks || []),
    ...(educationLinks || []),
    ...(hrLinks || []),
  ];

  const createLink = trpc.resourceLinks.create.useMutation({
    onSuccess: () => {
      toast.success("Resource link created");
      setIsAddDialogOpen(false);
      resetForm();
      utils.resourceLinks.getByDashboard.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateLink = trpc.resourceLinks.update.useMutation({
    onSuccess: () => {
      toast.success("Resource link updated");
      setEditingLink(null);
      utils.resourceLinks.getByDashboard.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteLink = trpc.resourceLinks.delete.useMutation({
    onSuccess: () => {
      toast.success("Resource link deleted");
      utils.resourceLinks.getByDashboard.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const approveLink = trpc.resourceLinks.approve.useMutation({
    onSuccess: () => {
      toast.success("Resource link approved");
      utils.resourceLinks.getByDashboard.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectLink = trpc.resourceLinks.reject.useMutation({
    onSuccess: () => {
      toast.success("Resource link rejected");
      utils.resourceLinks.getByDashboard.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setNewLink({
      title: "",
      url: "",
      description: "",
      dashboard: "health",
      category: "",
      tags: "",
      priority: 5,
      isPinned: false,
      sourceName: "",
      swotRelevance: "",
      swotReason: "",
      industryCategory: "",
      impactLevel: "",
      requiresAction: false,
    });
  };

  const handleCreate = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast.error("Title and URL are required");
      return;
    }
    createLink.mutate({
      ...newLink,
      swotRelevance: newLink.swotRelevance || undefined,
      industryCategory: newLink.industryCategory || undefined,
      impactLevel: newLink.impactLevel || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingLink) return;
    updateLink.mutate({
      id: editingLink.id,
      title: editingLink.title,
      url: editingLink.url,
      description: editingLink.description || undefined,
      category: editingLink.category || undefined,
      priority: editingLink.priority,
      isPinned: editingLink.isPinned,
      swotRelevance: editingLink.swotRelevance || undefined,
      swotReason: editingLink.swotReason || undefined,
      industryCategory: editingLink.industryCategory || undefined,
      impactLevel: editingLink.impactLevel || undefined,
      requiresAction: editingLink.requiresAction,
    });
  };

  // Filter links
  const filteredLinks = allLinks.filter((link) => {
    if (activeTab !== "all" && link.dashboard !== activeTab) return false;
    if (filterStatus !== "all" && link.approvalStatus !== filterStatus) return false;
    if (filterSwot !== "all" && link.swotRelevance !== filterSwot) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        link.title.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        link.description?.toLowerCase().includes(query) ||
        link.sourceName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: allLinks.length,
    pending: allLinks.filter((l) => l.approvalStatus === "pending").length,
    agentIdentified: allLinks.filter((l) => l.isAgentIdentified).length,
    requiresAction: allLinks.filter((l) => l.requiresAction).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Resource Links Management</h1>
            <p className="text-muted-foreground">
              Manage curated resource links across all department dashboards
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Resource Link
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Resource Link</DialogTitle>
                  <DialogDescription>
                    Add a curated resource link to a department dashboard
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Resource title"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dashboard">Dashboard *</Label>
                      <Select
                        value={newLink.dashboard}
                        onValueChange={(v: Dashboard) => setNewLink({ ...newLink, dashboard: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(dashboardConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                {config.icon}
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com/resource"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this resource..."
                      value={newLink.description}
                      onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sourceName">Source Name</Label>
                      <Input
                        id="sourceName"
                        placeholder="e.g., FDA, IRS, CDC"
                        value={newLink.sourceName}
                        onChange={(e) => setNewLink({ ...newLink, sourceName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Recalls & Alerts"
                        value={newLink.category}
                        onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* SWOT Classification */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">SWOT Classification</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>SWOT Relevance</Label>
                        <Select
                          value={newLink.swotRelevance}
                          onValueChange={(v) => setNewLink({ ...newLink, swotRelevance: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select SWOT type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="strength">Strength</SelectItem>
                            <SelectItem value="weakness">Weakness</SelectItem>
                            <SelectItem value="opportunity">Opportunity</SelectItem>
                            <SelectItem value="threat">Threat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Industry Category</Label>
                        <Select
                          value={newLink.industryCategory}
                          onValueChange={(v) => setNewLink({ ...newLink, industryCategory: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {industryCategories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label>SWOT Reason</Label>
                      <Textarea
                        placeholder="Why is this relevant to SWOT analysis?"
                        value={newLink.swotReason}
                        onChange={(e) => setNewLink({ ...newLink, swotReason: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label>Impact Level</Label>
                        <Select
                          value={newLink.impactLevel}
                          onValueChange={(v) => setNewLink({ ...newLink, impactLevel: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select impact" />
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
                        <Label>Priority (1-10)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={newLink.priority}
                          onChange={(e) => setNewLink({ ...newLink, priority: parseInt(e.target.value) || 5 })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Pin to Top</Label>
                        <p className="text-xs text-muted-foreground">Show this link at the top of the list</p>
                      </div>
                      <Switch
                        checked={newLink.isPinned}
                        onCheckedChange={(checked) => setNewLink({ ...newLink, isPinned: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Requires Action</Label>
                        <p className="text-xs text-muted-foreground">Flag this link as requiring follow-up</p>
                      </div>
                      <Switch
                        checked={newLink.requiresAction}
                        onCheckedChange={(checked) => setNewLink({ ...newLink, requiresAction: checked })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={createLink.isPending}>
                    {createLink.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Link"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Links</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.agentIdentified}</p>
                <p className="text-xs text-muted-foreground">Agent Identified</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.requiresAction}</p>
                <p className="text-xs text-muted-foreground">Requires Action</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search links..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSwot} onValueChange={(v) => setFilterSwot(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="SWOT Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SWOT</SelectItem>
                <SelectItem value="strength">Strengths</SelectItem>
                <SelectItem value="weakness">Weaknesses</SelectItem>
                <SelectItem value="opportunity">Opportunities</SelectItem>
                <SelectItem value="threat">Threats</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList>
            <TabsTrigger value="all">
              <Globe className="w-4 h-4 mr-2" />
              All ({allLinks.length})
            </TabsTrigger>
            {Object.entries(dashboardConfig).map(([key, config]) => {
              const count = allLinks.filter((l) => l.dashboard === key).length;
              return (
                <TabsTrigger key={key} value={key}>
                  <span className={config.color}>{config.icon}</span>
                  <span className="ml-2">{config.label} ({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredLinks.length === 0 ? (
              <Card className="p-8">
                <div className="text-center">
                  <LinkIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Resource Links Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterStatus !== "all" || filterSwot !== "all"
                      ? "Try adjusting your filters"
                      : "Add your first resource link to get started"}
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource Link
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredLinks.map((link) => (
                  <Card key={link.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {link.isPinned && <Pin className="w-4 h-4 text-amber-500" />}
                          <span className="font-medium">{link.title}</span>
                          {link.isAgentIdentified && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Bot className="w-3 h-3" />
                              AI
                            </Badge>
                          )}
                          <Badge className={dashboardConfig[link.dashboard as Dashboard]?.color || ""}>
                            {dashboardConfig[link.dashboard as Dashboard]?.label || link.dashboard}
                          </Badge>
                          {link.swotRelevance && swotConfig[link.swotRelevance] && (
                            <Badge className={swotConfig[link.swotRelevance].color}>
                              {swotConfig[link.swotRelevance].icon}
                              <span className="ml-1">{swotConfig[link.swotRelevance].label}</span>
                            </Badge>
                          )}
                          {link.requiresAction && (
                            <Badge variant="destructive" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {link.url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {link.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{link.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {link.sourceName && <span>Source: {link.sourceName}</span>}
                          {link.category && <span>Category: {link.category}</span>}
                          <span>Clicks: {link.clickCount}</span>
                          <span>Priority: {link.priority}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {link.approvalStatus === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600"
                              onClick={() => approveLink.mutate({ id: link.id })}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => rejectLink.mutate({ id: link.id })}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLink(link as any)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => {
                            if (confirm("Delete this resource link?")) {
                              deleteLink.mutate({ id: link.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Resource Link</DialogTitle>
            </DialogHeader>
            {editingLink && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editingLink.title}
                    onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={editingLink.url}
                    onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editingLink.description || ""}
                    onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SWOT Relevance</Label>
                    <Select
                      value={editingLink.swotRelevance || "none"}
                      onValueChange={(v) => setEditingLink({ ...editingLink, swotRelevance: v === "none" ? null : v as SwotRelevance })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="weakness">Weakness</SelectItem>
                        <SelectItem value="opportunity">Opportunity</SelectItem>
                        <SelectItem value="threat">Threat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Impact Level</Label>
                    <Select
                      value={editingLink.impactLevel || "none"}
                      onValueChange={(v) => setEditingLink({ ...editingLink, impactLevel: v === "none" ? null : v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>SWOT Reason</Label>
                  <Textarea
                    value={editingLink.swotReason || ""}
                    onChange={(e) => setEditingLink({ ...editingLink, swotReason: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pin to Top</Label>
                  </div>
                  <Switch
                    checked={editingLink.isPinned}
                    onCheckedChange={(checked) => setEditingLink({ ...editingLink, isPinned: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Requires Action</Label>
                  </div>
                  <Switch
                    checked={editingLink.requiresAction}
                    onCheckedChange={(checked) => setEditingLink({ ...editingLink, requiresAction: checked })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingLink(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateLink.isPending}>
                {updateLink.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
