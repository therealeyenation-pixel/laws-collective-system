import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { 
  Plus, Sparkles, Zap, Bug, Shield, AlertTriangle, 
  Edit, Trash2, Eye, EyeOff, Check, Clock, Calendar,
  FileText, Tag, Megaphone
} from "lucide-react";

interface ChangelogEntry {
  id: number;
  version: string;
  title: string;
  description?: string | null;
  changeType: "feature" | "improvement" | "fix" | "security" | "breaking";
  category?: string | null;
  highlights?: string[] | null;
  releaseDate: Date;
  isPublished: boolean;
  isMajor: boolean;
  createdAt: Date;
}

export default function Changelog() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("published");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    version: "",
    title: "",
    description: "",
    changeType: "feature" as const,
    category: "",
    highlights: "",
    isMajor: false,
    isPublished: false,
  });

  const isAdmin = user?.role === "admin" || user?.role === "owner";

  const { data: publishedEntries, refetch: refetchPublished } = trpc.changelog.getPublished.useQuery({
    limit: 50,
  });

  const { data: allEntries, refetch: refetchAll } = trpc.changelog.getAll.useQuery(
    { limit: 100 },
    { enabled: isAdmin }
  );

  const createMutation = trpc.changelog.create.useMutation({
    onSuccess: () => {
      toast.success("Changelog entry created");
      setShowCreateDialog(false);
      resetForm();
      refetchPublished();
      refetchAll();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.changelog.update.useMutation({
    onSuccess: () => {
      toast.success("Changelog entry updated");
      setEditingEntry(null);
      resetForm();
      refetchPublished();
      refetchAll();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.changelog.delete.useMutation({
    onSuccess: () => {
      toast.success("Changelog entry deleted");
      refetchPublished();
      refetchAll();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const publishMutation = trpc.changelog.publish.useMutation({
    onSuccess: () => {
      toast.success("Changelog entry published");
      refetchPublished();
      refetchAll();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      version: "",
      title: "",
      description: "",
      changeType: "feature",
      category: "",
      highlights: "",
      isMajor: false,
      isPublished: false,
    });
  };

  const handleCreate = () => {
    const highlights = formData.highlights
      .split("\n")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    createMutation.mutate({
      ...formData,
      highlights: highlights.length > 0 ? highlights : undefined,
      category: formData.category || undefined,
      description: formData.description || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingEntry) return;

    const highlights = formData.highlights
      .split("\n")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    updateMutation.mutate({
      id: editingEntry.id,
      ...formData,
      highlights: highlights.length > 0 ? highlights : undefined,
      category: formData.category || undefined,
      description: formData.description || undefined,
    });
  };

  const handleEdit = (entry: ChangelogEntry) => {
    setEditingEntry(entry);
    setFormData({
      version: entry.version,
      title: entry.title,
      description: entry.description || "",
      changeType: entry.changeType,
      category: entry.category || "",
      highlights: entry.highlights?.join("\n") || "",
      isMajor: entry.isMajor,
      isPublished: entry.isPublished,
    });
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Sparkles className="w-4 h-4" />;
      case "improvement":
        return <Zap className="w-4 h-4" />;
      case "fix":
        return <Bug className="w-4 h-4" />;
      case "security":
        return <Shield className="w-4 h-4" />;
      case "breaking":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getChangeTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      feature: "bg-green-100 text-green-800",
      improvement: "bg-blue-100 text-blue-800",
      fix: "bg-amber-100 text-amber-800",
      security: "bg-purple-100 text-purple-800",
      breaking: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const renderEntryCard = (entry: ChangelogEntry, showActions = false) => (
    <Card key={entry.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-mono">
              v{entry.version}
            </Badge>
            <Badge className={getChangeTypeBadge(entry.changeType)}>
              {getChangeTypeIcon(entry.changeType)}
              <span className="ml-1 capitalize">{entry.changeType}</span>
            </Badge>
            {entry.isMajor && (
              <Badge className="bg-primary text-primary-foreground">
                Major
              </Badge>
            )}
            {entry.category && (
              <Badge variant="secondary">{entry.category}</Badge>
            )}
            {!entry.isPublished && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                <EyeOff className="w-3 h-3 mr-1" />
                Draft
              </Badge>
            )}
          </div>
          {showActions && isAdmin && (
            <div className="flex items-center gap-1">
              {!entry.isPublished && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => publishMutation.mutate({ id: entry.id })}
                >
                  <Megaphone className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(entry)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this entry?")) {
                    deleteMutation.mutate({ id: entry.id });
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        <CardTitle className="text-lg">{entry.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-xs">
          <Calendar className="w-3 h-3" />
          {new Date(entry.releaseDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entry.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {entry.description}
          </p>
        )}
        {entry.highlights && entry.highlights.length > 0 && (
          <ul className="space-y-1">
            {entry.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="version">Version *</Label>
          <Input
            id="version"
            placeholder="1.0.0"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="changeType">Change Type *</Label>
          <Select
            value={formData.changeType}
            onValueChange={(value: any) => setFormData({ ...formData, changeType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feature">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Feature
                </div>
              </SelectItem>
              <SelectItem value="improvement">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Improvement
                </div>
              </SelectItem>
              <SelectItem value="fix">
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4" /> Bug Fix
                </div>
              </SelectItem>
              <SelectItem value="security">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Security
                </div>
              </SelectItem>
              <SelectItem value="breaking">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Breaking Change
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="What's new in this update?"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Provide more details about this update..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          placeholder="e.g., Dashboard, Simulator, API"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="highlights">Highlights (one per line)</Label>
        <Textarea
          id="highlights"
          placeholder="Added new feature X&#10;Improved performance of Y&#10;Fixed issue with Z"
          value={formData.highlights}
          onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
          rows={4}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="isMajor"
            checked={formData.isMajor}
            onCheckedChange={(checked) => setFormData({ ...formData, isMajor: checked })}
          />
          <Label htmlFor="isMajor">Major Update</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isPublished"
            checked={formData.isPublished}
            onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
          />
          <Label htmlFor="isPublished">Publish Immediately</Label>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Changelog</h1>
            <p className="text-muted-foreground">
              Track updates, new features, and improvements
            </p>
          </div>
          {isAdmin && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Changelog Entry</DialogTitle>
                </DialogHeader>
                {renderForm()}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!formData.version || !formData.title}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="published">
                <Eye className="w-4 h-4 mr-2" />
                Published
              </TabsTrigger>
              <TabsTrigger value="all">
                <FileText className="w-4 h-4 mr-2" />
                All Entries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="published" className="mt-6">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {publishedEntries?.map((entry) => renderEntryCard(entry as ChangelogEntry, true))}
                {(!publishedEntries || publishedEntries.length === 0) && (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No published entries yet</p>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {allEntries?.map((entry) => renderEntryCard(entry as ChangelogEntry, true))}
                {(!allEntries || allEntries.length === 0) && (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No entries yet</p>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            {publishedEntries?.map((entry) => renderEntryCard(entry as ChangelogEntry))}
            {(!publishedEntries || publishedEntries.length === 0) && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No updates yet</p>
              </Card>
            )}
          </ScrollArea>
        )}

        {/* Edit Dialog */}
        {editingEntry && (
          <Dialog open={!!editingEntry} onOpenChange={() => {
            setEditingEntry(null);
            resetForm();
          }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Changelog Entry</DialogTitle>
              </DialogHeader>
              {renderForm()}
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setEditingEntry(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={!formData.version || !formData.title}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
