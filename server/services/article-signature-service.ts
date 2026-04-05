import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { 
  articles, 
  articleAssignments, 
  articleReadingProgress,
  signatureRequestSigners,
  signatureRequests,
  signatures,
  users
} from "../../drizzle/schema";
import { eq, desc, and, or, gte, lte, sql, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const articleSignatureRouter = router({
  // ============================================================================
  // ARTICLES
  // ============================================================================
  
  listArticles: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "published", "archived"]).optional(),
      category: z.string().optional(),
      isRequired: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const conditions = [];
      
      if (input?.status) {
        conditions.push(eq(articles.status, input.status));
      }
      if (input?.category) {
        conditions.push(eq(articles.category, input.category));
      }
      if (input?.isRequired !== undefined) {
        conditions.push(eq(articles.isRequired, input.isRequired));
      }
      
      const result = await db
        .select()
        .from(articles)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(articles.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);
      
      return result;
    }),
  
  getArticle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [article] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, input.id));
      
      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      }
      
      return article;
    }),
  
  createArticle: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      slug: z.string().min(1).max(255),
      content: z.string().min(1),
      summary: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      entityId: z.number().optional(),
      isRequired: z.boolean().default(false),
      requiredForRoles: z.array(z.string()).optional(),
      requiredForDepartments: z.array(z.string()).optional(),
      dueDate: z.date().optional(),
      estimatedReadTime: z.number().optional(),
      attachments: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await db.insert(articles).values({
        ...input,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        requiredForRoles: input.requiredForRoles ? JSON.stringify(input.requiredForRoles) : null,
        requiredForDepartments: input.requiredForDepartments ? JSON.stringify(input.requiredForDepartments) : null,
        attachments: input.attachments ? JSON.stringify(input.attachments) : null,
        createdBy: ctx.user.id,
        status: "draft",
      });
      
      return { id: result.insertId };
    }),
  
  publishArticle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(articles)
        .set({
          status: "published",
          publishedAt: new Date(),
          publishedBy: ctx.user.id,
        })
        .where(eq(articles.id, input.id));
      
      return { success: true };
    }),
  
  // ============================================================================
  // ARTICLE ASSIGNMENTS
  // ============================================================================
  
  assignArticle: protectedProcedure
    .input(z.object({
      articleId: z.number(),
      assignedToUserIds: z.array(z.number()),
      priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
      dueDate: z.date().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const assignments = input.assignedToUserIds.map(userId => ({
        articleId: input.articleId,
        assignedToUserId: userId,
        assignedByUserId: ctx.user.id,
        priority: input.priority,
        dueDate: input.dueDate,
        message: input.message,
        status: "pending" as const,
      }));
      
      await db.insert(articleAssignments).values(assignments);
      
      return { success: true, count: assignments.length };
    }),
  
  getMyAssignedArticles: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "in_progress", "completed", "overdue"]).optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const conditions = [eq(articleAssignments.assignedToUserId, ctx.user.id)];
      
      if (input?.status) {
        conditions.push(eq(articleAssignments.status, input.status));
      }
      
      const result = await db
        .select({
          assignment: articleAssignments,
          article: articles,
        })
        .from(articleAssignments)
        .innerJoin(articles, eq(articleAssignments.articleId, articles.id))
        .where(and(...conditions))
        .orderBy(desc(articleAssignments.createdAt));
      
      return result;
    }),
  
  markArticleRead: protectedProcedure
    .input(z.object({
      articleId: z.number(),
      assignmentId: z.number().optional(),
      acknowledgmentNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Update reading progress
      const existingProgress = await db
        .select()
        .from(articleReadingProgress)
        .where(and(
          eq(articleReadingProgress.articleId, input.articleId),
          eq(articleReadingProgress.userId, ctx.user.id)
        ));
      
      if (existingProgress.length > 0) {
        await db
          .update(articleReadingProgress)
          .set({
            isCompleted: true,
            completedAt: new Date(),
            progressPercent: 100,
          })
          .where(eq(articleReadingProgress.id, existingProgress[0].id));
      } else {
        await db.insert(articleReadingProgress).values({
          articleId: input.articleId,
          userId: ctx.user.id,
          progressPercent: 100,
          isCompleted: true,
          completedAt: new Date(),
        });
      }
      
      // Update assignment if provided
      if (input.assignmentId) {
        await db
          .update(articleAssignments)
          .set({
            status: "completed",
            completedAt: new Date(),
            acknowledged: true,
            acknowledgedAt: new Date(),
            acknowledgmentNotes: input.acknowledgmentNotes,
          })
          .where(eq(articleAssignments.id, input.assignmentId));
      }
      
      return { success: true };
    }),
  
  // ============================================================================
  // SIGNATURE ASSIGNMENTS
  // ============================================================================
  
  createSignatureRequest: protectedProcedure
    .input(z.object({
      documentId: z.number().optional(),
      documentName: z.string().min(1).max(255),
      documentType: z.string().optional(),
      documentUrl: z.string().optional(),
      title: z.string().min(1).max(255),
      message: z.string().optional(),
      priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
      dueDate: z.date().optional(),
      expiresAt: z.date().optional(),
      signers: z.array(z.object({
        userId: z.number().optional(),
        name: z.string().min(1),
        email: z.string().email(),
        role: z.string().optional(),
        signingOrder: z.number().default(1),
      })),
      requireAllSigners: z.boolean().default(true),
      signingOrder: z.enum(["any", "sequential"]).default("any"),
      allowDecline: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create the signature request
      const [requestResult] = await db.insert(signatureRequests).values({
        documentId: input.documentId || 0,
        documentType: input.documentType || "document",
        documentTitle: input.title,
        requestedBy: ctx.user.id,
        status: "pending",
        expiresAt: input.expiresAt,
      });
      
      const requestId = requestResult.insertId;
      
      // Add signers
      const signerValues = input.signers.map(signer => ({
        requestId: Number(requestId),
        userId: signer.userId,
        name: signer.name,
        email: signer.email,
        role: signer.role,
        signingOrder: signer.signingOrder,
        status: "pending" as const,
      }));
      
      await db.insert(signatureRequestSigners).values(signerValues);
      
      return { id: requestId };
    }),
  
  getMySignatureRequests: protectedProcedure
    .input(z.object({
      type: z.enum(["sent", "received"]).default("received"),
      status: z.enum(["pending", "in_progress", "completed", "expired", "cancelled"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      if (input?.type === "sent") {
        // Requests I created
        const conditions = [eq(signatureRequests.requestedBy, ctx.user.id)];
        if (input?.status) {
          conditions.push(eq(signatureRequests.status, input.status));
        }
        
        const requests = await db
          .select()
          .from(signatureRequests)
          .where(and(...conditions))
          .orderBy(desc(signatureRequests.createdAt));
        
        return requests;
      } else {
        // Requests where I'm a signer
        const signerRecords = await db
          .select({
            signer: signatureRequestSigners,
            request: signatureRequests,
          })
          .from(signatureRequestSigners)
          .innerJoin(signatureRequests, eq(signatureRequestSigners.requestId, signatureRequests.id))
          .where(eq(signatureRequestSigners.userId, ctx.user.id))
          .orderBy(desc(signatureRequests.createdAt));
        
        return signerRecords;
      }
    }),
  
  signDocument: protectedProcedure
    .input(z.object({
      signerId: z.number(),
      signatureType: z.enum(["drawn", "typed", "uploaded", "digital"]),
      signatureData: z.string(),
      ipAddress: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get signer record
      const [signer] = await db
        .select()
        .from(signatureRequestSigners)
        .where(eq(signatureRequestSigners.id, input.signerId));
      
      if (!signer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Signer record not found" });
      }
      
      if (signer.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not authorized to sign this document" });
      }
      
      // Update signer record
      await db
        .update(signatureRequestSigners)
        .set({
          status: "signed",
          signedAt: new Date(),
          signatureType: input.signatureType,
          signatureData: input.signatureData,
          ipAddress: input.ipAddress,
        })
        .where(eq(signatureRequestSigners.id, input.signerId));
      
      // Check if all signers have signed
      const allSigners = await db
        .select()
        .from(signatureRequestSigners)
        .where(eq(signatureRequestSigners.requestId, signer.requestId));
      
      const allSigned = allSigners.every(s => s.status === "signed");
      
      if (allSigned) {
        await db
          .update(signatureRequests)
          .set({
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(signatureRequests.id, signer.requestId));
      }
      
      return { success: true, allSigned };
    }),
  
  declineSignature: protectedProcedure
    .input(z.object({
      signerId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [signer] = await db
        .select()
        .from(signatureRequestSigners)
        .where(eq(signatureRequestSigners.id, input.signerId));
      
      if (!signer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Signer record not found" });
      }
      
      if (signer.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not authorized to decline this signature" });
      }
      
      await db
        .update(signatureRequestSigners)
        .set({
          status: "declined",
          declinedAt: new Date(),
          declineReason: input.reason,
        })
        .where(eq(signatureRequestSigners.id, input.signerId));
      
      // Update request status
      await db
        .update(signatureRequests)
        .set({ status: "cancelled" })
        .where(eq(signatureRequests.id, signer.requestId));
      
      return { success: true };
    }),
  
  // ============================================================================
  // USER LOOKUP FOR ASSIGNMENTS
  // ============================================================================
  
  searchUsers: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(
          or(
            sql`${users.name} LIKE ${`%${input.query}%`}`,
            sql`${users.email} LIKE ${`%${input.query}%`}`
          )
        )
        .limit(input.limit);
      
      return result;
    }),
});

export default articleSignatureRouter;
