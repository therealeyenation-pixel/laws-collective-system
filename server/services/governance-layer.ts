/**
 * Governance Layer Build Service
 * Board Oversight, Policy Management, Strategic Planning
 */

// Board Oversight Types
export interface BoardMember {
  id: number;
  userId?: number;
  name: string;
  title: string;
  role: "chair" | "vice_chair" | "secretary" | "treasurer" | "member";
  committee: string[];
  termStart: Date;
  termEnd: Date;
  status: "active" | "emeritus" | "resigned";
  votingRights: boolean;
}

export interface BoardMeeting {
  id: number;
  title: string;
  type: "regular" | "special" | "annual" | "emergency";
  date: Date;
  location: string;
  isVirtual: boolean;
  agenda: AgendaItem[];
  attendees: number[];
  quorumMet: boolean;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  minutes?: string;
}

export interface AgendaItem {
  order: number;
  title: string;
  type: "information" | "discussion" | "action" | "vote";
  presenter?: string;
  duration: number; // minutes
  resolution?: string;
  votingResult?: VotingResult;
}

export interface VotingResult {
  motion: string;
  yesVotes: number;
  noVotes: number;
  abstentions: number;
  passed: boolean;
  recordedAt: Date;
}

export interface Resolution {
  id: number;
  number: string;
  title: string;
  description: string;
  category: "financial" | "operational" | "strategic" | "governance" | "personnel";
  proposedBy: number;
  proposedAt: Date;
  status: "proposed" | "approved" | "rejected" | "tabled" | "implemented";
  effectiveDate?: Date;
  expiryDate?: Date;
}

// Policy Management Types
export interface Policy {
  id: number;
  number: string;
  title: string;
  category: "hr" | "finance" | "operations" | "compliance" | "governance" | "it" | "safety";
  description: string;
  content: string;
  version: string;
  effectiveDate: Date;
  reviewDate: Date;
  status: "draft" | "under_review" | "approved" | "superseded" | "archived";
  approvedBy?: number;
  approvedAt?: Date;
}

export interface PolicyRevision {
  id: number;
  policyId: number;
  version: string;
  changes: string;
  changedBy: number;
  changedAt: Date;
  reason: string;
}

export interface PolicyAcknowledgment {
  id: number;
  policyId: number;
  userId: number;
  acknowledgedAt: Date;
  version: string;
}

// Strategic Planning Types
export interface StrategicGoal {
  id: number;
  title: string;
  description: string;
  category: "growth" | "financial" | "operational" | "innovation" | "social_impact";
  timeframe: "short_term" | "medium_term" | "long_term";
  targetDate: Date;
  metrics: GoalMetric[];
  status: "not_started" | "in_progress" | "achieved" | "at_risk" | "missed";
  owner: number;
  priority: "low" | "medium" | "high" | "critical";
}

export interface GoalMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
}

export interface Initiative {
  id: number;
  goalId: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  status: "planned" | "active" | "completed" | "on_hold" | "cancelled";
  progress: number;
  owner: number;
}

export interface StrategicReview {
  id: number;
  period: string;
  reviewDate: Date;
  reviewedBy: number[];
  findings: string;
  recommendations: string;
  nextReviewDate: Date;
}

// Board Functions
export function checkQuorum(attendees: number, totalMembers: number, quorumPercent: number = 50): boolean {
  return (attendees / totalMembers) * 100 >= quorumPercent;
}

export function calculateVotingResult(yesVotes: number, noVotes: number, abstentions: number, threshold: number = 50): VotingResult {
  const totalVotes = yesVotes + noVotes;
  const passed = totalVotes > 0 && (yesVotes / totalVotes) * 100 > threshold;
  
  return {
    motion: "",
    yesVotes,
    noVotes,
    abstentions,
    passed,
    recordedAt: new Date()
  };
}

export function createBoardMemberData(
  name: string,
  title: string,
  role: BoardMember["role"],
  termStart: Date,
  termEnd: Date
): Omit<BoardMember, "id"> {
  return {
    name,
    title,
    role,
    committee: [],
    termStart,
    termEnd,
    status: "active",
    votingRights: role !== "emeritus"
  };
}

