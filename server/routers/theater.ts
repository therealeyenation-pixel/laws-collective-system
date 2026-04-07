import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { theaterChannels } from "../../drizzle/schema";
import { eq, like, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const theaterRouter = router({
  // Get all channels with optional filtering
  listChannels: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        let query = db.select().from(theaterChannels).where(eq(theaterChannels.userId, ctx.user.id));

        if (input.category) {
          query = query.where(eq(theaterChannels.category, input.category));
        }

        if (input.search) {
          query = query.where(like(theaterChannels.name, `%${input.search}%`));
        }

        const channels = await query
          .orderBy(desc(theaterChannels.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return channels;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list channels",
        });
      }
    }),

  // Get single channel by ID
  getChannel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const channel = await db
          .select()
          .from(theaterChannels)
          .where(eq(theaterChannels.id, input.id));

        if (!channel.length || channel[0].userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Channel not found",
          });
        }

        return channel[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get channel",
        });
      }
    }),

  // Create new channel
  createChannel: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string(),
        streamUrl: z.string().url(),
        logoUrl: z.string().url().optional(),
        epgUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const newChannel = await db.insert(theaterChannels).values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          category: input.category,
          streamUrl: input.streamUrl,
          logoUrl: input.logoUrl,
          epgUrl: input.epgUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return newChannel;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create channel",
        });
      }
    }),

  // Update channel
  updateChannel: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        streamUrl: z.string().url().optional(),
        logoUrl: z.string().url().optional(),
        epgUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const channel = await db
          .select()
          .from(theaterChannels)
          .where(eq(theaterChannels.id, input.id));

        if (!channel.length || channel[0].userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Channel not found",
          });
        }

        const updated = await db
          .update(theaterChannels)
          .set({
            name: input.name || channel[0].name,
            description: input.description !== undefined ? input.description : channel[0].description,
            category: input.category || channel[0].category,
            streamUrl: input.streamUrl || channel[0].streamUrl,
            logoUrl: input.logoUrl !== undefined ? input.logoUrl : channel[0].logoUrl,
            epgUrl: input.epgUrl !== undefined ? input.epgUrl : channel[0].epgUrl,
            updatedAt: new Date(),
          })
          .where(eq(theaterChannels.id, input.id));

        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update channel",
        });
      }
    }),

  // Delete channel
  deleteChannel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const channel = await db
          .select()
          .from(theaterChannels)
          .where(eq(theaterChannels.id, input.id));

        if (!channel.length || channel[0].userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Channel not found",
          });
        }

        await db.delete(theaterChannels).where(eq(theaterChannels.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete channel",
        });
      }
    }),

  // Get categories
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    try {
      const channels = await db
        .select({ category: theaterChannels.category })
        .from(theaterChannels)
        .where(eq(theaterChannels.userId, ctx.user.id));

      const categories = [...new Set(channels.map((c) => c.category))];
      return categories;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get categories",
      });
    }
  }),
});
