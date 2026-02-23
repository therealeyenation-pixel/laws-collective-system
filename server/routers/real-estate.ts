import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  realEstateProperties,
  propertyAcquisitions,
  propertyValuations,
  propertyExpenses,
  propertyIncome,
  realEstateAgents,
  restorationCases,
  houses,
  luvLedgerTransactions,
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// REAL ESTATE SIMULATOR DATA
// Training scenarios for property investment
// ============================================

const REAL_ESTATE_SCENARIOS = [
  {
    id: "first_rental",
    name: "First Rental Property",
    description: "Learn the basics of purchasing and managing a rental property",
    difficulty: "beginner",
    objectives: [
      "Understand property valuation",
      "Calculate cash flow and ROI",
      "Learn about tenant screening",
      "Manage maintenance and repairs",
    ],
    initialCapital: 50000,
    targetROI: 8,
    timeframeMonths: 12,
  },
  {
    id: "fix_and_flip",
    name: "Fix and Flip",
    description: "Buy a distressed property, renovate, and sell for profit",
    difficulty: "intermediate",
    objectives: [
      "Identify undervalued properties",
      "Estimate renovation costs",
      "Manage contractors",
      "Time the market for sale",
    ],
    initialCapital: 100000,
    targetROI: 20,
    timeframeMonths: 6,
  },
  {
    id: "land_development",
    name: "Land Development",
    description: "Purchase raw land and develop for residential or commercial use",
    difficulty: "advanced",
    objectives: [
      "Evaluate land potential",
      "Navigate zoning and permits",
      "Manage development costs",
      "Market finished lots or buildings",
    ],
    initialCapital: 250000,
    targetROI: 30,
    timeframeMonths: 24,
  },
  {
    id: "ancestral_restoration",
    name: "Ancestral Land Restoration",
    description: "Research and reclaim family land through legal channels",
    difficulty: "advanced",
    objectives: [
      "Research property history",
      "Gather documentation",
      "File restoration claims",
      "Navigate legal process",
    ],
    initialCapital: 25000,
    targetROI: 0, // Value is in restoration, not ROI
    timeframeMonths: 36,
  },
  {
    id: "multi_family",
    name: "Multi-Family Investment",
    description: "Acquire and manage a multi-unit residential property",
    difficulty: "intermediate",
    objectives: [
      "Analyze multi-family financials",
      "Manage multiple tenants",
      "Optimize occupancy rates",
      "Scale property management",
    ],
    initialCapital: 150000,
    targetROI: 12,
    timeframeMonths: 12,
  },
];

const PROPERTY_TYPES = [
  { value: "land", label: "Raw Land", icon: "🏞️" },
  { value: "residential", label: "Residential", icon: "🏠" },
  { value: "commercial", label: "Commercial", icon: "🏢" },
  { value: "industrial", label: "Industrial", icon: "🏭" },
  { value: "agricultural", label: "Agricultural", icon: "🌾" },
  { value: "mixed_use", label: "Mixed Use", icon: "🏬" },
  { value: "vacant_lot", label: "Vacant Lot", icon: "📍" },
  { value: "ancestral", label: "Ancestral Property", icon: "🏛️" },
  { value: "restoration", label: "Restoration Claim", icon: "⚖️" },
];

