import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  sandboxSessions,
  sandboxTransactions,
  sandboxEntities,
  sandboxOperations,
  sandboxSnapshots,
  sandboxTemplates,
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Pre-defined sandbox templates
const DEFAULT_TEMPLATES = [
  {
    templateName: "Financial Basics",
    description: "Learn the fundamentals of financial management with a starting balance of $10,000. Practice budgeting, allocations, and split calculations.",
    sandboxType: "financial" as const,
    initialBalance: "10000.00",
    timeMultiplier: "1.00",
    enabledFeatures: ["budgeting", "allocations", "splits", "transactions"],
    difficulty: "beginner" as const,
    estimatedDuration: 30,
    learningObjectives: [
      "Understand 60/40 house/collective split",
      "Practice 70/30 house/inheritance allocation",
      "Track income and expenses",
    ],
    isPublic: true,
  },
  {
    templateName: "Business Entity Simulation",
    description: "Create and manage multiple business entities. Test trust structures, LLCs, and collective operations.",
    sandboxType: "business" as const,
    initialBalance: "100000.00",
    timeMultiplier: "2.00",
    enabledFeatures: ["entities", "governance", "compliance", "reporting"],
    difficulty: "intermediate" as const,
    estimatedDuration: 60,
    learningObjectives: [
      "Create different entity types",
      "Understand entity hierarchies",
      "Practice governance decisions",
    ],
    isPublic: true,
  },
  {
    templateName: "Full System Sandbox",
    description: "Complete access to all system features. Ideal for comprehensive testing and advanced users.",
    sandboxType: "full" as const,
    initialBalance: "1000000.00",
    timeMultiplier: "5.00",
    enabledFeatures: ["all"],
    difficulty: "advanced" as const,
    estimatedDuration: 120,
    learningObjectives: [
      "Master all system features",
      "Test complex scenarios",
      "Prepare for production use",
    ],
    isPublic: true,
  },
  {
    templateName: "Game & Achievement Testing",
    description: "Test game mechanics, earn tokens, and unlock achievements in a safe environment.",
    sandboxType: "game" as const,
    initialBalance: "5000.00",
    timeMultiplier: "1.00",
    enabledFeatures: ["games", "achievements", "tokens", "leaderboards"],
    difficulty: "beginner" as const,
    estimatedDuration: 45,
    learningObjectives: [
      "Understand token economy",
      "Practice game strategies",
      "Unlock achievements",
    ],
    isPublic: true,
  },
  {
    templateName: "Curriculum Development",
    description: "Test curriculum generation, course creation, and educational content management.",
    sandboxType: "curriculum" as const,
    initialBalance: "25000.00",
    timeMultiplier: "1.00",
    enabledFeatures: ["courses", "curriculum", "assessments", "certificates"],
    difficulty: "intermediate" as const,
    estimatedDuration: 90,
    learningObjectives: [
      "Create custom courses",
      "Test assessment systems",
      "Generate certificates",
    ],
    isPublic: true,
  },
];

