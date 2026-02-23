import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { performanceReviews, performanceGoals } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const performanceReviewsRouter = router({
  // List all performance reviews
  list: publicProcedure
    .input(z.object({
      status: z.enum(["draft", "self_assessment", "manager_review", "calibration", "completed", "acknowledged"]).optional(),
      department: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(performanceReviews.status, input.status));
      }
      if (input?.department) {
        conditions.push(eq(performanceReviews.department, input.department));
      }
      
      if (conditions.length > 0) {
        return db.select().from(performanceReviews).where(and(...conditions)).orderBy(desc(performanceReviews.createdAt));
      }
      return db.select().from(performanceReviews).orderBy(desc(performanceReviews.createdAt));
    }),

  // Get single performance review with goals
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const [review] = await db.select().from(performanceReviews).where(eq(performanceReviews.id, input.id));
      if (!review) return null;
      
      const goals = await db.select().from(performanceGoals).where(eq(performanceGoals.performanceReviewId, input.id));
      
      return { ...review, goals };
    }),

  // Create new performance review
  create: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      employeeName: z.string(),
      employeeRole: z.string().optional(),
      department: z.string().optional(),
      reviewPeriod: z.string(),
      reviewType: z.enum(["annual", "quarterly", "probationary", "project"]).default("annual"),
      reviewCycle: z.enum(["mid_year", "year_end", "quarterly"]).default("year_end"),
      reviewerId: z.number().optional(),
      reviewerName: z.string().optional(),
      reviewDueDate: z.date().optional(),
      selfAssessmentDueDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(performanceReviews).values({
        ...input,
        status: "draft",
      });
      
      return { id: result.insertId, ...input };
    }),

  // Update performance review (self-assessment)
  updateSelfAssessment: protectedProcedure
    .input(z.object({
      id: z.number(),
      selfPerformanceRating: z.number().min(1).max(5).optional(),
      selfAccomplishments: z.string().optional(),
      selfChallenges: z.string().optional(),
      selfDevelopmentAreas: z.string().optional(),
      selfGoalsProgress: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db.update(performanceReviews)
        .set({ ...data, status: "self_assessment" })
        .where(eq(performanceReviews.id, id));
      
      return { success: true };
    }),

  // Update performance review (manager review)
  updateManagerReview: protectedProcedure
    .input(z.object({
      id: z.number(),
      managerPerformanceRating: z.number().min(1).max(5).optional(),
      managerFeedback: z.string().optional(),
      managerStrengths: z.string().optional(),
      managerImprovementAreas: z.string().optional(),
      qualityOfWork: z.number().min(1).max(5).optional(),
      productivity: z.number().min(1).max(5).optional(),
      communication: z.number().min(1).max(5).optional(),
      teamwork: z.number().min(1).max(5).optional(),
      initiative: z.number().min(1).max(5).optional(),
      reliability: z.number().min(1).max(5).optional(),
      adaptability: z.number().min(1).max(5).optional(),
      leadership: z.number().min(1).max(5).optional(),
      overallRating: z.number().min(1).max(5).optional(),
      ratingJustification: z.string().optional(),
      promotionRecommendation: z.enum(["not_ready", "developing", "ready", "highly_recommended"]).optional(),
      nextPeriodGoals: z.string().optional(),
      developmentPlan: z.string().optional(),
      trainingNeeds: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db.update(performanceReviews)
        .set({ ...data, status: "manager_review" })
        .where(eq(performanceReviews.id, id));
      
      return { success: true };
    }),

  // Complete review
  complete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(performanceReviews)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(performanceReviews.id, input.id));
      
      return { success: true };
    }),

  // Employee acknowledge review
  acknowledge: protectedProcedure
    .input(z.object({
      id: z.number(),
      employeeComments: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(performanceReviews)
        .set({
          status: "acknowledged",
          employeeAcknowledged: true,
          employeeAcknowledgedAt: new Date(),
          employeeComments: input.employeeComments,
        })
        .where(eq(performanceReviews.id, input.id));
      
      return { success: true };
    }),

  // Delete performance review
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Delete goals first
      await db.delete(performanceGoals).where(eq(performanceGoals.performanceReviewId, input.id));
      // Delete review
      await db.delete(performanceReviews).where(eq(performanceReviews.id, input.id));
      
      return { success: true };
    }),

  // Add goal to review
  addGoal: protectedProcedure
    .input(z.object({
      performanceReviewId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      category: z.enum(["performance", "development", "project", "behavioral"]).default("performance"),
      measurableTarget: z.string().optional(),
      targetDate: z.date().optional(),
      weight: z.number().default(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(performanceGoals).values(input);
      
      return { id: result.insertId, ...input };
    }),

  // Update goal progress
  updateGoal: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["not_started", "in_progress", "completed", "exceeded", "not_met", "cancelled"]).optional(),
      progressPercent: z.number().min(0).max(100).optional(),
      progressNotes: z.string().optional(),
      selfRating: z.number().min(1).max(5).optional(),
      managerRating: z.number().min(1).max(5).optional(),
      managerComments: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db.update(performanceGoals)
        .set(data)
        .where(eq(performanceGoals.id, id));
      
      return { success: true };
    }),

  // Delete goal
  deleteGoal: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(performanceGoals).where(eq(performanceGoals.id, input.id));
      
      return { success: true };
    }),
});
