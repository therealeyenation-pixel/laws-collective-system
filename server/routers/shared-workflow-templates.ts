import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql, eq, and, desc, or } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

// Since we created the table directly, we'll use raw queries
const TABLE_NAME = 'shared_workflow_templates';

export const sharedWorkflowTemplatesRouter = router({
  // Share a workflow template with the community
  shareTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      templateName: z.string().min(1).max(200),
      templateDescription: z.string().optional(),
      templateCategory: z.string(),
      templateData: z.object({
        trigger: z.any(),
        steps: z.array(z.any()),
        variables: z.array(z.any()).optional(),
      }),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.execute(sql`
        INSERT INTO ${sql.raw(TABLE_NAME)} 
        (template_id, template_name, template_description, template_category, template_data, shared_by_user_id, shared_by_name, tags, status)
        VALUES (
          ${input.templateId},
          ${input.templateName},
          ${input.templateDescription || null},
          ${input.templateCategory},
          ${JSON.stringify(input.templateData)},
          ${ctx.user.id},
          ${ctx.user.name || 'Anonymous'},
          ${JSON.stringify(input.tags || [])},
          'pending'
        )
      `);

      // Notify admin about new submission
      await notifyOwner({
        title: "New Workflow Template Shared",
        content: `${ctx.user.name || 'A user'} has shared a new workflow template "${input.templateName}" for community review.`,
      });

      return { success: true, message: "Template submitted for review" };
    }),

  // Get community templates (approved only for regular users)
  getCommunityTemplates: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      sortBy: z.enum(['downloads', 'rating', 'newest']).default('downloads'),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      let orderBy = 'downloads DESC';
      if (input?.sortBy === 'rating') orderBy = 'rating DESC';
      if (input?.sortBy === 'newest') orderBy = 'created_at DESC';

      let whereClause = "status = 'approved'";
      if (input?.category) {
        whereClause += ` AND template_category = '${input.category}'`;
      }
      if (input?.search) {
        const searchTerm = input.search.replace(/'/g, "''");
        whereClause += ` AND (template_name LIKE '%${searchTerm}%' OR template_description LIKE '%${searchTerm}%')`;
      }

      const templates = await db.execute(sql`
        SELECT * FROM ${sql.raw(TABLE_NAME)}
        WHERE ${sql.raw(whereClause)}
        ORDER BY ${sql.raw(orderBy)}
        LIMIT 50
      `);

      return (templates[0] as any[]).map(t => ({
        id: t.id,
        templateId: t.template_id,
        templateName: t.template_name,
        templateDescription: t.template_description,
        templateCategory: t.template_category,
        templateData: typeof t.template_data === 'string' ? JSON.parse(t.template_data) : t.template_data,
        sharedByUserId: t.shared_by_user_id,
        sharedByName: t.shared_by_name,
        downloads: t.downloads,
        rating: parseFloat(t.rating) || 0,
        ratingCount: t.rating_count,
        tags: typeof t.tags === 'string' ? JSON.parse(t.tags) : (t.tags || []),
        createdAt: t.created_at,
      }));
    }),

  // Get pending templates (admin only)
  getPendingTemplates: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    // Check if user is admin
    if (ctx.user.role !== 'admin') {
      return [];
    }

    const templates = await db.execute(sql`
      SELECT * FROM ${sql.raw(TABLE_NAME)}
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `);

    return (templates[0] as any[]).map(t => ({
      id: t.id,
      templateId: t.template_id,
      templateName: t.template_name,
      templateDescription: t.template_description,
      templateCategory: t.template_category,
      templateData: typeof t.template_data === 'string' ? JSON.parse(t.template_data) : t.template_data,
      sharedByUserId: t.shared_by_user_id,
      sharedByName: t.shared_by_name,
      status: t.status,
      tags: typeof t.tags === 'string' ? JSON.parse(t.tags) : (t.tags || []),
      createdAt: t.created_at,
    }));
  }),

  // Review a shared template (admin only)
  reviewTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      status: z.enum(['approved', 'rejected']),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new Error("Only admins can review templates");
      }

      await db.execute(sql`
        UPDATE ${sql.raw(TABLE_NAME)}
        SET 
          status = ${input.status},
          reviewer_id = ${ctx.user.id},
          reviewer_comment = ${input.comment || null},
          reviewed_at = NOW()
        WHERE id = ${input.templateId}
      `);

      return { success: true };
    }),

  // Download/use a community template
  downloadTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Increment download count
      await db.execute(sql`
        UPDATE ${sql.raw(TABLE_NAME)}
        SET downloads = downloads + 1
        WHERE id = ${input.templateId}
      `);

      // Get template data
      const result = await db.execute(sql`
        SELECT template_data FROM ${sql.raw(TABLE_NAME)}
        WHERE id = ${input.templateId}
      `);

      const row = (result[0] as any[])[0];
      if (!row) throw new Error("Template not found");

      return {
        success: true,
        templateData: typeof row.template_data === 'string' 
          ? JSON.parse(row.template_data) 
          : row.template_data,
      };
    }),

  // Rate a community template
  rateTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      rating: z.number().min(1).max(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get current rating info
      const result = await db.execute(sql`
        SELECT rating, rating_count FROM ${sql.raw(TABLE_NAME)}
        WHERE id = ${input.templateId}
      `);

      const row = (result[0] as any[])[0];
      if (!row) throw new Error("Template not found");

      const currentRating = parseFloat(row.rating) || 0;
      const currentCount = row.rating_count || 0;

      // Calculate new average
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + input.rating) / newCount;

      await db.execute(sql`
        UPDATE ${sql.raw(TABLE_NAME)}
        SET 
          rating = ${newRating.toFixed(2)},
          rating_count = ${newCount}
        WHERE id = ${input.templateId}
      `);

      return { success: true, newRating, newCount };
    }),

  // Get user's shared templates
  getMySharedTemplates: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const templates = await db.execute(sql`
      SELECT * FROM ${sql.raw(TABLE_NAME)}
      WHERE shared_by_user_id = ${ctx.user.id}
      ORDER BY created_at DESC
    `);

    return (templates[0] as any[]).map(t => ({
      id: t.id,
      templateId: t.template_id,
      templateName: t.template_name,
      templateDescription: t.template_description,
      templateCategory: t.template_category,
      status: t.status,
      downloads: t.downloads,
      rating: parseFloat(t.rating) || 0,
      ratingCount: t.rating_count,
      reviewerComment: t.reviewer_comment,
      createdAt: t.created_at,
    }));
  }),

  // Delete a shared template (owner only)
  deleteSharedTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.execute(sql`
        DELETE FROM ${sql.raw(TABLE_NAME)}
        WHERE id = ${input.templateId} AND shared_by_user_id = ${ctx.user.id}
      `);

      return { success: true };
    }),

  // Get template stats
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, approved: 0, pending: 0, totalDownloads: 0 };

    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(downloads) as total_downloads
      FROM ${sql.raw(TABLE_NAME)}
    `);

    const row = (stats[0] as any[])[0];
    return {
      total: row?.total || 0,
      approved: row?.approved || 0,
      pending: row?.pending || 0,
      totalDownloads: row?.total_downloads || 0,
    };
  }),
});
