/**
 * International Operations Router
 * Phase 51: API endpoints for international entity management and compliance
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import * as intlOps from "../services/international-operations";

export const internationalOperationsRouter = router({
  // Get all jurisdictions
  getJurisdictions: publicProcedure
    .query(() => {
      return intlOps.getJurisdictions();
    }),

  // Get jurisdiction by code
  getJurisdiction: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(({ input }) => {
      return intlOps.getJurisdiction(input.code);
    }),

  // Get jurisdictions by region
  getJurisdictionsByRegion: publicProcedure
    .input(z.object({
      region: z.enum(["europe", "americas", "asia_pacific", "caribbean", "middle_east", "africa"])
    }))
    .query(({ input }) => {
      return intlOps.getJurisdictionsByRegion(input.region);
    }),

  // Get tax-favorable jurisdictions
  getTaxFavorableJurisdictions: publicProcedure
    .query(() => {
      return intlOps.getTaxFavorableJurisdictions();
    }),

  // Get tax treaty
  getTaxTreaty: publicProcedure
    .input(z.object({
      country1: z.string(),
      country2: z.string()
    }))
    .query(({ input }) => {
      return intlOps.getTaxTreaty(input.country1, input.country2);
    }),

  // Get all tax treaties for a country
  getTaxTreatiesForCountry: publicProcedure
    .input(z.object({ countryCode: z.string() }))
    .query(({ input }) => {
      return intlOps.getTaxTreatiesForCountry(input.countryCode);
    }),

  // Calculate withholding rate
  calculateWithholdingRate: publicProcedure
    .input(z.object({
      sourceCountry: z.string(),
      recipientCountry: z.string(),
      incomeType: z.enum(["dividend", "interest", "royalty"])
    }))
    .query(({ input }) => {
      return intlOps.calculateWithholdingRate(
        input.sourceCountry,
        input.recipientCountry,
        input.incomeType
      );
    }),

  // Create international entity
  createInternationalEntity: protectedProcedure
    .input(z.object({
      name: z.string(),
      entityType: z.enum([
        "uk_ltd", "uk_plc", "eu_gmbh", "eu_sarl", "eu_bv", "eu_ag",
        "offshore_nevis", "offshore_cook", "offshore_cayman", "offshore_bvi",
        "canada_corp", "australia_pty", "singapore_pte", "hong_kong_ltd",
        "ireland_ltd", "panama_sa", "foreign_charity", "foreign_trust"
      ]),
      jurisdictionCode: z.string(),
      registeredAddress: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string().optional(),
        postalCode: z.string(),
        country: z.string()
      }).optional(),
      directors: z.array(z.object({
        name: z.string(),
        nationality: z.string(),
        residency: z.string(),
        appointmentDate: z.string()
      })).optional(),
      shareholders: z.array(z.object({
        name: z.string(),
        ownershipPercent: z.number(),
        entityType: z.enum(["individual", "corporate"])
      })).optional(),
      parentEntityId: z.string().optional()
    }))
    .mutation(({ input }) => {
      return intlOps.createInternationalEntity(
        input.name,
        input.entityType,
        input.jurisdictionCode,
        {
          registeredAddress: input.registeredAddress,
          directors: input.directors,
          shareholders: input.shareholders,
          parentEntityId: input.parentEntityId
        }
      );
    }),

  // Get compliance requirements
  getComplianceRequirements: publicProcedure
    .input(z.object({
      entity: z.object({
        id: z.string(),
        name: z.string(),
        entityType: z.string(),
        jurisdictionCode: z.string(),
        status: z.string(),
        taxResidency: z.array(z.string()),
        reportingObligations: z.array(z.string()),
        registeredAddress: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string().optional(),
          postalCode: z.string(),
          country: z.string()
        }),
        directors: z.array(z.any()),
        annualFilingDates: z.array(z.any()),
        createdAt: z.string(),
        updatedAt: z.string()
      }),
      usPersonInvolved: z.boolean().optional()
    }))
    .query(({ input }) => {
      return intlOps.getComplianceRequirements(
        input.entity as intlOps.InternationalEntity,
        input.usPersonInvolved
      );
    }),

  // Create FATCA report
  createFATCAReport: protectedProcedure
    .input(z.object({
      reportingEntityId: z.string(),
      reportingEntityName: z.string(),
      giin: z.string(),
      reportingYear: z.number()
    }))
    .mutation(({ input }) => {
      return intlOps.createFATCAReport(
        input.reportingEntityId,
        input.reportingEntityName,
        input.giin,
        input.reportingYear
      );
    }),

  // Create CRS report
  createCRSReport: protectedProcedure
    .input(z.object({
      reportingEntityId: z.string(),
      reportingJurisdiction: z.string(),
      receivingJurisdictions: z.array(z.string()),
      reportingYear: z.number()
    }))
    .mutation(({ input }) => {
      return intlOps.createCRSReport(
        input.reportingEntityId,
        input.reportingJurisdiction,
        input.receivingJurisdictions,
        input.reportingYear
      );
    }),

  // Create FBAR report
  createFBARReport: protectedProcedure
    .input(z.object({
      filerName: z.string(),
      filerTin: z.string(),
      filerAddress: z.string(),
      reportingYear: z.number()
    }))
    .mutation(({ input }) => {
      return intlOps.createFBARReport(
        input.filerName,
        input.filerTin,
        input.filerAddress,
        input.reportingYear
      );
    }),

  // Check if FBAR required
  isFBARRequired: publicProcedure
    .input(z.object({ aggregateMaxValue: z.number() }))
    .query(({ input }) => {
      return intlOps.isFBARRequired(input.aggregateMaxValue);
    }),

  // Generate compliance calendar
  generateComplianceCalendar: publicProcedure
    .input(z.object({
      entity: z.object({
        id: z.string(),
        name: z.string(),
        entityType: z.string(),
        jurisdictionCode: z.string(),
        annualFilingDates: z.array(z.object({
          filingType: z.string(),
          dueDate: z.string(),
          jurisdiction: z.string()
        }))
      }),
      year: z.number()
    }))
    .query(({ input }) => {
      return intlOps.generateComplianceCalendar(
        input.entity as intlOps.InternationalEntity,
        input.year
      );
    }),

  // Validate entity compliance
  validateEntityCompliance: publicProcedure
    .input(z.object({
      entity: z.object({
        id: z.string(),
        name: z.string(),
        entityType: z.string(),
        jurisdictionCode: z.string(),
        status: z.string(),
        registrationNumber: z.string().optional(),
        registeredAddress: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string().optional(),
          postalCode: z.string(),
          country: z.string()
        }),
        directors: z.array(z.object({
          name: z.string(),
          nationality: z.string(),
          residency: z.string(),
          appointmentDate: z.string()
        })),
        annualFilingDates: z.array(z.object({
          filingType: z.string(),
          dueDate: z.string(),
          jurisdiction: z.string()
        }))
      })
    }))
    .query(({ input }) => {
      return intlOps.validateEntityCompliance(input.entity as intlOps.InternationalEntity);
    }),

  // Get formation requirements
  getFormationRequirements: publicProcedure
    .input(z.object({
      entityType: z.enum([
        "uk_ltd", "uk_plc", "eu_gmbh", "eu_sarl", "eu_bv", "eu_ag",
        "offshore_nevis", "offshore_cook", "offshore_cayman", "offshore_bvi",
        "canada_corp", "australia_pty", "singapore_pte", "hong_kong_ltd",
        "ireland_ltd", "panama_sa", "foreign_charity", "foreign_trust"
      ]),
      jurisdictionCode: z.string()
    }))
    .query(({ input }) => {
      return intlOps.getFormationRequirements(input.entityType, input.jurisdictionCode);
    })
});
