import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { broadcastChannels, broadcastEpisodes, liveBroadcasts, users } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

// Seed data aligned with actual schema
const SEED_CHANNELS = [
  {
    userId: 1, // Will be set by owner
    name: "L.A.W.S. Radio",
    slug: "laws-radio",
    description: "Community education and empowerment through the L.A.W.S. framework",
    category: "education" as const,
    language: "en",
    status: "active" as const,
    coverImageUrl: "/images/channels/laws-radio-cover.jpg",
    bannerImageUrl: "/images/channels/laws-radio-banner.jpg",
    websiteUrl: "https://lawscollective.org",
    broadcastFormat: "live_radio" as const,
    isMonetized: false,
    monetizationTier: "free" as const,
  },
  {
    userId: 1,
    name: "Financial Wisdom",
    slug: "financial-wisdom",
    description: "Money management and wealth building strategies",
    category: "finance" as const,
    language: "en",
    status: "active" as const,
    coverImageUrl: "/images/channels/financial-wisdom-cover.jpg",
    bannerImageUrl: "/images/channels/financial-wisdom-banner.jpg",
    websiteUrl: "https://lawscollective.org/finance",
    broadcastFormat: "podcast" as const,
    isMonetized: false,
    monetizationTier: "free" as const,
  },
  {
    userId: 1,
    name: "Legal Matters",
    slug: "legal-matters",
    description: "Legal rights, compliance, and justice education",
    category: "education" as const,
    language: "en",
    status: "active" as const,
    coverImageUrl: "/images/channels/legal-matters-cover.jpg",
    bannerImageUrl: "/images/channels/legal-matters-banner.jpg",
    websiteUrl: "https://lawscollective.org/legal",
    broadcastFormat: "podcast" as const,
    isMonetized: false,
    monetizationTier: "free" as const,
  },
  {
    userId: 1,
    name: "Business Builders",
    slug: "business-builders",
    description: "Entrepreneurship and business strategy for growth",
    category: "business" as const,
    language: "en",
    status: "active" as const,
    coverImageUrl: "/images/channels/business-builders-cover.jpg",
    bannerImageUrl: "/images/channels/business-builders-banner.jpg",
    websiteUrl: "https://lawscollective.org/business",
    broadcastFormat: "podcast" as const,
    isMonetized: false,
    monetizationTier: "free" as const,
  },
  {
    userId: 1,
    name: "Community Voices",
    slug: "community-voices",
    description: "Local stories and community news",
    category: "news" as const,
    language: "en",
    status: "active" as const,
    coverImageUrl: "/images/channels/community-voices-cover.jpg",
    bannerImageUrl: "/images/channels/community-voices-banner.jpg",
    websiteUrl: "https://lawscollective.org/community",
    broadcastFormat: "live_radio" as const,
    isMonetized: false,
    monetizationTier: "free" as const,
  },
  {
    userId: 1,
    name: "Health & Wellness",
    slug: "health-wellness",
    description: "Health, wellness, and lifestyle education",
    category: "health" as const,
    language: "en",
    status: "active" as const,
    coverImageUrl: "/images/channels/health-wellness-cover.jpg",
    bannerImageUrl: "/images/channels/health-wellness-banner.jpg",
    websiteUrl: "https://lawscollective.org/health",
    broadcastFormat: "podcast" as const,
    isMonetized: false,
    monetizationTier: "free" as const,
  },
  {
    userId: 1,
    name: "Tech Talk",
    slug: "tech-talk",
    description: "Technology and digital innovation",
    category: "technology" as const,
    language: "en",
    status: "active" as const,
    coverImageUrl: "/images/channels/tech-talk-cover.jpg",
    bannerImageUrl: "/images/channels/tech-talk-banner.jpg",
    websiteUrl: "https://lawscollective.org/tech",
    broadcastFormat: "podcast" as const,
    isMonetized: false,
    monetizationTier: "free" as const,
  },
  {
    userId: 1,
    name: "Arts & Culture",
    slug: "arts-culture",
    description: "Music, art, and cultural expression",
    category: "culture" as const,
    language: "en",
    status: "active" as const,
    coverImageUrl: "/images/channels/arts-culture-cover.jpg",
    bannerImageUrl: "/images/channels/arts-culture-banner.jpg",
    websiteUrl: "https://lawscollective.org/arts",
    broadcastFormat: "live_radio" as const,
    isMonetized: false,
    monetizationTier: "free" as const,
  },
  {
    userId: 1,
    name: "Youth Empowerment",
    slug: "youth-empowerment",
    description: "Programs and resources for young people",
    category: "education" as const,
    language: "en",
    status: "active" as const,
    coverImageUrl: "/images/channels/youth-empowerment-cover.jpg",
    bannerImageUrl: "/images/channels/youth-empowerment-banner.jpg",
    websiteUrl: "https://lawscollective.org/youth",
    broadcastFormat: "podcast" as const,
    isMonetized: false,
    monetizationTier: "free" as const,
  },
  {
    userId: 1,
    name: "Environmental Action",
    slug: "environmental-action",
    description: "Sustainability and environmental justice",
    category: "other" as const,
    language: "en",
    status: "active" as const,
    coverImageUrl: "/images/channels/environmental-action-cover.jpg",
    bannerImageUrl: "/images/channels/environmental-action-banner.jpg",
    websiteUrl: "https://lawscollective.org/environment",
    broadcastFormat: "podcast" as const,
    isMonetized: false,
    monetizationTier: "free" as const,
  },
];

