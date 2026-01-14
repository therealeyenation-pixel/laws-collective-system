import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { businessEntities, simulatorSessions, certificates, luvLedgerAccounts, trustRelationships } from "../../drizzle/schema";
import { getUserBusinessEntities, getUserCertificates, getUserLuvLedgerAccounts, getTrustRelationshipsForUser } from "../db";

export const luvSystemRouter = router({
  // Business Entities
  getMyEntities: protectedProcedure.query(async ({ ctx }) => {
    return getUserBusinessEntities(ctx.user.id);
  }),

  createEntity: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        entityType: z.enum(["trust", "llc", "corporation", "collective"]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(businessEntities).values({
        userId: ctx.user.id,
        name: input.name,
        entityType: input.entityType,
        description: input.description,
        status: "draft",
        trustLevel: 1,
      });

      return result;
    }),

  // Simulator Sessions
  getMySimulators: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(simulatorSessions).where(eq(simulatorSessions.userId, ctx.user.id));
  }),

  startSimulator: protectedProcedure
    .input(
      z.object({
        simulatorType: z.enum(["business_setup", "financial_management", "entity_operations"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(simulatorSessions).values({
        userId: ctx.user.id,
        simulatorType: input.simulatorType,
        currentTurn: 0,
        totalTurns: 12,
        status: "in_progress",
        score: 0,
        gameState: { turns: [] },
      });

      return result;
    }),

  // Certificates
  getMyCertificates: protectedProcedure.query(async ({ ctx }) => {
    return getUserCertificates(ctx.user.id);
  }),

  // LuvLedger Accounts
  getMyLuvLedgerAccounts: protectedProcedure.query(async ({ ctx }) => {
    return getUserLuvLedgerAccounts(ctx.user.id);
  }),

  // Trust Relationships
  getMyTrustRelationships: protectedProcedure.query(async ({ ctx }) => {
    return getTrustRelationshipsForUser(ctx.user.id);
  }),

  // System Overview
  getSystemOverview: protectedProcedure.query(async ({ ctx }) => {
    const entities = await getUserBusinessEntities(ctx.user.id);
    const certificates = await getUserCertificates(ctx.user.id);
    const accounts = await getUserLuvLedgerAccounts(ctx.user.id);
    const trusts = await getTrustRelationshipsForUser(ctx.user.id);

    return {
      entitiesCount: entities.length,
      certificatesCount: certificates.length,
      accountsCount: accounts.length,
      trustRelationshipsCount: trusts.length,
      entities,
      certificates,
      accounts,
      trusts,
    };
  }),
});
