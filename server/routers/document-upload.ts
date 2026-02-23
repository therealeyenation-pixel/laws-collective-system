/**
 * Document Upload Router
 * Phase 56.2: Upload trust documents and link businesses to House structure
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { storagePut, storageGet } from "../storage";
import {
  secureDocuments,
  documentFolders,
  businessEntities,
  houses,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  validateUpload,
  generateS3Key,
  createUploadedDocument,
  getRequiredTrustDocuments,
  getRequiredBusinessDocuments,
  calculateUploadProgress,
  getAllDocumentTypes,
  getDocumentTypeLabel,
  TRUST_DOCUMENT_LABELS,
  BUSINESS_DOCUMENT_LABELS,
  type DocumentCategory,
  type TrustDocumentType,
  type BusinessDocumentType,
} from "../services/document-upload";

export const documentUploadRouter = router({
  // Validate file before upload
  validateFile: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
      })
    )
    .query(({ input }) => {
      return validateUpload(input.fileName, input.mimeType, input.fileSize);
    }),

  // Get presigned URL for upload (generates S3 key)
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        category: z.enum(["trust", "business", "personal", "legal", "financial"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const s3Key = generateS3Key(userId, input.category, input.fileName);

      return {
        s3Key,
        uploadPath: `documents/${userId}/${input.category}`,
      };
    }),

  // Upload document (receives base64 content)
  uploadDocument: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
        base64Content: z.string(),
        category: z.enum(["trust", "business", "personal", "legal", "financial"]),
        documentType: z.string(),
        title: z.string(),
        description: z.string().optional(),
        houseId: z.number().optional(),
        businessEntityId: z.number().optional(),
        metadata: z
          .object({
            effectiveDate: z.string().optional(),
            expirationDate: z.string().optional(),
            signatories: z.array(z.string()).optional(),
            notarized: z.boolean().optional(),
            tags: z.array(z.string()).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Validate file
      const validation = validateUpload(input.fileName, input.mimeType, input.fileSize);
      if (!validation.isValid) {
        throw new Error(`Upload validation failed: ${validation.errors.join(", ")}`);
      }

      // Generate S3 key and upload
      const s3Key = generateS3Key(userId, input.category, input.fileName);
      const buffer = Buffer.from(input.base64Content, "base64");

      const { url: s3Url } = await storagePut(s3Key, buffer, input.mimeType);

      // Create document record in database
      const result = await db.insert(secureDocuments).values({
        ownerId: userId,
        title: input.title,
        description: input.description,
        documentType: input.documentType,
        content: null, // Content stored in S3
        fileUrl: s3Url,
        fileName: input.fileName,
        mimeType: input.mimeType,
        status: "final", // Only official versions per user preference
        accessLevel: "owner_only",
        version: 1,
        entityId: input.businessEntityId,
        houseId: input.houseId,
        metadata: JSON.stringify({
          category: input.category,
          s3Key,
          fileSize: input.fileSize,
          ...input.metadata,
        }),
      });

      return {
        success: true,
        documentId: result[0].insertId,
        s3Url,
        message: `Document "${input.title}" uploaded successfully`,
      };
    }),

  // Get uploaded documents for house/business
  getUploadedDocuments: protectedProcedure
    .input(
      z.object({
        houseId: z.number().optional(),
        businessEntityId: z.number().optional(),
        category: z.enum(["trust", "business", "personal", "legal", "financial", "all"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;
      const conditions = [eq(secureDocuments.ownerId, userId)];

      if (input.houseId) {
        conditions.push(eq(secureDocuments.houseId, input.houseId));
      }

      if (input.businessEntityId) {
        conditions.push(eq(secureDocuments.entityId, input.businessEntityId));
      }

      const documents = await db
        .select()
        .from(secureDocuments)
        .where(and(...conditions))
        .orderBy(desc(secureDocuments.createdAt));

      // Filter by category if specified
      let filteredDocs = documents;
      if (input.category && input.category !== "all") {
        filteredDocs = documents.filter((doc) => {
          try {
            const metadata = JSON.parse(doc.metadata || "{}");
            return metadata.category === input.category;
          } catch {
            return false;
          }
        });
      }

      return filteredDocs.map((doc) => {
        let metadata = {};
        try {
          metadata = JSON.parse(doc.metadata || "{}");
        } catch {}

        return {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          documentType: doc.documentType,
          fileUrl: doc.fileUrl,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
          status: doc.status,
          createdAt: doc.createdAt,
          metadata,
        };
      });
    }),

  // Get required documents checklist for trust setup
  getTrustDocumentChecklist: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Get uploaded trust documents
      const documents = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.ownerId, userId),
            eq(secureDocuments.houseId, input.houseId)
          )
        );

      const trustDocs = documents.filter((doc) => {
        try {
          const metadata = JSON.parse(doc.metadata || "{}");
          return metadata.category === "trust";
        } catch {
          return doc.documentType?.includes("trust");
        }
      });

      const requiredDocs = getRequiredTrustDocuments();
      const progress = calculateUploadProgress(
        trustDocs.map((d) => ({
          documentId: d.id.toString(),
          fileName: d.fileName || "",
          originalName: d.fileName || "",
          mimeType: d.mimeType || "",
          fileSize: 0,
          s3Key: "",
          s3Url: d.fileUrl || "",
          category: "trust" as DocumentCategory,
          documentType: d.documentType || "",
          title: d.title,
          uploadedBy: userId,
          uploadedAt: d.createdAt,
          metadata: {},
          verificationStatus: "verified" as const,
          linkedEntities: [],
        })),
        requiredDocs
      );

      return {
        checklist: requiredDocs.map((req) => ({
          ...req,
          uploaded: trustDocs.some((d) => d.documentType === req.type),
          document: trustDocs.find((d) => d.documentType === req.type),
        })),
        progress,
      };
    }),

  // Get required documents checklist for business linking
  getBusinessDocumentChecklist: protectedProcedure
    .input(
      z.object({
        businessEntityId: z.number(),
        entityType: z.enum(["llc", "corporation", "trust", "collective"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Get uploaded business documents
      const documents = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.ownerId, userId),
            eq(secureDocuments.entityId, input.businessEntityId)
          )
        );

      const businessDocs = documents.filter((doc) => {
        try {
          const metadata = JSON.parse(doc.metadata || "{}");
          return metadata.category === "business";
        } catch {
          return true; // Include if can't parse metadata
        }
      });

      const requiredDocs = getRequiredBusinessDocuments(input.entityType);
      const progress = calculateUploadProgress(
        businessDocs.map((d) => ({
          documentId: d.id.toString(),
          fileName: d.fileName || "",
          originalName: d.fileName || "",
          mimeType: d.mimeType || "",
          fileSize: 0,
          s3Key: "",
          s3Url: d.fileUrl || "",
          category: "business" as DocumentCategory,
          documentType: d.documentType || "",
          title: d.title,
          uploadedBy: userId,
          uploadedAt: d.createdAt,
          metadata: {},
          verificationStatus: "verified" as const,
          linkedEntities: [],
        })),
        requiredDocs
      );

      return {
        checklist: requiredDocs.map((req) => ({
          ...req,
          uploaded: businessDocs.some((d) => d.documentType === req.type),
          document: businessDocs.find((d) => d.documentType === req.type),
        })),
        progress,
      };
    }),

  // Link business to house with 70/30 split configuration
  linkBusinessToHouse: protectedProcedure
    .input(
      z.object({
        businessEntityId: z.number(),
        houseId: z.number(),
        ownershipPercentage: z.number().min(0).max(100).default(100),
        incomeContributionRate: z.number().min(0).max(100).default(100),
        operatingPercentage: z.number().min(0).max(100).default(70),
        housePercentage: z.number().min(0).max(100).default(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Validate split totals 100%
      if (input.operatingPercentage + input.housePercentage !== 100) {
        throw new Error("Operating and House percentages must total 100%");
      }

      // Verify business belongs to user
      const business = await db
        .select()
        .from(businessEntities)
        .where(
          and(
            eq(businessEntities.id, input.businessEntityId),
            eq(businessEntities.ownerId, userId)
          )
        )
        .limit(1);

      if (business.length === 0) {
        throw new Error("Business entity not found or access denied");
      }

      // Verify house belongs to user
      const house = await db
        .select()
        .from(houses)
        .where(
          and(eq(houses.id, input.houseId), eq(houses.ownerId, userId))
        )
        .limit(1);

      if (house.length === 0) {
        throw new Error("House not found or access denied");
      }

      // Update business entity with house link and split configuration
      await db
        .update(businessEntities)
        .set({
          houseId: input.houseId,
          ownershipPercentage: input.ownershipPercentage,
          incomeContributionRate: input.incomeContributionRate,
          splitConfiguration: JSON.stringify({
            operatingPercentage: input.operatingPercentage,
            housePercentage: input.housePercentage,
          }),
          updatedAt: new Date(),
        })
        .where(eq(businessEntities.id, input.businessEntityId));

      return {
        success: true,
        message: `${business[0].name} linked to ${house[0].name} with ${input.operatingPercentage}/${input.housePercentage} split`,
      };
    }),

  // Get all document types
  getDocumentTypes: protectedProcedure.query(() => {
    return {
      trust: Object.entries(TRUST_DOCUMENT_LABELS).map(([type, label]) => ({
        type,
        label,
      })),
      business: Object.entries(BUSINESS_DOCUMENT_LABELS).map(([type, label]) => ({
        type,
        label,
      })),
      all: getAllDocumentTypes(),
    };
  }),

  // Delete uploaded document
  deleteDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Verify document belongs to user
      const document = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.id, input.documentId),
            eq(secureDocuments.ownerId, userId)
          )
        )
        .limit(1);

      if (document.length === 0) {
        throw new Error("Document not found or access denied");
      }

      // Delete from database (S3 cleanup would be handled separately)
      await db
        .delete(secureDocuments)
        .where(eq(secureDocuments.id, input.documentId));

      return {
        success: true,
        message: "Document deleted successfully",
      };
    }),

  // Get document download URL
  getDocumentUrl: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      const document = await db
        .select()
        .from(secureDocuments)
        .where(
          and(
            eq(secureDocuments.id, input.documentId),
            eq(secureDocuments.ownerId, userId)
          )
        )
        .limit(1);

      if (document.length === 0) {
        throw new Error("Document not found or access denied");
      }

      return {
        url: document[0].fileUrl,
        fileName: document[0].fileName,
        mimeType: document[0].mimeType,
      };
    }),
});
