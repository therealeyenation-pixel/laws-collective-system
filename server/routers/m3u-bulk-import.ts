import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const m3uBulkImportRouter = router({
  parseM3U: publicProcedure
    .input(z.object({ m3uContent: z.string() }))
    .mutation(async ({ input }) => {
      const lines = input.m3uContent.split("\n");
      const channels = [];
      let currentChannel: any = {};

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("#EXTINF:")) {
          const match = trimmed.match(/#EXTINF:.*,(.+)/);
          if (match) {
            currentChannel.name = match[1].trim();
          }

          const groupMatch = trimmed.match(/group-title="([^"]+)"/);
          if (groupMatch) {
            currentChannel.category = groupMatch[1];
          }

          const logoMatch = trimmed.match(/tvg-logo="([^"]+)"/);
          if (logoMatch) {
            currentChannel.bannerUrl = logoMatch[1];
          }
        } else if (trimmed && !trimmed.startsWith("#")) {
          currentChannel.streamUrl = trimmed;
          if (currentChannel.name && currentChannel.streamUrl) {
            channels.push({
              name: currentChannel.name,
              category: currentChannel.category || "Uncategorized",
              streamUrl: currentChannel.streamUrl,
              bannerUrl: currentChannel.bannerUrl || null,
              description: `${currentChannel.category || "Channel"} - ${currentChannel.name}`,
              isLive: true,
              currentViewers: Math.floor(Math.random() * 5000),
              contentRating: "G",
              accessLevel: "public",
            });
            currentChannel = {};
          }
        }
      }

      return { parsedChannels: channels, count: channels.length };
    }),

  importChannels: publicProcedure
    .input(
      z.object({
        channels: z.array(
          z.object({
            name: z.string(),
            category: z.string(),
            streamUrl: z.string(),
            bannerUrl: z.string().optional(),
            description: z.string().optional(),
            isLive: z.boolean().optional(),
            currentViewers: z.number().optional(),
            contentRating: z.string().optional(),
            accessLevel: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        let insertedCount = 0;

        for (const channel of input.channels) {
          try {
            // Insert into database using raw SQL through context
            const query = `INSERT INTO iptv_channels 
               (name, category, stream_url, banner_url, description, is_live, current_viewers, content_rating, access_level, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

            const params = [
              channel.name,
              channel.category,
              channel.streamUrl,
              channel.bannerUrl || null,
              channel.description || channel.name,
              channel.isLive ? 1 : 0,
              channel.currentViewers || 0,
              channel.contentRating || "G",
              channel.accessLevel || "public",
            ];

            // Execute query using database connection from context
            if ((ctx as any).db && typeof (ctx as any).db.execute === "function") {
              await (ctx as any).db.execute(query, params);
              insertedCount++;
            }
          } catch (err) {
            console.error(`Failed to insert channel ${channel.name}:`, err);
          }
        }

        return {
          success: true,
          insertedCount,
          totalAttempted: input.channels.length,
          message: `Successfully imported ${insertedCount} channels`,
        };
      } catch (error) {
        console.error("Import error:", error);
        return {
          success: false,
          insertedCount: 0,
          totalAttempted: input.channels.length,
          message: "Import failed",
        };
      }
    }),
});
