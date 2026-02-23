/**
 * International Document Templates Router
 * Phase 51.2: API endpoints for international document templates
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import * as docTemplates from "../services/international-document-templates";

export const internationalDocumentTemplatesRouter = router({
  // Get all templates
  getAll: publicProcedure
    .query(() => {
      return docTemplates.getAllTemplates();
    }),

  // Get templates by category
  getByCategory: publicProcedure
    .input(z.object({
      category: z.enum([
        "formation",
        "compliance",
        "tax",
        "banking",
        "transfer_pricing",
        "substance",
        "beneficial_ownership",
        "treaty_claim"
      ])
    }))
    .query(({ input }) => {
      return docTemplates.getTemplatesByCategory(input.category);
    }),

  // Get templates by jurisdiction
  getByJurisdiction: publicProcedure
    .input(z.object({ jurisdictionCode: z.string() }))
    .query(({ input }) => {
      return docTemplates.getTemplatesByJurisdiction(input.jurisdictionCode);
    }),

  // Get template by ID
  getById: publicProcedure
    .input(z.object({ templateId: z.string() }))
    .query(({ input }) => {
      return docTemplates.getTemplateById(input.templateId);
    }),

  // Search templates
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      return docTemplates.searchTemplates(input.query);
    }),

  // Get formation templates
  getFormationTemplates: publicProcedure
    .input(z.object({ jurisdictionCode: z.string() }))
    .query(({ input }) => {
      return docTemplates.getFormationTemplates(input.jurisdictionCode);
    }),

  // Get compliance templates
  getComplianceTemplates: publicProcedure
    .input(z.object({ jurisdictionCode: z.string() }))
    .query(({ input }) => {
      return docTemplates.getComplianceTemplates(input.jurisdictionCode);
    }),

  // Get tax templates
  getTaxTemplates: publicProcedure
    .input(z.object({ jurisdictionCode: z.string() }))
    .query(({ input }) => {
      return docTemplates.getTaxTemplates(input.jurisdictionCode);
    }),

  // Get transfer pricing templates
  getTransferPricingTemplates: publicProcedure
    .query(() => {
      return docTemplates.getTransferPricingTemplates();
    }),

  // Get beneficial ownership templates
  getBeneficialOwnershipTemplates: publicProcedure
    .input(z.object({ jurisdictionCode: z.string() }))
    .query(({ input }) => {
      return docTemplates.getBeneficialOwnershipTemplates(input.jurisdictionCode);
    }),

  // Get banking templates
  getBankingTemplates: publicProcedure
    .query(() => {
      return docTemplates.getBankingTemplates();
    }),

  // Generate document from template
  generateDocument: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      data: z.record(z.unknown())
    }))
    .mutation(({ input }) => {
      return docTemplates.generateDocumentFromTemplate(input.templateId, input.data);
    }),

  // Validate document data
  validateData: publicProcedure
    .input(z.object({
      templateId: z.string(),
      data: z.record(z.unknown())
    }))
    .query(({ input }) => {
      return docTemplates.validateDocumentData(input.templateId, input.data);
    }),

  // Get template statistics
  getStatistics: publicProcedure
    .query(() => {
      return docTemplates.getTemplateStatistics();
    })
});
