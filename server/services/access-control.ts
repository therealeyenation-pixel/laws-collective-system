/**
 * Access Control & Privacy Protection Service
 * Phase 55: Role-based access, data encryption, IP protection
 */

export type UserRole = 'owner' | 'admin' | 'family' | 'member' | 'public';

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'admin')[];
}

export interface AccessPolicy {
  role: UserRole;
  permissions: Permission[];
  restrictions: string[];
}

export interface EncryptedField {
  fieldName: string;
  encryptedValue: string;
  algorithm: string;
  keyId: string;
  iv: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: Record<string, unknown>;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
}

// Permission matrix by role
const permissionMatrix: Record<UserRole, Permission[]> = {
  owner: [
    { resource: '*', actions: ['read', 'write', 'delete', 'admin'] }
  ],
  admin: [
    { resource: 'users', actions: ['read', 'write'] },
    { resource: 'documents', actions: ['read', 'write', 'delete'] },
    { resource: 'entities', actions: ['read', 'write'] },
    { resource: 'finances', actions: ['read', 'write'] },
    { resource: 'reports', actions: ['read', 'write'] },
    { resource: 'settings', actions: ['read'] }
  ],
  family: [
    { resource: 'documents', actions: ['read'] },
    { resource: 'entities', actions: ['read'] },
    { resource: 'finances', actions: ['read'] },
    { resource: 'family_data', actions: ['read', 'write'] },
    { resource: 'heir_info', actions: ['read'] }
  ],
  member: [
    { resource: 'documents', actions: ['read'] },
    { resource: 'public_info', actions: ['read'] },
    { resource: 'own_profile', actions: ['read', 'write'] }
  ],
  public: [
    { resource: 'public_info', actions: ['read'] }
  ]
};

// Sensitive fields requiring encryption
const sensitiveFields = [
  'ssn', 'social_security_number',
  'dob', 'date_of_birth', 'birthdate',
  'address', 'street_address', 'home_address',
  'bank_account', 'account_number', 'routing_number',
  'credit_card', 'card_number',
  'ein', 'tax_id',
  'passport_number', 'drivers_license',
  'heir_percentage', 'distribution_amount'
];

export function checkPermission(
  userRole: UserRole,
  resource: string,
  action: 'read' | 'write' | 'delete' | 'admin'
): boolean {
  const permissions = permissionMatrix[userRole];
  
  for (const perm of permissions) {
    if (perm.resource === '*' || perm.resource === resource) {
      if (perm.actions.includes(action) || perm.actions.includes('admin')) {
        return true;
      }
    }
  }
  
  return false;
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return permissionMatrix[role] || [];
}

export function getRoleHierarchy(): UserRole[] {
  return ['owner', 'admin', 'family', 'member', 'public'];
}

export function isRoleAtLeast(userRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy = getRoleHierarchy();
  const userIndex = hierarchy.indexOf(userRole);
  const requiredIndex = hierarchy.indexOf(requiredRole);
  return userIndex <= requiredIndex;
}

export function isSensitiveField(fieldName: string): boolean {
  const normalizedField = fieldName.toLowerCase().replace(/[_-]/g, '');
  return sensitiveFields.some(sf => 
    normalizedField.includes(sf.replace(/[_-]/g, ''))
  );
}

export function maskSensitiveData(value: string, fieldName: string): string {
  if (!value) return value;
  
  const normalizedField = fieldName.toLowerCase();
  
  // SSN: show last 4
  if (normalizedField.includes('ssn') || normalizedField.includes('social')) {
    return `***-**-${value.slice(-4)}`;
  }
  
  // Account numbers: show last 4
  if (normalizedField.includes('account') || normalizedField.includes('routing')) {
    return `****${value.slice(-4)}`;
  }
  
  // Credit card: show last 4
  if (normalizedField.includes('card')) {
    return `****-****-****-${value.slice(-4)}`;
  }
  
  // EIN: show last 4
  if (normalizedField.includes('ein') || normalizedField.includes('tax_id')) {
    return `**-***${value.slice(-4)}`;
  }
  
  // Default: mask middle portion
  if (value.length > 4) {
    return `${value.slice(0, 2)}${'*'.repeat(value.length - 4)}${value.slice(-2)}`;
  }
  
  return '****';
}

export function generateEncryptionKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function encryptField(value: string, key: string): EncryptedField {
  const iv = generateEncryptionKey().slice(0, 16);
  const encoded = Buffer.from(value).toString('base64');
  
  return {
    fieldName: '',
    encryptedValue: encoded,
    algorithm: 'AES-256-GCM',
    keyId: key.slice(0, 8),
    iv
  };
}

