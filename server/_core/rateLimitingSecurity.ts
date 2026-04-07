/**
 * API Rate Limiting & Security Hardening
 * Comprehensive rate limiting, throttling, and security controls
 */

interface RateLimitConfig {
  endpoint: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstSize: number;
  enabled: boolean;
}

interface ClientRateLimit {
  clientId: string;
  endpoint: string;
  requestCount: number;
  lastReset: Date;
  blocked: boolean;
  blockedUntil?: Date;
}

interface SecurityPolicy {
  id: string;
  name: string;
  type: "ip_whitelist" | "ip_blacklist" | "user_agent" | "custom";
  rules: string[];
  enabled: boolean;
  createdAt: Date;
}

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: "rate_limit_exceeded" | "suspicious_activity" | "policy_violation" | "security_alert";
  severity: "info" | "warning" | "critical";
  clientId: string;
  endpoint?: string;
  details: Record<string, any>;
  resolved: boolean;
}

class RateLimitingSecurityService {
  private rateLimitConfigs: Map<string, RateLimitConfig> = new Map();
  private clientRateLimits: Map<string, ClientRateLimit> = new Map();
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private readonly EVENT_HISTORY_LIMIT = 50000;

  /**
   * Create rate limit config
   */
  createRateLimitConfig(config: Omit<RateLimitConfig, "enabled">): RateLimitConfig {
    const fullConfig: RateLimitConfig = {
      ...config,
      enabled: true,
    };

    this.rateLimitConfigs.set(config.endpoint, fullConfig);
    return fullConfig;
  }

  /**
   * Get rate limit config
   */
  getRateLimitConfig(endpoint: string): RateLimitConfig | null {
    return this.rateLimitConfigs.get(endpoint) || null;
  }

  /**
   * Check rate limit
   */
  checkRateLimit(clientId: string, endpoint: string): { allowed: boolean; retryAfter?: number } {
    const config = this.rateLimitConfigs.get(endpoint);

    if (!config || !config.enabled) {
      return { allowed: true };
    }

    const key = `${clientId}:${endpoint}`;
    let clientLimit = this.clientRateLimits.get(key);

    if (!clientLimit) {
      clientLimit = {
        clientId,
        endpoint,
        requestCount: 0,
        lastReset: new Date(),
        blocked: false,
      };
      this.clientRateLimits.set(key, clientLimit);
    }

    // Check if blocked
    if (clientLimit.blocked && clientLimit.blockedUntil) {
      if (new Date() < clientLimit.blockedUntil) {
        const retryAfter = Math.ceil((clientLimit.blockedUntil.getTime() - Date.now()) / 1000);
        return { allowed: false, retryAfter };
      } else {
        clientLimit.blocked = false;
        clientLimit.blockedUntil = undefined;
      }
    }

    // Reset if time window passed
    const timeSinceReset = (Date.now() - clientLimit.lastReset.getTime()) / 1000 / 60;
    if (timeSinceReset >= 1) {
      clientLimit.requestCount = 0;
      clientLimit.lastReset = new Date();
    }

    // Check limits
    if (clientLimit.requestCount >= config.burstSize) {
      clientLimit.blocked = true;
      clientLimit.blockedUntil = new Date(Date.now() + 60000); // Block for 1 minute

      this.logSecurityEvent({
        type: "rate_limit_exceeded",
        severity: "warning",
        clientId,
        endpoint,
        details: { requestCount: clientLimit.requestCount, limit: config.burstSize },
      });

      return { allowed: false, retryAfter: 60 };
    }

    clientLimit.requestCount++;
    return { allowed: true };
  }

