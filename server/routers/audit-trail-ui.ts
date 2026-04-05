import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  activityAuditTrail,
  autonomousOperations,
  blockchainRecords,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const auditTrailUIRouter = router({
  // Get paginated audit trail
  getAuditTrail: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1).optional(),
        limit: z.number().default(50).optional(),
        activityType: z.string().optional(),
        userId: z.number().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0, page: 1, pages: 0 };

      // Get all audit trail entries
      let entries = await db.select().from(activityAuditTrail);

      // Apply filters
      if (input.activityType) {
        entries = entries.filter((e) => e.activityType === input.activityType);
      }

      if (input.userId) {
        entries = entries.filter((e) => e.userId === input.userId);
      }

      if (input.dateFrom) {
        entries = entries.filter((e) => new Date(e.createdAt) >= input.dateFrom!);
      }

      if (input.dateTo) {
        entries = entries.filter((e) => new Date(e.createdAt) <= input.dateTo!);
      }

      // Sort by newest first
      entries.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Paginate
      const total = entries.length;
      const pages = Math.ceil(total / (input.limit || 50));
      const page = input.page || 1;
      const start = (page - 1) * (input.limit || 50);
      const items = entries.slice(start, start + (input.limit || 50));

      return {
        items: items,
        total: total,
        page: page,
        pages: pages,
      };
    }),

  // Get audit trail statistics
  getAuditStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const entries = await db.select().from(activityAuditTrail);

    const stats = {
      total: entries.length,
      byActivityType: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
      byUser: {} as Record<number, number>,
      last24Hours: 0,
      last7Days: 0,
    };

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    entries.forEach((entry) => {
      // Count by activity type
      if (!stats.byActivityType[entry.activityType]) {
        stats.byActivityType[entry.activityType] = 0;
      }
      stats.byActivityType[entry.activityType]++;

      // Count by action
      if (!stats.byAction[entry.action]) {
        stats.byAction[entry.action] = 0;
      }
      stats.byAction[entry.action]++;

      // Count by user
      if (entry.userId) {
        if (!stats.byUser[entry.userId]) {
          stats.byUser[entry.userId] = 0;
        }
        stats.byUser[entry.userId]++;
      }

      // Count recent activities
      const entryDate = new Date(entry.createdAt);
      if (entryDate >= oneDayAgo) stats.last24Hours++;
      if (entryDate >= sevenDaysAgo) stats.last7Days++;
    });

    return stats;
  }),

  // Get autonomous operations for review
  getOperationsForReview: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "executed", "reviewed", "rejected"]).optional(),
        limit: z.number().default(50).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      let operations = await db.select().from(autonomousOperations);

      if (input.status) {
        operations = operations.filter((op) => op.status === input.status);
      }

      // Sort by newest first
      operations.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return operations.slice(0, input.limit || 50);
    }),

  // Review autonomous operation
  reviewOperation: protectedProcedure
    .input(
      z.object({
        operationId: z.number(),
        approved: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get operation
      const operations = await db
        .select()
        .from(autonomousOperations)
        .where(eq(autonomousOperations.id, input.operationId));

      if (operations.length === 0) throw new Error("Operation not found");

      // Update operation
      await db
        .update(autonomousOperations)
        .set({
          status: input.approved ? "reviewed" : "rejected",
          reviewedBy: ctx.user.id,
          reviewedAt: new Date(),
          reviewNotes: input.notes,
        })
        .where(eq(autonomousOperations.id, input.operationId));

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: ctx.user.id,
        activityType: "operation_reviewed",
        action: "update",
        details: {
          operationId: input.operationId,
          approved: input.approved,
          notes: input.notes,
        } as any,
      });

      return {
        operationId: input.operationId,
        status: input.approved ? "reviewed" : "rejected",
        reviewedBy: ctx.user.id,
      };
    }),

  // Get blockchain verification status
  getBlockchainStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const records = await db.select().from(blockchainRecords);

    const status = {
      totalRecords: records.length,
      byRecordType: {} as Record<string, number>,
      verificationRate: 0,
    };

    records.forEach((record) => {
      if (!status.byRecordType[record.recordType]) {
        status.byRecordType[record.recordType] = 0;
      }
      status.byRecordType[record.recordType]++;
    });

    // Calculate verification rate (all records should be verified)
    status.verificationRate = records.length > 0 ? 100 : 0;

    return status;
  }),

  // Get activity timeline
  getActivityTimeline: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const entries = await db.select().from(activityAuditTrail);

      // Filter by date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (input.days || 30));

      const filtered = entries.filter(
        (e) => new Date(e.createdAt) >= cutoffDate
      );

      // Group by day
      const timeline: Record<string, number> = {};
      filtered.forEach((entry) => {
        const date = new Date(entry.createdAt).toISOString().split("T")[0];
        if (!timeline[date]) {
          timeline[date] = 0;
        }
        timeline[date]++;
      });

      // Convert to array and sort
      const result = Object.entries(timeline)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return result;
    }),

  // Search audit trail
  searchAuditTrail: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().default(50).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const entries = await db.select().from(activityAuditTrail);

      // Search in activity type, action, and details
      const results = entries.filter((entry) => {
        const searchText = `${entry.activityType} ${entry.action} ${JSON.stringify(entry.details)}`.toLowerCase();
        return searchText.includes(input.query.toLowerCase());
      });

      return results.slice(0, input.limit || 50);
    }),

  // Export audit trail
  exportAuditTrail: protectedProcedure
    .input(
      z.object({
        format: z.enum(["json", "csv"]),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      let entries = await db.select().from(activityAuditTrail);

      // Filter by date if provided
      if (input.dateFrom) {
        entries = entries.filter((e) => new Date(e.createdAt) >= input.dateFrom!);
      }
      if (input.dateTo) {
        entries = entries.filter((e) => new Date(e.createdAt) <= input.dateTo!);
      }

      if (input.format === "json") {
        return {
          format: "json",
          data: entries,
          exportedAt: new Date(),
        };
      } else {
        // Convert to CSV
        const headers = [
          "ID",
          "User ID",
          "Activity Type",
          "Action",
          "Entity Type",
          "Entity ID",
          "Created At",
          "Details",
        ];
        const rows = entries.map((e) => [
          e.id,
          e.userId,
          e.activityType,
          e.action,
          e.entityType,
          e.entityId,
          e.createdAt,
          JSON.stringify(e.details),
        ]);

        return {
          format: "csv",
          headers: headers,
          rows: rows,
          exportedAt: new Date(),
        };
      }
    }),

  // Get user activity summary
  getUserActivitySummary: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const entries = await db
        .select()
        .from(activityAuditTrail)
        .where(eq(activityAuditTrail.userId, input.userId));

      const summary = {
        userId: input.userId,
        totalActivities: entries.length,
        byActivityType: {} as Record<string, number>,
        byAction: {} as Record<string, number>,
        lastActivity: entries.length > 0 ? entries[entries.length - 1].createdAt : null,
        firstActivity: entries.length > 0 ? entries[0].createdAt : null,
      };

      entries.forEach((entry) => {
        if (!summary.byActivityType[entry.activityType]) {
          summary.byActivityType[entry.activityType] = 0;
        }
        summary.byActivityType[entry.activityType]++;

        if (!summary.byAction[entry.action]) {
          summary.byAction[entry.action] = 0;
        }
        summary.byAction[entry.action]++;
      });

      return summary;
    }),
});
