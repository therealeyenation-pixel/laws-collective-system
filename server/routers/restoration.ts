import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  houses,
  restorationCases,
  realEstateProperties,
  luvLedgerAccounts,
  luvLedgerTransactions,
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// RESTORATION CASE MANAGEMENT
// Ancestral land and property restoration claims
// ============================================

const CLAIM_TYPES = [
  { value: "ancestral_land", label: "Ancestral Land Claim", description: "Reclaiming land that belonged to ancestors" },
  { value: "heir_property", label: "Heir Property", description: "Property passed down through generations without clear title" },
  { value: "tax_sale_recovery", label: "Tax Sale Recovery", description: "Recovering property lost to tax sales" },
  { value: "eminent_domain", label: "Eminent Domain Challenge", description: "Challenging improper government seizure" },
  { value: "fraud_recovery", label: "Fraud Recovery", description: "Recovering property lost through fraudulent means" },
  { value: "partition_action", label: "Partition Action Defense", description: "Defending against forced sale of family property" },
];

const CASE_STATUSES = [
  { value: "research", label: "Research Phase", description: "Gathering historical documents and evidence" },
  { value: "documentation", label: "Documentation", description: "Compiling legal documentation" },
  { value: "legal_review", label: "Legal Review", description: "Attorney reviewing case materials" },
  { value: "filing", label: "Filing", description: "Preparing to file legal claims" },
  { value: "active_litigation", label: "Active Litigation", description: "Case is in court" },
  { value: "negotiation", label: "Negotiation", description: "Settlement discussions underway" },
  { value: "resolved", label: "Resolved", description: "Case has been resolved" },
  { value: "closed", label: "Closed", description: "Case closed without resolution" },
];

