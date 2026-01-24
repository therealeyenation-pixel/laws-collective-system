import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { 
  officeDocuments, 
  officeDocumentVersions, 
  officeDocumentCollaborators,
  officeDocumentComments,
  officeDocumentSignatures,
  officeDocumentTemplates,
  pdfOperations
} from "../../drizzle/schema";
import { eq, desc, and, or, like, sql, inArray } from "drizzle-orm";

export const officeSuiteRouter = router({
  // ==================== DOCUMENTS ====================
  
  // Create a new document
  createDocument: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      documentType: z.enum(["document", "spreadsheet", "presentation", "pdf", "form", "template", "contract", "report", "other"]),
      content: z.string().optional(),
      entityType: z.string().optional(),
      entityId: z.number().optional(),
      department: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      templateId: z.number().optional(),
      requiresSignature: z.boolean().optional(),
      requiredSignatures: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [doc] = await db.insert(officeDocuments).values({
        title: input.title,
        description: input.description,
        documentType: input.documentType,
        content: input.content,
        entityType: input.entityType,
        entityId: input.entityId,
        department: input.department,
        category: input.category,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        templateId: input.templateId,
        requiresSignature: input.requiresSignature ?? false,
        requiredSignatures: input.requiredSignatures ?? 0,
        createdBy: ctx.user.id,
        ownerId: ctx.user.id,
        status: "draft",
      });
      
      return { id: doc.insertId };
    }),

  // Get documents list
  getDocuments: protectedProcedure
    .input(z.object({
      documentType: z.string().optional(),
      status: z.string().optional(),
      department: z.string().optional(),
      category: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [
        or(
          eq(officeDocuments.ownerId, ctx.user.id),
          eq(officeDocuments.createdBy, ctx.user.id)
        )
      ];
      
      if (input.documentType) {
        conditions.push(eq(officeDocuments.documentType, input.documentType as any));
      }
      if (input.status) {
        conditions.push(eq(officeDocuments.status, input.status as any));
      }
      if (input.department) {
        conditions.push(eq(officeDocuments.department, input.department));
      }
      if (input.category) {
        conditions.push(eq(officeDocuments.category, input.category));
      }
      if (input.search) {
        conditions.push(like(officeDocuments.title, `%${input.search}%`));
      }
      
      const docs = await db.select()
        .from(officeDocuments)
        .where(and(...conditions))
        .orderBy(desc(officeDocuments.updatedAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return docs;
    }),

  // Get single document
  getDocument: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [doc] = await db.select()
        .from(officeDocuments)
        .where(eq(officeDocuments.id, input.id));
      
      if (!doc) {
        throw new Error("Document not found");
      }
      
      // Get versions
      const versions = await db.select()
        .from(officeDocumentVersions)
        .where(eq(officeDocumentVersions.documentId, input.id))
        .orderBy(desc(officeDocumentVersions.versionNumber));
      
      // Get collaborators
      const collaborators = await db.select()
        .from(officeDocumentCollaborators)
        .where(eq(officeDocumentCollaborators.documentId, input.id));
      
      // Get signatures
      const signatures = await db.select()
        .from(officeDocumentSignatures)
        .where(eq(officeDocumentSignatures.documentId, input.id));
      
      return { ...doc, versions, collaborators, signatures };
    }),

  // Update document
  updateDocument: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(["draft", "in_review", "pending_signature", "signed", "final", "archived", "deleted"]).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      createVersion: z.boolean().default(false),
      changeDescription: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [doc] = await db.select()
        .from(officeDocuments)
        .where(eq(officeDocuments.id, input.id));
      
      if (!doc) {
        throw new Error("Document not found");
      }
      
      // Create version if requested
      if (input.createVersion && input.content) {
        const [lastVersion] = await db.select()
          .from(officeDocumentVersions)
          .where(eq(officeDocumentVersions.documentId, input.id))
          .orderBy(desc(officeDocumentVersions.versionNumber))
          .limit(1);
        
        const newVersionNumber = (lastVersion?.versionNumber ?? 0) + 1;
        
        await db.insert(officeDocumentVersions).values({
          documentId: input.id,
          versionNumber: newVersionNumber,
          content: doc.content,
          fileKey: doc.fileKey,
          fileUrl: doc.fileUrl,
          title: doc.title,
          status: doc.status,
          changeDescription: input.changeDescription,
          changedBy: ctx.user.id,
        });
      }
      
      // Update document
      await db.update(officeDocuments)
        .set({
          ...(input.title && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.content && { content: input.content }),
          ...(input.status && { status: input.status }),
          ...(input.category && { category: input.category }),
          ...(input.tags && { tags: JSON.stringify(input.tags) }),
          ...(input.status === "final" && { finalizedAt: new Date() }),
          ...(input.status === "archived" && { archivedAt: new Date() }),
        })
        .where(eq(officeDocuments.id, input.id));
      
      return { success: true };
    }),

  // Delete document
  deleteDocument: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.update(officeDocuments)
        .set({ status: "deleted" })
        .where(eq(officeDocuments.id, input.id));
      
      return { success: true };
    }),

  // ==================== COLLABORATORS ====================
  
  // Add collaborator
  addCollaborator: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      userId: z.number(),
      canView: z.boolean().default(true),
      canEdit: z.boolean().default(false),
      canComment: z.boolean().default(true),
      canShare: z.boolean().default(false),
      canSign: z.boolean().default(false),
      canDelete: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.insert(officeDocumentCollaborators).values({
        documentId: input.documentId,
        userId: input.userId,
        canView: input.canView,
        canEdit: input.canEdit,
        canComment: input.canComment,
        canShare: input.canShare,
        canSign: input.canSign,
        canDelete: input.canDelete,
        invitedBy: ctx.user.id,
      });
      
      return { success: true };
    }),

  // Remove collaborator
  removeCollaborator: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.delete(officeDocumentCollaborators)
        .where(and(
          eq(officeDocumentCollaborators.documentId, input.documentId),
          eq(officeDocumentCollaborators.userId, input.userId)
        ));
      
      return { success: true };
    }),

  // ==================== COMMENTS ====================
  
  // Add comment
  addComment: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      content: z.string(),
      versionId: z.number().optional(),
      anchorType: z.string().optional(),
      anchorData: z.string().optional(),
      parentCommentId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [comment] = await db.insert(officeDocumentComments).values({
        documentId: input.documentId,
        content: input.content,
        versionId: input.versionId,
        anchorType: input.anchorType,
        anchorData: input.anchorData,
        parentCommentId: input.parentCommentId,
        authorId: ctx.user.id,
      });
      
      return { id: comment.insertId };
    }),

  // Get comments
  getComments: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const comments = await db.select()
        .from(officeDocumentComments)
        .where(eq(officeDocumentComments.documentId, input.documentId))
        .orderBy(desc(officeDocumentComments.createdAt));
      
      return comments;
    }),

  // Resolve comment
  resolveComment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.update(officeDocumentComments)
        .set({
          isResolved: true,
          resolvedBy: ctx.user.id,
          resolvedAt: new Date(),
        })
        .where(eq(officeDocumentComments.id, input.id));
      
      return { success: true };
    }),

  // ==================== SIGNATURES ====================
  
  // Request signature
  requestSignature: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      signerName: z.string(),
      signerEmail: z.string(),
      signerTitle: z.string().optional(),
      signerId: z.number().optional(),
      pageNumber: z.number().optional(),
      positionX: z.number().optional(),
      positionY: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      expiresAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [sig] = await db.insert(officeDocumentSignatures).values({
        documentId: input.documentId,
        signerName: input.signerName,
        signerEmail: input.signerEmail,
        signerTitle: input.signerTitle,
        signerId: input.signerId,
        pageNumber: input.pageNumber,
        positionX: input.positionX,
        positionY: input.positionY,
        width: input.width,
        height: input.height,
        expiresAt: input.expiresAt,
        requestedBy: ctx.user.id,
        signatureType: "drawn",
        status: "pending",
      });
      
      // Update document status
      await db.update(officeDocuments)
        .set({ status: "pending_signature" })
        .where(eq(officeDocuments.id, input.documentId));
      
      return { id: sig.insertId };
    }),

  // Sign document
  signDocument: protectedProcedure
    .input(z.object({
      signatureId: z.number(),
      signatureType: z.enum(["drawn", "typed", "uploaded"]),
      signatureData: z.string(),
      signatureImageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [sig] = await db.select()
        .from(officeDocumentSignatures)
        .where(eq(officeDocumentSignatures.id, input.signatureId));
      
      if (!sig) {
        throw new Error("Signature request not found");
      }
      
      // Update signature
      await db.update(officeDocumentSignatures)
        .set({
          signatureType: input.signatureType,
          signatureData: input.signatureData,
          signatureImageUrl: input.signatureImageUrl,
          signedAt: new Date(),
          status: "signed",
          auditTrail: JSON.stringify([{
            action: "signed",
            timestamp: new Date().toISOString(),
            userId: ctx.user.id,
          }]),
        })
        .where(eq(officeDocumentSignatures.id, input.signatureId));
      
      // Update document signature count
      await db.update(officeDocuments)
        .set({
          signatureCount: sql`${officeDocuments.signatureCount} + 1`,
        })
        .where(eq(officeDocuments.id, sig.documentId));
      
      // Check if all signatures are complete
      const [doc] = await db.select()
        .from(officeDocuments)
        .where(eq(officeDocuments.id, sig.documentId));
      
      if (doc && doc.signatureCount !== null && doc.requiredSignatures !== null && 
          doc.signatureCount + 1 >= doc.requiredSignatures) {
        await db.update(officeDocuments)
          .set({ status: "signed" })
          .where(eq(officeDocuments.id, sig.documentId));
      }
      
      return { success: true };
    }),

  // ==================== TEMPLATES ====================
  
  // Get templates
  getTemplates: protectedProcedure
    .input(z.object({
      documentType: z.string().optional(),
      category: z.string().optional(),
      department: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [
        or(
          eq(officeDocumentTemplates.isPublic, true),
          eq(officeDocumentTemplates.createdBy, ctx.user.id)
        )
      ];
      
      if (input.documentType) {
        conditions.push(eq(officeDocumentTemplates.documentType, input.documentType as any));
      }
      if (input.category) {
        conditions.push(eq(officeDocumentTemplates.category, input.category));
      }
      if (input.department) {
        conditions.push(eq(officeDocumentTemplates.department, input.department));
      }
      
      const templates = await db.select()
        .from(officeDocumentTemplates)
        .where(and(...conditions))
        .orderBy(desc(officeDocumentTemplates.usageCount));
      
      return templates;
    }),

  // Create template
  createTemplate: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      documentType: z.enum(["document", "spreadsheet", "presentation", "pdf", "form", "contract", "report"]),
      content: z.string().optional(),
      category: z.string().optional(),
      department: z.string().optional(),
      entityType: z.string().optional(),
      variables: z.array(z.object({
        name: z.string(),
        type: z.string(),
        defaultValue: z.string().optional(),
        required: z.boolean().optional(),
      })).optional(),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const [template] = await db.insert(officeDocumentTemplates).values({
        name: input.name,
        description: input.description,
        documentType: input.documentType,
        content: input.content,
        category: input.category,
        department: input.department,
        entityType: input.entityType,
        variables: input.variables ? JSON.stringify(input.variables) : null,
        isPublic: input.isPublic,
        createdBy: ctx.user.id,
      });
      
      return { id: template.insertId };
    }),

  // Create document from template
  createFromTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      title: z.string(),
      variables: z.record(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [template] = await db.select()
        .from(officeDocumentTemplates)
        .where(eq(officeDocumentTemplates.id, input.templateId));
      
      if (!template) {
        throw new Error("Template not found");
      }
      
      // Replace variables in content
      let content = template.content || "";
      if (input.variables) {
        for (const [key, value] of Object.entries(input.variables)) {
          content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
        }
      }
      
      // Create document
      const [doc] = await db.insert(officeDocuments).values({
        title: input.title,
        description: template.description,
        documentType: template.documentType as any,
        content,
        category: template.category,
        department: template.department,
        entityType: template.entityType,
        templateId: input.templateId,
        createdBy: ctx.user.id,
        ownerId: ctx.user.id,
        status: "draft",
      });
      
      // Increment template usage
      await db.update(officeDocumentTemplates)
        .set({ usageCount: sql`${officeDocumentTemplates.usageCount} + 1` })
        .where(eq(officeDocumentTemplates.id, input.templateId));
      
      return { id: doc.insertId };
    }),

  // ==================== PDF OPERATIONS ====================
  
  // Merge PDFs
  mergePdfs: protectedProcedure
    .input(z.object({
      documentIds: z.array(z.number()),
      outputTitle: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [op] = await db.insert(pdfOperations).values({
        operationType: "merge",
        inputDocumentIds: JSON.stringify(input.documentIds),
        operationParams: JSON.stringify({ outputTitle: input.outputTitle }),
        status: "pending",
        userId: ctx.user.id,
      });
      
      // In production, this would trigger a background job to merge PDFs
      // For now, mark as processing
      await db.update(pdfOperations)
        .set({ status: "processing" })
        .where(eq(pdfOperations.id, op.insertId));
      
      return { operationId: op.insertId };
    }),

  // Split PDF
  splitPdf: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      pageRanges: z.array(z.object({
        start: z.number(),
        end: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const [op] = await db.insert(pdfOperations).values({
        operationType: "split",
        inputDocumentIds: JSON.stringify([input.documentId]),
        operationParams: JSON.stringify({ pageRanges: input.pageRanges }),
        status: "pending",
        userId: ctx.user.id,
      });
      
      return { operationId: op.insertId };
    }),

  // Get PDF operation status
  getPdfOperationStatus: protectedProcedure
    .input(z.object({ operationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [op] = await db.select()
        .from(pdfOperations)
        .where(eq(pdfOperations.id, input.operationId));
      
      return op;
    }),

  // ==================== STATS ====================
  
  // Get document stats
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [stats] = await db.select({
        total: sql<number>`COUNT(*)`,
        drafts: sql<number>`SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END)`,
        pendingSignature: sql<number>`SUM(CASE WHEN status = 'pending_signature' THEN 1 ELSE 0 END)`,
        signed: sql<number>`SUM(CASE WHEN status = 'signed' THEN 1 ELSE 0 END)`,
        final: sql<number>`SUM(CASE WHEN status = 'final' THEN 1 ELSE 0 END)`,
      })
        .from(officeDocuments)
        .where(or(
          eq(officeDocuments.ownerId, ctx.user.id),
          eq(officeDocuments.createdBy, ctx.user.id)
        ));
      
      return stats;
    }),
});
