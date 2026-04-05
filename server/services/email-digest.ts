import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Email digest frequency options
export const DigestFrequency = {
  DAILY: "daily",
  WEEKLY: "weekly",
  DISABLED: "disabled",
} as const;

export type DigestFrequencyType = (typeof DigestFrequency)[keyof typeof DigestFrequency];

// Mock task data structure for digest
interface TaskSummary {
  id: string;
  title: string;
  type: "article" | "signature" | "approval" | "deadline";
  dueDate: Date | null;
  priority: "high" | "medium" | "low";
  status: "pending" | "overdue" | "due_soon";
}

interface DigestContent {
  userId: string;
  userName: string;
  email: string;
  generatedAt: Date;
  period: string;
  summary: {
    totalPending: number;
    overdue: number;
    dueSoon: number;
    completed: number;
  };
  tasks: {
    overdue: TaskSummary[];
    dueSoon: TaskSummary[];
    upcoming: TaskSummary[];
  };
  highlights: string[];
}

// Generate digest content for a user
function generateDigestContent(
  userId: string,
  userName: string,
  email: string,
  frequency: DigestFrequencyType
): DigestContent {
  const now = new Date();
  const period = frequency === "daily" 
    ? `Daily Digest - ${now.toLocaleDateString()}`
    : `Weekly Digest - Week of ${now.toLocaleDateString()}`;

  // Mock task data - in production, fetch from database
  const mockOverdueTasks: TaskSummary[] = [
    {
      id: "task-1",
      title: "Review Q4 Financial Report",
      type: "article",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      priority: "high",
      status: "overdue",
    },
    {
      id: "task-2",
      title: "Sign Employment Agreement",
      type: "signature",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      priority: "high",
      status: "overdue",
    },
  ];

  const mockDueSoonTasks: TaskSummary[] = [
    {
      id: "task-3",
      title: "Approve Budget Amendment",
      type: "approval",
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
      priority: "high",
      status: "due_soon",
    },
    {
      id: "task-4",
      title: "Complete Compliance Training",
      type: "article",
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      priority: "medium",
      status: "due_soon",
    },
  ];

  const mockUpcomingTasks: TaskSummary[] = [
    {
      id: "task-5",
      title: "Review Grant Proposal",
      type: "approval",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: "medium",
      status: "pending",
    },
    {
      id: "task-6",
      title: "Sign Vendor Contract",
      type: "signature",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: "low",
      status: "pending",
    },
  ];

  const highlights: string[] = [];
  if (mockOverdueTasks.length > 0) {
    highlights.push(`⚠️ You have ${mockOverdueTasks.length} overdue task(s) requiring immediate attention`);
  }
  if (mockDueSoonTasks.length > 0) {
    highlights.push(`⏰ ${mockDueSoonTasks.length} task(s) are due within the next 24 hours`);
  }
  highlights.push(`📊 Total pending items: ${mockOverdueTasks.length + mockDueSoonTasks.length + mockUpcomingTasks.length}`);

  return {
    userId,
    userName,
    email,
    generatedAt: now,
    period,
    summary: {
      totalPending: mockOverdueTasks.length + mockDueSoonTasks.length + mockUpcomingTasks.length,
      overdue: mockOverdueTasks.length,
      dueSoon: mockDueSoonTasks.length,
      completed: 12, // Mock completed count
    },
    tasks: {
      overdue: mockOverdueTasks,
      dueSoon: mockDueSoonTasks,
      upcoming: mockUpcomingTasks,
    },
    highlights,
  };
}

