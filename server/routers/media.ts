import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { mediaTracks, mediaPlaylists, playbackHistory } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const mediaRouter = router({
  // Create playlist
  createPlaylist: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const playlist = await db.insert(mediaPlaylists).values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
          trackCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { success: true, playlistId: playlist[0].insertId };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create playlist",
        });
      }
    }),

  // Get user playlists
  getPlaylists: protectedProcedure.query(async ({ ctx }) => {
    try {
      const playlists = await db
        .select()
        .from(mediaPlaylists)
        .where(eq(mediaPlaylists.userId, ctx.user.id))
        .orderBy(desc(mediaPlaylists.createdAt));

      return playlists;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch playlists",
      });
    }
  }),

  // Add track to playlist
  addTrack: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        title: z.string(),
        artist: z.string(),
        duration: z.number(),
        url: z.string().url(),
        type: z.enum(["music", "podcast", "audiobook"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify playlist ownership
        const playlist = await db
          .select()
          .from(mediaPlaylists)
          .where(
            and(
              eq(mediaPlaylists.id, input.playlistId),
              eq(mediaPlaylists.userId, ctx.user.id)
            )
          );

        if (!playlist.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Playlist not found",
          });
        }

        const track = await db.insert(mediaTracks).values({
          playlistId: input.playlistId,
          title: input.title,
          artist: input.artist,
          duration: input.duration,
          url: input.url,
          type: input.type,
          addedAt: new Date(),
        });

        // Update playlist track count
        await db
          .update(mediaPlaylists)
          .set({
            trackCount: playlist[0].trackCount + 1,
            updatedAt: new Date(),
          })
          .where(eq(mediaPlaylists.id, input.playlistId));

        return { success: true, trackId: track[0].insertId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add track",
        });
      }
    }),

  // Get playlist tracks
  getTracks: protectedProcedure
    .input(z.object({ playlistId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify playlist ownership
        const playlist = await db
          .select()
          .from(mediaPlaylists)
          .where(
            and(
              eq(mediaPlaylists.id, input.playlistId),
              eq(mediaPlaylists.userId, ctx.user.id)
            )
          );

        if (!playlist.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Playlist not found",
          });
        }

        const tracks = await db
          .select()
          .from(mediaTracks)
          .where(eq(mediaTracks.playlistId, input.playlistId))
          .orderBy(mediaTracks.addedAt);

        return tracks;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tracks",
        });
      }
    }),

  // Remove track from playlist
  removeTrack: protectedProcedure
    .input(z.object({ trackId: z.number(), playlistId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify playlist ownership
        const playlist = await db
          .select()
          .from(mediaPlaylists)
          .where(
            and(
              eq(mediaPlaylists.id, input.playlistId),
              eq(mediaPlaylists.userId, ctx.user.id)
            )
          );

        if (!playlist.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Playlist not found",
          });
        }

        await db.delete(mediaTracks).where(eq(mediaTracks.id, input.trackId));

        // Update playlist track count
        await db
          .update(mediaPlaylists)
          .set({
            trackCount: Math.max(0, playlist[0].trackCount - 1),
            updatedAt: new Date(),
          })
          .where(eq(mediaPlaylists.id, input.playlistId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove track",
        });
      }
    }),

  // Record playback history
  recordPlayback: protectedProcedure
    .input(
      z.object({
        trackId: z.number(),
        duration: z.number(),
        position: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await db.insert(playbackHistory).values({
          userId: ctx.user.id,
          trackId: input.trackId,
          duration: input.duration,
          position: input.position,
          playedAt: new Date(),
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record playback",
        });
      }
    }),

  // Get playback history
  getPlaybackHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      try {
        const history = await db
          .select()
          .from(playbackHistory)
          .where(eq(playbackHistory.userId, ctx.user.id))
          .orderBy(desc(playbackHistory.playedAt))
          .limit(input.limit);

        return history;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch playback history",
        });
      }
    }),

  // Get recently played
  getRecentlyPlayed: protectedProcedure.query(async ({ ctx }) => {
    try {
      const recentTracks = await db
        .select()
        .from(playbackHistory)
        .where(eq(playbackHistory.userId, ctx.user.id))
        .orderBy(desc(playbackHistory.playedAt))
        .limit(10);

      return recentTracks;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch recently played",
      });
    }
  }),

  // Delete playlist
  deletePlaylist: protectedProcedure
    .input(z.object({ playlistId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const playlist = await db
          .select()
          .from(mediaPlaylists)
          .where(
            and(
              eq(mediaPlaylists.id, input.playlistId),
              eq(mediaPlaylists.userId, ctx.user.id)
            )
          );

        if (!playlist.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Playlist not found",
          });
        }

        // Delete all tracks in playlist
        await db
          .delete(mediaTracks)
          .where(eq(mediaTracks.playlistId, input.playlistId));

        // Delete playlist
        await db
          .delete(mediaPlaylists)
          .where(eq(mediaPlaylists.id, input.playlistId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete playlist",
        });
      }
    }),
});
