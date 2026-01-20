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
  const userIds = [...new Set(signatures.map(s => s.signerId))];
  
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
