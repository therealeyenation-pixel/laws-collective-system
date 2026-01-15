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

  // Seed default documents (business plans and grant applications)
  seedDocuments: publicProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        throw new Error("Authentication required");
      }

      // Check if documents already exist for this user
      const existingDocs = await db
        .select()
        .from(secureDocuments)
        .where(eq(secureDocuments.ownerId, userId))
        .limit(1);

      if (existingDocs.length > 0) {
        return { success: true, message: "Documents already exist", count: 0 };
      }

      const defaultDocuments = [
        {
          title: "98 Trust Business Plan",
          description: "Comprehensive business plan for the 98 Trust, establishing the foundation for multi-generational wealth preservation and sovereign governance.",
          documentType: "business_plan" as const,
          content: `# 98 Trust Business Plan\n\n## Executive Summary\nThe 98 Trust serves as the sovereign foundation for multi-generational wealth preservation, governance, and legacy protection.\n\n## Mission\nTo establish and maintain a perpetual trust structure that protects family assets, ensures proper succession, and creates lasting generational wealth.\n\n## Key Objectives\n- Establish sovereign trust governance\n- Protect family assets across generations\n- Create sustainable wealth distribution mechanisms\n- Maintain legal compliance while maximizing protection\n\n## Structure\n- Trust Type: Irrevocable Family Trust\n- Governance: Board of Trustees\n- Distribution: 40/30/20/10 allocation model`,
          status: "final" as const,
          accessLevel: "owner_only" as const,
        },
        {
          title: "LuvOnPurpose Autonomous Wealth System, LLC Business Plan",
          description: "Business plan for the autonomous wealth generation platform that powers the LuvOnPurpose ecosystem.",
          documentType: "business_plan" as const,
          content: `# LuvOnPurpose Autonomous Wealth System, LLC\n\n## Vision\nTo create an autonomous, self-sustaining wealth generation system that operates 24/7 to build generational prosperity.\n\n## Core Components\n- Autonomous Decision Engine\n- Token Economy Management\n- Multi-Entity Coordination\n- Blockchain Verification\n\n## Revenue Streams\n- Platform licensing\n- Token transaction fees\n- Educational services\n- Consulting services\n\n## Technology Stack\n- AI-powered decision making\n- Blockchain verification\n- Real-time analytics\n- Secure document management`,
          status: "final" as const,
          accessLevel: "owner_only" as const,
        },
        {
          title: "The L.A.W.S. Collective LLC Business Plan",
          description: "Business plan for the community-focused collective helping people reconnect with land, strengthen identity, and build practical skills.",
          documentType: "business_plan" as const,
          content: `# The L.A.W.S. Collective LLC\n\n## Framework\n- LAND: Reconnection & Stability\n- AIR: Education & Knowledge\n- WATER: Healing & Balance\n- SELF: Purpose & Skills\n\n## Mission\nA community-focused framework helping people reconnect with land, strengthen identity, restore balance, and build practical skills for generational wealth.\n\n## Programs\n- Land stewardship education\n- Financial literacy workshops\n- Healing and wellness circles\n- Skills development training\n\n## Impact Goals\n- 1,000 families served annually\n- 100 acres of community land\n- 50 certified practitioners`,
          status: "final" as const,
          accessLevel: "owner_only" as const,
        },
        {
          title: "Real-Eye-Nation Business Plan",
          description: "Media and narrative platform for truth documentation and community storytelling.",
          documentType: "business_plan" as const,
          content: `# Real-Eye-Nation\n\n## Purpose\nTo create authentic narratives that document truth, preserve history, and amplify community voices.\n\n## Services\n- Documentary production\n- Podcast network\n- Written publications\n- Digital archive\n\n## Content Pillars\n- Historical documentation\n- Community stories\n- Educational content\n- Investigative journalism\n\n## Distribution\n- Streaming platforms\n- Social media\n- Community events\n- Educational institutions`,
          status: "final" as const,
          accessLevel: "owner_only" as const,
        },
        {
          title: "508-LuvOnPurpose Academy and Outreach Business Plan",
          description: "Educational institution providing Divine STEM curriculum and community outreach programs.",
          documentType: "business_plan" as const,
          content: `# 508-LuvOnPurpose Academy and Outreach\n\n## Educational Philosophy\nIntegrating traditional wisdom with modern STEM education through the Divine STEM curriculum.\n\n## Programs\n- House of Wonder (Ages 5-8)\n- House of Form (Ages 9-12)\n- House of Mastery (Ages 13+)\n- House of Many Tongues (Language)\n\n## Curriculum Areas\n- Science of Origin\n- Sacred Geometry\n- Ancestral Mathematics\n- Nature's Patterns\n\n## Outreach\n- Community workshops\n- Summer programs\n- Parent education\n- Teacher training`,
          status: "final" as const,
          accessLevel: "owner_only" as const,
        },
        {
          title: "Grant Application Template - Community Education Program",
          description: "Template for grant applications focused on community education and development initiatives.",
          documentType: "grant_application" as const,
          content: `# Grant Application Template\n\n## Organization Information\n- Organization Name: [Your Organization]\n- EIN: [Tax ID]\n- Contact: [Primary Contact]\n\n## Project Summary\n[Brief description of the proposed project]\n\n## Need Statement\n[Describe the community need this project addresses]\n\n## Goals & Objectives\n1. [Goal 1]\n2. [Goal 2]\n3. [Goal 3]\n\n## Budget\n- Personnel: $\n- Materials: $\n- Operations: $\n- Total: $\n\n## Timeline\n- Phase 1: [Dates]\n- Phase 2: [Dates]\n- Phase 3: [Dates]\n\n## Evaluation\n[How will success be measured?]`,
          status: "final" as const,
          accessLevel: "owner_only" as const,
          isTemplate: true,
        },
      ];

      let count = 0;
      for (const doc of defaultDocuments) {
        const contentHash = crypto.createHash("sha256").update(doc.content).digest("hex");
        
        await db.insert(secureDocuments).values({
          ownerId: userId,
          title: doc.title,
          description: doc.description,
          documentType: doc.documentType,
          content: doc.content,
          status: doc.status,
          accessLevel: doc.accessLevel,
          isTemplate: doc.isTemplate || false,
          blockchainHash: contentHash,
          version: 1,
        });
        count++;
      }

      return { success: true, message: `Created ${count} documents`, count };
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
