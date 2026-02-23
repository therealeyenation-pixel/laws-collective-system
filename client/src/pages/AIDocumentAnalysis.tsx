import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Search,
  Upload,
  Loader2,
  Tag,
  Shield,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Building,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { aiDocumentAnalysisService, DocumentAnalysis, KeyTerm, ComplianceFlag, Suggestion } from "@/services/aiDocumentAnalysisService";

export default function AIDocumentAnalysisPage() {
  const [analyses, setAnalyses] = useState<DocumentAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentText, setDocumentText] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('contract');

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = () => {
    setAnalyses(aiDocumentAnalysisService.getCachedAnalyses());
  };

  const handleAnalyze = async () => {
    if (!documentText.trim() || !documentName.trim()) {
      toast.error("Please provide document name and content");
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await aiDocumentAnalysisService.analyzeDocument({
        documentId: `doc-${Date.now()}`,
        documentName,
        documentType,
        content: documentText,
      });
      
      setSelectedAnalysis(analysis);
      loadAnalyses();
      toast.success("Document analyzed successfully");
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text();
      setDocumentText(text);
      setDocumentName(file.name.replace('.txt', ''));
      toast.success("File loaded");
    } else {
      toast.error("Please upload a text file (.txt)");
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'important': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getFlagIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return <Users className="w-4 h-4" />;
      case 'organization': return <Building className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'amount': return <DollarSign className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI Document Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze documents to extract key terms, check compliance, and get improvement suggestions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Analyze Document</CardTitle>
              <CardDescription>
                Paste document text or upload a file for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input
                  placeholder="e.g., Service Agreement 2024"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Document Type</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="contract">Contract</option>
                  <option value="grant">Grant Document</option>
                  <option value="legal">Legal Document</option>
                  <option value="financial">Financial Document</option>
                  <option value="policy">Policy Document</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Document Content</Label>
                <Textarea
                  placeholder="Paste document text here..."
                  className="min-h-[200px]"
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  className="flex-1"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                {selectedAnalysis 
                  ? `Analysis of "${selectedAnalysis.documentName}"`
                  : "Select or analyze a document to see results"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAnalysis ? (
                <Tabs defaultValue="summary" className="space-y-4">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm">{selectedAnalysis.summary}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Risk Level</p>
                        <Badge className={
                          selectedAnalysis.riskLevel === 'high' ? 'bg-red-500' :
                          selectedAnalysis.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                        }>
                          {selectedAnalysis.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Sentiment</p>
                        <Badge variant="outline">{selectedAnalysis.sentiment}</Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Extracted Entities</h4>
                      <div className="space-y-2">
                        {selectedAnalysis.entities.map((entity, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {getEntityIcon(entity.type)}
                            <span className="text-muted-foreground capitalize">{entity.type}:</span>
                            <span>{entity.value}</span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(entity.confidence * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="terms">
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {selectedAnalysis.keyTerms.map((term, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{term.term}</span>
                              <Badge className={getImportanceColor(term.importance)}>
                                {term.importance}
                              </Badge>
                            </div>
                            {term.definition && (
                              <p className="text-sm text-muted-foreground">{term.definition}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">{term.context}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="compliance">
                    <ScrollArea className="h-[300px]">
                      {selectedAnalysis.complianceFlags.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                          <p className="text-muted-foreground">No compliance issues detected</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedAnalysis.complianceFlags.map((flag, idx) => (
                            <div key={idx} className="p-3 border rounded-lg">
                              <div className="flex items-start gap-2">
                                {getFlagIcon(flag.type)}
                                <div className="flex-1">
                                  <h4 className="font-medium">{flag.title}</h4>
                                  <p className="text-sm text-muted-foreground">{flag.description}</p>
                                  <p className="text-sm text-primary mt-2">
                                    <strong>Recommendation:</strong> {flag.recommendation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="suggestions">
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {selectedAnalysis.suggestions.map((suggestion, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                <span className="font-medium">{suggestion.title}</span>
                              </div>
                              <Badge className={getPriorityColor(suggestion.priority)}>
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    Analyze a document to see AI-powered insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Analyses */}
        {analyses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>
                Previously analyzed documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyses.slice(0, 6).map((analysis) => (
                  <div
                    key={analysis.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium text-sm">{analysis.documentName}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(analysis.analyzedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={
                        analysis.riskLevel === 'high' ? 'bg-red-500' :
                        analysis.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                      }>
                        {analysis.riskLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
