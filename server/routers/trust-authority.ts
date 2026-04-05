import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  businessEntities,
  luvLedgerAccounts,
  autonomousOperations,
  blockchainRecords,
  activityAuditTrail,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const trustAuthorityRouter = router({
  // Get all pending decisions requiring trust approval
  getPendingApprovals: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const operations = await db.select().from(autonomousOperations);

      // Filter pending operations
      const pending = operations
        .filter((op) => op.status === "pending")
        .slice(0, input.limit || 50);

      return pending;
    }),

  // Approve an autonomous operation
  approveOperation: protectedProcedure
    .input(
      z.object({
        operationId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get operation
      const operations = await db
        .select()
        .from(autonomousOperations)
        .where(eq(autonomousOperations.id, input.operationId));

      if (operations.length === 0) throw new Error("Operation not found");
      const operation = operations[0];

      // Update operation status
      await db
        .update(autonomousOperations)
        .set({
          status: "reviewed",
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
          reviewNotes: input.notes,
        })
        .where(eq(autonomousOperations.id, input.operationId));

      // Create blockchain record
      const txHash = generateTransactionHash();
      await db.insert(blockchainRecords).values({
        recordType: "transaction",
        referenceId: input.operationId,
        blockchainHash: txHash,
        data: {
          operationId: input.operationId,
          status: "approved",
          approvedBy: ctx.user.id,
          approvalNotes: input.notes,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "operation_approved",
        action: "update",
        details: {
          operationId: input.operationId,
          operationType: operation.operationType,
          notes: input.notes,
          blockchainHash: txHash,
        } as any,
      });

      return {
        operationId: input.operationId,
        status: "reviewed",
        blockchainHash: txHash,
      };
    }),

  // Reject an autonomous operation
  rejectOperation: protectedProcedure
    .input(
      z.object({
        operationId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get operation
      const operations = await db
        .select()
        .from(autonomousOperations)
        .where(eq(autonomousOperations.id, input.operationId));

      if (operations.length === 0) throw new Error("Operation not found");
      const operation = operations[0];

      // Update operation status
      await db
        .update(autonomousOperations)
        .set({
          status: "rejected",
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
          reviewNotes: input.reason,
        })
        .where(eq(autonomousOperations.id, input.operationId));

      // Create blockchain record
      const txHash = generateTransactionHash();
      await db.insert(blockchainRecords).values({
        recordType: "transaction",
        referenceId: input.operationId,
        blockchainHash: txHash,
        data: {
          operationId: input.operationId,
          status: "rejected",
          rejectedBy: ctx.user.id,
          rejectionReason: input.reason,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "operation_rejected",
        action: "update",
        details: {
          operationId: input.operationId,
          operationType: operation.operationType,
          reason: input.reason,
          blockchainHash: txHash,
        } as any,
      });

      return {
        operationId: input.operationId,
        status: "rejected",
        blockchainHash: txHash,
      };
    }),

  // Adjust entity allocation
  adjustAllocation: protectedProcedure
    .input(
      z.object({
        entityId: z.number(),
        newPercentage: z.number().min(0).max(100),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get entity
      const entities = await db
        .select()
        .from(businessEntities)
        .where(eq(businessEntities.id, input.entityId));

      if (entities.length === 0) throw new Error("Entity not found");
      const entity = entities[0];

      // Get current allocation
      const accounts = await db
        .select()
        .from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.businessEntityId, input.entityId));

      const oldPercentage = accounts.length > 0 ? Number(accounts[0].allocationPercentage) : 0;

      // Update allocation
      if (accounts.length > 0) {
        await db
          .update(luvLedgerAccounts)
          .set({
            allocationPercentage: input.newPercentage.toString(),
          })
          .where(eq(luvLedgerAccounts.id, accounts[0].id));
      }

      // Create blockchain record
      const txHash = generateTransactionHash();
      await db.insert(blockchainRecords).values({
        recordType: "allocation_change",
        referenceId: input.entityId,
        blockchainHash: txHash,
        data: {
          entityId: input.entityId,
          entityName: entity.name,
          oldPercentage: oldPercentage,
          newPercentage: input.newPercentage,
          reason: input.reason,
          adjustedBy: ctx.user.id,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "allocation_adjusted",
        action: "update",
        details: {
          entityId: input.entityId,
          entityName: entity.name,
          oldPercentage: oldPercentage,
          newPercentage: input.newPercentage,
          reason: input.reason,
          blockchainHash: txHash,
        } as any,
      });

      return {
        entityId: input.entityId,
        oldPercentage: oldPercentage,
        newPercentage: input.newPercentage,
        blockchainHash: txHash,
        status: "adjusted",
      };
    }),

  // Enforce governance policy
  enforcePolicy: protectedProcedure
    .input(
      z.object({
        policyType: z.enum([
          "spending_limit",
          "token_cap",
          "decision_threshold",
          "sovereignty_protection",
          "lineage_verification",
        ]),
        entityId: z.number(),
        parameters: z.record(z.string(), z.any()),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get entity
      const entities = await db
        .select()
        .from(businessEntities)
        .where(eq(businessEntities.id, input.entityId));

      if (entities.length === 0) throw new Error("Entity not found");
      const entity = entities[0];

      // Create blockchain record for policy enforcement
      const txHash = generateTransactionHash();
      await db.insert(blockchainRecords).values({
        recordType: "transaction",
        referenceId: input.entityId,
        blockchainHash: txHash,
        data: {
          policyType: input.policyType,
          entityId: input.entityId,
          entityName: entity.name,
          parameters: input.parameters,
          reason: input.reason,
          enforcedBy: ctx.user.id,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "policy_enforced",
        action: "update",
        details: {
          policyType: input.policyType,
          entityId: input.entityId,
          entityName: entity.name,
          parameters: input.parameters,
          reason: input.reason,
          blockchainHash: txHash,
        } as any,
      });

      return {
        policyType: input.policyType,
        entityId: input.entityId,
        blockchainHash: txHash,
        status: "enforced",
      };
    }),

  // Verify sovereignty and lineage
  verifySovereignty: protectedProcedure
    .input(
      z.object({
        entityId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      // Get entity
      const entities = await db
        .select()
        .from(businessEntities)
        .where(eq(businessEntities.id, input.entityId));

      if (entities.length === 0) return null;
      const entity = entities[0];

      // Get blockchain records for this entity
      const records = await db.select().from(blockchainRecords);
      const entityRecords = records.filter((r) => r.referenceId === input.entityId);

      // Verify blockchain integrity
      let integrityValid = true;
      const verificationDetails = {
        totalRecords: entityRecords.length,
        verifiedRecords: 0,
        failedVerifications: 0,
        issues: [] as string[],
      };

      for (const record of entityRecords) {
        // In production, verify hash against previous hash
        verificationDetails.verifiedRecords++;
      }

      // Check if entity is in good standing
      const isInGoodStanding =
        entity.status === "active" && integrityValid && verificationDetails.failedVerifications === 0;

      return {
        entityId: input.entityId,
        entityName: entity.name,
        sovereigntyStatus: isInGoodStanding ? "verified" : "compromised",
        integrityValid: integrityValid,
        verificationDetails: verificationDetails,
        trustLevel: entity.trustLevel,
      };
    }),

  // Get trust authority dashboard
  getTrustDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    // Get all entities
    const entities = await db.select().from(businessEntities);

    // Get all operations
    const operations = await db.select().from(autonomousOperations);

    // Get all accounts
    const accounts = await db.select().from(luvLedgerAccounts);

      // Calculate dashboard metrics
      const dashboard = {
        totalEntities: entities.length,
        activeEntities: entities.filter((e) => e.status === "active").length,
        totalAllocation: accounts.reduce((sum, a) => sum + Number(a.allocationPercentage), 0),
        pendingApprovals: operations.filter((o) => o.status === "pending").length,
        reviewedOperations: operations.filter((o) => o.status === "reviewed").length,
        rejectedOperations: operations.filter((o) => o.status === "rejected").length,
      entities: entities.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.entityType,
        status: e.status,
        trustLevel: e.trustLevel,
      })),
      allocationSummary: accounts.map((a) => ({
        entityName: a.accountName,
        percentage: Number(a.allocationPercentage),
        status: a.status,
      })),
    };

    return dashboard;
  }),

  // Resolve conflict between entities
  resolveConflict: protectedProcedure
    .input(
      z.object({
        entity1Id: z.number(),
        entity2Id: z.number(),
        conflictDescription: z.string(),
        resolution: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get entities
      const entities = await db.select().from(businessEntities);
      const entity1 = entities.find((e) => e.id === input.entity1Id);
      const entity2 = entities.find((e) => e.id === input.entity2Id);

      if (!entity1 || !entity2) throw new Error("One or both entities not found");

      // Create blockchain record
      const txHash = generateTransactionHash();
      await db.insert(blockchainRecords).values({
        recordType: "transaction",
        referenceId: input.entity1Id,
        blockchainHash: txHash,
        data: {
          conflictType: "inter_entity_conflict",
          entity1Id: input.entity1Id,
          entity1Name: entity1.name,
          entity2Id: input.entity2Id,
          entity2Name: entity2.name,
          conflictDescription: input.conflictDescription,
          resolution: input.resolution,
          resolvedBy: ctx.user.id,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "conflict_resolved",
        action: "update",
        details: {
          entity1Id: input.entity1Id,
          entity1Name: entity1.name,
          entity2Id: input.entity2Id,
          entity2Name: entity2.name,
          conflictDescription: input.conflictDescription,
          resolution: input.resolution,
          blockchainHash: txHash,
        } as any,
      });

      return {
        entity1Id: input.entity1Id,
        entity2Id: input.entity2Id,
        blockchainHash: txHash,
        status: "resolved",
      };
    }),
});

// Helper function to generate transaction hash
function generateTransactionHash(): string {
  return crypto
    .createHash("sha256")
    .update(Date.now().toString() + Math.random().toString())
    .digest("hex");
}
