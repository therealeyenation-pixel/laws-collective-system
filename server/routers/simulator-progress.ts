import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  departmentSimulatorProgress, 
  userTokenBalance, 
  tokenTransactionLog,
  simulatorCertificates 
} from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

// Simulator configuration with token rewards per module
const SIMULATOR_CONFIG: Record<string, { name: string; modules: { id: number; tokens: number }[] }> = {
  finance: { name: "Finance Simulator", modules: [
    { id: 0, tokens: 100 }, { id: 1, tokens: 150 }, { id: 2, tokens: 200 },
    { id: 3, tokens: 200 }, { id: 4, tokens: 150 }, { id: 5, tokens: 150 }
  ]},
  hr: { name: "HR Simulator", modules: [
    { id: 0, tokens: 150 }, { id: 1, tokens: 175 }, { id: 2, tokens: 150 },
    { id: 3, tokens: 200 }, { id: 4, tokens: 175 }, { id: 5, tokens: 175 }
  ]},
  legal: { name: "Legal Simulator", modules: [
    { id: 0, tokens: 200 }, { id: 1, tokens: 175 }, { id: 2, tokens: 200 },
    { id: 3, tokens: 175 }, { id: 4, tokens: 200 }, { id: 5, tokens: 175 }
  ]},
  operations: { name: "Operations Simulator", modules: [
    { id: 0, tokens: 150 }, { id: 1, tokens: 175 }, { id: 2, tokens: 150 },
    { id: 3, tokens: 175 }, { id: 4, tokens: 150 }, { id: 5, tokens: 175 }
  ]},
  it: { name: "IT Simulator", modules: [
    { id: 0, tokens: 175 }, { id: 1, tokens: 200 }, { id: 2, tokens: 175 },
    { id: 3, tokens: 200 }, { id: 4, tokens: 175 }, { id: 5, tokens: 200 }
  ]},
  procurement: { name: "Procurement Simulator", modules: [
    { id: 0, tokens: 150 }, { id: 1, tokens: 175 }, { id: 2, tokens: 150 },
    { id: 3, tokens: 175 }, { id: 4, tokens: 150 }, { id: 5, tokens: 175 }
  ]},
  health: { name: "Health & Wellness Simulator", modules: [
    { id: 0, tokens: 150 }, { id: 1, tokens: 175 }, { id: 2, tokens: 150 },
    { id: 3, tokens: 175 }, { id: 4, tokens: 150 }, { id: 5, tokens: 175 }
  ]},
  contracts: { name: "Contracts Simulator", modules: [
    { id: 0, tokens: 175 }, { id: 1, tokens: 200 }, { id: 2, tokens: 175 },
    { id: 3, tokens: 200 }, { id: 4, tokens: 175 }, { id: 5, tokens: 200 }
  ]},
  design: { name: "Design Simulator", modules: [
    { id: 0, tokens: 150 }, { id: 1, tokens: 175 }, { id: 2, tokens: 150 },
    { id: 3, tokens: 175 }, { id: 4, tokens: 150 }, { id: 5, tokens: 175 }
  ]},
  education: { name: "Education Simulator", modules: [
    { id: 0, tokens: 150 }, { id: 1, tokens: 175 }, { id: 2, tokens: 150 },
    { id: 3, tokens: 175 }, { id: 4, tokens: 150 }, { id: 5, tokens: 175 }
  ]},
  media: { name: "Media Simulator", modules: [
    { id: 0, tokens: 150 }, { id: 1, tokens: 175 }, { id: 2, tokens: 150 },
    { id: 3, tokens: 175 }, { id: 4, tokens: 150 }, { id: 5, tokens: 175 }
  ]},
  purchasing: { name: "Purchasing Simulator", modules: [
    { id: 0, tokens: 150 }, { id: 1, tokens: 175 }, { id: 2, tokens: 150 },
    { id: 3, tokens: 175 }, { id: 4, tokens: 150 }, { id: 5, tokens: 175 }
  ]},
  property: { name: "Property Simulator", modules: [
    { id: 0, tokens: 175 }, { id: 1, tokens: 200 }, { id: 2, tokens: 175 },
    { id: 3, tokens: 200 }, { id: 4, tokens: 175 }, { id: 5, tokens: 200 }
  ]},
  realestate: { name: "Real Estate Simulator", modules: [
    { id: 0, tokens: 200 }, { id: 1, tokens: 225 }, { id: 2, tokens: 200 },
    { id: 3, tokens: 225 }, { id: 4, tokens: 200 }, { id: 5, tokens: 225 }
  ]},
  projectcontrols: { name: "Project Controls Simulator", modules: [
    { id: 0, tokens: 175 }, { id: 1, tokens: 200 }, { id: 2, tokens: 175 },
    { id: 3, tokens: 200 }, { id: 4, tokens: 175 }, { id: 5, tokens: 200 }
  ]},
  qaqc: { name: "QA/QC Simulator", modules: [
    { id: 0, tokens: 175 }, { id: 1, tokens: 200 }, { id: 2, tokens: 175 },
    { id: 3, tokens: 200 }, { id: 4, tokens: 175 }, { id: 5, tokens: 200 }
  ]},
  platform: { name: "Platform Admin Simulator", modules: [
    { id: 0, tokens: 200 }, { id: 1, tokens: 225 }, { id: 2, tokens: 200 },
    { id: 3, tokens: 225 }, { id: 4, tokens: 200 }, { id: 5, tokens: 225 }
  ]},
  grants: { name: "Grants Simulator", modules: [
    { id: 0, tokens: 200 }, { id: 1, tokens: 225 }, { id: 2, tokens: 200 },
    { id: 3, tokens: 225 }, { id: 4, tokens: 200 }, { id: 5, tokens: 225 }
  ]},
  rd: { name: "R&D Simulator", modules: [
    { id: 0, tokens: 200 }, { id: 1, tokens: 225 }, { id: 2, tokens: 200 },
    { id: 3, tokens: 225 }, { id: 4, tokens: 200 }, { id: 5, tokens: 225 }
  ]},
};

