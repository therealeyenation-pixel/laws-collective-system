import { describe, it, expect } from 'vitest';
import {
  createDistributionPlan,
  addDistributionRecipient,
  calculateDistribution,
  addDistributionRule,
  requestApproval,
  approveDistribution,
  executeDistribution,
  completeDistribution,
  createAsset,
  updateAssetValue,
  setupDepreciation,
  applyDepreciation,
  createAssetTransfer,
  completeAssetTransfer,
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
} from './services/luvledger-completion';

// ============================================================================
// DISTRIBUTION ENGINE TESTS
// ============================================================================

describe('Distribution Engine', () => {
  describe('Distribution Plan', () => {
    it('should create a distribution plan', () => {
      const plan = createDistributionPlan('Q4 Distribution', 'equal', 'ENT-001', 100000);
      
      expect(plan.id).toMatch(/^DIST-/);
      expect(plan.name).toBe('Q4 Distribution');
      expect(plan.type).toBe('equal');
      expect(plan.status).toBe('draft');
      expect(plan.totalAmount).toBe(100000);
    });

    it('should add recipients to plan', () => {
      const plan = createDistributionPlan('Test', 'proportional', 'ENT-001', 50000);
      const recipient = addDistributionRecipient(plan, 'individual', 'USER-001', 'John Doe', 25);
      
      expect(recipient.id).toMatch(/^RECIP-/);
      expect(recipient.share).toBe(25);
      expect(plan.recipients).toHaveLength(1);
    });

    it('should calculate distribution amounts', () => {
      const plan = createDistributionPlan('Test', 'proportional', 'ENT-001', 100000);
      addDistributionRecipient(plan, 'individual', 'USER-001', 'John', 60);
      addDistributionRecipient(plan, 'individual', 'USER-002', 'Jane', 40);
      
      calculateDistribution(plan);
      
      expect(plan.recipients[0].amount).toBe(60000);
      expect(plan.recipients[1].amount).toBe(40000);
    });

    it('should handle fixed and percentage shares', () => {
      const plan = createDistributionPlan('Mixed', 'custom', 'ENT-001', 100000);
      addDistributionRecipient(plan, 'individual', 'USER-001', 'Fixed', 10000, 'fixed');
      addDistributionRecipient(plan, 'individual', 'USER-002', 'Percent', 100, 'percentage');
      
      calculateDistribution(plan);
      
      expect(plan.recipients[0].amount).toBe(10000);
      expect(plan.recipients[1].amount).toBe(90000);
    });
  });

  describe('Distribution Rules', () => {
    it('should add distribution rules', () => {
      const plan = createDistributionPlan('Test', 'equal', 'ENT-001', 50000);
      const rule = addDistributionRule(plan, 'minimum', 1000, 'Minimum distribution amount');
      
      expect(rule.id).toMatch(/^RULE-/);
      expect(rule.type).toBe('minimum');
      expect(plan.rules).toHaveLength(1);
    });
  });

  describe('Approval Workflow', () => {
    it('should request approval', () => {
      const plan = createDistributionPlan('Test', 'equal', 'ENT-001', 50000);
      const approval = requestApproval(plan, 'USER-001', 'Admin User');
      
      expect(approval.status).toBe('pending');
      expect(plan.status).toBe('pending_approval');
    });

    it('should approve distribution', () => {
      const plan = createDistributionPlan('Test', 'equal', 'ENT-001', 50000);
      const approval = requestApproval(plan, 'USER-001', 'Admin');
      
      const result = approveDistribution(plan, approval.id, 'Approved');
      
      expect(result).toBe(true);
      expect(approval.status).toBe('approved');
      expect(plan.status).toBe('approved');
    });

    it('should execute approved distribution', () => {
      const plan = createDistributionPlan('Test', 'equal', 'ENT-001', 50000);
      addDistributionRecipient(plan, 'individual', 'USER-001', 'John', 100);
      const approval = requestApproval(plan, 'ADMIN', 'Admin');
      approveDistribution(plan, approval.id);
      
      const result = executeDistribution(plan);
      
      expect(result).toBe(true);
      expect(plan.status).toBe('processing');
      expect(plan.executedAt).toBeDefined();
    });

    it('should complete distribution', () => {
      const plan = createDistributionPlan('Test', 'equal', 'ENT-001', 50000);
      addDistributionRecipient(plan, 'individual', 'USER-001', 'John', 100);
      plan.status = 'processing';
      
      completeDistribution(plan);
      
      expect(plan.status).toBe('completed');
      expect(plan.recipients[0].status).toBe('completed');
    });
  });
});

