import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  externalCompanies,
  serviceCatalog,
  serviceSubscriptions,
  serviceIntegrations,
  onboardingProgress,
  companyUsers,
  notifications,
} from "../../drizzle/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";

/**
 * Service catalog with all available L.A.W.S. management services
 */
const SERVICE_CATALOG = [
  {
    serviceCode: "entity_formation",
    serviceName: "Entity Formation & Setup",
    shortDescription: "LLC, Corporation, Trust, and Nonprofit formation with all required documents",
    category: "entity_formation" as const,
    lawsPillar: "land" as const,
    baseMonthlyPrice: "0",
    setupFee: "499",
    pricingModel: "flat" as const,
    features: [
      "State filing preparation",
      "Operating Agreement drafting",
      "EIN application assistance",
      "Registered agent service (1 year)",
      "Corporate book and records",
    ],
    recommendedServices: ["document_vault", "financial_tracking"],
    iconName: "Building2",
    colorTheme: "emerald",
  },
  {
    serviceCode: "payroll_hr",
    serviceName: "Payroll & HR Management",
    shortDescription: "Full-service payroll processing, tax filings, and HR administration",
    category: "payroll_hr" as const,
    lawsPillar: "water" as const,
    baseMonthlyPrice: "49",
    setupFee: "0",
    pricingModel: "per_user" as const,
    features: [
      "Automated payroll processing",
      "Direct deposit",
      "Tax withholding and filing",
      "W-2 and 1099 generation",
      "Employee self-service portal",
      "Time tracking integration",
    ],
    requiredServices: [],
    recommendedServices: ["tax_preparation", "financial_tracking"],
    iconName: "Users",
    colorTheme: "blue",
  },
  {
    serviceCode: "tax_preparation",
    serviceName: "Tax Preparation & Planning",
    shortDescription: "Business and personal tax preparation with strategic planning",
    category: "tax_preparation" as const,
    lawsPillar: "air" as const,
    baseMonthlyPrice: "99",
    setupFee: "0",
    pricingModel: "tiered" as const,
    features: [
      "Business tax return preparation",
      "Quarterly estimated tax calculations",
      "Tax planning strategies",
      "Audit support",
      "Multi-state filing support",
    ],
    recommendedServices: ["payroll_hr", "financial_tracking"],
    iconName: "Calculator",
    colorTheme: "purple",
  },
  {
    serviceCode: "document_vault",
    serviceName: "Secure Document Vault",
    shortDescription: "Encrypted document storage with version control and e-signatures",
    category: "document_management" as const,
    lawsPillar: "air" as const,
    baseMonthlyPrice: "29",
    setupFee: "0",
    pricingModel: "tiered" as const,
    features: [
      "Encrypted cloud storage",
      "Document version history",
      "Electronic signatures",
      "Access control and permissions",
      "Audit trail logging",
      "Document templates",
    ],
    recommendedServices: ["entity_formation", "asset_protection"],
    iconName: "FolderLock",
    colorTheme: "slate",
  },
  {
    serviceCode: "financial_tracking",
    serviceName: "Financial Tracking (LuvLedger)",
    shortDescription: "Comprehensive financial tracking with blockchain verification",
    category: "financial_tracking" as const,
    lawsPillar: "water" as const,
    baseMonthlyPrice: "79",
    setupFee: "0",
    pricingModel: "flat" as const,
    features: [
      "Real-time financial dashboard",
      "Multi-entity tracking",
      "Blockchain audit trail",
      "Automated categorization",
      "Custom reporting",
      "Budget management",
    ],
    recommendedServices: ["payroll_hr", "tax_preparation"],
    iconName: "LineChart",
    colorTheme: "green",
  },
  {
    serviceCode: "education_academy",
    serviceName: "L.A.W.S. Academy Access",
    shortDescription: "Financial literacy and business education for your team",
    category: "education_training" as const,
    lawsPillar: "air" as const,
    baseMonthlyPrice: "19",
    setupFee: "0",
    pricingModel: "per_user" as const,
    features: [
      "Financial literacy courses",
      "Business development training",
      "Certification programs",
      "Interactive simulators",
      "Progress tracking",
      "Team leaderboards",
    ],
    recommendedServices: ["consulting"],
    iconName: "GraduationCap",
    colorTheme: "amber",
  },
  {
    serviceCode: "asset_protection",
    serviceName: "Asset Protection Suite",
    shortDescription: "Trust formation, estate planning, and asset protection strategies",
    category: "asset_protection" as const,
    lawsPillar: "land" as const,
    baseMonthlyPrice: "149",
    setupFee: "299",
    pricingModel: "flat" as const,
    features: [
      "Trust document preparation",
      "Estate planning consultation",
      "Asset protection strategies",
      "Healthcare directives",
      "Power of Attorney documents",
      "Annual review and updates",
    ],
    requiredServices: ["document_vault"],
    recommendedServices: ["entity_formation"],
    iconName: "Shield",
    colorTheme: "indigo",
  },
  {
    serviceCode: "compliance",
    serviceName: "Compliance Management",
    shortDescription: "Annual reports, registered agent, and regulatory compliance",
    category: "compliance" as const,
    lawsPillar: "self" as const,
    baseMonthlyPrice: "39",
    setupFee: "0",
    pricingModel: "flat" as const,
    features: [
      "Annual report filing",
      "Registered agent service",
      "Compliance calendar",
      "State requirement tracking",
      "Good standing maintenance",
      "Deadline reminders",
    ],
    recommendedServices: ["entity_formation", "document_vault"],
    iconName: "ClipboardCheck",
    colorTheme: "rose",
  },
  {
    serviceCode: "consulting",
    serviceName: "Business Consulting",
    shortDescription: "Strategic business consulting and advisory services",
    category: "consulting" as const,
    lawsPillar: "self" as const,
    baseMonthlyPrice: "299",
    setupFee: "0",
    pricingModel: "flat" as const,
    features: [
      "Monthly strategy sessions",
      "Business plan development",
      "Growth planning",
      "Operational optimization",
      "Financial analysis",
      "Priority support",
    ],
    recommendedServices: ["financial_tracking", "education_academy"],
    iconName: "Lightbulb",
    colorTheme: "yellow",
  },
  {
    serviceCode: "technology_platform",
    serviceName: "Technology Platform",
    shortDescription: "Custom dashboards, integrations, and automation tools",
    category: "technology" as const,
    lawsPillar: "air" as const,
    baseMonthlyPrice: "199",
    setupFee: "499",
    pricingModel: "flat" as const,
    features: [
      "Custom dashboard",
      "API access",
      "Third-party integrations",
      "Workflow automation",
      "Custom reporting",
      "White-label options",
    ],
    recommendedServices: ["financial_tracking"],
    iconName: "Cpu",
    colorTheme: "cyan",
  },
];

