import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  lifecycleEvents,
  filingWorkflows,
  filingTasks,
  automationRules,
  luvLedgerTransactions,
  luvLedgerAccounts,
  houses,
  businessEntities,
  realEstateProperties,
  w2Workers,
  generatedDocuments,
} from "../../drizzle/schema";
import { eq, and, desc, sql, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// LIFECYCLE EVENT TYPES
// ============================================

const ENTITY_TYPES = [
  "house", "business", "property", "worker", "document",
  "tax_return", "restoration_case", "ledger_account", "payroll"
] as const;

const EVENT_TYPES = [
  "created", "activated", "updated", "deactivated", "archived",
  "filed", "approved", "rejected", "submitted", "completed",
  "transferred", "dissolved", "acquired", "sold", "hired", "terminated"
] as const;

const IMPACT_TYPES = ["income", "expense", "asset", "liability", "neutral"] as const;

// ============================================
// AUTOMATION RULES
// ============================================

interface AutomationAction {
  type: "create_document" | "log_ledger" | "send_notification" | "create_task" | "update_status";
  params: Record<string, any>;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerEvent: typeof EVENT_TYPES[number];
  triggerEntityType: typeof ENTITY_TYPES[number];
  conditions: Record<string, any>;
  actions: AutomationAction[];
  isActive: boolean;
}

// Pre-defined automation rules
const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "business_created_ein",
    name: "Auto-generate EIN Application",
    description: "When a business is created, automatically generate SS-4 form",
    triggerEvent: "created",
    triggerEntityType: "business",
    conditions: { needsEin: true },
    actions: [
      { type: "create_document", params: { templateCode: "IRS_SS4" } },
      { type: "log_ledger", params: { transactionType: "fee", description: "Business formation initiated" } },
      { type: "create_task", params: { title: "File EIN Application", dueInDays: 7 } }
    ],
    isActive: true
  },
  {
    id: "business_created_operating",
    name: "Auto-generate Operating Agreement",
    description: "When an LLC is created, automatically generate Operating Agreement",
    triggerEvent: "created",
    triggerEntityType: "business",
    conditions: { entityType: "llc" },
    actions: [
      { type: "create_document", params: { templateCode: "CONTRACT_OPERATING" } },
      { type: "create_task", params: { title: "Review and sign Operating Agreement", dueInDays: 14 } }
    ],
    isActive: true
  },
  {
    id: "worker_hired_w4",
    name: "Auto-generate W-4 for New Hire",
    description: "When a worker is hired, automatically generate W-4 form",
    triggerEvent: "hired",
    triggerEntityType: "worker",
    conditions: {},
    actions: [
      { type: "create_document", params: { templateCode: "IRS_W4" } },
      { type: "create_document", params: { templateCode: "USCIS_I9" } },
      { type: "log_ledger", params: { transactionType: "allocation", description: "New employee onboarding" } },
      { type: "create_task", params: { title: "Complete I-9 verification", dueInDays: 3 } }
    ],
    isActive: true
  },
  {
    id: "property_acquired_deed",
    name: "Auto-generate Property Documents",
    description: "When a property is acquired, generate deed and title documents",
    triggerEvent: "acquired",
    triggerEntityType: "property",
    conditions: {},
    actions: [
      { type: "create_document", params: { templateCode: "CONTRACT_PURCHASE" } },
      { type: "log_ledger", params: { transactionType: "income", description: "Property acquisition" } },
      { type: "create_task", params: { title: "Record deed with county", dueInDays: 30 } }
    ],
    isActive: true
  },
  {
    id: "document_filed_notification",
    name: "Notify on Document Filing",
    description: "Send notification when a document is filed",
    triggerEvent: "filed",
    triggerEntityType: "document",
    conditions: {},
    actions: [
      { type: "send_notification", params: { title: "Document Filed", message: "Your document has been submitted for filing" } },
      { type: "log_ledger", params: { transactionType: "fee", description: "Document filing fee" } }
    ],
    isActive: true
  },
  {
    id: "house_activated_vault",
    name: "Auto-create Document Vault",
    description: "When a House is activated, create document vault and ledger",
    triggerEvent: "activated",
    triggerEntityType: "house",
    conditions: {},
    actions: [
      { type: "log_ledger", params: { transactionType: "income", description: "House activation - Genesis transaction" } },
      { type: "create_task", params: { title: "Complete post-activation courses", dueInDays: 30 } }
    ],
    isActive: true
  }
];

