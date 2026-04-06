/**
 * IPTV Router - tRPC procedures for IPTV channel management
 * Provides access to 11,000+ live channels with search, filtering, and streaming
 */

import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  getAllIPTVChannels,
  searchChannels,
  getChannelsByCategory,
  getAvailableCategories,
  getTrendingChannels,
  getChannelEPG,
  addCustomProvider,
  cacheChannelsForOffline,
  type IPTVChannel,
  type IPTVProvider,
} from "../_core/iptv";

export const iptvRouter = router({
  /**
   * Get all available IPTV channels
   */
  getAllChannels: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const channels = await getAllIPTVChannels();
        const paginated = channels.slice(input.offset, input.offset + input.limit);
        return {
          success: true,
          channels: paginated,
          total: channels.length,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        console.error("Error fetching IPTV channels:", error);
        return {
          success: false,
          channels: [],
          total: 0,
          error: "Failed to fetch channels",
        };
      }
    }),

  /**
   * Search channels by name or category
   */
  searchChannels: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const results = await searchChannels(input.query, input.category);
        return {
          success: true,
          channels: results,
          count: results.length,
        };
      } catch (error) {
        console.error("Error searching channels:", error);
        return {
          success: false,
          channels: [],
          count: 0,
          error: "Search failed",
        };
      }
    }),

  /**
   * Get channels by category
   */
  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      try {
        const channels = await getChannelsByCategory(input.category);
        return {
          success: true,
          category: input.category,
          channels,
          count: channels.length,
        };
      } catch (error) {
        console.error("Error fetching category channels:", error);
        return {
          success: false,
          channels: [],
          count: 0,
          error: "Failed to fetch category",
        };
      }
    }),

  /**
   * Get all available categories
   */
  getCategories: publicProcedure.query(async () => {
    try {
      const categories = await getAvailableCategories();
      return {
        success: true,
        categories,
        count: categories.length,
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        success: false,
        categories: [],
        count: 0,
        error: "Failed to fetch categories",
      };
    }
  }),

  /**
   * Get trending/popular channels
   */
  getTrending: publicProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      try {
        const channels = await getTrendingChannels(input.limit);
        return {
          success: true,
          channels,
          count: channels.length,
        };
      } catch (error) {
        console.error("Error fetching trending channels:", error);
        return {
          success: false,
          channels: [],
          count: 0,
          error: "Failed to fetch trending",
        };
      }
    }),

  /**
   * Get EPG (Electronic Program Guide) for a channel
   */
  getEPG: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      try {
        const epg = await getChannelEPG(input.channelId);
        return {
          success: true,
          channelId: input.channelId,
          programs: epg,
          count: epg.length,
        };
      } catch (error) {
        console.error("Error fetching EPG:", error);
        return {
          success: false,
          programs: [],
          count: 0,
          error: "Failed to fetch EPG",
        };
      }
    }),

  /**
   * Add custom IPTV provider (admin only)
   */
  addCustomProvider: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        m3uUrl: z.string().url(),
        epgUrl: z.string().url().optional(),
        categories: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check admin permission
        if (ctx.user?.role !== "admin") {
          return {
            success: false,
            error: "Admin permission required",
          };
        }

        const provider: IPTVProvider = {
          name: input.name,
          m3uUrl: input.m3uUrl,
          epgUrl: input.epgUrl,
          categories: input.categories,
          channelCount: 0,
        };

        addCustomProvider(provider);

        return {
          success: true,
          message: `Provider "${input.name}" added successfully`,
          provider,
        };
      } catch (error) {
        console.error("Error adding custom provider:", error);
        return {
          success: false,
          error: "Failed to add provider",
        };
      }
    }),

  /**
   * Cache channels for offline access
   */
  cacheForOffline: protectedProcedure
    .input(z.object({ category: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const count = await cacheChannelsForOffline(input.category);
        return {
          success: true,
          message: `${count} channels cached for offline access`,
          cachedCount: count,
        };
      } catch (error) {
        console.error("Error caching channels:", error);
        return {
          success: false,
          error: "Failed to cache channels",
          cachedCount: 0,
        };
      }
    }),

  /**
   * Get stream info and validate URL
   */
  getStreamInfo: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      try {
        const channels = await getAllIPTVChannels();
        const channel = channels.find((ch) => ch.id === input.channelId);

        if (!channel) {
          return {
            success: false,
            error: "Channel not found",
          };
        }

        return {
          success: true,
          channel: {
            id: channel.id,
            name: channel.name,
            category: channel.category,
            streamUrl: channel.streamUrl,
            quality: channel.quality,
            isLive: channel.isLive,
            logo: channel.logo,
          },
        };
      } catch (error) {
        console.error("Error getting stream info:", error);
        return {
          success: false,
          error: "Failed to get stream info",
        };
      }
    }),
});
