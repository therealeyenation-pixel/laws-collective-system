import crypto from "crypto";
import { ENV } from "./_core/env";

/**
 * Vault Encryption Utilities
 * 
 * Uses AES-256-GCM for authenticated encryption of identity vault data.
 * The encryption key is derived from JWT_SECRET using PBKDF2 with a fixed salt.
 * Each field gets its own random IV for security.
 * 
 * Format: iv(hex):authTag(hex):ciphertext(hex)
 * 
 * This module is used by the Genesis House and ALL member Houses
 * for the dual-layer identity protection system.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits
const PBKDF2_ITERATIONS = 100000;
const VAULT_SALT = "luv-on-purpose-vault-v1"; // Fixed salt for key derivation

// Cache the derived key to avoid re-deriving on every call
let _cachedKey: Buffer | null = null;

/**
 * Derive the encryption key from JWT_SECRET using PBKDF2
 * This ensures the vault key is different from the session signing key
 */
function getVaultKey(): Buffer {
  if (_cachedKey) return _cachedKey;
  
  const secret = ENV.cookieSecret; // JWT_SECRET
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be at least 16 characters for vault encryption");
  }
  
  _cachedKey = crypto.pbkdf2Sync(
    secret,
    VAULT_SALT,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    "sha512"
  );
  
  return _cachedKey;
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 * Returns format: iv(hex):authTag(hex):ciphertext(hex)
 */
export function vaultEncrypt(plaintext: string): string {
  if (!plaintext) return "";
  
  const key = getVaultKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted string using AES-256-GCM
 * Expects format: iv(hex):authTag(hex):ciphertext(hex)
 */
export function vaultDecrypt(encryptedData: string): string {
  if (!encryptedData) return "";
  
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }
  
  const [ivHex, authTagHex, ciphertext] = parts;
  const key = getVaultKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Encrypt multiple fields at once
 * Returns an object with the same keys but encrypted values
 */
export function vaultEncryptFields(fields: Record<string, string | null | undefined>): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  
  for (const [key, value] of Object.entries(fields)) {
    result[key] = value ? vaultEncrypt(value) : null;
  }
  
  return result;
}

/**
 * Decrypt multiple fields at once
 * Returns an object with the same keys but decrypted values
 */
export function vaultDecryptFields(fields: Record<string, string | null | undefined>): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  
  for (const [key, value] of Object.entries(fields)) {
    try {
      result[key] = value ? vaultDecrypt(value) : null;
    } catch {
      result[key] = null; // If decryption fails, return null
    }
  }
  
  return result;
}

/**
 * Hash a vault PIN for storage (not reversible)
 * Used for the separate vault access authentication
 */
export function hashVaultPin(pin: string, userId: number): string {
  return crypto
    .createHash("sha256")
    .update(`${pin}:${userId}:${VAULT_SALT}`)
    .digest("hex");
}

/**
 * Verify a vault PIN against its hash
 */
export function verifyVaultPin(pin: string, userId: number, storedHash: string): boolean {
  const computed = hashVaultPin(pin, userId);
  return crypto.timingSafeEqual(
    Buffer.from(computed, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

/**
 * Clear the cached key (for testing or key rotation)
 */
export function clearKeyCache(): void {
  _cachedKey = null;
}
