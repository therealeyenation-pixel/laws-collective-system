import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { changelogEntries, changelogUserViews, appVersions } from "../../drizzle/schema";
import { eq, desc, and, gte, isNull, or } from "drizzle-orm";

// Current app version - update this when releasing new versions
const CURRENT_VERSION = "1.0.0";

export const changelogRouter = router({
  // Get the current app version
  getCurrentVersion: publicProcedure.query(() => {
    return { version: CURRENT_VERSION };
  }),

  // Get all published changelog entries
  getPublished: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).optional().default(20),
      sinceVersion: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      
      let query = db
        .select()
        .from(changelogEntries)
        .where(eq(changelogEntries.isPublished, true))
        .orderBy(desc(changelogEntries.releaseDate))
        .limit(input.limit);
      
      const entries = await query;
      return entries;
    }),

  // Get unread changelog entries for a user (for What's New popup)
  getUnread: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    
    // Get all published entries that the user hasn't dismissed or marked as "don't show again"
    const allPublished = await db
      .select()
      .from(changelogEntries)
      .where(eq(changelogEntries.isPublished, true))
      .orderBy(desc(changelogEntries.releaseDate));
    
    const userViews = await db
      .select()
      .from(changelogUserViews)
      .where(eq(changelogUserViews.userId, ctx.user.id));
    
    const viewedIds = new Set(userViews.filter(v => v.dismissed || v.dontShowAgain).map(v => v.changelogId));
    
    const unread = allPublished.filter(entry => !viewedIds.has(entry.id));
    
    return {
      entries: unread,
      hasUnread: unread.length > 0,
      unreadCount: unread.length,
    };
  }),

  // Mark a changelog entry as viewed
  markViewed: protectedProcedure
    .input(z.object({
      changelogId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Check if already exists
      const existing = await db
        .select()
        .from(changelogUserViews)
        .where(
          and(
            eq(changelogUserViews.userId, ctx.user.id),
            eq(changelogUserViews.changelogId, input.changelogId)
          )
        )
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(changelogUserViews).values({
          userId: ctx.user.id,
          changelogId: input.changelogId,
          viewedAt: new Date(),
          dismissed: false,
          dontShowAgain: false,
        });
      }
      
      return { success: true };
    }),

  // Dismiss a changelog entry (won't show in popup but can still see in changelog page)
  dismiss: protectedProcedure
    .input(z.object({
      changelogId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      const existing = await db
        .select()
        .from(changelogUserViews)
        .where(
          and(
            eq(changelogUserViews.userId, ctx.user.id),
            eq(changelogUserViews.changelogId, input.changelogId)
          )
        )
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(changelogUserViews).values({
          userId: ctx.user.id,
          changelogId: input.changelogId,
          viewedAt: new Date(),
          dismissed: true,
          dontShowAgain: false,
        });
      } else {
        await db
          .update(changelogUserViews)
          .set({ dismissed: true })
          .where(eq(changelogUserViews.id, existing[0].id));
      }
      
      return { success: true };
    }),

  // Dismiss all unread entries
  dismissAll: protectedProcedure.mutation(async ({ ctx }) => {
    const db = getDb();
    
    const allPublished = await db
      .select()
      .from(changelogEntries)
      .where(eq(changelogEntries.isPublished, true));
    
    for (const entry of allPublished) {
      const existing = await db
        .select()
        .from(changelogUserViews)
        .where(
          and(
            eq(changelogUserViews.userId, ctx.user.id),
            eq(changelogUserViews.changelogId, entry.id)
          )
        )
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(changelogUserViews).values({
          userId: ctx.user.id,
          changelogId: entry.id,
          viewedAt: new Date(),
          dismissed: true,
          dontShowAgain: false,
        });
      } else if (!existing[0].dismissed) {
        await db
          .update(changelogUserViews)
          .set({ dismissed: true })
          .where(eq(changelogUserViews.id, existing[0].id));
      }
    }
    
    return { success: true };
  }),

  // Set "don't show again" for What's New popup
  setDontShowAgain: protectedProcedure
    .input(z.object({
      dontShow: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Update all existing views
      const userViews = await db
        .select()
        .from(changelogUserViews)
        .where(eq(changelogUserViews.userId, ctx.user.id));
      
      for (const view of userViews) {
        await db
          .update(changelogUserViews)
          .set({ dontShowAgain: input.dontShow })
          .where(eq(changelogUserViews.id, view.id));
      }
      
      return { success: true };
    }),

  // Admin: Create a new changelog entry
  create: protectedProcedure
    .input(z.object({
      version: z.string().min(1).max(20),
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      changeType: z.enum(["feature", "improvement", "fix", "security", "breaking"]),
      category: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      isMajor: z.boolean().optional().default(false),
      isPublished: z.boolean().optional().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Check if user is admin/owner
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new Error("Only admins can create changelog entries");
      }
      
      const [result] = await db.insert(changelogEntries).values({
        version: input.version,
        title: input.title,
        description: input.description,
        changeType: input.changeType,
        category: input.category,
        highlights: input.highlights,
        isMajor: input.isMajor,
        isPublished: input.isPublished,
        createdBy: ctx.user.id,
        releaseDate: new Date(),
      });
      
      return { id: result.insertId, success: true };
    }),

  // Admin: Update a changelog entry
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      version: z.string().min(1).max(20).optional(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      changeType: z.enum(["feature", "improvement", "fix", "security", "breaking"]).optional(),
      category: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      isMajor: z.boolean().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new Error("Only admins can update changelog entries");
      }
      
      const { id, ...updateData } = input;
      
      await db
        .update(changelogEntries)
        .set(updateData)
        .where(eq(changelogEntries.id, id));
      
      return { success: true };
    }),

  // Admin: Delete a changelog entry
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new Error("Only admins can delete changelog entries");
      }
      
      // Delete user views first
      await db
        .delete(changelogUserViews)
        .where(eq(changelogUserViews.changelogId, input.id));
      
      // Delete the entry
      await db
        .delete(changelogEntries)
        .where(eq(changelogEntries.id, input.id));
      
      return { success: true };
    }),

  // Admin: Get all changelog entries (including unpublished)
  getAll: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new Error("Only admins can view all changelog entries");
      }
      
      const entries = await db
        .select()
        .from(changelogEntries)
        .orderBy(desc(changelogEntries.releaseDate))
        .limit(input.limit);
      
      return entries;
    }),

  // Admin: Publish a changelog entry
  publish: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new Error("Only admins can publish changelog entries");
      }
      
      await db
        .update(changelogEntries)
        .set({ isPublished: true, releaseDate: new Date() })
        .where(eq(changelogEntries.id, input.id));
      
      return { success: true };
    }),

  // Get app version history
  getVersionHistory: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).optional().default(10),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const versions = await db
        .select()
        .from(appVersions)
        .orderBy(desc(appVersions.releaseDate))
        .limit(input.limit);
      
      return versions;
    }),

  // Admin: Create a new app version
  createVersion: protectedProcedure
    .input(z.object({
      version: z.string().min(1).max(20),
      buildNumber: z.number().optional(),
      releaseNotes: z.string().optional(),
      isStable: z.boolean().optional().default(true),
      downloadUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new Error("Only admins can create app versions");
      }
      
      const [result] = await db.insert(appVersions).values({
        version: input.version,
        buildNumber: input.buildNumber,
        releaseNotes: input.releaseNotes,
        isStable: input.isStable,
        downloadUrl: input.downloadUrl,
        releaseDate: new Date(),
      });
      
      return { id: result.insertId, success: true };
    }),
});
