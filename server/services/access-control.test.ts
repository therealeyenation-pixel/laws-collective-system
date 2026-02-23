import { describe, it, expect } from 'vitest';
import {
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
  generateTermsOfService,
  AuditLogEntry
} from './access-control';

describe('Access Control Service', () => {
  describe('checkPermission', () => {
    it('should allow owner full access to all resources', () => {
      expect(checkPermission('owner', 'users', 'read')).toBe(true);
      expect(checkPermission('owner', 'users', 'write')).toBe(true);
      expect(checkPermission('owner', 'users', 'delete')).toBe(true);
      expect(checkPermission('owner', 'users', 'admin')).toBe(true);
    });

    it('should allow admin limited access', () => {
      expect(checkPermission('admin', 'users', 'read')).toBe(true);
      expect(checkPermission('admin', 'users', 'write')).toBe(true);
      expect(checkPermission('admin', 'users', 'delete')).toBe(false);
    });

    it('should restrict family to read-only on most resources', () => {
      expect(checkPermission('family', 'documents', 'read')).toBe(true);
      expect(checkPermission('family', 'documents', 'write')).toBe(false);
    });

    it('should restrict public to public_info only', () => {
      expect(checkPermission('public', 'public_info', 'read')).toBe(true);
      expect(checkPermission('public', 'documents', 'read')).toBe(false);
    });
  });

  describe('getPermissionsForRole', () => {
    it('should return permissions for valid role', () => {
      const permissions = getPermissionsForRole('admin');
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions.some(p => p.resource === 'users')).toBe(true);
    });

    it('should return empty array for invalid role', () => {
      const permissions = getPermissionsForRole('invalid' as any);
      expect(permissions).toEqual([]);
    });
  });

  describe('getRoleHierarchy', () => {
    it('should return roles in correct order', () => {
      const hierarchy = getRoleHierarchy();
      expect(hierarchy[0]).toBe('owner');
      expect(hierarchy[hierarchy.length - 1]).toBe('public');
    });
  });

  describe('isRoleAtLeast', () => {
    it('should correctly compare roles', () => {
      expect(isRoleAtLeast('owner', 'admin')).toBe(true);
      expect(isRoleAtLeast('admin', 'owner')).toBe(false);
      expect(isRoleAtLeast('family', 'family')).toBe(true);
      expect(isRoleAtLeast('public', 'member')).toBe(false);
    });
  });

  describe('isSensitiveField', () => {
    it('should identify SSN as sensitive', () => {
      expect(isSensitiveField('ssn')).toBe(true);
      expect(isSensitiveField('social_security_number')).toBe(true);
    });

    it('should identify bank account as sensitive', () => {
      expect(isSensitiveField('bank_account')).toBe(true);
      expect(isSensitiveField('account_number')).toBe(true);
    });

    it('should not flag non-sensitive fields', () => {
      expect(isSensitiveField('name')).toBe(false);
      expect(isSensitiveField('email')).toBe(false);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask SSN showing last 4', () => {
      const masked = maskSensitiveData('123456789', 'ssn');
      expect(masked).toBe('***-**-6789');
    });

    it('should mask account numbers', () => {
      const masked = maskSensitiveData('1234567890', 'account_number');
      expect(masked).toBe('****7890');
    });

    it('should mask credit cards', () => {
      const masked = maskSensitiveData('4111111111111111', 'card_number');
      expect(masked).toBe('****-****-****-1111');
    });
  });

  describe('encryption', () => {
    it('should generate 32-character encryption key', () => {
      const key = generateEncryptionKey();
      expect(key.length).toBe(32);
    });

    it('should encrypt and decrypt field correctly', () => {
      const key = generateEncryptionKey();
      const original = 'sensitive data';
      const encrypted = encryptField(original, key);
      const decrypted = decryptField(encrypted, key);
      expect(decrypted).toBe(original);
    });
  });

  describe('createAuditLogEntry', () => {
    it('should create audit log with all fields', () => {
      const entry = createAuditLogEntry(
        'user123',
        'read',
        'documents',
        'doc456',
        '192.168.1.1',
        'Mozilla/5.0',
        true
      );
      expect(entry.userId).toBe('user123');
      expect(entry.action).toBe('read');
      expect(entry.success).toBe(true);
      expect(entry.id).toContain('audit-');
    });
  });

  describe('detectUnusualAccess', () => {
    it('should detect high volume of requests', () => {
      const logs: AuditLogEntry[] = Array(150).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        action: 'read',
        resource: 'documents',
        resourceId: `doc${i}`,
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        success: true
      }));
      
      const result = detectUnusualAccess(logs);
      expect(result.isUnusual).toBe(true);
      expect(result.reason).toContain('High volume');
    });

    it('should detect multiple failed attempts', () => {
      const logs: AuditLogEntry[] = Array(15).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        action: 'login',
        resource: 'auth',
        resourceId: 'login',
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        success: false
      }));
      
      const result = detectUnusualAccess(logs);
      expect(result.isUnusual).toBe(true);
      expect(result.reason).toContain('failed');
    });

    it('should not flag normal activity', () => {
      const logs: AuditLogEntry[] = Array(5).fill(null).map((_, i) => ({
        id: `audit-${i}`,
        userId: 'user1',
        action: 'read',
        resource: 'documents',
        resourceId: `doc${i}`,
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        success: true
      }));
      
      const result = detectUnusualAccess(logs);
      expect(result.isUnusual).toBe(false);
    });
  });

  describe('getRateLimitConfig', () => {
    it('should return higher limits for owner', () => {
      const ownerConfig = getRateLimitConfig('owner');
      const publicConfig = getRateLimitConfig('public');
      expect(ownerConfig.maxRequests).toBeGreaterThan(publicConfig.maxRequests);
    });
  });

  describe('generateWatermark', () => {
    it('should include document and user IDs', () => {
      const watermark = generateWatermark('doc123', 'user456');
      expect(watermark).toContain('doc123');
      expect(watermark).toContain('user456');
      expect(watermark).toContain('CONFIDENTIAL');
    });
  });

  describe('addCopyrightNotice', () => {
    it('should include current year', () => {
      const notice = addCopyrightNotice();
      const currentYear = new Date().getFullYear().toString();
      expect(notice).toContain(currentYear);
      expect(notice).toContain('LuvOnPurpose');
    });
  });

  describe('generateAntiScrapingHeaders', () => {
    it('should include security headers', () => {
      const headers = generateAntiScrapingHeaders();
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });
  });

  describe('generateTermsOfService', () => {
    it('should include key sections', () => {
      const tos = generateTermsOfService();
      expect(tos).toContain('PROPRIETARY SYSTEM');
      expect(tos).toContain('PROHIBITED ACTIVITIES');
      expect(tos).toContain('INTELLECTUAL PROPERTY');
    });
  });
});
