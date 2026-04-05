// Integration Hub Service - Manages external service integrations

export type IntegrationCategory = 'accounting' | 'calendar' | 'communication' | 'storage' | 'payment' | 'crm';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending' | 'expired';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: string;
  status: IntegrationStatus;
  connectedAt?: number;
  lastSyncAt?: number;
  expiresAt?: number;
  config?: Record<string, any>;
  permissions?: string[];
  webhookUrl?: string;
  apiKeyRequired: boolean;
  oauthRequired: boolean;
}

export interface IntegrationHealth {
  integrationId: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  lastCheck: number;
  errorMessage?: string;
  successRate: number;
}

export interface WebhookConfig {
  id: string;
  integrationId: string;
  url: string;
  events: string[];
  secret?: string;
  enabled: boolean;
  createdAt: number;
  lastTriggered?: number;
  failureCount: number;
}

export interface ApiKey {
  id: string;
  name: string;
  integrationId?: string;
  key: string;
  maskedKey: string;
  permissions: string[];
  createdAt: number;
  expiresAt?: number;
  lastUsed?: number;
  usageCount: number;
}

// Available integrations
const AVAILABLE_INTEGRATIONS: Omit<Integration, 'status' | 'connectedAt' | 'lastSyncAt'>[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    description: 'Sync financial data, invoices, and expenses with QuickBooks',
    category: 'accounting',
    icon: 'Calculator',
    apiKeyRequired: false,
    oauthRequired: true,
    permissions: ['read_transactions', 'write_invoices', 'read_accounts']
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Connect to Xero for accounting and bookkeeping',
    category: 'accounting',
    icon: 'Receipt',
    apiKeyRequired: false,
    oauthRequired: true,
    permissions: ['read_transactions', 'write_invoices']
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync events, meetings, and deadlines with Google Calendar',
    category: 'calendar',
    icon: 'Calendar',
    apiKeyRequired: false,
    oauthRequired: true,
    permissions: ['read_events', 'write_events']
  },
  {
    id: 'outlook_calendar',
    name: 'Outlook Calendar',
    description: 'Sync with Microsoft Outlook Calendar',
    category: 'calendar',
    icon: 'CalendarDays',
    apiKeyRequired: false,
    oauthRequired: true,
    permissions: ['read_events', 'write_events']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications and updates to Slack channels',
    category: 'communication',
    icon: 'MessageSquare',
    apiKeyRequired: true,
    oauthRequired: false,
    permissions: ['send_messages', 'read_channels']
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Store and sync documents with Google Drive',
    category: 'storage',
    icon: 'HardDrive',
    apiKeyRequired: false,
    oauthRequired: true,
    permissions: ['read_files', 'write_files']
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Backup and sync files with Dropbox',
    category: 'storage',
    icon: 'Cloud',
    apiKeyRequired: false,
    oauthRequired: true,
    permissions: ['read_files', 'write_files']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage subscriptions',
    category: 'payment',
    icon: 'CreditCard',
    apiKeyRequired: true,
    oauthRequired: false,
    permissions: ['read_payments', 'write_payments', 'manage_subscriptions']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Accept PayPal payments and transfers',
    category: 'payment',
    icon: 'Wallet',
    apiKeyRequired: true,
    oauthRequired: false,
    permissions: ['read_payments', 'write_payments']
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync contacts and deals with HubSpot CRM',
    category: 'crm',
    icon: 'Users',
    apiKeyRequired: true,
    oauthRequired: false,
    permissions: ['read_contacts', 'write_contacts', 'read_deals']
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect to Salesforce for CRM integration',
    category: 'crm',
    icon: 'Building2',
    apiKeyRequired: false,
    oauthRequired: true,
    permissions: ['read_contacts', 'write_contacts', 'read_opportunities']
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sync email lists and campaigns',
    category: 'communication',
    icon: 'Mail',
    apiKeyRequired: true,
    oauthRequired: false,
    permissions: ['read_lists', 'write_lists', 'send_campaigns']
  }
];

const STORAGE_KEY = 'integration_hub_data';
const WEBHOOKS_KEY = 'integration_webhooks';
const API_KEYS_KEY = 'integration_api_keys';
const HEALTH_KEY = 'integration_health';

