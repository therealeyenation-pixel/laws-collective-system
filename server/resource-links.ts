import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { resourceLinks, resourceLinkCategories } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const resourceLinksRouter = router({
  // Get links for a specific dashboard
  getByDashboard: publicProcedure
    .input(z.object({
      dashboard: z.enum(["health", "finance", "legal", "business", "education", "governance", "hr", "operations", "general"]),
      category: z.string().optional(),
      includeAgentPending: z.boolean().default(false),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const conditions = [
        eq(resourceLinks.dashboard, input.dashboard),
        eq(resourceLinks.isActive, true),
      ];
      
      // Only show approved content unless specifically requesting pending
      if (!input.includeAgentPending) {
        conditions.push(eq(resourceLinks.approvalStatus, "approved"));
      }
      
      if (input.category) {
        conditions.push(eq(resourceLinks.category, input.category));
      }
      
      const links = await db
        .select()
        .from(resourceLinks)
        .where(and(...conditions))
        .orderBy(desc(resourceLinks.isPinned), desc(resourceLinks.priority), desc(resourceLinks.createdAt))
        .limit(input.limit);
      
      return links;
    }),

  // Get categories for a dashboard
  getCategories: publicProcedure
    .input(z.object({
      dashboard: z.string(),
    }))
    .query(async ({ input }) => {
      const categories = await db
        .select()
        .from(resourceLinkCategories)
        .where(and(
          eq(resourceLinkCategories.dashboard, input.dashboard),
          eq(resourceLinkCategories.isActive, true)
        ))
        .orderBy(resourceLinkCategories.orderIndex);
      
      return categories;
    }),

  // Add a new resource link (admin only)
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      url: z.string().url().max(1000),
      description: z.string().optional(),
      dashboard: z.enum(["health", "finance", "legal", "business", "education", "governance", "hr", "operations", "general"]),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      priority: z.number().default(0),
      isPinned: z.boolean().default(false),
      sourceName: z.string().optional(),
      sourceIcon: z.string().optional(),
      publishedAt: z.date().optional(),
      // Agent identification fields
      isAgentIdentified: z.boolean().default(false),
      agentId: z.number().optional(),
      agentConfidence: z.number().optional(),
      agentReason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [link] = await db.insert(resourceLinks).values({
        title: input.title,
        url: input.url,
        description: input.description,
        dashboard: input.dashboard,
        category: input.category,
        tags: input.tags,
        priority: input.priority,
        isPinned: input.isPinned,
        sourceName: input.sourceName,
        sourceIcon: input.sourceIcon,
        publishedAt: input.publishedAt,
        addedBy: ctx.user.id,
        isAgentIdentified: input.isAgentIdentified,
        agentId: input.agentId,
        agentConfidence: input.agentConfidence ? String(input.agentConfidence) : undefined,
        agentReason: input.agentReason,
        approvalStatus: input.isAgentIdentified ? "pending" : "approved",
        approvedBy: input.isAgentIdentified ? undefined : ctx.user.id,
        approvedAt: input.isAgentIdentified ? undefined : new Date(),
      });
      
      return { success: true, id: link.insertId };
    }),

  // Agent suggests a resource link
  agentSuggest: publicProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      url: z.string().url().max(1000),
      description: z.string().optional(),
      dashboard: z.enum(["health", "finance", "legal", "business", "education", "governance", "hr", "operations", "general"]),
      category: z.string().optional(),
      sourceName: z.string().optional(),
      agentId: z.number(),
      agentConfidence: z.number().min(0).max(100),
      agentReason: z.string(),
    }))
    .mutation(async ({ input }) => {
      const [link] = await db.insert(resourceLinks).values({
        title: input.title,
        url: input.url,
        description: input.description,
        dashboard: input.dashboard,
        category: input.category,
        sourceName: input.sourceName,
        isAgentIdentified: true,
        agentId: input.agentId,
        agentConfidence: String(input.agentConfidence),
        agentReason: input.agentReason,
        approvalStatus: "pending",
      });
      
      return { success: true, id: link.insertId };
    }),

  // Approve or reject agent-suggested content
  reviewAgentContent: protectedProcedure
    .input(z.object({
      id: z.number(),
      action: z.enum(["approve", "reject"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(resourceLinks)
        .set({
          approvalStatus: input.action === "approve" ? "approved" : "rejected",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        })
        .where(eq(resourceLinks.id, input.id));
      
      return { success: true };
    }),

  // Get pending agent suggestions for review
  getPendingAgentContent: protectedProcedure
    .input(z.object({
      dashboard: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const conditions = [
        eq(resourceLinks.isAgentIdentified, true),
        eq(resourceLinks.approvalStatus, "pending"),
      ];
      
      if (input.dashboard) {
        conditions.push(eq(resourceLinks.dashboard, input.dashboard as any));
      }
      
      const links = await db
        .select()
        .from(resourceLinks)
        .where(and(...conditions))
        .orderBy(desc(resourceLinks.createdAt));
      
      return links;
    }),

  // Update a resource link
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(255).optional(),
      url: z.string().url().max(1000).optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      priority: z.number().optional(),
      isPinned: z.boolean().optional(),
      sourceName: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      
      await db
        .update(resourceLinks)
        .set(updates)
        .where(eq(resourceLinks.id, id));
      
      return { success: true };
    }),

  // Delete a resource link
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .delete(resourceLinks)
        .where(eq(resourceLinks.id, input.id));
      
      return { success: true };
    }),

  // Track link click
  trackClick: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(resourceLinks)
        .set({
          clickCount: sql`${resourceLinks.clickCount} + 1`,
          lastClickedAt: new Date(),
        })
        .where(eq(resourceLinks.id, input.id));
      
      return { success: true };
    }),

  // Create category
  createCategory: protectedProcedure
    .input(z.object({
      dashboard: z.string(),
      categoryName: z.string(),
      categoryIcon: z.string().optional(),
      description: z.string().optional(),
      orderIndex: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      await db.insert(resourceLinkCategories).values(input);
      return { success: true };
    }),

  // Get all links (admin view)
  getAll: protectedProcedure
    .input(z.object({
      dashboard: z.string().optional(),
      includeInactive: z.boolean().default(false),
    }))
    .query(async ({ input }) => {
      const conditions = [];
      
      if (input.dashboard) {
        conditions.push(eq(resourceLinks.dashboard, input.dashboard as any));
      }
      
      if (!input.includeInactive) {
        conditions.push(eq(resourceLinks.isActive, true));
      }
      
      const links = await db
        .select()
        .from(resourceLinks)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(resourceLinks.createdAt));
      
      return links;
    }),
});
