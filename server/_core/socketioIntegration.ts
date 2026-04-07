/**
 * Socket.io Integration Service
 * Real-time bidirectional communication for all systems
 */

import { EventEmitter } from "events";

interface SocketClient {
  socketId: string;
  userId: string;
  userName: string;
  connectedAt: Date;
  rooms: Set<string>;
  isConnected: boolean;
}

interface SocketMessage {
  id: string;
  from: string;
  to: string | string[];
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
}

class SocketioIntegrationService extends EventEmitter {
  private clients: Map<string, SocketClient> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private messageHistory: SocketMessage[] = [];
  private maxHistorySize = 10000;

  constructor() {
    super();
  }

  /**
   * Register socket client
   */
  registerClient(
    socketId: string,
    userId: string,
    userName: string
  ): SocketClient {
    const client: SocketClient = {
      socketId,
      userId,
      userName,
      connectedAt: new Date(),
      rooms: new Set(),
      isConnected: true,
    };

    this.clients.set(socketId, client);
    this.emit("client_connected", client);

    return client;
  }

  /**
   * Unregister socket client
   */
  unregisterClient(socketId: string): void {
    const client = this.clients.get(socketId);

    if (client) {
      client.isConnected = false;

      // Remove from all rooms
      for (const room of client.rooms) {
        this.leaveRoom(socketId, room);
      }

      this.clients.delete(socketId);
      this.emit("client_disconnected", client);
    }
  }

  /**
   * Join room
   */
  joinRoom(socketId: string, roomId: string): boolean {
    const client = this.clients.get(socketId);

    if (!client) {
      return false;
    }

    client.rooms.add(roomId);

    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Set();
      this.rooms.set(roomId, room);
    }

    room.add(socketId);

    this.broadcastToRoom(roomId, {
      type: "user_joined",
      data: {
        userId: client.userId,
        userName: client.userName,
        socketId,
      },
    });

    return true;
  }

  /**
   * Leave room
   */
  leaveRoom(socketId: string, roomId: string): boolean {
    const client = this.clients.get(socketId);

    if (!client) {
      return false;
    }

    client.rooms.delete(roomId);

    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(socketId);

      if (room.size === 0) {
        this.rooms.delete(roomId);
      } else {
        this.broadcastToRoom(roomId, {
          type: "user_left",
          data: {
            userId: client.userId,
            userName: client.userName,
            socketId,
          },
        });
      }
    }

    return true;
  }

  /**
   * Send message to specific client
   */
  sendToClient(
    fromSocketId: string,
    toSocketId: string,
    type: string,
    data: Record<string, any>
  ): SocketMessage {
    const message: SocketMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: fromSocketId,
      to: toSocketId,
      type,
      data,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
    }

    this.emit("message_to_client", { toSocketId, message });
    return message;
  }

  /**
   * Broadcast to room
   */
  broadcastToRoom(
    roomId: string,
    message: Omit<SocketMessage, "id" | "from" | "to" | "timestamp" | "acknowledged">,
    excludeSocketId?: string
  ): SocketMessage[] {
    const room = this.rooms.get(roomId);

    if (!room || room.size === 0) {
      return [];
    }

    const messages: SocketMessage[] = [];

    for (const socketId of room) {
      if (excludeSocketId && socketId === excludeSocketId) {
        continue;
      }

      const msg: SocketMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from: "system",
        to: socketId,
        type: message.type,
        data: message.data,
        timestamp: new Date(),
        acknowledged: false,
      };

      this.messageHistory.push(msg);
      messages.push(msg);

      this.emit("message_to_client", { toSocketId: socketId, message: msg });
    }

    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
    }

    return messages;
  }

  /**
   * Broadcast to all clients
   */
  broadcastToAll(
    type: string,
    data: Record<string, any>,
    excludeSocketId?: string
  ): SocketMessage[] {
    const messages: SocketMessage[] = [];

    for (const [socketId] of this.clients) {
      if (excludeSocketId && socketId === excludeSocketId) {
        continue;
      }

      const msg: SocketMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from: "system",
        to: socketId,
        type,
        data,
        timestamp: new Date(),
        acknowledged: false,
      };

      this.messageHistory.push(msg);
      messages.push(msg);

      this.emit("message_to_client", { toSocketId: socketId, message: msg });
    }

    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
    }

    return messages;
  }

  /**
   * Get room members
   */
  getRoomMembers(roomId: string): SocketClient[] {
    const room = this.rooms.get(roomId);

    if (!room) {
      return [];
    }

    const members: SocketClient[] = [];

    for (const socketId of room) {
      const client = this.clients.get(socketId);
      if (client && client.isConnected) {
        members.push(client);
      }
    }

    return members;
  }

  /**
   * Get client info
   */
  getClient(socketId: string): SocketClient | null {
    return this.clients.get(socketId) || null;
  }

  /**
   * Get all connected clients
   */
  getConnectedClients(): SocketClient[] {
    return Array.from(this.clients.values()).filter((c) => c.isConnected);
  }

  /**
   * Acknowledge message
   */
  acknowledgeMessage(messageId: string): boolean {
    const message = this.messageHistory.find((m) => m.id === messageId);

    if (message) {
      message.acknowledged = true;
      return true;
    }

    return false;
  }

  /**
   * Get message history
   */
  getMessageHistory(
    roomId?: string,
    limit: number = 100
  ): SocketMessage[] {
    let history = this.messageHistory;

    if (roomId) {
      history = history.filter(
        (m) =>
          (typeof m.to === "string" && m.to === roomId) ||
          (Array.isArray(m.to) && m.to.includes(roomId))
      );
    }

    return history.slice(-limit);
  }

  /**
   * Get statistics
   */
  getStats(): {
    connectedClients: number;
    totalRooms: number;
    totalMessages: number;
    averageClientsPerRoom: number;
  } {
    const connectedClients = this.getConnectedClients().length;
    const totalRooms = this.rooms.size;
    const averageClientsPerRoom =
      totalRooms > 0
        ? Array.from(this.rooms.values()).reduce((sum, r) => sum + r.size, 0) /
          totalRooms
        : 0;

    return {
      connectedClients,
      totalRooms,
      totalMessages: this.messageHistory.length,
      averageClientsPerRoom,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.clients.clear();
    this.rooms.clear();
    this.messageHistory = [];
  }

  /**
   * Shutdown service
   */
  shutdown(): void {
    this.clear();
    this.removeAllListeners();
  }
}

export const socketioIntegrationService = new SocketioIntegrationService();