class IntegrationHubService {
  private integrations: Map<string, Integration> = new Map();
  private webhooks: Map<string, WebhookConfig> = new Map();
  private apiKeys: Map<string, ApiKey> = new Map();
  private healthChecks: Map<string, IntegrationHealth> = new Map();

  constructor() {
    this.loadFromStorage();
    this.initializeIntegrations();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach((i: Integration) => this.integrations.set(i.id, i));
      }

      const webhooksStored = localStorage.getItem(WEBHOOKS_KEY);
      if (webhooksStored) {
        const data = JSON.parse(webhooksStored);
        data.forEach((w: WebhookConfig) => this.webhooks.set(w.id, w));
      }

      const apiKeysStored = localStorage.getItem(API_KEYS_KEY);
      if (apiKeysStored) {
        const data = JSON.parse(apiKeysStored);
        data.forEach((k: ApiKey) => this.apiKeys.set(k.id, k));
      }

      const healthStored = localStorage.getItem(HEALTH_KEY);
      if (healthStored) {
        const data = JSON.parse(healthStored);
        data.forEach((h: IntegrationHealth) => this.healthChecks.set(h.integrationId, h));
      }
    } catch (error) {
      console.error('Failed to load integration data:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.integrations.values())));
      localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(Array.from(this.webhooks.values())));
      localStorage.setItem(API_KEYS_KEY, JSON.stringify(Array.from(this.apiKeys.values())));
      localStorage.setItem(HEALTH_KEY, JSON.stringify(Array.from(this.healthChecks.values())));
    } catch (error) {
      console.error('Failed to save integration data:', error);
    }
  }

  private initializeIntegrations(): void {
    AVAILABLE_INTEGRATIONS.forEach(integration => {
      if (!this.integrations.has(integration.id)) {
        this.integrations.set(integration.id, {
          ...integration,
          status: 'disconnected'
        });
      }
    });
    this.saveToStorage();
  }

  // Get all integrations
  getAllIntegrations(): Integration[] {
    return Array.from(this.integrations.values());
  }

  // Get integrations by category
  getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
    return this.getAllIntegrations().filter(i => i.category === category);
  }

  // Get connected integrations
  getConnectedIntegrations(): Integration[] {
    return this.getAllIntegrations().filter(i => i.status === 'connected');
  }

  // Get integration by ID
  getIntegration(id: string): Integration | undefined {
    return this.integrations.get(id);
  }

  // Connect an integration
  async connectIntegration(id: string, config?: Record<string, any>): Promise<{ success: boolean; message: string }> {
    const integration = this.integrations.get(id);
    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    // Simulate OAuth or API key validation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updated: Integration = {
      ...integration,
      status: 'connected',
      connectedAt: Date.now(),
      lastSyncAt: Date.now(),
      config: config || integration.config
    };

    this.integrations.set(id, updated);

    // Initialize health check
    this.healthChecks.set(id, {
      integrationId: id,
      status: 'healthy',
      latency: Math.floor(Math.random() * 100) + 50,
      lastCheck: Date.now(),
      successRate: 100
    });

    this.saveToStorage();
    return { success: true, message: `${integration.name} connected successfully` };
  }

  // Disconnect an integration
  disconnectIntegration(id: string): { success: boolean; message: string } {
    const integration = this.integrations.get(id);
    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    const updated: Integration = {
      ...integration,
      status: 'disconnected',
      connectedAt: undefined,
      lastSyncAt: undefined,
      config: undefined
    };

    this.integrations.set(id, updated);
    this.healthChecks.delete(id);
    this.saveToStorage();

    return { success: true, message: `${integration.name} disconnected` };
  }

  // Sync an integration
  async syncIntegration(id: string): Promise<{ success: boolean; message: string; recordsSynced?: number }> {
    const integration = this.integrations.get(id);
    if (!integration || integration.status !== 'connected') {
      return { success: false, message: 'Integration not connected' };
    }

    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));

    const recordsSynced = Math.floor(Math.random() * 100) + 10;

    const updated: Integration = {
      ...integration,
      lastSyncAt: Date.now()
    };

    this.integrations.set(id, updated);
    this.saveToStorage();

    return { success: true, message: `Synced ${recordsSynced} records`, recordsSynced };
  }

  // Health check for an integration
  async checkHealth(id: string): Promise<IntegrationHealth> {
    const integration = this.integrations.get(id);
    if (!integration || integration.status !== 'connected') {
      return {
        integrationId: id,
        status: 'down',
        lastCheck: Date.now(),
        errorMessage: 'Integration not connected',
        successRate: 0
      };
    }

    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 500));

    const isHealthy = Math.random() > 0.1;
    const health: IntegrationHealth = {
      integrationId: id,
      status: isHealthy ? 'healthy' : 'degraded',
      latency: Math.floor(Math.random() * 200) + 50,
      lastCheck: Date.now(),
      successRate: isHealthy ? 95 + Math.random() * 5 : 70 + Math.random() * 20,
      errorMessage: isHealthy ? undefined : 'Intermittent connectivity issues'
    };

    this.healthChecks.set(id, health);
    this.saveToStorage();

    return health;
  }

  // Get health status for all connected integrations
  async checkAllHealth(): Promise<IntegrationHealth[]> {
    const connected = this.getConnectedIntegrations();
    const results: IntegrationHealth[] = [];

    for (const integration of connected) {
      const health = await this.checkHealth(integration.id);
      results.push(health);
    }

    return results;
  }

  // Get cached health status
  getHealthStatus(id: string): IntegrationHealth | undefined {
    return this.healthChecks.get(id);
  }

  // Webhook management
  createWebhook(integrationId: string, url: string, events: string[]): WebhookConfig {
    const webhook: WebhookConfig = {
      id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      integrationId,
      url,
      events,
      secret: this.generateSecret(),
      enabled: true,
      createdAt: Date.now(),
      failureCount: 0
    };

    this.webhooks.set(webhook.id, webhook);
    this.saveToStorage();
    return webhook;
  }

  getWebhooks(integrationId?: string): WebhookConfig[] {
    const all = Array.from(this.webhooks.values());
    return integrationId ? all.filter(w => w.integrationId === integrationId) : all;
  }

  updateWebhook(id: string, updates: Partial<WebhookConfig>): WebhookConfig | null {
    const webhook = this.webhooks.get(id);
    if (!webhook) return null;

    const updated = { ...webhook, ...updates };
    this.webhooks.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  deleteWebhook(id: string): boolean {
    const deleted = this.webhooks.delete(id);
    if (deleted) this.saveToStorage();
    return deleted;
  }

  // API Key management
  createApiKey(name: string, integrationId?: string, permissions: string[] = []): ApiKey {
    const key = this.generateApiKey();
    const apiKey: ApiKey = {
      id: `apikey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      integrationId,
      key,
      maskedKey: `${key.substring(0, 8)}...${key.substring(key.length - 4)}`,
      permissions,
      createdAt: Date.now(),
      usageCount: 0
    };

    this.apiKeys.set(apiKey.id, apiKey);
    this.saveToStorage();
    return apiKey;
  }

  getApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values());
  }

  revokeApiKey(id: string): boolean {
    const deleted = this.apiKeys.delete(id);
    if (deleted) this.saveToStorage();
    return deleted;
  }

  // Helper methods
  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = 'whsec_';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  private generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'sk_live_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  // Get integration statistics
  getStatistics(): {
    total: number;
    connected: number;
    healthy: number;
    degraded: number;
    byCategory: Record<IntegrationCategory, number>;
  } {
    const all = this.getAllIntegrations();
    const connected = this.getConnectedIntegrations();
    const healthStatuses = Array.from(this.healthChecks.values());

    const byCategory: Record<IntegrationCategory, number> = {
      accounting: 0,
      calendar: 0,
      communication: 0,
      storage: 0,
      payment: 0,
      crm: 0
    };

    connected.forEach(i => {
      byCategory[i.category]++;
    });

    return {
      total: all.length,
      connected: connected.length,
      healthy: healthStatuses.filter(h => h.status === 'healthy').length,
      degraded: healthStatuses.filter(h => h.status === 'degraded' || h.status === 'down').length,
      byCategory
    };
  }
}

export const integrationHubService = new IntegrationHubService();
