/**
 * Workflow Automation Execution Engine
 * Handles scheduling, execution, and management of automated workflows
 */

import { EventEmitter } from "events";

interface WorkflowTrigger {
  type: "event" | "schedule" | "webhook" | "condition" | "manual";
  config: Record<string, any>;
}

interface WorkflowAction {
  type:
    | "notification"
    | "email"
    | "sms"
    | "database"
    | "webhook"
    | "conditional";
  config: Record<string, any>;
}

interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition";
  label: string;
  config: Record<string, any>;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed" | "retrying";
  startedAt: Date;
  completedAt?: Date;
  result?: Record<string, any>;
  error?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
}

interface WorkflowSchedule {
  workflowId: string;
  cronExpression: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  timezone: string;
}

class WorkflowExecutor extends EventEmitter {
  private executions: Map<string, WorkflowExecution> = new Map();
  private schedules: Map<string, WorkflowSchedule> = new Map();
  private executionHistory: WorkflowExecution[] = [];
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map();
  private maxHistorySize = 1000;
  private maxRetries = 3;
  private retryDelayMs = 5000;

  constructor() {
    super();
  }

  /**
   * Execute workflow immediately
   */
  async executeWorkflow(
    workflowId: string,
    nodes: WorkflowNode[],
    triggerData?: Record<string, any>
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      status: "running",
      startedAt: new Date(),
      retryCount: 0,
      maxRetries: this.maxRetries,
    };

    this.executions.set(execution.id, execution);

    try {
      // Execute each node in sequence
      let result: Record<string, any> = triggerData || {};

      for (const node of nodes) {
        if (node.type === "action") {
          result = await this.executeAction(node, result);
        } else if (node.type === "condition") {
          const conditionMet = await this.evaluateCondition(node, result);
          if (!conditionMet) {
            break;
          }
        }
      }

      execution.status = "completed";
      execution.completedAt = new Date();
      execution.result = result;

      this.emit("workflow_completed", execution);
    } catch (error) {
      execution.status = "failed";
      execution.error = (error as Error).message;
      execution.completedAt = new Date();

      this.emit("workflow_failed", execution);
    }

