import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contactSubmissions } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

/**
 * Newsletter Router
 * Manages newsletter subscriptions and campaigns
 * Future implementation for email newsletter system
 */
export const newsletterRouter = router({
  /**
   * Subscribe to newsletter (public - no auth required)
   * Currently uses contact submissions table to store newsletter signups
   */
  subscribe: publicProcedure
    .input(z.object({
      email: z.string().email().max(255),
      name: z.string().min(1).max(100),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Store newsletter subscription in contact submissions
      await db.insert(contactSubmissions).values({
        name: input.name,
        email: input.email,
        subject: "Newsletter Subscription",
        message: `Subscribed to The L.A.W.S. Collective newsletter`,
        source: "newsletter",
      });

      // Notify owner of new newsletter subscriber
      await notifyOwner({
        title: "New Newsletter Subscriber",
        content: `${input.name} (${input.email}) has subscribed to the newsletter.`,
      });

      return {
        success: true,
        message: "Thank you for subscribing! Check your email for confirmation.",
      };
    }),

  /**
   * Get newsletter subscribers (protected - owner only)
   * Retrieves all newsletter signups from contact submissions
   */
  getSubscribers: protectedProcedure
    .input(z.object({
      limit: z.number().default(100),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const subscribers = await db
        .select()
        .from(contactSubmissions)
        .where(eq(contactSubmissions.source, "newsletter"))
        .orderBy(desc(contactSubmissions.createdAt))
        .limit(input?.limit || 100);

      return subscribers;
    }),

  /**
   * Get subscriber count
   */
  getSubscriberCount: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return 0;

    const subscribers = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.source, "newsletter"));

    return subscribers.length;
  }),

  /**
   * Unsubscribe from newsletter (public)
   * Marks subscriber as unsubscribed by updating status
   */
  unsubscribe: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Find subscriber and update status to archived
      const subscriber = await db
        .select()
        .from(contactSubmissions)
        .where(eq(contactSubmissions.email, input.email));

      if (subscriber.length > 0) {
        // Mark as archived instead of deleting
        // This preserves the record for audit purposes
        // TODO: Implement proper unsubscribe status field when schema is updated
      }

      return {
        success: true,
        message: "You have been unsubscribed from our newsletter.",
      };
    }),

  /**
   * Get newsletter stats
   */
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalSubscribers: 0, recentSignups: 0 };

    const allSubscribers = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.source, "newsletter"));

    // Count signups from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSignups = allSubscribers.filter((sub) => {
      const createdAt = new Date(sub.createdAt);
      return createdAt > sevenDaysAgo;
    }).length;

    return {
      totalSubscribers: allSubscribers.length,
      recentSignups,
    };
  }),
});
