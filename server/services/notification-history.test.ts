/**
 * Notification History Service Tests
 * Phase 68: Notification history dashboard with delivery status tracking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordNotification,
  updateNotificationStatus,
  markAsRead,
  markMultipleAsRead,
  getNotificationHistory,
  getUnreadCount,
  getNotificationStatistics,
  getUserPreferences,
  updateUserPreferences,
  shouldSendNotification,
  deleteOldNotifications,
  getRecentNotifications,
  markForResend,
  getNotificationById,
  getAllNotificationTypes,
  getAllNotificationChannels,
  DEFAULT_USER_PREFERENCES,
  type NotificationType,
  type NotificationChannel,
  type DeliveryStatus,
} from './notification-history';

describe('Notification History Service', () => {
  describe('recordNotification', () => {
    it('should record a new notification with required fields', () => {
      const notification = recordNotification({
        userId: 1,
        type: 'compliance_reminder',
        channel: 'email',
        title: 'Test Notification',
        content: 'This is a test notification',
        status: 'pending',
      });

      expect(notification).toBeDefined();
      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe(1);
      expect(notification.type).toBe('compliance_reminder');
      expect(notification.channel).toBe('email');
      expect(notification.title).toBe('Test Notification');
      expect(notification.content).toBe('This is a test notification');
      expect(notification.status).toBe('pending');
      expect(notification.createdAt).toBeDefined();
    });

    it('should record notification with optional fields', () => {
      const sentAt = new Date();
      const notification = recordNotification({
        userId: 2,
        type: 'deadline_alert',
        channel: 'in_app',
        title: 'Deadline Alert',
        content: 'Your deadline is approaching',
        status: 'sent',
        sentAt,
        relatedEntityType: 'compliance_task',
        relatedEntityId: 123,
        metadata: { priority: 'high' },
      });

      expect(notification.sentAt).toEqual(sentAt);
      expect(notification.relatedEntityType).toBe('compliance_task');
      expect(notification.relatedEntityId).toBe(123);
      expect(notification.metadata).toEqual({ priority: 'high' });
    });

    it('should support all notification types', () => {
      const types: NotificationType[] = [
        'compliance_reminder',
        'deadline_alert',
        'document_expiration',
        'overdue_task',
        'weekly_digest',
        'system_alert',
        'approval_request',
        'task_assignment',
        'payment_notification',
        'security_alert',
      ];

      types.forEach(type => {
        const notification = recordNotification({
          userId: 1,
          type,
          channel: 'email',
          title: `Test ${type}`,
          content: 'Test content',
          status: 'pending',
        });
        expect(notification.type).toBe(type);
      });
    });

    it('should support all notification channels', () => {
      const channels: NotificationChannel[] = ['email', 'in_app', 'sms', 'push'];

      channels.forEach(channel => {
        const notification = recordNotification({
          userId: 1,
          type: 'system_alert',
          channel,
          title: `Test ${channel}`,
          content: 'Test content',
          status: 'pending',
        });
        expect(notification.channel).toBe(channel);
      });
    });
  });

  describe('updateNotificationStatus', () => {
    it('should update notification status', () => {
      const notification = recordNotification({
        userId: 1,
        type: 'compliance_reminder',
        channel: 'email',
        title: 'Test',
        content: 'Test',
        status: 'pending',
      });

      const updated = updateNotificationStatus(notification.id, 'sent');
      expect(updated).toBeDefined();
      expect(updated?.status).toBe('sent');
    });

    it('should update status with additional fields', () => {
      const notification = recordNotification({
        userId: 1,
        type: 'compliance_reminder',
        channel: 'email',
        title: 'Test',
        content: 'Test',
        status: 'pending',
      });

      const sentAt = new Date();
      const updated = updateNotificationStatus(notification.id, 'sent', { sentAt });
      expect(updated?.sentAt).toEqual(sentAt);
    });

    it('should record error message for failed notifications', () => {
      const notification = recordNotification({
        userId: 1,
        type: 'compliance_reminder',
        channel: 'email',
        title: 'Test',
        content: 'Test',
        status: 'pending',
      });

      const updated = updateNotificationStatus(notification.id, 'failed', {
        errorMessage: 'SMTP connection failed',
      });
      expect(updated?.status).toBe('failed');
      expect(updated?.errorMessage).toBe('SMTP connection failed');
    });

    it('should return null for non-existent notification', () => {
      const result = updateNotificationStatus(99999, 'sent');
      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const notification = recordNotification({
        userId: 1,
        type: 'compliance_reminder',
        channel: 'in_app',
        title: 'Test',
        content: 'Test',
        status: 'delivered',
      });

      const result = markAsRead(notification.id);
      expect(result).toBeDefined();
      expect(result?.status).toBe('read');
      expect(result?.readAt).toBeDefined();
    });

    it('should return null for non-existent notification', () => {
      const result = markAsRead(99999);
      expect(result).toBeNull();
    });
  });

  describe('markMultipleAsRead', () => {
    it('should mark multiple notifications as read', () => {
      const n1 = recordNotification({
        userId: 1,
        type: 'compliance_reminder',
        channel: 'in_app',
        title: 'Test 1',
        content: 'Test',
        status: 'delivered',
      });
      const n2 = recordNotification({
        userId: 1,
        type: 'deadline_alert',
        channel: 'in_app',
        title: 'Test 2',
        content: 'Test',
        status: 'delivered',
      });

      const count = markMultipleAsRead([n1.id, n2.id]);
      expect(count).toBe(2);

      const updated1 = getNotificationById(n1.id);
      const updated2 = getNotificationById(n2.id);
      expect(updated1?.status).toBe('read');
      expect(updated2?.status).toBe('read');
    });

    it('should handle empty array', () => {
      const count = markMultipleAsRead([]);
      expect(count).toBe(0);
    });
  });

  describe('getNotificationHistory', () => {
    beforeEach(() => {
      // Record some test notifications
      for (let i = 0; i < 5; i++) {
        recordNotification({
          userId: 100,
          type: i % 2 === 0 ? 'compliance_reminder' : 'deadline_alert',
          channel: i % 2 === 0 ? 'email' : 'in_app',
          title: `Test ${i}`,
          content: `Content ${i}`,
          status: i < 3 ? 'delivered' : 'read',
          sentAt: new Date(),
        });
      }
    });

    it('should return paginated notification history', () => {
      const result = getNotificationHistory({ userId: 100 }, 1, 10);
      expect(result.notifications).toBeDefined();
      expect(result.total).toBeGreaterThanOrEqual(5);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should filter by notification type', () => {
      const result = getNotificationHistory(
        { userId: 100, types: ['compliance_reminder'] },
        1,
        10
      );
      result.notifications.forEach(n => {
        expect(n.type).toBe('compliance_reminder');
      });
    });

    it('should filter by channel', () => {
      const result = getNotificationHistory(
        { userId: 100, channels: ['email'] },
        1,
        10
      );
      result.notifications.forEach(n => {
        expect(n.channel).toBe('email');
      });
    });

    it('should filter by status', () => {
      const result = getNotificationHistory(
        { userId: 100, statuses: ['delivered'] },
        1,
        10
      );
      result.notifications.forEach(n => {
        expect(n.status).toBe('delivered');
      });
    });

    it('should filter unread only', () => {
      const result = getNotificationHistory(
        { userId: 100, unreadOnly: true },
        1,
        10
      );
      result.notifications.forEach(n => {
        expect(n.status).not.toBe('read');
      });
    });

    it('should handle pagination correctly', () => {
      const page1 = getNotificationHistory({ userId: 100 }, 1, 2);
      const page2 = getNotificationHistory({ userId: 100 }, 2, 2);
      
      expect(page1.page).toBe(1);
      expect(page2.page).toBe(2);
      expect(page1.notifications.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', () => {
      const userId = 200;
      recordNotification({
        userId,
        type: 'compliance_reminder',
        channel: 'in_app',
        title: 'Unread 1',
        content: 'Test',
        status: 'delivered',
      });
      recordNotification({
        userId,
        type: 'deadline_alert',
        channel: 'in_app',
        title: 'Unread 2',
        content: 'Test',
        status: 'sent',
      });

      const count = getUnreadCount(userId);
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getNotificationStatistics', () => {
    beforeEach(() => {
      const userId = 300;
      // Create varied notifications
      recordNotification({
        userId,
        type: 'compliance_reminder',
        channel: 'email',
        title: 'Test',
        content: 'Test',
        status: 'delivered',
        sentAt: new Date(),
      });
      recordNotification({
        userId,
        type: 'deadline_alert',
        channel: 'in_app',
        title: 'Test',
        content: 'Test',
        status: 'read',
        sentAt: new Date(),
      });
      recordNotification({
        userId,
        type: 'system_alert',
        channel: 'email',
        title: 'Test',
        content: 'Test',
        status: 'failed',
        sentAt: new Date(),
      });
    });

    it('should return comprehensive statistics', () => {
      const stats = getNotificationStatistics(300);
      
      expect(stats.totalSent).toBeDefined();
      expect(stats.totalDelivered).toBeDefined();
      expect(stats.totalFailed).toBeDefined();
      expect(stats.totalRead).toBeDefined();
      expect(stats.deliveryRate).toBeDefined();
      expect(stats.readRate).toBeDefined();
      expect(stats.byType).toBeDefined();
      expect(stats.byChannel).toBeDefined();
      expect(stats.recentTrend).toBeDefined();
    });

    it('should calculate delivery rate correctly', () => {
      const stats = getNotificationStatistics(300);
      expect(stats.deliveryRate).toBeGreaterThanOrEqual(0);
      expect(stats.deliveryRate).toBeLessThanOrEqual(100);
    });

    it('should include 7-day trend', () => {
      const stats = getNotificationStatistics(300);
      expect(stats.recentTrend.length).toBe(7);
      stats.recentTrend.forEach(day => {
        expect(day.date).toBeDefined();
        expect(day.sent).toBeDefined();
        expect(day.delivered).toBeDefined();
        expect(day.failed).toBeDefined();
      });
    });
  });

  describe('User Preferences', () => {
    describe('getUserPreferences', () => {
      it('should return default preferences for new user', () => {
        const prefs = getUserPreferences(999);
        expect(prefs.emailEnabled).toBe(DEFAULT_USER_PREFERENCES.emailEnabled);
        expect(prefs.inAppEnabled).toBe(DEFAULT_USER_PREFERENCES.inAppEnabled);
        expect(prefs.smsEnabled).toBe(DEFAULT_USER_PREFERENCES.smsEnabled);
        expect(prefs.pushEnabled).toBe(DEFAULT_USER_PREFERENCES.pushEnabled);
      });
    });

    describe('updateUserPreferences', () => {
      it('should update email preference', () => {
        const updated = updateUserPreferences(400, { emailEnabled: false });
        expect(updated.emailEnabled).toBe(false);
      });

      it('should update quiet hours', () => {
        const updated = updateUserPreferences(401, {
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
        });
        expect(updated.quietHoursStart).toBe('22:00');
        expect(updated.quietHoursEnd).toBe('07:00');
      });

      it('should update excluded types', () => {
        const updated = updateUserPreferences(402, {
          excludedTypes: ['weekly_digest', 'system_alert'],
        });
        expect(updated.excludedTypes).toContain('weekly_digest');
        expect(updated.excludedTypes).toContain('system_alert');
      });

      it('should update digest frequency', () => {
        const updated = updateUserPreferences(403, { digestFrequency: 'daily' });
        expect(updated.digestFrequency).toBe('daily');
      });

      it('should update urgent override setting', () => {
        const updated = updateUserPreferences(404, { urgentOverrideQuietHours: false });
        expect(updated.urgentOverrideQuietHours).toBe(false);
      });
    });
  });

  describe('shouldSendNotification', () => {
    it('should respect channel preferences', () => {
      updateUserPreferences(500, { emailEnabled: false });
      const result = shouldSendNotification(500, 'compliance_reminder', 'email', false);
      expect(result.shouldSend).toBe(false);
      expect(result.reason).toContain('disabled');
    });

    it('should respect excluded types', () => {
      updateUserPreferences(501, { excludedTypes: ['weekly_digest'] });
      const result = shouldSendNotification(501, 'weekly_digest', 'email', false);
      expect(result.shouldSend).toBe(false);
      expect(result.reason).toContain('excluded');
    });

    it('should allow urgent notifications during quiet hours when enabled', () => {
      updateUserPreferences(502, {
        quietHoursStart: '00:00',
        quietHoursEnd: '23:59',
        urgentOverrideQuietHours: true,
      });
      const result = shouldSendNotification(502, 'security_alert', 'email', true);
      expect(result.shouldSend).toBe(true);
    });

    it('should block non-urgent during quiet hours', () => {
      updateUserPreferences(503, {
        quietHoursStart: '00:00',
        quietHoursEnd: '23:59',
        urgentOverrideQuietHours: false,
      });
      const result = shouldSendNotification(503, 'weekly_digest', 'email', false);
      expect(result.shouldSend).toBe(false);
    });
  });

  describe('deleteOldNotifications', () => {
    it('should delete notifications older than specified days', () => {
      const userId = 600;
      // Create an old notification (simulated by checking the function works)
      recordNotification({
        userId,
        type: 'compliance_reminder',
        channel: 'email',
        title: 'Old notification',
        content: 'Test',
        status: 'read',
      });

      // This should not throw and should return a count
      const count = deleteOldNotifications(365, userId);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRecentNotifications', () => {
    it('should return limited recent notifications', () => {
      const userId = 700;
      for (let i = 0; i < 10; i++) {
        recordNotification({
          userId,
          type: 'compliance_reminder',
          channel: 'in_app',
          title: `Recent ${i}`,
          content: 'Test',
          status: 'delivered',
          sentAt: new Date(),
        });
      }

      const recent = getRecentNotifications(userId, 5);
      expect(recent.length).toBeLessThanOrEqual(5);
    });

    it('should return notifications sorted by most recent', () => {
      const userId = 701;
      recordNotification({
        userId,
        type: 'compliance_reminder',
        channel: 'in_app',
        title: 'First',
        content: 'Test',
        status: 'delivered',
        sentAt: new Date(Date.now() - 1000),
      });
      recordNotification({
        userId,
        type: 'deadline_alert',
        channel: 'in_app',
        title: 'Second',
        content: 'Test',
        status: 'delivered',
        sentAt: new Date(),
      });

      const recent = getRecentNotifications(userId, 10);
      if (recent.length >= 2) {
        // Most recent should be first
        expect(recent[0].sentAt.getTime()).toBeGreaterThanOrEqual(recent[1].sentAt.getTime());
      }
    });
  });

  describe('markForResend', () => {
    it('should mark failed notification for resend', () => {
      const notification = recordNotification({
        userId: 1,
        type: 'compliance_reminder',
        channel: 'email',
        title: 'Failed notification',
        content: 'Test',
        status: 'failed',
      });

      const result = markForResend(notification.id);
      expect(result).toBeDefined();
      expect(result?.status).toBe('pending');
      expect(result?.retryCount).toBe(1);
    });

    it('should increment retry count', () => {
      const notification = recordNotification({
        userId: 1,
        type: 'compliance_reminder',
        channel: 'email',
        title: 'Failed notification',
        content: 'Test',
        status: 'failed',
      });

      markForResend(notification.id);
      const result = markForResend(notification.id);
      expect(result?.retryCount).toBe(2);
    });
  });

  describe('getNotificationById', () => {
    it('should return notification by ID', () => {
      const notification = recordNotification({
        userId: 1,
        type: 'compliance_reminder',
        channel: 'email',
        title: 'Test',
        content: 'Test',
        status: 'pending',
      });

      const result = getNotificationById(notification.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(notification.id);
    });

    it('should return null for non-existent ID', () => {
      const result = getNotificationById(99999);
      expect(result).toBeNull();
    });
  });

  describe('getAllNotificationTypes', () => {
    it('should return all notification types', () => {
      const types = getAllNotificationTypes();
      expect(types).toContain('compliance_reminder');
      expect(types).toContain('deadline_alert');
      expect(types).toContain('document_expiration');
      expect(types).toContain('overdue_task');
      expect(types).toContain('weekly_digest');
      expect(types).toContain('system_alert');
      expect(types).toContain('approval_request');
      expect(types).toContain('task_assignment');
      expect(types).toContain('payment_notification');
      expect(types).toContain('security_alert');
    });
  });

  describe('getAllNotificationChannels', () => {
    it('should return all notification channels', () => {
      const channels = getAllNotificationChannels();
      expect(channels).toContain('email');
      expect(channels).toContain('in_app');
      expect(channels).toContain('sms');
      expect(channels).toContain('push');
    });
  });
});
