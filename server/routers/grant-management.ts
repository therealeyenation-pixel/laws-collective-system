import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { grantOpportunities, grantApplications, type GrantOpportunity, type GrantApplication } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const grantManagementRouter = router({
  // Get all grant opportunities
  getOpportunities: protectedProcedure
    .input(z.object({
      status: z.enum(["researching", "eligible", "not_eligible", "applying", "submitted", "archived"]).optional(),
      funderType: z.string().optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const conditions = [];
      
      if (input?.status) {
        conditions.push(eq(grantOpportunities.status, input.status));
      }
      if (input?.funderType) {
        conditions.push(eq(grantOpportunities.funderType, input.funderType as any));
      }
      if (input?.priority) {
        conditions.push(eq(grantOpportunities.priority, input.priority));
      }
      
      if (conditions.length > 0) {
        return await db.select()
          .from(grantOpportunities)
          .where(and(...conditions))
          .orderBy(desc(grantOpportunities.createdAt));
      }
      
      return await db.select()
        .from(grantOpportunities)
        .orderBy(desc(grantOpportunities.createdAt));
    }),

  // Get single grant opportunity
  getOpportunity: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [grant] = await db
        .select()
        .from(grantOpportunities)
        .where(eq(grantOpportunities.id, input.id));
      return grant;
    }),

  // Create new grant opportunity
  createOpportunity: protectedProcedure
    .input(z.object({
      name: z.string(),
      funderName: z.string(),
      funderType: z.enum(["federal", "state", "local", "foundation", "corporate", "religious", "community", "other"]),
      description: z.string().optional(),
      minAmount: z.string().optional(),
      maxAmount: z.string().optional(),
      typicalAmount: z.string().optional(),
      eligibleEntityTypes: z.array(z.string()).optional(),
      eligibilityRequirements: z.string().optional(),
      geographicRestrictions: z.string().optional(),
      focusAreas: z.array(z.string()).optional(),
      applicationDeadline: z.date().optional(),
      isRolling: z.boolean().optional(),
      applicationUrl: z.string().optional(),
      applicationRequirements: z.string().optional(),
      matchingRequired: z.boolean().optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(grantOpportunities).values({
        ...input,
        status: "researching",
        addedBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),

  // Update grant opportunity
  updateOpportunity: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      funderName: z.string().optional(),
      funderType: z.enum(["federal", "state", "local", "foundation", "corporate", "religious", "community", "other"]).optional(),
      description: z.string().optional(),
      minAmount: z.string().optional(),
      maxAmount: z.string().optional(),
      typicalAmount: z.string().optional(),
      eligibilityRequirements: z.string().optional(),
      applicationDeadline: z.date().optional(),
      isRolling: z.boolean().optional(),
      applicationUrl: z.string().optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      status: z.enum(["researching", "eligible", "not_eligible", "applying", "submitted", "archived"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db.update(grantOpportunities)
        .set(data)
        .where(eq(grantOpportunities.id, id));
      return { success: true };
    }),

  // Delete grant opportunity
  deleteOpportunity: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(grantOpportunities).where(eq(grantOpportunities.id, input.id));
      return { success: true };
    }),

  // Get all applications
  getApplications: protectedProcedure
    .input(z.object({
      grantId: z.number().optional(),
      status: z.enum(["draft", "in_review", "submitted", "under_review", "additional_info", "approved", "denied", "withdrawn"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const conditions = [];
      
      if (input?.grantId) {
        conditions.push(eq(grantApplications.grantOpportunityId, input.grantId));
      }
      if (input?.status) {
        conditions.push(eq(grantApplications.status, input.status));
      }
      
      if (conditions.length > 0) {
        return await db.select()
          .from(grantApplications)
          .where(and(...conditions))
          .orderBy(desc(grantApplications.startedAt));
      }
      
      return await db.select()
        .from(grantApplications)
        .orderBy(desc(grantApplications.startedAt));
    }),

  // Create application
  createApplication: protectedProcedure
    .input(z.object({
      grantOpportunityId: z.number(),
      applyingEntityId: z.number().optional(),
      applyingEntityName: z.string(),
      requestedAmount: z.string(),
      projectTitle: z.string().optional(),
      projectDescription: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(grantApplications).values({
        ...input,
        status: "draft",
      });
      
      // Update grant status to applying
      await db.update(grantOpportunities)
        .set({ status: "applying" })
        .where(eq(grantOpportunities.id, input.grantOpportunityId));
      
      return { id: result.insertId };
    }),

  // Update application
  updateApplication: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "in_review", "submitted", "under_review", "additional_info", "approved", "denied", "withdrawn"]).optional(),
      submittedAt: z.date().optional(),
      awardedAmount: z.string().optional(),
      projectTitle: z.string().optional(),
      projectDescription: z.string().optional(),
      funderFeedback: z.string().optional(),
      lessonsLearned: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await db.update(grantApplications)
        .set(data)
        .where(eq(grantApplications.id, id));
      
      // If approved, update the grant opportunity status
      if (data.status === "approved") {
        const [app] = await db.select().from(grantApplications).where(eq(grantApplications.id, id));
        if (app) {
          await db.update(grantOpportunities)
            .set({ status: "submitted" })
            .where(eq(grantOpportunities.id, app.grantOpportunityId));
        }
      }
      
      return { success: true };
    }),

  // Get grant statistics
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const opportunities = await db.select().from(grantOpportunities);
    const applications = await db.select().from(grantApplications);
    
    const stats = {
      totalOpportunities: opportunities.length,
      byStatus: {
        researching: opportunities.filter((g: GrantOpportunity) => g.status === "researching").length,
        eligible: opportunities.filter((g: GrantOpportunity) => g.status === "eligible").length,
        applying: opportunities.filter((g: GrantOpportunity) => g.status === "applying").length,
        submitted: opportunities.filter((g: GrantOpportunity) => g.status === "submitted").length,
        archived: opportunities.filter((g: GrantOpportunity) => g.status === "archived").length,
      },
      byFunderType: {
        federal: opportunities.filter((g: GrantOpportunity) => g.funderType === "federal").length,
        state: opportunities.filter((g: GrantOpportunity) => g.funderType === "state").length,
        foundation: opportunities.filter((g: GrantOpportunity) => g.funderType === "foundation").length,
        corporate: opportunities.filter((g: GrantOpportunity) => g.funderType === "corporate").length,
        religious: opportunities.filter((g: GrantOpportunity) => g.funderType === "religious").length,
        community: opportunities.filter((g: GrantOpportunity) => g.funderType === "community").length,
      },
      byPriority: {
        high: opportunities.filter((g: GrantOpportunity) => g.priority === "high").length,
        medium: opportunities.filter((g: GrantOpportunity) => g.priority === "medium").length,
        low: opportunities.filter((g: GrantOpportunity) => g.priority === "low").length,
      },
      totalApplications: applications.length,
      applicationsApproved: applications.filter((a: GrantApplication) => a.status === "approved").length,
      applicationsDenied: applications.filter((a: GrantApplication) => a.status === "denied").length,
      applicationsPending: applications.filter((a: GrantApplication) => ["submitted", "under_review", "additional_info"].includes(a.status)).length,
      upcomingDeadlines: opportunities.filter((g: GrantOpportunity) => {
        if (!g.applicationDeadline) return false;
        const deadline = new Date(g.applicationDeadline);
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return deadline >= now && deadline <= thirtyDaysFromNow;
      }).length,
    };
    
    return stats;
  }),

  // Seed initial grants from research
  seedResearchedGrants: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const grantsToSeed = [
      // Easy Women-Owned Grants
      {
        name: "Amber Grant",
        funderName: "WomensNet",
        funderType: "foundation" as const,
        description: "Monthly $10,000 grants to women-owned businesses. One startup grant, one category-specific, one general. Monthly winners eligible for $50,000 annual grant.",
        minAmount: "10000",
        maxAmount: "50000",
        eligibleEntityTypes: ["llc", "corporation"],
        eligibilityRequirements: "Women-owned business in US or Canada. No time in business requirement.",
        focusAreas: ["women_owned", "small_business"],
        isRolling: true,
        applicationUrl: "https://ambergrantsforwomen.com/",
        applicationRequirements: "Simple application - explain business and how you'd use the grant. $15 application fee.",
        priority: "high" as const,
        status: "eligible" as const,
        notes: "Apply monthly. Easy application process.",
        addedBy: ctx.user.id,
      },
      {
        name: "Women Founders Grant",
        funderName: "Women Founders Grant",
        funderType: "foundation" as const,
        description: "Monthly $5,000 grant to women-owned businesses.",
        minAmount: "5000",
        maxAmount: "5000",
        eligibleEntityTypes: ["llc", "corporation"],
        eligibilityRequirements: "18+ years old, US-based, 51% women-owned and operated.",
        focusAreas: ["women_owned"],
        isRolling: true,
        applicationUrl: "https://womenfoundersgrant.com/",
        applicationRequirements: "Answer two questions about business and fund usage.",
        priority: "high" as const,
        status: "eligible" as const,
        notes: "Deadline: last day of each month.",
        addedBy: ctx.user.id,
      },
      {
        name: "HerRise Microgrant",
        funderName: "Yva Jourdan Foundation / HerSuiteSpot",
        funderType: "foundation" as const,
        description: "Monthly $1,000 grants for under-resourced women entrepreneurs including women of color.",
        minAmount: "1000",
        maxAmount: "1000",
        eligibleEntityTypes: ["llc", "corporation"],
        eligibilityRequirements: "51% woman owned, less than $1 million gross revenue.",
        focusAreas: ["women_owned", "minority_owned"],
        isRolling: true,
        applicationUrl: "https://hersuitespot.com/herrise-microgrant/",
        priority: "high" as const,
        status: "eligible" as const,
        notes: "Monthly applications accepted.",
        addedBy: ctx.user.id,
      },
      {
        name: "IFundWomen Universal Application",
        funderName: "IFundWomen",
        funderType: "corporate" as const,
        description: "Submit one application and get matched to grants from enterprise partners like Visa, Neutrogena, American Express.",
        eligibleEntityTypes: ["llc", "corporation"],
        eligibilityRequirements: "Women-owned business.",
        focusAreas: ["women_owned"],
        isRolling: true,
        applicationUrl: "https://ifundwomen.com/",
        priority: "high" as const,
        status: "eligible" as const,
        notes: "Submit once, get matched automatically when new partner grants become available.",
        addedBy: ctx.user.id,
      },
      // Black-Owned / Minority Grants
      {
        name: "NAACP Powershift Entrepreneur Grant",
        funderName: "NAACP",
        funderType: "foundation" as const,
        description: "Grants for Black entrepreneurs to support business growth.",
        minAmount: "25000",
        maxAmount: "25000",
        eligibleEntityTypes: ["llc", "corporation"],
        eligibilityRequirements: "Black entrepreneurs.",
        focusAreas: ["minority_owned", "black_owned"],
        isRolling: true,
        applicationUrl: "https://naacp.org/find-resources/grants",
        priority: "high" as const,
        status: "eligible" as const,
        notes: "Rolling deadline.",
        addedBy: ctx.user.id,
      },
      {
        name: "Wish Local Empowerment Program",
        funderName: "Wish",
        funderType: "corporate" as const,
        description: "Grants for Black-owned small businesses.",
        minAmount: "500",
        maxAmount: "2000",
        eligibleEntityTypes: ["llc"],
        eligibilityRequirements: "Black-owned, fewer than 20 employees, annual revenue under $1 million.",
        focusAreas: ["minority_owned", "black_owned", "small_business"],
        isRolling: true,
        applicationUrl: "https://www.wish.com/local",
        priority: "medium" as const,
        status: "eligible" as const,
        notes: "Rolling deadline.",
        addedBy: ctx.user.id,
      },
      {
        name: "Hustler's Microgrant",
        funderName: "Hustler's Microgrant",
        funderType: "foundation" as const,
        description: "Monthly $1,000 grant for passionate entrepreneurs.",
        minAmount: "1000",
        maxAmount: "1000",
        eligibleEntityTypes: ["llc", "corporation"],
        eligibilityRequirements: "Small business owners across the US.",
        focusAreas: ["small_business"],
        isRolling: true,
        applicationUrl: "https://hustlersmicrogrant.com/",
        priority: "medium" as const,
        status: "eligible" as const,
        notes: "Rolling monthly deadline.",
        addedBy: ctx.user.id,
      },
      {
        name: "Freed Fellowship Grant",
        funderName: "Freed Fellowship",
        funderType: "foundation" as const,
        description: "Monthly $500 micro-grant. Monthly recipients eligible for $2,500 annual grant.",
        minAmount: "500",
        maxAmount: "2500",
        eligibleEntityTypes: ["llc", "corporation"],
        eligibilityRequirements: "Small business owners. Women and minority entrepreneurs encouraged.",
        focusAreas: ["small_business", "women_owned", "minority_owned"],
        isRolling: true,
        applicationUrl: "https://freedfellowship.com/",
        priority: "medium" as const,
        status: "eligible" as const,
        notes: "Rolling applications accepted.",
        addedBy: ctx.user.id,
      },
      {
        name: "Awesome Foundation Grant",
        funderName: "Awesome Foundation",
        funderType: "community" as const,
        description: "Monthly $1,000 microgrants for awesome projects.",
        minAmount: "1000",
        maxAmount: "1000",
        eligibleEntityTypes: ["llc", "corporation", "508", "501c3"],
        eligibilityRequirements: "Individuals, groups, businesses, startups with awesome ideas.",
        focusAreas: ["community", "innovation"],
        isRolling: true,
        applicationUrl: "https://www.awesomefoundation.org/",
        priority: "medium" as const,
        status: "eligible" as const,
        notes: "Funded by independently-run local chapters.",
        addedBy: ctx.user.id,
      },
      // Larger Grants
      {
        name: "EmpowHER Grants",
        funderName: "Boundless Futures Foundation",
        funderType: "foundation" as const,
        description: "Up to $25,000 for female founders addressing societal issues.",
        minAmount: "0",
        maxAmount: "25000",
        eligibleEntityTypes: ["llc", "corporation"],
        eligibilityRequirements: "Business established within last 3 years, addresses poverty/hunger, sustainability, or strong communities.",
        focusAreas: ["women_owned", "social_impact"],
        applicationUrl: "https://boundlessfuturesfoundation.org/empowher-grants/",
        applicationRequirements: "Quarterly applications. Reimbursement model.",
        priority: "medium" as const,
        status: "researching" as const,
        notes: "Quarterly applications. Reimbursement model.",
        addedBy: ctx.user.id,
      },
      {
        name: "Black Ambition Prize",
        funderName: "Black Ambition",
        funderType: "foundation" as const,
        description: "Up to $1 million for businesses with Black or Hispanic/Latinx founding team.",
        minAmount: "0",
        maxAmount: "1000000",
        eligibleEntityTypes: ["llc", "corporation"],
        eligibilityRequirements: "Business with Black or Hispanic/Latinx founding team member.",
        focusAreas: ["minority_owned", "black_owned", "innovation"],
        applicationUrl: "https://www.blackambitionprize.com/",
        priority: "low" as const,
        status: "researching" as const,
        notes: "Annual competition. Very competitive.",
        addedBy: ctx.user.id,
      },
      // Faith-Based
      {
        name: "Instrumentl Faith-Based Grants Database",
        funderName: "Various Foundations",
        funderType: "religious" as const,
        description: "100+ grants for faith-based organizations. Median grant $10K, total $3.2M available.",
        typicalAmount: "10000",
        eligibleEntityTypes: ["508", "501c3"],
        eligibilityRequirements: "Religious organizations, faith-based nonprofits.",
        focusAreas: ["faith_based", "community", "education"],
        applicationUrl: "https://www.instrumentl.com/browse-grants/faith-based-grants",
        priority: "medium" as const,
        status: "researching" as const,
        notes: "Use Instrumentl platform to search and match. 14-day free trial available.",
        addedBy: ctx.user.id,
      },
    ];

    let seededCount = 0;
    for (const grant of grantsToSeed) {
      // Check if grant already exists
      const existing = await db.select()
        .from(grantOpportunities)
        .where(eq(grantOpportunities.name, grant.name));
      
      if (existing.length === 0) {
        await db.insert(grantOpportunities).values(grant);
        seededCount++;
      }
    }

    return { seeded: seededCount, total: grantsToSeed.length };
  }),
});