/**
 * Tier pricing configuration
 */
const TIER_CONFIG = {
  standalone: {
    name: "Standalone",
    description: "Individual services without integrations",
    multiplier: 1.0,
    features: [
      "Single service access",
      "Basic support",
      "Standard features",
    ],
  },
  connected: {
    name: "Connected",
    description: "Services with recommended integrations enabled",
    multiplier: 0.85,
    discount: "15%",
    features: [
      "Multi-service access",
      "Data sync between services",
      "Priority support",
      "Enhanced reporting",
    ],
  },
  full_suite: {
    name: "Full Suite",
    description: "All services connected through LuvLedger hub",
    multiplier: 0.70,
    discount: "30%",
    features: [
      "All services included",
      "Full integration suite",
      "Dedicated support",
      "Custom workflows",
      "White-glove onboarding",
    ],
  },
};

/**
 * Onboarding steps configuration
 */
const ONBOARDING_STEPS = [
  { stepNumber: 1, stepName: "Company Profile", stepCategory: "profile" as const, estimatedMinutes: 10 },
  { stepNumber: 2, stepName: "Select Services", stepCategory: "services" as const, estimatedMinutes: 15 },
  { stepNumber: 3, stepName: "Configure Integrations", stepCategory: "integrations" as const, estimatedMinutes: 10 },
  { stepNumber: 4, stepName: "Payment Setup", stepCategory: "payment" as const, estimatedMinutes: 5 },
  { stepNumber: 5, stepName: "Verification", stepCategory: "verification" as const, estimatedMinutes: 5 },
  { stepNumber: 6, stepName: "Training & Activation", stepCategory: "training" as const, estimatedMinutes: 20 },
];

