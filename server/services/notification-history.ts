/**
 * Notification History Service
 * 
 * Provides functionality for tracking, querying, and managing notification history
 * including delivery status, statistics, and user preferences.
 */

export interface NotificationRecord {
  id: number;
  userId: number;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  content: string;
  status: DeliveryStatus;
  createdAt: Date;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  errorMessage?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  metadata?: Record<string, unknown>;
  retryCount?: number;
}

export type NotificationType = 
  | 'compliance_reminder'
  | 'deadline_alert'
  | 'document_expiration'
  | 'overdue_task'
  | 'weekly_digest'
  | 'system_alert'
  | 'approval_request'
  | 'task_assignment'
  | 'payment_notification'
  | 'security_alert';

export type NotificationChannel = 'email' | 'in_app' | 'sms' | 'push';

export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'read';

export interface NotificationFilter {
  userId?: number;
  types?: NotificationType[];
  channels?: NotificationChannel[];
  statuses?: DeliveryStatus[];
  startDate?: Date;
  endDate?: Date;
  unreadOnly?: boolean;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

export interface NotificationStatistics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalRead: number;
  deliveryRate: number;
  readRate: number;
  byType: Record<NotificationType, number>;
  byChannel: Record<NotificationChannel, number>;
  byStatus: Record<DeliveryStatus, number>;
  recentTrend: {
    date: string;
    sent: number;
    delivered: number;
    failed: number;
  }[];
}

export interface UserNotificationPreferences {
  userId: number;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;
  excludedTypes: NotificationType[];
  digestFrequency: 'daily' | 'weekly' | 'never';
  urgentOverrideQuietHours: boolean;
}

// In-memory storage for demo purposes
const notificationHistory: NotificationRecord[] = [];
const userPreferences: Map<number, UserNotificationPreferences> = new Map();
let nextNotificationId = 1;

/**
 * Record a new notification in history
 */
export function recordNotification(
  notification: Omit<NotificationRecord, 'id' | 'createdAt'> & { createdAt?: Date }
): NotificationRecord {
  const now = new Date();
  const record: NotificationRecord = {
    ...notification,
    id: nextNotificationId++,
    createdAt: notification.createdAt || now,
    sentAt: notification.sentAt || now,
  };
  notificationHistory.push(record);
  return record;
}

/**
 * Update notification status
 */
export function updateNotificationStatus(
  notificationId: number,
  status: DeliveryStatus,
  options?: { sentAt?: Date; errorMessage?: string }
): NotificationRecord | null {
  const notification = notificationHistory.find(n => n.id === notificationId);
  if (!notification) return null;

  notification.status = status;
  if (options?.errorMessage) {
    notification.errorMessage = options.errorMessage;
  }
  if (options?.sentAt) {
    notification.sentAt = options.sentAt;
  }
  if (status === 'delivered') {
    notification.deliveredAt = new Date();
  }
  if (status === 'read') {
    notification.readAt = new Date();
  }

  return notification;
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: number): NotificationRecord | null {
  return updateNotificationStatus(notificationId, 'read');
}

/**
 * Mark multiple notifications as read
 */
export function markMultipleAsRead(notificationIds: number[]): number {
  let count = 0;
  for (const id of notificationIds) {
    if (markAsRead(id)) count++;
  }
  return count;
}

/**
 * Get notification history with filters and pagination
 */
