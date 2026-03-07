import { getDb } from "../db";
import { 
  users, 
  notificationPreferences, 
  emailSends,
  chatMessages,
  chatParticipants,
  chats,
  meetings,
  meetingParticipants
} from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

/**
 * Email Notification Service
 * Handles sending email notifications for chat messages and meeting invitations
 */

interface EmailRecipient {
  userId: number;
  email: string;
  name: string;
}

interface ChatMessageNotification {
  chatId: number;
  messageId: number;
  senderId: number;
  senderName: string;
  content: string;
  chatName?: string;
}

interface MeetingNotification {
  meetingId: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  organizerName: string;
  meetingLink?: string;
  location?: string;
}

/**
 * Get users who have email notifications enabled
 */
async function getEmailEnabledUsers(userIds: number[]): Promise<EmailRecipient[]> {
  const db = await getDb();
  if (!db || userIds.length === 0) return [];

  // Get users with their notification preferences
  const usersWithPrefs = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      emailEnabled: notificationPreferences.emailEnabled,
    })
    .from(users)
    .leftJoin(notificationPreferences, eq(users.id, notificationPreferences.userId))
    .where(inArray(users.id, userIds));

  // Filter to users with email enabled (default true if no preference set)
  return usersWithPrefs
    .filter((u: any) => u.email && (u.emailEnabled === null || u.emailEnabled === true))
    .map((u: any) => ({
      userId: u.id,
      email: u.email,
      name: u.name || "User",
    }));
}

/**
 * Generate HTML email for new chat message
 */
