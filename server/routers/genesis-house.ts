import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  houses,
  houseMembers,
  houseHeirs,
  identityVault,
  vaultAccessLog,
  systemConfig,
  users,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  vaultEncrypt,
  vaultDecrypt,
  vaultEncryptFields,
  vaultDecryptFields,
  hashVaultPin,
  verifyVaultPin,
} from "../vault-crypto";

// ============================================
// GENESIS HOUSE ROUTER
// Dual-Layer Identity Protection System
// Layer 1: Display aliases (visible in UI)
// Layer 2: Encrypted legal vault (owner-only)
// ============================================

// Verify user is the system owner
function requireOwner(userRole?: string): void {
  if (userRole !== "owner" && userRole !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only the system owner can access Genesis House functions",
    });
  }
}

// Genesis family distribution configuration
const GENESIS_FAMILY_DISTRIBUTION = {
  craig: { alias: "Craig", percentage: 10, relationship: "spouse" as const },
  amber: { alias: "Amber", percentage: 13, relationship: "child" as const },
  essence: { alias: "Essence", percentage: 13, relationship: "child" as const },
  amandes: { alias: "Amandes", percentage: 13, relationship: "child" as const },
  cornelius: { alias: "Cornelius", percentage: 5, relationship: "child" as const },
  future: { alias: "Future Beneficiaries", percentage: 46, relationship: "other" as const },
};

