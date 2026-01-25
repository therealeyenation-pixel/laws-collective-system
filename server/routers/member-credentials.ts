/**
 * Member Credentials Router
 * Handles credential management for L.A.W.S. Collective members
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { memberCredentials, credentialAchievements, houses } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { 
  generateCredentialId, 
  generateVerificationCode, 
  generateQRData,
  validateCredentialId
} from "../credentials";

export const memberCredentialsRouter = router({
  // Get current user's credential
  getMyCredential: protectedProcedure.query(async ({ ctx }) => {
    const credential = await db.query.memberCredentials.findFirst({
      where: and(
        eq(memberCredentials.userId, ctx.user.id),
        eq(memberCredentials.status, 'active')
      ),
      orderBy: desc(memberCredentials.issuedAt)
    });

    if (!credential) {
      return null;
    }

    // Get achievements
    const achievements = await db.query.credentialAchievements.findMany({
      where: eq(credentialAchievements.credentialId, credential.id)
    });

    // Get house if linked
    let house = null;
    if (credential.houseId) {
      house = await db.query.houses.findFirst({
        where: eq(houses.id, credential.houseId)
      });
    }

    return {
      ...credential,
      achievements,
      house,
      qrData: generateQRData(credential.credentialId, credential.verificationCode)
    };
  }),

  // Verify a credential by ID
  verifyCredential: publicProcedure
    .input(z.object({
      credentialId: z.string(),
      verificationCode: z.string().optional()
    }))
    .query(async ({ input }) => {
      const credential = await db.query.memberCredentials.findFirst({
        where: eq(memberCredentials.credentialId, input.credentialId)
      });

      if (!credential) {
        return { valid: false, message: 'Credential not found' };
      }

      if (credential.status !== 'active') {
        return { valid: false, message: 'Credential is not active' };
      }

      // If verification code provided, check it
      if (input.verificationCode && credential.verificationCode !== input.verificationCode) {
        return { valid: false, message: 'Invalid verification code' };
      }

      return {
        valid: true,
        credentialId: credential.credentialId,
        accessLevel: credential.accessLevel,
        entryPath: credential.entryPath,
        issuedAt: credential.issuedAt,
        status: credential.status
      };
    }),

  // Get credential achievements
  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const credential = await db.query.memberCredentials.findFirst({
      where: and(
        eq(memberCredentials.userId, ctx.user.id),
        eq(memberCredentials.status, 'active')
      )
    });

    if (!credential) {
      return [];
    }

    return db.query.credentialAchievements.findMany({
      where: eq(credentialAchievements.credentialId, credential.id),
      orderBy: desc(credentialAchievements.earnedAt)
    });
  }),

  // Get credential statistics (for admin)
  getStats: protectedProcedure.query(async () => {
    const allCredentials = await db.query.memberCredentials.findMany();
    
    const stats = {
      total: allCredentials.length,
      active: allCredentials.filter(c => c.status === 'active').length,
      suspended: allCredentials.filter(c => c.status === 'suspended').length,
      revoked: allCredentials.filter(c => c.status === 'revoked').length,
      byEntryPath: {
        game: allCredentials.filter(c => c.entryPath === 'game').length,
        academy: allCredentials.filter(c => c.entryPath === 'academy').length,
        direct_onboarding: allCredentials.filter(c => c.entryPath === 'direct_onboarding').length,
        employment: allCredentials.filter(c => c.entryPath === 'employment').length,
        legacy: allCredentials.filter(c => c.entryPath === 'legacy').length
      },
      byAccessLevel: {
        member: allCredentials.filter(c => c.accessLevel === 'member').length,
        advanced: allCredentials.filter(c => c.accessLevel === 'advanced').length,
        elite: allCredentials.filter(c => c.accessLevel === 'elite').length,
        founder: allCredentials.filter(c => c.accessLevel === 'founder').length
      }
    };

    return stats;
  })
});
