import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { 
  businessEntities, 
  blockchainRecords, 
  autonomousOperations,
  luvLedgerAccounts,
  luvLedgerTransactions
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Trust Governance Types
interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  category: 'allocation' | 'access' | 'operation' | 'sovereignty' | 'succession';
  rules: PolicyRule[];
  status: 'active' | 'pending' | 'suspended';
  effectiveDate: Date;
  createdAt: Date;
}

interface PolicyRule {
  condition: string;
  action: string;
  threshold?: number;
  requiresApproval: boolean;
  approverRole?: string;
}

interface AllocationRequest {
  id: string;
  fromEntityId: number;
  toEntityId: number;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

interface ConflictResolution {
  id: string;
  type: 'allocation' | 'access' | 'policy' | 'succession';
  parties: string[];
  description: string;
  status: 'open' | 'mediation' | 'resolved' | 'escalated';
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

// Default governance policies
const defaultPolicies: GovernancePolicy[] = [
  {
    id: 'policy-allocation-001',
    name: 'Standard Allocation Distribution',
    description: 'Governs the distribution of funds from Trust to operating entities',
    category: 'allocation',
    rules: [
      {
        condition: 'allocation_amount > 10000',
        action: 'require_trust_approval',
        threshold: 10000,
        requiresApproval: true,
        approverRole: 'trust_administrator'
      },
      {
        condition: 'allocation_to_external',
        action: 'require_board_approval',
        requiresApproval: true,
        approverRole: 'board_member'
      }
    ],
    status: 'active',
    effectiveDate: new Date('2024-01-01'),
    createdAt: new Date()
  },
  {
    id: 'policy-access-001',
    name: 'Trust Asset Access Control',
    description: 'Controls access to Trust-level assets and sensitive information',
    category: 'access',
    rules: [
      {
        condition: 'access_trust_assets',
        action: 'verify_trust_member',
        requiresApproval: false
      },
      {
        condition: 'modify_trust_assets',
        action: 'require_dual_approval',
        requiresApproval: true,
        approverRole: 'trust_administrator'
      }
    ],
    status: 'active',
    effectiveDate: new Date('2024-01-01'),
    createdAt: new Date()
  },
  {
    id: 'policy-sovereignty-001',
    name: 'Sovereignty Protection Protocol',
    description: 'Protects the autonomy and integrity of the Trust structure',
    category: 'sovereignty',
    rules: [
      {
        condition: 'external_entity_request',
        action: 'verify_and_log',
        requiresApproval: false
      },
      {
        condition: 'structure_modification',
        action: 'require_unanimous_approval',
        requiresApproval: true,
        approverRole: 'trust_beneficiary'
      },
      {
        condition: 'asset_transfer_external',
        action: 'require_trust_vote',
        threshold: 75,
        requiresApproval: true,
        approverRole: 'trust_administrator'
      }
    ],
    status: 'active',
    effectiveDate: new Date('2024-01-01'),
    createdAt: new Date()
  },
  {
    id: 'policy-succession-001',
    name: 'Generational Succession Protocol',
    description: 'Governs the transfer of authority and assets across generations',
    category: 'succession',
    rules: [
      {
        condition: 'successor_nomination',
        action: 'initiate_training_protocol',
        requiresApproval: true,
        approverRole: 'trust_administrator'
      },
      {
        condition: 'authority_transfer',
        action: 'require_ceremony_completion',
        requiresApproval: true,
        approverRole: 'trust_beneficiary'
      }
    ],
    status: 'active',
    effectiveDate: new Date('2024-01-01'),
    createdAt: new Date()
  },
  {
    id: 'policy-operation-001',
    name: 'Autonomous Operation Oversight',
    description: 'Governs autonomous business operations and decision-making',
    category: 'operation',
    rules: [
      {
        condition: 'autonomous_decision_value > 5000',
        action: 'flag_for_review',
        threshold: 5000,
        requiresApproval: false
      },
      {
        condition: 'autonomous_decision_value > 25000',
        action: 'require_human_approval',
        threshold: 25000,
        requiresApproval: true,
        approverRole: 'operations_manager'
      }
    ],
    status: 'active',
    effectiveDate: new Date('2024-01-01'),
    createdAt: new Date()
  }
];

// In-memory storage for governance data (would be database in production)
let policies: GovernancePolicy[] = [...defaultPolicies];
let allocationRequests: AllocationRequest[] = [];
let conflicts: ConflictResolution[] = [];

export const trustGovernanceRouter = router({
  // Get all governance policies
  getPolicies: protectedProcedure
    .input(z.object({
      category: z.enum(['allocation', 'access', 'operation', 'sovereignty', 'succession']).optional(),
      status: z.enum(['active', 'pending', 'suspended']).optional()
    }).optional())
    .query(async ({ input }) => {
      let filtered = policies;
      
      if (input?.category) {
        filtered = filtered.filter(p => p.category === input.category);
      }
      if (input?.status) {
        filtered = filtered.filter(p => p.status === input.status);
      }
      
      return filtered;
    }),

  // Get single policy by ID
  getPolicy: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const policy = policies.find(p => p.id === input.id);
      if (!policy) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Policy not found' });
      }
      return policy;
    }),

