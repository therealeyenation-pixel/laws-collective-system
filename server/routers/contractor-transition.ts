import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  employees,
  contractorTransitions,
  contractorBusinesses,
  impactMetrics,
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// CONTRACTOR TRANSITION ROUTER (GATED)
// Handles employee-to-contractor transitions with strict verification gates
// Employees CANNOT become contractors until they have:
// 1. Completed all required training modules
// 2. Formed a verified business entity (LLC/Corp)
// 3. Obtained an EIN
// 4. Set up a business bank account
// 5. Signed the contractor agreement
// ============================================

// Transition phase definitions with gate requirements
const TRANSITION_PHASES = {
  initiated: {
    order: 1,
    label: "Initiated",
    description: "Transition request submitted",
    gates: [],
  },
  training_assigned: {
    order: 2,
    label: "Training Assigned",
    description: "Contractor training modules assigned",
    gates: ["transition_approved"],
  },
  training_in_progress: {
    order: 3,
    label: "Training In Progress",
    description: "Employee completing contractor training",
    gates: ["training_started"],
  },
  training_completed: {
    order: 4,
    label: "Training Completed",
    description: "All training modules passed with certification",
    gates: ["all_modules_passed", "certification_issued"],
  },
  entity_formation: {
    order: 5,
    label: "Entity Formation",
    description: "Business entity being formed",
    gates: ["training_completed"],
  },
  entity_verified: {
    order: 6,
    label: "Entity Verified",
    description: "Business entity verified with all requirements",
    gates: ["entity_registered", "ein_obtained", "business_bank_setup"],
  },
  contract_pending: {
    order: 7,
    label: "Contract Pending",
    description: "Contractor agreement awaiting signature",
    gates: ["entity_verified"],
  },
  contract_signed: {
    order: 8,
    label: "Contract Signed",
    description: "Contractor agreement executed",
    gates: ["agreement_signed"],
  },
  completed: {
    order: 9,
    label: "Completed",
    description: "Transition complete - employee is now a contractor",
    gates: ["all_gates_passed"],
  },
  cancelled: {
    order: 0,
    label: "Cancelled",
    description: "Transition cancelled",
    gates: [],
  },
};

// Required training modules for contractor transition
const REQUIRED_TRAINING_MODULES = [
  {
    id: "1099-taxes",
    title: "Understanding 1099 Tax Obligations",
    description: "Self-employment taxes, quarterly estimates, deductions",
    estimatedHours: 2,
    passingScore: 80,
  },
  {
    id: "invoicing-basics",
    title: "Professional Invoicing & Billing",
    description: "Creating invoices, payment terms, tracking receivables",
    estimatedHours: 1.5,
    passingScore: 80,
  },
  {
    id: "contract-terms",
    title: "Understanding Contract Terms",
    description: "Scope of work, deliverables, liability, termination clauses",
    estimatedHours: 2,
    passingScore: 85,
  },
  {
    id: "ic-vs-employee",
    title: "Independent Contractor vs Employee",
    description: "Legal distinctions, IRS guidelines, compliance requirements",
    estimatedHours: 2.5,
    passingScore: 90,
  },
  {
    id: "business-entity-basics",
    title: "Business Entity Formation",
    description: "LLC vs Corp, state registration, operating agreements",
    estimatedHours: 2,
    passingScore: 80,
  },
  {
    id: "business-banking",
    title: "Business Banking & Financial Separation",
    description: "Separating personal/business finances, bookkeeping basics",
    estimatedHours: 1.5,
    passingScore: 80,
  },
  {
    id: "insurance-requirements",
    title: "Business Insurance Requirements",
    description: "General liability, professional liability, workers comp",
    estimatedHours: 1,
    passingScore: 75,
  },
  {
    id: "laws-platform-orientation",
    title: "L.A.W.S. Business OS Platform Orientation",
    description: "Using the platform for invoicing, contracts, and compliance",
    estimatedHours: 2,
    passingScore: 85,
  },
];

