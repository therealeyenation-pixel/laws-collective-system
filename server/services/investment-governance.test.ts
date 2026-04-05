import { describe, it, expect, beforeEach } from 'vitest';
import {
  createProposal,
  getProposal,
  listProposals,
  submitProposal,
  updateProposalStatus,
  recordVote,
  getProposalVotes,
  calculateVoteResults,
  createPolicy,
  getPolicy,
  listPolicies,
  activatePolicy,
  deactivatePolicy,
  checkPolicyCompliance,
  listViolations,
  resolveViolation,
  waiveViolation,
  createCommittee,
  getCommittee,
  listCommittees,
  addCommitteeMember,
  removeCommitteeMember,
  scheduleMeeting,
  getMeeting,
  listMeetings,
  startMeeting,
  recordAgendaOutcome,
  completeMeeting,
  cancelMeeting,
  generateGovernanceSummary,
  createDefaultPolicies,
  resetGovernanceData,
  PROPOSAL_TYPES,
  PROPOSAL_STATUSES,
  POLICY_CATEGORIES,
  VOTE_TYPES,
} from './investment-governance';

describe('Investment Governance Service', () => {
  beforeEach(() => {
    resetGovernanceData();
  });

  describe('Constants', () => {
    it('should have proposal types', () => {
      expect(PROPOSAL_TYPES).toContain('new_investment');
      expect(PROPOSAL_TYPES).toContain('liquidate_position');
      expect(PROPOSAL_TYPES).toContain('policy_change');
      expect(PROPOSAL_TYPES.length).toBe(8);
    });

    it('should have proposal statuses', () => {
      expect(PROPOSAL_STATUSES).toContain('draft');
      expect(PROPOSAL_STATUSES).toContain('approved');
      expect(PROPOSAL_STATUSES).toContain('rejected');
      expect(PROPOSAL_STATUSES.length).toBe(7);
    });

    it('should have policy categories', () => {
      expect(POLICY_CATEGORIES).toContain('asset_allocation');
      expect(POLICY_CATEGORIES).toContain('risk_management');
      expect(POLICY_CATEGORIES).toContain('esg_criteria');
      expect(POLICY_CATEGORIES.length).toBe(8);
    });

    it('should have vote types', () => {
      expect(VOTE_TYPES).toContain('approve');
      expect(VOTE_TYPES).toContain('reject');
      expect(VOTE_TYPES).toContain('abstain');
      expect(VOTE_TYPES.length).toBe(3);
    });
  });

  describe('Proposal Management', () => {
    it('should create a proposal', () => {
      const proposal = createProposal({
        entityId: 'entity-1',
        type: 'new_investment',
        title: 'Invest in Index Fund',
        description: 'Proposal to invest in S&P 500 index fund',
        rationale: 'Diversification and long-term growth',
        ticker: 'VOO',
        assetClass: 'etfs',
        proposedAmount: 100000,
        riskLevel: 'medium',
        riskFactors: ['Market risk', 'Economic downturn'],
        mitigationStrategies: ['Dollar cost averaging', 'Long-term hold'],
        expectedReturn: 8,
        timeHorizon: '10+ years',
        exitStrategy: 'Systematic withdrawal in retirement',
        requiredApprovers: ['user-1', 'user-2', 'user-3'],
        minimumVotes: 2,
        approvalThreshold: 66,
        submittedBy: 'user-1',
      });

      expect(proposal.id).toBeDefined();
      expect(proposal.proposalNumber).toMatch(/^INV-\d{4}-\d{4}$/);
      expect(proposal.type).toBe('new_investment');
      expect(proposal.status).toBe('draft');
      expect(proposal.ticker).toBe('VOO');
      expect(proposal.proposedAmount).toBe(100000);
    });

    it('should get a proposal by id', () => {
      const created = createProposal({
        entityId: 'entity-1',
        type: 'increase_position',
        title: 'Increase Bond Holdings',
        description: 'Add to bond allocation',
        rationale: 'Reduce portfolio volatility',
        proposedAmount: 50000,
        riskLevel: 'low',
        riskFactors: ['Interest rate risk'],
        mitigationStrategies: ['Ladder maturities'],
        requiredApprovers: ['user-1'],
        minimumVotes: 1,
        approvalThreshold: 100,
        submittedBy: 'user-1',
      });

      const retrieved = getProposal(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Increase Bond Holdings');
    });

    it('should list proposals with filters', () => {
      createProposal({
        entityId: 'entity-1',
        type: 'new_investment',
        title: 'Proposal 1',
        description: 'Test',
        rationale: 'Test',
        proposedAmount: 10000,
        riskLevel: 'low',
        riskFactors: [],
        mitigationStrategies: [],
        requiredApprovers: ['user-1'],
        minimumVotes: 1,
        approvalThreshold: 100,
        submittedBy: 'user-1',
      });

      createProposal({
        entityId: 'entity-2',
        type: 'liquidate_position',
        title: 'Proposal 2',
        description: 'Test',
        rationale: 'Test',
        proposedAmount: 20000,
        riskLevel: 'medium',
        riskFactors: [],
        mitigationStrategies: [],
        requiredApprovers: ['user-1'],
        minimumVotes: 1,
        approvalThreshold: 100,
        submittedBy: 'user-1',
      });

      const all = listProposals();
      expect(all.length).toBe(2);

      const entity1 = listProposals({ entityId: 'entity-1' });
      expect(entity1.length).toBe(1);

      const liquidate = listProposals({ type: 'liquidate_position' });
      expect(liquidate.length).toBe(1);
    });

    it('should submit a draft proposal', () => {
      const proposal = createProposal({
        entityId: 'entity-1',
        type: 'new_investment',
        title: 'Test Proposal',
        description: 'Test',
        rationale: 'Test',
        proposedAmount: 10000,
        riskLevel: 'low',
        riskFactors: [],
        mitigationStrategies: [],
        requiredApprovers: ['user-1'],
        minimumVotes: 1,
        approvalThreshold: 100,
        submittedBy: 'user-1',
      });

      expect(proposal.status).toBe('draft');

      const submitted = submitProposal(proposal.id);
      expect(submitted.status).toBe('submitted');
      expect(submitted.submittedAt).toBeDefined();
    });

    it('should not submit non-draft proposal', () => {
      const proposal = createProposal({
        entityId: 'entity-1',
        type: 'new_investment',
        title: 'Test',
        description: 'Test',
        rationale: 'Test',
        proposedAmount: 10000,
        riskLevel: 'low',
        riskFactors: [],
        mitigationStrategies: [],
        requiredApprovers: ['user-1'],
        minimumVotes: 1,
        approvalThreshold: 100,
        submittedBy: 'user-1',
      });

      submitProposal(proposal.id);
      expect(() => submitProposal(proposal.id)).toThrow('Only draft proposals can be submitted');
    });

    it('should update proposal status', () => {
      const proposal = createProposal({
        entityId: 'entity-1',
        type: 'new_investment',
        title: 'Test',
        description: 'Test',
        rationale: 'Test',
        proposedAmount: 10000,
        riskLevel: 'low',
        riskFactors: [],
        mitigationStrategies: [],
        requiredApprovers: ['user-1'],
        minimumVotes: 1,
        approvalThreshold: 100,
        submittedBy: 'user-1',
      });

      const updated = updateProposalStatus(proposal.id, 'implemented', 'user-1');
      expect(updated.status).toBe('implemented');
      expect(updated.implementedAt).toBeDefined();
      expect(updated.implementedBy).toBe('user-1');
    });
  });

  describe('Voting', () => {
    it('should record a vote', () => {
      const proposal = createProposal({
        entityId: 'entity-1',
        type: 'new_investment',
        title: 'Test',
        description: 'Test',
        rationale: 'Test',
        proposedAmount: 10000,
        riskLevel: 'low',
        riskFactors: [],
        mitigationStrategies: [],
        requiredApprovers: ['user-1', 'user-2'],
        minimumVotes: 2,
        approvalThreshold: 50,
        submittedBy: 'user-1',
      });

      submitProposal(proposal.id);

      const vote = recordVote({
        proposalId: proposal.id,
        voterId: 'user-1',
        voterName: 'John Doe',
        voterRole: 'Board Member',
        vote: 'approve',
        comments: 'Good investment opportunity',
      });

      expect(vote.id).toBeDefined();
      expect(vote.vote).toBe('approve');
      expect(vote.votedAt).toBeDefined();
    });

    it('should not allow duplicate votes', () => {
      const proposal = createProposal({
        entityId: 'entity-1',
        type: 'new_investment',
        title: 'Test',
        description: 'Test',
        rationale: 'Test',
        proposedAmount: 10000,
        riskLevel: 'low',
        riskFactors: [],
        mitigationStrategies: [],
        requiredApprovers: ['user-1', 'user-2'], // Need 2 approvers so proposal stays open
        minimumVotes: 2,
        approvalThreshold: 100,
        submittedBy: 'user-1',
      });

      submitProposal(proposal.id);

      recordVote({
        proposalId: proposal.id,
        voterId: 'user-1',
        voterName: 'John Doe',
        voterRole: 'Board Member',
        vote: 'approve',
      });

      expect(() => recordVote({
        proposalId: proposal.id,
        voterId: 'user-1',
        voterName: 'John Doe',
        voterRole: 'Board Member',
        vote: 'reject',
      })).toThrow('Voter has already voted on this proposal');
    });

    it('should calculate vote results', () => {
      const proposal = createProposal({
        entityId: 'entity-1',
        type: 'new_investment',
        title: 'Test',
        description: 'Test',
        rationale: 'Test',
        proposedAmount: 10000,
        riskLevel: 'low',
        riskFactors: [],
        mitigationStrategies: [],
        requiredApprovers: ['user-1', 'user-2', 'user-3'],
        minimumVotes: 2,
        approvalThreshold: 66,
        submittedBy: 'user-1',
      });

      submitProposal(proposal.id);

      recordVote({
        proposalId: proposal.id,
        voterId: 'user-1',
        voterName: 'User 1',
        voterRole: 'Member',
        vote: 'approve',
      });

      recordVote({
        proposalId: proposal.id,
        voterId: 'user-2',
        voterName: 'User 2',
        voterRole: 'Member',
        vote: 'approve',
      });

      recordVote({
        proposalId: proposal.id,
        voterId: 'user-3',
        voterName: 'User 3',
        voterRole: 'Member',
        vote: 'reject',
      });

      const results = calculateVoteResults(proposal.id);
      expect(results.totalVotes).toBe(3);
      expect(results.approveVotes).toBe(2);
      expect(results.rejectVotes).toBe(1);
      expect(results.approvalPercentage).toBeCloseTo(66.67, 1);
      expect(results.quorumMet).toBe(true);
      expect(results.approved).toBe(true);
    });

    it('should get proposal votes', () => {
      const proposal = createProposal({
        entityId: 'entity-1',
        type: 'new_investment',
        title: 'Test',
        description: 'Test',
        rationale: 'Test',
        proposedAmount: 10000,
        riskLevel: 'low',
        riskFactors: [],
        mitigationStrategies: [],
        requiredApprovers: ['user-1', 'user-2'],
        minimumVotes: 2,
        approvalThreshold: 50,
        submittedBy: 'user-1',
      });

      submitProposal(proposal.id);

      recordVote({
        proposalId: proposal.id,
        voterId: 'user-1',
        voterName: 'User 1',
        voterRole: 'Member',
        vote: 'approve',
      });

      recordVote({
        proposalId: proposal.id,
        voterId: 'user-2',
        voterName: 'User 2',
        voterRole: 'Member',
        vote: 'abstain',
      });

      const votes = getProposalVotes(proposal.id);
      expect(votes.length).toBe(2);
    });
  });

  describe('Policy Management', () => {
    it('should create a policy', () => {
      const policy = createPolicy({
        entityId: 'entity-1',
        category: 'asset_allocation',
        name: 'Target Allocation Policy',
        description: 'Defines target allocation ranges',
        effectiveDate: new Date(),
        rules: [
          {
            name: 'Equity Maximum',
            condition: 'Equity must not exceed 70%',
            threshold: 70,
            operator: 'gt',
            action: 'require_approval',
            severity: 'warning',
          },
        ],
      });

      expect(policy.id).toBeDefined();
      expect(policy.category).toBe('asset_allocation');
      expect(policy.status).toBe('pending_review');
      expect(policy.rules.length).toBe(1);
      expect(policy.rules[0].id).toBeDefined();
    });

    it('should activate a policy', () => {
      const policy = createPolicy({
        entityId: 'entity-1',
        category: 'risk_management',
        name: 'Risk Policy',
        description: 'Risk management guidelines',
        effectiveDate: new Date(),
        rules: [],
      });

      const activated = activatePolicy(policy.id, 'admin-1');
      expect(activated.status).toBe('active');
      expect(activated.approvedBy).toBe('admin-1');
      expect(activated.approvedAt).toBeDefined();
    });

    it('should deactivate a policy', () => {
      const policy = createPolicy({
        entityId: 'entity-1',
        category: 'concentration_limits',
        name: 'Concentration Policy',
        description: 'Position limits',
        effectiveDate: new Date(),
        rules: [],
      });

      activatePolicy(policy.id, 'admin-1');
      const deactivated = deactivatePolicy(policy.id);
      expect(deactivated.status).toBe('inactive');
    });

    it('should list policies with filters', () => {
      createPolicy({
        entityId: 'entity-1',
        category: 'asset_allocation',
        name: 'Policy 1',
        description: 'Test',
        effectiveDate: new Date(),
        rules: [],
      });

      createPolicy({
        entityId: 'entity-1',
        category: 'risk_management',
        name: 'Policy 2',
        description: 'Test',
        effectiveDate: new Date(),
        rules: [],
      });

      const all = listPolicies({ entityId: 'entity-1' });
      expect(all.length).toBe(2);

      const riskPolicies = listPolicies({ category: 'risk_management' });
      expect(riskPolicies.length).toBe(1);
    });
  });

  describe('Policy Compliance', () => {
    it('should detect policy violations', () => {
      const policy = createPolicy({
        entityId: 'entity-1',
        category: 'concentration_limits',
        name: 'Position Limits',
        description: 'Limits on position sizes',
        effectiveDate: new Date(),
        rules: [
          {
            name: 'Single Position Maximum',
            condition: 'No position may exceed 10%',
            threshold: 10,
            operator: 'gt',
            action: 'prohibit',
            severity: 'critical',
          },
        ],
      });

      activatePolicy(policy.id, 'admin-1');

      const violations = checkPolicyCompliance({
        entityId: 'entity-1',
        checkType: 'concentration',
        ticker: 'AAPL',
        percentage: 15,
      });

      expect(violations.length).toBe(1);
      expect(violations[0].severity).toBe('critical');
      expect(violations[0].currentValue).toBe(15);
      expect(violations[0].thresholdValue).toBe(10);
    });

    it('should not flag compliant positions', () => {
      const policy = createPolicy({
        entityId: 'entity-1',
        category: 'concentration_limits',
        name: 'Position Limits',
        description: 'Limits on position sizes',
        effectiveDate: new Date(),
        rules: [
          {
            name: 'Single Position Maximum',
            condition: 'No position may exceed 10%',
            threshold: 10,
            operator: 'gt',
            action: 'prohibit',
            severity: 'critical',
          },
        ],
      });

      activatePolicy(policy.id, 'admin-1');

      const violations = checkPolicyCompliance({
        entityId: 'entity-1',
        checkType: 'concentration',
        ticker: 'AAPL',
        percentage: 8,
      });

      expect(violations.length).toBe(0);
    });

    it('should resolve violations', () => {
      const policy = createPolicy({
        entityId: 'entity-1',
        category: 'concentration_limits',
        name: 'Position Limits',
        description: 'Test',
        effectiveDate: new Date(),
        rules: [
          {
            name: 'Test Rule',
            condition: 'Test',
            threshold: 10,
            operator: 'gt',
            action: 'alert',
            severity: 'warning',
          },
        ],
      });

      activatePolicy(policy.id, 'admin-1');

      const violations = checkPolicyCompliance({
        entityId: 'entity-1',
        checkType: 'concentration',
        percentage: 15,
      });

      const resolved = resolveViolation(violations[0].id, 'Position reduced', 'user-1');
      expect(resolved.status).toBe('resolved');
      expect(resolved.resolution).toBe('Position reduced');
    });

    it('should waive violations', () => {
      const policy = createPolicy({
        entityId: 'entity-1',
        category: 'concentration_limits',
        name: 'Position Limits',
        description: 'Test',
        effectiveDate: new Date(),
        rules: [
          {
            name: 'Test Rule',
            condition: 'Test',
            threshold: 10,
            operator: 'gt',
            action: 'alert',
            severity: 'info',
          },
        ],
      });

      activatePolicy(policy.id, 'admin-1');

      const violations = checkPolicyCompliance({
        entityId: 'entity-1',
        checkType: 'concentration',
        percentage: 12,
      });

      const waived = waiveViolation(violations[0].id, 'Board approved exception', 'admin-1');
      expect(waived.status).toBe('waived');
      expect(waived.resolution).toContain('Waived');
    });

    it('should list violations with filters', () => {
      const policy = createPolicy({
        entityId: 'entity-1',
        category: 'concentration_limits',
        name: 'Position Limits',
        description: 'Test',
        effectiveDate: new Date(),
        rules: [
          {
            name: 'Test Rule',
            condition: 'Test',
            threshold: 10,
            operator: 'gt',
            action: 'alert',
            severity: 'critical',
          },
        ],
      });

      activatePolicy(policy.id, 'admin-1');

      checkPolicyCompliance({
        entityId: 'entity-1',
        checkType: 'concentration',
        percentage: 15,
      });

      const openViolations = listViolations({ status: 'open' });
      expect(openViolations.length).toBe(1);

      const criticalViolations = listViolations({ severity: 'critical' });
      expect(criticalViolations.length).toBe(1);
    });
  });

  describe('Committee Management', () => {
    it('should create a committee', () => {
      const committee = createCommittee({
        entityId: 'entity-1',
        name: 'Investment Committee',
        description: 'Oversees investment decisions',
        members: [
          {
            userId: 'user-1',
            name: 'John Doe',
            role: 'chair',
            votingRights: true,
            joinedAt: new Date(),
          },
          {
            userId: 'user-2',
            name: 'Jane Smith',
            role: 'member',
            votingRights: true,
            joinedAt: new Date(),
          },
        ],
        quorumRequirement: 2,
        approvalThreshold: 66,
        meetingFrequency: 'monthly',
      });

      expect(committee.id).toBeDefined();
      expect(committee.name).toBe('Investment Committee');
      expect(committee.members.length).toBe(2);
      expect(committee.status).toBe('active');
    });

    it('should add committee member', () => {
      const committee = createCommittee({
        entityId: 'entity-1',
        name: 'Test Committee',
        description: 'Test',
        members: [],
        quorumRequirement: 1,
        approvalThreshold: 50,
        meetingFrequency: 'quarterly',
      });

      const updated = addCommitteeMember(committee.id, {
        userId: 'user-1',
        name: 'New Member',
        role: 'member',
        votingRights: true,
        joinedAt: new Date(),
      });

      expect(updated.members.length).toBe(1);
    });

    it('should remove committee member', () => {
      const committee = createCommittee({
        entityId: 'entity-1',
        name: 'Test Committee',
        description: 'Test',
        members: [
          {
            userId: 'user-1',
            name: 'Member 1',
            role: 'member',
            votingRights: true,
            joinedAt: new Date(),
          },
        ],
        quorumRequirement: 1,
        approvalThreshold: 50,
        meetingFrequency: 'quarterly',
      });

      const memberId = committee.members[0].id;
      const updated = removeCommitteeMember(committee.id, memberId);
      expect(updated.members.length).toBe(0);
    });

    it('should list committees', () => {
      createCommittee({
        entityId: 'entity-1',
        name: 'Committee A',
        description: 'Test',
        members: [],
        quorumRequirement: 1,
        approvalThreshold: 50,
        meetingFrequency: 'monthly',
      });

      createCommittee({
        entityId: 'entity-2',
        name: 'Committee B',
        description: 'Test',
        members: [],
        quorumRequirement: 1,
        approvalThreshold: 50,
        meetingFrequency: 'quarterly',
      });

      const all = listCommittees();
      expect(all.length).toBe(2);

      const entity1 = listCommittees('entity-1');
      expect(entity1.length).toBe(1);
    });
  });

  describe('Meeting Management', () => {
    it('should schedule a meeting', () => {
      const committee = createCommittee({
        entityId: 'entity-1',
        name: 'Test Committee',
        description: 'Test',
        members: [],
        quorumRequirement: 2,
        approvalThreshold: 50,
        meetingFrequency: 'monthly',
      });

      const meeting = scheduleMeeting({
        committeeId: committee.id,
        scheduledDate: new Date('2026-02-15'),
        location: 'Conference Room A',
        agendaItems: [
          {
            order: 1,
            type: 'proposal_review',
            title: 'Review Q1 Investment Proposal',
            description: 'Review and vote on Q1 investment allocation',
            presenter: 'CFO',
            timeAllotted: 30,
          },
        ],
      });

      expect(meeting.id).toBeDefined();
      expect(meeting.meetingNumber).toMatch(/^MTG-\d{4}-\d{4}$/);
      expect(meeting.status).toBe('scheduled');
      expect(meeting.agendaItems.length).toBe(1);
    });

    it('should start a meeting and check quorum', () => {
      const committee = createCommittee({
        entityId: 'entity-1',
        name: 'Test Committee',
        description: 'Test',
        members: [
          { userId: 'user-1', name: 'Member 1', role: 'chair', votingRights: true, joinedAt: new Date() },
          { userId: 'user-2', name: 'Member 2', role: 'member', votingRights: true, joinedAt: new Date() },
          { userId: 'user-3', name: 'Member 3', role: 'member', votingRights: true, joinedAt: new Date() },
        ],
        quorumRequirement: 2,
        approvalThreshold: 50,
        meetingFrequency: 'monthly',
      });

      const meeting = scheduleMeeting({
        committeeId: committee.id,
        scheduledDate: new Date(),
        location: 'Virtual',
        agendaItems: [],
      });

      const started = startMeeting(meeting.id, ['user-1', 'user-2']);
      expect(started.status).toBe('in_progress');
      expect(started.quorumMet).toBe(true);
      expect(started.attendees.length).toBe(2);
    });

    it('should record agenda item outcome', () => {
      const committee = createCommittee({
        entityId: 'entity-1',
        name: 'Test Committee',
        description: 'Test',
        members: [],
        quorumRequirement: 1,
        approvalThreshold: 50,
        meetingFrequency: 'monthly',
      });

      const meeting = scheduleMeeting({
        committeeId: committee.id,
        scheduledDate: new Date(),
        location: 'Virtual',
        agendaItems: [
          {
            order: 1,
            type: 'proposal_review',
            title: 'Test Item',
            description: 'Test',
          },
        ],
      });

      const agendaItemId = meeting.agendaItems[0].id;
      const updated = recordAgendaOutcome(
        meeting.id,
        agendaItemId,
        'Proposal approved unanimously',
        true,
        'approved'
      );

      expect(updated.agendaItems[0].outcome).toBe('Proposal approved unanimously');
      expect(updated.agendaItems[0].voteTaken).toBe(true);
      expect(updated.agendaItems[0].voteResult).toBe('approved');
    });

    it('should complete a meeting', () => {
      const committee = createCommittee({
        entityId: 'entity-1',
        name: 'Test Committee',
        description: 'Test',
        members: [],
        quorumRequirement: 1,
        approvalThreshold: 50,
        meetingFrequency: 'monthly',
      });

      const meeting = scheduleMeeting({
        committeeId: committee.id,
        scheduledDate: new Date(),
        location: 'Virtual',
        agendaItems: [],
      });

      startMeeting(meeting.id, ['user-1']);
      const completed = completeMeeting(meeting.id, 'Meeting minutes content...');
      expect(completed.status).toBe('completed');
      expect(completed.minutes).toBe('Meeting minutes content...');
    });

    it('should cancel a meeting', () => {
      const committee = createCommittee({
        entityId: 'entity-1',
        name: 'Test Committee',
        description: 'Test',
        members: [],
        quorumRequirement: 1,
        approvalThreshold: 50,
        meetingFrequency: 'monthly',
      });

      const meeting = scheduleMeeting({
        committeeId: committee.id,
        scheduledDate: new Date(),
        location: 'Virtual',
        agendaItems: [],
      });

      const cancelled = cancelMeeting(meeting.id);
      expect(cancelled.status).toBe('cancelled');
    });

    it('should list meetings with filters', () => {
      const committee = createCommittee({
        entityId: 'entity-1',
        name: 'Test Committee',
        description: 'Test',
        members: [],
        quorumRequirement: 1,
        approvalThreshold: 50,
        meetingFrequency: 'monthly',
      });

      scheduleMeeting({
        committeeId: committee.id,
        scheduledDate: new Date(),
        location: 'Virtual',
        agendaItems: [],
      });

      const meeting2 = scheduleMeeting({
        committeeId: committee.id,
        scheduledDate: new Date(),
        location: 'Virtual',
        agendaItems: [],
      });

      startMeeting(meeting2.id, ['user-1']);
      completeMeeting(meeting2.id, 'Minutes');

      const scheduled = listMeetings({ status: 'scheduled' });
      expect(scheduled.length).toBe(1);

      const completed = listMeetings({ status: 'completed' });
      expect(completed.length).toBe(1);
    });
  });

  describe('Reporting', () => {
    it('should generate governance summary', () => {
      // Create some test data
      const proposal = createProposal({
        entityId: 'entity-1',
        type: 'new_investment',
        title: 'Test',
        description: 'Test',
        rationale: 'Test',
        proposedAmount: 10000,
        riskLevel: 'low',
        riskFactors: [],
        mitigationStrategies: [],
        requiredApprovers: ['user-1'],
        minimumVotes: 1,
        approvalThreshold: 100,
        submittedBy: 'user-1',
      });

      submitProposal(proposal.id);

      createPolicy({
        entityId: 'entity-1',
        category: 'asset_allocation',
        name: 'Test Policy',
        description: 'Test',
        effectiveDate: new Date(),
        rules: [],
      });

      createCommittee({
        entityId: 'entity-1',
        name: 'Test Committee',
        description: 'Test',
        members: [
          { userId: 'user-1', name: 'Member', role: 'chair', votingRights: true, joinedAt: new Date() },
        ],
        quorumRequirement: 1,
        approvalThreshold: 50,
        meetingFrequency: 'monthly',
      });

      const summary = generateGovernanceSummary('entity-1');

      expect(summary.proposals.total).toBe(1);
      expect(summary.proposals.pendingReview).toBe(1);
      expect(summary.policies.total).toBe(1);
      expect(summary.committees.total).toBe(1);
      expect(summary.committees.totalMembers).toBe(1);
    });
  });

  describe('Default Policies', () => {
    it('should create default policies', () => {
      const policies = createDefaultPolicies('entity-1');

      expect(policies.length).toBe(3);
      expect(policies.map(p => p.category)).toContain('asset_allocation');
      expect(policies.map(p => p.category)).toContain('concentration_limits');
      expect(policies.map(p => p.category)).toContain('risk_management');

      // Check that rules were created
      const allocationPolicy = policies.find(p => p.category === 'asset_allocation');
      expect(allocationPolicy?.rules.length).toBeGreaterThan(0);
    });
  });
});
