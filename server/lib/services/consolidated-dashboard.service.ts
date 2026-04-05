/**
 * Consolidated Financial Dashboard Service
 * 
 * Provides unified view across all financial modules:
 * - Treasury & Cash Management
 * - Investment Portfolio
 * - Donations & Fundraising
 * - Grants & Awards
 * - Acquisition Fund
 * - Revenue & Expenses
 */

export interface TreasurySummary {
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

export interface InvestmentSummary {
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

export interface DonationSummary {
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

export interface GrantSummary {
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

export interface AcquisitionFundSummary {
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

export interface RevenueSummary {
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

export interface FinancialAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  category: 'treasury' | 'investment' | 'donation' | 'grant' | 'acquisition' | 'revenue' | 'compliance';
  title: string;
  description: string;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface KeyMetric {
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

export interface ConsolidatedDashboardData {
  asOfDate: string;
  treasury: TreasurySummary;
  investments: InvestmentSummary;
  donations: DonationSummary;
  grants: GrantSummary;
  acquisitionFund: AcquisitionFundSummary;
  revenue: RevenueSummary;
  alerts: FinancialAlert[];
  keyMetrics: KeyMetric[];
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

export interface DashboardFilter {
  houseId?: string;
  entityId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  fiscalYear?: number;
}

export interface DrillDownRequest {
  module: 'treasury' | 'investment' | 'donation' | 'grant' | 'acquisition' | 'revenue';
  metric: string;
  filter?: DashboardFilter;
}

export interface DrillDownData {
  module: string;
  metric: string;
  title: string;
  data: Array<{
    label: string;
    value: number;
    details?: Record<string, any>;
  }>;
  chartType: 'bar' | 'line' | 'pie' | 'table';
  totalValue: number;
}

class ConsolidatedDashboardService {
  /**
   * Get consolidated financial dashboard data
   */
  async getDashboardData(filter?: DashboardFilter): Promise<ConsolidatedDashboardData> {
    const asOfDate = new Date().toISOString();
    
    // In production, these would aggregate from actual database queries
    const treasury = await this.getTreasurySummary(filter);
    const investments = await this.getInvestmentSummary(filter);
    const donations = await this.getDonationSummary(filter);
    const grants = await this.getGrantSummary(filter);
    const acquisitionFund = await this.getAcquisitionFundSummary(filter);
    const revenue = await this.getRevenueSummary(filter);
    const alerts = await this.getFinancialAlerts(filter);
    const keyMetrics = await this.getKeyMetrics(filter);
    
    // Calculate totals
    const totalAssets = treasury.totalCash + investments.totalPortfolioValue + acquisitionFund.totalFundBalance;
    const totalLiabilities = 0; // Would be calculated from accounts payable, loans, etc.
    const totalNetWorth = totalAssets - totalLiabilities;
    
    return {
      asOfDate,
      treasury,
      investments,
      donations,
      grants,
      acquisitionFund,
      revenue,
      alerts,
      keyMetrics,
      totalNetWorth,
      totalAssets,
      totalLiabilities,
    };
  }

  /**
   * Get treasury summary
   */
  async getTreasurySummary(filter?: DashboardFilter): Promise<TreasurySummary> {
    // Mock data - would query from bank accounts and cash management tables
    return {
      totalCash: 1250000,
      operatingAccount: 450000,
      reserveAccount: 500000,
      restrictedFunds: 200000,
      unrestricted: 100000,
      cashFlowMTD: 45000,
      cashFlowYTD: 320000,
      projectedCashPosition30Days: 1280000,
      projectedCashPosition90Days: 1350000,
    };
  }

  /**
   * Get investment portfolio summary
   */
  async getInvestmentSummary(filter?: DashboardFilter): Promise<InvestmentSummary> {
    // Mock data - would aggregate from investment holdings
    return {
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
    };
  }

  /**
   * Get donation summary
   */
  async getDonationSummary(filter?: DashboardFilter): Promise<DonationSummary> {
    // Mock data - would aggregate from donations table
    return {
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
    };
  }

  /**
   * Get grant summary
   */
  async getGrantSummary(filter?: DashboardFilter): Promise<GrantSummary> {
    // Mock data - would aggregate from grants table
    return {
      activeGrants: 8,
      totalGrantValueActive: 1200000,
      grantsReceivedYTD: 5,
      grantAmountYTD: 650000,
      pendingApplications: 4,
      pendingApplicationValue: 450000,
      grantsClosingNext90Days: 2,
      complianceStatus: 'good',
      upcomingReports: 3,
    };
  }

  /**
   * Get acquisition fund summary
   */
  async getAcquisitionFundSummary(filter?: DashboardFilter): Promise<AcquisitionFundSummary> {
    // Mock data - would aggregate from acquisition fund tables
    return {
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
    };
  }

  /**
   * Get revenue summary
   */
  async getRevenueSummary(filter?: DashboardFilter): Promise<RevenueSummary> {
    // Mock data - would aggregate from revenue/expense tables
    return {
      totalRevenueMTD: 185000,
      totalRevenueYTD: 2100000,
      revenueBySource: [
        { source: 'Donations', amount: 750000, percentage: 35.7, trend: 'up' },
        { source: 'Grants', amount: 650000, percentage: 31.0, trend: 'stable' },
        { source: 'Program Fees', amount: 400000, percentage: 19.0, trend: 'up' },
        { source: 'Investment Income', amount: 200000, percentage: 9.5, trend: 'up' },
        { source: 'Other', amount: 100000, percentage: 4.8, trend: 'stable' },
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
    };
  }

  /**
   * Get financial alerts
   */
  async getFinancialAlerts(filter?: DashboardFilter): Promise<FinancialAlert[]> {
    const now = new Date().toISOString();
    
    return [
      {
        id: 'alert-001',
        type: 'warning',
        category: 'grant',
        title: 'Grant Report Due',
        description: 'Quarterly report for Community Development Grant due in 5 days',
        actionRequired: true,
        actionUrl: '/grants/reports',
        createdAt: now,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'alert-002',
        type: 'info',
        category: 'investment',
        title: 'Rebalancing Recommended',
        description: 'Portfolio allocation has drifted 3% from target. Consider rebalancing.',
        actionRequired: false,
        actionUrl: '/investments',
        createdAt: now,
      },
      {
        id: 'alert-003',
        type: 'critical',
        category: 'compliance',
        title: 'Annual Filing Deadline',
        description: 'Form 990 filing deadline in 15 days',
        actionRequired: true,
        actionUrl: '/compliance/filings',
        createdAt: now,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  /**
   * Get key metrics for dashboard
   */
  async getKeyMetrics(filter?: DashboardFilter): Promise<KeyMetric[]> {
    return [
      {
        id: 'metric-001',
        name: 'Total Net Worth',
        value: 4600000,
        formattedValue: '$4.6M',
        unit: 'currency',
        trend: 'up',
        trendValue: 8.5,
        trendPeriod: 'YTD',
        status: 'good',
      },
      {
        id: 'metric-002',
        name: 'Cash Runway',
        value: 18,
        formattedValue: '18 months',
        unit: 'days',
        trend: 'up',
        trendValue: 2,
        trendPeriod: 'vs last quarter',
        target: 12,
        status: 'good',
      },
      {
        id: 'metric-003',
        name: 'Donor Retention Rate',
        value: 72,
        formattedValue: '72%',
        unit: 'percent',
        trend: 'up',
        trendValue: 5,
        trendPeriod: 'vs last year',
        target: 70,
        status: 'good',
      },
      {
        id: 'metric-004',
        name: 'Grant Success Rate',
        value: 45,
        formattedValue: '45%',
        unit: 'percent',
        trend: 'stable',
        trendValue: 0,
        trendPeriod: 'vs last year',
        target: 40,
        status: 'good',
      },
      {
        id: 'metric-005',
        name: 'Investment Return',
        value: 8.6,
        formattedValue: '8.6%',
        unit: 'percent',
        trend: 'up',
        trendValue: 2.1,
        trendPeriod: 'vs benchmark',
        target: 7,
        status: 'good',
      },
      {
        id: 'metric-006',
        name: 'Operating Margin',
        value: 21.4,
        formattedValue: '21.4%',
        unit: 'percent',
        trend: 'up',
        trendValue: 3.2,
        trendPeriod: 'vs last year',
        target: 15,
        status: 'good',
      },
    ];
  }

  /**
   * Get drill-down data for a specific metric
   */
  async getDrillDownData(request: DrillDownRequest): Promise<DrillDownData> {
    const { module, metric, filter } = request;
    
    // Return detailed breakdown based on module and metric
    switch (module) {
      case 'treasury':
        return this.getTreasuryDrillDown(metric, filter);
      case 'investment':
        return this.getInvestmentDrillDown(metric, filter);
      case 'donation':
        return this.getDonationDrillDown(metric, filter);
      case 'grant':
        return this.getGrantDrillDown(metric, filter);
      case 'acquisition':
        return this.getAcquisitionDrillDown(metric, filter);
      case 'revenue':
        return this.getRevenueDrillDown(metric, filter);
      default:
        throw new Error(`Unknown module: ${module}`);
    }
  }

  private async getTreasuryDrillDown(metric: string, filter?: DashboardFilter): Promise<DrillDownData> {
    return {
      module: 'treasury',
      metric,
      title: 'Treasury Cash Flow Details',
      data: [
        { label: 'Operating Account', value: 450000, details: { accountNumber: '****1234', bank: 'First National' } },
        { label: 'Reserve Account', value: 500000, details: { accountNumber: '****5678', bank: 'First National' } },
        { label: 'Restricted Funds', value: 200000, details: { restrictions: ['Education', 'Housing'] } },
        { label: 'Unrestricted', value: 100000 },
      ],
      chartType: 'pie',
      totalValue: 1250000,
    };
  }

  private async getInvestmentDrillDown(metric: string, filter?: DashboardFilter): Promise<DrillDownData> {
    return {
      module: 'investment',
      metric,
      title: 'Investment Portfolio Breakdown',
      data: [
        { label: 'Stocks', value: 1500000, details: { allocation: 60, target: 60 } },
        { label: 'Bonds', value: 625000, details: { allocation: 25, target: 25 } },
        { label: 'Real Estate', value: 250000, details: { allocation: 10, target: 10 } },
        { label: 'Cash', value: 125000, details: { allocation: 5, target: 5 } },
      ],
      chartType: 'pie',
      totalValue: 2500000,
    };
  }

  private async getDonationDrillDown(metric: string, filter?: DashboardFilter): Promise<DrillDownData> {
    return {
      module: 'donation',
      metric,
      title: 'Donation Trends',
      data: [
        { label: 'Jan', value: 55000 },
        { label: 'Feb', value: 48000 },
        { label: 'Mar', value: 62000 },
        { label: 'Apr', value: 58000 },
        { label: 'May', value: 71000 },
        { label: 'Jun', value: 65000 },
        { label: 'Jul', value: 52000 },
        { label: 'Aug', value: 59000 },
        { label: 'Sep', value: 68000 },
        { label: 'Oct', value: 74000 },
        { label: 'Nov', value: 82000 },
        { label: 'Dec', value: 56000 },
      ],
      chartType: 'bar',
      totalValue: 750000,
    };
  }

  private async getGrantDrillDown(metric: string, filter?: DashboardFilter): Promise<DrillDownData> {
    return {
      module: 'grant',
      metric,
      title: 'Active Grants',
      data: [
        { label: 'Community Development', value: 350000, details: { funder: 'State Foundation', endDate: '2026-06-30' } },
        { label: 'Education Initiative', value: 250000, details: { funder: 'Federal DOE', endDate: '2026-09-30' } },
        { label: 'Housing Program', value: 200000, details: { funder: 'HUD', endDate: '2026-12-31' } },
        { label: 'Job Training', value: 150000, details: { funder: 'DOL', endDate: '2026-03-31' } },
        { label: 'Youth Services', value: 125000, details: { funder: 'Private Foundation', endDate: '2026-08-31' } },
        { label: 'Health Outreach', value: 75000, details: { funder: 'CDC', endDate: '2026-05-31' } },
        { label: 'Technology Access', value: 50000, details: { funder: 'Corporate Grant', endDate: '2026-04-30' } },
      ],
      chartType: 'table',
      totalValue: 1200000,
    };
  }

  private async getAcquisitionDrillDown(metric: string, filter?: DashboardFilter): Promise<DrillDownData> {
    return {
      module: 'acquisition',
      metric,
      title: 'Acquisition Fund Progress',
      data: [
        { label: 'Land Acquisition', value: 350000, details: { target: 500000, percent: 70 } },
        { label: 'Building Purchase', value: 250000, details: { target: 400000, percent: 62.5 } },
        { label: 'Infrastructure', value: 150000, details: { target: 200000, percent: 75 } },
        { label: 'Equipment', value: 75000, details: { target: 100000, percent: 75 } },
        { label: 'Emergency Reserve', value: 25000, details: { target: 50000, percent: 50 } },
      ],
      chartType: 'bar',
      totalValue: 850000,
    };
  }

  private async getRevenueDrillDown(metric: string, filter?: DashboardFilter): Promise<DrillDownData> {
    return {
      module: 'revenue',
      metric,
      title: 'Revenue vs Expenses',
      data: [
        { label: 'Q1', value: 450000, details: { revenue: 500000, expenses: 400000 } },
        { label: 'Q2', value: 480000, details: { revenue: 520000, expenses: 420000 } },
        { label: 'Q3', value: 510000, details: { revenue: 540000, expenses: 410000 } },
        { label: 'Q4', value: 660000, details: { revenue: 540000, expenses: 420000 } },
      ],
      chartType: 'line',
      totalValue: 2100000,
    };
  }

  /**
   * Get historical comparison data
   */
  async getHistoricalComparison(
    metric: string,
    periods: number = 4,
    periodType: 'month' | 'quarter' | 'year' = 'quarter'
  ): Promise<Array<{ period: string; value: number; previousValue?: number }>> {
    // Mock historical data
    const data = [];
    const now = new Date();
    
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      if (periodType === 'month') {
        date.setMonth(date.getMonth() - i);
        data.push({
          period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          value: Math.round(100000 + Math.random() * 50000),
          previousValue: Math.round(95000 + Math.random() * 45000),
        });
      } else if (periodType === 'quarter') {
        const quarter = Math.floor(date.getMonth() / 3) - i;
        const year = date.getFullYear() + Math.floor(quarter / 4);
        const q = ((quarter % 4) + 4) % 4 + 1;
        data.push({
          period: `Q${q} ${year}`,
          value: Math.round(400000 + Math.random() * 100000),
          previousValue: Math.round(380000 + Math.random() * 90000),
        });
      } else {
        date.setFullYear(date.getFullYear() - i);
        data.push({
          period: date.getFullYear().toString(),
          value: Math.round(1500000 + Math.random() * 500000),
          previousValue: Math.round(1400000 + Math.random() * 450000),
        });
      }
    }
    
    return data;
  }

  /**
   * Generate executive summary report
   */
  async generateExecutiveSummary(filter?: DashboardFilter): Promise<{
    title: string;
    generatedAt: string;
    highlights: string[];
    concerns: string[];
    recommendations: string[];
    metrics: KeyMetric[];
  }> {
    const dashboardData = await this.getDashboardData(filter);
    
    return {
      title: 'Executive Financial Summary',
      generatedAt: new Date().toISOString(),
      highlights: [
        `Total net worth increased to $${(dashboardData.totalNetWorth / 1000000).toFixed(1)}M`,
        `Investment portfolio returned ${dashboardData.investments.ytdReturnPercent}% YTD, outperforming benchmark`,
        `Donor base grew by ${dashboardData.donations.newDonorsYTD} new donors this year`,
        `Grant success rate maintained at 45% with $${(dashboardData.grants.grantAmountYTD / 1000).toFixed(0)}K received`,
        `Cash runway extended to ${dashboardData.revenue.runwayMonths} months`,
      ],
      concerns: [
        dashboardData.alerts.filter(a => a.type === 'critical').length > 0
          ? `${dashboardData.alerts.filter(a => a.type === 'critical').length} critical alerts require attention`
          : null,
        dashboardData.investments.allocationCompliance !== 'compliant'
          ? 'Investment allocation requires rebalancing'
          : null,
        dashboardData.grants.complianceStatus !== 'good'
          ? 'Grant compliance needs review'
          : null,
      ].filter(Boolean) as string[],
      recommendations: [
        'Continue diversifying revenue sources to reduce grant dependency',
        'Implement automated donor stewardship program to improve retention',
        'Review investment policy for potential allocation adjustments',
        'Accelerate acquisition fund contributions to meet annual targets',
      ],
      metrics: dashboardData.keyMetrics,
    };
  }
}

export const consolidatedDashboardService = new ConsolidatedDashboardService();
