/**
 * Delegation Escalation Service
 * Handles automatic escalation of overdue delegation approvals
 */

export interface EscalationRule {
  id: string;
  name: string;
  priority: "high" | "critical";
  thresholdHours: number;
  escalationLevels: {
    level: number;
    hoursAfterThreshold: number;
    escalateTo: "direct_manager" | "department_head" | "admin" | "owner";
    notificationMethod: ("email" | "in_app" | "sms")[];
  }[];
  isActive: boolean;
}

export interface PendingEscalation {
  id: string;
  delegationId: string;
  taskTitle: string;
  taskType: string;
  priority: "high" | "critical";
  fromUser: { id: string; name: string; email: string };
  toUser: { id: string; name: string; email: string };
  currentApprover: { id: string; name: string; email: string; role: string };
  requestedAt: Date;
  hoursOverdue: number;
  currentEscalationLevel: number;
  maxEscalationLevel: number;
  nextEscalationIn?: number; // hours
  status: "pending" | "escalated" | "resolved";
}

export interface EscalationHistory {
  id: string;
  delegationId: string;
  taskTitle: string;
  escalatedFrom: { id: string; name: string };
  escalatedTo: { id: string; name: string };
  escalationLevel: number;
  reason: "timeout" | "manual" | "priority_change" | "approver_unavailable";
  escalatedAt: Date;
  resolvedAt?: Date;
  resolution?: "approved" | "rejected" | "further_escalated";
}

// Default escalation rules
export const defaultEscalationRules: EscalationRule[] = [
  {
    id: "rule-1",
    name: "High Priority Escalation",
    priority: "high",
    thresholdHours: 24,
    escalationLevels: [
      {
        level: 1,
        hoursAfterThreshold: 0,
        escalateTo: "direct_manager",
        notificationMethod: ["email", "in_app"],
      },
      {
        level: 2,
        hoursAfterThreshold: 12,
        escalateTo: "department_head",
        notificationMethod: ["email", "in_app"],
      },
      {
        level: 3,
        hoursAfterThreshold: 24,
        escalateTo: "admin",
        notificationMethod: ["email", "in_app", "sms"],
      },
    ],
    isActive: true,
  },
  {
    id: "rule-2",
    name: "Critical Priority Escalation",
    priority: "critical",
    thresholdHours: 8,
    escalationLevels: [
      {
        level: 1,
        hoursAfterThreshold: 0,
        escalateTo: "direct_manager",
        notificationMethod: ["email", "in_app", "sms"],
      },
      {
        level: 2,
        hoursAfterThreshold: 4,
        escalateTo: "department_head",
        notificationMethod: ["email", "in_app", "sms"],
      },
      {
        level: 3,
        hoursAfterThreshold: 8,
        escalateTo: "admin",
        notificationMethod: ["email", "in_app", "sms"],
      },
      {
        level: 4,
        hoursAfterThreshold: 12,
        escalateTo: "owner",
        notificationMethod: ["email", "in_app", "sms"],
      },
    ],
    isActive: true,
  },
];

// Calculate hours overdue
export function calculateHoursOverdue(requestedAt: Date, thresholdHours: number): number {
  const now = new Date();
  const hoursSinceRequest = (now.getTime() - requestedAt.getTime()) / (1000 * 60 * 60);
  return Math.max(0, hoursSinceRequest - thresholdHours);
}

// Determine current escalation level
export function determineEscalationLevel(
  hoursOverdue: number,
  rule: EscalationRule
): number {
  if (hoursOverdue <= 0) return 0;

  let level = 0;
  for (const escalation of rule.escalationLevels) {
    if (hoursOverdue >= escalation.hoursAfterThreshold) {
      level = escalation.level;
    }
  }
  return level;
}

// Get next escalation time
export function getNextEscalationTime(
  hoursOverdue: number,
  currentLevel: number,
  rule: EscalationRule
): number | undefined {
  const nextLevel = rule.escalationLevels.find((l) => l.level === currentLevel + 1);
  if (!nextLevel) return undefined;
  return Math.max(0, nextLevel.hoursAfterThreshold - hoursOverdue);
}

// Get escalation target role label
export function getEscalationTargetLabel(target: EscalationRule["escalationLevels"][0]["escalateTo"]): string {
  const labels: Record<string, string> = {
    direct_manager: "Direct Manager",
    department_head: "Department Head",
    admin: "System Administrator",
    owner: "System Owner",
  };
  return labels[target] || target;
}

