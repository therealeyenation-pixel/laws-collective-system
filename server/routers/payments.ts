import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import Stripe from "stripe";
import { MEMBERSHIP_PRODUCTS, MERCHANDISE_PRODUCTS } from "../stripe/products";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export const paymentsRouter = router({
  // Create checkout session for membership subscription
  createMembershipCheckout: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["academy", "houseBuilder", "foundingMember"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = MEMBERSHIP_PRODUCTS[input.tier];
      
      if (!product || product.price === 0) {
        throw new Error("Invalid membership tier");
      }

      const origin = ctx.req.headers.origin || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        allow_promotion_codes: true,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
              recurring: {
                interval: product.interval || "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
          membership_tier: input.tier,
          type: "membership",
        },
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing?canceled=true`,
      });

      return { checkoutUrl: session.url };
    }),

  // Create checkout session for merchandise purchase
  createMerchandiseCheckout: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
            size: z.string().optional(),
            color: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const origin = ctx.req.headers.origin || "http://localhost:3000";

      const lineItems = input.items.map((item) => {
        const product = MERCHANDISE_PRODUCTS.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        let description = product.description;
        if (item.size) description += ` | Size: ${item.size}`;
        if (item.color) description += ` | Color: ${item.color}`;

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description,
            },
            unit_amount: product.price,
          },
          quantity: item.quantity,
        };
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        allow_promotion_codes: true,
        line_items: lineItems,
        shipping_address_collection: {
          allowed_countries: ["US"],
        },
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
          type: "merchandise",
          items: JSON.stringify(input.items),
        },
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/shop?canceled=true`,
      });

      return { checkoutUrl: session.url };
    }),

  // Get checkout session details
  getCheckoutSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
        expand: ["line_items", "customer"],
      });

      return {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_email,
        metadata: session.metadata,
      };
    }),

  // Get user's payment history
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    // In a real implementation, you would query your database for stored payment records
    // For now, we return a placeholder
    return {
      payments: [],
      subscriptions: [],
    };
  }),

  // Get available membership products
  getMembershipProducts: publicProcedure.query(() => {
    return Object.entries(MEMBERSHIP_PRODUCTS).map(([key, product]) => ({
      key,
      ...product,
      priceFormatted: product.price === 0 ? "Free" : `$${(product.price / 100).toFixed(2)}`,
    }));
  }),

  // Get available merchandise products
  getMerchandiseProducts: publicProcedure.query(() => {
    return MERCHANDISE_PRODUCTS.map((product) => ({
      ...product,
      priceFormatted: `$${(product.price / 100).toFixed(2)}`,
    }));
  }),
});
