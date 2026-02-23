import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { getReminderStats, processAllSignatureReminders } from "../services/signature-reminders";

export const bulkSignatureRouter = router({
  // Create a new bulk signature request
  createRequest: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        articleId: z.string().min(1),
        articleTitle: z.string().min(1),
        articleType: z.enum(["policy", "compliance", "training", "procedure", "announcement", "document"]).default("document"),
        department: z.string().optional(),
        targetType: z.enum(["all", "department", "role", "specific"]).default("all"),
        targetValue: z.string().optional(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to create signature requests",
        });
      }

      try {
        // Create the signature request
        const result = await db.execute(sql`
          INSERT INTO signature_requests (
            title, description, article_id, article_title, article_type,
            department, created_by, target_type, target_value, due_date, status
          ) VALUES (
            ${input.title},
            ${input.description || null},
            ${input.articleId},
            ${input.articleTitle},
            ${input.articleType},
            ${input.department || null},
            ${ctx.user.id},
            ${input.targetType},
            ${input.targetValue || null},
            ${input.dueDate ? sql`${input.dueDate}` : sql`NULL`},
            'draft'
          )
        `);

        const insertId = (result as any).insertId;
        return { id: insertId, message: "Signature request created" };
      } catch (error) {
        console.error("[BulkSignature] Error creating request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create signature request",
        });
      }
    }),

  // Activate a signature request (send to recipients)
  activateRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      try {
        // Get the request details
        const requestResult = await db.execute(sql`
          SELECT * FROM signature_requests WHERE id = ${input.requestId}
        `);

        if ((requestResult as any[]).length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Signature request not found",
          });
        }

        const request = (requestResult as any)[0];

        // Get target users based on target type
        let usersQuery;
        if (request.target_type === "all") {
          usersQuery = sql`SELECT id, email, name FROM users WHERE id != ${ctx.user.id}`;
        } else if (request.target_type === "department") {
          usersQuery = sql`SELECT id, email, name FROM users WHERE department = ${request.target_value}`;
        } else if (request.target_type === "role") {
          usersQuery = sql`SELECT id, email, name FROM users WHERE role = ${request.target_value}`;
        } else if (request.target_type === "specific") {
          const userIds = request.target_value?.split(",").map((id: string) => parseInt(id.trim())) || [];
          if (userIds.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No target users specified",
            });
          }
          usersQuery = sql`SELECT id, email, name FROM users WHERE id IN (${sql.join(userIds.map((id: number) => sql`${id}`), sql`, `)})`;
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid target type",
          });
        }

        const usersResult = await db.execute(usersQuery);
        const users = usersResult as any[];

        if (users.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No users found matching the target criteria",
          });
        }

        // Create article_acknowledgments for each user
        let created = 0;
        for (const user of users) {
          try {
            // Check if acknowledgment already exists
            const existingResult = await db.execute(sql`
              SELECT id FROM article_acknowledgments 
              WHERE user_id = ${user.id} AND article_id = ${request.article_id}
            `);

            if ((existingResult as any[]).length === 0) {
              await db.execute(sql`
                INSERT INTO article_acknowledgments (
                  user_id, article_id, article_title, article_type, department, created_at
                ) VALUES (
                  ${user.id},
                  ${request.article_id},
                  ${request.article_title},
                  ${request.article_type},
                  ${request.department || "General"},
                  NOW()
                )
              `);
              created++;
            }
          } catch (err) {
            console.error(`[BulkSignature] Error creating acknowledgment for user ${user.id}:`, err);
          }
        }

        // Update request status
        await db.execute(sql`
          UPDATE signature_requests 
          SET status = 'active', total_recipients = ${created}, updated_at = NOW()
          WHERE id = ${input.requestId}
        `);

        // Create notifications for all recipients
        for (const user of users) {
          try {
            await db.execute(sql`
              INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
              VALUES (
                ${user.id},
                ${"Signature Required"},
                ${`Please review and sign: ${request.article_title}`},
                ${"signature_request"},
                ${`/sign/${request.article_id}`},
                NOW()
              )
            `);
          } catch (err) {
            // Ignore notification errors
          }
        }

        return {
          message: `Signature request activated`,
          recipientCount: created,
          totalUsers: users.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[BulkSignature] Error activating request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to activate signature request",
        });
      }
    }),

  // Get all signature requests
  getRequests: protectedProcedure
    .input(
      z.object({
        status: z.enum(["all", "draft", "active", "completed", "cancelled"]).default("all"),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      try {
        const { status, page, pageSize } = input;
        const offset = (page - 1) * pageSize;

        const statusCondition = status !== "all" ? sql`AND status = ${status}` : sql``;

        // Get total count
        const countResult = await db.execute(sql`
          SELECT COUNT(*) as total FROM signature_requests WHERE 1=1 ${statusCondition}
        `);
        const total = Number((countResult as any)[0]?.total || 0);

        // Get requests
        const requestsResult = await db.execute(sql`
          SELECT 
            sr.*,
            u.name as created_by_name,
            (SELECT COUNT(*) FROM article_acknowledgments aa 
             WHERE aa.article_id = sr.article_id AND aa.signed_at IS NOT NULL) as signed_count
          FROM signature_requests sr
          LEFT JOIN users u ON sr.created_by = u.id
          WHERE 1=1 ${statusCondition}
          ORDER BY sr.created_at DESC
          LIMIT ${pageSize} OFFSET ${offset}
        `);

        return {
          requests: (requestsResult as any[]).map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            articleId: r.article_id,
            articleTitle: r.article_title,
            articleType: r.article_type,
            department: r.department,
            createdBy: r.created_by,
            createdByName: r.created_by_name || "Unknown",
            targetType: r.target_type,
            targetValue: r.target_value,
            dueDate: r.due_date,
            status: r.status,
            totalRecipients: r.total_recipients,
            signedCount: Number(r.signed_count) || 0,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          })),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      } catch (error) {
        console.error("[BulkSignature] Error getting requests:", error);
        return {
          requests: [],
          total: 0,
          page: 1,
          pageSize: input.pageSize,
          totalPages: 0,
        };
      }
    }),

  // Get single request details
  getRequestDetails: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      try {
        const requestResult = await db.execute(sql`
          SELECT sr.*, u.name as created_by_name
          FROM signature_requests sr
          LEFT JOIN users u ON sr.created_by = u.id
          WHERE sr.id = ${input.requestId}
        `);

        if ((requestResult as any[]).length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Request not found",
          });
        }

        const r = (requestResult as any)[0];

        // Get recipient status
        const recipientsResult = await db.execute(sql`
          SELECT 
            aa.user_id,
            u.name as user_name,
            u.email as user_email,
            aa.read_at,
            aa.signed_at,
            aa.signature_hash
          FROM article_acknowledgments aa
          LEFT JOIN users u ON aa.user_id = u.id
          WHERE aa.article_id = ${r.article_id}
          ORDER BY aa.signed_at DESC, aa.created_at DESC
        `);

        return {
          id: r.id,
          title: r.title,
          description: r.description,
          articleId: r.article_id,
          articleTitle: r.article_title,
          articleType: r.article_type,
          department: r.department,
          createdBy: r.created_by,
          createdByName: r.created_by_name || "Unknown",
          targetType: r.target_type,
          targetValue: r.target_value,
          dueDate: r.due_date,
          status: r.status,
          totalRecipients: r.total_recipients,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          recipients: (recipientsResult as any[]).map((rec) => ({
            userId: rec.user_id,
            userName: rec.user_name || "Unknown",
            userEmail: rec.user_email || "",
            readAt: rec.read_at,
            signedAt: rec.signed_at,
            signatureHash: rec.signature_hash,
          })),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get request details",
        });
      }
    }),

  // Cancel a signature request
  cancelRequest: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      try {
        await db.execute(sql`
          UPDATE signature_requests 
          SET status = 'cancelled', updated_at = NOW()
          WHERE id = ${input.requestId}
        `);

        return { message: "Signature request cancelled" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel request",
        });
      }
    }),

  // Get reminder statistics
  getReminderStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    return getReminderStats();
  }),

  // Manually trigger reminders (admin only)
  triggerReminders: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const results = await processAllSignatureReminders();
    return {
      message: "Reminders processed",
      results,
    };
  }),

  // Get available departments for targeting
  getDepartments: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    try {
      const result = await db.execute(sql`
        SELECT DISTINCT department FROM users WHERE department IS NOT NULL ORDER BY department
      `);
      return (result as any[]).map((r) => r.department);
    } catch (error) {
      return [];
    }
  }),

  // Get users for specific targeting
  getUsers: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      try {
        const searchCondition = input.search
          ? sql`AND (name LIKE ${`%${input.search}%`} OR email LIKE ${`%${input.search}%`})`
          : sql``;

        const result = await db.execute(sql`
          SELECT id, name, email, department, role
          FROM users
          WHERE 1=1 ${searchCondition}
          ORDER BY name
          LIMIT 100
        `);

        return (result as any[]).map((u) => ({
          id: u.id,
          name: u.name || "Unknown",
          email: u.email || "",
          department: u.department,
          role: u.role,
        }));
      } catch (error) {
        return [];
      }
    }),
});
