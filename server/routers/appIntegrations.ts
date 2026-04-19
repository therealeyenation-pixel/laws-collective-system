import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { availableApps, userAppConnections, appIntegrationLogs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { db } from "../db";

export const appIntegrationsRouter = router({
  /**
   * List all available apps in the store
   */
  listAvailableApps: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const query = db.select().from(availableApps).where(eq(availableApps.isActive, true));
      const apps = await query;
      return apps;
    }),

  /**
   * Get a specific app details
   */
  getApp: publicProcedure
    .input(z.object({ appId: z.number() }))
    .query(async ({ input }) => {
      const app = await db
        .select()
        .from(availableApps)
        .where(eq(availableApps.id, input.appId))
        .limit(1);
      return app[0] || null;
    }),

  /**
   * Get user's connected apps
   */
  getUserConnections: protectedProcedure.query(async ({ ctx }) => {
    const connections = await db
      .select({
        id: userAppConnections.id,
        appId: userAppConnections.appId,
        status: userAppConnections.status,
        metadata: userAppConnections.metadata,
        lastSyncedAt: userAppConnections.lastSyncedAt,
        connectedAt: userAppConnections.connectedAt,
        app: {
          id: availableApps.id,
          name: availableApps.name,
          slug: availableApps.slug,
          logoUrl: availableApps.logoUrl,
          category: availableApps.category,
        },
      })
      .from(userAppConnections)
      .innerJoin(availableApps, eq(userAppConnections.appId, availableApps.id))
      .where(eq(userAppConnections.userId, ctx.user.id));

    return connections;
  }),

  /**
   * Connect an app (initiate connection flow)
   */
  connectApp: protectedProcedure
    .input(
      z.object({
        appId: z.number(),
        credentials: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if already connected
      const existing = await db
        .select()
        .from(userAppConnections)
        .where(
          and(
            eq(userAppConnections.userId, ctx.user.id),
            eq(userAppConnections.appId, input.appId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new Error("App already connected");
      }

      // Create connection record
      const connection = await db.insert(userAppConnections).values({
        userId: ctx.user.id,
        appId: input.appId,
        status: "connected",
        metadata: input.credentials || {},
        connectedAt: new Date(),
      });

      // Log the action
      await db.insert(appIntegrationLogs).values({
        userId: ctx.user.id,
        appId: input.appId,
        action: "connected",
        details: { method: "manual" },
      });

      return { success: true, connectionId: connection[0] };
    }),

  /**
   * Disconnect an app
   */
  disconnectApp: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const connection = await db
        .select()
        .from(userAppConnections)
        .where(eq(userAppConnections.id, input.connectionId))
        .limit(1);

      if (!connection.length || connection[0].userId !== ctx.user.id) {
        throw new Error("Connection not found or unauthorized");
      }

      // Update status to disconnected
      await db
        .update(userAppConnections)
        .set({ status: "disconnected", updatedAt: new Date() })
        .where(eq(userAppConnections.id, input.connectionId));

      // Log the action
      await db.insert(appIntegrationLogs).values({
        userId: ctx.user.id,
        appId: connection[0].appId,
        action: "disconnected",
        details: {},
      });

      return { success: true };
    }),

  /**
   * Get connection status
   */
  getConnectionStatus: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const connection = await db
        .select()
        .from(userAppConnections)
        .where(eq(userAppConnections.id, input.connectionId))
        .limit(1);

      if (!connection.length || connection[0].userId !== ctx.user.id) {
        return null;
      }

      return connection[0];
    }),

  /**
   * Update connection metadata (e.g., after OAuth callback)
   */
  updateConnectionMetadata: protectedProcedure
    .input(
      z.object({
        connectionId: z.number(),
        metadata: z.record(z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const connection = await db
        .select()
        .from(userAppConnections)
        .where(eq(userAppConnections.id, input.connectionId))
        .limit(1);

      if (!connection.length || connection[0].userId !== ctx.user.id) {
        throw new Error("Connection not found or unauthorized");
      }

      await db
        .update(userAppConnections)
        .set({
          metadata: input.metadata,
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userAppConnections.id, input.connectionId));

      return { success: true };
    }),

  /**
   * Get integration logs for a user
   */
  getIntegrationLogs: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input, ctx }) => {
      const logs = await db
        .select()
        .from(appIntegrationLogs)
        .where(eq(appIntegrationLogs.userId, ctx.user.id))
        .orderBy(appIntegrationLogs.createdAt)
        .limit(input.limit);

      return logs;
    }),
});
