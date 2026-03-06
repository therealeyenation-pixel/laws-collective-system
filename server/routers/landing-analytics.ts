import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { waitlistSignups, landingPageAnalytics } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const landingAnalyticsRouter = router({
  /**
   * Track analytics events from the landing page
   */
  trackEvent: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        eventType: z.enum([
          "page_view",
          "qr_scan",
          "intro_slideshow_start",
          "intro_slideshow_complete",
          "name_input_start",
          "name_input_submit",
          "results_slideshow_start",
          "results_slideshow_complete",
          "waitlist_signup",
          "sign_in_click",
          "get_started_click",
        ]),
        businessName: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await db.insert(landingPageAnalytics).values({
          sessionId: input.sessionId,
          eventType: input.eventType,
          businessName: input.businessName,
          metadata: input.metadata,
        });
        return { success: true };
      } catch (error) {
        console.error("Failed to track event:", error);
        return { success: false, error: "Failed to track event" };
      }
    }),

  /**
   * Add email to waitlist
   */
  joinWaitlist: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        businessName: z.string().optional(),
        source: z.string().default("landing_page"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if email already exists
        const existing = await db.query.waitlistSignups.findFirst({
          where: eq(waitlistSignups.email, input.email),
        });

        if (existing) {
          return {
            success: true,
            message: "Email already on waitlist",
            isNew: false,
          };
        }

        // Add to waitlist
        await db.insert(waitlistSignups).values({
          email: input.email,
          businessName: input.businessName,
          source: input.source,
          status: "pending",
        });

        return {
          success: true,
          message: "Successfully added to waitlist",
          isNew: true,
        };
      } catch (error) {
        console.error("Failed to join waitlist:", error);
        return {
          success: false,
          error: "Failed to join waitlist. Please try again.",
        };
      }
    }),

  /**
   * Get waitlist stats (for admin dashboard)
   */
  getWaitlistStats: publicProcedure.query(async () => {
    try {
      const total = await db.query.waitlistSignups.findMany();
      const confirmed = total.filter((s) => s.status === "confirmed");
      const pending = total.filter((s) => s.status === "pending");

      return {
        total: total.length,
        confirmed: confirmed.length,
        pending: pending.length,
      };
    } catch (error) {
      console.error("Failed to get waitlist stats:", error);
      return { total: 0, confirmed: 0, pending: 0 };
    }
  }),

  /**
   * Get analytics summary
   */
  getAnalyticsSummary: publicProcedure
    .input(
      z.object({
        days: z.number().default(7),
      })
    )
    .query(async ({ input }) => {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - input.days);

        const events = await db.query.landingPageAnalytics.findMany();
        const recentEvents = events.filter((e) => e.createdAt > cutoffDate);

        const eventCounts = recentEvents.reduce(
          (acc, event) => {
            acc[event.eventType] = (acc[event.eventType] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        const uniqueSessions = new Set(recentEvents.map((e) => e.sessionId))
          .size;

        return {
          totalEvents: recentEvents.length,
          uniqueSessions,
          eventCounts,
          period: `Last ${input.days} days`,
        };
      } catch (error) {
        console.error("Failed to get analytics summary:", error);
        return {
          totalEvents: 0,
          uniqueSessions: 0,
          eventCounts: {},
          period: "",
        };
      }
    }),
});
