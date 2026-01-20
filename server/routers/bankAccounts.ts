import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { workerBankAccounts, timekeepingWorkers } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Bank Accounts Router
 * Manage worker bank accounts for direct deposit
 */
export const bankAccountsRouter = router({
  /**
   * List bank accounts for a worker
   */
  listByWorker: protectedProcedure
    .input(z.object({
      workerId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const accounts = await db.select()
        .from(workerBankAccounts)
        .where(eq(workerBankAccounts.workerId, input.workerId))
        .orderBy(workerBankAccounts.priority);

      // Mask account numbers for display
      return accounts.map(acc => ({
        ...acc,
        accountNumberMasked: `****${acc.accountNumber.slice(-4)}`,
      }));
    }),

  /**
   * Get all bank accounts with worker info
   */
  listAll: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const accounts = await db.select({
      account: workerBankAccounts,
      worker: {
        id: timekeepingWorkers.id,
        firstName: timekeepingWorkers.firstName,
        lastName: timekeepingWorkers.lastName,
        email: timekeepingWorkers.email,
      }
    })
    .from(workerBankAccounts)
    .leftJoin(timekeepingWorkers, eq(workerBankAccounts.workerId, timekeepingWorkers.id))
    .where(eq(workerBankAccounts.isActive, true))
    .orderBy(desc(workerBankAccounts.createdAt));

    return accounts.map(({ account, worker }) => ({
      ...account,
      accountNumberMasked: `****${account.accountNumber.slice(-4)}`,
      workerName: worker ? `${worker.firstName} ${worker.lastName}` : "Unknown",
      workerEmail: worker?.email || "",
    }));
  }),

  /**
   * Add a new bank account
   */
  create: protectedProcedure
    .input(z.object({
      workerId: z.number(),
      accountName: z.string().min(1).max(100),
      bankName: z.string().min(1).max(100),
      routingNumber: z.string().length(9).regex(/^\d{9}$/, "Routing number must be 9 digits"),
      accountNumber: z.string().min(4).max(17).regex(/^\d+$/, "Account number must be numeric"),
      accountType: z.enum(["checking", "savings"]).default("checking"),
      depositType: z.enum(["full", "fixed", "percentage"]).default("full"),
      depositAmount: z.string().optional(),
      isPrimary: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // If setting as primary, unset other primary accounts
      if (input.isPrimary) {
        await db.update(workerBankAccounts)
          .set({ isPrimary: false })
          .where(eq(workerBankAccounts.workerId, input.workerId));
      }

      // Get next priority
      const existing = await db.select()
        .from(workerBankAccounts)
        .where(eq(workerBankAccounts.workerId, input.workerId));
      const nextPriority = existing.length + 1;

      const result = await db.insert(workerBankAccounts).values({
        workerId: input.workerId,
        accountName: input.accountName,
        bankName: input.bankName,
        routingNumber: input.routingNumber,
        accountNumber: input.accountNumber,
        accountType: input.accountType,
        depositType: input.depositType,
        depositAmount: input.depositAmount,
        priority: nextPriority,
        isPrimary: input.isPrimary || existing.length === 0, // First account is primary
        isActive: true,
      });

      return {
        success: true,
        id: result[0].insertId,
        message: "Bank account added successfully",
      };
    }),

  /**
   * Update a bank account
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      accountName: z.string().min(1).max(100).optional(),
      bankName: z.string().min(1).max(100).optional(),
      depositType: z.enum(["full", "fixed", "percentage"]).optional(),
      depositAmount: z.string().optional(),
      isPrimary: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const { id, ...updates } = input;

      // Get current account
      const [current] = await db.select()
        .from(workerBankAccounts)
        .where(eq(workerBankAccounts.id, id));

      if (!current) {
        throw new Error("Bank account not found");
      }

      // If setting as primary, unset other primary accounts
      if (updates.isPrimary) {
        await db.update(workerBankAccounts)
          .set({ isPrimary: false })
          .where(eq(workerBankAccounts.workerId, current.workerId));
      }

      await db.update(workerBankAccounts)
        .set(updates)
        .where(eq(workerBankAccounts.id, id));

      return {
        success: true,
        message: "Bank account updated successfully",
      };
    }),

  /**
   * Delete (deactivate) a bank account
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(workerBankAccounts)
        .set({ isActive: false })
        .where(eq(workerBankAccounts.id, input.id));

      return {
        success: true,
        message: "Bank account removed",
      };
    }),

  /**
   * Validate routing number (basic ABA validation)
   */
  validateRouting: protectedProcedure
    .input(z.object({
      routingNumber: z.string(),
    }))
    .query(async ({ input }) => {
      const { routingNumber } = input;
      
      if (routingNumber.length !== 9 || !/^\d{9}$/.test(routingNumber)) {
        return { valid: false, message: "Routing number must be 9 digits" };
      }

      // ABA checksum validation
      const digits = routingNumber.split("").map(Number);
      const checksum = 
        3 * (digits[0] + digits[3] + digits[6]) +
        7 * (digits[1] + digits[4] + digits[7]) +
        1 * (digits[2] + digits[5] + digits[8]);

      if (checksum % 10 !== 0) {
        return { valid: false, message: "Invalid routing number checksum" };
      }

      return { valid: true, message: "Valid routing number" };
    }),

  /**
   * Get workers without bank accounts (for setup reminders)
   */
  getWorkersWithoutAccounts: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Get all active workers
    const workers = await db.select()
      .from(timekeepingWorkers)
      .where(eq(timekeepingWorkers.status, "active"));

    // Get workers with bank accounts
    const accountWorkerIds = await db.select({ workerId: workerBankAccounts.workerId })
      .from(workerBankAccounts)
      .where(eq(workerBankAccounts.isActive, true));

    const workerIdsWithAccounts = new Set(accountWorkerIds.map(a => a.workerId));

    return workers.filter(w => !workerIdsWithAccounts.has(w.id));
  }),
});
