import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import mysql from "mysql2/promise";

export const m3uImportEnhancedRouter = router({
  importM3UPlaylist: protectedProcedure
    .input(z.object({
      m3uContent: z.string(),
      sourceUrl: z.string().optional(),
      categoryOverride: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }

        const conn = await mysql.createConnection(process.env.DATABASE_URL || "");
        
        const lines = input.m3uContent.split("\n");
        const channels = [];
        let currentChannel: any = null;

        for (const line of lines) {
          const trimmed = line.trim();
          
          if (trimmed.startsWith("#EXTINF:")) {
            const match = trimmed.match(/#EXTINF:.*,(.+)$/);
            if (match) {
              if (currentChannel) channels.push(currentChannel);
              currentChannel = {
                name: match[1].trim(),
                category: input.categoryOverride || "Imported",
                streamUrl: null
              };
            }
          } else if (trimmed && !trimmed.startsWith("#") && currentChannel) {
            currentChannel.streamUrl = trimmed;
            channels.push(currentChannel);
            currentChannel = null;
          }
        }

        let insertedCount = 0;
        for (const channel of channels) {
          if (channel.streamUrl) {
            try {
              await conn.execute(
                `INSERT INTO iptv_channels (name, category, streamUrl, sourceUrl) VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE streamUrl = VALUES(streamUrl)`,
                [channel.name, channel.category, channel.streamUrl, input.sourceUrl || null]
              );
              insertedCount++;
            } catch (e) {
              // Continue on duplicate or error
            }
          }
        }

        await conn.end();

        return {
          success: true,
          imported: insertedCount,
          total: channels.length,
          message: `Successfully imported ${insertedCount} channels from M3U playlist`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          imported: 0,
          total: 0
        };
      }
    }),

  validateM3UContent: publicProcedure
    .input(z.object({
      m3uContent: z.string()
    }))
    .query(({ input }) => {
      try {
        const lines = input.m3uContent.split("\n");
        let channelCount = 0;
        let urlCount = 0;

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("#EXTINF:")) channelCount++;
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("://")) urlCount++;
        }

        return {
          success: true,
          isValid: channelCount > 0 && urlCount > 0,
          channelCount: channelCount,
          urlCount: urlCount,
          message: `Found ${channelCount} channels and ${urlCount} URLs`
        };
      } catch (error) {
        return {
          success: false,
          isValid: false,
          channelCount: 0,
          urlCount: 0,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }),

  getImportStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new Error("User not authenticated");
      }

      const conn = await mysql.createConnection(process.env.DATABASE_URL || "");
      
      const [stats] = await conn.execute(
        `SELECT category, COUNT(*) as count FROM iptv_channels GROUP BY category ORDER BY count DESC`
      ) as any;

      const [totalChannels] = await conn.execute(
        `SELECT COUNT(*) as total FROM iptv_channels`
      ) as any;

      const [withUrls] = await conn.execute(
        `SELECT COUNT(*) as count FROM iptv_channels WHERE streamUrl IS NOT NULL AND streamUrl != ""`
      ) as any;

      await conn.end();

      return {
        success: true,
        totalChannels: totalChannels[0].total,
        channelsWithUrls: withUrls[0].count,
        byCategory: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        totalChannels: 0,
        channelsWithUrls: 0,
        byCategory: []
      };
    }
  })
});
