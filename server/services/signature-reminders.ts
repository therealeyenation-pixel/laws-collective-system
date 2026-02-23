import { db } from "../db";
import { sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

interface ReminderResult {
  sent: number;
  errors: number;
  skipped: number;
}

interface PendingSignature {
  userId: number;
  userEmail: string;
  userName: string;
  articleId: string;
  articleTitle: string;
  requestId: number | null;
  dueDate: string | null;
  createdAt: string;
}

/**
 * Get pending signatures that need reminders
 */
async function getPendingSignatures(reminderType: "daily" | "weekly" | "overdue"): Promise<PendingSignature[]> {
  try {
    let dateCondition = "";
    
    if (reminderType === "overdue") {
      // Get signatures past due date
      dateCondition = "AND sr.due_date < NOW()";
    } else if (reminderType === "daily") {
      // Get signatures created more than 24 hours ago without recent reminder
      dateCondition = "AND aa.created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)";
    } else if (reminderType === "weekly") {
      // Get signatures created more than 7 days ago
      dateCondition = "AND aa.created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)";
    }

    const result = await db.execute(sql`
      SELECT DISTINCT
        aa.user_id as userId,
        u.email as userEmail,
        u.name as userName,
        aa.article_id as articleId,
        aa.article_title as articleTitle,
        sr.id as requestId,
        sr.due_date as dueDate,
        aa.created_at as createdAt
      FROM article_acknowledgments aa
      LEFT JOIN users u ON aa.user_id = u.id
      LEFT JOIN signature_requests sr ON aa.article_id = sr.article_id
      LEFT JOIN signature_reminders rem ON aa.user_id = rem.user_id 
        AND aa.article_id = rem.article_id 
        AND rem.reminder_type = ${reminderType}
        AND rem.sent_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
      WHERE aa.signed_at IS NULL
        AND rem.id IS NULL
        ${sql.raw(dateCondition)}
      ORDER BY aa.created_at ASC
      LIMIT 100
    `);

    return (result as any[]).map((r) => ({
      userId: r.userId,
      userEmail: r.userEmail || "",
      userName: r.userName || "User",
      articleId: r.articleId,
      articleTitle: r.articleTitle,
      requestId: r.requestId,
      dueDate: r.dueDate,
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.error("[SignatureReminders] Error getting pending signatures:", error);
    return [];
  }
}

/**
 * Record that a reminder was sent
 */
async function recordReminder(
  userId: number,
  articleId: string,
  requestId: number | null,
  reminderType: string,
  emailSent: boolean
): Promise<void> {
  try {
    await db.execute(sql`
      INSERT INTO signature_reminders (user_id, article_id, request_id, reminder_type, email_sent)
      VALUES (${userId}, ${articleId}, ${requestId}, ${reminderType}, ${emailSent})
    `);
  } catch (error) {
    console.error("[SignatureReminders] Error recording reminder:", error);
  }
}

/**
 * Send reminder notification (in-app and optionally email)
 */
async function sendReminder(
  pending: PendingSignature,
  reminderType: string
): Promise<boolean> {
  try {
    // Create in-app notification
    const urgencyText = reminderType === "overdue" ? "OVERDUE: " : "";
    const message = `${urgencyText}Please sign "${pending.articleTitle}"`;
    
    // Insert notification into notifications table
    await db.execute(sql`
      INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
      VALUES (
        ${pending.userId},
        ${"Signature Required"},
        ${message},
        ${"signature_reminder"},
        ${`/sign/${pending.articleId}`},
        NOW()
      )
    `);

    // Record the reminder
    await recordReminder(
      pending.userId,
      pending.articleId,
      pending.requestId,
      reminderType,
      false // Email sending would be implemented separately
    );

    return true;
  } catch (error) {
    console.error("[SignatureReminders] Error sending reminder:", error);
    return false;
  }
}

/**
 * Process daily signature reminders
 */
export async function processDailyReminders(): Promise<ReminderResult> {
  console.log("[SignatureReminders] Processing daily reminders...");
  
  const pending = await getPendingSignatures("daily");
  let sent = 0;
  let errors = 0;
  let skipped = 0;

  for (const sig of pending) {
    if (!sig.userEmail) {
      skipped++;
      continue;
    }

    const success = await sendReminder(sig, "daily");
    if (success) {
      sent++;
    } else {
      errors++;
    }
  }

  console.log(`[SignatureReminders] Daily: sent=${sent}, errors=${errors}, skipped=${skipped}`);
  return { sent, errors, skipped };
}

/**
 * Process weekly signature reminders
 */
export async function processWeeklyReminders(): Promise<ReminderResult> {
  console.log("[SignatureReminders] Processing weekly reminders...");
  
  const pending = await getPendingSignatures("weekly");
  let sent = 0;
  let errors = 0;
  let skipped = 0;

  for (const sig of pending) {
    if (!sig.userEmail) {
      skipped++;
      continue;
    }

    const success = await sendReminder(sig, "weekly");
    if (success) {
      sent++;
    } else {
      errors++;
    }
  }

  console.log(`[SignatureReminders] Weekly: sent=${sent}, errors=${errors}, skipped=${skipped}`);
  return { sent, errors, skipped };
}

/**
 * Process overdue signature reminders
 */
export async function processOverdueReminders(): Promise<ReminderResult> {
  console.log("[SignatureReminders] Processing overdue reminders...");
  
  const pending = await getPendingSignatures("overdue");
  let sent = 0;
  let errors = 0;
  let skipped = 0;

  for (const sig of pending) {
    if (!sig.userEmail) {
      skipped++;
      continue;
    }

    const success = await sendReminder(sig, "overdue");
    if (success) {
      sent++;
    } else {
      errors++;
    }
  }

  // Notify owner if there are overdue signatures
  if (sent > 0) {
    await notifyOwner({
      title: "Overdue Signatures Alert",
      content: `${sent} signature reminder(s) sent for overdue documents. Please review the Signature Audit Report for details.`,
    });
  }

  console.log(`[SignatureReminders] Overdue: sent=${sent}, errors=${errors}, skipped=${skipped}`);
  return { sent, errors, skipped };
}

/**
 * Process all signature reminders
 */
export async function processAllSignatureReminders(): Promise<{
  daily: ReminderResult;
  weekly: ReminderResult;
  overdue: ReminderResult;
}> {
  const daily = await processDailyReminders();
  const weekly = await processWeeklyReminders();
  const overdue = await processOverdueReminders();

  console.log("[SignatureReminders] Completed:", { daily, weekly, overdue });
  return { daily, weekly, overdue };
}

/**
 * Get reminder statistics for admin dashboard
 */
export async function getReminderStats(): Promise<{
  totalPending: number;
  overdueCount: number;
  remindersSentToday: number;
  remindersSentThisWeek: number;
}> {
  try {
    const statsResult = await db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM article_acknowledgments WHERE signed_at IS NULL) as totalPending,
        (SELECT COUNT(*) FROM article_acknowledgments aa 
         JOIN signature_requests sr ON aa.article_id = sr.article_id 
         WHERE aa.signed_at IS NULL AND sr.due_date < NOW()) as overdueCount,
        (SELECT COUNT(*) FROM signature_reminders WHERE sent_at > DATE_SUB(NOW(), INTERVAL 1 DAY)) as remindersSentToday,
        (SELECT COUNT(*) FROM signature_reminders WHERE sent_at > DATE_SUB(NOW(), INTERVAL 7 DAY)) as remindersSentThisWeek
    `);

    const stats = (statsResult as any)[0] || {};
    return {
      totalPending: Number(stats.totalPending) || 0,
      overdueCount: Number(stats.overdueCount) || 0,
      remindersSentToday: Number(stats.remindersSentToday) || 0,
      remindersSentThisWeek: Number(stats.remindersSentThisWeek) || 0,
    };
  } catch (error) {
    console.error("[SignatureReminders] Error getting stats:", error);
    return {
      totalPending: 0,
      overdueCount: 0,
      remindersSentToday: 0,
      remindersSentThisWeek: 0,
    };
  }
}
