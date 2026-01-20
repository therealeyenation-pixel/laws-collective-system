import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

// Property Management Router
export const propertyManagementRouter = router({
  // List properties
  listProperties: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      propertyType: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const filters = input || {};
      const rows = await db.execute(
        sql`SELECT * FROM properties 
            WHERE 1=1 
            ${filters.status ? sql`AND status = ${filters.status}` : sql``}
            ${filters.propertyType ? sql`AND propertyType = ${filters.propertyType}` : sql``}
            ${filters.search ? sql`AND (propertyName LIKE ${`%${filters.search}%`} OR streetAddress LIKE ${`%${filters.search}%`} OR city LIKE ${`%${filters.search}%`})` : sql``}
            ORDER BY createdAt DESC 
            LIMIT ${filters.limit} OFFSET ${filters.offset}`
      );
      
      const countResult = await db.execute(
        sql`SELECT COUNT(*) as total FROM properties 
            WHERE 1=1
            ${filters.status ? sql`AND status = ${filters.status}` : sql``}
            ${filters.propertyType ? sql`AND propertyType = ${filters.propertyType}` : sql``}
            ${filters.search ? sql`AND (propertyName LIKE ${`%${filters.search}%`} OR streetAddress LIKE ${`%${filters.search}%`} OR city LIKE ${`%${filters.search}%`})` : sql``}`
      );
      
      return { properties: rows as any[], total: (countResult as any)[0]?.total || 0 };
    }),

  // Get property with details
  getProperty: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const rows = await db.execute(sql`SELECT * FROM properties WHERE id = ${input.id}`);
      const property = (rows as any[])[0];
      if (!property) return null;
      
      const projects = await db.execute(sql`SELECT * FROM property_projects WHERE propertyId = ${input.id} ORDER BY createdAt DESC`);
      const tenants = await db.execute(sql`SELECT * FROM property_tenants WHERE propertyId = ${input.id} AND status = 'active'`);
      const maintenance = await db.execute(sql`SELECT * FROM property_maintenance_logs WHERE propertyId = ${input.id} ORDER BY reportedDate DESC LIMIT 10`);
      const utilities = await db.execute(sql`SELECT * FROM property_utilities WHERE propertyId = ${input.id} AND status = 'active'`);
      const financials = await db.execute(sql`SELECT * FROM property_financials WHERE propertyId = ${input.id} ORDER BY year DESC, month DESC LIMIT 12`);
      
      return { 
        ...property, 
        projects: projects as any[], 
        tenants: tenants as any[], 
        maintenance: maintenance as any[], 
        utilities: utilities as any[], 
        financials: financials as any[] 
      };
    }),

  // Create property
  createProperty: protectedProcedure
    .input(z.object({
      propertyName: z.string().min(1),
      streetAddress: z.string().min(1),
      unit: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      zipCode: z.string().min(1),
      county: z.string().optional(),
      country: z.string().default("USA"),
      propertyType: z.string(),
      propertySubType: z.string().optional(),
      houseId: z.number().optional(),
      entityId: z.number().optional(),
      propertyCode: z.string().optional(),
      yearBuilt: z.number().optional(),
      squareFootage: z.number().optional(),
      lotSize: z.number().optional(),
      bedrooms: z.number().optional(),
      bathrooms: z.number().optional(),
      stories: z.number().optional(),
      garageSpaces: z.number().optional(),
      status: z.string().default("active"),
      occupancyStatus: z.string().default("vacant"),
      purchasePrice: z.number().optional(),
      purchaseDate: z.string().optional(),
      currentValue: z.number().optional(),
      hasMortgage: z.boolean().default(false),
      mortgageBalance: z.number().optional(),
      mortgagePayment: z.number().optional(),
      mortgageLender: z.string().optional(),
      mortgageInterestRate: z.number().optional(),
      insuranceProvider: z.string().optional(),
      insurancePolicyNumber: z.string().optional(),
      insurancePremium: z.number().optional(),
      parcelNumber: z.string().optional(),
      annualPropertyTax: z.number().optional(),
      taxAssessedValue: z.number().optional(),
      deedType: z.string().optional(),
      titleCompany: z.string().optional(),
      zoningClassification: z.string().optional(),
      description: z.string().optional(),
      notes: z.string().optional(),
      primaryPhotoUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.execute(sql`
        INSERT INTO properties (propertyName, streetAddress, unit, city, state, zipCode, county, country, propertyType, propertySubType, houseId, entityId, propertyCode, yearBuilt, squareFootage, lotSize, bedrooms, bathrooms, stories, garageSpaces, status, occupancyStatus, purchasePrice, purchaseDate, currentValue, hasMortgage, mortgageBalance, mortgagePayment, mortgageLender, mortgageInterestRate, insuranceProvider, insurancePolicyNumber, insurancePremium, parcelNumber, annualPropertyTax, taxAssessedValue, deedType, titleCompany, zoningClassification, description, notes, primaryPhotoUrl)
        VALUES (${input.propertyName}, ${input.streetAddress}, ${input.unit || null}, ${input.city}, ${input.state}, ${input.zipCode}, ${input.county || null}, ${input.country}, ${input.propertyType}, ${input.propertySubType || null}, ${input.houseId || null}, ${input.entityId || null}, ${input.propertyCode || null}, ${input.yearBuilt || null}, ${input.squareFootage || null}, ${input.lotSize || null}, ${input.bedrooms || null}, ${input.bathrooms || null}, ${input.stories || null}, ${input.garageSpaces || null}, ${input.status}, ${input.occupancyStatus}, ${input.purchasePrice || null}, ${input.purchaseDate ? new Date(input.purchaseDate) : null}, ${input.currentValue || null}, ${input.hasMortgage}, ${input.mortgageBalance || null}, ${input.mortgagePayment || null}, ${input.mortgageLender || null}, ${input.mortgageInterestRate || null}, ${input.insuranceProvider || null}, ${input.insurancePolicyNumber || null}, ${input.insurancePremium || null}, ${input.parcelNumber || null}, ${input.annualPropertyTax || null}, ${input.taxAssessedValue || null}, ${input.deedType || null}, ${input.titleCompany || null}, ${input.zoningClassification || null}, ${input.description || null}, ${input.notes || null}, ${input.primaryPhotoUrl || null})
      `);
      return { id: (result as any).insertId, propertyName: input.propertyName, success: true };
    }),

  // Update property
  updateProperty: protectedProcedure
    .input(z.object({
      id: z.number(),
      propertyName: z.string().optional(),
      streetAddress: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      propertyType: z.string().optional(),
      status: z.string().optional(),
      occupancyStatus: z.string().optional(),
      yearBuilt: z.number().optional(),
      squareFootage: z.number().optional(),
      bedrooms: z.number().optional(),
      bathrooms: z.number().optional(),
      purchasePrice: z.number().optional(),
      currentValue: z.number().optional(),
      hasMortgage: z.boolean().optional(),
      mortgageBalance: z.number().optional(),
      mortgagePayment: z.number().optional(),
      description: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...updates } = input;
      await db.execute(sql`UPDATE properties SET updatedAt = NOW() WHERE id = ${id}`);
      
      // Update each field if provided
      if (updates.propertyName !== undefined) await db.execute(sql`UPDATE properties SET propertyName = ${updates.propertyName} WHERE id = ${id}`);
      if (updates.streetAddress !== undefined) await db.execute(sql`UPDATE properties SET streetAddress = ${updates.streetAddress} WHERE id = ${id}`);
      if (updates.city !== undefined) await db.execute(sql`UPDATE properties SET city = ${updates.city} WHERE id = ${id}`);
      if (updates.state !== undefined) await db.execute(sql`UPDATE properties SET state = ${updates.state} WHERE id = ${id}`);
      if (updates.zipCode !== undefined) await db.execute(sql`UPDATE properties SET zipCode = ${updates.zipCode} WHERE id = ${id}`);
      if (updates.propertyType !== undefined) await db.execute(sql`UPDATE properties SET propertyType = ${updates.propertyType} WHERE id = ${id}`);
      if (updates.status !== undefined) await db.execute(sql`UPDATE properties SET status = ${updates.status} WHERE id = ${id}`);
      if (updates.occupancyStatus !== undefined) await db.execute(sql`UPDATE properties SET occupancyStatus = ${updates.occupancyStatus} WHERE id = ${id}`);
      if (updates.yearBuilt !== undefined) await db.execute(sql`UPDATE properties SET yearBuilt = ${updates.yearBuilt} WHERE id = ${id}`);
      if (updates.squareFootage !== undefined) await db.execute(sql`UPDATE properties SET squareFootage = ${updates.squareFootage} WHERE id = ${id}`);
      if (updates.bedrooms !== undefined) await db.execute(sql`UPDATE properties SET bedrooms = ${updates.bedrooms} WHERE id = ${id}`);
      if (updates.bathrooms !== undefined) await db.execute(sql`UPDATE properties SET bathrooms = ${updates.bathrooms} WHERE id = ${id}`);
      if (updates.purchasePrice !== undefined) await db.execute(sql`UPDATE properties SET purchasePrice = ${updates.purchasePrice} WHERE id = ${id}`);
      if (updates.currentValue !== undefined) await db.execute(sql`UPDATE properties SET currentValue = ${updates.currentValue} WHERE id = ${id}`);
      if (updates.hasMortgage !== undefined) await db.execute(sql`UPDATE properties SET hasMortgage = ${updates.hasMortgage} WHERE id = ${id}`);
      if (updates.mortgageBalance !== undefined) await db.execute(sql`UPDATE properties SET mortgageBalance = ${updates.mortgageBalance} WHERE id = ${id}`);
      if (updates.mortgagePayment !== undefined) await db.execute(sql`UPDATE properties SET mortgagePayment = ${updates.mortgagePayment} WHERE id = ${id}`);
      if (updates.description !== undefined) await db.execute(sql`UPDATE properties SET description = ${updates.description} WHERE id = ${id}`);
      if (updates.notes !== undefined) await db.execute(sql`UPDATE properties SET notes = ${updates.notes} WHERE id = ${id}`);
      
      return { success: true };
    }),

  // Delete property
  deleteProperty: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.execute(sql`DELETE FROM properties WHERE id = ${input.id}`);
      return { success: true };
    }),

  // Get property stats
  getPropertyStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const totalResult = await db.execute(sql`SELECT COUNT(*) as total FROM properties`);
    const byStatusResult = await db.execute(sql`SELECT status, COUNT(*) as count FROM properties GROUP BY status`);
    const byTypeResult = await db.execute(sql`SELECT propertyType, COUNT(*) as count FROM properties GROUP BY propertyType`);
    const valueResult = await db.execute(sql`SELECT SUM(currentValue) as totalValue, SUM(purchasePrice) as totalPurchasePrice FROM properties`);
    const mortgageResult = await db.execute(sql`SELECT SUM(mortgageBalance) as totalMortgage, COUNT(*) as count FROM properties WHERE hasMortgage = true`);
    
    return {
      totalProperties: Number((totalResult as any)[0]?.total) || 0,
      byStatus: byStatusResult as any[],
      byType: byTypeResult as any[],
      totalValue: Number((valueResult as any)[0]?.totalValue) || 0,
      totalPurchasePrice: Number((valueResult as any)[0]?.totalPurchasePrice) || 0,
      totalMortgage: Number((mortgageResult as any)[0]?.totalMortgage) || 0,
      propertiesWithMortgage: Number((mortgageResult as any)[0]?.count) || 0,
    };
  }),

  // List projects
  listProjects: protectedProcedure
    .input(z.object({
      propertyId: z.number().optional(),
      status: z.string().optional(),
      projectType: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const filters = input || {};
      const rows = await db.execute(
        sql`SELECT pp.*, p.propertyName, p.streetAddress, p.city 
            FROM property_projects pp 
            LEFT JOIN properties p ON pp.propertyId = p.id 
            WHERE 1=1
            ${filters.propertyId ? sql`AND pp.propertyId = ${filters.propertyId}` : sql``}
            ${filters.status ? sql`AND pp.status = ${filters.status}` : sql``}
            ${filters.projectType ? sql`AND pp.projectType = ${filters.projectType}` : sql``}
            ORDER BY pp.createdAt DESC 
            LIMIT ${filters.limit} OFFSET ${filters.offset}`
      );
      return rows as any[];
    }),

  // Create project
  createProject: protectedProcedure
    .input(z.object({
      propertyId: z.number(),
      projectName: z.string().min(1),
      projectType: z.string(),
      description: z.string().optional(),
      status: z.string().default("planning"),
      priority: z.string().default("medium"),
      estimatedBudget: z.number().optional(),
      actualCost: z.number().optional(),
      startDate: z.string().optional(),
      targetCompletionDate: z.string().optional(),
      actualCompletionDate: z.string().optional(),
      assignedVendorId: z.number().optional(),
      projectManagerId: z.number().optional(),
      permitRequired: z.boolean().default(false),
      permitNumber: z.string().optional(),
      permitStatus: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.execute(sql`
        INSERT INTO property_projects (propertyId, projectName, projectType, description, status, priority, estimatedBudget, actualCost, startDate, targetCompletionDate, actualCompletionDate, assignedVendorId, projectManagerId, permitRequired, permitNumber, permitStatus, notes)
        VALUES (${input.propertyId}, ${input.projectName}, ${input.projectType}, ${input.description || null}, ${input.status}, ${input.priority}, ${input.estimatedBudget || null}, ${input.actualCost || null}, ${input.startDate ? new Date(input.startDate) : null}, ${input.targetCompletionDate ? new Date(input.targetCompletionDate) : null}, ${input.actualCompletionDate ? new Date(input.actualCompletionDate) : null}, ${input.assignedVendorId || null}, ${input.projectManagerId || null}, ${input.permitRequired}, ${input.permitNumber || null}, ${input.permitStatus || null}, ${input.notes || null})
      `);
      return { id: (result as any).insertId, projectName: input.projectName, success: true };
    }),

  // Update project
  updateProject: protectedProcedure
    .input(z.object({
      id: z.number(),
      projectName: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      estimatedBudget: z.number().optional(),
      actualCost: z.number().optional(),
      startDate: z.string().optional(),
      targetCompletionDate: z.string().optional(),
      actualCompletionDate: z.string().optional(),
      description: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...updates } = input;
      await db.execute(sql`UPDATE property_projects SET updatedAt = NOW() WHERE id = ${id}`);
      
      if (updates.projectName !== undefined) await db.execute(sql`UPDATE property_projects SET projectName = ${updates.projectName} WHERE id = ${id}`);
      if (updates.status !== undefined) await db.execute(sql`UPDATE property_projects SET status = ${updates.status} WHERE id = ${id}`);
      if (updates.priority !== undefined) await db.execute(sql`UPDATE property_projects SET priority = ${updates.priority} WHERE id = ${id}`);
      if (updates.estimatedBudget !== undefined) await db.execute(sql`UPDATE property_projects SET estimatedBudget = ${updates.estimatedBudget} WHERE id = ${id}`);
      if (updates.actualCost !== undefined) await db.execute(sql`UPDATE property_projects SET actualCost = ${updates.actualCost} WHERE id = ${id}`);
      if (updates.description !== undefined) await db.execute(sql`UPDATE property_projects SET description = ${updates.description} WHERE id = ${id}`);
      if (updates.notes !== undefined) await db.execute(sql`UPDATE property_projects SET notes = ${updates.notes} WHERE id = ${id}`);
      
      return { success: true };
    }),

  // List vendors
  listVendors: protectedProcedure
    .input(z.object({
      vendorType: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const filters = input || {};
      const rows = await db.execute(
        sql`SELECT * FROM property_vendors 
            WHERE 1=1
            ${filters.vendorType ? sql`AND vendorType = ${filters.vendorType}` : sql``}
            ${filters.status ? sql`AND status = ${filters.status}` : sql``}
            ORDER BY vendorName ASC 
            LIMIT ${filters.limit} OFFSET ${filters.offset}`
      );
      return rows as any[];
    }),

  // Create vendor
  createVendor: protectedProcedure
    .input(z.object({
      vendorName: z.string().min(1),
      vendorType: z.string(),
      contactName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      licenseNumber: z.string().optional(),
      insuranceProvider: z.string().optional(),
      insurancePolicyNumber: z.string().optional(),
      insuranceExpiration: z.string().optional(),
      taxId: z.string().optional(),
      paymentTerms: z.string().optional(),
      preferredPaymentMethod: z.string().optional(),
      rating: z.number().optional(),
      status: z.string().default("active"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.execute(sql`
        INSERT INTO property_vendors (vendorName, vendorType, contactName, email, phone, address, city, state, zipCode, licenseNumber, insuranceProvider, insurancePolicyNumber, insuranceExpiration, taxId, paymentTerms, preferredPaymentMethod, rating, status, notes)
        VALUES (${input.vendorName}, ${input.vendorType}, ${input.contactName || null}, ${input.email || null}, ${input.phone || null}, ${input.address || null}, ${input.city || null}, ${input.state || null}, ${input.zipCode || null}, ${input.licenseNumber || null}, ${input.insuranceProvider || null}, ${input.insurancePolicyNumber || null}, ${input.insuranceExpiration ? new Date(input.insuranceExpiration) : null}, ${input.taxId || null}, ${input.paymentTerms || null}, ${input.preferredPaymentMethod || null}, ${input.rating || null}, ${input.status}, ${input.notes || null})
      `);
      return { id: (result as any).insertId, vendorName: input.vendorName, success: true };
    }),

  // List maintenance logs
  listMaintenanceLogs: protectedProcedure
    .input(z.object({
      propertyId: z.number().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const filters = input || {};
      const rows = await db.execute(
        sql`SELECT m.*, p.propertyName, p.streetAddress 
            FROM property_maintenance_logs m 
            LEFT JOIN properties p ON m.propertyId = p.id 
            WHERE 1=1
            ${filters.propertyId ? sql`AND m.propertyId = ${filters.propertyId}` : sql``}
            ${filters.status ? sql`AND m.status = ${filters.status}` : sql``}
            ${filters.priority ? sql`AND m.priority = ${filters.priority}` : sql``}
            ORDER BY m.reportedDate DESC 
            LIMIT ${filters.limit} OFFSET ${filters.offset}`
      );
      return rows as any[];
    }),

  // Create maintenance log
  createMaintenanceLog: protectedProcedure
    .input(z.object({
      propertyId: z.number(),
      issueTitle: z.string().min(1),
      issueDescription: z.string().optional(),
      category: z.string(),
      priority: z.string().default("medium"),
      status: z.string().default("reported"),
      reportedBy: z.string().optional(),
      reportedDate: z.string().optional(),
      assignedVendorId: z.number().optional(),
      estimatedCost: z.number().optional(),
      actualCost: z.number().optional(),
      scheduledDate: z.string().optional(),
      completedDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.execute(sql`
        INSERT INTO property_maintenance_logs (propertyId, issueTitle, issueDescription, category, priority, status, reportedBy, reportedDate, assignedVendorId, estimatedCost, actualCost, scheduledDate, completedDate, notes)
        VALUES (${input.propertyId}, ${input.issueTitle}, ${input.issueDescription || null}, ${input.category}, ${input.priority}, ${input.status}, ${input.reportedBy || null}, ${input.reportedDate ? new Date(input.reportedDate) : new Date()}, ${input.assignedVendorId || null}, ${input.estimatedCost || null}, ${input.actualCost || null}, ${input.scheduledDate ? new Date(input.scheduledDate) : null}, ${input.completedDate ? new Date(input.completedDate) : null}, ${input.notes || null})
      `);
      return { id: (result as any).insertId, success: true };
    }),

  // List tenants
  listTenants: protectedProcedure
    .input(z.object({
      propertyId: z.number().optional(),
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const filters = input || {};
      const rows = await db.execute(
        sql`SELECT t.*, p.propertyName, p.streetAddress 
            FROM property_tenants t 
            LEFT JOIN properties p ON t.propertyId = p.id 
            WHERE 1=1
            ${filters.propertyId ? sql`AND t.propertyId = ${filters.propertyId}` : sql``}
            ${filters.status ? sql`AND t.status = ${filters.status}` : sql``}
            ORDER BY t.createdAt DESC 
            LIMIT ${filters.limit} OFFSET ${filters.offset}`
      );
      return rows as any[];
    }),

  // Create tenant
  createTenant: protectedProcedure
    .input(z.object({
      propertyId: z.number(),
      tenantName: z.string().min(1),
      email: z.string().optional(),
      phone: z.string().optional(),
      leaseStartDate: z.string(),
      leaseEndDate: z.string(),
      monthlyRent: z.number(),
      securityDeposit: z.number().optional(),
      paymentDueDay: z.number().default(1),
      status: z.string().default("active"),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.execute(sql`
        INSERT INTO property_tenants (propertyId, tenantName, email, phone, leaseStartDate, leaseEndDate, monthlyRent, securityDeposit, paymentDueDay, status, emergencyContactName, emergencyContactPhone, notes)
        VALUES (${input.propertyId}, ${input.tenantName}, ${input.email || null}, ${input.phone || null}, ${new Date(input.leaseStartDate)}, ${new Date(input.leaseEndDate)}, ${input.monthlyRent}, ${input.securityDeposit || null}, ${input.paymentDueDay}, ${input.status}, ${input.emergencyContactName || null}, ${input.emergencyContactPhone || null}, ${input.notes || null})
      `);
      return { id: (result as any).insertId, success: true };
    }),

  // Record rent payment
  recordRentPayment: protectedProcedure
    .input(z.object({
      tenantId: z.number(),
      propertyId: z.number(),
      amount: z.number(),
      paymentDate: z.string(),
      paymentMethod: z.string(),
      periodStart: z.string(),
      periodEnd: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.execute(sql`
        INSERT INTO property_rent_payments (tenantId, propertyId, amount, paymentDate, paymentMethod, periodStart, periodEnd, status, notes)
        VALUES (${input.tenantId}, ${input.propertyId}, ${input.amount}, ${new Date(input.paymentDate)}, ${input.paymentMethod}, ${new Date(input.periodStart)}, ${new Date(input.periodEnd)}, 'completed', ${input.notes || null})
      `);
      return { id: (result as any).insertId, success: true };
    }),

  // List utilities
  listUtilities: protectedProcedure
    .input(z.object({
      propertyId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const filters = input || {};
      const rows = await db.execute(
        sql`SELECT u.*, p.propertyName 
            FROM property_utilities u 
            LEFT JOIN properties p ON u.propertyId = p.id 
            WHERE 1=1
            ${filters.propertyId ? sql`AND u.propertyId = ${filters.propertyId}` : sql``}
            ${filters.status ? sql`AND u.status = ${filters.status}` : sql``}
            ORDER BY u.utilityType ASC`
      );
      return rows as any[];
    }),

  // Record financial entry
  recordFinancialEntry: protectedProcedure
    .input(z.object({
      propertyId: z.number(),
      year: z.number(),
      month: z.number(),
      rentalIncome: z.number().optional(),
      otherIncome: z.number().optional(),
      mortgagePayment: z.number().optional(),
      propertyTax: z.number().optional(),
      insurance: z.number().optional(),
      utilities: z.number().optional(),
      maintenance: z.number().optional(),
      managementFees: z.number().optional(),
      hoaFees: z.number().optional(),
      otherExpenses: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Check if entry exists
      const existing = await db.execute(sql`SELECT id FROM property_financials WHERE propertyId = ${input.propertyId} AND year = ${input.year} AND month = ${input.month}`);
      
      if ((existing as any[]).length > 0) {
        // Update existing
        await db.execute(sql`
          UPDATE property_financials SET 
            rentalIncome = ${input.rentalIncome || 0},
            otherIncome = ${input.otherIncome || 0},
            mortgagePayment = ${input.mortgagePayment || 0},
            propertyTax = ${input.propertyTax || 0},
            insurance = ${input.insurance || 0},
            utilities = ${input.utilities || 0},
            maintenance = ${input.maintenance || 0},
            managementFees = ${input.managementFees || 0},
            hoaFees = ${input.hoaFees || 0},
            otherExpenses = ${input.otherExpenses || 0},
            notes = ${input.notes || null},
            updatedAt = NOW()
          WHERE propertyId = ${input.propertyId} AND year = ${input.year} AND month = ${input.month}
        `);
        return { success: true, updated: true };
      } else {
        // Insert new
        const result = await db.execute(sql`
          INSERT INTO property_financials (propertyId, year, month, rentalIncome, otherIncome, mortgagePayment, propertyTax, insurance, utilities, maintenance, managementFees, hoaFees, otherExpenses, notes)
          VALUES (${input.propertyId}, ${input.year}, ${input.month}, ${input.rentalIncome || 0}, ${input.otherIncome || 0}, ${input.mortgagePayment || 0}, ${input.propertyTax || 0}, ${input.insurance || 0}, ${input.utilities || 0}, ${input.maintenance || 0}, ${input.managementFees || 0}, ${input.hoaFees || 0}, ${input.otherExpenses || 0}, ${input.notes || null})
        `);
        return { id: (result as any).insertId, success: true };
      }
    }),

  // Get financial summary
  getFinancialSummary: protectedProcedure
    .input(z.object({
      propertyId: z.number().optional(),
      year: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const filters = input || {};
      const currentYear = filters.year || new Date().getFullYear();
      
      const rows = await db.execute(
        sql`SELECT 
              SUM(rentalIncome) as totalRentalIncome,
              SUM(otherIncome) as totalOtherIncome,
              SUM(mortgagePayment) as totalMortgage,
              SUM(propertyTax) as totalPropertyTax,
              SUM(insurance) as totalInsurance,
              SUM(utilities) as totalUtilities,
              SUM(maintenance) as totalMaintenance,
              SUM(managementFees) as totalManagementFees,
              SUM(hoaFees) as totalHoaFees,
              SUM(otherExpenses) as totalOtherExpenses
            FROM property_financials 
            WHERE year = ${currentYear}
            ${filters.propertyId ? sql`AND propertyId = ${filters.propertyId}` : sql``}`
      );
      
      const summary = (rows as any[])[0] || {};
      const totalIncome = Number(summary.totalRentalIncome || 0) + Number(summary.totalOtherIncome || 0);
      const totalExpenses = Number(summary.totalMortgage || 0) + Number(summary.totalPropertyTax || 0) + 
        Number(summary.totalInsurance || 0) + Number(summary.totalUtilities || 0) + 
        Number(summary.totalMaintenance || 0) + Number(summary.totalManagementFees || 0) + 
        Number(summary.totalHoaFees || 0) + Number(summary.totalOtherExpenses || 0);
      
      return {
        year: currentYear,
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        breakdown: {
          rentalIncome: Number(summary.totalRentalIncome || 0),
          otherIncome: Number(summary.totalOtherIncome || 0),
          mortgage: Number(summary.totalMortgage || 0),
          propertyTax: Number(summary.totalPropertyTax || 0),
          insurance: Number(summary.totalInsurance || 0),
          utilities: Number(summary.totalUtilities || 0),
          maintenance: Number(summary.totalMaintenance || 0),
          managementFees: Number(summary.totalManagementFees || 0),
          hoaFees: Number(summary.totalHoaFees || 0),
          otherExpenses: Number(summary.totalOtherExpenses || 0),
        },
      };
    }),
});
