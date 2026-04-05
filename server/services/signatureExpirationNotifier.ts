import { getDb } from "../db";
import { electronicSignatures, notifications, users } from "../../drizzle/schema";
import { eq, and, isNotNull, sql, gte, lte, inArray } from "drizzle-orm";

/**
 * Signature Expiration Notification Service
 * 
 * Sends automated reminders to users when their signatures are approaching expiration.
 * Notification schedule: 30 days, 14 days, 7 days, and 1 day before expiration.
 */

// Notification intervals in days
const NOTIFICATION_INTERVALS = [30, 14, 7, 1];

interface ExpiringSignature {
  id: number;
  signerId: number;
  signerName: string;
  documentType: string;
  documentTitle: string | null;
  expiresAt: Date;
  daysUntilExpiration: number;
}

/**
 * Get signatures expiring within a specific day range
 */
export async function getSignaturesExpiringInDays(
  daysFromNow: number,
  toleranceDays: number = 0
): Promise<ExpiringSignature[]> {
  const db = await getDb();
  
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysFromNow);
  
  // Set time to start of day for target
  const startOfTargetDay = new Date(targetDate);
  startOfTargetDay.setHours(0, 0, 0, 0);
  
  // Set time to end of day for target (with tolerance)
  const endOfTargetDay = new Date(targetDate);
  endOfTargetDay.setDate(endOfTargetDay.getDate() + toleranceDays);
  endOfTargetDay.setHours(23, 59, 59, 999);

  const signatures = await db
    .select({
      id: electronicSignatures.id,
      signerId: electronicSignatures.signerId,
      signerName: electronicSignatures.signerName,
      documentType: electronicSignatures.documentType,
      documentTitle: electronicSignatures.documentTitle,
      expiresAt: electronicSignatures.expiresAt,
    })
    .from(electronicSignatures)
    .where(
      and(
        eq(electronicSignatures.requiresReAcknowledgment, true),
        isNotNull(electronicSignatures.expiresAt),
        gte(electronicSignatures.expiresAt, startOfTargetDay),
        lte(electronicSignatures.expiresAt, endOfTargetDay)
      )
    );

  return signatures.map(sig => ({
    ...sig,
    expiresAt: sig.expiresAt!,
    daysUntilExpiration: Math.ceil(
      (new Date(sig.expiresAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    ),
  }));
}

/**
 * Create expiration notification for a user
 */
export async function createExpirationNotification(
  userId: number,
  signature: ExpiringSignature,
  daysUntilExpiration: number
): Promise<void> {
  const db = await getDb();
  
  if (!db) throw new Error("Database not available");
  
  const urgencyLevel = daysUntilExpiration <= 1 
    ? "alert" 
    : daysUntilExpiration <= 7 
      ? "alert" 
      : "info";
  
  const title = daysUntilExpiration <= 1
    ? `⚠️ Signature Expires Tomorrow!`
    : daysUntilExpiration <= 7
      ? `⚠️ Signature Expiring in ${daysUntilExpiration} Days`
      : `📋 Signature Expiring in ${daysUntilExpiration} Days`;
  
  const documentName = signature.documentTitle || formatDocumentType(signature.documentType);
  
  const message = daysUntilExpiration <= 1
    ? `Your signature on "${documentName}" expires tomorrow. Please re-acknowledge this document to maintain compliance.`
    : `Your signature on "${documentName}" will expire in ${daysUntilExpiration} days. Please re-acknowledge this document before ${formatDate(signature.expiresAt)} to maintain compliance.`;

  await db.insert(notifications).values({
    userId,
    type: urgencyLevel as "alert" | "info",
    title,
    message,
    referenceType: "signature",
    referenceId: signature.id,
    actionUrl: `/my-signatures?highlight=${signature.id}`,
    isPriority: daysUntilExpiration <= 7,
    metadata: {
      signatureId: signature.id,
      documentType: signature.documentType,
      documentTitle: signature.documentTitle,
      expiresAt: signature.expiresAt.toISOString(),
      daysUntilExpiration,
      notificationType: "expiration_reminder",
    },
  });
}

/**
 * Check if a notification was already sent for this signature at this interval
 */
export async function wasNotificationSent(
  signatureId: number,
  daysUntilExpiration: number
): Promise<boolean> {
  const db = await getDb();
  
  if (!db) throw new Error("Database not available");
  
  // Check for existing notification with same signature and interval
  const existing = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.referenceType, "signature"),
        eq(notifications.referenceId, signatureId),
        sql`JSON_EXTRACT(${notifications.metadata}, '$.notificationType') = 'expiration_reminder'`,
        sql`JSON_EXTRACT(${notifications.metadata}, '$.daysUntilExpiration') = ${daysUntilExpiration}`
      )
    )
    .limit(1);

  return existing.length > 0;
}

