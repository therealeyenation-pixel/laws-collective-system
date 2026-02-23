import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notifications, notificationPreferences, users } from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

/**
 * Notifications Router
 * Handles in-app notifications for users
 */
export const notificationsRouter = router({
  /**
   * Get all notifications for the current user
   */
  getAll: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      unreadOnly: z.boolean().default(false),
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      const unreadOnly = input?.unreadOnly ?? false;
      
      // For unauthenticated users, return empty array
      if (!ctx.user) {
        return {
          notifications: [],
          total: 0,
          unreadCount: 0,
        };
      }

      const db = await getDb();
      if (!db) {
        return {
          notifications: [],
          total: 0,
          unreadCount: 0,
        };
      }

      const userId = ctx.user.id;
      
      // Build query conditions
      const conditions = unreadOnly 
        ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
        : eq(notifications.userId, userId);

      const [userNotifications, countResult, unreadResult] = await Promise.all([
        db.select()
          .from(notifications)
          .where(conditions)
          .orderBy(desc(notifications.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` })
          .from(notifications)
          .where(eq(notifications.userId, userId)),
        db.select({ count: sql<number>`count(*)` })
          .from(notifications)
          .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false))),
      ]);

      return {
        notifications: userNotifications,
        total: countResult[0]?.count ?? 0,
        unreadCount: unreadResult[0]?.count ?? 0,
      };
    }),

  /**
   * Get unread count for notification badge
   */
  getUnreadCount: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return { count: 0 };
    }

    const db = await getDb();
    if (!db) {
      return { count: 0 };
    }

    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, false)));

    return { count: result[0]?.count ?? 0 };
  }),

  /**
   * Mark a notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(notifications)
        .set({ 
          isRead: true, 
          readAt: new Date() 
        })
        .where(and(
          eq(notifications.id, input.notificationId),
          eq(notifications.userId, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db.update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.isRead, false)
      ));

    return { success: true };
  }),

  /**
   * Delete a notification
   */
  delete: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(notifications)
        .where(and(
          eq(notifications.id, input.notificationId),
          eq(notifications.userId, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Clear all notifications
   */
  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db.delete(notifications)
      .where(eq(notifications.userId, ctx.user.id));

    return { success: true };
  }),

  /**
   * Create a notification (internal use or admin)
   */
  create: publicProcedure
    .input(z.object({
      userId: z.number(),
      type: z.enum(["system", "operation", "token", "academy", "document", "approval", "alert", "success", "info"]),
      title: z.string().min(1).max(255),
      message: z.string().min(1),
      entityId: z.number().optional(),
      referenceType: z.string().optional(),
      referenceId: z.number().optional(),
      actionUrl: z.string().optional(),
      isPriority: z.boolean().default(false),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(notifications).values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        entityId: input.entityId,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        actionUrl: input.actionUrl,
        isPriority: input.isPriority,
        metadata: input.metadata as any,
      });

      return { 
        success: true
      };
    }),

  /**
   * Create notification for all users (broadcast)
   */
  broadcast: protectedProcedure
    .input(z.object({
      type: z.enum(["system", "operation", "token", "academy", "document", "approval", "alert", "success", "info"]),
      title: z.string().min(1).max(255),
      message: z.string().min(1),
      entityId: z.number().optional(),
      isPriority: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get all users
      const allUsers = await db.select({ id: users.id }).from(users);

      // Create notification for each user
      const notificationValues = allUsers.map((user: { id: number }) => ({
        userId: user.id,
        type: input.type,
        title: input.title,
        message: input.message,
        entityId: input.entityId,
        isPriority: input.isPriority,
      }));

      if (notificationValues.length > 0) {
        await db.insert(notifications).values(notificationValues);
      }

      return { 
        success: true, 
        count: notificationValues.length 
      };
    }),

  /**
   * Get notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        emailEnabled: true,
        pushEnabled: true,
        operationAlerts: true,
        tokenAlerts: true,
        academyAlerts: true,
        documentAlerts: true,
        approvalAlerts: true,
        systemAlerts: true,
      };
    }

    const result = await db.select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, ctx.user.id));

    const prefs = result[0];

    if (!prefs) {
      // Return defaults if no preferences set
      return {
        emailEnabled: true,
        pushEnabled: true,
        operationAlerts: true,
        tokenAlerts: true,
        academyAlerts: true,
        documentAlerts: true,
        approvalAlerts: true,
        systemAlerts: true,
      };
    }

    return prefs;
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(z.object({
      emailEnabled: z.boolean().optional(),
      pushEnabled: z.boolean().optional(),
      operationAlerts: z.boolean().optional(),
      tokenAlerts: z.boolean().optional(),
      academyAlerts: z.boolean().optional(),
      documentAlerts: z.boolean().optional(),
      approvalAlerts: z.boolean().optional(),
      systemAlerts: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if preferences exist
      const existing = await db.select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, ctx.user.id));

      if (existing.length > 0) {
        await db.update(notificationPreferences)
          .set(input)
          .where(eq(notificationPreferences.userId, ctx.user.id));
      } else {
        await db.insert(notificationPreferences).values({
          userId: ctx.user.id,
          ...input,
        });
      }

      return { success: true };
    }),
});
