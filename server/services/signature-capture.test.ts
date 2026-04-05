import { describe, it, expect } from 'vitest';
import {
  generateSignatureHash,
  createSignature,
  verifySignature,
  createSignatureRequest,
  updateSignatureRequestStatus,
  recordSignerSignature,
  createHouseActivationGate,
  recordGateSignature,
  checkGateStatus,
  validateSignatureData,
  generateSignatureCertificate
} from './signature-capture';

describe('Signature Capture Service', () => {
  describe('generateSignatureHash', () => {
    it('should generate consistent hash for same inputs', () => {
      const timestamp = new Date('2024-01-01T12:00:00Z');
      const hash1 = generateSignatureHash('data', 'signer1', 'doc1', timestamp);
      const hash2 = generateSignatureHash('data', 'signer1', 'doc1', timestamp);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different inputs', () => {
      const timestamp = new Date('2024-01-01T12:00:00Z');
      const hash1 = generateSignatureHash('data1', 'signer1', 'doc1', timestamp);
      const hash2 = generateSignatureHash('data2', 'signer1', 'doc1', timestamp);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createSignature', () => {
    it('should create typed signature', () => {
      const sig = createSignature(
        'typed',
        'John Freeman',
        'user-001',
        'John Freeman',
        'john@example.com',
        'doc-001',
        'Trust Agreement',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(sig.signatureId).toContain('sig-');
      expect(sig.type).toBe('typed');
      expect(sig.data).toBe('John Freeman');
      expect(sig.verified).toBe(true);
      expect(sig.hash).toBeDefined();
    });

    it('should create drawn signature', () => {
      const base64Data = Buffer.from('x'.repeat(100)).toString('base64');
      const sig = createSignature(
        'drawn',
        base64Data,
        'user-001',
        'John Freeman',
        'john@example.com',
        'doc-001',
        'Trust Agreement',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(sig.type).toBe('drawn');
      expect(sig.data).toBe(base64Data);
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const sig = createSignature(
        'typed',
        'John Freeman',
        'user-001',
        'John Freeman',
        'john@example.com',
        'doc-001',
        'Trust Agreement',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(verifySignature(sig)).toBe(true);
    });

    it('should reject tampered signature', () => {
      const sig = createSignature(
        'typed',
        'John Freeman',
        'user-001',
        'John Freeman',
        'john@example.com',
        'doc-001',
        'Trust Agreement',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      sig.data = 'Tampered Data';
      expect(verifySignature(sig)).toBe(false);
    });
  });

  describe('createSignatureRequest', () => {
    it('should create request with multiple signers', () => {
      const request = createSignatureRequest(
        'doc-001',
        'Trust Agreement',
        'requester-001',
        'Admin User',
        [
          { id: 'signer-001', name: 'John', email: 'john@example.com' },
          { id: 'signer-002', name: 'Jane', email: 'jane@example.com' }
        ]
      );

      expect(request.requestId).toContain('req-');
      expect(request.signers).toHaveLength(2);
      expect(request.status).toBe('pending');
      expect(request.signers[0].order).toBe(1);
      expect(request.signers[1].order).toBe(2);
    });

    it('should set expiration date', () => {
      const request = createSignatureRequest(
        'doc-001',
        'Trust Agreement',
        'requester-001',
        'Admin User',
        [{ id: 'signer-001', name: 'John', email: 'john@example.com' }],
        7
      );

      const expectedExpiry = new Date(request.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      expect(request.expiresAt.getTime()).toBeCloseTo(expectedExpiry.getTime(), -3);
    });
  });

  describe('recordSignerSignature', () => {
    it('should update signer status to signed', () => {
      const request = createSignatureRequest(
        'doc-001',
        'Trust Agreement',
        'requester-001',
        'Admin User',
        [
          { id: 'signer-001', name: 'John', email: 'john@example.com' },
          { id: 'signer-002', name: 'Jane', email: 'jane@example.com' }
        ]
      );

      const updated = recordSignerSignature(request, 'signer-001', 'sig-001');
      expect(updated.signers[0].status).toBe('signed');
      expect(updated.signers[0].signatureId).toBe('sig-001');
      expect(updated.status).toBe('partial');
    });

    it('should mark request complete when all signed', () => {
      let request = createSignatureRequest(
        'doc-001',
        'Trust Agreement',
        'requester-001',
        'Admin User',
        [{ id: 'signer-001', name: 'John', email: 'john@example.com' }]
      );

      request = recordSignerSignature(request, 'signer-001', 'sig-001');
      expect(request.status).toBe('completed');
      expect(request.completedAt).toBeDefined();
    });
  });

  describe('House Activation Gates', () => {
    it('should create activation gate', () => {
      const gate = createHouseActivationGate('House Freeman', ['doc-001', 'doc-002', 'doc-003']);
      expect(gate.gateId).toContain('gate-');
      expect(gate.houseName).toBe('House Freeman');
      expect(gate.requiredSignatures).toHaveLength(3);
      expect(gate.status).toBe('pending');
    });

    it('should track gate progress', () => {
      let gate = createHouseActivationGate('House Freeman', ['doc-001', 'doc-002']);
      gate = recordGateSignature(gate, 'doc-001', 'sig-001');
      
      const status = checkGateStatus(gate);
      expect(status.progress).toBe(50);
      expect(status.isActivated).toBe(false);
    });

    it('should activate gate when all signatures collected', () => {
      let gate = createHouseActivationGate('House Freeman', ['doc-001', 'doc-002']);
      gate = recordGateSignature(gate, 'doc-001', 'sig-001');
      gate = recordGateSignature(gate, 'doc-002', 'sig-002');
      
      expect(gate.status).toBe('activated');
      expect(gate.activatedAt).toBeDefined();
    });
  });

  describe('validateSignatureData', () => {
    it('should validate typed signature', () => {
      expect(validateSignatureData('typed', 'John Freeman').valid).toBe(true);
    });

    it('should reject short typed signature', () => {
      const result = validateSignatureData('typed', 'J');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 2 characters');
    });

    it('should validate drawn signature with valid base64', () => {
      const base64Data = Buffer.from('x'.repeat(100)).toString('base64');
      expect(validateSignatureData('drawn', base64Data).valid).toBe(true);
    });

    it('should reject empty signature', () => {
      const result = validateSignatureData('typed', '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });
  });

  describe('generateSignatureCertificate', () => {
    it('should generate certificate with all details', () => {
      const sig = createSignature(
        'typed',
        'John Freeman',
        'user-001',
        'John Freeman',
        'john@example.com',
        'doc-001',
        'Trust Agreement',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      const cert = generateSignatureCertificate(sig);
      expect(cert).toContain('ELECTRONIC SIGNATURE CERTIFICATE');
      expect(cert).toContain('John Freeman');
      expect(cert).toContain('Trust Agreement');
      expect(cert).toContain(sig.hash);
      expect(cert).toContain('E-SIGN Act');
    });
  });
});
