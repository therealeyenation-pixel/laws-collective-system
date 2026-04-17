import { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { coursePurchases, consultingBookings, activityAuditTrail, luvLedgerAccounts, luvLedgerTransactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

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
  const db = await getDb();
  if (!db) {
    console.error("[Stripe] Database unavailable");
    return;
  }

  const productType = session.metadata?.product_type;
  const productId = session.metadata?.product_id;
  const customerEmail = session.metadata?.customer_email || session.customer_email;
  const customerName = session.metadata?.customer_name;
  const userId = session.metadata?.user_id;
  const type = session.metadata?.type;
  const donationType = session.metadata?.donation_type;

  console.log(`[Stripe] Checkout completed: type=${productType || type || donationType}, product=${productId}`);

  // Handle course purchases
  if (productType === "course") {
    console.log(`[Stripe] Processing course purchase: ${productId} for ${customerEmail}`);
    
    try {
      // Update course purchase record
      await db
        .update(coursePurchases)
        .set({
          paymentStatus: "completed",
          accessGranted: true,
          completedAt: new Date(),
        })
        .where(eq(coursePurchases.stripeSessionId, session.id));

      // Record in LuvLedger for Academy entity (Education Engine)
      const academyAccount = await db
        .select()
        .from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.accountName, "Academy Revenue"))
        .limit(1);

      if (academyAccount.length > 0) {
        const amount = (session.amount_total || 0) / 100;
        const newBalance = (parseFloat(academyAccount[0].balance || "0") + amount).toFixed(2);
        await db
          .update(luvLedgerAccounts)
          .set({ balance: newBalance })
          .where(eq(luvLedgerAccounts.id, academyAccount[0].id));

        // Record transaction
        await db.insert(luvLedgerTransactions).values({
          accountId: academyAccount[0].id,
          transactionType: "credit",
          amount: amount.toFixed(2),
          description: `Course purchase: ${productId}`,
          reference: session.id,
          category: "course_sale",
        });
      }

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: userId ? parseInt(userId) : null,
        activityType: "course_purchase",
        action: "purchase",
        details: {
          productId,
          customerEmail,
          amount: (session.amount_total || 0) / 100,
          stripeSessionId: session.id,
        } as any,
      });

      console.log(`[Stripe] Course purchase completed successfully`);
    } catch (error) {
      console.error(`[Stripe] Error processing course purchase:`, error);
    }
    return;
  }

  // Handle consulting bookings
  if (productType === "consulting") {
    console.log(`[Stripe] Processing consulting booking: ${productId} for ${customerEmail}`);
    
    try {
      await db
        .update(consultingBookings)
        .set({
          paymentStatus: "completed",
          sessionStatus: "pending_scheduling",
        })
        .where(eq(consultingBookings.stripeSessionId, session.id));

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        userId: userId ? parseInt(userId) : null,
        activityType: "consulting_booking",
        action: "purchase",
        details: {
          productId,
          customerEmail,
          customerName,
          amount: (session.amount_total || 0) / 100,
          stripeSessionId: session.id,
        } as any,
      });

      console.log(`[Stripe] Consulting booking completed successfully`);
    } catch (error) {
      console.error(`[Stripe] Error processing consulting booking:`, error);
    }
    return;
  }

  // Handle donations
  if (donationType) {
    const amount = (session.amount_total || 0) / 100;
    const designation = session.metadata?.designation || "where_needed";
    const tributeType = session.metadata?.tribute_type || "none";
    const tributeName = session.metadata?.tribute_name;
    const donorName = session.metadata?.donor_name;
    const isAnonymous = session.metadata?.is_anonymous === "true";

    console.log(`[Stripe] Donation received: $${amount.toFixed(2)}`);
    console.log(`[Stripe] Donation type: ${donationType}, designation: ${designation}`);

    try {
      // Record donation in LuvLedger for 508(c)(1)(a) entity
      const templeAccount = await db
        .select()
        .from(luvLedgerAccounts)
        .where(eq(luvLedgerAccounts.accountName, "Temple Donations"))
        .limit(1);

      if (templeAccount.length > 0) {
        const newBalance = (parseFloat(templeAccount[0].balance || "0") + amount).toFixed(2);
        await db
          .update(luvLedgerAccounts)
          .set({ balance: newBalance })
          .where(eq(luvLedgerAccounts.id, templeAccount[0].id));

        const tributeInfo = tributeName ? ` (${tributeType}: ${tributeName})` : "";
        await db.insert(luvLedgerTransactions).values({
          accountId: templeAccount[0].id,
          transactionType: "credit",
          amount: amount.toFixed(2),
          description: `Donation: ${designation}${tributeInfo}`,
          reference: session.id,
          category: "donation",
        });
      }

      // Log to audit trail
      await db.insert(activityAuditTrail).values({
        activityType: "donation_received",
        action: "donate",
        details: {
          amount,
          designation,
          tributeType,
          tributeName,
          donorName: isAnonymous ? "Anonymous" : donorName,
          stripeSessionId: session.id,
        } as any,
      });
    } catch (error) {
      console.error(`[Stripe] Error recording donation:`, error);
    }
    return;
  }

  // Handle membership subscriptions with entity revenue splitting
  if (type === "collective_membership" || type === "academy_pass") {
    const tier = session.metadata?.tier;
    const amount = (session.amount_total || 0) / 100;
    console.log(`[Stripe] Membership/Academy payment: $${amount.toFixed(2)}, tier=${tier}, type=${type}`);

    try {
      // Entity account IDs in LuvLedger:
      // 8 = Education Platform Account (Academy / 508 entity)
      // 7 = Commercial Engine Account (L.A.W.S. Collective LLC)
      const ACADEMY_ACCOUNT_ID = 8;
      const COLLECTIVE_ACCOUNT_ID = 7;

      if (type === "academy_pass") {
        // Standalone Academy Pass: 100% to Academy entity
        await recordEntityRevenue(db, ACADEMY_ACCOUNT_ID, amount, `Academy Pass enrollment`, session.id);
        console.log(`[Stripe] Academy revenue: $${amount.toFixed(2)} → Academy entity (100%)`);
      } else {
        // Collective membership: split 30% Academy / 70% Collective
        const academyShare = Math.round(amount * 30) / 100; // 30%
        const collectiveShare = amount - academyShare; // 70%

        await recordEntityRevenue(db, ACADEMY_ACCOUNT_ID, academyShare, `Membership allocation (30%): ${tier}`, session.id);
        await recordEntityRevenue(db, COLLECTIVE_ACCOUNT_ID, collectiveShare, `Membership revenue (70%): ${tier}`, session.id);

        // Record the allocation transaction between entities
        await db.insert(luvLedgerTransactions).values({
          fromAccountId: COLLECTIVE_ACCOUNT_ID,
          toAccountId: ACADEMY_ACCOUNT_ID,
          amount: academyShare.toFixed(8),
          transactionType: "allocation",
          description: `Internal allocation: 30% of ${tier} membership ($${amount.toFixed(2)}) to Academy entity`,
          status: "confirmed",
          confirmedAt: new Date(),
        });

        console.log(`[Stripe] Membership split: $${academyShare.toFixed(2)} → Academy (30%), $${collectiveShare.toFixed(2)} → Collective (70%)`);
      }

      // Audit trail
      await db.insert(activityAuditTrail).values({
        userId: session.metadata?.user_id ? parseInt(session.metadata.user_id) : null,
        activityType: "membership_payment",
        action: "purchase",
        details: {
          type,
          tier,
          amount,
          academyShare: type === "academy_pass" ? amount : Math.round(amount * 30) / 100,
          collectiveShare: type === "academy_pass" ? 0 : amount - Math.round(amount * 30) / 100,
          stripeSessionId: session.id,
        } as any,
      });
    } catch (error) {
      console.error(`[Stripe] Error processing membership revenue split:`, error);
    }
    return;
  }

  // Handle merchandise
  if (type === "merchandise") {
    const items = session.metadata?.items;
    console.log(`[Stripe] Merchandise order placed: ${items}`);
  }

  // Record general revenue for other payment types
  if (session.amount_total && session.amount_total > 0) {
    const amount = session.amount_total / 100;
    console.log(`[Stripe] Recording general revenue: $${amount.toFixed(2)}`);
    try {
      await recordEntityRevenue(db, 7, amount, `Revenue: ${type || "general"}`, session.id);
    } catch (error) {
      console.error(`[Stripe] Error recording revenue:`, error);
    }
  }
}

/** Helper: credit an entity account and record the income transaction */
async function recordEntityRevenue(db: any, accountId: number, amount: number, description: string, reference: string) {
  // Update account balance
  const [account] = await db
    .select()
    .from(luvLedgerAccounts)
    .where(eq(luvLedgerAccounts.id, accountId))
    .limit(1);

  if (account) {
    const newBalance = (parseFloat(account.balance || "0") + amount).toFixed(8);
    await db
      .update(luvLedgerAccounts)
      .set({ balance: newBalance })
      .where(eq(luvLedgerAccounts.id, accountId));
  }

  // Record income transaction
  await db.insert(luvLedgerTransactions).values({
    fromAccountId: accountId,
    toAccountId: accountId,
    amount: amount.toFixed(8),
    transactionType: "income",
    description,
    status: "confirmed",
    confirmedAt: new Date(),
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log(`[Stripe] Subscription ${subscription.id} status: ${subscription.status}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log(`[Stripe] Subscription ${subscription.id} canceled`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Stripe] Invoice ${invoice.id} paid: $${((invoice.amount_paid || 0) / 100).toFixed(2)}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Stripe] Payment failed for invoice ${invoice.id}`);
}
