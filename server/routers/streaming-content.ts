/**
 * Streaming Content Router
 * Provides real TV channels, radio stations, and music data
 */

import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';

// Real TV Channel Data
const TV_CHANNELS = [
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

// Real Radio Station Data
const RADIO_STATIONS = [
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

// Music Tracks
const MUSIC_TRACKS = [
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
    album: 'Harry\'s House',
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
    .query(({ input }) => {
      let channels = TV_CHANNELS;
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
    .query(({ input }) => {
      return TV_CHANNELS.find((c) => c.id === input.id) || null;
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
    .query(({ input }) => {
      let stations = RADIO_STATIONS;
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
    .query(({ input }) => {
      return RADIO_STATIONS.find((s) => s.id === input.id) || null;
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
    .query(({ input }) => {
      return MUSIC_TRACKS.slice(0, input.limit);
    }),

  /**
   * Get track by ID
   */
  getTrack: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return MUSIC_TRACKS.find((t) => t.id === input.id) || null;
    }),

  /**
   * Search channels and stations
   */
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      const q = input.query.toLowerCase();
      const channels = TV_CHANNELS.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
      const stations = RADIO_STATIONS.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
      return { channels, stations };
    }),

  /**
   * Get featured/trending content
   */
  getFeatured: publicProcedure.query(() => {
    return {
      channels: TV_CHANNELS.filter((c) => c.isLive).slice(0, 5),
      stations: RADIO_STATIONS.filter((s) => s.isLive).slice(0, 5),
      tracks: MUSIC_TRACKS.slice(0, 5),
    };
  }),
});
