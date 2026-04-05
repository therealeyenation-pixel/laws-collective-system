/**
 * Acquisition Fund Router
 * 
 * API endpoints for Land & Buildings Acquisition Fund management
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  FUND_CATEGORIES,
  TRANSACTION_TYPES,
  getFundCategory,
  createFundTransaction,
  allocateDonation,
  allocateGrant,
  createTransferRequest,
  approveTransferRequest,
  completeTransferRequest,
  rejectTransferRequest,
  createDisbursementRequest,
  approveDisbursementRequest,
  completeDisbursement,
  rejectDisbursementRequest,
  calculateFundBalance,
  calculateAllFundBalances,
  validateTransfer,
  validateDisbursement,
  generateFundReport,
  generateDashboardWidgets,
  FundTransaction,
  DisbursementRequest,
  TransferRequest,
  DonationAllocation,
  GrantAllocation,
} from "../services/acquisition-fund";

// In-memory storage for demo (replace with database in production)
const transactions: FundTransaction[] = [];
const disbursementRequests: DisbursementRequest[] = [];
const transferRequests: TransferRequest[] = [];
const donationAllocations: DonationAllocation[] = [];
const grantAllocations: GrantAllocation[] = [];

// Zod schemas
const fundIdSchema = z.enum(FUND_CATEGORIES.map(f => f.id) as [string, ...string[]]);

export const acquisitionFundRouter = router({
  // Get all fund categories
  getFundCategories: publicProcedure.query(() => {
    return FUND_CATEGORIES;
  }),

  // Get single fund category
  getFundCategory: publicProcedure
    .input(z.object({ fundId: fundIdSchema }))
    .query(({ input }) => {
      return getFundCategory(input.fundId as any);
    }),

  // Get all fund balances
  getAllBalances: protectedProcedure.query(() => {
    return calculateAllFundBalances(transactions, disbursementRequests);
  }),

  // Get single fund balance
  getFundBalance: protectedProcedure
    .input(z.object({ fundId: fundIdSchema }))
    .query(({ input }) => {
      return calculateFundBalance(input.fundId as any, transactions, disbursementRequests);
    }),

  // Get dashboard widgets
  getDashboardWidgets: protectedProcedure.query(() => {
    return generateDashboardWidgets(transactions, disbursementRequests);
  }),

  // Record donation allocation
  recordDonation: protectedProcedure
    .input(z.object({
      donationId: z.string(),
      donorName: z.string(),
      donorEmail: z.string().email(),
      amount: z.number().positive(),
      designatedFund: fundIdSchema.optional(),
    }))
    .mutation(({ input, ctx }) => {
      const allocation = allocateDonation(
        input.donationId,
        input.donorName,
        input.donorEmail,
        input.amount,
        input.designatedFund as any
      );

      donationAllocations.push(allocation);

      // Create transactions for each allocation
      allocation.allocations.forEach(a => {
        const txn = createFundTransaction(
          a.fundId,
          "donation",
          a.amount,
          `Donation from ${input.donorName}${input.designatedFund ? " (designated)" : ""}`,
          ctx.user.id.toString(),
          {
            referenceId: input.donationId,
            referenceType: "donation",
          }
        );
        transactions.push(txn);
      });

      return {
        success: true,
        allocation,
        message: `Donation of $${input.amount.toLocaleString()} allocated successfully`,
      };
    }),

  // Record grant allocation
  recordGrant: protectedProcedure
    .input(z.object({
      grantId: z.string(),
      grantName: z.string(),
      grantorName: z.string(),
      totalAmount: z.number().positive(),
      allocations: z.array(z.object({
        fundId: fundIdSchema,
        amount: z.number().positive(),
        restrictedUse: z.string().optional(),
      })),
      restrictions: z.array(z.string()).optional(),
    }))
    .mutation(({ input, ctx }) => {
      const allocation = allocateGrant(
        input.grantId,
        input.grantName,
        input.grantorName,
        input.totalAmount,
        input.allocations as any,
        input.restrictions
      );

      grantAllocations.push(allocation);

      // Create transactions for each allocation
      allocation.allocations.forEach(a => {
        const txn = createFundTransaction(
          a.fundId,
          "grant_allocation",
          a.amount,
          `Grant: ${input.grantName} from ${input.grantorName}`,
          ctx.user.id.toString(),
          {
            referenceId: input.grantId,
            referenceType: "grant",
          }
        );
        transactions.push(txn);
      });

      return {
        success: true,
        allocation,
        message: `Grant of $${input.totalAmount.toLocaleString()} allocated successfully`,
      };
    }),

  // Create transfer request
  requestTransfer: protectedProcedure
    .input(z.object({
      fromFundId: fundIdSchema,
      toFundId: fundIdSchema,
      amount: z.number().positive(),
      reason: z.string().min(10),
    }))
    .mutation(({ input, ctx }) => {
      // Get current balance
      const balance = calculateFundBalance(input.fromFundId as any, transactions, disbursementRequests);
      
      // Validate transfer
      const validation = validateTransfer(
        input.fromFundId as any,
        input.toFundId as any,
        input.amount,
        balance.availableBalance
      );

      if (!validation.valid) {
        throw new Error(`Transfer validation failed: ${validation.errors.join(", ")}`);
      }

      const request = createTransferRequest(
        input.fromFundId as any,
        input.toFundId as any,
        input.amount,
        input.reason,
        ctx.user.id.toString()
      );

      transferRequests.push(request);

      return {
        success: true,
        request,
        message: "Transfer request submitted for approval",
      };
    }),

  // Approve transfer request
  approveTransfer: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(({ input, ctx }) => {
      const index = transferRequests.findIndex(r => r.id === input.requestId);
      if (index === -1) {
        throw new Error("Transfer request not found");
      }

      const request = transferRequests[index];
      if (request.status !== "pending") {
        throw new Error("Transfer request is not pending");
      }

      const approved = approveTransferRequest(request, ctx.user.id.toString());
      transferRequests[index] = approved;

      return {
        success: true,
        request: approved,
        message: "Transfer request approved",
      };
    }),

  // Complete transfer
  completeTransfer: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(({ input, ctx }) => {
      const index = transferRequests.findIndex(r => r.id === input.requestId);
      if (index === -1) {
        throw new Error("Transfer request not found");
      }

      const request = transferRequests[index];
      const completed = completeTransferRequest(request);
      transferRequests[index] = completed;

      // Create transfer transactions
      const outTxn = createFundTransaction(
        request.fromFundId,
        "transfer_out",
        -request.amount,
        `Transfer to ${getFundCategory(request.toFundId)?.name}`,
        ctx.user.id.toString(),
        { referenceId: request.id, referenceType: "transfer" }
      );

      const inTxn = createFundTransaction(
        request.toFundId,
        "transfer_in",
        request.amount,
        `Transfer from ${getFundCategory(request.fromFundId)?.name}`,
        ctx.user.id.toString(),
        { referenceId: request.id, referenceType: "transfer" }
      );

      transactions.push(outTxn, inTxn);

      return {
        success: true,
        request: completed,
        message: "Transfer completed successfully",
      };
    }),

  // Reject transfer request
  rejectTransfer: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      reason: z.string().min(10),
    }))
    .mutation(({ input }) => {
      const index = transferRequests.findIndex(r => r.id === input.requestId);
      if (index === -1) {
        throw new Error("Transfer request not found");
      }

      const rejected = rejectTransferRequest(transferRequests[index], input.reason);
      transferRequests[index] = rejected;

      return {
        success: true,
        request: rejected,
        message: "Transfer request rejected",
      };
    }),

  // List transfer requests
  listTransferRequests: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
    }))
    .query(({ input }) => {
      let filtered = [...transferRequests];
      if (input.status) {
        filtered = filtered.filter(r => r.status === input.status);
      }
      return filtered.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
    }),

  // Create disbursement request
  requestDisbursement: protectedProcedure
    .input(z.object({
      fundId: fundIdSchema,
      amount: z.number().positive(),
      purpose: z.string().min(10),
      vendor: z.string().optional(),
      invoiceNumber: z.string().optional(),
      propertyId: z.string().optional(),
    }))
    .mutation(({ input, ctx }) => {
      // Get current balance
      const balance = calculateFundBalance(input.fundId as any, transactions, disbursementRequests);
      
      // Validate disbursement
      const validation = validateDisbursement(
        input.fundId as any,
        input.amount,
        input.purpose,
        balance.availableBalance
      );

      if (!validation.valid) {
        throw new Error(`Disbursement validation failed: ${validation.errors.join(", ")}`);
      }

      const request = createDisbursementRequest(
        input.fundId as any,
        input.amount,
        input.purpose,
        ctx.user.id.toString(),
        {
          vendor: input.vendor,
          invoiceNumber: input.invoiceNumber,
          propertyId: input.propertyId,
        }
      );

      disbursementRequests.push(request);

      return {
        success: true,
        request,
        message: "Disbursement request submitted for approval",
      };
    }),

  // Approve disbursement
  approveDisbursement: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(({ input, ctx }) => {
      const index = disbursementRequests.findIndex(r => r.id === input.requestId);
      if (index === -1) {
        throw new Error("Disbursement request not found");
      }

      const request = disbursementRequests[index];
      if (request.status !== "pending") {
        throw new Error("Disbursement request is not pending");
      }

      const approved = approveDisbursementRequest(request, ctx.user.id.toString());
      disbursementRequests[index] = approved;

      return {
        success: true,
        request: approved,
        message: "Disbursement request approved",
      };
    }),

  // Complete disbursement
  completeDisbursement: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      checkNumber: z.string().optional(),
    }))
    .mutation(({ input, ctx }) => {
      const index = disbursementRequests.findIndex(r => r.id === input.requestId);
      if (index === -1) {
        throw new Error("Disbursement request not found");
      }

      const request = disbursementRequests[index];
      const completed = completeDisbursement(request, input.checkNumber);
      disbursementRequests[index] = completed;

      // Create disbursement transaction
      const txn = createFundTransaction(
        request.fundId,
        "disbursement",
        -request.amount,
        `Disbursement: ${request.purpose}`,
        ctx.user.id.toString(),
        { referenceId: request.id, referenceType: "disbursement" }
      );

      transactions.push(txn);

      return {
        success: true,
        request: completed,
        message: "Disbursement completed successfully",
      };
    }),

  // Reject disbursement
  rejectDisbursement: protectedProcedure
    .input(z.object({
      requestId: z.string(),
      reason: z.string().min(10),
    }))
    .mutation(({ input }) => {
      const index = disbursementRequests.findIndex(r => r.id === input.requestId);
      if (index === -1) {
        throw new Error("Disbursement request not found");
      }

      const rejected = rejectDisbursementRequest(disbursementRequests[index], input.reason);
      disbursementRequests[index] = rejected;

      return {
        success: true,
        request: rejected,
        message: "Disbursement request rejected",
      };
    }),

  // List disbursement requests
  listDisbursementRequests: protectedProcedure
    .input(z.object({
      fundId: fundIdSchema.optional(),
      status: z.enum(["pending", "approved", "rejected", "disbursed"]).optional(),
    }))
    .query(({ input }) => {
      let filtered = [...disbursementRequests];
      if (input.fundId) {
        filtered = filtered.filter(r => r.fundId === input.fundId);
      }
      if (input.status) {
        filtered = filtered.filter(r => r.status === input.status);
      }
      return filtered.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
    }),

  // Get fund transactions
  getTransactions: protectedProcedure
    .input(z.object({
      fundId: fundIdSchema.optional(),
      type: z.enum(TRANSACTION_TYPES as unknown as [string, ...string[]]).optional(),
      limit: z.number().default(50),
    }))
    .query(({ input }) => {
      let filtered = [...transactions];
      if (input.fundId) {
        filtered = filtered.filter(t => t.fundId === input.fundId);
      }
      if (input.type) {
        filtered = filtered.filter(t => t.type === input.type);
      }
      return filtered
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, input.limit);
    }),

  // Generate fund report
  generateReport: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(({ input }) => {
      return generateFundReport(
        transactions,
        disbursementRequests,
        donationAllocations,
        new Date(input.startDate),
        new Date(input.endDate)
      );
    }),

  // Get donation allocations
  getDonationAllocations: protectedProcedure
    .input(z.object({
      fundId: fundIdSchema.optional(),
      limit: z.number().default(50),
    }))
    .query(({ input }) => {
      let filtered = [...donationAllocations];
      if (input.fundId) {
        filtered = filtered.filter(d => 
          d.allocations.some(a => a.fundId === input.fundId)
        );
      }
      return filtered
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, input.limit);
    }),

  // Get grant allocations
  getGrantAllocations: protectedProcedure
    .input(z.object({
      fundId: fundIdSchema.optional(),
      limit: z.number().default(50),
    }))
    .query(({ input }) => {
      let filtered = [...grantAllocations];
      if (input.fundId) {
        filtered = filtered.filter(g => 
          g.allocations.some(a => a.fundId === input.fundId)
        );
      }
      return filtered
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, input.limit);
    }),
});