// Generate mock pending escalations
export function generateMockPendingEscalations(): PendingEscalation[] {
  const users = [
    { id: "1", name: "Sarah Johnson", email: "sarah@example.com" },
    { id: "2", name: "Michael Chen", email: "michael@example.com" },
    { id: "3", name: "Emily Rodriguez", email: "emily@example.com" },
    { id: "4", name: "David Kim", email: "david@example.com" },
  ];

  const approvers = [
    { id: "10", name: "Jennifer Smith", email: "jennifer@example.com", role: "Department Head" },
    { id: "11", name: "Robert Wilson", email: "robert@example.com", role: "Manager" },
    { id: "12", name: "Lisa Anderson", email: "lisa@example.com", role: "Admin" },
  ];

  const tasks = [
    { title: "Q4 Budget Approval", type: "approval" },
    { title: "Vendor Contract Signature", type: "signature" },
    { title: "Compliance Audit Review", type: "review" },
    { title: "Grant Application", type: "approval" },
  ];

  const escalations: PendingEscalation[] = [];

  for (let i = 0; i < 6; i++) {
    const fromUser = users[Math.floor(Math.random() * users.length)];
    let toUser = users[Math.floor(Math.random() * users.length)];
    while (toUser.id === fromUser.id) {
      toUser = users[Math.floor(Math.random() * users.length)];
    }
    const approver = approvers[Math.floor(Math.random() * approvers.length)];
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    const priority = Math.random() > 0.5 ? "critical" : "high";
    const rule = defaultEscalationRules.find((r) => r.priority === priority)!;
    
    const hoursAgo = Math.random() * 48 + rule.thresholdHours;
    const requestedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const hoursOverdue = calculateHoursOverdue(requestedAt, rule.thresholdHours);
    const currentLevel = determineEscalationLevel(hoursOverdue, rule);
    const nextEscalationIn = getNextEscalationTime(hoursOverdue, currentLevel, rule);

    escalations.push({
      id: `esc-${i + 1}`,
      delegationId: `del-${i + 100}`,
      taskTitle: task.title,
      taskType: task.type,
      priority,
      fromUser,
      toUser,
      currentApprover: approver,
      requestedAt,
      hoursOverdue: Math.round(hoursOverdue * 10) / 10,
      currentEscalationLevel: currentLevel,
      maxEscalationLevel: rule.escalationLevels.length,
      nextEscalationIn: nextEscalationIn ? Math.round(nextEscalationIn * 10) / 10 : undefined,
      status: currentLevel > 0 ? "escalated" : "pending",
    });
  }

  return escalations.sort((a, b) => b.hoursOverdue - a.hoursOverdue);
}

// Generate mock escalation history
export function generateMockEscalationHistory(): EscalationHistory[] {
  const history: EscalationHistory[] = [];
  const users = [
    { id: "1", name: "Sarah Johnson" },
    { id: "2", name: "Michael Chen" },
    { id: "10", name: "Jennifer Smith" },
    { id: "11", name: "Robert Wilson" },
    { id: "12", name: "Lisa Anderson" },
  ];

  const tasks = [
    "Q4 Budget Approval",
    "Vendor Contract Signature",
    "Compliance Audit Review",
    "Grant Application",
    "Policy Document Review",
  ];

  const reasons: EscalationHistory["reason"][] = ["timeout", "manual", "priority_change", "approver_unavailable"];
  const resolutions: EscalationHistory["resolution"][] = ["approved", "rejected", "further_escalated"];

  for (let i = 0; i < 15; i++) {
    const fromUser = users[Math.floor(Math.random() * users.length)];
    let toUser = users[Math.floor(Math.random() * users.length)];
    while (toUser.id === fromUser.id) {
      toUser = users[Math.floor(Math.random() * users.length)];
    }

    const escalatedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const isResolved = Math.random() > 0.3;

    history.push({
      id: `hist-${i + 1}`,
      delegationId: `del-${i + 200}`,
      taskTitle: tasks[Math.floor(Math.random() * tasks.length)],
      escalatedFrom: fromUser,
      escalatedTo: toUser,
      escalationLevel: Math.floor(Math.random() * 3) + 1,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      escalatedAt,
      resolvedAt: isResolved ? new Date(escalatedAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined,
      resolution: isResolved ? resolutions[Math.floor(Math.random() * resolutions.length)] : undefined,
    });
  }

  return history.sort((a, b) => b.escalatedAt.getTime() - a.escalatedAt.getTime());
}

// Format hours to human readable
export function formatHoursToReadable(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours < 24) {
    return `${Math.round(hours * 10) / 10} hours`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round((hours % 24) * 10) / 10;
    return `${days}d ${remainingHours}h`;
  }
}

// Get escalation urgency color
export function getEscalationUrgencyColor(hoursOverdue: number, priority: "high" | "critical"): string {
  const threshold = priority === "critical" ? 8 : 24;
  const ratio = hoursOverdue / threshold;

  if (ratio >= 2) return "text-red-600 bg-red-50";
  if (ratio >= 1) return "text-orange-600 bg-orange-50";
  return "text-amber-600 bg-amber-50";
}
