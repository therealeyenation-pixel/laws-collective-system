/**
 * Eternal Flame Vault Router
 * Phase 19.6: Permanent record storage API
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  getStudentVaultRecords,
  sealVaultRecord,
  getGuardianVaultStats,
  verifyVaultRecord,
  getStudentVaultTimeline,
  exportVaultRecords,
} from "../services/eternal-flame-vault";

export const eternalFlameVaultRouter = router({
  /**
   * Get vault records for a student
   */
  getStudentRecords: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
    }))
    .query(async ({ input }) => {
      return getStudentVaultRecords(input.studentProfileId);
    }),

  /**
   * Seal a record in the vault
   */
  sealRecord: protectedProcedure
    .input(z.object({
      certificateId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return sealVaultRecord(input.certificateId, ctx.user.id);
    }),

  /**
   * Get vault statistics for guardian's students
   */
  getGuardianStats: protectedProcedure.query(async ({ ctx }) => {
    return getGuardianVaultStats(ctx.user.id);
  }),

  /**
   * Verify a vault record by hash
   */
  verify: publicProcedure
    .input(z.object({
      recordHash: z.string(),
    }))
    .query(async ({ input }) => {
      return verifyVaultRecord(input.recordHash);
    }),

  /**
   * Get vault timeline for a student
   */
  getTimeline: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
    }))
    .query(async ({ input }) => {
      return getStudentVaultTimeline(input.studentProfileId);
    }),

  /**
   * Export vault records as JSON
   */
  export: protectedProcedure
    .input(z.object({
      studentProfileId: z.number(),
    }))
    .query(async ({ input }) => {
      return exportVaultRecords(input.studentProfileId);
    }),
});
