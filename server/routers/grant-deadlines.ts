/**
 * Grant Deadlines Router
 * 
 * Provides tRPC procedures for managing grant application deadlines
 * and integrating with the compliance calendar.
 */

import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import {
  getGrantDeadlines,
  getGrantDeadlineById,
  getDeadlinesForEntity,
  getUpcomingDeadlines,
  getClosingSoonDeadlines,
  addCustomDeadline,
  updateCustomDeadline,
  deleteCustomDeadline,
  markAsSubmitted,
  generateReminders,
  getReminders,
  getDueReminders,
  markReminderSent,
  addCustomReminder,
  deleteReminder,
  getDeadlineStatistics,
  getDeadlineCalendarEvents,
  searchGrants,
  getGrantsByFundingRange,
  type GrantCategory,
  type GrantStatus,
  type DeadlineFilter
} from '../services/grant-deadlines';

const grantCategorySchema = z.enum(['federal', 'foundation', 'state', 'corporate', 'custom']);
const grantStatusSchema = z.enum(['upcoming', 'open', 'closing_soon', 'closed', 'submitted']);

const deadlineFilterSchema = z.object({
  category: grantCategorySchema.optional(),
  status: grantStatusSchema.optional(),
  entityType: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  funder: z.string().optional()
}).optional();

const customDeadlineSchema = z.object({
  name: z.string(),
  funder: z.string(),
  category: grantCategorySchema,
  description: z.string(),
  eligibleEntities: z.array(z.string()),
  openDate: z.string(),
  closeDate: z.string(),
  maxFunding: z.number(),
  applicationUrl: z.string().optional(),
  contactEmail: z.string().optional(),
  requirements: z.array(z.string()),
  notes: z.string().optional()
});

export const grantDeadlinesRouter = router({
  /**
   * Get all grant deadlines with optional filtering
   */
  getDeadlines: publicProcedure
    .input(deadlineFilterSchema)
    .query(({ input }) => {
      return getGrantDeadlines(input as DeadlineFilter);
    }),

  /**
   * Get a specific deadline by ID
   */
  getDeadlineById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return getGrantDeadlineById(input.id);
    }),

  /**
   * Get deadlines for a specific entity
   */
  getDeadlinesForEntity: publicProcedure
    .input(z.object({ entityType: z.string() }))
    .query(({ input }) => {
      return getDeadlinesForEntity(input.entityType);
    }),

  /**
   * Get upcoming deadlines (next N days)
   */
  getUpcoming: publicProcedure
    .input(z.object({ days: z.number().default(90) }).optional())
    .query(({ input }) => {
      return getUpcomingDeadlines(input?.days || 90);
    }),

  /**
   * Get deadlines closing soon (within 14 days)
   */
  getClosingSoon: publicProcedure.query(() => {
    return getClosingSoonDeadlines();
  }),

  /**
   * Add a custom grant deadline
   */
  addCustomDeadline: publicProcedure
    .input(customDeadlineSchema)
    .mutation(({ input }) => {
      return addCustomDeadline(input);
    }),

  /**
   * Update a custom deadline
   */
  updateCustomDeadline: publicProcedure
    .input(z.object({
      id: z.string(),
      updates: customDeadlineSchema.partial()
    }))
    .mutation(({ input }) => {
      return updateCustomDeadline(input.id, input.updates);
    }),

  /**
   * Delete a custom deadline
   */
  deleteCustomDeadline: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      return deleteCustomDeadline(input.id);
    }),

  /**
   * Mark a deadline as submitted
   */
  markAsSubmitted: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      return markAsSubmitted(input.id);
    }),

  /**
   * Generate reminders for a deadline
   */
  generateReminders: publicProcedure
    .input(z.object({
      deadlineId: z.string(),
      recipientEmail: z.string().optional()
    }))
    .mutation(({ input }) => {
      return generateReminders(input.deadlineId, input.recipientEmail);
    }),

  /**
   * Get all reminders
   */
  getReminders: publicProcedure
    .input(z.object({
      sent: z.boolean().optional(),
      deadlineId: z.string().optional()
    }).optional())
    .query(({ input }) => {
      return getReminders(input);
    }),

  /**
   * Get due reminders (should be sent today or earlier)
   */
  getDueReminders: publicProcedure.query(() => {
    return getDueReminders();
  }),

  /**
   * Mark a reminder as sent
   */
  markReminderSent: publicProcedure
    .input(z.object({ reminderId: z.string() }))
    .mutation(({ input }) => {
      return markReminderSent(input.reminderId);
    }),

  /**
   * Add a custom reminder
   */
  addCustomReminder: publicProcedure
    .input(z.object({
      deadlineId: z.string(),
      reminderDate: z.string(),
      message: z.string(),
      recipientEmail: z.string().optional()
    }))
    .mutation(({ input }) => {
      return addCustomReminder(
        input.deadlineId,
        input.reminderDate,
        input.message,
        input.recipientEmail
      );
    }),

  /**
   * Delete a reminder
   */
  deleteReminder: publicProcedure
    .input(z.object({ reminderId: z.string() }))
    .mutation(({ input }) => {
      return deleteReminder(input.reminderId);
    }),

  /**
   * Get deadline statistics
   */
  getStatistics: publicProcedure.query(() => {
    return getDeadlineStatistics();
  }),

  /**
   * Get calendar events for deadlines
   */
  getCalendarEvents: publicProcedure
    .input(z.object({
      month: z.number().optional(),
      year: z.number().optional()
    }).optional())
    .query(({ input }) => {
      return getDeadlineCalendarEvents(input?.month, input?.year);
    }),

  /**
   * Search grants by keyword
   */
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      return searchGrants(input.query);
    }),

  /**
   * Get grants by funding range
   */
  getByFundingRange: publicProcedure
    .input(z.object({
      minFunding: z.number(),
      maxFunding: z.number()
    }))
    .query(({ input }) => {
      return getGrantsByFundingRange(input.minFunding, input.maxFunding);
    }),

  /**
   * Get dashboard summary for grant deadlines
   */
  getDashboardSummary: publicProcedure.query(() => {
    const stats = getDeadlineStatistics();
    const closingSoon = getClosingSoonDeadlines();
    const dueReminders = getDueReminders();
    const upcoming = getUpcomingDeadlines(30);
    
    return {
      statistics: stats,
      closingSoonDeadlines: closingSoon.slice(0, 5),
      dueReminders: dueReminders.slice(0, 5),
      upcomingDeadlines: upcoming.slice(0, 5),
      alerts: [
        ...(closingSoon.length > 0 ? [{
          type: 'warning' as const,
          message: `${closingSoon.length} grant deadline${closingSoon.length === 1 ? '' : 's'} closing within 14 days`
        }] : []),
        ...(dueReminders.length > 0 ? [{
          type: 'info' as const,
          message: `${dueReminders.length} reminder${dueReminders.length === 1 ? '' : 's'} ready to send`
        }] : [])
      ]
    };
  })
});
