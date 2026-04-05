// Multi-Tenant / Franchise Support Service
// Allows organizations to use the system under their own branding with isolated data

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  branding: TenantBranding;
  settings: TenantSettings;
  subscription: TenantSubscription;
  status: 'active' | 'trial' | 'suspended' | 'canceled';
  createdAt: Date;
  ownerUserId: string;
  memberCount: number;
  storageUsed: number; // in bytes
}

export interface TenantBranding {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  tagline?: string;
  supportEmail?: string;
  customCss?: string;
}

export interface TenantSettings {
  features: {
    documentVault: boolean;
    grantManagement: boolean;
    hrManagement: boolean;
    financialAutomation: boolean;
    academy: boolean;
    workflowBuilder: boolean;
    boardGovernance: boolean;
    internationalOps: boolean;
  };
  limits: {
    maxUsers: number;
    maxStorage: number; // in GB
    maxDocuments: number;
    maxWorkflows: number;
  };
  modules: string[];
  timezone: string;
  dateFormat: string;
  currency: string;
}

export interface TenantSubscription {
  plan: 'starter' | 'professional' | 'enterprise' | 'custom';
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  startDate: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
}

export interface TenantInvite {
  id: string;
  tenantId: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface TenantUsageStats {
  tenantId: string;
  period: 'day' | 'week' | 'month';
  activeUsers: number;
  documentsCreated: number;
  workflowsRun: number;
  storageUsed: number;
  apiCalls: number;
}

class MultiTenantService {
  private readonly TENANTS_KEY = 'tenants';
  private readonly INVITES_KEY = 'tenant_invites';
  private currentTenantId: string | null = null;

