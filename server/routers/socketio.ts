/**
 * Socket.io Router
 * Handles real-time bidirectional communication
 */

import { router, protectedProcedure } from "../_core/trpc";
import { socketioIntegrationService } from "../_core/socketioIntegration";
import { z } from "zod";

export const socketioRouter = router({
  /**
   * Register socket connection
   */
  registerSocket: protectedProcedure
    .input(
      z.object({
        socketId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const client = socketioIntegrationService.registerClient(
        input.socketId,
        ctx.user.id.toString(),
        ctx.user.name || "Unknown User"
      );

      return {
        socketId: client.socketId,
        userId: client.userId,
        userName: client.userName,
        connectedAt: client.connectedAt,
      };
    }),

  /**
   * Unregister socket connection
   */
  unregisterSocket: protectedProcedure
    .input(
      z.object({
        socketId: z.string(),
      })
    )
    .mutation(({ input }) => {
      socketioIntegrationService.unregisterClient(input.socketId);
      return { success: true };
    }),

  /**
   * Join room
   */
  joinRoom: protectedProcedure
    .input(
      z.object({
        socketId: z.string(),
        roomId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const success = socketioIntegrationService.joinRoom(
        input.socketId,
        input.roomId
      );

      return { success };
    }),

  /**
   * Leave room
   */
  leaveRoom: protectedProcedure
    .input(
      z.object({
        socketId: z.string(),
        roomId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const success = socketioIntegrationService.leaveRoom(
        input.socketId,
        input.roomId
      );

      return { success };
    }),

  /**
   * Send message to client
   */
  sendToClient: protectedProcedure
    .input(
      z.object({
        fromSocketId: z.string(),
        toSocketId: z.string(),
        type: z.string(),
        data: z.record(z.any()),
      })
    )
    .mutation(({ input }) => {
      const message = socketioIntegrationService.sendToClient(
        input.fromSocketId,
        input.toSocketId,
        input.type,
        input.data
      );

      return {
        id: message.id,
        timestamp: message.timestamp,
      };
    }),

  /**
   * Broadcast to room
   */
  broadcastToRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        type: z.string(),
        data: z.record(z.any()),
        excludeSocketId: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const messages = socketioIntegrationService.broadcastToRoom(
        input.roomId,
        {
          type: input.type,
          data: input.data,
        },
        input.excludeSocketId
      );

      return {
        messageCount: messages.length,
        messages: messages.map((m) => ({
          id: m.id,
          timestamp: m.timestamp,
        })),
      };
    }),

  /**
   * Broadcast to all clients
   */
  broadcastToAll: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        data: z.record(z.any()),
        excludeSocketId: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const messages = socketioIntegrationService.broadcastToAll(
        input.type,
        input.data,
        input.excludeSocketId
      );

      return {
        messageCount: messages.length,
        broadcastTo: socketioIntegrationService.getStats().connectedClients,
      };
    }),

  /**
   * Get room members
   */
  getRoomMembers: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      })
    )
    .query(({ input }) => {
      const members = socketioIntegrationService.getRoomMembers(input.roomId);

      return members.map((m) => ({
        socketId: m.socketId,
        userId: m.userId,
        userName: m.userName,
        connectedAt: m.connectedAt,
        roomCount: m.rooms.size,
      }));
    }),

  /**
   * Get connected clients
   */
  getConnectedClients: protectedProcedure.query(() => {
    const clients = socketioIntegrationService.getConnectedClients();

    return clients.map((c) => ({
      socketId: c.socketId,
      userId: c.userId,
      userName: c.userName,
      connectedAt: c.connectedAt,
      rooms: Array.from(c.rooms),
    }));
  }),

  /**
   * Get message history
   */
  getMessageHistory: protectedProcedure
    .input(
      z.object({
        roomId: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .query(({ input }) => {
      const history = socketioIntegrationService.getMessageHistory(
        input.roomId,
        input.limit
      );

      return history.map((m) => ({
        id: m.id,
        from: m.from,
        type: m.type,
        data: m.data,
        timestamp: m.timestamp,
        acknowledged: m.acknowledged,
      }));
    }),

  /**
   * Acknowledge message
   */
  acknowledgeMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const success = socketioIntegrationService.acknowledgeMessage(
        input.messageId
      );

      return { success };
    }),

  /**
   * Get socket statistics
   */
  getStats: protectedProcedure.query(() => {
    return socketioIntegrationService.getStats();
  }),

  /**
   * Get socket health
   */
  getHealth: protectedProcedure.query(() => {
    const stats = socketioIntegrationService.getStats();

    return {
      status:
        stats.connectedClients > 0 && stats.totalRooms > 0
          ? "healthy"
          : "idle",
      connectedClients: stats.connectedClients,
      totalRooms: stats.totalRooms,
      totalMessages: stats.totalMessages,
      averageClientsPerRoom: stats.averageClientsPerRoom.toFixed(2),
      timestamp: new Date(),
    };
  }),
});
