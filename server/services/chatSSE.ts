import { Response } from "express";

// Types for SSE events
export type ChatEventType = 
  | "message" 
  | "typing" 
  | "presence" 
  | "read" 
  | "reaction"
  | "connected"
  | "heartbeat";

export interface ChatEvent {
  type: ChatEventType;
  chatId?: number;
  data: Record<string, unknown>;
  timestamp: number;
}

// Store connected clients by user ID
const connectedClients = new Map<number, Set<Response>>();

// Store typing status by chat ID
const typingUsers = new Map<number, Set<number>>();

/**
 * Add a client connection for a user
 */
export function addClient(userId: number, res: Response): void {
  if (!connectedClients.has(userId)) {
    connectedClients.set(userId, new Set());
  }
  connectedClients.get(userId)!.add(res);
  
  // Send connected event
  sendEventToClient(res, {
    type: "connected",
    data: { userId, connectedAt: Date.now() },
    timestamp: Date.now(),
  });
}

/**
 * Remove a client connection
 */
export function removeClient(userId: number, res: Response): void {
  const clients = connectedClients.get(userId);
  if (clients) {
    clients.delete(res);
    if (clients.size === 0) {
      connectedClients.delete(userId);
    }
  }
}

/**
 * Check if a user is connected
 */
export function isUserConnected(userId: number): boolean {
  const clients = connectedClients.get(userId);
  return clients !== undefined && clients.size > 0;
}

/**
 * Get count of connected users
 */
export function getConnectedUserCount(): number {
  return connectedClients.size;
}

/**
 * Send an event to a specific client
 */
function sendEventToClient(res: Response, event: ChatEvent): void {
  try {
    const data = JSON.stringify(event);
    res.write(`data: ${data}\n\n`);
  } catch (error) {
    // Client might be disconnected
    console.error("Error sending SSE event:", error);
  }
}

/**
 * Send an event to a specific user (all their connections)
 */
export function sendEventToUser(userId: number, event: ChatEvent): void {
  const clients = connectedClients.get(userId);
  if (clients) {
    clients.forEach((res) => sendEventToClient(res, event));
  }
}

/**
 * Send an event to multiple users
 */
export function sendEventToUsers(userIds: number[], event: ChatEvent): void {
  userIds.forEach((userId) => sendEventToUser(userId, event));
}

/**
 * Broadcast a new message to all participants in a chat
 */
export function broadcastMessage(
  chatId: number,
  participantIds: number[],
  message: {
    id: number;
    senderId: number;
    senderName: string;
    content: string;
    contentType: string;
    createdAt: Date;
  }
): void {
  const event: ChatEvent = {
    type: "message",
    chatId,
    data: {
      id: message.id,
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content,
      contentType: message.contentType,
      createdAt: message.createdAt.toISOString(),
    },
    timestamp: Date.now(),
  };
  
  sendEventToUsers(participantIds, event);
}

/**
 * Broadcast typing indicator
 */
export function broadcastTyping(
  chatId: number,
  participantIds: number[],
  userId: number,
  userName: string,
  isTyping: boolean
): void {
  // Update typing status
  if (!typingUsers.has(chatId)) {
    typingUsers.set(chatId, new Set());
  }
  
  const chatTyping = typingUsers.get(chatId)!;
  if (isTyping) {
    chatTyping.add(userId);
  } else {
    chatTyping.delete(userId);
  }
  
  const event: ChatEvent = {
    type: "typing",
    chatId,
    data: {
      userId,
      userName,
      isTyping,
      typingUsers: Array.from(chatTyping),
    },
    timestamp: Date.now(),
  };
  
  // Send to all participants except the typing user
  sendEventToUsers(
    participantIds.filter((id) => id !== userId),
    event
  );
}

/**
 * Broadcast presence update
 */
export function broadcastPresence(
  userId: number,
  userName: string,
  status: "online" | "away" | "busy" | "offline",
  contactIds: number[]
): void {
  const event: ChatEvent = {
    type: "presence",
    data: {
      userId,
      userName,
      status,
    },
    timestamp: Date.now(),
  };
  
  sendEventToUsers(contactIds, event);
}

/**
 * Broadcast read receipt
 */
export function broadcastReadReceipt(
  chatId: number,
  participantIds: number[],
  userId: number,
  lastReadMessageId: number
): void {
  const event: ChatEvent = {
    type: "read",
    chatId,
    data: {
      userId,
      lastReadMessageId,
    },
    timestamp: Date.now(),
  };
  
  sendEventToUsers(participantIds, event);
}

/**
 * Broadcast reaction update
 */
export function broadcastReaction(
  chatId: number,
  participantIds: number[],
  messageId: number,
  userId: number,
  emoji: string,
  action: "add" | "remove"
): void {
  const event: ChatEvent = {
    type: "reaction",
    chatId,
    data: {
      messageId,
      userId,
      emoji,
      action,
    },
    timestamp: Date.now(),
  };
  
  sendEventToUsers(participantIds, event);
}

/**
 * Send heartbeat to keep connections alive
 */
export function sendHeartbeat(): void {
  const event: ChatEvent = {
    type: "heartbeat",
    data: { time: Date.now() },
    timestamp: Date.now(),
  };
  
  connectedClients.forEach((clients) => {
    clients.forEach((res) => sendEventToClient(res, event));
  });
}

// Start heartbeat interval (every 30 seconds)
setInterval(sendHeartbeat, 30000);

/**
 * Get typing users for a chat
 */
export function getTypingUsers(chatId: number): number[] {
  return Array.from(typingUsers.get(chatId) || []);
}

/**
 * Clear typing status for a user in all chats
 */
export function clearUserTyping(userId: number): void {
  typingUsers.forEach((users) => {
    users.delete(userId);
  });
}
