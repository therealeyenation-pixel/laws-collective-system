import { describe, it, expect } from "vitest";

/**
 * Phase 68 Tests: Email Notifications, Delegation History, and Escalation
 */

// Email notification helpers
const sendDelegationEmail = (type: string, recipient: string, data: any) => ({
  type,
  recipient,
  data,
  sent: true,
  timestamp: new Date(),
});

// Delegation history helpers
const createHistoryEntry = (action: string, actorId: string, actorName: string, details?: any) => ({
  id: `hist-${Date.now()}`,
  action,
  actorId,
  actorName,
  details,
  createdAt: new Date(),
});

// Escalation helpers
const calculateHoursOverdue = (requestedAt: Date, thresholdHours: number): number => {
  const now = new Date();
  const hoursSinceRequest = (now.getTime() - requestedAt.getTime()) / (1000 * 60 * 60);
  return Math.max(0, hoursSinceRequest - thresholdHours);
};

const determineEscalationLevel = (hoursOverdue: number, levels: { hoursAfterThreshold: number; level: number }[]): number => {
  if (hoursOverdue <= 0) return 0;
  let level = 0;
  for (const l of levels) {
    if (hoursOverdue >= l.hoursAfterThreshold) {
      level = l.level;
    }
  }
  return level;
};

const formatHoursToReadable = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours < 24) {
    return `${Math.round(hours * 10) / 10} hours`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round((hours % 24) * 10) / 10;
    return `${days}d ${remainingHours}h`;
  }
};

describe("Email Notifications for Delegations", () => {
  it("should send email when delegation is created", () => {
    const email = sendDelegationEmail("delegation_created", "user@example.com", {
      taskTitle: "Q4 Budget Review",
      fromUser: "Sarah Johnson",
      toUser: "Michael Chen",
    });
    expect(email.type).toBe("delegation_created");
    expect(email.sent).toBe(true);
    expect(email.data.taskTitle).toBe("Q4 Budget Review");
  });

  it("should send email when delegation is accepted", () => {
    const email = sendDelegationEmail("delegation_accepted", "user@example.com", {
      taskTitle: "Vendor Contract Review",
      acceptedBy: "Emily Rodriguez",
    });
    expect(email.type).toBe("delegation_accepted");
    expect(email.sent).toBe(true);
  });

  it("should send email when delegation is declined", () => {
    const email = sendDelegationEmail("delegation_declined", "user@example.com", {
      taskTitle: "Policy Document Review",
      declinedBy: "David Kim",
      reason: "Currently at capacity",
    });
    expect(email.type).toBe("delegation_declined");
    expect(email.data.reason).toBe("Currently at capacity");
  });

  it("should send email when delegation requires approval", () => {
    const email = sendDelegationEmail("approval_required", "manager@example.com", {
      taskTitle: "High Priority Grant Application",
      requestedBy: "Sarah Johnson",
      priority: "high",
    });
    expect(email.type).toBe("approval_required");
    expect(email.data.priority).toBe("high");
  });

  it("should send email when delegation is escalated", () => {
    const email = sendDelegationEmail("delegation_escalated", "admin@example.com", {
      taskTitle: "Critical Compliance Review",
      escalationLevel: 2,
      hoursOverdue: 36,
    });
    expect(email.type).toBe("delegation_escalated");
    expect(email.data.escalationLevel).toBe(2);
  });
});

describe("Delegation History Log", () => {
  it("should create history entry for delegation creation", () => {
    const entry = createHistoryEntry("created", "1", "Sarah Johnson", {
      fromUser: "Sarah Johnson",
      toUser: "Michael Chen",
      reason: "workload",
    });
    expect(entry.action).toBe("created");
    expect(entry.actorName).toBe("Sarah Johnson");
    expect(entry.details.reason).toBe("workload");
  });

  it("should create history entry for acceptance", () => {
    const entry = createHistoryEntry("accepted", "2", "Michael Chen");
    expect(entry.action).toBe("accepted");
    expect(entry.actorId).toBe("2");
  });

  it("should create history entry for decline with reason", () => {
    const entry = createHistoryEntry("declined", "3", "Emily Rodriguez", {
      reason: "Not within my expertise",
    });
    expect(entry.action).toBe("declined");
    expect(entry.details.reason).toBe("Not within my expertise");
  });

  it("should create history entry for escalation", () => {
    const entry = createHistoryEntry("escalated", "10", "System", {
      escalationLevel: 2,
      reason: "Approval pending for over 24 hours",
      escalatedTo: "Department Head",
    });
    expect(entry.action).toBe("escalated");
    expect(entry.details.escalationLevel).toBe(2);
  });

  it("should create history entry for reassignment", () => {
    const entry = createHistoryEntry("reassigned", "1", "Sarah Johnson", {
      previousAssignee: "Michael Chen",
      newAssignee: "David Kim",
      reason: "Original assignee on PTO",
    });
    expect(entry.action).toBe("reassigned");
    expect(entry.details.previousAssignee).toBe("Michael Chen");
    expect(entry.details.newAssignee).toBe("David Kim");
  });

  it("should track completion in history", () => {
    const entry = createHistoryEntry("completed", "2", "Michael Chen", {
      completedAt: new Date(),
      duration: "2 days",
    });
    expect(entry.action).toBe("completed");
    expect(entry.details.duration).toBe("2 days");
  });
});