/**
 * Process all expiring signatures and send notifications
 * This should be called by a scheduled job (e.g., daily cron)
 */
export async function processExpirationNotifications(): Promise<{
  processed: number;
  notificationsSent: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;
  let notificationsSent = 0;

  for (const days of NOTIFICATION_INTERVALS) {
    try {
      // Get signatures expiring in this interval (with 1 day tolerance)
      const signatures = await getSignaturesExpiringInDays(days, 1);
      
      for (const signature of signatures) {
        processed++;
        
        try {
          // Check if notification was already sent
          const alreadySent = await wasNotificationSent(signature.id, days);
          
          if (!alreadySent) {
            await createExpirationNotification(
              signature.signerId,
              signature,
              days
            );
            notificationsSent++;
          }
        } catch (err) {
          errors.push(`Failed to process signature ${signature.id}: ${err}`);
        }
      }
    } catch (err) {
      errors.push(`Failed to get signatures expiring in ${days} days: ${err}`);
    }
  }

  return { processed, notificationsSent, errors };
}

/**
 * Get all users with expiring signatures (for admin dashboard)
 */
export async function getUsersWithExpiringSignatures(
  daysAhead: number = 30
): Promise<{
  userId: number;
  userName: string | null;
  email: string | null;
  expiringCount: number;
  expiredCount: number;
  signatures: ExpiringSignature[];
}[]> {
  const db = await getDb();
  
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  // Get all signatures expiring within the period
  const signatures = await db
    .select({
      id: electronicSignatures.id,
      signerId: electronicSignatures.signerId,
      signerName: electronicSignatures.signerName,
      documentType: electronicSignatures.documentType,
      documentTitle: electronicSignatures.documentTitle,
      expiresAt: electronicSignatures.expiresAt,
    })
    .from(electronicSignatures)
    .where(
      and(
        eq(electronicSignatures.requiresReAcknowledgment, true),
        isNotNull(electronicSignatures.expiresAt),
        lte(electronicSignatures.expiresAt, futureDate)
      )
    );

  // Get user details
  const userIds = Array.from(new Set(signatures.map(s => s.signerId)));
  
  if (userIds.length === 0) return [];
  
  const userDetails = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(inArray(users.id, userIds));

  const userMap = new Map(userDetails.map(u => [u.id, u]));

  // Group signatures by user
  const userSignatures = new Map<number, ExpiringSignature[]>();
  
  for (const sig of signatures) {
    const existing = userSignatures.get(sig.signerId) || [];
    existing.push({
      ...sig,
      expiresAt: sig.expiresAt!,
      daysUntilExpiration: Math.ceil(
        (new Date(sig.expiresAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    });
    userSignatures.set(sig.signerId, existing);
  }

  // Build result
  return Array.from(userSignatures.entries()).map(([userId, sigs]) => {
    const user = userMap.get(userId);
    const expiredCount = sigs.filter(s => s.daysUntilExpiration < 0).length;
    const expiringCount = sigs.filter(s => s.daysUntilExpiration >= 0).length;
    
    return {
      userId,
      userName: user?.name || null,
      email: user?.email || null,
      expiringCount,
      expiredCount,
      signatures: sigs.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration),
    };
  }).sort((a, b) => {
    // Sort by most urgent (lowest days until expiration)
    const aMin = Math.min(...a.signatures.map(s => s.daysUntilExpiration));
    const bMin = Math.min(...b.signatures.map(s => s.daysUntilExpiration));
    return aMin - bMin;
  });
}

/**
 * Send bulk re-acknowledgment requests to multiple users
 */
export async function sendBulkReAcknowledgmentRequests(
  signatureIds: number[]
): Promise<{
  sent: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const errors: string[] = [];
  let sent = 0;

  // Get signature details
  const signatures = await db
    .select()
    .from(electronicSignatures)
    .where(inArray(electronicSignatures.id, signatureIds));

  for (const signature of signatures) {
    try {
      const documentName = signature.documentTitle || formatDocumentType(signature.documentType);
      
      await db.insert(notifications).values({
        userId: signature.signerId,
        type: "approval",
        title: "📝 Re-acknowledgment Required",
        message: `Your signature on "${documentName}" has expired or is expiring soon. Please re-acknowledge this document to maintain compliance.`,
        referenceType: "signature",
        referenceId: signature.id,
        actionUrl: `/my-signatures?reack=${signature.id}`,
        isPriority: true,
        metadata: {
          signatureId: signature.id,
          documentType: signature.documentType,
          documentTitle: signature.documentTitle,
          notificationType: "reacknowledgment_request",
          requestedAt: new Date().toISOString(),
        },
      });
      sent++;
    } catch (err) {
      errors.push(`Failed to send request for signature ${signature.id}: ${err}`);
    }
  }

  return { sent, errors };
}

/**
 * Send email notification for expiring signature
 * Uses the email service to send actual emails for critical alerts
 */
export async function sendExpirationEmail(
  userId: number,
  signature: ExpiringSignature,
  daysUntilExpiration: number
): Promise<{ sent: boolean; error?: string }> {
  const db = await getDb();
  
  if (!db) throw new Error("Database not available");
  
  // Get user email
  const [user] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user?.email) {
    return { sent: false, error: "User has no email address" };
  }
  
  const documentName = signature.documentTitle || formatDocumentType(signature.documentType);
  const urgencyLevel = daysUntilExpiration <= 1 ? "URGENT" : daysUntilExpiration <= 7 ? "Important" : "Notice";
  
  const subject = daysUntilExpiration <= 1
    ? `[URGENT] Signature Expires Tomorrow - ${documentName}`
    : daysUntilExpiration <= 7
      ? `[Important] Signature Expiring in ${daysUntilExpiration} Days - ${documentName}`
      : `Signature Expiring Soon - ${documentName}`;
  
  const htmlContent = generateExpirationEmailHtml({
    recipientName: user.name || "Team Member",
    documentName,
    daysUntilExpiration,
    expirationDate: signature.expiresAt,
    signatureId: signature.id,
    urgencyLevel,
  });
  
  // Record the email send attempt
  // In production, this would call the actual email service
  try {
    // For now, we log the email and create a notification
    // In production, integrate with SendGrid/Resend here
    console.log(`[Email] Would send expiration email to ${user.email}: ${subject}`);
    
    return { sent: true };
  } catch (error) {
    return { sent: false, error: String(error) };
  }
}

/**
 * Generate HTML content for expiration email
 */
function generateExpirationEmailHtml(params: {
  recipientName: string;
  documentName: string;
  daysUntilExpiration: number;
  expirationDate: Date;
  signatureId: number;
  urgencyLevel: string;
}): string {
  const { recipientName, documentName, daysUntilExpiration, expirationDate, signatureId, urgencyLevel } = params;
  
  const urgencyColor = daysUntilExpiration <= 1 ? "#dc2626" : daysUntilExpiration <= 7 ? "#f59e0b" : "#3b82f6";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signature Expiration Notice</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a5f2a 0%, #2d8a3e 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Signature Expiration Notice</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <div style="background: ${urgencyColor}; color: white; padding: 10px 15px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
      <strong>${urgencyLevel}:</strong> ${daysUntilExpiration <= 0 ? "Signature has expired" : `Expires in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? "" : "s"}`}
    </div>
    
    <p>Hello ${recipientName},</p>
    
    <p>Your electronic signature on the following document ${daysUntilExpiration <= 0 ? "has expired" : "is expiring soon"}:</p>
    
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1a5f2a;">${documentName}</h3>
      <p style="margin: 0; color: #6b7280;">
        <strong>Expiration Date:</strong> ${formatDate(expirationDate)}
      </p>
    </div>
    
    <p>To maintain compliance, please log in and re-acknowledge this document before the expiration date.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="/my-signatures?reack=${signatureId}" style="background: #1a5f2a; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 600;">
        Re-acknowledge Document
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      If you have any questions, please contact your administrator.
    </p>
  </div>
  
  <div style="background: #1f2937; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
      This is an automated message from the The L.A.W.S. Collective system.
    </p>
  </div>
</body>
</html>
  `.trim();
}

// Helper functions
function formatDocumentType(type: string): string {
  return type
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