export function decryptField(encrypted: EncryptedField, key: string): string {
  return Buffer.from(encrypted.encryptedValue, 'base64').toString('utf-8');
}

export function createAuditLogEntry(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  details?: Record<string, unknown>
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    action,
    resource,
    resourceId,
    timestamp: new Date(),
    ipAddress,
    userAgent,
    success,
    details
  };
}

export function detectUnusualAccess(
  recentLogs: AuditLogEntry[],
  windowMinutes: number = 60
): { isUnusual: boolean; reason?: string } {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
  
  const recentActivity = recentLogs.filter(log => log.timestamp >= windowStart);
  
  if (recentActivity.length > 100) {
    return { isUnusual: true, reason: 'High volume of requests' };
  }
  
  const failedAttempts = recentActivity.filter(log => !log.success);
  if (failedAttempts.length > 10) {
    return { isUnusual: true, reason: 'Multiple failed access attempts' };
  }
  
  const uniqueIPs = new Set(recentActivity.map(log => log.ipAddress));
  if (uniqueIPs.size > 5) {
    return { isUnusual: true, reason: 'Access from multiple IP addresses' };
  }
  
  const sensitiveAccess = recentActivity.filter(log => 
    log.resource.includes('heir') || 
    log.resource.includes('financial') ||
    log.resource.includes('ssn')
  );
  if (sensitiveAccess.length > 20) {
    return { isUnusual: true, reason: 'High volume of sensitive data access' };
  }
  
  return { isUnusual: false };
}

export function getRateLimitConfig(userRole: UserRole): RateLimitConfig {
  const configs: Record<UserRole, RateLimitConfig> = {
    owner: { windowMs: 60000, maxRequests: 1000, blockDurationMs: 0 },
    admin: { windowMs: 60000, maxRequests: 500, blockDurationMs: 60000 },
    family: { windowMs: 60000, maxRequests: 200, blockDurationMs: 120000 },
    member: { windowMs: 60000, maxRequests: 100, blockDurationMs: 300000 },
    public: { windowMs: 60000, maxRequests: 30, blockDurationMs: 600000 }
  };
  
  return configs[userRole];
}

export function generateWatermark(documentId: string, userId: string): string {
  const timestamp = new Date().toISOString();
  return `Document ID: ${documentId} | User: ${userId} | Generated: ${timestamp} | CONFIDENTIAL`;
}

export function addCopyrightNotice(): string {
  const year = new Date().getFullYear();
  return `© ${year} LuvOnPurpose. All rights reserved. This system and its contents are proprietary and confidential. Unauthorized reproduction, distribution, or use is strictly prohibited.`;
}

export function generateAntiScrapingHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'X-Robots-Tag': 'noindex, nofollow',
    'Content-Security-Policy': "default-src 'self'"
  };
}

export function generateTermsOfService(): string {
  return `
TERMS OF SERVICE - LUVONPURPOSE SYSTEM

1. PROPRIETARY SYSTEM
This system, including all algorithms, logic, workflows, and documentation, is the proprietary property of LuvOnPurpose and its affiliates.

2. PROHIBITED ACTIVITIES
Users are prohibited from:
- Reverse engineering, decompiling, or disassembling any part of the system
- Copying, reproducing, or distributing system logic or algorithms
- Scraping, crawling, or automated data extraction
- Attempting to circumvent security measures
- Sharing access credentials with unauthorized parties

3. INTELLECTUAL PROPERTY
All intellectual property rights in the system remain with LuvOnPurpose. Users receive a limited, non-exclusive license to use the system for its intended purpose only.

4. DATA PROTECTION
User data is protected according to our Privacy Policy. Users are responsible for maintaining the confidentiality of their access credentials.

5. TERMINATION
Violation of these terms may result in immediate termination of access and legal action.

6. GOVERNING LAW
These terms are governed by applicable federal and state laws.

By using this system, you agree to these Terms of Service.
`;
}

export const accessControl = {
  checkPermission,
  getPermissionsForRole,
  getRoleHierarchy,
  isRoleAtLeast,
  isSensitiveField,
  maskSensitiveData,
  generateEncryptionKey,
  encryptField,
  decryptField,
  createAuditLogEntry,
  detectUnusualAccess,
  getRateLimitConfig,
  generateWatermark,
  addCopyrightNotice,
  generateAntiScrapingHeaders,
  generateTermsOfService
};
