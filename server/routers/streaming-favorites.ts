import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { userFavorites, userPlaybackHistory } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Map frontend content types to DB enum values
const CONTENT_TYPE_MAP: Record<string, "channel" | "station" | "track"> = {
  tv: "channel",
  radio: "station",
  music: "track",
  podcast: "track",
  channel: "channel",
  station: "station",
  track: "track",
};

function mapContentType(input: string): "channel" | "station" | "track" {
  return CONTENT_TYPE_MAP[input] || "channel";
}

export const streamingFavoritesRouter = router({
  // Add to favorites
  addFavorite: protectedProcedure
    .input(
      z.object({
        contentId: z.number(),
        contentType: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const dbType = mapContentType(input.contentType);
        // Use INSERT ... ON DUPLICATE KEY UPDATE to handle re-favoriting
        await db.execute(sql`
          INSERT INTO user_favorites (userId, contentId, contentType, isFavorite, addedAt)
          VALUES (${ctx.user.id}, ${input.contentId}, ${dbType}, true, NOW())
          ON DUPLICATE KEY UPDATE isFavorite = true, addedAt = NOW()
        `);
        return { success: true };
      } catch (error) {
        console.error("Error adding favorite:", error);
        throw new Error("Failed to add favorite");
      }
    }),

  // Remove from favorites
  removeFavorite: protectedProcedure
    .input(z.object({ contentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db
          .delete(userFavorites)
          .where(
            and(
              eq(userFavorites.userId, ctx.user.id),
              eq(userFavorites.contentId, input.contentId)
            )
          );
        return { success: true };
      } catch (error) {
        console.error("Error removing favorite:", error);
        throw new Error("Failed to remove favorite");
      }
    }),

  // Check if content is favorited
  isFavorited: protectedProcedure
    .input(z.object({ contentId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const favorite = await db
          .select()
          .from(userFavorites)
          .where(
            and(
              eq(userFavorites.userId, ctx.user.id),
              eq(userFavorites.contentId, input.contentId)
            )
          )
          .limit(1);
        return favorite.length > 0 && favorite[0].isFavorite;
      } catch (error) {
        console.error("Error checking favorite:", error);
        return false;
      }
    }),

  // Get user favorites (returns contentId list for client-side matching)
  getFavorites: protectedProcedure
    .input(
      z.object({
        contentType: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = [
          eq(userFavorites.userId, ctx.user.id),
          eq(userFavorites.isFavorite, true),
        ];

        if (input.contentType) {
          const dbType = mapContentType(input.contentType);
          conditions.push(eq(userFavorites.contentType, dbType));
        }

        const favorites = await db
          .select()
          .from(userFavorites)
          .where(and(...conditions))
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(desc(userFavorites.addedAt));

        return favorites;
      } catch (error) {
        console.error("Error getting favorites:", error);
        return [];
      }
    }),

  // Get favorite content IDs for a type (lightweight query for sorting)
  getFavoriteIds: protectedProcedure
    .input(z.object({ contentType: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const dbType = mapContentType(input.contentType);
        const favorites = await db
          .select({ contentId: userFavorites.contentId })
          .from(userFavorites)
          .where(
            and(
              eq(userFavorites.userId, ctx.user.id),
              eq(userFavorites.contentType, dbType),
              eq(userFavorites.isFavorite, true)
            )
          );
        return favorites.map((f) => f.contentId);
      } catch (error) {
        console.error("Error getting favorite IDs:", error);
        return [];
      }
    }),

  // Toggle favorite (add or remove in one call)
  toggleFavorite: protectedProcedure
    .input(
      z.object({
        contentId: z.number(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const dbType = mapContentType(input.contentType);
        // Check current state
        const existing = await db
          .select()
          .from(userFavorites)
          .where(
            and(
              eq(userFavorites.userId, ctx.user.id),
              eq(userFavorites.contentId, input.contentId)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Remove
          await db
            .delete(userFavorites)
            .where(
              and(
                eq(userFavorites.userId, ctx.user.id),
                eq(userFavorites.contentId, input.contentId)
              )
            );
          return { isFavorited: false };
        } else {
          // Add
          await db.insert(userFavorites).values({
            userId: ctx.user.id,
            contentId: input.contentId,
            contentType: dbType,
            isFavorite: true,
            addedAt: new Date(),
          });
          return { isFavorited: true };
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        throw new Error("Failed to toggle favorite");
      }
    }),

  // Record playback (upsert - update if same user+content exists)
  recordPlayback: protectedProcedure
    .input(
      z.object({
        contentId: z.number(),
        contentType: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const dbType = mapContentType(input.contentType);
        // Upsert: if already exists, update lastPlayedAt and increment count
        await db.execute(sql`
          INSERT INTO user_playback_history (userId, contentId, contentType, lastPlayedAt, totalPlayCount)
          VALUES (${ctx.user.id}, ${input.contentId}, ${dbType}, NOW(), 1)
          ON DUPLICATE KEY UPDATE lastPlayedAt = NOW(), totalPlayCount = totalPlayCount + 1
        `);
        return { success: true };
      } catch (error) {
        console.error("Error recording playback:", error);
        // Don't throw - playback recording is non-critical
        return { success: false };
      }
    }),

  // Get recently played (last N unique items)
  getRecentlyPlayed: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        contentType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = [eq(userPlaybackHistory.userId, ctx.user.id)];

        if (input.contentType) {
          const dbType = mapContentType(input.contentType);
          conditions.push(eq(userPlaybackHistory.contentType, dbType));
        }

        const history = await db
          .select()
          .from(userPlaybackHistory)
          .where(and(...conditions))
          .limit(input.limit)
          .orderBy(desc(userPlaybackHistory.lastPlayedAt));

        return history;
      } catch (error) {
        console.error("Error getting recently played:", error);
        return [];
      }
    }),

  // Get playback history
  getHistory: protectedProcedure
    .input(
      z.object({
        contentType: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = [eq(userPlaybackHistory.userId, ctx.user.id)];

        if (input.contentType) {
          const dbType = mapContentType(input.contentType);
          conditions.push(eq(userPlaybackHistory.contentType, dbType));
        }

        const history = await db
          .select()
          .from(userPlaybackHistory)
          .where(and(...conditions))
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(desc(userPlaybackHistory.lastPlayedAt));

        return history;
      } catch (error) {
        console.error("Error getting history:", error);
        return [];
      }
    }),
});
