/**
 * Playlists Router
 * CRUD operations for user-created streaming playlists (channels + stations)
 */
import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { streamingPlaylists, playlistItems } from "../../drizzle/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const playlistsRouter = router({
  // Get all playlists for the current user
  getMyPlaylists: protectedProcedure.query(async ({ ctx }) => {
    try {
      const playlists = await db
        .select()
        .from(streamingPlaylists)
        .where(eq(streamingPlaylists.userId, ctx.user.id))
        .orderBy(desc(streamingPlaylists.updatedAt));
      return playlists;
    } catch (error) {
      console.error("Error getting playlists:", error);
      return [];
    }
  }),

  // Get a single playlist with its items
  getPlaylist: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [playlist] = await db
        .select()
        .from(streamingPlaylists)
        .where(
          and(
            eq(streamingPlaylists.id, input.id),
            eq(streamingPlaylists.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!playlist) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      const items = await db
        .select()
        .from(playlistItems)
        .where(eq(playlistItems.playlistId, input.id))
        .orderBy(asc(playlistItems.position));

      return { ...playlist, items };
    }),

  // Create a new playlist
  createPlaylist: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [result] = await db.insert(streamingPlaylists).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description || null,
        playlistType: "custom",
        itemCount: 0,
      });

      return { id: result.insertId, name: input.name };
    }),

  // Update playlist metadata
  updatePlaylist: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [playlist] = await db
        .select()
        .from(streamingPlaylists)
        .where(
          and(
            eq(streamingPlaylists.id, input.id),
            eq(streamingPlaylists.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!playlist) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      const updates: any = {};
      if (input.name) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;

      await db
        .update(streamingPlaylists)
        .set(updates)
        .where(eq(streamingPlaylists.id, input.id));

      return { success: true };
    }),

  // Delete a playlist
  deletePlaylist: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [playlist] = await db
        .select()
        .from(streamingPlaylists)
        .where(
          and(
            eq(streamingPlaylists.id, input.id),
            eq(streamingPlaylists.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!playlist) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      // Cascade delete handles items
      await db.delete(streamingPlaylists).where(eq(streamingPlaylists.id, input.id));

      return { success: true };
    }),

  // Add item to playlist
  addItem: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        contentId: z.number(),
        contentType: z.enum(["channel", "station"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const [playlist] = await db
        .select()
        .from(streamingPlaylists)
        .where(
          and(
            eq(streamingPlaylists.id, input.playlistId),
            eq(streamingPlaylists.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!playlist) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      // Get next position
      const items = await db
        .select()
        .from(playlistItems)
        .where(eq(playlistItems.playlistId, input.playlistId));

      const nextPosition = items.length;

      await db.insert(playlistItems).values({
        playlistId: input.playlistId,
        contentId: input.contentId,
        contentType: input.contentType,
        position: nextPosition,
        addedBy: ctx.user.id,
      });

      // Update item count
      await db
        .update(streamingPlaylists)
        .set({ itemCount: nextPosition + 1 })
        .where(eq(streamingPlaylists.id, input.playlistId));

      return { success: true, position: nextPosition };
    }),

  // Remove item from playlist
  removeItem: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        itemId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const [playlist] = await db
        .select()
        .from(streamingPlaylists)
        .where(
          and(
            eq(streamingPlaylists.id, input.playlistId),
            eq(streamingPlaylists.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!playlist) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      await db.delete(playlistItems).where(eq(playlistItems.id, input.itemId));

      // Recount items
      const remaining = await db
        .select()
        .from(playlistItems)
        .where(eq(playlistItems.playlistId, input.playlistId));

      await db
        .update(streamingPlaylists)
        .set({ itemCount: remaining.length })
        .where(eq(streamingPlaylists.id, input.playlistId));

      return { success: true };
    }),

  // Reorder items in playlist
  reorderItems: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        itemIds: z.array(z.number()), // ordered array of item IDs
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const [playlist] = await db
        .select()
        .from(streamingPlaylists)
        .where(
          and(
            eq(streamingPlaylists.id, input.playlistId),
            eq(streamingPlaylists.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!playlist) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playlist not found" });
      }

      // Update positions
      for (let i = 0; i < input.itemIds.length; i++) {
        await db
          .update(playlistItems)
          .set({ position: i })
          .where(eq(playlistItems.id, input.itemIds[i]));
      }

      return { success: true };
    }),
});
