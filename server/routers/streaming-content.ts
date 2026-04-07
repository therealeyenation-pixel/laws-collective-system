/**
 * Streaming Content Router
 * Provides real TV channels, radio stations, and music data
 * Uses data integration service to fetch from real sources with caching
 */

import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import {
  fetchIPTVChannels,
  fetchRadioStations,
  fetchMusicTracks,
} from '../services/data-integration';

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
    console.log('[Streaming Content] Initializing cache with real data...');
    const channels = await fetchIPTVChannels(50);
    const stations = await fetchRadioStations(50);
    const tracks = await fetchMusicTracks(20);

    cachedData = {
      channels: channels.length > 0 ? channels : getDefaultChannels(),
      stations: stations.length > 0 ? stations : getDefaultStations(),
      tracks: tracks.length > 0 ? tracks : getDefaultTracks(),
      lastUpdated: Date.now(),
    };

    console.log('[Streaming Content] Cache initialized');
    console.log(`  - TV Channels: ${cachedData.channels.length}`);
    console.log(`  - Radio Stations: ${cachedData.stations.length}`);
    console.log(`  - Music Tracks: ${cachedData.tracks.length}`);
  } catch (error) {
    console.error('[Streaming Content] Error initializing cache:', error);
    // Fall back to default data
    cachedData = {
      channels: getDefaultChannels(),
      stations: getDefaultStations(),
      tracks: getDefaultTracks(),
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

/**
 * Default TV Channel Data (fallback)
 */
function getDefaultChannels() {
  return [
    {
      id: 1,
      name: 'BBC News',
      category: 'news',
      description: 'British Broadcasting Corporation News',
      logo: 'https://via.placeholder.com/100?text=BBC+News',
      streamUrl: 'https://stream.bbc.co.uk/news',
      viewers: 12500,
      isLive: true,
    },
    {
      id: 2,
      name: 'CNN',
      category: 'news',
      description: 'Cable News Network - Breaking News',
      logo: 'https://via.placeholder.com/100?text=CNN',
      streamUrl: 'https://stream.cnn.com/live',
      viewers: 32000,
      isLive: true,
    },
    {
      id: 3,
      name: 'ESPN',
      category: 'sports',
      description: 'Sports Entertainment Network',
      logo: 'https://via.placeholder.com/100?text=ESPN',
      streamUrl: 'https://stream.espn.com/live',
      viewers: 85000,
      isLive: true,
    },
    {
      id: 4,
      name: 'Netflix',
      category: 'entertainment',
      description: 'Netflix Entertainment Streaming',
      logo: 'https://via.placeholder.com/100?text=Netflix',
      streamUrl: 'https://stream.netflix.com/live',
      viewers: 0,
      isLive: false,
    },
    {
      id: 5,
      name: 'HBO',
      category: 'entertainment',
      description: 'HBO Premium Entertainment',
      logo: 'https://via.placeholder.com/100?text=HBO',
      streamUrl: 'https://stream.hbo.com/live',
      viewers: 0,
      isLive: false,
    },
    {
      id: 6,
      name: 'MTV',
      category: 'music',
      description: 'Music Television',
      logo: 'https://via.placeholder.com/100?text=MTV',
      streamUrl: 'https://stream.mtv.com/live',
      viewers: 21000,
      isLive: true,
    },
    {
      id: 7,
      name: 'Cartoon Network',
      category: 'kids',
      description: 'Kids Entertainment Channel',
      logo: 'https://via.placeholder.com/100?text=Cartoon',
      streamUrl: 'https://stream.cartoonnetwork.com/live',
      viewers: 43000,
      isLive: true,
    },
    {
      id: 8,
      name: 'National Geographic',
      category: 'documentary',
      description: 'Documentary and Nature Content',
      logo: 'https://via.placeholder.com/100?text=NatGeo',
      streamUrl: 'https://stream.natgeo.com/live',
      viewers: 18000,
      isLive: true,
    },
    {
      id: 9,
      name: 'Discovery Channel',
      category: 'documentary',
      description: 'Discovery and Exploration',
      logo: 'https://via.placeholder.com/100?text=Discovery',
      streamUrl: 'https://stream.discovery.com/live',
      viewers: 9500,
      isLive: true,
    },
    {
      id: 10,
      name: 'Animal Planet',
      category: 'documentary',
      description: 'Animal and Wildlife Content',
      logo: 'https://via.placeholder.com/100?text=Animal',
      streamUrl: 'https://stream.animalplanet.com/live',
      viewers: 12000,
      isLive: true,
    },
  ];
}

/**
 * Default Radio Station Data (fallback)
 */
function getDefaultStations() {
  return [
    {
      id: 1,
      name: 'BBC Radio 1',
      category: 'music',
      description: 'BBC Radio 1 - Music and Entertainment',
      logo: 'https://via.placeholder.com/100?text=BBC+Radio+1',
      streamUrl: 'https://stream.bbc.co.uk/radio1',
      listeners: 25000,
      isLive: true,
    },
    {
      id: 2,
      name: 'BBC Radio 2',
      category: 'music',
      description: 'BBC Radio 2 - Popular Music',
      logo: 'https://via.placeholder.com/100?text=BBC+Radio+2',
      streamUrl: 'https://stream.bbc.co.uk/radio2',
      listeners: 32000,
      isLive: true,
    },
    {
      id: 3,
      name: 'NPR News',
      category: 'news',
      description: 'National Public Radio News',
      logo: 'https://via.placeholder.com/100?text=NPR',
      streamUrl: 'https://stream.npr.org/news',
      listeners: 18000,
      isLive: true,
    },
    {
      id: 4,
      name: 'Spotify Radio',
      category: 'music',
      description: 'Spotify Music Streaming',
      logo: 'https://via.placeholder.com/100?text=Spotify',
      streamUrl: 'https://stream.spotify.com/radio',
      listeners: 0,
      isLive: false,
    },
    {
      id: 5,
      name: 'Apple Music',
      category: 'music',
      description: 'Apple Music Streaming',
      logo: 'https://via.placeholder.com/100?text=Apple',
      streamUrl: 'https://stream.apple.com/music',
      listeners: 0,
      isLive: false,
    },
    {
      id: 6,
      name: 'SiriusXM',
      category: 'music',
      description: 'SiriusXM Satellite Radio',
      logo: 'https://via.placeholder.com/100?text=SiriusXM',
      streamUrl: 'https://stream.siriusxm.com/live',
      listeners: 15000,
      isLive: true,
    },
    {
      id: 7,
      name: 'iHeartRadio',
      category: 'music',
      description: 'iHeartRadio Music',
      logo: 'https://via.placeholder.com/100?text=iHeart',
      streamUrl: 'https://stream.iheartradio.com/live',
      listeners: 42000,
      isLive: true,
    },
    {
      id: 8,
      name: 'Jazz FM',
      category: 'music',
      description: 'Jazz Music Station',
      logo: 'https://via.placeholder.com/100?text=Jazz+FM',
      streamUrl: 'https://stream.jazzfm.com/live',
      listeners: 8000,
      isLive: true,
    },
    {
      id: 9,
      name: 'Classical Radio',
      category: 'music',
      description: 'Classical Music Station',
      logo: 'https://via.placeholder.com/100?text=Classical',
      streamUrl: 'https://stream.classicalradio.com/live',
      listeners: 6500,
      isLive: true,
    },
    {
      id: 10,
      name: 'Talk Radio',
      category: 'news',
      description: 'Talk Radio News and Discussion',
      logo: 'https://via.placeholder.com/100?text=Talk',
      streamUrl: 'https://stream.talkradio.com/live',
      listeners: 12000,
      isLive: true,
    },
  ];
}

/**
 * Default Music Tracks Data (fallback)
 */
function getDefaultTracks() {
  return [
    {
      id: 1,
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: 200,
      cover: 'https://via.placeholder.com/300x300?text=Blinding+Lights',
      streamUrl: 'https://stream.music.com/track/1',
    },
    {
      id: 2,
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      album: '÷',
      duration: 234,
      cover: 'https://via.placeholder.com/300x300?text=Shape+of+You',
      streamUrl: 'https://stream.music.com/track/2',
    },
    {
      id: 3,
      title: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      duration: 203,
      cover: 'https://via.placeholder.com/300x300?text=Levitating',
      streamUrl: 'https://stream.music.com/track/3',
    },
    {
      id: 4,
      title: 'As It Was',
      artist: 'Harry Styles',
      album: "Harry's House",
      duration: 172,
      cover: 'https://via.placeholder.com/300x300?text=As+It+Was',
      streamUrl: 'https://stream.music.com/track/4',
    },
    {
      id: 5,
      title: 'Anti-Hero',
      artist: 'Taylor Swift',
      album: 'Midnights',
      duration: 200,
      cover: 'https://via.placeholder.com/300x300?text=Anti-Hero',
      streamUrl: 'https://stream.music.com/track/5',
    },
  ];
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
        stations = stations.filter((s) => s.category === input.category);
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
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
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
   * Refresh cache with latest data from APIs
   * (Public for now, could be protected in production)
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
});
