import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search, FileText, ClipboardList, Users, Building2,
  GraduationCap, Briefcase, Calendar, Clock, Star, X, ArrowRight,
  Filter, SortAsc, History, Bookmark, Plus, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "document" | "task" | "employee" | "contract" | "training" | "business" | "event";
  path: string;
  date: string;
  relevance: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: string[];
  createdAt: Date;
}

export default function GlobalSearchPage() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState("all");

  // Recent and saved searches
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Q4 budget report",
    "employee onboarding",
    "contract renewal",
    "training completion",
  ]);

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    { id: "1", name: "Pending Approvals", query: "status:pending", filters: ["task"], createdAt: new Date() },
    { id: "2", name: "Recent Documents", query: "type:document", filters: ["document"], createdAt: new Date() },
  ]);

  // Sample search results
  const sampleResults: SearchResult[] = [
    { id: "1", title: "Q4 Budget Proposal", description: "Financial planning document for Q4 2025", type: "document", path: "/document-vault", date: "Jan 25, 2026", relevance: 95 },
    { id: "2", title: "Review Budget Allocation", description: "Task assigned by Sarah Johnson - Due Jan 30", type: "task", path: "/my-tasks", date: "Jan 24, 2026", relevance: 90 },
    { id: "3", title: "Budget Training Module", description: "Financial literacy course - Module 3: Budgeting Basics", type: "training", path: "/training-hub", date: "Jan 20, 2026", relevance: 85 },
    { id: "4", title: "Michael Chen", description: "Finance Department - Budget Analyst - Active Employee", type: "employee", path: "/employee-directory", date: "Jan 15, 2026", relevance: 80 },
    { id: "5", title: "Annual Budget Meeting", description: "Scheduled for Jan 30, 2026 at 10:00 AM", type: "event", path: "/company-calendar", date: "Jan 30, 2026", relevance: 75 },
    { id: "6", title: "Budget Services Contract", description: "Vendor agreement for consulting services - Active", type: "contract", path: "/contracts-dashboard", date: "Jan 10, 2026", relevance: 70 },
    { id: "7", title: "The The L.A.W.S. Collective Budget", description: "Entity financial overview and allocation details", type: "business", path: "/business", date: "Jan 5, 2026", relevance: 65 },
    { id: "8", title: "Budget Amendment Form", description: "Template for requesting budget changes", type: "document", path: "/document-templates", date: "Dec 20, 2025", relevance: 60 },
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
    document: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    task: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    employee: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    contract: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    training: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    business: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    event: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  };

  // Search function
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      let filtered = sampleResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "all" || result.type === activeFilter;
        return matchesQuery && matchesFilter;
      });

      // Sort results
      if (sortBy === "relevance") {
        filtered.sort((a, b) => b.relevance - a.relevance);
      } else if (sortBy === "date") {
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else if (sortBy === "title") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      }

      setResults(filtered);
      setLoading(false);

      // Add to recent searches
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches(prev => [searchQuery, ...prev.slice(0, 9)]);
      }
    }, 300);
  }, [activeFilter, sortBy, recentSearches]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    setLocation(result.path);
  };

  const saveCurrentSearch = () => {
    if (!query.trim()) {
      toast.error("Enter a search query first");
      return;
    }
    const newSaved: SavedSearch = {
      id: Date.now().toString(),
      name: query,
      query: query,
      filters: activeFilter !== "all" ? [activeFilter] : [],
      createdAt: new Date(),
    };
    setSavedSearches(prev => [...prev, newSaved]);
    toast.success("Search saved");
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
    toast.success("Saved search removed");
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    toast.success("Recent searches cleared");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Global Search</h1>
          <p className="text-muted-foreground">
            Search across all documents, tasks, employees, contracts, and more
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
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
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && "bg-primary/10")}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button onClick={saveCurrentSearch}>
                <Star className="w-4 h-4 mr-2" />
                Save Search
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Select value={activeFilter} onValueChange={setActiveFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                      <SelectItem value="task">Tasks</SelectItem>
                      <SelectItem value="employee">Employees</SelectItem>
                      <SelectItem value="contract">Contracts</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="event">Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Recent & Saved */}
          <div className="space-y-4">
            {/* Recent Searches */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent Searches
                  </CardTitle>
                  {recentSearches.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearRecentSearches}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {recentSearches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent searches</p>
                ) : (
                  <div className="space-y-1">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left text-sm"
                      >
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="truncate">{search}</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Searches */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  Saved Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedSearches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved searches</p>
                ) : (
                  <div className="space-y-1">
                    {savedSearches.map((saved) => (
                      <div
                        key={saved.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <button
                          onClick={() => {
                            setQuery(saved.query);
                            if (saved.filters.length > 0) {
                              setActiveFilter(saved.filters[0]);
                            }
                          }}
                          className="flex-1 flex items-center gap-2 text-left text-sm"
                        >
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="truncate">{saved.name}</span>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => deleteSavedSearch(saved.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Filters */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quick Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["document", "task", "employee", "contract", "training"].map((type) => (
                    <Badge
                      key={type}
                      variant={activeFilter === type ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => setActiveFilter(activeFilter === type ? "all" : type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Results */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {query ? `Results for "${query}"` : "Enter a search query"}
                  </CardTitle>
                  {results.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {results.length} result{results.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-muted-foreground">Searching...</p>
                  </div>
                ) : !query ? (
                  <div className="py-12 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium">Start searching</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter keywords to search across all modules
                    </p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-12 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium">No results found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try different keywords or adjust your filters
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {results.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", typeColors[result.type])}>
                            {typeIcons[result.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{result.title}</p>
                              <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {result.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <SortAsc className="w-3 h-3" />
                                {result.relevance}% match
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
