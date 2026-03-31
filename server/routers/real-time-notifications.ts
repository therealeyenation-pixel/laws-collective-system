import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const realTimeNotificationsRouter = router({
  // Get user notifications
  getNotifications: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        type: z.enum(['campaign', 'member', 'financial', 'system']).optional(),
        read: z.boolean().optional(),
      })
    )
    .query(({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;
      
      // Mock notifications
      const allNotifications = [
        {
          id: 'notif_1',
          type: 'campaign' as const,
          title: 'Campaign Milestone Reached',
          message: 'Your "Q1 Investment Tips" campaign reached 10,000 opens',
          severity: 'info' as const,
          read: false,
          createdAt: new Date(Date.now() - 3600000),
          actionUrl: '/email-campaigns/camp_123',
        },
        {
          id: 'notif_2',
          type: 'member' as const,
          title: 'High-Value Member Alert',
          message: 'John Doe (member_456) reached Premium tier',
          severity: 'success' as const,
          read: false,
          createdAt: new Date(Date.now() - 7200000),
          actionUrl: '/member-portal/member_456',
        },
        {
          id: 'notif_3',
          type: 'financial' as const,
          title: 'Reconciliation Exception',
          message: 'Unmatched transaction: $5,000 from Bank of America',
          severity: 'warning' as const,
          read: true,
          createdAt: new Date(Date.now() - 86400000),
          actionUrl: '/financial-reconciliation',
        },
        {
          id: 'notif_4',
          type: 'system' as const,
          title: 'System Maintenance',
          message: 'Scheduled maintenance tonight at 2 AM EST',
          severity: 'info' as const,
          read: true,
          createdAt: new Date(Date.now() - 172800000),
          actionUrl: null,
        },
      ];

      let filtered = allNotifications;
      if (input.type) {
        filtered = filtered.filter(n => n.type === input.type);
      }
      if (input.read !== undefined) {
        filtered = filtered.filter(n => n.read === input.read);
      }

      const total = filtered.length;
      const notifications = filtered.slice(offset, offset + input.limit);

      return {
        notifications,
        total,
        page: input.page,
        pages: Math.ceil(total / input.limit),
        unreadCount: allNotifications.filter(n => !n.read).length,
      };
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(({ ctx, input }) => {
      return {
        success: true,
        notificationId: input.notificationId,
        readAt: new Date(),
      };
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure
    .mutation(({ ctx }) => {
      return {
        success: true,
        markedCount: 4,
        timestamp: new Date(),
      };
    }),

  // Delete notification
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(({ ctx, input }) => {
      return {
        success: true,
        notificationId: input.notificationId,
        deletedAt: new Date(),
      };
    }),

  // Get notification preferences
  getPreferences: protectedProcedure
    .query(({ ctx }) => {
      return {
        userId: ctx.user.id,
        emailNotifications: {
          campaignMilestones: true,
          memberAlerts: true,
          financialAlerts: true,
          systemUpdates: false,
        },
        pushNotifications: {
          campaignMilestones: true,
          memberAlerts: true,
          financialAlerts: true,
          systemUpdates: false,
        },
        smsNotifications: {
          campaignMilestones: false,
          memberAlerts: true,
          financialAlerts: true,
          systemUpdates: false,
        },
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'America/New_York',
        },
      };
    }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.record(z.boolean()).optional(),
        pushNotifications: z.record(z.boolean()).optional(),
        smsNotifications: z.record(z.boolean()).optional(),
        quietHours: z.object({
          enabled: z.boolean(),
          startTime: z.string(),
          endTime: z.string(),
          timezone: z.string(),
        }).optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return {
        success: true,
        preferences: {
          emailNotifications: input.emailNotifications || {},
          pushNotifications: input.pushNotifications || {},
          smsNotifications: input.smsNotifications || {},
          quietHours: input.quietHours,
        },
        updatedAt: new Date(),
      };
    }),

  // Subscribe to real-time updates (WebSocket simulation)
  subscribeToUpdates: protectedProcedure
    .input(z.object({ types: z.array(z.string()).optional() }))
    .subscription(({ ctx, input }) => {
      // In production, this would use WebSocket
      // For now, return a mock observable
      return {
        subscription: true,
        userId: ctx.user.id,
        types: input.types || ['campaign', 'member', 'financial', 'system'],
        connectedAt: new Date(),
      };
    }),

  // Get notification statistics
  getStatistics: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(({ ctx, input }) => {
      return {
        totalNotifications: 156,
        unreadNotifications: 12,
        readRate: 0.923,
        byType: {
          campaign: 78,
          member: 45,
          financial: 28,
          system: 5,
        },
        byDay: Array.from({ length: input.days }, (_, i) => ({
          date: new Date(Date.now() - i * 86400000),
          count: Math.floor(Math.random() * 20) + 5,
        })).reverse(),
        avgResponseTime: 2.5, // hours
      };
    }),

  // Create notification (admin only)
  createNotification: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum(['campaign', 'member', 'financial', 'system']),
        title: z.string(),
        message: z.string(),
        severity: z.enum(['info', 'success', 'warning', 'error']),
        actionUrl: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return {
        notificationId: `notif_${Date.now()}`,
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        severity: input.severity,
        actionUrl: input.actionUrl,
        createdAt: new Date(),
      };
    }),

  // Broadcast notification to all users (admin only)
  broadcastNotification: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        message: z.string(),
        severity: z.enum(['info', 'success', 'warning', 'error']),
        type: z.enum(['campaign', 'member', 'financial', 'system']),
      })
    )
    .mutation(({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return {
        broadcastId: `broadcast_${Date.now()}`,
        title: input.title,
        message: input.message,
        severity: input.severity,
        type: input.type,
        recipientCount: 1250,
        sentAt: new Date(),
      };
    }),

  // Get notification history
  getHistory: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(50),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;
      
      return {
        history: Array.from({ length: input.limit }, (_, i) => ({
          id: `hist_${offset + i}`,
          type: ['campaign', 'member', 'financial', 'system'][Math.floor(Math.random() * 4)],
          title: `Notification ${offset + i}`,
          message: `Sample notification message ${offset + i}`,
          severity: ['info', 'success', 'warning', 'error'][Math.floor(Math.random() * 4)],
          createdAt: new Date(Date.now() - Math.random() * 30 * 86400000),
          read: Math.random() > 0.3,
        })),
        total: 500,
        page: input.page,
        pages: Math.ceil(500 / input.limit),
      };
    }),
});
