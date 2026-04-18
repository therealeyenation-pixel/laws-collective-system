import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  supportTickets,
  ticketMessages,
  agents,
  agentConversations,
  agentMessages,
  users,
} from "../../drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";

// The AI Support Agent system prompt (elevated access for diagnostics)
const TECH_SUPPORT_SYSTEM_PROMPT = `You are the Technical Support Agent for the LuvOnPurpose Autonomous Wealth System. You handle escalated issues that the public Q&A agents could not resolve.

You have DIAGNOSTIC-LEVEL access and can troubleshoot:
- Technical issues with platform features (simulators, courses, documents, dashboards)
- Error states, loading failures, and navigation problems
- Account access, permissions, and authentication issues
- Payment and checkout flow problems
- Enrollment, progress tracking, and certificate generation issues

RESOLUTION PROTOCOL:
1. Acknowledge the issue clearly
2. Ask targeted clarifying questions to diagnose the root cause
3. Provide step-by-step resolution instructions
4. If you cannot resolve it, explain why and recommend it be flagged for owner review
5. Always summarize what was tried and next steps

PRIORITY ASSESSMENT (auto-assign based on issue):
- CRITICAL: Account access blocked, data loss risk, payment failures
- HIGH: Feature completely broken, blocking member progress
- MEDIUM: Feature partially working, workaround available
- LOW: Cosmetic issues, feature requests, general questions

You MUST NOT:
- Reveal internal system architecture, source code, or infrastructure details
- Make direct changes to member accounts or data
- Share other members' information
- Promise specific fix timelines without owner confirmation

Be professional, thorough, and solution-oriented.`;