  // Get all tenants (admin view)
  getTenants(): Tenant[] {
    const stored = localStorage.getItem(this.TENANTS_KEY);
    if (!stored) return this.getDefaultTenants();
    return JSON.parse(stored).map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      subscription: {
        ...t.subscription,
        startDate: new Date(t.subscription.startDate),
        currentPeriodEnd: new Date(t.subscription.currentPeriodEnd),
      },
    }));
  }

  // Get default tenants for demo
  private getDefaultTenants(): Tenant[] {
    return [
      {
        id: 'tenant-main',
        name: 'The L.A.W.S. Collective',
        slug: 'laws-collective',
        branding: {
          primaryColor: '#4F46E5',
          secondaryColor: '#10B981',
          companyName: 'The L.A.W.S. Collective',
          tagline: 'Building Multi-Generational Wealth',
        },
        settings: {
          features: {
            documentVault: true,
            grantManagement: true,
            hrManagement: true,
            financialAutomation: true,
            academy: true,
            workflowBuilder: true,
            boardGovernance: true,
            internationalOps: true,
          },
          limits: {
            maxUsers: -1, // unlimited
            maxStorage: -1,
            maxDocuments: -1,
            maxWorkflows: -1,
          },
          modules: ['all'],
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
        },
        subscription: {
          plan: 'enterprise',
          billingCycle: 'annual',
          amount: 0,
          currency: 'USD',
          startDate: new Date('2023-01-01'),
          currentPeriodEnd: new Date('2025-01-01'),
          cancelAtPeriodEnd: false,
        },
        status: 'active',
        createdAt: new Date('2023-01-01'),
        ownerUserId: 'owner-001',
        memberCount: 156,
        storageUsed: 25 * 1024 * 1024 * 1024, // 25 GB
      },
      {
        id: 'tenant-atlanta',
        name: 'Atlanta Community Foundation',
        slug: 'atlanta-cf',
        domain: 'atlanta-cf.laws.space',
        branding: {
          primaryColor: '#DC2626',
          secondaryColor: '#F59E0B',
          companyName: 'Atlanta Community Foundation',
          tagline: 'Empowering Atlanta Communities',
        },
        settings: {
          features: {
            documentVault: true,
            grantManagement: true,
            hrManagement: true,
            financialAutomation: true,
            academy: true,
            workflowBuilder: true,
            boardGovernance: true,
            internationalOps: false,
          },
          limits: {
            maxUsers: 50,
            maxStorage: 100,
            maxDocuments: 5000,
            maxWorkflows: 50,
          },
          modules: ['grants', 'documents', 'hr', 'academy'],
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
        },
        subscription: {
          plan: 'professional',
          billingCycle: 'monthly',
          amount: 499,
          currency: 'USD',
          startDate: new Date('2023-06-01'),
          currentPeriodEnd: new Date('2024-02-01'),
          cancelAtPeriodEnd: false,
        },
        status: 'active',
        createdAt: new Date('2023-06-01'),
        ownerUserId: 'owner-002',
        memberCount: 34,
        storageUsed: 8 * 1024 * 1024 * 1024, // 8 GB
      },
    ];
  }

  // Save tenants
  saveTenants(tenants: Tenant[]): void {
    localStorage.setItem(this.TENANTS_KEY, JSON.stringify(tenants));
  }

  // Get current tenant
  getCurrentTenant(): Tenant | null {
    if (!this.currentTenantId) return null;
    return this.getTenants().find(t => t.id === this.currentTenantId) || null;
  }

  // Set current tenant
  setCurrentTenant(tenantId: string): void {
    this.currentTenantId = tenantId;
    localStorage.setItem('current_tenant_id', tenantId);
  }

  // Create new tenant
  createTenant(data: {
    name: string;
    slug: string;
    ownerUserId: string;
    plan: TenantSubscription['plan'];
    branding?: Partial<TenantBranding>;
  }): Tenant {
    const planLimits: Record<string, TenantSettings['limits']> = {
      starter: { maxUsers: 10, maxStorage: 10, maxDocuments: 500, maxWorkflows: 10 },
      professional: { maxUsers: 50, maxStorage: 100, maxDocuments: 5000, maxWorkflows: 50 },
      enterprise: { maxUsers: -1, maxStorage: -1, maxDocuments: -1, maxWorkflows: -1 },
      custom: { maxUsers: -1, maxStorage: -1, maxDocuments: -1, maxWorkflows: -1 },
    };

    const planFeatures: Record<string, TenantSettings['features']> = {
      starter: {
        documentVault: true,
        grantManagement: true,
        hrManagement: false,
        financialAutomation: false,
        academy: true,
        workflowBuilder: false,
        boardGovernance: false,
        internationalOps: false,
      },
      professional: {
        documentVault: true,
        grantManagement: true,
        hrManagement: true,
        financialAutomation: true,
        academy: true,
        workflowBuilder: true,
        boardGovernance: true,
        internationalOps: false,
      },
      enterprise: {
        documentVault: true,
        grantManagement: true,
        hrManagement: true,
        financialAutomation: true,
        academy: true,
        workflowBuilder: true,
        boardGovernance: true,
        internationalOps: true,
      },
      custom: {
        documentVault: true,
        grantManagement: true,
        hrManagement: true,
        financialAutomation: true,
        academy: true,
        workflowBuilder: true,
        boardGovernance: true,
        internationalOps: true,
      },
    };

    const planPricing: Record<string, number> = {
      starter: 99,
      professional: 499,
      enterprise: 1999,
      custom: 0,
    };

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: data.name,
      slug: data.slug,
      branding: {
        primaryColor: data.branding?.primaryColor || '#4F46E5',
        secondaryColor: data.branding?.secondaryColor || '#10B981',
        companyName: data.name,
        ...data.branding,
      },
      settings: {
        features: planFeatures[data.plan],
        limits: planLimits[data.plan],
        modules: [],
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
      },
      subscription: {
        plan: data.plan,
        billingCycle: 'monthly',
        amount: planPricing[data.plan],
        currency: 'USD',
        startDate: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      },
      status: 'trial',
      createdAt: new Date(),
      ownerUserId: data.ownerUserId,
      memberCount: 1,
      storageUsed: 0,
    };

    const tenants = this.getTenants();
    tenants.push(newTenant);
    this.saveTenants(tenants);

    return newTenant;
  }

  // Update tenant
  updateTenant(tenantId: string, updates: Partial<Tenant>): void {
    const tenants = this.getTenants();
    const index = tenants.findIndex(t => t.id === tenantId);
    if (index >= 0) {
      tenants[index] = { ...tenants[index], ...updates };
      this.saveTenants(tenants);
    }
  }

  // Get tenant usage stats
  getUsageStats(tenantId: string): TenantUsageStats {
    return {
      tenantId,
      period: 'month',
      activeUsers: Math.floor(Math.random() * 50) + 10,
      documentsCreated: Math.floor(Math.random() * 200) + 50,
      workflowsRun: Math.floor(Math.random() * 100) + 20,
      storageUsed: Math.floor(Math.random() * 10) * 1024 * 1024 * 1024,
      apiCalls: Math.floor(Math.random() * 10000) + 1000,
    };
  }

  // Create invite
  createInvite(tenantId: string, email: string, role: TenantInvite['role'], invitedBy: string): TenantInvite {
    const invite: TenantInvite = {
      id: `invite-${Date.now()}`,
      tenantId,
      email,
      role,
      status: 'pending',
      invitedBy,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    const invites = this.getInvites();
    invites.push(invite);
    localStorage.setItem(this.INVITES_KEY, JSON.stringify(invites));

    return invite;
  }

  // Get invites
  getInvites(tenantId?: string): TenantInvite[] {
    const stored = localStorage.getItem(this.INVITES_KEY);
    if (!stored) return [];
    const invites = JSON.parse(stored).map((i: any) => ({
      ...i,
      createdAt: new Date(i.createdAt),
      expiresAt: new Date(i.expiresAt),
    }));
    if (tenantId) {
      return invites.filter((i: TenantInvite) => i.tenantId === tenantId);
    }
    return invites;
  }

  // Check feature access
  hasFeature(feature: keyof TenantSettings['features']): boolean {
    const tenant = this.getCurrentTenant();
    if (!tenant) return false;
    return tenant.settings.features[feature];
  }

  // Check limit
  isWithinLimit(limit: keyof TenantSettings['limits'], currentValue: number): boolean {
    const tenant = this.getCurrentTenant();
    if (!tenant) return false;
    const maxValue = tenant.settings.limits[limit];
    if (maxValue === -1) return true; // unlimited
    return currentValue < maxValue;
  }
}

export const multiTenantService = new MultiTenantService();
export default multiTenantService;
