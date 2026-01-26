import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Bell,
  ExternalLink,
  FileSignature,
  ListTodo,
  MoreVertical,
  Pause,
  Play,
  Newspaper,
  Bot,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info,
  Zap,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type DashboardType = "health" | "finance" | "legal" | "business" | "education" | "governance" | "hr" | "operations" | "general";

interface TickerItem {
  id: number;
  title: string;
  description?: string;
  url: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  source: "admin" | "agent";
  swotType?: "strength" | "weakness" | "opportunity" | "threat";
  createdAt: string;
}

interface LiveTickerProps {
  department: DashboardType;
  className?: string;
}

// Mock data for demonstration - will be replaced with real data
const mockTickerItems: TickerItem[] = [
  {
    id: 1,
    title: "FDA Issues Recall on Dietary Supplements",
    description: "Multiple brands affected due to undeclared ingredients. Check ConsumerLab for full list.",
    url: "https://www.consumerlab.com/recalls/",
    category: "health",
    priority: "critical",
    source: "admin",
    swotType: "threat",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "New Tax Filing Deadline Extension Announced",
    description: "IRS extends deadline for certain business filings to April 18th.",
    url: "https://www.irs.gov/newsroom",
    category: "finance",
    priority: "high",
    source: "agent",
    swotType: "opportunity",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "OSHA Updates Workplace Safety Guidelines",
    description: "New requirements for remote work environments take effect March 1st.",
    url: "https://www.osha.gov/news",
    category: "legal",
    priority: "medium",
    source: "agent",
    swotType: "threat",
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Grant Opportunity: Community Development Block Grant",
    description: "HUD announces $3.3 billion in CDBG funding for 2026.",
    url: "https://www.hud.gov/program_offices/comm_planning/cdbg",
    category: "finance",
    priority: "high",
    source: "agent",
    swotType: "opportunity",
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: "Cybersecurity Alert: New Phishing Campaign Targeting Nonprofits",
    description: "FBI warns of sophisticated email attacks impersonating grant agencies.",
    url: "https://www.cisa.gov/news-events/alerts",
    category: "technology",
    priority: "critical",
    source: "admin",
    swotType: "threat",
    createdAt: new Date().toISOString(),
  },
];

const priorityConfig = {
  critical: { color: "bg-red-500", icon: AlertTriangle, label: "Critical" },
  high: { color: "bg-orange-500", icon: AlertCircle, label: "High" },
  medium: { color: "bg-yellow-500", icon: Bell, label: "Medium" },
  low: { color: "bg-blue-500", icon: Info, label: "Low" },
};

const swotColors = {
  strength: "text-green-500",
  weakness: "text-red-500",
  opportunity: "text-blue-500",
  threat: "text-orange-500",
};

