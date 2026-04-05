/**
 * Quarterly Investment Report Generator Service
 * 
 * Generates comprehensive quarterly reports with portfolio performance,
 * allocation changes, governance decisions, and compliance status for board review.
 */

// Report period types
export type ReportPeriod = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface QuarterlyReportConfig {
  year: number;
  quarter: ReportPeriod;
  portfolioId: string;
  includeGovernance?: boolean;
  includeCompliance?: boolean;
  includeBenchmarks?: boolean;
  includeTransactions?: boolean;
  compareToLastQuarter?: boolean;
  compareToLastYear?: boolean;
}

export interface PortfolioPerformance {
  startValue: number;
  endValue: number;
  netContributions: number;
  netWithdrawals: number;
  totalReturn: number;
  totalReturnPercent: number;
  timeWeightedReturn: number;
  moneyWeightedReturn: number;
  realizedGains: number;
  unrealizedGains: number;
  dividendsReceived: number;
  interestReceived: number;
  feesAndExpenses: number;
}

export interface AssetAllocationSnapshot {
  assetClass: string;
  riskTier: string;
  marketValue: number;
  percentOfPortfolio: number;
  targetPercent: number;
  deviation: number;
  quarterlyChange: number;
}

export interface BenchmarkComparison {
  benchmarkName: string;
  benchmarkReturn: number;
  portfolioReturn: number;
  alpha: number;
  trackingError: number;
  informationRatio: number;
}

export interface GovernanceActivity {
  totalProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
  pendingProposals: number;
  totalVotesCast: number;
  averageApprovalRate: number;
  meetingsHeld: number;
  keyDecisions: GovernanceDecision[];
}

export interface GovernanceDecision {
  date: string;
  type: string;
  description: string;
  outcome: 'approved' | 'rejected' | 'tabled';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
}

export interface ComplianceStatus {
  overallStatus: 'compliant' | 'minor_violations' | 'major_violations';
  policyViolations: PolicyViolation[];
  concentrationLimitStatus: 'within_limits' | 'approaching_limits' | 'exceeded';
  esgComplianceScore: number;
  prohibitedAssetCheck: 'passed' | 'failed';
  rebalancingRequired: boolean;
  upcomingDeadlines: ComplianceDeadline[];
}

export interface PolicyViolation {
  policyName: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedDate: string;
  status: 'open' | 'resolved' | 'waived';
  resolution?: string;
}

export interface ComplianceDeadline {
  name: string;
  dueDate: string;
  description: string;
  status: 'upcoming' | 'due_soon' | 'overdue';
}

export interface TopHolding {
  ticker: string;
  name: string;
  assetClass: string;
  marketValue: number;
  percentOfPortfolio: number;
  quarterlyReturn: number;
  costBasis: number;
  unrealizedGain: number;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalBuys: number;
  totalSells: number;
  totalDividends: number;
  totalTransfers: number;
  netInflows: number;
  netOutflows: number;
  largestPurchase: TransactionDetail | null;
  largestSale: TransactionDetail | null;
}

export interface TransactionDetail {
  date: string;
  type: string;
  ticker: string;
  amount: number;
  shares?: number;
  price?: number;
}

export interface QuarterlyInvestmentReport {
  reportId: string;
  generatedAt: string;
  reportPeriod: {
    year: number;
    quarter: ReportPeriod;
    startDate: string;
    endDate: string;
  };
  portfolioId: string;
  portfolioName: string;
  
  // Executive Summary
  executiveSummary: {
    totalPortfolioValue: number;
    quarterlyReturn: number;
    quarterlyReturnPercent: number;
    ytdReturn: number;
    ytdReturnPercent: number;
    keyHighlights: string[];
    keyRisks: string[];
    recommendations: string[];
  };
  
  // Detailed Sections
  performance: PortfolioPerformance;
  assetAllocation: AssetAllocationSnapshot[];
  topHoldings: TopHolding[];
  benchmarkComparisons?: BenchmarkComparison[];
  governanceActivity?: GovernanceActivity;
  complianceStatus?: ComplianceStatus;
  transactionSummary?: TransactionSummary;
  
