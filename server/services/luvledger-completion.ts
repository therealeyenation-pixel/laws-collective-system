/**
 * LuvLedger & House Completion Service
 * Comprehensive implementation of distribution engine, asset management, and house governance
 */

// ============================================================================
// DISTRIBUTION ENGINE
// ============================================================================

export type DistributionType = 'equal' | 'proportional' | 'tiered' | 'custom' | 'merit' | 'seniority';
export type DistributionStatus = 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'cancelled';

export interface DistributionPlan {
  id: string;
  name: string;
  type: DistributionType;
  status: DistributionStatus;
  sourceEntityId: string;
  totalAmount: number;
  currency: string;
  recipients: DistributionRecipient[];
  schedule: DistributionSchedule;
  rules: DistributionRule[];
  approvals: DistributionApproval[];
  createdAt: number;
  executedAt?: number;
  completedAt?: number;
}

export interface DistributionRecipient {
  id: string;
  type: 'individual' | 'house' | 'entity' | 'trust';
  recipientId: string;
  name: string;
  share: number; // percentage or fixed amount
  shareType: 'percentage' | 'fixed';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount?: number;
  paidAt?: number;
}

export interface DistributionSchedule {
  type: 'immediate' | 'scheduled' | 'recurring';
  scheduledDate?: number;
  frequency?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  endDate?: number;
  nextExecution?: number;
}

export interface DistributionRule {
  id: string;
  type: 'minimum' | 'maximum' | 'vesting' | 'condition' | 'tax_withholding';
  value: number;
  condition?: string;
  description: string;
}

export interface DistributionApproval {
  id: string;
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: number;
  comments?: string;
}

export function createDistributionPlan(
  name: string,
  type: DistributionType,
  sourceEntityId: string,
  totalAmount: number,
  currency: string = 'USD'
): DistributionPlan {
  return {
    id: `DIST-${Date.now().toString(36).toUpperCase()}`,
    name,
    type,
    status: 'draft',
    sourceEntityId,
    totalAmount,
    currency,
    recipients: [],
    schedule: { type: 'immediate' },
    rules: [],
    approvals: [],
    createdAt: Date.now()
  };
}

