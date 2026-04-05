import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  generateOneTimeThankYouEmail,
  generateRecurringThankYouEmail,
  generateRecurringPaymentEmail,
  generatePaymentFailedEmail,
  sendDonationThankYouEmail,
  getEmailTemplates,
  DonationDetails,
} from "../services/donor-email";

const donationDetailsSchema = z.object({
  donorName: z.string(),
  donorEmail: z.string().email(),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  frequency: z.enum(["one_time", "monthly", "quarterly", "annual"]),
  designation: z.string().optional(),
  tributeType: z.enum(["none", "in_honor", "in_memory"]).optional(),
  tributeName: z.string().optional(),
  transactionId: z.string(),
  transactionDate: z.string().transform((s) => new Date(s)),
  isAnonymous: z.boolean().default(false),
});

export const donorEmailRouter = router({
  /**
   * Get list of available email templates
   */
  getTemplates: publicProcedure.query(() => {
    return getEmailTemplates();
  }),

  /**
   * Preview an email template with sample data
   */
  previewTemplate: protectedProcedure
    .input(
      z.object({
        templateType: z.enum([
          "one_time_thank_you",
          "recurring_thank_you",
          "recurring_payment",
          "payment_failed",
        ]),
        donation: donationDetailsSchema.optional(),
      })
    )
    .query(({ input }) => {
      // Use sample data if no donation provided
      const donation: DonationDetails = input.donation || {
        donorName: "Sample Donor",
        donorEmail: "donor@example.com",
        amount: 100,
        currency: "USD",
        frequency: input.templateType.includes("recurring") ? "monthly" : "one_time",
        designation: "education",
        tributeType: "none",
        transactionId: "txn_sample123456",
        transactionDate: new Date(),
        isAnonymous: false,
      };

      switch (input.templateType) {
        case "one_time_thank_you":
          return generateOneTimeThankYouEmail(donation);
        case "recurring_thank_you":
          return generateRecurringThankYouEmail({ ...donation, frequency: donation.frequency === "one_time" ? "monthly" : donation.frequency });
        case "recurring_payment":
          return generateRecurringPaymentEmail({ ...donation, frequency: donation.frequency === "one_time" ? "monthly" : donation.frequency }, 1);
        case "payment_failed":
          return generatePaymentFailedEmail({ ...donation, frequency: donation.frequency === "one_time" ? "monthly" : donation.frequency });
        default:
          return generateOneTimeThankYouEmail(donation);
      }
    }),

  /**
   * Send a thank-you email for a donation
   */
  sendThankYou: protectedProcedure
    .input(donationDetailsSchema)
    .mutation(async ({ input }) => {
      const result = await sendDonationThankYouEmail(input);
      return result;
    }),

  /**
   * Manually trigger thank-you email for a specific transaction
   */
  resendThankYou: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        donorEmail: z.string().email(),
        donorName: z.string(),
        amount: z.number().positive(),
        frequency: z.enum(["one_time", "monthly", "quarterly", "annual"]),
        transactionDate: z.string().transform((s) => new Date(s)),
      })
    )
    .mutation(async ({ input }) => {
      const donation: DonationDetails = {
        ...input,
        currency: "USD",
        isAnonymous: false,
      };
      
      const result = await sendDonationThankYouEmail(donation);
      return result;
    }),
});