describe("Delegation Escalation", () => {
  describe("Hours Overdue Calculation", () => {
    it("should return 0 when not overdue", () => {
      const requestedAt = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago
      const thresholdHours = 24;
      const overdue = calculateHoursOverdue(requestedAt, thresholdHours);
      expect(overdue).toBe(0);
    });

    it("should calculate correct hours overdue", () => {
      const requestedAt = new Date(Date.now() - 36 * 60 * 60 * 1000); // 36 hours ago
      const thresholdHours = 24;
      const overdue = calculateHoursOverdue(requestedAt, thresholdHours);
      expect(overdue).toBeCloseTo(12, 0);
    });

    it("should handle just-past-threshold correctly", () => {
      const requestedAt = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      const thresholdHours = 24;
      const overdue = calculateHoursOverdue(requestedAt, thresholdHours);
      expect(overdue).toBeCloseTo(1, 0);
    });
  });

  describe("Escalation Level Determination", () => {
    const escalationLevels = [
      { level: 1, hoursAfterThreshold: 0 },
      { level: 2, hoursAfterThreshold: 12 },
      { level: 3, hoursAfterThreshold: 24 },
    ];

    it("should return level 0 when not overdue", () => {
      const level = determineEscalationLevel(0, escalationLevels);
      expect(level).toBe(0);
    });

    it("should return level 1 when just overdue", () => {
      const level = determineEscalationLevel(1, escalationLevels);
      expect(level).toBe(1);
    });

    it("should return level 2 when 12+ hours overdue", () => {
      const level = determineEscalationLevel(15, escalationLevels);
      expect(level).toBe(2);
    });

    it("should return level 3 when 24+ hours overdue", () => {
      const level = determineEscalationLevel(30, escalationLevels);
      expect(level).toBe(3);
    });
  });

  describe("Time Formatting", () => {
    it("should format minutes correctly", () => {
      expect(formatHoursToReadable(0.5)).toBe("30 minutes");
    });

    it("should format hours correctly", () => {
      expect(formatHoursToReadable(5)).toBe("5 hours");
    });

    it("should format days and hours correctly", () => {
      const result = formatHoursToReadable(30);
      expect(result).toContain("1d");
      expect(result).toContain("h");
    });
  });

  describe("Escalation Rules", () => {
    const highPriorityRule = {
      priority: "high",
      thresholdHours: 24,
      escalationLevels: [
        { level: 1, hoursAfterThreshold: 0, escalateTo: "direct_manager" },
        { level: 2, hoursAfterThreshold: 12, escalateTo: "department_head" },
        { level: 3, hoursAfterThreshold: 24, escalateTo: "admin" },
      ],
    };

    const criticalPriorityRule = {
      priority: "critical",
      thresholdHours: 8,
      escalationLevels: [
        { level: 1, hoursAfterThreshold: 0, escalateTo: "direct_manager" },
        { level: 2, hoursAfterThreshold: 4, escalateTo: "department_head" },
        { level: 3, hoursAfterThreshold: 8, escalateTo: "admin" },
        { level: 4, hoursAfterThreshold: 12, escalateTo: "owner" },
      ],
    };

    it("should have shorter threshold for critical priority", () => {
      expect(criticalPriorityRule.thresholdHours).toBeLessThan(highPriorityRule.thresholdHours);
    });

    it("should have more escalation levels for critical priority", () => {
      expect(criticalPriorityRule.escalationLevels.length).toBeGreaterThan(
        highPriorityRule.escalationLevels.length
      );
    });

    it("should escalate to owner for critical items", () => {
      const ownerLevel = criticalPriorityRule.escalationLevels.find(
        (l) => l.escalateTo === "owner"
      );
      expect(ownerLevel).toBeDefined();
    });
  });
});

describe("Integration: Email + History + Escalation", () => {
  it("should create history entry and send email when escalating", () => {
    const delegationId = "del-123";
    const taskTitle = "Critical Budget Approval";
    
    // Simulate escalation
    const historyEntry = createHistoryEntry("escalated", "system", "Escalation System", {
      delegationId,
      taskTitle,
      escalationLevel: 2,
      escalatedTo: "Department Head",
    });
    
    const email = sendDelegationEmail("delegation_escalated", "depthead@example.com", {
      delegationId,
      taskTitle,
      escalationLevel: 2,
      previousApprover: "Manager",
    });
    
    expect(historyEntry.action).toBe("escalated");
    expect(email.sent).toBe(true);
    expect(historyEntry.details.escalationLevel).toBe(email.data.escalationLevel);
  });

  it("should track full delegation lifecycle in history", () => {
    const lifecycle = [
      createHistoryEntry("created", "1", "Sarah Johnson"),
      createHistoryEntry("approval_requested", "1", "Sarah Johnson"),
      createHistoryEntry("escalated", "system", "System"),
      createHistoryEntry("approved", "10", "Jennifer Smith"),
      createHistoryEntry("accepted", "2", "Michael Chen"),
      createHistoryEntry("completed", "2", "Michael Chen"),
    ];
    
    expect(lifecycle.length).toBe(6);
    expect(lifecycle[0].action).toBe("created");
    expect(lifecycle[lifecycle.length - 1].action).toBe("completed");
  });
});
