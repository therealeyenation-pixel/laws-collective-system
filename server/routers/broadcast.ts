import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { broadcastChannels, broadcastEpisodes, liveBroadcasts } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const broadcastRouter = router({
  // Get all channels for current user
  getChannels: protectedProcedure
    .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const channels = await db
        .select()
        .from(broadcastChannels)
        .where(eq(broadcastChannels.userId, ctx.user.id))
        .limit(input?.limit || 10)
        .offset(input?.offset || 0);

      return { success: true, channels, total: channels.length };
    }),

  // Create new channel
  createChannel: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(["news", "education", "entertainment", "business", "community", "health"]),
        language: z.string().default("en"),
        broadcastFormat: z.enum(["live_radio", "podcast", "video"]).default("podcast"),
        websiteUrl: z.string().url().optional(),
        isMonetized: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      try {
        const channel = await db.insert(broadcastChannels).values({
          userId: ctx.user.id,
          name: input.name,
          slug: input.slug,
          description: input.description || "",
          category: input.category,
          language: input.language,
          status: "active",
          broadcastFormat: input.broadcastFormat,
          websiteUrl: input.websiteUrl || "",
          isMonetized: input.isMonetized,
          monetizationTier: input.isMonetized ? "premium" : "free",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { success: true, channel };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create channel",
        });
      }
    }),

  // Update channel
  updateChannel: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["news", "education", "entertainment", "business", "community", "health"]).optional(),
        status: z.enum(["active", "inactive", "archived"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      try {
        const channel = await db
          .update(broadcastChannels)
          .set({
            name: input.name,
            description: input.description,
            category: input.category,
            status: input.status,
            updatedAt: new Date(),
          })
          .where(and(eq(broadcastChannels.id, input.id), eq(broadcastChannels.userId, ctx.user.id)));

        return { success: true, channel };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update channel",
        });
      }
    }),

  // Delete channel
  deleteChannel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      try {
        await db.delete(broadcastChannels).where(and(eq(broadcastChannels.id, input.id), eq(broadcastChannels.userId, ctx.user.id)));

        return { success: true, message: "Channel deleted" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete channel",
        });
      }
    }),

  // Get episodes for a channel
  getEpisodes: protectedProcedure
    .input(z.object({ channelId: z.number(), limit: z.number().default(10), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const episodes = await db
        .select()
        .from(broadcastEpisodes)
        .where(eq(broadcastEpisodes.channelId, input.channelId))
        .limit(input.limit)
        .offset(input.offset);

      return { success: true, episodes, total: episodes.length };
    }),

  // Create episode
  createEpisode: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        streamUrl: z.string().url(),
        duration: z.number().optional(),
        status: z.enum(["draft", "published", "scheduled"]).default("draft"),
        scheduledAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      try {
        const episode = await db.insert(broadcastEpisodes).values({
          channelId: input.channelId,
          title: input.title,
          description: input.description || "",
          streamUrl: input.streamUrl,
          duration: input.duration || 0,
          status: input.status,
          scheduledAt: input.scheduledAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { success: true, episode };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create episode",
        });
      }
    }),

  // Get live broadcasts
  getLiveBroadcasts: protectedProcedure
    .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const broadcasts = await db
        .select()
        .from(liveBroadcasts)
        .where(eq(liveBroadcasts.userId, ctx.user.id))
        .limit(input?.limit || 10)
        .offset(input?.offset || 0);

      return { success: true, broadcasts, total: broadcasts.length };
    }),

  // Create live broadcast
  createLiveBroadcast: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        streamUrl: z.string().url(),
        status: z.enum(["scheduled", "live", "ended"]).default("scheduled"),
        startTime: z.date(),
        endTime: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      try {
        const broadcast = await db.insert(liveBroadcasts).values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description || "",
          streamUrl: input.streamUrl,
          status: input.status,
          startTime: input.startTime,
          endTime: input.endTime,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { success: true, broadcast };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create live broadcast",
        });
      }
    }),

  // Update live broadcast status
  updateBroadcastStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["scheduled", "live", "ended"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      try {
        const broadcast = await db
          .update(liveBroadcasts)
          .set({ status: input.status, updatedAt: new Date() })
          .where(and(eq(liveBroadcasts.id, input.id), eq(liveBroadcasts.userId, ctx.user.id)));

        return { success: true, broadcast };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update broadcast status",
        });
      }
    }),

  // Delete live broadcast
  deleteBroadcast: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      try {
        await db.delete(liveBroadcasts).where(and(eq(liveBroadcasts.id, input.id), eq(liveBroadcasts.userId, ctx.user.id)));

        return { success: true, message: "Broadcast deleted" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete broadcast",
        });
      }
    }),
});
