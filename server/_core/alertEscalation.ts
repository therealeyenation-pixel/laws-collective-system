/**
 * Alert Escalation Rules Engine
 * Manages tiered escalation workflows for alerts
 */

interface EscalationRule {
  id: string;
  name: string;
  alertType: string;
  severity: "low" | "normal" | "high" | "critical";
  tiers: EscalationTier[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EscalationTier {
  level: number;
  name: string;
  waitTimeMinutes: number;
  actions: EscalationAction[];
  conditions: EscalationCondition[];
}

interface EscalationAction {
  type: "notify" | "email" | "sms" | "page" | "escalate";
  target: string;
  template?: string;
  priority: "low" | "normal" | "high" | "critical";
}

interface EscalationCondition {
  type: "time" | "unacknowledged" | "custom";
  value: any;
}

interface ActiveEscalation {
  id: string;
  alertId: string;
  ruleId: string;
  currentTier: number;
  startedAt: Date;
  lastEscalatedAt?: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

class AlertEscalationService {
  private rules: Map<string, EscalationRule> = new Map();
  private activeEscalations: Map<string, ActiveEscalation> = new Map();
  private escalationHistory: ActiveEscalation[] = [];

  /**
   * Create escalation rule
   */
  createRule(rule: Omit<EscalationRule, "id" | "createdAt" | "updatedAt">): EscalationRule {
    const newRule: EscalationRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rules.set(newRule.id, newRule);
    return newRule;
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): EscalationRule | null {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Get all rules
   */
  getAllRules(): EscalationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Update rule
   */
  updateRule(ruleId: string, updates: Partial<EscalationRule>): EscalationRule | null {
    const rule = this.rules.get(ruleId);

    if (!rule) {
      return null;
    }

    const updated = {
      ...rule,
      ...updates,
      id: rule.id,
      createdAt: rule.createdAt,
      updatedAt: new Date(),
    };

    this.rules.set(ruleId, updated);
    return updated;
  }

  /**
   * Delete rule
   */
  deleteRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Start escalation for alert
   */
  startEscalation(alertId: string, ruleId: string): ActiveEscalation | null {
    const rule = this.rules.get(ruleId);

    if (!rule || !rule.enabled) {
      return null;
    }

    const escalation: ActiveEscalation = {
      id: `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      alertId,
      ruleId,
      currentTier: 0,
      startedAt: new Date(),
      acknowledged: false,
      resolved: false,
    };

    this.activeEscalations.set(escalation.id, escalation);
    this.escalationHistory.push(escalation);

    return escalation;
  }

  /**
   * Get active escalation
   */
  getActiveEscalation(escalationId: string): ActiveEscalation | null {
    return this.activeEscalations.get(escalationId) || null;
  }

  /**
   * Get escalations for alert
   */
  getEscalationsForAlert(alertId: string): ActiveEscalation[] {
    return Array.from(this.activeEscalations.values()).filter(
      (e) => e.alertId === alertId
    );
  }

  /**
   * Acknowledge escalation
   */
  acknowledgeEscalation(
    escalationId: string,
    userId: string
  ): ActiveEscalation | null {
    const escalation = this.activeEscalations.get(escalationId);

    if (!escalation) {
      return null;
    }

    escalation.acknowledged = true;
    escalation.acknowledgedBy = userId;
    escalation.acknowledgedAt = new Date();

    return escalation;
  }

  /**
   * Escalate to next tier
   */
  escalateToNextTier(escalationId: string): ActiveEscalation | null {
    const escalation = this.activeEscalations.get(escalationId);
    const rule = this.rules.get(escalation?.ruleId || "");

    if (!escalation || !rule) {
      return null;
    }

    if (escalation.currentTier < rule.tiers.length - 1) {
      escalation.currentTier += 1;
      escalation.lastEscalatedAt = new Date();
    }

    return escalation;
  }

  /**
   * Resolve escalation
   */
  resolveEscalation(escalationId: string): ActiveEscalation | null {
    const escalation = this.activeEscalations.get(escalationId);

    if (!escalation) {
      return null;
    }

    escalation.resolved = true;
    escalation.resolvedAt = new Date();

    this.activeEscalations.delete(escalationId);

    return escalation;
  }

  /**
   * Check escalations that need to move to next tier
   */
  checkEscalationTimers(): ActiveEscalation[] {
    const escalatedList: ActiveEscalation[] = [];
    const now = new Date();

    for (const escalation of this.activeEscalations.values()) {
      if (escalation.acknowledged || escalation.resolved) {
        continue;
      }

      const rule = this.rules.get(escalation.ruleId);
      if (!rule) continue;

      const currentTier = rule.tiers[escalation.currentTier];
      if (!currentTier) continue;

      const timeSinceStart = now.getTime() - escalation.startedAt.getTime();
      const waitTimeMs = currentTier.waitTimeMinutes * 60 * 1000;

      if (timeSinceStart >= waitTimeMs && escalation.currentTier < rule.tiers.length - 1) {
        this.escalateToNextTier(escalation.id);
        escalatedList.push(escalation);
      }
    }

    return escalatedList;
  }

  /**
   * Get escalation actions for current tier
   */
  getEscalationActions(escalationId: string): EscalationAction[] {
    const escalation = this.activeEscalations.get(escalationId);
    const rule = this.rules.get(escalation?.ruleId || "");

    if (!escalation || !rule) {
      return [];
    }

    const tier = rule.tiers[escalation.currentTier];
    return tier?.actions || [];
  }

  /**
   * Get escalation statistics
   */
  getStats(): {
    totalRules: number;
    enabledRules: number;
    activeEscalations: number;
    acknowledgedEscalations: number;
    resolvedEscalations: number;
    averageEscalationTime: number;
  } {
    const enabledRules = Array.from(this.rules.values()).filter(
      (r) => r.enabled
    ).length;

    const acknowledged = Array.from(this.activeEscalations.values()).filter(
      (e) => e.acknowledged
    ).length;

    const avgTime =
      this.escalationHistory.length > 0
        ? this.escalationHistory.reduce((sum, e) => {
            const time = (e.resolvedAt || new Date()).getTime() - e.startedAt.getTime();
            return sum + time;
          }, 0) / this.escalationHistory.length
        : 0;

    return {
      totalRules: this.rules.size,
      enabledRules,
      activeEscalations: this.activeEscalations.size,
      acknowledgedEscalations: acknowledged,
      resolvedEscalations: this.escalationHistory.filter((e) => e.resolved).length,
      averageEscalationTime: Math.round(avgTime / 1000 / 60), // minutes
    };
  }

  /**
   * Get escalation history
   */
  getHistory(limit: number = 100): ActiveEscalation[] {
    return this.escalationHistory.slice(-limit);
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.rules.clear();
    this.activeEscalations.clear();
    this.escalationHistory = [];
  }
}

export const alertEscalationService = new AlertEscalationService();
