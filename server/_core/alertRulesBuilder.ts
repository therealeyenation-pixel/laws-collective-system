/**
 * Custom Alert Rules Builder
 * Visual rule builder for creating complex alert escalation workflows
 */

interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: AlertCondition[];
  actions: AlertAction[];
  escalationPath?: EscalationLevel[];
  priority: "low" | "medium" | "high" | "critical";
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  tags?: string[];
}

interface AlertCondition {
  id: string;
  type: "metric" | "event" | "time" | "threshold" | "pattern";
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "matches";
  value: any;
  logicalOperator?: "and" | "or";
}

interface AlertAction {
  id: string;
  type: "notify" | "email" | "sms" | "page" | "webhook" | "escalate" | "create_ticket";
  target?: string;
  template?: string;
  delay?: number; // seconds
  retryCount?: number;
}

interface EscalationLevel {
  level: number;
  delay: number; // seconds
  actions: AlertAction[];
  notificationGroups: string[];
}

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  conditions: AlertCondition[];
  actions: AlertAction[];
  escalationPath?: EscalationLevel[];
  createdAt: Date;
}

interface RuleExecution {
  id: string;
  ruleId: string;
  triggeredAt: Date;
  completedAt?: Date;
  status: "pending" | "executing" | "completed" | "failed";
  actionsExecuted: number;
  error?: string;
}

class AlertRulesBuilderService {
  private rules: Map<string, AlertRule> = new Map();
  private templates: Map<string, RuleTemplate> = new Map();
  private executions: RuleExecution[] = [];
  private readonly EXECUTION_HISTORY_LIMIT = 50000;

  /**
   * Create alert rule
   */
  createRule(rule: Omit<AlertRule, "id" | "createdAt" | "updatedAt">): AlertRule {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rules.set(newRule.id, newRule);
    return newRule;
  }

  /**
   * Get rule
   */
  getRule(ruleId: string): AlertRule | null {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Get user rules
   */
  getUserRules(owner: string): AlertRule[] {
    return Array.from(this.rules.values()).filter((r) => r.owner === owner);
  }

  /**
   * Get enabled rules
   */
  getEnabledRules(): AlertRule[] {
    return Array.from(this.rules.values()).filter((r) => r.enabled);
  }

  /**
   * Update rule
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): AlertRule | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    const updated: AlertRule = {
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
   * Enable rule
   */
  enableRule(ruleId: string): AlertRule | null {
    return this.updateRule(ruleId, { enabled: true });
  }

  /**
   * Disable rule
   */
  disableRule(ruleId: string): AlertRule | null {
    return this.updateRule(ruleId, { enabled: false });
  }

  /**
   * Validate rule
   */
  validateRule(rule: AlertRule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.name || rule.name.trim().length === 0) {
      errors.push("Rule name is required");
    }

    if (!rule.conditions || rule.conditions.length === 0) {
      errors.push("At least one condition is required");
    }

    if (!rule.actions || rule.actions.length === 0) {
      errors.push("At least one action is required");
    }

    for (const condition of rule.conditions || []) {
      if (!condition.field || !condition.operator || condition.value === undefined) {
        errors.push("All conditions must have field, operator, and value");
      }
    }

    for (const action of rule.actions || []) {
      if (!action.type) {
        errors.push("All actions must have a type");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Test rule
   */
  testRule(ruleId: string, testData: Record<string, any>): { matched: boolean; actionsToExecute: AlertAction[] } {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return { matched: false, actionsToExecute: [] };
    }

    // Evaluate conditions
    let matched = true;
    for (const condition of rule.conditions) {
      if (!this.evaluateCondition(condition, testData)) {
        matched = false;
        break;
      }
    }

    return {
      matched,
      actionsToExecute: matched ? rule.actions : [],
    };
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: AlertCondition, data: Record<string, any>): boolean {
    const value = data[condition.field];

    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "not_equals":
        return value !== condition.value;
      case "greater_than":
        return value > condition.value;
      case "less_than":
        return value < condition.value;
      case "contains":
        return String(value).includes(String(condition.value));
      case "matches":
        return new RegExp(condition.value).test(String(value));
      default:
        return false;
    }
  }

  /**
   * Execute rule
   */
  executeRule(ruleId: string, triggerData: Record<string, any>): RuleExecution {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error("Rule not found");
    }

    const execution: RuleExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId,
      triggeredAt: new Date(),
      status: "executing",
      actionsExecuted: 0,
    };

    this.executions.push(execution);

    // Simulate execution
    setTimeout(() => {
      const test = this.testRule(ruleId, triggerData);

      if (test.matched) {
        execution.actionsExecuted = test.actionsToExecute.length;
        execution.status = "completed";
      } else {
        execution.status = "completed";
      }

      execution.completedAt = new Date();
    }, 500);

    // Maintain history limit
    if (this.executions.length > this.EXECUTION_HISTORY_LIMIT) {
      this.executions = this.executions.slice(-this.EXECUTION_HISTORY_LIMIT);
    }

    return execution;
  }

  /**
   * Get execution
   */
  getExecution(executionId: string): RuleExecution | null {
    return this.executions.find((e) => e.id === executionId) || null;
  }

  /**
   * Get rule executions
   */
  getRuleExecutions(ruleId: string, limit: number = 100): RuleExecution[] {
    return this.executions
      .filter((e) => e.ruleId === ruleId)
      .slice(-limit);
  }

  /**
   * Create template
   */
  createTemplate(template: Omit<RuleTemplate, "id" | "createdAt">): RuleTemplate {
    const newTemplate: RuleTemplate = {
      ...template,
      id: `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  /**
   * Get template
   */
  getTemplate(templateId: string): RuleTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): RuleTemplate[] {
    return Array.from(this.templates.values()).filter((t) => t.category === category);
  }

  /**
   * Create rule from template
   */
  createRuleFromTemplate(templateId: string, owner: string): AlertRule | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    return this.createRule({
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      enabled: true,
      conditions: template.conditions,
      actions: template.actions,
      escalationPath: template.escalationPath,
      priority: "medium",
      owner,
    });
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalRules: number;
    enabledRules: number;
    totalTemplates: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
  } {
    const enabledRules = Array.from(this.rules.values()).filter((r) => r.enabled).length;
    const successfulExecutions = this.executions.filter((e) => e.status === "completed" && !e.error).length;
    const failedExecutions = this.executions.filter((e) => e.status === "failed").length;

    return {
      totalRules: this.rules.size,
      enabledRules,
      totalTemplates: this.templates.size,
      totalExecutions: this.executions.length,
      successfulExecutions,
      failedExecutions,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.rules.clear();
    this.templates.clear();
    this.executions = [];
  }
}

export const alertRulesBuilderService = new AlertRulesBuilderService();
