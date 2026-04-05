/**
 * API Performance Tuning & Caching Strategy
 * Phase 64.2: API Performance Tuning & Caching
 */

import { z } from "zod";

export interface APIPerformanceMetric {
  endpoint: string;
  method: string;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  requestsPerSecond: number;
  cacheHitRate: number;
}

export interface CacheConfig {
  key: string;
  ttl: number; // seconds
  maxSize: number;
  strategy: "LRU" | "LFU" | "FIFO";
  enabled: boolean;
}

/**
 * API Performance Metrics Analysis
 */
export const apiPerformanceMetrics: APIPerformanceMetric[] = [
  {
    endpoint: "/api/trpc/investmentMgmt.getPortfolios",
    method: "GET",
    averageResponseTime: 250,
    p95ResponseTime: 450,
    p99ResponseTime: 800,
    errorRate: 0.001,
    requestsPerSecond: 10,
    cacheHitRate: 0.65,
  },
  {
    endpoint: "/api/trpc/investmentMgmt.getHoldings",
    method: "GET",
    averageResponseTime: 320,
    p95ResponseTime: 580,
    p99ResponseTime: 1200,
    errorRate: 0.002,
    requestsPerSecond: 8,
    cacheHitRate: 0.58,
  },
  {
    endpoint: "/api/trpc/investmentMgmt.getPortfolioPerformance",
    method: "GET",
    averageResponseTime: 450,
    p95ResponseTime: 850,
    p99ResponseTime: 1500,
    errorRate: 0.001,
    requestsPerSecond: 5,
    cacheHitRate: 0.72,
  },
  {
    endpoint: "/api/trpc/broadcastRadio.getChannels",
    method: "GET",
    averageResponseTime: 200,
    p95ResponseTime: 380,
    p99ResponseTime: 650,
    errorRate: 0.0005,
    requestsPerSecond: 12,
    cacheHitRate: 0.68,
  },
  {
    endpoint: "/api/trpc/broadcastRadio.getEpisodes",
    method: "GET",
    averageResponseTime: 280,
    p95ResponseTime: 520,
    p99ResponseTime: 950,
    errorRate: 0.001,
    requestsPerSecond: 10,
    cacheHitRate: 0.62,
  },
];

/**
 * Cache Configuration for Different Endpoints
 */
export const cacheConfigurations: Record<string, CacheConfig> = {
  // Portfolio endpoints
  "investmentMgmt.getPortfolios": {
    key: "portfolios:{userId}",
    ttl: 300, // 5 minutes
    maxSize: 1000,
    strategy: "LRU",
    enabled: true,
  },
  "investmentMgmt.getPortfolioDetails": {
    key: "portfolio:{portfolioId}",
    ttl: 600, // 10 minutes
    maxSize: 500,
    strategy: "LRU",
    enabled: true,
  },
  "investmentMgmt.getHoldings": {
    key: "holdings:{portfolioId}",
    ttl: 300, // 5 minutes
    maxSize: 800,
    strategy: "LRU",
    enabled: true,
  },
  "investmentMgmt.getPortfolioPerformance": {
    key: "performance:{portfolioId}:{timeframe}",
    ttl: 600, // 10 minutes
    maxSize: 500,
    strategy: "LRU",
    enabled: true,
  },
  "investmentMgmt.getAllocationBreakdown": {
    key: "allocation:{portfolioId}",
    ttl: 900, // 15 minutes
    maxSize: 300,
    strategy: "LRU",
    enabled: true,
  },
  "investmentMgmt.getMarketData": {
    key: "market:{symbol}",
    ttl: 60, // 1 minute
    maxSize: 5000,
    strategy: "LRU",
    enabled: true,
  },
  "investmentMgmt.getWatchlist": {
    key: "watchlist:{userId}",
    ttl: 300, // 5 minutes
    maxSize: 1000,
    strategy: "LRU",
    enabled: true,
  },

  // Broadcast endpoints
  "broadcastRadio.getChannels": {
    key: "channels:{userId}",
    ttl: 600, // 10 minutes
    maxSize: 500,
    strategy: "LRU",
    enabled: true,
  },
  "broadcastRadio.getEpisodes": {
    key: "episodes:{channelId}",
    ttl: 300, // 5 minutes
    maxSize: 800,
    strategy: "LRU",
    enabled: true,
  },
  "broadcastRadio.getLiveStreams": {
    key: "live:{channelId}",
    ttl: 30, // 30 seconds
    maxSize: 200,
    strategy: "LFU",
    enabled: true,
  },
  "broadcastRadio.getAudienceMetrics": {
    key: "metrics:{channelId}",
    ttl: 60, // 1 minute
    maxSize: 300,
    strategy: "LRU",
    enabled: true,
  },
};

