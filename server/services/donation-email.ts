import { invokeLLM } from '../_core/llm';

interface DonationEmailData {
  donorName?: string;
  donorEmail: string;
  amount: number;
  tier: string;
  transactionId: string;
  date: string;
  frequency?: 'one_time' | 'monthly' | 'quarterly' | 'annual';
  designation?: string;
  isAnonymous?: boolean;
}

interface DonationReceipt {
  receiptNumber: string;
  date: string;
  donorName: string;
  amount: number;
  frequency: string;
  designation: string;
  taxDeductible: boolean;
  organizationName: string;
  ein: string;
}

const DESIGNATION_DESCRIPTIONS: Record<string, string> = {
  general: 'Where Needed Most',
  jobs: 'Job Creation & Employment',
  education: 'Education & Academy',
  housing: 'Housing & Stability',
  business: 'Business Development',
  emergency: 'Emergency Support',
};

export async function sendDonationConfirmationEmail(data: DonationEmailData): Promise<boolean> {
  try {
    // Generate personalized thank-you email using LLM
    const emailContent = await generateDonationThankYouEmail(data);
    
    // Send via email service (using built-in notification system)
    const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/email/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.donorEmail,
        subject: `Thank You for Supporting The L.A.W.S. Collective - ${data.tier} Tier`,
        html: emailContent,
        from: 'support@lawscollective.org',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending donation confirmation email:', error);
    return false;
  }
}

async function generateDonationThankYouEmail(data: DonationEmailData): Promise<string> {
  const frequencyLabel = data.frequency ? {
    one_time: 'one-time',
    monthly: 'monthly',
    quarterly: 'quarterly',
    annual: 'annual',
  }[data.frequency] : 'one-time';

  const designationLabel = data.designation 
    ? (DESIGNATION_DESCRIPTIONS[data.designation] || 'The L.A.W.S. Collective')
    : 'The L.A.W.S. Collective';

  const prompt = `Generate a professional and heartfelt thank-you email for a donation to The L.A.W.S. Collective.

Donor Information:
- Name: ${data.donorName || 'Valued Supporter'}
- Donation Amount: $${data.amount}
- Frequency: ${frequencyLabel}
- Support Tier: ${data.tier}
- Designated For: ${designationLabel}
- Transaction ID: ${data.transactionId}
- Date: ${data.date}
- Anonymous: ${data.isAnonymous ? 'Yes' : 'No'}

The email should:
1. Express genuine gratitude for the donation
2. Explain the impact of their contribution based on the designation
3. Describe what the ${data.tier} tier includes
4. Mention how their support helps build generational wealth and community strength for indigenous communities
5. Include the transaction ID and date for their records
6. Provide next steps or how they can stay engaged
7. Include a call-to-action to follow social media or visit the website
8. If frequency is recurring, mention the next payment date

Format the email in plain text (no HTML tags). Keep it warm, authentic, and community-focused.`

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'You are a professional email copywriter for The L.A.W.S. Collective, a faith-based community organization focused on building generational wealth and community strength for indigenous communities. Write warm, professional emails that inspire continued engagement and emphasize the mission of multi-generational wealth building.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const emailContent = typeof response.choices[0]?.message?.content === 'string' 
    ? response.choices[0].message.content 
    : '';
  return emailContent;
}

export function generateDonationReceipt(data: DonationEmailData): DonationReceipt {
  const receiptNumber = `LAWS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const frequencyLabel = data.frequency ? {
    one_time: 'One-time donation',
    monthly: 'Monthly recurring donation',
    quarterly: 'Quarterly recurring donation',
    annual: 'Annual recurring donation',
  }[data.frequency] : 'One-time donation';

  const designationLabel = data.designation 
    ? (DESIGNATION_DESCRIPTIONS[data.designation] || 'General support')
    : 'General support';

  return {
    receiptNumber,
    date: data.date,
    donorName: data.donorName || 'Anonymous Donor',
    amount: data.amount,
    frequency: frequencyLabel,
    designation: designationLabel,
    taxDeductible: true,
    organizationName: 'The L.A.W.S. Collective',
    ein: 'XX-XXXXXXX', // Placeholder - update with actual EIN
  };
}

export function formatReceiptAsHTML(receipt: DonationReceipt): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #228B22; padding-bottom: 20px;">
    <h1 style="color: #228B22; margin: 0;">The L.A.W.S. Collective</h1>
    <p style="color: #666; margin: 5px 0;">Donation Receipt</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><strong>Receipt Number:</strong> ${receipt.receiptNumber}</p>
    <p><strong>Date:</strong> ${receipt.date}</p>
  </div>

  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: #228B22;">Donation Details</h3>
    <p><strong>Donor:</strong> ${receipt.donorName}</p>
    <p><strong>Amount:</strong> $${receipt.amount.toFixed(2)}</p>
    <p><strong>Frequency:</strong> ${receipt.frequency}</p>
    <p><strong>Designated For:</strong> ${receipt.designation}</p>
  </div>

  <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
    <h3 style="margin-top: 0; color: #228B22;">Tax Information</h3>
    <p style="margin: 5px 0;">✓ This donation is tax-deductible</p>
    <p style="margin: 5px 0;"><strong>Organization:</strong> ${receipt.organizationName}</p>
    <p style="margin: 5px 0;"><strong>EIN:</strong> ${receipt.ein}</p>
    <p style="margin: 5px 0; font-size: 12px; color: #666;">Please consult with your tax advisor regarding deductibility. We will provide additional documentation if needed.</p>
  </div>

  <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
    <p>Thank you for supporting The L.A.W.S. Collective<br>Building Generational Wealth Through Purpose & Community</p>
  </div>
</div>
  `;
}

export async function sendDonationReceiptEmail(data: DonationEmailData & { receiptUrl?: string }): Promise<boolean> {
  try {
    const receipt = generateDonationReceipt(data);
    const receiptContent = formatReceiptAsHTML(receipt);

    const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/email/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.donorEmail,
        subject: `Donation Receipt - Transaction ${data.transactionId}`,
        html: receiptContent,
        from: 'receipts@lawscollective.org',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending donation receipt:', error);
    return false;
  }
}