export const realEstateRouter = router({
  // ============================================
  // PROPERTY MANAGEMENT
  // ============================================

  getProperties: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const userId = ctx.user.id;

    // Get user's house
    const userHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.ownerUserId, userId))
      .limit(1);

    if (!userHouse.length) {
      return { properties: [], summary: null };
    }

    const properties = await db
      .select()
      .from(realEstateProperties)
      .where(eq(realEstateProperties.houseId, userHouse[0].id))
      .orderBy(desc(realEstateProperties.createdAt));

    // Calculate summary
    const totalValue = properties.reduce(
      (sum, p) => sum + Number(p.currentMarketValue || p.purchasePrice || 0),
      0
    );
    const totalProperties = properties.length;
    const restorationProperties = properties.filter(p => p.isRestorationProperty).length;

    return {
      properties,
      summary: {
        totalProperties,
        totalValue,
        restorationProperties,
        byType: PROPERTY_TYPES.map(type => ({
          ...type,
          count: properties.filter(p => p.propertyType === type.value).length,
        })),
      },
    };
  }),

  getProperty: protectedProcedure
    .input(z.object({ propertyId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const property = await db
        .select()
        .from(realEstateProperties)
        .where(
          and(
            eq(realEstateProperties.id, input.propertyId),
            eq(realEstateProperties.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!property.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }

      // Get related data
      const [valuations, expenses, income, acquisitions] = await Promise.all([
        db
          .select()
          .from(propertyValuations)
          .where(eq(propertyValuations.propertyId, input.propertyId))
          .orderBy(desc(propertyValuations.valuationDate)),
        db
          .select()
          .from(propertyExpenses)
          .where(eq(propertyExpenses.propertyId, input.propertyId))
          .orderBy(desc(propertyExpenses.expenseDate)),
        db
          .select()
          .from(propertyIncome)
          .where(eq(propertyIncome.propertyId, input.propertyId))
          .orderBy(desc(propertyIncome.incomeDate)),
        db
          .select()
          .from(propertyAcquisitions)
          .where(eq(propertyAcquisitions.propertyId, input.propertyId)),
      ]);

      // Calculate financials
      const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
      const netIncome = totalIncome - totalExpenses;

      return {
        property: property[0],
        valuations,
        expenses,
        income,
        acquisitions,
        financials: {
          totalExpenses,
          totalIncome,
          netIncome,
          roi: property[0].purchasePrice
            ? ((netIncome / Number(property[0].purchasePrice)) * 100).toFixed(2)
            : "0",
        },
      };
    }),

  addProperty: protectedProcedure
    .input(
      z.object({
        propertyName: z.string().min(1),
        propertyType: z.enum([
          "land",
          "residential",
          "commercial",
          "industrial",
          "agricultural",
          "mixed_use",
          "vacant_lot",
          "ancestral",
          "restoration",
        ]),
        streetAddress: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        county: z.string().optional(),
        country: z.string().default("USA"),
        parcelNumber: z.string().optional(),
        legalDescription: z.string().optional(),
        acreage: z.number().optional(),
        squareFeet: z.number().optional(),
        yearBuilt: z.number().optional(),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        purchasePrice: z.number().optional(),
        purchaseDate: z.date().optional(),
        currentMarketValue: z.number().optional(),
        isRestorationProperty: z.boolean().default(false),
        restorationCaseId: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You must activate your House before adding properties",
        });
      }

      // Generate property code
      const propertyCode = `PROP-${userHouse[0].id}-${Date.now().toString(36).toUpperCase()}`;

      const result = await db.insert(realEstateProperties).values({
        houseId: userHouse[0].id,
        userId,
        propertyCode,
        propertyName: input.propertyName,
        propertyType: input.propertyType,
        streetAddress: input.streetAddress,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        county: input.county,
        country: input.country,
        parcelNumber: input.parcelNumber,
        legalDescription: input.legalDescription,
        acreage: input.acreage?.toString(),
        squareFeet: input.squareFeet,
        yearBuilt: input.yearBuilt,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms?.toString(),
        purchasePrice: input.purchasePrice?.toString(),
        purchaseDate: input.purchaseDate,
        currentMarketValue: input.currentMarketValue?.toString(),
        isRestorationProperty: input.isRestorationProperty,
        restorationCaseId: input.restorationCaseId,
        notes: input.notes,
        ownershipStatus: "owned",
      });

      return {
        success: true,
        propertyId: result[0].insertId,
        propertyCode,
      };
    }),

  addExpense: protectedProcedure
    .input(
      z.object({
        propertyId: z.number(),
        expenseType: z.enum([
          "property_tax",
          "insurance",
          "maintenance",
          "repairs",
          "utilities",
          "hoa_fees",
          "management_fees",
          "legal_fees",
          "mortgage_payment",
          "improvements",
          "landscaping",
          "security",
          "other",
        ]),
        description: z.string().min(1),
        amount: z.number().positive(),
        expenseDate: z.date(),
        isRecurring: z.boolean().default(false),
        recurringFrequency: z
          .enum(["monthly", "quarterly", "semi_annual", "annual"])
          .optional(),
        vendorName: z.string().optional(),
        isTaxDeductible: z.boolean().default(false),
        taxCategory: z.string().optional(),
        receiptUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      // Verify property ownership
      const property = await db
        .select()
        .from(realEstateProperties)
        .where(
          and(
            eq(realEstateProperties.id, input.propertyId),
            eq(realEstateProperties.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!property.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }

      // Create expense record
      const result = await db.insert(propertyExpenses).values({
        propertyId: input.propertyId,
        houseId: userHouse[0].id,
        expenseType: input.expenseType,
        description: input.description,
        amount: input.amount.toString(),
        expenseDate: input.expenseDate,
        isRecurring: input.isRecurring,
        recurringFrequency: input.recurringFrequency,
        vendorName: input.vendorName,
        isTaxDeductible: input.isTaxDeductible,
        taxCategory: input.taxCategory,
        receiptUrl: input.receiptUrl,
      });

      // Create LuvLedger transaction for expense
      // Note: LuvLedger transactions require fromAccountId and toAccountId
      // For expenses, we record from house account to external
      // This is a placeholder - full integration requires proper account setup

      return { success: true, expenseId: result[0].insertId };
    }),

  addIncome: protectedProcedure
    .input(
      z.object({
        propertyId: z.number(),
        incomeType: z.enum([
          "rent",
          "lease",
          "sale_proceeds",
          "insurance_claim",
          "tax_refund",
          "security_deposit",
          "late_fees",
          "parking",
          "laundry",
          "other",
        ]),
        description: z.string().min(1),
        amount: z.number().positive(),
        incomeDate: z.date(),
        tenantName: z.string().optional(),
        leaseStartDate: z.date().optional(),
        leaseEndDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      // Verify property ownership
      const property = await db
        .select()
        .from(realEstateProperties)
        .where(
          and(
            eq(realEstateProperties.id, input.propertyId),
            eq(realEstateProperties.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!property.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
      }

      // Create income record
      const result = await db.insert(propertyIncome).values({
        propertyId: input.propertyId,
        houseId: userHouse[0].id,
        incomeType: input.incomeType,
        description: input.description,
        amount: input.amount.toString(),
        incomeDate: input.incomeDate,
        tenantName: input.tenantName,
        leaseStartDate: input.leaseStartDate,
        leaseEndDate: input.leaseEndDate,
      });

      // Create LuvLedger transaction for income
      // Note: LuvLedger transactions require fromAccountId and toAccountId
      // For income, we record from external to house account
      // This is a placeholder - full integration requires proper account setup

      return { success: true, incomeId: result[0].insertId };
    }),

  // ============================================
  // RESTORATION CASES
  // ============================================

  getRestorationCases: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const userId = ctx.user.id;

    const userHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.ownerUserId, userId))
      .limit(1);

    if (!userHouse.length) {
      return { cases: [] };
    }

    const cases = await db
      .select()
      .from(restorationCases)
      .where(eq(restorationCases.houseId, userHouse[0].id))
      .orderBy(desc(restorationCases.createdAt));

    return { cases };
  }),

  createRestorationCase: protectedProcedure
    .input(
      z.object({
        caseName: z.string().min(1),
        claimType: z.enum([
          "ancestral_land",
          "property_theft",
          "deed_fraud",
          "tax_sale_reversal",
          "inheritance_dispute",
          "boundary_dispute",
          "title_clearing",
          "other",
        ]),
        propertyDescription: z.string().optional(),
        originalOwner: z.string().optional(),
        claimantRelationship: z.string().optional(),
        propertyAddress: z.string().optional(),
        county: z.string().optional(),
        state: z.string().optional(),
        parcelNumbers: z.array(z.string()).optional(),
        originalOwnershipDate: z.date().optional(),
        dispossessionDate: z.date().optional(),
        estimatedValue: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "You must activate your House before creating restoration cases",
        });
      }

      // Generate case number
      const caseNumber = `REST-${userHouse[0].id}-${Date.now().toString(36).toUpperCase()}`;

      const result = await db.insert(restorationCases).values({
        houseId: userHouse[0].id,
        userId,
        caseNumber,
        caseName: input.caseName,
        claimType: input.claimType,
        propertyDescription: input.propertyDescription,
        originalOwner: input.originalOwner,
        claimantRelationship: input.claimantRelationship,
        propertyAddress: input.propertyAddress,
        county: input.county,
        state: input.state,
        parcelNumbers: input.parcelNumbers,
        originalOwnershipDate: input.originalOwnershipDate,
        dispossessionDate: input.dispossessionDate,
        estimatedValue: input.estimatedValue?.toString(),
        status: "research",
      });

      return {
        success: true,
        caseId: result[0].insertId,
        caseNumber,
      };
    }),

  // ============================================
  // SIMULATOR
  // ============================================

  getSimulatorScenarios: publicProcedure.query(() => {
    return {
      scenarios: REAL_ESTATE_SCENARIOS,
      propertyTypes: PROPERTY_TYPES,
    };
  }),

  startSimulation: protectedProcedure
    .input(z.object({ scenarioId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const scenario = REAL_ESTATE_SCENARIOS.find(s => s.id === input.scenarioId);
      if (!scenario) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Scenario not found" });
      }

      // Return simulation state
      return {
        success: true,
        simulation: {
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          currentMonth: 1,
          totalMonths: scenario.timeframeMonths,
          capital: scenario.initialCapital,
          properties: [],
          events: [
            {
              month: 1,
              type: "start",
              message: `Welcome to ${scenario.name}! You have $${scenario.initialCapital.toLocaleString()} to invest.`,
            },
          ],
          objectives: scenario.objectives.map(obj => ({
            description: obj,
            completed: false,
          })),
          targetROI: scenario.targetROI,
          currentROI: 0,
        },
      };
    }),

  // ============================================
  // AGENTS
  // ============================================

  getAgents: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const userId = ctx.user.id;

    const userHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.ownerUserId, userId))
      .limit(1);

    if (!userHouse.length) {
      return { agents: [] };
    }

    const agents = await db
      .select()
      .from(realEstateAgents)
      .where(eq(realEstateAgents.houseId, userHouse[0].id))
      .orderBy(desc(realEstateAgents.createdAt));

    return { agents };
  }),

  addAgent: protectedProcedure
    .input(
      z.object({
        agentName: z.string().min(1),
        agentLicense: z.string().optional(),
        brokerageName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        specialization: z
          .enum([
            "residential",
            "commercial",
            "land",
            "investment",
            "luxury",
            "foreclosure",
          ])
          .optional(),
        relationshipType: z.enum([
          "buyers_agent",
          "sellers_agent",
          "dual_agent",
          "referral",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const result = await db.insert(realEstateAgents).values({
        houseId: userHouse[0].id,
        agentName: input.agentName,
        agentLicense: input.agentLicense,
        brokerageName: input.brokerageName,
        email: input.email,
        phone: input.phone,
        specialization: input.specialization,
        relationshipType: input.relationshipType,
        isActive: true,
      });

      return { success: true, agentId: result[0].insertId };
    }),
});

export type RealEstateRouter = typeof realEstateRouter;
