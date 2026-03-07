import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, FileText, ClipboardList, Users, DollarSign, Building2,
  GraduationCap, Briefcase, Calendar, Clock, Star, X, ArrowRight,
  Command, History, Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "document" | "task" | "employee" | "contract" | "training" | "business" | "event";
  path: string;
  metadata?: Record<string, string>;
  relevance: number;
}

interface RecentSearch {
  id: string;
  query: string;
  timestamp: Date;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: string[];
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Recent and saved searches
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([
    { id: "1", query: "Q4 budget report", timestamp: new Date(Date.now() - 3600000) },
    { id: "2", query: "employee onboarding", timestamp: new Date(Date.now() - 86400000) },
    { id: "3", query: "contract renewal", timestamp: new Date(Date.now() - 172800000) },
  ]);

  const [savedSearches] = useState<SavedSearch[]>([
    { id: "1", name: "Pending Approvals", query: "status:pending type:approval", filters: ["task"] },
    { id: "2", name: "Recent Documents", query: "created:last7days", filters: ["document"] },
  ]);

  // Sample search results (in production, this would be an API call)
  const sampleResults: SearchResult[] = [
    { id: "1", title: "Q4 Budget Proposal", description: "Financial planning document for Q4 2025", type: "document", path: "/document-vault", relevance: 95 },
    { id: "2", title: "Review Budget Allocation", description: "Task assigned by Sarah Johnson", type: "task", path: "/my-tasks", relevance: 90 },
    { id: "3", title: "Budget Training Module", description: "Financial literacy course - Module 3", type: "training", path: "/training-hub", relevance: 85 },
    { id: "4", title: "Michael Chen", description: "Finance Department - Budget Analyst", type: "employee", path: "/employee-directory", relevance: 80 },
    { id: "5", title: "Annual Budget Meeting", description: "Scheduled for Jan 30, 2026", type: "event", path: "/company-calendar", relevance: 75 },
    { id: "6", title: "Budget Services Contract", description: "Vendor agreement for consulting services", type: "contract", path: "/contracts-dashboard", relevance: 70 },
    { id: "7", title: "The The L.A.W.S. Collective Budget", description: "Entity financial overview", type: "business", path: "/business", relevance: 65 },
  ];

  const typeIcons: Record<string, React.ReactNode> = {
    document: <FileText className="w-4 h-4" />,
    task: <ClipboardList className="w-4 h-4" />,
    employee: <Users className="w-4 h-4" />,
    contract: <Briefcase className="w-4 h-4" />,
    training: <GraduationCap className="w-4 h-4" />,
    business: <Building2 className="w-4 h-4" />,
    event: <Calendar className="w-4 h-4" />,
  };

  const typeColors: Record<string, string> = {
    document: "bg-blue-100 text-blue-700",
    task: "bg-green-100 text-green-700",
    employee: "bg-purple-100 text-purple-700",
    contract: "bg-orange-100 text-orange-700",
    training: "bg-yellow-100 text-yellow-700",
    business: "bg-red-100 text-red-700",
    event: "bg-pink-100 text-pink-700",
  };

  // Search function
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const filtered = sampleResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "all" || result.type === activeFilter;
        return matchesQuery && matchesFilter;
      });
      setResults(filtered);
      setSelectedIndex(0);
      setLoading(false);
    }, 200);
  }, [activeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case "Escape":
          onOpenChange(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, results, selectedIndex, onOpenChange]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleResultClick = (result: SearchResult) => {
    // Add to recent searches
    const newRecent: RecentSearch = {
      id: Date.now().toString(),
      query: query,
      timestamp: new Date(),
    };
    setRecentSearches(prev => [newRecent, ...prev.slice(0, 4)]);
    
    // Navigate and close
    setLocation(result.path);
    onOpenChange(false);
    setQuery("");
  };

  const handleRecentClick = (recent: RecentSearch) => {
    setQuery(recent.query);
  };

  const handleSavedClick = (saved: SavedSearch) => {
    setQuery(saved.query);
    if (saved.filters.length > 0) {
      setActiveFilter(saved.filters[0]);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents, tasks, employees, contracts..."
              className="pl-10 pr-10 h-12 text-base"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Filter Tabs */}
        <div className="px-4 py-2 border-b">
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-2 h-6">All</TabsTrigger>
              <TabsTrigger value="document" className="text-xs px-2 h-6">Documents</TabsTrigger>
              <TabsTrigger value="task" className="text-xs px-2 h-6">Tasks</TabsTrigger>
              <TabsTrigger value="employee" className="text-xs px-2 h-6">People</TabsTrigger>
              <TabsTrigger value="contract" className="text-xs px-2 h-6">Contracts</TabsTrigger>
              <TabsTrigger value="training" className="text-xs px-2 h-6">Training</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="max-h-[400px]">
          {/* No query - show recent and saved */}
          {!query && (
            <div className="p-4 space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <History className="w-4 h-4" />
                      Recent Searches
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearRecentSearches}>
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((recent) => (
                      <button
                        key={recent.id}
                        onClick={() => handleRecentClick(recent)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-sm">{recent.query}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Searches */}
              {savedSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Bookmark className="w-4 h-4" />
                    Saved Searches
                  </div>
                  <div className="space-y-1">
                    {savedSearches.map((saved) => (
                      <button
                        key={saved.id}
                        onClick={() => handleSavedClick(saved)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="flex-1 text-sm">{saved.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {saved.filters[0]}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyboard Shortcuts */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Keyboard Shortcuts</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>
                    <span>Close</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && query && (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          )}

          {/* Search Results */}
          {!loading && query && results.length > 0 && (
            <div className="p-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left",
                    index === selectedIndex ? "bg-primary/10" : "hover:bg-muted"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", typeColors[result.type])}>
                    {typeIcons[result.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{result.title}</p>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {result.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{result.relevance}%</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium">No results found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/50 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Command className="w-3 h-3" />
            <span>+</span>
            <kbd className="px-1 py-0.5 bg-background rounded text-[10px]">K</kbd>
            <span className="ml-1">to open search</span>
          </div>
          {query && results.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to use global search with keyboard shortcut
export function useGlobalSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { open, setOpen };
}
