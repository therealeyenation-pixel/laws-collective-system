import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Table2,
  Download,
  Plus,
  Play,
  Save,
  Clock,
  Filter,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Settings,
  Trash2,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  dataSource: string;
  columns: string[];
  filters: ReportFilter[];
  chartType?: 'bar' | 'line' | 'pie' | 'table';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    lastRun?: Date;
    nextRun?: Date;
  };
  createdAt: Date;
  lastModified: Date;
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
}

interface ReportResult {
  id: string;
  reportName: string;
  generatedAt: Date;
  rowCount: number;
  data: any[];
  summary?: Record<string, any>;
}

interface KPI {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  unit: string;
}

export default function AdvancedReportingPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [recentReports, setRecentReports] = useState<ReportResult[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  // Builder state
  const [builderName, setBuilderName] = useState('');
  const [builderDataSource, setBuilderDataSource] = useState('');
  const [builderColumns, setBuilderColumns] = useState<string[]>([]);
  const [builderChartType, setBuilderChartType] = useState<'bar' | 'line' | 'pie' | 'table'>('table');

  const dataSources = [
    { id: 'financial', name: 'Financial Data', columns: ['date', 'revenue', 'expenses', 'profit', 'category', 'account'] },
    { id: 'grants', name: 'Grant Management', columns: ['grant_name', 'amount', 'status', 'deadline', 'funder', 'compliance_score'] },
    { id: 'hr', name: 'HR & Personnel', columns: ['employee', 'department', 'hire_date', 'salary', 'performance_score', 'status'] },
    { id: 'documents', name: 'Document Vault', columns: ['document_name', 'type', 'created_date', 'status', 'owner', 'signatures'] },
    { id: 'training', name: 'Academy & Training', columns: ['course', 'participant', 'progress', 'completion_date', 'score', 'certificate'] },
    { id: 'members', name: 'Member Data', columns: ['member_name', 'join_date', 'membership_type', 'points', 'level', 'status'] },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load report templates
    setTemplates([
      {
        id: '1',
        name: 'Monthly Financial Summary',
        description: 'Revenue, expenses, and profit by category',
        category: 'Financial',
        dataSource: 'financial',
        columns: ['date', 'revenue', 'expenses', 'profit', 'category'],
        filters: [],
        chartType: 'bar',
        schedule: {
          frequency: 'monthly',
          recipients: ['admin@example.com'],
          lastRun: new Date('2024-01-01'),
          nextRun: new Date('2024-02-01'),
        },
        createdAt: new Date('2023-06-01'),
        lastModified: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'Grant Pipeline Report',
        description: 'Active grants with compliance status',
        category: 'Grants',
        dataSource: 'grants',
        columns: ['grant_name', 'amount', 'status', 'deadline', 'compliance_score'],
        filters: [],
        chartType: 'table',
        createdAt: new Date('2023-08-01'),
        lastModified: new Date('2024-01-10'),
      },
      {
        id: '3',
        name: 'Training Completion Rates',
        description: 'Course completion and certification metrics',
        category: 'Training',
        dataSource: 'training',
        columns: ['course', 'participant', 'progress', 'score'],
        filters: [],
        chartType: 'pie',
        createdAt: new Date('2023-09-01'),
        lastModified: new Date('2024-01-05'),
      },
    ]);

    // Load KPIs
    setKpis([
      { id: '1', name: 'Total Revenue', value: 1250000, change: 12.5, trend: 'up', target: 1500000, unit: '$' },
      { id: '2', name: 'Active Grants', value: 24, change: 4, trend: 'up', target: 30, unit: '' },
      { id: '3', name: 'Member Growth', value: 156, change: 8.3, trend: 'up', target: 200, unit: '' },
      { id: '4', name: 'Training Completion', value: 78, change: -2.1, trend: 'down', target: 85, unit: '%' },
      { id: '5', name: 'Document Processing', value: 342, change: 15, trend: 'up', unit: '' },
      { id: '6', name: 'Compliance Score', value: 94, change: 1.5, trend: 'up', target: 100, unit: '%' },
    ]);

    // Load recent reports
    setRecentReports([
      {
        id: '1',
        reportName: 'Monthly Financial Summary',
        generatedAt: new Date('2024-01-25'),
        rowCount: 156,
        data: [],
      },
      {
        id: '2',
        reportName: 'Grant Pipeline Report',
        generatedAt: new Date('2024-01-24'),
        rowCount: 24,
        data: [],
      },
    ]);
  };

  const handleGenerateReport = async (template: ReportTemplate) => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Report "${template.name}" generated successfully`);
      loadData();
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!builderName || !builderDataSource || builderColumns.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newTemplate: ReportTemplate = {
      id: `template-${Date.now()}`,
      name: builderName,
      description: `Custom report from ${builderDataSource}`,
      category: 'Custom',
      dataSource: builderDataSource,
      columns: builderColumns,
      filters: [],
      chartType: builderChartType,
      createdAt: new Date(),
      lastModified: new Date(),
    };

    setTemplates([...templates, newTemplate]);
    setShowBuilder(false);
    setBuilderName('');
    setBuilderDataSource('');
    setBuilderColumns([]);
    toast.success("Report template saved");
  };

  const handleExportReport = (report: ReportResult) => {
    toast.success(`Exporting "${report.reportName}"...`);
  };

  const getChartIcon = (type?: string) => {
    switch (type) {
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'line': return <LineChart className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      default: return <Table2 className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    return <span className="w-4 h-4 text-gray-500">—</span>;
  };

  const selectedDataSource = dataSources.find(ds => ds.id === builderDataSource);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Advanced Reporting
            </h1>
            <p className="text-muted-foreground mt-1">
              Build custom reports, track KPIs, and schedule automated exports
            </p>
          </div>
          <Button onClick={() => setShowBuilder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>

        {/* KPI Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{kpi.name}</span>
                  {getTrendIcon(kpi.trend)}
                </div>
                <p className="text-2xl font-bold">
                  {kpi.unit === '$' && '$'}
                  {kpi.value.toLocaleString()}
                  {kpi.unit === '%' && '%'}
                </p>
                <p className={`text-xs ${kpi.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {kpi.change >= 0 ? '+' : ''}{kpi.change}% vs last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
            <TabsTrigger value="recent">Recent Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getChartIcon(template.chartType)}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {template.columns.slice(0, 3).map((col) => (
                          <Badge key={col} variant="secondary" className="text-xs">
                            {col}
                          </Badge>
                        ))}
                        {template.columns.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.columns.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleGenerateReport(template)}
                          disabled={isGenerating}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Run
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recent Reports Tab */}
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recently Generated Reports</CardTitle>
                <CardDescription>
                  Download or view your recent report outputs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="w-8 h-8 text-green-600" />
                          <div>
                            <h4 className="font-medium">{report.reportName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(report.generatedAt, 'PPp')} • {report.rowCount} rows
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleExportReport(report)}>
                            <Download className="w-4 h-4 mr-1" />
                            CSV
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleExportReport(report)}>
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Reports Tab */}
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Scheduled Reports
                </CardTitle>
                <CardDescription>
                  Automated reports sent to recipients on a schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.filter(t => t.schedule).map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {template.schedule?.frequency} • {template.schedule?.recipients.length} recipients
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Next run: {template.schedule?.nextRun && format(template.schedule.nextRun, 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last run: {template.schedule?.lastRun && format(template.schedule.lastRun, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Builder Modal */}
        {showBuilder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Create New Report</CardTitle>
                <CardDescription>
                  Build a custom report by selecting data source and columns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input
                    placeholder="e.g., Quarterly Revenue Analysis"
                    value={builderName}
                    onChange={(e) => setBuilderName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Source</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={builderDataSource}
                    onChange={(e) => {
                      setBuilderDataSource(e.target.value);
                      setBuilderColumns([]);
                    }}
                  >
                    <option value="">Select data source...</option>
                    {dataSources.map(ds => (
                      <option key={ds.id} value={ds.id}>{ds.name}</option>
                    ))}
                  </select>
                </div>

                {selectedDataSource && (
                  <div className="space-y-2">
                    <Label>Select Columns</Label>
                    <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg">
                      {selectedDataSource.columns.map((col) => (
                        <div key={col} className="flex items-center gap-2">
                          <Checkbox
                            id={col}
                            checked={builderColumns.includes(col)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setBuilderColumns([...builderColumns, col]);
                              } else {
                                setBuilderColumns(builderColumns.filter(c => c !== col));
                              }
                            }}
                          />
                          <label htmlFor={col} className="text-sm cursor-pointer">
                            {col.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Visualization Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['table', 'bar', 'line', 'pie'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={builderChartType === type ? 'default' : 'outline'}
                        className="flex flex-col gap-1 h-auto py-3"
                        onClick={() => setBuilderChartType(type)}
                      >
                        {getChartIcon(type)}
                        <span className="text-xs capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowBuilder(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleSaveTemplate}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
