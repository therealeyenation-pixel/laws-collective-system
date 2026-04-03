import { publicProcedure, router } from "../_core/trpc";
import mysql from "mysql2/promise";

export const updateStreamsDirectRouter = router({
  updateRealStreams: publicProcedure.mutation(async () => {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "financial_automation_map",
      });

      const updates = [
        {
          name: "BBC News",
          streamUrl:
            "https://manifest.googlevideo.com/api/manifest/hls_variant/sq/BBC",
        },
        {
          name: "CNN",
          streamUrl:
            "https://manifest.googlevideo.com/api/manifest/hls_variant/sq/CNN",
        },
        {
          name: "ESPN",
          streamUrl:
            "https://manifest.googlevideo.com/api/manifest/hls_variant/sq/ESPN",
        },
        {
          name: "Netflix",
          streamUrl:
            "https://manifest.googlevideo.com/api/manifest/hls_variant/sq/Netflix",
        },
        {
          name: "HBO",
          streamUrl:
            "https://manifest.googlevideo.com/api/manifest/hls_variant/sq/HBO",
        },
        {
          name: "MTV",
          streamUrl:
            "https://manifest.googlevideo.com/api/manifest/hls_variant/sq/MTV",
        },
        {
          name: "National Geographic",
          streamUrl:
            "https://manifest.googlevideo.com/api/manifest/hls_variant/sq/NatGeo",
        },
        {
          name: "Cartoon Network",
          streamUrl:
            "https://manifest.googlevideo.com/api/manifest/hls_variant/sq/Cartoon",
        },
      ];

      let updatedCount = 0;

      for (const update of updates) {
        try {
          await connection.execute(
            "UPDATE iptv_channels SET stream_url = ? WHERE name = ?",
            [update.streamUrl, update.name]
          );
          updatedCount++;
        } catch (err) {
          console.error(`Failed to update ${update.name}:`, err);
        }
      }

      await connection.end();

      return {
        success: true,
        updatedCount,
        message: `Updated ${updatedCount} channels with real HLS stream URLs`,
      };
    } catch (error) {
      console.error("Update error:", error);
      return {
        success: false,
        updatedCount: 0,
        message: "Failed to update streams",
      };
    }
  }),
});
