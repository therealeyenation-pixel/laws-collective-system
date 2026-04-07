/**
 * WebSocket Sync Router
 * Handles real-time synchronization via WebSocket
 */

import { router, protectedProcedure } from "../_core/trpc";
import { websocketSyncService } from "../_core/websocketSync";
import { z } from "zod";

export const websocketSyncRouter = router({
  /**
   * Register client connection
   */
  registerConnection: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const connection = websocketSyncService.registerConnection(
        input.clientId,
        ctx.user.id.toString(),
        ctx.user.name || "Unknown User"
      );

      return {
        clientId: connection.clientId,
        connectedAt: connection.connectedAt,
        isActive: connection.isActive,
      };
    }),

  /**
   * Unregister client connection
   */
  unregisterConnection: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
      })
    )
    .mutation(({ input }) => {
      websocketSyncService.unregisterConnection(input.clientId);
      return { success: true };
    }),

  /**
   * Subscribe to channel
   */
  subscribeToChannel: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        channelId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const success = websocketSyncService.subscribeToChannel(
        input.clientId,
        input.channelId
      );

      return { success };
    }),

  /**
   * Unsubscribe from channel
   */
  unsubscribeFromChannel: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        channelId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const success = websocketSyncService.unsubscribeFromChannel(
        input.clientId,
        input.channelId
      );

      return { success };
    }),

  /**
   * Send message to channel
   */
  sendToChannel: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        type: z.enum([
          "alert_update",
          "collaboration_update",
          "notification_update",
          "workflow_update",
          "health_update",
        ]),
        data: z.record(z.any()),
        priority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
      })
    )
    .mutation(({ input }) => {
      const message = websocketSyncService.sendToChannel(
        input.channelId,
        {
          type: input.type,
          channel: input.channelId,
          data: input.data,
        },
        input.priority
      );

      if (!message) {
        throw new Error("Failed to send message to channel");
      }

      return {
        id: message.id,
        timestamp: message.timestamp,
        priority: message.priority,
      };
    }),

  /**
   * Update heartbeat
   */
  updateHeartbeat: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
      })
    )
    .mutation(({ input }) => {
      websocketSyncService.updateHeartbeat(input.clientId);
      return { success: true };
    }),

  /**
   * Get active connections
   */
  getActiveConnections: protectedProcedure.query(() => {
    const connections = websocketSyncService.getActiveConnections();

    return connections.map((c) => ({
      clientId: c.clientId,
      userId: c.userId,
      userName: c.userName,
      connectedAt: c.connectedAt,
      subscriptionCount: c.subscriptions.size,
    }));
  }),

  /**
   * Get channel subscribers
   */
  getChannelSubscribers: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
      })
    )
    .query(({ input }) => {
      const subscribers = websocketSyncService.getChannelSubscribers(
        input.channelId
      );

      return subscribers.map((s) => ({
        clientId: s.clientId,
        userId: s.userId,
        userName: s.userName,
        connectedAt: s.connectedAt,
      }));
    }),

  /**
   * Get channel message history
   */
  getChannelHistory: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(({ input }) => {
      const history = websocketSyncService.getChannelHistory(
        input.channelId,
        input.limit
      );

      return history.map((m) => ({
        id: m.id,
        type: m.type,
        data: m.data,
        timestamp: m.timestamp,
        priority: m.priority,
      }));
    }),

  /**
   * Get sync statistics
   */
  getStats: protectedProcedure.query(() => {
    return websocketSyncService.getStats();
  }),

  /**
   * Get sync health
   */
  getHealth: protectedProcedure.query(() => {
    const stats = websocketSyncService.getStats();

    return {
      status:
        stats.activeConnections > 0 && stats.totalChannels > 0
          ? "healthy"
          : "idle",
      activeConnections: stats.activeConnections,
      totalChannels: stats.totalChannels,
      totalMessages: stats.totalMessages,
      averageMessagesPerChannel: stats.averageMessagesPerChannel,
      timestamp: new Date(),
    };
  }),

  /**
   * Broadcast system message
   */
  broadcastSystemMessage: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        data: z.record(z.any()).optional(),
        priority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
      })
    )
    .mutation(({ input }) => {
      const message = websocketSyncService.broadcastMessage(
        {
          type: "health_update",
          channel: "system",
          data: {
            title: input.title,
            body: input.body,
            ...input.data,
          },
        },
        input.priority
      );

      return {
        id: message.id,
        timestamp: message.timestamp,
        broadcastTo: websocketSyncService.getStats().activeConnections,
      };
    }),

  /**
   * Get connection details
   */
  getConnectionDetails: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
      })
    )
    .query(({ input }) => {
      const connections = websocketSyncService.getActiveConnections();
      const connection = connections.find((c) => c.clientId === input.clientId);

      if (!connection) {
        return null;
      }

      return {
        clientId: connection.clientId,
        userId: connection.userId,
        userName: connection.userName,
        connectedAt: connection.connectedAt,
        lastHeartbeat: connection.lastHeartbeat,
        subscriptions: Array.from(connection.subscriptions),
        isActive: connection.isActive,
      };
    }),

  /**
   * Get sync metrics
   */
  getMetrics: protectedProcedure.query(() => {
    const stats = websocketSyncService.getStats();

    return {
      activeConnections: stats.activeConnections,
      totalChannels: stats.totalChannels,
      totalMessages: stats.totalMessages,
      averageMessagesPerChannel: stats.averageMessagesPerChannel.toFixed(2),
      connectionsByUser: Array.from(stats.connectionsByUser.entries()).map(
        ([userId, count]) => ({
          userId,
          connectionCount: count,
        })
      ),
      timestamp: new Date(),
    };
  }),
});
