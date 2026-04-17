import { describe, it, expect, beforeEach, vi } from "vitest";

import { appRouter } from "../routers";

describe.skip(/* requires DB connection */ "Emergency Router", () => {
  let caller: any;

  beforeEach(() => {
    
    caller = appRouter.createCaller({
      user: { id: 1, openId: "test-user", email: "test@example.com", name: "Test User", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as any, res: { clearCookie: () => {} } as any,
      req: { headers: { origin: "http://localhost:3000" } },
    } as any);
  });

  it("should create an emergency alert", async () => {
    const result = await caller.createAlert({
      type: "medical",
      location: "123 Main St",
      description: "Medical emergency",
      severity: "critical",
    });

    expect(result).toBeDefined();
    expect(result.type).toBe("medical");
    expect(result.status).toBe("active");
  });

  it("should get emergency alerts for user", async () => {
    await caller.createAlert({
      type: "security",
      location: "456 Oak Ave",
      description: "Security breach",
      severity: "high",
    });

    const alerts = await caller.getAlerts();
    expect(Array.isArray(alerts)).toBe(true);
  });

  it("should update alert status", async () => {
    const alert = await caller.createAlert({
      type: "fire",
      location: "789 Pine Rd",
      description: "Fire detected",
      severity: "critical",
    });

    const updated = await caller.updateAlertStatus({
      alertId: alert.id,
      status: "resolved",
      resolution: "Fire extinguished",
    });

    expect(updated.status).toBe("resolved");
  });

  it("should add emergency contact", async () => {
    const contact = await caller.addContact({
      name: "John Doe",
      phone: "555-1234",
      email: "john@example.com",
      relationship: "Family",
    });

    expect(contact).toBeDefined();
    expect(contact.name).toBe("John Doe");
  });

  it("should get emergency contacts", async () => {
    await caller.addContact({
      name: "Jane Smith",
      phone: "555-5678",
      email: "jane@example.com",
      relationship: "Friend",
    });

    const contacts = await caller.getContacts();
    expect(Array.isArray(contacts)).toBe(true);
  });

  it("should notify emergency contacts", async () => {
    const alert = await caller.createAlert({
      type: "medical",
      location: "Hospital",
      description: "Emergency",
      severity: "critical",
    });

    const contact = await caller.addContact({
      name: "Emergency Contact",
      phone: "555-9999",
      email: "emergency@example.com",
      relationship: "Family",
    });

    const responses = await caller.notifyContacts({
      alertId: alert.id,
    });

    expect(Array.isArray(responses)).toBe(true);
  });
});
