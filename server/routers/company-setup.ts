import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  businessEntities,
  luvLedgerAccounts,
  blockchainRecords,
  activityAuditTrail,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";


export const companySetupRouter = router({
  // Create a business entity
  createBusinessEntity: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        entityType: z.enum(["trust", "llc", "corporation", "collective"]),
        description: z.string().optional(),
        allocationPercentage: z.number().min(0).max(100),
        trustLevel: z.number().default(1).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Create business entity
      const entityResult = await db.insert(businessEntities).values({
        userId: ctx.user.id,
        name: input.name,
        entityType: input.entityType,
        description: input.description,
        trustLevel: input.trustLevel || 1,
        status: "active",
      });

      const entityId = entityResult[0].insertId;

      // Create corresponding LuvLedger account
      const accountResult = await db.insert(luvLedgerAccounts).values({
        userId: ctx.user.id,
        businessEntityId: entityId,
        accountType: input.entityType as "personal" | "entity" | "collective" | "trust",
        accountName: input.name,
        allocationPercentage: input.allocationPercentage.toString(),
        status: "active",
      });

      const accountId = accountResult[0].insertId;

      // Create blockchain record
      const txHash = generateTransactionHash();
      await db.insert(blockchainRecords).values({
        recordType: "entity_creation",
        referenceId: entityId,
        blockchainHash: txHash,
        data: {
          entityId: entityId,
          entityName: input.name,
          entityType: input.entityType,
          accountId: accountId,
          allocationPercentage: input.allocationPercentage,
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "entity_created",
        action: "create",
        details: {
          entityId: entityId,
          entityName: input.name,
          entityType: input.entityType,
          accountId: accountId,
          blockchainHash: txHash,
        } as any,
      });

      return {
        entityId: entityId,
        accountId: accountId,
        blockchainHash: txHash,
        status: "created",
      };
    }),

  // Get all business entities (public for dashboard viewing)
  getAllEntities: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    // Return all entities for public viewing
    const entities = await db
      .select()
      .from(businessEntities);

    return entities;
  }),

  // Get entity with allocation details
  getEntityDetails: protectedProcedure
    .input(z.object({ entityId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const entities = await db
        .select()
        .from(businessEntities)
        .where(eq(businessEntities.id, input.entityId));

      if (entities.length === 0) return null;
      const entity = entities[0];

      // Get LuvLedger account
      const accounts = await db
        .select()
        .from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.businessEntityId, input.entityId));

      const account = accounts.length > 0 ? accounts[0] : null;

      return {
        entity: entity,
        account: account,
      };
    }),

  // Update allocation percentage
  updateAllocationPercentage: protectedProcedure
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

      // Update LuvLedger account
      const accounts = await db
        .select()
        .from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.businessEntityId, input.entityId));

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
          newPercentage: input.newPercentage,
          reason: input.reason,
          timestamp: new Date().toISOString(),
        } as any,
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "allocation_updated",
        action: "update",
        details: {
          entityId: input.entityId,
          entityName: entity.name,
          newPercentage: input.newPercentage,
          reason: input.reason,
          blockchainHash: txHash,
        } as any,
      });

      return {
        entityId: input.entityId,
        newPercentage: input.newPercentage,
        blockchainHash: txHash,
        status: "updated",
      };
    }),

  // Get allocation summary
  getAllocationSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const accounts = await db
      .select()
      .from(luvLedgerAccounts)
      .where(eq(luvLedgerAccounts.userId, ctx.user.id));

    const summary = {
      totalAllocation: 0,
      byEntity: {} as Record<string, number>,
      entities: [] as any[],
    };

    accounts.forEach((account) => {
      const percentage = Number(account.allocationPercentage);
      summary.totalAllocation += percentage;
      summary.byEntity[account.accountName] = percentage;
      summary.entities.push({
        name: account.accountName,
        type: account.accountType,
        percentage: percentage,
      });
    });

    return summary;
  }),

  // Get entity performance metrics
  getEntityPerformance: protectedProcedure
    .input(z.object({ entityId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const entities = await db
        .select()
        .from(businessEntities)
        .where(eq(businessEntities.id, input.entityId));

      if (entities.length === 0) return null;
      const entity = entities[0];

      // Get blockchain records for this entity
      const records = await db.select().from(blockchainRecords);
      const entityRecords = records.filter(
        (r) => r.referenceId === input.entityId
      );

      return {
        entityId: input.entityId,
        entityName: entity.name,
        entityType: entity.entityType,
        status: entity.status,
        totalRecords: entityRecords.length,
        recordTypes: entityRecords.reduce(
          (acc, r) => {
            if (!acc[r.recordType]) acc[r.recordType] = 0;
            acc[r.recordType]++;
            return acc;
          },
          {} as Record<string, number>
        ),
        lastActivity: entityRecords.length > 0 ? entityRecords[0].timestamp : null,
      };
    }),

  // Create default company structure
  setupDefaultStructure: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const results = [];

    // Create Trust (Root)
    const trustResult = await db.insert(businessEntities).values({
      userId: ctx.user.id,
      name: "98 Trust",
      entityType: "trust",
      description: "Root holding authority, lineage anchor, protection layer",
      trustLevel: 5,
      status: "active",
    });
    const trustId = trustResult[0].insertId;

    const trustAccountResult = await db.insert(luvLedgerAccounts).values({
      userId: ctx.user.id,
      businessEntityId: trustId,
      accountType: "trust",
      accountName: "98 Trust",
      allocationPercentage: "100",
      status: "active",
    });

    results.push({
      name: "98 Trust",
      entityId: trustId,
      accountId: trustAccountResult[0].insertId,
      percentage: 100,
    });

    // Create Commercial Engine (40%)
    const commercialResult = await db.insert(businessEntities).values({
      userId: ctx.user.id,
      name: "LuvOnPurpose Autonomous Wealth System, LLC",
      entityType: "llc",
      description: "Commercial engine for products and IP monetization",
      trustLevel: 3,
      status: "active",
    });
    const commercialId = commercialResult[0].insertId;

    const commercialAccountResult = await db.insert(luvLedgerAccounts).values({
      userId: ctx.user.id,
      businessEntityId: commercialId,
      accountType: "entity",
      accountName: "LuvOnPurpose Autonomous Wealth System, LLC",
      allocationPercentage: "40",
      status: "active",
    });

    results.push({
      name: "LuvOnPurpose Autonomous Wealth System, LLC",
      entityId: commercialId,
      accountId: commercialAccountResult[0].insertId,
      percentage: 40,
    });

    // Create Education (30%)
    const educationResult = await db.insert(businessEntities).values({
      userId: ctx.user.id,
      name: "LuvOnPurpose Academy & Outreach",
      entityType: "llc",
      description: "Education and community interface",
      trustLevel: 3,
      status: "active",
    });
    const educationId = educationResult[0].insertId;

    const educationAccountResult = await db.insert(luvLedgerAccounts).values({
      userId: ctx.user.id,
      businessEntityId: educationId,
      accountType: "entity",
      accountName: "LuvOnPurpose Academy & Outreach",
      allocationPercentage: "30",
      status: "active",
    });

    results.push({
      name: "LuvOnPurpose Academy & Outreach",
      entityId: educationId,
      accountId: educationAccountResult[0].insertId,
      percentage: 30,
    });

    // Create Media (20%)
    const mediaResult = await db.insert(businessEntities).values({
      userId: ctx.user.id,
      name: "Real-Eye-Nation",
      entityType: "collective",
      description: "Media, narrative, and cultural restoration arm",
      trustLevel: 2,
      status: "active",
    });
    const mediaId = mediaResult[0].insertId;

    const mediaAccountResult = await db.insert(luvLedgerAccounts).values({
      userId: ctx.user.id,
      businessEntityId: mediaId,
      accountType: "collective",
      accountName: "Real-Eye-Nation",
      allocationPercentage: "20",
      status: "active",
    });

    results.push({
      name: "Real-Eye-Nation",
      entityId: mediaId,
      accountId: mediaAccountResult[0].insertId,
      percentage: 20,
    });

    // Create Platform (10%)
    const platformResult = await db.insert(businessEntities).values({
      userId: ctx.user.id,
      name: "The L.A.W.S. Collective LLC",
      entityType: "collective",
      description: "Curriculum and simulation platform infrastructure",
      trustLevel: 2,
      status: "active",
    });
    const platformId = platformResult[0].insertId;

    const platformAccountResult = await db.insert(luvLedgerAccounts).values({
      userId: ctx.user.id,
      businessEntityId: platformId,
      accountType: "collective",
      accountName: "The L.A.W.S. Collective LLC",
      allocationPercentage: "10",
      status: "active",
    });

    results.push({
      name: "The L.A.W.S. Collective LLC",
      entityId: platformId,
      accountId: platformAccountResult[0].insertId,
      percentage: 10,
    });

    // Log to audit trail
    await db.insert(activityAuditTrail).values({
      userId: ctx.user.id,
      activityType: "default_structure_created",
      action: "create",
      details: {
        entitiesCreated: results.length,
        entities: results,
      } as any,
    });

    return {
      status: "created",
      entitiesCreated: results.length,
      entities: results,
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
