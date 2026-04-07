/**
 * Streaming User Data Router
 * Manages user playlists, favorites, and listening history
 */

import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';

// In-memory storage (in production, use database)
const userPlaylists: Record<string, any[]> = {};
const listeningHistory: Record<string, any[]> = {};
const favorites: Record<string, Set<number>> = {};

export const streamingUserDataRouter = router({
  /**
   * Create a new playlist
   */
  createPlaylist: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const userId = ctx.user?.id?.toString() || 'anonymous';
      if (!userPlaylists[userId]) {
        userPlaylists[userId] = [];
      }

      const playlist = {
        id: Date.now(),
        name: input.name,
        description: input.description || '',
        tracks: [] as any[],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userPlaylists[userId].push(playlist);
      return { success: true, playlist };
    }),

  /**
   * Get all user playlists
   */
  getPlaylists: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.user?.id?.toString() || 'anonymous';
    return userPlaylists[userId] || [];
  }),

  /**
   * Get playlist by ID
   */
  getPlaylist: protectedProcedure
    .input(z.object({ playlistId: z.number() }))
    .query(({ input, ctx }) => {
      const userId = ctx.user?.id?.toString() || 'anonymous';
      const playlist = userPlaylists[userId]?.find((p) => p.id === input.playlistId);
      return playlist || null;
    }),

  /**
   * Add track to playlist
   */
  addTrackToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        trackId: z.number(),
        title: z.string(),
        artist: z.string(),
        duration: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const userId = ctx.user?.id?.toString() || 'anonymous';
      const playlist = userPlaylists[userId]?.find((p) => p.id === input.playlistId);

      if (!playlist) {
        return { success: false, error: 'Playlist not found' };
      }

      const track = {
        id: input.trackId,
        title: input.title,
        artist: input.artist,
        duration: input.duration,
        addedAt: new Date(),
      };

      playlist.tracks.push(track);
      playlist.updatedAt = new Date();

      return { success: true, playlist };
    }),

  /**
   * Remove track from playlist
   */
  removeTrackFromPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        trackId: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const userId = ctx.user?.id?.toString() || 'anonymous';
      const playlist = userPlaylists[userId]?.find((p) => p.id === input.playlistId);

      if (!playlist) {
        return { success: false, error: 'Playlist not found' };
      }

      playlist.tracks = playlist.tracks.filter((t) => t.id !== input.trackId);
      playlist.updatedAt = new Date();

      return { success: true, playlist };
    }),

  /**
   * Delete playlist
   */
  deletePlaylist: protectedProcedure
    .input(z.object({ playlistId: z.number() }))
    .mutation(({ input, ctx }) => {
      const userId = ctx.user?.id?.toString() || 'anonymous';
      const index = userPlaylists[userId]?.findIndex((p) => p.id === input.playlistId);

      if (index === -1 || index === undefined) {
        return { success: false, error: 'Playlist not found' };
      }

      userPlaylists[userId].splice(index, 1);
      return { success: true };
    }),

  /**
   * Add to listening history
   */
  addToHistory: protectedProcedure
    .input(
      z.object({
        type: z.enum(['track', 'channel', 'station']),
        id: z.number(),
        title: z.string(),
        artist: z.string().optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const userId = ctx.user?.id?.toString() || 'anonymous';
      if (!listeningHistory[userId]) {
        listeningHistory[userId] = [];
      }

      const entry = {
        ...input,
        playedAt: new Date(),
      };

      listeningHistory[userId].unshift(entry);

      // Keep only last 100 entries
      if (listeningHistory[userId].length > 100) {
        listeningHistory[userId] = listeningHistory[userId].slice(0, 100);
      }

      return { success: true };
    }),

  /**
   * Get listening history
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        type: z.enum(['track', 'channel', 'station']).optional(),
      })
    )
    .query(({ input, ctx }) => {
      const userId = ctx.user?.id?.toString() || 'anonymous';
      let history = listeningHistory[userId] || [];

      if (input.type) {
        history = history.filter((h) => h.type === input.type);
      }

      return history.slice(0, input.limit);
    }),

  /**
   * Add to favorites
   */
  addFavorite: protectedProcedure
    .input(
      z.object({
        type: z.enum(['track', 'channel', 'station']),
        id: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const userId = ctx.user?.id?.toString() || 'anonymous';
      const key = `${userId}:${input.type}`;

      if (!favorites[key]) {
        favorites[key] = new Set();
      }

      favorites[key].add(input.id);
      return { success: true };
    }),

  /**
   * Remove from favorites
   */
  removeFavorite: protectedProcedure
    .input(
      z.object({
        type: z.enum(['track', 'channel', 'station']),
        id: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const userId = ctx.user?.id?.toString() || 'anonymous';
      const key = `${userId}:${input.type}`;

      if (favorites[key]) {
        favorites[key].delete(input.id);
      }

      return { success: true };
    }),

  /**
   * Get favorites
   */
  getFavorites: protectedProcedure
    .input(z.object({ type: z.enum(['track', 'channel', 'station']) }))
    .query(({ input, ctx }) => {
      const userId = ctx.user?.id?.toString() || 'anonymous';
      const key = `${userId}:${input.type}`;
      return Array.from(favorites[key] || []);
    }),

  /**
   * Check if item is favorite
   */
  isFavorite: protectedProcedure
    .input(
      z.object({
        type: z.enum(['track', 'channel', 'station']),
        id: z.number(),
      })
    )
    .query(({ input, ctx }) => {
      const userId = ctx.user?.id?.toString() || 'anonymous';
      const key = `${userId}:${input.type}`;
      return favorites[key]?.has(input.id) || false;
    }),

  /**
   * Get listening stats
   */
  getStats: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.user?.id?.toString() || 'anonymous';
    const history = listeningHistory[userId] || [];
    const playlists = userPlaylists[userId] || [];

    const trackCount = history.filter((h) => h.type === 'track').length;
    const channelCount = history.filter((h) => h.type === 'channel').length;
    const stationCount = history.filter((h) => h.type === 'station').length;

    return {
      totalPlays: history.length,
      tracksPlayed: trackCount,
      channelsWatched: channelCount,
      stationsListened: stationCount,
      playlistCount: playlists.length,
      totalPlaylistTracks: playlists.reduce((sum, p) => sum + p.tracks.length, 0),
    };
  }),
});

export default streamingUserDataRouter;
