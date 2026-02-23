import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getAllUsers, updateUserRole } from "../db";

export const adminUsersRouter = router({
  // Get all users - admin only
  list: adminProcedure.query(async () => {
    const users = await getAllUsers();
    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginMethod: user.loginMethod,
      lastSignedIn: user.lastSignedIn,
      createdAt: user.createdAt,
    }));
  }),

  // Update user role - admin only
  updateRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "staff", "admin", "owner"]),
    }))
    .mutation(async ({ input }) => {
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),

  // Get current user's role
  myRole: protectedProcedure.query(async ({ ctx }) => {
    return {
      role: ctx.user.role,
      isAdmin: ctx.user.role === "admin" || ctx.user.role === "owner",
      isOwner: ctx.user.role === "owner",
    };
  }),
});
