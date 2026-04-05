import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import crypto from "crypto";

export const articleAcknowledgmentRouter = router({
  markAsRead: protectedProcedure
    .input(z.object({
      articleId: z.string(),
      articleTitle: z.string(),
      articleType: z.enum(['policy', 'announcement', 'training', 'compliance', 'news', 'procedure', 'other']).optional(),
      department: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      try {
        await db.execute(
          sql`INSERT INTO article_acknowledgments (userId, articleId, articleTitle, articleType, department, readAt)
              VALUES (${ctx.user?.id || 0}, ${input.articleId}, ${input.articleTitle}, ${input.articleType || 'announcement'}, ${input.department || null}, NOW())
              ON DUPLICATE KEY UPDATE readAt = NOW(), articleTitle = ${input.articleTitle}`
        );
        return { success: true, readAt: new Date().toISOString() };
      } catch (error) {
        console.error('Error marking article as read:', error);
        throw new Error('Failed to mark article as read');
      }
    }),

  signArticle: protectedProcedure
    .input(z.object({
      articleId: z.string(),
      articleTitle: z.string(),
      articleType: z.enum(['policy', 'announcement', 'training', 'compliance', 'news', 'procedure', 'other']).optional(),
      department: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const signatureData = `${ctx.user?.id}-${input.articleId}-${Date.now()}-${ctx.user?.name || 'user'}`;
      const signatureHash = crypto.createHash('sha256').update(signatureData).digest('hex');
      try {
        await db.execute(
          sql`INSERT INTO article_acknowledgments (userId, articleId, articleTitle, articleType, department, readAt, signedAt, signatureHash, ipAddress, userAgent)
              VALUES (${ctx.user?.id || 0}, ${input.articleId}, ${input.articleTitle}, ${input.articleType || 'announcement'}, ${input.department || null}, NOW(), NOW(), ${signatureHash}, ${input.ipAddress || null}, ${input.userAgent || null})
              ON DUPLICATE KEY UPDATE signedAt = NOW(), signatureHash = ${signatureHash}, ipAddress = ${input.ipAddress || null}, userAgent = ${input.userAgent || null}`
        );
        return { success: true, signedAt: new Date().toISOString(), signatureHash };
      } catch (error) {
        console.error('Error signing article:', error);
        throw new Error('Failed to sign article');
      }
    }),

  getMyAcknowledgments: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional(), offset: z.number().min(0).optional(), signedOnly: z.boolean().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const limit = input.limit || 50;
        const offset = input.offset || 0;
        const query = input.signedOnly
          ? sql`SELECT * FROM article_acknowledgments WHERE userId = ${ctx.user?.id || 0} AND signedAt IS NOT NULL ORDER BY signedAt DESC LIMIT ${limit} OFFSET ${offset}`
          : sql`SELECT * FROM article_acknowledgments WHERE userId = ${ctx.user?.id || 0} ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`;
        const result = await db.execute(query);
        return (result as any[]).map(row => ({ id: row.id, articleId: row.articleId, articleTitle: row.articleTitle, articleType: row.articleType, department: row.department, readAt: row.readAt, signedAt: row.signedAt, signatureHash: row.signatureHash }));
      } catch (error) { console.error('Error fetching acknowledgments:', error); return []; }
    }),

  checkAcknowledgment: protectedProcedure
    .input(z.object({ articleId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { hasRead: false, hasSigned: false };
      try {
        const result = await db.execute(sql`SELECT readAt, signedAt, signatureHash FROM article_acknowledgments WHERE userId = ${ctx.user?.id || 0} AND articleId = ${input.articleId}`);
        const row = (result as any[])[0];
        if (!row) return { hasRead: false, hasSigned: false };
        return { hasRead: !!row.readAt, hasSigned: !!row.signedAt, readAt: row.readAt, signedAt: row.signedAt, signatureHash: row.signatureHash };
      } catch (error) { console.error('Error checking acknowledgment:', error); return { hasRead: false, hasSigned: false }; }
    }),

  getPendingSignatures: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    try {
      const result = await db.execute(sql`SELECT * FROM article_acknowledgments WHERE userId = ${ctx.user?.id || 0} AND readAt IS NOT NULL AND signedAt IS NULL ORDER BY readAt DESC`);
      return (result as any[]).map(row => ({ id: row.id, articleId: row.articleId, articleTitle: row.articleTitle, articleType: row.articleType, department: row.department, readAt: row.readAt }));
    } catch (error) { console.error('Error fetching pending signatures:', error); return []; }
  })
});
