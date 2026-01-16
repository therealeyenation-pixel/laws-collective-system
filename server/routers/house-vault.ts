import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  houseDocumentVaults,
  vaultFolders,
  vaultDocuments,
  vaultAccessLogs,
  houses,
} from "../../drizzle/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { storagePut, storageGet } from "../storage";
import crypto from "crypto";

// ============================================
// DOCUMENT VAULT SYSTEM
// Secure document storage per House
// ============================================

const DOCUMENT_TYPES = [
  { value: "legal", label: "Legal Documents", icon: "⚖️" },
  { value: "financial", label: "Financial Records", icon: "💰" },
  { value: "tax", label: "Tax Documents", icon: "📋" },
  { value: "insurance", label: "Insurance Policies", icon: "🛡️" },
  { value: "property", label: "Property Documents", icon: "🏠" },
  { value: "identity", label: "Identity Documents", icon: "🪪" },
  { value: "contract", label: "Contracts", icon: "📝" },
  { value: "certificate", label: "Certificates", icon: "🎓" },
  { value: "receipt", label: "Receipts", icon: "🧾" },
  { value: "correspondence", label: "Correspondence", icon: "✉️" },
  { value: "other", label: "Other", icon: "📁" },
];

const DEFAULT_FOLDERS = [
  { name: "Legal", path: "/Legal" },
  { name: "Financial", path: "/Financial" },
  { name: "Tax Returns", path: "/Tax Returns" },
  { name: "Insurance", path: "/Insurance" },
  { name: "Property Deeds", path: "/Property Deeds" },
  { name: "Identity", path: "/Identity" },
  { name: "Contracts", path: "/Contracts" },
  { name: "Certificates", path: "/Certificates" },
  { name: "Business", path: "/Business" },
  { name: "Personal", path: "/Personal" },
];

