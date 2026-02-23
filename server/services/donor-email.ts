/**
 * Donor Email Service
 * 
 * Handles automated email generation for donation acknowledgments,
 * tax receipts, and recurring donation notifications.
 */

import { notifyOwner } from "../_core/notification";

// Types
export interface DonationDetails {
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  frequency: "one_time" | "monthly" | "quarterly" | "annual";
  designation?: string;
  tributeType?: "none" | "in_honor" | "in_memory";
  tributeName?: string;
  transactionId: string;
  transactionDate: Date;
  isAnonymous: boolean;
}

export interface TaxReceiptData {
  receiptNumber: string;
  donorName: string;
  donorAddress?: string;
  amount: number;
  currency: string;
  donationDate: Date;
  organizationName: string;
  organizationEIN: string;
  organizationType: string;
  taxYear: number;
  goodsOrServicesProvided: boolean;
  goodsOrServicesValue?: number;
  goodsOrServicesDescription?: string;
}

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

// Organization details for 508(c)(1)(a) tax-exempt status
const ORGANIZATION_INFO = {
  name: "LuvOnPurpose Academy and Outreach",
  shortName: "L.A.W.S. Collective",
  ein: "XX-XXXXXXX", // Placeholder - would be set via environment
  type: "508(c)(1)(a) Tax-Exempt Organization",
  address: {
    street: "",
    city: "",
    state: "",
    zip: "",
  },
  website: "https://lawscollective.org",
  email: "donations@lawscollective.org",
};

/**
 * Generate a unique receipt number
 */