  // Create new governance policy
  createPolicy: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      category: z.enum(['allocation', 'access', 'operation', 'sovereignty', 'succession']),
      rules: z.array(z.object({
        condition: z.string(),
        action: z.string(),
        threshold: z.number().optional(),
        requiresApproval: z.boolean(),
        approverRole: z.string().optional()
      })),
      effectiveDate: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const newPolicy: GovernancePolicy = {
        id: `policy-${input.category}-${Date.now()}`,
        name: input.name,
        description: input.description,
        category: input.category,
        rules: input.rules,
        status: 'pending',
        effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : new Date(),
        createdAt: new Date()
      };
      
      policies.push(newPolicy);
      
      // Log to blockchain
      await db.insert(blockchainRecords).values({
        recordType: 'governance_policy',
        entityId: 1, // Trust entity
        dataHash: `policy_${newPolicy.id}_${Date.now()}`,
        previousHash: 'genesis',
        metadata: JSON.stringify({
          action: 'policy_created',
          policyId: newPolicy.id,
          policyName: newPolicy.name,
          category: newPolicy.category,
          createdBy: ctx.user?.id || 'system'
        })
      });
      
      return newPolicy;
    }),

  // Update policy status
  updatePolicyStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['active', 'pending', 'suspended'])
    }))
    .mutation(async ({ input, ctx }) => {
      const policyIndex = policies.findIndex(p => p.id === input.id);
      if (policyIndex === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Policy not found' });
      }
      
      policies[policyIndex].status = input.status;
      
      // Log to blockchain
      await db.insert(blockchainRecords).values({
        recordType: 'governance_policy',
        entityId: 1,
        dataHash: `policy_status_${input.id}_${Date.now()}`,
        previousHash: 'genesis',
        metadata: JSON.stringify({
          action: 'policy_status_updated',
          policyId: input.id,
          newStatus: input.status,
          updatedBy: ctx.user?.id || 'system'
        })
      });
      
      return policies[policyIndex];
    }),

  // Request allocation between entities
  requestAllocation: protectedProcedure
    .input(z.object({
      fromEntityId: z.number(),
      toEntityId: z.number(),
      amount: z.number().positive(),
      reason: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify entities exist
      const fromEntity = await db.select().from(businessEntities).where(eq(businessEntities.id, input.fromEntityId)).limit(1);
      const toEntity = await db.select().from(businessEntities).where(eq(businessEntities.id, input.toEntityId)).limit(1);
      
      if (!fromEntity.length || !toEntity.length) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Entity not found' });
      }
      
      // Check if requires approval based on policies
      const allocationPolicies = policies.filter(p => p.category === 'allocation' && p.status === 'active');
      let requiresApproval = false;
      
      for (const policy of allocationPolicies) {
        for (const rule of policy.rules) {
          if (rule.threshold && input.amount > rule.threshold && rule.requiresApproval) {
            requiresApproval = true;
            break;
          }
        }
      }
      
      const request: AllocationRequest = {
        id: `alloc-${Date.now()}`,
        fromEntityId: input.fromEntityId,
        toEntityId: input.toEntityId,
        amount: input.amount,
        reason: input.reason,
        status: requiresApproval ? 'pending' : 'approved',
        requestedBy: ctx.user?.name || 'system',
        requestedAt: new Date()
      };
      
      allocationRequests.push(request);
      
      // If auto-approved, execute the allocation
      if (!requiresApproval) {
        await executeAllocation(request);
      }
      
      // Log to blockchain
      await db.insert(blockchainRecords).values({
        recordType: 'allocation_request',
        entityId: input.fromEntityId,
        dataHash: `allocation_${request.id}_${Date.now()}`,
        previousHash: 'genesis',
        metadata: JSON.stringify({
          action: 'allocation_requested',
          requestId: request.id,
          fromEntity: fromEntity[0].name,
          toEntity: toEntity[0].name,
          amount: input.amount,
          status: request.status,
          requestedBy: ctx.user?.id || 'system'
        })
      });
      
      return request;
    }),

  // Get pending allocation requests
  getPendingAllocations: protectedProcedure
    .query(async () => {
      return allocationRequests.filter(r => r.status === 'pending');
    }),

  // Get all allocation requests
  getAllocations: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
      entityId: z.number().optional()
    }).optional())
    .query(async ({ input }) => {
      let filtered = allocationRequests;
      
      if (input?.status) {
        filtered = filtered.filter(r => r.status === input.status);
      }
      if (input?.entityId) {
        filtered = filtered.filter(r => 
          r.fromEntityId === input.entityId || r.toEntityId === input.entityId
        );
      }
      
      return filtered.sort((a, b) => 
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );
    }),

  // Approve or reject allocation request
  reviewAllocation: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      decision: z.enum(['approved', 'rejected']),
      notes: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const requestIndex = allocationRequests.findIndex(r => r.id === input.requestId);
      if (requestIndex === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Allocation request not found' });
      }
      
      const request = allocationRequests[requestIndex];
      request.status = input.decision;
      request.reviewedBy = ctx.user?.name || 'system';
      request.reviewedAt = new Date();
      request.reviewNotes = input.notes;
      
      // If approved, execute the allocation
      if (input.decision === 'approved') {
        await executeAllocation(request);
      }
      
      // Log to blockchain
      await db.insert(blockchainRecords).values({
        recordType: 'allocation_review',
        entityId: request.fromEntityId,
        dataHash: `allocation_review_${request.id}_${Date.now()}`,
        previousHash: 'genesis',
        metadata: JSON.stringify({
          action: 'allocation_reviewed',
          requestId: request.id,
          decision: input.decision,
          reviewedBy: ctx.user?.id || 'system',
          notes: input.notes
        })
      });
      
      return request;
    }),

  // File a conflict for resolution
  fileConflict: protectedProcedure
    .input(z.object({
      type: z.enum(['allocation', 'access', 'policy', 'succession']),
      parties: z.array(z.string()),
      description: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const conflict: ConflictResolution = {
        id: `conflict-${Date.now()}`,
        type: input.type,
        parties: input.parties,
        description: input.description,
        status: 'open',
        createdAt: new Date()
      };
      
      conflicts.push(conflict);
      
      // Log to blockchain
      await db.insert(blockchainRecords).values({
        recordType: 'conflict_filed',
        entityId: 1,
        dataHash: `conflict_${conflict.id}_${Date.now()}`,
        previousHash: 'genesis',
        metadata: JSON.stringify({
          action: 'conflict_filed',
          conflictId: conflict.id,
          type: input.type,
          parties: input.parties,
          filedBy: ctx.user?.id || 'system'
        })
      });
      
      return conflict;
    }),

  // Get conflicts
  getConflicts: protectedProcedure
    .input(z.object({
      status: z.enum(['open', 'mediation', 'resolved', 'escalated']).optional()
    }).optional())
    .query(async ({ input }) => {
      if (input?.status) {
        return conflicts.filter(c => c.status === input.status);
      }
      return conflicts;
    }),

  // Update conflict status
  updateConflict: protectedProcedure
    .input(z.object({
      conflictId: z.string(),
      status: z.enum(['open', 'mediation', 'resolved', 'escalated']),
      resolution: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const conflictIndex = conflicts.findIndex(c => c.id === input.conflictId);
      if (conflictIndex === -1) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Conflict not found' });
      }
      
      conflicts[conflictIndex].status = input.status;
      if (input.resolution) {
        conflicts[conflictIndex].resolution = input.resolution;
      }
      if (input.status === 'resolved') {
        conflicts[conflictIndex].resolvedAt = new Date();
      }
      
      // Log to blockchain
      await db.insert(blockchainRecords).values({
        recordType: 'conflict_update',
        entityId: 1,
        dataHash: `conflict_update_${input.conflictId}_${Date.now()}`,
        previousHash: 'genesis',
        metadata: JSON.stringify({
          action: 'conflict_updated',
          conflictId: input.conflictId,
          newStatus: input.status,
          resolution: input.resolution,
          updatedBy: ctx.user?.id || 'system'
        })
      });
      
      return conflicts[conflictIndex];
    }),

  // Get entity hierarchy with allocations
  getEntityHierarchy: publicProcedure
    .query(async () => {
      const entities = await db.select().from(businessEntities).orderBy(businessEntities.id);
      
      // Build hierarchy tree
      const buildTree = (parentId: number | null): any[] => {
        return entities
          .filter(e => e.parentEntityId === parentId)
          .map(e => ({
            ...e,
            children: buildTree(e.id)
          }));
      };
      
      // Get root entities (Trust level)
      const rootEntities = entities.filter(e => e.parentEntityId === null);
      
      return rootEntities.map(root => ({
        ...root,
        children: buildTree(root.id)
      }));
    }),

  // Validate sovereignty (check for unauthorized access attempts)
  validateSovereignty: protectedProcedure
    .input(z.object({
      action: z.string(),
      targetEntityId: z.number(),
      requestorId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Check sovereignty protection policies
      const sovereigntyPolicies = policies.filter(
        p => p.category === 'sovereignty' && p.status === 'active'
      );
      
      let isAuthorized = true;
      let requiresApproval = false;
      let reason = '';
      
      for (const policy of sovereigntyPolicies) {
        for (const rule of policy.rules) {
          if (rule.condition === 'external_entity_request' && input.action.includes('external')) {
            // Log and verify
            reason = 'External entity request detected - logged for review';
          }
          if (rule.condition === 'structure_modification' && input.action.includes('modify')) {
            requiresApproval = true;
            reason = 'Structure modification requires unanimous approval';
          }
          if (rule.condition === 'asset_transfer_external' && input.action.includes('transfer')) {
            requiresApproval = true;
            reason = 'External asset transfer requires Trust vote (75% threshold)';
          }
        }
      }
      
      // Log sovereignty check
      await db.insert(blockchainRecords).values({
        recordType: 'sovereignty_check',
        entityId: input.targetEntityId,
        dataHash: `sovereignty_${Date.now()}`,
        previousHash: 'genesis',
        metadata: JSON.stringify({
          action: input.action,
          requestor: input.requestorId,
          isAuthorized,
          requiresApproval,
          reason,
          checkedBy: ctx.user?.id || 'system'
        })
      });
      
      return {
        isAuthorized,
        requiresApproval,
        reason
      };
    }),

  // Get governance audit trail
  getAuditTrail: protectedProcedure
    .input(z.object({
      entityId: z.number().optional(),
      recordType: z.string().optional(),
      limit: z.number().default(50)
    }).optional())
    .query(async ({ input }) => {
      let query = db.select().from(blockchainRecords);
      
      if (input?.entityId) {
        query = query.where(eq(blockchainRecords.entityId, input.entityId)) as any;
      }
      if (input?.recordType) {
        query = query.where(eq(blockchainRecords.recordType, input.recordType)) as any;
      }
      
      const records = await query
        .orderBy(desc(blockchainRecords.createdAt))
        .limit(input?.limit || 50);
      
      return records.map(r => ({
        ...r,
        metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata
      }));
    }),

  // Get governance dashboard summary
  getDashboardSummary: protectedProcedure
    .query(async () => {
      const activePolicies = policies.filter(p => p.status === 'active').length;
      const pendingAllocations = allocationRequests.filter(r => r.status === 'pending').length;
      const openConflicts = conflicts.filter(c => c.status === 'open' || c.status === 'mediation').length;
      
      const entities = await db.select().from(businessEntities);
      const trustAssets = entities.filter(e => e.entityType === 'asset').length;
      
      const recentActivity = await db.select()
        .from(blockchainRecords)
        .orderBy(desc(blockchainRecords.createdAt))
        .limit(10);
      
      return {
        activePolicies,
        pendingAllocations,
        openConflicts,
        totalEntities: entities.length,
        trustAssets,
        recentActivity: recentActivity.map(r => ({
          ...r,
          metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata
        }))
      };
    })
});

