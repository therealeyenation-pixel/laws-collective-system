/**
 * LuvLedger Auto-Logging Router
 * Phase 50.1: API endpoints for automatic business event logging
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import * as autoLog from "../services/luvledger-auto-logging";

export const luvledgerAutoLoggingRouter = router({
  // Log business creation
  logBusinessCreation: protectedProcedure
    .input(z.object({
      businessName: z.string(),
      businessType: z.string(),
      jurisdiction: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logBusinessCreation(
        input.businessName,
        input.businessType,
        input.jurisdiction,
        ctx.user.id,
        input.details
      );
    }),

  // Log property acquisition
  logPropertyAcquisition: protectedProcedure
    .input(z.object({
      propertyAddress: z.string(),
      propertyType: z.string(),
      purchasePrice: z.number(),
      currency: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logPropertyAcquisition(
        input.propertyAddress,
        input.propertyType,
        input.purchasePrice,
        input.currency,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log property disposition
  logPropertyDisposition: protectedProcedure
    .input(z.object({
      propertyAddress: z.string(),
      propertyType: z.string(),
      salePrice: z.number(),
      currency: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logPropertyDisposition(
        input.propertyAddress,
        input.propertyType,
        input.salePrice,
        input.currency,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log worker hire
  logWorkerHire: protectedProcedure
    .input(z.object({
      workerName: z.string(),
      position: z.string(),
      department: z.string(),
      startDate: z.string(),
      salary: z.number(),
      currency: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logWorkerHire(
        input.workerName,
        input.position,
        input.department,
        input.startDate,
        input.salary,
        input.currency,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log worker termination
  logWorkerTermination: protectedProcedure
    .input(z.object({
      workerName: z.string(),
      position: z.string(),
      terminationDate: z.string(),
      terminationType: z.enum(["voluntary", "involuntary", "retirement", "contract_end"]),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logWorkerTermination(
        input.workerName,
        input.position,
        input.terminationDate,
        input.terminationType,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log contractor engagement
  logContractorEngagement: protectedProcedure
    .input(z.object({
      contractorName: z.string(),
      serviceType: z.string(),
      contractValue: z.number(),
      currency: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logContractorEngagement(
        input.contractorName,
        input.serviceType,
        input.contractValue,
        input.currency,
        input.startDate,
        input.endDate,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log entity formation
  logEntityFormation: protectedProcedure
    .input(z.object({
      entityName: z.string(),
      entityType: z.string(),
      jurisdiction: z.string(),
      parentEntityId: z.string().optional(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logEntityFormation(
        input.entityName,
        input.entityType,
        input.jurisdiction,
        input.parentEntityId,
        ctx.user.id,
        input.details
      );
    }),

  // Log asset acquisition
  logAssetAcquisition: protectedProcedure
    .input(z.object({
      assetName: z.string(),
      assetType: z.string(),
      assetValue: z.number(),
      currency: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logAssetAcquisition(
        input.assetName,
        input.assetType,
        input.assetValue,
        input.currency,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log contract execution
  logContractExecution: protectedProcedure
    .input(z.object({
      contractTitle: z.string(),
      contractType: z.string(),
      contractValue: z.number(),
      currency: z.string(),
      counterparty: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logContractExecution(
        input.contractTitle,
        input.contractType,
        input.contractValue,
        input.currency,
        input.counterparty,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log grant award
  logGrantAward: protectedProcedure
    .input(z.object({
      grantName: z.string(),
      grantorName: z.string(),
      awardAmount: z.number(),
      currency: z.string(),
      grantPurpose: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logGrantAward(
        input.grantName,
        input.grantorName,
        input.awardAmount,
        input.currency,
        input.grantPurpose,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log loan origination
  logLoanOrigination: protectedProcedure
    .input(z.object({
      loanType: z.string(),
      lenderName: z.string(),
      principalAmount: z.number(),
      currency: z.string(),
      interestRate: z.number(),
      termMonths: z.number(),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logLoanOrigination(
        input.loanType,
        input.lenderName,
        input.principalAmount,
        input.currency,
        input.interestRate,
        input.termMonths,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log trust creation
  logTrustCreation: protectedProcedure
    .input(z.object({
      trustName: z.string(),
      trustType: z.string(),
      settlor: z.string(),
      trustees: z.array(z.string()),
      beneficiaries: z.array(z.string()),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logTrustCreation(
        input.trustName,
        input.trustType,
        input.settlor,
        input.trustees,
        input.beneficiaries,
        ctx.user.id,
        input.details
      );
    }),

  // Log succession event
  logSuccessionEvent: protectedProcedure
    .input(z.object({
      eventDescription: z.string(),
      fromPerson: z.string(),
      toPerson: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logSuccessionEvent(
        input.eventDescription,
        input.fromPerson,
        input.toPerson,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log governance change
  logGovernanceChange: protectedProcedure
    .input(z.object({
      changeType: z.string(),
      changeDescription: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logGovernanceChange(
        input.changeType,
        input.changeDescription,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log compliance filing
  logComplianceFiling: protectedProcedure
    .input(z.object({
      filingType: z.string(),
      jurisdiction: z.string(),
      filingPeriod: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logComplianceFiling(
        input.filingType,
        input.jurisdiction,
        input.filingPeriod,
        input.entityId,
        input.entityName,
        ctx.user.id,
        input.details
      );
    }),

  // Log certificate issuance
  logCertificateIssuance: protectedProcedure
    .input(z.object({
      certificateType: z.string(),
      recipientName: z.string(),
      issuingEntity: z.string(),
      certificateId: z.string(),
      details: z.record(z.unknown()).optional()
    }))
    .mutation(({ input, ctx }) => {
      return autoLog.logCertificateIssuance(
        input.certificateType,
        input.recipientName,
        input.issuingEntity,
        input.certificateId,
        ctx.user.id,
        input.details
      );
    }),

  // Get all log entries
  getAllEntries: publicProcedure
    .query(() => {
      return autoLog.getAllLogEntries();
    }),

  // Get entries by entity
  getEntriesByEntity: publicProcedure
    .input(z.object({ entityId: z.string() }))
    .query(({ input }) => {
      return autoLog.getLogEntriesByEntity(input.entityId);
    }),

  // Get entries by category
  getEntriesByCategory: publicProcedure
    .input(z.object({
      category: z.enum(["entity", "property", "personnel", "financial", "legal", "compliance", "governance"])
    }))
    .query(({ input }) => {
      return autoLog.getLogEntriesByCategory(input.category);
    }),

  // Get entries by event type
  getEntriesByEventType: publicProcedure
    .input(z.object({ eventType: z.string() }))
    .query(({ input }) => {
      return autoLog.getLogEntriesByEventType(input.eventType as autoLog.AutoLogEventType);
    }),

  // Get entries by date range
  getEntriesByDateRange: publicProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string()
    }))
    .query(({ input }) => {
      return autoLog.getLogEntriesByDateRange(input.startDate, input.endDate);
    }),

  // Get entry by ID
  getEntryById: publicProcedure
    .input(z.object({ logId: z.string() }))
    .query(({ input }) => {
      return autoLog.getLogEntryById(input.logId);
    }),

  // Update entry status
  updateEntryStatus: protectedProcedure
    .input(z.object({
      logId: z.string(),
      status: z.enum(["logged", "pending_review", "verified", "archived"])
    }))
    .mutation(({ input }) => {
      return autoLog.updateLogEntryStatus(input.logId, input.status);
    }),

  // Get event configuration
  getEventConfig: publicProcedure
    .input(z.object({ eventType: z.string() }))
    .query(({ input }) => {
      return autoLog.getEventConfig(input.eventType as autoLog.AutoLogEventType);
    }),

  // Get all event configurations
  getAllEventConfigs: publicProcedure
    .query(() => {
      return autoLog.getAllEventConfigs();
    }),

  // Get log statistics
  getStatistics: publicProcedure
    .query(() => {
      return autoLog.getLogStatistics();
    })
});
