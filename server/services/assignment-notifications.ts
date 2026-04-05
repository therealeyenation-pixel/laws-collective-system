import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { 
  notifications,
  articleAssignments,
  signatureRequestSigners,
  signatureRequests,
  articles,
  users
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

// Email notification templates
const EMAIL_TEMPLATES = {
  articleAssignment: {
    subject: "New Article Assignment: {{articleTitle}}",
    body: `
      <h2>You have been assigned a new article to read</h2>
      <p><strong>Article:</strong> {{articleTitle}}</p>
      <p><strong>Priority:</strong> {{priority}}</p>
      {{#if dueDate}}<p><strong>Due Date:</strong> {{dueDate}}</p>{{/if}}
      {{#if message}}<p><strong>Message:</strong> {{message}}</p>{{/if}}
      <p>Please log in to the system to read and acknowledge this article.</p>
    `,
  },
  signatureRequest: {
    subject: "Signature Required: {{documentTitle}}",
    body: `
      <h2>Your signature is required</h2>
      <p><strong>Document:</strong> {{documentTitle}}</p>
      <p><strong>Requested by:</strong> {{requesterName}}</p>
      {{#if dueDate}}<p><strong>Due Date:</strong> {{dueDate}}</p>{{/if}}
      {{#if message}}<p><strong>Message:</strong> {{message}}</p>{{/if}}
      <p>Please log in to the system to review and sign this document.</p>
    `,
  },
  reminderArticle: {
    subject: "Reminder: Article Due Soon - {{articleTitle}}",
    body: `
      <h2>Reminder: Article reading due soon</h2>
      <p>This is a reminder that you have an article assignment due soon.</p>
      <p><strong>Article:</strong> {{articleTitle}}</p>
      <p><strong>Due Date:</strong> {{dueDate}}</p>
      <p>Please complete your reading and acknowledgment before the due date.</p>
    `,
  },
  reminderSignature: {
    subject: "Reminder: Signature Required - {{documentTitle}}",
    body: `
      <h2>Reminder: Signature still required</h2>
      <p>This is a reminder that your signature is still needed.</p>
      <p><strong>Document:</strong> {{documentTitle}}</p>
      <p><strong>Due Date:</strong> {{dueDate}}</p>
      <p>Please log in to review and sign this document.</p>
    `,
  },
};

// Simple template replacement
function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }
  // Remove conditional blocks for missing values
  result = result.replace(/{{#if \w+}}[\s\S]*?{{\/if}}/g, (match) => {
    const varMatch = match.match(/{{#if (\w+)}}/);
    if (varMatch && variables[varMatch[1]]) {
      return match.replace(/{{#if \w+}}/, '').replace(/{{\/if}}/, '');
    }
    return '';
  });
  return result;
}

export const assignmentNotificationsRouter = router({
  // Send notification for article assignment
  notifyArticleAssignment: protectedProcedure
    .input(z.object({
      assignmentId: z.number(),
      articleId: z.number(),
      assignedToUserId: z.number(),
      priority: z.string(),
      dueDate: z.date().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get article details
      const [article] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, input.articleId));

      // Get assigned user details
      const [assignedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.assignedToUserId));

      if (!article || !assignedUser) {
        return { success: false, error: "Article or user not found" };
      }

      const variables = {
        articleTitle: article.title,
        priority: input.priority,
        dueDate: input.dueDate ? input.dueDate.toLocaleDateString() : '',
        message: input.message || '',
        userName: assignedUser.name || 'User',
      };

      // Create in-app notification
      await db.insert(notifications).values({
        userId: input.assignedToUserId,
        type: "article_assignment",
        title: `New Article Assignment: ${article.title}`,
        message: `You have been assigned to read "${article.title}" with ${input.priority} priority.${input.dueDate ? ` Due: ${input.dueDate.toLocaleDateString()}` : ''}`,
        metadata: JSON.stringify({
          articleId: input.articleId,
          assignmentId: input.assignmentId,
          priority: input.priority,
        }),
        isRead: false,
      });

      // For owner notifications (admin alerts)
      if (input.priority === 'urgent') {
        await notifyOwner({
          title: `Urgent Article Assignment Created`,
          content: `An urgent article "${article.title}" has been assigned to ${assignedUser.name || assignedUser.email}.`,
        });
      }

      return { success: true };
    }),

  // Send notification for signature request
  notifySignatureRequest: protectedProcedure
    .input(z.object({
      requestId: z.number(),
      signerId: z.number(),
      signerUserId: z.number(),
      documentTitle: z.string(),
      requesterName: z.string(),
      dueDate: z.date().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get signer user details
      const [signerUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.signerUserId));

      if (!signerUser) {
        return { success: false, error: "Signer not found" };
      }

      // Create in-app notification
      await db.insert(notifications).values({
        userId: input.signerUserId,
        type: "signature_request",
        title: `Signature Required: ${input.documentTitle}`,
        message: `${input.requesterName} has requested your signature on "${input.documentTitle}".${input.dueDate ? ` Due: ${input.dueDate.toLocaleDateString()}` : ''}`,
        metadata: JSON.stringify({
          requestId: input.requestId,
          signerId: input.signerId,
        }),
        isRead: false,
      });

      // Update signer record to mark as notified
      await db
        .update(signatureRequestSigners)
        .set({
          status: "notified",
          notifiedAt: new Date(),
        })
        .where(eq(signatureRequestSigners.id, input.signerId));

      return { success: true };
    }),

  // Get pending notifications for current user
  getMyNotifications: protectedProcedure
    .input(z.object({
      type: z.enum(["all", "article_assignment", "signature_request"]).default("all"),
      unreadOnly: z.boolean().default(false),
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const conditions = [eq(notifications.userId, ctx.user.id)];

      if (input?.type && input.type !== "all") {
        conditions.push(eq(notifications.type, input.type));
      }
      if (input?.unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
      }

      const result = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(input?.limit || 20);

      return result;
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(
          eq(notifications.id, input.notificationId),
          eq(notifications.userId, ctx.user.id)
        ));

      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, false)
        ));

      return { success: true };
    }),

  // Get notification counts
  getNotificationCounts: protectedProcedure
    .query(async ({ ctx }) => {
      const unreadCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, false)
        ));

      const articleCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.type, "article_assignment"),
          eq(notifications.isRead, false)
        ));

      const signatureCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.type, "signature_request"),
          eq(notifications.isRead, false)
        ));

      return {
        total: unreadCount[0]?.count || 0,
        articles: articleCount[0]?.count || 0,
        signatures: signatureCount[0]?.count || 0,
      };
    }),
});

export default assignmentNotificationsRouter;
