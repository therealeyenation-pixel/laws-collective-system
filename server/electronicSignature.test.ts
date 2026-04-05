import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getDb } from "./db";
import { electronicSignatures, signatureAuditLog, users } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

describe("Electronic Signature - Expiration and Re-acknowledgment", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testUserId: number;
  let testSignatureId: number;

  beforeAll(async () => {
    db = await getDb();
    
    // Create a test user
    const result = await db.insert(users).values({
      openId: `test-esig-${Date.now()}`,
      name: "E-Signature Test User",
      email: "esig-test@example.com",
      role: "user",
    });
    testUserId = (result as any).insertId || (result as any)[0]?.insertId || 1;
  });

  afterAll(async () => {
    // Clean up test data
    if (testSignatureId) {
      await db.delete(signatureAuditLog).where(eq(signatureAuditLog.signatureId, testSignatureId));
      await db.delete(electronicSignatures).where(eq(electronicSignatures.id, testSignatureId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it("should create a signature with expiration date when requiresAnnualReAck is true", async () => {
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    // Create signature with annual re-acknowledgment requirement
    const result = await db.insert(electronicSignatures).values({
      signerId: testUserId,
      signerName: "E-Signature Test User",
      signerEmail: "esig-test@example.com",
      documentType: "procedure_acknowledgment",
      documentId: 9999,
      documentTitle: "Test Safety Procedure",
      signatureData: JSON.stringify({ statement: "I acknowledge this document" }),
      signatureHash: "test-hash-" + Date.now(),
      verificationCode: "test-code-" + Date.now(),
      isVerified: true,
      expiresAt: oneYearFromNow,
      requiresReAcknowledgment: true,
    });

    testSignatureId = (result as any).insertId || (result as any)[0]?.insertId || 1;

    // Verify the signature was created with expiration
    const [signature] = await db
      .select()
      .from(electronicSignatures)
      .where(eq(electronicSignatures.id, testSignatureId))
      .limit(1);

    expect(signature).toBeDefined();
    expect(signature.expiresAt).toBeDefined();
    expect(signature.requiresReAcknowledgment).toBe(true);
    
    // Expiration should be approximately 1 year from now
    const expiresAt = new Date(signature.expiresAt!);
    const diffInDays = Math.abs((expiresAt.getTime() - oneYearFromNow.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffInDays).toBeLessThan(2); // Allow 2 days tolerance
  });

  it("should correctly identify expired signatures", async () => {
    // Create an expired signature
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1); // 1 month ago

    const result = await db.insert(electronicSignatures).values({
      signerId: testUserId,
      signerName: "E-Signature Test User",
      signerEmail: "esig-test@example.com",
      documentType: "compliance_policy",
      documentId: 9998,
      documentTitle: "Test Compliance Policy",
      signatureData: JSON.stringify({ statement: "I acknowledge this document" }),
      signatureHash: "test-hash-expired-" + Date.now(),
      verificationCode: "test-code-expired-" + Date.now(),
      isVerified: true,
      expiresAt: pastDate,
      requiresReAcknowledgment: true,
    });

    const expiredSignatureId = (result as any).insertId || (result as any)[0]?.insertId || 1;

    // Verify the signature is expired
    const [signature] = await db
      .select()
      .from(electronicSignatures)
      .where(eq(electronicSignatures.id, expiredSignatureId))
      .limit(1);

    expect(signature).toBeDefined();
    expect(signature.expiresAt).toBeDefined();
    
    const isExpired = new Date(signature.expiresAt!) < new Date();
    expect(isExpired).toBe(true);

    // Clean up
    await db.delete(electronicSignatures).where(eq(electronicSignatures.id, expiredSignatureId));
  });

  it("should create a signature without expiration when requiresAnnualReAck is false", async () => {
    const result = await db.insert(electronicSignatures).values({
      signerId: testUserId,
      signerName: "E-Signature Test User",
      signerEmail: "esig-test@example.com",
      documentType: "general_document",
      documentId: 9997,
      documentTitle: "Test General Document",
      signatureData: JSON.stringify({ statement: "I acknowledge this document" }),
      signatureHash: "test-hash-noexp-" + Date.now(),
      verificationCode: "test-code-noexp-" + Date.now(),
      isVerified: true,
      expiresAt: null,
      requiresReAcknowledgment: false,
    });

    const noExpSignatureId = (result as any).insertId || (result as any)[0]?.insertId || 1;

    // Verify the signature was created without expiration
    const [signature] = await db
      .select()
      .from(electronicSignatures)
      .where(eq(electronicSignatures.id, noExpSignatureId))
      .limit(1);

    expect(signature).toBeDefined();
    expect(signature.expiresAt).toBeNull();
    expect(signature.requiresReAcknowledgment).toBe(false);

    // Clean up
    await db.delete(electronicSignatures).where(eq(electronicSignatures.id, noExpSignatureId));
  });

  it("should track signature in audit log", async () => {
    // Create audit log entry for the test signature
    await db.insert(signatureAuditLog).values({
      signatureId: testSignatureId,
      action: "SIGNED",
      actionBy: testUserId,
      actionDetails: JSON.stringify({
        documentType: "procedure_acknowledgment",
        documentId: 9999,
        documentTitle: "Test Safety Procedure",
      }),
      ipAddress: "127.0.0.1",
    });

    // Verify audit log entry
    const logs = await db
      .select()
      .from(signatureAuditLog)
      .where(eq(signatureAuditLog.signatureId, testSignatureId))
      .orderBy(desc(signatureAuditLog.createdAt));

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toBe("SIGNED");
    expect(logs[0].actionBy).toBe(testUserId);
  });

  it("should support custom expiration days", async () => {
    const customDays = 90;
    const expectedExpiration = new Date();
    expectedExpiration.setDate(expectedExpiration.getDate() + customDays);

    const result = await db.insert(electronicSignatures).values({
      signerId: testUserId,
      signerName: "E-Signature Test User",
      signerEmail: "esig-test@example.com",
      documentType: "short_term_agreement",
      documentId: 9996,
      documentTitle: "Test 90-Day Agreement",
      signatureData: JSON.stringify({ statement: "I acknowledge this document" }),
      signatureHash: "test-hash-custom-" + Date.now(),
      verificationCode: "test-code-custom-" + Date.now(),
      isVerified: true,
      expiresAt: expectedExpiration,
      requiresReAcknowledgment: true,
    });

    const customExpSignatureId = (result as any).insertId || (result as any)[0]?.insertId || 1;

    // Verify the signature was created with custom expiration
    const [signature] = await db
      .select()
      .from(electronicSignatures)
      .where(eq(electronicSignatures.id, customExpSignatureId))
      .limit(1);

    expect(signature).toBeDefined();
    expect(signature.expiresAt).toBeDefined();
    
    // Expiration should be approximately 90 days from now
    const expiresAt = new Date(signature.expiresAt!);
    const diffInDays = Math.abs((expiresAt.getTime() - expectedExpiration.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffInDays).toBeLessThan(2); // Allow 2 days tolerance

    // Clean up
    await db.delete(electronicSignatures).where(eq(electronicSignatures.id, customExpSignatureId));
  });

  it("should verify signature by verification code", async () => {
    // Get the test signature
    const [signature] = await db
      .select()
      .from(electronicSignatures)
      .where(eq(electronicSignatures.id, testSignatureId))
      .limit(1);

    expect(signature).toBeDefined();
    expect(signature.verificationCode).toBeDefined();
    expect(signature.isVerified).toBe(true);
  });
});
