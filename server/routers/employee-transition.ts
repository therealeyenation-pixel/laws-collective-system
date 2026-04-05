import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  businessEntities,
  houses,
  positionHolders,
  businessPositions,
  employmentDocuments,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// EMPLOYEE-TO-OWNER TRANSITION ROUTER
// Handles the conversion of W-2 employees to business owners
// ============================================

// Transition states stored in memory (will be replaced with DB table)
const transitionPlans: Map<string, any> = new Map();

export const employeeTransitionRouter = router({
  /**
   * Initiate transition from employee to business owner
   * Creates a transition plan with milestones
   */
  initiateTransition: protectedProcedure
    .input(z.object({
      positionHolderId: z.number(),
      targetBusinessName: z.string().min(1),
      targetBusinessType: z.enum(["llc", "sole_prop", "corporation", "partnership"]),
      targetState: z.string().length(2),
      transitionReason: z.string(),
      targetCompletionDate: z.string(),
      workshopRequired: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get the position holder
      const [holder] = await db.select().from(positionHolders)
        .where(eq(positionHolders.id, input.positionHolderId)).limit(1);
      
      if (!holder) throw new TRPCError({ code: "NOT_FOUND", message: "Position holder not found" });
      if (holder.status !== "active") throw new TRPCError({ code: "BAD_REQUEST", message: "Employee must be active to initiate transition" });

      // Get user's house
      const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
      const houseId = userHouse?.id || 1;

      // Generate transition plan ID
      const transitionId = `TRANS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Create milestones based on requirements
      const milestones = [
        {
          id: 1,
          title: "Transition Initiated",
          description: "Employee notified and transition plan created",
          status: "completed",
          completedAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Business Workshop Enrollment",
          description: "Enroll in Business Workshop course in Academy",
          status: input.workshopRequired ? "pending" : "skipped",
          required: input.workshopRequired,
        },
        {
          id: 3,
          title: "Business Workshop Completion",
          description: "Complete all modules of Business Workshop",
          status: input.workshopRequired ? "pending" : "skipped",
          required: input.workshopRequired,
        },
        {
          id: 4,
          title: "Business Entity Formation",
          description: `Form ${input.targetBusinessName} (${input.targetBusinessType.toUpperCase()}) in ${input.targetState}`,
          status: "pending",
          required: true,
        },
        {
          id: 5,
          title: "EIN Application",
          description: "Apply for Employer Identification Number with IRS",
          status: "pending",
          required: true,
        },
        {
          id: 6,
          title: "Business Bank Account",
          description: "Open business bank account for the new entity",
          status: "pending",
          required: true,
        },
        {
          id: 7,
          title: "Operating Agreement",
          description: "Draft and sign Operating Agreement",
          status: "pending",
          required: input.targetBusinessType === "llc" || input.targetBusinessType === "partnership",
        },
        {
          id: 8,
          title: "Employment Termination",
          description: "Process final paycheck and termination documents",
          status: "pending",
          required: true,
        },
        {
          id: 9,
          title: "Final W-2 Generation",
          description: "Generate final W-2 for partial year employment",
          status: "pending",
          required: true,
        },
        {
          id: 10,
          title: "Service Agreement Creation",
          description: "Create B2B service agreement between businesses",
          status: "pending",
          required: true,
        },
        {
          id: 11,
          title: "W-9 Collection",
          description: "Collect W-9 from new business entity",
          status: "pending",
          required: true,
        },
        {
          id: 12,
          title: "House Linkage",
          description: "Link new business to House with 70/30 platform fee",
          status: "pending",
          required: true,
        },
        {
          id: 13,
          title: "Transition Complete",
          description: "All milestones completed, employee is now business owner",
          status: "pending",
          required: true,
        },
      ].filter(m => m.required !== false);

      const transitionPlan = {
        id: transitionId,
        houseId,
        positionHolderId: input.positionHolderId,
employeeName: holder.fullName,
      employeeUserId: holder.userId,
      currentEmployer: holder.positionId, // Will get actual business from position
        targetBusiness: {
          name: input.targetBusinessName,
          type: input.targetBusinessType,
          state: input.targetState,
          entityId: null, // Will be set when business is formed
        },
        reason: input.transitionReason,
        targetCompletionDate: input.targetCompletionDate,
        workshopRequired: input.workshopRequired,
        workshopProgress: {
          enrolled: false,
          enrolledAt: null,
          completed: false,
          completedAt: null,
          modulesCompleted: 0,
          totalModules: 12,
        },
        milestones,
        status: "in_progress",
        initiatedBy: ctx.user.id,
        initiatedAt: new Date().toISOString(),
        completedAt: null,
      };

      transitionPlans.set(transitionId, transitionPlan);

      return {
        success: true,
        transitionId,
        plan: transitionPlan,
      };
    }),

  /**
   * Get all transition plans for the house
   */
  getTransitions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
    const houseId = userHouse?.id || 1;

    const transitions = Array.from(transitionPlans.values()).filter(t => t.houseId === houseId);
    return transitions;
  }),

  /**
   * Get a single transition plan
   */
  getTransition: protectedProcedure
    .input(z.object({ transitionId: z.string() }))
    .query(async ({ input }) => {
      const plan = transitionPlans.get(input.transitionId);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Transition plan not found" });
      return plan;
    }),

  /**
   * Update workshop progress
   */
  updateWorkshopProgress: protectedProcedure
    .input(z.object({
      transitionId: z.string(),
      enrolled: z.boolean().optional(),
      modulesCompleted: z.number().optional(),
      completed: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const plan = transitionPlans.get(input.transitionId);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Transition plan not found" });

      if (input.enrolled !== undefined) {
        plan.workshopProgress.enrolled = input.enrolled;
        if (input.enrolled) {
          plan.workshopProgress.enrolledAt = new Date().toISOString();
          // Update milestone
          const milestone = plan.milestones.find((m: any) => m.title === "Business Workshop Enrollment");
          if (milestone) {
            milestone.status = "completed";
            milestone.completedAt = new Date().toISOString();
          }
        }
      }

      if (input.modulesCompleted !== undefined) {
        plan.workshopProgress.modulesCompleted = input.modulesCompleted;
      }

      if (input.completed !== undefined && input.completed) {
        plan.workshopProgress.completed = true;
        plan.workshopProgress.completedAt = new Date().toISOString();
        // Update milestone
        const milestone = plan.milestones.find((m: any) => m.title === "Business Workshop Completion");
        if (milestone) {
          milestone.status = "completed";
          milestone.completedAt = new Date().toISOString();
        }
      }

      return { success: true, workshopProgress: plan.workshopProgress };
    }),

  /**
   * Complete a milestone
   */
  completeMilestone: protectedProcedure
    .input(z.object({
      transitionId: z.string(),
      milestoneId: z.number(),
      notes: z.string().optional(),
      documentId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const plan = transitionPlans.get(input.transitionId);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Transition plan not found" });

      const milestone = plan.milestones.find((m: any) => m.id === input.milestoneId);
      if (!milestone) throw new TRPCError({ code: "NOT_FOUND", message: "Milestone not found" });

      milestone.status = "completed";
      milestone.completedAt = new Date().toISOString();
      milestone.notes = input.notes;
      milestone.documentId = input.documentId;

      // Check if all milestones are complete
      const allComplete = plan.milestones.every((m: any) => m.status === "completed" || m.status === "skipped");
      if (allComplete) {
        plan.status = "completed";
        plan.completedAt = new Date().toISOString();
      }

      return { success: true, milestone, planStatus: plan.status };
    }),

  /**
   * Link the newly formed business to the transition
   */
  linkNewBusiness: protectedProcedure
    .input(z.object({
      transitionId: z.string(),
      businessEntityId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const plan = transitionPlans.get(input.transitionId);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Transition plan not found" });

      // Verify business exists
      const [business] = await db.select().from(businessEntities)
        .where(eq(businessEntities.id, input.businessEntityId)).limit(1);
      if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business entity not found" });

      plan.targetBusiness.entityId = input.businessEntityId;

      // Update milestone
      const milestone = plan.milestones.find((m: any) => m.title === "Business Entity Formation");
      if (milestone) {
        milestone.status = "completed";
        milestone.completedAt = new Date().toISOString();
      }

      return { success: true, business };
    }),

  /**
   * Execute the employment termination step
   */
  executeTermination: protectedProcedure
    .input(z.object({
      transitionId: z.string(),
      terminationDate: z.string(),
      finalPaycheckAmount: z.number(),
      unusedPtoHours: z.number().optional(),
      ptoPayoutRate: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const plan = transitionPlans.get(input.transitionId);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Transition plan not found" });

      // Calculate PTO payout
      const ptoPayout = (input.unusedPtoHours || 0) * (input.ptoPayoutRate || 0);
      const totalFinalPay = input.finalPaycheckAmount + ptoPayout;

      // Update position holder status
      await db.update(positionHolders).set({
        status: "terminated",
        terminationReason: `Transition to business owner: ${plan.targetBusiness.name}`,
      }).where(eq(positionHolders.id, plan.positionHolderId));

      // Generate termination document
      const terminationDoc = {
        type: "termination_letter",
        employeeName: plan.employeeName,
        terminationDate: input.terminationDate,
        reason: "Voluntary transition to independent contractor/business owner",
        finalPaycheck: input.finalPaycheckAmount,
        ptoPayout,
        totalFinalPay,
        newBusinessName: plan.targetBusiness.name,
        generatedAt: new Date().toISOString(),
      };

      // Store document - note: actual content would be stored in vault
      // For now we just track the document metadata
      // The terminationDoc would be stored via house-vault router
      plan.terminationDocument = terminationDoc;

      // Update milestones
      const termMilestone = plan.milestones.find((m: any) => m.title === "Employment Termination");
      if (termMilestone) {
        termMilestone.status = "completed";
        termMilestone.completedAt = new Date().toISOString();
      }

      plan.termination = {
        date: input.terminationDate,
        finalPaycheck: input.finalPaycheckAmount,
        ptoPayout,
        totalFinalPay,
        executedBy: ctx.user.id,
        executedAt: new Date().toISOString(),
      };

      return {
        success: true,
        termination: plan.termination,
        terminationDocument: terminationDoc,
      };
    }),

  /**
   * Create service agreement for the new business relationship
   */
  createContractorAgreement: protectedProcedure
    .input(z.object({
      transitionId: z.string(),
      scopeOfWork: z.string(),
      compensationType: z.enum(["fixed_fee", "hourly", "retainer"]),
      compensationAmount: z.number(),
      startDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const plan = transitionPlans.get(input.transitionId);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Transition plan not found" });

      if (!plan.targetBusiness.entityId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Business entity must be formed first" });
      }

      // Create service agreement reference
      const agreementRef = {
        clientBusinessId: plan.currentEmployer,
        contractorBusinessId: plan.targetBusiness.entityId,
        scopeOfWork: input.scopeOfWork,
        compensationType: input.compensationType,
        compensationAmount: input.compensationAmount,
        startDate: input.startDate,
        platformFeePercent: 30, // Standard 70/30 split
        createdAt: new Date().toISOString(),
      };

      plan.serviceAgreement = agreementRef;

      // Update milestone
      const milestone = plan.milestones.find((m: any) => m.title === "Service Agreement Creation");
      if (milestone) {
        milestone.status = "completed";
        milestone.completedAt = new Date().toISOString();
      }

      return {
        success: true,
        serviceAgreement: agreementRef,
        message: "Service agreement created. Use B2B Contracting to finalize.",
      };
    }),

  /**
   * Finalize the transition
   */
  finalizeTransition: protectedProcedure
    .input(z.object({ transitionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const plan = transitionPlans.get(input.transitionId);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Transition plan not found" });

      // Check all required milestones are complete
      const incompleteMilestones = plan.milestones.filter(
        (m: any) => m.status !== "completed" && m.status !== "skipped"
      );

      if (incompleteMilestones.length > 0) {
        return {
          success: false,
          message: "Cannot finalize - incomplete milestones",
          incompleteMilestones: incompleteMilestones.map((m: any) => m.title),
        };
      }

      // Mark final milestone complete
      const finalMilestone = plan.milestones.find((m: any) => m.title === "Transition Complete");
      if (finalMilestone) {
        finalMilestone.status = "completed";
        finalMilestone.completedAt = new Date().toISOString();
      }

      plan.status = "completed";
      plan.completedAt = new Date().toISOString();
      plan.finalizedBy = ctx.user.id;

      return {
        success: true,
        message: `${plan.employeeName} has successfully transitioned from employee to owner of ${plan.targetBusiness.name}`,
        summary: {
          employeeName: plan.employeeName,
          previousEmployer: plan.currentEmployer,
          newBusiness: plan.targetBusiness,
          transitionDuration: Math.ceil(
            (new Date(plan.completedAt).getTime() - new Date(plan.initiatedAt).getTime()) / (1000 * 60 * 60 * 24)
          ) + " days",
        },
      };
    }),

  /**
   * Get transition dashboard
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [userHouse] = await db.select().from(houses).where(eq(houses.ownerUserId, ctx.user.id)).limit(1);
    const houseId = userHouse?.id || 1;

    const allTransitions = Array.from(transitionPlans.values()).filter(t => t.houseId === houseId);
    const inProgress = allTransitions.filter(t => t.status === "in_progress");
    const completed = allTransitions.filter(t => t.status === "completed");

    return {
      summary: {
        total: allTransitions.length,
        inProgress: inProgress.length,
        completed: completed.length,
      },
      activeTransitions: inProgress.map(t => ({
        id: t.id,
        employeeName: t.employeeName,
        targetBusiness: t.targetBusiness.name,
        progress: Math.round(
          (t.milestones.filter((m: any) => m.status === "completed").length / t.milestones.length) * 100
        ),
        nextMilestone: t.milestones.find((m: any) => m.status === "pending")?.title,
        targetDate: t.targetCompletionDate,
      })),
      recentlyCompleted: completed.slice(0, 5).map(t => ({
        id: t.id,
        employeeName: t.employeeName,
        newBusiness: t.targetBusiness.name,
        completedAt: t.completedAt,
      })),
    };
  }),
});

export default employeeTransitionRouter;
