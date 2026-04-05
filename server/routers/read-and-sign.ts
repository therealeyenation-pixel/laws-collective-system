import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { 
  resourceLinks, 
  requiredReadings, 
  readingAcknowledgments,
  readingComplianceReports,
  employees 
} from "../../drizzle/schema";
import { eq, and, desc, sql, inArray, isNull, lt, gte } from "drizzle-orm";
import crypto from "crypto";

export const readAndSignRouter = router({
  // Create a required reading assignment
  createRequirement: protectedProcedure
    .input(z.object({
      resourceLinkId: z.number(),
      assignmentType: z.enum(["all_employees", "entity", "department", "role", "individual"]),
      scopeValue: z.string().optional(),
      scopeEmployeeIds: z.array(z.number()).optional(),
      dueDate: z.date().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      isRecurring: z.boolean().default(false),
      recurrenceInterval: z.enum(["monthly", "quarterly", "annually"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [requirement] = await db.insert(requiredReadings).values({
        resourceLinkId: input.resourceLinkId,
        assignmentType: input.assignmentType,
        scopeValue: input.scopeValue,
        scopeEmployeeIds: input.scopeEmployeeIds,
        dueDate: input.dueDate,
        priority: input.priority,
        isRecurring: input.isRecurring,
        recurrenceInterval: input.recurrenceInterval,
        createdBy: ctx.user.id,
      });
      
      return { success: true, id: requirement.insertId };
    }),

  // Get required readings for an employee
  getMyRequiredReadings: protectedProcedure
    .input(z.object({
      employeeId: z.number().optional(),
      includeCompleted: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      // Get employee info
      const employeeId = input.employeeId;
      
      if (!employeeId) {
        return [];
      }
      
      // Get employee details for scope matching
      const [employee] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, employeeId))
        .limit(1);
      
      if (!employee) {
        return [];
      }
      
      // Get all active required readings
      const allRequirements = await db
        .select({
          requirement: requiredReadings,
          resourceLink: resourceLinks,
        })
        .from(requiredReadings)
        .innerJoin(resourceLinks, eq(requiredReadings.resourceLinkId, resourceLinks.id))
        .where(eq(requiredReadings.isActive, true));
      
      // Filter requirements that apply to this employee
      const applicableRequirements = allRequirements.filter(({ requirement }) => {
        switch (requirement.assignmentType) {
          case "all_employees":
            return true;
          case "entity":
            return employee.entity === requirement.scopeValue;
          case "department":
            return employee.department === requirement.scopeValue;
          case "role":
            return employee.position === requirement.scopeValue;
          case "individual":
            const ids = requirement.scopeEmployeeIds as number[] | null;
            return ids?.includes(employeeId);
          default:
            return false;
        }
      });
      
      // Get acknowledgments for this employee
      const acknowledgments = await db
        .select()
        .from(readingAcknowledgments)
        .where(eq(readingAcknowledgments.employeeId, employeeId));
      
      const acknowledgedIds = new Set(acknowledgments.map(a => a.requiredReadingId));
      
      // Combine data
      const result = applicableRequirements.map(({ requirement, resourceLink }) => ({
        ...requirement,
        resourceLink,
        isCompleted: acknowledgedIds.has(requirement.id),
        acknowledgment: acknowledgments.find(a => a.requiredReadingId === requirement.id),
        isOverdue: requirement.dueDate && new Date(requirement.dueDate) < new Date() && !acknowledgedIds.has(requirement.id),
      }));
      
      if (!input.includeCompleted) {
        return result.filter(r => !r.isCompleted);
      }
      
      return result;
    }),

  // Acknowledge/sign a required reading
  acknowledge: protectedProcedure
    .input(z.object({
      requiredReadingId: z.number(),
      employeeId: z.number(),
      signatureType: z.enum(["checkbox", "typed_name", "drawn", "digital_certificate"]).default("checkbox"),
      signatureData: z.string().optional(),
      confirmationText: z.string().optional(),
      timeSpentSeconds: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get the required reading
      const [requirement] = await db
        .select()
        .from(requiredReadings)
        .where(eq(requiredReadings.id, input.requiredReadingId))
        .limit(1);
      
      if (!requirement) {
        throw new Error("Required reading not found");
      }
      
      // Check if already acknowledged
      const [existing] = await db
        .select()
        .from(readingAcknowledgments)
        .where(and(
          eq(readingAcknowledgments.requiredReadingId, input.requiredReadingId),
          eq(readingAcknowledgments.employeeId, input.employeeId)
        ))
        .limit(1);
      
      if (existing) {
        throw new Error("Already acknowledged this reading");
      }
      
      // Generate signature hash
      const signatureContent = `${input.employeeId}-${input.requiredReadingId}-${input.signatureData || "checkbox"}-${new Date().toISOString()}`;
      const signatureHash = crypto.createHash("sha256").update(signatureContent).digest("hex");
      
      // Create acknowledgment
      const [acknowledgment] = await db.insert(readingAcknowledgments).values({
        requiredReadingId: input.requiredReadingId,
        resourceLinkId: requirement.resourceLinkId,
        employeeId: input.employeeId,
        userId: ctx.user.id,
        acknowledgedAt: new Date(),
        signatureType: input.signatureType,
        signatureData: input.signatureData,
        signatureHash,
        confirmationText: input.confirmationText || "I have read and understand the contents of this document.",
        timeSpentSeconds: input.timeSpentSeconds,
      });
      
      return { success: true, id: acknowledgment.insertId, signatureHash };
    }),

  // Get compliance status for a requirement
  getComplianceStatus: protectedProcedure
    .input(z.object({
      requiredReadingId: z.number(),
    }))
    .query(async ({ input }) => {
      const [requirement] = await db
        .select()
        .from(requiredReadings)
        .where(eq(requiredReadings.id, input.requiredReadingId))
        .limit(1);
      
      if (!requirement) {
        throw new Error("Required reading not found");
      }
      
      // Get all applicable employees based on scope
      let applicableEmployees: any[] = [];
      
      switch (requirement.assignmentType) {
        case "all_employees":
          applicableEmployees = await db.select().from(employees).where(eq(employees.status, "active"));
          break;
        case "entity":
          applicableEmployees = await db.select().from(employees)
            .where(and(eq(employees.entity, requirement.scopeValue || ""), eq(employees.status, "active")));
          break;
        case "department":
          applicableEmployees = await db.select().from(employees)
            .where(and(eq(employees.department, requirement.scopeValue || ""), eq(employees.status, "active")));
          break;
        case "individual":
          const ids = requirement.scopeEmployeeIds as number[] | null;
          if (ids && ids.length > 0) {
            applicableEmployees = await db.select().from(employees)
              .where(inArray(employees.id, ids));
          }
          break;
      }
      
      // Get acknowledgments
      const acknowledgments = await db
        .select()
        .from(readingAcknowledgments)
        .where(eq(readingAcknowledgments.requiredReadingId, input.requiredReadingId));
      
      const acknowledgedEmployeeIds = new Set(acknowledgments.map(a => a.employeeId));
      
      const completed = applicableEmployees.filter(e => acknowledgedEmployeeIds.has(e.id));
      const pending = applicableEmployees.filter(e => !acknowledgedEmployeeIds.has(e.id));
      const overdue = requirement.dueDate && new Date(requirement.dueDate) < new Date() 
        ? pending 
        : [];
      
      return {
        requirement,
        totalAssigned: applicableEmployees.length,
        completedCount: completed.length,
        pendingCount: pending.length,
        overdueCount: overdue.length,
        complianceRate: applicableEmployees.length > 0 
          ? (completed.length / applicableEmployees.length * 100).toFixed(1)
          : "0",
        completedEmployees: completed.map(e => ({
          id: e.id,
          name: `${e.firstName} ${e.lastName}`,
          department: e.department,
          acknowledgedAt: acknowledgments.find(a => a.employeeId === e.id)?.acknowledgedAt,
        })),
        pendingEmployees: pending.map(e => ({
          id: e.id,
          name: `${e.firstName} ${e.lastName}`,
          department: e.department,
          isOverdue: overdue.some(o => o.id === e.id),
        })),
      };
    }),

  // Get all required readings (admin view)
  getAllRequirements: protectedProcedure
    .input(z.object({
      dashboard: z.string().optional(),
      includeInactive: z.boolean().default(false),
    }))
    .query(async ({ input }) => {
      const conditions = [];
      
      if (!input.includeInactive) {
        conditions.push(eq(requiredReadings.isActive, true));
      }
      
      const requirements = await db
        .select({
          requirement: requiredReadings,
          resourceLink: resourceLinks,
        })
        .from(requiredReadings)
        .innerJoin(resourceLinks, eq(requiredReadings.resourceLinkId, resourceLinks.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(requiredReadings.createdAt));
      
      // Get acknowledgment counts
      const result = await Promise.all(requirements.map(async ({ requirement, resourceLink }) => {
        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(readingAcknowledgments)
          .where(eq(readingAcknowledgments.requiredReadingId, requirement.id));
        
        return {
          ...requirement,
          resourceLink,
          acknowledgedCount: countResult?.count || 0,
        };
      }));
      
      return result;
    }),

  // Mark a resource link as requiring read-and-sign
  markAsRequired: protectedProcedure
    .input(z.object({
      resourceLinkId: z.number(),
      isRequired: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await db
        .update(resourceLinks)
        .set({ 
          // We'll add this field to resourceLinks schema
        })
        .where(eq(resourceLinks.id, input.resourceLinkId));
      
      return { success: true };
    }),

  // Get overdue readings for notifications
  getOverdueReadings: protectedProcedure
    .query(async () => {
      const now = new Date();
      
      const overdueRequirements = await db
        .select({
          requirement: requiredReadings,
          resourceLink: resourceLinks,
        })
        .from(requiredReadings)
        .innerJoin(resourceLinks, eq(requiredReadings.resourceLinkId, resourceLinks.id))
        .where(and(
          eq(requiredReadings.isActive, true),
          lt(requiredReadings.dueDate, now)
        ));
      
      return overdueRequirements;
    }),

  // Deactivate a requirement
  deactivateRequirement: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(requiredReadings)
        .set({ isActive: false })
        .where(eq(requiredReadings.id, input.id));
      
      return { success: true };
    }),

  // Get acknowledgment details
  getAcknowledgmentDetails: protectedProcedure
    .input(z.object({
      acknowledgmentId: z.number(),
    }))
    .query(async ({ input }) => {
      const [acknowledgment] = await db
        .select()
        .from(readingAcknowledgments)
        .where(eq(readingAcknowledgments.id, input.acknowledgmentId))
        .limit(1);
      
      if (!acknowledgment) {
        throw new Error("Acknowledgment not found");
      }
      
      // Get employee info
      const [employee] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, acknowledgment.employeeId))
        .limit(1);
      
      // Get resource link info
      const [resourceLink] = await db
        .select()
        .from(resourceLinks)
        .where(eq(resourceLinks.id, acknowledgment.resourceLinkId))
        .limit(1);
      
      return {
        ...acknowledgment,
        employee,
        resourceLink,
      };
    }),
});