// ============================================
// ROUTER
// ============================================

export const lifecycleManagerRouter = router({
  // Log a lifecycle event
  logEvent: protectedProcedure
    .input(z.object({
      entityType: z.enum(ENTITY_TYPES),
      entityId: z.number(),
      entityName: z.string().optional(),
      eventType: z.enum(EVENT_TYPES),
      eventDescription: z.string().optional(),
      financialImpact: z.number().optional(),
      impactType: z.enum(IMPACT_TYPES).optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Get user's house
      const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
      const houseId = userHouse.length ? userHouse[0].id : null;

      // Create lifecycle event
      const [event] = await db.insert(lifecycleEvents).values({
        entityType: input.entityType,
        entityId: input.entityId,
        entityName: input.entityName,
        eventType: input.eventType,
        eventDescription: input.eventDescription,
        houseId,
        userId,
        financialImpact: input.financialImpact?.toString(),
        impactType: input.impactType,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      });

      // Log to LuvLedger if there's financial impact
      if (input.financialImpact && input.financialImpact !== 0) {
        const account = await db.select().from(luvLedgerAccounts).where(eq(luvLedgerAccounts.userId, userId)).limit(1);
        if (account.length) {
          await db.insert(luvLedgerTransactions).values({
            fromAccountId: account[0].id,
            toAccountId: account[0].id,
            amount: Math.abs(input.financialImpact).toString(),
            transactionType: input.impactType === "income" ? "income" : 
                            input.impactType === "expense" ? "fee" : "allocation",
            description: `${input.eventType}: ${input.entityType} - ${input.entityName || input.entityId}`,
          });
        }
      }

      // Trigger automation rules
      await triggerAutomation(db, userId, houseId, input);

      return { eventId: event.insertId, success: true };
    }),

  // Get lifecycle events for an entity
  getEntityEvents: protectedProcedure
    .input(z.object({
      entityType: z.enum(ENTITY_TYPES),
      entityId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const events = await db
        .select()
        .from(lifecycleEvents)
        .where(and(
          eq(lifecycleEvents.entityType, input.entityType),
          eq(lifecycleEvents.entityId, input.entityId)
        ))
        .orderBy(desc(lifecycleEvents.eventTimestamp))
        .limit(input.limit);

      return events;
    }),

  // Get all events for a house (timeline view)
  getHouseTimeline: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      entityTypes: z.array(z.enum(ENTITY_TYPES)).optional(),
      limit: z.number().default(100),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
      if (!userHouse.length) return { events: [], timeline: {}, totalCount: 0 };

      const events = await db
        .select()
        .from(lifecycleEvents)
        .where(eq(lifecycleEvents.houseId, userHouse[0].id))
        .orderBy(desc(lifecycleEvents.eventTimestamp))
        .limit(input?.limit || 100);

      // Group by date for timeline display
      const timeline = events.reduce((acc, event) => {
        const date = new Date(event.eventTimestamp).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
      }, {} as Record<string, typeof events>);

      return {
        events,
        timeline,
        totalCount: events.length
      };
    }),

  // Get automation rules
  getAutomationRules: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const userId = ctx.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
    if (!userHouse.length) return DEFAULT_AUTOMATION_RULES;

    // Get custom rules from database
    const customRules = await db
      .select()
      .from(automationRules)
      .where(eq(automationRules.isActive, true));

    // Merge with default rules
    return [...DEFAULT_AUTOMATION_RULES, ...customRules.map(r => ({
      id: r.id.toString(),
      name: r.ruleName,
      description: r.description || "",
      triggerEvent: r.triggerEvent as typeof EVENT_TYPES[number],
      triggerEntityType: r.triggerEntityType as typeof ENTITY_TYPES[number],
      conditions: (r.triggerConditions || {}) as Record<string, any>,
      actions: [{ type: r.actionType, params: r.actionConfig || {} }] as AutomationAction[],
      isActive: r.isActive ?? true
    }))];
  }),

  // Toggle automation rule
  toggleAutomationRule: protectedProcedure
    .input(z.object({
      ruleId: z.string(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return { success: true, ruleId: input.ruleId, isActive: input.isActive };
    }),

  // Get filing workflows (templates)
  getFilingWorkflowTemplates: protectedProcedure
    .input(z.object({
      filingType: z.string().optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const workflows = await db
        .select()
        .from(filingWorkflows)
        .where(eq(filingWorkflows.isActive, true))
        .limit(input?.limit || 50);

      return workflows;
    }),

  // Get filing tasks for a house
  getFilingTasks: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
      if (!userHouse.length) return [];

      const tasks = await db
        .select()
        .from(filingTasks)
        .where(eq(filingTasks.houseId, userHouse[0].id))
        .orderBy(desc(filingTasks.dueDate))
        .limit(input?.limit || 50);

      return tasks;
    }),

  // Create a filing task
  createFilingTask: protectedProcedure
    .input(z.object({
      workflowId: z.number(),
      entityType: z.enum(["business", "property", "worker", "tax_return", "trademark", "trust"]),
      entityId: z.number().optional(),
      taskName: z.string(),
      description: z.string().optional(),
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
      if (!userHouse.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "House not found" });
      }

      // Create filing task
      const [task] = await db.insert(filingTasks).values({
        houseId: userHouse[0].id,
        userId,
        workflowId: input.workflowId,
        entityType: input.entityType,
        entityId: input.entityId,
        taskName: input.taskName,
        description: input.description,
        status: "pending",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      });

      // Log lifecycle event - map filing task entity type to lifecycle entity type
      const lifecycleEntityType = input.entityType === "trademark" || input.entityType === "trust" 
        ? "document" 
        : input.entityType;
      await db.insert(lifecycleEvents).values({
        entityType: lifecycleEntityType,
        entityId: input.entityId || 0,
        eventType: "submitted",
        eventDescription: `Filing task created: ${input.taskName}`,
        houseId: userHouse[0].id,
        userId,
      });

      return { taskId: task.insertId, success: true };
    }),

  // Update filing task status
  updateFilingTask: protectedProcedure
    .input(z.object({
      taskId: z.number(),
      status: z.enum(["pending", "in_progress", "awaiting_documents", "submitted", "under_review", "approved", "rejected", "completed", "cancelled"]),
      notes: z.string().optional(),
      confirmationNumber: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const updateData: Record<string, any> = {
        status: input.status,
      };

      if (input.status === "completed") {
        updateData.completedAt = new Date();
      }
      if (input.status === "submitted") {
        updateData.submittedAt = new Date();
      }
      if (input.confirmationNumber) {
        updateData.confirmationNumber = input.confirmationNumber;
      }

      await db
        .update(filingTasks)
        .set(updateData)
        .where(eq(filingTasks.id, input.taskId));

      return { success: true };
    }),

  // Get dashboard summary
  getDashboardSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const userId = ctx.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const userHouse = await db.select().from(houses).where(eq(houses.ownerUserId, userId)).limit(1);
    if (!userHouse.length) {
      return {
        totalEntities: { businesses: 0, properties: 0, workers: 0, documents: 0 },
        pendingFilings: 0,
        recentEvents: [],
        upcomingDeadlines: [],
        financialSummary: { income: 0, expenses: 0, assets: 0, liabilities: 0 }
      };
    }

    const houseId = userHouse[0].id;

    // Count entities
   const [businesses] = await db.select({ count: sql<number>`count(*)` }).from(businessEntities).where(eq(businessEntities.userId, userId));    const [properties] = await db.select({ count: sql<number>`count(*)` }).from(realEstateProperties).where(eq(realEstateProperties.houseId, houseId));
    const [workers] = await db.select({ count: sql<number>`count(*)` }).from(w2Workers).where(eq(w2Workers.houseId, houseId));
    const [documents] = await db.select({ count: sql<number>`count(*)` }).from(generatedDocuments).where(eq(generatedDocuments.houseId, houseId));

    // Pending filings
    const [pendingTasks] = await db
      .select({ count: sql<number>`count(*)` })
      .from(filingTasks)
      .where(and(
        eq(filingTasks.houseId, houseId),
        eq(filingTasks.status, "pending")
      ));

    // Recent events
    const recentEvents = await db
      .select()
      .from(lifecycleEvents)
      .where(eq(lifecycleEvents.houseId, houseId))
      .orderBy(desc(lifecycleEvents.eventTimestamp))
      .limit(10);

    // Upcoming deadlines (tasks due in next 30 days)
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const upcomingTasks = await db
      .select()
      .from(filingTasks)
      .where(and(
        eq(filingTasks.houseId, houseId),
        eq(filingTasks.status, "pending"),
        lte(filingTasks.dueDate, thirtyDaysFromNow)
      ))
      .orderBy(filingTasks.dueDate)
      .limit(10);

    // Financial summary from lifecycle events
    const financialEvents = await db
      .select({
        impactType: lifecycleEvents.impactType,
        total: sql<number>`SUM(CAST(financial_impact AS DECIMAL(18,2)))`
      })
      .from(lifecycleEvents)
      .where(eq(lifecycleEvents.houseId, houseId))
      .groupBy(lifecycleEvents.impactType);

    const financialSummary = {
      income: 0,
      expenses: 0,
      assets: 0,
      liabilities: 0
    };

    for (const event of financialEvents) {
      if (event.impactType === "income") financialSummary.income = event.total || 0;
      if (event.impactType === "expense") financialSummary.expenses = event.total || 0;
      if (event.impactType === "asset") financialSummary.assets = event.total || 0;
      if (event.impactType === "liability") financialSummary.liabilities = event.total || 0;
    }

    return {
      totalEntities: {
        businesses: businesses?.count || 0,
        properties: properties?.count || 0,
        workers: workers?.count || 0,
        documents: documents?.count || 0
      },
      pendingFilings: pendingTasks?.count || 0,
      recentEvents,
      upcomingDeadlines: upcomingTasks,
      financialSummary
    };
  }),
});

