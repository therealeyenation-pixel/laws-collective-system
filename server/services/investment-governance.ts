/**
 * Investment Governance Service
 * 
 * Manages investment proposals, board approvals, and investment policy compliance
 * for the 508 organization's investment activities.
 */

// Investment Proposal Types
export const PROPOSAL_TYPES = [
  'new_investment',
  'increase_position',
  'decrease_position',
  'liquidate_position',
  'asset_reallocation',
  'manager_change',
  'policy_change',
  'emergency_action',
] as const;

export type ProposalType = typeof PROPOSAL_TYPES[number];

// Proposal Status
export const PROPOSAL_STATUSES = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'implemented',
  'cancelled',
] as const;

export type ProposalStatus = typeof PROPOSAL_STATUSES[number];

// Investment Policy Categories
export const POLICY_CATEGORIES = [
  'asset_allocation',
  'risk_management',
  'esg_criteria',
  'liquidity_requirements',
  'concentration_limits',
  'prohibited_investments',
  'performance_benchmarks',
  'reporting_requirements',
] as const;

export type PolicyCategory = typeof POLICY_CATEGORIES[number];

// Vote Types
export const VOTE_TYPES = ['approve', 'reject', 'abstain'] as const;
export type VoteType = typeof VOTE_TYPES[number];

// Interfaces
export interface InvestmentProposal {
  id: string;
  entityId: string;
  proposalNumber: string;
  type: ProposalType;
  title: string;
  description: string;
  rationale: string;
  
  // Investment details
  ticker?: string;
  assetClass?: string;
  proposedAmount: number;
  currentAmount?: number;
  targetAllocation?: number;
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  riskFactors: string[];
  mitigationStrategies: string[];
  
  // Financial projections
  expectedReturn?: number;
  timeHorizon?: string;
  exitStrategy?: string;
  
  // Approval requirements
  requiredApprovers: string[];
  minimumVotes: number;
  approvalThreshold: number; // percentage needed to approve
  
  // Status tracking
  status: ProposalStatus;
  submittedBy: string;
  submittedAt?: Date;
  reviewDeadline?: Date;
  implementationDeadline?: Date;
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  implementedAt?: Date;
  implementedBy?: string;
}

export interface ProposalVote {
  id: string;
  proposalId: string;
  voterId: string;
  voterName: string;
  voterRole: string;
  vote: VoteType;
  comments?: string;
  votedAt: Date;
}

