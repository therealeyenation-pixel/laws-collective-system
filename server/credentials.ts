/**
 * Credential Generation Utilities
 * Handles generation of Member Credentials for The The L.A.W.S. Collective
 */

import { randomBytes } from 'crypto';

/**
 * Generate a unique credential ID
 * Format: LAWS-XXXX-XXXX-XXXX (alphanumeric)
 */
export function generateCredentialId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments: string[] = [];
  
  for (let s = 0; s < 3; s++) {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = randomBytes(1)[0] % chars.length;
      segment += chars[randomIndex];
    }
    segments.push(segment);
  }
  
  return `LAWS-${segments.join('-')}`;
}

/**
 * Generate a 6-character verification code
 */
export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = randomBytes(1)[0] % chars.length;
    code += chars[randomIndex];
  }
  
  return code;
}

/**
 * Generate QR code data for credential
 */
export function generateQRData(credentialId: string, verificationCode: string): string {
  const baseUrl = process.env.VITE_APP_URL || 'https://laws-collective.com';
  return `${baseUrl}/verify?id=${credentialId}&code=${verificationCode}`;
}

/**
 * Validate credential ID format
 */
export function validateCredentialId(id: string): boolean {
  const pattern = /^LAWS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(id);
}

/**
 * Get access level based on score
 */
export function getAccessLevelFromScore(score: number): 'member' | 'advanced' | 'elite' {
  if (score >= 90) return 'elite';
  if (score >= 80) return 'advanced';
  return 'member';
}

/**
 * Entry path types for credential issuance
 */
export type EntryPath = 'game' | 'academy' | 'direct_onboarding' | 'employment' | 'legacy';

/**
 * Access level types
 */
export type AccessLevel = 'member' | 'advanced' | 'elite' | 'founder';

/**
 * Credential status types
 */
export type CredentialStatus = 'active' | 'suspended' | 'revoked' | 'expired';
