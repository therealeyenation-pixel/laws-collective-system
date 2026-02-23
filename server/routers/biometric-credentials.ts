import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { biometricCredentials } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const biometricCredentialsRouter = router({
  // Get all credentials for current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const credentials = await db
      .select()
      .from(biometricCredentials)
      .where(eq(biometricCredentials.userId, ctx.user.id));
    return credentials;
  }),

  // Register a new credential
  register: protectedProcedure
    .input(z.object({
      credentialId: z.string(),
      publicKey: z.string(),
      name: z.string(),
      deviceType: z.enum(["platform", "cross-platform"]),
      deviceInfo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [credential] = await db
        .insert(biometricCredentials)
        .values({
          userId: ctx.user.id,
          credentialId: input.credentialId,
          publicKey: input.publicKey,
          name: input.name,
          deviceType: input.deviceType,
          deviceInfo: input.deviceInfo || null,
          counter: 0,
        });
      return { success: true, id: credential.insertId };
    }),

  // Rename a credential
  rename: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(biometricCredentials)
        .set({ name: input.name })
        .where(
          and(
            eq(biometricCredentials.id, input.id),
            eq(biometricCredentials.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  // Delete a credential
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(biometricCredentials)
        .where(
          and(
            eq(biometricCredentials.id, input.id),
            eq(biometricCredentials.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  // Update last used timestamp
  updateLastUsed: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(biometricCredentials)
        .set({ lastUsedAt: new Date() })
        .where(
          and(
            eq(biometricCredentials.id, input.id),
            eq(biometricCredentials.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  // Get credential count
  count: protectedProcedure.query(async ({ ctx }) => {
    const credentials = await db
      .select()
      .from(biometricCredentials)
      .where(eq(biometricCredentials.userId, ctx.user.id));
    return { count: credentials.length };
  }),
});
