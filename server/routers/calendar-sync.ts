import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { meetings, meetingParticipants, users } from "../../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Calendar Sync Router
 * Handles calendar integration with Google Calendar and Microsoft Outlook
 */

// Generate ICS file content for a meeting
function generateICSContent(meeting: {
  id: number;
  title: string;
  description?: string | null;
  scheduledAt: Date;
  duration: number;
  location?: string | null;
  roomName?: string | null;
  organizerName: string;
  organizerEmail: string;
}): string {
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
  };

  const endTime = new Date(new Date(meeting.scheduledAt).getTime() + meeting.duration * 60000);
  const uid = `meeting-${meeting.id}@laws-collective.com`;
  const location = meeting.location || (meeting.roomName ? `${process.env.VITE_APP_URL || ""}/meetings?join=${meeting.roomName}` : "");

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The The L.A.W.S. Collective//Meeting System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(new Date(meeting.scheduledAt))}
DTEND:${formatICSDate(endTime)}
SUMMARY:${meeting.title.replace(/[,;\\]/g, "\\$&")}
DESCRIPTION:${(meeting.description || "").replace(/\n/g, "\\n").replace(/[,;\\]/g, "\\$&")}
LOCATION:${location.replace(/[,;\\]/g, "\\$&")}
ORGANIZER;CN=${meeting.organizerName}:mailto:${meeting.organizerEmail}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Meeting reminder: ${meeting.title}
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

