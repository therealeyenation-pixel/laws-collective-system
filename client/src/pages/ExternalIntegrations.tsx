import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Download,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  Clock,
  Users,
  DollarSign,
  Building2,
  Shield,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ExternalIntegrations() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<"timekeeping" | "workers" | "chargecodes" | "funding">("timekeeping");
  const [exportFormat, setExportFormat] = useState("generic_csv");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const { data: exportFormats } = trpc.dataExport.getExportFormats.useQuery();
  const { data: integrationGuides } = trpc.dataExport.getIntegrationGuides.useQuery();

  const exportTimekeeping = trpc.dataExport.exportTimekeeping.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.content, data.filename);
      toast.success(`Exported ${data.recordCount} time entries`);
      setShowExportDialog(false);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });

  const exportWorkers = trpc.dataExport.exportWorkers.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.content, data.filename);
      toast.success(`Exported ${data.recordCount} workers`);
      setShowExportDialog(false);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });

  const exportChargeCodes = trpc.dataExport.exportChargeCodes.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.content, data.filename);
      toast.success(`Exported ${data.recordCount} charge codes`);
      setShowExportDialog(false);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });

  const exportFundingSources = trpc.dataExport.exportFundingSources.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.content, data.filename);
      toast.success(`Exported ${data.recordCount} funding sources`);
      setShowExportDialog(false);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    switch (exportType) {
      case "timekeeping":
        exportTimekeeping.mutate({
          format: exportFormat as any,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
        });
        break;
      case "workers":
        exportWorkers.mutate({ format: exportFormat as any });
        break;
      case "chargecodes":
        exportChargeCodes.mutate();
        break;
      case "funding":
        exportFundingSources.mutate();
        break;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Accounting & Timekeeping":
        return <Clock className="w-5 h-5" />;
      case "Federal Contract Accounting":
        return <Shield className="w-5 h-5" />;
      case "Payroll Processing":
        return <DollarSign className="w-5 h-5" />;
      case "Enterprise HR & Payroll":
        return <Building2 className="w-5 h-5" />;
      case "Nonprofit Accounting":
        return <BookOpen className="w-5 h-5" />;
      case "Human Resources":
        return <Users className="w-5 h-5" />;
      default:
        return <FileSpreadsheet className="w-5 h-5" />;
    }
  };

  const supportedSystems = [
    {
      name: "QuickBooks",
      logo: "QB",
      category: "Accounting",
      status: "supported",
      exports: ["Timekeeping", "Workers"],
    },
    {
      name: "Deltek Costpoint",
      logo: "DC",
      category: "Federal Contracts",
      status: "supported",
      exports: ["Timekeeping", "Charge Codes"],
    },
    {
      name: "Gusto",
      logo: "G",
      category: "Payroll",
      status: "supported",
      exports: ["Workers", "Timekeeping"],
    },
    {
      name: "ADP",
      logo: "ADP",
      category: "HR & Payroll",
      status: "supported",
      exports: ["Workers", "Timekeeping"],
    },
    {
      name: "Sage Intacct",
      logo: "SI",
      category: "Nonprofit Accounting",
      status: "supported",
      exports: ["All Data"],
    },
    {
      name: "BambooHR",
      logo: "BH",
      category: "Human Resources",
      status: "supported",
      exports: ["Workers"],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">External Software Integration</h1>
            <p className="text-muted-foreground mt-1">
              Export data to industry-standard backup systems for grant compliance and audits
            </p>
          </div>
          <Button onClick={() => setShowExportDialog(true)} className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Supported Systems</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">Industry-standard integrations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Export Formats</CardTitle>
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">CSV formats available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Data Types</CardTitle>
              <Download className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Exportable datasets</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">DCAA Compliant</CardTitle>
              <Shield className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Yes</div>
              <p className="text-xs text-muted-foreground">Federal contract ready</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="systems">Supported Systems</TabsTrigger>
            <TabsTrigger value="guides">Integration Guides</TabsTrigger>
            <TabsTrigger value="exports">Export History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Why External Integration */}
              <Card>
                <CardHeader>
                  <CardTitle>Why External Software Integration?</CardTitle>
                  <CardDescription>Ensuring compliance and audit readiness</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Grant Compliance</p>
                        <p className="text-sm text-muted-foreground">
                          Many federal grants require DCAA-compliant timekeeping systems. Export to Deltek Costpoint format for audit trails.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Auditor Acceptance</p>
                        <p className="text-sm text-muted-foreground">
                          Auditors often prefer industry-standard software. Having data in QuickBooks or Sage format builds credibility.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Payroll Processing</p>
                        <p className="text-sm text-muted-foreground">
                          Export worker hours directly to Gusto or ADP for seamless payroll processing.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Data Portability</p>
                        <p className="text-sm text-muted-foreground">
                          Your data is never locked in. Export anytime in universal CSV format.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Export */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Export</CardTitle>
                  <CardDescription>Download your data in various formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => {
                        setExportType("timekeeping");
                        setShowExportDialog(true);
                      }}
                    >
                      <Clock className="w-6 h-6" />
                      <span>Timekeeping</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => {
                        setExportType("workers");
                        setShowExportDialog(true);
                      }}
                    >
                      <Users className="w-6 h-6" />
                      <span>Workers</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => {
                        setExportType("chargecodes");
                        setShowExportDialog(true);
                      }}
                    >
                      <FileSpreadsheet className="w-6 h-6" />
                      <span>Charge Codes</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => {
                        setExportType("funding");
                        setShowExportDialog(true);
                      }}
                    >
                      <DollarSign className="w-6 h-6" />
                      <span>Funding Sources</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Supported Systems Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Supported External Systems</CardTitle>
                <CardDescription>Export your data to these industry-standard platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {supportedSystems.map((system) => (
                    <div
                      key={system.name}
                      className="p-4 border rounded-lg text-center hover:border-primary transition-colors"
                    >
                      <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                        {system.logo}
                      </div>
                      <p className="font-medium text-sm">{system.name}</p>
                      <p className="text-xs text-muted-foreground">{system.category}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {system.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Supported Systems Tab */}
          <TabsContent value="systems" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportedSystems.map((system) => (
                <Card key={system.name}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                        {system.logo}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{system.name}</CardTitle>
                        <CardDescription>{system.category}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Exportable Data:</p>
                        <div className="flex flex-wrap gap-2">
                          {system.exports.map((exp) => (
                            <Badge key={exp} variant="secondary">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setActiveTab("guides")}
                      >
                        View Integration Guide
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Integration Guides Tab */}
          <TabsContent value="guides" className="space-y-4">
            {integrationGuides?.map((guide) => (
              <Card key={guide.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(guide.category)}
                      <div>
                        <CardTitle>{guide.name}</CardTitle>
                        <CardDescription>{guide.description}</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={guide.website} target="_blank" rel="noopener noreferrer" className="gap-2">
                        Visit Website
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Import Instructions</h4>
                      <ol className="space-y-1 text-sm text-muted-foreground">
                        {guide.importInstructions.map((instruction, idx) => (
                          <li key={idx}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Field Mapping</h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(guide.dataMapping).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {guide.complianceNotes && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Compliance Note:</strong> {guide.complianceNotes}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <p className="text-sm text-muted-foreground">Supported export formats:</p>
                    {guide.exportFormats.map((format) => (
                      <Badge key={format} variant="outline">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Export History Tab */}
          <TabsContent value="exports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export History</CardTitle>
                <CardDescription>Track your data exports for audit purposes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Export history tracking coming soon. All exports are logged for compliance.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Data</DialogTitle>
              <DialogDescription>
                Choose your export format and options
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select value={exportType} onValueChange={(v: any) => setExportType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timekeeping">Timekeeping Data</SelectItem>
                    <SelectItem value="workers">Workers / Employees</SelectItem>
                    <SelectItem value="chargecodes">Charge Codes</SelectItem>
                    <SelectItem value="funding">Funding Sources</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(exportType === "timekeeping" || exportType === "workers") && (
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {exportType === "timekeeping" && (
                        <>
                          <SelectItem value="quickbooks_time">QuickBooks Time</SelectItem>
                          <SelectItem value="deltek">Deltek Costpoint (DCAA)</SelectItem>
                          <SelectItem value="adp">ADP Workforce</SelectItem>
                          <SelectItem value="gusto">Gusto Payroll</SelectItem>
                          <SelectItem value="generic_csv">Generic CSV</SelectItem>
                        </>
                      )}
                      {exportType === "workers" && (
                        <>
                          <SelectItem value="gusto">Gusto Payroll</SelectItem>
                          <SelectItem value="adp">ADP Workforce</SelectItem>
                          <SelectItem value="generic_csv">Generic CSV</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {exportType === "timekeeping" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date (Optional)</Label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={
                  exportTimekeeping.isPending ||
                  exportWorkers.isPending ||
                  exportChargeCodes.isPending ||
                  exportFundingSources.isPending
                }
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {exportTimekeeping.isPending ||
                exportWorkers.isPending ||
                exportChargeCodes.isPending ||
                exportFundingSources.isPending
                  ? "Exporting..."
                  : "Export"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
