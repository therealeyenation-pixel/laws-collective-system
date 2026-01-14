import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  secureDocuments, 
  documentFolders, 
  documentAccess, 
  documentVersions, 
  documentAccessLog,
  blockchainRecords 
} from "../../drizzle/schema";
import { eq, and, desc, or, isNull } from "drizzle-orm";
import crypto from "crypto";

export const documentVaultRouter = router({
  // Get all folders for the current user
  getFolders: publicProcedure
    .input(z.object({
      entityId: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        return [];
      }

      const conditions = [eq(documentFolders.ownerId, userId)];
      if (input?.entityId) {
        conditions.push(eq(documentFolders.entityId, input.entityId));
      }

      const folders = await db
        .select()
        .from(documentFolders)
        .where(and(...conditions))
        .orderBy(documentFolders.name);

      return folders;
    }),

  // Create a new folder
  createFolder: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      entityId: z.number().optional(),
      parentFolderId: z.number().optional(),
      color: z.string().max(20).optional(),
      icon: z.string().max(50).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        throw new Error("Authentication required");
      }

      const result = await db.insert(documentFolders).values({
        ownerId: userId,
        name: input.name,
        description: input.description,
        entityId: input.entityId,
        parentFolderId: input.parentFolderId,
        color: input.color || "#6B7280",
        icon: input.icon || "folder",
        accessLevel: "owner_only",
      });

      return { success: true, folderId: result[0].insertId };
    }),

  // Get documents with access control
  getDocuments: publicProcedure
    .input(z.object({
      folderId: z.number().optional(),
      entityId: z.number().optional(),
      documentType: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        return [];
      }

      // Get documents owned by user or with explicit access
      const ownedDocs = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.ownerId, userId),
            input?.folderId ? eq(secureDocuments.folderId, input.folderId) : isNull(secureDocuments.folderId),
            input?.entityId ? eq(secureDocuments.entityId, input.entityId) : undefined,
            input?.documentType ? eq(secureDocuments.documentType, input.documentType as any) : undefined
          )
        )
        .orderBy(desc(secureDocuments.updatedAt));

      return ownedDocs;
    }),

  // Get a single document with access check
  getDocument: publicProcedure
    .input(z.object({
      documentId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        throw new Error("Authentication required");
      }

      const [doc] = await db
        .select()
        .from(secureDocuments)
        .where(eq(secureDocuments.id, input.documentId))
        .limit(1);

      if (!doc) {
        throw new Error("Document not found");
      }

      // Check access
      if (doc.ownerId !== userId && doc.accessLevel === "owner_only") {
        // Check for explicit access grant
        const [access] = await db
          .select()
          .from(documentAccess)
          .where(
            and(
              eq(documentAccess.documentId, input.documentId),
              eq(documentAccess.userId, userId)
            )
          )
          .limit(1);

        if (!access) {
          throw new Error("Access denied");
        }
      }

      // Log access
      await db.insert(documentAccessLog).values({
        documentId: input.documentId,
        userId: userId,
        action: "view",
      });

      return doc;
    }),

  // Create a new document
  createDocument: publicProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      documentType: z.enum([
        "business_plan", 
        "grant_application", 
        "financial_statement", 
        "legal_document", 
        "contract", 
        "certificate",
        "report",
        "template",
        "other"
      ]),
      content: z.string().optional(),
      entityId: z.number().optional(),
      folderId: z.number().optional(),
      status: z.enum(["draft", "final", "archived"]).default("draft"),
      accessLevel: z.enum(["owner_only", "entity_members", "authorized_users", "public"]).default("owner_only"),
      isTemplate: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        throw new Error("Authentication required");
      }

      // Generate blockchain hash for the content
      const contentHash = input.content 
        ? crypto.createHash("sha256").update(input.content).digest("hex")
        : null;

      const result = await db.insert(secureDocuments).values({
        ownerId: userId,
        title: input.title,
        description: input.description,
        documentType: input.documentType,
        content: input.content,
        entityId: input.entityId,
        folderId: input.folderId,
        status: input.status,
        accessLevel: input.accessLevel,
        isTemplate: input.isTemplate,
        blockchainHash: contentHash,
        version: 1,
      });

      const documentId = result[0].insertId;

      // Log to blockchain if content exists
      if (contentHash) {
        await db.insert(blockchainRecords).values({
          recordType: "certificate",
          referenceId: documentId,
          blockchainHash: contentHash,
          data: {
            title: input.title,
            documentType: input.documentType,
            createdBy: userId,
          },
        });
      }

      return { success: true, documentId };
    }),

  // Update a document
  updateDocument: publicProcedure
    .input(z.object({
      documentId: z.number(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(["draft", "final", "archived"]).optional(),
      accessLevel: z.enum(["owner_only", "entity_members", "authorized_users", "public"]).optional(),
      changeNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        throw new Error("Authentication required");
      }

      // Get current document
      const [doc] = await db
        .select()
        .from(secureDocuments)
        .where(eq(secureDocuments.id, input.documentId))
        .limit(1);

      if (!doc) {
        throw new Error("Document not found");
      }

      if (doc.ownerId !== userId) {
        throw new Error("Only the owner can edit this document");
      }

      // Save current version to history
      await db.insert(documentVersions).values({
        documentId: input.documentId,
        version: doc.version,
        content: doc.content,
        fileUrl: doc.fileUrl,
        changeNotes: input.changeNotes || "Updated document",
        createdBy: userId,
        blockchainHash: doc.blockchainHash,
      });

      // Generate new hash if content changed
      const newHash = input.content 
        ? crypto.createHash("sha256").update(input.content).digest("hex")
        : doc.blockchainHash;

      // Update document
      await db
        .update(secureDocuments)
        .set({
          title: input.title || doc.title,
          description: input.description !== undefined ? input.description : doc.description,
          content: input.content !== undefined ? input.content : doc.content,
          status: input.status || doc.status,
          accessLevel: input.accessLevel || doc.accessLevel,
          version: doc.version + 1,
          blockchainHash: newHash,
        })
        .where(eq(secureDocuments.id, input.documentId));

      // Log to blockchain
      if (input.content && newHash && newHash !== doc.blockchainHash) {
        await db.insert(blockchainRecords).values({
          recordType: "transaction",
          referenceId: input.documentId,
          blockchainHash: newHash,
          data: {
            previousVersion: doc.version,
            newVersion: doc.version + 1,
            updatedBy: userId,
          },
        });
      }

      // Log access
      await db.insert(documentAccessLog).values({
        documentId: input.documentId,
        userId: userId,
        action: "edit",
      });

      return { success: true, version: doc.version + 1 };
    }),

  // Get document version history
  getVersionHistory: publicProcedure
    .input(z.object({
      documentId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        throw new Error("Authentication required");
      }

      // Verify access
      const [doc] = await db
        .select()
        .from(secureDocuments)
        .where(eq(secureDocuments.id, input.documentId))
        .limit(1);

      if (!doc || doc.ownerId !== userId) {
        throw new Error("Access denied");
      }

      const versions = await db
        .select()
        .from(documentVersions)
        .where(eq(documentVersions.documentId, input.documentId))
        .orderBy(desc(documentVersions.version));

      return versions;
    }),

  // Grant access to a document
  grantAccess: publicProcedure
    .input(z.object({
      documentId: z.number(),
      userId: z.number().optional(),
      entityId: z.number().optional(),
      role: z.enum(["viewer", "editor", "admin"]).default("viewer"),
      canDownload: z.boolean().default(true),
      canShare: z.boolean().default(false),
      expiresAt: z.string().optional(), // ISO date string
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const granterId = ctx.user?.id;
      
      if (!granterId) {
        throw new Error("Authentication required");
      }

      // Verify ownership
      const [doc] = await db
        .select()
        .from(secureDocuments)
        .where(eq(secureDocuments.id, input.documentId))
        .limit(1);

      if (!doc || doc.ownerId !== granterId) {
        throw new Error("Only the owner can grant access");
      }

      await db.insert(documentAccess).values({
        documentId: input.documentId,
        userId: input.userId,
        entityId: input.entityId,
        role: input.role,
        canDownload: input.canDownload,
        canShare: input.canShare,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        grantedBy: granterId,
      });

      return { success: true };
    }),

  // Get access log for a document
  getAccessLog: publicProcedure
    .input(z.object({
      documentId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        throw new Error("Authentication required");
      }

      // Verify ownership
      const [doc] = await db
        .select()
        .from(secureDocuments)
        .where(eq(secureDocuments.id, input.documentId))
        .limit(1);

      if (!doc || doc.ownerId !== userId) {
        throw new Error("Only the owner can view access logs");
      }

      const logs = await db
        .select()
        .from(documentAccessLog)
        .where(eq(documentAccessLog.documentId, input.documentId))
        .orderBy(desc(documentAccessLog.createdAt))
        .limit(100);

      return logs;
    }),

  // Delete a document (soft delete - archive)
  deleteDocument: publicProcedure
    .input(z.object({
      documentId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        throw new Error("Authentication required");
      }

      // Verify ownership
      const [doc] = await db
        .select()
        .from(secureDocuments)
        .where(eq(secureDocuments.id, input.documentId))
        .limit(1);

      if (!doc || doc.ownerId !== userId) {
        throw new Error("Only the owner can delete this document");
      }

      // Soft delete by archiving
      await db
        .update(secureDocuments)
        .set({ status: "archived" })
        .where(eq(secureDocuments.id, input.documentId));

      // Log access
      await db.insert(documentAccessLog).values({
        documentId: input.documentId,
        userId: userId,
        action: "delete",
      });

      return { success: true };
    }),

  // Get documents by entity
  getEntityDocuments: publicProcedure
    .input(z.object({
      entityId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        return [];
      }

      const docs = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.entityId, input.entityId),
            or(
              eq(secureDocuments.ownerId, userId),
              eq(secureDocuments.accessLevel, "entity_members"),
              eq(secureDocuments.accessLevel, "public")
            )
          )
        )
        .orderBy(desc(secureDocuments.updatedAt));

      return docs;
    }),

  // Get document statistics
  getStats: publicProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return {
        totalDocuments: 0,
        totalFolders: 0,
        byType: {},
        byStatus: {},
      };
      const userId = ctx.user?.id;
      
      if (!userId) {
        return {
          totalDocuments: 0,
          totalFolders: 0,
          byType: {},
          byStatus: {},
        };
      }

      const docs = await db
        .select()
        .from(secureDocuments)
        .where(eq(secureDocuments.ownerId, userId));

      const folders = await db
        .select()
        .from(documentFolders)
        .where(eq(documentFolders.ownerId, userId));

      const byType: Record<string, number> = {};
      const byStatus: Record<string, number> = {};

      docs.forEach(doc => {
        byType[doc.documentType] = (byType[doc.documentType] || 0) + 1;
        byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;
      });

      return {
        totalDocuments: docs.length,
        totalFolders: folders.length,
        byType,
        byStatus,
      };
    }),
});
