/**
 * Alert Rules Engine Router
 * Manages custom alert rules and predictive maintenance
 */

import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { anomalyDetectionService } from "../_core/anomalyDetection";

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: "exceeds" | "below" | "equals" | "changes";
  threshold: number;
  duration: number; // milliseconds
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  createdAt: number;
  lastTriggered?: number;
  triggerCount: number;
}

const alertRules: Map<string, AlertRule> = new Map();

export const alertRulesRouter = router({
  /**
   * Create new alert rule
   */
  createRule: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        metric: z.string(),
        condition: z.enum(["exceeds", "below", "equals", "changes"]),
        threshold: z.number(),
        duration: z.number().min(60000), // Minimum 1 minute
        severity: z.enum(["low", "medium", "high", "critical"]),
      })
    )
    .mutation(async ({ input }) => {
      const rule: AlertRule = {
        id: `rule-${Date.now()}`,
        ...input,
        enabled: true,
        createdAt: Date.now(),
        triggerCount: 0,
      };

      alertRules.set(rule.id, rule);
      return rule;
    }),

  /**
   * Get all alert rules
   */
  getRules: protectedProcedure.query(async () => {
    return Array.from(alertRules.values());
  }),

  /**
   * Get specific rule
   */
  getRule: protectedProcedure
    .input(z.object({ ruleId: z.string() }))
    .query(async ({ input }) => {
      return alertRules.get(input.ruleId);
    }),

  /**
   * Update alert rule
   */
  updateRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.string(),
        name: z.string().optional(),
        threshold: z.number().optional(),
        duration: z.number().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const rule = alertRules.get(input.ruleId);
      if (!rule) {
        throw new Error("Rule not found");
      }

      if (input.name) rule.name = input.name;
      if (input.threshold !== undefined) rule.threshold = input.threshold;
      if (input.duration !== undefined) rule.duration = input.duration;
      if (input.severity) rule.severity = input.severity;
      if (input.enabled !== undefined) rule.enabled = input.enabled;

      return rule;
    }),

  /**
   * Delete alert rule
   */
  deleteRule: protectedProcedure
    .input(z.object({ ruleId: z.string() }))
    .mutation(async ({ input }) => {
      return alertRules.delete(input.ruleId);
    }),

  /**
   * Test alert rule
   */
  testRule: protectedProcedure
    .input(z.object({ ruleId: z.string(), testValue: z.number() }))
    .mutation(async ({ input }) => {
      const rule = alertRules.get(input.ruleId);
      if (!rule) {
        throw new Error("Rule not found");
      }

      let triggered = false;
      switch (rule.condition) {
        case "exceeds":
          triggered = input.testValue > rule.threshold;
          break;
        case "below":
          triggered = input.testValue < rule.threshold;
          break;
        case "equals":
          triggered = input.testValue === rule.threshold;
          break;
        case "changes":
          triggered = true; // Always trigger for testing
          break;
      }

      return {
        triggered,
        rule,
        testValue: input.testValue,
      };
    }),

  /**
   * Get anomalies for predictive maintenance
   */
  getAnomalies: protectedProcedure
    .input(
      z
        .object({
          severity: z.enum(["low", "medium", "high", "critical"]).optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return anomalyDetectionService.getAnomalies({
        severity: input?.severity,
        limit: input?.limit,
      });
    }),

  /**
   * Get predictive maintenance score
   */
  getPredictiveMaintenanceScore: protectedProcedure.query(async () => {
    const stats = anomalyDetectionService.getStats();
    const anomalies = anomalyDetectionService.getAnomalies({ limit: 1000 });

    // Calculate maintenance score (0-100, higher = more urgent)
    const criticalCount = stats.criticalAnomalies;
    const unresolvedCount = stats.unresolvedAnomalies;
    const avgSeverity =
      (stats.bySeverity.critical * 4 +
        stats.bySeverity.high * 3 +
        stats.bySeverity.medium * 2 +
        stats.bySeverity.low * 1) /
      (stats.totalAnomalies || 1);

    const maintenanceScore = Math.min(
      100,
      criticalCount * 25 + unresolvedCount * 5 + avgSeverity * 10
    );

    return {
      score: maintenanceScore,
      urgency:
        maintenanceScore > 70
          ? "critical"
          : maintenanceScore > 50
            ? "high"
            : maintenanceScore > 30
              ? "medium"
              : "low",
      criticalAnomalies: criticalCount,
      unresolvedAnomalies: unresolvedCount,
      averageSeverity: avgSeverity.toFixed(2),
      recommendations: generateMaintenanceRecommendations(
        maintenanceScore,
        stats,
        anomalies
      ),
    };
  }),

  /**
   * Get maintenance schedule
   */
  getMaintenanceSchedule: protectedProcedure.query(async () => {
    const score = await protectedProcedure
      .query(async () => {
        const stats = anomalyDetectionService.getStats();
        return stats.criticalAnomalies * 25 + stats.unresolvedAnomalies * 5;
      })
      .call({} as any);

    return {
      nextScheduledMaintenance: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      urgentMaintenanceNeeded: score > 70,
      estimatedDuration: "2-4 hours",
      affectedSystems: ["database", "cache", "api"],
      maintenanceWindow: {
        start: "02:00 UTC",
        end: "06:00 UTC",
        frequency: "weekly",
      },
    };
  }),

  /**
   * Get rule statistics
   */
  getRuleStats: protectedProcedure.query(async () => {
    const rules = Array.from(alertRules.values());
    const enabledRules = rules.filter((r) => r.enabled);
    const totalTriggers = rules.reduce((sum, r) => sum + r.triggerCount, 0);

    return {
      totalRules: rules.length,
      enabledRules: enabledRules.length,
      disabledRules: rules.length - enabledRules.length,
      totalTriggers,
      averageTriggersPerRule:
        rules.length > 0 ? (totalTriggers / rules.length).toFixed(2) : 0,
      bySeverity: {
        low: rules.filter((r) => r.severity === "low").length,
        medium: rules.filter((r) => r.severity === "medium").length,
        high: rules.filter((r) => r.severity === "high").length,
        critical: rules.filter((r) => r.severity === "critical").length,
      },
    };
  }),

  /**
   * Acknowledge anomaly
   */
  acknowledgeAnomaly: protectedProcedure
    .input(z.object({ anomalyId: z.string() }))
    .mutation(async ({ input }) => {
      const resolved = anomalyDetectionService.markAnomalyResolved(
        input.anomalyId
      );
      return { success: resolved };
    }),
});

/**
 * Generate maintenance recommendations based on anomalies
 */
function generateMaintenanceRecommendations(
  score: number,
  stats: any,
  anomalies: any[]
): string[] {
  const recommendations: string[] = [];

  if (score > 70) {
    recommendations.push("URGENT: Schedule immediate maintenance");
  }

  if (stats.criticalAnomalies > 0) {
    recommendations.push(
      `Address ${stats.criticalAnomalies} critical anomalies immediately`
    );
  }

  if (stats.bySeverity.high > 5) {
    recommendations.push("Multiple high-severity issues detected - prioritize");
  }

  // Analyze anomaly patterns
  const metricCounts: Record<string, number> = {};
  anomalies.forEach((a: any) => {
    metricCounts[a.metric] = (metricCounts[a.metric] || 0) + 1;
  });

  Object.entries(metricCounts).forEach(([metric, count]) => {
    if ((count as number) > 10) {
      recommendations.push(
        `${metric} showing persistent issues - investigate root cause`
      );
    }
  });

  if (recommendations.length === 0) {
    recommendations.push("System health is good - continue monitoring");
  }

  return recommendations;
}
