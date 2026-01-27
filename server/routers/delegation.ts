import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notifications, users } from "../../drizzle/schema";
import { eq, desc, and, sql, or, inArray } from "drizzle-orm";

/**
 * Delegation Router
 * Handles task delegation, notifications, and approval workflows
 */

// Delegation status enum
const delegationStatusEnum = z.enum(["pending", "accepted", "declined", "completed", "pending_approval", "approved", "rejected"]);

// Delegation reason enum
const delegationReasonEnum = z.enum(["workload", "expertise", "pto", "priority", "reassignment", "collaboration", "other"]);

// Task type enum
const taskTypeEnum = z.enum(["article", "signature", "approval", "review", "analysis", "compliance"]);

// Priority enum
const priorityEnum = z.enum(["low", "medium", "high", "critical"]);

// Helper to create notification for delegation events
async function createDelegationNotification(
  db: any,
  userId: number,
  type: "delegated_to_you" | "delegation_accepted" | "delegation_declined" | "delegation_completed" | "approval_required" | "approval_granted" | "approval_rejected",
  taskTitle: string,
  fromUserName: string,
  toUserName: string,
  metadata?: Record<string, any>
) {
  const notificationTitles: Record<string, string> = {
    delegated_to_you: "Task Delegated to You",
    delegation_accepted: "Delegation Accepted",
    delegation_declined: "Delegation Declined",
    delegation_completed: "Delegated Task Completed",
    approval_required: "Delegation Approval Required",
    approval_granted: "Delegation Approved",
    approval_rejected: "Delegation Rejected",
  };

  const notificationMessages: Record<string, string> = {
    delegated_to_you: `${fromUserName} delegated "${taskTitle}" to you`,
    delegation_accepted: `${toUserName} accepted your delegation of "${taskTitle}"`,
    delegation_declined: `${toUserName} declined your delegation of "${taskTitle}"`,
    delegation_completed: `${toUserName} completed "${taskTitle}"`,
    approval_required: `${fromUserName} requests approval to delegate "${taskTitle}" to ${toUserName}`,
    approval_granted: `Your delegation of "${taskTitle}" has been approved`,
    approval_rejected: `Your delegation of "${taskTitle}" was rejected`,
  };

  await db.insert(notifications).values({
    userId,
    type: type === "approval_required" ? "approval" : "operation",
    title: notificationTitles[type],
    message: notificationMessages[type],
    actionUrl: "/task-delegation",
    isPriority: type === "approval_required" || type === "delegated_to_you",
    metadata: {
      delegationType: type,
      taskTitle,
      fromUserName,
      toUserName,
      ...metadata,
    },
    isRead: false,
    createdAt: new Date(),
  });
}

