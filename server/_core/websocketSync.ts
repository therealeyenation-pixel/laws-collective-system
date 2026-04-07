/**
 * WebSocket Real-time Synchronization Service
 * Handles Socket.io connections and real-time data sync
 */

import { EventEmitter } from "events";

interface ClientConnection {
  clientId: string;
  userId: string;
  userName: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  subscriptions: Set<string>;
  isActive: boolean;
}

interface SyncMessage {
  id: string;
  type:
    | "alert_update"
    | "collaboration_update"
    | "notification_update"
    | "workflow_update"
    | "health_update"
    | "heartbeat";
  channel: string;
  data: Record<string, any>;
  timestamp: Date;
  priority: "low" | "normal" | "high" | "critical";
}

interface ChannelSubscription {
  channelId: string;
  subscribers: Set<string>;
  messageBuffer: SyncMessage[];
  maxBufferSize: number;
}

class WebSocketSyncService extends EventEmitter {
  private connections: Map<string, ClientConnection> = new Map();
  private channels: Map<string, ChannelSubscription> = new Map();
  private messageQueue: SyncMessage[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private maxQueueSize = 5000;
  private heartbeatTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
    this.startHeartbeatMonitoring();
  }

  /**
   * Register client connection
   */
  registerConnection(
    clientId: string,
    userId: string,
    userName: string
  ): ClientConnection {
    const connection: ClientConnection = {
      clientId,
      userId,
      userName,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
      subscriptions: new Set(),
      isActive: true,
    };

    this.connections.set(clientId, connection);

    this.broadcastMessage({
      type: "collaboration_update",
      channel: "system",
      data: {
        event: "user_connected",
        userId,
        userName,
        clientId,
      },
    });

    return connection;
  }

  /**
   * Unregister client connection
   */
  unregisterConnection(clientId: string): void {
    const connection = this.connections.get(clientId);

    if (connection) {
      connection.isActive = false;

      // Remove from all subscriptions
      for (const [, channel] of this.channels) {
        channel.subscribers.delete(clientId);
      }

      this.connections.delete(clientId);

      this.broadcastMessage({
        type: "collaboration_update",
        channel: "system",
        data: {
          event: "user_disconnected",
          userId: connection.userId,
          userName: connection.userName,
          clientId,
        },
      });
    }
  }

  /**
   * Subscribe client to channel
   */
  subscribeToChannel(clientId: string, channelId: string): boolean {
    const connection = this.connections.get(clientId);

    if (!connection) {
      return false;
    }

    connection.subscriptions.add(channelId);

    let channel = this.channels.get(channelId);
    if (!channel) {
      channel = {
        channelId,
        subscribers: new Set(),
        messageBuffer: [],
        maxBufferSize: 100,
      };
      this.channels.set(channelId, channel);
    }

    channel.subscribers.add(clientId);

    return true;
  }

  /**
   * Unsubscribe client from channel
   */
  unsubscribeFromChannel(clientId: string, channelId: string): boolean {
    const connection = this.connections.get(clientId);

    if (!connection) {
      return false;
    }

    connection.subscriptions.delete(channelId);

    const channel = this.channels.get(channelId);
    if (channel) {
      channel.subscribers.delete(clientId);

      // Clean up empty channels
      if (channel.subscribers.size === 0) {
        this.channels.delete(channelId);
      }
    }

    return true;
  }

  /**
   * Broadcast message to all subscribers
   */
  broadcastMessage(
    message: Omit<SyncMessage, "id" | "timestamp" | "priority">,
    priority: "low" | "normal" | "high" | "critical" = "normal"
  ): SyncMessage {
    const syncMessage: SyncMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      priority,
      ...message,
    };

    this.messageQueue.push(syncMessage);

    // Keep queue manageable
    if (this.messageQueue.length > this.maxQueueSize) {
      this.messageQueue = this.messageQueue.slice(-this.maxQueueSize);
    }

    // Store in channel buffer
    const channel = this.channels.get(message.channel);
    if (channel) {
      channel.messageBuffer.push(syncMessage);

      if (channel.messageBuffer.length > channel.maxBufferSize) {
        channel.messageBuffer = channel.messageBuffer.slice(
          -channel.maxBufferSize
        );
      }
    }

