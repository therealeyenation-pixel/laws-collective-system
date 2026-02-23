import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { ENV } from "../_core/env";
import { secureDocuments, blockchainRecords } from "../../drizzle/schema";
import { eq, and, desc, or, inArray } from "drizzle-orm";
import { storagePut, storageGet } from "../storage";
import crypto from "crypto";

// Document categories for grant applications
const GRANT_DOCUMENT_CATEGORIES = [
  "budget",
  "staffing",
  "equipment",
  "letters_of_support",
  "legal",
  "financial_statements",
  "program_narrative",
  "evaluation_plan",
  "timeline",
  "certificates",
  "other"
] as const;

// Entity IDs for the ecosystem
const ENTITY_IDS: Record<string, string> = {
  "real_eye_nation": "Real-Eye-Nation LLC",
  "laws_collective": "The L.A.W.S. Collective LLC",
  "luvonpurpose_wealth": "LuvOnPurpose Autonomous Wealth System LLC",
  "academy": "LuvOnPurpose Outreach Temple and Academy Society Inc.",
  "trust_98": "98 Trust - CALEA Freeman Family Trust"
};

// Document requirements by category with expiration settings
const DOCUMENT_REQUIREMENTS: Record<string, {
  description: string;
  required: boolean;
  formats: string[];
  maxSize: number; // in MB
  expiresAfterMonths?: number; // How many months until document expires (null = never expires)
  expirationWarningDays?: number; // Days before expiration to show warning
}> = {
  budget: {
    description: "Detailed budget breakdown with line items",
    required: true,
    formats: ["pdf", "xlsx", "docx"],
    maxSize: 10,
    expiresAfterMonths: 12, // Annual budget updates
    expirationWarningDays: 30
  },
  staffing: {
    description: "Organizational chart and staffing plan",
    required: true,
    formats: ["pdf", "docx", "png", "jpg"],
    maxSize: 10,
    expiresAfterMonths: 12, // Annual org chart updates
    expirationWarningDays: 30
  },
  equipment: {
    description: "Capital equipment list with costs",
    required: false,
    formats: ["pdf", "xlsx", "docx"],
    maxSize: 10
    // No expiration - equipment lists updated as needed
  },
  letters_of_support: {
    description: "Letters from partners, community members, or officials",
    required: true,
    formats: ["pdf"],
    maxSize: 5,
    expiresAfterMonths: 24, // Letters typically valid for 2 years
    expirationWarningDays: 60
  },
  legal: {
    description: "Articles of incorporation, bylaws, operating agreements",
    required: true,
    formats: ["pdf"],
    maxSize: 10
    // No expiration - legal docs don't expire unless amended
  },
  financial_statements: {
    description: "Audited financials, 990s, bank statements",
    required: true,
    formats: ["pdf"],
    maxSize: 20,
    expiresAfterMonths: 12, // Annual financial statements
    expirationWarningDays: 45
  },
  program_narrative: {
    description: "Detailed program description and methodology",
    required: true,
    formats: ["pdf", "docx"],
    maxSize: 10,
    expiresAfterMonths: 24, // Update every 2 years
    expirationWarningDays: 30
  },
  evaluation_plan: {
    description: "Monitoring and evaluation framework",
    required: false,
    formats: ["pdf", "docx"],
    maxSize: 10,
    expiresAfterMonths: 24, // Update every 2 years
    expirationWarningDays: 30
  },
  timeline: {
    description: "Implementation timeline with milestones",
    required: true,
    formats: ["pdf", "docx", "xlsx"],
    maxSize: 5
    // No expiration - project-specific
  },
  certificates: {
    description: "Tax-exempt status, registrations, licenses",
    required: true,
    formats: ["pdf", "png", "jpg"],
    maxSize: 5,
    expiresAfterMonths: 12, // Annual renewal for most licenses
    expirationWarningDays: 60
  },
  other: {
    description: "Additional supporting documents",
    required: false,
    formats: ["pdf", "docx", "xlsx", "png", "jpg"],
    maxSize: 20
    // No default expiration - user can set manually
  }
};