const SEED_EPISODES = [
  {
    channelId: 1,
    title: "Building Generational Wealth",
    slug: "building-generational-wealth",
    description: "Learn strategies for long-term financial security and family wealth",
    audioUrl: "https://example.com/audio/ep1.mp3",
    audioFormat: "mp3",
    audioDuration: 2700, // 45 minutes in seconds
    episodeNumber: 1,
    seasonNumber: 1,
    status: "published" as const,
    publishedAt: new Date(),
    viewCount: 125,
    downloadCount: 45,
    likeCount: 28,
  },
  {
    channelId: 3,
    title: "Understanding Your Rights",
    slug: "understanding-your-rights",
    description: "Know your legal rights and protections",
    audioUrl: "https://example.com/audio/ep2.mp3",
    audioFormat: "mp3",
    audioDuration: 2280, // 38 minutes
    episodeNumber: 1,
    seasonNumber: 1,
    status: "published" as const,
    publishedAt: new Date(),
    viewCount: 98,
    downloadCount: 32,
    likeCount: 22,
  },
  {
    channelId: 4,
    title: "Starting Your First Business",
    slug: "starting-first-business",
    description: "Essential steps for new entrepreneurs",
    audioUrl: "https://example.com/audio/ep3.mp3",
    audioFormat: "mp3",
    audioDuration: 3120, // 52 minutes
    episodeNumber: 1,
    seasonNumber: 1,
    status: "published" as const,
    publishedAt: new Date(),
    viewCount: 156,
    downloadCount: 67,
    likeCount: 41,
  },
  {
    channelId: 2,
    title: "Financial Planning 101",
    slug: "financial-planning-101",
    description: "Create a budget and financial plan",
    audioUrl: "https://example.com/audio/ep4.mp3",
    audioFormat: "mp3",
    audioDuration: 2460, // 41 minutes
    episodeNumber: 1,
    seasonNumber: 1,
    status: "published" as const,
    publishedAt: new Date(),
    viewCount: 134,
    downloadCount: 52,
    likeCount: 35,
  },
  {
    channelId: 5,
    title: "Community Investment",
    slug: "community-investment",
    description: "How to invest in your community",
    audioUrl: "https://example.com/audio/ep5.mp3",
    audioFormat: "mp3",
    audioDuration: 2100, // 35 minutes
    episodeNumber: 1,
    seasonNumber: 1,
    status: "published" as const,
    publishedAt: new Date(),
    viewCount: 87,
    downloadCount: 28,
    likeCount: 18,
  },
  {
    channelId: 6,
    title: "Mental Health Matters",
    slug: "mental-health-matters",
    description: "Wellness strategies for daily life",
    audioUrl: "https://example.com/audio/ep6.mp3",
    audioFormat: "mp3",
    audioDuration: 2580, // 43 minutes
    episodeNumber: 1,
    seasonNumber: 1,
    status: "published" as const,
    publishedAt: new Date(),
    viewCount: 112,
    downloadCount: 41,
    likeCount: 29,
  },
  {
    channelId: 7,
    title: "Digital Transformation",
    slug: "digital-transformation",
    description: "Technology for business growth",
    audioUrl: "https://example.com/audio/ep7.mp3",
    audioFormat: "mp3",
    audioDuration: 2880, // 48 minutes
    episodeNumber: 1,
    seasonNumber: 1,
    status: "published" as const,
    publishedAt: new Date(),
    viewCount: 143,
    downloadCount: 58,
    likeCount: 37,
  },
  {
    channelId: 8,
    title: "Cultural Heritage",
    slug: "cultural-heritage",
    description: "Celebrating our diverse cultures",
    audioUrl: "https://example.com/audio/ep8.mp3",
    audioFormat: "mp3",
    audioDuration: 3000, // 50 minutes
    episodeNumber: 1,
    seasonNumber: 1,
    status: "published" as const,
    publishedAt: new Date(),
    viewCount: 167,
    downloadCount: 71,
    likeCount: 48,
  },
  {
    channelId: 9,
    title: "Youth Leadership",
    slug: "youth-leadership",
    description: "Developing leaders of tomorrow",
    audioUrl: "https://example.com/audio/ep9.mp3",
    audioFormat: "mp3",
    audioDuration: 2400, // 40 minutes
    episodeNumber: 1,
    seasonNumber: 1,
    status: "published" as const,
    publishedAt: new Date(),
    viewCount: 121,
    downloadCount: 44,
    likeCount: 31,
  },
  {
    channelId: 10,
    title: "Green Living",
    slug: "green-living",
    description: "Sustainable practices for everyone",
    audioUrl: "https://example.com/audio/ep10.mp3",
    audioFormat: "mp3",
    audioDuration: 2220, // 37 minutes
    episodeNumber: 1,
    seasonNumber: 1,
    status: "published" as const,
    publishedAt: new Date(),
    viewCount: 95,
    downloadCount: 36,
    likeCount: 24,
  },
];

