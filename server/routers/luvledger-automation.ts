import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  allocationPots,
  allocationTransactions,
  syncCycles,
  giftSaleRatios,
  economicHealthIndicators,
  financialErrors,
  inflowCapture,
  houses,
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import crypto from "crypto";

// Helper to ensure db is not null
async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

// ============================================================
// ALLOCATION ENGINE - Scroll 55
// Implements 70/30 Treasury Split and 60/40 House-Level Split
// ============================================================

const TREASURY_PERCENTAGE = 30; // 30% to ancestral treasury
const HOUSE_PERCENTAGE = 70; // 70% to house operations
const RESERVE_PERCENTAGE = 60; // 60% of house amount to reserve (non-shareable)
const CIRCULATION_PERCENTAGE = 40; // 40% of house amount to circulation (shareable)

// Gift/Sale Ratio Constants (Scroll 59)
const GLOBAL_RATIO_TARGET = 3.0; // 1:3 - 1 gift per 3 sales
const HOUSE_RATIO_TARGET = 2.0; // 2:1 - 2 sales before 1 gift

/**
 * Calculate allocation splits based on Scroll 55 rules
 */
function calculateAllocation(grossAmount: number) {
  const treasuryAmount = (grossAmount * TREASURY_PERCENTAGE) / 100;
  const houseAmount = (grossAmount * HOUSE_PERCENTAGE) / 100;
  const reserveAmount = (houseAmount * RESERVE_PERCENTAGE) / 100;
  const circulationAmount = (houseAmount * CIRCULATION_PERCENTAGE) / 100;

  return {
    grossAmount,
    treasuryAmount,
    houseAmount,
    reserveAmount,
    circulationAmount,
  };
}

/**
 * Generate blockchain hash for transaction immutability
 */
function generateBlockchainHash(data: object): string {
  const dataString = JSON.stringify(data) + Date.now().toString();
  return crypto.createHash("sha256").update(dataString).digest("hex");
}

