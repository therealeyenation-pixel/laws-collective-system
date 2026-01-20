import { getDb } from "../db";
import { notifications, users } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { processExpirationNotifications } from "./signatureExpirationNotifier";

/**
 * System Scheduled Jobs Service
 * 
 * Handles automated background tasks that run on a schedule.
 * Jobs can be triggered manually via API or by external cron/scheduler.
 */

export interface JobResult {
  jobName: string;
  success: boolean;
  startedAt: string;
  completedAt: string;
  duration: number;
  details: Record<string, any>;
  errors: string[];
}

export interface JobLog {
  id: number;
  jobName: string;
  status: "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  result?: Record<string, any>;
  error?: string;
}

// In-memory job tracking (could be moved to database for persistence)
const runningJobs = new Map<string, { startedAt: Date }>();
const jobHistory: JobLog[] = [];
const MAX_HISTORY = 100;

/**
 * Log job execution to history
 */
function logJobExecution(log: Omit<JobLog, "id">): void {
  const id = jobHistory.length + 1;
  jobHistory.unshift({ id, ...log });
  
  // Keep only last N entries
  if (jobHistory.length > MAX_HISTORY) {
    jobHistory.pop();
  }
}

/**
 * Check if a job is currently running
 */
export function isJobRunning(jobName: string): boolean {
  return runningJobs.has(jobName);
}

/**
 * Get job execution history
 */
export function getJobHistory(jobName?: string, limit: number = 20): JobLog[] {
  const filtered = jobName 
    ? jobHistory.filter(j => j.jobName === jobName)
    : jobHistory;
  return filtered.slice(0, limit);
}

/**
 * Run the signature expiration notification job
 * 
 * This job should be run daily (recommended: 8 AM local time)
 * It processes all signatures and sends notifications for those expiring soon.
 */
export async function runSignatureExpirationJob(): Promise<JobResult> {
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
  
  runningJobs.set(jobName, { startedAt });
  logJobExecution({
    jobName,
    status: "running",
    startedAt,
  });
  
  try {
    // Process expiration notifications
    const result = await processExpirationNotifications();
    
    const completedAt = new Date();
    const duration = completedAt.getTime() - startedAt.getTime();
    
    // Update job log
    const lastLog = jobHistory.find(j => j.jobName === jobName && j.status === "running");
    if (lastLog) {
      lastLog.status = "completed";
      lastLog.completedAt = completedAt;
      lastLog.result = result;
    }
    
    // Notify admin if there were errors
    if (result.errors.length > 0) {
      const db = await getDb();
      
      // Get admin users
      const admins = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, "admin"));
      
      // Send notification to each admin
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
    };
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(errorMessage);
    
    // Update job log
    const lastLog = jobHistory.find(j => j.jobName === jobName && j.status === "running");
    if (lastLog) {
      lastLog.status = "failed";
      lastLog.completedAt = completedAt;
      lastLog.error = errorMessage;
    }
    
    return {
      jobName,
      success: false,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      duration: completedAt.getTime() - startedAt.getTime(),
      details: {},
      errors,
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
  ];
}

/**
 * Run a job by name
 */
export async function runJob(jobName: string): Promise<JobResult> {
  switch (jobName) {
    case "signature_expiration_notifications":
      return runSignatureExpirationJob();
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
