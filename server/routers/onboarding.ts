import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  onboardingChecklists, 
  onboardingChecklistItems, 
  employeeOnboarding, 
  onboardingTaskProgress,
  employees,
  jobApplications,
  businessEntities
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const onboardingRouter = router({
  /**
   * Get all onboarding checklists
   */
  getChecklists: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const checklists = await db.select()
      .from(onboardingChecklists)
      .orderBy(desc(onboardingChecklists.createdAt));

    // Get item counts for each checklist
    const result = await Promise.all(checklists.map(async (checklist) => {
      const items = await db.select()
        .from(onboardingChecklistItems)
        .where(eq(onboardingChecklistItems.checklistId, checklist.id));
      
      return {
        ...checklist,
        itemCount: items.length
      };
    }));

    return result;
  }),

  /**
   * Get a single checklist with its items
   */
  getChecklistById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const checklist = await db.select()
        .from(onboardingChecklists)
        .where(eq(onboardingChecklists.id, input.id))
        .limit(1);

      if (!checklist.length) return null;

      const items = await db.select()
        .from(onboardingChecklistItems)
        .where(eq(onboardingChecklistItems.checklistId, input.id))
        .orderBy(onboardingChecklistItems.sortOrder);

      return {
        ...checklist[0],
        items
      };
    }),

  /**
   * Create a new onboarding checklist
   */
  createChecklist: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      department: z.string().max(100).optional(),
      positionLevel: z.enum(["executive", "manager", "lead", "coordinator", "specialist", "intern"]).optional(),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(onboardingChecklists).values({
        name: input.name,
        description: input.description,
        department: input.department,
        positionLevel: input.positionLevel,
        isDefault: input.isDefault || false,
      });

      return { success: true, id: result[0].insertId, message: "Checklist created successfully" };
    }),

  /**
   * Add item to checklist
   */
  addChecklistItem: protectedProcedure
    .input(z.object({
      checklistId: z.number(),
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      category: z.enum(["documentation", "equipment", "access", "training", "introduction", "compliance", "benefits", "other"]).optional(),
      dueWithinDays: z.number().min(0).optional(),
      assignedTo: z.enum(["employee", "manager", "hr", "it", "finance"]).optional(),
      isRequired: z.boolean().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(onboardingChecklistItems).values({
        checklistId: input.checklistId,
        title: input.title,
        description: input.description,
        category: input.category || "other",
        dueWithinDays: input.dueWithinDays || 7,
        assignedTo: input.assignedTo || "employee",
        isRequired: input.isRequired ?? true,
        sortOrder: input.sortOrder || 0,
      });

      return { success: true, id: result[0].insertId, message: "Item added to checklist" };
    }),

  /**
   * Get all employee onboarding records
   */
  getAllOnboarding: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const results = await db.select({
      onboarding: employeeOnboarding,
      employee: {
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        department: employees.department,
        jobTitle: employees.jobTitle,
        entityId: employees.entityId,
      },
      checklist: {
        id: onboardingChecklists.id,
        name: onboardingChecklists.name,
      },
      entity: {
        id: businessEntities.id,
        name: businessEntities.name,
      }
    })
    .from(employeeOnboarding)
    .leftJoin(employees, eq(employeeOnboarding.employeeId, employees.id))
    .leftJoin(onboardingChecklists, eq(employeeOnboarding.checklistId, onboardingChecklists.id))
    .leftJoin(businessEntities, eq(employees.entityId, businessEntities.id))
    .orderBy(desc(employeeOnboarding.createdAt));

    // Get task progress for each onboarding
    const enrichedResults = await Promise.all(results.map(async (r) => {
      const tasks = await db.select()
        .from(onboardingTaskProgress)
        .where(eq(onboardingTaskProgress.onboardingId, r.onboarding.id));
      
      const completedTasks = tasks.filter(t => t.status === "completed").length;
      const totalTasks = tasks.length;

      return {
        ...r.onboarding,
        employee: r.employee,
        checklist: r.checklist,
        entityName: r.entity?.name || "Unknown",
        completedTasks,
        totalTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      };
    }));

    return enrichedResults;
  }),

  /**
   * Get onboarding details by ID
   */
  getOnboardingById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const results = await db.select({
        onboarding: employeeOnboarding,
        employee: employees,
        checklist: onboardingChecklists,
        entity: {
          id: businessEntities.id,
          name: businessEntities.name,
        }
      })
      .from(employeeOnboarding)
      .leftJoin(employees, eq(employeeOnboarding.employeeId, employees.id))
      .leftJoin(onboardingChecklists, eq(employeeOnboarding.checklistId, onboardingChecklists.id))
      .leftJoin(businessEntities, eq(employees.entityId, businessEntities.id))
      .where(eq(employeeOnboarding.id, input.id))
      .limit(1);

      if (!results.length) return null;

      const r = results[0];

      // Get all tasks with their progress
      const taskProgress = await db.select()
        .from(onboardingTaskProgress)
        .where(eq(onboardingTaskProgress.onboardingId, input.id));

      // Get checklist items
      const checklistItems = await db.select()
        .from(onboardingChecklistItems)
        .where(eq(onboardingChecklistItems.checklistId, r.checklist?.id || 0))
        .orderBy(onboardingChecklistItems.sortOrder);

      // Merge items with progress
      const tasks = checklistItems.map(item => {
        const progress = taskProgress.find(p => p.checklistItemId === item.id);
        return {
          ...item,
          progress: progress || null
        };
      });

      return {
        ...r.onboarding,
        employee: r.employee,
        checklist: r.checklist,
        entityName: r.entity?.name || "Unknown",
        tasks
      };
    }),

  /**
   * Start onboarding for a hired applicant
   */
  startOnboardingFromApplication: protectedProcedure
    .input(z.object({
      applicationId: z.number(),
      checklistId: z.number(),
      startDate: z.date().optional(),
      assignedHrId: z.number().optional(),
      assignedManagerId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get the application
      const application = await db.select()
        .from(jobApplications)
        .where(eq(jobApplications.id, input.applicationId))
        .limit(1);

      if (!application.length) {
        throw new Error("Application not found");
      }

      const app = application[0];

      if (app.status !== "hired") {
        throw new Error("Application must be in 'hired' status to start onboarding");
      }

      // Get entity ID from position
      const entityName = app.entity;
      const entities = await db.select()
        .from(businessEntities)
        .where(eq(businessEntities.name, entityName))
        .limit(1);

      const entityId = entities.length > 0 ? entities[0].id : 5; // Default to The The L.A.W.S. Collective

      // Create employee record
      const employeeResult = await db.insert(employees).values({
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        phone: app.phone || null,
        entityId: entityId,
        department: getDepartmentFromPosition(app.positionTitle),
        jobTitle: app.positionTitle,
        positionLevel: getPositionLevel(app.positionTitle),
        employmentType: "full_time",
        workLocation: "remote",
        startDate: input.startDate || new Date(),
        status: "pending",
      });

      const employeeId = employeeResult[0].insertId;

      // Get checklist items
      const checklistItems = await db.select()
        .from(onboardingChecklistItems)
        .where(eq(onboardingChecklistItems.checklistId, input.checklistId));

      // Calculate target completion date (30 days from start)
      const startDate = input.startDate || new Date();
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + 30);

      // Create onboarding record
      const onboardingResult = await db.insert(employeeOnboarding).values({
        employeeId: employeeId,
        applicationId: input.applicationId,
        checklistId: input.checklistId,
        status: "in_progress",
        startDate: startDate,
        targetCompletionDate: targetDate,
        assignedHrId: input.assignedHrId,
        assignedManagerId: input.assignedManagerId,
      });

      const onboardingId = onboardingResult[0].insertId;

      // Create task progress records for each checklist item
      for (const item of checklistItems) {
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + item.dueWithinDays);

        await db.insert(onboardingTaskProgress).values({
          onboardingId: onboardingId,
          checklistItemId: item.id,
          status: "pending",
          dueDate: dueDate,
        });
      }

      return {
        success: true,
        employeeId,
        onboardingId,
        message: `Onboarding started for ${app.firstName} ${app.lastName}`
      };
    }),

  /**
   * Update task progress
   */
  updateTaskProgress: protectedProcedure
    .input(z.object({
      taskProgressId: z.number(),
      status: z.enum(["pending", "in_progress", "completed", "skipped", "blocked"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const updateData: any = {
        status: input.status,
        notes: input.notes,
      };

      if (input.status === "completed") {
        updateData.completedAt = new Date();
        updateData.completedBy = ctx.user.id;
      }

      await db.update(onboardingTaskProgress)
        .set(updateData)
        .where(eq(onboardingTaskProgress.id, input.taskProgressId));

      // Check if all tasks are complete
      const progress = await db.select()
        .from(onboardingTaskProgress)
        .where(eq(onboardingTaskProgress.id, input.taskProgressId))
        .limit(1);

      if (progress.length) {
        const onboardingId = progress[0].onboardingId;
        const allTasks = await db.select()
          .from(onboardingTaskProgress)
          .where(eq(onboardingTaskProgress.onboardingId, onboardingId));

        const allComplete = allTasks.every(t => 
          t.status === "completed" || t.status === "skipped"
        );

        if (allComplete) {
          // Update onboarding status to completed
          await db.update(employeeOnboarding)
            .set({ 
              status: "completed",
              actualCompletionDate: new Date()
            })
            .where(eq(employeeOnboarding.id, onboardingId));

          // Update employee status to active
          const onboarding = await db.select()
            .from(employeeOnboarding)
            .where(eq(employeeOnboarding.id, onboardingId))
            .limit(1);

          if (onboarding.length) {
            await db.update(employees)
              .set({ status: "active" })
              .where(eq(employees.id, onboarding[0].employeeId));
          }
        }
      }

      return { success: true, message: "Task progress updated" };
    }),

  /**
   * Get hired applications ready for onboarding
   */
  getHiredApplications: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    // Get hired applications that don't have onboarding started
    const hiredApps = await db.select()
      .from(jobApplications)
      .where(eq(jobApplications.status, "hired"));

    // Filter out those that already have onboarding
    const existingOnboarding = await db.select({ applicationId: employeeOnboarding.applicationId })
      .from(employeeOnboarding)
      .where(sql`${employeeOnboarding.applicationId} IS NOT NULL`);

    const existingAppIds = new Set(existingOnboarding.map(o => o.applicationId));

    return hiredApps.filter(app => !existingAppIds.has(app.id));
  }),

  /**
   * Get default checklist for a position
   */
  getDefaultChecklist: protectedProcedure
    .input(z.object({
      department: z.string().optional(),
      positionLevel: z.enum(["executive", "manager", "lead", "coordinator", "specialist", "intern"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      // Try to find a matching checklist
      let checklist = null;

      if (input.department && input.positionLevel) {
        const result = await db.select()
          .from(onboardingChecklists)
          .where(and(
            eq(onboardingChecklists.department, input.department),
            eq(onboardingChecklists.positionLevel, input.positionLevel)
          ))
          .limit(1);
        if (result.length) checklist = result[0];
      }

      // Fall back to default
      if (!checklist) {
        const result = await db.select()
          .from(onboardingChecklists)
          .where(eq(onboardingChecklists.isDefault, true))
          .limit(1);
        if (result.length) checklist = result[0];
      }

      // Fall back to any checklist
      if (!checklist) {
        const result = await db.select()
          .from(onboardingChecklists)
          .limit(1);
        if (result.length) checklist = result[0];
      }

      return checklist;
    }),

  /**
   * Get onboarding stats
   */
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, inProgress: 0, completed: 0, onHold: 0 };

    const all = await db.select().from(employeeOnboarding);

    return {
      total: all.length,
      inProgress: all.filter(o => o.status === "in_progress").length,
      completed: all.filter(o => o.status === "completed").length,
      onHold: all.filter(o => o.status === "on_hold").length,
    };
  }),
});

