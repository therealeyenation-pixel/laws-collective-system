/**
 * Streaming Data Seed Router
 * Populates IPTV channels, radio stations, and music using Drizzle ORM
 */

import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { iptvChannels, broadcastRadioChannels } from '../../drizzle/schema';

export const streamingDataSeedRouter = router({
  /**
   * Seed IPTV channels using Drizzle ORM
   */
  seedIPTVChannels: publicProcedure.mutation(async () => {
    try {
      const db = await getDb();
      if (!db) return { success: false, created: 0, error: 'Database unavailable' };

      const channelsData = [
        {
          name: 'BBC News',
          description: 'British Broadcasting Corporation News',
          category: 'news',
          subcategory: 'news',
          logoUrl: 'https://via.placeholder.com/100?text=BBC',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=BBC+News',
          streamUrl: 'https://stream.bbc.co.uk/news',
          country: 'UK',
          language: 'en',
          contentRating: 'G' as const,
          requiresAgeVerification: false,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentViewers: 1250,
          totalViewers: 45000,
        },
        {
          name: 'CNN',
          description: 'Cable News Network - Breaking News',
          category: 'news',
          subcategory: 'news',
          logoUrl: 'https://via.placeholder.com/100?text=CNN',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=CNN',
          streamUrl: 'https://stream.cnn.com/live',
          country: 'USA',
          language: 'en',
          contentRating: 'G' as const,
          requiresAgeVerification: false,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentViewers: 3200,
          totalViewers: 120000,
        },
        {
          name: 'ESPN',
          description: 'Sports Entertainment Network',
          category: 'sports',
          subcategory: 'sports',
          logoUrl: 'https://via.placeholder.com/100?text=ESPN',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=ESPN',
          streamUrl: 'https://stream.espn.com/live',
          country: 'USA',
          language: 'en',
          contentRating: 'PG' as const,
          requiresAgeVerification: false,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentViewers: 8500,
          totalViewers: 250000,
        },
        {
          name: 'Netflix',
          description: 'Netflix Entertainment Streaming',
          category: 'entertainment',
          subcategory: 'streaming',
          logoUrl: 'https://via.placeholder.com/100?text=Netflix',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=Netflix',
          streamUrl: 'https://stream.netflix.com/live',
          country: 'Global',
          language: 'en',
          contentRating: 'PG-13' as const,
          requiresAgeVerification: false,
          isAdultContent: false,
          accessLevel: 'members' as const,
          isActive: true,
          isLive: false,
          currentViewers: 0,
          totalViewers: 500000,
        },
        {
          name: 'HBO',
          description: 'HBO Premium Entertainment',
          category: 'entertainment',
          subcategory: 'premium',
          logoUrl: 'https://via.placeholder.com/100?text=HBO',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=HBO',
          streamUrl: 'https://stream.hbo.com/live',
          country: 'USA',
          language: 'en',
          contentRating: 'R' as const,
          requiresAgeVerification: false,
          isAdultContent: false,
          accessLevel: 'members' as const,
          isActive: true,
          isLive: false,
          currentViewers: 0,
          totalViewers: 300000,
        },
        {
          name: 'MTV',
          description: 'Music Television',
          category: 'music',
          subcategory: 'music',
          logoUrl: 'https://via.placeholder.com/100?text=MTV',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=MTV',
          streamUrl: 'https://stream.mtv.com/live',
          country: 'USA',
          language: 'en',
          contentRating: 'PG-13' as const,
          requiresAgeVerification: false,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentViewers: 2100,
          totalViewers: 80000,
        },
        {
          name: 'Cartoon Network',
          description: 'Kids Entertainment Channel',
          category: 'kids',
          subcategory: 'animation',
          logoUrl: 'https://via.placeholder.com/100?text=Cartoon',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=Cartoon+Network',
          streamUrl: 'https://stream.cartoonnetwork.com/live',
          country: 'USA',
          language: 'en',
          contentRating: 'G' as const,
          requiresAgeVerification: false,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentViewers: 4300,
          totalViewers: 150000,
        },
        {
          name: 'National Geographic',
          description: 'Documentary and Nature Content',
          category: 'documentary',
          subcategory: 'nature',
          logoUrl: 'https://via.placeholder.com/100?text=NatGeo',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=National+Geographic',
          streamUrl: 'https://stream.natgeo.com/live',
          country: 'USA',
          language: 'en',
          contentRating: 'PG' as const,
          requiresAgeVerification: false,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentViewers: 1800,
          totalViewers: 65000,
        },
        {
          name: 'Discovery Channel',
          description: 'Discovery and Exploration',
          category: 'documentary',
          subcategory: 'discovery',
          logoUrl: 'https://via.placeholder.com/100?text=Discovery',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=Discovery',
          streamUrl: 'https://stream.discovery.com/live',
          country: 'USA',
          language: 'en',
          contentRating: 'PG' as const,
          requiresAgeVerification: false,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentViewers: 950,
          totalViewers: 35000,
        },
        {
          name: 'Animal Planet',
          description: 'Animal and Wildlife Content',
          category: 'documentary',
          subcategory: 'animals',
          logoUrl: 'https://via.placeholder.com/100?text=AnimalPlanet',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=Animal+Planet',
          streamUrl: 'https://stream.animalplanet.com/live',
          country: 'USA',
          language: 'en',
          contentRating: 'PG' as const,
          requiresAgeVerification: false,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentViewers: 1200,
          totalViewers: 42000,
        },
      ];

      let created = 0;
      for (const channel of channelsData) {
        try {
          await db.insert(iptvChannels).values(channel);
          created++;
        } catch (err) {
          console.error(`Failed to insert ${channel.name}:`, err);
        }
      }

      return { success: true, created, message: `Created ${created} IPTV channels` };
    } catch (err) {
      console.error('Seeding error:', err);
      return { success: false, created: 0, error: String(err) };
    }
  }),

  /**
   * Seed Radio Stations using Drizzle ORM
   */
  seedRadioStations: publicProcedure.mutation(async () => {
    try {
      const db = await getDb();
      if (!db) return { success: false, created: 0, error: 'Database unavailable' };

      const stationsData = [
        {
          name: 'BBC Radio 1',
          description: 'BBC Radio 1 - Music and Entertainment',
          type: 'radio' as const,
          category: 'music',
          subcategory: 'pop',
          logoUrl: 'https://via.placeholder.com/100?text=BBC1',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=BBC+Radio+1',
          streamUrl: 'https://stream.bbc.co.uk/radio1',
          country: 'UK',
          language: 'en',
          contentRating: 'G' as const,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentListeners: 2500,
          totalListeners: 85000,
        },
        {
          name: 'BBC Radio 2',
          description: 'BBC Radio 2 - Popular Music',
          type: 'radio' as const,
          category: 'music',
          subcategory: 'pop',
          logoUrl: 'https://via.placeholder.com/100?text=BBC2',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=BBC+Radio+2',
          streamUrl: 'https://stream.bbc.co.uk/radio2',
          country: 'UK',
          language: 'en',
          contentRating: 'G' as const,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentListeners: 3200,
          totalListeners: 120000,
        },
        {
          name: 'NPR News',
          description: 'National Public Radio News',
          type: 'radio' as const,
          category: 'news',
          subcategory: 'news',
          logoUrl: 'https://via.placeholder.com/100?text=NPR',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=NPR',
          streamUrl: 'https://stream.npr.org/news',
          country: 'USA',
          language: 'en',
          contentRating: 'G' as const,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentListeners: 1800,
          totalListeners: 65000,
        },
        {
          name: 'Spotify Radio',
          description: 'Spotify Music Streaming',
          type: 'stream' as const,
          category: 'music',
          subcategory: 'streaming',
          logoUrl: 'https://via.placeholder.com/100?text=Spotify',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=Spotify',
          streamUrl: 'https://stream.spotify.com/radio',
          country: 'Global',
          language: 'en',
          contentRating: 'G' as const,
          isAdultContent: false,
          accessLevel: 'members' as const,
          isActive: true,
          isLive: false,
          currentListeners: 0,
          totalListeners: 500000,
        },
        {
          name: 'Apple Music',
          description: 'Apple Music Streaming',
          type: 'stream' as const,
          category: 'music',
          subcategory: 'streaming',
          logoUrl: 'https://via.placeholder.com/100?text=Apple',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=Apple+Music',
          streamUrl: 'https://stream.apple.com/music',
          country: 'Global',
          language: 'en',
          contentRating: 'G' as const,
          isAdultContent: false,
          accessLevel: 'members' as const,
          isActive: true,
          isLive: false,
          currentListeners: 0,
          totalListeners: 450000,
        },
        {
          name: 'SiriusXM',
          description: 'SiriusXM Satellite Radio',
          type: 'radio' as const,
          category: 'music',
          subcategory: 'satellite',
          logoUrl: 'https://via.placeholder.com/100?text=SiriusXM',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=SiriusXM',
          streamUrl: 'https://stream.siriusxm.com/live',
          country: 'USA',
          language: 'en',
          contentRating: 'PG' as const,
          isAdultContent: false,
          accessLevel: 'members' as const,
          isActive: true,
          isLive: true,
          currentListeners: 1500,
          totalListeners: 55000,
        },
        {
          name: 'iHeartRadio',
          description: 'iHeartRadio Music',
          type: 'radio' as const,
          category: 'music',
          subcategory: 'pop',
          logoUrl: 'https://via.placeholder.com/100?text=iHeart',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=iHeartRadio',
          streamUrl: 'https://stream.iheartradio.com/live',
          country: 'USA',
          language: 'en',
          contentRating: 'G' as const,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentListeners: 4200,
          totalListeners: 150000,
        },
        {
          name: 'Jazz FM',
          description: 'Jazz Music Station',
          type: 'radio' as const,
          category: 'music',
          subcategory: 'jazz',
          logoUrl: 'https://via.placeholder.com/100?text=Jazz',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=Jazz+FM',
          streamUrl: 'https://stream.jazzfm.com/live',
          country: 'UK',
          language: 'en',
          contentRating: 'G' as const,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentListeners: 800,
          totalListeners: 28000,
        },
        {
          name: 'Classical Radio',
          description: 'Classical Music Station',
          type: 'radio' as const,
          category: 'music',
          subcategory: 'classical',
          logoUrl: 'https://via.placeholder.com/100?text=Classical',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=Classical',
          streamUrl: 'https://stream.classicalradio.com/live',
          country: 'Global',
          language: 'en',
          contentRating: 'G' as const,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentListeners: 650,
          totalListeners: 22000,
        },
        {
          name: 'Talk Radio',
          description: 'Talk Radio News and Discussion',
          type: 'radio' as const,
          category: 'news',
          subcategory: 'talk',
          logoUrl: 'https://via.placeholder.com/100?text=Talk',
          bannerUrl: 'https://via.placeholder.com/1920x1080?text=Talk+Radio',
          streamUrl: 'https://stream.talkradio.com/live',
          country: 'USA',
          language: 'en',
          contentRating: 'PG' as const,
          isAdultContent: false,
          accessLevel: 'public' as const,
          isActive: true,
          isLive: true,
          currentListeners: 1200,
          totalListeners: 42000,
        },
      ];

      let created = 0;
      for (const station of stationsData) {
        try {
          await db.insert(broadcastRadioChannels).values(station);
          created++;
        } catch (err) {
          console.error(`Failed to insert ${station.name}:`, err);
        }
      }

      return { success: true, created, message: `Created ${created} radio stations` };
    } catch (err) {
      console.error('Seeding error:', err);
      return { success: false, created: 0, error: String(err) };
    }
  }),

  /**
   * Get count of seeded data
   */
  getStats: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return { channels: 0, stations: 0, error: 'Database unavailable' };

      const channels = await db.query.iptvChannels.findMany();
      const stations = await db.query.broadcastRadioChannels.findMany();

      return {
        channels: channels.length,
        stations: stations.length,
        success: true,
      };
    } catch (err) {
      console.error('Stats error:', err);
      return { channels: 0, stations: 0, error: String(err) };
    }
  }),
});

export default streamingDataSeedRouter;