export const simulatorProgressRouter = router({
  // Get user's progress for a specific simulator
  getProgress: protectedProcedure
    .input(z.object({ simulatorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const progress = await db.select()
        .from(departmentSimulatorProgress)
        .where(and(
          eq(departmentSimulatorProgress.userId, ctx.user.id),
          eq(departmentSimulatorProgress.simulatorId, input.simulatorId)
        ));

      return progress;
    }),

  // Get all progress for the current user
  getAllProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const progress = await db.select()
      .from(departmentSimulatorProgress)
      .where(eq(departmentSimulatorProgress.userId, ctx.user.id));

    return progress;
  }),

  // Get user's token balance
  getTokenBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [balance] = await db.select()
      .from(userTokenBalance)
      .where(eq(userTokenBalance.userId, ctx.user.id));

    if (!balance) {
      // Create initial balance record
      await db.insert(userTokenBalance).values({
        userId: ctx.user.id,
        totalTokens: 0,
        lifetimeTokensEarned: 0,
        tokensSpent: 0,
      });
      return { totalTokens: 0, lifetimeTokensEarned: 0, tokensSpent: 0 };
    }

    return balance;
  }),

  // Save module progress and award tokens
  saveModuleProgress: protectedProcedure
    .input(z.object({
      simulatorId: z.string(),
      moduleId: z.number(),
      questionsAnswered: z.number(),
      correctAnswers: z.number(),
      isCompleted: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const config = SIMULATOR_CONFIG[input.simulatorId];
      if (!config) throw new Error("Invalid simulator ID");

      const moduleConfig = config.modules.find(m => m.id === input.moduleId);
      if (!moduleConfig) throw new Error("Invalid module ID");

      // Check if progress already exists
      const [existing] = await db.select()
        .from(departmentSimulatorProgress)
        .where(and(
          eq(departmentSimulatorProgress.userId, ctx.user.id),
          eq(departmentSimulatorProgress.simulatorId, input.simulatorId),
          eq(departmentSimulatorProgress.moduleId, input.moduleId)
        ));

      let tokensToAward = 0;

      if (existing) {
        // Update existing progress
        if (input.isCompleted && !existing.isCompleted) {
          // First time completing - award tokens
          tokensToAward = moduleConfig.tokens;
        }

        await db.update(departmentSimulatorProgress)
          .set({
            questionsAnswered: input.questionsAnswered,
            correctAnswers: input.correctAnswers,
            isCompleted: input.isCompleted,
            tokensEarned: existing.tokensEarned + tokensToAward,
            completedAt: input.isCompleted ? new Date() : null,
          })
          .where(eq(departmentSimulatorProgress.id, existing.id));
      } else {
        // Create new progress record
        if (input.isCompleted) {
          tokensToAward = moduleConfig.tokens;
        }

        await db.insert(departmentSimulatorProgress).values({
          userId: ctx.user.id,
          simulatorId: input.simulatorId,
          moduleId: input.moduleId,
          questionsAnswered: input.questionsAnswered,
          correctAnswers: input.correctAnswers,
          isCompleted: input.isCompleted,
          tokensEarned: tokensToAward,
          completedAt: input.isCompleted ? new Date() : null,
        });
      }

      // Award tokens if earned
      if (tokensToAward > 0) {
        // Get or create token balance
        const [balance] = await db.select()
          .from(userTokenBalance)
          .where(eq(userTokenBalance.userId, ctx.user.id));

        const newBalance = (balance?.totalTokens || 0) + tokensToAward;

        if (balance) {
          await db.update(userTokenBalance)
            .set({
              totalTokens: newBalance,
              lifetimeTokensEarned: (balance.lifetimeTokensEarned || 0) + tokensToAward,
              lastEarnedAt: new Date(),
            })
            .where(eq(userTokenBalance.userId, ctx.user.id));
        } else {
          await db.insert(userTokenBalance).values({
            userId: ctx.user.id,
            totalTokens: tokensToAward,
            lifetimeTokensEarned: tokensToAward,
            tokensSpent: 0,
            lastEarnedAt: new Date(),
          });
        }

        // Log the transaction
        await db.insert(tokenTransactionLog).values({
          userId: ctx.user.id,
          amount: tokensToAward,
          transactionType: "earned",
          source: `${input.simulatorId}_simulator_module_${input.moduleId}`,
          description: `Completed ${config.name} - Module ${input.moduleId + 1}`,
          balanceAfter: newBalance,
        });
      }

      return { success: true, tokensAwarded: tokensToAward };
    }),

  // Check if user has completed all modules and issue certificate
  checkAndIssueCertificate: protectedProcedure
    .input(z.object({ simulatorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const config = SIMULATOR_CONFIG[input.simulatorId];
      if (!config) throw new Error("Invalid simulator ID");

      // Check if certificate already exists
      const [existingCert] = await db.select()
        .from(simulatorCertificates)
        .where(and(
          eq(simulatorCertificates.userId, ctx.user.id),
          eq(simulatorCertificates.simulatorId, input.simulatorId)
        ));

      if (existingCert) {
        return { success: false, message: "Certificate already issued", certificate: existingCert };
      }

      // Get all module progress
      const progress = await db.select()
        .from(departmentSimulatorProgress)
        .where(and(
          eq(departmentSimulatorProgress.userId, ctx.user.id),
          eq(departmentSimulatorProgress.simulatorId, input.simulatorId)
        ));

      // Check if all modules are completed
      const completedModules = progress.filter(p => p.isCompleted);
      if (completedModules.length < config.modules.length) {
        return { 
          success: false, 
          message: `Complete all ${config.modules.length} modules to earn your certificate`,
          completed: completedModules.length,
          total: config.modules.length
        };
      }

      // Calculate stats
      const totalTokens = completedModules.reduce((sum, p) => sum + p.tokensEarned, 0);
      const totalCorrect = completedModules.reduce((sum, p) => sum + p.correctAnswers, 0);
      const totalAnswered = completedModules.reduce((sum, p) => sum + p.questionsAnswered, 0);
      const averageScore = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

      // Generate certificate hash
      const certificateHash = crypto
        .createHash("sha256")
        .update(`${ctx.user.id}-${input.simulatorId}-${Date.now()}`)
        .digest("hex")
        .substring(0, 64);

      // Issue certificate
      const [certificate] = await db.insert(simulatorCertificates).values({
        userId: ctx.user.id,
        simulatorId: input.simulatorId,
        simulatorName: config.name,
        totalModulesCompleted: completedModules.length,
        totalTokensEarned: totalTokens,
        averageScore: averageScore.toFixed(2),
        certificateHash,
        verificationUrl: `/certificates/verify/${certificateHash}`,
      }).$returningId();

      return { 
        success: true, 
        message: "Certificate issued successfully!",
        certificate: {
          id: certificate.id,
          simulatorName: config.name,
          totalModulesCompleted: completedModules.length,
          totalTokensEarned: totalTokens,
          averageScore: averageScore.toFixed(2),
          certificateHash,
        }
      };
    }),

  // Get user's certificates
  getCertificates: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const certificates = await db.select()
      .from(simulatorCertificates)
      .where(eq(simulatorCertificates.userId, ctx.user.id));

    return certificates;
  }),

  // Get token transaction history
  getTokenHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional().default(50) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const transactions = await db.select()
        .from(tokenTransactionLog)
        .where(eq(tokenTransactionLog.userId, ctx.user.id))
        .orderBy(sql`${tokenTransactionLog.createdAt} DESC`)
        .limit(input.limit);

      return transactions;
    }),

  // Get simulator config (for frontend)
  getSimulatorConfig: protectedProcedure
    .input(z.object({ simulatorId: z.string() }))
    .query(({ input }) => {
      const config = SIMULATOR_CONFIG[input.simulatorId];
      if (!config) throw new Error("Invalid simulator ID");
      return config;
    }),

  // Get all simulator configs
  getAllSimulatorConfigs: protectedProcedure.query(() => {
    return SIMULATOR_CONFIG;
  }),
});
