import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDepartments, getStaffByDepartment, getStaffByUser } from "../db";
import { eq } from "drizzle-orm";
import { departments, staffMembers } from "../../drizzle/schema";
import { getDb } from "../db";

export const organizationRouter = router({
  // Get all departments
  getDepartments: protectedProcedure.query(async () => {
    return await getDepartments();
  }),

  // Get staff in a specific department
  getStaffByDepartment: protectedProcedure
    .input(z.object({ departmentId: z.number() }))
    .query(async ({ input }) => {
      return await getStaffByDepartment(input.departmentId);
    }),

  // Get user's staff assignment
  getUserStaffAssignment: protectedProcedure.query(async ({ ctx }) => {
    return await getStaffByUser(ctx.user.id);
  }),

  // Create a new department (admin only)
  createDepartment: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can create departments");
      }

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(departments).values({
        name: input.name,
        description: input.description,
      });

      return result;
    }),

  // Assign staff to department (admin only)
  assignStaff: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        departmentId: z.number(),
        role: z.enum(["manager", "administrator", "admin_lead", "teacher", "staff"]),
        title: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can assign staff");
      }

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(staffMembers).values({
        userId: input.userId,
        departmentId: input.departmentId,
        role: input.role,
        title: input.title,
      });

      return result;
    }),

  // Get organizational overview (admin only)
  getOrganizationalOverview: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Only admins can view organizational overview");
    }

    const depts = await getDepartments();
    const staffByDept = await Promise.all(
      depts.map(async (dept) => ({
        ...dept,
        staff: await getStaffByDepartment(dept.id),
      }))
    );

    return {
      totalDepartments: depts.length,
      departments: staffByDept,
    };
  }),
});