  /**
   * Create security policy
   */
  createSecurityPolicy(policy: Omit<SecurityPolicy, "id" | "createdAt">): SecurityPolicy {
    const newPolicy: SecurityPolicy = {
      ...policy,
      id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.securityPolicies.set(newPolicy.id, newPolicy);
    return newPolicy;
  }

  /**
   * Get security policy
   */
  getSecurityPolicy(policyId: string): SecurityPolicy | null {
    return this.securityPolicies.get(policyId) || null;
  }

  /**
   * Get all security policies
   */
  getAllSecurityPolicies(): SecurityPolicy[] {
    return Array.from(this.securityPolicies.values());
  }

  /**
   * Check security policy
   */
  checkSecurityPolicy(clientId: string, userAgent?: string, ipAddress?: string): { allowed: boolean; reason?: string } {
    const policies = Array.from(this.securityPolicies.values()).filter((p) => p.enabled);

    for (const policy of policies) {
      if (policy.type === "ip_blacklist" && ipAddress) {
        if (policy.rules.includes(ipAddress)) {
          this.logSecurityEvent({
            type: "policy_violation",
            severity: "critical",
            clientId,
            details: { policyId: policy.id, ipAddress },
          });
          return { allowed: false, reason: "IP address is blacklisted" };
        }
      }

      if (policy.type === "ip_whitelist" && ipAddress) {
        if (!policy.rules.includes(ipAddress)) {
          this.logSecurityEvent({
            type: "policy_violation",
            severity: "warning",
            clientId,
            details: { policyId: policy.id, ipAddress },
          });
          return { allowed: false, reason: "IP address is not whitelisted" };
        }
      }

      if (policy.type === "user_agent" && userAgent) {
        const blocked = policy.rules.some((rule) => userAgent.includes(rule));
        if (blocked) {
          this.logSecurityEvent({
            type: "policy_violation",
            severity: "warning",
            clientId,
            details: { policyId: policy.id, userAgent },
          });
          return { allowed: false, reason: "User agent is blocked" };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Log security event
   */
  private logSecurityEvent(event: Omit<SecurityEvent, "id" | "timestamp" | "resolved">): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
    };

    this.securityEvents.push(securityEvent);

    // Maintain history limit
    if (this.securityEvents.length > this.EVENT_HISTORY_LIMIT) {
      this.securityEvents = this.securityEvents.slice(-this.EVENT_HISTORY_LIMIT);
    }
  }

  /**
   * Get security events
   */
  getSecurityEvents(filters?: {
    type?: string;
    severity?: string;
    clientId?: string;
    resolved?: boolean;
    limit?: number;
  }): SecurityEvent[] {
    let results = [...this.securityEvents];

    if (filters?.type) {
      results = results.filter((e) => e.type === filters.type);
    }

    if (filters?.severity) {
      results = results.filter((e) => e.severity === filters.severity);
    }

    if (filters?.clientId) {
      results = results.filter((e) => e.clientId === filters.clientId);
    }

    if (filters?.resolved !== undefined) {
      results = results.filter((e) => e.resolved === filters.resolved);
    }

    const limit = filters?.limit || 1000;
    return results.slice(-limit);
  }

  /**
   * Resolve security event
   */
  resolveSecurityEvent(eventId: string): SecurityEvent | null {
    const event = this.securityEvents.find((e) => e.id === eventId);
    if (event) {
      event.resolved = true;
    }
    return event || null;
  }

  /**
   * Get security statistics
   */
  getStats(): {
    totalRateLimitConfigs: number;
    totalSecurityPolicies: number;
    totalSecurityEvents: number;
    unresolvedSecurityEvents: number;
    criticalSecurityEvents: number;
    blockedClients: number;
  } {
    const blockedClients = new Set(
      Array.from(this.clientRateLimits.values())
        .filter((c) => c.blocked)
        .map((c) => c.clientId)
    ).size;

    const unresolvedEvents = this.securityEvents.filter((e) => !e.resolved).length;
    const criticalEvents = this.securityEvents.filter((e) => e.severity === "critical").length;

    return {
      totalRateLimitConfigs: this.rateLimitConfigs.size,
      totalSecurityPolicies: this.securityPolicies.size,
      totalSecurityEvents: this.securityEvents.length,
      unresolvedSecurityEvents: unresolvedEvents,
      criticalSecurityEvents: criticalEvents,
      blockedClients,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.rateLimitConfigs.clear();
    this.clientRateLimits.clear();
    this.securityPolicies.clear();
    this.securityEvents = [];
  }
}

export const rateLimitingSecurityService = new RateLimitingSecurityService();
