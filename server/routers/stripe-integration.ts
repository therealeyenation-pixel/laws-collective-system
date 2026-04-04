import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import mysql from "mysql2/promise";

export const stripeIntegrationRouter = router({
  getPricingTiers: publicProcedure.query(async () => {
    try {
      return {
        success: true,
        tiers: [
          {
            id: "basic",
            name: "Basic - Free",
            price: 0,
            features: ["All base channels (10)", "SD quality (480p)", "Ad-supported", "1 concurrent stream"],
            stripePriceId: null
          },
          {
            id: "verified_21",
            name: "Verified 21+",
            price: 4.99,
            features: ["All base + verified channels", "HD quality (720p)", "Reduced ads", "2 concurrent streams", "Age-gated content"],
            stripePriceId: process.env.STRIPE_PRICE_VERIFIED_21 || "price_verified_21"
          },
          {
            id: "premium",
            name: "Premium",
            price: 9.99,
            features: ["All channels (76+)", "4K quality (1080p+)", "Ad-free", "4 concurrent streams", "Offline downloads", "Priority support"],
            stripePriceId: process.env.STRIPE_PRICE_PREMIUM || "price_premium"
          }
        ]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        tiers: []
      };
    }
  }),

  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new Error("User not authenticated");
      }

      const conn = await mysql.createConnection(process.env.DATABASE_URL || "");
      
      const [subscriptions] = await conn.execute(
        `SELECT * FROM user_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [ctx.user.id]
      ) as any;

      await conn.end();

      if (subscriptions.length === 0) {
        return {
          success: true,
          tier: "basic",
          status: "inactive",
          subscription: null
        };
      }

      const sub = subscriptions[0];
      return {
        success: true,
        tier: sub.tier,
        status: sub.status,
        subscription: {
          id: sub.stripe_subscription_id,
          startDate: sub.created_at,
          renewalDate: sub.renewal_date,
          cancelledAt: sub.cancelled_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        tier: "basic",
        status: "error"
      };
    }
  })
});
