import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { simulatorSessions, certificates, businessEntities } from "../../drizzle/schema";
import { getDb } from "../db";

export const simulatorsRouter = router({
  // Start a new simulator session
  startSimulator: protectedProcedure
    .input(
      z.object({
        simulatorType: z.enum(["business_setup", "financial_management", "entity_operations", "grant_creation"]),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const totalTurns = 
        input.difficulty === "beginner" ? 8 : 
        input.difficulty === "intermediate" ? 12 : 16;

      await db.insert(simulatorSessions).values({
        userId: ctx.user.id,
        simulatorType: input.simulatorType,
        currentTurn: 0,
        totalTurns,
        status: "in_progress",
        score: 0,
        gameState: {
          difficulty: input.difficulty,
          decisions: [],
          kpis: {},
        },
      });

      return { success: true };
    }),

  // Get active simulator session
  getActiveSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const sessions = await db
        .select()
        .from(simulatorSessions)
        .where(eq(simulatorSessions.id, input.sessionId));

      if (sessions.length === 0 || sessions[0].userId !== ctx.user.id) {
        throw new Error("Session not found");
      }

      return sessions[0];
    }),

  // Process simulator decision/turn
  processTurn: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        decision: z.record(z.string(), z.any()),
        kpiUpdates: z.record(z.string(), z.number()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const sessions = await db
        .select()
        .from(simulatorSessions)
        .where(eq(simulatorSessions.id, input.sessionId));

      if (sessions.length === 0 || sessions[0].userId !== ctx.user.id) {
        throw new Error("Session not found");
      }

      const currentSession = sessions[0];
      const gameState = typeof currentSession.gameState === "string" 
        ? JSON.parse(currentSession.gameState) 
        : currentSession.gameState;

      const newTurn = currentSession.currentTurn + 1;
      const isComplete = newTurn >= currentSession.totalTurns;
      const scoreIncrease = Math.floor(Math.random() * 20) + 10;
      const newScore = currentSession.score + scoreIncrease;

      const updatedGameState = {
        ...gameState,
        decisions: [...(gameState.decisions || []), input.decision],
        kpis: { ...gameState.kpis, ...input.kpiUpdates },
      };

      await db
        .update(simulatorSessions)
        .set({
          currentTurn: newTurn,
          score: newScore,
          status: isComplete ? "completed" : "in_progress",
          completedAt: isComplete ? new Date() : undefined,
          gameState: updatedGameState,
        })
        .where(eq(simulatorSessions.id, input.sessionId));

      return {
        success: true,
        newTurn,
        newScore,
        isComplete,
        gameState: updatedGameState,
      };
    }),

  // Complete simulator and generate certificate
  completeSimulator: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const sessions = await db
        .select()
        .from(simulatorSessions)
        .where(eq(simulatorSessions.id, input.sessionId));

      if (sessions.length === 0 || sessions[0].userId !== ctx.user.id) {
        throw new Error("Session not found");
      }

      const currentSession = sessions[0];

      // Generate certificate
      const certificateHash = `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const certificateType = currentSession.simulatorType.replace(/_/g, " ");

      await db.insert(certificates).values({
        userId: ctx.user.id,
        simulatorSessionId: input.sessionId,
        certificateType: certificateType,
        title: `${certificateType.charAt(0).toUpperCase() + certificateType.slice(1)} Certificate`,
        certificateHash,
        verificationUrl: `/verify/${certificateHash}`,
      });

      // Mark session as completed
      await db
        .update(simulatorSessions)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(simulatorSessions.id, input.sessionId));

      return {
        success: true,
        certificate: {
          hash: certificateHash,
          type: certificateType,
          score: currentSession.score,
        },
      };
    }),

  // Generate business plan document
  generateBusinessPlan: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        businessName: z.string(),
        businessType: z.string(),
        targetMarket: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const sessions = await db
        .select()
        .from(simulatorSessions)
        .where(eq(simulatorSessions.id, input.sessionId));

      if (sessions.length === 0 || sessions[0].userId !== ctx.user.id) {
        throw new Error("Session not found");
      }

      // Generate business plan document
      const businessPlan = {
        title: `${input.businessName} - Business Plan`,
        executiveSummary: `${input.businessName} is a ${input.businessType} designed to serve the ${input.targetMarket || "general"} market.`,
        operationalStructure: {
          businessType: input.businessType,
          targetMarket: input.targetMarket,
          fundingModel: "Autonomous income generation through LuvLedger",
        },
        financialProjections: {
          year1: "Initial setup and market entry",
          year2: "Growth and scaling phase",
          year3: "Optimization and expansion",
        },
        complianceFramework: "Operates under 98 Trust with ADRIP/UNDRIP protection",
        generatedAt: new Date().toISOString(),
      };

      // Create business entity
      await db.insert(businessEntities).values({
        userId: ctx.user.id,
        name: input.businessName,
        entityType: "trust",
        status: "draft",
        trustLevel: 1,
        description: `Business created through ${sessions[0].simulatorType} simulator`,
        financialStructure: {
          externalAllocation: 40,
          houseAllocation: 60,
          inheritancePercentage: 70,
          operationsPercentage: 30,
        },
      });

      return {
        success: true,
        businessPlan,
      };
    }),

  // Get user's simulator history
  getSimulatorHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const sessions = await db
      .select()
      .from(simulatorSessions)
      .where(eq(simulatorSessions.userId, ctx.user.id));

    return sessions;
  }),
});
