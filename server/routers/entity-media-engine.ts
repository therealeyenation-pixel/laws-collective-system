import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  autonomousOperations,
  businessEntities,
  blockchainRecords,
  activityAuditTrail,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const entityMediaEngineRouter = router({
  // Generate narrative content from business data
  generateNarrativeContent: protectedProcedure
    .input(
      z.object({
        entityId: z.number(),
        contentType: z.enum(["article", "story", "documentation", "report", "case_study"]),
        sourceData: z.string(),
        targetAudience: z.enum(["general", "academic", "community", "professional"]),
        tone: z.enum(["formal", "conversational", "inspiring", "educational"]),
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

      // Create autonomous operation
      const decision = {
        type: "narrative_generation",
        contentType: input.contentType,
        sourceData: input.sourceData,
        targetAudience: input.targetAudience,
        tone: input.tone,
        reasoning: `Generate ${input.contentType} content from business data for ${input.targetAudience} audience`,
      };

      const operationResult = await db.insert(autonomousOperations).values({
        businessEntityId: input.entityId,
        operationType: "narrative_generation",
        decision: decision,
        reasoning: decision.reasoning,
        status: "pending",
      });

      const operationId = operationResult[0].insertId;

      // Create blockchain record
      const txHash = generateTransactionHash();
      await db.insert(blockchainRecords).values({
        recordType: "transaction",
        referenceId: operationId,
        blockchainHash: txHash,
        data: {
          operationType: "narrative_generation",
          entityId: input.entityId,
          entityName: entity.name,
          contentType: input.contentType,
          targetAudience: input.targetAudience,
          tone: input.tone,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "narrative_generated",
        action: "create",
        details: {
          operationId: operationId,
          entityId: input.entityId,
          contentType: input.contentType,
          targetAudience: input.targetAudience,
          blockchainHash: txHash,
        } as any,
      });

      return {
        operationId: operationId,
        contentType: input.contentType,
        status: "pending_approval",
        blockchainHash: txHash,
      };
    }),

  // Create truth-mapping documentation
  createTruthMapping: protectedProcedure
    .input(
      z.object({
        entityId: z.number(),
        subject: z.string(),
        sourceDocuments: z.array(z.string()),
        verificationLevel: z.enum(["primary_source", "secondary_source", "verified", "disputed"]),
        narrative: z.string(),
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

      // Create autonomous operation
      const decision = {
        type: "truth_mapping",
        subject: input.subject,
        sourceDocuments: input.sourceDocuments,
        verificationLevel: input.verificationLevel,
        narrative: input.narrative,
        mappingId: `TM-${Date.now()}`,
      };

      const operationResult = await db.insert(autonomousOperations).values({
        businessEntityId: input.entityId,
        operationType: "truth_mapping",
        decision: decision,
        reasoning: `Create truth-mapping documentation for ${input.subject} with ${input.verificationLevel} verification`,
        status: "pending",
      });

      const operationId = operationResult[0].insertId;

      // Create blockchain record
      const txHash = generateTransactionHash();
      await db.insert(blockchainRecords).values({
        recordType: "transaction",
        referenceId: operationId,
        blockchainHash: txHash,
        data: {
          operationType: "truth_mapping",
          entityId: input.entityId,
          entityName: entity.name,
          subject: input.subject,
          verificationLevel: input.verificationLevel,
          mappingId: decision.mappingId,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "truth_mapping_created",
        action: "create",
        details: {
          operationId: operationId,
          entityId: input.entityId,
          subject: input.subject,
          mappingId: decision.mappingId,
          blockchainHash: txHash,
        } as any,
      });

      return {
        operationId: operationId,
        mappingId: decision.mappingId,
        status: "pending_approval",
        blockchainHash: txHash,
      };
    }),

  // Schedule media publication
  schedulePublication: protectedProcedure
    .input(
      z.object({
        entityId: z.number(),
        contentTitle: z.string(),
        publicationDate: z.date(),
        distributionChannels: z.array(z.enum(["website", "social_media", "newsletter", "print", "podcast"])),
        expectedReach: z.number(),
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

      // Create autonomous operation
      const decision = {
        type: "publication_scheduling",
        contentTitle: input.contentTitle,
        publicationDate: input.publicationDate.toISOString(),
        distributionChannels: input.distributionChannels,
        expectedReach: input.expectedReach,
      };

      const operationResult = await db.insert(autonomousOperations).values({
        businessEntityId: input.entityId,
        operationType: "publication_scheduling",
        decision: decision,
        reasoning: `Schedule publication of "${input.contentTitle}" across ${input.distributionChannels.length} channels`,
        status: "pending",
      });

      const operationId = operationResult[0].insertId;

      // Create blockchain record
      const txHash = generateTransactionHash();
      await db.insert(blockchainRecords).values({
        recordType: "transaction",
        referenceId: operationId,
        blockchainHash: txHash,
        data: {
          operationType: "publication_scheduling",
          entityId: input.entityId,
          entityName: entity.name,
          contentTitle: input.contentTitle,
          publicationDate: input.publicationDate.toISOString(),
          distributionChannels: input.distributionChannels,
          expectedReach: input.expectedReach,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "publication_scheduled",
        action: "create",
        details: {
          operationId: operationId,
          entityId: input.entityId,
          contentTitle: input.contentTitle,
          distributionChannels: input.distributionChannels,
          blockchainHash: txHash,
        } as any,
      });

      return {
        operationId: operationId,
        contentTitle: input.contentTitle,
        status: "pending_approval",
        blockchainHash: txHash,
      };
    }),

  // Track narrative impact
  trackNarrativeImpact: protectedProcedure
    .input(
      z.object({
        contentId: z.number(),
        contentTitle: z.string(),
        views: z.number(),
        shares: z.number(),
        comments: z.number(),
        sentiment: z.enum(["positive", "neutral", "negative"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Calculate impact score
      const impactScore = input.views * 0.3 + input.shares * 0.5 + input.comments * 0.2;

      // Create autonomous operation
      const decision = {
        type: "impact_tracking",
        contentId: input.contentId,
        contentTitle: input.contentTitle,
        views: input.views,
        shares: input.shares,
        comments: input.comments,
        sentiment: input.sentiment,
        impactScore: impactScore,
      };

      const operationResult = await db.insert(autonomousOperations).values({
        businessEntityId: 0, // Would be linked to media entity
        operationType: "impact_tracking",
        decision: decision,
        reasoning: `Track narrative impact for "${input.contentTitle}" with impact score ${impactScore.toFixed(2)}`,
        status: "pending",
      });

      const operationId = operationResult[0].insertId;

      // Create blockchain record
      const txHash = generateTransactionHash();
      await db.insert(blockchainRecords).values({
        recordType: "transaction",
        referenceId: operationId,
        blockchainHash: txHash,
        data: {
          operationType: "impact_tracking",
          contentId: input.contentId,
          contentTitle: input.contentTitle,
          impactScore: impactScore,
          sentiment: input.sentiment,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "impact_tracked",
        action: "update",
        details: {
          operationId: operationId,
          contentId: input.contentId,
          contentTitle: input.contentTitle,
          impactScore: impactScore,
          blockchainHash: txHash,
        } as any,
      });

      return {
        operationId: operationId,
        contentTitle: input.contentTitle,
        impactScore: impactScore,
        status: "recorded",
        blockchainHash: txHash,
      };
    }),

  // Get media metrics
  getMediaMetrics: protectedProcedure
    .input(z.object({ entityId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      // Get all operations for this entity
      const operations = await db
        .select()
        .from(autonomousOperations)
        .where(eq(autonomousOperations.businessEntityId, input.entityId));

      // Calculate media metrics
      const metrics = {
        totalOperations: operations.length,
        narrativeGenerated: operations.filter((o) => o.operationType === "narrative_generation").length,
        truthMappingsCreated: operations.filter((o) => o.operationType === "truth_mapping").length,
        publicationsScheduled: operations.filter((o) => o.operationType === "publication_scheduling").length,
        impactTracked: operations.filter((o) => o.operationType === "impact_tracking").length,
        approvedOperations: operations.filter((o) => o.status === "reviewed").length,
      };

      // Calculate total reach
      let totalReach = 0;
      operations
        .filter((o) => o.operationType === "publication_scheduling" && o.status === "reviewed")
        .forEach((op) => {
          const decision = op.decision as any;
          if (decision.expectedReach) {
            totalReach += decision.expectedReach;
          }
        });

      return {
        entityId: input.entityId,
        metrics: metrics,
        totalReach: totalReach,
        contentProductionRate: metrics.narrativeGenerated / Math.max(1, metrics.totalOperations),
      };
    }),

  // Generate narrative impact report
  generateNarrativeReport: protectedProcedure
    .input(
      z.object({
        entityId: z.number(),
        reportPeriod: z.enum(["monthly", "quarterly", "annual"]),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      // Get all operations for this entity
      const operations = await db
        .select()
        .from(autonomousOperations)
        .where(eq(autonomousOperations.businessEntityId, input.entityId));

      // Calculate report metrics
      const report = {
        entityId: input.entityId,
        reportPeriod: input.reportPeriod,
        generatedAt: new Date().toISOString(),
        summary: {
          contentPiecesGenerated: operations.filter((o) => o.operationType === "narrative_generation").length,
          truthMappingsCreated: operations.filter((o) => o.operationType === "truth_mapping").length,
          publicationsScheduled: operations.filter((o) => o.operationType === "publication_scheduling").length,
          totalReach: 0,
        },
        narrativeImpact: {
          totalImpactScore: 0,
          averageSentiment: "neutral",
          topContent: [] as any[],
        },
      };

      // Calculate total reach and impact
      operations
        .filter((o) => o.operationType === "publication_scheduling" && o.status === "reviewed")
        .forEach((op) => {
          const decision = op.decision as any;
          if (decision.expectedReach) {
            report.summary.totalReach += decision.expectedReach;
          }
        });

      operations
        .filter((o) => o.operationType === "impact_tracking")
        .forEach((op) => {
          const decision = op.decision as any;
          if (decision.impactScore) {
            report.narrativeImpact.totalImpactScore += decision.impactScore;
          }
        });

      return report;
    }),
});

// Helper function to generate transaction hash
function generateTransactionHash(): string {
  return crypto
    .createHash("sha256")
    .update(Date.now().toString() + Math.random().toString())
    .digest("hex");
}
