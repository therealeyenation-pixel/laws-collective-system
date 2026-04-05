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
import { generateCredentialId, generateVerificationCode, generateQRData } from "../credentials";

// Realm enum
const RealmSchema = z.enum(['self', 'water', 'air', 'land']);

// Journey status enum
const JourneyStatusSchema = z.enum(['not_started', 'in_progress', 'completed', 'abandoned']);

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

    // Create new journey
    const [journey] = await db.insert(onboardingJourneys).values({
      userId: ctx.user.id,
      currentStep: 'welcome',
      status: 'in_progress',
      selfCompleted: false,
      waterCompleted: false,
      airCompleted: false,
      landCompleted: false,
      valuesAgreed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return journey;
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

      const [updated] = await db.update(onboardingJourneys)
        .set({
          currentStep: input.step,
          updatedAt: new Date()
        })
        .where(eq(onboardingJourneys.id, journey.id))
        .returning();

      return updated;
    }),

  // Submit assessment result
  submitAssessment: protectedProcedure
    .input(z.object({
      realm: RealmSchema,
      score: z.number().min(0).max(100),
      passed: z.boolean(),
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

      // Record assessment
      const [assessment] = await db.insert(onboardingAssessments).values({
        journeyId: journey.id,
        realm: input.realm,
        score: input.score,
        passed: input.passed,
        responses: JSON.stringify(input.responses),
        attemptNumber: 1, // Could track attempts
        completedAt: new Date(),
        createdAt: new Date()
      }).returning();

      // Update journey realm completion if passed
      if (input.passed) {
        const realmField = `${input.realm}Completed` as 'selfCompleted' | 'waterCompleted' | 'airCompleted' | 'landCompleted';
        const scoreField = `${input.realm}Score` as 'selfScore' | 'waterScore' | 'airScore' | 'landScore';
        
        await db.update(onboardingJourneys)
          .set({
            [realmField]: true,
            [scoreField]: input.score,
            updatedAt: new Date()
          })
          .where(eq(onboardingJourneys.id, journey.id));
      }

      return assessment;
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

      // Update journey with house setup data
      await db.update(onboardingJourneys)
        .set({
          houseName: input.houseName,
          houseType: input.houseType,
          primaryBeneficiaryName: input.primaryBeneficiaryName,
          primaryBeneficiaryRelation: input.primaryBeneficiaryRelation,
          updatedAt: new Date()
        })
        .where(eq(onboardingJourneys.id, journey.id));

      return { success: true };
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
        valuesAgreedAt: new Date(),
        updatedAt: new Date()
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

    // Create House if it doesn't exist
    let house = await db.query.houses.findFirst({
      where: eq(houses.ownerUserId, ctx.user.id)
    });

    if (!house && journey.houseName) {
      const [newHouse] = await db.insert(houses).values({
        name: journey.houseName,
        type: journey.houseType || 'individual',
        ownerUserId: ctx.user.id,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      house = newHouse;
    }

    // Generate credential
    const credentialId = generateCredentialId();
    const verificationCode = generateVerificationCode();
    
    // Calculate average score
    const avgScore = Math.round(
      ((journey.selfScore || 0) + (journey.waterScore || 0) + 
       (journey.airScore || 0) + (journey.landScore || 0)) / 4
    );

    // Create member credential
    const [credential] = await db.insert(memberCredentials).values({
      credentialId,
      verificationCode,
      userId: ctx.user.id,
      houseId: house?.id,
      entryPath: 'direct_onboarding',
      accessLevel: 'member',
      status: 'active',
      issuedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Record achievements
    const achievements = [
      { type: 'realm_completion', name: 'Self Realm Mastery', realm: 'self', score: journey.selfScore },
      { type: 'realm_completion', name: 'Water Realm Mastery', realm: 'water', score: journey.waterScore },
      { type: 'realm_completion', name: 'Air Realm Mastery', realm: 'air', score: journey.airScore },
      { type: 'realm_completion', name: 'Land Realm Mastery', realm: 'land', score: journey.landScore },
      { type: 'journey_completion', name: 'S.W.A.L. Journey Complete', realm: null, score: avgScore }
    ];

    for (const achievement of achievements) {
      await db.insert(credentialAchievements).values({
        credentialId: credential.id,
        achievementType: achievement.type,
        achievementName: achievement.name,
        realm: achievement.realm,
        score: achievement.score,
        earnedAt: new Date(),
        createdAt: new Date()
      });
    }

    // Mark journey as complete
    await db.update(onboardingJourneys)
      .set({
        status: 'completed',
        completedAt: new Date(),
        credentialId: credential.id,
        updatedAt: new Date()
      })
      .where(eq(onboardingJourneys.id, journey.id));

    return {
      credential,
      house,
      averageScore: avgScore
    };
  }),

  // Get journey statistics (for admin)
  getJourneyStats: protectedProcedure.query(async ({ ctx }) => {
    // This would be admin-only in production
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
