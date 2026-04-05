/**
 * PDF Generation Engine & Lifecycle Tracking Router
 * Phase 50.2-4: PDF generation, event logging, and asset tracking
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import * as pdfEngine from "../services/pdf-generation-engine";
import * as lifecycle from "../services/lifecycle-tracking";

export const pdfLifecycleRouter = router({
  // ============================================
  // PDF GENERATION ENDPOINTS
  // ============================================

  // Get all PDF templates
  getAllPDFTemplates: publicProcedure.query(() => {
    return pdfEngine.getAllPDFTemplates();
  }),

  // Get PDF template by ID
  getPDFTemplate: publicProcedure
    .input(z.object({ templateId: z.string() }))
    .query(({ input }) => {
      const template = pdfEngine.getPDFTemplateById(input.templateId);
      if (!template) {
        throw new Error(`Template not found: ${input.templateId}`);
      }
      return template;
    }),

  // Get PDF templates by category
  getPDFTemplatesByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => {
      return pdfEngine.getPDFTemplatesByCategory(input.category);
    }),

  // Validate PDF data
  validatePDFData: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      data: z.record(z.any()),
    }))
    .mutation(({ input }) => {
      const template = pdfEngine.getPDFTemplateById(input.templateId);
      if (!template) {
        throw new Error(`Template not found: ${input.templateId}`);
      }
      return pdfEngine.validatePDFData(template, input.data);
    }),

  // Generate PDF
  generatePDF: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      data: z.record(z.any()),
      includeWatermark: z.boolean().optional(),
      signatureData: z.record(z.object({
        signed: z.boolean(),
        signedAt: z.string().optional(),
        signedBy: z.string().optional(),
        witnessName: z.string().optional(),
        notarized: z.boolean().optional(),
        notaryName: z.string().optional(),
        notaryCommission: z.string().optional(),
      })).optional(),
    }))
    .mutation(({ input }) => {
      const template = pdfEngine.getPDFTemplateById(input.templateId);
      if (!template) {
        throw new Error(`Template not found: ${input.templateId}`);
      }
      return pdfEngine.generatePDF(template, input.data, {
        includeWatermark: input.includeWatermark,
        signatureData: input.signatureData,
      });
    }),

  // Get state-specific Articles of Incorporation template
  getArticlesOfIncorporationTemplate: publicProcedure
    .input(z.object({ state: z.string().default('Delaware') }))
    .query(({ input }) => {
      return pdfEngine.getArticlesOfIncorporationPDFTemplate(input.state);
    }),

  // Get W-2 template
  getW2Template: publicProcedure.query(() => {
    return pdfEngine.getW2PDFTemplate();
  }),

  // Get Promissory Note template
  getPromissoryNoteTemplate: publicProcedure.query(() => {
    return pdfEngine.getPromissoryNotePDFTemplate();
  }),

  // ============================================
  // LIFECYCLE EVENT ENDPOINTS
  // ============================================

  // Log business creation event
  logBusinessCreation: protectedProcedure
    .input(z.object({
      businessId: z.string(),
      businessName: z.string(),
      entityType: z.string(),
      state: z.string(),
      registrationDetails: z.record(z.any()).optional(),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.logBusinessCreation({
        businessId: input.businessId,
        businessName: input.businessName,
        entityType: input.entityType,
        state: input.state,
        performedBy: ctx.user.name || ctx.user.id.toString(),
        registrationDetails: input.registrationDetails || {},
      });
    }),

  // Log business dissolution event
  logBusinessDissolution: protectedProcedure
    .input(z.object({
      businessId: z.string(),
      businessName: z.string(),
      reason: z.string(),
      effectiveDate: z.string(),
      finalDetails: z.record(z.any()).optional(),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.logBusinessDissolution({
        businessId: input.businessId,
        businessName: input.businessName,
        reason: input.reason,
        effectiveDate: input.effectiveDate,
        performedBy: ctx.user.name || ctx.user.id.toString(),
        finalDetails: input.finalDetails || {},
      });
    }),

  // Log property acquisition event
  logPropertyAcquisition: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      propertyAddress: z.string(),
      acquisitionType: z.enum(['purchase', 'inheritance', 'gift', 'transfer']),
      purchasePrice: z.number().optional(),
      acquisitionDetails: z.record(z.any()).optional(),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.logPropertyAcquisition({
        propertyId: input.propertyId,
        propertyAddress: input.propertyAddress,
        acquisitionType: input.acquisitionType,
        purchasePrice: input.purchasePrice,
        performedBy: ctx.user.name || ctx.user.id.toString(),
        acquisitionDetails: input.acquisitionDetails || {},
      });
    }),

  // Log property sale event
  logPropertySale: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      propertyAddress: z.string(),
      salePrice: z.number(),
      buyer: z.string(),
      saleDetails: z.record(z.any()).optional(),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.logPropertySale({
        propertyId: input.propertyId,
        propertyAddress: input.propertyAddress,
        salePrice: input.salePrice,
        buyer: input.buyer,
        performedBy: ctx.user.name || ctx.user.id.toString(),
        saleDetails: input.saleDetails || {},
      });
    }),

  // Log worker hire event
  logWorkerHire: protectedProcedure
    .input(z.object({
      workerId: z.string(),
      workerName: z.string(),
      position: z.string(),
      department: z.string(),
      startDate: z.string(),
      employmentType: z.enum(['full_time', 'part_time', 'contractor', 'intern']),
      hireDetails: z.record(z.any()).optional(),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.logWorkerHire({
        workerId: input.workerId,
        workerName: input.workerName,
        position: input.position,
        department: input.department,
        startDate: input.startDate,
        employmentType: input.employmentType,
        performedBy: ctx.user.name || ctx.user.id.toString(),
        hireDetails: input.hireDetails || {},
      });
    }),

  // Log worker termination event
  logWorkerTermination: protectedProcedure
    .input(z.object({
      workerId: z.string(),
      workerName: z.string(),
      terminationType: z.enum(['resignation', 'termination', 'layoff', 'retirement', 'contract_end']),
      lastDay: z.string(),
      reason: z.string(),
      terminationDetails: z.record(z.any()).optional(),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.logWorkerTermination({
        workerId: input.workerId,
        workerName: input.workerName,
        terminationType: input.terminationType,
        lastDay: input.lastDay,
        reason: input.reason,
        performedBy: ctx.user.name || ctx.user.id.toString(),
        terminationDetails: input.terminationDetails || {},
      });
    }),

  // Log document creation event
  logDocumentCreation: protectedProcedure
    .input(z.object({
      documentId: z.string(),
      documentName: z.string(),
      documentType: z.string(),
      relatedEntityType: z.enum(['business', 'property', 'worker', 'document', 'trust', 'asset']).optional(),
      relatedEntityId: z.string().optional(),
      documentDetails: z.record(z.any()).optional(),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.logDocumentCreation({
        documentId: input.documentId,
        documentName: input.documentName,
        documentType: input.documentType,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        performedBy: ctx.user.name || ctx.user.id.toString(),
        documentDetails: input.documentDetails || {},
      });
    }),

  // Log document filing event
  logDocumentFiling: protectedProcedure
    .input(z.object({
      documentId: z.string(),
      documentName: z.string(),
      filingAgency: z.string(),
      filingDate: z.string(),
      confirmationNumber: z.string().optional(),
      filingDetails: z.record(z.any()).optional(),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.logDocumentFiling({
        documentId: input.documentId,
        documentName: input.documentName,
        filingAgency: input.filingAgency,
        filingDate: input.filingDate,
        confirmationNumber: input.confirmationNumber,
        performedBy: ctx.user.name || ctx.user.id.toString(),
        filingDetails: input.filingDetails || {},
      });
    }),

  // Log document archival event
  logDocumentArchival: protectedProcedure
    .input(z.object({
      documentId: z.string(),
      documentName: z.string(),
      archiveLocation: z.string(),
      retentionPeriod: z.string(),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.logDocumentArchival({
        documentId: input.documentId,
        documentName: input.documentName,
        archiveLocation: input.archiveLocation,
        retentionPeriod: input.retentionPeriod,
        performedBy: ctx.user.name || ctx.user.id.toString(),
      });
    }),

  // ============================================
  // EVENT TRIGGER ENDPOINTS
  // ============================================

  // Get default event triggers
  getDefaultEventTriggers: publicProcedure.query(() => {
    return lifecycle.getDefaultEventTriggers();
  }),

  // Create event trigger
  createEventTrigger: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      triggerType: z.enum(['event', 'schedule', 'threshold', 'deadline']),
      sourceEventType: z.string(),
      targetAction: z.string(),
      conditions: z.array(z.object({
        field: z.string(),
        operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'not_in']),
        value: z.any(),
      })),
      actions: z.array(z.object({
        type: z.enum(['create_document', 'send_notification', 'log_to_luvledger', 'create_task', 'update_status', 'generate_report']),
        parameters: z.record(z.any()),
      })),
    }))
    .mutation(({ input }) => {
      return lifecycle.createEventTrigger(input);
    }),

  // ============================================
  // FILING WORKFLOW ENDPOINTS
  // ============================================

  // Create filing workflow
  createFilingWorkflow: protectedProcedure
    .input(z.object({
      name: z.string(),
      entityType: z.enum(['business', 'property', 'worker', 'document', 'trust', 'asset']),
      entityId: z.string(),
      filingType: z.string(),
      jurisdiction: z.string(),
      deadline: z.string().optional(),
      tasks: z.array(z.object({
        name: z.string(),
        description: z.string(),
        order: z.number(),
        dependencies: z.array(z.string()).optional(),
      })),
    }))
    .mutation(({ input }) => {
      return lifecycle.createFilingWorkflow(input);
    }),

  // Update filing task status
  updateFilingTaskStatus: protectedProcedure
    .input(z.object({
      workflow: z.any(), // FilingWorkflow type
      taskId: z.string(),
      status: z.enum(['pending', 'in_progress', 'completed', 'skipped']),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.updateFilingTaskStatus(
        input.workflow,
        input.taskId,
        input.status,
        ctx.user.name || ctx.user.id.toString()
      );
    }),

  // ============================================
  // ASSET LIFECYCLE ENDPOINTS
  // ============================================

  // Create asset lifecycle
  createAssetLifecycle: protectedProcedure
    .input(z.object({
      entityType: z.enum(['business', 'property', 'worker', 'document', 'trust', 'asset']),
      entityId: z.string(),
      entityName: z.string(),
      initialStatus: z.enum(['active', 'pending', 'suspended', 'under_review', 'transferred', 'dissolved', 'archived']).optional(),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.createAssetLifecycle({
        entityType: input.entityType,
        entityId: input.entityId,
        entityName: input.entityName,
        createdBy: ctx.user.name || ctx.user.id.toString(),
        initialStatus: input.initialStatus,
      });
    }),

  // Update asset status
  updateAssetStatus: protectedProcedure
    .input(z.object({
      lifecycle: z.any(), // AssetLifecycle type
      newStatus: z.enum(['active', 'pending', 'suspended', 'under_review', 'transferred', 'dissolved', 'archived']),
      reason: z.string(),
    }))
    .mutation(({ input, ctx }) => {
      return lifecycle.updateAssetStatus(
        input.lifecycle,
        input.newStatus,
        ctx.user.name || ctx.user.id.toString(),
        input.reason
      );
    }),

  // Add document to lifecycle
  addDocumentToLifecycle: protectedProcedure
    .input(z.object({
      lifecycle: z.any(), // AssetLifecycle type
      document: z.object({
        documentId: z.string(),
        documentType: z.string(),
        documentName: z.string(),
        addedAt: z.string(),
        addedBy: z.string(),
        status: z.enum(['draft', 'pending', 'signed', 'filed', 'archived']),
        filingDate: z.string().optional(),
        expirationDate: z.string().optional(),
      }),
    }))
    .mutation(({ input }) => {
      return lifecycle.addDocumentToLifecycle(input.lifecycle, input.document);
    }),

  // Add financial record to lifecycle
  addFinancialRecord: protectedProcedure
    .input(z.object({
      lifecycle: z.any(), // AssetLifecycle type
      record: z.object({
        type: z.enum(['income', 'expense', 'asset_value', 'liability', 'transfer']),
        amount: z.number(),
        currency: z.string(),
        date: z.string(),
        description: z.string(),
        category: z.string(),
        relatedEntityId: z.string().optional(),
        luvLedgerTxId: z.string().optional(),
      }),
    }))
    .mutation(({ input }) => {
      return lifecycle.addFinancialRecord(input.lifecycle, input.record);
    }),

  // Add compliance record to lifecycle
  addComplianceRecord: protectedProcedure
    .input(z.object({
      lifecycle: z.any(), // AssetLifecycle type
      record: z.object({
        requirementType: z.string(),
        requirementName: z.string(),
        jurisdiction: z.string(),
        dueDate: z.string(),
        status: z.enum(['pending', 'in_progress', 'completed', 'overdue', 'waived']),
        completedAt: z.string().optional(),
        documentIds: z.array(z.string()),
        notes: z.string().optional(),
      }),
    }))
    .mutation(({ input }) => {
      return lifecycle.addComplianceRecord(input.lifecycle, input.record);
    }),

  // Generate lifecycle report
  generateLifecycleReport: protectedProcedure
    .input(z.object({
      lifecycle: z.any(), // AssetLifecycle type
    }))
    .mutation(({ input }) => {
      return lifecycle.generateLifecycleReport(input.lifecycle);
    }),
});
