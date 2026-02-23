// Email Digest Service
// Provides daily/weekly email summaries of pending tasks

export type DigestFrequency = "daily" | "weekly" | "none";

export interface DigestPreferences {
  enabled: boolean;
  frequency: DigestFrequency;
  includeArticles: boolean;
  includeSignatures: boolean;
  includeApprovals: boolean;
  includeDeadlines: boolean;
  preferredTime: string; // HH:mm format
  preferredDay?: number; // 0-6 for weekly (0 = Sunday)
}

export interface DigestContent {
  userId: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalPending: number;
    overdue: number;
    dueSoon: number;
    newAssignments: number;
  };
  articles: DigestItem[];
  signatures: DigestItem[];
  approvals: DigestItem[];
  deadlines: DigestItem[];
}

export interface DigestItem {
  id: string;
  title: string;
  type: string;
  dueDate: Date | null;
  priority: "high" | "medium" | "low";
  status: "pending" | "overdue" | "due_soon";
  assignedBy?: string;
  assignedAt?: Date;
}

// Default preferences
export const DEFAULT_DIGEST_PREFERENCES: DigestPreferences = {
  enabled: false,
  frequency: "daily",
  includeArticles: true,
  includeSignatures: true,
  includeApprovals: true,
  includeDeadlines: true,
  preferredTime: "08:00",
  preferredDay: 1, // Monday for weekly
};

// Get user's digest preferences
export function getDigestPreferences(userId: string): DigestPreferences {
  const stored = localStorage.getItem(`digest_prefs_${userId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_DIGEST_PREFERENCES;
    }
  }
  return DEFAULT_DIGEST_PREFERENCES;
}

// Save user's digest preferences
export function saveDigestPreferences(userId: string, prefs: DigestPreferences): void {
  localStorage.setItem(`digest_prefs_${userId}`, JSON.stringify(prefs));
}

// Generate digest content for a user
export function generateDigestContent(userId: string, frequency: DigestFrequency): DigestContent {
  const now = new Date();
  const start = new Date();
  
  if (frequency === "daily") {
    start.setDate(start.getDate() - 1);
  } else if (frequency === "weekly") {
    start.setDate(start.getDate() - 7);
  }

  // Mock data - in production, this would fetch from the backend
  const mockArticles: DigestItem[] = [
    {
      id: "a1",
      title: "Q4 Financial Report Review",
      type: "article",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      priority: "high",
      status: "overdue",
      assignedBy: "Michael Chen",
      assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "a2",
      title: "Compliance Training Module 3",
      type: "article",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: "medium",
      status: "due_soon",
      assignedBy: "HR Department",
      assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];

  const mockSignatures: DigestItem[] = [
    {
      id: "s1",
      title: "Vendor Contract - ABC Corp",
      type: "signature",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      priority: "high",
      status: "due_soon",
      assignedBy: "Legal Department",
      assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  const mockApprovals: DigestItem[] = [
    {
      id: "ap1",
      title: "Budget Amendment Request",
      type: "approval",
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
      priority: "high",
      status: "due_soon",
      assignedBy: "Finance Team",
      assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  const mockDeadlines: DigestItem[] = [
    {
      id: "d1",
      title: "Grant Application Submission",
      type: "deadline",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: "high",
      status: "pending",
    },
  ];

  const allItems = [...mockArticles, ...mockSignatures, ...mockApprovals, ...mockDeadlines];
  const overdue = allItems.filter((i) => i.status === "overdue").length;
  const dueSoon = allItems.filter((i) => i.status === "due_soon").length;

  return {
    userId,
    generatedAt: now,
    period: { start, end: now },
    summary: {
      totalPending: allItems.length,
      overdue,
      dueSoon,
      newAssignments: 2,
    },
    articles: mockArticles,
    signatures: mockSignatures,
    approvals: mockApprovals,
    deadlines: mockDeadlines,
  };
}

// Format digest as HTML email content
export function formatDigestAsHtml(digest: DigestContent): string {
  const formatDate = (date: Date | null) => {
    if (!date) return "No due date";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatItems = (items: DigestItem[], title: string) => {
    if (items.length === 0) return "";
    
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>${item.title}</strong>
            ${item.assignedBy ? `<br><small>Assigned by: ${item.assignedBy}</small>` : ""}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
            <span style="color: ${
              item.status === "overdue" ? "#dc2626" : item.status === "due_soon" ? "#f59e0b" : "#22c55e"
            };">
              ${formatDate(item.dueDate)}
            </span>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; background: ${
              item.priority === "high" ? "#fee2e2" : item.priority === "medium" ? "#fef3c7" : "#dcfce7"
            }; color: ${
              item.priority === "high" ? "#dc2626" : item.priority === "medium" ? "#d97706" : "#16a34a"
            };">
              ${item.priority}
            </span>
          </td>
        </tr>
      `
      )
      .join("");

    return `
      <h3 style="color: #1f2937; margin-top: 24px;">${title} (${items.length})</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 8px; text-align: left;">Task</th>
            <th style="padding: 8px; text-align: center;">Due Date</th>
            <th style="padding: 8px; text-align: center;">Priority</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    `;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Task Digest</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Task Digest</h1>
        <p style="margin: 8px 0 0 0; opacity: 0.9;">
          ${digest.period.start.toLocaleDateString()} - ${digest.period.end.toLocaleDateString()}
        </p>
      </div>
      
      <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
          <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${digest.summary.totalPending}</div>
            <div style="font-size: 12px; color: #6b7280;">Total Pending</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${digest.summary.overdue}</div>
            <div style="font-size: 12px; color: #6b7280;">Overdue</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${digest.summary.dueSoon}</div>
            <div style="font-size: 12px; color: #6b7280;">Due Soon</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${digest.summary.newAssignments}</div>
            <div style="font-size: 12px; color: #6b7280;">New</div>
          </div>
        </div>
        
        ${formatItems(digest.articles, "📄 Articles to Read")}
        ${formatItems(digest.signatures, "✍️ Documents to Sign")}
        ${formatItems(digest.approvals, "👍 Items to Approve")}
        ${formatItems(digest.deadlines, "📅 Upcoming Deadlines")}
        
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
          <a href="#" style="display: inline-block; background: #166534; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            View All Tasks
          </a>
        </div>
        
        <p style="margin-top: 24px; font-size: 12px; color: #6b7280; text-align: center;">
          You're receiving this because you have email digests enabled.<br>
          <a href="#" style="color: #166534;">Manage preferences</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

// Schedule next digest (mock implementation)
export function scheduleNextDigest(userId: string, prefs: DigestPreferences): Date | null {
  if (!prefs.enabled || prefs.frequency === "none") {
    return null;
  }

  const [hours, minutes] = prefs.preferredTime.split(":").map(Number);
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  if (next <= new Date()) {
    next.setDate(next.getDate() + 1);
  }

  if (prefs.frequency === "weekly" && prefs.preferredDay !== undefined) {
    while (next.getDay() !== prefs.preferredDay) {
      next.setDate(next.getDate() + 1);
    }
  }

  return next;
}

// Get digest history (mock)
export function getDigestHistory(userId: string): Array<{ sentAt: Date; itemCount: number }> {
  return [
    { sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), itemCount: 5 },
    { sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), itemCount: 3 },
    { sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), itemCount: 7 },
  ];
}
