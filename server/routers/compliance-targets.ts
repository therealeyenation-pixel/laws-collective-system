import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { db } from "../db";

export const complianceTargetsRouter = router({
  // Get all active targets
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        const [results] = await db.execute(sql.raw(`
          SELECT * FROM compliance_targets 
          WHERE is_active = TRUE 
          AND (end_date IS NULL OR end_date >= CURDATE())
          ORDER BY department ASC
        `));

        return {
          targets: (results as any[]).map(row => ({
            id: row.id,
            department: row.department,
            targetPercentage: row.target_percentage,
            effectiveDate: row.effective_date,
            endDate: row.end_date,
            notes: row.notes,
            isActive: row.is_active,
            createdAt: row.created_at,
          })),
        };
      } catch (error) {
        console.error("[ComplianceTargets] Error fetching targets:", error);
        return { targets: [] };
      }
    }),

  // Get target for specific department
  getByDepartment: protectedProcedure
    .input(z.object({
      department: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const [results] = await db.execute(sql.raw(`
          SELECT * FROM compliance_targets 
          WHERE department = '${input.department}'
          AND is_active = TRUE 
          AND effective_date <= CURDATE()
          AND (end_date IS NULL OR end_date >= CURDATE())
          ORDER BY effective_date DESC
          LIMIT 1
        `));

        const target = (results as any[])[0];
        if (!target) {
          // Return default target if none set
          return {
            target: {
              department: input.department,
              targetPercentage: 95,
              isDefault: true,
            },
          };
        }

        return {
          target: {
            id: target.id,
            department: target.department,
            targetPercentage: target.target_percentage,
            effectiveDate: target.effective_date,
            endDate: target.end_date,
            notes: target.notes,
            isDefault: false,
          },
        };
      } catch (error) {
        console.error("[ComplianceTargets] Error fetching department target:", error);
        return {
          target: {
            department: input.department,
            targetPercentage: 95,
            isDefault: true,
          },
        };
      }
    }),

  // Get all targets with current progress
  getWithProgress: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        // Get all departments with their compliance rates
        const [deptResults] = await db.execute(sql.raw(`
          SELECT 
            COALESCE(department, 'Unassigned') as department,
            COUNT(*) as total,
            SUM(CASE WHEN signed_at IS NOT NULL THEN 1 ELSE 0 END) as signed
          FROM article_acknowledgments
          GROUP BY department
        `));

        const deptStats = new Map<string, { total: number; signed: number; rate: number }>();
        for (const row of deptResults as any[]) {
          const rate = row.total > 0 ? Math.round((Number(row.signed) / Number(row.total)) * 100) : 100;
          deptStats.set(row.department, {
            total: Number(row.total),
            signed: Number(row.signed),
            rate,
          });
        }

        // Get all active targets
        const [targetResults] = await db.execute(sql.raw(`
          SELECT * FROM compliance_targets 
          WHERE is_active = TRUE 
          AND effective_date <= CURDATE()
          AND (end_date IS NULL OR end_date >= CURDATE())
          ORDER BY department ASC
        `));

        const targets = (targetResults as any[]).map(row => {
          const stats = deptStats.get(row.department) || { total: 0, signed: 0, rate: 100 };
          const gap = row.target_percentage - stats.rate;
          let status: "on-track" | "at-risk" | "behind" = "on-track";
          if (gap > 10) status = "behind";
          else if (gap > 0) status = "at-risk";

          return {
            id: row.id,
            department: row.department,
            targetPercentage: row.target_percentage,
            currentRate: stats.rate,
            total: stats.total,
            signed: stats.signed,
            gap,
            status,
            effectiveDate: row.effective_date,
            notes: row.notes,
          };
        });

        // Add departments without explicit targets (using default 95%)
        const defaultTarget = 95;
        for (const [dept, stats] of deptStats) {
          if (!targets.find(t => t.department === dept)) {
            const gap = defaultTarget - stats.rate;
            let status: "on-track" | "at-risk" | "behind" = "on-track";
            if (gap > 10) status = "behind";
            else if (gap > 0) status = "at-risk";

            targets.push({
              id: 0,
              department: dept,
              targetPercentage: defaultTarget,
              currentRate: stats.rate,
              total: stats.total,
              signed: stats.signed,
              gap,
              status,
              effectiveDate: null,
              notes: "Default target",
            });
          }
        }

        // Sort by status (behind first, then at-risk, then on-track)
        targets.sort((a, b) => {
          const statusOrder = { behind: 0, "at-risk": 1, "on-track": 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        });

        return { targets };
      } catch (error) {
        console.error("[ComplianceTargets] Error fetching targets with progress:", error);
        return { targets: [] };
      }
    }),

  // Create or update target
  upsert: protectedProcedure
    .input(z.object({
      department: z.string().min(1),
      targetPercentage: z.number().min(1).max(100),
      effectiveDate: z.string(),
      endDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        // Deactivate existing targets for this department
        await db.execute(sql.raw(`
          UPDATE compliance_targets 
          SET is_active = FALSE, end_date = '${input.effectiveDate}'
          WHERE department = '${input.department}' 
          AND is_active = TRUE
          AND effective_date < '${input.effectiveDate}'
        `));

        // Insert new target
        await db.execute(sql.raw(`
          INSERT INTO compliance_targets (department, target_percentage, effective_date, end_date, created_by, notes)
          VALUES ('${input.department}', ${input.targetPercentage}, '${input.effectiveDate}', ${input.endDate ? `'${input.endDate}'` : 'NULL'}, ${ctx.user.id}, ${input.notes ? `'${input.notes.replace(/'/g, "''")}'` : 'NULL'})
          ON DUPLICATE KEY UPDATE 
            target_percentage = ${input.targetPercentage},
            end_date = ${input.endDate ? `'${input.endDate}'` : 'NULL'},
            notes = ${input.notes ? `'${input.notes.replace(/'/g, "''")}'` : 'NULL'},
            is_active = TRUE
        `));

        return { success: true, message: `Target set for ${input.department}: ${input.targetPercentage}%` };
      } catch (error) {
        console.error("[ComplianceTargets] Error upserting target:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save target" });
      }
    }),

  // Delete target (soft delete)
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        await db.execute(sql.raw(`
          UPDATE compliance_targets 
          SET is_active = FALSE, end_date = CURDATE()
          WHERE id = ${input.id}
        `));

        return { success: true, message: "Target removed" };
      } catch (error) {
        console.error("[ComplianceTargets] Error deleting target:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete target" });
      }
    }),

  // Get organization-wide summary
  getSummary: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      try {
        // Get overall stats
        const [overallResult] = await db.execute(sql.raw(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN signed_at IS NOT NULL THEN 1 ELSE 0 END) as signed
          FROM article_acknowledgments
        `));
        const overall = (overallResult as any)[0];
        const overallRate = overall.total > 0 ? Math.round((Number(overall.signed) / Number(overall.total)) * 100) : 100;

        // Get count of departments meeting target
        const [targetResults] = await db.execute(sql.raw(`
          SELECT COUNT(*) as count FROM (
            SELECT 
              COALESCE(aa.department, 'Unassigned') as dept,
              ROUND(SUM(CASE WHEN aa.signed_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as rate,
              COALESCE(ct.target_percentage, 95) as target
            FROM article_acknowledgments aa
            LEFT JOIN compliance_targets ct ON aa.department = ct.department AND ct.is_active = TRUE
            GROUP BY aa.department
            HAVING rate >= target
          ) as meeting_target
        `));
        const meetingTarget = Number((targetResults as any)[0]?.count || 0);

        // Get total departments
        const [deptCountResult] = await db.execute(sql.raw(`
          SELECT COUNT(DISTINCT COALESCE(department, 'Unassigned')) as count 
          FROM article_acknowledgments
        `));
        const totalDepts = Number((deptCountResult as any)[0]?.count || 0);

        return {
          overallRate,
          totalSignatures: Number(overall.total),
          signedCount: Number(overall.signed),
          departmentsMeetingTarget: meetingTarget,
          totalDepartments: totalDepts,
          targetAchievementRate: totalDepts > 0 ? Math.round((meetingTarget / totalDepts) * 100) : 100,
        };
      } catch (error) {
        console.error("[ComplianceTargets] Error fetching summary:", error);
        return {
          overallRate: 100,
          totalSignatures: 0,
          signedCount: 0,
          departmentsMeetingTarget: 0,
          totalDepartments: 0,
          targetAchievementRate: 100,
        };
      }
    }),
});
