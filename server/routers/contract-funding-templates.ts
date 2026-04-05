/**
 * Contract Agreement and Funding Templates Router
 * Phase 50.1b-c: Contract templates and funding document templates
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import * as contractTemplates from '../services/contract-agreement-templates';
import * as fundingTemplates from '../services/funding-templates';

export const contractFundingTemplatesRouter = router({
  // ============================================
  // CONTRACT AGREEMENT TEMPLATES (50.1b)
  // ============================================
  
  getAllContractTemplates: publicProcedure.query(() => {
    return contractTemplates.getAllContractTemplates();
  }),
  
  getContractTemplatesByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => {
      return contractTemplates.getContractTemplatesByCategory(input.category as contractTemplates.ContractCategory);
    }),
  
  getServiceAgreementTemplate: publicProcedure.query(() => {
    return contractTemplates.getServiceAgreementTemplate();
  }),
  
  getConsultingAgreementTemplate: publicProcedure.query(() => {
    return contractTemplates.getConsultingAgreementTemplate();
  }),
  
  getVendorAgreementTemplate: publicProcedure.query(() => {
    return contractTemplates.getVendorAgreementTemplate();
  }),
  
  getPartnershipAgreementTemplate: publicProcedure.query(() => {
    return contractTemplates.getPartnershipAgreementTemplate();
  }),
  
  getJointVentureAgreementTemplate: publicProcedure.query(() => {
    return contractTemplates.getJointVentureAgreementTemplate();
  }),
  
  getLeaseAgreementTemplate: publicProcedure.query(() => {
    return contractTemplates.getLeaseAgreementTemplate();
  }),
  
  getPurchaseAgreementTemplate: publicProcedure.query(() => {
    return contractTemplates.getPurchaseAgreementTemplate();
  }),
  
  getNDATemplate: publicProcedure.query(() => {
    return contractTemplates.getNDATemplate();
  }),
  
  getNonCompeteTemplate: publicProcedure.query(() => {
    return contractTemplates.getNonCompeteTemplate();
  }),
  
  validateContractData: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      data: z.record(z.any()),
    }))
    .mutation(({ input }) => {
      const template = contractTemplates.getAllContractTemplates().find(t => t.id === input.templateId);
      if (!template) {
        return { valid: false, errors: ['Template not found'], warnings: [] };
      }
      return contractTemplates.validateContractData(template, input.data);
    }),
  
  // ============================================
  // FUNDING TEMPLATES (50.1c)
  // ============================================
  
  getAllFundingTemplates: publicProcedure.query(() => {
    return fundingTemplates.getAllFundingTemplates();
  }),
  
  getFundingTemplatesByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => {
      return fundingTemplates.getFundingTemplatesByCategory(input.category as fundingTemplates.FundingCategory);
    }),
  
  // Grant Application Templates
  getFederalSAMGrantTemplate: publicProcedure.query(() => {
    return fundingTemplates.getFederalSAMGrantTemplate();
  }),
  
  getFoundationGrantTemplate: publicProcedure.query(() => {
    return fundingTemplates.getFoundationGrantTemplate();
  }),
  
  get508c1aGrantTemplate: publicProcedure.query(() => {
    return fundingTemplates.get508c1aGrantTemplate();
  }),
  
  // Grant Report Templates
  getGrantProgressReportTemplate: publicProcedure.query(() => {
    return fundingTemplates.getGrantProgressReportTemplate();
  }),
  
  getGrantFinalReportTemplate: publicProcedure.query(() => {
    return fundingTemplates.getGrantFinalReportTemplate();
  }),
  
  // Loan Document Templates
  getPromissoryNoteTemplate: publicProcedure.query(() => {
    return fundingTemplates.getPromissoryNoteTemplate();
  }),
  
  getLoanAgreementTemplate: publicProcedure.query(() => {
    return fundingTemplates.getLoanAgreementTemplate();
  }),
  
  // SBA Loan Templates
  getSBA7aTemplate: publicProcedure.query(() => {
    return fundingTemplates.getSBA7aTemplate();
  }),
  
  getSBA504Template: publicProcedure.query(() => {
    return fundingTemplates.getSBA504Template();
  }),
  
  // Investor Document Templates
  getSAFETemplate: publicProcedure.query(() => {
    return fundingTemplates.getSAFETemplate();
  }),
  
  getConvertibleNoteTemplate: publicProcedure.query(() => {
    return fundingTemplates.getConvertibleNoteTemplate();
  }),
  
  getTermSheetTemplate: publicProcedure.query(() => {
    return fundingTemplates.getTermSheetTemplate();
  }),
  
  // Utility Functions
  calculateAmortization: protectedProcedure
    .input(z.object({
      principal: z.number().positive(),
      annualRate: z.number().min(0).max(100),
      termMonths: z.number().int().positive().max(360),
      startDate: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const startDate = input.startDate ? new Date(input.startDate) : new Date();
      return fundingTemplates.calculateAmortizationSchedule(
        input.principal,
        input.annualRate,
        input.termMonths,
        startDate
      );
    }),
  
  validateFundingApplication: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      data: z.record(z.any()),
    }))
    .mutation(({ input }) => {
      const template = fundingTemplates.getAllFundingTemplates().find(t => t.id === input.templateId);
      if (!template) {
        return { valid: false, errors: ['Template not found'], warnings: [] };
      }
      return fundingTemplates.validateFundingApplication(template, input.data);
    }),
  
  // Summary endpoints
  getTemplateCategories: publicProcedure.query(() => {
    return {
      contractCategories: Object.values(contractTemplates.CONTRACT_CATEGORIES),
      fundingCategories: Object.values(fundingTemplates.FUNDING_CATEGORIES),
    };
  }),
  
  getTemplateSummary: publicProcedure.query(() => {
    const contracts = contractTemplates.getAllContractTemplates();
    const funding = fundingTemplates.getAllFundingTemplates();
    
    return {
      totalTemplates: contracts.length + funding.length,
      contractTemplates: contracts.length,
      fundingTemplates: funding.length,
      byCategory: {
        contracts: {
          service: contracts.filter(t => t.category === 'service').length,
          partnership: contracts.filter(t => t.category === 'partnership').length,
          property: contracts.filter(t => t.category === 'property').length,
          confidentiality: contracts.filter(t => t.category === 'confidentiality').length,
        },
        funding: {
          grantApplication: funding.filter(t => t.category === 'grant_application').length,
          grantReport: funding.filter(t => t.category === 'grant_report').length,
          loanDocument: funding.filter(t => t.category === 'loan_document').length,
          sbaLoan: funding.filter(t => t.category === 'sba_loan').length,
          investorDocument: funding.filter(t => t.category === 'investor_document').length,
        },
      },
    };
  }),
});
