/**
 * Onboarding Journey Router
 * Handles the Direct Onboarding path for joining The L.A.W.S. Collective
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { 
  onboardingJourneys, 
  onboardingAssessments,
  memberCredentials,
  credentialAchievements,
  houses
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Helper to generate credential IDs
function generateCredentialId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `LAWS-${seg()}-${seg()}-${seg()}`;
}

function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Realm enum
const RealmSchema = z.enum(['self', 'water', 'air', 'land']);

// Onboarding step enum
const OnboardingStepSchema = z.enum([
  'welcome',
  'self_intro', 'self_assessment',
  'water_intro', 'water_assessment',
  'air_intro', 'air_assessment',
  'land_intro', 'land_assessment',
  'house_setup',
  'values_agreement',
  'credential_issuance',
  'complete'
]);

export const onboardingJourneyRouter = router({
  // Get current journey for user
  getMyJourney: protectedProcedure.query(async ({ ctx }) => {
    const journey = await db.query.onboardingJourneys.findFirst({
      where: eq(onboardingJourneys.userId, ctx.user.id),
      orderBy: desc(onboardingJourneys.createdAt)
    });
    
    if (!journey) {
      return null;
    }

    // Get assessments for this journey
    const assessments = await db.query.onboardingAssessments.findMany({
      where: eq(onboardingAssessments.journeyId, journey.id)
    });

    return {
      ...journey,
      assessments
    };
  }),

  // Start a new journey
  startJourney: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if user already has an active journey
    const existingJourney = await db.query.onboardingJourneys.findFirst({
      where: and(
        eq(onboardingJourneys.userId, ctx.user.id),
        eq(onboardingJourneys.status, 'in_progress')
      )
    });

    if (existingJourney) {
      return existingJourney;
    }

    // Create new journey (MySQL: no .returning(), use insertId)
    const result = await db.insert(onboardingJourneys).values({
      userId: ctx.user.id,
      currentStep: 'welcome',
      status: 'in_progress',
      selfCompleted: false,
      waterCompleted: false,
      airCompleted: false,
      landCompleted: false,
      valuesAgreed: false,
    });

    const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;

    const journey = await db.query.onboardingJourneys.findFirst({
      where: eq(onboardingJourneys.id, insertId)
    });

    return journey!;
  }),

  // Update journey step
  updateStep: protectedProcedure
    .input(z.object({
      step: OnboardingStepSchema
    }))
    .mutation(async ({ ctx, input }) => {
      const journey = await db.query.onboardingJourneys.findFirst({
        where: and(
          eq(onboardingJourneys.userId, ctx.user.id),
          eq(onboardingJourneys.status, 'in_progress')
        )
      });

      if (!journey) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active journey found'
        });
      }

      await db.update(onboardingJourneys)
        .set({
          currentStep: input.step,
          lastActivityAt: new Date()
        })
        .where(eq(onboardingJourneys.id, journey.id));

      const updated = await db.query.onboardingJourneys.findFirst({
        where: eq(onboardingJourneys.id, journey.id)
      });

      return updated!;
    }),

  // Submit assessment result
  submitAssessment: protectedProcedure
    .input(z.object({
      realm: RealmSchema,
      score: z.number().min(0).max(100),
      passed: z.boolean(),
      totalQuestions: z.number().default(5),
      correctAnswers: z.number().default(0),
      responses: z.array(z.object({
        questionId: z.string(),
        selectedOptionIndex: z.number(),
        isCorrect: z.boolean()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const journey = await db.query.onboardingJourneys.findFirst({
        where: and(
          eq(onboardingJourneys.userId, ctx.user.id),
          eq(onboardingJourneys.status, 'in_progress')
        )
      });

      if (!journey) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active journey found'
        });
      }

      // Record assessment (MySQL: no .returning())
      const assessmentResult = await db.insert(onboardingAssessments).values({
        journeyId: journey.id,
        realm: input.realm,
        totalQuestions: input.totalQuestions,
        correctAnswers: input.correctAnswers,
        score: input.score,
        passed: input.passed,
        attemptNumber: 1,
        completedAt: new Date(),
      });

      // Update journey realm completion if passed
      if (input.passed) {
        const realmField = `${input.realm}Completed` as 'selfCompleted' | 'waterCompleted' | 'airCompleted' | 'landCompleted';
        const scoreField = `${input.realm}Score` as 'selfScore' | 'waterScore' | 'airScore' | 'landScore';
        
        await db.update(onboardingJourneys)
          .set({
            [realmField]: true,
            [scoreField]: input.score,
            lastActivityAt: new Date()
          })
          .where(eq(onboardingJourneys.id, journey.id));
      }

      return { success: true, passed: input.passed, score: input.score };
    }),

  // Setup House
  setupHouse: protectedProcedure
    .input(z.object({
      houseName: z.string().min(1).max(100),
      houseType: z.enum(['individual', 'family', 'legacy']),
      primaryBeneficiaryName: z.string().optional(),
      primaryBeneficiaryRelation: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const journey = await db.query.onboardingJourneys.findFirst({
        where: and(
          eq(onboardingJourneys.userId, ctx.user.id),
          eq(onboardingJourneys.status, 'in_progress')
        )
      });

      if (!journey) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active journey found'
        });
      }

      // Create house
      const houseResult = await db.insert(houses).values({
        name: input.houseName,
        type: input.houseType as any,
        ownerUserId: ctx.user.id,
        status: 'active' as any,
      });

      const houseId = (houseResult as any)[0]?.insertId ?? (houseResult as any).insertId;

      // Link house to journey
      await db.update(onboardingJourneys)
        .set({
          houseId: houseId,
          lastActivityAt: new Date()
        })
        .where(eq(onboardingJourneys.id, journey.id));

      return { success: true, houseId };
    }),

  // Agree to values
  agreeToValues: protectedProcedure.mutation(async ({ ctx }) => {
    const journey = await db.query.onboardingJourneys.findFirst({
      where: and(
        eq(onboardingJourneys.userId, ctx.user.id),
        eq(onboardingJourneys.status, 'in_progress')
      )
    });

    if (!journey) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No active journey found'
      });
    }

    await db.update(onboardingJourneys)
      .set({
        valuesAgreed: true,
        lastActivityAt: new Date()
      })
      .where(eq(onboardingJourneys.id, journey.id));

    return { success: true };
  }),

  // Complete journey and issue credential
  completeJourney: protectedProcedure.mutation(async ({ ctx }) => {
    const journey = await db.query.onboardingJourneys.findFirst({
      where: and(
        eq(onboardingJourneys.userId, ctx.user.id),
        eq(onboardingJourneys.status, 'in_progress')
      )
    });

    if (!journey) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No active journey found'
      });
    }

    // Verify all requirements are met
    if (!journey.selfCompleted || !journey.waterCompleted || 
        !journey.airCompleted || !journey.landCompleted || !journey.valuesAgreed) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Journey requirements not complete'
      });
    }

    // Generate credential
    const credentialId = generateCredentialId();
    const verificationCode = generateVerificationCode();
    
    // Calculate average score
    const avgScore = Math.round(
      ((journey.selfScore || 0) + (journey.waterScore || 0) + 
       (journey.airScore || 0) + (journey.landScore || 0)) / 4
    );

    // Create member credential (MySQL: no .returning())
    const credResult = await db.insert(memberCredentials).values({
      credentialId,
      verificationCode,
      userId: ctx.user.id,
      status: 'active',
    });

    const credDbId = (credResult as any)[0]?.insertId ?? (credResult as any).insertId;

    // Record achievements
    const achievements = [
      { type: 'realm_completion', name: 'Self Realm Mastery' },
      { type: 'realm_completion', name: 'Water Realm Mastery' },
      { type: 'realm_completion', name: 'Air Realm Mastery' },
      { type: 'realm_completion', name: 'Land Realm Mastery' },
      { type: 'journey_completion', name: 'S.W.A.L. Journey Complete' }
    ];

    for (const achievement of achievements) {
      await db.insert(credentialAchievements).values({
        credentialId: credDbId,
        achievementType: achievement.type,
        achievementName: achievement.name,
      });
    }

    // Mark journey as complete
    await db.update(onboardingJourneys)
      .set({
        status: 'completed',
        completedAt: new Date(),
        credentialId: credentialId,
        lastActivityAt: new Date()
      })
      .where(eq(onboardingJourneys.id, journey.id));

    return {
      credentialId,
      verificationCode,
      averageScore: avgScore
    };
  }),

  // Get journey statistics (for admin)
  getJourneyStats: protectedProcedure.query(async ({ ctx }) => {
    const allJourneys = await db.query.onboardingJourneys.findMany();
    
    const stats = {
      total: allJourneys.length,
      inProgress: allJourneys.filter(j => j.status === 'in_progress').length,
      completed: allJourneys.filter(j => j.status === 'completed').length,
      abandoned: allJourneys.filter(j => j.status === 'abandoned').length,
      averageCompletionRate: 0
    };

    if (stats.total > 0) {
      stats.averageCompletionRate = Math.round((stats.completed / stats.total) * 100);
    }

    return stats;
  })
});