// Generate Google Calendar URL
function generateGoogleCalendarUrl(meeting: {
  title: string;
  description?: string | null;
  scheduledAt: Date;
  duration: number;
  location?: string | null;
  roomName?: string | null;
}): string {
  const startDate = new Date(meeting.scheduledAt).toISOString().replace(/-|:|\.\d+/g, "");
  const endTime = new Date(new Date(meeting.scheduledAt).getTime() + meeting.duration * 60000);
  const endDate = endTime.toISOString().replace(/-|:|\.\d+/g, "");
  const location = meeting.location || (meeting.roomName ? `${process.env.VITE_APP_URL || ""}/meetings?join=${meeting.roomName}` : "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: meeting.title,
    dates: `${startDate}/${endDate}`,
    details: meeting.description || "",
    location: location,
    sf: "true",
    output: "xml",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate Outlook Web Calendar URL
function generateOutlookCalendarUrl(meeting: {
  title: string;
  description?: string | null;
  scheduledAt: Date;
  duration: number;
  location?: string | null;
  roomName?: string | null;
}): string {
  const startDate = new Date(meeting.scheduledAt).toISOString();
  const endTime = new Date(new Date(meeting.scheduledAt).getTime() + meeting.duration * 60000);
  const endDate = endTime.toISOString();
  const location = meeting.location || (meeting.roomName ? `${process.env.VITE_APP_URL || ""}/meetings?join=${meeting.roomName}` : "");

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: meeting.title,
    startdt: startDate,
    enddt: endDate,
    body: meeting.description || "",
    location: location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Generate Yahoo Calendar URL
function generateYahooCalendarUrl(meeting: {
  title: string;
  description?: string | null;
  scheduledAt: Date;
  duration: number;
  location?: string | null;
  roomName?: string | null;
}): string {
  const startDate = new Date(meeting.scheduledAt).toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
  const location = meeting.location || (meeting.roomName ? `${process.env.VITE_APP_URL || ""}/meetings?join=${meeting.roomName}` : "");

  const params = new URLSearchParams({
    v: "60",
    title: meeting.title,
    st: startDate,
    dur: `${Math.floor(meeting.duration / 60).toString().padStart(2, "0")}${(meeting.duration % 60).toString().padStart(2, "0")}`,
    desc: meeting.description || "",
    in_loc: location,
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

export const calendarSyncRouter = router({
  /**
   * Get calendar links for a meeting
   */
  getCalendarLinks: protectedProcedure
    .input(z.object({
      meetingId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get meeting details
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, input.meetingId))
        .limit(1);

      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      // Check if user is a participant
      const [participant] = await db
        .select()
        .from(meetingParticipants)
        .where(and(
          eq(meetingParticipants.meetingId, input.meetingId),
          eq(meetingParticipants.userId, ctx.user.id)
        ))
        .limit(1);

      if (!participant && meeting.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a participant of this meeting" });
      }

      const meetingData = {
        title: meeting.title,
        description: meeting.description,
        scheduledAt: meeting.scheduledAt,
        duration: meeting.duration,
        location: meeting.location,
        roomName: meeting.roomName,
      };

      return {
        googleCalendar: generateGoogleCalendarUrl(meetingData),
        outlookCalendar: generateOutlookCalendarUrl(meetingData),
        yahooCalendar: generateYahooCalendarUrl(meetingData),
      };
    }),

  /**
   * Download ICS file for a meeting
   */
  downloadICS: protectedProcedure
    .input(z.object({
      meetingId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get meeting details with host info
      const [meeting] = await db
        .select({
          id: meetings.id,
          title: meetings.title,
          description: meetings.description,
          scheduledAt: meetings.scheduledAt,
          duration: meetings.duration,
          location: meetings.location,
          roomName: meetings.roomName,
          hostId: meetings.hostId,
        })
        .from(meetings)
        .where(eq(meetings.id, input.meetingId))
        .limit(1);

      if (!meeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      // Get host info
      const [host] = await db
        .select({
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, meeting.hostId))
        .limit(1);

      // Check if user is a participant
      const [participant] = await db
        .select()
        .from(meetingParticipants)
        .where(and(
          eq(meetingParticipants.meetingId, input.meetingId),
          eq(meetingParticipants.userId, ctx.user.id)
        ))
        .limit(1);

      if (!participant && meeting.hostId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a participant of this meeting" });
      }

      const icsContent = generateICSContent({
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        scheduledAt: meeting.scheduledAt,
        duration: meeting.duration,
        location: meeting.location,
        roomName: meeting.roomName,
        organizerName: host?.name || "Meeting Organizer",
        organizerEmail: host?.email || "meetings@laws-collective.com",
      });

      return {
        filename: `meeting-${meeting.id}.ics`,
        content: icsContent,
        mimeType: "text/calendar",
      };
    }),

  /**
   * Get upcoming meetings for calendar view
   */
  getUpcomingMeetings: protectedProcedure
    .input(z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const now = new Date();
      const startDate = input?.startDate ? new Date(input.startDate) : now;
      const endDate = input?.endDate ? new Date(input.endDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Get meetings where user is host or participant
      const userMeetings = await db
        .select({
          id: meetings.id,
          title: meetings.title,
          description: meetings.description,
          scheduledAt: meetings.scheduledAt,
          duration: meetings.duration,
          status: meetings.status,
          roomName: meetings.roomName,
          hostId: meetings.hostId,
        })
        .from(meetings)
        .innerJoin(meetingParticipants, eq(meetings.id, meetingParticipants.meetingId))
        .where(and(
          eq(meetingParticipants.userId, ctx.user.id),
          gte(meetings.scheduledAt, startDate),
          lte(meetings.scheduledAt, endDate)
        ))
        .orderBy(meetings.scheduledAt)
        .limit(input?.limit || 50);

      // Format for calendar display
      return userMeetings.map((m: any) => ({
        id: m.id,
        title: m.title,
        start: m.scheduledAt,
        end: new Date(new Date(m.scheduledAt).getTime() + m.duration * 60000),
        description: m.description,
        status: m.status,
        isHost: m.hostId === ctx.user.id,
        joinUrl: m.roomName ? `${process.env.VITE_APP_URL || ""}/meetings?join=${m.roomName}` : null,
        calendarLinks: {
          google: generateGoogleCalendarUrl(m),
          outlook: generateOutlookCalendarUrl(m),
          yahoo: generateYahooCalendarUrl(m),
        },
      }));
    }),

  /**
   * Export all meetings to ICS (calendar export)
   */
  exportAllToICS: protectedProcedure
    .input(z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const now = new Date();
      const startDate = input?.startDate ? new Date(input.startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input?.endDate ? new Date(input.endDate) : new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      // Get all user's meetings
      const userMeetings = await db
        .select({
          id: meetings.id,
          title: meetings.title,
          description: meetings.description,
          scheduledAt: meetings.scheduledAt,
          duration: meetings.duration,
          location: meetings.location,
          roomName: meetings.roomName,
          hostId: meetings.hostId,
        })
        .from(meetings)
        .innerJoin(meetingParticipants, eq(meetings.id, meetingParticipants.meetingId))
        .where(and(
          eq(meetingParticipants.userId, ctx.user.id),
          gte(meetings.scheduledAt, startDate),
          lte(meetings.scheduledAt, endDate)
        ))
        .orderBy(meetings.scheduledAt);

      // Build multi-event ICS
      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
      };

      let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//The The L.A.W.S. Collective//Meeting System//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:The The L.A.W.S. Collective Meetings
`;

      for (const meeting of userMeetings) {
        const endTime = new Date(new Date(meeting.scheduledAt).getTime() + meeting.duration * 60000);
        const uid = `meeting-${meeting.id}@laws-collective.com`;
        const location = meeting.location || (meeting.roomName ? `${process.env.VITE_APP_URL || ""}/meetings?join=${meeting.roomName}` : "");

        icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(new Date(meeting.scheduledAt))}
DTEND:${formatICSDate(endTime)}
SUMMARY:${meeting.title.replace(/[,;\\]/g, "\\$&")}
DESCRIPTION:${(meeting.description || "").replace(/\n/g, "\\n").replace(/[,;\\]/g, "\\$&")}
LOCATION:${location.replace(/[,;\\]/g, "\\$&")}
STATUS:CONFIRMED
END:VEVENT
`;
      }

      icsContent += "END:VCALENDAR";

      return {
        filename: `laws-collective-meetings.ics`,
        content: icsContent,
        mimeType: "text/calendar",
        meetingCount: userMeetings.length,
      };
    }),

  /**
   * Check availability (simple implementation)
   */
  checkAvailability: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()),
      proposedTime: z.string().datetime(),
      duration: z.number().min(5).max(480).default(60),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { available: true, conflicts: [] };

      const proposedStart = new Date(input.proposedTime);
      const proposedEnd = new Date(proposedStart.getTime() + input.duration * 60000);

      // Check for conflicts for each user
      const conflicts: Array<{
        userId: number;
        userName: string;
        conflictingMeeting: string;
        startTime: Date;
      }> = [];

      for (const userId of input.userIds) {
        // Get user's meetings that overlap with proposed time
        const userMeetings = await db
          .select({
            id: meetings.id,
            title: meetings.title,
            scheduledAt: meetings.scheduledAt,
            duration: meetings.duration,
            userName: users.name,
          })
          .from(meetings)
          .innerJoin(meetingParticipants, eq(meetings.id, meetingParticipants.meetingId))
          .innerJoin(users, eq(meetingParticipants.userId, users.id))
          .where(and(
            eq(meetingParticipants.userId, userId),
            // Check for overlap: existing meeting starts before proposed ends AND existing meeting ends after proposed starts
            lte(meetings.scheduledAt, proposedEnd),
          ));

        for (const m of userMeetings) {
          const meetingEnd = new Date(new Date(m.scheduledAt).getTime() + m.duration * 60000);
          if (meetingEnd > proposedStart) {
            conflicts.push({
              userId,
              userName: (m as any).userName || "Unknown",
              conflictingMeeting: m.title,
              startTime: m.scheduledAt,
            });
          }
        }
      }

      return {
        available: conflicts.length === 0,
        conflicts,
      };
    }),
});
