/**
 * Channel Auto-Discovery Service
 * Discovers new theater and music channels from Manus built-in APIs and YouTube
 * Runs weekly to auto-add new channels with religious content filtering
 */

import { db } from "../db";
import { streamingContent } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Religious content keywords to filter out
const RELIGIOUS_KEYWORDS = [
  "prayer", "gospel", "worship", "church", "bible", "christian", "islamic", 
  "jewish", "hindu", "buddhist", "spiritual", "faith", "sermon", "religious",
  "mosque", "synagogue", "temple", "dharma", "sutra", "quran", "torah",
  "meditation", "mantra", "bhakti", "kirtan", "chant", "hymn", "praise"
];

interface DiscoveredChannel {
  title: string;
  description?: string;
  category: "music" | "theater";
  subcategory?: string;
  genre?: string;
  streamUrl?: string;
  logoUrl?: string;
  thumbnailUrl?: string;
  dataSource: "manus_api" | "youtube";
  externalId: string;
  language?: string;
  metadata?: Record<string, any>;
}

/**
 * Check if content contains religious keywords
 */
function isReligiousContent(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return RELIGIOUS_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Fetch music channels from Manus built-in Data API
 */
async function discoverMusicChannelsFromManus(): Promise<DiscoveredChannel[]> {
  try {
    const response = await fetch(
      `${process.env.BUILT_IN_FORGE_API_URL}/data_api/search`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "music channels streaming radio",
          limit: 50,
          type: "entertainment",
        }),
      }
    );

    if (!response.ok) {
      console.error("[Channel Discovery] Manus API error:", response.statusText);
      return [];
    }

    const data = await response.json() as any;
    const channels: DiscoveredChannel[] = [];

    if (data.results && Array.isArray(data.results)) {
      for (const item of data.results) {
        // Filter out religious content
        if (isReligiousContent(item.title) || isReligiousContent(item.description)) {
          continue;
        }

        channels.push({
          title: item.title,
          description: item.description,
          category: "music",
          subcategory: item.genre || "general",
          genre: item.genre,
          streamUrl: item.url,
          logoUrl: item.logo,
          dataSource: "manus_api",
          externalId: `manus_${item.id}`,
          language: item.language || "en",
          metadata: {
            source: "manus_data_api",
            fetchedAt: new Date().toISOString(),
          },
        });
      }
    }

    console.log(`[Channel Discovery] Found ${channels.length} music channels from Manus API`);
    return channels;
  } catch (error) {
    console.error("[Channel Discovery] Error fetching from Manus API:", error);
    return [];
  }
}

/**
 * Fetch theater and music channels from YouTube Data API
 */
async function discoverChannelsFromYouTube(): Promise<DiscoveredChannel[]> {
  try {
    // Note: This would require YOUTUBE_API_KEY in environment
    // For now, we'll use a placeholder that can be configured
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn("[Channel Discovery] YOUTUBE_API_KEY not configured, skipping YouTube discovery");
      return [];
    }

    const channels: DiscoveredChannel[] = [];
    
    // Search for music channels
    const musicResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `q=music+streaming+channel&type=channel&part=snippet&maxResults=50&key=${apiKey}`
    );

    if (musicResponse.ok) {
      const musicData = await musicResponse.json() as any;
      if (musicData.items) {
        for (const item of musicData.items) {
          const title = item.snippet.title;
          const description = item.snippet.description;

          // Filter out religious content
          if (isReligiousContent(title) || isReligiousContent(description)) {
            continue;
          }

          channels.push({
            title,
            description,
            category: "music",
            subcategory: "youtube_channel",
            streamUrl: `https://www.youtube.com/channel/${item.id.channelId}`,
            logoUrl: item.snippet.thumbnails?.high?.url,
            dataSource: "youtube",
            externalId: `youtube_${item.id.channelId}`,
            metadata: {
              channelId: item.id.channelId,
              publishedAt: item.snippet.publishedAt,
            },
          });
        }
      }
    }

    // Search for theater channels
    const theaterResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `q=theater+live+performance&type=channel&part=snippet&maxResults=50&key=${apiKey}`
    );

    if (theaterResponse.ok) {
      const theaterData = await theaterResponse.json() as any;
      if (theaterData.items) {
        for (const item of theaterData.items) {
          const title = item.snippet.title;
          const description = item.snippet.description;

          // Filter out religious content
          if (isReligiousContent(title) || isReligiousContent(description)) {
            continue;
          }

          channels.push({
            title,
            description,
            category: "theater",
            subcategory: "youtube_channel",
            streamUrl: `https://www.youtube.com/channel/${item.id.channelId}`,
            logoUrl: item.snippet.thumbnails?.high?.url,
            dataSource: "youtube",
            externalId: `youtube_theater_${item.id.channelId}`,
            metadata: {
              channelId: item.id.channelId,
              publishedAt: item.snippet.publishedAt,
            },
          });
        }
      }
    }

    console.log(`[Channel Discovery] Found ${channels.length} channels from YouTube`);
    return channels;
  } catch (error) {
    console.error("[Channel Discovery] Error fetching from YouTube:", error);
    return [];
  }
}

