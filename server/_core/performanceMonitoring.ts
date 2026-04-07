/**
 * Performance Monitoring & Optimization
 * Real-time performance tracking and optimization recommendations
 */

interface PerformanceMetric {
  timestamp: Date;
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  memoryUsed: number;
  cpuUsed: number;
  cacheHit: boolean;
  userId?: string;
}

interface PerformanceAlert {
  id: string;
  timestamp: Date;
  type: "slow_endpoint" | "high_memory" | "high_cpu" | "error_rate";
  severity: "warning" | "critical";
  message: string;
  value: number;
  threshold: number;
  resolved: boolean;
}

interface OptimizationRecommendation {
  id: string;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  estimatedImprovement: string;
  implementation?: string;
  createdAt: Date;
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private recommendations: OptimizationRecommendation[] = [];
  private readonly METRICS_RETENTION_LIMIT = 50000;
  private readonly SLOW_ENDPOINT_THRESHOLD_MS = 1000;
  private readonly HIGH_MEMORY_THRESHOLD_MB = 500;
  private readonly HIGH_CPU_THRESHOLD = 80;
  private readonly ERROR_RATE_THRESHOLD = 5; // percent

  /**
   * Record performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, "timestamp">): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date(),
    };

    this.metrics.push(fullMetric);

    // Maintain size limit
    if (this.metrics.length > this.METRICS_RETENTION_LIMIT) {
      this.metrics = this.metrics.slice(-this.METRICS_RETENTION_LIMIT);
    }

    // Check for performance issues
    this.checkPerformanceThresholds(fullMetric);
  }

  /**
   * Check performance thresholds
   */
  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    // Check slow endpoint
    if (metric.duration > this.SLOW_ENDPOINT_THRESHOLD_MS) {
      this.createAlert(
        "slow_endpoint",
        "warning",
        `Slow endpoint detected: ${metric.endpoint} took ${metric.duration}ms`,
        metric.duration
      );
    }

    // Check high memory
    if (metric.memoryUsed > this.HIGH_MEMORY_THRESHOLD_MB) {
      this.createAlert(
        "high_memory",
        "warning",
        `High memory usage: ${metric.memoryUsed}MB`,
        metric.memoryUsed
      );
    }

    // Check high CPU
    if (metric.cpuUsed > this.HIGH_CPU_THRESHOLD) {
      this.createAlert(
        "high_cpu",
        "warning",
        `High CPU usage: ${metric.cpuUsed}%`,
        metric.cpuUsed
      );
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(
    type: "slow_endpoint" | "high_memory" | "high_cpu" | "error_rate",
    severity: "warning" | "critical",
    message: string,
    value: number
  ): void {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(
      (a) => a.type === type && !a.resolved && a.timestamp > new Date(Date.now() - 60000)
    );

    if (existingAlert) {
      return; // Don't create duplicate alerts within 1 minute
    }

    const threshold = this.getThreshold(type);

    const alert: PerformanceAlert = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      severity,
      message,
      value,
      threshold,
      resolved: false,
    };

    this.alerts.push(alert);
  }

