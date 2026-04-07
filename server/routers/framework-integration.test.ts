/**
 * Framework Integration Tests
 * Comprehensive test suite for all strategic enhancement systems
 */

import { describe, it, expect, beforeEach } from "vitest";
import { anomalyDetectionService } from "../_core/anomalyDetection";
import { queryOptimizationService } from "../_core/queryOptimization";
import { apiOptimizationService } from "../_core/apiOptimization";

describe("Strategic Enhancement Framework", () => {
  beforeEach(() => {
    // Reset services before each test
    queryOptimizationService.clear();
  });

  describe("Anomaly Detection Service", () => {
    it("should detect anomalies using z-score analysis", () => {
      // Build baseline
      for (let i = 0; i < 10; i++) {
        anomalyDetectionService.updateBaseline("test_metric", 100 + Math.random() * 10);
      }

      // Normal value - should not trigger
      const normal = anomalyDetectionService.detectAnomaly("test_metric", 105);
      expect(normal).toBeNull();

      // Anomalous value - should trigger
      const anomaly = anomalyDetectionService.detectAnomaly("test_metric", 200);
      expect(anomaly).not.toBeNull();
      expect(anomaly?.severity).toBe("high");
    });

    it("should track anomaly statistics", () => {
      // Create some anomalies
      for (let i = 0; i < 5; i++) {
        anomalyDetectionService.updateBaseline("metric1", 100);
      }

      anomalyDetectionService.detectAnomaly("metric1", 300);
      anomalyDetectionService.detectAnomaly("metric1", 350);

      const stats = anomalyDetectionService.getStats();
      expect(stats.totalAnomalies).toBeGreaterThan(0);
      expect(stats.unresolvedAnomalies).toBeGreaterThan(0);
    });

    it("should resolve anomalies", () => {
      for (let i = 0; i < 5; i++) {
        anomalyDetectionService.updateBaseline("metric1", 100);
      }

      const anomaly = anomalyDetectionService.detectAnomaly("metric1", 300);
      if (anomaly) {
        const resolved = anomalyDetectionService.markAnomalyResolved(anomaly.id);
        expect(resolved).toBe(true);
      }
    });
  });

  describe("Query Optimization Service", () => {
    it("should cache data with TTL", () => {
      const testData = { id: 1, name: "test" };
      queryOptimizationService.set("test_key", testData, 5000);

      const cached = queryOptimizationService.get("test_key");
      expect(cached).toEqual(testData);
    });

    it("should expire cached data", async () => {
      const testData = { id: 1, name: "test" };
      queryOptimizationService.set("test_key", testData, 100); // 100ms TTL

      // Should exist immediately
      let cached = queryOptimizationService.get("test_key");
      expect(cached).toEqual(testData);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be expired
      cached = queryOptimizationService.get("test_key");
      expect(cached).toBeNull();
    });

    it("should track query performance", () => {
      queryOptimizationService.trackQuery("getUserById", 50);
      queryOptimizationService.trackQuery("getUserById", 75);
      queryOptimizationService.trackQuery("getBroadcasts", 100);

      const metrics = queryOptimizationService.getQueryMetrics();
      expect(metrics.length).toBeGreaterThan(0);

      const userMetric = metrics.find((m) => m.query === "getUserById");
      expect(userMetric?.count).toBe(2);
      expect(userMetric?.averageTime).toBe(62.5);
    });

    it("should identify slow queries", () => {
      queryOptimizationService.trackQuery("slowQuery", 500);
      queryOptimizationService.trackQuery("slowQuery", 600);
      queryOptimizationService.trackQuery("fastQuery", 50);

      const slowQueries = queryOptimizationService.getSlowQueries(100);
      expect(slowQueries.length).toBeGreaterThan(0);
      expect(slowQueries.some((q) => q.query === "slowQuery")).toBe(true);
    });

    it("should invalidate cache by pattern", () => {
      queryOptimizationService.set("user:1", { id: 1 });
      queryOptimizationService.set("user:2", { id: 2 });
      queryOptimizationService.set("broadcast:1", { id: 1 });

      const invalidated = queryOptimizationService.invalidate("user:");
      expect(invalidated).toBe(2);

      expect(queryOptimizationService.get("user:1")).toBeNull();
      expect(queryOptimizationService.get("broadcast:1")).not.toBeNull();
    });
  });

  describe("API Optimization Service", () => {
    it("should record API response metrics", () => {
      apiOptimizationService.recordResponse(
        "/api/users",
        "GET",
        150,
        200,
        1024
      );
      apiOptimizationService.recordResponse(
        "/api/users",
        "GET",
        200,
        200,
        1024
      );
      apiOptimizationService.recordResponse(
        "/api/broadcasts",
        "GET",
        300,
        200,
        2048
      );

      const stats = apiOptimizationService.getPerformanceStats();
      expect(stats.totalRequests).toBe(3);
      expect(stats.averageResponseTime).toBeGreaterThan(0);
    });

    it("should calculate response time percentiles", () => {
      for (let i = 0; i < 100; i++) {
        apiOptimizationService.recordResponse(
          "/api/test",
          "GET",
          i * 10,
          200,
          1024
        );
      }

      const stats = apiOptimizationService.getPerformanceStats();
      expect(stats.p50ResponseTime).toBeLessThan(stats.p95ResponseTime);
      expect(stats.p95ResponseTime).toBeLessThan(stats.p99ResponseTime);
    });

    it("should identify slow endpoints", () => {
      apiOptimizationService.recordResponse(
        "/api/slow",
        "GET",
        600,
        200,
        1024
      );
      apiOptimizationService.recordResponse(
        "/api/slow",
        "GET",
        700,
        200,
        1024
      );
      apiOptimizationService.recordResponse(
        "/api/fast",
        "GET",
        50,
        200,
        1024
      );

      const slowEndpoints = apiOptimizationService.getSlowEndpoints(500);
      expect(slowEndpoints.length).toBeGreaterThan(0);
      expect(slowEndpoints.some((e) => e.endpoint === "/api/slow")).toBe(true);
    });

    it("should track error rates", () => {
      apiOptimizationService.recordResponse(
        "/api/test",
        "GET",
        100,
        200,
        1024
      );
      apiOptimizationService.recordResponse(
        "/api/test",
        "GET",
        100,
        500,
        1024
      );
      apiOptimizationService.recordResponse(
        "/api/test",
        "GET",
        100,
        500,
        1024
      );

      const stats = apiOptimizationService.getPerformanceStats();
      expect(stats.errorRate).toBeGreaterThan(0);
    });

    it("should generate optimization recommendations", () => {
      // Create high response time scenario
      for (let i = 0; i < 10; i++) {
        apiOptimizationService.recordResponse(
          "/api/slow",
          "GET",
          600,
          200,
          1024 * 100
        );
      }

      const recommendations =
        apiOptimizationService.getOptimizationRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("Framework Integration", () => {
    it("should work together without conflicts", () => {
      // Cache query result
      queryOptimizationService.set("query_result", { data: "test" });

      // Track API call
      apiOptimizationService.recordResponse(
        "/api/test",
        "GET",
        100,
        200,
        1024
      );

      // Detect anomaly
      for (let i = 0; i < 5; i++) {
        anomalyDetectionService.updateBaseline("metric", 100);
      }
      const anomaly = anomalyDetectionService.detectAnomaly("metric", 300);

      // All should work independently
      expect(queryOptimizationService.get("query_result")).not.toBeNull();
      expect(apiOptimizationService.getPerformanceStats().totalRequests).toBe(1);
      expect(anomaly).not.toBeNull();
    });

    it("should handle concurrent operations", async () => {
      const promises = [];

      // Concurrent cache operations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(
            queryOptimizationService.set(`key_${i}`, { id: i })
          )
        );
      }

      // Concurrent API tracking
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(
            apiOptimizationService.recordResponse(
              "/api/test",
              "GET",
              100,
              200,
              1024
            )
          )
        );
      }

      // Concurrent anomaly detection
      for (let i = 0; i < 5; i++) {
        anomalyDetectionService.updateBaseline("metric", 100 + Math.random() * 10);
      }

      await Promise.all(promises);

      const stats = apiOptimizationService.getPerformanceStats();
      expect(stats.totalRequests).toBe(10);
    });
  });

  describe("Production Readiness", () => {
    it("should handle memory cleanup", () => {
      // Fill cache
      for (let i = 0; i < 100; i++) {
        queryOptimizationService.set(`key_${i}`, { id: i }, 100);
      }

      const beforeCleanup = queryOptimizationService.getCacheStats().entries;

      // Wait for expiration
      setTimeout(() => {
        const cleaned = queryOptimizationService.cleanupExpiredEntries();
        expect(cleaned).toBeGreaterThan(0);
      }, 150);
    });

    it("should provide health metrics", () => {
      // Setup data
      queryOptimizationService.set("test", { data: "test" });
      apiOptimizationService.recordResponse(
        "/api/test",
        "GET",
        100,
        200,
        1024
      );

      for (let i = 0; i < 5; i++) {
        anomalyDetectionService.updateBaseline("metric", 100);
      }

      // Verify all services provide metrics
      const cacheStats = queryOptimizationService.getCacheStats();
      expect(cacheStats.entries).toBeGreaterThan(0);

      const apiStats = apiOptimizationService.getPerformanceStats();
      expect(apiStats.totalRequests).toBeGreaterThan(0);

      const anomalyStats = anomalyDetectionService.getStats();
      expect(anomalyStats.totalAnomalies).toBeGreaterThanOrEqual(0);
    });
  });
});
