import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  houses,
  identityVault,
  vaultAccessLog,
  systemConfig,
  emergencyVaultAccess,
  designatedSuccessors,
  houseVaultConfig,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  vaultEncryptFields,
  vaultDecryptFields,
  hashVaultPin,
  verifyVaultPin,
} from "../vault-crypto";

const EMERGENCY_DELAY_HOURS = 72;
const EMERGENCY_ACCESS_WINDOW_HOURS = 24;

async function verifyUserPin(db: any, userId: number, pin: string): Promise<boolean> {
  const configKey = `vault_pin_${userId}`;
  const stored = await db.select().from(systemConfig).where(eq(systemConfig.configKey, configKey)).limit(1);
  if (!stored.length) return false;
  return verifyVaultPin(pin, userId, stored[0].configValue);
}

async function verifyOwnership(db: any, houseId: number, userId: number) {
  const house = await db.select().from(houses).where(and(eq(houses.id, houseId), eq(houses.ownerUserId, userId))).limit(1);
  if (!house.length) throw new TRPCError({ code: "FORBIDDEN", message: "You do not own this House" });
  return house[0];
}

export const vaultSuccessionRouter = router({
  initializeHouseVault: protectedProcedure
    .input(z.object({ houseId: z.number(), pin: z.string().min(6).max(20) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await verifyOwnership(db, input.houseId, ctx.user.id);
      const existing = await db.select().from(houseVaultConfig).where(eq(houseVaultConfig.houseId, input.houseId)).limit(1);
      if (existing.length) throw new TRPCError({ code: "CONFLICT", message: "Vault already initialized" });
      const genesisHouse = await db.select().from(houses).where(eq(houses.isGenesis, true)).limit(1);
      const inheritedFromId = genesisHouse.length ? genesisHouse[0].id : null;
      let delayHours = EMERGENCY_DELAY_HOURS;
      let accessWindow = EMERGENCY_ACCESS_WINDOW_HOURS;
      if (inheritedFromId) {
        const gc = await db.select().from(houseVaultConfig).where(eq(houseVaultConfig.houseId, inheritedFromId)).limit(1);
        if (gc.length) { delayHours = gc[0].emergencyDelayHours; accessWindow = gc[0].emergencyAccessWindow; }
      }
      const pinHash = hashVaultPin(input.pin, ctx.user.id);
      const configKey = `vault_pin_${ctx.user.id}`;
      const existingPin = await db.select().from(systemConfig).where(eq(systemConfig.configKey, configKey)).limit(1);
      if (!existingPin.length) {
        await db.insert(systemConfig).values({ configKey, configValue: pinHash, configType: "string", description: "Hashed vault access PIN", updatedByUserId: ctx.user.id });
      }
      await db.insert(houseVaultConfig).values({
        houseId: input.houseId, inheritedFromHouseId: inheritedFromId, vaultEnabled: true, requirePinForAccess: true,
        emergencyAccessEnabled: true, emergencyDelayHours: delayHours, emergencyAccessWindow: accessWindow,
        encryptionVersion: 1, logAllAccess: true, notifyOwnerOnAccess: true,
      });
      return { status: "VAULT_INITIALIZED", houseId: input.houseId, inheritedFrom: inheritedFromId ? "Genesis House" : "Default Template",
        config: { emergencyDelayHours: delayHours, emergencyAccessWindowHours: accessWindow },
        message: `Vault initialized. Dual-layer identity protection active. Emergency protocol: ${delayHours}-hour delay.` };
    }),

  addHouseVaultEntry: protectedProcedure
    .input(z.object({
      houseId: z.number(), vaultPin: z.string().min(6).max(20), displayAlias: z.string().min(1).max(255),
      displayRole: z.enum(["Head of House", "Co-Head", "Heir", "Member", "Extended Family"]),
      relationship: z.enum(["self", "spouse", "child", "grandchild", "sibling", "niece_nephew", "cousin", "adopted", "guardian_ward", "other"]),
      inheritancePercentage: z.number().min(0).max(100), inheritanceOrder: z.number().min(1).optional(),
      legalName: z.string().optional(), ssn: z.string().optional(), dob: z.string().optional(),
      address: z.string().optional(), phone: z.string().optional(), email: z.string().optional(),
      notes: z.string().optional(), trustBeneficiary: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await verifyOwnership(db, input.houseId, ctx.user.id);
      if (!(await verifyUserPin(db, ctx.user.id, input.vaultPin))) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid vault PIN" });
      const encrypted = vaultEncryptFields({ legalName: input.legalName, ssn: input.ssn, dob: input.dob, address: input.address, phone: input.phone, email: input.email, notes: input.notes, trustBeneficiary: input.trustBeneficiary });
      const [entry] = await db.insert(identityVault).values({
        houseId: input.houseId, displayAlias: input.displayAlias, displayRole: input.displayRole,
        encryptedLegalName: encrypted.legalName, encryptedSsn: encrypted.ssn, encryptedDob: encrypted.dob,
        encryptedAddress: encrypted.address, encryptedPhone: encrypted.phone, encryptedEmail: encrypted.email,
        encryptedNotes: encrypted.notes, encryptedTrustBeneficiary: encrypted.trustBeneficiary,
        inheritancePercentage: input.inheritancePercentage.toFixed(2), inheritanceOrder: input.inheritanceOrder,
        relationship: input.relationship, encryptionVersion: 1, status: "active",
      }).$returningId();
      await db.insert(vaultAccessLog).values({ houseId: input.houseId, vaultEntryId: entry.id, accessedByUserId: ctx.user.id, accessType: "create", fieldsAccessed: Object.keys(encrypted).filter((k) => (encrypted as any)[k] !== null), authMethod: "vault_pin" });
      return { vaultEntryId: entry.id, displayAlias: input.displayAlias, status: "ADDED", message: `${input.displayAlias} added to House vault with ${input.inheritancePercentage}% inheritance.` };
    }),

  getVaultConfig: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await verifyOwnership(db, input.houseId, ctx.user.id);
      const config = await db.select().from(houseVaultConfig).where(eq(houseVaultConfig.houseId, input.houseId)).limit(1);
      return { initialized: config.length > 0, config: config[0] || null };
    }),

  designateSuccessor: protectedProcedure
    .input(z.object({
      houseId: z.number(), vaultPin: z.string().min(6).max(20), successorName: z.string().min(1).max(255),
      successorEmail: z.string().email().optional(), successorPhone: z.string().optional(),
      accessLevel: z.enum(["full", "identity_only", "legal_only", "distribution_only"]),
      priority: z.number().min(1).max(10), relationship: z.string().optional(), userId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await verifyOwnership(db, input.houseId, ctx.user.id);
      if (!(await verifyUserPin(db, ctx.user.id, input.vaultPin))) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid vault PIN" });
      const [successor] = await db.insert(designatedSuccessors).values({
        houseId: input.houseId, userId: input.userId, successorName: input.successorName,
        successorEmail: input.successorEmail, successorPhone: input.successorPhone,
        accessLevel: input.accessLevel, priority: input.priority, relationship: input.relationship,
        status: "active", designatedByUserId: ctx.user.id,
      }).$returningId();
      return { successorId: successor.id, status: "DESIGNATED", message: `${input.successorName} designated as successor (priority ${input.priority}, ${input.accessLevel} access).` };
    }),

  getSuccessors: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await verifyOwnership(db, input.houseId, ctx.user.id);
      const s = await db.select().from(designatedSuccessors).where(and(eq(designatedSuccessors.houseId, input.houseId), eq(designatedSuccessors.status, "active"))).orderBy(designatedSuccessors.priority);
      return { successors: s };
    }),

  revokeSuccessor: protectedProcedure
    .input(z.object({ successorId: z.number(), vaultPin: z.string().min(6).max(20), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const successor = await db.select().from(designatedSuccessors).where(eq(designatedSuccessors.id, input.successorId)).limit(1);
      if (!successor.length) throw new TRPCError({ code: "NOT_FOUND", message: "Successor not found" });
      await verifyOwnership(db, successor[0].houseId, ctx.user.id);
      if (!(await verifyUserPin(db, ctx.user.id, input.vaultPin))) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid vault PIN" });
      await db.update(designatedSuccessors).set({ status: "revoked", revokedAt: new Date(), revokedReason: input.reason || "Revoked by house owner" }).where(eq(designatedSuccessors.id, input.successorId));
      return { status: "REVOKED", message: "Successor designation revoked." };
    }),

  requestEmergencyAccess: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      reason: z.enum(["owner_incapacitated", "owner_deceased", "legal_requirement", "succession_transfer", "emergency_medical"]),
      reasonDetails: z.string().min(10).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const successor = await db.select().from(designatedSuccessors).where(and(eq(designatedSuccessors.houseId, input.houseId), eq(designatedSuccessors.userId, ctx.user.id), eq(designatedSuccessors.status, "active"))).limit(1);
      if (!successor.length) throw new TRPCError({ code: "FORBIDDEN", message: "You are not a designated successor for this House" });
      const pending = await db.select().from(emergencyVaultAccess).where(and(eq(emergencyVaultAccess.houseId, input.houseId), eq(emergencyVaultAccess.requestedByUserId, ctx.user.id), eq(emergencyVaultAccess.status, "pending"))).limit(1);
      if (pending.length) throw new TRPCError({ code: "CONFLICT", message: "You already have a pending request" });
      const vc = await db.select().from(houseVaultConfig).where(eq(houseVaultConfig.houseId, input.houseId)).limit(1);
      const delayHours = vc.length ? vc[0].emergencyDelayHours : EMERGENCY_DELAY_HOURS;
      const accessWindowHours = vc.length ? vc[0].emergencyAccessWindow : EMERGENCY_ACCESS_WINDOW_HOURS;
      const now = new Date();
      const unlockAt = new Date(now.getTime() + delayHours * 60 * 60 * 1000);
      const accessExpiresAt = new Date(unlockAt.getTime() + accessWindowHours * 60 * 60 * 1000);
      const fieldMap: Record<string, string[]> = {
        identity_only: ["legalName", "dob"], legal_only: ["legalName", "ssn", "address", "trustBeneficiary"],
        distribution_only: ["inheritancePercentage", "trustBeneficiary"],
        full: ["legalName", "ssn", "dob", "address", "phone", "email", "notes", "trustBeneficiary"],
      };
      const fieldsAccessible = fieldMap[successor[0].accessLevel] || fieldMap.full;
      const [request] = await db.insert(emergencyVaultAccess).values({
        houseId: input.houseId, requestedByUserId: ctx.user.id, requestedByName: successor[0].successorName,
        reason: input.reason, reasonDetails: input.reasonDetails, unlockAt, status: "pending",
        ownerNotifiedAt: now, accessExpiresAt, fieldsAccessible,
      }).$returningId();
      return { requestId: request.id, status: "PENDING", unlockAt: unlockAt.toISOString(), accessExpiresAt: accessExpiresAt.toISOString(), delayHours, fieldsAccessible, message: `Emergency access request submitted. ${delayHours}-hour time-lock started. Owner notified.` };
    }),

  respondToEmergencyAccess: protectedProcedure
    .input(z.object({ requestId: z.number(), vaultPin: z.string().min(6).max(20), action: z.enum(["approve", "deny", "cancel"]), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const request = await db.select().from(emergencyVaultAccess).where(eq(emergencyVaultAccess.id, input.requestId)).limit(1);
      if (!request.length) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
      if (request[0].status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: `Request is already ${request[0].status}` });
      await verifyOwnership(db, request[0].houseId, ctx.user.id);
      if (!(await verifyUserPin(db, ctx.user.id, input.vaultPin))) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid vault PIN" });
      const statusMap = { approve: "approved" as const, deny: "denied" as const, cancel: "cancelled" as const };
      const updateData: any = { status: statusMap[input.action], ownerResponseAt: new Date(), ownerResponseNote: input.note };
      if (input.action === "approve") updateData.accessGrantedAt = new Date();
      await db.update(emergencyVaultAccess).set(updateData).where(eq(emergencyVaultAccess.id, input.requestId));
      return { requestId: input.requestId, status: statusMap[input.action], message: `Emergency access request ${input.action}ed.` };
    }),

  getEmergencyRequests: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await verifyOwnership(db, input.houseId, ctx.user.id);
      const requests = await db.select().from(emergencyVaultAccess).where(eq(emergencyVaultAccess.houseId, input.houseId)).orderBy(desc(emergencyVaultAccess.requestedAt));
      return { requests };
    }),

  executeEmergencyAccess: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const request = await db.select().from(emergencyVaultAccess).where(eq(emergencyVaultAccess.id, input.requestId)).limit(1);
      if (!request.length) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
      const req = request[0];
      if (req.requestedByUserId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Not your request" });
      const now = new Date();
      if (req.status === "pending") {
        if (now >= req.unlockAt) { await db.update(emergencyVaultAccess).set({ status: "auto_approved", accessGrantedAt: now }).where(eq(emergencyVaultAccess.id, input.requestId)); }
        else { const hr = Math.ceil((req.unlockAt.getTime() - now.getTime()) / (1000 * 60 * 60)); throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Time-lock active. ${hr} hours remaining.` }); }
      } else if (req.status !== "approved" && req.status !== "auto_approved") {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Request status is ${req.status}. Cannot access.` });
      }
      if (req.accessExpiresAt && now > req.accessExpiresAt) {
        await db.update(emergencyVaultAccess).set({ status: "expired" }).where(eq(emergencyVaultAccess.id, input.requestId));
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Access window expired. Submit new request." });
      }
      const entries = await db.select().from(identityVault).where(eq(identityVault.houseId, req.houseId));
      const fieldsAccessible = (req.fieldsAccessible as string[]) || [];
      const limitedEntries = entries.map((entry: any) => {
        const decrypted = vaultDecryptFields({
          legalName: fieldsAccessible.includes("legalName") ? entry.encryptedLegalName : undefined,
          ssn: fieldsAccessible.includes("ssn") ? entry.encryptedSsn : undefined,
          dob: fieldsAccessible.includes("dob") ? entry.encryptedDob : undefined,
          address: fieldsAccessible.includes("address") ? entry.encryptedAddress : undefined,
          phone: fieldsAccessible.includes("phone") ? entry.encryptedPhone : undefined,
          email: fieldsAccessible.includes("email") ? entry.encryptedEmail : undefined,
          notes: fieldsAccessible.includes("notes") ? entry.encryptedNotes : undefined,
          trustBeneficiary: fieldsAccessible.includes("trustBeneficiary") ? entry.encryptedTrustBeneficiary : undefined,
        });
        return { id: entry.id, displayAlias: entry.displayAlias, displayRole: entry.displayRole, relationship: entry.relationship, inheritancePercentage: entry.inheritancePercentage, ...decrypted };
      });
      for (const entry of entries) {
        await db.insert(vaultAccessLog).values({ houseId: req.houseId, vaultEntryId: entry.id, accessedByUserId: ctx.user.id, accessType: "emergency", fieldsAccessed: fieldsAccessible, authMethod: "emergency_key" });
      }
      await db.update(emergencyVaultAccess).set({ status: "used" }).where(eq(emergencyVaultAccess.id, input.requestId));
      return { requestId: input.requestId, houseId: req.houseId, entries: limitedEntries, fieldsAccessible, accessedAt: now.toISOString(), message: `Emergency vault access executed. ${limitedEntries.length} entries retrieved.` };
    }),
});
