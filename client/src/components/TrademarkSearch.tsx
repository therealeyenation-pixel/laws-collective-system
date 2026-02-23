import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Search, CheckCircle2, AlertTriangle, XCircle, ExternalLink, 
  ChevronDown, ChevronUp, Info, Shield, Loader2, History, Clock
} from "lucide-react";

interface TrademarkResult {
  wordmark: string;
  status: "live" | "dead" | "pending" | "registered" | "abandoned" | "cancelled";
  serialNumber: string;
  registrationNumber?: string;
  filingDate?: string;
  owner?: string;
  goodsAndServices?: string;
  internationalClass?: string;
  similarity: "exact" | "high" | "medium" | "low";
}

interface SearchResult {
  query: string;
  searchDate: string;
  totalResults: number;
  exactMatch: boolean;
  conflictRisk: "none" | "low" | "medium" | "high";
  results: TrademarkResult[];
  recommendations: string[];
  relevantClasses: { code: string; name: string; description: string }[];
}

interface TrademarkSearchProps {
  businessName: string;
  onSearchComplete?: (result: SearchResult) => void;
  entityId?: string;
  compact?: boolean;
}

export default function TrademarkSearch({ 
  businessName, 
  onSearchComplete, 
  entityId,
  compact = false 
}: TrademarkSearchProps) {
  const [searchName, setSearchName] = useState(businessName);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedResults, setExpandedResults] = useState(false);

  const searchMutation = trpc.trademarkSearch.search.useMutation({
    onSuccess: (data) => {
      setSearchResult(data);
      onSearchComplete?.(data);
      toast.success("Trademark search completed");
    },
    onError: (error) => {
      toast.error(`Search failed: ${error.message}`);
    },
  });

  const { data: searchHistory } = trpc.trademarkSearch.getHistory.useQuery(
    { limit: 5 },
    { enabled: showHistory }
  );

  const { data: usptoUrl } = trpc.trademarkSearch.getUSPTOSearchUrl.useQuery(
    { businessName: searchName },
    { enabled: searchName.length > 0 }
  );

  const handleSearch = () => {
    if (!searchName.trim()) {
      toast.error("Please enter a business name to search");
      return;
    }
    searchMutation.mutate({
      businessName: searchName,
      saveToRecord: true,
      entityId,
    });
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "none":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Available</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800"><Info className="w-3 h-3 mr-1" /> Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3 mr-1" /> Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> High Risk</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registered":
        return <Badge variant="destructive">Registered</Badge>;
      case "live":
        return <Badge className="bg-green-500">Live</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>;
      case "abandoned":
      case "cancelled":
      case "dead":
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSimilarityColor = (similarity: string) => {
    switch (similarity) {
      case "exact": return "text-red-600";
      case "high": return "text-amber-600";
      case "medium": return "text-blue-600";
      case "low": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  if (compact) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Trademark Search</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter business name..."
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={searchMutation.isPending}
              size="sm"
            >
              {searchMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          {searchResult && (
            <div className="mt-3 flex items-center justify-between">
              {getRiskBadge(searchResult.conflictRisk)}
              <span className="text-xs text-muted-foreground">
                {searchResult.totalResults} results found
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              USPTO Trademark Search
            </CardTitle>
            <CardDescription>
              Check if your business name conflicts with existing trademarks
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="w-4 h-4 mr-1" />
            History
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Enter business name to search..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button 
            onClick={handleSearch} 
            disabled={searchMutation.isPending || !searchName.trim()}
          >
            {searchMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Search History */}
        {showHistory && searchHistory && searchHistory.length > 0 && (
          <Card className="bg-muted/50">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Recent Searches</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <div className="space-y-2">
                {searchHistory.map((search: any) => (
                  <div 
                    key={search.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setSearchName(search.businessName);
                      setSearchResult({
                        query: search.businessName,
                        searchDate: search.searchDate,
                        totalResults: search.totalResults,
                        exactMatch: search.exactMatch,
                        conflictRisk: search.conflictRisk,
                        results: search.results || [],
                        recommendations: search.recommendations || [],
                        relevantClasses: [],
                      });
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{search.businessName}</span>
                    </div>
                    {getRiskBadge(search.conflictRisk)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-4">
            {/* Risk Summary */}
            <Alert className={
              searchResult.conflictRisk === "none" ? "border-green-200 bg-green-50" :
              searchResult.conflictRisk === "low" ? "border-blue-200 bg-blue-50" :
              searchResult.conflictRisk === "medium" ? "border-amber-200 bg-amber-50" :
              "border-red-200 bg-red-50"
            }>
              <div className="flex items-start gap-3">
                {searchResult.conflictRisk === "none" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : searchResult.conflictRisk === "low" ? (
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                ) : searchResult.conflictRisk === "medium" ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertTitle className={
                    searchResult.conflictRisk === "none" ? "text-green-900" :
                    searchResult.conflictRisk === "low" ? "text-blue-900" :
                    searchResult.conflictRisk === "medium" ? "text-amber-900" :
                    "text-red-900"
                  }>
                    {searchResult.conflictRisk === "none" ? "Name Appears Available" :
                     searchResult.conflictRisk === "low" ? "Low Conflict Risk" :
                     searchResult.conflictRisk === "medium" ? "Medium Conflict Risk" :
                     "High Conflict Risk"}
                  </AlertTitle>
                  <AlertDescription className="mt-1 text-sm">
                    Found {searchResult.totalResults} related trademark{searchResult.totalResults !== 1 ? "s" : ""}.
                    {searchResult.exactMatch && " An exact match was found!"}
                  </AlertDescription>
                </div>
                {getRiskBadge(searchResult.conflictRisk)}
              </div>
            </Alert>

            {/* Recommendations */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="py-0 pb-3">
                <ul className="space-y-2">
                  {searchResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Conflicting Marks */}
            {searchResult.results.length > 0 && (
              <Collapsible open={expandedResults} onOpenChange={setExpandedResults}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="py-3 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          Related Trademarks ({searchResult.results.length})
                        </CardTitle>
                        {expandedResults ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="py-0 pb-3">
                      <div className="space-y-3">
                        {searchResult.results.map((result, idx) => (
                          <div key={idx} className="p-3 rounded border bg-muted/30">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="font-medium">{result.wordmark}</span>
                                <span className={`ml-2 text-xs ${getSimilarityColor(result.similarity)}`}>
                                  ({result.similarity} similarity)
                                </span>
                              </div>
                              {getStatusBadge(result.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>Serial: {result.serialNumber}</div>
                              {result.registrationNumber && (
                                <div>Reg: {result.registrationNumber}</div>
                              )}
                              {result.owner && <div>Owner: {result.owner}</div>}
                              {result.internationalClass && (
                                <div>Class: {result.internationalClass}</div>
                              )}
                            </div>
                            {result.goodsAndServices && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                {result.goodsAndServices}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Relevant Classes */}
            {searchResult.relevantClasses.length > 0 && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Relevant Trademark Classes</CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <div className="space-y-2">
                    {searchResult.relevantClasses.map((cls) => (
                      <div key={cls.code} className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="font-mono">{cls.code}</Badge>
                        <div>
                          <span className="font-medium">{cls.name}</span>
                          <p className="text-xs text-muted-foreground">{cls.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* USPTO Link */}
            {usptoUrl && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <ExternalLink className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Verify at USPTO</h4>
                      <p className="text-xs text-muted-foreground mt-1 mb-2">
                        Always verify results directly with the official USPTO database.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(usptoUrl.searchUrl, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open USPTO Search
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Educational Info */}
        {!searchResult && (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertTitle>Why Search Trademarks?</AlertTitle>
            <AlertDescription className="text-sm mt-2">
              <ul className="list-disc list-inside space-y-1">
                <li>Avoid costly legal disputes over name conflicts</li>
                <li>Protect your brand identity before investing in marketing</li>
                <li>Ensure you can register your trademark federally</li>
                <li>State business name registration is separate from federal trademark</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
