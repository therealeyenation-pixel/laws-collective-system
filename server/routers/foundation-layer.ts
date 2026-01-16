import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  requests,
  approvals,
  assets,
  parcels,
  risks,
  incidents,
  metrics,
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// Helper to ensure db is not null
async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export const foundationLayerRouter = router({
  // ============================================================================
  // REQUEST MANAGEMENT
  // ============================================================================
  
  createRequest: protectedProcedure
    .input(z.object({
      category: z.enum(["equipment", "software", "vehicle", "service", "facility", "training"]),
      itemSpec: z.string().min(1),
      quantity: z.number().int().positive().default(1),
      justification: z.string().min(10),
      costEstimate: z.string().optional(),
      neededBy: z.date().optional(),
      departmentId: z.number().int().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [request] = await db.insert(requests).values({
        requesterId: ctx.user.id,
        departmentId: input.departmentId ?? null,
        category: input.category,
        itemSpec: input.itemSpec,
        quantity: input.quantity,
        justification: input.justification,
        costEstimate: input.costEstimate ?? null,
        neededBy: input.neededBy ?? null,
        status: "pending_manager",
      });
      return { success: true, requestId: request.insertId };
    }),

  getRequests: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "pending_manager", "pending_finance", "pending_executive", "approved", "fulfilled", "closed", "rejected"]).optional(),
      limit: z.number().int().positive().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(requests.status, input.status));
      }
      const results = await db.select()
        .from(requests)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(requests.createdAt))
        .limit(input?.limit ?? 50);
      return results;
    }),

  approveRequest: protectedProcedure
    .input(z.object({
      requestId: z.number().int(),
      stage: z.enum(["manager", "finance", "executive", "board"]),
      decision: z.enum(["approve", "reject", "defer"]),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      
      // Create approval record
      await db.insert(approvals).values({
        requestId: input.requestId,
        approverId: ctx.user.id,
        stage: input.stage,
        decision: input.decision,
        comment: input.comment ?? null,
        decidedAt: new Date(),
        signatureHash: `sig_${Date.now()}_${ctx.user.id}`,
      });

      // Update request status based on decision
      let newStatus: typeof requests.$inferSelect["status"] = "pending_manager";
      if (input.decision === "reject") {
        newStatus = "rejected";
      } else if (input.decision === "approve") {
        const nextStage: Record<string, typeof requests.$inferSelect["status"]> = {
          manager: "pending_finance",
          finance: "pending_executive",
          executive: "approved",
          board: "approved",
        };
        newStatus = nextStage[input.stage] ?? "approved";
      }

      await db.update(requests)
        .set({ status: newStatus })
        .where(eq(requests.id, input.requestId));

      return { success: true, newStatus };
    }),

  // ============================================================================
  // ASSET MANAGEMENT
  // ============================================================================

  createAsset: protectedProcedure
    .input(z.object({
      assetType: z.enum(["laptop", "server", "monitor", "sat_phone", "hotspot", "vehicle", "pod", "license", "furniture", "other"]),
      makeModel: z.string().optional(),
      serialOrVin: z.string().optional(),
      ownerEntity: z.enum(["trust", "business", "academy", "subsidiary"]).default("trust"),
      ownerEntityId: z.number().int().optional(),
      purchaseDate: z.date().optional(),
      purchasePrice: z.string().optional(),
      warrantyExpiry: z.date().optional(),
      maintenanceIntervalDays: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const [asset] = await db.insert(assets).values({
        assetType: input.assetType,
        makeModel: input.makeModel ?? null,
        serialOrVin: input.serialOrVin ?? null,
        ownerEntity: input.ownerEntity,
        ownerEntityId: input.ownerEntityId ?? null,
        purchaseDate: input.purchaseDate ?? null,
        purchasePrice: input.purchasePrice ?? null,
        warrantyExpiry: input.warrantyExpiry ?? null,
        maintenanceIntervalDays: input.maintenanceIntervalDays ?? null,
        status: "in_stock",
      });
      return { success: true, assetId: asset.insertId };
    }),

  getAssets: protectedProcedure
    .input(z.object({
      status: z.enum(["in_stock", "assigned", "maintenance", "retired", "disposed"]).optional(),
      assetType: z.enum(["laptop", "server", "monitor", "sat_phone", "hotspot", "vehicle", "pod", "license", "furniture", "other"]).optional(),
      limit: z.number().int().positive().default(100),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(assets.status, input.status));
      }
      if (input?.assetType) {
        conditions.push(eq(assets.assetType, input.assetType));
      }
      const results = await db.select()
        .from(assets)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(assets.createdAt))
        .limit(input?.limit ?? 100);
      return results;
    }),

  assignAsset: protectedProcedure
    .input(z.object({
      assetId: z.number().int(),
      assignedToUserId: z.number().int().optional(),
      assignedToSiteId: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      await db.update(assets)
        .set({
          assignedToUserId: input.assignedToUserId ?? null,
          assignedToSiteId: input.assignedToSiteId ?? null,
          assignedAt: new Date(),
          status: "assigned",
        })
        .where(eq(assets.id, input.assetId));
      return { success: true };
    }),

  // ============================================================================
  // PARCEL/LAND MANAGEMENT
  // ============================================================================

  createParcel: protectedProcedure
    .input(z.object({
      addressLegalDesc: z.string().min(10),
      parcelNumber: z.string().optional(),
      acquisitionDate: z.date().optional(),
      acquisitionPrice: z.string().optional(),
      currentValue: z.string().optional(),
      useType: z.enum(["hub", "academy", "community", "storage", "agricultural", "residential", "commercial", "mixed"]),
      improvements: z.string().optional(),
      acreage: z.string().optional(),
      ownershipEntity: z.enum(["trust", "subsidiary", "house"]).default("trust"),
      ownershipEntityId: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const [parcel] = await db.insert(parcels).values({
        addressLegalDesc: input.addressLegalDesc,
        parcelNumber: input.parcelNumber ?? null,
        acquisitionDate: input.acquisitionDate ?? null,
        acquisitionPrice: input.acquisitionPrice ?? null,
        currentValue: input.currentValue ?? null,
        useType: input.useType,
        improvements: input.improvements ?? null,
        acreage: input.acreage ?? null,
        ownershipEntity: input.ownershipEntity,
        ownershipEntityId: input.ownershipEntityId ?? null,
        status: "active",
      });
      return { success: true, parcelId: parcel.insertId };
    }),

  getParcels: protectedProcedure
    .input(z.object({
      useType: z.enum(["hub", "academy", "community", "storage", "agricultural", "residential", "commercial", "mixed"]).optional(),
      limit: z.number().int().positive().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      const conditions = [];
      if (input?.useType) {
        conditions.push(eq(parcels.useType, input.useType));
      }
      const results = await db.select()
        .from(parcels)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(parcels.createdAt))
        .limit(input?.limit ?? 50);
      return results;
    }),

  // ============================================================================
  // RISK MANAGEMENT
  // ============================================================================

  createRisk: protectedProcedure
    .input(z.object({
      title: z.string().min(5),
      description: z.string().min(20),
      category: z.enum(["financial", "operational", "legal", "compliance", "reputational", "strategic", "technology", "security"]),
      likelihood: z.enum(["rare", "unlikely", "possible", "likely", "almost_certain"]),
      impact: z.enum(["insignificant", "minor", "moderate", "major", "catastrophic"]),
      mitigationStrategy: z.string().optional(),
      ownerId: z.number().int().optional(),
      reviewDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      
      // Calculate risk score (likelihood x impact)
      const likelihoodScore: Record<string, number> = {
        rare: 1, unlikely: 2, possible: 3, likely: 4, almost_certain: 5
      };
      const impactScore: Record<string, number> = {
        insignificant: 1, minor: 2, moderate: 3, major: 4, catastrophic: 5
      };
      const riskScore = likelihoodScore[input.likelihood] * impactScore[input.impact];

      const [risk] = await db.insert(risks).values({
        title: input.title,
        description: input.description,
        category: input.category,
        likelihood: input.likelihood,
        impact: input.impact,
        riskScore,
        mitigationStrategy: input.mitigationStrategy ?? null,
        mitigationStatus: "not_started",
        ownerId: input.ownerId ?? ctx.user.id,
        reviewDate: input.reviewDate ?? null,
        status: "open",
      });
      return { success: true, riskId: risk.insertId, riskScore };
    }),

  getRisks: protectedProcedure
    .input(z.object({
      status: z.enum(["open", "mitigated", "accepted", "closed"]).optional(),
      category: z.enum(["financial", "operational", "legal", "compliance", "reputational", "strategic", "technology", "security"]).optional(),
      limit: z.number().int().positive().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(risks.status, input.status));
      }
      if (input?.category) {
        conditions.push(eq(risks.category, input.category));
      }
      const results = await db.select()
        .from(risks)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(risks.riskScore))
        .limit(input?.limit ?? 50);
      return results;
    }),

  updateRiskMitigation: protectedProcedure
    .input(z.object({
      riskId: z.number().int(),
      mitigationStrategy: z.string().optional(),
      mitigationStatus: z.enum(["not_started", "in_progress", "implemented", "monitoring"]),
      status: z.enum(["open", "mitigated", "accepted", "closed"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      await db.update(risks)
        .set({
          mitigationStrategy: input.mitigationStrategy,
          mitigationStatus: input.mitigationStatus,
          status: input.status,
        })
        .where(eq(risks.id, input.riskId));
      return { success: true };
    }),

  // ============================================================================
  // INCIDENT MANAGEMENT
  // ============================================================================

  reportIncident: protectedProcedure
    .input(z.object({
      title: z.string().min(5),
      description: z.string().min(20),
      incidentType: z.enum(["security_breach", "data_loss", "system_outage", "compliance_violation", "financial_irregularity", "safety_incident", "other"]),
      severity: z.enum(["low", "medium", "high", "critical"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [incident] = await db.insert(incidents).values({
        title: input.title,
        description: input.description,
        incidentType: input.incidentType,
        severity: input.severity,
        reportedById: ctx.user.id,
        reportedAt: new Date(),
        status: "reported",
      });
      return { success: true, incidentId: incident.insertId };
    }),

  getIncidents: protectedProcedure
    .input(z.object({
      status: z.enum(["reported", "investigating", "resolved", "closed"]).optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      limit: z.number().int().positive().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(incidents.status, input.status));
      }
      if (input?.severity) {
        conditions.push(eq(incidents.severity, input.severity));
      }
      const results = await db.select()
        .from(incidents)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(incidents.reportedAt))
        .limit(input?.limit ?? 50);
      return results;
    }),

  resolveIncident: protectedProcedure
    .input(z.object({
      incidentId: z.number().int(),
      rootCause: z.string().optional(),
      resolution: z.string().min(10),
      preventiveMeasures: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      await db.update(incidents)
        .set({
          rootCause: input.rootCause ?? null,
          resolution: input.resolution,
          preventiveMeasures: input.preventiveMeasures ?? null,
          resolvedAt: new Date(),
          status: "resolved",
        })
        .where(eq(incidents.id, input.incidentId));
      return { success: true };
    }),

  // ============================================================================
  // METRICS & M&E
  // ============================================================================

  createMetric: protectedProcedure
    .input(z.object({
      name: z.string().min(3),
      description: z.string().optional(),
      category: z.enum(["financial", "operational", "program", "hr", "compliance", "impact"]),
      targetValue: z.string().optional(),
      actualValue: z.string().optional(),
      unit: z.string().optional(),
      periodStart: z.date(),
      periodEnd: z.date(),
      departmentId: z.number().int().optional(),
      programId: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      
      // Determine status based on target vs actual
      let status: "on_track" | "at_risk" | "off_track" | "achieved" = "on_track";
      if (input.targetValue && input.actualValue) {
        const target = parseFloat(input.targetValue);
        const actual = parseFloat(input.actualValue);
        const ratio = actual / target;
        if (ratio >= 1) status = "achieved";
        else if (ratio >= 0.8) status = "on_track";
        else if (ratio >= 0.5) status = "at_risk";
        else status = "off_track";
      }

      const [metric] = await db.insert(metrics).values({
        name: input.name,
        description: input.description ?? null,
        category: input.category,
        targetValue: input.targetValue ?? null,
        actualValue: input.actualValue ?? null,
        unit: input.unit ?? null,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        departmentId: input.departmentId ?? null,
        programId: input.programId ?? null,
        status,
      });
      return { success: true, metricId: metric.insertId, status };
    }),

  getMetrics: protectedProcedure
    .input(z.object({
      category: z.enum(["financial", "operational", "program", "hr", "compliance", "impact"]).optional(),
      status: z.enum(["on_track", "at_risk", "off_track", "achieved"]).optional(),
      limit: z.number().int().positive().default(100),
    }).optional())
    .query(async ({ input }) => {
      const db = await requireDb();
      const conditions = [];
      if (input?.category) {
        conditions.push(eq(metrics.category, input.category));
      }
      if (input?.status) {
        conditions.push(eq(metrics.status, input.status));
      }
      const results = await db.select()
        .from(metrics)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(metrics.periodEnd))
        .limit(input?.limit ?? 100);
      return results;
    }),

  getDashboardSummary: protectedProcedure
    .query(async () => {
      const db = await requireDb();
      
      // Get counts for dashboard
      const requestResults = await db.select({
        total: sql<number>`COUNT(*)`,
        pending: sql<number>`SUM(CASE WHEN status LIKE 'pending%' THEN 1 ELSE 0 END)`,
        approved: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`,
      }).from(requests);
      const requestCounts = requestResults[0] ?? { total: 0, pending: 0, approved: 0 };

      const assetResults = await db.select({
        total: sql<number>`COUNT(*)`,
        assigned: sql<number>`SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END)`,
        inStock: sql<number>`SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END)`,
      }).from(assets);
      const assetCounts = assetResults[0] ?? { total: 0, assigned: 0, inStock: 0 };

      const riskResults = await db.select({
        total: sql<number>`COUNT(*)`,
        open: sql<number>`SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END)`,
        highRisk: sql<number>`SUM(CASE WHEN risk_score >= 15 THEN 1 ELSE 0 END)`,
      }).from(risks);
      const riskCounts = riskResults[0] ?? { total: 0, open: 0, highRisk: 0 };

      const incidentResults = await db.select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`SUM(CASE WHEN status IN ('reported', 'investigating') THEN 1 ELSE 0 END)`,
        critical: sql<number>`SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END)`,
      }).from(incidents);
      const incidentCounts = incidentResults[0] ?? { total: 0, active: 0, critical: 0 };

      const metricResults = await db.select({
        total: sql<number>`COUNT(*)`,
        onTrack: sql<number>`SUM(CASE WHEN status = 'on_track' THEN 1 ELSE 0 END)`,
        atRisk: sql<number>`SUM(CASE WHEN status IN ('at_risk', 'off_track') THEN 1 ELSE 0 END)`,
      }).from(metrics);
      const metricCounts = metricResults[0] ?? { total: 0, onTrack: 0, atRisk: 0 };

      return {
        requests: requestCounts,
        assets: assetCounts,
        risks: riskCounts,
        incidents: incidentCounts,
        metrics: metricCounts,
      };
    }),
});
