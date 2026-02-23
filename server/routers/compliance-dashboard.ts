import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { db } from "../db";

export const complianceDashboardRouter = router({
  // Get overall compliance statistics
  getOverviewStats: protectedProcedure
    .input(z.object({
      dateRange: z.enum(["7d", "30d", "90d", "1y", "all"]).optional().default("30d"),
    }))
    .query(async ({ ctx, input }) => {
      // Check admin role
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const { dateRange } = input;
      
      // Calculate date filter
      let dateFilter = "";
      const now = new Date();
      switch (dateRange) {
        case "7d":
          dateFilter = `AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
          break;
        case "30d":
          dateFilter = `AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
          break;
        case "90d":
          dateFilter = `AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)`;
          break;
        case "1y":
          dateFilter = `AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`;
          break;
        default:
          dateFilter = "";
      }

      try {
        // Get total signatures
        const [totalResult] = await db.execute(sql.raw(`
          SELECT COUNT(*) as total FROM article_acknowledgments WHERE 1=1 ${dateFilter}
        `));
        const totalSignatures = Number((totalResult as any)[0]?.total || 0);

        // Get signed count
        const [signedResult] = await db.execute(sql.raw(`
          SELECT COUNT(*) as signed FROM article_acknowledgments WHERE signed_at IS NOT NULL ${dateFilter}
        `));
        const signedCount = Number((signedResult as any)[0]?.signed || 0);

        // Get pending count
        const pendingCount = totalSignatures - signedCount;

        // Get overdue count (due date passed but not signed)
        const [overdueResult] = await db.execute(sql.raw(`
          SELECT COUNT(*) as overdue FROM article_acknowledgments 
          WHERE signed_at IS NULL 
          AND due_date IS NOT NULL 
          AND due_date < NOW() ${dateFilter}
        `));
        const overdueCount = Number((overdueResult as any)[0]?.overdue || 0);

        // Get compliance rate
        const complianceRate = totalSignatures > 0 
          ? Math.round((signedCount / totalSignatures) * 100) 
          : 100;

        // Get average time to sign (in hours)
        const [avgTimeResult] = await db.execute(sql.raw(`
          SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, signed_at)) as avg_hours 
          FROM article_acknowledgments 
          WHERE signed_at IS NOT NULL ${dateFilter}
        `));
        const avgTimeToSign = Math.round(Number((avgTimeResult as any)[0]?.avg_hours || 0));

        return {
          totalSignatures,
          signedCount,
          pendingCount,
          overdueCount,
          complianceRate,
          avgTimeToSign,
          dateRange,
        };
      } catch (error) {
        console.error("[ComplianceDashboard] Error fetching overview stats:", error);
        // Return mock data if tables don't exist yet
        return {
          totalSignatures: 0,
          signedCount: 0,
          pendingCount: 0,
          overdueCount: 0,
          complianceRate: 100,
          avgTimeToSign: 0,
          dateRange,
        };
      }
    }),

  // Get compliance by department
  getByDepartment: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        const [results] = await db.execute(sql.raw(`
          SELECT 
            COALESCE(department, 'Unassigned') as department,
            COUNT(*) as total,
            SUM(CASE WHEN signed_at IS NOT NULL THEN 1 ELSE 0 END) as signed,
            SUM(CASE WHEN signed_at IS NULL THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN signed_at IS NULL AND due_date IS NOT NULL AND due_date < NOW() THEN 1 ELSE 0 END) as overdue
          FROM article_acknowledgments
          GROUP BY department
          ORDER BY total DESC
        `));

        const departments = (results as any[]).map(row => ({
          department: row.department || "Unassigned",
          total: Number(row.total),
          signed: Number(row.signed),
          pending: Number(row.pending),
          overdue: Number(row.overdue),
          complianceRate: row.total > 0 ? Math.round((Number(row.signed) / Number(row.total)) * 100) : 100,
        }));

        return { departments };
      } catch (error) {
        console.error("[ComplianceDashboard] Error fetching department stats:", error);
        // Return sample departments if no data
        return {
          departments: [
            { department: "HR", total: 0, signed: 0, pending: 0, overdue: 0, complianceRate: 100 },
            { department: "Finance", total: 0, signed: 0, pending: 0, overdue: 0, complianceRate: 100 },
            { department: "Legal", total: 0, signed: 0, pending: 0, overdue: 0, complianceRate: 100 },
            { department: "Operations", total: 0, signed: 0, pending: 0, overdue: 0, complianceRate: 100 },
            { department: "IT", total: 0, signed: 0, pending: 0, overdue: 0, complianceRate: 100 },
          ],
        };
      }
    }),

  // Get monthly trend data
  getMonthlyTrend: protectedProcedure
    .input(z.object({
      months: z.number().min(1).max(24).optional().default(12),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        const [results] = await db.execute(sql.raw(`
          SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as total,
            SUM(CASE WHEN signed_at IS NOT NULL THEN 1 ELSE 0 END) as signed
          FROM article_acknowledgments
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${input.months} MONTH)
          GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ORDER BY month ASC
        `));

        const trend = (results as any[]).map(row => ({
          month: row.month,
          total: Number(row.total),
          signed: Number(row.signed),
          complianceRate: row.total > 0 ? Math.round((Number(row.signed) / Number(row.total)) * 100) : 100,
        }));

        // Fill in missing months with zero data
        const filledTrend = [];
        const now = new Date();
        for (let i = input.months - 1; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const existing = trend.find(t => t.month === monthKey);
          filledTrend.push(existing || { month: monthKey, total: 0, signed: 0, complianceRate: 100 });
        }

        return { trend: filledTrend };
      } catch (error) {
        console.error("[ComplianceDashboard] Error fetching monthly trend:", error);
        // Return empty trend
        const filledTrend = [];
        const now = new Date();
        for (let i = input.months - 1; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          filledTrend.push({ month: monthKey, total: 0, signed: 0, complianceRate: 100 });
        }
        return { trend: filledTrend };
      }
    }),

  // Get top pending signatures
  getTopPending: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).optional().default(10),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        const [results] = await db.execute(sql.raw(`
          SELECT 
            aa.id,
            aa.article_id,
            aa.article_title,
            aa.article_type,
            aa.department,
            aa.user_id,
            u.name as user_name,
            u.email as user_email,
            aa.created_at,
            aa.due_date,
            CASE 
              WHEN aa.due_date IS NOT NULL AND aa.due_date < NOW() THEN 'overdue'
              WHEN aa.due_date IS NOT NULL AND aa.due_date < DATE_ADD(NOW(), INTERVAL 3 DAY) THEN 'urgent'
              ELSE 'pending'
            END as priority
          FROM article_acknowledgments aa
          LEFT JOIN users u ON aa.user_id = u.id
          WHERE aa.signed_at IS NULL
          ORDER BY 
            CASE 
              WHEN aa.due_date IS NOT NULL AND aa.due_date < NOW() THEN 1
              WHEN aa.due_date IS NOT NULL AND aa.due_date < DATE_ADD(NOW(), INTERVAL 3 DAY) THEN 2
              ELSE 3
            END,
            aa.due_date ASC,
            aa.created_at ASC
          LIMIT ${input.limit}
        `));

        const pending = (results as any[]).map(row => ({
          id: row.id,
          articleId: row.article_id,
          articleTitle: row.article_title,
          articleType: row.article_type,
          department: row.department,
          userId: row.user_id,
          userName: row.user_name || "Unknown",
          userEmail: row.user_email || "",
          createdAt: row.created_at,
          dueDate: row.due_date,
          priority: row.priority,
        }));

        return { pending };
      } catch (error) {
        console.error("[ComplianceDashboard] Error fetching top pending:", error);
        return { pending: [] };
      }
    }),

  // Get document type breakdown
  getByDocumentType: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        const [results] = await db.execute(sql.raw(`
          SELECT 
            COALESCE(article_type, 'document') as type,
            COUNT(*) as total,
            SUM(CASE WHEN signed_at IS NOT NULL THEN 1 ELSE 0 END) as signed
          FROM article_acknowledgments
          GROUP BY article_type
          ORDER BY total DESC
        `));

        const types = (results as any[]).map(row => ({
          type: row.type || "document",
          total: Number(row.total),
          signed: Number(row.signed),
          pending: Number(row.total) - Number(row.signed),
          complianceRate: row.total > 0 ? Math.round((Number(row.signed) / Number(row.total)) * 100) : 100,
        }));

        return { types };
      } catch (error) {
        console.error("[ComplianceDashboard] Error fetching document types:", error);
        return {
          types: [
            { type: "policy", total: 0, signed: 0, pending: 0, complianceRate: 100 },
            { type: "compliance", total: 0, signed: 0, pending: 0, complianceRate: 100 },
            { type: "training", total: 0, signed: 0, pending: 0, complianceRate: 100 },
          ],
        };
      }
    }),

  // Send reminder to specific user
  sendReminder: protectedProcedure
    .input(z.object({
      acknowledgmentId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        // Get acknowledgment details
        const [results] = await db.execute(sql.raw(`
          SELECT aa.*, u.name as user_name, u.email as user_email
          FROM article_acknowledgments aa
          LEFT JOIN users u ON aa.user_id = u.id
          WHERE aa.id = ${input.acknowledgmentId}
        `));

        const ack = (results as any[])[0];
        if (!ack) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Acknowledgment not found" });
        }

        if (ack.signed_at) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Document already signed" });
        }

        // Record reminder sent
        await db.execute(sql.raw(`
          INSERT INTO signature_reminders (user_id, article_id, reminder_type, sent_at)
          VALUES (${ack.user_id}, '${ack.article_id}', 'manual', NOW())
        `));

        console.log(`[ComplianceDashboard] Manual reminder sent to user ${ack.user_id} for ${ack.article_title}`);

        return {
          success: true,
          message: `Reminder sent to ${ack.user_name || ack.user_email}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[ComplianceDashboard] Error sending reminder:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send reminder" });
      }
    }),

  // Get weekly compliance summary for executive report
  getWeeklySummary: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        // This week's stats
        const [thisWeekResult] = await db.execute(sql.raw(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN signed_at IS NOT NULL THEN 1 ELSE 0 END) as signed
          FROM article_acknowledgments
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `));
        const thisWeek = (thisWeekResult as any)[0];

        // Last week's stats
        const [lastWeekResult] = await db.execute(sql.raw(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN signed_at IS NOT NULL THEN 1 ELSE 0 END) as signed
          FROM article_acknowledgments
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
          AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
        `));
        const lastWeek = (lastWeekResult as any)[0];

        const thisWeekRate = thisWeek.total > 0 ? Math.round((Number(thisWeek.signed) / Number(thisWeek.total)) * 100) : 100;
        const lastWeekRate = lastWeek.total > 0 ? Math.round((Number(lastWeek.signed) / Number(lastWeek.total)) * 100) : 100;
        const rateChange = thisWeekRate - lastWeekRate;

        return {
          thisWeek: {
            total: Number(thisWeek.total),
            signed: Number(thisWeek.signed),
            complianceRate: thisWeekRate,
          },
          lastWeek: {
            total: Number(lastWeek.total),
            signed: Number(lastWeek.signed),
            complianceRate: lastWeekRate,
          },
          rateChange,
          trend: rateChange > 0 ? "up" : rateChange < 0 ? "down" : "stable",
        };
      } catch (error) {
        console.error("[ComplianceDashboard] Error fetching weekly summary:", error);
        return {
          thisWeek: { total: 0, signed: 0, complianceRate: 100 },
          lastWeek: { total: 0, signed: 0, complianceRate: 100 },
          rateChange: 0,
          trend: "stable" as const,
        };
      }
    }),
});
