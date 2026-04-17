import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { db } from "../db";
import { sql } from "drizzle-orm";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  getSystemStats: adminProcedure
    .query(async () => {
      try {
        const [rows] = await db.execute(
          sql`SELECT TABLE_NAME as name, TABLE_ROWS as count FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME`
        );
        return {
          tables: (rows as any[]).map((r: any) => ({
            name: r.name || r.TABLE_NAME,
            count: Number(r.count || r.TABLE_ROWS || 0),
          })),
        };
      } catch {
        return { tables: [] };
      }
    }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
