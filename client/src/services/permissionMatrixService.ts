// Advanced Permission Matrix Service
// Handles granular permissions beyond basic roles

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'admin';
export type PermissionResource = 
  | 'documents' | 'contracts' | 'employees' | 'finances' | 'grants' 
  | 'training' | 'compliance' | 'reports' | 'settings' | 'users'
  | 'houses' | 'entities' | 'tokens' | 'donations' | 'investments';

export interface Permission {
  resource: PermissionResource;
  action: PermissionAction;
  granted: boolean;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  type: 'entity' | 'house' | 'department' | 'owner' | 'time' | 'amount';
  operator: 'equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: string | string[] | number;
}

export interface PermissionSet {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissions {
  userId: string;
  role: string;
  permissionSetIds: string[];
  customPermissions: Permission[];
  entityOverrides: EntityPermissionOverride[];
}

export interface EntityPermissionOverride {
  entityId: string;
  entityType: 'house' | 'entity' | 'department';
  permissions: Permission[];
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
  source: 'role' | 'permission_set' | 'custom' | 'entity_override' | 'denied';
}

class PermissionMatrixService {
  private readonly STORAGE_KEY = 'permission_matrix';
  
  // Default permission sets
  private readonly defaultSets: PermissionSet[] = [
    {
      id: 'admin_full',
      name: 'Full Administrator',
      description: 'Complete access to all system resources',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: this.generateFullPermissions()
    },
    {
      id: 'manager_standard',
      name: 'Standard Manager',
      description: 'Manage team resources and approve workflows',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        { resource: 'documents', action: 'view', granted: true },
        { resource: 'documents', action: 'create', granted: true },
        { resource: 'documents', action: 'edit', granted: true },
        { resource: 'documents', action: 'approve', granted: true },
        { resource: 'employees', action: 'view', granted: true },
        { resource: 'employees', action: 'edit', granted: true },
        { resource: 'finances', action: 'view', granted: true },
        { resource: 'reports', action: 'view', granted: true },
        { resource: 'reports', action: 'export', granted: true },
        { resource: 'training', action: 'view', granted: true },
        { resource: 'training', action: 'approve', granted: true },
      ]
    },
    {
      id: 'staff_basic',
      name: 'Basic Staff',
      description: 'Standard staff access for daily operations',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        { resource: 'documents', action: 'view', granted: true },
        { resource: 'documents', action: 'create', granted: true },
        { resource: 'employees', action: 'view', granted: true },
        { resource: 'training', action: 'view', granted: true },
        { resource: 'reports', action: 'view', granted: true },
      ]
    },
    {
      id: 'finance_specialist',
      name: 'Finance Specialist',
      description: 'Full access to financial resources',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        { resource: 'finances', action: 'view', granted: true },
        { resource: 'finances', action: 'create', granted: true },
        { resource: 'finances', action: 'edit', granted: true },
        { resource: 'finances', action: 'approve', granted: true },
        { resource: 'finances', action: 'export', granted: true },
        { resource: 'reports', action: 'view', granted: true },
        { resource: 'reports', action: 'create', granted: true },
        { resource: 'reports', action: 'export', granted: true },
        { resource: 'investments', action: 'view', granted: true },
        { resource: 'donations', action: 'view', granted: true },
      ]
    },
    {
      id: 'hr_specialist',
      name: 'HR Specialist',
      description: 'Full access to HR and employee resources',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        { resource: 'employees', action: 'view', granted: true },
        { resource: 'employees', action: 'create', granted: true },
        { resource: 'employees', action: 'edit', granted: true },
        { resource: 'employees', action: 'delete', granted: true },
        { resource: 'training', action: 'view', granted: true },
        { resource: 'training', action: 'create', granted: true },
        { resource: 'training', action: 'edit', granted: true },
        { resource: 'documents', action: 'view', granted: true },
        { resource: 'documents', action: 'create', granted: true },
      ]
    },
    {
      id: 'compliance_officer',
      name: 'Compliance Officer',
      description: 'Access to compliance and audit resources',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        { resource: 'compliance', action: 'view', granted: true },
        { resource: 'compliance', action: 'create', granted: true },
        { resource: 'compliance', action: 'edit', granted: true },
        { resource: 'compliance', action: 'approve', granted: true },
        { resource: 'documents', action: 'view', granted: true },
        { resource: 'reports', action: 'view', granted: true },
        { resource: 'reports', action: 'export', granted: true },
      ]
    },
    {
      id: 'read_only',
      name: 'Read Only',
      description: 'View-only access across resources',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [
        { resource: 'documents', action: 'view', granted: true },
        { resource: 'employees', action: 'view', granted: true },
        { resource: 'finances', action: 'view', granted: true },
        { resource: 'reports', action: 'view', granted: true },
        { resource: 'training', action: 'view', granted: true },
      ]
    }
  ];

  private generateFullPermissions(): Permission[] {
    const resources: PermissionResource[] = [
      'documents', 'contracts', 'employees', 'finances', 'grants',
      'training', 'compliance', 'reports', 'settings', 'users',
      'houses', 'entities', 'tokens', 'donations', 'investments'
    ];
    const actions: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'admin'];
    
    const permissions: Permission[] = [];
    for (const resource of resources) {
      for (const action of actions) {
        permissions.push({ resource, action, granted: true });
      }
    }
    return permissions;
  }

  // Get all permission sets
  getPermissionSets(): PermissionSet[] {
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_sets`);
    const customSets = stored ? JSON.parse(stored) : [];
    return [...this.defaultSets, ...customSets];
  }

  // Get permission set by ID
  getPermissionSet(id: string): PermissionSet | null {
    return this.getPermissionSets().find(set => set.id === id) || null;
  }

  // Create custom permission set
  createPermissionSet(set: Omit<PermissionSet, 'id' | 'isSystem' | 'createdAt' | 'updatedAt'>): PermissionSet {
    const newSet: PermissionSet = {
      ...set,
      id: `custom_${Date.now()}`,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_sets`);
    const customSets = stored ? JSON.parse(stored) : [];
    customSets.push(newSet);
    localStorage.setItem(`${this.STORAGE_KEY}_sets`, JSON.stringify(customSets));
    
    return newSet;
  }

  // Update permission set
  updatePermissionSet(id: string, updates: Partial<PermissionSet>): PermissionSet | null {
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_sets`);
    const customSets: PermissionSet[] = stored ? JSON.parse(stored) : [];
    
    const index = customSets.findIndex(set => set.id === id);
    if (index === -1) return null;
    
    customSets[index] = {
      ...customSets[index],
      ...updates,
      updatedAt: new Date()
    };
    
    localStorage.setItem(`${this.STORAGE_KEY}_sets`, JSON.stringify(customSets));
    return customSets[index];
  }

  // Delete permission set
  deletePermissionSet(id: string): boolean {
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_sets`);
    const customSets: PermissionSet[] = stored ? JSON.parse(stored) : [];
    
    const filtered = customSets.filter(set => set.id !== id);
    if (filtered.length === customSets.length) return false;
    
    localStorage.setItem(`${this.STORAGE_KEY}_sets`, JSON.stringify(filtered));
    return true;
  }

  // Get user permissions
  getUserPermissions(userId: string): UserPermissions {
    const stored = localStorage.getItem(`${this.STORAGE_KEY}_user_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default permissions for new users
    return {
      userId,
      role: 'member',
      permissionSetIds: ['read_only'],
      customPermissions: [],
      entityOverrides: []
    };
  }

  // Update user permissions
  updateUserPermissions(userId: string, updates: Partial<UserPermissions>): UserPermissions {
    const current = this.getUserPermissions(userId);
    const updated = { ...current, ...updates };
    localStorage.setItem(`${this.STORAGE_KEY}_user_${userId}`, JSON.stringify(updated));
    return updated;
  }

  // Check if user has permission
  checkPermission(
    userId: string, 
    resource: PermissionResource, 
    action: PermissionAction,
    context?: { entityId?: string; entityType?: 'house' | 'entity' | 'department' }
  ): PermissionCheckResult {
    const userPerms = this.getUserPermissions(userId);
    
    // Check role-based permissions (admin has all)
    if (userPerms.role === 'admin') {
      return { allowed: true, reason: 'Admin role grants full access', source: 'role' };
    }

    // Check entity overrides first (most specific)
    if (context?.entityId) {
      const override = userPerms.entityOverrides.find(
        o => o.entityId === context.entityId && o.entityType === context.entityType
      );
      if (override) {
        const perm = override.permissions.find(
          p => p.resource === resource && p.action === action
        );
        if (perm) {
          return {
            allowed: perm.granted,
            reason: perm.granted 
              ? `Entity override grants ${action} on ${resource}`
              : `Entity override denies ${action} on ${resource}`,
            source: 'entity_override'
          };
        }
      }
    }

    // Check custom permissions
    const customPerm = userPerms.customPermissions.find(
      p => p.resource === resource && p.action === action
    );
    if (customPerm) {
      return {
        allowed: customPerm.granted,
        reason: customPerm.granted
          ? `Custom permission grants ${action} on ${resource}`
          : `Custom permission denies ${action} on ${resource}`,
        source: 'custom'
      };
    }

    // Check permission sets
    for (const setId of userPerms.permissionSetIds) {
      const set = this.getPermissionSet(setId);
      if (set) {
        const perm = set.permissions.find(
          p => p.resource === resource && p.action === action
        );
        if (perm?.granted) {
          return {
            allowed: true,
            reason: `Permission set "${set.name}" grants ${action} on ${resource}`,
            source: 'permission_set'
          };
        }
      }
    }

    // Default deny
    return {
      allowed: false,
      reason: `No permission found for ${action} on ${resource}`,
      source: 'denied'
    };
  }

  // Get all permissions for a user (flattened)
  getAllUserPermissions(userId: string): Permission[] {
    const userPerms = this.getUserPermissions(userId);
    const allPermissions: Map<string, Permission> = new Map();

    // Add permissions from permission sets
    for (const setId of userPerms.permissionSetIds) {
      const set = this.getPermissionSet(setId);
      if (set) {
        for (const perm of set.permissions) {
          const key = `${perm.resource}_${perm.action}`;
          if (!allPermissions.has(key) || perm.granted) {
            allPermissions.set(key, perm);
          }
        }
      }
    }

    // Override with custom permissions
    for (const perm of userPerms.customPermissions) {
      const key = `${perm.resource}_${perm.action}`;
      allPermissions.set(key, perm);
    }

    return Array.from(allPermissions.values());
  }

  // Get available resources
  getResources(): PermissionResource[] {
    return [
      'documents', 'contracts', 'employees', 'finances', 'grants',
      'training', 'compliance', 'reports', 'settings', 'users',
      'houses', 'entities', 'tokens', 'donations', 'investments'
    ];
  }

  // Get available actions
  getActions(): PermissionAction[] {
    return ['view', 'create', 'edit', 'delete', 'approve', 'export', 'admin'];
  }

  // Get permission matrix for display
  getPermissionMatrix(userId: string): { resource: PermissionResource; permissions: Record<PermissionAction, boolean> }[] {
    const allPerms = this.getAllUserPermissions(userId);
    const resources = this.getResources();
    const actions = this.getActions();

    return resources.map(resource => {
      const permissions: Record<PermissionAction, boolean> = {} as Record<PermissionAction, boolean>;
      for (const action of actions) {
        const perm = allPerms.find(p => p.resource === resource && p.action === action);
        permissions[action] = perm?.granted || false;
      }
      return { resource, permissions };
    });
  }
}

export const permissionMatrixService = new PermissionMatrixService();
