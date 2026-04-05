import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
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
  PROPOSAL_TYPES,
  PROPOSAL_STATUSES,
  POLICY_CATEGORIES,
  VOTE_TYPES,
} from '../services/investment-governance';

export const investmentGovernanceRouter = router({
  // Constants
  getProposalTypes: protectedProcedure.query(() => PROPOSAL_TYPES),
  getProposalStatuses: protectedProcedure.query(() => PROPOSAL_STATUSES),
  getPolicyCategories: protectedProcedure.query(() => POLICY_CATEGORIES),
  getVoteTypes: protectedProcedure.query(() => VOTE_TYPES),

  // Proposal Management
  createProposal: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      type: z.enum(PROPOSAL_TYPES),
      title: z.string(),
      description: z.string(),
      rationale: z.string(),
      ticker: z.string().optional(),
      assetClass: z.string().optional(),
      proposedAmount: z.number(),
      currentAmount: z.number().optional(),
      targetAllocation: z.number().optional(),
      riskLevel: z.enum(['low', 'medium', 'high', 'very_high']),
      riskFactors: z.array(z.string()),
      mitigationStrategies: z.array(z.string()),
      expectedReturn: z.number().optional(),
      timeHorizon: z.string().optional(),
      exitStrategy: z.string().optional(),
      requiredApprovers: z.array(z.string()),
      minimumVotes: z.number(),
      approvalThreshold: z.number(),
      reviewDeadline: z.date().optional(),
      implementationDeadline: z.date().optional(),
    }))
    .mutation(({ input, ctx }) => {
      return createProposal({
        ...input,
        submittedBy: ctx.user.id.toString(),
      });
    }),

  getProposal: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getProposal(input.id)),

  listProposals: protectedProcedure
    .input(z.object({
      entityId: z.string().optional(),
      status: z.enum(PROPOSAL_STATUSES).optional(),
      type: z.enum(PROPOSAL_TYPES).optional(),
    }).optional())
    .query(({ input }) => listProposals(input)),

  submitProposal: protectedProcedure
    .input(z.object({ proposalId: z.string() }))
    .mutation(({ input }) => submitProposal(input.proposalId)),

  updateProposalStatus: protectedProcedure
    .input(z.object({
      proposalId: z.string(),
      status: z.enum(PROPOSAL_STATUSES),
    }))
    .mutation(({ input, ctx }) => updateProposalStatus(input.proposalId, input.status, ctx.user.id.toString())),

  // Voting
  recordVote: protectedProcedure
    .input(z.object({
      proposalId: z.string(),
      vote: z.enum(VOTE_TYPES),
      comments: z.string().optional(),
    }))
    .mutation(({ input, ctx }) => {
      return recordVote({
        proposalId: input.proposalId,
        voterId: ctx.user.id.toString(),
        voterName: ctx.user.name,
        voterRole: ctx.user.role,
        vote: input.vote,
        comments: input.comments,
      });
    }),

  getProposalVotes: protectedProcedure
    .input(z.object({ proposalId: z.string() }))
    .query(({ input }) => getProposalVotes(input.proposalId)),

  calculateVoteResults: protectedProcedure
    .input(z.object({ proposalId: z.string() }))
    .query(({ input }) => calculateVoteResults(input.proposalId)),

  // Policy Management
  createPolicy: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      category: z.enum(POLICY_CATEGORIES),
      name: z.string(),
      description: z.string(),
      rules: z.array(z.object({
        name: z.string(),
        condition: z.string(),
        threshold: z.number().optional(),
        operator: z.enum(['lt', 'lte', 'gt', 'gte', 'eq', 'neq', 'between']).optional(),
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
        action: z.enum(['require_approval', 'prohibit', 'alert', 'log']),
        severity: z.enum(['info', 'warning', 'critical']),
      })),
      effectiveDate: z.date(),
      expirationDate: z.date().optional(),
    }))
    .mutation(({ input }) => createPolicy(input)),

  getPolicy: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getPolicy(input.id)),

  listPolicies: protectedProcedure
    .input(z.object({
      entityId: z.string().optional(),
      category: z.enum(POLICY_CATEGORIES).optional(),
      status: z.enum(['active', 'inactive', 'pending_review']).optional(),
    }).optional())
    .query(({ input }) => listPolicies(input)),

  activatePolicy: protectedProcedure
    .input(z.object({ policyId: z.string() }))
    .mutation(({ input, ctx }) => activatePolicy(input.policyId, ctx.user.id.toString())),

  deactivatePolicy: protectedProcedure
    .input(z.object({ policyId: z.string() }))
    .mutation(({ input }) => deactivatePolicy(input.policyId)),

  // Policy Compliance
  checkPolicyCompliance: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      proposalId: z.string().optional(),
      holdingId: z.string().optional(),
      transactionId: z.string().optional(),
      checkType: z.enum(['asset_allocation', 'concentration', 'prohibited', 'risk_limit']),
      assetClass: z.string().optional(),
      ticker: z.string().optional(),
      amount: z.number().optional(),
      percentage: z.number().optional(),
    }))
    .mutation(({ input }) => checkPolicyCompliance(input)),

  listViolations: protectedProcedure
    .input(z.object({
      entityId: z.string().optional(),
      policyId: z.string().optional(),
      status: z.enum(['open', 'acknowledged', 'resolved', 'waived']).optional(),
      severity: z.enum(['info', 'warning', 'critical']).optional(),
    }).optional())
    .query(({ input }) => listViolations(input)),

  resolveViolation: protectedProcedure
    .input(z.object({
      violationId: z.string(),
      resolution: z.string(),
    }))
    .mutation(({ input, ctx }) => resolveViolation(input.violationId, input.resolution, ctx.user.id.toString())),

  waiveViolation: protectedProcedure
    .input(z.object({
      violationId: z.string(),
      reason: z.string(),
    }))
    .mutation(({ input, ctx }) => waiveViolation(input.violationId, input.reason, ctx.user.id.toString())),

  // Committee Management
  createCommittee: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      name: z.string(),
      description: z.string(),
      members: z.array(z.object({
        userId: z.string(),
        name: z.string(),
        role: z.enum(['chair', 'vice_chair', 'member', 'advisor']),
        votingRights: z.boolean(),
        joinedAt: z.date(),
        term: z.string().optional(),
      })),
      quorumRequirement: z.number(),
      approvalThreshold: z.number(),
      meetingFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed']),
    }))
    .mutation(({ input }) => createCommittee(input)),

  getCommittee: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getCommittee(input.id)),

  listCommittees: protectedProcedure
    .input(z.object({ entityId: z.string().optional() }).optional())
    .query(({ input }) => listCommittees(input?.entityId)),

  addCommitteeMember: protectedProcedure
    .input(z.object({
      committeeId: z.string(),
      member: z.object({
        userId: z.string(),
        name: z.string(),
        role: z.enum(['chair', 'vice_chair', 'member', 'advisor']),
        votingRights: z.boolean(),
        joinedAt: z.date(),
        term: z.string().optional(),
      }),
    }))
    .mutation(({ input }) => addCommitteeMember(input.committeeId, input.member)),

  removeCommitteeMember: protectedProcedure
    .input(z.object({
      committeeId: z.string(),
      memberId: z.string(),
    }))
    .mutation(({ input }) => removeCommitteeMember(input.committeeId, input.memberId)),

  // Meeting Management
  scheduleMeeting: protectedProcedure
    .input(z.object({
      committeeId: z.string(),
      scheduledDate: z.date(),
      location: z.string(),
      agendaItems: z.array(z.object({
        order: z.number().optional(),
        type: z.enum(['proposal_review', 'policy_review', 'performance_review', 'other']),
        title: z.string(),
        description: z.string(),
        proposalId: z.string().optional(),
        policyId: z.string().optional(),
        presenter: z.string().optional(),
        timeAllotted: z.number().optional(),
      })),
    }))
    .mutation(({ input }) => scheduleMeeting(input)),

  getMeeting: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getMeeting(input.id)),

  listMeetings: protectedProcedure
    .input(z.object({
      committeeId: z.string().optional(),
      status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
    }).optional())
    .query(({ input }) => listMeetings(input)),

  startMeeting: protectedProcedure
    .input(z.object({
      meetingId: z.string(),
      attendees: z.array(z.string()),
    }))
    .mutation(({ input }) => startMeeting(input.meetingId, input.attendees)),

  recordAgendaOutcome: protectedProcedure
    .input(z.object({
      meetingId: z.string(),
      agendaItemId: z.string(),
      outcome: z.string(),
      voteTaken: z.boolean(),
      voteResult: z.enum(['approved', 'rejected', 'tabled', 'no_vote']).optional(),
    }))
    .mutation(({ input }) => recordAgendaOutcome(
      input.meetingId,
      input.agendaItemId,
      input.outcome,
      input.voteTaken,
      input.voteResult
    )),

  completeMeeting: protectedProcedure
    .input(z.object({
      meetingId: z.string(),
      minutes: z.string(),
    }))
    .mutation(({ input }) => completeMeeting(input.meetingId, input.minutes)),

  cancelMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(({ input }) => cancelMeeting(input.meetingId)),

  // Reporting
  generateGovernanceSummary: protectedProcedure
    .input(z.object({ entityId: z.string() }))
    .query(({ input }) => generateGovernanceSummary(input.entityId)),

  createDefaultPolicies: protectedProcedure
    .input(z.object({ entityId: z.string() }))
    .mutation(({ input }) => createDefaultPolicies(input.entityId)),
});
