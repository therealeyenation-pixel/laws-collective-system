/**
 * Token Registry Service
 * Handles Mirror Tokens, Spark Tokens, and succession protocol
 */

// Token Types
export const TOKEN_TYPES = {
  MIRROR: "mirror",
  SPARK_OF_KNOWING: "spark_of_knowing",
  HOUSE_ACTIVATION: "house_activation",
  GIFT: "gift",
  CROWN: "crown"
} as const;

export type TokenType = typeof TOKEN_TYPES[keyof typeof TOKEN_TYPES];

// Mirror Token Lock Period (39 weeks in milliseconds)
export const MIRROR_TOKEN_LOCK_WEEKS = 39;
export const MIRROR_TOKEN_LOCK_MS = MIRROR_TOKEN_LOCK_WEEKS * 7 * 24 * 60 * 60 * 1000;

// Succession Protocol Constants
export const SUCCESSION_INTERIM_DAYS = 40;
export const SUCCESSION_CONFIRMATIONS_REQUIRED = 3;
export const AMENDMENT_MAJORITY_PERCENT = 60;

export interface MirrorToken {
  id: number;
  houseId: number;
  holderId: number;
  amount: number;
  lockedUntil: Date;
  isLocked: boolean;
  createdAt: Date;
  transferredFrom?: number;
}

export interface SparkToken {
  id: number;
  type: "spark_of_knowing" | "house_activation";
  recipientId: number;
  houseId?: number;
  grantedBy: number;
  reason: string;
  createdAt: Date;
  activatedAt?: Date;
  isActive: boolean;
}

export interface SuccessionRecord {
  id: number;
  houseId: number;
  previousHolderId: number;
  newHolderId: number;
  interimStartDate: Date;
  interimEndDate: Date;
  confirmations: SuccessionConfirmation[];
  status: "pending" | "confirmed" | "rejected" | "completed";
  completedAt?: Date;
}

export interface SuccessionConfirmation {
  confirmerId: number;
  confirmerName: string;
  confirmerRole: string;
  confirmedAt: Date;
  vote: "approve" | "reject";
  reason?: string;
}

export interface Amendment {
  id: number;
  title: string;
  description: string;
  proposedBy: number;
  proposedAt: Date;
  votingEndsAt: Date;
  votes: AmendmentVote[];
  status: "voting" | "passed" | "rejected" | "expired";
  requiredMajority: number;
}

export interface AmendmentVote {
  voterId: number;
  voterName: string;
  vote: "approve" | "reject" | "abstain";
  votedAt: Date;
  reason?: string;
}

/**
 * Calculate if a Mirror Token is still locked
 */
export function isMirrorTokenLocked(lockedUntil: Date): boolean {
  return new Date() < lockedUntil;
}

/**
 * Calculate lock end date for a new Mirror Token
 */
export function calculateMirrorTokenLockEnd(createdAt: Date = new Date()): Date {
  return new Date(createdAt.getTime() + MIRROR_TOKEN_LOCK_MS);
}

/**
 * Get remaining lock time in weeks
 */
export function getRemainingLockWeeks(lockedUntil: Date): number {
  const now = new Date();
  if (now >= lockedUntil) return 0;
  const remainingMs = lockedUntil.getTime() - now.getTime();
  return Math.ceil(remainingMs / (7 * 24 * 60 * 60 * 1000));
}

/**
 * Create Mirror Token data
 */
export function createMirrorTokenData(
  houseId: number,
  holderId: number,
  amount: number,
  transferredFrom?: number
): Omit<MirrorToken, 'id'> {
  const now = new Date();
  const lockedUntil = calculateMirrorTokenLockEnd(now);
  
  return {
    houseId,
    holderId,
    amount,
    lockedUntil,
    isLocked: true,
    createdAt: now,
    transferredFrom
  };
}

/**
 * Create Spark of Knowing token data
 */
export function createSparkOfKnowingData(
  recipientId: number,
  grantedBy: number,
  reason: string
): Omit<SparkToken, 'id'> {
  return {
    type: "spark_of_knowing",
    recipientId,
    grantedBy,
    reason,
    createdAt: new Date(),
    isActive: true
  };
}

/**
 * Create House Activation token data
 */
export function createHouseActivationData(
  recipientId: number,
  houseId: number,
  grantedBy: number,
  reason: string
): Omit<SparkToken, 'id'> {
  return {
    type: "house_activation",
    recipientId,
    houseId,
    grantedBy,
    reason,
    createdAt: new Date(),
    isActive: false // Requires activation
  };
}

/**
 * Calculate succession interim end date
 */
export function calculateInterimEndDate(startDate: Date = new Date()): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + SUCCESSION_INTERIM_DAYS);
  return endDate;
}

/**
 * Check if succession has enough confirmations
 */