/**
 * Response Compression Configuration
 */
export const compressionConfig = {
  enabled: true,
  threshold: 1024, // bytes - compress responses larger than 1KB
  level: 6, // compression level (1-9)
  types: [
    "application/json",
    "application/javascript",
    "text/html",
    "text/css",
    "text/plain",
  ],
};

/**
 * Pagination Configuration
 */
export const paginationDefaults = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultOffset: 0,
};

/**
 * Rate Limiting Configuration
 */
export const rateLimitConfig = {
  enabled: true,
  windowMs: 60000, // 1 minute
  maxRequests: {
    public: 100, // 100 requests per minute for public endpoints
    authenticated: 500, // 500 requests per minute for authenticated users
    admin: 1000, // 1000 requests per minute for admin users
  },
  keyGenerator: (req: any) => req.user?.id || req.ip,
};

/**
 * API Response Optimization Strategies
 */
export const responseOptimizations = {
  // Selective field loading
  fieldSelection: {
    enabled: true,
    description: "Allow clients to request only needed fields",
    example: "?fields=id,name,value",
  },

  // Response pagination
  pagination: {
    enabled: true,
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  // Response filtering
  filtering: {
    enabled: true,
    description: "Allow clients to filter results",
    example: "?filter=status:active,type:stock",
  },

  // Response sorting
  sorting: {
    enabled: true,
    description: "Allow clients to sort results",
    example: "?sort=-createdAt,name",
  },

  // Batch operations
  batchOperations: {
    enabled: true,
    maxBatchSize: 50,
    description: "Allow clients to batch multiple requests",
  },
};

/**
 * Database Query Optimization for API
 */
export const queryOptimizations = {
  // Use database views for complex aggregations
  views: [
    "portfolio_performance_summary",
    "portfolio_allocation_breakdown",
    "broadcast_channel_stats",
    "broadcast_episode_metrics",
  ],

  // Materialized views for expensive calculations
  materializedViews: [
    "portfolio_performance_daily",
    "portfolio_allocation_monthly",
    "broadcast_channel_analytics_weekly",
  ],

  // Query result caching
  caching: {
    enabled: true,
    ttl: 300, // 5 minutes
    invalidationTriggers: ["INSERT", "UPDATE", "DELETE"],
  },

  // Connection pooling
  connectionPool: {
    min: 5,
    max: 20,
    idleTimeout: 30000,
  },
};

/**
 * API Monitoring & Alerting
 */
export const monitoringConfig = {
  metrics: {
    enabled: true,
    sampleRate: 0.1, // Sample 10% of requests
    recordedMetrics: [
      "response_time",
      "error_rate",
      "cache_hit_rate",
      "database_query_time",
      "memory_usage",
      "cpu_usage",
    ],
  },

  alerts: {
    enabled: true,
    thresholds: {
      responseTime: 1000, // Alert if avg response time > 1 second
      errorRate: 0.05, // Alert if error rate > 5%
      cacheHitRate: 0.5, // Alert if cache hit rate < 50%
      cpuUsage: 80, // Alert if CPU > 80%
      memoryUsage: 85, // Alert if memory > 85%
    },
  },

  logging: {
    enabled: true,
    level: "info",
    slowQueryThreshold: 500, // Log queries slower than 500ms
  },
};

/**
 * Performance Improvement Recommendations
 */
export const performanceRecommendations = [
  "Implement Redis caching layer for frequently accessed data",
  "Add database query result caching with TTL",
  "Implement response compression (gzip) for all API responses",
  "Add pagination to all list endpoints",
  "Implement field selection to reduce payload size",
  "Add batch operation support for bulk requests",
  "Implement connection pooling for database connections",
  "Add database indexes for frequently queried columns",
  "Implement materialized views for complex aggregations",
  "Add API rate limiting to prevent abuse",
  "Implement request/response logging for debugging",
  "Add performance monitoring and alerting",
  "Implement CDN caching for static assets",
  "Add HTTP/2 server push for critical resources",
  "Implement lazy loading for frontend components",
];

/**
 * Expected Performance Improvements
 */
export const expectedImprovements = {
  responseTime: {
    before: 350, // ms
    after: 150, // ms
    improvement: 57, // percent
  },
  cacheHitRate: {
    before: 0.62,
    after: 0.85,
    improvement: 37, // percent
  },
  throughput: {
    before: 100, // requests per second
    after: 250, // requests per second
    improvement: 150, // percent
  },
  errorRate: {
    before: 0.001,
    after: 0.0005,
    improvement: 50, // percent
  },
};
