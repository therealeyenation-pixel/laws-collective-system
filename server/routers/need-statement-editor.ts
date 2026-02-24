/**
 * Need Statement Editor Router
 * Phase 53: Admin interface for customizing entity need statements
 * 
 * Provides tRPC procedures for managing need statement drafts,
 * versions, and approval workflows.
 */

import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import {
  getEditableEntities,
  getCurrentStatement,
  createDraft,
  updateDraft,
  getDraft,
  getDraftsForEntity,
  getPendingDrafts,
  submitForReview,
  approveDraft,
  rejectDraft,
  deleteDraft,
  getVersionHistory,
  getVersion,
  revertToVersion,
  compareVersions,
  getTemplates,
  generateFromTemplate,
  validateStatement,
  getEditorStatistics
} from '../services/need-statement-editor';

export const needStatementEditorRouter = router({
  /**
   * Get all entities available for editing
   */
  getEntities: publicProcedure.query(() => {
    return getEditableEntities();
  }),

  /**
   * Get current active statement for an entity
   */
  getCurrentStatement: publicProcedure
    .input(z.object({ entityId: z.string() }))
    .query(({ input }) => {
      return getCurrentStatement(input.entityId);
    }),

  /**
   * Create a new draft
   */
  createDraft: publicProcedure
    .input(z.object({
      entityId: z.string(),
      content: z.string(),
      createdBy: z.string().default('admin')
    }))
    .mutation(({ input }) => {
      return createDraft(input.entityId, input.content, input.createdBy);
    }),

  /**
   * Update an existing draft
   */
  updateDraft: publicProcedure
    .input(z.object({
      draftId: z.string(),
      content: z.string()
    }))
    .mutation(({ input }) => {
      return updateDraft(input.draftId, input.content);
    }),

  /**
   * Get a specific draft
   */
  getDraft: publicProcedure
    .input(z.object({ draftId: z.string() }))
    .query(({ input }) => {
      return getDraft(input.draftId);
    }),

  /**
   * Get all drafts for an entity
   */
  getDraftsForEntity: publicProcedure
    .input(z.object({ entityId: z.string() }))
    .query(({ input }) => {
      return getDraftsForEntity(input.entityId);
    }),

  /**
   * Get all drafts pending review
   */
  getPendingDrafts: publicProcedure.query(() => {
    return getPendingDrafts();
  }),

  /**
   * Submit draft for review
   */
  submitForReview: publicProcedure
    .input(z.object({ draftId: z.string() }))
    .mutation(({ input }) => {
      return submitForReview(input.draftId);
    }),

  /**
   * Approve a draft
   */
  approveDraft: publicProcedure
    .input(z.object({
      draftId: z.string(),
      reviewedBy: z.string().default('admin'),
      reviewNotes: z.string().optional()
    }))
    .mutation(({ input }) => {
      return approveDraft(input.draftId, input.reviewedBy, input.reviewNotes);
    }),

  /**
   * Reject a draft
   */
  rejectDraft: publicProcedure
    .input(z.object({
      draftId: z.string(),
      reviewedBy: z.string().default('admin'),
      reviewNotes: z.string()
    }))
    .mutation(({ input }) => {
      return rejectDraft(input.draftId, input.reviewedBy, input.reviewNotes);
    }),

  /**
   * Delete a draft
   */
  deleteDraft: publicProcedure
    .input(z.object({ draftId: z.string() }))
    .mutation(({ input }) => {
      return deleteDraft(input.draftId);
    }),

  /**
   * Get version history for an entity
   */
  getVersionHistory: publicProcedure
    .input(z.object({ entityId: z.string() }))
    .query(({ input }) => {
      return getVersionHistory(input.entityId);
    }),

  /**
   * Get a specific version
   */
  getVersion: publicProcedure
    .input(z.object({
      entityId: z.string(),
      versionNumber: z.number()
    }))
    .query(({ input }) => {
      return getVersion(input.entityId, input.versionNumber);
    }),

  /**
   * Revert to a previous version
   */
  revertToVersion: publicProcedure
    .input(z.object({
      entityId: z.string(),
      versionNumber: z.number(),
      revertedBy: z.string().default('admin')
    }))
    .mutation(({ input }) => {
      return revertToVersion(input.entityId, input.versionNumber, input.revertedBy);
    }),

  /**
   * Compare two versions
   */
  compareVersions: publicProcedure
    .input(z.object({
      entityId: z.string(),
      version1: z.number(),
      version2: z.number()
    }))
    .query(({ input }) => {
      return compareVersions(input.entityId, input.version1, input.version2);
    }),

  /**
   * Get available templates
   */
  getTemplates: publicProcedure.query(() => {
    return getTemplates();
  }),

  /**
   * Generate statement from template
   */
  generateFromTemplate: publicProcedure
    .input(z.object({
      templateId: z.string(),
      sectionContent: z.record(z.string())
    }))
    .mutation(({ input }) => {
      return generateFromTemplate(input.templateId, input.sectionContent);
    }),

  /**
   * Validate statement content
   */
  validateStatement: publicProcedure
    .input(z.object({ content: z.string() }))
    .query(({ input }) => {
      return validateStatement(input.content);
    }),

  /**
   * Get editor statistics
   */
  getStatistics: publicProcedure.query(() => {
    return getEditorStatistics();
  }),

  /**
   * Get dashboard summary
   */
  getDashboard: publicProcedure.query(() => {
    const entities = getEditableEntities();
    const stats = getEditorStatistics();
    const pending = getPendingDrafts();

    return {
      entities,
      statistics: stats,
      pendingReviews: pending,
      alerts: [
        ...(pending.length > 0 ? [{
          type: 'info' as const,
          message: `${pending.length} draft${pending.length === 1 ? '' : 's'} pending review`
        }] : [])
      ]
    };
  })
});
