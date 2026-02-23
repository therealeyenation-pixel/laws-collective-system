import { getDb } from "../db";
import { notifications, users, systemJobExecutions, systemJobConfigurations } from "../../drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";
import { processExpirationNotifications } from "./signatureExpirationNotifier";
import { 
  runDailySummaryReport, 
  runWeeklyComplianceAudit, 
  runMonthlyDataCleanup,
  JobExecutionResult 
} from "./additionalJobs";

/**
 * System Scheduled Jobs Service
 * 
 * Handles automated background tasks that run on a schedule.
 * Jobs can be triggered manually via API or by external cron/scheduler.
 * Job execution history is persisted to the database for audit trails.
 */

export interface JobResult {
  jobName: string;
  success: boolean;
  startedAt: string;
  completedAt: string;
  duration: number;
  details: Record<string, any>;
  errors: string[];
  executionId?: number;
}

export interface JobLog {
  id: number;
  jobName: string;
  status: "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  result?: Record<string, any>;
  error?: string;
  triggeredBy: "scheduled" | "manual" | "api";
}

// In-memory tracking for currently running jobs
const runningJobs = new Map<string, { startedAt: Date; executionId?: number }>();

/**
 * Create a job execution record in the database
 */
async function createJobExecution(
  jobName: string,
  jobType: "signature_expiration_notifications" | "daily_summary_report" | "weekly_compliance_audit" | "monthly_data_cleanup" | "custom",
  triggeredBy: "scheduled" | "manual" | "api" = "manual",
  triggeredByUserId?: number
): Promise<number> {
  const db = await getDb();
  
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(systemJobExecutions).values({
    jobName,
    jobType,
    startedAt: new Date(),
    status: "running",
    triggeredBy,
    triggeredByUserId,
  });
  
  return Number(result[0].insertId);
}

/**
 * Update job execution record with completion status
 */
async function updateJobExecution(
  executionId: number,
  status: "completed" | "failed",
  result?: Record<string, any>,
  errorMessage?: string,
  errorStack?: string,
  metrics?: { processed: number; succeeded: number; failed: number }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const completedAt = new Date();
  
  // Get the start time to calculate duration
  const [execution] = await db
    .select({ startedAt: systemJobExecutions.startedAt })
    .from(systemJobExecutions)
    .where(eq(systemJobExecutions.id, executionId));
  
  const durationMs = execution 
    ? completedAt.getTime() - new Date(execution.startedAt).getTime()
    : 0;
  
  await db
    .update(systemJobExecutions)
    .set({
      status,
      completedAt,
      durationMs,
      result: result || null,
      errorMessage: errorMessage || null,
      errorStack: errorStack || null,
      itemsProcessed: metrics?.processed || 0,
      itemsSucceeded: metrics?.succeeded || 0,
      itemsFailed: metrics?.failed || 0,
    })
    .where(eq(systemJobExecutions.id, executionId));
}

/**
 * Check if a job is currently running
 */
export function isJobRunning(jobName: string): boolean {
  return runningJobs.has(jobName);
}

/**
 * Get job execution history from database
 */
export async function getJobHistory(jobName?: string, limit: number = 20): Promise<JobLog[]> {
  const db = await getDb();
  
  if (!db) throw new Error("Database not available");
  
  let query = db
    .select({
      id: systemJobExecutions.id,
      jobName: systemJobExecutions.jobName,
      status: systemJobExecutions.status,
      startedAt: systemJobExecutions.startedAt,
      completedAt: systemJobExecutions.completedAt,
      durationMs: systemJobExecutions.durationMs,
      result: systemJobExecutions.result,
      errorMessage: systemJobExecutions.errorMessage,
      triggeredBy: systemJobExecutions.triggeredBy,
    })
    .from(systemJobExecutions)
    .orderBy(desc(systemJobExecutions.startedAt))
    .limit(limit);
  
  if (jobName) {
    query = query.where(eq(systemJobExecutions.jobName, jobName)) as typeof query;
  }
  
  const results = await query;
  
  return results.map(r => ({
    id: r.id,
    jobName: r.jobName,
    status: r.status as "running" | "completed" | "failed",
    startedAt: new Date(r.startedAt),
    completedAt: r.completedAt ? new Date(r.completedAt) : undefined,
    durationMs: r.durationMs || undefined,
    result: r.result as Record<string, any> | undefined,
    error: r.errorMessage || undefined,
    triggeredBy: r.triggeredBy as "scheduled" | "manual" | "api",
  }));
}

