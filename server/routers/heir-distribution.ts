import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  houseHeirs,
  heirVestingSchedules,
  heirDistributions,
  heirAccumulationAccounts,
  spendthriftProvisions,
  heirDistributionLocks,
  houses,
  luvLedgerAccounts,
  luvLedgerTransactions,
  revenueSharingEvents,
} from "../../drizzle/schema";
import { eq, and, desc, sql, sum } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// CONSTANTS
// ============================================

// The 40% Community Share is split among heirs
const HEIR_POOL_PERCENTAGE = 40; // 40% of the 30% platform fee goes to heirs

// Default vesting milestones
const DEFAULT_VESTING_MILESTONES = [
  { type: "age", targetAge: 18, percentage: 25, name: "Age 18 - Initial Vesting" },
  { type: "age", targetAge: 21, percentage: 25, name: "Age 21 - Second Vesting" },
  { type: "age", targetAge: 25, percentage: 25, name: "Age 25 - Third Vesting" },
  { type: "education", educationLevel: "high_school", percentage: 25, name: "Education Completion" },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

async function recordToBlockchain(type: string, entityId: number, data: any): Promise<string> {
  const timestamp = Date.now();
  const payload = JSON.stringify({ type, entityId, data, timestamp });
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// ============================================
// ROUTER
// ============================================

export const heirDistributionRouter = router({
  // Designate a new heir
  designateHeir: protectedProcedure
    .input(z.object({
      houseId: z.number().optional(),
      fullName: z.string(),
      relationship: z.enum([
        "child", "grandchild", "great_grandchild", "spouse", "sibling",
        "niece_nephew", "cousin", "adopted", "guardian_ward", "other"
      ]),
      dateOfBirth: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      distributionPercentage: z.number().min(0).max(100),
      distributionMethod: z.enum(["immediate", "accumulate", "hybrid"]).default("accumulate"),
      accumulationPercentage: z.number().min(0).max(100).default(100),
      spendthriftEnabled: z.boolean().default(true),
      vestingMilestones: z.array(z.object({
        type: z.enum(["age", "education", "house_participation", "business_completion", "time_based", "custom"]),
        targetAge: z.number().optional(),
        educationLevel: z.string().optional(),
        vestingMonths: z.number().optional(),
        percentage: z.number(),
        name: z.string(),
        description: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get user's House
      let houseId = input.houseId;
      if (!houseId) {
        const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
        if (!userHouse.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
        }
        houseId = userHouse[0].id;
      }

      // Check if distribution is locked
      const [lock] = await db.select().from(heirDistributionLocks).where(eq(heirDistributionLocks.houseId, houseId));
      if (lock?.isLocked) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Heir distribution percentages are locked. Cannot add new heirs." 
        });
      }

      // Validate total percentage won't exceed 100%
      const existingHeirs = await db.select().from(houseHeirs).where(
        and(eq(houseHeirs.houseId, houseId), eq(houseHeirs.status, "active"))
      );
      const currentTotal = existingHeirs.reduce((sum, h) => sum + parseFloat(h.distributionPercentage || "0"), 0);
      if (currentTotal + input.distributionPercentage > 100) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Total heir percentage would exceed 100%. Current: ${currentTotal}%, Adding: ${input.distributionPercentage}%` 
        });
      }

      // Create heir
      const [heir] = await db.insert(houseHeirs).values({
        houseId,
        fullName: input.fullName,
        relationship: input.relationship,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        email: input.email,
        phone: input.phone,
        address: input.address,
        distributionPercentage: input.distributionPercentage.toString(),
        distributionMethod: input.distributionMethod,
        accumulationPercentage: input.accumulationPercentage.toString(),
        spendthriftEnabled: input.spendthriftEnabled,
        designatedBy: userId,
      });

      const heirId = heir.insertId;

      // Create accumulation account
      await db.insert(heirAccumulationAccounts).values({
        heirId,
        houseId,
        minimumAge: 18,
        releaseSchedule: "graduated",
        spendthriftProtected: input.spendthriftEnabled,
      });

      // Create spendthrift provision if enabled
      if (input.spendthriftEnabled) {
        await db.insert(spendthriftProvisions).values({
          heirId,
          houseId,
          protectionLevel: "full",
        });
      }

      // Create vesting schedule
      const vestingMilestones = input.vestingMilestones || DEFAULT_VESTING_MILESTONES;
      for (let i = 0; i < vestingMilestones.length; i++) {
        const milestone = vestingMilestones[i];
        await db.insert(heirVestingSchedules).values({
          heirId,
          houseId,
          milestoneType: milestone.type as any,
          milestoneName: milestone.name,
          milestoneDescription: (milestone as any).description,
          targetAge: (milestone as any).targetAge,
          educationLevel: (milestone as any).educationLevel as any,
          vestingMonths: (milestone as any).vestingMonths,
          vestingPercentage: milestone.percentage.toString(),
          milestoneOrder: i + 1,
        });
      }

      return {
        success: true,
        heirId,
        message: `Heir ${input.fullName} designated with ${input.distributionPercentage}% distribution`,
      };
    }),

  // Lock heir distribution percentages
  lockDistributions: protectedProcedure
    .input(z.object({
      houseId: z.number().optional(),
      lockReason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get user's House
      let houseId = input.houseId;
      if (!houseId) {
        const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
        if (!userHouse.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
        }
        houseId = userHouse[0].id;
      }

      // Get all active heirs and validate total is 100%
      const heirs = await db.select().from(houseHeirs).where(
        and(eq(houseHeirs.houseId, houseId), eq(houseHeirs.status, "active"))
      );
      
      if (heirs.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No heirs designated. Cannot lock." });
      }

      const totalPercentage = heirs.reduce((sum, h) => sum + parseFloat(h.distributionPercentage || "0"), 0);
      if (totalPercentage !== 100) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Total heir percentage must equal 100% before locking. Current: ${totalPercentage}%` 
        });
      }

      // Lock all heir percentages
      for (const heir of heirs) {
        await db.update(houseHeirs).set({
          percentageLocked: true,
          percentageLockedAt: new Date(),
          percentageLockedBy: userId,
        }).where(eq(houseHeirs.id, heir.id));
      }

      // Create or update lock record
      const [existingLock] = await db.select().from(heirDistributionLocks).where(eq(heirDistributionLocks.houseId, houseId));
      
      if (existingLock) {
        await db.update(heirDistributionLocks).set({
          isLocked: true,
          lockedAt: new Date(),
          lockedBy: userId,
          lockReason: input.lockReason || "Heir distribution percentages finalized",
          totalAllocatedPercentage: totalPercentage.toString(),
          lastModifiedAt: new Date(),
          lastModifiedBy: userId,
        }).where(eq(heirDistributionLocks.id, existingLock.id));
      } else {
        await db.insert(heirDistributionLocks).values({
          houseId,
          isLocked: true,
          lockedAt: new Date(),
          lockedBy: userId,
          lockReason: input.lockReason || "Heir distribution percentages finalized",
          totalAllocatedPercentage: totalPercentage.toString(),
        });
      }

      // Record to blockchain
      const blockchainHash = await recordToBlockchain("heir_lock", houseId, {
        heirs: heirs.map(h => ({ id: h.id, name: h.fullName, percentage: h.distributionPercentage })),
        totalPercentage,
        lockedBy: userId,
      });

      return {
        success: true,
        message: `Heir distributions locked. ${heirs.length} heirs with ${totalPercentage}% total allocation.`,
        blockchainHash,
      };
    }),

  // Process automatic distribution to heirs (called when revenue is received)
  processHeirDistribution: protectedProcedure
    .input(z.object({
      revenueSharingEventId: z.number(),
      communityShareAmount: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get revenue sharing event
      const [event] = await db.select().from(revenueSharingEvents).where(eq(revenueSharingEvents.id, input.revenueSharingEventId));
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Revenue sharing event not found" });
      }

      const houseId = event.parentHouseId;

      // Get all active heirs
      const heirs = await db.select().from(houseHeirs).where(
        and(eq(houseHeirs.houseId, houseId), eq(houseHeirs.status, "active"))
      );

      if (heirs.length === 0) {
        return { success: true, message: "No heirs to distribute to", distributions: [] };
      }

      const distributions = [];
      const communityShareAmount = input.communityShareAmount;

      for (const heir of heirs) {
        const heirPercentage = parseFloat(heir.distributionPercentage || "0");
        const grossAmount = communityShareAmount * (heirPercentage / 100);

        // Calculate vested percentage
        const vestedPercentage = parseFloat(heir.vestedPercentage || "0");
        const netAmount = grossAmount * (vestedPercentage / 100);

        // Determine distribution vs accumulation
        const distributionMethod = heir.distributionMethod;
        const accumulationPct = parseFloat(heir.accumulationPercentage || "100");
        
        let distributedAmount = 0;
        let accumulatedAmount = 0;

        if (distributionMethod === "immediate") {
          distributedAmount = netAmount;
        } else if (distributionMethod === "accumulate") {
          accumulatedAmount = netAmount;
        } else { // hybrid
          accumulatedAmount = netAmount * (accumulationPct / 100);
          distributedAmount = netAmount - accumulatedAmount;
        }

        // Record blockchain hash
        const blockchainHash = await recordToBlockchain("heir_distribution", heir.id, {
          grossAmount,
          heirPercentage,
          vestedPercentage,
          netAmount,
          distributedAmount,
          accumulatedAmount,
        });

        // Create distribution record
        const [distribution] = await db.insert(heirDistributions).values({
          heirId: heir.id,
          houseId,
          sourceType: "community_share",
          sourceEventId: input.revenueSharingEventId,
          grossAmount: grossAmount.toString(),
          heirPercentage: heirPercentage.toString(),
          vestedPercentage: vestedPercentage.toString(),
          netAmount: netAmount.toString(),
          distributedAmount: distributedAmount.toString(),
          accumulatedAmount: accumulatedAmount.toString(),
          calculationNotes: `${heirPercentage}% of $${communityShareAmount.toFixed(2)} = $${grossAmount.toFixed(2)}, ${vestedPercentage}% vested = $${netAmount.toFixed(2)}`,
          blockchainHash,
        });

        // Update accumulation account if applicable
        if (accumulatedAmount > 0) {
          await db.update(heirAccumulationAccounts).set({
            currentBalance: sql`${heirAccumulationAccounts.currentBalance} + ${accumulatedAmount}`,
            totalDeposits: sql`${heirAccumulationAccounts.totalDeposits} + ${accumulatedAmount}`,
          }).where(eq(heirAccumulationAccounts.heirId, heir.id));
        }

        // Update heir totals
        await db.update(houseHeirs).set({
          totalDistributed: sql`${houseHeirs.totalDistributed} + ${distributedAmount}`,
          totalAccumulated: sql`${houseHeirs.totalAccumulated} + ${accumulatedAmount}`,
        }).where(eq(houseHeirs.id, heir.id));

        distributions.push({
          heirId: heir.id,
          heirName: heir.fullName,
          grossAmount,
          netAmount,
          distributedAmount,
          accumulatedAmount,
          blockchainHash,
        });
      }

      return {
        success: true,
        distributions,
        totalDistributed: distributions.reduce((sum, d) => sum + d.distributedAmount, 0),
        totalAccumulated: distributions.reduce((sum, d) => sum + d.accumulatedAmount, 0),
      };
    }),

  // Check and update vesting status for an heir
  updateVestingStatus: protectedProcedure
    .input(z.object({
      heirId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get heir
      const [heir] = await db.select().from(houseHeirs).where(eq(houseHeirs.id, input.heirId));
      if (!heir) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Heir not found" });
      }

      // Get vesting schedules
      const schedules = await db.select().from(heirVestingSchedules)
        .where(eq(heirVestingSchedules.heirId, input.heirId))
        .orderBy(heirVestingSchedules.milestoneOrder);

      let totalVested = 0;
      const updates = [];

      for (const schedule of schedules) {
        if (schedule.status === "achieved") {
          totalVested += parseFloat(schedule.vestingPercentage || "0");
          continue;
        }

        let achieved = false;

        // Check age-based milestones
        if (schedule.milestoneType === "age" && heir.dateOfBirth && schedule.targetAge) {
          const age = calculateAge(new Date(heir.dateOfBirth));
          if (age >= schedule.targetAge) {
            achieved = true;
          }
        }

        // Other milestone types would need manual verification
        // (education, house_participation, etc.)

        if (achieved) {
          await db.update(heirVestingSchedules).set({
            status: "achieved",
            achievedAt: new Date(),
            verifiedBy: userId,
            verificationNotes: "Auto-verified based on age",
          }).where(eq(heirVestingSchedules.id, schedule.id));

          totalVested += parseFloat(schedule.vestingPercentage || "0");
          updates.push({
            milestone: schedule.milestoneName,
            percentage: schedule.vestingPercentage,
          });
        }
      }

      // Update heir's vested percentage
      const vestingStatus = totalVested >= 100 ? "fully_vested" : totalVested > 0 ? "partial" : "not_started";
      await db.update(houseHeirs).set({
        vestedPercentage: Math.min(totalVested, 100).toString(),
        vestingStatus,
      }).where(eq(houseHeirs.id, input.heirId));

      return {
        success: true,
        heirId: input.heirId,
        totalVestedPercentage: Math.min(totalVested, 100),
        vestingStatus,
        newlyAchieved: updates,
      };
    }),

  // Manually verify a vesting milestone
  verifyMilestone: protectedProcedure
    .input(z.object({
      scheduleId: z.number(),
      verificationNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db.update(heirVestingSchedules).set({
        status: "achieved",
        achievedAt: new Date(),
        verifiedBy: userId,
        verificationNotes: input.verificationNotes || "Manually verified",
      }).where(eq(heirVestingSchedules.id, input.scheduleId));

      // Get the schedule to update heir's vesting
      const [schedule] = await db.select().from(heirVestingSchedules).where(eq(heirVestingSchedules.id, input.scheduleId));
      if (schedule) {
        // Recalculate total vesting
        const allSchedules = await db.select().from(heirVestingSchedules)
          .where(and(eq(heirVestingSchedules.heirId, schedule.heirId), eq(heirVestingSchedules.status, "achieved")));
        
        const totalVested = allSchedules.reduce((sum, s) => sum + parseFloat(s.vestingPercentage || "0"), 0);
        const vestingStatus = totalVested >= 100 ? "fully_vested" : totalVested > 0 ? "partial" : "not_started";

        await db.update(houseHeirs).set({
          vestedPercentage: Math.min(totalVested, 100).toString(),
          vestingStatus,
        }).where(eq(houseHeirs.id, schedule.heirId));
      }

      return { success: true };
    }),

  // Get all heirs for a House
  getHouseHeirs: protectedProcedure
    .input(z.object({ houseId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      let houseId = input?.houseId;
      if (!houseId) {
        const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
        if (!userHouse.length) return { heirs: [], lock: null, totalPercentage: 0 };
        houseId = userHouse[0].id;
      }

      const heirs = await db.select().from(houseHeirs)
        .where(and(eq(houseHeirs.houseId, houseId), eq(houseHeirs.status, "active")));

      const [lock] = await db.select().from(heirDistributionLocks).where(eq(heirDistributionLocks.houseId, houseId));

      const totalPercentage = heirs.reduce((sum, h) => sum + parseFloat(h.distributionPercentage || "0"), 0);

      return {
        heirs: heirs.map(h => ({
          ...h,
          distributionPercentage: parseFloat(h.distributionPercentage || "0"),
          vestedPercentage: parseFloat(h.vestedPercentage || "0"),
          totalDistributed: parseFloat(h.totalDistributed || "0"),
          totalAccumulated: parseFloat(h.totalAccumulated || "0"),
        })),
        lock,
        totalPercentage,
      };
    }),

  // Get heir's vesting schedule
  getHeirVesting: protectedProcedure
    .input(z.object({ heirId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const schedules = await db.select().from(heirVestingSchedules)
        .where(eq(heirVestingSchedules.heirId, input.heirId))
        .orderBy(heirVestingSchedules.milestoneOrder);

      return schedules;
    }),

  // Get heir's accumulation account
  getAccumulationAccount: protectedProcedure
    .input(z.object({ heirId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [account] = await db.select().from(heirAccumulationAccounts)
        .where(eq(heirAccumulationAccounts.heirId, input.heirId));

      if (!account) return null;

      return {
        ...account,
        currentBalance: parseFloat(account.currentBalance || "0"),
        totalDeposits: parseFloat(account.totalDeposits || "0"),
        totalWithdrawals: parseFloat(account.totalWithdrawals || "0"),
        totalInterestEarned: parseFloat(account.totalInterestEarned || "0"),
      };
    }),

  // Get heir's distribution history
  getDistributionHistory: protectedProcedure
    .input(z.object({
      heirId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const distributions = await db.select().from(heirDistributions)
        .where(eq(heirDistributions.heirId, input.heirId))
        .orderBy(desc(heirDistributions.processedAt))
        .limit(input.limit);

      return distributions.map(d => ({
        ...d,
        grossAmount: parseFloat(d.grossAmount || "0"),
        netAmount: parseFloat(d.netAmount || "0"),
        distributedAmount: parseFloat(d.distributedAmount || "0"),
        accumulatedAmount: parseFloat(d.accumulatedAmount || "0"),
      }));
    }),

  // Release funds from accumulation account
  releaseAccumulatedFunds: protectedProcedure
    .input(z.object({
      heirId: z.number(),
      amount: z.number(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get accumulation account
      const [account] = await db.select().from(heirAccumulationAccounts)
        .where(eq(heirAccumulationAccounts.heirId, input.heirId));

      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Accumulation account not found" });
      }

      const currentBalance = parseFloat(account.currentBalance || "0");
      if (input.amount > currentBalance) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Insufficient balance. Available: $${currentBalance.toFixed(2)}` 
        });
      }

      // Get heir to check vesting and age requirements
      const [heir] = await db.select().from(houseHeirs).where(eq(houseHeirs.id, input.heirId));
      if (!heir) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Heir not found" });
      }

      // Check minimum age
      if (heir.dateOfBirth && account.minimumAge) {
        const age = calculateAge(new Date(heir.dateOfBirth));
        if (age < account.minimumAge) {
          throw new TRPCError({ 
            code: "FORBIDDEN", 
            message: `Heir must be at least ${account.minimumAge} years old to release funds. Current age: ${age}` 
          });
        }
      }

      // Record blockchain hash
      const blockchainHash = await recordToBlockchain("accumulation_release", input.heirId, {
        amount: input.amount,
        reason: input.reason,
        previousBalance: currentBalance,
      });

      // Update account
      await db.update(heirAccumulationAccounts).set({
        currentBalance: sql`${heirAccumulationAccounts.currentBalance} - ${input.amount}`,
        totalWithdrawals: sql`${heirAccumulationAccounts.totalWithdrawals} + ${input.amount}`,
      }).where(eq(heirAccumulationAccounts.id, account.id));

      // Record distribution
      await db.insert(heirDistributions).values({
        heirId: input.heirId,
        houseId: heir.houseId,
        sourceType: "accumulation_release",
        grossAmount: input.amount.toString(),
        heirPercentage: "100",
        vestedPercentage: "100",
        netAmount: input.amount.toString(),
        distributedAmount: input.amount.toString(),
        accumulatedAmount: "0",
        calculationNotes: `Released from accumulation: ${input.reason}`,
        blockchainHash,
      });

      // Update heir totals
      await db.update(houseHeirs).set({
        totalDistributed: sql`${houseHeirs.totalDistributed} + ${input.amount}`,
        totalAccumulated: sql`${houseHeirs.totalAccumulated} - ${input.amount}`,
      }).where(eq(houseHeirs.id, input.heirId));

      return {
        success: true,
        releasedAmount: input.amount,
        newBalance: currentBalance - input.amount,
        blockchainHash,
      };
    }),

  // Update an existing heir
  updateHeir: protectedProcedure
    .input(z.object({
      heirId: z.number(),
      fullName: z.string().optional(),
      relationship: z.enum([
        "child", "grandchild", "great_grandchild", "spouse", "sibling",
        "niece_nephew", "cousin", "adopted", "guardian_ward", "other"
      ]).optional(),
      dateOfBirth: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      distributionPercentage: z.number().min(0).max(100).optional(),
      distributionMethod: z.enum(["immediate", "accumulate", "hybrid"]).optional(),
      accumulationPercentage: z.number().min(0).max(100).optional(),
      spendthriftEnabled: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get existing heir
      const [heir] = await db.select().from(houseHeirs).where(eq(houseHeirs.id, input.heirId));
      if (!heir) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Heir not found" });
      }

      // Check if percentage is locked
      if (input.distributionPercentage !== undefined && heir.percentageLocked) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Distribution percentage is locked and cannot be changed" 
        });
      }

      // If changing percentage, validate total
      if (input.distributionPercentage !== undefined) {
        const otherHeirs = await db.select().from(houseHeirs).where(
          and(
            eq(houseHeirs.houseId, heir.houseId),
            eq(houseHeirs.status, "active")
          )
        );
        const otherTotal = otherHeirs
          .filter(h => h.id !== input.heirId)
          .reduce((sum, h) => sum + parseFloat(h.distributionPercentage || "0"), 0);
        
        if (otherTotal + input.distributionPercentage > 100) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: `Total heir percentage would exceed 100%. Other heirs: ${otherTotal}%, Requested: ${input.distributionPercentage}%` 
          });
        }
      }

      // Build update object
      const updateData: any = {};
      if (input.fullName) updateData.fullName = input.fullName;
      if (input.relationship) updateData.relationship = input.relationship;
      if (input.dateOfBirth) updateData.dateOfBirth = new Date(input.dateOfBirth);
      if (input.email !== undefined) updateData.email = input.email;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.address !== undefined) updateData.address = input.address;
      if (input.distributionPercentage !== undefined) updateData.distributionPercentage = input.distributionPercentage.toString();
      if (input.distributionMethod) updateData.distributionMethod = input.distributionMethod;
      if (input.accumulationPercentage !== undefined) updateData.accumulationPercentage = input.accumulationPercentage.toString();
      if (input.spendthriftEnabled !== undefined) updateData.spendthriftEnabled = input.spendthriftEnabled;

      await db.update(houseHeirs).set(updateData).where(eq(houseHeirs.id, input.heirId));

      return {
        success: true,
        heirId: input.heirId,
        message: `Heir ${input.fullName || heir.fullName} updated successfully`,
      };
    }),

  // Remove (deactivate) an heir
  removeHeir: protectedProcedure
    .input(z.object({
      heirId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get existing heir
      const [heir] = await db.select().from(houseHeirs).where(eq(houseHeirs.id, input.heirId));
      if (!heir) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Heir not found" });
      }

      // Check if distribution is locked
      const [lock] = await db.select().from(heirDistributionLocks).where(eq(heirDistributionLocks.houseId, heir.houseId));
      if (lock?.isLocked) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Heir distributions are locked. Cannot remove heirs." 
        });
      }

      // Soft delete - set status to removed
      await db.update(houseHeirs).set({
        status: "removed",
      }).where(eq(houseHeirs.id, input.heirId));

      // Record to blockchain
      const blockchainHash = await recordToBlockchain("heir_removed", input.heirId, {
        heirName: heir.fullName,
        reason: input.reason || "Removed by administrator",
        removedBy: userId,
      });

      return {
        success: true,
        heirId: input.heirId,
        message: `Heir ${heir.fullName} has been removed`,
        blockchainHash,
      };
    }),

  // Get heir distribution summary for dashboard
  getDistributionSummary: protectedProcedure
    .input(z.object({ houseId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      let houseId = input?.houseId;
      if (!houseId) {
        const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
        if (!userHouse.length) {
          return {
            totalHeirs: 0,
            totalDistributed: 0,
            totalAccumulated: 0,
            isLocked: false,
            heirs: [],
          };
        }
        houseId = userHouse[0].id;
      }

      const heirs = await db.select().from(houseHeirs)
        .where(and(eq(houseHeirs.houseId, houseId), eq(houseHeirs.status, "active")));

      const [lock] = await db.select().from(heirDistributionLocks).where(eq(heirDistributionLocks.houseId, houseId));

      const totalDistributed = heirs.reduce((sum, h) => sum + parseFloat(h.totalDistributed || "0"), 0);
      const totalAccumulated = heirs.reduce((sum, h) => sum + parseFloat(h.totalAccumulated || "0"), 0);

      return {
        totalHeirs: heirs.length,
        totalDistributed,
        totalAccumulated,
        isLocked: lock?.isLocked || false,
        heirs: heirs.map(h => ({
          id: h.id,
          name: h.fullName,
          relationship: h.relationship,
          percentage: parseFloat(h.distributionPercentage || "0"),
          vestedPercentage: parseFloat(h.vestedPercentage || "0"),
          vestingStatus: h.vestingStatus,
          totalDistributed: parseFloat(h.totalDistributed || "0"),
          totalAccumulated: parseFloat(h.totalAccumulated || "0"),
        })),
      };
    }),
});
