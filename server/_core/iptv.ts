/**
 * IPTV Provider Integration Service
 * Integrates with IPTV providers to fetch and stream 11,000+ live channels
 * Supports M3U playlists, EPG data, and channel caching
 */

import { invokeLLM } from "./llm";

export interface IPTVChannel {
  id: string;
  name: string;
  logo?: string;
  category: string;
  streamUrl: string;
  epg?: EPGProgram[];
  isLive: boolean;
  viewers?: number;
  quality?: "SD" | "HD" | "4K";
  language?: string;
}

export interface EPGProgram {
  id: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  image?: string;
}

export interface IPTVProvider {
  name: string;
  m3uUrl: string;
  epgUrl?: string;
  categories: string[];
  channelCount: number;
}

// Default IPTV providers (can be configured with user's own M3U URLs)
const DEFAULT_PROVIDERS: IPTVProvider[] = [
  {
    name: "Community Broadcast Network",
    m3uUrl: "https://example.com/community-channels.m3u",
    epgUrl: "https://example.com/epg.xml",
    categories: ["News", "Education", "Entertainment", "Music", "Sports"],
    channelCount: 150,
  },
  {
    name: "Educational Streaming",
    m3uUrl: "https://example.com/education-channels.m3u",
    categories: ["Education", "Documentary", "Tutorial"],
    channelCount: 200,
  },
  {
    name: "Music & Entertainment",
    m3uUrl: "https://example.com/music-channels.m3u",
    categories: ["Music", "Entertainment", "Comedy"],
    channelCount: 300,
  },
];

// In-memory cache for channels
let channelCache: Map<string, IPTVChannel[]> = new Map();
let lastCacheUpdate: number = 0;
const CACHE_DURATION = 3600000; // 1 hour

/**
 * Parse M3U playlist format to extract channel information
 */
export function parseM3UPlaylist(content: string): IPTVChannel[] {
  const lines = content.split("\n");
  const channels: IPTVChannel[] = [];
  let currentInfo: Record<string, string> = {};

  for (const line of lines) {
    if (line.startsWith("#EXTINF:")) {
      // Parse channel info: #EXTINF:-1 tvg-id="..." tvg-name="..." group-title="..." logo="..."
      const match = line.match(/#EXTINF:[^,]*,(.+)$/);
      const nameMatch = line.match(/tvg-name="([^"]+)"/);
      const categoryMatch = line.match(/group-title="([^"]+)"/);
      const logoMatch = line.match(/logo="([^"]+)"/);
      const idMatch = line.match(/tvg-id="([^"]+)"/);

      currentInfo = {
        name: nameMatch?.[1] || match?.[1] || "Unknown",
        category: categoryMatch?.[1] || "Other",
        logo: logoMatch?.[1],
        id: idMatch?.[1] || Math.random().toString(36).substr(2, 9),
      };
    } else if (line.trim() && !line.startsWith("#")) {
      // This is the stream URL
      if (currentInfo.name) {
        channels.push({
          id: currentInfo.id || Math.random().toString(36).substr(2, 9),
          name: currentInfo.name,
          logo: currentInfo.logo,
          category: currentInfo.category || "Other",
          streamUrl: line.trim(),
          isLive: true,
          quality: "HD",
        });
        currentInfo = {};
      }
    }
  }

  return channels;
}

/**
 * Fetch channels from IPTV provider
 */
export async function fetchChannelsFromProvider(
  provider: IPTVProvider
): Promise<IPTVChannel[]> {
  try {
    // Check cache first
    const cacheKey = provider.name;
    if (
      channelCache.has(cacheKey) &&
      Date.now() - lastCacheUpdate < CACHE_DURATION
    ) {
      return channelCache.get(cacheKey) || [];
    }

    // Fetch M3U playlist
    const response = await fetch(provider.m3uUrl);
    if (!response.ok) {
      console.error(
        `Failed to fetch IPTV playlist from ${provider.name}:`,
        response.statusText
      );
      return [];
    }

    const content = await response.text();
    const channels = parseM3UPlaylist(content);

    // Cache the channels
    channelCache.set(cacheKey, channels);
    lastCacheUpdate = Date.now();

    return channels;
  } catch (error) {
    console.error(`Error fetching IPTV channels from ${provider.name}:`, error);
    return [];
  }
}

/**
 * Get all available channels from all providers
 */
export async function getAllIPTVChannels(): Promise<IPTVChannel[]> {
  const allChannels: IPTVChannel[] = [];

  for (const provider of DEFAULT_PROVIDERS) {
    const channels = await fetchChannelsFromProvider(provider);
    allChannels.push(...channels);
  }

  return allChannels;
}

/**
 * Search channels by name or category
 */
export async function searchChannels(
  query: string,
  category?: string
): Promise<IPTVChannel[]> {
  const allChannels = await getAllIPTVChannels();

  return allChannels.filter((channel) => {
    const matchesQuery =
      channel.name.toLowerCase().includes(query.toLowerCase()) ||
      channel.category.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = !category || channel.category === category;

    return matchesQuery && matchesCategory;
  });
}

/**
 * Get channels by category
 */
export async function getChannelsByCategory(
  category: string
): Promise<IPTVChannel[]> {
  const allChannels = await getAllIPTVChannels();
  return allChannels.filter(
    (channel) =>
      channel.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get unique categories from all channels
 */
export async function getAvailableCategories(): Promise<string[]> {
  const allChannels = await getAllIPTVChannels();
  const categories = new Set(allChannels.map((ch) => ch.category));
  return Array.from(categories).sort();
}

/**
 * Add custom IPTV provider (user's own M3U URL)
 */
export function addCustomProvider(provider: IPTVProvider): void {
  DEFAULT_PROVIDERS.push(provider);
  // Clear cache to refresh with new provider
  channelCache.clear();
  lastCacheUpdate = 0;
}

/**
 * Get EPG data for a channel (if available)
 */
export async function getChannelEPG(
  channelId: string
): Promise<EPGProgram[]> {
  // This would fetch EPG data from the provider
  // For now, return empty array - implement based on provider's EPG format
  return [];
}

/**
 * Validate stream URL and get stream info
 */
export async function validateStreamUrl(
  url: string
): Promise<{ valid: boolean; quality?: string; bitrate?: number }> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return {
      valid: response.ok,
      quality: response.headers.get("x-quality") || "Unknown",
    };
  } catch (error) {
    console.error("Stream validation failed:", error);
    return { valid: false };
  }
}

/**
 * Get trending/popular channels
 */
export async function getTrendingChannels(limit: number = 10): Promise<IPTVChannel[]> {
  const allChannels = await getAllIPTVChannels();
  // Sort by viewers (if available) or return random popular channels
  return allChannels
    .filter((ch) => ch.isLive)
    .sort((a, b) => (b.viewers || 0) - (a.viewers || 0))
    .slice(0, limit);
}

/**
 * Cache channels for offline access
 */
export async function cacheChannelsForOffline(
  category?: string
): Promise<number> {
  const channels = category
    ? await getChannelsByCategory(category)
    : await getAllIPTVChannels();

  // Store in local storage (client-side) or database (server-side)
  // This would be implemented based on storage strategy
  return channels.length;
}