const SEED_LIVE_BROADCASTS = [
  {
    channelId: 2,
    title: "Monday Money Talk",
    description: "Weekly financial discussion and Q&A",
    scheduledStartTime: new Date(Date.now() + 86400000), // Tomorrow
    status: "scheduled" as const,
    isRecorded: true,
    currentViewers: 0,
    totalViewers: 0,
    allowChat: true,
    allowComments: true,
    isMonetized: false,
  },
  {
    channelId: 3,
    title: "Legal Q&A Session",
    description: "Ask legal questions live with experts",
    scheduledStartTime: new Date(Date.now() + 172800000), // In 2 days
    status: "scheduled" as const,
    isRecorded: true,
    currentViewers: 0,
    totalViewers: 0,
    allowChat: true,
    allowComments: true,
    isMonetized: false,
  },
  {
    channelId: 4,
    title: "Business Breakfast",
    description: "Morning business insights and networking",
    scheduledStartTime: new Date(Date.now() + 259200000), // In 3 days
    status: "scheduled" as const,
    isRecorded: true,
    currentViewers: 0,
    totalViewers: 0,
    allowChat: true,
    allowComments: true,
    isMonetized: false,
  },
  {
    channelId: 5,
    title: "Community Connect",
    description: "Live community discussion and updates",
    scheduledStartTime: new Date(Date.now() + 345600000), // In 4 days
    status: "scheduled" as const,
    isRecorded: true,
    currentViewers: 0,
    totalViewers: 0,
    allowChat: true,
    allowComments: true,
    isMonetized: false,
  },
  {
    channelId: 6,
    title: "Wellness Wednesday",
    description: "Health and wellness tips with experts",
    scheduledStartTime: new Date(Date.now() + 432000000), // In 5 days
    status: "scheduled" as const,
    isRecorded: true,
    currentViewers: 0,
    totalViewers: 0,
    allowChat: true,
    allowComments: true,
    isMonetized: false,
  },
];