export function createBoardMeetingData(
  title: string,
  type: BoardMeeting["type"],
  date: Date,
  location: string,
  isVirtual: boolean
): Omit<BoardMeeting, "id"> {
  return {
    title,
    type,
    date,
    location,
    isVirtual,
    agenda: [],
    attendees: [],
    quorumMet: false,
    status: "scheduled"
  };
}

export function createResolutionData(
  number: string,
  title: string,
  description: string,
  category: Resolution["category"],
  proposedBy: number
): Omit<Resolution, "id"> {
  return {
    number,
    title,
    description,
    category,
    proposedBy,
    proposedAt: new Date(),
    status: "proposed"
  };
}

// Policy Functions
export function isPolicyDueForReview(policy: Policy, daysThreshold: number = 30): boolean {
  const daysUntilReview = (policy.reviewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return daysUntilReview <= daysThreshold;
}

export function generatePolicyNumber(category: Policy["category"], sequence: number): string {
  const prefixes: Record<Policy["category"], string> = {
    hr: "HR",
    finance: "FIN",
    operations: "OPS",
    compliance: "COMP",
    governance: "GOV",
    it: "IT",
    safety: "SAF"
  };
  return `${prefixes[category]}-${String(sequence).padStart(4, "0")}`;
}

export function createPolicyData(
  number: string,
  title: string,
  category: Policy["category"],
  description: string,
  content: string
): Omit<Policy, "id"> {
  const effectiveDate = new Date();
  const reviewDate = new Date();
  reviewDate.setFullYear(reviewDate.getFullYear() + 1);

  return {
    number,
    title,
    category,
    description,
    content,
    version: "1.0",
    effectiveDate,
    reviewDate,
    status: "draft"
  };
}

// Strategic Planning Functions
export function calculateGoalProgress(metrics: GoalMetric[]): number {
  if (metrics.length === 0) return 0;
  
  const totalProgress = metrics.reduce((sum, metric) => {
    const progress = metric.target > 0 ? Math.min((metric.current / metric.target) * 100, 100) : 0;
    return sum + progress;
  }, 0);
  
  return Math.round(totalProgress / metrics.length);
}

export function getGoalStatus(progress: number, targetDate: Date): StrategicGoal["status"] {
  const daysRemaining = (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  
  if (progress >= 100) return "achieved";
  if (daysRemaining < 0) return "missed";
  
  // Expected progress based on time elapsed
  const totalDays = (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  const expectedProgress = totalDays > 0 ? 100 : 0;
  
  if (progress < expectedProgress * 0.7) return "at_risk";
  return "in_progress";
}

export function createStrategicGoalData(
  title: string,
  description: string,
  category: StrategicGoal["category"],
  timeframe: StrategicGoal["timeframe"],
  targetDate: Date,
  owner: number,
  priority: StrategicGoal["priority"]
): Omit<StrategicGoal, "id"> {
  return {
    title,
    description,
    category,
    timeframe,
    targetDate,
    metrics: [],
    status: "not_started",
    owner,
    priority
  };
}

export function createInitiativeData(
  goalId: number,
  title: string,
  description: string,
  startDate: Date,
  endDate: Date,
  owner: number,
  budget?: number
): Omit<Initiative, "id"> {
  return {
    goalId,
    title,
    description,
    startDate,
    endDate,
    budget,
    status: "planned",
    progress: 0,
    owner
  };
}

export function getGovernanceLayerSummary() {
  return {
    modules: ["Board Oversight", "Policy Management", "Strategic Planning"],
    boardRoles: ["chair", "vice_chair", "secretary", "treasurer", "member"],
    meetingTypes: ["regular", "special", "annual", "emergency"],
    resolutionCategories: ["financial", "operational", "strategic", "governance", "personnel"],
    policyCategories: ["hr", "finance", "operations", "compliance", "governance", "it", "safety"],
    goalCategories: ["growth", "financial", "operational", "innovation", "social_impact"],
    timeframes: ["short_term", "medium_term", "long_term"]
  };
}
