import { describe, it, expect, beforeEach } from 'vitest';
import {
  consolidatedDashboardService,
  ConsolidatedDashboardData,
  TreasurySummary,
  InvestmentSummary,
  DonationSummary,
  GrantSummary,
  AcquisitionFundSummary,
  RevenueSummary,
  FinancialAlert,
  KeyMetric,
  DrillDownData,
} from './consolidated-dashboard.service';

describe('ConsolidatedDashboardService', () => {
  describe('getDashboardData', () => {
    it('should return complete dashboard data', async () => {
      const data = await consolidatedDashboardService.getDashboardData();
      
      expect(data).toBeDefined();
      expect(data.asOfDate).toBeDefined();
      expect(data.treasury).toBeDefined();
      expect(data.investments).toBeDefined();
      expect(data.donations).toBeDefined();
      expect(data.grants).toBeDefined();
      expect(data.acquisitionFund).toBeDefined();
      expect(data.revenue).toBeDefined();
      expect(data.alerts).toBeDefined();
      expect(data.keyMetrics).toBeDefined();
    });

    it('should calculate total net worth correctly', async () => {
      const data = await consolidatedDashboardService.getDashboardData();
      
      const expectedAssets = data.treasury.totalCash + 
        data.investments.totalPortfolioValue + 
        data.acquisitionFund.totalFundBalance;
      
      expect(data.totalAssets).toBe(expectedAssets);
      expect(data.totalNetWorth).toBe(data.totalAssets - data.totalLiabilities);
    });

    it('should return valid ISO date string', async () => {
      const data = await consolidatedDashboardService.getDashboardData();
      
      const date = new Date(data.asOfDate);
      expect(date.toString()).not.toBe('Invalid Date');
    });
  });

  describe('getTreasurySummary', () => {
    it('should return treasury summary with all required fields', async () => {
      const summary = await consolidatedDashboardService.getTreasurySummary();
      
      expect(summary.totalCash).toBeGreaterThan(0);
      expect(summary.operatingAccount).toBeDefined();
      expect(summary.reserveAccount).toBeDefined();
      expect(summary.restrictedFunds).toBeDefined();
      expect(summary.unrestricted).toBeDefined();
      expect(summary.cashFlowMTD).toBeDefined();
      expect(summary.cashFlowYTD).toBeDefined();
      expect(summary.projectedCashPosition30Days).toBeDefined();
      expect(summary.projectedCashPosition90Days).toBeDefined();
    });

    it('should have consistent cash totals', async () => {
      const summary = await consolidatedDashboardService.getTreasurySummary();
      
      const accountTotal = summary.operatingAccount + 
        summary.reserveAccount + 
        summary.restrictedFunds + 
        summary.unrestricted;
      
      expect(summary.totalCash).toBe(accountTotal);
    });
  });

  describe('getInvestmentSummary', () => {
    it('should return investment summary with all required fields', async () => {
      const summary = await consolidatedDashboardService.getInvestmentSummary();
      
      expect(summary.totalPortfolioValue).toBeGreaterThan(0);
      expect(summary.totalCostBasis).toBeDefined();
      expect(summary.unrealizedGainLoss).toBeDefined();
      expect(summary.unrealizedGainLossPercent).toBeDefined();
      expect(summary.ytdReturn).toBeDefined();
      expect(summary.ytdReturnPercent).toBeDefined();
      expect(summary.dividendsYTD).toBeDefined();
      expect(summary.allocationCompliance).toBeDefined();
    });

    it('should calculate unrealized gain/loss correctly', async () => {
      const summary = await consolidatedDashboardService.getInvestmentSummary();
      
      const expectedGainLoss = summary.totalPortfolioValue - summary.totalCostBasis;
      expect(summary.unrealizedGainLoss).toBe(expectedGainLoss);
    });

    it('should have valid allocation compliance status', async () => {
      const summary = await consolidatedDashboardService.getInvestmentSummary();
      
      expect(['compliant', 'warning', 'violation']).toContain(summary.allocationCompliance);
    });
  });

  describe('getDonationSummary', () => {
    it('should return donation summary with all required fields', async () => {
      const summary = await consolidatedDashboardService.getDonationSummary();
      
      expect(summary.totalDonationsMTD).toBeDefined();
      expect(summary.totalDonationsYTD).toBeGreaterThan(0);
      expect(summary.totalDonorsYTD).toBeGreaterThan(0);
      expect(summary.newDonorsYTD).toBeDefined();
      expect(summary.recurringDonorsActive).toBeDefined();
      expect(summary.recurringRevenueMTD).toBeDefined();
      expect(summary.averageDonation).toBeDefined();
      expect(summary.largestDonationYTD).toBeDefined();
      expect(summary.donationsByDesignation).toBeDefined();
    });

    it('should have donation designations that sum to 100%', async () => {
      const summary = await consolidatedDashboardService.getDonationSummary();
      
      const totalPercentage = summary.donationsByDesignation.reduce(
        (sum, d) => sum + d.percentage, 0
      );
      
      expect(totalPercentage).toBe(100);
    });

    it('should have designation amounts that match YTD total', async () => {
      const summary = await consolidatedDashboardService.getDonationSummary();
      
      const totalAmount = summary.donationsByDesignation.reduce(
        (sum, d) => sum + d.amount, 0
      );
      
      expect(totalAmount).toBe(summary.totalDonationsYTD);
    });
  });

  describe('getGrantSummary', () => {
    it('should return grant summary with all required fields', async () => {
      const summary = await consolidatedDashboardService.getGrantSummary();
      
      expect(summary.activeGrants).toBeGreaterThan(0);
      expect(summary.totalGrantValueActive).toBeGreaterThan(0);
      expect(summary.grantsReceivedYTD).toBeDefined();
      expect(summary.grantAmountYTD).toBeDefined();
      expect(summary.pendingApplications).toBeDefined();
      expect(summary.pendingApplicationValue).toBeDefined();
      expect(summary.grantsClosingNext90Days).toBeDefined();
      expect(summary.complianceStatus).toBeDefined();
      expect(summary.upcomingReports).toBeDefined();
    });

    it('should have valid compliance status', async () => {
      const summary = await consolidatedDashboardService.getGrantSummary();
      
      expect(['good', 'attention', 'critical']).toContain(summary.complianceStatus);
    });
  });

  describe('getAcquisitionFundSummary', () => {
    it('should return acquisition fund summary with all required fields', async () => {
      const summary = await consolidatedDashboardService.getAcquisitionFundSummary();
      
      expect(summary.totalFundBalance).toBeGreaterThan(0);
      expect(summary.fundsByCategory).toBeDefined();
      expect(summary.fundsByCategory.length).toBeGreaterThan(0);
      expect(summary.pendingTransfers).toBeDefined();
      expect(summary.pendingTransferAmount).toBeDefined();
      expect(summary.pendingDisbursements).toBeDefined();
      expect(summary.pendingDisbursementAmount).toBeDefined();
      expect(summary.contributionsMTD).toBeDefined();
      expect(summary.contributionsYTD).toBeDefined();
    });

    it('should have fund categories with valid percentages', async () => {
      const summary = await consolidatedDashboardService.getAcquisitionFundSummary();
      
      for (const fund of summary.fundsByCategory) {
        expect(fund.category).toBeDefined();
        expect(fund.balance).toBeDefined();
        expect(fund.targetBalance).toBeGreaterThan(0);
        expect(fund.percentOfTarget).toBeGreaterThanOrEqual(0);
        expect(fund.percentOfTarget).toBeLessThanOrEqual(100);
      }
    });

    it('should have fund balances that sum to total', async () => {
      const summary = await consolidatedDashboardService.getAcquisitionFundSummary();
      
      const totalFromCategories = summary.fundsByCategory.reduce(
        (sum, f) => sum + f.balance, 0
      );
      
      expect(totalFromCategories).toBe(summary.totalFundBalance);
    });
  });

  describe('getRevenueSummary', () => {
    it('should return revenue summary with all required fields', async () => {
      const summary = await consolidatedDashboardService.getRevenueSummary();
      
      expect(summary.totalRevenueMTD).toBeDefined();
      expect(summary.totalRevenueYTD).toBeGreaterThan(0);
      expect(summary.revenueBySource).toBeDefined();
      expect(summary.totalExpensesMTD).toBeDefined();
      expect(summary.totalExpensesYTD).toBeDefined();
      expect(summary.expensesByCategory).toBeDefined();
      expect(summary.netIncomeMTD).toBeDefined();
      expect(summary.netIncomeYTD).toBeDefined();
      expect(summary.burnRate).toBeDefined();
      expect(summary.runwayMonths).toBeDefined();
    });

    it('should have revenue sources that sum to 100%', async () => {
      const summary = await consolidatedDashboardService.getRevenueSummary();
      
      const totalPercentage = summary.revenueBySource.reduce(
        (sum, r) => sum + r.percentage, 0
      );
      
      expect(totalPercentage).toBe(100);
    });

    it('should have valid trend indicators', async () => {
      const summary = await consolidatedDashboardService.getRevenueSummary();
      
      for (const source of summary.revenueBySource) {
        expect(['up', 'down', 'stable']).toContain(source.trend);
      }
    });

    it('should calculate net income correctly', async () => {
      const summary = await consolidatedDashboardService.getRevenueSummary();
      
      const expectedNetIncomeMTD = summary.totalRevenueMTD - summary.totalExpensesMTD;
      const expectedNetIncomeYTD = summary.totalRevenueYTD - summary.totalExpensesYTD;
      
      expect(summary.netIncomeMTD).toBe(expectedNetIncomeMTD);
      expect(summary.netIncomeYTD).toBe(expectedNetIncomeYTD);
    });
  });

  describe('getFinancialAlerts', () => {
    it('should return array of alerts', async () => {
      const alerts = await consolidatedDashboardService.getFinancialAlerts();
      
      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should have valid alert structure', async () => {
      const alerts = await consolidatedDashboardService.getFinancialAlerts();
      
      for (const alert of alerts) {
        expect(alert.id).toBeDefined();
        expect(['warning', 'critical', 'info']).toContain(alert.type);
        expect(['treasury', 'investment', 'donation', 'grant', 'acquisition', 'revenue', 'compliance']).toContain(alert.category);
        expect(alert.title).toBeDefined();
        expect(alert.description).toBeDefined();
        expect(typeof alert.actionRequired).toBe('boolean');
        expect(alert.createdAt).toBeDefined();
      }
    });

    it('should have valid dates', async () => {
      const alerts = await consolidatedDashboardService.getFinancialAlerts();
      
      for (const alert of alerts) {
        const createdDate = new Date(alert.createdAt);
        expect(createdDate.toString()).not.toBe('Invalid Date');
        
        if (alert.expiresAt) {
          const expiresDate = new Date(alert.expiresAt);
          expect(expiresDate.toString()).not.toBe('Invalid Date');
          expect(expiresDate.getTime()).toBeGreaterThan(createdDate.getTime());
        }
      }
    });
  });

  describe('getKeyMetrics', () => {
    it('should return array of key metrics', async () => {
      const metrics = await consolidatedDashboardService.getKeyMetrics();
      
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should have valid metric structure', async () => {
      const metrics = await consolidatedDashboardService.getKeyMetrics();
      
      for (const metric of metrics) {
        expect(metric.id).toBeDefined();
        expect(metric.name).toBeDefined();
        expect(typeof metric.value).toBe('number');
        expect(metric.formattedValue).toBeDefined();
        expect(['currency', 'percent', 'number', 'days']).toContain(metric.unit);
        expect(['up', 'down', 'stable']).toContain(metric.trend);
        expect(typeof metric.trendValue).toBe('number');
        expect(metric.trendPeriod).toBeDefined();
        expect(['good', 'warning', 'critical']).toContain(metric.status);
      }
    });
  });

  describe('getDrillDownData', () => {
    it('should return treasury drill-down data', async () => {
      const data = await consolidatedDashboardService.getDrillDownData({
        module: 'treasury',
        metric: 'totalCash',
      });
      
      expect(data.module).toBe('treasury');
      expect(data.title).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(['bar', 'line', 'pie', 'table']).toContain(data.chartType);
      expect(data.totalValue).toBeGreaterThan(0);
    });

    it('should return investment drill-down data', async () => {
      const data = await consolidatedDashboardService.getDrillDownData({
        module: 'investment',
        metric: 'allocation',
      });
      
      expect(data.module).toBe('investment');
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should return donation drill-down data', async () => {
      const data = await consolidatedDashboardService.getDrillDownData({
        module: 'donation',
        metric: 'trends',
      });
      
      expect(data.module).toBe('donation');
      expect(data.chartType).toBe('bar');
    });

    it('should return grant drill-down data', async () => {
      const data = await consolidatedDashboardService.getDrillDownData({
        module: 'grant',
        metric: 'active',
      });
      
      expect(data.module).toBe('grant');
      expect(data.chartType).toBe('table');
    });

    it('should return acquisition drill-down data', async () => {
      const data = await consolidatedDashboardService.getDrillDownData({
        module: 'acquisition',
        metric: 'progress',
      });
      
      expect(data.module).toBe('acquisition');
    });

    it('should return revenue drill-down data', async () => {
      const data = await consolidatedDashboardService.getDrillDownData({
        module: 'revenue',
        metric: 'comparison',
      });
      
      expect(data.module).toBe('revenue');
      expect(data.chartType).toBe('line');
    });

    it('should throw error for unknown module', async () => {
      await expect(
        consolidatedDashboardService.getDrillDownData({
          module: 'unknown' as any,
          metric: 'test',
        })
      ).rejects.toThrow('Unknown module: unknown');
    });
  });

  describe('getHistoricalComparison', () => {
    it('should return historical data for months', async () => {
      const data = await consolidatedDashboardService.getHistoricalComparison(
        'revenue',
        6,
        'month'
      );
      
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(6);
      
      for (const item of data) {
        expect(item.period).toBeDefined();
        expect(typeof item.value).toBe('number');
        expect(typeof item.previousValue).toBe('number');
      }
    });

    it('should return historical data for quarters', async () => {
      const data = await consolidatedDashboardService.getHistoricalComparison(
        'revenue',
        4,
        'quarter'
      );
      
      expect(data.length).toBe(4);
      
      for (const item of data) {
        expect(item.period).toMatch(/Q[1-4] \d{4}/);
      }
    });

    it('should return historical data for years', async () => {
      const data = await consolidatedDashboardService.getHistoricalComparison(
        'revenue',
        3,
        'year'
      );
      
      expect(data.length).toBe(3);
      
      for (const item of data) {
        expect(item.period).toMatch(/^\d{4}$/);
      }
    });
  });

  describe('generateExecutiveSummary', () => {
    it('should return executive summary with all sections', async () => {
      const summary = await consolidatedDashboardService.generateExecutiveSummary();
      
      expect(summary.title).toBe('Executive Financial Summary');
      expect(summary.generatedAt).toBeDefined();
      expect(Array.isArray(summary.highlights)).toBe(true);
      expect(summary.highlights.length).toBeGreaterThan(0);
      expect(Array.isArray(summary.concerns)).toBe(true);
      expect(Array.isArray(summary.recommendations)).toBe(true);
      expect(summary.recommendations.length).toBeGreaterThan(0);
      expect(Array.isArray(summary.metrics)).toBe(true);
    });

    it('should have valid generated date', async () => {
      const summary = await consolidatedDashboardService.generateExecutiveSummary();
      
      const date = new Date(summary.generatedAt);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('should include key metrics', async () => {
      const summary = await consolidatedDashboardService.generateExecutiveSummary();
      
      expect(summary.metrics.length).toBeGreaterThan(0);
      
      for (const metric of summary.metrics) {
        expect(metric.name).toBeDefined();
        expect(metric.value).toBeDefined();
      }
    });
  });

  describe('Dashboard Data Consistency', () => {
    it('should have consistent data across all modules', async () => {
      const data = await consolidatedDashboardService.getDashboardData();
      
      // Verify all modules have data
      expect(data.treasury.totalCash).toBeGreaterThan(0);
      expect(data.investments.totalPortfolioValue).toBeGreaterThan(0);
      expect(data.donations.totalDonationsYTD).toBeGreaterThan(0);
      expect(data.grants.activeGrants).toBeGreaterThan(0);
      expect(data.acquisitionFund.totalFundBalance).toBeGreaterThan(0);
      expect(data.revenue.totalRevenueYTD).toBeGreaterThan(0);
    });

    it('should have alerts that match module categories', async () => {
      const data = await consolidatedDashboardService.getDashboardData();
      
      const validCategories = ['treasury', 'investment', 'donation', 'grant', 'acquisition', 'revenue', 'compliance'];
      
      for (const alert of data.alerts) {
        expect(validCategories).toContain(alert.category);
      }
    });

    it('should have key metrics with valid statuses', async () => {
      const data = await consolidatedDashboardService.getDashboardData();
      
      for (const metric of data.keyMetrics) {
        expect(['good', 'warning', 'critical']).toContain(metric.status);
        
        // If target is defined, status should reflect performance
        if (metric.target !== undefined) {
          expect(typeof metric.target).toBe('number');
        }
      }
    });
  });
});
