import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { businessEntities } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const businessEntitiesRouter = router({
  // Get all business entities
  getAll: publicProcedure.query(async () => {
    try {
      const entities = await db
        .select()
        .from(businessEntities)
        .orderBy(desc(businessEntities.createdAt));

      return entities;
    } catch (error) {
      console.error("Error fetching business entities:", error);
      throw new Error("Failed to fetch business entities");
    }
  }),

  // Get single business entity by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const entity = await db
          .select()
          .from(businessEntities)
          .where(eq(businessEntities.id, input.id))
          .limit(1);

        if (!entity.length) {
          throw new Error("Business entity not found");
        }

        return entity[0];
      } catch (error) {
        console.error("Error fetching business entity:", error);
        throw new Error("Failed to fetch business entity");
      }
    }),

  // Get entities by owner (protected)
  getByOwner: protectedProcedure.query(async ({ ctx }) => {
    try {
      const entities = await db
        .select()
        .from(businessEntities)
        .where(eq(businessEntities.ownerId, ctx.user!.id))
        .orderBy(desc(businessEntities.createdAt));

      return entities;
    } catch (error) {
      console.error("Error fetching user's business entities:", error);
      throw new Error("Failed to fetch your business entities");
    }
  }),

  // Create new business entity (protected)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        type: z.enum(["LLC", "Corporation", "Partnership", "Sole Proprietorship", "Trust", "Other"]),
        description: z.string().optional(),
        website: z.string().url().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
        taxId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.insert(businessEntities).values({
          name: input.name,
          type: input.type,
          description: input.description || null,
          website: input.website || null,
          phone: input.phone || null,
          email: input.email || null,
          address: input.address || null,
          city: input.city || null,
          state: input.state || null,
          zipCode: input.zipCode || null,
          country: input.country || null,
          taxId: input.taxId || null,
          ownerId: ctx.user!.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {
          success: true,
          id: result.insertId,
          message: "Business entity created successfully",
        };
      } catch (error) {
        console.error("Error creating business entity:", error);
        throw new Error("Failed to create business entity");
      }
    }),

  // Update business entity (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        website: z.string().url().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
        taxId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify ownership
        const entity = await db
          .select()
          .from(businessEntities)
          .where(eq(businessEntities.id, input.id))
          .limit(1);

        if (!entity.length || entity[0].ownerId !== ctx.user!.id) {
          throw new Error("Unauthorized");
        }

        await db
          .update(businessEntities)
          .set({
            name: input.name,
            description: input.description,
            website: input.website,
            phone: input.phone,
            email: input.email,
            address: input.address,
            city: input.city,
            state: input.state,
            zipCode: input.zipCode,
            country: input.country,
            taxId: input.taxId,
            updatedAt: new Date(),
          })
          .where(eq(businessEntities.id, input.id));

        return { success: true, message: "Business entity updated" };
      } catch (error) {
        console.error("Error updating business entity:", error);
        throw new Error("Failed to update business entity");
      }
    }),

  // Delete business entity (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify ownership
        const entity = await db
          .select()
          .from(businessEntities)
          .where(eq(businessEntities.id, input.id))
          .limit(1);

        if (!entity.length || entity[0].ownerId !== ctx.user!.id) {
          throw new Error("Unauthorized");
        }

        await db.delete(businessEntities).where(eq(businessEntities.id, input.id));

        return { success: true, message: "Business entity deleted" };
      } catch (error) {
        console.error("Error deleting business entity:", error);
        throw new Error("Failed to delete business entity");
      }
    }),

  // Get statistics
  getStats: publicProcedure.query(async () => {
    try {
      const entities = await db.select().from(businessEntities);

      const stats = {
        total: entities.length,
        byType: entities.reduce(
          (acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        recent: entities.slice(0, 5),
      };

      return stats;
    } catch (error) {
      console.error("Error fetching business entity stats:", error);
      throw new Error("Failed to fetch statistics");
    }
  }),
});
