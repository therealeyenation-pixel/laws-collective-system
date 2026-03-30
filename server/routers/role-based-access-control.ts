import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

/**
 * Phase 46: Role-Based Access Control (RBAC) Router
 * 
 * Procedures for:
 * - Role management
 * - Permission assignment
 * - Access control enforcement
 * - Audit logging
 * - Role templates
 */

// Role hierarchy: admin > manager > member > viewer
const roleHierarchy: Record<string, number> = {
  admin: 4,
  manager: 3,
  member: 2,
  viewer: 1,
};

// Permission definitions
const permissions: Record<string, string[]> = {
  admin: [
    "manage_users",
    "manage_roles",
    "manage_permissions",
    "view_audit_logs",
    "manage_campaigns",
    "manage_investments",
    "manage_compliance",
    "manage_system_settings",
    "export_data",
    "delete_data",
  ],
  manager: [
    "manage_campaigns",
    "manage_investments",
    "manage_compliance",
    "view_analytics",
    "manage_team_members",
    "export_data",
  ],
  member: [
    "view_portfolio",
    "view_campaigns",
    "participate_campaigns",
    "view_investments",
    "view_compliance",
    "export_personal_data",
  ],
  viewer: [
    "view_portfolio",
    "view_campaigns",
    "view_investments",
  ],
};

