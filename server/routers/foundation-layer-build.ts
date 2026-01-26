/**
 * Foundation Layer Build Router
 * M&E Dashboard, Risk & Contingency, Facilities & Land Registry
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import {
  calculateMetricStatus,
  calculateTrend,
  createMEMetricData,
  generateMEReportSummary,
  calculateRiskScore,
  getRiskLevel,
  createRiskData,
  prioritizeRisks,
  getRiskMatrix,
  calculateFacilityROI,
  createFacilityData,
  createLandParcelData,
  calculateLandAppreciation,
  getFoundationLayerSummary
} from "../services/foundation-layer-build";

export const foundationLayerBuildRouter = router({
  // Get summary
  getSummary: protectedProcedure.query(async () => {
    return getFoundationLayerSummary();
  }),

  // === M&E DASHBOARD ===

  // Create M&E metric
  createMetric: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      category: z.enum(["output", "outcome", "impact"]),
      targetValue: z.number(),
      unit: z.string(),
      frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annual"])
    }))
    .mutation(async ({ input }) => {
      const metricData = createMEMetricData(
        input.name,
        input.category,
        input.targetValue,
        input.unit,
        input.frequency
      );

      const result = await db.execute({
        sql: `INSERT INTO me_metrics (name, category, target_value, current_value, unit, frequency, last_updated, trend, status)
              VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
        args: [
          metricData.name,
          metricData.category,
          metricData.targetValue,
          metricData.currentValue,
          metricData.unit,
          metricData.frequency,
          metricData.trend,
          metricData.status
        ]
      });

      return { success: true, metricId: result.insertId };
    }),

  // Update metric value
  updateMetricValue: protectedProcedure
    .input(z.object({
      metricId: z.number(),
      value: z.number(),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Get current metric
      const metric = await db.execute({
        sql: `SELECT target_value FROM me_metrics WHERE id = ?`,
        args: [input.metricId]
      });

      if (metric.rows.length === 0) {
        throw new Error("Metric not found");
      }

      const targetValue = (metric.rows[0] as any).target_value;
      const status = calculateMetricStatus(input.value, targetValue);

      // Record indicator
      await db.execute({
        sql: `INSERT INTO me_indicators (metric_id, period, value, notes, recorded_at, recorded_by)
              VALUES (?, ?, ?, ?, NOW(), ?)`,
        args: [input.metricId, new Date().toISOString().slice(0, 7), input.value, input.notes || null, ctx.user.id]
      });

      // Update metric
      await db.execute({
        sql: `UPDATE me_metrics SET current_value = ?, status = ?, last_updated = NOW() WHERE id = ?`,
        args: [input.value, status, input.metricId]
      });

      return { success: true, status };
    }),

  // Get all metrics
  getMetrics: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM me_metrics ORDER BY category, name`
    });

    return results.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      targetValue: row.target_value,
      currentValue: row.current_value,
      unit: row.unit,
      frequency: row.frequency,
      lastUpdated: row.last_updated,
      trend: row.trend,
      status: row.status
    }));
  }),

  // Get M&E dashboard summary
  getMEDashboard: protectedProcedure.query(async () => {
    const metrics = await db.execute({
      sql: `SELECT * FROM me_metrics`
    });

    const metricsData = metrics.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      targetValue: row.target_value,
      currentValue: row.current_value,
      unit: row.unit,
      frequency: row.frequency,
      lastUpdated: row.last_updated,
      trend: row.trend,
      status: row.status
    }));

    return generateMEReportSummary(metricsData as any);
  }),

  // === RISK & CONTINGENCY ===

  // Create risk
  createRisk: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string(),
      category: z.enum(["strategic", "operational", "financial", "compliance", "reputational"]),
      likelihood: z.number().min(1).max(5),
      impact: z.number().min(1).max(5)
    }))
    .mutation(async ({ ctx, input }) => {
      const riskData = createRiskData(
        input.title,
        input.description,
        input.category,
        input.likelihood as any,
        input.impact as any,
        ctx.user.id
      );

      const result = await db.execute({
        sql: `INSERT INTO risks (title, description, category, likelihood, impact, risk_score, status, owner, review_date, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        args: [
          riskData.title,
          riskData.description,
          riskData.category,
          riskData.likelihood,
          riskData.impact,
          riskData.riskScore,
          riskData.status,
          riskData.owner,
          riskData.reviewDate.toISOString()
        ]
      });

      return {
        success: true,
        riskId: result.insertId,
        riskScore: riskData.riskScore,
        riskLevel: getRiskLevel(riskData.riskScore)
      };
    }),

  // Update risk assessment
  assessRisk: protectedProcedure
    .input(z.object({
      riskId: z.number(),
      likelihood: z.number().min(1).max(5),
      impact: z.number().min(1).max(5),
      notes: z.string(),
      recommendations: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const currentRisk = await db.execute({
        sql: `SELECT risk_score FROM risks WHERE id = ?`,
        args: [input.riskId]
      });

      if (currentRisk.rows.length === 0) {
        throw new Error("Risk not found");
      }

      const previousScore = (currentRisk.rows[0] as any).risk_score;
      const newScore = calculateRiskScore(input.likelihood, input.impact);

      // Record assessment
      await db.execute({
        sql: `INSERT INTO risk_assessments (risk_id, assessed_by, assessed_at, previous_score, new_score, notes, recommendations)
              VALUES (?, ?, NOW(), ?, ?, ?, ?)`,
        args: [
          input.riskId,
          ctx.user.id,
          previousScore,
          newScore,
          input.notes,
          JSON.stringify(input.recommendations || [])
        ]
      });

      // Update risk
      await db.execute({
        sql: `UPDATE risks SET likelihood = ?, impact = ?, risk_score = ?, status = 'assessed' WHERE id = ?`,
        args: [input.likelihood, input.impact, newScore, input.riskId]
      });

      return {
        success: true,
        previousScore,
        newScore,
        riskLevel: getRiskLevel(newScore)
      };
    }),

  // Get all risks
  getRisks: protectedProcedure
    .input(z.object({
      category: z.enum(["strategic", "operational", "financial", "compliance", "reputational", "all"]).default("all")
    }))
    .query(async ({ input }) => {
      let sql = `SELECT r.*, u.name as owner_name FROM risks r LEFT JOIN users u ON r.owner = u.id`;
      const args: any[] = [];

      if (input.category !== "all") {
        sql += ` WHERE r.category = ?`;
        args.push(input.category);
      }

      sql += ` ORDER BY r.risk_score DESC`;

      const results = await db.execute({ sql, args });

      return results.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        likelihood: row.likelihood,
        impact: row.impact,
        riskScore: row.risk_score,
        riskLevel: getRiskLevel(row.risk_score),
        status: row.status,
        owner: row.owner,
        ownerName: row.owner_name,
        mitigationPlan: row.mitigation_plan,
        contingencyPlan: row.contingency_plan,
        reviewDate: row.review_date,
        createdAt: row.created_at
      }));
    }),

  // Get risk matrix
  getRiskMatrix: protectedProcedure.query(async () => {
    return getRiskMatrix();
  }),

  // Create contingency plan
  createContingencyPlan: protectedProcedure
    .input(z.object({
      riskId: z.number(),
      title: z.string().min(1),
      triggerConditions: z.array(z.string()),
      actions: z.array(z.object({
        order: z.number(),
        action: z.string(),
        responsible: z.string(),
        timeframe: z.string(),
        dependencies: z.array(z.string())
      })),
      resources: z.array(z.string()),
      estimatedCost: z.number(),
      timeToActivate: z.string()
    }))
    .mutation(async ({ input }) => {
      const result = await db.execute({
        sql: `INSERT INTO contingency_plans (risk_id, title, trigger_conditions, actions, resources, estimated_cost, time_to_activate, status, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', NOW())`,
        args: [
          input.riskId,
          input.title,
          JSON.stringify(input.triggerConditions),
          JSON.stringify(input.actions),
          JSON.stringify(input.resources),
          input.estimatedCost,
          input.timeToActivate
        ]
      });

      return { success: true, planId: result.insertId };
    }),

  // === FACILITIES & LAND REGISTRY ===

  // Create facility
  createFacility: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(["office", "warehouse", "production", "retail", "residential", "land"]),
      address: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      squareFootage: z.number(),
      ownershipType: z.enum(["owned", "leased", "managed"]),
      value: z.number(),
      annualCost: z.number()
    }))
    .mutation(async ({ input }) => {
      const facilityData = createFacilityData(
        input.name,
        input.type,
        input.address,
        input.city,
        input.state,
        input.zipCode,
        input.squareFootage,
        input.ownershipType,
        input.value,
        input.annualCost
      );

      const result = await db.execute({
        sql: `INSERT INTO facilities (name, type, address, city, state, zip_code, country, square_footage, ownership_type, status, acquired_date, value, annual_cost)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
        args: [
          facilityData.name,
          facilityData.type,
          facilityData.address,
          facilityData.city,
          facilityData.state,
          facilityData.zipCode,
          facilityData.country,
          facilityData.squareFootage,
          facilityData.ownershipType,
          facilityData.status,
          facilityData.value,
          facilityData.annualCost
        ]
      });

      return { success: true, facilityId: result.insertId };
    }),

  // Get all facilities
  getFacilities: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM facilities ORDER BY name`
    });

    return results.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      country: row.country,
      squareFootage: row.square_footage,
      capacity: row.capacity,
      ownershipType: row.ownership_type,
      status: row.status,
      acquiredDate: row.acquired_date,
      value: row.value,
      annualCost: row.annual_cost
    }));
  }),

  // Create land parcel
  createLandParcel: protectedProcedure
    .input(z.object({
      parcelId: z.string(),
      name: z.string().min(1),
      acreage: z.number(),
      zoning: z.string(),
      address: z.string(),
      county: z.string(),
      state: z.string(),
      ownershipType: z.enum(["fee_simple", "leasehold", "easement", "trust"]),
      purchasePrice: z.number()
    }))
    .mutation(async ({ input }) => {
      const parcelData = createLandParcelData(
        input.parcelId,
        input.name,
        input.acreage,
        input.zoning,
        input.address,
        input.county,
        input.state,
        input.ownershipType,
        input.purchasePrice
      );

      const result = await db.execute({
        sql: `INSERT INTO land_parcels (parcel_id, name, acreage, zoning, address, county, state, ownership_type, acquired_date, purchase_price, current_value, tax_assessment, annual_taxes, encumbrances, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)`,
        args: [
          parcelData.parcelId,
          parcelData.name,
          parcelData.acreage,
          parcelData.zoning,
          parcelData.address,
          parcelData.county,
          parcelData.state,
          parcelData.ownershipType,
          parcelData.purchasePrice,
          parcelData.currentValue,
          parcelData.taxAssessment,
          parcelData.annualTaxes,
          JSON.stringify(parcelData.encumbrances),
          parcelData.status
        ]
      });

      return { success: true, parcelId: result.insertId };
    }),

  // Get all land parcels
  getLandParcels: protectedProcedure.query(async () => {
    const results = await db.execute({
      sql: `SELECT * FROM land_parcels ORDER BY name`
    });

    return results.rows.map((row: any) => ({
      id: row.id,
      parcelId: row.parcel_id,
      name: row.name,
      acreage: row.acreage,
      zoning: row.zoning,
      address: row.address,
      county: row.county,
      state: row.state,
      ownershipType: row.ownership_type,
      acquiredDate: row.acquired_date,
      purchasePrice: row.purchase_price,
      currentValue: row.current_value,
      taxAssessment: row.tax_assessment,
      annualTaxes: row.annual_taxes,
      encumbrances: JSON.parse(row.encumbrances || "[]"),
      status: row.status
    }));
  }),

  // Schedule facility maintenance
  scheduleMaintenance: protectedProcedure
    .input(z.object({
      facilityId: z.number(),
      type: z.enum(["routine", "preventive", "corrective", "emergency"]),
      description: z.string(),
      scheduledDate: z.string(),
      estimatedCost: z.number(),
      vendor: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const result = await db.execute({
        sql: `INSERT INTO facility_maintenance (facility_id, type, description, scheduled_date, cost, vendor, status)
              VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
        args: [
          input.facilityId,
          input.type,
          input.description,
          input.scheduledDate,
          input.estimatedCost,
          input.vendor || null
        ]
      });

      return { success: true, maintenanceId: result.insertId };
    }),

  // Get foundation layer dashboard
  getDashboard: protectedProcedure.query(async () => {
    // Get M&E summary
    const metrics = await db.execute({ sql: `SELECT status FROM me_metrics` });
    const metricsData = metrics.rows as any[];
    
    // Get risk summary
    const risks = await db.execute({ sql: `SELECT risk_score FROM risks WHERE status != 'closed'` });
    const risksData = risks.rows as any[];
    
    // Get facilities summary
    const facilities = await db.execute({ sql: `SELECT value, annual_cost FROM facilities WHERE status = 'active'` });
    const facilitiesData = facilities.rows as any[];
    
    // Get land summary
    const parcels = await db.execute({ sql: `SELECT acreage, current_value FROM land_parcels WHERE status = 'active'` });
    const parcelsData = parcels.rows as any[];

    return {
      me: {
        totalMetrics: metricsData.length,
        onTrack: metricsData.filter(m => m.status === "on_track").length,
        atRisk: metricsData.filter(m => m.status === "at_risk").length,
        offTrack: metricsData.filter(m => m.status === "off_track").length
      },
      risks: {
        totalRisks: risksData.length,
        critical: risksData.filter(r => r.risk_score > 16).length,
        high: risksData.filter(r => r.risk_score > 9 && r.risk_score <= 16).length,
        medium: risksData.filter(r => r.risk_score > 4 && r.risk_score <= 9).length,
        low: risksData.filter(r => r.risk_score <= 4).length
      },
      facilities: {
        totalFacilities: facilitiesData.length,
        totalValue: facilitiesData.reduce((sum, f) => sum + f.value, 0),
        totalAnnualCost: facilitiesData.reduce((sum, f) => sum + f.annual_cost, 0)
      },
      land: {
        totalParcels: parcelsData.length,
        totalAcreage: parcelsData.reduce((sum, p) => sum + p.acreage, 0),
        totalValue: parcelsData.reduce((sum, p) => sum + p.current_value, 0)
      }
    };
  })
});
