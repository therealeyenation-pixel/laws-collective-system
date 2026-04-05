import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { sql, desc, eq, and, gte, lte, like, or } from "drizzle-orm";

// Signature audit router for compliance tracking
export const signatureAuditRouter = router({
  // Get all signature records with filtering and pagination
  getSignatures: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        department: z.string().optional(),
        articleType: z.string().optional(),
        status: z.enum(["all", "signed", "pending"]).default("all"),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check admin access
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required for signature audit",
        });
      }

      const { page, pageSize, search, department, articleType, status, dateFrom, dateTo } = input;
      const offset = (page - 1) * pageSize;

      try {
        // Build dynamic WHERE conditions
        const conditions: any[] = [];

        if (search) {
          conditions.push(
            sql`(
              aa.article_title LIKE ${`%${search}%`} OR 
              aa.article_id LIKE ${`%${search}%`} OR
              u.name LIKE ${`%${search}%`} OR
              u.email LIKE ${`%${search}%`}
            )`
          );
        }

        if (department && department !== "All Departments") {
          conditions.push(sql`aa.department = ${department}`);
        }

        if (articleType && articleType !== "All Types") {
          conditions.push(sql`aa.article_type = ${articleType}`);
        }

        if (status === "signed") {
          conditions.push(sql`aa.signed_at IS NOT NULL`);
        } else if (status === "pending") {
          conditions.push(sql`aa.signed_at IS NULL`);
        }

        if (dateFrom) {
          conditions.push(sql`aa.created_at >= ${dateFrom}`);
        }

        if (dateTo) {
          conditions.push(sql`aa.created_at <= ${dateTo}`);
        }

        const whereClause = conditions.length > 0 
          ? sql`WHERE ${sql.join(conditions, sql` AND `)}` 
          : sql``;

        // Get total count
        const countResult = await db.execute(sql`
          SELECT COUNT(*) as total
          FROM article_acknowledgments aa
          LEFT JOIN users u ON aa.user_id = u.id
          ${whereClause}
        `);
        const total = Number((countResult as any)[0]?.total || 0);

        // Get paginated records
        const records = await db.execute(sql`
          SELECT 
            aa.id,
            aa.user_id,
            u.name as user_name,
            u.email as user_email,
            aa.article_id,
            aa.article_title,
            aa.article_type,
            aa.department,
            aa.read_at,
            aa.signed_at,
            aa.signature_hash,
            aa.ip_address,
            aa.user_agent,
            aa.created_at
          FROM article_acknowledgments aa
          LEFT JOIN users u ON aa.user_id = u.id
          ${whereClause}
          ORDER BY aa.created_at DESC
          LIMIT ${pageSize} OFFSET ${offset}
        `);

        return {
          records: (records as any[]).map((r) => ({
            id: r.id,
            userId: r.user_id,
            userName: r.user_name || "Unknown User",
            userEmail: r.user_email || "",
            articleId: r.article_id,
            articleTitle: r.article_title,
            articleType: r.article_type || "document",
            department: r.department || "General",
            readAt: r.read_at,
            signedAt: r.signed_at,
            signatureHash: r.signature_hash,
            ipAddress: r.ip_address,
            userAgent: r.user_agent,
            createdAt: r.created_at,
          })),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      } catch (error) {
        console.error("[SignatureAudit] Error fetching signatures:", error);
        // Return empty result if table doesn't exist yet
        return {
          records: [],
          total: 0,
          page: 1,
          pageSize,
          totalPages: 0,
        };
      }
    }),

  // Get compliance metrics
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required for signature audit",
      });
    }

    try {
      const metricsResult = await db.execute(sql`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN signed_at IS NOT NULL THEN 1 ELSE 0 END) as signed,
          SUM(CASE WHEN signed_at IS NULL THEN 1 ELSE 0 END) as pending
        FROM article_acknowledgments
      `);

      const metrics = (metricsResult as any)[0] || { total: 0, signed: 0, pending: 0 };
      const total = Number(metrics.total) || 0;
      const signed = Number(metrics.signed) || 0;
      const pending = Number(metrics.pending) || 0;
      const complianceRate = total > 0 ? Math.round((signed / total) * 100) : 0;

      // Get department breakdown
      const departmentResult = await db.execute(sql`
        SELECT 
          department,
          COUNT(*) as total,
          SUM(CASE WHEN signed_at IS NOT NULL THEN 1 ELSE 0 END) as signed
        FROM article_acknowledgments
        WHERE department IS NOT NULL
        GROUP BY department
        ORDER BY total DESC
        LIMIT 10
      `);

      // Get recent activity (last 7 days)
      const recentResult = await db.execute(sql`
        SELECT 
          DATE(signed_at) as date,
          COUNT(*) as count
        FROM article_acknowledgments
        WHERE signed_at IS NOT NULL 
          AND signed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(signed_at)
        ORDER BY date DESC
      `);

      return {
        total,
        signed,
        pending,
        complianceRate,
        departments: (departmentResult as any[]).map((d) => ({
          name: d.department,
          total: Number(d.total),
          signed: Number(d.signed),
          rate: Number(d.total) > 0 ? Math.round((Number(d.signed) / Number(d.total)) * 100) : 0,
        })),
        recentActivity: (recentResult as any[]).map((r) => ({
          date: r.date,
          count: Number(r.count),
        })),
      };
    } catch (error) {
      console.error("[SignatureAudit] Error fetching metrics:", error);
      return {
        total: 0,
        signed: 0,
        pending: 0,
        complianceRate: 0,
        departments: [],
        recentActivity: [],
      };
    }
  }),

  // Get unique departments for filter dropdown
  getDepartments: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    try {
      const result = await db.execute(sql`
        SELECT DISTINCT department 
        FROM article_acknowledgments 
        WHERE department IS NOT NULL 
        ORDER BY department
      `);
      return ["All Departments", ...(result as any[]).map((r) => r.department)];
    } catch (error) {
      return ["All Departments"];
    }
  }),

  // Get unique article types for filter dropdown
  getArticleTypes: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    try {
      const result = await db.execute(sql`
        SELECT DISTINCT article_type 
        FROM article_acknowledgments 
        WHERE article_type IS NOT NULL 
        ORDER BY article_type
      `);
      return ["All Types", ...(result as any[]).map((r) => r.article_type)];
    } catch (error) {
      return ["All Types"];
    }
  }),

  // Get single signature record details
  getSignatureDetails: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      try {
        const result = await db.execute(sql`
          SELECT 
            aa.*,
            u.name as user_name,
            u.email as user_email
          FROM article_acknowledgments aa
          LEFT JOIN users u ON aa.user_id = u.id
          WHERE aa.id = ${input.id}
        `);

        if ((result as any[]).length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Signature record not found",
          });
        }

        const r = (result as any)[0];
        return {
          id: r.id,
          userId: r.user_id,
          userName: r.user_name || "Unknown User",
          userEmail: r.user_email || "",
          articleId: r.article_id,
          articleTitle: r.article_title,
          articleType: r.article_type || "document",
          department: r.department || "General",
          readAt: r.read_at,
          signedAt: r.signed_at,
          signatureHash: r.signature_hash,
          ipAddress: r.ip_address,
          userAgent: r.user_agent,
          createdAt: r.created_at,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch signature details",
        });
      }
    }),
});