// ============================================================================
// ASSET MANAGEMENT TESTS
// ============================================================================

describe('Asset Management', () => {
  describe('Asset Creation', () => {
    it('should create an asset', () => {
      const asset = createAsset('Office Building', 'real_estate', 'ENT-001', 'entity', 500000, Date.now(), 'purchase');
      
      expect(asset.id).toMatch(/^ASSET-/);
      expect(asset.name).toBe('Office Building');
      expect(asset.type).toBe('real_estate');
      expect(asset.value.purchasePrice).toBe(500000);
    });

    it('should update asset value', () => {
      const asset = createAsset('Equipment', 'equipment', 'ENT-001', 'entity', 10000, Date.now(), 'purchase');
      
      updateAssetValue(asset, 12000);
      
      expect(asset.value.currentValue).toBe(12000);
      expect(asset.value.lastAppraisal).toBe(12000);
    });
  });

  describe('Depreciation', () => {
    it('should setup straight-line depreciation', () => {
      const asset = createAsset('Vehicle', 'vehicle', 'ENT-001', 'entity', 30000, Date.now(), 'purchase');
      
      setupDepreciation(asset, 'straight_line', 5, 5000);
      
      expect(asset.depreciation).toBeDefined();
      expect(asset.depreciation!.annualDepreciation).toBe(5000); // (30000 - 5000) / 5
    });

    it('should apply depreciation', () => {
      const asset = createAsset('Computer', 'equipment', 'ENT-001', 'entity', 2000, Date.now(), 'purchase');
      setupDepreciation(asset, 'straight_line', 4, 200);
      
      const depreciation = applyDepreciation(asset);
      
      expect(depreciation).toBe(450); // (2000 - 200) / 4
      expect(asset.value.currentValue).toBe(1550);
    });
  });

  describe('Asset Transfer', () => {
    it('should create asset transfer', () => {
      const transfer = createAssetTransfer('ASSET-001', 'ENT-001', 'ENT-002', 50000, 'Entity restructuring');
      
      expect(transfer.id).toMatch(/^TRANSFER-/);
      expect(transfer.status).toBe('pending');
    });

    it('should complete asset transfer', () => {
      const asset = createAsset('Property', 'real_estate', 'ENT-001', 'entity', 100000, Date.now(), 'purchase');
      const transfer = createAssetTransfer(asset.id, 'ENT-001', 'ENT-002', 100000, 'Transfer');
      
      completeAssetTransfer(asset, transfer);
      
      expect(asset.ownerId).toBe('ENT-002');
      expect(asset.status).toBe('transferred');
      expect(transfer.status).toBe('completed');
    });
  });
});

// ============================================================================
// HOUSE GOVERNANCE TESTS
// ============================================================================

