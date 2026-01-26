import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Building2,
  HandHeart,
  FileText,
  Landmark,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronRight,
  Download,
  RefreshCw,
  Target,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";

// Types matching backend service
interface TreasurySummary {
  totalCash: number;
  operatingAccount: number;
  reserveAccount: number;
  restrictedFunds: number;
  unrestricted: number;
  cashFlowMTD: number;
  cashFlowYTD: number;
  projectedCashPosition30Days: number;
  projectedCashPosition90Days: number;
}

interface InvestmentSummary {
  totalPortfolioValue: number;
  totalCostBasis: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  ytdReturn: number;
  ytdReturnPercent: number;
  dividendsYTD: number;
  lastRebalanceDate: string | null;
  allocationCompliance: 'compliant' | 'warning' | 'violation';
  pendingTransactions: number;
}

interface DonationSummary {
  totalDonationsMTD: number;
  totalDonationsYTD: number;
  totalDonorsYTD: number;
  newDonorsYTD: number;
  recurringDonorsActive: number;
  recurringRevenueMTD: number;
  averageDonation: number;
  largestDonationYTD: number;
  donationsByDesignation: Array<{
    designation: string;
    amount: number;
    percentage: number;
  }>;
}

interface GrantSummary {
  activeGrants: number;
  totalGrantValueActive: number;
  grantsReceivedYTD: number;
  grantAmountYTD: number;
  pendingApplications: number;
  pendingApplicationValue: number;
  grantsClosingNext90Days: number;
  complianceStatus: 'good' | 'attention' | 'critical';
  upcomingReports: number;
}

interface AcquisitionFundSummary {
  totalFundBalance: number;
  fundsByCategory: Array<{
    category: string;
    balance: number;
    targetBalance: number;
    percentOfTarget: number;
  }>;
  pendingTransfers: number;
  pendingTransferAmount: number;
  pendingDisbursements: number;
  pendingDisbursementAmount: number;
  contributionsMTD: number;
  contributionsYTD: number;
}

interface RevenueSummary {
  totalRevenueMTD: number;
  totalRevenueYTD: number;
  revenueBySource: Array<{
    source: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  totalExpensesMTD: number;
  totalExpensesYTD: number;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    budgetAmount: number;
    variance: number;
    variancePercent: number;
  }>;
  netIncomeMTD: number;
  netIncomeYTD: number;
  burnRate: number;
  runwayMonths: number;
}

interface FinancialAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  category: string;
  title: string;
  description: string;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

interface KeyMetric {
  id: string;
  name: string;
  value: number;
  formattedValue: string;
  unit: 'currency' | 'percent' | 'number' | 'days';
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  trendPeriod: string;
  target?: number;
  status: 'good' | 'warning' | 'critical';
}

