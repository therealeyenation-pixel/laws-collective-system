import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTypedSignature,
  generateSignatureMetadata,
  createSignatureBlock,
  saveSignatureLocally,
  getSavedSignatures,
  clearSavedSignatures,
} from './signatureOverlay';

describe('Signature Overlay Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('createTypedSignature', () => {
    it('should create SVG signature for typed name', () => {
      const signature = createTypedSignature('John Doe');
      expect(signature).toContain('data:image/svg+xml;base64,');
      expect(signature).toContain('John Doe');
    });

    it('should handle special characters in name', () => {
      const signature = createTypedSignature("O'Brien & Associates");
      expect(signature).toContain('data:image/svg+xml;base64,');
    });
  });

  describe('generateSignatureMetadata', () => {
    it('should generate metadata with required fields', () => {
      const metadata = generateSignatureMetadata('Jane Smith', 'CEO');
      expect(metadata.signerName).toBe('Jane Smith');
      expect(metadata.signerTitle).toBe('CEO');
      expect(metadata.signedAt).toBeDefined();
      expect(metadata.userAgent).toBeDefined();
    });

    it('should handle missing title', () => {
      const metadata = generateSignatureMetadata('Jane Smith');
      expect(metadata.signerTitle).toBe('N/A');
    });

    it('should include current timestamp', () => {
      const before = new Date();
      const metadata = generateSignatureMetadata('Jane Smith');
      const after = new Date();
      const signedAt = new Date(metadata.signedAt);
      expect(signedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(signedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('createSignatureBlock', () => {
    it('should create signature block with name and title', () => {
      const block = createSignatureBlock('John Doe', 'President');
      expect(block).toContain('John Doe');
      expect(block).toContain('President');
      expect(block).toContain('Date:');
    });

    it('should create signature block without title', () => {
      const block = createSignatureBlock('John Doe');
      expect(block).toContain('John Doe');
      expect(block).toContain('Date:');
    });

    it('should use provided date', () => {
      const testDate = new Date('2024-01-15');
      const block = createSignatureBlock('John Doe', 'CEO', testDate);
      expect(block).toContain('1/15/2024');
    });
  });

  describe('Local Storage Operations', () => {
    it('should save signature locally', () => {
      const signature = {
        type: 'typed' as const,
        data: 'test-data',
        timestamp: new Date(),
        signerName: 'John Doe',
      };
      saveSignatureLocally(signature);
      const stored = localStorage.getItem('user_signatures');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].signerName).toBe('John Doe');
    });

    it('should retrieve saved signatures', () => {
      const sig1 = {
        type: 'typed' as const,
        data: 'test-data-1',
        timestamp: new Date(),
        signerName: 'John Doe',
      };
      const sig2 = {
        type: 'drawn' as const,
        data: 'test-data-2',
        timestamp: new Date(),
        signerName: 'Jane Smith',
      };
      saveSignatureLocally(sig1);
      saveSignatureLocally(sig2);
      const retrieved = getSavedSignatures();
      expect(retrieved).toHaveLength(2);
      expect(retrieved[0].signerName).toBe('John Doe');
      expect(retrieved[1].signerName).toBe('Jane Smith');
    });

    it('should return empty array when no signatures saved', () => {
      const retrieved = getSavedSignatures();
      expect(retrieved).toEqual([]);
    });

    it('should clear all saved signatures', () => {
      const signature = {
        type: 'typed' as const,
        data: 'test-data',
        timestamp: new Date(),
        signerName: 'John Doe',
      };
      saveSignatureLocally(signature);
      expect(getSavedSignatures()).toHaveLength(1);
      clearSavedSignatures();
      expect(getSavedSignatures()).toHaveLength(0);
    });
  });
});
