import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { readingStreaks, streakNotifications, readingSessions, notifications } from "../../drizzle/schema";
import { eq, and, sql, desc, gte, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";

/**
 * Check if a date is today
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
}

/**
 * Check if a date is yesterday
 */
function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
}

/**
 * Get the start of today
 */
function getStartOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export const readingStreaksRouter = router({
  /**
   * Get user's reading streak data
   */
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Get or create streak record
    let [streak] = await db
      .select()
      .from(readingStreaks)
      .where(eq(readingStreaks.userId, userId))
      .limit(1);

    if (!streak) {
      // Create new streak record
      const [newStreak] = await db
        .insert(readingStreaks)
        .values({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          dailyGoalMinutes: 15,
          weeklyGoalMinutes: 60,
          streakReminderEnabled: true,
          reminderTime: "18:00",
        });

      [streak] = await db
        .select()
        .from(readingStreaks)
        .where(eq(readingStreaks.userId, userId))
        .limit(1);
    }

    // Check if streak needs to be updated (broken)
    if (streak.lastReadDate) {
      const lastRead = new Date(streak.lastReadDate);
      if (!isToday(lastRead) && !isYesterday(lastRead)) {
        // Streak is broken - update it
        await db
          .update(readingStreaks)
          .set({
            currentStreak: 0,
            streakStartDate: null,
          })
          .where(eq(readingStreaks.id, streak.id));

        streak = {
          ...streak,
          currentStreak: 0,
          streakStartDate: null,
        };
      }
    }

    // Get today's reading minutes
    const startOfToday = getStartOfToday();
    const todaySessions = await db
      .select({
        totalMinutes: sql<number>`COALESCE(SUM(${readingSessions.totalReadingMinutes}), 0)`,
      })
      .from(readingSessions)
      .where(
        and(
          eq(readingSessions.userId, userId),
          gte(readingSessions.updatedAt, startOfToday)
        )
      );

    const todayMinutes = todaySessions[0]?.totalMinutes || 0;
    const goalMet = todayMinutes >= (streak.dailyGoalMinutes || 15);

    return {
      ...streak,
      todayMinutes,
      goalMet,
      streakAtRisk: !goalMet && streak.currentStreak > 0,
    };
  }),

  /**
   * Update streak settings
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        dailyGoalMinutes: z.number().min(5).max(120).optional(),
        weeklyGoalMinutes: z.number().min(30).max(600).optional(),
        streakReminderEnabled: z.boolean().optional(),
        reminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      await db
        .update(readingStreaks)
        .set(input)
        .where(eq(readingStreaks.userId, userId));

      return { success: true };
    }),

  /**
   * Record reading activity and update streak
   */
  recordReading: protectedProcedure
    .input(
      z.object({
        minutesRead: z.number().min(1),
        bookId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      // Get current streak
      let [streak] = await db
        .select()
        .from(readingStreaks)
        .where(eq(readingStreaks.userId, userId))
        .limit(1);

      if (!streak) {
        // Create new streak record
        await db.insert(readingStreaks).values({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastReadDate: todayStr,
          streakStartDate: todayStr,
          thisWeekMinutes: input.minutesRead,
          thisMonthMinutes: input.minutesRead,
          totalReadingMinutes: input.minutesRead,
        });

        return {
          newStreak: 1,
          isNewDay: true,
          milestone: null,
        };
      }

      const lastRead = streak.lastReadDate ? new Date(streak.lastReadDate) : null;
      let newStreak = streak.currentStreak;
      let isNewDay = false;
      let milestone: number | null = null;

      if (!lastRead || !isToday(lastRead)) {
        // This is a new day of reading
        isNewDay = true;

        if (lastRead && isYesterday(lastRead)) {
          // Continuing streak
          newStreak = streak.currentStreak + 1;
        } else {
          // Starting new streak
          newStreak = 1;
        }

        // Check for milestones
        if ([7, 14, 30, 60, 100, 365].includes(newStreak)) {
          milestone = newStreak;
        }
      }

      const newLongest = Math.max(streak.longestStreak, newStreak);

      await db
        .update(readingStreaks)
        .set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastReadDate: todayStr,
          streakStartDate: newStreak === 1 ? todayStr : streak.streakStartDate,
          thisWeekMinutes: (streak.thisWeekMinutes || 0) + input.minutesRead,
          thisMonthMinutes: (streak.thisMonthMinutes || 0) + input.minutesRead,
          totalReadingMinutes: (streak.totalReadingMinutes || 0) + input.minutesRead,
        })
        .where(eq(readingStreaks.id, streak.id));

      // Create milestone notification if applicable
      if (milestone) {
        await db.insert(streakNotifications).values({
          userId,
          streakId: streak.id,
          notificationType: "streak_milestone",
          title: `🎉 ${milestone}-Day Reading Streak!`,
          message: `Congratulations! You've maintained a ${milestone}-day reading streak. Keep up the amazing work!`,
          deliveryMethod: "in_app",
          streakCount: milestone,
          minutesRead: streak.totalReadingMinutes + input.minutesRead,
        });

        // Also create in-app notification
        await db.insert(notifications).values({
          userId,
          type: "achievement",
          title: `🎉 ${milestone}-Day Reading Streak!`,
          message: `You've maintained a ${milestone}-day reading streak. Keep up the amazing work!`,
          priority: "normal",
          category: "achievement",
        });
      }

      return {
        newStreak,
        isNewDay,
        milestone,
        longestStreak: newLongest,
      };
    }),

  /**
   * Get streak notifications for user
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const conditions = [eq(streakNotifications.userId, userId)];
      if (input.unreadOnly) {
        conditions.push(sql`${streakNotifications.readAt} IS NULL`);
      }

      const notifs = await db
        .select()
        .from(streakNotifications)
        .where(and(...conditions))
        .orderBy(desc(streakNotifications.sentAt))
        .limit(input.limit);

      return notifs;
    }),

  /**
   * Mark notification as read
   */
  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      await db
        .update(streakNotifications)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(streakNotifications.id, input.notificationId),
            eq(streakNotifications.userId, userId)
          )
        );

      return { success: true };
    }),

  /**
   * Send streak at-risk reminders (called by scheduled job)
   */
  sendStreakReminders: publicProcedure.mutation(async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    // Find users with streaks who haven't read today and have reminders enabled
    const startOfToday = getStartOfToday();

    // Get all users with active streaks and reminders enabled
    const streaksAtRisk = await db
      .select()
      .from(readingStreaks)
      .where(
        and(
          eq(readingStreaks.streakReminderEnabled, true),
          sql`${readingStreaks.currentStreak} > 0`,
          sql`${readingStreaks.lastReadDate} < ${startOfToday.toISOString().split("T")[0]}`,
          sql`${readingStreaks.reminderTime} <= ${currentTime}`,
          sql`(${readingStreaks.lastReminderSentAt} IS NULL OR DATE(${readingStreaks.lastReminderSentAt}) < CURDATE())`
        )
      );

    let sentCount = 0;
    const errors: string[] = [];

    for (const streak of streaksAtRisk) {
      try {
        // Create streak at-risk notification
        await db.insert(streakNotifications).values({
          userId: streak.userId,
          streakId: streak.id,
          notificationType: "streak_at_risk",
          title: `⚠️ Your ${streak.currentStreak}-Day Streak is at Risk!`,
          message: `Don't lose your ${streak.currentStreak}-day reading streak! Read for just ${streak.dailyGoalMinutes || 15} minutes today to keep it going.`,
          deliveryMethod: "in_app",
          streakCount: streak.currentStreak,
        });

        // Also create in-app notification
        await db.insert(notifications).values({
          userId: streak.userId,
          type: "reminder",
          title: `⚠️ Reading Streak at Risk!`,
          message: `Your ${streak.currentStreak}-day reading streak is at risk! Read today to keep it going.`,
          priority: "high",
          category: "reminder",
        });

        // Update last reminder sent
        await db
          .update(readingStreaks)
          .set({ lastReminderSentAt: now })
          .where(eq(readingStreaks.id, streak.id));

        sentCount++;
      } catch (error) {
        errors.push(`Failed to send reminder for user ${streak.userId}: ${error}`);
      }
    }

    return {
      sent: sentCount,
      errors: errors.length,
      errorDetails: errors,
    };
  }),

  /**
   * Get leaderboard of top readers
   */
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        type: z.enum(["streak", "total_minutes", "books_completed"]).default("streak"),
        limit: z.number().min(5).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      let orderColumn;
      switch (input.type) {
        case "streak":
          orderColumn = readingStreaks.currentStreak;
          break;
        case "total_minutes":
          orderColumn = readingStreaks.totalReadingMinutes;
          break;
        case "books_completed":
          orderColumn = readingStreaks.totalBooksCompleted;
          break;
      }

      const leaderboard = await db
        .select({
          userId: readingStreaks.userId,
          currentStreak: readingStreaks.currentStreak,
          longestStreak: readingStreaks.longestStreak,
          totalMinutes: readingStreaks.totalReadingMinutes,
          booksCompleted: readingStreaks.totalBooksCompleted,
        })
        .from(readingStreaks)
        .orderBy(desc(orderColumn))
        .limit(input.limit);

      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));
    }),
});

export type ReadingStreaksRouter = typeof readingStreaksRouter;
