import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { positionRequisitions } from "../../drizzle/schema";

export const requisitionsRouter = router({
  // Get all requisitions
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const requisitions = await db
      .select()
      .from(positionRequisitions)
      .orderBy(desc(positionRequisitions.createdAt));

    return requisitions;
  }),

  // Get requisition by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [requisition] = await db
        .select()
        .from(positionRequisitions)
        .where(eq(positionRequisitions.id, input.id));

      if (!requisition) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Requisition not found" });
      }

      return requisition;
    }),

  // Create new requisition
  create: protectedProcedure
    .input(z.object({
      positionId: z.string(),
      positionTitle: z.string(),
      department: z.string(),
      entity: z.string(),
      tier: z.string(),
      justification: z.string(),
      salaryRange: z.string().optional(),
      targetStartDate: z.date().optional(),
      urgency: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      candidateName: z.string().optional(),
      candidateEmail: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [result] = await db.insert(positionRequisitions).values({
        ...input,
        requestedBy: ctx.user.id,
        requestedByName: ctx.user.name || ctx.user.email || `User ${ctx.user.id}`,
        status: "submitted",
      });

      return { success: true, id: result.insertId };
    }),

  // Update requisition status (for approvers)
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["under_review", "approved", "rejected", "filled", "cancelled"]),
      approvalNotes: z.string().optional(),
      budgetApproved: z.enum(["pending", "approved", "rejected"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const updateData: Record<string, unknown> = {
        status: input.status,
      };

      if (input.approvalNotes) {
        updateData.approvalNotes = input.approvalNotes;
      }

      if (input.budgetApproved) {
        updateData.budgetApproved = input.budgetApproved;
      }

      if (input.status === "approved" || input.status === "rejected") {
        updateData.approvedBy = ctx.user.id;
        updateData.approvedByName = ctx.user.name || ctx.user.email || `User ${ctx.user.id}`;
        updateData.approvalDate = new Date();
      }

      if (input.status === "filled") {
        updateData.filledDate = new Date();
      }

      await db
        .update(positionRequisitions)
        .set(updateData)
        .where(eq(positionRequisitions.id, input.id));

      return { success: true };
    }),

  // Mark requisition as filled with candidate info
  markFilled: protectedProcedure
    .input(z.object({
      id: z.number(),
      candidateName: z.string(),
      candidateEmail: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(positionRequisitions)
        .set({
          status: "filled",
          candidateName: input.candidateName,
          candidateEmail: input.candidateEmail,
          filledDate: new Date(),
        })
        .where(eq(positionRequisitions.id, input.id));

      return { success: true };
    }),

  // Get statistics
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0, filled: 0 };

    const requisitions = await db.select().from(positionRequisitions);

    return {
      total: requisitions.length,
      submitted: requisitions.filter(r => r.status === "submitted").length,
      underReview: requisitions.filter(r => r.status === "under_review").length,
      approved: requisitions.filter(r => r.status === "approved").length,
      rejected: requisitions.filter(r => r.status === "rejected").length,
      filled: requisitions.filter(r => r.status === "filled").length,
    };
  }),
});
