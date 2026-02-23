import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { businessEntities, autonomousOperations, activityAuditTrail, luvLedgerTransactions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const autonomousEngineRouter = router({
  // Execute autonomous business operation
  executeOperation: protectedProcedure
    .input(
      z.object({
        businessEntityId: z.number(),
        operationType: z.enum(["revenue_generation", "expense_management", "allocation_distribution", "market_analysis", "strategic_decision"]),
        context: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get business entity
      const entity = await db
        .select()
        .from(businessEntities)
        .where(eq(businessEntities.id, input.businessEntityId))
        .limit(1);

      if (!entity.length) throw new Error("Business entity not found");

      // Use LLM to generate autonomous decision
      const prompt = `You are an autonomous business AI managing a ${entity[0].entityType} entity named "${entity[0].name}". 
      
Operation Type: ${input.operationType}
Current Status: ${entity[0].status}
Trust Level: ${entity[0].trustLevel}
Context: ${JSON.stringify(input.context || {})}

Generate a JSON response with:
{
  "decision": "specific action to take",
  "reasoning": "why this decision was made",
  "expectedOutcome": "predicted result",
  "riskLevel": "low|medium|high",
  "metrics": { "key": "value" }
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an autonomous business operations AI. Respond only with valid JSON." },
          { role: "user", content: prompt },
        ],
      });

      let decision;
      try {
        const messageContent = response.choices[0]?.message.content;
        const content = typeof messageContent === "string" ? messageContent : "{}";
        decision = JSON.parse(content);
      } catch {
        decision = {
          decision: "Hold current operations",
          reasoning: "Unable to parse AI response",
          expectedOutcome: "Maintain status quo",
          riskLevel: "low" as const,
          metrics: {},
        };
      }

      // Record autonomous operation
      const operationResult = await db.insert(autonomousOperations).values({
        businessEntityId: input.businessEntityId,
        operationType: input.operationType,
        decision: decision,
        reasoning: decision.reasoning,
        status: "pending",
      });

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "autonomous_operation",
        entityType: "business_entity",
        entityId: input.businessEntityId,
        action: "operation_executed",
        details: {
          operationType: input.operationType,
          decision: decision,
        } as any,
      });

      return {
        operationId: operationResult[0] as any,
        decision,
        status: "pending",
      };
    }),

  // Review autonomous operation
  reviewOperation: protectedProcedure
    .input(
      z.object({
        operationId: z.number(),
        approved: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Update operation status
      await db
        .update(autonomousOperations)
        .set({
          status: input.approved ? "executed" : "rejected",
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
          reviewNotes: input.notes,
        })
        .where(eq(autonomousOperations.id, input.operationId));

      // Log review to audit trail
      const operation = await db
        .select()
        .from(autonomousOperations)
        .where(eq(autonomousOperations.id, input.operationId))
        .limit(1);

      if (operation.length) {
        await db.insert(activityAuditTrail).values({
          userId: ctx.user.id,
          activityType: "operation_review",
          entityType: "autonomous_operation",
          entityId: input.operationId,
          action: input.approved ? "approved" : "rejected",
          details: {
            notes: input.notes,
          } as any,
        });
      }

      return { success: true, status: input.approved ? "executed" : "rejected" };
    }),

  // Get pending operations for review
  getPendingOperations: protectedProcedure
    .input(
      z.object({
        businessEntityId: z.number().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let conditions = [eq(autonomousOperations.status, "pending")];
      if (input.businessEntityId) {
        conditions.push(eq(autonomousOperations.businessEntityId, input.businessEntityId));
      }

      const operations = await db
        .select()
        .from(autonomousOperations)
        .where(and(...conditions))
        .limit(input.limit);
      return operations;
    }),

  // Get operation history
  getOperationHistory: protectedProcedure
    .input(
      z.object({
        businessEntityId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const operations = await db
        .select()
        .from(autonomousOperations)
        .where(eq(autonomousOperations.businessEntityId, input.businessEntityId))
        .limit(input.limit);

      return operations;
    }),

  // Generate business metrics and performance report
  generatePerformanceReport: protectedProcedure
    .input(
      z.object({
        businessEntityId: z.number(),
        period: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      // Get business entity
      const entity = await db
        .select()
        .from(businessEntities)
        .where(eq(businessEntities.id, input.businessEntityId))
        .limit(1);

      if (!entity.length) throw new Error("Business entity not found");

      // Get recent operations
      const operations = await db
        .select()
        .from(autonomousOperations)
        .where(eq(autonomousOperations.businessEntityId, input.businessEntityId))
        .limit(100);

      // Get recent transactions
      const transactions = await db
        .select()
        .from(luvLedgerTransactions)
        .limit(100);

      return {
        businessEntity: entity[0],
        period: input.period,
        operationsCount: operations.length,
        executedOperations: operations.filter((o) => o.status === "executed").length,
        rejectedOperations: operations.filter((o) => o.status === "rejected").length,
        recentOperations: operations.slice(0, 10),
        transactionVolume: transactions.length,
        generatedAt: new Date(),
      };
    }),
});
