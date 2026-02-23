import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  addClient,
  removeClient,
  isUserConnected,
  getConnectedUserCount,
  sendEventToUser,
  broadcastMessage,
  broadcastTyping,
  broadcastPresence,
  broadcastReadReceipt,
  broadcastReaction,
  getTypingUsers,
  clearUserTyping,
} from "./services/chatSSE";

// Mock Response object
function createMockResponse() {
  const chunks: string[] = [];
  return {
    write: vi.fn((data: string) => {
      chunks.push(data);
      return true;
    }),
    getChunks: () => chunks,
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
  };
}

describe("Chat SSE Service", () => {
  beforeEach(() => {
    // Clear any existing clients by removing them
    vi.clearAllMocks();
  });

  describe("Client Management", () => {
    it("should add a client connection", () => {
      const mockRes = createMockResponse();
      const userId = 1;
      
      addClient(userId, mockRes as any);
      
      expect(isUserConnected(userId)).toBe(true);
      expect(getConnectedUserCount()).toBeGreaterThanOrEqual(1);
      
      // Should receive connected event
      const chunks = mockRes.getChunks();
      expect(chunks.length).toBeGreaterThan(0);
      const event = JSON.parse(chunks[0].replace("data: ", "").trim());
      expect(event.type).toBe("connected");
      expect(event.data.userId).toBe(userId);
      
      // Cleanup
      removeClient(userId, mockRes as any);
    });

    it("should remove a client connection", () => {
      const mockRes = createMockResponse();
      const userId = 2;
      
      addClient(userId, mockRes as any);
      expect(isUserConnected(userId)).toBe(true);
      
      removeClient(userId, mockRes as any);
      expect(isUserConnected(userId)).toBe(false);
    });

    it("should handle multiple connections for same user", () => {
      const mockRes1 = createMockResponse();
      const mockRes2 = createMockResponse();
      const userId = 3;
      
      addClient(userId, mockRes1 as any);
      addClient(userId, mockRes2 as any);
      
      expect(isUserConnected(userId)).toBe(true);
      
      // Remove one connection
      removeClient(userId, mockRes1 as any);
      expect(isUserConnected(userId)).toBe(true);
      
      // Remove second connection
      removeClient(userId, mockRes2 as any);
      expect(isUserConnected(userId)).toBe(false);
    });
  });

  describe("Event Broadcasting", () => {
    it("should send event to specific user", () => {
      const mockRes = createMockResponse();
      const userId = 10;
      
      addClient(userId, mockRes as any);
      
      // Clear the connected event
      mockRes.getChunks().length = 0;
      
      sendEventToUser(userId, {
        type: "message",
        chatId: 1,
        data: { content: "Hello" },
        timestamp: Date.now(),
      });
      
      const chunks = mockRes.getChunks();
      expect(chunks.length).toBe(1);
      const event = JSON.parse(chunks[0].replace("data: ", "").trim());
      expect(event.type).toBe("message");
      expect(event.data.content).toBe("Hello");
      
      removeClient(userId, mockRes as any);
    });

    it("should broadcast message to all participants", () => {
      const mockRes1 = createMockResponse();
      const mockRes2 = createMockResponse();
      const user1 = 20;
      const user2 = 21;
      
      addClient(user1, mockRes1 as any);
      addClient(user2, mockRes2 as any);
      
      // Clear connected events
      mockRes1.getChunks().length = 0;
      mockRes2.getChunks().length = 0;
      
      broadcastMessage(1, [user1, user2], {
        id: 100,
        senderId: user1,
        senderName: "User 1",
        content: "Hello everyone",
        contentType: "text",
        createdAt: new Date(),
      });
      
      // Both users should receive the message
      expect(mockRes1.getChunks().length).toBe(1);
      expect(mockRes2.getChunks().length).toBe(1);
      
      const event1 = JSON.parse(mockRes1.getChunks()[0].replace("data: ", "").trim());
      expect(event1.type).toBe("message");
      expect(event1.data.content).toBe("Hello everyone");
      
      removeClient(user1, mockRes1 as any);
      removeClient(user2, mockRes2 as any);
    });

    it("should broadcast typing indicator excluding sender", () => {
      const mockRes1 = createMockResponse();
      const mockRes2 = createMockResponse();
      const user1 = 30;
      const user2 = 31;
      
      addClient(user1, mockRes1 as any);
      addClient(user2, mockRes2 as any);
      
      mockRes1.getChunks().length = 0;
      mockRes2.getChunks().length = 0;
      
      broadcastTyping(1, [user1, user2], user1, "User 1", true);
      
      // Only user2 should receive typing indicator (not the sender)
      expect(mockRes1.getChunks().length).toBe(0);
      expect(mockRes2.getChunks().length).toBe(1);
      
      const event = JSON.parse(mockRes2.getChunks()[0].replace("data: ", "").trim());
      expect(event.type).toBe("typing");
      expect(event.data.isTyping).toBe(true);
      expect(event.data.userName).toBe("User 1");
      
      removeClient(user1, mockRes1 as any);
      removeClient(user2, mockRes2 as any);
    });

    it("should track typing users per chat", () => {
      const mockRes = createMockResponse();
      const user1 = 40;
      const user2 = 41;
      const chatId = 5;
      
      addClient(user1, mockRes as any);
      
      // User 2 starts typing
      broadcastTyping(chatId, [user1], user2, "User 2", true);
      
      let typingUsers = getTypingUsers(chatId);
      expect(typingUsers).toContain(user2);
      
      // User 2 stops typing
      broadcastTyping(chatId, [user1], user2, "User 2", false);
      
      typingUsers = getTypingUsers(chatId);
      expect(typingUsers).not.toContain(user2);
      
      removeClient(user1, mockRes as any);
    });

    it("should clear user typing from all chats", () => {
      const mockRes = createMockResponse();
      const user1 = 50;
      const user2 = 51;
      
      addClient(user1, mockRes as any);
      
      // User 2 typing in multiple chats
      broadcastTyping(1, [user1], user2, "User 2", true);
      broadcastTyping(2, [user1], user2, "User 2", true);
      
      expect(getTypingUsers(1)).toContain(user2);
      expect(getTypingUsers(2)).toContain(user2);
      
      // Clear all typing for user 2
      clearUserTyping(user2);
      
      expect(getTypingUsers(1)).not.toContain(user2);
      expect(getTypingUsers(2)).not.toContain(user2);
      
      removeClient(user1, mockRes as any);
    });

    it("should broadcast presence updates", () => {
      const mockRes = createMockResponse();
      const user1 = 60;
      const user2 = 61;
      
      addClient(user1, mockRes as any);
      mockRes.getChunks().length = 0;
      
      broadcastPresence(user2, "User 2", "online", [user1]);
      
      const chunks = mockRes.getChunks();
      expect(chunks.length).toBe(1);
      
      const event = JSON.parse(chunks[0].replace("data: ", "").trim());
      expect(event.type).toBe("presence");
      expect(event.data.status).toBe("online");
      expect(event.data.userName).toBe("User 2");
      
      removeClient(user1, mockRes as any);
    });

    it("should broadcast read receipts", () => {
      const mockRes = createMockResponse();
      const user1 = 70;
      const user2 = 71;
      
      addClient(user1, mockRes as any);
      mockRes.getChunks().length = 0;
      
      broadcastReadReceipt(1, [user1, user2], user2, 100);
      
      const chunks = mockRes.getChunks();
      expect(chunks.length).toBe(1);
      
      const event = JSON.parse(chunks[0].replace("data: ", "").trim());
      expect(event.type).toBe("read");
      expect(event.data.userId).toBe(user2);
      expect(event.data.lastReadMessageId).toBe(100);
      
      removeClient(user1, mockRes as any);
    });

    it("should broadcast reaction updates", () => {
      const mockRes = createMockResponse();
      const user1 = 80;
      
      addClient(user1, mockRes as any);
      mockRes.getChunks().length = 0;
      
      broadcastReaction(1, [user1], 100, user1, "👍", "add");
      
      const chunks = mockRes.getChunks();
      expect(chunks.length).toBe(1);
      
      const event = JSON.parse(chunks[0].replace("data: ", "").trim());
      expect(event.type).toBe("reaction");
      expect(event.data.emoji).toBe("👍");
      expect(event.data.action).toBe("add");
      
      removeClient(user1, mockRes as any);
    });
  });

  describe("Edge Cases", () => {
    it("should handle sending to non-existent user gracefully", () => {
      // Should not throw
      expect(() => {
        sendEventToUser(99999, {
          type: "message",
          data: { content: "test" },
          timestamp: Date.now(),
        });
      }).not.toThrow();
    });

    it("should handle removing non-existent client gracefully", () => {
      const mockRes = createMockResponse();
      
      // Should not throw
      expect(() => {
        removeClient(99999, mockRes as any);
      }).not.toThrow();
    });

    it("should return empty array for typing users in unknown chat", () => {
      const typingUsers = getTypingUsers(99999);
      expect(typingUsers).toEqual([]);
    });
  });
});