    this.recordExecution(execution);
    return execution;
  }

  /**
   * Execute action node
   */
  private async executeAction(
    node: WorkflowNode,
    context: Record<string, any>
  ): Promise<Record<string, any>> {
    switch (node.config.actionType) {
      case "notification":
        return this.executeNotificationAction(node.config, context);
      case "email":
        return this.executeEmailAction(node.config, context);
      case "sms":
        return this.executeSmsAction(node.config, context);
      case "database":
        return this.executeDatabaseAction(node.config, context);
      case "webhook":
        return this.executeWebhookAction(node.config, context);
      default:
        throw new Error(`Unknown action type: ${node.config.actionType}`);
    }
  }

  /**
   * Execute notification action
   */
  private async executeNotificationAction(
    config: Record<string, any>,
    context: Record<string, any>
  ): Promise<Record<string, any>> {
    const { userId, title, body, data } = config;

    // In production, call notification service
    console.log(`[Workflow] Sending notification to ${userId}:`, {
      title,
      body,
      data,
    });

    return {
      ...context,
      notificationSent: true,
      notificationId: `notif_${Date.now()}`,
    };
  }

  /**
   * Execute email action
   */
  private async executeEmailAction(
    config: Record<string, any>,
    context: Record<string, any>
  ): Promise<Record<string, any>> {
    const { to, subject, body } = config;

    console.log(`[Workflow] Sending email to ${to}:`, { subject, body });

    return {
      ...context,
      emailSent: true,
      emailId: `email_${Date.now()}`,
    };
  }

  /**
   * Execute SMS action
   */
  private async executeSmsAction(
    config: Record<string, any>,
    context: Record<string, any>
  ): Promise<Record<string, any>> {
    const { phoneNumber, message } = config;

    console.log(`[Workflow] Sending SMS to ${phoneNumber}:`, { message });

    return {
      ...context,
      smsSent: true,
      smsId: `sms_${Date.now()}`,
    };
  }

  /**
   * Execute database action
   */
  private async executeDatabaseAction(
    config: Record<string, any>,
    context: Record<string, any>
  ): Promise<Record<string, any>> {
    const { operation, table, data } = config;

    console.log(`[Workflow] Executing database ${operation} on ${table}:`, data);

    return {
      ...context,
      databaseOperationCompleted: true,
      operationId: `db_${Date.now()}`,
    };
  }

  /**
   * Execute webhook action
   */
  private async executeWebhookAction(
    config: Record<string, any>,
    context: Record<string, any>
  ): Promise<Record<string, any>> {
    const { url, method, headers, body } = config;

    try {
      const response = await fetch(url, {
        method: method || "POST",
        headers: headers || { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseData = await response.json();

      return {
        ...context,
        webhookCalled: true,
        webhookResponse: responseData,
        webhookStatus: response.status,
      };
    } catch (error) {
      throw new Error(`Webhook call failed: ${(error as Error).message}`);
    }
  }

  /**
   * Evaluate condition node
   */
  private async evaluateCondition(
    node: WorkflowNode,
    context: Record<string, any>
  ): Promise<boolean> {
    const { field, operator, value } = node.config;
    const contextValue = context[field];

    switch (operator) {
      case "equals":
        return contextValue === value;
      case "notEquals":
        return contextValue !== value;
      case "greaterThan":
        return contextValue > value;
      case "lessThan":
        return contextValue < value;
      case "contains":
        return String(contextValue).includes(value);
      case "exists":
        return contextValue !== undefined && contextValue !== null;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  /**
   * Schedule workflow execution
   */
  scheduleWorkflow(
    workflowId: string,
    cronExpression: string,
    timezone: string = "UTC"
  ): WorkflowSchedule {
    const schedule: WorkflowSchedule = {
      workflowId,
      cronExpression,
      enabled: true,
      timezone,
      nextRun: new Date(),
    };

    this.schedules.set(workflowId, schedule);

    // In production, use cron library for proper scheduling
    this.scheduleNextRun(workflowId, schedule);

    return schedule;
  }

  /**
   * Schedule next run
   */
  private scheduleNextRun(
    workflowId: string,
    schedule: WorkflowSchedule
  ): void {
    // Clear existing task
    const existingTask = this.scheduledTasks.get(workflowId);
    if (existingTask) {
      clearTimeout(existingTask);
    }

    if (!schedule.enabled) {
      return;
    }

    // Simple scheduling - in production use node-cron
    const delay = 60000; // 1 minute for demo
    const task = setTimeout(() => {
      if (schedule.enabled) {
        schedule.lastRun = new Date();
        this.emit("scheduled_workflow_triggered", workflowId);
        this.scheduleNextRun(workflowId, schedule);
      }
    }, delay);

    this.scheduledTasks.set(workflowId, task);
  }

  /**
   * Unschedule workflow
   */
  unscheduleWorkflow(workflowId: string): boolean {
    const schedule = this.schedules.get(workflowId);
    if (!schedule) {
      return false;
    }

    schedule.enabled = false;

    const task = this.scheduledTasks.get(workflowId);
    if (task) {
      clearTimeout(task);
      this.scheduledTasks.delete(workflowId);
    }

    return true;
  }

  /**
   * Retry failed execution
   */
  async retryExecution(executionId: string): Promise<WorkflowExecution | null> {
    const execution = this.executions.get(executionId);

    if (!execution || execution.status !== "failed") {
      return null;
    }

    if (execution.retryCount >= execution.maxRetries) {
      return null;
    }

    execution.status = "retrying";
    execution.retryCount++;
    execution.nextRetryAt = new Date(
      Date.now() + this.retryDelayMs * execution.retryCount
    );

    this.emit("execution_retrying", execution);

    // Schedule retry
    setTimeout(() => {
      execution.status = "running";
      this.emit("execution_retry_started", execution);
    }, this.retryDelayMs * execution.retryCount);

    return execution;
  }

  /**
   * Get execution status
   */
  getExecution(executionId: string): WorkflowExecution | null {
    return this.executions.get(executionId) || null;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(
    workflowId?: string,
    limit: number = 100
  ): WorkflowExecution[] {
    let history = this.executionHistory;

    if (workflowId) {
      history = history.filter((e) => e.workflowId === workflowId);
    }

    return history.slice(-limit);
  }

  /**
   * Get schedule
   */
  getSchedule(workflowId: string): WorkflowSchedule | null {
    return this.schedules.get(workflowId) || null;
  }

  /**
   * Get all schedules
   */
  getAllSchedules(): WorkflowSchedule[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Record execution in history
   */
  private recordExecution(execution: WorkflowExecution): void {
    this.executionHistory.push(execution);

    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get execution statistics
   */
  getStats(): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    retryingExecutions: number;
    successRate: number;
    activeSchedules: number;
  } {
    const allExecutions = Array.from(this.executions.values()).concat(
      this.executionHistory
    );

    const successful = allExecutions.filter(
      (e) => e.status === "completed"
    ).length;
    const failed = allExecutions.filter((e) => e.status === "failed").length;
    const retrying = allExecutions.filter(
      (e) => e.status === "retrying"
    ).length;
    const activeSchedules = Array.from(this.schedules.values()).filter(
      (s) => s.enabled
    ).length;

    return {
      totalExecutions: allExecutions.length,
      successfulExecutions: successful,
      failedExecutions: failed,
      retryingExecutions: retrying,
      successRate:
        allExecutions.length > 0
          ? ((successful / allExecutions.length) * 100).toFixed(1) as any
          : 0,
      activeSchedules,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.executions.clear();
    this.schedules.clear();
    this.executionHistory = [];

    for (const task of this.scheduledTasks.values()) {
      clearTimeout(task);
    }
    this.scheduledTasks.clear();
  }

  /**
   * Shutdown executor
   */
  shutdown(): void {
    this.clear();
    this.removeAllListeners();
  }
}

export const workflowExecutor = new WorkflowExecutor();
