import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateQuarterlyReport,
  generateCustomPeriodReport,
  generateAnnualReport,
  exportReportToMarkdown,
  exportReportToJSON,
  getAvailableReportPeriods,
  createReportSchedule,
  getReportSchedule,
  updateReportSchedule,
  deleteReportSchedule,
  listReportSchedules,
  type QuarterlyReportConfig,
  type ReportPeriod,
} from './quarterly-investment-report';

describe('Quarterly Investment Report Generator', () => {
  const testPortfolioId = 'portfolio-001';
  
  describe('generateQuarterlyReport', () => {
    it('should generate a complete quarterly report', () => {
      const config: QuarterlyReportConfig = {
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        includeGovernance: true,
        includeCompliance: true,
        includeBenchmarks: true,
        includeTransactions: true,
      };
      
      const report = generateQuarterlyReport(config);
      
      expect(report.reportId).toMatch(/^RPT-/);
      expect(report.generatedAt).toBeDefined();
      expect(report.reportPeriod.year).toBe(2025);
      expect(report.reportPeriod.quarter).toBe('Q4');
      expect(report.portfolioId).toBe(testPortfolioId);
    });
    
    it('should include executive summary', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q3',
        portfolioId: testPortfolioId,
      });
      
      expect(report.executiveSummary).toBeDefined();
      expect(report.executiveSummary.totalPortfolioValue).toBeGreaterThan(0);
      expect(report.executiveSummary.keyHighlights).toBeInstanceOf(Array);
      expect(report.executiveSummary.keyRisks).toBeInstanceOf(Array);
      expect(report.executiveSummary.recommendations).toBeInstanceOf(Array);
    });
    
    it('should include performance data', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q2',
        portfolioId: testPortfolioId,
      });
      
      expect(report.performance).toBeDefined();
      expect(report.performance.startValue).toBeGreaterThan(0);
      expect(report.performance.endValue).toBeGreaterThan(0);
      expect(typeof report.performance.totalReturnPercent).toBe('number');
      expect(typeof report.performance.dividendsReceived).toBe('number');
    });
    
    it('should include asset allocation', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q1',
        portfolioId: testPortfolioId,
      });
      
      expect(report.assetAllocation).toBeInstanceOf(Array);
      expect(report.assetAllocation.length).toBeGreaterThan(0);
      
      const allocation = report.assetAllocation[0];
      expect(allocation.assetClass).toBeDefined();
      expect(allocation.marketValue).toBeGreaterThan(0);
      expect(typeof allocation.percentOfPortfolio).toBe('number');
    });
    
    it('should include top holdings', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
      });
      
      expect(report.topHoldings).toBeInstanceOf(Array);
      expect(report.topHoldings.length).toBeGreaterThan(0);
      
      const holding = report.topHoldings[0];
      expect(holding.ticker).toBeDefined();
      expect(holding.name).toBeDefined();
      expect(holding.marketValue).toBeGreaterThan(0);
    });
    
    it('should include governance activity when requested', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        includeGovernance: true,
      });
      
      expect(report.governanceActivity).toBeDefined();
      expect(report.governanceActivity!.totalProposals).toBeGreaterThanOrEqual(0);
      expect(report.governanceActivity!.meetingsHeld).toBeGreaterThanOrEqual(0);
      expect(report.governanceActivity!.keyDecisions).toBeInstanceOf(Array);
    });
    
    it('should exclude governance activity when not requested', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        includeGovernance: false,
      });
      
      expect(report.governanceActivity).toBeUndefined();
    });
    
    it('should include compliance status when requested', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        includeCompliance: true,
      });
      
      expect(report.complianceStatus).toBeDefined();
      expect(report.complianceStatus!.overallStatus).toBeDefined();
      expect(report.complianceStatus!.esgComplianceScore).toBeGreaterThanOrEqual(0);
    });
    
    it('should include benchmark comparisons when requested', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        includeBenchmarks: true,
      });
      
      expect(report.benchmarkComparisons).toBeDefined();
      expect(report.benchmarkComparisons!.length).toBeGreaterThan(0);
      
      const benchmark = report.benchmarkComparisons![0];
      expect(benchmark.benchmarkName).toBeDefined();
      expect(typeof benchmark.benchmarkReturn).toBe('number');
      expect(typeof benchmark.alpha).toBe('number');
    });
    
    it('should include transaction summary when requested', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        includeTransactions: true,
      });
      
      expect(report.transactionSummary).toBeDefined();
      expect(report.transactionSummary!.totalTransactions).toBeGreaterThanOrEqual(0);
      expect(report.transactionSummary!.totalBuys).toBeGreaterThanOrEqual(0);
      expect(report.transactionSummary!.totalSells).toBeGreaterThanOrEqual(0);
    });
    
    it('should include quarter over quarter comparison when requested', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        compareToLastQuarter: true,
      });
      
      expect(report.quarterOverQuarter).toBeDefined();
      expect(typeof report.quarterOverQuarter!.valueChange).toBe('number');
      expect(report.quarterOverQuarter!.allocationChanges).toBeInstanceOf(Array);
    });
    
    it('should include year over year comparison when requested', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        compareToLastYear: true,
      });
      
      expect(report.yearOverYear).toBeDefined();
      expect(typeof report.yearOverYear!.valueChange).toBe('number');
      expect(report.yearOverYear!.allocationChanges).toBeInstanceOf(Array);
    });
    
    it('should set correct date range for each quarter', () => {
      const quarters: ReportPeriod[] = ['Q1', 'Q2', 'Q3', 'Q4'];
      const expectedRanges = [
        { start: '2025-01-01', end: '2025-03-31' },
        { start: '2025-04-01', end: '2025-06-30' },
        { start: '2025-07-01', end: '2025-09-30' },
        { start: '2025-10-01', end: '2025-12-31' },
      ];
      
      quarters.forEach((quarter, index) => {
        const report = generateQuarterlyReport({
          year: 2025,
          quarter,
          portfolioId: testPortfolioId,
        });
        
        expect(report.reportPeriod.startDate).toBe(expectedRanges[index].start);
        expect(report.reportPeriod.endDate).toBe(expectedRanges[index].end);
      });
    });
  });
  
  describe('generateCustomPeriodReport', () => {
    it('should generate report for custom date range', () => {
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 5, 30);
      
      const report = generateCustomPeriodReport(testPortfolioId, startDate, endDate);
      
      expect(report.reportId).toMatch(/^RPT-/);
      expect(report.portfolioId).toBe(testPortfolioId);
    });
    
    it('should determine correct quarter from end date', () => {
      const testCases = [
        { endMonth: 2, expectedQuarter: 'Q1' },
        { endMonth: 5, expectedQuarter: 'Q2' },
        { endMonth: 8, expectedQuarter: 'Q3' },
        { endMonth: 11, expectedQuarter: 'Q4' },
      ];
      
      testCases.forEach(({ endMonth, expectedQuarter }) => {
        const report = generateCustomPeriodReport(
          testPortfolioId,
          new Date(2025, 0, 1),
          new Date(2025, endMonth, 15)
        );
        
        expect(report.reportPeriod.quarter).toBe(expectedQuarter);
      });
    });
  });
  
  describe('generateAnnualReport', () => {
    it('should generate annual report with all quarters', () => {
      const { annualReport, quarterlyReports } = generateAnnualReport(testPortfolioId, 2025);
      
      expect(annualReport).toBeDefined();
      expect(quarterlyReports).toHaveLength(4);
      expect(annualReport.reportPeriod.startDate).toBe('2025-01-01');
      expect(annualReport.reportPeriod.endDate).toBe('2025-12-31');
    });
    
    it('should aggregate performance across quarters', () => {
      const { annualReport, quarterlyReports } = generateAnnualReport(testPortfolioId, 2025);
      
      const totalDividends = quarterlyReports.reduce(
        (sum, r) => sum + r.performance.dividendsReceived,
        0
      );
      
      expect(annualReport.performance.dividendsReceived).toBe(totalDividends);
    });
    
    it('should aggregate governance activity across quarters', () => {
      const { annualReport, quarterlyReports } = generateAnnualReport(testPortfolioId, 2025);
      
      const totalMeetings = quarterlyReports.reduce(
        (sum, r) => sum + (r.governanceActivity?.meetingsHeld || 0),
        0
      );
      
      expect(annualReport.governanceActivity?.meetingsHeld).toBe(totalMeetings);
    });
    
    it('should include annual highlights in executive summary', () => {
      const { annualReport } = generateAnnualReport(testPortfolioId, 2025);
      
      expect(annualReport.executiveSummary.keyHighlights.length).toBeGreaterThan(0);
      expect(annualReport.executiveSummary.keyHighlights.some(h => h.includes('Annual'))).toBe(true);
    });
  });
  
  describe('exportReportToMarkdown', () => {
    it('should export report to markdown format', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        includeGovernance: true,
        includeCompliance: true,
      });
      
      const markdown = exportReportToMarkdown(report);
      
      expect(markdown).toContain('# Quarterly Investment Report');
      expect(markdown).toContain('## Q4 2025');
      expect(markdown).toContain('## Executive Summary');
      expect(markdown).toContain('## Performance Summary');
      expect(markdown).toContain('## Asset Allocation');
      expect(markdown).toContain('## Top Holdings');
    });
    
    it('should include governance section when available', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        includeGovernance: true,
      });
      
      const markdown = exportReportToMarkdown(report);
      
      expect(markdown).toContain('## Governance Activity');
    });
    
    it('should include compliance section when available', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        includeCompliance: true,
      });
      
      const markdown = exportReportToMarkdown(report);
      
      expect(markdown).toContain('## Compliance Status');
    });
    
    it('should format tables correctly', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
      });
      
      const markdown = exportReportToMarkdown(report);
      
      expect(markdown).toContain('| Metric | Value |');
      expect(markdown).toContain('|--------|-------|');
    });
  });
  
  describe('exportReportToJSON', () => {
    it('should export report to valid JSON', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
      });
      
      const json = exportReportToJSON(report);
      const parsed = JSON.parse(json);
      
      expect(parsed.reportId).toBe(report.reportId);
      expect(parsed.portfolioId).toBe(testPortfolioId);
    });
    
    it('should preserve all report data', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        includeGovernance: true,
        includeCompliance: true,
        includeBenchmarks: true,
        includeTransactions: true,
      });
      
      const json = exportReportToJSON(report);
      const parsed = JSON.parse(json);
      
      expect(parsed.executiveSummary).toBeDefined();
      expect(parsed.performance).toBeDefined();
      expect(parsed.assetAllocation).toBeDefined();
      expect(parsed.governanceActivity).toBeDefined();
      expect(parsed.complianceStatus).toBeDefined();
    });
  });
  
  describe('getAvailableReportPeriods', () => {
    it('should return available report periods', () => {
      const periods = getAvailableReportPeriods(testPortfolioId);
      
      expect(periods).toBeInstanceOf(Array);
      periods.forEach(period => {
        expect(period.year).toBeGreaterThan(2020);
        expect(['Q1', 'Q2', 'Q3', 'Q4']).toContain(period.quarter);
      });
    });
    
    it('should not include future quarters', () => {
      const periods = getAvailableReportPeriods(testPortfolioId);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      periods.forEach(period => {
        if (period.year === currentYear) {
          const quarterEndMonth = { Q1: 2, Q2: 5, Q3: 8, Q4: 11 }[period.quarter];
          expect(quarterEndMonth).toBeLessThan(currentMonth);
        }
      });
    });
  });
  
  describe('Report Scheduling', () => {
    beforeEach(() => {
      // Clear schedules between tests
      const schedules = listReportSchedules();
      schedules.forEach(s => deleteReportSchedule(s.id));
    });
    
    it('should create a report schedule', () => {
      const schedule = createReportSchedule(
        testPortfolioId,
        'quarterly',
        ['admin@example.com', 'board@example.com']
      );
      
      expect(schedule.id).toMatch(/^SCH-/);
      expect(schedule.portfolioId).toBe(testPortfolioId);
      expect(schedule.frequency).toBe('quarterly');
      expect(schedule.recipients).toHaveLength(2);
      expect(schedule.enabled).toBe(true);
    });
    
    it('should get a report schedule by ID', () => {
      const created = createReportSchedule(testPortfolioId, 'annual', ['admin@example.com']);
      
      const retrieved = getReportSchedule(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(created.id);
    });
    
    it('should update a report schedule', () => {
      const schedule = createReportSchedule(testPortfolioId, 'quarterly', ['admin@example.com']);
      
      const updated = updateReportSchedule(schedule.id, {
        recipients: ['admin@example.com', 'cfo@example.com'],
        enabled: false,
      });
      
      expect(updated).toBeDefined();
      expect(updated!.recipients).toHaveLength(2);
      expect(updated!.enabled).toBe(false);
    });
    
    it('should delete a report schedule', () => {
      const schedule = createReportSchedule(testPortfolioId, 'quarterly', ['admin@example.com']);
      
      const deleted = deleteReportSchedule(schedule.id);
      const retrieved = getReportSchedule(schedule.id);
      
      expect(deleted).toBe(true);
      expect(retrieved).toBeUndefined();
    });
    
    it('should list all report schedules', () => {
      createReportSchedule(testPortfolioId, 'quarterly', ['admin@example.com']);
      createReportSchedule(testPortfolioId, 'annual', ['board@example.com']);
      createReportSchedule('other-portfolio', 'quarterly', ['other@example.com']);
      
      const allSchedules = listReportSchedules();
      expect(allSchedules).toHaveLength(3);
    });
    
    it('should list schedules filtered by portfolio', () => {
      createReportSchedule(testPortfolioId, 'quarterly', ['admin@example.com']);
      createReportSchedule(testPortfolioId, 'annual', ['board@example.com']);
      createReportSchedule('other-portfolio', 'quarterly', ['other@example.com']);
      
      const portfolioSchedules = listReportSchedules(testPortfolioId);
      expect(portfolioSchedules).toHaveLength(2);
    });
    
    it('should set next scheduled date based on frequency', () => {
      const quarterlySchedule = createReportSchedule(testPortfolioId, 'quarterly', ['admin@example.com']);
      const annualSchedule = createReportSchedule(testPortfolioId, 'annual', ['admin@example.com']);
      
      expect(quarterlySchedule.nextScheduled).toBeDefined();
      expect(annualSchedule.nextScheduled).toBeDefined();
      
      // Annual should be later than quarterly
      expect(new Date(annualSchedule.nextScheduled).getTime())
        .toBeGreaterThanOrEqual(new Date(quarterlySchedule.nextScheduled).getTime());
    });
    
    it('should apply custom options to schedule', () => {
      const schedule = createReportSchedule(
        testPortfolioId,
        'quarterly',
        ['admin@example.com'],
        {
          includeGovernance: false,
          includeCompliance: true,
          includeBenchmarks: false,
        }
      );
      
      expect(schedule.includeGovernance).toBe(false);
      expect(schedule.includeCompliance).toBe(true);
      expect(schedule.includeBenchmarks).toBe(false);
    });
  });
  
  describe('Report Appendices', () => {
    it('should include full holdings list in appendices', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
      });
      
      expect(report.appendices.fullHoldingsList).toBeInstanceOf(Array);
      expect(report.appendices.fullHoldingsList.length).toBeGreaterThan(0);
    });
    
    it('should include policy document references', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
      });
      
      expect(report.appendices.policyDocumentReferences).toBeInstanceOf(Array);
      expect(report.appendices.policyDocumentReferences.length).toBeGreaterThan(0);
    });
    
    it('should include transaction list when transactions are included', () => {
      const report = generateQuarterlyReport({
        year: 2025,
        quarter: 'Q4',
        portfolioId: testPortfolioId,
        includeTransactions: true,
      });
      
      expect(report.appendices.fullTransactionList).toBeInstanceOf(Array);
    });
  });
});
