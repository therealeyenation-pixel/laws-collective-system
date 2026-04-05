import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { workflowTemplateUsage, workflowTemplateRatings } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const workflowTemplatesRouter = router({
  // Track template usage
  trackUsage: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      templateName: z.string(),
      templateCategory: z.string(),
      workflowId: z.string(),
      workflowName: z.string(),
      customizations: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [result] = await db
        .insert(workflowTemplateUsage)
        .values({
          userId: ctx.user.id,
          templateId: input.templateId,
          templateName: input.templateName,
          templateCategory: input.templateCategory,
          workflowId: input.workflowId,
          workflowName: input.workflowName,
          customizations: input.customizations || null,
        });
      return { success: true, id: result.insertId };
    }),

  // Get user's deployed workflows
  getUserDeployments: protectedProcedure.query(async ({ ctx }) => {
    const deployments = await db
      .select()
      .from(workflowTemplateUsage)
      .where(eq(workflowTemplateUsage.userId, ctx.user.id))
      .orderBy(desc(workflowTemplateUsage.deployedAt));
    return deployments;
  }),

  // Get template usage stats
  getTemplateStats: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .query(async ({ input }) => {
      const usageCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(workflowTemplateUsage)
        .where(eq(workflowTemplateUsage.templateId, input.templateId));

      const ratings = await db
        .select()
        .from(workflowTemplateRatings)
        .where(eq(workflowTemplateRatings.templateId, input.templateId));

      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      return {
        usageCount: usageCount[0]?.count || 0,
        ratingCount: ratings.length,
        averageRating: Math.round(avgRating * 10) / 10,
      };
    }),

  // Rate a template
  rateTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already rated
      const existing = await db
        .select()
        .from(workflowTemplateRatings)
        .where(
          and(
            eq(workflowTemplateRatings.templateId, input.templateId),
            eq(workflowTemplateRatings.userId, ctx.user.id)
          )
        );

      if (existing.length > 0) {
        // Update existing rating
        await db
          .update(workflowTemplateRatings)
          .set({
            rating: input.rating,
            comment: input.comment || null,
          })
          .where(eq(workflowTemplateRatings.id, existing[0].id));
      } else {
        // Create new rating
        await db
          .insert(workflowTemplateRatings)
          .values({
            userId: ctx.user.id,
            templateId: input.templateId,
            rating: input.rating,
            comment: input.comment || null,
          });
      }

      return { success: true };
    }),

  // Get user's rating for a template
  getUserRating: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [rating] = await db
        .select()
        .from(workflowTemplateRatings)
        .where(
          and(
            eq(workflowTemplateRatings.templateId, input.templateId),
            eq(workflowTemplateRatings.userId, ctx.user.id)
          )
        );
      return rating || null;
    }),

  // Get popular templates
  getPopularTemplates: protectedProcedure.query(async () => {
    const stats = await db
      .select({
        templateId: workflowTemplateUsage.templateId,
        templateName: workflowTemplateUsage.templateName,
        templateCategory: workflowTemplateUsage.templateCategory,
        count: sql<number>`count(*)`,
      })
      .from(workflowTemplateUsage)
      .groupBy(
        workflowTemplateUsage.templateId,
        workflowTemplateUsage.templateName,
        workflowTemplateUsage.templateCategory
      )
      .orderBy(desc(sql`count(*)`))
      .limit(10);
    return stats;
  }),
});
