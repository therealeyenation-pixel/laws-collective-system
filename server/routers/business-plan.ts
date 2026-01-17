import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { businessPlans } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const businessPlanRouter = router({
  // Save a business plan from the simulator
  save: protectedProcedure
    .input(
      z.object({
        entityId: z.string().optional(),
        entityName: z.string(),
        entityType: z.enum(["llc", "corporation", "trust", "nonprofit_508", "nonprofit_501c3", "collective", "sole_proprietorship"]),
        yearFounded: z.number(),
        missionStatement: z.string(),
        visionStatement: z.string(),
        organizationDescription: z.string(),
        productsServices: z.string(),
        uniqueValueProposition: z.string(),
        targetMarket: z.string(),
        marketSize: z.string(),
        competitiveAdvantage: z.string(),
        teamSize: z.number(),
        teamDescription: z.string(),
        keyPersonnel: z.array(z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string().optional(),
        })),
        startupCosts: z.string(),
        monthlyOperatingCosts: z.string(),
        projectedRevenueYear1: z.string(),
        projectedRevenueYear2: z.string(),
        projectedRevenueYear3: z.string(),
        breakEvenTimeline: z.string(),
        fundingNeeded: z.string(),
        fundingPurpose: z.string(),
        socialImpact: z.string().optional(),
        communityBenefit: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Check if a business plan already exists for this entity
      const existing = await db.select()
        .from(businessPlans)
        .where(eq(businessPlans.entityName, input.entityName))
        .limit(1);
      
      const planData = {
        entityName: input.entityName,
        entityType: input.entityType,
        yearFounded: input.yearFounded,
        missionStatement: input.missionStatement,
        visionStatement: input.visionStatement,
        organizationDescription: input.organizationDescription,
        productsServices: input.productsServices,
        uniqueValueProposition: input.uniqueValueProposition,
        targetMarket: input.targetMarket,
        marketSize: input.marketSize,
        competitiveAdvantage: input.competitiveAdvantage,
        teamSize: input.teamSize,
        teamDescription: input.teamDescription,
        keyPersonnel: JSON.stringify(input.keyPersonnel),
        startupCosts: input.startupCosts,
        monthlyOperatingCosts: input.monthlyOperatingCosts,
        projectedRevenueYear1: input.projectedRevenueYear1,
        projectedRevenueYear2: input.projectedRevenueYear2,
        projectedRevenueYear3: input.projectedRevenueYear3,
        breakEvenTimeline: input.breakEvenTimeline,
        fundingNeeded: input.fundingNeeded,
        fundingPurpose: input.fundingPurpose,
        socialImpact: input.socialImpact || null,
        communityBenefit: input.communityBenefit || null,
        status: "completed" as const,
        createdByUserId: ctx.user.id,
        completedAt: new Date(),
        updatedAt: new Date(),
      };
      
      if (existing.length > 0) {
        // Update existing plan
        await db.update(businessPlans)
          .set(planData)
          .where(eq(businessPlans.id, existing[0].id));
        return { success: true, id: existing[0].id, updated: true };
      } else {
        // Create new plan
        const result = await db.insert(businessPlans).values({
          ...planData,
          createdAt: new Date(),
        });
        return { success: true, id: Number((result as any).insertId || 0), updated: false };
      }
    }),

  // Get business plan by entity name
  getByEntityName: protectedProcedure
    .input(z.object({ entityName: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const plans = await db.select()
        .from(businessPlans)
        .where(eq(businessPlans.entityName, input.entityName))
        .limit(1);
      
      if (plans.length === 0) {
        return null;
      }
      
      const plan = plans[0];
      return {
        ...plan,
        keyPersonnel: plan.keyPersonnel ? (typeof plan.keyPersonnel === 'string' ? JSON.parse(plan.keyPersonnel) : plan.keyPersonnel) : [],
      };
    }),

  // Get all business plans for the user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const plans = await db.select()
      .from(businessPlans)
      .where(eq(businessPlans.createdByUserId, ctx.user.id))
      .orderBy(desc(businessPlans.updatedAt));
    
    return plans.map((plan) => ({
      ...plan,
      keyPersonnel: plan.keyPersonnel ? (typeof plan.keyPersonnel === 'string' ? JSON.parse(plan.keyPersonnel as string) : plan.keyPersonnel) : [],
    }));
  }),

  // Get business plan summary for grant auto-populate
  getSummaryForGrant: protectedProcedure
    .input(z.object({ entityName: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const plans = await db.select()
        .from(businessPlans)
        .where(eq(businessPlans.entityName, input.entityName))
        .limit(1);
      
      if (plans.length === 0) {
        return null;
      }
      
      const plan = plans[0];
      
      // Parse JSON fields safely
      const parseJson = (val: unknown) => {
        if (!val) return null;
        if (typeof val === 'string') {
          try { return JSON.parse(val); } catch { return null; }
        }
        return val;
      };
      
      return {
        entityName: plan.entityName,
        entityType: plan.entityType,
        yearFounded: plan.yearFounded,
        missionStatement: plan.missionStatement,
        organizationDescription: plan.organizationDescription,
        teamSize: plan.teamSize,
        teamDescription: plan.teamDescription,
        fundingNeeded: plan.fundingNeeded,
        fundingPurpose: plan.fundingPurpose,
        socialImpact: plan.socialImpact,
        communityBenefit: plan.communityBenefit,
        // Project Description fields
        productsServices: plan.productsServices,
        uniqueValueProposition: plan.uniqueValueProposition,
        shortTermGoals: parseJson(plan.shortTermGoals),
        longTermGoals: parseJson(plan.longTermGoals),
        milestones: parseJson(plan.milestones),
        targetMarket: plan.targetMarket,
        competitiveAdvantage: plan.competitiveAdvantage,
      };
    }),
});