export const externalOnboardingRouter = router({
  /**
   * Get service catalog
   */
  getServiceCatalog: publicProcedure.query(async () => {
    return {
      services: SERVICE_CATALOG,
      tiers: TIER_CONFIG,
    };
  }),

  /**
   * Calculate pricing for selected services
   */
  calculatePricing: publicProcedure
    .input(
      z.object({
        serviceCodes: z.array(z.string()),
        tier: z.enum(["standalone", "connected", "full_suite"]),
        billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
        userCount: z.number().min(1).default(1),
      })
    )
    .query(async ({ input }) => {
      const selectedServices = SERVICE_CATALOG.filter((s) =>
        input.serviceCodes.includes(s.serviceCode)
      );

      const tierMultiplier = TIER_CONFIG[input.tier].multiplier;
      const annualDiscount = input.billingCycle === "annual" ? 0.9 : 1; // 10% annual discount

      let monthlyTotal = 0;
      let setupTotal = 0;
      const breakdown: Array<{
        serviceCode: string;
        serviceName: string;
        basePrice: number;
        adjustedPrice: number;
        setupFee: number;
      }> = [];

      for (const service of selectedServices) {
        const basePrice = parseFloat(service.baseMonthlyPrice);
        let adjustedPrice = basePrice * tierMultiplier;

        // Per-user pricing
        if (service.pricingModel === "per_user") {
          adjustedPrice *= input.userCount;
        }

        monthlyTotal += adjustedPrice;
        setupTotal += parseFloat(service.setupFee);

        breakdown.push({
          serviceCode: service.serviceCode,
          serviceName: service.serviceName,
          basePrice,
          adjustedPrice: Math.round(adjustedPrice * 100) / 100,
          setupFee: parseFloat(service.setupFee),
        });
      }

      const monthlyWithAnnualDiscount = monthlyTotal * annualDiscount;
      const annualTotal = monthlyWithAnnualDiscount * 12;

      return {
        tier: input.tier,
        tierName: TIER_CONFIG[input.tier].name,
        tierDiscount: TIER_CONFIG[input.tier].discount || "0%",
        billingCycle: input.billingCycle,
        userCount: input.userCount,
        breakdown,
        monthlySubtotal: Math.round(monthlyTotal * 100) / 100,
        monthlyTotal: Math.round(monthlyWithAnnualDiscount * 100) / 100,
        annualTotal: Math.round(annualTotal * 100) / 100,
        setupFees: setupTotal,
        firstPayment:
          input.billingCycle === "annual"
            ? Math.round((annualTotal + setupTotal) * 100) / 100
            : Math.round((monthlyWithAnnualDiscount + setupTotal) * 100) / 100,
      };
    }),

  /**
   * Start company onboarding
   */
  startOnboarding: publicProcedure
    .input(
      z.object({
        companyName: z.string().min(2),
        entityType: z.enum([
          "llc", "corporation", "s_corp", "partnership", "sole_proprietor", "nonprofit", "trust", "other"
        ]),
        primaryContactName: z.string().min(2),
        primaryContactEmail: z.string().email(),
        primaryContactPhone: z.string().optional(),
        referralCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Create company record
      const [result] = await db.insert(externalCompanies).values({
        companyName: input.companyName,
        entityType: input.entityType,
        primaryContactName: input.primaryContactName,
        primaryContactEmail: input.primaryContactEmail,
        primaryContactPhone: input.primaryContactPhone,
        referralCode: input.referralCode,
        status: "onboarding",
        onboardingStep: 1,
      });

      const companyId = result.insertId;

      // Create onboarding progress records
      for (const step of ONBOARDING_STEPS) {
        await db.insert(onboardingProgress).values({
          companyId,
          ...step,
          status: step.stepNumber === 1 ? "in_progress" : "not_started",
        });
      }

      // Notify owner of new company signup
      await notifyOwner({
        title: "New Company Onboarding Started",
        content: `${input.companyName} (${input.entityType}) has started onboarding. Contact: ${input.primaryContactName} <${input.primaryContactEmail}>`,
      });

      return {
        companyId,
        message: "Onboarding started successfully",
      };
    }),

  /**
   * Update company profile
   */
  updateCompanyProfile: publicProcedure
    .input(
      z.object({
        companyId: z.number(),
        legalName: z.string().optional(),
        ein: z.string().optional(),
        stateOfFormation: z.string().optional(),
        streetAddress: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        industry: z.string().optional(),
        employeeCount: z.enum(["1", "2_10", "11_50", "51_200", "201_500", "500_plus"]).optional(),
        annualRevenue: z.enum([
          "under_100k", "100k_500k", "500k_1m", "1m_5m", "5m_10m", "10m_plus"
        ]).optional(),
        yearFounded: z.number().optional(),
        website: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { companyId, ...updateData } = input;

      await db
        .update(externalCompanies)
        .set(updateData)
        .where(eq(externalCompanies.id, companyId));

      // Update onboarding progress
      await db
        .update(onboardingProgress)
        .set({
          status: "completed",
          completedAt: new Date(),
        })
        .where(
          and(
            eq(onboardingProgress.companyId, companyId),
            eq(onboardingProgress.stepNumber, 1)
          )
        );

      // Start next step
      await db
        .update(onboardingProgress)
        .set({ status: "in_progress", startedAt: new Date() })
        .where(
          and(
            eq(onboardingProgress.companyId, companyId),
            eq(onboardingProgress.stepNumber, 2)
          )
        );

      await db
        .update(externalCompanies)
        .set({ onboardingStep: 2 })
        .where(eq(externalCompanies.id, companyId));

      return { success: true };
    }),

  /**
   * Select services and tier
   */
  selectServices: publicProcedure
    .input(
      z.object({
        companyId: z.number(),
        serviceCodes: z.array(z.string()),
        tier: z.enum(["standalone", "connected", "full_suite"]),
        billingCycle: z.enum(["monthly", "annual"]),
      })
    )
    .mutation(async ({ input }) => {
      // Update company tier
      await db
        .update(externalCompanies)
        .set({ subscriptionTier: input.tier })
        .where(eq(externalCompanies.id, input.companyId));

      // Get service details
      const selectedServices = SERVICE_CATALOG.filter((s) =>
        input.serviceCodes.includes(s.serviceCode)
      );

      const tierMultiplier = TIER_CONFIG[input.tier].multiplier;

      // Create subscriptions for each service
      for (const service of selectedServices) {
        const basePrice = parseFloat(service.baseMonthlyPrice);
        const adjustedPrice = basePrice * tierMultiplier;

        // Check if subscription already exists
        const existing = await db
          .select()
          .from(serviceSubscriptions)
          .where(
            and(
              eq(serviceSubscriptions.companyId, input.companyId),
              sql`${serviceSubscriptions.serviceId} = (SELECT id FROM service_catalog WHERE serviceCode = ${service.serviceCode} LIMIT 1)`
            )
          )
          .limit(1);

        if (existing.length === 0) {
          // We need to get or create the service in the catalog first
          // For now, we'll use a placeholder serviceId
          await db.insert(serviceSubscriptions).values({
            companyId: input.companyId,
            serviceId: SERVICE_CATALOG.indexOf(service) + 1, // Temporary ID
            status: "pending_setup",
            monthlyPrice: adjustedPrice.toFixed(2),
            annualPrice: (adjustedPrice * 12 * 0.9).toFixed(2),
            billingCycle: input.billingCycle,
          });
        }
      }

      // Update onboarding progress
      await db
        .update(onboardingProgress)
        .set({ status: "completed", completedAt: new Date() })
        .where(
          and(
            eq(onboardingProgress.companyId, input.companyId),
            eq(onboardingProgress.stepNumber, 2)
          )
        );

      await db
        .update(onboardingProgress)
        .set({ status: "in_progress", startedAt: new Date() })
        .where(
          and(
            eq(onboardingProgress.companyId, input.companyId),
            eq(onboardingProgress.stepNumber, 3)
          )
        );

      await db
        .update(externalCompanies)
        .set({ onboardingStep: 3 })
        .where(eq(externalCompanies.id, input.companyId));

      return { success: true, servicesAdded: selectedServices.length };
    }),

  /**
   * Get company onboarding status
   */
  getOnboardingStatus: publicProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      const [company] = await db
        .select()
        .from(externalCompanies)
        .where(eq(externalCompanies.id, input.companyId))
        .limit(1);

      if (!company) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
      }

      const progress = await db
        .select()
        .from(onboardingProgress)
        .where(eq(onboardingProgress.companyId, input.companyId))
        .orderBy(onboardingProgress.stepNumber);

      const subscriptions = await db
        .select()
        .from(serviceSubscriptions)
        .where(eq(serviceSubscriptions.companyId, input.companyId));

      return {
        company,
        progress,
        subscriptions,
        currentStep: company.onboardingStep,
        totalSteps: ONBOARDING_STEPS.length,
        percentComplete: Math.round(
          (progress.filter((p) => p.status === "completed").length / ONBOARDING_STEPS.length) * 100
        ),
      };
    }),

  /**
   * Complete onboarding and activate services
   */
  completeOnboarding: publicProcedure
    .input(z.object({ companyId: z.number() }))
    .mutation(async ({ input }) => {
      // Update company status
      await db
        .update(externalCompanies)
        .set({
          status: "active",
          onboardingCompletedAt: new Date(),
        })
        .where(eq(externalCompanies.id, input.companyId));

      // Activate all subscriptions
      await db
        .update(serviceSubscriptions)
        .set({
          status: "active",
          startDate: new Date().toISOString().split("T")[0],
        })
        .where(eq(serviceSubscriptions.companyId, input.companyId));

      // Mark all onboarding steps as complete
      await db
        .update(onboardingProgress)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(onboardingProgress.companyId, input.companyId));

      // Get company details for notification
      const [company] = await db
        .select()
        .from(externalCompanies)
        .where(eq(externalCompanies.id, input.companyId))
        .limit(1);

      // Notify owner
      await notifyOwner({
        title: "Company Onboarding Completed",
        content: `${company.companyName} has completed onboarding and services are now active. Tier: ${company.subscriptionTier}`,
      });

      return {
        success: true,
        message: "Onboarding completed! Services are now active.",
      };
    }),

  /**
   * Get all external companies (admin)
   */
  getAllCompanies: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending_verification", "onboarding", "active", "suspended", "cancelled"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const conditions = [];
      if (input.status) {
        conditions.push(eq(externalCompanies.status, input.status));
      }

      const companies = await db
        .select()
        .from(externalCompanies)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(externalCompanies.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return companies;
    }),

  /**
   * Seed service catalog to database
   */
  seedServiceCatalog: protectedProcedure.mutation(async () => {
    let seeded = 0;

    for (const service of SERVICE_CATALOG) {
      // Check if service already exists
      const existing = await db
        .select()
        .from(serviceCatalog)
        .where(eq(serviceCatalog.serviceCode, service.serviceCode))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(serviceCatalog).values({
          serviceCode: service.serviceCode,
          serviceName: service.serviceName,
          shortDescription: service.shortDescription,
          category: service.category,
          lawsPillar: service.lawsPillar,
          baseMonthlyPrice: service.baseMonthlyPrice,
          setupFee: service.setupFee,
          pricingModel: service.pricingModel,
          features: service.features,
          requiredServices: service.requiredServices || [],
          recommendedServices: service.recommendedServices || [],
          iconName: service.iconName,
          colorTheme: service.colorTheme,
          availableStandalone: true,
          availableConnected: true,
          availableFullSuite: true,
        });
        seeded++;
      }
    }

    return { seeded, total: SERVICE_CATALOG.length };
  }),

  /**
   * Get available integrations for a company's subscribed services
   */
  getAvailableIntegrations: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      // Get company's subscribed services
      const subscriptions = await db
        .select()
        .from(serviceSubscriptions)
        .where(
          and(
            eq(serviceSubscriptions.companyId, input.companyId),
            inArray(serviceSubscriptions.status, ["active", "trial"])
          )
        );

      const serviceCodes = subscriptions.map((s) => {
        // Get service code from serviceId
        const service = SERVICE_CATALOG.find((_, idx) => idx + 1 === s.serviceId);
        return service?.serviceCode;
      }).filter(Boolean);

      // Define possible integrations between services
      const INTEGRATION_MATRIX = [
        {
          source: "payroll_hr",
          target: "tax_preparation",
          type: "data_sync",
          name: "Payroll → Tax Prep",
          description: "Automatically sync W-2 data, payroll summaries, and tax withholdings",
          mandatory: true,
        },
        {
          source: "payroll_hr",
          target: "financial_tracking",
          type: "data_sync",
          name: "Payroll → Financial Tracking",
          description: "Sync payroll expenses and liabilities to your financial ledger",
          mandatory: false,
        },
        {
          source: "entity_formation",
          target: "document_vault",
          type: "data_sync",
          name: "Entity → Document Vault",
          description: "Store formation documents, operating agreements, and corporate records",
          mandatory: true,
        },
        {
          source: "document_vault",
          target: "asset_protection",
          type: "workflow",
          name: "Document Vault → Asset Protection",
          description: "Link protection documents with secure storage and e-signatures",
          mandatory: true,
        },
        {
          source: "tax_preparation",
          target: "financial_tracking",
          type: "data_sync",
          name: "Tax Prep → Financial Tracking",
          description: "Import financial data for tax calculations and planning",
          mandatory: false,
        },
        {
          source: "financial_tracking",
          target: "tax_preparation",
          type: "reporting",
          name: "Financial Tracking → Tax Prep",
          description: "Generate tax-ready reports and schedules",
          mandatory: false,
        },
        {
          source: "academy_training",
          target: "credential_management",
          type: "workflow",
          name: "Academy → Credentials",
          description: "Issue credentials upon course completion",
          mandatory: false,
        },
      ];

      // Filter integrations based on subscribed services
      const availableIntegrations = INTEGRATION_MATRIX.filter(
        (int) =>
          serviceCodes.includes(int.source) && serviceCodes.includes(int.target)
      );

      // Get existing integrations
      const existingIntegrations = await db
        .select()
        .from(serviceIntegrations)
        .where(eq(serviceIntegrations.companyId, input.companyId));

      return {
        available: availableIntegrations.map((int) => ({
          ...int,
          isConfigured: existingIntegrations.some(
            (e) =>
              SERVICE_CATALOG[e.sourceServiceId - 1]?.serviceCode === int.source &&
              SERVICE_CATALOG[e.targetServiceId - 1]?.serviceCode === int.target
          ),
        })),
        configured: existingIntegrations,
      };
    }),

  /**
   * Configure an integration between two services
   */
  configureIntegration: protectedProcedure
    .input(
      z.object({
        companyId: z.number(),
        sourceServiceCode: z.string(),
        targetServiceCode: z.string(),
        integrationType: z.enum(["data_sync", "workflow", "reporting", "notification", "payment"]),
        syncDirection: z.enum(["one_way", "bidirectional"]).default("one_way"),
        syncFrequency: z.enum(["realtime", "hourly", "daily", "weekly", "manual"]).default("daily"),
        fieldMappings: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Find service IDs
      const sourceIdx = SERVICE_CATALOG.findIndex((s) => s.serviceCode === input.sourceServiceCode);
      const targetIdx = SERVICE_CATALOG.findIndex((s) => s.serviceCode === input.targetServiceCode);

      if (sourceIdx === -1 || targetIdx === -1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid service codes",
        });
      }

      // Check if integration already exists
      const existing = await db
        .select()
        .from(serviceIntegrations)
        .where(
          and(
            eq(serviceIntegrations.companyId, input.companyId),
            eq(serviceIntegrations.sourceServiceId, sourceIdx + 1),
            eq(serviceIntegrations.targetServiceId, targetIdx + 1)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(serviceIntegrations)
          .set({
            integrationType: input.integrationType,
            syncDirection: input.syncDirection,
            syncFrequency: input.syncFrequency,
            fieldMappings: input.fieldMappings || {},
            status: "active",
            enabledAt: new Date(),
            enabledBy: ctx.user.id,
          })
          .where(eq(serviceIntegrations.id, existing[0].id));

        return { success: true, integrationId: existing[0].id, action: "updated" };
      }

      // Create new integration
      const [result] = await db.insert(serviceIntegrations).values({
        companyId: input.companyId,
        sourceServiceId: sourceIdx + 1,
        targetServiceId: targetIdx + 1,
        integrationType: input.integrationType,
        syncDirection: input.syncDirection,
        syncFrequency: input.syncFrequency,
        fieldMappings: input.fieldMappings || {},
        status: "active",
        enabledAt: new Date(),
        enabledBy: ctx.user.id,
      });

      return { success: true, integrationId: result.insertId, action: "created" };
    }),

  /**
   * Disable an integration
   */
  disableIntegration: protectedProcedure
    .input(z.object({ integrationId: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(serviceIntegrations)
        .set({ status: "disabled" })
        .where(eq(serviceIntegrations.id, input.integrationId));

      return { success: true };
    }),

  /**
   * Get company dashboard data
   */
  getCompanyDashboard: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      // Get company
      const [company] = await db
        .select()
        .from(externalCompanies)
        .where(eq(externalCompanies.id, input.companyId))
        .limit(1);

      if (!company) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
      }

      // Get subscriptions
      const subscriptions = await db
        .select()
        .from(serviceSubscriptions)
        .where(eq(serviceSubscriptions.companyId, input.companyId));

      // Get integrations
      const integrations = await db
        .select()
        .from(serviceIntegrations)
        .where(eq(serviceIntegrations.companyId, input.companyId));

      // Get users
      const users = await db
        .select()
        .from(companyUsers)
        .where(eq(companyUsers.companyId, input.companyId));

      // Get onboarding progress
      const progress = await db
        .select()
        .from(onboardingProgress)
        .where(eq(onboardingProgress.companyId, input.companyId))
        .orderBy(onboardingProgress.stepNumber);

      // Calculate stats
      const activeServices = subscriptions.filter((s) => s.status === "active").length;
      const activeIntegrations = integrations.filter((i) => i.status === "active").length;
      const completedSteps = progress.filter((p) => p.status === "completed").length;
      const totalSteps = progress.length || 6;

      return {
        company,
        subscriptions: subscriptions.map((s) => ({
          ...s,
          service: SERVICE_CATALOG[s.serviceId - 1] || null,
        })),
        integrations,
        users,
        onboardingProgress: progress,
        stats: {
          activeServices,
          activeIntegrations,
          totalUsers: users.length,
          onboardingCompletion: Math.round((completedSteps / totalSteps) * 100),
        },
      };
    }),

  /**
   * Invite a user to the company
   */
  inviteUser: protectedProcedure
    .input(
      z.object({
        companyId: z.number(),
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        role: z.enum(["owner", "admin", "manager", "staff", "readonly", "billing"]).default("staff"),
        permissions: z.record(z.boolean()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Generate invite token
      const inviteToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

      const [result] = await db.insert(companyUsers).values({
        companyId: input.companyId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        permissions: input.permissions || {},
        status: "invited",
        invitedAt: new Date(),
        invitedBy: ctx.user.id,
        inviteToken,
        inviteExpiresAt: expiresAt,
      });

      // TODO: Send invitation email

      return {
        success: true,
        userId: result.insertId,
        inviteToken,
        expiresAt,
      };
    }),

  /**
   * Accept user invitation
   */
  acceptInvitation: publicProcedure
    .input(z.object({ inviteToken: z.string() }))
    .mutation(async ({ input }) => {
      const [invite] = await db
        .select()
        .from(companyUsers)
        .where(eq(companyUsers.inviteToken, input.inviteToken))
        .limit(1);

      if (!invite) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invitation" });
      }

      if (invite.inviteExpiresAt && new Date() > invite.inviteExpiresAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invitation has expired" });
      }

      if (invite.status !== "invited") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invitation already used" });
      }

      await db
        .update(companyUsers)
        .set({
          status: "active",
          acceptedAt: new Date(),
          inviteToken: null,
        })
        .where(eq(companyUsers.id, invite.id));

      return { success: true, companyId: invite.companyId };
    }),
});

export type ExternalOnboardingRouter = typeof externalOnboardingRouter;
