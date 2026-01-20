import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { 
  chats, 
  chatParticipants, 
  chatMessages, 
  chatAttachments,
  userPresence,
  users
} from "../../drizzle/schema";
import { eq, and, desc, asc, or, sql, inArray, gte, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { broadcastMessage, broadcastTyping, broadcastPresence, broadcastReaction } from "../services/chatSSE";

// Helper to get or create direct chat between two users
async function getOrCreateDirectChat(userId1: number, userId2: number): Promise<number> {
  // Find existing direct chat between these users
  const user1Chats = await db
    .select({ chatId: chatParticipants.chatId })
    .from(chatParticipants)
    .where(eq(chatParticipants.userId, userId1));
  
  const user1ChatIds = user1Chats.map(c => c.chatId);
  
  if (user1ChatIds.length > 0) {
    const existingChat = await db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .innerJoin(chats, eq(chatParticipants.chatId, chats.id))
      .where(and(
        eq(chatParticipants.userId, userId2),
        inArray(chatParticipants.chatId, user1ChatIds),
        eq(chats.chatType, "direct")
      ))
      .limit(1);
    
    if (existingChat.length > 0) {
      return existingChat[0].chatId;
    }
  }
  
  // Create new direct chat
  const [result] = await db.insert(chats).values({
    chatType: "direct",
    createdById: userId1,
  });
  
  const chatId = Number(result.insertId);
  
  // Add both users as participants
  await db.insert(chatParticipants).values([
    { chatId, userId: userId1, role: "member" },
    { chatId, userId: userId2, role: "member" },
  ]);
  
  return chatId;
}

// Helper to update chat's last message
async function updateChatLastMessage(chatId: number, content: string) {
  const preview = content.length > 100 ? content.substring(0, 100) + "..." : content;
  await db.update(chats)
    .set({ 
      lastMessageAt: new Date(),
      lastMessagePreview: preview,
    })
    .where(eq(chats.id, chatId));
}

// Helper to increment unread count for other participants
async function incrementUnreadCounts(chatId: number, senderId: number) {
  await db.execute(sql`
    UPDATE chat_participants 
    SET unreadCount = unreadCount + 1 
    WHERE chatId = ${chatId} AND userId != ${senderId}
  `);
}

export const chatRouter = router({
  // Create a new group chat
  createGroup: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      participantIds: z.array(z.number()).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const [result] = await db.insert(chats).values({
        chatType: "group",
        name: input.name,
        description: input.description,
        createdById: ctx.user.id,
      });
      
      const chatId = Number(result.insertId);
      
      // Add creator as owner
      await db.insert(chatParticipants).values({
        chatId,
        userId: ctx.user.id,
        role: "owner",
      });
      
      // Add other participants
      const participantValues = input.participantIds
        .filter(id => id !== ctx.user.id)
        .map(userId => ({
          chatId,
          userId,
          role: "member" as const,
        }));
      
      if (participantValues.length > 0) {
        await db.insert(chatParticipants).values(participantValues);
      }
      
      return { id: chatId, message: "Group chat created" };
    }),

  // Start or get direct chat with another user
  startDirect: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot start chat with yourself" });
      }
      
      const chatId = await getOrCreateDirectChat(ctx.user.id, input.userId);
      return { chatId };
    }),

  // List user's chats
  list: protectedProcedure
    .input(z.object({
      type: z.enum(["all", "direct", "group", "channel", "meeting"]).default("all"),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Get chat IDs where user is participant
      const userChats = await db
        .select({
          chatId: chatParticipants.chatId,
          role: chatParticipants.role,
          unreadCount: chatParticipants.unreadCount,
          isMuted: chatParticipants.isMuted,
          isPinned: chatParticipants.isPinned,
        })
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.userId, ctx.user.id),
          isNull(chatParticipants.leftAt)
        ));
      
      if (userChats.length === 0) {
        return { chats: [], total: 0 };
      }
      
      const chatIds = userChats.map(c => c.chatId);
      const chatMap = new Map(userChats.map(c => [c.chatId, c]));
      
      // Get chat details
      let chatResults = await db
        .select()
        .from(chats)
        .where(inArray(chats.id, chatIds))
        .orderBy(desc(chats.lastMessageAt))
        .limit(input.limit)
        .offset(input.offset);
      
      // Filter by type if specified
      if (input.type !== "all") {
        chatResults = chatResults.filter(c => c.chatType === input.type);
      }
      
      // Get participant info for each chat
      const enrichedChats = await Promise.all(chatResults.map(async (chat) => {
        const participants = await db
          .select({
            id: chatParticipants.id,
            userId: chatParticipants.userId,
            role: chatParticipants.role,
            userName: users.name,
            userEmail: users.email,
          })
          .from(chatParticipants)
          .leftJoin(users, eq(chatParticipants.userId, users.id))
          .where(and(
            eq(chatParticipants.chatId, chat.id),
            isNull(chatParticipants.leftAt)
          ));
        
        const userChatInfo = chatMap.get(chat.id);
        
        // For direct chats, get the other user's name
        let displayName = chat.name;
        if (chat.chatType === "direct") {
          const otherUser = participants.find(p => p.userId !== ctx.user.id);
          displayName = otherUser?.userName || "Unknown User";
        }
        
        return {
          ...chat,
          displayName,
          participants,
          unreadCount: userChatInfo?.unreadCount || 0,
          isMuted: userChatInfo?.isMuted || false,
          isPinned: userChatInfo?.isPinned || false,
          userRole: userChatInfo?.role || "member",
        };
      }));
      
      return {
        chats: enrichedChats,
        total: chatResults.length,
      };
    }),

  // Get chat by ID with messages
  getById: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      messageLimit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is participant
      const [participant] = await db
        .select()
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.chatId, input.id),
          eq(chatParticipants.userId, ctx.user.id),
          isNull(chatParticipants.leftAt)
        ))
        .limit(1);
      
      if (!participant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this chat" });
      }
      
      // Get chat details
      const [chat] = await db
        .select()
        .from(chats)
        .where(eq(chats.id, input.id))
        .limit(1);
      
      if (!chat) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found" });
      }
      
      // Get participants
      const participants = await db
        .select({
          id: chatParticipants.id,
          userId: chatParticipants.userId,
          role: chatParticipants.role,
          userName: users.name,
          userEmail: users.email,
        })
        .from(chatParticipants)
        .leftJoin(users, eq(chatParticipants.userId, users.id))
        .where(and(
          eq(chatParticipants.chatId, input.id),
          isNull(chatParticipants.leftAt)
        ));
      
      // Get recent messages
      const messages = await db
        .select({
          id: chatMessages.id,
          chatId: chatMessages.chatId,
          senderId: chatMessages.senderId,
          content: chatMessages.content,
          contentType: chatMessages.contentType,
          replyToId: chatMessages.replyToId,
          hasAttachments: chatMessages.hasAttachments,
          isEdited: chatMessages.isEdited,
          isDeleted: chatMessages.isDeleted,
          reactions: chatMessages.reactions,
          createdAt: chatMessages.createdAt,
          senderName: users.name,
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.senderId, users.id))
        .where(eq(chatMessages.chatId, input.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(input.messageLimit);
      
      // Mark as read
      await db.update(chatParticipants)
        .set({ 
          lastReadAt: new Date(),
          unreadCount: 0,
        })
        .where(eq(chatParticipants.id, participant.id));
      
      return {
        ...chat,
        participants,
        messages: messages.reverse(), // Return in chronological order
        userRole: participant.role,
      };
    }),

  // Send a message
  sendMessage: protectedProcedure
    .input(z.object({
      chatId: z.number(),
      content: z.string().min(1).max(10000),
      contentType: z.enum(["text", "html", "markdown"]).default("text"),
      replyToId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is participant
      const [participant] = await db
        .select()
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.chatId, input.chatId),
          eq(chatParticipants.userId, ctx.user.id),
          isNull(chatParticipants.leftAt)
        ))
        .limit(1);
      
      if (!participant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this chat" });
      }
      
      // Create message
      const [result] = await db.insert(chatMessages).values({
        chatId: input.chatId,
        senderId: ctx.user.id,
        content: input.content,
        contentType: input.contentType,
        replyToId: input.replyToId,
      });
      
      const messageId = Number(result.insertId);
      
      // Update chat's last message
      await updateChatLastMessage(input.chatId, input.content);
      
      // Increment unread counts for other participants
      await incrementUnreadCounts(input.chatId, ctx.user.id);
      
      // Get all participant IDs for broadcasting
      const participants = await db
        .select({ userId: chatParticipants.userId })
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.chatId, input.chatId),
          isNull(chatParticipants.leftAt)
        ));
      
      const participantIds = participants.map(p => p.userId);
      const createdAt = new Date();
      
      // Broadcast message via SSE
      broadcastMessage(input.chatId, participantIds, {
        id: messageId,
        senderId: ctx.user.id,
        senderName: ctx.user.name || "Unknown",
        content: input.content,
        contentType: input.contentType,
        createdAt,
      });
      
      return { 
        id: messageId, 
        message: "Message sent",
        createdAt,
      };
    }),

  // Get messages for a chat (with pagination)
  getMessages: protectedProcedure
    .input(z.object({
      chatId: z.number(),
      limit: z.number().min(1).max(100).default(50),
      beforeId: z.number().optional(), // For pagination
      afterId: z.number().optional(), // For new messages
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is participant
      const [participant] = await db
        .select()
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.chatId, input.chatId),
          eq(chatParticipants.userId, ctx.user.id),
          isNull(chatParticipants.leftAt)
        ))
        .limit(1);
      
      if (!participant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this chat" });
      }
      
      let query = db
        .select({
          id: chatMessages.id,
          chatId: chatMessages.chatId,
          senderId: chatMessages.senderId,
          content: chatMessages.content,
          contentType: chatMessages.contentType,
          replyToId: chatMessages.replyToId,
          hasAttachments: chatMessages.hasAttachments,
          isEdited: chatMessages.isEdited,
          isDeleted: chatMessages.isDeleted,
          reactions: chatMessages.reactions,
          createdAt: chatMessages.createdAt,
          senderName: users.name,
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.senderId, users.id))
        .where(eq(chatMessages.chatId, input.chatId))
        .orderBy(desc(chatMessages.id))
        .limit(input.limit);
      
      const messages = await query;
      
      // Filter by beforeId or afterId if provided
      let filteredMessages = messages;
      if (input.beforeId) {
        filteredMessages = messages.filter(m => m.id < input.beforeId!);
      }
      if (input.afterId) {
        filteredMessages = messages.filter(m => m.id > input.afterId!);
      }
      
      return {
        messages: filteredMessages.reverse(),
        hasMore: filteredMessages.length === input.limit,
      };
    }),

  // Edit a message
  editMessage: protectedProcedure
    .input(z.object({
      messageId: z.number(),
      content: z.string().min(1).max(10000),
    }))
    .mutation(async ({ ctx, input }) => {
      const [message] = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.id, input.messageId))
        .limit(1);
      
      if (!message) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      }
      
      if (message.senderId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own messages" });
      }
      
      await db.update(chatMessages)
        .set({ 
          content: input.content,
          isEdited: true,
          editedAt: new Date(),
        })
        .where(eq(chatMessages.id, input.messageId));
      
      return { success: true };
    }),

  // Delete a message
  deleteMessage: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [message] = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.id, input.messageId))
        .limit(1);
      
      if (!message) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      }
      
      if (message.senderId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own messages" });
      }
      
      await db.update(chatMessages)
        .set({ 
          isDeleted: true,
          deletedAt: new Date(),
          content: "[Message deleted]",
        })
        .where(eq(chatMessages.id, input.messageId));
      
      return { success: true };
    }),

  // Add reaction to message
  addReaction: protectedProcedure
    .input(z.object({
      messageId: z.number(),
      emoji: z.string().max(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const [message] = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.id, input.messageId))
        .limit(1);
      
      if (!message) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      }
      
      const reactions = (message.reactions as Record<string, number[]>) || {};
      if (!reactions[input.emoji]) {
        reactions[input.emoji] = [];
      }
      
      if (!reactions[input.emoji].includes(ctx.user.id)) {
        reactions[input.emoji].push(ctx.user.id);
      }
      
      await db.update(chatMessages)
        .set({ reactions })
        .where(eq(chatMessages.id, input.messageId));
      
      return { success: true };
    }),

  // Remove reaction from message
  removeReaction: protectedProcedure
    .input(z.object({
      messageId: z.number(),
      emoji: z.string().max(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const [message] = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.id, input.messageId))
        .limit(1);
      
      if (!message) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      }
      
      const reactions = (message.reactions as Record<string, number[]>) || {};
      if (reactions[input.emoji]) {
        reactions[input.emoji] = reactions[input.emoji].filter(id => id !== ctx.user.id);
        if (reactions[input.emoji].length === 0) {
          delete reactions[input.emoji];
        }
      }
      
      await db.update(chatMessages)
        .set({ reactions })
        .where(eq(chatMessages.id, input.messageId));
      
      return { success: true };
    }),

  // Mark chat as read
  markAsRead: protectedProcedure
    .input(z.object({ chatId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.update(chatParticipants)
        .set({ 
          lastReadAt: new Date(),
          unreadCount: 0,
        })
        .where(and(
          eq(chatParticipants.chatId, input.chatId),
          eq(chatParticipants.userId, ctx.user.id)
        ));
      
      return { success: true };
    }),

  // Update user presence
  updatePresence: protectedProcedure
    .input(z.object({
      status: z.enum(["online", "away", "busy", "offline"]),
      statusMessage: z.string().max(255).optional(),
      currentActivity: z.enum(["none", "in_meeting", "presenting", "typing"]).optional(),
      currentChatId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await db
        .select()
        .from(userPresence)
        .where(eq(userPresence.userId, ctx.user.id))
        .limit(1);
      
      if (existing) {
        await db.update(userPresence)
          .set({
            status: input.status,
            statusMessage: input.statusMessage,
            currentActivity: input.currentActivity || "none",
            currentChatId: input.currentChatId,
            lastActiveAt: new Date(),
          })
          .where(eq(userPresence.userId, ctx.user.id));
      } else {
        await db.insert(userPresence).values({
          userId: ctx.user.id,
          status: input.status,
          statusMessage: input.statusMessage,
          currentActivity: input.currentActivity || "none",
          currentChatId: input.currentChatId,
        });
      }
      
      return { success: true };
    }),

  // Get online users
  getOnlineUsers: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()).optional(),
    }))
    .query(async ({ input }) => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      let query = db
        .select({
          userId: userPresence.userId,
          status: userPresence.status,
          statusMessage: userPresence.statusMessage,
          currentActivity: userPresence.currentActivity,
          lastActiveAt: userPresence.lastActiveAt,
          userName: users.name,
        })
        .from(userPresence)
        .leftJoin(users, eq(userPresence.userId, users.id))
        .where(gte(userPresence.lastActiveAt, fiveMinutesAgo));
      
      const results = await query;
      
      // Filter by userIds if provided
      if (input.userIds && input.userIds.length > 0) {
        return results.filter(r => input.userIds!.includes(r.userId));
      }
      
      return results;
    }),

  // Leave a group chat
  leaveChat: protectedProcedure
    .input(z.object({ chatId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [chat] = await db
        .select()
        .from(chats)
        .where(eq(chats.id, input.chatId))
        .limit(1);
      
      if (!chat) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found" });
      }
      
      if (chat.chatType === "direct") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot leave a direct chat" });
      }
      
      await db.update(chatParticipants)
        .set({ leftAt: new Date() })
        .where(and(
          eq(chatParticipants.chatId, input.chatId),
          eq(chatParticipants.userId, ctx.user.id)
        ));
      
      // Add system message
      await db.insert(chatMessages).values({
        chatId: input.chatId,
        senderId: ctx.user.id,
        content: `${ctx.user.name || "A user"} left the chat`,
        contentType: "system",
      });
      
      return { success: true };
    }),

  // Add participant to group chat
  addParticipant: protectedProcedure
    .input(z.object({
      chatId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin/owner
      const [participant] = await db
        .select()
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.chatId, input.chatId),
          eq(chatParticipants.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (!participant || (participant.role !== "owner" && participant.role !== "admin")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can add participants" });
      }
      
      // Check if user is already a participant
      const [existing] = await db
        .select()
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.chatId, input.chatId),
          eq(chatParticipants.userId, input.userId)
        ))
        .limit(1);
      
      if (existing && !existing.leftAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User is already a participant" });
      }
      
      if (existing) {
        // Rejoin
        await db.update(chatParticipants)
          .set({ leftAt: null, joinedAt: new Date() })
          .where(eq(chatParticipants.id, existing.id));
      } else {
        await db.insert(chatParticipants).values({
          chatId: input.chatId,
          userId: input.userId,
          role: "member",
        });
      }
      
      // Get user name for system message
      const [newUser] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);
      
      // Add system message
      await db.insert(chatMessages).values({
        chatId: input.chatId,
        senderId: ctx.user.id,
        content: `${newUser?.name || "A user"} was added to the chat`,
        contentType: "system",
      });
      
      return { success: true };
    }),

  // Get unread count across all chats
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const results = await db
        .select({
          chatId: chatParticipants.chatId,
          unreadCount: chatParticipants.unreadCount,
        })
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.userId, ctx.user.id),
          isNull(chatParticipants.leftAt)
        ));
      
      const totalUnread = results.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
      const chatsWithUnread = results.filter(r => (r.unreadCount || 0) > 0).length;
      
      return {
        totalUnread,
        chatsWithUnread,
        perChat: results.filter(r => (r.unreadCount || 0) > 0),
      };
    }),

  // Search messages
  searchMessages: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      chatId: z.number().optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Get user's chat IDs
      const userChats = await db
        .select({ chatId: chatParticipants.chatId })
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.userId, ctx.user.id),
          isNull(chatParticipants.leftAt)
        ));
      
      const chatIds = userChats.map(c => c.chatId);
      
      if (chatIds.length === 0) {
        return { messages: [] };
      }
      
      // Search messages
      const messages = await db
        .select({
          id: chatMessages.id,
          chatId: chatMessages.chatId,
          senderId: chatMessages.senderId,
          content: chatMessages.content,
          createdAt: chatMessages.createdAt,
          senderName: users.name,
          chatName: chats.name,
          chatType: chats.chatType,
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.senderId, users.id))
        .leftJoin(chats, eq(chatMessages.chatId, chats.id))
        .where(and(
          inArray(chatMessages.chatId, input.chatId ? [input.chatId] : chatIds),
          sql`${chatMessages.content} LIKE ${`%${input.query}%`}`,
          eq(chatMessages.isDeleted, false)
        ))
        .orderBy(desc(chatMessages.createdAt))
        .limit(input.limit);
      
      return { messages };
    }),

  // Send typing indicator
  sendTypingIndicator: protectedProcedure
    .input(z.object({
      chatId: z.number(),
      isTyping: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is participant
      const [participant] = await db
        .select()
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.chatId, input.chatId),
          eq(chatParticipants.userId, ctx.user.id),
          isNull(chatParticipants.leftAt)
        ))
        .limit(1);
      
      if (!participant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this chat" });
      }
      
      // Get all participant IDs for broadcasting
      const participants = await db
        .select({ userId: chatParticipants.userId })
        .from(chatParticipants)
        .where(and(
          eq(chatParticipants.chatId, input.chatId),
          isNull(chatParticipants.leftAt)
        ));
      
      const participantIds = participants.map(p => p.userId);
      
      // Broadcast typing indicator via SSE
      broadcastTyping(
        input.chatId,
        participantIds,
        ctx.user.id,
        ctx.user.name || "Unknown",
        input.isTyping
      );
      
      return { success: true };
    }),
});
