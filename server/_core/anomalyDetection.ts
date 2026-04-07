/**
 * Anomaly Detection Service
 * Detects unusual patterns in system metrics and error logs
 */

import { autoUpdateService } from "./autoUpdate";
import { pushNotificationService } from "./pushNotifications";

export interface AnomalyScore {
  id: string;
  timestamp: number;
  metric: string;
  value: number;
  baseline: number;
  deviation: number;
  score: number; // 0-100
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  resolved: boolean;
}

interface MetricBaseline {
  metric: string;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  samples: number;
}

class AnomalyDetectionService {
  private baselines: Map<string, MetricBaseline> = new Map();
  private anomalies: AnomalyScore[] = [];
  private readonly BASELINE_SAMPLE_SIZE = 100;
  private readonly DEVIATION_THRESHOLD = 2.5; // Standard deviations
  private readonly CRITICAL_THRESHOLD = 4.0;

  /**
   * Update baseline for a metric
   */
  updateBaseline(metric: string, value: number): void {
    const baseline = this.baselines.get(metric) || {
      metric,
      mean: 0,
      stdDev: 0,
      min: value,
      max: value,
      samples: 0,
    };

    // Update min/max
    baseline.min = Math.min(baseline.min, value);
    baseline.max = Math.max(baseline.max, value);

    // Update mean using incremental calculation
    const newMean = (baseline.mean * baseline.samples + value) / (baseline.samples + 1);
    baseline.mean = newMean;

    // Update standard deviation
    if (baseline.samples > 0) {
      const variance = baseline.stdDev * baseline.stdDev;
      const newVariance =
        (variance * baseline.samples +
          Math.pow(value - baseline.mean, 2)) /
        (baseline.samples + 1);
      baseline.stdDev = Math.sqrt(newVariance);
    }

    baseline.samples++;

    // Keep only recent samples
    if (baseline.samples > this.BASELINE_SAMPLE_SIZE) {
      baseline.samples = this.BASELINE_SAMPLE_SIZE;
    }

    this.baselines.set(metric, baseline);
  }