export function addDistributionRecipient(
  plan: DistributionPlan,
  type: DistributionRecipient['type'],
  recipientId: string,
  name: string,
  share: number,
  shareType: 'percentage' | 'fixed' = 'percentage'
): DistributionRecipient {
  const recipient: DistributionRecipient = {
    id: `RECIP-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    recipientId,
    name,
    share,
    shareType,
    status: 'pending'
  };
  
  plan.recipients.push(recipient);
  return recipient;
}

export function calculateDistribution(plan: DistributionPlan): void {
  const totalPercentage = plan.recipients
    .filter(r => r.shareType === 'percentage')
    .reduce((sum, r) => sum + r.share, 0);
  
  const fixedTotal = plan.recipients
    .filter(r => r.shareType === 'fixed')
    .reduce((sum, r) => sum + r.share, 0);
  
  const remainingAmount = plan.totalAmount - fixedTotal;
  
  for (const recipient of plan.recipients) {
    if (recipient.shareType === 'fixed') {
      recipient.amount = recipient.share;
    } else {
      recipient.amount = (recipient.share / totalPercentage) * remainingAmount;
    }
  }
}

export function addDistributionRule(
  plan: DistributionPlan,
  type: DistributionRule['type'],
  value: number,
  description: string,
  condition?: string
): DistributionRule {
  const rule: DistributionRule = {
    id: `RULE-${Date.now().toString(36)}`,
    type,
    value,
    description,
    condition
  };
  
  plan.rules.push(rule);
  return rule;
}

export function requestApproval(
  plan: DistributionPlan,
  approverId: string,
  approverName: string
): DistributionApproval {
  const approval: DistributionApproval = {
    id: `APPR-${Date.now().toString(36)}`,
    approverId,
    approverName,
    status: 'pending'
  };
  
  plan.approvals.push(approval);
  plan.status = 'pending_approval';
  return approval;
}

export function approveDistribution(
  plan: DistributionPlan,
  approvalId: string,
  comments?: string
): boolean {
  const approval = plan.approvals.find(a => a.id === approvalId);
  if (!approval) return false;
  
  approval.status = 'approved';
  approval.timestamp = Date.now();
  approval.comments = comments;
  
  // Check if all approvals are complete
  const allApproved = plan.approvals.every(a => a.status === 'approved');
  if (allApproved) {
    plan.status = 'approved';
  }
  
  return true;
}

export function executeDistribution(plan: DistributionPlan): boolean {
  if (plan.status !== 'approved') return false;
  
  plan.status = 'processing';
  plan.executedAt = Date.now();
  
  // Mark all recipients as processing
  for (const recipient of plan.recipients) {
    recipient.status = 'processing';
  }
  
  return true;
}

export function completeDistribution(plan: DistributionPlan): void {
  plan.status = 'completed';
  plan.completedAt = Date.now();
  
  for (const recipient of plan.recipients) {
    recipient.status = 'completed';
    recipient.paidAt = Date.now();
  }
}

// ============================================================================
// ASSET MANAGEMENT
// ============================================================================

export type AssetType = 'real_estate' | 'vehicle' | 'equipment' | 'intellectual_property' | 'investment' | 'cash' | 'other';
export type AssetStatus = 'active' | 'pending' | 'transferred' | 'sold' | 'depreciated' | 'archived';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  ownerId: string;
  ownerType: 'individual' | 'house' | 'entity' | 'trust';
  value: AssetValue;
  acquisition: AssetAcquisition;
  depreciation?: AssetDepreciation;
  documents: string[];
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface AssetValue {
  purchasePrice: number;
  currentValue: number;
  currency: string;
  lastAppraisal?: number;
  lastAppraisalDate?: number;
}

export interface AssetAcquisition {
  date: number;
  method: 'purchase' | 'gift' | 'inheritance' | 'transfer' | 'creation';
  source?: string;
  cost: number;
}

export interface AssetDepreciation {
  method: 'straight_line' | 'declining_balance' | 'sum_of_years' | 'units_of_production';
  usefulLife: number; // years
  salvageValue: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
}

export interface AssetTransfer {
  id: string;
  assetId: string;
  fromOwnerId: string;
  toOwnerId: string;
  transferDate: number;
  transferValue: number;
  reason: string;
  status: 'pending' | 'completed' | 'cancelled';
  documents: string[];
}

export function createAsset(
  name: string,
  type: AssetType,
  ownerId: string,
  ownerType: Asset['ownerType'],
  purchasePrice: number,
  acquisitionDate: number,
  acquisitionMethod: AssetAcquisition['method']
): Asset {
  return {
    id: `ASSET-${Date.now().toString(36).toUpperCase()}`,
    name,
    type,
    status: 'active',
    ownerId,
    ownerType,
    value: {
      purchasePrice,
      currentValue: purchasePrice,
      currency: 'USD'
    },
    acquisition: {
      date: acquisitionDate,
      method: acquisitionMethod,
      cost: purchasePrice
    },
    documents: [],
    metadata: {},
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function updateAssetValue(asset: Asset, newValue: number, appraisalDate?: number): void {
  asset.value.currentValue = newValue;
  asset.value.lastAppraisal = newValue;
  asset.value.lastAppraisalDate = appraisalDate || Date.now();
  asset.updatedAt = Date.now();
}

export function setupDepreciation(
  asset: Asset,
  method: AssetDepreciation['method'],
  usefulLife: number,
  salvageValue: number
): void {
  const depreciableAmount = asset.value.purchasePrice - salvageValue;
  let annualDepreciation = 0;
  
  switch (method) {
    case 'straight_line':
      annualDepreciation = depreciableAmount / usefulLife;
      break;
    case 'declining_balance':
      annualDepreciation = (asset.value.currentValue * 2) / usefulLife;
      break;
    default:
      annualDepreciation = depreciableAmount / usefulLife;
  }
  
  asset.depreciation = {
    method,
    usefulLife,
    salvageValue,
    annualDepreciation,
    accumulatedDepreciation: 0
  };
  asset.updatedAt = Date.now();
}

export function applyDepreciation(asset: Asset): number {
  if (!asset.depreciation) return 0;
  
  const depreciation = asset.depreciation.annualDepreciation;
  asset.depreciation.accumulatedDepreciation += depreciation;
  asset.value.currentValue = Math.max(
    asset.value.purchasePrice - asset.depreciation.accumulatedDepreciation,
    asset.depreciation.salvageValue
  );
  asset.updatedAt = Date.now();
  
  return depreciation;
}

export function createAssetTransfer(
  assetId: string,
  fromOwnerId: string,
  toOwnerId: string,
  transferValue: number,
  reason: string
): AssetTransfer {
  return {
    id: `TRANSFER-${Date.now().toString(36).toUpperCase()}`,
    assetId,
    fromOwnerId,
    toOwnerId,
    transferDate: Date.now(),
    transferValue,
    reason,
    status: 'pending',
    documents: []
  };
}

export function completeAssetTransfer(asset: Asset, transfer: AssetTransfer): void {
  asset.ownerId = transfer.toOwnerId;
  asset.status = 'transferred';
  asset.updatedAt = Date.now();
  transfer.status = 'completed';
}

// ============================================================================
// HOUSE GOVERNANCE
// ============================================================================

export interface HouseGovernance {
  houseId: string;
  constitution: HouseConstitution;
  officers: HouseOfficer[];
  votingRules: VotingRules;
  meetings: HouseMeeting[];
  resolutions: HouseResolution[];
  committees: HouseCommittee[];
}

export interface HouseConstitution {
  version: string;
  adoptedDate: number;
  articles: ConstitutionArticle[];
  amendments: ConstitutionAmendment[];
}

export interface ConstitutionArticle {
  id: string;
  number: number;
  title: string;
  content: string;
  sections: { number: number; content: string }[];
}

export interface ConstitutionAmendment {
  id: string;
  number: number;
  title: string;
  content: string;
  proposedDate: number;
  adoptedDate?: number;
  status: 'proposed' | 'adopted' | 'rejected';
}

export interface HouseOfficer {
  id: string;
  memberId: string;
  name: string;
  role: 'head' | 'treasurer' | 'secretary' | 'elder' | 'advisor';
  termStart: number;
  termEnd?: number;
  status: 'active' | 'inactive' | 'emeritus';
}

export interface VotingRules {
  quorumPercentage: number;
  majorityType: 'simple' | 'supermajority' | 'unanimous';
  votingMethods: ('in_person' | 'proxy' | 'electronic')[];
  eligibilityAge: number;
  abstentionCounts: boolean;
}

export interface HouseMeeting {
  id: string;
  type: 'regular' | 'special' | 'emergency' | 'annual';
  title: string;
  scheduledDate: number;
  location: string;
  agenda: MeetingAgendaItem[];
  attendees: MeetingAttendee[];
  minutes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface MeetingAgendaItem {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: number; // minutes
  presenter?: string;
  type: 'discussion' | 'vote' | 'report' | 'announcement';
}

export interface MeetingAttendee {
  memberId: string;
  name: string;
  status: 'confirmed' | 'tentative' | 'declined' | 'attended';
  proxy?: string;
}

export interface HouseResolution {
  id: string;
  number: string;
  title: string;
  content: string;
  proposedBy: string;
  proposedDate: number;
  votingDeadline: number;
  votes: ResolutionVote[];
  status: 'draft' | 'proposed' | 'voting' | 'passed' | 'failed' | 'withdrawn';
  result?: VotingResult;
}

export interface ResolutionVote {
  memberId: string;
  memberName: string;
  vote: 'yes' | 'no' | 'abstain';
  timestamp: number;
  comments?: string;
}

export interface VotingResult {
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  abstentions: number;
  quorumMet: boolean;
  passed: boolean;
}

export interface HouseCommittee {
  id: string;
  name: string;
  purpose: string;
  members: { memberId: string; name: string; role: 'chair' | 'member' }[];
  createdDate: number;
  status: 'active' | 'inactive' | 'dissolved';
}

export function createHouseGovernance(houseId: string): HouseGovernance {
  return {
    houseId,
    constitution: {
      version: '1.0',
      adoptedDate: Date.now(),
      articles: [],
      amendments: []
    },
    officers: [],
    votingRules: {
      quorumPercentage: 50,
      majorityType: 'simple',
      votingMethods: ['in_person', 'electronic'],
      eligibilityAge: 18,
      abstentionCounts: false
    },
    meetings: [],
    resolutions: [],
    committees: []
  };
}

export function addConstitutionArticle(
  governance: HouseGovernance,
  number: number,
  title: string,
  content: string,
  sections: { number: number; content: string }[] = []
): ConstitutionArticle {
  const article: ConstitutionArticle = {
    id: `ART-${Date.now().toString(36)}`,
    number,
    title,
    content,
    sections
  };
  
  governance.constitution.articles.push(article);
  return article;
}

export function addHouseOfficer(
  governance: HouseGovernance,
  memberId: string,
  name: string,
  role: HouseOfficer['role'],
  termStart: number,
  termEnd?: number
): HouseOfficer {
  const officer: HouseOfficer = {
    id: `OFF-${Date.now().toString(36)}`,
    memberId,
    name,
    role,
    termStart,
    termEnd,
    status: 'active'
  };
  
  governance.officers.push(officer);
  return officer;
}

export function createMeeting(
  governance: HouseGovernance,
  type: HouseMeeting['type'],
  title: string,
  scheduledDate: number,
  location: string
): HouseMeeting {
  const meeting: HouseMeeting = {
    id: `MTG-${Date.now().toString(36).toUpperCase()}`,
    type,
    title,
    scheduledDate,
    location,
    agenda: [],
    attendees: [],
    status: 'scheduled'
  };
  
  governance.meetings.push(meeting);
  return meeting;
}

export function addAgendaItem(
  meeting: HouseMeeting,
  title: string,
  description: string,
  type: MeetingAgendaItem['type'],
  duration: number,
  presenter?: string
): MeetingAgendaItem {
  const item: MeetingAgendaItem = {
    id: `AGENDA-${Date.now().toString(36)}`,
    order: meeting.agenda.length + 1,
    title,
    description,
    duration,
    presenter,
    type
  };
  
  meeting.agenda.push(item);
  return item;
}

export function createResolution(
  governance: HouseGovernance,
  title: string,
  content: string,
  proposedBy: string,
  votingDeadline: number
): HouseResolution {
  const resolutionNumber = `RES-${new Date().getFullYear()}-${(governance.resolutions.length + 1).toString().padStart(3, '0')}`;
  
  const resolution: HouseResolution = {
    id: `RESOL-${Date.now().toString(36).toUpperCase()}`,
    number: resolutionNumber,
    title,
    content,
    proposedBy,
    proposedDate: Date.now(),
    votingDeadline,
    votes: [],
    status: 'proposed'
  };
  
  governance.resolutions.push(resolution);
  return resolution;
}

export function castVote(
  resolution: HouseResolution,
  memberId: string,
  memberName: string,
  vote: ResolutionVote['vote'],
  comments?: string
): ResolutionVote {
  const voteRecord: ResolutionVote = {
    memberId,
    memberName,
    vote,
    timestamp: Date.now(),
    comments
  };
  
  resolution.votes.push(voteRecord);
  resolution.status = 'voting';
  return voteRecord;
}

export function tallyVotes(resolution: HouseResolution, totalEligibleVoters: number, quorumPercentage: number): VotingResult {
  const yesVotes = resolution.votes.filter(v => v.vote === 'yes').length;
  const noVotes = resolution.votes.filter(v => v.vote === 'no').length;
  const abstentions = resolution.votes.filter(v => v.vote === 'abstain').length;
  const totalVotes = resolution.votes.length;
  
  const quorumMet = (totalVotes / totalEligibleVoters) * 100 >= quorumPercentage;
  const passed = quorumMet && yesVotes > noVotes;
  
  const result: VotingResult = {
    totalVotes,
    yesVotes,
    noVotes,
    abstentions,
    quorumMet,
    passed
  };
  
  resolution.result = result;
  resolution.status = passed ? 'passed' : 'failed';
  
  return result;
}

export function createCommittee(
  governance: HouseGovernance,
  name: string,
  purpose: string,
  chair: { memberId: string; name: string }
): HouseCommittee {
  const committee: HouseCommittee = {
    id: `COMM-${Date.now().toString(36).toUpperCase()}`,
    name,
    purpose,
    members: [{ ...chair, role: 'chair' }],
    createdDate: Date.now(),
    status: 'active'
  };
  
  governance.committees.push(committee);
  return committee;
}

export function addCommitteeMember(
  committee: HouseCommittee,
  memberId: string,
  name: string
): void {
  committee.members.push({ memberId, name, role: 'member' });
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const luvledgerCompletionService = {
  // Distribution
  createDistributionPlan,
  addDistributionRecipient,
  calculateDistribution,
  addDistributionRule,
  requestApproval,
  approveDistribution,
  executeDistribution,
  completeDistribution,
  // Assets
  createAsset,
  updateAssetValue,
  setupDepreciation,
  applyDepreciation,
  createAssetTransfer,
  completeAssetTransfer,
  // Governance
  createHouseGovernance,
  addConstitutionArticle,
  addHouseOfficer,
  createMeeting,
  addAgendaItem,
  createResolution,
  castVote,
  tallyVotes,
  createCommittee,
  addCommitteeMember
};

export default luvledgerCompletionService;
