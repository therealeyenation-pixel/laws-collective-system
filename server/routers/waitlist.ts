import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { waitlistSignups } from "../../drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

async function requireDb() {
  const database = await getDb();
  if (!database) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not initialized",
    });
  }
  return database;
}

export const waitlistRouter = router({
  // Public: Join the waitlist
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        fullName: z.string().optional(),
        businessName: z.string().optional(),
        interestCategories: z.array(z.string()).optional(),
        source: z.string().default("landing_page"),
        referralCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const database = await requireDb();

        // Check if email already exists
        const [existing] = await database
          .select()
          .from(waitlistSignups)
          .where(eq(waitlistSignups.email, input.email))
          .limit(1);

        if (existing) {
          return {
            success: true,
            message: "You're already on our waitlist! We'll notify you when we launch.",
            isNew: false,
          };
        }

        // Create new waitlist signup
        await database.insert(waitlistSignups).values({
          email: input.email,
          fullName: input.fullName,
          businessName: input.businessName,
          interestCategories: input.interestCategories || [],
          source: input.source,
          referralCode: input.referralCode,
        });

        return {
          success: true,
          message: "Welcome to the L.A.W.S. Collective! You're on the list.",
          isNew: true,
        };
      } catch (error) {
        console.error("[Waitlist] Signup error:", error);
        return {
          success: false,
          message: "Failed to join waitlist. Please try again.",
          isNew: false,
        };
      }
    }),

  // Public: Get waitlist count (for social proof)
  getCount: publicProcedure.query(async () => {
    try {
      const database = await requireDb();
      const [result] = await database
        .select({ count: sql<number>`COUNT(*)` })
        .from(waitlistSignups);
      return { count: result?.count || 0 };
    } catch (error) {
      console.error("[Waitlist] Count error:", error);
      return { count: 0 };
    }
  }),

  // Public: Check if email is on waitlist
  getStatus: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      try {
        const database = await requireDb();
        const [signup] = await database
          .select()
          .from(waitlistSignups)
          .where(eq(waitlistSignups.email, input.email))
          .limit(1);

        if (!signup) {
          return { onWaitlist: false, status: null };
        }
        return {
          onWaitlist: true,
          status: signup.status,
          joinedAt: signup.createdAt,
        };
      } catch (error) {
        console.error("[Waitlist] Status check error:", error);
        return { onWaitlist: false, status: null };
      }
    }),

  // Admin: list all signups
  listAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
    try {
      const database = await requireDb();
      const signups = await database
        .select()
        .from(waitlistSignups)
        .orderBy(desc(waitlistSignups.createdAt))
        .limit(500);
      return signups;
    } catch (error) {
      console.error("[Waitlist] listAll error:", error);
      return [];
    }
  }),

  // Admin: get waitlist analytics
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
    try {
      const database = await requireDb();
      const allSignups = await database
        .select()
        .from(waitlistSignups)
        .orderBy(desc(waitlistSignups.createdAt));

      // Interest category breakdown
      const interestCounts: Record<string, number> = {};
      allSignups.forEach((s: any) => {
        const categories = s.interestCategories || [];
        if (Array.isArray(categories)) {
          categories.forEach((cat: string) => {
            interestCounts[cat] = (interestCounts[cat] || 0) + 1;
          });
        }
      });

      // Source breakdown
      const sourceCounts: Record<string, number> = {};
      allSignups.forEach((s: any) => {
        const source = s.source || "direct";
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      // Signups by day (last 30 days)
      const dailySignups: Record<string, number> = {};
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dailySignups[d.toISOString().slice(0, 10)] = 0;
      }
      allSignups.forEach((s: any) => {
        const day = new Date(s.createdAt).toISOString().slice(0, 10);
        if (dailySignups[day] !== undefined) {
          dailySignups[day]++;
        }
      });

      // Referral tracking
      const referralCount = allSignups.filter((s: any) => s.referralCode).length;

      return {
        interestCounts,
        sourceCounts,
        dailySignups,
        referralCount,
        totalSignups: allSignups.length,
      };
    } catch (error) {
      console.error("[Waitlist] Analytics error:", error);
      return {
        interestCounts: {},
        sourceCounts: {},
        dailySignups: {},
        referralCount: 0,
        totalSignups: 0,
      };
    }
  }),

  // Admin: update signup status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "unsubscribed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const database = await requireDb();

      await database
        .update(waitlistSignups)
        .set({
          status: input.status,
          ...(input.status === "confirmed" ? { confirmedAt: new Date() } : {}),
        })
        .where(eq(waitlistSignups.id, input.id));

      return { success: true };
    }),
});
