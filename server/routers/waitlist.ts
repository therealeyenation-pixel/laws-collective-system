import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { createWaitlistSignup, getWaitlistSignupByEmail, getAllWaitlistSignups } from "../db";
import { getDb } from "../db";
import { waitlistSignups } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const waitlistRouter = router({
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        businessName: z.string().optional(),
        source: z.string().default("demo"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if email already exists
        const existing = await getWaitlistSignupByEmail(input.email);
        if (existing) {
          return {
            success: true,
            message: "You're already on our waitlist!",
            isNew: false,
          };
        }

        // Create new waitlist signup
        await createWaitlistSignup(input.email, input.businessName, input.source);

        return {
          success: true,
          message: "Thank you for joining our waitlist!",
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

  getStatus: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      try {
        const signup = await getWaitlistSignupByEmail(input.email);
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
      const signups = await getAllWaitlistSignups(500, 0);
      return signups;
    } catch (error) {
      console.error("[Waitlist] listAll error:", error);
      return [];
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
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(waitlistSignups)
        .set({
          status: input.status,
          ...(input.status === "confirmed" ? { confirmedAt: new Date() } : {}),
        })
        .where(eq(waitlistSignups.id, input.id));

      return { success: true };
    }),
});
