/**
 * Member Registration Router
 * 
 * API endpoints for member business registration
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  BUSINESS_TYPES,
  INDUSTRY_CATEGORIES,
  MEMBERSHIP_TIERS,
  REGISTRATION_STATUSES,
  validateRegistration,
  createRegistration,
  reviewRegistration,
  getMembershipTier,
  calculateMembershipFee,
  generateMembershipAgreement,
  generateTermsAndConditions,
  getStatusLabel,
  getStatusColor,
  filterRegistrations,
  calculateRegistrationStats,
  BusinessRegistration,
  CreateRegistrationInput,
  RegistrationStatus,
} from "../services/member-registration";

// In-memory storage for demo (replace with database in production)
const registrations: Map<string, BusinessRegistration> = new Map();

// Zod schemas
const addressSchema = z.object({
  street1: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(5),
  country: z.string().default("USA"),
});

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  title: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(10),
  preferredContact: z.enum(["email", "phone"]),
});

const registrationInputSchema = z.object({
  businessName: z.string().min(1),
  dbaName: z.string().optional(),
  businessType: z.enum(BUSINESS_TYPES.map(t => t.value) as [string, ...string[]]),
  industryCategory: z.enum(INDUSTRY_CATEGORIES.map(c => c.value) as [string, ...string[]]),
  einNumber: z.string().optional(),
  stateOfFormation: z.string().min(2),
  dateOfFormation: z.string(),
  businessAddress: addressSchema,
  mailingAddress: addressSchema.optional(),
  primaryContact: contactSchema,
  alternateContact: contactSchema.optional(),
  numberOfEmployees: z.number().min(0),
  annualRevenue: z.string().optional(),
  businessDescription: z.string().min(10),
  productsServices: z.string().min(10),
  targetMarket: z.string().optional().default(""),
  sponsoringHouseId: z.string().optional(),
  membershipTier: z.enum(MEMBERSHIP_TIERS.map(t => t.value) as [string, ...string[]]),
  referralSource: z.string().optional(),
  agreedToTerms: z.boolean(),
  agreedToMembershipAgreement: z.boolean(),
});

export const memberRegistrationRouter = router({
  // Get available options for form dropdowns
  getOptions: publicProcedure.query(() => {
    return {
      businessTypes: BUSINESS_TYPES,
      industryCategories: INDUSTRY_CATEGORIES,
      membershipTiers: MEMBERSHIP_TIERS,
      statuses: REGISTRATION_STATUSES,
    };
  }),

  // Get membership tier details
  getMembershipTier: publicProcedure
    .input(z.object({ tier: z.string() }))
    .query(({ input }) => {
      return getMembershipTier(input.tier as any);
    }),

  // Calculate membership fee
  calculateFee: publicProcedure
    .input(z.object({ tier: z.string() }))
    .query(({ input }) => {
      return {
        tier: input.tier,
        fee: calculateMembershipFee(input.tier as any),
      };
    }),

  // Get terms and conditions
  getTermsAndConditions: publicProcedure.query(() => {
    return generateTermsAndConditions();
  }),

  // Get membership agreement preview
  getMembershipAgreement: publicProcedure
    .input(z.object({
      businessName: z.string(),
      tier: z.string(),
    }))
    .query(({ input }) => {
      return generateMembershipAgreement(input.businessName, input.tier as any);
    }),

  // Submit registration application (public)
  submitApplication: publicProcedure
    .input(registrationInputSchema)
    .mutation(({ input }) => {
      // Validate input
      const errors = validateRegistration(input as CreateRegistrationInput);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => e.message).join(", ")}`);
      }

      // Check agreements
      if (!input.agreedToTerms || !input.agreedToMembershipAgreement) {
        throw new Error("You must agree to the terms and membership agreement");
      }

      // Create registration
      const registration = createRegistration(
        input as CreateRegistrationInput,
        input.agreedToTerms,
        input.agreedToMembershipAgreement
      );

      // Store registration
      registrations.set(registration.id, registration);

      return {
        success: true,
        applicationId: registration.id,
        status: registration.status,
        message: "Your application has been submitted successfully. You will receive an email confirmation shortly.",
      };
    }),

  // Check application status (public with application ID)
  checkStatus: publicProcedure
    .input(z.object({
      applicationId: z.string(),
      email: z.string().email(),
    }))
    .query(({ input }) => {
      const registration = registrations.get(input.applicationId);
      
      if (!registration) {
        throw new Error("Application not found");
      }

      // Verify email matches
      if (registration.primaryContact.email.toLowerCase() !== input.email.toLowerCase()) {
        throw new Error("Email does not match application");
      }

      return {
        applicationId: registration.id,
        businessName: registration.businessName,
        status: registration.status,
        statusLabel: getStatusLabel(registration.status),
        submittedAt: registration.submittedAt,
        reviewedAt: registration.reviewedAt,
        approvedAt: registration.approvedAt,
        rejectedReason: registration.rejectedReason,
      };
    }),

  // Admin: List all registrations
  listRegistrations: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      businessType: z.string().optional(),
      industryCategory: z.string().optional(),
      membershipTier: z.string().optional(),
      searchTerm: z.string().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(({ input }) => {
      const allRegistrations = Array.from(registrations.values());
      
      const filtered = filterRegistrations(allRegistrations, {
        status: input.status as RegistrationStatus | undefined,
        businessType: input.businessType as any,
        industryCategory: input.industryCategory as any,
        membershipTier: input.membershipTier as any,
        searchTerm: input.searchTerm,
      });

      // Sort by submission date (newest first)
      filtered.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

      // Paginate
      const start = (input.page - 1) * input.pageSize;
      const paginated = filtered.slice(start, start + input.pageSize);

      return {
        registrations: paginated,
        total: filtered.length,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(filtered.length / input.pageSize),
      };
    }),

  // Admin: Get registration details
  getRegistration: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const registration = registrations.get(input.id);
      if (!registration) {
        throw new Error("Registration not found");
      }
      return registration;
    }),

  // Admin: Review registration
  reviewRegistration: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["approved", "rejected", "under_review"]),
      notes: z.string().optional(),
      rejectedReason: z.string().optional(),
    }))
    .mutation(({ input, ctx }) => {
      const registration = registrations.get(input.id);
      if (!registration) {
        throw new Error("Registration not found");
      }

      const reviewed = reviewRegistration(registration, {
        status: input.status,
        reviewerId: ctx.user.id.toString(),
        reviewerName: ctx.user.name,
        notes: input.notes,
        rejectedReason: input.rejectedReason,
      });

      registrations.set(input.id, reviewed);

      return {
        success: true,
        registration: reviewed,
        message: `Registration ${input.status === "approved" ? "approved" : input.status === "rejected" ? "rejected" : "marked for review"}`,
      };
    }),

  // Admin: Get statistics
  getStats: protectedProcedure.query(() => {
    const allRegistrations = Array.from(registrations.values());
    return calculateRegistrationStats(allRegistrations);
  }),

  // Admin: Export registrations
  exportRegistrations: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      format: z.enum(["json", "csv"]).default("json"),
    }))
    .query(({ input }) => {
      const allRegistrations = Array.from(registrations.values());
      const filtered = input.status
        ? allRegistrations.filter(r => r.status === input.status)
        : allRegistrations;

      if (input.format === "csv") {
        const headers = [
          "Application ID",
          "Business Name",
          "Business Type",
          "Industry",
          "Membership Tier",
          "Status",
          "Contact Name",
          "Contact Email",
          "Submitted Date",
        ];

        const rows = filtered.map(r => [
          r.id,
          r.businessName,
          r.businessType,
          r.industryCategory,
          r.membershipTier,
          r.status,
          `${r.primaryContact.firstName} ${r.primaryContact.lastName}`,
          r.primaryContact.email,
          r.submittedAt.toISOString(),
        ]);

        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        return { format: "csv", data: csv };
      }

      return { format: "json", data: filtered };
    }),
});
