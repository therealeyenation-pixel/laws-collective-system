/**
 * Department Dashboard Router
 * 
 * Connects department dashboards to their simulators, certificates, and training content.
 * Each Manager sees:
 * - Their department info from the registry
 * - Simulator completion stats for their department's workshops
 * - Certificates issued under their department
 * - Training content status (for AI content builder)
 * 
 * This router uses the Department Registry as the single source of truth.
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { eq, sql } from "drizzle-orm";
import {
  DEPARTMENT_REGISTRY,
  getDepartment,
  getDepartmentBySimulatorType,
  getDepartmentsWithSimulators,
  getRegistryStats,
  getCertificateContext,
} from "../../shared/departmentRegistry";
import { getUserCertificatesWithDepartments } from "../services/department-certificate-bridge";

export const departmentDashboardRouter = router({
  /**
   * Get the full department registry (all departments with their mappings)
   */
  getRegistry: protectedProcedure.query(async () => {
    return {
      departments: DEPARTMENT_REGISTRY,
      stats: getRegistryStats(),
    };
  }),

  /**
   * Get a single department's full context
   */
  getDepartment: protectedProcedure
    .input(z.object({ departmentId: z.string() }))
    .query(async ({ input }) => {
      const dept = getDepartment(input.departmentId);
      if (!dept) return null;
      return dept;
    }),

  /**
   * Get simulator completion stats for a specific department
   * Shows how many users have completed each of the department's simulators
   */
  getDepartmentSimulatorStats: protectedProcedure
    .input(z.object({ departmentId: z.string() }))
    .query(async ({ input }) => {
      const dept = getDepartment(input.departmentId);
      if (!dept) return { department: null, simulators: [] };

      const simulatorStats = [];

      for (const sim of dept.simulators) {
        try {
          const result = await db.execute({
            sql: `SELECT 
                    COUNT(*) as totalCompletions,
                    AVG(score) as avgScore,
                    MAX(completedAt) as lastCompletion
                  FROM simulator_completion 
                  WHERE simulatorType = ?`,
            args: [sim.type],
          });

          const row = result.rows[0] as any;
          simulatorStats.push({
            type: sim.type,
            label: sim.label,
            route: sim.route,
            certificateType: sim.certificateType,
            totalCompletions: Number(row?.totalCompletions ?? 0),
            avgScore: row?.avgScore ? Math.round(Number(row.avgScore)) : null,
            lastCompletion: row?.lastCompletion ?? null,
          });
        } catch {
          simulatorStats.push({
            type: sim.type,
            label: sim.label,
            route: sim.route,
            certificateType: sim.certificateType,
            totalCompletions: 0,
            avgScore: null,
            lastCompletion: null,
          });
        }
      }

      return {
        department: {
          id: dept.id,
          name: dept.name,
          manager: dept.manager,
          entity: dept.entity,
        },
        simulators: simulatorStats,
      };
    }),

  /**
   * Get certificates issued under a specific department
   */
  getDepartmentCertificates: protectedProcedure
    .input(
      z.object({
        departmentId: z.string(),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      const dept = getDepartment(input.departmentId);
      if (!dept) return { certificates: [], total: 0 };

      const limit = input.limit ?? 20;

      try {
        const result = await db.execute({
          sql: `SELECT br.id, br.blockchainHash, br.data, br.createdAt
                FROM blockchain_records br
                WHERE br.recordType = 'certificate'
                AND JSON_EXTRACT(br.data, '$.departmentId') = ?
                ORDER BY br.createdAt DESC
                LIMIT ?`,
          args: [input.departmentId, limit],
        });

        const certificates = result.rows.map((row: any) => {
          const data = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
          return {
            id: row.id,
            blockchainHash: row.blockchainHash,
            userName: data?.userName ?? "Unknown",
            simulatorLabel: data?.simulatorLabel ?? "Unknown",
            score: data?.score ?? null,
            issuedAt: data?.issuedAt ?? row.createdAt,
            signingManager: data?.signingManager ?? null,
          };
        });

        // Get total count
        const countResult = await db.execute({
          sql: `SELECT COUNT(*) as total FROM blockchain_records 
                WHERE recordType = 'certificate' 
                AND JSON_EXTRACT(data, '$.departmentId') = ?`,
          args: [input.departmentId],
        });
        const total = Number((countResult.rows[0] as any)?.total ?? 0);

        return { certificates, total };
      } catch {
        return { certificates: [], total: 0 };
      }
    }),

  /**
   * Get all departments with their simulator stats (overview for admin/CEO)
   */
  getAllDepartmentStats: protectedProcedure.query(async () => {
    const departmentsWithSims = getDepartmentsWithSimulators();
    const stats = [];

    for (const dept of departmentsWithSims) {
      let totalCompletions = 0;

      for (const sim of dept.simulators) {
        try {
          const result = await db.execute({
            sql: `SELECT COUNT(*) as cnt FROM simulator_completion WHERE simulatorType = ?`,
            args: [sim.type],
          });
          totalCompletions += Number((result.rows[0] as any)?.cnt ?? 0);
        } catch {
          // continue
        }
      }

      let totalCertificates = 0;
      try {
        const certResult = await db.execute({
          sql: `SELECT COUNT(*) as cnt FROM blockchain_records 
                WHERE recordType = 'certificate' 
                AND JSON_EXTRACT(data, '$.departmentId') = ?`,
          args: [dept.id],
        });
        totalCertificates = Number((certResult.rows[0] as any)?.cnt ?? 0);
      } catch {
        // continue
      }

      stats.push({
        departmentId: dept.id,
        departmentName: dept.name,
        manager: dept.manager,
        entity: dept.entity,
        color: dept.color,
        icon: dept.icon,
        simulatorCount: dept.simulators.length,
        totalCompletions,
        totalCertificates,
        dashboardRoute: dept.dashboardRoute,
      });
    }

    return stats;
  }),

  /**
   * Get current user's certificates with full department context
   */
  getMyCertificates: protectedProcedure.query(async ({ ctx }) => {
    return getUserCertificatesWithDepartments(ctx.user.id);
  }),

  /**
   * Get training content items for a department (foundation for AI content builder)
   */
  getTrainingContent: protectedProcedure
    .input(z.object({ departmentId: z.string() }))
    .query(async ({ input }) => {
      const dept = getDepartment(input.departmentId);
      if (!dept) return { content: [], department: null };

      try {
        const result = await db.execute({
          sql: `SELECT * FROM training_content 
                WHERE department = ? 
                ORDER BY updatedAt DESC 
                LIMIT 50`,
          args: [input.departmentId],
        });
        return {
          content: result.rows,
          department: { id: dept.id, name: dept.name, manager: dept.manager },
        };
      } catch {
        // Table may not exist yet — return empty
        return {
          content: [],
          department: { id: dept.id, name: dept.name, manager: dept.manager },
        };
      }
    }),

  /**
   * Save or update training content for a department (AI content builder)
   */
  saveTrainingContent: protectedProcedure
    .input(
      z.object({
        departmentId: z.string(),
        title: z.string().min(1),
        contentType: z.enum(["lesson", "quiz", "exercise", "resource", "video_script"]),
        content: z.string(),
        simulatorType: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dept = getDepartment(input.departmentId);
      if (!dept) {
        return { success: false, error: "Department not found" };
      }

      try {
        // Check if training_content table exists, create if not
        await db.execute({
          sql: `CREATE TABLE IF NOT EXISTS training_content (
            id INT AUTO_INCREMENT PRIMARY KEY,
            department VARCHAR(100) NOT NULL,
            simulatorType VARCHAR(100),
            title VARCHAR(255) NOT NULL,
            contentType ENUM('lesson', 'quiz', 'exercise', 'resource', 'video_script') NOT NULL,
            content TEXT NOT NULL,
            createdBy INT NOT NULL,
            metadata JSON,
            status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )`,
          args: [],
        });

        const result = await db.execute({
          sql: `INSERT INTO training_content (department, simulatorType, title, contentType, content, createdBy, metadata, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
          args: [
            input.departmentId,
            input.simulatorType ?? null,
            input.title,
            input.contentType,
            input.content,
            ctx.user.id,
            input.metadata ? JSON.stringify(input.metadata) : null,
          ],
        });

        return {
          success: true,
          contentId: Number(result.insertId),
          message: `Training content "${input.title}" saved for ${dept.name} department.`,
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }),
});
