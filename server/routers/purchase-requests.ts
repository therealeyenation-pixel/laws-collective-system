import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { TRPCError } from "@trpc/server";

// Helper to generate request number
function generateRequestNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PR-${year}${month}-${random}`;
}

// Helper to determine approval tier based on amount
function getApprovalTier(amount: number): 'tier1' | 'tier2' | 'tier3' {
  if (amount < 1000) return 'tier1';
  if (amount <= 5000) return 'tier2';
  return 'tier3';
}

// Helper to get next status based on tier and current approvals
function getNextStatus(
  tier: 'tier1' | 'tier2' | 'tier3',
  managerApproved: boolean,
  procurementApproved: boolean,
  financeApproved: boolean,
  ceoApproved: boolean
): string {
  if (!managerApproved) return 'pending_manager';
  if (!procurementApproved) return 'pending_procurement';
  if (!financeApproved) return 'pending_finance';
  
  if (tier === 'tier1') {
    // Auto-approve for tier 1
    return 'approved';
  }
  
  if (tier === 'tier2' || tier === 'tier3') {
    if (!ceoApproved) return 'pending_ceo';
  }
  
  if (tier === 'tier3') {
    return 'pending_board_notification';
  }
  
  return 'approved';
}

export const purchaseRequestsRouter = router({
  // List all purchase requests (with filters)
  list: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      departmentId: z.number().optional(),
      requesterId: z.number().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const filters = input || {};
      return db.getPurchaseRequests(filters);
    }),

  // Get single purchase request by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const request = await db.getPurchaseRequestById(input.id);
      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Purchase request not found' });
      }
      return request;
    }),

  // Create new purchase request
  create: protectedProcedure
    .input(z.object({
      departmentId: z.number(),
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.enum(['software', 'equipment', 'supplies', 'professional_development', 'travel', 'contractor', 'subscription', 'other']),
      vendor: z.string().optional(),
      amount: z.number().positive(),
      budgetCode: z.string().optional(),
      fiscalYear: z.string().optional(),
      attachments: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const requestNumber = generateRequestNumber();
      const approvalTier = getApprovalTier(input.amount);
      const ceoApproval = approvalTier === 'tier1' ? 'not_required' : 'pending';
      
      const result = await db.createPurchaseRequest({
        requestNumber,
        requesterId: ctx.user.id,
        departmentId: input.departmentId,
        title: input.title,
        description: input.description,
        category: input.category,
        vendor: input.vendor || null,
        amount: input.amount.toString(),
        budgetCode: input.budgetCode || null,
        fiscalYear: input.fiscalYear || new Date().getFullYear().toString(),
        approvalTier,
        status: 'pending_manager',
        ceoApproval,
        attachments: input.attachments ? JSON.stringify(input.attachments) : null,
        submittedAt: new Date(),
      });
      
      return { success: true, id: result.insertId, requestNumber };
    }),

  // Submit draft request
  submit: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const request = await db.getPurchaseRequestById(input.id);
      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Purchase request not found' });
      }
      if (request.requesterId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }
      if (request.status !== 'draft') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Request already submitted' });
      }
      
      await db.updatePurchaseRequest(input.id, {
        status: 'pending_manager',
        submittedAt: new Date(),
      });
      
      return { success: true };
    }),

  // Approve request (by role)
  approve: protectedProcedure
    .input(z.object({
      id: z.number(),
      role: z.enum(['manager', 'procurement', 'finance', 'ceo']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const request = await db.getPurchaseRequestById(input.id);
      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Purchase request not found' });
      }
      
      const now = new Date();
      const updates: Record<string, any> = {};
      
      switch (input.role) {
        case 'manager':
          updates.managerApproval = 'approved';
          updates.managerApprovedBy = ctx.user.id;
          updates.managerApprovedAt = now;
          updates.managerNotes = input.notes || null;
          updates.status = 'pending_procurement';
          break;
        case 'procurement':
          updates.procurementApproval = 'approved';
          updates.procurementApprovedBy = ctx.user.id;
          updates.procurementApprovedAt = now;
          updates.procurementNotes = input.notes || null;
          updates.status = 'pending_finance';
          break;
        case 'finance':
          updates.financeApproval = 'approved';
          updates.financeApprovedBy = ctx.user.id;
          updates.financeApprovedAt = now;
          updates.financeNotes = input.notes || null;
          // Check if CEO approval needed
          if (request.approvalTier === 'tier1') {
            updates.status = 'approved';
            updates.completedAt = now;
          } else {
            updates.status = 'pending_ceo';
          }
          break;
        case 'ceo':
          updates.ceoApproval = 'approved';
          updates.ceoApprovedBy = ctx.user.id;
          updates.ceoApprovedAt = now;
          updates.ceoNotes = input.notes || null;
          if (request.approvalTier === 'tier3') {
            updates.status = 'pending_board_notification';
          } else {
            updates.status = 'approved';
            updates.completedAt = now;
          }
          break;
      }
      
      await db.updatePurchaseRequest(input.id, updates);
      return { success: true, newStatus: updates.status };
    }),

  // Reject request
  reject: protectedProcedure
    .input(z.object({
      id: z.number(),
      role: z.enum(['manager', 'procurement', 'finance', 'ceo']),
      notes: z.string().min(1, 'Rejection reason is required'),
    }))
    .mutation(async ({ ctx, input }) => {
      const request = await db.getPurchaseRequestById(input.id);
      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Purchase request not found' });
      }
      
      const now = new Date();
      const updates: Record<string, any> = {
        status: 'rejected',
        completedAt: now,
      };
      
      switch (input.role) {
        case 'manager':
          updates.managerApproval = 'rejected';
          updates.managerApprovedBy = ctx.user.id;
          updates.managerApprovedAt = now;
          updates.managerNotes = input.notes;
          break;
        case 'procurement':
          updates.procurementApproval = 'rejected';
          updates.procurementApprovedBy = ctx.user.id;
          updates.procurementApprovedAt = now;
          updates.procurementNotes = input.notes;
          break;
        case 'finance':
          updates.financeApproval = 'rejected';
          updates.financeApprovedBy = ctx.user.id;
          updates.financeApprovedAt = now;
          updates.financeNotes = input.notes;
          break;
        case 'ceo':
          updates.ceoApproval = 'rejected';
          updates.ceoApprovedBy = ctx.user.id;
          updates.ceoApprovedAt = now;
          updates.ceoNotes = input.notes;
          break;
      }
      
      await db.updatePurchaseRequest(input.id, updates);
      return { success: true };
    }),

  // Mark board as notified (for tier 3)
  notifyBoard: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const request = await db.getPurchaseRequestById(input.id);
      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Purchase request not found' });
      }
      if (request.status !== 'pending_board_notification') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Request not pending board notification' });
      }
      
      const now = new Date();
      await db.updatePurchaseRequest(input.id, {
        boardNotified: true,
        boardNotifiedAt: now,
        status: 'approved',
        completedAt: now,
      });
      
      return { success: true };
    }),

  // Cancel request
  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const request = await db.getPurchaseRequestById(input.id);
      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Purchase request not found' });
      }
      if (request.requesterId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }
      if (['approved', 'rejected', 'cancelled'].includes(request.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot cancel completed request' });
      }
      
      await db.updatePurchaseRequest(input.id, {
        status: 'cancelled',
        completedAt: new Date(),
      });
      
      return { success: true };
    }),

  // Add comment to request
  addComment: protectedProcedure
    .input(z.object({
      purchaseRequestId: z.number(),
      comment: z.string().min(1),
      isInternal: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.addPurchaseRequestComment({
        purchaseRequestId: input.purchaseRequestId,
        userId: ctx.user.id,
        comment: input.comment,
        isInternal: input.isInternal,
      });
      return { success: true };
    }),

  // Get comments for a request
  getComments: protectedProcedure
    .input(z.object({ purchaseRequestId: z.number() }))
    .query(async ({ input }) => {
      return db.getPurchaseRequestComments(input.purchaseRequestId);
    }),

  // Get dashboard stats
  getStats: protectedProcedure.query(async () => {
    return db.getPurchaseRequestStats();
  }),

  // Get pending requests for approval (by role)
  getPendingForRole: protectedProcedure
    .input(z.object({
      role: z.enum(['manager', 'procurement', 'finance', 'ceo']),
    }))
    .query(async ({ input }) => {
      const statusMap = {
        manager: 'pending_manager',
        procurement: 'pending_procurement',
        finance: 'pending_finance',
        ceo: 'pending_ceo',
      };
      return db.getPurchaseRequests({ status: statusMap[input.role] });
    }),
});