    this.emit("message_broadcast", syncMessage);
    return syncMessage;
  }

  /**
   * Send message to specific client
   */
  sendToClient(
    clientId: string,
    message: Omit<SyncMessage, "id" | "timestamp" | "priority">,
    priority: "low" | "normal" | "high" | "critical" = "normal"
  ): SyncMessage | null {
    const connection = this.connections.get(clientId);

    if (!connection || !connection.isActive) {
      return null;
    }

    const syncMessage: SyncMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      priority,
      ...message,
    };

    this.emit("message_to_client", { clientId, message: syncMessage });
    return syncMessage;
  }

  /**
   * Send message to channel subscribers
   */
  sendToChannel(
    channelId: string,
    message: Omit<SyncMessage, "id" | "timestamp" | "priority" | "channel">,
    priority: "low" | "normal" | "high" | "critical" = "normal"
  ): SyncMessage | null {
    const channel = this.channels.get(channelId);

    if (!channel || channel.subscribers.size === 0) {
      return null;
    }

    const syncMessage: SyncMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      priority,
      channel: channelId,
      ...message,
    };

    channel.messageBuffer.push(syncMessage);
    if (channel.messageBuffer.length > channel.maxBufferSize) {
      channel.messageBuffer = channel.messageBuffer.slice(
        -channel.maxBufferSize
      );
    }

    this.emit("message_to_channel", { channelId, message: syncMessage });
    return syncMessage;
  }

  /**
   * Update client heartbeat
   */
  updateHeartbeat(clientId: string): void {
    const connection = this.connections.get(clientId);

    if (connection) {
      connection.lastHeartbeat = new Date();
    }
  }

  /**
   * Get active connections
   */
  getActiveConnections(): ClientConnection[] {
    return Array.from(this.connections.values()).filter((c) => c.isActive);
  }

  /**
   * Get channel subscribers
   */
  getChannelSubscribers(channelId: string): ClientConnection[] {
    const channel = this.channels.get(channelId);

    if (!channel) {
      return [];
    }

    const subscribers: ClientConnection[] = [];

    for (const clientId of channel.subscribers) {
      const connection = this.connections.get(clientId);
      if (connection && connection.isActive) {
        subscribers.push(connection);
      }
    }

    return subscribers;
  }

  /**
   * Get channel message history
   */
  getChannelHistory(channelId: string, limit: number = 50): SyncMessage[] {
    const channel = this.channels.get(channelId);

    if (!channel) {
      return [];
    }

    return channel.messageBuffer.slice(-limit);
  }

  /**
   * Get sync statistics
   */
  getStats(): {
    activeConnections: number;
    totalChannels: number;
    totalMessages: number;
    averageMessagesPerChannel: number;
    connectionsByUser: Map<string, number>;
  } {
    const activeConnections = this.getActiveConnections().length;
    const connectionsByUser = new Map<string, number>();

    for (const connection of this.getActiveConnections()) {
      const count = connectionsByUser.get(connection.userId) || 0;
      connectionsByUser.set(connection.userId, count + 1);
    }

    const averageMessagesPerChannel =
      this.channels.size > 0
        ? Array.from(this.channels.values()).reduce(
            (sum, c) => sum + c.messageBuffer.length,
            0
          ) / this.channels.size
        : 0;

    return {
      activeConnections,
      totalChannels: this.channels.size,
      totalMessages: this.messageQueue.length,
      averageMessagesPerChannel,
      connectionsByUser,
    };
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();

      for (const [clientId, connection] of this.connections) {
        if (
          now.getTime() - connection.lastHeartbeat.getTime() >
          this.heartbeatTimeout
        ) {
          this.unregisterConnection(clientId);
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.connections.clear();
    this.channels.clear();
    this.messageQueue = [];
  }

  /**
   * Shutdown service
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clear();
    this.removeAllListeners();
  }
}

export const websocketSyncService = new WebSocketSyncService();
