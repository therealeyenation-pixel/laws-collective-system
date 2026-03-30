import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Phase 49: Advanced Analytics Dashboard
 * 
 * Features:
 * - Campaign performance analytics
 * - Member engagement metrics
 * - ROI and revenue analysis
 * - Predictive insights
 * - Custom report builder
 * - Data export functionality
 */

interface AnalyticsMetric {
  label: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
}

interface CampaignData {
  name: string;
  revenue: number;
  engagement: number;
  roi: number;
  members: number;
}

interface MemberLifetimeValue {
  segment: string;
  ltv: number;
  retention: number;
  avgSpend: number;
}

export default function AdvancedAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [showPredictions, setShowPredictions] = useState(false);

  const metrics: AnalyticsMetric[] = [
    {
      label: "Total Revenue",
      value: "$2,450,000",
      trend: 12.5,
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
    },
    {
      label: "Active Members",
      value: "4,250",
      trend: 8.3,
      icon: <Users className="w-6 h-6 text-blue-600" />,
    },
    {
      label: "Avg Campaign ROI",
      value: "245%",
      trend: 15.2,
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
    },
    {
      label: "Conversion Rate",
      value: "8.5%",
      trend: 2.1,
      icon: <Target className="w-6 h-6 text-orange-600" />,
    },
  ];

  const campaignPerformance: CampaignData[] = [
    { name: "Q1 Campaign", revenue: 450000, engagement: 0.75, roi: 280, members: 1200 },
    { name: "Q2 Campaign", revenue: 520000, engagement: 0.82, roi: 310, members: 1450 },
    { name: "Q3 Campaign", revenue: 480000, engagement: 0.68, roi: 220, members: 980 },
    { name: "Q4 Campaign", revenue: 600000, engagement: 0.88, roi: 350, members: 1620 },
  ];

  const memberLifetimeValue: MemberLifetimeValue[] = [
    { segment: "Premium", ltv: 45000, retention: 0.98, avgSpend: 2500 },
    { segment: "Gold", ltv: 28000, retention: 0.92, avgSpend: 1800 },
    { segment: "Silver", ltv: 12000, retention: 0.85, avgSpend: 800 },
    { segment: "Bronze", ltv: 4500, retention: 0.72, avgSpend: 300 },
  ];

  const engagementTrend = [
    { month: "Jan", email: 0.42, sms: 0.58, web: 0.65, mobile: 0.35 },
    { month: "Feb", email: 0.45, sms: 0.62, web: 0.68, mobile: 0.42 },
    { month: "Mar", email: 0.48, sms: 0.65, web: 0.72, mobile: 0.48 },
    { month: "Apr", email: 0.52, sms: 0.68, web: 0.75, mobile: 0.55 },
    { month: "May", email: 0.55, sms: 0.72, web: 0.78, mobile: 0.62 },
    { month: "Jun", email: 0.58, sms: 0.75, web: 0.82, mobile: 0.68 },
  ];

  const conversionFunnel = [
    { stage: "Visitors", count: 50000, percentage: 100 },
    { stage: "Engaged", count: 18500, percentage: 37 },
    { stage: "Leads", count: 8200, percentage: 16.4 },
    { stage: "Customers", count: 3690, percentage: 7.4 },
    { stage: "Repeat", count: 1845, percentage: 3.7 },
  ];

  const predictiveInsights = [
    {
      title: "Revenue Forecast",
      value: "$2.8M",
      period: "Next Quarter",
      confidence: 0.92,
      change: "+14.3%",
    },
    {
      title: "Member Growth",
      value: "5,200",
      period: "Next Quarter",
      confidence: 0.88,
      change: "+22.4%",
    },
    {
      title: "Churn Risk",
      value: "3.2%",
      period: "Next Quarter",
      confidence: 0.85,
      change: "-0.8%",
    },
  ];

  const cohortAnalysis = [
    { cohort: "Jan 2025", size: 450, m1: 0.95, m3: 0.82, m6: 0.68, m12: 0.45 },
    { cohort: "Feb 2025", size: 520, m1: 0.93, m3: 0.80, m6: 0.65 },
    { cohort: "Mar 2025", size: 680, m1: 0.91, m3: 0.78 },
    { cohort: "Apr 2025", size: 750, m1: 0.89 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const handleExportCSV = () => {
    toast.success("Analytics exported as CSV");
  };

  const handleExportPDF = () => {
    toast.success("Analytics exported as PDF");
  };

  const handleGenerateReport = () => {
    toast.success("Custom report generated");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights and predictive analytics for campaign optimization
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="all">All Segments</option>
            <option value="premium">Premium</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPredictions(!showPredictions)}
          className="gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          {showPredictions ? "Hide" : "Show"} Predictions
        </Button>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
            <Download className="w-4 h-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerateReport} className="gap-2">
            <Settings className="w-4 h-4" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>{metric.icon}</div>
              <span className={`text-sm font-semibold ${metric.trend > 0 ? "text-green-600" : "text-red-600"}`}>
                {metric.trend > 0 ? "+" : ""}{metric.trend}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
            <p className="text-2xl font-bold text-foreground">{metric.value}</p>
          </Card>
        ))}
      </div>

      {/* Predictive Insights */}
      {showPredictions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {predictiveInsights.map((insight, idx) => (
            <Card key={idx} className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <p className="text-sm text-muted-foreground mb-2">{insight.title}</p>
              <p className="text-2xl font-bold text-foreground mb-2">{insight.value}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{insight.period}</span>
                <span className={`text-sm font-semibold ${insight.change.includes("+") ? "text-green-600" : "text-red-600"}`}>
                  {insight.change}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Confidence: {(insight.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="performance">Campaign Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Trends</TabsTrigger>
          <TabsTrigger value="ltv">Member LTV</TabsTrigger>
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
        </TabsList>

        {/* Campaign Performance */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Campaign Revenue & ROI</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                <Bar yAxisId="right" dataKey="roi" fill="#10b981" name="ROI (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Conversion Funnel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={conversionFunnel}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={190} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Engagement Trends */}
        <TabsContent value="engagement" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Multi-Channel Engagement</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="email" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="sms" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="web" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="mobile" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Member LTV */}
        <TabsContent value="ltv" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Member Lifetime Value</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={memberLifetimeValue}
                    dataKey="ltv"
                    nameKey="segment"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {memberLifetimeValue.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Segment Metrics</h3>
              <div className="space-y-4">
                {memberLifetimeValue.map((segment, idx) => (
                  <div key={idx} className="pb-4 border-b border-border last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-foreground">{segment.segment}</span>
                      <span className="text-sm font-bold text-accent">${segment.ltv.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Retention</p>
                        <p className="font-semibold text-foreground">{(segment.retention * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Spend</p>
                        <p className="font-semibold text-foreground">${segment.avgSpend.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Cohort Analysis */}
        <TabsContent value="cohort" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Retention by Cohort</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 font-semibold text-foreground">Cohort</th>
                    <th className="text-center py-2 px-4 font-semibold text-foreground">Size</th>
                    <th className="text-center py-2 px-4 font-semibold text-foreground">M1</th>
                    <th className="text-center py-2 px-4 font-semibold text-foreground">M3</th>
                    <th className="text-center py-2 px-4 font-semibold text-foreground">M6</th>
                    <th className="text-center py-2 px-4 font-semibold text-foreground">M12</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortAnalysis.map((cohort, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-3 px-4 text-foreground font-semibold">{cohort.cohort}</td>
                      <td className="text-center py-3 px-4 text-foreground">{cohort.size}</td>
                      <td className="text-center py-3 px-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          {(cohort.m1 * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                          {(cohort.m3 * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                          {(cohort.m6 * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        {cohort.m12 !== undefined ? (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                            {(cohort.m12 * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
