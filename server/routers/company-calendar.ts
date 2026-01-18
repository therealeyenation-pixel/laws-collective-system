import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";

// Core hours for startup phase (after standard work hours)
const coreHours = {
  weekdays: {
    days: ["Tuesday", "Wednesday", "Thursday"],
    startTime: "18:00",
    endTime: "21:00",
  },
  weekend: {
    day: "Saturday",
    startTime: "09:00",
    endTime: "12:00",
  },
  timezone: "America/Chicago",
};

// Event types
const eventTypes = [
  "team_meeting",
  "department_meeting",
  "all_hands",
  "training",
  "planning",
  "one_on_one",
  "external",
  "other",
] as const;

// Attendance statuses
const attendanceStatuses = [
  "invited",
  "confirmed",
  "declined",
  "attended",
  "absent",
  "excused",
] as const;

export const companyCalendarRouter = router({
  // Get core hours policy
  getCoreHours: publicProcedure.query(() => {
    return {
      coreHours,
      phase: "startup",
      note: "Meetings scheduled after standard work hours to allow team members to maintain current employment.",
    };
  }),

  // Get all events (with optional filters)
  getEvents: publicProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        eventType: z.enum(eventTypes).optional(),
        departmentId: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      // Mock events for initial setup
      const events = [
        {
          id: 1,
          title: "Weekly Team Meeting",
          description: "Regular team sync and updates",
          eventType: "team_meeting",
          startTime: "2026-01-21T18:00:00",
          endTime: "2026-01-21T19:00:00",
          timezone: "America/Chicago",
          location: "Remote",
          meetingLink: "https://zoom.us/j/example",
          isRecurring: true,
          recurrenceRule: "FREQ=WEEKLY;BYDAY=TU",
          isMandatory: true,
          status: "scheduled",
          attendeeCount: 10,
        },
        {
          id: 2,
          title: "Monthly All-Hands",
          description: "Organization-wide updates and announcements",
          eventType: "all_hands",
          startTime: "2026-02-01T10:00:00",
          endTime: "2026-02-01T12:00:00",
          timezone: "America/Chicago",
          location: "Remote",
          meetingLink: "https://zoom.us/j/example",
          isRecurring: true,
          recurrenceRule: "FREQ=MONTHLY;BYDAY=1SA",
          isMandatory: true,
          status: "scheduled",
          attendeeCount: 10,
        },
      ];
      
      return events;
    }),

  // Get single event details
  getEvent: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return {
        id: input.id,
        title: "Weekly Team Meeting",
        description: "Regular team sync and updates",
        eventType: "team_meeting",
        startTime: "2026-01-21T18:00:00",
        endTime: "2026-01-21T19:00:00",
        timezone: "America/Chicago",
        location: "Remote",
        meetingLink: "https://zoom.us/j/example",
        isRecurring: true,
        recurrenceRule: "FREQ=WEEKLY;BYDAY=TU",
        isMandatory: true,
        status: "scheduled",
        createdBy: 1,
        attendees: [
          { id: 1, name: "LaShanna Russell", status: "confirmed" },
          { id: 2, name: "Craig Russell", status: "confirmed" },
          { id: 3, name: "Amber Russell", status: "invited" },
        ],
      };
    }),

  // Create new event
  createEvent: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        eventType: z.enum(eventTypes),
        startTime: z.string(),
        endTime: z.string(),
        timezone: z.string().default("America/Chicago"),
        location: z.string().optional(),
        meetingLink: z.string().optional(),
        isRecurring: z.boolean().default(false),
        recurrenceRule: z.string().optional(),
        departmentId: z.number().optional(),
        isMandatory: z.boolean().default(true),
        invitees: z.array(z.number()).optional(), // User IDs
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate meeting time is within core hours
      const startHour = parseInt(input.startTime.split("T")[1].split(":")[0]);
      const isWeekday = ["Tuesday", "Wednesday", "Thursday"].some(day => 
        new Date(input.startTime).toLocaleDateString("en-US", { weekday: "long" }) === day
      );
      const isSaturday = new Date(input.startTime).toLocaleDateString("en-US", { weekday: "long" }) === "Saturday";
      
      let withinCoreHours = false;
      if (isWeekday && startHour >= 18 && startHour < 21) {
        withinCoreHours = true;
      } else if (isSaturday && startHour >= 9 && startHour < 12) {
        withinCoreHours = true;
      }
      
      return {
        success: true,
        eventId: Date.now(),
        withinCoreHours,
        warning: !withinCoreHours ? "Meeting scheduled outside core hours. Attendance may be affected." : null,
      };
    }),

  // Update event
  updateEvent: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        eventType: z.enum(eventTypes).optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        location: z.string().optional(),
        meetingLink: z.string().optional(),
        isMandatory: z.boolean().optional(),
        status: z.enum(["scheduled", "cancelled", "completed"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        eventId: input.id,
      };
    }),

  // Cancel event
  cancelEvent: protectedProcedure
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        eventId: input.id,
        status: "cancelled",
      };
    }),

  // Get attendance for an event
  getAttendance: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return {
        eventId: input.eventId,
        attendees: [
          { userId: 1, name: "LaShanna Russell", status: "attended", checkInTime: "2026-01-21T18:02:00" },
          { userId: 2, name: "Craig Russell", status: "attended", checkInTime: "2026-01-21T18:05:00" },
          { userId: 3, name: "Amber Russell", status: "excused", excuseReason: "Prior commitment" },
        ],
        summary: {
          total: 10,
          attended: 8,
          excused: 1,
          absent: 1,
          attendanceRate: 80,
        },
      };
    }),

  // Record attendance (check-in)
  checkIn: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        eventId: input.eventId,
        userId: ctx.user.id,
        checkInTime: new Date().toISOString(),
        status: "attended",
      };
    }),

  // RSVP to event
  rsvp: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        status: z.enum(["confirmed", "declined"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        eventId: input.eventId,
        userId: ctx.user.id,
        status: input.status,
      };
    }),

  // Request excused absence
  requestExcuse: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        reason: z.string().min(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        eventId: input.eventId,
        userId: ctx.user.id,
        status: "pending_approval",
        message: "Your excuse request has been submitted for manager approval.",
      };
    }),

  // Approve excused absence (manager only)
  approveExcuse: protectedProcedure
    .input(
      z.object({
        attendanceId: z.number(),
        approved: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        attendanceId: input.attendanceId,
        status: input.approved ? "excused" : "absent",
        approvedBy: ctx.user.id,
      };
    }),

  // Get attendance report for a user
  getUserAttendance: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return {
        userId: input.userId,
        summary: {
          totalMeetings: 20,
          attended: 18,
          excused: 1,
          absent: 1,
          attendanceRate: 90,
        },
        meetings: [
          { eventId: 1, title: "Weekly Team Meeting", date: "2026-01-21", status: "attended" },
          { eventId: 2, title: "Monthly All-Hands", date: "2026-02-01", status: "attended" },
        ],
      };
    }),

  // Get attendance summary for all employees
  getAttendanceSummary: publicProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        departmentId: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return {
        period: {
          start: input?.startDate || "2026-01-01",
          end: input?.endDate || "2026-01-31",
        },
        employees: [
          { userId: 1, name: "LaShanna Russell", attendanceRate: 100, meetingsAttended: 10, meetingsTotal: 10 },
          { userId: 2, name: "Craig Russell", attendanceRate: 90, meetingsAttended: 9, meetingsTotal: 10 },
          { userId: 3, name: "Amber Russell", attendanceRate: 80, meetingsAttended: 8, meetingsTotal: 10 },
        ],
        overallRate: 90,
      };
    }),

  // Get upcoming meetings for current user
  getMyUpcoming: protectedProcedure
    .input(z.object({ limit: z.number().default(5) }).optional())
    .query(async ({ input, ctx }) => {
      return {
        userId: ctx.user.id,
        upcoming: [
          {
            id: 1,
            title: "Weekly Team Meeting",
            startTime: "2026-01-21T18:00:00",
            endTime: "2026-01-21T19:00:00",
            location: "Remote",
            meetingLink: "https://zoom.us/j/example",
            myStatus: "confirmed",
          },
        ],
      };
    }),
});
