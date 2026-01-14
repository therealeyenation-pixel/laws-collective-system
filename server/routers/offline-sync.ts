import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  syncQueue,
  activityAuditTrail,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const offlineSyncRouter = router({
  // Queue an operation for offline sync
  queueOperation: protectedProcedure
    .input(
      z.object({
        operationType: z.string(),
        entityType: z.string(),
        entityId: z.number(),
        payload: z.record(z.string(), z.any()),
        priority: z.enum(["low", "normal", "high"]).default("normal"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Create sync queue entry
      const queueEntry = await db.insert(syncQueue).values({
        userId: ctx.user.id,
        operationType: input.operationType,
        data: {
          entityType: input.entityType,
          entityId: input.entityId,
          payload: input.payload,
          priority: input.priority,
        } as any,
        status: "pending",
      });

      const queueId = queueEntry[0].insertId;

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "operation_queued",
        action: "create",
        details: {
          queueId: queueId,
          operationType: input.operationType,
          entityType: input.entityType,
        } as any,
      });

      return {
        queueId: queueId,
        status: "queued",
        synced: false,
      };
    }),

  // Get pending sync operations
  getPendingOperations: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const operations = await db
        .select()
        .from(syncQueue)
        .where(eq(syncQueue.userId, ctx.user.id));

      // Filter pending and failed operations
      const pending = operations
        .filter((op) => op.status === "pending" || op.status === "failed")
        .slice(0, input.limit || 50);

      return pending;
    }),

  // Mark operation as synced
  markAsSynced: protectedProcedure
    .input(
      z.object({
        queueId: z.number(),
        result: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Update queue entry
      await db
        .update(syncQueue)
        .set({
          status: "synced",
          syncedAt: new Date(),
        })
        .where(eq(syncQueue.id, input.queueId));

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "operation_synced",
        action: "update",
        details: {
          queueId: input.queueId,
          result: input.result,
        } as any,
      });

      return {
        queueId: input.queueId,
        status: "synced",
      };
    }),

  // Mark operation as failed
  markAsFailed: protectedProcedure
    .input(
      z.object({
        queueId: z.number(),
        error: z.string().optional(),
        retryable: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get current queue entry
      const entries = await db
        .select()
        .from(syncQueue)
        .where(eq(syncQueue.id, input.queueId));

      if (entries.length === 0) throw new Error("Queue entry not found");
      const entry = entries[0];

      // Determine if we should retry
      const attempts = (entry.retryCount || 0) + 1;
      const maxAttempts = 3;
      const shouldRetry = input.retryable && attempts < maxAttempts;

      // Update queue entry
      await db
        .update(syncQueue)
        .set({
          status: shouldRetry ? "pending" : "failed",
          retryCount: attempts,
          lastError: input.error,
        })
        .where(eq(syncQueue.id, input.queueId));

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "operation_failed",
        action: "update",
        details: {
          queueId: input.queueId,
          error: input.error,
          attempts: attempts,
          shouldRetry: shouldRetry,
        } as any,
      });

      return {
        queueId: input.queueId,
        status: shouldRetry ? "pending" : "failed",
        attempts: attempts,
        shouldRetry: shouldRetry,
      };
    }),

  // Resolve sync conflicts
  resolveConflict: protectedProcedure
    .input(
      z.object({
        queueId: z.number(),
        resolution: z.enum(["local", "remote", "merge"]),
        mergedData: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get queue entry
      const entries = await db
        .select()
        .from(syncQueue)
        .where(eq(syncQueue.id, input.queueId));

      if (entries.length === 0) throw new Error("Queue entry not found");
      const entry = entries[0];

      // Apply resolution
      const entryData = typeof entry.data === "object" ? entry.data : {};
      const updatedData = {
        ...entryData,
        conflictResolution: input.resolution,
        mergedData: input.mergedData,
      };

      // Update queue entry
      await db
        .update(syncQueue)
        .set({
          data: updatedData as any,
          status: "pending",
        })
        .where(eq(syncQueue.id, input.queueId));

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "conflict_resolved",
        action: "update",
        details: {
          queueId: input.queueId,
          resolution: input.resolution,
          mergedData: input.mergedData,
        } as any,
      });

      return {
        queueId: input.queueId,
        resolution: input.resolution,
        status: "resolved",
      };
    }),

  // Get sync statistics
  getSyncStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const operations = await db
      .select()
      .from(syncQueue)
      .where(eq(syncQueue.userId, ctx.user.id));

    const stats = {
      total: operations.length,
      pending: operations.filter((op) => op.status === "pending").length,
      synced: operations.filter((op) => op.status === "synced").length,
      failed: operations.filter((op) => op.status === "failed").length,
      byType: {} as Record<string, number>,
    };

    // Count by operation type
    operations.forEach((op) => {
      if (!stats.byType[op.operationType]) {
        stats.byType[op.operationType] = 0;
      }
      stats.byType[op.operationType]++;
    });

    return stats;
  }),

  // Clear synced operations
  clearSyncedOperations: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Get synced operations
    const operations = await db
      .select()
      .from(syncQueue)
      .where(eq(syncQueue.userId, ctx.user.id));

    const syncedOps = operations.filter((op) => op.status === "synced");
    const count = syncedOps.length;

    // In production, mark as archived instead of deleting
    // For now, we'll just track the count

    // Log to audit trail
    await db.insert(activityAuditTrail).values({
      userId: ctx.user.id,
      activityType: "synced_operations_cleared",
      action: "delete",
      details: {
        count: count,
      } as any,
    });

    return {
      cleared: count,
      status: "cleared",
    };
  }),

  // Batch sync operations
  batchSync: protectedProcedure
    .input(
      z.object({
        queueIds: z.array(z.number()),
        results: z.array(
          z.object({
            queueId: z.number(),
            success: z.boolean(),
            error: z.string().optional(),
            result: z.record(z.string(), z.any()).optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const syncResults = {
        successful: 0,
        failed: 0,
        details: [] as any[],
      };

      // Process each result
      for (const result of input.results) {
        try {
          if (result.success) {
            await db
              .update(syncQueue)
              .set({
                status: "synced",
                syncedAt: new Date(),
              })
              .where(eq(syncQueue.id, result.queueId));

            syncResults.successful++;
            syncResults.details.push({
              queueId: result.queueId,
              status: "synced",
            });
          } else {
            const entries = await db.select().from(syncQueue).where(eq(syncQueue.id, result.queueId));
            const currentEntry = entries.length > 0 ? entries[0] : null;
            const newRetryCount = (currentEntry?.retryCount || 0) + 1;
            await db
              .update(syncQueue)
              .set({
                status: "failed",
                lastError: result.error,
                retryCount: newRetryCount,
              })
              .where(eq(syncQueue.id, result.queueId));

            syncResults.failed++;
            syncResults.details.push({
              queueId: result.queueId,
              status: "failed",
              error: result.error,
            });
          }
        } catch (err) {
          syncResults.failed++;
          syncResults.details.push({
            queueId: result.queueId,
            status: "failed",
            error: String(err),
          });
        }
      }

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "batch_sync_completed",
        action: "update",
        details: {
          successful: syncResults.successful,
          failed: syncResults.failed,
          total: input.results.length,
        } as any,
      });

      return syncResults;
    }),
});
