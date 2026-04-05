import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  splitChangeRequests,
  splitChangeRequestComments,
  splitConfigurationHistory,
  houses,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

export const splitChangeRequestsRouter = router({
  // Create a new split change request
  create: protectedProcedure
    .input(z.object({
      houseId: z.string(),
      houseName: z.string(),
      proposedInterHouseSplit: z.number().min(1).max(99),
      proposedIntraHouseSplit: z.number().min(1).max(99),
      justification: z.string().min(50),
      effectiveDate: z.string(),
      expirationDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      const userName = ctx.user?.name || "Unknown User";
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get current house configuration (default to standard splits)
      const currentInterHouse = 60;
      const currentIntraHouse = 70;

      // Calculate estimated impact
      const sampleAmount = 10000;
      const currentHouseShare = sampleAmount * (currentInterHouse / 100);
      const proposedHouseShare = sampleAmount * (input.proposedInterHouseSplit / 100);
      const estimatedImpact = {
        sampleAmount,
        currentHouseShare,
        proposedHouseShare,
        difference: proposedHouseShare - currentHouseShare,
        percentageChange: ((proposedHouseShare - currentHouseShare) / currentHouseShare * 100).toFixed(2),
      };

      const result = await db.insert(splitChangeRequests).values({
        houseId: input.houseId,
        houseName: input.houseName,
        requesterId: userId,
        requesterName: userName,
        currentInterHouseSplit: currentInterHouse,
        currentIntraHouseSplit: currentIntraHouse,
        proposedInterHouseSplit: input.proposedInterHouseSplit,
        proposedIntraHouseSplit: input.proposedIntraHouseSplit,
        justification: input.justification,
        effectiveDate: new Date(input.effectiveDate),
        expirationDate: input.expirationDate ? new Date(input.expirationDate) : null,
        estimatedImpact: JSON.stringify(estimatedImpact),
        status: "pending_review",
      });

      return {
        requestId: result.insertId,
        status: "pending_review",
        estimatedImpact,
      };
    }),

  // List all split change requests for a house
  list: protectedProcedure
    .input(z.object({
      houseId: z.string().optional(),
      status: z.enum([
        "draft", "pending_review", "under_review", "approved",
        "rejected", "implemented", "expired", "reverted"
      ]).optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      let query = db.select().from(splitChangeRequests).orderBy(desc(splitChangeRequests.createdAt));

      const requests = await query.limit(input?.limit || 50);

      return requests.map(req => ({
        ...req,
        estimatedImpact: req.estimatedImpact ? JSON.parse(req.estimatedImpact as string) : null,
        affectedAccounts: req.affectedAccounts ? JSON.parse(req.affectedAccounts as string) : null,
      }));
    }),

  // Get a specific request with comments
  getById: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const request = await db.select()
        .from(splitChangeRequests)
        .where(eq(splitChangeRequests.id, input.requestId))
        .limit(1);

      if (!request.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
      }

      const comments = await db.select()
        .from(splitChangeRequestComments)
        .where(eq(splitChangeRequestComments.requestId, input.requestId))
        .orderBy(desc(splitChangeRequestComments.createdAt));

      return {
        ...request[0],
        estimatedImpact: request[0].estimatedImpact ? JSON.parse(request[0].estimatedImpact as string) : null,
        affectedAccounts: request[0].affectedAccounts ? JSON.parse(request[0].affectedAccounts as string) : null,
        comments,
      };
    }),

  // Add a comment to a request
  addComment: protectedProcedure
    .input(z.object({
      requestId: z.number(),
      comment: z.string().min(1),
      commentType: z.enum([
        "question", "clarification", "approval_note",
        "rejection_reason", "revision_request", "general"
      ]).default("general"),
      isInternal: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      const userName = ctx.user?.name || "Unknown User";
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db.insert(splitChangeRequestComments).values({
        requestId: input.requestId,
        userId,
        userName,
        comment: input.comment,
        commentType: input.commentType,
        isInternal: input.isInternal,
      });

      return { success: true };
    }),

  // Review a request (approve/reject)
  review: protectedProcedure
    .input(z.object({
      requestId: z.number(),
      action: z.enum(["approve", "reject", "request_revision"]),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      const userName = ctx.user?.name || "Unknown User";
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const newStatus = input.action === "approve" ? "approved" :
                       input.action === "reject" ? "rejected" : "pending_review";

      await db.update(splitChangeRequests)
        .set({
          status: newStatus,
          reviewerId: userId,
          reviewerName: userName,
          reviewedAt: new Date(),
          reviewNotes: input.reviewNotes,
        })
        .where(eq(splitChangeRequests.id, input.requestId));

      // Add review comment
      await db.insert(splitChangeRequestComments).values({
        requestId: input.requestId,
        userId,
        userName,
        comment: `Request ${input.action}ed. ${input.reviewNotes || ''}`,
        commentType: input.action === "approve" ? "approval_note" :
                    input.action === "reject" ? "rejection_reason" : "revision_request",
        isInternal: false,
      });

      return { success: true, newStatus };
    }),

  // Implement an approved request
  implement: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      const userName = ctx.user?.name || "Unknown User";
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get the request
      const request = await db.select()
        .from(splitChangeRequests)
        .where(eq(splitChangeRequests.id, input.requestId))
        .limit(1);

      if (!request.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
      }

      if (request[0].status !== "approved") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Request must be approved before implementation" });
      }

      // Generate blockchain hash
      const blockchainHash = crypto.createHash("sha256")
        .update(`${request[0].houseId}-${request[0].proposedInterHouseSplit}-${request[0].proposedIntraHouseSplit}-${Date.now()}`)
        .digest("hex");

      // Update request status
      await db.update(splitChangeRequests)
        .set({
          status: "implemented",
          implementedAt: new Date(),
          implementedBy: userId,
          blockchainHash,
        })
        .where(eq(splitChangeRequests.id, input.requestId));

      // Close previous configuration
      await db.update(splitConfigurationHistory)
        .set({ effectiveTo: new Date() })
        .where(and(
          eq(splitConfigurationHistory.houseId, request[0].houseId),
          eq(splitConfigurationHistory.effectiveTo, null as any)
        ));

      // Record new configuration in history
      await db.insert(splitConfigurationHistory).values({
        houseId: request[0].houseId,
        houseName: request[0].houseName,
        interHouseSplit: request[0].proposedInterHouseSplit,
        intraHouseSplit: request[0].proposedIntraHouseSplit,
        changeType: "approved_request",
        changeRequestId: input.requestId,
        changedBy: userId,
        changedByName: userName,
        changeReason: request[0].justification,
        effectiveFrom: request[0].effectiveDate,
        blockchainHash,
      });

      return {
        success: true,
        blockchainHash,
        newConfiguration: {
          interHouseSplit: request[0].proposedInterHouseSplit,
          intraHouseSplit: request[0].proposedIntraHouseSplit,
        },
      };
    }),

  // Get configuration history for a house
  getHistory: protectedProcedure
    .input(z.object({ houseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const history = await db.select()
        .from(splitConfigurationHistory)
        .where(eq(splitConfigurationHistory.houseId, input.houseId))
        .orderBy(desc(splitConfigurationHistory.effectiveFrom));

      return history;
    }),

  // Get current configuration for a house
  getCurrentConfig: protectedProcedure
    .input(z.object({ houseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const current = await db.select()
        .from(splitConfigurationHistory)
        .where(and(
          eq(splitConfigurationHistory.houseId, input.houseId),
          eq(splitConfigurationHistory.effectiveTo, null as any)
        ))
        .limit(1);

      if (current.length) {
        return current[0];
      }

      // Return default configuration if no history exists
      return {
        houseId: input.houseId,
        interHouseSplit: 60,
        intraHouseSplit: 70,
        changeType: "system_default" as const,
        effectiveFrom: new Date(),
      };
    }),
});
