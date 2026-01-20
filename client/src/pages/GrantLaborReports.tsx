import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  Clock,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Filter,
  BarChart3,
  PieChart,
} from "lucide-react";

export default function GrantLaborReports() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedFundingSource, setSelectedFundingSource] = useState<string>("all");
  const [selectedReportType, setSelectedReportType] = useState<string>("summary");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Fetch funding sources for filter
  const { data: fundingSources } = trpc.grantLaborReports.getFundingSources.useQuery();

  // Fetch labor cost summary
  const { data: laborSummary, isLoading: summaryLoading } = trpc.grantLaborReports.getLaborCostSummary.useQuery({
    fundingSourceId: selectedFundingSource !== "all" ? parseInt(selectedFundingSource) : undefined,
    startDate,
    endDate,
  });

  // Fetch detailed labor costs
  const { data: laborDetails, isLoading: detailsLoading } = trpc.grantLaborReports.getLaborCostsByFundingSource.useQuery({
    fundingSourceId: selectedFundingSource !== "all" ? parseInt(selectedFundingSource) : undefined,
    startDate,
    endDate,
  });

  // Fetch report templates
  const { data: reportTemplates } = trpc.grantLaborReports.getReportTemplates.useQuery();

  // Fetch compliance checklist
  const { data: complianceChecklist } = trpc.grantLaborReports.getComplianceChecklist.useQuery();

  // Generate report data for export
  const { data: reportData, refetch: generateReport } = trpc.grantLaborReports.generateReportData.useQuery(
    {
      fundingSourceId: selectedFundingSource !== "all" ? parseInt(selectedFundingSource) : undefined,
      startDate,
      endDate,
      reportType: selectedReportType as "summary" | "detailed" | "by_worker" | "by_charge_code",
    },
    { enabled: false }
  );

  const handleExportCSV = async () => {
    await generateReport();
    if (reportData) {
      // Create CSV content
      const headers = ["Date", "Worker", "Type", "Charge Code", "Project", "Hours", "Rate", "Cost"];
      const rows = reportData.details.map((d) => [
        d.date,
        d.workerName,
        d.workerType,
        d.chargeCode,
        d.chargeCodeName,
        d.hours.toFixed(2),
        d.hourlyRate.toFixed(2),
        d.totalCost.toFixed(2),
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `grant-labor-report-${startDate}-to-${endDate}.csv`;
      link.click();
      toast.success("Report exported to CSV");
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const toggleCheckItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate totals
  const totalHours = laborSummary?.reduce((sum, s) => sum + s.totalHours, 0) || 0;
  const totalCost = laborSummary?.reduce((sum, s) => sum + s.totalCost, 0) || 0;
  const employeeHours = laborSummary?.reduce((sum, s) => sum + s.employeeHours, 0) || 0;
  const contractorHours = laborSummary?.reduce((sum, s) => sum + s.contractorHours, 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grant Labor Cost Reports</h1>
            <p className="text-muted-foreground mt-1">
              Generate labor cost reports by funding source for grant compliance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Funding Source</Label>
                <Select value={selectedFundingSource} onValueChange={setSelectedFundingSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Funding Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Funding Sources</SelectItem>
                    {fundingSources?.map((fs) => (
                      <SelectItem key={fs.id} value={fs.id.toString()}>
                        {fs.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary Report</SelectItem>
                    <SelectItem value="detailed">Detailed Report</SelectItem>
                    <SelectItem value="by_worker">By Worker</SelectItem>
                    <SelectItem value="by_charge_code">By Charge Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Labor Cost</p>
                  <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employee Hours</p>
                  <p className="text-2xl font-bold">{employeeHours.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contractor Hours</p>
                  <p className="text-2xl font-bold">{contractorHours.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="details">
              <FileText className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            {summaryLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading summary data...
                </CardContent>
              </Card>
            ) : laborSummary && laborSummary.length > 0 ? (
              laborSummary.map((summary) => (
                <Card key={summary.fundingSourceId}>
                  <CardHeader>
                    <CardTitle>{summary.fundingSource}</CardTitle>
                    <CardDescription>
                      Labor cost breakdown for this funding source
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Cost Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                        <p className="text-xl font-bold">{summary.totalHours.toFixed(1)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-xl font-bold">${summary.totalCost.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Employee Cost</p>
                        <p className="text-xl font-bold">${summary.employeeCost.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Contractor Cost</p>
                        <p className="text-xl font-bold">${summary.contractorCost.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Charge Code Breakdown */}
                    {summary.chargeCodeBreakdown.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">By Charge Code</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Charge Code</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Hours</TableHead>
                              <TableHead className="text-right">Cost</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {summary.chargeCodeBreakdown.map((cc) => (
                              <TableRow key={cc.chargeCode}>
                                <TableCell className="font-mono">{cc.chargeCode}</TableCell>
                                <TableCell>{cc.chargeCodeName}</TableCell>
                                <TableCell className="text-right">{cc.hours.toFixed(1)}</TableCell>
                                <TableCell className="text-right">${cc.cost.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Worker Breakdown */}
                    {summary.workerBreakdown.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">By Worker</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Worker</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">Hours</TableHead>
                              <TableHead className="text-right">Cost</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {summary.workerBreakdown.map((w) => (
                              <TableRow key={w.workerId}>
                                <TableCell>{w.workerName}</TableCell>
                                <TableCell>
                                  <Badge variant={w.workerType === "employee" ? "default" : "secondary"}>
                                    {w.workerType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">{w.hours.toFixed(1)}</TableCell>
                                <TableCell className="text-right">${w.cost.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No labor cost data found for the selected period.
                  <br />
                  <span className="text-sm">Add time entries with charge codes to see data here.</span>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Time Entries</CardTitle>
                <CardDescription>
                  Individual time entries for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {detailsLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading...</div>
                ) : laborDetails && laborDetails.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Worker</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Charge Code</TableHead>
                        <TableHead>Funding Source</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {laborDetails.map((entry, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.workerName}</TableCell>
                          <TableCell>
                            <Badge variant={entry.workerType === "employee" ? "default" : "secondary"}>
                              {entry.workerType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">{entry.chargeCode}</TableCell>
                          <TableCell>{entry.fundingSource}</TableCell>
                          <TableCell className="text-right">{entry.hours.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${entry.hourlyRate.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${entry.totalCost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No time entries found for the selected period.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTemplates?.map((template) => (
                <Card key={template.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5" />
                      {template.name}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Included Fields:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.fields.map((field) => (
                          <Badge key={field} variant="outline">
                            {field.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline" onClick={() => toast.info(`${template.name} template selected`)}>
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Grant Labor Reporting Compliance Checklist
                </CardTitle>
                <CardDescription>
                  Ensure your labor cost reporting meets grant requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {complianceChecklist?.map((category) => (
                  <div key={category.category}>
                    <h4 className="font-semibold mb-3">{category.category}</h4>
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                        >
                          <Checkbox
                            id={item.id}
                            checked={checkedItems[item.id] || false}
                            onCheckedChange={() => toggleCheckItem(item.id)}
                          />
                          <label
                            htmlFor={item.id}
                            className="flex-1 text-sm cursor-pointer"
                          >
                            {item.label}
                          </label>
                          {item.required ? (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Optional</Badge>
                          )}
                          {checkedItems[item.id] ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Compliance Progress */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Compliance Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Object.values(checkedItems).filter(Boolean).length} /{" "}
                      {complianceChecklist?.reduce((sum, c) => sum + c.items.length, 0) || 0} items
                    </span>
                  </div>
                  <Progress
                    value={
                      ((Object.values(checkedItems).filter(Boolean).length /
                        (complianceChecklist?.reduce((sum, c) => sum + c.items.length, 0) || 1)) *
                        100)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
