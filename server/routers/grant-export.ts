/**
 * Grant Export Router
 * 
 * Provides tRPC procedures for generating and exporting grant applications
 */

import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import {
  getGrantTemplates,
  getTemplatesForEntity,
  getGrantTemplate,
  getEntityInfo,
  generateGrantApplication,
  generateCoverLetter,
  generateBudgetTable,
  generateBudgetNarrative,
  generateOrganizationalBackground,
  exportToMarkdown,
  exportToJSON,
  getApplicationChecklist,
  type GrantTemplateType,
  type EntityType,
  type GrantApplicationData,
  type BudgetItem
} from '../services/grant-export';
import { getNeedStatement, getAllNeedStatements } from '../services/need-statements';

const entityTypeSchema = z.enum(['real_eye_nation', 'laws_collective', 'luvonpurpose_aws', '508_academy']);

const templateTypeSchema = z.enum([
  'federal_nea',
  'federal_usda', 
  'federal_sba',
  'foundation_ford',
  'foundation_kellogg',
  'foundation_macarthur',
  'generic'
]);

const budgetItemSchema = z.object({
  category: z.string(),
  description: z.string(),
  amount: z.number(),
  justification: z.string()
});

const grantApplicationDataSchema = z.object({
  entityType: entityTypeSchema,
  templateType: templateTypeSchema,
  applicantName: z.string(),
  applicantTitle: z.string(),
  organizationName: z.string(),
  organizationAddress: z.string(),
  organizationPhone: z.string(),
  organizationEmail: z.string(),
  organizationWebsite: z.string().optional(),
  einNumber: z.string(),
  dunsNumber: z.string().optional(),
  requestedAmount: z.number(),
  projectTitle: z.string(),
  projectStartDate: z.string(),
  projectEndDate: z.string(),
  projectSummary: z.string().optional(),
  customNeedStatement: z.string().optional(),
  budgetItems: z.array(budgetItemSchema),
  additionalDocuments: z.array(z.string()).optional()
});