// Format digest as HTML email
function formatDigestAsHtml(digest: DigestContent): string {
  const taskRow = (task: TaskSummary) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        <strong>${task.title}</strong>
        <br><small style="color: #666;">${task.type.charAt(0).toUpperCase() + task.type.slice(1)}</small>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
        <span style="background: ${task.priority === 'high' ? '#fee2e2' : task.priority === 'medium' ? '#fef3c7' : '#d1fae5'}; 
                     color: ${task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669'};
                     padding: 2px 8px; border-radius: 4px; font-size: 12px;">
          ${task.priority.toUpperCase()}
        </span>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        ${task.dueDate ? task.dueDate.toLocaleDateString() : 'No due date'}
      </td>
    </tr>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${digest.period}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">📋 ${digest.period}</h1>
        <p style="margin: 8px 0 0 0; opacity: 0.9;">Hello ${digest.userName}, here's your task summary</p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <!-- Summary Cards -->
        <div style="display: flex; gap: 12px; margin-bottom: 20px;">
          <div style="flex: 1; background: white; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #166534;">${digest.summary.totalPending}</div>
            <div style="font-size: 12px; color: #6b7280;">Pending</div>
          </div>
          <div style="flex: 1; background: white; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #dc2626;">${digest.summary.overdue}</div>
            <div style="font-size: 12px; color: #6b7280;">Overdue</div>
          </div>
          <div style="flex: 1; background: white; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #d97706;">${digest.summary.dueSoon}</div>
            <div style="font-size: 12px; color: #6b7280;">Due Soon</div>
          </div>
          <div style="flex: 1; background: white; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: bold; color: #059669;">${digest.summary.completed}</div>
            <div style="font-size: 12px; color: #6b7280;">Completed</div>
          </div>
        </div>

        <!-- Highlights -->
        <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #92400e;">📌 Highlights</h3>
          ${digest.highlights.map(h => `<p style="margin: 4px 0; font-size: 14px; color: #78350f;">${h}</p>`).join('')}
        </div>

        <!-- Overdue Tasks -->
        ${digest.tasks.overdue.length > 0 ? `
          <div style="background: white; border-radius: 8px; margin-bottom: 16px; border: 1px solid #fecaca;">
            <h3 style="margin: 0; padding: 12px 16px; background: #fef2f2; border-radius: 8px 8px 0 0; color: #dc2626; font-size: 14px;">
              🚨 Overdue Tasks (${digest.tasks.overdue.length})
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${digest.tasks.overdue.map(taskRow).join('')}
            </table>
          </div>
        ` : ''}

        <!-- Due Soon Tasks -->
        ${digest.tasks.dueSoon.length > 0 ? `
          <div style="background: white; border-radius: 8px; margin-bottom: 16px; border: 1px solid #fcd34d;">
            <h3 style="margin: 0; padding: 12px 16px; background: #fffbeb; border-radius: 8px 8px 0 0; color: #d97706; font-size: 14px;">
              ⏰ Due Soon (${digest.tasks.dueSoon.length})
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${digest.tasks.dueSoon.map(taskRow).join('')}
            </table>
          </div>
        ` : ''}

        <!-- Upcoming Tasks -->
        ${digest.tasks.upcoming.length > 0 ? `
          <div style="background: white; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
            <h3 style="margin: 0; padding: 12px 16px; background: #f9fafb; border-radius: 8px 8px 0 0; color: #374151; font-size: 14px;">
              📅 Upcoming (${digest.tasks.upcoming.length})
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${digest.tasks.upcoming.map(taskRow).join('')}
            </table>
          </div>
        ` : ''}

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 24px;">
          <a href="#" style="display: inline-block; background: #166534; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View All Tasks →
          </a>
        </div>
      </div>

      <div style="background: #f3f4f6; padding: 16px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          Generated on ${digest.generatedAt.toLocaleString()} | 
          <a href="#" style="color: #166534;">Manage Preferences</a> | 
          <a href="#" style="color: #166534;">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

// Format digest as plain text
function formatDigestAsText(digest: DigestContent): string {
  const taskLine = (task: TaskSummary) => 
    `  • ${task.title} [${task.priority.toUpperCase()}] - Due: ${task.dueDate ? task.dueDate.toLocaleDateString() : 'No date'}`;

  let text = `
${digest.period}
${'='.repeat(50)}

Hello ${digest.userName},

SUMMARY
-------
• Pending Tasks: ${digest.summary.totalPending}
• Overdue: ${digest.summary.overdue}
• Due Soon: ${digest.summary.dueSoon}
• Completed This Period: ${digest.summary.completed}

HIGHLIGHTS
----------
${digest.highlights.join('\n')}
`;

  if (digest.tasks.overdue.length > 0) {
    text += `
🚨 OVERDUE TASKS (${digest.tasks.overdue.length})
${'-'.repeat(30)}
${digest.tasks.overdue.map(taskLine).join('\n')}
`;
  }

  if (digest.tasks.dueSoon.length > 0) {
    text += `
⏰ DUE SOON (${digest.tasks.dueSoon.length})
${'-'.repeat(30)}
${digest.tasks.dueSoon.map(taskLine).join('\n')}
`;
  }

  if (digest.tasks.upcoming.length > 0) {
    text += `
📅 UPCOMING (${digest.tasks.upcoming.length})
${'-'.repeat(30)}
${digest.tasks.upcoming.map(taskLine).join('\n')}
`;
  }

  text += `
${'='.repeat(50)}
Generated: ${digest.generatedAt.toLocaleString()}
To manage your digest preferences, visit your User Preferences page.
`;

  return text;
}

export const emailDigestRouter = router({
  // Get user's digest preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    // In production, fetch from database
    return {
      userId: ctx.user.id,
      frequency: "daily" as DigestFrequencyType,
      emailEnabled: true,
      includeOverdue: true,
      includeDueSoon: true,
      includeUpcoming: true,
      sendTime: "08:00",
      timezone: "America/New_York",
    };
  }),

  // Update digest preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      frequency: z.enum(["daily", "weekly", "disabled"]),
      emailEnabled: z.boolean(),
      includeOverdue: z.boolean(),
      includeDueSoon: z.boolean(),
      includeUpcoming: z.boolean(),
      sendTime: z.string(),
      timezone: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In production, save to database
      return {
        success: true,
        message: "Digest preferences updated successfully",
        preferences: {
          userId: ctx.user.id,
          ...input,
        },
      };
    }),

  // Preview digest (for testing)
  previewDigest: protectedProcedure
    .input(z.object({
      frequency: z.enum(["daily", "weekly"]),
      format: z.enum(["html", "text"]).default("html"),
    }))
    .query(async ({ ctx, input }) => {
      const digest = generateDigestContent(
        ctx.user.id.toString(),
        ctx.user.name || "User",
        ctx.user.email || "user@example.com",
        input.frequency
      );

      return {
        digest,
        formatted: input.format === "html" 
          ? formatDigestAsHtml(digest)
          : formatDigestAsText(digest),
      };
    }),

  // Send test digest email
  sendTestDigest: protectedProcedure
    .input(z.object({
      frequency: z.enum(["daily", "weekly"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const digest = generateDigestContent(
        ctx.user.id.toString(),
        ctx.user.name || "User",
        ctx.user.email || "user@example.com",
        input.frequency
      );

      // In production, send via email service
      console.log(`[Email Digest] Would send ${input.frequency} digest to ${ctx.user.email}`);

      return {
        success: true,
        message: `Test ${input.frequency} digest sent to ${ctx.user.email}`,
        preview: formatDigestAsText(digest),
      };
    }),

  // Trigger digest generation for all users (admin only)
  triggerBulkDigest: protectedProcedure
    .input(z.object({
      frequency: z.enum(["daily", "weekly"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // In production, queue digest generation for all subscribed users
      return {
        success: true,
        message: `Bulk ${input.frequency} digest generation triggered`,
        queuedCount: 25, // Mock count
      };
    }),
});

export default emailDigestRouter;
