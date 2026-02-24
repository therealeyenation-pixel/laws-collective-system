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

      // Send email notification to luvonpurpose@protonmail.com
      try {
        const emailContent = `
New ${input.source === 'waitlist' ? 'Waitlist Signup' : 'Contact Submission'}

Name: ${input.name}
Email: ${input.email}
Phone: ${input.phone || 'Not provided'}
Subject: ${input.subject || 'General Inquiry'}
Source: ${input.source || 'landing_page'}

Message:
${input.message}

---
Submitted at: ${new Date().toISOString()}
        `;

        // Send email via Manus API
        const response = await fetch(process.env.BUILT_IN_FORGE_API_URL + '/notification/email', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: 'luvonpurpose@protonmail.com',
            subject: `${input.source === 'waitlist' ? '✨ New Waitlist Signup' : '📧 New Contact'}: ${input.name}`,
            text: emailContent,
            html: `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2d5a27;">${input.source === 'waitlist' ? '✨ New Waitlist Signup' : '📧 New Contact Submission'}</h2>
      <p><strong>Name:</strong> ${input.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${input.email}">${input.email}</a></p>
      ${input.phone ? `<p><strong>Phone:</strong> ${input.phone}</p>` : ''}
      <p><strong>Subject:</strong> ${input.subject || 'General Inquiry'}</p>
      <p><strong>Source:</strong> ${input.source || 'landing_page'}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${input.message}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">Submitted at: ${new Date().toISOString()}</p>
    </div>
  </body>
</html>
            `,
          }),
        });

        if (!response.ok) {
          console.error('Failed to send email notification:', await response.text());
        }
      } catch (error) {
        console.error('Error sending email notification:', error);
        // Don't throw - we still want the contact to be saved even if email fails
      }

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