// Helper function to trigger automation rules
async function triggerAutomation(
  db: any,
  userId: number,
  houseId: number | null,
  event: {
    entityType: typeof ENTITY_TYPES[number];
    entityId: number;
    eventType: typeof EVENT_TYPES[number];
    metadata?: Record<string, any>;
  }
) {
  // Find matching rules
  const matchingRules = DEFAULT_AUTOMATION_RULES.filter(rule =>
    rule.isActive &&
    rule.triggerEvent === event.eventType &&
    rule.triggerEntityType === event.entityType
  );

  for (const rule of matchingRules) {
    // Check conditions
    let conditionsMet = true;
    if (event.metadata) {
      for (const [key, value] of Object.entries(rule.conditions)) {
        if (event.metadata[key] !== value) {
          conditionsMet = false;
          break;
        }
      }
    }

    if (!conditionsMet) continue;

    // Execute actions
    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case "log_ledger":
            if (houseId) {
              const account = await db.select().from(luvLedgerAccounts).where(eq(luvLedgerAccounts.userId, userId)).limit(1);
              if (account.length) {
                await db.insert(luvLedgerTransactions).values({
                  fromAccountId: account[0].id,
                  toAccountId: account[0].id,
                  amount: "0",
                  transactionType: action.params.transactionType || "allocation",
                  description: action.params.description || `Automated: ${rule.name}`,
                });
              }
            }
            break;

          case "create_task":
            console.log(`[Automation] Would create task: ${action.params.title}`);
            break;

          case "send_notification":
            console.log(`[Automation] Would send notification: ${action.params.title}`);
            break;

          case "create_document":
            console.log(`[Automation] Would create document: ${action.params.templateCode}`);
            break;
        }
      } catch (error) {
        console.error(`[Automation] Error executing action ${action.type}:`, error);
      }
    }
  }
}