export const supportTicketsRouter = router({
  /**
   * Create a new support ticket (escalation from Q&A agent)
   * Captures the original conversation context and creates a new ticket thread
   */
  create: protectedProcedure
    .input(z.object({
      subject: z.string().min(1).max(255),
      message: z.string().min(1),
      sourceAgentType: z.string(),
      sourcePage: z.string().optional(),
      /** Last few messages from the Q&A conversation for context */
      originalContext: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Create the ticket
      const [ticket] = await db.insert(supportTickets).values({
        userId: ctx.user.id,
        sourceAgentType: input.sourceAgentType,
        sourcePage: input.sourcePage || null,
        subject: input.subject,
        originalContext: input.originalContext || null,
        status: "open",
        priority: "medium", // Will be reassessed by AI
      }).$returningId();

      // Save the user's initial message
      await db.insert(ticketMessages).values({
        ticketId: ticket.id,
        role: "system",
        content: `Escalated from ${input.sourceAgentType} agent. Original context: ${
          input.originalContext 
            ? input.originalContext.map(m => `[${m.role}]: ${m.content}`).join("\n")
            : "No prior context"
        }`,
      });

      await db.insert(ticketMessages).values({
        ticketId: ticket.id,
        role: "user",
        content: input.message,
      });

      // Get AI Support Agent response
      const contextSummary = input.originalContext
        ? `\n\nPREVIOUS Q&A CONVERSATION (from ${input.sourceAgentType} agent):\n${
            input.originalContext.map(m => `${m.role === "user" ? "Member" : "Q&A Agent"}: ${m.content}`).join("\n")
          }`
        : "";

      const llmMessages = [
        {
          role: "system" as const,
          content: TECH_SUPPORT_SYSTEM_PROMPT + contextSummary +
            `\n\nPage the member was on: ${input.sourcePage || "Unknown"}` +
            `\n\nAfter your response, on a NEW LINE at the very end, output a JSON block like this (the system will parse it):\n` +
            `<!--TICKET_META:{"priority":"medium","category":"general","needsReview":false}-->` +
            `\nSet priority to critical/high/medium/low based on the issue severity.` +
            `\nSet category to one of: account_access, feature_bug, payment, enrollment, navigation, data_issue, permissions, general.` +
            `\nSet needsReview to true ONLY if you cannot resolve the issue and it needs owner attention.`,
        },
        { role: "user" as const, content: input.message },
      ];

      const response = await invokeLLM({ messages: llmMessages });
      const rawContent = response.choices[0]?.message?.content || "I'll look into this issue. Could you provide more details about what you're experiencing?";
      const assistantMessage = typeof rawContent === "string" ? rawContent : String(rawContent);

      // Parse meta from response
      let priority: "low" | "medium" | "high" | "critical" = "medium";
      let category = "general";
      let needsReview = false;
      const metaMatch = assistantMessage.match(/<!--TICKET_META:(\{.*?\})-->/);
      if (metaMatch) {
        try {
          const meta = JSON.parse(metaMatch[1]);
          if (["low", "medium", "high", "critical"].includes(meta.priority)) priority = meta.priority;
          if (meta.category) category = meta.category;
          if (meta.needsReview) needsReview = true;
        } catch {}
      }

      // Clean the meta tag from the visible message
      const cleanMessage = assistantMessage.replace(/<!--TICKET_META:\{.*?\}-->/, "").trim();

      // Save AI response
      await db.insert(ticketMessages).values({
        ticketId: ticket.id,
        role: "assistant",
        content: cleanMessage,
      });

      // Update ticket with AI assessment
      await db.update(supportTickets)
        .set({
          priority,
          category,
          status: needsReview ? "needs_review" : "in_progress",
        })
        .where(eq(supportTickets.id, ticket.id));

      // Notify owner for critical/high priority or needs_review
      if (priority === "critical" || priority === "high" || needsReview) {
        await notifyOwner({
          title: `🔧 Support Ticket #${ticket.id} — ${priority.toUpperCase()}`,
          content: `Member escalated from ${input.sourceAgentType}: "${input.subject}"\n\nCategory: ${category}\nNeeds Review: ${needsReview ? "Yes" : "No"}\n\nFirst message: ${input.message.substring(0, 200)}...`,
        }).catch(() => {}); // Don't fail the ticket if notification fails
      }

      return {
        ticketId: ticket.id,
        message: cleanMessage,
        priority,
        category,
        needsReview,
      };
    }),

  /**
   * Send a follow-up message in a ticket thread
   * AI Support Agent auto-responds
   */
  chat: protectedProcedure
    .input(z.object({
      ticketId: z.number(),
      message: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify ticket belongs to user
      const [ticket] = await db.select()
        .from(supportTickets)
        .where(and(
          eq(supportTickets.id, input.ticketId),
          eq(supportTickets.userId, ctx.user.id),
        ))
        .limit(1);

      if (!ticket) throw new Error("Ticket not found");
      if (ticket.status === "closed") throw new Error("This ticket has been closed");

      // Save user message
      await db.insert(ticketMessages).values({
        ticketId: input.ticketId,
        role: "user",
        content: input.message,
      });

      // Get conversation history
      const history = await db.select()
        .from(ticketMessages)
        .where(eq(ticketMessages.ticketId, input.ticketId))
        .orderBy(ticketMessages.createdAt)
        .limit(20);

      // Build LLM messages
      const contextFromOriginal = ticket.originalContext
        ? `\n\nORIGINAL Q&A CONTEXT:\n${
            (ticket.originalContext as Array<{role: string; content: string}>)
              .map((m: {role: string; content: string}) => `${m.role === "user" ? "Member" : "Q&A Agent"}: ${m.content}`)
              .join("\n")
          }`
        : "";

      const llmMessages = [
        {
          role: "system" as const,
          content: TECH_SUPPORT_SYSTEM_PROMPT + contextFromOriginal +
            `\n\nTicket subject: ${ticket.subject}` +
            `\nSource: ${ticket.sourceAgentType} agent` +
            `\nPage: ${ticket.sourcePage || "Unknown"}` +
            `\nCurrent priority: ${ticket.priority}` +
            `\n\nIf the issue is now resolved, end your message with: <!--RESOLVED-->` +
            `\nIf you still cannot resolve and need owner review, end with: <!--NEEDS_REVIEW-->`,
        },
        ...history
          .filter(m => m.role !== "system")
          .map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
      ];

      const response = await invokeLLM({ messages: llmMessages });
      const rawContent = response.choices[0]?.message?.content || "I'm continuing to work on this. Could you provide more details?";
      const assistantMessage = typeof rawContent === "string" ? rawContent : String(rawContent);

      // Check for resolution markers
      const isResolved = assistantMessage.includes("<!--RESOLVED-->");
      const needsReview = assistantMessage.includes("<!--NEEDS_REVIEW-->");
      const cleanMessage = assistantMessage
        .replace(/<!--RESOLVED-->/, "")
        .replace(/<!--NEEDS_REVIEW-->/, "")
        .trim();

      // Save AI response
      await db.insert(ticketMessages).values({
        ticketId: input.ticketId,
        role: "assistant",
        content: cleanMessage,
      });

      // Update ticket status
      if (isResolved) {
        await db.update(supportTickets)
          .set({
            status: "resolved",
            resolutionSummary: cleanMessage.substring(0, 500),
            resolvedAt: new Date(),
          })
          .where(eq(supportTickets.id, input.ticketId));
      } else if (needsReview) {
        await db.update(supportTickets)
          .set({ status: "needs_review" })
          .where(eq(supportTickets.id, input.ticketId));

        // Notify owner
        await notifyOwner({
          title: `🔧 Ticket #${input.ticketId} needs owner review`,
          content: `The AI Support Agent could not resolve this issue.\n\nSubject: ${ticket.subject}\nLatest: ${cleanMessage.substring(0, 200)}...`,
        }).catch(() => {});
      }

      return {
        message: cleanMessage,
        isResolved,
        needsReview,
      };
    }),

  /**
   * Get user's own tickets
   */
  myTickets: protectedProcedure
    .input(z.object({
      status: z.enum(["all", "open", "in_progress", "resolved", "needs_review", "closed"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const conditions = [eq(supportTickets.userId, ctx.user.id)];
      if (input?.status && input.status !== "all") {
        conditions.push(eq(supportTickets.status, input.status));
      }

      const tickets = await db.select()
        .from(supportTickets)
        .where(and(...conditions))
        .orderBy(desc(supportTickets.createdAt))
        .limit(50);

      return tickets;
    }),

  /**
   * Get messages for a specific ticket (user's own)
   */
  getMessages: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify ticket belongs to user OR user is admin/owner
      const [ticket] = await db.select()
        .from(supportTickets)
        .where(eq(supportTickets.id, input.ticketId))
        .limit(1);

      if (!ticket) throw new Error("Ticket not found");
      if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new Error("Access denied");
      }

      const messages = await db.select()
        .from(ticketMessages)
        .where(eq(ticketMessages.ticketId, input.ticketId))
        .orderBy(ticketMessages.createdAt);

      return { ticket, messages };
    }),

  /**
   * Close a ticket (user can close their own)
   */
  close: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [ticket] = await db.select()
        .from(supportTickets)
        .where(eq(supportTickets.id, input.ticketId))
        .limit(1);

      if (!ticket) throw new Error("Ticket not found");
      if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new Error("Access denied");
      }

      await db.update(supportTickets)
        .set({ status: "closed" })
        .where(eq(supportTickets.id, input.ticketId));

      return { success: true };
    }),

  // === ADMIN/OWNER ENDPOINTS ===

  /**
   * Get all tickets (admin/owner only)
   */
  adminList: protectedProcedure
    .input(z.object({
      status: z.enum(["all", "open", "in_progress", "resolved", "needs_review", "closed"]).optional(),
      priority: z.enum(["all", "low", "medium", "high", "critical"]).optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new Error("Admin access required");
      }

      const conditions: any[] = [];
      if (input?.status && input.status !== "all") {
        conditions.push(eq(supportTickets.status, input.status));
      }
      if (input?.priority && input.priority !== "all") {
        conditions.push(eq(supportTickets.priority, input.priority));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const tickets = await db.select({
        ticket: supportTickets,
        userName: users.name,
        userEmail: users.email,
      })
        .from(supportTickets)
        .leftJoin(users, eq(supportTickets.userId, users.id))
        .where(whereClause)
        .orderBy(desc(supportTickets.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);

      // Get total count
      const [totalResult] = await db.select({ total: count() })
        .from(supportTickets)
        .where(whereClause);

      return {
        tickets: tickets.map(t => ({
          ...t.ticket,
          userName: t.userName,
          userEmail: t.userEmail,
        })),
        total: totalResult?.total || 0,
      };
    }),

  /**
   * Get ticket stats (admin/owner only)
   */
  adminStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
      throw new Error("Admin access required");
    }

    const [stats] = await db.select({
      total: count(),
      open: sql<number>`SUM(CASE WHEN ${supportTickets.status} = 'open' THEN 1 ELSE 0 END)`,
      inProgress: sql<number>`SUM(CASE WHEN ${supportTickets.status} = 'in_progress' THEN 1 ELSE 0 END)`,
      resolved: sql<number>`SUM(CASE WHEN ${supportTickets.status} = 'resolved' THEN 1 ELSE 0 END)`,
      needsReview: sql<number>`SUM(CASE WHEN ${supportTickets.status} = 'needs_review' THEN 1 ELSE 0 END)`,
      closed: sql<number>`SUM(CASE WHEN ${supportTickets.status} = 'closed' THEN 1 ELSE 0 END)`,
      critical: sql<number>`SUM(CASE WHEN ${supportTickets.priority} = 'critical' THEN 1 ELSE 0 END)`,
      high: sql<number>`SUM(CASE WHEN ${supportTickets.priority} = 'high' THEN 1 ELSE 0 END)`,
    }).from(supportTickets);

    return {
      total: stats?.total || 0,
      open: Number(stats?.open) || 0,
      inProgress: Number(stats?.inProgress) || 0,
      resolved: Number(stats?.resolved) || 0,
      needsReview: Number(stats?.needsReview) || 0,
      closed: Number(stats?.closed) || 0,
      critical: Number(stats?.critical) || 0,
      high: Number(stats?.high) || 0,
    };
  }),

  /**
   * Admin reply to a ticket (adds a system message and triggers AI follow-up)
   */
  adminReply: protectedProcedure
    .input(z.object({
      ticketId: z.number(),
      message: z.string().min(1),
      closeTicket: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new Error("Admin access required");
      }

      // Save admin message as system message
      await db.insert(ticketMessages).values({
        ticketId: input.ticketId,
        role: "system",
        content: `[Admin Response from ${ctx.user.name || "Admin"}]: ${input.message}`,
        metadata: { adminId: ctx.user.id, adminName: ctx.user.name } as any,
      });

      if (input.closeTicket) {
        await db.update(supportTickets)
          .set({
            status: "resolved",
            resolutionSummary: input.message.substring(0, 500),
            resolvedAt: new Date(),
          })
          .where(eq(supportTickets.id, input.ticketId));
      }

      return { success: true };
    }),
});