/**
 * Run the signature expiration notification job
 */
export async function runSignatureExpirationJob(
  triggeredBy: "scheduled" | "manual" | "api" = "manual",
  triggeredByUserId?: number
): Promise<JobResult> {
  const jobName = "signature_expiration_notifications";
  const startedAt = new Date();
  const errors: string[] = [];
  
  // Check if already running
  if (isJobRunning(jobName)) {
    return {
      jobName,
      success: false,
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      duration: 0,
      details: {},
      errors: ["Job is already running"],
    };
  }
  
  // Create execution record
  const executionId = await createJobExecution(
    jobName,
    "signature_expiration_notifications",
    triggeredBy,
    triggeredByUserId
  );
  
  runningJobs.set(jobName, { startedAt, executionId });
  
  try {
    // Process expiration notifications
    const result = await processExpirationNotifications();
    
    const completedAt = new Date();
    const duration = completedAt.getTime() - startedAt.getTime();
    
    // Update execution record
    await updateJobExecution(
      executionId,
      result.errors.length > 0 ? "completed" : "completed",
      {
        processed: result.processed,
        notificationsSent: result.notificationsSent,
        errorCount: result.errors.length,
      },
      result.errors.length > 0 ? result.errors.join("; ") : undefined,
      undefined,
      {
        processed: result.processed,
        succeeded: result.notificationsSent,
        failed: result.errors.length,
      }
    );
    
    // Notify admin if there were errors
    if (result.errors.length > 0) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const admins = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, "admin"));
      
      for (const admin of admins) {
        await db.insert(notifications).values({
          userId: admin.id,
          type: "alert",
          title: "⚠️ Signature Notification Job Errors",
          message: `The signature expiration notification job completed with ${result.errors.length} errors. Please review the job logs.`,
          referenceType: "system_job",
          actionUrl: "/admin/system-jobs",
          isPriority: true,
          metadata: {
            jobName,
            executionId,
            errorCount: result.errors.length,
            processedCount: result.processed,
            sentCount: result.notificationsSent,
          },
        });
      }
    }
    
    return {
      jobName,
      success: true,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      duration,
      details: {
        processed: result.processed,
        notificationsSent: result.notificationsSent,
        errorCount: result.errors.length,
      },
      errors: result.errors,
      executionId,
    };
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    errors.push(errorMessage);
    
    // Update execution record
    await updateJobExecution(
      executionId,
      "failed",
      undefined,
      errorMessage,
      errorStack,
      { processed: 0, succeeded: 0, failed: 1 }
    );
    
    return {
      jobName,
      success: false,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      duration: completedAt.getTime() - startedAt.getTime(),
      details: {},
      errors,
      executionId,
    };
  } finally {
    runningJobs.delete(jobName);
  }
}

/**
 * Run the daily summary report job
 */
