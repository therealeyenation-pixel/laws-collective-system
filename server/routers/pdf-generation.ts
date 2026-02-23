/**
 * PDF Generation Router
 * 
 * tRPC procedures for PDF generation with government-compliant formatting
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import {
  generateTrackingCode,
  generateQRCode,
  validateFields,
  mapEntityToFields,
  generatePDFContent,
  generatePDF,
  generateSS4,
  generateW9,
  generateDEAnnualReport,
  generateGAAnnualRegistration,
  generate508AnnualReport,
  getAvailableTemplates,
  getTemplatesByJurisdiction,
  getTemplateById,
  calculateFilingDeadline,
  getUpcomingDeadlines,
  PAPER_SIZES,
  DEFAULT_MARGINS,
  type PDFFieldMapping,
  type PDFDocumentConfig,
  type EntityData,
} from '../services/pdf-generation';

// ============================================================================
// Input Schemas
// ============================================================================

const fieldMappingSchema = z.object({
  fieldId: z.string(),
  fieldName: z.string(),
  fieldType: z.enum(['text', 'date', 'number', 'currency', 'checkbox', 'signature', 'barcode', 'qrcode']),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  required: z.boolean(),
  maxLength: z.number().optional(),
  format: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
});

const signaturePlaceholderSchema = z.object({
  id: z.string(),
  signerName: z.string(),
  signerRole: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  required: z.boolean(),
  signedAt: z.date().optional(),
  signatureHash: z.string().optional(),
});

const documentConfigSchema = z.object({
  documentId: z.string(),
  documentType: z.string(),
  title: z.string(),
  paperSize: z.enum(['letter', 'legal', 'a4']),
  orientation: z.enum(['portrait', 'landscape']),
  margins: z.object({
    top: z.number(),
    right: z.number(),
    bottom: z.number(),
    left: z.number(),
  }),
  fields: z.array(fieldMappingSchema),
  signatures: z.array(signaturePlaceholderSchema),
  trackingCode: z.string().optional(),
  watermark: z.string().optional(),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
  pageNumbers: z.boolean(),
  confidential: z.boolean(),
});

const entityDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  ein: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  county: z.string().optional(),
  formationDate: z.date().optional(),
  fiscalYearEnd: z.string().optional(),
  registeredAgent: z.string().optional(),
  registeredAgentAddress: z.string().optional(),
  principalOfficer: z.string().optional(),
  principalOfficerSSN: z.string().optional(),
  naicsCode: z.string().optional(),
  totalShares: z.number().optional(),
  parValue: z.number().optional(),
  grossAssets: z.number().optional(),
  issuedShares: z.number().optional(),
  grossReceipts: z.number().optional(),
  totalAssets: z.number().optional(),
  religiousPurpose: z.string().optional(),
});

// ============================================================================
// Router
// ============================================================================

export const pdfGenerationRouter = router({
  // Get available form templates
  getTemplates: publicProcedure
    .query(() => {
      return getAvailableTemplates();
    }),
  
  // Get templates by jurisdiction
  getTemplatesByJurisdiction: publicProcedure
    .input(z.object({
      jurisdiction: z.enum(['federal', 'state', 'local']),
      state: z.string().optional(),
    }))
    .query(({ input }) => {
      return getTemplatesByJurisdiction(input.jurisdiction, input.state);
    }),
  
  // Get a specific template
  getTemplate: publicProcedure
    .input(z.object({
      formId: z.string(),
    }))
    .query(({ input }) => {
      const template = getTemplateById(input.formId);
      if (!template) {
        throw new Error(`Template not found: ${input.formId}`);
      }
      return template;
    }),
  
  // Get paper sizes
  getPaperSizes: publicProcedure
    .query(() => {
      return PAPER_SIZES;
    }),
  
  // Get default margins
  getDefaultMargins: publicProcedure
    .query(() => {
      return DEFAULT_MARGINS;
    }),
  
  // Generate tracking code
  generateTrackingCode: protectedProcedure
    .input(z.object({
      documentType: z.string(),
      entityId: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return generateTrackingCode(input.documentType, input.entityId);
    }),
  
  // Generate QR code
  generateQRCode: protectedProcedure
    .input(z.object({
      data: z.string(),
    }))
    .mutation(async ({ input }) => {
      return generateQRCode(input.data);
    }),
  
  // Validate fields
  validateFields: protectedProcedure
    .input(z.object({
      fields: z.array(fieldMappingSchema),
    }))
    .mutation(({ input }) => {
      return validateFields(input.fields as PDFFieldMapping[]);
    }),
  
  // Map entity data to form fields
  mapEntityToFields: protectedProcedure
    .input(z.object({
      entity: entityDataSchema,
      formId: z.string(),
    }))
    .mutation(({ input }) => {
      const template = getTemplateById(input.formId);
      if (!template) {
        throw new Error(`Template not found: ${input.formId}`);
      }
      return mapEntityToFields(input.entity as EntityData, template);
    }),
  
  // Generate PDF content (HTML/CSS)
  generatePDFContent: protectedProcedure
    .input(documentConfigSchema)
    .mutation(async ({ input }) => {
      return generatePDFContent(input as PDFDocumentConfig);
    }),
  
  // Generate PDF
  generatePDF: protectedProcedure
    .input(documentConfigSchema)
    .mutation(async ({ input }) => {
      return generatePDF(input as PDFDocumentConfig);
    }),
  
  // Generate IRS SS-4 (EIN Application)
  generateSS4: protectedProcedure
    .input(z.object({
      entity: entityDataSchema,
    }))
    .mutation(async ({ input }) => {
      return generateSS4(input.entity as EntityData);
    }),
  
  // Generate IRS W-9
  generateW9: protectedProcedure
    .input(z.object({
      entity: entityDataSchema,
    }))
    .mutation(async ({ input }) => {
      return generateW9(input.entity as EntityData);
    }),
  
  // Generate Delaware Annual Report
  generateDEAnnualReport: protectedProcedure
    .input(z.object({
      entity: entityDataSchema,
    }))
    .mutation(async ({ input }) => {
      return generateDEAnnualReport(input.entity as EntityData);
    }),
  
  // Generate Georgia Annual Registration
  generateGAAnnualRegistration: protectedProcedure
    .input(z.object({
      entity: entityDataSchema,
    }))
    .mutation(async ({ input }) => {
      return generateGAAnnualRegistration(input.entity as EntityData);
    }),
  
  // Generate 508(c)(1)(a) Annual Report
  generate508AnnualReport: protectedProcedure
    .input(z.object({
      entity: entityDataSchema,
    }))
    .mutation(async ({ input }) => {
      return generate508AnnualReport(input.entity as EntityData);
    }),
  
  // Calculate filing deadline
  calculateFilingDeadline: publicProcedure
    .input(z.object({
      formId: z.string(),
      year: z.number(),
    }))
    .query(({ input }) => {
      const template = getTemplateById(input.formId);
      if (!template) {
        throw new Error(`Template not found: ${input.formId}`);
      }
      return calculateFilingDeadline(template, input.year);
    }),
  
  // Get upcoming filing deadlines
  getUpcomingDeadlines: protectedProcedure
    .input(z.object({
      entityState: z.string(),
      entityType: z.string(),
      year: z.number().optional(),
    }))
    .query(({ input }) => {
      return getUpcomingDeadlines(
        input.entityState,
        input.entityType,
        input.year
      );
    }),
  
  // Generate document from template with entity data
  generateFromTemplate: protectedProcedure
    .input(z.object({
      formId: z.string(),
      entity: entityDataSchema,
      overrides: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
      confidential: z.boolean().optional(),
      watermark: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const template = getTemplateById(input.formId);
      if (!template) {
        throw new Error(`Template not found: ${input.formId}`);
      }
      
      // Map entity data to fields
      let fields = mapEntityToFields(input.entity as EntityData, template);
      
      // Apply overrides
      if (input.overrides) {
        fields = fields.map(field => {
          if (input.overrides && field.fieldId in input.overrides) {
            return { ...field, value: input.overrides[field.fieldId] };
          }
          return field;
        });
      }
      
      // Create document config
      const config: PDFDocumentConfig = {
        documentId: `${input.formId}-${input.entity.id}`,
        documentType: input.formId.toUpperCase(),
        title: template.formName,
        paperSize: 'letter',
        orientation: 'portrait',
        margins: DEFAULT_MARGINS,
        fields,
        signatures: template.signatures,
        headerText: template.agency,
        footerText: template.filingFee !== undefined 
          ? `Filing Fee: $${template.filingFee}${template.filingDeadline ? ` | Due: ${template.filingDeadline}` : ''}`
          : undefined,
        pageNumbers: true,
        confidential: input.confidential ?? false,
        watermark: input.watermark,
      };
      
      // Generate PDF
      const result = await generatePDF(config);
      
      // Also generate content for preview
      const content = await generatePDFContent(config);
      
      return {
        ...result,
        content,
        template: {
          formId: template.formId,
          formName: template.formName,
          agency: template.agency,
          jurisdiction: template.jurisdiction,
          state: template.state,
          filingFee: template.filingFee,
          filingDeadline: template.filingDeadline,
        },
      };
    }),
  
  // Batch generate multiple documents
  batchGenerate: protectedProcedure
    .input(z.object({
      formIds: z.array(z.string()),
      entity: entityDataSchema,
      confidential: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const results = [];
      
      for (const formId of input.formIds) {
        const template = getTemplateById(formId);
        if (!template) {
          results.push({
            formId,
            success: false,
            error: `Template not found: ${formId}`,
          });
          continue;
        }
        
        try {
          const fields = mapEntityToFields(input.entity as EntityData, template);
          
          const config: PDFDocumentConfig = {
            documentId: `${formId}-${input.entity.id}`,
            documentType: formId.toUpperCase(),
            title: template.formName,
            paperSize: 'letter',
            orientation: 'portrait',
            margins: DEFAULT_MARGINS,
            fields,
            signatures: template.signatures,
            headerText: template.agency,
            pageNumbers: true,
            confidential: input.confidential ?? false,
          };
          
          const result = await generatePDF(config);
          results.push({
            formId,
            ...result,
          });
        } catch (error) {
          results.push({
            formId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
      
      return {
        total: input.formIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    }),
});

export type PdfGenerationRouter = typeof pdfGenerationRouter;
