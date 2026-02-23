import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { electronicSignatures, notifications, users } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

describe("Signature Expiration Notifications", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testUserId: number;
  let testSignatureIds: number[] = [];

  beforeAll(async () => {
    db = await getDb();
    
    // Create a test user
    const result = await db.insert(users).values({
      openId: `test-notif-${Date.now()}`,
      name: "Notification Test User",
      email: "notif-test@example.com",
      role: "user",
    });
    testUserId = (result as any).insertId || (result as any)[0]?.insertId || 1;
  });

  afterAll(async () => {
    // Clean up test data
    for (const sigId of testSignatureIds) {
      await db.delete(notifications).where(
        and(
          eq(notifications.referenceType, "signature"),
          eq(notifications.referenceId, sigId)
        )
      );
      await db.delete(electronicSignatures).where(eq(electronicSignatures.id, sigId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it("should create signature expiring in 30 days", async () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const result = await db.insert(electronicSignatures).values({
      signerId: testUserId,
      signerName: "Notification Test User",
      signerEmail: "notif-test@example.com",
      documentType: "safety_policy",
      documentId: 8888,
      documentTitle: "Test Safety Policy",
      signatureData: JSON.stringify({ statement: "I acknowledge" }),
      signatureHash: "test-hash-30d-" + Date.now(),
      verificationCode: "test-code-30d-" + Date.now(),
      isVerified: true,
      expiresAt,
      requiresReAcknowledgment: true,
    });

    const signatureId = (result as any).insertId || (result as any)[0]?.insertId || 1;
    testSignatureIds.push(signatureId);

    // Verify the signature was created
    const [signature] = await db
      .select()
      .from(electronicSignatures)
      .where(eq(electronicSignatures.id, signatureId))
      .limit(1);

    expect(signature).toBeDefined();
    expect(signature.requiresReAcknowledgment).toBe(true);
    expect(signature.expiresAt).toBeDefined();
  });

  it("should create signature expiring in 7 days (urgent)", async () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const result = await db.insert(electronicSignatures).values({
      signerId: testUserId,
      signerName: "Notification Test User",
      signerEmail: "notif-test@example.com",
      documentType: "compliance_policy",
      documentId: 8889,
      documentTitle: "Test Compliance Policy",
      signatureData: JSON.stringify({ statement: "I acknowledge" }),
      signatureHash: "test-hash-7d-" + Date.now(),
      verificationCode: "test-code-7d-" + Date.now(),
      isVerified: true,
      expiresAt,
      requiresReAcknowledgment: true,
    });

    const signatureId = (result as any).insertId || (result as any)[0]?.insertId || 1;
    testSignatureIds.push(signatureId);

    // Verify the signature was created
    const [signature] = await db
      .select()
      .from(electronicSignatures)
      .where(eq(electronicSignatures.id, signatureId))
      .limit(1);

    expect(signature).toBeDefined();
    
    // Check days until expiration (allow for slight timing differences)
    const daysUntil = Math.ceil(
      (new Date(signature.expiresAt!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    // Should be approximately 7 days (allow for timing variance)
    expect(daysUntil).toBeLessThanOrEqual(8);
    expect(daysUntil).toBeGreaterThanOrEqual(6);
  });

  it("should create notification for expiring signature", async () => {
    // Create a notification for the first test signature
    const signatureId = testSignatureIds[0];
    
    await db.insert(notifications).values({
      userId: testUserId,
      type: "info",
      title: "📋 Signature Expiring in 30 Days",
      message: "Your signature on \"Test Safety Policy\" will expire in 30 days.",
      referenceType: "signature",
      referenceId: signatureId,
      actionUrl: `/my-signatures?highlight=${signatureId}`,
      isPriority: false,
      metadata: {
        signatureId,
        documentType: "safety_policy",
        notificationType: "expiration_reminder",
        daysUntilExpiration: 30,
      },
    });

    // Verify notification was created
    const notifs = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.referenceType, "signature"),
          eq(notifications.referenceId, signatureId)
        )
      )
      .orderBy(desc(notifications.createdAt));

    expect(notifs.length).toBeGreaterThan(0);
    expect(notifs[0].type).toBe("info");
    expect(notifs[0].referenceType).toBe("signature");
  });

  it("should create urgent notification for signature expiring soon", async () => {
    // Create an urgent notification for the 7-day signature
    const signatureId = testSignatureIds[1];
    
    await db.insert(notifications).values({
      userId: testUserId,
      type: "alert",
      title: "⚠️ Signature Expiring in 7 Days",
      message: "Your signature on \"Test Compliance Policy\" will expire in 7 days.",
      referenceType: "signature",
      referenceId: signatureId,
      actionUrl: `/my-signatures?highlight=${signatureId}`,
      isPriority: true,
      metadata: {
        signatureId,
        documentType: "compliance_policy",
        notificationType: "expiration_reminder",
        daysUntilExpiration: 7,
      },
    });

    // Verify notification was created with priority
    const notifs = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.referenceType, "signature"),
          eq(notifications.referenceId, signatureId)
        )
      )
      .orderBy(desc(notifications.createdAt));

    expect(notifs.length).toBeGreaterThan(0);
    expect(notifs[0].type).toBe("alert");
    expect(notifs[0].isPriority).toBe(true);
  });

  it("should track notification metadata correctly", async () => {
    const signatureId = testSignatureIds[0];
    
    const notifs = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.referenceType, "signature"),
          eq(notifications.referenceId, signatureId)
        )
      )
      .limit(1);

    expect(notifs.length).toBeGreaterThan(0);
    
    const metadata = notifs[0].metadata as any;
    expect(metadata).toBeDefined();
    expect(metadata.notificationType).toBe("expiration_reminder");
    expect(metadata.daysUntilExpiration).toBeDefined();
  });

  it("should support re-acknowledgment request notifications", async () => {
    const signatureId = testSignatureIds[0];
    
    await db.insert(notifications).values({
      userId: testUserId,
      type: "approval",
      title: "📝 Re-acknowledgment Required",
      message: "Your signature on \"Test Safety Policy\" has expired. Please re-acknowledge.",
      referenceType: "signature",
      referenceId: signatureId,
      actionUrl: `/my-signatures?reack=${signatureId}`,
      isPriority: true,
      metadata: {
        signatureId,
        notificationType: "reacknowledgment_request",
        requestedAt: new Date().toISOString(),
      },
    });

    // Verify re-acknowledgment notification
    const notifs = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, testUserId),
          eq(notifications.type, "approval")
        )
      )
      .orderBy(desc(notifications.createdAt));

    expect(notifs.length).toBeGreaterThan(0);
    expect(notifs[0].title).toContain("Re-acknowledgment");
  });

  it("should query signatures requiring re-acknowledgment", async () => {
    // Create an expired signature
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 5);

    const result = await db.insert(electronicSignatures).values({
      signerId: testUserId,
      signerName: "Notification Test User",
      signerEmail: "notif-test@example.com",
      documentType: "code_of_conduct",
      documentId: 8890,
      documentTitle: "Test Code of Conduct",
      signatureData: JSON.stringify({ statement: "I acknowledge" }),
      signatureHash: "test-hash-expired-" + Date.now(),
      verificationCode: "test-code-expired-" + Date.now(),
      isVerified: true,
      expiresAt: expiredDate,
      requiresReAcknowledgment: true,
    });

    const signatureId = (result as any).insertId || (result as any)[0]?.insertId || 1;
    testSignatureIds.push(signatureId);

    // Query for expired signatures requiring re-acknowledgment
    const expiredSignatures = await db
      .select()
      .from(electronicSignatures)
      .where(
        and(
          eq(electronicSignatures.signerId, testUserId),
          eq(electronicSignatures.requiresReAcknowledgment, true)
        )
      );

    const needsReAck = expiredSignatures.filter(
      sig => sig.expiresAt && new Date(sig.expiresAt) < new Date()
    );

    expect(needsReAck.length).toBeGreaterThan(0);
  });
});