export const restorationRouter = router({
  // ============================================
  // CASE MANAGEMENT
  // ============================================

  getCases: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const userId = ctx.user.id;

    const userHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.ownerUserId, userId))
      .limit(1);

    if (!userHouse.length) {
      return { cases: [], claimTypes: CLAIM_TYPES, statuses: CASE_STATUSES };
    }

    const cases = await db
      .select()
      .from(restorationCases)
      .where(eq(restorationCases.houseId, userHouse[0].id))
      .orderBy(desc(restorationCases.createdAt));

    // Get linked properties for each case
    const casesWithProperties = await Promise.all(
      cases.map(async (c) => {
        const properties = await db
          .select()
          .from(realEstateProperties)
          .where(eq(realEstateProperties.restorationCaseId, c.id));
        return { ...c, properties };
      })
    );

    return {
      cases: casesWithProperties,
      claimTypes: CLAIM_TYPES,
      statuses: CASE_STATUSES,
    };
  }),

  getCase: protectedProcedure
    .input(z.object({ caseId: z.number() }))
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

      const caseData = await db
        .select()
        .from(restorationCases)
        .where(
          and(
            eq(restorationCases.id, input.caseId),
            eq(restorationCases.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!caseData.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Case not found" });
      }

      // Get linked properties
      const properties = await db
        .select()
        .from(realEstateProperties)
        .where(eq(realEstateProperties.restorationCaseId, input.caseId));

      // Get LuvLedger transactions related to this case
      // Note: Would need to track case-related expenses through a reference
      const luvLedgerAccount = await db
        .select()
        .from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.userId, userId))
        .limit(1);

      let expenses: any[] = [];
      if (luvLedgerAccount.length) {
        // Get transactions that might be case-related (would need description matching)
        const transactions = await db
          .select()
          .from(luvLedgerTransactions)
          .where(eq(luvLedgerTransactions.fromAccountId, luvLedgerAccount[0].id))
          .orderBy(desc(luvLedgerTransactions.createdAt))
          .limit(50);

        // Filter for case-related expenses (by description containing case reference)
        expenses = transactions.filter(
          t => t.description?.toLowerCase().includes("restoration") ||
               t.description?.toLowerCase().includes("legal") ||
               t.description?.toLowerCase().includes("case")
        );
      }

      return {
        case: caseData[0],
        properties,
        expenses,
        totalExpenses: expenses.reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0),
      };
    }),

  createCase: protectedProcedure
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
        description: z.string().optional(),
        propertyAddress: z.string().optional(),
        propertyCity: z.string().optional(),
        propertyState: z.string().optional(),
        propertyCounty: z.string().optional(),
        estimatedValue: z.number().optional(),
        originalOwner: z.string().optional(),
        yearLost: z.number().optional(),
        howLost: z.string().optional(),
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
        userId: userId,
        caseNumber,
        caseName: input.caseName,
        claimType: input.claimType,
        propertyDescription: input.description,
        propertyAddress: input.propertyAddress,
        state: input.propertyState,
        county: input.propertyCounty,
        estimatedValue: input.estimatedValue?.toString(),
        originalOwner: input.originalOwner,
        // yearLost and howLost not in schema
        status: "research",
      });

      return {
        success: true,
        caseId: result[0].insertId,
        caseNumber,
      };
    }),

  updateCaseStatus: protectedProcedure
    .input(
      z.object({
        caseId: z.number(),
        status: z.enum([
          "research",
          "documenting",
          "filed",
          "pending_review",
          "hearing_scheduled",
          "in_litigation",
          "settled",
          "won",
          "lost",
          "appealing",
          "closed",
        ]),
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
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      await db
        .update(restorationCases)
        .set({
          status: input.status,
          // statusNotes: input.notes, // Would need to add this column
        })
        .where(
          and(
            eq(restorationCases.id, input.caseId),
            eq(restorationCases.houseId, userHouse[0].id)
          )
        );

      return { success: true };
    }),

  // ============================================
  // LINK PROPERTY TO CASE
  // ============================================

  linkProperty: protectedProcedure
    .input(
      z.object({
        caseId: z.number(),
        propertyId: z.number(),
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

      // Verify case belongs to user
      const caseData = await db
        .select()
        .from(restorationCases)
        .where(
          and(
            eq(restorationCases.id, input.caseId),
            eq(restorationCases.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!caseData.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Case not found" });
      }

      // Update property to link to case
      await db
        .update(realEstateProperties)
        .set({
          restorationCaseId: input.caseId,
          isRestorationProperty: true,
        })
        .where(eq(realEstateProperties.id, input.propertyId));

      return { success: true };
    }),

  // ============================================
  // RECORD CASE EXPENSE (via LuvLedger)
  // ============================================

  recordExpense: protectedProcedure
    .input(
      z.object({
        caseId: z.number(),
        amount: z.number(),
        category: z.enum([
          "legal_fees",
          "court_costs",
          "research",
          "document_retrieval",
          "surveying",
          "appraisal",
          "travel",
          "expert_witness",
          "other",
        ]),
        description: z.string(),
        date: z.date().optional(),
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

      // Verify case belongs to user
      const caseData = await db
        .select()
        .from(restorationCases)
        .where(
          and(
            eq(restorationCases.id, input.caseId),
            eq(restorationCases.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!caseData.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Case not found" });
      }

      // Get house LuvLedger account
      const account = await db
        .select()
        .from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.userId, userId))
        .limit(1);

      if (!account.length) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "House LuvLedger account not found",
        });
      }

      // Record expense in LuvLedger
      const expenseDescription = `[Restoration Case ${caseData[0].caseNumber}] ${input.category}: ${input.description}`;

      const result = await db.insert(luvLedgerTransactions).values({
        fromAccountId: account[0].id,
        toAccountId: account[0].id, // Self-transaction for expense tracking
        amount: (-Math.abs(input.amount)).toString(),
        transactionType: "fee",
        description: expenseDescription,
        status: "confirmed",
      });

      // Update case total expenses (if we had that column)
      // For now, expenses are tracked through LuvLedger transactions

      return {
        success: true,
        transactionId: result[0].insertId,
      };
    }),

  // ============================================
  // CASE RESOLUTION
  // ============================================

  resolveCase: protectedProcedure
    .input(
      z.object({
        caseId: z.number(),
        resolution: z.enum(["won", "settled", "lost", "dismissed", "withdrawn"]),
        settlementAmount: z.number().optional(),
        propertyRecovered: z.boolean().default(false),
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
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      // Verify case belongs to user
      const caseData = await db
        .select()
        .from(restorationCases)
        .where(
          and(
            eq(restorationCases.id, input.caseId),
            eq(restorationCases.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!caseData.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Case not found" });
      }

      // Update case status
      await db
        .update(restorationCases)
        .set({
          status: input.resolution === "won" ? "won" : input.resolution === "settled" ? "settled" : input.resolution === "lost" ? "lost" : "closed",
          outcomeNotes: `${input.resolution}: ${input.notes || ''} ${input.settlementAmount ? 'Settlement: $' + input.settlementAmount : ''}`,
        })
        .where(eq(restorationCases.id, input.caseId));

      // If settlement received, record in LuvLedger
      if (input.settlementAmount && input.settlementAmount > 0) {
        const account = await db
          .select()
          .from(luvLedgerAccounts)
          .where(eq(luvLedgerAccounts.userId, userId))
          .limit(1);

        if (account.length) {
          await db.insert(luvLedgerTransactions).values({
            fromAccountId: account[0].id,
            toAccountId: account[0].id,
            amount: input.settlementAmount.toString(),
            transactionType: "income",
            description: `[Restoration Case ${caseData[0].caseNumber}] Settlement received`,
            status: "confirmed",
          });
        }
      }

      // If property recovered, update property status
      if (input.propertyRecovered) {
        await db
          .update(realEstateProperties)
          .set({
            ownershipStatus: "owned",
          })
          .where(eq(realEstateProperties.restorationCaseId, input.caseId));
      }

      return { success: true };
    }),

  // ============================================
  // CASE TIMELINE
  // ============================================

  getCaseTimeline: protectedProcedure
    .input(z.object({ caseId: z.number() }))
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

      const caseData = await db
        .select()
        .from(restorationCases)
        .where(
          and(
            eq(restorationCases.id, input.caseId),
            eq(restorationCases.houseId, userHouse[0].id)
          )
        )
        .limit(1);

      if (!caseData.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Case not found" });
      }

      // Build timeline from case data and transactions
      const timeline = [
        {
          date: caseData[0].createdAt,
          type: "created",
          title: "Case Created",
          description: `Restoration case "${caseData[0].caseName}" was created`,
        },
      ];

      // Add resolution if exists
      if (caseData[0].status === "won" || caseData[0].status === "settled" || caseData[0].status === "lost" || caseData[0].status === "closed") {
        timeline.push({
          date: caseData[0].updatedAt,
          type: "resolved",
          title: "Case Resolved",
          description: `Case status: ${caseData[0].status}`,
        });
      }

      return {
        timeline: timeline.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      };
    }),
});

export type RestorationRouter = typeof restorationRouter;
