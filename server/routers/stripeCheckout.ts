import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// Plan pricing configuration
const PLANS = {
  starter: {
    name: "Starter",
    price: 4900, // $49.00 in cents
    interval: "month" as const,
    features: ["Basic features", "Up to 5 users", "Email support"],
  },
  professional: {
    name: "Professional",
    price: 14900, // $149.00 in cents
    interval: "month" as const,
    features: ["Advanced features", "Up to 50 users", "Priority support", "API access"],
  },
  enterprise: {
    name: "Enterprise",
    price: 39900, // $399.00 in cents
    interval: "month" as const,
    features: ["All features", "Unlimited users", "24/7 support", "Custom integrations"],
  },
};

export const stripeCheckoutRouter = router({
  // Create checkout session
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["starter", "professional", "enterprise"]),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const planConfig = PLANS[input.plan];
        if (!planConfig) {
          throw new Error("Invalid plan selected");
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${planConfig.name} Plan`,
                  description: planConfig.features.join(", "),
                },
                unit_amount: planConfig.price,
                recurring: {
                  interval: planConfig.interval,
                  interval_count: 1,
                },
              },
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          customer_email: ctx.user?.email,
          client_reference_id: ctx.user?.id.toString(),
          metadata: {
            userId: ctx.user?.id.toString(),
            userEmail: ctx.user?.email,
            userName: ctx.user?.name,
            plan: input.plan,
          },
          allow_promotion_codes: true,
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Error creating checkout session:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  // Create one-time payment session (for donations, etc.)
  createPaymentSession: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: input.description,
                },
                unit_amount: Math.round(input.amount * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          customer_email: ctx.user?.email,
          client_reference_id: ctx.user?.id.toString(),
          metadata: {
            userId: ctx.user?.id.toString(),
            userEmail: ctx.user?.email,
            userName: ctx.user?.name,
            type: "one-time-payment",
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Error creating payment session:", error);
        throw new Error("Failed to create payment session");
      }
    }),

  // Get checkout session details
  getCheckoutSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);

        return {
          id: session.id,
          status: session.payment_status,
          customer: session.customer_email,
          amount: session.amount_total,
          currency: session.currency,
          metadata: session.metadata,
        };
      } catch (error) {
        console.error("Error retrieving checkout session:", error);
        throw new Error("Failed to retrieve checkout session");
      }
    }),

  // Get subscription details
  getSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const subscription = await stripe.subscriptions.retrieve(input.subscriptionId);

        return {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          items: subscription.items.data.map((item) => ({
            id: item.id,
            priceId: item.price.id,
            quantity: item.quantity,
          })),
          metadata: subscription.metadata,
        };
      } catch (error) {
        console.error("Error retrieving subscription:", error);
        throw new Error("Failed to retrieve subscription");
      }
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const subscription = await stripe.subscriptions.update(input.subscriptionId, {
          cancel_at_period_end: true,
        });

        return {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        };
      } catch (error) {
        console.error("Error canceling subscription:", error);
        throw new Error("Failed to cancel subscription");
      }
    }),

  // Get plan pricing
  getPlanPricing: protectedProcedure.query(async () => {
    return Object.entries(PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: plan.price / 100, // Convert back to dollars
      interval: plan.interval,
      features: plan.features,
    }));
  }),
});