export function generateReceiptNumber(transactionId: string, date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const shortId = transactionId.slice(-8).toUpperCase();
  return `LAWS-${year}${month}${day}-${shortId}`;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Get frequency display text
 */
export function getFrequencyText(frequency: DonationDetails["frequency"]): string {
  const frequencyMap: Record<DonationDetails["frequency"], string> = {
    one_time: "one-time",
    monthly: "monthly",
    quarterly: "quarterly",
    annual: "annual",
  };
  return frequencyMap[frequency] || "one-time";
}

/**
 * Get designation display text
 */
export function getDesignationText(designation?: string): string {
  if (!designation || designation === "general" || designation === "where_needed") {
    return "Where Needed Most";
  }
  
  const designationMap: Record<string, string> = {
    jobs: "Job Creation & Employment",
    education: "Education & Academy",
    housing: "Housing & Stability",
    business: "Business Development",
    emergency: "Emergency Support",
  };
  
  return designationMap[designation] || designation;
}

/**
 * Generate tax receipt data from donation details
 */
export function generateTaxReceiptData(donation: DonationDetails): TaxReceiptData {
  const receiptNumber = generateReceiptNumber(donation.transactionId, donation.transactionDate);
  
  return {
    receiptNumber,
    donorName: donation.isAnonymous ? "Anonymous Donor" : donation.donorName,
    amount: donation.amount,
    currency: donation.currency,
    donationDate: donation.transactionDate,
    organizationName: ORGANIZATION_INFO.name,
    organizationEIN: ORGANIZATION_INFO.ein,
    organizationType: ORGANIZATION_INFO.type,
    taxYear: donation.transactionDate.getFullYear(),
    goodsOrServicesProvided: false,
    goodsOrServicesValue: 0,
  };
}

/**
 * Generate thank-you email template for one-time donations
 */
export function generateOneTimeThankYouEmail(donation: DonationDetails): EmailTemplate {
  const taxReceipt = generateTaxReceiptData(donation);
  const formattedAmount = formatCurrency(donation.amount, donation.currency);
  const formattedDate = formatDate(donation.transactionDate);
  const designationText = getDesignationText(donation.designation);
  
  let tributeSection = "";
  if (donation.tributeType && donation.tributeType !== "none" && donation.tributeName) {
    const tributeLabel = donation.tributeType === "in_honor" ? "In Honor of" : "In Memory of";
    tributeSection = `
      <p style="margin: 16px 0; padding: 12px; background-color: #f0fdf4; border-radius: 8px;">
        <strong>${tributeLabel}:</strong> ${donation.tributeName}
      </p>
    `;
  }
  
  const subject = `Thank You for Your ${formattedAmount} Donation to ${ORGANIZATION_INFO.shortName}`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Donation</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Thank You!</h1>
    <p style="color: #dcfce7; margin: 10px 0 0 0; font-size: 16px;">Your generosity makes a difference</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 18px; margin-top: 0;">Dear ${donation.donorName},</p>
    
    <p>Thank you for your generous donation of <strong>${formattedAmount}</strong> to ${ORGANIZATION_INFO.name}. Your support helps us build generational wealth, create jobs, and transform communities through education and opportunity.</p>
    
    ${tributeSection}
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h2 style="color: #166534; margin-top: 0; font-size: 18px;">Donation Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Amount</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${formattedAmount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Date</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Designation</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${designationText}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">Receipt Number</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace;">${taxReceipt.receiptNumber}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">Tax Receipt Information</h3>
      <p style="margin-bottom: 0; font-size: 14px;">
        ${ORGANIZATION_INFO.name} is a ${ORGANIZATION_INFO.type}. Your donation of ${formattedAmount} is tax-deductible to the fullest extent allowed by law. No goods or services were provided in exchange for this contribution.
      </p>
      <p style="margin-bottom: 0; font-size: 14px; margin-top: 12px;">
        <strong>Organization:</strong> ${ORGANIZATION_INFO.name}<br>
        <strong>Tax Status:</strong> ${ORGANIZATION_INFO.type}<br>
        <strong>Receipt #:</strong> ${taxReceipt.receiptNumber}
      </p>
    </div>
    
    <p>Your contribution directly supports our mission to help individuals and families create lasting prosperity. Together, we're building a stronger community.</p>
    
    <p style="margin-bottom: 0;">With gratitude,</p>
    <p style="margin-top: 5px;"><strong>The ${ORGANIZATION_INFO.shortName} Team</strong></p>
  </div>
  
  <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; font-size: 12px; color: #6b7280;">
    <p style="margin: 0;">${ORGANIZATION_INFO.name}</p>
    <p style="margin: 5px 0;">${ORGANIZATION_INFO.type}</p>
    <p style="margin: 5px 0;">
      <a href="${ORGANIZATION_INFO.website}" style="color: #166534;">Visit our website</a> | 
      <a href="mailto:${ORGANIZATION_INFO.email}" style="color: #166534;">Contact us</a>
    </p>
  </div>
</body>
</html>
  `.trim();
  
  const textBody = `
Thank You for Your Donation!

Dear ${donation.donorName},

Thank you for your generous donation of ${formattedAmount} to ${ORGANIZATION_INFO.name}. Your support helps us build generational wealth, create jobs, and transform communities through education and opportunity.

${donation.tributeType && donation.tributeType !== "none" && donation.tributeName ? `${donation.tributeType === "in_honor" ? "In Honor of" : "In Memory of"}: ${donation.tributeName}\n` : ""}

DONATION DETAILS
----------------
Amount: ${formattedAmount}
Date: ${formattedDate}
Designation: ${designationText}
Receipt Number: ${taxReceipt.receiptNumber}

TAX RECEIPT INFORMATION
-----------------------
${ORGANIZATION_INFO.name} is a ${ORGANIZATION_INFO.type}. Your donation of ${formattedAmount} is tax-deductible to the fullest extent allowed by law. No goods or services were provided in exchange for this contribution.

Organization: ${ORGANIZATION_INFO.name}
Tax Status: ${ORGANIZATION_INFO.type}
Receipt #: ${taxReceipt.receiptNumber}

Your contribution directly supports our mission to help individuals and families create lasting prosperity. Together, we're building a stronger community.

With gratitude,
The ${ORGANIZATION_INFO.shortName} Team

---
${ORGANIZATION_INFO.name}
${ORGANIZATION_INFO.type}
${ORGANIZATION_INFO.website}
  `.trim();
  
  return { subject, htmlBody, textBody };
}

/**
 * Generate thank-you email template for recurring donations
 */
export function generateRecurringThankYouEmail(donation: DonationDetails): EmailTemplate {
  const taxReceipt = generateTaxReceiptData(donation);
  const formattedAmount = formatCurrency(donation.amount, donation.currency);
  const formattedDate = formatDate(donation.transactionDate);
  const frequencyText = getFrequencyText(donation.frequency);
  const designationText = getDesignationText(donation.designation);
  
  const subject = `Thank You for Your ${frequencyText} Donation of ${formattedAmount} to ${ORGANIZATION_INFO.shortName}`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Recurring Donation</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Family!</h1>
    <p style="color: #dcfce7; margin: 10px 0 0 0; font-size: 16px;">Your ongoing support means the world to us</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 18px; margin-top: 0;">Dear ${donation.donorName},</p>
    
    <p>Thank you for becoming a <strong>${frequencyText} donor</strong> to ${ORGANIZATION_INFO.name}! Your commitment of <strong>${formattedAmount} per ${frequencyText === "monthly" ? "month" : frequencyText === "quarterly" ? "quarter" : "year"}</strong> provides sustainable support for our mission.</p>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #22c55e;">
      <h3 style="color: #166534; margin-top: 0; font-size: 16px;">🌟 As a Recurring Donor, You'll Receive:</h3>
      <ul style="margin-bottom: 0; padding-left: 20px;">
        <li>Quarterly impact reports showing how your donations are making a difference</li>
        <li>Early access to community events and programs</li>
        <li>Recognition in our annual donor report (unless you prefer to remain anonymous)</li>
        <li>Direct updates on the projects you're supporting</li>
      </ul>
    </div>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h2 style="color: #166534; margin-top: 0; font-size: 18px;">Subscription Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Amount</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${formattedAmount} / ${frequencyText === "monthly" ? "month" : frequencyText === "quarterly" ? "quarter" : "year"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">First Payment</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Designation</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${designationText}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">Receipt Number</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace;">${taxReceipt.receiptNumber}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">Tax Receipt Information</h3>
      <p style="margin-bottom: 0; font-size: 14px;">
        You will receive a tax receipt for each ${frequencyText} payment. ${ORGANIZATION_INFO.name} is a ${ORGANIZATION_INFO.type}. All donations are tax-deductible to the fullest extent allowed by law.
      </p>
    </div>
    
    <p>You can manage your subscription at any time by logging into your account or contacting us directly.</p>
    
    <p style="margin-bottom: 0;">With deep gratitude,</p>
    <p style="margin-top: 5px;"><strong>The ${ORGANIZATION_INFO.shortName} Team</strong></p>
  </div>
  
  <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; font-size: 12px; color: #6b7280;">
    <p style="margin: 0;">${ORGANIZATION_INFO.name}</p>
    <p style="margin: 5px 0;">${ORGANIZATION_INFO.type}</p>
    <p style="margin: 5px 0;">
      <a href="${ORGANIZATION_INFO.website}" style="color: #166534;">Visit our website</a> | 
      <a href="mailto:${ORGANIZATION_INFO.email}" style="color: #166534;">Contact us</a>
    </p>
  </div>
</body>
</html>
  `.trim();
  
  const textBody = `
Welcome to Our Family!

Dear ${donation.donorName},

Thank you for becoming a ${frequencyText} donor to ${ORGANIZATION_INFO.name}! Your commitment of ${formattedAmount} per ${frequencyText === "monthly" ? "month" : frequencyText === "quarterly" ? "quarter" : "year"} provides sustainable support for our mission.

AS A RECURRING DONOR, YOU'LL RECEIVE:
- Quarterly impact reports showing how your donations are making a difference
- Early access to community events and programs
- Recognition in our annual donor report (unless you prefer to remain anonymous)
- Direct updates on the projects you're supporting

SUBSCRIPTION DETAILS
--------------------
Amount: ${formattedAmount} / ${frequencyText === "monthly" ? "month" : frequencyText === "quarterly" ? "quarter" : "year"}
First Payment: ${formattedDate}
Designation: ${designationText}
Receipt Number: ${taxReceipt.receiptNumber}

TAX RECEIPT INFORMATION
-----------------------
You will receive a tax receipt for each ${frequencyText} payment. ${ORGANIZATION_INFO.name} is a ${ORGANIZATION_INFO.type}. All donations are tax-deductible to the fullest extent allowed by law.

You can manage your subscription at any time by logging into your account or contacting us directly.

With deep gratitude,
The ${ORGANIZATION_INFO.shortName} Team

---
${ORGANIZATION_INFO.name}
${ORGANIZATION_INFO.type}
${ORGANIZATION_INFO.website}
  `.trim();
  
  return { subject, htmlBody, textBody };
}

/**
 * Generate payment confirmation email for recurring donation payments
 */
export function generateRecurringPaymentEmail(donation: DonationDetails, paymentNumber: number): EmailTemplate {
  const taxReceipt = generateTaxReceiptData(donation);
  const formattedAmount = formatCurrency(donation.amount, donation.currency);
  const formattedDate = formatDate(donation.transactionDate);
  const frequencyText = getFrequencyText(donation.frequency);
  
  const subject = `Payment Received: Your ${frequencyText} Donation of ${formattedAmount}`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #166534; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Payment Confirmation</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p>Dear ${donation.donorName},</p>
    
    <p>This confirms that your ${frequencyText} donation of <strong>${formattedAmount}</strong> has been successfully processed.</p>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Amount</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${formattedAmount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Date</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Payment #</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${paymentNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">Receipt Number</td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace;">${taxReceipt.receiptNumber}</td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">
      This receipt serves as your tax documentation. ${ORGANIZATION_INFO.name} is a ${ORGANIZATION_INFO.type}.
    </p>
    
    <p>Thank you for your continued support!</p>
    
    <p style="margin-bottom: 0;">Warm regards,</p>
    <p style="margin-top: 5px;"><strong>The ${ORGANIZATION_INFO.shortName} Team</strong></p>
  </div>
  
  <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 12px 12px; font-size: 12px; color: #6b7280;">
    <p style="margin: 0;">${ORGANIZATION_INFO.name} | ${ORGANIZATION_INFO.type}</p>
  </div>
</body>
</html>
  `.trim();
  
  const textBody = `
Payment Confirmation

Dear ${donation.donorName},

This confirms that your ${frequencyText} donation of ${formattedAmount} has been successfully processed.

PAYMENT DETAILS
---------------
Amount: ${formattedAmount}
Date: ${formattedDate}
Payment #: ${paymentNumber}
Receipt Number: ${taxReceipt.receiptNumber}

This receipt serves as your tax documentation. ${ORGANIZATION_INFO.name} is a ${ORGANIZATION_INFO.type}.

Thank you for your continued support!

Warm regards,
The ${ORGANIZATION_INFO.shortName} Team

---
${ORGANIZATION_INFO.name} | ${ORGANIZATION_INFO.type}
  `.trim();
  
  return { subject, htmlBody, textBody };
}

/**
 * Generate email for failed payment notification
 */
export function generatePaymentFailedEmail(donation: DonationDetails): EmailTemplate {
  const formattedAmount = formatCurrency(donation.amount, donation.currency);
  const frequencyText = getFrequencyText(donation.frequency);
  
  const subject = `Action Required: Your ${frequencyText} Donation Payment Failed`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #dc2626; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Payment Failed</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p>Dear ${donation.donorName},</p>
    
    <p>We were unable to process your ${frequencyText} donation of <strong>${formattedAmount}</strong>. This may be due to an expired card, insufficient funds, or a temporary issue with your payment method.</p>
    
    <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #dc2626;">
      <h3 style="color: #dc2626; margin-top: 0; font-size: 16px;">What You Can Do:</h3>
      <ol style="margin-bottom: 0; padding-left: 20px;">
        <li>Log into your account to update your payment information</li>
        <li>Ensure your card has not expired</li>
        <li>Contact your bank if the issue persists</li>
        <li>Reach out to us if you need assistance</li>
      </ol>
    </div>
    
    <p>We'll automatically retry the payment in a few days. If the issue continues, your subscription may be paused.</p>
    
    <p>Thank you for your continued support of our mission!</p>
    
    <p style="margin-bottom: 0;">Best regards,</p>
    <p style="margin-top: 5px;"><strong>The ${ORGANIZATION_INFO.shortName} Team</strong></p>
  </div>
  
  <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 12px 12px; font-size: 12px; color: #6b7280;">
    <p style="margin: 0;">Need help? Contact us at <a href="mailto:${ORGANIZATION_INFO.email}" style="color: #166534;">${ORGANIZATION_INFO.email}</a></p>
  </div>
</body>
</html>
  `.trim();
  
  const textBody = `
Payment Failed

Dear ${donation.donorName},

We were unable to process your ${frequencyText} donation of ${formattedAmount}. This may be due to an expired card, insufficient funds, or a temporary issue with your payment method.

WHAT YOU CAN DO:
1. Log into your account to update your payment information
2. Ensure your card has not expired
3. Contact your bank if the issue persists
4. Reach out to us if you need assistance

We'll automatically retry the payment in a few days. If the issue continues, your subscription may be paused.

Thank you for your continued support of our mission!

Best regards,
The ${ORGANIZATION_INFO.shortName} Team

---
Need help? Contact us at ${ORGANIZATION_INFO.email}
  `.trim();
  
  return { subject, htmlBody, textBody };
}

/**
 * Send donation thank-you email (logs to console in development, notifies owner)
 */
export async function sendDonationThankYouEmail(donation: DonationDetails): Promise<EmailResult> {
  try {
    const isRecurring = donation.frequency !== "one_time";
    const template = isRecurring 
      ? generateRecurringThankYouEmail(donation)
      : generateOneTimeThankYouEmail(donation);
    
    // Log email content (in production, this would send via email service)
    console.log(`[DonorEmail] Sending thank-you email to ${donation.donorEmail}`);
    console.log(`[DonorEmail] Subject: ${template.subject}`);
    
    // Notify owner of new donation
    const formattedAmount = formatCurrency(donation.amount, donation.currency);
    const frequencyText = getFrequencyText(donation.frequency);
    
    await notifyOwner({
      title: `New ${frequencyText} Donation: ${formattedAmount}`,
      content: `
Donor: ${donation.isAnonymous ? "Anonymous" : donation.donorName}
Email: ${donation.donorEmail}
Amount: ${formattedAmount}
Frequency: ${frequencyText}
Designation: ${getDesignationText(donation.designation)}
${donation.tributeType && donation.tributeType !== "none" ? `Tribute: ${donation.tributeType === "in_honor" ? "In Honor of" : "In Memory of"} ${donation.tributeName}` : ""}
Transaction ID: ${donation.transactionId}
      `.trim(),
    });
    
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
    };
  } catch (error: any) {
    console.error("[DonorEmail] Failed to send thank-you email:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
      timestamp: new Date(),
    };
  }
}

/**
 * Send recurring payment confirmation email
 */
export async function sendRecurringPaymentEmail(donation: DonationDetails, paymentNumber: number): Promise<EmailResult> {
  try {
    const template = generateRecurringPaymentEmail(donation, paymentNumber);
    
    console.log(`[DonorEmail] Sending payment confirmation to ${donation.donorEmail}`);
    console.log(`[DonorEmail] Subject: ${template.subject}`);
    
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
    };
  } catch (error: any) {
    console.error("[DonorEmail] Failed to send payment confirmation:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
      timestamp: new Date(),
    };
  }
}

/**
 * Send payment failed notification email
 */
export async function sendPaymentFailedEmail(donation: DonationDetails): Promise<EmailResult> {
  try {
    const template = generatePaymentFailedEmail(donation);
    
    console.log(`[DonorEmail] Sending payment failed notification to ${donation.donorEmail}`);
    console.log(`[DonorEmail] Subject: ${template.subject}`);
    
    // Also notify owner
    await notifyOwner({
      title: `Payment Failed: ${donation.donorName}`,
      content: `
A recurring donation payment has failed.

Donor: ${donation.donorName}
Email: ${donation.donorEmail}
Amount: ${formatCurrency(donation.amount, donation.currency)}
Frequency: ${getFrequencyText(donation.frequency)}
      `.trim(),
    });
    
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
    };
  } catch (error: any) {
    console.error("[DonorEmail] Failed to send payment failed notification:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
      timestamp: new Date(),
    };
  }
}

/**
 * Get all email templates for preview
 */
export function getEmailTemplates(): { name: string; description: string }[] {
  return [
    { name: "one_time_thank_you", description: "Thank-you email for one-time donations" },
    { name: "recurring_thank_you", description: "Welcome email for new recurring donors" },
    { name: "recurring_payment", description: "Payment confirmation for recurring donations" },
    { name: "payment_failed", description: "Notification when a payment fails" },
  ];
}
