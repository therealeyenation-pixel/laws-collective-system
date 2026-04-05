import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { db } from "./db";
import { 
  governmentAgencies, 
  governmentActions, 
  governmentActionTasks,
  governmentActionNotifications 
} from "../drizzle/schema";
import { eq, desc, asc, and, or, gte, lte, like, inArray, isNull, sql } from "drizzle-orm";

export const governmentActionsRouter = router({
  // ============================================================================
  // AGENCIES
  // ============================================================================
  
  listAgencies: publicProcedure
    .input(z.object({
      level: z.enum(["federal", "state", "local", "international"]).optional(),
      state: z.string().optional(),
      activeOnly: z.boolean().default(true),
    }).optional())
    .query(async ({ input }) => {
      const conditions = [];
      
      if (input?.activeOnly !== false) {
        conditions.push(eq(governmentAgencies.isActive, true));
      }
      if (input?.level) {
        conditions.push(eq(governmentAgencies.level, input.level));
      }
      if (input?.state) {
        conditions.push(eq(governmentAgencies.state, input.state));
      }
      
      const agencies = await db
        .select()
        .from(governmentAgencies)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(governmentAgencies.name));
      
      return agencies;
    }),
  
  createAgency: protectedProcedure
    .input(z.object({
      code: z.string().min(1).max(20),
      name: z.string().min(1).max(255),
      fullName: z.string().max(500).optional(),
      level: z.enum(["federal", "state", "local", "international"]).default("federal"),
      state: z.string().max(2).optional(),
      website: z.string().max(500).optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().max(50).optional(),
      relevantDepartments: z.array(z.string()).optional(),
      relevantEntities: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const [result] = await db.insert(governmentAgencies).values({
        ...input,
        relevantDepartments: input.relevantDepartments ? JSON.stringify(input.relevantDepartments) : null,
        relevantEntities: input.relevantEntities ? JSON.stringify(input.relevantEntities) : null,
      });
      
      return { id: result.insertId };
    }),
  
  // ============================================================================
  // GOVERNMENT ACTIONS
  // ============================================================================
  
  list: publicProcedure
    .input(z.object({
      actionType: z.enum([
        "regulatory_change", "grant_announcement", "tax_update",
        "licensing_requirement", "labor_law", "nonprofit_compliance",
        "filing_deadline", "policy_change", "enforcement_action", "guidance_update"
      ]).optional(),
      agencyId: z.number().optional(),
      impactLevel: z.enum(["critical", "high", "medium", "low", "informational"]).optional(),
      complianceStatus: z.enum(["pending", "in_progress", "compliant", "non_compliant", "not_applicable"]).optional(),
      department: z.string().optional(),
      entity: z.string().optional(),
      status: z.enum(["active", "archived", "superseded"]).default("active"),
      showInTickerOnly: z.boolean().optional(),
      upcomingDeadlinesOnly: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ input }) => {
      const conditions = [];
      
      if (input?.status) {
        conditions.push(eq(governmentActions.status, input.status));
      }
      if (input?.actionType) {
        conditions.push(eq(governmentActions.actionType, input.actionType));
      }
      if (input?.agencyId) {
        conditions.push(eq(governmentActions.agencyId, input.agencyId));
      }
      if (input?.impactLevel) {
        conditions.push(eq(governmentActions.impactLevel, input.impactLevel));
      }
      if (input?.complianceStatus) {
        conditions.push(eq(governmentActions.complianceStatus, input.complianceStatus));
      }
      if (input?.showInTickerOnly) {
        conditions.push(eq(governmentActions.showInTicker, true));
      }
      if (input?.upcomingDeadlinesOnly) {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        conditions.push(gte(governmentActions.deadline, now));
        conditions.push(lte(governmentActions.deadline, thirtyDaysFromNow));
      }
      
      const actions = await db
        .select({
          action: governmentActions,
          agency: governmentAgencies,
        })
        .from(governmentActions)
        .leftJoin(governmentAgencies, eq(governmentActions.agencyId, governmentAgencies.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(governmentActions.deadline), desc(governmentActions.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);
      
      // Filter by department/entity in application layer (JSON fields)
      let filtered = actions;
      if (input?.department) {
        filtered = filtered.filter(a => {
          const depts = a.action.affectedDepartments as string[] | null;
          return depts?.includes(input.department!) || false;
        });
      }
      if (input?.entity) {
        filtered = filtered.filter(a => {
          const entities = a.action.affectedEntities as string[] | null;
          return entities?.includes(input.entity!) || false;
        });
      }
      
      return filtered;
    }),
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [result] = await db
        .select({
          action: governmentActions,
          agency: governmentAgencies,
        })
        .from(governmentActions)
        .leftJoin(governmentAgencies, eq(governmentActions.agencyId, governmentAgencies.id))
        .where(eq(governmentActions.id, input.id));
      
      if (!result) return null;
      
      // Get associated tasks
      const tasks = await db
        .select()
        .from(governmentActionTasks)
        .where(eq(governmentActionTasks.governmentActionId, input.id))
        .orderBy(asc(governmentActionTasks.dueDate));
      
      return { ...result, tasks };
    }),
  
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(500),
      description: z.string().optional(),
      agencyId: z.number(),
      sourceUrl: z.string().max(1000).optional(),
      referenceNumber: z.string().max(100).optional(),
      actionType: z.enum([
        "regulatory_change", "grant_announcement", "tax_update",
        "licensing_requirement", "labor_law", "nonprofit_compliance",
        "filing_deadline", "policy_change", "enforcement_action", "guidance_update"
      ]),
      announcedDate: z.date().optional(),
      effectiveDate: z.date().optional(),
      deadline: z.date().optional(),
      expirationDate: z.date().optional(),
      impactLevel: z.enum(["critical", "high", "medium", "low", "informational"]).default("medium"),
      affectedEntities: z.array(z.string()).optional(),
      affectedDepartments: z.array(z.string()).optional(),
      estimatedCost: z.number().optional(),
      estimatedTimeHours: z.number().optional(),
      swotCategory: z.enum(["strength", "weakness", "opportunity", "threat"]).optional(),
      swotNotes: z.string().optional(),
      showInTicker: z.boolean().default(true),
      tickerPriority: z.enum(["urgent", "high", "normal", "low"]).default("normal"),
    }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await db.insert(governmentActions).values({
        ...input,
        affectedEntities: input.affectedEntities ? JSON.stringify(input.affectedEntities) : null,
        affectedDepartments: input.affectedDepartments ? JSON.stringify(input.affectedDepartments) : null,
        estimatedCost: input.estimatedCost?.toString(),
        createdBy: ctx.user?.id,
      });
      
      return { id: result.insertId };
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(500).optional(),
      description: z.string().optional(),
      agencyId: z.number().optional(),
      sourceUrl: z.string().max(1000).optional(),
      referenceNumber: z.string().max(100).optional(),
      actionType: z.enum([
        "regulatory_change", "grant_announcement", "tax_update",
        "licensing_requirement", "labor_law", "nonprofit_compliance",
        "filing_deadline", "policy_change", "enforcement_action", "guidance_update"
      ]).optional(),
      announcedDate: z.date().optional(),
      effectiveDate: z.date().optional(),
      deadline: z.date().optional(),
      expirationDate: z.date().optional(),
      impactLevel: z.enum(["critical", "high", "medium", "low", "informational"]).optional(),
      affectedEntities: z.array(z.string()).optional(),
      affectedDepartments: z.array(z.string()).optional(),
      estimatedCost: z.number().optional(),
      estimatedTimeHours: z.number().optional(),
      swotCategory: z.enum(["strength", "weakness", "opportunity", "threat"]).optional(),
      swotNotes: z.string().optional(),
      complianceStatus: z.enum(["pending", "in_progress", "compliant", "non_compliant", "not_applicable"]).optional(),
      complianceNotes: z.string().optional(),
      assignedTo: z.number().optional(),
      showInTicker: z.boolean().optional(),
      tickerPriority: z.enum(["urgent", "high", "normal", "low"]).optional(),
      status: z.enum(["active", "archived", "superseded"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, affectedEntities, affectedDepartments, estimatedCost, ...rest } = input;
      
      const updateData: any = { ...rest, updatedAt: new Date() };
      if (affectedEntities !== undefined) {
        updateData.affectedEntities = JSON.stringify(affectedEntities);
      }
      if (affectedDepartments !== undefined) {
        updateData.affectedDepartments = JSON.stringify(affectedDepartments);
      }
      if (estimatedCost !== undefined) {
        updateData.estimatedCost = estimatedCost.toString();
      }
      
      await db
        .update(governmentActions)
        .set(updateData)
        .where(eq(governmentActions.id, id));
      
      return { success: true };
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(governmentActions).where(eq(governmentActions.id, input.id));
      return { success: true };
    }),
  
  // ============================================================================
  // TICKER INTEGRATION
  // ============================================================================
  
  getForTicker: publicProcedure
    .input(z.object({
      department: z.string().optional(),
      entity: z.string().optional(),
      limit: z.number().min(1).max(20).default(10),
    }).optional())
    .query(async ({ input }) => {
      const now = new Date();
      
      const actions = await db
        .select({
          id: governmentActions.id,
          title: governmentActions.title,
          actionType: governmentActions.actionType,
          deadline: governmentActions.deadline,
          impactLevel: governmentActions.impactLevel,
          tickerPriority: governmentActions.tickerPriority,
          swotCategory: governmentActions.swotCategory,
          affectedDepartments: governmentActions.affectedDepartments,
          affectedEntities: governmentActions.affectedEntities,
          agencyCode: governmentAgencies.code,
          agencyName: governmentAgencies.name,
        })
        .from(governmentActions)
        .leftJoin(governmentAgencies, eq(governmentActions.agencyId, governmentAgencies.id))
        .where(and(
          eq(governmentActions.showInTicker, true),
          eq(governmentActions.status, "active")
        ))
        .orderBy(
          desc(sql`CASE 
            WHEN ${governmentActions.tickerPriority} = 'urgent' THEN 4
            WHEN ${governmentActions.tickerPriority} = 'high' THEN 3
            WHEN ${governmentActions.tickerPriority} = 'normal' THEN 2
            ELSE 1
          END`),
          asc(governmentActions.deadline)
        )
        .limit(input?.limit || 10);
      
      // Filter by department/entity
      let filtered = actions;
      if (input?.department) {
        filtered = filtered.filter(a => {
          const depts = a.affectedDepartments as string[] | null;
          return !depts || depts.length === 0 || depts.includes(input.department!);
        });
      }
      if (input?.entity) {
        filtered = filtered.filter(a => {
          const entities = a.affectedEntities as string[] | null;
          return !entities || entities.length === 0 || entities.includes(input.entity!);
        });
      }
      
      // Format for ticker display
      return filtered.map(a => ({
        id: a.id,
        title: a.title,
        type: a.actionType,
        agency: a.agencyCode || a.agencyName,
        deadline: a.deadline,
        priority: a.tickerPriority,
        impactLevel: a.impactLevel,
        swotCategory: a.swotCategory,
        daysUntilDeadline: a.deadline 
          ? Math.ceil((new Date(a.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        isOverdue: a.deadline ? new Date(a.deadline) < now : false,
      }));
    }),
  
  // ============================================================================
  // SWOT INTEGRATION
  // ============================================================================
  
  getForSwot: publicProcedure
    .input(z.object({
      entity: z.string().optional(),
      category: z.enum(["strength", "weakness", "opportunity", "threat"]).optional(),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ input }) => {
      const conditions = [
        eq(governmentActions.status, "active"),
      ];
      
      if (input?.category) {
        conditions.push(eq(governmentActions.swotCategory, input.category));
      }
      
      const actions = await db
        .select({
          id: governmentActions.id,
          title: governmentActions.title,
          description: governmentActions.description,
          actionType: governmentActions.actionType,
          swotCategory: governmentActions.swotCategory,
          swotNotes: governmentActions.swotNotes,
          impactLevel: governmentActions.impactLevel,
          deadline: governmentActions.deadline,
          affectedEntities: governmentActions.affectedEntities,
          agencyCode: governmentAgencies.code,
        })
        .from(governmentActions)
        .leftJoin(governmentAgencies, eq(governmentActions.agencyId, governmentAgencies.id))
        .where(and(...conditions))
        .orderBy(desc(governmentActions.createdAt))
        .limit(input?.limit || 20);
      
      // Filter by entity
      let filtered = actions;
      if (input?.entity) {
        filtered = filtered.filter(a => {
          const entities = a.affectedEntities as string[] | null;
          return !entities || entities.length === 0 || entities.includes(input.entity!);
        });
      }
      
      return filtered;
    }),
  
  // ============================================================================
  // COMPLIANCE TASKS
  // ============================================================================
  
  createTask: protectedProcedure
    .input(z.object({
      governmentActionId: z.number(),
      title: z.string().min(1).max(500),
      description: z.string().optional(),
      assignedTo: z.number().optional(),
      assignedDepartment: z.string().max(100).optional(),
      dueDate: z.date().optional(),
      priority: z.enum(["urgent", "high", "medium", "low"]).default("medium"),
    }))
    .mutation(async ({ input }) => {
      const [result] = await db.insert(governmentActionTasks).values(input);
      return { id: result.insertId };
    }),
  
  updateTask: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(500).optional(),
      description: z.string().optional(),
      assignedTo: z.number().optional(),
      assignedDepartment: z.string().max(100).optional(),
      dueDate: z.date().optional(),
      status: z.enum(["pending", "in_progress", "completed", "blocked", "cancelled"]).optional(),
      priority: z.enum(["urgent", "high", "medium", "low"]).optional(),
      notes: z.string().optional(),
      documentationUrl: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      
      const updateData: any = { ...rest, updatedAt: new Date() };
      if (input.status === "completed") {
        updateData.completedAt = new Date();
      }
      
      await db
        .update(governmentActionTasks)
        .set(updateData)
        .where(eq(governmentActionTasks.id, id));
      
      return { success: true };
    }),
  
  // ============================================================================
  // STATISTICS
  // ============================================================================
  
  getStats: publicProcedure
    .query(async () => {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const [totalActions] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(governmentActions)
        .where(eq(governmentActions.status, "active"));
      
      const [upcomingDeadlines] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(governmentActions)
        .where(and(
          eq(governmentActions.status, "active"),
          gte(governmentActions.deadline, now),
          lte(governmentActions.deadline, thirtyDaysFromNow)
        ));
      
      const [overdueActions] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(governmentActions)
        .where(and(
          eq(governmentActions.status, "active"),
          lte(governmentActions.deadline, now),
          eq(governmentActions.complianceStatus, "pending")
        ));
      
      const [pendingCompliance] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(governmentActions)
        .where(and(
          eq(governmentActions.status, "active"),
          eq(governmentActions.complianceStatus, "pending")
        ));
      
      const byType = await db
        .select({
          type: governmentActions.actionType,
          count: sql<number>`COUNT(*)`,
        })
        .from(governmentActions)
        .where(eq(governmentActions.status, "active"))
        .groupBy(governmentActions.actionType);
      
      const byImpact = await db
        .select({
          level: governmentActions.impactLevel,
          count: sql<number>`COUNT(*)`,
        })
        .from(governmentActions)
        .where(eq(governmentActions.status, "active"))
        .groupBy(governmentActions.impactLevel);
      
      return {
        totalActions: totalActions?.count || 0,
        upcomingDeadlines: upcomingDeadlines?.count || 0,
        overdueActions: overdueActions?.count || 0,
        pendingCompliance: pendingCompliance?.count || 0,
        byType,
        byImpact,
      };
    }),
});

export type GovernmentActionsRouter = typeof governmentActionsRouter;