  /**
   * Get threshold for alert type
   */
  private getThreshold(type: string): number {
    switch (type) {
      case "slow_endpoint":
        return this.SLOW_ENDPOINT_THRESHOLD_MS;
      case "high_memory":
        return this.HIGH_MEMORY_THRESHOLD_MB;
      case "high_cpu":
        return this.HIGH_CPU_THRESHOLD;
      case "error_rate":
        return this.ERROR_RATE_THRESHOLD;
      default:
        return 0;
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(filters?: {
    endpoint?: string;
    method?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): PerformanceMetric[] {
    let results = [...this.metrics];

    if (filters?.endpoint) {
      results = results.filter((m) => m.endpoint === filters.endpoint);
    }

    if (filters?.method) {
      results = results.filter((m) => m.method === filters.method);
    }

    if (filters?.startDate) {
      results = results.filter((m) => m.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      results = results.filter((m) => m.timestamp <= filters.endDate!);
    }

    const limit = filters?.limit || 1000;
    return results.slice(-limit);
  }

  /**
   * Get endpoint statistics
   */
  getEndpointStats(endpoint: string): {
    endpoint: string;
    totalRequests: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    errorRate: number;
    cacheHitRate: number;
  } {
    const metrics = this.metrics.filter((m) => m.endpoint === endpoint);

    if (metrics.length === 0) {
      return {
        endpoint,
        totalRequests: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        errorRate: 0,
        cacheHitRate: 0,
      };
    }

    const durations = metrics.map((m) => m.duration);
    const errors = metrics.filter((m) => m.statusCode >= 400).length;
    const cacheHits = metrics.filter((m) => m.cacheHit).length;

    return {
      endpoint,
      totalRequests: metrics.length,
      averageDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      errorRate: Math.round((errors / metrics.length) * 100 * 100) / 100,
      cacheHitRate: Math.round((cacheHits / metrics.length) * 100 * 100) / 100,
    };
  }

  /**
   * Get alerts
   */
  getAlerts(filters?: {
    type?: string;
    severity?: "warning" | "critical";
    resolved?: boolean;
  }): PerformanceAlert[] {
    let results = [...this.alerts];

    if (filters?.type) {
      results = results.filter((a) => a.type === filters.type);
    }

    if (filters?.severity) {
      results = results.filter((a) => a.severity === filters.severity);
    }

    if (filters?.resolved !== undefined) {
      results = results.filter((a) => a.resolved === filters.resolved);
    }

    return results;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): PerformanceAlert | null {
    const alert = this.alerts.find((a) => a.id === alertId);

    if (!alert) {
      return null;
    }

    alert.resolved = true;
    return alert;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(): OptimizationRecommendation[] {
    this.recommendations = [];

    // Analyze slow endpoints
    const endpointStats = new Map<string, any>();
    for (const metric of this.metrics) {
      if (!endpointStats.has(metric.endpoint)) {
        endpointStats.set(metric.endpoint, this.getEndpointStats(metric.endpoint));
      }
    }

    for (const [endpoint, stats] of endpointStats.entries()) {
      if (stats.averageDuration > this.SLOW_ENDPOINT_THRESHOLD_MS) {
        this.recommendations.push({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: "slow_endpoint",
          priority: stats.averageDuration > 5000 ? "critical" : "high",
          title: `Optimize slow endpoint: ${endpoint}`,
          description: `Average response time is ${stats.averageDuration}ms. Consider adding caching, optimizing queries, or adding indexes.`,
          estimatedImprovement: "20-50% faster response times",
          createdAt: new Date(),
        });
      }

      if (stats.cacheHitRate < 50) {
        this.recommendations.push({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: "cache_optimization",
          priority: "medium",
          title: `Improve caching for: ${endpoint}`,
          description: `Current cache hit rate is ${stats.cacheHitRate}%. Implement caching strategy for frequently accessed data.`,
          estimatedImprovement: "30-40% reduction in database queries",
          createdAt: new Date(),
        });
      }

      if (stats.errorRate > this.ERROR_RATE_THRESHOLD) {
        this.recommendations.push({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: "error_handling",
          priority: "high",
          title: `High error rate for: ${endpoint}`,
          description: `Error rate is ${stats.errorRate}%. Investigate and fix failing requests.`,
          estimatedImprovement: "Improved reliability and user experience",
          createdAt: new Date(),
        });
      }
    }

    return this.recommendations;
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalMetrics: number;
    totalAlerts: number;
    unresolvedAlerts: number;
    criticalAlerts: number;
    recommendations: number;
    averageResponseTime: number;
    errorRate: number;
  } {
    const avgDuration =
      this.metrics.length > 0
        ? Math.round(this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length)
        : 0;

    const errorCount = this.metrics.filter((m) => m.statusCode >= 400).length;
    const errorRate =
      this.metrics.length > 0 ? Math.round((errorCount / this.metrics.length) * 100 * 100) / 100 : 0;

    return {
      totalMetrics: this.metrics.length,
      totalAlerts: this.alerts.length,
      unresolvedAlerts: this.alerts.filter((a) => !a.resolved).length,
      criticalAlerts: this.alerts.filter((a) => a.severity === "critical").length,
      recommendations: this.recommendations.length,
      averageResponseTime: avgDuration,
      errorRate,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.metrics = [];
    this.alerts = [];
    this.recommendations = [];
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();