export function getNotificationHistory(
  filter: NotificationFilter,
  page: number = 1,
  pageSize: number = 20
): {
  notifications: NotificationRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  let filtered = [...notificationHistory];

  // Apply filters
  if (filter.userId !== undefined) {
    filtered = filtered.filter(n => n.userId === filter.userId);
  }
  if (filter.types && filter.types.length > 0) {
    filtered = filtered.filter(n => filter.types!.includes(n.type));
  }
  if (filter.channels && filter.channels.length > 0) {
    filtered = filtered.filter(n => filter.channels!.includes(n.channel));
  }
  if (filter.statuses && filter.statuses.length > 0) {
    filtered = filtered.filter(n => filter.statuses!.includes(n.status));
  }
  if (filter.startDate) {
    filtered = filtered.filter(n => n.sentAt >= filter.startDate!);
  }
  if (filter.endDate) {
    filtered = filtered.filter(n => n.sentAt <= filter.endDate!);
  }
  if (filter.unreadOnly) {
    filtered = filtered.filter(n => n.status !== 'read');
  }
  if (filter.relatedEntityType) {
    filtered = filtered.filter(n => n.relatedEntityType === filter.relatedEntityType);
  }
  if (filter.relatedEntityId !== undefined) {
    filtered = filtered.filter(n => n.relatedEntityId === filter.relatedEntityId);
  }

  // Sort by sentAt descending (most recent first)
  filtered.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());

  // Paginate
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const notifications = filtered.slice(start, start + pageSize);

  return {
    notifications,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Get unread notification count for a user
 */
export function getUnreadCount(userId: number): number {
  return notificationHistory.filter(
    n => n.userId === userId && n.status !== 'read'
  ).length;
}

/**
 * Calculate notification statistics
 */
export function getNotificationStatistics(
  userId?: number,
  startDate?: Date,
  endDate?: Date
): NotificationStatistics {
  let filtered = [...notificationHistory];

  if (userId !== undefined) {
    filtered = filtered.filter(n => n.userId === userId);
  }
  if (startDate) {
    filtered = filtered.filter(n => n.sentAt >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(n => n.sentAt <= endDate);
  }

  const totalSent = filtered.length;
  const totalDelivered = filtered.filter(n => 
    n.status === 'delivered' || n.status === 'read'
  ).length;
  const totalFailed = filtered.filter(n => 
    n.status === 'failed' || n.status === 'bounced'
  ).length;
  const totalRead = filtered.filter(n => n.status === 'read').length;

  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
  const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;

  // Count by type
  const byType: Record<NotificationType, number> = {
    compliance_reminder: 0,
    deadline_alert: 0,
    document_expiration: 0,
    overdue_task: 0,
    weekly_digest: 0,
    system_alert: 0,
    approval_request: 0,
    task_assignment: 0,
    payment_notification: 0,
    security_alert: 0,
  };
  for (const n of filtered) {
    byType[n.type]++;
  }

  // Count by channel
  const byChannel: Record<NotificationChannel, number> = {
    email: 0,
    in_app: 0,
    sms: 0,
    push: 0,
  };
  for (const n of filtered) {
    byChannel[n.channel]++;
  }

  // Count by status
  const byStatus: Record<DeliveryStatus, number> = {
    pending: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    bounced: 0,
    read: 0,
  };
  for (const n of filtered) {
    byStatus[n.status]++;
  }

  // Calculate recent trend (last 7 days)
  const recentTrend: NotificationStatistics['recentTrend'] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayNotifications = filtered.filter(n => {
      const nDateStr = n.sentAt.toISOString().split('T')[0];
      return nDateStr === dateStr;
    });

    recentTrend.push({
      date: dateStr,
      sent: dayNotifications.length,
      delivered: dayNotifications.filter(n => 
        n.status === 'delivered' || n.status === 'read'
      ).length,
      failed: dayNotifications.filter(n => 
        n.status === 'failed' || n.status === 'bounced'
      ).length,
    });
  }

  return {
    totalSent,
    totalDelivered,
    totalFailed,
    totalRead,
    deliveryRate,
    readRate,
    byType,
    byChannel,
    byStatus,
    recentTrend,
  };
}

/**
 * Default user notification preferences
 */
export const DEFAULT_USER_PREFERENCES: Omit<UserNotificationPreferences, 'userId'> = {
  emailEnabled: true,
  inAppEnabled: true,
  smsEnabled: false,
  pushEnabled: false,
  excludedTypes: [],
  digestFrequency: 'weekly',
  urgentOverrideQuietHours: true,
};

/**
 * Get user notification preferences
 */
export function getUserPreferences(userId: number): UserNotificationPreferences {
  const existing = userPreferences.get(userId);
  if (existing) return existing;

  // Return default preferences
  return {
    userId,
    ...DEFAULT_USER_PREFERENCES,
  };
}

/**
 * Update user notification preferences
 */
export function updateUserPreferences(
  userId: number,
  preferences: Partial<Omit<UserNotificationPreferences, 'userId'>>
): UserNotificationPreferences {
  const current = getUserPreferences(userId);
  const updated: UserNotificationPreferences = {
    ...current,
    ...preferences,
    userId, // Ensure userId is not overwritten
  };
  userPreferences.set(userId, updated);
  return updated;
}

/**
 * Check if a notification should be sent based on user preferences
 */
export function shouldSendNotification(
  userId: number,
  type: NotificationType,
  channel: NotificationChannel,
  isUrgent: boolean = false
): { shouldSend: boolean; reason?: string } {
  const prefs = getUserPreferences(userId);

  // Check if channel is enabled
  if (channel === 'email' && !prefs.emailEnabled) {
    return { shouldSend: false, reason: 'Email notifications disabled' };
  }
  if (channel === 'in_app' && !prefs.inAppEnabled) {
    return { shouldSend: false, reason: 'In-app notifications disabled' };
  }
  if (channel === 'sms' && !prefs.smsEnabled) {
    return { shouldSend: false, reason: 'SMS notifications disabled' };
  }
  if (channel === 'push' && !prefs.pushEnabled) {
    return { shouldSend: false, reason: 'Push notifications disabled' };
  }

  // Check if type is excluded
  if (prefs.excludedTypes.includes(type)) {
    return { shouldSend: false, reason: `Notification type '${type}' is excluded` };
  }

  // Check quiet hours (unless urgent and override is enabled)
  if (prefs.quietHoursStart && prefs.quietHoursEnd) {
    if (isUrgent && prefs.urgentOverrideQuietHours) {
      return { shouldSend: true };
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const inQuietHours = isTimeInRange(
      currentTime,
      prefs.quietHoursStart,
      prefs.quietHoursEnd
    );

    if (inQuietHours) {
      return { shouldSend: false, reason: 'Currently in quiet hours' };
    }
  }

  return { shouldSend: true };
}

/**
 * Helper to check if time is within a range
 */
function isTimeInRange(time: string, start: string, end: string): boolean {
  // Handle overnight ranges (e.g., 22:00 to 07:00)
  if (start > end) {
    return time >= start || time <= end;
  }
  return time >= start && time <= end;
}

/**
 * Delete old notifications (retention policy)
 */
export function deleteOldNotifications(
  olderThanDays: number,
  userId?: number
): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const initialLength = notificationHistory.length;
  
  // Filter out old notifications
  const toKeep = notificationHistory.filter(n => {
    if (userId !== undefined && n.userId !== userId) return true;
    return n.sentAt > cutoffDate;
  });

  // Update the array in place
  notificationHistory.length = 0;
  notificationHistory.push(...toKeep);

  return initialLength - notificationHistory.length;
}

/**
 * Get recent notifications for a user (for notification bell/dropdown)
 */
export function getRecentNotifications(
  userId: number,
  limit: number = 10
): NotificationRecord[] {
  return notificationHistory
    .filter(n => n.userId === userId)
    .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
    .slice(0, limit);
}

/**
 * Resend a failed notification
 */
export function markForResend(notificationId: number): NotificationRecord | null {
  const notification = notificationHistory.find(n => n.id === notificationId);
  if (!notification) return null;
  if (notification.status !== 'failed' && notification.status !== 'bounced' && notification.status !== 'pending') {
    return null;
  }

  notification.status = 'pending';
  notification.errorMessage = undefined;
  notification.retryCount = (notification.retryCount || 0) + 1;
  return notification;
}

/**
 * Get notification by ID
 */
export function getNotificationById(notificationId: number): NotificationRecord | null {
  return notificationHistory.find(n => n.id === notificationId) || null;
}

/**
 * Clear all notifications for testing
 */
export function clearAllNotifications(): void {
  notificationHistory.length = 0;
  nextNotificationId = 1;
}

/**
 * Clear all preferences for testing
 */
export function clearAllPreferences(): void {
  userPreferences.clear();
}

/**
 * Get all notification types
 */
export function getAllNotificationTypes(): NotificationType[] {
  return [
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
}

/**
 * Get all notification channels
 */
export function getAllNotificationChannels(): NotificationChannel[] {
  return ['email', 'in_app', 'sms', 'push'];
}