export const delegationRouter = router({
  /**
   * Create a new delegation request
   */
  create: protectedProcedure
    .input(z.object({
      taskId: z.string(),
      taskType: taskTypeEnum,
      taskTitle: z.string(),
      toUserId: z.number(),
      reason: delegationReasonEnum,
      notes: z.string().optional(),
      originalDueDate: z.date(),
      newDueDate: z.date().optional(),
      priority: priorityEnum.default("medium"),
      requiresApproval: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const fromUser = ctx.user;
      
      // Get the target user
      const [toUser] = await db.select().from(users).where(eq(users.id, input.toUserId));
      if (!toUser) throw new Error("Target user not found");

      // Determine if approval is required (for high/critical priority)
      const needsApproval = input.requiresApproval || input.priority === "critical" || input.priority === "high";

      const delegationId = `del-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const status = needsApproval ? "pending_approval" : "pending";

      // Create notification for the recipient or manager
      if (needsApproval) {
        // Find managers (staff+ role)
        const managers = await db.select().from(users).where(
          or(eq(users.role, "admin"), eq(users.role, "staff"))
        );
        
        // Notify all managers about approval request
        for (const manager of managers) {
          if (manager.id !== fromUser.id) {
            await createDelegationNotification(
              db,
              manager.id,
              "approval_required",
              input.taskTitle,
              fromUser.name || "Unknown",
              toUser.name || "Unknown",
              { delegationId, taskId: input.taskId, priority: input.priority }
            );
          }
        }
      } else {
        // Direct notification to recipient
        await createDelegationNotification(
          db,
          input.toUserId,
          "delegated_to_you",
          input.taskTitle,
          fromUser.name || "Unknown",
          toUser.name || "Unknown",
          { delegationId, taskId: input.taskId, reason: input.reason, notes: input.notes }
        );
      }

      return {
        success: true,
        delegationId,
        status,
        needsApproval,
        message: needsApproval 
          ? "Delegation submitted for manager approval" 
          : "Delegation request sent successfully",
      };
    }),

  /**
   * Respond to a delegation (accept/decline)
   */
  respond: protectedProcedure
    .input(z.object({
      delegationId: z.string(),
      taskId: z.string(),
      taskTitle: z.string(),
      fromUserId: z.number(),
      action: z.enum(["accept", "decline"]),
      declineReason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const toUser = ctx.user;
      
      // Get the from user
      const [fromUser] = await db.select().from(users).where(eq(users.id, input.fromUserId));
      if (!fromUser) throw new Error("Original delegator not found");

      const notificationType = input.action === "accept" ? "delegation_accepted" : "delegation_declined";

      // Notify the original delegator
      await createDelegationNotification(
        db,
        input.fromUserId,
        notificationType,
        input.taskTitle,
        fromUser.name || "Unknown",
        toUser.name || "Unknown",
        { delegationId: input.delegationId, declineReason: input.declineReason }
      );

      return {
        success: true,
        status: input.action === "accept" ? "accepted" : "declined",
        message: input.action === "accept" 
          ? "Delegation accepted successfully" 
          : "Delegation declined",
      };
    }),

  /**
   * Mark a delegated task as completed
   */
  complete: protectedProcedure
    .input(z.object({
      delegationId: z.string(),
      taskId: z.string(),
      taskTitle: z.string(),
      fromUserId: z.number(),
      completionNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const toUser = ctx.user;
      
      // Get the from user
      const [fromUser] = await db.select().from(users).where(eq(users.id, input.fromUserId));
      if (!fromUser) throw new Error("Original delegator not found");

      // Notify the original delegator
      await createDelegationNotification(
        db,
        input.fromUserId,
        "delegation_completed",
        input.taskTitle,
        fromUser.name || "Unknown",
        toUser.name || "Unknown",
        { delegationId: input.delegationId, completionNotes: input.completionNotes }
      );

      return {
        success: true,
        status: "completed",
        message: "Task marked as completed",
      };
    }),

  /**
   * Approve or reject a delegation request (manager only)
   */
  approveOrReject: protectedProcedure
    .input(z.object({
      delegationId: z.string(),
      taskId: z.string(),
      taskTitle: z.string(),
      fromUserId: z.number(),
      toUserId: z.number(),
      action: z.enum(["approve", "reject"]),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if user is manager (staff or admin)
      if (ctx.user.role !== "admin" && ctx.user.role !== "staff") {
        throw new Error("Only managers can approve or reject delegations");
      }

      // Get users
      const [fromUser] = await db.select().from(users).where(eq(users.id, input.fromUserId));
      const [toUser] = await db.select().from(users).where(eq(users.id, input.toUserId));

      if (!fromUser || !toUser) throw new Error("Users not found");

      if (input.action === "approve") {
        // Notify the delegator that it's approved
        await createDelegationNotification(
          db,
          input.fromUserId,
          "approval_granted",
          input.taskTitle,
          fromUser.name || "Unknown",
          toUser.name || "Unknown",
          { delegationId: input.delegationId, approvedBy: ctx.user.name }
        );

        // Notify the recipient about the delegation
        await createDelegationNotification(
          db,
          input.toUserId,
          "delegated_to_you",
          input.taskTitle,
          fromUser.name || "Unknown",
          toUser.name || "Unknown",
          { delegationId: input.delegationId }
        );
      } else {
        // Notify the delegator that it's rejected
        await createDelegationNotification(
          db,
          input.fromUserId,
          "approval_rejected",
          input.taskTitle,
          fromUser.name || "Unknown",
          toUser.name || "Unknown",
          { delegationId: input.delegationId, rejectedBy: ctx.user.name, reason: input.reason }
        );
      }

      return {
        success: true,
        status: input.action === "approve" ? "approved" : "rejected",
        message: input.action === "approve" 
          ? "Delegation approved and sent to recipient" 
          : "Delegation rejected",
      };
    }),

  /**
   * Get pending approval requests (for managers)
   */
  getPendingApprovals: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Check if user is manager
    if (ctx.user.role !== "admin" && ctx.user.role !== "staff") {
      return { approvals: [] };
    }

    // Get notifications that are approval requests
    const approvalNotifications = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.type, "approval"),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt));

    return {
      approvals: approvalNotifications.map(n => ({
        id: n.id,
        delegationId: (n.metadata as any)?.delegationId,
        taskId: (n.metadata as any)?.taskId,
        taskTitle: (n.metadata as any)?.taskTitle,
        fromUserName: (n.metadata as any)?.fromUserName,
        toUserName: (n.metadata as any)?.toUserName,
        priority: (n.metadata as any)?.priority,
        createdAt: n.createdAt,
      })),
    };
  }),

  /**
   * Get team workload data
   */
  getTeamWorkload: protectedProcedure
    .input(z.object({
      department: z.string().optional(),
    }).optional())
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get all users (in a real app, filter by team/department)
      const teamMembers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      }).from(users);

      // For each user, count their notifications as a proxy for workload
      const workloadData = await Promise.all(teamMembers.map(async (member) => {
        const [pendingCount] = await db.select({ count: sql<number>`count(*)` })
          .from(notifications)
          .where(and(
            eq(notifications.userId, member.id),
            eq(notifications.isRead, false)
          ));

        const pendingTasks = pendingCount?.count ?? 0;
        const maxTasks = 10;
        const utilization = Math.min(100, Math.round((pendingTasks / maxTasks) * 100));

        let status: "available" | "balanced" | "busy" | "overloaded";
        if (utilization < 50) status = "available";
        else if (utilization < 75) status = "balanced";
        else if (utilization < 90) status = "busy";
        else status = "overloaded";

        return {
          id: member.id,
          name: member.name || "Unknown",
          email: member.email || "",
          role: member.role,
          workload: {
            pendingTasks,
            overdueTasks: Math.floor(Math.random() * 3), // Simulated
            completedThisWeek: Math.floor(Math.random() * 10) + 3, // Simulated
          },
          capacity: {
            maxTasks,
            currentUtilization: utilization,
            availableCapacity: Math.max(0, maxTasks - pendingTasks),
            status,
          },
        };
      }));

      return { teamMembers: workloadData };
    }),

  /**
   * Get delegation analytics
   */
  getAnalytics: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(365).default(30),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const days = input?.days ?? 30;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get delegation-related notifications as proxy for analytics
      const delegationNotifications = await db.select()
        .from(notifications)
        .where(and(
          eq(notifications.type, "operation"),
          sql`${notifications.createdAt} >= ${cutoffDate}`
        ))
        .orderBy(desc(notifications.createdAt));

      // Calculate metrics
      const total = delegationNotifications.length;
      const accepted = delegationNotifications.filter(n => 
        (n.metadata as any)?.delegationType === "delegation_accepted"
      ).length;
      const declined = delegationNotifications.filter(n => 
        (n.metadata as any)?.delegationType === "delegation_declined"
      ).length;
      const completed = delegationNotifications.filter(n => 
        (n.metadata as any)?.delegationType === "delegation_completed"
      ).length;

      return {
        metrics: {
          totalDelegations: total,
          acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
          declineRate: total > 0 ? (declined / total) * 100 : 0,
          completionRate: accepted > 0 ? (completed / accepted) * 100 : 0,
          avgResponseTime: 12, // Simulated hours
          avgCompletionTime: 48, // Simulated hours
          onTimeCompletionRate: 85, // Simulated percentage
        },
        period: {
          days,
          startDate: cutoffDate.toISOString(),
          endDate: new Date().toISOString(),
        },
      };
    }),
});