/**
 * Main discovery function - combines all sources and saves to database
 */
export async function discoverAndSyncChannels(): Promise<{ added: number; updated: number; total: number }> {
  try {
    console.log("[Channel Discovery] Starting weekly sync...");

    // Fetch from all sources
    const [manusChannels, youtubeChannels] = await Promise.all([
      discoverMusicChannelsFromManus(),
      discoverChannelsFromYouTube(),
    ]);

    const allChannels = [...manusChannels, ...youtubeChannels];
    console.log(`[Channel Discovery] Total channels discovered: ${allChannels.length}`);

    let added = 0;
    let updated = 0;

    // Process each channel
    for (const channel of allChannels) {
      try {
        // Check if channel already exists by externalId
        const existing = await db
          .select()
          .from(streamingContent)
          .where(
            and(
              eq(streamingContent.externalId, channel.externalId),
              eq(streamingContent.dataSource, channel.dataSource)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Update existing channel
          await db
            .update(streamingContent)
            .set({
              title: channel.title,
              description: channel.description,
              logoUrl: channel.logoUrl,
              thumbnailUrl: channel.thumbnailUrl,
              streamUrl: channel.streamUrl,
              metadata: channel.metadata,
              updatedAt: new Date(),
            })
            .where(eq(streamingContent.id, existing[0].id));
          updated++;
        } else {
          // Insert new channel
          await db.insert(streamingContent).values({
            contentType: channel.category === "music" ? "music_track" : "tv_channel",
            title: channel.title,
            description: channel.description,
            category: channel.category,
            subcategory: channel.subcategory,
            genre: channel.genre,
            streamUrl: channel.streamUrl,
            logoUrl: channel.logoUrl,
            thumbnailUrl: channel.thumbnailUrl,
            language: channel.language,
            dataSource: channel.dataSource,
            externalId: channel.externalId,
            status: "active",
            isVerified: false,
            metadata: channel.metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          added++;
        }
      } catch (error) {
        console.error(`[Channel Discovery] Error processing channel ${channel.externalId}:`, error);
      }
    }

    console.log(`[Channel Discovery] Sync complete: ${added} added, ${updated} updated`);
    return { added, updated, total: allChannels.length };
  } catch (error) {
    console.error("[Channel Discovery] Sync failed:", error);
    throw error;
  }
}

/**
 * Get statistics about discovered channels
 */
export async function getDiscoveryStats() {
  try {
    const total = await db.select().from(streamingContent);
    const bySource = {} as Record<string, number>;
    const byCategory = {} as Record<string, number>;

    for (const item of total) {
      bySource[item.dataSource || "unknown"] = (bySource[item.dataSource || "unknown"] || 0) + 1;
      byCategory[item.category || "unknown"] = (byCategory[item.category || "unknown"] || 0) + 1;
    }

    return {
      totalChannels: total.length,
      bySource,
      byCategory,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("[Channel Discovery] Error getting stats:", error);
    throw error;
  }
}
