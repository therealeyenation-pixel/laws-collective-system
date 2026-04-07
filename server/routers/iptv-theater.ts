/**
 * IPTV Theater Channel Router
 * Manages live streaming, VOD, channel management, and EPG scheduling
 */

import { protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';

const iptvTheaterRouter = {
  /**
   * Create a new IPTV channel
   */
  createChannel: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(['live', 'sports', 'entertainment', 'educational', 'news']),
        logoUrl: z.string().optional(),
        bannerUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.insert(iptvChannels).values({
        name: input.name,
        description: input.description,
        category: input.category,
        logoUrl: input.logoUrl,
        bannerUrl: input.bannerUrl,
        isActive: true,
        isLive: false,
        currentViewers: 0,
        totalViewers: 0,
      });

      return { id: result.insertId, ...input };
    }),

  /**
   * Get all IPTV channels
   */
  getChannels: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        isLive: z.boolean().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const channels = await ctx.db.query.iptvChannels.findMany({
        limit: input.limit,
        offset: input.offset,
      });

      return channels;
    }),

  /**
   * Get channel details with current stream info
   */
  getChannelDetails: protectedProcedure
    .input(z.object({ channelId: z.number() }))
    .query(async ({ input, ctx }) => {
      const channel = await ctx.db.query.iptvChannels.findFirst({
        where: (channels, { eq }) => eq(channels.id, input.channelId),
      });

      const activeStream = await ctx.db.query.iptvStreams.findFirst({
        where: (streams, { eq, and }) =>
          and(eq(streams.channelId, input.channelId), eq(streams.isActive, true)),
      });

      return {
        channel,
        activeStream,
      };
    }),

  /**
   * Start a live stream on a channel
   */
  startLiveStream: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        streamUrl: z.string(),
        bitrate: z.number().optional(),
        resolution: z.string().optional(),
        codec: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const streamKey = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const result = await ctx.db.insert(iptvStreams).values({
        channelId: input.channelId,
        streamUrl: input.streamUrl,
        streamKey,
        bitrate: input.bitrate,
        resolution: input.resolution,
        codec: input.codec,
        isActive: true,
        startTime: new Date(),
      });

      // Update channel status
      await ctx.db
        .update(iptvChannels)
        .set({ isLive: true, currentViewers: 0 })
        .where((channels) => channels.id === input.channelId);

      return { streamId: result.insertId, streamKey };
    }),

  /**
   * Stop a live stream
   */
  stopLiveStream: protectedProcedure
    .input(z.object({ streamId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const stream = await ctx.db.query.iptvStreams.findFirst({
        where: (streams, { eq }) => eq(streams.id, input.streamId),
      });

      if (!stream) throw new Error('Stream not found');

      await ctx.db
        .update(iptvStreams)
        .set({ isActive: false, endTime: new Date() })
        .where((streams) => streams.id === input.streamId);

      // Check if any other streams are active for this channel
      const activeStreams = await ctx.db.query.iptvStreams.findMany({
        where: (streams, { eq, and }) =>
          and(eq(streams.channelId, stream.channelId), eq(streams.isActive, true)),
      });

      if (activeStreams.length === 0) {
        await ctx.db
          .update(iptvChannels)
          .set({ isLive: false })
          .where((channels) => channels.id === stream.channelId);
      }

      return { success: true };
    }),

  /**
   * Get stream status and viewer count
   */
  getStreamStatus: protectedProcedure
    .input(z.object({ streamId: z.number() }))
    .query(async ({ input, ctx }) => {
      const stream = await ctx.db.query.iptvStreams.findFirst({
        where: (streams, { eq }) => eq(streams.id, input.streamId),
      });

      const channel = await ctx.db.query.iptvChannels.findFirst({
        where: (channels, { eq }) => eq(channels.id, stream?.channelId || 0),
      });

      return {
        stream,
        channel,
        isLive: stream?.isActive,
        currentViewers: channel?.currentViewers,
      };
    }),

  /**
   * Upload VOD content
   */
  uploadVODContent: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.string(),
        videoUrl: z.string(),
        thumbnailUrl: z.string().optional(),
        duration: z.number().optional(),
        releaseDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.insert(iptvVODContent).values({
        title: input.title,
        description: input.description,
        category: input.category,
        videoUrl: input.videoUrl,
        thumbnailUrl: input.thumbnailUrl,
        duration: input.duration,
        releaseDate: input.releaseDate,
        isPublished: true,
        viewCount: 0,
      });

      return { id: result.insertId, ...input };
    }),

  /**
   * Get VOD library
   */
  getVODLibrary: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const content = await ctx.db.query.iptvVODContent.findMany({
        limit: input.limit,
        offset: input.offset,
      });

      return content;
    }),

  /**
   * Start playback and track history
   */
  startPlayback: protectedProcedure
    .input(
      z.object({
        contentId: z.number().optional(),
        channelId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.insert(iptvPlaybackHistory).values({
        userId: ctx.user.id,
        contentId: input.contentId,
        channelId: input.channelId,
        playbackPosition: 0,
        watchedAt: new Date(),
      });

      return { playbackId: result.insertId };
    }),

  /**
   * Update playback position
   */
  updatePlaybackPosition: protectedProcedure
    .input(
      z.object({
        playbackId: z.number(),
        position: z.number(),
        duration: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const completionPercentage = (input.position / input.duration) * 100;

      await ctx.db
        .update(iptvPlaybackHistory)
        .set({
          playbackPosition: input.position,
          duration: input.duration,
          completionPercentage,
        })
        .where((history) => history.id === input.playbackId);

      return { success: true };
    }),

  /**
   * Get user's playback history
   */
  getPlaybackHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const history = await ctx.db.query.iptvPlaybackHistory.findMany({
        where: (history, { eq }) => eq(history.userId, ctx.user.id),
        limit: input.limit,
        offset: input.offset,
      });

      return history;
    }),

  /**
   * Create EPG schedule entry
   */
  createEPGSchedule: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        programTitle: z.string(),
        description: z.string().optional(),
        startTime: z.date(),
        endTime: z.date(),
        genre: z.string().optional(),
        rating: z.string().optional(),
        recordingEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const duration = Math.floor(
        (input.endTime.getTime() - input.startTime.getTime()) / 60000
      );

      const result = await ctx.db.insert(iptvEPGSchedule).values({
        channelId: input.channelId,
        programTitle: input.programTitle,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        duration,
        genre: input.genre,
        rating: input.rating,
        recordingEnabled: input.recordingEnabled || false,
      });

      return { id: result.insertId, ...input };
    }),

  /**
   * Get EPG schedule for a channel
   */
  getEPGSchedule: protectedProcedure
    .input(
      z.object({
        channelId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input, ctx }) => {
      const schedule = await ctx.db.query.iptvEPGSchedule.findMany({
        where: (epg, { eq, and, gte, lte }) =>
          and(
            eq(epg.channelId, input.channelId),
            gte(epg.startTime, input.startDate),
            lte(epg.endTime, input.endDate)
          ),
      });

      return schedule;
    }),

  /**
   * Subscribe to a channel
   */
  followChannel: protectedProcedure
    .input(z.object({ channelId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.insert(iptvChannelFollows).values({
        userId: ctx.user.id,
        channelId: input.channelId,
        isActive: true,
        notifications: true,
      });

      return { followId: result.insertId };
    }),

  /**
   * Get user's subscribed channels
   */
  getFollowedChannels: protectedProcedure.query(async ({ ctx }) => {
    const follows = await ctx.db.query.iptvChannelFollows.findMany({
      where: (subs, { eq }) => eq(subs.userId, ctx.user.id),
    });

    return follows;
  }),

  /**
   * Create a playlist
   */
  createPlaylist: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.insert(iptvPlaylists).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        isPublic: input.isPublic || false,
        itemCount: 0,
      });

      return { playlistId: result.insertId };
    }),

  /**
   * Add content to playlist
   */
  addToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        contentId: z.number().optional(),
        channelId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const playlist = await ctx.db.query.iptvPlaylists.findFirst({
        where: (playlists, { eq }) => eq(playlists.id, input.playlistId),
      });

      if (!playlist) throw new Error('Playlist not found');

      const position = playlist.itemCount + 1;

      const result = await ctx.db.insert(iptvPlaylistItems).values({
        playlistId: input.playlistId,
        contentId: input.contentId,
        channelId: input.channelId,
        position,
      });

      // Update item count
      await ctx.db
        .update(iptvPlaylists)
        .set({ itemCount: playlist.itemCount + 1 })
        .where((playlists) => playlists.id === input.playlistId);

      return { itemId: result.insertId };
    }),
};

export default iptvTheaterRouter;
