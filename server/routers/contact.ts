import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contactSubmissions, notifications } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export const contactRouter = router({
  /**
   * Submit a contact form (public - no auth required)
   */
  submit: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      email: z.string().email().max(255),
      phone: z.string().max(20).optional(),
      subject: z.string().max(200).optional(),
      message: z.string().min(10).max(5000),
      source: z.string().max(50).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(contactSubmissions).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        subject: input.subject || "General Inquiry",
        message: input.message,
        source: input.source || "landing_page",
      });

      // Notify owner about new contact submission
      await notifyOwner({
        title: `New Contact: ${input.subject || "General Inquiry"}`,
        content: `From: ${input.name} (${input.email})\n\n${input.message.substring(0, 200)}${input.message.length > 200 ? "..." : ""}`,
      });

      return { 
        success: true, 
        message: "Thank you for your message! We'll get back to you soon." 
      };
    }),

  /**
   * Get all contact submissions (protected - owner only)
   */
  getSubmissions: protectedProcedure
    .input(z.object({
      status: z.enum(["new", "read", "replied", "archived"]).optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(contactSubmissions);
      
      if (input?.status) {
        query = query.where(eq(contactSubmissions.status, input.status)) as any;
      }

      const submissions = await query
        .orderBy(desc(contactSubmissions.createdAt))
        .limit(input?.limit || 50);

      return submissions;
    }),

  /**
   * Update submission status
   */
  updateStatus: protectedProcedure
    .input(z.object({
      submissionId: z.number(),
      status: z.enum(["new", "read", "replied", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const updateData: any = { status: input.status };
      if (input.status === "replied") {
        updateData.repliedAt = new Date();
      }

      await db.update(contactSubmissions)
        .set(updateData)
        .where(eq(contactSubmissions.id, input.submissionId));

      return { success: true };
    }),

  /**
   * Delete a submission
   */
  deleteSubmission: protectedProcedure
    .input(z.object({ submissionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(contactSubmissions)
        .where(eq(contactSubmissions.id, input.submissionId));

      return { success: true };
    }),

  /**
   * Get submission count by status
   */
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { new: 0, read: 0, replied: 0, archived: 0, total: 0 };

    const all = await db.select().from(contactSubmissions);
    
    const stats = {
      new: all.filter(s => s.status === "new").length,
      read: all.filter(s => s.status === "read").length,
      replied: all.filter(s => s.status === "replied").length,
      archived: all.filter(s => s.status === "archived").length,
      total: all.length,
    };

    return stats;
  }),
});
