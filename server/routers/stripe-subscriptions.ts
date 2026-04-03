import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

export const stripeSubscriptionsRouter = router({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        tier: z.enum(["verified_18", "verified_21", "premium"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price: input.priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${ctx.req?.headers.origin || "https://finmap-spwuc63a.manus.space"}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${ctx.req?.headers.origin || "https://finmap-spwuc63a.manus.space"}/subscription-cancel`,
          customer_email: ctx.user?.email,
          client_reference_id: ctx.user?.id.toString(),
          metadata: {
            userId: ctx.user?.id.toString(),
            tier: input.tier,
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Checkout session error:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get user's Stripe customer ID from database
      const connection = await (ctx.db as any).getConnection?.();
      if (!connection) {
        return { subscription: null, status: "no_subscription" };
      }

      const [rows]: any = await connection.execute(
        "SELECT stripe_customer_id FROM users WHERE id = ?",
        [ctx.user?.id]
      );

      if (!rows[0]?.stripe_customer_id) {
        connection.release();
        return { subscription: null, status: "no_subscription" };
      }

      const subscriptions = await stripe.subscriptions.list({
        customer: rows[0].stripe_customer_id,
        status: "active",
        limit: 1,
      });

      connection.release();

      if (subscriptions.data.length === 0) {
        return { subscription: null, status: "no_subscription" };
      }

      const subscription = subscriptions.data[0];
      return {
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          priceId: subscription.items.data[0].price.id,
          tier: subscription.metadata?.tier || "unknown",
        },
        status: subscription.status,
      };
    } catch (error) {
      console.error("Get subscription error:", error);
      return { subscription: null, status: "error" };
    }
  }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const connection = await (ctx.db as any).getConnection?.();
      if (!connection) {
        throw new Error("Database connection failed");
      }

      const [rows]: any = await connection.execute(
        "SELECT stripe_customer_id FROM users WHERE id = ?",
        [ctx.user?.id]
      );

      if (!rows[0]?.stripe_customer_id) {
        connection.release();
        throw new Error("No Stripe customer found");
      }

      const subscriptions = await stripe.subscriptions.list({
        customer: rows[0].stripe_customer_id,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        connection.release();
        throw new Error("No active subscription found");
      }

      await stripe.subscriptions.cancel(subscriptions.data[0].id);

      connection.release();
      return { success: true, message: "Subscription cancelled" };
    } catch (error) {
      console.error("Cancel subscription error:", error);
      throw new Error("Failed to cancel subscription");
    }
  }),

  getSubscriptionPlans: protectedProcedure.query(async () => {
    return {
      plans: [
        {
          id: "verified_18",
          name: "Verified 18+",
          price: 4.99,
          currency: "USD",
          interval: "month",
          description: "Access to 18+ content",
          features: [
            "Access to 18+ rated content",
            "Ad-free streaming",
            "HD quality",
          ],
        },
        {
          id: "verified_21",
          name: "Verified 21+",
          price: 9.99,
          currency: "USD",
          interval: "month",
          description: "Access to 21+ restricted content",
          features: [
            "Access to 21+ restricted content",
            "Ad-free streaming",
            "4K quality",
            "Offline downloads",
          ],
        },
        {
          id: "premium",
          name: "Premium",
          price: 19.99,
          currency: "USD",
          interval: "month",
          description: "Full premium access",
          features: [
            "Access to all content",
            "Ad-free streaming",
            "4K quality",
            "Offline downloads",
            "Priority support",
            "Family sharing (5 users)",
          ],
        },
      ],
    };
  }),
});