// Helper function to execute allocation
async function executeAllocation(request: AllocationRequest) {
  try {
    // Get LuvLedger accounts for both entities
    const fromAccount = await db.select()
      .from(luvLedgerAccounts)
      .where(eq(luvLedgerAccounts.entityId, request.fromEntityId))
      .limit(1);
    
    const toAccount = await db.select()
      .from(luvLedgerAccounts)
      .where(eq(luvLedgerAccounts.entityId, request.toEntityId))
      .limit(1);
    
    if (fromAccount.length && toAccount.length) {
      // Create transaction record
      await db.insert(luvLedgerTransactions).values({
        fromAccountId: fromAccount[0].id,
        toAccountId: toAccount[0].id,
        amount: request.amount.toString(),
        transactionType: 'allocation',
        description: request.reason,
        status: 'completed'
      });
      
      // Update balances
      await db.update(luvLedgerAccounts)
        .set({ 
          balance: sql`${luvLedgerAccounts.balance} - ${request.amount}` 
        })
        .where(eq(luvLedgerAccounts.id, fromAccount[0].id));
      
      await db.update(luvLedgerAccounts)
        .set({ 
          balance: sql`${luvLedgerAccounts.balance} + ${request.amount}` 
        })
        .where(eq(luvLedgerAccounts.id, toAccount[0].id));
    }
  } catch (error) {
    console.error('Error executing allocation:', error);
  }
}

export default trustGovernanceRouter;
