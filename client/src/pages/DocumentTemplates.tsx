import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  FileText, 
  Download, 
  Eye, 
  Printer,
  Shield,
  Home,
  Users,
  Scale,
  FileSignature,
  Building2,
  ScrollText,
  BookOpen
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: "founding" | "governance" | "financial" | "membership";
  icon: React.ReactNode;
  filename: string;
  pages: number;
  lastUpdated: string;
  requiredFields: string[];
}

const templates: Template[] = [
  {
    id: "house-charter",
    name: "House Charter",
    description: "Founding document establishing the House structure, purpose, and constitutional protections including the 60/40 split.",
    category: "founding",
    icon: <ScrollText className="w-6 h-6" />,
    filename: "house-charter.md",
    pages: 8,
    lastUpdated: "2026-01-23",
    requiredFields: ["House Name", "Principal Name", "Establishment Date", "Founding Members"],
  },
  {
    id: "trust-beneficiary",
    name: "Trust Beneficiary Agreement",
    description: "60/40 generational wealth structure document defining beneficiary rights, distributions, and firewall protections.",
    category: "founding",
    icon: <Shield className="w-6 h-6" />,
    filename: "trust-beneficiary-agreement.md",
    pages: 10,
    lastUpdated: "2026-01-23",
    requiredFields: ["Grantor Name", "Trustee Name", "Beneficiary Name", "Trust Assets"],
  },
  {
    id: "operating-agreement",
    name: "House Operating Agreement",
    description: "Governance and operations manual covering decision-making, financial operations, and member responsibilities.",
    category: "governance",
    icon: <BookOpen className="w-6 h-6" />,
    filename: "house-operating-agreement.md",
    pages: 12,
    lastUpdated: "2026-01-23",
    requiredFields: ["House Name", "Principal Name", "Steward Name", "Treasurer Name"],
  },
  {
    id: "investment-term-sheet",
    name: "Investment Term Sheet",
    description: "Initial term sheet for investment discussions with constitutional protections and firewall clauses.",
    category: "financial",
    icon: <FileSignature className="w-6 h-6" />,
    filename: "investment-term-sheet.md",
    pages: 4,
    lastUpdated: "2026-01-23",
    requiredFields: ["Investor Name", "Investment Amount", "Term", "Participation Percentage"],
  },
  {
    id: "lineage-registration",
    name: "Lineage Registration Form",
    description: "Form for registering family members and their positions within the House structure.",
    category: "membership",
    icon: <Users className="w-6 h-6" />,
    filename: "lineage-registration.md",
    pages: 3,
    lastUpdated: "2026-01-23",
    requiredFields: ["Member Name", "Relationship", "Date of Birth", "House Position"],
  },
  {
    id: "board-resolution",
    name: "Board Resolution Template",
    description: "Official template for recording and documenting board decisions and resolutions.",
    category: "governance",
    icon: <Scale className="w-6 h-6" />,
    filename: "board-resolution.md",
    pages: 2,
    lastUpdated: "2026-01-23",
    requiredFields: ["Resolution Title", "Date", "Voting Results", "Signatories"],
  },
];

const categoryLabels: Record<string, string> = {
  founding: "Founding Documents",
  governance: "Governance",
  financial: "Financial",
  membership: "Membership",
};

const categoryColors: Record<string, string> = {
  founding: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  governance: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  financial: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  membership: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

export default function DocumentTemplates() {
  const [activeTab, setActiveTab] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");

  const handleDownload = async (template: Template) => {
    try {
      const response = await fetch(`/templates/${template.filename}`);
      if (!response.ok) throw new Error("Template not found");
      
      const content = await response.text();
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = template.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${template.name}`);
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const handlePreview = async (template: Template) => {
    try {
      const response = await fetch(`/templates/${template.filename}`);
      if (!response.ok) throw new Error("Template not found");
      
      const content = await response.text();
      setPreviewContent(content);
      setPreviewTemplate(template);
    } catch (error) {
      toast.error("Failed to load template preview");
    }
  };

  const handlePrint = async (template: Template) => {
    try {
      const response = await fetch(`/templates/${template.filename}`);
      if (!response.ok) throw new Error("Template not found");
      
      const content = await response.text();
      
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${template.name}</title>
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
              pre { white-space: pre-wrap; font-family: monospace; background: #f5f5f5; padding: 10px; }
              @media print {
                body { padding: 0; }
                @page { margin: 1in; }
              }
            </style>
          </head>
          <body>
            <pre>${content}</pre>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      
      toast.success("Print dialog opened");
    } catch (error) {
      toast.error("Failed to print template");
    }
  };

  const filteredTemplates = activeTab === "all" 
    ? templates 
    : templates.filter(t => t.category === activeTab);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Document Templates</h1>
          <p className="text-muted-foreground mt-1">
            Professional printable templates for House and Trust documentation
          </p>
        </div>

        {/* Info Banner */}
        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-800 dark:text-blue-200">Print-Ready Templates</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  All templates include placeholder fields (marked with {"{{"}field_name{"}}"}) that should be 
                  filled in before printing. Templates include constitutional protections for the 60/40 structure.
                </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="text-primary">{template.icon}</div>
                      <Badge className={categoryColors[template.category]}>
                        {categoryLabels[template.category]}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{template.pages} pages</span>
                        <span>Updated: {template.lastUpdated}</span>
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium mb-1">Required Fields:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.requiredFields.slice(0, 3).map((field, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                          {template.requiredFields.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.requiredFields.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePrint(template)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleDownload(template)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewTemplate?.name}</DialogTitle>
              <DialogDescription>
                Template preview - Fill in the placeholder fields before printing
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                {previewContent}
              </pre>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Close
              </Button>
              {previewTemplate && (
                <>
                  <Button variant="outline" onClick={() => handlePrint(previewTemplate)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button onClick={() => handleDownload(previewTemplate)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Template Usage Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Getting Started</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Download the template you need</li>
                  <li>Open in a text editor or word processor</li>
                  <li>Replace all {"{{"}placeholder{"}} "}fields with actual values</li>
                  <li>Review for accuracy and completeness</li>
                  <li>Print and obtain required signatures</li>
                  <li>Store original in Document Vault</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Document Hierarchy</h4>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