export async function runDailySummaryReportJob(
  triggeredBy: "scheduled" | "manual" | "api" = "manual",
  triggeredByUserId?: number
): Promise<JobResult> {
  const jobName = "daily_summary_report";
  const startedAt = new Date();
  
  if (isJobRunning(jobName)) {
    return {
      jobName,
      success: false,
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      duration: 0,
      details: {},
      errors: ["Job is already running"],
    };
  }
  
  const executionId = await createJobExecution(
    jobName,
    "daily_summary_report",
    triggeredBy,
    triggeredByUserId
  );
  
  runningJobs.set(jobName, { startedAt, executionId });
  
  try {
    const result = await runDailySummaryReport();
    const completedAt = new Date();
    const duration = completedAt.getTime() - startedAt.getTime();
    
    await updateJobExecution(
      executionId,
      result.errors.length > 0 ? "completed" : "completed",
      result.details,
      result.errors.length > 0 ? result.errors.join("; ") : undefined,
      undefined,
      {
        processed: result.processed,
        succeeded: result.succeeded,
        failed: result.failed,
      }
    );
    
    return {
      jobName,
      success: result.failed === 0,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      duration,
      details: result.details,
      errors: result.errors,
      executionId,
    };
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await updateJobExecution(
      executionId,
      "failed",
      undefined,
      errorMessage,
      error instanceof Error ? error.stack : undefined,
      { processed: 0, succeeded: 0, failed: 1 }
    );
    
    return {
      jobName,
      success: false,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      duration: completedAt.getTime() - startedAt.getTime(),
      details: {},
      errors: [errorMessage],
      executionId,
    };
  } finally {
    runningJobs.delete(jobName);
  }
}

/**
 * Run the weekly compliance audit job
 */
export async function runWeeklyComplianceAuditJob(
  triggeredBy: "scheduled" | "manual" | "api" = "manual",
  triggeredByUserId?: number
): Promise<JobResult> {
  const jobName = "weekly_compliance_audit";
  const startedAt = new Date();
  
  if (isJobRunning(jobName)) {
    return {
      jobName,
      success: false,
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      duration: 0,
      details: {},
      errors: ["Job is already running"],
    };
  }
  
  const executionId = await createJobExecution(
    jobName,
    "weekly_compliance_audit",
    triggeredBy,
    triggeredByUserId
  );
  
  runningJobs.set(jobName, { startedAt, executionId });
  
  try {
    const result = await runWeeklyComplianceAudit();
    const completedAt = new Date();
    const duration = completedAt.getTime() - startedAt.getTime();
    
    await updateJobExecution(
      executionId,
      result.errors.length > 0 ? "completed" : "completed",
      result.details,
      result.errors.length > 0 ? result.errors.join("; ") : undefined,
      undefined,
      {
        processed: result.processed,
        succeeded: result.succeeded,
        failed: result.failed,
      }
    );
    
    return {
      jobName,
      success: result.failed === 0,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      duration,
      details: result.details,
      errors: result.errors,
      executionId,
    };
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await updateJobExecution(
      executionId,
      "failed",
      undefined,
      errorMessage,
      error instanceof Error ? error.stack : undefined,
      { processed: 0, succeeded: 0, failed: 1 }
    );
    
    return {
      jobName,
      success: false,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      duration: completedAt.getTime() - startedAt.getTime(),
      details: {},
      errors: [errorMessage],
      executionId,
    };
  } finally {
    runningJobs.delete(jobName);
  }
}

/**
 * Run the monthly data cleanup job
 */
export async function runMonthlyDataCleanupJob(
  triggeredBy: "scheduled" | "manual" | "api" = "manual",
  triggeredByUserId?: number
): Promise<JobResult> {
  const jobName = "monthly_data_cleanup";
  const startedAt = new Date();
  
  if (isJobRunning(jobName)) {
    return {
      jobName,
      success: false,
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      duration: 0,
      details: {},
      errors: ["Job is already running"],
    };
  }
  
  const executionId = await createJobExecution(
    jobName,
    "monthly_data_cleanup",
    triggeredBy,
    triggeredByUserId
  );
  
  runningJobs.set(jobName, { startedAt, executionId });
  
  try {
    const result = await runMonthlyDataCleanup();
    const completedAt = new Date();
    const duration = completedAt.getTime() - startedAt.getTime();
    
    await updateJobExecution(
      executionId,
      result.errors.length > 0 ? "completed" : "completed",
      result.details,
      result.errors.length > 0 ? result.errors.join("; ") : undefined,
      undefined,
      {
        processed: result.processed,
        succeeded: result.succeeded,
        failed: result.failed,
      }
    );
    
    return {
      jobName,
      success: result.failed === 0,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      duration,
      details: result.details,
      errors: result.errors,
      executionId,
    };
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await updateJobExecution(
      executionId,
      "failed",
      undefined,
      errorMessage,
      error instanceof Error ? error.stack : undefined,
      { processed: 0, succeeded: 0, failed: 1 }
    );
    
    return {
      jobName,
      success: false,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      duration: completedAt.getTime() - startedAt.getTime(),
      details: {},
      errors: [errorMessage],
      executionId,
    };
  } finally {
    runningJobs.delete(jobName);
  }
}

