/**
 * Real Property System Router
 * 
 * API endpoints for property management, donations, assignments, and agreements
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import * as realProperty from "../services/real-property";

export const realPropertyRouter = router({
  // ============================================================================
  // Constants
  // ============================================================================
  
  getPropertyTypes: publicProcedure.query(() => {
    return realProperty.PROPERTY_TYPES;
  }),
  
  getDonationTypes: publicProcedure.query(() => {
    return realProperty.DONATION_TYPES;
  }),
  
  getAgreementTypes: publicProcedure.query(() => {
    return realProperty.AGREEMENT_TYPES;
  }),
  
  getImprovementTypes: publicProcedure.query(() => {
    return realProperty.IMPROVEMENT_TYPES;
  }),
  
  // ============================================================================
  // Property Assets
  // ============================================================================
  
  createProperty: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(["land", "residential", "commercial", "industrial", "agricultural", "mixed_use"]),
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        county: z.string(),
        parcelNumber: z.string().optional(),
      }),
      acreage: z.number().positive(),
      acquisitionValue: z.number().positive(),
      acquisitionMethod: z.enum(["purchase", "donation", "grant", "inheritance"]),
      description: z.string(),
      zoning: z.string(),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
      squareFootage: z.number().optional(),
      features: z.array(z.string()).optional(),
      restrictions: z.array(z.string()).optional(),
      donationId: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return realProperty.createPropertyAsset(
        input.name,
        input.type,
        input.address,
        input.acreage,
        input.acquisitionValue,
        input.acquisitionMethod,
        input.description,
        input.zoning,
        {
          coordinates: input.coordinates,
          squareFootage: input.squareFootage,
          features: input.features,
          restrictions: input.restrictions,
          donationId: input.donationId,
        }
      );
    }),
  
  updateAppraisal: protectedProcedure
    .input(z.object({
      property: z.any(), // PropertyAsset
      newValue: z.number().positive(),
      appraisalDate: z.date().optional(),
    }))
    .mutation(({ input }) => {
      return realProperty.updatePropertyAppraisal(
        input.property,
        input.newValue,
        input.appraisalDate
      );
    }),
  
  assignToHouse: protectedProcedure
    .input(z.object({
      property: z.any(), // PropertyAsset
      houseId: z.string(),
    }))
    .mutation(({ input }) => {
      return realProperty.assignPropertyToHouse(input.property, input.houseId);
    }),
  
  unassignFromHouse: protectedProcedure
    .input(z.object({
      property: z.any(), // PropertyAsset
    }))
    .mutation(({ input }) => {
      return realProperty.unassignPropertyFromHouse(input.property);
    }),
  
  // ============================================================================
  // Property Donations
  // ============================================================================
  
  createDonation: publicProcedure
    .input(z.object({
      donorName: z.string().min(1),
      donorEmail: z.string().email(),
      donorPhone: z.string(),
      donorAddress: z.string(),
      propertyAddress: z.string(),
      propertyType: z.enum(["land", "residential", "commercial", "industrial", "agricultural", "mixed_use"]),
      estimatedValue: z.number().positive(),
      acreage: z.number().positive(),
      description: z.string(),
      donationType: z.enum(["outright", "bargain_sale", "remainder_interest", "conservation_easement", "charitable_remainder_trust"]),
    }))
    .mutation(({ input }) => {
      return realProperty.createPropertyDonation(
        input.donorName,
        input.donorEmail,
        input.donorPhone,
        input.donorAddress,
        input.propertyAddress,
        input.propertyType,
        input.estimatedValue,
        input.acreage,
        input.description,
        input.donationType
      );
    }),
  
  updateDonationStatus: protectedProcedure
    .input(z.object({
      donation: z.any(), // PropertyDonation
      status: z.enum(["inquiry", "evaluation", "due_diligence", "negotiation", "accepted", "declined", "completed"]),
      declineReason: z.string().optional(),
      appraisalValue: z.number().optional(),
      appraisalDate: z.date().optional(),
      appraiserName: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return realProperty.updateDonationStatus(
        input.donation,
        input.status,
        {
          declineReason: input.declineReason,
          appraisalValue: input.appraisalValue,
          appraisalDate: input.appraisalDate,
          appraiserName: input.appraiserName,
        }
      );
    }),
  
  completeDueDiligence: protectedProcedure
    .input(z.object({
      donation: z.any(), // PropertyDonation
      field: z.enum(["titleSearchComplete", "environmentalReviewComplete", "surveyComplete", "legalReviewComplete"]),
    }))
    .mutation(({ input }) => {
      return realProperty.completeDueDiligence(input.donation, input.field);
    }),
  
  checkDueDiligenceComplete: publicProcedure
    .input(z.object({
      donation: z.any(), // PropertyDonation
    }))
    .query(({ input }) => {
      return realProperty.isDueDiligenceComplete(input.donation);
    }),
  
  calculateTaxDeduction: publicProcedure
    .input(z.object({
      donation: z.any(), // PropertyDonation
    }))
    .query(({ input }) => {
      return realProperty.calculateTaxDeduction(input.donation);
    }),
  
  // ============================================================================
  // House Assignments
  // ============================================================================
  
  createAssignment: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      houseId: z.string(),
      houseName: z.string(),
      assignmentType: z.enum(["primary", "secondary", "shared"]),
      monthlyFee: z.number().min(0),
      securityDeposit: z.number().min(0),
      endDate: z.date().optional(),
      allowedUses: z.array(z.string()).optional(),
      restrictions: z.array(z.string()).optional(),
      exitNoticeRequired: z.number().optional(),
      exitPenalty: z.number().optional(),
    }))
    .mutation(({ input }) => {
      return realProperty.createHouseAssignment(
        input.propertyId,
        input.houseId,
        input.houseName,
        input.assignmentType,
        input.monthlyFee,
        input.securityDeposit,
        {
          endDate: input.endDate,
          allowedUses: input.allowedUses,
          restrictions: input.restrictions,
          exitNoticeRequired: input.exitNoticeRequired,
          exitPenalty: input.exitPenalty,
        }
      );
    }),
  
  terminateAssignment: protectedProcedure
    .input(z.object({
      assignment: z.any(), // HousePropertyAssignment
      reason: z.enum(["voluntary", "involuntary", "expired"]),
    }))
    .mutation(({ input }) => {
      return realProperty.terminateAssignment(input.assignment, input.reason);
    }),
  
  // ============================================================================
  // Usage Agreements
  // ============================================================================
  
  createAgreement: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      houseId: z.string(),
      agreementType: z.enum(["ground_lease", "usage_agreement", "development_agreement", "maintenance_agreement", "shared_use_agreement"]),
      title: z.string(),
      startDate: z.date(),
      termYears: z.number().positive(),
      monthlyPayment: z.number().min(0),
      annualEscalation: z.number().optional(),
      securityDeposit: z.number().optional(),
      renewalOptions: z.number().optional(),
      autoRenewal: z.boolean().optional(),
      allowedUses: z.array(z.string()).optional(),
      prohibitedUses: z.array(z.string()).optional(),
      improvementRights: z.boolean().optional(),
      sublettingAllowed: z.boolean().optional(),
    }))
    .mutation(({ input }) => {
      return realProperty.createUsageAgreement(
        input.propertyId,
        input.houseId,
        input.agreementType,
        input.title,
        input.startDate,
        input.termYears,
        input.monthlyPayment,
        {
          annualEscalation: input.annualEscalation,
          securityDeposit: input.securityDeposit,
          renewalOptions: input.renewalOptions,
          autoRenewal: input.autoRenewal,
          allowedUses: input.allowedUses,
          prohibitedUses: input.prohibitedUses,
          improvementRights: input.improvementRights,
          sublettingAllowed: input.sublettingAllowed,
        }
      );
    }),
  
  activateAgreement: protectedProcedure
    .input(z.object({
      agreement: z.any(), // PropertyUsageAgreement
    }))
    .mutation(({ input }) => {
      return realProperty.activateAgreement(input.agreement);
    }),
  
  renewAgreement: protectedProcedure
    .input(z.object({
      agreement: z.any(), // PropertyUsageAgreement
      additionalYears: z.number().positive(),
    }))
    .mutation(({ input }) => {
      return realProperty.renewAgreement(input.agreement, input.additionalYears);
    }),
  
  generateGroundLease: protectedProcedure
    .input(z.object({
      agreement: z.any(), // PropertyUsageAgreement
      property: z.any(), // PropertyAsset
      houseName: z.string(),
    }))
    .query(({ input }) => {
      return realProperty.generateGroundLeaseDocument(
        input.agreement,
        input.property,
        input.houseName
      );
    }),
  
  // ============================================================================
  // Improvements
  // ============================================================================
  
  createImprovement: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      houseId: z.string().optional(),
      type: z.enum(["construction", "renovation", "landscaping", "infrastructure", "environmental", "accessibility", "maintenance"]),
      title: z.string(),
      description: z.string(),
      estimatedCost: z.number().positive(),
      fundingSource: z.enum(["house", "trust", "grant", "shared"]),
      proposedStartDate: z.date(),
      proposedEndDate: z.date(),
    }))
    .mutation(({ input }) => {
      return realProperty.createImprovement(
        input.propertyId,
        input.houseId,
        input.type,
        input.title,
        input.description,
        input.estimatedCost,
        input.fundingSource,
        input.proposedStartDate,
        input.proposedEndDate
      );
    }),
  
  approveImprovement: protectedProcedure
    .input(z.object({
      improvement: z.any(), // PropertyImprovement
      approvedBy: z.string(),
    }))
    .mutation(({ input }) => {
      return realProperty.approveImprovement(input.improvement, input.approvedBy);
    }),
  
  rejectImprovement: protectedProcedure
    .input(z.object({
      improvement: z.any(), // PropertyImprovement
      reason: z.string(),
    }))
    .mutation(({ input }) => {
      return realProperty.rejectImprovement(input.improvement, input.reason);
    }),
  
  startImprovement: protectedProcedure
    .input(z.object({
      improvement: z.any(), // PropertyImprovement
    }))
    .mutation(({ input }) => {
      return realProperty.startImprovement(input.improvement);
    }),
  
  completeImprovement: protectedProcedure
    .input(z.object({
      improvement: z.any(), // PropertyImprovement
      actualCost: z.number().positive(),
    }))
    .mutation(({ input }) => {
      return realProperty.completeImprovement(input.improvement, input.actualCost);
    }),
  
  calculateImprovementCredits: publicProcedure
    .input(z.object({
      improvements: z.array(z.any()), // PropertyImprovement[]
      houseId: z.string(),
    }))
    .query(({ input }) => {
      return realProperty.calculateTotalImprovementCredits(input.improvements, input.houseId);
    }),
  
  // ============================================================================
  // Property Council
  // ============================================================================
  
  createDecision: protectedProcedure
    .input(z.object({
      decisionType: z.enum(["property_acquisition", "property_disposition", "house_assignment", "improvement_approval", "lease_approval", "policy_change", "budget_allocation"]),
      title: z.string(),
      description: z.string(),
      meetingDate: z.date(),
      propertyId: z.string().optional(),
      houseId: z.string().optional(),
      improvementId: z.string().optional(),
      agreementId: z.string().optional(),
      implementationDeadline: z.date().optional(),
    }))
    .mutation(({ input }) => {
      return realProperty.createCouncilDecision(
        input.decisionType,
        input.title,
        input.description,
        input.meetingDate,
        {
          propertyId: input.propertyId,
          houseId: input.houseId,
          improvementId: input.improvementId,
          agreementId: input.agreementId,
          implementationDeadline: input.implementationDeadline,
        }
      );
    }),
  
  recordVote: protectedProcedure
    .input(z.object({
      decision: z.any(), // PropertyCouncilDecision
      votesFor: z.number().min(0),
      votesAgainst: z.number().min(0),
      votesAbstain: z.number().min(0),
      totalMembers: z.number().positive(),
      quorumThreshold: z.number().optional(),
      approvalThreshold: z.number().optional(),
    }))
    .mutation(({ input }) => {
      return realProperty.recordVote(
        input.decision,
        input.votesFor,
        input.votesAgainst,
        input.votesAbstain,
        input.totalMembers,
        input.quorumThreshold,
        input.approvalThreshold
      );
    }),
  
  implementDecision: protectedProcedure
    .input(z.object({
      decision: z.any(), // PropertyCouncilDecision
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return realProperty.implementDecision(input.decision, input.notes);
    }),
  
  // ============================================================================
  // Exit Provisions
  // ============================================================================
  
  calculateExitProvisions: protectedProcedure
    .input(z.object({
      assignment: z.any(), // HousePropertyAssignment
      improvements: z.array(z.any()), // PropertyImprovement[]
      outstandingFees: z.number().min(0),
      damageAssessment: z.number().min(0),
      isEarlyTermination: z.boolean(),
    }))
    .query(({ input }) => {
      return realProperty.calculateExitProvisions(
        input.assignment,
        input.improvements,
        input.outstandingFees,
        input.damageAssessment,
        input.isEarlyTermination
      );
    }),
  
  // ============================================================================
  // Fund Accounts
  // ============================================================================
  
  createFundAccount: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.enum(["operating", "reserve", "improvement", "acquisition"]),
      initialBalance: z.number().optional(),
      restricted: z.boolean().optional(),
      restrictionDetails: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return realProperty.createPropertyFundAccount(
        input.name,
        input.type,
        input.initialBalance,
        input.restricted,
        input.restrictionDetails
      );
    }),
  
  updateFundBalance: protectedProcedure
    .input(z.object({
      account: z.any(), // PropertyFundAccount
      amount: z.number(),
    }))
    .mutation(({ input }) => {
      return realProperty.updateFundBalance(input.account, input.amount);
    }),
  
  // ============================================================================
  // Reporting
  // ============================================================================
  
  getPortfolioSummary: protectedProcedure
    .input(z.object({
      properties: z.array(z.any()), // PropertyAsset[]
    }))
    .query(({ input }) => {
      return realProperty.generatePortfolioSummary(input.properties);
    }),
  
  getDonationPipelineSummary: protectedProcedure
    .input(z.object({
      donations: z.array(z.any()), // PropertyDonation[]
    }))
    .query(({ input }) => {
      return realProperty.generateDonationPipelineSummary(input.donations);
    }),
});
