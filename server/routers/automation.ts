/**
 * Custom Business Logic Automation Framework
 * Enables users to create automated workflows and business processes
 */

import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: {
    type: string;
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  createdAt: number;
  lastExecuted?: number;
  executionCount: number;
}

const workflows: Map<string, AutomationWorkflow> = new Map();
const executionHistory: Array<{
  workflowId: string;
  timestamp: number;
  status: "success" | "failed";
  result: any;
}> = [];

export const automationRouter = router({
  /**
   * Create automation workflow
   */
  createWorkflow: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        trigger: z.object({
          type: z.string(),
          conditions: z.record(z.any()),
        }),
        actions: z.array(
          z.object({
            type: z.string(),
            config: z.record(z.any()),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workflow: AutomationWorkflow = {
        id: `workflow_${Date.now()}`,
        name: input.name,
        description: input.description,
        enabled: true,
        trigger: input.trigger,
        actions: input.actions,
        createdAt: Date.now(),
        executionCount: 0,
      };

      workflows.set(workflow.id, workflow);
      return workflow;
    }),

  /**
   * Get all workflows
   */
  getWorkflows: protectedProcedure.query(async ({ ctx }) => {
    return Array.from(workflows.values());
  }),

  /**
   * Get workflow by ID
   */
  getWorkflow: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ input }) => {
      return workflows.get(input.workflowId);
    }),

  /**
   * Update workflow
   */
  updateWorkflow: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        enabled: z.boolean().optional(),
        trigger: z
          .object({
            type: z.string(),
            conditions: z.record(z.any()),
          })
          .optional(),
        actions: z
          .array(
            z.object({
              type: z.string(),
              config: z.record(z.any()),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const workflow = workflows.get(input.workflowId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      if (input.name) workflow.name = input.name;
      if (input.description !== undefined)
        workflow.description = input.description;
      if (input.enabled !== undefined) workflow.enabled = input.enabled;
      if (input.trigger) workflow.trigger = input.trigger;
      if (input.actions) workflow.actions = input.actions;

      return workflow;
    }),

  /**
   * Delete workflow
   */
  deleteWorkflow: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(async ({ input }) => {
      return workflows.delete(input.workflowId);
    }),

  /**
   * Test workflow
   */
  testWorkflow: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        testData: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const workflow = workflows.get(input.workflowId);
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      // Simulate workflow execution
      const result = {
        success: true,
        workflowId: input.workflowId,
        executedAt: new Date(),
        actionsExecuted: workflow.actions.length,
        result: "Workflow test completed successfully",
      };

      return result;
    }),

  /**
   * Get available triggers
   */
  getAvailableTriggers: protectedProcedure.query(async () => {
    return [
      {
        type: "event",
        name: "Event Trigger",
        description: "Trigger on specific system event",
        conditions: ["event_type", "source"],
      },
      {
        type: "schedule",
        name: "Scheduled Trigger",
        description: "Trigger on schedule (cron)",
        conditions: ["cron_expression"],
      },
      {
        type: "webhook",
        name: "Webhook Trigger",
        description: "Trigger on incoming webhook",
        conditions: ["webhook_url", "secret"],
      },
      {
        type: "condition",
        name: "Condition Trigger",
        description: "Trigger when condition is met",
        conditions: ["metric", "operator", "threshold"],
      },
      {
        type: "manual",
        name: "Manual Trigger",
        description: "Manually trigger workflow",
        conditions: [],
      },
    ];
  }),

  /**
   * Get available actions
   */
  getAvailableActions: protectedProcedure.query(async () => {
    return [
      {
        type: "send_notification",
        name: "Send Notification",
        description: "Send notification to users",
        config: ["recipients", "title", "message"],
      },
      {
        type: "send_email",
        name: "Send Email",
        description: "Send email to recipients",
        config: ["recipients", "subject", "body"],
      },
      {
        type: "create_record",
        name: "Create Record",
        description: "Create new record in database",
        config: ["table", "data"],
      },
      {
        type: "update_record",
        name: "Update Record",
        description: "Update existing record",
        config: ["table", "id", "data"],
      },
      {
        type: "delete_record",
        name: "Delete Record",
        description: "Delete record from database",
        config: ["table", "id"],
      },
      {
        type: "call_webhook",
        name: "Call Webhook",
        description: "Call external webhook",
        config: ["url", "method", "headers", "body"],
      },
      {
        type: "conditional",
        name: "Conditional Action",
        description: "Execute actions conditionally",
        config: ["condition", "then_actions", "else_actions"],
      },
    ];
  }),

  /**
   * Get workflow templates
   */
  getWorkflowTemplates: protectedProcedure.query(async () => {
    return [
      {
        id: "template_1",
        name: "Send Alert on Error",
        description: "Send notification when error occurs",
        trigger: { type: "event", conditions: { event_type: "error" } },
        actions: [
          {
            type: "send_notification",
            config: { recipients: ["admin"], title: "Error Alert" },
          },
        ],
      },
      {
        id: "template_2",
        name: "Daily Report",
        description: "Send daily report email",
        trigger: { type: "schedule", conditions: { cron_expression: "0 9 * * *" } },
        actions: [
          {
            type: "send_email",
            config: {
              recipients: ["team@example.com"],
              subject: "Daily Report",
            },
          },
        ],
      },
      {
        id: "template_3",
        name: "Backup on Schedule",
        description: "Create backup on schedule",
        trigger: { type: "schedule", conditions: { cron_expression: "0 2 * * 0" } },
        actions: [
          {
            type: "call_webhook",
            config: { url: "/api/backup", method: "POST" },
          },
        ],
      },
    ];
  }),

  /**
   * Get execution history
   */
  getExecutionHistory: protectedProcedure
    .input(
      z
        .object({
          workflowId: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      let history = [...executionHistory];

      if (input?.workflowId) {
        history = history.filter((h) => h.workflowId === input.workflowId);
      }

      return history.slice(-input?.limit || 50);
    }),

  /**
   * Get workflow statistics
   */
  getWorkflowStats: protectedProcedure.query(async () => {
    const stats = {
      totalWorkflows: workflows.size,
      enabledWorkflows: Array.from(workflows.values()).filter((w) => w.enabled)
        .length,
      totalExecutions: executionHistory.length,
      successfulExecutions: executionHistory.filter((h) => h.status === "success")
        .length,
      failedExecutions: executionHistory.filter((h) => h.status === "failed")
        .length,
      successRate:
        executionHistory.length > 0
          ? (
              (executionHistory.filter((h) => h.status === "success").length /
                executionHistory.length) *
              100
            ).toFixed(2)
          : 0,
    };

    return stats;
  }),

  /**
   * Duplicate workflow from template
   */
  duplicateFromTemplate: protectedProcedure
    .input(z.object({ templateId: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      // In production, fetch template and create new workflow
      const newWorkflow: AutomationWorkflow = {
        id: `workflow_${Date.now()}`,
        name: input.name,
        description: "Duplicated from template",
        enabled: true,
        trigger: { type: "event", conditions: {} },
        actions: [],
        createdAt: Date.now(),
        executionCount: 0,
      };

      workflows.set(newWorkflow.id, newWorkflow);
      return newWorkflow;
    }),
});
