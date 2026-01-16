import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { businessEntities, houses } from "../../drizzle/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// INTER-COMPANY CONTRACTING ROUTER
// Handles contracts between family businesses within the system
// Applies 70/30 platform fee to all transactions
// ============================================

// In-memory storage for inter-company contracts
const interCompanyContracts: Map<string, any> = new Map();
const interCompanyPayments: Map<string, any[]> = new Map();
const interCompanyInvoices: Map<string, any[]> = new Map();

export const interCompanyRouter = router({
  /**
   * Create a contract between two family businesses
   * Both businesses must be linked to houses in the system
   */
  createContract: protectedProcedure
    .input(z.object({
      // Provider business (providing the service)
      providerBusinessId: z.number(),
      // Client business (receiving the service)
      clientBusinessId: z.number(),
      // Contract details
      contractTitle: z.string().min(1),
      contractType: z.enum([
        "service_agreement",
        "consulting",
        "licensing",
        "revenue_share",
        "joint_venture",
        "referral",
        "supply_agreement",
      ]),
      description: z.string(),
      // Compensation
      compensationModel: z.enum([
        "fixed_fee",
        "hourly",
        "monthly_retainer",
        "revenue_percentage",
        "per_unit",
        "milestone",
      ]),
      baseAmount: z.number().optional(),
      percentageRate: z.number().optional(),
      unitRate: z.number().optional(),
      // Duration
      startDate: z.string(),
      endDate: z.string().optional(),
      autoRenew: z.boolean().default(false),
      // Platform fee settings
      platformFeePercent: z.number().default(30), // 70/30 split
      // Special terms
      exclusivity: z.boolean().default(false),
      terminationNoticeDays: z.number().default(30),
      disputeResolution: z.enum(["mediation", "arbitration", "trust_authority"]).default("trust_authority"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify both businesses exist
      const [providerBiz] = await db.select().from(businessEntities).where(eq(businessEntities.id, input.providerBusinessId)).limit(1);
      const [clientBiz] = await db.select().from(businessEntities).where(eq(businessEntities.id, input.clientBusinessId)).limit(1);

      if (!providerBiz) throw new TRPCError({ code: "NOT_FOUND", message: "Provider business not found" });
      if (!clientBiz) throw new TRPCError({ code: "NOT_FOUND", message: "Client business not found" });

      // Prevent self-contracting
      if (input.providerBusinessId === input.clientBusinessId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot create contract with self" });
      }

      // Get user's house
      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      // Generate contract ID
      const contractId = `ICC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const contract = {
        id: contractId,
        houseId,
        provider: {
          id: providerBiz.id,
          name: providerBiz.name,
          houseId: houseId, // Use current house
        },
        client: {
          id: clientBiz.id,
          name: clientBiz.name,
          houseId: houseId, // Use current house
        },
        title: input.contractTitle,
        type: input.contractType,
        description: input.description,
        compensation: {
          model: input.compensationModel,
          baseAmount: input.baseAmount,
          percentageRate: input.percentageRate,
          unitRate: input.unitRate,
        },
        startDate: input.startDate,
        endDate: input.endDate,
        autoRenew: input.autoRenew,
        platformFeePercent: input.platformFeePercent,
        exclusivity: input.exclusivity,
        terminationNoticeDays: input.terminationNoticeDays,
        disputeResolution: input.disputeResolution,
        financials: {
          totalBilled: 0,
          totalPaid: 0,
          totalPlatformFees: 0,
          totalProviderNet: 0,
          outstandingBalance: 0,
        },
        status: "active",
        createdBy: ctx.user.id,
        createdAt: new Date().toISOString(),
        approvals: {
          providerApproved: false,
          clientApproved: false,
        },
      };

      interCompanyContracts.set(contractId, contract);
      interCompanyPayments.set(contractId, []);
      interCompanyInvoices.set(contractId, []);

      return {
        success: true,
        contractId,
        contract,
        message: "Contract created. Both parties must approve before it becomes active.",
      };
    }),

  /**
   * Approve a contract (required by both parties)
   */
  approveContract: protectedProcedure
    .input(z.object({
      contractId: z.string(),
      approverRole: z.enum(["provider", "client"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const contract = interCompanyContracts.get(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });

      if (input.approverRole === "provider") {
        contract.approvals.providerApproved = true;
        contract.approvals.providerApprovedBy = ctx.user.id;
        contract.approvals.providerApprovedAt = new Date().toISOString();
      } else {
        contract.approvals.clientApproved = true;
        contract.approvals.clientApprovedBy = ctx.user.id;
        contract.approvals.clientApprovedAt = new Date().toISOString();
      }

      // Check if fully approved
      if (contract.approvals.providerApproved && contract.approvals.clientApproved) {
        contract.status = "fully_approved";
        contract.fullyApprovedAt = new Date().toISOString();
      }

      return {
        success: true,
        approvals: contract.approvals,
        status: contract.status,
      };
    }),

  /**
   * Get all inter-company contracts for a business
   */
  getContractsByBusiness: protectedProcedure
    .input(z.object({
      businessId: z.number(),
      role: z.enum(["provider", "client", "both"]).default("both"),
    }))
    .query(async ({ input }) => {
      const contracts: any[] = [];

      interCompanyContracts.forEach((contract) => {
        if (input.role === "provider" && contract.provider.id === input.businessId) {
          contracts.push(contract);
        } else if (input.role === "client" && contract.client.id === input.businessId) {
          contracts.push(contract);
        } else if (input.role === "both" && (contract.provider.id === input.businessId || contract.client.id === input.businessId)) {
          contracts.push(contract);
        }
      });

      return contracts;
    }),

  /**
   * Get a single contract with all details
   */
  getContract: protectedProcedure
    .input(z.object({ contractId: z.string() }))
    .query(async ({ input }) => {
      const contract = interCompanyContracts.get(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });

      return {
        ...contract,
        payments: interCompanyPayments.get(input.contractId) || [],
        invoices: interCompanyInvoices.get(input.contractId) || [],
      };
    }),

  /**
   * Generate an invoice for inter-company services
   */
  generateInvoice: protectedProcedure
    .input(z.object({
      contractId: z.string(),
      invoiceDate: z.string(),
      dueDate: z.string(),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const contract = interCompanyContracts.get(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });

      const invoices = interCompanyInvoices.get(input.contractId) || [];
      const invoiceNumber = `ICI-${input.contractId.split("-")[1]}-${String(invoices.length + 1).padStart(4, "0")}`;

      const subtotal = input.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const platformFee = subtotal * (contract.platformFeePercent / 100);
      const providerNet = subtotal - platformFee;

      const invoice = {
        invoiceNumber,
        contractId: input.contractId,
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate,
        from: contract.provider,
        to: contract.client,
        lineItems: input.lineItems,
        subtotal,
        platformFee,
        platformFeePercent: contract.platformFeePercent,
        providerNet,
        total: subtotal,
        notes: input.notes,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      invoices.push(invoice);
      interCompanyInvoices.set(input.contractId, invoices);

      // Update contract financials
      contract.financials.totalBilled += subtotal;
      contract.financials.outstandingBalance += subtotal;

      return {
        success: true,
        invoiceNumber,
        invoice,
        breakdown: {
          subtotal,
          platformFee,
          providerNet,
          platformFeeDestination: "Trust Treasury",
        },
      };
    }),

  /**
   * Record a payment for an inter-company invoice
   */
  recordPayment: protectedProcedure
    .input(z.object({
      contractId: z.string(),
      invoiceNumber: z.string(),
      paymentDate: z.string(),
      amount: z.number(),
      paymentMethod: z.enum(["internal_transfer", "check", "wire", "ach", "crypto"]),
      reference: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const contract = interCompanyContracts.get(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });

      const invoices = interCompanyInvoices.get(input.contractId) || [];
      const invoice = invoices.find((i) => i.invoiceNumber === input.invoiceNumber);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });

      // Calculate platform fee on this payment
      const platformFee = input.amount * (contract.platformFeePercent / 100);
      const providerNet = input.amount - platformFee;

      const payments = interCompanyPayments.get(input.contractId) || [];
      const payment = {
        id: payments.length + 1,
        invoiceNumber: input.invoiceNumber,
        paymentDate: input.paymentDate,
        amount: input.amount,
        platformFee,
        providerNet,
        paymentMethod: input.paymentMethod,
        reference: input.reference,
        recordedBy: ctx.user.id,
        recordedAt: new Date().toISOString(),
        // Track where the platform fee goes
        platformFeeAllocation: {
          trustTreasury: platformFee,
          timestamp: new Date().toISOString(),
        },
      };

      payments.push(payment);
      interCompanyPayments.set(input.contractId, payments);

      // Update invoice status
      const invoicePayments = payments.filter((p) => p.invoiceNumber === input.invoiceNumber);
      const totalPaidOnInvoice = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaidOnInvoice >= invoice.total) {
        invoice.status = "paid";
        invoice.paidAt = new Date().toISOString();
      } else {
        invoice.status = "partial";
      }

      // Update contract financials
      contract.financials.totalPaid += input.amount;
      contract.financials.totalPlatformFees += platformFee;
      contract.financials.totalProviderNet += providerNet;
      contract.financials.outstandingBalance = contract.financials.totalBilled - contract.financials.totalPaid;

      return {
        success: true,
        payment,
        invoiceStatus: invoice.status,
        contractFinancials: contract.financials,
      };
    }),

  /**
   * Get inter-company ledger (all transactions between family businesses)
   */
  getInterCompanyLedger: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      // Get all contracts for this house
      const houseContracts = Array.from(interCompanyContracts.values()).filter(
        (c) => c.houseId === houseId || c.provider.houseId === houseId || c.client.houseId === houseId
      );

      // Aggregate all payments
      const allPayments: any[] = [];
      houseContracts.forEach((contract) => {
        const payments = interCompanyPayments.get(contract.id) || [];
        payments.forEach((p) => {
          allPayments.push({
            ...p,
            contractId: contract.id,
            contractTitle: contract.title,
            provider: contract.provider.name,
            client: contract.client.name,
          });
        });
      });

      // Filter by date if provided
      let filteredPayments = allPayments;
      if (input.startDate) {
        const startDate = input.startDate;
        filteredPayments = filteredPayments.filter((p) => p.paymentDate >= startDate);
      }
      if (input.endDate) {
        const endDate = input.endDate;
        filteredPayments = filteredPayments.filter((p) => p.paymentDate <= endDate);
      }

      // Sort by date
      filteredPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

      // Calculate totals
      const totals = {
        totalTransactions: filteredPayments.length,
        totalVolume: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
        totalPlatformFees: filteredPayments.reduce((sum, p) => sum + p.platformFee, 0),
        totalProviderNet: filteredPayments.reduce((sum, p) => sum + p.providerNet, 0),
      };

      return {
        ledger: filteredPayments,
        totals,
        contracts: houseContracts.length,
      };
    }),

  /**
   * Reconcile inter-company accounts
   * Ensures all transactions are properly recorded and balanced
   */
  reconcileAccounts: protectedProcedure
    .input(z.object({ asOfDate: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      const houseContracts = Array.from(interCompanyContracts.values()).filter(
        (c) => c.houseId === houseId
      );

      const reconciliationResults: any[] = [];

      houseContracts.forEach((contract) => {
        const invoices = interCompanyInvoices.get(contract.id) || [];
        const payments = interCompanyPayments.get(contract.id) || [];

        const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const variance = totalInvoiced - totalPaid;

        reconciliationResults.push({
          contractId: contract.id,
          contractTitle: contract.title,
          provider: contract.provider.name,
          client: contract.client.name,
          totalInvoiced,
          totalPaid,
          variance,
          status: variance === 0 ? "balanced" : variance > 0 ? "underpaid" : "overpaid",
          invoiceCount: invoices.length,
          paymentCount: payments.length,
        });
      });

      const summary = {
        totalContracts: reconciliationResults.length,
        balanced: reconciliationResults.filter((r) => r.status === "balanced").length,
        underpaid: reconciliationResults.filter((r) => r.status === "underpaid").length,
        overpaid: reconciliationResults.filter((r) => r.status === "overpaid").length,
        totalVariance: reconciliationResults.reduce((sum, r) => sum + Math.abs(r.variance), 0),
        reconciliationDate: input.asOfDate,
        performedBy: ctx.user.id,
        performedAt: new Date().toISOString(),
      };

      return {
        success: true,
        summary,
        details: reconciliationResults,
      };
    }),

  /**
   * Terminate an inter-company contract
   */
  terminateContract: protectedProcedure
    .input(z.object({
      contractId: z.string(),
      terminationDate: z.string(),
      reason: z.string(),
      settleOutstanding: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const contract = interCompanyContracts.get(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });

      contract.status = "terminated";
      contract.terminationDate = input.terminationDate;
      contract.terminationReason = input.reason;
      contract.terminatedBy = ctx.user.id;
      contract.terminatedAt = new Date().toISOString();

      const outstandingBalance = contract.financials.outstandingBalance;

      return {
        success: true,
        message: `Contract terminated effective ${input.terminationDate}`,
        outstandingBalance,
        settleOutstanding: input.settleOutstanding,
        nextSteps: outstandingBalance > 0 && input.settleOutstanding
          ? "Outstanding balance should be settled before final closure"
          : "Contract closed",
      };
    }),

  /**
   * Get inter-company dashboard
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
    const houseId = userHouse?.id || 1;

    const allContracts = Array.from(interCompanyContracts.values()).filter(
      (c) => c.houseId === houseId
    );

    const activeContracts = allContracts.filter((c) => c.status === "active" || c.status === "fully_approved");
    const pendingApproval = allContracts.filter((c) => !c.approvals.providerApproved || !c.approvals.clientApproved);

    // Calculate totals
    let totalVolume = 0;
    let totalPlatformFees = 0;
    let totalOutstanding = 0;

    activeContracts.forEach((c) => {
      totalVolume += c.financials.totalPaid;
      totalPlatformFees += c.financials.totalPlatformFees;
      totalOutstanding += c.financials.outstandingBalance;
    });

    // Get pending invoices
    const pendingInvoices: any[] = [];
    allContracts.forEach((contract) => {
      const invoices = interCompanyInvoices.get(contract.id) || [];
      invoices.filter((i) => i.status === "pending").forEach((i) => {
        pendingInvoices.push({
          ...i,
          contractTitle: contract.title,
        });
      });
    });

    return {
      summary: {
        activeContracts: activeContracts.length,
        pendingApproval: pendingApproval.length,
        totalVolume,
        totalPlatformFees,
        totalOutstanding,
        pendingInvoices: pendingInvoices.length,
      },
      recentContracts: activeContracts.slice(0, 5),
      pendingInvoices: pendingInvoices.slice(0, 10),
      platformFeeDestination: "Trust Treasury (70/30 Split)",
    };
  }),
});

export default interCompanyRouter;
