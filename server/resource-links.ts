import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { resourceLinks, resourceLinkCategories } from "../drizzle/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";

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

  // Get links by SWOT relevance
  getBySwotRelevance: publicProcedure
    .input(z.object({
      relevance: z.enum(["strength", "weakness", "opportunity", "threat"]),
      industryCategory: z.string().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const conditions = [
        eq(resourceLinks.swotRelevance, input.relevance),
        eq(resourceLinks.isActive, true),
        eq(resourceLinks.approvalStatus, "approved"),
      ];
      
      if (input.industryCategory) {
        conditions.push(eq(resourceLinks.industryCategory, input.industryCategory as any));
      }
      
      const links = await db
        .select()
        .from(resourceLinks)
        .where(and(...conditions))
        .orderBy(desc(resourceLinks.priority), desc(resourceLinks.createdAt))
        .limit(input.limit);
      
      return links;
    }),

  // Get industry intelligence summary
  getIndustryIntelligence: publicProcedure
    .input(z.object({
      industryCategory: z.string().optional(),
      timeframe: z.enum(["week", "month", "quarter", "year"]).default("month"),
    }))
    .query(async ({ input }) => {
      const now = new Date();
      let startDate = new Date();
      
      switch (input.timeframe) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      const conditions = [
        eq(resourceLinks.isActive, true),
        eq(resourceLinks.approvalStatus, "approved"),
        gte(resourceLinks.createdAt, startDate),
      ];
      
      if (input.industryCategory) {
        conditions.push(eq(resourceLinks.industryCategory, input.industryCategory as any));
      }
      
      const links = await db
        .select()
        .from(resourceLinks)
        .where(and(...conditions))
        .orderBy(desc(resourceLinks.createdAt));
      
      // Group by SWOT relevance
      const swotSummary = {
        strengths: links.filter(l => l.swotRelevance === "strength"),
        weaknesses: links.filter(l => l.swotRelevance === "weakness"),
        opportunities: links.filter(l => l.swotRelevance === "opportunity"),
        threats: links.filter(l => l.swotRelevance === "threat"),
      };
      
      // Group by industry category
      const industryBreakdown = links.reduce((acc, link) => {
        const cat = link.industryCategory || "general";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(link);
        return acc;
      }, {} as Record<string, typeof links>);
      
      // Count high-impact items requiring action
      const actionRequired = links.filter(l => l.requiresAction && !l.actionTaken);
      const criticalItems = links.filter(l => l.impactLevel === "critical");
      
      return {
        total: links.length,
        swotSummary,
        industryBreakdown,
        actionRequired,
        criticalItems,
        timeframe: input.timeframe,
      };
    }),

  // Update SWOT classification
  updateSwotClassification: protectedProcedure
    .input(z.object({
      id: z.number(),
      swotRelevance: z.enum(["strength", "weakness", "opportunity", "threat", "none"]),
      swotReason: z.string().optional(),
      industryCategory: z.enum([
        "competitor_intel", "regulatory", "market_trends", "technology",
        "economic", "consumer", "talent", "general"
      ]).optional(),
      impactLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
      impactTimeframe: z.enum(["immediate", "short_term", "medium_term", "long_term"]).optional(),
      requiresAction: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      
      await db
        .update(resourceLinks)
        .set(updates)
        .where(eq(resourceLinks.id, id));
      
      return { success: true };
    }),

  // Record action taken on a resource link
  recordAction: protectedProcedure
    .input(z.object({
      id: z.number(),
      actionTaken: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(resourceLinks)
        .set({
          actionTaken: input.actionTaken,
          actionTakenBy: ctx.user.id,
          actionTakenAt: new Date(),
        })
        .where(eq(resourceLinks.id, input.id));
      
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
