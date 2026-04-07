/**
 * Query Optimization & Caching Strategy
 * Provides utilities for optimizing database queries and implementing caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class QueryOptimizationService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private queryMetrics: Map<string, { count: number; totalTime: number }> =
    new Map();

  /**
   * Simple in-memory cache implementation
   * In production, use Redis for distributed caching
   */
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(pattern: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.cache.clear();
  }

  /**
   * Track query performance
   */
  trackQuery(queryName: string, executionTimeMs: number): void {
    const metric = this.queryMetrics.get(queryName) || { count: 0, totalTime: 0 };
    metric.count++;
    metric.totalTime += executionTimeMs;
    this.queryMetrics.set(queryName, metric);
  }

  /**
   * Get query metrics
   */
  getQueryMetrics(): Array<{
    query: string;
    count: number;
    totalTime: number;
    averageTime: number;
  }> {
    const metrics: Array<{
      query: string;
      count: number;
      totalTime: number;
      averageTime: number;
    }> = [];

    for (const [query, metric] of this.queryMetrics) {
      metrics.push({
        query,
        count: metric.count,
        totalTime: metric.totalTime,
        averageTime: metric.totalTime / metric.count,
      });
    }

    // Sort by total time descending
    return metrics.sort((a, b) => b.totalTime - a.totalTime);
  }

  /**
   * Get slow queries (average time > threshold)
   */
  getSlowQueries(thresholdMs: number = 100): Array<{
    query: string;
    count: number;
    totalTime: number;
    averageTime: number;
  }> {
    return this.getQueryMetrics().filter((m) => m.averageTime > thresholdMs);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: number;
    hitRate: number;
    memoryUsage: string;
  } {
    return {
      size: this.cache.size,
      entries: this.cache.size,
      hitRate: 0, // Would need to track hits vs misses
      memoryUsage: `${(this.cache.size * 1024).toFixed(2)} KB (estimated)`,
    };
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupExpiredEntries(): number {
    let count = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }
}

// Export singleton instance
export const queryOptimizationService = new QueryOptimizationService();

/**
 * Query optimization recommendations
 */
export const QUERY_OPTIMIZATION_GUIDE = {
  commonIssues: [
    {
      issue: "N+1 Query Problem",
      description:
        "Executing one query to get parent records, then N queries to get child records",
      solution: "Use JOIN queries or batch loading to fetch related data in one query",
      example:
        "Instead of: for(user in users) { user.posts = getPosts(user.id) }, use: JOIN users WITH posts",
    },
    {
      issue: "Missing Indexes",
      description:
        "Queries on non-indexed columns cause full table scans",
      solution: "Add indexes on frequently queried columns (WHERE, JOIN, ORDER BY)",
      example:
        "CREATE INDEX idx_user_email ON users(email); CREATE INDEX idx_post_user_id ON posts(user_id)",
    },
    {
      issue: "Inefficient Pagination",
      description: "Using OFFSET on large datasets is slow",
      solution: "Use cursor-based pagination or keyset pagination",
      example:
        "Instead of: LIMIT 10 OFFSET 1000000, use: WHERE id > last_id LIMIT 10",
    },
    {
      issue: "Unnecessary Data Retrieval",
      description: "Selecting all columns when only a few are needed",
      solution: "Select only required columns",
      example:
        "Instead of: SELECT * FROM users, use: SELECT id, email, name FROM users",
    },
    {
      issue: "Missing Query Caching",
      description: "Repeated queries for same data",
      solution: "Implement caching for frequently accessed data",
      example:
        "Cache user profiles for 5 minutes, cache channel list for 1 hour",
    },
  ],

  bestPractices: [
    "Use database indexes on columns used in WHERE, JOIN, and ORDER BY clauses",
    "Implement query result caching for frequently accessed data",
    "Use pagination for large result sets",
    "Select only required columns instead of SELECT *",
    "Use batch operations for bulk inserts/updates",
    "Monitor slow queries and optimize them",
    "Use connection pooling to manage database connections",
    "Implement query timeouts to prevent long-running queries",
    "Use prepared statements to prevent SQL injection",
    "Profile queries to identify bottlenecks",
  ],

  cachingStrategy: {
    shortLived: {
      ttl: "1-5 minutes",
      examples: ["User sessions", "Current system status", "Real-time metrics"],
    },
    mediumLived: {
      ttl: "15-60 minutes",
      examples: ["User profiles", "Channel lists", "Broadcast schedules"],
    },
    longLived: {
      ttl: "1-24 hours",
      examples: [
        "System configuration",
        "Static content",
        "Reference data",
      ],
    },
  },

  indexRecommendations: [
    "users(email) - For login queries",
    "users(id) - For user lookups",
    "broadcasts(channel_id) - For channel queries",
    "broadcasts(created_at) - For time-based queries",
    "errors(component, timestamp) - For error tracking",
    "conferences(user_id, start_time) - For user conference queries",
    "music(artist_id) - For artist lookups",
    "notifications(user_id, category) - For notification queries",
  ],
};
