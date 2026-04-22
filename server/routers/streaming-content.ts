/**
 * Streaming Content Router
 * Provides real radio stations (American genres) and TV channels
 * Uses data integration service to fetch from real sources with caching
 */

import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import {
  fetchIPTVChannels,
  fetchRadioStations,
  fetchMusicTracks,
} from '../services/data-integration';
import { discoverAndSyncChannels, getDiscoveryStats } from '../services/channel-discovery';

// In-memory cache for streaming data
let cachedData: {
  channels: any[];
  stations: any[];
  tracks: any[];
  lastUpdated: number;
} = {
  channels: [],
  stations: [],
  tracks: [],
  lastUpdated: 0,
};

// Cache expiration time (1 hour)
const CACHE_EXPIRATION_MS = 60 * 60 * 1000;

/**
 * Initialize cache with real data on startup
 */
async function initializeCache() {
  try {
    console.log('[Streaming Content] Initializing cache with American genre stations...');
    const [channels, stations, tracks] = await Promise.all([
      fetchIPTVChannels(50),
      fetchRadioStations(50),
      fetchMusicTracks(12),
    ]);

    cachedData = {
      channels,
      stations,
      tracks,
      lastUpdated: Date.now(),
    };

    console.log('[Streaming Content] Cache initialized');
    console.log(`  - TV Channels: ${cachedData.channels.length}`);
    console.log(`  - Radio Stations: ${cachedData.stations.length}`);
    console.log(`  - Music Tracks: ${cachedData.tracks.length}`);
  } catch (error) {
    console.error('[Streaming Content] Error initializing cache:', error);
    // Fallback to just radio stations (always available, no network needed)
    cachedData = {
      channels: [],
      stations: await fetchRadioStations(24),
      tracks: await fetchMusicTracks(6),
      lastUpdated: Date.now(),
    };
  }
}

/**
 * Check if cache needs refresh
 */
async function refreshCacheIfNeeded() {
  const now = Date.now();
  if (now - cachedData.lastUpdated > CACHE_EXPIRATION_MS) {
    console.log('[Streaming Content] Cache expired, refreshing...');
    await initializeCache();
  }
}

// Initialize cache on module load
initializeCache().catch((err) =>
  console.error('[Streaming Content] Failed to initialize cache:', err)
);

export const streamingContentRouter = router({
  /**
   * Get all TV channels
   */
  getChannels: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      await refreshCacheIfNeeded();
      let channels = cachedData.channels;
      if (input.category) {
        channels = channels.filter((c) => c.category === input.category);
      }
      return channels.slice(0, input.limit);
    }),

  /**
   * Get channel by ID
   */
  getChannel: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      await refreshCacheIfNeeded();
      return cachedData.channels.find((c) => c.id === input.id) || null;
    }),

  /**
   * Get all radio stations
   */
  getStations: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      await refreshCacheIfNeeded();
      let stations = cachedData.stations;
      if (input.category) {
        stations = stations.filter((s: any) => s.category === input.category);
      }
      return stations.slice(0, input.limit);
    }),

  /**
   * Get station by ID
   */
  getStation: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      await refreshCacheIfNeeded();
      return cachedData.stations.find((s) => s.id === input.id) || null;
    }),

  /**
   * Get available genres
   */
  getGenres: publicProcedure.query(async () => {
    await refreshCacheIfNeeded();
    const genres = new Set(cachedData.stations.map((s: any) => s.category));
    return Array.from(genres).sort();
  }),

  /**
   * Get all music tracks
   */
  getTracks: publicProcedure
    .input(
      z.object({
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      await refreshCacheIfNeeded();
      return cachedData.tracks.slice(0, input.limit);
    }),

  /**
   * Get track by ID
   */
  getTrack: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      await refreshCacheIfNeeded();
      return cachedData.tracks.find((t) => t.id === input.id) || null;
    }),

  /**
   * Search channels and stations
   */
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      await refreshCacheIfNeeded();
      const q = input.query.toLowerCase();
      const channels = cachedData.channels.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
      const stations = cachedData.stations.filter(
        (s: any) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          (s.genre && s.genre.toLowerCase().includes(q))
      );
      return { channels, stations };
    }),

  /**
   * Get featured/trending content
   */
  getFeatured: publicProcedure.query(async () => {
    await refreshCacheIfNeeded();
    return {
      channels: cachedData.channels.filter((c) => c.isLive).slice(0, 5),
      stations: cachedData.stations.filter((s) => s.isLive).slice(0, 5),
      tracks: cachedData.tracks.slice(0, 5),
    };
  }),

  /**
   * Refresh cache
   */
  refreshCache: publicProcedure.mutation(async () => {
    try {
      console.log('[Streaming Content] Manual cache refresh requested');
      await initializeCache();
      return {
        success: true,
        message: 'Cache refreshed successfully',
        data: {
          channels: cachedData.channels.length,
          stations: cachedData.stations.length,
          tracks: cachedData.tracks.length,
        },
      };
    } catch (error) {
      console.error('[Streaming Content] Cache refresh failed:', error);
      return {
        success: false,
        message: 'Cache refresh failed',
        error: String(error),
      };
    }
  }),

  /**
   * Get cache status
   */
  getCacheStatus: publicProcedure.query(() => {
    return {
      channels: cachedData.channels.length,
      stations: cachedData.stations.length,
      tracks: cachedData.tracks.length,
      lastUpdated: new Date(cachedData.lastUpdated),
      cacheExpiration: new Date(
        cachedData.lastUpdated + CACHE_EXPIRATION_MS
      ),
    };
  }),

  /**
   * Trigger channel auto-discovery (admin only)
   */
  triggerDiscovery: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'owner') {
      throw new Error('Only admins can trigger channel discovery');
    }
    
    try {
      console.log('[Streaming Content] Admin triggered channel discovery');
      const result = await discoverAndSyncChannels();
      return {
        success: true,
        message: 'Channel discovery completed',
        data: result,
      };
    } catch (error) {
      console.error('[Streaming Content] Discovery trigger failed:', error);
      return {
        success: false,
        message: 'Channel discovery failed',
        error: String(error),
      };
    }
  }),

  /**
   * Get channel discovery statistics
   */
  getDiscoveryStats: publicProcedure.query(async () => {
    try {
      return await getDiscoveryStats();
    } catch (error) {
      console.error('[Streaming Content] Error getting discovery stats:', error);
      return {
        totalChannels: 0,
        bySource: {},
        byCategory: {},
        lastUpdated: new Date(),
        error: String(error),
      };
    }
  }),
});
