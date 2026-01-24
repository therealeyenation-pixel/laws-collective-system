import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  ExternalLink,
  Plus,
  Pin,
  Clock,
  Eye,
  Bookmark,
  AlertTriangle,
  Newspaper,
  FileText,
  Scale,
  TrendingUp,
  Loader2,
  RefreshCw,
} from "lucide-react";

type DashboardType = "health" | "finance" | "legal" | "business" | "education" | "governance" | "hr" | "operations" | "general";

interface ResourceLinksProps {
  dashboard: DashboardType;
  title?: string;
  maxLinks?: number;
  showAddButton?: boolean;
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  recalls: AlertTriangle,
  news: Newspaper,
  research: FileText,
  regulations: Scale,
  trends: TrendingUp,
  default: Bookmark,
};

import { Bot, CheckCircle, XCircle, Sparkles } from "lucide-react";

// Predefined categories per dashboard
const DASHBOARD_CATEGORIES: Record<DashboardType, string[]> = {
  health: ["recalls", "research", "regulations", "news", "wellness"],
  finance: ["regulations", "news", "trends", "tax_updates", "market_analysis"],
  legal: ["regulations", "case_law", "compliance", "news"],
  business: ["news", "trends", "best_practices", "market_research"],
  education: ["research", "curriculum", "news", "resources"],
  governance: ["regulations", "compliance", "best_practices", "news"],
  hr: ["regulations", "best_practices", "news", "training"],
  operations: ["best_practices", "news", "tools", "guides"],
  general: ["news", "resources", "announcements"],
};

export function ResourceLinks({ 
  dashboard, 
  title = "Resource Links", 
  maxLinks = 10,
  showAddButton = true 
}: ResourceLinksProps) {
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
    category: "",
    sourceName: "",
    isPinned: false,
  });

  const utils = trpc.useUtils();

  const { data: links, isLoading, refetch } = trpc.resourceLinks.getByDashboard.useQuery({
    dashboard,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    limit: maxLinks,
  });

  const createMutation = trpc.resourceLinks.create.useMutation({
    onSuccess: () => {
      toast.success("Resource link added successfully");
      setIsAddDialogOpen(false);
      setNewLink({
        title: "",
        url: "",
        description: "",
        category: "",
        sourceName: "",
        isPinned: false,
      });
      utils.resourceLinks.getByDashboard.invalidate({ dashboard });
    },
    onError: (error) => {
      toast.error(`Failed to add link: ${error.message}`);
    },
  });

  const trackClickMutation = trpc.resourceLinks.trackClick.useMutation();

  const handleLinkClick = (linkId: number, url: string) => {
    trackClickMutation.mutate({ id: linkId });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) {
      toast.error("Title and URL are required");
      return;
    }
    
    createMutation.mutate({
      ...newLink,
      dashboard,
      category: newLink.category || undefined,
    });
  };

  const categories = DASHBOARD_CATEGORIES[dashboard] || [];
  const isAdmin = user?.role === "admin" || user?.role === "owner";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            {showAddButton && isAdmin && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="w-4 h-4" />
                    Add Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Resource Link</DialogTitle>
                    <DialogDescription>
                      Add a relevant article, resource, or link for this dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        placeholder="e.g., Product Recalls - ConsumerLab"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">URL *</label>
                      <Input
                        placeholder="https://..."
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder="Brief description of the resource..."
                        value={newLink.description}
                        onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Select
                          value={newLink.category}
                          onValueChange={(value) => setNewLink({ ...newLink, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Source Name</label>
                        <Input
                          placeholder="e.g., ConsumerLab"
                          value={newLink.sourceName}
                          onChange={(e) => setNewLink({ ...newLink, sourceName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPinned"
                        checked={newLink.isPinned}
                        onChange={(e) => setNewLink({ ...newLink, isPinned: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="isPinned" className="text-sm">
                        Pin this link to the top
                      </label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddLink} disabled={createMutation.isPending}>
                        {createMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Link"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            <Badge
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : links && links.length > 0 ? (
          <div className="space-y-2">
            {links.map((link) => {
              const CategoryIcon = CATEGORY_ICONS[link.category || "default"] || CATEGORY_ICONS.default;
              return (
                <div
                  key={link.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleLinkClick(link.id, link.url)}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CategoryIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {link.title}
                      </span>
                      {link.isPinned && (
                        <Pin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      )}
                      {link.isAgentIdentified && (
                        <Badge variant="secondary" className="text-xs py-0 gap-1">
                          <Bot className="w-3 h-3" />
                          AI
                        </Badge>
                      )}
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    {link.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {link.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {link.sourceName && (
                        <span>{link.sourceName}</span>
                      )}
                      {link.category && (
                        <Badge variant="secondary" className="text-xs py-0">
                          {link.category.replace(/_/g, " ")}
                        </Badge>
                      )}
                      {link.clickCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {link.clickCount}
                        </span>
                      )}
                      {link.isAgentIdentified && link.agentConfidence && (
                        <span className="flex items-center gap-1 text-blue-500">
                          <Sparkles className="w-3 h-3" />
                          {Number(link.agentConfidence).toFixed(0)}% match
                        </span>
                      )}
                    </div>
                    {link.isAgentIdentified && link.agentReason && (
                      <p className="text-xs text-blue-500/70 mt-1 italic">
                        "{link.agentReason}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No resource links yet</p>
            {isAdmin && (
              <p className="text-xs mt-1">Click "Add Link" to add relevant resources</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ResourceLinks;