/**
 * Get all available scheduled jobs
 */
export function getAvailableJobs(): {
  name: string;
  description: string;
  recommendedSchedule: string;
  isRunning: boolean;
}[] {
  return [
    {
      name: "signature_expiration_notifications",
      description: "Process and send notifications for signatures expiring within 30 days",
      recommendedSchedule: "0 8 * * *", // Daily at 8 AM
      isRunning: isJobRunning("signature_expiration_notifications"),
    },
    {
      name: "daily_summary_report",
      description: "Generate daily summary of system activity (new users, signatures, time entries)",
      recommendedSchedule: "0 7 * * *", // Daily at 7 AM
      isRunning: isJobRunning("daily_summary_report"),
    },
    {
      name: "weekly_compliance_audit",
      description: "Check compliance status across the system (expired signatures, pending timesheets)",
      recommendedSchedule: "0 6 * * 1", // Every Monday at 6 AM
      isRunning: isJobRunning("weekly_compliance_audit"),
    },
    {
      name: "monthly_data_cleanup",
      description: "Archive old notifications and clean up temporary data",
      recommendedSchedule: "0 3 1 * *", // 1st of each month at 3 AM
      isRunning: isJobRunning("monthly_data_cleanup"),
    },
  ];
}

/**
 * Run a job by name
 */
export async function runJob(
  jobName: string,
  triggeredBy: "scheduled" | "manual" | "api" = "manual",
  triggeredByUserId?: number
): Promise<JobResult> {
  switch (jobName) {
    case "signature_expiration_notifications":
      return runSignatureExpirationJob(triggeredBy, triggeredByUserId);
    case "daily_summary_report":
      return runDailySummaryReportJob(triggeredBy, triggeredByUserId);
    case "weekly_compliance_audit":
      return runWeeklyComplianceAuditJob(triggeredBy, triggeredByUserId);
    case "monthly_data_cleanup":
      return runMonthlyDataCleanupJob(triggeredBy, triggeredByUserId);
    default:
      return {
        jobName,
        success: false,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        duration: 0,
        details: {},
        errors: [`Unknown job: ${jobName}`],
      };
  }
}

/**
 * Get job execution statistics
 */
export async function getJobStats(): Promise<{
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDurationMs: number;
  lastExecutionTime?: Date;
}> {
  const db = await getDb();
  
  if (!db) throw new Error("Database not available");
  
  const [stats] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      successful: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
      failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
      avgDuration: sql<number>`AVG(duration_ms)`,
    })
    .from(systemJobExecutions);
  
  const [lastExecution] = await db
    .select({ startedAt: systemJobExecutions.startedAt })
    .from(systemJobExecutions)
    .orderBy(desc(systemJobExecutions.startedAt))
    .limit(1);
  
  return {
    totalExecutions: stats?.total || 0,
    successfulExecutions: stats?.successful || 0,
    failedExecutions: stats?.failed || 0,
    averageDurationMs: stats?.avgDuration || 0,
    lastExecutionTime: lastExecution?.startedAt ? new Date(lastExecution.startedAt) : undefined,
  };
}
