import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  FileText, 
  Download, 
  Eye, 
  Printer,
  Shield,
  Users,
  Scale,
  FileSignature,
  ScrollText,
  BookOpen,
  Save,
  Loader2,
  Lock
} from "lucide-react";

interface Template {
  type: string;
  name: string;
  description: string;
  pages: number;
}

const categoryLabels: Record<string, string> = {
  house_charter: "Founding",
  trust_beneficiary_agreement: "Founding",
  operating_agreement: "Governance",
  lineage_registration: "Membership",
  board_resolution: "Governance",
  investment_addendum: "Financial",
};

const categoryColors: Record<string, string> = {
  Founding: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Governance: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Financial: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Membership: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

const templateIcons: Record<string, React.ReactNode> = {
  house_charter: <ScrollText className="w-6 h-6" />,
  trust_beneficiary_agreement: <Shield className="w-6 h-6" />,
  operating_agreement: <BookOpen className="w-6 h-6" />,
  lineage_registration: <Users className="w-6 h-6" />,
  board_resolution: <Scale className="w-6 h-6" />,
  investment_addendum: <FileSignature className="w-6 h-6" />,
};

export default function DocumentTemplates() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch user's houses
  const { data: houses } = trpc.houseManagement.getAllHouses.useQuery({ limit: 50, offset: 0 });
  
  // Fetch available templates
  const { data: templates, isLoading: templatesLoading } = trpc.houseDocuments.getTemplates.useQuery(
    { houseId: selectedHouseId || undefined }
  );

  // Generate document mutation
  const generateMutation = trpc.houseDocuments.generateDocument.useMutation({
    onSuccess: (data) => {
      setPreviewContent(data.content);
      setIsGenerating(false);
      toast.success(`${data.name} generated for ${data.houseName}`);
    },
    onError: (error) => {
      setIsGenerating(false);
      toast.error(`Failed to generate document: ${error.message}`);
    },
  });

  // Save to vault mutation
  const saveToVaultMutation = trpc.houseDocuments.saveToVault.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setPreviewTemplate(null);
      setPreviewContent("");
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleGenerate = async (template: Template) => {
    if (!selectedHouseId) {
      toast.error("Please select a House first");
      return;
    }
    
    setIsGenerating(true);
    setPreviewTemplate(template);
    
    generateMutation.mutate({
      houseId: selectedHouseId,
      templateType: template.type as any,
    });
  };

  const handleSaveToVault = () => {
    if (!selectedHouseId || !previewTemplate || !previewContent) return;
    
    saveToVaultMutation.mutate({
      houseId: selectedHouseId,
      templateType: previewTemplate.type as any,
      title: previewTemplate.name,
      content: previewContent,
    });
  };

  const handlePrint = () => {
    if (!previewContent || !previewTemplate) return;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${previewTemplate.name}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 1in;
              line-height: 1.6;
            }
            h1 { font-size: 24pt; text-align: center; margin-bottom: 0.5in; }
            h2 { font-size: 18pt; margin-top: 0.3in; border-bottom: 1px solid #000; }
            h3 { font-size: 14pt; margin-top: 0.2in; }
            table { width: 100%; border-collapse: collapse; margin: 0.2in 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            pre { white-space: pre-wrap; font-family: inherit; }
            @media print {
              body { padding: 0; }
              @page { margin: 1in; }
            }
          </style>
        </head>
        <body>
          <pre>${previewContent}</pre>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    if (!previewContent || !previewTemplate) return;
    
    const blob = new Blob([previewContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${previewTemplate.type}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Document downloaded");
  };

  const filteredTemplates = templates?.filter((t: Template) => {
    if (activeTab === "all") return true;
    const category = categoryLabels[t.type];
    return category?.toLowerCase() === activeTab;
  }) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">House Document Templates</h1>
          <p className="text-muted-foreground mt-1">
            Generate official House and Trust documents with your House data auto-filled
          </p>
        </div>

        {/* House Selector */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Lock className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Private House Documents</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select your House to generate documents with your data pre-filled. 
                  All documents are private and stored in your House's Document Vault.
                </p>
              </div>
              <div className="w-64">
                <Label htmlFor="house-select" className="sr-only">Select House</Label>
                <Select
                  value={selectedHouseId?.toString() || ""}
                  onValueChange={(value) => setSelectedHouseId(parseInt(value))}
                >
                  <SelectTrigger id="house-select">
                    <SelectValue placeholder="Select a House" />
                  </SelectTrigger>
                  <SelectContent>
                    {houses?.houses?.map((house: any) => (
                      <SelectItem key={house.id} value={house.id.toString()}>
                        {house.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="founding">Founding</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {templatesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template: Template) => {
                  const category = categoryLabels[template.type] || "Other";
                  return (
                    <Card key={template.type} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="text-primary">{templateIcons[template.type]}</div>
                          <Badge className={categoryColors[category]}>
                            {category}
                          </Badge>
                        </div>
                        <CardTitle className="mt-2">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{template.pages} pages</span>
                            <span>Auto-fill enabled</span>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleGenerate(template)}
                              disabled={!selectedHouseId || isGenerating}
                            >
                              {isGenerating && previewTemplate?.type === template.type ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4 mr-1" />
                              )}
                              Generate
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate && !!previewContent} onOpenChange={() => {
          setPreviewTemplate(null);
          setPreviewContent("");
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewTemplate?.name}</DialogTitle>
              <DialogDescription>
                Review the generated document. Save to your Document Vault or download for printing.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto max-h-96">
                {previewContent}
              </pre>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => {
                setPreviewTemplate(null);
                setPreviewContent("");
              }}>
                Close
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleSaveToVault} disabled={saveToVaultMutation.isPending}>
                {saveToVaultMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save to Vault
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Document Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Document Priority</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">1.</span>
                    <span>House Charter (supreme document)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">2.</span>
                    <span>Trust Beneficiary Agreement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">3.</span>
                    <span>Operating Agreement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">4.</span>
                    <span>All other documents</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Constitutional Protections</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>60% House Retained - Protected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Firewall provisions - Immutable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Principal veto power - Preserved</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
