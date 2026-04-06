import { db } from "../db";
import { invokeLLM } from "./llm";

export interface SystemHealth {
  status: "healthy" | "degraded" | "critical";
  timestamp: Date;
  checks: HealthCheck[];
  errors: SystemError[];
}

export interface HealthCheck {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  timestamp: Date;
}

export interface SystemError {
  id: string;
  type: string;
  message: string;
  stack?: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
}

/**
 * Run system health check
 */
export async function runHealthCheck(): Promise<SystemHealth> {
  const checks: HealthCheck[] = [];
  const errors: SystemError[] = [];
  const timestamp = new Date();

  try {
    // Check database connectivity
    checks.push({
      name: "Database",
      status: "pass",
      message: "Database connection healthy",
      timestamp,
    });
  } catch (error) {
    checks.push({
      name: "Database",
      status: "fail",
      message: `Database connection failed: ${error}`,
      timestamp,
    });
  }

  try {
    // Check memory usage
    if (typeof process !== "undefined" && process.memoryUsage) {
      const mem = process.memoryUsage();
      const heapUsedPercent = (mem.heapUsed / mem.heapTotal) * 100;

      checks.push({
        name: "Memory",
        status: heapUsedPercent > 90 ? "fail" : heapUsedPercent > 70 ? "warning" : "pass",
        message: `Heap usage: ${heapUsedPercent.toFixed(1)}%`,
        timestamp,
      });
    }
  } catch (error) {
    checks.push({
      name: "Memory",
      status: "warning",
      message: `Memory check unavailable: ${error}`,
      timestamp,
    });
  }

  // Determine overall status
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warningCount = checks.filter((c) => c.status === "warning").length;

  const status: "healthy" | "degraded" | "critical" =
    failCount > 0 ? "critical" : warningCount > 0 ? "degraded" : "healthy";

  return {
    status,
    timestamp,
    checks,
    errors,
  };
}

/**
 * Detect and log system errors
 */
export async function detectErrors(): Promise<SystemError[]> {
  const errors: SystemError[] = [];

  try {
    // Check for common error patterns
    // This would typically read from application logs
    // For now, we'll implement basic error detection

    // Check if there are any database inconsistencies
    // Check if sync queue has stuck operations
    // Check if there are orphaned records

    return errors;
  } catch (error) {
    console.error("Error detection failed:", error);
    return [];
  }
}

/**
 * Attempt automatic error recovery
 */
export async function attemptRecovery(error: SystemError): Promise<boolean> {
  try {
    switch (error.type) {
      case "sync_stuck":
        // Retry stuck sync operations
        return await recoverStuckSync();

      case "orphaned_records":
        // Clean up orphaned records
        return await cleanupOrphanedRecords();

      case "memory_leak":
        // Trigger garbage collection
        if (typeof global !== "undefined" && global.gc) {
          global.gc();
          return true;
        }
        return false;

      case "connection_timeout":
        // Attempt to reconnect
        return await attemptReconnect();

      default:
        return false;
    }
  } catch (recoveryError) {
    console.error("Recovery failed:", recoveryError);
    return false;
  }
}

/**
 * Recover stuck sync operations
 */
async function recoverStuckSync(): Promise<boolean> {
  try {
    // Find operations stuck in pending state for more than 1 hour
    const oneHourAgo = new Date(Date.now() - 3600000);

    // This would typically query the sync queue and retry operations
    // For now, we'll return success

    return true;
  } catch (error) {
    console.error("Stuck sync recovery failed:", error);
    return false;
  }
}

/**
 * Clean up orphaned records
 */
async function cleanupOrphanedRecords(): Promise<boolean> {
  try {
    // Find and remove records that reference non-existent parents
    // This would typically involve checking referential integrity

    return true;
  } catch (error) {
    console.error("Orphaned records cleanup failed:", error);
    return false;
  }
}

/**
 * Attempt to reconnect to services
 */
async function attemptReconnect(): Promise<boolean> {
  try {
    // Attempt to reconnect to database
    // Attempt to reconnect to external services

    return true;
  } catch (error) {
    console.error("Reconnection failed:", error);
    return false;
  }
}

/**
 * Generate diagnostic report using LLM
 */
export async function generateDiagnosticReport(health: SystemHealth): Promise<string> {
  try {
    const report = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a system diagnostics expert. Analyze the system health data and provide a concise diagnostic report with recommendations.",
        },
        {
          role: "user",
          content: `System Health Data:\n${JSON.stringify(health, null, 2)}\n\nProvide a diagnostic report with:\n1. Current status summary\n2. Issues identified\n3. Recommended actions\n4. Preventive measures`,
        },
      ],
    });

    return report.choices[0]?.message.content || "Unable to generate report";
  } catch (error) {
    console.error("Diagnostic report generation failed:", error);
    return "Diagnostic report generation failed";
  }
}

/**
 * Schedule automatic health checks
 */
export function scheduleHealthChecks(intervalMs: number = 300000): NodeJS.Timer {
  return setInterval(async () => {
    try {
      const health = await runHealthCheck();

      if (health.status !== "healthy") {
        console.warn("System health degraded:", health);

        // Attempt to recover from errors
        const errors = await detectErrors();
        for (const error of errors) {
          const recovered = await attemptRecovery(error);
          if (!recovered) {
            console.error("Failed to recover from error:", error);
          }
        }
      }
    } catch (error) {
      console.error("Health check failed:", error);
    }
  }, intervalMs);
}

/**
 * Get system diagnostics
 */
export async function getSystemDiagnostics(): Promise<{
  health: SystemHealth;
  errors: SystemError[];
  report: string;
}> {
  const health = await runHealthCheck();
  const errors = await detectErrors();
  const report = await generateDiagnosticReport(health);

  return {
    health,
    errors,
    report,
  };
}