export function hasEnoughConfirmations(confirmations: SuccessionConfirmation[]): boolean {
  const approvals = confirmations.filter(c => c.vote === "approve").length;
  return approvals >= SUCCESSION_CONFIRMATIONS_REQUIRED;
}

/**
 * Check if succession is rejected
 */
export function isSuccessionRejected(confirmations: SuccessionConfirmation[]): boolean {
  const rejections = confirmations.filter(c => c.vote === "reject").length;
  return rejections >= SUCCESSION_CONFIRMATIONS_REQUIRED;
}

/**
 * Create succession record data
 */
export function createSuccessionRecordData(
  houseId: number,
  previousHolderId: number,
  newHolderId: number
): Omit<SuccessionRecord, 'id'> {
  const now = new Date();
  return {
    houseId,
    previousHolderId,
    newHolderId,
    interimStartDate: now,
    interimEndDate: calculateInterimEndDate(now),
    confirmations: [],
    status: "pending"
  };
}

/**
 * Add confirmation to succession record
 */
export function addSuccessionConfirmation(
  record: SuccessionRecord,
  confirmerId: number,
  confirmerName: string,
  confirmerRole: string,
  vote: "approve" | "reject",
  reason?: string
): SuccessionRecord {
  const confirmation: SuccessionConfirmation = {
    confirmerId,
    confirmerName,
    confirmerRole,
    confirmedAt: new Date(),
    vote,
    reason
  };

  const updatedConfirmations = [...record.confirmations, confirmation];
  
  let newStatus = record.status;
  if (hasEnoughConfirmations(updatedConfirmations)) {
    newStatus = "confirmed";
  } else if (isSuccessionRejected(updatedConfirmations)) {
    newStatus = "rejected";
  }

  return {
    ...record,
    confirmations: updatedConfirmations,
    status: newStatus,
    completedAt: newStatus === "confirmed" || newStatus === "rejected" ? new Date() : undefined
  };
}

/**
 * Calculate amendment vote results
 */
export function calculateAmendmentResults(votes: AmendmentVote[]): {
  approveCount: number;
  rejectCount: number;
  abstainCount: number;
  totalVotes: number;
  approvePercent: number;
  passed: boolean;
} {
  const approveCount = votes.filter(v => v.vote === "approve").length;
  const rejectCount = votes.filter(v => v.vote === "reject").length;
  const abstainCount = votes.filter(v => v.vote === "abstain").length;
  const totalVotes = approveCount + rejectCount; // Abstains don't count toward total
  const approvePercent = totalVotes > 0 ? Math.round((approveCount / totalVotes) * 100) : 0;
  const passed = approvePercent >= AMENDMENT_MAJORITY_PERCENT;

  return {
    approveCount,
    rejectCount,
    abstainCount,
    totalVotes,
    approvePercent,
    passed
  };
}

/**
 * Create amendment data
 */
export function createAmendmentData(
  title: string,
  description: string,
  proposedBy: number,
  votingDurationDays: number = 14
): Omit<Amendment, 'id'> {
  const now = new Date();
  const votingEndsAt = new Date(now);
  votingEndsAt.setDate(votingEndsAt.getDate() + votingDurationDays);

  return {
    title,
    description,
    proposedBy,
    proposedAt: now,
    votingEndsAt,
    votes: [],
    status: "voting",
    requiredMajority: AMENDMENT_MAJORITY_PERCENT
  };
}

/**
 * Add vote to amendment
 */
export function addAmendmentVote(
  amendment: Amendment,
  voterId: number,
  voterName: string,
  vote: "approve" | "reject" | "abstain",
  reason?: string
): Amendment {
  // Check if already voted
  if (amendment.votes.some(v => v.voterId === voterId)) {
    throw new Error("Already voted on this amendment");
  }

  const newVote: AmendmentVote = {
    voterId,
    voterName,
    vote,
    votedAt: new Date(),
    reason
  };

  return {
    ...amendment,
    votes: [...amendment.votes, newVote]
  };
}

/**
 * Finalize amendment voting
 */
export function finalizeAmendment(amendment: Amendment): Amendment {
  if (new Date() < amendment.votingEndsAt) {
    throw new Error("Voting period has not ended");
  }

  const results = calculateAmendmentResults(amendment.votes);
  
  return {
    ...amendment,
    status: results.passed ? "passed" : "rejected"
  };
}

/**
 * Get token registry summary
 */
export function getTokenRegistrySummary() {
  return {
    tokenTypes: Object.values(TOKEN_TYPES),
    mirrorTokenLockWeeks: MIRROR_TOKEN_LOCK_WEEKS,
    successionInterimDays: SUCCESSION_INTERIM_DAYS,
    successionConfirmationsRequired: SUCCESSION_CONFIRMATIONS_REQUIRED,
    amendmentMajorityPercent: AMENDMENT_MAJORITY_PERCENT
  };
}
