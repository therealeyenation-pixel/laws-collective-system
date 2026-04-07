/**
 * API Response Time Optimization
 * Provides utilities for optimizing API response times
 */

interface ResponseMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  payloadSize: number;
  timestamp: number;
}

class APIOptimizationService {
  private metrics: ResponseMetric[] = [];
  private readonly MAX_METRICS = 10000;

  /**
   * Record API response metric
   */
  recordResponse(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    payloadSize: number
  ): void {
    this.metrics.push({
      endpoint,
      method,
      responseTime,
      statusCode,
      payloadSize,
      timestamp: Date.now(),
    });

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  /**
   * Get API performance statistics
   */
  getPerformanceStats(): {
    totalRequests: number;
    averageResponseTime: number;
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    averagePayloadSize: number;
    errorRate: number;
    endpoints: Array<{
      endpoint: string;
      method: string;
      count: number;
      averageTime: number;
      maxTime: number;
      minTime: number;
      errorRate: number;
    }>;
  } {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        p50ResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        averagePayloadSize: 0,
        errorRate: 0,
        endpoints: [],
      };
    }

    const responseTimes = this.metrics.map((m) => m.responseTime).sort((a, b) => a - b);
    const payloadSizes = this.metrics.map((m) => m.payloadSize);
    const errors = this.metrics.filter((m) => m.statusCode >= 400).length;

    // Calculate percentiles
    const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];

    // Group by endpoint
    const endpointMap = new Map<string, ResponseMetric[]>();
    this.metrics.forEach((m) => {
      const key = `${m.method} ${m.endpoint}`;
      if (!endpointMap.has(key)) {
        endpointMap.set(key, []);
      }
      endpointMap.get(key)!.push(m);
    });

    const endpoints = Array.from(endpointMap.entries()).map(([key, metrics]) => {
      const [method, endpoint] = key.split(" ");
      const times = metrics.map((m) => m.responseTime).sort((a, b) => a - b);
      const endpointErrors = metrics.filter((m) => m.statusCode >= 400).length;

      return {
        endpoint,
        method,
        count: metrics.length,
        averageTime: times.reduce((a, b) => a + b, 0) / times.length,
        maxTime: Math.max(...times),
        minTime: Math.min(...times),
        errorRate: (endpointErrors / metrics.length) * 100,
      };
    });

    return {
      totalRequests: this.metrics.length,
      averageResponseTime:
        this.metrics.reduce((a, m) => a + m.responseTime, 0) /
        this.metrics.length,
      p50ResponseTime: p50,
      p95ResponseTime: p95,
      p99ResponseTime: p99,
      averagePayloadSize:
        payloadSizes.reduce((a, b) => a + b, 0) / payloadSizes.length,
      errorRate: (errors / this.metrics.length) * 100,
      endpoints: endpoints.sort((a, b) => b.averageTime - a.averageTime),
    };
  }

  /**
   * Get slow endpoints (average response time > threshold)
   */
  getSlowEndpoints(thresholdMs: number = 500): Array<{
    endpoint: string;
    method: string;
    averageTime: number;
    count: number;
  }> {
    const stats = this.getPerformanceStats();
    return stats.endpoints
      .filter((e) => e.averageTime > thresholdMs)
      .map((e) => ({
        endpoint: e.endpoint,
        method: e.method,
        averageTime: e.averageTime,
        count: e.count,
      }));
  }

  /**
   * Get endpoints with high error rates
   */
  getErrorProneEndpoints(errorRateThreshold: number = 5): Array<{
    endpoint: string;
    method: string;
    errorRate: number;
    count: number;
  }> {
    const stats = this.getPerformanceStats();
    return stats.endpoints
      .filter((e) => e.errorRate > errorRateThreshold)
      .map((e) => ({
        endpoint: e.endpoint,
        method: e.method,
        errorRate: e.errorRate,
        count: e.count,
      }));
  }

  /**
   * Clear old metrics (older than 24 hours)
   */
  clearOldMetrics(): number {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const beforeCount = this.metrics.length;
    this.metrics = this.metrics.filter((m) => m.timestamp > oneDayAgo);
    return beforeCount - this.metrics.length;
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getPerformanceStats();

    if (stats.averageResponseTime > 500) {
      recommendations.push(
        "Average response time exceeds 500ms - consider implementing caching"
      );
    }

    if (stats.p99ResponseTime > 2000) {
      recommendations.push(
        "P99 response time exceeds 2s - optimize slow queries and endpoints"
      );
    }

    if (stats.averagePayloadSize > 1024 * 100) {
      recommendations.push(
        "Average payload size exceeds 100KB - consider response compression"
      );
    }

    if (stats.errorRate > 5) {
      recommendations.push(
        `Error rate is ${stats.errorRate.toFixed(1)}% - investigate error-prone endpoints`
      );
    }

    const slowEndpoints = this.getSlowEndpoints(500);
    if (slowEndpoints.length > 0) {
      recommendations.push(
        `${slowEndpoints.length} endpoints have average response time > 500ms`
      );
    }

    const errorProne = this.getErrorProneEndpoints(5);
    if (errorProne.length > 0) {
      recommendations.push(
        `${errorProne.length} endpoints have error rate > 5%`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("API performance is healthy - continue monitoring");
    }

    return recommendations;
  }
}

// Export singleton instance
export const apiOptimizationService = new APIOptimizationService();

/**
 * API optimization best practices
 */
export const API_OPTIMIZATION_GUIDE = {
  responseCompression: {
    description: "Compress responses to reduce payload size",
    implementation: "Use gzip compression for responses > 1KB",
    benefit: "Reduce bandwidth by 60-80%",
  },

  pagination: {
    description: "Return paginated results instead of all data",
    implementation: "Use limit/offset or cursor-based pagination",
    benefit: "Reduce memory usage and response time",
    example: "GET /api/broadcasts?limit=20&offset=0",
  },

  fieldSelection: {
    description: "Allow clients to select specific fields",
    implementation: "Support ?fields=id,name,email parameter",
    benefit: "Reduce payload size for clients that don't need all fields",
  },

  caching: {
    description: "Cache responses at multiple levels",
    implementation: "HTTP caching headers, CDN caching, application caching",
    benefit: "Reduce server load and improve response times",
  },

  batchRequests: {
    description: "Allow multiple requests in one API call",
    implementation: "Support POST /api/batch endpoint",
    benefit: "Reduce number of HTTP requests",
  },

  requestTimeout: {
    description: "Set timeouts for long-running requests",
    implementation: "Set timeout to 30s for most endpoints",
    benefit: "Prevent resource exhaustion from slow clients",
  },

  rateLimiting: {
    description: "Limit requests per user/IP",
    implementation: "1000 requests per hour per user",
    benefit: "Prevent abuse and ensure fair resource allocation",
  },

  monitoring: {
    description: "Monitor API performance metrics",
    implementation: "Track response times, error rates, payload sizes",
    benefit: "Identify bottlenecks and optimize proactively",
  },
};
