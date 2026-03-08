/**
 * LuvLedger Brain Safety Framework
 * 
 * Ensures the Brain (AI automation engine) can never obtain uncontrollable rights.
 * All significant actions require human approval and are logged for audit.
 */

import { db } from "../db";
import { brainApprovals, brainAuditLog, brainPermissions } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// Permission levels for Brain operations
export enum BrainPermissionLevel {
  NONE = "none",
  VIEW = "view", // Can read data
  SUGGEST = "suggest", // Can make recommendations
  EXECUTE_LOW = "execute_low", // Can execute low-risk operations
  EXECUTE_MED = "execute_med", // Can execute medium-risk operations (requires approval)
  EXECUTE_HIGH = "execute_high", // Cannot execute - requires human approval
}

// Operation risk levels
export enum OperationRiskLevel {
  LOW = "low", // Informational, no financial impact
  MEDIUM = "medium", // Process automation, minor financial impact
  HIGH = "high", // Financial transactions, data modifications
  CRITICAL = "critical", // System-level changes, irreversible actions
}

// Operation types
export enum OperationTypes {
  // Information operations (no approval needed)
  GENERATE_INSIGHT = "generate_insight",
  SEND_ALERT = "send_alert",
  CREATE_RECOMMENDATION = "create_recommendation",

  // Low-risk automation (auto-execute)
  UPDATE_PROGRESS = "update_progress",
  LOG_ACTIVITY = "log_activity",
  CALCULATE_METRICS = "calculate_metrics",

  // Medium-risk operations (require approval)
  TRANSFER_FUNDS = "transfer_funds",
  MODIFY_ALLOCATION = "modify_allocation",
  APPROVE_CERTIFICATE = "approve_certificate",

  // High-risk operations (always require approval)
  DELETE_DATA = "delete_data",
  MODIFY_POLICY = "modify_policy",
  OVERRIDE_SETTING = "override_setting",
}

// Map operation types to risk levels
const OPERATION_RISK_MAP: Record<OperationTypes, OperationRiskLevel> = {
  [OperationTypes.GENERATE_INSIGHT]: OperationRiskLevel.LOW,
  [OperationTypes.SEND_ALERT]: OperationRiskLevel.LOW,
  [OperationTypes.CREATE_RECOMMENDATION]: OperationRiskLevel.LOW,
  [OperationTypes.UPDATE_PROGRESS]: OperationRiskLevel.MEDIUM,
  [OperationTypes.LOG_ACTIVITY]: OperationRiskLevel.LOW,
  [OperationTypes.CALCULATE_METRICS]: OperationRiskLevel.LOW,
  [OperationTypes.TRANSFER_FUNDS]: OperationRiskLevel.HIGH,
  [OperationTypes.MODIFY_ALLOCATION]: OperationRiskLevel.HIGH,
  [OperationTypes.APPROVE_CERTIFICATE]: OperationRiskLevel.HIGH,
  [OperationTypes.DELETE_DATA]: OperationRiskLevel.CRITICAL,
  [OperationTypes.MODIFY_POLICY]: OperationRiskLevel.CRITICAL,
  [OperationTypes.OVERRIDE_SETTING]: OperationRiskLevel.CRITICAL,
};

