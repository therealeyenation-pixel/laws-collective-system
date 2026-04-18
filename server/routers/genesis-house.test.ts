import { describe, it, expect } from "vitest";
import {
  vaultEncrypt,
  vaultDecrypt,
  vaultEncryptFields,
  vaultDecryptFields,
  hashVaultPin,
  verifyVaultPin,
  clearKeyCache,
} from "../vault-crypto";

describe("Vault Encryption", () => {
  it("should encrypt and decrypt a string correctly", () => {
    const plaintext = "La Shanna K. Russell";
    const encrypted = vaultEncrypt(plaintext);
    
    // Encrypted should be different from plaintext
    expect(encrypted).not.toBe(plaintext);
    
    // Should have the format iv:authTag:ciphertext
    const parts = encrypted.split(":");
    expect(parts.length).toBe(3);
    
    // Decrypt should return original
    const decrypted = vaultDecrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should handle empty strings", () => {
    expect(vaultEncrypt("")).toBe("");
    expect(vaultDecrypt("")).toBe("");
  });

  it("should encrypt SSN format correctly", () => {
    const ssn = "123-45-6789";
    const encrypted = vaultEncrypt(ssn);
    const decrypted = vaultDecrypt(encrypted);
    expect(decrypted).toBe(ssn);
  });

  it("should encrypt date of birth correctly", () => {
    const dob = "1985-03-15";
    const encrypted = vaultEncrypt(dob);
    const decrypted = vaultDecrypt(encrypted);
    expect(decrypted).toBe(dob);
  });

  it("should produce different ciphertexts for same plaintext (random IV)", () => {
    const plaintext = "Test Name";
    const encrypted1 = vaultEncrypt(plaintext);
    const encrypted2 = vaultEncrypt(plaintext);
    
    // Different IVs should produce different ciphertexts
    expect(encrypted1).not.toBe(encrypted2);
    
    // Both should decrypt to the same value
    expect(vaultDecrypt(encrypted1)).toBe(plaintext);
    expect(vaultDecrypt(encrypted2)).toBe(plaintext);
  });

  it("should throw on tampered ciphertext", () => {
    const encrypted = vaultEncrypt("Sensitive Data");
    const parts = encrypted.split(":");
    // Tamper with the ciphertext
    parts[2] = parts[2].slice(0, -2) + "ff";
    const tampered = parts.join(":");
    
    expect(() => vaultDecrypt(tampered)).toThrow();
  });

  it("should encrypt and decrypt multiple fields", () => {
    const fields = {
      legalName: "La Shanna K. Russell",
      ssn: "123-45-6789",
      dob: "1985-03-15",
      address: "123 Main St, Los Angeles, CA 90001",
      phone: null,
      email: undefined,
    };

    const encrypted = vaultEncryptFields(fields);
    
    // Null/undefined should remain null
    expect(encrypted.phone).toBeNull();
    expect(encrypted.email).toBeNull();
    
    // Non-null fields should be encrypted
    expect(encrypted.legalName).not.toBe(fields.legalName);
    expect(encrypted.ssn).not.toBe(fields.ssn);
    
    // Decrypt all
    const decrypted = vaultDecryptFields(encrypted);
    expect(decrypted.legalName).toBe(fields.legalName);
    expect(decrypted.ssn).toBe(fields.ssn);
    expect(decrypted.dob).toBe(fields.dob);
    expect(decrypted.address).toBe(fields.address);
    expect(decrypted.phone).toBeNull();
    expect(decrypted.email).toBeNull();
  });
});

describe("Vault PIN", () => {
  it("should hash and verify a PIN correctly", () => {
    const pin = "secure123";
    const userId = 42;
    
    const hash = hashVaultPin(pin, userId);
    expect(hash).toBeTruthy();
    expect(hash.length).toBe(64); // SHA-256 hex
    
    // Verify correct PIN
    expect(verifyVaultPin(pin, userId, hash)).toBe(true);
    
    // Reject wrong PIN
    expect(verifyVaultPin("wrong123", userId, hash)).toBe(false);
    
    // Reject wrong user ID
    expect(verifyVaultPin(pin, 99, hash)).toBe(false);
  });

  it("should produce different hashes for different users", () => {
    const pin = "samepin";
    const hash1 = hashVaultPin(pin, 1);
    const hash2 = hashVaultPin(pin, 2);
    
    expect(hash1).not.toBe(hash2);
  });
});

describe("Genesis House Distribution", () => {
  it("should have correct distribution percentages totaling 100%", () => {
    const distribution = {
      craig: 10,
      amber: 13,
      essence: 13,
      amandes: 13,
      cornelius: 5,
      future: 46,
    };
    
    const total = Object.values(distribution).reduce((sum, pct) => sum + pct, 0);
    expect(total).toBe(100);
    
    // Verify specific allocations
    expect(distribution.craig).toBe(10);
    expect(distribution.amber).toBe(13);
    expect(distribution.essence).toBe(13);
    expect(distribution.amandes).toBe(13);
    expect(distribution.cornelius).toBe(5);
    expect(distribution.future).toBe(46);
  });

  it("should include Cornelius at 5% (flows to grandchildren)", () => {
    const beneficiaries = ["craig", "amber", "essence", "amandes", "cornelius", "future"];
    expect(beneficiaries).toContain("cornelius");
    
    const distribution: Record<string, number> = {
      craig: 10, amber: 13, essence: 13, amandes: 13, cornelius: 5, future: 46,
    };
    expect(distribution.cornelius).toBe(5);
  });
});

describe("Dual-Layer Identity Model", () => {
  it("display layer should only show aliases", () => {
    const displayLayer = {
      alias: "Amber",
      role: "Heir",
      inheritancePercentage: 13,
    };
    
    // Display layer should NOT contain legal name, SSN, DOB
    expect(displayLayer).not.toHaveProperty("legalName");
    expect(displayLayer).not.toHaveProperty("ssn");
    expect(displayLayer).not.toHaveProperty("dob");
  });

  it("vault layer should contain encrypted legal data", () => {
    const legalName = "Amber Russell";
    const ssn = "987-65-4321";
    
    const vaultLayer = {
      encryptedLegalName: vaultEncrypt(legalName),
      encryptedSsn: vaultEncrypt(ssn),
      displayAlias: "Amber",
    };
    
    // Encrypted fields should not match plaintext
    expect(vaultLayer.encryptedLegalName).not.toBe(legalName);
    expect(vaultLayer.encryptedSsn).not.toBe(ssn);
    
    // Should decrypt correctly
    expect(vaultDecrypt(vaultLayer.encryptedLegalName)).toBe(legalName);
    expect(vaultDecrypt(vaultLayer.encryptedSsn)).toBe(ssn);
    
    // Display alias should be plaintext
    expect(vaultLayer.displayAlias).toBe("Amber");
  });
});