export default function ConsolidatedFinancialDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - in production would come from tRPC
  const dashboardData = useMemo(() => ({
    asOfDate: new Date().toISOString(),
    treasury: {
      totalCash: 1250000,
      operatingAccount: 450000,
      reserveAccount: 500000,
      restrictedFunds: 200000,
      unrestricted: 100000,
      cashFlowMTD: 45000,
      cashFlowYTD: 320000,
      projectedCashPosition30Days: 1280000,
      projectedCashPosition90Days: 1350000,
    } as TreasurySummary,
    investments: {
      totalPortfolioValue: 2500000,
      totalCostBasis: 2150000,
      unrealizedGainLoss: 350000,
      unrealizedGainLossPercent: 16.28,
      ytdReturn: 215000,
      ytdReturnPercent: 8.6,
      dividendsYTD: 45000,
      lastRebalanceDate: '2025-12-15',
      allocationCompliance: 'compliant',
      pendingTransactions: 2,
    } as InvestmentSummary,
    donations: {
      totalDonationsMTD: 85000,
      totalDonationsYTD: 750000,
      totalDonorsYTD: 342,
      newDonorsYTD: 89,
      recurringDonorsActive: 156,
      recurringRevenueMTD: 32000,
      averageDonation: 2193,
      largestDonationYTD: 50000,
      donationsByDesignation: [
        { designation: 'General Fund', amount: 300000, percentage: 40 },
        { designation: 'Education', amount: 187500, percentage: 25 },
        { designation: 'Housing', amount: 150000, percentage: 20 },
        { designation: 'Jobs Program', amount: 75000, percentage: 10 },
        { designation: 'Emergency Fund', amount: 37500, percentage: 5 },
      ],
    } as DonationSummary,
    grants: {
      activeGrants: 8,
      totalGrantValueActive: 1200000,
      grantsReceivedYTD: 5,
      grantAmountYTD: 650000,
      pendingApplications: 4,
      pendingApplicationValue: 450000,
      grantsClosingNext90Days: 2,
      complianceStatus: 'good',
      upcomingReports: 3,
    } as GrantSummary,
    acquisitionFund: {
      totalFundBalance: 850000,
      fundsByCategory: [
        { category: 'Land Acquisition', balance: 350000, targetBalance: 500000, percentOfTarget: 70 },
        { category: 'Building Purchase', balance: 250000, targetBalance: 400000, percentOfTarget: 62.5 },
        { category: 'Infrastructure', balance: 150000, targetBalance: 200000, percentOfTarget: 75 },
        { category: 'Equipment', balance: 75000, targetBalance: 100000, percentOfTarget: 75 },
        { category: 'Emergency Reserve', balance: 25000, targetBalance: 50000, percentOfTarget: 50 },
      ],
      pendingTransfers: 2,
      pendingTransferAmount: 25000,
      pendingDisbursements: 1,
      pendingDisbursementAmount: 75000,
      contributionsMTD: 15000,
      contributionsYTD: 180000,
    } as AcquisitionFundSummary,
    revenue: {
      totalRevenueMTD: 185000,
      totalRevenueYTD: 2100000,
      revenueBySource: [
        { source: 'Donations', amount: 750000, percentage: 35.7, trend: 'up' as const },
        { source: 'Grants', amount: 650000, percentage: 31.0, trend: 'stable' as const },
        { source: 'Program Fees', amount: 400000, percentage: 19.0, trend: 'up' as const },
        { source: 'Investment Income', amount: 200000, percentage: 9.5, trend: 'up' as const },
        { source: 'Other', amount: 100000, percentage: 4.8, trend: 'stable' as const },
      ],
      totalExpensesMTD: 145000,
      totalExpensesYTD: 1650000,
      expensesByCategory: [
        { category: 'Personnel', amount: 825000, budgetAmount: 850000, variance: 25000, variancePercent: 2.9 },
        { category: 'Programs', amount: 412500, budgetAmount: 400000, variance: -12500, variancePercent: -3.1 },
        { category: 'Operations', amount: 247500, budgetAmount: 250000, variance: 2500, variancePercent: 1.0 },
        { category: 'Administration', amount: 165000, budgetAmount: 175000, variance: 10000, variancePercent: 5.7 },
      ],
      netIncomeMTD: 40000,
      netIncomeYTD: 450000,
      burnRate: 137500,
      runwayMonths: 18,
    } as RevenueSummary,
    alerts: [
      {
        id: 'alert-001',
        type: 'warning' as const,
        category: 'grant',
        title: 'Grant Report Due',
        description: 'Quarterly report for Community Development Grant due in 5 days',
        actionRequired: true,
        actionUrl: '/grants/reports',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'alert-002',
        type: 'info' as const,
        category: 'investment',
        title: 'Rebalancing Recommended',
        description: 'Portfolio allocation has drifted 3% from target. Consider rebalancing.',
        actionRequired: false,
        actionUrl: '/investments',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'alert-003',
        type: 'critical' as const,
        category: 'compliance',
        title: 'Annual Filing Deadline',
        description: 'Form 990 filing deadline in 15 days',
        actionRequired: true,
        actionUrl: '/compliance/filings',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ] as FinancialAlert[],
    keyMetrics: [
      {
        id: 'metric-001',
        name: 'Total Net Worth',
        value: 4600000,
        formattedValue: '$4.6M',
        unit: 'currency' as const,
        trend: 'up' as const,
        trendValue: 8.5,
        trendPeriod: 'YTD',
        status: 'good' as const,
      },
      {
        id: 'metric-002',
        name: 'Cash Runway',
        value: 18,
        formattedValue: '18 months',
        unit: 'days' as const,
        trend: 'up' as const,
        trendValue: 2,
        trendPeriod: 'vs last quarter',
        target: 12,
        status: 'good' as const,
      },
      {
        id: 'metric-003',
        name: 'Donor Retention',
        value: 72,
        formattedValue: '72%',
        unit: 'percent' as const,
        trend: 'up' as const,
        trendValue: 5,
        trendPeriod: 'vs last year',
        target: 70,
        status: 'good' as const,
      },
      {
        id: 'metric-004',
        name: 'Grant Success Rate',
        value: 45,
        formattedValue: '45%',
        unit: 'percent' as const,
        trend: 'stable' as const,
        trendValue: 0,
        trendPeriod: 'vs last year',
        target: 40,
        status: 'good' as const,
      },
      {
        id: 'metric-005',
        name: 'Investment Return',
        value: 8.6,
        formattedValue: '8.6%',
        unit: 'percent' as const,
        trend: 'up' as const,
        trendValue: 2.1,
        trendPeriod: 'vs benchmark',
        target: 7,
        status: 'good' as const,
      },
      {
        id: 'metric-006',
        name: 'Operating Margin',
        value: 21.4,
        formattedValue: '21.4%',
        unit: 'percent' as const,
        trend: 'up' as const,
        trendValue: 3.2,
        trendPeriod: 'vs last year',
        target: 15,
        status: 'good' as const,
      },
    ] as KeyMetric[],
    totalNetWorth: 4600000,
    totalAssets: 4600000,
    totalLiabilities: 0,
  }), []);

  const formatCurrency = (value: number, compact = false) => {
    if (compact && Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (compact && Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success("Dashboard data refreshed");
  };

  const handleExport = () => {
    toast.success("Exporting financial summary...");
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertIcon = (type: 'warning' | 'critical' | 'info') => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'warning':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Dashboard</h1>
            <p className="text-muted-foreground">
              Consolidated view of all financial modules • Updated {new Date(dashboardData.asOfDate).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtd">MTD</SelectItem>
                <SelectItem value="qtd">QTD</SelectItem>
                <SelectItem value="ytd">YTD</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Alerts Section */}
        {dashboardData.alerts.length > 0 && (
          <div className="space-y-2">
            {dashboardData.alerts.filter(a => a.type === 'critical').map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">{alert.title}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{alert.description}</p>
                  </div>
                </div>
                {alert.actionUrl && (
                  <Link href={alert.actionUrl}>
                    <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                      Take Action
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dashboardData.keyMetrics.map((metric) => (
            <Card key={metric.id} className="relative overflow-hidden">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{metric.name}</p>
                    <p className="text-xl font-bold mt-1">{metric.formattedValue}</p>
                  </div>
                  <Badge className={`${getStatusColor(metric.status)} text-xs`}>
                    {getTrendIcon(metric.trend)}
                    <span className="ml-1">
                      {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}
                      {metric.trendValue}
                      {metric.unit === 'percent' ? 'pp' : '%'}
                    </span>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{metric.trendPeriod}</p>
                {metric.target && (
                  <div className="mt-2">
                    <Progress value={(metric.value / metric.target) * 100} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-1">Target: {metric.target}{metric.unit === 'percent' ? '%' : ''}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="treasury" className="gap-2">
              <Wallet className="h-4 w-4" />
              Treasury
            </TabsTrigger>
            <TabsTrigger value="investments" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Investments
            </TabsTrigger>
            <TabsTrigger value="fundraising" className="gap-2">
              <HandHeart className="h-4 w-4" />
              Fundraising
            </TabsTrigger>
            <TabsTrigger value="grants" className="gap-2">
              <FileText className="h-4 w-4" />
              Grants
            </TabsTrigger>
            <TabsTrigger value="operations" className="gap-2">
              <Building2 className="h-4 w-4" />
              Operations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Net Worth Summary */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Net Worth Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-4xl font-bold text-green-600">
                      {formatCurrency(dashboardData.totalNetWorth, true)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Total Net Worth</p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cash & Equivalents</span>
                      <span className="font-medium">{formatCurrency(dashboardData.treasury.totalCash, true)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Investments</span>
                      <span className="font-medium">{formatCurrency(dashboardData.investments.totalPortfolioValue, true)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Acquisition Fund</span>
                      <span className="font-medium">{formatCurrency(dashboardData.acquisitionFund.totalFundBalance, true)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Assets</span>
                      <span>{formatCurrency(dashboardData.totalAssets, true)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue vs Expenses */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Revenue vs Expenses (YTD)
                    </CardTitle>
                    <Link href="/finance">
                      <Button variant="ghost" size="sm">
                        View Details <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(dashboardData.revenue.totalRevenueYTD, true)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(dashboardData.revenue.totalExpensesYTD, true)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(dashboardData.revenue.netIncomeYTD, true)}
                      </p>
                      <p className="text-sm text-muted-foreground">Net Income</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Revenue by Source</span>
                      </div>
                      <div className="space-y-2">
                        {dashboardData.revenue.revenueBySource.map((source, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-24 text-xs truncate">{source.source}</div>
                            <div className="flex-1">
                              <Progress value={source.percentage} className="h-2" />
                            </div>
                            <div className="w-16 text-xs text-right">{source.percentage}%</div>
                            {getTrendIcon(source.trend)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Module Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Treasury Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-blue-500" />
                      Treasury
                    </CardTitle>
                    <Link href="/treasury">
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.treasury.totalCash, true)}</p>
                  <p className="text-sm text-muted-foreground">Total Cash</p>
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cash Flow MTD</span>
                      <span className={dashboardData.treasury.cashFlowMTD >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {dashboardData.treasury.cashFlowMTD >= 0 ? '+' : ''}{formatCurrency(dashboardData.treasury.cashFlowMTD, true)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">30-Day Projection</span>
                      <span>{formatCurrency(dashboardData.treasury.projectedCashPosition30Days, true)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investments Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Investments
                    </CardTitle>
                    <Link href="/investments">
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.investments.totalPortfolioValue, true)}</p>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">YTD Return</span>
                      <span className="text-green-600">+{dashboardData.investments.ytdReturnPercent}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unrealized G/L</span>
                      <span className={dashboardData.investments.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {dashboardData.investments.unrealizedGainLoss >= 0 ? '+' : ''}{formatCurrency(dashboardData.investments.unrealizedGainLoss, true)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Donations Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <HandHeart className="h-4 w-4 text-pink-500" />
                      Donations
                    </CardTitle>
                    <Link href="/donate">
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.donations.totalDonationsYTD, true)}</p>
                  <p className="text-sm text-muted-foreground">YTD Donations</p>
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Donors</span>
                      <span>{dashboardData.donations.totalDonorsYTD}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Recurring Active</span>
                      <span>{dashboardData.donations.recurringDonorsActive}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grants Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      Grants
                    </CardTitle>
                    <Link href="/grants">
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.grants.totalGrantValueActive, true)}</p>
                  <p className="text-sm text-muted-foreground">Active Grant Value</p>
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Grants</span>
                      <span>{dashboardData.grants.activeGrants}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pending Apps</span>
                      <span>{dashboardData.grants.pendingApplications}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts and Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Pending Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {dashboardData.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          {getAlertIcon(alert.type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{alert.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {alert.description}
                            </p>
                          </div>
                          {alert.actionUrl && (
                            <Link href={alert.actionUrl}>
                              <Button variant="ghost" size="sm">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Acquisition Fund Progress */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-amber-500" />
                      Acquisition Fund
                    </CardTitle>
                    <Link href="/treasury/acquisition-fund">
                      <Button variant="ghost" size="sm">
                        View Details <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <CardDescription>
                    Total Balance: {formatCurrency(dashboardData.acquisitionFund.totalFundBalance)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.acquisitionFund.fundsByCategory.map((fund, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{fund.category}</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(fund.balance, true)} / {formatCurrency(fund.targetBalance, true)}
                          </span>
                        </div>
                        <Progress value={fund.percentOfTarget} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Treasury Tab */}
          <TabsContent value="treasury" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Wallet className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Operating Account</p>
                      <p className="text-2xl font-bold">{formatCurrency(dashboardData.treasury.operatingAccount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reserve Account</p>
                      <p className="text-2xl font-bold">{formatCurrency(dashboardData.treasury.reserveAccount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Building2 className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Restricted Funds</p>
                      <p className="text-2xl font-bold">{formatCurrency(dashboardData.treasury.restrictedFunds)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unrestricted</p>
                      <p className="text-2xl font-bold">{formatCurrency(dashboardData.treasury.unrestricted)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Cash Flow MTD</p>
                    <p className={`text-2xl font-bold ${dashboardData.treasury.cashFlowMTD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {dashboardData.treasury.cashFlowMTD >= 0 ? '+' : ''}{formatCurrency(dashboardData.treasury.cashFlowMTD)}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Cash Flow YTD</p>
                    <p className={`text-2xl font-bold ${dashboardData.treasury.cashFlowYTD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {dashboardData.treasury.cashFlowYTD >= 0 ? '+' : ''}{formatCurrency(dashboardData.treasury.cashFlowYTD)}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">90-Day Projection</p>
                    <p className="text-2xl font-bold">{formatCurrency(dashboardData.treasury.projectedCashPosition90Days)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.investments.totalPortfolioValue)}</p>
                  <Badge className="mt-2" variant={dashboardData.investments.allocationCompliance === 'compliant' ? 'default' : 'destructive'}>
                    {dashboardData.investments.allocationCompliance}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">YTD Return</p>
                  <p className="text-2xl font-bold text-green-600">+{dashboardData.investments.ytdReturnPercent}%</p>
                  <p className="text-sm text-muted-foreground mt-1">{formatCurrency(dashboardData.investments.ytdReturn)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Unrealized Gain/Loss</p>
                  <p className={`text-2xl font-bold ${dashboardData.investments.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardData.investments.unrealizedGainLoss >= 0 ? '+' : ''}{formatCurrency(dashboardData.investments.unrealizedGainLoss)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{dashboardData.investments.unrealizedGainLossPercent}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Dividends YTD</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.investments.dividendsYTD)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last rebalance: {dashboardData.investments.lastRebalanceDate ? new Date(dashboardData.investments.lastRebalanceDate).toLocaleDateString() : 'Never'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              <Link href="/investments">
                <Button>
                  <PieChart className="h-4 w-4 mr-2" />
                  View Portfolio
                </Button>
              </Link>
              <Link href="/investment-governance">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Governance
                </Button>
              </Link>
              <Link href="/investment-reports">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Fundraising Tab */}
          <TabsContent value="fundraising" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">YTD Donations</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.donations.totalDonationsYTD)}</p>
                  <p className="text-sm text-green-600 mt-1">MTD: {formatCurrency(dashboardData.donations.totalDonationsMTD)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Donors</p>
                  <p className="text-2xl font-bold">{dashboardData.donations.totalDonorsYTD}</p>
                  <p className="text-sm text-green-600 mt-1">+{dashboardData.donations.newDonorsYTD} new this year</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Recurring Donors</p>
                  <p className="text-2xl font-bold">{dashboardData.donations.recurringDonorsActive}</p>
                  <p className="text-sm text-muted-foreground mt-1">{formatCurrency(dashboardData.donations.recurringRevenueMTD)}/mo</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Average Donation</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.donations.averageDonation)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Largest: {formatCurrency(dashboardData.donations.largestDonationYTD)}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Donations by Designation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.donations.donationsByDesignation.map((d, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{d.designation}</span>
                        <span>{formatCurrency(d.amount)} ({d.percentage}%)</span>
                      </div>
                      <Progress value={d.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grants Tab */}
          <TabsContent value="grants" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Active Grants</p>
                  <p className="text-2xl font-bold">{dashboardData.grants.activeGrants}</p>
                  <p className="text-sm text-muted-foreground mt-1">{formatCurrency(dashboardData.grants.totalGrantValueActive)} total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">YTD Received</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.grants.grantAmountYTD)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{dashboardData.grants.grantsReceivedYTD} grants</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Pending Applications</p>
                  <p className="text-2xl font-bold">{dashboardData.grants.pendingApplications}</p>
                  <p className="text-sm text-muted-foreground mt-1">{formatCurrency(dashboardData.grants.pendingApplicationValue)} potential</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Compliance Status</p>
                  <Badge className={`mt-1 ${getStatusColor(dashboardData.grants.complianceStatus)}`}>
                    {dashboardData.grants.complianceStatus.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">{dashboardData.grants.upcomingReports} reports due</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              <Link href="/grants">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Grants
                </Button>
              </Link>
              <Link href="/grant-tracking">
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Track Progress
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Burn Rate</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.revenue.burnRate)}/mo</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Runway</p>
                  <p className="text-2xl font-bold">{dashboardData.revenue.runwayMonths} months</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Operating Margin</p>
                  <p className="text-2xl font-bold text-green-600">21.4%</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Expense Budget Variance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.revenue.expensesByCategory.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-28 text-sm">{cat.category}</div>
                      <div className="flex-1">
                        <Progress 
                          value={(cat.amount / cat.budgetAmount) * 100} 
                          className="h-3"
                        />
                      </div>
                      <div className="w-24 text-sm text-right">
                        {formatCurrency(cat.amount, true)} / {formatCurrency(cat.budgetAmount, true)}
                      </div>
                      <div className={`w-16 text-sm text-right ${cat.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {cat.variance >= 0 ? '+' : ''}{cat.variancePercent.toFixed(1)}%
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