export const broadcastRouter = router({
  // Channels
  channels: {
    getAll: publicProcedure.query(async () => {
      try {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(broadcastChannels).orderBy(desc(broadcastChannels.createdAt));
      } catch (error) {
        console.error("Error fetching channels:", error);
        return [];
      }
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) return null;
          const result = await db
            .select()
            .from(broadcastChannels)
            .where(eq(broadcastChannels.id, input.id))
            .limit(1);
          return result[0] || null;
        } catch (error) {
          console.error("Error fetching channel:", error);
          return null;
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          category: z.enum(["education", "business", "finance", "health", "entertainment", "news", "technology", "culture", "other"]),
          language: z.string().default("en"),
          status: z.enum(["draft", "active", "paused", "archived"]).default("draft"),
          coverImageUrl: z.string().optional(),
          bannerImageUrl: z.string().optional(),
          websiteUrl: z.string().optional(),
          broadcastFormat: z.enum(["podcast", "live_radio", "hybrid"]),
          isMonetized: z.boolean().default(false),
          monetizationTier: z.enum(["free", "basic", "premium"]).default("free"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          const result = await db
            .insert(broadcastChannels)
            .values({
              ...input,
              userId: ctx.user.id,
            })
            .returning();
          return result[0];
        } catch (error) {
          console.error("Error creating channel:", error);
          throw error;
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["draft", "active", "paused", "archived"]).optional(),
          coverImageUrl: z.string().optional(),
          bannerImageUrl: z.string().optional(),
          websiteUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          const { id, ...updates } = input;
          const result = await db
            .update(broadcastChannels)
            .set(updates)
            .where(and(eq(broadcastChannels.id, id), eq(broadcastChannels.userId, ctx.user.id)))
            .returning();
          return result[0] || null;
        } catch (error) {
          console.error("Error updating channel:", error);
          throw error;
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          await db
            .delete(broadcastChannels)
            .where(and(eq(broadcastChannels.id, input.id), eq(broadcastChannels.userId, ctx.user.id)));
          return { success: true };
        } catch (error) {
          console.error("Error deleting channel:", error);
          throw error;
        }
      }),
  },

  // Episodes
  episodes: {
    getAll: publicProcedure
      .input(z.object({ channelId: z.number().optional(), limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) return [];
          let query = db.select().from(broadcastEpisodes);
          if (input?.channelId) {
            query = query.where(eq(broadcastEpisodes.channelId, input.channelId));
          }
          return await query.orderBy(desc(broadcastEpisodes.publishedAt)).limit(input?.limit || 50);
        } catch (error) {
          console.error("Error fetching episodes:", error);
          return [];
        }
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) return null;
          const result = await db
            .select()
            .from(broadcastEpisodes)
            .where(eq(broadcastEpisodes.id, input.id))
            .limit(1);
          return result[0] || null;
        } catch (error) {
          console.error("Error fetching episode:", error);
          return null;
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          channelId: z.number(),
          title: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          audioUrl: z.string(),
          audioFormat: z.string().default("mp3"),
          audioDuration: z.number(),
          episodeNumber: z.number().optional(),
          seasonNumber: z.number().default(1),
          status: z.enum(["draft", "scheduled", "published", "archived"]).default("draft"),
          publishedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          const result = await db.insert(broadcastEpisodes).values(input).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating episode:", error);
          throw error;
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
          publishedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          const { id, ...updates } = input;
          const result = await db.update(broadcastEpisodes).set(updates).where(eq(broadcastEpisodes.id, id)).returning();
          return result[0] || null;
        } catch (error) {
          console.error("Error updating episode:", error);
          throw error;
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          await db.delete(broadcastEpisodes).where(eq(broadcastEpisodes.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("Error deleting episode:", error);
          throw error;
        }
      }),
  },

  // Live Broadcasts
  liveBroadcasts: {
    getAll: publicProcedure
      .input(z.object({ channelId: z.number().optional(), status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) return [];
          let query = db.select().from(liveBroadcasts);
          if (input?.channelId) {
            query = query.where(eq(liveBroadcasts.channelId, input.channelId));
          }
          if (input?.status) {
            query = query.where(eq(liveBroadcasts.status, input.status as any));
          }
          return await query.orderBy(desc(liveBroadcasts.scheduledStartTime));
        } catch (error) {
          console.error("Error fetching live broadcasts:", error);
          return [];
        }
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) return null;
          const result = await db
            .select()
            .from(liveBroadcasts)
            .where(eq(liveBroadcasts.id, input.id))
            .limit(1);
          return result[0] || null;
        } catch (error) {
          console.error("Error fetching live broadcast:", error);
          return null;
        }
      }),

    create: protectedProcedure
      .input(
        z.object({
          channelId: z.number(),
          title: z.string().min(1),
          description: z.string().optional(),
          streamUrl: z.string().optional(),
          streamKey: z.string().optional(),
          rtmpUrl: z.string().optional(),
          scheduledStartTime: z.date(),
          scheduledEndTime: z.date().optional(),
          status: z.enum(["scheduled", "live", "ended", "cancelled"]).default("scheduled"),
          isRecorded: z.boolean().default(true),
          allowChat: z.boolean().default(true),
          allowComments: z.boolean().default(true),
          isMonetized: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          const result = await db.insert(liveBroadcasts).values(input).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating live broadcast:", error);
          throw error;
        }
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["scheduled", "live", "ended", "cancelled"]).optional(),
          currentViewers: z.number().optional(),
          peakViewers: z.number().optional(),
          totalViewers: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          const { id, ...updates } = input;
          const result = await db.update(liveBroadcasts).set(updates).where(eq(liveBroadcasts.id, id)).returning();
          return result[0] || null;
        } catch (error) {
          console.error("Error updating live broadcast:", error);
          throw error;
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          await db.delete(liveBroadcasts).where(eq(liveBroadcasts.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("Error deleting live broadcast:", error);
          throw error;
        }
      }),
  },

  // Seeding
  seed: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get owner user ID for seeding
      const ownerId = ctx.user.id;

      // Seed channels with owner ID
      const seedChannelsWithOwner = SEED_CHANNELS.map((ch) => ({
        ...ch,
        userId: ownerId,
      }));

      for (const channel of seedChannelsWithOwner) {
        await db.insert(broadcastChannels).values(channel).onConflictDoNothing();
      }

      // Seed episodes
      for (const episode of SEED_EPISODES) {
        await db.insert(broadcastEpisodes).values(episode).onConflictDoNothing();
      }

      // Seed live broadcasts
      for (const broadcast of SEED_LIVE_BROADCASTS) {
        await db.insert(liveBroadcasts).values(broadcast).onConflictDoNothing();
      }

      return {
        success: true,
        message: "Broadcast data seeded successfully",
        counts: {
          channels: SEED_CHANNELS.length,
          episodes: SEED_EPISODES.length,
          liveBroadcasts: SEED_LIVE_BROADCASTS.length,
        },
      };
    } catch (error) {
      console.error("Error seeding broadcasts:", error);
      throw error;
    }
  }),
});
