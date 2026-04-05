import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  complianceTasks,
  houses,
  positionHolders,
  employmentDocuments,
} from "../../drizzle/schema";
import { eq, and, desc, sql, gte, lte, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createComplianceTask,
  calculateTaskStatus,
  getFederalFilingDeadlines,
  getStateAnnualReportDeadline,
  generateComplianceCalendar,
  getUpcomingTasksSummary,
  generateNextOccurrence,
  getTaskTypes,
  getReminderConfig,
  checkDocumentExpiration,
  generateI9ReverificationTasks,
  type ComplianceTaskType,
  type RecurrencePattern,
} from "../services/compliance-tracking";

export const complianceTrackingRouter = router({
  // ============================================
  // TASK MANAGEMENT
  // ============================================

  /**
   * Create a new compliance task
   */
  createTask: protectedProcedure
    .input(
      z.object({
        businessEntityId: z.number().optional(),
        positionHolderId: z.number().optional(),
        taskType: z.enum([
          "payroll_tax_deposit",
          "quarterly_941",
          "annual_940",
          "w2_filing",
          "1099_filing",
          "k1_filing",
          "state_tax_deposit",
          "state_quarterly",
          "annual_report",
          "business_license",
          "i9_reverification",
          "workers_comp_audit",
          "benefits_enrollment",
          "performance_review",
          "custom",
        ]),
        taskName: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.string(),
        reminderDate: z.string().optional(),
        isRecurring: z.boolean().default(false),
        recurrencePattern: z
          .enum(["weekly", "biweekly", "monthly", "quarterly", "annually"])
          .optional(),
        assignedToUserId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const [userHouse] = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, ctx.user.id))
        .limit(1);
      const houseId = userHouse?.id || 1;

      const task = createComplianceTask(
        houseId,
        input.taskType as ComplianceTaskType,
        input.taskName,
        input.description || "",
        new Date(input.dueDate),
        {
          businessEntityId: input.businessEntityId,
          positionHolderId: input.positionHolderId,
          isRecurring: input.isRecurring,
          recurrencePattern: input.recurrencePattern as RecurrencePattern,
          assignedToUserId: input.assignedToUserId,
        }
      );

      const [result] = await db.insert(complianceTasks).values({
        businessEntityId: input.businessEntityId,
        houseId,
        positionHolderId: input.positionHolderId,
        taskType: input.taskType,
        taskName: input.taskName,
        description: input.description,
        dueDate: new Date(input.dueDate),
        reminderDate: input.reminderDate ? new Date(input.reminderDate) : task.reminderDate,
        isRecurring: input.isRecurring,
        recurrencePattern: input.recurrencePattern,
        assignedToUserId: input.assignedToUserId,
        status: "upcoming",
      });

      return { success: true, taskId: result.insertId };
    }),

  /**
   * Get all tasks for the house
   */
  getTasks: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["upcoming", "due_soon", "overdue", "completed", "skipped", "all"])
          .default("all"),
        businessEntityId: z.number().optional(),
        taskType: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const [userHouse] = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, ctx.user.id))
        .limit(1);
      const houseId = userHouse?.id || 1;

      let query = db.select().from(complianceTasks).where(eq(complianceTasks.houseId, houseId));

      // Build conditions array
      const conditions = [eq(complianceTasks.houseId, houseId)];

      if (input.status !== "all") {
        conditions.push(eq(complianceTasks.status, input.status));
      }

      if (input.businessEntityId) {
        conditions.push(eq(complianceTasks.businessEntityId, input.businessEntityId));
      }

      if (input.startDate) {
        conditions.push(gte(complianceTasks.dueDate, new Date(input.startDate)));
      }

      if (input.endDate) {
        conditions.push(lte(complianceTasks.dueDate, new Date(input.endDate)));
      }

      const tasks = await db
        .select()
        .from(complianceTasks)
        .where(and(...conditions))
        .orderBy(complianceTasks.dueDate)
        .limit(input.limit);

      // Update statuses based on current date
      const now = new Date();
      const updatedTasks = tasks.map((task) => {
        if (task.status === "completed" || task.status === "skipped") {
          return task;
        }
        const newStatus = calculateTaskStatus(task.dueDate, task.completedAt || undefined);
        return { ...task, status: newStatus };
      });

      return { tasks: updatedTasks };
    }),

  /**
   * Get task by ID
   */
  getTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const [task] = await db
        .select()
        .from(complianceTasks)
        .where(eq(complianceTasks.id, input.taskId))
        .limit(1);

      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      const reminderConfig = getReminderConfig(task.taskType as ComplianceTaskType);

      return { task, reminderConfig };
    }),

  /**
   * Update a task
   */
  updateTask: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        taskName: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        reminderDate: z.string().optional(),
        assignedToUserId: z.number().optional(),
        status: z
          .enum(["upcoming", "due_soon", "overdue", "completed", "skipped"])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const { taskId, dueDate, reminderDate, ...rest } = input;

      await db
        .update(complianceTasks)
        .set({
          ...rest,
          ...(dueDate && { dueDate: new Date(dueDate) }),
          ...(reminderDate && { reminderDate: new Date(reminderDate) }),
        })
        .where(eq(complianceTasks.id, taskId));

      return { success: true };
    }),

  /**
   * Complete a task
   */
  completeTask: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        completionNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const [task] = await db
        .select()
        .from(complianceTasks)
        .where(eq(complianceTasks.id, input.taskId))
        .limit(1);

      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      await db
        .update(complianceTasks)
        .set({
          status: "completed",
          completedAt: new Date(),
          completedByUserId: ctx.user.id,
          completionNotes: input.completionNotes,
        })
        .where(eq(complianceTasks.id, input.taskId));

      // If recurring, create next occurrence
      if (task.isRecurring && task.recurrencePattern) {
        const nextTask = generateNextOccurrence({
          taskId: task.id.toString(),
          houseId: task.houseId,
          businessEntityId: task.businessEntityId || undefined,
          positionHolderId: task.positionHolderId || undefined,
          taskType: task.taskType as ComplianceTaskType,
          taskName: task.taskName,
          description: task.description || "",
          dueDate: task.dueDate,
          reminderDate: task.reminderDate || undefined,
          isRecurring: task.isRecurring || false,
          recurrencePattern: task.recurrencePattern as RecurrencePattern,
          assignedToUserId: task.assignedToUserId || undefined,
          status: "upcoming",
        });

        if (nextTask) {
          await db.insert(complianceTasks).values({
            businessEntityId: task.businessEntityId,
            houseId: task.houseId,
            positionHolderId: task.positionHolderId,
            taskType: task.taskType,
            taskName: task.taskName,
            description: task.description,
            dueDate: nextTask.dueDate,
            reminderDate: nextTask.reminderDate,
            isRecurring: task.isRecurring,
            recurrencePattern: task.recurrencePattern,
            assignedToUserId: task.assignedToUserId,
            status: "upcoming",
          });
        }
      }

      return { success: true, message: "Task completed" };
    }),

  /**
   * Skip a task
   */
  skipTask: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      await db
        .update(complianceTasks)
        .set({
          status: "skipped",
          completionNotes: `Skipped: ${input.reason}`,
        })
        .where(eq(complianceTasks.id, input.taskId));

      return { success: true };
    }),

  /**
   * Delete a task
   */
  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      await db.delete(complianceTasks).where(eq(complianceTasks.id, input.taskId));

      return { success: true };
    }),

  // ============================================
  // CALENDAR & DEADLINES
  // ============================================

  /**
   * Get compliance calendar for a month
   */
  getCalendar: protectedProcedure
    .input(
      z.object({
        month: z.number().min(0).max(11),
        year: z.number(),
        state: z.string().optional(),
        formationDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const [userHouse] = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, ctx.user.id))
        .limit(1);
      const houseId = userHouse?.id || 1;

      // Get tasks for the month
      const monthStart = new Date(input.year, input.month, 1);
      const monthEnd = new Date(input.year, input.month + 1, 0);

      const tasks = await db
        .select()
        .from(complianceTasks)
        .where(
          and(
            eq(complianceTasks.houseId, houseId),
            gte(complianceTasks.dueDate, monthStart),
            lte(complianceTasks.dueDate, monthEnd)
          )
        )
        .orderBy(complianceTasks.dueDate);

      // Get federal deadlines
      const federalDeadlines = getFederalFilingDeadlines(input.year).filter((d) => {
        const date = new Date(d.dueDate);
        return date >= monthStart && date <= monthEnd;
      });

      // Get state annual report deadline if applicable
      let stateDeadline = null;
      if (input.state && input.formationDate) {
        stateDeadline = getStateAnnualReportDeadline(
          input.state,
          new Date(input.formationDate),
          input.year
        );
        if (stateDeadline) {
          const deadlineDate = new Date(stateDeadline.dueDate);
          if (deadlineDate < monthStart || deadlineDate > monthEnd) {
            stateDeadline = null;
          }
        }
      }

      // Get document expirations for employees
      const holders = await db
        .select()
        .from(positionHolders)
        .where(eq(positionHolders.status, "active"));

      const documentExpirations = holders
        .filter((h) => h.workAuthorizationExpiration)
        .map((h) => {
          const expDate = h.workAuthorizationExpiration!;
          if (expDate >= monthStart && expDate <= monthEnd) {
            return checkDocumentExpiration(
              `doc-${h.id}`,
              "work_authorization",
              "Work Authorization",
              h.fullName,
              h.id,
              expDate
            );
          }
          return null;
        })
        .filter(Boolean);

      return {
        month: input.month,
        year: input.year,
        tasks: tasks.map((t) => ({
          ...t,
          status: calculateTaskStatus(t.dueDate, t.completedAt || undefined),
        })),
        federalDeadlines,
        stateDeadline,
        documentExpirations,
      };
    }),

  /**
   * Get federal filing deadlines for a year
   */
  getFederalDeadlines: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(({ input }) => {
      return { deadlines: getFederalFilingDeadlines(input.year) };
    }),

  /**
   * Get state annual report deadline
   */
  getStateDeadline: protectedProcedure
    .input(
      z.object({
        state: z.string(),
        formationDate: z.string(),
        year: z.number(),
      })
    )
    .query(({ input }) => {
      const deadline = getStateAnnualReportDeadline(
        input.state,
        new Date(input.formationDate),
        input.year
      );
      return { deadline };
    }),

  // ============================================
  // DASHBOARD & SUMMARY
  // ============================================

  /**
   * Get compliance dashboard summary
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    const [userHouse] = await db
      .select()
      .from(houses)
      .where(eq(houses.ownerUserId, ctx.user.id))
      .limit(1);
    const houseId = userHouse?.id || 1;

    // Get all non-completed tasks
    const tasks = await db
      .select()
      .from(complianceTasks)
      .where(
        and(
          eq(complianceTasks.houseId, houseId),
          or(
            eq(complianceTasks.status, "upcoming"),
            eq(complianceTasks.status, "due_soon"),
            eq(complianceTasks.status, "overdue")
          )
        )
      )
      .orderBy(complianceTasks.dueDate);

    // Update statuses
    const updatedTasks = tasks.map((t) => ({
      ...t,
      status: calculateTaskStatus(t.dueDate, t.completedAt || undefined),
    }));

    const overdue = updatedTasks.filter((t) => t.status === "overdue");
    const dueSoon = updatedTasks.filter((t) => t.status === "due_soon");
    const upcoming = updatedTasks.filter((t) => t.status === "upcoming");

    // Get upcoming federal deadlines (next 90 days)
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;

    const allDeadlines = [
      ...getFederalFilingDeadlines(currentYear),
      ...getFederalFilingDeadlines(nextYear),
    ];

    const upcomingDeadlines = allDeadlines.filter((d) => {
      const date = new Date(d.dueDate);
      return date >= now && date <= ninetyDaysFromNow;
    });

    // Get document expirations
    const holders = await db
      .select()
      .from(positionHolders)
      .where(eq(positionHolders.status, "active"));

    const expiringDocuments = holders
      .filter((h) => {
        if (!h.workAuthorizationExpiration) return false;
        const expDate = new Date(h.workAuthorizationExpiration);
        return expDate <= ninetyDaysFromNow;
      })
      .map((h) =>
        checkDocumentExpiration(
          `doc-${h.id}`,
          "work_authorization",
          "Work Authorization",
          h.fullName,
          h.id,
          h.workAuthorizationExpiration!
        )
      );

    return {
      summary: {
        overdueCount: overdue.length,
        dueSoonCount: dueSoon.length,
        upcomingCount: upcoming.length,
        totalPending: updatedTasks.length,
        expiringDocumentsCount: expiringDocuments.length,
      },
      overdueTasks: overdue.slice(0, 5),
      dueSoonTasks: dueSoon.slice(0, 5),
      upcomingDeadlines: upcomingDeadlines.slice(0, 5),
      expiringDocuments: expiringDocuments.slice(0, 5),
    };
  }),

  /**
   * Get task types
   */
  getTaskTypes: protectedProcedure.query(() => {
    return { taskTypes: getTaskTypes() };
  }),

  // ============================================
  // AUTOMATED TASK GENERATION
  // ============================================

  /**
   * Generate I-9 reverification tasks for employees with expiring work authorization
   */
  generateI9Tasks: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    const [userHouse] = await db
      .select()
      .from(houses)
      .where(eq(houses.ownerUserId, ctx.user.id))
      .limit(1);
    const houseId = userHouse?.id || 1;

    // Get employees with work authorization expiration dates
    const holders = await db
      .select()
      .from(positionHolders)
      .where(eq(positionHolders.status, "active"));

    const employeesWithExpiration = holders
      .filter((h) => h.workAuthorizationExpiration)
      .map((h) => ({
        positionHolderId: h.id,
        employeeName: h.fullName,
        workAuthorizationExpiration: h.workAuthorizationExpiration!,
      }));

    const tasks = generateI9ReverificationTasks(houseId, employeesWithExpiration);

    // Check for existing tasks to avoid duplicates
    let createdCount = 0;
    for (const task of tasks) {
      const existing = await db
        .select()
        .from(complianceTasks)
        .where(
          and(
            eq(complianceTasks.houseId, houseId),
            eq(complianceTasks.taskType, "i9_reverification"),
            eq(complianceTasks.positionHolderId, task.positionHolderId!),
            eq(complianceTasks.status, "upcoming")
          )
        )
        .limit(1);

      if (!existing.length) {
        await db.insert(complianceTasks).values({
          houseId,
          positionHolderId: task.positionHolderId,
          taskType: task.taskType,
          taskName: task.taskName,
          description: task.description,
          dueDate: task.dueDate,
          reminderDate: task.reminderDate,
          isRecurring: false,
          status: "upcoming",
        });
        createdCount++;
      }
    }

    return {
      success: true,
      tasksCreated: createdCount,
      message: `Created ${createdCount} I-9 reverification tasks`,
    };
  }),

  /**
   * Generate annual compliance tasks for a year
   */
  generateAnnualTasks: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        state: z.string().optional(),
        formationDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const [userHouse] = await db
        .select()
        .from(houses)
        .where(eq(houses.ownerUserId, ctx.user.id))
        .limit(1);
      const houseId = userHouse?.id || 1;

      const deadlines = getFederalFilingDeadlines(input.year);
      let createdCount = 0;

      for (const deadline of deadlines) {
        // Check if task already exists
        const existing = await db
          .select()
          .from(complianceTasks)
          .where(
            and(
              eq(complianceTasks.houseId, houseId),
              eq(complianceTasks.taskType, deadline.taskType),
              eq(complianceTasks.taskName, deadline.name)
            )
          )
          .limit(1);

        if (!existing.length) {
          const task = createComplianceTask(
            houseId,
            deadline.taskType,
            deadline.name,
            deadline.description,
            deadline.dueDate
          );

          await db.insert(complianceTasks).values({
            houseId,
            taskType: deadline.taskType,
            taskName: deadline.name,
            description: deadline.description,
            dueDate: deadline.dueDate,
            reminderDate: task.reminderDate,
            isRecurring: false,
            status: "upcoming",
          });
          createdCount++;
        }
      }

      // Add state annual report if applicable
      if (input.state && input.formationDate) {
        const stateDeadline = getStateAnnualReportDeadline(
          input.state,
          new Date(input.formationDate),
          input.year
        );

        if (stateDeadline) {
          const existing = await db
            .select()
            .from(complianceTasks)
            .where(
              and(
                eq(complianceTasks.houseId, houseId),
                eq(complianceTasks.taskType, "annual_report"),
                eq(complianceTasks.taskName, stateDeadline.name)
              )
            )
            .limit(1);

          if (!existing.length) {
            const task = createComplianceTask(
              houseId,
              stateDeadline.taskType,
              stateDeadline.name,
              stateDeadline.description,
              stateDeadline.dueDate
            );

            await db.insert(complianceTasks).values({
              houseId,
              taskType: stateDeadline.taskType,
              taskName: stateDeadline.name,
              description: stateDeadline.description,
              dueDate: stateDeadline.dueDate,
              reminderDate: task.reminderDate,
              isRecurring: false,
              status: "upcoming",
            });
            createdCount++;
          }
        }
      }

      return {
        success: true,
        tasksCreated: createdCount,
        message: `Created ${createdCount} compliance tasks for ${input.year}`,
      };
    }),
});

export default complianceTrackingRouter;
