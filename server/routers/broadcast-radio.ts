import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  broadcastChannels,
  broadcastEpisodes,
  liveBroadcasts,
  broadcastSchedules,
  broadcastListeners,
  episodeInteractions,
  broadcastAnalytics,
  sponsorships,
  adPlacements,
  broadcastNotifications,
} from "../../drizzle/schema";
import { eq, and, desc, gte, lte, like } from "drizzle-orm";

/**
 * Phase 62: Broadcast/Radio Router
 * 
 * 18 procedures for podcast/radio streaming, scheduling, and analytics
 */

export const broadcastRadioRouter = router({
  // ============================================================================
  // CHANNEL MANAGEMENT (4 procedures)
  // ============================================================================

  /**
   * 1. Create a new broadcast channel
   */
  createChannel: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(100),
        category: z.enum([
          "education",
          "business",
          "finance",
          "health",
          "entertainment",
          "news",
          "technology",
          "culture",
          "other",
        ]),
        description: z.string().optional(),
        broadcastFormat: z.enum(["podcast", "live_radio", "hybrid"]),
        language: z.string().default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const channel = await db.insert(broadcastChannels).values({
        userId: ctx.user.id,
        ...input,
        status: "draft",
      });

      return {
        success: true,
        channelId: channel[0],
        message: "Channel created successfully",
      };
    }),

  /**
   * 2. Get user's broadcast channels
   */
  getChannels: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const channels = await db
        .select()
        .from(broadcastChannels)
        .where(eq(broadcastChannels.userId, ctx.user.id))
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(broadcastChannels.createdAt));

      const total = await db
        .select()
        .from(broadcastChannels)
        .where(eq(broadcastChannels.userId, ctx.user.id));

      return {
        channels,
        total: total.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * 3. Update channel details
   */
  updateChannel: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "active", "paused", "archived"]).optional(),
        isMonetized: z.boolean().optional(),
        monetizationTier: z.enum(["free", "basic", "premium"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { channelId, ...updates } = input;

      await db
        .update(broadcastChannels)
        .set(updates)
        .where(
          and(
            eq(broadcastChannels.id, channelId),
            eq(broadcastChannels.userId, ctx.user.id)
          )
        );

      return {
        success: true,
        message: "Channel updated successfully",
      };
    }),

  /**
   * 4. Delete channel
   */
  deleteChannel: protectedProcedure
    .input(z.object({ channelId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(broadcastChannels)
        .where(
          and(
            eq(broadcastChannels.id, input.channelId),
            eq(broadcastChannels.userId, ctx.user.id)
          )
        );

      return {
        success: true,
        message: "Channel deleted successfully",
      };
    }),

  // ============================================================================
  // EPISODE MANAGEMENT (4 procedures)
  // ============================================================================

  /**
   * 5. Create a new episode
   */
  createEpisode: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(100),
        description: z.string().optional(),
        audioUrl: z.string().url(),
        audioDuration: z.number().positive(),
        episodeNumber: z.number().optional(),
        seasonNumber: z.number().default(1),
        guestName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const episode = await db.insert(broadcastEpisodes).values({
        ...input,
        status: "draft",
      });

      return {
        success: true,
        episodeId: episode[0],
        message: "Episode created successfully",
      };
    }),

  /**
   * 6. Get episodes for a channel
   */
  getEpisodes: publicProcedure
    .input(
      z.object({
        channelId: z.number(),
        status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const conditions = [eq(broadcastEpisodes.channelId, input.channelId)];

      if (input.status) {
        conditions.push(eq(broadcastEpisodes.status, input.status));
      }

      const episodes = await db
        .select()
        .from(broadcastEpisodes)
        .where(and(...conditions))
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(broadcastEpisodes.publishedAt));

      return {
        episodes,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * 7. Publish episode
   */
  publishEpisode: protectedProcedure
    .input(z.object({ episodeId: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(broadcastEpisodes)
        .set({
          status: "published",
          publishedAt: new Date(),
        })
        .where(eq(broadcastEpisodes.id, input.episodeId));

      return {
        success: true,
        message: "Episode published successfully",
      };
    }),

  /**
   * 8. Update episode
   */
  updateEpisode: protectedProcedure
    .input(
      z.object({
        episodeId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        transcript: z.string().optional(),
        showNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { episodeId, ...updates } = input;

      await db
        .update(broadcastEpisodes)
        .set(updates)
        .where(eq(broadcastEpisodes.id, episodeId));

      return {
        success: true,
        message: "Episode updated successfully",
      };
    }),

  // ============================================================================
  // LIVE STREAMING (3 procedures)
  // ============================================================================

  /**
   * 9. Schedule live broadcast
   */
  scheduleLiveBroadcast: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        scheduledStartTime: z.date(),
        scheduledEndTime: z.date().optional(),
        isRecorded: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const broadcast = await db.insert(liveBroadcasts).values({
        ...input,
        status: "scheduled",
      });

      return {
        success: true,
        broadcastId: broadcast[0],
        message: "Live broadcast scheduled successfully",
      };
    }),

  /**
   * 10. Get live broadcasts
   */
  getLiveBroadcasts: publicProcedure
    .input(
      z.object({
        channelId: z.number(),
        status: z.enum(["scheduled", "live", "ended", "cancelled"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [eq(liveBroadcasts.channelId, input.channelId)];

      if (input.status) {
        conditions.push(eq(liveBroadcasts.status, input.status));
      }

      const broadcasts = await db
        .select()
        .from(liveBroadcasts)
        .where(and(...conditions))
        .orderBy(desc(liveBroadcasts.scheduledStartTime));

      return broadcasts;
    }),

  /**
   * 11. Start live broadcast
   */
  startLiveBroadcast: protectedProcedure
    .input(
      z.object({
        broadcastId: z.number(),
        streamUrl: z.string().url(),
        streamKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(liveBroadcasts)
        .set({
          status: "live",
          actualStartTime: new Date(),
          streamUrl: input.streamUrl,
          streamKey: input.streamKey,
        })
        .where(eq(liveBroadcasts.id, input.broadcastId));

      return {
        success: true,
        message: "Live broadcast started successfully",
      };
    }),

  // ============================================================================
  // SCHEDULING & AUTOMATION (2 procedures)
  // ============================================================================

  /**
   * 12. Create broadcast schedule
   */
  createSchedule: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        name: z.string().min(1).max(255),
        recurrencePattern: z.enum([
          "daily",
          "weekly",
          "biweekly",
          "monthly",
          "custom",
        ]),
        publishTime: z.string(), // HH:MM format
        timezone: z.string().default("UTC"),
        autoPublish: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const schedule = await db.insert(broadcastSchedules).values({
        ...input,
        isActive: true,
      });

      return {
        success: true,
        scheduleId: schedule[0],
        message: "Schedule created successfully",
      };
    }),

  /**
   * 13. Get schedules for channel
   */
  getSchedules: protectedProcedure
    .input(z.object({ channelId: z.number() }))
    .query(async ({ input }) => {
      const schedules = await db
        .select()
        .from(broadcastSchedules)
        .where(eq(broadcastSchedules.channelId, input.channelId));

      return schedules;
    }),

  // ============================================================================
  // AUDIENCE & ENGAGEMENT (3 procedures)
  // ============================================================================

  /**
   * 14. Subscribe to channel
   */
  subscribeToChannel: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        subscriptionTier: z.enum(["free", "basic", "premium"]).default("free"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.insert(broadcastListeners).values({
        channelId: input.channelId,
        userId: ctx.user.id,
        subscriptionTier: input.subscriptionTier,
        subscriptionStatus: "subscribed",
      });

      return {
        success: true,
        message: "Subscribed to channel successfully",
      };
    }),

  /**
   * 15. Record episode interaction
   */
  recordInteraction: protectedProcedure
    .input(
      z.object({
        episodeId: z.number(),
        listeningTime: z.number().default(0),
        completionPercent: z.number().min(0).max(100),
        liked: z.boolean().optional(),
        rating: z.number().min(1).max(5).optional(),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.insert(episodeInteractions).values({
        episodeId: input.episodeId,
        userId: ctx.user.id,
        ...input,
        isCompleted: input.completionPercent >= 90,
      });

      return {
        success: true,
        message: "Interaction recorded successfully",
      };
    }),

  /**
   * 16. Get listener statistics
   */
  getListenerStats: protectedProcedure
    .input(z.object({ channelId: z.number() }))
    .query(async ({ input }) => {
      const listeners = await db
        .select()
        .from(broadcastListeners)
        .where(eq(broadcastListeners.channelId, input.channelId));

      const totalListeningTime = listeners.reduce(
        (sum, l) => sum + l.totalListeningTime,
        0
      );
      const averageListeningTime =
        listeners.length > 0 ? totalListeningTime / listeners.length : 0;

      return {
        totalListeners: listeners.length,
        totalListeningTime,
        averageListeningTime,
        subscribers: listeners.filter(
          (l) => l.subscriptionStatus === "subscribed"
        ).length,
      };
    }),

  // ============================================================================
  // ANALYTICS (2 procedures)
  // ============================================================================

  /**
   * 17. Get channel analytics
   */
  getChannelAnalytics: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const analytics = await db
        .select()
        .from(broadcastAnalytics)
        .where(
          and(
            eq(broadcastAnalytics.channelId, input.channelId),
            gte(broadcastAnalytics.analyticsDate, input.startDate),
            lte(broadcastAnalytics.analyticsDate, input.endDate)
          )
        );

      const totalNewListeners = analytics.reduce((sum, a) => sum + a.newListeners, 0);
      const totalDownloads = analytics.reduce((sum, a) => sum + a.downloads, 0);
      const totalStreams = analytics.reduce((sum, a) => sum + a.streams, 0);

      return {
        analytics,
        summary: {
          totalNewListeners,
          totalDownloads,
          totalStreams,
          averageNewListenersPerDay: totalNewListeners / analytics.length || 0,
        },
      };
    }),

  /**
   * 18. Get episode performance
   */
  getEpisodePerformance: publicProcedure
    .input(z.object({ episodeId: z.number() }))
    .query(async ({ input }) => {
      const episode = await db
        .select()
        .from(broadcastEpisodes)
        .where(eq(broadcastEpisodes.id, input.episodeId));

      const interactions = await db
        .select()
        .from(episodeInteractions)
        .where(eq(episodeInteractions.episodeId, input.episodeId));

      const completedListens = interactions.filter(
        (i) => i.isCompleted
      ).length;
      const averageRating =
        interactions.filter((i) => i.rating).reduce((sum, i) => sum + (i.rating || 0), 0) /
          interactions.filter((i) => i.rating).length || 0;

      return {
        episode: episode[0],
        stats: {
          totalInteractions: interactions.length,
          completedListens,
          completionRate:
            interactions.length > 0
              ? (completedListens / interactions.length) * 100
              : 0,
          averageRating: Math.round(averageRating * 10) / 10,
          totalLikes: interactions.filter((i) => i.liked).length,
          totalDownloads: interactions.filter((i) => i.downloaded).length,
        },
      };
    }),
});