export const luvledgerAutomationRouter = router({
  // ============================================================
  // ALLOCATION POTS MANAGEMENT
  // ============================================================

  getAllocationPots: publicProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const db = await requireDb();
      const pots = await db
        .select()
        .from(allocationPots)
        .where(eq(allocationPots.houseId, input.houseId));
      return pots;
    }),

  initializeHousePots: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await requireDb();

      const potConfigs = [
        { potType: "root_authority_reserve" as const, targetPercentage: "42.00", isShareable: false, requiresApproval: true },
        { potType: "circulation_pool" as const, targetPercentage: "28.00", isShareable: true, requiresApproval: false },
        { potType: "house_operational" as const, targetPercentage: "15.00", isShareable: false, requiresApproval: false },
        { potType: "steward_compensation" as const, targetPercentage: "5.00", isShareable: false, requiresApproval: true },
        { potType: "commercial_operating" as const, targetPercentage: "5.00", isShareable: false, requiresApproval: false },
        { potType: "future_crown" as const, targetPercentage: "3.00", isShareable: false, requiresApproval: true },
        { potType: "ancestral_treasury" as const, targetPercentage: "30.00", isShareable: false, requiresApproval: true },
      ];

      for (const config of potConfigs) {
        await db.insert(allocationPots).values({
          houseId: input.houseId,
          potType: config.potType,
          targetPercentage: config.targetPercentage,
          isShareable: config.isShareable,
          requiresApproval: config.requiresApproval,
          balance: "0",
          minimumBalance: "0",
          status: "active",
        });
      }

      return { success: true, potsCreated: potConfigs.length };
    }),

  // ============================================================
  // INFLOW CAPTURE & ALLOCATION - Scroll 61
  // ============================================================

  captureInflow: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      sourceType: z.enum(["sale", "gift_received", "investment_return", "grant", "donation", "royalty", "interest", "other"]),
      grossAmount: z.number().positive(),
      currency: z.string().default("USD"),
      sourceDescription: z.string().optional(),
      externalReference: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();

      const [inflow] = await db.insert(inflowCapture).values({
        houseId: input.houseId,
        sourceType: input.sourceType,
        grossAmount: input.grossAmount.toString(),
        currency: input.currency,
        sourceDescription: input.sourceDescription,
        externalReference: input.externalReference,
        status: "pending",
      });

      return { success: true, inflowId: inflow.insertId };
    }),

  processInflowAllocation: protectedProcedure
    .input(z.object({ inflowId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await requireDb();

      const [inflow] = await db
        .select()
        .from(inflowCapture)
        .where(eq(inflowCapture.id, input.inflowId));

      if (!inflow) {
        throw new Error("Inflow not found");
      }

      if (inflow.status !== "pending") {
        throw new Error(`Inflow already processed with status: ${inflow.status}`);
      }

      const grossAmount = parseFloat(inflow.grossAmount);
      const allocation = calculateAllocation(grossAmount);

      const blockchainHash = generateBlockchainHash({
        inflowId: input.inflowId,
        houseId: inflow.houseId,
        ...allocation,
        timestamp: new Date().toISOString(),
      });

      const [transaction] = await db.insert(allocationTransactions).values({
        sourceHouseId: inflow.houseId,
        grossAmount: allocation.grossAmount.toString(),
        treasuryAmount: allocation.treasuryAmount.toString(),
        houseAmount: allocation.houseAmount.toString(),
        reserveAmount: allocation.reserveAmount.toString(),
        circulationAmount: allocation.circulationAmount.toString(),
        transactionType: "income_allocation",
        description: `Allocation from ${inflow.sourceType}: ${inflow.sourceDescription || ""}`,
        validationStatus: "validated",
        blockchainHash,
      });

      // Update pot balances
      await db
        .update(allocationPots)
        .set({
          balance: sql`${allocationPots.balance} + ${allocation.treasuryAmount}`,
          lastSyncAt: new Date(),
        })
        .where(
          and(
            eq(allocationPots.houseId, inflow.houseId),
            eq(allocationPots.potType, "ancestral_treasury")
          )
        );

      await db
        .update(allocationPots)
        .set({
          balance: sql`${allocationPots.balance} + ${allocation.reserveAmount}`,
          lastSyncAt: new Date(),
        })
        .where(
          and(
            eq(allocationPots.houseId, inflow.houseId),
            eq(allocationPots.potType, "root_authority_reserve")
          )
        );

      await db
        .update(allocationPots)
        .set({
          balance: sql`${allocationPots.balance} + ${allocation.circulationAmount}`,
          lastSyncAt: new Date(),
        })
        .where(
          and(
            eq(allocationPots.houseId, inflow.houseId),
            eq(allocationPots.potType, "circulation_pool")
          )
        );

      // Update house totals
      await db
        .update(houses)
        .set({
          totalIncome: sql`${houses.totalIncome} + ${grossAmount}`,
          ancestralTreasury: sql`${houses.ancestralTreasury} + ${allocation.treasuryAmount}`,
          rootAuthorityReserve: sql`${houses.rootAuthorityReserve} + ${allocation.reserveAmount}`,
          circulationPool: sql`${houses.circulationPool} + ${allocation.circulationAmount}`,
        })
        .where(eq(houses.id, inflow.houseId));

      // Mark inflow as allocated
      await db
        .update(inflowCapture)
        .set({
          status: "allocated",
          allocationTransactionId: Number(transaction.insertId),
          processedAt: new Date(),
        })
        .where(eq(inflowCapture.id, input.inflowId));

      return {
        success: true,
        allocation,
        transactionId: transaction.insertId,
        blockchainHash,
      };
    }),

  // ============================================================
  // GIFT/SALE RATIO ENFORCEMENT - Scroll 59
  // ============================================================

  getGiftSaleRatio: publicProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const db = await requireDb();
      const [ratio] = await db
        .select()
        .from(giftSaleRatios)
        .where(eq(giftSaleRatios.houseId, input.houseId));
      return ratio || null;
    }),

  recordSale: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await requireDb();

      let [ratio] = await db
        .select()
        .from(giftSaleRatios)
        .where(eq(giftSaleRatios.houseId, input.houseId));

      if (!ratio) {
        await db.insert(giftSaleRatios).values({
          houseId: input.houseId,
          totalGiftsIssued: 0,
          totalSalesCompleted: 1,
          currentRatio: "0",
          globalRatioTarget: GLOBAL_RATIO_TARGET.toString(),
          houseRatioTarget: HOUSE_RATIO_TARGET.toString(),
          isCompliant: true,
          violationCount: 0,
          giftingBlocked: false,
        });
        return { success: true, newSalesCount: 1, giftingAllowed: false };
      }

      const newSalesCount = ratio.totalSalesCompleted + 1;
      const newRatio = ratio.totalGiftsIssued > 0 
        ? newSalesCount / ratio.totalGiftsIssued 
        : newSalesCount;

      await db
        .update(giftSaleRatios)
        .set({
          totalSalesCompleted: newSalesCount,
          currentRatio: newRatio.toString(),
          lastUpdatedAt: new Date(),
        })
        .where(eq(giftSaleRatios.houseId, input.houseId));

      const giftingAllowed = newSalesCount >= HOUSE_RATIO_TARGET * (ratio.totalGiftsIssued + 1);

      return { success: true, newSalesCount, giftingAllowed };
    }),

  recordGift: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await requireDb();

      const [ratio] = await db
        .select()
        .from(giftSaleRatios)
        .where(eq(giftSaleRatios.houseId, input.houseId));

      if (!ratio) {
        await db.insert(financialErrors).values({
          errorCode: "GSREL-01",
          errorCategory: "gift_sale",
          severity: "error",
          houseId: input.houseId,
          message: "Gift attempted without sales history",
          status: "open",
        });
        throw new Error("GSREL-01: Cannot issue gift without sales history");
      }

      const requiredSales = (ratio.totalGiftsIssued + 1) * HOUSE_RATIO_TARGET;
      if (ratio.totalSalesCompleted < requiredSales) {
        await db
          .update(giftSaleRatios)
          .set({
            giftingBlocked: true,
            blockReason: `Insufficient sales. Required: ${requiredSales}, Current: ${ratio.totalSalesCompleted}`,
            lastViolationAt: new Date(),
            violationCount: ratio.violationCount + 1,
            isCompliant: false,
          })
          .where(eq(giftSaleRatios.houseId, input.houseId));

        await db.insert(financialErrors).values({
          errorCode: "GSREL-02",
          errorCategory: "gift_sale",
          severity: "warning",
          houseId: input.houseId,
          message: `Gift blocked: 2:1 ratio not met. Need ${requiredSales} sales, have ${ratio.totalSalesCompleted}`,
          status: "open",
        });

        throw new Error(`GSREL-02: Gift blocked. Need ${requiredSales} sales before next gift.`);
      }

      const newGiftsCount = ratio.totalGiftsIssued + 1;
      const newRatio = ratio.totalSalesCompleted / newGiftsCount;

      await db
        .update(giftSaleRatios)
        .set({
          totalGiftsIssued: newGiftsCount,
          currentRatio: newRatio.toString(),
          isCompliant: newRatio >= GLOBAL_RATIO_TARGET,
          giftingBlocked: false,
          blockReason: null,
          lastUpdatedAt: new Date(),
        })
        .where(eq(giftSaleRatios.houseId, input.houseId));

      return { success: true, newGiftsCount, currentRatio: newRatio };
    }),

  // ============================================================
  // SYNC CYCLES - Scroll 61
  // ============================================================

  getSyncCycles: publicProcedure
    .input(z.object({ 
      houseId: z.number().optional(),
      limit: z.number().default(20) 
    }))
    .query(async ({ input }) => {
      const db = await requireDb();

      if (input.houseId) {
        const cycles = await db
          .select()
          .from(syncCycles)
          .where(eq(syncCycles.houseId, input.houseId))
          .orderBy(desc(syncCycles.scheduledAt))
          .limit(input.limit);
        return cycles;
      }

      const cycles = await db
        .select()
        .from(syncCycles)
        .orderBy(desc(syncCycles.scheduledAt))
        .limit(input.limit);

      return cycles;
    }),

  runSyncCycle: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      cycleType: z.enum(["hourly", "daily", "weekly", "monthly", "quarterly", "annual"]),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();

      const [cycle] = await db.insert(syncCycles).values({
        cycleType: input.cycleType,
        houseId: input.houseId,
        scheduledAt: new Date(),
        startedAt: new Date(),
        status: "running",
        transactionsProcessed: 0,
        allocationsCreated: 0,
        errorsEncountered: 0,
      });

      const cycleId = Number(cycle.insertId);
      let transactionsProcessed = 0;
      let allocationsCreated = 0;
      let errorsEncountered = 0;

      try {
        const pendingInflows = await db
          .select()
          .from(inflowCapture)
          .where(
            and(
              eq(inflowCapture.houseId, input.houseId),
              eq(inflowCapture.status, "pending")
            )
          );

        for (const inflow of pendingInflows) {
          try {
            const grossAmount = parseFloat(inflow.grossAmount);
            const allocation = calculateAllocation(grossAmount);

            const blockchainHash = generateBlockchainHash({
              inflowId: inflow.id,
              houseId: inflow.houseId,
              ...allocation,
              cycleId,
              timestamp: new Date().toISOString(),
            });

            await db.insert(allocationTransactions).values({
              sourceHouseId: inflow.houseId,
              grossAmount: allocation.grossAmount.toString(),
              treasuryAmount: allocation.treasuryAmount.toString(),
              houseAmount: allocation.houseAmount.toString(),
              reserveAmount: allocation.reserveAmount.toString(),
              circulationAmount: allocation.circulationAmount.toString(),
              transactionType: "income_allocation",
              description: `Sync cycle ${input.cycleType}: ${inflow.sourceType}`,
              validationStatus: "validated",
              blockchainHash,
            });

            await db
              .update(inflowCapture)
              .set({ status: "allocated", processedAt: new Date() })
              .where(eq(inflowCapture.id, inflow.id));

            transactionsProcessed++;
            allocationsCreated++;
          } catch (err) {
            errorsEncountered++;
            await db.insert(financialErrors).values({
              errorCode: "SYNC-01",
              errorCategory: "sync",
              severity: "error",
              houseId: input.houseId,
              syncCycleId: cycleId,
              message: `Failed to process inflow ${inflow.id}: ${err}`,
              status: "open",
            });
          }
        }

        await db.insert(economicHealthIndicators).values({
          houseId: input.houseId,
          indicatorType: "sync_success_rate",
          currentValue: (transactionsProcessed / Math.max(pendingInflows.length, 1) * 100).toString(),
          targetValue: "100",
          status: errorsEncountered === 0 ? "healthy" : "warning",
          measurementPeriod: input.cycleType === "hourly" ? "hourly" : "daily",
        });

        await db
          .update(syncCycles)
          .set({
            status: "completed",
            completedAt: new Date(),
            transactionsProcessed,
            allocationsCreated,
            errorsEncountered,
            summary: {
              pendingInflowsFound: pendingInflows.length,
              successfulAllocations: allocationsCreated,
              failedAllocations: errorsEncountered,
            },
          })
          .where(eq(syncCycles.id, cycleId));

        return {
          success: true,
          cycleId,
          transactionsProcessed,
          allocationsCreated,
          errorsEncountered,
        };
      } catch (err) {
        await db
          .update(syncCycles)
          .set({
            status: "failed",
            completedAt: new Date(),
            errorsEncountered: errorsEncountered + 1,
            errorLog: { error: String(err) },
          })
          .where(eq(syncCycles.id, cycleId));

        throw err;
      }
    }),

  // ============================================================
  // ECONOMIC HEALTH MONITORING - Scroll 60
  // ============================================================

  getHealthIndicators: publicProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const db = await requireDb();
      const indicators = await db
        .select()
        .from(economicHealthIndicators)
        .where(eq(economicHealthIndicators.houseId, input.houseId))
        .orderBy(desc(economicHealthIndicators.measuredAt))
        .limit(50);
      return indicators;
    }),

  getFinancialErrors: publicProcedure
    .input(z.object({ 
      houseId: z.number().optional(),
      status: z.enum(["open", "acknowledged", "investigating", "resolved", "ignored"]).optional(),
      limit: z.number().default(50) 
    }))
    .query(async ({ input }) => {
      const db = await requireDb();

      const conditions = [];
      if (input.houseId) {
        conditions.push(eq(financialErrors.houseId, input.houseId));
      }
      if (input.status) {
        conditions.push(eq(financialErrors.status, input.status));
      }

      const errors = await db
        .select()
        .from(financialErrors)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(financialErrors.createdAt))
        .limit(input.limit);

      return errors;
    }),

  resolveError: protectedProcedure
    .input(z.object({
      errorId: z.number(),
      resolution: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();

      await db
        .update(financialErrors)
        .set({
          status: "resolved",
          resolvedById: ctx.user.id,
          resolvedAt: new Date(),
          resolution: input.resolution,
        })
        .where(eq(financialErrors.id, input.errorId));

      return { success: true };
    }),

  // ============================================================
  // ALLOCATION TRANSACTIONS HISTORY
  // ============================================================

  getAllocationHistory: publicProcedure
    .input(z.object({
      houseId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await requireDb();

      const transactions = await db
        .select()
        .from(allocationTransactions)
        .where(eq(allocationTransactions.sourceHouseId, input.houseId))
        .orderBy(desc(allocationTransactions.createdAt))
        .limit(input.limit);

      return transactions;
    }),

  getFinancialSummary: publicProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const db = await requireDb();

      const [house] = await db
        .select()
        .from(houses)
        .where(eq(houses.id, input.houseId));

      const pots = await db
        .select()
        .from(allocationPots)
        .where(eq(allocationPots.houseId, input.houseId));

      const recentTransactions = await db
        .select()
        .from(allocationTransactions)
        .where(eq(allocationTransactions.sourceHouseId, input.houseId))
        .orderBy(desc(allocationTransactions.createdAt))
        .limit(10);

      const [ratio] = await db
        .select()
        .from(giftSaleRatios)
        .where(eq(giftSaleRatios.houseId, input.houseId));

      const pendingInflows = await db
        .select()
        .from(inflowCapture)
        .where(
          and(
            eq(inflowCapture.houseId, input.houseId),
            eq(inflowCapture.status, "pending")
          )
        );

      const openErrors = await db
        .select()
        .from(financialErrors)
        .where(
          and(
            eq(financialErrors.houseId, input.houseId),
            eq(financialErrors.status, "open")
          )
        );

      return {
        house,
        pots,
        recentTransactions,
        giftSaleRatio: ratio,
        pendingInflowsCount: pendingInflows.length,
        pendingInflowsTotal: pendingInflows.reduce((sum: number, i) => sum + parseFloat(i.grossAmount), 0),
        openErrorsCount: openErrors.length,
        allocationRules: {
          treasuryPercentage: TREASURY_PERCENTAGE,
          housePercentage: HOUSE_PERCENTAGE,
          reservePercentage: RESERVE_PERCENTAGE,
          circulationPercentage: CIRCULATION_PERCENTAGE,
          globalGiftSaleRatio: GLOBAL_RATIO_TARGET,
          houseGiftSaleRatio: HOUSE_RATIO_TARGET,
        },
      };
    }),
});

export type LuvledgerAutomationRouter = typeof luvledgerAutomationRouter;
