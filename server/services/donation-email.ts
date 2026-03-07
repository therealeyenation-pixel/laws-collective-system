import { invokeLLM } from '../_core/llm';

interface DonationEmailData {
  donorName: string;
  donorEmail: string;
  amount: number;
  tier: string;
  transactionId: string;
  date: string;
}

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
  const prompt = `Generate a professional and heartfelt thank-you email for a donation to The L.A.W.S. Collective.

Donor Information:
- Name: ${data.donorName}
- Donation Amount: $${data.amount}
- Support Tier: ${data.tier}
- Transaction ID: ${data.transactionId}
- Date: ${data.date}

The email should:
1. Express genuine gratitude for the donation
2. Explain the impact of their contribution
3. Describe what the ${data.tier} tier includes
4. Mention how their support helps build generational wealth and community strength
5. Include the transaction ID and date for their records
6. Provide next steps or how they can stay engaged
7. Include a call-to-action to follow social media or visit the website

Format the email in HTML with professional styling. Include the L.A.W.S. Collective branding and mission statement.`;

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'You are a professional email copywriter for The L.A.W.S. Collective, a community organization focused on building generational wealth and community strength. Write warm, professional emails that inspire continued engagement.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const emailHtml = response.choices[0]?.message?.content || '';
  return emailHtml;
}

export async function sendDonationReceiptEmail(data: DonationEmailData & { receiptUrl?: string }): Promise<boolean> {
  try {
    const receiptContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Donation Receipt</h2>
        <p><strong>Donor:</strong> ${data.donorName}</p>
        <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
        <p><strong>Tier:</strong> ${data.tier}</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <hr />
        <p>Thank you for your generous support of The L.A.W.S. Collective.</p>
        <p>This donation is tax-deductible to the fullest extent allowed by law.</p>
      </div>
    `;

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
