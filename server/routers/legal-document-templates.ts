/**
 * Legal Document Templates Router
 * Phase 50.1: Government-compliant document templates
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  getAllTemplates,
  getTemplatesByCategory,
  getArticlesOfIncorporationTemplate,
  getLLCArticlesTemplate,
  getDBATemplate,
  getSS4EINTemplate,
  getForm1023Template,
  getW2Template,
  get1099NECTemplate,
  getWarrantyDeedTemplate,
  getOfferLetterTemplate,
  getRevocableLivingTrustTemplate,
  validateTemplateData,
  type TemplateCategory,
  type DocumentTemplate,
} from "../services/legal-document-templates";

export const legalDocumentTemplatesRouter = router({
  // Get all available templates
  getAllTemplates: publicProcedure.query(() => {
    return getAllTemplates();
  }),

  // Get templates by category
  getByCategory: publicProcedure
    .input(z.object({
      category: z.enum(['state_business', 'federal_filing', 'tax_forms', 'property', 'employment', 'trust']),
    }))
    .query(({ input }) => {
      return getTemplatesByCategory(input.category as TemplateCategory);
    }),

  // Get specific template
  getTemplate: publicProcedure
    .input(z.object({
      templateId: z.string(),
      state: z.string().optional().default('California'),
    }))
    .query(({ input }) => {
      const { templateId, state } = input;
      
      // State business templates
      if (templateId === 'articles_of_incorporation') {
        return getArticlesOfIncorporationTemplate(state);
      }
      if (templateId === 'llc_articles_of_organization') {
        return getLLCArticlesTemplate(state);
      }
      if (templateId === 'dba_fictitious_business_name') {
        return getDBATemplate(state);
      }
      
      // Federal filing templates
      if (templateId === 'ss4_ein_application') {
        return getSS4EINTemplate();
      }
      if (templateId === 'form_1023_501c3_application') {
        return getForm1023Template();
      }
      
      // Tax form templates
      if (templateId === 'w2_wage_statement') {
        return getW2Template();
      }
      if (templateId === 'form_1099_nec_nonemployee') {
        return get1099NECTemplate();
      }
      
      // Property templates
      if (templateId === 'warranty_deed') {
        return getWarrantyDeedTemplate(state);
      }
      
      // Employment templates
      if (templateId === 'offer_letter') {
        return getOfferLetterTemplate();
      }
      
      // Trust templates
      if (templateId === 'revocable_living_trust') {
        return getRevocableLivingTrustTemplate(state);
      }
      
      throw new Error(`Template not found: ${templateId}`);
    }),

  // Validate template data
  validateData: publicProcedure
    .input(z.object({
      templateId: z.string(),
      state: z.string().optional().default('California'),
      data: z.record(z.any()),
    }))
    .mutation(({ input }) => {
      const { templateId, state, data } = input;
      
      // Get the template
      let template: DocumentTemplate;
      
      if (templateId === 'articles_of_incorporation') {
        template = getArticlesOfIncorporationTemplate(state);
      } else if (templateId === 'llc_articles_of_organization') {
        template = getLLCArticlesTemplate(state);
      } else if (templateId === 'dba_fictitious_business_name') {
        template = getDBATemplate(state);
      } else if (templateId === 'ss4_ein_application') {
        template = getSS4EINTemplate();
      } else if (templateId === 'form_1023_501c3_application') {
        template = getForm1023Template();
      } else if (templateId === 'w2_wage_statement') {
        template = getW2Template();
      } else if (templateId === 'form_1099_nec_nonemployee') {
        template = get1099NECTemplate();
      } else if (templateId === 'warranty_deed') {
        template = getWarrantyDeedTemplate(state);
      } else if (templateId === 'offer_letter') {
        template = getOfferLetterTemplate();
      } else if (templateId === 'revocable_living_trust') {
        template = getRevocableLivingTrustTemplate(state);
      } else {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      return validateTemplateData(template, data);
    }),

  // Get template categories summary
  getCategories: publicProcedure.query(() => {
    return [
      {
        id: 'state_business',
        name: 'State Business Filings',
        description: 'Articles of Incorporation, LLC Articles, DBA Registration',
        templateCount: 9,
        icon: 'Building2',
      },
      {
        id: 'federal_filing',
        name: 'Federal Filings',
        description: 'EIN Application, 501(c)(3), S-Corp Election',
        templateCount: 7,
        icon: 'FileText',
      },
      {
        id: 'tax_forms',
        name: 'Tax Forms',
        description: 'W-2, 1099, Schedule C, Corporate Returns',
        templateCount: 16,
        icon: 'Calculator',
      },
      {
        id: 'property',
        name: 'Property Documents',
        description: 'Deeds, Title Transfers, Easements',
        templateCount: 10,
        icon: 'Home',
      },
      {
        id: 'employment',
        name: 'Employment Documents',
        description: 'Offer Letters, I-9, Agreements, Termination',
        templateCount: 12,
        icon: 'Users',
      },
      {
        id: 'trust',
        name: 'Trust Documents',
        description: 'Living Trusts, Wills, Power of Attorney',
        templateCount: 12,
        icon: 'Shield',
      },
    ];
  }),

  // Get available states for jurisdiction-specific templates
  getAvailableStates: publicProcedure.query(() => {
    return [
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
      { code: 'DE', name: 'Delaware' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' },
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'MO', name: 'Missouri' },
      { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'OR', name: 'Oregon' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' },
      { code: 'WI', name: 'Wisconsin' },
      { code: 'WY', name: 'Wyoming' },
      { code: 'DC', name: 'District of Columbia' },
    ];
  }),

  // Get filing fees by state
  getFilingFees: publicProcedure
    .input(z.object({
      state: z.string(),
    }))
    .query(({ input }) => {
      // State-specific filing fees (simplified - actual fees vary)
      const stateFees: Record<string, Record<string, number>> = {
        'California': {
          'articles_of_incorporation': 100,
          'llc_articles_of_organization': 70,
          'dba_fictitious_business_name': 30,
          'annual_report': 25,
          'statement_of_information': 25,
        },
        'Delaware': {
          'articles_of_incorporation': 89,
          'llc_articles_of_organization': 90,
          'dba_fictitious_business_name': 25,
          'annual_report': 50,
        },
        'Texas': {
          'articles_of_incorporation': 300,
          'llc_articles_of_organization': 300,
          'dba_fictitious_business_name': 25,
        },
        'Nevada': {
          'articles_of_incorporation': 75,
          'llc_articles_of_organization': 75,
          'dba_fictitious_business_name': 25,
          'annual_report': 150,
        },
        'New York': {
          'articles_of_incorporation': 125,
          'llc_articles_of_organization': 200,
          'dba_fictitious_business_name': 100,
        },
        'Florida': {
          'articles_of_incorporation': 35,
          'llc_articles_of_organization': 125,
          'dba_fictitious_business_name': 50,
          'annual_report': 138.75,
        },
      };
      
      return stateFees[input.state] || stateFees['California'];
    }),

  // Get template field help
  getFieldHelp: publicProcedure
    .input(z.object({
      fieldType: z.string(),
    }))
    .query(({ input }) => {
      const helpContent: Record<string, { title: string; description: string; examples: string[] }> = {
        'ssn': {
          title: 'Social Security Number',
          description: 'A 9-digit number issued by the Social Security Administration. Format: XXX-XX-XXXX',
          examples: ['123-45-6789'],
        },
        'ein': {
          title: 'Employer Identification Number',
          description: 'A 9-digit number issued by the IRS for business tax purposes. Format: XX-XXXXXXX',
          examples: ['12-3456789'],
        },
        'address': {
          title: 'Address',
          description: 'Full street address including city, state, and ZIP code',
          examples: ['123 Main Street, Suite 100, Los Angeles, CA 90001'],
        },
        'signature': {
          title: 'Signature',
          description: 'Electronic signature or indication of where physical signature is required',
          examples: ['John Doe', '/s/ John Doe'],
        },
        'currency': {
          title: 'Currency Amount',
          description: 'Dollar amount in US currency',
          examples: ['1000.00', '50000', '0.01'],
        },
      };
      
      return helpContent[input.fieldType] || {
        title: input.fieldType,
        description: 'Enter the requested information',
        examples: [],
      };
    }),
});

export type LegalDocumentTemplatesRouter = typeof legalDocumentTemplatesRouter;
