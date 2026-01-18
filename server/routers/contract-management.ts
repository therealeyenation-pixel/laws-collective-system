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
      
      // Build query dynamically based on filters
      let baseQuery = sql`SELECT c.*, cb.businessName, cb.ownerName
                   FROM contracts c
                   LEFT JOIN contractor_businesses cb ON c.contractorBusinessId = cb.id
                   WHERE 1=1`;
      
      if (input.contractType) {
        baseQuery = sql`${baseQuery} AND c.contractType = ${input.contractType}`;
      }
      
      if (input.status) {
        baseQuery = sql`${baseQuery} AND c.status = ${input.status}`;
      }
      
      if (input.contractorId) {
        baseQuery = sql`${baseQuery} AND c.contractorId = ${input.contractorId}`;
      }
      
      baseQuery = sql`${baseQuery} ORDER BY c.createdAt DESC`;
      
      const contracts = await db.execute(baseQuery);
      return contracts as any[];
    }),

  // Get single contract with SOWs
  getContract: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const contracts = await db.execute(
        sql`SELECT c.*, cb.businessName, cb.ownerName
         FROM contracts c
         LEFT JOIN contractor_businesses cb ON c.contractorBusinessId = cb.id
         WHERE c.id = ${input.contractId}`
      );
      const contract = (contracts as any[])[0];
      
      if (!contract) {
        throw new Error('Contract not found');
      }
      
      // Get associated SOWs
      const sows = await db.execute(
        sql`SELECT * FROM statements_of_work WHERE contractId = ${input.contractId} ORDER BY createdAt DESC`
      );
      
      // Get amendments
      const amendments = await db.execute(
        sql`SELECT * FROM contract_amendments WHERE contractId = ${input.contractId} ORDER BY createdAt DESC`
      );
      
      return {
        ...contract,
        sows: sows as any[],
        amendments: amendments as any[]
      };
    }),

  // Create new contract (MSA)
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
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Generate contract number
      const typePrefix = input.contractType.toUpperCase().substring(0, 3);
      const countResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM contracts WHERE contractType = ${input.contractType}`
      );
      const count = (countResult as any[])[0].count + 1;
      const contractNumber = `${typePrefix}-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
      
      const result = await db.execute(
        sql`INSERT INTO contracts 
         (contractNumber, contractType, title, description, contractorId, contractorBusinessId,
          clientEntityId, effectiveDate, expirationDate, autoRenew, renewalTermMonths,
          totalValue, paymentTerms, billingFrequency, retainerAmount, hourlyRate,
          terminationNoticeDays, nonCompeteMonths, ipAssignment, confidentialityRequired,
          insuranceRequired, insuranceMinimum, notes, createdBy, status)
         VALUES (${contractNumber}, ${input.contractType}, ${input.title}, ${input.description || null},
          ${input.contractorId || null}, ${input.contractorBusinessId || null}, ${input.clientEntityId || null},
          ${input.effectiveDate || null}, ${input.expirationDate || null}, ${input.autoRenew ?? false},
          ${input.renewalTermMonths ?? 12}, ${input.totalValue || null}, ${input.paymentTerms || null},
          ${input.billingFrequency || 'monthly'}, ${input.retainerAmount || null}, ${input.hourlyRate || null},
          ${input.terminationNoticeDays ?? 30}, ${input.nonCompeteMonths ?? 0}, ${input.ipAssignment ?? true},
          ${input.confidentialityRequired ?? true}, ${input.insuranceRequired ?? false},
          ${input.insuranceMinimum || null}, ${input.notes || null}, ${input.createdBy}, 'draft')`
      );
      
      return {
        success: true,
        contractId: (result as any).insertId,
        contractNumber
      };
    }),

  // Create Statement of Work
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
      
      // Generate SOW number
      const countResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM statements_of_work WHERE contractId = ${input.contractId}`
      );
      const count = (countResult as any[])[0].count + 1;
      const sowNumber = `SOW-${input.contractId}-${String(count).padStart(3, '0')}`;
      
      const result = await db.execute(
        sql`INSERT INTO statements_of_work 
         (sowNumber, contractId, title, description, scope, deliverables,
          startDate, endDate, estimatedHours, fixedPrice, hourlyRate, budgetAmount,
          milestones, acceptanceCriteria, projectManagerId, status)
         VALUES (${sowNumber}, ${input.contractId}, ${input.title}, ${input.description || null},
          ${input.scope || null}, ${input.deliverables || null}, ${input.startDate || null},
          ${input.endDate || null}, ${input.estimatedHours || null}, ${input.fixedPrice || null},
          ${input.hourlyRate || null}, ${input.budgetAmount || null}, ${input.milestones || null},
          ${input.acceptanceCriteria || null}, ${input.projectManagerId || null}, 'draft')`
      );
      
      return {
        success: true,
        sowId: (result as any).insertId,
        sowNumber
      };
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
      
      await db.execute(
        sql`UPDATE contracts SET status = ${input.status} WHERE id = ${input.contractId}`
      );
      
      return { success: true };
    }),

  // Sign contract (contractor)
  signContractAsContractor: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db.execute(
        sql`UPDATE contracts 
         SET signedByContractor = TRUE, signedByContractorAt = NOW()
         WHERE id = ${input.contractId}`
      );
      
      // Check if both parties signed
      const contracts = await db.execute(
        sql`SELECT signedByContractor, signedByClient FROM contracts WHERE id = ${input.contractId}`
      );
      const contract = (contracts as any[])[0];
      
      if (contract.signedByContractor && contract.signedByClient) {
        await db.execute(
          sql`UPDATE contracts SET status = 'active' WHERE id = ${input.contractId}`
        );
      }
      
      return { success: true };
    }),

  // Sign contract (client)
  signContractAsClient: protectedProcedure
    .input(z.object({ 
      contractId: z.number(),
      signerName: z.string()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db.execute(
        sql`UPDATE contracts 
         SET signedByClient = TRUE, signedByClientAt = NOW(), signedByClientName = ${input.signerName}
         WHERE id = ${input.contractId}`
      );
      
      // Check if both parties signed
      const contracts = await db.execute(
        sql`SELECT signedByContractor, signedByClient FROM contracts WHERE id = ${input.contractId}`
      );
      const contract = (contracts as any[])[0];
      
      if (contract.signedByContractor && contract.signedByClient) {
        await db.execute(
          sql`UPDATE contracts SET status = 'active' WHERE id = ${input.contractId}`
        );
      }
      
      return { success: true };
    }),

  // Get SOWs for a contract
  getSOWs: protectedProcedure
    .input(z.object({ 
      contractId: z.number().optional(),
      status: z.enum(['draft', 'pending_approval', 'active', 'completed', 'cancelled', 'on_hold']).optional()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      let baseQuery = sql`SELECT s.*, c.contractNumber, c.title as contractTitle
                   FROM statements_of_work s
                   JOIN contracts c ON s.contractId = c.id
                   WHERE 1=1`;
      
      if (input.contractId) {
        baseQuery = sql`${baseQuery} AND s.contractId = ${input.contractId}`;
      }
      
      if (input.status) {
        baseQuery = sql`${baseQuery} AND s.status = ${input.status}`;
      }
      
      baseQuery = sql`${baseQuery} ORDER BY s.createdAt DESC`;
      
      const sows = await db.execute(baseQuery);
      return sows as any[];
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
      
      if (input.status === 'active' && input.approvedBy) {
        await db.execute(
          sql`UPDATE statements_of_work 
           SET status = ${input.status}, approvedBy = ${input.approvedBy}, approvedAt = NOW()
           WHERE id = ${input.sowId}`
        );
      } else if (input.status === 'completed') {
        await db.execute(
          sql`UPDATE statements_of_work 
           SET status = ${input.status}, completedAt = NOW()
           WHERE id = ${input.sowId}`
        );
      } else {
        await db.execute(
          sql`UPDATE statements_of_work SET status = ${input.status} WHERE id = ${input.sowId}`
        );
      }
      
      return { success: true };
    }),

  // Log hours against SOW
  logSOWHours: protectedProcedure
    .input(z.object({
      sowId: z.number(),
      hours: z.number()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db.execute(
        sql`UPDATE statements_of_work 
         SET actualHours = actualHours + ${input.hours}
         WHERE id = ${input.sowId}`
      );
      
      return { success: true };
    }),

  // Create amendment
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
      
      // Generate amendment number
      const countResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM contract_amendments WHERE contractId = ${input.contractId}`
      );
      const count = (countResult as any[])[0].count + 1;
      const amendmentNumber = `AMD-${input.contractId}-${String(count).padStart(2, '0')}`;
      
      const result = await db.execute(
        sql`INSERT INTO contract_amendments 
         (amendmentNumber, contractId, sowId, title, description, changeType,
          previousValue, newValue, effectiveDate, createdBy, status)
         VALUES (${amendmentNumber}, ${input.contractId}, ${input.sowId || null}, ${input.title},
          ${input.description || null}, ${input.changeType}, ${input.previousValue || null},
          ${input.newValue || null}, ${input.effectiveDate || null}, ${input.createdBy}, 'draft')`
      );
      
      return {
        success: true,
        amendmentId: (result as any).insertId,
        amendmentNumber
      };
    }),

  // Get contract stats
  getContractStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const stats = await db.execute(
      sql`SELECT 
         COUNT(*) as totalContracts,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeContracts,
         SUM(CASE WHEN status = 'pending_signature' THEN 1 ELSE 0 END) as pendingSignature,
         SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expiredContracts,
         SUM(CASE WHEN status = 'active' THEN IFNULL(totalValue, 0) ELSE 0 END) as activeContractValue,
         SUM(CASE WHEN status = 'active' THEN IFNULL(retainerAmount, 0) ELSE 0 END) as monthlyRetainerTotal
       FROM contracts`
    );
    
    const sowStats = await db.execute(
      sql`SELECT 
         COUNT(*) as totalSOWs,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeSOWs,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedSOWs,
         SUM(CASE WHEN status = 'active' THEN IFNULL(budgetAmount, 0) ELSE 0 END) as activeBudget
       FROM statements_of_work`
    );
    
    return {
      contracts: (stats as any[])[0],
      sows: (sowStats as any[])[0]
    };
  }),

  // Check for expiring contracts
  getExpiringContracts: protectedProcedure
    .input(z.object({ daysAhead: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const days = input.daysAhead || 30;
      
      const contracts = await db.execute(
        sql`SELECT c.*, cb.businessName
         FROM contracts c
         LEFT JOIN contractor_businesses cb ON c.contractorBusinessId = cb.id
         WHERE c.status = 'active'
         AND c.expirationDate IS NOT NULL
         AND c.expirationDate <= DATE_ADD(CURDATE(), INTERVAL ${days} DAY)
         ORDER BY c.expirationDate ASC`
      );
      
      return contracts as any[];
    })
});