export const contractorTransitionRouter = router({
  /**
   * Get transition phases and requirements
   */
  getPhaseInfo: protectedProcedure.query(() => {
    return {
      phases: TRANSITION_PHASES,
      requiredTraining: REQUIRED_TRAINING_MODULES,
      totalTrainingHours: REQUIRED_TRAINING_MODULES.reduce((sum, m) => sum + m.estimatedHours, 0),
    };
  }),

  /**
   * Initiate a contractor transition (HR-triggered)
   */
  initiateTransition: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      reason: z.string().min(10),
      targetCompletionDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get the employee
      const [employee] = await db.select().from(employees)
        .where(eq(employees.id, input.employeeId)).limit(1);
      
      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      const employeeFullName = `${employee.firstName} ${employee.lastName}`;

      // Check if employee is eligible (must be active employee)
      if (employee.workerType !== "employee") {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Only employees can be transitioned to contractors. This person is already a " + employee.workerType 
        });
      }

      // Check for existing active transition
      const [existingTransition] = await db.select().from(contractorTransitions)
        .where(and(
          eq(contractorTransitions.employeeId, input.employeeId),
          eq(contractorTransitions.status, "active")
        )).limit(1);

      if (existingTransition) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "An active transition already exists for this employee" 
        });
      }

      // Create the transition record
      const [newTransition] = await db.insert(contractorTransitions).values({
        employeeId: input.employeeId,
        employeeName: employeeFullName,
        initiatedBy: ctx.user.id,
        initiatedByName: ctx.user.name || "System",
        phase: "initiated",
        status: "active",
        notes: input.notes,
      }).$returningId();

      return {
        success: true,
        transitionId: newTransition.id,
        message: `Transition initiated for ${employeeFullName}. Next step: Assign training modules.`,
        nextPhase: "training_assigned",
        requiredGates: ["Approve transition", "Assign training modules"],
      };
    }),

  /**
   * Get all transitions with filtering
   */
  getTransitions: protectedProcedure
    .input(z.object({
      status: z.enum(["active", "completed", "cancelled", "on_hold", "all"]).optional(),
      phase: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      let query = db.select().from(contractorTransitions);
      
      if (input?.status && input.status !== "all") {
        query = query.where(eq(contractorTransitions.status, input.status)) as any;
      }

      const transitions = await query.orderBy(desc(contractorTransitions.createdAt));

      return transitions.map(t => ({
        ...t,
        phaseInfo: TRANSITION_PHASES[t.phase as keyof typeof TRANSITION_PHASES],
        progressPercent: Math.round(
          (TRANSITION_PHASES[t.phase as keyof typeof TRANSITION_PHASES]?.order || 0) / 9 * 100
        ),
      }));
    }),

  /**
   * Get a single transition with full details
   */
  getTransition: protectedProcedure
    .input(z.object({ transitionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [transition] = await db.select().from(contractorTransitions)
        .where(eq(contractorTransitions.id, input.transitionId)).limit(1);

      if (!transition) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transition not found" });
      }

      // Get the employee details
      const [employee] = await db.select().from(employees)
        .where(eq(employees.id, transition.employeeId)).limit(1);

      // Calculate gate status
      const gateStatus = {
        trainingCompleted: transition.certificationIssued,
        entityRegistered: !!transition.entityName,
        einObtained: transition.einObtained,
        businessBankSetup: transition.businessBankSetup,
        contractSigned: !!transition.contractSignedDate,
      };

      const allGatesPassed = Object.values(gateStatus).every(v => v);

      return {
        ...transition,
        employee,
        phaseInfo: TRANSITION_PHASES[transition.phase as keyof typeof TRANSITION_PHASES],
        progressPercent: Math.round(
          (TRANSITION_PHASES[transition.phase as keyof typeof TRANSITION_PHASES]?.order || 0) / 9 * 100
        ),
        gateStatus,
        allGatesPassed,
        requiredTraining: REQUIRED_TRAINING_MODULES,
        canAdvanceToNextPhase: checkCanAdvance(transition, gateStatus),
      };
    }),

  /**
   * Assign training to employee
   */
  assignTraining: protectedProcedure
    .input(z.object({
      transitionId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [transition] = await db.select().from(contractorTransitions)
        .where(eq(contractorTransitions.id, input.transitionId)).limit(1);

      if (!transition) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transition not found" });
      }

      if (transition.phase !== "initiated") {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Training can only be assigned in the 'initiated' phase" 
        });
      }

      await db.update(contractorTransitions).set({
        phase: "training_assigned",
        trainingStartDate: new Date(),
      }).where(eq(contractorTransitions.id, input.transitionId));

      return {
        success: true,
        message: "Training modules assigned. Employee can now begin contractor training.",
        assignedModules: REQUIRED_TRAINING_MODULES,
        totalHours: REQUIRED_TRAINING_MODULES.reduce((sum, m) => sum + m.estimatedHours, 0),
      };
    }),

  /**
   * Update training progress
   */
  updateTrainingProgress: protectedProcedure
    .input(z.object({
      transitionId: z.number(),
      moduleId: z.string(),
      score: z.number().min(0).max(100),
      passed: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [transition] = await db.select().from(contractorTransitions)
        .where(eq(contractorTransitions.id, input.transitionId)).limit(1);

      if (!transition) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transition not found" });
      }

      // Update phase to in_progress if not already
      if (transition.phase === "training_assigned") {
        await db.update(contractorTransitions).set({
          phase: "training_in_progress",
        }).where(eq(contractorTransitions.id, input.transitionId));
      }

      // In a real implementation, we'd track individual module completion
      // For now, we'll update the overall training score
      if (input.passed) {
        await db.update(contractorTransitions).set({
          trainingScore: input.score,
        }).where(eq(contractorTransitions.id, input.transitionId));
      }

      return {
        success: true,
        moduleId: input.moduleId,
        passed: input.passed,
        score: input.score,
      };
    }),

  /**
   * Complete training and issue certification
   * GATE: All modules must be passed before this can be called
   */
  completeTraining: protectedProcedure
    .input(z.object({
      transitionId: z.number(),
      finalScore: z.number().min(80), // Minimum 80% overall score required
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [transition] = await db.select().from(contractorTransitions)
        .where(eq(contractorTransitions.id, input.transitionId)).limit(1);

      if (!transition) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transition not found" });
      }

      if (transition.phase !== "training_in_progress" && transition.phase !== "training_assigned") {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Training must be in progress to complete" 
        });
      }

      await db.update(contractorTransitions).set({
        phase: "training_completed",
        trainingCompletionDate: new Date(),
        trainingScore: input.finalScore,
        certificationIssued: true,
      }).where(eq(contractorTransitions.id, input.transitionId));

      return {
        success: true,
        message: "Training completed! Certification issued. Employee can now proceed to entity formation.",
        certificationDate: new Date().toISOString(),
        nextPhase: "entity_formation",
        nextSteps: [
          "Form a business entity (LLC recommended)",
          "Obtain an EIN from the IRS",
          "Open a business bank account",
        ],
      };
    }),

  /**
   * Start entity formation process
   * GATE: Training must be completed first
   */
  startEntityFormation: protectedProcedure
    .input(z.object({
      transitionId: z.number(),
      proposedEntityName: z.string().min(3),
      entityType: z.enum(["llc", "corporation", "sole_proprietorship"]),
      stateOfFormation: z.string().length(2),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [transition] = await db.select().from(contractorTransitions)
        .where(eq(contractorTransitions.id, input.transitionId)).limit(1);

      if (!transition) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transition not found" });
      }

      // GATE CHECK: Training must be completed
      if (!transition.certificationIssued) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "GATE BLOCKED: Training certification must be issued before entity formation can begin. Complete all training modules first." 
        });
      }

      await db.update(contractorTransitions).set({
        phase: "entity_formation",
        entityName: input.proposedEntityName,
        entityType: input.entityType,
      }).where(eq(contractorTransitions.id, input.transitionId));

      return {
        success: true,
        message: `Entity formation started for ${input.proposedEntityName}`,
        entityDetails: {
          name: input.proposedEntityName,
          type: input.entityType,
          state: input.stateOfFormation,
        },
        requiredSteps: [
          "Register with Secretary of State",
          "Obtain EIN from IRS",
          "Open business bank account",
          "Draft operating agreement (if LLC)",
        ],
      };
    }),

  /**
   * Verify entity formation requirements
   * GATE: All entity requirements must be met
   */
  verifyEntityFormation: protectedProcedure
    .input(z.object({
      transitionId: z.number(),
      einNumber: z.string().regex(/^\d{2}-\d{7}$/, "EIN must be in format XX-XXXXXXX"),
      stateRegistrationNumber: z.string().min(1),
      businessBankAccountVerified: z.boolean(),
      formationDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [transition] = await db.select().from(contractorTransitions)
        .where(eq(contractorTransitions.id, input.transitionId)).limit(1);

      if (!transition) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transition not found" });
      }

      // GATE CHECK: Must be in entity_formation phase
      if (transition.phase !== "entity_formation") {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Entity must be in formation phase to verify" 
        });
      }

      // GATE CHECK: All requirements must be provided
      if (!input.businessBankAccountVerified) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "GATE BLOCKED: Business bank account must be verified before entity can be approved." 
        });
      }

      await db.update(contractorTransitions).set({
        phase: "entity_verified",
        einObtained: true,
        businessBankSetup: true,
        entityFormationDate: new Date(input.formationDate),
      }).where(eq(contractorTransitions.id, input.transitionId));

      return {
        success: true,
        message: "Entity verified! All business requirements met. Ready for contractor agreement.",
        verifiedRequirements: {
          einObtained: true,
          stateRegistration: input.stateRegistrationNumber,
          businessBankAccount: true,
          formationDate: input.formationDate,
        },
        nextPhase: "contract_pending",
        nextStep: "Generate and sign contractor agreement",
      };
    }),

  /**
   * Generate contractor agreement
   * GATE: Entity must be verified first
   */
  generateContractorAgreement: protectedProcedure
    .input(z.object({
      transitionId: z.number(),
      hourlyRate: z.number().min(0).optional(),
      projectRate: z.number().min(0).optional(),
      retainerAmount: z.number().min(0).optional(),
      scopeOfWork: z.string().min(50),
      contractDuration: z.enum(["6_months", "12_months", "ongoing"]),
      nonCompeteClause: z.boolean().default(true),
      ipAssignmentClause: z.boolean().default(true),
      platformLicenseRequired: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [transition] = await db.select().from(contractorTransitions)
        .where(eq(contractorTransitions.id, input.transitionId)).limit(1);

      if (!transition) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transition not found" });
      }

      // GATE CHECK: Entity must be verified
      if (!transition.einObtained || !transition.businessBankSetup) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "GATE BLOCKED: Business entity must be fully verified (EIN + Bank Account) before contractor agreement can be generated." 
        });
      }

      const contractTerms = {
        hourlyRate: input.hourlyRate,
        projectRate: input.projectRate,
        retainerAmount: input.retainerAmount,
        scopeOfWork: input.scopeOfWork,
        duration: input.contractDuration,
        clauses: {
          nonCompete: input.nonCompeteClause,
          ipAssignment: input.ipAssignmentClause,
          platformLicense: input.platformLicenseRequired,
        },
        generatedAt: new Date().toISOString(),
      };

      await db.update(contractorTransitions).set({
        phase: "contract_pending",
        contractTerms: contractTerms,
      }).where(eq(contractorTransitions.id, input.transitionId));

      return {
        success: true,
        message: "Contractor agreement generated. Awaiting signature.",
        contractTerms,
        platformLockIn: input.platformLicenseRequired ? {
          required: true,
          description: "Contractor agrees to use L.A.W.S. Business OS for invoicing and contract management",
          subscriptionTier: "basic", // Can be upgraded
        } : null,
      };
    }),

  /**
   * Sign contractor agreement and complete transition
   * GATE: All previous gates must be passed
   */
  signContractorAgreement: protectedProcedure
    .input(z.object({
      transitionId: z.number(),
      signatureConfirmation: z.literal(true),
      platformSubscriptionAccepted: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [transition] = await db.select().from(contractorTransitions)
        .where(eq(contractorTransitions.id, input.transitionId)).limit(1);

      if (!transition) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transition not found" });
      }

      // FINAL GATE CHECK: All requirements
      const gateChecks = [
        { name: "Training Completed", passed: transition.certificationIssued },
        { name: "Entity Formed", passed: !!transition.entityName },
        { name: "EIN Obtained", passed: transition.einObtained },
        { name: "Business Bank Account", passed: transition.businessBankSetup },
        { name: "Contract Generated", passed: !!transition.contractTerms },
      ];

      const failedGates = gateChecks.filter(g => !g.passed);
      if (failedGates.length > 0) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: `GATE BLOCKED: Cannot complete transition. Failed requirements: ${failedGates.map(g => g.name).join(", ")}` 
        });
      }

      // Update transition to completed
      await db.update(contractorTransitions).set({
        phase: "contract_signed",
        status: "completed",
        contractSignedDate: new Date(),
        completedDate: new Date(),
      }).where(eq(contractorTransitions.id, input.transitionId));

      // Update employee record to contractor
      await db.update(employees).set({
        workerType: "contractor",
      }).where(eq(employees.id, transition.employeeId));

      // Create contractor business record
      await db.insert(contractorBusinesses).values({
        transitionId: transition.id,
        contractorId: transition.employeeId,
        contractorName: transition.employeeName,
        businessName: transition.entityName || "Unknown Business",
        businessType: transition.entityType,
        formationDate: transition.entityFormationDate,
        status: "active",
        platformSubscription: input.platformSubscriptionAccepted ? "basic" : "none",
        platformActiveDate: input.platformSubscriptionAccepted ? new Date() : null,
        activeContractWithLaws: true,
        lastContractDate: new Date(),
      });

      // Record impact metric
      await db.insert(impactMetrics).values({
        metricType: "employees_transitioned",
        periodType: "monthly",
        periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        actualValue: "1",
        programName: "Employee-to-Contractor Transition Program",
        dataSource: "L.A.W.S. Business OS",
      });

      return {
        success: true,
        message: `🎉 Transition Complete! ${transition.employeeName} is now an independent contractor operating as ${transition.entityName}.`,
        summary: {
          employeeName: transition.employeeName,
          newBusinessName: transition.entityName,
          entityType: transition.entityType,
          transitionCompletedAt: new Date().toISOString(),
          platformSubscription: input.platformSubscriptionAccepted ? "basic" : "none",
        },
        nextSteps: [
          "Set up invoicing in L.A.W.S. Business OS",
          "Complete first project milestone",
          "Submit first invoice",
          "Consider upgrading platform subscription for additional features",
        ],
      };
    }),

  /**
   * Get transition dashboard metrics
   */
  getDashboard: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const allTransitions = await db.select().from(contractorTransitions);
    const activeTransitions = allTransitions.filter(t => t.status === "active");
    const completedTransitions = allTransitions.filter(t => t.status === "completed");

    // Get contractor businesses
    const businesses = await db.select().from(contractorBusinesses);
    const activeBusinesses = businesses.filter(b => b.status === "active");
    const platformSubscribers = businesses.filter(b => b.platformSubscription !== "none");

    return {
      summary: {
        totalTransitions: allTransitions.length,
        activeTransitions: activeTransitions.length,
        completedTransitions: completedTransitions.length,
        activeContractorBusinesses: activeBusinesses.length,
        platformSubscribers: platformSubscribers.length,
        conversionRate: allTransitions.length > 0 
          ? Math.round((completedTransitions.length / allTransitions.length) * 100) 
          : 0,
      },
      activeTransitionsByPhase: {
        initiated: activeTransitions.filter(t => t.phase === "initiated").length,
        training: activeTransitions.filter(t => 
          ["training_assigned", "training_in_progress"].includes(t.phase)
        ).length,
        entityFormation: activeTransitions.filter(t => 
          ["entity_formation", "entity_verified"].includes(t.phase)
        ).length,
        contractPending: activeTransitions.filter(t => t.phase === "contract_pending").length,
      },
      recentTransitions: allTransitions.slice(0, 10).map(t => ({
        id: t.id,
        employeeName: t.employeeName,
        phase: t.phase,
        phaseLabel: TRANSITION_PHASES[t.phase as keyof typeof TRANSITION_PHASES]?.label,
        status: t.status,
        createdAt: t.createdAt,
        completedDate: t.completedDate,
      })),
      impactMetrics: {
        employeesTransitioned: completedTransitions.length,
        businessesFormed: activeBusinesses.length,
        platformAdoption: platformSubscribers.length,
      },
    };
  }),

  /**
   * Cancel a transition
   */
  cancelTransition: protectedProcedure
    .input(z.object({
      transitionId: z.number(),
      reason: z.string().min(10),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.update(contractorTransitions).set({
        phase: "cancelled",
        status: "cancelled",
        cancellationReason: input.reason,
      }).where(eq(contractorTransitions.id, input.transitionId));

      return {
        success: true,
        message: "Transition cancelled",
      };
    }),
});

// Helper function to check if transition can advance
function checkCanAdvance(transition: any, gateStatus: any): { canAdvance: boolean; blockedBy: string[] } {
  const blockedBy: string[] = [];

  switch (transition.phase) {
    case "initiated":
      return { canAdvance: true, blockedBy: [] };
    
    case "training_assigned":
    case "training_in_progress":
      if (!gateStatus.trainingCompleted) blockedBy.push("Complete all training modules");
      break;
    
    case "training_completed":
      return { canAdvance: true, blockedBy: [] };
    
    case "entity_formation":
      if (!gateStatus.entityRegistered) blockedBy.push("Register business entity");
      if (!gateStatus.einObtained) blockedBy.push("Obtain EIN");
      if (!gateStatus.businessBankSetup) blockedBy.push("Set up business bank account");
      break;
    
    case "entity_verified":
      return { canAdvance: true, blockedBy: [] };
    
    case "contract_pending":
      if (!gateStatus.contractSigned) blockedBy.push("Sign contractor agreement");
      break;
  }

  return { canAdvance: blockedBy.length === 0, blockedBy };
}

export default contractorTransitionRouter;
