import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";

export const hybridServicesRouter = router({
  // ============================================
  // SERVICE DEPARTMENTS
  // ============================================
  
  getDepartments: publicProcedure
    .input(z.object({
      serviceType: z.enum(['central', 'licensable', 'all']).default('all'),
      category: z.enum(['compliance', 'creative', 'operational', 'educational', 'health', 'all']).default('all'),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `SELECT * FROM service_departments WHERE is_active = TRUE`;
      const params: any[] = [];
      
      if (input?.serviceType && input.serviceType !== 'all') {
        query += ` AND service_type = ?`;
        params.push(input.serviceType);
      }
      if (input?.category && input.category !== 'all') {
        query += ` AND category = ?`;
        params.push(input.category);
      }
      
      query += ` ORDER BY display_order ASC`;
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  getCentralServices: publicProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(
      `SELECT * FROM service_departments WHERE service_type = 'central' AND is_active = TRUE ORDER BY display_order ASC`
    );
    return rows as any[];
  }),

  getLicensableServices: publicProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(
      `SELECT * FROM service_departments WHERE service_type = 'licensable' AND is_active = TRUE ORDER BY display_order ASC`
    );
    return rows as any[];
  }),

  getDepartmentById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(
        `SELECT * FROM service_departments WHERE id = ?`,
        [input.id]
      );
      return (rows as any[])[0] || null;
    }),

  // ============================================
  // HOUSE SERVICE LICENSING
  // ============================================

  getHouseLicenses: protectedProcedure
    .input(z.object({
      houseId: z.number().optional(),
      status: z.enum(['pending', 'active', 'suspended', 'terminated', 'all']).default('all'),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `
        SELECT hsl.*, sd.department_name, sd.department_code, sd.licensing_fee_monthly, 
               sd.licensing_fee_annual, sd.revenue_split_laws, sd.revenue_split_house, sd.revenue_split_trust
        FROM house_service_licenses hsl
        JOIN service_departments sd ON hsl.department_id = sd.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input.houseId) {
        query += ` AND hsl.house_id = ?`;
        params.push(input.houseId);
      }
      if (input.status !== 'all') {
        query += ` AND hsl.license_status = ?`;
        params.push(input.status);
      }
      
      query += ` ORDER BY hsl.created_at DESC`;
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  requestLicense: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      departmentId: z.number(),
      billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = Date.now();
      
      // Check if department is licensable
      const [deptRows] = await db.execute(
        `SELECT * FROM service_departments WHERE id = ? AND service_type = 'licensable'`,
        [input.departmentId]
      );
      
      if ((deptRows as any[]).length === 0) {
        throw new Error("This service is not available for licensing");
      }
      
      // Check for existing license
      const [existingRows] = await db.execute(
        `SELECT * FROM house_service_licenses WHERE house_id = ? AND department_id = ?`,
        [input.houseId, input.departmentId]
      );
      
      if ((existingRows as any[]).length > 0) {
        throw new Error("A license request already exists for this service");
      }
      
      await db.execute(
        `INSERT INTO house_service_licenses 
         (house_id, department_id, license_status, billing_cycle, notes, created_at, updated_at)
         VALUES (?, ?, 'pending', ?, ?, ?, ?)`,
        [input.houseId, input.departmentId, input.billingCycle, input.notes || null, now, now]
      );
      
      return { success: true, message: "License request submitted for approval" };
    }),

  approveLicense: protectedProcedure
    .input(z.object({
      licenseId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = Date.now();
      
      // Get license details
      const [licenseRows] = await db.execute(
        `SELECT hsl.*, sd.licensing_fee_monthly, sd.licensing_fee_annual
         FROM house_service_licenses hsl
         JOIN service_departments sd ON hsl.department_id = sd.id
         WHERE hsl.id = ?`,
        [input.licenseId]
      );
      
      if ((licenseRows as any[]).length === 0) {
        throw new Error("License not found");
      }
      
      const license = (licenseRows as any[])[0];
      
      // Calculate next payment date based on billing cycle
      const nextPaymentDate = license.billing_cycle === 'annual' 
        ? now + (365 * 24 * 60 * 60 * 1000)
        : now + (30 * 24 * 60 * 60 * 1000);
      
      await db.execute(
        `UPDATE house_service_licenses 
         SET license_status = 'active', 
             license_start_date = ?,
             last_payment_date = ?,
             next_payment_date = ?,
             approved_by = ?,
             approved_at = ?,
             updated_at = ?
         WHERE id = ?`,
        [now, now, nextPaymentDate, ctx.user.id, now, now, input.licenseId]
      );
      
      return { success: true, message: "License approved and activated" };
    }),

  suspendLicense: protectedProcedure
    .input(z.object({
      licenseId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = Date.now();
      
      await db.execute(
        `UPDATE house_service_licenses 
         SET license_status = 'suspended', notes = CONCAT(COALESCE(notes, ''), '\nSuspended: ', ?), updated_at = ?
         WHERE id = ?`,
        [input.reason || 'No reason provided', now, input.licenseId]
      );
      
      return { success: true };
    }),

  // ============================================
  // SERVICE UTILIZATION TRACKING
  // ============================================

  logUtilization: protectedProcedure
    .input(z.object({
      departmentId: z.number(),
      providerType: z.enum(['laws_central', 'house_licensed']),
      providerHouseId: z.number().optional(),
      clientType: z.enum(['internal_house', 'internal_business', 'external']),
      clientHouseId: z.number().optional(),
      clientBusinessId: z.number().optional(),
      clientExternalId: z.number().optional(),
      servicePackageId: z.number().optional(),
      invoiceId: z.number().optional(),
      description: z.string(),
      hoursLogged: z.number().default(0),
      unitsCompleted: z.number().default(1),
      unitType: z.string().default('task'),
      billableAmount: z.number(),
      serviceDate: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = Date.now();
      
      await db.execute(
        `INSERT INTO service_utilization_log 
         (department_id, provider_type, provider_house_id, client_type, client_house_id, 
          client_business_id, client_external_id, service_package_id, invoice_id, description,
          hours_logged, units_completed, unit_type, billable_amount, service_date, logged_by, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.departmentId, input.providerType, input.providerHouseId || null,
          input.clientType, input.clientHouseId || null, input.clientBusinessId || null,
          input.clientExternalId || null, input.servicePackageId || null, input.invoiceId || null,
          input.description, input.hoursLogged, input.unitsCompleted, input.unitType,
          input.billableAmount, input.serviceDate, ctx.user.id, input.notes || null, now
        ]
      );
      
      return { success: true };
    }),

  getUtilizationByPeriod: protectedProcedure
    .input(z.object({
      startDate: z.number(),
      endDate: z.number(),
      departmentId: z.number().optional(),
      providerType: z.enum(['laws_central', 'house_licensed', 'all']).default('all'),
      houseId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `
        SELECT sul.*, sd.department_name, sd.department_code
        FROM service_utilization_log sul
        JOIN service_departments sd ON sul.department_id = sd.id
        WHERE sul.service_date BETWEEN ? AND ?
      `;
      const params: any[] = [input.startDate, input.endDate];
      
      if (input.departmentId) {
        query += ` AND sul.department_id = ?`;
        params.push(input.departmentId);
      }
      if (input.providerType !== 'all') {
        query += ` AND sul.provider_type = ?`;
        params.push(input.providerType);
      }
      if (input.houseId) {
        query += ` AND (sul.provider_house_id = ? OR sul.client_house_id = ?)`;
        params.push(input.houseId, input.houseId);
      }
      
      query += ` ORDER BY sul.service_date DESC`;
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  getUtilizationSummary: protectedProcedure
    .input(z.object({
      startDate: z.number(),
      endDate: z.number(),
      groupBy: z.enum(['department', 'provider', 'client_type']).default('department'),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      let groupByField = 'sd.department_name';
      if (input.groupBy === 'provider') groupByField = 'sul.provider_type';
      if (input.groupBy === 'client_type') groupByField = 'sul.client_type';
      
      const [rows] = await db.execute(
        `SELECT ${groupByField} as group_key,
                COUNT(*) as total_entries,
                SUM(sul.hours_logged) as total_hours,
                SUM(sul.units_completed) as total_units,
                SUM(sul.billable_amount) as total_revenue
         FROM service_utilization_log sul
         JOIN service_departments sd ON sul.department_id = sd.id
         WHERE sul.service_date BETWEEN ? AND ?
         GROUP BY ${groupByField}
         ORDER BY total_revenue DESC`,
        [input.startDate, input.endDate]
      );
      
      return rows as any[];
    }),

  // ============================================
  // REVENUE ALLOCATION
  // ============================================

  calculateAllocation: protectedProcedure
    .input(z.object({
      sourceType: z.enum(['subscription', 'service_invoice', 'licensing_fee']),
      sourceId: z.number(),
      totalAmount: z.number(),
      periodStart: z.number(),
      periodEnd: z.number(),
      allocationMethod: z.enum(['fixed_split', 'utilization_weighted', 'custom']).default('utilization_weighted'),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = Date.now();
      
      // Get utilization for the period
      const [utilizationRows] = await db.execute(
        `SELECT department_id, SUM(hours_logged) as total_hours, SUM(billable_amount) as total_billed
         FROM service_utilization_log
         WHERE service_date BETWEEN ? AND ?
         GROUP BY department_id`,
        [input.periodStart, input.periodEnd]
      );
      
      const utilization = utilizationRows as any[];
      const totalHours = utilization.reduce((sum, u) => sum + parseFloat(u.total_hours || 0), 0);
      
      // Create allocation record
      const [result] = await db.execute(
        `INSERT INTO revenue_allocation_records 
         (allocation_period, source_type, source_id, total_amount, allocation_method, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [input.periodEnd, input.sourceType, input.sourceId, input.totalAmount, input.allocationMethod, now]
      );
      
      const allocationId = (result as any).insertId;
      const allocations: any[] = [];
      
      if (input.allocationMethod === 'utilization_weighted' && totalHours > 0) {
        // Weighted allocation based on utilization
        const businessPool = input.totalAmount * 0.60; // 60% to departments
        const trustAmount = input.totalAmount * 0.40; // 40% to trust
        
        // Allocate to trust first
        await db.execute(
          `INSERT INTO revenue_allocation_details 
           (allocation_id, recipient_type, amount, percentage, created_at)
           VALUES (?, 'trust', ?, 40.00, ?)`,
          [allocationId, trustAmount, now]
        );
        allocations.push({ recipient: 'trust', amount: trustAmount, percentage: 40 });
        
        // Allocate to departments based on utilization
        for (const dept of utilization) {
          const deptPercentage = (parseFloat(dept.total_hours) / totalHours) * 60;
          const deptAmount = (parseFloat(dept.total_hours) / totalHours) * businessPool;
          
          await db.execute(
            `INSERT INTO revenue_allocation_details 
             (allocation_id, recipient_type, department_id, amount, percentage, utilization_hours, created_at)
             VALUES (?, 'department', ?, ?, ?, ?, ?)`,
            [allocationId, dept.department_id, deptAmount, deptPercentage, dept.total_hours, now]
          );
          allocations.push({ 
            recipient: 'department', 
            departmentId: dept.department_id, 
            amount: deptAmount, 
            percentage: deptPercentage,
            hours: parseFloat(dept.total_hours)
          });
        }
      } else {
        // Fixed 60/40 split (no department breakdown)
        const lawsAmount = input.totalAmount * 0.60;
        const trustAmount = input.totalAmount * 0.40;
        
        await db.execute(
          `INSERT INTO revenue_allocation_details 
           (allocation_id, recipient_type, amount, percentage, created_at)
           VALUES (?, 'laws_collective', ?, 60.00, ?)`,
          [allocationId, lawsAmount, now]
        );
        await db.execute(
          `INSERT INTO revenue_allocation_details 
           (allocation_id, recipient_type, amount, percentage, created_at)
           VALUES (?, 'trust', ?, 40.00, ?)`,
          [allocationId, trustAmount, now]
        );
        
        allocations.push({ recipient: 'laws_collective', amount: lawsAmount, percentage: 60 });
        allocations.push({ recipient: 'trust', amount: trustAmount, percentage: 40 });
      }
      
      return { 
        success: true, 
        allocationId, 
        allocations,
        totalAmount: input.totalAmount,
        method: input.allocationMethod
      };
    }),

  getAllocationHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      sourceType: z.enum(['subscription', 'service_invoice', 'licensing_fee', 'all']).default('all'),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `
        SELECT rar.*, 
               (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                 'recipient_type', rad.recipient_type,
                 'department_id', rad.department_id,
                 'amount', rad.amount,
                 'percentage', rad.percentage,
                 'utilization_hours', rad.utilization_hours
               )) FROM revenue_allocation_details rad WHERE rad.allocation_id = rar.id) as details
        FROM revenue_allocation_records rar
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input.sourceType !== 'all') {
        query += ` AND rar.source_type = ?`;
        params.push(input.sourceType);
      }
      
      query += ` ORDER BY rar.created_at DESC LIMIT ?`;
      params.push(input.limit);
      
      const [rows] = await db.execute(query, params);
      return (rows as any[]).map(row => ({
        ...row,
        details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details
      }));
    }),

  // ============================================
  // DISCLAIMERS
  // ============================================

  getDisclaimers: publicProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(
      `SELECT * FROM service_disclaimers WHERE is_active = TRUE`
    );
    return rows as any[];
  }),

  getDisclaimerByType: publicProcedure
    .input(z.object({ type: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(
        `SELECT * FROM service_disclaimers WHERE disclaimer_type = ? AND is_active = TRUE`,
        [input.type]
      );
      return (rows as any[])[0] || null;
    }),

  acknowledgeDisclaimer: protectedProcedure
    .input(z.object({
      disclaimerId: z.number(),
      serviceType: z.string().optional(),
      invoiceId: z.number().optional(),
      documentId: z.number().optional(),
      electronicSignature: z.string(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const now = Date.now();
      
      await db.execute(
        `INSERT INTO disclaimer_acknowledgments 
         (disclaimer_id, user_id, service_type, invoice_id, document_id, acknowledged_at, 
          ip_address, user_agent, electronic_signature)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.disclaimerId, ctx.user.id, input.serviceType || null, input.invoiceId || null,
          input.documentId || null, now, input.ipAddress || null, input.userAgent || null,
          input.electronicSignature
        ]
      );
      
      return { success: true, acknowledgedAt: now };
    }),

  checkDisclaimerAcknowledgment: protectedProcedure
    .input(z.object({
      disclaimerType: z.string(),
      serviceType: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      
      // Get disclaimer
      const [disclaimerRows] = await db.execute(
        `SELECT id FROM service_disclaimers WHERE disclaimer_type = ?`,
        [input.disclaimerType]
      );
      
      if ((disclaimerRows as any[]).length === 0) {
        return { acknowledged: true, required: false };
      }
      
      const disclaimerId = (disclaimerRows as any[])[0].id;
      
      // Check for recent acknowledgment (within 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      const [ackRows] = await db.execute(
        `SELECT * FROM disclaimer_acknowledgments 
         WHERE disclaimer_id = ? AND user_id = ? AND acknowledged_at > ?
         ORDER BY acknowledged_at DESC LIMIT 1`,
        [disclaimerId, ctx.user.id, thirtyDaysAgo]
      );
      
      return {
        acknowledged: (ackRows as any[]).length > 0,
        required: true,
        disclaimerId,
        lastAcknowledged: (ackRows as any[])[0]?.acknowledged_at || null
      };
    }),

  // ============================================
  // DEPARTMENT REVENUE LEDGER
  // ============================================

  getDepartmentLedger: protectedProcedure
    .input(z.object({
      departmentId: z.number().optional(),
      houseId: z.number().optional(),
      status: z.enum(['open', 'closed', 'reconciled', 'all']).default('all'),
      limit: z.number().default(12),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      let query = `
        SELECT drl.*, sd.department_name, sd.department_code
        FROM department_revenue_ledger drl
        JOIN service_departments sd ON drl.department_id = sd.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (input.departmentId) {
        query += ` AND drl.department_id = ?`;
        params.push(input.departmentId);
      }
      if (input.houseId) {
        query += ` AND drl.house_id = ?`;
        params.push(input.houseId);
      }
      if (input.status !== 'all') {
        query += ` AND drl.status = ?`;
        params.push(input.status);
      }
      
      query += ` ORDER BY drl.period_end DESC LIMIT ?`;
      params.push(input.limit);
      
      const [rows] = await db.execute(query, params);
      return rows as any[];
    }),

  getRevenueStats: protectedProcedure
    .input(z.object({
      startDate: z.number(),
      endDate: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      
      // Total revenue by service type
      const [byServiceType] = await db.execute(
        `SELECT sd.service_type, SUM(sul.billable_amount) as total
         FROM service_utilization_log sul
         JOIN service_departments sd ON sul.department_id = sd.id
         WHERE sul.service_date BETWEEN ? AND ?
         GROUP BY sd.service_type`,
        [input.startDate, input.endDate]
      );
      
      // Total revenue by department
      const [byDepartment] = await db.execute(
        `SELECT sd.department_name, sd.department_code, SUM(sul.billable_amount) as total, SUM(sul.hours_logged) as hours
         FROM service_utilization_log sul
         JOIN service_departments sd ON sul.department_id = sd.id
         WHERE sul.service_date BETWEEN ? AND ?
         GROUP BY sd.id
         ORDER BY total DESC`,
        [input.startDate, input.endDate]
      );
      
      // Total revenue by client type
      const [byClientType] = await db.execute(
        `SELECT client_type, SUM(billable_amount) as total
         FROM service_utilization_log
         WHERE service_date BETWEEN ? AND ?
         GROUP BY client_type`,
        [input.startDate, input.endDate]
      );
      
      // Total licensing fees collected
      const [licensingFees] = await db.execute(
        `SELECT SUM(total_fees_paid) as total FROM house_service_licenses WHERE license_status = 'active'`
      );
      
      return {
        byServiceType: byServiceType as any[],
        byDepartment: byDepartment as any[],
        byClientType: byClientType as any[],
        totalLicensingFees: (licensingFees as any[])[0]?.total || 0,
      };
    }),
});
