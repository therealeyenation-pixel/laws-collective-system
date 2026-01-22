import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { swotAnalyses, swotItems } from "../../drizzle/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export const swotAnalysisRouter = router({
  // Get all SWOT analyses for the current user
  list: protectedProcedure
    .input(z.object({
      businessEntityId: z.number().optional(),
      status: z.enum(["draft", "active", "archived"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const conditions = [eq(swotAnalyses.userId, ctx.user.id)];
      
      if (input?.businessEntityId) {
        conditions.push(eq(swotAnalyses.businessEntityId, input.businessEntityId));
      }
      if (input?.status) {
        conditions.push(eq(swotAnalyses.status, input.status));
      }
      
      return db.select().from(swotAnalyses)
        .where(and(...conditions))
        .orderBy(desc(swotAnalyses.updatedAt));
    }),

  // Get a single SWOT analysis with its items
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [analysis] = await db.select().from(swotAnalyses)
        .where(and(
          eq(swotAnalyses.id, input.id),
          eq(swotAnalyses.userId, ctx.user.id)
        ));
      
      if (!analysis) {
        throw new Error("SWOT analysis not found");
      }
      
      const items = await db.select().from(swotItems)
        .where(eq(swotItems.swotAnalysisId, input.id))
        .orderBy(asc(swotItems.sortOrder));
      
      return { ...analysis, items };
    }),

  // Create a new SWOT analysis
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      businessEntityId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [result] = await db.insert(swotAnalyses).values({
        userId: ctx.user.id,
        title: input.title,
        description: input.description || null,
        businessEntityId: input.businessEntityId || null,
        status: "draft",
      });
      
      return { id: result.insertId };
    }),

  // Update a SWOT analysis
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "active", "archived"]).optional(),
      reviewDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      
      await db.update(swotAnalyses)
        .set(updates)
        .where(and(
          eq(swotAnalyses.id, id),
          eq(swotAnalyses.userId, ctx.user.id)
        ));
      
      return { success: true };
    }),

  // Delete a SWOT analysis
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Delete items first
      await db.delete(swotItems).where(eq(swotItems.swotAnalysisId, input.id));
      
      // Delete analysis
      await db.delete(swotAnalyses)
        .where(and(
          eq(swotAnalyses.id, input.id),
          eq(swotAnalyses.userId, ctx.user.id)
        ));
      
      return { success: true };
    }),

  // SWOT Items operations
  items: router({
    // Add an item to a SWOT analysis
    add: protectedProcedure
      .input(z.object({
        swotAnalysisId: z.number(),
        category: z.enum(["strength", "weakness", "opportunity", "threat"]),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        impact: z.number().min(1).max(10).optional(),
        actionRequired: z.boolean().optional(),
        actionPlan: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const [analysis] = await db.select().from(swotAnalyses)
          .where(and(
            eq(swotAnalyses.id, input.swotAnalysisId),
            eq(swotAnalyses.userId, ctx.user.id)
          ));
        
        if (!analysis) {
          throw new Error("SWOT analysis not found");
        }
        
        // Get max sort order for this category
        const existingItems = await db.select().from(swotItems)
          .where(and(
            eq(swotItems.swotAnalysisId, input.swotAnalysisId),
            eq(swotItems.category, input.category)
          ));
        
        const maxOrder = existingItems.reduce((max, item) => 
          Math.max(max, item.sortOrder || 0), 0);
        
        const [result] = await db.insert(swotItems).values({
          swotAnalysisId: input.swotAnalysisId,
          category: input.category,
          title: input.title,
          description: input.description || null,
          priority: input.priority || "medium",
          impact: input.impact || 5,
          actionRequired: input.actionRequired || false,
          actionPlan: input.actionPlan || null,
          sortOrder: maxOrder + 1,
        });
        
        // Update analysis scores
        await updateAnalysisScores(input.swotAnalysisId);
        
        return { id: result.insertId };
      }),

    // Update an item
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        impact: z.number().min(1).max(10).optional(),
        actionRequired: z.boolean().optional(),
        actionPlan: z.string().optional(),
        actionStatus: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        actionDueDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        
        // Get item to verify ownership
        const [item] = await db.select().from(swotItems)
          .where(eq(swotItems.id, id));
        
        if (!item) {
          throw new Error("Item not found");
        }
        
        // Verify analysis ownership
        const [analysis] = await db.select().from(swotAnalyses)
          .where(and(
            eq(swotAnalyses.id, item.swotAnalysisId),
            eq(swotAnalyses.userId, ctx.user.id)
          ));
        
        if (!analysis) {
          throw new Error("Not authorized");
        }
        
        await db.update(swotItems).set(updates).where(eq(swotItems.id, id));
        
        // Update analysis scores
        await updateAnalysisScores(item.swotAnalysisId);
        
        return { success: true };
      }),

    // Delete an item
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Get item to verify ownership
        const [item] = await db.select().from(swotItems)
          .where(eq(swotItems.id, input.id));
        
        if (!item) {
          throw new Error("Item not found");
        }
        
        // Verify analysis ownership
        const [analysis] = await db.select().from(swotAnalyses)
          .where(and(
            eq(swotAnalyses.id, item.swotAnalysisId),
            eq(swotAnalyses.userId, ctx.user.id)
          ));
        
        if (!analysis) {
          throw new Error("Not authorized");
        }
        
        await db.delete(swotItems).where(eq(swotItems.id, input.id));
        
        // Update analysis scores
        await updateAnalysisScores(item.swotAnalysisId);
        
        return { success: true };
      }),

    // Reorder items within a category
    reorder: protectedProcedure
      .input(z.object({
        swotAnalysisId: z.number(),
        category: z.enum(["strength", "weakness", "opportunity", "threat"]),
        itemIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const [analysis] = await db.select().from(swotAnalyses)
          .where(and(
            eq(swotAnalyses.id, input.swotAnalysisId),
            eq(swotAnalyses.userId, ctx.user.id)
          ));
        
        if (!analysis) {
          throw new Error("Not authorized");
        }
        
        // Update sort order for each item
        for (let i = 0; i < input.itemIds.length; i++) {
          await db.update(swotItems)
            .set({ sortOrder: i })
            .where(eq(swotItems.id, input.itemIds[i]));
        }
        
        return { success: true };
      }),
  }),
});

// Helper function to update analysis scores
async function updateAnalysisScores(analysisId: number) {
  const items = await db.select().from(swotItems)
    .where(eq(swotItems.swotAnalysisId, analysisId));
  
  const scores = {
    strengthScore: 0,
    weaknessScore: 0,
    opportunityScore: 0,
    threatScore: 0,
  };
  
  for (const item of items) {
    const impact = item.impact || 5;
    const priorityMultiplier = 
      item.priority === "critical" ? 2 :
      item.priority === "high" ? 1.5 :
      item.priority === "medium" ? 1 : 0.5;
    
    const score = Math.round(impact * priorityMultiplier);
    
    switch (item.category) {
      case "strength":
        scores.strengthScore += score;
        break;
      case "weakness":
        scores.weaknessScore += score;
        break;
      case "opportunity":
        scores.opportunityScore += score;
        break;
      case "threat":
        scores.threatScore += score;
        break;
    }
  }
  
  await db.update(swotAnalyses).set(scores).where(eq(swotAnalyses.id, analysisId));
}
