import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

/**
 * House Management Router
 * 
 * Handles all House-related operations including:
 * - House templates and pathways
 * - Activation progress tracking
 * - Business-First registration (existing businesses joining ecosystem)
 * - Distribution tier management
 * - Training requirement tracking
 * 
 * KEY PRINCIPLE: For Business-First Houses, the existing business revenue
 * does NOT flow into the House system. Distributions come from the collective
 * pool based on participation and training completion.
 */
export const houseManagementRouter = router({
  // ============================================================================
  // HOUSE TEMPLATES
  // ============================================================================

  // Get all house templates
  getTemplates: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const templates = await db.execute(
      sql`SELECT * FROM house_templates WHERE isActive = TRUE ORDER BY sortOrder ASC`
    );

    return templates as any[];
  }),

  // Get template by code
  getTemplateByCode: publicProcedure
    .input(z.object({ templateCode: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const templates = await db.execute(
        sql`SELECT * FROM house_templates WHERE templateCode = ${input.templateCode}`
      );

      return (templates as any[])[0] || null;
    }),

  // ============================================================================
  // ACTIVATION REQUIREMENTS
  // ============================================================================

  // Get all activation requirements
  getActivationRequirements: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const requirements = await db.execute(
      sql`SELECT * FROM activation_requirements WHERE isActive = TRUE ORDER BY sortOrder ASC`
    );

    return requirements as any[];
  }),

  // Get requirements for a specific template
  getRequirementsForTemplate: publicProcedure
    .input(z.object({ templateCode: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get template first
      const templates = await db.execute(
        sql`SELECT activationRequirements FROM house_templates WHERE templateCode = ${input.templateCode}`
      );

      const template = (templates as any[])[0];
      if (!template || !template.activationRequirements) {
        return [];
      }

      // Parse requirement codes and fetch full requirements
      const requirementCodes = JSON.parse(template.activationRequirements);
      if (!Array.isArray(requirementCodes) || requirementCodes.length === 0) {
        return [];
      }

      const requirements = await db.execute(
        sql`SELECT * FROM activation_requirements 
            WHERE requirementCode IN (${sql.join(requirementCodes.map(c => sql`${c}`), sql`, `)})
            AND isActive = TRUE 
            ORDER BY sortOrder ASC`
      );

      return requirements as any[];
    }),

  // ============================================================================
  // HOUSE MANAGEMENT
  // ============================================================================

  // Get dashboard overview
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get house counts by status
    const statusCounts = await db.execute(
      sql`SELECT status, COUNT(*) as count FROM houses GROUP BY status`
    );

    // Get houses by pathway
    const pathwayCounts = await db.execute(
      sql`SELECT activationPathway, COUNT(*) as count FROM houses WHERE activationPathway IS NOT NULL GROUP BY activationPathway`
    );

    // Get recent activations
    const recentActivations = await db.execute(
      sql`SELECT id, name, status, activationPathway, createdAt 
          FROM houses 
          WHERE status = 'active' 
          ORDER BY updatedAt DESC 
          LIMIT 5`
    );

    // Get pending activations
    const pendingActivations = await db.execute(
      sql`SELECT id, name, status, activationPathway, trainingCompletionStatus, requiredCoursesCompleted, totalRequiredCourses
          FROM houses 
          WHERE status IN ('template', 'forming', 'pending_activation')
          ORDER BY updatedAt DESC 
          LIMIT 10`
    );

    // Get distribution tier breakdown
    const tierCounts = await db.execute(
      sql`SELECT distributionTier, COUNT(*) as count FROM houses WHERE status = 'active' GROUP BY distributionTier`
    );

    return {
      statusCounts: statusCounts as any[],
      pathwayCounts: pathwayCounts as any[],
      recentActivations: recentActivations as any[],
      pendingActivations: pendingActivations as any[],
      tierCounts: tierCounts as any[],
    };
  }),

  // Get all houses (with filtering)
  getAllHouses: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        pathway: z.string().optional(),
        tier: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let baseQuery = sql`SELECT h.*, u.name as ownerName, u.email as ownerEmail
        FROM houses h
        LEFT JOIN users u ON h.ownerUserId = u.id
        WHERE 1=1`;

      if (input.status) {
        baseQuery = sql`${baseQuery} AND h.status = ${input.status}`;
      }
      if (input.pathway) {
        baseQuery = sql`${baseQuery} AND h.activationPathway = ${input.pathway}`;
      }
      if (input.tier) {
        baseQuery = sql`${baseQuery} AND h.distributionTier = ${input.tier}`;
      }

      baseQuery = sql`${baseQuery} ORDER BY h.updatedAt DESC LIMIT ${input.limit} OFFSET ${input.offset}`;

      const houses = await db.execute(baseQuery);
      return houses as any[];
    }),

  // Get house by ID with full details
  getHouseById: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get house
      const houses = await db.execute(
        sql`SELECT h.*, u.name as ownerName, u.email as ownerEmail
            FROM houses h
            LEFT JOIN users u ON h.ownerUserId = u.id
            WHERE h.id = ${input.houseId}`
      );

      const house = (houses as any[])[0];
      if (!house) return null;

      // Get activation progress
      const progress = await db.execute(
        sql`SELECT hap.*, ar.name as requirementName, ar.category, ar.iconName
            FROM house_activation_progress hap
            JOIN activation_requirements ar ON hap.requirementId = ar.id
            WHERE hap.houseId = ${input.houseId}
            ORDER BY ar.sortOrder ASC`
      );

      // Get members
      const members = await db.execute(
        sql`SELECT hm.*, u.name as userName, u.email as userEmail
            FROM house_members hm
            JOIN users u ON hm.userId = u.id
            WHERE hm.houseId = ${input.houseId}`
      );

      // Get sub-entities
      const subEntities = await db.execute(
        sql`SELECT * FROM house_sub_entities WHERE houseId = ${input.houseId}`
      );

      // Get linked business (for business-first)
      let linkedBusiness = null;
      if (house.linkedBusinessEntityId) {
        const businesses = await db.execute(
          sql`SELECT * FROM business_entities WHERE id = ${house.linkedBusinessEntityId}`
        );
        linkedBusiness = (businesses as any[])[0] || null;
      }

      return {
        ...house,
        activationProgress: progress as any[],
        members: members as any[],
        subEntities: subEntities as any[],
        linkedBusiness,
      };
    }),

  // ============================================================================
  // HOUSE CREATION & REGISTRATION
  // ============================================================================

  // Create a new placeholder house from template
  createFromTemplate: protectedProcedure
    .input(
      z.object({
        templateCode: z.string(),
        name: z.string(),
        ownerUserId: z.number(),
        // For business-first pathway
        linkedBusinessEntityId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get template
      const templates = await db.execute(
        sql`SELECT * FROM house_templates WHERE templateCode = ${input.templateCode}`
      );
      const template = (templates as any[])[0];
      if (!template) throw new Error("Template not found");

      // Determine pathway from template
      const pathway = template.targetAudience;

      // Create house
      const result = await db.execute(
        sql`INSERT INTO houses (
          name, houseType, ownerUserId, status, activationPathway, templateId,
          interHouseSplit, interHouseDistribution, intraHouseOperations, intraHouseInheritance,
          linkedBusinessEntityId, businessVerificationStatus, distributionTier, trainingCompletionStatus
        ) VALUES (
          ${input.name}, ${template.defaultHouseType || 'adaptive'}, ${input.ownerUserId}, 'template', ${pathway}, ${template.id},
          ${template.defaultInterHouseSplit}, ${template.defaultInterHouseDistribution},
          ${template.defaultIntraHouseOperations}, ${template.defaultIntraHouseInheritance},
          ${input.linkedBusinessEntityId || null},
          ${input.linkedBusinessEntityId ? 'pending_verification' : 'not_applicable'},
          'observer', 'not_started'
        )`
      );

      const houseId = (result as any).insertId;

      // Initialize activation progress for all requirements
      const requirementCodes = template.activationRequirements ? JSON.parse(template.activationRequirements) : [];
      if (requirementCodes.length > 0) {
        const requirements = await db.execute(
          sql`SELECT id FROM activation_requirements WHERE requirementCode IN (${sql.join(requirementCodes.map((c: string) => sql`${c}`), sql`, `)})`
        );

        for (const req of requirements as any[]) {
          await db.execute(
            sql`INSERT INTO house_activation_progress (houseId, requirementId, status, progressPercentage)
                VALUES (${houseId}, ${req.id}, 'not_started', 0)`
          );
        }
      }

      // Log event
      await db.execute(
        sql`INSERT INTO house_activation_events (houseId, eventType, description, actorUserId, actorType)
            VALUES (${houseId}, 'template_selected', ${`House created from template: ${input.templateCode}`}, ${ctx.user.id}, 'user')`
      );

      return { success: true, houseId };
    }),

  // Register existing business for Business-First pathway
  registerBusinessFirst: protectedProcedure
    .input(
      z.object({
        houseName: z.string(),
        businessEntityId: z.number(),
        ownerUserId: z.number(),
        voluntaryContributionRate: z.number().min(0).max(100).default(0),
        contributionFrequency: z.enum(["none", "monthly", "quarterly", "annually"]).default("none"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify business exists
      const businesses = await db.execute(
        sql`SELECT * FROM business_entities WHERE id = ${input.businessEntityId}`
      );
      const business = (businesses as any[])[0];
      if (!business) throw new Error("Business entity not found");

      // Get business-first template
      const templates = await db.execute(
        sql`SELECT * FROM house_templates WHERE targetAudience = 'business_first' LIMIT 1`
      );
      let template = (templates as any[])[0];

      // Create house with business-first settings
      const result = await db.execute(
        sql`INSERT INTO houses (
          name, houseType, ownerUserId, status, activationPathway, templateId,
          linkedBusinessEntityId, businessVerificationStatus,
          voluntaryContributionRate, contributionFrequency,
          distributionTier, distributionEligible, trainingCompletionStatus,
          interHouseSplit, interHouseDistribution, intraHouseOperations, intraHouseInheritance
        ) VALUES (
          ${input.houseName}, 'adaptive', ${input.ownerUserId}, 'template', 'business_first', ${template?.id || null},
          ${input.businessEntityId}, 'pending_verification',
          ${input.voluntaryContributionRate}, ${input.contributionFrequency},
          'observer', FALSE, 'not_started',
          60.00, 40.00, 70.00, 30.00
        )`
      );

      const houseId = (result as any).insertId;

      // Initialize training requirements
      // Business-First still requires all 8 training modules
      const trainingReqs = await db.execute(
        sql`SELECT id FROM activation_requirements WHERE category = 'training' AND isActive = TRUE`
      );

      for (const req of trainingReqs as any[]) {
        await db.execute(
          sql`INSERT INTO house_activation_progress (houseId, requirementId, status, progressPercentage)
              VALUES (${houseId}, ${req.id}, 'not_started', 0)`
        );
      }

      // Log event
      await db.execute(
        sql`INSERT INTO house_activation_events (houseId, eventType, description, actorUserId, actorType, metadata)
            VALUES (${houseId}, 'template_selected', 'Business-First House registered', ${ctx.user.id}, 'user',
              ${JSON.stringify({ businessEntityId: input.businessEntityId, businessName: business.name })})`
      );

      return { 
        success: true, 
        houseId,
        message: "Business registered. Training completion required before distribution eligibility."
      };
    }),

  // ============================================================================
  // ACTIVATION PROGRESS
  // ============================================================================

  // Update requirement progress
  updateRequirementProgress: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
        requirementId: z.number(),
        status: z.enum(["not_started", "in_progress", "pending_verification", "verified", "failed", "waived"]),
        progressPercentage: z.number().min(0).max(100).optional(),
        progressData: z.any().optional(),
        documentUrls: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let updateQuery = sql`UPDATE house_activation_progress SET status = ${input.status}`;

      if (input.progressPercentage !== undefined) {
        updateQuery = sql`${updateQuery}, progressPercentage = ${input.progressPercentage}`;
      }
      if (input.progressData) {
        updateQuery = sql`${updateQuery}, progressData = ${JSON.stringify(input.progressData)}`;
      }
      if (input.documentUrls) {
        updateQuery = sql`${updateQuery}, documentUrls = ${JSON.stringify(input.documentUrls)}`;
      }
      if (input.status === "verified") {
        updateQuery = sql`${updateQuery}, verifiedAt = NOW(), verifiedByUserId = ${ctx.user.id}`;
      }

      updateQuery = sql`${updateQuery} WHERE houseId = ${input.houseId} AND requirementId = ${input.requirementId}`;

      await db.execute(updateQuery);

      // Log event
      await db.execute(
        sql`INSERT INTO house_activation_events (houseId, eventType, requirementId, newStatus, actorUserId, actorType)
            VALUES (${input.houseId}, 'requirement_completed', ${input.requirementId}, ${input.status}, ${ctx.user.id}, 'user')`
      );

      // Check if all requirements are complete
      await checkActivationEligibility(input.houseId, db);

      return { success: true };
    }),

  // Record training completion
  recordTrainingCompletion: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
        courseId: z.string(),
        score: z.number(),
        passed: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (input.passed) {
        // Increment completed courses
        await db.execute(
          sql`UPDATE houses SET requiredCoursesCompleted = requiredCoursesCompleted + 1 WHERE id = ${input.houseId}`
        );

        // Check if all courses complete
        const houses = await db.execute(
          sql`SELECT requiredCoursesCompleted, totalRequiredCourses FROM houses WHERE id = ${input.houseId}`
        );
        const house = (houses as any[])[0];

        if (house && house.requiredCoursesCompleted >= house.totalRequiredCourses) {
          await db.execute(
            sql`UPDATE houses SET 
                trainingCompletionStatus = 'completed', 
                trainingCompletedAt = NOW(),
                distributionEligible = TRUE,
                distributionTier = 'participant'
                WHERE id = ${input.houseId}`
          );

          // Log event
          await db.execute(
            sql`INSERT INTO house_activation_events (houseId, eventType, description, actorUserId, actorType)
                VALUES (${input.houseId}, 'status_changed', 'All training completed - now eligible for distributions', ${ctx.user.id}, 'system')`
          );
        }
      }

      return { success: true };
    }),

  // ============================================================================
  // BUSINESS VERIFICATION (Business-First pathway)
  // ============================================================================

  // Verify business for Business-First House
  verifyBusiness: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
        verified: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const status = input.verified ? "verified" : "rejected";

      await db.execute(
        sql`UPDATE houses SET 
            businessVerificationStatus = ${status},
            businessVerifiedAt = NOW(),
            businessVerifiedByUserId = ${ctx.user.id}
            WHERE id = ${input.houseId}`
      );

      // Log event
      await db.execute(
        sql`INSERT INTO house_activation_events (houseId, eventType, description, actorUserId, actorType)
            VALUES (${input.houseId}, 'verification_${input.verified ? 'approved' : 'rejected'}', 
              ${input.notes || `Business verification ${status}`}, ${ctx.user.id}, 'admin')`
      );

      return { success: true };
    }),

  // ============================================================================
  // ACTIVATION
  // ============================================================================

  // Activate a house (after all requirements met)
  activateHouse: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify all requirements are met
      const houses = await db.execute(
        sql`SELECT * FROM houses WHERE id = ${input.houseId}`
      );
      const house = (houses as any[])[0];
      if (!house) throw new Error("House not found");

      // Check training completion
      if (house.trainingCompletionStatus !== "completed") {
        throw new Error("Training must be completed before activation");
      }

      // For business-first, check business verification
      if (house.activationPathway === "business_first" && house.businessVerificationStatus !== "verified") {
        throw new Error("Business must be verified before activation");
      }

      // Check all activation requirements
      const incompleteReqs = await db.execute(
        sql`SELECT COUNT(*) as count FROM house_activation_progress 
            WHERE houseId = ${input.houseId} AND status NOT IN ('verified', 'waived')`
      );
      if ((incompleteReqs as any[])[0]?.count > 0) {
        throw new Error("All activation requirements must be completed");
      }

      // Activate the house
      await db.execute(
        sql`UPDATE houses SET 
            status = 'active',
            distributionEligible = TRUE,
            distributionTier = CASE 
              WHEN voluntaryContributionRate > 0 THEN 'contributor'
              ELSE 'participant'
            END
            WHERE id = ${input.houseId}`
      );

      // Log event
      await db.execute(
        sql`INSERT INTO house_activation_events (houseId, eventType, description, actorUserId, actorType)
            VALUES (${input.houseId}, 'activation_completed', 'House successfully activated', ${ctx.user.id}, 'admin')`
      );

      return { success: true, message: "House activated successfully" };
    }),

  // ============================================================================
  // PROJECTED DISTRIBUTIONS
  // ============================================================================

  // Get projected distributions for a house
  getProjectedDistributions: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const projections = await db.execute(
        sql`SELECT * FROM house_projected_distributions 
            WHERE houseId = ${input.houseId} AND isDisplayed = TRUE
            ORDER BY periodStart DESC`
      );

      return projections as any[];
    }),

  // Calculate projected distribution for a house
  calculateProjectedDistribution: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get house details
      const houses = await db.execute(
        sql`SELECT * FROM houses WHERE id = ${input.houseId}`
      );
      const house = (houses as any[])[0];
      if (!house) throw new Error("House not found");

      // Get average distribution from active houses
      const avgDistribution = await db.execute(
        sql`SELECT AVG(totalDistributed) as avgDistributed FROM houses WHERE status = 'active' AND totalDistributed > 0`
      );
      const avg = (avgDistribution as any[])[0]?.avgDistributed || 0;

      // Calculate based on tier
      let multiplier = 0;
      switch (house.distributionTier) {
        case "observer": multiplier = 0; break;
        case "participant": multiplier = 1; break;
        case "contributor": multiplier = 1.5; break;
        case "partner": multiplier = 2; break;
      }

      const projectedNet = avg * multiplier;
      const projectedOps = projectedNet * 0.7;
      const projectedInheritance = projectedNet * 0.3;

      // Store projection
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await db.execute(
        sql`INSERT INTO house_projected_distributions (
          houseId, periodStart, periodEnd, projectedGrossIncome, projectedNetDistribution,
          projectedOperationsAllocation, projectedInheritanceAllocation, calculationMethod
        ) VALUES (
          ${input.houseId}, ${periodStart.toISOString().split('T')[0]}, ${periodEnd.toISOString().split('T')[0]},
          ${projectedNet}, ${projectedNet}, ${projectedOps}, ${projectedInheritance}, 'average_house'
        )`
      );

      return {
        projectedNetDistribution: projectedNet,
        projectedOperationsAllocation: projectedOps,
        projectedInheritanceAllocation: projectedInheritance,
        tier: house.distributionTier,
        multiplier,
      };
    }),

  // ============================================================================
  // VOLUNTARY CONTRIBUTIONS (Business-First)
  // ============================================================================

  // Update voluntary contribution settings
  updateContributionSettings: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
        voluntaryContributionRate: z.number().min(0).max(100),
        contributionFrequency: z.enum(["none", "monthly", "quarterly", "annually"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Update contribution settings
      await db.execute(
        sql`UPDATE houses SET 
            voluntaryContributionRate = ${input.voluntaryContributionRate},
            contributionFrequency = ${input.contributionFrequency}
            WHERE id = ${input.houseId}`
      );

      // If contributing, upgrade tier
      if (input.voluntaryContributionRate > 0) {
        await db.execute(
          sql`UPDATE houses SET distributionTier = 'contributor' 
              WHERE id = ${input.houseId} AND distributionTier = 'participant'`
        );
      }

      return { success: true };
    }),

  // Record a voluntary contribution
  recordContribution: protectedProcedure
    .input(
      z.object({
        houseId: z.number(),
        amount: z.number().positive(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Update house totals
      await db.execute(
        sql`UPDATE houses SET 
            totalContributed = totalContributed + ${input.amount},
            lastContributionDate = NOW()
            WHERE id = ${input.houseId}`
      );

      // Log event
      await db.execute(
        sql`INSERT INTO house_activation_events (houseId, eventType, description, actorUserId, actorType, metadata)
            VALUES (${input.houseId}, 'status_changed', ${input.description || 'Voluntary contribution recorded'}, 
              ${ctx.user.id}, 'user', ${JSON.stringify({ amount: input.amount })})`
      );

      // Award activation credits
      await db.execute(
        sql`INSERT INTO activation_credits (houseId, userId, creditType, credits, description, sourceReferenceType)
            VALUES (${input.houseId}, ${ctx.user.id}, 'bonus', ${Math.floor(input.amount / 100)}, 
              'Credits from voluntary contribution', 'contribution')`
      );

      return { success: true };
    }),
});

// Helper function to check activation eligibility
async function checkActivationEligibility(houseId: number, db: any) {
  const incompleteReqs = await db.execute(
    sql`SELECT COUNT(*) as count FROM house_activation_progress 
        WHERE houseId = ${houseId} AND status NOT IN ('verified', 'waived')`
  );

  if ((incompleteReqs as any[])[0]?.count === 0) {
    // All requirements complete - update status
    await db.execute(
      sql`UPDATE houses SET status = 'pending_activation' WHERE id = ${houseId} AND status IN ('template', 'forming')`
    );
  }
}