export const houseVaultRouter = router({
  // ============================================
  // VAULT MANAGEMENT
  // ============================================

  getVault: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const userId = ctx.user.id;

    // Get user's house
    const userHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.ownerUserId, userId))
      .limit(1);

    if (!userHouse.length) {
      return { vault: null, message: "House not activated" };
    }

    // Get or create vault
    let vault = await db
      .select()
      .from(houseDocumentVaults)
      .where(eq(houseDocumentVaults.houseId, userHouse[0].id))
      .limit(1);

    if (!vault.length) {
      // Create vault for house
      const vaultHash = crypto.randomBytes(32).toString("hex");
      const result = await db.insert(houseDocumentVaults).values({
        houseId: userHouse[0].id,
        vaultName: `${userHouse[0].name} Document Vault`,
        vaultHash,
        encryptionEnabled: true,
        status: "active",
      });

      const vaultId = result[0].insertId;

      // Create default folders
      for (const folder of DEFAULT_FOLDERS) {
        await db.insert(vaultFolders).values({
          vaultId,
          folderName: folder.name,
          folderPath: folder.path,
          isPrivate: false,
        });
      }

      vault = await db
        .select()
        .from(houseDocumentVaults)
        .where(eq(houseDocumentVaults.id, vaultId))
        .limit(1);
    }

    // Get folders
    const folders = await db
      .select()
      .from(vaultFolders)
      .where(eq(vaultFolders.vaultId, vault[0].id))
      .orderBy(vaultFolders.folderPath);

    // Get recent documents
    const recentDocuments = await db
      .select()
      .from(vaultDocuments)
      .where(eq(vaultDocuments.vaultId, vault[0].id))
      .orderBy(desc(vaultDocuments.createdAt))
      .limit(10);

    // Calculate storage usage
    const storageUsed = vault[0].totalStorageBytes;
    const storageQuota = vault[0].storageQuotaBytes;
    const storagePercentage = ((storageUsed / storageQuota) * 100).toFixed(1);

    return {
      vault: vault[0],
      folders,
      recentDocuments,
      documentTypes: DOCUMENT_TYPES,
      storage: {
        used: storageUsed,
        quota: storageQuota,
        percentage: storagePercentage,
        usedFormatted: formatBytes(storageUsed),
        quotaFormatted: formatBytes(storageQuota),
      },
    };
  }),

  getFolderContents: protectedProcedure
    .input(z.object({ folderId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const vault = await db
        .select()
        .from(houseDocumentVaults)
        .where(eq(houseDocumentVaults.houseId, userHouse[0].id))
        .limit(1);

      if (!vault.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
      }

      // Get subfolders
      const subfolders = await db
        .select()
        .from(vaultFolders)
        .where(
          and(
            eq(vaultFolders.vaultId, vault[0].id),
            input.folderId
              ? eq(vaultFolders.parentFolderId, input.folderId)
              : isNull(vaultFolders.parentFolderId)
          )
        )
        .orderBy(vaultFolders.folderName);

      // Get documents in folder
      const documents = await db
        .select()
        .from(vaultDocuments)
        .where(
          and(
            eq(vaultDocuments.vaultId, vault[0].id),
            input.folderId
              ? eq(vaultDocuments.folderId, input.folderId)
              : isNull(vaultDocuments.folderId)
          )
        )
        .orderBy(desc(vaultDocuments.createdAt));

      // Get current folder info
      let currentFolder = null;
      if (input.folderId) {
        const folder = await db
          .select()
          .from(vaultFolders)
          .where(eq(vaultFolders.id, input.folderId))
          .limit(1);
        currentFolder = folder[0] || null;
      }

      return {
        currentFolder,
        subfolders,
        documents,
      };
    }),

  createFolder: protectedProcedure
    .input(
      z.object({
        folderName: z.string().min(1).max(255),
        parentFolderId: z.number().optional(),
        isPrivate: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const vault = await db
        .select()
        .from(houseDocumentVaults)
        .where(eq(houseDocumentVaults.houseId, userHouse[0].id))
        .limit(1);

      if (!vault.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
      }

      // Build folder path
      let folderPath = `/${input.folderName}`;
      if (input.parentFolderId) {
        const parentFolder = await db
          .select()
          .from(vaultFolders)
          .where(eq(vaultFolders.id, input.parentFolderId))
          .limit(1);
        if (parentFolder.length) {
          folderPath = `${parentFolder[0].folderPath}/${input.folderName}`;
        }
      }

      const result = await db.insert(vaultFolders).values({
        vaultId: vault[0].id,
        parentFolderId: input.parentFolderId,
        folderName: input.folderName,
        folderPath,
        isPrivate: input.isPrivate,
      });

      return { success: true, folderId: result[0].insertId };
    }),

  uploadDocument: protectedProcedure
    .input(
      z.object({
        folderId: z.number().optional(),
        documentName: z.string().min(1),
        documentType: z.enum([
          "legal",
          "financial",
          "tax",
          "insurance",
          "property",
          "identity",
          "contract",
          "certificate",
          "receipt",
          "correspondence",
          "other",
        ]),
        fileName: z.string().min(1),
        fileSize: z.number().positive(),
        mimeType: z.string().min(1),
        fileContent: z.string(), // Base64 encoded
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        expirationDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const vault = await db
        .select()
        .from(houseDocumentVaults)
        .where(eq(houseDocumentVaults.houseId, userHouse[0].id))
        .limit(1);

      if (!vault.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
      }

      // Check storage quota
      const newTotalStorage = vault[0].totalStorageBytes + input.fileSize;
      if (newTotalStorage > vault[0].storageQuotaBytes) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Storage quota exceeded",
        });
      }

      // Decode and upload to S3
      const fileBuffer = Buffer.from(input.fileContent, "base64");
      const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
      const s3Key = `vault/${vault[0].id}/${fileHash}-${input.fileName}`;

      const { url: s3Url } = await storagePut(s3Key, fileBuffer, input.mimeType);

      // Create document record
      const result = await db.insert(vaultDocuments).values({
        vaultId: vault[0].id,
        folderId: input.folderId,
        documentName: input.documentName,
        documentType: input.documentType,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        fileHash,
        s3Key,
        s3Url,
        description: input.description,
        tags: input.tags,
        expirationDate: input.expirationDate,
        uploadedByUserId: userId,
      });

      // Update vault storage stats
      await db
        .update(houseDocumentVaults)
        .set({
          totalDocuments: sql`${houseDocumentVaults.totalDocuments} + 1`,
          totalStorageBytes: sql`${houseDocumentVaults.totalStorageBytes} + ${input.fileSize}`,
        })
        .where(eq(houseDocumentVaults.id, vault[0].id));

      // Update folder document count
      if (input.folderId) {
        await db
          .update(vaultFolders)
          .set({
            documentCount: sql`${vaultFolders.documentCount} + 1`,
          })
          .where(eq(vaultFolders.id, input.folderId));
      }

      // Log access
      await db.insert(vaultAccessLogs).values({
        vaultId: vault[0].id,
        documentId: result[0].insertId,
        accessType: "upload",
        accessedByUserId: userId,
        accessGranted: true,
      });

      return {
        success: true,
        documentId: result[0].insertId,
        s3Url,
      };
    }),

  getDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const vault = await db
        .select()
        .from(houseDocumentVaults)
        .where(eq(houseDocumentVaults.houseId, userHouse[0].id))
        .limit(1);

      if (!vault.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
      }

      const document = await db
        .select()
        .from(vaultDocuments)
        .where(
          and(
            eq(vaultDocuments.id, input.documentId),
            eq(vaultDocuments.vaultId, vault[0].id)
          )
        )
        .limit(1);

      if (!document.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }

      // Log access
      await db.insert(vaultAccessLogs).values({
        vaultId: vault[0].id,
        documentId: input.documentId,
        accessType: "view",
        accessedByUserId: userId,
        accessGranted: true,
      });

      // Get download URL
      const { url: downloadUrl } = await storageGet(document[0].s3Key);

      return {
        document: document[0],
        downloadUrl,
      };
    }),

  downloadDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const vault = await db
        .select()
        .from(houseDocumentVaults)
        .where(eq(houseDocumentVaults.houseId, userHouse[0].id))
        .limit(1);

      if (!vault.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
      }

      const document = await db
        .select()
        .from(vaultDocuments)
        .where(
          and(
            eq(vaultDocuments.id, input.documentId),
            eq(vaultDocuments.vaultId, vault[0].id)
          )
        )
        .limit(1);

      if (!document.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }

      // Log download
      await db.insert(vaultAccessLogs).values({
        vaultId: vault[0].id,
        documentId: input.documentId,
        accessType: "download",
        accessedByUserId: userId,
        accessGranted: true,
      });

      // Get download URL
      const { url: downloadUrl } = await storageGet(document[0].s3Key);

      return {
        success: true,
        downloadUrl,
        fileName: document[0].fileName,
        mimeType: document[0].mimeType,
      };
    }),

  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const vault = await db
        .select()
        .from(houseDocumentVaults)
        .where(eq(houseDocumentVaults.houseId, userHouse[0].id))
        .limit(1);

      if (!vault.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
      }

      const document = await db
        .select()
        .from(vaultDocuments)
        .where(
          and(
            eq(vaultDocuments.id, input.documentId),
            eq(vaultDocuments.vaultId, vault[0].id)
          )
        )
        .limit(1);

      if (!document.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }

      // Log deletion
      await db.insert(vaultAccessLogs).values({
        vaultId: vault[0].id,
        documentId: input.documentId,
        accessType: "delete",
        accessedByUserId: userId,
        accessGranted: true,
      });

      // Update vault storage stats
      await db
        .update(houseDocumentVaults)
        .set({
          totalDocuments: sql`${houseDocumentVaults.totalDocuments} - 1`,
          totalStorageBytes: sql`${houseDocumentVaults.totalStorageBytes} - ${document[0].fileSize}`,
        })
        .where(eq(houseDocumentVaults.id, vault[0].id));

      // Update folder document count
      if (document[0].folderId) {
        await db
          .update(vaultFolders)
          .set({
            documentCount: sql`${vaultFolders.documentCount} - 1`,
          })
          .where(eq(vaultFolders.id, document[0].folderId));
      }

      // Delete document record (S3 object remains for audit)
      await db
        .delete(vaultDocuments)
        .where(eq(vaultDocuments.id, input.documentId));

      return { success: true };
    }),

  getAccessLogs: protectedProcedure
    .input(z.object({ documentId: z.number().optional(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const vault = await db
        .select()
        .from(houseDocumentVaults)
        .where(eq(houseDocumentVaults.houseId, userHouse[0].id))
        .limit(1);

      if (!vault.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
      }

      const logs = await db
        .select()
        .from(vaultAccessLogs)
        .where(
          input.documentId
            ? and(
                eq(vaultAccessLogs.vaultId, vault[0].id),
                eq(vaultAccessLogs.documentId, input.documentId)
              )
            : eq(vaultAccessLogs.vaultId, vault[0].id)
        )
        .orderBy(desc(vaultAccessLogs.createdAt))
        .limit(input.limit);

      return { logs };
    }),

  searchDocuments: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        documentType: z.string().optional(),
        folderId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const userHouse = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, userId))
        .limit(1);

      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      const vault = await db
        .select()
        .from(houseDocumentVaults)
        .where(eq(houseDocumentVaults.houseId, userHouse[0].id))
        .limit(1);

      if (!vault.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vault not found" });
      }

      // Search documents by name, description, or tags
      const documents = await db
        .select()
        .from(vaultDocuments)
        .where(
          and(
            eq(vaultDocuments.vaultId, vault[0].id),
            sql`(
              ${vaultDocuments.documentName} LIKE ${`%${input.query}%`} OR
              ${vaultDocuments.description} LIKE ${`%${input.query}%`} OR
              ${vaultDocuments.fileName} LIKE ${`%${input.query}%`}
            )`
          )
        )
        .orderBy(desc(vaultDocuments.createdAt))
        .limit(50);

      return { documents };
    }),
});

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export type HouseVaultRouter = typeof houseVaultRouter;
