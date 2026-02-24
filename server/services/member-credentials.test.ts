import { describe, it, expect } from 'vitest';
import {
  generateMemberId,
  generateBarcode,
  issueMemberCredential,
  addAchievement,
  upgradeAccessTier,
  verifyCredential,
  getPermissions,
  hasPermission,
  generateCredentialCard
} from './member-credentials';

describe('Member Credential System', () => {
  describe('generateMemberId', () => {
    it('should generate unique member IDs with LAWS prefix', () => {
      const id1 = generateMemberId();
      const id2 = generateMemberId();
      
      expect(id1).toMatch(/^LAWS-[A-Z0-9]+-[A-Z0-9]+-\d{2}$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateBarcode', () => {
    it('should generate numeric barcode with check digit', () => {
      const barcode = generateBarcode('LAWS-ABC123-XYZ-99');
      expect(barcode).toMatch(/^\d+$/);
    });
  });

  describe('issueMemberCredential', () => {
    it('should issue credential with all required fields', () => {
      const credential = issueMemberCredential(
        'user-001',
        'John Doe',
        'direct',
        'member',
        'house-001',
        'House of Doe'
      );
      
      expect(credential.credentialId).toContain('cred-');
      expect(credential.memberId).toContain('LAWS-');
      expect(credential.displayName).toBe('John Doe');
      expect(credential.entryPath).toBe('direct');
      expect(credential.accessTier).toBe('member');
      expect(credential.houseName).toBe('House of Doe');
      expect(credential.qrCode).toContain('LAWS-QR:');
      expect(credential.barcode).toBeTruthy();
      expect(credential.verificationHash).toBeTruthy();
    });
  });

  describe('addAchievement', () => {
    it('should add achievement to credential', () => {
      let credential = issueMemberCredential('user-001', 'Jane Doe', 'game', 'member');
      
      credential = addAchievement(
        credential,
        'Quest Master',
        'game',
        'Completed all L.A.W.S. Quest realms'
      );
      
      expect(credential.achievements).toHaveLength(1);
      expect(credential.achievements[0].name).toBe('Quest Master');
      expect(credential.achievements[0].category).toBe('game');
    });
  });

  describe('upgradeAccessTier', () => {
    it('should upgrade tier and regenerate verification', () => {
      let credential = issueMemberCredential('user-001', 'Jane Doe', 'direct', 'member');
      const originalHash = credential.verificationHash;
      
      credential = upgradeAccessTier(credential, 'house_owner');
      
      expect(credential.accessTier).toBe('house_owner');
      expect(credential.verificationHash).not.toBe(originalHash);
    });

    it('should not downgrade tier', () => {
      let credential = issueMemberCredential('user-001', 'Jane Doe', 'direct', 'house_owner');
      
      credential = upgradeAccessTier(credential, 'member');
      
      expect(credential.accessTier).toBe('house_owner');
    });
  });

  describe('verifyCredential', () => {
    it('should verify valid QR code', () => {
      const credential = issueMemberCredential('user-001', 'Jane Doe', 'direct', 'member');
      
      const result = verifyCredential(credential.qrCode, [credential]);
      
      expect(result.isValid).toBe(true);
      expect(result.verificationMethod).toBe('qr');
      expect(result.credential?.memberId).toBe(credential.memberId);
    });

    it('should verify valid barcode', () => {
      const credential = issueMemberCredential('user-001', 'Jane Doe', 'direct', 'member');
      
      const result = verifyCredential(credential.barcode, [credential]);
      
      expect(result.isValid).toBe(true);
      expect(result.verificationMethod).toBe('barcode');
    });

    it('should reject invalid credential', () => {
      const result = verifyCredential('invalid-code', []);
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('getPermissions', () => {
    it('should return correct permissions for each tier', () => {
      expect(getPermissions('guest')).toContain('view_public_content');
      expect(getPermissions('member')).toContain('access_academy');
      expect(getPermissions('house_owner')).toContain('manage_house');
      expect(getPermissions('founder')).toContain('all_permissions');
    });
  });

  describe('hasPermission', () => {
    it('should check permission correctly', () => {
      const memberCred = issueMemberCredential('user-001', 'Jane', 'direct', 'member');
      const ownerCred = issueMemberCredential('user-002', 'John', 'direct', 'house_owner');
      
      expect(hasPermission(memberCred, 'access_academy')).toBe(true);
      expect(hasPermission(memberCred, 'manage_house')).toBe(false);
      expect(hasPermission(ownerCred, 'manage_house')).toBe(true);
    });
  });

  describe('generateCredentialCard', () => {
    it('should generate formatted credential card', () => {
      const credential = issueMemberCredential(
        'user-001',
        'John Doe',
        'direct',
        'house_owner',
        'house-001',
        'House of Doe'
      );
      
      const card = generateCredentialCard(credential);
      
      expect(card).toContain('L.A.W.S. COLLECTIVE');
      expect(card).toContain('John Doe');
      expect(card).toContain('HOUSE_OWNER');
      expect(card).toContain('Gold');
      expect(card).toContain('House of Doe');
    });
  });
});
