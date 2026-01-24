import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const enhancedDonationsRouter = router({
  // ==================== DONOR TIERS ====================
  
  getDonorTiers: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.execute(sql`
        SELECT * FROM donor_tiers WHERE is_active = TRUE ORDER BY tier_level ASC
      `);
      return result[0];
    }),

  // Calculate donor tier based on lifetime giving
  calculateDonorTier: publicProcedure
    .input(z.object({ lifetimeGiving: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.execute(sql`
        SELECT * FROM donor_tiers 
        WHERE is_active = TRUE 
        AND min_lifetime_giving <= ${input.lifetimeGiving}
        AND (max_lifetime_giving IS NULL OR max_lifetime_giving >= ${input.lifetimeGiving})
        ORDER BY tier_level DESC
        LIMIT 1
      `);
      return (result[0] as any[])[0] || null;
    }),

  // ==================== DONATION CAMPAIGNS ====================
  
  getCampaigns: publicProcedure
    .input(z.object({
      status: z.enum(['all', 'draft', 'active', 'paused', 'completed', 'cancelled']).default('active'),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const status = input?.status || 'active';
      
      let query = sql`SELECT * FROM donation_campaigns WHERE 1=1`;
      if (status !== 'all') {
        query = sql`${query} AND status = ${status}`;
      }
      query = sql`${query} ORDER BY start_date DESC`;
      
      const result = await db.execute(query);
      return result[0];
    }),

  getCampaignById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.execute(sql`
        SELECT * FROM donation_campaigns WHERE id = ${input.id}
      `);
      return (result[0] as any[])[0] || null;
    }),

  createCampaign: protectedProcedure
    .input(z.object({
      campaignName: z.string().min(1),
      campaignSlug: z.string().optional(),
      description: z.string().optional(),
      goalAmount: z.number().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      campaignType: z.enum(['general', 'capital', 'emergency', 'program', 'matching', 'annual']).default('general'),
      matchingEnabled: z.boolean().default(false),
      matchingRatio: z.number().default(1.0),
      matchingCap: z.number().optional(),
      matchingSponsor: z.string().optional(),
      designation: z.string().optional(),
      thankYouMessage: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const slug = input.campaignSlug || input.campaignName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      await db.execute(sql`
        INSERT INTO donation_campaigns (
          campaign_name, campaign_slug, description, goal_amount, start_date, end_date,
          campaign_type, matching_enabled, matching_ratio, matching_cap, matching_sponsor,
          designation, thank_you_message, created_by, status
        ) VALUES (
          ${input.campaignName}, ${slug}, ${input.description || null}, ${input.goalAmount || null},
          ${input.startDate}, ${input.endDate || null}, ${input.campaignType},
          ${input.matchingEnabled}, ${input.matchingRatio}, ${input.matchingCap || null},
          ${input.matchingSponsor || null}, ${input.designation || null},
          ${input.thankYouMessage || null}, ${ctx.user.id}, 'active'
        )
      `);
      
      return { success: true, message: 'Campaign created successfully' };
    }),

  updateCampaignProgress: protectedProcedure
    .input(z.object({
      campaignId: z.number(),
      donationAmount: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db.execute(sql`
        UPDATE donation_campaigns 
        SET raised_amount = raised_amount + ${input.donationAmount},
            donor_count = donor_count + 1
        WHERE id = ${input.campaignId}
      `);
      
      return { success: true };
    }),

  // ==================== RECURRING DONATIONS ====================
  
  getRecurringDonations: protectedProcedure
    .input(z.object({
      status: z.enum(['all', 'active', 'paused', 'cancelled', 'failed']).default('all'),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const status = input?.status || 'all';
      
      let query = sql`SELECT * FROM recurring_donations WHERE 1=1`;
      if (status !== 'all') {
        query = sql`${query} AND status = ${status}`;
      }
      query = sql`${query} ORDER BY created_at DESC`;
      
      const result = await db.execute(query);
      return result[0];
    }),

  createRecurringDonation: protectedProcedure
    .input(z.object({
      donorName: z.string(),
      donorEmail: z.string().email(),
      amount: z.number().min(1),
      frequency: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual']).default('monthly'),
      paymentMethod: z.string().optional(),
      stripeSubscriptionId: z.string().optional(),
      startDate: z.string(),
      campaignId: z.number().optional(),
      designation: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Calculate next charge date based on frequency
      const frequencyDays: Record<string, number> = {
        monthly: 30,
        quarterly: 90,
        semi_annual: 180,
        annual: 365,
      };
      
      await db.execute(sql`
        INSERT INTO recurring_donations (
          donor_id, donor_name, donor_email, amount, frequency, payment_method,
          stripe_subscription_id, start_date, next_charge_date, campaign_id, designation, status
        ) VALUES (
          ${ctx.user.id}, ${input.donorName}, ${input.donorEmail}, ${input.amount},
          ${input.frequency}, ${input.paymentMethod || null}, ${input.stripeSubscriptionId || null},
          ${input.startDate}, DATE_ADD(${input.startDate}, INTERVAL ${frequencyDays[input.frequency]} DAY),
          ${input.campaignId || null}, ${input.designation || null}, 'active'
        )
      `);
      
      return { success: true, message: 'Recurring donation created' };
    }),

  updateRecurringDonationStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['active', 'paused', 'cancelled']),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db.execute(sql`
        UPDATE recurring_donations SET status = ${input.status} WHERE id = ${input.id}
      `);
      
      return { success: true };
    }),

  // ==================== DONOR PROFILES ====================
  
  getDonorProfile: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const userId = input?.userId || ctx.user.id;
      
      const result = await db.execute(sql`
        SELECT dp.*, dt.tier_name, dt.benefits, dt.color_code
        FROM donor_profiles dp
        LEFT JOIN donor_tiers dt ON dp.current_tier_id = dt.id
        WHERE dp.user_id = ${userId}
      `);
      return (result[0] as any[])[0] || null;
    }),

  createOrUpdateDonorProfile: protectedProcedure
    .input(z.object({
      donorName: z.string(),
      donorEmail: z.string().email().optional(),
      donorPhone: z.string().optional(),
      donorAddress: z.string().optional(),
      donorCity: z.string().optional(),
      donorState: z.string().optional(),
      donorZip: z.string().optional(),
      donorType: z.enum(['individual', 'corporation', 'foundation', 'estate', 'daf', 'other']).default('individual'),
      organizationName: z.string().optional(),
      preferredContactMethod: z.enum(['email', 'phone', 'mail']).default('email'),
      isAnonymous: z.boolean().default(false),
      honorMemorialName: z.string().optional(),
      honorMemorialType: z.enum(['in_honor', 'in_memory']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Check if profile exists
      const existing = await db.execute(sql`
        SELECT id FROM donor_profiles WHERE user_id = ${ctx.user.id}
      `);
      
      if ((existing[0] as any[]).length > 0) {
        // Update existing
        await db.execute(sql`
          UPDATE donor_profiles SET
            donor_name = ${input.donorName},
            donor_email = ${input.donorEmail || null},
            donor_phone = ${input.donorPhone || null},
            donor_address = ${input.donorAddress || null},
            donor_city = ${input.donorCity || null},
            donor_state = ${input.donorState || null},
            donor_zip = ${input.donorZip || null},
            donor_type = ${input.donorType},
            organization_name = ${input.organizationName || null},
            preferred_contact_method = ${input.preferredContactMethod},
            is_anonymous = ${input.isAnonymous},
            honor_memorial_name = ${input.honorMemorialName || null},
            honor_memorial_type = ${input.honorMemorialType || null}
          WHERE user_id = ${ctx.user.id}
        `);
      } else {
        // Create new
        await db.execute(sql`
          INSERT INTO donor_profiles (
            user_id, donor_name, donor_email, donor_phone, donor_address,
            donor_city, donor_state, donor_zip, donor_type, organization_name,
            preferred_contact_method, is_anonymous, honor_memorial_name, honor_memorial_type
          ) VALUES (
            ${ctx.user.id}, ${input.donorName}, ${input.donorEmail || null},
            ${input.donorPhone || null}, ${input.donorAddress || null},
            ${input.donorCity || null}, ${input.donorState || null}, ${input.donorZip || null},
            ${input.donorType}, ${input.organizationName || null},
            ${input.preferredContactMethod}, ${input.isAnonymous},
            ${input.honorMemorialName || null}, ${input.honorMemorialType || null}
          )
        `);
      }
      
      return { success: true };
    }),

  // Update donor stats after a donation
  updateDonorStats: protectedProcedure
    .input(z.object({
      donorId: z.number(),
      donationAmount: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Update donor profile stats
      await db.execute(sql`
        UPDATE donor_profiles SET
          lifetime_giving = lifetime_giving + ${input.donationAmount},
          ytd_giving = ytd_giving + ${input.donationAmount},
          donation_count = donation_count + 1,
          last_donation_date = CURDATE(),
          first_donation_date = COALESCE(first_donation_date, CURDATE())
        WHERE id = ${input.donorId}
      `);
      
      // Get updated lifetime giving to calculate new tier
      const profile = await db.execute(sql`
        SELECT lifetime_giving FROM donor_profiles WHERE id = ${input.donorId}
      `);
      const lifetimeGiving = (profile[0] as any[])[0]?.lifetime_giving || 0;
      
      // Calculate and update tier
      const tier = await db.execute(sql`
        SELECT id FROM donor_tiers 
        WHERE is_active = TRUE 
        AND min_lifetime_giving <= ${lifetimeGiving}
        AND (max_lifetime_giving IS NULL OR max_lifetime_giving >= ${lifetimeGiving})
        ORDER BY tier_level DESC
        LIMIT 1
      `);
      
      if ((tier[0] as any[]).length > 0) {
        await db.execute(sql`
          UPDATE donor_profiles SET current_tier_id = ${(tier[0] as any[])[0].id}
          WHERE id = ${input.donorId}
        `);
      }
      
      return { success: true };
    }),

  // ==================== DONOR ACKNOWLEDGMENTS ====================
  
  createAcknowledgment: protectedProcedure
    .input(z.object({
      donationId: z.number().optional(),
      donorId: z.number(),
      donorName: z.string(),
      donorEmail: z.string().email(),
      donorAddress: z.string().optional(),
      donationAmount: z.number(),
      donationDate: z.string(),
      acknowledgmentType: z.enum(['receipt', 'thank_you', 'annual_summary', 'tax_letter']).default('receipt'),
      letterContent: z.string().optional(),
      sentMethod: z.enum(['email', 'mail', 'both']).default('email'),
      taxYear: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const taxYear = input.taxYear || new Date().getFullYear();
      
      // Generate letter content if not provided
      let letterContent = input.letterContent;
      if (!letterContent) {
        letterContent = `Dear ${input.donorName},

Thank you for your generous donation of $${input.donationAmount.toFixed(2)} to L.A.W.S. Collective on ${input.donationDate}.

Your contribution supports our mission of building generational wealth and empowering communities through the L.A.W.S. framework (Land, Air, Water, Self).

This letter serves as your official receipt for tax purposes. L.A.W.S. Collective is a 508(c)(1)(a) tax-exempt organization. No goods or services were provided in exchange for this contribution.

With gratitude,
L.A.W.S. Collective Leadership`;
      }
      
      await db.execute(sql`
        INSERT INTO donor_acknowledgments (
          donation_id, donor_id, donor_name, donor_email, donor_address,
          donation_amount, donation_date, acknowledgment_type, letter_content,
          sent_method, tax_year, sent_date
        ) VALUES (
          ${input.donationId || null}, ${input.donorId}, ${input.donorName},
          ${input.donorEmail}, ${input.donorAddress || null}, ${input.donationAmount},
          ${input.donationDate}, ${input.acknowledgmentType}, ${letterContent},
          ${input.sentMethod}, ${taxYear}, NOW()
        )
      `);
      
      return { success: true, message: 'Acknowledgment created and sent' };
    }),

  getAcknowledgments: protectedProcedure
    .input(z.object({
      donorId: z.number().optional(),
      taxYear: z.number().optional(),
      type: z.enum(['all', 'receipt', 'thank_you', 'annual_summary', 'tax_letter']).default('all'),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let query = sql`SELECT * FROM donor_acknowledgments WHERE 1=1`;
      
      if (input?.donorId) {
        query = sql`${query} AND donor_id = ${input.donorId}`;
      }
      if (input?.taxYear) {
        query = sql`${query} AND tax_year = ${input.taxYear}`;
      }
      if (input?.type && input.type !== 'all') {
        query = sql`${query} AND acknowledgment_type = ${input.type}`;
      }
      
      query = sql`${query} ORDER BY created_at DESC`;
      
      const result = await db.execute(query);
      return result[0];
    }),

  // ==================== DONATION DASHBOARD ====================
  
  getDonationDashboard: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return null;
      
      // Total donations
      const totals = await db.execute(sql`
        SELECT 
          COUNT(*) as total_donations,
          COALESCE(SUM(amount), 0) as total_raised,
          COUNT(DISTINCT donor_email) as unique_donors
        FROM donations_508
      `);
      
      // Recurring donations
      const recurring = await db.execute(sql`
        SELECT 
          COUNT(*) as active_recurring,
          COALESCE(SUM(amount), 0) as monthly_recurring_value
        FROM recurring_donations
        WHERE status = 'active'
      `);
      
      // Active campaigns
      const campaigns = await db.execute(sql`
        SELECT 
          COUNT(*) as active_campaigns,
          COALESCE(SUM(raised_amount), 0) as campaign_raised,
          COALESCE(SUM(goal_amount), 0) as campaign_goals
        FROM donation_campaigns
        WHERE status = 'active'
      `);
      
      // Donor tier distribution
      const tierDistribution = await db.execute(sql`
        SELECT dt.tier_name, dt.color_code, COUNT(dp.id) as donor_count
        FROM donor_tiers dt
        LEFT JOIN donor_profiles dp ON dt.id = dp.current_tier_id
        WHERE dt.is_active = TRUE
        GROUP BY dt.id, dt.tier_name, dt.color_code
        ORDER BY dt.tier_level ASC
      `);
      
      // Recent donations
      const recentDonations = await db.execute(sql`
        SELECT * FROM donations_508 ORDER BY created_at DESC LIMIT 10
      `);
      
      // YTD by month
      const monthlyTrend = await db.execute(sql`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as donation_count,
          SUM(amount) as total_amount
        FROM donations_508
        WHERE YEAR(created_at) = YEAR(CURDATE())
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
      `);
      
      return {
        totals: (totals[0] as any[])[0],
        recurring: (recurring[0] as any[])[0],
        campaigns: (campaigns[0] as any[])[0],
        tierDistribution: tierDistribution[0],
        recentDonations: recentDonations[0],
        monthlyTrend: monthlyTrend[0],
      };
    }),
});
