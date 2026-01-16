import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { houses } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// ============================================
// DIGITAL SIGNATURE MODULE
// Internal document signing with verification
// ============================================

// Signature request status
type SignatureStatus = "pending" | "signed" | "declined" | "expired";

// In-memory storage for signature requests
const signatureRequests: Map<string, any> = new Map();
const signatures: Map<string, any> = new Map();

// Generate a unique hash for document verification
function generateDocumentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

// Generate signature verification hash
function generateSignatureHash(signatureData: any): string {
  const data = JSON.stringify({
    signerId: signatureData.signerId,
    documentHash: signatureData.documentHash,
    timestamp: signatureData.timestamp,
    signatureType: signatureData.signatureType,
  });
  return crypto.createHash("sha256").update(data).digest("hex");
}

export const digitalSignaturesRouter = router({
  /**
   * Create a signature request for a document
   */
  createSignatureRequest: protectedProcedure
    .input(z.object({
      documentId: z.string(),
      documentTitle: z.string(),
      documentType: z.string(),
      documentUrl: z.string(),
      documentContent: z.string().optional(), // For hash generation
      signers: z.array(z.object({
        userId: z.number(),
        name: z.string(),
        email: z.string(),
        role: z.string(), // e.g., "Trustee", "Member", "Witness"
        order: z.number().default(1), // Signing order
        required: z.boolean().default(true),
      })),
      expiresAt: z.string().optional(),
      requireWitness: z.boolean().default(false),
      requireNotarization: z.boolean().default(false),
      message: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      const requestId = `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      // Generate document hash if content provided
      const documentHash = input.documentContent 
        ? generateDocumentHash(input.documentContent)
        : generateDocumentHash(input.documentUrl + input.documentTitle);

      const signerRecords = input.signers.map((signer, idx) => ({
        ...signer,
        id: `SIGNER-${requestId}-${idx}`,
        status: "pending" as SignatureStatus,
        signedAt: null,
        signatureHash: null,
        signatureData: null,
        declineReason: null,
      }));

      const request = {
        id: requestId,
        houseId,
        documentId: input.documentId,
        documentTitle: input.documentTitle,
        documentType: input.documentType,
        documentUrl: input.documentUrl,
        documentHash,
        signers: signerRecords,
        totalSigners: signerRecords.length,
        requiredSigners: signerRecords.filter(s => s.required).length,
        completedSigners: 0,
        requireWitness: input.requireWitness,
        requireNotarization: input.requireNotarization,
        witnessSignature: null,
        notarizationDetails: null,
        message: input.message,
        status: "pending",
        createdAt: new Date().toISOString(),
        createdBy: ctx.user.id,
        expiresAt: input.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default
        completedAt: null,
        finalDocumentUrl: null,
        verificationHash: null,
      };

      signatureRequests.set(requestId, request);

      return {
        success: true,
        requestId,
        request,
      };
    }),

  /**
   * Get signature request details
   */
  getRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ input }) => {
      const request = signatureRequests.get(input.requestId);
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Signature request not found" });
      return request;
    }),

  /**
   * Get all signature requests for the house
   */
  getRequests: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "completed", "expired", "all"]).default("all"),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      let requests = Array.from(signatureRequests.values()).filter(r => r.houseId === houseId);

      if (input.status !== "all") {
        requests = requests.filter(r => r.status === input.status);
      }

      return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }),

  /**
   * Get pending signature requests for current user
   */
  getMyPendingSignatures: protectedProcedure.query(async ({ ctx }) => {
    const allRequests = Array.from(signatureRequests.values());
    
    const pendingForUser = allRequests.filter(r => 
      r.status === "pending" && 
      r.signers.some((s: any) => s.userId === ctx.user.id && s.status === "pending")
    );

    return pendingForUser.map(r => ({
      requestId: r.id,
      documentTitle: r.documentTitle,
      documentType: r.documentType,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      myRole: r.signers.find((s: any) => s.userId === ctx.user.id)?.role,
    }));
  }),

  /**
   * Sign a document
   */
  signDocument: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      signatureType: z.enum(["typed", "drawn", "uploaded"]),
      signatureData: z.string(), // Base64 for drawn/uploaded, text for typed
      signatureName: z.string(), // Full legal name
      agreedToTerms: z.boolean(),
      ipAddress: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!input.agreedToTerms) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Must agree to terms to sign" });
      }

      const request = signatureRequests.get(input.requestId);
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Signature request not found" });

      if (request.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This document is no longer available for signing" });
      }

      // Check if expired
      if (new Date(request.expiresAt) < new Date()) {
        request.status = "expired";
        throw new TRPCError({ code: "BAD_REQUEST", message: "Signature request has expired" });
      }

      // Find the signer record
      const signer = request.signers.find((s: any) => s.userId === ctx.user.id);
      if (!signer) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not authorized to sign this document" });
      }

      if (signer.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You have already signed or declined this document" });
      }

      // Check signing order
      const previousSigners = request.signers.filter((s: any) => s.order < signer.order && s.required);
      const allPreviousSigned = previousSigners.every((s: any) => s.status === "signed");
      if (!allPreviousSigned) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Previous required signers must sign first" });
      }

      const timestamp = new Date().toISOString();
      
      // Generate signature hash
      const signatureHash = generateSignatureHash({
        signerId: ctx.user.id,
        documentHash: request.documentHash,
        timestamp,
        signatureType: input.signatureType,
      });

      // Update signer record
      signer.status = "signed";
      signer.signedAt = timestamp;
      signer.signatureHash = signatureHash;
      signer.signatureData = {
        type: input.signatureType,
        data: input.signatureData,
        name: input.signatureName,
        ipAddress: input.ipAddress,
      };

      // Store signature record
      const signatureId = `SIGNATURE-${Date.now()}`;
      signatures.set(signatureId, {
        id: signatureId,
        requestId: request.id,
        signerId: ctx.user.id,
        signerName: input.signatureName,
        signerRole: signer.role,
        documentHash: request.documentHash,
        signatureHash,
        signatureType: input.signatureType,
        timestamp,
        ipAddress: input.ipAddress,
      });

      // Update request progress
      request.completedSigners = request.signers.filter((s: any) => s.status === "signed").length;

      // Check if all required signers have signed
      const allRequiredSigned = request.signers
        .filter((s: any) => s.required)
        .every((s: any) => s.status === "signed");

      if (allRequiredSigned) {
        // Check witness requirement
        if (request.requireWitness && !request.witnessSignature) {
          request.status = "awaiting_witness";
        } else if (request.requireNotarization && !request.notarizationDetails) {
          request.status = "awaiting_notarization";
        } else {
          request.status = "completed";
          request.completedAt = timestamp;
          
          // Generate final verification hash
          const allSignatureHashes = request.signers
            .filter((s: any) => s.status === "signed")
            .map((s: any) => s.signatureHash)
            .join("");
          request.verificationHash = generateDocumentHash(request.documentHash + allSignatureHashes);
        }
      }

      return {
        success: true,
        signatureId,
        signatureHash,
        requestStatus: request.status,
        completedSigners: request.completedSigners,
        totalRequired: request.requiredSigners,
      };
    }),

  /**
   * Decline to sign a document
   */
  declineSignature: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const request = signatureRequests.get(input.requestId);
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Signature request not found" });

      const signer = request.signers.find((s: any) => s.userId === ctx.user.id);
      if (!signer) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not authorized for this document" });
      }

      signer.status = "declined";
      signer.declineReason = input.reason;
      signer.declinedAt = new Date().toISOString();

      // If required signer declined, mark request as declined
      if (signer.required) {
        request.status = "declined";
        request.declinedBy = ctx.user.id;
        request.declineReason = input.reason;
      }

      return {
        success: true,
        requestStatus: request.status,
      };
    }),

  /**
   * Add witness signature
   */
  addWitnessSignature: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      witnessName: z.string(),
      witnessSignature: z.string(),
      witnessAddress: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const request = signatureRequests.get(input.requestId);
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Signature request not found" });

      if (!request.requireWitness) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This document does not require a witness" });
      }

      const timestamp = new Date().toISOString();
      
      request.witnessSignature = {
        name: input.witnessName,
        signature: input.witnessSignature,
        address: input.witnessAddress,
        timestamp,
        witnessedBy: ctx.user.id,
      };

      // Check if document is now complete
      const allRequiredSigned = request.signers
        .filter((s: any) => s.required)
        .every((s: any) => s.status === "signed");

      if (allRequiredSigned && (!request.requireNotarization || request.notarizationDetails)) {
        request.status = "completed";
        request.completedAt = timestamp;
        
        // Generate final verification hash including witness
        const allSignatureHashes = request.signers
          .filter((s: any) => s.status === "signed")
          .map((s: any) => s.signatureHash)
          .join("");
        request.verificationHash = generateDocumentHash(
          request.documentHash + allSignatureHashes + JSON.stringify(request.witnessSignature)
        );
      }

      return {
        success: true,
        requestStatus: request.status,
      };
    }),

  /**
   * Add notarization details
   */
  addNotarization: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      notaryName: z.string(),
      notaryCommission: z.string(),
      notaryState: z.string(),
      notaryExpiration: z.string(),
      notarySeal: z.string().optional(), // Image of seal
      notarizationDate: z.string(),
      documentUrl: z.string().optional(), // Notarized document upload
    }))
    .mutation(async ({ input, ctx }) => {
      const request = signatureRequests.get(input.requestId);
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Signature request not found" });

      if (!request.requireNotarization) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This document does not require notarization" });
      }

      request.notarizationDetails = {
        notaryName: input.notaryName,
        notaryCommission: input.notaryCommission,
        notaryState: input.notaryState,
        notaryExpiration: input.notaryExpiration,
        notarySeal: input.notarySeal,
        notarizationDate: input.notarizationDate,
        documentUrl: input.documentUrl,
        recordedBy: ctx.user.id,
        recordedAt: new Date().toISOString(),
      };

      if (input.documentUrl) {
        request.finalDocumentUrl = input.documentUrl;
      }

      // Check if document is now complete
      const allRequiredSigned = request.signers
        .filter((s: any) => s.required)
        .every((s: any) => s.status === "signed");

      if (allRequiredSigned && (!request.requireWitness || request.witnessSignature)) {
        request.status = "completed";
        request.completedAt = new Date().toISOString();
        
        // Generate final verification hash
        const allSignatureHashes = request.signers
          .filter((s: any) => s.status === "signed")
          .map((s: any) => s.signatureHash)
          .join("");
        request.verificationHash = generateDocumentHash(
          request.documentHash + allSignatureHashes + JSON.stringify(request.notarizationDetails)
        );
      }

      return {
        success: true,
        requestStatus: request.status,
      };
    }),

  /**
   * Verify a signature
   */
  verifySignature: protectedProcedure
    .input(z.object({
      signatureHash: z.string(),
    }))
    .query(async ({ input }) => {
      // Find signature by hash
      const signature = Array.from(signatures.values()).find(s => s.signatureHash === input.signatureHash);
      
      if (!signature) {
        return {
          valid: false,
          message: "Signature not found in system",
        };
      }

      const request = signatureRequests.get(signature.requestId);
      
      return {
        valid: true,
        signature: {
          signerName: signature.signerName,
          signerRole: signature.signerRole,
          documentTitle: request?.documentTitle,
          signedAt: signature.timestamp,
          signatureType: signature.signatureType,
        },
        document: {
          title: request?.documentTitle,
          type: request?.documentType,
          status: request?.status,
          verificationHash: request?.verificationHash,
        },
      };
    }),

  /**
   * Verify a completed document
   */
  verifyDocument: protectedProcedure
    .input(z.object({
      requestId: z.string(),
    }))
    .query(async ({ input }) => {
      const request = signatureRequests.get(input.requestId);
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });

      const signerDetails = request.signers
        .filter((s: any) => s.status === "signed")
        .map((s: any) => ({
          name: s.name,
          role: s.role,
          signedAt: s.signedAt,
          signatureHash: s.signatureHash,
        }));

      return {
        documentTitle: request.documentTitle,
        documentType: request.documentType,
        documentHash: request.documentHash,
        status: request.status,
        signers: signerDetails,
        witnessSignature: request.witnessSignature ? {
          name: request.witnessSignature.name,
          timestamp: request.witnessSignature.timestamp,
        } : null,
        notarization: request.notarizationDetails ? {
          notaryName: request.notarizationDetails.notaryName,
          notaryState: request.notarizationDetails.notaryState,
          notarizationDate: request.notarizationDetails.notarizationDate,
        } : null,
        verificationHash: request.verificationHash,
        completedAt: request.completedAt,
        isComplete: request.status === "completed",
        isValid: request.status === "completed" && !!request.verificationHash,
      };
    }),

  /**
   * Get signature audit trail
   */
  getAuditTrail: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ input }) => {
      const request = signatureRequests.get(input.requestId);
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });

      const events: any[] = [];

      // Document created
      events.push({
        type: "document_created",
        timestamp: request.createdAt,
        actor: request.createdBy,
        details: `Signature request created for "${request.documentTitle}"`,
      });

      // Signer events
      request.signers.forEach((signer: any) => {
        if (signer.status === "signed") {
          events.push({
            type: "signature_added",
            timestamp: signer.signedAt,
            actor: signer.userId,
            actorName: signer.name,
            details: `${signer.name} (${signer.role}) signed the document`,
            signatureHash: signer.signatureHash,
          });
        } else if (signer.status === "declined") {
          events.push({
            type: "signature_declined",
            timestamp: signer.declinedAt,
            actor: signer.userId,
            actorName: signer.name,
            details: `${signer.name} declined to sign: ${signer.declineReason}`,
          });
        }
      });

      // Witness event
      if (request.witnessSignature) {
        events.push({
          type: "witness_added",
          timestamp: request.witnessSignature.timestamp,
          actor: request.witnessSignature.witnessedBy,
          details: `Witnessed by ${request.witnessSignature.name}`,
        });
      }

      // Notarization event
      if (request.notarizationDetails) {
        events.push({
          type: "notarization_added",
          timestamp: request.notarizationDetails.recordedAt,
          actor: request.notarizationDetails.recordedBy,
          details: `Notarized by ${request.notarizationDetails.notaryName} (${request.notarizationDetails.notaryState})`,
        });
      }

      // Completion event
      if (request.completedAt) {
        events.push({
          type: "document_completed",
          timestamp: request.completedAt,
          details: "All signatures collected, document finalized",
          verificationHash: request.verificationHash,
        });
      }

      // Sort by timestamp
      events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return {
        documentTitle: request.documentTitle,
        documentHash: request.documentHash,
        events,
        currentStatus: request.status,
      };
    }),

  /**
   * Get signature dashboard
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
    const houseId = userHouse?.id || 1;

    const allRequests = Array.from(signatureRequests.values()).filter(r => r.houseId === houseId);

    const pending = allRequests.filter(r => r.status === "pending");
    const completed = allRequests.filter(r => r.status === "completed");
    const awaitingWitness = allRequests.filter(r => r.status === "awaiting_witness");
    const awaitingNotarization = allRequests.filter(r => r.status === "awaiting_notarization");
    const declined = allRequests.filter(r => r.status === "declined");

    // Get requests awaiting current user's signature
    const myPending = allRequests.filter(r => 
      r.status === "pending" && 
      r.signers.some((s: any) => s.userId === ctx.user.id && s.status === "pending")
    );

    return {
      summary: {
        total: allRequests.length,
        pending: pending.length,
        completed: completed.length,
        awaitingWitness: awaitingWitness.length,
        awaitingNotarization: awaitingNotarization.length,
        declined: declined.length,
      },
      myPendingSignatures: myPending.length,
      recentActivity: allRequests
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(r => ({
          id: r.id,
          documentTitle: r.documentTitle,
          documentType: r.documentType,
          status: r.status,
          createdAt: r.createdAt,
          completedAt: r.completedAt,
          progress: `${r.completedSigners}/${r.requiredSigners}`,
        })),
    };
  }),
});

export default digitalSignaturesRouter;
