import { getDb } from "../db";
import { translationSuggestions, translationContributors, users, emailSends } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export interface TranslationNotificationPayload {
  suggestionId: number;
  translationKey: string;
  language: string;
  suggestedText: string;
  status: 'approved' | 'rejected';
  reviewerNotes?: string;
  contributorUserId: number;
  contributorName: string;
  contributorEmail?: string;
}

/**
 * Send notification when a translation suggestion is approved
 */
export async function sendTranslationApprovedNotification(
  payload: TranslationNotificationPayload
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get contributor details
    const [contributor] = await db.select()
      .from(users)
      .where(eq(users.id, payload.contributorUserId))
      .limit(1);

    const recipientEmail = contributor?.email || payload.contributorEmail;
    const recipientName = contributor?.name || payload.contributorName;

    // Create email content
    const subject = `Your translation for "${payload.translationKey}" has been approved!`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .success-badge { display: inline-block; background: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
    .translation-box { background: white; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Translation Approved!</h1>
      <p>Thank you for your contribution</p>
    </div>
    <div class="content">
      <p>Hello ${recipientName},</p>
      <p><span class="success-badge">✓ Approved</span></p>
      <p>Great news! Your translation contribution has been reviewed and approved by our team.</p>
      
      <div class="translation-box">
        <p><strong>Translation Key:</strong> ${payload.translationKey}</p>
        <p><strong>Language:</strong> ${payload.language.toUpperCase()}</p>
        <p><strong>Your Translation:</strong></p>
        <p style="font-style: italic;">"${payload.suggestedText}"</p>
      </div>
      
      <p>Your contribution helps make our platform accessible to more people around the world. Keep up the great work!</p>
      
      <p>You've earned points for this contribution. Check your contributor profile to see your updated rank.</p>
    </div>
    <div class="footer">
      <p>The L.A.W.S. Collective - Building Multi-Generational Wealth Through Purpose & Community</p>
    </div>
  </div>
</body>
</html>`;

    // Record email send (simulated)
    if (recipientEmail) {
      const emailId = `trans_approved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(emailSends).values({
        userId: payload.contributorUserId,
        recipientEmail: recipientEmail,
        recipientName: recipientName,
        subject: subject,
        status: "sent",
        externalId: emailId,
      });
    }

    // Also notify owner about the approval
    await notifyOwner({
      title: "Translation Approved",
      content: `Translation for "${payload.translationKey}" (${payload.language}) by ${recipientName} has been approved.`,
    });

    return true;
  } catch (error) {
    console.error("[TranslationNotification] Error sending approval notification:", error);
    return false;
  }
}

/**
 * Send notification when a translation suggestion is rejected
 */
export async function sendTranslationRejectedNotification(
  payload: TranslationNotificationPayload
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get contributor details
    const [contributor] = await db.select()
      .from(users)
      .where(eq(users.id, payload.contributorUserId))
      .limit(1);

    const recipientEmail = contributor?.email || payload.contributorEmail;
    const recipientName = contributor?.name || payload.contributorName;

    // Create email content
    const subject = `Update on your translation for "${payload.translationKey}"`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .feedback-badge { display: inline-block; background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
    .translation-box { background: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .feedback-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Translation Feedback</h1>
      <p>We appreciate your contribution</p>
    </div>
    <div class="content">
      <p>Hello ${recipientName},</p>
      <p><span class="feedback-badge">Needs Revision</span></p>
      <p>Thank you for your translation contribution. After review, we've determined that some adjustments are needed.</p>
      
      <div class="translation-box">
        <p><strong>Translation Key:</strong> ${payload.translationKey}</p>
        <p><strong>Language:</strong> ${payload.language.toUpperCase()}</p>
        <p><strong>Your Translation:</strong></p>
        <p style="font-style: italic;">"${payload.suggestedText}"</p>
      </div>
      
      ${payload.reviewerNotes ? `
      <div class="feedback-box">
        <p><strong>Reviewer Feedback:</strong></p>
        <p>${payload.reviewerNotes}</p>
      </div>
      ` : ''}
      
      <p>We encourage you to review the feedback and submit a revised translation. Your contributions are valuable to our community!</p>
      
      <p>Common reasons for revision requests:</p>
      <ul>
        <li>Grammar or spelling corrections needed</li>
        <li>Context-specific terminology adjustments</li>
        <li>Tone or formality level adjustments</li>
        <li>Technical term accuracy</li>
      </ul>
    </div>
    <div class="footer">
      <p>The L.A.W.S. Collective - Building Multi-Generational Wealth Through Purpose & Community</p>
    </div>
  </div>
</body>
</html>`;

    // Record email send (simulated)
    if (recipientEmail) {
      const emailId = `trans_rejected_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(emailSends).values({
        userId: payload.contributorUserId,
        recipientEmail: recipientEmail,
        recipientName: recipientName,
        subject: subject,
        status: "sent",
        externalId: emailId,
      });
    }

    return true;
  } catch (error) {
    console.error("[TranslationNotification] Error sending rejection notification:", error);
    return false;
  }
}

/**
 * Send notification for new translation submission (to admins/reviewers)
 */
export async function sendNewTranslationSubmissionNotification(
  payload: {
    translationKey: string;
    language: string;
    suggestedText: string;
    contributorName: string;
  }
): Promise<boolean> {
  try {
    await notifyOwner({
      title: "New Translation Submission",
      content: `New translation submitted for "${payload.translationKey}" (${payload.language}) by ${payload.contributorName}. Please review in the Translation Portal.`,
    });
    return true;
  } catch (error) {
    console.error("[TranslationNotification] Error sending submission notification:", error);
    return false;
  }
}

/**
 * Get notification preferences for a contributor
 */
export async function getContributorNotificationPreferences(
  userId: number
): Promise<{
  emailOnApproval: boolean;
  emailOnRejection: boolean;
  emailOnMilestone: boolean;
}> {
  const db = await getDb();
  if (!db) {
    return {
      emailOnApproval: true,
      emailOnRejection: true,
      emailOnMilestone: true,
    };
  }

  try {
    const [contributor] = await db.select()
      .from(translationContributors)
      .where(eq(translationContributors.userId, userId))
      .limit(1);

    if (contributor?.notificationPreferences) {
      const prefs = contributor.notificationPreferences as any;
      return {
        emailOnApproval: prefs.emailOnApproval ?? true,
        emailOnRejection: prefs.emailOnRejection ?? true,
        emailOnMilestone: prefs.emailOnMilestone ?? true,
      };
    }

    return {
      emailOnApproval: true,
      emailOnRejection: true,
      emailOnMilestone: true,
    };
  } catch (error) {
    return {
      emailOnApproval: true,
      emailOnRejection: true,
      emailOnMilestone: true,
    };
  }
}

/**
 * Update notification preferences for a contributor
 */
export async function updateContributorNotificationPreferences(
  userId: number,
  preferences: {
    emailOnApproval?: boolean;
    emailOnRejection?: boolean;
    emailOnMilestone?: boolean;
  }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const currentPrefs = await getContributorNotificationPreferences(userId);
    const newPrefs = { ...currentPrefs, ...preferences };

    await db.update(translationContributors)
      .set({ notificationPreferences: newPrefs })
      .where(eq(translationContributors.userId, userId));

    return true;
  } catch (error) {
    console.error("[TranslationNotification] Error updating preferences:", error);
    return false;
  }
}
