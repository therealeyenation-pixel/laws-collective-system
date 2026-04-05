import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import * as onboardingOffboarding from '../services/onboarding-offboarding';

export const onboardingOffboardingRouter = router({
  // Onboarding Workflows
  createOnboarding: protectedProcedure
    .input(z.object({
      employeeId: z.string(),
      employeeName: z.string(),
      employeeEmail: z.string().email(),
      positionId: z.string(),
      positionTitle: z.string(),
      departmentId: z.string(),
      departmentName: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      hireDate: z.string().transform(s => new Date(s)),
      startDate: z.string().transform(s => new Date(s)),
      managerId: z.string().optional(),
      managerName: z.string().optional(),
      hrContactId: z.string().optional(),
      hrContactName: z.string().optional(),
      templateId: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.createOnboardingWorkflow(input);
    }),

  startOnboarding: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(({ input }) => {
      return onboardingOffboarding.startOnboardingWorkflow(input.workflowId);
    }),

  completeOnboardingTask: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      taskId: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(({ input, ctx }) => {
      return onboardingOffboarding.completeOnboardingTask(
        input.workflowId,
        input.taskId,
        ctx.user.id.toString(),
        input.notes
      );
    }),

  skipOnboardingTask: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      taskId: z.string(),
      reason: z.string(),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.skipOnboardingTask(input.workflowId, input.taskId, input.reason);
    }),

  runAutomatedOnboarding: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(({ input }) => {
      return onboardingOffboarding.runAutomatedOnboardingTasks(input.workflowId);
    }),

  getOnboarding: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(({ input }) => {
      return onboardingOffboarding.getOnboardingWorkflow(input.workflowId);
    }),

  listOnboardings: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
      entityId: z.string().optional(),
      departmentId: z.string().optional(),
    }).optional())
    .query(({ input }) => {
      return onboardingOffboarding.listOnboardingWorkflows(input);
    }),

  // Offboarding Workflows
  createOffboarding: protectedProcedure
    .input(z.object({
      employeeId: z.string(),
      employeeName: z.string(),
      employeeEmail: z.string().email(),
      positionId: z.string(),
      positionTitle: z.string(),
      departmentId: z.string(),
      departmentName: z.string(),
      entityId: z.string(),
      entityName: z.string(),
      terminationDate: z.string().transform(s => new Date(s)),
      lastWorkingDay: z.string().transform(s => new Date(s)),
      terminationType: z.enum(['resignation', 'termination', 'retirement', 'layoff', 'contract_end']),
      managerId: z.string().optional(),
      managerName: z.string().optional(),
      hrContactId: z.string().optional(),
      hrContactName: z.string().optional(),
      templateId: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.createOffboardingWorkflow(input);
    }),

  startOffboarding: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(({ input }) => {
      return onboardingOffboarding.startOffboardingWorkflow(input.workflowId);
    }),

  completeOffboardingTask: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      taskId: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(({ input, ctx }) => {
      return onboardingOffboarding.completeOffboardingTask(
        input.workflowId,
        input.taskId,
        ctx.user.id.toString(),
        input.notes
      );
    }),

  runAutomatedOffboarding: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(({ input }) => {
      return onboardingOffboarding.runAutomatedOffboardingTasks(input.workflowId);
    }),

  scheduleExitInterview: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      scheduledDate: z.string().transform(s => new Date(s)),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.scheduleExitInterview(input.workflowId, input.scheduledDate);
    }),

  completeExitInterview: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      notes: z.string(),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.completeExitInterview(input.workflowId, input.notes);
    }),

  getOffboarding: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(({ input }) => {
      return onboardingOffboarding.getOffboardingWorkflow(input.workflowId);
    }),

  listOffboardings: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
      entityId: z.string().optional(),
      departmentId: z.string().optional(),
      terminationType: z.enum(['resignation', 'termination', 'retirement', 'layoff', 'contract_end']).optional(),
    }).optional())
    .query(({ input }) => {
      return onboardingOffboarding.listOffboardingWorkflows(input);
    }),

  // Equipment Provisioning
  provisionEquipment: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      assetId: z.string(),
      assetTag: z.string(),
      assetName: z.string(),
      category: z.string(),
      condition: z.enum(['new', 'good', 'fair', 'needs_repair']),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.provisionEquipment(input.workflowId, {
        assetId: input.assetId,
        assetTag: input.assetTag,
        assetName: input.assetName,
        category: input.category,
        assignedDate: new Date(),
        condition: input.condition,
      });
    }),

  returnEquipment: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      assetId: z.string(),
      condition: z.enum(['new', 'good', 'fair', 'needs_repair']),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.returnEquipment(input.workflowId, input.assetId, input.condition);
    }),

  getEmployeeEquipment: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(({ input }) => {
      return onboardingOffboarding.getEmployeeEquipment(input.workflowId);
    }),

  // Software License Provisioning
  provisionLicense: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      licenseId: z.string(),
      softwareName: z.string(),
      seatId: z.string(),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.provisionSoftwareLicense(input.workflowId, {
        licenseId: input.licenseId,
        softwareName: input.softwareName,
        seatId: input.seatId,
        assignedDate: new Date(),
      });
    }),

  revokeLicense: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      licenseId: z.string(),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.revokeSoftwareLicense(input.workflowId, input.licenseId);
    }),

  getEmployeeLicenses: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(({ input }) => {
      return onboardingOffboarding.getEmployeeLicenses(input.workflowId);
    }),

  // Access Provisioning
  provisionAccess: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      accessId: z.string(),
      accessType: z.enum(['building', 'room', 'system', 'network', 'application']),
      resourceName: z.string(),
      accessLevel: z.enum(['read', 'write', 'admin', 'full']),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.provisionAccess(input.workflowId, {
        accessId: input.accessId,
        accessType: input.accessType,
        resourceName: input.resourceName,
        accessLevel: input.accessLevel,
        grantedDate: new Date(),
      });
    }),

  revokeAccess: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      accessId: z.string(),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.revokeAccess(input.workflowId, input.accessId);
    }),

  revokeAllAccess: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(({ input }) => {
      return onboardingOffboarding.revokeAllAccess(input.workflowId);
    }),

  getEmployeeAccess: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(({ input }) => {
      return onboardingOffboarding.getEmployeeAccess(input.workflowId);
    }),

  // Statistics
  getOnboardingStats: protectedProcedure
    .query(() => {
      return onboardingOffboarding.getOnboardingStats();
    }),

  getOffboardingStats: protectedProcedure
    .query(() => {
      return onboardingOffboarding.getOffboardingStats();
    }),

  // Templates
  createOnboardingTemplate: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      positionType: z.string(),
      departmentId: z.string().optional(),
      entityId: z.string().optional(),
      tasks: z.array(z.object({
        category: z.enum(['hr', 'it', 'property', 'finance', 'training', 'security', 'admin']),
        title: z.string(),
        description: z.string(),
        priority: z.enum(['critical', 'high', 'medium', 'low']),
        dependencies: z.array(z.string()),
        automatable: z.boolean(),
        order: z.number(),
      })),
      isDefault: z.boolean(),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.createOnboardingTemplate(input);
    }),

  createOffboardingTemplate: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      terminationType: z.enum(['resignation', 'termination', 'retirement', 'layoff', 'contract_end']),
      tasks: z.array(z.object({
        category: z.enum(['hr', 'it', 'property', 'finance', 'training', 'security', 'admin']),
        title: z.string(),
        description: z.string(),
        priority: z.enum(['critical', 'high', 'medium', 'low']),
        dependencies: z.array(z.string()),
        automatable: z.boolean(),
        order: z.number(),
      })),
      isDefault: z.boolean(),
    }))
    .mutation(({ input }) => {
      return onboardingOffboarding.createOffboardingTemplate(input);
    }),

  listOnboardingTemplates: protectedProcedure
    .query(() => {
      return onboardingOffboarding.listOnboardingTemplates();
    }),

  listOffboardingTemplates: protectedProcedure
    .query(() => {
      return onboardingOffboarding.listOffboardingTemplates();
    }),

  getDefaultOnboardingTasks: protectedProcedure
    .query(() => {
      return onboardingOffboarding.getDefaultOnboardingTasks();
    }),

  getDefaultOffboardingTasks: protectedProcedure
    .query(() => {
      return onboardingOffboarding.getDefaultOffboardingTasks();
    }),
});
