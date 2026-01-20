import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  fundingSources,
  chargeCodes,
  timekeepingWorkers,
  workerChargeCodeAssignments,
  timeEntries,
  timesheets,
  timesheetApprovals,
  chargeCodeBudgets,
  timeOffRequests,
  contractorInvoices,
  invoiceLineItems,
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc, sql, inArray } from "drizzle-orm";

export const timekeepingRouter = router({
  // ==========================================
  // FUNDING SOURCES
  // ==========================================
  
  getFundingSources: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    return await db.select().from(fundingSources).orderBy(desc(fundingSources.createdAt));
  }),

  createFundingSource: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      code: z.string().min(1),
      type: z.enum(["grant", "contract", "internal", "donation", "revenue"]),
      description: z.string().optional(),
      funderName: z.string().optional(),
      totalBudget: z.string().optional(),
      laborBudget: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      entityId: z.number().optional(),
      reportingFrequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "annually"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db.insert(fundingSources).values({
        name: input.name,
        code: input.code,
        type: input.type,
        description: input.description,
        funderName: input.funderName,
        totalBudget: input.totalBudget,
        laborBudget: input.laborBudget,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        entityId: input.entityId,
        reportingFrequency: input.reportingFrequency,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // CHARGE CODES
  // ==========================================
  
  getChargeCodes: protectedProcedure
    .input(z.object({
      fundingSourceId: z.number().optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      let query = db.select().from(chargeCodes);
      
      if (input?.fundingSourceId) {
        query = query.where(eq(chargeCodes.fundingSourceId, input.fundingSourceId)) as typeof query;
      }
      if (input?.isActive !== undefined) {
        query = query.where(eq(chargeCodes.isActive, input.isActive)) as typeof query;
      }
      
      return await query.orderBy(chargeCodes.code);
    }),

  createChargeCode: protectedProcedure
    .input(z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      fundingSourceId: z.number().optional(),
      projectId: z.number().optional(),
      departmentId: z.number().optional(),
      entityId: z.number().optional(),
      budgetedHours: z.string().optional(),
      hourlyRate: z.string().optional(),
      isBillable: z.boolean().default(true),
      requiresApproval: z.boolean().default(true),
      allowOvertime: z.boolean().default(false),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db.insert(chargeCodes).values({
        code: input.code,
        name: input.name,
        description: input.description,
        fundingSourceId: input.fundingSourceId,
        projectId: input.projectId,
        departmentId: input.departmentId,
        entityId: input.entityId,
        budgetedHours: input.budgetedHours,
        hourlyRate: input.hourlyRate,
        isBillable: input.isBillable,
        requiresApproval: input.requiresApproval,
        allowOvertime: input.allowOvertime,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // WORKERS
  // ==========================================
  
  getWorkers: protectedProcedure
    .input(z.object({
      workerType: z.enum(["employee", "contractor", "volunteer"]).optional(),
      status: z.enum(["active", "inactive", "terminated"]).optional(),
      departmentId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      let query = db.select().from(timekeepingWorkers);
      
      if (input?.workerType) {
        query = query.where(eq(timekeepingWorkers.workerType, input.workerType)) as typeof query;
      }
      if (input?.status) {
        query = query.where(eq(timekeepingWorkers.status, input.status)) as typeof query;
      }
      if (input?.departmentId) {
        query = query.where(eq(timekeepingWorkers.departmentId, input.departmentId)) as typeof query;
      }
      
      return await query.orderBy(timekeepingWorkers.lastName, timekeepingWorkers.firstName);
    }),

  createWorker: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
      employeeId: z.number().optional(),
      contractorId: z.number().optional(),
      workerType: z.enum(["employee", "contractor", "volunteer"]),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email().optional(),
      departmentId: z.number().optional(),
      entityId: z.number().optional(),
      supervisorId: z.number().optional(),
      defaultChargeCodeId: z.number().optional(),
      hourlyRate: z.string().optional(),
      standardHoursPerWeek: z.string().optional(),
      overtimeEligible: z.boolean().default(true),
      hireDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db.insert(timekeepingWorkers).values({
        userId: input.userId,
        employeeId: input.employeeId,
        contractorId: input.contractorId,
        workerType: input.workerType,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        departmentId: input.departmentId,
        entityId: input.entityId,
        supervisorId: input.supervisorId,
        defaultChargeCodeId: input.defaultChargeCodeId,
        hourlyRate: input.hourlyRate,
        standardHoursPerWeek: input.standardHoursPerWeek || "40.00",
        overtimeEligible: input.overtimeEligible,
        hireDate: input.hireDate ? new Date(input.hireDate) : undefined,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // WORKER CHARGE CODE ASSIGNMENTS
  // ==========================================
  
  getWorkerAssignments: protectedProcedure
    .input(z.object({ workerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      return await db.select()
        .from(workerChargeCodeAssignments)
        .where(and(
          eq(workerChargeCodeAssignments.workerId, input.workerId),
          eq(workerChargeCodeAssignments.isActive, true)
        ));
    }),

  assignChargeCode: protectedProcedure
    .input(z.object({
      workerId: z.number(),
      chargeCodeId: z.number(),
      assignedBy: z.number().optional(),
      maxHoursPerWeek: z.string().optional(),
      effectiveFrom: z.string().optional(),
      effectiveTo: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db.insert(workerChargeCodeAssignments).values({
        workerId: input.workerId,
        chargeCodeId: input.chargeCodeId,
        assignedBy: input.assignedBy,
        maxHoursPerWeek: input.maxHoursPerWeek,
        effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : undefined,
        effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : undefined,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // TIME ENTRIES
  // ==========================================
  
  getTimeEntries: protectedProcedure
    .input(z.object({
      workerId: z.number().optional(),
      chargeCodeId: z.number().optional(),
      timesheetId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.enum(["draft", "submitted", "approved", "rejected", "invoiced"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      let conditions = [];
      
      if (input.workerId) conditions.push(eq(timeEntries.workerId, input.workerId));
      if (input.chargeCodeId) conditions.push(eq(timeEntries.chargeCodeId, input.chargeCodeId));
      if (input.timesheetId) conditions.push(eq(timeEntries.timesheetId, input.timesheetId));
      if (input.status) conditions.push(eq(timeEntries.status, input.status));
      if (input.startDate) conditions.push(gte(timeEntries.entryDate, new Date(input.startDate)));
      if (input.endDate) conditions.push(lte(timeEntries.entryDate, new Date(input.endDate)));
      
      let query = db.select().from(timeEntries);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }
      
      return await query.orderBy(desc(timeEntries.entryDate));
    }),

  createTimeEntry: protectedProcedure
    .input(z.object({
      workerId: z.number(),
      chargeCodeId: z.number(),
      timesheetId: z.number().optional(),
      entryDate: z.string(),
      hoursWorked: z.string(),
      overtimeHours: z.string().optional(),
      description: z.string().optional(),
      taskReference: z.string().optional(),
      projectId: z.number().optional(),
      isBillable: z.boolean().default(true),
      billingRate: z.string().optional(),
      clockInTime: z.string().optional(),
      clockOutTime: z.string().optional(),
      breakMinutes: z.number().optional(),
      location: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db.insert(timeEntries).values({
        workerId: input.workerId,
        chargeCodeId: input.chargeCodeId,
        timesheetId: input.timesheetId,
        entryDate: new Date(input.entryDate),
        hoursWorked: input.hoursWorked,
        overtimeHours: input.overtimeHours || "0.00",
        description: input.description,
        taskReference: input.taskReference,
        projectId: input.projectId,
        isBillable: input.isBillable,
        billingRate: input.billingRate,
        clockInTime: input.clockInTime ? new Date(input.clockInTime) : undefined,
        clockOutTime: input.clockOutTime ? new Date(input.clockOutTime) : undefined,
        breakMinutes: input.breakMinutes || 0,
        location: input.location,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  updateTimeEntry: protectedProcedure
    .input(z.object({
      id: z.number(),
      hoursWorked: z.string().optional(),
      overtimeHours: z.string().optional(),
      description: z.string().optional(),
      chargeCodeId: z.number().optional(),
      status: z.enum(["draft", "submitted", "approved", "rejected", "invoiced"]).optional(),
      rejectionReason: z.string().optional(),
      approvedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { id, ...updates } = input;
      const updateData: Record<string, any> = {};
      
      if (updates.hoursWorked !== undefined) updateData.hoursWorked = updates.hoursWorked;
      if (updates.overtimeHours !== undefined) updateData.overtimeHours = updates.overtimeHours;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.chargeCodeId !== undefined) updateData.chargeCodeId = updates.chargeCodeId;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.rejectionReason !== undefined) updateData.rejectionReason = updates.rejectionReason;
      if (updates.approvedBy !== undefined) {
        updateData.approvedBy = updates.approvedBy;
        updateData.approvedAt = new Date();
      }
      
      await db.update(timeEntries).set(updateData).where(eq(timeEntries.id, id));
      
      return { success: true };
    }),

  // ==========================================
  // TIMESHEETS
  // ==========================================
  
  getTimesheets: protectedProcedure
    .input(z.object({
      workerId: z.number().optional(),
      status: z.enum(["draft", "submitted", "pending_approval", "approved", "rejected", "processed"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      let conditions = [];
      
      if (input?.workerId) conditions.push(eq(timesheets.workerId, input.workerId));
      if (input?.status) conditions.push(eq(timesheets.status, input.status));
      if (input?.startDate) conditions.push(gte(timesheets.periodStart, new Date(input.startDate)));
      if (input?.endDate) conditions.push(lte(timesheets.periodEnd, new Date(input.endDate)));
      
      let query = db.select().from(timesheets);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }
      
      return await query.orderBy(desc(timesheets.periodStart));
    }),

  createTimesheet: protectedProcedure
    .input(z.object({
      workerId: z.number(),
      periodStart: z.string(),
      periodEnd: z.string(),
      periodType: z.enum(["weekly", "biweekly", "semimonthly", "monthly"]).default("biweekly"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db.insert(timesheets).values({
        workerId: input.workerId,
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
        periodType: input.periodType,
        notes: input.notes,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  submitTimesheet: protectedProcedure
    .input(z.object({
      id: z.number(),
      workerSignature: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Calculate totals from time entries
      const entries = await db.select()
        .from(timeEntries)
        .where(eq(timeEntries.timesheetId, input.id));
      
      let totalRegular = 0;
      let totalOvertime = 0;
      let totalBillable = 0;
      let totalNonBillable = 0;
      
      for (const entry of entries) {
        const hours = parseFloat(entry.hoursWorked || "0");
        const overtime = parseFloat(entry.overtimeHours || "0");
        totalRegular += hours;
        totalOvertime += overtime;
        if (entry.isBillable) {
          totalBillable += hours + overtime;
        } else {
          totalNonBillable += hours + overtime;
        }
      }
      
      await db.update(timesheets).set({
        status: "submitted",
        submittedAt: new Date(),
        submittedBy: ctx.user?.id,
        workerSignature: input.workerSignature,
        workerSignedAt: input.workerSignature ? new Date() : undefined,
        totalRegularHours: totalRegular.toFixed(2),
        totalOvertimeHours: totalOvertime.toFixed(2),
        totalBillableHours: totalBillable.toFixed(2),
        totalNonBillableHours: totalNonBillable.toFixed(2),
      }).where(eq(timesheets.id, input.id));
      
      // Update all time entries to submitted
      await db.update(timeEntries).set({ status: "submitted" })
        .where(eq(timeEntries.timesheetId, input.id));
      
      return { success: true };
    }),

  // ==========================================
  // TIMESHEET APPROVALS
  // ==========================================
  
  approveTimesheet: protectedProcedure
    .input(z.object({
      timesheetId: z.number(),
      action: z.enum(["approved", "rejected", "returned_for_revision"]),
      comments: z.string().optional(),
      approverSignature: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Create approval record
      await db.insert(timesheetApprovals).values({
        timesheetId: input.timesheetId,
        approverId: ctx.user?.id || 0,
        approverRole: "supervisor", // Could be determined by user role
        action: input.action,
        comments: input.comments,
        approverSignature: input.approverSignature,
      });
      
      // Update timesheet status
      const newStatus = input.action === "approved" ? "approved" : 
                        input.action === "rejected" ? "rejected" : "draft";
      
      await db.update(timesheets).set({ status: newStatus })
        .where(eq(timesheets.id, input.timesheetId));
      
      // Update time entries status
      if (input.action === "approved") {
        await db.update(timeEntries).set({ 
          status: "approved",
          approvedBy: ctx.user?.id,
          approvedAt: new Date(),
        }).where(eq(timeEntries.timesheetId, input.timesheetId));
      } else if (input.action === "rejected") {
        await db.update(timeEntries).set({ 
          status: "rejected",
          rejectionReason: input.comments,
        }).where(eq(timeEntries.timesheetId, input.timesheetId));
      }
      
      return { success: true };
    }),

  getTimesheetApprovals: protectedProcedure
    .input(z.object({ timesheetId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      return await db.select()
        .from(timesheetApprovals)
        .where(eq(timesheetApprovals.timesheetId, input.timesheetId))
        .orderBy(desc(timesheetApprovals.actionAt));
    }),

  // ==========================================
  // TIME OFF REQUESTS
  // ==========================================
  
  getTimeOffRequests: protectedProcedure
    .input(z.object({
      workerId: z.number().optional(),
      status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      let conditions = [];
      if (input?.workerId) conditions.push(eq(timeOffRequests.workerId, input.workerId));
      if (input?.status) conditions.push(eq(timeOffRequests.status, input.status));
      
      let query = db.select().from(timeOffRequests);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }
      
      return await query.orderBy(desc(timeOffRequests.startDate));
    }),

  createTimeOffRequest: protectedProcedure
    .input(z.object({
      workerId: z.number(),
      requestType: z.enum(["pto", "sick", "personal", "bereavement", "jury_duty", "military", "unpaid", "other"]),
      startDate: z.string(),
      endDate: z.string(),
      totalHours: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db.insert(timeOffRequests).values({
        workerId: input.workerId,
        requestType: input.requestType,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        totalHours: input.totalHours,
        reason: input.reason,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // CONTRACTOR INVOICES
  // ==========================================
  
  getContractorInvoices: protectedProcedure
    .input(z.object({
      workerId: z.number().optional(),
      status: z.enum(["draft", "submitted", "under_review", "approved", "paid", "disputed"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      let conditions = [];
      if (input?.workerId) conditions.push(eq(contractorInvoices.workerId, input.workerId));
      if (input?.status) conditions.push(eq(contractorInvoices.status, input.status));
      
      let query = db.select().from(contractorInvoices);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }
      
      return await query.orderBy(desc(contractorInvoices.createdAt));
    }),

  createContractorInvoice: protectedProcedure
    .input(z.object({
      workerId: z.number(),
      invoiceNumber: z.string(),
      periodStart: z.string(),
      periodEnd: z.string(),
      totalHours: z.string(),
      totalAmount: z.string(),
      notes: z.string().optional(),
      attachmentUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db.insert(contractorInvoices).values({
        workerId: input.workerId,
        invoiceNumber: input.invoiceNumber,
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
        totalHours: input.totalHours,
        totalAmount: input.totalAmount,
        notes: input.notes,
        attachmentUrl: input.attachmentUrl,
      });
      
      return { success: true, id: result[0].insertId };
    }),

  // ==========================================
  // REPORTS
  // ==========================================
  
  getHoursByChargeCode: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      fundingSourceId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Get all time entries in date range
      const entries = await db.select()
        .from(timeEntries)
        .where(and(
          gte(timeEntries.entryDate, new Date(input.startDate)),
          lte(timeEntries.entryDate, new Date(input.endDate)),
          eq(timeEntries.status, "approved")
        ));
      
      // Get charge codes
      const codes = await db.select().from(chargeCodes);
      const codeMap = new Map(codes.map(c => [c.id, c]));
      
      // Aggregate by charge code
      const summary: Record<number, { code: string; name: string; hours: number; amount: number }> = {};
      
      for (const entry of entries) {
        const code = codeMap.get(entry.chargeCodeId);
        if (!code) continue;
        
        if (input.fundingSourceId && code.fundingSourceId !== input.fundingSourceId) continue;
        
        if (!summary[entry.chargeCodeId]) {
          summary[entry.chargeCodeId] = {
            code: code.code,
            name: code.name,
            hours: 0,
            amount: 0,
          };
        }
        
        const hours = parseFloat(entry.hoursWorked || "0") + parseFloat(entry.overtimeHours || "0");
        const rate = parseFloat(entry.billingRate || code.hourlyRate || "0");
        
        summary[entry.chargeCodeId].hours += hours;
        summary[entry.chargeCodeId].amount += hours * rate;
      }
      
      return Object.values(summary);
    }),

  getHoursByWorker: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      departmentId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Get all workers
      let workers = await db.select().from(timekeepingWorkers);
      if (input.departmentId) {
        workers = workers.filter(w => w.departmentId === input.departmentId);
      }
      
      const workerIds = workers.map(w => w.id);
      if (workerIds.length === 0) return [];
      
      // Get time entries
      const entries = await db.select()
        .from(timeEntries)
        .where(and(
          inArray(timeEntries.workerId, workerIds),
          gte(timeEntries.entryDate, new Date(input.startDate)),
          lte(timeEntries.entryDate, new Date(input.endDate))
        ));
      
      // Aggregate by worker
      const summary: Record<number, { 
        name: string; 
        workerType: string;
        regularHours: number; 
        overtimeHours: number;
        billableHours: number;
      }> = {};
      
      for (const worker of workers) {
        summary[worker.id] = {
          name: `${worker.firstName} ${worker.lastName}`,
          workerType: worker.workerType,
          regularHours: 0,
          overtimeHours: 0,
          billableHours: 0,
        };
      }
      
      for (const entry of entries) {
        if (!summary[entry.workerId]) continue;
        
        summary[entry.workerId].regularHours += parseFloat(entry.hoursWorked || "0");
        summary[entry.workerId].overtimeHours += parseFloat(entry.overtimeHours || "0");
        if (entry.isBillable) {
          summary[entry.workerId].billableHours += parseFloat(entry.hoursWorked || "0") + parseFloat(entry.overtimeHours || "0");
        }
      }
      
      return Object.values(summary);
    }),
});
