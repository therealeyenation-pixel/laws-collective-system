import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { externalBusinesses } from "../../drizzle/schema";
import { eq, and, like, desc, asc, sql } from "drizzle-orm";

export const externalBusinessesRouter = router({
  // List all external businesses for the current user
  list: protectedProcedure
    .input(z.object({
      type: z.enum(["vendor", "partner", "contractor", "client", "supplier", "consultant", "agency", "other", "all"]).optional().default("all"),
      status: z.enum(["active", "inactive", "pending", "blacklisted", "all"]).optional().default("all"),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const filters = input || { type: "all", status: "all", limit: 50, offset: 0 };
      
      let query = db.select().from(externalBusinesses)
        .where(eq(externalBusinesses.userId, ctx.user.openId));
      
      // Apply type filter
      if (filters.type && filters.type !== "all") {
        query = query.where(and(
          eq(externalBusinesses.userId, ctx.user.openId),
          eq(externalBusinesses.type, filters.type)
        ));
      }
      
      // Apply status filter
      if (filters.status && filters.status !== "all") {
        query = query.where(and(
          eq(externalBusinesses.userId, ctx.user.openId),
          eq(externalBusinesses.status, filters.status)
        ));
      }
      
      const results = await query
        .orderBy(desc(externalBusinesses.createdAt))
        .limit(filters.limit)
        .offset(filters.offset);
      
      // Get total count
      const [countResult] = await db.select({ count: sql<number>`count(*)` })
        .from(externalBusinesses)
        .where(eq(externalBusinesses.userId, ctx.user.openId));
      
      return {
        businesses: results,
        total: countResult?.count || 0,
        limit: filters.limit,
        offset: filters.offset,
      };
    }),

  // Get a single external business by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const [business] = await db.select().from(externalBusinesses)
        .where(and(
          eq(externalBusinesses.id, input.id),
          eq(externalBusinesses.userId, ctx.user.openId)
        ));
      
      return business || null;
    }),

  // Create a new external business
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      type: z.enum(["vendor", "partner", "contractor", "client", "supplier", "consultant", "agency", "other"]),
      industry: z.string().max(255).optional(),
      contactName: z.string().max(255).optional(),
      contactEmail: z.string().email().optional().or(z.literal("")),
      contactPhone: z.string().max(50).optional(),
      website: z.string().max(500).optional(),
      address: z.string().optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(50).optional(),
      zipCode: z.string().max(20).optional(),
      country: z.string().max(100).optional(),
      ein: z.string().max(20).optional(),
      dunsNumber: z.string().max(20).optional(),
      notes: z.string().optional(),
      status: z.enum(["active", "inactive", "pending", "blacklisted"]).optional().default("active"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      const [result] = await db.insert(externalBusinesses).values({
        userId: ctx.user.openId,
        name: input.name,
        type: input.type,
        industry: input.industry || null,
        contactName: input.contactName || null,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        website: input.website || null,
        address: input.address || null,
        city: input.city || null,
        state: input.state || null,
        zipCode: input.zipCode || null,
        country: input.country || "USA",
        ein: input.ein || null,
        dunsNumber: input.dunsNumber || null,
        notes: input.notes || null,
        status: input.status,
      });
      
      return { id: result.insertId, success: true };
    }),

  // Update an external business
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      type: z.enum(["vendor", "partner", "contractor", "client", "supplier", "consultant", "agency", "other"]).optional(),
      industry: z.string().max(255).optional(),
      contactName: z.string().max(255).optional(),
      contactEmail: z.string().email().optional().or(z.literal("")),
      contactPhone: z.string().max(50).optional(),
      website: z.string().max(500).optional(),
      address: z.string().optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(50).optional(),
      zipCode: z.string().max(20).optional(),
      country: z.string().max(100).optional(),
      ein: z.string().max(20).optional(),
      dunsNumber: z.string().max(20).optional(),
      notes: z.string().optional(),
      status: z.enum(["active", "inactive", "pending", "blacklisted"]).optional(),
      rating: z.number().min(0).max(5).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const { id, ...updateData } = input;
      
      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );
      
      if (Object.keys(cleanData).length === 0) {
        return { success: false, message: "No fields to update" };
      }
      
      await db.update(externalBusinesses)
        .set(cleanData)
        .where(and(
          eq(externalBusinesses.id, id),
          eq(externalBusinesses.userId, ctx.user.openId)
        ));
      
      return { success: true };
    }),

  // Delete an external business
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      await db.delete(externalBusinesses)
        .where(and(
          eq(externalBusinesses.id, input.id),
          eq(externalBusinesses.userId, ctx.user.openId)
        ));
      
      return { success: true };
    }),

  // Search external businesses
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      type: z.enum(["vendor", "partner", "contractor", "client", "supplier", "consultant", "agency", "other", "all"]).optional().default("all"),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      
      const searchPattern = `%${input.query}%`;
      
      let results = await db.select().from(externalBusinesses)
        .where(and(
          eq(externalBusinesses.userId, ctx.user.openId),
          like(externalBusinesses.name, searchPattern)
        ))
        .orderBy(asc(externalBusinesses.name))
        .limit(20);
      
      if (input.type !== "all") {
        results = results.filter(b => b.type === input.type);
      }
      
      return results;
    }),

  // Get statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      
      const businesses = await db.select().from(externalBusinesses)
        .where(eq(externalBusinesses.userId, ctx.user.openId));
      
      const stats = {
        total: businesses.length,
        byType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        totalSpend: 0,
        totalContracts: 0,
      };
      
      for (const b of businesses) {
        stats.byType[b.type] = (stats.byType[b.type] || 0) + 1;
        stats.byStatus[b.status] = (stats.byStatus[b.status] || 0) + 1;
        stats.totalSpend += parseFloat(b.totalSpend || "0");
        stats.totalContracts += b.totalContracts || 0;
      }
      
      return stats;
    }),
});
