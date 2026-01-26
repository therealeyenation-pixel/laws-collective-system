import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  Shield,
  Users,
  Clock,
  Plus,
  Send,
  Eye,
  Trash2,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

interface ReportConfig {
  year: number;
  quarter: Quarter;
  portfolioId: string;
  includeGovernance: boolean;
  includeCompliance: boolean;
  includeBenchmarks: boolean;
  includeTransactions: boolean;
  compareToLastQuarter: boolean;
  compareToLastYear: boolean;
}

export default function InvestmentReportDashboard() {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedPortfolio, setSelectedPortfolio] = useState("portfolio-001");
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    year: 2025,
    quarter: "Q4",
    portfolioId: "portfolio-001",
    includeGovernance: true,
    includeCompliance: true,
    includeBenchmarks: true,
    includeTransactions: true,
    compareToLastQuarter: false,
    compareToLastYear: false,
  });
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for available periods
  const availablePeriods = [
    { year: 2025, quarter: "Q4" as Quarter },
    { year: 2025, quarter: "Q3" as Quarter },
    { year: 2025, quarter: "Q2" as Quarter },
    { year: 2025, quarter: "Q1" as Quarter },
    { year: 2024, quarter: "Q4" as Quarter },
    { year: 2024, quarter: "Q3" as Quarter },
  ];

  // Mock data for report schedules
  const [schedules, setSchedules] = useState([
    {
      id: "SCH-001",
      portfolioId: "portfolio-001",
      frequency: "quarterly",
      recipients: ["admin@example.com", "board@example.com"],
      enabled: true,
      nextScheduled: "2026-04-01",
      includeGovernance: true,
      includeCompliance: true,
    },
    {
      id: "SCH-002",
      portfolioId: "portfolio-001",
      frequency: "annual",
      recipients: ["cfo@example.com"],
      enabled: true,
      nextScheduled: "2027-01-15",
      includeGovernance: true,
      includeCompliance: true,
    },
  ]);

  // Mock data for recent reports
  const recentReports = [
    {
      id: "RPT-2025Q4-001",
      period: "Q4 2025",
      generatedAt: "2026-01-15T10:30:00Z",
      portfolioValue: 2500000,
      returnPercent: 8.5,
      status: "completed",
    },
    {
      id: "RPT-2025Q3-001",
      period: "Q3 2025",
      generatedAt: "2025-10-05T14:20:00Z",
      portfolioValue: 2350000,
      returnPercent: 5.2,
      status: "completed",
    },
    {
      id: "RPT-2025Q2-001",
      period: "Q2 2025",
      generatedAt: "2025-07-08T09:15:00Z",
      portfolioValue: 2200000,
      returnPercent: 3.8,
      status: "completed",
    },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const mockReport = {
        reportId: `RPT-${reportConfig.year}${reportConfig.quarter}-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        reportPeriod: {
          year: reportConfig.year,
          quarter: reportConfig.quarter,
          startDate: getQuarterStartDate(reportConfig.year, reportConfig.quarter),
          endDate: getQuarterEndDate(reportConfig.year, reportConfig.quarter),
        },
        portfolioId: reportConfig.portfolioId,
        executiveSummary: {
          totalPortfolioValue: 2500000,
          quarterlyReturn: 8.5,
          ytdReturn: 15.2,
          keyHighlights: [
            "Portfolio outperformed benchmark by 2.3%",
            "Successfully rebalanced to target allocation",
            "Added 3 new ESG-compliant holdings",
          ],
          keyRisks: [
            "Concentration in technology sector above policy limit",
            "Interest rate sensitivity increased",
          ],
          recommendations: [
            "Consider reducing tech exposure by 5%",
            "Review fixed income duration strategy",
          ],
        },
        performance: {
          startValue: 2300000,
          endValue: 2500000,
          totalReturnPercent: 8.5,
          dividendsReceived: 45000,
          contributions: 50000,
          withdrawals: 0,
        },
        assetAllocation: [
          { assetClass: "Stocks", marketValue: 1500000, percentOfPortfolio: 60, targetPercent: 60 },
          { assetClass: "Bonds", marketValue: 625000, percentOfPortfolio: 25, targetPercent: 25 },
          { assetClass: "Real Estate", marketValue: 250000, percentOfPortfolio: 10, targetPercent: 10 },
          { assetClass: "Cash", marketValue: 125000, percentOfPortfolio: 5, targetPercent: 5 },
        ],
        topHoldings: [
          { ticker: "VTI", name: "Vanguard Total Stock Market ETF", marketValue: 500000, percentOfPortfolio: 20 },
          { ticker: "BND", name: "Vanguard Total Bond Market ETF", marketValue: 400000, percentOfPortfolio: 16 },
          { ticker: "AAPL", name: "Apple Inc.", marketValue: 200000, percentOfPortfolio: 8 },
          { ticker: "MSFT", name: "Microsoft Corporation", marketValue: 180000, percentOfPortfolio: 7.2 },
          { ticker: "VNQ", name: "Vanguard Real Estate ETF", marketValue: 150000, percentOfPortfolio: 6 },
        ],
        governanceActivity: reportConfig.includeGovernance ? {
          totalProposals: 5,
          approvedProposals: 4,
          rejectedProposals: 1,
          meetingsHeld: 3,
          keyDecisions: [
            "Approved increase in international equity allocation",
            "Rejected proposal for cryptocurrency investment",
            "Updated ESG policy requirements",
          ],
        } : undefined,
        complianceStatus: reportConfig.includeCompliance ? {
          overallStatus: "compliant",
          policyViolations: 0,
          esgComplianceScore: 92,
          allocationLimitChecks: {
            passed: 8,
            failed: 0,
            warnings: 1,
          },
        } : undefined,
        benchmarkComparisons: reportConfig.includeBenchmarks ? [
          { benchmarkName: "S&P 500", benchmarkReturn: 6.2, portfolioReturn: 8.5, alpha: 2.3 },
          { benchmarkName: "60/40 Portfolio", benchmarkReturn: 5.8, portfolioReturn: 8.5, alpha: 2.7 },
        ] : undefined,
        transactionSummary: reportConfig.includeTransactions ? {
          totalTransactions: 45,
          totalBuys: 28,
          totalSells: 12,
          totalDividends: 5,
          netCashFlow: 50000,
        } : undefined,
      };
      
      setGeneratedReport(mockReport);
      toast.success("Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!generatedReport) return;
    
    const markdown = generateMarkdownContent(generatedReport);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `investment-report-${generatedReport.reportPeriod.quarter}-${generatedReport.reportPeriod.year}.md`;
    link.click();
    toast.success("Report exported as Markdown");
  };

  const handleExportJSON = () => {
    if (!generatedReport) return;
    
    const json = JSON.stringify(generatedReport, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `investment-report-${generatedReport.reportPeriod.quarter}-${generatedReport.reportPeriod.year}.json`;
    link.click();
    toast.success("Report exported as JSON");
  };

  const getQuarterStartDate = (year: number, quarter: Quarter): string => {
    const months: Record<Quarter, string> = { Q1: "01", Q2: "04", Q3: "07", Q4: "10" };
    return `${year}-${months[quarter]}-01`;
  };

  const getQuarterEndDate = (year: number, quarter: Quarter): string => {
    const ends: Record<Quarter, string> = {
      Q1: `${year}-03-31`,
      Q2: `${year}-06-30`,
      Q3: `${year}-09-30`,
      Q4: `${year}-12-31`,
    };
    return ends[quarter];
  };

  const generateMarkdownContent = (report: any): string => {
    let md = `# Quarterly Investment Report\n\n`;
    md += `## ${report.reportPeriod.quarter} ${report.reportPeriod.year}\n\n`;
    md += `**Report ID:** ${report.reportId}\n`;
    md += `**Generated:** ${new Date(report.generatedAt).toLocaleString()}\n`;
    md += `**Period:** ${report.reportPeriod.startDate} to ${report.reportPeriod.endDate}\n\n`;
    
    md += `---\n\n`;
    md += `## Executive Summary\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total Portfolio Value | $${report.executiveSummary.totalPortfolioValue.toLocaleString()} |\n`;
    md += `| Quarterly Return | ${report.executiveSummary.quarterlyReturn}% |\n`;
    md += `| YTD Return | ${report.executiveSummary.ytdReturn}% |\n\n`;
    
    md += `### Key Highlights\n`;
    report.executiveSummary.keyHighlights.forEach((h: string) => {
      md += `- ${h}\n`;
    });
    
    md += `\n### Key Risks\n`;
    report.executiveSummary.keyRisks.forEach((r: string) => {
      md += `- ${r}\n`;
    });
    
    md += `\n### Recommendations\n`;
    report.executiveSummary.recommendations.forEach((r: string) => {
      md += `- ${r}\n`;
    });
    
    md += `\n---\n\n`;
    md += `## Performance Summary\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Starting Value | $${report.performance.startValue.toLocaleString()} |\n`;
    md += `| Ending Value | $${report.performance.endValue.toLocaleString()} |\n`;
    md += `| Total Return | ${report.performance.totalReturnPercent}% |\n`;
    md += `| Dividends Received | $${report.performance.dividendsReceived.toLocaleString()} |\n`;
    md += `| Contributions | $${report.performance.contributions.toLocaleString()} |\n`;
    md += `| Withdrawals | $${report.performance.withdrawals.toLocaleString()} |\n\n`;
    
    md += `## Asset Allocation\n\n`;
    md += `| Asset Class | Market Value | % of Portfolio | Target % |\n`;
    md += `|-------------|--------------|----------------|----------|\n`;
    report.assetAllocation.forEach((a: any) => {
      md += `| ${a.assetClass} | $${a.marketValue.toLocaleString()} | ${a.percentOfPortfolio}% | ${a.targetPercent}% |\n`;
    });
    
    md += `\n## Top Holdings\n\n`;
    md += `| Ticker | Name | Market Value | % of Portfolio |\n`;
    md += `|--------|------|--------------|----------------|\n`;
    report.topHoldings.forEach((h: any) => {
      md += `| ${h.ticker} | ${h.name} | $${h.marketValue.toLocaleString()} | ${h.percentOfPortfolio}% |\n`;
    });
    
    if (report.governanceActivity) {
      md += `\n## Governance Activity\n\n`;
      md += `| Metric | Value |\n`;
      md += `|--------|-------|\n`;
      md += `| Total Proposals | ${report.governanceActivity.totalProposals} |\n`;
      md += `| Approved | ${report.governanceActivity.approvedProposals} |\n`;
      md += `| Rejected | ${report.governanceActivity.rejectedProposals} |\n`;
      md += `| Meetings Held | ${report.governanceActivity.meetingsHeld} |\n\n`;
      md += `### Key Decisions\n`;
      report.governanceActivity.keyDecisions.forEach((d: string) => {
        md += `- ${d}\n`;
      });
    }
    
    if (report.complianceStatus) {
      md += `\n## Compliance Status\n\n`;
      md += `| Metric | Value |\n`;
      md += `|--------|-------|\n`;
      md += `| Overall Status | ${report.complianceStatus.overallStatus} |\n`;
      md += `| Policy Violations | ${report.complianceStatus.policyViolations} |\n`;
      md += `| ESG Compliance Score | ${report.complianceStatus.esgComplianceScore} |\n`;
      md += `| Allocation Checks Passed | ${report.complianceStatus.allocationLimitChecks.passed} |\n`;
      md += `| Allocation Checks Failed | ${report.complianceStatus.allocationLimitChecks.failed} |\n`;
      md += `| Allocation Warnings | ${report.complianceStatus.allocationLimitChecks.warnings} |\n`;
    }
    
    if (report.benchmarkComparisons) {
      md += `\n## Benchmark Comparisons\n\n`;
      md += `| Benchmark | Benchmark Return | Portfolio Return | Alpha |\n`;
      md += `|-----------|------------------|------------------|-------|\n`;
      report.benchmarkComparisons.forEach((b: any) => {
        md += `| ${b.benchmarkName} | ${b.benchmarkReturn}% | ${b.portfolioReturn}% | ${b.alpha}% |\n`;
      });
    }
    
    if (report.transactionSummary) {
      md += `\n## Transaction Summary\n\n`;
      md += `| Metric | Value |\n`;
      md += `|--------|-------|\n`;
      md += `| Total Transactions | ${report.transactionSummary.totalTransactions} |\n`;
      md += `| Buys | ${report.transactionSummary.totalBuys} |\n`;
      md += `| Sells | ${report.transactionSummary.totalSells} |\n`;
      md += `| Dividends | ${report.transactionSummary.totalDividends} |\n`;
      md += `| Net Cash Flow | $${report.transactionSummary.netCashFlow.toLocaleString()} |\n`;
    }
    
    md += `\n---\n\n`;
    md += `*Report generated by LuvOnPurpose Investment Management System*\n`;
    
    return md;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Investment Reports</h1>
            <p className="text-muted-foreground">
              Generate, view, and schedule quarterly and annual investment reports
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select portfolio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portfolio-001">Main Portfolio</SelectItem>
                <SelectItem value="portfolio-002">Endowment Fund</SelectItem>
                <SelectItem value="portfolio-003">Operating Reserve</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="generate" className="gap-2">
              <FileText className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="schedules" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Panel */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Report Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure report parameters and sections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Period Selection */}
                  <div className="space-y-4">
                    <Label>Report Period</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={reportConfig.year.toString()}
                        onValueChange={(v) =>
                          setReportConfig({ ...reportConfig, year: parseInt(v) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={reportConfig.quarter}
                        onValueChange={(v) =>
                          setReportConfig({ ...reportConfig, quarter: v as Quarter })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Quarter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                          <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                          <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                          <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Section Toggles */}
                  <div className="space-y-4">
                    <Label>Report Sections</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="governance" className="font-normal">
                          Governance Activity
                        </Label>
                        <Switch
                          id="governance"
                          checked={reportConfig.includeGovernance}
                          onCheckedChange={(v) =>
                            setReportConfig({ ...reportConfig, includeGovernance: v })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compliance" className="font-normal">
                          Compliance Status
                        </Label>
                        <Switch
                          id="compliance"
                          checked={reportConfig.includeCompliance}
                          onCheckedChange={(v) =>
                            setReportConfig({ ...reportConfig, includeCompliance: v })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="benchmarks" className="font-normal">
                          Benchmark Comparisons
                        </Label>
                        <Switch
                          id="benchmarks"
                          checked={reportConfig.includeBenchmarks}
                          onCheckedChange={(v) =>
                            setReportConfig({ ...reportConfig, includeBenchmarks: v })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="transactions" className="font-normal">
                          Transaction Summary
                        </Label>
                        <Switch
                          id="transactions"
                          checked={reportConfig.includeTransactions}
                          onCheckedChange={(v) =>
                            setReportConfig({ ...reportConfig, includeTransactions: v })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Comparison Options */}
                  <div className="space-y-4">
                    <Label>Comparisons</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="qoq" className="font-normal">
                          Quarter over Quarter
                        </Label>
                        <Switch
                          id="qoq"
                          checked={reportConfig.compareToLastQuarter}
                          onCheckedChange={(v) =>
                            setReportConfig({ ...reportConfig, compareToLastQuarter: v })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="yoy" className="font-normal">
                          Year over Year
                        </Label>
                        <Switch
                          id="yoy"
                          checked={reportConfig.compareToLastYear}
                          onCheckedChange={(v) =>
                            setReportConfig({ ...reportConfig, compareToLastYear: v })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    className="w-full"
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Report Preview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Report Preview</CardTitle>
                      <CardDescription>
                        {generatedReport
                          ? `${generatedReport.reportPeriod.quarter} ${generatedReport.reportPeriod.year} Report`
                          : "Configure and generate a report to preview"}
                      </CardDescription>
                    </div>
                    {generatedReport && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportMarkdown}>
                          <Download className="h-4 w-4 mr-2" />
                          Markdown
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportJSON}>
                          <Download className="h-4 w-4 mr-2" />
                          JSON
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedReport ? (
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-6">
                        {/* Executive Summary */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Executive Summary</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-green-600">
                                  {formatCurrency(generatedReport.executiveSummary.totalPortfolioValue)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Portfolio Value
                                </div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-green-600">
                                  +{generatedReport.executiveSummary.quarterlyReturn}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Quarterly Return
                                </div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-green-600">
                                  +{generatedReport.executiveSummary.ytdReturn}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  YTD Return
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium mb-2 text-green-600">Key Highlights</h4>
                              <ul className="space-y-1 text-sm">
                                {generatedReport.executiveSummary.keyHighlights.map((h: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{h}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2 text-amber-600">Key Risks</h4>
                              <ul className="space-y-1 text-sm">
                                {generatedReport.executiveSummary.keyRisks.map((r: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2 text-blue-600">Recommendations</h4>
                              <ul className="space-y-1 text-sm">
                                {generatedReport.executiveSummary.recommendations.map((r: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Asset Allocation */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Asset Allocation
                          </h3>
                          <div className="space-y-2">
                            {generatedReport.assetAllocation.map((a: any, i: number) => (
                              <div key={i} className="flex items-center gap-4">
                                <div className="w-24 text-sm font-medium">{a.assetClass}</div>
                                <div className="flex-1">
                                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-600 rounded-full"
                                      style={{ width: `${a.percentOfPortfolio}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="w-20 text-sm text-right">
                                  {a.percentOfPortfolio}%
                                </div>
                                <div className="w-24 text-sm text-right text-muted-foreground">
                                  {formatCurrency(a.marketValue)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Top Holdings */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Top Holdings</h3>
                          <div className="space-y-2">
                            {generatedReport.topHoldings.map((h: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline">{h.ticker}</Badge>
                                  <span className="text-sm">{h.name}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{formatCurrency(h.marketValue)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {h.percentOfPortfolio}%
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Governance Activity */}
                        {generatedReport.governanceActivity && (
                          <>
                            <Separator />
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Governance Activity
                              </h3>
                              <div className="grid grid-cols-4 gap-4">
                                <Card>
                                  <CardContent className="pt-4 text-center">
                                    <div className="text-2xl font-bold">
                                      {generatedReport.governanceActivity.totalProposals}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Total Proposals
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                      {generatedReport.governanceActivity.approvedProposals}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Approved</div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-4 text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                      {generatedReport.governanceActivity.rejectedProposals}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Rejected</div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-4 text-center">
                                    <div className="text-2xl font-bold">
                                      {generatedReport.governanceActivity.meetingsHeld}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Meetings Held
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Compliance Status */}
                        {generatedReport.complianceStatus && (
                          <>
                            <Separator />
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Compliance Status
                              </h3>
                              <div className="flex items-center gap-4">
                                <Badge
                                  variant={
                                    generatedReport.complianceStatus.overallStatus === "compliant"
                                      ? "default"
                                      : "destructive"
                                  }
                                  className="text-lg px-4 py-2"
                                >
                                  {generatedReport.complianceStatus.overallStatus.toUpperCase()}
                                </Badge>
                                <div className="text-sm text-muted-foreground">
                                  ESG Score: {generatedReport.complianceStatus.esgComplianceScore}/100
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No report generated yet</p>
                        <p className="text-sm">Configure options and click Generate Report</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report History</CardTitle>
                <CardDescription>Previously generated investment reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{report.period} Investment Report</div>
                          <div className="text-sm text-muted-foreground">
                            Generated {new Date(report.generatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(report.portfolioValue)}</div>
                          <div className="text-sm text-green-600">+{report.returnPercent}%</div>
                        </div>
                        <Badge variant="outline">{report.status}</Badge>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Report Schedules</CardTitle>
                    <CardDescription>
                      Automated report generation and distribution
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            schedule.enabled
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-muted"
                          }`}
                        >
                          <Calendar
                            className={`h-6 w-6 ${
                              schedule.enabled ? "text-green-600" : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="font-medium capitalize">
                            {schedule.frequency} Report
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Next: {new Date(schedule.nextScheduled).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm">{schedule.recipients.length} recipients</div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.recipients[0]}
                            {schedule.recipients.length > 1 && ` +${schedule.recipients.length - 1}`}
                          </div>
                        </div>
                        <Badge variant={schedule.enabled ? "default" : "secondary"}>
                          {schedule.enabled ? "Active" : "Paused"}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Annual Report Preview</CardTitle>
                <CardDescription>
                  Generate a comprehensive annual report combining all quarters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Select defaultValue="2025">
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Annual Report
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center text-muted-foreground py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a year and generate an annual report</p>
                    <p className="text-sm">
                      Annual reports aggregate all four quarters with year-end analysis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
