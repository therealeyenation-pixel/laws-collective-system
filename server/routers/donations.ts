import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const donationsRouter = router({
  // Get donation dashboard stats (admin)
  getDashboard: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const donations = await db.execute(
      sql`SELECT 
        COUNT(*) as total_donations,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_raised,
        SUM(CASE WHEN donation_type = 'recurring' THEN 1 ELSE 0 END) as recurring_donors,
        COUNT(DISTINCT donor_email) as unique_donors,
        AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as avg_donation
      FROM donations`
    );

    const campaigns = await db.execute(
      sql`SELECT id, name, goal_amount, raised_amount, is_active,
        ROUND((raised_amount / goal_amount) * 100, 1) as progress_percent
      FROM donation_campaigns WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 5`
    );

    const recentDonations = await db.execute(
      sql`SELECT id, donor_name, amount, donation_type, status, created_at, is_anonymous
      FROM donations ORDER BY created_at DESC LIMIT 10`
    );

    const stats = (donations as any[])[0] || {};
    return {
      totalDonations: Number(stats.total_donations) || 0,
      totalRaised: Number(stats.total_raised) || 0,
      recurringDonors: Number(stats.recurring_donors) || 0,
      uniqueDonors: Number(stats.unique_donors) || 0,
      avgDonation: Number(stats.avg_donation) || 0,
      activeCampaigns: campaigns as any[],
      recentDonations: recentDonations as any[],
    };
  }),

  // Submit a donation (public)
  submitDonation: publicProcedure
    .input(
      z.object({
        donorName: z.string().optional(),
        donorEmail: z.string().email(),
        donorPhone: z.string().optional(),
        donorAddress: z.string().optional(),
        amount: z.number().positive(),
        donationType: z.enum(["one_time", "recurring", "pledge", "in_kind"]).default("one_time"),
        paymentMethod: z.enum(["credit_card", "bank_transfer", "check", "cash", "paypal", "other"]).default("credit_card"),
        campaignId: z.number().optional(),
        designation: z.string().optional(),
        isAnonymous: z.boolean().default(false),
        notes: z.string().optional(),
        // For recurring donations
        frequency: z.enum(["weekly", "monthly", "quarterly", "annually"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Generate tax receipt number
      const taxReceiptNumber = `LOP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const donorName = input.isAnonymous ? "Anonymous" : (input.donorName || "Anonymous");

      // Insert donation
      await db.execute(
        sql`INSERT INTO donations (
          donor_name, donor_email, donor_phone, donor_address, amount,
          donation_type, payment_method, campaign_id, designation,
          is_anonymous, tax_receipt_number, notes, status
        ) VALUES (${donorName}, ${input.donorEmail}, ${input.donorPhone || null},
          ${input.donorAddress || null}, ${input.amount}, ${input.donationType},
          ${input.paymentMethod}, ${input.campaignId || null}, ${input.designation || null},
          ${input.isAnonymous}, ${taxReceiptNumber}, ${input.notes || null}, 'completed')`
      );

      // Update campaign raised amount if applicable
      if (input.campaignId) {
        await db.execute(
          sql`UPDATE donation_campaigns SET raised_amount = raised_amount + ${input.amount} WHERE id = ${input.campaignId}`
        );
      }

      // If recurring, create recurring donation record
      if (input.donationType === "recurring" && input.frequency) {
        const startDate = new Date();
        let nextChargeDate = new Date();
        
        switch (input.frequency) {
          case "weekly":
            nextChargeDate.setDate(nextChargeDate.getDate() + 7);
            break;
          case "monthly":
            nextChargeDate.setMonth(nextChargeDate.getMonth() + 1);
            break;
          case "quarterly":
            nextChargeDate.setMonth(nextChargeDate.getMonth() + 3);
            break;
          case "annually":
            nextChargeDate.setFullYear(nextChargeDate.getFullYear() + 1);
            break;
        }

        const startDateStr = startDate.toISOString().split("T")[0];
        const nextChargeDateStr = nextChargeDate.toISOString().split("T")[0];

        await db.execute(
          sql`INSERT INTO recurring_donations (
            donor_name, donor_email, amount, frequency, payment_method,
            campaign_id, designation, start_date, next_charge_date,
            status, total_donated, donation_count, last_donation_date
          ) VALUES (${input.donorName || 'Anonymous'}, ${input.donorEmail}, ${input.amount},
            ${input.frequency}, ${input.paymentMethod}, ${input.campaignId || null},
            ${input.designation || null}, ${startDateStr}, ${nextChargeDateStr},
            'active', ${input.amount}, 1, ${startDateStr})`
        );
      }

      return {
        success: true,
        taxReceiptNumber,
        message: "Thank you for your generous donation!",
      };
    }),

  // Get active campaigns (public)
  getActiveCampaigns: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const campaigns = await db.execute(
      sql`SELECT id, name, description, goal_amount, raised_amount, start_date, end_date, image_url,
        ROUND((raised_amount / goal_amount) * 100, 1) as progress_percent
      FROM donation_campaigns 
      WHERE is_active = TRUE AND (end_date IS NULL OR end_date >= CURDATE())
      ORDER BY created_at DESC`
    );

    return campaigns as any[];
  }),

  // Create campaign (admin)
  createCampaign: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        goalAmount: z.number().positive(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(
        sql`INSERT INTO donation_campaigns (name, description, goal_amount, start_date, end_date, image_url)
        VALUES (${input.name}, ${input.description || null}, ${input.goalAmount},
          ${input.startDate || null}, ${input.endDate || null}, ${input.imageUrl || null})`
      );

      return { success: true };
    }),

  // Get all donations (admin)
  getAllDonations: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        campaignId: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let baseQuery = sql`SELECT d.*, c.name as campaign_name 
        FROM donations d 
        LEFT JOIN donation_campaigns c ON d.campaign_id = c.id
        WHERE 1=1`;

      if (input.status) {
        baseQuery = sql`${baseQuery} AND d.status = ${input.status}`;
      }
      if (input.campaignId) {
        baseQuery = sql`${baseQuery} AND d.campaign_id = ${input.campaignId}`;
      }

      baseQuery = sql`${baseQuery} ORDER BY d.created_at DESC LIMIT ${input.limit} OFFSET ${input.offset}`;

      const donations = await db.execute(baseQuery);
      return donations as any[];
    }),

  // Get recurring donations (admin)
  getRecurringDonations: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const recurring = await db.execute(
      sql`SELECT * FROM recurring_donations ORDER BY created_at DESC`
    );

    return recurring as any[];
  }),

  // Generate tax receipt letter
  generateTaxReceipt: protectedProcedure
    .input(z.object({ donationId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const donations = await db.execute(
        sql`SELECT * FROM donations WHERE id = ${input.donationId}`
      );

      const donation = (donations as any[])[0];
      if (!donation) throw new Error("Donation not found");

      // Mark receipt as sent
      await db.execute(
        sql`UPDATE donations SET tax_receipt_sent = TRUE, tax_receipt_sent_at = NOW() WHERE id = ${input.donationId}`
      );

      // Return receipt data for PDF generation
      return {
        receiptNumber: donation.tax_receipt_number,
        donorName: donation.donor_name,
        donorAddress: donation.donor_address,
        amount: donation.amount,
        date: donation.created_at,
        designation: donation.designation,
        organizationInfo: {
          name: "LuvOnPurpose",
          type: "508(c)(1)(a) Faith-Based Organization",
          ein: "[EIN NUMBER]",
          address: "[ORGANIZATION ADDRESS]",
          statement: "No goods or services were provided in exchange for this contribution. This letter serves as your official receipt for tax purposes. LuvOnPurpose is a 508(c)(1)(a) faith-based organization. Contributions may be tax-deductible to the extent allowed by law. Please consult your tax advisor.",
        },
      };
    }),

  // Get tax-exempt info (public)
  getTaxExemptInfo: publicProcedure.query(async () => {
    return {
      organizationType: "508(c)(1)(a) Faith-Based Organization",
      name: "LuvOnPurpose",
      description: "LuvOnPurpose operates as a 508(c)(1)(a) faith-based organization. Under Section 508(c)(1)(A) of the Internal Revenue Code, churches and their integrated auxiliaries are automatically exempt from federal income tax without having to file for 501(c)(3) status.",
      taxDeductibility: "Contributions to LuvOnPurpose may be tax-deductible to the extent allowed by law. Donors should consult their tax advisor regarding the deductibility of their contributions.",
      receiptPolicy: "All donors will receive an acknowledgment letter that can be used for tax purposes. For donations of $250 or more, a written acknowledgment is required by the IRS.",
    };
  }),
});