export const grantExportRouter = router({
  /**
   * Get all available grant templates
   */
  getTemplates: publicProcedure.query(() => {
    return getGrantTemplates();
  }),

  /**
   * Get templates eligible for a specific entity
   */
  getTemplatesForEntity: publicProcedure
    .input(z.object({ entityType: entityTypeSchema }))
    .query(({ input }) => {
      return getTemplatesForEntity(input.entityType as EntityType);
    }),

  /**
   * Get a specific grant template by ID
   */
  getTemplate: publicProcedure
    .input(z.object({ templateType: templateTypeSchema }))
    .query(({ input }) => {
      return getGrantTemplate(input.templateType as GrantTemplateType);
    }),

  /**
   * Get entity information for pre-filling forms
   */
  getEntityInfo: publicProcedure
    .input(z.object({ entityType: entityTypeSchema }))
    .query(({ input }) => {
      return getEntityInfo(input.entityType as EntityType);
    }),

  /**
   * Get need statement for auto-population
   */
  getNeedStatement: publicProcedure
    .input(z.object({ entityType: entityTypeSchema }))
    .query(({ input }) => {
      return getNeedStatement(input.entityType as EntityType);
    }),

  /**
   * Get all need statements
   */
  getAllNeedStatements: publicProcedure.query(() => {
    return getAllNeedStatements();
  }),

  /**
   * Generate a complete grant application
   */
  generateApplication: publicProcedure
    .input(grantApplicationDataSchema)
    .mutation(({ input }) => {
      return generateGrantApplication(input as GrantApplicationData);
    }),

  /**
   * Generate just the cover letter
   */
  generateCoverLetter: publicProcedure
    .input(grantApplicationDataSchema)
    .mutation(({ input }) => {
      return generateCoverLetter(input as GrantApplicationData);
    }),

  /**
   * Generate budget table in markdown format
   */
  generateBudgetTable: publicProcedure
    .input(z.object({ budgetItems: z.array(budgetItemSchema) }))
    .mutation(({ input }) => {
      return generateBudgetTable(input.budgetItems as BudgetItem[]);
    }),

  /**
   * Generate budget narrative
   */
  generateBudgetNarrative: publicProcedure
    .input(z.object({ budgetItems: z.array(budgetItemSchema) }))
    .mutation(({ input }) => {
      return generateBudgetNarrative(input.budgetItems as BudgetItem[]);
    }),

  /**
   * Generate organizational background section
   */
  generateOrgBackground: publicProcedure
    .input(z.object({ entityType: entityTypeSchema }))
    .mutation(({ input }) => {
      return generateOrganizationalBackground(input.entityType as EntityType);
    }),

  /**
   * Export application to markdown
   */
  exportToMarkdown: publicProcedure
    .input(grantApplicationDataSchema)
    .mutation(({ input }) => {
      const application = generateGrantApplication(input as GrantApplicationData);
      return {
        markdown: exportToMarkdown(application),
        application
      };
    }),

  /**
   * Export application to JSON
   */
  exportToJSON: publicProcedure
    .input(grantApplicationDataSchema)
    .mutation(({ input }) => {
      const application = generateGrantApplication(input as GrantApplicationData);
      return {
        json: exportToJSON(application),
        application
      };
    }),

  /**
   * Get application checklist for a template
   */
  getChecklist: publicProcedure
    .input(z.object({ templateType: templateTypeSchema }))
    .query(({ input }) => {
      return getApplicationChecklist(input.templateType as GrantTemplateType);
    }),

  /**
   * Get pre-filled application data for an entity
   */
  getPrefilledData: publicProcedure
    .input(z.object({ 
      entityType: entityTypeSchema,
      templateType: templateTypeSchema
    }))
    .query(({ input }) => {
      const entityInfo = getEntityInfo(input.entityType as EntityType);
      const needStatement = getNeedStatement(input.entityType as EntityType);
      const template = getGrantTemplate(input.templateType as GrantTemplateType);
      
      if (!entityInfo || !template) {
        return null;
      }
      
      return {
        entityType: input.entityType,
        templateType: input.templateType,
        organizationName: entityInfo.legalName,
        organizationAddress: entityInfo.address,
        organizationPhone: entityInfo.phone,
        organizationEmail: entityInfo.email,
        organizationWebsite: entityInfo.website,
        einNumber: entityInfo.ein,
        taxStatus: entityInfo.taxStatus,
        missionStatement: entityInfo.missionStatement,
        needStatement: needStatement?.fullStatement || '',
        fundingRange: needStatement?.fundingRequest || '',
        suggestedAmount: needStatement?.fundingAmount?.min || template.maxFunding * 0.5,
        maxFunding: template.maxFunding,
        templateName: template.name,
        requiredDocuments: template.requiredDocuments,
        deadlineInfo: template.deadlineInfo
      };
    }),

  /**
   * Validate application data before submission
   */
  validateApplication: publicProcedure
    .input(grantApplicationDataSchema.partial())
    .mutation(({ input }) => {
      const errors: { field: string; message: string }[] = [];
      
      if (!input.entityType) {
        errors.push({ field: 'entityType', message: 'Entity type is required' });
      }
      if (!input.templateType) {
        errors.push({ field: 'templateType', message: 'Template type is required' });
      }
      if (!input.applicantName) {
        errors.push({ field: 'applicantName', message: 'Applicant name is required' });
      }
      if (!input.projectTitle) {
        errors.push({ field: 'projectTitle', message: 'Project title is required' });
      }
      if (!input.requestedAmount || input.requestedAmount <= 0) {
        errors.push({ field: 'requestedAmount', message: 'Valid requested amount is required' });
      }
      if (!input.projectStartDate) {
        errors.push({ field: 'projectStartDate', message: 'Project start date is required' });
      }
      if (!input.projectEndDate) {
        errors.push({ field: 'projectEndDate', message: 'Project end date is required' });
      }
      
      // Validate budget items if provided
      if (input.budgetItems && input.budgetItems.length > 0) {
        const totalBudget = input.budgetItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        if (input.requestedAmount && Math.abs(totalBudget - input.requestedAmount) > 1) {
          errors.push({ 
            field: 'budgetItems', 
            message: `Budget total ($${totalBudget.toLocaleString()}) does not match requested amount ($${input.requestedAmount?.toLocaleString()})` 
          });
        }
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    })
});
