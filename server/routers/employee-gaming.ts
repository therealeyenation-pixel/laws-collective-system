import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  employeeGameSessions,
  weeklyGameRequirements,
  teamGameEvents,
  teamEventParticipants,
  gamingLeaderboards,
  gamingComplianceReports,
} from "../../drizzle/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

// Helper to get ISO week number
function getISOWeek(date: Date): { weekNumber: number; weekYear: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { weekNumber, weekYear: d.getUTCFullYear() };
}

// Helper to get week start/end dates
function getWeekDates(weekNumber: number, weekYear: number): { start: Date; end: Date } {
  const simple = new Date(weekYear, 0, 1 + (weekNumber - 1) * 7);
  const dow = simple.getDay();
  const start = new Date(simple);
  if (dow <= 4) start.setDate(simple.getDate() - simple.getDay() + 1);
  else start.setDate(simple.getDate() + 8 - simple.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export const employeeGamingRouter = router({
  // Start a game session
  startSession: protectedProcedure
    .input(z.object({
      gameSlug: z.string(),
      gameName: z.string(),
      gameId: z.number().optional(),
      sessionType: z.enum(["solo_practice", "team_battle", "house_championship", "laws_tournament", "training"]).default("solo_practice"),
      difficulty: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = new Date();
      const { weekNumber, weekYear } = getISOWeek(now);
      
      const [session] = await db.insert(employeeGameSessions).values({
        userId: ctx.user.id,
        gameId: input.gameId,
        gameSlug: input.gameSlug,
        gameName: input.gameName,
        startTime: now,
        sessionType: input.sessionType,
        difficulty: input.difficulty,
        weekNumber,
        weekYear,
      }).$returningId();
      
      return { sessionId: session.id, startTime: now };
    }),

  // End a game session
  endSession: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      won: z.boolean().optional(),
      score: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = new Date();
      
      // Get the session
      const [session] = await db.select()
        .from(employeeGameSessions)
        .where(and(
          eq(employeeGameSessions.id, input.sessionId),
          eq(employeeGameSessions.userId, ctx.user.id)
        ));
      
      if (!session) {
        throw new Error("Session not found");
      }
      
      const durationMinutes = Math.round((now.getTime() - session.startTime.getTime()) / 60000);
      
      // Update session
      await db.update(employeeGameSessions)
        .set({
          endTime: now,
          durationMinutes,
          won: input.won ?? false,
          score: input.score ?? 0,
        })
        .where(eq(employeeGameSessions.id, input.sessionId));
      
      // Update weekly requirement
      await this.updateWeeklyProgress(ctx.user.id, session.weekNumber, session.weekYear, durationMinutes, session.gameSlug);
      
      return { durationMinutes, endTime: now };
    }),

  // Get current week's progress
  getWeeklyProgress: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      const now = new Date();
      const { weekNumber, weekYear } = getISOWeek(now);
      const { start, end } = getWeekDates(weekNumber, weekYear);
      
      // Get or create weekly requirement
      let [requirement] = await db.select()
        .from(weeklyGameRequirements)
        .where(and(
          eq(weeklyGameRequirements.userId, ctx.user.id),
          eq(weeklyGameRequirements.weekNumber, weekNumber),
          eq(weeklyGameRequirements.weekYear, weekYear)
        ));
      
      if (!requirement) {
        const [newReq] = await db.insert(weeklyGameRequirements).values({
          userId: ctx.user.id,
          weekNumber,
          weekYear,
          weekStartDate: start,
          weekEndDate: end,
          requiredMinutes: 300, // 5 hours
        }).$returningId();
        
        [requirement] = await db.select()
          .from(weeklyGameRequirements)
          .where(eq(weeklyGameRequirements.id, newReq.id));
      }
      
      // Get sessions for this week
      const sessions = await db.select()
        .from(employeeGameSessions)
        .where(and(
          eq(employeeGameSessions.userId, ctx.user.id),
          eq(employeeGameSessions.weekNumber, weekNumber),
          eq(employeeGameSessions.weekYear, weekYear)
        ))
        .orderBy(desc(employeeGameSessions.startTime));
      
      // Calculate unique games
      const uniqueGames = new Set(sessions.map(s => s.gameSlug)).size;
      
      // Calculate total time
      const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
      
      return {
        weekNumber,
        weekYear,
        weekStart: start,
        weekEnd: end,
        requiredMinutes: requirement.requiredMinutes,
        completedMinutes: totalMinutes,
        progressPercent: Math.min(100, Math.round((totalMinutes / requirement.requiredMinutes) * 100)),
        complianceStatus: requirement.complianceStatus,
        streakWeeks: requirement.streakWeeks,
        uniqueGamesPlayed: uniqueGames,
        sessions: sessions.slice(0, 10), // Last 10 sessions
        bonusTokensAwarded: requirement.bonusTokensAwarded,
      };
    }),

  // Get session history
  getSessionHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      
      const sessions = await db.select()
        .from(employeeGameSessions)
        .where(eq(employeeGameSessions.userId, ctx.user.id))
        .orderBy(desc(employeeGameSessions.startTime))
        .limit(input.limit)
        .offset(input.offset);
      
      return sessions;
    }),

  // Get leaderboard
  getLeaderboard: protectedProcedure
    .input(z.object({
      type: z.enum(["individual", "team", "house", "entity"]).default("individual"),
      period: z.enum(["weekly", "monthly", "quarterly", "yearly", "all_time"]).default("weekly"),
      gameSlug: z.string().optional(),
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const now = new Date();
      const { weekNumber, weekYear } = getISOWeek(now);
      const { start } = getWeekDates(weekNumber, weekYear);
      
      const leaderboard = await db.select()
        .from(gamingLeaderboards)
        .where(and(
          eq(gamingLeaderboards.leaderboardType, input.type),
          eq(gamingLeaderboards.period, input.period),
          input.gameSlug ? eq(gamingLeaderboards.gameSlug, input.gameSlug) : sql`1=1`
        ))
        .orderBy(gamingLeaderboards.rank)
        .limit(input.limit);
      
      return leaderboard;
    }),

  // === Team Events ===
  
  // Get upcoming team events
  getUpcomingEvents: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const now = new Date();
      
      const events = await db.select()
        .from(teamGameEvents)
        .where(and(
          gte(teamGameEvents.scheduledStart, now),
          eq(teamGameEvents.status, "scheduled")
        ))
        .orderBy(teamGameEvents.scheduledStart)
        .limit(input.limit);
      
      // Get participant counts
      const eventsWithCounts = await Promise.all(events.map(async (event) => {
        const [countResult] = await db.select({ count: sql<number>`count(*)` })
          .from(teamEventParticipants)
          .where(and(
            eq(teamEventParticipants.eventId, event.id),
            eq(teamEventParticipants.rsvpStatus, "accepted")
          ));
        
        // Check if current user has RSVP'd
        const [userRsvp] = await db.select()
          .from(teamEventParticipants)
          .where(and(
            eq(teamEventParticipants.eventId, event.id),
            eq(teamEventParticipants.userId, ctx.user.id)
          ));
        
        return {
          ...event,
          participantCount: countResult?.count || 0,
          userRsvpStatus: userRsvp?.rsvpStatus || null,
        };
      }));
      
      return eventsWithCounts;
    }),

  // RSVP to an event
  rsvpEvent: protectedProcedure
    .input(z.object({
      eventId: z.number(),
      status: z.enum(["accepted", "declined", "tentative"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      // Check if already RSVP'd
      const [existing] = await db.select()
        .from(teamEventParticipants)
        .where(and(
          eq(teamEventParticipants.eventId, input.eventId),
          eq(teamEventParticipants.userId, ctx.user.id)
        ));
      
      if (existing) {
        await db.update(teamEventParticipants)
          .set({
            rsvpStatus: input.status,
            rsvpAt: new Date(),
          })
          .where(eq(teamEventParticipants.id, existing.id));
      } else {
        await db.insert(teamEventParticipants).values({
          eventId: input.eventId,
          userId: ctx.user.id,
          rsvpStatus: input.status,
          rsvpAt: new Date(),
        });
      }
      
      return { success: true };
    }),

  // Create team event (admin/manager)
  createEvent: adminProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      gameSlug: z.string().optional(),
      scheduledStart: z.string(), // ISO date string
      durationMinutes: z.number(),
      eventType: z.enum(["team_battle", "house_championship", "laws_tournament", "training_session", "casual_play"]),
      departmentId: z.number().optional(),
      houseId: z.number().optional(),
      maxParticipants: z.number().optional(),
      isRequired: z.boolean().default(false),
      isRecurring: z.boolean().default(false),
      recurrencePattern: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const start = new Date(input.scheduledStart);
      const end = new Date(start.getTime() + input.durationMinutes * 60000);
      
      const [event] = await db.insert(teamGameEvents).values({
        title: input.title,
        description: input.description,
        gameSlug: input.gameSlug,
        scheduledStart: start,
        scheduledEnd: end,
        durationMinutes: input.durationMinutes,
        eventType: input.eventType,
        departmentId: input.departmentId,
        houseId: input.houseId,
        maxParticipants: input.maxParticipants,
        isRequired: input.isRequired,
        isRecurring: input.isRecurring,
        recurrencePattern: input.recurrencePattern,
        createdBy: ctx.user.id,
      }).$returningId();
      
      return { eventId: event.id };
    }),

  // === Manager/Admin Reports ===
  
  // Get team compliance summary (manager view)
  getTeamCompliance: adminProcedure
    .input(z.object({
      departmentId: z.number().optional(),
      weekNumber: z.number().optional(),
      weekYear: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const now = new Date();
      const { weekNumber, weekYear } = input.weekNumber && input.weekYear 
        ? { weekNumber: input.weekNumber, weekYear: input.weekYear }
        : getISOWeek(now);
      
      const requirements = await db.select()
        .from(weeklyGameRequirements)
        .where(and(
          eq(weeklyGameRequirements.weekNumber, weekNumber),
          eq(weeklyGameRequirements.weekYear, weekYear)
        ));
      
      const totalEmployees = requirements.length;
      const compliant = requirements.filter(r => 
        r.complianceStatus === "completed" || r.complianceStatus === "exceeded"
      ).length;
      const inProgress = requirements.filter(r => r.complianceStatus === "in_progress").length;
      const notStarted = requirements.filter(r => r.complianceStatus === "not_started").length;
      const excused = requirements.filter(r => r.complianceStatus === "excused").length;
      
      return {
        weekNumber,
        weekYear,
        totalEmployees,
        compliantEmployees: compliant,
        inProgressEmployees: inProgress,
        notStartedEmployees: notStarted,
        excusedEmployees: excused,
        complianceRate: totalEmployees > 0 ? Math.round((compliant / totalEmployees) * 100) : 0,
        employees: requirements,
      };
    }),

  // Send session reminders
  sendSessionReminders: adminProcedure
    .input(z.object({
      eventId: z.number(),
      reminderType: z.enum(["24h", "1h", "15min", "custom"]),
      customMessage: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      // Get event details
      const [event] = await db.select()
        .from(teamGameEvents)
        .where(eq(teamGameEvents.id, input.eventId));
      
      if (!event) {
        throw new Error("Event not found");
      }
      
      // Get participants who accepted
      const participants = await db.select()
        .from(teamEventParticipants)
        .where(and(
          eq(teamEventParticipants.eventId, input.eventId),
          eq(teamEventParticipants.rsvpStatus, "accepted")
        ));
      
      // In a real implementation, this would send notifications via email/push
      // For now, we'll mark reminders as sent and return count
      const reminderMessage = input.customMessage || 
        `Reminder: ${event.title} starts ${input.reminderType === "24h" ? "tomorrow" : 
          input.reminderType === "1h" ? "in 1 hour" : "in 15 minutes"}!`;
      
      return {
        success: true,
        remindersSent: participants.length,
        message: reminderMessage,
        eventTitle: event.title,
        scheduledStart: event.scheduledStart,
      };
    }),

  // Get events needing reminders
  getEventsNeedingReminders: adminProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
      const in15Min = new Date(now.getTime() + 15 * 60 * 1000);
      
      const events = await db.select()
        .from(teamGameEvents)
        .where(and(
          gte(teamGameEvents.scheduledStart, now),
          lte(teamGameEvents.scheduledStart, in24Hours),
          eq(teamGameEvents.status, "scheduled")
        ))
        .orderBy(teamGameEvents.scheduledStart);
      
      return events.map(event => {
        const eventTime = new Date(event.scheduledStart).getTime();
        const timeUntil = eventTime - now.getTime();
        
        let suggestedReminder: "24h" | "1h" | "15min" | null = null;
        if (timeUntil > 23 * 60 * 60 * 1000 && timeUntil <= 24 * 60 * 60 * 1000) {
          suggestedReminder = "24h";
        } else if (timeUntil > 55 * 60 * 1000 && timeUntil <= 60 * 60 * 1000) {
          suggestedReminder = "1h";
        } else if (timeUntil > 10 * 60 * 1000 && timeUntil <= 15 * 60 * 1000) {
          suggestedReminder = "15min";
        }
        
        return {
          ...event,
          timeUntilMinutes: Math.round(timeUntil / 60000),
          suggestedReminder,
        };
      });
    }),

  // Generate compliance report
  generateReport: adminProcedure
    .input(z.object({
      reportType: z.enum(["individual", "department", "house", "entity", "system"]),
      periodType: z.enum(["weekly", "monthly", "quarterly"]),
      periodStart: z.string(),
      periodEnd: z.string(),
      departmentId: z.number().optional(),
      houseId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      // Calculate stats based on period
      const start = new Date(input.periodStart);
      const end = new Date(input.periodEnd);
      
      // Get all requirements in period
      const requirements = await db.select()
        .from(weeklyGameRequirements)
        .where(and(
          gte(weeklyGameRequirements.weekStartDate, start),
          lte(weeklyGameRequirements.weekEndDate, end)
        ));
      
      const totalEmployees = new Set(requirements.map(r => r.userId)).size;
      const compliant = requirements.filter(r => 
        r.complianceStatus === "completed" || r.complianceStatus === "exceeded"
      );
      
      const totalMinutes = requirements.reduce((sum, r) => sum + r.completedMinutes, 0);
      
      const [report] = await db.insert(gamingComplianceReports).values({
        reportType: input.reportType,
        departmentId: input.departmentId,
        houseId: input.houseId,
        periodType: input.periodType,
        periodStart: start,
        periodEnd: end,
        totalEmployees,
        compliantEmployees: compliant.length,
        nonCompliantEmployees: totalEmployees - compliant.length,
        complianceRate: totalEmployees > 0 ? String((compliant.length / totalEmployees) * 100) : "0",
        totalMinutesPlayed: totalMinutes,
        averageMinutesPerEmployee: totalEmployees > 0 ? Math.round(totalMinutes / totalEmployees) : 0,
        generatedBy: ctx.user.id,
      }).$returningId();
      
      return { reportId: report.id };
    }),

  // Export compliance report as CSV
  exportComplianceCSV: adminProcedure
    .input(z.object({
      weekNumber: z.number().optional(),
      weekYear: z.number().optional(),
      departmentId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const now = new Date();
      const { weekNumber, weekYear } = input.weekNumber && input.weekYear 
        ? { weekNumber: input.weekNumber, weekYear: input.weekYear }
        : getISOWeek(now);
      
      const requirements = await db.select()
        .from(weeklyGameRequirements)
        .where(and(
          eq(weeklyGameRequirements.weekNumber, weekNumber),
          eq(weeklyGameRequirements.weekYear, weekYear)
        ));
      
      // Generate CSV content
      const headers = ["User ID", "Week", "Year", "Required Minutes", "Completed Minutes", "Compliance Status", "Unique Games", "Streak Weeks"];
      const rows = requirements.map(r => [
        r.userId,
        r.weekNumber,
        r.weekYear,
        r.requiredMinutes,
        r.completedMinutes,
        r.complianceStatus,
        r.uniqueGamesPlayed,
        r.streakWeeks,
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");
      
      return {
        filename: `gaming-compliance-week${weekNumber}-${weekYear}.csv`,
        content: csvContent,
        mimeType: "text/csv",
      };
    }),

  // Get compliance report data for PDF generation
  getComplianceReportData: adminProcedure
    .input(z.object({
      weekNumber: z.number().optional(),
      weekYear: z.number().optional(),
      departmentId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const now = new Date();
      const { weekNumber, weekYear } = input.weekNumber && input.weekYear 
        ? { weekNumber: input.weekNumber, weekYear: input.weekYear }
        : getISOWeek(now);
      const { start, end } = getWeekDates(weekNumber, weekYear);
      
      const requirements = await db.select()
        .from(weeklyGameRequirements)
        .where(and(
          eq(weeklyGameRequirements.weekNumber, weekNumber),
          eq(weeklyGameRequirements.weekYear, weekYear)
        ));
      
      const totalEmployees = requirements.length;
      const compliant = requirements.filter(r => 
        r.complianceStatus === "completed" || r.complianceStatus === "exceeded"
      ).length;
      const inProgress = requirements.filter(r => r.complianceStatus === "in_progress").length;
      const notStarted = requirements.filter(r => r.complianceStatus === "not_started").length;
      const totalMinutes = requirements.reduce((sum, r) => sum + r.completedMinutes, 0);
      
      return {
        reportTitle: `Gaming Compliance Report - Week ${weekNumber}, ${weekYear}`,
        periodStart: start.toISOString().split('T')[0],
        periodEnd: end.toISOString().split('T')[0],
        generatedAt: now.toISOString(),
        summary: {
          totalEmployees,
          compliantEmployees: compliant,
          inProgressEmployees: inProgress,
          notStartedEmployees: notStarted,
          complianceRate: totalEmployees > 0 ? Math.round((compliant / totalEmployees) * 100) : 0,
          totalMinutesPlayed: totalMinutes,
          averageMinutesPerEmployee: totalEmployees > 0 ? Math.round(totalMinutes / totalEmployees) : 0,
        },
        employees: requirements.map(r => ({
          userId: r.userId,
          completedMinutes: r.completedMinutes,
          requiredMinutes: r.requiredMinutes,
          complianceStatus: r.complianceStatus,
          uniqueGamesPlayed: r.uniqueGamesPlayed,
          streakWeeks: r.streakWeeks,
        })),
      };
    }),
});

// Helper function to update weekly progress (called internally)
async function updateWeeklyProgress(userId: number, weekNumber: number, weekYear: number, additionalMinutes: number, gameSlug: string) {
  const db = await getDb();
  const { start, end } = getWeekDates(weekNumber, weekYear);
  
  // Get or create weekly requirement
  let [requirement] = await db.select()
    .from(weeklyGameRequirements)
    .where(and(
      eq(weeklyGameRequirements.userId, userId),
      eq(weeklyGameRequirements.weekNumber, weekNumber),
      eq(weeklyGameRequirements.weekYear, weekYear)
    ));
  
  if (!requirement) {
    await db.insert(weeklyGameRequirements).values({
      userId,
      weekNumber,
      weekYear,
      weekStartDate: start,
      weekEndDate: end,
      requiredMinutes: 300,
    });
    
    [requirement] = await db.select()
      .from(weeklyGameRequirements)
      .where(and(
        eq(weeklyGameRequirements.userId, userId),
        eq(weeklyGameRequirements.weekNumber, weekNumber),
        eq(weeklyGameRequirements.weekYear, weekYear)
      ));
  }
  
  // Get all sessions for unique game count
  const sessions = await db.select()
    .from(employeeGameSessions)
    .where(and(
      eq(employeeGameSessions.userId, userId),
      eq(employeeGameSessions.weekNumber, weekNumber),
      eq(employeeGameSessions.weekYear, weekYear)
    ));
  
  const uniqueGames = new Set(sessions.map(s => s.gameSlug)).size;
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  
  // Determine compliance status
  let status: "not_started" | "in_progress" | "completed" | "exceeded" = "not_started";
  if (totalMinutes >= requirement.requiredMinutes * 1.5) {
    status = "exceeded";
  } else if (totalMinutes >= requirement.requiredMinutes) {
    status = "completed";
  } else if (totalMinutes > 0) {
    status = "in_progress";
  }
  
  await db.update(weeklyGameRequirements)
    .set({
      completedMinutes: totalMinutes,
      complianceStatus: status,
      uniqueGamesPlayed: uniqueGames,
    })
    .where(eq(weeklyGameRequirements.id, requirement.id));
}

export default employeeGamingRouter;
