import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateReceiptNumber,
  formatCurrency,
  formatDate,
  getFrequencyText,
  getDesignationText,
  generateTaxReceiptData,
  generateOneTimeThankYouEmail,
  generateRecurringThankYouEmail,
  generateRecurringPaymentEmail,
  generatePaymentFailedEmail,
  sendDonationThankYouEmail,
  sendRecurringPaymentEmail,
  sendPaymentFailedEmail,
  getEmailTemplates,
  DonationDetails,
} from "./donor-email";

// Mock the notification service
vi.mock("../_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Donor Email Service", () => {
  const mockDonation: DonationDetails = {
    donorName: "John Doe",
    donorEmail: "john@example.com",
    amount: 100,
    currency: "USD",
    frequency: "one_time",
    designation: "education",
    tributeType: "none",
    transactionId: "txn_abc123def456",
    transactionDate: new Date("2025-01-15T10:30:00Z"),
    isAnonymous: false,
  };

  describe("generateReceiptNumber", () => {
    it("should generate receipt number with correct format", () => {
      const date = new Date(2025, 0, 15); // January 15, 2025 (local time)
      const receipt = generateReceiptNumber("txn_abc123def456", date);
      expect(receipt).toMatch(/^LAWS-\d{8}-[A-Z0-9]{8}$/);
      expect(receipt).toContain("LAWS-20250115");
    });

    it("should use last 8 characters of transaction ID", () => {
      const receipt = generateReceiptNumber("txn_abc123def456", new Date("2025-01-15"));
      expect(receipt).toContain("23DEF456");
    });

    it("should handle different dates correctly", () => {
      const date1 = new Date(2025, 11, 31); // December 31, 2025 (local time)
      const receipt1 = generateReceiptNumber("txn_test", date1);
      expect(receipt1).toContain("20251231");
      
      const date2 = new Date(2025, 5, 5); // June 5, 2025 (local time)
      const receipt2 = generateReceiptNumber("txn_test", date2);
      expect(receipt2).toContain("20250605");
    });
  });

  describe("formatCurrency", () => {
    it("should format USD correctly", () => {
      expect(formatCurrency(100, "USD")).toBe("$100.00");
      expect(formatCurrency(1000.50, "USD")).toBe("$1,000.50");
      expect(formatCurrency(0.99, "USD")).toBe("$0.99");
    });

    it("should handle different currencies", () => {
      expect(formatCurrency(100, "EUR")).toContain("100");
      expect(formatCurrency(100, "GBP")).toContain("100");
    });

    it("should default to USD", () => {
      expect(formatCurrency(50)).toBe("$50.00");
    });
  });

  describe("formatDate", () => {
    it("should format date in readable format", () => {
      const date = new Date(2025, 0, 15); // January 15, 2025 (local time)
      const formatted = formatDate(date);
      expect(formatted).toContain("January");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2025");
    });
  });

  describe("getFrequencyText", () => {
    it("should return correct frequency text", () => {
      expect(getFrequencyText("one_time")).toBe("one-time");
      expect(getFrequencyText("monthly")).toBe("monthly");
      expect(getFrequencyText("quarterly")).toBe("quarterly");
      expect(getFrequencyText("annual")).toBe("annual");
    });
  });

  describe("getDesignationText", () => {
    it("should return correct designation text", () => {
      expect(getDesignationText("jobs")).toBe("Job Creation & Employment");
      expect(getDesignationText("education")).toBe("Education & Academy");
      expect(getDesignationText("housing")).toBe("Housing & Stability");
      expect(getDesignationText("business")).toBe("Business Development");
      expect(getDesignationText("emergency")).toBe("Emergency Support");
    });

    it("should return default for general/where_needed", () => {
      expect(getDesignationText("general")).toBe("Where Needed Most");
      expect(getDesignationText("where_needed")).toBe("Where Needed Most");
      expect(getDesignationText(undefined)).toBe("Where Needed Most");
    });

    it("should return original value for unknown designations", () => {
      expect(getDesignationText("custom_fund")).toBe("custom_fund");
    });
  });

  describe("generateTaxReceiptData", () => {
    it("should generate complete tax receipt data", () => {
      const receipt = generateTaxReceiptData(mockDonation);
      
      expect(receipt.receiptNumber).toMatch(/^LAWS-/);
      expect(receipt.donorName).toBe("John Doe");
      expect(receipt.amount).toBe(100);
      expect(receipt.currency).toBe("USD");
      expect(receipt.organizationName).toBe("LuvOnPurpose Academy and Outreach");
      expect(receipt.organizationType).toBe("508(c)(1)(a) Tax-Exempt Organization");
      expect(receipt.taxYear).toBe(2025);
      expect(receipt.goodsOrServicesProvided).toBe(false);
    });

    it("should use Anonymous Donor for anonymous donations", () => {
      const anonymousDonation = { ...mockDonation, isAnonymous: true };
      const receipt = generateTaxReceiptData(anonymousDonation);
      expect(receipt.donorName).toBe("Anonymous Donor");
    });
  });

  describe("generateOneTimeThankYouEmail", () => {
    it("should generate complete email template", () => {
      const template = generateOneTimeThankYouEmail(mockDonation);
      
      expect(template.subject).toContain("$100.00");
      expect(template.subject).toContain("Thank You");
      expect(template.htmlBody).toContain("John Doe");
      expect(template.htmlBody).toContain("$100.00");
      expect(template.htmlBody).toContain("Education & Academy");
      expect(template.htmlBody).toContain("LAWS-");
      expect(template.textBody).toContain("John Doe");
    });

    it("should include tribute section when applicable", () => {
      const tributeDonation: DonationDetails = {
        ...mockDonation,
        tributeType: "in_honor",
        tributeName: "Jane Smith",
      };
      const template = generateOneTimeThankYouEmail(tributeDonation);
      
      expect(template.htmlBody).toContain("In Honor of");
      expect(template.htmlBody).toContain("Jane Smith");
      expect(template.textBody).toContain("In Honor of");
    });

    it("should include in memory tribute", () => {
      const tributeDonation: DonationDetails = {
        ...mockDonation,
        tributeType: "in_memory",
        tributeName: "Robert Johnson",
      };
      const template = generateOneTimeThankYouEmail(tributeDonation);
      
      expect(template.htmlBody).toContain("In Memory of");
      expect(template.htmlBody).toContain("Robert Johnson");
    });

    it("should include tax-deductible information", () => {
      const template = generateOneTimeThankYouEmail(mockDonation);
      
      expect(template.htmlBody).toContain("tax-deductible");
      expect(template.htmlBody).toContain("508(c)(1)(a)");
      expect(template.textBody).toContain("tax-deductible");
    });
  });

  describe("generateRecurringThankYouEmail", () => {
    it("should generate recurring donation welcome email", () => {
      const recurringDonation: DonationDetails = {
        ...mockDonation,
        frequency: "monthly",
      };
      const template = generateRecurringThankYouEmail(recurringDonation);
      
      expect(template.subject).toContain("monthly");
      expect(template.subject).toContain("$100.00");
      expect(template.htmlBody).toContain("Welcome to Our Family");
      expect(template.htmlBody).toContain("monthly donor");
      expect(template.htmlBody).toContain("per month");
    });

    it("should include recurring donor benefits", () => {
      const recurringDonation: DonationDetails = {
        ...mockDonation,
        frequency: "monthly",
      };
      const template = generateRecurringThankYouEmail(recurringDonation);
      
      expect(template.htmlBody).toContain("Quarterly impact reports");
      expect(template.htmlBody).toContain("Early access");
      expect(template.htmlBody).toContain("annual donor report");
    });

    it("should handle quarterly frequency", () => {
      const quarterlyDonation: DonationDetails = {
        ...mockDonation,
        frequency: "quarterly",
      };
      const template = generateRecurringThankYouEmail(quarterlyDonation);
      
      expect(template.htmlBody).toContain("per quarter");
      expect(template.subject).toContain("quarterly");
    });

    it("should handle annual frequency", () => {
      const annualDonation: DonationDetails = {
        ...mockDonation,
        frequency: "annual",
      };
      const template = generateRecurringThankYouEmail(annualDonation);
      
      expect(template.htmlBody).toContain("per year");
      expect(template.subject).toContain("annual");
    });
  });

  describe("generateRecurringPaymentEmail", () => {
    it("should generate payment confirmation email", () => {
      const recurringDonation: DonationDetails = {
        ...mockDonation,
        frequency: "monthly",
      };
      const template = generateRecurringPaymentEmail(recurringDonation, 3);
      
      expect(template.subject).toContain("Payment Received");
      expect(template.subject).toContain("monthly");
      expect(template.htmlBody).toContain("Payment #");
      expect(template.htmlBody).toContain("3");
      expect(template.htmlBody).toContain("$100.00");
    });

    it("should include receipt number", () => {
      const recurringDonation: DonationDetails = {
        ...mockDonation,
        frequency: "monthly",
      };
      const template = generateRecurringPaymentEmail(recurringDonation, 1);
      
      expect(template.htmlBody).toContain("LAWS-");
      expect(template.textBody).toContain("Receipt Number");
    });
  });

  describe("generatePaymentFailedEmail", () => {
    it("should generate payment failed notification", () => {
      const recurringDonation: DonationDetails = {
        ...mockDonation,
        frequency: "monthly",
      };
      const template = generatePaymentFailedEmail(recurringDonation);
      
      expect(template.subject).toContain("Action Required");
      expect(template.subject).toContain("Payment Failed");
      expect(template.htmlBody).toContain("unable to process");
      expect(template.htmlBody).toContain("What You Can Do");
    });

    it("should include troubleshooting steps", () => {
      const recurringDonation: DonationDetails = {
        ...mockDonation,
        frequency: "monthly",
      };
      const template = generatePaymentFailedEmail(recurringDonation);
      
      expect(template.htmlBody).toContain("update your payment information");
      expect(template.htmlBody).toContain("expired");
      expect(template.htmlBody).toContain("Contact your bank");
    });
  });

  describe("sendDonationThankYouEmail", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should send thank-you email for one-time donation", async () => {
      const result = await sendDonationThankYouEmail(mockDonation);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should send welcome email for recurring donation", async () => {
      const recurringDonation: DonationDetails = {
        ...mockDonation,
        frequency: "monthly",
      };
      const result = await sendDonationThankYouEmail(recurringDonation);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it("should handle errors gracefully", async () => {
      // Mock console.error to suppress output
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      // Create a donation that will cause an error
      const badDonation = null as unknown as DonationDetails;
      const result = await sendDonationThankYouEmail(badDonation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      consoleSpy.mockRestore();
    });
  });

  describe("sendRecurringPaymentEmail", () => {
    it("should send payment confirmation email", async () => {
      const recurringDonation: DonationDetails = {
        ...mockDonation,
        frequency: "monthly",
      };
      const result = await sendRecurringPaymentEmail(recurringDonation, 5);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe("sendPaymentFailedEmail", () => {
    it("should send payment failed notification", async () => {
      const recurringDonation: DonationDetails = {
        ...mockDonation,
        frequency: "monthly",
      };
      const result = await sendPaymentFailedEmail(recurringDonation);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe("getEmailTemplates", () => {
    it("should return list of available templates", () => {
      const templates = getEmailTemplates();
      
      expect(templates).toHaveLength(4);
      expect(templates.map(t => t.name)).toContain("one_time_thank_you");
      expect(templates.map(t => t.name)).toContain("recurring_thank_you");
      expect(templates.map(t => t.name)).toContain("recurring_payment");
      expect(templates.map(t => t.name)).toContain("payment_failed");
    });

    it("should include descriptions for all templates", () => {
      const templates = getEmailTemplates();
      
      templates.forEach(template => {
        expect(template.description).toBeDefined();
        expect(template.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Email HTML Structure", () => {
    it("should have valid HTML structure in one-time email", () => {
      const template = generateOneTimeThankYouEmail(mockDonation);
      
      expect(template.htmlBody).toContain("<!DOCTYPE html>");
      expect(template.htmlBody).toContain("<html>");
      expect(template.htmlBody).toContain("</html>");
      expect(template.htmlBody).toContain("<body");
      expect(template.htmlBody).toContain("</body>");
    });

    it("should have responsive meta tag", () => {
      const template = generateOneTimeThankYouEmail(mockDonation);
      
      expect(template.htmlBody).toContain('name="viewport"');
      expect(template.htmlBody).toContain("width=device-width");
    });

    it("should use inline styles for email compatibility", () => {
      const template = generateOneTimeThankYouEmail(mockDonation);
      
      expect(template.htmlBody).toContain('style="');
      // Should not have external stylesheets
      expect(template.htmlBody).not.toContain("<link rel=\"stylesheet\"");
    });
  });

  describe("Text Email Format", () => {
    it("should have readable text format", () => {
      const template = generateOneTimeThankYouEmail(mockDonation);
      
      // Should have section headers
      expect(template.textBody).toContain("DONATION DETAILS");
      expect(template.textBody).toContain("TAX RECEIPT INFORMATION");
      
      // Should have dividers
      expect(template.textBody).toContain("---");
    });

    it("should not contain HTML tags in text body", () => {
      const template = generateOneTimeThankYouEmail(mockDonation);
      
      expect(template.textBody).not.toContain("<div");
      expect(template.textBody).not.toContain("<p>");
      expect(template.textBody).not.toContain("<table");
    });
  });
});