export const sandboxRouter = router({
  // Get all templates
  getTemplates: publicProcedure.query(async () => {
    const db = await getDb();
    const templates = await db
      .select()
      .from(sandboxTemplates)
      .where(eq(sandboxTemplates.isPublic, true))
      .orderBy(sandboxTemplates.difficulty);

    // If no templates exist, return defaults
    if (templates.length === 0) {
      return DEFAULT_TEMPLATES.map((t, idx) => ({ id: idx + 1, ...t, createdAt: new Date(), updatedAt: new Date() }));
    }

    return templates;
  }),

  // Seed default templates
  seedTemplates: protectedProcedure.mutation(async () => {
    const db = await getDb();

    for (const template of DEFAULT_TEMPLATES) {
      await db.insert(sandboxTemplates).values({
        ...template,
        enabledFeatures: template.enabledFeatures,
        learningObjectives: template.learningObjectives,
      });
    }

    return { success: true, message: `Seeded ${DEFAULT_TEMPLATES.length} sandbox templates` };
  }),

  // Create a new sandbox session
  createSession: protectedProcedure
    .input(
      z.object({
        sessionName: z.string().min(1).max(255),
        description: z.string().optional(),
        sandboxType: z.enum(["financial", "business", "game", "curriculum", "full"]).default("full"),
        templateId: z.number().optional(),
        initialBalance: z.string().optional().default("100000.00"),
        timeMultiplier: z.string().optional().default("1.00"),
        enabledFeatures: z.array(z.string()).optional(),
        expiresInHours: z.number().optional().default(24),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // If template is specified, load its configuration
      let config = {
        initialBalance: input.initialBalance,
        timeMultiplier: input.timeMultiplier,
        enabledFeatures: input.enabledFeatures || ["all"],
        sandboxType: input.sandboxType,
      };

      if (input.templateId) {
        const [template] = await db
          .select()
          .from(sandboxTemplates)
          .where(eq(sandboxTemplates.id, input.templateId))
          .limit(1);

        if (template) {
          config = {
            initialBalance: template.initialBalance || "100000.00",
            timeMultiplier: template.timeMultiplier || "1.00",
            enabledFeatures: (template.enabledFeatures as string[]) || ["all"],
            sandboxType: template.sandboxType,
          };
        }
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + input.expiresInHours);

      const result = await db.insert(sandboxSessions).values({
        userId: ctx.user.id,
        sessionName: input.sessionName,
        description: input.description,
        sandboxType: config.sandboxType,
        initialBalance: config.initialBalance,
        currentBalance: config.initialBalance,
        timeMultiplier: config.timeMultiplier,
        enabledFeatures: config.enabledFeatures,
        expiresAt,
      });

      return {
        success: true,
        sessionId: Number(result.insertId),
        message: `Sandbox session "${input.sessionName}" created successfully`,
      };
    }),

  // Get user's sandbox sessions
  getSessions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const sessions = await db
      .select()
      .from(sandboxSessions)
      .where(eq(sandboxSessions.userId, ctx.user.id))
      .orderBy(desc(sandboxSessions.lastActivityAt));

    return sessions;
  }),

  // Get active session
  getActiveSession: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [session] = await db
      .select()
      .from(sandboxSessions)
      .where(
        and(
          eq(sandboxSessions.userId, ctx.user.id),
          eq(sandboxSessions.status, "active")
        )
      )
      .orderBy(desc(sandboxSessions.lastActivityAt))
      .limit(1);

    return session || null;
  }),

  // Get session details
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const [session] = await db
        .select()
        .from(sandboxSessions)
        .where(
          and(
            eq(sandboxSessions.id, input.sessionId),
            eq(sandboxSessions.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!session) {
        throw new Error("Sandbox session not found");
      }

      // Get entities
      const entities = await db
        .select()
        .from(sandboxEntities)
        .where(eq(sandboxEntities.sessionId, input.sessionId));

      // Get recent transactions
      const transactions = await db
        .select()
        .from(sandboxTransactions)
        .where(eq(sandboxTransactions.sessionId, input.sessionId))
        .orderBy(desc(sandboxTransactions.createdAt))
        .limit(20);

      // Get recent operations
      const operations = await db
        .select()
        .from(sandboxOperations)
        .where(eq(sandboxOperations.sessionId, input.sessionId))
        .orderBy(desc(sandboxOperations.createdAt))
        .limit(20);

      return {
        session,
        entities,
        transactions,
        operations,
      };
    }),

  // Execute a sandbox transaction
  executeTransaction: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        transactionType: z.enum([
          "deposit", "withdrawal", "transfer", "split_allocation",
          "token_earn", "token_spend", "investment", "dividend",
          "fee", "refund", "adjustment"
        ]),
        amount: z.number(),
        description: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Get session
      const [session] = await db
        .select()
        .from(sandboxSessions)
        .where(
          and(
            eq(sandboxSessions.id, input.sessionId),
            eq(sandboxSessions.userId, ctx.user.id),
            eq(sandboxSessions.status, "active")
          )
        )
        .limit(1);

      if (!session) {
        throw new Error("Active sandbox session not found");
      }

      const currentBalance = parseFloat(session.currentBalance || "0");
      let newBalance = currentBalance;

      // Calculate new balance based on transaction type
      if (["deposit", "token_earn", "dividend", "refund"].includes(input.transactionType)) {
        newBalance = currentBalance + input.amount;
      } else if (["withdrawal", "token_spend", "fee", "investment"].includes(input.transactionType)) {
        if (currentBalance < input.amount) {
          throw new Error("Insufficient sandbox balance");
        }
        newBalance = currentBalance - input.amount;
      } else if (input.transactionType === "adjustment") {
        newBalance = currentBalance + input.amount; // Can be positive or negative
      }

      // Record transaction
      await db.insert(sandboxTransactions).values({
        sessionId: input.sessionId,
        userId: ctx.user.id,
        transactionType: input.transactionType,
        amount: input.amount.toFixed(2),
        balanceBefore: currentBalance.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        description: input.description,
        metadata: input.metadata,
      });

      // Update session balance
      await db
        .update(sandboxSessions)
        .set({
          currentBalance: newBalance.toFixed(2),
          totalTransactions: sql`${sandboxSessions.totalTransactions} + 1`,
          lastActivityAt: new Date(),
        })
        .where(eq(sandboxSessions.id, input.sessionId));

      return {
        success: true,
        previousBalance: currentBalance,
        newBalance,
        transactionType: input.transactionType,
        amount: input.amount,
      };
    }),

  // Test split calculation
  testSplitCalculation: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        amount: z.number(),
        interHouseSplit: z.number().min(0).max(100).default(60),
        intraHouseSplit: z.number().min(0).max(100).default(70),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Verify session
      const [session] = await db
        .select()
        .from(sandboxSessions)
        .where(
          and(
            eq(sandboxSessions.id, input.sessionId),
            eq(sandboxSessions.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!session) {
        throw new Error("Sandbox session not found");
      }

      // Calculate splits
      const houseShare = input.amount * (input.interHouseSplit / 100);
      const collectiveShare = input.amount * ((100 - input.interHouseSplit) / 100);
      const operationsShare = houseShare * (input.intraHouseSplit / 100);
      const inheritanceShare = houseShare * ((100 - input.intraHouseSplit) / 100);

      // Log operation
      await db.insert(sandboxOperations).values({
        sessionId: input.sessionId,
        userId: ctx.user.id,
        operationType: "split_calculation",
        operationName: "Test Split Calculation",
        inputData: {
          amount: input.amount,
          interHouseSplit: input.interHouseSplit,
          intraHouseSplit: input.intraHouseSplit,
        },
        outputData: {
          houseShare,
          collectiveShare,
          operationsShare,
          inheritanceShare,
        },
        status: "success",
      });

      // Update session
      await db
        .update(sandboxSessions)
        .set({
          totalOperations: sql`${sandboxSessions.totalOperations} + 1`,
          lastActivityAt: new Date(),
        })
        .where(eq(sandboxSessions.id, input.sessionId));

      return {
        totalAmount: input.amount,
        interHouseSplit: {
          percentage: input.interHouseSplit,
          houseShare: Number(houseShare.toFixed(2)),
          collectiveShare: Number(collectiveShare.toFixed(2)),
        },
        intraHouseSplit: {
          percentage: input.intraHouseSplit,
          operationsShare: Number(operationsShare.toFixed(2)),
          inheritanceShare: Number(inheritanceShare.toFixed(2)),
        },
        summary: {
          toHouseOperations: Number(operationsShare.toFixed(2)),
          toInheritance: Number(inheritanceShare.toFixed(2)),
          toCollective: Number(collectiveShare.toFixed(2)),
          total: Number((operationsShare + inheritanceShare + collectiveShare).toFixed(2)),
        },
      };
    }),

  // Create sandbox entity
  createEntity: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        entityName: z.string().min(1).max(255),
        entityType: z.enum(["trust", "llc", "corporation", "collective", "508c1a"]),
        initialBalance: z.number().optional().default(0),
        interHouseSplit: z.number().min(0).max(100).optional().default(60),
        intraHouseSplit: z.number().min(0).max(100).optional().default(70),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Verify session
      const [session] = await db
        .select()
        .from(sandboxSessions)
        .where(
          and(
            eq(sandboxSessions.id, input.sessionId),
            eq(sandboxSessions.userId, ctx.user.id),
            eq(sandboxSessions.status, "active")
          )
        )
        .limit(1);

      if (!session) {
        throw new Error("Active sandbox session not found");
      }

      const result = await db.insert(sandboxEntities).values({
        sessionId: input.sessionId,
        userId: ctx.user.id,
        entityName: input.entityName,
        entityType: input.entityType,
        balance: input.initialBalance.toFixed(2),
        interHouseSplit: input.interHouseSplit,
        intraHouseSplit: input.intraHouseSplit,
      });

      // Log operation
      await db.insert(sandboxOperations).values({
        sessionId: input.sessionId,
        userId: ctx.user.id,
        operationType: "entity_creation",
        operationName: `Created ${input.entityType}: ${input.entityName}`,
        inputData: input,
        outputData: { entityId: Number(result.insertId) },
        status: "success",
      });

      return {
        success: true,
        entityId: Number(result.insertId),
        message: `Entity "${input.entityName}" created in sandbox`,
      };
    }),

  // Save snapshot
  saveSnapshot: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        snapshotName: z.string().min(1).max(255),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Get session with all data
      const [session] = await db
        .select()
        .from(sandboxSessions)
        .where(
          and(
            eq(sandboxSessions.id, input.sessionId),
            eq(sandboxSessions.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!session) {
        throw new Error("Sandbox session not found");
      }

      const entities = await db
        .select()
        .from(sandboxEntities)
        .where(eq(sandboxEntities.sessionId, input.sessionId));

      const result = await db.insert(sandboxSnapshots).values({
        sessionId: input.sessionId,
        userId: ctx.user.id,
        snapshotName: input.snapshotName,
        description: input.description,
        sessionState: session,
        entitiesState: entities,
        transactionsCount: session.totalTransactions || 0,
        operationsCount: session.totalOperations || 0,
      });

      return {
        success: true,
        snapshotId: Number(result.insertId),
        message: `Snapshot "${input.snapshotName}" saved`,
      };
    }),

  // Get snapshots
  getSnapshots: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const snapshots = await db
        .select()
        .from(sandboxSnapshots)
        .where(
          and(
            eq(sandboxSnapshots.sessionId, input.sessionId),
            eq(sandboxSnapshots.userId, ctx.user.id)
          )
        )
        .orderBy(desc(sandboxSnapshots.createdAt));

      return snapshots;
    }),

  // Restore snapshot
  restoreSnapshot: protectedProcedure
    .input(z.object({ snapshotId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      const [snapshot] = await db
        .select()
        .from(sandboxSnapshots)
        .where(
          and(
            eq(sandboxSnapshots.id, input.snapshotId),
            eq(sandboxSnapshots.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!snapshot) {
        throw new Error("Snapshot not found");
      }

      const sessionState = snapshot.sessionState as any;

      // Restore session state
      await db
        .update(sandboxSessions)
        .set({
          currentBalance: sessionState.currentBalance,
          totalTransactions: sessionState.totalTransactions,
          totalOperations: sessionState.totalOperations,
          lastActivityAt: new Date(),
        })
        .where(eq(sandboxSessions.id, snapshot.sessionId));

      // Delete current entities and restore from snapshot
      await db
        .delete(sandboxEntities)
        .where(eq(sandboxEntities.sessionId, snapshot.sessionId));

      const entitiesState = snapshot.entitiesState as any[];
      if (entitiesState && entitiesState.length > 0) {
        for (const entity of entitiesState) {
          await db.insert(sandboxEntities).values({
            sessionId: snapshot.sessionId,
            userId: ctx.user.id,
            entityName: entity.entityName,
            entityType: entity.entityType,
            status: entity.status,
            balance: entity.balance,
            interHouseSplit: entity.interHouseSplit,
            intraHouseSplit: entity.intraHouseSplit,
            metadata: entity.metadata,
          });
        }
      }

      return {
        success: true,
        message: `Restored to snapshot "${snapshot.snapshotName}"`,
      };
    }),

  // Reset sandbox session
  resetSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      const [session] = await db
        .select()
        .from(sandboxSessions)
        .where(
          and(
            eq(sandboxSessions.id, input.sessionId),
            eq(sandboxSessions.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!session) {
        throw new Error("Sandbox session not found");
      }

      // Delete all transactions
      await db
        .delete(sandboxTransactions)
        .where(eq(sandboxTransactions.sessionId, input.sessionId));

      // Delete all entities
      await db
        .delete(sandboxEntities)
        .where(eq(sandboxEntities.sessionId, input.sessionId));

      // Delete all operations
      await db
        .delete(sandboxOperations)
        .where(eq(sandboxOperations.sessionId, input.sessionId));

      // Reset session to initial state
      await db
        .update(sandboxSessions)
        .set({
          currentBalance: session.initialBalance,
          totalTransactions: 0,
          totalOperations: 0,
          lastActivityAt: new Date(),
        })
        .where(eq(sandboxSessions.id, input.sessionId));

      return {
        success: true,
        message: "Sandbox session reset to initial state",
      };
    }),

  // End sandbox session
  endSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      await db
        .update(sandboxSessions)
        .set({
          status: "completed",
          completedAt: new Date(),
        })
        .where(
          and(
            eq(sandboxSessions.id, input.sessionId),
            eq(sandboxSessions.userId, ctx.user.id)
          )
        );

      return {
        success: true,
        message: "Sandbox session completed",
      };
    }),

  // Get sandbox stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();

    const sessions = await db
      .select()
      .from(sandboxSessions)
      .where(eq(sandboxSessions.userId, ctx.user.id));

    const activeSessions = sessions.filter((s) => s.status === "active").length;
    const completedSessions = sessions.filter((s) => s.status === "completed").length;
    const totalTransactions = sessions.reduce((sum, s) => sum + (s.totalTransactions || 0), 0);
    const totalOperations = sessions.reduce((sum, s) => sum + (s.totalOperations || 0), 0);

    return {
      totalSessions: sessions.length,
      activeSessions,
      completedSessions,
      totalTransactions,
      totalOperations,
    };
  }),
});
