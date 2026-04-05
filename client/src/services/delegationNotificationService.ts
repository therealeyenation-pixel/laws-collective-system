// Delegation Notification Service
// Handles email and in-app notifications for task delegations

export interface DelegationNotification {
  id: string;
  type: 'delegated_to_you' | 'delegation_accepted' | 'delegation_declined' | 'delegation_completed';
  taskId: string;
  taskType: 'article' | 'signature' | 'approval';
  taskTitle: string;
  fromUser: {
    id: string;
    name: string;
    email: string;
  };
  toUser: {
    id: string;
    name: string;
    email: string;
  };
  notes?: string;
  reason?: string;
  declineReason?: string;
  originalDueDate?: Date;
  newDueDate?: Date;
  createdAt: Date;
  read: boolean;
}

export interface DelegationEmailTemplate {
  subject: string;
  body: string;
  recipientEmail: string;
  recipientName: string;
}

// Generate email template for delegation notifications
export function generateDelegationEmail(
  notification: DelegationNotification
): DelegationEmailTemplate {
  const { type, taskTitle, fromUser, toUser, notes, reason, declineReason, newDueDate } = notification;

  switch (type) {
    case 'delegated_to_you':
      return {
        subject: `Task Delegated to You: ${taskTitle}`,
        recipientEmail: toUser.email,
        recipientName: toUser.name,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #166534;">Task Delegated to You</h2>
            <p>Hello ${toUser.name},</p>
            <p><strong>${fromUser.name}</strong> has delegated a task to you:</p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #166534; padding: 16px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0; color: #166534;">${taskTitle}</h3>
              ${reason ? `<p style="margin: 4px 0;"><strong>Reason:</strong> ${formatReason(reason)}</p>` : ''}
              ${notes ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
              ${newDueDate ? `<p style="margin: 4px 0;"><strong>Due Date:</strong> ${formatDate(newDueDate)}</p>` : ''}
            </div>
            
            <p>Please review and accept or decline this delegation at your earliest convenience.</p>
            
            <a href="/task-delegation" style="display: inline-block; background: #166534; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
              View Delegation
            </a>
          </div>
        `,
      };

    case 'delegation_accepted':
      return {
        subject: `Delegation Accepted: ${taskTitle}`,
        recipientEmail: fromUser.email,
        recipientName: fromUser.name,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #166534;">Delegation Accepted</h2>
            <p>Hello ${fromUser.name},</p>
            <p><strong>${toUser.name}</strong> has accepted your delegated task:</p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #166534; padding: 16px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0; color: #166534;">${taskTitle}</h3>
              <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #166534;">Accepted</span></p>
            </div>
            
            <p>The task has been transferred and ${toUser.name} is now responsible for its completion.</p>
          </div>
        `,
      };

    case 'delegation_declined':
      return {
        subject: `Delegation Declined: ${taskTitle}`,
        recipientEmail: fromUser.email,
        recipientName: fromUser.name,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Delegation Declined</h2>
            <p>Hello ${fromUser.name},</p>
            <p><strong>${toUser.name}</strong> has declined your delegated task:</p>
            
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0; color: #dc2626;">${taskTitle}</h3>
              ${declineReason ? `<p style="margin: 4px 0;"><strong>Reason:</strong> ${declineReason}</p>` : ''}
            </div>
            
            <p>The task remains assigned to you. You may delegate it to someone else or complete it yourself.</p>
          </div>
        `,
      };

    case 'delegation_completed':
      return {
        subject: `Delegated Task Completed: ${taskTitle}`,
        recipientEmail: fromUser.email,
        recipientName: fromUser.name,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #166534;">Delegated Task Completed</h2>
            <p>Hello ${fromUser.name},</p>
            <p><strong>${toUser.name}</strong> has completed the task you delegated:</p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #166534; padding: 16px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0; color: #166534;">${taskTitle}</h3>
              <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #166534;">Completed</span></p>
            </div>
          </div>
        `,
      };

    default:
      return {
        subject: `Delegation Update: ${taskTitle}`,
        recipientEmail: toUser.email,
        recipientName: toUser.name,
        body: `<p>You have a delegation update for: ${taskTitle}</p>`,
      };
  }
}

function formatReason(reason: string): string {
  const reasonMap: Record<string, string> = {
    workload: 'High workload / capacity constraints',
    expertise: 'Task requires different expertise',
    pto: 'Planned time off / vacation',
    priority: 'Conflicting priorities',
    reassignment: 'Role or responsibility change',
    collaboration: 'Better suited for team collaboration',
    other: 'Other reason',
  };
  return reasonMap[reason] || reason;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export interface InAppDelegationNotification {
  id: string;
  type: 'delegation';
  subType: DelegationNotification['type'];
  title: string;
  message: string;
  link: string;
  createdAt: Date;
  read: boolean;
  metadata: {
    taskId: string;
    taskType: string;
    fromUserId: string;
    toUserId: string;
  };
}

export function generateInAppNotification(
  notification: DelegationNotification
): InAppDelegationNotification {
  const { id, type, taskId, taskType, taskTitle, fromUser, toUser, createdAt, read } = notification;

  let title = '';
  let message = '';

  switch (type) {
    case 'delegated_to_you':
      title = 'Task Delegated to You';
      message = `${fromUser.name} delegated "${taskTitle}" to you`;
      break;
    case 'delegation_accepted':
      title = 'Delegation Accepted';
      message = `${toUser.name} accepted your delegation of "${taskTitle}"`;
      break;
    case 'delegation_declined':
      title = 'Delegation Declined';
      message = `${toUser.name} declined your delegation of "${taskTitle}"`;
      break;
    case 'delegation_completed':
      title = 'Delegated Task Completed';
      message = `${toUser.name} completed "${taskTitle}"`;
      break;
  }

  return {
    id,
    type: 'delegation',
    subType: type,
    title,
    message,
    link: '/task-delegation',
    createdAt,
    read,
    metadata: {
      taskId,
      taskType,
      fromUserId: fromUser.id,
      toUserId: toUser.id,
    },
  };
}

export async function sendDelegationNotification(
  notification: DelegationNotification,
  options: { email?: boolean; inApp?: boolean } = { email: true, inApp: true }
): Promise<{ emailSent: boolean; inAppSent: boolean }> {
  const result = { emailSent: false, inAppSent: false };

  if (options.email) {
    const emailTemplate = generateDelegationEmail(notification);
    console.log('[DelegationNotification] Sending email:', emailTemplate.subject);
    result.emailSent = true;
  }

  if (options.inApp) {
    const inAppNotification = generateInAppNotification(notification);
    console.log('[DelegationNotification] Creating in-app notification:', inAppNotification.title);
    result.inAppSent = true;
  }

  return result;
}

export function getUnreadDelegationCount(notifications: DelegationNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

export function groupNotificationsByType(
  notifications: DelegationNotification[]
): Record<DelegationNotification['type'], DelegationNotification[]> {
  return notifications.reduce(
    (acc, notification) => {
      if (!acc[notification.type]) {
        acc[notification.type] = [];
      }
      acc[notification.type].push(notification);
      return acc;
    },
    {} as Record<DelegationNotification['type'], DelegationNotification[]>
  );
}
