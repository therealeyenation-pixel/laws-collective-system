import { Request, Response } from "express";
import Stripe from "stripe";
import { db } from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events for webhook verification
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[Stripe Webhook] Error processing event:`, error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const type = session.metadata?.type;

  console.log(`[Stripe] Checkout completed for user ${userId}, type: ${type}`);

  if (!userId) {
    console.error("[Stripe] No user_id in session metadata");
    return;
  }

  if (type === "membership") {
    const tier = session.metadata?.membership_tier;
    console.log(`[Stripe] Membership subscription created: ${tier}`);
    
    // Update user's membership tier in database
    // This would be implemented based on your user schema
    // await db.execute(sql`UPDATE users SET membership_tier = ${tier} WHERE id = ${userId}`);
  } else if (type === "merchandise") {
    const items = session.metadata?.items;
    console.log(`[Stripe] Merchandise order placed: ${items}`);
    
    // Create order record in database
    // This would be implemented based on your orders schema
  }

  // Record revenue transaction for 60/40 split tracking
  if (session.amount_total && session.amount_total > 0) {
    console.log(`[Stripe] Recording revenue: $${(session.amount_total / 100).toFixed(2)}`);
    // await recordRevenueTransaction(userId, session.amount_total, type);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log(`[Stripe] Subscription ${subscription.id} status: ${subscription.status}`);
  
  // Update user's subscription status in database
  // This would be implemented based on your user schema
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log(`[Stripe] Subscription ${subscription.id} canceled`);
  
  // Update user's membership tier to free
  // This would be implemented based on your user schema
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Stripe] Invoice ${invoice.id} paid: $${((invoice.amount_paid || 0) / 100).toFixed(2)}`);
  
  // Record recurring revenue for 60/40 split tracking
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Stripe] Payment failed for invoice ${invoice.id}`);
  
  // Notify user of failed payment
  // This would trigger an email or in-app notification
}
