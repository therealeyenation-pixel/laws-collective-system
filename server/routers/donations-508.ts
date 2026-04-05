import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

// Organization details for receipts
const ORGANIZATION = {
  name: "LuvOnPurpose Academy and Outreach",
  type: "508(c)(1)(a) Faith-Based Organization",
  taxStatement: "This donation is tax-deductible to the extent allowed by law. No goods or services were provided in exchange for this contribution. LuvOnPurpose Academy and Outreach is a 508(c)(1)(a) faith-based organization.",
};

// Excluded fund codes (LLC only, not eligible for 508 donations)
const EXCLUDED_FUND_CODES = ["CONTRACTS", "LEGAL"];

export const donations508Router = router({
  // Get available donation funds (508-eligible only)
  getFunds: publicProcedure.query(async () => {
    const db = await getDb();
    const [funds] = await db.execute(`
      SELECT id, fund_name, fund_code, description, is_active
      FROM donation_funds 
      WHERE is_eligible_for_508 = 1 AND is_active = 1
      ORDER BY fund_name
    `);
    return funds as any[];
  }),

  // Get all funds (admin view)
  getAllFunds: protectedProcedure.query(async () => {
    const db = await getDb();
    const [funds] = await db.execute(`
      SELECT id, fund_name, fund_code, description, entity_type, 
             is_eligible_for_508, is_active, created_at
      FROM donation_funds 
      ORDER BY entity_type, fund_name
    `);
    return funds as any[];
  }),

  // Create Stripe checkout session for donation
  createDonationCheckout: publicProcedure
    .input(
      z.object({
        amountCents: z.number().min(100), // Minimum $1
        fundCode: z.string().optional().default("GENERAL"),
        donorName: z.string().optional(),
        donorEmail: z.string().email(),
        isRecurring: z.boolean().optional().default(false),
        recurringFrequency: z.enum(["monthly", "quarterly", "annually"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate fund is 508-eligible
      if (EXCLUDED_FUND_CODES.includes(input.fundCode.toUpperCase())) {
        throw new Error(
          "This fund is not eligible for tax-deductible donations. Please select a different allocation."
        );
      }

      const db = await getDb();
      
      // Verify fund exists and is eligible
      const [funds] = await db.execute(
        `SELECT id, fund_name FROM donation_funds WHERE fund_code = ? AND is_eligible_for_508 = 1`,
        [input.fundCode]
      );
      const fundArray = funds as any[];
      if (fundArray.length === 0) {
        throw new Error("Invalid fund selected");
      }
      const fund = fundArray[0];

      // Get origin for redirect URLs
      const origin = ctx.req?.headers?.origin || "https://localhost:3000";

      // Create Stripe checkout session
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        mode: input.isRecurring ? "subscription" : "payment",
        customer_email: input.donorEmail,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Donation to ${ORGANIZATION.name}`,
                description: `${fund.fund_name} - Tax-deductible contribution`,
              },
              unit_amount: input.amountCents,
              ...(input.isRecurring && {
                recurring: {
                  interval: input.recurringFrequency === "annually" ? "year" : 
                           input.recurringFrequency === "quarterly" ? "month" : "month",
                  interval_count: input.recurringFrequency === "quarterly" ? 3 : 1,
                },
              }),
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/donate?canceled=true`,
        metadata: {
          donation_type: "508",
          fund_id: fund.id.toString(),
          fund_code: input.fundCode,
          donor_name: input.donorName || "",
          is_recurring: input.isRecurring ? "true" : "false",
          notes: input.notes || "",
        },
      };

      const session = await stripe.checkout.sessions.create(sessionConfig);

      // Create pending donation record
      const now = Date.now();
      await db.execute(
        `INSERT INTO donations_508 
         (donor_name, donor_email, amount_cents, fund_id, allocation_type, 
          payment_method, stripe_checkout_session_id, payment_status, 
          is_recurring, recurring_frequency, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'stripe', ?, 'pending', ?, ?, ?, ?, ?)`,
        [
          input.donorName || null,
          input.donorEmail,
          input.amountCents,
          fund.id,
          input.fundCode.toLowerCase(),
          session.id,
          input.isRecurring ? 1 : 0,
          input.recurringFrequency || null,
          input.notes || null,
          now,
          now,
        ]
      );

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  // Record manual donation (cash, check, transfer)
  recordManualDonation: protectedProcedure
    .input(
      z.object({
        donorName: z.string(),
        donorEmail: z.string().email(),
        donorAddress: z.string().optional(),
        amountCents: z.number().min(100),
        fundCode: z.string().default("GENERAL"),
        paymentMethod: z.enum(["cash", "check", "transfer", "other"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Validate fund is 508-eligible
      if (EXCLUDED_FUND_CODES.includes(input.fundCode.toUpperCase())) {
        throw new Error(
          "This fund is not eligible for tax-deductible donations."
        );
      }

      const db = await getDb();
      
      // Verify fund exists
      const [funds] = await db.execute(
        `SELECT id FROM donation_funds WHERE fund_code = ? AND is_eligible_for_508 = 1`,
        [input.fundCode]
      );
      const fundArray = funds as any[];
      if (fundArray.length === 0) {
        throw new Error("Invalid fund selected");
      }

      const now = Date.now();
      const receiptNumber = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Insert donation
      const [result] = await db.execute(
        `INSERT INTO donations_508 
         (donor_name, donor_email, donor_address, amount_cents, fund_id, 
          allocation_type, payment_method, payment_status, receipt_number,
          notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?)`,
        [
          input.donorName,
          input.donorEmail,
          input.donorAddress || null,
          input.amountCents,
          fundArray[0].id,
          input.fundCode.toLowerCase(),
          input.paymentMethod,
          receiptNumber,
          input.notes || null,
          now,
          now,
        ]
      );

      const donationId = (result as any).insertId;

      // Generate receipt
      await db.execute(
        `INSERT INTO donation_receipts 
         (donation_id, receipt_number, receipt_year, amount_cents, donor_name,
          donor_address, organization_name, tax_deductible_statement, generated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          donationId,
          receiptNumber,
          new Date().getFullYear(),
          input.amountCents,
          input.donorName,
          input.donorAddress || null,
          ORGANIZATION.name,
          ORGANIZATION.taxStatement,
          now,
        ]
      );

      return {
        success: true,
        donationId,
        receiptNumber,
      };
    }),

  // Complete donation after Stripe webhook
  completeDonation: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        paymentIntentId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      const receiptNumber = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Update donation status
      await db.execute(
        `UPDATE donations_508 
         SET payment_status = 'completed', 
             stripe_payment_intent_id = ?,
             receipt_number = ?,
             updated_at = ?
         WHERE stripe_checkout_session_id = ?`,
        [input.paymentIntentId || null, receiptNumber, now, input.sessionId]
      );

      // Get donation details for receipt
      const [donations] = await db.execute(
        `SELECT id, donor_name, donor_email, donor_address, amount_cents
         FROM donations_508 WHERE stripe_checkout_session_id = ?`,
        [input.sessionId]
      );
      const donationArray = donations as any[];
      
      if (donationArray.length > 0) {
        const donation = donationArray[0];
        
        // Generate receipt
        await db.execute(
          `INSERT INTO donation_receipts 
           (donation_id, receipt_number, receipt_year, amount_cents, donor_name,
            donor_address, organization_name, tax_deductible_statement, generated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            donation.id,
            receiptNumber,
            new Date().getFullYear(),
            donation.amount_cents,
            donation.donor_name || "Anonymous",
            donation.donor_address || null,
            ORGANIZATION.name,
            ORGANIZATION.taxStatement,
            now,
          ]
        );
      }

      return { success: true, receiptNumber };
    }),

  // Get donation history (for logged-in donors)
  getMyDonations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [donations] = await db.execute(
      `SELECT d.*, f.fund_name, r.receipt_number as receipt_num
       FROM donations_508 d
       LEFT JOIN donation_funds f ON d.fund_id = f.id
       LEFT JOIN donation_receipts r ON d.id = r.donation_id
       WHERE d.donor_user_id = ?
       ORDER BY d.created_at DESC`,
      [ctx.user.id]
    );
    return donations as any[];
  }),

  // Get all donations (admin)
  getAllDonations: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        fundCode: z.string().optional(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      
      let query = `
        SELECT d.*, f.fund_name, f.fund_code
        FROM donations_508 d
        LEFT JOIN donation_funds f ON d.fund_id = f.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (input.status) {
        query += ` AND d.payment_status = ?`;
        params.push(input.status);
      }
      if (input.fundCode) {
        query += ` AND f.fund_code = ?`;
        params.push(input.fundCode);
      }

      query += ` ORDER BY d.created_at DESC LIMIT ? OFFSET ?`;
      params.push(input.limit, input.offset);

      const [donations] = await db.execute(query, params);
      
      // Get total count
      const [countResult] = await db.execute(
        `SELECT COUNT(*) as total FROM donations_508`
      );
      const total = (countResult as any[])[0]?.total || 0;

      return {
        donations: donations as any[],
        total,
      };
    }),

  // Get donation summary (admin dashboard)
  getDonationSummary: protectedProcedure.query(async () => {
    const db = await getDb();
    
    // Total donations
    const [totalResult] = await db.execute(`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(amount_cents), 0) as total_amount
      FROM donations_508 
      WHERE payment_status = 'completed'
    `);
    
    // By fund
    const [byFund] = await db.execute(`
      SELECT 
        f.fund_name,
        f.fund_code,
        COUNT(d.id) as donation_count,
        COALESCE(SUM(d.amount_cents), 0) as total_amount
      FROM donation_funds f
      LEFT JOIN donations_508 d ON f.id = d.fund_id AND d.payment_status = 'completed'
      WHERE f.is_eligible_for_508 = 1
      GROUP BY f.id, f.fund_name, f.fund_code
      ORDER BY total_amount DESC
    `);

    // This year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1).getTime();
    const [thisYear] = await db.execute(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(amount_cents), 0) as amount
      FROM donations_508 
      WHERE payment_status = 'completed' AND created_at >= ?
    `, [yearStart]);

    // This month
    const monthStart = new Date(currentYear, new Date().getMonth(), 1).getTime();
    const [thisMonth] = await db.execute(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(amount_cents), 0) as amount
      FROM donations_508 
      WHERE payment_status = 'completed' AND created_at >= ?
    `, [monthStart]);

    const total = (totalResult as any[])[0];
    const yearData = (thisYear as any[])[0];
    const monthData = (thisMonth as any[])[0];

    return {
      allTime: {
        count: total?.total_count || 0,
        amountCents: total?.total_amount || 0,
      },
      thisYear: {
        count: yearData?.count || 0,
        amountCents: yearData?.amount || 0,
      },
      thisMonth: {
        count: monthData?.count || 0,
        amountCents: monthData?.amount || 0,
      },
      byFund: byFund as any[],
      organization: ORGANIZATION,
    };
  }),

  // Get receipt details
  getReceipt: protectedProcedure
    .input(z.object({ receiptNumber: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [receipts] = await db.execute(
        `SELECT r.*, d.donor_email, d.payment_method, d.created_at as donation_date,
                f.fund_name
         FROM donation_receipts r
         JOIN donations_508 d ON r.donation_id = d.id
         LEFT JOIN donation_funds f ON d.fund_id = f.id
         WHERE r.receipt_number = ?`,
        [input.receiptNumber]
      );
      
      const receiptArray = receipts as any[];
      if (receiptArray.length === 0) {
        throw new Error("Receipt not found");
      }

      return receiptArray[0];
    }),

  // Record donation to LuvLedger
  recordToLuvLedger: protectedProcedure
    .input(z.object({ donationId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      // Get donation details
      const [donations] = await db.execute(
        `SELECT d.*, f.fund_name, f.fund_code
         FROM donations_508 d
         LEFT JOIN donation_funds f ON d.fund_id = f.id
         WHERE d.id = ?`,
        [input.donationId]
      );
      
      const donationArray = donations as any[];
      if (donationArray.length === 0) {
        throw new Error("Donation not found");
      }
      
      const donation = donationArray[0];
      const now = Date.now();

      // Create LuvLedger entry
      const [ledgerResult] = await db.execute(
        `INSERT INTO luv_ledger_transactions 
         (entity_type, entity_id, transaction_type, amount_cents, currency,
          description, reference_type, reference_id, created_at)
         VALUES ('508_academy', 1, 'donation_received', ?, 'USD', ?, 'donation', ?, ?)`,
        [
          donation.amount_cents,
          `Donation to ${donation.fund_name || 'General'} from ${donation.donor_name || 'Anonymous'}`,
          donation.id,
          now,
        ]
      );

      // Update donation with ledger ID
      const ledgerId = (ledgerResult as any).insertId;
      await db.execute(
        `UPDATE donations_508 SET luv_ledger_id = ? WHERE id = ?`,
        [ledgerId, input.donationId]
      );

      return { success: true, ledgerId };
    }),
});
