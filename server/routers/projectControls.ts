import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  projects,
  projectMilestones,
  projectTasks,
  projectBudgetItems,
  changeOrders,
  projectRisks,
  projectStatusReports,
} from "../../drizzle/schema";
import { eq, desc, and, sql, count, sum } from "drizzle-orm";

export const projectControlsRouter = router({
  // ============================================
  // PROJECTS
  // ============================================
  
  listProjects: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      entityId: z.number().optional(),
      projectType: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let query = db.select().from(projects);
      
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(projects.status, input.status));
      }
      if (input?.entityId) {
        conditions.push(eq(projects.entityId, input.entityId));
      }
      if (input?.projectType) {
        conditions.push(eq(projects.projectType, input.projectType));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }
      
      return query.orderBy(desc(projects.createdAt));
    }),

  getProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id));
      return project || null;
    }),

  createProject: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      code: z.string().min(1),
      description: z.string().optional(),
      entityId: z.number().optional(),
      projectType: z.string(),
      priority: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      budget: z.string().optional(),
      projectManagerId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(projects).values({
        name: input.name,
        code: input.code,
        description: input.description,
        entityId: input.entityId,
        projectType: input.projectType,
        priority: input.priority || "medium",
        startDate: input.startDate,
        endDate: input.endDate,
        budget: input.budget,
        projectManagerId: input.projectManagerId,
      });
      return { id: result.insertId, message: "Project created successfully" };
    }),

  updateProject: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      actualStartDate: z.date().optional(),
      actualEndDate: z.date().optional(),
      budget: z.string().optional(),
      actualCost: z.string().optional(),
      percentComplete: z.number().optional(),
      projectManagerId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updates } = input;
      await db.update(projects).set(updates).where(eq(projects.id, id));
      return { message: "Project updated successfully" };
    }),

  deleteProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(projects).where(eq(projects.id, input.id));
      return { message: "Project deleted successfully" };
    }),

  // ============================================
  // MILESTONES
  // ============================================

  listMilestones: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db
        .select()
        .from(projectMilestones)
        .where(eq(projectMilestones.projectId, input.projectId))
        .orderBy(projectMilestones.plannedDate);
    }),

  createMilestone: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
      plannedDate: z.date(),
      weight: z.number().optional(),
      deliverables: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(projectMilestones).values({
        projectId: input.projectId,
        name: input.name,
        description: input.description,
        plannedDate: input.plannedDate,
        weight: input.weight || 1,
        deliverables: input.deliverables,
      });
      return { id: result.insertId, message: "Milestone created successfully" };
    }),

  updateMilestone: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      plannedDate: z.date().optional(),
      actualDate: z.date().optional(),
      status: z.string().optional(),
      weight: z.number().optional(),
      deliverables: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updates } = input;
      await db.update(projectMilestones).set(updates).where(eq(projectMilestones.id, id));
      return { message: "Milestone updated successfully" };
    }),

  deleteMilestone: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(projectMilestones).where(eq(projectMilestones.id, input.id));
      return { message: "Milestone deleted successfully" };
    }),

  // ============================================
  // TASKS
  // ============================================

  listTasks: protectedProcedure
    .input(z.object({ 
      projectId: z.number(),
      milestoneId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const conditions = [eq(projectTasks.projectId, input.projectId)];
      if (input.milestoneId) {
        conditions.push(eq(projectTasks.milestoneId, input.milestoneId));
      }
      
      return db.select().from(projectTasks)
        .where(and(...conditions))
        .orderBy(projectTasks.plannedStart);
    }),

  createTask: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      milestoneId: z.number().optional(),
      parentTaskId: z.number().optional(),
      name: z.string().min(1),
      description: z.string().optional(),
      assigneeId: z.number().optional(),
      plannedStart: z.date().optional(),
      plannedEnd: z.date().optional(),
      duration: z.number().optional(),
      priority: z.string().optional(),
      dependencies: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(projectTasks).values({
        projectId: input.projectId,
        milestoneId: input.milestoneId,
        parentTaskId: input.parentTaskId,
        name: input.name,
        description: input.description,
        assigneeId: input.assigneeId,
        plannedStart: input.plannedStart,
        plannedEnd: input.plannedEnd,
        duration: input.duration,
        priority: input.priority || "medium",
        dependencies: input.dependencies,
      });
      return { id: result.insertId, message: "Task created successfully" };
    }),

  updateTask: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      assigneeId: z.number().optional(),
      plannedStart: z.date().optional(),
      plannedEnd: z.date().optional(),
      actualStart: z.date().optional(),
      actualEnd: z.date().optional(),
      duration: z.number().optional(),
      percentComplete: z.number().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      dependencies: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updates } = input;
      await db.update(projectTasks).set(updates).where(eq(projectTasks.id, id));
      return { message: "Task updated successfully" };
    }),

  deleteTask: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(projectTasks).where(eq(projectTasks.id, input.id));
      return { message: "Task deleted successfully" };
    }),

  // ============================================
  // BUDGET ITEMS
  // ============================================

  listBudgetItems: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db
        .select()
        .from(projectBudgetItems)
        .where(eq(projectBudgetItems.projectId, input.projectId))
        .orderBy(projectBudgetItems.category);
    }),

  createBudgetItem: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      category: z.string().min(1),
      description: z.string().min(1),
      plannedAmount: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(projectBudgetItems).values({
        projectId: input.projectId,
        category: input.category,
        description: input.description,
        plannedAmount: input.plannedAmount,
        notes: input.notes,
      });
      return { id: result.insertId, message: "Budget item created successfully" };
    }),

  updateBudgetItem: protectedProcedure
    .input(z.object({
      id: z.number(),
      category: z.string().optional(),
      description: z.string().optional(),
      plannedAmount: z.string().optional(),
      actualAmount: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updates } = input;
      
      // Calculate variance if both planned and actual are provided
      if (updates.plannedAmount && updates.actualAmount) {
        const planned = parseFloat(updates.plannedAmount);
        const actual = parseFloat(updates.actualAmount);
        (updates as any).variance = (planned - actual).toFixed(2);
      }
      
      await db.update(projectBudgetItems).set(updates).where(eq(projectBudgetItems.id, id));
      return { message: "Budget item updated successfully" };
    }),

  deleteBudgetItem: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(projectBudgetItems).where(eq(projectBudgetItems.id, input.id));
      return { message: "Budget item deleted successfully" };
    }),

  // ============================================
  // CHANGE ORDERS
  // ============================================

  listChangeOrders: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db
        .select()
        .from(changeOrders)
        .where(eq(changeOrders.projectId, input.projectId))
        .orderBy(desc(changeOrders.requestedDate));
    }),

  createChangeOrder: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      changeNumber: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      reason: z.string().min(1),
      impactType: z.string(),
      scheduleImpactDays: z.number().optional(),
      costImpact: z.string().optional(),
      requestedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(changeOrders).values({
        projectId: input.projectId,
        changeNumber: input.changeNumber,
        title: input.title,
        description: input.description,
        reason: input.reason,
        impactType: input.impactType,
        scheduleImpactDays: input.scheduleImpactDays || 0,
        costImpact: input.costImpact || "0",
        requestedBy: input.requestedBy,
      });
      return { id: result.insertId, message: "Change order created successfully" };
    }),

  updateChangeOrder: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      reason: z.string().optional(),
      impactType: z.string().optional(),
      scheduleImpactDays: z.number().optional(),
      costImpact: z.string().optional(),
      status: z.string().optional(),
      approvedBy: z.number().optional(),
      approvedDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updates } = input;
      await db.update(changeOrders).set(updates).where(eq(changeOrders.id, id));
      return { message: "Change order updated successfully" };
    }),

  deleteChangeOrder: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(changeOrders).where(eq(changeOrders.id, input.id));
      return { message: "Change order deleted successfully" };
    }),

  // ============================================
  // RISKS
  // ============================================

  listRisks: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db
        .select()
        .from(projectRisks)
        .where(eq(projectRisks.projectId, input.projectId))
        .orderBy(desc(projectRisks.riskScore));
    }),

  createRisk: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      riskNumber: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.string(),
      probability: z.string(),
      impact: z.string(),
      mitigationPlan: z.string().optional(),
      contingencyPlan: z.string().optional(),
      ownerId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Calculate risk score (1-9 based on probability and impact)
      const probMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
      const impactMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
      const riskScore = (probMap[input.probability] || 1) * (impactMap[input.impact] || 1);
      
      const [result] = await db.insert(projectRisks).values({
        projectId: input.projectId,
        riskNumber: input.riskNumber,
        title: input.title,
        description: input.description,
        category: input.category,
        probability: input.probability,
        impact: input.impact,
        riskScore,
        mitigationPlan: input.mitigationPlan,
        contingencyPlan: input.contingencyPlan,
        ownerId: input.ownerId,
      });
      return { id: result.insertId, message: "Risk created successfully" };
    }),

  updateRisk: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      probability: z.string().optional(),
      impact: z.string().optional(),
      status: z.string().optional(),
      mitigationPlan: z.string().optional(),
      contingencyPlan: z.string().optional(),
      ownerId: z.number().optional(),
      closedDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...updates } = input;
      
      // Recalculate risk score if probability or impact changed
      if (updates.probability || updates.impact) {
        const probMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
        const impactMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
        if (updates.probability && updates.impact) {
          (updates as any).riskScore = (probMap[updates.probability] || 1) * (impactMap[updates.impact] || 1);
        }
      }
      
      await db.update(projectRisks).set(updates).where(eq(projectRisks.id, id));
      return { message: "Risk updated successfully" };
    }),

  deleteRisk: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(projectRisks).where(eq(projectRisks.id, input.id));
      return { message: "Risk deleted successfully" };
    }),

  // ============================================
  // STATUS REPORTS
  // ============================================

  listStatusReports: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return db
        .select()
        .from(projectStatusReports)
        .where(eq(projectStatusReports.projectId, input.projectId))
        .orderBy(desc(projectStatusReports.reportDate));
    }),

  createStatusReport: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      reportDate: z.date(),
      reportPeriod: z.string().min(1),
      overallStatus: z.string(),
      scheduleStatus: z.string(),
      budgetStatus: z.string(),
      scopeStatus: z.string(),
      accomplishments: z.string().optional(),
      plannedActivities: z.string().optional(),
      issues: z.string().optional(),
      decisions: z.string().optional(),
      earnedValue: z.string().optional(),
      plannedValue: z.string().optional(),
      actualCost: z.string().optional(),
      preparedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Calculate CPI and SPI if values provided
      let cpi: string | undefined;
      let spi: string | undefined;
      
      if (input.earnedValue && input.actualCost) {
        const ev = parseFloat(input.earnedValue);
        const ac = parseFloat(input.actualCost);
        if (ac > 0) cpi = (ev / ac).toFixed(2);
      }
      
      if (input.earnedValue && input.plannedValue) {
        const ev = parseFloat(input.earnedValue);
        const pv = parseFloat(input.plannedValue);
        if (pv > 0) spi = (ev / pv).toFixed(2);
      }
      
      const [result] = await db.insert(projectStatusReports).values({
        projectId: input.projectId,
        reportDate: input.reportDate,
        reportPeriod: input.reportPeriod,
        overallStatus: input.overallStatus,
        scheduleStatus: input.scheduleStatus,
        budgetStatus: input.budgetStatus,
        scopeStatus: input.scopeStatus,
        accomplishments: input.accomplishments,
        plannedActivities: input.plannedActivities,
        issues: input.issues,
        decisions: input.decisions,
        earnedValue: input.earnedValue,
        plannedValue: input.plannedValue,
        actualCost: input.actualCost,
        cpi,
        spi,
        preparedBy: input.preparedBy,
      });
      return { id: result.insertId, message: "Status report created successfully" };
    }),

  // ============================================
  // DASHBOARD / STATISTICS
  // ============================================

  getDashboardStats: protectedProcedure.query(async () => {
    const db = await getDb();
      if (!db) throw new Error("Database not available");
    
    const [projectStats] = await db
      .select({
        total: count(),
        planning: sql<number>`SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END)`,
        active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
        onHold: sql<number>`SUM(CASE WHEN status = 'on_hold' THEN 1 ELSE 0 END)`,
        completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
        totalBudget: sum(projects.budget),
        totalActualCost: sum(projects.actualCost),
      })
      .from(projects);

    const [riskStats] = await db
      .select({
        total: count(),
        open: sql<number>`SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END)`,
        highRisk: sql<number>`SUM(CASE WHEN riskScore >= 6 THEN 1 ELSE 0 END)`,
      })
      .from(projectRisks);

    const [changeOrderStats] = await db
      .select({
        total: count(),
        pending: sql<number>`SUM(CASE WHEN status IN ('draft', 'submitted', 'under_review') THEN 1 ELSE 0 END)`,
        approved: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`,
      })
      .from(changeOrders);

    return {
      projects: projectStats,
      risks: riskStats,
      changeOrders: changeOrderStats,
    };
  }),

  getProjectSummary: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id));

      if (!project) return null;

      const milestones = await db
        .select()
        .from(projectMilestones)
        .where(eq(projectMilestones.projectId, input.id));

      const tasks = await db
        .select()
        .from(projectTasks)
        .where(eq(projectTasks.projectId, input.id));

      const budgetItems = await db
        .select()
        .from(projectBudgetItems)
        .where(eq(projectBudgetItems.projectId, input.id));

      const risks = await db
        .select()
        .from(projectRisks)
        .where(eq(projectRisks.projectId, input.id));

      const changeOrdersList = await db
        .select()
        .from(changeOrders)
        .where(eq(changeOrders.projectId, input.id));

      return {
        project,
        milestones,
        tasks,
        budgetItems,
        risks,
        changeOrders: changeOrdersList,
        stats: {
          milestonesCompleted: milestones.filter((m: { status: string }) => m.status === 'completed').length,
          milestonesTotal: milestones.length,
          tasksCompleted: tasks.filter((t: { status: string }) => t.status === 'completed').length,
          tasksTotal: tasks.length,
          openRisks: risks.filter((r: { status: string }) => r.status === 'open').length,
          pendingChangeOrders: changeOrdersList.filter((co: { status: string }) => ['draft', 'submitted', 'under_review'].includes(co.status)).length,
        },
      };
    }),
});