export interface InvestmentPolicy {
  id: string;
  entityId: string;
  category: PolicyCategory;
  name: string;
  description: string;
  rules: PolicyRule[];
  effectiveDate: Date;
  expirationDate?: Date;
  status: 'active' | 'inactive' | 'pending_review';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyRule {
  id: string;
  name: string;
  condition: string;
  threshold?: number;
  operator?: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'neq' | 'between';
  minValue?: number;
  maxValue?: number;
  action: 'require_approval' | 'prohibit' | 'alert' | 'log';
  severity: 'info' | 'warning' | 'critical';
}

export interface PolicyViolation {
  id: string;
  entityId: string;
  policyId: string;
  ruleId: string;
  proposalId?: string;
  holdingId?: string;
  transactionId?: string;
  violationType: string;
  description: string;
  currentValue: number;
  thresholdValue: number;
  severity: 'info' | 'warning' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved' | 'waived';
  detectedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}

export interface InvestmentCommittee {
  id: string;
  entityId: string;
  name: string;
  description: string;
  members: CommitteeMember[];
  quorumRequirement: number; // minimum members for valid meeting
  approvalThreshold: number; // percentage for approval
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'as_needed';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CommitteeMember {
  id: string;
  userId: string;
  name: string;
  role: 'chair' | 'vice_chair' | 'member' | 'advisor';
  votingRights: boolean;
  joinedAt: Date;
  term?: string;
}

export interface CommitteeMeeting {
  id: string;
  committeeId: string;
  meetingNumber: string;
  scheduledDate: Date;
  actualDate?: Date;
  location: string;
  attendees: string[];
  quorumMet: boolean;
  agendaItems: AgendaItem[];
  minutes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface AgendaItem {
  id: string;
  order: number;
  type: 'proposal_review' | 'policy_review' | 'performance_review' | 'other';
  title: string;
  description: string;
  proposalId?: string;
  policyId?: string;
  presenter?: string;
  timeAllotted?: number; // minutes
  outcome?: string;
  voteTaken?: boolean;
  voteResult?: 'approved' | 'rejected' | 'tabled' | 'no_vote';
}

// In-memory storage
const proposals: Map<string, InvestmentProposal> = new Map();
const votes: Map<string, ProposalVote> = new Map();
const policies: Map<string, InvestmentPolicy> = new Map();
const violations: Map<string, PolicyViolation> = new Map();
const committees: Map<string, InvestmentCommittee> = new Map();
const meetings: Map<string, CommitteeMeeting> = new Map();

let proposalCounter = 1;
let meetingCounter = 1;

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateProposalNumber(entityId: string): string {
  const year = new Date().getFullYear();
  const num = proposalCounter++;
  return `INV-${year}-${num.toString().padStart(4, '0')}`;
}

function generateMeetingNumber(committeeId: string): string {
  const year = new Date().getFullYear();
  const num = meetingCounter++;
  return `MTG-${year}-${num.toString().padStart(4, '0')}`;
}

// Proposal Management
export function createProposal(data: {
  entityId: string;
  type: ProposalType;
  title: string;
  description: string;
  rationale: string;
  ticker?: string;
  assetClass?: string;
  proposedAmount: number;
  currentAmount?: number;
  targetAllocation?: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  riskFactors: string[];
  mitigationStrategies: string[];
  expectedReturn?: number;
  timeHorizon?: string;
  exitStrategy?: string;
  requiredApprovers: string[];
  minimumVotes: number;
  approvalThreshold: number;
  submittedBy: string;
  reviewDeadline?: Date;
  implementationDeadline?: Date;
}): InvestmentProposal {
  const id = generateId();
  const now = new Date();
  
  const proposal: InvestmentProposal = {
    id,
    entityId: data.entityId,
    proposalNumber: generateProposalNumber(data.entityId),
    type: data.type,
    title: data.title,
    description: data.description,
    rationale: data.rationale,
    ticker: data.ticker,
    assetClass: data.assetClass,
    proposedAmount: data.proposedAmount,
    currentAmount: data.currentAmount,
    targetAllocation: data.targetAllocation,
    riskLevel: data.riskLevel,
    riskFactors: data.riskFactors,
    mitigationStrategies: data.mitigationStrategies,
    expectedReturn: data.expectedReturn,
    timeHorizon: data.timeHorizon,
    exitStrategy: data.exitStrategy,
    requiredApprovers: data.requiredApprovers,
    minimumVotes: data.minimumVotes,
    approvalThreshold: data.approvalThreshold,
    status: 'draft',
    submittedBy: data.submittedBy,
    reviewDeadline: data.reviewDeadline,
    implementationDeadline: data.implementationDeadline,
    createdAt: now,
    updatedAt: now,
  };
  
  proposals.set(id, proposal);
  return proposal;
}

export function getProposal(id: string): InvestmentProposal | undefined {
  return proposals.get(id);
}

export function listProposals(filters?: {
  entityId?: string;
  status?: ProposalStatus;
  type?: ProposalType;
}): InvestmentProposal[] {
  let result = Array.from(proposals.values());
  
  if (filters?.entityId) {
    result = result.filter(p => p.entityId === filters.entityId);
  }
  if (filters?.status) {
    result = result.filter(p => p.status === filters.status);
  }
  if (filters?.type) {
    result = result.filter(p => p.type === filters.type);
  }
  
  return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function submitProposal(proposalId: string): InvestmentProposal {
  const proposal = proposals.get(proposalId);
  if (!proposal) {
    throw new Error('Proposal not found');
  }
  
  if (proposal.status !== 'draft') {
    throw new Error('Only draft proposals can be submitted');
  }
  
  proposal.status = 'submitted';
  proposal.submittedAt = new Date();
  proposal.updatedAt = new Date();
  
  return proposal;
}

export function updateProposalStatus(
  proposalId: string,
  status: ProposalStatus,
  userId?: string
): InvestmentProposal {
  const proposal = proposals.get(proposalId);
  if (!proposal) {
    throw new Error('Proposal not found');
  }
  
  proposal.status = status;
  proposal.updatedAt = new Date();
  
  if (status === 'implemented' && userId) {
    proposal.implementedAt = new Date();
    proposal.implementedBy = userId;
  }
  
  return proposal;
}

// Voting
export function recordVote(data: {
  proposalId: string;
  voterId: string;
  voterName: string;
  voterRole: string;
  vote: VoteType;
  comments?: string;
}): ProposalVote {
  const proposal = proposals.get(data.proposalId);
  if (!proposal) {
    throw new Error('Proposal not found');
  }
  
  if (!['submitted', 'under_review'].includes(proposal.status)) {
    throw new Error('Proposal is not open for voting');
  }
  
  // Check if voter already voted
  const existingVote = Array.from(votes.values()).find(
    v => v.proposalId === data.proposalId && v.voterId === data.voterId
  );
  
  if (existingVote) {
    throw new Error('Voter has already voted on this proposal');
  }
  
  const id = generateId();
  const vote: ProposalVote = {
    id,
    proposalId: data.proposalId,
    voterId: data.voterId,
    voterName: data.voterName,
    voterRole: data.voterRole,
    vote: data.vote,
    comments: data.comments,
    votedAt: new Date(),
  };
  
  votes.set(id, vote);
  
  // Check if voting is complete
  checkVotingComplete(data.proposalId);
  
  return vote;
}

export function getProposalVotes(proposalId: string): ProposalVote[] {
  return Array.from(votes.values())
    .filter(v => v.proposalId === proposalId)
    .sort((a, b) => a.votedAt.getTime() - b.votedAt.getTime());
}

export function calculateVoteResults(proposalId: string): {
  totalVotes: number;
  approveVotes: number;
  rejectVotes: number;
  abstainVotes: number;
  approvalPercentage: number;
  quorumMet: boolean;
  approved: boolean;
} {
  const proposal = proposals.get(proposalId);
  if (!proposal) {
    throw new Error('Proposal not found');
  }
  
  const proposalVotes = getProposalVotes(proposalId);
  const totalVotes = proposalVotes.length;
  const approveVotes = proposalVotes.filter(v => v.vote === 'approve').length;
  const rejectVotes = proposalVotes.filter(v => v.vote === 'reject').length;
  const abstainVotes = proposalVotes.filter(v => v.vote === 'abstain').length;
  
  const votingVotes = approveVotes + rejectVotes; // Abstains don't count for percentage
  const approvalPercentage = votingVotes > 0 ? (approveVotes / votingVotes) * 100 : 0;
  const quorumMet = totalVotes >= proposal.minimumVotes;
  const approved = quorumMet && approvalPercentage >= proposal.approvalThreshold;
  
  return {
    totalVotes,
    approveVotes,
    rejectVotes,
    abstainVotes,
    approvalPercentage,
    quorumMet,
    approved,
  };
}

function checkVotingComplete(proposalId: string): void {
  const proposal = proposals.get(proposalId);
  if (!proposal) return;
  
  const results = calculateVoteResults(proposalId);
  
  // Check if all required approvers have voted
  const proposalVotes = getProposalVotes(proposalId);
  const voterIds = new Set(proposalVotes.map(v => v.voterId));
  const allVoted = proposal.requiredApprovers.every(id => voterIds.has(id));
  
  if (allVoted && results.quorumMet) {
    proposal.status = results.approved ? 'approved' : 'rejected';
    proposal.updatedAt = new Date();
  }
}

// Policy Management
export function createPolicy(data: {
  entityId: string;
  category: PolicyCategory;
  name: string;
  description: string;
  rules: Omit<PolicyRule, 'id'>[];
  effectiveDate: Date;
  expirationDate?: Date;
}): InvestmentPolicy {
  const id = generateId();
  const now = new Date();
  
  const policy: InvestmentPolicy = {
    id,
    entityId: data.entityId,
    category: data.category,
    name: data.name,
    description: data.description,
    rules: data.rules.map(r => ({ ...r, id: generateId() })),
    effectiveDate: data.effectiveDate,
    expirationDate: data.expirationDate,
    status: 'pending_review',
    createdAt: now,
    updatedAt: now,
  };
  
  policies.set(id, policy);
  return policy;
}

export function getPolicy(id: string): InvestmentPolicy | undefined {
  return policies.get(id);
}

export function listPolicies(filters?: {
  entityId?: string;
  category?: PolicyCategory;
  status?: 'active' | 'inactive' | 'pending_review';
}): InvestmentPolicy[] {
  let result = Array.from(policies.values());
  
  if (filters?.entityId) {
    result = result.filter(p => p.entityId === filters.entityId);
  }
  if (filters?.category) {
    result = result.filter(p => p.category === filters.category);
  }
  if (filters?.status) {
    result = result.filter(p => p.status === filters.status);
  }
  
  return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function activatePolicy(policyId: string, approvedBy: string): InvestmentPolicy {
  const policy = policies.get(policyId);
  if (!policy) {
    throw new Error('Policy not found');
  }
  
  policy.status = 'active';
  policy.approvedBy = approvedBy;
  policy.approvedAt = new Date();
  policy.updatedAt = new Date();
  
  return policy;
}

export function deactivatePolicy(policyId: string): InvestmentPolicy {
  const policy = policies.get(policyId);
  if (!policy) {
    throw new Error('Policy not found');
  }
  
  policy.status = 'inactive';
  policy.updatedAt = new Date();
  
  return policy;
}

// Policy Compliance Checking
export function checkPolicyCompliance(data: {
  entityId: string;
  proposalId?: string;
  holdingId?: string;
  transactionId?: string;
  checkType: 'asset_allocation' | 'concentration' | 'prohibited' | 'risk_limit';
  assetClass?: string;
  ticker?: string;
  amount?: number;
  percentage?: number;
}): PolicyViolation[] {
  const activePolicies = listPolicies({ entityId: data.entityId, status: 'active' });
  const foundViolations: PolicyViolation[] = [];
  
  for (const policy of activePolicies) {
    for (const rule of policy.rules) {
      let violated = false;
      let description = '';
      let currentValue = 0;
      let thresholdValue = 0;
      
      // Check based on rule type
      if (rule.operator && data.percentage !== undefined && rule.threshold !== undefined) {
        currentValue = data.percentage;
        thresholdValue = rule.threshold;
        
        switch (rule.operator) {
          case 'gt':
            violated = data.percentage > rule.threshold;
            description = `${rule.name}: ${data.percentage.toFixed(2)}% exceeds maximum of ${rule.threshold}%`;
            break;
          case 'gte':
            violated = data.percentage >= rule.threshold;
            description = `${rule.name}: ${data.percentage.toFixed(2)}% meets or exceeds threshold of ${rule.threshold}%`;
            break;
          case 'lt':
            violated = data.percentage < rule.threshold;
            description = `${rule.name}: ${data.percentage.toFixed(2)}% is below minimum of ${rule.threshold}%`;
            break;
          case 'lte':
            violated = data.percentage <= rule.threshold;
            description = `${rule.name}: ${data.percentage.toFixed(2)}% is at or below threshold of ${rule.threshold}%`;
            break;
          case 'between':
            if (rule.minValue !== undefined && rule.maxValue !== undefined) {
              violated = data.percentage < rule.minValue || data.percentage > rule.maxValue;
              description = `${rule.name}: ${data.percentage.toFixed(2)}% is outside range of ${rule.minValue}%-${rule.maxValue}%`;
              thresholdValue = data.percentage < rule.minValue ? rule.minValue : rule.maxValue;
            }
            break;
        }
      }
      
      if (violated) {
        const violation: PolicyViolation = {
          id: generateId(),
          entityId: data.entityId,
          policyId: policy.id,
          ruleId: rule.id,
          proposalId: data.proposalId,
          holdingId: data.holdingId,
          transactionId: data.transactionId,
          violationType: data.checkType,
          description,
          currentValue,
          thresholdValue,
          severity: rule.severity,
          status: 'open',
          detectedAt: new Date(),
        };
        
        violations.set(violation.id, violation);
        foundViolations.push(violation);
      }
    }
  }
  
  return foundViolations;
}

export function getViolation(id: string): PolicyViolation | undefined {
  return violations.get(id);
}

export function listViolations(filters?: {
  entityId?: string;
  policyId?: string;
  status?: 'open' | 'acknowledged' | 'resolved' | 'waived';
  severity?: 'info' | 'warning' | 'critical';
}): PolicyViolation[] {
  let result = Array.from(violations.values());
  
  if (filters?.entityId) {
    result = result.filter(v => v.entityId === filters.entityId);
  }
  if (filters?.policyId) {
    result = result.filter(v => v.policyId === filters.policyId);
  }
  if (filters?.status) {
    result = result.filter(v => v.status === filters.status);
  }
  if (filters?.severity) {
    result = result.filter(v => v.severity === filters.severity);
  }
  
  return result.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
}

export function resolveViolation(
  violationId: string,
  resolution: string,
  resolvedBy: string
): PolicyViolation {
  const violation = violations.get(violationId);
  if (!violation) {
    throw new Error('Violation not found');
  }
  
  violation.status = 'resolved';
  violation.resolution = resolution;
  violation.resolvedBy = resolvedBy;
  violation.resolvedAt = new Date();
  
  return violation;
}

export function waiveViolation(
  violationId: string,
  reason: string,
  waivedBy: string
): PolicyViolation {
  const violation = violations.get(violationId);
  if (!violation) {
    throw new Error('Violation not found');
  }
  
  violation.status = 'waived';
  violation.resolution = `Waived: ${reason}`;
  violation.resolvedBy = waivedBy;
  violation.resolvedAt = new Date();
  
  return violation;
}

// Committee Management
export function createCommittee(data: {
  entityId: string;
  name: string;
  description: string;
  members: Omit<CommitteeMember, 'id'>[];
  quorumRequirement: number;
  approvalThreshold: number;
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'as_needed';
}): InvestmentCommittee {
  const id = generateId();
  const now = new Date();
  
  const committee: InvestmentCommittee = {
    id,
    entityId: data.entityId,
    name: data.name,
    description: data.description,
    members: data.members.map(m => ({ ...m, id: generateId() })),
    quorumRequirement: data.quorumRequirement,
    approvalThreshold: data.approvalThreshold,
    meetingFrequency: data.meetingFrequency,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  
  committees.set(id, committee);
  return committee;
}

export function getCommittee(id: string): InvestmentCommittee | undefined {
  return committees.get(id);
}

export function listCommittees(entityId?: string): InvestmentCommittee[] {
  let result = Array.from(committees.values());
  
  if (entityId) {
    result = result.filter(c => c.entityId === entityId);
  }
  
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function addCommitteeMember(
  committeeId: string,
  member: Omit<CommitteeMember, 'id'>
): InvestmentCommittee {
  const committee = committees.get(committeeId);
  if (!committee) {
    throw new Error('Committee not found');
  }
  
  committee.members.push({ ...member, id: generateId() });
  committee.updatedAt = new Date();
  
  return committee;
}

export function removeCommitteeMember(committeeId: string, memberId: string): InvestmentCommittee {
  const committee = committees.get(committeeId);
  if (!committee) {
    throw new Error('Committee not found');
  }
  
  committee.members = committee.members.filter(m => m.id !== memberId);
  committee.updatedAt = new Date();
  
  return committee;
}

// Meeting Management
export function scheduleMeeting(data: {
  committeeId: string;
  scheduledDate: Date;
  location: string;
  agendaItems: Omit<AgendaItem, 'id'>[];
}): CommitteeMeeting {
  const committee = committees.get(data.committeeId);
  if (!committee) {
    throw new Error('Committee not found');
  }
  
  const id = generateId();
  const now = new Date();
  
  const meeting: CommitteeMeeting = {
    id,
    committeeId: data.committeeId,
    meetingNumber: generateMeetingNumber(data.committeeId),
    scheduledDate: data.scheduledDate,
    location: data.location,
    attendees: [],
    quorumMet: false,
    agendaItems: data.agendaItems.map((item, index) => ({
      ...item,
      id: generateId(),
      order: item.order || index + 1,
    })),
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  };
  
  meetings.set(id, meeting);
  return meeting;
}

export function getMeeting(id: string): CommitteeMeeting | undefined {
  return meetings.get(id);
}

export function listMeetings(filters?: {
  committeeId?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}): CommitteeMeeting[] {
  let result = Array.from(meetings.values());
  
  if (filters?.committeeId) {
    result = result.filter(m => m.committeeId === filters.committeeId);
  }
  if (filters?.status) {
    result = result.filter(m => m.status === filters.status);
  }
  
  return result.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
}

export function startMeeting(meetingId: string, attendees: string[]): CommitteeMeeting {
  const meeting = meetings.get(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }
  
  const committee = committees.get(meeting.committeeId);
  if (!committee) {
    throw new Error('Committee not found');
  }
  
  meeting.status = 'in_progress';
  meeting.actualDate = new Date();
  meeting.attendees = attendees;
  meeting.quorumMet = attendees.length >= committee.quorumRequirement;
  meeting.updatedAt = new Date();
  
  return meeting;
}

export function recordAgendaOutcome(
  meetingId: string,
  agendaItemId: string,
  outcome: string,
  voteTaken: boolean,
  voteResult?: 'approved' | 'rejected' | 'tabled' | 'no_vote'
): CommitteeMeeting {
  const meeting = meetings.get(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }
  
  const agendaItem = meeting.agendaItems.find(a => a.id === agendaItemId);
  if (!agendaItem) {
    throw new Error('Agenda item not found');
  }
  
  agendaItem.outcome = outcome;
  agendaItem.voteTaken = voteTaken;
  agendaItem.voteResult = voteResult;
  meeting.updatedAt = new Date();
  
  return meeting;
}

export function completeMeeting(meetingId: string, minutes: string): CommitteeMeeting {
  const meeting = meetings.get(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }
  
  meeting.status = 'completed';
  meeting.minutes = minutes;
  meeting.updatedAt = new Date();
  
  return meeting;
}

export function cancelMeeting(meetingId: string): CommitteeMeeting {
  const meeting = meetings.get(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found');
  }
  
  meeting.status = 'cancelled';
  meeting.updatedAt = new Date();
  
  return meeting;
}

// Reporting
export function generateGovernanceSummary(entityId: string): {
  proposals: {
    total: number;
    byStatus: Record<ProposalStatus, number>;
    pendingReview: number;
    recentlyApproved: number;
  };
  policies: {
    total: number;
    active: number;
    pendingReview: number;
  };
  violations: {
    total: number;
    open: number;
    critical: number;
    resolved: number;
  };
  committees: {
    total: number;
    active: number;
    totalMembers: number;
  };
  meetings: {
    scheduled: number;
    completedThisYear: number;
    averageAttendance: number;
  };
} {
  const entityProposals = listProposals({ entityId });
  const entityPolicies = listPolicies({ entityId });
  const entityViolations = listViolations({ entityId });
  const entityCommittees = listCommittees(entityId);
  const entityMeetings = listMeetings();
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const currentYear = new Date().getFullYear();
  const completedMeetingsThisYear = entityMeetings.filter(
    m => m.status === 'completed' && m.actualDate && m.actualDate.getFullYear() === currentYear
  );
  
  const avgAttendance = completedMeetingsThisYear.length > 0
    ? completedMeetingsThisYear.reduce((sum, m) => sum + m.attendees.length, 0) / completedMeetingsThisYear.length
    : 0;
  
  const byStatus: Record<ProposalStatus, number> = {
    draft: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    implemented: 0,
    cancelled: 0,
  };
  
  entityProposals.forEach(p => {
    byStatus[p.status]++;
  });
  
  return {
    proposals: {
      total: entityProposals.length,
      byStatus,
      pendingReview: entityProposals.filter(p => ['submitted', 'under_review'].includes(p.status)).length,
      recentlyApproved: entityProposals.filter(
        p => p.status === 'approved' && p.updatedAt >= thirtyDaysAgo
      ).length,
    },
    policies: {
      total: entityPolicies.length,
      active: entityPolicies.filter(p => p.status === 'active').length,
      pendingReview: entityPolicies.filter(p => p.status === 'pending_review').length,
    },
    violations: {
      total: entityViolations.length,
      open: entityViolations.filter(v => v.status === 'open').length,
      critical: entityViolations.filter(v => v.severity === 'critical' && v.status === 'open').length,
      resolved: entityViolations.filter(v => v.status === 'resolved').length,
    },
    committees: {
      total: entityCommittees.length,
      active: entityCommittees.filter(c => c.status === 'active').length,
      totalMembers: entityCommittees.reduce((sum, c) => sum + c.members.length, 0),
    },
    meetings: {
      scheduled: entityMeetings.filter(m => m.status === 'scheduled').length,
      completedThisYear: completedMeetingsThisYear.length,
      averageAttendance: Math.round(avgAttendance * 10) / 10,
    },
  };
}

// Default Investment Policy Templates
export function createDefaultPolicies(entityId: string): InvestmentPolicy[] {
  const createdPolicies: InvestmentPolicy[] = [];
  
  // Asset Allocation Policy
  createdPolicies.push(createPolicy({
    entityId,
    category: 'asset_allocation',
    name: 'Target Asset Allocation Policy',
    description: 'Defines target allocation ranges for each asset class',
    effectiveDate: new Date(),
    rules: [
      {
        name: 'Equity Maximum',
        condition: 'Equity allocation must not exceed 70%',
        threshold: 70,
        operator: 'gt',
        action: 'require_approval',
        severity: 'warning',
      },
      {
        name: 'Fixed Income Minimum',
        condition: 'Fixed income allocation must be at least 20%',
        threshold: 20,
        operator: 'lt',
        action: 'alert',
        severity: 'info',
      },
      {
        name: 'Cash Reserve Minimum',
        condition: 'Cash reserves must be at least 5%',
        threshold: 5,
        operator: 'lt',
        action: 'require_approval',
        severity: 'warning',
      },
    ],
  }));
  
  // Concentration Limits Policy
  createdPolicies.push(createPolicy({
    entityId,
    category: 'concentration_limits',
    name: 'Position Concentration Limits',
    description: 'Limits on single position sizes to manage concentration risk',
    effectiveDate: new Date(),
    rules: [
      {
        name: 'Single Position Maximum',
        condition: 'No single position may exceed 10% of portfolio',
        threshold: 10,
        operator: 'gt',
        action: 'prohibit',
        severity: 'critical',
      },
      {
        name: 'Sector Maximum',
        condition: 'No single sector may exceed 25% of portfolio',
        threshold: 25,
        operator: 'gt',
        action: 'require_approval',
        severity: 'warning',
      },
    ],
  }));
  
  // Risk Management Policy
  createdPolicies.push(createPolicy({
    entityId,
    category: 'risk_management',
    name: 'Investment Risk Management Policy',
    description: 'Guidelines for managing investment risk',
    effectiveDate: new Date(),
    rules: [
      {
        name: 'High Risk Allocation Maximum',
        condition: 'High-risk investments must not exceed 15% of portfolio',
        threshold: 15,
        operator: 'gt',
        action: 'require_approval',
        severity: 'warning',
      },
      {
        name: 'Speculative Investment Maximum',
        condition: 'Speculative investments must not exceed 5% of portfolio',
        threshold: 5,
        operator: 'gt',
        action: 'prohibit',
        severity: 'critical',
      },
    ],
  }));
  
  return createdPolicies;
}

// Reset for testing
export function resetGovernanceData(): void {
  proposals.clear();
  votes.clear();
  policies.clear();
  violations.clear();
  committees.clear();
  meetings.clear();
  proposalCounter = 1;
  meetingCounter = 1;
}
