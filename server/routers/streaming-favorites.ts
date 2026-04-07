import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { userFavorites, userPlaybackHistory, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const streamingFavoritesRouter = router({
  // Add to favorites
  addFavorite: protectedProcedure
    .input(
      z.object({
        contentId: z.number(),
        contentType: z.enum(["tv", "radio", "music", "podcast"]),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await db.insert(userFavorites).values({
          userId: ctx.user.id,
          contentId: input.contentId,
          contentType: input.contentType,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          addedAt: new Date(),
        });
        return { success: true, id: result.insertId };
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
        return favorite.length > 0;
      } catch (error) {
        console.error("Error checking favorite:", error);
        return false;
      }
    }),

  // Get user favorites
  getFavorites: protectedProcedure
    .input(
      z.object({
        contentType: z.enum(["tv", "radio", "music", "podcast"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let query = db
          .select()
          .from(userFavorites)
          .where(eq(userFavorites.userId, ctx.user.id));

        if (input.contentType) {
          query = query.where(eq(userFavorites.contentType, input.contentType));
        }

        const favorites = await query
          .limit(input.limit)
          .offset(input.offset)
          .orderBy((t) => t.addedAt);

        return favorites;
      } catch (error) {
        console.error("Error getting favorites:", error);
        return [];
      }
    }),

  // Record playback
  recordPlayback: protectedProcedure
    .input(
      z.object({
        contentId: z.number(),
        contentType: z.enum(["tv", "radio", "music", "podcast"]),
        duration: z.number(),
        position: z.number(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await db.insert(userPlaybackHistory).values({
          userId: ctx.user.id,
          contentId: input.contentId,
          contentType: input.contentType,
          duration: input.duration,
          position: input.position,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          playedAt: new Date(),
        });
        return { success: true, id: result.insertId };
      } catch (error) {
        console.error("Error recording playback:", error);
        throw new Error("Failed to record playback");
      }
    }),

  // Get playback history
  getHistory: protectedProcedure
    .input(
      z.object({
        contentType: z.enum(["tv", "radio", "music", "podcast"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let query = db
          .select()
          .from(userPlaybackHistory)
          .where(eq(userPlaybackHistory.userId, ctx.user.id));

        if (input.contentType) {
          query = query.where(eq(userPlaybackHistory.contentType, input.contentType));
        }

        const history = await query
          .limit(input.limit)
          .offset(input.offset)
          .orderBy((t) => t.playedAt);

        return history;
      } catch (error) {
        console.error("Error getting history:", error);
        return [];
      }
    }),

  // Get recently played
  getRecentlyPlayed: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      try {
        const recently = await db
          .select()
          .from(userPlaybackHistory)
          .where(eq(userPlaybackHistory.userId, ctx.user.id))
          .limit(input.limit)
          .orderBy((t) => t.playedAt);

        return recently;
      } catch (error) {
        console.error("Error getting recently played:", error);
        return [];
      }
    }),

  // Get personalized recommendations based on history
  getRecommendations: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        contentType: z.enum(["tv", "radio", "music", "podcast"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get user's favorite categories from history
        const userHistory = await db
          .select()
          .from(userPlaybackHistory)
          .where(eq(userPlaybackHistory.userId, ctx.user.id))
          .limit(100);

        // Extract content types from history
        const preferredTypes = userHistory
          .map((h) => h.contentType)
          .filter((v, i, a) => a.indexOf(v) === i);

        // Return recommendations based on preferences
        // In a real implementation, this would query a recommendations engine
        return {
          recommendations: [],
          basedOn: preferredTypes,
        };
      } catch (error) {
        console.error("Error getting recommendations:", error);
        return { recommendations: [], basedOn: [] };
      }
    }),
});
