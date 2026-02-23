import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Calendar,
  Download,
  Play,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  Eye,
  Trash2,
  Plus,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  auditReportsService,
  AuditReport,
  AuditReportType,
  ScheduledAudit
} from "@/services/auditReportsService";

export default function AuditReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [schedules, setSchedules] = useState<ScheduledAudit[]>([]);
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [reportType, setReportType] = useState<AuditReportType>('internal_audit');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setReports(auditReportsService.getReports());
    setSchedules(auditReportsService.getScheduledAudits());
  };

  const handleGenerateReport = () => {
    if (!periodStart || !periodEnd) {
      toast.error("Please select a date range");
      return;
    }

    setIsGenerating(true);
    const report = auditReportsService.generateReport(
      reportType,
      { start: new Date(periodStart), end: new Date(periodEnd) },
      user?.id?.toString() || 'unknown'
    );
    
    toast.success("Report generation started");
    
    setTimeout(() => {
      loadData();
      setIsGenerating(false);
      toast.success("Report generated successfully");
    }, 2500);
  };

  const handleDeleteReport = (id: string) => {
    auditReportsService.deleteReport(id);
    loadData();
    if (selectedReport?.id === id) setSelectedReport(null);
    toast.success("Report deleted");
  };

  const stats = auditReportsService.getStats();
  const auditTypes = auditReportsService.getAuditTypes();

  const getStatusIcon = (status: AuditReport['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'generating': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Reports</h1>
            <p className="text-muted-foreground mt-1">
              Generate compliance reports for SOC 2, GDPR, and regulatory audits
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedReports}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageScore}%</p>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.openFindings}</p>
                  <p className="text-sm text-muted-foreground">Open Findings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.criticalFindings}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="generate">
          <TabsList>
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
            <TabsTrigger value="schedules">Scheduled ({schedules.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Audit Report</CardTitle>
                <CardDescription>
                  Select the audit type and date range to generate a compliance report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Audit Type</Label>
                    <Select value={reportType} onValueChange={(v) => setReportType(v as AuditReportType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {auditTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Period Start</Label>
                    <Input
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period End</Label>
                    <Input
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleGenerateReport} 
                      className="w-full"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reports List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Generated Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedReport?.id === report.id
                              ? 'bg-primary/10 border border-primary'
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                          onClick={() => setSelectedReport(report)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(report.status)}
                              <span className="font-medium text-sm truncate max-w-[180px]">
                                {auditTypes.find(t => t.value === report.type)?.label}
                              </span>
                            </div>
                            {report.score !== undefined && (
                              <Badge variant={report.score >= 80 ? "default" : report.score >= 60 ? "secondary" : "destructive"}>
                                {report.score}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {report.period.start.toLocaleDateString()} - {report.period.end.toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      {reports.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          No reports generated yet
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Report Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {selectedReport ? selectedReport.name : 'Select a Report'}
                    </CardTitle>
                    {selectedReport && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteReport(selectedReport.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedReport ? (
                    <div className="space-y-6">
                      {/* Score Overview */}
                      {selectedReport.score !== undefined && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Compliance Score</span>
                            <span className="text-2xl font-bold">{selectedReport.score}%</span>
                          </div>
                          <Progress value={selectedReport.score} className="h-3" />
                        </div>
                      )}

                      {/* Sections */}
                      <div>
                        <h4 className="font-medium mb-3">Audit Sections</h4>
                        <div className="space-y-2">
                          {selectedReport.sections.map((section) => (
                            <div key={section.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div>
                                <p className="font-medium">{section.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {section.controls.length} controls, {section.evidence.length} evidence items
                                </p>
                              </div>
                              <Badge variant={
                                section.status === 'compliant' ? 'default' :
                                section.status === 'partial' ? 'secondary' : 'destructive'
                              }>
                                {section.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Findings */}
                      {selectedReport.findings.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Findings ({selectedReport.findings.length})</h4>
                          <div className="space-y-2">
                            {selectedReport.findings.map((finding) => (
                              <div key={finding.id} className="p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(finding.severity)}`} />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium">{finding.title}</p>
                                      <Badge variant="outline" className="capitalize">
                                        {finding.status.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{finding.description}</p>
                                    <p className="text-xs text-primary mt-2">
                                      Recommendation: {finding.recommendation}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      Select a report from the list to view details
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedules" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Scheduled Audits</CardTitle>
                    <CardDescription>
                      Configure automated audit report generation
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${schedule.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium">
                            {auditTypes.find(t => t.value === schedule.reportType)?.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} • 
                            Next run: {schedule.nextRun.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {schedule.recipients.length} recipient{schedule.recipients.length !== 1 ? 's' : ''}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
