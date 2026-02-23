import { getDb } from "../db";
import { 
  meetings, 
  meetingParticipants, 
  meetingReminders,
  notifications,
  users 
} from "../../drizzle/schema";
import { eq, and, gte, lte, isNull, inArray } from "drizzle-orm";
import { sendMeetingReminder } from "./emailNotifications";

/**
 * Meeting Reminder Service
 * Handles scheduled reminders for upcoming meetings
 */

interface ReminderResult {
  processed: number;
  remindersSent: number;
  errors: string[];
}

/**
 * Get meetings that need reminders sent
 * @param minutesBefore - How many minutes before the meeting to send reminder
 * @param windowMinutes - Time window to check (e.g., 5 minutes)
 */
async function getMeetingsNeedingReminders(
  minutesBefore: number,
  windowMinutes: number = 5
): Promise<Array<{
  meetingId: number;
  title: string;
  description: string | null;
  scheduledAt: Date;
  duration: number;
  roomName: string | null;
  hostId: number;
  hostName: string | null;
  hostEmail: string | null;
}>> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const targetTime = new Date(now.getTime() + minutesBefore * 60000);
  const windowStart = new Date(targetTime.getTime() - (windowMinutes / 2) * 60000);
  const windowEnd = new Date(targetTime.getTime() + (windowMinutes / 2) * 60000);

  // Get meetings scheduled within the reminder window
  const upcomingMeetings = await db
    .select({
      meetingId: meetings.id,
      title: meetings.title,
      description: meetings.description,
      scheduledAt: meetings.scheduledAt,
      duration: meetings.duration,
      roomName: meetings.roomName,
      hostId: meetings.hostId,
      hostName: users.name,
      hostEmail: users.email,
    })
    .from(meetings)
    .innerJoin(users, eq(meetings.hostId, users.id))
    .where(and(
      gte(meetings.scheduledAt, windowStart),
      lte(meetings.scheduledAt, windowEnd),
      eq(meetings.status, "scheduled")
    ));

  return upcomingMeetings;
}

/**
 * Check if a reminder has already been sent for a meeting
 */
async function hasReminderBeenSent(
  meetingId: number,
  reminderType: "15_min" | "1_hour" | "24_hour"
): Promise<boolean> {
  const db = await getDb();
  if (!db) return true; // Assume sent if we can't check

  const existing = await db
    .select({ id: meetingReminders.id })
    .from(meetingReminders)
    .where(and(
      eq(meetingReminders.meetingId, meetingId),
      eq(meetingReminders.reminderType, reminderType)
    ))
    .limit(1);

  return existing.length > 0;
}

/**
 * Record that a reminder was sent
 */
async function recordReminderSent(
  meetingId: number,
  reminderType: "15_min" | "1_hour" | "24_hour",
  recipientCount: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(meetingReminders).values({
    meetingId,
    reminderType,
    sentAt: new Date(),
    recipientCount,
  });
}

/**
 * Get participant user IDs for a meeting
 */
async function getMeetingParticipantIds(meetingId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  const participants = await db
    .select({ userId: meetingParticipants.userId })
    .from(meetingParticipants)
    .where(and(
      eq(meetingParticipants.meetingId, meetingId),
      eq(meetingParticipants.inviteStatus, "accepted")
    ));

  return participants
    .filter((p: any) => p.userId !== null)
    .map((p: any) => p.userId as number);
}

/**
 * Create in-app notification for meeting reminder
 */
async function createMeetingReminderNotification(
  userId: number,
  meeting: {
    meetingId: number;
    title: string;
    scheduledAt: Date;
    roomName: string | null;
  },
  minutesBefore: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const timeText = minutesBefore >= 60 
    ? `${Math.floor(minutesBefore / 60)} hour${minutesBefore >= 120 ? "s" : ""}`
    : `${minutesBefore} minutes`;

  await db.insert(notifications).values({
    userId,
    type: "alert",
    title: `⏰ Meeting in ${timeText}`,
    message: `"${meeting.title}" starts in ${timeText}. Click to join.`,
    referenceType: "meeting",
    referenceId: meeting.meetingId,
    actionUrl: meeting.roomName 
      ? `/meetings?join=${meeting.roomName}` 
      : `/meetings?id=${meeting.meetingId}`,
    isPriority: minutesBefore <= 15,
    metadata: {
      meetingId: meeting.meetingId,
      scheduledAt: meeting.scheduledAt.toISOString(),
      reminderMinutes: minutesBefore,
    },
  });
}