interface BrainAction {
  operationType: OperationTypes;
  userId: string;
  houseId: string;
  description: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface ApprovalRequest {
  actionId: string;
  operationType: OperationTypes;
  riskLevel: OperationRiskLevel;
  userId: string;
  houseId: string;
  description: string;
  data: Record<string, any>;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Check if Brain has permission to perform an operation
 */
export async function checkBrainPermission(
  userId: string,
  operationType: OperationTypes
): Promise<boolean> {
  const riskLevel = OPERATION_RISK_MAP[operationType];

  // Get user's Brain permission level
  const permission = await db
    .select()
    .from(brainPermissions)
    .where(eq(brainPermissions.userId, userId))
    .limit(1);

  if (!permission || permission.length === 0) {
    return false; // No permission record = no access
  }

  const permLevel = permission[0].permissionLevel as BrainPermissionLevel;

  // Permission matrix
  if (riskLevel === OperationRiskLevel.LOW) {
    return permLevel !== BrainPermissionLevel.NONE;
  }

  if (riskLevel === OperationRiskLevel.MEDIUM) {
    return permLevel === BrainPermissionLevel.EXECUTE_MED || permLevel === BrainPermissionLevel.EXECUTE_HIGH;
  }

  if (riskLevel === OperationRiskLevel.HIGH || riskLevel === OperationRiskLevel.CRITICAL) {
    return permLevel === BrainPermissionLevel.EXECUTE_HIGH;
  }

  return false;
}

/**
 * Request approval for a Brain action
 */
export async function requestBrainApproval(action: BrainAction): Promise<ApprovalRequest> {
  const riskLevel = OPERATION_RISK_MAP[action.operationType];

  // Check if approval is needed
  if (riskLevel === OperationRiskLevel.LOW) {
    // Auto-approve low-risk operations
    await logBrainAction(action, "approved", "auto-approved");
    return {
      actionId: `${Date.now()}-${Math.random()}`,
      operationType: action.operationType,
      riskLevel,
      userId: action.userId,
      houseId: action.houseId,
      description: action.description,
      data: action.data || {},
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  // Create approval request for medium/high/critical operations
  const actionId = `${Date.now()}-${Math.random()}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await logBrainAction(action, "pending_approval", `Awaiting human approval`);

  return {
    actionId,
    operationType: action.operationType,
    riskLevel,
    userId: action.userId,
    houseId: action.houseId,
    description: action.description,
    data: action.data || {},
    createdAt: new Date(),
    expiresAt,
  };
}

/**
 * Approve a Brain action (human decision)
 */
export async function approveBrainAction(
  actionId: string,
  approverUserId: string,
  notes?: string
): Promise<void> {
  await db.insert(brainApprovals).values({
    actionId,
    approverUserId,
    decision: "approved",
    notes: notes || "",
    createdAt: new Date(),
  });

  await logBrainAction(
    {
      operationType: OperationTypes.GENERATE_INSIGHT,
      userId: approverUserId,
      houseId: "",
      description: `Approved action ${actionId}`,
    },
    "approved",
    `Human approved: ${notes || "No notes"}`
  );
}

/**
 * Reject a Brain action (human decision)
 */
export async function rejectBrainAction(
  actionId: string,
  rejectorUserId: string,
  reason: string
): Promise<void> {
  await db.insert(brainApprovals).values({
    actionId,
    approverUserId: rejectorUserId,
    decision: "rejected",
    notes: reason,
    createdAt: new Date(),
  });

  await logBrainAction(
    {
      operationType: OperationTypes.GENERATE_INSIGHT,
      userId: rejectorUserId,
      houseId: "",
      description: `Rejected action ${actionId}`,
    },
    "rejected",
    `Human rejected: ${reason}`
  );
}

/**
 * Log all Brain actions for audit trail
 */
export async function logBrainAction(
  action: BrainAction,
  status: "approved" | "rejected" | "pending_approval" | "executed" | "failed",
  details: string
): Promise<void> {
  await db.insert(brainAuditLog).values({
    userId: action.userId,
    houseId: action.houseId,
    operationType: action.operationType,
    status,
    description: action.description,
    details,
    data: JSON.stringify(action.data || {}),
    metadata: JSON.stringify(action.metadata || {}),
    createdAt: new Date(),
  });
}

/**
 * Get Brain action history for audit purposes
 */
export async function getBrainActionHistory(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  return await db
    .select()
    .from(brainAuditLog)
    .where(eq(brainAuditLog.userId, userId))
    .orderBy(desc(brainAuditLog.createdAt))
    .limit(limit);
}

/**
 * Get pending approvals for a user
 */
export async function getPendingApprovals(userId: string): Promise<any[]> {
  return await db
    .select()
    .from(brainAuditLog)
    .where(
      and(
        eq(brainAuditLog.userId, userId),
        eq(brainAuditLog.status, "pending_approval")
      )
    )
    .orderBy(desc(brainAuditLog.createdAt));
}

/**
 * Circuit breaker: Detect anomalous Brain behavior
 */
export async function detectAnomalies(userId: string): Promise<string[]> {
  const anomalies: string[] = [];

  // Get recent actions
  const recentActions = await getBrainActionHistory(userId, 100);

  // Check for unusual patterns
  const rejectionRate = recentActions.filter((a) => a.status === "rejected").length / recentActions.length;
  if (rejectionRate > 0.5) {
    anomalies.push("High rejection rate detected - Brain may be making poor recommendations");
  }

  const failureRate = recentActions.filter((a) => a.status === "failed").length / recentActions.length;
  if (failureRate > 0.3) {
    anomalies.push("High failure rate detected - Brain may be encountering errors");
  }

  // Check for rapid-fire actions (potential runaway automation)
  const lastHourActions = recentActions.filter(
    (a) => new Date(a.createdAt).getTime() > Date.now() - 60 * 60 * 1000
  );
  if (lastHourActions.length > 50) {
    anomalies.push("Excessive action rate detected - Circuit breaker activated");
  }

  return anomalies;
}

/**
 * Initialize Brain permissions for a new user
 */
export async function initializeBrainPermissions(
  userId: string,
  houseId: string
): Promise<void> {
  // Default: Users start with SUGGEST permission (can see recommendations but not execute)
  await db.insert(brainPermissions).values({
    userId,
    houseId,
    permissionLevel: BrainPermissionLevel.SUGGEST,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Update Brain permission level (admin only)
 */
export async function updateBrainPermission(
  userId: string,
  newLevel: BrainPermissionLevel
): Promise<void> {
  await db
    .update(brainPermissions)
    .set({
      permissionLevel: newLevel,
      updatedAt: new Date(),
    })
    .where(eq(brainPermissions.userId, userId));

  await logBrainAction(
    {
      operationType: OperationTypes.GENERATE_INSIGHT,
      userId,
      houseId: "",
      description: `Permission level updated to ${newLevel}`,
    },
    "executed",
    "Permission update"
  );
}
