import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  softwareLicenseCategories,
  softwareLicenses,
  softwareLicenseAssignments,
  softwareVendorContracts,
} from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const softwareLicensesRouter = router({
  // Categories
  getCategories: protectedProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(softwareLicenseCategories).orderBy(softwareLicenseCategories.name);
  }),

  createCategory: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      department: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [result] = await db.insert(softwareLicenseCategories).values(input);
      return { id: result.insertId, ...input };
    }),

  seedCategories: protectedProcedure.mutation(async () => {
    const db = await getDb();
    const existing = await db.select().from(softwareLicenseCategories);
    if (existing.length > 0) {
      return { message: "Categories already seeded", count: existing.length };
    }

    const categories = [
      { name: "Music Production", description: "DAWs, plugins, virtual instruments", department: "Creative Enterprise", icon: "music" },
      { name: "Visual Art & Design", description: "Image editing, vector graphics, illustration", department: "Design Department", icon: "palette" },
      { name: "Video & Film Production", description: "Video editing, color grading, VFX", department: "Real-Eye-Nation", icon: "video" },
      { name: "3D & Animation", description: "3D modeling, animation, rendering", department: "Design Department", icon: "cube" },
      { name: "AI & Machine Learning", description: "AI image generation, voice synthesis, automation", department: "All Departments", icon: "brain" },
      { name: "Office & Productivity", description: "Document creation, spreadsheets, presentations", department: "Executive", icon: "briefcase" },
      { name: "Project Management", description: "Task tracking, collaboration, planning", department: "Executive", icon: "clipboard" },
      { name: "Development Tools", description: "IDEs, code editors, version control", department: "Technology", icon: "code" },
      { name: "Communication", description: "Video conferencing, messaging, email", department: "All Departments", icon: "message-circle" },
      { name: "Accounting & Finance", description: "Bookkeeping, invoicing, financial reporting", department: "Finance", icon: "calculator" },
    ];

    for (const cat of categories) {
      await db.insert(softwareLicenseCategories).values(cat);
    }

    return { message: "Categories seeded successfully", count: categories.length };
  }),

  // Licenses
  getLicenses: protectedProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(softwareLicenses).orderBy(desc(softwareLicenses.createdAt));
  }),

  getLicenseById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [license] = await db.select().from(softwareLicenses).where(eq(softwareLicenses.id, input.id));
      if (!license) throw new TRPCError({ code: "NOT_FOUND", message: "License not found" });
      return license;
    }),

  createLicense: protectedProcedure
    .input(z.object({
      categoryId: z.number().optional(),
      name: z.string().min(1),
      vendor: z.string().min(1),
      version: z.string().optional(),
      licenseType: z.enum(["subscription", "perpetual", "floating", "site", "open_source"]).default("subscription"),
      licenseKey: z.string().optional(),
      totalSeats: z.number().default(1),
      costPerSeat: z.number().optional(),
      totalCost: z.number().optional(),
      billingCycle: z.enum(["monthly", "annual", "one_time"]).default("annual"),
      purchaseDate: z.string().optional(),
      renewalDate: z.string().optional(),
      expirationDate: z.string().optional(),
      status: z.enum(["active", "expired", "cancelled", "pending"]).default("active"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const values: any = {
        ...input,
        costPerSeat: input.costPerSeat?.toString(),
        totalCost: input.totalCost?.toString(),
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : undefined,
        renewalDate: input.renewalDate ? new Date(input.renewalDate) : undefined,
        expirationDate: input.expirationDate ? new Date(input.expirationDate) : undefined,
      };
      const [result] = await db.insert(softwareLicenses).values(values);
      return { id: result.insertId, ...input };
    }),

  updateLicense: protectedProcedure
    .input(z.object({
      id: z.number(),
      categoryId: z.number().optional(),
      name: z.string().optional(),
      vendor: z.string().optional(),
      version: z.string().optional(),
      licenseType: z.enum(["subscription", "perpetual", "floating", "site", "open_source"]).optional(),
      licenseKey: z.string().optional(),
      totalSeats: z.number().optional(),
      usedSeats: z.number().optional(),
      costPerSeat: z.number().optional(),
      totalCost: z.number().optional(),
      billingCycle: z.enum(["monthly", "annual", "one_time"]).optional(),
      purchaseDate: z.string().optional(),
      renewalDate: z.string().optional(),
      expirationDate: z.string().optional(),
      status: z.enum(["active", "expired", "cancelled", "pending"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...updates } = input;
      const values: any = { ...updates };
      if (updates.costPerSeat !== undefined) values.costPerSeat = updates.costPerSeat.toString();
      if (updates.totalCost !== undefined) values.totalCost = updates.totalCost.toString();
      if (updates.purchaseDate) values.purchaseDate = new Date(updates.purchaseDate);
      if (updates.renewalDate) values.renewalDate = new Date(updates.renewalDate);
      if (updates.expirationDate) values.expirationDate = new Date(updates.expirationDate);
      
      await db.update(softwareLicenses).set(values).where(eq(softwareLicenses.id, id));
      return { success: true };
    }),

  deleteLicense: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.delete(softwareLicenses).where(eq(softwareLicenses.id, input.id));
      return { success: true };
    }),

  // Assignments
  getAssignments: protectedProcedure
    .input(z.object({ licenseId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (input?.licenseId) {
        return db.select().from(softwareLicenseAssignments)
          .where(eq(softwareLicenseAssignments.licenseId, input.licenseId))
          .orderBy(desc(softwareLicenseAssignments.assignedDate));
      }
      return db.select().from(softwareLicenseAssignments).orderBy(desc(softwareLicenseAssignments.assignedDate));
    }),

  createAssignment: protectedProcedure
    .input(z.object({
      licenseId: z.number(),
      assignedTo: z.string().min(1),
      assignedType: z.enum(["user", "department", "role"]).default("user"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      const [license] = await db.select().from(softwareLicenses).where(eq(softwareLicenses.id, input.licenseId));
      if (!license) throw new TRPCError({ code: "NOT_FOUND", message: "License not found" });
      if (license.usedSeats >= license.totalSeats) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No available seats" });
      }

      const [result] = await db.insert(softwareLicenseAssignments).values(input);
      
      await db.update(softwareLicenses)
        .set({ usedSeats: license.usedSeats + 1 })
        .where(eq(softwareLicenses.id, input.licenseId));

      return { id: result.insertId, ...input };
    }),

  revokeAssignment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      
      const [assignment] = await db.select().from(softwareLicenseAssignments)
        .where(eq(softwareLicenseAssignments.id, input.id));
      if (!assignment) throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });

      await db.update(softwareLicenseAssignments)
        .set({ status: "revoked", revokedDate: new Date() })
        .where(eq(softwareLicenseAssignments.id, input.id));

      const [license] = await db.select().from(softwareLicenses)
        .where(eq(softwareLicenses.id, assignment.licenseId));
      if (license && license.usedSeats > 0) {
        await db.update(softwareLicenses)
          .set({ usedSeats: license.usedSeats - 1 })
          .where(eq(softwareLicenses.id, assignment.licenseId));
      }

      return { success: true };
    }),

  // Vendor Contracts
  getContracts: protectedProcedure.query(async () => {
    const db = await getDb();
    return db.select().from(softwareVendorContracts).orderBy(desc(softwareVendorContracts.createdAt));
  }),

  createContract: protectedProcedure
    .input(z.object({
      vendorName: z.string().min(1),
      contractType: z.enum(["enterprise", "volume", "support", "maintenance"]).default("enterprise"),
      contractNumber: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      annualValue: z.number().optional(),
      supportLevel: z.enum(["basic", "standard", "premium", "enterprise"]).default("standard"),
      contactName: z.string().optional(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["active", "expired", "pending_renewal"]).default("active"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const values: any = {
        ...input,
        annualValue: input.annualValue?.toString(),
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      };
      const [result] = await db.insert(softwareVendorContracts).values(values);
      return { id: result.insertId, ...input };
    }),

  // Stats
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    const licenses = await db.select().from(softwareLicenses);
    const contracts = await db.select().from(softwareVendorContracts);
    const categories = await db.select().from(softwareLicenseCategories);

    const totalLicenses = licenses.length;
    const activeLicenses = licenses.filter(l => l.status === "active").length;
    const totalSeats = licenses.reduce((sum, l) => sum + (l.totalSeats || 0), 0);
    const usedSeats = licenses.reduce((sum, l) => sum + (l.usedSeats || 0), 0);
    
    const monthlyTotal = licenses
      .filter(l => l.billingCycle === "monthly" && l.status === "active")
      .reduce((sum, l) => sum + parseFloat(l.totalCost?.toString() || "0"), 0);
    
    const annualTotal = licenses
      .filter(l => l.billingCycle === "annual" && l.status === "active")
      .reduce((sum, l) => sum + parseFloat(l.totalCost?.toString() || "0"), 0);

    const activeContracts = contracts.filter(c => c.status === "active").length;
    const contractValue = contracts
      .filter(c => c.status === "active")
      .reduce((sum, c) => sum + parseFloat(c.annualValue?.toString() || "0"), 0);

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringLicenses = licenses.filter(l => {
      if (!l.expirationDate) return false;
      const expDate = new Date(l.expirationDate);
      return expDate >= now && expDate <= thirtyDaysFromNow;
    }).length;

    return {
      totalLicenses,
      activeLicenses,
      totalSeats,
      usedSeats,
      availableSeats: totalSeats - usedSeats,
      monthlyTotal,
      annualTotal,
      totalAnnualCost: monthlyTotal * 12 + annualTotal,
      activeContracts,
      contractValue,
      expiringLicenses,
      totalCategories: categories.length,
    };
  }),

  getBudgetForecast: protectedProcedure.query(async () => {
    const db = await getDb();
    const licenses = await db.select().from(softwareLicenses);
    const contracts = await db.select().from(softwareVendorContracts);

    const monthlyLicenseCost = licenses
      .filter(l => l.billingCycle === "monthly" && l.status === "active")
      .reduce((sum, l) => sum + parseFloat(l.totalCost?.toString() || "0"), 0);

    const annualLicenseCost = licenses
      .filter(l => l.billingCycle === "annual" && l.status === "active")
      .reduce((sum, l) => sum + parseFloat(l.totalCost?.toString() || "0"), 0);

    const contractCost = contracts
      .filter(c => c.status === "active")
      .reduce((sum, c) => sum + parseFloat(c.annualValue?.toString() || "0"), 0);

    const totalAnnualCost = (monthlyLicenseCost * 12) + annualLicenseCost + contractCost;

    return {
      monthlyLicenseCost,
      annualLicenseCost,
      contractCost,
      totalAnnualCost,
      grantLineItem: {
        category: "Technology & Equipment",
        subcategory: "Software Licenses & Subscriptions",
        amount: totalAnnualCost,
        description: "Software licenses and vendor contracts for creative production, design, and business operations",
        justification: "Essential tools for program delivery, content creation, and organizational management",
      },
    };
  }),
});