/**
 * Process meeting reminders for a specific time window
 */
async function processRemindersForWindow(
  minutesBefore: number,
  reminderType: "15_min" | "1_hour" | "24_hour"
): Promise<ReminderResult> {
  const result: ReminderResult = {
    processed: 0,
    remindersSent: 0,
    errors: [],
  };

  try {
    const meetingsToRemind = await getMeetingsNeedingReminders(minutesBefore);
    result.processed = meetingsToRemind.length;

    for (const meeting of meetingsToRemind) {
      try {
        // Check if reminder already sent
        const alreadySent = await hasReminderBeenSent(meeting.meetingId, reminderType);
        if (alreadySent) {
          continue;
        }

        // Get participant IDs
        const participantIds = await getMeetingParticipantIds(meeting.meetingId);
        
        // Include host if not already in participants
        if (!participantIds.includes(meeting.hostId)) {
          participantIds.push(meeting.hostId);
        }

        if (participantIds.length === 0) {
          continue;
        }

        // Calculate end time
        const endTime = new Date(new Date(meeting.scheduledAt).getTime() + meeting.duration * 60000);

        // Send email reminders
        const emailResult = await sendMeetingReminder(
          {
            meetingId: meeting.meetingId,
            title: meeting.title,
            description: meeting.description,
            startTime: meeting.scheduledAt,
            endTime,
            organizerName: meeting.hostName || "Meeting Organizer",
            meetingLink: meeting.roomName 
              ? `${process.env.VITE_APP_URL || ""}/meetings?join=${meeting.roomName}`
              : undefined,
          },
          participantIds,
          minutesBefore
        );

        // Create in-app notifications
        for (const participantId of participantIds) {
          await createMeetingReminderNotification(
            participantId,
            {
              meetingId: meeting.meetingId,
              title: meeting.title,
              scheduledAt: meeting.scheduledAt,
              roomName: meeting.roomName,
            },
            minutesBefore
          );
        }

        // Record reminder sent
        await recordReminderSent(meeting.meetingId, reminderType, participantIds.length);
        result.remindersSent += participantIds.length;

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`Meeting ${meeting.meetingId}: ${errorMsg}`);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(`Failed to process reminders: ${errorMsg}`);
  }

  return result;
}

/**
 * Process 15-minute meeting reminders
 */
export async function process15MinuteReminders(): Promise<ReminderResult> {
  console.log("[MeetingReminders] Processing 15-minute reminders...");
  return processRemindersForWindow(15, "15_min");
}

/**
 * Process 1-hour meeting reminders
 */
export async function process1HourReminders(): Promise<ReminderResult> {
  console.log("[MeetingReminders] Processing 1-hour reminders...");
  return processRemindersForWindow(60, "1_hour");
}

/**
 * Process 24-hour meeting reminders
 */
export async function process24HourReminders(): Promise<ReminderResult> {
  console.log("[MeetingReminders] Processing 24-hour reminders...");
  return processRemindersForWindow(1440, "24_hour");
}

/**
 * Process all meeting reminders (called by scheduler)
 */
export async function processAllMeetingReminders(): Promise<{
  fifteenMin: ReminderResult;
  oneHour: ReminderResult;
  twentyFourHour: ReminderResult;
}> {
  const [fifteenMin, oneHour, twentyFourHour] = await Promise.all([
    process15MinuteReminders(),
    process1HourReminders(),
    process24HourReminders(),
  ]);

  console.log("[MeetingReminders] Completed:", {
    fifteenMin: { sent: fifteenMin.remindersSent, errors: fifteenMin.errors.length },
    oneHour: { sent: oneHour.remindersSent, errors: oneHour.errors.length },
    twentyFourHour: { sent: twentyFourHour.remindersSent, errors: twentyFourHour.errors.length },
  });

  return { fifteenMin, oneHour, twentyFourHour };
}
