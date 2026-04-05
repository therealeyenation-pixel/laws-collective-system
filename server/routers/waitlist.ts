import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { createWaitlistSignup, getWaitlistSignupByEmail } from "../db";

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
});
