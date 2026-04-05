import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Newspaper,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  ExternalLink,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Bot,
  Check,
  X,
  RefreshCw,
  Loader2,
  Database,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

const departments = [
  { value: "finance", label: "Finance" },
  { value: "legal", label: "Legal" },
  { value: "hr", label: "HR" },
  { value: "operations", label: "Operations" },
  { value: "governance", label: "Governance/Compliance" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "business", label: "Business" },
  { value: "general", label: "General" },
];

const swotTypes = [
  { value: "strength", label: "Strength", icon: TrendingUp, color: "text-green-500" },
  { value: "weakness", label: "Weakness", icon: TrendingDown, color: "text-red-500" },
  { value: "opportunity", label: "Opportunity", icon: Target, color: "text-blue-500" },
  { value: "threat", label: "Threat", icon: Shield, color: "text-orange-500" },
];

const priorityLevels = [
  { value: 1, label: "Low" },
  { value: 3, label: "Medium-Low" },
  { value: 5, label: "Medium" },
  { value: 7, label: "Medium-High" },
  { value: 9, label: "High" },
  { value: 10, label: "Critical" },
];

export default function TickerAdmin() {
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    dashboard: "general",
    category: "",
    priority: 5,
    sourceName: "",
    swotType: "",
    isPinned: false,
  });
  
  // Queries
  const { data: allLinks, isLoading } = trpc.resourceLinks.getAll.useQuery({
    dashboard: selectedDepartment === "all" ? undefined : selectedDepartment,
    includeInactive: true,
  });
  
  const { data: pendingContent } = trpc.resourceLinks.getPendingAgentContent.useQuery({});
  
  // Mutations
  const createMutation = trpc.resourceLinks.create.useMutation({
    onSuccess: () => {
      toast.success("Ticker item created");
      utils.resourceLinks.getAll.invalidate();
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error) => toast.error(`Failed to create: ${error.message}`),
  });
  
  const updateMutation = trpc.resourceLinks.update.useMutation({
    onSuccess: () => {
      toast.success("Ticker item updated");
      utils.resourceLinks.getAll.invalidate();
      setEditingItem(null);
      resetForm();
    },
    onError: (error) => toast.error(`Failed to update: ${error.message}`),
  });
  
  const deleteMutation = trpc.resourceLinks.delete.useMutation({
    onSuccess: () => {
      toast.success("Ticker item deleted");
      utils.resourceLinks.getAll.invalidate();
    },
    onError: (error) => toast.error(`Failed to delete: ${error.message}`),
  });
  
  const reviewMutation = trpc.resourceLinks.reviewAgentContent.useMutation({
    onSuccess: (_, variables) => {
      toast.success(`Content ${variables.action === "approve" ? "approved" : "rejected"}`);
      utils.resourceLinks.getPendingAgentContent.invalidate();
      utils.resourceLinks.getAll.invalidate();
    },
    onError: (error) => toast.error(`Failed to review: ${error.message}`),
  });
  
  const seedMutation = trpc.resourceLinks.seedData.useMutation({
    onSuccess: (result) => {
      toast.success(`Seeded ${result.inserted} items (${result.skipped} skipped)`);
      utils.resourceLinks.getAll.invalidate();
    },
    onError: (error) => toast.error(`Failed to seed: ${error.message}`),
  });
  
  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      description: "",
      dashboard: "general",
      category: "",
      priority: 5,
      sourceName: "",
      swotType: "",
      isPinned: false,
    });
  };
  
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      url: item.url,
      description: item.description || "",
      dashboard: item.dashboard,
      category: item.category || "",
      priority: item.priority || 5,
      sourceName: item.sourceName || "",
      swotType: item.swotType || "",
      isPinned: item.isPinned || false,
    });
  };
  
  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        ...formData,
      });
    } else {
      createMutation.mutate({
        ...formData,
        dashboard: formData.dashboard as any,
      });
    }
  };
  
  const handleToggleActive = (item: any) => {
    updateMutation.mutate({
      id: item.id,
      isActive: !item.isActive,
    });
  };
  
  const handleTogglePinned = (item: any) => {
    updateMutation.mutate({
      id: item.id,
      isPinned: !item.isPinned,
    });
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-primary" />
              Ticker Administration
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage news ticker content across all department dashboards
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
            >
              {seedMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Seed Gov't Data
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Ticker Item</DialogTitle>
                  <DialogDescription>
                    Create a new announcement for the department ticker
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Announcement title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">URL *</Label>
                      <Input
                        id="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the announcement"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Department *</Label>
                      <Select
                        value={formData.dashboard}
                        onValueChange={(v) => setFormData({ ...formData, dashboard: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={String(formData.priority)}
                        onValueChange={(v) => setFormData({ ...formData, priority: Number(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map((p) => (
                            <SelectItem key={p.value} value={String(p.value)}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>SWOT Type</Label>
                      <Select
                        value={formData.swotType}
                        onValueChange={(v) => setFormData({ ...formData, swotType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {swotTypes.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sourceName">Source Name</Label>
                      <Input
                        id="sourceName"
                        value={formData.sourceName}
                        onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                        placeholder="e.g., IRS, DOL, FDA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., tax, compliance"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isPinned}
                      onCheckedChange={(v) => setFormData({ ...formData, isPinned: v })}
                    />
                    <Label>Pin to top of ticker</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.title || !formData.url || createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Pending Agent Content */}
        {pendingContent && pendingContent.length > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Bot className="w-5 h-5" />
                Pending Agent Suggestions ({pendingContent.length})
              </CardTitle>
              <CardDescription>
                Review content suggested by AI agents before publishing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingContent.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-background rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.dashboard} • Confidence: {item.agentConfidence}%
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={() => reviewMutation.mutate({ id: item.id, action: "approve" })}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => reviewMutation.mutate({ id: item.id, action: "reject" })}
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
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <Label>Filter by Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1" />
              <div className="text-sm text-muted-foreground">
                {allLinks?.length || 0} items
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Items Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>SWOT</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allLinks?.map((item) => (
                    <TableRow key={item.id} className={!item.isActive ? "opacity-50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.isPinned && <Pin className="w-3 h-3 text-primary" />}
                          {item.isAgentIdentified && <Bot className="w-3 h-3 text-purple-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm truncate max-w-xs">{item.title}</p>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {new URL(item.url).hostname}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.dashboard}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.sourceName || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.priority >= 8 ? "destructive" : item.priority >= 5 ? "default" : "secondary"}
                        >
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.swotType && (
                          <Badge
                            variant="outline"
                            className={
                              item.swotType === "strength" ? "text-green-500" :
                              item.swotType === "weakness" ? "text-red-500" :
                              item.swotType === "opportunity" ? "text-blue-500" :
                              "text-orange-500"
                            }
                          >
                            {item.swotType}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePinned(item)}>
                              {item.isPinned ? (
                                <>
                                  <PinOff className="w-4 h-4 mr-2" />
                                  Unpin
                                </>
                              ) : (
                                <>
                                  <Pin className="w-4 h-4 mr-2" />
                                  Pin
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(item)}>
                              {item.isActive ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate({ id: item.id })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Ticker Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-url">URL *</Label>
                  <Input
                    id="edit-url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={String(formData.priority)}
                    onValueChange={(v) => setFormData({ ...formData, priority: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map((p) => (
                        <SelectItem key={p.value} value={String(p.value)}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>SWOT Type</Label>
                  <Select
                    value={formData.swotType}
                    onValueChange={(v) => setFormData({ ...formData, swotType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {swotTypes.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-source">Source</Label>
                  <Input
                    id="edit-source"
                    value={formData.sourceName}
                    onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isPinned}
                  onCheckedChange={(v) => setFormData({ ...formData, isPinned: v })}
                />
                <Label>Pin to top</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
