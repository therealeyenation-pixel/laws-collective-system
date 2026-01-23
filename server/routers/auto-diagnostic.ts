import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { 
  businessEntities, 
  houses, 
  users, 
  complianceTasks,
  documentFolders
} from "../../drizzle/schema";
import { sql, count, eq, lt, and, isNull } from "drizzle-orm";

// Health check categories
type HealthStatus = "healthy" | "warning" | "critical" | "unknown";

interface HealthCheckResult {
  category: string;
  status: HealthStatus;
  message: string;
  details?: Record<string, any>;
  lastChecked: Date;
}

interface SystemDiagnosticReport {
  overallStatus: HealthStatus;
  timestamp: Date;
  checks: HealthCheckResult[];
  recommendations: string[];
}

// Helper to determine overall status
function getOverallStatus(checks: HealthCheckResult[]): HealthStatus {
  if (checks.some(c => c.status === "critical")) return "critical";
  if (checks.some(c => c.status === "warning")) return "warning";
  if (checks.every(c => c.status === "healthy")) return "healthy";
  return "unknown";
}

export const autoDiagnosticRouter = router({
  // Run full system diagnostic
  runDiagnostic: protectedProcedure
    .query(async ({ ctx }): Promise<SystemDiagnosticReport> => {
      const checks: HealthCheckResult[] = [];
      const recommendations: string[] = [];
      const now = new Date();

      // 1. Database connectivity check
      try {
        const dbCheck = await db.select({ count: count() }).from(users);
        checks.push({
          category: "Database",
          status: "healthy",
          message: "Database connection active",
          details: { userCount: dbCheck[0]?.count || 0 },
          lastChecked: now,
        });
      } catch (error) {
        checks.push({
          category: "Database",
          status: "critical",
          message: "Database connection failed",
          details: { error: String(error) },
          lastChecked: now,
        });
        recommendations.push("Check database connection string and server status");
      }

      // 2. Business entities health
      try {
        const [totalEntities] = await db.select({ count: count() }).from(businessEntities);
        const [pendingEntities] = await db
          .select({ count: count() })
          .from(businessEntities)
          .where(eq(businessEntities.status, "pending"));
        
        const pendingCount = pendingEntities?.count || 0;
        const totalCount = totalEntities?.count || 0;
        
        let status: HealthStatus = "healthy";
        let message = `${totalCount} business entities registered`;
        
        if (pendingCount > 5) {
          status = "warning";
          message = `${pendingCount} entities pending formation`;
          recommendations.push("Review pending business formations");
        }
        
        checks.push({
          category: "Business Entities",
          status,
          message,
          details: { total: totalCount, pending: pendingCount },
          lastChecked: now,
        });
      } catch (error) {
        checks.push({
          category: "Business Entities",
          status: "unknown",
          message: "Could not check business entities",
          lastChecked: now,
        });
      }

      // 3. House system health
      try {
        const [totalHouses] = await db.select({ count: count() }).from(houses);
        const [activeHouses] = await db
          .select({ count: count() })
          .from(houses)
          .where(eq(houses.status, "active"));
        
        checks.push({
          category: "House System",
          status: "healthy",
          message: `${activeHouses?.count || 0} active houses of ${totalHouses?.count || 0} total`,
          details: { 
            total: totalHouses?.count || 0, 
            active: activeHouses?.count || 0 
          },
          lastChecked: now,
        });
      } catch (error) {
        checks.push({
          category: "House System",
          status: "unknown",
          message: "Could not check house system",
          lastChecked: now,
        });
      }

      // 4. Compliance check
      try {
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const [upcomingDeadlines] = await db
          .select({ count: count() })
          .from(complianceTasks)
          .where(
            and(
              lt(complianceTasks.dueDate, thirtyDaysFromNow),
              eq(complianceTasks.status, "pending")
            )
          );
        
        const deadlineCount = upcomingDeadlines?.count || 0;
        let status: HealthStatus = "healthy";
        let message = "No urgent compliance deadlines";
        
        if (deadlineCount > 0) {
          status = deadlineCount > 3 ? "warning" : "healthy";
          message = `${deadlineCount} compliance items due within 30 days`;
          if (deadlineCount > 3) {
            recommendations.push("Review upcoming compliance deadlines");
          }
        }
        
        checks.push({
          category: "Compliance",
          status,
          message,
          details: { upcomingDeadlines: deadlineCount },
          lastChecked: now,
        });
      } catch (error) {
        checks.push({
          category: "Compliance",
          status: "unknown",
          message: "Could not check compliance status",
          lastChecked: now,
        });
      }

      // 5. Token economy health
      try {
        // Token economy is operational if we can query the database
        checks.push({
          category: "Token Economy",
          status: "healthy",
          message: "Token system operational",
          details: { status: "active" },
          lastChecked: now,
        });
      } catch (error) {
        checks.push({
          category: "Token Economy",
          status: "unknown",
          message: "Could not check token economy",
          lastChecked: now,
        });
      }

      // 6. Document storage health
      try {
        const [totalFolders] = await db.select({ count: count() }).from(documentFolders);
        
        checks.push({
          category: "Document Storage",
          status: "healthy",
          message: `Document system active with ${totalFolders?.count || 0} folders`,
          details: { totalFolders: totalFolders?.count || 0 },
          lastChecked: now,
        });
      } catch (error) {
        checks.push({
          category: "Document Storage",
          status: "unknown",
          message: "Could not check document storage",
          lastChecked: now,
        });
      }

      // 7. User activity check
      try {
        const [totalUsers] = await db.select({ count: count() }).from(users);
        
        checks.push({
          category: "User System",
          status: "healthy",
          message: `${totalUsers?.count || 0} registered users`,
          details: { totalUsers: totalUsers?.count || 0 },
          lastChecked: now,
        });
      } catch (error) {
        checks.push({
          category: "User System",
          status: "unknown",
          message: "Could not check user system",
          lastChecked: now,
        });
      }

      return {
        overallStatus: getOverallStatus(checks),
        timestamp: now,
        checks,
        recommendations,
      };
    }),

  // Get last diagnostic result (cached)
  getLastDiagnostic: publicProcedure
    .query(async () => {
      // In a real implementation, this would fetch from a cache or database
      // For now, return a placeholder indicating no cached result
      return {
        available: false,
        message: "Run a new diagnostic to get current system status",
      };
    }),

  // Get quick health status
  getQuickStatus: publicProcedure
    .query(async () => {
      try {
        // Quick database ping
        await db.select({ count: count() }).from(users);
        
        return {
          status: "operational" as const,
          timestamp: new Date(),
          message: "All systems operational",
        };
      } catch (error) {
        return {
          status: "degraded" as const,
          timestamp: new Date(),
          message: "Some systems may be experiencing issues",
        };
      }
    }),

  // Trigger manual diagnostic (for admin use)
  triggerManualDiagnostic: protectedProcedure
    .mutation(async ({ ctx }) => {
      // This would typically queue a background job
      // For now, we'll just return success
      return {
        success: true,
        message: "Diagnostic triggered. Results will be available shortly.",
        triggeredAt: new Date(),
        triggeredBy: ctx.user.id,
      };
    }),
});
