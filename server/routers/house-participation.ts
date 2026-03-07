import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

/**
 * House Participation Router
 * Manages the integration between businesses and the House system
 * 
 * Key concepts:
 * - Opted-In (Locked House): Full House management features, under trust governance
 * - Opted-Out (Unlocked House): Recorded on LuvLedger but operates independently
 * - All businesses are recorded on LuvLedger regardless of participation status
 */
export const houseParticipationRouter = router({
  /**
   * Get participation status for a business entity
   */
  getStatus: protectedProcedure
    .input(z.object({
      businessId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      // In production, fetch from database
      // For now, return mock data
      return {
        businessId: input.businessId,
        businessName: "Sample Business",
        participationStatus: "pending" as "pending" | "opted_in" | "opted_out",
        linkedHouseId: null as number | null,
        houseActivatedAt: null as Date | null,
        luvLedgerRecorded: true, // Always true - all businesses are on LuvLedger
        luvLedgerHash: "0x" + Math.random().toString(16).slice(2, 18),
      };
    }),

  /**
   * Get all businesses for the current user with their participation status
   */
  listUserBusinesses: protectedProcedure
    .query(async ({ ctx }) => {
      // In production, fetch from database
      // For now, return mock data
      return [
        {
          id: 1,
          name: "The The The L.A.W.S. Collective, LLC",
          entityType: "llc",
          participationStatus: "opted_in" as const,
          linkedHouseId: 1,
          luvLedgerRecorded: true,
        },
        {
          id: 2,
          name: "Real-Eye-Nation LLC",
          entityType: "llc",
          participationStatus: "pending" as const,
          linkedHouseId: null,
          luvLedgerRecorded: true,
        },
        {
          id: 3,
          name: "L.A.W.S. Academy",
          entityType: "508c1a",
          participationStatus: "opted_out" as const,
          linkedHouseId: null,
          luvLedgerRecorded: true,
        },
      ];
    }),

  /**
   * Opt-in a business to become a Locked House
   * Creates a new House entry and links it to the business
   */
  optIn: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      houseName: z.string().optional(), // Optional custom house name
      trustType: z.enum(["living", "revocable", "irrevocable", "dynasty"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In production:
      // 1. Verify business belongs to user
      // 2. Create a new House entry
      // 3. Create House Ledger entry
      // 4. Link business to house
      // 5. Update business participation status
      // 6. Record on LuvLedger blockchain (if not already)
      
      const newHouseId = Math.floor(Math.random() * 1000) + 100;
      
      return {
        success: true,
        businessId: input.businessId,
        newStatus: "opted_in" as const,
        linkedHouseId: newHouseId,
        houseName: input.houseName || "House of " + input.businessId,
        activatedAt: new Date(),
        message: "Business successfully activated as a Locked House",
        features: [
          "Trust Governance",
          "60/40 Distribution Framework",
          "Heir Designations",
          "Token Economy Access",
          "House Ledger",
          "Collective Benefits",
        ],
      };
    }),

  /**
   * Opt-out a business to operate independently (Unlocked House)
   * Business remains on LuvLedger but without House management features
   */
  optOut: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In production:
      // 1. Verify business belongs to user
      // 2. Update business participation status to opted_out
      // 3. Store opt-out reason
      // 4. Business remains on LuvLedger for analytics
      
      return {
        success: true,
        businessId: input.businessId,
        newStatus: "opted_out" as const,
        reason: input.reason,
        message: "Business set to operate independently. You can opt-in at any time.",
        retainedFeatures: [
          "LuvLedger Blockchain Recording",
          "Analytics & Reporting",
          "Record Management",
          "Platform Tools Access",
        ],
      };
    }),

  /**
   * Get House benefits comparison (for decision-making UI)
   */
  getBenefitsComparison: protectedProcedure
    .query(async () => {
      return {
        lockedHouse: {
          title: "Locked House (Opted-In)",
          description: "Full participation in the LuvOnPurpose Autonomous Wealth System",
          benefits: [
            { name: "Trust Governance", description: "Protected under LuvOnPurpose Academy and Outreach Trust structure", included: true },
            { name: "60/40 Distribution", description: "Participate in collective wealth building", included: true },
            { name: "70/30 Inheritance", description: "Generational wealth transfer framework", included: true },
            { name: "Heir Designations", description: "Set up beneficiaries and succession", included: true },
            { name: "Token Economy", description: "Access MIRROR, GIFT, SPARK, HOUSE tokens", included: true },
            { name: "House Ledger", description: "Dedicated LuvLedger for your House", included: true },
            { name: "Collective Benefits", description: "Shared resources and community support", included: true },
            { name: "LuvLedger Recording", description: "Immutable blockchain record", included: true },
            { name: "Analytics & Reporting", description: "Business intelligence tools", included: true },
          ],
        },
        unlockedHouse: {
          title: "Unlocked House (Opted-Out)",
          description: "Independent operation with blockchain recording",
          benefits: [
            { name: "Trust Governance", description: "Protected under LuvOnPurpose Academy and Outreach Trust structure", included: false },
            { name: "60/40 Distribution", description: "Participate in collective wealth building", included: false },
            { name: "70/30 Inheritance", description: "Generational wealth transfer framework", included: false },
            { name: "Heir Designations", description: "Set up beneficiaries and succession", included: false },
            { name: "Token Economy", description: "Access MIRROR, GIFT, SPARK, HOUSE tokens", included: false },
            { name: "House Ledger", description: "Dedicated LuvLedger for your House", included: false },
            { name: "Collective Benefits", description: "Shared resources and community support", included: false },
            { name: "LuvLedger Recording", description: "Immutable blockchain record", included: true },
            { name: "Analytics & Reporting", description: "Business intelligence tools", included: true },
          ],
        },
        canOptInLater: true,
        optInMessage: "You can opt-in at any time to unlock full House capabilities.",
      };
    }),

  /**
   * Get House activation requirements
   */
  getActivationRequirements: protectedProcedure
    .input(z.object({
      businessId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      return {
        businessId: input.businessId,
        requirements: [
          { id: 1, name: "Business Entity Formed", completed: true, required: true },
          { id: 2, name: "EIN Obtained", completed: false, required: true },
          { id: 3, name: "Operating Agreement", completed: true, required: true },
          { id: 4, name: "Bank Account Setup", completed: false, required: false },
          { id: 5, name: "Foundation Training", completed: false, required: false },
        ],
        canActivate: true, // Based on required items
        recommendedNext: "Complete EIN application for full activation",
      };
    }),
});

export type HouseParticipationRouter = typeof houseParticipationRouter;
