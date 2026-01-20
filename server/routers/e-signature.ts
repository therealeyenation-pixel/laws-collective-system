import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const eSignatureRouter = router({
  // Create a signature request
  createRequest: adminProcedure
    .input(z.object({
      documentId: z.number(),
      documentType: z.string(),
      documentTitle: z.string(),
      signers: z.array(z.object({
        userId: z.number().optional(),
        name: z.string(),
        email: z.string().optional(),
        title: z.string().optional(),
      })),
      expiresInDays: z.number().default(30),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      // Create signature request
      const [request] = await db.execute(sql`
        INSERT INTO signature_requests (documentId, documentType, documentTitle, requestedBy, status, expiresAt, createdAt, updatedAt)
        VALUES (${input.documentId}, ${input.documentType}, ${input.documentTitle}, ${ctx.user.id}, 'pending', ${expiresAt}, NOW(), NOW())
      `);

      const requestId = (request as any).insertId;

      // Create individual signature records for each signer
      for (const signer of input.signers) {
        await db.execute(sql`
          INSERT INTO signatures (requestId, signerId, signerName, signerEmail, signerTitle, status, createdAt)
          VALUES (${requestId}, ${signer.userId || 0}, ${signer.name}, ${signer.email || null}, ${signer.title || null}, 'pending', NOW())
        `);
      }

      return { requestId, message: "Signature request created" };
    }),

  // Get pending signature requests for current user
  getMyPendingSignatures: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [signatures] = await db.execute(sql`
        SELECT s.*, sr.documentTitle, sr.documentType, sr.expiresAt
        FROM signatures s
        JOIN signature_requests sr ON s.requestId = sr.id
        WHERE s.signerId = ${ctx.user.id} AND s.status = 'pending'
        ORDER BY sr.createdAt DESC
      `);
      return signatures as unknown as any[];
    }),

  // Get all signature requests (admin)
  getAllRequests: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "in_progress", "completed", "expired", "cancelled"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = sql`
        SELECT sr.*, 
          (SELECT COUNT(*) FROM signatures WHERE requestId = sr.id AND status = 'signed') as signedCount,
          (SELECT COUNT(*) FROM signatures WHERE requestId = sr.id) as totalSigners
        FROM signature_requests sr
      `;
      
      if (input?.status) {
        query = sql`${query} WHERE sr.status = ${input.status}`;
      }
      
      query = sql`${query} ORDER BY sr.createdAt DESC`;
      
      const [requests] = await db.execute(query);
      return requests as unknown as any[];
    }),

  // Sign a document
  sign: protectedProcedure
    .input(z.object({
      signatureId: z.number(),
      signatureType: z.enum(["typed", "drawn", "uploaded"]),
      signatureData: z.string(), // Base64 or typed name
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify this signature belongs to the user
      const [existing] = await db.execute(sql`
        SELECT * FROM signatures WHERE id = ${input.signatureId} AND signerId = ${ctx.user.id}
      `);
      
      if (!(existing as unknown as any[]).length) {
        throw new Error("Signature not found or not authorized");
      }

      // Get IP address (would come from request in real implementation)
      const ipAddress = "127.0.0.1"; // Placeholder

      // Update signature
      await db.execute(sql`
        UPDATE signatures 
        SET signatureType = ${input.signatureType}, 
            signatureData = ${input.signatureData},
            signedAt = NOW(),
            ipAddress = ${ipAddress},
            status = 'signed'
        WHERE id = ${input.signatureId}
      `);

      // Check if all signatures are complete
      const sig = (existing as unknown as any[])[0];
      const [remaining] = await db.execute(sql`
        SELECT COUNT(*) as count FROM signatures 
        WHERE requestId = ${sig.requestId} AND status = 'pending'
      `);

      if ((remaining as unknown as any[])[0].count === 0) {
        // All signed - update request status
        await db.execute(sql`
          UPDATE signature_requests 
          SET status = 'completed', completedAt = NOW(), updatedAt = NOW()
          WHERE id = ${sig.requestId}
        `);
      } else {
        // Update to in_progress
        await db.execute(sql`
          UPDATE signature_requests 
          SET status = 'in_progress', updatedAt = NOW()
          WHERE id = ${sig.requestId} AND status = 'pending'
        `);
      }

      return { success: true, message: "Document signed successfully" };
    }),

  // Decline to sign
  decline: protectedProcedure
    .input(z.object({
      signatureId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.execute(sql`
        UPDATE signatures 
        SET status = 'declined', declineReason = ${input.reason || null}
        WHERE id = ${input.signatureId} AND signerId = ${ctx.user.id}
      `);

      return { success: true, message: "Signature declined" };
    }),

  // Get signature request details
  getRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [request] = await db.execute(sql`
        SELECT * FROM signature_requests WHERE id = ${input.requestId}
      `);
      
      const [signatures] = await db.execute(sql`
        SELECT * FROM signatures WHERE requestId = ${input.requestId}
      `);

      return {
        request: (request as unknown as any[])[0],
        signatures: signatures as unknown as any[],
      };
    }),

  // Cancel a signature request
  cancelRequest: adminProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.execute(sql`
        UPDATE signature_requests 
        SET status = 'cancelled', updatedAt = NOW()
        WHERE id = ${input.requestId}
      `);

      return { success: true, message: "Request cancelled" };
    }),

  // Sign a vault document
  signVaultDocument: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      signatureType: z.enum(["typed", "drawn", "uploaded"]),
      signatureData: z.string(),
      signerName: z.string(),
      signerTitle: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      console.log('[signVaultDocument] Starting with input:', JSON.stringify({ ...input, signatureData: input.signatureData.substring(0, 50) + '...' }));
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      console.log('[signVaultDocument] Database connected');
      
      try {
        // Create signature request for vault document
        console.log('[signVaultDocument] Creating signature request...');
        const [request] = await db.execute(sql`
          INSERT INTO signature_requests (documentId, documentType, documentTitle, requestedBy, status, createdAt, updatedAt)
          VALUES (${input.documentId}, 'trust_document', 'Vault Document Signature', ${ctx.user.id}, 'pending', NOW(), NOW())
        `);
        console.log('[signVaultDocument] Signature request created');

        const requestId = (request as any).insertId;
        console.log('[signVaultDocument] Request ID:', requestId);

        // Create signature record with actual signature data
        console.log('[signVaultDocument] Creating signature record...');
        const ipAddress = "127.0.0.1";
        const [sig] = await db.execute(sql`
          INSERT INTO signatures (signatureRequestId, signerId, signatureType, signatureText, signatureData, capturedIp, capturedUserAgent, legalAcknowledgment)
          VALUES (${requestId}, ${ctx.user.id}, ${input.signatureType}, ${input.signerName}, ${input.signatureData || null}, ${ipAddress}, ${'Manus System'}, 1)
        `);
        console.log('[signVaultDocument] Signature record created');

        const signatureId = (sig as any).insertId;
        console.log('[signVaultDocument] Signature ID:', signatureId);

        // Mark request as completed
        console.log('[signVaultDocument] Marking request as completed...');
        await db.execute(sql`
          UPDATE signature_requests 
          SET status = 'completed', completedAt = NOW(), updatedAt = NOW()
          WHERE id = ${requestId}
        `);
        console.log('[signVaultDocument] Request completed');

        // Log access - wrapped in try/catch to not fail the main operation
        try {
          await db.execute(sql`
            INSERT INTO vault_access_logs (vault_id, document_id, user_id, action, created_at)
            VALUES (1, ${input.documentId}, ${ctx.user.id}, 'sign', NOW())
          `);
        } catch (logError) {
          console.warn('Failed to log vault access:', logError);
        }

        console.log('[signVaultDocument] Success!');
        return { success: true, signatureId, message: "Document signed successfully" };
      } catch (error) {
        console.error('[signVaultDocument] Error:', error);
        throw error;
      }
    }),

  // Get vault document signatures
  getDocumentSignatures: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [signatures] = await db.execute(sql`
        SELECT s.*, sr.documentTitle, sr.completedAt
        FROM signatures s
        JOIN signature_requests sr ON s.requestId = sr.id
        WHERE sr.documentId = ${input.documentId}
        ORDER BY s.signedAt DESC
      `);

      return signatures as unknown as any[];
    }),

  // Store user's signature on file
  saveSignatureOnFile: protectedProcedure
    .input(z.object({
      signatureType: z.enum(["typed", "drawn", "uploaded"]),
      signatureData: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Check if user is a board member
      const [member] = await db.execute(sql`
        SELECT * FROM board_members WHERE userId = ${ctx.user.id}
      `);

      if ((member as unknown as any[]).length) {
        await db.execute(sql`
          UPDATE board_members 
          SET signatureOnFile = ${input.signatureData}, updatedAt = NOW()
          WHERE userId = ${ctx.user.id}
        `);
      }

      return { success: true, message: "Signature saved on file" };
    }),
});