export const genesisHouseRouter = router({
  // ============================================
  // GENESIS STATUS & SETUP
  // ============================================

  // Get current Genesis House status and setup progress
  getGenesisStatus: protectedProcedure.query(async ({ ctx }) => {
    requireOwner(ctx.user.role);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    // Check for existing Genesis House
    const genesisHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.isGenesis, true))
      .limit(1);

    if (!genesisHouse.length) {
      return {
        exists: false,
        house: null,
        members: [],
        vaultEntries: 0,
        systemOpen: false,
        setupProgress: {
          houseCreated: false,
          familyAdded: false,
          vaultConfigured: false,
          distributionSet: false,
          entityMapped: false,
          activated: false,
        },
      };
    }

    const house = genesisHouse[0];

    // Get house members
    const members = await db
      .select()
      .from(houseMembers)
      .where(eq(houseMembers.houseId, house.id));

    // Get vault entries count
    const vaultEntries = await db
      .select()
      .from(identityVault)
      .where(eq(identityVault.houseId, house.id));

    // Get heirs
    const heirs = await db
      .select()
      .from(houseHeirs)
      .where(eq(houseHeirs.houseId, house.id));

    // Check system open status
    const sysConfig = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.configKey, "system_open"))
      .limit(1);

    const systemOpen = sysConfig.length > 0 && sysConfig[0].configValue === "true";

    return {
      exists: true,
      house: {
        id: house.id,
        name: house.name,
        publicAlias: house.publicAlias,
        trustName: house.trustName,
        trustType: house.trustType,
        status: house.status,
        isGenesis: house.isGenesis,
        genesisRIN: house.genesisRIN,
        statementOfPurpose: house.statementOfPurpose,
        flameLightingTimestamp: house.flameLightingTimestamp,
        createdAt: house.createdAt,
      },
      members: members.map((m) => ({
        id: m.id,
        publicAlias: m.publicAlias,
        role: m.role,
        memberType: m.memberType,
        lineageStatus: m.lineageStatus,
        status: m.status,
      })),
      heirs: heirs.map((h) => ({
        id: h.id,
        fullName: h.fullName, // This will be alias in display layer
        relationship: h.relationship,
        distributionPercentage: h.distributionPercentage,
        status: h.status,
      })),
      vaultEntries: vaultEntries.length,
      systemOpen,
      setupProgress: {
        houseCreated: true,
        familyAdded: members.length > 1 || heirs.length > 0,
        vaultConfigured: vaultEntries.length > 0,
        distributionSet: heirs.length > 0,
        entityMapped: !!house.linkedBusinessEntityId,
        activated: house.status === "active",
      },
    };
  }),

  // ============================================
  // VAULT PIN MANAGEMENT
  // ============================================

  // Set vault PIN (separate from login password)
  setVaultPin: protectedProcedure
    .input(
      z.object({
        pin: z.string().min(6).max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const pinHash = hashVaultPin(input.pin, ctx.user.id);

      // Store pin hash in system config (per-user)
      const configKey = `vault_pin_${ctx.user.id}`;
      const existing = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, configKey))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(systemConfig)
          .set({ configValue: pinHash, updatedByUserId: ctx.user.id })
          .where(eq(systemConfig.configKey, configKey));
      } else {
        await db.insert(systemConfig).values({
          configKey,
          configValue: pinHash,
          configType: "string",
          description: "Hashed vault access PIN for identity vault",
          updatedByUserId: ctx.user.id,
        });
      }

      return { success: true, message: "Vault PIN set successfully" };
    }),

  // Verify vault PIN before granting access
  verifyVaultPin: protectedProcedure
    .input(
      z.object({
        pin: z.string().min(6).max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const configKey = `vault_pin_${ctx.user.id}`;
      const stored = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, configKey))
        .limit(1);

      if (!stored.length) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Vault PIN not set. Please set a vault PIN first.",
        });
      }

      const isValid = verifyVaultPin(input.pin, ctx.user.id, stored[0].configValue);

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid vault PIN",
        });
      }

      return { verified: true, message: "Vault access granted" };
    }),

  // ============================================
  // FAMILY MEMBER MANAGEMENT (Display Layer)
  // ============================================

  // Add family member with alias (display layer) + vault entry (encrypted layer)
  addFamilyMember: protectedProcedure
    .input(
      z.object({
        // Display layer (visible to everyone)
        displayAlias: z.string().min(1).max(255),
        displayRole: z.enum(["Head of House", "Co-Head", "Heir", "Member", "Extended Family"]),
        relationship: z.enum([
          "self", "spouse", "child", "grandchild", "sibling",
          "niece_nephew", "cousin", "adopted", "guardian_ward", "other",
        ]),
        inheritancePercentage: z.number().min(0).max(100),
        inheritanceOrder: z.number().min(1).optional(),

        // Vault layer (encrypted, owner-only access)
        legalName: z.string().optional(),
        ssn: z.string().optional(),
        dob: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        notes: z.string().optional(),
        trustBeneficiary: z.string().optional(),

        // Vault PIN for authorization
        vaultPin: z.string().min(6).max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify vault PIN
      const configKey = `vault_pin_${ctx.user.id}`;
      const stored = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, configKey))
        .limit(1);

      if (!stored.length || !verifyVaultPin(input.vaultPin, ctx.user.id, stored[0].configValue)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid vault PIN" });
      }

      // Get Genesis House
      const genesisHouse = await db
        .select()
        .from(houses)
        .where(and(eq(houses.isGenesis, true), eq(houses.ownerUserId, ctx.user.id)))
        .limit(1);

      if (!genesisHouse.length) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Genesis House must be created first",
        });
      }

      const houseId = genesisHouse[0].id;

      // Create heir record (display layer - uses alias as fullName)
      const [heir] = await db
        .insert(houseHeirs)
        .values({
          houseId,
          fullName: input.displayAlias, // Display layer: alias only
          relationship: input.relationship === "self" ? "other" : input.relationship,
          distributionPercentage: input.inheritancePercentage.toFixed(2),
          distributionMethod: "accumulate",
          designatedBy: ctx.user.id,
          status: "active",
        })
        .$returningId();

      // Encrypt sensitive fields for vault
      const encrypted = vaultEncryptFields({
        legalName: input.legalName,
        ssn: input.ssn,
        dob: input.dob,
        address: input.address,
        phone: input.phone,
        email: input.email,
        notes: input.notes,
        trustBeneficiary: input.trustBeneficiary,
      });

      // Create vault entry (encrypted layer)
      const [vaultEntry] = await db
        .insert(identityVault)
        .values({
          houseId,
          heirId: heir.id,
          displayAlias: input.displayAlias,
          displayRole: input.displayRole,
          encryptedLegalName: encrypted.legalName,
          encryptedSsn: encrypted.ssn,
          encryptedDob: encrypted.dob,
          encryptedAddress: encrypted.address,
          encryptedPhone: encrypted.phone,
          encryptedEmail: encrypted.email,
          encryptedNotes: encrypted.notes,
          encryptedTrustBeneficiary: encrypted.trustBeneficiary,
          inheritancePercentage: input.inheritancePercentage.toFixed(2),
          inheritanceOrder: input.inheritanceOrder,
          relationship: input.relationship,
          encryptionVersion: 1,
          status: "active",
        })
        .$returningId();

      // Log vault creation
      await db.insert(vaultAccessLog).values({
        houseId,
        vaultEntryId: vaultEntry.id,
        accessedByUserId: ctx.user.id,
        accessType: "create",
        fieldsAccessed: Object.keys(encrypted).filter((k) => encrypted[k] !== null),
        authMethod: "vault_pin",
      });

      return {
        heirId: heir.id,
        vaultEntryId: vaultEntry.id,
        displayAlias: input.displayAlias,
        displayRole: input.displayRole,
        relationship: input.relationship,
        inheritancePercentage: input.inheritancePercentage,
        status: "ADDED",
        message: `${input.displayAlias} added to Genesis House with ${input.inheritancePercentage}% inheritance. Legal identity encrypted in vault.`,
      };
    }),

  // ============================================
  // VAULT ACCESS (Encrypted Layer)
  // ============================================

  // Get vault entries (decrypted) - requires vault PIN
  getVaultEntries: protectedProcedure
    .input(
      z.object({
        vaultPin: z.string().min(6).max(20),
        houseId: z.number().optional(), // Defaults to Genesis House
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify vault PIN
      const configKey = `vault_pin_${ctx.user.id}`;
      const stored = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, configKey))
        .limit(1);

      if (!stored.length || !verifyVaultPin(input.vaultPin, ctx.user.id, stored[0].configValue)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid vault PIN" });
      }

      // Get house ID
      let houseId = input.houseId;
      if (!houseId) {
        const genesisHouse = await db
          .select()
          .from(houses)
          .where(and(eq(houses.isGenesis, true), eq(houses.ownerUserId, ctx.user.id)))
          .limit(1);
        if (!genesisHouse.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Genesis House not found" });
        }
        houseId = genesisHouse[0].id;
      }

      // Get all vault entries for this house
      const entries = await db
        .select()
        .from(identityVault)
        .where(eq(identityVault.houseId, houseId));

      // Decrypt each entry
      const decryptedEntries = entries.map((entry) => {
        const decrypted = vaultDecryptFields({
          legalName: entry.encryptedLegalName,
          ssn: entry.encryptedSsn,
          dob: entry.encryptedDob,
          address: entry.encryptedAddress,
          phone: entry.encryptedPhone,
          email: entry.encryptedEmail,
          notes: entry.encryptedNotes,
          trustBeneficiary: entry.encryptedTrustBeneficiary,
        });

        return {
          id: entry.id,
          displayAlias: entry.displayAlias,
          displayRole: entry.displayRole,
          relationship: entry.relationship,
          inheritancePercentage: entry.inheritancePercentage,
          inheritanceOrder: entry.inheritanceOrder,
          // Decrypted fields
          legalName: decrypted.legalName,
          ssn: decrypted.ssn,
          dob: decrypted.dob,
          address: decrypted.address,
          phone: decrypted.phone,
          email: decrypted.email,
          notes: decrypted.notes,
          trustBeneficiary: decrypted.trustBeneficiary,
          // Metadata
          lastAccessedAt: entry.lastAccessedAt,
          accessCount: entry.accessCount,
          status: entry.status,
        };
      });

      // Log access for each entry
      for (const entry of entries) {
        await db.insert(vaultAccessLog).values({
          houseId,
          vaultEntryId: entry.id,
          accessedByUserId: ctx.user.id,
          accessType: "view",
          fieldsAccessed: ["legalName", "ssn", "dob", "address", "phone", "email"],
          authMethod: "vault_pin",
        });

        // Update access tracking
        await db
          .update(identityVault)
          .set({
            lastAccessedAt: new Date(),
            lastAccessedBy: ctx.user.id,
            accessCount: (entry.accessCount || 0) + 1,
          })
          .where(eq(identityVault.id, entry.id));
      }

      return {
        houseId,
        entries: decryptedEntries,
        totalEntries: decryptedEntries.length,
        accessedAt: new Date().toISOString(),
      };
    }),

  // Update a vault entry
  updateVaultEntry: protectedProcedure
    .input(
      z.object({
        vaultEntryId: z.number(),
        vaultPin: z.string().min(6).max(20),
        // Fields to update (all optional)
        displayAlias: z.string().optional(),
        displayRole: z.string().optional(),
        legalName: z.string().optional(),
        ssn: z.string().optional(),
        dob: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        notes: z.string().optional(),
        trustBeneficiary: z.string().optional(),
        inheritancePercentage: z.number().min(0).max(100).optional(),
        inheritanceOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify vault PIN
      const configKey = `vault_pin_${ctx.user.id}`;
      const stored = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, configKey))
        .limit(1);

      if (!stored.length || !verifyVaultPin(input.vaultPin, ctx.user.id, stored[0].configValue)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid vault PIN" });
      }

      // Get existing entry
      const existing = await db
        .select()
        .from(identityVault)
        .where(eq(identityVault.id, input.vaultEntryId))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vault entry not found" });
      }

      // Build update object
      const updateData: Record<string, any> = {};
      const fieldsUpdated: string[] = [];

      if (input.displayAlias) {
        updateData.displayAlias = input.displayAlias;
        fieldsUpdated.push("displayAlias");
      }
      if (input.displayRole) {
        updateData.displayRole = input.displayRole;
        fieldsUpdated.push("displayRole");
      }
      if (input.legalName !== undefined) {
        updateData.encryptedLegalName = vaultEncrypt(input.legalName);
        fieldsUpdated.push("legalName");
      }
      if (input.ssn !== undefined) {
        updateData.encryptedSsn = vaultEncrypt(input.ssn);
        fieldsUpdated.push("ssn");
      }
      if (input.dob !== undefined) {
        updateData.encryptedDob = vaultEncrypt(input.dob);
        fieldsUpdated.push("dob");
      }
      if (input.address !== undefined) {
        updateData.encryptedAddress = vaultEncrypt(input.address);
        fieldsUpdated.push("address");
      }
      if (input.phone !== undefined) {
        updateData.encryptedPhone = vaultEncrypt(input.phone);
        fieldsUpdated.push("phone");
      }
      if (input.email !== undefined) {
        updateData.encryptedEmail = vaultEncrypt(input.email);
        fieldsUpdated.push("email");
      }
      if (input.notes !== undefined) {
        updateData.encryptedNotes = vaultEncrypt(input.notes);
        fieldsUpdated.push("notes");
      }
      if (input.trustBeneficiary !== undefined) {
        updateData.encryptedTrustBeneficiary = vaultEncrypt(input.trustBeneficiary);
        fieldsUpdated.push("trustBeneficiary");
      }
      if (input.inheritancePercentage !== undefined) {
        updateData.inheritancePercentage = input.inheritancePercentage.toFixed(2);
        fieldsUpdated.push("inheritancePercentage");
      }
      if (input.inheritanceOrder !== undefined) {
        updateData.inheritanceOrder = input.inheritanceOrder;
        fieldsUpdated.push("inheritanceOrder");
      }

      if (Object.keys(updateData).length > 0) {
        await db
          .update(identityVault)
          .set(updateData)
          .where(eq(identityVault.id, input.vaultEntryId));
      }

      // Log update
      await db.insert(vaultAccessLog).values({
        houseId: existing[0].houseId,
        vaultEntryId: input.vaultEntryId,
        accessedByUserId: ctx.user.id,
        accessType: "update",
        fieldsAccessed: fieldsUpdated,
        authMethod: "vault_pin",
      });

      return {
        vaultEntryId: input.vaultEntryId,
        fieldsUpdated,
        status: "UPDATED",
        message: `Vault entry updated. ${fieldsUpdated.length} field(s) modified.`,
      };
    }),

  // Get vault access log
  getVaultAccessLog: protectedProcedure
    .input(
      z.object({
        houseId: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      requireOwner(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      let houseId = input.houseId;
      if (!houseId) {
        const genesisHouse = await db
          .select()
          .from(houses)
          .where(and(eq(houses.isGenesis, true), eq(houses.ownerUserId, ctx.user.id)))
          .limit(1);
        if (!genesisHouse.length) {
          return { logs: [], total: 0 };
        }
        houseId = genesisHouse[0].id;
      }

      const logs = await db
        .select()
        .from(vaultAccessLog)
        .where(eq(vaultAccessLog.houseId, houseId))
        .orderBy(desc(vaultAccessLog.accessedAt))
        .limit(input.limit);

      return {
        logs,
        total: logs.length,
      };
    }),

  // ============================================
  // GENESIS ACTIVATION
  // ============================================

  // Activate Genesis House and open system for public registration
  activateGenesis: protectedProcedure
    .input(
      z.object({
        vaultPin: z.string().min(6).max(20),
        confirmActivation: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireOwner(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      if (!input.confirmActivation) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Must confirm activation",
        });
      }

      // Verify vault PIN
      const configKey = `vault_pin_${ctx.user.id}`;
      const stored = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, configKey))
        .limit(1);

      if (!stored.length || !verifyVaultPin(input.vaultPin, ctx.user.id, stored[0].configValue)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid vault PIN" });
      }

      // Get Genesis House
      const genesisHouse = await db
        .select()
        .from(houses)
        .where(and(eq(houses.isGenesis, true), eq(houses.ownerUserId, ctx.user.id)))
        .limit(1);

      if (!genesisHouse.length) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Genesis House must be created first",
        });
      }

      // Check that family members have been added
      const vaultEntries = await db
        .select()
        .from(identityVault)
        .where(eq(identityVault.houseId, genesisHouse[0].id));

      if (vaultEntries.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "At least one family member must be added to the vault before activation",
        });
      }

      // Activate the House
      await db
        .update(houses)
        .set({ status: "active" })
        .where(eq(houses.id, genesisHouse[0].id));

      // Update user status to house_activated
      await db
        .update(users)
        .set({
          memberStatus: "house_activated",
          houseActivatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));

      // Set system_open flag
      const existingConfig = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, "system_open"))
        .limit(1);

      if (existingConfig.length > 0) {
        await db
          .update(systemConfig)
          .set({
            configValue: "true",
            updatedByUserId: ctx.user.id,
          })
          .where(eq(systemConfig.configKey, "system_open"));
      } else {
        await db.insert(systemConfig).values({
          configKey: "system_open",
          configValue: "true",
          configType: "boolean",
          description: "Whether the system is open for public registration. Set to true when Genesis House is activated.",
          updatedByUserId: ctx.user.id,
        });
      }

      // Set genesis_activated_at timestamp
      const existingTimestamp = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, "genesis_activated_at"))
        .limit(1);

      if (existingTimestamp.length === 0) {
        await db.insert(systemConfig).values({
          configKey: "genesis_activated_at",
          configValue: new Date().toISOString(),
          configType: "string",
          description: "Timestamp when Genesis House was activated",
          updatedByUserId: ctx.user.id,
        });
      }

      return {
        status: "GENESIS_ACTIVATED",
        systemOpen: true,
        activatedAt: new Date().toISOString(),
        houseId: genesisHouse[0].id,
        message: "Genesis House activated. The system is now open for public registration. All subsequent Houses will inherit the dual-layer identity protection.",
      };
    }),

  // Check if system is open for public registration
  isSystemOpen: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { systemOpen: false };

    const config = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.configKey, "system_open"))
      .limit(1);

    return {
      systemOpen: config.length > 0 && config[0].configValue === "true",
    };
  }),

  // ============================================
  // DISPLAY LAYER (Public-facing aliases)
  // ============================================

  // Get family members display layer only (no vault data)
  getFamilyDisplay: protectedProcedure
    .input(
      z.object({
        houseId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      let houseId = input.houseId;
      if (!houseId) {
        // Default to Genesis House for owner
        if (ctx.user.role === "owner" || ctx.user.role === "admin") {
          const genesisHouse = await db
            .select()
            .from(houses)
            .where(eq(houses.isGenesis, true))
            .limit(1);
          if (genesisHouse.length) {
            houseId = genesisHouse[0].id;
          }
        }
      }

      if (!houseId) {
        return { members: [] };
      }

      // Get vault entries (display layer only - no encrypted data)
      const entries = await db
        .select({
          id: identityVault.id,
          displayAlias: identityVault.displayAlias,
          displayRole: identityVault.displayRole,
          relationship: identityVault.relationship,
          inheritancePercentage: identityVault.inheritancePercentage,
          inheritanceOrder: identityVault.inheritanceOrder,
          status: identityVault.status,
        })
        .from(identityVault)
        .where(eq(identityVault.houseId, houseId));

      return {
        houseId,
        members: entries,
      };
    }),

  // Get Genesis family distribution template
  getDistributionTemplate: protectedProcedure.query(async ({ ctx }) => {
    requireOwner(ctx.user.role);
    return {
      distribution: GENESIS_FAMILY_DISTRIBUTION,
      totalAllocated: Object.values(GENESIS_FAMILY_DISTRIBUTION).reduce(
        (sum, d) => sum + d.percentage,
        0
      ),
      note: "Craig 10%, Amber 13%, Essence 13%, Amandes 13%, Cornelius 5% (flows to grandchildren), remainder (46%) to Future Beneficiaries.",
    };
  }),
});
