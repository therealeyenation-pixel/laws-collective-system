import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { COLLECTIVE_TIERS, ACADEMY_PASS, REVENUE_ALLOCATION } from "../stripe/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// Valid paid plan IDs
const PAID_COLLECTIVE_TIERS = ["member", "builder"] as const;
type PaidTier = (typeof PAID_COLLECTIVE_TIERS)[number];

export const stripeCheckoutRouter = router({
  // Get all plan pricing (public — shown on pricing page before login)
  getPlanPricing: publicProcedure.query(async () => {
    const tiers = Object.entries(COLLECTIVE_TIERS).map(([key, tier]) => ({
      id: key,
      name: tier.name,
      description: tier.description,
      monthlyPrice: tier.monthlyPrice ? tier.monthlyPrice / 100 : 0,
      annualPrice: tier.annualPrice ? tier.annualPrice / 100 : 0,
      features: [...tier.features],
      cta: tier.cta,
      highlighted: tier.highlighted,
      isCustom: tier.monthlyPrice === null,
    }));

    const academy = {
      id: ACADEMY_PASS.id,
      name: ACADEMY_PASS.name,
      description: ACADEMY_PASS.description,
      monthlyPrice: ACADEMY_PASS.monthlyPrice / 100,
      annualPrice: ACADEMY_PASS.annualPrice / 100,
      features: [...ACADEMY_PASS.features],
      notes: [...ACADEMY_PASS.notes],
      cta: ACADEMY_PASS.cta,
    };

    return { tiers, academy };
  }),

  // Create Collective membership checkout session
  createMembershipCheckout: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["member", "builder"]),
        billingInterval: z.enum(["monthly", "annual"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tierConfig = COLLECTIVE_TIERS[input.tier];
      const price =
        input.billingInterval === "annual"
          ? tierConfig.annualPrice!
          : tierConfig.monthlyPrice!;
      const interval = input.billingInterval === "annual" ? "year" : "month";
      const origin = ctx.req?.headers?.origin || "https://finmap-spwuc63a.manus.space";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `L.A.W.S. Collective — ${tierConfig.name}`,
                description: tierConfig.description,
              },
              unit_amount: price,
              recurring: { interval, interval_count: 1 },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/getting-started?session_id={CHECKOUT_SESSION_ID}&tier=${input.tier}`,
        cancel_url: `${origin}/pricing`,
        customer_email: ctx.user?.email,
        client_reference_id: ctx.user?.id.toString(),
        metadata: {
          user_id: ctx.user?.id.toString(),
          customer_email: ctx.user?.email,
          customer_name: ctx.user?.name,
          tier: input.tier,
          billing_interval: input.billingInterval,
          type: "collective_membership",
          academy_allocation_cents: (tierConfig as any).academyAllocation?.toString() || "0",
          collective_allocation_cents: (tierConfig as any).collectiveAllocation?.toString() || "0",
        },
        allow_promotion_codes: true,
      });

      return { sessionId: session.id, url: session.url };
    }),

  // Create Academy Pass checkout session
  createAcademyCheckout: protectedProcedure
    .input(
      z.object({
        billingInterval: z.enum(["monthly", "annual"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const price =
        input.billingInterval === "annual"
          ? ACADEMY_PASS.annualPrice
          : ACADEMY_PASS.monthlyPrice;
      const interval = input.billingInterval === "annual" ? "year" : "month";
      const origin = ctx.req?.headers?.origin || "https://finmap-spwuc63a.manus.space";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "LuvOnPurpose Academy Pass",
                description: ACADEMY_PASS.description,
              },
              unit_amount: price,
              recurring: { interval, interval_count: 1 },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/academy/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/academy`,
        customer_email: ctx.user?.email,
        client_reference_id: ctx.user?.id.toString(),
        metadata: {
          user_id: ctx.user?.id.toString(),
          customer_email: ctx.user?.email,
          customer_name: ctx.user?.name,
          type: "academy_pass",
          billing_interval: input.billingInterval,
          academy_allocation_cents: ACADEMY_PASS.academyAllocation.toString(),
          collective_allocation_cents: "0",
        },
        allow_promotion_codes: true,
      });

      return { sessionId: session.id, url: session.url };
    }),

  // Create one-time donation/support payment
  createDonation: publicProcedure
    .input(
      z.object({
        amount: z.number().min(1),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const origin = (ctx as any).req?.headers?.origin || "https://finmap-spwuc63a.manus.space";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Support the L.A.W.S. Collective Mission",
                description: input.message || "One-time contribution to the L.A.W.S. Collective",
              },
              unit_amount: Math.round(input.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/?donation=success`,
        cancel_url: `${origin}/?donation=cancelled`,
        metadata: {
          type: "donation",
          message: input.message || "",
        },
      });

      return { sessionId: session.id, url: session.url };
    }),

  // Partner application (no payment — application-based)
  submitPartnerApplication: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(1),
        businessType: z.string().min(1),
        yearsInOperation: z.number().min(0),
        reason: z.string().min(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Store application — for now just return success
      // In production this would save to DB and notify the owner
      console.log(`[Partner Application] from ${ctx.user?.name}: ${input.businessName}`);
      return {
        success: true,
        message: "Your Collective Partner application has been submitted. We will review and contact you within 5 business days.",
      };
    }),

  // Get checkout session details
  getCheckoutSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);
      return {
        id: session.id,
        status: session.payment_status,
        customer: session.customer_email,
        amount: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      };
    }),

  // Get subscription details
  getSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .query(async ({ input }) => {
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
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ input }) => {
      const subscription = await stripe.subscriptions.update(input.subscriptionId, {
        cancel_at_period_end: true,
      });
      return {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    }),
});
