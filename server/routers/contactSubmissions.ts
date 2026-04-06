import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contactSubmissions } from "../../drizzle/schema";
import { eq, desc, and, like, or } from "drizzle-orm";

export const contactSubmissionsRouter = router({
  /**
   * Submit a contact form (public)
   */
  submit: publicProcedure
    .input(z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      phone: z.string().max(20).optional(),
      subject: z.string().max(200).optional(),
      message: z.string().min(10).max(5000),
      source: z.string().default("landing_page"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(contactSubmissions).values({
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        subject: input.subject || null,
        message: input.message,
        source: input.source,
        status: "new",
        createdAt: new Date(),
      });

      return {
        success: true,
        message: "Thank you for your message. We'll get back to you soon!",
        id: result.insertId,
      };
    }),

  /**
   * Get all contact submissions (admin only)
   */
  getAll: protectedProcedure
    .input(z.object({
      status: z.enum(["new", "read", "replied", "archived"]).optional(),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { submissions: [], total: 0 };

      let query = db.select().from(contactSubmissions);

      const conditions = [];

      if (input?.status) {
        conditions.push(eq(contactSubmissions.status, input.status));
      }

      if (input?.search) {
        const searchTerm = `%${input.search}%`;
        conditions.push(
          or(
            like(contactSubmissions.name, searchTerm),
            like(contactSubmissions.email, searchTerm),
            like(contactSubmissions.subject, searchTerm),
            like(contactSubmissions.message, searchTerm)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      const submissions = await query
        .orderBy(desc(contactSubmissions.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);

      // Get total count
      const countQuery = db.select().from(contactSubmissions);
      let countQueryWithConditions = countQuery;
      if (conditions.length > 0) {
        countQueryWithConditions = countQuery.where(and(...conditions)) as typeof countQuery;
      }
      const countResult = await countQueryWithConditions;

      return {
        submissions,
        total: countResult.length,
      };
    }),

  /**
   * Get a single submission by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(contactSubmissions)
        .where(eq(contactSubmissions.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Mark submission as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(contactSubmissions)
        .set({ status: "read" })
        .where(eq(contactSubmissions.id, input.id));

      return { success: true, message: "Marked as read" };
    }),

  /**
   * Mark submission as replied
   */
  markAsReplied: protectedProcedure
    .input(z.object({
      id: z.number(),
      repliedAt: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(contactSubmissions)
        .set({
          status: "replied",
          repliedAt: input.repliedAt || new Date(),
        })
        .where(eq(contactSubmissions.id, input.id));

      return { success: true, message: "Marked as replied" };
    }),

  /**
   * Archive a submission
   */
  archive: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(contactSubmissions)
        .set({ status: "archived" })
        .where(eq(contactSubmissions.id, input.id));

      return { success: true, message: "Archived" };
    }),

  /**
   * Delete a submission
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .delete(contactSubmissions)
        .where(eq(contactSubmissions.id, input.id));

      return { success: true, message: "Deleted" };
    }),

  /**
   * Get statistics
   */
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, new: 0, read: 0, replied: 0, archived: 0 };

    const all = await db.select().from(contactSubmissions);

    return {
      total: all.length,
      new: all.filter((s) => s.status === "new").length,
      read: all.filter((s) => s.status === "read").length,
      replied: all.filter((s) => s.status === "replied").length,
      archived: all.filter((s) => s.status === "archived").length,
    };
  }),
});
