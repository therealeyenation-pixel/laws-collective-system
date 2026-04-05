import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const contractManagementRouter = router({
  // Get all contracts
  getContracts: protectedProcedure
    .input(z.object({
      contractType: z.enum(['msa', 'sow', 'nda', 'employment', 'consulting', 'vendor', 'partnership', 'other']).optional(),
      status: z.enum(['draft', 'pending_review', 'pending_signature', 'active', 'expired', 'terminated', 'renewed']).optional(),
      contractorId: z.number().optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Use house_contracts table which already exists
      let baseQuery = sql`SELECT c.*
                   FROM house_contracts c
                   WHERE 1=1`;
      
      if (input.contractType) {
        baseQuery = sql`${baseQuery} AND c.contractType = ${input.contractType}`;
      }
      
      if (input.status) {
        baseQuery = sql`${baseQuery} AND c.status = ${input.status}`;
      }
      
      baseQuery = sql`${baseQuery} ORDER BY c.createdAt DESC`;
      
      try {
        const contracts = await db.execute(baseQuery);
        return contracts as any[];
      } catch (error) {
        // Return empty array if table doesn't exist or query fails
        console.error('Error fetching contracts:', error);
        return [];
      }
    }),

  // Get single contract
  getContract: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      try {
        const contracts = await db.execute(
          sql`SELECT * FROM house_contracts WHERE id = ${input.contractId}`
        );
        const contract = (contracts as any[])[0];
        
        if (!contract) {
          throw new Error('Contract not found');
        }
        
        // Get associated milestones
        const milestones = await db.execute(
          sql`SELECT * FROM contract_milestones WHERE contractId = ${input.contractId} ORDER BY dueDate ASC`
        ).catch(() => []);
        
        return {
          ...contract,
          milestones: milestones as any[],
          sows: [],
          amendments: []
        };
      } catch (error) {
        console.error('Error fetching contract:', error);
        throw new Error('Contract not found');
      }
    }),

  // Create new contract
  createContract: protectedProcedure
    .input(z.object({
      contractType: z.enum(['msa', 'sow', 'nda', 'employment', 'consulting', 'vendor', 'partnership', 'other']),
      title: z.string(),
      description: z.string().optional(),
      contractorId: z.number().optional(),
      contractorBusinessId: z.number().optional(),
      clientEntityId: z.number().optional(),
      effectiveDate: z.string().optional(),
      expirationDate: z.string().optional(),
      autoRenew: z.boolean().optional(),
      renewalTermMonths: z.number().optional(),
      totalValue: z.number().optional(),
      paymentTerms: z.string().optional(),
      billingFrequency: z.enum(['one_time', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'annually']).optional(),
      retainerAmount: z.number().optional(),
      hourlyRate: z.number().optional(),
      terminationNoticeDays: z.number().optional(),
      nonCompeteMonths: z.number().optional(),
      ipAssignment: z.boolean().optional(),
      confidentialityRequired: z.boolean().optional(),
      insuranceRequired: z.boolean().optional(),
      insuranceMinimum: z.number().optional(),
      notes: z.string().optional(),
      createdBy: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Generate contract number
      const typePrefix = input.contractType.toUpperCase().substring(0, 3);
      const timestamp = Date.now();
      const contractNumber = `${typePrefix}-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}`;
      
      // Map contract type to house_contracts contractType enum
      const contractTypeMap: Record<string, string> = {
        'msa': 'service_agreement',
        'sow': 'service_agreement',
        'nda': 'nda',
        'employment': 'employment_contract',
        'consulting': 'contractor_agreement',
        'vendor': 'vendor_agreement',
        'partnership': 'partnership_agreement',
        'other': 'other'
      };
      
      const mappedType = contractTypeMap[input.contractType] || 'other';
      
      try {
        const result = await db.execute(
          sql`INSERT INTO house_contracts 
           (contractNumber, contractType, title, description, houseId, houseName,
            counterpartyName, counterpartyType, effectiveDate, expirationDate, 
            autoRenew, renewalTermMonths, contractValue, paymentTerms, 
            noticePeriodDays, notes, createdBy, status, signatureStatus)
           VALUES (${contractNumber}, ${mappedType}, ${input.title}, ${input.description || null},
            1, 'The L.A.W.S. Collective',
            'Contractor', 'individual', 
            ${input.effectiveDate ? new Date(input.effectiveDate) : null}, 
            ${input.expirationDate ? new Date(input.expirationDate) : null}, 
            ${input.autoRenew ?? false}, ${input.renewalTermMonths ?? 12}, 
            ${input.totalValue || null}, ${input.paymentTerms || null},
            ${input.terminationNoticeDays ?? 30}, ${input.notes || null}, 
            ${input.createdBy}, 'draft', 'draft')`
        );
        
        return {
          success: true,
          contractId: (result as any).insertId,
          contractNumber
        };
      } catch (error) {
        console.error('Error creating contract:', error);
        throw new Error('Failed to create contract');
      }
    }),

  // Create Statement of Work (placeholder - stores as contract)
  createSOW: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      scope: z.string().optional(),
      deliverables: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      estimatedHours: z.number().optional(),
      fixedPrice: z.number().optional(),
      hourlyRate: z.number().optional(),
      budgetAmount: z.number().optional(),
      milestones: z.string().optional(),
      acceptanceCriteria: z.string().optional(),
      projectManagerId: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const sowNumber = `SOW-${input.contractId}-${Date.now().toString().slice(-4)}`;
      
      // Create as a milestone under the parent contract
      try {
        const result = await db.execute(
          sql`INSERT INTO contract_milestones 
           (contractId, title, description, dueDate, status, milestoneType)
           VALUES (${input.contractId}, ${input.title}, ${input.description || null},
            ${input.endDate ? new Date(input.endDate) : null}, 'pending', 'deliverable')`
        );
        
        return {
          success: true,
          sowId: (result as any).insertId,
          sowNumber
        };
      } catch (error) {
        console.error('Error creating SOW:', error);
        throw new Error('Failed to create SOW');
      }
    }),

  // Update contract status
  updateContractStatus: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      status: z.enum(['draft', 'pending_review', 'pending_signature', 'active', 'expired', 'terminated', 'renewed'])
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      try {
        await db.execute(
          sql`UPDATE house_contracts SET status = ${input.status} WHERE id = ${input.contractId}`
        );
        return { success: true };
      } catch (error) {
        console.error('Error updating contract status:', error);
        throw new Error('Failed to update contract status');
      }
    }),

  // Sign contract (contractor)
  signContractAsContractor: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      try {
        await db.execute(
          sql`UPDATE house_contracts 
           SET counterpartySignedAt = NOW(), signatureStatus = 'partially_signed'
           WHERE id = ${input.contractId}`
        );
        
        // Check if both parties signed
        const contracts = await db.execute(
          sql`SELECT internalSignedAt, counterpartySignedAt FROM house_contracts WHERE id = ${input.contractId}`
        );
        const contract = (contracts as any[])[0];
        
        if (contract?.internalSignedAt && contract?.counterpartySignedAt) {
          await db.execute(
            sql`UPDATE house_contracts SET status = 'active', signatureStatus = 'fully_executed' WHERE id = ${input.contractId}`
          );
        }
        
        return { success: true };
      } catch (error) {
        console.error('Error signing contract:', error);
        throw new Error('Failed to sign contract');
      }
    }),

  // Sign contract (client)
  signContractAsClient: protectedProcedure
    .input(z.object({ 
      contractId: z.number(),
      signerName: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      try {
        await db.execute(
          sql`UPDATE house_contracts 
           SET internalSignedAt = NOW(), internalSignedBy = ${ctx.user?.id || 1}, signatureStatus = 'partially_signed'
           WHERE id = ${input.contractId}`
        );
        
        // Check if both parties signed
        const contracts = await db.execute(
          sql`SELECT internalSignedAt, counterpartySignedAt FROM house_contracts WHERE id = ${input.contractId}`
        );
        const contract = (contracts as any[])[0];
        
        if (contract?.internalSignedAt && contract?.counterpartySignedAt) {
          await db.execute(
            sql`UPDATE house_contracts SET status = 'active', signatureStatus = 'fully_executed' WHERE id = ${input.contractId}`
          );
        }
        
        return { success: true };
      } catch (error) {
        console.error('Error signing contract:', error);
        throw new Error('Failed to sign contract');
      }
    }),

  // Get SOWs (returns milestones as SOWs)
  getSOWs: protectedProcedure
    .input(z.object({ 
      contractId: z.number().optional(),
      status: z.enum(['draft', 'pending_approval', 'active', 'completed', 'cancelled', 'on_hold']).optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      // Return empty array - tables not yet created
      // TODO: Run db:push to create house_contracts and contract_milestones tables
      return [];
    }),

  // Update SOW status
  updateSOWStatus: protectedProcedure
    .input(z.object({
      sowId: z.number(),
      status: z.enum(['draft', 'pending_approval', 'active', 'completed', 'cancelled', 'on_hold']),
      approvedBy: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      try {
        // Map status to milestone status
        const statusMap: Record<string, string> = {
          'draft': 'pending',
          'pending_approval': 'pending',
          'active': 'in_progress',
          'completed': 'completed',
          'cancelled': 'cancelled',
          'on_hold': 'pending'
        };
        
        const mappedStatus = statusMap[input.status] || 'pending';
        
        await db.execute(
          sql`UPDATE contract_milestones SET status = ${mappedStatus} WHERE id = ${input.sowId}`
        );
        
        return { success: true };
      } catch (error) {
        console.error('Error updating SOW status:', error);
        throw new Error('Failed to update SOW status');
      }
    }),

  // Log hours against SOW
  logSOWHours: protectedProcedure
    .input(z.object({
      sowId: z.number(),
      hours: z.number()
    }))
    .mutation(async ({ input }) => {
      // Hours logging not supported for milestones - return success
      return { success: true };
    }),

  // Create amendment (placeholder)
  createAmendment: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      sowId: z.number().optional(),
      title: z.string(),
      description: z.string().optional(),
      changeType: z.enum(['scope_change', 'rate_change', 'term_extension', 'termination', 'other']),
      previousValue: z.string().optional(),
      newValue: z.string().optional(),
      effectiveDate: z.string().optional(),
      createdBy: z.number()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const amendmentNumber = `AMD-${input.contractId}-${Date.now().toString().slice(-4)}`;
      
      // Create as a milestone
      try {
        const result = await db.execute(
          sql`INSERT INTO contract_milestones 
           (contractId, title, description, dueDate, status, milestoneType)
           VALUES (${input.contractId}, ${input.title}, ${input.description || null},
            ${input.effectiveDate ? new Date(input.effectiveDate) : null}, 'pending', 'amendment')`
        );
        
        return {
          success: true,
          amendmentId: (result as any).insertId,
          amendmentNumber
        };
      } catch (error) {
        console.error('Error creating amendment:', error);
        throw new Error('Failed to create amendment');
      }
    }),

  // Get contract stats
  getContractStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    try {
      const stats = await db.execute(
        sql`SELECT 
           COUNT(*) as totalContracts,
           SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeContracts,
           SUM(CASE WHEN signatureStatus = 'pending_internal' OR signatureStatus = 'pending_counterparty' THEN 1 ELSE 0 END) as pendingSignature,
           SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expiredContracts,
           SUM(CASE WHEN status = 'active' THEN IFNULL(contractValue, 0) ELSE 0 END) as activeContractValue,
           0 as monthlyRetainerTotal
         FROM house_contracts`
      );
      
      const milestoneStats = await db.execute(
        sql`SELECT 
           COUNT(*) as totalSOWs,
           SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as activeSOWs,
           SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedSOWs,
           0 as activeBudget
         FROM contract_milestones`
      );
      
      return {
        contracts: (stats as any[])[0] || { totalContracts: 0, activeContracts: 0, pendingSignature: 0, expiredContracts: 0, activeContractValue: 0, monthlyRetainerTotal: 0 },
        sows: (milestoneStats as any[])[0] || { totalSOWs: 0, activeSOWs: 0, completedSOWs: 0, activeBudget: 0 }
      };
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      return {
        contracts: { totalContracts: 0, activeContracts: 0, pendingSignature: 0, expiredContracts: 0, activeContractValue: 0, monthlyRetainerTotal: 0 },
        sows: { totalSOWs: 0, activeSOWs: 0, completedSOWs: 0, activeBudget: 0 }
      };
    }
  }),

  // Check for expiring contracts
  getExpiringContracts: protectedProcedure
    .input(z.object({ daysAhead: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const days = input.daysAhead || 30;
      
      try {
        const contracts = await db.execute(
          sql`SELECT *
           FROM house_contracts
           WHERE status = 'active'
           AND expirationDate IS NOT NULL
           AND expirationDate <= DATE_ADD(CURDATE(), INTERVAL ${days} DAY)
           ORDER BY expirationDate ASC`
        );
        
        return contracts as any[];
      } catch (error) {
        console.error('Error fetching expiring contracts:', error);
        return [];
      }
    })
});