  // Period Comparisons
  quarterOverQuarter?: {
    valueChange: number;
    valueChangePercent: number;
    allocationChanges: { assetClass: string; change: number }[];
  };
  yearOverYear?: {
    valueChange: number;
    valueChangePercent: number;
    allocationChanges: { assetClass: string; change: number }[];
  };
  
  // Appendices
  appendices: {
    fullHoldingsList: TopHolding[];
    fullTransactionList: TransactionDetail[];
    policyDocumentReferences: string[];
  };
}

// Helper functions
function getQuarterDates(year: number, quarter: ReportPeriod): { startDate: Date; endDate: Date } {
  const quarterMap: Record<ReportPeriod, { startMonth: number; endMonth: number }> = {
    Q1: { startMonth: 0, endMonth: 2 },
    Q2: { startMonth: 3, endMonth: 5 },
    Q3: { startMonth: 6, endMonth: 8 },
    Q4: { startMonth: 9, endMonth: 11 },
  };
  
  const { startMonth, endMonth } = quarterMap[quarter];
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, endMonth + 1, 0); // Last day of end month
  
  return { startDate, endDate };
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function generateReportId(): string {
  return `RPT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// Mock data generators for demonstration
function generateMockPerformance(config: QuarterlyReportConfig): PortfolioPerformance {
  const startValue = 1000000 + Math.random() * 500000;
  const totalReturn = startValue * (Math.random() * 0.15 - 0.05); // -5% to +10%
  const endValue = startValue + totalReturn;
  
  return {
    startValue,
    endValue,
    netContributions: Math.random() * 50000,
    netWithdrawals: Math.random() * 25000,
    totalReturn,
    totalReturnPercent: (totalReturn / startValue) * 100,
    timeWeightedReturn: (totalReturn / startValue) * 100 * (1 + Math.random() * 0.1),
    moneyWeightedReturn: (totalReturn / startValue) * 100 * (1 - Math.random() * 0.1),
    realizedGains: Math.random() * 20000,
    unrealizedGains: Math.random() * 50000 - 10000,
    dividendsReceived: Math.random() * 15000,
    interestReceived: Math.random() * 5000,
    feesAndExpenses: Math.random() * 3000,
  };
}

function generateMockAllocation(): AssetAllocationSnapshot[] {
  const allocations: AssetAllocationSnapshot[] = [
    { assetClass: 'US Equities', riskTier: 'stock', marketValue: 400000, percentOfPortfolio: 40, targetPercent: 40, deviation: 0, quarterlyChange: 2.5 },
    { assetClass: 'International Equities', riskTier: 'stock', marketValue: 150000, percentOfPortfolio: 15, targetPercent: 15, deviation: 0, quarterlyChange: -1.2 },
    { assetClass: 'Fixed Income', riskTier: 'index', marketValue: 250000, percentOfPortfolio: 25, targetPercent: 25, deviation: 0, quarterlyChange: 0.5 },
    { assetClass: 'Real Estate', riskTier: 'property', marketValue: 100000, percentOfPortfolio: 10, targetPercent: 10, deviation: 0, quarterlyChange: 1.0 },
    { assetClass: 'Cash & Equivalents', riskTier: 'cash', marketValue: 50000, percentOfPortfolio: 5, targetPercent: 5, deviation: 0, quarterlyChange: -0.3 },
    { assetClass: 'Cryptocurrency', riskTier: 'volatile_crypto', marketValue: 50000, percentOfPortfolio: 5, targetPercent: 5, deviation: 0, quarterlyChange: 5.2 },
  ];
  
  return allocations;
}

function generateMockTopHoldings(): TopHolding[] {
  return [
    { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', assetClass: 'US Equities', marketValue: 150000, percentOfPortfolio: 15, quarterlyReturn: 3.2, costBasis: 140000, unrealizedGain: 10000 },
    { ticker: 'VXUS', name: 'Vanguard Total International Stock ETF', assetClass: 'International Equities', marketValue: 100000, percentOfPortfolio: 10, quarterlyReturn: 1.8, costBasis: 95000, unrealizedGain: 5000 },
    { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', assetClass: 'Fixed Income', marketValue: 150000, percentOfPortfolio: 15, quarterlyReturn: 0.5, costBasis: 152000, unrealizedGain: -2000 },
    { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', assetClass: 'Real Estate', marketValue: 75000, percentOfPortfolio: 7.5, quarterlyReturn: 2.1, costBasis: 70000, unrealizedGain: 5000 },
    { ticker: 'AAPL', name: 'Apple Inc.', assetClass: 'US Equities', marketValue: 50000, percentOfPortfolio: 5, quarterlyReturn: 4.5, costBasis: 45000, unrealizedGain: 5000 },
    { ticker: 'MSFT', name: 'Microsoft Corporation', assetClass: 'US Equities', marketValue: 45000, percentOfPortfolio: 4.5, quarterlyReturn: 5.2, costBasis: 40000, unrealizedGain: 5000 },
    { ticker: 'BTC', name: 'Bitcoin', assetClass: 'Cryptocurrency', marketValue: 30000, percentOfPortfolio: 3, quarterlyReturn: 12.5, costBasis: 25000, unrealizedGain: 5000 },
    { ticker: 'ETH', name: 'Ethereum', assetClass: 'Cryptocurrency', marketValue: 20000, percentOfPortfolio: 2, quarterlyReturn: 8.3, costBasis: 18000, unrealizedGain: 2000 },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', assetClass: 'US Equities', marketValue: 40000, percentOfPortfolio: 4, quarterlyReturn: 3.8, costBasis: 38000, unrealizedGain: 2000 },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', assetClass: 'US Equities', marketValue: 35000, percentOfPortfolio: 3.5, quarterlyReturn: 2.9, costBasis: 33000, unrealizedGain: 2000 },
  ];
}

function generateMockBenchmarks(): BenchmarkComparison[] {
  return [
    { benchmarkName: 'S&P 500', benchmarkReturn: 4.2, portfolioReturn: 3.8, alpha: -0.4, trackingError: 1.2, informationRatio: -0.33 },
    { benchmarkName: '60/40 Portfolio', benchmarkReturn: 2.8, portfolioReturn: 3.8, alpha: 1.0, trackingError: 0.8, informationRatio: 1.25 },
    { benchmarkName: 'Bloomberg Aggregate Bond', benchmarkReturn: 0.5, portfolioReturn: 0.6, alpha: 0.1, trackingError: 0.3, informationRatio: 0.33 },
  ];
}

function generateMockGovernance(): GovernanceActivity {
  return {
    totalProposals: 12,
    approvedProposals: 9,
    rejectedProposals: 2,
    pendingProposals: 1,
    totalVotesCast: 84,
    averageApprovalRate: 75,
    meetingsHeld: 3,
    keyDecisions: [
      { date: '2026-01-15', type: 'new_investment', description: 'Approved $50,000 allocation to renewable energy ETF', outcome: 'approved', votesFor: 7, votesAgainst: 1, votesAbstain: 0 },
      { date: '2026-01-22', type: 'reallocation', description: 'Rebalanced crypto holdings to maintain 5% target', outcome: 'approved', votesFor: 6, votesAgainst: 2, votesAbstain: 0 },
      { date: '2026-02-05', type: 'policy_change', description: 'Updated ESG screening criteria', outcome: 'approved', votesFor: 8, votesAgainst: 0, votesAbstain: 0 },
    ],
  };
}

function generateMockCompliance(): ComplianceStatus {
  return {
    overallStatus: 'compliant',
    policyViolations: [],
    concentrationLimitStatus: 'within_limits',
    esgComplianceScore: 85,
    prohibitedAssetCheck: 'passed',
    rebalancingRequired: false,
    upcomingDeadlines: [
      { name: 'Annual Investment Policy Review', dueDate: '2026-03-31', description: 'Review and update investment policy statement', status: 'upcoming' },
      { name: 'Quarterly Rebalancing', dueDate: '2026-04-15', description: 'Quarterly portfolio rebalancing review', status: 'upcoming' },
    ],
  };
}

function generateMockTransactions(): TransactionSummary {
  return {
    totalTransactions: 45,
    totalBuys: 28,
    totalSells: 12,
    totalDividends: 5,
    totalTransfers: 0,
    netInflows: 75000,
    netOutflows: 25000,
    largestPurchase: { date: '2026-01-10', type: 'buy', ticker: 'VTI', amount: 25000, shares: 100, price: 250 },
    largestSale: { date: '2026-02-15', type: 'sell', ticker: 'AAPL', amount: 15000, shares: 75, price: 200 },
  };
}

function generateExecutiveSummary(
  performance: PortfolioPerformance,
  allocation: AssetAllocationSnapshot[],
  compliance: ComplianceStatus | undefined
): QuarterlyInvestmentReport['executiveSummary'] {
  const highlights: string[] = [];
  const risks: string[] = [];
  const recommendations: string[] = [];
  
  // Generate highlights based on performance
  if (performance.totalReturnPercent > 0) {
    highlights.push(`Portfolio gained ${performance.totalReturnPercent.toFixed(2)}% this quarter`);
  }
  if (performance.dividendsReceived > 10000) {
    highlights.push(`Received $${performance.dividendsReceived.toLocaleString()} in dividend income`);
  }
  if (performance.unrealizedGains > 0) {
    highlights.push(`Unrealized gains of $${performance.unrealizedGains.toLocaleString()}`);
  }
  
  // Generate risks
  const cryptoAllocation = allocation.find(a => a.riskTier === 'volatile_crypto');
  if (cryptoAllocation && cryptoAllocation.percentOfPortfolio > 5) {
    risks.push('Cryptocurrency allocation exceeds target, increasing portfolio volatility');
  }
  if (performance.totalReturnPercent < 0) {
    risks.push('Negative quarterly return may impact long-term goals');
  }
  
  // Generate recommendations
  const deviations = allocation.filter(a => Math.abs(a.deviation) > 2);
  if (deviations.length > 0) {
    recommendations.push('Consider rebalancing to bring allocations back to target');
  }
  if (compliance?.rebalancingRequired) {
    recommendations.push('Rebalancing required per investment policy');
  }
  recommendations.push('Continue regular contributions to maintain dollar-cost averaging');
  
  return {
    totalPortfolioValue: performance.endValue,
    quarterlyReturn: performance.totalReturn,
    quarterlyReturnPercent: performance.totalReturnPercent,
    ytdReturn: performance.totalReturn * 1.5, // Simplified YTD calculation
    ytdReturnPercent: performance.totalReturnPercent * 1.5,
    keyHighlights: highlights.length > 0 ? highlights : ['Portfolio performance in line with expectations'],
    keyRisks: risks.length > 0 ? risks : ['No significant risks identified this quarter'],
    recommendations: recommendations,
  };
}

/**
 * Generate a comprehensive quarterly investment report
 */
export function generateQuarterlyReport(config: QuarterlyReportConfig): QuarterlyInvestmentReport {
  const { startDate, endDate } = getQuarterDates(config.year, config.quarter);
  
  // Generate mock data (in production, this would fetch from database)
  const performance = generateMockPerformance(config);
  const allocation = generateMockAllocation();
  const topHoldings = generateMockTopHoldings();
  const benchmarks = config.includeBenchmarks ? generateMockBenchmarks() : undefined;
  const governance = config.includeGovernance ? generateMockGovernance() : undefined;
  const compliance = config.includeCompliance ? generateMockCompliance() : undefined;
  const transactions = config.includeTransactions ? generateMockTransactions() : undefined;
  
  const executiveSummary = generateExecutiveSummary(performance, allocation, compliance);
  
  const report: QuarterlyInvestmentReport = {
    reportId: generateReportId(),
    generatedAt: new Date().toISOString(),
    reportPeriod: {
      year: config.year,
      quarter: config.quarter,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
    portfolioId: config.portfolioId,
    portfolioName: 'LuvOnPurpose Investment Portfolio',
    executiveSummary,
    performance,
    assetAllocation: allocation,
    topHoldings,
    benchmarkComparisons: benchmarks,
    governanceActivity: governance,
    complianceStatus: compliance,
    transactionSummary: transactions,
    appendices: {
      fullHoldingsList: topHoldings,
      fullTransactionList: transactions ? [
        transactions.largestPurchase,
        transactions.largestSale,
      ].filter((t): t is TransactionDetail => t !== null) : [],
      policyDocumentReferences: [
        'Investment Policy Statement v2.1',
        'ESG Screening Guidelines',
        'Risk Management Framework',
      ],
    },
  };
  
  // Add period comparisons if requested
  if (config.compareToLastQuarter) {
    report.quarterOverQuarter = {
      valueChange: performance.totalReturn * 0.8,
      valueChangePercent: performance.totalReturnPercent * 0.8,
      allocationChanges: allocation.map(a => ({ assetClass: a.assetClass, change: a.quarterlyChange })),
    };
  }
  
  if (config.compareToLastYear) {
    report.yearOverYear = {
      valueChange: performance.totalReturn * 3,
      valueChangePercent: performance.totalReturnPercent * 3,
      allocationChanges: allocation.map(a => ({ assetClass: a.assetClass, change: a.quarterlyChange * 4 })),
    };
  }
  
  return report;
}

/**
 * Generate report for a specific date range (custom period)
 */
export function generateCustomPeriodReport(
  portfolioId: string,
  startDate: Date,
  endDate: Date,
  options: Partial<QuarterlyReportConfig> = {}
): QuarterlyInvestmentReport {
  // Determine which quarter the end date falls into
  const month = endDate.getMonth();
  let quarter: ReportPeriod;
  if (month <= 2) quarter = 'Q1';
  else if (month <= 5) quarter = 'Q2';
  else if (month <= 8) quarter = 'Q3';
  else quarter = 'Q4';
  
  return generateQuarterlyReport({
    year: endDate.getFullYear(),
    quarter,
    portfolioId,
    includeGovernance: options.includeGovernance ?? true,
    includeCompliance: options.includeCompliance ?? true,
    includeBenchmarks: options.includeBenchmarks ?? true,
    includeTransactions: options.includeTransactions ?? true,
    compareToLastQuarter: options.compareToLastQuarter ?? true,
    compareToLastYear: options.compareToLastYear ?? true,
  });
}

/**
 * Generate annual investment report (combines all 4 quarters)
 */
export function generateAnnualReport(portfolioId: string, year: number): {
  annualReport: QuarterlyInvestmentReport;
  quarterlyReports: QuarterlyInvestmentReport[];
} {
  const quarters: ReportPeriod[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterlyReports = quarters.map(quarter => 
    generateQuarterlyReport({
      year,
      quarter,
      portfolioId,
      includeGovernance: true,
      includeCompliance: true,
      includeBenchmarks: true,
      includeTransactions: true,
    })
  );
  
  // Aggregate annual data
  const totalReturn = quarterlyReports.reduce((sum, r) => sum + r.performance.totalReturn, 0);
  const startValue = quarterlyReports[0].performance.startValue;
  const endValue = quarterlyReports[3].performance.endValue;
  
  const annualReport: QuarterlyInvestmentReport = {
    reportId: generateReportId(),
    generatedAt: new Date().toISOString(),
    reportPeriod: {
      year,
      quarter: 'Q4', // Annual report marked as Q4
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    },
    portfolioId,
    portfolioName: 'LuvOnPurpose Investment Portfolio - Annual',
    executiveSummary: {
      totalPortfolioValue: endValue,
      quarterlyReturn: totalReturn,
      quarterlyReturnPercent: (totalReturn / startValue) * 100,
      ytdReturn: totalReturn,
      ytdReturnPercent: (totalReturn / startValue) * 100,
      keyHighlights: [
        `Annual portfolio return of ${((totalReturn / startValue) * 100).toFixed(2)}%`,
        `Total dividends received: $${quarterlyReports.reduce((sum, r) => sum + r.performance.dividendsReceived, 0).toLocaleString()}`,
        `${quarterlyReports.reduce((sum, r) => sum + (r.governanceActivity?.meetingsHeld || 0), 0)} governance meetings held`,
      ],
      keyRisks: ['Market volatility remains elevated', 'Interest rate environment uncertain'],
      recommendations: [
        'Review and update investment policy for next year',
        'Consider tax-loss harvesting opportunities',
        'Schedule annual portfolio review meeting',
      ],
    },
    performance: {
      startValue,
      endValue,
      netContributions: quarterlyReports.reduce((sum, r) => sum + r.performance.netContributions, 0),
      netWithdrawals: quarterlyReports.reduce((sum, r) => sum + r.performance.netWithdrawals, 0),
      totalReturn,
      totalReturnPercent: (totalReturn / startValue) * 100,
      timeWeightedReturn: quarterlyReports.reduce((sum, r) => sum + r.performance.timeWeightedReturn, 0) / 4,
      moneyWeightedReturn: quarterlyReports.reduce((sum, r) => sum + r.performance.moneyWeightedReturn, 0) / 4,
      realizedGains: quarterlyReports.reduce((sum, r) => sum + r.performance.realizedGains, 0),
      unrealizedGains: quarterlyReports[3].performance.unrealizedGains,
      dividendsReceived: quarterlyReports.reduce((sum, r) => sum + r.performance.dividendsReceived, 0),
      interestReceived: quarterlyReports.reduce((sum, r) => sum + r.performance.interestReceived, 0),
      feesAndExpenses: quarterlyReports.reduce((sum, r) => sum + r.performance.feesAndExpenses, 0),
    },
    assetAllocation: quarterlyReports[3].assetAllocation,
    topHoldings: quarterlyReports[3].topHoldings,
    benchmarkComparisons: quarterlyReports[3].benchmarkComparisons,
    governanceActivity: {
      totalProposals: quarterlyReports.reduce((sum, r) => sum + (r.governanceActivity?.totalProposals || 0), 0),
      approvedProposals: quarterlyReports.reduce((sum, r) => sum + (r.governanceActivity?.approvedProposals || 0), 0),
      rejectedProposals: quarterlyReports.reduce((sum, r) => sum + (r.governanceActivity?.rejectedProposals || 0), 0),
      pendingProposals: quarterlyReports[3].governanceActivity?.pendingProposals || 0,
      totalVotesCast: quarterlyReports.reduce((sum, r) => sum + (r.governanceActivity?.totalVotesCast || 0), 0),
      averageApprovalRate: quarterlyReports.reduce((sum, r) => sum + (r.governanceActivity?.averageApprovalRate || 0), 0) / 4,
      meetingsHeld: quarterlyReports.reduce((sum, r) => sum + (r.governanceActivity?.meetingsHeld || 0), 0),
      keyDecisions: quarterlyReports.flatMap(r => r.governanceActivity?.keyDecisions || []),
    },
    complianceStatus: quarterlyReports[3].complianceStatus,
    transactionSummary: {
      totalTransactions: quarterlyReports.reduce((sum, r) => sum + (r.transactionSummary?.totalTransactions || 0), 0),
      totalBuys: quarterlyReports.reduce((sum, r) => sum + (r.transactionSummary?.totalBuys || 0), 0),
      totalSells: quarterlyReports.reduce((sum, r) => sum + (r.transactionSummary?.totalSells || 0), 0),
      totalDividends: quarterlyReports.reduce((sum, r) => sum + (r.transactionSummary?.totalDividends || 0), 0),
      totalTransfers: quarterlyReports.reduce((sum, r) => sum + (r.transactionSummary?.totalTransfers || 0), 0),
      netInflows: quarterlyReports.reduce((sum, r) => sum + (r.transactionSummary?.netInflows || 0), 0),
      netOutflows: quarterlyReports.reduce((sum, r) => sum + (r.transactionSummary?.netOutflows || 0), 0),
      largestPurchase: quarterlyReports[3].transactionSummary?.largestPurchase || null,
      largestSale: quarterlyReports[3].transactionSummary?.largestSale || null,
    },
    appendices: {
      fullHoldingsList: quarterlyReports[3].topHoldings,
      fullTransactionList: quarterlyReports.flatMap(r => r.appendices.fullTransactionList),
      policyDocumentReferences: [
        'Investment Policy Statement v2.1',
        'ESG Screening Guidelines',
        'Risk Management Framework',
        'Annual Investment Review Summary',
      ],
    },
  };
  
  return { annualReport, quarterlyReports };
}

/**
 * Export report to various formats
 */
export function exportReportToMarkdown(report: QuarterlyInvestmentReport): string {
  const lines: string[] = [];
  
  lines.push(`# Quarterly Investment Report`);
  lines.push(`## ${report.reportPeriod.quarter} ${report.reportPeriod.year}`);
  lines.push(`**Generated:** ${new Date(report.generatedAt).toLocaleDateString()}`);
  lines.push(`**Report ID:** ${report.reportId}`);
  lines.push('');
  
  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push(`**Total Portfolio Value:** $${report.executiveSummary.totalPortfolioValue.toLocaleString()}`);
  lines.push(`**Quarterly Return:** ${report.executiveSummary.quarterlyReturnPercent.toFixed(2)}% ($${report.executiveSummary.quarterlyReturn.toLocaleString()})`);
  lines.push(`**YTD Return:** ${report.executiveSummary.ytdReturnPercent.toFixed(2)}% ($${report.executiveSummary.ytdReturn.toLocaleString()})`);
  lines.push('');
  
  lines.push('### Key Highlights');
  report.executiveSummary.keyHighlights.forEach(h => lines.push(`- ${h}`));
  lines.push('');
  
  lines.push('### Key Risks');
  report.executiveSummary.keyRisks.forEach(r => lines.push(`- ${r}`));
  lines.push('');
  
  lines.push('### Recommendations');
  report.executiveSummary.recommendations.forEach(r => lines.push(`- ${r}`));
  lines.push('');
  
  // Performance
  lines.push('## Performance Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Start Value | $${report.performance.startValue.toLocaleString()} |`);
  lines.push(`| End Value | $${report.performance.endValue.toLocaleString()} |`);
  lines.push(`| Total Return | $${report.performance.totalReturn.toLocaleString()} (${report.performance.totalReturnPercent.toFixed(2)}%) |`);
  lines.push(`| Dividends Received | $${report.performance.dividendsReceived.toLocaleString()} |`);
  lines.push(`| Realized Gains | $${report.performance.realizedGains.toLocaleString()} |`);
  lines.push(`| Unrealized Gains | $${report.performance.unrealizedGains.toLocaleString()} |`);
  lines.push(`| Fees & Expenses | $${report.performance.feesAndExpenses.toLocaleString()} |`);
  lines.push('');
  
  // Asset Allocation
  lines.push('## Asset Allocation');
  lines.push('');
  lines.push('| Asset Class | Market Value | % of Portfolio | Target % | Deviation |');
  lines.push('|-------------|--------------|----------------|----------|-----------|');
  report.assetAllocation.forEach(a => {
    lines.push(`| ${a.assetClass} | $${a.marketValue.toLocaleString()} | ${a.percentOfPortfolio.toFixed(1)}% | ${a.targetPercent.toFixed(1)}% | ${a.deviation.toFixed(1)}% |`);
  });
  lines.push('');
  
  // Top Holdings
  lines.push('## Top Holdings');
  lines.push('');
  lines.push('| Ticker | Name | Market Value | % of Portfolio | Quarterly Return |');
  lines.push('|--------|------|--------------|----------------|------------------|');
  report.topHoldings.slice(0, 10).forEach(h => {
    lines.push(`| ${h.ticker} | ${h.name} | $${h.marketValue.toLocaleString()} | ${h.percentOfPortfolio.toFixed(1)}% | ${h.quarterlyReturn.toFixed(1)}% |`);
  });
  lines.push('');
  
  // Governance Activity
  if (report.governanceActivity) {
    lines.push('## Governance Activity');
    lines.push('');
    lines.push(`- **Total Proposals:** ${report.governanceActivity.totalProposals}`);
    lines.push(`- **Approved:** ${report.governanceActivity.approvedProposals}`);
    lines.push(`- **Rejected:** ${report.governanceActivity.rejectedProposals}`);
    lines.push(`- **Meetings Held:** ${report.governanceActivity.meetingsHeld}`);
    lines.push(`- **Average Approval Rate:** ${report.governanceActivity.averageApprovalRate.toFixed(0)}%`);
    lines.push('');
  }
  
  // Compliance Status
  if (report.complianceStatus) {
    lines.push('## Compliance Status');
    lines.push('');
    lines.push(`- **Overall Status:** ${report.complianceStatus.overallStatus.replace(/_/g, ' ')}`);
    lines.push(`- **ESG Score:** ${report.complianceStatus.esgComplianceScore}/100`);
    lines.push(`- **Prohibited Asset Check:** ${report.complianceStatus.prohibitedAssetCheck}`);
    lines.push(`- **Rebalancing Required:** ${report.complianceStatus.rebalancingRequired ? 'Yes' : 'No'}`);
    lines.push('');
  }
  
  lines.push('---');
  lines.push(`*Report generated by LuvOnPurpose Investment Management System*`);
  
  return lines.join('\n');
}

export function exportReportToJSON(report: QuarterlyInvestmentReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Get available report periods
 */
export function getAvailableReportPeriods(portfolioId: string): { year: number; quarter: ReportPeriod }[] {
  // In production, this would query the database for available data
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const periods: { year: number; quarter: ReportPeriod }[] = [];
  
  // Add periods for current and previous year
  for (let year = currentYear - 1; year <= currentYear; year++) {
    const quarters: ReportPeriod[] = ['Q1', 'Q2', 'Q3', 'Q4'];
    for (const quarter of quarters) {
      // Only add quarters that have passed
      const quarterEndMonth = { Q1: 2, Q2: 5, Q3: 8, Q4: 11 }[quarter];
      if (year < currentYear || (year === currentYear && quarterEndMonth < currentMonth)) {
        periods.push({ year, quarter });
      }
    }
  }
  
  return periods;
}

/**
 * Schedule automatic report generation
 */
export interface ReportSchedule {
  id: string;
  portfolioId: string;
  frequency: 'quarterly' | 'annual';
  recipients: string[];
  includeGovernance: boolean;
  includeCompliance: boolean;
  includeBenchmarks: boolean;
  enabled: boolean;
  lastGenerated?: string;
  nextScheduled: string;
}

const reportSchedules: Map<string, ReportSchedule> = new Map();

export function createReportSchedule(
  portfolioId: string,
  frequency: 'quarterly' | 'annual',
  recipients: string[],
  options: Partial<ReportSchedule> = {}
): ReportSchedule {
  const schedule: ReportSchedule = {
    id: `SCH-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    portfolioId,
    frequency,
    recipients,
    includeGovernance: options.includeGovernance ?? true,
    includeCompliance: options.includeCompliance ?? true,
    includeBenchmarks: options.includeBenchmarks ?? true,
    enabled: options.enabled ?? true,
    nextScheduled: calculateNextScheduledDate(frequency),
  };
  
  reportSchedules.set(schedule.id, schedule);
  return schedule;
}

export function getReportSchedule(scheduleId: string): ReportSchedule | undefined {
  return reportSchedules.get(scheduleId);
}

export function updateReportSchedule(scheduleId: string, updates: Partial<ReportSchedule>): ReportSchedule | undefined {
  const schedule = reportSchedules.get(scheduleId);
  if (!schedule) return undefined;
  
  const updated = { ...schedule, ...updates };
  reportSchedules.set(scheduleId, updated);
  return updated;
}

export function deleteReportSchedule(scheduleId: string): boolean {
  return reportSchedules.delete(scheduleId);
}

export function listReportSchedules(portfolioId?: string): ReportSchedule[] {
  const schedules = Array.from(reportSchedules.values());
  if (portfolioId) {
    return schedules.filter(s => s.portfolioId === portfolioId);
  }
  return schedules;
}

function calculateNextScheduledDate(frequency: 'quarterly' | 'annual'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  if (frequency === 'quarterly') {
    // Next quarter end + 15 days for report generation
    const quarterEndMonths = [2, 5, 8, 11];
    const nextQuarterEnd = quarterEndMonths.find(m => m > month) ?? quarterEndMonths[0];
    const nextYear = nextQuarterEnd <= month ? year + 1 : year;
    return new Date(nextYear, nextQuarterEnd + 1, 15).toISOString().split('T')[0];
  } else {
    // Annual: January 31 of next year
    return new Date(year + 1, 0, 31).toISOString().split('T')[0];
  }
}