export function LiveTicker({ department, className = "" }: LiveTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<TickerItem | null>(null);
  const [showReadSignDialog, setShowReadSignDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [hasReadArticle, setHasReadArticle] = useState(false);
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Article acknowledgment mutations
  const markAsReadMutation = trpc.articleAcknowledgment.markAsRead.useMutation();
  const signArticleMutation = trpc.articleAcknowledgment.signArticle.useMutation();

  // Fetch resource links from database
  const { data: dbLinks, isLoading } = trpc.resourceLinks.getByDashboard.useQuery({
    dashboard: department,
    limit: 20,
  });

  // Transform database links to ticker items, fallback to mock data if empty
  const filteredItems: TickerItem[] = dbLinks && dbLinks.length > 0 
    ? dbLinks.map(link => ({
        id: link.id,
        title: link.title,
        description: link.description || undefined,
        url: link.url,
        category: link.category || department,
        priority: link.priority >= 8 ? "critical" : link.priority >= 5 ? "high" : link.priority >= 3 ? "medium" : "low",
        source: link.isAgentIdentified ? "agent" as const : "admin" as const,
        swotType: link.swotType as "strength" | "weakness" | "opportunity" | "threat" | undefined,
        createdAt: link.createdAt?.toISOString() || new Date().toISOString(),
      }))
    : mockTickerItems.filter(item => 
        item.category === department || 
        department === "general" || 
        ["health", "finance", "legal"].includes(department)
      )

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || filteredItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
    }, 5000); // Change item every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused, filteredItems.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handleOpenArticle = (item: TickerItem) => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const handleConvertToReadSign = async (item: TickerItem) => {
    setSelectedItem(item);
    setHasReadArticle(false);
    setShowReadSignDialog(true);
    
    // Mark as read when dialog opens
    try {
      await markAsReadMutation.mutateAsync({
        articleId: `ticker-${item.id}`,
        articleTitle: item.title,
        articleType: item.category === 'legal' ? 'compliance' : 
                     item.category === 'finance' ? 'policy' : 'announcement',
        department: department
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleAddToTaskList = (item: TickerItem) => {
    setSelectedItem(item);
    setShowTaskDialog(true);
  };

  const confirmReadSign = async () => {
    if (!selectedItem || !hasReadArticle) return;
    
    setIsSigningInProgress(true);
    try {
      const result = await signArticleMutation.mutateAsync({
        articleId: `ticker-${selectedItem.id}`,
        articleTitle: selectedItem.title,
        articleType: selectedItem.category === 'legal' ? 'compliance' : 
                     selectedItem.category === 'finance' ? 'policy' : 'announcement',
        department: department,
        ipAddress: undefined,
        userAgent: navigator.userAgent
      });
      
      toast.success(`"${selectedItem.title}" signed successfully`, {
        description: `Signature hash: ${result.signatureHash?.substring(0, 12)}...`
      });
      setShowReadSignDialog(false);
      setSelectedItem(null);
      setHasReadArticle(false);
    } catch (error) {
      toast.error('Failed to sign article. Please try again.');
    } finally {
      setIsSigningInProgress(false);
    }
  };

  const confirmAddTask = () => {
    if (selectedItem) {
      toast.success(`Task created: Review "${selectedItem.title}"`);
      setShowTaskDialog(false);
      setSelectedItem(null);
    }
  };

  if (filteredItems.length === 0) {
    return null;
  }

  const currentItem = filteredItems[currentIndex];
  const PriorityIcon = priorityConfig[currentItem.priority].icon;

  return (
    <>
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <div className="flex items-center">
            {/* Priority indicator */}
            <div className={`${priorityConfig[currentItem.priority].color} p-3 flex items-center justify-center`}>
              <PriorityIcon className="w-5 h-5 text-white" />
            </div>

            {/* Ticker content */}
            <div 
              ref={tickerRef}
              className="flex-1 px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedItem(currentItem)}
            >
              <div className="flex items-center gap-2">
                {currentItem.source === "agent" && (
                  <Bot className="w-4 h-4 text-purple-500" title="Agent Identified" />
                )}
                {currentItem.swotType && (
                  <Badge variant="outline" className={`text-xs ${swotColors[currentItem.swotType]}`}>
                    {currentItem.swotType.toUpperCase()}
                  </Badge>
                )}
                <span className="font-medium text-sm truncate">{currentItem.title}</span>
              </div>
              {currentItem.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {currentItem.description}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 px-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenArticle(currentItem)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Read Article
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleConvertToReadSign(currentItem)}>
                    <FileSignature className="w-4 h-4 mr-2" />
                    Convert to Read & Sign
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddToTaskList(currentItem)}>
                    <ListTodo className="w-4 h-4 mr-2" />
                    Add to Task List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Progress indicator */}
            <div className="flex gap-1 px-2">
              {filteredItems.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedItem && !showReadSignDialog && !showTaskDialog} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge className={priorityConfig[selectedItem?.priority || "low"].color}>
                {priorityConfig[selectedItem?.priority || "low"].label}
              </Badge>
              {selectedItem?.source === "agent" && (
                <Badge variant="outline" className="text-purple-500">
                  <Bot className="w-3 h-3 mr-1" />
                  Agent Identified
                </Badge>
              )}
            </div>
            <DialogTitle className="mt-2">{selectedItem?.title}</DialogTitle>
            <DialogDescription>{selectedItem?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedItem?.swotType && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">SWOT Classification:</span>
                <Badge variant="outline" className={swotColors[selectedItem.swotType]}>
                  {selectedItem.swotType.charAt(0).toUpperCase() + selectedItem.swotType.slice(1)}
                </Badge>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Newspaper className="w-4 h-4" />
              <a 
                href={selectedItem?.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {selectedItem?.url}
              </a>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => selectedItem && handleOpenArticle(selectedItem)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Read Full Article
            </Button>
            <Button variant="outline" onClick={() => selectedItem && handleConvertToReadSign(selectedItem)}>
              <FileSignature className="w-4 h-4 mr-2" />
              Read & Sign
            </Button>
            <Button onClick={() => selectedItem && handleAddToTaskList(selectedItem)}>
              <ListTodo className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Read & Sign Confirmation Dialog */}
      <Dialog open={showReadSignDialog} onOpenChange={(open) => {
        setShowReadSignDialog(open);
        if (!open) setHasReadArticle(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-primary" />
              Read & Sign Document
            </DialogTitle>
            <DialogDescription>
              Please read the content below and confirm your acknowledgment by signing electronically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border">
              <p className="font-semibold text-foreground">{selectedItem?.title}</p>
              <p className="text-sm text-muted-foreground mt-2">{selectedItem?.description}</p>
              {selectedItem?.url && (
                <a 
                  href={selectedItem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  View full article
                </a>
              )}
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Electronic Signature Notice</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                By signing below, you acknowledge that you have read and understood the content above. 
                Your signature will be recorded with a timestamp and unique hash for compliance purposes.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Checkbox 
                id="read-confirm" 
                checked={hasReadArticle}
                onCheckedChange={(checked) => setHasReadArticle(checked === true)}
              />
              <label htmlFor="read-confirm" className="text-sm cursor-pointer">
                I confirm that I have read and understood the content above and agree to sign this document electronically.
              </label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowReadSignDialog(false)} disabled={isSigningInProgress}>
              Cancel
            </Button>
            <Button 
              onClick={confirmReadSign} 
              disabled={!hasReadArticle || isSigningInProgress}
              className="min-w-[140px]"
            >
              {isSigningInProgress ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing...</>
              ) : hasReadArticle ? (
                <><Check className="w-4 h-4 mr-2" />Sign Document</>
              ) : (
                <><FileSignature className="w-4 h-4 mr-2" />Confirm to Sign</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to Task List Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Task List</DialogTitle>
            <DialogDescription>
              Create a task to review and take action on this item.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{selectedItem?.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{selectedItem?.description}</p>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Task will be created with:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Title: Review "{selectedItem?.title}"</li>
                <li>Priority: {selectedItem?.priority}</li>
                <li>Link to source article</li>
                <li>Due date: 7 days from now</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddTask}>
              <ListTodo className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LiveTicker;