export const grantDocumentsRouter = router({
  // Get document categories and requirements
  getCategories: publicProcedure
    .query(() => {
      return {
        categories: GRANT_DOCUMENT_CATEGORIES,
        requirements: DOCUMENT_REQUIREMENTS,
        entities: ENTITY_IDS
      };
    }),

  // Upload a document for grant applications
  uploadDocument: publicProcedure
    .input(z.object({
      entityId: z.string(),
      category: z.enum(GRANT_DOCUMENT_CATEGORIES),
      fileName: z.string(),
      fileData: z.string(), // Base64 encoded file data
      mimeType: z.string(),
      fileSize: z.number(),
      description: z.string().optional(),
      expiresAt: z.string().optional(), // ISO date for time-sensitive docs
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        throw new Error("Authentication required");
      }

      // Validate file size
      const maxSizeMB = DOCUMENT_REQUIREMENTS[input.category]?.maxSize || 20;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (input.fileSize > maxSizeBytes) {
        throw new Error(`File size exceeds maximum of ${maxSizeMB}MB for ${input.category} documents`);
      }

      // Validate file format
      const allowedFormats = DOCUMENT_REQUIREMENTS[input.category]?.formats || [];
      const fileExt = input.fileName.split('.').pop()?.toLowerCase() || '';
      if (allowedFormats.length > 0 && !allowedFormats.includes(fileExt)) {
        throw new Error(`File format .${fileExt} not allowed for ${input.category}. Allowed: ${allowedFormats.join(', ')}`);
      }

      // Generate unique file key for S3
      const timestamp = Date.now();
      const randomSuffix = crypto.randomBytes(8).toString('hex');
      const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const s3Key = `grant-documents/${input.entityId}/${input.category}/${timestamp}-${randomSuffix}-${sanitizedFileName}`;

      // Decode base64 and upload to S3
      const fileBuffer = Buffer.from(input.fileData, 'base64');
      const { url: s3Url } = await storagePut(s3Key, fileBuffer, input.mimeType);

      // Generate content hash for blockchain verification
      const contentHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

      // Store metadata in database
      const entityName = ENTITY_IDS[input.entityId] || input.entityId;
      
      const result = await db.insert(secureDocuments).values({
        ownerId: userId,
        title: `${input.category.replace(/_/g, ' ').toUpperCase()} - ${input.fileName}`,
        description: input.description || `${input.category} document for ${entityName}`,
        documentType: "grant_application",
        fileName: input.fileName,
        fileUrl: s3Url,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        status: "final",
        accessLevel: "owner_only",
        blockchainHash: contentHash,
        version: 1,
        metadata: {
          entityId: input.entityId,
          entityName,
          category: input.category,
          s3Key,
          expiresAt: input.expiresAt,
          uploadedAt: new Date().toISOString()
        }
      });

      const documentId = result[0].insertId;

      // Log to blockchain
      await db.insert(blockchainRecords).values({
        recordType: "certificate",
        referenceId: documentId,
        blockchainHash: contentHash,
        data: {
          type: "grant_document_upload",
          entityId: input.entityId,
          category: input.category,
          fileName: input.fileName,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      });

      return {
        success: true,
        documentId,
        s3Url,
        contentHash
      };
    }),

  // Get documents for a specific entity
  getEntityDocuments: publicProcedure
    .input(z.object({
      entityId: z.string(),
      category: z.enum(GRANT_DOCUMENT_CATEGORIES).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        return [];
      }

      // Check if user is owner
      const isOwner = ctx.user?.openId === ENV.ownerOpenId || ctx.user?.role === 'admin';

      // Get all grant documents for this entity
      const docs = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.documentType, "grant_application"),
            isOwner ? undefined : eq(secureDocuments.ownerId, userId)
          )
        )
        .orderBy(desc(secureDocuments.createdAt));

      // Filter by entityId from metadata
      const filteredDocs = docs.filter(doc => {
        const metadata = doc.metadata as any;
        if (!metadata?.entityId) return false;
        if (metadata.entityId !== input.entityId) return false;
        if (input.category && metadata.category !== input.category) return false;
        return true;
      });

      return filteredDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        status: doc.status,
        version: doc.version,
        blockchainHash: doc.blockchainHash,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        metadata: doc.metadata
      }));
    }),

  // Get all documents across all entities
  getAllDocuments: publicProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        return [];
      }

      const isOwner = ctx.user?.openId === ENV.ownerOpenId || ctx.user?.role === 'admin';

      const docs = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.documentType, "grant_application"),
            isOwner ? undefined : eq(secureDocuments.ownerId, userId)
          )
        )
        .orderBy(desc(secureDocuments.createdAt));

      // Group by entity
      const byEntity: Record<string, any[]> = {};
      
      docs.forEach(doc => {
        const metadata = doc.metadata as any;
        if (!metadata?.entityId) return;
        
        if (!byEntity[metadata.entityId]) {
          byEntity[metadata.entityId] = [];
        }
        
        byEntity[metadata.entityId].push({
          id: doc.id,
          title: doc.title,
          description: doc.description,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          status: doc.status,
          version: doc.version,
          blockchainHash: doc.blockchainHash,
          createdAt: doc.createdAt,
          category: metadata.category,
          expiresAt: metadata.expiresAt
        });
      });

      return {
        documents: byEntity,
        entities: ENTITY_IDS,
        totalCount: docs.length
      };
    }),

  // Get document checklist for an entity
  getDocumentChecklist: publicProcedure
    .input(z.object({
      entityId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        return { checklist: [], completionRate: 0 };
      }

      const isOwner = ctx.user?.openId === ENV.ownerOpenId || ctx.user?.role === 'admin';

      // Get existing documents for this entity
      const docs = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.documentType, "grant_application"),
            isOwner ? undefined : eq(secureDocuments.ownerId, userId)
          )
        );

      // Filter by entityId
      const entityDocs = docs.filter(doc => {
        const metadata = doc.metadata as any;
        return metadata?.entityId === input.entityId;
      });

      // Build checklist
      const uploadedCategories = new Set(
        entityDocs.map(doc => (doc.metadata as any)?.category).filter(Boolean)
      );

      const checklist = GRANT_DOCUMENT_CATEGORIES.map(category => {
        const requirement = DOCUMENT_REQUIREMENTS[category];
        const uploaded = uploadedCategories.has(category);
        const documents = entityDocs.filter(doc => (doc.metadata as any)?.category === category);
        
        return {
          category,
          description: requirement.description,
          required: requirement.required,
          formats: requirement.formats,
          maxSize: requirement.maxSize,
          uploaded,
          documentCount: documents.length,
          documents: documents.map(d => ({
            id: d.id,
            fileName: d.fileName,
            createdAt: d.createdAt
          }))
        };
      });

      // Calculate completion rate (required documents only)
      const requiredCategories = checklist.filter(c => c.required);
      const completedRequired = requiredCategories.filter(c => c.uploaded);
      const completionRate = requiredCategories.length > 0 
        ? Math.round((completedRequired.length / requiredCategories.length) * 100)
        : 0;

      return {
        checklist,
        completionRate,
        entityName: ENTITY_IDS[input.entityId] || input.entityId,
        totalUploaded: entityDocs.length,
        requiredCount: requiredCategories.length,
        completedCount: completedRequired.length
      };
    }),

  // Delete a document
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

      if (!doc) {
        throw new Error("Document not found");
      }

      const isOwner = ctx.user?.openId === ENV.ownerOpenId || ctx.user?.role === 'admin';
      if (doc.ownerId !== userId && !isOwner) {
        throw new Error("Only the owner can delete this document");
      }

      // Soft delete by archiving
      await db
        .update(secureDocuments)
        .set({ status: "archived" })
        .where(eq(secureDocuments.id, input.documentId));

      return { success: true };
    }),

  // Get document download URL
  getDownloadUrl: publicProcedure
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

      const isOwner = ctx.user?.openId === ENV.ownerOpenId || ctx.user?.role === 'admin';
      if (doc.ownerId !== userId && !isOwner) {
        throw new Error("Access denied");
      }

      // Return the stored URL directly (it's already a public S3 URL)
      return {
        url: doc.fileUrl,
        fileName: doc.fileName,
        mimeType: doc.mimeType
      };
    }),

  // Get suggested documents for a grant application
  getSuggestedDocuments: publicProcedure
    .input(z.object({
      entityId: z.string(),
      grantType: z.string().optional(), // federal, foundation, state, etc.
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        return { suggestions: [] };
      }

      const isOwner = ctx.user?.openId === ENV.ownerOpenId || ctx.user?.role === 'admin';

      // Get existing documents for this entity
      const docs = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.documentType, "grant_application"),
            isOwner ? undefined : eq(secureDocuments.ownerId, userId)
          )
        );

      const entityDocs = docs.filter(doc => {
        const metadata = doc.metadata as any;
        return metadata?.entityId === input.entityId && doc.status !== "archived";
      });

      // Build suggestions based on grant type
      const suggestions = entityDocs.map(doc => {
        const metadata = doc.metadata as any;
        return {
          id: doc.id,
          title: doc.title,
          fileName: doc.fileName,
          category: metadata?.category,
          fileUrl: doc.fileUrl,
          createdAt: doc.createdAt,
          recommended: DOCUMENT_REQUIREMENTS[metadata?.category]?.required || false
        };
      });

      // Sort by recommended first
      suggestions.sort((a, b) => {
        if (a.recommended && !b.recommended) return -1;
        if (!a.recommended && b.recommended) return 1;
        return 0;
      });

      return { suggestions };
    }),

  // Get expiring and expired documents
  getExpiringDocuments: publicProcedure
    .input(z.object({
      entityId: z.string().optional(), // Filter by entity, or get all
      daysAhead: z.number().default(30), // How many days ahead to check
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        return { expiring: [], expired: [], summary: { expiringCount: 0, expiredCount: 0 } };
      }

      const isOwner = ctx.user?.openId === ENV.ownerOpenId || ctx.user?.role === 'admin';
      const now = new Date();
      const futureDate = new Date(now.getTime() + input.daysAhead * 24 * 60 * 60 * 1000);

      // Get all grant documents
      const docs = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.documentType, "grant_application"),
            eq(secureDocuments.status, "final"),
            isOwner ? undefined : eq(secureDocuments.ownerId, userId)
          )
        )
        .orderBy(desc(secureDocuments.createdAt));

      // Filter by entity if specified
      const filteredDocs = input.entityId 
        ? docs.filter(doc => (doc.metadata as any)?.entityId === input.entityId)
        : docs;

      const expiring: any[] = [];
      const expired: any[] = [];

      filteredDocs.forEach(doc => {
        const metadata = doc.metadata as any;
        if (!metadata) return;

        // Check for explicit expiration date
        let expirationDate: Date | null = null;
        
        if (metadata.expiresAt) {
          expirationDate = new Date(metadata.expiresAt);
        } else {
          // Calculate based on category default
          const categoryConfig = DOCUMENT_REQUIREMENTS[metadata.category];
          if (categoryConfig?.expiresAfterMonths && doc.createdAt) {
            expirationDate = new Date(doc.createdAt);
            expirationDate.setMonth(expirationDate.getMonth() + categoryConfig.expiresAfterMonths);
          }
        }

        if (!expirationDate) return;

        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        const categoryConfig = DOCUMENT_REQUIREMENTS[metadata.category];
        const warningDays = categoryConfig?.expirationWarningDays || 30;

        const docInfo = {
          id: doc.id,
          title: doc.title,
          fileName: doc.fileName,
          category: metadata.category,
          categoryLabel: metadata.category?.replace(/_/g, ' ').toUpperCase(),
          entityId: metadata.entityId,
          entityName: ENTITY_IDS[metadata.entityId] || metadata.entityId,
          expirationDate: expirationDate.toISOString(),
          daysUntilExpiration,
          createdAt: doc.createdAt,
          fileUrl: doc.fileUrl,
          isExpired: daysUntilExpiration < 0,
          isWarning: daysUntilExpiration >= 0 && daysUntilExpiration <= warningDays,
          warningDays
        };

        if (daysUntilExpiration < 0) {
          expired.push(docInfo);
        } else if (daysUntilExpiration <= input.daysAhead) {
          expiring.push(docInfo);
        }
      });

      // Sort by days until expiration (most urgent first)
      expiring.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
      expired.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);

      return {
        expiring,
        expired,
        summary: {
          expiringCount: expiring.length,
          expiredCount: expired.length,
          urgentCount: expiring.filter(d => d.isWarning).length
        }
      };
    }),

  // Update document expiration date
  updateExpiration: publicProcedure
    .input(z.object({
      documentId: z.number(),
      expiresAt: z.string().nullable(), // ISO date or null to remove expiration
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        throw new Error("Authentication required");
      }

      // Get the document
      const [doc] = await db
        .select()
        .from(secureDocuments)
        .where(eq(secureDocuments.id, input.documentId))
        .limit(1);

      if (!doc) {
        throw new Error("Document not found");
      }

      const isOwner = ctx.user?.openId === ENV.ownerOpenId || ctx.user?.role === 'admin';
      if (doc.ownerId !== userId && !isOwner) {
        throw new Error("Only the owner can update this document");
      }

      // Update metadata with new expiration
      const currentMetadata = (doc.metadata as any) || {};
      const updatedMetadata = {
        ...currentMetadata,
        expiresAt: input.expiresAt,
        expirationUpdatedAt: new Date().toISOString(),
        expirationUpdatedBy: userId
      };

      await db
        .update(secureDocuments)
        .set({ 
          metadata: updatedMetadata,
          updatedAt: new Date()
        })
        .where(eq(secureDocuments.id, input.documentId));

      return { success: true, expiresAt: input.expiresAt };
    }),

  // Get expiration summary for dashboard
  getExpirationSummary: publicProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user?.id;
      
      if (!userId) {
        return { 
          byEntity: {},
          byCategory: {},
          totalExpired: 0,
          totalExpiringSoon: 0,
          totalDocuments: 0
        };
      }

      const isOwner = ctx.user?.openId === ENV.ownerOpenId || ctx.user?.role === 'admin';
      const now = new Date();

      // Get all grant documents
      const docs = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.documentType, "grant_application"),
            eq(secureDocuments.status, "final"),
            isOwner ? undefined : eq(secureDocuments.ownerId, userId)
          )
        );

      const byEntity: Record<string, { total: number; expired: number; expiringSoon: number }> = {};
      const byCategory: Record<string, { total: number; expired: number; expiringSoon: number }> = {};
      let totalExpired = 0;
      let totalExpiringSoon = 0;

      docs.forEach(doc => {
        const metadata = doc.metadata as any;
        if (!metadata) return;

        const entityId = metadata.entityId || 'unknown';
        const category = metadata.category || 'other';

        // Initialize counters
        if (!byEntity[entityId]) {
          byEntity[entityId] = { total: 0, expired: 0, expiringSoon: 0 };
        }
        if (!byCategory[category]) {
          byCategory[category] = { total: 0, expired: 0, expiringSoon: 0 };
        }

        byEntity[entityId].total++;
        byCategory[category].total++;

        // Calculate expiration
        let expirationDate: Date | null = null;
        
        if (metadata.expiresAt) {
          expirationDate = new Date(metadata.expiresAt);
        } else {
          const categoryConfig = DOCUMENT_REQUIREMENTS[category];
          if (categoryConfig?.expiresAfterMonths && doc.createdAt) {
            expirationDate = new Date(doc.createdAt);
            expirationDate.setMonth(expirationDate.getMonth() + categoryConfig.expiresAfterMonths);
          }
        }

        if (!expirationDate) return;

        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        const categoryConfig = DOCUMENT_REQUIREMENTS[category];
        const warningDays = categoryConfig?.expirationWarningDays || 30;

        if (daysUntilExpiration < 0) {
          byEntity[entityId].expired++;
          byCategory[category].expired++;
          totalExpired++;
        } else if (daysUntilExpiration <= warningDays) {
          byEntity[entityId].expiringSoon++;
          byCategory[category].expiringSoon++;
          totalExpiringSoon++;
        }
      });

      return {
        byEntity,
        byCategory,
        totalExpired,
        totalExpiringSoon,
        totalDocuments: docs.length,
        entities: ENTITY_IDS
      };
    }),
});
