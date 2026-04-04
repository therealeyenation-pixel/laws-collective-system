import { publicProcedure, router } from "../_core/trpc";
import mysql from "mysql2/promise";

export const verifyStreamUrlsRouter = router({
  verifyAllChannels: publicProcedure.query(async () => {
    try {
      const conn = await mysql.createConnection(process.env.DATABASE_URL || "");
      
      const [channels] = await conn.execute(
        `SELECT id, name, category, streamUrl FROM iptv_channels WHERE streamUrl IS NOT NULL AND streamUrl != "" ORDER BY id`
      ) as any;

      const results = [];
      
      for (const channel of channels) {
        try {
          const urlObj = new URL(channel.streamUrl);
          const protocol = urlObj.protocol === "https:" ? "HTTPS" : "HTTP";
          
          let streamType = "UNKNOWN";
          if (channel.streamUrl.includes(".m3u8")) streamType = "HLS";
          else if (channel.streamUrl.includes(".mpd")) streamType = "DASH";
          else if (channel.streamUrl.includes("rtmp")) streamType = "RTMP";
          else if (channel.streamUrl.includes("youtube")) streamType = "YouTube";
          
          let estimatedBitrates = "480p@1Mbps, 720p@3Mbps, 1080p@5Mbps";
          if (channel.category === "Sports" || channel.category === "Premium") {
            estimatedBitrates = "720p@3Mbps, 1080p@5Mbps, 4K@15Mbps";
          } else if (channel.category === "News") {
            estimatedBitrates = "360p@0.5Mbps, 480p@1Mbps, 720p@3Mbps";
          }
          
          results.push({
            id: channel.id,
            name: channel.name,
            category: channel.category,
            urlStatus: "valid",
            protocol: protocol,
            streamType: streamType,
            estimatedBitrates: estimatedBitrates
          });
        } catch (error) {
          results.push({
            id: channel.id,
            name: channel.name,
            category: channel.category,
            urlStatus: "error",
            protocol: "UNKNOWN",
            streamType: "UNKNOWN",
            estimatedBitrates: "N/A"
          });
        }
      }
      
      await conn.end();
      
      return {
        success: true,
        totalChannels: channels.length,
        verifiedChannels: results.filter(r => r.urlStatus === "valid").length,
        results: results
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        totalChannels: 0,
        verifiedChannels: 0,
        results: []
      };
    }
  }),

  getChannelsByCategory: publicProcedure.query(async () => {
    try {
      const conn = await mysql.createConnection(process.env.DATABASE_URL || "");
      
      const [channels] = await conn.execute(
        `SELECT category, COUNT(*) as count FROM iptv_channels GROUP BY category ORDER BY count DESC`
      ) as any;

      await conn.end();
      
      return {
        success: true,
        categories: channels
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        categories: []
      };
    }
  })
});
