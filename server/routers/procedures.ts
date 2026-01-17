import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { operatingProcedures, procedureAcknowledgments, procedureCategories } from "../../drizzle/schema";
import { eq, and, like, desc, asc, sql, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const proceduresRouter = router({
  // Get all procedures with optional filtering
  list: protectedProcedure
    .input(z.object({
      category: z.enum(["sop", "manual", "policy", "guide", "training", "checklist", "template", "form"]).optional(),
      department: z.string().optional(),
      status: z.enum(["draft", "review", "approved", "archived", "superseded"]).optional(),
      search: z.string().optional(),
      entityId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];
      
      if (input?.category) {
        conditions.push(eq(operatingProcedures.category, input.category));
      }
      if (input?.department) {
        conditions.push(eq(operatingProcedures.department, input.department));
      }
      if (input?.status) {
        conditions.push(eq(operatingProcedures.status, input.status));
      }
      if (input?.entityId) {
        conditions.push(eq(operatingProcedures.entityId, input.entityId));
      }
      if (input?.search) {
        conditions.push(
          or(
            like(operatingProcedures.title, `%${input.search}%`),
            like(operatingProcedures.description, `%${input.search}%`),
            like(operatingProcedures.documentNumber, `%${input.search}%`)
          )
        );
      }

      const procedures = await db
        .select()
        .from(operatingProcedures)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(operatingProcedures.updatedAt));

      return procedures;
    }),

  // Get a single procedure by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [procedure] = await db
        .select()
        .from(operatingProcedures)
        .where(eq(operatingProcedures.id, input.id));

      if (!procedure) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Procedure not found" });
      }

      return procedure;
    }),

  // Create a new procedure
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      documentNumber: z.string().optional(),
      category: z.enum(["sop", "manual", "policy", "guide", "training", "checklist", "template", "form"]),
      department: z.string().optional(),
      entityId: z.number().optional(),
      positionId: z.string().optional(),
      content: z.string().optional(),
      fileUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
      relatedProcedures: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [result] = await db.insert(operatingProcedures).values({
        ...input,
        createdBy: ctx.user.id,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        relatedProcedures: input.relatedProcedures ? JSON.stringify(input.relatedProcedures) : null,
      });

      return { id: result.insertId, message: "Procedure created successfully" };
    }),

  // Update a procedure
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      documentNumber: z.string().optional(),
      category: z.enum(["sop", "manual", "policy", "guide", "training", "checklist", "template", "form"]).optional(),
      department: z.string().optional(),
      entityId: z.number().optional(),
      positionId: z.string().optional(),
      version: z.string().optional(),
      status: z.enum(["draft", "review", "approved", "archived", "superseded"]).optional(),
      content: z.string().optional(),
      fileUrl: z.string().optional(),
      effectiveDate: z.number().optional(),
      reviewDate: z.number().optional(),
      expirationDate: z.number().optional(),
      tags: z.array(z.string()).optional(),
      relatedProcedures: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { id, tags, relatedProcedures, effectiveDate, reviewDate, expirationDate, ...updateData } = input;

      await db
        .update(operatingProcedures)
        .set({
          ...updateData,
          tags: tags ? JSON.stringify(tags) : undefined,
          relatedProcedures: relatedProcedures ? JSON.stringify(relatedProcedures) : undefined,
          effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
          reviewDate: reviewDate ? new Date(reviewDate) : undefined,
          expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        })
        .where(eq(operatingProcedures.id, id));

      return { message: "Procedure updated successfully" };
    }),

  // Approve a procedure
  approve: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(operatingProcedures)
        .set({
          status: "approved",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        })
        .where(eq(operatingProcedures.id, input.id));

      return { message: "Procedure approved successfully" };
    }),

  // Delete a procedure
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.delete(operatingProcedures).where(eq(operatingProcedures.id, input.id));
      return { message: "Procedure deleted successfully" };
    }),

  // Acknowledge a procedure
  acknowledge: protectedProcedure
    .input(z.object({
      procedureId: z.number(),
      version: z.string(),
      signature: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if already acknowledged this version
      const existing = await db
        .select()
        .from(procedureAcknowledgments)
        .where(
          and(
            eq(procedureAcknowledgments.procedureId, input.procedureId),
            eq(procedureAcknowledgments.userId, ctx.user.id),
            eq(procedureAcknowledgments.version, input.version)
          )
        );

      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Already acknowledged this version" });
      }

      await db.insert(procedureAcknowledgments).values({
        procedureId: input.procedureId,
        userId: ctx.user.id,
        version: input.version,
        signature: input.signature,
        notes: input.notes,
      });

      return { message: "Procedure acknowledged successfully" };
    }),

  // Get acknowledgments for a procedure
  getAcknowledgments: protectedProcedure
    .input(z.object({ procedureId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const acknowledgments = await db
        .select()
        .from(procedureAcknowledgments)
        .where(eq(procedureAcknowledgments.procedureId, input.procedureId))
        .orderBy(desc(procedureAcknowledgments.acknowledgedAt));

      return acknowledgments;
    }),

  // Get user's acknowledgment status for a procedure
  getUserAcknowledgment: protectedProcedure
    .input(z.object({ procedureId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const [acknowledgment] = await db
        .select()
        .from(procedureAcknowledgments)
        .where(
          and(
            eq(procedureAcknowledgments.procedureId, input.procedureId),
            eq(procedureAcknowledgments.userId, ctx.user.id)
          )
        )
        .orderBy(desc(procedureAcknowledgments.acknowledgedAt))
        .limit(1);

      return acknowledgment || null;
    }),

  // Get all categories
  getCategories: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const categories = await db
      .select()
      .from(procedureCategories)
      .orderBy(asc(procedureCategories.sortOrder));

    return categories;
  }),

  // Create a category
  createCategory: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      parentId: z.number().optional(),
      sortOrder: z.number().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [result] = await db.insert(procedureCategories).values(input);
      return { id: result.insertId, message: "Category created successfully" };
    }),

  // Get statistics
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, approved: 0, draft: 0, review: 0, archived: 0, byCategory: [], byDepartment: [] };

    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        approved: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`,
        draft: sql<number>`SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END)`,
        review: sql<number>`SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END)`,
        archived: sql<number>`SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END)`,
      })
      .from(operatingProcedures);

    const byCategory = await db
      .select({
        category: operatingProcedures.category,
        count: sql<number>`COUNT(*)`,
      })
      .from(operatingProcedures)
      .groupBy(operatingProcedures.category);

    const byDepartment = await db
      .select({
        department: operatingProcedures.department,
        count: sql<number>`COUNT(*)`,
      })
      .from(operatingProcedures)
      .where(sql`${operatingProcedures.department} IS NOT NULL`)
      .groupBy(operatingProcedures.department);

    return {
      ...stats,
      byCategory,
      byDepartment,
    };
  }),

  // Get procedures requiring acknowledgment for current user
  getPendingAcknowledgments: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    // Get all approved procedures
    const approvedProcedures = await db
      .select()
      .from(operatingProcedures)
      .where(eq(operatingProcedures.status, "approved"));

    // Get user's acknowledgments
    const userAcknowledgments = await db
      .select()
      .from(procedureAcknowledgments)
      .where(eq(procedureAcknowledgments.userId, ctx.user.id));

    // Find procedures not yet acknowledged or with newer versions
    const pending = approvedProcedures.filter(proc => {
      const ack = userAcknowledgments.find(a => a.procedureId === proc.id);
      return !ack || ack.version !== proc.version;
    });

    return pending;
  }),
});
