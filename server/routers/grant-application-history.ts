/**
 * Grant Application History Router
 * Phase 54: Track submitted applications, status, and funder responses
 * 
 * Provides tRPC procedures for managing grant application tracking,
 * timeline events, funder responses, and analytics.
 */

import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  updateStatus,
  getTimeline,
  addTimelineEvent,
  getFunderResponses,
  addFunderResponse,
  getDocuments,
  addDocument,
  getAnalytics,
  getApplicationsByEntity,
  getPendingApplications,
  getUpcomingDeadlines,
  getDashboardSummary,
  searchApplications,
  getEntityNames,
  type ApplicationStatus,
  type FunderType
} from '../services/grant-application-history';

const applicationStatusSchema = z.enum([
  'draft',
  'submitted',
  'under_review',
  'additional_info_requested',
  'approved',
  'rejected',
  'withdrawn'
]);

const funderTypeSchema = z.enum(['federal', 'foundation', 'state', 'corporate', 'other']);

const documentTypeSchema = z.enum([
  'application',
  'budget',
  'narrative',
  'support_letter',
  'financial_statement',
  'other'
]);

const responseTypeSchema = z.enum([
  'acknowledgment',
  'request_info',
  'site_visit',
  'decision',
  'feedback'
]);

export const grantApplicationHistoryRouter = router({
  /**
   * Get all applications with optional filters
   */
  getApplications: publicProcedure
    .input(z.object({
      entityId: z.string().optional(),
      status: applicationStatusSchema.optional(),
      funderType: funderTypeSchema.optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(({ input }) => {
      return getApplications(input);
    }),

  /**
   * Get a single application
   */
  getApplication: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return getApplication(input.id);
    }),

  /**
   * Create a new application
   */
  createApplication: publicProcedure
    .input(z.object({
      entityId: z.string(),
      entityName: z.string(),
      grantName: z.string(),
      funderName: z.string(),
      funderType: funderTypeSchema,
      requestedAmount: z.number(),
      awardedAmount: z.number().optional(),
      status: applicationStatusSchema.default('draft'),
      submissionDate: z.string().optional(),
      deadlineDate: z.string(),
      decisionDate: z.string().optional(),
      projectTitle: z.string(),
      projectDescription: z.string(),
      contactPerson: z.string(),
      contactEmail: z.string(),
      notes: z.string().default(''),
    }))
    .mutation(({ input }) => {
      return createApplication(input);
    }),

  /**
   * Update an application
   */
  updateApplication: publicProcedure
    .input(z.object({
      id: z.string(),
      updates: z.object({
        grantName: z.string().optional(),
        funderName: z.string().optional(),
        funderType: funderTypeSchema.optional(),
        requestedAmount: z.number().optional(),
        awardedAmount: z.number().optional(),
        status: applicationStatusSchema.optional(),
        submissionDate: z.string().optional(),
        deadlineDate: z.string().optional(),
        decisionDate: z.string().optional(),
        projectTitle: z.string().optional(),
        projectDescription: z.string().optional(),
        contactPerson: z.string().optional(),
        contactEmail: z.string().optional(),
        notes: z.string().optional(),
      }),
    }))
    .mutation(({ input }) => {
      return updateApplication(input.id, input.updates);
    }),

  /**
   * Delete an application (draft only)
   */
  deleteApplication: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      return deleteApplication(input.id);
    }),

  /**
   * Update application status
   */
  updateStatus: publicProcedure
    .input(z.object({
      id: z.string(),
      status: applicationStatusSchema,
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return updateStatus(input.id, input.status, input.notes);
    }),

  /**
   * Get timeline for an application
   */
  getTimeline: publicProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(({ input }) => {
      return getTimeline(input.applicationId);
    }),

  /**
   * Add a timeline event
   */
  addTimelineEvent: publicProcedure
    .input(z.object({
      applicationId: z.string(),
      eventType: z.enum(['status_change', 'note_added', 'document_uploaded', 'communication', 'reminder']),
      previousStatus: applicationStatusSchema.optional(),
      newStatus: applicationStatusSchema.optional(),
      description: z.string(),
      createdBy: z.string().default('user'),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(({ input }) => {
      const { applicationId, ...data } = input;
      return addTimelineEvent(applicationId, data);
    }),

  /**
   * Get funder responses for an application
   */
  getFunderResponses: publicProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(({ input }) => {
      return getFunderResponses(input.applicationId);
    }),

  /**
   * Add a funder response
   */
  addFunderResponse: publicProcedure
    .input(z.object({
      applicationId: z.string(),
      responseDate: z.string(),
      responseType: responseTypeSchema,
      summary: z.string(),
      details: z.string(),
      actionRequired: z.boolean().default(false),
      actionDeadline: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const { applicationId, ...data } = input;
      return addFunderResponse(applicationId, data);
    }),

  /**
   * Get documents for an application
   */
  getDocuments: publicProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(({ input }) => {
      return getDocuments(input.applicationId);
    }),

  /**
   * Add a document
   */
  addDocument: publicProcedure
    .input(z.object({
      applicationId: z.string(),
      documentType: documentTypeSchema,
      fileName: z.string(),
      fileUrl: z.string(),
      uploadedBy: z.string().default('user'),
    }))
    .mutation(({ input }) => {
      const { applicationId, ...data } = input;
      return addDocument(applicationId, data);
    }),

  /**
   * Get analytics
   */
  getAnalytics: publicProcedure.query(() => {
    return getAnalytics();
  }),

  /**
   * Get applications by entity
   */
  getByEntity: publicProcedure
    .input(z.object({ entityId: z.string() }))
    .query(({ input }) => {
      return getApplicationsByEntity(input.entityId);
    }),

  /**
   * Get pending applications
   */
  getPending: publicProcedure.query(() => {
    return getPendingApplications();
  }),

  /**
   * Get upcoming deadlines
   */
  getUpcomingDeadlines: publicProcedure
    .input(z.object({ daysAhead: z.number().default(30) }).optional())
    .query(({ input }) => {
      return getUpcomingDeadlines(input?.daysAhead);
    }),

  /**
   * Get dashboard summary
   */
  getDashboard: publicProcedure.query(() => {
    return getDashboardSummary();
  }),

  /**
   * Search applications
   */
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      return searchApplications(input.query);
    }),

  /**
   * Get entity names
   */
  getEntityNames: publicProcedure.query(() => {
    return getEntityNames();
  }),

  /**
   * Get application with full details (timeline, responses, documents)
   */
  getFullDetails: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const application = getApplication(input.id);
      if (!application) return null;

      return {
        application,
        timeline: getTimeline(input.id),
        funderResponses: getFunderResponses(input.id),
        documents: getDocuments(input.id),
      };
    }),

  /**
   * Submit an application (change status from draft to submitted)
   */
  submitApplication: publicProcedure
    .input(z.object({
      id: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return updateStatus(input.id, 'submitted', input.notes);
    }),

  /**
   * Withdraw an application
   */
  withdrawApplication: publicProcedure
    .input(z.object({
      id: z.string(),
      reason: z.string(),
    }))
    .mutation(({ input }) => {
      return updateStatus(input.id, 'withdrawn', `Withdrawn: ${input.reason}`);
    }),
});
