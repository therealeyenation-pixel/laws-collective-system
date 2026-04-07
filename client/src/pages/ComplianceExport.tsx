import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Download, Calendar, Filter, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ExportJob {
  id: string;
  reportType: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  fileSize?: number;
  downloadUrl?: string;
}

export default function ComplianceExport() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({ start: "2024-01-01", end: "2024-12-31" });
  const [reportType, setReportType] = useState("audit");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    { id: '1', reportType: 'audit', format: 'pdf', status: 'completed', createdAt: Date.now() - 3600000, completedAt: Date.now() - 3500000, fileSize: 2.4, downloadUrl: '#' },
    { id: '2', reportType: 'financial', format: 'excel', status: 'completed', createdAt: Date.now() - 86400000, completedAt: Date.now() - 86300000, fileSize: 1.8, downloadUrl: '#' },
    { id: '3', reportType: 'security', format: 'csv', status: 'processing', createdAt: Date.now() - 600000 },
  ]);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch export jobs from backend
  const { data: backendJobs, refetch } = trpc.system.getExportJobs.useQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id, refetchInterval: 10000 }
  );

  // Create export mutation
  const exportMutation = trpc.system.createExport.useMutation({
    onSuccess: (data) => {
      toast.success('Export started successfully');
      const newJob: ExportJob = {
        id: data.jobId,
        reportType,
        format: exportFormat,
        status: 'processing',
        createdAt: Date.now(),
      };
      setExportJobs([newJob, ...exportJobs]);
      setIsExporting(false);
    },
    onError: () => {
      toast.error('Failed to start export');
      setIsExporting(false);
    },
  });

  const reportTypes = [
    { id: "audit", label: "Audit Report", description: "Complete audit trail and compliance logs", records: 2847 },
    { id: "financial", label: "Financial Report", description: "Financial transactions and reconciliation", records: 1523 },
    { id: "user", label: "User Activity Report", description: "User access and activity logs", records: 5234 },
    { id: "security", label: "Security Report", description: "Security events and incidents", records: 342 },
    { id: "system", label: "System Report", description: "System health and performance metrics", records: 8901 },
  ];

  const exportFormats = [
    { id: "pdf", label: "PDF", icon: "📄", description: "Formatted report with charts" },
    { id: "excel", label: "Excel", icon: "📊", description: "Spreadsheet with data tables" },
    { id: "csv", label: "CSV", icon: "📋", description: "Raw data export" },
  ];

  const handleExport = () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error('Please select a date range');
      return;
    }

    setIsExporting(true);
    exportMutation.mutate({
      userId: user?.id || '',
      reportType,
      format: exportFormat,
      startDate: dateRange.start,
      endDate: dateRange.end,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing': return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 dark:bg-green-950/20 border-l-green-500';
      case 'processing': return 'bg-blue-50 dark:bg-blue-950/20 border-l-blue-500';
      case 'failed': return 'bg-red-50 dark:bg-red-950/20 border-l-red-500';
      default: return 'bg-gray-50 dark:bg-gray-950/20 border-l-gray-500';
    }
  };

  const selectedReport = reportTypes.find(t => t.id === reportType);
  const selectedFormat = exportFormats.find(f => f.id === exportFormat);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
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
                <p className="text-xs text-muted-foreground mt-2">{type.records.toLocaleString()} records</p>
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
                <p className="text-xs text-muted-foreground mt-1">{format.description}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Export Summary */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <h2 className="text-lg font-bold mb-3">Export Summary</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Report Type:</span> {selectedReport?.label}</p>
            <p><span className="font-semibold">Records:</span> {selectedReport?.records.toLocaleString()}</p>
            <p><span className="font-semibold">Format:</span> {selectedFormat?.label}</p>
            <p><span className="font-semibold">Date Range:</span> {dateRange.start} to {dateRange.end}</p>
            <p><span className="font-semibold">Generated By:</span> {user?.name || "System"}</p>
            <p><span className="font-semibold">Timestamp:</span> {new Date().toLocaleString()}</p>
          </div>
        </Card>

        {/* Export Button */}
        <div className="flex gap-3 mb-8">
          <Button 
            onClick={handleExport} 
            className="flex-1"
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
          <Button variant="outline" className="flex-1">
            Preview
          </Button>
        </div>

        {/* Export History */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Export History</h2>
          <div className="space-y-3">
            {exportJobs.length > 0 ? (
              exportJobs.map((job) => (
                <Card key={job.id} className={`p-4 border-l-4 ${getStatusColor(job.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(job.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {reportTypes.find(t => t.id === job.reportType)?.label} ({job.format.toUpperCase()})
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(job.createdAt).toLocaleString()}
                        </p>
                        {job.completedAt && (
                          <p className="text-sm text-muted-foreground">
                            Completed: {new Date(job.completedAt).toLocaleString()} • Size: {job.fileSize?.toFixed(1)}MB
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950/30' :
                        job.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30' :
                        'bg-red-100 text-red-700 dark:bg-red-950/30'
                      }`}>
                        {job.status.toUpperCase()}
                      </span>
                      {job.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                No exports yet. Create your first export to get started.
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
