import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { useState } from "react";

export default function ComplianceExport() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({ start: "2024-01-01", end: "2024-12-31" });
  const [reportType, setReportType] = useState("audit");
  const [exportFormat, setExportFormat] = useState("pdf");

  const reportTypes = [
    { id: "audit", label: "Audit Report", description: "Complete audit trail and compliance logs" },
    { id: "financial", label: "Financial Report", description: "Financial transactions and reconciliation" },
    { id: "user", label: "User Activity Report", description: "User access and activity logs" },
    { id: "security", label: "Security Report", description: "Security events and incidents" },
    { id: "system", label: "System Report", description: "System health and performance metrics" },
  ];

  const exportFormats = [
    { id: "pdf", label: "PDF", icon: "📄" },
    { id: "excel", label: "Excel", icon: "📊" },
    { id: "csv", label: "CSV", icon: "📋" },
  ];

  const handleExport = () => {
    console.log(`Exporting ${reportType} report as ${exportFormat} for ${dateRange.start} to ${dateRange.end}`);
    alert(`Exporting ${reportType} report in ${exportFormat} format...`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Compliance Export</h1>
          <p className="text-muted-foreground mt-2">Generate and export compliance reports for regulatory submissions</p>
        </div>

        {/* Date Range Selection */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Date Range
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>
        </Card>

        {/* Report Type Selection */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  reportType === type.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-semibold">{type.label}</p>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Export Format Selection */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Export Format
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => setExportFormat(format.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportFormat === format.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="text-2xl mb-2">{format.icon}</p>
                <p className="font-semibold">{format.label}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Export Summary */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <h2 className="text-lg font-bold mb-3">Export Summary</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Report Type:</span> {reportTypes.find(t => t.id === reportType)?.label}</p>
            <p><span className="font-semibold">Format:</span> {exportFormats.find(f => f.id === exportFormat)?.label}</p>
            <p><span className="font-semibold">Date Range:</span> {dateRange.start} to {dateRange.end}</p>
            <p><span className="font-semibold">Generated By:</span> {user?.name || "System"}</p>
          </div>
        </Card>

        {/* Export Button */}
        <div className="flex gap-3">
          <Button onClick={handleExport} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" className="flex-1">
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
