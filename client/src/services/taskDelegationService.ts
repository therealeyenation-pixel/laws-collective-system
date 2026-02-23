// Task Delegation Service
// Allows users to reassign tasks to colleagues with notes and deadline adjustments

export interface DelegationRequest {
  taskId: string;
  taskType: "article" | "signature" | "approval" | "deadline";
  fromUserId: string;
  toUserId: string;
  notes: string;
  newDueDate?: Date;
  reason: string;
  priority?: "high" | "medium" | "low";
}

export interface DelegationRecord {
  id: string;
  taskId: string;
  taskType: string;
  taskTitle: string;
  fromUser: {
    id: string;
    name: string;
    email: string;
  };
  toUser: {
    id: string;
    name: string;
    email: string;
  };
  notes: string;
  reason: string;
  originalDueDate: Date | null;
  newDueDate: Date | null;
  delegatedAt: Date;
  status: "pending" | "accepted" | "declined" | "completed";
  acceptedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
}

export interface DelegationStats {
  totalDelegated: number;
  delegatedToMe: number;
  delegatedByMe: number;
  pendingAcceptance: number;
  completedDelegations: number;
}

// Delegation reasons
export const DELEGATION_REASONS = [
  { value: "workload", label: "High workload / capacity constraints" },
  { value: "expertise", label: "Task requires different expertise" },
  { value: "pto", label: "Planned time off / vacation" },
  { value: "priority", label: "Conflicting priorities" },
  { value: "reassignment", label: "Role or responsibility change" },
  { value: "collaboration", label: "Better suited for team collaboration" },
  { value: "other", label: "Other reason" },
];

// Mock data for delegations
const mockDelegations: DelegationRecord[] = [
  {
    id: "del-1",
    taskId: "t1",
    taskType: "article",
    taskTitle: "Review Q4 Financial Report",
    fromUser: { id: "1", name: "Sarah Johnson", email: "sarah.johnson@example.com" },
    toUser: { id: "2", name: "Michael Chen", email: "michael.chen@example.com" },
    notes: "Please review sections 3-5 focusing on compliance aspects.",
    reason: "expertise",
    originalDueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    newDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    delegatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "accepted",
    acceptedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
  },
  {
    id: "del-2",
    taskId: "t2",
    taskType: "signature",
    taskTitle: "Sign Employment Agreement",
    fromUser: { id: "3", name: "Emily Rodriguez", email: "emily.rodriguez@example.com" },
    toUser: { id: "1", name: "Sarah Johnson", email: "sarah.johnson@example.com" },
    notes: "Need backup signature authority while I'm on PTO.",
    reason: "pto",
    originalDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    newDueDate: null,
    delegatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: "pending",
  },
];

// Service functions
export function getDelegations(userId: string): DelegationRecord[] {
  return mockDelegations.filter(
    (d) => d.fromUser.id === userId || d.toUser.id === userId
  );
}

export function getDelegationsToMe(userId: string): DelegationRecord[] {
  return mockDelegations.filter((d) => d.toUser.id === userId);
}

export function getDelegationsByMe(userId: string): DelegationRecord[] {
  return mockDelegations.filter((d) => d.fromUser.id === userId);
}

export function getPendingDelegations(userId: string): DelegationRecord[] {
  return mockDelegations.filter(
    (d) => d.toUser.id === userId && d.status === "pending"
  );
}

export function getDelegationStats(userId: string): DelegationStats {
  const delegatedToMe = mockDelegations.filter((d) => d.toUser.id === userId);
  const delegatedByMe = mockDelegations.filter((d) => d.fromUser.id === userId);
  
  return {
    totalDelegated: delegatedToMe.length + delegatedByMe.length,
    delegatedToMe: delegatedToMe.length,
    delegatedByMe: delegatedByMe.length,
    pendingAcceptance: delegatedToMe.filter((d) => d.status === "pending").length,
    completedDelegations: [...delegatedToMe, ...delegatedByMe].filter(
      (d) => d.status === "completed"
    ).length,
  };
}

export function delegateTask(request: DelegationRequest): DelegationRecord {
  const newDelegation: DelegationRecord = {
    id: `del-${Date.now()}`,
    taskId: request.taskId,
    taskType: request.taskType,
    taskTitle: `Task ${request.taskId}`, // Would be fetched from task service
    fromUser: {
      id: request.fromUserId,
      name: "Current User", // Would be fetched from user service
      email: "user@example.com",
    },
    toUser: {
      id: request.toUserId,
      name: "Delegate User", // Would be fetched from user service
      email: "delegate@example.com",
    },
    notes: request.notes,
    reason: request.reason,
    originalDueDate: null, // Would be fetched from task
    newDueDate: request.newDueDate || null,
    delegatedAt: new Date(),
    status: "pending",
  };
  
  mockDelegations.push(newDelegation);
  return newDelegation;
}

export function acceptDelegation(delegationId: string): DelegationRecord | null {
  const delegation = mockDelegations.find((d) => d.id === delegationId);
  if (delegation) {
    delegation.status = "accepted";
    delegation.acceptedAt = new Date();
  }
  return delegation || null;
}

export function declineDelegation(
  delegationId: string,
  reason: string
): DelegationRecord | null {
  const delegation = mockDelegations.find((d) => d.id === delegationId);
  if (delegation) {
    delegation.status = "declined";
    delegation.declinedAt = new Date();
    delegation.declineReason = reason;
  }
  return delegation || null;
}

export function completeDelegation(delegationId: string): DelegationRecord | null {
  const delegation = mockDelegations.find((d) => d.id === delegationId);
  if (delegation) {
    delegation.status = "completed";
  }
  return delegation || null;
}

// Get available users for delegation
export function getAvailableUsers(): Array<{ id: string; name: string; email: string; department: string }> {
  return [
    { id: "1", name: "Sarah Johnson", email: "sarah.johnson@example.com", department: "Finance" },
    { id: "2", name: "Michael Chen", email: "michael.chen@example.com", department: "Legal" },
    { id: "3", name: "Emily Rodriguez", email: "emily.rodriguez@example.com", department: "Human Resources" },
    { id: "4", name: "David Kim", email: "david.kim@example.com", department: "Operations" },
    { id: "5", name: "Jessica Williams", email: "jessica.williams@example.com", department: "Development" },
  ];
}

// Validate delegation request
export function validateDelegation(request: DelegationRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!request.taskId) {
    errors.push("Task ID is required");
  }
  
  if (!request.toUserId) {
    errors.push("Delegate user is required");
  }
  
  if (request.fromUserId === request.toUserId) {
    errors.push("Cannot delegate task to yourself");
  }
  
  if (!request.reason) {
    errors.push("Delegation reason is required");
  }
  
  if (request.newDueDate && request.newDueDate < new Date()) {
    errors.push("New due date cannot be in the past");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