describe('House Governance', () => {
  describe('Governance Setup', () => {
    it('should create house governance', () => {
      const governance = createHouseGovernance('HOUSE-001');
      
      expect(governance.houseId).toBe('HOUSE-001');
      expect(governance.constitution.version).toBe('1.0');
      expect(governance.votingRules.quorumPercentage).toBe(50);
    });

    it('should add constitution articles', () => {
      const governance = createHouseGovernance('HOUSE-001');
      const article = addConstitutionArticle(governance, 1, 'Purpose', 'The purpose of this House...');
      
      expect(article.id).toMatch(/^ART-/);
      expect(governance.constitution.articles).toHaveLength(1);
    });

    it('should add house officers', () => {
      const governance = createHouseGovernance('HOUSE-001');
      const officer = addHouseOfficer(governance, 'USER-001', 'John Doe', 'head', Date.now());
      
      expect(officer.id).toMatch(/^OFF-/);
      expect(officer.role).toBe('head');
      expect(governance.officers).toHaveLength(1);
    });
  });

  describe('Meetings', () => {
    it('should create meeting', () => {
      const governance = createHouseGovernance('HOUSE-001');
      const meeting = createMeeting(governance, 'regular', 'Monthly Meeting', Date.now() + 86400000, 'Main Hall');
      
      expect(meeting.id).toMatch(/^MTG-/);
      expect(meeting.type).toBe('regular');
      expect(meeting.status).toBe('scheduled');
    });

    it('should add agenda items', () => {
      const governance = createHouseGovernance('HOUSE-001');
      const meeting = createMeeting(governance, 'annual', 'Annual Meeting', Date.now(), 'Conference Room');
      const item = addAgendaItem(meeting, 'Financial Report', 'Review Q4 finances', 'report', 30, 'Treasurer');
      
      expect(item.id).toMatch(/^AGENDA-/);
      expect(item.order).toBe(1);
      expect(meeting.agenda).toHaveLength(1);
    });
  });

  describe('Resolutions', () => {
    it('should create resolution', () => {
      const governance = createHouseGovernance('HOUSE-001');
      const resolution = createResolution(governance, 'Budget Approval', 'Approve the 2026 budget', 'John Doe', Date.now() + 604800000);
      
      expect(resolution.id).toMatch(/^RESOL-/);
      expect(resolution.number).toMatch(/^RES-\d{4}-\d{3}$/);
      expect(resolution.status).toBe('proposed');
    });

    it('should cast votes', () => {
      const governance = createHouseGovernance('HOUSE-001');
      const resolution = createResolution(governance, 'Test', 'Test resolution', 'Admin', Date.now() + 86400000);
      
      const vote = castVote(resolution, 'USER-001', 'John', 'yes');
      
      expect(vote.vote).toBe('yes');
      expect(resolution.votes).toHaveLength(1);
      expect(resolution.status).toBe('voting');
    });

    it('should tally votes and determine result', () => {
      const governance = createHouseGovernance('HOUSE-001');
      const resolution = createResolution(governance, 'Test', 'Test', 'Admin', Date.now());
      
      castVote(resolution, 'USER-001', 'John', 'yes');
      castVote(resolution, 'USER-002', 'Jane', 'yes');
      castVote(resolution, 'USER-003', 'Bob', 'no');
      
      const result = tallyVotes(resolution, 5, 50);
      
      expect(result.yesVotes).toBe(2);
      expect(result.noVotes).toBe(1);
      expect(result.quorumMet).toBe(true); // 3/5 = 60%
      expect(result.passed).toBe(true);
      expect(resolution.status).toBe('passed');
    });

    it('should fail when quorum not met', () => {
      const governance = createHouseGovernance('HOUSE-001');
      const resolution = createResolution(governance, 'Test', 'Test', 'Admin', Date.now());
      
      castVote(resolution, 'USER-001', 'John', 'yes');
      
      const result = tallyVotes(resolution, 10, 50);
      
      expect(result.quorumMet).toBe(false);
      expect(result.passed).toBe(false);
      expect(resolution.status).toBe('failed');
    });
  });

  describe('Committees', () => {
    it('should create committee', () => {
      const governance = createHouseGovernance('HOUSE-001');
      const committee = createCommittee(governance, 'Finance Committee', 'Oversee financial matters', { memberId: 'USER-001', name: 'John' });
      
      expect(committee.id).toMatch(/^COMM-/);
      expect(committee.members).toHaveLength(1);
      expect(committee.members[0].role).toBe('chair');
    });

    it('should add committee members', () => {
      const governance = createHouseGovernance('HOUSE-001');
      const committee = createCommittee(governance, 'Test Committee', 'Testing', { memberId: 'USER-001', name: 'Chair' });
      
      addCommitteeMember(committee, 'USER-002', 'Member 1');
      addCommitteeMember(committee, 'USER-003', 'Member 2');
      
      expect(committee.members).toHaveLength(3);
      expect(committee.members[1].role).toBe('member');
    });
  });
});