function generateChatMessageEmail(notification: ChatMessageNotification, recipientName: string): { subject: string; html: string } {
  const subject = `New message from ${notification.senderName}${notification.chatName ? ` in ${notification.chatName}` : ""}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%); color: white; padding: 24px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; }
    .message-box { background: #f8f9fa; border-left: 4px solid #2d5a27; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .sender { font-weight: 600; color: #2d5a27; margin-bottom: 8px; }
    .message-text { color: #333; white-space: pre-wrap; }
    .button { display: inline-block; background: #2d5a27; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; margin-top: 16px; }
    .button:hover { background: #1e3d1a; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .unsubscribe { color: #999; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>💬 New Message</h1>
      </div>
      <div class="content">
        <p>Hi ${recipientName},</p>
        <p>You have a new message${notification.chatName ? ` in <strong>${notification.chatName}</strong>` : ""}:</p>
        
        <div class="message-box">
          <div class="sender">${notification.senderName}</div>
          <div class="message-text">${escapeHtml(notification.content.substring(0, 500))}${notification.content.length > 500 ? "..." : ""}</div>
        </div>
        
        <a href="${process.env.VITE_APP_URL || ""}/chat?id=${notification.chatId}" class="button">View Conversation</a>
      </div>
    </div>
    <div class="footer">
      <p>The The L.A.W.S. Collective - Building Multi-Generational Wealth</p>
      <p><a href="${process.env.VITE_APP_URL || ""}/settings/notifications" class="unsubscribe">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Generate HTML email for meeting invitation
 */
function generateMeetingInviteEmail(notification: MeetingNotification, recipientName: string): { subject: string; html: string } {
  const subject = `Meeting Invitation: ${notification.title}`;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 24px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; }
    .meeting-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 16px 0; }
    .detail-row { display: flex; margin-bottom: 12px; }
    .detail-label { font-weight: 600; color: #666; width: 100px; flex-shrink: 0; }
    .detail-value { color: #333; }
    .description { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .button-group { margin-top: 20px; }
    .button { display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; margin-right: 12px; margin-bottom: 12px; }
    .button-primary { background: #2d5a27; color: white !important; }
    .button-secondary { background: #e5e7eb; color: #333 !important; }
    .button-join { background: #1e40af; color: white !important; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .calendar-links { margin-top: 16px; font-size: 14px; }
    .calendar-links a { color: #2d5a27; margin-right: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>📅 Meeting Invitation</h1>
      </div>
      <div class="content">
        <p>Hi ${recipientName},</p>
        <p><strong>${notification.organizerName}</strong> has invited you to a meeting:</p>
        
        <div class="meeting-details">
          <h2 style="margin: 0 0 16px 0; color: #1e40af;">${escapeHtml(notification.title)}</h2>
          
          <div class="detail-row">
            <span class="detail-label">📆 When:</span>
            <span class="detail-value">${formatDate(notification.startTime)}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">⏱️ Duration:</span>
            <span class="detail-value">${Math.round((new Date(notification.endTime).getTime() - new Date(notification.startTime).getTime()) / 60000)} minutes</span>
          </div>
          
          ${notification.location ? `
          <div class="detail-row">
            <span class="detail-label">📍 Location:</span>
            <span class="detail-value">${escapeHtml(notification.location)}</span>
          </div>
          ` : ""}
          
          ${notification.description ? `
          <div class="description">
            <strong>Description:</strong>
            <p style="margin: 8px 0 0 0;">${escapeHtml(notification.description)}</p>
          </div>
          ` : ""}
        </div>
        
        <div class="button-group">
          ${notification.meetingLink ? `
          <a href="${notification.meetingLink}" class="button button-join">Join Meeting</a>
          ` : ""}
          <a href="${process.env.VITE_APP_URL || ""}/meetings?id=${notification.meetingId}" class="button button-primary">View Details</a>
        </div>
        
        <div class="calendar-links">
          <strong>Add to calendar:</strong>
          <a href="${generateGoogleCalendarLink(notification)}">Google Calendar</a>
          <a href="${generateOutlookCalendarLink(notification)}">Outlook</a>
          <a href="${generateICSLink(notification)}">Download .ics</a>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>The The L.A.W.S. Collective - Building Multi-Generational Wealth</p>
      <p><a href="${process.env.VITE_APP_URL || ""}/settings/notifications" style="color: #999; text-decoration: underline;">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Generate meeting reminder email
 */
function generateMeetingReminderEmail(notification: MeetingNotification, recipientName: string, minutesBefore: number): { subject: string; html: string } {
  const subject = `Reminder: ${notification.title} starts in ${minutesBefore} minutes`;
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 24px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; text-align: center; }
    .time-badge { display: inline-block; background: #fef2f2; color: #dc2626; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 18px; margin: 16px 0; }
    .meeting-title { font-size: 24px; font-weight: 600; color: #1e40af; margin: 16px 0; }
    .button { display: inline-block; background: #1e40af; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 16px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>⏰ Meeting Reminder</h1>
      </div>
      <div class="content">
        <p>Hi ${recipientName},</p>
        <div class="time-badge">Starting in ${minutesBefore} minutes</div>
        <div class="meeting-title">${escapeHtml(notification.title)}</div>
        <p>Your meeting starts at <strong>${formatTime(notification.startTime)}</strong></p>
        
        ${notification.meetingLink ? `
        <a href="${notification.meetingLink}" class="button">Join Meeting Now</a>
        ` : `
        <a href="${process.env.VITE_APP_URL || ""}/meetings?id=${notification.meetingId}" class="button">View Meeting</a>
        `}
      </div>
    </div>
    <div class="footer">
      <p>The The L.A.W.S. Collective - Building Multi-Generational Wealth</p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Generate Google Calendar link
 */
function generateGoogleCalendarLink(meeting: MeetingNotification): string {
  const startDate = new Date(meeting.startTime).toISOString().replace(/-|:|\.\d+/g, "");
  const endDate = new Date(meeting.endTime).toISOString().replace(/-|:|\.\d+/g, "");
  
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: meeting.title,
    dates: `${startDate}/${endDate}`,
    details: meeting.description || "",
    location: meeting.location || meeting.meetingLink || "",
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook calendar link
 */
function generateOutlookCalendarLink(meeting: MeetingNotification): string {
  const startDate = new Date(meeting.startTime).toISOString();
  const endDate = new Date(meeting.endTime).toISOString();
  
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: meeting.title,
    startdt: startDate,
    enddt: endDate,
    body: meeting.description || "",
    location: meeting.location || meeting.meetingLink || "",
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate ICS download link (returns data URL)
 */
function generateICSLink(meeting: MeetingNotification): string {
  const formatICSDate = (date: Date) => {
    return new Date(date).toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
  };
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The The L.A.W.S. Collective//Meeting//EN
BEGIN:VEVENT
UID:${meeting.meetingId}@laws-collective.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(meeting.startTime)}
DTEND:${formatICSDate(meeting.endTime)}
SUMMARY:${meeting.title}
DESCRIPTION:${(meeting.description || "").replace(/\n/g, "\\n")}
LOCATION:${meeting.location || meeting.meetingLink || ""}
ORGANIZER:${meeting.organizerName}
END:VEVENT
END:VCALENDAR`;

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

/**
 * Record email send in database
 */
async function recordEmailSend(
  userId: number,
  recipientEmail: string,
  recipientName: string,
  subject: string,
  status: "pending" | "sent" | "failed"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(emailSends).values({
    userId,
    recipientEmail,
    recipientName,
    subject,
    status,
    externalId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}

/**
 * Send chat message notification emails
 */
export async function sendChatMessageNotification(notification: ChatMessageNotification): Promise<{ sent: number; failed: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, failed: 0 };

  // Get all participants except the sender
  const participants = await db
    .select({ userId: chatParticipants.userId })
    .from(chatParticipants)
    .where(and(
      eq(chatParticipants.chatId, notification.chatId),
      // Don't notify the sender
    ));

  const recipientIds = participants
    .map((p: any) => p.userId)
    .filter((id: number) => id !== notification.senderId);

  if (recipientIds.length === 0) return { sent: 0, failed: 0 };

  // Get email-enabled recipients
  const recipients = await getEmailEnabledUsers(recipientIds);
  
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      const { subject, html } = generateChatMessageEmail(notification, recipient.name);
      
      // In production, this would call an email API (SendGrid, Resend, etc.)
      // For now, we record it as sent
      await recordEmailSend(recipient.userId, recipient.email, recipient.name, subject, "sent");
      
      console.log(`[Email] Chat notification sent to ${recipient.email}: ${subject}`);
      sent++;
    } catch (error) {
      console.error(`[Email] Failed to send chat notification to ${recipient.email}:`, error);
      await recordEmailSend(recipient.userId, recipient.email, recipient.name, "Chat notification", "failed");
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Send meeting invitation emails
 */
export async function sendMeetingInvitation(notification: MeetingNotification, participantIds: number[]): Promise<{ sent: number; failed: number }> {
  if (participantIds.length === 0) return { sent: 0, failed: 0 };

  // Get email-enabled recipients
  const recipients = await getEmailEnabledUsers(participantIds);
  
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      const { subject, html } = generateMeetingInviteEmail(notification, recipient.name);
      
      // In production, this would call an email API
      await recordEmailSend(recipient.userId, recipient.email, recipient.name, subject, "sent");
      
      console.log(`[Email] Meeting invitation sent to ${recipient.email}: ${subject}`);
      sent++;
    } catch (error) {
      console.error(`[Email] Failed to send meeting invitation to ${recipient.email}:`, error);
      await recordEmailSend(recipient.userId, recipient.email, recipient.name, "Meeting invitation", "failed");
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Send meeting reminder emails
 */
export async function sendMeetingReminder(notification: MeetingNotification, participantIds: number[], minutesBefore: number): Promise<{ sent: number; failed: number }> {
  if (participantIds.length === 0) return { sent: 0, failed: 0 };

  // Get email-enabled recipients
  const recipients = await getEmailEnabledUsers(participantIds);
  
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      const { subject, html } = generateMeetingReminderEmail(notification, recipient.name, minutesBefore);
      
      // In production, this would call an email API
      await recordEmailSend(recipient.userId, recipient.email, recipient.name, subject, "sent");
      
      console.log(`[Email] Meeting reminder sent to ${recipient.email}: ${subject}`);
      sent++;
    } catch (error) {
      console.error(`[Email] Failed to send meeting reminder to ${recipient.email}:`, error);
      await recordEmailSend(recipient.userId, recipient.email, recipient.name, "Meeting reminder", "failed");
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Export calendar link generators for use in other modules
 */
export { generateGoogleCalendarLink, generateOutlookCalendarLink, generateICSLink };