  /**
   * Check for anomalies in a metric value
   */
  detectAnomaly(metric: string, value: number): AnomalyScore | null {
    const baseline = this.baselines.get(metric);

    if (!baseline || baseline.samples < 5) {
      // Not enough samples to detect anomalies
      this.updateBaseline(metric, value);
      return null;
    }

    // Calculate z-score
    const zScore = (value - baseline.mean) / (baseline.stdDev || 1);
    const deviation = Math.abs(zScore);

    if (deviation < this.DEVIATION_THRESHOLD) {
      // Normal behavior
      this.updateBaseline(metric, value);
      return null;
    }

    // Anomaly detected
    const score = Math.min(100, (deviation / this.CRITICAL_THRESHOLD) * 100);
    const severity =
      deviation >= this.CRITICAL_THRESHOLD
        ? "critical"
        : deviation >= 3.5
          ? "high"
          : deviation >= 3.0
            ? "medium"
            : "low";

    const anomaly: AnomalyScore = {
      id: `anomaly-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      metric,
      value,
      baseline: baseline.mean,
      deviation,
      score,
      severity,
      description: this.generateAnomalyDescription(metric, value, baseline),
      resolved: false,
    };

    this.anomalies.push(anomaly);

    // Keep only recent anomalies
    if (this.anomalies.length > 1000) {
      this.anomalies = this.anomalies.slice(-1000);
    }

    // Update baseline with new value
    this.updateBaseline(metric, value);

    return anomaly;
  }

  /**
   * Generate description for anomaly
   */
  private generateAnomalyDescription(
    metric: string,
    value: number,
    baseline: MetricBaseline
  ): string {
    const direction = value > baseline.mean ? "increased" : "decreased";
    const percentage = Math.abs(
      ((value - baseline.mean) / baseline.mean) * 100
    ).toFixed(1);

    return `${metric} has ${direction} by ${percentage}% (current: ${value.toFixed(2)}, baseline: ${baseline.mean.toFixed(2)})`;
  }

  /**
   * Detect error pattern anomalies
   */
  detectErrorPatternAnomalies(): AnomalyScore[] {
    const errors = autoUpdateService.getErrorLogs({ limit: 100 });
    const detectedAnomalies: AnomalyScore[] = [];

    // Check for error rate spike
    const recentErrors = errors.filter(
      (e) => Date.now() - e.timestamp < 3600000 // Last hour
    );
    const errorRate = recentErrors.length;

    const anomaly = this.detectAnomaly("error_rate_1h", errorRate);
    if (anomaly) {
      detectedAnomalies.push(anomaly);
    }

    // Check for specific component failures
    const componentErrors = new Map<string, number>();
    errors.forEach((e) => {
      const count = componentErrors.get(e.component) || 0;
      componentErrors.set(e.component, count + 1);
    });

    componentErrors.forEach((count, component) => {
      const anomaly = this.detectAnomaly(`errors_${component}`, count);
      if (anomaly) {
        detectedAnomalies.push(anomaly);
      }
    });

    return detectedAnomalies;
  }

  /**
   * Get all anomalies
   */
  getAnomalies(
    filter?: {
      metric?: string;
      severity?: "low" | "medium" | "high" | "critical";
      resolved?: boolean;
      limit?: number;
    }
  ): AnomalyScore[] {
    let filtered = [...this.anomalies];

    if (filter?.metric) {
      filtered = filtered.filter((a) => a.metric === filter.metric);
    }

    if (filter?.severity) {
      filtered = filtered.filter((a) => a.severity === filter.severity);
    }

    if (filter?.resolved !== undefined) {
      filtered = filtered.filter((a) => a.resolved === filter.resolved);
    }

    const limit = filter?.limit || 100;
    return filtered.slice(-limit);
  }

  /**
   * Mark anomaly as resolved
   */
  markAnomalyResolved(anomalyId: string): boolean {
    const anomaly = this.anomalies.find((a) => a.id === anomalyId);
    if (anomaly) {
      anomaly.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Get anomaly statistics
   */
  getStats(): {
    totalAnomalies: number;
    unresolvedAnomalies: number;
    criticalAnomalies: number;
    bySeverity: Record<string, number>;
    byMetric: Record<string, number>;
  } {
    const stats = {
      totalAnomalies: this.anomalies.length,
      unresolvedAnomalies: this.anomalies.filter((a) => !a.resolved).length,
      criticalAnomalies: this.anomalies.filter(
        (a) => a.severity === "critical" && !a.resolved
      ).length,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      byMetric: {} as Record<string, number>,
    };

    this.anomalies.forEach((a) => {
      stats.bySeverity[a.severity]++;
      stats.byMetric[a.metric] = (stats.byMetric[a.metric] || 0) + 1;
    });

    return stats;
  }

  /**
   * Send anomaly alert
   */
  async sendAnomalyAlert(anomaly: AnomalyScore, userIds: string[]): Promise<void> {
    const title =
      anomaly.severity === "critical"
        ? "🚨 CRITICAL ANOMALY DETECTED"
        : "⚠️ System Anomaly Detected";

    await pushNotificationService.sendSystemAlert(
      title,
      anomaly.description,
      anomaly.severity === "critical" ? "critical" : "warning",
      userIds
    );
  }

  /**
   * Clear old anomalies (older than 24 hours)
   */
  clearOldAnomalies(): number {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const beforeCount = this.anomalies.length;
    this.anomalies = this.anomalies.filter((a) => a.timestamp > oneDayAgo);
    return beforeCount - this.anomalies.length;
  }

  /**
   * Get baseline statistics
   */
  getBaselineStats(): {
    totalMetrics: number;
    metrics: Array<{
      metric: string;
      mean: number;
      stdDev: number;
      min: number;
      max: number;
      samples: number;
    }>;
  } {
    return {
      totalMetrics: this.baselines.size,
      metrics: Array.from(this.baselines.values()),
    };
  }
}

// Export singleton instance
export const anomalyDetectionService = new AnomalyDetectionService();
