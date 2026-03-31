import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const teamCollaborationFeaturesRouter = router({
  // Add comment to dashboard
  addComment: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        widgetId: z.string().optional(),
        content: z.string(),
        mentions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        commentId: `comment_${Date.now()}`,
        dashboardId: input.dashboardId,
        author: ctx.user.email,
        content: input.content,
        mentions: input.mentions || [],
        created: true,
        timestamp: new Date(),
      };
    }),

  // Get dashboard comments
  getDashboardComments: protectedProcedure
    .input(z.object({ dashboardId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        comments: [
          {
            commentId: "comment_1",
            author: "manager@example.com",
            content: "Revenue looks good this week",
            mentions: [],
            timestamp: new Date(Date.now() - 3600000),
            replies: 1,
            likes: 2,
          },
          {
            commentId: "comment_2",
            author: "analyst@example.com",
            content: "@manager We should check the Q2 projections",
            mentions: ["manager@example.com"],
            timestamp: new Date(Date.now() - 1800000),
            replies: 0,
            likes: 1,
          },
        ],
        totalComments: 2,
      };
    }),

  // Reply to comment
  replyToComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        content: z.string(),
        mentions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        replyId: `reply_${Date.now()}`,
        commentId: input.commentId,
        author: ctx.user.email,
        content: input.content,
        created: true,
      };
    }),

  // Get comment thread
  getCommentThread: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .query(async ({ input }) => {
      return {
        commentId: input.commentId,
        thread: {
          originalComment: {
            commentId: input.commentId,
            author: "manager@example.com",
            content: "Revenue looks good",
            timestamp: new Date(Date.now() - 7200000),
          },
          replies: [
            {
              replyId: "reply_1",
              author: "analyst@example.com",
              content: "Agreed, best month so far",
              timestamp: new Date(Date.now() - 3600000),
            },
          ],
          totalReplies: 1,
        },
      };
    }),

  // Like comment
  likeComment: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return {
        commentId: input.commentId,
        userId: ctx.user.id,
        liked: true,
      };
    }),

  // Create task from comment
  createTaskFromComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        title: z.string(),
        assignee: z.string().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        taskId: `task_${Date.now()}`,
        commentId: input.commentId,
        title: input.title,
        assignee: input.assignee,
        created: true,
      };
    }),

  // Create task
  createTask: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        assignee: z.string(),
        dueDate: z.date(),
        priority: z.enum(["low", "medium", "high", "urgent"]),
      })
    )
    .mutation(async ({ input }) => {
      return {
        taskId: `task_${Date.now()}`,
        dashboardId: input.dashboardId,
        title: input.title,
        assignee: input.assignee,
        dueDate: input.dueDate,
        priority: input.priority,
        status: "open",
        created: true,
      };
    }),

  // Get dashboard tasks
  getDashboardTasks: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .query(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        tasks: [
          {
            taskId: "task_1",
            title: "Review Q2 campaign performance",
            assignee: "analyst@example.com",
            dueDate: new Date(Date.now() + 86400000),
            priority: "high",
            status: "open",
          },
          {
            taskId: "task_2",
            title: "Update member segments",
            assignee: "manager@example.com",
            dueDate: new Date(Date.now() + 172800000),
            priority: "medium",
            status: "open",
          },
        ],
        totalTasks: 2,
      };
    }),

  // Update task
  updateTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        updates: z.object({
          title: z.string().optional(),
          status: z.enum(["open", "in_progress", "completed"]).optional(),
          assignee: z.string().optional(),
          dueDate: z.date().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return {
        taskId: input.taskId,
        updated: true,
      };
    }),

  // Complete task
  completeTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      return {
        taskId: input.taskId,
        status: "completed",
        completedAt: new Date(),
      };
    }),

  // Get user tasks
  getUserTasks: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      tasks: [
        {
          taskId: "task_1",
          title: "Review Q2 campaign performance",
          dashboardId: "dash_1",
          dueDate: new Date(Date.now() + 86400000),
          priority: "high",
          status: "open",
        },
      ],
      totalTasks: 1,
      overdueTasks: 0,
    };
  }),

  // Mention user
  mentionUser: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        userId: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        mentionId: `mention_${Date.now()}`,
        dashboardId: input.dashboardId,
        mentionedUser: input.userId,
        mentionedBy: ctx.user.email,
        message: input.message,
        created: true,
      };
    }),

  // Get mentions
  getMentions: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      mentions: [
        {
          mentionId: "mention_1",
          mentionedBy: "manager@example.com",
          message: "Can you check this metric?",
          dashboardId: "dash_1",
          timestamp: new Date(Date.now() - 3600000),
          read: false,
        },
      ],
      totalMentions: 1,
      unreadMentions: 1,
    };
  }),

  // Mark mention as read
  markMentionAsRead: protectedProcedure
    .input(z.object({ mentionId: z.string() }))
    .mutation(async ({ input }) => {
      return {
        mentionId: input.mentionId,
        marked: true,
      };
    }),

  // Create activity log entry
  logActivity: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        action: z.string(),
        details: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        logId: `log_${Date.now()}`,
        dashboardId: input.dashboardId,
        userId: ctx.user.id,
        action: input.action,
        details: input.details,
        timestamp: new Date(),
      };
    }),

  // Get activity log
  getActivityLog: protectedProcedure
    .input(z.object({ dashboardId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        activities: [
          {
            logId: "log_1",
            userId: "user_1",
            action: "updated_widget",
            timestamp: new Date(Date.now() - 3600000),
            details: { widgetId: "widget_1" },
          },
          {
            logId: "log_2",
            userId: "user_2",
            action: "added_comment",
            timestamp: new Date(Date.now() - 1800000),
            details: { commentId: "comment_1" },
          },
        ],
        totalActivities: 2,
      };
    }),

  // Share dashboard with team
  shareDashboardWithTeam: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        teamId: z.string(),
        permissions: z.enum(["view", "edit", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        teamId: input.teamId,
        permissions: input.permissions,
        shared: true,
      };
    }),

  // Get dashboard collaborators
  getDashboardCollaborators: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .query(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        collaborators: [
          {
            userId: "user_1",
            email: "manager@example.com",
            role: "admin",
            joinedAt: new Date(Date.now() - 2592000000),
          },
          {
            userId: "user_2",
            email: "analyst@example.com",
            role: "editor",
            joinedAt: new Date(Date.now() - 1296000000),
          },
        ],
        totalCollaborators: 2,
      };
    }),

  // Remove collaborator
  removeCollaborator: protectedProcedure
    .input(z.object({ dashboardId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        userId: input.userId,
        removed: true,
      };
    }),

  // Update collaborator permissions
  updateCollaboratorPermissions: protectedProcedure
    .input(
      z.object({
        dashboardId: z.string(),
        userId: z.string(),
        permissions: z.enum(["view", "edit", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      return {
        dashboardId: input.dashboardId,
        userId: input.userId,
        permissions: input.permissions,
        updated: true,
      };
    }),
});
