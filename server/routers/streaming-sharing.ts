import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";

// In-memory share storage (in production, use database)
const sharedContent = new Map<string, {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail?: string;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  viewCount: number;
}>();

export const streamingSharingRouter = router({
  // Create a shareable link for content
  createShareLink: protectedProcedure
    .input(z.object({
      contentType: z.enum(["track", "playlist", "channel", "station"]),
      contentId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      thumbnail: z.string().optional(),
      expiresIn: z.number().optional() // milliseconds
    }))
    .mutation(({ input, ctx }) => {
      const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = input.expiresIn ? new Date(Date.now() + input.expiresIn) : undefined;

      sharedContent.set(shareId, {
        id: shareId,
        type: input.contentType,
        title: input.title,
        description: input.description || "",
        thumbnail: input.thumbnail,
        createdBy: ctx.user.id.toString(),
        createdAt: new Date(),
        expiresAt,
        viewCount: 0
      });

      return {
        shareId,
        shareUrl: `/shared/${shareId}`,
        expiresAt
      };
    }),

  // Get shared content details
  getSharedContent: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(({ input }) => {
      const content = sharedContent.get(input.shareId);

      if (!content) {
        return { error: "Shared content not found or has expired" };
      }

      if (content.expiresAt && content.expiresAt < new Date()) {
        sharedContent.delete(input.shareId);
        return { error: "Shared content has expired" };
      }

      // Increment view count
      content.viewCount++;

      return {
        id: content.id,
        type: content.type,
        title: content.title,
        description: content.description,
        thumbnail: content.thumbnail,
        createdAt: content.createdAt,
        viewCount: content.viewCount
      };
    }),

  // Get user's shared content
  getUserShares: protectedProcedure.query(({ ctx }) => {
    const userShares = Array.from(sharedContent.values())
      .filter(content => content.createdBy === ctx.user.id.toString())
      .map(content => ({
        id: content.id,
        type: content.type,
        title: content.title,
        description: content.description,
        shareUrl: `/shared/${content.id}`,
        createdAt: content.createdAt,
        expiresAt: content.expiresAt,
        viewCount: content.viewCount
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return userShares;
  }),

  // Delete a shared link
  deleteShare: protectedProcedure
    .input(z.object({ shareId: z.string() }))
    .mutation(({ input, ctx }) => {
      const content = sharedContent.get(input.shareId);

      if (!content) {
        return { error: "Shared content not found" };
      }

      if (content.createdBy !== ctx.user.id.toString()) {
        return { error: "Unauthorized" };
      }

      sharedContent.delete(input.shareId);
      return { success: true };
    }),

  // Get share statistics
  getShareStats: protectedProcedure
    .input(z.object({ shareId: z.string() }))
    .query(({ input, ctx }) => {
      const content = sharedContent.get(input.shareId);

      if (!content) {
        return { error: "Shared content not found" };
      }

      if (content.createdBy !== ctx.user.id.toString()) {
        return { error: "Unauthorized" };
      }

      return {
        shareId: content.id,
        title: content.title,
        type: content.type,
        viewCount: content.viewCount,
        createdAt: content.createdAt,
        expiresAt: content.expiresAt,
        shareUrl: `/shared/${content.id}`
      };
    }),

  // Generate social media preview
  generateSocialPreview: publicProcedure
    .input(z.object({
      contentType: z.enum(["track", "playlist", "channel", "station"]),
      title: z.string(),
      description: z.string().optional(),
      thumbnail: z.string().optional()
    }))
    .query(({ input }) => {
      const platforms = {
        twitter: {
          text: `Check out: ${input.title}${input.description ? ` - ${input.description}` : ""}`,
          maxLength: 280
        },
        facebook: {
          title: input.title,
          description: input.description || "Check out this amazing content!",
          image: input.thumbnail
        },
        linkedin: {
          title: input.title,
          description: input.description || "Shared via streaming platform",
          image: input.thumbnail
        }
      };

      return platforms;
    })
});
