import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { houseContracts, contractMilestones, contractTemplates, houses, luvLedgerTransactions } from "../../drizzle/schema";
import { eq, desc, and, gte, lte, sql, or, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const houseContractsRouter = router({
  // Get all contracts for a specific house
  getByHouse: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const contracts = await db
        .select()
        .from(houseContracts)
        .where(eq(houseContracts.houseId, input.houseId))
        .orderBy(desc(houseContracts.createdAt));
      return contracts;
    }),

  // Get all contracts for the current user's houses
  getMyContracts: protectedProcedure.query(async ({ ctx }) => {
    // First get user's houses
    const userHouses = await db
      .select({ id: houses.id, name: houses.name })
      .from(houses)
      .where(eq(houses.userId, ctx.user.id));

    if (userHouses.length === 0) {
      return [];
    }

    const houseIds = userHouses.map(h => h.id);
    
    const contracts = await db
      .select()
      .from(houseContracts)
      .where(sql`${houseContracts.houseId} IN (${sql.join(houseIds, sql`, `)})`)
      .orderBy(desc(houseContracts.createdAt));

    return contracts;
  }),

  // Get a single contract by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [contract] = await db
        .select()
        .from(houseContracts)
        .where(eq(houseContracts.id, input.id));
      
      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }

      // Get milestones for this contract
      const milestones = await db
        .select()
        .from(contractMilestones)
        .where(eq(contractMilestones.contractId, input.id))
        .orderBy(contractMilestones.dueDate);

      return { ...contract, milestones };
    }),

  // Create a new contract
  create: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      houseName: z.string(),
      contractNumber: z.string(),
      title: z.string(),
      description: z.string().optional(),
      contractType: z.enum([
        "vendor_agreement", "partnership_agreement", "service_agreement",
        "licensing_agreement", "lease_agreement", "employment_contract",
        "contractor_agreement", "nda", "operating_agreement", "trust_affiliation",
        "distribution_agreement", "franchise_agreement", "joint_venture",
        "loan_agreement", "insurance_policy", "other"
      ]),
      counterpartyName: z.string(),
      counterpartyType: z.enum(["individual", "business", "government", "nonprofit", "trust", "other"]).default("business"),
      counterpartyContact: z.string().optional(),
      counterpartyEmail: z.string().optional(),
      counterpartyPhone: z.string().optional(),
      contractValue: z.string().optional(),
      paymentTerms: z.string().optional(),
      paymentFrequency: z.enum(["one_time", "weekly", "biweekly", "monthly", "quarterly", "annually", "as_invoiced"]).optional(),
      effectiveDate: z.date(),
      expirationDate: z.date().optional(),
      autoRenew: z.boolean().default(false),
      renewalTermMonths: z.number().optional(),
      noticePeriodDays: z.number().default(30),
      documentUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [contract] = await db.insert(houseContracts).values({
        ...input,
        createdBy: ctx.user.id,
        status: "draft",
        signatureStatus: "draft",
        complianceStatus: "compliant",
      }).$returningId();

      // Create default milestones
      const milestones = [
        {
          contractId: contract.id,
          title: "Contract Effective Date",
          milestoneType: "effective_date" as const,
          dueDate: input.effectiveDate,
          status: "pending" as const,
        },
      ];

      if (input.expirationDate) {
        milestones.push({
          contractId: contract.id,
          title: "Contract Expiration",
          milestoneType: "expiration" as const,
          dueDate: input.expirationDate,
          status: "pending" as const,
        });

        // Add renewal notice milestone if auto-renew
        if (input.autoRenew && input.noticePeriodDays) {
          const noticeDate = new Date(input.expirationDate);
          noticeDate.setDate(noticeDate.getDate() - input.noticePeriodDays);
          milestones.push({
            contractId: contract.id,
            title: "Renewal Notice Deadline",
            milestoneType: "renewal_notice" as const,
            dueDate: noticeDate,
            status: "pending" as const,
          });
        }
      }

      if (milestones.length > 0) {
        await db.insert(contractMilestones).values(milestones);
      }

      return contract;
    }),

  // Update contract status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "pending_approval", "active", "suspended", "expired", "terminated", "renewed"]),
    }))
    .mutation(async ({ input }) => {
      await db
        .update(houseContracts)
        .set({ status: input.status })
        .where(eq(houseContracts.id, input.id));
      return { success: true };
    }),

  // Update signature status
  updateSignatureStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      signatureStatus: z.enum(["draft", "pending_internal", "pending_counterparty", "partially_signed", "fully_executed", "expired"]),
      internalSignedBy: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updates: Partial<typeof houseContracts.$inferInsert> = {
        signatureStatus: input.signatureStatus,
      };

      if (input.signatureStatus === "pending_counterparty" || input.signatureStatus === "fully_executed") {
        updates.internalSignedBy = input.internalSignedBy || ctx.user.id;
        updates.internalSignedAt = new Date();
      }

      if (input.signatureStatus === "fully_executed") {
        updates.counterpartySignedAt = new Date();
        updates.status = "active";
      }

      await db
        .update(houseContracts)
        .set(updates)
        .where(eq(houseContracts.id, input.id));

      return { success: true };
    }),

  // Record contract on LuvLedger
  recordOnLuvLedger: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [contract] = await db
        .select()
        .from(houseContracts)
        .where(eq(houseContracts.id, input.contractId));

      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }

      // Create LuvLedger transaction
      const [transaction] = await db.insert(luvLedgerTransactions).values({
        userId: ctx.user.id,
        transactionType: "contract_execution",
        category: "business",
        description: `Contract recorded: ${contract.title} with ${contract.counterpartyName}`,
        metadata: {
          contractId: contract.id,
          contractNumber: contract.contractNumber,
          contractType: contract.contractType,
          counterparty: contract.counterpartyName,
          value: contract.contractValue,
          effectiveDate: contract.effectiveDate,
          expirationDate: contract.expirationDate,
        },
        status: "completed",
      }).$returningId();

      // Update contract with LuvLedger reference
      await db
        .update(houseContracts)
        .set({
          luvLedgerRecorded: true,
          luvLedgerTransactionId: transaction.id,
          luvLedgerHash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
        })
        .where(eq(houseContracts.id, input.contractId));

      return { success: true, transactionId: transaction.id };
    }),

  // Get contracts expiring soon (for compliance alerts)
  getExpiringSoon: protectedProcedure
    .input(z.object({ daysAhead: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + input.daysAhead);

      // Get user's houses
      const userHouses = await db
        .select({ id: houses.id })
        .from(houses)
        .where(eq(houses.userId, ctx.user.id));

      if (userHouses.length === 0) {
        return [];
      }

      const houseIds = userHouses.map(h => h.id);

      const expiringContracts = await db
        .select()
        .from(houseContracts)
        .where(
          and(
            sql`${houseContracts.houseId} IN (${sql.join(houseIds, sql`, `)})`,
            eq(houseContracts.status, "active"),
            lte(houseContracts.expirationDate, futureDate),
            gte(houseContracts.expirationDate, new Date())
          )
        )
        .orderBy(houseContracts.expirationDate);

      return expiringContracts;
    }),

  // Get contract templates
  getTemplates: protectedProcedure.query(async () => {
    const templates = await db
      .select()
      .from(contractTemplates)
      .where(eq(contractTemplates.isActive, true))
      .orderBy(desc(contractTemplates.usageCount));
    return templates;
  }),

  // Get contract statistics for a house
  getStats: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const contracts = await db
        .select()
        .from(houseContracts)
        .where(eq(houseContracts.houseId, input.houseId));

      const stats = {
        total: contracts.length,
        active: contracts.filter(c => c.status === "active").length,
        pending: contracts.filter(c => c.status === "pending_approval" || c.signatureStatus === "pending_internal" || c.signatureStatus === "pending_counterparty").length,
        expiringSoon: contracts.filter(c => {
          if (!c.expirationDate) return false;
          const daysUntilExpiry = (new Date(c.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        }).length,
        totalValue: contracts.reduce((sum, c) => sum + (parseFloat(c.contractValue || "0")), 0),
        byType: {} as Record<string, number>,
      };

      contracts.forEach(c => {
        stats.byType[c.contractType] = (stats.byType[c.contractType] || 0) + 1;
      });

      return stats;
    }),

  // Add milestone to contract
  addMilestone: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      milestoneType: z.enum([
        "signing", "effective_date", "payment_due", "deliverable_due",
        "review_date", "renewal_notice", "expiration", "termination",
        "amendment", "custom"
      ]),
      dueDate: z.date(),
      reminderDays: z.number().default(7),
    }))
    .mutation(async ({ input }) => {
      const [milestone] = await db.insert(contractMilestones).values({
        ...input,
        status: "pending",
      }).$returningId();
      return milestone;
    }),

  // Complete milestone
  completeMilestone: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(contractMilestones)
        .set({
          status: "completed",
          completedDate: new Date(),
        })
        .where(eq(contractMilestones.id, input.id));
      return { success: true };
    }),

  // Sign contract with e-signature
  signContract: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      signatureType: z.enum(["drawn", "typed"]),
      signatureData: z.string(),
      signerName: z.string(),
      signerRole: z.enum(["internal", "counterparty"]).default("internal"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get the contract
      const [contract] = await db
        .select()
        .from(houseContracts)
        .where(eq(houseContracts.id, input.contractId));

      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }

      // Determine new signature status
      let newSignatureStatus = contract.signatureStatus;
      let newStatus = contract.status;

      if (input.signerRole === "internal") {
        if (contract.signatureStatus === "pending_internal" || contract.signatureStatus === "draft") {
          newSignatureStatus = "pending_counterparty";
        }
      } else {
        if (contract.signatureStatus === "pending_counterparty") {
          newSignatureStatus = "fully_executed";
          newStatus = "active";
        }
      }

      // Store signature metadata
      const signatureRecord = {
        signerName: input.signerName,
        signerRole: input.signerRole,
        signatureType: input.signatureType,
        signedAt: new Date().toISOString(),
        signedBy: ctx.user.id,
        ipAddress: "recorded",
      };

      // Update contract with signature
      await db
        .update(houseContracts)
        .set({
          signatureStatus: newSignatureStatus,
          status: newStatus,
          signedDate: input.signerRole === "counterparty" && newSignatureStatus === "fully_executed" ? new Date() : contract.signedDate,
          metadata: {
            ...(contract.metadata as object || {}),
            signatures: [
              ...((contract.metadata as any)?.signatures || []),
              signatureRecord,
            ],
          },
        })
        .where(eq(houseContracts.id, input.contractId));

      // Record signature event on LuvLedger
      await db.insert(luvLedgerTransactions).values({
        userId: ctx.user.id,
        transactionType: "contract_signature",
        category: "business",
        description: `Contract signed by ${input.signerName} (${input.signerRole}): ${contract.title}`,
        metadata: {
          contractId: contract.id,
          contractNumber: contract.contractNumber,
          signerName: input.signerName,
          signerRole: input.signerRole,
          signatureType: input.signatureType,
          signatureStatus: newSignatureStatus,
        },
        status: "completed",
      });

      // If fully executed, record on blockchain
      if (newSignatureStatus === "fully_executed") {
        const blockchainHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
        
        await db
          .update(houseContracts)
          .set({
            luvLedgerRecorded: true,
            luvLedgerHash: blockchainHash,
          })
          .where(eq(houseContracts.id, input.contractId));

        await db.insert(luvLedgerTransactions).values({
          userId: ctx.user.id,
          transactionType: "contract_execution",
          category: "blockchain",
          description: `Fully executed contract recorded on blockchain: ${contract.title}`,
          metadata: {
            contractId: contract.id,
            blockchainHash,
            executionDate: new Date().toISOString(),
          },
          status: "completed",
        });
      }

      return {
        success: true,
        signatureStatus: newSignatureStatus,
        contractStatus: newStatus,
      };
    }),

  // Get upcoming milestones across all user's contracts
  getUpcomingMilestones: protectedProcedure
    .input(z.object({ daysAhead: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + input.daysAhead);

      // Get user's houses
      const userHouses = await db
        .select({ id: houses.id })
        .from(houses)
        .where(eq(houses.userId, ctx.user.id));

      if (userHouses.length === 0) {
        return [];
      }

      const houseIds = userHouses.map(h => h.id);

      // Get contracts for user's houses
      const userContracts = await db
        .select({ id: houseContracts.id })
        .from(houseContracts)
        .where(sql`${houseContracts.houseId} IN (${sql.join(houseIds, sql`, `)})`);

      if (userContracts.length === 0) {
        return [];
      }

      const contractIds = userContracts.map(c => c.id);

      const milestones = await db
        .select({
          milestone: contractMilestones,
          contract: houseContracts,
        })
        .from(contractMilestones)
        .innerJoin(houseContracts, eq(contractMilestones.contractId, houseContracts.id))
        .where(
          and(
            sql`${contractMilestones.contractId} IN (${sql.join(contractIds, sql`, `)})`,
            eq(contractMilestones.status, "pending"),
            lte(contractMilestones.dueDate, futureDate),
            gte(contractMilestones.dueDate, new Date())
          )
        )
        .orderBy(contractMilestones.dueDate);

      return milestones;
    }),
});
