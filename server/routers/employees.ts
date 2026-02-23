import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { employees, businessEntities } from "../../drizzle/schema";
import { eq, desc, and, like, or, sql } from "drizzle-orm";

export const employeesRouter = router({
  /**
   * Get all employees with optional filters
   */
  getAll: protectedProcedure
    .input(z.object({
      entityId: z.number().optional(),
      department: z.string().optional(),
      status: z.enum(["active", "on_leave", "terminated", "pending"]).optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select({
        employee: employees,
        entity: {
          id: businessEntities.id,
          name: businessEntities.name,
        }
      })
      .from(employees)
      .leftJoin(businessEntities, eq(employees.entityId, businessEntities.id))
      .orderBy(desc(employees.createdAt));

      // Build conditions array
      const conditions = [];
      
      if (input?.entityId) {
        conditions.push(eq(employees.entityId, input.entityId));
      }
      
      if (input?.department) {
        conditions.push(eq(employees.department, input.department));
      }
      
      if (input?.status) {
        conditions.push(eq(employees.status, input.status));
      }
      
      if (input?.search) {
        const searchTerm = `%${input.search}%`;
        conditions.push(
          or(
            like(employees.firstName, searchTerm),
            like(employees.lastName, searchTerm),
            like(employees.email, searchTerm),
            like(employees.jobTitle, searchTerm)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      const results = await query;
      
      return results.map(r => ({
        ...r.employee,
        entityName: r.entity?.name || "Unknown Entity"
      }));
    }),

  /**
   * Get a single employee by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.select({
        employee: employees,
        entity: {
          id: businessEntities.id,
          name: businessEntities.name,
        }
      })
      .from(employees)
      .leftJoin(businessEntities, eq(employees.entityId, businessEntities.id))
      .where(eq(employees.id, input.id))
      .limit(1);

      if (!result.length) return null;
      
      return {
        ...result[0].employee,
        entityName: result[0].entity?.name || "Unknown Entity"
      };
    }),

  /**
   * Create a new employee
   */
  create: protectedProcedure
    .input(z.object({
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      preferredName: z.string().max(100).optional(),
      email: z.string().email().max(255),
      phone: z.string().max(50).optional(),
      entityId: z.number(),
      department: z.string().min(1).max(100),
      jobTitle: z.string().min(1).max(255),
      positionLevel: z.enum(["executive", "manager", "lead", "coordinator", "specialist", "intern"]),
      reportsTo: z.number().optional(),
      employmentType: z.enum(["full_time", "part_time", "contract", "intern"]).default("full_time"),
      workLocation: z.enum(["remote", "hybrid", "on_site"]).default("remote"),
      startDate: z.date(),
      bio: z.string().optional(),
      avatarUrl: z.string().max(500).optional(),
      linkedinUrl: z.string().max(255).optional(),
      status: z.enum(["active", "on_leave", "terminated", "pending"]).default("active"),
      userId: z.number().optional(),
      workerType: z.enum(["employee", "contractor", "volunteer"]).default("employee"),
      hourlyRate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(employees).values({
        firstName: input.firstName,
        lastName: input.lastName,
        preferredName: input.preferredName,
        email: input.email,
        phone: input.phone,
        entityId: input.entityId,
        department: input.department,
        jobTitle: input.jobTitle,
        positionLevel: input.positionLevel,
        reportsTo: input.reportsTo,
        employmentType: input.employmentType,
        workLocation: input.workLocation,
        startDate: input.startDate,
        bio: input.bio,
        avatarUrl: input.avatarUrl,
        linkedinUrl: input.linkedinUrl,
        status: input.status,
        userId: input.userId,
        workerType: input.workerType,
        hourlyRate: input.hourlyRate,
      });

      return { 
        success: true, 
        id: result[0].insertId,
        message: `Employee ${input.firstName} ${input.lastName} added successfully`
      };
    }),

  /**
   * Update an employee
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      firstName: z.string().min(1).max(100).optional(),
      lastName: z.string().min(1).max(100).optional(),
      preferredName: z.string().max(100).optional().nullable(),
      email: z.string().email().max(255).optional(),
      phone: z.string().max(50).optional().nullable(),
      entityId: z.number().optional(),
      department: z.string().min(1).max(100).optional(),
      jobTitle: z.string().min(1).max(255).optional(),
      positionLevel: z.enum(["executive", "manager", "lead", "coordinator", "specialist", "intern"]).optional(),
      reportsTo: z.number().optional().nullable(),
      employmentType: z.enum(["full_time", "part_time", "contract", "intern"]).optional(),
      workLocation: z.enum(["remote", "hybrid", "on_site"]).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional().nullable(),
      bio: z.string().optional().nullable(),
      avatarUrl: z.string().max(500).optional().nullable(),
      linkedinUrl: z.string().max(255).optional().nullable(),
      status: z.enum(["active", "on_leave", "terminated", "pending"]).optional(),
      userId: z.number().optional().nullable(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const { id, ...updateData } = input;
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      await db.update(employees)
        .set(cleanData)
        .where(eq(employees.id, id));

      return { success: true, message: "Employee updated successfully" };
    }),

  /**
   * Delete an employee
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(employees).where(eq(employees.id, input.id));

      return { success: true, message: "Employee deleted successfully" };
    }),

  /**
   * Get unique departments from employees
   */
  getDepartments: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const result = await db.selectDistinct({ department: employees.department })
      .from(employees)
      .where(eq(employees.status, "active"));

    return result.map(r => r.department);
  }),

  /**
   * Get employee statistics
   */
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, active: 0, byDepartment: [], byEntity: [] };

    const allEmployees = await db.select().from(employees);
    
    const total = allEmployees.length;
    const active = allEmployees.filter(e => e.status === "active").length;
    
    // Group by department
    const deptCounts: Record<string, number> = {};
    allEmployees.forEach(e => {
      if (e.status === "active") {
        deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
      }
    });
    const byDepartment = Object.entries(deptCounts).map(([name, count]) => ({ name, count }));

    // Group by entity
    const entityCounts: Record<number, number> = {};
    allEmployees.forEach(e => {
      if (e.status === "active") {
        entityCounts[e.entityId] = (entityCounts[e.entityId] || 0) + 1;
      }
    });
    
    // Get entity names
    const entities = await db.select().from(businessEntities);
    const entityMap = new Map(entities.map(e => [e.id, e.name]));
    
    const byEntity = Object.entries(entityCounts).map(([id, count]) => ({
      id: parseInt(id),
      name: entityMap.get(parseInt(id)) || "Unknown",
      count
    }));

    return { total, active, byDepartment, byEntity };
  }),

  /**
   * Get org chart data (employees with their reports)
   */
  getOrgChart: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const allEmployees = await db.select({
      employee: employees,
      entity: {
        id: businessEntities.id,
        name: businessEntities.name,
      }
    })
    .from(employees)
    .leftJoin(businessEntities, eq(employees.entityId, businessEntities.id))
    .where(eq(employees.status, "active"));

    return allEmployees.map(r => ({
      ...r.employee,
      entityName: r.entity?.name || "Unknown Entity"
    }));
  }),

  /**
   * Get current user's employee profile (self-service)
   */
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const result = await db.select({
      employee: employees,
      entity: {
        id: businessEntities.id,
        name: businessEntities.name,
      }
    })
    .from(employees)
    .leftJoin(businessEntities, eq(employees.entityId, businessEntities.id))
    .where(eq(employees.userId, ctx.user.id))
    .limit(1);

    if (!result.length) return null;
    
    return {
      ...result[0].employee,
      entityName: result[0].entity?.name || "Unknown Entity"
    };
  }),

  /**
   * Update current user's own profile (self-service - limited fields)
   */
  updateMyProfile: protectedProcedure
    .input(z.object({
      preferredName: z.string().max(100).optional().nullable(),
      phone: z.string().max(50).optional().nullable(),
      bio: z.string().optional().nullable(),
      avatarUrl: z.string().max(500).optional().nullable(),
      linkedinUrl: z.string().max(255).optional().nullable(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Find employee linked to current user
      const existing = await db.select()
        .from(employees)
        .where(eq(employees.userId, ctx.user.id))
        .limit(1);

      if (!existing.length) {
        throw new Error("No employee profile linked to your account");
      }

      // Only allow updating limited fields for self-service
      const cleanData = Object.fromEntries(
        Object.entries(input).filter(([_, v]) => v !== undefined)
      );

      await db.update(employees)
        .set(cleanData)
        .where(eq(employees.userId, ctx.user.id));

      return { success: true, message: "Profile updated successfully" };
    }),

  /**
   * Link an employee to a user account (admin only)
   */
  linkToUser: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(employees)
        .set({ userId: input.userId })
        .where(eq(employees.id, input.employeeId));

      return { success: true, message: "Employee linked to user account" };
    }),

  /**
   * Unlink an employee from a user account (admin only)
   */
  unlinkFromUser: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(employees)
        .set({ userId: null })
        .where(eq(employees.id, input.employeeId));

      return { success: true, message: "Employee unlinked from user account" };
    }),

  /**
   * Get employees that are not linked to any user account
   */
  getUnlinkedEmployees: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const result = await db.select({
      employee: employees,
      entity: {
        id: businessEntities.id,
        name: businessEntities.name,
      }
    })
    .from(employees)
    .leftJoin(businessEntities, eq(employees.entityId, businessEntities.id))
    .where(sql`${employees.userId} IS NULL`);

    return result.map(r => ({
      ...r.employee,
      entityName: r.entity?.name || "Unknown Entity"
    }));
  }),
});