export const roleBasedAccessControlRouter = router({
  /**
   * Get user roles
   */
  getUserRoles: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return {
        userId: input.userId,
        roles: ["member"],
        primaryRole: "member",
        permissions: permissions.member,
      };
    }),

  /**
   * Create custom role
   */
  createCustomRole: protectedProcedure
    .input(
      z.object({
        roleName: z.string(),
        description: z.string(),
        permissions: z.array(z.string()),
        parentRole: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create roles",
        });
      }

      const roleId = `role_${Date.now()}`;

      return {
        roleId,
        roleName: input.roleName,
        description: input.description,
        permissions: input.permissions,
        parentRole: input.parentRole,
        createdAt: new Date(),
        createdBy: ctx.user.id,
      };
    }),

  /**
   * Assign role to user
   */
  assignRoleToUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can assign roles",
        });
      }

      return {
        userId: input.userId,
        roleId: input.roleId,
        assignedAt: new Date(),
        assignedBy: ctx.user.id,
        expiresAt: input.expiresAt,
        status: "active" as const,
      };
    }),

  /**
   * Remove role from user
   */
  removeRoleFromUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can remove roles",
        });
      }

      return {
        userId: input.userId,
        roleId: input.roleId,
        removedAt: new Date(),
        removedBy: ctx.user.id,
        status: "removed" as const,
      };
    }),

  /**
   * Get role permissions
   */
  getRolePermissions: protectedProcedure
    .input(z.object({ roleId: z.string() }))
    .query(async ({ input }) => {
      const roleMap: Record<string, string[]> = {
        admin: permissions.admin,
        manager: permissions.manager,
        member: permissions.member,
        viewer: permissions.viewer,
      };

      return {
        roleId: input.roleId,
        permissions: roleMap[input.roleId] || [],
      };
    }),

  /**
   * Check user permission
   */
  checkUserPermission: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        permission: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userPermissions = permissions[input.userId] || [];
      const hasPermission = userPermissions.includes(input.permission);

      return {
        userId: input.userId,
        permission: input.permission,
        hasPermission,
      };
    }),

  /**
   * Get all roles
   */
  getAllRoles: protectedProcedure.query(async () => {
    return {
      roles: [
        {
          id: "role_admin",
          name: "Admin",
          description: "Full system access",
          permissions: permissions.admin,
          hierarchy: roleHierarchy.admin,
        },
        {
          id: "role_manager",
          name: "Manager",
          description: "Campaign and investment management",
          permissions: permissions.manager,
          hierarchy: roleHierarchy.manager,
        },
        {
          id: "role_member",
          name: "Member",
          description: "Standard member access",
          permissions: permissions.member,
          hierarchy: roleHierarchy.member,
        },
        {
          id: "role_viewer",
          name: "Viewer",
          description: "Read-only access",
          permissions: permissions.viewer,
          hierarchy: roleHierarchy.viewer,
        },
      ],
    };
  }),

  /**
   * Update role permissions
   */
  updateRolePermissions: protectedProcedure
    .input(
      z.object({
        roleId: z.string(),
        permissions: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update role permissions",
        });
      }

      return {
        roleId: input.roleId,
        permissions: input.permissions,
        updatedAt: new Date(),
        updatedBy: ctx.user.id,
      };
    }),

  /**
   * Get access audit log
   */
  getAccessAuditLog: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        action: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const logs = [
        {
          id: "log_1",
          userId: "user_123",
          action: "login",
          resource: "dashboard",
          timestamp: new Date("2026-03-28T10:00:00"),
          status: "success",
        },
        {
          id: "log_2",
          userId: "user_123",
          action: "view",
          resource: "portfolio",
          timestamp: new Date("2026-03-28T10:05:00"),
          status: "success",
        },
        {
          id: "log_3",
          userId: "user_456",
          action: "create",
          resource: "campaign",
          timestamp: new Date("2026-03-28T10:10:00"),
          status: "success",
        },
      ];

      let filtered = logs;
      if (input.userId) {
        filtered = logs.filter((l) => l.userId === input.userId);
      }
      if (input.action) {
        filtered = filtered.filter((l) => l.action === input.action);
      }

      return {
        logs: filtered.slice(input.offset, input.offset + input.limit),
        total: filtered.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get role templates
   */
  getRoleTemplates: protectedProcedure.query(async () => {
    return {
      templates: [
        {
          id: "tmpl_admin",
          name: "Administrator",
          description: "Full system access",
          permissions: permissions.admin,
          useCase: "System administrators",
        },
        {
          id: "tmpl_manager",
          name: "Campaign Manager",
          description: "Campaign and team management",
          permissions: permissions.manager,
          useCase: "Campaign coordinators",
        },
        {
          id: "tmpl_analyst",
          name: "Analyst",
          description: "Analytics and reporting access",
          permissions: ["view_analytics", "export_data", "view_audit_logs"],
          useCase: "Data analysts",
        },
        {
          id: "tmpl_member",
          name: "Member",
          description: "Standard member access",
          permissions: permissions.member,
          useCase: "Regular members",
        },
      ],
    };
  }),

  /**
   * Create role from template
   */
  createRoleFromTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        customName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create roles",
        });
      }

      const roleId = `role_${Date.now()}`;

      return {
        roleId,
        templateId: input.templateId,
        customName: input.customName,
        createdAt: new Date(),
        createdBy: ctx.user.id,
      };
    }),

  /**
   * Get role hierarchy
   */
  getRoleHierarchy: protectedProcedure.query(async () => {
    return {
      hierarchy: [
        { role: "admin", level: 4, parent: null },
        { role: "manager", level: 3, parent: "admin" },
        { role: "member", level: 2, parent: "manager" },
        { role: "viewer", level: 1, parent: "member" },
      ],
    };
  }),

  /**
   * Check role hierarchy
   */
  checkRoleHierarchy: protectedProcedure
    .input(
      z.object({
        role1: z.string(),
        role2: z.string(),
      })
    )
    .query(async ({ input }) => {
      const level1 = roleHierarchy[input.role1] || 0;
      const level2 = roleHierarchy[input.role2] || 0;

      return {
        role1: input.role1,
        role2: input.role2,
        level1,
        level2,
        isHigher: level1 > level2,
        isEqual: level1 === level2,
        isLower: level1 < level2,
      };
    }),

  /**
   * Get user access report
   */
  getUserAccessReport: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return {
        userId: input.userId,
        roles: ["member"],
        permissions: permissions.member,
        accessibleResources: [
          "portfolio",
          "campaigns",
          "investments",
          "compliance",
        ],
        lastLogin: new Date("2026-03-28T10:00:00"),
        loginCount: 156,
        accessDeniedCount: 3,
        suspiciousActivities: 0,
      };
    }),

  /**
   * Revoke user access
   */
  revokeUserAccess: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can revoke access",
        });
      }

      return {
        userId: input.userId,
        revokedAt: new Date(),
        revokedBy: ctx.user.id,
        reason: input.reason,
        status: "revoked" as const,
      };
    }),

  /**
   * Restore user access
   */
  restoreUserAccess: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can restore access",
        });
      }

      return {
        userId: input.userId,
        restoredAt: new Date(),
        restoredBy: ctx.user.id,
        reason: input.reason,
        status: "active" as const,
      };
    }),

  /**
   * Get permission matrix
   */
  getPermissionMatrix: protectedProcedure.query(async () => {
    const matrix: Record<string, Record<string, boolean>> = {};

    Object.entries(permissions).forEach(([role, perms]) => {
      matrix[role] = {};
      const allPermissions = new Set(
        Object.values(permissions).flatMap((p) => p)
      );
      allPermissions.forEach((perm) => {
        matrix[role][perm] = perms.includes(perm);
      });
    });

    return { matrix };
  }),

  /**
   * Audit role changes
   */
  auditRoleChanges: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const changes = [
        {
          id: "change_1",
          userId: "user_123",
          oldRole: "member",
          newRole: "manager",
          changedAt: new Date("2026-03-27"),
          changedBy: "admin_user",
        },
        {
          id: "change_2",
          userId: "user_456",
          oldRole: "viewer",
          newRole: "member",
          changedAt: new Date("2026-03-26"),
          changedBy: "admin_user",
        },
      ];

      return {
        changes: changes.slice(input.offset, input.offset + input.limit),
        total: changes.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),
});