// Helper function to determine department from position title
function getDepartmentFromPosition(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("hr") || titleLower.includes("human resource")) return "Human Resources";
  if (titleLower.includes("finance") || titleLower.includes("cfo") || titleLower.includes("bookkeeper") || titleLower.includes("grant writer")) return "Finance";
  if (titleLower.includes("education") || titleLower.includes("academy") || titleLower.includes("curriculum")) return "Education";
  if (titleLower.includes("media") || titleLower.includes("content")) return "Media";
  if (titleLower.includes("design")) return "Design";
  if (titleLower.includes("technology") || titleLower.includes("platform") || titleLower.includes("developer") || titleLower.includes("software")) return "Technology";
  if (titleLower.includes("operations")) return "Operations";
  if (titleLower.includes("legal") || titleLower.includes("contract")) return "Legal";
  if (titleLower.includes("qa") || titleLower.includes("quality")) return "Quality Assurance";
  if (titleLower.includes("ceo") || titleLower.includes("coo") || titleLower.includes("executive")) return "Executive";
  return "Operations";
}

// Helper function to determine position level from title
function getPositionLevel(title: string): "executive" | "manager" | "lead" | "coordinator" | "specialist" | "intern" {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("ceo") || titleLower.includes("cfo") || titleLower.includes("coo") || titleLower.includes("chief")) return "executive";
  if (titleLower.includes("manager") || titleLower.includes("director")) return "manager";
  if (titleLower.includes("lead")) return "lead";
  if (titleLower.includes("coordinator")) return "coordinator";
  if (titleLower.includes("intern")) return "intern";
  return "specialist";
}
