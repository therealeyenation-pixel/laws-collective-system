import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
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
} from '../services/quarterly-investment-report';

const reportPeriodSchema = z.enum(['Q1', 'Q2', 'Q3', 'Q4']);

export const quarterlyInvestmentReportRouter = router({
  // Generate quarterly report
  generateQuarterly: protectedProcedure
    .input(z.object({
      year: z.number().min(2020).max(2100),
      quarter: reportPeriodSchema,
      portfolioId: z.string(),
      includeGovernance: z.boolean().optional().default(true),
      includeCompliance: z.boolean().optional().default(true),
      includeBenchmarks: z.boolean().optional().default(true),
      includeTransactions: z.boolean().optional().default(true),
      compareToLastQuarter: z.boolean().optional().default(false),
      compareToLastYear: z.boolean().optional().default(false),
    }))
    .mutation(({ input }) => {
      return generateQuarterlyReport(input);
    }),
  
  // Generate custom period report
  generateCustomPeriod: protectedProcedure
    .input(z.object({
      portfolioId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      includeGovernance: z.boolean().optional(),
      includeCompliance: z.boolean().optional(),
      includeBenchmarks: z.boolean().optional(),
      includeTransactions: z.boolean().optional(),
    }))
    .mutation(({ input }) => {
      return generateCustomPeriodReport(
        input.portfolioId,
        new Date(input.startDate),
        new Date(input.endDate),
        {
          includeGovernance: input.includeGovernance,
          includeCompliance: input.includeCompliance,
          includeBenchmarks: input.includeBenchmarks,
          includeTransactions: input.includeTransactions,
        }
      );
    }),
  
  // Generate annual report
  generateAnnual: protectedProcedure
    .input(z.object({
      portfolioId: z.string(),
      year: z.number().min(2020).max(2100),
    }))
    .mutation(({ input }) => {
      return generateAnnualReport(input.portfolioId, input.year);
    }),
  
  // Export report to markdown
  exportMarkdown: protectedProcedure
    .input(z.object({
      year: z.number().min(2020).max(2100),
      quarter: reportPeriodSchema,
      portfolioId: z.string(),
      includeGovernance: z.boolean().optional().default(true),
      includeCompliance: z.boolean().optional().default(true),
      includeBenchmarks: z.boolean().optional().default(true),
      includeTransactions: z.boolean().optional().default(true),
    }))
    .mutation(({ input }) => {
      const report = generateQuarterlyReport(input);
      return {
        markdown: exportReportToMarkdown(report),
        reportId: report.reportId,
      };
    }),
  
  // Export report to JSON
  exportJSON: protectedProcedure
    .input(z.object({
      year: z.number().min(2020).max(2100),
      quarter: reportPeriodSchema,
      portfolioId: z.string(),
      includeGovernance: z.boolean().optional().default(true),
      includeCompliance: z.boolean().optional().default(true),
      includeBenchmarks: z.boolean().optional().default(true),
      includeTransactions: z.boolean().optional().default(true),
    }))
    .mutation(({ input }) => {
      const report = generateQuarterlyReport(input);
      return {
        json: exportReportToJSON(report),
        reportId: report.reportId,
      };
    }),
  
  // Get available report periods
  getAvailablePeriods: protectedProcedure
    .input(z.object({
      portfolioId: z.string(),
    }))
    .query(({ input }) => {
      return getAvailableReportPeriods(input.portfolioId);
    }),
  
  // Schedule management
  createSchedule: protectedProcedure
    .input(z.object({
      portfolioId: z.string(),
      frequency: z.enum(['quarterly', 'annual']),
      recipients: z.array(z.string().email()),
      includeGovernance: z.boolean().optional(),
      includeCompliance: z.boolean().optional(),
      includeBenchmarks: z.boolean().optional(),
      enabled: z.boolean().optional(),
    }))
    .mutation(({ input }) => {
      return createReportSchedule(
        input.portfolioId,
        input.frequency,
        input.recipients,
        {
          includeGovernance: input.includeGovernance,
          includeCompliance: input.includeCompliance,
          includeBenchmarks: input.includeBenchmarks,
          enabled: input.enabled,
        }
      );
    }),
  
  getSchedule: protectedProcedure
    .input(z.object({
      scheduleId: z.string(),
    }))
    .query(({ input }) => {
      return getReportSchedule(input.scheduleId);
    }),
  
  updateSchedule: protectedProcedure
    .input(z.object({
      scheduleId: z.string(),
      recipients: z.array(z.string().email()).optional(),
      includeGovernance: z.boolean().optional(),
      includeCompliance: z.boolean().optional(),
      includeBenchmarks: z.boolean().optional(),
      enabled: z.boolean().optional(),
    }))
    .mutation(({ input }) => {
      const { scheduleId, ...updates } = input;
      return updateReportSchedule(scheduleId, updates);
    }),
  
  deleteSchedule: protectedProcedure
    .input(z.object({
      scheduleId: z.string(),
    }))
    .mutation(({ input }) => {
      return deleteReportSchedule(input.scheduleId);
    }),
  
  listSchedules: protectedProcedure
    .input(z.object({
      portfolioId: z.string().optional(),
    }))
    .query(({ input }) => {
      return listReportSchedules(input.portfolioId);
    }),
});
