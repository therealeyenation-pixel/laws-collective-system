import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { db } from "../db";
import { apprenticeshipPartners, apprenticeshipApplications } from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const apprenticeshipsRouter = router({
  // ── Partners ──────────────────────────────────────────────

  listPartners: publicProcedure
    .input(z.object({
      status: z.enum(["active", "pending", "inactive", "archived"]).optional(),
      industry: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const conditions = [];
      if (input?.status) conditions.push(eq(apprenticeshipPartners.status, input.status));
      if (input?.industry) conditions.push(eq(apprenticeshipPartners.industry, input.industry));

      const partners = await db
        .select()
        .from(apprenticeshipPartners)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(apprenticeshipPartners.createdAt));

      return partners;
    }),

  getPartner: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [partner] = await db
        .select()
        .from(apprenticeshipPartners)
        .where(eq(apprenticeshipPartners.id, input.id));
      return partner || null;
    }),

  createPartner: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      website: z.string().optional(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      logoUrl: z.string().optional(),
      industry: z.string().min(1),
      tradeCategories: z.array(z.string()).optional(),
      programTypes: z.array(z.string()).optional(),
      locations: z.array(z.string()).optional(),
      minAge: z.number().optional(),
      maxAge: z.number().optional(),
      durationWeeks: z.number().optional(),
      isPaid: z.boolean().optional(),
      stipendAmount: z.string().optional(),
      certificationOffered: z.boolean().optional(),
      certificationName: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await db.insert(apprenticeshipPartners).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId, success: true };
    }),

  updatePartner: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      website: z.string().optional(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      industry: z.string().optional(),
      tradeCategories: z.array(z.string()).optional(),
      programTypes: z.array(z.string()).optional(),
      locations: z.array(z.string()).optional(),
      minAge: z.number().optional(),
      maxAge: z.number().optional(),
      durationWeeks: z.number().optional(),
      isPaid: z.boolean().optional(),
      stipendAmount: z.string().optional(),
      certificationOffered: z.boolean().optional(),
      certificationName: z.string().optional(),
      status: z.enum(["active", "pending", "inactive", "archived"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await db.update(apprenticeshipPartners).set(updates).where(eq(apprenticeshipPartners.id, id));
      return { success: true };
    }),

  deletePartner: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(apprenticeshipPartners).where(eq(apprenticeshipPartners.id, input.id));
      return { success: true };
    }),

  // ── Applications ──────────────────────────────────────────

  listApplications: protectedProcedure
    .input(z.object({
      partnerId: z.number().optional(),
      status: z.enum(["draft", "submitted", "under_review", "interview", "accepted", "rejected", "withdrawn", "placed"]).optional(),
      myOnly: z.boolean().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const conditions = [];
      if (input?.partnerId) conditions.push(eq(apprenticeshipApplications.partnerId, input.partnerId));
      if (input?.status) conditions.push(eq(apprenticeshipApplications.status, input.status));
      if (input?.myOnly) conditions.push(eq(apprenticeshipApplications.userId, ctx.user.id));

      const apps = await db
        .select()
        .from(apprenticeshipApplications)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(apprenticeshipApplications.createdAt));

      return apps;
    }),

  getMyApplications: protectedProcedure
    .query(async ({ ctx }) => {
      const apps = await db
        .select()
        .from(apprenticeshipApplications)
        .where(eq(apprenticeshipApplications.userId, ctx.user.id))
        .orderBy(desc(apprenticeshipApplications.createdAt));
      return apps;
    }),

  submitApplication: protectedProcedure
    .input(z.object({
      partnerId: z.number(),
      programName: z.string().min(1),
      tradeCategory: z.string().min(1),
      coverLetter: z.string().optional(),
      relevantSkills: z.array(z.string()).optional(),
      educationLevel: z.string().optional(),
      preferredStartDate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await db.insert(apprenticeshipApplications).values({
        userId: ctx.user.id,
        partnerId: input.partnerId,
        programName: input.programName,
        tradeCategory: input.tradeCategory,
        coverLetter: input.coverLetter,
        relevantSkills: input.relevantSkills,
        educationLevel: input.educationLevel,
        preferredStartDate: input.preferredStartDate ? new Date(input.preferredStartDate) : undefined,
        status: "submitted",
      });
      return { id: result.insertId, success: true };
    }),

  updateApplicationStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "submitted", "under_review", "interview", "accepted", "rejected", "withdrawn", "placed"]),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const updates: any = { status: input.status };
      if (input.adminNotes) updates.adminNotes = input.adminNotes;
      if (["accepted", "rejected"].includes(input.status)) {
        updates.reviewedBy = ctx.user.id;
        updates.reviewedAt = new Date();
      }
      await db.update(apprenticeshipApplications).set(updates).where(eq(apprenticeshipApplications.id, input.id));
      return { success: true };
    }),

  // ── Stats ──────────────────────────────────────────────

  getStats: protectedProcedure
    .query(async () => {
      const [partnerCount] = await db.select({ count: sql<number>`count(*)` }).from(apprenticeshipPartners);
      const [activePartners] = await db.select({ count: sql<number>`count(*)` }).from(apprenticeshipPartners).where(eq(apprenticeshipPartners.status, "active"));
      const [totalApps] = await db.select({ count: sql<number>`count(*)` }).from(apprenticeshipApplications);
      const [placedApps] = await db.select({ count: sql<number>`count(*)` }).from(apprenticeshipApplications).where(eq(apprenticeshipApplications.status, "placed"));

      return {
        totalPartners: partnerCount.count,
        activePartners: activePartners.count,
        totalApplications: totalApps.count,
        placedStudents: placedApps.count,
      };
    }),
});
