import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getPendingOperations,
  syncAllPending,
  getSyncStatus,
  queueOperation,
} from "../_core/offlineSync";
import { runHealthCheck, getSystemDiagnostics } from "../_core/autoUpdate";

export const systemRouter = router({
  /**
   * Get sync status for current user
   */
  getSyncStatus: protectedProcedure.query(async ({ ctx }) => {
    return await getSyncStatus(ctx.user.id);
  }),

  /**
   * Get pending sync operations
   */
  getPendingOperations: protectedProcedure.query(async ({ ctx }) => {
    return await getPendingOperations(ctx.user.id);
  }),

  /**
   * Sync all pending operations
   */
  syncAll: protectedProcedure.mutation(async ({ ctx }) => {
    return await syncAllPending(ctx.user.id);
  }),

  /**
   * Queue an operation for offline sync
   */
  queueOperation: protectedProcedure
    .input(
      z.object({
        type: z.enum(["create", "update", "delete"]),
        entity: z.enum(["emergency", "conference", "media"]),
        entityId: z.number(),
        data: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await queueOperation(
        ctx.user.id,
        input.type,
        input.entity,
        input.entityId,
        input.data
      );
    }),

  /**
   * Get system health status
   */
  getHealth: protectedProcedure.query(async () => {
    return await runHealthCheck();
  }),

  /**
   * Get full system diagnostics
   */
  getDiagnostics: protectedProcedure.query(async () => {
    return await getSystemDiagnostics();
  }),

  /**
   * Get system status summary
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const syncStatus = await getSyncStatus(ctx.user.id);
    const health = await runHealthCheck();

    return {
      sync: syncStatus,
      health: health.status,
      isOnline: syncStatus.isOnline,
      timestamp: new Date(),
    };
  }),
});
