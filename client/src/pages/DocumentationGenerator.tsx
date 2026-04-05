import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Code, 
  Database, 
  FileText, 
  Download,
  RefreshCw,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { documentationGeneratorService, GeneratedDocumentation, APIEndpoint, DatabaseTable, DocSection } from "@/services/documentationGeneratorService";

export default function DocumentationGeneratorPage() {
  const [documentation, setDocumentation] = useState<GeneratedDocumentation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 15, 90));
    }, 300);

    try {
      const docs = await documentationGeneratorService.generateFullDocumentation();
      clearInterval(progressInterval);
      setProgress(100);
      setDocumentation(docs);
      toast.success("Documentation generated successfully");
    } catch (error) {
      toast.error("Failed to generate documentation");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleExportMarkdown = async () => {
    if (!documentation) return;

    try {
      const markdown = await documentationGeneratorService.exportAsMarkdown(documentation);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'laws-collective-documentation.md';
      a.click();
      toast.success("Documentation exported as Markdown");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const renderSection = (section: DocSection, level: number = 0) => (
    <div key={section.id} className={`${level > 0 ? 'ml-4 mt-3' : ''}`}>
      <div 
        className={`p-3 rounded-lg cursor-pointer transition-colors ${
          selectedSection === section.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
        } border`}
        onClick={() => setSelectedSection(section.id === selectedSection ? null : section.id)}
      >
        <div className="flex items-center gap-2">
          <ChevronRight className={`w-4 h-4 transition-transform ${selectedSection === section.id ? 'rotate-90' : ''}`} />
          <span className="font-medium">{section.title}</span>
        </div>
      </div>
      {selectedSection === section.id && (
        <div className="mt-2 ml-6 p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">{section.content}</p>
        </div>
      )}
      {section.subsections?.map(sub => renderSection(sub, level + 1))}
    </div>
  );

  const renderAPIEndpoint = (endpoint: APIEndpoint) => (
    <Card key={endpoint.path} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
            {endpoint.method}
          </Badge>
          <code className="text-sm font-mono">{endpoint.path}</code>
        </div>
        <CardDescription>{endpoint.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Parameters</p>
            <div className="bg-muted/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-left p-2 font-medium">Type</th>
                    <th className="text-left p-2 font-medium">Required</th>
                    <th className="text-left p-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.parameters.map((param, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="p-2 font-mono text-xs">{param.name}</td>
                      <td className="p-2 text-muted-foreground">{param.type}</td>
                      <td className="p-2">
                        {param.required ? (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Optional</Badge>
                        )}
                      </td>
                      <td className="p-2 text-muted-foreground">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Response</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">{endpoint.response}</code>
            </div>
            {endpoint.example && (
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(endpoint.example!)}>
                <Copy className="w-3 h-3 mr-2" />
                Copy Example
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDatabaseTable = (table: DatabaseTable) => (
    <Card key={table.name} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-mono">{table.name}</CardTitle>
        </div>
        <CardDescription>{table.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Column</th>
                <th className="text-left p-2 font-medium">Type</th>
                <th className="text-left p-2 font-medium">Nullable</th>
                <th className="text-left p-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((col, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="p-2 font-mono text-xs">{col.name}</td>
                  <td className="p-2 text-muted-foreground font-mono text-xs">{col.type}</td>
                  <td className="p-2">
                    {col.nullable ? (
                      <Badge variant="outline" className="text-xs">Yes</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">No</Badge>
                    )}
                  </td>
                  <td className="p-2 text-muted-foreground">{col.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {table.relationships.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Relationships</p>
            <div className="flex flex-wrap gap-2">
              {table.relationships.map((rel, idx) => (
                <Badge key={idx} variant="outline">
                  {rel.type} → {rel.table} ({rel.foreignKey})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              Documentation Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              Auto-generate system documentation for portability and knowledge preservation
            </p>
          </div>
          <div className="flex gap-2">
            {documentation && (
              <Button variant="outline" onClick={handleExportMarkdown}>
                <Download className="w-4 h-4 mr-2" />
                Export Markdown
              </Button>
            )}
            <Button onClick={handleGenerate} disabled={isGenerating}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate Docs'}
            </Button>
          </div>
        </div>

        {/* Progress */}
        {isGenerating && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating documentation...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Documentation */}
        {!documentation && !isGenerating && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Generate System Documentation</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Automatically generate comprehensive documentation including API reference, 
                database schema, and user guides. Essential for system portability and knowledge transfer.
              </p>
              <Button onClick={handleGenerate}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Documentation
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Documentation Content */}
        {documentation && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{documentation.sections.length}</p>
                      <p className="text-xs text-muted-foreground">Sections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Code className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{documentation.apiEndpoints.length}</p>
                      <p className="text-xs text-muted-foreground">API Endpoints</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{documentation.databaseSchema.length}</p>
                      <p className="text-xs text-muted-foreground">Database Tables</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">v{documentation.version}</p>
                      <p className="text-xs text-muted-foreground">Version</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documentation Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">
                  <FileText className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="api">
                  <Code className="w-4 h-4 mr-2" />
                  API Reference
                </TabsTrigger>
                <TabsTrigger value="database">
                  <Database className="w-4 h-4 mr-2" />
                  Database Schema
                </TabsTrigger>
                <TabsTrigger value="guide">
                  <BookOpen className="w-4 h-4 mr-2" />
                  User Guide
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>{documentation.title}</CardTitle>
                    <CardDescription>
                      Generated on {documentation.generatedAt.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-2">
                        {documentation.sections.map(section => renderSection(section))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Tab */}
              <TabsContent value="api">
                <ScrollArea className="h-[600px] pr-4">
                  {documentation.apiEndpoints.map(endpoint => renderAPIEndpoint(endpoint))}
                </ScrollArea>
              </TabsContent>

              {/* Database Tab */}
              <TabsContent value="database">
                <ScrollArea className="h-[600px] pr-4">
                  {documentation.databaseSchema.map(table => renderDatabaseTable(table))}
                </ScrollArea>
              </TabsContent>

              {/* User Guide Tab */}
              <TabsContent value="guide">
                <Card>
                  <CardHeader>
                    <CardTitle>User Guide</CardTitle>
                    <CardDescription>
                      Step-by-step instructions for using the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-2">
                        {documentation.userGuide.map(section => renderSection(section))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
